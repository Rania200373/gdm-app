-- ========================================
-- VÉRIFIER ET CORRIGER LE RÔLE
-- ========================================

-- ÉTAPE 1 : Vérifier la structure de la table profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ÉTAPE 2 : Vérifier les profils existants
SELECT *
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ÉTAPE 3 : Vérifier les utilisateurs dans auth.users et leurs métadonnées
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role_metadata,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ÉTAPE 4 : Vérifier la table medecins avec les emails de auth.users
SELECT 
  m.id, 
  m.user_id, 
  u.email, 
  p.role, 
  m.specialite,
  p.first_name,
  p.last_name
FROM medecins m
LEFT JOIN profiles p ON m.user_id = p.id
LEFT JOIN auth.users u ON m.user_id = u.id;

-- ÉTAPE 5 : Mettre à jour le rôle pour le dernier utilisateur médecin créé
-- Récupérer l'ID de l'utilisateur depuis auth.users
UPDATE profiles
SET role = 'medecin'
WHERE id IN (
  SELECT user_id FROM medecins
)
AND (role IS NULL OR role = '' OR role != 'medecin');

-- ÉTAPE 6 : Vérification finale
SELECT 
  p.id, 
  u.email, 
  p.first_name, 
  p.last_name, 
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
