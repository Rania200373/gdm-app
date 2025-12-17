-- =========================================
-- FIX RLS POUR PERMETTRE L'INSCRIPTION
-- =========================================
-- Ce script permet aux nouveaux utilisateurs de créer leurs profils
-- médecin/patient pendant l'inscription

-- ============ MEDECINS ============

-- Supprimer l'ancienne politique d'insertion
DROP POLICY IF EXISTS "medecins_insert_own" ON medecins;

-- Créer une nouvelle politique qui permet l'insertion pendant l'inscription
CREATE POLICY "medecins_insert_during_signup"
  ON medecins 
  FOR INSERT
  WITH CHECK (
    -- Permet l'insertion si l'utilisateur est authentifié ET c'est son propre profil
    auth.uid() = user_id
    OR
    -- OU si le user_id correspond à un utilisateur existant dans auth.users
    -- (cela permet l'insertion juste après la création du compte)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id
    )
  );

-- ============ PATIENTS ============

-- Supprimer l'ancienne politique d'insertion
DROP POLICY IF EXISTS "patients_insert_own" ON patients;

-- Créer une nouvelle politique qui permet l'insertion pendant l'inscription
CREATE POLICY "patients_insert_during_signup"
  ON patients 
  FOR INSERT
  WITH CHECK (
    -- Permet l'insertion si l'utilisateur est authentifié ET c'est son propre profil
    auth.uid() = user_id
    OR
    -- OU si le user_id correspond à un utilisateur existant dans auth.users
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id
    )
  );

-- ============ VERIFICATION ============

-- Vérifier les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename IN ('medecins', 'patients')
  AND policyname LIKE '%insert%'
ORDER BY tablename, policyname;

-- Message de confirmation
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Politiques RLS mises à jour pour permettre l''inscription';
END $$;
