import express from 'express';
import cors from 'cors';
import { getDatabase } from './lib/db-instance.mjs';
import { AnalyticsAPI } from './api/analytics.mjs';
import { ModerationAPI } from './api/moderation.mjs';

const app = express();
const PORT = process.env.API_PORT || 3002;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const db = getDatabase();
const analyticsAPI = new AnalyticsAPI(db);
const moderationAPI = new ModerationAPI(db);

// Analytics routes
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

// Moderation routes
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

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`✅ API Server démarré sur http://localhost:${PORT}`);
});

export default app;
