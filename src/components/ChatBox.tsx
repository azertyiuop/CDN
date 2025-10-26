import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { formatTime } from '../utils';

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUser: any;
  wsService: any;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, currentUser, wsService, onDeleteMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !wsService || !currentUser) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      username: currentUser.username,
      message: messageText.trim(),
      timestamp: new Date(),
      role: currentUser.role || 'viewer'
    };

    wsService.sendMessage(message);
    setMessageText('');
    setIsTyping(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
    if (wsService) {
      wsService.sendDeleteMessage(messageId);
    }
  };

  const canDeleteMessage = (message: ChatMessage) => {
    return currentUser && (
      currentUser.role === 'admin' ||
      currentUser.role === 'moderator' ||
      message.username === currentUser.username
    );
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400';
      case 'moderator':
        return 'text-purple-400';
      default:
        return 'text-emerald-400';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return '';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Chat Global</h3>
              <p className="text-sm text-slate-400">Discussion générale de la plateforme</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg font-medium">Aucun message pour le moment</p>
            <p className="text-slate-500 text-sm mt-2">Soyez le premier à envoyer un message !</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="group bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`font-bold ${getRoleColor(msg.role)}`}>
                      {msg.username}
                    </span>
                    {(msg.role === 'admin' || msg.role === 'moderator') && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(msg.role)}`}>
                        {msg.role.toUpperCase()}
                      </span>
                    )}
                    <span className="text-slate-500 text-xs font-mono">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed break-words">{msg.message}</p>
                </div>
                {canDeleteMessage(msg) && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 p-6 bg-slate-800/30">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              placeholder="Écrivez votre message..."
              className="w-full h-12 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 text-white placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400/20 transition-all"
              maxLength={500}
              disabled={!currentUser}
            />
            {isTyping && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {messageText.length}/500
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || !currentUser}
            className="h-12 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Envoyer</span>
          </button>
        </form>
        {!currentUser && (
          <p className="text-slate-500 text-sm mt-3 text-center">
            Vous devez être connecté pour envoyer des messages
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
