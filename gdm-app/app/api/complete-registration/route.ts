import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()

    console.log('API complete-registration appelée:', { userId, role })

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

    // Vérifier que le profil existe
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (profileCheckError || !profile) {
      console.error('Profil non trouvé:', profileCheckError)
      return NextResponse.json(
        { error: 'Profil non trouvé', details: profileCheckError?.message },
        { status: 404 }
      )
    }

    console.log('Profil trouvé:', profile)

    if (role === 'medecin') {
      // Vérifier si le médecin existe déjà
      const { data: existingMedecin } = await supabaseAdmin
        .from('medecins')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (existingMedecin) {
        console.log('Médecin existe déjà')
        return NextResponse.json({ success: true, message: 'Médecin existe déjà' })
      }

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

      console.log('Médecin créé avec succès')
    } else {
      // Vérifier si le patient existe déjà
      const { data: existingPatient } = await supabaseAdmin
        .from('patients')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (existingPatient) {
        console.log('Patient existe déjà')
        return NextResponse.json({ success: true, message: 'Patient existe déjà' })
      }

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

      console.log('Patient créé avec succès')

      // Créer le dossier médical
      const { error: dossierError } = await supabaseAdmin
        .from('dossiers_medicaux')
        .insert({
          patient_id: userId,
        })

      if (dossierError) {
        console.error('Erreur création dossier médical:', dossierError)
        // Ne pas bloquer l'inscription si le dossier ne peut pas être créé
      } else {
        console.log('Dossier médical créé avec succès')
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
