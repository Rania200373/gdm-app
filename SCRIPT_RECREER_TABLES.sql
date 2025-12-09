-- ========================================
-- SCRIPT DE CORRECTION COMPLET
-- Recréer les tables medecins et patients
-- ========================================

-- ÉTAPE 1 : Supprimer les anciennes tables
-- Cela supprimera aussi toutes les données existantes
DROP TABLE IF EXISTS medecins CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ÉTAPE 2 : Recréer la table medecins avec la bonne structure
CREATE TABLE medecins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialite TEXT NOT NULL,
  numero_ordre TEXT UNIQUE NOT NULL,
  adresse_cabinet TEXT,
  code_postal TEXT,
  ville TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÉTAPE 3 : Recréer la table patients avec la bonne structure
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_naissance DATE NOT NULL,
  groupe_sanguin TEXT CHECK (groupe_sanguin IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[],
  numero_secu TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÉTAPE 4 : Activer Row Level Security
ALTER TABLE medecins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5 : Créer les politiques RLS pour medecins
CREATE POLICY "medecins_select_own"
  ON medecins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "medecins_update_own"
  ON medecins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "medecins_insert_own"
  ON medecins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tout le monde peut voir la liste des médecins (pour prendre RDV)
CREATE POLICY "medecins_select_all"
  ON medecins FOR SELECT
  USING (true);

-- ÉTAPE 6 : Créer les politiques RLS pour patients
CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les médecins peuvent voir les patients avec qui ils ont des RDV
CREATE POLICY "patients_select_by_medecin"
  ON patients FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM rendez_vous rv
      JOIN medecins m ON rv.medecin_id = m.id
      WHERE rv.patient_id = patients.id
      AND m.user_id = auth.uid()
    )
  );

-- ÉTAPE 7 : Créer des index pour les performances
CREATE INDEX idx_medecins_user_id ON medecins(user_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- ÉTAPE 8 : Vérification finale
-- Afficher la structure des tables medecins
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medecins'
ORDER BY ordinal_position;

-- Afficher la structure des tables patients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- Afficher les politiques RLS
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('medecins', 'patients')
ORDER BY tablename, policyname;
