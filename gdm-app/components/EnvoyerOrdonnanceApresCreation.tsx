'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EnvoyerOrdonnanceApresCreationProps {
  ordonnanceId: string
  patientId: string
  medecinId: string
  onClose: () => void
  onSkip: () => void
}

export default function EnvoyerOrdonnanceApresCreation({
  ordonnanceId,
  patientId,
  medecinId,
  onClose,
  onSkip
}: EnvoyerOrdonnanceApresCreationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ordonnance, setOrdonnance] = useState<any>(null)
  const [conversation, setConversation] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Récupérer l'ordonnance
    const { data: ordonnanceData } = await supabase
      .from('ordonnances')
      .select(`
        *,
        patients:patient_id (
          id,
          user_id,
          profiles:user_id (first_name, last_name)
        )
      `)
      .eq('id', ordonnanceId)
      .single()

    setOrdonnance(ordonnanceData)

    // Chercher ou créer une conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${medecinId},user2_id.eq.${ordonnanceData?.patients?.user_id}),and(user1_id.eq.${ordonnanceData?.patients?.user_id},user2_id.eq.${medecinId})`)
      .single()

    if (existingConv) {
      setConversation(existingConv)
    } else {
      // Créer une nouvelle conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert([
          {
            user1_id: medecinId,
            user2_id: ordonnanceData?.patients?.user_id,
            dernier_message: 'Nouvelle ordonnance',
            date_dernier_message: new Date().toISOString()
          }
        ])
        .select()
        .single()

      setConversation(newConv)
    }
  }

  const handleEnvoyer = async () => {
    if (!ordonnance || !conversation) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Non authentifié')

      // Préparer les données du document
      const documentData = {
        diagnostic: ordonnance.diagnostic || 'Ordonnance médicale',
        medicaments: ordonnance.medicaments || [],
        date_prescription: ordonnance.date_prescription,
        instructions: ordonnance.instructions
      }

      // Insérer le message avec l'ordonnance
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversation.id,
            sender_id: user.id,
            contenu: '📋 Ordonnance prescrite',
            type_message: 'ordonnance',
            document_type: 'ordonnance',
            document_id: ordonnanceId,
            document_data: documentData
          }
        ])

      if (error) throw error

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          dernier_message: '📋 Ordonnance prescrite',
          date_dernier_message: new Date().toISOString()
        })
        .eq('id', conversation.id)

      alert('✅ Ordonnance envoyée avec succès au patient!')
      onClose()
      router.push('/dashboard/medecin')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!ordonnance) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ✅ Ordonnance créée avec succès!
            </h2>
            <p className="text-gray-600 mt-1">
              Voulez-vous l'envoyer immédiatement au patient?
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Informations patient */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Patient</p>
          <p className="text-lg font-semibold text-gray-900">
            {ordonnance.patients?.profiles?.first_name} {ordonnance.patients?.profiles?.last_name}
          </p>
        </div>

        {/* Aperçu de l'ordonnance */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">💊</span>
            Résumé de l'ordonnance
          </h3>
          
          {ordonnance.diagnostic && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Diagnostic</p>
              <p className="text-gray-900">{ordonnance.diagnostic}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Médicaments prescrits</p>
            <div className="space-y-2">
              {ordonnance.medicaments?.map((med: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded p-3">
                  <p className="font-medium text-gray-900">{med.nom}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} - {med.posologie}
                  </p>
                  {med.duree && (
                    <p className="text-xs text-gray-500">Durée: {med.duree}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {ordonnance.instructions && (
            <div>
              <p className="text-sm font-medium text-gray-700">Instructions</p>
              <p className="text-sm text-gray-600">{ordonnance.instructions}</p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={handleEnvoyer}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <span className="mr-2">📨</span>
                Envoyer au patient
              </>
            )}
          </button>
          <button
            onClick={onSkip}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Plus tard
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          💡 L'ordonnance sera envoyée dans votre conversation avec le patient
        </p>
      </div>
    </div>
  )
}
