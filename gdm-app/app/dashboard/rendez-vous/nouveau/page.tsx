'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Disponibilite {
  id: string
  jour_semaine: number
  heure_debut: string
  heure_fin: string
  duree_consultation: number
}

export default function NouveauRendezVousPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [medecins, setMedecins] = useState<any[]>([])
  const [medecinId, setMedecinId] = useState('')
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([])
  const [creneauxDisponibles, setCreneauxDisponibles] = useState<string[]>([])

  useEffect(() => {
    loadMedecins()
  }, [])

  useEffect(() => {
    if (medecinId) {
      loadDisponibilites()
      setDate('')
      setHeure('')
    }
  }, [medecinId])

  useEffect(() => {
    if (date && disponibilites.length > 0) {
      generateCreneaux()
    }
  }, [date, disponibilites])

  async function loadMedecins() {
    const { data } = await supabase
      .from('medecins')
      .select(`
        id,
        user_id,
        specialite,
        adresse_cabinet,
        ville,
        profiles!medecins_user_id_fkey(first_name, last_name)
      `)

    // Transformer les données pour avoir la structure attendue
    const formattedData = data?.map(medecin => ({
      ...medecin,
      profile: medecin.profiles
    }))

    setMedecins(formattedData || [])
    setLoading(false)
  }

  async function loadDisponibilites() {
    const { data } = await supabase
      .from('disponibilites')
      .select('*')
      .eq('medecin_id', medecinId)
      .order('jour_semaine')

    setDisponibilites(data || [])
  }

  function generateCreneaux() {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay() // 0 = dimanche, 1 = lundi, etc.
    
    // Trouver les disponibilités pour ce jour
    const dispoJour = disponibilites.filter(d => d.jour_semaine === dayOfWeek)
    
    if (dispoJour.length === 0) {
      setCreneauxDisponibles([])
      return
    }

    const creneaux: string[] = []
    
    dispoJour.forEach(dispo => {
      const [heureDebut, minDebut] = dispo.heure_debut.split(':').map(Number)
      const [heureFin, minFin] = dispo.heure_fin.split(':').map(Number)
      
      let currentHeure = heureDebut
      let currentMin = minDebut
      
      while (
        currentHeure < heureFin || 
        (currentHeure === heureFin && currentMin < minFin)
      ) {
        const heureStr = currentHeure.toString().padStart(2, '0')
        const minStr = currentMin.toString().padStart(2, '0')
        creneaux.push(`${heureStr}:${minStr}`)
        
        // Ajouter la durée de consultation
        currentMin += dispo.duree_consultation
        if (currentMin >= 60) {
          currentHeure += 1
          currentMin -= 60
        }
      }
    })
    
    setCreneauxDisponibles(creneaux)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Non authentifié')

      const dateHeure = new Date(`${date}T${heure}`)

      const { error: rdvError } = await supabase
        .from('rendez_vous')
        .insert({
          patient_id: user.id,
          medecin_id: medecinId,
          date_heure: dateHeure.toISOString(),
          duree: 30,
          motif: motif || null,
          statut: 'en_attente',
        })

      if (rdvError) throw rdvError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/rendez-vous')
      }, 1500)

    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Demande envoyée !</h2>
          <p className="text-gray-600">Votre rendez-vous est en attente de confirmation</p>
        </div>
      </div>
    )
  }

  // Date minimale : demain
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/rendez-vous" className="text-2xl font-bold text-blue-600">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prendre un rendez-vous</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Choix du médecin</h2>
            
            {medecins.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Aucun médecin disponible pour le moment. Veuillez réessayer plus tard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {medecins.map((medecin) => (
                  <label
                    key={medecin.id}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      medecinId === medecin.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="medecin"
                      value={medecin.id}
                      checked={medecinId === medecin.id}
                      onChange={(e) => setMedecinId(e.target.value)}
                      required
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">
                          Dr. {medecin.profile.first_name} {medecin.profile.last_name}
                        </p>
                        <p className="text-blue-600">{medecin.specialite}</p>
                        {medecin.ville && (
                          <p className="text-sm text-gray-600 mt-1">📍 {medecin.ville}</p>
                        )}
                      </div>
                      {medecinId === medecin.id && (
                        <div className="text-blue-600 text-2xl">✓</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Date et heure</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  required
                  disabled={!medecinId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {!medecinId && (
                  <p className="text-sm text-gray-500 mt-1">Sélectionnez d'abord un médecin</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure *
                </label>
                <select
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  required
                  disabled={!date || creneauxDisponibles.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Sélectionnez</option>
                  {creneauxDisponibles.map((creneau) => (
                    <option key={creneau} value={creneau}>
                      {creneau}
                    </option>
                  ))}
                </select>
                {date && creneauxDisponibles.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Aucune disponibilité pour ce jour
                  </p>
                )}
                {!date && medecinId && (
                  <p className="text-sm text-gray-500 mt-1">Sélectionnez d'abord une date</p>
                )}
              </div>
            </div>

            {medecinId && disponibilites.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">📅 Disponibilités du médecin :</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  {disponibilites.map((dispo) => {
                    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
                    return (
                      <div key={dispo.id}>
                        <strong>{jours[dispo.jour_semaine]}</strong>: {dispo.heure_debut} - {dispo.heure_fin}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Motif de consultation</h2>
            
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              placeholder="Décrivez brièvement le motif de votre consultation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || medecins.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Envoi...' : 'Demander le rendez-vous'}
            </button>
            <Link
              href="/dashboard/rendez-vous"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
