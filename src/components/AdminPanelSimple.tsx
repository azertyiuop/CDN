import React, { useState } from 'react';
import {
  Shield, Users, Activity, BarChart3, MessageSquare, Settings,
  RefreshCw, Ban, VolumeX, Trash2, Crown
} from 'lucide-react';

interface AdminPanelSimpleProps {
  currentUser: any;
}

export const AdminPanelSimple: React.FC<AdminPanelSimpleProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'messages'>('dashboard');

  const demoStats = {
    users: { online: 5, total: 42 },
    messages: { today: 127, total: 3420 },
    streams: { active: 1, totalToday: 3 },
    moderation: { bannedUsers: 2, mutedUsers: 1 }
  };

  const demoConnectedUsers = [
    { id: '1', username: 'User1', page: 'home', ip: '127.0.0.1', role: 'viewer', connectTime: new Date().toISOString() },
    { id: '2', username: 'User2', page: 'stream', ip: '127.0.0.2', role: 'viewer', connectTime: new Date().toISOString() },
    { id: '3', username: currentUser?.username || 'Admin', page: 'admin', ip: '127.0.0.3', role: 'admin', connectTime: new Date().toISOString() }
  ];

  const demoMessages = [
    { id: '1', username: 'User1', role: 'viewer', message: 'Salut tout le monde!', timestamp: new Date().toISOString(), ip: '127.0.0.1' },
    { id: '2', username: 'User2', role: 'viewer', message: 'Comment ça va?', timestamp: new Date().toISOString(), ip: '127.0.0.2' },
    { id: '3', username: currentUser?.username || 'Admin', role: 'admin', message: 'Bienvenue sur le stream!', timestamp: new Date().toISOString(), ip: '127.0.0.3' }
  ];

  const demoBanned = [
    { id: '1', username: 'BadUser1', ip: '192.168.1.100', fingerprint: 'fp1', reason: 'Spam', banned_at: new Date().toISOString(), banned_by: 'Admin' }
  ];

  const demoMuted = [
    { id: '1', username: 'LoudUser1', ip: '192.168.1.101', fingerprint: 'fp2', reason: 'Caps spam', mute_end_time: new Date(Date.now() + 3600000).toISOString() }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{demoStats.users.online}</div>
          <div className="text-sm text-slate-400">Utilisateurs en ligne</div>
          <div className="mt-2 text-xs text-slate-500">{demoStats.users.total} total</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{demoStats.messages.today}</div>
          <div className="text-sm text-slate-400">Messages aujourd'hui</div>
          <div className="mt-2 text-xs text-slate-500">{demoStats.messages.total} total</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{demoStats.streams.active}</div>
          <div className="text-sm text-slate-400">Streams actifs</div>
          <div className="mt-2 text-xs text-slate-500">{demoStats.streams.totalToday} aujourd'hui</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{demoStats.moderation.bannedUsers}</div>
          <div className="text-sm text-slate-400">Utilisateurs bannis</div>
          <div className="mt-2 text-xs text-slate-500">{demoStats.moderation.mutedUsers} mutes</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-cyan-400" />
          Utilisateurs Connectés ({demoConnectedUsers.length})
        </h3>
        <div className="space-y-2">
          {demoConnectedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {user.username}
                    {user.role === 'admin' && <Crown className="h-4 w-4 text-yellow-400" />}
                  </div>
                  <div className="text-xs text-slate-500">{user.page}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">{user.ip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Utilisateurs Connectés</h3>
      <div className="space-y-3">
        {demoConnectedUsers.map((user) => (
          <div key={user.id} className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{user.username}</div>
                <div className="text-sm text-slate-400">{user.role} • {user.ip}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Connecté: {new Date(user.connectTime).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm hover:bg-orange-500/30">
                  Mute
                </button>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                  Ban
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Ban className="h-5 w-5 mr-2 text-red-400" />
          Utilisateurs Bannis ({demoBanned.length})
        </h3>
        <div className="space-y-3">
          {demoBanned.map((ban) => (
            <div key={ban.id} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-medium">{ban.username}</div>
                  <div className="text-xs text-slate-400 font-mono">{ban.ip}</div>
                </div>
                <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">
                  Débannir
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Raison: {ban.reason} • Par: {ban.banned_by}
              </div>
            </div>
          ))}
          {demoBanned.length === 0 && (
            <div className="text-center py-8 text-slate-500">Aucun utilisateur banni</div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <VolumeX className="h-5 w-5 mr-2 text-orange-400" />
          Utilisateurs Mute ({demoMuted.length})
        </h3>
        <div className="space-y-3">
          {demoMuted.map((mute) => (
            <div key={mute.id} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-medium">{mute.username}</div>
                  <div className="text-xs text-slate-400 font-mono">{mute.ip}</div>
                </div>
                <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">
                  Démute
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Raison: {mute.reason}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Expire: {new Date(mute.mute_end_time).toLocaleString()}
              </div>
            </div>
          ))}
          {demoMuted.length === 0 && (
            <div className="text-center py-8 text-slate-500">Aucun utilisateur mute</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Messages du Chat</h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {demoMessages.map((message) => (
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
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm">{message.message}</p>
            <div className="text-xs text-slate-500 font-mono mt-1">{message.ip}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Panel d'Administration</h1>
                <p className="text-white/90">Bienvenue, {currentUser?.username || 'Admin'}</p>
                <p className="text-white/70 text-sm mt-1">Mode démonstration - Backend non connecté</p>
              </div>
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-800 rounded-xl p-2 border border-slate-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'moderation', label: 'Modération', icon: Shield },
              { id: 'messages', label: 'Messages', icon: MessageSquare }
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

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'moderation' && renderModeration()}
        {activeTab === 'messages' && renderMessages()}
      </div>
    </div>
  );
};
