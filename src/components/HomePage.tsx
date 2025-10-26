import React, { useState, useEffect } from 'react';
import { Play, Eye, Clock, Users, Wifi, WifiOff, Grid, List, Star, MoreVertical, Sparkles, TrendingUp, RefreshCw, Shield, Activity, Globe, Lock, Zap, MessageCircle, Share2, Heart, Award, Rocket, Crown } from 'lucide-react';
import { Stream } from '../types';
import { formatDuration } from '../utils/helpers';








interface HomePageProps {
  activeUsers: number;
  onNavigate?: (page: 'home' | 'legal' | 'dmca' | 'live') => void;
}

const HomePage: React.FC<HomePageProps> = ({ activeUsers, onNavigate }) => {
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    duration: 0,
    quality: '1080p',
    status: 'offline'
  });

  useEffect(() => {
    setStreamStats(prev => ({ ...prev, status: 'offline', viewers: 0 }));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStream) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - currentStream.startTime.getTime()) / 1000);
        setStreamStats(prev => ({ ...prev, duration }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStream]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section avec design futuriste */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden mb-12 animate-in slide-in-from-top-8 duration-1000">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            
            {/* Grille de points */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:50px_50px]"></div>
            
            {/* Particules flottantes */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${5 + Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="relative z-10 px-8 py-16 text-center">
            <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8 animate-in fade-in-0 duration-500 delay-200">
              <Sparkles className="h-4 w-4 text-yellow-400 mr-2 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Plateforme Privée Nouvelle Génération</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-in slide-in-from-bottom-4 duration-700 delay-300">
              Bienvenue
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 block text-gradient-animated">
                Sur ABD
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-500">
              Découvrez une expérience de streaming révolutionnaire avec une qualité 4K cristalline et une communauté anonyme active 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-700">
              <button className="group bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-2xl btn-glow">
                <Rocket className="h-5 w-5 group-hover:animate-bounce" />
                <span>Rejoindre le Chat</span>
              </button>
              <button className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center space-x-2 hover:border-white/20">
                <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>Sécurité & Anonymat</span>
              </button>
            </div>
            
            {/* Réseaux Sociaux avec design moderne */}
            <div className="mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-900">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center justify-center">
                <Crown className="h-6 w-6 mr-3 text-yellow-400" />
                Rejoignez Notre Empire Digital
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  {
                    name: 'Telegram',
                    description: 'Canal officiel avec 15K+ membres actifs',
                    members: '15,247',
                    icon: '📱',
                    url: 'https://t.me/abdstream_official',
                    color: 'from-blue-400 to-blue-600',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30'
                  },
                  {
                    name: 'Discord',
                    description: 'Serveur communautaire premium 24/7',
                    members: '8,932',
                    icon: '🎮',
                    url: 'https://discord.gg/abdstream',
                    color: 'from-indigo-400 to-purple-600',
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/30'
                  },
                  {
                    name: 'Twitter',
                    description: 'Actualités et annonces exclusives',
                    members: '12,156',
                    icon: '🐦',
                    url: 'https://twitter.com/abdstream_off',
                    color: 'from-slate-400 to-slate-600',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/30'
                  }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group animate-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${1000 + index * 200}ms` }}
                  >
                    <div className={`glass-dark ${social.bg} border ${social.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 card-hover`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl group-hover:scale-110 transition-transform">{social.icon}</div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-white/70" />
                          <span className="text-white/70 text-sm font-medium">{social.members}</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{social.name}</h4>
                      <p className="text-white/70 text-sm mb-4">{social.description}</p>
                      <div className="flex items-center text-white group-hover:text-cyan-300 transition-colors">
                        <span className="text-sm font-medium">Rejoindre maintenant</span>
                        <Share2 className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Statistiques en temps réel avec animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-1200">
              {[
                { label: 'Utilisateurs actifs', value: (activeUsers ?? 0).toLocaleString(), icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' }, // Utilisez activeUsers ici
                { label: 'Streams HD/4K', value: '156', icon: Activity, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
                { label: 'Pays couverts', value: '89', icon: Globe, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
                { label: 'Uptime', value: '99.9%', icon: Award, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10' }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`glass-dark ${stat.bg} border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 card-hover animate-in slide-in-from-bottom-4 duration-700`}
                  style={{ animationDelay: `${1400 + index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-slate-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Fonctionnalités avec design moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Sécurité Maximale',
              description: 'Chiffrement AES-256 de bout en bout pour une protection totale de vos données',
              icon: Shield,
              color: 'from-red-500 to-orange-500',
              bg: 'bg-red-500/10',
              border: 'border-red-500/30'
            },
            {
              title: 'Anonymat Garanti',
              description: 'Aucun log, aucune trace. Votre identité reste parfaitement protégée',
              icon: Eye,
              color: 'from-purple-500 to-pink-500',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/30'
            },
            {
              title: 'Qualité Premium',
              description: 'Streaming 4K/HDR avec latence ultra-faible pour une expérience optimale',
              icon: Star,
              color: 'from-yellow-500 to-orange-500',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/30'
            },
            {
              title: 'Communauté Active',
              description: 'Rejoignez des milliers d\'utilisateurs dans un environnement sécurisé',
              icon: Users,
              color: 'from-green-500 to-emerald-500',
              bg: 'bg-green-500/10',
              border: 'border-green-500/30'
            },
            {
              title: 'Accès Global',
              description: 'Disponible dans le monde entier sans restriction géographique',
              icon: Globe,
              color: 'from-blue-500 to-cyan-500',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/30'
            },
            {
              title: 'Performance Optimale',
              description: 'Infrastructure haute performance pour une disponibilité 24/7',
              icon: Zap,
              color: 'from-indigo-500 to-purple-500',
              bg: 'bg-indigo-500/10',
              border: 'border-indigo-500/30'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`glass-dark ${feature.bg} border ${feature.border} rounded-2xl p-8 hover:scale-105 transition-all duration-300 card-hover animate-in slide-in-from-bottom-4 duration-700`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 animate-pulse`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Section CTA finale */}
        <div className="glass-dark border border-slate-700/50 rounded-3xl p-12 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à Découvrir l'Avenir du Streaming ?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Rejoignez des milliers d'utilisateurs qui ont déjà fait le choix de la liberté et de l'anonymat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('live');
                  }
                }}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl btn-glow"
              >
                Rejoindre le Chat
              </button>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:border-white/20"
              >
                En Savoir Plus
              </button>
            </div>
          </div>
        </div>

        {/* Footer avec design moderne */}
        <div className="text-center py-16 border-t border-slate-800 mt-16 animate-in fade-in-0 duration-700">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ABD Stream</span>
          </div>
          <p className="text-slate-400 mb-6 text-lg">
            La plateforme de streaming sécurisée et anonyme de nouvelle génération
          </p>
          
          {/* Liens légaux */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={() => onNavigate && onNavigate('legal')}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Mentions Légales
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigate && onNavigate('dmca')}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Plainte DMCA
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="mailto:contact@abdstream.com"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Contact
            </a>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-slate-500 group hover:text-slate-400 transition-colors">
            <span className="text-sm">Développé avec</span>
            <Heart className="h-5 w-5 text-red-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-sm">par</span>
            <span className="text-purple-400 font-semibold text-lg">ley</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;