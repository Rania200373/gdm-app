-- Vérifier la structure de la table profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Voir les données actuelles
SELECT id, user_id, first_name, last_name, role, email 
FROM profiles 
LIMIT 5;
