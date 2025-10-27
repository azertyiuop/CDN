export const SERVER_CONFIG = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'BOLT_ANONYMOUS_2025',

  ADMIN_ACCESS_CODES: process.env.ADMIN_ACCESS_CODES
    ? process.env.ADMIN_ACCESS_CODES.split(',')
    : ['ADMIN_BOLT_2025', 'SUPERADMIN_2025', 'ADMIN123'],

  MODERATOR_PASSWORDS: {
    'mod': 'mod123',
    'moderator': 'moderator123',
    'admin': 'admin123'
  },

  WS_PORT: parseInt(process.env.PORT) || 3001,
  API_PORT: parseInt(process.env.API_PORT) || 3002,
  RTMP_PORT: parseInt(process.env.RTMP_PORT) || 1935,
  HTTP_PORT: parseInt(process.env.HTTP_PORT) || 8003,

  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || 'your_discord_bot_token_here',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || null,

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],

  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',

  DATABASE_URL: process.env.DATABASE_URL || null
};