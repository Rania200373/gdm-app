-- =========================================
-- AJOUTER DES PATIENTS RÉELS AVEC RENDEZ-VOUS
-- =========================================
-- Ce script enrichit les patients existants et crée des rendez-vous

-- Désactiver temporairement RLS
SET session_replication_role = replica;

-- ============ ENRICHIR LES PATIENTS EXISTANTS ============

-- Mettre à jour les patients existants avec des données supplémentaires
DO $$
DECLARE
    patient_record RECORD;
BEGIN
    -- Pour chaque utilisateur patient existant, ajouter des informations
    FOR patient_record IN 
        SELECT p.id, p.first_name, p.last_name 
        FROM profiles p 
        WHERE p.role = 'patient' 
        AND NOT EXISTS (SELECT 1 FROM patients pat WHERE pat.user_id = p.id)
        LIMIT 3
    LOOP
        -- Créer l'entrée patient si elle n'existe pas
        INSERT INTO public.patients (user_id, date_naissance)
        VALUES (
            patient_record.id,
            '1990-01-01'
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Créer un dossier médical
        INSERT INTO public.dossiers_medicaux (patient_id, groupe_sanguin)
        VALUES (patient_record.id, 'O+')
        ON CONFLICT (patient_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Patients existants mis à jour';
END $$;

-- ============ CRÉER DES RENDEZ-VOUS ============

-- Récupérer les IDs des médecins existants
DO $$
DECLARE
    medecin_sophie_id uuid;
    medecin_pierre_id uuid;
    medecin_jean_id uuid;
    patient1_id uuid;
    patient2_id uuid;
    patient3_id uuid;
BEGIN
    -- Récupérer les IDs des médecins
    SELECT user_id INTO medecin_sophie_id FROM medecins WHERE specialite = 'Cardiologie' LIMIT 1;
    SELECT user_id INTO medecin_pierre_id FROM medecins WHERE specialite = 'Pédiatrie' LIMIT 1;
    SELECT user_id INTO medecin_jean_id FROM medecins WHERE specialite = 'Médecine Générale' OR specialite = 'Médecine générale' LIMIT 1;
    
    -- Récupérer les IDs de 3 patients existants (n'importe lesquels)
    SELECT user_id INTO patient1_id FROM patients LIMIT 1 OFFSET 0;
    SELECT user_id INTO patient2_id FROM patients LIMIT 1 OFFSET 1;
    SELECT user_id INTO patient3_id FROM patients LIMIT 1 OFFSET 2;
    
    -- Si on a trouvé au moins un médecin et des patients
    IF medecin_sophie_id IS NOT NULL AND patient1_id IS NOT NULL THEN
        -- RDV 1 : Marie Dupont avec Dr. Sophie Dubois (Cardiologie)
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient1_id,
            medecin_sophie_id,
            NOW() + INTERVAL '2 days',
            'Consultation cardiologique',
            'confirme'
        )
        ON CONFLICT DO NOTHING;
        
        -- RDV 2 : Marie Dupont - RDV passé
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient1_id,
            medecin_sophie_id,
            NOW() - INTERVAL '5 days',
            'Suivi cardiaque',
            'termine'
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF medecin_jean_id IS NOT NULL AND patient2_id IS NOT NULL THEN
        -- RDV 3 : Jean Martin avec Dr. Jean Martin (Médecine Générale)
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient2_id,
            medecin_jean_id,
            NOW() + INTERVAL '1 day',
            'Consultation générale',
            'en_attente'
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF medecin_pierre_id IS NOT NULL AND patient3_id IS NOT NULL THEN
        -- RDV 4 : Sophie Bernard avec Dr. Pierre Bernard (Pédiatrie)
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient3_id,
            medecin_pierre_id,
            NOW() + INTERVAL '3 days',
            'Consultation pédiatrique',
            'confirme'
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Ajouter plus de RDV pour avoir plusieurs patients par médecin
    IF medecin_sophie_id IS NOT NULL AND patient2_id IS NOT NULL THEN
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient2_id,
            medecin_sophie_id,
            NOW() + INTERVAL '4 days',
            'Bilan cardiaque',
            'en_attente'
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF medecin_sophie_id IS NOT NULL AND patient3_id IS NOT NULL THEN
        INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
        VALUES (
            patient3_id,
            medecin_sophie_id,
            NOW() + INTERVAL '7 days',
            'Contrôle cardiologique',
            'confirme'
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Réactiver RLS
SET session_replication_role = DEFAULT;

-- ============ VERIFICATION ============

-- Voir tous les patients créés
SELECT 
    p.first_name,
    p.last_name,
    pat.date_naissance
FROM profiles p
JOIN patients pat ON p.id = pat.user_id
WHERE p.role = 'patient'
ORDER BY p.first_name;

-- Voir tous les rendez-vous créés
SELECT 
    pp.first_name || ' ' || pp.last_name as patient,
    pm.first_name || ' ' || pm.last_name as medecin,
    m.specialite,
    r.date_heure,
    r.motif,
    r.statut
FROM rendez_vous r
JOIN patients pat ON r.patient_id = pat.user_id
JOIN profiles pp ON pat.user_id = pp.id
JOIN medecins med ON r.medecin_id = med.user_id
JOIN profiles pm ON med.user_id = pm.id
JOIN medecins m ON med.user_id = m.user_id
ORDER BY r.date_heure;

-- Message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Patients et rendez-vous créés !';
    RAISE NOTICE '📝 Connectez-vous en tant que médecin pour voir vos patients';
END $$;
