import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Users, Activity, Settings, Ban, VolumeX, Trash2, Search, RefreshCw, TrendingUp, BarChart3, Globe, Edit, Save, X, Megaphone, Target, MessageSquare, Download, Filter, Radio, Play, Plus } from 'lucide-react';
import { WebSocketService } from '../services/websocket';
import { ConnectedUser, ChatMessage } from '../types';

interface AdminDashboardProps {
  wsUrl?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ wsUrl }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'messages' | 'streams' | 'logs' | 'settings'>('dashboard');
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  // Données admin
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [streamStats, setStreamStats] = useState<any>({ totalStreams: 0, totalViews: 0, peakViewers: 0, avgDuration: 0, isLive: false, currentViewers: 0 });
  const [allChatMessages, setAllChatMessages] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState('60');

  // Streams m3u
  const [m3uStreams, setM3uStreams] = useState<any[]>([]);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');

  // Init WebSocket
  useEffect(() => {
    const svc = new WebSocketService((data: any) => {
      try {
        if (data.type === 'admin_data_update') {
          if (data.activityLogs) setActivityLogs(data.activityLogs);
          if (data.bannedUsers) setBannedUsers(data.bannedUsers);
          if (data.mutedUsers) setMutedUsers(data.mutedUsers);
          if (data.streamStats) setStreamStats(data.streamStats);
          if (data.connectedUsers) setConnectedUsers(data.connectedUsers);
          if (data.chatMessages) setAllChatMessages(data.chatMessages);
        } else if (data.type === 'message_deleted') {
          setAllChatMessages(prev => prev.filter((msg) => msg.id !== data.messageId));
        } else if (data.type === 'streams_update' && Array.isArray(data.streams)) {
          setM3uStreams(data.streams);
          localStorage.setItem('m3u_streams', JSON.stringify(data.streams));
          window.dispatchEvent(new CustomEvent('m3u_streams_updated'));
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    });
    setWsService(svc);
    svc.connect();
    const timer = setInterval(() => {
      if (svc.ws && svc.ws.readyState === WebSocket.OPEN) {
        svc.send({ type: 'request_admin_data' });
      }
    }, 5000);
    return () => {
      clearInterval(timer);
      svc.disconnect();
    };
  }, [wsUrl]);

  // Charger streams locaux
  useEffect(() => {
    const stored = localStorage.getItem('m3u_streams');
    if (stored) {
      try { setM3uStreams(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Actions streams
  const handleAddStream = () => {
    if (!newStreamName.trim() || !newStreamUrl.trim()) return alert('Veuillez remplir tous les champs');
    const newStream = {
      id: `stream_${Date.now()}`,
      name: newStreamName,
      url: newStreamUrl,
      type: 'm3u8',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };
    const updated = [...m3uStreams, newStream];
    setM3uStreams(updated);
    localStorage.setItem('m3u_streams', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('m3u_streams_updated'));
    wsService?.send({ type: 'streams_update', streams: updated });
    setShowAddStreamModal(false);
    setNewStreamName('');
    setNewStreamUrl('');
  };

  const handleDeleteStream = (streamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stream ?')) return;
    const updated = m3uStreams.filter((s) => s.id !== streamId);
    setM3uStreams(updated);
    localStorage.setItem('m3u_streams', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('m3u_streams_updated'));
    wsService?.send({ type: 'streams_update', streams: updated });
  };

  const handleToggleStreamActive = (streamId: string) => {
    const updated = m3uStreams.map((s) => (s.id === streamId ? { ...s, isActive: !s.isActive } : s));
    setM3uStreams(updated);
    localStorage.setItem('m3u_streams', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('m3u_streams_updated'));
    wsService?.send({ type: 'streams_update', streams: updated });
  };

  // Actions modération
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
        bannedBy: 'Admin'
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
        ip: selectedUser.ip_address || selectedUser.ip || '',
        username: selectedUser.username,
        reason: muteReason,
        duration: parseInt(muteDuration, 10),
        mutedBy: 'Admin'
      }
    });
    setShowMuteModal(false);
    setMuteReason('');
    setSelectedUser(null);
  };

  const filteredLogs = useMemo(() => activityLogs.filter((log) => {
    const matchesSearch = (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || (log.action_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  }), [activityLogs, searchTerm, filterSeverity]);

  const severityColors: any = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-red-500" /> Panel Admin
            </h1>
            <p className="text-slate-400">Données en temps réel via WebSocket</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Utilisateurs' },
            { id: 'moderation', icon: Shield, label: 'Modération' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'streams', icon: Radio, label: 'Streams M3U' },
            { id: 'logs', icon: Activity, label: 'Logs' },
            { id: 'settings', icon: Settings, label: 'Paramètres' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4"><Users className="h-8 w-8 text-cyan-400" /><span className="text-cyan-400 text-sm font-medium">En ligne</span></div>
                <div className="text-4xl font-bold mb-2">{connectedUsers.length}</div>
                <div className="text-slate-400 text-sm">Utilisateurs connectés</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4"><MessageSquare className="h-8 w-8 text-purple-400" /><span className="text-purple-400 text-sm font-medium">Messages</span></div>
                <div className="text-4xl font-bold mb-2">{allChatMessages.length}</div>
                <div className="text-slate-400 text-sm">Messages totaux</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4"><Activity className="h-8 w-8 text-purple-400" /><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div></div>
                <div className="text-4xl font-bold mb-2">{streamStats?.currentViewers || 0}</div>
                <div className="text-slate-400 text-sm">Viewers Actuels</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4"><TrendingUp className="h-8 w-8 text-green-400" /><span className="text-green-400 text-sm font-medium">Total Streams</span></div>
                <div className="text-4xl font-bold mb-2">{streamStats?.totalStreams || m3uStreams.length}</div>
                <div className="text-slate-400 text-sm">Streams suivis</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Utilisateurs Connectés ({connectedUsers.length})</h3>
            <div className="space-y-3">
              {connectedUsers.map((user: any) => (
                <div key={user.id} className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{user.username || 'Anonymous'}</div>
                      {user.role && user.role !== 'viewer' && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">{user.role}</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{user.ip_address || user.ip} • Page: {user.page || 'unknown'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedUser({ ...user, ip_address: user.ip_address || user.ip }); setShowMuteModal(true); }} className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors" title="Mute user"><VolumeX className="h-4 w-4" /></button>
                    <button onClick={() => { setSelectedUser({ ...user, ip_address: user.ip_address || user.ip }); setShowBanModal(true); }} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors" title="Ban user"><Ban className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Utilisateurs Bannis ({bannedUsers.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {bannedUsers.map((ban: any) => (
                  <div key={ban.id} className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{ban.username}</div>
                      <button onClick={() => wsService?.send({ type: 'admin_action', action: 'unban', data: { fingerprint: ban.fingerprint, ip: ban.ip_address, adminUsername: 'Admin' } })} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">Débannir</button>
                    </div>
                    <div className="text-sm text-slate-400"><div>Raison: {ban.reason}</div><div>Par: {ban.banned_by}</div><div>{new Date(ban.banned_at).toLocaleString()}</div></div>
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
                      <button onClick={() => wsService?.send({ type: 'admin_action', action: 'unmute', data: { fingerprint: mute.fingerprint, adminUsername: 'Admin' } })} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">Démute</button>
                    </div>
                    <div className="text-sm text-slate-400"><div>Raison: {mute.reason}</div><div>Expire: {new Date(mute.mute_end_time).toLocaleString()}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Messages ({allChatMessages.length})</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {allChatMessages.slice().reverse().map((msg: any) => (
                <div key={msg.id} className="p-4 bg-slate-900/50 rounded-xl flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{msg.username}</div>
                      {msg.role && msg.role !== 'viewer' && <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">{msg.role}</span>}
                    </div>
                    <div className="text-slate-300">{msg.message}</div>
                    <div className="text-xs text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                  <button onClick={() => wsService?.send({ type: 'admin_action', action: 'delete_message', data: { messageId: msg.id, adminUsername: 'Admin' } })} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg h-fit"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Gestion des Streams M3U</h3>
              <button onClick={() => setShowAddStreamModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"><Plus className="h-5 w-5" />Ajouter un stream</button>
            </div>
            {m3uStreams.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><Radio className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg mb-2">Aucun stream configuré</p><p className="text-sm">Cliquez sur "Ajouter un stream" pour commencer</p></div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {m3uStreams.map((stream) => (
                  <div key={stream.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stream.isActive ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500' : 'bg-slate-700'}`}><Play className="h-6 w-6 text-white" /></div>
                        <div><h4 className="text-white font-bold text-lg">{stream.name}</h4><span className="text-xs text-slate-400 uppercase">{stream.type}</span></div>
                      </div>
                      {stream.isActive && (<div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-lg"><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div><span className="text-red-400 text-xs font-medium">ACTIF</span></div>)}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-slate-400"><span className="font-medium">URL:</span><div className="mt-1 p-2 bg-slate-800 rounded text-xs break-all">{stream.url}</div></div>
                      <div className="text-sm text-slate-400">Créé le {new Date(stream.createdAt).toLocaleDateString()} par {stream.createdBy}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleStreamActive(stream.id)} className={`flex-1 py-2 rounded-xl font-medium transition-all ${stream.isActive ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>{stream.isActive ? 'Désactiver' : 'Activer'}</button>
                      <button onClick={() => handleDeleteStream(stream.id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="all">Toutes sévérités</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-900/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[log.severity] || 'bg-slate-500/20 text-slate-400'}`}>{log.severity || 'unknown'}</div>
                    <div className="text-sm text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                  <div className="font-medium mb-1">{log.action_type}</div>
                  <div className="text-sm text-slate-400">{log.username && `Utilisateur: ${log.username}`} {log.admin_username && ` • Par: ${log.admin_username}`} {log.ip_address && ` • IP: ${log.ip_address}`}</div>
                  {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (<div className="text-xs text-slate-500 mt-2">{JSON.stringify(log.details)}</div>)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Bannir {selectedUser?.username}</h3>
            <div className="space-y-4 mb-6">
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl text-white" rows={3} placeholder="Raison du ban..." />
              <select value={banDuration} onChange={(e) => setBanDuration(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl text-white"><option value="1">1 heure</option><option value="24">24 heures</option><option value="168">7 jours</option><option value="permanent">Permanent</option></select>
            </div>
            <div className="flex gap-3"><button onClick={() => setShowBanModal(false)} className="flex-1 px-6 py-3 bg-slate-700 rounded-xl">Annuler</button><button onClick={handleBanUser} disabled={!banReason} className="flex-1 px-6 py-3 bg-red-500 rounded-xl disabled:opacity-50">Bannir</button></div>
          </div>
        </div>
      )}

      {showMuteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Mute {selectedUser?.username}</h3>
            <div className="space-y-4 mb-6">
              <textarea value={muteReason} onChange={(e) => setMuteReason(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl text-white" rows={3} placeholder="Raison du mute..." />
              <select value={muteDuration} onChange={(e) => setMuteDuration(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl text-white"><option value="5">5 minutes</option><option value="30">30 minutes</option><option value="60">1 heure</option><option value="1440">24 heures</option></select>
            </div>
            <div className="flex gap-3"><button onClick={() => setShowMuteModal(false)} className="flex-1 px-6 py-3 bg-slate-700 rounded-xl">Annuler</button><button onClick={handleMuteUser} disabled={!muteReason} className="flex-1 px-6 py-3 bg-orange-500 rounded-xl disabled:opacity-50">Mute</button></div>
          </div>
        </div>
      )}

      {showAddStreamModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Ajouter un Stream M3U</h3>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Nom du stream</label><input type="text" value={newStreamName} onChange={(e) => setNewStreamName(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500" placeholder="Ex: Canal Sport HD" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">URL M3U8</label><input type="url" value={newStreamUrl} onChange={(e) => setNewStreamUrl(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500" placeholder="https://example.com/stream.m3u8" /></div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3"><p className="text-blue-400 text-sm">ℹ️ Les liens http seront lus via le proxy backend automatiquement.</p></div>
            </div>
            <div className="flex gap-3"><button onClick={() => { setShowAddStreamModal(false); setNewStreamName(''); setNewStreamUrl(''); }} className="flex-1 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">Annuler</button><button onClick={handleAddStream} disabled={!newStreamName.trim() || !newStreamUrl.trim()} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50">Ajouter</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
