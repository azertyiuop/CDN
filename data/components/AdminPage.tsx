import React, { useState, useEffect } from 'react';
import { Shield, Users, MessageCircle, Activity, Settings, Eye, Ban, Trash2, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Save, X, Crown, Sparkles, VolumeX, Key, Play, UserCheck, Image, FileText } from 'lucide-react';
import { ChatMessage, ConnectedUser, StreamLog, Report, PopupAnnouncement, StreamKey } from '../types';

interface AdminPageProps {
  allChatMessages: ChatMessage[];
  allConnectedUsers: ConnectedUser[];
  wsService: any;
  onDeleteMessage: (messageId: string) => void;
  onMuteUser: (username: string, moderatorUsername: string) => void;
  onBanUser: (username: string, moderatorUsername: string) => void;
  liveStreamActive: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({
  allChatMessages,
  allConnectedUsers,
  wsService,
  onDeleteMessage,
  onMuteUser,
  onBanUser,
  liveStreamActive
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'chat' | 'logs' | 'reports' | 'announcements' | 'streams' | 'roles'>('overview');
  const [streamLogs, setStreamLogs] = useState<StreamLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<PopupAnnouncement[]>([]);
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([]);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [showNewStreamKey, setShowNewStreamKey] = useState(false);
  const [editingStream, setEditingStream] = useState<StreamKey | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [newStreamKey, setNewStreamKey] = useState({
    key: '',
    title: '',
    description: '',
    thumbnail: ''
  });
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [showBanManagement, setShowBanManagement] = useState(false);
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [realTimeStats, setRealTimeStats] = useState({
    totalMessages: 0,
    globalMessages: 0,
    streamMessages: 0,
    activeStreams: 0,
    onlineUsers: 0
  });

  useEffect(() => {
    // Charger les données depuis localStorage
    const savedReports = JSON.parse(localStorage.getItem('chatReports') || '[]');
    const savedAnnouncements = JSON.parse(localStorage.getItem('popupAnnouncements') || '[]');
    const savedStreamKeys = JSON.parse(localStorage.getItem('streamKeys') || '[]');
    
    setReports(savedReports);
    setAnnouncements(savedAnnouncements);
    setStreamKeys(savedStreamKeys);


    const mockLogs: StreamLog[] = [
      {
        id: '1',
        action: 'USER_CONNECT',
        details: 'Nouvel utilisateur connecté',
        timestamp: new Date(Date.now() - 600000),
        username: 'Anonyme_123',
        ip: '192.168.1.45'
      },
      {
        id: '2',
        action: 'MESSAGE_SENT',
        details: 'Message envoyé dans le chat',
        timestamp: new Date(Date.now() - 300000),
        username: 'Ghost_456'
      }
    ];

    setStreamLogs(mockLogs);
    
    // Calculer les statistiques en temps réel
    updateRealTimeStats();
  }, []);

  // Mettre à jour les statistiques en temps réel
  const updateRealTimeStats = () => {
    const globalMessages = allChatMessages.filter(msg => !(msg as any).streamKey).length;
    const streamMessages = allChatMessages.filter(msg => (msg as any).streamKey).length;
    const activeStreamKeys = [...new Set(allChatMessages.filter(msg => (msg as any).streamKey).map(msg => (msg as any).streamKey))];
    
    setRealTimeStats({
      totalMessages: allChatMessages.length,
      globalMessages,
      streamMessages,
      activeStreams: activeStreamKeys.length,
      onlineUsers: allConnectedUsers.length
    });
  };

  // Mettre à jour les stats quand les données changent
  useEffect(() => {
    updateRealTimeStats();
  }, [allChatMessages, allConnectedUsers]);
  useEffect(() => {
    // Écouter les réponses admin
    if (wsService) {
      const originalCallback = wsService.onMessageCallback;
      wsService.onMessageCallback = (data) => {
        if (originalCallback) originalCallback(data);
        
        if (data.type === 'admin_response') {
          setAdminResponse(data.message);
          
          if (data.command === 'list_banned' && data.success) {
            setBannedUsers(data.data || []);
          } else if (data.command === 'list_muted' && data.success) {
            setMutedUsers(data.data || []);
          }
          
          // Effacer le message après 5 secondes
          setTimeout(() => setAdminResponse(''), 5000);
        }
      };
    }
  }, [wsService]);

  const loadBannedUsers = () => {
    if (wsService) {
      wsService.sendAdminCommand('list_banned');
    }
  };

  const loadMutedUsers = () => {
    if (wsService) {
      wsService.sendAdminCommand('list_muted');
    }
  };

  const unbanUser = (fingerprint?: string, ip?: string) => {
    if (wsService && (fingerprint || ip)) {
      wsService.sendAdminCommand('unban_user', { fingerprint, ip });
      // Recharger la liste après un court délai
      setTimeout(() => loadBannedUsers(), 1000);
    }
  };

  const unmuteUser = (fingerprint: string) => {
    if (wsService && fingerprint) {
      wsService.sendAdminCommand('unmute_user', { fingerprint });
      // Recharger la liste après un court délai
      setTimeout(() => loadMutedUsers(), 1000);
    }
  };

  const clearExpiredMutes = () => {
    if (wsService) {
      wsService.sendAdminCommand('clear_expired_mutes');
      // Recharger la liste après un court délai
      setTimeout(() => loadMutedUsers(), 1000);
    }
  };

  const handleReportAction = (reportId: string, action: 'resolved' | 'dismissed') => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { ...report, status: action } : report
    );
    setReports(updatedReports);
    localStorage.setItem('chatReports', JSON.stringify(updatedReports));
  };

  const createAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.description) {
      const announcement: PopupAnnouncement = {
        id: Date.now().toString(),
        title: newAnnouncement.title,
        description: newAnnouncement.description,
        image: newAnnouncement.image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true
      };

      const updatedAnnouncements = [...announcements, announcement];
      setAnnouncements(updatedAnnouncements);
      localStorage.setItem('popupAnnouncements', JSON.stringify(updatedAnnouncements));
      
      setNewAnnouncement({ title: '', description: '', image: '' });
      setShowNewAnnouncement(false);
    }
  };

  const toggleAnnouncement = (id: string) => {
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === id ? { ...ann, isActive: !ann.isActive } : ann
    );
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('popupAnnouncements', JSON.stringify(updatedAnnouncements));
  };

  const deleteAnnouncement = (id: string) => {
    const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('popupAnnouncements', JSON.stringify(updatedAnnouncements));
  };

  const createStreamKey = () => {
    if (newStreamKey.key && newStreamKey.title) {
      const streamKey: StreamKey = {
        id: Date.now().toString(),
        key: newStreamKey.key,
        title: newStreamKey.title,
        description: newStreamKey.description,
        thumbnail: newStreamKey.thumbnail || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1',
        isActive: false,
        createdBy: 'Admin',
        createdAt: new Date(),
        viewers: 0,
        duration: 0
      };

      const updatedStreamKeys = [...streamKeys, streamKey];
      setStreamKeys(updatedStreamKeys);
      localStorage.setItem('streamKeys', JSON.stringify(updatedStreamKeys));
      
      setNewStreamKey({ key: '', title: '', description: '', thumbnail: '' });
      setShowNewStreamKey(false);
    }
  };

  const updateStreamKey = (streamKey: StreamKey) => {
    const updatedStreamKeys = streamKeys.map(sk => 
      sk.id === streamKey.id ? streamKey : sk
    );
    setStreamKeys(updatedStreamKeys);
    localStorage.setItem('streamKeys', JSON.stringify(updatedStreamKeys));
    setEditingStream(null);
  };

  const deleteStreamKey = (id: string) => {
    const updatedStreamKeys = streamKeys.filter(sk => sk.id !== id);
    setStreamKeys(updatedStreamKeys);
    localStorage.setItem('streamKeys', JSON.stringify(updatedStreamKeys));
  };

  const toggleStreamStatus = (id: string) => {
    const updatedStreamKeys = streamKeys.map(sk => 
      sk.id === id ? { ...sk, isActive: !sk.isActive, startTime: !sk.isActive ? new Date() : undefined } : sk
    );
    setStreamKeys(updatedStreamKeys);
    localStorage.setItem('streamKeys', JSON.stringify(updatedStreamKeys));
  };

  const changeUserRole = (userId: string, newRole: 'viewer' | 'moderator' | 'admin' | 'owner') => {
    if (wsService) {
      wsService.sendAdminCommand('change_user_role', { userId, newRole });
    }
  };

  // Fonction pour gérer les bans avec confirmation
  const handleBanUser = (userId: string) => {
    const user = allConnectedUsers.find(u => u.id === userId);
    if (user) {
      const confirmed = confirm(
        `Êtes-vous sûr de vouloir bannir ${user.username} ?\n\n` +
        `IP: ${user.ip}\n` +
        `Page: ${user.page}\n` +
        `Connecté depuis: ${Math.floor((Date.now() - user.connectTime.getTime()) / 60000)} minutes`
      );
      
      if (confirmed) {
        banUser(userId);
      }
    }
  };

  const banUser = (userId: string) => {
    const user = allConnectedUsers.find(u => u.id === userId);
    if (user) {
      // Envoyer la commande de bannissement au serveur
      if (wsService) {
        wsService.sendAdminAction('ban_user', userId, user.username);
        
        // Ajouter un log local
        const logEntry: StreamLog = {
          id: Date.now().toString(),
          action: 'USER_BANNED',
          details: `Utilisateur ${user.username} banni par l'administrateur`,
          timestamp: new Date(),
          username: user.username,
          ip: user.ip
        };
        setStreamLogs(prev => [logEntry, ...prev]);
        
        // Notification de succès
        setAdminResponse(`✅ ${user.username} a été banni avec succès.`);
      } else {
        setAdminResponse('❌ Erreur: Connexion WebSocket non disponible.');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Statistiques en temps réel améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Utilisateurs en ligne', value: realTimeStats.onlineUsers, icon: Users, color: 'from-blue-500 to-cyan-500', trend: '+12%' },
          { label: 'Messages total', value: realTimeStats.totalMessages, icon: MessageCircle, color: 'from-green-500 to-emerald-500', trend: '+5%' },
          { label: 'Signalements', value: reports.filter(r => r.status === 'pending').length, icon: AlertTriangle, color: 'from-orange-500 to-red-500' },
          { label: 'Streams actifs', value: realTimeStats.activeStreams, icon: Activity, color: 'from-purple-500 to-pink-500', trend: 'stable' }
        ].map((stat, index) => (
          <div key={index} className="glass-dark border border-slate-700/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              {(stat as any).trend && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (stat as any).trend.includes('+') ? 'bg-green-500/20 text-green-400' : 
                  (stat as any).trend.includes('-') ? 'bg-red-500/20 text-red-400' : 
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {(stat as any).trend}
                </span>
              )}
            </div>
            <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`} 
                   style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition des messages par contexte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-dark border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-cyan-400" />
            Répartition des Messages
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span className="text-slate-300">Chat Global</span>
              </div>
              <span className="text-white font-semibold">{realTimeStats.globalMessages}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-slate-300">Chats de Streams</span>
              </div>
              <span className="text-white font-semibold">{realTimeStats.streamMessages}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-dark border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-400" />
            Utilisateurs par Page
          </h3>
          <div className="space-y-3">
            {['home', 'live', 'streams', 'admin'].map(page => {
              const count = allConnectedUsers.filter(user => user.page === page).length;
              return (
                <div key={page} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300 capitalize">{page}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Activité Récente</h3>
        <div className="space-y-4">
          {streamLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">{log.action}</p>
                <p className="text-slate-400 text-sm">{log.details}</p>
              </div>
              <div className="text-slate-500 text-sm">
                {log.timestamp.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Gestion du Chat</h3>
        <button
          onClick={updateRealTimeStats}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </button>
      </div>
      
      {/* Filtres et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-cyan-400 font-semibold mb-1">Messages Globaux</div>
          <div className="text-2xl font-bold text-white">{realTimeStats.globalMessages}</div>
          <div className="text-xs text-slate-400">Chat principal</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-purple-400 font-semibold mb-1">Messages Streams</div>
          <div className="text-2xl font-bold text-white">{realTimeStats.streamMessages}</div>
          <div className="text-xs text-slate-400">Dans {realTimeStats.activeStreams} stream(s)</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-green-400 font-semibold mb-1">Messages Récents</div>
          <div className="text-2xl font-bold text-white">
            {allChatMessages.filter(msg => Date.now() - msg.timestamp.getTime() < 3600000).length}
          </div>
          <div className="text-xs text-slate-400">Dernière heure</div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <span>Affichage: {allChatMessages.length} messages</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>Global</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Stream</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Système</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {allChatMessages.slice().reverse().map((message) => (
          <div key={message.id} className={`p-4 rounded-xl border transition-all hover:bg-slate-800/30 ${
            message.isSystem ? 'bg-red-500/10 border-red-500/30' : 
            (message as any).streamKey ? 'bg-purple-500/10 border-purple-500/30' : 
            'bg-slate-800/20 border-slate-700/50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {/* Indicateur de contexte */}
                <div className={`w-2 h-2 rounded-full ${
                  message.isSystem ? 'bg-red-400' :
                  (message as any).streamKey ? 'bg-purple-400' : 'bg-cyan-400'
                } animate-pulse`}></div>
                <span 
                  className="font-medium text-sm"
                  style={{ color: message.color || '#64748b' }}
                >
                  {message.role === 'admin' && '👑'} 
                  {message.role === 'moderator' && '🛡️'} 
                  {message.username}
                </span>
                {message.role === 'moderator' && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                    MOD
                  </span>
                )}
                {message.role === 'admin' && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
                    ADMIN
                  </span>
                )}
                {message.ip && (
                  <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
                    {message.ip}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-mono">
                  {message.timestamp.toLocaleTimeString('fr-FR')}
                </span>
                {!message.isSystem && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDeleteMessage(message.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all transform hover:scale-110"
                      title="Supprimer le message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onMuteUser(message.username, 'Admin')}
                      className="text-orange-400 hover:text-orange-300 p-1.5 rounded-lg hover:bg-orange-500/10 transition-all transform hover:scale-110"
                      title="Mute l'utilisateur"
                    >
                      <VolumeX className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onBanUser(message.username, 'Admin')}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all transform hover:scale-110"
                      title="Bannir l'utilisateur"
                    >
                      <Ban className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-200 break-words leading-relaxed">
              {message.message}
            </p>
          </div>
        ))}
        
        {allChatMessages.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Aucun message dans le chat pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Utilisateurs Connectés</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">
            {allConnectedUsers.length} utilisateur{allConnectedUsers.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={updateRealTimeStats}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 py-3">Utilisateur</th>
              <th className="text-left text-slate-400 py-3">Rôle</th>
              <th className="text-left text-slate-400 py-3">IP</th>
              <th className="text-left text-slate-400 py-3">Page</th>
              <th className="text-left text-slate-400 py-3">Statut</th>
              <th className="text-left text-slate-400 py-3">Connecté depuis</th>
              <th className="text-left text-slate-400 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allConnectedUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (user as any).role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    (user as any).role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {(user as any).role || 'viewer'}
                  </span>
                </td>
                <td className="py-4 text-slate-300 font-mono text-sm">{user.ip}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    user.page === 'live' ? 'bg-purple-500/20 text-purple-400' :
                    user.page === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.page === 'streams' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {user.page}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    {user.isMuted && (
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                        Mute
                      </span>
                    )}
                    <span className="text-green-400 text-xs">● Actif</span>
                  </div>
                </td>
                <td className="py-4 text-slate-400 text-sm">
                  {Math.floor((Date.now() - user.connectTime.getTime()) / 60000)} min
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => banUser(user.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                      title="Bannir"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    {user.isMuted && (
                      <button
                        onClick={() => unmuteUser(user.fingerprint || '')}
                        className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/10 transition-all"
                        title="Démute"
                      >
                        <VolumeX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {allConnectedUsers.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Users className="h-12 w-12 mx-auto mb-4" />
          <p>Aucun utilisateur connecté pour le moment</p>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
      <h3 className="text-2xl font-semibold text-white mb-6">Signalements</h3>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-semibold">Signalement de {report.reporterUsername}</h4>
                <p className="text-slate-400 text-sm">Contre {report.reportedUser}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                report.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {report.status === 'pending' ? 'En attente' : 
                 report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
              </span>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300 text-sm mb-2">Message signalé :</p>
              <p className="text-white">"{report.reportedMessage}"</p>
            </div>
            
            <div className="mb-4">
              <p className="text-slate-300 text-sm mb-2">Raison :</p>
              <p className="text-slate-200">{report.reportReason}</p>
            </div>
            
            {report.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleReportAction(report.id, 'resolved')}
                  className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Résoudre</span>
                </button>
                <button
                  onClick={() => handleReportAction(report.id, 'dismissed')}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Rejeter</span>
                </button>
              </div>
            )}
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>Aucun signalement pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">Annonces Popup</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">
            {announcements.filter(a => a.isActive).length} active{announcements.filter(a => a.isActive).length > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowNewAnnouncement(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle Annonce</span>
          </button>
        </div>
      </div>

      {showNewAnnouncement && (
        <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Créer une Annonce</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 mb-2">Titre</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-12 bg-slate-800 border border-slate-600 rounded-xl px-4 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all"
                placeholder="Titre de l'annonce"
              />
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2">Description</label>
              <textarea
                value={newAnnouncement.description}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-32 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all resize-none"
                placeholder="Description de l'annonce"
              />
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2">Image (URL)</label>
              <input
                type="url"
                value={newAnnouncement.image}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, image: e.target.value }))}
                className="w-full h-12 bg-slate-800 border border-slate-600 rounded-xl px-4 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={createAnnouncement}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 transform hover:scale-105"
              >
                <Save className="h-5 w-5" />
                <span>Créer</span>
              </button>
              <button
                onClick={() => setShowNewAnnouncement(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="glass-dark border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xl font-semibold text-white">{announcement.title}</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAnnouncement(announcement.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    announcement.isActive 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                  }`}
                >
                  {announcement.isActive ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {announcement.image && (
              <img
                src={announcement.image}
                alt={announcement.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            
            <p className="text-slate-300 text-sm">{announcement.description}</p>
          </div>
        ))}
      </div>
      
      {announcements.length === 0 && (
        <div className="glass-dark border border-slate-700/50 rounded-2xl p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-500">Aucune annonce créée</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
          <div className="glass-dark border border-slate-700/50 rounded-3xl p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Panneau d'Administration</h1>
                <p className="text-slate-400 text-lg">Gestion complète de la plateforme ABD Stream</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="glass-dark border border-slate-700/50 rounded-2xl p-2 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'chat', label: 'Chat', icon: MessageCircle },
              { id: 'reports', label: 'Signalements', icon: AlertTriangle },
              { id: 'announcements', label: 'Annonces', icon: Sparkles }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div className="animate-in fade-in-0 duration-500">
          {/* Message de réponse admin */}
          {adminResponse && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-300 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>{adminResponse}</span>
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'announcements' && renderAnnouncements()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;