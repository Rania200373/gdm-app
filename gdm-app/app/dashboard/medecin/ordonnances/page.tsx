import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MedecinOrdonnancesPage() {
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

  const { data: medecin } = await supabase
    .from('medecins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Récupérer les ordonnances créées par ce médecin
  const { data: ordonnances } = await supabase
    .from('ordonnances')
    .select(`
      *,
      patients:patient_id (
        id,
        profiles:user_id (
          first_name,
          last_name
        )
      )
    `)
    .eq('medecin_id', medecin?.id)
    .order('date_creation', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/medecin" className="text-teal-600 hover:text-teal-700">
                ← Retour
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Ordonnances</h1>
            </div>
            <Link
              href="/dashboard/medecin/ordonnances/nouvelle"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              + Nouvelle ordonnance
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {!ordonnances || ordonnances.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">💊</div>
              <p className="text-gray-500 text-lg">Aucune ordonnance pour le moment</p>
              <p className="text-gray-400 text-sm mt-2">Cliquez sur "Nouvelle ordonnance" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ordonnances.map((ordonnance: any) => {
                const date = new Date(ordonnance.date_creation)
                
                return (
                  <div key={ordonnance.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {ordonnance.patients?.profiles?.first_name?.[0]}{ordonnance.patients?.profiles?.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              {ordonnance.patients?.profiles?.first_name} {ordonnance.patients?.profiles?.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {date.toLocaleDateString('fr-FR', { 
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 space-y-1">
                          {ordonnance.medicaments && (
                            <p className="font-medium">💊 Médicaments: {ordonnance.medicaments.split('\n').length}</p>
                          )}
                          {ordonnance.instructions && (
                            <p className="text-gray-600 italic">"{ordonnance.instructions.substring(0, 100)}..."</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                          Voir détails
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                          Télécharger PDF
                        </button>
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
