-- ====================================================================
-- VÉRIFIER LA STRUCTURE DES TABLES
-- ====================================================================

-- 1. Structure de la table dossiers_medicaux
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'dossiers_medicaux'
ORDER BY ordinal_position;

-- 2. Structure de la table patients
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

-- 3. Structure de la table rendez_vous
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'rendez_vous'
ORDER BY ordinal_position;
