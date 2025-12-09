import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrdonnancesPage() {
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

  // Récupérer les ordonnances
  let ordonnances = []

  if (profile?.role === 'patient') {
    const { data } = await supabase
      .from('ordonnances')
      .select(`
        *,
        medecin:medecins(
          specialite,
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('patient_id', user.id)
      .order('date_prescription', { ascending: false })

    ordonnances = data || []
  } else if (profile?.role === 'medecin') {
    const { data } = await supabase
      .from('ordonnances')
      .select(`
        *,
        patient:patients(
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('medecin_id', user.id)
      .order('date_prescription', { ascending: false })

    ordonnances = data || []
  }

  // Séparer actives et terminées
  const actives = ordonnances.filter((ord: any) => ord.statut === 'active')
  const autres = ordonnances.filter((ord: any) => ord.statut !== 'active')

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'terminee': return 'bg-gray-100 text-gray-800'
      case 'renouvelee': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatut = (statut: string) => {
    switch (statut) {
      case 'active': return 'Active'
      case 'terminee': return 'Terminée'
      case 'renouvelee': return 'Renouvelée'
      default: return statut
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            ← GDM
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Ordonnances</h1>
            <p className="text-gray-600 mt-2">Consultez vos prescriptions médicales</p>
          </div>
        </div>

        {ordonnances.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-2xl font-bold mb-2">Aucune ordonnance</h2>
            <p className="text-gray-600">Vous n'avez pas encore d'ordonnance enregistrée</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ordonnances actives */}
            {actives.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Actives ({actives.length})</h2>
                <div className="grid grid-cols-1 gap-4">
                  {actives.map((ord: any) => (
                    <Link
                      key={ord.id}
                      href={`/dashboard/ordonnances/${ord.id}`}
                      className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Prescrit le {new Date(ord.date_prescription).toLocaleDateString('fr-FR')}
                          </p>
                          {profile?.role === 'patient' && ord.medecin && (
                            <p className="font-bold text-lg">
                              Dr. {ord.medecin.profile.first_name} {ord.medecin.profile.last_name}
                            </p>
                          )}
                          {profile?.role === 'medecin' && ord.patient && (
                            <p className="font-bold text-lg">
                              {ord.patient.profile.first_name} {ord.patient.profile.last_name}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(ord.statut)}`}>
                          {formatStatut(ord.statut)}
                        </span>
                      </div>

                      {/* Médicaments */}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Médicaments prescrits :</h3>
                        <div className="space-y-3">
                          {ord.medicaments && ord.medicaments.length > 0 ? (
                            ord.medicaments.map((med: any, index: number) => (
                              <div key={index} className="bg-blue-50 rounded-lg p-4">
                                <p className="font-bold text-blue-900">{med.nom || 'Médicament'}</p>
                                <p className="text-sm text-blue-700">{med.posologie || ''}</p>
                                {med.duree && (
                                  <p className="text-sm text-blue-600 mt-1">Durée : {med.duree}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">Aucun médicament spécifié</p>
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      {ord.instructions && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-semibold mb-2">Instructions :</h3>
                          <p className="text-gray-700 whitespace-pre-line">{ord.instructions}</p>
                        </div>
                      )}

                      {/* Date d'expiration */}
                      {ord.date_expiration && (
                        <div className="mt-4 text-sm text-gray-500">
                          Valable jusqu'au {new Date(ord.date_expiration).toLocaleDateString('fr-FR')}
                        </div>
                      )}

                      {/* QR Code */}
                      {ord.qr_code && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 mb-2">Code QR pour la pharmacie</p>
                          <div className="bg-gray-100 p-4 rounded text-center">
                            <p className="font-mono text-xs">{ord.qr_code}</p>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Historique */}
            {autres.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Historique ({autres.length})</h2>
                <div className="space-y-3">
                  {autres.map((ord: any) => (
                    <Link
                      key={ord.id}
                      href={`/dashboard/ordonnances/${ord.id}`}
                      className="block bg-white rounded-lg shadow p-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">
                            {new Date(ord.date_prescription).toLocaleDateString('fr-FR')}
                          </p>
                          {profile?.role === 'patient' && ord.medecin && (
                            <p className="font-semibold">
                              Dr. {ord.medecin.profile.first_name} {ord.medecin.profile.last_name}
                            </p>
                          )}
                          {profile?.role === 'medecin' && ord.patient && (
                            <p className="font-semibold">
                              {ord.patient.profile.first_name} {ord.patient.profile.last_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {ord.medicaments?.length || 0} médicament(s)
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(ord.statut)}`}>
                          {formatStatut(ord.statut)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
