export class AnalyticsAPI {
  constructor(database) {
    this.db = database;
  }

  async getDashboardStats() {
    try {
      const stats = {
        users: {
          total: 0,
          online: 0,
          newToday: 0
        },
        messages: {
          total: 0,
          today: 0,
          lastHour: 0
        },
        streams: {
          active: 0,
          totalToday: 0
        },
        moderation: {
          bannedUsers: 0,
          mutedUsers: 0,
          reportsToday: 0
        }
      };

      const usersTotal = await this.db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      stats.users.total = usersTotal.count;

      const onlineUsers = await this.db.get('SELECT COUNT(*) as count FROM connected_users');
      stats.users.online = onlineUsers.count;

      const newUsers = await this.db.get(
        'SELECT COUNT(*) as count FROM users WHERE created_at > datetime("now", "-1 day")'
      );
      stats.users.newToday = newUsers.count;

      const messagesTotal = await this.db.get('SELECT COUNT(*) as count FROM chat_messages');
      stats.messages.total = messagesTotal.count;

      const messagesToday = await this.db.get(
        'SELECT COUNT(*) as count FROM chat_messages WHERE timestamp > datetime("now", "-1 day")'
      );
      stats.messages.today = messagesToday.count;

      const messagesLastHour = await this.db.get(
        'SELECT COUNT(*) as count FROM chat_messages WHERE timestamp > datetime("now", "-1 hour")'
      );
      stats.messages.lastHour = messagesLastHour.count;

      const activeStreams = await this.db.get('SELECT COUNT(*) as count FROM streams WHERE is_live = 1');
      stats.streams.active = activeStreams.count;

      const streamsToday = await this.db.get(
        'SELECT COUNT(*) as count FROM streams WHERE started_at > datetime("now", "-1 day")'
      );
      stats.streams.totalToday = streamsToday.count;

      const bannedUsers = await this.db.get(
        'SELECT COUNT(*) as count FROM banned_users WHERE ban_end_time IS NULL OR ban_end_time > datetime("now")'
      );
      stats.moderation.bannedUsers = bannedUsers.count;

      const mutedUsers = await this.db.get(
        'SELECT COUNT(*) as count FROM muted_users WHERE mute_end_time > datetime("now")'
      );
      stats.moderation.mutedUsers = mutedUsers.count;

      return { success: true, stats };
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques' };
    }
  }

  async getActivityLogs(limit = 100, offset = 0) {
    try {
      const logs = await this.db.all(
        `SELECT * FROM activity_logs
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const total = await this.db.get('SELECT COUNT(*) as count FROM activity_logs');

      return {
        success: true,
        logs: logs.map(log => ({
          ...log,
          details: log.details ? JSON.parse(log.details) : {}
        })),
        total: total.count
      };
    } catch (error) {
      console.error('Erreur getActivityLogs:', error);
      return { success: false, error: 'Erreur lors de la récupération des logs' };
    }
  }

  async getMessageStats(period = '7days') {
    try {
      let dateFilter = 'datetime("now", "-7 days")';
      if (period === '24hours') dateFilter = 'datetime("now", "-1 day")';
      else if (period === '30days') dateFilter = 'datetime("now", "-30 days")';

      const messagesByDay = await this.db.all(
        `SELECT DATE(timestamp) as date, COUNT(*) as count
         FROM chat_messages
         WHERE timestamp > ${dateFilter}
         GROUP BY DATE(timestamp)
         ORDER BY date ASC`
      );

      const messagesByUser = await this.db.all(
        `SELECT username, COUNT(*) as count
         FROM chat_messages
         WHERE timestamp > ${dateFilter}
         GROUP BY username
         ORDER BY count DESC
         LIMIT 10`
      );

      return {
        success: true,
        byDay: messagesByDay,
        byUser: messagesByUser
      };
    } catch (error) {
      console.error('Erreur getMessageStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques de messages' };
    }
  }

  async getUserActivityStats() {
    try {
      const usersByPage = await this.db.all(
        `SELECT page, COUNT(*) as count
         FROM connected_users
         GROUP BY page`
      );

      const topActiveUsers = await this.db.all(
        `SELECT username, COUNT(*) as message_count
         FROM chat_messages
         WHERE timestamp > datetime("now", "-7 days")
         GROUP BY username
         ORDER BY message_count DESC
         LIMIT 10`
      );

      return {
        success: true,
        byPage: usersByPage,
        topActive: topActiveUsers
      };
    } catch (error) {
      console.error('Erreur getUserActivityStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques d\'activité' };
    }
  }

  async getStreamStats() {
    try {
      const totalStreams = await this.db.get('SELECT COUNT(*) as count FROM streams');
      const activeStreams = await this.db.get('SELECT COUNT(*) as count FROM streams WHERE is_live = 1');

      const streamHistory = await this.db.all(
        `SELECT stream_key, title, started_at, ended_at,
         (julianday(ended_at) - julianday(started_at)) * 24 * 60 as duration_minutes
         FROM streams
         WHERE ended_at IS NOT NULL
         ORDER BY started_at DESC
         LIMIT 20`
      );

      return {
        success: true,
        total: totalStreams.count,
        active: activeStreams.count,
        history: streamHistory
      };
    } catch (error) {
      console.error('Erreur getStreamStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques de stream' };
    }
  }

  async getModerationStats() {
    try {
      const totalBans = await this.db.get('SELECT COUNT(*) as count FROM banned_users');
      const activeBans = await this.db.get(
        'SELECT COUNT(*) as count FROM banned_users WHERE ban_end_time IS NULL OR ban_end_time > datetime("now")'
      );

      const totalMutes = await this.db.get('SELECT COUNT(*) as count FROM muted_users');
      const activeMutes = await this.db.get(
        'SELECT COUNT(*) as count FROM muted_users WHERE mute_end_time > datetime("now")'
      );

      const recentActions = await this.db.all(
        `SELECT action_type, COUNT(*) as count
         FROM activity_logs
         WHERE action_type IN ('ban', 'mute', 'kick', 'warn')
         AND created_at > datetime("now", "-7 days")
         GROUP BY action_type`
      );

      return {
        success: true,
        bans: { total: totalBans.count, active: activeBans.count },
        mutes: { total: totalMutes.count, active: activeMutes.count },
        recentActions
      };
    } catch (error) {
      console.error('Erreur getModerationStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques de modération' };
    }
  }
}
