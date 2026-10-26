/**
 * Makas Etkinliği için Makas Kesme Sesi Yöneticisi (/makas.mp3 & /makas.wav)
 * Öğrenci veya öğretmen hece arasına tıkladığında yeni eklenen makas sesini
 * sıfır gecikme (0ms) ve kesintisiz ardışık tıklama desteğiyle çalar.
 */

const AUDIO_SRC = '/makas.mp3';
const FALLBACK_SRC = '/makas.wav';

// Audio instance pool for rapid consecutive snips (e.g., rapid cuts in duel mode or fast syllables)
let audioPool: HTMLAudioElement[] = [];
let poolIndex = 0;
const POOL_SIZE = 4;

function initAudioPool() {
  if (typeof window === 'undefined') return;
  if (audioPool.length > 0) return;

  try {
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(AUDIO_SRC);
      audio.preload = 'auto';
      audio.volume = 1.0;
      audioPool.push(audio);
    }
  } catch (e) {
    console.warn('Audio pool initialization failed', e);
  }
}

// Pre-initialize when module is loaded in browser
if (typeof window !== 'undefined') {
  initAudioPool();
}

/**
 * Makas kesme sesini çalar.
 * Yeni eklenen /makas.mp3 ses dosyasını anında tetikler.
 */
export function playScissorCutSound(playMp3?: (src: string) => void): void {
  // 1. If playMp3 callback is passed from parent App, trigger it directly with /makas.mp3
  if (playMp3) {
    try {
      playMp3(AUDIO_SRC);
      return;
    } catch {
      // Fall through to audio pool
    }
  }

  // 2. Play from local fast preloaded audio pool
  if (typeof window !== 'undefined') {
    initAudioPool();
    if (audioPool.length > 0) {
      try {
        const audio = audioPool[poolIndex];
        poolIndex = (poolIndex + 1) % audioPool.length;
        audio.currentTime = 0;
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Try fallback
            try {
              const fb = new Audio(FALLBACK_SRC);
              fb.volume = 1.0;
              fb.play().catch(() => {});
            } catch {}
          });
        }
        return;
      } catch (e) {
        console.warn('Audio pool playback error', e);
      }
    }

    // 3. Fallback direct Audio creation
    try {
      const direct = new Audio(AUDIO_SRC);
      direct.volume = 1.0;
      direct.play().catch(() => {
        const directWav = new Audio(FALLBACK_SRC);
        directWav.play().catch(() => {});
      });
    } catch {}
  }
}
