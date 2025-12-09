# 🏥 GDM - Gestion des Dossiers Médicaux

Application web sécurisée pour la gestion des dossiers médicaux permettant aux patients et médecins de gérer les consultations, rendez-vous et ordonnances. Développée avec Next.js 15 et Supabase.

## 🌟 Fonctionnalités Complètes

### Pour les Patients
- ✅ Gestion du dossier médical personnel (allergies, antécédents)
- ✅ Prise de rendez-vous avec les médecins
- ✅ Consultation des ordonnances actives et historique
- ✅ Historique des consultations
- 🔜 Upload de documents médicaux
- 🔜 Messagerie avec les médecins

### Pour les Médecins
- ✅ Dashboard avec statistiques en temps réel
- ✅ Gestion de la liste de patients
- ✅ Consultation détaillée des dossiers patients
- ✅ Création et gestion de consultations
- ✅ Rédaction d'ordonnances électroniques
- ✅ Gestion de l'agenda des rendez-vous
- 🔜 Upload de documents pour les patients

## 🚀 Démarrage Rapide

### 1. Configuration des Variables d'Environnement

Le fichier `.env.local` est déjà configuré avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://bbfwkjupxujmenixflu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
```

### 2. Configuration Supabase (Important !)

**⚠️ Action requise** : Exécutez le script de correction des politiques RLS dans Supabase :

1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez le contenu de `../SCRIPT_RLS_CORRECTION.sql`
3. Exécutez le script

Cela corrigera les politiques de sécurité et permettra l'affichage correct des données.

### 3. Lancer le Serveur de Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🧪 Tests

Suivez le guide de test complet : `../GUIDE_TESTS.md`

### Test rapide
1. Inscrivez-vous en tant que patient
2. Modifiez votre dossier médical
3. Prenez un rendez-vous
4. Inscrivez-vous en tant que médecin (nouveau compte)
5. Consultez la liste des patients et créez une consultation

## 🔐 Authentification

L'application inclut :
- ✅ Inscription (Patient / Médecin)
- ✅ Connexion
- ✅ Déconnexion
- ✅ Protection des routes
- ✅ Middleware de session

## 📁 Structure du Projet

```
gdm-app/
├── app/
│   ├── auth/
│   │   ├── login/          # Page de connexion
│   │   ├── register/       # Page d'inscription
│   │   └── signout/        # Route de déconnexion
│   ├── dashboard/          # Dashboard principal
│   ├── page.tsx           # Page d'accueil
│   └── layout.tsx         # Layout racine
├── lib/
│   └── supabase/
│       ├── client.ts      # Client Supabase (côté client)
│       ├── server.ts      # Client Supabase (côté serveur)
│       └── middleware.ts  # Middleware session
├── types/
│   └── database.types.ts  # Types TypeScript
├── middleware.ts          # Middleware Next.js
└── .env.local            # Variables d'environnement
```

## 🎨 Technologies

- **Frontend :** Next.js 15 (App Router), React, TypeScript
- **Styling :** Tailwind CSS
- **Backend :** Supabase (PostgreSQL, Auth, Storage)
- **Authentification :** Supabase Auth avec RLS

## 🔄 Prochaines Étapes de Développement

- [ ] Page de profil utilisateur
- [ ] Gestion des dossiers médicaux
- [ ] Système de rendez-vous
- [ ] Ordonnances électroniques
- [ ] Upload de documents médicaux
- [ ] Messagerie sécurisée
- [ ] Interface médecin vs patient

## 📖 Documentation Complète

Voir les fichiers :
- `../CAHIER_DES_CHARGES.md` - Spécifications complètes du projet
- `../SETUP_SUPABASE.md` - Guide de configuration Supabase

## 🆓 Hébergement Gratuit

Ce projet peut être déployé gratuitement sur :
- **Frontend :** Vercel ou Netlify
- **Backend :** Supabase Free Tier

## 📝 License

Ce projet est open source et disponible sous licence MIT.

