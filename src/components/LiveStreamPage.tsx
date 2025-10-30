import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, TriangleAlert as AlertTriangle, Loader, Monitor, ChevronUp } from 'lucide-react';
import { StreamSource } from '../types';
import Hls from 'hls.js';
import { buildProxyUrl } from '../utils/proxy';

// --- Définition des types pour l'overlay ---
type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface StreamPlayerProps {
  source: StreamSource | null;
  onError?: (error: string) => void;
  // --- NOUVELLES PROPS POUR L'OVERLAY ---
  overlaySrc?: string;         // Le chemin vers votre image (URL ou chemin local)
  overlayPosition?: OverlayPosition; // La position de l'overlay
  overlaySize?: string;        // La taille de l'overlay (ex: "w-16 h-16", "w-24 h-24")
  // --- NOUVELLES PROPS POUR LA QUALITÉ ET LE NOM ---
  quality?: 'auto' | number | string; // 'auto' | index (number) | résolution string comme '720' ou '1080'
  showStreamName?: boolean; // false pour ne pas afficher le nom du live dans le player
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({
  source,
  onError,
  overlaySrc,
  overlayPosition = 'top-right', // Position par défaut
  overlaySize = 'w-16 h-16'      // Taille par défaut (64x64px)
  ,
  quality = 'auto',
  showStreamName = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- ÉTAT POUR LA GESTION DE LA QUALITÉ ---
  const [availableQualities, setAvailableQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number | null>(null);
  const [isQualityDropdownOpen, setIsQualityDropdownOpen] = useState(false);

  // --- Logique pour déterminer la classe CSS de positionnement ---
  const getPositionClasses = (position: OverlayPosition): string => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'top-4 right-4';
    }
  };

  // --- Fonction pour formater le label de la qualité ---
  const getQualityLabel = (level: any) => {
    if (!level) return 'Auto';
    if (level.height) {
      return `${level.height}p`;
    }
    if (level.bitrate) {
      return `${Math.round(level.bitrate/1000)}kbps`;
    }
    return 'Qualité';
  };

  // --- Fonction pour gérer le changement de qualité ---
  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      // -1 = auto (abrégé par Hls)
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setIsQualityDropdownOpen(false);
    }
  };

  // Appliquer la qualité demandée depuis le prop `quality`
  useEffect(() => {
    if (!hlsRef.current || availableQualities.length === 0) return;
    const hls = hlsRef.current;

    if (quality === 'auto' || quality === -1) {
      hls.currentLevel = -1;
      setCurrentQuality(-1);
      return;
    }

    // si quality est un index numérique
    if (typeof quality === 'number') {
      const idx = quality;
      if (idx >= -1 && idx < availableQualities.length) {
        hls.currentLevel = idx;
        setCurrentQuality(idx);
      }
      return;
    }

    // si quality est une string de résolution comme "720" ou "720p"
    const qStr = String(quality).replace(/p$/i, '');
    const desiredHeight = parseInt(qStr, 10);
    if (!isNaN(desiredHeight)) {
      const matchIdx = availableQualities.findIndex(l => l.height === desiredHeight);
      if (matchIdx !== -1) {
        hls.currentLevel = matchIdx;
        setCurrentQuality(matchIdx);
      }
    }
  }, [quality, availableQualities]);

  useEffect(() => {
    if (source && videoRef.current) {
      setIsLoading(true);
      setError(null);

      const video = videoRef.current;

      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => {
        setIsLoading(false);
        setDuration(video.duration || 0);
      };
      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleError = (e: any) => {
        setIsLoading(false);
        const errorMsg = 'Impossible de charger le flux vidéo';
        setError(errorMsg);
        onError?.(errorMsg);
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('error', handleError);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (source.url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsRef.current = hls;
          hls.loadSource(buildProxyUrl(source.url));
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, ready to play');
            // --- Initialiser les qualités disponibles ---
            setAvailableQualities(hls.levels);
            setCurrentQuality(hls.currentLevel);
            // Si un prop `quality` est fourni, on l'applique après parsing
            if (quality === 'auto' || quality === -1) {
              hls.currentLevel = -1;
              setCurrentQuality(-1);
            } else if (typeof quality === 'number') {
              if (quality >= -1 && quality < hls.levels.length) {
                hls.currentLevel = quality;
                setCurrentQuality(quality);
              }
            } else if (typeof quality === 'string') {
              const qStr = quality.replace(/p$/i, '');
              const desiredHeight = parseInt(qStr, 10);
              if (!isNaN(desiredHeight)) {
                const matchIdx = hls.levels.findIndex((l: any) => l.height === desiredHeight);
                if (matchIdx !== -1) {
                  hls.currentLevel = matchIdx;
                  setCurrentQuality(matchIdx);
                }
              }
            }
             video.play().catch(err => console.log('Auto-play prevented:', err));
          });

          // --- Mettre à jour la qualité actuelle lors d'un changement automatique ---
          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            setCurrentQuality(data.level);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Erreur fatale lors du chargement du flux');
                  hls.destroy();
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = buildProxyUrl(source.url);
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => console.log('Auto-play prevented:', err));
          });
        } else {
          setError('Votre navigateur ne supporte pas la lecture HLS');
        }
      } else {
        video.src = source.url;
      }

      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('error', handleError);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
  }, [source, onError]);

  // Mettre à jour le volume sans relancer HLS
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Erreur de lecture:', err);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const toggleFullscreen = async () => {
    if (containerRef.current) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error('Erreur plein écran:', err);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!source) {
    return (
      <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center border border-slate-700/50 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-600/50">
            <Monitor className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Aucun flux actif</h3>
          <p className="text-slate-400 text-lg">Aucune source de streaming configurée</p>
          <div className="mt-6 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-300 text-sm">
            Ajoutez une source M3U8 via le panel admin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl group"
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Erreur de lecture</h3>
            <p className="text-slate-400 text-lg mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl transition-all"
            >
              Recharger
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            crossOrigin="anonymous"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3C/svg%3E"
          />
          
          {/* --- L'OVERLAY --- */}
          {overlaySrc && (
            <img
              src={overlaySrc}
              alt="Stream Overlay"
              className={`absolute ${getPositionClasses(overlayPosition)} ${overlaySize} pointer-events-none z-10`}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <Loader className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">Chargement du flux...</p>
              </div>
            </div>
          )}

          {/* Contrôles vidéo modernes */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Barre de progression */}
            {duration > 0 && (
              <div className="mb-4">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
              </button>
              
              {/* Volume */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all"
                >
                  {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
              
              {/* Temps */}
              {duration > 0 && (
                <div className="text-white text-sm font-mono bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}
              
              <div className="flex-1"></div>
              
              {/* --- SÉLECTEUR DE QUALITÉ (NOUVEAU) --- */}
              {availableQualities.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setIsQualityDropdownOpen(!isQualityDropdownOpen)}
                    className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all flex items-center space-x-2"
                  >
                    {currentQuality !== null ? getQualityLabel(availableQualities[currentQuality]) : 'Auto'}
                    <ChevronUp className={`h-4 w-4 transition-transform ${isQualityDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isQualityDropdownOpen && (
                    <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg py-1 z-30">
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${currentQuality === -1 ? 'bg-violet-600/20' : ''}`}
                      >
                        Auto
                      </button>
                      {availableQualities.map((level, index) => (
                        <button
                          key={index}
                          onClick={() => handleQualityChange(index)}
                          className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${currentQuality === index ? 'bg-violet-600/20' : ''}`}
                        >
                          {getQualityLabel(level)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Plein écran */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all"
              >
                {isFullscreen ? <Minimize className="h-5 w-5 text-white" /> : <Maximize className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Indicateur de statut */}
          <div className="absolute top-6 left-6 z-20">
            <div className="flex items-center bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              EN DIRECT
            </div>
          </div>

          {/* Nom du stream (peut être caché via la prop showStreamName) */}
          {showStreamName && source?.name && (
            <div className="absolute top-6 right-6 z-20">
              <div className="bg-black/60 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
                {source.name}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StreamPlayer;
