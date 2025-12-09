-- =====================================================
-- DONNÉES DE TEST POUR MESSAGERIE, DOSSIERS ET RDV
-- =====================================================

-- 1. Créer une conversation entre le médecin et le patient
INSERT INTO conversations (patient_id, medecin_id)
SELECT 
  (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com'),
  (SELECT id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn')
WHERE NOT EXISTS (
  SELECT 1 FROM conversations 
  WHERE patient_id = (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com')
  AND medecin_id = (SELECT id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn')
);

-- 2. Ajouter quelques messages de test
DO $$
DECLARE
  v_conversation_id UUID;
  v_medecin_id UUID;
  v_patient_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO v_conversation_id FROM conversations 
  WHERE patient_id = (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com')
  AND medecin_id = (SELECT id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn');
  
  SELECT id INTO v_medecin_id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn';
  SELECT id INTO v_patient_id FROM profiles WHERE email = 'raniazekri95@gmail.com';
  
  -- Insérer des messages
  INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES
  (v_conversation_id, v_patient_id, 'Bonjour Docteur, j''ai besoin d''un rendez-vous s''il vous plaît.', true, NOW() - INTERVAL '2 days'),
  (v_conversation_id, v_medecin_id, 'Bonjour, bien sûr. Quand seriez-vous disponible ?', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
  (v_conversation_id, v_patient_id, 'Je suis disponible cette semaine, mardi ou mercredi si possible.', true, NOW() - INTERVAL '1 day'),
  (v_conversation_id, v_medecin_id, 'Parfait, je vous propose mardi à 10h. Quel est le motif de la consultation ?', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
  (v_conversation_id, v_patient_id, 'C''est pour un suivi de mon traitement pour l''hypertension.', false, NOW() - INTERVAL '3 hours');
END $$;

-- 3. Ajouter des antécédents médicaux
DO $$
DECLARE
  v_patient_id UUID;
BEGIN
  SELECT id INTO v_patient_id FROM patients 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com');
  
  INSERT INTO antecedents (patient_id, type, titre, description, date_debut) VALUES
  (v_patient_id, 'maladie', 'Hypertension artérielle', 'Hypertension diagnostiquée en 2020, sous traitement', '2020-03-15'),
  (v_patient_id, 'chirurgie', 'Appendicectomie', 'Ablation de l''appendice en urgence', '2018-06-20'),
  (v_patient_id, 'traitement', 'Traitement pour la tension', 'Prise quotidienne de médicaments antihypertenseurs', '2020-03-15');
END $$;

-- 4. Ajouter des allergies
DO $$
DECLARE
  v_patient_id UUID;
BEGIN
  SELECT id INTO v_patient_id FROM patients 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com');
  
  INSERT INTO allergies (patient_id, nom, type, severite, reaction) VALUES
  (v_patient_id, 'Pénicilline', 'medicament', 'severe', 'Éruptions cutanées et difficultés respiratoires'),
  (v_patient_id, 'Arachides', 'alimentaire', 'moderee', 'Urticaire et démangeaisons');
END $$;

-- 5. Ajouter des examens médicaux
DO $$
DECLARE
  v_patient_id UUID;
  v_medecin_id UUID;
BEGIN
  SELECT id INTO v_patient_id FROM patients 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'raniazekri95@gmail.com');
  
  SELECT id INTO v_medecin_id FROM medecins 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn');
  
  INSERT INTO examens (patient_id, medecin_id, type_examen, resultat, date_examen) VALUES
  (v_patient_id, v_medecin_id, 'Bilan sanguin', 'Cholestérol légèrement élevé. Glycémie normale.', '2024-11-15'),
  (v_patient_id, v_medecin_id, 'Électrocardiogramme', 'Résultats normaux. Aucune anomalie détectée.', '2024-10-20'),
  (v_patient_id, NULL, 'Radiographie thoracique', 'En attente des résultats', '2024-12-01');
END $$;

-- 6. Définir les disponibilités du médecin
DO $$
DECLARE
  v_medecin_id UUID;
BEGIN
  SELECT id INTO v_medecin_id FROM medecins 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'rania.zekri@issatm.ucar.tn');
  
  -- Lundi à Vendredi: 9h-12h et 14h-17h
  INSERT INTO disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation) VALUES
  (v_medecin_id, 1, '09:00', '12:00', 30), -- Lundi matin
  (v_medecin_id, 1, '14:00', '17:00', 30), -- Lundi après-midi
  (v_medecin_id, 2, '09:00', '12:00', 30), -- Mardi matin
  (v_medecin_id, 2, '14:00', '17:00', 30), -- Mardi après-midi
  (v_medecin_id, 3, '09:00', '12:00', 30), -- Mercredi matin
  (v_medecin_id, 3, '14:00', '17:00', 30), -- Mercredi après-midi
  (v_medecin_id, 4, '09:00', '12:00', 30), -- Jeudi matin
  (v_medecin_id, 4, '14:00', '17:00', 30), -- Jeudi après-midi
  (v_medecin_id, 5, '09:00', '12:00', 30)  -- Vendredi matin seulement
  ON CONFLICT DO NOTHING;
END $$;

-- 7. Mettre à jour un rendez-vous existant avec plus de détails
UPDATE rendez_vous 
SET 
  motif = 'Consultation de suivi - Hypertension',
  type_consultation = 'suivi',
  notes = 'Patient sous traitement depuis 2020'
WHERE id = (
  SELECT id FROM rendez_vous 
  WHERE date_rdv >= CURRENT_DATE 
  ORDER BY date_rdv ASC 
  LIMIT 1
);

SELECT 'Données de test créées avec succès !' as message;
