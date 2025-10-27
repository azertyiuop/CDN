export class ModerationAPI {
  constructor(database) {
    this.db = database;
  }

  async getBannedUsers() {
    try {
      const users = await this.db.getBannedUsers();
      return { success: true, users };
    } catch (error) {
      console.error('Erreur getBannedUsers:', error);
      return { success: false, error: 'Erreur lors de la récupération des utilisateurs bannis' };
    }
  }

  async getMutedUsers() {
    try {
      const users = await this.db.getMutedUsers();
      return { success: true, users };
    } catch (error) {
      console.error('Erreur getMutedUsers:', error);
      return { success: false, error: 'Erreur lors de la récupération des utilisateurs mute' };
    }
  }

  async banUser(fingerprint, ip, username, reason, duration = null, bannedBy = 'admin') {
    try {
      const isPermanent = duration === null;
      let banEndTime = null;

      if (!isPermanent && duration) {
        const endDate = new Date();
        endDate.setMinutes(endDate.getMinutes() + duration);
        banEndTime = endDate.toISOString();
      }

      await this.db.banUser({
        fingerprint,
        ip,
        username,
        banEndTime,
        reason,
        bannedBy,
        isPermanent
      });

      await this.db.addActivityLog({
        action_type: 'ban',
        username,
        ip_address: ip,
        fingerprint,
        details: { reason, duration: isPermanent ? 'permanent' : `${duration} minutes` },
        severity: 'high',
        admin_username: bannedBy
      });

      return { success: true, message: 'Utilisateur banni avec succès' };
    } catch (error) {
      console.error('Erreur banUser:', error);
      return { success: false, error: 'Erreur lors du bannissement' };
    }
  }

  async unbanUser(fingerprint, ip, unbannedBy = 'admin') {
    try {
      await this.db.unbanUser(fingerprint, ip);

      await this.db.addActivityLog({
        action_type: 'unban',
        fingerprint,
        ip_address: ip,
        details: { action: 'unban' },
        severity: 'medium',
        admin_username: unbannedBy
      });

      return { success: true, message: 'Utilisateur débanni avec succès' };
    } catch (error) {
      console.error('Erreur unbanUser:', error);
      return { success: false, error: 'Erreur lors du débannissement' };
    }
  }

  async muteUser(fingerprint, username, ip, reason, duration = 10, mutedBy = 'admin') {
    try {
      const muteEndTime = new Date();
      muteEndTime.setMinutes(muteEndTime.getMinutes() + duration);

      await this.db.muteUser({
        fingerprint,
        username,
        ip,
        muteEndTime: muteEndTime.toISOString(),
        reason,
        mutedBy,
        muteCount: 1
      });

      await this.db.addActivityLog({
        action_type: 'mute',
        username,
        ip_address: ip,
        fingerprint,
        details: { reason, duration: `${duration} minutes` },
        severity: 'medium',
        admin_username: mutedBy
      });

      return { success: true, message: 'Utilisateur mute avec succès', duration };
    } catch (error) {
      console.error('Erreur muteUser:', error);
      return { success: false, error: 'Erreur lors du mute' };
    }
  }

  async unmuteUser(fingerprint, unmutedBy = 'admin') {
    try {
      await this.db.unmuteUser(fingerprint);

      await this.db.addActivityLog({
        action_type: 'unmute',
        fingerprint,
        details: { action: 'unmute' },
        severity: 'low',
        admin_username: unmutedBy
      });

      return { success: true, message: 'Utilisateur démute avec succès' };
    } catch (error) {
      console.error('Erreur unmuteUser:', error);
      return { success: false, error: 'Erreur lors du démute' };
    }
  }

  async clearExpiredMutes() {
    try {
      await this.db.clearExpiredMutes();
      return { success: true, message: 'Mutes expirés nettoyés' };
    } catch (error) {
      console.error('Erreur clearExpiredMutes:', error);
      return { success: false, error: 'Erreur lors du nettoyage' };
    }
  }

  async deleteMessage(messageId, deletedBy = 'admin') {
    try {
      const message = await this.db.get('SELECT * FROM chat_messages WHERE id = ?', [messageId]);

      if (!message) {
        return { success: false, error: 'Message non trouvé' };
      }

      await this.db.deleteChatMessage(messageId);

      await this.db.addActivityLog({
        action_type: 'delete_message',
        username: message.username,
        details: { messageId, content: message.message },
        severity: 'low',
        admin_username: deletedBy
      });

      return { success: true, message: 'Message supprimé avec succès' };
    } catch (error) {
      console.error('Erreur deleteMessage:', error);
      return { success: false, error: 'Erreur lors de la suppression du message' };
    }
  }

  async getRecentActions(limit = 50) {
    try {
      const actions = await this.db.all(
        `SELECT * FROM activity_logs
         WHERE action_type IN ('ban', 'unban', 'mute', 'unmute', 'delete_message', 'kick')
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );

      return {
        success: true,
        actions: actions.map(action => ({
          ...action,
          details: action.details ? JSON.parse(action.details) : {}
        }))
      };
    } catch (error) {
      console.error('Erreur getRecentActions:', error);
      return { success: false, error: 'Erreur lors de la récupération des actions' };
    }
  }
}
