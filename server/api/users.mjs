export class UsersAPI {
  constructor(database) {
    this.db = database;
  }

  async getAllUsers() {
    try {
      const users = await this.db.all(
        'SELECT id, username, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC'
      );
      return { success: true, users };
    } catch (error) {
      console.error('Erreur getAllUsers:', error);
      return { success: false, error: 'Erreur lors de la récupération des utilisateurs' };
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.db.get(
        'SELECT id, username, role, created_at, last_login, is_active FROM users WHERE id = ?',
        [userId]
      );
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      return { success: true, user };
    } catch (error) {
      console.error('Erreur getUserById:', error);
      return { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  }

  async updateUser(userId, updates) {
    try {
      const allowedFields = ['username', 'role', 'is_active'];
      const updateFields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, error: 'Aucun champ à mettre à jour' };
      }

      values.push(userId);
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      await this.db.run(sql, values);

      return { success: true, message: 'Utilisateur mis à jour' };
    } catch (error) {
      console.error('Erreur updateUser:', error);
      return { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  }

  async deleteUser(userId) {
    try {
      await this.db.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
      return { success: true, message: 'Utilisateur désactivé' };
    } catch (error) {
      console.error('Erreur deleteUser:', error);
      return { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }

  async searchUsers(query) {
    try {
      const users = await this.db.all(
        `SELECT id, username, role, created_at, last_login, is_active
         FROM users
         WHERE username LIKE ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [`%${query}%`]
      );
      return { success: true, users };
    } catch (error) {
      console.error('Erreur searchUsers:', error);
      return { success: false, error: 'Erreur lors de la recherche' };
    }
  }

  async getUserStats() {
    try {
      const stats = {
        total: 0,
        active: 0,
        admins: 0,
        moderators: 0,
        viewers: 0,
        newToday: 0
      };

      const totalResult = await this.db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      stats.total = totalResult.count;

      const activeResult = await this.db.get(
        'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND last_login > datetime("now", "-1 day")'
      );
      stats.active = activeResult.count;

      const roleResults = await this.db.all(
        'SELECT role, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY role'
      );
      roleResults.forEach(r => {
        if (r.role === 'admin' || r.role === 'owner') stats.admins += r.count;
        else if (r.role === 'moderator') stats.moderators = r.count;
        else stats.viewers = r.count;
      });

      const newTodayResult = await this.db.get(
        'SELECT COUNT(*) as count FROM users WHERE created_at > datetime("now", "-1 day")'
      );
      stats.newToday = newTodayResult.count;

      return { success: true, stats };
    } catch (error) {
      console.error('Erreur getUserStats:', error);
      return { success: false, error: 'Erreur lors du calcul des statistiques' };
    }
  }
}
