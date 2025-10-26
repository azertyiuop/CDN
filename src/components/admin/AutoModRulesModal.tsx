import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, Save } from 'lucide-react';

interface AutoModRule {
  id: string;
  name: string;
  type: 'spam' | 'caps' | 'links' | 'badwords' | 'flood';
  enabled: boolean;
  action: 'warn' | 'mute' | 'ban';
  threshold: number;
  duration: number;
}

interface AutoModRulesModalProps {
  onClose: () => void;
  onSave: (rules: AutoModRule[]) => void;
}

const AutoModRulesModal: React.FC<AutoModRulesModalProps> = ({ onClose, onSave }) => {
  const [rules, setRules] = useState<AutoModRule[]>([
    {
      id: '1',
      name: 'Anti-Spam',
      type: 'spam',
      enabled: true,
      action: 'mute',
      threshold: 5,
      duration: 300
    },
    {
      id: '2',
      name: 'Anti-CAPS',
      type: 'caps',
      enabled: true,
      action: 'warn',
      threshold: 80,
      duration: 0
    },
    {
      id: '3',
      name: 'Anti-Liens',
      type: 'links',
      enabled: false,
      action: 'mute',
      threshold: 1,
      duration: 600
    }
  ]);

  const ruleTypes = [
    { value: 'spam', label: 'Messages répétés', description: 'Détecte les messages identiques' },
    { value: 'caps', label: 'MAJUSCULES', description: 'Pourcentage de majuscules' },
    { value: 'links', label: 'Liens', description: 'URLs et liens externes' },
    { value: 'badwords', label: 'Mots interdits', description: 'Langage inapproprié' },
    { value: 'flood', label: 'Flood', description: 'Messages trop rapides' }
  ];

  const actions = [
    { value: 'warn', label: 'Avertissement', color: 'yellow' },
    { value: 'mute', label: 'Mute', color: 'orange' },
    { value: 'ban', label: 'Ban', color: 'red' }
  ];

  const handleToggle = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleAdd = () => {
    const newRule: AutoModRule = {
      id: Date.now().toString(),
      name: 'Nouvelle règle',
      type: 'spam',
      enabled: true,
      action: 'warn',
      threshold: 5,
      duration: 300
    };
    setRules([...rules, newRule]);
  };

  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            Règles de Modération Automatique
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      rule.enabled ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      rule.enabled && 'transform translate-x-7'
                    }`} />
                  </button>
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => handleUpdate(rule.id, 'name', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type</label>
                  <select
                    value={rule.type}
                    onChange={(e) => handleUpdate(rule.id, 'type', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Action</label>
                  <select
                    value={rule.action}
                    onChange={(e) => handleUpdate(rule.id, 'action', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {actions.map(action => (
                      <option key={action.value} value={action.value}>{action.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Seuil</label>
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={(e) => handleUpdate(rule.id, 'threshold', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Durée (sec)</label>
                  <input
                    type="number"
                    value={rule.duration}
                    onChange={(e) => handleUpdate(rule.id, 'duration', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    disabled={rule.action === 'warn'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 mb-6 border border-slate-700"
        >
          <Plus className="h-5 w-5" />
          Ajouter une règle
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoModRulesModal;
