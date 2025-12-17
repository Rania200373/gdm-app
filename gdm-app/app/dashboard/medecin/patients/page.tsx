import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MedecinPatientsPage() {
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

  // Récupérer tous les patients qui ont eu des rendez-vous avec ce médecin
  const { data: patientsData } = await supabase
    .from('rendez_vous')
    .select(`
      patient_id,
      patients:patient_id (
        user_id,
        date_naissance,
        profiles:user_id (
          id,
          first_name,
          last_name,
          phone
        )
      )
    `)
    .eq('medecin_id', user.id)
    .order('created_at', { ascending: false })

  // Éliminer les doublons de patients
  const uniquePatientsMap = new Map()
  patientsData?.forEach((item: any) => {
    if (item.patients && !uniquePatientsMap.has(item.patient_id)) {
      uniquePatientsMap.set(item.patient_id, item.patients)
    }
  })
  const patients = Array.from(uniquePatientsMap.values())

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/medecin" className="text-teal-600 hover:text-teal-700">
                ← Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Patients</h1>
                <p className="text-sm text-gray-600">
                  {patients.length} patient{patients.length > 1 ? 's' : ''} suivi{patients.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {!patients || patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">👥</div>
              <p className="text-gray-500 text-lg">Aucun patient pour le moment</p>
              <p className="text-gray-400 text-sm mt-2">Les patients qui prennent rendez-vous apparaîtront ici</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient: any) => {
                const age = patient?.date_naissance 
                  ? new Date().getFullYear() - new Date(patient.date_naissance).getFullYear()
                  : null

                return (
                  <div key={patient?.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {patient?.profiles?.first_name?.[0]}{patient?.profiles?.last_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          {patient?.profiles?.first_name} {patient?.profiles?.last_name}
                        </h3>
                        {age && <p className="text-sm text-gray-600">{age} ans</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-700">
                      {patient?.groupe_sanguin && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">🩸</span>
                          <span>Groupe: {patient.groupe_sanguin}</span>
                        </div>
                      )}
                      {patient?.profiles?.phone && (
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span>{patient.profiles.phone}</span>
                        </div>
                      )}
                      {patient?.numero_secu && (
                        <div className="flex items-center gap-2">
                          <span>🆔</span>
                          <span className="text-xs">{patient.numero_secu}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link 
                        href={`/dashboard/medecin/patients/${patient?.id}`}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                      >
                        Voir le dossier →
                      </Link>
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
