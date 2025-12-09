-- ========================================
-- CORRIGER LE PROFIL ET CRÉER L'ENREGISTREMENT MÉDECIN
-- ========================================

-- ÉTAPE 1 : Créer le profil s'il n'existe pas
INSERT INTO profiles (id, role, first_name, last_name, created_at)
VALUES (
  '1da21208-890f-4316-ab1c-a279e9d015dc',
  'medecin',
  'user',
  '',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'medecin';

-- ÉTAPE 2 : Créer l'enregistrement dans la table medecins
INSERT INTO medecins (user_id, specialite, numero_ordre, verified)
VALUES (
  '1da21208-890f-4316-ab1c-a279e9d015dc',
  'Médecine générale',
  'ORD' || EXTRACT(EPOCH FROM NOW())::bigint,
  false
)
ON CONFLICT (user_id) DO NOTHING;

-- ÉTAPE 3 : Vérification - Afficher le profil corrigé
SELECT 
  p.id, 
  u.email, 
  p.first_name, 
  p.last_name, 
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '1da21208-890f-4316-ab1c-a279e9d015dc';

-- ÉTAPE 4 : Vérifier l'enregistrement dans medecins
SELECT 
  m.id, 
  m.user_id, 
  u.email, 
  m.specialite,
  m.numero_ordre,
  m.verified
FROM medecins m
JOIN auth.users u ON m.user_id = u.id
WHERE m.user_id = '1da21208-890f-4316-ab1c-a279e9d015dc';
