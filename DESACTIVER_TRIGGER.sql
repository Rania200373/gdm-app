-- ====================================================================
-- DÉSACTIVER LE TRIGGER AUTOMATIQUE DE CRÉATION DE PROFIL
-- ====================================================================
-- Ce script désactive le trigger qui crée automatiquement le profil
-- lors de l'inscription. L'API complete-registration va tout gérer.
-- ====================================================================

-- 1. Supprimer le trigger existant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Supprimer la fonction du trigger
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ====================================================================
-- VÉRIFICATION
-- ====================================================================
-- Vérifier qu'il n'y a plus de trigger
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';

-- Résultat attendu : Aucune ligne (le trigger est supprimé)

-- ====================================================================
-- NOTE IMPORTANTE
-- ====================================================================
-- Après avoir exécuté ce script, l'API /api/complete-registration
-- sera responsable de créer TOUT :
-- - Le profil dans la table profiles
-- - L'entrée dans medecins OU patients
-- - Le dossier médical pour les patients
-- ====================================================================
