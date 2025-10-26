import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Settings, Ban, VolumeX, Trash2, Eye, Crown, Search, RefreshCw, TrendingUp, ChartBar as BarChart3, Globe, CreditCard as Edit, Save, X, Megaphone, Target, MessageSquare, Download, ListFilter as Filter } from 'lucide-react';
import { ConnectedUser, ChatMessage } from '../types';
import { formatTime } from '../utils';

interface AdminPanelEnhancedProps {
  currentUser: any;
  connectedUsers: ConnectedUser[];
  chatMessages: ChatMessage[];
  wsService: any;
}

const AdminPanelEnhanced: React.FC<AdminPanelEnhancedProps> = ({
  currentUser,
  connectedUsers,
  chatMessages,
  wsService
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'chat' | 'logs' | 'settings'>('dashboard');

  // États des données admin
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [streamStats, setStreamStats] = useState<any>({
    totalStreams: 0,
    totalViews: 0,
    peakViewers: 0,
    avgDuration: 0,
    isLive: false,
    currentViewers: 0
  });
  const [allChatMessages, setAllChatMessages] = useState<any[]>([]);
  const [realConnectedUsers, setRealConnectedUsers] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState('60');

  useEffect(() => {
    if (!wsService) return;

    const handleAdminUpdate = (data: any) => {
      console.log('Admin data received:', data);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.bannedUsers) setBannedUsers(data.bannedUsers);
      if (data.mutedUsers) setMutedUsers(data.mutedUsers);
      if (data.streamStats) setStreamStats(data.streamStats);
      if (data.connectedUsers) setRealConnectedUsers(data.connectedUsers);
      if (data.chatMessages) setAllChatMessages(data.chatMessages);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'admin_data_update') {
          handleAdminUpdate(data);
        } else if (data.type === 'message_deleted') {
          setAllChatMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    if (wsService.ws) {
      wsService.ws.addEventListener('message', handleMessage);

      const checkConnectionAndRequest = () => {
        if (wsService.ws && wsService.ws.readyState === WebSocket.OPEN) {
          wsService.send({ type: 'request_admin_data' });
        } else {
          setTimeout(checkConnectionAndRequest, 500);
        }
      };

      checkConnectionAndRequest();
    }

    return () => {
      if (wsService.ws) {
        wsService.ws.removeEventListener('message', handleMessage);
      }
    };
  }, [wsService]);

  const handleBanUser = () => {
    if (!selectedUser || !wsService) return;

    wsService.send({
      type: 'admin_action',
      action: 'ban',
      data: {
        fingerprint: selectedUser.fingerprint || '',
        ip: selectedUser.ip_address || selectedUser.ip || '',
        username: selectedUser.username,
        reason: banReason,
        duration: banDuration,
        bannedBy: currentUser.username
      }
    });

    setShowBanModal(false);
    setBanReason('');
    setSelectedUser(null);
  };

  const handleMuteUser = () => {
    if (!selectedUser || !wsService) return;

    wsService.send({
      type: 'admin_action',
      action: 'mute',
      data: {
        fingerprint: selectedUser.fingerprint || '',
        username: selectedUser.username,
        ip: selectedUser.ip_address || selectedUser.ip || '',
        reason: muteReason,
        duration: parseInt(muteDuration),
        mutedBy: currentUser.username
      }
    });

    setShowMuteModal(false);
    setMuteReason('');
    setSelectedUser(null);
  };

  const handleUnban = (bannedUser: any) => {
    if (!wsService) return;

    wsService.send({
      type: 'admin_action',
      action: 'unban',
      data: {
        fingerprint: bannedUser.fingerprint,
        ip: bannedUser.ip_address,
        adminUsername: currentUser.username
      }
    });
  };

  const handleUnmute = (mutedUser: any) => {
    if (!wsService) return;

    wsService.send({
      type: 'admin_action',
      action: 'unmute',
      data: {
        fingerprint: mutedUser.fingerprint,
        adminUsername: currentUser.username
      }
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!wsService) return;

    wsService.send({
      type: 'admin_action',
      action: 'delete_message',
      data: {
        messageId,
        adminUsername: currentUser.username
      }
    });
  };

  // Statistiques calculées
  const stats = {
    totalUsers: realConnectedUsers.length || connectedUsers.length,
    totalMessages: allChatMessages.length || chatMessages.length,
    totalBanned: bannedUsers.length,
    totalMuted: mutedUsers.length,
    recentLogs: activityLogs.length
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const severityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-red-500" />
              Panel Admin - Live Data
            </h1>
            <p className="text-slate-400">Données en temps réel via WebSocket</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live via WebSocket</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Utilisateurs' },
            { id: 'moderation', icon: Shield, label: 'Modération' },
            { id: 'chat', icon: MessageSquare, label: 'Messages' },
            { id: 'logs', icon: Activity, label: 'Logs' },
            { id: 'settings', icon: Settings, label: 'Paramètres' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-medium">En ligne</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalUsers}</div>
                <div className="text-slate-400 text-sm">Utilisateurs connectés</div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Messages</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalMessages}</div>
                <div className="text-slate-400 text-sm">Messages totaux</div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Ban className="h-8 w-8 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Bans</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalBanned}</div>
                <div className="text-slate-400 text-sm">Utilisateurs bannis</div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <VolumeX className="h-8 w-8 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Mutes</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalMuted}</div>
                <div className="text-slate-400 text-sm">Utilisateurs mute</div>
              </div>
            </div>

            {/* Stream Stats */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Statistiques Streams</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Total Streams</div>
                  <div className="text-2xl font-bold">{streamStats.totalStreams}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Viewers Actuels</div>
                  <div className="text-2xl font-bold text-cyan-400">{streamStats.currentViewers}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Peak Viewers</div>
                  <div className="text-2xl font-bold text-purple-400">{streamStats.peakViewers}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Total Vues</div>
                  <div className="text-2xl font-bold text-green-400">{streamStats.totalViews}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Activité Récente</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activityLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[log.severity]}`}>
                        {log.severity}
                      </div>
                      <div>
                        <div className="font-medium">{log.action_type}</div>
                        <div className="text-sm text-slate-400">{log.username}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Utilisateurs Connectés ({realConnectedUsers.length || connectedUsers.length})</h3>
            <div className="space-y-3">
              {(realConnectedUsers.length > 0 ? realConnectedUsers : connectedUsers).map((user: any) => (
                <div key={user.id} className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{user.username || 'Anonymous'}</div>
                      {user.role && user.role !== 'viewer' && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      {user.ip_address || user.ip} • Page: {user.page || 'unknown'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Connecté: {new Date(user.connectTime || user.connect_time).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser({...user, ip_address: user.ip_address || user.ip});
                        setShowMuteModal(true);
                      }}
                      className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
                      title="Mute user"
                    >
                      <VolumeX className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser({...user, ip_address: user.ip_address || user.ip});
                        setShowBanModal(true);
                      }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Ban user"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Utilisateurs Bannis ({bannedUsers.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {bannedUsers.map((ban: any) => (
                  <div key={ban.id} className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{ban.username}</div>
                      <button
                        onClick={() => handleUnban(ban)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                      >
                        Débannir
                      </button>
                    </div>
                    <div className="text-sm text-slate-400">
                      <div>Raison: {ban.reason}</div>
                      <div>Par: {ban.banned_by}</div>
                      <div>{new Date(ban.banned_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Utilisateurs Mute ({mutedUsers.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {mutedUsers.map((mute: any) => (
                  <div key={mute.id} className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{mute.username}</div>
                      <button
                        onClick={() => handleUnmute(mute)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                      >
                        Démute
                      </button>
                    </div>
                    <div className="text-sm text-slate-400">
                      <div>Raison: {mute.reason}</div>
                      <div>Expire: {new Date(mute.mute_end_time).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Messages ({allChatMessages.length})</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {allChatMessages.slice().reverse().map((msg: any) => (
                <div key={msg.id} className="p-4 bg-slate-900/50 rounded-xl flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{msg.username}</div>
                      {msg.role && msg.role !== 'viewer' && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                          {msg.role}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300">{msg.message}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg h-fit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="all">Toutes sévérités</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[log.severity] || 'bg-slate-500/20 text-slate-400'}`}>
                      {log.severity || 'unknown'}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-medium mb-1">{log.action_type}</div>
                  <div className="text-sm text-slate-400">
                    {log.username && `Utilisateur: ${log.username}`}
                    {log.admin_username && ` • Par: ${log.admin_username}`}
                    {log.ip_address && ` • IP: ${log.ip_address}`}
                  </div>
                  {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (
                    <div className="text-xs text-slate-500 mt-2">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showBanModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Bannir {selectedUser?.username}</h3>
              <div className="space-y-4 mb-6">
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-4 bg-slate-800 rounded-xl text-white"
                  rows={3}
                  placeholder="Raison du ban..."
                />
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full p-4 bg-slate-800 rounded-xl text-white"
                >
                  <option value="1">1 heure</option>
                  <option value="24">24 heures</option>
                  <option value="168">7 jours</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={!banReason}
                  className="flex-1 px-6 py-3 bg-red-500 rounded-xl disabled:opacity-50"
                >
                  Bannir
                </button>
              </div>
            </div>
          </div>
        )}

        {showMuteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Mute {selectedUser?.username}</h3>
              <div className="space-y-4 mb-6">
                <textarea
                  value={muteReason}
                  onChange={(e) => setMuteReason(e.target.value)}
                  className="w-full p-4 bg-slate-800 rounded-xl text-white"
                  rows={3}
                  placeholder="Raison du mute..."
                />
                <select
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-full p-4 bg-slate-800 rounded-xl text-white"
                >
                  <option value="5">5 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="1440">24 heures</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMuteModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={handleMuteUser}
                  disabled={!muteReason}
                  className="flex-1 px-6 py-3 bg-orange-500 rounded-xl disabled:opacity-50"
                >
                  Mute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelEnhanced;
