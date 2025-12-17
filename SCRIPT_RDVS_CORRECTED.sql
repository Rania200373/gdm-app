-- =========================================
-- SCRIPT CORRIGÉ : AJOUTER DES RENDEZ-VOUS
-- =========================================
-- Ce script crée des rendez-vous entre patients et médecins existants

-- Désactiver temporairement RLS
SET session_replication_role = replica;

-- ============ ENRICHIR LES PATIENTS EXISTANTS ============

-- S'assurer que tous les profils patients ont une entrée dans la table patients
INSERT INTO public.patients (user_id, date_naissance)
SELECT p.id, '1990-01-01'
FROM profiles p 
WHERE p.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM patients pat WHERE pat.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- S'assurer que tous les patients ont un dossier médical
INSERT INTO public.dossiers_medicaux (patient_id, groupe_sanguin)
SELECT p.id, 'O+'
FROM profiles p 
WHERE p.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM dossiers_medicaux dm WHERE dm.patient_id = p.id)
ON CONFLICT (patient_id) DO NOTHING;

-- ============ CRÉER DES RENDEZ-VOUS ============

DO $$
DECLARE
    v_medecin_id uuid;
    v_patient_id uuid;
    v_counter integer := 0;
BEGIN
    -- Créer des rendez-vous pour chaque médecin avec les patients disponibles
    FOR v_medecin_id IN (SELECT user_id FROM medecins LIMIT 10)
    LOOP
        FOR v_patient_id IN (SELECT user_id FROM patients LIMIT 3 OFFSET (v_counter % 5))
        LOOP
            -- RDV confirmé dans 2 jours
            INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
            VALUES (
                v_patient_id,
                v_medecin_id,
                NOW() + INTERVAL '2 days' + (v_counter || ' hours')::interval,
                'Consultation médicale',
                'confirme'
            )
            ON CONFLICT DO NOTHING;
            
            v_counter := v_counter + 1;
            
            -- Limiter à 2-3 RDV par médecin
            EXIT WHEN v_counter % 3 = 0;
        END LOOP;
        
        -- RDV en attente
        SELECT user_id INTO v_patient_id FROM patients LIMIT 1 OFFSET (v_counter % 10);
        IF v_patient_id IS NOT NULL THEN
            INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
            VALUES (
                v_patient_id,
                v_medecin_id,
                NOW() + INTERVAL '5 days',
                'Suivi médical',
                'en_attente'
            )
            ON CONFLICT DO NOTHING;
        END IF;
        
        v_counter := v_counter + 1;
    END LOOP;
    
    RAISE NOTICE '✅ % rendez-vous créés', v_counter;
END $$;

-- Réactiver RLS
SET session_replication_role = DEFAULT;

-- ============ VERIFICATION ============

-- Compter les patients
SELECT COUNT(*) as nombre_patients FROM patients;

-- Compter les médecins
SELECT COUNT(*) as nombre_medecins FROM medecins;

-- Compter les rendez-vous
SELECT COUNT(*) as nombre_rendez_vous FROM rendez_vous;

-- Voir les derniers rendez-vous créés
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
ORDER BY r.created_at DESC
LIMIT 20;

-- Message final
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Script terminé avec succès !';
    RAISE NOTICE '📝 Connectez-vous en tant que médecin pour voir vos patients';
    RAISE NOTICE '🔗 Les patients apparaissent dans "Mes Patients" via les rendez-vous';
END $$;
