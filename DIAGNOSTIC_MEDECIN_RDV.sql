-- ====================================================================
-- DIAGNOSTIC : Vérifier les rendez-vous d'un médecin spécifique
-- ====================================================================

-- 1. Lister tous les médecins avec leur email
SELECT 
    p.first_name || ' ' || p.last_name as nom_complet,
    au.email,
    m.user_id,
    m.specialite
FROM medecins m
JOIN profiles p ON m.user_id = p.id
JOIN auth.users au ON p.id = au.id
ORDER BY p.first_name;

-- 2. Compter les rendez-vous par médecin
SELECT 
    pm.first_name || ' ' || pm.last_name as medecin,
    COUNT(*) as nombre_rdv
FROM rendez_vous r
JOIN profiles pm ON r.medecin_id = pm.id
GROUP BY pm.first_name, pm.last_name, r.medecin_id
ORDER BY nombre_rdv DESC;

-- 3. Afficher les rendez-vous d'un médecin spécifique (REMPLACEZ L'EMAIL)
-- Copiez l'email du médecin avec lequel vous êtes connecté
SELECT 
    pp.first_name || ' ' || pp.last_name as patient,
    pm.first_name || ' ' || pm.last_name as medecin,
    r.date_heure,
    r.motif,
    r.statut
FROM rendez_vous r
JOIN profiles pp ON r.patient_id = pp.id
JOIN profiles pm ON r.medecin_id = pm.id
WHERE pm.id IN (
    SELECT id FROM profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'rania.zekri@issatm.ucar.tn'  -- REMPLACEZ PAR VOTRE EMAIL
    )
);

-- 4. Vérifier les politiques RLS sur rendez_vous
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'rendez_vous';
