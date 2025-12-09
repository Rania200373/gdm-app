'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EnvoyerOrdonnanceModalProps {
  medecinId: string
  patientId: string
  conversationId: string
  onClose: () => void
  onSent: () => void
}

export default function EnvoyerOrdonnanceModal({
  medecinId,
  patientId,
  conversationId,
  onClose,
  onSent
}: EnvoyerOrdonnanceModalProps) {
  const [ordonnances, setOrdonnances] = useState<any[]>([])
  const [selectedOrdonnance, setSelectedOrdonnance] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadOrdonnances()
  }, [])

  async function loadOrdonnances() {
    const { data } = await supabase
      .from('ordonnances')
      .select(`
        *,
        patient:patients(
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('medecin_id', medecinId)
      .eq('patient_id', patientId)
      .order('date_prescription', { ascending: false })
      .limit(10)

    setOrdonnances(data || [])
    setLoading(false)
  }

  async function handleSend() {
    if (!selectedOrdonnance) return

    setSending(true)
    try {
      const ordonnance = ordonnances.find(o => o.id === selectedOrdonnance)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: medecinId,
          content: `📋 Ordonnance du ${new Date(ordonnance.date_prescription).toLocaleDateString('fr-FR')}`,
          type_message: 'ordonnance',
          document_type: 'ordonnance',
          document_id: ordonnance.id,
          document_data: {
            date_prescription: ordonnance.date_prescription,
            medicaments: ordonnance.medicaments,
            diagnostic: ordonnance.diagnostic
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">📋 Envoyer une ordonnance</h2>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement des ordonnances...</p>
            </div>
          ) : ordonnances.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">Aucune ordonnance disponible pour ce patient</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Sélectionnez l'ordonnance à partager avec le patient :
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ordonnances.map((ord) => (
                  <label
                    key={ord.id}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOrdonnance === ord.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ordonnance"
                      value={ord.id}
                      checked={selectedOrdonnance === ord.id}
                      onChange={(e) => setSelectedOrdonnance(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">
                          Ordonnance du {new Date(ord.date_prescription).toLocaleDateString('fr-FR')}
                        </p>
                        
                        {ord.diagnostic && (
                          <p className="text-sm text-gray-600 mb-2">
                            Diagnostic: {ord.diagnostic}
                          </p>
                        )}
                        
                        <p className="text-sm text-blue-600">
                          {ord.medicaments?.length || 0} médicament(s) prescrit(s)
                        </p>
                        
                        {ord.medicaments && ord.medicaments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {ord.medicaments.slice(0, 3).map((med: any, idx: number) => (
                              <p key={idx} className="text-xs text-gray-500">
                                • {med.nom}
                              </p>
                            ))}
                            {ord.medicaments.length > 3 && (
                              <p className="text-xs text-gray-400">
                                ... et {ord.medicaments.length - 3} autre(s)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {selectedOrdonnance === ord.id && (
                        <div className="text-blue-600 text-2xl ml-4">✓</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {ordonnances.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedOrdonnance || sending}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
