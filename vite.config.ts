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

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), webpFallbackPlugin(), videoUploadPlugin()],
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
