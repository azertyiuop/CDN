# Guide de Déploiement - ABD Stream

## Modifications effectuées pour le déploiement

Votre projet a été préparé pour un déploiement séparé backend/frontend.

### 📝 Modifications Backend (dossier `server/`)

#### 1. **server/config.mjs**
- ✅ Toutes les configurations utilisent maintenant des variables d'environnement
- ✅ Valeurs par défaut conservées pour le développement local
- ✅ Support pour Railway et production

Variables disponibles :
```javascript
PORT, API_PORT, RTMP_PORT, HTTP_PORT
ENCRYPTION_KEY, ADMIN_ACCESS_CODES
JWT_SECRET, DATABASE_URL
DISCORD_BOT_TOKEN, DISCORD_WEBHOOK_URL
FRONTEND_URL, ALLOWED_ORIGINS
```

#### 2. **server/api-server.mjs**
- ✅ CORS configuré avec `ALLOWED_ORIGINS`
- ✅ Support pour plusieurs origines (Vercel + localhost)
- ✅ Port configurable via `API_PORT`

#### 3. **Nouveaux fichiers backend**
- ✅ `server/.env.example` - Template des variables d'environnement
- ✅ `server/.gitignore` - Ignore node_modules, .env, logs, etc.
- ✅ `server/Procfile` - Commande de démarrage pour Railway
- ✅ `server/railway.json` - Configuration Railway

### 📝 Modifications Frontend (dossier racine)

#### 1. **src/services/websocket.ts**
- ✅ WebSocket simplifié pour utiliser `VITE_WS_URL`
- ✅ Plus de détection d'environnement complexe
- ✅ Fallback sur `ws://localhost:3001` pour dev local

#### 2. **Nouveaux fichiers frontend**
- ✅ `.env.example` - Template des variables d'environnement frontend

### 🚀 Comment déployer maintenant

#### Option 1 : Deux repos séparés (Recommandé)

**Backend → Railway**
1. Créer un repo GitHub pour le backend
2. Copier tout le contenu de `server/` vers ce repo
3. Déployer sur Railway
4. Configurer les variables d'environnement depuis `server/.env.example`

**Frontend → Vercel**
1. Créer un repo GitHub pour le frontend
2. Copier la racine du projet (sans `server/`)
3. Déployer sur Vercel
4. Configurer les variables d'environnement depuis `.env.example`

#### Option 2 : Mono-repo (Plus simple pour commencer)

**Backend → Railway**
1. Pusher tout le projet sur GitHub
2. Déployer le dossier `server/` sur Railway
3. Dans Railway, définir le "Root Directory" sur `server`
4. Configurer les variables d'environnement

**Frontend → Vercel**
1. Même repo GitHub
2. Déployer la racine sur Vercel
3. Configurer les variables d'environnement

### ⚙️ Configuration des variables d'environnement

#### Railway (Backend)
```env
PORT=3001
API_PORT=3002
RTMP_PORT=1935
HTTP_PORT=8003

ENCRYPTION_KEY=VotreCléSécurisée32Caractères
ADMIN_ACCESS_CODES=ADMIN_BOLT_2025,VOTRE_CODE

JWT_SECRET=VotreSecretJWT32Caractères
DATABASE_URL=postgresql://... (si vous utilisez Supabase)

DISCORD_BOT_TOKEN=votre_token (optionnel)
DISCORD_WEBHOOK_URL=votre_webhook (optionnel)

FRONTEND_URL=https://votre-app.vercel.app
ALLOWED_ORIGINS=https://votre-app.vercel.app,http://localhost:5173
```

#### Vercel (Frontend)
```env
VITE_WS_URL=wss://votre-backend.railway.app
VITE_API_URL=https://votre-backend.railway.app/api
VITE_HLS_URL=https://votre-backend.railway.app
```

### ✅ Checklist de déploiement

#### Avant de déployer :
- [ ] Générer des clés sécurisées pour `ENCRYPTION_KEY` et `JWT_SECRET`
- [ ] Changer les codes admin par défaut
- [ ] Décider entre mono-repo ou repos séparés

#### Backend (Railway) :
- [ ] Créer le projet Railway
- [ ] Configurer toutes les variables d'environnement
- [ ] Déployer et noter l'URL Railway
- [ ] Vérifier les logs - pas d'erreurs

#### Frontend (Vercel) :
- [ ] Créer le projet Vercel
- [ ] Configurer les variables d'environnement avec l'URL Railway
- [ ] Déployer et noter l'URL Vercel
- [ ] Vérifier dans la console - WebSocket connecté

#### Après déploiement :
- [ ] Retourner sur Railway
- [ ] Mettre à jour `FRONTEND_URL` avec l'URL Vercel
- [ ] Mettre à jour `ALLOWED_ORIGINS` avec l'URL Vercel
- [ ] Attendre le redéploiement automatique
- [ ] Tester l'application complète

### 🧪 Tester en local

Avec les nouvelles modifications, le projet fonctionne toujours en local :

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

Le frontend se connectera automatiquement à `ws://localhost:3001` (valeur par défaut).

### 📚 Documentation complète

Pour un guide détaillé étape par étape, consultez le package de déploiement créé dans `/tmp/cc-agent/59249647/` :
- `README.md` - Vue d'ensemble
- `QUICK_START.md` - Déploiement rapide (30 min)
- `DEPLOYMENT_GUIDE.md` - Guide complet détaillé

### 🔒 Sécurité

**Important** :
- Ne jamais committer le fichier `.env` (déjà dans .gitignore)
- Utiliser des clés fortes en production (32+ caractères)
- Changer tous les codes/mots de passe par défaut
- Configurer CORS correctement (pas de `*` en production)

### 💡 Conseils

1. **Déployer le backend d'abord** - Vous aurez besoin de son URL pour le frontend
2. **Tester localement** - Vérifier que tout fonctionne avant de déployer
3. **Vérifier les logs** - Railway et Vercel ont d'excellents outils de logs
4. **CORS** - La cause #1 des problèmes post-déploiement, vérifier `ALLOWED_ORIGINS`

### 🆘 Problèmes courants

**WebSocket ne se connecte pas**
- Vérifier `VITE_WS_URL` utilise `wss://` (pas `ws://`) en production
- Vérifier que Railway expose bien le port WebSocket
- Vérifier les logs Railway pour erreurs

**Erreurs CORS**
- Vérifier `ALLOWED_ORIGINS` dans Railway contient l'URL Vercel exacte
- Inclure `https://` au début
- Pas d'espace dans la liste des origines

**Le build échoue**
- Vérifier toutes les dépendances dans `package.json`
- Tester `npm run build` localement
- Vérifier les logs de build sur Vercel/Railway

### 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

Votre projet est maintenant prêt pour le déploiement ! 🚀
