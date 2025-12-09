'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EditDossierPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form data
  const [dateNaissance, setDateNaissance] = useState('')
  const [groupeSanguin, setGroupeSanguin] = useState('')
  const [numeroSecu, setNumeroSecu] = useState('')
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [antecedentsMedicaux, setAntecedentsMedicaux] = useState('')
  const [antecedentsChirurgicaux, setAntecedentsChirurgicaux] = useState('')
  const [contactNom, setContactNom] = useState('')
  const [contactRelation, setContactRelation] = useState('')
  const [contactTelephone, setContactTelephone] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Charger le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setPhone(profile.phone || '')
    }

    // Charger les données patient
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', user.id)
      .single()

    if (patient) {
      setDateNaissance(patient.date_naissance || '')
      setGroupeSanguin(patient.groupe_sanguin || '')
      setNumeroSecu(patient.numero_secu || '')
      setAllergies(patient.allergies?.join(', ') || '')
    }

    // Charger le dossier médical
    const { data: dossier } = await supabase
      .from('dossiers_medicaux')
      .select('*')
      .eq('patient_id', user.id)
      .single()

    if (dossier) {
      setAntecedentsMedicaux(dossier.antecedents_medicaux || '')
      setAntecedentsChirurgicaux(dossier.antecedents_chirurgicaux || '')
      
      if (dossier.contacts_urgence) {
        const contact = Object.values(dossier.contacts_urgence as Record<string, any>)[0] as any
        if (contact) {
          setContactNom(contact.nom || '')
          setContactRelation(contact.relation || '')
          setContactTelephone(contact.telephone || '')
        }
      }
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Non authentifié')

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Mettre à jour ou créer le patient
      const allergiesArray = allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)

      const { error: patientError } = await supabase
        .from('patients')
        .upsert({
          id: user.id,
          date_naissance: dateNaissance,
          groupe_sanguin: groupeSanguin || null,
          numero_secu: numeroSecu || null,
          allergies: allergiesArray.length > 0 ? allergiesArray : null,
        })

      if (patientError) throw patientError

      // Mettre à jour ou créer le dossier médical
      const contactsUrgence = contactNom ? {
        contact1: {
          nom: contactNom,
          relation: contactRelation,
          telephone: contactTelephone,
        }
      } : null

      const { error: dossierError } = await supabase
        .from('dossiers_medicaux')
        .upsert({
          patient_id: user.id,
          antecedents_medicaux: antecedentsMedicaux || null,
          antecedents_chirurgicaux: antecedentsChirurgicaux || null,
          contacts_urgence: contactsUrgence,
        })

      if (dossierError) throw dossierError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/dossier-medical')
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
          <h2 className="text-2xl font-bold text-green-600 mb-2">Enregistré !</h2>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/dossier-medical" className="text-2xl font-bold text-blue-600">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier mon dossier médical</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Informations Personnelles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe sanguin
                </label>
                <select
                  value={groupeSanguin}
                  onChange={(e) => setGroupeSanguin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de sécurité sociale
                </label>
                <input
                  type="text"
                  value={numeroSecu}
                  onChange={(e) => setNumeroSecu(e.target.value)}
                  placeholder="1234567890123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies (séparées par des virgules)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Pénicilline, Arachides, Pollen"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Antécédents */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Antécédents</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antécédents médicaux
                </label>
                <textarea
                  value={antecedentsMedicaux}
                  onChange={(e) => setAntecedentsMedicaux(e.target.value)}
                  rows={4}
                  placeholder="Diabète, hypertension, asthme..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antécédents chirurgicaux
                </label>
                <textarea
                  value={antecedentsChirurgicaux}
                  onChange={(e) => setAntecedentsChirurgicaux(e.target.value)}
                  rows={4}
                  placeholder="Appendicectomie (2015), fracture du bras (2018)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Contact d'Urgence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={contactNom}
                  onChange={(e) => setContactNom(e.target.value)}
                  placeholder="Marie Dupont"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="Épouse, Mère, Ami..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={contactTelephone}
                  onChange={(e) => setContactTelephone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <Link
              href="/dashboard/dossier-medical"
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
