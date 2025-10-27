import NodeMediaServer from 'node-media-server';
import axios from 'axios';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mediaDir = join(__dirname, 'media', 'live');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

global.version = '2.7.4';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8003,
    mediaroot: join(__dirname, 'media'),
    allow_origin: '*'
  },
  trans: {
    ffmpeg: process.platform === 'win32' ? 'C:\\ffmpeg\\bin\\ffmpeg.exe' : '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        vc: 'libx264',
        vcParam: ['-preset', 'ultrafast', '-tune', 'zerolatency', '-g', '50'],
        ac: 'aac',
        acParam: ['-ab', '128k', '-ac', '2', '-ar', '44100'],
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      },
      {
        app: '',
        vc: 'libx264',
        vcParam: ['-preset', 'ultrafast', '-tune', 'zerolatency', '-g', '50'],
        ac: 'aac',
        acParam: ['-ab', '128k', '-ac', '2', '-ar', '44100'],
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsPath: './media/live'
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
const activeStreams = new Map();
const streamTimeouts = new Map();
const ffmpegProcesses = new Map();

async function notifyWebSocketServer(action, streamKey, data = {}) {
  try {
    await axios.post('http://localhost:3001/api/stream/detect', {
      action: action,
      streamKey: streamKey,
      title: data.title || `Stream ${streamKey}`,
      description: data.description || 'Stream RTMP',
      thumbnail: data.thumbnail || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1',
      rtmpUrl: `rtmp://localhost:1935/live/${streamKey}`,
      hlsUrl: `http://localhost:8003/live/${streamKey}/index.m3u8`
    });
  } catch (error) {
    console.log(`⚠️ [RTMP] Notification WS échouée: ${error.message}`);
  }
}

function startHLSConversion(streamKey) {
  const inputUrl = `rtmp://localhost:1935/live/${streamKey}`;
  const outputDir = join(mediaDir, streamKey);
  const outputPath = join(outputDir, 'index.m3u8');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const ffmpegPath = process.platform === 'win32' ? 'C:/ffmpeg/bin/ffmpeg.exe' : '/usr/bin/ffmpeg';

  const ffmpegArgs = [
    '-i', inputUrl,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-g', '50',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ac', '2',
    '-ar', '44100',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    outputPath
  ];

  const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('frame=')) {
      process.stdout.write(`\r[FFmpeg ${streamKey}] ${output.split('\n').pop()}`);
    }
  });

  ffmpeg.on('close', (code) => {
    console.log(`\n[FFmpeg ${streamKey}] Terminé (code: ${code})`);
    ffmpegProcesses.delete(streamKey);
  });

  ffmpeg.on('error', (error) => {
    console.error(`[FFmpeg ${streamKey}] Erreur:`, error.message);
  });

  ffmpegProcesses.set(streamKey, ffmpeg);

  setTimeout(() => {
    if (fs.existsSync(outputPath)) {
      console.log(`✅ [RTMP] HLS généré: ${streamKey}`);
      notifyWebSocketServer('start', streamKey, {
        hlsUrl: `http://localhost:8003/live/${streamKey}/index.m3u8`
      });
    }
  }, 5000);
}

function stopHLSConversion(streamKey) {
  const ffmpeg = ffmpegProcesses.get(streamKey);
  if (ffmpeg) {
    ffmpeg.kill('SIGTERM');
    ffmpegProcesses.delete(streamKey);
  }
}

nms.on('prePublish', (id, streamPath, args) => {
  const session = id;
  const actualStreamPath = session.streamPath;
  const streamKey = session.streamName;

  console.log(`[RTMP] 🔴 Stream démarré: ${streamKey} (path: ${actualStreamPath})`);

  activeStreams.set(streamKey, {
    id: session.id,
    streamPath: actualStreamPath,
    startTime: new Date(),
    isLive: true
  });

  setTimeout(() => startHLSConversion(streamKey), 3000);
});

nms.on('donePublish', (id, streamPath, args) => {
  const session = id;
  const actualStreamPath = session.streamPath;
  const streamKey = session.streamName;

  console.log(`[RTMP] ⏹️ Stream arrêté: ${streamKey} (path: ${actualStreamPath})`);

  if (streamTimeouts.has(streamKey)) {
    clearInterval(streamTimeouts.get(streamKey));
    streamTimeouts.delete(streamKey);
  }

  activeStreams.delete(streamKey);
  stopHLSConversion(streamKey);
  notifyWebSocketServer('stop', streamKey);

  setTimeout(() => {
    const hlsDir = join(mediaDir, streamKey);
    if (fs.existsSync(hlsDir)) {
      try {
        fs.rmSync(hlsDir, { recursive: true, force: true });
        console.log(`🧹 [RTMP] Nettoyé: ${streamKey}`);
      } catch (error) {
        console.log(`⚠️ [RTMP] Erreur nettoyage: ${error.message}`);
      }
    }
  }, 30000);
});

try {
  nms.run();
  console.log('🎥 [RTMP] Serveur démarré');
  console.log('📡 [RTMP] RTMP: rtmp://localhost:1935/live');
  console.log('🌐 [RTMP] HTTP: http://localhost:8003');
  console.log('');
  console.log('📋 [RTMP] Configuration OBS:');
  console.log('   Serveur: rtmp://localhost:1935/live');
  console.log('   Clé: votre_cle_stream');
} catch (error) {
  console.error('❌ [RTMP] Erreur démarrage:', error.message);
  process.exit(1);
}

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt RTMP...');
  streamTimeouts.forEach(timeout => clearInterval(timeout));
  ffmpegProcesses.forEach((ffmpeg, streamKey) => {
    console.log(`⏹️ Arrêt FFmpeg: ${streamKey}`);
    ffmpeg.kill('SIGTERM');
  });
  try {
    nms.stop();
  } catch (error) {
    console.log('Erreur arrêt:', error.message);
  }
  console.log('✅ RTMP arrêté');
  process.exit(0);
});

export default nms;
