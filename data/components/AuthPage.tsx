import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield, UserPlus, LogIn, Sparkles, X, Zap, Globe, Crown } from 'lucide-react';

interface AuthPageProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
  isLoading: boolean;
  error: string;
  success: string;
  isModal?: boolean;
  onClose?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  isLoading,
  error,
  success,
  isModal = false,
  onClose
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        return;
      }
      if (password.length < 6) {
        return;
      }
      onRegister(username.trim(), password);
    } else {
      onLogin(username.trim(), password);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const content = (
    <div className={isModal ? "w-full max-w-md mx-auto" : "w-full max-w-md"}>
      {/* Header moderne */}
      <div className={`text-center mb-8 animate-in slide-in-from-top-4 duration-700 ${isModal ? 'relative' : ''}`}>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-600/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Logo moderne */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25 animate-pulse">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
        </div>
        
        <h1 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-4 leading-tight ${isModal ? 'text-4xl' : 'text-5xl'}`}>
          ABD STREAM
        </h1>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="flex items-center bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-semibold">Plateforme Sécurisée</span>
          </div>
        </div>
        
        <p className={`text-slate-300 font-medium ${isModal ? 'text-base' : 'text-lg'}`}>
          {isLoginMode ? 'Accédez à votre espace privé' : 'Rejoignez la communauté exclusive'}
        </p>
      </div>

      {/* Formulaire moderne */}
      <div className="relative">
        {/* Effet de fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 rounded-3xl blur-xl"></div>
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              {isLoginMode ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLoginMode ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-slate-400">
              {isLoginMode ? 'Connectez-vous pour continuer' : 'Créez votre compte sécurisé'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom d'utilisateur */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full h-14 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl px-6 pl-14 text-white placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400/20 transition-all group-hover:bg-slate-800/70"
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
              </div>
              {!isLoginMode && (
                <p className="text-xs text-slate-500 mt-2">3-20 caractères, lettres et chiffres uniquement</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full h-14 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl px-6 pl-14 pr-14 text-white placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400/20 transition-all group-hover:bg-slate-800/70"
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLoginMode && (
                <p className="text-xs text-slate-500 mt-2">Minimum 6 caractères</p>
              )}
            </div>

            {/* Confirmation mot de passe (inscription uniquement) */}
            {!isLoginMode && (
              <div className="relative group">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    className="w-full h-14 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl px-6 pl-14 pr-14 text-white placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400/20 transition-all group-hover:bg-slate-800/70"
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-red-400 mt-2">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            )}

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 text-red-300 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 rounded-2xl p-4 text-emerald-300 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Bouton de soumission moderne */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim() || (!isLoginMode && password !== confirmPassword)}
              className="w-full h-14 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLoginMode ? 'Connexion...' : 'Inscription...'}</span>
                </>
              ) : (
                <>
                  {isLoginMode ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  <span>{isLoginMode ? 'Se connecter' : 'Créer le compte'}</span>
                  <Zap className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Basculer entre connexion et inscription */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 mb-4">
              {isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </p>
            <button
              onClick={switchMode}
              disabled={isLoading}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors disabled:opacity-50 hover:underline"
            >
              {isLoginMode ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer sécurité */}
      {!isModal && (
        <div className="text-center mt-8 animate-in fade-in-0 duration-700 delay-400">
          <div className="inline-flex items-center space-x-3 text-slate-400 group hover:text-slate-300 transition-colors">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">Sécurisé par chiffrement AES-256</span>
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      )}
    </div>
  );

  // Si c'est une modale, on l'enveloppe dans un overlay
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-50">
        <div className="relative max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  // Sinon, on retourne le contenu original en plein écran
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Effets de fond modernes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grille moderne */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:50px_50px]"></div>
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {content}
      </div>
    </div>
  );
};

export default AuthPage;