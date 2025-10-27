# 🔧 Fix Railway - Caddy au lieu de Node.js

## Problème

Railway démarre Caddy (serveur web) au lieu de ton application Node.js.

## Solution rapide

### Option 1 : Via l'interface Railway (Recommandé)

1. **Va dans ton projet Railway**
2. **Clique sur ton service**
3. **Va dans l'onglet "Settings"**
4. **Cherche "Start Command"**
5. **Entre cette commande :**
   ```
   node index.mjs
   ```
6. **Sauvegarde et redéploie**

### Option 2 : Variable d'environnement

Ajoute cette variable dans Railway :

```
NIXPACKS_NO_CACHE=1
```

Puis redéploie.

### Option 3 : Mise à jour des fichiers

Si les options ci-dessus ne marchent pas :

1. **Assure-toi que ces fichiers sont présents :**
   - ✅ `package.json` avec `"type": "module"` et `"engines"`
   - ✅ `nixpacks.toml` (nouveau fichier créé)
   - ✅ `railway.json` (mis à jour)
   - ✅ `Procfile`

2. **Commit et push les changements**

3. **Dans Railway Settings, va dans "Deploy"**
   - **Build Command:** Laisse vide ou `npm ci`
   - **Start Command:** `node index.mjs`
   - **Watch Paths:** Laisse vide

4. **Redéploie**

## Vérification

Dans les logs Railway, tu dois voir :

```
✅ npm install terminé
✅ WebSocket server démarré sur port 3001
✅ API Server démarré sur port 3002
✅ RTMP server démarré sur port 1935
```

Et **PAS** :

```
❌ started background certificate maintenance
❌ HTTP/2 skipped because it requires TLS
❌ server running
```

## Structure des fichiers

Ton dossier `server/` doit contenir :

```
server/
├── api/
├── lib/
├── data/
├── index.mjs              ← Point d'entrée principal
├── package.json           ← DOIT avoir "type": "module"
├── nixpacks.toml          ← Nouveau (force Node.js)
├── railway.json           ← Mis à jour
├── Procfile               ← Commande start
├── .env.example
└── .gitignore
```

## Si ça ne marche toujours pas

### Vérification 1 : Root Directory

Dans Railway Settings :
- **Root Directory:** Vérifie que c'est bien `server` (si ton projet est un mono-repo)
- Ou laisse vide si tu as déployé juste le dossier server/

### Vérification 2 : Build Logs

Regarde les logs de build Railway :
- Cherche "Detected" - ça doit dire "Node.js" pas "Caddy"
- Si tu vois "Caddyfile detected", c'est qu'il y a un fichier Caddy dans ton repo

### Vérification 3 : Fichiers cachés

Vérifie qu'il n'y a pas de Caddyfile ou fichier caddy caché :

```bash
ls -la server/ | grep -i caddy
```

Si tu trouves des fichiers caddy, supprime-les.

## Solution de dernier recours

Si vraiment rien ne marche :

1. **Supprime le projet Railway**
2. **Crée un nouveau projet**
3. **Cette fois, configure manuellement :**
   - Builder: Nixpacks
   - Build Command: `npm ci`
   - Start Command: `node index.mjs`
4. **Redéploie**

## Variables d'environnement à configurer

N'oublie pas de configurer (depuis `.env.example`) :

```
PORT=3001
API_PORT=3002
RTMP_PORT=1935
HTTP_PORT=8003
ENCRYPTION_KEY=ta_clé
ADMIN_ACCESS_CODES=tes_codes
JWT_SECRET=ton_secret
FRONTEND_URL=https://ton-app.vercel.app
ALLOWED_ORIGINS=https://ton-app.vercel.app
```

## Résultat attendu

Une fois que ça marche, dans les logs Railway tu verras :

```
> abd-stream-server@1.0.0 start
> node index.mjs

✅ API Server démarré sur http://localhost:3002
✅ WebSocket Server listening on port 3001
✅ RTMP server started on port 1935
```

Et ton application répondra sur l'URL Railway !

---

**Note :** Railway détecte automatiquement le type de projet. Si tu as un Caddyfile quelque part dans ton repo, Railway pense que c'est un projet Caddy. Les fichiers `nixpacks.toml` et `railway.json` mis à jour forcent la détection Node.js.
