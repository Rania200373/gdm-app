-- Script de vérification et correction de la structure des tables
-- À exécuter dans Supabase SQL Editor

-- =======================
-- VÉRIFICATION DE LA STRUCTURE
-- =======================

-- Vérifier la structure de la table medecins
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'medecins'
ORDER BY ordinal_position;

-- Vérifier la structure de la table patients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- =======================
-- CORRECTION SI NÉCESSAIRE
-- =======================

-- Si les tables ont 'id' au lieu de 'user_id', les recréer correctement

-- Sauvegarder les données existantes (si nécessaire)
-- CREATE TABLE medecins_backup AS SELECT * FROM medecins;
-- CREATE TABLE patients_backup AS SELECT * FROM patients;

-- Supprimer les anciennes tables (ATTENTION: cela supprime les données!)
-- DROP TABLE IF EXISTS medecins CASCADE;
-- DROP TABLE IF EXISTS patients CASCADE;

-- Recréer la table des médecins avec la bonne structure
CREATE TABLE IF NOT EXISTS medecins (
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

-- Recréer la table des patients avec la bonne structure
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_naissance DATE NOT NULL,
  groupe_sanguin TEXT CHECK (groupe_sanguin IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[],
  numero_secu TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS
ALTER TABLE medecins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Recréer les politiques RLS pour medecins
DROP POLICY IF EXISTS "medecins_select_own" ON medecins;
DROP POLICY IF EXISTS "medecins_update_own" ON medecins;
DROP POLICY IF EXISTS "medecins_insert_own" ON medecins;
DROP POLICY IF EXISTS "medecins_select_all" ON medecins;

CREATE POLICY "medecins_select_own"
  ON medecins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "medecins_update_own"
  ON medecins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "medecins_insert_own"
  ON medecins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medecins_select_all"
  ON medecins FOR SELECT
  USING (true);

-- Recréer les politiques RLS pour patients
DROP POLICY IF EXISTS "patients_select_own" ON patients;
DROP POLICY IF EXISTS "patients_update_own" ON patients;
DROP POLICY IF EXISTS "patients_insert_own" ON patients;
DROP POLICY IF EXISTS "patients_select_by_medecin" ON patients;

CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_medecins_user_id ON medecins(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- =======================
-- VÉRIFICATION FINALE
-- =======================

-- Lister toutes les politiques actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('medecins', 'patients')
ORDER BY tablename, policyname;

-- Vérifier la structure finale
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('medecins', 'patients')
ORDER BY table_name, ordinal_position;
