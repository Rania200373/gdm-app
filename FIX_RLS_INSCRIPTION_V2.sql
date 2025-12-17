-- =========================================
-- FIX RLS POUR INSCRIPTION (SANS SUPPRESSION)
-- =========================================
-- Cette approche AJOUTE des politiques permissives sans supprimer les existantes

-- ============ MEDECINS ============

-- Supprimer si existe déjà (pour éviter les doublons)
DROP POLICY IF EXISTS "medecins_insert_signup" ON medecins;

-- Ajouter une politique permissive pour l'inscription
-- Elle s'ajoute aux politiques existantes avec un OR logique
CREATE POLICY "medecins_insert_signup"
  ON medecins 
  FOR INSERT
  WITH CHECK (
    -- Permet l'insertion si le user_id existe dans auth.users
    -- et que l'insertion se fait dans les 10 secondes après création du compte
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id
      AND created_at > NOW() - INTERVAL '10 seconds'
    )
  );

-- ============ PATIENTS ============

-- Supprimer si existe déjà (pour éviter les doublons)
DROP POLICY IF EXISTS "patients_insert_signup" ON patients;

-- Ajouter une politique permissive pour l'inscription
CREATE POLICY "patients_insert_signup"
  ON patients 
  FOR INSERT
  WITH CHECK (
    -- Permet l'insertion si le user_id existe dans auth.users
    -- et que l'insertion se fait dans les 10 secondes après création du compte
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id
      AND created_at > NOW() - INTERVAL '10 seconds'
    )
  );

-- ============ VERIFICATION ============

-- Lister toutes les politiques sur medecins et patients
SELECT 
    tablename,
    policyname,
    permissive,
    cmd AS command
FROM pg_policies
WHERE tablename IN ('medecins', 'patients')
ORDER BY tablename, cmd, policyname;

-- Message de confirmation
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Politiques RLS permissives ajoutées pour l''inscription';
    RAISE NOTICE '📝 Les anciennes politiques sont conservées';
END $$;
