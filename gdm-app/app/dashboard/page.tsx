import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le profil de l'utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GDM Patient</h1>
          </div>
          <Link
            href="/auth/signout"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            Déconnexion
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Bonjour, {profile?.first_name} {profile?.last_name} ! 👋
              </h2>
              <p className="text-blue-100 text-lg">Bienvenue sur votre espace santé personnel</p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">🏥</div>
          </div>
        </div>

        {/* Section titre */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Accès rapide</h3>
        
        {/* Grille de fonctionnalités principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/dossier-medical" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📋</div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-blue-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Dossier Médical</h3>
            <p className="text-gray-600">Consultez vos informations de santé</p>
          </Link>

          <Link href="/dashboard/rendez-vous" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📅</div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Rendez-vous</h3>
            <p className="text-gray-600">Gérez vos consultations</p>
          </Link>

          <Link href="/dashboard/ordonnances" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💊</div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span className="text-purple-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Ordonnances</h3>
            <p className="text-gray-600">Vos prescriptions médicales</p>
          </Link>
        </div>

        {/* Section secondaire */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🔜 Prochainement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 rounded-2xl shadow-sm p-6 border border-dashed border-gray-300">
            <div className="text-4xl mb-4 opacity-40">📄</div>
            <h3 className="text-xl font-bold mb-2 text-gray-500">Documents</h3>
            <p className="text-gray-400">Stockez vos documents médicaux</p>
            <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Bientôt</span>
          </div>

          <Link href="/dashboard/messages" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💬</div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600 text-xl">→</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Messages</h3>
            <p className="text-gray-600">Communiquez avec votre médecin</p>
          </Link>

          <div className="bg-white/60 rounded-2xl shadow-sm p-6 border border-dashed border-gray-300">
            <div className="text-4xl mb-4 opacity-40">⚙️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-500">Paramètres</h3>
            <p className="text-gray-400">Personnalisez votre compte</p>
            <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Bientôt</span>
          </div>
        </div>
      </main>
    </div>
  )
}
