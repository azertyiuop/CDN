import { SERVER_CONFIG } from './config.mjs';

const { IS_PRODUCTION, RTMP_PORT, FRONTEND_URL, DATABASE_URL } = SERVER_CONFIG;

if (IS_PRODUCTION) {
  console.log('Starting unified server for production (Railway)...');
  await import('./unified-server.mjs');
} else {
  console.log('Starting development servers...');
  await import('./api-server.mjs');
  await import('./rtmp.mjs');

  const { WS_PORT, API_PORT, HTTP_PORT } = SERVER_CONFIG;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀  ABD Stream - Serveurs démarrés avec succès');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📡 WebSocket Server: ws://localhost:${WS_PORT}`);
  console.log(`🎥 RTMP Server: rtmp://localhost:${RTMP_PORT}/live`);
  console.log(`🌐 HLS Server: http://localhost:${HTTP_PORT}`);
  console.log(`🔧 API Server: http://localhost:${API_PORT}`);
  console.log('');
  console.log(`💾 Base de données: ${DATABASE_URL ? 'Supabase PostgreSQL' : 'SQLite (local)'}`);
  console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('ℹ️  Configuration:');
  console.log('   - Pour streamer: OBS → rtmp://localhost:1935/live');
  console.log('   - Stream key: votre_stream_key');
  console.log(`   - Voir le stream: ${FRONTEND_URL}/live`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}
