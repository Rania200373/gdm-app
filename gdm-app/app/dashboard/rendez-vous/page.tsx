import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RendezVousPage() {
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

  // Récupérer les rendez-vous selon le rôle
  let rendezVousData = []

  if (profile?.role === 'patient') {
    const { data } = await supabase
      .from('rendez_vous')
      .select(`
        *,
        medecin:medecins(
          specialite,
          adresse_cabinet,
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('patient_id', user.id)
      .order('date_heure', { ascending: true })

    rendezVousData = data || []
  } else if (profile?.role === 'medecin') {
    const { data } = await supabase
      .from('rendez_vous')
      .select(`
        *,
        patient:patients(
          profile:profiles(first_name, last_name)
        )
      `)
      .eq('medecin_id', user.id)
      .order('date_heure', { ascending: true })

    rendezVousData = data || []
  }

  // Séparer les rendez-vous à venir et passés
  const now = new Date()
  const avenir = rendezVousData.filter((rdv: any) => new Date(rdv.date_heure) >= now)
  const passes = rendezVousData.filter((rdv: any) => new Date(rdv.date_heure) < now)

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800'
      case 'en_attente': return 'bg-yellow-100 text-yellow-800'
      case 'annule': return 'bg-red-100 text-red-800'
      case 'termine': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
            <p className="text-gray-600 mt-2">Gérez vos rendez-vous médicaux</p>
          </div>
          {profile?.role === 'patient' && (
            <Link
              href="/dashboard/rendez-vous/nouveau"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Nouveau rendez-vous
            </Link>
          )}
        </div>

        {/* Rendez-vous à venir */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">À venir ({avenir.length})</h2>
          {avenir.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avenir.map((rdv: any) => (
                <Link
                  key={rdv.id}
                  href={`/dashboard/rendez-vous/${rdv.id}`}
                  className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date(rdv.date_heure).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-xl font-semibold">
                        {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(rdv.statut)}`}>
                      {formatStatut(rdv.statut)}
                    </span>
                  </div>

                  {profile?.role === 'patient' && rdv.medecin ? (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-lg">
                        Dr. {rdv.medecin.profile.first_name} {rdv.medecin.profile.last_name}
                      </p>
                      <p className="text-gray-600">{rdv.medecin.specialite}</p>
                      {rdv.medecin.adresse_cabinet && (
                        <p className="text-sm text-gray-500 mt-1">📍 {rdv.medecin.adresse_cabinet}</p>
                      )}
                    </div>
                  ) : profile?.role === 'medecin' && rdv.patient ? (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-lg">
                        {rdv.patient.profile.first_name} {rdv.patient.profile.last_name}
                      </p>
                    </div>
                  ) : null}

                  {rdv.motif && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Motif</p>
                      <p className="text-gray-700">{rdv.motif}</p>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-500">
                    Durée : {rdv.duree} minutes
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600">Aucun rendez-vous à venir</p>
            </div>
          )}
        </div>

        {/* Rendez-vous passés */}
        {passes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Historique ({passes.length})</h2>
            <div className="space-y-3">
              {passes.slice(0, 5).map((rdv: any) => (
                <Link
                  key={rdv.id}
                  href={`/dashboard/rendez-vous/${rdv.id}`}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      {new Date(rdv.date_heure).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    {profile?.role === 'patient' && rdv.medecin && (
                      <p className="text-gray-600">
                        Dr. {rdv.medecin.profile.first_name} {rdv.medecin.profile.last_name}
                      </p>
                    )}
                    {profile?.role === 'medecin' && rdv.patient && (
                      <p className="text-gray-600">
                        {rdv.patient.profile.first_name} {rdv.patient.profile.last_name}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(rdv.statut)}`}>
                    {formatStatut(rdv.statut)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
