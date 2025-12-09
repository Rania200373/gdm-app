'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NouvelleConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromUrl = searchParams.get('patient_id')
  
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [medecin, setMedecin] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    patient_id: patientIdFromUrl || '',
    date_consultation: new Date().toISOString().split('T')[0],
    motif: '',
    symptomes: '',
    diagnostic: '',
    traitement: '',
    notes: '',
    ordonnance: false
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      if (!medecin) {
        throw new Error('Médecin non trouvé')
      }

      const { error } = await supabase
        .from('consultations')
        .insert([
          {
            medecin_id: medecin.id,
            patient_id: formData.patient_id,
            date_consultation: formData.date_consultation,
            motif: formData.motif,
            symptomes: formData.symptomes,
            diagnostic: formData.diagnostic,
            traitement: formData.traitement,
            notes: formData.notes,
            ordonnance_prescrite: formData.ordonnance
          }
        ])

      if (error) throw error

      alert('Consultation créée avec succès!')
      
      if (formData.ordonnance) {
        // Rediriger vers la création d'ordonnance
        router.push(`/dashboard/medecin/ordonnances/nouvelle?patient_id=${formData.patient_id}`)
      } else {
        router.push('/dashboard/medecin')
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de la consultation: ' + error.message)
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
            Nouvelle Consultation
          </h1>
          <p className="text-gray-600 mt-2">
            Enregistrer une nouvelle consultation
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

          {/* Date de consultation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de consultation *
            </label>
            <input
              type="date"
              required
              value={formData.date_consultation}
              onChange={(e) => setFormData({ ...formData, date_consultation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de consultation *
            </label>
            <input
              type="text"
              required
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Ex: Douleurs abdominales"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Symptômes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptômes
            </label>
            <textarea
              value={formData.symptomes}
              onChange={(e) => setFormData({ ...formData, symptomes: e.target.value })}
              rows={3}
              placeholder="Décrire les symptômes observés..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic
            </label>
            <textarea
              value={formData.diagnostic}
              onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
              rows={3}
              placeholder="Diagnostic posé..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traitement proposé
            </label>
            <textarea
              value={formData.traitement}
              onChange={(e) => setFormData({ ...formData, traitement: e.target.value })}
              rows={3}
              placeholder="Traitement recommandé..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notes supplémentaires..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ordonnance */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ordonnance"
              checked={formData.ordonnance}
              onChange={(e) => setFormData({ ...formData, ordonnance: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ordonnance" className="ml-2 text-sm text-gray-700">
              Créer une ordonnance après l'enregistrement
            </label>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la consultation'}
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
    </div>
  )
}
