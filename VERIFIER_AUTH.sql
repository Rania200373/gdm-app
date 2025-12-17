-- ====================================================================
-- VÉRIFIER L'ÉTAT D'AUTHENTIFICATION
-- ====================================================================
-- Ce script vérifie les comptes dans auth.users et leur correspondance
-- avec la table profiles
-- ====================================================================

-- 1. Lister tous les comptes auth.users avec leur statut
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    p.role,
    p.first_name,
    p.last_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 2. Vérifier les comptes médecins
SELECT 
    au.email,
    au.email_confirmed_at,
    p.role,
    p.first_name,
    p.last_name,
    m.specialite
FROM auth.users au
JOIN profiles p ON au.id = p.id
LEFT JOIN medecins m ON au.id = m.user_id
WHERE p.role = 'medecin'
ORDER BY au.created_at DESC;

-- 3. Compter les comptes par statut
SELECT 
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmé'
        ELSE 'Email non confirmé'
    END AS statut,
    COUNT(*) as nombre
FROM auth.users
GROUP BY statut;

-- ====================================================================
-- POUR RÉINITIALISER UN MOT DE PASSE (si nécessaire)
-- ====================================================================
-- IMPORTANT : Utilisez l'interface Supabase Authentication pour 
-- réinitialiser les mots de passe, ou créez un nouveau compte

-- Si vous voulez supprimer un compte et le recréer :
-- 1. Allez dans Supabase Dashboard > Authentication > Users
-- 2. Trouvez l'utilisateur
-- 3. Cliquez sur les 3 points > Delete user
-- 4. Recréez le compte via http://localhost:3000/auth/register

-- ====================================================================
-- ALTERNATIVE : Confirmer l'email manuellement (si pas confirmé)
-- ====================================================================
/*
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'dr.dubois@gdm.com';
*/
