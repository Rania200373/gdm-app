-- =====================================================
-- CRÉER CONVERSATION AVEC VOS VRAIS IDs
-- =====================================================

-- Utiliser vos IDs réels des screenshots
DO $func$
DECLARE
  v_medecin_profile_id UUID;
  v_patient_profile_id UUID;
  v_conversation_id UUID;
  v_patient_id UUID;
  v_medecin_id UUID;
BEGIN
  -- Trouver le médecin et le patient par rôle
  SELECT id INTO v_medecin_profile_id FROM profiles WHERE role = 'medecin' LIMIT 1;
  SELECT id INTO v_patient_profile_id FROM profiles WHERE role = 'patient' AND first_name = 'rania' LIMIT 1;
  
  RAISE NOTICE 'Medecin Profile ID: %, Patient Profile ID: %', v_medecin_profile_id, v_patient_profile_id;
  
  -- Récupérer les IDs depuis les tables patients/medecins
  SELECT id INTO v_patient_id FROM patients WHERE user_id = v_patient_profile_id LIMIT 1;
  SELECT id INTO v_medecin_id FROM medecins WHERE user_id = v_medecin_profile_id LIMIT 1;
  
  RAISE NOTICE 'Patient ID: %, Medecin ID: %', v_patient_id, v_medecin_id;
  
  -- Créer la conversation
  INSERT INTO conversations (patient_id, medecin_id)
  VALUES (v_patient_profile_id, v_medecin_profile_id)
  ON CONFLICT (patient_id, medecin_id) DO NOTHING
  RETURNING id INTO v_conversation_id;
  
  IF v_conversation_id IS NULL THEN
    SELECT id INTO v_conversation_id FROM conversations 
    WHERE patient_id = v_patient_profile_id AND medecin_id = v_medecin_profile_id;
  END IF;
  
  RAISE NOTICE 'Conversation ID: %', v_conversation_id;
  
  -- Insérer des messages
  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES
    (v_conversation_id, v_patient_profile_id, 'Bonjour Docteur, j''ai besoin d''un rendez-vous s''il vous plaît.', true, NOW() - INTERVAL '2 days'),
    (v_conversation_id, v_medecin_profile_id, 'Bonjour Rania, bien sûr. Quand seriez-vous disponible ?', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    (v_conversation_id, v_patient_profile_id, 'Je suis disponible cette semaine, mardi ou mercredi si possible.', true, NOW() - INTERVAL '1 day'),
    (v_conversation_id, v_medecin_profile_id, 'Parfait, je vous propose mardi à 10h. Quel est le motif de la consultation ?', true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    (v_conversation_id, v_patient_profile_id, 'C''est pour un suivi de mon traitement pour l''hypertension.', false, NOW() - INTERVAL '3 hours');
    
    RAISE NOTICE '✅ 5 messages créés avec succès !';
  END IF;
  
  -- Ajouter des données uniquement si le patient existe
  IF v_patient_id IS NOT NULL THEN
    -- Antécédents
    INSERT INTO antecedents (patient_id, type, titre, description, date_debut) VALUES
    (v_patient_id, 'maladie', 'Hypertension artérielle', 'Hypertension diagnostiquée en 2020, sous traitement', '2020-03-15'),
    (v_patient_id, 'chirurgie', 'Appendicectomie', 'Ablation de l''appendice en urgence', '2018-06-20'),
    (v_patient_id, 'traitement', 'Traitement pour la tension', 'Prise quotidienne de médicaments antihypertenseurs', '2020-03-15')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Antécédents créés !';
    
    -- Allergies
    INSERT INTO allergies (patient_id, nom, type, severite, reaction) VALUES
    (v_patient_id, 'Pénicilline', 'medicament', 'severe', 'Éruptions cutanées et difficultés respiratoires'),
    (v_patient_id, 'Arachides', 'alimentaire', 'moderee', 'Urticaire et démangeaisons')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Allergies créées !';
    
    -- Examens
    INSERT INTO examens (patient_id, medecin_id, type_examen, resultat, date_examen) VALUES
    (v_patient_id, v_medecin_id, 'Bilan sanguin', 'Cholestérol légèrement élevé. Glycémie normale.', '2024-11-15'),
    (v_patient_id, v_medecin_id, 'Électrocardiogramme', 'Résultats normaux. Aucune anomalie détectée.', '2024-10-20'),
    (v_patient_id, NULL, 'Radiographie thoracique', 'En attente des résultats', '2024-12-01')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Examens créés !';
  ELSE
    RAISE NOTICE '⚠️ Patient ID non trouvé dans la table patients';
  END IF;
  
  -- Disponibilités du médecin
  IF v_medecin_id IS NOT NULL THEN
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
    
    RAISE NOTICE '✅ Disponibilités créées !';
  ELSE
    RAISE NOTICE '⚠️ Medecin ID non trouvé dans la table medecins';
  END IF;
  
END $func$;

SELECT '🎉 Script terminé ! Rechargez la page Messages.' as message;
