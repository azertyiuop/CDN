import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Settings, Ban, VolumeX, Trash2, Eye, Crown, Search, Clock, AlertTriangle, UserX, MessageSquare, Download, Filter, RefreshCw, TrendingUp, BarChart3, Zap, Globe, Terminal, Lock, AlertCircle, CheckCircle, XCircle, Play, Pause, Radio, Video, UserCheck, UserPlus, Calendar, Server, Database, Wifi, WifiOff, Info, FileText, Mail, Key, Edit, Save, X, Bell, Send, Megaphone, Target, List } from 'lucide-react';
import { ConnectedUser, ChatMessage, StreamSource } from '../types';
import { formatTime } from '../utils';

const UserProfileModal: React.FC<any> = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Profil: {user.username}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-slate-400 text-sm">IP</div>
          <div className="text-white">{user.ip}</div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-slate-400 text-sm">Rôle</div>
          <div className="text-white">{user.role || 'viewer'}</div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="text-slate-400 text-sm">Page</div>
          <div className="text-white">{user.page}</div>
        </div>
        {user.connectTime && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-slate-400 text-sm">Connecté depuis</div>
            <div className="text-white">{new Date(user.connectTime).toLocaleString()}</div>
          </div>
        )}
        {user.discord && typeof user.discord === 'object' && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-slate-400 text-sm">Discord</div>
            <div className="text-white">
              {user.discord.discord_username && <div>Username: {user.discord.discord_username}</div>}
              {user.discord.expires_at && <div className="text-sm text-slate-400">Expire: {new Date(user.discord.expires_at).toLocaleString()}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const BroadcastModal: React.FC<any> = ({ onClose, onSend }) => {
  const [message, setMessage] = useState('');
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Diffuser un message</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-4 bg-slate-800 rounded-xl mb-4"
          rows={4}
          placeholder="Votre message..."
        />
        <button
          onClick={() => { onSend(message, 'info'); onClose(); }}
          className="w-full px-6 py-3 bg-cyan-500 rounded-xl"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

const AutoModRulesModal: React.FC<any> = ({ onClose, onSave }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Règles de modération automatique</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
      </div>
      <p className="text-slate-400 mb-4">Configuration des règles auto-mod (à venir)</p>
      <button onClick={onClose} className="w-full px-6 py-3 bg-slate-700 rounded-xl">Fermer</button>
    </div>
  </div>
);

const IPBlacklistModal: React.FC<any> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Liste noire IP/Fingerprint</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
      </div>
      <p className="text-slate-400 mb-4">Gestion de la blacklist (à venir)</p>
      <button onClick={onClose} className="w-full px-6 py-3 bg-slate-700 rounded-xl">Fermer</button>
    </div>
  </div>
);

const AnalyticsChart: React.FC<any> = ({ type, timeRange }) => (
  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
    <h4 className="font-bold mb-4 capitalize">{type}</h4>
    <div className="h-48 flex items-center justify-center text-slate-400">
      Graphique {type} - {timeRange}
    </div>
  </div>
);

interface AdminPanelProps {
  currentUser: any;
  connectedUsers: ConnectedUser[];
  chatMessages: ChatMessage[];
  wsService: any;
  onStreamSourceChange: (source: StreamSource | null) => void;
}

interface ActivityLog {
  id: string | number;
  action_type: string;
  username: string;
  ip_address: string;
  fingerprint: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  admin_username: string;
  created_at: string;
}

interface BannedUser {
  id: number;
  fingerprint: string;
  ip: string;
  username: string;
  reason: string;
  banned_at: string;
  banned_by: string;
  is_permanent: boolean;
  ban_end_time?: string;
}

interface MutedUser {
  id: number;
  fingerprint: string;
  username: string;
  ip: string;
  reason: string;
  muted_at: string;
  mute_end_time: string;
  muted_by: string;
  mute_count: number;
}

interface StreamStats {
  totalViews: number;
  peakViewers: number;
  avgDuration: number;
  totalStreams: number;
  isLive: boolean;
  currentViewers: number;
}

interface SystemSettings {
  maxViewers: number;
  chatEnabled: boolean;
  registrationEnabled: boolean;
  maintenanceMode: boolean;
  streamQuality: string;
  discordIntegration: boolean;
  discordServerId: string;
  discordRoleId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  connectedUsers,
  chatMessages,
  wsService,
  onStreamSourceChange
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'users' | 'moderation' | 'chat' | 'logs' | 'streams' | 'discord' | 'automod' | 'blacklist' | 'settings'>('dashboard');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    totalViews: 0,
    peakViewers: 0,
    avgDuration: 0,
    totalStreams: 0,
    isLive: false,
    currentViewers: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState('60');
  const [promoteRole, setPromoteRole] = useState('moderator');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxViewers: 1000,
    chatEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false,
    streamQuality: '1080p',
    discordIntegration: false,
    discordServerId: '',
    discordRoleId: ''
  });
  const [editingSettings, setEditingSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showAutoMod, setShowAutoMod] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analyticsRange, setAnalyticsRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchAllData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAllData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    setStreamStats(prev => ({
      ...prev,
      isLive: connectedUsers.length > 0,
      currentViewers: connectedUsers.length
    }));
  }, [connectedUsers]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchActivityLogs(),
        fetchBannedUsers(),
        fetchMutedUsers(),
        fetchStreamStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/activity-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.logs) {
        setActivityLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchBannedUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/banned-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.users) {
        setBannedUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching banned users:', error);
    }
  };

  const fetchMutedUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/muted-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.users) {
        setMutedUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching muted users:', error);
    }
  };

  const fetchStreamStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/stream-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.stats) {
        setStreamStats(prev => ({ ...prev, ...data.stats }));
      }
    } catch (error) {
      console.error('Error fetching stream stats:', error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/ban-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          fingerprint: selectedUser.fingerprint,
          ip: selectedUser.ip,
          username: selectedUser.username,
          reason: banReason,
          duration: banDuration,
          adminUsername: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowBanModal(false);
        setBanReason('');
        setSelectedUser(null);
        fetchAllData();

        if (wsService) {
          wsService.send({
            type: 'force_disconnect',
            fingerprint: selectedUser.fingerprint
          });
        }
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
    setIsLoading(false);
  };

  const handleMuteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/mute-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          fingerprint: selectedUser.fingerprint,
          username: selectedUser.username,
          ip: selectedUser.ip,
          reason: muteReason,
          duration: parseInt(muteDuration),
          adminUsername: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowMuteModal(false);
        setMuteReason('');
        setSelectedUser(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error muting user:', error);
    }
    setIsLoading(false);
  };

  const handleUnbanUser = async (bannedUser: BannedUser) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/unban-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          id: bannedUser.id
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
    setIsLoading(false);
  };

  const handleUnmuteUser = async (mutedUser: MutedUser) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/unmute-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          id: mutedUser.id
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error unmuting user:', error);
    }
    setIsLoading(false);
  };

  const handlePromoteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          username: selectedUser.username,
          role: promoteRole,
          adminUsername: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowPromoteModal(false);
        setSelectedUser(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error promoting user:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/delete-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          messageId,
          adminUsername: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success && wsService) {
        wsService.send({
          type: 'message_deleted',
          messageId
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          settings: systemSettings,
          adminUsername: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditingSettings(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsLoading(false);
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(activityLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString()}.json`;
    link.click();
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const filteredUsers = connectedUsers.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.ip?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredMessages = chatMessages.filter(msg =>
    msg.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: connectedUsers.length,
    totalMessages: chatMessages.length,
    totalBanned: bannedUsers.length,
    totalMuted: mutedUsers.length,
    adminCount: connectedUsers.filter(u => u.role === 'admin').length,
    moderatorCount: connectedUsers.filter(u => u.role === 'moderator').length,
    viewerCount: connectedUsers.filter(u => u.role === 'viewer').length
  };

  const severityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const roleColors = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    moderator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    viewer: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-red-500" />
              Panel Administrateur
            </h1>
            <p className="text-slate-400">Gestion complète de la plateforme</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBroadcast(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <Megaphone className="h-5 w-5" />
              Diffuser
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-3 rounded-xl transition-all ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'users', icon: Users, label: 'Utilisateurs' },
            { id: 'moderation', icon: Shield, label: 'Modération' },
            { id: 'chat', icon: MessageSquare, label: 'Messages' },
            { id: 'logs', icon: Activity, label: 'Logs' },
            { id: 'streams', icon: Video, label: 'Streams' },
            { id: 'automod', icon: Target, label: 'Auto-Mod' },
            { id: 'blacklist', icon: Ban, label: 'Blacklist' },
            { id: 'discord', icon: Globe, label: 'Discord' },
            { id: 'settings', icon: Settings, label: 'Paramètres' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-medium">En ligne</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalUsers}</div>
                <div className="text-slate-400 text-sm">Utilisateurs connectés</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Messages</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalMessages}</div>
                <div className="text-slate-400 text-sm">Messages envoyés</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Ban className="h-8 w-8 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Bans</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalBanned}</div>
                <div className="text-slate-400 text-sm">Utilisateurs bannis</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <VolumeX className="h-8 w-8 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Mutes</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.totalMuted}</div>
                <div className="text-slate-400 text-sm">Utilisateurs muets</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Video className="h-6 w-6 text-cyan-400" />
                  Statistiques Stream
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      streamStats.isLive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {streamStats.isLive ? 'Live' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Viewers actuels</span>
                    <span className="text-2xl font-bold text-cyan-400">{streamStats.currentViewers}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Total streams</span>
                    <span className="text-2xl font-bold">{streamStats.totalStreams}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Peak viewers</span>
                    <span className="text-2xl font-bold text-purple-400">{streamStats.peakViewers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  Répartition des Rôles
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-red-400" />
                      <span className="font-medium">Administrateurs</span>
                    </div>
                    <span className="text-2xl font-bold text-red-400">{stats.adminCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border-l-4 border-purple-500">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-6 w-6 text-purple-400" />
                      <span className="font-medium">Modérateurs</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{stats.moderatorCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border-l-4 border-slate-500">
                    <div className="flex items-center gap-3">
                      <Eye className="h-6 w-6 text-slate-400" />
                      <span className="font-medium">Viewers</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-400">{stats.viewerCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6 text-green-400" />
                Activité Récente
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activityLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[log.severity]}`}>
                        {log.severity}
                      </div>
                      <div>
                        <div className="font-medium">{log.action_type}</div>
                        <div className="text-sm text-slate-400">
                          {typeof log.username === 'object' ? JSON.stringify(log.username) : log.username} - {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                        </div>
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

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateur</option>
                  <option value="moderator">Modérateur</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">IP</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Page</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Connexion</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.socketId} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold">{user.username[0]}</span>
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-slate-400">{user.fingerprint?.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[user.role as keyof typeof roleColors]}`}>
                            {typeof user.role === 'object' ? JSON.stringify(user.role) : (user.role || 'viewer')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {typeof user.ip === 'object' ? JSON.stringify(user.ip) : user.ip}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {typeof user.page === 'object' ? JSON.stringify(user.page) : user.page}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(user.connectTime).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setProfileUser(user);
                                setShowUserProfile(true);
                              }}
                              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all"
                              title="Voir profil"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPromoteModal(true);
                              }}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                              title="Promouvoir"
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowMuteModal(true);
                              }}
                              className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                              title="Mute"
                            >
                              <VolumeX className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanModal(true);
                              }}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                              title="Ban"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Ban className="h-6 w-6 text-red-400" />
                  Utilisateurs Bannis ({bannedUsers.length})
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {bannedUsers.map(ban => (
                    <div key={ban.id} className="p-4 bg-slate-900/50 rounded-xl border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{typeof ban.username === 'object' ? JSON.stringify(ban.username) : ban.username}</div>
                        <button
                          onClick={() => handleUnbanUser(ban)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all disabled:opacity-50"
                        >
                          Débannir
                        </button>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <div>IP: {typeof ban.ip === 'object' ? JSON.stringify(ban.ip) : ban.ip}</div>
                        <div>Raison: {typeof ban.reason === 'object' ? JSON.stringify(ban.reason) : ban.reason}</div>
                        <div>Par: {typeof ban.banned_by === 'object' ? JSON.stringify(ban.banned_by) : ban.banned_by}</div>
                        <div>Date: {new Date(ban.banned_at).toLocaleString()}</div>
                        {!ban.is_permanent && ban.ban_end_time && (
                          <div>Expire: {new Date(ban.ban_end_time).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <VolumeX className="h-6 w-6 text-orange-400" />
                  Utilisateurs Muets ({mutedUsers.length})
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {mutedUsers.map(mute => (
                    <div key={mute.id} className="p-4 bg-slate-900/50 rounded-xl border border-orange-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{typeof mute.username === 'object' ? JSON.stringify(mute.username) : mute.username}</div>
                        <button
                          onClick={() => handleUnmuteUser(mute)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all disabled:opacity-50"
                        >
                          Démute
                        </button>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <div>IP: {typeof mute.ip === 'object' ? JSON.stringify(mute.ip) : mute.ip}</div>
                        <div>Raison: {typeof mute.reason === 'object' ? JSON.stringify(mute.reason) : mute.reason}</div>
                        <div>Par: {typeof mute.muted_by === 'object' ? JSON.stringify(mute.muted_by) : mute.muted_by}</div>
                        <div>Mute #{mute.mute_count}</div>
                        <div>Expire: {new Date(mute.mute_end_time).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {filteredMessages.map(msg => (
                  <div key={msg.id} className="p-4 bg-slate-900/50 rounded-xl flex items-start justify-between gap-4 hover:bg-slate-800/50 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[msg.role as keyof typeof roleColors]}`}>
                          {typeof msg.role === 'object' ? JSON.stringify(msg.role) : msg.role}
                        </span>
                        <span className="font-medium">{typeof msg.username === 'object' ? JSON.stringify(msg.username) : msg.username}</span>
                        <span className="text-sm text-slate-400">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-slate-300">{typeof msg.message === 'object' ? JSON.stringify(msg.message) : msg.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Toutes sévérités</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={handleExportLogs}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-all flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Exporter
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Sévérité</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Détails</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Admin</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[log.severity]}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{typeof log.action_type === 'object' ? JSON.stringify(log.action_type) : log.action_type}</td>
                        <td className="px-6 py-4 text-slate-400">{typeof log.username === 'object' ? JSON.stringify(log.username) : log.username}</td>
                        <td className="px-6 py-4 text-slate-400 max-w-md truncate">{typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</td>
                        <td className="px-6 py-4 text-slate-400">{typeof log.admin_username === 'object' ? JSON.stringify(log.admin_username) : (log.admin_username || '-')}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-6">Statistiques Détaillées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="text-slate-400 text-sm mb-2">Total Streams</div>
                  <div className="text-3xl font-bold">{streamStats.totalStreams}</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="text-slate-400 text-sm mb-2">Total Vues</div>
                  <div className="text-3xl font-bold text-cyan-400">{streamStats.totalViews}</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="text-slate-400 text-sm mb-2">Peak Viewers</div>
                  <div className="text-3xl font-bold text-purple-400">{streamStats.peakViewers}</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="text-slate-400 text-sm mb-2">Durée Moyenne</div>
                  <div className="text-3xl font-bold text-green-400">{streamStats.avgDuration}m</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Analytics Avancés</h3>
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setAnalyticsRange(range as any)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      analyticsRange === range
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalyticsChart type="users" timeRange={analyticsRange} />
              <AnalyticsChart type="messages" timeRange={analyticsRange} />
              <AnalyticsChart type="streams" timeRange={analyticsRange} />
            </div>
          </div>
        )}

        {activeTab === 'automod' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-cyan-400" />
                  Modération Automatique
                </h3>
                <button
                  onClick={() => setShowAutoMod(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl transition-all flex items-center gap-2"
                >
                  <Settings className="h-5 w-5" />
                  Configurer les règles
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">Anti-Spam</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Actif</span>
                  </div>
                  <p className="text-sm text-slate-400">Détecte les messages répétés</p>
                  <div className="mt-3 text-xs text-slate-500">Action: Mute 5min</div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">Anti-CAPS</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Actif</span>
                  </div>
                  <p className="text-sm text-slate-400">Messages en majuscules</p>
                  <div className="mt-3 text-xs text-slate-500">Action: Avertissement</div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">Anti-Liens</h4>
                    <span className="px-3 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs">Inactif</span>
                  </div>
                  <p className="text-sm text-slate-400">Bloque les URLs</p>
                  <div className="mt-3 text-xs text-slate-500">Action: Mute 10min</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blacklist' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Ban className="h-6 w-6 text-red-400" />
                  Liste Noire
                </h3>
                <button
                  onClick={() => setShowBlacklist(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all flex items-center gap-2"
                >
                  <Shield className="h-5 w-5" />
                  Gérer la blacklist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Server className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">IPs Bloquées</h4>
                      <p className="text-sm text-slate-400">Adresses IP interdites</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-cyan-400">0</div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Key className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">Fingerprints Bloqués</h4>
                      <p className="text-sm text-slate-400">Signatures uniques</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-purple-400">0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discord' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="h-6 w-6 text-indigo-400" />
                Intégration Discord
              </h3>

              <div className="space-y-6">
                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                  <h4 className="font-bold mb-4">Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Status
                      </label>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                        systemSettings.discordIntegration
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          systemSettings.discordIntegration ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {systemSettings.discordIntegration ? 'Actif' : 'Inactif'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Server ID
                      </label>
                      <input
                        type="text"
                        value={systemSettings.discordServerId}
                        onChange={(e) => setSystemSettings({...systemSettings, discordServerId: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Votre Server ID Discord"
                        disabled={!editingSettings}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Role ID (Viewer)
                      </label>
                      <input
                        type="text"
                        value={systemSettings.discordRoleId}
                        onChange={(e) => setSystemSettings({...systemSettings, discordRoleId: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Role ID pour les viewers"
                        disabled={!editingSettings}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                  <h4 className="font-bold mb-4">Commandes Discord</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <code className="text-cyan-400">/account</code>
                      <span className="text-sm text-slate-400">Créer un compte</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <code className="text-cyan-400">/ping</code>
                      <span className="text-sm text-slate-400">Test du bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="h-6 w-6 text-cyan-400" />
                  Paramètres Système
                </h3>
                {editingSettings ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSettings(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSettings(true)}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Viewers Maximum
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxViewers}
                      onChange={(e) => setSystemSettings({...systemSettings, maxViewers: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      disabled={!editingSettings}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Qualité Stream
                    </label>
                    <select
                      value={systemSettings.streamQuality}
                      onChange={(e) => setSystemSettings({...systemSettings, streamQuality: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      disabled={!editingSettings}
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="1440p">1440p</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <div className="font-medium">Chat</div>
                      <div className="text-sm text-slate-400">Activer le chat global</div>
                    </div>
                    <button
                      onClick={() => editingSettings && setSystemSettings({...systemSettings, chatEnabled: !systemSettings.chatEnabled})}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        systemSettings.chatEnabled ? 'bg-green-500' : 'bg-slate-600'
                      } ${!editingSettings && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!editingSettings}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        systemSettings.chatEnabled && 'transform translate-x-7'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <div className="font-medium">Inscriptions</div>
                      <div className="text-sm text-slate-400">Autoriser les nouveaux comptes</div>
                    </div>
                    <button
                      onClick={() => editingSettings && setSystemSettings({...systemSettings, registrationEnabled: !systemSettings.registrationEnabled})}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        systemSettings.registrationEnabled ? 'bg-green-500' : 'bg-slate-600'
                      } ${!editingSettings && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!editingSettings}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        systemSettings.registrationEnabled && 'transform translate-x-7'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <div className="font-medium">Mode Maintenance</div>
                      <div className="text-sm text-slate-400">Site en maintenance</div>
                    </div>
                    <button
                      onClick={() => editingSettings && setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        systemSettings.maintenanceMode ? 'bg-orange-500' : 'bg-slate-600'
                      } ${!editingSettings && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!editingSettings}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        systemSettings.maintenanceMode && 'transform translate-x-7'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <div className="font-medium">Intégration Discord</div>
                      <div className="text-sm text-slate-400">Activer le bot Discord</div>
                    </div>
                    <button
                      onClick={() => editingSettings && setSystemSettings({...systemSettings, discordIntegration: !systemSettings.discordIntegration})}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        systemSettings.discordIntegration ? 'bg-indigo-500' : 'bg-slate-600'
                      } ${!editingSettings && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!editingSettings}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        systemSettings.discordIntegration && 'transform translate-x-7'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Ban className="h-6 w-6 text-red-400" />
              Bannir {selectedUser?.username}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Raison
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
                  rows={3}
                  placeholder="Raison du ban..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Durée
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="1">1 heure</option>
                  <option value="24">24 heures</option>
                  <option value="168">7 jours</option>
                  <option value="720">30 jours</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleBanUser}
                disabled={isLoading || !banReason}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all disabled:opacity-50"
              >
                Bannir
              </button>
            </div>
          </div>
        </div>
      )}

      {showMuteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <VolumeX className="h-6 w-6 text-orange-400" />
              Mute {selectedUser?.username}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Raison
                </label>
                <textarea
                  value={muteReason}
                  onChange={(e) => setMuteReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                  rows={3}
                  placeholder="Raison du mute..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Durée (minutes)
                </label>
                <select
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="5">5 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="1440">24 heures</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMuteModal(false);
                  setMuteReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleMuteUser}
                disabled={isLoading || !muteReason}
                className="flex-1 px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-all disabled:opacity-50"
              >
                Mute
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              Promouvoir {selectedUser?.username}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Nouveau Rôle
                </label>
                <select
                  value={promoteRole}
                  onChange={(e) => setPromoteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="moderator">Modérateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handlePromoteUser}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-all disabled:opacity-50"
              >
                Promouvoir
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && profileUser && (
        <UserProfileModal user={profileUser} onClose={() => setShowUserProfile(false)} />
      )}

      {showBroadcast && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          onSend={(message, type) => {
            if (wsService) {
              wsService.send({
                type: 'admin_broadcast',
                message,
                broadcastType: type,
                adminUsername: currentUser.username
              });
            }
          }}
        />
      )}

      {showAutoMod && (
        <AutoModRulesModal
          onClose={() => setShowAutoMod(false)}
          onSave={(rules) => {
            console.log('Saving auto-mod rules:', rules);
          }}
        />
      )}

      {showBlacklist && (
        <IPBlacklistModal onClose={() => setShowBlacklist(false)} />
      )}
    </div>
  );
};

export default AdminPanel;
