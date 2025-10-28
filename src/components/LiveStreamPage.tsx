import React, { useState, useEffect } from 'react';
import StreamPlayer from './StreamPlayer';
import { StreamSource } from '../types';

const LiveStreamPage: React.FC = () => {
  const [streams, setStreams] = useState<StreamSource[]>([]);
  const [currentStream, setCurrentStream] = useState<StreamSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- CE BLOC EST LE PLUS IMPORTANT ---
  useEffect(() => {
    // On utilise la variable d'environnement pour s'adapter à l'environnement (local ou production)
    // C'est cette ligne qui fait toute la magie.
    fetch(`${import.meta.env.VITE_API_URL}/api/streams`)
      .then(res => {
        if (!res.ok) {
          throw new Error('La réponse du réseau n\'était pas valide');
        }
        return res.json();
      })
      .then(data => {
        // Le backend nous renvoie une liste de flux avec des URLs de proxy déjà transformées
        if (data.success && data.streams) {
          setStreams(data.streams);
          if (data.streams.length > 0) {
            // On sélectionne le premier flux par défaut
            setCurrentStream(data.streams[0]);
          } else {
            setError('Aucun flux disponible pour le moment.');
          }
        } else {
          setError(data.error || 'Impossible de récupérer les flux.');
        }
      })
      .catch(err => {
        console.error('Erreur lors de la récupération des flux:', err);
        setError('Erreur de connexion au serveur. Vérifiez que le backend est en marche et que l\'URL dans le fichier .env.production est correcte.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois, au montage du composant.

  const handleStreamChange = (stream: StreamSource) => {
    setCurrentStream(stream);
    setError(null); // On réinitialise l'erreur si l'utilisateur change de flux
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Live Stream
        </h1>

        {/* Si vous avez plusieurs flux, vous pouvez afficher un sélecteur */}
        {streams.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {streams.map(stream => (
              <button
                key={stream.id}
                onClick={() => handleStreamChange(stream)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentStream?.id === stream.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {stream.name}
              </button>
            ))}
          </div>
        )}

        {/* On passe le flux sélectionné (avec son URL de proxy) au lecteur vidéo */}
        <StreamPlayer
          source={currentStream}
          onError={setError}
          // Configuration de l'overlay que nous avions discutée
          overlaySrc="https://via.placeholder.com/150x150/0000FF/FFFFFF?text=Logo" // Remplacez par votre image
          overlayPosition="top-right"
          overlaySize="w-24 h-24"
        />

        {/* Affichage d'une erreur générale si aucun flux n'est chargé */}
        {error && !currentStream && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamPage;
