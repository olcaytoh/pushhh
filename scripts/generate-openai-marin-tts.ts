import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { LETTER_GROUPS, getGroupSyllables, getFilteredWords } from '../src/data/okumaYazmaData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(ROOT, 'public', 'sesler');
const MANIFEST_PATH = path.join(OUTPUT_ROOT, 'manifest.json');
const TRACKER_PATH = path.join(OUTPUT_ROOT, '.openai-marin-tracker.json');

type SpeechLang = 'tr' | 'en';
type SpeechKind = 'harf' | 'hece' | 'kelime' | 'cumle';

interface OpenAiTtsJob {
  text: string;
  slug: string;
  lang: SpeechLang;
  kind: SpeechKind;
  manifestKey: string;
  publicUrl: string;
  diskPath: string;
}

const OPENAI_MODEL = 'gpt-4o-mini-tts';
const OPENAI_VOICE = 'marin';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/audio/speech';

const INSTRUCTIONS_TR: Record<SpeechKind, string> = {
  harf:
    'Dil: Standart İstanbul Türkçesi. Konuşmacı: İlkokul 1. sınıf öğrencilerine okuma yazma öğreten çok sıcakkanlı, güleryüzlü, sevecen bir Türk kadın sınıf öğretmeni. Görev: Verilen tek Türkçe harf sesini net, yumuşak ve yabancı aksan olmadan oku.',
  hece:
    'Dil: Standart İstanbul Türkçesi. Konuşmacı: İlkokul 1. sınıf öğrencilerine okuma yazma öğreten çok sıcakkanlı, güleryüzlü, sevecen bir Türk kadın sınıf öğretmeni. Görev: Verilen Türkçe heceyi tek seferde, hecelemeden, net, tane tane ve sıcak bir tonla oku. Yabancı aksan kullanma.',
  kelime:
    'Dil: Standart İstanbul Türkçesi. Konuşmacı: İlkokul 1. sınıf öğrencilerine okuma yazma öğreten çok sıcakkanlı, güleryüzlü, sevecen bir Türk kadın sınıf öğretmeni. Görev: Verilen Türkçe kelimeyi doğal, sıcak, hafif vurgulu ve sonunu yutmadan net oku; çift ünsüzleri ("elli", "elle", "anne") belirgin telaffuz et. Yabancı aksan kullanma.',
  cumle:
    'Dil: Standart İstanbul Türkçesi. Konuşmacı: İlkokul 1. sınıf öğrencilerine okuma yazma öğreten çok sıcakkanlı, güleryüzlü, sevecen bir Türk kadın sınıf öğretmeni. Görev: Verilen Türkçe cümleyi güleryüzlü, akıcı, çocukların kolayca takip edeceği net bir sınıf temposuyla oku.',
};

const INSTRUCTIONS_EN =
  'Accent/Affect: Warm, friendly, cheerful elementary school English teacher. Tone: Bright and encouraging for young children. Pacing: Clear and slightly unhurried.';

// İngilizce ile aynı yazılan kısa Türkçe kelime/hecelerde OpenAI Marin'in İngilizceye kaymasını önleyen Türkçe fonetik harita
const MARIN_TR_SPELLING_OVERRIDES: Record<string, string> = {
  // 'c' harfi içeren Türkçe hece/kelimeler (İngilizce k/s olarak okunmasın)
  can: 'cân',
  cam: 'câm',
  cin: 'cîn',
  cem: 'cêm',
  ca: 'câ',
  ce: 'cê',
  ci: 'cî',
  co: 'coğ',
  cu: 'cû',
  cek: 'cêk',
  cuk: 'cûk',
  cey: 'cêy',
  cak: 'câk',
  civ: 'cîv',
  // '-o' ile biten İngilizce benzeri açık heceler
  to: 'toğ',
  no: 'noğ',
  go: 'goğ',
  do: 'doğ',
  so: 'soğ',
  bo: 'boğ',
  mo: 'moğ',
  po: 'poğ',
  ho: 'hoğ',
  vo: 'voğ',
  fo: 'foğ',
  jo: 'joğ',
  ro: 'roğ',
  zo: 'zoğ',
  // Kısa İngilizce eşyazılılar (fare->fair, at->et, hi->hay, man->men vb.)
  be: 'bê',
  he: 'hê',
  hi: 'hî',
  pi: 'pî',
  at: 'ât',
  as: 'âs',
  an: 'ân',
  is: 'îs',
  it: 'ît',
  in: 'în',
  if: 'îf',
  us: 'ûs',
  of: 'ôf',
  or: 'ôr',
  on: 'ôn',
  ok: 'ôk',
  fare: 'fâre',
  park: 'pârk',
  spor: 'spôr',
  tren: 'trên',
  judo: 'jûdo',
  jet: 'jêt',
  jel: 'jêl',
  man: 'mân',
  ran: 'rân',
  tan: 'tân',
  fan: 'fân',
  van: 'vân',
  dan: 'dân',
  han: 'hân',
  may: 'mây',
  bay: 'bây',
  men: 'mên',
  ten: 'tên',
  yen: 'yên',
  gen: 'gên',
  fen: 'fên',
  ken: 'kên',
  rad: 'râd',
  tar: 'târ',
  far: 'fâr',
  mar: 'mâr',
  har: 'hâr',
  var: 'vâr',
  bun: 'bûn',
  pot: 'pôt',
  top: 'tôp',
  tap: 'tâp',
  pas: 'pâs',
  tin: 'tîn',
  ton: 'tôn',
  don: 'dôn',
  son: 'sôn',
  fon: 'fôn',
  mon: 'môn',
  por: 'pôr',
  pur: 'pûr',
  mut: 'mût',
  lut: 'lût',
  fut: 'fût',
  ret: 'rêt',
  sil: 'sîl',
  til: 'tîl',
  pil: 'pîl',
  fil: 'fîl',
  lim: 'lîm',
  nik: 'nîk',
  lik: 'lîk',
  yik: 'yîk',
};

function prepareMarinInput(text: string, lang: SpeechLang): string {
  const clean = text.trim();
  if (lang !== 'tr') return clean;
  const lower = clean.toLocaleLowerCase('tr-TR');
  if (MARIN_TR_SPELLING_OVERRIDES[lower]) {
    return MARIN_TR_SPELLING_OVERRIDES[lower];
  }
  return clean;
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

  // Öğretmen karşılama
  addTr('Merhaba çocuklar!', 'cumle');

  // 1) Tüm 5 MEB Okuma-Yazma harf grubu
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

  // 2) HeceSayisiActivity kelimeleri
  const hecePath = path.join(ROOT, 'src', 'components', 'HeceSayisiActivity.tsx');
  if (fs.existsSync(hecePath)) {
    const src = fs.readFileSync(hecePath, 'utf8');
    for (const m of src.matchAll(/word:\s*['"]([^'"]+)['"]/g)) {
      addTr(m[1], m[1].length <= 3 ? 'hece' : 'kelime');
    }
  }

  // 3) GeoboardShapeDrawingGame cümleleri
  const geoPath = path.join(ROOT, 'src', 'components', 'GeoboardShapeDrawingGame.tsx');
  if (fs.existsSync(geoPath)) {
    const src = fs.readFileSync(geoPath, 'utf8');
    for (const m of src.matchAll(/speechText:\s*['"]([^'"]+)['"]/g)) {
      addTr(m[1], 'cumle');
    }
  }

  // 4) KuralliCumleActivity cümleleri
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

  // 5) SchoolLifeGame İngilizce kelimeleri
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

function loadTracker(): Record<string, string> {
  if (!fs.existsSync(TRACKER_PATH)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    return raw && typeof raw === 'object' ? (raw as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveTracker(tracker: Record<string, string>) {
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf8');
}

async function synthesizeWithOpenAiMarin(
  apiKey: string,
  job: OpenAiTtsJob
): Promise<Buffer> {
  const instructions = job.lang === 'en' ? INSTRUCTIONS_EN : INSTRUCTIONS_TR[job.kind];
  const body = {
    model: OPENAI_MODEL,
    voice: OPENAI_VOICE,
    input: prepareMarinInput(job.text, job.lang),
    instructions,
    response_format: 'mp3',
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      if (buf.length < 200) {
        throw new Error(`Empty audio returned for "${job.text}"`);
      }
      return buf;
    }

    const errText = await res.text().catch(() => '');
    const isQuotaEmpty =
      errText.includes('insufficient_quota') || errText.includes('no credits remaining');
    if (isQuotaEmpty) {
      throw new Error(
        `OpenAI bakiyesi yetersiz (insufficient_quota). Lütfen https://platform.openai.com/settings/organization/billing/ adresinden kredi ekleyin.`
      );
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 5) {
      throw new Error(`OpenAI TTS HTTP ${res.status} for "${job.text}": ${errText.slice(0, 200)}`);
    }

    const retryAfterSec = Number(res.headers.get('retry-after') || '0');
    const waitMs = retryAfterSec > 0 ? retryAfterSec * 1000 : 1200 * attempt * attempt;
    await new Promise((r) => setTimeout(r, waitMs));
  }

  throw new Error(`Failed after retries: "${job.text}"`);
}

async function main() {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    console.error('\nHATA: OPENAI_API_KEY ortam değişkeni bulunamadı!');
    console.error('Örnek kullanım (Mac/Linux):');
    console.error('  OPENAI_API_KEY="sk-..." npm run tts:openai');
    console.error('Örnek kullanım (Windows PowerShell):');
    console.error('  $env:OPENAI_API_KEY="sk-..."; npm run tts:openai\n');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const isSample = args.includes('--sample');
  const isForce = args.includes('--force');
  const keepErkek = args.includes('--keep-erkek');
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const onlySlugs = onlyArg
    ? new Set(
        onlyArg
          .slice('--only='.length)
          .split(',')
          .map((s) => toSafeSlug(s))
          .filter(Boolean)
      )
    : null;

  const { tr, en } = collectAllTexts();
  const trDir = path.join(OUTPUT_ROOT, 'tr', 'kadin');
  const enDir = path.join(OUTPUT_ROOT, 'en', 'kadin');
  fs.mkdirSync(trDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });

  const allJobs: OpenAiTtsJob[] = [];
  for (const [slug, item] of tr.entries()) {
    const filename = toAsciiFilename(slug);
    allJobs.push({
      text: item.text,
      slug,
      lang: 'tr',
      kind: item.kind,
      manifestKey: `tr/kadin/${slug}`,
      publicUrl: `/sesler/tr/kadin/${filename}`,
      diskPath: path.join(trDir, filename),
    });
  }
  for (const [slug, item] of en.entries()) {
    const filename = toAsciiFilename(slug);
    allJobs.push({
      text: item.text,
      slug,
      lang: 'en',
      kind: item.kind,
      manifestKey: `en/kadin/${slug}`,
      publicUrl: `/sesler/en/kadin/${filename}`,
      diskPath: path.join(enDir, filename),
    });
  }

  let targetJobs = allJobs;
  if (isSample) {
    const sampleSlugs = new Set(['merhaba_çocuklar', 'elli', 'elle', 'can', 'çay', 'iç', 'je', 'ela_lale_al']);
    targetJobs = allJobs.filter((j) => j.lang === 'tr' && sampleSlugs.has(j.slug));
    console.log(`Deneme modu (--sample): ${targetJobs.length} örnek dosya OpenAI "${OPENAI_VOICE}" ile üretilecek.`);
  } else if (onlySlugs && onlySlugs.size > 0) {
    targetJobs = allJobs.filter((j) => onlySlugs.has(j.slug));
    console.log(`Seçili kelimeler (--only): ${targetJobs.length} dosya OpenAI "${OPENAI_VOICE}" ile üretilecek.`);
  } else {
    console.log(
      `Toplam ${tr.size} Türkçe + ${en.size} İngilizce = ${allJobs.length} kadın öğretmen sesi (OpenAI ${OPENAI_MODEL} / ${OPENAI_VOICE}) hazırlanıyor...`
    );
  }

  const tracker = isForce ? {} : loadTracker();
  const pendingJobs = targetJobs.filter(
    (j) => isForce || tracker[j.manifestKey] !== `${OPENAI_MODEL}:${OPENAI_VOICE}` || !fs.existsSync(j.diskPath)
  );

  const skippedCount = targetJobs.length - pendingJobs.length;
  if (skippedCount > 0) {
    console.log(`${skippedCount} dosya daha önce Marin ile üretilmiş, atlanıyor. Kalan: ${pendingJobs.length}`);
  }

  let cursor = 0;
  let done = 0;
  let failed = 0;
  const startTime = Date.now();
  const concurrency = isSample ? 2 : 8;

  const worker = async () => {
    while (cursor < pendingJobs.length) {
      const idx = cursor++;
      const job = pendingJobs[idx];
      try {
        const buf = await synthesizeWithOpenAiMarin(apiKey, job);
        fs.writeFileSync(job.diskPath, buf);
        tracker[job.manifestKey] = `${OPENAI_MODEL}:${OPENAI_VOICE}`;
        done++;
        if (done % 25 === 0 || done === pendingJobs.length) {
          saveTracker(tracker);
          const sec = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`[${done}/${pendingJobs.length}] üretildi (${sec}s) — son: "${job.text}"`);
        }
      } catch (err) {
        failed++;
        console.error(`HATA [${job.text}]:`, (err as Error).message);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, pendingJobs.length)) }, () => worker()));
  saveTracker(tracker);

  // Tam üretim bittiyse (ve --keep-erkek verilmediyse) artık kullanılmayan erkek klasörünü temizle
  if (!isSample && !onlySlugs && !keepErkek && failed === 0) {
    for (const oldDir of [path.join(OUTPUT_ROOT, 'tr', 'erkek'), path.join(OUTPUT_ROOT, 'en', 'erkek')]) {
      if (fs.existsSync(oldDir)) {
        fs.rmSync(oldDir, { recursive: true, force: true });
      }
    }
  }

  // Manifest'i yalnızca mevcut kadın sesi dosyalarıyla güncelle
  const manifest: Record<string, string> = {};
  for (const job of allJobs) {
    if (fs.existsSync(job.diskPath) && fs.statSync(job.diskPath).size > 200) {
      manifest[job.manifestKey] = job.publicUrl;
    }
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `\nTamamlandı (${totalSec}s): üretilen=${done}, atlanan=${skippedCount}, hatalı=${failed}, manifest=${Object.keys(manifest).length} dosya.`
  );
  if (failed > 0) {
    console.log('Hatalı kalan dosyalar için aynı komutu tekrar çalıştırmanız yeterli; üretilenler atlanır.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
