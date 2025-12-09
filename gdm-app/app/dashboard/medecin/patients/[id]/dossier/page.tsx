import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PatientDossierPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'medecin') {
    redirect('/dashboard')
  }

  // Récupérer les informations du patient
  const { data: patient } = await supabase
    .from('patients')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('id', params.id)
    .single()

  if (!patient) {
    redirect('/dashboard/medecin/patients')
  }

  // Récupérer le dossier médical
  const { data: dossier } = await supabase
    .from('dossiers_medicaux')
    .select('*')
    .eq('patient_id', params.id)
    .single()

  // Récupérer les consultations
  const { data: consultations } = await supabase
    .from('consultations')
    .select(`
      *,
      medecins:medecin_id (
        user_id,
        specialite,
        profiles:user_id (nom, prenom)
      )
    `)
    .eq('patient_id', params.id)
    .order('date_consultation', { ascending: false })

  // Récupérer les ordonnances
  const { data: ordonnances } = await supabase
    .from('ordonnances')
    .select(`
      *,
      medecins:medecin_id (
        user_id,
        specialite,
        profiles:user_id (nom, prenom)
      )
    `)
    .eq('patient_id', params.id)
    .order('date_prescription', { ascending: false })

  const age = patient.date_naissance 
    ? Math.floor((new Date().getTime() - new Date(patient.date_naissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link href="/dashboard/medecin/patients" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Retour à la liste des patients
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.profiles?.nom} {patient.profiles?.prenom}
              </h1>
              <p className="text-gray-600 mt-2">
                {age ? `${age} ans` : ''} - Né(e) le {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/medecin/consultations/nouvelle?patient_id=${params.id}`}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                + Consultation
              </Link>
              <Link
                href={`/dashboard/medecin/ordonnances/nouvelle?patient_id=${params.id}`}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                + Ordonnance
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations générales */}
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{patient.profiles?.email}</p>
                </div>
                {patient.profiles?.telephone && (
                  <div>
                    <p className="text-gray-500">Téléphone</p>
                    <p className="font-medium">{patient.profiles.telephone}</p>
                  </div>
                )}
                {patient.profiles?.adresse && (
                  <div>
                    <p className="text-gray-500">Adresse</p>
                    <p className="font-medium">{patient.profiles.adresse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dossier médical */}
            {dossier && (
              <>
                {dossier.allergies && dossier.allergies.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Allergies</h2>
                    <ul className="list-disc list-inside space-y-1 text-red-800">
                      {dossier.allergies.map((allergie: string, index: number) => (
                        <li key={index}>{allergie}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dossier.antecedents_medicaux && dossier.antecedents_medicaux.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Antécédents médicaux</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {dossier.antecedents_medicaux.map((antecedent: string, index: number) => (
                        <li key={index}>{antecedent}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dossier.antecedents_chirurgicaux && dossier.antecedents_chirurgicaux.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Antécédents chirurgicaux</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {dossier.antecedents_chirurgicaux.map((antecedent: string, index: number) => (
                        <li key={index}>{antecedent}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Colonne droite - Historique */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultations */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6">Consultations</h2>
              {!consultations || consultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune consultation enregistrée</p>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation: any) => (
                    <div key={consultation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Dr. {consultation.medecins?.profiles?.nom} - {consultation.medecins?.specialite}
                          </p>
                        </div>
                      </div>
                      {consultation.motif && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Motif:</p>
                          <p className="text-sm text-gray-600">{consultation.motif}</p>
                        </div>
                      )}
                      {consultation.diagnostic && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Diagnostic:</p>
                          <p className="text-sm text-gray-600">{consultation.diagnostic}</p>
                        </div>
                      )}
                      {consultation.traitement && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Traitement:</p>
                          <p className="text-sm text-gray-600">{consultation.traitement}</p>
                        </div>
                      )}
                      {consultation.notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ordonnances */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6">Ordonnances</h2>
              {!ordonnances || ordonnances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune ordonnance enregistrée</p>
              ) : (
                <div className="space-y-4">
                  {ordonnances.map((ordonnance: any) => {
                    const isActive = ordonnance.date_fin ? new Date(ordonnance.date_fin) > new Date() : true
                    
                    return (
                      <div key={ordonnance.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">
                              {new Date(ordonnance.date_prescription).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Dr. {ordonnance.medecins?.profiles?.nom}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isActive ? 'Active' : 'Expirée'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {ordonnance.medicaments?.map((med: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded p-3">
                              <p className="font-medium text-sm">{med.nom}</p>
                              <p className="text-xs text-gray-600">{med.dosage}</p>
                              <p className="text-xs text-gray-600">{med.posologie}</p>
                            </div>
                          ))}
                        </div>
                        {ordonnance.instructions && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">{ordonnance.instructions}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
