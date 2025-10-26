import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  Activity, 
  Settings,
  Eye,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Save,
  X,
  Crown,
  Sparkles,
  VolumeX,
  Key,
  Play,
  UserCheck,
  Image,
  FileText
} from 'lucide-react';
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
  }, []);

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

  const banUser = (userId: string) => {
    const user = allConnectedUsers.find(u => u.id === userId);
    if (user && confirm(`Êtes-vous sûr de vouloir bannir ${user.username} ?`)) {
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
        alert(`✅ ${user.username} a été banni avec succès.`);
      } else {
        alert('❌ Erreur: Connexion WebSocket non disponible.');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Utilisateurs connectés', value: allConnectedUsers.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Messages chat', value: allChatMessages.length, icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Signalements', value: reports.filter(r => r.status === 'pending').length, icon: AlertTriangle, color: 'from-orange-500 to-red-500' },
          { label: 'Logs système', value: streamLogs.length, icon: Activity, color: 'from-purple-500 to-pink-500' }
        ].map((stat, index) => (
          <div key={index} className="glass-dark border border-slate-700/50 rounded-2xl p-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
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
      <h3 className="text-2xl font-semibold text-white mb-6">Gestion du Chat</h3>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <span>Total des messages: {allChatMessages.length}</span>
          <span>Messages récents: {allChatMessages.filter(msg => Date.now() - msg.timestamp.getTime() < 3600000).length}</span>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {allChatMessages.slice().reverse().map((message) => (
          <div key={message.id} className={`p-4 rounded-xl border transition-all hover:bg-slate-800/30 ${
            message.isSystem ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/20 border-slate-700/50'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
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
                  <span className="text-xs text-slate-500">
                    {message.ip}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-colors"
                  title="Supprimer ce message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-slate-300">{message.text}</div>
            <div className="text-xs text-slate-500 mt-2">
              {new Date(message.timestamp).toLocaleString('fr-FR')}
            </div>
            {(message as any).streamKey && (
              <div className="text-xs text-slate-500 mt-1">
                Stream: {(message as any).streamKey}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Espace Modérateur
            </h1>
            <p className="text-slate-400">Gérez les utilisateurs et le chat</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-300 border border-slate-600/50"
          >
            ← Retour Admin
          </button>
        </div>

        <div className="space-y-8">
          {renderUsers()}
          {renderChat()}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;