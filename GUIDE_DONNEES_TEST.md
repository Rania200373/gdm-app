# 🎯 Guide d'ajout des données de test

## 📋 Comment utiliser ce script

### Étape 1: Accéder à Supabase
1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**

### Étape 2: Exécuter le script
1. Créez une nouvelle requête
2. Copiez tout le contenu du fichier `AJOUTER_DONNEES_TEST.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** pour exécuter

### Étape 3: Vérifier l'installation
Le script affichera un résumé à la fin :
- Nombre de médecins créés
- Nombre de patients créés
- Nombre de rendez-vous créés
- Nombre de consultations créées
- Nombre d'ordonnances créées

---

## 👨‍⚕️ Comptes Médecins Créés

### Dr. Jean Martin - Médecine Générale
- **Email:** `dr.martin@gdm.com`
- **Mot de passe:** `password123`
- **Spécialité:** Médecine Générale
- **Localisation:** Paris (75001)
- **Cabinet:** 15 Rue de la Santé
- **Disponibilités:** Lundi-Vendredi, 9h-12h et 14h-18h

### Dr. Sophie Dubois - Cardiologie
- **Email:** `dr.dubois@gdm.com`
- **Mot de passe:** `password123`
- **Spécialité:** Cardiologie
- **Localisation:** Lyon (69002)
- **Cabinet:** 28 Avenue du Cœur
- **Disponibilités:** Lundi, Mercredi, Vendredi, 10h-13h et 15h-19h

### Dr. Pierre Bernard - Pédiatrie
- **Email:** `dr.bernard@gdm.com`
- **Mot de passe:** `password123`
- **Spécialité:** Pédiatrie
- **Localisation:** Marseille (13001)
- **Cabinet:** 42 Boulevard des Enfants
- **Disponibilités:** Mardi, Jeudi, Samedi, 8h30-12h30

---

## 👥 Comptes Patients Créés

### Marie Dupont
- **Email:** `patient1@gdm.com`
- **Mot de passe:** `password123`
- **Âge:** 34 ans (née le 15/05/1990)
- **Groupe sanguin:** A+
- **Téléphone:** 06 45 67 89 01

### Thomas Leroy
- **Email:** `patient2@gdm.com`
- **Mot de passe:** `password123`
- **Âge:** 40 ans (né le 22/08/1985)
- **Groupe sanguin:** O+
- **Téléphone:** 06 56 78 90 12

### Emma Moreau
- **Email:** `patient3@gdm.com`
- **Mot de passe:** `password123`
- **Âge:** 30 ans (née le 10/03/1995)
- **Groupe sanguin:** B+
- **Téléphone:** 06 67 89 01 23

### Lucas Simon
- **Email:** `patient4@gdm.com`
- **Mot de passe:** `password123`
- **Âge:** 37 ans (né le 30/11/1988)
- **Groupe sanguin:** AB+
- **Téléphone:** 06 78 90 12 34

### Julie Laurent
- **Email:** `patient5@gdm.com`
- **Mot de passe:** `password123`
- **Âge:** 33 ans (née le 18/07/1992)
- **Groupe sanguin:** A-
- **Téléphone:** 06 89 01 23 45

---

## 📊 Données créées

### ✅ Rendez-vous
- **7 rendez-vous** au total
- 3 rendez-vous passés (terminés)
- 4 rendez-vous à venir (confirmés ou en attente)

### ✅ Consultations
- **3 consultations** enregistrées
- Avec diagnostics et notes
- Liées aux rendez-vous passés

### ✅ Ordonnances
- **2 ordonnances** créées
- Une pour grippe (Dr. Martin → Marie Dupont)
- Une pour hypertension (Dr. Dubois → Thomas Leroy)

### ✅ Examens
- **3 examens** enregistrés
- ECG, Prise de sang, Test auditif
- Avec résultats et observations

### ✅ Conversations
- **3 conversations** initialisées
- Entre médecins et leurs patients

---

## 🧪 Scénarios de test disponibles

Après avoir exécuté le script, vous pourrez tester :

### Comme Médecin (Dr. Martin)
1. ✅ Voir la liste de vos patients
2. ✅ Consulter les rendez-vous à venir et passés
3. ✅ Créer une nouvelle ordonnance
4. ✅ Enregistrer une consultation
5. ✅ Envoyer des documents via messagerie
6. ✅ Voir le dossier médical complet d'un patient

### Comme Patient (Marie Dupont)
1. ✅ Voir vos ordonnances actives
2. ✅ Consulter votre dossier médical
3. ✅ Télécharger les ordonnances en PDF
4. ✅ Prendre un nouveau rendez-vous
5. ✅ Voir l'historique de vos consultations
6. ✅ Communiquer avec votre médecin

---

## 🔄 Pour tout recommencer

Si vous voulez réinitialiser et recommencer :

```sql
-- ⚠️ ATTENTION: Ceci supprimera TOUTES les données de test

-- Supprimer dans l'ordre inverse (dépendances)
DELETE FROM public.conversations WHERE user1_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM public.examens WHERE medecin_prescripteur_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

DELETE FROM public.ordonnances WHERE medecin_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

DELETE FROM public.consultations WHERE medecin_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

DELETE FROM public.rendez_vous WHERE medecin_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

DELETE FROM public.disponibilites WHERE medecin_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

DELETE FROM public.patients WHERE user_id IN (
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

DELETE FROM public.medecins WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM public.profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);
```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les tables existent dans votre base de données
2. Assurez-vous d'avoir les permissions nécessaires
3. Vérifiez les logs d'erreur dans Supabase

---

## ✨ Prêt à tester !

Une fois le script exécuté, vous pouvez :
1. Vous connecter avec n'importe quel compte (médecin ou patient)
2. Tester toutes les fonctionnalités de l'application
3. Créer de nouvelles consultations, ordonnances, rendez-vous

**Bon test ! 🚀**
