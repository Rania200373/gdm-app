-- ========================================
-- CORRECTION FINALE TABLE MEDECINS
-- ========================================

-- ÉTAPE 1 : Désactiver temporairement RLS sur medecins
ALTER TABLE medecins DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2 : Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "medecins_select_own" ON medecins;
DROP POLICY IF EXISTS "medecins_update_own" ON medecins;
DROP POLICY IF EXISTS "medecins_insert_own" ON medecins;
DROP POLICY IF EXISTS "medecins_select_all" ON medecins;

-- ÉTAPE 3 : Supprimer et recréer la table
DROP TABLE IF EXISTS medecins CASCADE;

CREATE TABLE medecins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialite TEXT NOT NULL,
  numero_ordre TEXT UNIQUE NOT NULL,
  adresse_cabinet TEXT,
  code_postal TEXT,
  ville TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÉTAPE 4 : Activer RLS
ALTER TABLE medecins ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5 : Créer les politiques RLS dans le bon ordre
-- Politique pour l'insertion (la plus importante)
CREATE POLICY "medecins_insert_own"
  ON medecins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour la lecture de son propre profil
CREATE POLICY "medecins_select_own"
  ON medecins FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour la mise à jour de son propre profil
CREATE POLICY "medecins_update_own"
  ON medecins FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique pour que tout le monde puisse voir la liste des médecins
CREATE POLICY "medecins_select_all"
  ON medecins FOR SELECT
  USING (true);

-- ÉTAPE 6 : Créer l'index pour les performances
CREATE INDEX idx_medecins_user_id ON medecins(user_id);

-- ÉTAPE 7 : Vérification
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
