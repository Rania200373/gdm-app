'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

export default function RendezVousDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [rendezVous, setRendezVous] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadRendezVous()
  }, [])

  async function loadRendezVous() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)

      const { data } = await supabase
        .from('rendez_vous')
        .select(`
          *,
          patient:patients(
            profile:profiles(first_name, last_name, phone)
          ),
          medecin:medecins(
            specialite,
            adresse_cabinet,
            profile:profiles(first_name, last_name, phone)
          )
        `)
        .eq('id', id)
        .single()

      setRendezVous(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatut(newStatut: string) {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: newStatut })
        .eq('id', id)

      if (!error) {
        await loadRendezVous()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!rendezVous) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rendez-vous introuvable</h2>
          <Link href="/dashboard/rendez-vous" className="text-blue-600 hover:underline">
            Retour aux rendez-vous
          </Link>
        </div>
      </div>
    )
  }

  const dateRdv = new Date(rendezVous.date_heure)
  const isMedecin = currentUser?.role === 'medecin'
  const isPast = dateRdv < new Date()

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800 border-green-300'
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'annule': return 'bg-red-100 text-red-800 border-red-300'
      case 'termine': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatStatut = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'Confirmé'
      case 'en_attente': return 'En attente'
      case 'annule': return 'Annulé'
      case 'termine': return 'Terminé'
      default: return statut
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard/rendez-vous"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour aux rendez-vous
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header avec statut */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Détails du rendez-vous</h1>
                <p className="text-blue-100">
                  {dateRdv.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {' à '}
                  {dateRdv.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatutColor(rendezVous.statut)}`}>
                {formatStatut(rendezVous.statut)}
              </span>
            </div>
          </div>

          {/* Informations */}
          <div className="p-6 space-y-6">
            {/* Informations médecin */}
            {!isMedecin && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Médecin</h3>
                <p className="text-lg font-bold text-gray-900">
                  Dr. {rendezVous.medecin?.profile.first_name} {rendezVous.medecin?.profile.last_name}
                </p>
                <p className="text-blue-600">{rendezVous.medecin?.specialite}</p>
                {rendezVous.medecin?.adresse_cabinet && (
                  <p className="text-gray-600 mt-1">📍 {rendezVous.medecin.adresse_cabinet}</p>
                )}
                {rendezVous.medecin?.profile.phone && (
                  <p className="text-gray-600 mt-1">📞 {rendezVous.medecin.profile.phone}</p>
                )}
              </div>
            )}

            {/* Informations patient */}
            {isMedecin && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Patient</h3>
                <p className="text-lg font-bold text-gray-900">
                  {rendezVous.patient?.profile.first_name} {rendezVous.patient?.profile.last_name}
                </p>
                {rendezVous.patient?.profile.phone && (
                  <p className="text-gray-600 mt-1">📞 {rendezVous.patient.profile.phone}</p>
                )}
              </div>
            )}

            {/* Motif */}
            {rendezVous.motif && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Motif de consultation</h3>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{rendezVous.motif}</p>
              </div>
            )}

            {/* Durée */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Durée prévue</h3>
              <p className="text-gray-900">{rendezVous.duree} minutes</p>
            </div>

            {/* Notes (si terminé) */}
            {rendezVous.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes du médecin</h3>
                <p className="text-gray-900 bg-blue-50 p-4 rounded-lg">{rendezVous.notes}</p>
              </div>
            )}
          </div>

          {/* Actions médecin */}
          {isMedecin && !isPast && rendezVous.statut !== 'annule' && rendezVous.statut !== 'termine' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex gap-3">
                {rendezVous.statut === 'en_attente' && (
                  <button
                    onClick={() => updateStatut('confirme')}
                    disabled={updating}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    ✓ Confirmer
                  </button>
                )}
                {rendezVous.statut === 'confirme' && (
                  <button
                    onClick={() => updateStatut('termine')}
                    disabled={updating}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    ✓ Marquer comme terminé
                  </button>
                )}
                <button
                  onClick={() => updateStatut('annule')}
                  disabled={updating}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          )}

          {/* Action patient annulation */}
          {!isMedecin && !isPast && rendezVous.statut !== 'annule' && rendezVous.statut !== 'termine' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={() => updateStatut('annule')}
                disabled={updating}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                Annuler le rendez-vous
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
