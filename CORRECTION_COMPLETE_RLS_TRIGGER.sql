-- ========================================
-- CORRECTION COMPLÈTE - DÉSACTIVER RLS ET RECRÉER TRIGGER
-- ========================================

-- ÉTAPE 1 : Désactiver RLS sur profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'medecins', 'patients');

-- ÉTAPE 2 : Supprimer et recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer la fonction améliorée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer dans profiles
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 3 : Vérifier que tout est correct
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Afficher le statut RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'medecins', 'patients');
