# 🔧 Solution au Problème RLS "new row violates row-level security policy"

## 🚨 Problème identifié

L'erreur "new row violates row-level security policy for table 'patients'" se produit lors de l'inscription car :

1. Le code d'inscription essaie d'insérer dans `medecins` et `patients` avec `user_id`
2. Les politiques RLS vérifient que `auth.uid() = user_id`
3. Mais la structure des tables pourrait avoir `id` au lieu de `user_id` comme clé étrangère

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier la structure actuelle

Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier la structure de medecins
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medecins' 
ORDER BY ordinal_position;

-- Vérifier la structure de patients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;
```

**Résultat attendu** : Les tables doivent avoir une colonne `user_id` (et pas `id` comme clé étrangère vers profiles).

### Étape 2 : Corriger la structure si nécessaire

Si les tables utilisent `id` au lieu de `user_id`, exécutez le script complet : `SCRIPT_CORRECTION_TABLES.sql`

**⚠️ ATTENTION** : Ce script recrée les tables et supprime les données existantes. Sauvegardez d'abord si vous avez des données importantes.

```sql
-- Sauvegarder les données (optionnel)
CREATE TABLE medecins_backup AS SELECT * FROM medecins;
CREATE TABLE patients_backup AS SELECT * FROM patients;
```

Puis exécutez tout le contenu de `SCRIPT_CORRECTION_TABLES.sql`.

### Étape 3 : Vérifier le code frontend

Le code frontend a été corrigé pour utiliser `user_id` :

**Fichier modifié** : `app/auth/register/page.tsx`

```typescript
// Pour les médecins
await supabase.from('medecins').insert({
  user_id: data.user.id,  // ✅ Utilise user_id
  specialite: 'Médecine générale',
  numero_ordre: '000000',
  verified: false,
})

// Pour les patients
await supabase.from('patients').insert({
  user_id: data.user.id,  // ✅ Utilise user_id
  date_naissance: new Date().toISOString().split('T')[0],
})
```

## 🧪 Test de la solution

### Test 1 : Inscription Patient

1. Allez sur http://localhost:3000/auth/register
2. Remplissez le formulaire :
   - Nom : Test
   - Prénom : Patient
   - Email : patient.test@example.com
   - Mot de passe : Test123456
   - Rôle : Patient
3. Cliquez sur "S'inscrire"

**Résultat attendu** : 
- ✅ "Inscription réussie !"
- ✅ Redirection vers la page de login
- ✅ Aucune erreur RLS

### Test 2 : Vérification dans Supabase

Dans Supabase → Table Editor :

```sql
-- Vérifier le profil créé
SELECT * FROM profiles WHERE email = 'patient.test@example.com';

-- Vérifier l'entrée patient
SELECT p.*, prof.nom, prof.prenom 
FROM patients p
JOIN profiles prof ON p.user_id = prof.id
WHERE prof.email = 'patient.test@example.com';
```

**Résultat attendu** :
- ✅ Une ligne dans `profiles` avec role='patient'
- ✅ Une ligne dans `patients` avec le bon `user_id`

### Test 3 : Inscription Médecin

Répétez avec un médecin :

1. Email : medecin.test@example.com
2. Rôle : Médecin
3. Spécialité sera automatiquement "Médecine générale"

**Vérification SQL** :

```sql
-- Vérifier l'entrée médecin
SELECT m.*, prof.nom, prof.prenom 
FROM medecins m
JOIN profiles prof ON m.user_id = prof.id
WHERE prof.email = 'medecin.test@example.com';
```

## 🔍 Diagnostic approfondi

Si le problème persiste après ces corrections :

### Diagnostic 1 : Vérifier les politiques RLS

```sql
-- Lister toutes les politiques pour patients
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'patients';

-- Lister toutes les politiques pour medecins
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'medecins';
```

### Diagnostic 2 : Tester les politiques RLS manuellement

```sql
-- Se connecter en tant qu'utilisateur spécifique
SET request.jwt.claim.sub = 'votre-user-id-ici';

-- Tester l'insertion
INSERT INTO patients (user_id, date_naissance)
VALUES ('votre-user-id-ici', '1990-01-01');
```

### Diagnostic 3 : Vérifier les triggers

```sql
-- Lister les triggers sur patients
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'patients';

-- Lister les triggers sur medecins
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'medecins';
```

## 🎯 Checklist de résolution

- [ ] La table `medecins` a une colonne `user_id` (UUID)
- [ ] La table `patients` a une colonne `user_id` (UUID)
- [ ] Les politiques RLS `patients_insert_own` et `medecins_insert_own` existent
- [ ] Le code frontend utilise `user_id` dans les INSERT
- [ ] Le fichier `register/page.tsx` a été mis à jour
- [ ] Le serveur Next.js a été redémarré après les modifications

## 📝 Structure correcte des tables

### Table medecins (correcte)

```sql
CREATE TABLE medecins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialite TEXT NOT NULL,
  numero_ordre TEXT UNIQUE NOT NULL,
  adresse_cabinet TEXT,
  code_postal TEXT,
  ville TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### Table patients (correcte)

```sql
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_naissance DATE NOT NULL,
  groupe_sanguin TEXT,
  allergies TEXT[],
  numero_secu TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Point clé** : `user_id` est la clé étrangère vers `profiles(id)`, et `id` est juste la clé primaire interne.

## 🚀 Après la correction

Une fois la correction appliquée :

1. **Redémarrez le serveur** :
```bash
cd gdm-app
# Arrêtez avec Ctrl+C
npm run dev
```

2. **Testez l'inscription** comme décrit ci-dessus

3. **Vérifiez le dashboard** :
   - Patient : http://localhost:3000/dashboard
   - Médecin : http://localhost:3000/dashboard/medecin

## 💡 Pour éviter ce problème à l'avenir

Lors de la création de nouvelles tables avec des relations :

1. Utilisez toujours `user_id` pour les clés étrangères vers `profiles`
2. Gardez `id` comme clé primaire interne (UUID auto-généré)
3. Ajoutez la contrainte `UNIQUE` sur `user_id`
4. Créez les politiques RLS correspondantes

**Exemple de politique INSERT** :

```sql
CREATE POLICY "nom_table_insert_own"
  ON nom_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 📞 Besoin d'aide supplémentaire ?

Si le problème persiste après ces étapes :

1. Vérifiez les logs Supabase (Dashboard → Database → Logs)
2. Vérifiez les logs du navigateur (F12 → Console)
3. Exécutez le diagnostic approfondi ci-dessus
4. Partagez les messages d'erreur complets

---

**Date de création** : 6 décembre 2025  
**Dernière mise à jour** : 6 décembre 2025
