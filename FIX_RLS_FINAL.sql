-- =========================================
-- FIX RLS DÉFINITIF POUR L'INSCRIPTION
-- =========================================
-- Solution simple : utiliser le SERVICE ROLE dans le code
-- Mais d'abord, simplifions les politiques RLS

-- ============ MEDECINS ============

-- Supprimer toutes les anciennes politiques d'insertion
DROP POLICY IF EXISTS "medecins_insert_own" ON medecins;
DROP POLICY IF EXISTS "medecins_insert_signup" ON medecins;
DROP POLICY IF EXISTS "medecins_insert_authenticated" ON medecins;

-- Créer UNE SEULE politique simple pour l'insertion
-- Permet l'insertion si l'utilisateur est authentifié OU si c'est un service role
CREATE POLICY "medecins_insert_policy"
  ON medecins 
  FOR INSERT
  WITH CHECK (
    -- Permet si l'utilisateur connecté insère son propre profil
    auth.uid() = user_id
    OR
    -- OU si c'est le service role (bypass RLS)
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- OU si l'utilisateur vient juste d'être créé (dans les dernières minutes)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id 
      AND created_at > NOW() - INTERVAL '5 minutes'
    )
  );

-- ============ PATIENTS ============

-- Supprimer toutes les anciennes politiques d'insertion
DROP POLICY IF EXISTS "patients_insert_own" ON patients;
DROP POLICY IF EXISTS "patients_insert_signup" ON patients;
DROP POLICY IF EXISTS "patients_insert_authenticated" ON patients;

-- Créer UNE SEULE politique simple pour l'insertion
CREATE POLICY "patients_insert_policy"
  ON patients 
  FOR INSERT
  WITH CHECK (
    -- Permet si l'utilisateur connecté insère son propre profil
    auth.uid() = user_id
    OR
    -- OU si c'est le service role (bypass RLS)
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- OU si l'utilisateur vient juste d'être créé (dans les dernières minutes)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_id 
      AND created_at > NOW() - INTERVAL '5 minutes'
    )
  );

-- ============ VERIFICATION ============

SELECT 
    tablename,
    policyname,
    cmd AS command
FROM pg_policies
WHERE tablename IN ('medecins', 'patients')
  AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- Message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Politiques RLS simplifiées et corrigées';
    RAISE NOTICE '📝 L''inscription devrait maintenant fonctionner';
END $$;
