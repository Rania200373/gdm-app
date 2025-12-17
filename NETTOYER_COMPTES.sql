-- =========================================
-- NETTOYER LES COMPTES INCOMPLETS
-- =========================================
-- Supprimer les utilisateurs qui ont été créés mais sans profil complet

-- Voir tous les utilisateurs avec leurs profils
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.role,
    m.specialite as medecin_specialite,
    pat.date_naissance as patient_dob
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.medecins m ON u.id = m.user_id
LEFT JOIN public.patients pat ON u.id = pat.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Supprimer l'utilisateur sophie.dubois@gmail.com s'il existe (pour recommencer)
-- ATTENTION: Cette commande supprime définitivement l'utilisateur
/*
DELETE FROM auth.users WHERE email = 'sophie.dubois@gmail.com';
*/

-- Message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Vérifiez les utilisateurs ci-dessus';
    RAISE NOTICE '📝 Pour supprimer sophie.dubois@gmail.com, décommentez la commande DELETE';
END $$;
