import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrdonnancePDFButton from '@/components/OrdonnancePDFButton'

export default async function OrdonnanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Récupérer l'ordonnance avec toutes les infos
  const { data: ordonnance } = await supabase
    .from('ordonnances')
    .select(`
      *,
      patient:patients(
        date_naissance,
        profile:profiles(first_name, last_name)
      ),
      medecin:medecins(
        specialite,
        adresse_cabinet,
        ville,
        profile:profiles(first_name, last_name, phone)
      )
    `)
    .eq('id', id)
    .single()

  if (!ordonnance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ordonnance introuvable</h2>
          <Link href="/dashboard/ordonnances" className="text-blue-600 hover:underline">
            Retour aux ordonnances
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard/ordonnances"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour aux ordonnances
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* En-tête avec gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Ordonnance Médicale</h1>
                <p className="text-blue-100">
                  {new Date(ordonnance.date_prescription).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm font-medium">ID: {ordonnance.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8 space-y-8">
            {/* Informations médecin et patient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Prescripteur</h3>
                <p className="text-lg font-bold text-gray-900">
                  Dr. {ordonnance.medecin.profile.first_name} {ordonnance.medecin.profile.last_name}
                </p>
                <p className="text-blue-600">{ordonnance.medecin.specialite}</p>
                {ordonnance.medecin.adresse_cabinet && (
                  <p className="text-sm text-gray-600 mt-1">📍 {ordonnance.medecin.adresse_cabinet}</p>
                )}
                {ordonnance.medecin.ville && (
                  <p className="text-sm text-gray-600">{ordonnance.medecin.ville}</p>
                )}
                {ordonnance.medecin.profile.phone && (
                  <p className="text-sm text-gray-600">📞 {ordonnance.medecin.profile.phone}</p>
                )}
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Patient(e)</h3>
                <p className="text-lg font-bold text-gray-900">
                  {ordonnance.patient.profile.first_name} {ordonnance.patient.profile.last_name}
                </p>
                {ordonnance.patient.date_naissance && (
                  <p className="text-gray-600">
                    Né(e) le {new Date(ordonnance.patient.date_naissance).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {/* Diagnostic */}
            {ordonnance.diagnostic && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Diagnostic</h3>
                <p className="text-gray-800 leading-relaxed">{ordonnance.diagnostic}</p>
              </div>
            )}

            {/* Médicaments */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-3 py-1 mr-3">
                  Rx
                </span>
                Prescription
              </h3>
              
              <div className="space-y-4">
                {ordonnance.medicaments.map((med: any, index: number) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{med.nom}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Dosage:</span>
                            <p className="text-gray-900">{med.dosage}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Durée:</span>
                            <p className="text-gray-900">{med.duree}</p>
                          </div>
                        </div>
                        
                        {med.instructions && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">⚠️ Instructions:</span> {med.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {ordonnance.notes && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Notes complémentaires</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{ordonnance.notes}</p>
              </div>
            )}

            {/* Bouton télécharger PDF */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
              <OrdonnancePDFButton ordonnance={ordonnance} />
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ Cette ordonnance est valable pour une durée de 3 mois à compter de la date de prescription.
          </p>
        </div>
      </main>
    </div>
  )
}
