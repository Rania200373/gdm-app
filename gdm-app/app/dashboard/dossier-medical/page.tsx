import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DossierMedicalPDFButton from '@/components/DossierMedicalPDFButton'

export default async function DossierMedicalPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le profil patient
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Récupérer les antécédents
  const { data: antecedents } = await supabase
    .from('antecedents')
    .select('*')
    .eq('patient_id', patient?.id)
    .order('date_debut', { ascending: false })

  // Récupérer les allergies
  const { data: allergies } = await supabase
    .from('allergies')
    .select('*')
    .eq('patient_id', patient?.id)

  // Récupérer les examens
  const { data: examens } = await supabase
    .from('examens')
    .select(`
      *,
      medecin:medecins(
        user_id,
        profile:profiles(first_name, last_name)
      )
    `)
    .eq('patient_id', patient?.id)
    .order('date_examen', { ascending: false })

  // Récupérer les ordonnances récentes
  const { data: ordonnances } = await supabase
    .from('ordonnances')
    .select(`
      *,
      medecin:medecins(
        user_id,
        profile:profiles(first_name, last_name)
      )
    `)
    .eq('patient_id', patient?.id)
    .order('date_ordonnance', { ascending: false })
    .limit(5)

  const groupesSanguins: Record<string, string> = {
    'A+': 'A Positif',
    'A-': 'A Négatif',
    'B+': 'B Positif',
    'B-': 'B Négatif',
    'AB+': 'AB Positif',
    'AB-': 'AB Négatif',
    'O+': 'O Positif',
    'O-': 'O Négatif'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📋 Mon Dossier Médical
              </h1>
            </div>
            <DossierMedicalPDFButton 
              data={{
                patient: {
                  first_name: profile?.first_name || '',
                  last_name: profile?.last_name || '',
                  date_naissance: patient?.date_naissance,
                  phone: profile?.phone
                },
                antecedents: antecedents || [],
                allergies: allergies || [],
                examens: examens || []
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations personnelles */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6">👤 Informations Personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">Nom complet</p>
              <p className="font-semibold text-lg">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">Date de naissance</p>
              <p className="font-semibold text-lg">
                {patient?.date_naissance 
                  ? new Date(patient.date_naissance).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Non renseignée'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">Groupe sanguin</p>
              <p className="font-semibold text-lg">
                {patient?.groupe_sanguin ? groupesSanguins[patient.groupe_sanguin] || patient.groupe_sanguin : 'Non renseigné'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">Téléphone</p>
              <p className="font-semibold text-lg">{profile?.phone || 'Non renseigné'}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">Email</p>
              <p className="font-semibold text-lg truncate">{user.email}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm mb-1">N° Sécurité Sociale</p>
              <p className="font-semibold text-lg">{patient?.numero_secu || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              ⚠️ Allergies
              {allergies && allergies.length > 0 && (
                <span className="ml-3 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {allergies.length}
                </span>
              )}
            </h2>
          </div>
          
          {!allergies || allergies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune allergie enregistrée</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allergies.map((allergie: any) => (
                <div key={allergie.id} className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{allergie.nom}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      allergie.severite === 'severe' ? 'bg-red-200 text-red-800' :
                      allergie.severite === 'moderee' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {allergie.severite === 'severe' ? 'Sévère' :
                       allergie.severite === 'moderee' ? 'Modérée' : 'Légère'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Type: {allergie.type}</p>
                  {allergie.reaction && (
                    <p className="text-sm text-gray-700 mt-2 italic">Réaction: {allergie.reaction}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Antécédents médicaux */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📝 Antécédents Médicaux</h2>
          </div>
          
          {!antecedents || antecedents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun antécédent enregistré</p>
          ) : (
            <div className="space-y-4">
              {antecedents.map((antecedent: any) => (
                <div key={antecedent.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{antecedent.titre}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {antecedent.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(antecedent.date_debut).toLocaleDateString('fr-FR', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {antecedent.description && (
                    <p className="text-gray-700 mt-3">{antecedent.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Examens médicaux */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">🔬 Examens Médicaux</h2>
          </div>
          
          {!examens || examens.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun examen enregistré</p>
          ) : (
            <div className="space-y-4">
              {examens.map((examen: any) => (
                <div key={examen.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{examen.type_examen}</h3>
                      {examen.medecin?.profile && (
                        <p className="text-sm text-gray-600">
                          Prescrit par Dr. {examen.medecin.profile.first_name} {examen.medecin.profile.last_name}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(examen.date_examen).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {examen.resultat && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Résultat:</p>
                      <p className="text-gray-800">{examen.resultat}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordonnances récentes */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">💊 Ordonnances Récentes</h2>
            <Link
              href="/dashboard/ordonnances"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Voir tout →
            </Link>
          </div>
          
          {!ordonnances || ordonnances.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune ordonnance enregistrée</p>
          ) : (
            <div className="space-y-3">
              {ordonnances.map((ordonnance: any) => (
                <div key={ordonnance.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {ordonnance.medecin?.profile && (
                        <p className="font-semibold text-gray-900">
                          Dr. {ordonnance.medecin.profile.first_name} {ordonnance.medecin.profile.last_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ordonnance.medicaments}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 ml-4">
                      {new Date(ordonnance.date_ordonnance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
