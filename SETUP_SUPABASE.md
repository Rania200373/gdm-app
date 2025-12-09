# Guide de Configuration Supabase - GDM

## Étape 1 : Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Inscrivez-vous avec GitHub ou email
4. Choisissez le **plan gratuit** (Free Tier)

## Étape 2 : Créer un nouveau projet

1. Cliquez sur "New Project"
2. Remplissez les informations :
   - **Name** : `gdm-medical`
   - **Database Password** : Générez un mot de passe fort (sauvegardez-le !)
   - **Region** : Choisissez la plus proche (ex: `West EU (London)` pour l'Europe)
   - **Pricing Plan** : Free

3. Cliquez sur "Create new project"
4. Attendez 2-3 minutes pendant la création

## Étape 3 : Récupérer les clés API

Une fois le projet créé :

1. Dans le menu latéral, allez dans **Settings** → **API**
2. Notez ces informations importantes :
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (gardez secret !)
   ```

3. Ces clés seront utilisées dans le fichier `.env` du projet

## Étape 4 : Configuration de la base de données

### 4.1 Accéder à l'éditeur SQL

1. Dans le menu latéral, cliquez sur **SQL Editor**
2. Créez une nouvelle requête

### 4.2 Créer les tables principales

Copiez et exécutez ce script SQL :

```sql
-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'medecin', 'patient')) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des médecins
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

-- Table des patients
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_naissance DATE NOT NULL,
  groupe_sanguin TEXT CHECK (groupe_sanguin IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[],
  numero_secu TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des dossiers médicaux
CREATE TABLE dossiers_medicaux (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medecin_traitant_id UUID REFERENCES medecins(id),
  antecedents_medicaux TEXT,
  antecedents_chirurgicaux TEXT,
  contacts_urgence JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id)
);

-- Table des consultations
CREATE TABLE consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id) ON DELETE CASCADE NOT NULL,
  medecin_id UUID REFERENCES medecins(id) NOT NULL,
  date_consultation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  motif TEXT NOT NULL,
  examen_clinique TEXT,
  diagnostic TEXT,
  notes TEXT,
  constantes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des ordonnances
CREATE TABLE ordonnances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medecin_id UUID REFERENCES medecins(id) NOT NULL,
  date_prescription TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_expiration TIMESTAMP WITH TIME ZONE,
  medicaments JSONB[] NOT NULL,
  instructions TEXT,
  signature_electronique TEXT,
  qr_code TEXT,
  statut TEXT CHECK (statut IN ('active', 'terminee', 'renouvelee')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des documents médicaux
CREATE TABLE documents_medicaux (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id) ON DELETE CASCADE NOT NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  type TEXT CHECK (type IN ('analyse', 'radiographie', 'ordonnance', 'certificat', 'autre')) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des accès aux dossiers
CREATE TABLE acces_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id) ON DELETE CASCADE NOT NULL,
  medecin_id UUID REFERENCES medecins(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES patients(id) NOT NULL,
  type_acces TEXT CHECK (type_acces IN ('lecture', 'modification')) DEFAULT 'lecture',
  date_debut TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(dossier_id, medecin_id)
);

-- Table des logs d'accès
CREATE TABLE logs_acces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des rendez-vous
CREATE TABLE rendez_vous (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medecin_id UUID REFERENCES medecins(id) ON DELETE CASCADE NOT NULL,
  date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
  duree INTEGER DEFAULT 30,
  motif TEXT,
  statut TEXT CHECK (statut IN ('confirme', 'annule', 'termine', 'en_attente')) DEFAULT 'en_attente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des messages
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dossier_id UUID REFERENCES dossiers_medicaux(id) ON DELETE SET NULL,
  sujet TEXT NOT NULL,
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  priorite TEXT CHECK (priorite IN ('normal', 'urgent')) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer des index pour les performances
CREATE INDEX idx_consultations_dossier ON consultations(dossier_id);
CREATE INDEX idx_consultations_medecin ON consultations(medecin_id);
CREATE INDEX idx_consultations_date ON consultations(date_consultation);
CREATE INDEX idx_ordonnances_patient ON ordonnances(patient_id);
CREATE INDEX idx_ordonnances_medecin ON ordonnances(medecin_id);
CREATE INDEX idx_ordonnances_statut ON ordonnances(statut);
CREATE INDEX idx_documents_dossier ON documents_medicaux(dossier_id);
CREATE INDEX idx_rdv_patient ON rendez_vous(patient_id);
CREATE INDEX idx_rdv_medecin ON rendez_vous(medecin_id);
CREATE INDEX idx_rdv_date ON rendez_vous(date_heure);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_logs_dossier ON logs_acces(dossier_id);
CREATE INDEX idx_logs_timestamp ON logs_acces(timestamp);
```

## Étape 5 : Configurer Row Level Security (RLS)

**⚠️ Important:** Utilisez le fichier `SCRIPT_RLS_CORRECTION.sql` pour une configuration complète et corrigée.

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medecins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers_medicaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordonnances ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_medicaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE acces_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_acces ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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

-- Les utilisateurs peuvent voir les profils des médecins
CREATE POLICY "profiles_select_medecins"
  ON profiles FOR SELECT
  USING (role = 'medecin' OR auth.uid() = id);

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
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "dossiers_update_patient"
  ON dossiers_medicaux FOR UPDATE
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "dossiers_insert_patient"
  ON dossiers_medicaux FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

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
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "consultations_select_medecin"
  ON consultations FOR SELECT
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

CREATE POLICY "consultations_insert_medecin"
  ON consultations FOR INSERT
  WITH CHECK (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

CREATE POLICY "consultations_update_medecin"
  ON consultations FOR UPDATE
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

-- ============ ORDONNANCES ============
CREATE POLICY "ordonnances_select_patient"
  ON ordonnances FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "ordonnances_select_medecin"
  ON ordonnances FOR SELECT
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

CREATE POLICY "ordonnances_insert_medecin"
  ON ordonnances FOR INSERT
  WITH CHECK (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

CREATE POLICY "ordonnances_update_medecin"
  ON ordonnances FOR UPDATE
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

-- ============ RENDEZ-VOUS ============
CREATE POLICY "rdv_select_patient"
  ON rendez_vous FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "rdv_select_medecin"
  ON rendez_vous FOR SELECT
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

CREATE POLICY "rdv_insert_patient"
  ON rendez_vous FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "rdv_update_patient"
  ON rendez_vous FOR UPDATE
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "rdv_update_medecin"
  ON rendez_vous FOR UPDATE
  USING (medecin_id IN (SELECT id FROM medecins WHERE user_id = auth.uid()));

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
```

## Étape 6 : Configurer Storage

1. Dans le menu latéral, cliquez sur **Storage**
2. Créez un nouveau bucket : `documents-medicaux`
3. Configurez-le en **privé** (pas public)
4. Ajoutez des politiques de storage :

```sql
-- Politique de lecture des documents
CREATE POLICY "Les utilisateurs peuvent lire leurs propres documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents-medicaux' 
  AND (
    -- Les patients peuvent lire leurs documents
    (storage.foldername(name))[1] = auth.uid()::text
    OR 
    -- Les médecins peuvent lire les documents des dossiers auxquels ils ont accès
    (storage.foldername(name))[1] IN (
      SELECT patient_id::text FROM dossiers_medicaux dm
      JOIN acces_dossiers ad ON dm.id = ad.dossier_id
      WHERE ad.medecin_id = auth.uid() AND ad.revoked = false
    )
  )
);

-- Politique d'upload des documents
CREATE POLICY "Les médecins peuvent uploader des documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents-medicaux' 
  AND auth.uid() IN (SELECT id FROM medecins)
);
```

## Étape 7 : Configurer l'authentification

1. Allez dans **Authentication** → **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Optionnel : Activez **Google OAuth** ou **GitHub**

### Configuration des emails

1. Allez dans **Authentication** → **Email Templates**
2. Personnalisez les templates :
   - Confirm signup
   - Reset password
   - Magic link

## Étape 8 : Fonction de trigger pour créer automatiquement un profil

```sql
-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour créer automatiquement un dossier médical pour les patients
CREATE OR REPLACE FUNCTION public.handle_new_patient()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dossiers_medicaux (patient_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la création d'un patient
CREATE TRIGGER on_patient_created
  AFTER INSERT ON patients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_patient();
```

## Étape 9 : Variables d'environnement

Créez un fichier `.env.local` dans votre projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## Étape 10 : Test de la configuration

Dans le SQL Editor, testez avec quelques insertions :

```sql
-- Insérer un médecin test (après inscription via Auth)
-- Vous devrez d'abord créer un utilisateur via l'interface Auth

-- Vérifier que tout fonctionne
SELECT * FROM profiles;
SELECT * FROM medecins;
SELECT * FROM patients;
```

---

## ✅ Configuration Supabase terminée !

Votre backend est maintenant prêt. Passez à la création du frontend.

## Prochaines étapes

1. Installer et configurer le projet frontend (Next.js/React)
2. Installer le client Supabase
3. Créer les pages d'authentification
4. Créer les interfaces utilisateur

## Ressources utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
