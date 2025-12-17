-- =========================================
-- VÉRIFIER L'ÉTAT DE LA BASE DE DONNÉES
-- =========================================

-- Voir tous les utilisateurs avec leur rôle
SELECT 
    u.email,
    u.created_at,
    p.role,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 20;

-- Compter par rôle
SELECT 
    COALESCE(p.role, 'NO PROFILE') as role,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
GROUP BY p.role;

-- Vérifier les patients
SELECT COUNT(*) as nombre_patients FROM patients;

-- Vérifier les médecins
SELECT COUNT(*) as nombre_medecins FROM medecins;

-- Vérifier les rendez-vous
SELECT COUNT(*) as nombre_rendez_vous FROM rendez_vous;

-- Message
DO $$ 
BEGIN 
    RAISE NOTICE '📊 Vérification terminée';
    RAISE NOTICE '❓ Si vous n''avez pas de patients, créez-en via http://localhost:3000/auth/register';
END $$;
