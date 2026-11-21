export type TeacherVoiceId = 'kadin' | 'erkek';
export type SpeechKind = 'hece' | 'kelime' | 'cumle' | 'harf';
export type SpeechLang = 'tr' | 'en';

export type EdgeProsodyRate =
  | 'x-slow'
  | 'slow'
  | 'medium'
  | 'fast'
  | `${'+' | '-'}${number}%`;

export type EdgeProsodyPitch =
  | 'x-low'
  | 'low'
  | 'medium'
  | 'high'
  | 'x-high'
  | `${'+' | '-'}${number}Hz`;

export type SpeechProsodyPreset = 'vurgulu' | 'yavas_vurgulu' | 'normal';

export interface SpeechProsodyOptions {
  /** Hazır vurgu profili ('vurgulu' varsayılan olarak kısa kelimeleri sıcak ve vurgulu okur) */
  preset?: SpeechProsodyPreset;
  /** Edge TTS SSML hız değeri (örn. 'x-slow', 'slow', '-12%', '-4%') */
  edgeRate?: EdgeProsodyRate;
  /** Edge TTS SSML perde/ton değeri (örn. '+12Hz', '+14Hz', 'high') */
  edgePitch?: EdgeProsodyPitch;
  /** 'can', 'çay', 'iç' gibi kısa tek heceli kelimelerde ekstra vurgulu ('x-slow' / yüksek pitch) okuma */
  emphasizeShortWords?: boolean;
}

export interface ResolvedEdgeProsody {
  rate: EdgeProsodyRate;
  pitch: EdgeProsodyPitch;
  isCustom: boolean;
}

export interface SpeakOptions {
  rate?: number;
  kind?: SpeechKind;
  lang?: SpeechLang;
  voice?: TeacherVoiceId;
  prosody?: SpeechProsodyOptions;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface RepeatSpeakOptions extends SpeakOptions {
  times?: number;
  pauseMs?: number;
  shouldContinue?: () => boolean;
}

interface CachedAudioAsset {
  blobUrl: string;
  arrayBuffer?: ArrayBuffer;
  isStaticUrl?: boolean;
}

const VOICE_STORAGE_KEY = 'turkish_tts_teacher_voice_v1';
const PROSODY_STORAGE_KEY = 'turkish_tts_prosody_preset_v1';
const CLIENT_ASSET_CACHE_LIMIT = 320;
const FETCH_TIMEOUT_MS = 9500;
// Tiny valid silent WAV (44 bytes + 2 bytes of silence) to unlock HTMLAudioElement inside user clicks
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let activeTeacherVoice: TeacherVoiceId = readInitialVoice();
let activeProsodyPreset: SpeechProsodyPreset = readInitialProsodyPreset();
const voiceListeners = new Set<(voice: TeacherVoiceId) => void>();
const prosodyListeners = new Set<(preset: SpeechProsodyPreset) => void>();

let sharedAudioEl: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let htmlAudioUnlocked = false;
let isUnlockingHtmlAudio = false;
let pinnedUtterance: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimer: number | null = null;
let repeatPauseTimer: number | null = null;
let speechSessionId = 0;

// Browser-side cache (ArrayBuffer + Blob URL) so repeated words/syllables play in 0ms
const audioAssetCache = new Map<string, CachedAudioAsset>();
const inFlightFetches = new Map<string, Promise<CachedAudioAsset | null>>();

// Optional static manifest for Option 2 custom teacher MP3 recordings (works even on static hosting)
let customManifest: Record<string, string> | null = null;
let customManifestPromise: Promise<Record<string, string>> | null = null;

// Track if /api/tts is unavailable (e.g. static hosting without Node backend)
let serverTtsPermanentlyUnavailable = false;
let serverTtsFailures = 0;
let serverTtsCooldownUntil = 0;

let cachedVoices: SpeechSynthesisVoice[] = [];

function resolvePublicUrl(relPath: string): string {
  const cleanRel = relPath.replace(/^\/+/, '');
  const base =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.BASE_URL === 'string'
      ? import.meta.env.BASE_URL
      : '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${cleanRel}`;
}

function readInitialVoice(): TeacherVoiceId {
  return 'kadin';
}

export function getTeacherVoice(): TeacherVoiceId {
  return activeTeacherVoice;
}

export function setTeacherVoice(_voice: TeacherVoiceId): void {
  activeTeacherVoice = 'kadin';
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOICE_STORAGE_KEY, 'kadin');
    }
  } catch {
    // ignore storage errors
  }
  voiceListeners.forEach((listener) => {
    try {
      listener('kadin');
    } catch {
      // ignore listener errors
    }
  });
}

function readInitialProsodyPreset(): SpeechProsodyPreset {
  if (typeof window === 'undefined') return 'vurgulu';
  try {
    const saved = window.localStorage.getItem(PROSODY_STORAGE_KEY);
    if (saved === 'vurgulu' || saved === 'yavas_vurgulu' || saved === 'normal') return saved;
  } catch {
    // ignore storage restrictions
  }
  return 'vurgulu';
}

export function getSpeechProsodyPreset(): SpeechProsodyPreset {
  return activeProsodyPreset;
}

export function setSpeechProsodyPreset(preset: SpeechProsodyPreset): void {
  if (activeProsodyPreset === preset) return;
  activeProsodyPreset = preset;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROSODY_STORAGE_KEY, preset);
    }
  } catch {
    // ignore storage errors
  }
  prosodyListeners.forEach((listener) => {
    try {
      listener(preset);
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeSpeechProsodyPreset(
  listener: (preset: SpeechProsodyPreset) => void
): () => void {
  prosodyListeners.add(listener);
  return () => {
    prosodyListeners.delete(listener);
  };
}

function isSingleSyllableTurkishWord(word: string): boolean {
  if (!word || word.includes(' ')) return false;
  const vowels = word.toLocaleLowerCase('tr-TR').match(/[aeıioöuü]/g);
  return (vowels ? vowels.length : 0) === 1;
}

function isClosedSingleSyllableTurkish(word: string): boolean {
  if (!isSingleSyllableTurkishWord(word)) return false;
  const clean = word.trim().toLocaleLowerCase('tr-TR').replace(/[.,!?]+$/, '');
  if (clean.length < 2 || clean.length > 4) return false;
  // Ünsüzle biten tek heceli kelimeler ('can', 'çay', 'iç', 'al', 'el', 'bal', 'top', 'gül')
  return /[bcçdfgğhjklmnprsştvyz]$/.test(clean);
}

/**
 * Edge TTS için vurgu (prosody) parametrelerini hesaplar.
 * 'can', 'çay', 'iç' gibi kısa tek heceli Türkçe kelimelerde 'x-slow' hızı ve yüksek
 * perde (+12Hz / +14Hz) kullanarak robotik kesilmeyi önler, sıcak ve vurgulu öğretmen tonlaması verir.
 */
export function resolveEdgeProsody(
  text: string,
  lang: SpeechLang,
  kind: SpeechKind,
  voice: TeacherVoiceId,
  prosody?: SpeechProsodyOptions
): ResolvedEdgeProsody {
  const preset: SpeechProsodyPreset = prosody?.preset || activeProsodyPreset;
  const emphasizeShort = prosody?.emphasizeShortWords ?? preset !== 'normal';
  const clean = text.trim();
  const isClosedShort = lang === 'tr' && isClosedSingleSyllableTurkish(clean);
  const isShortSingle =
    lang === 'tr' && !clean.includes(' ') && (clean.length <= 4 || isSingleSyllableTurkishWord(clean));

  let defaultRate: EdgeProsodyRate;
  let defaultPitch: EdgeProsodyPitch;

  if (voice === 'erkek') {
    if (emphasizeShort && isClosedShort) {
      defaultRate = preset === 'yavas_vurgulu' ? 'x-slow' : 'slow';
      defaultPitch = preset === 'yavas_vurgulu' ? '+5Hz' : '+4Hz';
    } else if (isShortSingle || kind === 'hece' || kind === 'harf') {
      defaultRate = preset === 'yavas_vurgulu' ? 'slow' : '-4%';
      defaultPitch = '+2Hz';
    } else {
      defaultRate = preset === 'yavas_vurgulu' ? '-8%' : '-3%';
      defaultPitch = '+2Hz';
    }
  } else {
    // Kadın öğretmen (EmelNeural): sıcak, güleryüzlü ve kısa kelimelerde belirgin vurgulu tonlama
    if (emphasizeShort && isClosedShort) {
      defaultRate = 'x-slow';
      defaultPitch = preset === 'yavas_vurgulu' ? '+14Hz' : '+12Hz';
    } else if (isShortSingle || kind === 'hece' || kind === 'harf') {
      defaultRate = preset === 'yavas_vurgulu' ? 'x-slow' : '-6%';
      defaultPitch = preset === 'yavas_vurgulu' ? '+13Hz' : '+11Hz';
    } else if (kind === 'kelime') {
      defaultRate = preset === 'yavas_vurgulu' ? 'slow' : '-3%';
      defaultPitch = preset === 'yavas_vurgulu' ? '+12Hz' : '+10Hz';
    } else {
      defaultRate = preset === 'yavas_vurgulu' ? '-8%' : '-2%';
      defaultPitch = preset === 'yavas_vurgulu' ? '+11Hz' : '+9Hz';
    }
  }

  const rate: EdgeProsodyRate = prosody?.edgeRate || defaultRate;
  const pitch: EdgeProsodyPitch = prosody?.edgePitch || defaultPitch;
  const isCustom =
    Boolean(prosody?.edgeRate) ||
    Boolean(prosody?.edgePitch) ||
    preset !== 'vurgulu' ||
    prosody?.emphasizeShortWords === false;

  return { rate, pitch, isCustom };
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

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedAudioCtx) return sharedAudioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedAudioCtx = new Ctor();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Kullanıcı etkileşimi içinde hem Web Audio API (AudioContext) hem HTMLAudioElement
 * oynatma kilidini açar; böylece asenkron gelen doğal Türkçe MP3 sesleri Safari/macOS/iframe
 * içinde bile asla NotAllowedError alıp robotik tarayıcı sesine düşmez.
 */
export function unlockAudioPlayback(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  } catch {
    // ignore
  }

  if (htmlAudioUnlocked || isUnlockingHtmlAudio) return;
  try {
    const audio = getSharedAudio();
    // Only run silent WAV unlock if audio element isn't already actively playing real speech
    const isPlayingReal = !audio.paused && audio.src && audio.src !== SILENT_WAV_DATA_URI;
    if (isPlayingReal) {
      htmlAudioUnlocked = true;
      return;
    }

    isUnlockingHtmlAudio = true;
    audio.src = SILENT_WAV_DATA_URI;
    audio.volume = 0.01;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        htmlAudioUnlocked = true;
        isUnlockingHtmlAudio = false;
        if (audio.src === SILENT_WAV_DATA_URI) {
          audio.pause();
        }
        audio.volume = 1.0;
      }).catch(() => {
        isUnlockingHtmlAudio = false;
        audio.volume = 1.0;
      });
    } else {
      htmlAudioUnlocked = true;
      isUnlockingHtmlAudio = false;
      audio.volume = 1.0;
    }
  } catch {
    isUnlockingHtmlAudio = false;
  }
}

// Automatically unlock audio on the very first user gesture anywhere in the app
if (typeof window !== 'undefined') {
  const handleFirstGesture = () => {
    unlockAudioPlayback();
    if (htmlAudioUnlocked && sharedAudioCtx && sharedAudioCtx.state === 'running') {
      window.removeEventListener('pointerdown', handleFirstGesture, true);
      window.removeEventListener('touchstart', handleFirstGesture, true);
      window.removeEventListener('keydown', handleFirstGesture, true);
      window.removeEventListener('click', handleFirstGesture, true);
    }
  };
  window.addEventListener('pointerdown', handleFirstGesture, true);
  window.addEventListener('touchstart', handleFirstGesture, true);
  window.addEventListener('keydown', handleFirstGesture, true);
  window.addEventListener('click', handleFirstGesture, true);
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
  customManifestPromise = fetch(resolvePublicUrl('sesler/manifest.json'), { cache: 'default' })
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
  // Normalize 1-3 letter standalone Turkish syllables (e.g. "AL", "EL", "İK") to lowercase
  // so no TTS engine ever spells them out letter-by-letter ("a-le", "i-ke")
  if (lang === 'tr' && !trimmed.includes(' ') && trimmed.length <= 3) {
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

function setAssetCache(key: string, asset: CachedAudioAsset) {
  if (audioAssetCache.size >= CLIENT_ASSET_CACHE_LIMIT) {
    const oldestKey = audioAssetCache.keys().next().value;
    if (oldestKey) {
      const oldAsset = audioAssetCache.get(oldestKey);
      if (oldAsset && !oldAsset.isStaticUrl) {
        try {
          URL.revokeObjectURL(oldAsset.blobUrl);
        } catch {
          // ignore
        }
      }
      audioAssetCache.delete(oldestKey);
    }
  }
  audioAssetCache.set(key, asset);
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

function speakWithEmergencyBrowserFallback(
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
      let safeText =
        lang === 'tr' && !text.includes(' ') && text.length <= 3
          ? text.toLocaleLowerCase('tr-TR')
          : text;
      if (lang === 'tr') {
        safeText = safeText.replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\.(?=\s|$)/g, '$1');
      }
      const utterance = new SpeechSynthesisUtterance(safeText);
      utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
      utterance.rate = Math.min(1.15, Math.max(0.78, rate));
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

const STATIC_AUDIO_PACK_VERSION = 'v3-marin';

async function fetchStaticMp3Asset(url: string): Promise<CachedAudioAsset | null> {
  const baseResolved =
    url.startsWith('http://') || url.startsWith('https://') ? url : resolvePublicUrl(url);
  const sep = baseResolved.includes('?') ? '&' : '?';
  const resolved = `${baseResolved}${sep}av=${STATIC_AUDIO_PACK_VERSION}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(resolved, {
      signal: controller.signal,
      headers: { Accept: 'audio/mpeg, audio/wav, audio/*' },
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    // Static hosts return text/html (index.html) for missing files
    if (contentType.includes('text/html')) return null;

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 200) return null;

    const blob = new Blob([arrayBuffer], { type: contentType.includes('audio') ? contentType : 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, arrayBuffer, isStaticUrl: false };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchServerTtsOnce(
  text: string,
  lang: SpeechLang,
  voice: TeacherVoiceId,
  kind: SpeechKind,
  prosody: ResolvedEdgeProsody
): Promise<{ asset: CachedAudioAsset | null; staticHostMissingApi: boolean; hardUnavailable: boolean }> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      q: text,
      lang,
      voice,
      kind,
      prosodyRate: prosody.rate,
      prosodyPitch: prosody.pitch,
    });
    if (prosody.isCustom) {
      params.set('customProsody', '1');
    }
    const res = await fetch(`/api/tts?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'audio/mpeg, audio/wav, audio/*' },
    });

    if (!res.ok) {
      return {
        asset: null,
        staticHostMissingApi: res.status === 404,
        hardUnavailable: res.status === 404 || res.status === 503,
      };
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('audio')) {
      // Static hosting SPA fallback redirected /api/tts -> index.html
      return {
        asset: null,
        staticHostMissingApi: contentType.includes('text/html'),
        hardUnavailable: true,
      };
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 100) {
      return { asset: null, staticHostMissingApi: false, hardUnavailable: false };
    }

    const blob = new Blob([arrayBuffer], { type: contentType || 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(blob);
    return {
      asset: { blobUrl, arrayBuffer, isStaticUrl: false },
      staticHostMissingApi: false,
      hardUnavailable: false,
    };
  } catch {
    return { asset: null, staticHostMissingApi: false, hardUnavailable: false };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function lookupStaticManifestUrl(
  manifest: Record<string, string>,
  lang: SpeechLang,
  voice: TeacherVoiceId,
  slug: string
): string | null {
  if (!slug) return null;
  // Priority:
  // 1) Custom teacher override without voice subfolder (tr/{slug} or {slug})
  // 2) Voice-specific pre-generated static MP3 pack ({lang}/{voice}/{slug})
  // 3) Cross-voice fallback ({lang}/kadin/{slug})
  return (
    manifest[`${lang}/${slug}`] ||
    (lang === 'tr' ? manifest[slug] : undefined) ||
    manifest[`${lang}/${voice}/${slug}`] ||
    manifest[`${lang}/kadin/${slug}`] ||
    null
  );
}

/**
 * Aynı kelime/hece için önce statik doğal MP3 paketini (/public/sesler/) kontrol eder
 * (GitHub Pages / Netlify / Vercel gibi sunucusuz statik sitelerde bile %100 çalışır);
 * pakette yoksa sunucu /api/tts uç noktasını dener ve sonucu tarayıcı önbelleğine yazar.
 */
async function ensureAudioAsset(
  text: string,
  lang: SpeechLang,
  voice: TeacherVoiceId,
  kind: SpeechKind,
  prosody: ResolvedEdgeProsody
): Promise<CachedAudioAsset | null> {
  const cacheKey = `${lang}|${voice}|${kind}|${prosody.rate}|${prosody.pitch}|${text}`;
  const cached = audioAssetCache.get(cacheKey);
  if (cached) return cached;

  const existing = inFlightFetches.get(cacheKey);
  if (existing) {
    return existing;
  }

  const reqPromise = (async (): Promise<CachedAudioAsset | null> => {
    // 1) Varsayılan vurgu profilinde statik doğal MP3 paketini öncelikle kullan (statik barındırmada %100 çalışır)
    const manifest = customManifest || (await loadCustomManifest());
    const slug = toSafeSlug(text);
    const staticUrl = lookupStaticManifestUrl(manifest, lang, voice, slug);

    if (staticUrl && !prosody.isCustom) {
      const staticAsset = await fetchStaticMp3Asset(staticUrl);
      if (staticAsset) {
        setAssetCache(cacheKey, staticAsset);
        return staticAsset;
      }
    }

    // 2) Canlı /api/tts sunucusu (özel prosody veya pakette olmayan metinler için)
    if (!serverTtsPermanentlyUnavailable && Date.now() >= serverTtsCooldownUntil) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const { asset, staticHostMissingApi, hardUnavailable } = await fetchServerTtsOnce(
          text,
          lang,
          voice,
          kind,
          prosody
        );
        if (asset) {
          serverTtsFailures = 0;
          serverTtsCooldownUntil = 0;
          setAssetCache(cacheKey, asset);
          return asset;
        }
        if (staticHostMissingApi) {
          serverTtsPermanentlyUnavailable = true;
          break;
        }
        if (hardUnavailable) {
          serverTtsFailures += 1;
          if (serverTtsFailures >= 2) {
            serverTtsCooldownUntil = Date.now() + 20_000;
          }
          break;
        }
        if (attempt < 2) {
          await new Promise((r) => window.setTimeout(r, 200));
        }
      }
    }

    // 3) Statik sunucuda özel prosody istendiyse dahi statik MP3 yedeğini oynat (robotik sese düşme!)
    if (staticUrl) {
      const staticAsset = await fetchStaticMp3Asset(staticUrl);
      if (staticAsset) {
        setAssetCache(cacheKey, staticAsset);
        return staticAsset;
      }
    }

    return null;
  })();

  inFlightFetches.set(cacheKey, reqPromise);
  reqPromise.finally(() => {
    inFlightFetches.delete(cacheKey);
  });

  return reqPromise;
}

async function playWithWebAudio(
  arrayBuffer: ArrayBuffer,
  rate: number,
  sessionId: number,
  onStart?: () => void
): Promise<'ended' | 'aborted' | 'error'> {
  if (sessionId !== speechSessionId) return 'aborted';
  const ctx = getAudioContext();
  if (!ctx) return 'error';

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (sessionId !== speechSessionId) return 'aborted';
    if (ctx.state !== 'running') return 'error';

    // Slice buffer because decodeAudioData detaches the passed ArrayBuffer
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    if (sessionId !== speechSessionId) return 'aborted';

    return await new Promise<'ended' | 'aborted' | 'error'>((resolve) => {
      if (sessionId !== speechSessionId) {
        resolve('aborted');
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      const playbackRate = Math.min(1.14, Math.max(0.88, rate >= 0.82 && rate <= 1.02 ? 1.0 : rate));
      source.playbackRate.value = playbackRate;
      source.connect(ctx.destination);

      let settled = false;
      const finish = (status: 'ended' | 'aborted' | 'error') => {
        if (settled) return;
        settled = true;
        if (activeBufferSource === source) activeBufferSource = null;
        source.onended = null;
        resolve(status);
      };

      source.onended = () => {
        finish(sessionId === speechSessionId ? 'ended' : 'aborted');
      };

      activeBufferSource = source;
      try {
        onStart?.();
        source.start(0);
      } catch {
        finish('error');
      }
    });
  } catch {
    return 'error';
  }
}

function playWithHtmlAudio(
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
        htmlAudioUnlocked = true;
        isUnlockingHtmlAudio = false;
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

      isUnlockingHtmlAudio = false;
      audio.pause();
      audio.src = url;
      try {
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      const playbackRate = Math.min(1.14, Math.max(0.88, rate >= 0.82 && rate <= 1.02 ? 1.0 : rate));
      audio.playbackRate = playbackRate;
      audio.volume = 1.0;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (sessionId !== speechSessionId) {
            finish('aborted');
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

async function playNaturalAssetOnce(
  asset: CachedAudioAsset,
  rate: number,
  sessionId: number,
  onStart?: () => void
): Promise<'ended' | 'aborted' | 'error'> {
  if (sessionId !== speechSessionId) return 'aborted';

  // Primary: Web Audio API (immune to async HTMLAudioElement autoplay blocks inside iframes)
  if (asset.arrayBuffer) {
    const webAudioRes = await playWithWebAudio(asset.arrayBuffer, rate, sessionId, onStart);
    if (webAudioRes === 'ended' || webAudioRes === 'aborted') {
      return webAudioRes;
    }
  }

  if (sessionId !== speechSessionId) return 'aborted';

  // Secondary (same natural MP3): HTMLAudioElement
  return playWithHtmlAudio(asset.blobUrl, rate, sessionId, onStart);
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
    if (activeBufferSource) {
      const src = activeBufferSource;
      activeBufferSource = null;
      src.onended = null;
      try {
        src.stop();
      } catch {
        // ignore already-stopped errors
      }
      try {
        src.disconnect();
      } catch {
        // ignore
      }
    }
    if (sharedAudioEl && !isUnlockingHtmlAudio) {
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
 * 2. Sunucu doğal Türkçe öğretmen sesi (/api/tts - Edge Neural, önbellekli) ile Web Audio / Audio üzerinden çalar.
 * 3. Yalnızca sunucu tamamen erişilemezse (çevrimdışı / statik barındırma) tarayıcı ses yedeğine düşer.
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
  const resolvedProsody = resolveEdgeProsody(normalized, lang, kind, voice, opts.prosody);

  // Unlock audio synchronously while still inside any user click/tap handler
  unlockAudioPlayback();
  stopSpeaking();
  const sessionId = speechSessionId;

  const playAssetOrEmergencyFallback = async (asset: CachedAudioAsset | null) => {
    if (sessionId !== speechSessionId) return;
    if (asset) {
      const result = await playNaturalAssetOnce(asset, rate, sessionId, opts.onStart);
      if (sessionId !== speechSessionId) return;
      if (result === 'ended') {
        opts.onEnd?.();
        return;
      }
      if (result === 'aborted') return;
    }
    // Only reached if /api/tts is completely unavailable OR both Web Audio & HTMLAudio failed
    if (sessionId === speechSessionId) {
      speakWithEmergencyBrowserFallback(normalized, lang, rate, sessionId, opts.onStart, opts.onEnd);
    }
  };

  const cacheKey = `${lang}|${voice}|${kind}|${resolvedProsody.rate}|${resolvedProsody.pitch}|${normalized}`;
  const instantAsset = audioAssetCache.get(cacheKey);
  if (instantAsset) {
    void playAssetOrEmergencyFallback(instantAsset);
    return;
  }

  void ensureAudioAsset(normalized, lang, voice, kind, resolvedProsody).then((asset) => {
    void playAssetOrEmergencyFallback(asset);
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
  const resolvedProsody = resolveEdgeProsody(normalized, lang, kind, voice, options.prosody);

  unlockAudioPlayback();
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
    const asset = await ensureAudioAsset(normalized, lang, voice, kind, resolvedProsody);
    if (sessionId !== speechSessionId) return;
    if (options.shouldContinue && !options.shouldContinue()) return;

    let notifiedStart = false;
    const handleStart = () => {
      if (!notifiedStart) {
        notifiedStart = true;
        options.onStart?.();
      }
    };

    if (asset) {
      for (let i = 0; i < times; i++) {
        if (sessionId !== speechSessionId) return;
        if (options.shouldContinue && !options.shouldContinue()) return;

        const status = await playNaturalAssetOnce(asset, rate, sessionId, handleStart);
        if (sessionId !== speechSessionId) return;

        if (status === 'error') {
          speakWithEmergencyBrowserFallback(normalized, lang, rate, sessionId, handleStart, options.onEnd);
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
      // Yalnızca sunucu tamamen erişilemezse acil tarayıcı yedeği
      for (let i = 0; i < times; i++) {
        if (sessionId !== speechSessionId) return;
        if (options.shouldContinue && !options.shouldContinue()) return;
        await new Promise<void>((resolve) => {
          speakWithEmergencyBrowserFallback(normalized, lang, rate, sessionId, handleStart, resolve);
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

  const deduped: Array<{ text: string; kind: SpeechKind; prosody: ResolvedEdgeProsody }> = [];
  const seen = new Set<string>();

  for (const raw of items) {
    const normalized = normalizeForTts(raw.text, lang);
    if (!normalized) continue;
    const itemKind = inferKind(normalized, raw.kind);
    const prosody = resolveEdgeProsody(normalized, lang, itemKind, voice);
    const cacheKey = `${lang}|${voice}|${itemKind}|${prosody.rate}|${prosody.pitch}|${normalized}`;
    if (seen.has(cacheKey) || audioAssetCache.has(cacheKey)) continue;
    seen.add(cacheKey);
    deduped.push({ text: normalized, kind: itemKind, prosody });
    if (deduped.length >= 12) break;
  }

  if (deduped.length === 0) return;

  let cursor = 0;
  const concurrency = 2;

  const worker = async () => {
    while (cursor < deduped.length) {
      const idx = cursor++;
      const item = deduped[idx];
      await ensureAudioAsset(item.text, lang, voice, item.kind, item.prosody);
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
