import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor(dbPath = null) {
    this.db = null;
    this.dbPath = dbPath || path.join(__dirname, '..', 'data', 'app.db');
    this.init();
  }

  init() {
    const dbDir = path.dirname(this.dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Erreur ouverture DB:', err.message);
      } else {
        console.log('✅ Connexion DB SQLite établie:', this.dbPath);
        this.createTables();
      }
    });
  }

  createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS connected_users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        ip TEXT NOT NULL,
        user_agent TEXT,
        connect_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        page TEXT DEFAULT 'home',
        fingerprint TEXT
      )`,

      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        discord_id TEXT,
        discord_username TEXT,
        expires_at DATETIME
      )`,

      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        role TEXT DEFAULT 'viewer',
        is_system BOOLEAN DEFAULT 0,
        color TEXT,
        ip TEXT,
        fingerprint TEXT,
        stream_key TEXT
      )`,

      `CREATE TABLE IF NOT EXISTS banned_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fingerprint TEXT,
        ip TEXT,
        username TEXT,
        banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ban_end_time DATETIME,
        reason TEXT,
        banned_by TEXT,
        is_permanent BOOLEAN DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS muted_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fingerprint TEXT NOT NULL,
        username TEXT,
        ip TEXT,
        muted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        mute_end_time DATETIME NOT NULL,
        reason TEXT,
        muted_by TEXT,
        mute_count INTEGER DEFAULT 1
      )`,

      `CREATE TABLE IF NOT EXISTS streams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stream_key TEXT UNIQUE NOT NULL,
        title TEXT,
        description TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        is_live BOOLEAN DEFAULT 1
      )`,

      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        username TEXT,
        ip_address TEXT,
        fingerprint TEXT,
        details TEXT,
        severity TEXT DEFAULT 'low',
        admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completedTables = 0;
    tables.forEach((tableSQL, index) => {
      this.db.run(tableSQL, (err) => {
        if (err) {
          console.error(`Erreur création table ${index + 1}:`, err.message);
        }
        completedTables++;
        if (completedTables === tables.length) {
          this.migrateDiscordColumns();
        }
      });
    });
  }

  migrateDiscordColumns() {
    this.db.all(`PRAGMA table_info(users)`, (err, columns) => {
      if (err) {
        console.error('Erreur vérification colonnes:', err);
        return;
      }

      const columnNames = columns.map(c => c.name);

      if (!columnNames.includes('discord_id')) {
        this.db.run('ALTER TABLE users ADD COLUMN discord_id TEXT', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Erreur ajout discord_id:', err);
          } else {
            console.log('✅ Colonne discord_id ajoutée');
          }
        });
      }

      if (!columnNames.includes('discord_username')) {
        this.db.run('ALTER TABLE users ADD COLUMN discord_username TEXT', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Erreur ajout discord_username:', err);
          } else {
            console.log('✅ Colonne discord_username ajoutée');
          }
        });
      }

      if (!columnNames.includes('expires_at')) {
        this.db.run('ALTER TABLE users ADD COLUMN expires_at DATETIME', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Erreur ajout expires_at:', err);
          } else {
            console.log('✅ Colonne expires_at ajoutée');
          }
        });
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addConnectedUser(userData) {
    const sql = `INSERT OR REPLACE INTO connected_users
                 (id, username, ip, user_agent, page, fingerprint)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    return await this.run(sql, [
      userData.id,
      userData.username,
      userData.ip,
      userData.userAgent,
      userData.page,
      userData.fingerprint
    ]);
  }

  async removeConnectedUser(userId) {
    return await this.run(`DELETE FROM connected_users WHERE id = ?`, [userId]);
  }

  async getConnectedUsers() {
    return await this.all(`SELECT * FROM connected_users ORDER BY connect_time DESC`);
  }

  async addChatMessage(messageData) {
    const sql = `INSERT INTO chat_messages
                 (id, username, message, timestamp, role, is_system, color, ip, fingerprint, stream_key)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return await this.run(sql, [
      messageData.id,
      messageData.username,
      messageData.message,
      messageData.timestamp,
      messageData.role || 'viewer',
      messageData.isSystem ? 1 : 0,
      messageData.color,
      messageData.ip,
      messageData.fingerprint,
      messageData.streamKey || null
    ]);
  }

  async deleteChatMessage(messageId) {
    return await this.run(`DELETE FROM chat_messages WHERE id = ?`, [messageId]);
  }

  async banUser(userData) {
    const sql = `INSERT INTO banned_users
                 (fingerprint, ip, username, ban_end_time, reason, banned_by, is_permanent)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return await this.run(sql, [
      userData.fingerprint,
      userData.ip,
      userData.username,
      userData.banEndTime,
      userData.reason,
      userData.bannedBy,
      userData.isPermanent ? 1 : 0
    ]);
  }

  async muteUser(userData) {
    const sql = `INSERT INTO muted_users
                 (fingerprint, username, ip, mute_end_time, reason, muted_by, mute_count)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return await this.run(sql, [
      userData.fingerprint,
      userData.username,
      userData.ip,
      userData.muteEndTime,
      userData.reason,
      userData.mutedBy,
      userData.muteCount || 1
    ]);
  }

  async isUserBanned(fingerprint, ip) {
    const sql = `SELECT * FROM banned_users
                 WHERE (fingerprint = ? OR ip = ?)
                 AND (ban_end_time IS NULL OR ban_end_time > CURRENT_TIMESTAMP)
                 ORDER BY banned_at DESC LIMIT 1`;
    return await this.get(sql, [fingerprint, ip]);
  }

  async isUserMuted(fingerprint) {
    const sql = `SELECT * FROM muted_users
                 WHERE fingerprint = ?
                 AND mute_end_time > CURRENT_TIMESTAMP
                 ORDER BY muted_at DESC LIMIT 1`;
    return await this.get(sql, [fingerprint]);
  }

  async getBannedUsers() {
    const sql = `SELECT * FROM banned_users
                 WHERE ban_end_time IS NULL OR ban_end_time > CURRENT_TIMESTAMP
                 ORDER BY banned_at DESC`;
    return await this.all(sql);
  }

  async getMutedUsers() {
    const sql = `SELECT * FROM muted_users
                 WHERE mute_end_time > CURRENT_TIMESTAMP
                 ORDER BY muted_at DESC`;
    return await this.all(sql);
  }

  async unbanUser(fingerprint, ip) {
    const sql = `UPDATE banned_users
                 SET ban_end_time = CURRENT_TIMESTAMP
                 WHERE (fingerprint = ? OR ip = ?)
                 AND (ban_end_time IS NULL OR ban_end_time > CURRENT_TIMESTAMP)`;
    return await this.run(sql, [fingerprint, ip]);
  }

  async unmuteUser(fingerprint) {
    const sql = `UPDATE muted_users
                 SET mute_end_time = CURRENT_TIMESTAMP
                 WHERE fingerprint = ?
                 AND mute_end_time > CURRENT_TIMESTAMP`;
    return await this.run(sql, [fingerprint]);
  }

  async clearExpiredMutes() {
    return await this.run(`DELETE FROM muted_users WHERE mute_end_time <= CURRENT_TIMESTAMP`);
  }

  async createUser(userData) {
    const sql = `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`;
    return await this.run(sql, [
      userData.id,
      userData.username,
      userData.passwordHash,
      userData.role || 'viewer'
    ]);
  }

  async findUserByUsername(username) {
    return await this.get(`SELECT * FROM users WHERE username = ? AND is_active = 1`, [username]);
  }

  async updateUserLastLogin(userId) {
    return await this.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);
  }

  async addStream(streamData) {
    const sql = `INSERT INTO streams (stream_key, title, description) VALUES (?, ?, ?)`;
    return await this.run(sql, [streamData.key, streamData.title, streamData.description]);
  }

  async endStream(streamKey) {
    const sql = `UPDATE streams SET ended_at = CURRENT_TIMESTAMP, is_live = 0 WHERE stream_key = ?`;
    return await this.run(sql, [streamKey]);
  }

  async getActiveStreams() {
    return await this.all(`SELECT * FROM streams WHERE is_live = 1`);
  }

  async addActivityLog(logData) {
    const sql = `INSERT INTO activity_logs
                 (action_type, username, ip_address, fingerprint, details, severity, admin_username)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return await this.run(sql, [
      logData.action_type,
      logData.username || '',
      logData.ip_address || '',
      logData.fingerprint || '',
      JSON.stringify(logData.details || {}),
      logData.severity || 'low',
      logData.admin_username || 'system'
    ]);
  }

  async getActivityLogs(limit = 100) {
    const logs = await this.all(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?`, [limit]);
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : {}
    }));
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) console.error('Erreur fermeture DB:', err.message);
        else console.log('✅ DB fermée');
      });
    }
  }
}

export default Database;
