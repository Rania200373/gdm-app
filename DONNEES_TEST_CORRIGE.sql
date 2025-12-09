-- =====================================================
-- DONNÉES DE TEST - VERSION CORRIGÉE
-- =====================================================

-- IMPORTANT: Remplacez les IDs ci-dessous par vos vrais IDs de la table profiles
-- Pour obtenir vos IDs, exécutez d'abord:
-- SELECT id, first_name, last_name, role FROM profiles;

-- 1. Créer une conversation entre le médecin et le patient
-- ÉTAPE 1: Récupérez vos IDs de profiles
DO $$
DECLARE
  v_patient_profile_id UUID;
  v_medecin_profile_id UUID;
  v_patient_id UUID;
  v_medecin_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Trouver les profiles par nom (ajustez selon vos données)
  SELECT id INTO v_patient_profile_id FROM profiles 
  WHERE role = 'patient' AND first_name = 'rania' AND last_name = 'zekri'
  LIMIT 1;
  
  SELECT id INTO v_medecin_profile_id FROM profiles 
  WHERE role = 'medecin' AND first_name = 'rania' AND last_name = 'zekri'
  LIMIT 1;
  
  -- Si les profiles existent
  IF v_patient_profile_id IS NOT NULL AND v_medecin_profile_id IS NOT NULL THEN
    
    -- Créer la conversation
    INSERT INTO conversations (patient_id, medecin_id)
    VALUES (v_patient_profile_id, v_medecin_profile_id)
    ON CONFLICT (patient_id, medecin_id) DO NOTHING
    RETURNING id INTO v_conversation_id;
    
    -- Si la conversation n'a pas été créée (conflit), la récupérer
    IF v_conversation_id IS NULL THEN
      SELECT id INTO v_conversation_id FROM conversations 
      WHERE patient_id = v_patient_profile_id AND medecin_id = v_medecin_profile_id;
    END IF;
    
    -- Insérer des messages
    INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES
    (v_conversation_id, v_patient_profile_id, 'Bonjour Docteur, j''ai besoin d''un rendez-vous s''il vous plaît.', true, NOW() - INTERVAL '2 days'),
    (v_conversation_id, v_medecin_profile_id, 'Bonjour, bien sûr. Quand seriez-vous disponible ?', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (v_conversation_id, v_patient_profile_id, 'Je suis disponible cette semaine, mardi ou mercredi si possible.', true, NOW() - INTERVAL '1 day'),
    (v_conversation_id, v_medecin_profile_id, 'Parfait, je vous propose mardi à 10h. Quel est le motif de la consultation ?', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    (v_conversation_id, v_patient_profile_id, 'C''est pour un suivi de mon traitement pour l''hypertension.', false, NOW() - INTERVAL '3 hours');
    
    RAISE NOTICE 'Messages créés avec succès !';
    
    -- Récupérer les IDs patients/medecins
    SELECT id INTO v_patient_id FROM patients WHERE user_id = v_patient_profile_id LIMIT 1;
    SELECT id INTO v_medecin_id FROM medecins WHERE user_id = v_medecin_profile_id LIMIT 1;
    
    IF v_patient_id IS NOT NULL THEN
      -- Ajouter des antécédents médicaux
      INSERT INTO antecedents (patient_id, type, titre, description, date_debut) VALUES
      (v_patient_id, 'maladie', 'Hypertension artérielle', 'Hypertension diagnostiquée en 2020, sous traitement', '2020-03-15'),
      (v_patient_id, 'chirurgie', 'Appendicectomie', 'Ablation de l''appendice en urgence', '2018-06-20'),
      (v_patient_id, 'traitement', 'Traitement pour la tension', 'Prise quotidienne de médicaments antihypertenseurs', '2020-03-15');
      
      RAISE NOTICE 'Antécédents créés avec succès !';
      
      -- Ajouter des allergies
      INSERT INTO allergies (patient_id, nom, type, severite, reaction) VALUES
      (v_patient_id, 'Pénicilline', 'medicament', 'severe', 'Éruptions cutanées et difficultés respiratoires'),
      (v_patient_id, 'Arachides', 'alimentaire', 'moderee', 'Urticaire et démangeaisons');
      
      RAISE NOTICE 'Allergies créées avec succès !';
      
      -- Ajouter des examens médicaux
      INSERT INTO examens (patient_id, medecin_id, type_examen, resultat, date_examen) VALUES
      (v_patient_id, v_medecin_id, 'Bilan sanguin', 'Cholestérol légèrement élevé. Glycémie normale.', '2024-11-15'),
      (v_patient_id, v_medecin_id, 'Électrocardiogramme', 'Résultats normaux. Aucune anomalie détectée.', '2024-10-20'),
      (v_patient_id, NULL, 'Radiographie thoracique', 'En attente des résultats', '2024-12-01');
      
      RAISE NOTICE 'Examens créés avec succès !';
    END IF;
    
    IF v_medecin_id IS NOT NULL THEN
      -- Définir les disponibilités du médecin
      INSERT INTO disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation) VALUES
      (v_medecin_id, 1, '09:00', '12:00', 30),
      (v_medecin_id, 1, '14:00', '17:00', 30),
      (v_medecin_id, 2, '09:00', '12:00', 30),
      (v_medecin_id, 2, '14:00', '17:00', 30),
      (v_medecin_id, 3, '09:00', '12:00', 30),
      (v_medecin_id, 3, '14:00', '17:00', 30),
      (v_medecin_id, 4, '09:00', '12:00', 30),
      (v_medecin_id, 4, '14:00', '17:00', 30),
      (v_medecin_id, 5, '09:00', '12:00', 30)
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'Disponibilités créées avec succès !';
    END IF;
    
  ELSE
    RAISE NOTICE 'Profiles patient ou médecin non trouvés. Vérifiez les noms.';
  END IF;
  
END $$;

-- Mettre à jour un rendez-vous existant (si la table rendez_vous existe et a des données)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rendez_vous') THEN
    UPDATE rendez_vous 
    SET 
      motif = 'Consultation de suivi - Hypertension',
      type_consultation = 'suivi',
      notes = 'Patient sous traitement depuis 2020'
    WHERE id = (
      SELECT id FROM rendez_vous 
      WHERE date_heure >= CURRENT_DATE 
      ORDER BY date_heure ASC 
      LIMIT 1
    );
    RAISE NOTICE 'Rendez-vous mis à jour avec succès !';
  END IF;
END $$;

SELECT 'Script terminé ! Vérifiez les messages NOTICE ci-dessus.' as message;
