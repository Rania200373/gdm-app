-- ========================================
-- CORRECTION RLS - POLITIQUE PLUS PERMISSIVE
-- ========================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "medecins_insert_own" ON medecins;
DROP POLICY IF EXISTS "medecins_select_own" ON medecins;
DROP POLICY IF EXISTS "medecins_update_own" ON medecins;
DROP POLICY IF EXISTS "medecins_select_all" ON medecins;

-- Créer une politique d'insertion permissive pour les utilisateurs authentifiés
CREATE POLICY "medecins_insert_authenticated"
  ON medecins FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique de lecture pour tous
CREATE POLICY "medecins_select_all"
  ON medecins FOR SELECT
  TO public
  USING (true);

-- Politique de mise à jour pour le propriétaire uniquement
CREATE POLICY "medecins_update_own"
  ON medecins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique de suppression pour le propriétaire uniquement
CREATE POLICY "medecins_delete_own"
  ON medecins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Vérification
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'medecins';
