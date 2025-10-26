// Configuration serveur - JAMAIS exposée au client
// Toute la configuration est ici, pas besoin de fichier .env

export const SERVER_CONFIG = {
  // Clés d'authentification locale
  ENCRYPTION_KEY: 'BOLT_ANONYMOUS_2025',

  // Codes d'accès admin - vous pouvez en ajouter autant que vous voulez
  ADMIN_ACCESS_CODES: [
    'ADMIN_BOLT_2025',
    'SUPERADMIN_2025',
    'ADMIN123'
  ],

  // Mots de passe des rôles
  MODERATOR_PASSWORDS: {
    'mod': 'mod123',
    'moderator': 'moderator123',
    'admin': 'admin123'
  },

  // Configuration WebSocket
  WS_PORT: 3001,

  // Configuration Discord Bot
  // Pour obtenir un token:
  // 1. Allez sur https://discord.com/developers/applications
  // 2. Créez une application et activez le bot
  // 3. Copiez le token et remplacez la valeur ci-dessous
  DISCORD_BOT_TOKEN: 'your_discord_bot_token_here',

  // Discord Webhook (optionnel - laissez null si non utilisé)
  DISCORD_WEBHOOK_URL: null
};