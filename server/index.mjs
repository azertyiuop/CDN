import './rtmp.mjs';
import './api-server.mjs';

const PORT = process.env.PORT || 3002;

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀  Serveurs démarrés avec succès');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('🎥 RTMP Server: rtmp://localhost:1935/live');
console.log('🌐 HLS Server: http://localhost:8003');
console.log(`🔧 API Server: http://localhost:${PORT}`);
console.log('');
console.log('💾 Base de données: SQLite (local)');
console.log('');
console.log('⚠️  Note: WebSocket server n\'est pas encore configuré');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
