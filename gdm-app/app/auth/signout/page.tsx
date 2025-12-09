'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignOutPage() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(true)

  useEffect(() => {
    const signOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Attendre un peu pour que les cookies soient supprimés
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Rediriger et forcer le rechargement de la page
      window.location.href = '/'
    }
    
    signOut()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Déconnexion en cours...</h1>
        <p className="text-gray-600">Vous allez être redirigé</p>
      </div>
    </div>
  )
}
