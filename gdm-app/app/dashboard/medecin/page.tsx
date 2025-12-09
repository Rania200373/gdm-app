import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MedecinDashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les informations du médecin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'medecin') {
    redirect('/dashboard')
  }

  const { data: medecin } = await supabase
    .from('medecins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Statistiques du jour
  const today = new Date().toISOString().split('T')[0]
  
  const { count: rdvAujourdhui } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .eq('medecin_id', medecin?.id)
    .gte('date_heure', `${today}T00:00:00`)
    .lte('date_heure', `${today}T23:59:59`)

  const { count: rdvEnAttente } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .eq('medecin_id', medecin?.id)
    .eq('statut', 'en_attente')

  const { count: totalPatients } = await supabase
    .from('rendez_vous')
    .select('patient_id', { count: 'exact', head: true })
    .eq('medecin_id', medecin?.id)

  // Prochains rendez-vous
  const { data: prochainsRdv } = await supabase
    .from('rendez_vous')
    .select(`
      *,
      patients:patient_id (
        user_id,
        date_naissance,
        profiles:user_id (nom, prenom, email, telephone)
      )
    `)
    .eq('medecin_id', medecin?.id)
    .gte('date_heure', new Date().toISOString())
    .order('date_heure', { ascending: true })
    .limit(5)

  // Patients récents (dernières consultations)
  const { data: patientsRecents } = await supabase
    .from('rendez_vous')
    .select(`
      patient_id,
      date_heure,
      patients:patient_id (
        id,
        user_id,
        date_naissance,
        groupe_sanguin,
        profiles:user_id (nom, prenom, email, telephone)
      )
    `)
    .eq('medecin_id', medecin?.id)
    .order('date_heure', { ascending: false })
    .limit(6)

  // Éliminer les doublons de patients
  const uniquePatients = patientsRecents?.reduce((acc: any[], curr: any) => {
    if (!acc.find((p: any) => p.patients?.id === curr.patients?.id)) {
      acc.push(curr)
    }
    return acc
  }, []) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Espace Médecin
                </h1>
                <p className="text-sm text-gray-600">
                  Dr. {profile?.first_name} {profile?.last_name} • {medecin?.specialite}
                </p>
              </div>
            </div>
            <Link
              href="/auth/signout"
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="text-5xl">📅</div>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">Aujourd'hui</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">{rdvAujourdhui || 0}</div>
            <p className="text-blue-100">Rendez-vous prévus</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="text-5xl">⏳</div>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">En attente</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">{rdvEnAttente || 0}</div>
            <p className="text-orange-100">À confirmer</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="text-5xl">👥</div>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">Total</span>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">{totalPatients || 0}</div>
            <p className="text-green-100">Patients suivis</p>
          </div>
        </div>

        {/* Menu d'actions */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link href="/dashboard/medecin/patients" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-teal-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">👥</div>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <span className="text-teal-600">→</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Mes Patients</h3>
            <p className="text-sm text-gray-600">Liste complète</p>
          </Link>

          <Link href="/dashboard/medecin/consultations" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🩺</div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-blue-600">→</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Consultations</h3>
            <p className="text-sm text-gray-600">Nouvelle consultation</p>
          </Link>

          <Link href="/dashboard/medecin/ordonnances" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💊</div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span className="text-purple-600">→</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Ordonnances</h3>
            <p className="text-sm text-gray-600">Rédiger une ordonnance</p>
          </Link>

          <Link href="/dashboard/messages" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-pink-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💬</div>
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                <span className="text-pink-600">→</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Messages</h3>
            <p className="text-sm text-gray-600">Communiquer</p>
          </Link>

          <Link href="/dashboard/rendez-vous" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📅</div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600">→</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Agenda</h3>
            <p className="text-sm text-gray-600">Gérer les RDV</p>
          </Link>
        </div>

        {/* Prochains rendez-vous */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Prochains Rendez-vous</h3>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          {!prochainsRdv || prochainsRdv.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">📅</div>
              <p className="text-gray-500 text-lg">Aucun rendez-vous à venir</p>
              <p className="text-gray-400 text-sm mt-2">Vos prochains rendez-vous apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prochainsRdv.map((rdv: any) => {
                const date = new Date(rdv.date_heure)
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <div 
                    key={rdv.id} 
                    className={`border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-md ${
                      isToday 
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {rdv.patients?.profiles?.nom?.[0]}{rdv.patients?.profiles?.prenom?.[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-800">
                              {rdv.patients?.profiles?.nom} {rdv.patients?.profiles?.prenom}
                            </h3>
                            {isToday && (
                              <span className="inline-block text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                                🔔 Aujourd'hui
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <span className="font-medium">
                              {date.toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🕐</span>
                            <span className="font-medium">
                              {date.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {rdv.motif && (
                            <div className="flex items-center gap-2 col-span-2">
                              <span className="text-lg">📝</span>
                              <span className="italic">{rdv.motif}</span>
                            </div>
                          )}
                          {rdv.patients?.profiles?.telephone && (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📞</span>
                              <span>{rdv.patients.profiles.telephone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold shadow-sm
                          ${rdv.statut === 'confirme' ? 'bg-green-100 text-green-700 border border-green-300' : ''}
                          ${rdv.statut === 'en_attente' ? 'bg-orange-100 text-orange-700 border border-orange-300' : ''}
                          ${rdv.statut === 'annule' ? 'bg-red-100 text-red-700 border border-red-300' : ''}
                          ${rdv.statut === 'termine' ? 'bg-gray-100 text-gray-700 border border-gray-300' : ''}
                        `}>
                          {rdv.statut === 'confirme' && '✓ Confirmé'}
                          {rdv.statut === 'en_attente' && '⏳ En attente'}
                          {rdv.statut === 'annule' && '✗ Annulé'}
                          {rdv.statut === 'termine' && '✓ Terminé'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link 
              href="/dashboard/rendez-vous"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              📅 Voir tous les rendez-vous
            </Link>
          </div>
        </div>

        {/* Patients récents */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">👥 Patients Récents</h3>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {!uniquePatients || uniquePatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">👥</div>
              <p className="text-gray-500 text-lg">Aucun patient</p>
              <p className="text-gray-400 text-sm mt-2">Vos patients apparaîtront ici</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniquePatients.slice(0, 6).map((item: any) => {
                  const patient = item.patients
                  const age = patient?.date_naissance 
                    ? new Date().getFullYear() - new Date(patient.date_naissance).getFullYear()
                    : null

                  return (
                    <Link
                      key={patient?.id}
                      href={`/dashboard/medecin/patients/${patient?.id}/dossier`}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-teal-50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {patient?.profiles?.nom?.[0]}{patient?.profiles?.prenom?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-800 truncate">
                            {patient?.profiles?.nom} {patient?.profiles?.prenom}
                          </h3>
                          {age && (
                            <p className="text-sm text-gray-600">{age} ans</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {patient?.groupe_sanguin && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-red-500">🩸</span>
                            <span className="font-medium">{patient.groupe_sanguin}</span>
                          </div>
                        )}
                        {patient?.profiles?.telephone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📞</span>
                            <span className="truncate">{patient.profiles.telephone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <span>🕐</span>
                          <span>Dernier RDV: {new Date(item.date_heure).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-teal-600 font-medium hover:text-teal-700">
                          → Voir le dossier médical
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/dashboard/medecin/patients"
                  className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
                >
                  👥 Voir tous les patients
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
