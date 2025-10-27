# Guide de Configuration Railway

Ce guide vous explique comment connecter votre frontend avec votre backend déployé sur Railway.

## Architecture

Le projet utilise maintenant un serveur unifié pour la production qui combine:
- WebSocket (chat en temps réel)
- API REST (analytics, modération, etc.)
- HLS (streaming vidéo)

Tout fonctionne sur un seul port fourni par Railway via la variable `PORT`.

---

## 1. Déploiement Backend sur Railway

### Étape 1: Créer un projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Project"**
4. Sélectionnez **"Deploy from GitHub repo"**
5. Choisissez votre repository

### Étape 2: Configuration du projet

Dans les settings de votre projet Railway:

**Root Directory:** `server`

Railway détectera automatiquement le `package.json` et utilisera `node index.mjs` comme commande de démarrage.

### Étape 3: Variables d'environnement Railway

Ajoutez ces variables dans l'onglet **"Variables"**:

```env
NODE_ENV=production
ENCRYPTION_KEY=votre_cle_securisee_32_caracteres
JWT_SECRET=votre_jwt_secret_64_caracteres
ADMIN_ACCESS_CODES=ADMIN_BOLT_2025,SUPERADMIN_2025
FRONTEND_URL=https://votre-app.vercel.app
ALLOWED_ORIGINS=https://votre-app.vercel.app,https://votre-domaine.com
DATABASE_URL=postgresql://...
```

**IMPORTANT:**
- `PORT` est automatiquement fourni par Railway, ne le définissez PAS
- Remplacez `FRONTEND_URL` et `ALLOWED_ORIGINS` par votre URL Vercel/Netlify réelle
- `DATABASE_URL` doit pointer vers votre base Supabase PostgreSQL

### Étape 4: Obtenir l'URL Railway

Une fois déployé, Railway vous donne une URL du type:
```
https://votre-projet-production.up.railway.app
```

Copiez cette URL, vous en aurez besoin pour le frontend.

---

## 2. Configuration Frontend

### Étape 1: Mettre à jour .env.production

Ouvrez le fichier `.env.production` à la racine de votre projet et remplacez:

```env
# Remplacez par votre vraie URL Railway
VITE_API_URL=https://votre-projet-production.up.railway.app/api
VITE_WS_URL=wss://votre-projet-production.up.railway.app
VITE_HLS_URL=https://votre-projet-production.up.railway.app

# Ces valeurs restent identiques
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANT:**
- Utilisez `https://` pour l'API et HLS
- Utilisez `wss://` pour WebSocket (sécurisé)
- N'oubliez PAS `/api` à la fin de `VITE_API_URL`
- Pas de slash `/` final sur les URLs

### Étape 2: Déployer sur Vercel/Netlify

#### Pour Vercel:

1. Allez sur [vercel.com](https://vercel.com)
2. Importez votre repository GitHub
3. Dans **Environment Variables**, ajoutez les mêmes variables que dans `.env.production`
4. Déployez

#### Pour Netlify:

1. Allez sur [netlify.com](https://netlify.com)
2. Importez votre repository GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Dans **Environment Variables**, ajoutez les variables
6. Déployez

---

## 3. Finaliser la Configuration

### Étape 1: Mettre à jour CORS sur Railway

Une fois votre frontend déployé, récupérez l'URL exacte (ex: `https://votre-app.vercel.app`)

Retournez dans Railway → Variables et mettez à jour:

```env
FRONTEND_URL=https://votre-app.vercel.app
ALLOWED_ORIGINS=https://votre-app.vercel.app
```

**Redéployez** le backend Railway après cette modification.

### Étape 2: Tester la connexion

Ouvrez votre site et vérifiez dans la console (F12):

✅ **Connexion réussie si vous voyez:**
```
WebSocket connected successfully
```

❌ **Erreurs possibles:**

**CORS Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
→ Vérifiez que `ALLOWED_ORIGINS` dans Railway contient votre URL exacte

**WebSocket Error:**
```
WebSocket connection failed
```
→ Vérifiez que vous utilisez `wss://` (pas `ws://`)

**404 Not Found:**
```
GET https://your-app/api/analytics/dashboard 404
```
→ Vérifiez que `/api` est bien dans `VITE_API_URL`

---

## 4. Architecture du Serveur Unifié

Le serveur unifié (`unified-server.mjs`) gère:

### Endpoints API
```
GET  /health
GET  /api/analytics/dashboard
GET  /api/analytics/messages
GET  /api/moderation/banned
POST /api/moderation/ban
... etc
```

### WebSocket
```
wss://votre-app.railway.app
```

### HLS Streaming
```
https://votre-app.railway.app/live/{stream_key}/index.m3u8
```

---

## 5. Base de Données Supabase

### Configuration recommandée:

Votre `DATABASE_URL` dans Railway doit pointer vers Supabase:

```env
DATABASE_URL=postgresql://postgres:password@db.xyz.supabase.co:5432/postgres
```

Vous pouvez trouver cette URL dans:
1. Dashboard Supabase
2. Settings → Database
3. Connection string → URI

---

## 6. Vérification Finale

### Checklist:

- [ ] Backend déployé sur Railway
- [ ] Variable `NODE_ENV=production` définie sur Railway
- [ ] Variables `ALLOWED_ORIGINS` et `FRONTEND_URL` configurées
- [ ] Frontend déployé sur Vercel/Netlify
- [ ] Variables d'environnement configurées sur Vercel/Netlify
- [ ] `.env.production` contient les bonnes URLs Railway
- [ ] WebSocket se connecte sans erreur
- [ ] API répond correctement (testez `/health`)
- [ ] CORS fonctionne (pas d'erreurs dans la console)

---

## 7. Tests Rapides

### Test 1: Health Check
```bash
curl https://votre-app.railway.app/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T...",
  "environment": "production",
  "port": 3001
}
```

### Test 2: WebSocket
Ouvrez la console de votre navigateur sur votre site et vérifiez:
```
WebSocket connected successfully
```

### Test 3: API
Dans la console de votre site:
```javascript
fetch('https://votre-app.railway.app/api/analytics/dashboard')
  .then(r => r.json())
  .then(console.log)
```

---

## 8. Dépannage

### Le serveur ne démarre pas sur Railway

Vérifiez les logs Railway:
```
Railway Dashboard → Deployments → View Logs
```

Erreurs communes:
- `MODULE_NOT_FOUND`: Vérifiez que `package.json` contient toutes les dépendances
- `Port already in use`: Railway gère automatiquement le port
- `Database connection failed`: Vérifiez votre `DATABASE_URL`

### WebSocket ne se connecte pas

1. Vérifiez que vous utilisez `wss://` (pas `ws://`)
2. Vérifiez que Railway n'a pas de firewall bloquant les WebSocket
3. Testez avec: `wscat -c wss://votre-app.railway.app`

### Erreurs CORS persistantes

1. Vérifiez que `ALLOWED_ORIGINS` contient l'URL exacte (sans `/` final)
2. Effacez le cache de votre navigateur
3. Vérifiez dans Network tab (F12) que les headers CORS sont présents
4. Redéployez Railway après avoir modifié les variables

---

## 9. URLs de Référence

**Développement Local:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3002/api`
- Backend WebSocket: `ws://localhost:3001`
- HLS: `http://localhost:8003`

**Production:**
- Frontend: `https://votre-app.vercel.app`
- Backend (tout): `https://votre-app.railway.app`
- API: `https://votre-app.railway.app/api`
- WebSocket: `wss://votre-app.railway.app`
- HLS: `https://votre-app.railway.app/live/{key}/index.m3u8`

---

## 10. Commandes Utiles

### Tester localement en mode production:
```bash
cd server
NODE_ENV=production PORT=3001 node index.mjs
```

### Redéployer Railway:
```bash
git add .
git commit -m "Update configuration"
git push
```

Railway redéploie automatiquement.

### Redéployer Vercel:
```bash
vercel --prod
```

---

## Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs Railway
2. Vérifiez la console navigateur (F12)
3. Testez le endpoint `/health`
4. Vérifiez que toutes les variables d'environnement sont définies
5. Assurez-vous que CORS est correctement configuré

Le serveur unifié simplifie grandement le déploiement sur Railway en utilisant un seul port pour tous les services!
