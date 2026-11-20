export type TeacherVoiceId = 'kadin' | 'erkek';
export type SpeechKind = 'hece' | 'kelime' | 'cumle' | 'harf';
export type SpeechLang = 'tr' | 'en';

export interface SpeakOptions {
  rate?: number;
  kind?: SpeechKind;
  lang?: SpeechLang;
  voice?: TeacherVoiceId;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface RepeatSpeakOptions extends SpeakOptions {
  times?: number;
  pauseMs?: number;
  shouldContinue?: () => boolean;
}

const VOICE_STORAGE_KEY = 'turkish_tts_teacher_voice_v1';
const CLIENT_BLOB_CACHE_LIMIT = 320;
const FETCH_TIMEOUT_MS = 6500;
// Tiny valid silent WAV (44 bytes + 2 bytes of silence) to unlock HTMLAudioElement inside user clicks
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let activeTeacherVoice: TeacherVoiceId = readInitialVoice();
const voiceListeners = new Set<(voice: TeacherVoiceId) => void>();

let sharedAudioEl: HTMLAudioElement | null = null;
let audioUnlocked = false;
let pinnedUtterance: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimer: number | null = null;
let repeatPauseTimer: number | null = null;
let speechSessionId = 0;

// Browser-side Blob URL cache so repeated words/syllables play in 0ms
const blobUrlCache = new Map<string, string>();
const inFlightFetches = new Map<string, Promise<string | null>>();

// Optional static manifest for Option 2 custom teacher MP3 recordings (works even on static hosting)
let customManifest: Record<string, string> | null = null;
let customManifestPromise: Promise<Record<string, string>> | null = null;

// Track if /api/tts is unavailable (e.g. static hosting without Node backend)
let serverTtsFailures = 0;
let serverTtsCooldownUntil = 0;

let cachedVoices: SpeechSynthesisVoice[] = [];

function readInitialVoice(): TeacherVoiceId {
  if (typeof window === 'undefined') return 'kadin';
  try {
    const saved = window.localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved === 'erkek' || saved === 'kadin') return saved;
  } catch {
    // ignore storage restrictions
  }
  return 'kadin';
}

export function getTeacherVoice(): TeacherVoiceId {
  return activeTeacherVoice;
}

export function setTeacherVoice(voice: TeacherVoiceId): void {
  if (activeTeacherVoice === voice) return;
  activeTeacherVoice = voice;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOICE_STORAGE_KEY, voice);
    }
  } catch {
    // ignore storage errors
  }
  voiceListeners.forEach((listener) => {
    try {
      listener(voice);
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeTeacherVoice(listener: (voice: TeacherVoiceId) => void): () => void {
  voiceListeners.add(listener);
  return () => {
    voiceListeners.delete(listener);
  };
}

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudioEl) {
    sharedAudioEl = new Audio();
    sharedAudioEl.preload = 'auto';
  }
  return sharedAudioEl;
}

/**
 * Kullanıcı tıklaması içinde çağrıldığında tarayıcının otomatik oynatma (autoplay) kilidini açar;
 * böylece asenkron gelen doğal ses klipleri hiçbir tarayıcıda sessiz kalmaz.
 */
export function unlockAudioPlayback(): void {
  if (typeof window === 'undefined' || audioUnlocked) return;
  try {
    const audio = getSharedAudio();
    if (!audio.src) {
      audio.src = SILENT_WAV_DATA_URI;
      audio.volume = 0.01;
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          audioUnlocked = true;
          if (audio.src === SILENT_WAV_DATA_URI) {
            audio.pause();
          }
          audio.volume = 1.0;
        }).catch(() => {
          audio.volume = 1.0;
        });
      }
    } else {
      audioUnlocked = true;
    }
  } catch {
    // ignore
  }
}

function ensureVoicesLoaded(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  ensureVoicesLoaded();
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      ensureVoicesLoaded();
    });
  } catch {
    // ignore
  }
}

function toSafeSlug(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.!?,;:'"()[\]{}]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9çğıöşü_-]/g, '')
    .slice(0, 64);
}

function loadCustomManifest(): Promise<Record<string, string>> {
  if (customManifest) return Promise.resolve(customManifest);
  if (customManifestPromise) return customManifestPromise;
  if (typeof window === 'undefined') {
    customManifest = {};
    return Promise.resolve(customManifest);
  }
  customManifestPromise = fetch('/sesler/manifest.json', { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : {}))
    .then((data: unknown) => {
      customManifest = data && typeof data === 'object' ? (data as Record<string, string>) : {};
      return customManifest;
    })
    .catch(() => {
      customManifest = {};
      return customManifest;
    });
  return customManifestPromise;
}

if (typeof window !== 'undefined') {
  void loadCustomManifest();
}

function normalizeForTts(raw: string, lang: SpeechLang): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (lang === 'tr' && trimmed.length === 1) {
    return trimmed.toLocaleLowerCase('tr-TR');
  }
  return trimmed;
}

function inferKind(text: string, explicit?: SpeechKind): SpeechKind {
  if (explicit) return explicit;
  if (text.length === 1) return 'harf';
  if (text.includes(' ') || /[.!?]/.test(text)) return 'cumle';
  if (text.length <= 3) return 'hece';
  return 'kelime';
}

function setBlobCache(key: string, objectUrl: string) {
  if (blobUrlCache.size >= CLIENT_BLOB_CACHE_LIMIT) {
    const oldestKey = blobUrlCache.keys().next().value;
    if (oldestKey) {
      const oldUrl = blobUrlCache.get(oldestKey);
      if (oldUrl) {
        try {
          URL.revokeObjectURL(oldUrl);
        } catch {
          // ignore
        }
      }
      blobUrlCache.delete(oldestKey);
    }
  }
  blobUrlCache.set(key, objectUrl);
}

function pickBestBrowserVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  const voices = ensureVoicesLoaded();
  if (voices.length === 0) return null;
  if (lang === 'en') {
    const enVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('en'));
    return enVoices.find((v) => v.localService) || enVoices[0] || null;
  }
  const trVoices = voices.filter((v) => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    return (
      l.startsWith('tr') ||
      l.includes('_tr') ||
      n.includes('turk') ||
      n.includes('türk') ||
      n.includes('yelda') ||
      n.includes('emel')
    );
  });
  if (trVoices.length === 0) return null;
  return trVoices.find((v) => v.localService) || trVoices[0];
}

function speakWithBrowserFallback(
  text: string,
  lang: SpeechLang,
  rate: number,
  sessionId: number,
  onStart?: () => void,
  onEnd?: () => void
): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    const synth = window.speechSynthesis;
    try {
      synth.resume();
    } catch {
      // ignore
    }

    const startUtterance = () => {
      if (sessionId !== speechSessionId) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
      utterance.rate = Math.min(1.2, Math.max(0.75, rate));
      utterance.pitch = activeTeacherVoice === 'erkek' ? 0.92 : 1.04;
      utterance.volume = 1.0;

      const bestVoice = pickBestBrowserVoice(lang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        if (pinnedUtterance === utterance) pinnedUtterance = null;
        if (sessionId === speechSessionId) onEnd?.();
      };

      utterance.onstart = () => {
        if (sessionId === speechSessionId) onStart?.();
      };
      utterance.onend = done;
      utterance.onerror = done;

      pinnedUtterance = utterance;
      synth.speak(utterance);
    };

    if (synth.speaking || synth.pending) {
      synth.cancel();
      pendingSpeakTimer = window.setTimeout(() => {
        pendingSpeakTimer = null;
        startUtterance();
      }, 60);
    } else {
      startUtterance();
    }
  } catch {
    onEnd?.();
  }
}

/**
 * Aynı kelime/hece için eşzamanlı istekleri tek bir sunucu çağrısında birleştirir
 * ve sonucu tarayıcı Blob önbelleğine yazar (iptal edilse bile önbellek dolar).
 */
async function ensureAudioBlobUrl(
  text: string,
  lang: SpeechLang,
  voice: TeacherVoiceId,
  kind: SpeechKind
): Promise<string | null> {
  const cacheKey = `${lang}|${voice}|${kind}|${text}`;
  const cached = blobUrlCache.get(cacheKey);
  if (cached) return cached;

  // Check Option 2 static custom recording manifest first (works offline / static hosting)
  const manifest = customManifest || (await loadCustomManifest());
  const slug = toSafeSlug(text);
  const manifestKey = `${lang}/${slug}`;
  const customUrl = manifest[manifestKey] || (lang === 'tr' ? manifest[slug] : undefined);
  if (customUrl) {
    return customUrl;
  }

  // Respect short cooldown if backend /api/tts is completely unavailable
  if (Date.now() < serverTtsCooldownUntil) {
    return null;
  }

  const existing = inFlightFetches.get(cacheKey);
  if (existing) {
    return existing;
  }

  const reqPromise = (async (): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const params = new URLSearchParams({
        q: text,
        lang,
        voice,
        kind,
      });
      const res = await fetch(`/api/tts?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'audio/wav, audio/mpeg, audio/*' },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 503) {
          serverTtsFailures += 1;
          if (serverTtsFailures >= 3) {
            serverTtsCooldownUntil = Date.now() + 15_000;
          }
        }
        return null;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('audio')) {
        serverTtsFailures += 1;
        if (serverTtsFailures >= 3) {
          serverTtsCooldownUntil = Date.now() + 15_000;
        }
        return null;
      }

      const blob = await res.blob();
      if (blob.size < 100) return null;

      serverTtsFailures = 0;
      serverTtsCooldownUntil = 0;

      const objectUrl = URL.createObjectURL(blob);
      setBlobCache(cacheKey, objectUrl);
      return objectUrl;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();

  inFlightFetches.set(cacheKey, reqPromise);
  reqPromise.finally(() => {
    inFlightFetches.delete(cacheKey);
  });

  return reqPromise;
}

function playAudioUrlOnce(
  url: string,
  rate: number,
  sessionId: number,
  onStart?: () => void
): Promise<'ended' | 'aborted' | 'error'> {
  return new Promise((resolve) => {
    if (sessionId !== speechSessionId) {
      resolve('aborted');
      return;
    }
    try {
      const audio = getSharedAudio();
      let settled = false;

      const finish = (status: 'ended' | 'aborted' | 'error') => {
        if (settled) return;
        settled = true;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        resolve(status);
      };

      audio.onplaying = () => {
        audioUnlocked = true;
        if (sessionId === speechSessionId) {
          onStart?.();
        }
      };
      audio.onended = () => {
        finish(sessionId === speechSessionId ? 'ended' : 'aborted');
      };
      audio.onerror = () => {
        finish(sessionId === speechSessionId ? 'error' : 'aborted');
      };

      audio.pause();
      audio.src = url;
      try {
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      const playbackRate = Math.min(1.16, Math.max(0.86, rate >= 0.82 && rate <= 1.02 ? 1.0 : rate));
      audio.playbackRate = playbackRate;
      audio.volume = 1.0;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err: any) => {
          if (sessionId !== speechSessionId) {
            finish('aborted');
            return;
          }
          // Autoplay engellendiyse browser speech fallback denenebilir
          if (err && err.name === 'NotAllowedError') {
            finish('error');
            return;
          }
          finish('error');
        });
      }
    } catch {
      resolve('error');
    }
  });
}

export function stopSpeaking(): void {
  speechSessionId += 1;
  try {
    if (pendingSpeakTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(pendingSpeakTimer);
      pendingSpeakTimer = null;
    }
    if (repeatPauseTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(repeatPauseTimer);
      repeatPauseTimer = null;
    }
    if (sharedAudioEl) {
      sharedAudioEl.onplaying = null;
      sharedAudioEl.onended = null;
      sharedAudioEl.onerror = null;
      sharedAudioEl.pause();
      try {
        sharedAudioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
    pinnedUtterance = null;
  } catch {
    // ignore
  }
}

/**
 * Doğal Türkçe öğretmen seslendirmesi (tek seferlik):
 * 1. Özel öğretmen MP3 ses paketi (/public/sesler/tr/) varsa anında çalar.
 * 2. Sunucu doğal Türkçe öğretmen sesi (/api/tts - önbellekli) ile çalar.
 * 3. Çevrimdışı / statik barındırmada tarayıcı ses yedeğine düşer.
 */
export function speakTurkish(text: string, rateOrOptions?: number | SpeakOptions): void {
  const opts: SpeakOptions =
    typeof rateOrOptions === 'number' ? { rate: rateOrOptions } : rateOrOptions || {};
  const lang: SpeechLang = opts.lang || 'tr';
  const normalized = normalizeForTts(text, lang);
  if (!normalized || typeof window === 'undefined') return;

  const rate = opts.rate ?? 0.94;
  const voice = opts.voice || activeTeacherVoice;
  const kind = inferKind(normalized, opts.kind);

  stopSpeaking();
  const sessionId = speechSessionId;

  const playUrlOrFallback = async (audioUrl: string | null) => {
    if (sessionId !== speechSessionId) return;
    if (audioUrl) {
      const result = await playAudioUrlOnce(audioUrl, rate, sessionId, opts.onStart);
      if (sessionId !== speechSessionId) return;
      if (result === 'ended') {
        opts.onEnd?.();
        return;
      }
      if (result === 'aborted') return;
    }
    if (sessionId === speechSessionId) {
      speakWithBrowserFallback(normalized, lang, rate, sessionId, opts.onStart, opts.onEnd);
    }
  };

  const cacheKey = `${lang}|${voice}|${kind}|${normalized}`;
  const instantUrl = blobUrlCache.get(cacheKey);
  if (instantUrl) {
    void playUrlOrFallback(instantUrl);
    return;
  }

  void ensureAudioBlobUrl(normalized, lang, voice, kind).then((audioUrl) => {
    void playUrlOrFallback(audioUrl);
  });
}

/**
 * Araba yarışı gibi oyunlar için KESİNTİSİZ aralıklı tekrar seslendirme:
 * - Ses dosyasını yalnızca 1 KEZ getirir (tekrarlar birbirini iptal etmez!).
 * - Her tekrar bir önceki okuma bittikten sonra temiz bir duraklama (pauseMs) ile başlar.
 */
export function speakTurkishRepeated(text: string, options: RepeatSpeakOptions = {}): void {
  const lang: SpeechLang = options.lang || 'tr';
  const normalized = normalizeForTts(text, lang);
  if (!normalized || typeof window === 'undefined') return;

  const times = Math.max(1, Math.min(4, options.times ?? 2));
  const pauseMs = options.pauseMs ?? 550;
  const rate = options.rate ?? 0.9;
  const voice = options.voice || activeTeacherVoice;
  const kind = inferKind(normalized, options.kind);

  stopSpeaking();
  const sessionId = speechSessionId;

  const waitPause = (ms: number) =>
    new Promise<boolean>((resolve) => {
      if (sessionId !== speechSessionId) {
        resolve(false);
        return;
      }
      repeatPauseTimer = window.setTimeout(() => {
        repeatPauseTimer = null;
        resolve(sessionId === speechSessionId);
      }, ms);
    });

  const runSequence = async () => {
    const audioUrl = await ensureAudioBlobUrl(normalized, lang, voice, kind);
    if (sessionId !== speechSessionId) return;
    if (options.shouldContinue && !options.shouldContinue()) return;

    let notifiedStart = false;
    const handleStart = () => {
      if (!notifiedStart) {
        notifiedStart = true;
        options.onStart?.();
      }
    };

    if (audioUrl) {
      for (let i = 0; i < times; i++) {
        if (sessionId !== speechSessionId) return;
        if (options.shouldContinue && !options.shouldContinue()) return;

        const status = await playAudioUrlOnce(audioUrl, rate, sessionId, handleStart);
        if (sessionId !== speechSessionId) return;

        if (status === 'error') {
          // Tarayıcı oynatma hatasında tek seferlik browser speech yedeği
          speakWithBrowserFallback(normalized, lang, rate, sessionId, handleStart, options.onEnd);
          return;
        }
        if (status === 'aborted') return;

        if (i < times - 1) {
          const ok = await waitPause(pauseMs);
          if (!ok) return;
        }
      }
      if (sessionId === speechSessionId) {
        options.onEnd?.();
      }
    } else {
      // Sunucu sesi alınamadıysa tarayıcı yedeğiyle aralıklı oku
      for (let i = 0; i < times; i++) {
        if (sessionId !== speechSessionId) return;
        if (options.shouldContinue && !options.shouldContinue()) return;
        await new Promise<void>((resolve) => {
          speakWithBrowserFallback(normalized, lang, rate, sessionId, handleStart, resolve);
        });
        if (sessionId !== speechSessionId) return;
        if (i < times - 1) {
          const ok = await waitPause(pauseMs);
          if (!ok) return;
        }
      }
      if (sessionId === speechSessionId) {
        options.onEnd?.();
      }
    }
  };

  void runSequence();
}

/**
 * İngilizce etkinlikler (ör. School Life) için doğal İngilizce öğretmen seslendirmesi.
 */
export function speakEnglish(text: string, options?: Omit<SpeakOptions, 'lang'>): void {
  speakTurkish(text, { ...options, lang: 'en', kind: options?.kind || 'kelime' });
}

/**
 * Yaklaşan sorulardaki hece/kelimeleri arka planda önbelleğe alır (0ms anlık oynatma için).
 */
export function prefetchTurkishItems(
  items: Array<{ text: string; kind?: SpeechKind }>,
  lang: SpeechLang = 'tr'
): void {
  if (typeof window === 'undefined' || items.length === 0) return;
  const voice = activeTeacherVoice;

  const deduped: Array<{ text: string; kind: SpeechKind }> = [];
  const seen = new Set<string>();

  for (const raw of items) {
    const normalized = normalizeForTts(raw.text, lang);
    if (!normalized) continue;
    const itemKind = inferKind(normalized, raw.kind);
    const cacheKey = `${lang}|${voice}|${itemKind}|${normalized}`;
    if (seen.has(cacheKey) || blobUrlCache.has(cacheKey)) continue;
    seen.add(cacheKey);
    deduped.push({ text: normalized, kind: itemKind });
    if (deduped.length >= 12) break;
  }

  if (deduped.length === 0) return;

  let cursor = 0;
  const concurrency = 3;

  const worker = async () => {
    while (cursor < deduped.length) {
      const idx = cursor++;
      const item = deduped[idx];
      await ensureAudioBlobUrl(item.text, lang, voice, item.kind);
    }
  };

  for (let i = 0; i < Math.min(concurrency, deduped.length); i++) {
    void worker();
  }
}

export function prefetchTurkishBatch(
  texts: string[],
  kind?: SpeechKind,
  lang: SpeechLang = 'tr'
): void {
  prefetchTurkishItems(
    texts.map((text) => ({ text, kind })),
    lang
  );
}
