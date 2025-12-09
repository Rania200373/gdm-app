-- =====================================================
-- CRÉATION DES TABLES - VERSION SIMPLIFIÉE
-- =====================================================

-- 1. Table des conversations (messagerie)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medecin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(patient_id, medecin_id)
);

-- 2. Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Table des antécédents médicaux
CREATE TABLE IF NOT EXISTS antecedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Table des allergies
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  severite VARCHAR(20),
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Table des examens médicaux
CREATE TABLE IF NOT EXISTS examens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id UUID REFERENCES medecins(id) ON DELETE SET NULL,
  type_examen VARCHAR(100) NOT NULL,
  resultat TEXT,
  fichier_url TEXT,
  date_examen DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Table des disponibilités médecin
CREATE TABLE IF NOT EXISTS disponibilites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medecin_id UUID NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
  jour_semaine INTEGER NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  duree_consultation INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(medecin_id, jour_semaine, heure_debut)
);

-- 7. Amélioration de la table rendez_vous
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='rendez_vous' AND column_name='motif') THEN
    ALTER TABLE rendez_vous ADD COLUMN motif TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='rendez_vous' AND column_name='type_consultation') THEN
    ALTER TABLE rendez_vous ADD COLUMN type_consultation VARCHAR(50) DEFAULT 'consultation';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='rendez_vous' AND column_name='notes') THEN
    ALTER TABLE rendez_vous ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_medecin ON conversations(medecin_id);
CREATE INDEX IF NOT EXISTS idx_antecedents_patient ON antecedents(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_examens_patient ON examens(patient_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_medecin ON disponibilites(medecin_id);

-- Désactiver RLS temporairement
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE antecedents DISABLE ROW LEVEL SECURITY;
ALTER TABLE allergies DISABLE ROW LEVEL SECURITY;
ALTER TABLE examens DISABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilites DISABLE ROW LEVEL SECURITY;

SELECT 'Tables créées avec succès !' as message;
