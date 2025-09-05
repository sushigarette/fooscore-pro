# Guide de Configuration MHBABY 🚀

## Étape 1: Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub ou créez un compte
4. Cliquez sur "New Project"
5. Choisissez votre organisation
6. Donnez un nom à votre projet (ex: "mhbaby-pro")
7. Créez un mot de passe pour la base de données
8. Choisissez une région proche de vous
9. Cliquez sur "Create new project"

## Étape 2: Configurer la base de données

1. Une fois le projet créé, allez dans **SQL Editor** (dans le menu de gauche)
2. Cliquez sur "New query"
3. Copiez le contenu du fichier `supabase-setup.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" (ou Ctrl+Enter)

**Note:** Si vous obtenez une erreur sur `app.jwt_secret`, ignorez-la - c'est normal, Supabase gère cela automatiquement.

## Étape 3: Configurer l'authentification

1. Allez dans **Authentication** > **Settings**
2. Dans la section "Site URL", mettez :
   - Pour le développement : `http://localhost:5173`
   - Pour la production : votre URL de déploiement
3. Dans "Redirect URLs", ajoutez :
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/`
4. Désactivez "Enable email confirmations" (nous utilisons le code magique)
5. Cliquez sur "Save"

## Étape 4: Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: `https://your-project.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

## Étape 5: Configurer l'environnement local

1. Dans votre projet, créez un fichier `.env` :
```bash
cp env.example .env
```

2. Éditez le fichier `.env` avec vos clés :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=MHBABY
VITE_APP_VERSION=1.0.0
```

## Étape 6: Tester l'application

1. Installez les dépendances :
```bash
npm install
```

2. Lancez l'application :
```bash
npm run dev
```

3. Ouvrez `http://localhost:5173`
4. Testez la connexion en cliquant sur "Se connecter"
5. Entrez votre email et vérifiez que vous recevez le code de connexion

## Étape 7: Vérifier la configuration

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir les tables créées :
   - `users`
   - `venues`
   - `tables`
   - `teams`
   - `team_members`
   - `matches`
   - `match_events`
   - `ratings`

3. Dans **Authentication** > **Users**, vous devriez voir votre utilisateur après connexion

## Dépannage

### Erreur "permission denied to set parameter app.jwt_secret"
- **Solution** : Ignorez cette erreur, c'est normal. Supabase gère automatiquement ce paramètre.

### Erreur de connexion
- Vérifiez que vos clés API sont correctes
- Vérifiez que l'URL de redirection est configurée
- Vérifiez que l'email de confirmation est désactivé

### Tables non créées
- Vérifiez que le script SQL s'est bien exécuté
- Regardez les logs dans l'éditeur SQL de Supabase
- Vérifiez que vous avez les permissions nécessaires

### Erreur "Invalid API key"
- Vérifiez que vous utilisez la clé `anon public` et non la clé `service_role`
- Vérifiez que l'URL du projet est correcte

## Configuration pour la production

1. **Déploiement Vercel** :
   - Connectez votre repo GitHub à Vercel
   - Ajoutez les variables d'environnement dans Vercel
   - Mettez à jour les URLs de redirection dans Supabase

2. **Autres plateformes** :
   - Ajoutez les variables d'environnement
   - Mettez à jour les URLs de redirection

## Fonctionnalités avancées

### Activer les notifications en temps réel
1. Dans Supabase, allez dans **Database** > **Replication**
2. Activez la réplication en temps réel pour les tables nécessaires

### Configurer le stockage (pour les avatars)
1. Dans Supabase, allez dans **Storage**
2. Créez un bucket `avatars`
3. Configurez les politiques de sécurité

### Activer les Edge Functions (optionnel)
1. Dans Supabase, allez dans **Edge Functions**
2. Créez des fonctions pour la logique métier avancée

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs dans Supabase > **Logs**
3. Consultez la [documentation Supabase](https://supabase.com/docs)
4. Ouvrez une issue sur GitHub

---

**MHBABY** est maintenant configuré et prêt à l'emploi ! 🏆⚽ 