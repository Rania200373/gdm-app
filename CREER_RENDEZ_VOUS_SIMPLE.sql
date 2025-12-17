-- ====================================================================
-- SCRIPT SIMPLIFIÉ : CRÉER DES RENDEZ-VOUS
-- ====================================================================
-- Ce script crée uniquement des rendez-vous entre patients et médecins
-- Sans toucher aux dossiers médicaux
-- ====================================================================

-- Désactiver temporairement RLS
SET session_replication_role = replica;

-- ============ ÉTAPE 1 : S'assurer que les patients existent ============
INSERT INTO public.patients (user_id, date_naissance)
SELECT p.id, '1990-01-01'
FROM profiles p 
WHERE p.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM patients pat WHERE pat.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- ============ ÉTAPE 2 : S'assurer que les dossiers médicaux existent ============
INSERT INTO public.dossiers_medicaux (patient_id)
SELECT p.id
FROM profiles p 
WHERE p.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM dossiers_medicaux dm WHERE dm.patient_id = p.id)
ON CONFLICT (patient_id) DO NOTHING;

-- ============ ÉTAPE 3 : CRÉER DES RENDEZ-VOUS ============
DO $$
DECLARE
    v_medecin_id uuid;
    v_patient_id uuid;
    v_counter integer := 0;
    v_total_rdv integer := 0;
BEGIN
    -- Pour chaque médecin
    FOR v_medecin_id IN (SELECT user_id FROM medecins LIMIT 10)
    LOOP
        v_counter := 0;
        
        -- Créer 2-3 RDV avec différents patients
        FOR v_patient_id IN (SELECT user_id FROM patients ORDER BY RANDOM() LIMIT 3)
        LOOP
            -- RDV confirmé dans quelques jours
            INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
            VALUES (
                v_patient_id,
                v_medecin_id,
                NOW() + INTERVAL '2 days' + (v_counter || ' hours')::interval,
                'Consultation de suivi',
                'confirme'
            )
            ON CONFLICT DO NOTHING;
            
            v_counter := v_counter + 1;
            v_total_rdv := v_total_rdv + 1;
        END LOOP;
        
        -- Un RDV en attente
        SELECT user_id INTO v_patient_id FROM patients ORDER BY RANDOM() LIMIT 1;
        IF v_patient_id IS NOT NULL THEN
            INSERT INTO public.rendez_vous (patient_id, medecin_id, date_heure, motif, statut)
            VALUES (
                v_patient_id,
                v_medecin_id,
                NOW() + INTERVAL '7 days',
                'Première consultation',
                'en_attente'
            )
            ON CONFLICT DO NOTHING;
            
            v_total_rdv := v_total_rdv + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ % rendez-vous créés avec succès', v_total_rdv;
END $$;

-- Réactiver RLS
SET session_replication_role = DEFAULT;

-- ============ VÉRIFICATION ============

-- Compter les éléments
SELECT 'Patients' as type, COUNT(*) as nombre FROM patients
UNION ALL
SELECT 'Médecins', COUNT(*) FROM medecins
UNION ALL
SELECT 'Rendez-vous', COUNT(*) FROM rendez_vous
UNION ALL
SELECT 'Dossiers médicaux', COUNT(*) FROM dossiers_medicaux;

-- Afficher les rendez-vous créés
SELECT 
    pp.first_name || ' ' || pp.last_name as patient,
    pm.first_name || ' ' || pm.last_name as medecin,
    r.date_heure::date as date_rdv,
    r.motif,
    r.statut
FROM rendez_vous r
JOIN profiles pp ON r.patient_id = pp.id
JOIN profiles pm ON r.medecin_id = pm.id
ORDER BY r.date_heure
LIMIT 20;

-- Message final
SELECT '✅ Script terminé ! Connectez-vous en tant que médecin pour voir vos patients dans "Mes Patients"' as message;
