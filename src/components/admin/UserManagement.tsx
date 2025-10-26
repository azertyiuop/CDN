import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, Eye, Edit, Trash2, Search, RefreshCw, Plus, Save, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'moderator' | 'viewer';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

interface UserManagementProps {
  currentUser: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:3002/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/api/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Rôle mis à jour avec succès`);
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Utilisateur supprimé avec succès');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error deleting user:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-red-400" />;
      case 'moderator': return <Shield className="h-4 w-4 text-purple-400" />;
      default: return <Eye className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-400" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-slate-400 mt-1">Gérez les rôles et permissions des utilisateurs</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition border border-blue-500/30"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-300">
          {success}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-6 py-4 text-slate-300 font-semibold">Utilisateur</th>
                <th className="text-left px-6 py-4 text-slate-300 font-semibold">Rôle</th>
                <th className="text-left px-6 py-4 text-slate-300 font-semibold">Date de création</th>
                <th className="text-left px-6 py-4 text-slate-300 font-semibold">Dernière connexion</th>
                <th className="text-right px-6 py-4 text-slate-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.username}</div>
                        <div className="text-slate-400 text-sm">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="font-medium capitalize">{user.role}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingUser === user.id ? (
                        <>
                          <button
                            onClick={() => handleRoleChange(user.id, selectedRole)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                            title="Sauvegarder"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user.id);
                              setSelectedRole(user.role);
                            }}
                            disabled={user.id === currentUser?.id}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Modifier le rôle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white mb-1">Informations sur les rôles :</p>
            <ul className="space-y-1 text-slate-400">
              <li><span className="text-red-400 font-medium">Admin</span> : Tous les privilèges, gestion complète</li>
              <li><span className="text-purple-400 font-medium">Moderator</span> : Modération du chat, bannissements temporaires</li>
              <li><span className="text-slate-400 font-medium">Viewer</span> : Accès en lecture seule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
