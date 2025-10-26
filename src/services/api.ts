const API_BASE_URL = 'http://localhost:3002/api';

class APIService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async updateUser(userId: string, updates: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async changeUserRole(userId: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role })
    });
    return response.json();
  }

  async searchUsers(query: string) {
    const response = await fetch(`${API_BASE_URL}/users/search/${query}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getMessageStats(period = '7days') {
    const response = await fetch(`${API_BASE_URL}/analytics/messages?period=${period}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getUserActivityStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/activity`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getStreamStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/streams`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getModerationStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/moderation`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getActivityLogs(limit = 100, offset = 0) {
    const response = await fetch(`${API_BASE_URL}/analytics/logs?limit=${limit}&offset=${offset}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getBannedUsers() {
    const response = await fetch(`${API_BASE_URL}/moderation/banned`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getMutedUsers() {
    const response = await fetch(`${API_BASE_URL}/moderation/muted`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async banUser(fingerprint: string, ip: string, username: string, reason: string, duration?: number) {
    const response = await fetch(`${API_BASE_URL}/moderation/ban`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fingerprint, ip, username, reason, duration })
    });
    return response.json();
  }

  async unbanUser(fingerprint: string, ip: string) {
    const response = await fetch(`${API_BASE_URL}/moderation/unban`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fingerprint, ip })
    });
    return response.json();
  }

  async muteUser(fingerprint: string, username: string, ip: string, reason: string, duration = 10) {
    const response = await fetch(`${API_BASE_URL}/moderation/mute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fingerprint, username, ip, reason, duration })
    });
    return response.json();
  }

  async unmuteUser(fingerprint: string) {
    const response = await fetch(`${API_BASE_URL}/moderation/unmute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fingerprint })
    });
    return response.json();
  }

  async deleteMessage(messageId: string) {
    const response = await fetch(`${API_BASE_URL}/moderation/message/${messageId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getRecentActions(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/moderation/actions?limit=${limit}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async clearExpiredMutes() {
    const response = await fetch(`${API_BASE_URL}/moderation/clear-mutes`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getChatMessages(limit = 100, offset = 0, streamKey?: string) {
    let url = `${API_BASE_URL}/chat/messages?limit=${limit}&offset=${offset}`;
    if (streamKey) {
      url += `&streamKey=${streamKey}`;
    }
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getConnectedUsers() {
    const response = await fetch(`${API_BASE_URL}/connected-users`, {
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const apiService = new APIService();
