import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SERVER_CONFIG } from './config.mjs';
import { getDatabase } from './lib/db-instance.mjs';
import { AnalyticsAPI } from './api/analytics.mjs';
import { ModerationAPI } from './api/moderation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const { PORT, ALLOWED_ORIGINS, IS_PRODUCTION } = SERVER_CONFIG;

const allowedOrigins = ALLOWED_ORIGINS;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/live', express.static(path.join(__dirname, 'media', 'live'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

const db = getDatabase();
const analyticsAPI = new AnalyticsAPI(db);
const moderationAPI = new ModerationAPI(db);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: IS_PRODUCTION ? 'production' : 'development',
    port: PORT
  });
});

app.get('/api/analytics/dashboard', async (req, res) => {
  const result = await analyticsAPI.getDashboardStats();
  res.json(result);
});

app.get('/api/analytics/messages', async (req, res) => {
  const period = req.query.period || '7days';
  const result = await analyticsAPI.getMessageStats(period);
  res.json(result);
});

app.get('/api/analytics/activity', async (req, res) => {
  const result = await analyticsAPI.getUserActivityStats();
  res.json(result);
});

app.get('/api/analytics/streams', async (req, res) => {
  const result = await analyticsAPI.getStreamStats();
  res.json(result);
});

app.get('/api/analytics/moderation', async (req, res) => {
  const result = await analyticsAPI.getModerationStats();
  res.json(result);
});

app.get('/api/analytics/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  const result = await analyticsAPI.getActivityLogs(limit, offset);
  res.json(result);
});

app.get('/api/moderation/banned', async (req, res) => {
  const result = await moderationAPI.getBannedUsers();
  res.json(result);
});

app.get('/api/moderation/muted', async (req, res) => {
  const result = await moderationAPI.getMutedUsers();
  res.json(result);
});

app.post('/api/moderation/ban', async (req, res) => {
  const { fingerprint, ip, username, reason, duration, adminUsername } = req.body;
  const result = await moderationAPI.banUser(
    fingerprint,
    ip,
    username,
    reason,
    duration,
    adminUsername || 'admin'
  );
  res.json(result);
});

app.post('/api/moderation/unban', async (req, res) => {
  const { fingerprint, ip, adminUsername } = req.body;
  const result = await moderationAPI.unbanUser(fingerprint, ip, adminUsername || 'admin');
  res.json(result);
});

app.post('/api/moderation/mute', async (req, res) => {
  const { fingerprint, username, ip, reason, duration, adminUsername } = req.body;
  const result = await moderationAPI.muteUser(
    fingerprint,
    username,
    ip,
    reason,
    duration,
    adminUsername || 'admin'
  );
  res.json(result);
});

app.post('/api/moderation/unmute', async (req, res) => {
  const { fingerprint, adminUsername } = req.body;
  const result = await moderationAPI.unmuteUser(fingerprint, adminUsername || 'admin');
  res.json(result);
});

app.delete('/api/moderation/message/:id', async (req, res) => {
  const adminUsername = req.body.adminUsername || 'admin';
  const result = await moderationAPI.deleteMessage(req.params.id, adminUsername);
  res.json(result);
});

app.get('/api/moderation/actions', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const result = await moderationAPI.getRecentActions(limit);
  res.json(result);
});

app.post('/api/moderation/clear-mutes', async (req, res) => {
  const result = await moderationAPI.clearExpiredMutes();
  res.json(result);
});

app.get('/api/chat/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const streamKey = req.query.streamKey || null;

    let sql = 'SELECT * FROM chat_messages';
    const params = [];

    if (streamKey) {
      sql += ' WHERE stream_key = ?';
      params.push(streamKey);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const messages = await db.all(sql, params);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/connected-users', async (req, res) => {
  try {
    const users = await db.getConnectedUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stream/detect', async (req, res) => {
  const { action, streamKey, title, description, thumbnail, rtmpUrl, hlsUrl } = req.body;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'stream_status',
        action,
        streamKey,
        title,
        description,
        thumbnail,
        rtmpUrl,
        hlsUrl,
        status: action === 'start' ? 'live' : 'offline'
      }));
    }
  });

  res.json({ success: true });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const connectedClients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).substring(7);
  connectedClients.set(clientId, { ws, ip: req.socket.remoteAddress });

  console.log(`WebSocket client connected: ${clientId} (Total: ${connectedClients.size})`);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(data));
        }
      });

      if (data.type === 'chat_message' && data.message) {
        try {
          await db.saveChatMessage(data.message);
        } catch (error) {
          console.error('Error saving chat message:', error);
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(clientId);
    console.log(`WebSocket client disconnected: ${clientId} (Total: ${connectedClients.size})`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀  ABD Stream - Unified Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`🌐 Server running on port: ${PORT}`);
  console.log(`📡 WebSocket: ${IS_PRODUCTION ? 'wss' : 'ws'}://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`🎥 HLS: http://localhost:${PORT}/live/{stream_key}/index.m3u8`);
  console.log('');
  console.log(`🌍 Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { server, wss };
