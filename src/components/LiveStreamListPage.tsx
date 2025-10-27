import React, { useState, useEffect } from 'react';
import { Play, Users, Clock } from 'lucide-react';
import { StreamSource } from '../types';
import StreamPlayer from './StreamPlayer';
import ChatBox from './ChatBox';

interface LiveStreamListPageProps {
  currentUser: any;
  onBack: () => void;
}

export default function LiveStreamListPage({ currentUser, onBack }: LiveStreamListPageProps) {
  const [streams, setStreams] = useState<StreamSource[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStreams = localStorage.getItem('m3u_streams');
    if (storedStreams) {
      try {
        const parsedStreams = JSON.parse(storedStreams);
        setStreams(parsedStreams);
      } catch (error) {
        console.error('Error parsing streams:', error);
      }
    }
    setLoading(false);
  }, []);

  if (selectedStream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedStream(null)}
            className="mb-6 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            ← Retour à la liste
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedStream.name}</h2>
                <StreamPlayer
                  source={selectedStream}
                  onError={(error) => console.error('Stream error:', error)}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <ChatBox
                currentUser={currentUser}
                messages={[]}
                onSendMessage={(message) => console.log('Send message:', message)}
                onDeleteMessage={(id) => console.log('Delete message:', id)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2">
            Streams en Direct
          </h1>
          <p className="text-slate-400">Sélectionnez un stream pour commencer à regarder</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : streams.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
            <p className="text-slate-400 text-lg">Aucun stream disponible pour le moment</p>
            <p className="text-slate-500 text-sm mt-2">Les administrateurs peuvent ajouter des streams via le panel admin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => setSelectedStream(stream)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{stream.name}</h3>
                      <span className="text-xs text-slate-400 uppercase">{stream.type}</span>
                    </div>
                  </div>
                  {stream.isActive && (
                    <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-400 text-xs font-medium">LIVE</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Ajouté le {new Date(stream.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Par {stream.createdBy}</span>
                  </div>
                </div>

                <button
                  className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Regarder maintenant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
