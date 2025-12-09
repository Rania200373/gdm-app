-- ========================================
-- DÉSACTIVER TEMPORAIREMENT RLS
-- Pour permettre l'inscription des médecins
-- ========================================

-- Désactiver RLS sur medecins
ALTER TABLE medecins DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur patients (pour être cohérent)
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('medecins', 'patients');
