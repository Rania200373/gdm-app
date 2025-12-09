-- Script de correction des politiques RLS
-- À exécuter dans Supabase SQL Editor

-- =======================
-- SUPPRESSION DES ANCIENNES POLITIQUES
-- =======================

-- Profiles
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Medecins
DROP POLICY IF EXISTS "Medecins can view own record" ON medecins;
DROP POLICY IF EXISTS "Medecins can update own record" ON medecins;
DROP POLICY IF EXISTS "Les médecins peuvent voir leur propre dossier" ON medecins;
DROP POLICY IF EXISTS "Les médecins peuvent mettre à jour leurs informations" ON medecins;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les profils des médecins" ON medecins;
DROP POLICY IF EXISTS "Tout le monde peut voir les médecins" ON medecins;

-- Patients
DROP POLICY IF EXISTS "Les patients peuvent voir leur propre dossier" ON patients;
DROP POLICY IF EXISTS "Les patients peuvent mettre à jour leurs informations" ON patients;
DROP POLICY IF EXISTS "Patients can view own record" ON patients;
DROP POLICY IF EXISTS "Patients can update own record" ON patients;
DROP POLICY IF EXISTS "Patients can insert own record" ON patients;
DROP POLICY IF EXISTS "Les médecins peuvent voir les patients" ON patients;

-- Dossiers medicaux
DROP POLICY IF EXISTS "Les patients peuvent voir leur propre dossier médical" ON dossiers_medicaux;
DROP POLICY IF EXISTS "Les médecins peuvent voir les dossiers auxquels ils ont accès" ON dossiers_medicaux;
DROP POLICY IF EXISTS "Patients can view own dossier" ON dossiers_medicaux;
DROP POLICY IF EXISTS "Les patients peuvent modifier leur dossier" ON dossiers_medicaux;
DROP POLICY IF EXISTS "Les médecins peuvent modifier les dossiers" ON dossiers_medicaux;

-- Consultations
DROP POLICY IF EXISTS "Les patients peuvent voir leurs consultations" ON consultations;
DROP POLICY IF EXISTS "Les médecins peuvent voir les consultations de leurs patients" ON consultations;
DROP POLICY IF EXISTS "Les médecins peuvent créer des consultations" ON consultations;
DROP POLICY IF EXISTS "Medecins can view consultations" ON consultations;
DROP POLICY IF EXISTS "Medecins can insert consultations" ON consultations;

-- Ordonnances
DROP POLICY IF EXISTS "Les patients peuvent voir leurs ordonnances" ON ordonnances;
DROP POLICY IF EXISTS "Les médecins peuvent voir leurs ordonnances" ON ordonnances;
DROP POLICY IF EXISTS "Les médecins peuvent créer des ordonnances" ON ordonnances;
DROP POLICY IF EXISTS "Patients can view ordonnances" ON ordonnances;
DROP POLICY IF EXISTS "Medecins can view ordonnances" ON ordonnances;
DROP POLICY IF EXISTS "Medecins can insert ordonnances" ON ordonnances;

-- Rendez-vous
DROP POLICY IF EXISTS "Les patients peuvent voir leurs rendez-vous" ON rendez_vous;
DROP POLICY IF EXISTS "Les médecins peuvent voir leurs rendez-vous" ON rendez_vous;
DROP POLICY IF EXISTS "Les patients peuvent créer des rendez-vous" ON rendez_vous;
DROP POLICY IF EXISTS "Patients can view rendez_vous" ON rendez_vous;
DROP POLICY IF EXISTS "Medecins can view rendez_vous" ON rendez_vous;
DROP POLICY IF EXISTS "Patients can insert rendez_vous" ON rendez_vous;
DROP POLICY IF EXISTS "Medecins can update rendez_vous" ON rendez_vous;
DROP POLICY IF EXISTS "Les patients peuvent modifier leurs rendez-vous" ON rendez_vous;

-- Messages
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les messages qu'ils ont envoyés" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les messages qu'ils ont reçus" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON messages;

-- =======================
-- NOUVELLES POLITIQUES CORRIGÉES
-- =======================

-- ============ PROFILES ============
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent voir les profils des médecins (pour sélection)
CREATE POLICY "profiles_select_medecins"
  ON profiles FOR SELECT
  USING (
    role = 'medecin'
    OR auth.uid() = id
  );

-- ============ MEDECINS ============
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

-- ============ PATIENTS ============
CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les médecins peuvent voir les patients qui ont des RDV avec eux
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

-- ============ DOSSIERS MEDICAUX ============
CREATE POLICY "dossiers_select_patient"
  ON dossiers_medicaux FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "dossiers_update_patient"
  ON dossiers_medicaux FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "dossiers_insert_patient"
  ON dossiers_medicaux FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Les médecins peuvent voir les dossiers de leurs patients
CREATE POLICY "dossiers_select_medecin"
  ON dossiers_medicaux FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rendez_vous rv
      JOIN medecins m ON rv.medecin_id = m.id
      WHERE rv.patient_id = dossiers_medicaux.patient_id
      AND m.user_id = auth.uid()
    )
  );

-- ============ CONSULTATIONS ============
CREATE POLICY "consultations_select_patient"
  ON consultations FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "consultations_select_medecin"
  ON consultations FOR SELECT
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "consultations_insert_medecin"
  ON consultations FOR INSERT
  WITH CHECK (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "consultations_update_medecin"
  ON consultations FOR UPDATE
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

-- ============ ORDONNANCES ============
CREATE POLICY "ordonnances_select_patient"
  ON ordonnances FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ordonnances_select_medecin"
  ON ordonnances FOR SELECT
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ordonnances_insert_medecin"
  ON ordonnances FOR INSERT
  WITH CHECK (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ordonnances_update_medecin"
  ON ordonnances FOR UPDATE
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

-- ============ RENDEZ-VOUS ============
CREATE POLICY "rdv_select_patient"
  ON rendez_vous FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "rdv_select_medecin"
  ON rendez_vous FOR SELECT
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "rdv_insert_patient"
  ON rendez_vous FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "rdv_update_patient"
  ON rendez_vous FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "rdv_update_medecin"
  ON rendez_vous FOR UPDATE
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

-- ============ MESSAGES ============
CREATE POLICY "messages_select_sender"
  ON messages FOR SELECT
  USING (sender_id = auth.uid());

CREATE POLICY "messages_select_receiver"
  ON messages FOR SELECT
  USING (receiver_id = auth.uid());

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_receiver"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- ============ DOCUMENTS MEDICAUX ============
CREATE POLICY "documents_select_patient"
  ON documents_medicaux FOR SELECT
  USING (
    dossier_id IN (
      SELECT id FROM dossiers_medicaux dm
      JOIN patients p ON dm.patient_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_select_medecin"
  ON documents_medicaux FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR dossier_id IN (
      SELECT dm.id FROM dossiers_medicaux dm
      JOIN rendez_vous rv ON rv.patient_id = dm.patient_id
      JOIN medecins m ON rv.medecin_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_insert"
  ON documents_medicaux FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ============ ACCES DOSSIERS ============
CREATE POLICY "acces_select_patient"
  ON acces_dossiers FOR SELECT
  USING (
    granted_by IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "acces_select_medecin"
  ON acces_dossiers FOR SELECT
  USING (
    medecin_id IN (
      SELECT id FROM medecins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "acces_insert_patient"
  ON acces_dossiers FOR INSERT
  WITH CHECK (
    granted_by IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- ============ LOGS ACCES ============
CREATE POLICY "logs_select_patient"
  ON logs_acces FOR SELECT
  USING (
    dossier_id IN (
      SELECT id FROM dossiers_medicaux dm
      JOIN patients p ON dm.patient_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "logs_insert"
  ON logs_acces FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =======================
-- VÉRIFICATION
-- =======================

-- Vérifier que RLS est activé sur toutes les tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'medecins', 'patients', 'dossiers_medicaux', 
  'consultations', 'ordonnances', 'documents_medicaux', 
  'acces_dossiers', 'logs_acces', 'rendez_vous', 'messages'
);

-- Lister toutes les politiques actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
