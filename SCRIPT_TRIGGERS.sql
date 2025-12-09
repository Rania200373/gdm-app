-- ⚠️ IMPORTANT : Exécutez ce script dans Supabase SQL Editor
-- Ce script crée les triggers automatiques pour les profils et dossiers

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour créer automatiquement un dossier médical pour les patients
CREATE OR REPLACE FUNCTION public.handle_new_patient()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dossiers_medicaux (patient_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la création d'un patient
DROP TRIGGER IF EXISTS on_patient_created ON patients;
CREATE TRIGGER on_patient_created
  AFTER INSERT ON patients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_patient();
