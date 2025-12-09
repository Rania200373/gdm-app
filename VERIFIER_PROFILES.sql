-- =====================================================
-- VÉRIFIER ET CRÉER CONVERSATION MANUELLEMENT
-- =====================================================

-- 1. D'abord, voyons quels profiles existent
SELECT id, first_name, last_name, role, phone 
FROM profiles 
ORDER BY role, last_name;

-- 2. Voyons les patients et médecins
SELECT 'PATIENTS:' as type;
SELECT p.id as patient_id, p.user_id, pr.first_name, pr.last_name 
FROM patients p 
JOIN profiles pr ON p.user_id = pr.id;

SELECT 'MEDECINS:' as type;
SELECT m.id as medecin_id, m.user_id, pr.first_name, pr.last_name 
FROM medecins m 
JOIN profiles pr ON m.user_id = pr.id;
