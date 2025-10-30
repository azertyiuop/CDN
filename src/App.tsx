import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Crown, LogOut, Users, Radio, Zap, Globe, Lock, Activity, WifiOff } from 'lucide-react';
import AuthPage from './components/AuthPage';
import AdminPanelEnhanced from './components/AdminPanelEnhanced';
import { AdminDashboard } from './components/AdminDashboard';
import StreamPlayer from './components/StreamPlayer';
import ChatBox from './components/ChatBox';
import LegalMentionsPage from './components/LegalMentionsPage';
import DMCAPage from './components/DMCAPage';
import LiveStreamListPage from './components/LiveStreamListPage';
import { WebSocketService } from './services/websocket';
import { User, ConnectedUser, ChatMessage, StreamSource } from './types';
import { generateSecureId } from './utils';
import { useAuth } from './contexts/AuthContext';

type Page = 'home' | 'live' | 'admin' | 'admin-new' | 'legal' | 'dmca';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path === '/live') return 'live';
    if (path === '/admin') return 'admin';
    if (path === '/admin-new') return 'admin-new';
    if (path === '/legal') return 'legal';
    if (path === '/dmca') return 'dmca';
    return 'home';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminAccess, setAdminAccess] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // États WebSocket et données
  const [wsServiceInstance, setWsServiceInstance] = useState<WebSocketService | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [wsConnectionStatus, setWsConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  // État du streaming
  const [currentStreamSource, setCurrentStreamSource] = useState<StreamSource | null>(null);

  // Gestion de la navigation avec les boutons du navigateur
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/live') setCurrentPage('live');
      else if (path === '/admin') setCurrentPage('admin');
      else if (path === '/admin-new') setCurrentPage('admin-new');
      else if (path === '/legal') setCurrentPage('legal');
      else if (path === '/dmca') setCurrentPage('dmca');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialisation WebSocket
  useEffect(() => {
    const handleIncomingMessage = (data: any) => {
      try {
        switch (data.type) {
          case 'user_count':
            setActiveUsers(prev => prev !== data.count ? data.count : prev);
            break;
          case 'user_list':
            const users = data.users.map((user: any) => ({
              ...user,
              connectTime: new Date(user.connectTime),
              lastActivity: new Date(user.lastActivity),
              muteEndTime: user.muteEndTime ? new Date(user.muteEndTime) : null
            }));
            setConnectedUsers(prev => JSON.stringify(prev) !== JSON.stringify(users) ? users : prev);
            break;
          case 'chat_message':
            if (data.message) {
              const messageWithDate = {
                ...data.message,
                timestamp: new Date(data.message.timestamp)
              };
              setChatMessages(prev => [...prev.slice(-49), messageWithDate]);
            }
            break;
          case 'auth_response':
            setIsLoading(false);
            if (data.success) {
              if (data.context === 'admin_access') {
                setAdminAccess(true);
                setShowAdminPrompt(false);
                setCurrentPage('admin');
                sessionStorage.setItem('adminAccess', 'true');
              }
              setAuthError('');
            } else {
              setAuthError(data.message || 'Authentification échouée');
              setTimeout(() => setAuthError(''), 5000);
            }
            break;
          case 'login_response':
            setIsLoading(false);
            if (data.success) {
              setIsAuthenticated(true);
              setCurrentUser(data.user);
              sessionStorage.setItem('authenticated', 'true');
              sessionStorage.setItem('currentUser', JSON.stringify(data.user));
              setAuthSuccess('Connexion réussie !');
              setTimeout(() => setAuthSuccess(''), 3000);
            } else {
              setAuthError(data.message || 'Erreur de connexion');
              setTimeout(() => setAuthError(''), 5000);
            }
            break;
          case 'register_response':
            setIsLoading(false);
            if (data.success) {
              setAuthSuccess('Compte créé avec succès !');
              setTimeout(() => setAuthSuccess(''), 5000);
            } else {
              setAuthError(data.message || 'Erreur lors de la création du compte');
              setTimeout(() => setAuthError(''), 5000);
            }
            break;
          case 'banned':
            alert('⚠️ ' + data.message);
            handleLogout();
            break;
          case 'stream_detected':
            if (data.stream && data.stream.hlsUrl) {
              const newStreamSource: StreamSource = {
                id: data.streamKey || crypto.randomUUID(),
                name: data.stream.title || `Stream ${data.streamKey}`,
                url: data.stream.hlsUrl,
                type: 'm3u8',
                isActive: true,
                createdAt: new Date(data.stream.startTime || new Date()),
                createdBy: 'RTMP Auto-Detect'
              };
              setCurrentStreamSource(newStreamSource);
              console.log('🔴 Stream RTMP détecté:', newStreamSource);
            }
            break;
          case 'stream_ended':
            if (currentStreamSource && data.streamKey === currentStreamSource.id) {
              setCurrentStreamSource(null);
              console.log('⏹️ Stream RTMP terminé:', data.streamKey);
            }
            break;
          case 'message_deleted':
            setChatMessages(prev => prev.filter(msg => msg.id !== data.messageId));
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    const handleConnectionStatus = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
      setWsConnectionStatus(status);
    };

    const wsService = new WebSocketService(handleIncomingMessage, handleConnectionStatus);
    wsService.connect();
    setWsServiceInstance(wsService);

    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (wsServiceInstance && currentUser && isAuthenticated) {
      wsServiceInstance.sendUserInfo(currentUser.username, 'home');
      setTimeout(() => {
        if (wsServiceInstance.ws && wsServiceInstance.ws.readyState === WebSocket.OPEN) {
          wsServiceInstance.ws.send(JSON.stringify({ type: 'join_global_chat' }));
        }
      }, 500);
    }
  }, [wsServiceInstance, currentUser, isAuthenticated]);

  // Vérification de l'authentification au chargement
  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    const adminAuth = sessionStorage.getItem('adminAccess');
    const savedUser = sessionStorage.getItem('currentUser');
    
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
    if (adminAuth === 'true') {
      setAdminAccess(true);
    }
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner')) {
      setAdminAccess(true);
    } else {
      setAdminAccess(false);
    }
  }, [currentUser]);

  // Fonctions d'authentification
  const handleLogin = async (username: string, password: string) => {
    if (!wsServiceInstance) {
      setAuthError('Erreur de connexion au serveur');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');
    wsServiceInstance.sendLogin(username, password);
  };

  const handleRegister = async (username: string, password: string) => {
    if (!wsServiceInstance) {
      setAuthError('Erreur de connexion au serveur');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');
    wsServiceInstance.sendRegister(username, password);
  };

  const handleAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsServiceInstance) {
      setAuthError('Erreur de connexion au serveur');
      return;
    }

    setIsLoading(true);
    wsServiceInstance.sendAuthentication('admin_access', 'admin', adminCode);
    setAdminCode('');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    const paths: Record<Page, string> = {
      home: '/',
      live: '/live',
      admin: '/admin',
      'admin-new': '/admin-new',
      legal: '/legal',
      dmca: '/dmca'
    };
    window.history.pushState({}, '', paths[page]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminAccess(false);
    sessionStorage.clear();
    navigateToPage('home');
  };

  const handleStreamSourceChange = useCallback((source: StreamSource | null) => {
    setCurrentStreamSource(source);
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);


  // Page d'authentification obligatoire
  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        error={authError}
        success={authSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation moderne */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  ABD STREAM
                </span>
                <div className="text-xs text-slate-400 font-medium">Plateforme Sécurisée</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation pages */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateToPage('home')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    currentPage === 'home'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => navigateToPage('live')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    currentPage === 'live'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Live
                </button>
              </div>

              {/* Statistiques en temps réel */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300 font-medium">{activeUsers}</span>
                </div>

                {currentStreamSource && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <Radio className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-300 font-medium">LIVE</span>
                  </div>
                )}
              </div>

              {adminAccess && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateToPage(currentPage === 'admin' ? 'home' : 'admin')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      currentPage === 'admin'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-600/30'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={() => navigateToPage(currentPage === 'admin-new' ? 'home' : 'admin-new')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      currentPage === 'admin-new'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-600/30'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Pro</span>
                  </button>
                </div>
              )}
              
              {/* Profil utilisateur */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-semibold">{currentUser?.username}</div>
                  <div className={`text-xs font-medium ${
                    currentUser?.role === 'admin' ? 'text-red-400' :
                    currentUser?.role === 'moderator' ? 'text-purple-400' :
                    'text-slate-400'
                  }`}>
                    {currentUser?.role?.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-slate-600/30 hover:border-red-500/30"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Message d'avertissement WebSocket */}
      {(wsConnectionStatus === 'disconnected' || wsConnectionStatus === 'error') && (
        <div className="bg-red-500/10 border-b border-red-500/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-center space-x-3">
              <WifiOff className="h-5 w-5 text-red-400" />
              <p className="text-red-300 text-sm font-medium">
                Le serveur WebSocket n'est pas disponible. Veuillez démarrer le serveur: <code className="bg-red-500/20 px-2 py-1 rounded font-mono text-xs">cd server && npm start</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {wsConnectionStatus === 'connecting' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
              <p className="text-yellow-300 text-sm font-medium">
                Connexion au serveur WebSocket en cours...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="animate-in fade-in-0 duration-500">
        {currentPage === 'live' ? (
          <LiveStreamListPage currentUser={currentUser} onBack={() => navigateToPage('home')} chatMessages={chatMessages} wsService={wsServiceInstance} />
        ) : currentPage === 'legal' ? (
          <LegalMentionsPage onBack={() => navigateToPage('home')} />
        ) : currentPage === 'dmca' ? (
          <DMCAPage onBack={() => navigateToPage('home')} />
        ) : currentPage === 'admin-new' && adminAccess ? (
          <AdminDashboard />
        ) : currentPage === 'admin' && adminAccess ? (
          <AdminPanelEnhanced
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            chatMessages={chatMessages}
            wsService={wsServiceInstance}
          />
        ) : (
          /* Page d'accueil moderne avec lecteur de stream */
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-4">
                    Bienvenue sur ABD Stream
                  </h1>
                  <p className="text-xl text-slate-300 font-medium">
                    Plateforme de streaming sécurisée et anonyme nouvelle génération
                  </p>
                </div>
                
                {/* Lecteur de stream moderne */}
                <div className="mb-8">
                  <StreamPlayer 
                    source={currentStreamSource}
                    onError={(error) => console.error('Stream error:', error)}
                  />
                </div>
                
                {/* Informations sur le stream actuel */}
                {currentStreamSource && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Radio className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          🔴 {currentStreamSource.name}
                        </h3>
                        <p className="text-slate-400">
                          Type: {currentStreamSource.type.toUpperCase()} • 
                          Créé par <span className="text-violet-400 font-semibold">{currentStreamSource.createdBy}</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-300 text-sm font-mono break-all">{currentStreamSource.url}</p>
                    </div>
                  </div>
                )}
                
                {/* Chat Global quand pas de stream */}
                {!currentStreamSource && (
                  <div className="mb-8">
                    <ChatBox
                      messages={chatMessages}
                      currentUser={currentUser}
                      wsService={wsServiceInstance}
                      onDeleteMessage={handleDeleteMessage}
                    />
                  </div>
                )}

                {/* Statistiques modernes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { 
                      label: 'Utilisateurs actifs', 
                      value: activeUsers.toLocaleString(), 
                      icon: Users, 
                      color: 'from-blue-500 to-cyan-500',
                      bg: 'bg-blue-500/10',
                      border: 'border-blue-500/20'
                    },
                    { 
                      label: 'Sécurité', 
                      value: '100%', 
                      icon: Shield, 
                      color: 'from-emerald-500 to-green-500',
                      bg: 'bg-emerald-500/10',
                      border: 'border-emerald-500/20'
                    },
                    { 
                      label: 'Anonymat', 
                      value: '∞', 
                      icon: Lock, 
                      color: 'from-violet-500 to-purple-500',
                      bg: 'bg-violet-500/10',
                      border: 'border-violet-500/20'
                    },
                    { 
                      label: 'Performance', 
                      value: '99.9%', 
                      icon: Zap, 
                      color: 'from-orange-500 to-red-500',
                      bg: 'bg-orange-500/10',
                      border: 'border-orange-500/20'
                    }
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className={`${stat.bg} backdrop-blur-sm border ${stat.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}
                    >
                      <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <stat.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer moderne */}
            <footer className="mt-16 pb-8">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <p className="text-slate-400 text-sm">
                      © {new Date().getFullYear()} ABD Stream. Tous droits réservés
                      <span
                        onClick={() => setShowAdminPrompt(true)}
                        className="cursor-pointer hover:text-red-400 transition-colors"
                        title="Accès Admin"
                      >
                        .
                      </span>
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Plateforme de streaming sécurisée et anonyme
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setCurrentPage('legal')}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
                    >
                      Mentions Légales
                    </button>
                    <button
                      onClick={() => setCurrentPage('dmca')}
                      className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                      DMCA
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        )}
      </main>

      {/* Modal de connexion admin */}
      {showAdminPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Accès Administrateur</h2>
            <p className="text-slate-400 mb-6">Entrez le code d'accès administrateur</p>
            <form onSubmit={handleAdminAccess}>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Code d'accès"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 mb-4"
                autoFocus
              />
              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPrompt(false);
                    setAdminCode('');
                    setAuthError('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Vérification...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
