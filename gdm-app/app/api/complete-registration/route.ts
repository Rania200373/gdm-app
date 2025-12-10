import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()

    // Créer un client Supabase avec le Service Role Key (bypass RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (role === 'medecin') {
      // Créer l'entrée médecin
      const { error: medecinError } = await supabaseAdmin
        .from('medecins')
        .insert({
          user_id: userId,
          specialite: 'Médecine générale',
          numero_ordre: `ORD${Date.now()}`,
          verified: false,
        })

      if (medecinError) {
        console.error('Erreur création médecin:', medecinError)
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil médecin', details: medecinError.message },
          { status: 500 }
        )
      }
    } else {
      // Créer l'entrée patient
      const { error: patientError } = await supabaseAdmin
        .from('patients')
        .insert({
          user_id: userId,
          date_naissance: new Date().toISOString().split('T')[0],
        })

      if (patientError) {
        console.error('Erreur création patient:', patientError)
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil patient', details: patientError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
