import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

type VoicePersona = 'kadin' | 'erkek';
type SpeechLang = 'tr' | 'en';
type SpeechKind = 'hece' | 'kelime' | 'cumle' | 'harf';

const EDGE_VOICE_MAP: Record<SpeechLang, Record<VoicePersona, string>> = {
  tr: {
    kadin: 'tr-TR-EmelNeural',
    erkek: 'tr-TR-AhmetNeural',
  },
  en: {
    kadin: 'en-US-JennyNeural',
    erkek: 'en-US-GuyNeural',
  },
};

const CACHE_DIR = path.join(__dirname, '.tts-cache');
const CUSTOM_AUDIO_ROOT = path.join(__dirname, 'public', 'sesler');
const MEMORY_CACHE_LIMIT = 800;
const memoryCache = new Map<string, { buffer: Buffer; mimeType: string }>();
const inFlightMap = new Map<string, Promise<{ buffer: Buffer; mimeType: string }>>();

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // ignore cache dir creation errors
  }
}

function toSafeAudioSlug(text: string): string {
  const lower = text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.!?,;:'"()[\]{}]/g, '')
    .replace(/\s+/g, '_');
  // Strict allowlist: Turkish + ASCII letters, digits, underscore, hyphen (prevents path traversal)
  return lower.replace(/[^a-z0-9çğıöşü_-]/g, '').slice(0, 64);
}

function findCustomLocalAudio(
  lang: SpeechLang,
  voice: VoicePersona,
  text: string
): { buffer: Buffer; mimeType: string } | null {
  const slug = toSafeAudioSlug(text);
  if (!slug) return null;

  // Priority: 1) Teacher custom override in public/sesler/{lang}/{slug}.mp3
  //           2) Voice-specific static pack in public/sesler/{lang}/{voice}/{slug}.mp3
  const searchDirs = [
    path.join(CUSTOM_AUDIO_ROOT, lang),
    path.join(CUSTOM_AUDIO_ROOT, lang, voice),
  ];

  const candidates: Array<{ ext: string; mime: string }> = [
    { ext: '.mp3', mime: 'audio/mpeg' },
    { ext: '.wav', mime: 'audio/wav' },
    { ext: '.ogg', mime: 'audio/ogg' },
  ];

  for (const dir of searchDirs) {
    const resolvedDir = path.resolve(dir);
    for (const { ext, mime } of candidates) {
      const filePath = path.join(dir, `${slug}${ext}`);
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(resolvedDir + path.sep)) continue;
      try {
        if (fs.existsSync(resolved)) {
          const buf = fs.readFileSync(resolved);
          if (buf.length > 100) {
            return { buffer: buf, mimeType: mime };
          }
        }
      } catch {
        // ignore read errors
      }
    }
  }
  return null;
}

function inferSpeechKind(text: string, rawKind: string | null): SpeechKind {
  if (rawKind === 'hece' || rawKind === 'kelime' || rawKind === 'cumle' || rawKind === 'harf') {
    return rawKind;
  }
  const trimmed = text.trim();
  if (trimmed.length === 1) return 'harf';
  if (trimmed.includes(' ') || /[.!?]/.test(trimmed)) return 'cumle';
  if (trimmed.length <= 3) return 'hece';
  return 'kelime';
}

function setMemoryCache(key: string, value: { buffer: Buffer; mimeType: string }) {
  if (memoryCache.size >= MEMORY_CACHE_LIMIT) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, value);
}

function isSingleSyllableTurkish(word: string): boolean {
  if (word.includes(' ')) return false;
  const vowels = word.toLocaleLowerCase('tr-TR').match(/[aeıioöuü]/g);
  return (vowels ? vowels.length : 0) <= 1;
}

function pickNeuralProsody(
  text: string,
  lang: SpeechLang,
  kind: SpeechKind,
  voice: VoicePersona
): { rate: string; pitch: string } {
  const clean = text.trim();
  const isShortSingle = lang === 'tr' && !clean.includes(' ') && (clean.length <= 4 || isSingleSyllableTurkish(clean));

  if (voice === 'erkek') {
    if (isShortSingle || kind === 'hece' || kind === 'harf') {
      return { rate: '-6%', pitch: '+0Hz' };
    }
    return { rate: '-5%', pitch: '+0Hz' };
  }

  // Kadın öğretmen (EmelNeural): kısa tek heceli kelimeleri robotik kesmeden sıcak ve hafif vurgulu oku
  if (isShortSingle || kind === 'hece' || kind === 'harf') {
    return { rate: '-12%', pitch: '+2Hz' };
  }
  if (kind === 'kelime') {
    return { rate: '-8%', pitch: '+1Hz' };
  }
  return { rate: '-5%', pitch: '+1Hz' };
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function prepareTtsInput(
  text: string,
  lang: SpeechLang,
  voice: VoicePersona,
  kind: SpeechKind
): string {
  let clean = text.trim();
  if (lang === 'tr') {
    if (!clean.includes(' ') && clean.length <= 3) {
      // Prevent uppercase 1-3 letter Turkish syllables (e.g. "AL", "EL", "İK") from being spelled out as acronyms ("a-le", "i-ke")
      clean = clean.toLocaleLowerCase('tr-TR');
    }
    // Prevent Edge Neural Turkish abbreviation expander from misreading word-ending periods
    // (e.g. "al." -> "a-le-ve", "bak." -> "bakınız") while keeping natural sentence pause & intonation
    clean = clean.replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\.(?=\s|$)/g, '$1 .');

    // Soft trailing comma on standalone 1-syllable Turkish words/syllables ("can", "çay", "iç", "al")
    // gives warm slightly elongated teacher intonation and prevents clipped endings or extra vowels ("cana", "a-a")
    const isShortSingle = !clean.includes(' ') && (clean.length <= 4 || isSingleSyllableTurkish(clean));
    if ((kind === 'hece' || isShortSingle) && !/[.,!?]$/.test(clean)) {
      clean = `${clean},`;
    }
  }
  return clean;
}

// Persistent pooled Edge Neural clients per voice to avoid per-request cold WebSocket handshakes
const edgeClientPool = new Map<string, Promise<MsEdgeTTS>>();

function evictEdgeClient(edgeVoice: string) {
  const existing = edgeClientPool.get(edgeVoice);
  edgeClientPool.delete(edgeVoice);
  if (existing) {
    existing
      .then((client) => {
        try {
          client.close();
        } catch {
          // ignore close errors
        }
      })
      .catch(() => {
        // ignore
      });
  }
}

function getPooledEdgeClient(edgeVoice: string): Promise<MsEdgeTTS> {
  const existing = edgeClientPool.get(edgeVoice);
  if (existing) return existing;

  const initPromise = (async () => {
    const tts = new MsEdgeTTS({ connectionTimeoutMs: 7000, synthesisTimeoutMs: 9000 });
    await Promise.race([
      tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Edge TTS metadata timeout')), 7500)
      ),
    ]);
    return tts;
  })();

  edgeClientPool.set(edgeVoice, initPromise);
  initPromise.catch(() => {
    if (edgeClientPool.get(edgeVoice) === initPromise) {
      edgeClientPool.delete(edgeVoice);
    }
  });
  return initPromise;
}

async function synthesizeWithEdgeNeural(
  text: string,
  lang: SpeechLang,
  voice: VoicePersona,
  kind: SpeechKind
): Promise<{ buffer: Buffer; mimeType: string }> {
  const edgeVoice = EDGE_VOICE_MAP[lang]?.[voice] || EDGE_VOICE_MAP.tr.kadin;
  const prosody = pickNeuralProsody(text, lang, kind, voice);
  const prepared = escapeXml(prepareTtsInput(text, lang, voice, kind));

  const runOnce = async (): Promise<Buffer> => {
    const tts = await getPooledEdgeClient(edgeVoice);
    const { audioStream } = tts.toStream(prepared, prosody);
    const chunks: Buffer[] = [];
    const streamPromise = (async () => {
      for await (const chunk of audioStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    })();

    const buf = (await Promise.race([
      streamPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Edge TTS stream timeout')), 8500)
      ),
    ])) as Buffer;

    if (buf.length < 200) {
      throw new Error('Edge TTS returned empty audio');
    }
    return buf;
  };

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const buffer = await runOnce();
      return { buffer, mimeType: 'audio/mpeg' };
    } catch (err) {
      lastErr = err;
      evictEdgeClient(edgeVoice);
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }
  }
  throw lastErr || new Error('Edge Neural TTS failed');
}

async function synthesizeWithTranslateFallback(
  text: string,
  lang: SpeechLang
): Promise<{ buffer: Buffer; mimeType: string }> {
  const tl = lang === 'en' ? 'en' : 'tr';
  const clean =
    lang === 'tr' && !text.trim().includes(' ') && text.trim().length <= 3
      ? text.trim().toLocaleLowerCase('tr-TR')
      : text.trim();
  const encoded = encodeURIComponent(clean);
  const endpoints = [
    `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${tl}&q=${encoded}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encoded}`,
  ];
  for (const url of endpoints) {
    try {
      const upstream = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });
      if (upstream.ok) {
        const ab = await upstream.arrayBuffer();
        if (ab.byteLength > 200) {
          return { buffer: Buffer.from(ab), mimeType: 'audio/mpeg' };
        }
      }
    } catch {
      // try next endpoint
    }
  }
  throw new Error('Fallback TTS unavailable');
}

const ISOLATED_J_SYLLABLE_RE = /^j[aeıioöuü]$/i;

async function generateNaturalSpeech(
  text: string,
  lang: SpeechLang,
  voice: VoicePersona,
  kind: SpeechKind
): Promise<{ buffer: Buffer; mimeType: string; source: 'edge-neural' | 'fallback-tts' }> {
  // Edge Neural's Turkish acoustic model misreads bare j-onset syllables ("je"->"de", "ja"->"va", "ji"->"gi")
  if (lang === 'tr' && ISOLATED_J_SYLLABLE_RE.test(text.trim().toLocaleLowerCase('tr-TR'))) {
    try {
      const accurate = await synthesizeWithTranslateFallback(text.trim().toLocaleLowerCase('tr-TR'), 'tr');
      return { ...accurate, source: 'edge-neural' };
    } catch {
      // fall through to Edge Neural
    }
  }
  try {
    const res = await synthesizeWithEdgeNeural(text, lang, voice, kind);
    return { ...res, source: 'edge-neural' };
  } catch (err) {
    console.warn('[TTS] Edge Neural temporarily failed, using emergency fallback:', (err as Error)?.message);
    const fallback = await synthesizeWithTranslateFallback(text, lang);
    return { ...fallback, source: 'fallback-tts' };
  }
}

async function createServer() {
  ensureCacheDir();
  const app = express();

  // WebP fallback for missing PNG/JPG assets in public/
  app.use((req, _res, next) => {
    const cleanUrl = (req.url || '').split('?')[0];
    if (/\.(png|jpe?g)$/i.test(cleanUrl)) {
      const localPath = path.join(__dirname, 'public', cleanUrl);
      if (!fs.existsSync(localPath)) {
        const webpUrl = cleanUrl.replace(/\.(png|jpe?g)$/i, '.webp');
        const localWebp = path.join(__dirname, 'public', webpUrl);
        if (fs.existsSync(localWebp)) {
          req.url = webpUrl;
        }
      }
    }
    next();
  });

  // Preserve existing video upload endpoint
  app.post('/api/upload-sivi-video', (req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const targetDir = path.join(__dirname, 'public', 'sivi_oyunu');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const targetPath = path.join(targetDir, 'standart_olmayan_sivi_olcme.mp4');
        fs.writeFileSync(targetPath, buffer);
        res.status(200).json({ success: true, path: '/sivi_oyunu/standart_olmayan_sivi_olcme.mp4' });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Upload failed' });
      }
    });
  });

  // Lightweight TTS readiness endpoint
  app.get('/api/tts/status', (_req, res) => {
    res.json({
      naturalVoiceAvailable: true,
      engine: 'neural-free',
      voices: [
        { id: 'kadin', label: 'Kadın Öğretmen (Emel)' },
        { id: 'erkek', label: 'Erkek Öğretmen (Ahmet)' },
      ],
    });
  });

  // Free Unlimited Natural Turkish & English TTS endpoint:
  // 1) Custom MP3/WAV Pack -> 2) RAM/Disk Cache -> 3) Edge Neural (Emel/Ahmet) -> 4) Emergency Translate MP3 Safety Net (never persisted)
  app.get('/api/tts', async (req, res) => {
    try {
      const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
      const text = rawQuery.trim().slice(0, 300);
      if (!text) {
        res.status(400).json({ error: 'Missing q parameter' });
        return;
      }

      const lang: SpeechLang = req.query.lang === 'en' ? 'en' : 'tr';
      const voice: VoicePersona = req.query.voice === 'erkek' ? 'erkek' : 'kadin';
      const kind = inferSpeechKind(text, typeof req.query.kind === 'string' ? req.query.kind : null);

      // 1) Option 2: Check custom/static MP3/WAV pack in public/sesler/{lang}/
      const customAudio = findCustomLocalAudio(lang, voice, text);
      if (customAudio) {
        res.setHeader('Content-Type', customAudio.mimeType);
        res.setHeader('Content-Length', String(customAudio.buffer.length));
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-TTS-Source', 'custom-pack');
        res.status(200).end(customAudio.buffer);
        return;
      }

      const normalizedKeyText =
        lang === 'tr' && !text.includes(' ') && text.length <= 3
          ? text.toLocaleLowerCase('tr-TR')
          : text;

      // 2) Deterministic cache key (RAM -> Disk) — v5 adds warm short-word prosody + Turkish abbreviation fix
      const cacheKey = crypto
        .createHash('sha256')
        .update(`v5-edge|${lang}|${voice}|${kind}|${normalizedKeyText}`)
        .digest('hex');

      const memHit = memoryCache.get(cacheKey);
      if (memHit) {
        res.setHeader('Content-Type', memHit.mimeType);
        res.setHeader('Content-Length', String(memHit.buffer.length));
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-TTS-Source', 'memory-cache');
        res.status(200).end(memHit.buffer);
        return;
      }

      const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
      if (fs.existsSync(diskPath)) {
        try {
          const diskBuf = fs.readFileSync(diskPath);
          if (diskBuf.length > 100) {
            const entry = { buffer: diskBuf, mimeType: 'audio/mpeg' };
            setMemoryCache(cacheKey, entry);
            res.setHeader('Content-Type', entry.mimeType);
            res.setHeader('Content-Length', String(entry.buffer.length));
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('X-TTS-Source', 'disk-cache');
            res.status(200).end(entry.buffer);
            return;
          }
        } catch {
          // fall through to regenerate
        }
      }

      // 3) Deduplicate concurrent identical TTS requests
      let pending = inFlightMap.get(cacheKey);
      let resolvedSource: 'edge-neural' | 'fallback-tts' = 'edge-neural';
      if (!pending) {
        pending = generateNaturalSpeech(text, lang, voice, kind)
          .then((result) => {
            resolvedSource = result.source;
            if (result.source === 'edge-neural') {
              setMemoryCache(cacheKey, { buffer: result.buffer, mimeType: result.mimeType });
              fs.writeFile(diskPath, result.buffer, () => {});
            }
            return { buffer: result.buffer, mimeType: result.mimeType };
          })
          .finally(() => {
            inFlightMap.delete(cacheKey);
          });
        inFlightMap.set(cacheKey, pending);
      }

      const generated = await pending;

      res.setHeader('Content-Type', generated.mimeType);
      res.setHeader('Content-Length', String(generated.buffer.length));
      res.setHeader(
        'Cache-Control',
        resolvedSource === 'edge-neural' ? 'public, max-age=86400' : 'no-store'
      );
      res.setHeader('X-TTS-Source', resolvedSource);
      res.status(200).end(generated.buffer);
    } catch (err: any) {
      res.status(502).json({
        error: err?.message || 'Speech synthesis unavailable',
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
