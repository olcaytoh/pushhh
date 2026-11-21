import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { LETTER_GROUPS, getGroupSyllables, getFilteredWords } from '../src/data/okumaYazmaData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(ROOT, 'public', 'sesler');
const MANIFEST_PATH = path.join(OUTPUT_ROOT, 'manifest.json');

type VoicePersona = 'kadin' | 'erkek';
type SpeechLang = 'tr' | 'en';
type SpeechKind = 'harf' | 'hece' | 'kelime' | 'cumle';

interface TtsJob {
  text: string;
  slug: string;
  lang: SpeechLang;
  voice: VoicePersona;
  kind: SpeechKind;
  edgeVoice: string;
  manifestKey: string;
  publicUrl: string;
  diskPath: string;
}

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

function toSafeSlug(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.!?,;:'"()[\]{}]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9çğıöşü_-]/g, '')
    .slice(0, 64);
}

function toAsciiFilename(slug: string): string {
  const ascii = slug
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9_-]/g, '_');
  const needsHash = ascii !== slug || slug.length > 48;
  if (!needsHash) return `${ascii}.mp3`;
  const h = crypto.createHash('sha1').update(slug).digest('hex').slice(0, 8);
  return `${ascii.slice(0, 36)}_${h}.mp3`;
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
  const isShortSingle =
    lang === 'tr' && !clean.includes(' ') && (clean.length <= 4 || isSingleSyllableTurkish(clean));

  if (voice === 'erkek') {
    if (isShortSingle || kind === 'hece' || kind === 'harf') {
      return { rate: '-6%', pitch: '+0Hz' };
    }
    return { rate: '-5%', pitch: '+0Hz' };
  }

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
  kind: SpeechKind
): string {
  let clean = text.trim();
  if (lang === 'tr') {
    if (!clean.includes(' ') && clean.length <= 3) {
      clean = clean.toLocaleLowerCase('tr-TR');
    }
    clean = clean.replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\.(?=\s|$)/g, '$1 .');
    const isShortSingle = !clean.includes(' ') && (clean.length <= 4 || isSingleSyllableTurkish(clean));
    if ((kind === 'hece' || isShortSingle) && !/[.,!?]$/.test(clean)) {
      clean = `${clean},`;
    }
  }
  return clean;
}

function collectAllTexts(): {
  tr: Map<string, { text: string; kind: SpeechKind }>;
  en: Map<string, { text: string; kind: SpeechKind }>;
} {
  const tr = new Map<string, { text: string; kind: SpeechKind }>();
  const en = new Map<string, { text: string; kind: SpeechKind }>();

  const addTr = (raw: string, kind: SpeechKind) => {
    const t = raw.trim();
    if (!t) return;
    const normalized = !t.includes(' ') && t.length <= 3 ? t.toLocaleLowerCase('tr-TR') : t;
    const slug = toSafeSlug(normalized);
    if (!slug) return;
    if (!tr.has(slug)) {
      tr.set(slug, { text: normalized, kind });
    }
  };

  const addEn = (raw: string, kind: SpeechKind) => {
    const t = raw.trim();
    if (!t) return;
    const slug = toSafeSlug(t);
    if (!slug) return;
    if (!en.has(slug)) {
      en.set(slug, { text: t, kind });
    }
  };

  // Teacher voice greeting
  addTr('Merhaba çocuklar!', 'cumle');

  // 1) All 5 MEB Okuma-Yazma groups (letters, syllables, words, sentences, writing prompts)
  for (const g of LETTER_GROUPS) {
    for (const l of g.letters) {
      addTr(l.lower, 'harf');
      addTr(`${l.upper} sesi. ${l.keyword}`, 'cumle');
      addTr(`${l.upper} harfi. ${l.keyword}`, 'cumle');
      addTr(`Harika yazdın! ${l.upper} ${l.lower}`, 'cumle');
      addTr(l.keyword, 'kelime');
      for (const s of l.syllables) addTr(s, 'hece');
      for (const sw of l.sampleWords) addTr(sw, sw.length <= 3 ? 'hece' : 'kelime');
    }
    for (const s of getGroupSyllables(g, null)) addTr(s, 'hece');
    for (const w of g.words) {
      addTr(w.word, w.word.length <= 3 ? 'hece' : 'kelime');
      for (const syl of w.syllables) addTr(syl, 'hece');
    }
    for (const w of getFilteredWords(g, null).slice(0, 10)) {
      addTr(`Harika yazdın! ${w.word}`, 'cumle');
    }
    for (const sent of g.sentences) {
      addTr(sent.text, 'cumle');
    }
  }

  // 2) HeceSayisiActivity words
  const hecePath = path.join(ROOT, 'src', 'components', 'HeceSayisiActivity.tsx');
  if (fs.existsSync(hecePath)) {
    const src = fs.readFileSync(hecePath, 'utf8');
    for (const m of src.matchAll(/word:\s*['"]([^'"]+)['"]/g)) {
      addTr(m[1], m[1].length <= 3 ? 'hece' : 'kelime');
    }
  }

  // 3) GeoboardShapeDrawingGame speech prompts
  const geoPath = path.join(ROOT, 'src', 'components', 'GeoboardShapeDrawingGame.tsx');
  if (fs.existsSync(geoPath)) {
    const src = fs.readFileSync(geoPath, 'utf8');
    for (const m of src.matchAll(/speechText:\s*['"]([^'"]+)['"]/g)) {
      addTr(m[1], 'cumle');
    }
  }

  // 4) KuralliCumleActivity sentences (correctWords arrays)
  const kurPath = path.join(ROOT, 'src', 'components', 'KuralliCumleActivity.tsx');
  if (fs.existsSync(kurPath)) {
    const src = fs.readFileSync(kurPath, 'utf8');
    for (const m of src.matchAll(/correctWords:\s*\[([^\]]+)\]/g)) {
      const words = [...m[1].matchAll(/["']([^"']+)["']/g)].map((w) => w[1]);
      if (words.length > 0) {
        addTr(words.join(' '), 'cumle');
      }
    }
  }

  // 5) SchoolLifeGame English words
  const schoolPath = path.join(ROOT, 'src', 'components', 'SchoolLifeGame.tsx');
  if (fs.existsSync(schoolPath)) {
    const src = fs.readFileSync(schoolPath, 'utf8');
    for (const m of src.matchAll(/targetWord:\s*(?:'([^']+)'|"([^"]+)")/g)) {
      const val = m[1] || m[2];
      if (val) addEn(val, 'kelime');
    }
    for (const m of src.matchAll(/options:\s*\[([^\]]+)\]/g)) {
      for (const o of m[1].matchAll(/(?:'([^']+)'|"([^"]+)")/g)) {
        const val = o[1] || o[2];
        if (val) addEn(val, 'kelime');
      }
    }
  }

  return { tr, en };
}

async function synthesizeBuffer(tts: MsEdgeTTS, job: TtsJob): Promise<Buffer> {
  const prepared = escapeXml(prepareTtsInput(job.text, job.lang, job.kind));
  const prosody = pickNeuralProsody(job.text, job.lang, job.kind, job.voice);
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
      setTimeout(() => reject(new Error('Stream timeout')), 12000)
    ),
  ])) as Buffer;

  if (buf.length < 200) {
    throw new Error('Empty audio buffer');
  }
  return buf;
}

async function runVoiceBatch(edgeVoice: string, jobs: TtsJob[], concurrency = 10): Promise<{ ok: number; skipped: number; failed: number }> {
  let cursor = 0;
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  const worker = async () => {
    let client: MsEdgeTTS | null = null;
    const ensureClient = async () => {
      if (client) return client;
      const c = new MsEdgeTTS({ connectionTimeoutMs: 10000, synthesisTimeoutMs: 12000 });
      await c.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      client = c;
      return c;
    };
    const resetClient = () => {
      if (client) {
        try {
          client.close();
        } catch {
          // ignore
        }
        client = null;
      }
    };

    try {
      while (cursor < jobs.length) {
        const idx = cursor++;
        const job = jobs[idx];

        if (fs.existsSync(job.diskPath) && fs.statSync(job.diskPath).size > 200) {
          skipped++;
          continue;
        }

        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const c = await ensureClient();
            const buf = await synthesizeBuffer(c, job);
            fs.writeFileSync(job.diskPath, buf);
            ok++;
            success = true;
            break;
          } catch {
            resetClient();
            await new Promise((r) => setTimeout(r, 250 * attempt));
          }
        }
        if (!success) {
          failed++;
          console.error(`FAILED [${edgeVoice}]: ${job.text}`);
        }
      }
    } finally {
      resetClient();
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, jobs.length)) }, () => worker()));
  return { ok, skipped, failed };
}

async function main() {
  const { tr, en } = collectAllTexts();
  console.log(`Collected ${tr.size} unique Turkish items and ${en.size} unique English items.`);

  const voices: VoicePersona[] = ['kadin', 'erkek'];
  const jobsByEdgeVoice = new Map<string, TtsJob[]>();
  const allJobs: TtsJob[] = [];

  for (const voice of voices) {
    const trDir = path.join(OUTPUT_ROOT, 'tr', voice);
    const enDir = path.join(OUTPUT_ROOT, 'en', voice);
    fs.mkdirSync(trDir, { recursive: true });
    fs.mkdirSync(enDir, { recursive: true });

    for (const [slug, item] of tr.entries()) {
      const filename = toAsciiFilename(slug);
      const edgeVoice = EDGE_VOICE_MAP.tr[voice];
      const job: TtsJob = {
        text: item.text,
        slug,
        lang: 'tr',
        voice,
        kind: item.kind,
        edgeVoice,
        manifestKey: `tr/${voice}/${slug}`,
        publicUrl: `/sesler/tr/${voice}/${filename}`,
        diskPath: path.join(trDir, filename),
      };
      allJobs.push(job);
      const list = jobsByEdgeVoice.get(edgeVoice) || [];
      list.push(job);
      jobsByEdgeVoice.set(edgeVoice, list);
    }

    for (const [slug, item] of en.entries()) {
      const filename = toAsciiFilename(slug);
      const edgeVoice = EDGE_VOICE_MAP.en[voice];
      const job: TtsJob = {
        text: item.text,
        slug,
        lang: 'en',
        voice,
        kind: item.kind,
        edgeVoice,
        manifestKey: `en/${voice}/${slug}`,
        publicUrl: `/sesler/en/${voice}/${filename}`,
        diskPath: path.join(enDir, filename),
      };
      allJobs.push(job);
      const list = jobsByEdgeVoice.get(edgeVoice) || [];
      list.push(job);
      jobsByEdgeVoice.set(edgeVoice, list);
    }
  }

  await Promise.all(
    Array.from(jobsByEdgeVoice.entries()).map(async ([edgeVoice, jobs]) => {
      const start = Date.now();
      const res = await runVoiceBatch(edgeVoice, jobs, 8);
      const sec = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`${edgeVoice}: generated=${res.ok}, skipped=${res.skipped}, failed=${res.failed} (${sec}s)`);
    })
  );

  const manifest: Record<string, string> = {};
  for (const job of allJobs) {
    if (fs.existsSync(job.diskPath) && fs.statSync(job.diskPath).size > 200) {
      manifest[job.manifestKey] = job.publicUrl;
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest written with ${Object.keys(manifest).length} entries -> ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
