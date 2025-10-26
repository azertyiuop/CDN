# 🚀 ABD Stream - Prêt pour le déploiement !

## ✅ Modifications terminées

Votre projet a été configuré pour un déploiement séparé backend/frontend.

```
📦 Projet ABD Stream
│
├── 🔧 Backend (server/)
│   ├── ✅ config.mjs              → Variables d'environnement
│   ├── ✅ api-server.mjs          → CORS configuré
│   ├── ✅ .env.example            → Template des variables
│   ├── ✅ .gitignore              → Fichiers à ignorer
│   ├── ✅ Procfile                → Railway start command
│   └── ✅ railway.json            → Config Railway
│
└── 🎨 Frontend (racine)
    ├── ✅ src/services/websocket.ts → WebSocket simplifié
    ├── ✅ .env.example              → Variables frontend
    ├── 📚 DEPLOYMENT_README.md      → Guide de déploiement
    ├── 📋 CHANGES.md                → Liste des modifications
    └── 📖 START_HERE.md             → Ce fichier
```

## 📖 Guides disponibles

1. **START_HERE.md** (ce fichier) - Vue d'ensemble rapide
2. **DEPLOYMENT_README.md** - Guide de déploiement complet
3. **CHANGES.md** - Détail de toutes les modifications

## 🎯 2 Options de déploiement

### Option A : Mono-repo (Plus simple)
Un seul repo GitHub, déploiements séparés

```
GitHub Repo
├── Backend → Railway (dossier server/)
└── Frontend → Vercel (racine)
```

**Avantages :**
- ✅ Un seul repo à gérer
- ✅ Plus facile pour débuter
- ✅ Historique unifié

### Option B : Deux repos séparés (Professionnel)
Deux repos GitHub distincts

```
GitHub
├── abd-stream-backend → Railway
└── abd-stream-frontend → Vercel
```

**Avantages :**
- ✅ Séparation claire des concerns
- ✅ Permissions granulaires
- ✅ CI/CD indépendants

## 🚀 Déploiement rapide (30 minutes)

### 1️⃣ Backend sur Railway (10 min)

```bash
# 1. Créer compte Railway
https://railway.app

# 2. Nouveau projet → Deploy from GitHub

# 3. Configurer ces variables d'environnement :
PORT=3001
API_PORT=3002
ENCRYPTION_KEY=génére_une_clé_32_caractères
ADMIN_ACCESS_CODES=ADMIN_BOLT_2025,TON_CODE
JWT_SECRET=génère_un_secret_32_caractères
# (voir server/.env.example pour la liste complète)

# 4. Obtenir URL Railway
# Exemple : https://abd-stream-backend.up.railway.app
```

### 2️⃣ Frontend sur Vercel (10 min)

```bash
# 1. Créer compte Vercel
https://vercel.com

# 2. Nouveau projet → Import from GitHub

# 3. Configurer ces variables d'environnement :
VITE_WS_URL=wss://TON-URL.railway.app
VITE_API_URL=https://TON-URL.railway.app/api
VITE_HLS_URL=https://TON-URL.railway.app
# (remplacer TON-URL par ton URL Railway)

# 4. Obtenir URL Vercel
# Exemple : https://abd-stream.vercel.app
```

### 3️⃣ Finaliser CORS (5 min)

```bash
# Retourner sur Railway → Variables
# Ajouter/Modifier :
FRONTEND_URL=https://ton-app.vercel.app
ALLOWED_ORIGINS=https://ton-app.vercel.app

# Railway va redéployer automatiquement
```

### 4️⃣ Tester (5 min)

1. Ouvrir ton URL Vercel
2. Appuyer sur F12 (console navigateur)
3. Vérifier : "WebSocket connected successfully" ✅
4. Envoyer un message de chat
5. Tester l'accès admin avec ton code

## ⚙️ Variables d'environnement

### Backend (Railway)

Copier depuis `server/.env.example` :

```env
# Ports
PORT=3001
API_PORT=3002
RTMP_PORT=1935
HTTP_PORT=8003

# Sécurité (CHANGER EN PRODUCTION !)
ENCRYPTION_KEY=ta_clé_sécurisée_32_caractères
ADMIN_ACCESS_CODES=ADMIN_BOLT_2025,TON_CODE
JWT_SECRET=ton_secret_jwt_32_caractères

# CORS (ajouter après déploiement frontend)
FRONTEND_URL=https://ton-app.vercel.app
ALLOWED_ORIGINS=https://ton-app.vercel.app

# Optionnel
DATABASE_URL=postgresql://...  (Supabase)
DISCORD_BOT_TOKEN=ton_token
```

### Frontend (Vercel)

Copier depuis `.env.example` :

```env
# Production
VITE_WS_URL=wss://ton-backend.railway.app
VITE_API_URL=https://ton-backend.railway.app/api
VITE_HLS_URL=https://ton-backend.railway.app
```

## 🧪 Tester en local d'abord

Tout fonctionne encore en local sans configuration :

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

Ouvre http://localhost:5173 - tout devrait marcher ! ✅

## 📚 Documentation complète

Pour plus de détails, ouvre **DEPLOYMENT_README.md**

## 🆘 Problèmes courants

### ❌ WebSocket ne se connecte pas
```
Vérifier :
- VITE_WS_URL utilise wss:// (pas ws://)
- Backend Railway est bien démarré
- Pas d'erreur dans les logs Railway
```

### ❌ Erreurs CORS
```
Vérifier :
- ALLOWED_ORIGINS contient l'URL Vercel EXACTE
- Inclut https:// au début
- Pas d'espace entre les URLs
```

### ❌ Le build échoue
```
Tester localement :
npm run build

Si ça marche localement mais pas sur Vercel :
- Vérifier les variables d'environnement
- Vérifier les logs de build Vercel
```

## 🎓 Ressources

- **Railway Docs :** https://docs.railway.app
- **Vercel Docs :** https://vercel.com/docs
- **Guide Déploiement :** DEPLOYMENT_README.md
- **Liste des changements :** CHANGES.md

## ✨ Prochaines étapes recommandées

Après déploiement réussi :

1. ✅ Ajouter un nom de domaine personnalisé
2. ✅ Configurer Supabase (base de données production)
3. ✅ Activer le bot Discord (optionnel)
4. ✅ Configurer les règles d'auto-modération
5. ✅ Inviter des utilisateurs de test
6. ✅ Monitorer les logs et performances

## 💡 Conseils de pro

- 🔐 **Sécurité** : Change TOUS les mots de passe/codes par défaut
- 🔑 **Clés** : Génère des clés vraiment aléatoires (32+ caractères)
- 📊 **Monitoring** : Active les alertes Railway et Vercel
- 💾 **Base de données** : Utilise Supabase pour la production
- 🔄 **Backups** : Configure des backups automatiques
- 📱 **Mobile** : Teste sur différents appareils

## ✅ Checklist finale

Avant de considérer le déploiement comme terminé :

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] WebSocket connecté (console browser)
- [ ] Chat fonctionne (envoi/réception)
- [ ] Admin panel accessible
- [ ] Pas d'erreurs CORS
- [ ] Codes admin changés
- [ ] Clés de sécurité générées
- [ ] Variables d'environnement configurées
- [ ] Testé sur mobile
- [ ] Documentation à jour

## 🎉 Félicitations !

Ton projet est maintenant configuré pour le déploiement professionnel !

**Prochaine étape :** Ouvre **DEPLOYMENT_README.md** et suis le guide.

---

💪 Tu vas y arriver ! En cas de problème, relis les guides et vérifie les logs.

**Bonne chance avec ton déploiement ! 🚀**
