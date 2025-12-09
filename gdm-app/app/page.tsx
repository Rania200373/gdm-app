import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🏥</div>
            <h1 className="text-2xl font-bold text-blue-600">GDM</h1>
          </div>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Gestion de Dossiers Médicaux
            <span className="block text-blue-600 mt-2">Sécurisée</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Les médecins et patients consultent et partagent les dossiers médicaux de manière confidentielle et sécurisée.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3">100% Sécurisé</h3>
            <p className="text-gray-600">
              Chiffrement de bout en bout et conformité RGPD pour protéger vos données de santé.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3">Accès Rapide</h3>
            <p className="text-gray-600">
              Consultez vos dossiers médicaux n'importe où, n'importe quand, sur tous vos appareils.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-3">Partage Contrôlé</h3>
            <p className="text-gray-600">
              Partagez vos informations médicales avec vos médecins en toute confiance.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Gratuit</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">🔒</div>
              <div className="text-blue-100">Conforme RGPD</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Disponible</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 GDM - Gestion de Dossiers Médicaux. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
