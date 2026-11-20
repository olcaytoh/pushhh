import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

const webpFallbackPlugin = (): Plugin => ({
  name: 'webp-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /\.(png|jpe?g)$/i.test(req.url.split('?')[0])) {
        const urlPath = req.url.split('?')[0];
        const localPath = path.join(__dirname, 'public', urlPath);
        if (!fs.existsSync(localPath)) {
          const webpPath = urlPath.replace(/\.(png|jpe?g)$/i, '.webp');
          const localWebp = path.join(__dirname, 'public', webpPath);
          if (fs.existsSync(localWebp)) {
            req.url = webpPath;
          }
        }
      }
      next();
    });
  }
});

const videoUploadPlugin = (): Plugin => ({
  name: 'video-upload-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/upload-sivi-video' && req.method === 'POST') {
        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const targetDir = path.join(__dirname, 'public/sivi_oyunu');
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, 'standart_olmayan_sivi_olcme.mp4');
            fs.writeFileSync(targetPath, buffer);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, path: '/sivi_oyunu/standart_olmayan_sivi_olcme.mp4' }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
      next();
    });
  }
});

const turkishTtsPlugin = (): Plugin => {
  const ttsCache = new Map<string, Buffer>();
  return {
    name: 'turkish-tts-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/tts')) {
          return next();
        }
        try {
          const parsed = new URL(req.url, 'http://localhost:3000');
          const rawText = (parsed.searchParams.get('q') || '').trim().slice(0, 200);
          if (!rawText) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing q parameter' }));
            return;
          }

          const cached = ttsCache.get(rawText);
          if (cached) {
            res.writeHead(200, {
              'Content-Type': 'audio/mpeg',
              'Content-Length': String(cached.length),
              'Cache-Control': 'public, max-age=86400',
            });
            res.end(cached);
            return;
          }

          const encoded = encodeURIComponent(rawText);
          const endpoints = [
            `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=tr&q=${encoded}`,
            `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=tr&q=${encoded}`,
          ];

          let audioBuffer: Buffer | null = null;
          for (const url of endpoints) {
            try {
              const upstream = await fetch(url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                },
              });
              if (upstream.ok) {
                const ab = await upstream.arrayBuffer();
                if (ab.byteLength > 200) {
                  audioBuffer = Buffer.from(ab);
                  break;
                }
              }
            } catch {
              // try next endpoint
            }
          }

          if (!audioBuffer) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'TTS upstream unavailable' }));
            return;
          }

          if (ttsCache.size >= 500) {
            const firstKey = ttsCache.keys().next().value;
            if (firstKey) ttsCache.delete(firstKey);
          }
          ttsCache.set(rawText, audioBuffer);

          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(audioBuffer.length),
            'Cache-Control': 'public, max-age=86400',
          });
          res.end(audioBuffer);
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err?.message || 'TTS error' }));
        }
      });
    },
  };
};

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), webpFallbackPlugin(), videoUploadPlugin(), turkishTtsPlugin()],
    build: {
      // Ağır kütüphaneleri ayrı dosyalara böl: ilk açılış küçülür, tarayıcı sadece gerekeni indirir/derler.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/three/') || id.includes('@types/three')) return 'three';
            if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase';
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) return 'charts';
            if (id.includes('/motion/') || id.includes('/framer-motion/') || id.includes('/motion-dom/')) return 'motion';
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});