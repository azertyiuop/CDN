import axios from 'axios';

class Logger {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.enabled = !!webhookUrl;
  }

  async sendLog(type, data) {
    if (!this.enabled) return;

    try {
      const embed = this.createEmbed(type, data);
      await axios.post(this.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error(`[Logger] Erreur envoi log ${type}:`, error.message);
    }
  }

  createEmbed(type, data) {
    const timestamp = new Date().toISOString();

    const embeds = {
      user_connected: {
        title: '🟢 Connexion',
        color: 0x22c55e,
        fields: [
          { name: 'Utilisateur', value: data.username, inline: true },
          { name: 'IP', value: data.ip, inline: true },
          { name: 'Système', value: `${data.os} (${data.deviceType})`, inline: true }
        ]
      },
      user_disconnected: {
        title: '🔴 Déconnexion',
        color: 0xef4444,
        fields: [
          { name: 'Utilisateur', value: data.username, inline: true },
          { name: 'Durée', value: data.sessionDuration, inline: true }
        ]
      },
      user_muted: {
        title: '🔇 Utilisateur Mute',
        color: 0xf59e0b,
        fields: [
          { name: 'Utilisateur', value: data.username, inline: true },
          { name: 'Durée', value: data.duration, inline: true },
          { name: 'Raison', value: data.reason, inline: false }
        ]
      },
      user_banned: {
        title: '🚫 Utilisateur Banni',
        color: 0xef4444,
        fields: [
          { name: 'Utilisateur', value: data.username, inline: true },
          { name: 'Type', value: data.permanent ? 'Permanent' : 'Temporaire', inline: true },
          { name: 'Raison', value: data.reason, inline: false }
        ]
      }
    };

    const embed = embeds[type] || {
      title: '📝 Log',
      color: 0x6b7280,
      fields: [{ name: 'Type', value: type, inline: false }]
    };

    return { ...embed, timestamp, footer: { text: 'Stream Backend' } };
  }

  formatDuration(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
}

export default Logger;
