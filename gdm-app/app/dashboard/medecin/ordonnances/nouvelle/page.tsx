'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EnvoyerOrdonnanceApresCreation from '@/components/EnvoyerOrdonnanceApresCreation'

interface Medicament {
  nom: string
  dosage: string
  posologie: string
  duree: string
}

function NouvelleOrdonnanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromUrl = searchParams.get('patient_id')
  
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [medecin, setMedecin] = useState<any>(null)
  const [showEnvoyerModal, setShowEnvoyerModal] = useState(false)
  const [ordonnanceCreated, setOrdonnanceCreated] = useState<{id: string, patientId: string} | null>(null)
  
  const [formData, setFormData] = useState({
    patient_id: patientIdFromUrl || '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    instructions: '',
    validite_jours: 30
  })

  const [medicaments, setMedicaments] = useState<Medicament[]>([
    { nom: '', dosage: '', posologie: '', duree: '' }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Récupérer le médecin
    const { data: medecinData } = await supabase
      .from('medecins')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    setMedecin(medecinData)

    // Récupérer les patients du médecin
    const { data: rdvData } = await supabase
      .from('rendez_vous')
      .select(`
        patient_id,
        patients:patient_id (
          id,
          profiles:user_id (nom, prenom)
        )
      `)
      .eq('medecin_id', medecinData?.id)

    // Éliminer les doublons
    const uniquePatients = new Map()
    rdvData?.forEach((item: any) => {
      if (item.patients && !uniquePatients.has(item.patient_id)) {
        uniquePatients.set(item.patient_id, item.patients)
      }
    })
    setPatients(Array.from(uniquePatients.values()))
  }

  const addMedicament = () => {
    setMedicaments([...medicaments, { nom: '', dosage: '', posologie: '', duree: '' }])
  }

  const removeMedicament = (index: number) => {
    setMedicaments(medicaments.filter((_, i) => i !== index))
  }

  const updateMedicament = (index: number, field: keyof Medicament, value: string) => {
    const updated = [...medicaments]
    updated[index][field] = value
    setMedicaments(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      if (!medecin) {
        throw new Error('Médecin non trouvé')
      }

      // Filtrer les médicaments vides
      const validMedicaments = medicaments.filter(m => m.nom && m.dosage)
      
      if (validMedicaments.length === 0) {
        throw new Error('Veuillez ajouter au moins un médicament')
      }

      // Calculer la date de fin si non spécifiée
      let dateFin = formData.date_fin
      if (!dateFin) {
        const debut = new Date(formData.date_debut)
        debut.setDate(debut.getDate() + formData.validite_jours)
        dateFin = debut.toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from('ordonnances')
        .insert([
          {
            medecin_id: medecin.id,
            patient_id: formData.patient_id,
            date_prescription: new Date().toISOString().split('T')[0],
            date_debut: formData.date_debut,
            date_fin: dateFin,
            medicaments: validMedicaments,
            instructions: formData.instructions,
            statut: 'active'
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Récupérer l'user_id du médecin
      const { data: { user } } = await supabase.auth.getUser()
      
      // Afficher le modal d'envoi
      setOrdonnanceCreated({
        id: data.id,
        patientId: formData.patient_id
      })
      setShowEnvoyerModal(true)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de l\'ordonnance: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/medecin" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouvelle Ordonnance
          </h1>
          <p className="text-gray-600 mt-2">
            Rédiger une nouvelle ordonnance médicale
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 space-y-6">
          {/* Sélection du patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient: any) => (
                <option key={patient.id} value={patient.id}>
                  {patient.profiles?.nom} {patient.profiles?.prenom}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={formData.date_debut}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validité (jours)
              </label>
              <input
                type="number"
                value={formData.validite_jours}
                onChange={(e) => setFormData({ ...formData, validite_jours: parseInt(e.target.value) })}
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Médicaments */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Médicaments *
              </label>
              <button
                type="button"
                onClick={addMedicament}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Ajouter un médicament
              </button>
            </div>

            <div className="space-y-4">
              {medicaments.map((medicament, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {medicaments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicament(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nom du médicament *
                      </label>
                      <input
                        type="text"
                        required
                        value={medicament.nom}
                        onChange={(e) => updateMedicament(index, 'nom', e.target.value)}
                        placeholder="Ex: Paracétamol"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        required
                        value={medicament.dosage}
                        onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                        placeholder="Ex: 500mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={medicament.duree}
                        onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                        placeholder="Ex: 7 jours"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Posologie
                      </label>
                      <input
                        type="text"
                        value={medicament.posologie}
                        onChange={(e) => updateMedicament(index, 'posologie', e.target.value)}
                        placeholder="Ex: 1 comprimé 3 fois par jour après les repas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions générales
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              placeholder="Instructions supplémentaires pour le patient..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer l\'ordonnance'}
            </button>
            <Link
              href="/dashboard/medecin"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>

      {/* Modal d'envoi après création */}
      {showEnvoyerModal && ordonnanceCreated && medecin && (
        <EnvoyerOrdonnanceApresCreation
          ordonnanceId={ordonnanceCreated.id}
          patientId={ordonnanceCreated.patientId}
          medecinId={medecin.user_id}
          onClose={() => {
            setShowEnvoyerModal(false)
            router.push('/dashboard/medecin')
          }}
          onSkip={() => {
            setShowEnvoyerModal(false)
            router.push('/dashboard/medecin')
          }}
        />
      )}
    </div>
  )
}

export default function NouvelleOrdonnancePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Chargement...</div>}>
      <NouvelleOrdonnanceContent />
    </Suspense>
  )
}
