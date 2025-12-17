-- =========================================
-- CRÉER UN MÉDECIN DIRECTEMENT EN SQL
-- =========================================
-- Ce script crée un utilisateur médecin en contournant les restrictions RLS

-- Désactiver temporairement RLS pour cette session
SET session_replication_role = replica;

-- 1. Créer l'utilisateur dans auth.users (remplacez email et mot de passe)
-- Note: Ceci ne fonctionne que si vous avez les droits admin
-- Sinon utilisez le dashboard Supabase pour créer l'utilisateur d'abord

-- Créer le profil directement
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT 
    id,
    'Sophie' as first_name,
    'Dubois' as last_name,
    'medecin' as role
FROM auth.users
WHERE email = 'sophie.dubois@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'medecin',
    first_name = 'Sophie',
    last_name = 'Dubois';

-- Créer l'entrée médecin
INSERT INTO public.medecins (user_id, specialite, numero_ordre, verified)
SELECT 
    id,
    'Cardiologie' as specialite,
    'ORD69001' as numero_ordre,
    true as verified
FROM auth.users
WHERE email = 'sophie.dubois@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET specialite = 'Cardiologie',
    numero_ordre = 'ORD69001';

-- Réactiver RLS
SET session_replication_role = DEFAULT;

-- Vérifier la création
SELECT 
    u.email,
    p.first_name,
    p.last_name,
    p.role,
    m.specialite,
    m.numero_ordre
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.medecins m ON u.id = m.user_id
WHERE u.email = 'sophie.dubois@gmail.com';

-- Message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Vérifiez les résultats ci-dessus';
    RAISE NOTICE '📝 Si l''utilisateur existe, le profil médecin a été créé/mis à jour';
END $$;
