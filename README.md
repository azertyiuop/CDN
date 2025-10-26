# 🎥 ABD Stream - Plateforme de Streaming

Une plateforme de streaming moderne avec chat en temps réel, support RTMP, et panel d'administration complet, 100% localhost avec SQLite.

## ✨ Fonctionnalités

### 🎬 Streaming
- **Support RTMP** - Streamez directement depuis OBS Studio
- **Lecteur HLS** - Lecture adaptative avec contrôles complets
- **Détection automatique** - Les streams sont détectés automatiquement
- **Multi-streams** - Support de plusieurs streams simultanés

### 💬 Chat en Temps Réel
- **Chat global** - Discussion générale de la plateforme
- **Chat par stream** - Chat dédié pour chaque stream
- **Historique persistant** - Stocké dans SQLite local
- **Modération en direct** - Mute et ban en temps réel

### 👑 Panel Administrateur
- **Gestion des streams** - Créer et gérer les streams
- **Modération des utilisateurs** - Ban, mute, gestion des rôles
- **Statistiques en temps réel** - Viewers, messages, activité
- **Logs de sécurité** - Toutes les actions sont enregistrées

### 🔒 Sécurité
- **Base locale SQLite** - Aucune exposition réseau de la base de données
- **Authentification sécurisée** - Gestion des utilisateurs et rôles
- **Protection anti-spam** - Système de mute progressif
- **Fingerprinting** - Identification des utilisateurs
- **Mots de passe hashés** - Bcrypt avec salt rounds: 10

## 🏗️ Architecture

### Backend
- **Node.js** - Serveur avec ES Modules
- **WebSocket** - Communication en temps réel
- **Node Media Server** - Serveur RTMP pour OBS
- **SQLite3** - Base de données locale (`server/data/app.db`)
- **Discord.js** - Bot Discord pour comptes temporaires

### Frontend
- **React + TypeScript** - Interface utilisateur moderne
- **Vite** - Build tool rapide
- **TailwindCSS** - Styling
- **HLS.js** - Lecture des streams

### Base de Données (SQLite Local)
- `users` - Utilisateurs et comptes Discord temporaires
- `streams` - Streams actifs
- `chat_messages` - Messages du chat
- `connected_users` - Utilisateurs connectés
- `banned_users` - Utilisateurs bannis
- `muted_users` - Utilisateurs mute
- `activity_logs` - Logs de toutes les actions (création/expiration comptes, etc.)

## 📋 Installation

### Prérequis
- Node.js 18+
- FFmpeg (pour la conversion RTMP vers HLS)
- Bot Discord (optionnel, pour la génération de comptes temporaires)

### Installation

```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd server
npm install
cd ..
```

### Configuration

#### Backend (server/.env)

Créez le fichier `server/.env` avec cette configuration :

```env
# Clés de sécurité locale
ENCRYPTION_KEY=BOLT_ANONYMOUS_2025
ADMIN_ACCESS_CODE=ADMIN_BOLT_2025

# Mots de passe des rôles
MOD_PASSWORD=mod123
MODERATOR_PASSWORD=moderator123
ADMIN_PASSWORD=admin123

# Configuration WebSocket
WS_PORT=3001

# Configuration Discord Bot (optionnel)
# Pour obtenir un token: https://discord.com/developers/applications
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_WEBHOOK_URL=
```

#### Frontend

Aucune configuration nécessaire - tout fonctionne en localhost.

**Note importante**: Si vous voulez utiliser le bot Discord pour générer des comptes temporaires, consultez `server/DISCORD_BOT_SETUP.md` pour la configuration complète.

## 🚀 Démarrage

### Frontend
```bash
npm run dev
```
Accessible sur http://localhost:5173

### Backend
```bash
cd server

# Option 1: Tout lancer en même temps (recommandé)
npm run dev

# Option 2: Lancer séparément
# Terminal 1 - Serveur WebSocket + RTMP
npm start

# Terminal 2 - Bot Discord (optionnel)
npm run bot
```

### Ports Utilisés
- **5173** - Frontend (Vite)
- **3001** - Backend WebSocket
- **1935** - Serveur RTMP (OBS)
- **8003** - Serveur HTTP pour les fichiers HLS

## 🎮 Configuration OBS Studio

### Paramètres de Stream
1. Ouvrez OBS Studio
2. Paramètres → Stream
3. Service : **Custom**
4. Serveur : `rtmp://localhost:1935/live`
5. Clé de stream : `votre_cle_personnalisee`

### Paramètres Recommandés
- **Encodeur** : x264
- **Bitrate** : 2500-6000 Kbps
- **Keyframe Interval** : 2
- **CPU Preset** : veryfast
- **Profile** : high

## 📁 Structure du Projet

```
streaming-platform/
├── src/                        # Frontend React
│   ├── components/             # Composants
│   │   ├── AdminPage.tsx       # Panel admin
│   │   ├── HomePage.tsx        # Page d'accueil
│   │   ├── LiveStreamPage.tsx  # Lecteur de stream
│   │   ├── StreamPlayer.tsx    # Composant lecteur
│   │   └── AuthPage.tsx        # Authentification
│   ├── services/               # Services
│   │   └── websocket.ts        # Client WebSocket
│   ├── types/                  # Types TypeScript
│   └── utils/                  # Utilitaires
├── server/                     # Backend Node.js
│   ├── index.mjs               # Serveur principal
│   ├── websocket-server.mjs    # Serveur WebSocket
│   ├── rtmp.mjs                # Serveur RTMP
│   ├── discord-bot.mjs         # Bot Discord
│   ├── lib/                    # Librairies
│   │   └── database.mjs        # Gestion SQLite
│   ├── data/                   # Base de données
│   │   └── app.db              # SQLite (créé automatiquement)
│   ├── media/                  # Fichiers HLS générés
│   ├── .env                    # Configuration serveur
│   └── package.json            # Dépendances backend
└── package.json                # Dépendances frontend
```

## 🌐 Utilisation

### Utilisateur Standard

1. **Obtenir un compte Discord** (recommandé)
   - Tapez `/account` sur le serveur Discord
   - Recevez vos identifiants en DM (valables 24h)

2. **Se connecter** - Utiliser les identifiants Discord ou créer un compte manuel
3. **Regarder les streams** - Voir les streams en direct
4. **Participer au chat** - Chat global ou par stream

### Administrateur

1. **Accès admin** - Utiliser le code d'accès admin
2. **Gérer les streams** - Créer/modifier/supprimer
3. **Modérer les utilisateurs** - Mute/ban
4. **Voir les statistiques** - Dashboard en temps réel

## 🔧 API WebSocket

### Client → Serveur

```javascript
// Informations utilisateur
{
  type: 'user_info',
  username: 'string',
  page: 'string'
}

// Message chat
{
  type: 'chat_message',
  message: {
    text: 'string',
    username: 'string'
  }
}

// Rejoindre un stream
{
  type: 'join_stream',
  streamKey: 'string'
}

// Quitter un stream
{
  type: 'leave_stream'
}

// Action admin
{
  type: 'admin_action',
  action: 'mute_user' | 'ban_user',
  targetUserId: 'string'
}
```

### Serveur → Client

```javascript
// Nombre d'utilisateurs
{
  type: 'user_count',
  count: number
}

// Liste des streams actifs
{
  type: 'active_streams',
  streams: Stream[]
}

// Nouveau message chat
{
  type: 'chat_message',
  message: ChatMessage
}

// Stream détecté
{
  type: 'stream_detected',
  stream: Stream
}

// Stream terminé
{
  type: 'stream_ended',
  streamKey: 'string'
}
```

## 🤖 Bot Discord - Comptes Temporaires

### Fonctionnalités

- **Génération automatique** de comptes via `/account`
- **Comptes temporaires** valides 24h
- **Un compte par utilisateur Discord** maximum
- **Identifiants envoyés en DM** pour la confidentialité
- **Expiration automatique** après 24h
- **Logs complets** dans le panel admin

### Configuration

1. Créer une application Discord sur https://discord.com/developers/applications
2. Activer les **Privileged Gateway Intents**
3. Copier le token dans `server/.env`
4. Inviter le bot sur votre serveur
5. Lancer avec `npm run bot`

**Guide complet**: Voir `server/DISCORD_BOT_SETUP.md`

## 🔐 Sécurité Locale

### Base de Données SQLite

- **Fichier local** (`server/data/app.db`) - Aucune exposition réseau
- **Mots de passe hashés** avec bcrypt (salt rounds: 10)
- **Validation côté serveur** de toutes les requêtes
- **Contrôle d'accès** par rôles (viewer, moderator, admin)
- **Fingerprinting** pour identification des utilisateurs

### Protection

- **Comptes temporaires** expirés automatiquement
- **Mutes progressifs** (5min → 15min → 30min → 1h → permanent)
- **Bans** avec durée configurable ou permanents
- **Logs d'activité** de toutes les actions importantes

### Système de Mute Progressif

1. **1ère infraction** - 5 minutes
2. **2ème infraction** - 15 minutes
3. **3ème infraction** - 30 minutes
4. **4ème infraction** - 1 heure
5. **5ème infraction** - Permanent

## 🛠️ Dépannage

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### FFmpeg non trouvé
- **Windows** : Installer FFmpeg dans `C:\ffmpeg\bin\`
- **Linux** : `sudo apt install ffmpeg`
- **Mac** : `brew install ffmpeg`

### WebSocket déconnecté
1. Vérifier que le serveur backend est lancé (`npm start` dans server/)
2. Vérifier la console navigateur (F12)
3. Vérifier que le port 3001 est disponible

### Stream ne s'affiche pas
1. Vérifier que le serveur RTMP est lancé
2. Vérifier les logs FFmpeg
3. Vérifier que les fichiers HLS sont générés dans `server/media/live/`

## 💾 Base de Données SQLite

### Initialisation Automatique

La base de données SQLite est créée automatiquement au premier lancement dans `server/data/app.db`.

Toutes les tables sont créées automatiquement:
- `users` - Utilisateurs et comptes Discord
- `streams` - Streams actifs
- `chat_messages` - Historique du chat
- `connected_users` - Utilisateurs en ligne
- `banned_users` - Utilisateurs bannis
- `muted_users` - Utilisateurs mute
- `activity_logs` - Logs de toutes les actions

### Backup

```bash
# Backup simple
cp server/data/app.db server/data/app.db.backup

# Backup avec date
cp server/data/app.db server/data/app.db.$(date +%Y%m%d)
```

## 🔄 Workflow de Streaming

1. **OBS Stream** → Serveur RTMP (port 1935)
2. **RTMP** → FFmpeg conversion → HLS (fichiers .m3u8 et .ts)
3. **HLS** → Serveur HTTP (port 8003)
4. **Frontend** → Lecture HLS via HLS.js
5. **Backend** → Notification WebSocket aux clients
6. **SQLite** → Stockage des métadonnées du stream localement

## 📝 Scripts Disponibles

```bash
# Frontend
npm run dev          # Lancer le dev server
npm run build        # Build production
npm run preview      # Preview du build

# Backend
npm run server       # Lancer le serveur principal
npm run rtmp         # Lancer le serveur RTMP

# Serveur (dans /server)
npm start            # Serveur WebSocket + RTMP
npm run bot          # Bot Discord
npm run dev          # Serveur + Bot en même temps
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-feature`)
3. Committez (`git commit -m 'Ajout nouvelle feature'`)
4. Push (`git push origin feature/nouvelle-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🌐 Connexions Externes

**IMPORTANT** : Le système fonctionne 100% en localhost, sauf:

- **Bot Discord** (optionnel) - Connexion aux serveurs Discord nécessaire
- Aucune autre connexion cloud
- Toutes les données restent sur votre machine
- Base de données SQLite locale

---

**Version 5.0 - 100% Localhost Edition**
*Plateforme de streaming moderne avec chat en temps réel - Tout sur votre machine*
