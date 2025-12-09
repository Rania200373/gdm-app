import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Rediriger les médecins vers leur dashboard spécifique
  if (request.nextUrl.pathname === '/dashboard') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'medecin') {
        return NextResponse.redirect(new URL('/dashboard/medecin', request.url))
      }
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Correspond à tous les chemins de requête sauf pour ceux commençant par :
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'images)
     * - favicon.ico (fichier favicon)
     * Vous pouvez modifier ces options selon vos besoins.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
