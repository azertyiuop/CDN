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
  Edit, // L'icône Edit est déjà là
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
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({
  allChatMessages,
  allConnectedUsers,
  wsService,
  onDeleteMessage,
  onMuteUser,
  onBanUser,
  liveStreamActive,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'chat' | 'logs' | 'reports' | 'announcements' | 'streams' | 'roles'>('overview');
  const [streamLogs, setStreamLogs] = useState<StreamLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<PopupAnnouncement[]>([]);
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([]);
  const [showNewStreamKey, setShowNewStreamKey] = useState(false);
  
  // --- ÉTAT POUR L'ÉDITION ---
  const [editingStream, setEditingStream] = useState<StreamKey | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', url: '' });

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
    const savedReports = JSON.parse(localStorage.getItem('chatReports') || '[]');
    const savedAnnouncements = JSON.parse(localStorage.getItem('popupAnnouncements') || '[]');
    const savedStreamKeys = JSON.parse(localStorage.getItem('streamKeys') || '[]');
    
    setReports(savedReports);
    setAnnouncements(savedAnnouncements);
    setStreamKeys(savedStreamKeys);

    const mockLogs: StreamLog[] = [
      { id: '1', action: 'USER_CONNECT', details: 'Nouvel utilisateur connecté', timestamp: new Date(Date.now() - 600000), username: 'Anonyme_123', ip: '192.168.1.45' },
      { id: '2', action: 'MESSAGE_SENT', details: 'Message envoyé dans le chat', timestamp: new Date(Date.now() - 300000), username: 'Ghost_456' }
    ];
    setStreamLogs(mockLogs);
  }, []);

  useEffect(() => {
    if (wsService) {
      const originalCallback = wsService.onMessageCallback;
      wsService.onMessageCallback = (data) => {
        if (originalCallback) originalCallback(data);
        if (data.type === 'admin_response') {
          setAdminResponse(data.message);
          if (data.command === 'list_banned' && data.success) { setBannedUsers(data.data || []); }
          else if (data.command === 'list_muted' && data.success) { setMutedUsers(data.data || []); }
          setTimeout(() => setAdminResponse(''), 5000);
        }
      };
    }
  }, [wsService]);

  // --- FONCTION POUR GÉRER L'ÉDITION ---
  const handleEditClick = (stream: StreamKey) => {
    setEditingStream(stream);
    setEditFormData({ name: stream.title, url: stream.key });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateStream = async () => {
    if (!editingStream) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/streams/${editingStream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editFormData.name, url: editFormData.url }),
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour l'état local et le localStorage
        const updatedStreams = streamKeys.map(sk =>
          sk.id === editingStream.id ? { ...sk, title: editFormData.name, key: editFormData.url } : sk
        );
        setStreamKeys(updatedStreams);
        localStorage.setItem('streamKeys', JSON.stringify(updatedStreams));
        
        // Réinitialiser le formulaire d'édition
        setEditingStream(null);
        setEditFormData({ name: '', url: '' });
        alert('Flux mis à jour avec succès !');
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du flux:', error);
      alert('Une erreur est survenue lors de la mise à jour.');
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce flux ?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/streams/${streamId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        const updatedStreams = streamKeys.filter(sk => sk.id !== streamId);
        setStreamKeys(updatedStreams);
        localStorage.setItem('streamKeys', JSON.stringify(updatedStreams));
        alert('Flux supprimé avec succès !');
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du flux:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
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

  const renderStreams = () => (
    <div className="glass-dark border border-slate-700/50 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Gestion des Flux</h3>
        <button
          onClick={() => setShowNewStreamKey(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          Ajouter un flux
        </button>
      </div>

      {/* --- FORMULAIRE D'ÉDITION (s'affiche si un flux est en cours d'édition) --- */}
      {editingStream && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-violet-500/50 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Modifier le flux</h4>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
              placeholder="Nom du flux"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400"
            />
            <input
              type="text"
              name="url"
              value={editFormData.url}
              onChange={handleEditChange}
              placeholder="URL du flux M3U8"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateStream}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
              <button
                onClick={() => { setEditingStream(null); setEditFormData({ name: '', url: '' }); }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULAIRE DE CRÉATION (s'affiche si on ajoute un nouveau flux) --- */}
      {showNewStreamKey && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-violet-500/50 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Ajouter un nouveau flux</h4>
          {/* ... (conservez votre code de création existant ici) ... */}
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {streamKeys.map((stream) => (
          <div key={stream.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {stream.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{stream.title}</p>
                <p className="text-slate-400 text-sm truncate max-w-xs">{stream.key}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditClick(stream)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteStream(stream.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ... (conservez toutes vos autres fonctions comme renderOverview, renderChat, etc.)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Espace Administrateur
            </h1>
            <p className="text-slate-400">Gérez les flux, les utilisateurs et le chat</p>
          </div>
          <button onClick={onBack} className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-300 border border-slate-600/50">
            ← Retour
          </button>
        </div>

        <div className="space-y-8">
          {renderStreams()}
          {/* ... (vos autres onglets comme renderOverview, renderUsers, etc.) */}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
