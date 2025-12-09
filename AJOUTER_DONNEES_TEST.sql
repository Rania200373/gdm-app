-- Script pour ajouter des données de test
-- À exécuter dans Supabase SQL Editor

-- =====================================================
-- ÉTAPE 1: Créer des utilisateurs de test
-- =====================================================

-- Créer 3 médecins
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'dr.martin@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'dr.dubois@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'dr.bernard@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Créer 5 patients
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'patient1@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'patient2@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'patient3@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'patient4@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'patient5@gdm.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 2: Créer les profils
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
-- ÉTAPE 3: Créer les médecins
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
-- ÉTAPE 4: Créer les patients
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
-- ÉTAPE 5: Ajouter des disponibilités pour les médecins
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

-- Dr. Dubois (Lundi, Mercredi, Vendredi, 10h-13h et 15h-19h)
INSERT INTO public.disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '15:00', '19:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '15:00', '19:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '10:00', '13:00', 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '15:00', '19:00', 30)
ON CONFLICT DO NOTHING;

-- Dr. Bernard (Mardi, Jeudi, Samedi, 8h30-12h30)
INSERT INTO public.disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin, duree_consultation)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '08:30', '12:30', 20),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '08:30', '12:30', 20),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 6, '08:30', '12:30', 20)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 6: Créer des rendez-vous de test
-- =====================================================

-- Rendez-vous passés et à venir
INSERT INTO public.rendez_vous (medecin_id, patient_id, date_heure, duree, motif, statut, created_at)
VALUES 
  -- RDV passés (pour historique)
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
-- ÉTAPE 7: Créer des consultations de test
-- =====================================================

-- Note: Vérifiez d'abord si votre table consultations a bien une colonne patient_id
-- Si elle utilise rendez_vous_id uniquement, ajustez en conséquence

-- Consultations basées sur les RDV passés
-- INSERT INTO public.consultations (medecin_id, patient_id, date_consultation, motif, diagnostic, notes, ordonnance_prescrite)
-- VALUES 
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '7 days', 'Consultation de suivi', 'Grippe saisonnière', 'Patient en bonne voie de guérison. Repos recommandé.', true),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '14 days', 'Contrôle cardiaque', 'Hypertension artérielle modérée', 'Tension : 145/90. Nécessite un suivi régulier et traitement.', true),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NOW() - INTERVAL '3 days', 'Vaccination', 'Vaccination à jour', 'Rappel DTP effectué. Prochain rappel dans 10 ans.', false)
-- ON CONFLICT DO NOTHING;

-- Version alternative sans patient_id (commentez la version ci-dessus si celle-ci fonctionne)
-- Si votre table n'a pas de colonne patient_id, utilisez cette version :
-- INSERT INTO public.consultations (medecin_id, date_consultation, motif, diagnostic, notes, ordonnance_prescrite)
-- VALUES 
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '7 days', 'Consultation de suivi', 'Grippe saisonnière', 'Patient en bonne voie de guérison. Repos recommandé.', true),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '14 days', 'Contrôle cardiaque', 'Hypertension artérielle modérée', 'Tension : 145/90. Nécessite un suivi régulier et traitement.', true),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '3 days', 'Vaccination', 'Vaccination à jour', 'Rappel DTP effectué. Prochain rappel dans 10 ans.', false)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 8: Créer des ordonnances de test
-- =====================================================

INSERT INTO public.ordonnances (medecin_id, patient_id, date_prescription, date_debut, date_fin, medicaments, instructions, statut)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '3 days',
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
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '60 days',
    '[
      {"nom": "Amlodipine", "dosage": "5mg", "posologie": "1 comprimé le matin", "duree": "90 jours"},
      {"nom": "Aspirine", "dosage": "100mg", "posologie": "1 comprimé le soir", "duree": "90 jours"}
    ]'::jsonb,
    'Traitement à long terme. Contrôle tension régulier.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 9: Créer des examens de test
-- =====================================================

INSERT INTO public.examens (patient_id, medecin_prescripteur_id, type_examen, date_examen, resultats, observations)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ECG', NOW() - INTERVAL '14 days', 'Rythme sinusal normal', 'Tracé normal, pas d''anomalie détectée'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Prise de sang', NOW() - INTERVAL '7 days', 'Glycémie : 0.95 g/L, Cholestérol : 1.85 g/L', 'Valeurs dans les normes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test auditif', NOW() - INTERVAL '10 days', 'Audition normale pour l''âge', 'Aucun problème détecté')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 10: Créer des conversations de test
-- =====================================================

-- Conversations entre médecins et patients
INSERT INTO public.conversations (user1_id, user2_id, dernier_message, date_dernier_message)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Bonjour docteur', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Merci pour le suivi', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'À bientôt', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- =====================================================

-- MÉDECINS (tous avec mot de passe: password123)
-- 1. dr.martin@gdm.com - Dr. Jean Martin - Médecine Générale - Paris
-- 2. dr.dubois@gdm.com - Dr. Sophie Dubois - Cardiologie - Lyon
-- 3. dr.bernard@gdm.com - Dr. Pierre Bernard - Pédiatrie - Marseille

-- PATIENTS (tous avec mot de passe: password123)
-- 1. patient1@gdm.com - Marie Dupont - 34 ans - A+
-- 2. patient2@gdm.com - Thomas Leroy - 40 ans - O+
-- 3. patient3@gdm.com - Emma Moreau - 30 ans - B+
-- 4. patient4@gdm.com - Lucas Simon - 37 ans - AB+
-- 5. patient5@gdm.com - Julie Laurent - 33 ans - A-

-- =====================================================
-- VÉRIFICATION
-- =====================================================

SELECT 'Script exécuté avec succès!' as message,
       (SELECT COUNT(*) FROM medecins) as nb_medecins,
       (SELECT COUNT(*) FROM patients) as nb_patients,
       (SELECT COUNT(*) FROM rendez_vous) as nb_rendez_vous,
       (SELECT COUNT(*) FROM consultations) as nb_consultations,
       (SELECT COUNT(*) FROM ordonnances) as nb_ordonnances;
