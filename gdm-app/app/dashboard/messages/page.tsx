import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le profil (id correspond à auth.users.id)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    console.error('Profil non trouvé pour user:', user.id)
    redirect('/dashboard')
  }

  // Récupérer les conversations selon le rôle
  let conversations = []
  
  if (profile?.role === 'medecin') {
    // Pour le médecin: conversations avec ses patients
    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        patient_id,
        updated_at,
        patient:profiles!conversations_patient_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        messages(id, content, is_read, created_at, sender_id)
      `)
      .eq('medecin_id', profile.id)
      .order('updated_at', { ascending: false })
    
    conversations = data || []
  } else {
    // Pour le patient: conversations avec ses médecins
    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        medecin_id,
        updated_at,
        medecin:profiles!conversations_medecin_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        messages(id, content, is_read, created_at, sender_id)
      `)
      .eq('patient_id', profile.id)
      .order('updated_at', { ascending: false })
    
    conversations = data || []
  }

  // Compter les messages non lus pour chaque conversation
  const conversationsWithUnread = conversations.map(conv => {
    const unreadCount = conv.messages?.filter(
      (msg: any) => !msg.is_read && msg.sender_id !== profile.id
    ).length || 0
    
    const lastMessage = conv.messages?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    
    return { ...conv, unreadCount, lastMessage }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={profile?.role === 'medecin' ? '/dashboard/medecin' : '/dashboard'}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                💬 Messages
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {conversationsWithUnread.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucune conversation</h2>
            <p className="text-gray-600 mb-6">
              {profile?.role === 'medecin' 
                ? 'Vos patients pourront vous envoyer des messages ici.'
                : 'Contactez votre médecin pour démarrer une conversation.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des conversations */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <p className="text-sm text-blue-100">{conversationsWithUnread.length} conversation(s)</p>
              </div>
              <div className="divide-y divide-gray-100">
                {conversationsWithUnread.map((conv: any) => {
                  const contact = profile?.role === 'medecin' ? conv.patient : conv.medecin
                  const initials = `${contact?.first_name?.[0] || ''}${contact?.last_name?.[0] || ''}`
                  
                  return (
                    <Link
                      key={conv.id}
                      href={`/dashboard/messages/${conv.id}`}
                      className="flex items-center space-x-3 p-4 hover:bg-blue-50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        {contact?.avatar_url ? (
                          <img
                            src={contact.avatar_url}
                            alt={`${contact.first_name} ${contact.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {initials}
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {contact?.first_name} {contact?.last_name}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-400">
                            {new Date(conv.lastMessage.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Zone de message - sélectionner une conversation */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-12 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sélectionnez une conversation</h2>
              <p className="text-gray-600 text-center">
                Choisissez une conversation dans la liste pour voir les messages
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
