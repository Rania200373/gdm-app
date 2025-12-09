import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ConsultationsPage() {
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

  // Récupérer le médecin
  const { data: medecin } = await supabase
    .from('medecins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Récupérer les consultations du médecin
  const { data: consultations } = await supabase
    .from('consultations')
    .select(`
      *,
      patients:patient_id (
        id,
        user_id,
        date_naissance,
        profiles:user_id (nom, prenom, email)
      ),
      rendez_vous:rendez_vous_id (
        id,
        date_heure,
        motif
      )
    `)
    .eq('medecin_id', medecin?.id)
    .order('date_consultation', { ascending: false })

  // Statistiques
  const today = new Date().toISOString().split('T')[0]
  const consultationsAujourdhui = consultations?.filter(c => 
    c.date_consultation?.startsWith(today)
  ).length || 0

  const consultationsSemaine = consultations?.filter(c => {
    const date = new Date(c.date_consultation)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/medecin" className="text-teal-600 hover:text-teal-700 font-medium">
                ← Retour
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
            </div>
            <Link
              href="/dashboard/medecin/consultations/nouvelle"
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Nouvelle consultation
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📅</span>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">Aujourd'hui</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{consultationsAujourdhui}</div>
            <p className="text-blue-100 text-sm">Consultations</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📊</span>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">7 jours</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{consultationsSemaine}</div>
            <p className="text-purple-100 text-sm">Cette semaine</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">🩺</span>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">Total</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{consultations?.length || 0}</div>
            <p className="text-green-100 text-sm">Consultations</p>
          </div>
        </div>

        {/* Liste des consultations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Historique des consultations</h2>
          
          {!consultations || consultations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-30">🩺</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune consultation</h3>
              <p className="text-gray-500 mb-6">
                Commencez à enregistrer vos consultations
              </p>
              <Link
                href="/dashboard/medecin/consultations/nouvelle"
                className="inline-block bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                + Créer une consultation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation: any) => {
                const date = new Date(consultation.date_consultation)
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={consultation.id}
                    className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                      isToday
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100'
                        : 'border-gray-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                            {consultation.patients?.profiles?.nom?.[0]}{consultation.patients?.profiles?.prenom?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {consultation.patients?.profiles?.nom} {consultation.patients?.profiles?.prenom}
                            </h3>
                            {isToday && (
                              <span className="inline-block text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium mt-1">
                                🔔 Aujourd'hui
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-lg">📅</span>
                              <span className="font-medium">
                                {date.toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {consultation.motif && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-lg">📝</span>
                                <span className="truncate">{consultation.motif}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {consultation.diagnostic && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-lg">🔍</span>
                                <span className="font-medium truncate">{consultation.diagnostic}</span>
                              </div>
                            )}
                            {consultation.ordonnance_prescrite && (
                              <div className="flex items-center gap-2 text-green-600">
                                <span className="text-lg">💊</span>
                                <span className="text-sm font-medium">Ordonnance prescrite</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {consultation.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              <span className="font-medium">Notes:</span> {consultation.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/dashboard/medecin/patients/${consultation.patients?.id}/dossier`}
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium border border-teal-200 whitespace-nowrap"
                        >
                          📂 Dossier patient
                        </Link>
                        {consultation.rendez_vous_id && (
                          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 whitespace-nowrap text-center">
                            🔗 RDV lié
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
