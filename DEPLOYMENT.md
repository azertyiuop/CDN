# 🚀 Guide de Déploiement

Ce guide vous aide à déployer votre plateforme de streaming sur Vercel (frontend) et Railway (backend).

## 📦 Frontend - Vercel

### 1. Préparation

Assurez-vous que votre projet est dans un dépôt Git (GitHub, GitLab, ou Bitbucket).

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

### 2. Déploiement sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New Project"**
3. Importez votre dépôt Git
4. Configurez les paramètres :
   - **Framework Preset** : Vite
   - **Root Directory** : `./` (racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

5. **Variables d'environnement** (dans Settings → Environment Variables) :
   ```
   VITE_API_URL=https://votre-backend-railway.railway.app/api
   VITE_WS_URL=wss://votre-backend-railway.railway.app
   VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. Cliquez sur **"Deploy"**

### 3. Après le déploiement

Une fois déployé, mettez à jour l'URL dans votre fichier `.env.production` avec l'URL Railway de votre backend.

---

## 🚂 Backend - Railway

### 1. Préparation du Backend

Créez un fichier `server/.env` avec votre configuration :

```env
# Configuration serveur
WS_PORT=3001
NODE_ENV=production

# Clés de sécurité
ENCRYPTION_KEY=votre_cle_de_chiffrement_securisee
ADMIN_ACCESS_CODE=votre_code_admin_securise

# Mots de passe des rôles
MOD_PASSWORD=votre_mot_de_passe_mod
MODERATOR_PASSWORD=votre_mot_de_passe_moderator
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Discord Bot (optionnel)
DISCORD_BOT_TOKEN=votre_token_discord
DISCORD_WEBHOOK_URL=votre_webhook_url

# CORS - URL de votre frontend Vercel
ALLOWED_ORIGINS=https://votre-frontend.vercel.app
```

### 2. Créer un fichier Procfile

Créez `server/Procfile` :

```
web: node index.mjs
```

### 3. Déploiement sur Railway

1. Allez sur [railway.app](https://railway.app) et connectez-vous
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez votre dépôt
5. Configurez les paramètres :
   - **Root Directory** : `server/`
   - **Build Command** : `npm install`
   - **Start Command** : `node index.mjs`

6. **Variables d'environnement** (dans Variables tab) :
   - Ajoutez toutes les variables de votre fichier `.env`
   - Railway génère automatiquement `PORT` - utilisez-le

7. Cliquez sur **"Deploy"**

### 4. Configuration CORS

Dans votre `server/index.mjs`, assurez-vous que CORS est configuré :

```javascript
// Récupérer l'origine autorisée depuis les variables d'environnement
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

// Configuration CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

### 5. Port WebSocket

Railway attribue automatiquement un port via la variable `PORT`. Modifiez votre configuration :

```javascript
const WS_PORT = process.env.PORT || 3001;
```

---

## ⚠️ Important - Base de données

### Option 1 : SQLite (Simple, mais limitations)

Railway prend en charge SQLite, mais **attention** :
- Les fichiers SQLite sont **éphémères** sur Railway
- À chaque redéploiement, votre base de données sera **réinitialisée**
- Convient pour des tests, **pas pour la production**

### Option 2 : PostgreSQL (Recommandé pour production)

Railway propose PostgreSQL gratuit :

1. Dans votre projet Railway, cliquez sur **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway créera automatiquement la base de données
3. Les variables d'environnement seront ajoutées automatiquement :
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

4. Modifiez votre code backend pour utiliser PostgreSQL au lieu de SQLite

---

## 🔄 Mises à jour

### Frontend (Vercel)
Les mises à jour sont automatiques à chaque push sur votre branche principale.

### Backend (Railway)
Les mises à jour sont automatiques à chaque push sur votre branche principale.

Pour forcer un redéploiement :
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

---

## 🧪 Test du déploiement

1. Accédez à votre URL Vercel
2. Vérifiez que la console ne montre pas d'erreurs
3. Testez la connexion WebSocket
4. Testez l'authentification
5. Testez le chat
6. Testez l'admin panel

---

## 🐛 Dépannage

### WebSocket ne se connecte pas

1. Vérifiez les logs Railway pour voir si le serveur démarre
2. Vérifiez que `VITE_WS_URL` est correctement défini sur Vercel
3. Vérifiez les logs de la console navigateur (F12)

### Erreurs CORS

1. Vérifiez `ALLOWED_ORIGINS` dans Railway
2. Ajoutez votre URL Vercel exacte (sans `/` à la fin)
3. Redéployez le backend

### Base de données réinitialisée

1. C'est normal avec SQLite sur Railway
2. Migrez vers PostgreSQL pour la persistance

### Variables d'environnement

1. Sur Vercel : Variables → Add → Redeploy
2. Sur Railway : Variables → Add → Redeploy automatique

---

## 📝 Checklist finale

- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Railway
- [ ] Variables d'environnement configurées des deux côtés
- [ ] CORS configuré avec l'URL Vercel
- [ ] WebSocket fonctionne
- [ ] Base de données accessible (ou migrée vers PostgreSQL)
- [ ] Tests complets effectués
- [ ] URLs mises à jour dans la documentation

---

## 🎉 C'est fait !

Votre plateforme de streaming est maintenant en ligne !

- Frontend : `https://votre-app.vercel.app`
- Backend : `https://votre-app.railway.app`
