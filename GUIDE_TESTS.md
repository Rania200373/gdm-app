# 🧪 Guide de Test Complet - Application GDM

## 📋 Prérequis

Avant de commencer les tests, assurez-vous que :

- ✅ Le script `SCRIPT_RLS_CORRECTION.sql` a été exécuté dans Supabase
- ✅ Le serveur de développement est en cours d'exécution (`npm run dev`)
- ✅ Les variables d'environnement sont correctement configurées dans `.env.local`

---

## 🔐 Test 1 : Inscription Patient

### Objectif
Créer un nouveau compte patient et vérifier que toutes les tables sont correctement remplies.

### Étapes
1. Ouvrez http://localhost:3000/auth/register
2. Remplissez le formulaire :
   - **Nom** : Dupont
   - **Prénom** : Marie
   - **Email** : marie.dupont@test.fr
   - **Mot de passe** : Test123456!
   - **Téléphone** : 0612345678
   - **Adresse** : 123 Rue de la Santé, 75014 Paris
   - **Rôle** : Patient
   - **Date de naissance** : 15/03/1990
3. Cliquez sur "S'inscrire"

### Résultat attendu
- ✅ Redirection vers `/dashboard`
- ✅ Message de bienvenue avec le nom du patient
- ✅ 4 cartes affichées : Dossiers Médicaux, Rendez-vous, Ordonnances, Documents

### Vérification dans Supabase
1. Ouvrez Supabase Dashboard → Table Editor
2. Vérifiez les tables :
   - **auth.users** : Un nouvel utilisateur avec l'email marie.dupont@test.fr
   - **profiles** : Un profil avec role = 'patient'
   - **patients** : Une entrée avec date_naissance = 1990-03-15
   - **dossiers_medicaux** : Un dossier créé automatiquement pour ce patient

---

## 👨‍⚕️ Test 2 : Inscription Médecin

### Objectif
Créer un compte médecin et vérifier l'accès au dashboard médecin.

### Étapes
1. Déconnectez-vous (bouton Déconnexion)
2. Allez sur http://localhost:3000/auth/register
3. Remplissez le formulaire :
   - **Nom** : Martin
   - **Prénom** : Pierre
   - **Email** : dr.martin@test.fr
   - **Mot de passe** : Test123456!
   - **Téléphone** : 0645678901
   - **Adresse** : 45 Avenue des Médecins, 75008 Paris
   - **Rôle** : Médecin
   - **Spécialité** : Médecine générale
   - **Numéro d'ordre** : 75001234567
4. Cliquez sur "S'inscrire"

### Résultat attendu
- ✅ Redirection vers `/dashboard/medecin`
- ✅ Statistiques affichées (0 rendez-vous aujourd'hui, 0 en attente, 0 patients)
- ✅ 4 cartes d'actions : Mes Patients, Consultations, Ordonnances, Agenda

### Vérification dans Supabase
- **profiles** : Un profil avec role = 'medecin'
- **medecins** : Une entrée avec specialite et numero_ordre

---

## 📋 Test 3 : Dossier Médical Patient

### Objectif
Modifier le dossier médical d'un patient.

### Étapes
1. Connectez-vous avec le compte patient (marie.dupont@test.fr)
2. Cliquez sur "Dossiers Médicaux" dans le dashboard
3. Cliquez sur "Modifier mes informations"
4. Remplissez le formulaire :
   - **Groupe sanguin** : A+
   - **Allergies** : Pénicilline, Arachides
   - **Antécédents médicaux** : Asthme depuis l'enfance
   - **Antécédents chirurgicaux** : Appendicectomie en 2015
   - **Contact d'urgence** :
     - Nom : Jean Dupont
     - Lien : Conjoint
     - Téléphone : 0698765432
5. Cliquez sur "Enregistrer"

### Résultat attendu
- ✅ Message de succès
- ✅ Redirection vers la page du dossier médical
- ✅ Toutes les informations affichées correctement
- ✅ Section "Allergies" affichée en rouge avec avertissement

---

## 📅 Test 4 : Prendre un Rendez-vous

### Objectif
Un patient prend rendez-vous avec un médecin.

### Étapes
1. Toujours connecté en tant que patient
2. Cliquez sur "Rendez-vous" → "Prendre un rendez-vous"
3. Remplissez :
   - **Médecin** : Sélectionnez Dr. Martin Pierre
   - **Date** : Demain
   - **Heure** : 14:00
   - **Motif** : Consultation de suivi
4. Cliquez sur "Confirmer le rendez-vous"

### Résultat attendu
- ✅ Message de confirmation
- ✅ Rendez-vous affiché dans la section "Rendez-vous à venir"
- ✅ Badge "En attente de confirmation"

### Vérification côté médecin
1. Déconnectez-vous et reconnectez-vous avec dr.martin@test.fr
2. Dashboard médecin doit afficher :
   - ✅ 1 rendez-vous en attente
   - ✅ Le rendez-vous de Marie Dupont dans "Prochains Rendez-vous"

---

## 🩺 Test 5 : Créer une Consultation (Médecin)

### Objectif
Le médecin crée une consultation pour le patient.

### Étapes
1. Connecté en tant que Dr. Martin
2. Allez dans "Mes Patients"
3. Vous devriez voir Marie Dupont dans la liste
4. Cliquez sur "Consultation"
5. Remplissez :
   - **Patient** : Marie Dupont (pré-sélectionné)
   - **Date** : Aujourd'hui
   - **Motif** : Consultation de suivi
   - **Symptômes** : Fatigue persistante, maux de tête
   - **Diagnostic** : Possible anémie
   - **Traitement** : Analyses sanguines prescrites
   - **Notes** : Revoir dans 1 semaine avec les résultats
   - **Créer une ordonnance** : ✅ Cocher
6. Cliquez sur "Enregistrer la consultation"

### Résultat attendu
- ✅ Consultation enregistrée
- ✅ Redirection automatique vers le formulaire d'ordonnance
- ✅ Patient pré-sélectionné

---

## 💊 Test 6 : Créer une Ordonnance (Médecin)

### Objectif
Le médecin rédige une ordonnance pour le patient.

### Étapes
1. Sur le formulaire d'ordonnance (suite du test précédent)
2. Remplissez :
   - **Patient** : Marie Dupont (déjà sélectionné)
   - **Date de début** : Aujourd'hui
   - **Validité** : 30 jours
   
   **Médicament 1** :
   - Nom : Paracétamol
   - Dosage : 1000mg
   - Posologie : 1 comprimé 3 fois par jour après les repas
   - Durée : 7 jours
   
3. Cliquez sur "+ Ajouter un médicament"
   
   **Médicament 2** :
   - Nom : Ibuprofène
   - Dosage : 400mg
   - Posologie : 1 comprimé matin et soir en cas de douleur
   - Durée : 5 jours
   
4. **Instructions** : Ne pas dépasser la dose prescrite. Prendre pendant les repas.
5. Cliquez sur "Créer l'ordonnance"

### Résultat attendu
- ✅ Ordonnance créée avec succès
- ✅ Retour au dashboard médecin

### Vérification côté patient
1. Déconnectez-vous et reconnectez-vous avec marie.dupont@test.fr
2. Allez dans "Ordonnances"
3. Vous devriez voir :
   - ✅ L'ordonnance du Dr. Martin
   - ✅ Badge "Active" (vert)
   - ✅ Liste des 2 médicaments
   - ✅ Instructions affichées

---

## 📁 Test 7 : Consulter le Dossier Patient (Médecin)

### Objectif
Le médecin consulte le dossier complet d'un patient.

### Étapes
1. Connecté en tant que Dr. Martin
2. Allez dans "Mes Patients"
3. Cliquez sur "Dossier" pour Marie Dupont

### Résultat attendu
- ✅ Vue complète du dossier :
  - Informations personnelles (email, téléphone, adresse)
  - Allergies en rouge : Pénicilline, Arachides
  - Antécédents médicaux : Asthme depuis l'enfance
  - Antécédents chirurgicaux : Appendicectomie en 2015
- ✅ Historique des consultations :
  - La consultation créée au Test 5
- ✅ Historique des ordonnances :
  - L'ordonnance créée au Test 6
  - Médicaments affichés avec dosage et posologie

---

## 📊 Test 8 : Dashboard Médecin - Statistiques

### Objectif
Vérifier que les statistiques du médecin sont à jour.

### Étapes
1. Toujours connecté en tant que Dr. Martin
2. Retournez au dashboard (`/dashboard/medecin`)

### Résultat attendu
- ✅ **Rendez-vous aujourd'hui** : 0 (le RDV est pour demain)
- ✅ **En attente de confirmation** : 1
- ✅ **Patients suivis** : 1 (Marie Dupont)
- ✅ **Prochains rendez-vous** : Le RDV de Marie Dupont affiché

---

## 🔄 Test 9 : Confirmer un Rendez-vous (Médecin)

### Objectif
Le médecin confirme le rendez-vous du patient.

### Étapes
1. Connecté en tant que Dr. Martin
2. Allez dans "Agenda" ou cliquez sur "Rendez-vous"
3. Trouvez le rendez-vous de Marie Dupont
4. Changez le statut à "Confirmé"

**Note** : Cette fonctionnalité peut nécessiter une page supplémentaire pour modifier le statut. Si elle n'existe pas encore, testez en modifiant directement dans Supabase.

### Modification dans Supabase (temporaire)
1. Table Editor → rendez_vous
2. Trouvez le rendez-vous
3. Changez `statut` de 'en_attente' à 'confirme'

### Vérification côté patient
1. Reconnectez-vous en tant que patient
2. Allez dans "Rendez-vous"
3. Le badge devrait être vert "Confirmé"

---

## 🚨 Test 10 : Sécurité RLS

### Objectif
Vérifier que les politiques de sécurité empêchent les accès non autorisés.

### Test A : Patient ne peut pas voir les ordonnances d'autres patients
1. Créez un deuxième patient (suivez Test 1 avec un autre email)
2. Connectez-vous avec ce nouveau patient
3. Allez dans "Ordonnances"
4. ✅ **Résultat attendu** : Aucune ordonnance affichée

### Test B : Médecin ne peut pas voir les patients sans rendez-vous
1. Créez un troisième patient
2. Créez un deuxième médecin
3. Connectez-vous avec le nouveau médecin
4. Allez dans "Mes Patients"
5. ✅ **Résultat attendu** : Liste vide (aucun RDV avec ce médecin)

### Test C : Patient ne peut pas accéder au dashboard médecin
1. Connectez-vous en tant que patient
2. Essayez d'accéder à http://localhost:3000/dashboard/medecin
3. ✅ **Résultat attendu** : Redirection vers `/dashboard`

---

## 📝 Test 11 : Formulaires - Validation

### Objectif
Vérifier que les validations fonctionnent correctement.

### Test A : Inscription avec email invalide
1. Formulaire d'inscription
2. Email : "test@test"
3. ✅ **Résultat attendu** : Message d'erreur "Email invalide"

### Test B : Mot de passe trop court
1. Mot de passe : "123"
2. ✅ **Résultat attendu** : Erreur "Le mot de passe doit contenir au moins 6 caractères"

### Test C : Champs requis manquants
1. Essayez de soumettre sans remplir les champs obligatoires
2. ✅ **Résultat attendu** : Messages d'erreur pour chaque champ requis

---

## 🔍 Test 12 : Navigation et Redirections

### Objectif
Vérifier que toutes les redirections fonctionnent correctement.

### Scénarios à tester

**Utilisateur non connecté** :
- Accès à `/dashboard` → Redirigé vers `/auth/login` ✅
- Accès à `/dashboard/medecin` → Redirigé vers `/auth/login` ✅

**Patient connecté** :
- Accès à `/dashboard` → Affiche le dashboard patient ✅
- Accès à `/dashboard/medecin` → Redirigé vers `/dashboard` ✅
- Clic sur "Déconnexion" → Redirigé vers `/` ✅

**Médecin connecté** :
- Accès à `/dashboard` → Redirigé vers `/dashboard/medecin` ✅
- Accès à `/dashboard/medecin` → Affiche le dashboard médecin ✅

---

## 📱 Test 13 : Responsive Design (Optionnel)

### Objectif
Vérifier que l'interface s'adapte aux différentes tailles d'écran.

### Étapes
1. Ouvrez les DevTools du navigateur (F12)
2. Activez le mode responsive (Ctrl+Shift+M)
3. Testez sur différentes résolutions :
   - Mobile : 375x667 (iPhone)
   - Tablet : 768x1024 (iPad)
   - Desktop : 1920x1080

### Points à vérifier
- ✅ Les formulaires restent lisibles
- ✅ Les tableaux s'adaptent (scroll horizontal si nécessaire)
- ✅ Les boutons sont cliquables
- ✅ Le menu de navigation fonctionne

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : "Failed to fetch" lors de l'inscription
**Cause** : Variables d'environnement non chargées
**Solution** : 
```powershell
cd gdm-app
# Arrêter le serveur (Ctrl+C)
npm run dev
```

### Problème 2 : Aucune donnée affichée malgré l'inscription
**Cause** : Politiques RLS incorrectes
**Solution** : Exécuter `SCRIPT_RLS_CORRECTION.sql` dans Supabase

### Problème 3 : Erreur "relation does not exist"
**Cause** : Tables non créées
**Solution** : Exécuter le script de création des tables (Étape 4.2 de SETUP_SUPABASE.md)

### Problème 4 : Redirection infinie
**Cause** : Middleware mal configuré
**Solution** : Vider le cache du navigateur et les cookies

### Problème 5 : Le médecin ne voit aucun patient
**Cause** : Aucun rendez-vous créé
**Solution** : Un patient doit d'abord créer un RDV avec ce médecin

---

## ✅ Checklist Finale

Avant de considérer l'application comme testée, vérifiez :

- [ ] Un patient peut s'inscrire et se connecter
- [ ] Un médecin peut s'inscrire et se connecter
- [ ] Un patient peut modifier son dossier médical
- [ ] Un patient peut prendre un rendez-vous
- [ ] Un médecin voit les patients avec RDV
- [ ] Un médecin peut créer une consultation
- [ ] Un médecin peut créer une ordonnance
- [ ] Un patient peut voir ses ordonnances
- [ ] Les allergies sont affichées en rouge
- [ ] Les statistiques du médecin sont correctes
- [ ] Les redirections fonctionnent (patient vs médecin)
- [ ] La déconnexion fonctionne
- [ ] Les politiques RLS empêchent les accès non autorisés

---

## 📊 Rapport de Test (Template)

```
Date : ___________
Testeur : ___________

| Test | Statut | Commentaires |
|------|--------|--------------|
| 1. Inscription Patient | ✅ / ❌ | |
| 2. Inscription Médecin | ✅ / ❌ | |
| 3. Dossier Médical | ✅ / ❌ | |
| 4. Prendre RDV | ✅ / ❌ | |
| 5. Créer Consultation | ✅ / ❌ | |
| 6. Créer Ordonnance | ✅ / ❌ | |
| 7. Dossier Patient (Médecin) | ✅ / ❌ | |
| 8. Statistiques | ✅ / ❌ | |
| 9. Confirmer RDV | ✅ / ❌ | |
| 10. Sécurité RLS | ✅ / ❌ | |
| 11. Validation Formulaires | ✅ / ❌ | |
| 12. Navigation | ✅ / ❌ | |

Bugs identifiés :
1. 
2. 
3. 

Améliorations suggérées :
1. 
2. 
3. 
```

---

## 🎯 Prochaines Étapes

Une fois tous les tests passés :

1. **Exécuter le script RLS** dans Supabase (si pas encore fait)
2. **Corriger les bugs** identifiés lors des tests
3. **Développer les fonctionnalités manquantes** (documents, messages, paramètres)
4. **Préparer le déploiement** sur Vercel
5. **Tester en production** avec de vraies données

Bonne chance pour les tests ! 🚀
