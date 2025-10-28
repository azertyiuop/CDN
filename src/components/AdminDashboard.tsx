import React, { useState, useEffect } from 'react';
import {
  Users, MessageCircle, Activity, TrendingUp, Shield, Ban,
  VolumeX, Trash2, Search, RefreshCw, BarChart3, Clock,
  AlertTriangle, CheckCircle, XCircle, Eye, Settings
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'messages' | 'analytics'>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const statsResult = await apiService.getDashboardStats();
        if (statsResult.success) {
          setDashboardStats(statsResult.stats);
        }

        const connectedResult = await apiService.getConnectedUsers();
        if (connectedResult.success) {
          setConnectedUsers(connectedResult.users);
        }
      } else if (activeTab === 'users') {
        const usersResult = await apiService.getAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.users);
        }
      } else if (activeTab === 'moderation') {
        const bannedResult = await apiService.getBannedUsers();
        if (bannedResult.success) {
          setBannedUsers(bannedResult.users);
        }

        const mutedResult = await apiService.getMutedUsers();
        if (mutedResult.success) {
          setMutedUsers(mutedResult.users);
        }
      } else if (activeTab === 'messages') {
        const messagesResult = await apiService.getChatMessages(100);
        if (messagesResult.success) {
          setMessages(messagesResult.messages);
        }
      } else if (activeTab === 'analytics') {
        const logsResult = await apiService.getActivityLogs(50);
        if (logsResult.success) {
          setActivityLogs(logsResult.logs);
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showNotification('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUnban = async (fingerprint: string, ip: string) => {
    const result = await apiService.unbanUser(fingerprint, ip);
    if (result.success) {
      showNotification('success', 'Utilisateur débanni avec succès');
      loadDashboardData();
    } else {
      showNotification('error', result.error || 'Erreur lors du débannissement');
    }
  };

  const handleUnmute = async (fingerprint: string) => {
    const result = await apiService.unmuteUser(fingerprint);
    if (result.success) {
      showNotification('success', 'Utilisateur démute avec succès');
      loadDashboardData();
    } else {
      showNotification('error', result.error || 'Erreur lors du démute');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    const result = await apiService.deleteMessage(messageId);
    if (result.success) {
      showNotification('success', 'Message supprimé avec succès');
      loadDashboardData();
    } else {
      showNotification('error', result.error || 'Erreur lors de la suppression');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle en ${newRole} ?`)) return;

    const result = await apiService.changeUserRole(userId, newRole);
    if (result.success) {
      showNotification('success', 'Rôle modifié avec succès');
      loadDashboardData();
    } else {
      showNotification('error', result.error || 'Erreur lors du changement de rôle');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {dashboardStats?.users.online || 0}
          </div>
          <div className="text-sm text-slate-400">Utilisateurs en ligne</div>
          <div className="mt-2 text-xs text-slate-500">
            {dashboardStats?.users.total || 0} total
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-green-400" />
            </div>
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {dashboardStats?.messages.today || 0}
          </div>
          <div className="text-sm text-slate-400">Messages aujourd'hui</div>
          <div className="mt-2 text-xs text-slate-500">
            {dashboardStats?.messages.total || 0} total
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-400" />
            </div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {dashboardStats?.streams.active || 0}
          </div>
          <div className="text-sm text-slate-400">Streams actifs</div>
          <div className="mt-2 text-xs text-slate-500">
            {dashboardStats?.streams.totalToday || 0} aujourd'hui
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {dashboardStats?.moderation.bannedUsers || 0}
          </div>
          <div className="text-sm text-slate-400">Utilisateurs bannis</div>
          <div className="mt-2 text-xs text-slate-500">
            {dashboardStats?.moderation.mutedUsers || 0} mutes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Utilisateurs Connectés ({connectedUsers.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {connectedUsers.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-xs text-slate-500">{user.page}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">{user.ip}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-400" />
            Activité Récente
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{log.action_type}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {log.username && `Utilisateur: ${log.username}`}
                  {log.admin_username && ` - Par: ${log.admin_username}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={loadDashboardData}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="text-left p-4 text-slate-400 font-medium">Utilisateur</th>
                <th className="text-left p-4 text-slate-400 font-medium">Rôle</th>
                <th className="text-left p-4 text-slate-400 font-medium">Créé le</th>
                <th className="text-left p-4 text-slate-400 font-medium">Dernière connexion</th>
                <th className="text-left p-4 text-slate-400 font-medium">Statut</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => searchQuery === '' || u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-900/30">
                  <td className="p-4 text-white font-medium">{user.username}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' || user.role === 'owner' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Modération</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Ban className="h-5 w-5 mr-2 text-red-400" />
            Utilisateurs Bannis ({bannedUsers.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bannedUsers.map((user) => (
              <div key={user.id} className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{user.username || 'Anonyme'}</div>
                    <div className="text-xs text-slate-400 font-mono">{user.ip}</div>
                  </div>
                  <button
                    onClick={() => handleUnban(user.fingerprint, user.ip)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    Débannir
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Banni le: {new Date(user.banned_at).toLocaleString('fr-FR')}
                </div>
                {user.reason && (
                  <div className="text-xs text-slate-400 mt-1">Raison: {user.reason}</div>
                )}
              </div>
            ))}
            {bannedUsers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Aucun utilisateur banni
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <VolumeX className="h-5 w-5 mr-2 text-orange-400" />
            Utilisateurs Mute ({mutedUsers.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mutedUsers.map((user) => (
              <div key={user.id} className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{user.username || 'Anonyme'}</div>
                    <div className="text-xs text-slate-400 font-mono">{user.ip}</div>
                  </div>
                  <button
                    onClick={() => handleUnmute(user.fingerprint)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    Démute
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Expire: {new Date(user.mute_end_time).toLocaleString('fr-FR')}
                </div>
                {user.reason && (
                  <div className="text-xs text-slate-400 mt-1">Raison: {user.reason}</div>
                )}
              </div>
            ))}
            {mutedUsers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Aucun utilisateur mute
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Messages du Chat</h3>
        <button
          onClick={loadDashboardData}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{message.username}</span>
                  {message.role !== 'viewer' && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      message.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {message.role}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-slate-300 text-sm">{message.message}</p>
              {message.ip && (
                <div className="text-xs text-slate-500 font-mono mt-1">{message.ip}</div>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
          <p className="text-slate-400">Vous devez être administrateur pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Panel d'Administration</h1>
                <p className="text-white/90">Bienvenue, {user?.username}</p>
              </div>
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          {notification && (
            <div className={`p-4 rounded-lg mb-6 ${
              notification.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
              'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center space-x-2">
                {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 bg-slate-800 rounded-xl p-2 border border-slate-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'moderation', label: 'Modération', icon: Shield },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'analytics', label: 'Activité', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'moderation' && renderModeration()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'analytics' && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Logs d'Activité</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{log.action_type}</span>
                          {log.username && <span className="text-slate-400 text-sm ml-2">- {log.username}</span>}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {log.admin_username && (
                        <div className="text-xs text-slate-500 mt-1">Par: {log.admin_username}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
