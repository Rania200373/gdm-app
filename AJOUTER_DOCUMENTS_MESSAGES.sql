-- Ajouter des colonnes pour les pièces jointes dans les messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS type_message VARCHAR(50) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS document_id UUID,
ADD COLUMN IF NOT EXISTS document_data JSONB;

-- Types possibles: 'text', 'ordonnance', 'examen', 'document'

-- Créer un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_messages_document_type ON messages(document_type);
CREATE INDEX IF NOT EXISTS idx_messages_document_id ON messages(document_id);

-- Commentaires
COMMENT ON COLUMN messages.type_message IS 'Type de message: text, ordonnance, examen, document';
COMMENT ON COLUMN messages.document_type IS 'Type de document partagé: ordonnance, examen, rapport';
COMMENT ON COLUMN messages.document_id IS 'ID du document référencé (ordonnance_id, examen_id, etc.)';
COMMENT ON COLUMN messages.document_data IS 'Données du document en JSON pour affichage rapide';

SELECT 'Colonnes ajoutées avec succès aux messages pour les documents médicaux !' as message;
