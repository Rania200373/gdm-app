-- Script simplifié pour ajouter des données de test
-- Version sans consultations (à ajouter manuellement via l'interface)

-- =====================================================
-- ÉTAPE 1: Créer les profils (sans toucher à auth.users)
-- =====================================================

-- Profils des médecins
INSERT INTO public.profiles (id, first_name, last_name, phone, role, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Jean', 'Martin', '0612345678', 'medecin', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Sophie', 'Dubois', '0623456789', 'medecin', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Pierre', 'Bernard', '0634567890', 'medecin', NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- Profils des patients
INSERT INTO public.profiles (id, first_name, last_name, phone, role, created_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'Marie', 'Dupont', '0645678901', 'patient', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Thomas', 'Leroy', '0656789012', 'patient', NOW()),
  ('66666666-6666-6666-6666-666666666666', 'Emma', 'Moreau', '0667890123', 'patient', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'Lucas', 'Simon', '0678901234', 'patient', NOW()),
  ('88888888-8888-8888-8888-888888888888', 'Julie', 'Laurent', '0689012345', 'patient', NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- =====================================================
-- ÉTAPE 2: Créer les médecins
-- =====================================================

INSERT INTO public.medecins (id, user_id, specialite, numero_ordre, adresse_cabinet, ville, code_postal, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Médecine Générale', '123456', '15 Rue de la Santé', 'Paris', '75001', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Cardiologie', '234567', '28 Avenue du Cœur', 'Lyon', '69002', NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Pédiatrie', '345678', '42 Boulevard des Enfants', 'Marseille', '13001', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  specialite = EXCLUDED.specialite,
  numero_ordre = EXCLUDED.numero_ordre,
  adresse_cabinet = EXCLUDED.adresse_cabinet,
  ville = EXCLUDED.ville,
  code_postal = EXCLUDED.code_postal;

-- =====================================================
-- ÉTAPE 3: Créer les patients
-- =====================================================

INSERT INTO public.patients (id, user_id, date_naissance, groupe_sanguin, numero_secu, created_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '1990-05-15', 'A+', '190056789012345', NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', '1985-08-22', 'O+', '185086789012345', NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', '1995-03-10', 'B+', '195036789012345', NOW()),
  ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', '1988-11-30', 'AB+', '188116789012345', NOW()),
  ('10101010-1010-1010-1010-101010101010', '88888888-8888-8888-8888-888888888888', '1992-07-18', 'A-', '192076789012345', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  date_naissance = EXCLUDED.date_naissance,
  groupe_sanguin = EXCLUDED.groupe_sanguin,
  numero_secu = EXCLUDED.numero_secu;

-- =====================================================
-- ÉTAPE 4: Ajouter des disponibilités
-- =====================================================

-- Dr. Martin (Lundi à Vendredi, 9h-12h et 14h-18h)
INSERT INTO public.disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '12:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '14:00', '18:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '12:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '14:00', '18:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '12:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '14:00', '18:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '09:00', '12:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '14:00', '18:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '09:00', '12:00', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '14:00', '17:00', 30)
ON CONFLICT DO NOTHING;

-- Dr. Dubois (Lundi, Mercredi, Vendredi)
INSERT INTO public.disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '15:00', '19:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '15:00', '19:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '15:00', '19:00', 30)
ON CONFLICT DO NOTHING;

-- Dr. Bernard (Mardi, Jeudi, Samedi)
INSERT INTO public.disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '08:30', '12:30', 20),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '08:30', '12:30', 20),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 6, '08:30', '12:30', 20)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 5: Créer des rendez-vous
-- =====================================================

INSERT INTO public.rendez_vous (medecin_id, patient_id, date_heure, duree, motif, statut, created_at)
VALUES 
  -- RDV passés
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '7 days', 30, 'Consultation de suivi', 'termine', NOW() - INTERVAL '7 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '14 days', 30, 'Contrôle cardiaque', 'termine', NOW() - INTERVAL '14 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NOW() - INTERVAL '3 days', 20, 'Vaccination', 'termine', NOW() - INTERVAL '3 days'),
  
  -- RDV à venir
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 30, 'Consultation générale', 'confirme', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '99999999-9999-9999-9999-999999999999', NOW() + INTERVAL '3 days' + INTERVAL '15 hours', 30, 'Bilan cardiaque', 'confirme', NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NOW() + INTERVAL '5 days' + INTERVAL '9 hours', 20, 'Contrôle pédiatrique', 'en_attente', NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10101010-1010-1010-1010-101010101010', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', 30, 'Mal de tête persistant', 'confirme', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 6: Créer des ordonnances
-- =====================================================

INSERT INTO public.ordonnances (medecin_id, patient_id, date_prescription, medicaments, instructions, statut)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 
    NOW() - INTERVAL '7 days',
    '[
      {"nom": "Paracétamol", "dosage": "500mg", "posologie": "1 comprimé 3 fois par jour", "duree": "7 jours"},
      {"nom": "Ibuprofène", "dosage": "200mg", "posologie": "1 comprimé au besoin", "duree": "7 jours"}
    ]'::jsonb,
    'Prendre avec de l''eau. Repos recommandé.',
    'active'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 
    NOW() - INTERVAL '14 days',
    '[
      {"nom": "Amlodipine", "dosage": "5mg", "posologie": "1 comprimé le matin", "duree": "90 jours"},
      {"nom": "Aspirine", "dosage": "100mg", "posologie": "1 comprimé le soir", "duree": "90 jours"}
    ]'::jsonb,
    'Traitement à long terme. Contrôle tension régulier.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 7: Créer des examens
-- =====================================================

INSERT INTO public.examens (patient_id, medecin_id, type_examen, date_examen, resultat)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ECG', NOW() - INTERVAL '14 days', 'Rythme sinusal normal. Tracé normal, pas d''anomalie détectée'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Prise de sang', NOW() - INTERVAL '7 days', 'Glycémie : 0.95 g/L, Cholestérol : 1.85 g/L. Valeurs dans les normes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test auditif', NOW() - INTERVAL '10 days', 'Audition normale pour l''âge. Aucun problème détecté')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 8: Créer des conversations
-- =====================================================

INSERT INTO public.conversations (medecin_id, patient_id, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 9: Créer des antécédents médicaux
-- =====================================================

INSERT INTO public.antecedents (patient_id, type, titre, description, date_debut)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'maladie', 'Asthme léger', 'Asthme diagnostiqué en 2015, bien contrôlé avec traitement', '2015-03-01'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'maladie', 'Hypertension artérielle', 'Hypertension en cours de traitement médicamenteux', '2018-06-15'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'chirurgie', 'Appendicectomie', 'Intervention chirurgicale pour appendicite aiguë', '2010-09-20'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'allergie', 'Allergie aux arachides', 'Allergie sévère avec risque de choc anaphylactique', '2000-01-01'),
  ('99999999-9999-9999-9999-999999999999', 'maladie', 'Diabète type 2', 'Diabète de type 2 diagnostiqué en 2020', '2020-11-10')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 10: Créer des allergies
-- =====================================================

INSERT INTO public.allergies (patient_id, nom, type, reaction, severite)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pollen', 'Pollen', 'Rhinite allergique. Principalement au printemps', 'moderee'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Pénicilline', 'Médicament', 'Éruption cutanée. Utiliser des alternatives', 'severe'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Arachides', 'Alimentaire', 'Choc anaphylactique. Port d''EpiPen recommandé', 'severe'),
  ('10101010-1010-1010-1010-101010101010', 'Lactose', 'Alimentaire', 'Troubles digestifs. Éviter les produits laitiers', 'legere')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 11: Créer des dossiers médicaux
-- =====================================================

INSERT INTO public.dossiers_medicaux (patient_id, antecedents_medicaux, antecedents_chirurgicaux, contacts_urgence)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Asthme léger diagnostiqué en 2015', NULL, '{"nom": "Dupont Pierre", "relation": "Époux", "telephone": "0645678900"}'::jsonb),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hypertension artérielle depuis 2018', 'Appendicectomie en 2010', '{"nom": "Leroy Marie", "relation": "Épouse", "telephone": "0656789000"}'::jsonb),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, NULL, '{"nom": "Moreau Jean", "relation": "Père", "telephone": "0667890100"}'::jsonb),
  ('99999999-9999-9999-9999-999999999999', 'Diabète type 2 depuis 2020', NULL, '{"nom": "Simon Claire", "relation": "Épouse", "telephone": "0678901200"}'::jsonb),
  ('10101010-1010-1010-1010-101010101010', 'Intolérance au lactose', NULL, '{"nom": "Laurent Marc", "relation": "Époux", "telephone": "0689012300"}'::jsonb)
ON CONFLICT (patient_id) DO UPDATE SET
  antecedents_medicaux = EXCLUDED.antecedents_medicaux,
  antecedents_chirurgicaux = EXCLUDED.antecedents_chirurgicaux,
  contacts_urgence = EXCLUDED.contacts_urgence;

-- =====================================================
-- ÉTAPE 12: Créer des messages
-- =====================================================

-- Messages pour Conversation 1 : Dr Martin et Marie Dupont
INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '44444444-4444-4444-4444-444444444444',
  'Bonjour Docteur, j''''ai une question concernant mon ordonnance.',
  true,
  NOW() - INTERVAL '2 days'
FROM conversations c
WHERE c.medecin_id = '11111111-1111-1111-1111-111111111111' 
  AND c.patient_id = '44444444-4444-4444-4444-444444444444'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '11111111-1111-1111-1111-111111111111',
  'Bonjour Marie, je vous écoute. Que souhaitez-vous savoir ?',
  true,
  NOW() - INTERVAL '2 days' + INTERVAL '1 hour'
FROM conversations c
WHERE c.medecin_id = '11111111-1111-1111-1111-111111111111' 
  AND c.patient_id = '44444444-4444-4444-4444-444444444444'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '44444444-4444-4444-4444-444444444444',
  'Dois-je prendre le paracétamol avant ou après les repas ?',
  true,
  NOW() - INTERVAL '2 days' + INTERVAL '2 hours'
FROM conversations c
WHERE c.medecin_id = '11111111-1111-1111-1111-111111111111' 
  AND c.patient_id = '44444444-4444-4444-4444-444444444444'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '11111111-1111-1111-1111-111111111111',
  'Vous pouvez le prendre indifféremment, mais après les repas est préférable pour éviter les irritations gastriques.',
  false,
  NOW() - INTERVAL '2 days' + INTERVAL '2 hours' + INTERVAL '15 minutes'
FROM conversations c
WHERE c.medecin_id = '11111111-1111-1111-1111-111111111111' 
  AND c.patient_id = '44444444-4444-4444-4444-444444444444'
ON CONFLICT DO NOTHING;

-- Messages pour Conversation 2 : Dr Dubois et Thomas Leroy
INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '22222222-2222-2222-2222-222222222222',
  'Bonjour Thomas, voici votre ordonnance pour le traitement de l''''hypertension.',
  true,
  NOW() - INTERVAL '1 day'
FROM conversations c
WHERE c.medecin_id = '22222222-2222-2222-2222-222222222222' 
  AND c.patient_id = '55555555-5555-5555-5555-555555555555'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '55555555-5555-5555-5555-555555555555',
  'Merci Docteur. Combien de temps dois-je suivre ce traitement ?',
  true,
  NOW() - INTERVAL '1 day' + INTERVAL '3 hours'
FROM conversations c
WHERE c.medecin_id = '22222222-2222-2222-2222-222222222222' 
  AND c.patient_id = '55555555-5555-5555-5555-555555555555'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '22222222-2222-2222-2222-222222222222',
  'C''''est un traitement de fond à prendre quotidiennement. Nous ferons un point dans 3 mois.',
  false,
  NOW() - INTERVAL '1 day' + INTERVAL '4 hours'
FROM conversations c
WHERE c.medecin_id = '22222222-2222-2222-2222-222222222222' 
  AND c.patient_id = '55555555-5555-5555-5555-555555555555'
ON CONFLICT DO NOTHING;

-- Messages pour Conversation 3 : Dr Bernard et Emma Moreau
INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '66666666-6666-6666-6666-666666666666',
  'Bonjour, je voudrais prendre rendez-vous pour ma fille.',
  true,
  NOW() - INTERVAL '3 days'
FROM conversations c
WHERE c.medecin_id = '33333333-3333-3333-3333-333333333333' 
  AND c.patient_id = '66666666-6666-6666-6666-666666666666'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '33333333-3333-3333-3333-333333333333',
  'Bonjour, avec plaisir. Quel est le motif de la consultation ?',
  true,
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours'
FROM conversations c
WHERE c.medecin_id = '33333333-3333-3333-3333-333333333333' 
  AND c.patient_id = '66666666-6666-6666-6666-666666666666'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '66666666-6666-6666-6666-666666666666',
  'C''''est pour un contrôle de routine et les vaccins.',
  true,
  NOW() - INTERVAL '3 days' + INTERVAL '3 hours'
FROM conversations c
WHERE c.medecin_id = '33333333-3333-3333-3333-333333333333' 
  AND c.patient_id = '66666666-6666-6666-6666-666666666666'
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
SELECT 
  c.id,
  '33333333-3333-3333-3333-333333333333',
  'Parfait, j''''ai une disponibilité mardi prochain à 9h30.',
  false,
  NOW() - INTERVAL '3 days' + INTERVAL '3 hours' + INTERVAL '30 minutes'
FROM conversations c
WHERE c.medecin_id = '33333333-3333-3333-3333-333333333333' 
  AND c.patient_id = '66666666-6666-6666-6666-666666666666'
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 13: Créer des consultations
-- =====================================================

INSERT INTO public.consultations (medecin_id, rendez_vous_id, date_consultation, motif, symptomes, diagnostic, traitement, notes, ordonnance_prescrite)
VALUES 
  -- Consultation 1 : Dr Martin - Marie Dupont
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    (SELECT id FROM rendez_vous WHERE patient_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' AND statut = 'termine' LIMIT 1),
    NOW() - INTERVAL '7 days',
    'Consultation de suivi',
    'Fièvre, maux de tête, fatigue',
    'État grippal avec fièvre',
    'Repos et médicaments antipyrétiques',
    'Patient en voie de guérison. Revoir si symptômes persistent au-delà de 5 jours.',
    true
  ),
  -- Consultation 2 : Dr Dubois - Thomas Leroy
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    (SELECT id FROM rendez_vous WHERE patient_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND statut = 'termine' LIMIT 1),
    NOW() - INTERVAL '14 days',
    'Contrôle cardiaque',
    'Tension élevée, légers vertiges',
    'Hypertension artérielle modérée',
    'Traitement antihypertenseur initié',
    'Contrôle de la tension dans 1 mois. Régime pauvre en sel conseillé.',
    true
  ),
  -- Consultation 3 : Dr Bernard - Emma Moreau
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    (SELECT id FROM rendez_vous WHERE patient_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' AND statut = 'termine' LIMIT 1),
    NOW() - INTERVAL '3 days',
    'Vaccination',
    'Aucun',
    'Vaccination DTP à jour',
    'Vaccin administré',
    'Aucune réaction indésirable. Prochain rappel dans 10 ans.',
    false
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- RÉSUMÉ
-- =====================================================

SELECT 'Script exécuté avec succès!' as message,
       (SELECT COUNT(*) FROM medecins) as nb_medecins,
       (SELECT COUNT(*) FROM patients) as nb_patients,
       (SELECT COUNT(*) FROM rendez_vous) as nb_rendez_vous,
       (SELECT COUNT(*) FROM ordonnances) as nb_ordonnances,
       (SELECT COUNT(*) FROM examens) as nb_examens,
       (SELECT COUNT(*) FROM conversations) as nb_conversations,
       (SELECT COUNT(*) FROM messages) as nb_messages,
       (SELECT COUNT(*) FROM antecedents) as nb_antecedents,
       (SELECT COUNT(*) FROM allergies) as nb_allergies,
       (SELECT COUNT(*) FROM dossiers_medicaux) as nb_dossiers,
       (SELECT COUNT(*) FROM consultations) as nb_consultations;

-- =====================================================
-- NOTE IMPORTANTE
-- =====================================================
-- Ce script suppose que vous avez déjà créé les utilisateurs
-- dans Authentication > Users de Supabase avec les IDs suivants :
--
-- MÉDECINS:
-- - 11111111-1111-1111-1111-111111111111 (dr.martin@gdm.com)
-- - 22222222-2222-2222-2222-222222222222 (dr.dubois@gdm.com)
-- - 33333333-3333-3333-3333-333333333333 (dr.bernard@gdm.com)
--
-- PATIENTS:
-- - 44444444-4444-4444-4444-444444444444 (patient1@gdm.com)
-- - 55555555-5555-5555-5555-555555555555 (patient2@gdm.com)
-- - 66666666-6666-6666-6666-666666666666 (patient3@gdm.com)
-- - 77777777-7777-7777-7777-777777777777 (patient4@gdm.com)
-- - 88888888-8888-8888-8888-888888888888 (patient5@gdm.com)
--
-- Créez-les manuellement via l'interface Supabase avec le mot de passe: password123
