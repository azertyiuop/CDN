# 🤖 Configuration du Bot Discord

## 📋 Prérequis

1. Un compte Discord
2. Un serveur Discord où ajouter le bot

## 🚀 Étapes de Configuration

### 1. Créer l'Application Discord

1. Va sur https://discord.com/developers/applications
2. Clique sur **"New Application"**
3. Donne un nom à ton bot (ex: "Stream Account Bot")
4. Accepte les conditions

### 2. Créer le Bot

1. Dans le menu de gauche, clique sur **"Bot"**
2. Clique sur **"Add Bot"** puis confirme
3. Active ces **Privileged Gateway Intents** :
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 3. Récupérer le Token

1. Dans la section **"TOKEN"**, clique sur **"Reset Token"**
2. Copie le token (tu ne pourras le voir qu'une seule fois!)
3. Ajoute-le dans ton fichier `.env` :
   ```
   DISCORD_BOT_TOKEN=ton_token_ici
   ```

### 4. Inviter le Bot sur ton Serveur

1. Dans le menu de gauche, clique sur **"OAuth2"** → **"URL Generator"**
2. Dans **"SCOPES"**, coche :
   - ✅ `bot`
   - ✅ `applications.commands`
3. Dans **"BOT PERMISSIONS"**, coche :
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Send Messages in Threads
4. Copie l'URL générée en bas
5. Colle l'URL dans ton navigateur et invite le bot sur ton serveur

### 5. Lancer le Bot

```bash
cd server
npm run bot
```

Ou pour lancer serveur + bot en même temps :
```bash
npm run dev
```

## 📝 Commandes Disponibles

### `/account`
Génère un compte temporaire de 24h pour accéder au stream.

**Ce que fait la commande :**
- ✅ Vérifie si l'utilisateur a déjà un compte actif
- ✅ Génère un username et password aléatoires
- ✅ Envoie les identifiants en message privé (DM)
- ✅ Le compte expire automatiquement après 24h

## 🔄 Fonctionnement

1. **Création de compte** :
   - L'utilisateur tape `/account` sur Discord
   - Le bot génère un compte unique
   - Les identifiants sont envoyés en DM
   - Le compte est valide 24h

2. **Expiration automatique** :
   - Toutes les 5 minutes, le bot vérifie les comptes expirés
   - Les comptes de plus de 24h sont automatiquement supprimés
   - Un log est créé pour chaque suppression

3. **Protection** :
   - Un utilisateur Discord ne peut avoir qu'un seul compte actif à la fois
   - Si l'utilisateur a déjà un compte, le temps restant est affiché

## 🎯 Exemple d'Utilisation

### Discord :
```
Utilisateur: /account
Bot: ✅ Compte créé ! Vérifie tes DMs.
```

### Message Privé (DM) :
```
🎉 Compte Temporaire Créé !

👤 Username: SwiftDragon4823
🔑 Password: aB3$mK9pX2qL

⏰ Expire le: 27/10/2025 à 15:30

⚠️ Important:
• Ces identifiants sont temporaires (24h)
• Ne les partage avec personne
• Connecte-toi sur le site du stream
```

## 📊 Logs

Tous les événements sont enregistrés dans la base de données :
- `ACCOUNT_CREATED` - Création de compte
- `ACCOUNT_EXPIRED` - Expiration de compte

Tu peux voir ces logs dans le panel admin.

## ⚠️ Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt
- ✅ Les comptes expirent automatiquement après 24h
- ✅ Un utilisateur Discord = 1 seul compte actif max
- ✅ Les identifiants sont envoyés uniquement en DM

## 🐛 Problèmes Courants

### Le bot ne répond pas
- Vérifie que le token est correct dans `.env`
- Vérifie que le bot est en ligne (`npm run bot`)
- Vérifie que les intents sont activés

### Les DMs ne fonctionnent pas
- L'utilisateur doit activer les DMs pour les membres du serveur
- Si les DMs sont bloquées, le bot affiche les identifiants dans le canal (mais recommande de les supprimer après)

### Le bot se déconnecte
- Vérifie la connexion internet
- Vérifie les logs d'erreur dans la console
