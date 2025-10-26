import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthAPI {
  constructor(database) {
    this.db = database;
  }

  async register(username, password, role = 'viewer') {
    try {
      // Empêcher la création de comptes admin via l'inscription
      if (role === 'admin' || role === 'owner') {
        return { success: false, error: 'Vous ne pouvez pas créer un compte admin via l\'inscription' };
      }

      const existingUser = await this.db.findUserByUsername(username);
      if (existingUser) {
        return { success: false, error: 'Nom d\'utilisateur déjà utilisé' };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      await this.db.createUser({
        id: userId,
        username,
        passwordHash,
        role
      });

      const token = jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return {
        success: true,
        token,
        user: { id: userId, username, role }
      };
    } catch (error) {
      console.error('Erreur register:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }

  async login(username, password) {
    try {
      const user = await this.db.findUserByUsername(username);
      if (!user) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      await this.db.updateUserLastLogin(user.id);

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }

  async createAdminAccount(username, password) {
    try {
      const existingUser = await this.db.findUserByUsername(username);
      if (existingUser) {
        return { success: false, error: 'Nom d\'utilisateur déjà utilisé' };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      await this.db.createUser({
        id: userId,
        username,
        passwordHash,
        role: 'admin'
      });

      return {
        success: true,
        message: 'Compte admin créé avec succès',
        user: { id: userId, username, role: 'admin' }
      };
    } catch (error) {
      console.error('Erreur createAdminAccount:', error);
      return { success: false, error: 'Erreur lors de la création du compte admin' };
    }
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, user: decoded };
    } catch (error) {
      return { success: false, error: 'Token invalide' };
    }
  }

  async changeUserRole(userId, newRole) {
    try {
      await this.db.run('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);
      return { success: true };
    } catch (error) {
      console.error('Erreur changement role:', error);
      return { success: false, error: 'Erreur lors du changement de rôle' };
    }
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
    return res.status(403).json({ error: 'Accès refusé - Droits admin requis' });
  }
  next();
}

export function ownerMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Accès refusé - Droits propriétaire requis' });
  }
  next();
}
