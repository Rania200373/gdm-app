-- =====================================================
-- CRÉATION DES TABLES POUR MESSAGERIE, DOSSIERS ET RDV
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
  type VARCHAR(50) NOT NULL, -- 'maladie', 'chirurgie', 'allergie', 'traitement'
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Table des allergies (plus détaillée)
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'medicament', 'alimentaire', 'environnement', 'autre'
  severite VARCHAR(20), -- 'legere', 'moderee', 'severe'
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

-- 6. Table des disponibilités médecin (pour système RDV)
CREATE TABLE IF NOT EXISTS disponibilites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medecin_id UUID NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
  jour_semaine INTEGER NOT NULL, -- 0=Dimanche, 1=Lundi, etc.
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  duree_consultation INTEGER DEFAULT 30, -- en minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(medecin_id, jour_semaine, heure_debut)
);

-- 7. Amélioration de la table rendez_vous existante
-- Ajout de colonnes si elles n'existent pas
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

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_medecin ON conversations(medecin_id);
CREATE INDEX IF NOT EXISTS idx_antecedents_patient ON antecedents(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_examens_patient ON examens(patient_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_medecin ON disponibilites(medecin_id);

-- Désactiver temporairement RLS sur les nouvelles tables
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE antecedents DISABLE ROW LEVEL SECURITY;
ALTER TABLE allergies DISABLE ROW LEVEL SECURITY;
ALTER TABLE examens DISABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilites DISABLE ROW LEVEL SECURITY;

-- Fonction pour mettre à jour updated_at dans conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Récupérer l'ID de la conversation depuis le nouveau message
  conv_id := NEW.conversation_id;
  
  -- Mettre à jour le timestamp de la conversation
  UPDATE conversations 
  SET updated_at = TIMEZONE('utc', NOW())
  WHERE id = conv_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, on continue quand même (ne pas bloquer l'insertion du message)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at quand un nouveau message arrive
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

COMMENT ON TABLE conversations IS 'Table des conversations entre patients et médecins';
COMMENT ON TABLE messages IS 'Table des messages dans les conversations';
COMMENT ON TABLE antecedents IS 'Table des antécédents médicaux des patients';
COMMENT ON TABLE allergies IS 'Table des allergies des patients';
COMMENT ON TABLE examens IS 'Table des examens médicaux et résultats';
COMMENT ON TABLE disponibilites IS 'Table des disponibilités des médecins pour les RDV';
