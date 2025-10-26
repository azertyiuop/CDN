import React, { useState, useEffect } from 'react';
import { X, User, Clock, MessageSquare, Shield, Ban, Activity, MapPin } from 'lucide-react';

interface UserProfileModalProps {
  user: any;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalMessages: 0,
    totalSessions: 0,
    avgSessionTime: 0,
    lastSeen: '',
    firstSeen: ''
  });

  useEffect(() => {
    fetchUserHistory();
  }, [user]);

  const fetchUserHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/user-history/${user.fingerprint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserHistory(data.history);
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-cyan-400" />
            Profil Utilisateur
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">Username</div>
            <div className="text-xl font-bold">{user.username}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">Rôle</div>
            <div className="text-xl font-bold capitalize">{user.role}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">IP</div>
            <div className="text-xl font-bold">{user.ip}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <span className="font-bold">Messages envoyés</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{userStats.totalMessages}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="font-bold">Sessions totales</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{userStats.totalSessions}</div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            Historique
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userHistory.map((item, index) => (
              <div key={index} className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.action}</div>
                  <div className="text-sm text-slate-400">{item.details}</div>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-400" />
            Informations techniques
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Fingerprint</span>
              <span className="font-mono text-sm">
                {typeof user.fingerprint === 'object'
                  ? JSON.stringify(user.fingerprint)
                  : user.fingerprint || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Socket ID</span>
              <span className="font-mono text-sm">
                {typeof user.socketId === 'object'
                  ? JSON.stringify(user.socketId)
                  : user.socketId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Page actuelle</span>
              <span>{user.page}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Connecté depuis</span>
              <span>{new Date(user.connectTime).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
