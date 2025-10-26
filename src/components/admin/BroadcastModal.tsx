import React, { useState } from 'react';
import { X, Send, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface BroadcastModalProps {
  onClose: () => void;
  onSend: (message: string, type: string) => void;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'success'>('info');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message, broadcastType);
      onClose();
    }
  };

  const typeColors = {
    info: 'from-blue-500 to-cyan-500',
    warning: 'from-orange-500 to-red-500',
    success: 'from-green-500 to-emerald-500'
  };

  const typeIcons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle
  };

  const Icon = typeIcons[broadcastType];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Send className="h-6 w-6 text-cyan-400" />
            Envoyer une Annonce Globale
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Type d'annonce
            </label>
            <div className="flex gap-3">
              {['info', 'warning', 'success'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBroadcastType(type as any)}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                    broadcastType === type
                      ? `bg-gradient-to-r ${typeColors[type as keyof typeof typeColors]} text-white`
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {type === 'info' && <Info className="h-5 w-5 mx-auto" />}
                  {type === 'warning' && <AlertCircle className="h-5 w-5 mx-auto" />}
                  {type === 'success' && <CheckCircle className="h-5 w-5 mx-auto" />}
                  <div className="mt-1 text-sm capitalize">{type}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              rows={6}
              placeholder="Votre message aux utilisateurs..."
            />
          </div>

          <div className={`p-4 rounded-xl bg-gradient-to-r ${typeColors[broadcastType]} bg-opacity-20 border border-slate-700`}>
            <div className="flex items-start gap-3">
              <Icon className="h-6 w-6 mt-1" />
              <div>
                <div className="font-bold mb-1">Aperçu</div>
                <div className="text-slate-300">{message || 'Votre message apparaîtra ici...'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer à tous
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
