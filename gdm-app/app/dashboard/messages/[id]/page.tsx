'use client'

import { useEffect, useState, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MessageDocument from '@/components/MessageDocument'
import EnvoyerOrdonnanceModal from '@/components/EnvoyerOrdonnanceModal'
import EnvoyerExamenModal from '@/components/EnvoyerExamenModal'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
  type_message?: string
  document_type?: string
  document_id?: string
  document_data?: any
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  role: string
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false)
  const [showExamenModal, setShowExamenModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadConversation()
    
    // S'abonner aux nouveaux messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Récupérer le profil de l'utilisateur (id correspond à auth.users.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        console.error('Profil non trouvé')
        return
      }

      setCurrentUser(profile)

      // Récupérer la conversation
      const { data: conversationData } = await supabase
        .from('conversations')
        .select(`
          *,
          patient:profiles!conversations_patient_id_fkey(*),
          medecin:profiles!conversations_medecin_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single()

      if (conversationData) {
        setConversation(conversationData)
        // Déterminer l'autre utilisateur
        const other = conversationData.patient_id === profile.id 
          ? conversationData.medecin 
          : conversationData.patient
        setOtherUser(other)
      }

      // Récupérer les messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)
        
        // Marquer les messages comme lus
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', profile.id)
          .eq('is_read', false)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        })

      if (!error) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const initials = otherUser ? `${otherUser.first_name?.[0] || ''}${otherUser.last_name?.[0] || ''}` : '??'

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/messages"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour
            </Link>
            <div className="flex items-center space-x-3 flex-1">
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={`${otherUser.first_name} ${otherUser.last_name}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {otherUser?.first_name} {otherUser?.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {otherUser?.role === 'medecin' ? 'Médecin' : 'Patient'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser?.id
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <MessageDocument message={message} isCurrentUser={isCurrentUser} />
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de message */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          {/* Boutons médecin pour envoyer documents */}
          {currentUser?.role === 'medecin' && (
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setShowOrdonnanceModal(true)}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                <span>📋</span>
                <span>Envoyer ordonnance</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExamenModal(true)}
                className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                <span>🔬</span>
                <span>Envoyer examen</span>
              </button>
            </div>
          )}

          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showOrdonnanceModal && conversation && (
        <EnvoyerOrdonnanceModal
          medecinId={currentUser.id}
          patientId={conversation.patient_id}
          conversationId={conversationId}
          onClose={() => setShowOrdonnanceModal(false)}
          onSent={() => {
            loadConversation()
          }}
        />
      )}

      {showExamenModal && conversation && (
        <EnvoyerExamenModal
          medecinId={currentUser.id}
          patientId={conversation.patient_id}
          conversationId={conversationId}
          onClose={() => setShowExamenModal(false)}
          onSent={() => {
            loadConversation()
          }}
        />
      )}
    </div>
  )
}
