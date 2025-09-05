# MHBABY 🏆

Application web mobile-first pour gérer des matchs de baby-foot et des tournois entre amis/équipes, avec profils, invitations, enregistrement des scores et classements joueurs & équipes.

## 🚀 Fonctionnalités

### Modes de jeu
- **1v1** : Duels individuels
- **2v2** : Mode le plus populaire (2 joueurs par équipe)

### Fonctionnalités principales
- ✅ **Création rapide de parties** (moins de 30s)
- ✅ **Enregistrement des scores en temps réel**
- ✅ **Historique détaillé** des matchs et statistiques
- ✅ **Classements Elo** pour joueurs et équipes
- ✅ **Authentification par email** (code magique)
- ✅ **Interface mobile-first** responsive
- ✅ **Gestion des lieux et tables** avec QR codes
- ✅ **Système de badges et succès**
- ✅ **Notifications en temps réel**

### Fonctionnalités avancées (en développement)
- 🔄 **Tournois** avec brackets automatiques
- 🔄 **Système d'invitations**
- 🔄 **Mode PWA** avec fonctionnalités offline
- 🔄 **Intégrations** (Slack, Discord, etc.)

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Real-time)
- **State Management** : TanStack Query (React Query)
- **Routing** : React Router DOM
- **Icons** : Lucide React

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet
```bash
git clone <repository-url>
cd mhbaby-pro
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL et clé anon

#### Configurer la base de données
1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez et exécutez le contenu du fichier `supabase-schema.sql`
3. Cela créera toutes les tables et politiques nécessaires

#### Configurer l'authentification
1. Dans **Authentication > Settings**
2. Activez **Email auth** avec **Enable email confirmations** désactivé
3. Configurez les **Site URL** et **Redirect URLs** selon votre environnement

### 4. Configuration des variables d'environnement
```bash
cp env.example .env
```

Éditez le fichier `.env` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_APP_NAME=MHBABY
VITE_APP_VERSION=1.0.0
```

### 5. Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants shadcn/ui
│   └── Navigation.tsx  # Navigation principale
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Contexte d'authentification
├── hooks/              # Hooks personnalisés
│   ├── useMatches.ts   # Gestion des matchs
│   ├── useTeams.ts     # Gestion des équipes
│   ├── useUsers.ts     # Gestion des utilisateurs
│   └── useVenues.ts    # Gestion des lieux
├── lib/                # Utilitaires et configuration
│   ├── supabase.ts     # Configuration Supabase
│   └── utils.ts        # Fonctions utilitaires
├── pages/              # Pages de l'application
│   ├── Auth.tsx        # Page d'authentification
│   ├── Home.tsx        # Page d'accueil
│   ├── NewMatch.tsx    # Création de match
│   ├── MatchPlay.tsx   # Interface de jeu
│   ├── History.tsx     # Historique
│   └── Rankings.tsx    # Classements
└── main.tsx            # Point d'entrée
```

### Modèle de données

#### Tables principales
- **users** : Profils utilisateurs
- **venues** : Lieux (bars, entreprises, etc.)
- **tables** : Tables de baby-foot avec QR codes
- **teams** : Équipes (permanentes ou temporaires)
- **matches** : Matchs avec scores et règles
- **match_events** : Événements de match (buts, annulations)
- **ratings** : Classements Elo des joueurs
- **tournaments** : Tournois et brackets

## 🎮 Utilisation

### Créer un match
1. Connectez-vous avec votre email
2. Cliquez sur "Nouveau Match"
3. Choisissez le mode (1v1, 2v2)
4. Sélectionnez les joueurs/équipes
5. Configurez les règles
6. Commencez à jouer !

### Marquer des buts
- Interface tap-to-score avec gros boutons
- Possibilité d'annuler le dernier but
- Validation double des scores
- Historique complet des événements

### Consulter les classements
- Classements par mode de jeu
- Statistiques détaillées (winrate, séries, etc.)
- Badges et succès automatiques
- Historique des performances

## 🔧 Développement

### Scripts disponibles
```bash
npm run dev          # Développement
npm run build        # Production
npm run preview      # Prévisualisation build
npm run lint         # Linting
```

### Ajouter une nouvelle fonctionnalité
1. Créez les types dans `src/lib/supabase.ts`
2. Ajoutez les hooks dans `src/hooks/`
3. Créez les composants dans `src/components/`
4. Ajoutez les routes dans `src/App.tsx`

### Tests
```bash
npm run test         # Tests unitaires
npm run test:e2e     # Tests end-to-end
```

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes
- **Netlify** : Compatible
- **Railway** : Compatible
- **Fly.io** : Compatible

## 📱 PWA

L'application est configurée pour fonctionner comme une PWA :
- Installation sur mobile/desktop
- Fonctionnalités offline (en développement)
- Notifications push (en développement)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : [Wiki du projet](link-to-wiki)
- **Issues** : [GitHub Issues](link-to-issues)
- **Discord** : [Serveur communautaire](link-to-discord)

## 🗺️ Roadmap

### MVP (Actuel)
- ✅ Authentification par email
- ✅ Création et gestion de matchs
- ✅ Système de scoring
- ✅ Classements de base
- ✅ Interface mobile-first

### v1.0 (Prochainement)
- 🔄 Tournois avec brackets
- 🔄 Système d'invitations
- 🔄 Notifications push
- 🔄 Mode PWA complet
- 🔄 Intégrations tierces

### v2.0 (Futur)
- 🔮 IA pour équilibrage des équipes
- 🔮 Statistiques avancées
- 🔮 Mode spectateur
- 🔮 API publique
- 🔮 Applications mobiles natives

---

**MHBABY** - Transformez vos parties de baby-foot en compétitions épiques ! 🏆⚽
