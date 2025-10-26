import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, AlertTriangle, Check } from 'lucide-react';

interface BlacklistEntry {
  id: string;
  value: string;
  type: 'ip' | 'fingerprint';
  reason: string;
  addedBy: string;
  addedAt: string;
}

interface IPBlacklistModalProps {
  onClose: () => void;
}

const IPBlacklistModal: React.FC<IPBlacklistModalProps> = ({ onClose }) => {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [entryType, setEntryType] = useState<'ip' | 'fingerprint'>('ip');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/blacklist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBlacklist(data.blacklist);
      }
    } catch (error) {
      console.error('Error fetching blacklist:', error);
    }
  };

  const handleAdd = async () => {
    if (!newEntry.trim() || !reason.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/blacklist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          value: newEntry,
          type: entryType,
          reason
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewEntry('');
        setReason('');
        fetchBlacklist();
      }
    } catch (error) {
      console.error('Error adding to blacklist:', error);
    }
    setIsLoading(false);
  };

  const handleRemove = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/blacklist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        fetchBlacklist();
      }
    } catch (error) {
      console.error('Error removing from blacklist:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-400" />
            Liste Noire IP & Fingerprint
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-400" />
            Ajouter à la liste noire
          </h4>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setEntryType('ip')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  entryType === 'ip'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                Adresse IP
              </button>
              <button
                onClick={() => setEntryType('fingerprint')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  entryType === 'fingerprint'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                Fingerprint
              </button>
            </div>

            <input
              type="text"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder={entryType === 'ip' ? 'Ex: 192.168.1.1' : 'Ex: abc123def456...'}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison du blocage..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleAdd}
              disabled={isLoading || !newEntry.trim() || !reason.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Ajouter à la liste noire
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Entrées bloquées ({blacklist.length})
          </h4>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {blacklist.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune entrée dans la liste noire
              </div>
            ) : (
              blacklist.map((entry) => (
                <div key={entry.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entry.type === 'ip'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {entry.type.toUpperCase()}
                      </span>
                      <span className="font-mono">{entry.value}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      disabled={isLoading}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <div>Raison: {entry.reason}</div>
                    <div>Ajouté par: {entry.addedBy} le {new Date(entry.addedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default IPBlacklistModal;
