'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EnvoyerExamenModalProps {
  medecinId: string
  patientId: string
  conversationId: string
  onClose: () => void
  onSent: () => void
}

export default function EnvoyerExamenModal({
  medecinId,
  patientId,
  conversationId,
  onClose,
  onSent
}: EnvoyerExamenModalProps) {
  const [examens, setExamens] = useState<any[]>([])
  const [selectedExamen, setSelectedExamen] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadExamens()
  }, [])

  async function loadExamens() {
    const { data } = await supabase
      .from('examens')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_examen', { ascending: false })
      .limit(10)

    setExamens(data || [])
    setLoading(false)
  }

  async function handleSend() {
    if (!selectedExamen) return

    setSending(true)
    try {
      const examen = examens.find(e => e.id === selectedExamen)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: medecinId,
          content: `🔬 Résultat d'examen: ${examen.type_examen}`,
          type_message: 'examen',
          document_type: 'examen',
          document_id: examen.id,
          document_data: {
            type_examen: examen.type_examen,
            date_examen: examen.date_examen,
            resultat: examen.resultat
          }
        })

      if (!error) {
        onSent()
        onClose()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🔬 Envoyer un résultat d'examen</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement des examens...</p>
            </div>
          ) : examens.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔬</div>
              <p className="text-gray-600">Aucun examen disponible pour ce patient</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Sélectionnez l'examen à partager avec le patient :
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {examens.map((examen) => (
                  <label
                    key={examen.id}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedExamen === examen.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="examen"
                      value={examen.id}
                      checked={selectedExamen === examen.id}
                      onChange={(e) => setSelectedExamen(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">
                          {examen.type_examen}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Date: {new Date(examen.date_examen).toLocaleDateString('fr-FR')}
                        </p>
                        
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-3">
                          {examen.resultat}
                        </p>
                      </div>
                      
                      {selectedExamen === examen.id && (
                        <div className="text-green-600 text-2xl ml-4">✓</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {examens.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedExamen || sending}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
