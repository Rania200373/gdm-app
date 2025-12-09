# Cahier des Charges - Application de Gestion de Dossiers Médicaux Sécurisée (GDM)

**Date de création :** 5 décembre 2025  
**Version :** 1.0

---

## 1. Présentation du Projet

### 1.1 Contexte
Le secteur médical nécessite une solution numérique sécurisée permettant aux professionnels de santé et aux patients de consulter, partager et gérer les dossiers médicaux de manière confidentielle et conforme aux réglementations en vigueur (RGPD, législation médicale).

### 1.2 Objectifs
- Digitaliser la gestion des dossiers médicaux
- Faciliter la consultation et le partage sécurisé d'informations médicales
- Garantir la confidentialité et la traçabilité des accès
- Respecter les normes de sécurité et de protection des données de santé

### 1.3 Périmètre
Application web progressive (PWA) développée avec Supabase comme backend principal.

---

## 2. Acteurs du Système

### 2.1 Médecins
- Créer et modifier des dossiers médicaux
- Consulter l'historique médical des patients
- Prescrire des traitements et ordonnances
- Partager des dossiers avec d'autres professionnels de santé
- Gérer leurs rendez-vous

### 2.2 Patients
- Consulter leur propre dossier médical
- Visualiser leurs ordonnances et prescriptions
- Accorder/révoquer l'accès à leur dossier
- Télécharger leurs documents médicaux
- Gérer leurs rendez-vous

### 2.3 Administrateurs Système
- Gérer les comptes utilisateurs
- Superviser les accès et les logs
- Configurer les paramètres de sécurité
- Gérer les backups et la conformité

---

## 3. Fonctionnalités Principales

### 3.1 Authentification et Autorisation

#### 3.1.1 Inscription
- **Médecins :** Validation par vérification des diplômes et numéro d'ordre
- **Patients :** Inscription avec vérification d'identité (email + téléphone)
- Authentification multi-facteurs (2FA) obligatoire

#### 3.1.2 Connexion
- Email/mot de passe avec vérification 2FA
- Possibilité de connexion OAuth (Google, Apple)
- Session sécurisée avec JWT tokens
- Déconnexion automatique après inactivité

#### 3.1.3 Gestion des rôles
- RBAC (Role-Based Access Control)
- Niveaux : Administrateur, Médecin, Patient
- Permissions granulaires par fonctionnalité

### 3.2 Gestion des Dossiers Médicaux

#### 3.2.1 Création de dossier
- Informations patient : identité, coordonnées, groupe sanguin, allergies
- Antécédents médicaux et chirurgicaux
- Médecin traitant principal
- Contacts d'urgence

#### 3.2.2 Consultation médicale
- Motif de consultation
- Examen clinique et diagnostic
- Prescriptions et ordonnances
- Examens complémentaires demandés
- Notes et observations

#### 3.2.3 Historique médical
- Timeline chronologique des consultations
- Filtres par date, médecin, type de consultation
- Recherche full-text dans les notes
- Visualisation graphique des constantes (poids, tension, etc.)

#### 3.2.4 Documents et pièces jointes
- Upload de fichiers (PDF, images, documents médicaux)
- Stockage sécurisé et chiffré
- Catégorisation (analyses, radiographies, ordonnances, etc.)
- Prévisualisation et téléchargement

### 3.3 Partage et Accès Sécurisé

#### 3.3.1 Gestion des accès
- Patients accordent l'accès à des médecins spécifiques
- Accès temporaire avec date d'expiration
- Accès en lecture seule ou modification
- Révocation instantanée des accès

#### 3.3.2 Partage entre professionnels
- Partage de dossier entre médecins (avec consentement patient)
- Annotations et commentaires collaboratifs
- Demande d'avis médical
- Transfert de dossier (changement de médecin traitant)

#### 3.3.3 Traçabilité
- Log de tous les accès au dossier
- Historique des modifications avec auteur et timestamp
- Notifications au patient lors d'accès à son dossier
- Export des logs pour audit

### 3.4 Ordonnances et Prescriptions

#### 3.4.1 Création d'ordonnances
- Bibliothèque de médicaments
- Posologie et durée de traitement
- Instructions spécifiques
- Signature électronique sécurisée

#### 3.4.2 Consultation d'ordonnances
- Liste des ordonnances actives et archivées
- Statut (en cours, terminée, renouvelée)
- Export/impression PDF
- QR code pour validation en pharmacie

### 3.5 Gestion des Rendez-vous

#### 3.5.1 Pour les médecins
- Calendrier avec disponibilités
- Gestion des plages horaires
- Confirmation/annulation de rendez-vous
- Notifications et rappels

#### 3.5.2 Pour les patients
- Recherche de médecins par spécialité
- Réservation de créneaux disponibles
- Modification/annulation
- Rappels automatiques (email, SMS)

### 3.6 Messagerie Sécurisée

- Communication chiffrée médecin-patient
- Pièces jointes sécurisées
- Marquage de messages (urgent, question, résultats)
- Notifications en temps réel

### 3.7 Tableau de Bord

#### 3.7.1 Dashboard Médecin
- Liste des patients
- Rendez-vous du jour
- Consultations récentes
- Statistiques d'activité

#### 3.7.2 Dashboard Patient
- Prochains rendez-vous
- Dernières consultations
- Ordonnances en cours
- Alertes et notifications

---

## 4. Architecture Technique avec Supabase

### 4.1 Backend : Supabase

#### 4.1.1 Base de données PostgreSQL
**Tables principales :**

```sql
-- Users (géré par Supabase Auth)
auth.users

-- Profiles
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  role TEXT (admin, medecin, patient),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP
)

-- Médecins
medecins (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  specialite TEXT,
  numero_ordre TEXT UNIQUE,
  adresse_cabinet TEXT,
  verified BOOLEAN DEFAULT false
)

-- Patients
patients (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  date_naissance DATE,
  groupe_sanguin TEXT,
  allergies TEXT[],
  numero_secu TEXT UNIQUE
)

-- Dossiers médicaux
dossiers_medicaux (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  medecin_traitant_id UUID REFERENCES medecins(id),
  antecedents_medicaux TEXT,
  antecedents_chirurgicaux TEXT,
  contacts_urgence JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Consultations
consultations (
  id UUID PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id),
  medecin_id UUID REFERENCES medecins(id),
  date_consultation TIMESTAMP,
  motif TEXT,
  examen_clinique TEXT,
  diagnostic TEXT,
  notes TEXT,
  constantes JSONB (tension, poids, temperature, etc.),
  created_at TIMESTAMP
)

-- Ordonnances
ordonnances (
  id UUID PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id),
  patient_id UUID REFERENCES patients(id),
  medecin_id UUID REFERENCES medecins(id),
  date_prescription TIMESTAMP,
  date_expiration TIMESTAMP,
  medicaments JSONB[],
  instructions TEXT,
  signature_electronique TEXT,
  qr_code TEXT,
  statut TEXT (active, terminee, renouvelee)
)

-- Documents médicaux
documents_medicaux (
  id UUID PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id),
  consultation_id UUID REFERENCES consultations(id),
  titre TEXT,
  type TEXT (analyse, radiographie, ordonnance, autre),
  file_path TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP
)

-- Accès aux dossiers
acces_dossiers (
  id UUID PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id),
  medecin_id UUID REFERENCES medecins(id),
  granted_by UUID REFERENCES patients(id),
  type_acces TEXT (lecture, modification),
  date_debut TIMESTAMP,
  date_fin TIMESTAMP,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Logs d'accès
logs_acces (
  id UUID PRIMARY KEY,
  dossier_id UUID REFERENCES dossiers_medicaux(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT (consultation, modification, partage),
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP
)

-- Rendez-vous
rendez_vous (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  medecin_id UUID REFERENCES medecins(id),
  date_heure TIMESTAMP,
  duree INTEGER (en minutes),
  motif TEXT,
  statut TEXT (confirme, annule, termine),
  notes TEXT,
  created_at TIMESTAMP
)

-- Messages
messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  dossier_id UUID REFERENCES dossiers_medicaux(id),
  sujet TEXT,
  contenu TEXT ENCRYPTED,
  lu BOOLEAN DEFAULT false,
  priorite TEXT (normal, urgent),
  created_at TIMESTAMP
)
```

#### 4.1.2 Row Level Security (RLS)
Politiques de sécurité pour chaque table :

- **Patients :** Accès uniquement à leurs propres données
- **Médecins :** Accès aux dossiers pour lesquels ils ont une autorisation
- **Administrateurs :** Accès complet avec logs
- Audit automatique de tous les accès

#### 4.1.3 Supabase Storage
- Stockage des documents médicaux avec chiffrement
- Buckets privés avec politiques d'accès strictes
- Génération d'URLs signées temporaires
- Versioning des documents

#### 4.1.4 Supabase Auth
- Authentification email/password
- OAuth providers (Google, Apple)
- 2FA avec TOTP
- Gestion des sessions et tokens JWT
- Vérification d'email obligatoire

#### 4.1.5 Realtime
- Notifications en temps réel
- Mise à jour du statut des messages
- Alertes pour nouveaux rendez-vous
- Synchronisation du tableau de bord

#### 4.1.6 Edge Functions
- Envoi d'emails (confirmations, notifications)
- Génération de PDF pour ordonnances
- Génération de QR codes
- Validation des données médicales
- Chiffrement/déchiffrement de données sensibles
- Webhooks pour intégrations tierces

### 4.2 Frontend

#### 4.2.1 Technologies recommandées
- **Framework :** React/Next.js ou Vue.js/Nuxt
- **UI Library :** Material-UI, Chakra UI, ou Tailwind CSS
- **State Management :** React Context/Zustand ou Pinia (Vue)
- **Forms :** React Hook Form ou VeeValidate (Vue)
- **Supabase Client :** @supabase/supabase-js

#### 4.2.2 Architecture
- PWA avec service workers pour offline
- Responsive design (mobile-first)
- Lazy loading des composants
- Code splitting par route

### 4.3 Sécurité

#### 4.3.1 Chiffrement
- TLS/SSL pour toutes les communications
- Chiffrement des données sensibles at-rest
- Chiffrement end-to-end pour les messages
- Hash des mots de passe (bcrypt via Supabase)

#### 4.3.2 Conformité
- RGPD : consentement, droit à l'oubli, portabilité
- Hébergement données de santé (HDS) si applicable
- Logs d'audit conservés selon réglementations
- Politique de conservation des données

#### 4.3.3 Protection
- Rate limiting sur les APIs
- CORS correctement configuré
- Protection CSRF
- Sanitization des inputs
- Validation côté serveur (RPC functions)

---

## 5. Spécifications Non Fonctionnelles

### 5.1 Performance
- Temps de chargement < 3 secondes
- Réponse API < 500ms
- Support de 10,000+ utilisateurs simultanés
- Optimisation des requêtes base de données

### 5.2 Disponibilité
- Uptime 99.9%
- Backup quotidien automatique
- Plan de reprise d'activité (PRA)
- Monitoring et alertes

### 5.3 Compatibilité
- Navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)
- Mobile : iOS 14+, Android 10+
- Tablettes supportées
- Accessibilité WCAG 2.1 niveau AA

### 5.4 Scalabilité
- Architecture horizontalement scalable
- CDN pour assets statiques
- Caching intelligent
- Database indexing optimisé

---

## 6. Interfaces Utilisateur

### 6.1 Écrans Principaux

#### Pour les Médecins
1. **Dashboard**
   - Vue d'ensemble des rendez-vous
   - Patients récents
   - Statistiques

2. **Liste des patients**
   - Recherche et filtres
   - Accès rapide aux dossiers

3. **Dossier patient**
   - Timeline des consultations
   - Documents médicaux
   - Historique complet

4. **Nouvelle consultation**
   - Formulaire guidé
   - Dictée vocale (optionnel)
   - Création d'ordonnance

5. **Calendrier**
   - Gestion des disponibilités
   - Rendez-vous confirmés

6. **Messagerie**
   - Inbox sécurisée
   - Conversations par patient

#### Pour les Patients
1. **Dashboard**
   - Prochains rendez-vous
   - Alertes et notifications
   - Accès rapide

2. **Mon dossier médical**
   - Informations personnelles
   - Historique consultations
   - Documents

3. **Mes ordonnances**
   - Ordonnances actives
   - Historique prescriptions

4. **Rendez-vous**
   - Prendre/modifier rendez-vous
   - Historique

5. **Gestion des accès**
   - Médecins autorisés
   - Logs d'accès

6. **Messagerie**
   - Contact avec médecins
   - Demandes d'informations

### 6.2 Design System
- Palette de couleurs professionnelle (bleu médical, blanc, gris)
- Typographie claire et lisible
- Icônes médicales cohérentes
- Composants réutilisables
- Design inclusif et accessible

---

## 7. Livrables

### 7.1 Documentation
- Documentation technique complète
- Guide d'installation et déploiement
- Guide utilisateur (médecins et patients)
- Documentation API
- Procédures de backup et restauration

### 7.2 Code Source
- Repository Git avec versioning
- Code commenté et documenté
- Tests unitaires et d'intégration
- Configuration CI/CD

### 7.3 Déploiement
- Application déployée en production
- Certificats SSL
- Monitoring configuré
- Backups automatiques

---

## 8. Planning Prévisionnel

### Phase 1 : Analyse et Conception (2 semaines)
- Validation du cahier des charges
- Maquettes UI/UX
- Architecture détaillée
- Schéma base de données

### Phase 2 : Configuration Infrastructure (1 semaine)
- Setup projet Supabase
- Configuration base de données
- Politiques RLS
- Setup Storage et Auth

### Phase 3 : Développement Backend (4 semaines)
- Tables et relations
- Edge Functions
- Politiques de sécurité
- APIs et endpoints

### Phase 4 : Développement Frontend (6 semaines)
- Interface médecins (3 semaines)
- Interface patients (2 semaines)
- Interface admin (1 semaine)

### Phase 5 : Intégration et Tests (3 semaines)
- Tests unitaires
- Tests d'intégration
- Tests sécurité
- Tests utilisateurs

### Phase 6 : Déploiement et Formation (2 semaines)
- Déploiement production
- Formation utilisateurs
- Documentation
- Support initial

**Durée totale estimée : 18 semaines (4,5 mois)**

---

## 9. Budget Estimatif

### 9.1 Option 1 : Stack 100% Gratuite (Développement et MVP)
- ✅ **Supabase Free Tier** : 0€/mois
  - 500 Mo base de données
  - 1 Go stockage
  - 2 Go bande passante
  - Toutes les fonctionnalités disponibles
  - ⚠️ Pause après 7 jours d'inactivité (réactivation gratuite)

- ✅ **Vercel/Netlify** : 0€/mois
  - Hébergement frontend illimité
  - SSL automatique
  - CDN global

- ✅ **Resend** : 0€/mois
  - 3000 emails/mois gratuits
  - API simple

- ✅ **Domaine** : 0€
  - Sous-domaine gratuit (.vercel.app / .netlify.app)

- **Total Phase Développement : 0€/mois**

### 9.2 Option 2 : Production Recommandée (Données Médicales Réelles)
- Supabase Pro : ~25€/mois
  - Backups automatiques quotidiens
  - Pas de pause du service
  - Support email
  - 8 Go base de données

- Hébergement frontend : 0€/mois (Vercel/Netlify gratuit)
- Domaine personnalisé : ~15€/an
- Services emails/SMS : 20-50€/mois (selon volume)
- **Total Production : 50-100€/mois**

### 9.3 Alternatives Open Source (Auto-hébergement)
- **PocketBase** : Gratuit, self-hosted
- **Appwrite** : Gratuit, self-hosted
- **Oracle Cloud Always Free** : 2 VM gratuites à vie
- **Railway** : 500h/mois gratuites
- **Total : 0€/mois** (si auto-hébergé)

### 9.4 Stratégie de Déploiement par Phase

**Phase 1 - Développement (0€)** :
- Supabase Free Tier
- Vercel gratuit
- Tests et itérations

**Phase 2 - MVP/Bêta (0€)** :
- Même infrastructure
- < 50 utilisateurs test
- Validation du concept

**Phase 3 - Production (50-100€/mois)** :
- Migration vers Supabase Pro
- Domaine personnalisé
- Services emails professionnels
- Backups et sécurité renforcée

### 9.5 Développement
- Analyse et conception : 80h
- Backend (Supabase) : 160h
- Frontend : 240h
- Tests et qualité : 120h
- Documentation : 40h
- **Total : 640h**

### 9.6 Maintenance et Support
- Maintenance corrective
- Évolutions fonctionnelles
- Support utilisateurs
- Mises à jour sécurité

---

## 10. Risques et Contraintes

### 10.1 Risques Identifiés
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|---------|------------|
| Non-conformité RGPD | Faible | Critique | Audit régulier, DPO |
| Faille de sécurité | Moyen | Critique | Audits sécurité, pentesting |
| Perte de données | Faible | Critique | Backups quotidiens, redondance |
| Performance dégradée | Moyen | Moyen | Monitoring, optimisation continue |
| Adoption utilisateurs | Moyen | Élevé | Formation, UX intuitive |

### 10.2 Contraintes
- Conformité stricte aux réglementations médicales
- Sécurité maximale des données de santé
- Interface très intuitive (public varié)
- Performance même avec gros volumes de données
- Disponibilité 24/7

---

## 11. Critères de Succès

1. **Fonctionnel**
   - 100% des fonctionnalités cahier des charges implémentées
   - 0 bug critique en production
   - Taux de satisfaction utilisateurs > 80%

2. **Technique**
   - Performance conforme aux spécifications
   - Taux de disponibilité > 99.9%
   - Couverture tests > 80%

3. **Sécurité**
   - Audit sécurité validé
   - Conformité RGPD attestée
   - 0 faille critique

4. **Adoption**
   - 100 médecins actifs dans les 3 premiers mois
   - 1000 patients enregistrés dans les 6 premiers mois
   - Taux d'utilisation hebdomadaire > 60%

---

## 12. Évolutions Futures

### Phase 2 (optionnel)
- Téléconsultation vidéo intégrée
- IA pour aide au diagnostic
- Intégration laboratoires d'analyses
- Application mobile native
- Reconnaissance vocale avancée
- Intégration objets connectés (tension, glycémie)
- Système de rappel vaccinations
- Statistiques et analytics avancés
- API publique pour intégrations tierces

---

## 13. Contacts et Validation

### Équipe Projet
- **Chef de projet :** [À définir]
- **Architecte technique :** [À définir]
- **Développeurs :** [À définir]
- **UX/UI Designer :** [À définir]
- **Responsable sécurité :** [À définir]

### Validation du Cahier des Charges
| Partie prenante | Nom | Signature | Date |
|-----------------|-----|-----------|------|
| Commanditaire | | | |
| Chef de projet | | | |
| Architecte | | | |

---

**Ce cahier des charges est un document évolutif qui pourra être ajusté selon les besoins identifiés durant le projet.**
