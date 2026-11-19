import type {
  MemoryMatrixRound,
  QuizVisualQuestion,
  SpotOddRound,
  SpotOddTheme,
  TargetScanRound,
} from './bilsemActivitiesData';
import type {
  EmbeddedWireKind,
  MirrorMosaicSpec,
  PatternMotifKind,
  PatternTileSpec,
  PuzzleCutSpec,
  ShapeColor,
  ShapeKind,
  SpotOddGlyphSpec,
} from './bilsemVisualTypes';

const SHAPES: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon'];
const COLORS: ShapeColor[] = ['#38bdf8', '#f59e0b', '#10b981', '#f43f5e', '#a855f7', '#eab308'];

// Deterministic PRNG so generated pools are stable across renders & builds
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick<T>(arr: readonly T[], idx: number): T {
  return arr[((idx % arr.length) + arr.length) % arr.length];
}

// ============================================================================
// 1. ÇOKLU ZEKA (+44 -> Toplam 60)
// ============================================================================
export function generateExtraCokluZeka(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];

  // A. 16 Analoji sorusu (renk/şekil/döndürme/adet/nokta kuralları)
  for (let i = 0; i < 16; i++) {
    const sA = pick(SHAPES, i);
    const sC = pick(SHAPES, i + 2);
    const cA = pick(COLORS, i);
    const cB = pick(COLORS, i + 1);
    const cC = pick(COLORS, i + 3);
    const rule = i % 4; // 0: color+dot, 1: count 1->2, 2: rotate 0->180 & color, 3: count 1->3 & dot

    if (rule === 0) {
      out.push({
        id: `cz-g-${i + 1}`,
        prompt: 'İlk çiftteki görsel değişim kuralını bul ve sağdaki soru işaretini tamamla.',
        hint: 'Renk değişimini ve ortadaki beyaz nokta eklenmesini kontrol et.',
        explanation: 'Şekil aynı kalır, renk bir sonraki renge geçer ve ortasına beyaz nokta eklenir.',
        visualType: 'analogy',
        visualData: {
          a: { shape: sA, color: cA, innerDot: false },
          b: { shape: sA, color: cB, innerDot: true },
          c: { shape: sC, color: cC, innerDot: false },
        },
        options: [
          { id: 'a', visual: { shape: sC, color: cB, innerDot: true }, isCorrect: true },
          { id: 'b', visual: { shape: sC, color: cB, innerDot: false }, isCorrect: false },
          { id: 'c', visual: { shape: sA, color: cB, innerDot: true }, isCorrect: false },
          { id: 'd', visual: { shape: sC, color: cC, innerDot: true }, isCorrect: false },
        ],
      });
    } else if (rule === 1) {
      out.push({
        id: `cz-g-${i + 1}`,
        prompt: 'İlk kutudan ikinciye şekil sayısı nasıl değişti? Aynı kuralı uygula.',
        hint: 'Tek şekil iki katına çıkıyor ve rengi korunuyor.',
        explanation: 'Tek olan şekil aynı renkte 2 adet olarak çoğalır.',
        visualType: 'analogy',
        visualData: {
          a: { shape: sA, color: cA, count: 1 },
          b: { shape: sA, color: cA, count: 2 },
          c: { shape: sC, color: cC, count: 1 },
        },
        options: [
          { id: 'a', visual: { shape: sC, color: cC, count: 2 }, isCorrect: true },
          { id: 'b', visual: { shape: sC, color: cC, count: 3 }, isCorrect: false },
          { id: 'c', visual: { shape: sC, color: cA, count: 2 }, isCorrect: false },
          { id: 'd', visual: { shape: sA, color: cC, count: 2 }, isCorrect: false },
        ],
      });
    } else if (rule === 2) {
      const asym = (i % 2 === 0 ? 'triangle' : 'star') as ShapeKind;
      const asymC = (i % 2 === 0 ? 'star' : 'triangle') as ShapeKind;
      out.push({
        id: `cz-g-${i + 1}`,
        prompt: 'Dönüş ve renk kuralını inceleyerek soru işareti yerine gelecek şekli bul.',
        hint: 'Şekil 180° ters dönüyor ve hedef renge dönüşüyor.',
        explanation: 'Şekil 180 derece ters döner ve ikinci kutudaki rengi alır.',
        visualType: 'analogy',
        visualData: {
          a: { shape: asym, color: cA, rotation: 0 },
          b: { shape: asym, color: cB, rotation: 180 },
          c: { shape: asymC, color: cC, rotation: 0 },
        },
        options: [
          { id: 'a', visual: { shape: asymC, color: cB, rotation: 180 }, isCorrect: true },
          { id: 'b', visual: { shape: asymC, color: cB, rotation: 0 }, isCorrect: false },
          { id: 'c', visual: { shape: asymC, color: cC, rotation: 180 }, isCorrect: false },
          { id: 'd', visual: { shape: asym, color: cB, rotation: 180 }, isCorrect: false },
        ],
      });
    } else {
      out.push({
        id: `cz-g-${i + 1}`,
        prompt: 'Analoji ilişkisini çöz: 1 şekilden 3 şekle ve noktalıya geçişi uygula.',
        hint: 'Sayı 3 olur ve ortalarına beyaz nokta gelir.',
        explanation: 'Şeklin rengi korunur, adedi 3 olur ve beyaz nokta eklenir.',
        visualType: 'analogy',
        visualData: {
          a: { shape: sA, color: cA, count: 1, innerDot: false },
          b: { shape: sA, color: cA, count: 3, innerDot: true },
          c: { shape: sC, color: cC, count: 1, innerDot: false },
        },
        options: [
          { id: 'a', visual: { shape: sC, color: cC, count: 3, innerDot: true }, isCorrect: true },
          { id: 'b', visual: { shape: sC, color: cC, count: 2, innerDot: true }, isCorrect: false },
          { id: 'c', visual: { shape: sC, color: cC, count: 3, innerDot: false }, isCorrect: false },
          { id: 'd', visual: { shape: sC, color: cA, count: 3, innerDot: true }, isCorrect: false },
        ],
      });
    }
  }

  // B. 14 Terazi Denge sorusu
  const trNames: Record<ShapeKind, string> = {
    triangle: 'Üçgen',
    square: 'Kare',
    star: 'Yıldız',
    hexagon: 'Altıgen',
    circle: 'Daire',
    diamond: 'Elmas',
  };
  for (let i = 0; i < 14; i++) {
    const s1 = pick(['star', 'hexagon', 'square', 'triangle'] as ShapeKind[], i);
    const s2 = pick(['circle', 'diamond', 'triangle', 'star'] as ShapeKind[], i + 1);
    const unit = pick(['triangle', 'circle', 'square'] as ShapeKind[], i + 2);
    if (s1 !== s2 && s1 !== unit && s2 !== unit) {
      const k1 = 2 + (i % 2); // 2 or 3
      const k2 = 1 + ((i + 1) % 3); // 1, 2 or 3
      const ans = k1 + k2;
      const d1 = ans - 1;
      const d2 = ans + 1;
      const d3 = ans + 2;
      out.push({
        id: `cz-g-bal-${i + 1}`,
        prompt: `İki terazideki ağırlık dengesine göre, 1 ${trNames[s1]} + 1 ${trNames[s2]} kaç ${trNames[unit]} eder?`,
        hint: `Önce 1 ${trNames[s1]} ve 1 ${trNames[s2]} değerlerini ayrı ayrı bul, sonra topla.`,
        explanation: `1 ${trNames[s1]} = ${k1} ${trNames[unit]} ve 1 ${trNames[s2]} = ${k2} ${trNames[unit]} olduğu için toplamları ${ans} ${trNames[unit]} eder.`,
        visualType: 'balance',
        visualData: {
          scale1: { left: [s1], right: Array(k1).fill(unit) },
          scale2: { left: [s2], right: Array(k2).fill(unit) },
        },
        options: [
          { id: 'a', label: `${ans} ${trNames[unit]}`, isCorrect: true },
          { id: 'b', label: `${d1} ${trNames[unit]}`, isCorrect: false },
          { id: 'c', label: `${d2} ${trNames[unit]}`, isCorrect: false },
          { id: 'd', label: `${d3} ${trNames[unit]}`, isCorrect: false },
        ],
      });
    } else {
      const k1 = 2 + (i % 3);
      const ans = k1 * 2 + 1;
      out.push({
        id: `cz-g-bal-${i + 1}`,
        prompt: 'İlk terazide 1 Yıldız = 2 Üçgen, ikinci terazide 1 Altıgen = 1 Yıldız + 1 Üçgendir. 1 Altıgen + 1 Yıldız kaç Üçgen eder?',
        hint: 'Her Yıldız yerine 2 Üçgen koyarak değerleri topla.',
        explanation: `Yıldız ${k1} birimse Altıgen ${k1 + 1} birim olur; toplam ${ans} birim eder.`,
        visualType: 'balance',
        visualData: {
          scale1: { left: ['star'], right: Array(k1).fill('triangle') },
          scale2: { left: ['hexagon'], right: ['star', 'triangle'] },
        },
        options: [
          { id: 'a', label: `${ans} Üçgen`, isCorrect: true },
          { id: 'b', label: `${ans - 1} Üçgen`, isCorrect: false },
          { id: 'c', label: `${ans + 1} Üçgen`, isCorrect: false },
          { id: 'd', label: `${ans - 2} Üçgen`, isCorrect: false },
        ],
      });
    }
  }

  // C. 14 Görsel Şifre sorusu
  const rng = makeRng(202611);
  for (let i = 0; i < 14; i++) {
    const pool = [...SHAPES];
    const sA = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const sB = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const sC = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const d1 = 1 + ((i * 2) % 7);
    const d2 = ((d1 + 2) % 9) + 1;
    const d3 = ((d2 + 3) % 9) + 1;
    const map: Record<ShapeKind, number> = {
      [sA]: d1,
      [sB]: d2 === d1 ? (d2 % 9) + 1 : d2,
      [sC]: d3 === d1 || d3 === d2 ? ((d3 + 1) % 9) + 1 : d3,
    } as any;
    const row1 = [sA, sB, sC];
    const row2 = [sB, sC, sA];
    const row3 = [sC, sA, sB];
    const target = i % 2 === 0 ? [sB, sA, sC] : [sA, sC, sB];
    const code1 = row1.map((s) => map[s]).join('');
    const code2 = row2.map((s) => map[s]).join('');
    const code3 = row3.map((s) => map[s]).join('');
    const ansCode = target.map((s) => map[s]).join('');
    const w1 = [target[2], target[1], target[0]].map((s) => map[s]).join('');
    const w2 = [target[1], target[2], target[0]].map((s) => map[s]).join('');
    const w3 = [target[0], target[0], target[2]].map((s) => map[s]).join('');
    const uniqueWrongs = Array.from(new Set([w1, w2, w3, code1, code2, code3])).filter((c) => c !== ansCode).slice(0, 3);

    out.push({
      id: `cz-g-cip-${i + 1}`,
      prompt: 'Üstteki şifre tablosuna bakarak alt satırdaki şekillerin sayı kodunu bul.',
      hint: 'Her şeklin bulunduğu sıradaki rakamı tek tek eşleştir.',
      explanation: `Şekillerin rakam karşılıkları sırasıyla ${ansCode} kodunu verir.`,
      visualType: 'cipher',
      visualData: {
        rows: [
          { shapes: row1, code: code1 },
          { shapes: row2, code: code2 },
          { shapes: row3, code: code3 },
        ],
        target,
      },
      options: [
        { id: 'a', label: ansCode, isCorrect: true },
        { id: 'b', label: uniqueWrongs[0] || '991', isCorrect: false },
        { id: 'c', label: uniqueWrongs[1] || '882', isCorrect: false },
        { id: 'd', label: uniqueWrongs[2] || '773', isCorrect: false },
      ],
    });
  }

  return out;
}

// ============================================================================
// 2. BİLSEM ÖN TEST (+44 -> Toplam 60)
// ============================================================================
export function generateExtraOnTest(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];

  // A. 28 adet 3x3 Matris Sorusu
  for (let i = 0; i < 28; i++) {
    const s0 = pick(SHAPES, i);
    const s1 = pick(SHAPES, i + 1);
    const s2 = pick(SHAPES, i + 2);
    const c0 = pick(COLORS, i);
    const c1 = pick(COLORS, i + 2);
    const c2 = pick(COLORS, i + 4);
    const mode = i % 4; // 0: Latin square + count, 1: Latin square + dot, 2: Row rotation +90, 3: Latin square shapes & colors

    if (mode === 0) {
      const cells = [
        { shape: s0, color: c0, count: 1 },
        { shape: s1, color: c1, count: 2 },
        { shape: s2, color: c2, count: 3 },
        { shape: s1, color: c1, count: 1 },
        { shape: s2, color: c2, count: 2 },
        { shape: s0, color: c0, count: 3 },
        { shape: s2, color: c2, count: 1 },
        { shape: s0, color: c0, count: 2 },
        null,
      ];
      out.push({
        id: `ot-g-m-${i + 1}`,
        prompt: '3×3 matriste her satırda farklı şekil ve renk bulunur, adetler 1-2-3 artar. Eksik kare hangisi?',
        hint: 'Son satırda eksik olan şekil-rengi ve 3 adet kuralını birleştir.',
        explanation: 'Her satırda 3 şekil birer kez geçer ve sağa doğru adet 1→2→3 artar.',
        visualType: 'matrix3x3',
        visualData: { cells },
        options: [
          { id: 'a', visual: { shape: s1, color: c1, count: 3 }, isCorrect: true },
          { id: 'b', visual: { shape: s1, color: c1, count: 2 }, isCorrect: false },
          { id: 'c', visual: { shape: s1, color: c2, count: 3 }, isCorrect: false },
          { id: 'd', visual: { shape: s2, color: c1, count: 3 }, isCorrect: false },
        ],
      });
    } else if (mode === 1) {
      const cells = [
        { shape: s0, color: c0, innerDot: false },
        { shape: s1, color: c0, innerDot: true },
        { shape: s2, color: c0, innerDot: false },
        { shape: s1, color: c1, innerDot: false },
        { shape: s2, color: c1, innerDot: true },
        { shape: s0, color: c1, innerDot: false },
        { shape: s2, color: c2, innerDot: false },
        { shape: s0, color: c2, innerDot: true },
        null,
      ];
      out.push({
        id: `ot-g-m-${i + 1}`,
        prompt: 'Satırlardaki şekil sırası ve orta sütundaki beyaz nokta kuralına göre "?" karesini bul.',
        hint: 'Son satırın rengi sabit, orta sütun noktalı, kenarlar noktasız.',
        explanation: 'Son satırın rengini koruyan ve eksik kalan noktasız şekil doğru cevaptır.',
        visualType: 'matrix3x3',
        visualData: { cells },
        options: [
          { id: 'a', visual: { shape: s1, color: c2, innerDot: false }, isCorrect: true },
          { id: 'b', visual: { shape: s1, color: c2, innerDot: true }, isCorrect: false },
          { id: 'c', visual: { shape: s1, color: c1, innerDot: false }, isCorrect: false },
          { id: 'd', visual: { shape: s0, color: c2, innerDot: false }, isCorrect: false },
        ],
      });
    } else if (mode === 2) {
      const rotShape = (i % 2 === 0 ? 'triangle' : 'star') as ShapeKind;
      const cells = [
        { shape: rotShape, color: c0, rotation: 0 },
        { shape: rotShape, color: c0, rotation: 90 },
        { shape: rotShape, color: c0, rotation: 180 },
        { shape: s1, color: c1, rotation: 0 },
        { shape: s1, color: c1, rotation: 90 },
        { shape: s1, color: c1, rotation: 180 },
        { shape: rotShape, color: c2, rotation: 0 },
        { shape: rotShape, color: c2, rotation: 90 },
        null,
      ];
      out.push({
        id: `ot-g-m-${i + 1}`,
        prompt: 'Her satırda şekil saat yönünde 90° dönüyor. Sağ alt kare nasıl görünmelidir?',
        hint: '0° → 90° → 180° dönüşünü son satırın rengiyle uygula.',
        explanation: 'Üçüncü sütunda şekil 180° ters dönmüş konumda olmalıdır.',
        visualType: 'matrix3x3',
        visualData: { cells },
        options: [
          { id: 'a', visual: { shape: rotShape, color: c2, rotation: 180 }, isCorrect: true },
          { id: 'b', visual: { shape: rotShape, color: c2, rotation: 0 }, isCorrect: false },
          { id: 'c', visual: { shape: rotShape, color: c2, rotation: 270 }, isCorrect: false },
          { id: 'd', visual: { shape: rotShape, color: c0, rotation: 180 }, isCorrect: false },
        ],
      });
    } else {
      // Latin square shapes (row shift 1) and colors (row shift 2) independently!
      const cells = [
        { shape: s0, color: c0, innerDot: true },
        { shape: s1, color: c1, innerDot: true },
        { shape: s2, color: c2, innerDot: true },
        { shape: s1, color: c2, innerDot: false },
        { shape: s2, color: c0, innerDot: false },
        { shape: s0, color: c1, innerDot: false },
        { shape: s2, color: c1, innerDot: true },
        { shape: s0, color: c2, innerDot: true },
        null,
      ];
      out.push({
        id: `ot-g-m-${i + 1}`,
        prompt: 'Her satır ve sütunda tüm şekiller ve tüm renkler birer kez kullanılmıştır. Eksik kare hangisi?',
        hint: 'Hem şekil hem renk bakımından son satırda ve son sütunda olmayanı bul.',
        explanation: 'Eksik şekil, eksik renk ve 3. satırdaki beyaz nokta kuralı tek bir seçenekte birleşir.',
        visualType: 'matrix3x3',
        visualData: { cells },
        options: [
          { id: 'a', visual: { shape: s1, color: c0, innerDot: true }, isCorrect: true },
          { id: 'b', visual: { shape: s1, color: c0, innerDot: false }, isCorrect: false },
          { id: 'c', visual: { shape: s1, color: c1, innerDot: true }, isCorrect: false },
          { id: 'd', visual: { shape: s0, color: c0, innerDot: true }, isCorrect: false },
        ],
      });
    }
  }

  // B. 16 adet 3B Küp Sayma & Üstten Görünüm Sorusu
  const cubeConfigs: { heights: number[][]; askTopView: boolean }[] = [
    { heights: [[2, 1], [1, 0]], askTopView: false },
    { heights: [[3, 2], [2, 1]], askTopView: false },
    { heights: [[4, 1], [2, 2]], askTopView: false },
    { heights: [[2, 2, 1], [1, 0, 1]], askTopView: false },
    { heights: [[3, 1, 2], [2, 1, 0]], askTopView: false },
    { heights: [[2, 3], [1, 2]], askTopView: true },
    { heights: [[3, 0], [2, 1]], askTopView: true },
    { heights: [[4, 2], [1, 3]], askTopView: true },
    { heights: [[2, 1, 3], [0, 2, 1]], askTopView: true },
    { heights: [[3, 2, 1], [1, 2, 0]], askTopView: true },
    { heights: [[3, 3], [1, 2]], askTopView: false },
    { heights: [[4, 1], [3, 1]], askTopView: false },
    { heights: [[1, 3], [2, 1]], askTopView: true },
    { heights: [[2, 2], [3, 0]], askTopView: true },
    { heights: [[3, 2, 2], [1, 1, 1]], askTopView: false },
    { heights: [[2, 3, 1], [2, 0, 1]], askTopView: true },
  ];

  cubeConfigs.forEach((cfg, idx) => {
    const total = cfg.heights.flat().reduce((a, b) => a + b, 0);
    if (!cfg.askTopView) {
      out.push({
        id: `ot-g-c-${idx + 1}`,
        prompt: 'İzometrik blok yapısında toplam kaç adet birim küp vardır? (Altta gizli küpler dahil)',
        hint: 'Her sütundaki kule yüksekliğini ayrı ayrı say ve topla.',
        explanation: `Tüm sütunlardaki kat yükseklikleri toplandığında tam ${total} küp bulunur.`,
        visualType: 'cubes3d',
        visualData: { heights: cfg.heights },
        options: [
          { id: 'a', label: `${total} Küp`, isCorrect: true },
          { id: 'b', label: `${total - 1} Küp`, isCorrect: false },
          { id: 'c', label: `${total + 1} Küp`, isCorrect: false },
          { id: 'd', label: `${total + 2} Küp`, isCorrect: false },
        ],
      });
    } else {
      const h = cfg.heights;
      const w1 = [...h].reverse();
      const w2 = h.map((row) => [...row].reverse());
      const w3 = h.map((row) => row.map((v) => (v > 0 ? Math.max(1, v - 1) : 1)));
      out.push({
        id: `ot-g-c-${idx + 1}`,
        prompt: 'Bu 3 boyutlu yapının tam üstten görünümü ve kat sayıları hangi seçenekte doğru verilmiştir?',
        hint: 'Arka sıra üst satırda, ön sıra alt satırda görünür.',
        explanation: 'Her karedeki sayı o noktadaki üst üste küp sayısını gösterir.',
        visualType: 'cubes3d',
        visualData: { heights: h },
        options: [
          { id: 'a', visual: { grid: h }, isCorrect: true },
          { id: 'b', visual: { grid: w1 }, isCorrect: false },
          { id: 'c', visual: { grid: w2 }, isCorrect: false },
          { id: 'd', visual: { grid: w3 }, isCorrect: false },
        ],
      });
    }
  });

  return out;
}

// ============================================================================
// 3. BİLİŞSEL UYARIM - HAFIZA MATRİSİ (+45 -> Toplam 60)
// ============================================================================
export function generateExtraBiliselUyarim(): MemoryMatrixRound[] {
  const rng = makeRng(770033);
  const out: MemoryMatrixRound[] = [];

  for (let i = 0; i < 45; i++) {
    const gridSize: 3 | 4 | 5 = i < 15 ? 3 : i < 32 ? 4 : 5;
    const totalCells = gridSize * gridSize;
    const targetCount =
      gridSize === 3 ? 3 + (i % 3) : gridSize === 4 ? 4 + (i % 4) : 5 + (i % 4);
    const chosen = new Set<number>();
    while (chosen.size < targetCount) {
      chosen.add(Math.floor(rng() * totalCells));
    }
    const targets = Array.from(chosen).sort((a, b) => a - b);
    const previewMs = gridSize === 3 ? 2200 : gridSize === 4 ? 2600 : 3000;
    const titles = [
      'Işıklı Izgara Deseni',
      'Hızlı Konum Kodlama',
      'Uzamsal Hafıza İzi',
      'Görsel Dikkat Matrisi',
      'Koordinat Bellek Testi',
    ];
    out.push({
      id: `bu-g-${i + 1}`,
      title: `${gridSize}×${gridSize} ${pick(titles, i)}`,
      gridSize,
      targets,
      previewMs,
      hint: 'Kareleri satırlara göre gruplayarak veya köşelerden referans alarak aklında tut.',
    });
  }
  return out;
}

// ============================================================================
// 4. DİKKATİ GÜÇLENDİRME - HEDEF SEMBOL TARAMA (+45 -> Toplam 60)
// ============================================================================
export function generateExtraDikkatiGuclendirme(): TargetScanRound[] {
  const rng = makeRng(991144);
  const out: TargetScanRound[] = [];
  const shapeTr: Record<ShapeKind, string> = {
    star: 'Yıldız',
    circle: 'Daire',
    square: 'Kare',
    triangle: 'Üçgen',
    diamond: 'Elmas',
    hexagon: 'Altıgen',
  };
  const colorTr: Record<ShapeColor, string> = {
    '#38bdf8': 'Mavi',
    '#f59e0b': 'Turuncu',
    '#10b981': 'Yeşil',
    '#f43f5e': 'Kırmızı',
    '#a855f7': 'Mor',
    '#eab308': 'Sarı',
  };

  for (let i = 0; i < 45; i++) {
    const gridCols: 4 | 5 = i < 25 ? 4 : 5;
    const total = gridCols === 4 ? 16 : 20;
    const targetShape = pick(SHAPES, i);
    const targetColor = pick(COLORS, i + 1);
    const checkRot = targetShape === 'triangle' && i % 3 === 0;
    const targetRot = checkRot ? (i % 2 === 0 ? 0 : 180) : 0;
    const targetCount = 3 + (i % 3); // 3, 4 or 5 targets

    const targetIndices = new Set<number>();
    while (targetIndices.size < targetCount) {
      targetIndices.add(Math.floor(rng() * total));
    }

    const items: TargetScanRound['items'] = [];
    for (let idx = 0; idx < total; idx++) {
      if (targetIndices.has(idx)) {
        items.push({
          shape: targetShape,
          color: targetColor,
          rotation: targetRot,
          isTarget: true,
        });
      } else {
        // Guaranteed non-matching distractor
        let dShape = pick(SHAPES, Math.floor(rng() * SHAPES.length));
        let dColor = pick(COLORS, Math.floor(rng() * COLORS.length));
        let dRot = checkRot && rng() > 0.5 ? (targetRot === 0 ? 180 : 0) : 0;
        if (dShape === targetShape && dColor === targetColor && (!checkRot || dRot === targetRot)) {
          dColor = pick(COLORS, COLORS.indexOf(targetColor) + 1);
        }
        items.push({ shape: dShape, color: dColor, rotation: dRot, isTarget: false });
      }
    }

    const prompt = checkRot
      ? `Ucu ${targetRot === 0 ? 'yukarı' : 'aşağı'} bakan tüm ${colorTr[targetColor]} ${shapeTr[targetShape]}leri işaretle!`
      : `Tablodaki tüm ${colorTr[targetColor]} ${shapeTr[targetShape]}ları bul ve işaretle!`;

    out.push({
      id: `dg-g-${i + 1}`,
      prompt,
      gridCols,
      items,
      explanation: `Toplam ${targetCount} adet hedef sembolü diğer benzer renk ve şekillerden ayırarak buldun.`,
    });
  }
  return out;
}

// ============================================================================
// 5. GÖLGE ETKİNLİKLERİ (+44 -> Toplam 60)
// ============================================================================
export function generateExtraGolge(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];

  // 14 Yeni Figür (dik konum) + 3 farklı çeldirici varyant
  const newFigures: {
    fig: string;
    name: string;
    wrongs: [string, string, string];
    hint: string;
  }[] = [
    { fig: 'duck', name: 'Ördek', wrongs: ['no_beak', 'round_tail', 'raised_wing'], hint: 'Gaga, kuyruk çıkıntısı ve sırt çizgisine dikkat et.' },
    { fig: 'cactus', name: 'Kaktüs', wrongs: ['no_left_arm', 'even_arms', 'no_flower'], hint: 'Sol kol yüksekte, sağ kol biraz alçakta ve tepede çiçek var.' },
    { fig: 'mug', name: 'Kupa Bardak', wrongs: ['no_steam', 'no_handle', 'round_cup'], hint: 'Üstteki iki buhar kıvrımına ve sağ kulpa dikkat et.' },
    { fig: 'lamp', name: 'Abajur', wrongs: ['round_shade', 'no_pull', 'thin_base'], hint: 'Başlık açısı, sağdaki açma ipi ve geniş tabana bak.' },
    { fig: 'bicycle', name: 'Bisiklet', wrongs: ['small_front', 'no_seat', 'mirrored'], hint: 'İki eşit tekerlek, sele ve gidon yönünü kontrol et.' },
    { fig: 'anchor', name: 'Çapa', wrongs: ['no_ring', 'no_crossbar', 'wrong_rot_90'], hint: 'Üst halka, yatay çubuk ve iki sivri ucu takip et.' },
    { fig: 'snowman', name: 'Kardan Adam', wrongs: ['no_hat', 'no_nose', 'no_arm'], hint: 'Şapka, sağa bakan havuç burun ve soldaki kolu kontrol et.' },
    { fig: 'owl_sil', name: 'Baykuş', wrongs: ['no_ears', 'flat_wings', 'mirrored'], hint: 'İki kulak tüyü, sağ kanat çıkıntısı ve ayaklara bak.' },
    { fig: 'car_sil', name: 'Araba', wrongs: ['no_siren', 'one_wheel', 'mirrored'], hint: 'Tavan sireni, iki tekerlek ve eğimli ön camı incele.' },
    { fig: 'mushroom_sil', name: 'Mantar', wrongs: ['thin_stem', 'no_mini', 'mirrored'], hint: 'Kalın sap ve sağ alttaki küçük mantar çıkıntısına dikkat et.' },
    { fig: 'sword', name: 'Kılıç', wrongs: ['blunt_tip', 'no_guard', 'wrong_rot_90'], hint: 'Sivri uç, yatay koruma ve yuvarlak alt topuzu incele.' },
    { fig: 'flower_pot', name: 'Saksı Çiçeği', wrongs: ['no_leaf', 'small_flower', 'mirrored'], hint: 'Sağa uzanan tek yaprak ve 5 büyük taç yaprağı kontrol et.' },
    { fig: 'penguin_sil', name: 'Penguen', wrongs: ['no_wing', 'no_beak', 'mirrored'], hint: 'Sağa bakan gaga ve yukarı kalkık sağ kanada odaklan.' },
    { fig: 'whale', name: 'Balina', wrongs: ['no_spout', 'round_tail', 'mirrored'], hint: 'Tepedeki su fıskiyesi ve çatallı kuyruğa dikkat et.' },
  ];

  newFigures.forEach((item, i) => {
    out.push({
      id: `ge-g-new-${i + 1}`,
      prompt: `${item.name} görselinin birebir doğru siyah gölgesini bul!`,
      hint: item.hint,
      explanation: `${item.name} siluetinin tüm dış hatları ve çıkıntıları eksiksiz eşleşmelidir.`,
      visualType: 'shadow',
      visualData: { figure: item.fig },
      options: [
        { id: 'a', visual: { figure: item.fig, variant: 'exact' }, isCorrect: true },
        { id: 'b', visual: { figure: item.fig, variant: item.wrongs[0] }, isCorrect: false },
        { id: 'c', visual: { figure: item.fig, variant: item.wrongs[1] }, isCorrect: false },
        { id: 'd', visual: { figure: item.fig, variant: item.wrongs[2] }, isCorrect: false },
      ],
    });
  });

  // 30 adet Döndürülmüş / Aynalanmış Asimetrik Gölge Sorusu
  const rotatedConfigs: {
    fig: string;
    name: string;
    angle: number;
    flipX: boolean;
    badVariant: string;
  }[] = [
    { fig: 'rocket', name: 'Roket', angle: 90, flipX: false, badVariant: 'missing_fin' },
    { fig: 'rocket', name: 'Roket', angle: -90, flipX: false, badVariant: 'blunt_tip' },
    { fig: 'castle', name: 'Şato', angle: 0, flipX: true, badVariant: 'no_flag' },
    { fig: 'castle', name: 'Şato', angle: 90, flipX: false, badVariant: 'even_towers' },
    { fig: 'fish', name: 'Balık', angle: 0, flipX: true, badVariant: 'no_top_fin' },
    { fig: 'fish', name: 'Balık', angle: 90, flipX: false, badVariant: 'round_tail' },
    { fig: 'key', name: 'Anahtar', angle: 0, flipX: true, badVariant: 'two_teeth' },
    { fig: 'key', name: 'Anahtar', angle: -90, flipX: false, badVariant: 'square_head' },
    { fig: 'sailboat', name: 'Yelkenli', angle: 0, flipX: true, badVariant: 'one_sail' },
    { fig: 'sailboat', name: 'Yelkenli', angle: 90, flipX: false, badVariant: 'flag_right' },
    { fig: 'pine_tree', name: 'Çam Ağacı', angle: 0, flipX: true, badVariant: 'no_branch' },
    { fig: 'helicopter', name: 'Helikopter', angle: 0, flipX: true, badVariant: 'no_skid' },
    { fig: 'helicopter', name: 'Helikopter', angle: 90, flipX: false, badVariant: 'short_blade' },
    { fig: 'teapot', name: 'Çaydanlık', angle: 0, flipX: true, badVariant: 'no_knob' },
    { fig: 'teapot', name: 'Çaydanlık', angle: -90, flipX: false, badVariant: 'flat_handle' },
    { fig: 'umbrella', name: 'Şemsiye', angle: 0, flipX: true, badVariant: 'straight_handle' },
    { fig: 'umbrella', name: 'Şemsiye', angle: 90, flipX: false, badVariant: 'no_tip' },
    { fig: 'elephant', name: 'Fil', angle: 0, flipX: true, badVariant: 'no_trunk' },
    { fig: 'elephant', name: 'Fil', angle: 90, flipX: false, badVariant: 'no_tail' },
    { fig: 'locomotive', name: 'Lokomotif', angle: 0, flipX: true, badVariant: 'no_chimney' },
    { fig: 'locomotive', name: 'Lokomotif', angle: -90, flipX: false, badVariant: 'two_wheels' },
    { fig: 'duck', name: 'Ördek', angle: 0, flipX: true, badVariant: 'no_beak' },
    { fig: 'duck', name: 'Ördek', angle: 90, flipX: false, badVariant: 'round_tail' },
    { fig: 'cactus', name: 'Kaktüs', angle: 0, flipX: true, badVariant: 'no_flower' },
    { fig: 'mug', name: 'Kupa', angle: 0, flipX: true, badVariant: 'no_handle' },
    { fig: 'bicycle', name: 'Bisiklet', angle: 0, flipX: true, badVariant: 'no_seat' },
    { fig: 'car_sil', name: 'Araba', angle: 0, flipX: true, badVariant: 'no_siren' },
    { fig: 'penguin_sil', name: 'Penguen', angle: 0, flipX: true, badVariant: 'no_wing' },
    { fig: 'whale', name: 'Balina', angle: 0, flipX: true, badVariant: 'no_spout' },
    { fig: 'flower_pot', name: 'Çiçek', angle: 0, flipX: true, badVariant: 'no_leaf' },
  ];

  rotatedConfigs.forEach((rc, i) => {
    const wrongAngle = rc.angle === 0 ? 90 : -rc.angle;
    out.push({
      id: `ge-g-rot-${i + 1}`,
      prompt: `${rc.name} figürünün verilen konumdaki birebir gölgesini bul!`,
      hint: 'Hem figürün baktığı yöne hem de dış hat detaylarına aynı anda dikkat et.',
      explanation: `Dönüş/yön ve detayların tamamı birebir eşleşen gölge doğru cevaptır.`,
      visualType: 'shadow',
      visualData: { figure: rc.fig, angle: rc.angle, flipX: rc.flipX },
      options: [
        { id: 'a', visual: { figure: rc.fig, angle: rc.angle, flipX: rc.flipX, variant: 'exact' }, isCorrect: true },
        { id: 'b', visual: { figure: rc.fig, angle: rc.angle, flipX: !rc.flipX, variant: 'exact' }, isCorrect: false },
        { id: 'c', visual: { figure: rc.fig, angle: rc.angle, flipX: rc.flipX, variant: rc.badVariant }, isCorrect: false },
        { id: 'd', visual: { figure: rc.fig, angle: wrongAngle, flipX: rc.flipX, variant: 'exact' }, isCorrect: false },
      ],
    });
  });

  return out;
}

// ============================================================================
// 6. DESEN ETKİNLİKLERİ (+45 -> Toplam 60)
// ============================================================================
export function generateExtraDesen(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const motifs: PatternMotifKind[] = [
    'corner_tri',
    'diag_band',
    'arc_ring',
    'double_stripe',
    'star_dot',
    'chevron_l',
    'diamond_edge',
    'petal_drop',
    'step_corner',
    'ring_dot',
  ];
  const palettes: { bg: string; c1: string; c2: string }[] = [
    { bg: '#0f172a', c1: '#38bdf8', c2: '#fbbf24' },
    { bg: '#1e1b4b', c1: '#f43f5e', c2: '#2dd4bf' },
    { bg: '#064e3b', c1: '#34d399', c2: '#fde047' },
    { bg: '#3b0764', c1: '#e879f9', c2: '#38bdf8' },
    { bg: '#1e293b', c1: '#fb923c', c2: '#f8fafc' },
    { bg: '#fffbeb', c1: '#d97706', c2: '#0284c7' },
    { bg: '#f0fdf4', c1: '#16a34a', c2: '#e11d48' },
    { bg: '#fdf2f8', c1: '#db2777', c2: '#7c3aed' },
    { bg: '#083344', c1: '#22d3ee', c2: '#fb7185' },
  ];

  for (let i = 0; i < 45; i++) {
    const motif = motifs[i % motifs.length];
    const pal = palettes[(i + Math.floor(i / motifs.length) * 3) % palettes.length];
    const spec: PatternTileSpec = { motif, bg: pal.bg, c1: pal.c1, c2: pal.c2 };
    out.push({
      id: `ds-g-${i + 1}`,
      prompt: 'Simetrik 2×2 mozaik karosunun sağ alt köşesindeki "?" parçasını tamamla.',
      hint: 'Sol üst karonun 180° dönmüş (merkeze bakan) halini renk uyumuyla bul.',
      explanation: 'Merkezdeki desen bütünlüğünü sağlayan tek parça hem yön hem renk olarak tam oturur.',
      visualType: 'pattern_tile',
      visualData: { patternId: `gen_${motif}_${i}`, spec },
      options: [
        { id: 'a', visual: { patternId: `gen_${motif}_${i}`, spec, piece: 'exact' }, isCorrect: true },
        { id: 'b', visual: { patternId: `gen_${motif}_${i}`, spec, piece: 'wrong_rot' }, isCorrect: false },
        { id: 'c', visual: { patternId: `gen_${motif}_${i}`, spec, piece: 'swapped' }, isCorrect: false },
        { id: 'd', visual: { patternId: `gen_${motif}_${i}`, spec, piece: 'missing_accent' }, isCorrect: false },
      ],
    });
  }
  return out;
}

// ============================================================================
// 7. ŞEKİL BULMACA / PUZZLE (+45 -> Toplam 60)
// ============================================================================
export function generateExtraSekilBulmaca(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const colorPairs: [string, string][] = [
    ['#0284c7', '#38bdf8'],
    ['#059669', '#34d399'],
    ['#d97706', '#fbbf24'],
    ['#7c3aed', '#a78bfa'],
    ['#e11d48', '#fb7185'],
    ['#0d9488', '#2dd4bf'],
    ['#ea580c', '#fb923c'],
  ];

  // 15 unique base cutout geometries x 3 variations = 45 distinct puzzles
  const baseCuts: {
    boardCut: string;
    exact: string;
    w1: string;
    w2: string;
    w3: string;
    hint: string;
  }[] = [
    {
      boardCut: '78,12 128,12 128,108 78,108 78,76 54,76 54,44 78,44',
      exact: '58,12 108,12 108,108 58,108 58,76 34,76 34,44 58,44',
      w1: '12,12 62,12 62,44 86,44 86,76 62,76 62,108 12,108',
      w2: '58,12 108,12 108,108 58,108',
      w3: '58,12 108,12 108,108 58,108 58,66 42,66 42,54 58,54',
      hint: 'Sol kenar ortasındaki tek geniş kare çıkıntıya dikkat et.',
    },
    {
      boardCut: '86,12 128,12 128,108 48,108 48,80 68,80 68,46 86,46',
      exact: '68,12 110,12 110,108 30,108 30,80 50,80 50,46 68,46',
      w1: '12,12 54,12 54,46 72,46 72,80 92,80 92,108 12,108',
      w2: '68,12 110,12 110,108 40,108 40,60 68,60',
      w3: '68,12 110,12 110,108 30,108 30,52 68,52',
      hint: 'Alttan üste doğru daralan 3 basamak genişliğini say.',
    },
    {
      boardCut: '72,12 128,12 128,108 72,108 50,84 72,60 50,36',
      exact: '52,12 108,12 108,108 52,108 30,84 52,60 30,36',
      w1: '12,12 68,12 90,36 68,60 90,84 68,108 12,108',
      w2: '52,12 108,12 108,108 52,108 30,60',
      w3: '52,12 108,12 108,108 52,108',
      hint: 'Sol kenarda 2 adet sivri üçgen çıkıntı olmalı.',
    },
    {
      boardCut: '60,12 128,12 128,108 90,108 60,12',
      exact: '26,12 94,12 94,108 56,108',
      w1: '26,12 94,12 56,108 26,108',
      w2: '26,12 94,12 94,108 26,108',
      w3: '56,12 94,12 94,108 26,108',
      hint: 'Üst kenar geniş, alt kenar dar olan yamuk eğimine dikkat et.',
    },
    {
      boardCut: '88,12 128,12 128,108 88,108 88,90 60,90 60,72 88,72 88,48 60,48 60,30 88,30',
      exact: '68,12 108,12 108,108 68,108 68,90 40,90 40,72 68,72 68,48 40,48 40,30 68,30',
      w1: '68,12 108,12 108,108 68,108 68,70 40,70 40,50 68,50',
      w2: '12,12 52,12 52,30 80,30 80,48 52,48 52,72 80,72 80,90 52,90 52,108 12,108',
      w3: '68,12 108,12 108,108 68,108',
      hint: 'Sol kenarda eşit aralıklı 2 dikdörtgen diş bulunuyor.',
    },
    {
      boardCut: '66,12 128,12 128,74 96,74 96,108 66,108 66,52 44,52 44,30 66,30',
      exact: '46,12 108,12 108,74 76,74 76,108 46,108 46,52 24,52 24,30 46,30',
      w1: '46,12 108,12 108,108 46,108 46,52 24,52 24,30 46,30',
      w2: '12,12 74,12 74,30 96,30 96,52 74,52 74,108 44,108 44,74 12,74',
      w3: '46,12 108,12 108,74 76,74 76,108 46,108',
      hint: 'Hem sağ alttaki kesik köşeye hem sol üstteki küçük dişe dikkat et.',
    },
    {
      boardCut: '76,12 128,12 128,108 76,108 42,60',
      exact: '56,12 108,12 108,108 56,108 22,60',
      w1: '12,12 64,12 98,60 64,108 12,108',
      w2: '56,12 108,12 108,108 56,108 46,60',
      w3: '56,12 108,12 108,108 56,108 22,82 22,38',
      hint: 'Sola doğru uzanan tek derin V ucunun açısını takip et.',
    },
    {
      boardCut: '52,12 128,12 128,62 92,62 92,108 52,108',
      exact: '22,12 98,12 98,62 62,62 62,108 22,108',
      w1: '22,12 98,12 98,108 22,108',
      w2: '58,12 98,12 98,108 22,108 22,62 58,62',
      w3: '22,12 98,12 98,44 62,44 62,108 22,108',
      hint: 'Sağ alt köşesi içeri basamaklı L şeklinde geniş blok.',
    },
    {
      boardCut: '70,12 128,12 128,108 70,108 70,84 48,84 70,56 48,28 70,28',
      exact: '50,12 108,12 108,108 50,108 50,84 28,84 50,56 28,28 50,28',
      w1: '12,12 70,12 70,28 92,28 70,56 92,84 70,84 70,108 12,108',
      w2: '50,12 108,12 108,108 50,108 32,60',
      w3: '50,12 108,12 108,108 50,108',
      hint: 'Sol kenarda testere dişi gibi iki eğimli çentik var.',
    },
    {
      boardCut: '60,12 128,12 128,108 60,108 60,72 34,72 60,12',
      exact: '40,12 108,12 108,108 40,108 40,72 14,72',
      w1: '12,12 80,12 106,72 80,72 80,108 12,108',
      w2: '40,12 108,12 108,108 40,108',
      w3: '40,12 108,12 108,108 14,108',
      hint: 'Üstten sola kayan eğim ve altta düz yatay çıkıntı var.',
    },
    {
      boardCut: '82,12 128,12 128,108 82,108 82,94 64,94 64,74 82,74 82,58 64,58 64,40 82,40 82,24 64,24',
      exact: '62,12 108,12 108,108 62,108 62,94 44,94 44,74 62,74 62,58 44,58 44,40 62,40 62,24 44,24',
      w1: '62,12 108,12 108,108 62,108 62,76 44,76 44,56 62,56',
      w2: '12,12 58,12 76,24 58,24 58,40 76,40 76,58 58,58 58,74 76,74 76,94 58,94 58,108 12,108',
      w3: '62,12 108,12 108,108 62,108',
      hint: 'Sol taraftaki 3 küçük diş çıkıntısını yukarıdan aşağı say.',
    },
    {
      boardCut: '64,12 128,12 128,108 96,108 96,74 64,74 36,44 64,12',
      exact: '44,12 108,12 108,108 76,108 76,74 44,74 16,44',
      w1: '44,12 108,12 108,108 44,108 16,44',
      w2: '12,12 76,12 104,44 76,74 44,74 44,108 12,108',
      w3: '44,12 108,12 108,74 44,74',
      hint: 'Üst solda üçgen burun, sağ altta ise dikdörtgen basamak var.',
    },
    {
      boardCut: '76,12 128,12 128,108 52,108 76,80 52,60 76,40',
      exact: '56,12 108,12 108,108 32,108 56,80 32,60 56,40',
      w1: '56,12 108,12 108,108 56,108',
      w2: '12,12 64,12 64,40 88,60 64,80 88,108 12,108',
      w3: '56,12 108,12 108,108 32,108 32,40',
      hint: 'Kesim çizgisi iki iç girinti ve alt köşeye uzanan bir kuyruk oluşturuyor.',
    },
    {
      boardCut: '46,12 128,12 128,50 86,50 86,80 128,80 128,108 46,108',
      exact: '18,12 100,12 100,50 58,50 58,80 100,80 100,108 18,108',
      w1: '18,12 100,12 100,108 18,108',
      w2: '18,12 100,12 100,50 58,50 58,108 18,108',
      w3: '18,12 100,12 100,80 58,80 58,108 18,108',
      hint: 'Sağ tarafı C harfi gibi içeri oyulmuş geniş parça.',
    },
    {
      boardCut: '68,12 128,12 128,108 68,108 38,90 38,30',
      exact: '48,12 108,12 108,108 48,108 18,90 18,30',
      w1: '12,12 72,12 102,30 102,90 72,108 12,108',
      w2: '48,12 108,12 108,108 48,108',
      w3: '48,12 108,12 108,108 48,108 18,60',
      hint: 'Sol ucu düz kesik ikizkenar yamuk çıkıntısına dikkat et.',
    },
  ];

  for (let i = 0; i < 45; i++) {
    const base = baseCuts[i % baseCuts.length];
    const [boardColor, pieceColor] = colorPairs[(i + Math.floor(i / 15) * 2) % colorPairs.length];
    const spec: PuzzleCutSpec = {
      boardColor,
      pieceColor,
      boardCutPoints: base.boardCut,
      exactPoints: base.exact,
      wrongPoints: { w1: base.w1, w2: base.w2, w3: base.w3 },
    };
    out.push({
      id: `sb-g-${i + 1}`,
      prompt: 'Büyük geometrik bloktaki boşluğu hiç boşluk kalmadan kapatacak parçayı bul.',
      hint: base.hint,
      explanation: 'Kenar uzunlukları, yönü ve çıkıntıları boşlukla birebir örtüşen tek parça doğru cevaptır.',
      visualType: 'puzzle_cut',
      visualData: { puzzleId: `gen_${i}`, spec },
      options: [
        { id: 'a', visual: { puzzleId: `gen_${i}`, spec, piece: 'exact' }, isCorrect: true },
        { id: 'b', visual: { puzzleId: `gen_${i}`, spec, piece: 'w1' }, isCorrect: false },
        { id: 'c', visual: { puzzleId: `gen_${i}`, spec, piece: 'w2' }, isCorrect: false },
        { id: 'd', visual: { puzzleId: `gen_${i}`, spec, piece: 'w3' }, isCorrect: false },
      ],
    });
  }
  return out;
}

// ============================================================================
// 8. ŞEKİL NESNE BULMA (+45 -> Toplam 60)
// ============================================================================
export function generateExtraSekilNesne(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];

  // A. 30 adet karmaşık çizgi ağı içinde gizli şekil bulma (20 figür x farklı ağ/renk)
  const wireKinds: { kind: EmbeddedWireKind; label: string }[] = [
    { kind: 'house_frame', label: 'ev çatılı çerçeve' },
    { kind: 'z_bolt', label: 'Z çizgisi' },
    { kind: 'flag_pole', label: 'flamalı bayrak' },
    { kind: 'm_crown', label: 'M şekli' },
    { kind: 'arrow_right', label: 'sağa bakan ok' },
    { kind: 'hourglass', label: 'kum saati' },
    { kind: 'umbrella', label: 'şemsiye' },
    { kind: 'kite_tail', label: 'uçurtma' },
    { kind: 'sailboat_frame', label: 'yelkenli' },
    { kind: 'lightning', label: 'şimşek' },
    { kind: 'bowtie', label: 'papyon' },
    { kind: 'hook_j', label: 'J kancası' },
    { kind: 'diamond_cross', label: 'ortası çizgili baklava' },
    { kind: 'double_tri', label: 'çift üçgen' },
    { kind: 'tree_branch', label: 'dallı ağaç çizgisi' },
    { kind: 'key_line', label: 'anahtar çizgisi' },
    { kind: 'pentagon_cut', label: 'beşgen' },
    { kind: 'fish_wire', label: 'balık' },
    { kind: 'cup_handle', label: 'kulplu bardak' },
    { kind: 'stair_step', label: 'merdiven basamağı' },
  ];
  const frames: ('grid' | 'circle' | 'diag' | 'hex')[] = ['grid', 'circle', 'diag', 'hex'];
  const strokeCols = ['#0284c7', '#059669', '#7e22ce', '#e11d48'];

  for (let i = 0; i < 30; i++) {
    const wk = wireKinds[i % wireKinds.length];
    const frame = frames[i % frames.length];
    const col = strokeCols[i % strokeCols.length];
    out.push({
      id: `sn-g-w-${i + 1}`,
      prompt: `Üstteki ${wk.label} çizgisi aşağıdaki karmaşık ağlardan hangisinin içinde aynı yön ve ölçüyle gizlenmiştir?`,
      hint: 'Çizginin baktığı yönü ve köşelerin birleşim açısını kontrol et.',
      explanation: `Aynı oran, açı ve yönde saklı olan ${wk.label} sadece doğru ağda eksiksiz yer alır.`,
      visualType: 'embedded_shape',
      visualData: {
        sceneId: `gen_t_${i}`,
        spec: { mode: 'target', kind: wk.kind, strokeColor: '#d97706' },
      },
      options: [
        { id: 'a', visual: { sceneId: `gen_o1_${i}`, spec: { mode: 'clutter', kind: wk.kind, clutterFrame: frame, strokeColor: col, variant: 'match' } }, isCorrect: true },
        { id: 'b', visual: { sceneId: `gen_o2_${i}`, spec: { mode: 'clutter', kind: wk.kind, clutterFrame: frame, strokeColor: col, variant: 'flipX' } }, isCorrect: false },
        { id: 'c', visual: { sceneId: `gen_o3_${i}`, spec: { mode: 'clutter', kind: wk.kind, clutterFrame: frame, strokeColor: col, variant: 'flipY' } }, isCorrect: false },
        { id: 'd', visual: { sceneId: `gen_o4_${i}`, spec: { mode: 'clutter', kind: wk.kind, clutterFrame: frame, strokeColor: col, variant: 'broken' } }, isCorrect: false },
      ],
    });
  }

  // B. 15 adet geometrik şekil sayma sorusu (üçgen, kare, daire, baklava, yıldız)
  const countSpecs: {
    kind: 'triangles' | 'squares' | 'circles' | 'diamonds' | 'stars';
    name: string;
    val: number;
  }[] = [
    { kind: 'triangles', name: 'üçgen', val: 3 },
    { kind: 'triangles', name: 'üçgen', val: 4 },
    { kind: 'triangles', name: 'üçgen', val: 5 },
    { kind: 'squares', name: 'kare', val: 3 },
    { kind: 'squares', name: 'kare', val: 4 },
    { kind: 'squares', name: 'kare', val: 5 },
    { kind: 'squares', name: 'kare', val: 6 },
    { kind: 'circles', name: 'daire', val: 4 },
    { kind: 'circles', name: 'daire', val: 5 },
    { kind: 'circles', name: 'daire', val: 6 },
    { kind: 'diamonds', name: 'baklava (eşkenar dörtgen)', val: 3 },
    { kind: 'diamonds', name: 'baklava (eşkenar dörtgen)', val: 4 },
    { kind: 'diamonds', name: 'baklava (eşkenar dörtgen)', val: 5 },
    { kind: 'stars', name: 'yıldız', val: 5 },
    { kind: 'stars', name: 'yıldız', val: 6 },
  ];

  countSpecs.forEach((cs, i) => {
    const ans = cs.val;
    out.push({
      id: `sn-g-c-${i + 1}`,
      prompt: `Bu çizimde toplam kaç adet ${cs.name} vardır?`,
      hint: 'En dıştaki büyük şekilden başlayarak içindekileri tek tek say.',
      explanation: `Dıştan içe tüm ${cs.name}ler sayıldığında toplam ${ans} adet bulunur.`,
      visualType: 'embedded_shape',
      visualData: {
        sceneId: `gen_cnt_${i}`,
        spec: { mode: 'count_shapes', countKind: cs.kind, countValue: ans },
      },
      options: [
        { id: 'a', label: `${ans} ${cs.name.split(' ')[0]}`, isCorrect: true },
        { id: 'b', label: `${ans - 1} ${cs.name.split(' ')[0]}`, isCorrect: false },
        { id: 'c', label: `${ans + 1} ${cs.name.split(' ')[0]}`, isCorrect: false },
        { id: 'd', label: `${ans + 2} ${cs.name.split(' ')[0]}`, isCorrect: false },
      ],
    });
  });

  return out;
}

// ============================================================================
// 9. GÖRSEL AYIRT ETME - FARKLI OLANI BUL (+44 -> Toplam 60)
// ============================================================================
export function generateExtraGorselAyirtEtme(): SpotOddRound[] {
  const out: SpotOddRound[] = [];

  const makeSixCards = (oddIdx: number): SpotOddRound['cards'] =>
    Array.from({ length: 6 }).map((_, idx) => ({
      id: `c${idx + 1}`,
      variant: idx === oddIdx ? ('odd' as const) : ('normal' as const),
    }));

  // 16 temanın 2. varyantı (tamamen farklı bir görsel fark!)
  const themesV2: { theme: SpotOddTheme; prompt: string; exp: string }[] = [
    { theme: 'robot', prompt: '6 robot arasında gözü ve düğmesi farklı olan robotu bul!', exp: 'Farklı robotun sağ gözü daha büyük ve sağ göğüs düğmesi sarı renkte.' },
    { theme: 'house', prompt: 'Bu 6 evden birinin kapı rengi ve penceresi diğerlerinden farklı!', exp: 'Farklı evin kapısı yeşil ve sağ penceresi yok.' },
    { theme: 'owl', prompt: 'Baykuşlardan hangisinin gagası farklı renkte ve göğüs beneği eksik?', exp: 'Farklı baykuşun gagası kırmızı ve alt beneği yok.' },
    { theme: 'ship', prompt: '6 yelkenliden hangisinin yelken rengi ve lumbuzu farklı?', exp: 'Farklı geminin sağ yelkeni mavi ve sağ yuvarlak penceresi eksik.' },
    { theme: 'flower', prompt: 'Çiçeklerden birinin yaprağı mor ve orta göbeği daha küçük!', exp: 'Farklı çiçeğin sağ yaprağı mor renktedir.' },
    { theme: 'clock', prompt: 'Saatlerden hangisi diğerlerinden farklı bir saati gösteriyor?', exp: 'Farklı saatin çerçevesi turuncu ve yelkovanı 6 yönüne bakıyor.' },
    { theme: 'train', prompt: 'Lokomotiflerden birinin orta tekerleği eksik ve arka tekerleği yeşil!', exp: 'Farklı trenin 2 tekerleği var ve büyük tekerleği yeşil.' },
    { theme: 'cake', prompt: 'Pastalardan hangisinin mumu eksik ve kreması sarı?', exp: 'Farklı pastanın sağdaki yeşil mumu yok ve kreması sarı.' },
    { theme: 'mushroom', prompt: 'Mantarlardan hangisinin şapkası turuncu ve üst beneği yok?', exp: 'Farklı mantarın şapkası kırmızı yerine turuncu renkte.' },
    { theme: 'balloon', prompt: 'Sıcak hava balonlarından hangisi farklı renkte?', exp: 'Farklı balonun kubbesi pembe ve sepeti sarı.' },
    { theme: 'car', prompt: 'Arabalardan hangisinin ön camı ve arka tekerleği farklı?', exp: 'Farklı arabanın ön camı sarı ve arka tekerleği daha küçük.' },
    { theme: 'penguin', prompt: 'Penguenlerden hangisinin papyonu eksik?', exp: 'Farklı penguenin boynunda papyon bulunmuyor.' },
    { theme: 'icecream', prompt: 'Dondurmalardan hangisinin top rengi ve külah çizgisi farklı?', exp: 'Farklı dondurmanın sol topu mor renkte.' },
    { theme: 'castle_spot', prompt: 'Şatolardan hangisinin sol kule çatısı sarı renkte?', exp: 'Farklı şatonun sol kule çatısı mavi değil sarı.' },
    { theme: 'bee', prompt: 'Arılardan hangisinin sağ kanadı eksik ve gözü sarı?', exp: 'Farklı arının tek kanadı görünüyor.' },
    { theme: 'trophy_spot', prompt: 'Kupalardan hangisinin sağ kulpu eksik?', exp: 'Farklı kupanın sağ kulpu bulunmuyor.' },
  ];

  themesV2.forEach((tv, i) => {
    out.push({
      id: `gae-g-v2-${i + 1}`,
      prompt: tv.prompt,
      sceneTheme: tv.theme,
      variantIndex: 1,
      cards: makeSixCards((i * 5 + 2) % 6),
      explanation: tv.exp,
    });
  });

  // 28 adet Geometrik Rozet (SpotOddGlyphSpec) fark bulma turu
  const bgs = ['#f8fafc', '#fffbeb', '#f0fdf4', '#eff6ff', '#fdf2f8'];
  const oddChanges: SpotOddGlyphSpec['oddChange'][] = [
    'dot_count',
    'inner_rot',
    'color_swap',
    'inner_shape',
    'missing_ring',
  ];
  const changeExp: Record<SpotOddGlyphSpec['oddChange'], string> = {
    dot_count: 'Köşelerdeki küçük nokta sayısı diğerlerinden farklı!',
    inner_rot: 'Ortadaki iç şekil 180° ters dönmüş durumda!',
    color_swap: 'Dış ve iç şeklin renkleri yer değiştirmiş!',
    inner_shape: 'Ortadaki küçük şekil diğerlerinden farklı!',
    missing_ring: 'Çevresindeki kesikli halka eksik!',
  };

  for (let i = 0; i < 28; i++) {
    const outerShape = pick(SHAPES, i);
    const innerShape = pick(['triangle', 'star', 'diamond'] as ShapeKind[], i);
    const oddChange = oddChanges[i % oddChanges.length];
    const primaryColor = pick(COLORS, i);
    const accentColor = pick(COLORS, i + 2);
    const glyphSpec: SpotOddGlyphSpec = {
      bg: bgs[i % bgs.length],
      primaryColor,
      accentColor,
      outerShape,
      innerShape,
      cornerDots: ((i % 4) + 1) as 1 | 2 | 3 | 4,
      oddChange,
    };
    out.push({
      id: `gae-g-gl-${i + 1}`,
      prompt: '6 geometrik rozet arasından küçük detayı farklı olan tek kartı bul!',
      sceneTheme: 'robot',
      glyphSpec,
      cards: makeSixCards((i * 3 + 1) % 6),
      explanation: changeExp[oddChange],
    });
  }

  return out;
}

// ============================================================================
// 10. AYNA SİMETRİSİ (+46 -> Toplam 60)
// ============================================================================
function reflectX3x3(cells: (string | null)[]): string {
  const out: (string | null)[] = Array(9).fill(null);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) out[r * 3 + (2 - c)] = cells[r * 3 + c];
  }
  return out.map((x) => x || '_').join(',');
}
function reflectY3x3(cells: (string | null)[]): string {
  const out: (string | null)[] = Array(9).fill(null);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) out[(2 - r) * 3 + c] = cells[r * 3 + c];
  }
  return out.map((x) => x || '_').join(',');
}
function rotate180_3x3(cells: (string | null)[]): string {
  return [...cells].reverse().map((x) => x || '_').join(',');
}

export function generateExtraAynaSimetrisi(): QuizVisualQuestion[] {
  const rng = makeRng(334455);
  const out: QuizVisualQuestion[] = [];
  const blockCols = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#a855f7'];

  let attempts = 0;
  while (out.length < 46 && attempts < 500) {
    attempts++;
    const cells: (string | null)[] = Array(9).fill(null);
    const activeCount = 3 + (out.length % 3); // 3, 4 or 5 colored blocks
    const indices = new Set<number>();
    while (indices.size < activeCount) indices.add(Math.floor(rng() * 9));
    for (const idx of indices) {
      cells[idx] = blockCols[Math.floor(rng() * blockCols.length)];
    }

    const sSame = cells.map((x) => x || '_').join(',');
    const sX = reflectX3x3(cells);
    const sY = reflectY3x3(cells);
    const s180 = rotate180_3x3(cells);

    // Ensure strictly 4 distinct visual transforms!
    if (new Set([sSame, sX, sY, s180]).size !== 4) continue;

    const axis: 'vertical' | 'horizontal' = out.length % 2 === 0 ? 'vertical' : 'horizontal';
    const correctTransform = axis === 'vertical' ? 'reflectX' : 'reflectY';
    const wrong1 = axis === 'vertical' ? 'reflectY' : 'reflectX';
    const spec: MirrorMosaicSpec = { cells };

    out.push({
      id: `as-g-${out.length + 1}`,
      prompt:
        axis === 'vertical'
          ? '3×3 renkli desenin DİKEY ayna eksenine göre doğru yansıması hangisidir?'
          : '3×3 renkli desenin YATAY ayna eksenine göre doğru yansıması hangisidir?',
      hint:
        axis === 'vertical'
          ? 'Sol sütun sağa, sağ sütun sola geçer; üst ve alt satır değişmez.'
          : 'Üst satır en alta, alt satır en üste geçer; sol ve sağ sütun değişmez.',
      explanation:
        axis === 'vertical'
          ? 'Dikey aynada sağ-sol yer değiştirir, yukarı-aşağı sıralaması aynı kalır.'
          : 'Yatay aynada üst-alt yer değiştirir, sol-sağ sıralaması aynı kalır.',
      visualType: 'mirror_axis',
      visualData: { figureId: `gen_m_${out.length + 1}`, axis, spec },
      options: [
        { id: 'a', visual: { figureId: `gen_m_${out.length + 1}`, spec, transform: correctTransform }, isCorrect: true },
        { id: 'b', visual: { figureId: `gen_m_${out.length + 1}`, spec, transform: 'same' }, isCorrect: false },
        { id: 'c', visual: { figureId: `gen_m_${out.length + 1}`, spec, transform: wrong1 }, isCorrect: false },
        { id: 'd', visual: { figureId: `gen_m_${out.length + 1}`, spec, transform: 'rotate180' }, isCorrect: false },
      ],
    });
  }

  return out;
}

// ============================================================================
// 11. KÜP AÇILIMI VE 3B UZAMSAL DÜŞÜNME (+46 -> Toplam 60)
// ============================================================================
export function generateExtraKupAcilimi(): QuizVisualQuestion[] {
  const rng = makeRng(556677);
  const out: QuizVisualQuestion[] = [];
  const shapeTr: Record<ShapeKind, string> = {
    circle: 'Daire',
    square: 'Kare',
    triangle: 'Üçgen',
    star: 'Yıldız',
    diamond: 'Elmas',
    hexagon: 'Altıgen',
  };
  const faceKeys = ['top', 'left', 'center', 'right', 'bottom', 'tail'] as const;
  const faceTr: Record<string, string> = {
    top: 'Üstteki',
    left: 'Soldaki',
    center: 'Ortadaki',
    right: 'Sağdaki',
    bottom: 'Alttaki',
    tail: 'En alttaki',
  };
  const oppositeMap: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
    center: 'tail',
    tail: 'center',
  };

  // A. 24 adet Karşılıklı Yüz Bulma sorusu
  for (let i = 0; i < 24; i++) {
    const sh = [...SHAPES];
    const col = [...COLORS];
    for (let k = sh.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [sh[k], sh[j]] = [sh[j], sh[k]];
    }
    for (let k = col.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [col[k], col[j]] = [col[j], col[k]];
    }
    const faces: Record<string, { shape: ShapeKind; color: ShapeColor }> = {};
    faceKeys.forEach((fk, idx) => {
      faces[fk] = { shape: sh[idx], color: col[idx] };
    });

    const askKey = faceKeys[i % faceKeys.length];
    const oppKey = oppositeMap[askKey];
    const wrongKeys = faceKeys.filter((k) => k !== askKey && k !== oppKey).slice(0, 3);

    out.push({
      id: `ka-g-opp-${i + 1}`,
      prompt: `Bu açık küp ağı kapatıldığında ${faceTr[askKey]} "${shapeTr[faces[askKey].shape]}" yüzünün tam karşısına hangi yüz gelir?`,
      hint: 'Aynı doğru boyunca bir kare atlayarak karşılıklı yüzleri eşleştir.',
      explanation: `Küp katlandığında ${shapeTr[faces[askKey].shape]} ile ${shapeTr[faces[oppKey].shape]} yüzleri birbirine tam paralel ve karşılıklı olur.`,
      visualType: 'cube_net',
      visualData: { faces },
      options: [
        { id: 'a', visual: faces[oppKey], isCorrect: true },
        { id: 'b', visual: faces[wrongKeys[0]], isCorrect: false },
        { id: 'c', visual: faces[wrongKeys[1]], isCorrect: false },
        { id: 'd', visual: faces[wrongKeys[2]], isCorrect: false },
      ],
    });
  }

  // B. 14 adet Katlanmış 3B Küp Görünümü sorusu
  for (let i = 0; i < 14; i++) {
    const sh = [...SHAPES];
    const col = [...COLORS];
    for (let k = sh.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [sh[k], sh[j]] = [sh[j], sh[k]];
    }
    for (let k = col.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [col[k], col[j]] = [col[j], col[k]];
    }
    const faces: Record<string, { shape: ShapeKind; color: ShapeColor }> = {};
    faceKeys.forEach((fk, idx) => {
      faces[fk] = { shape: sh[idx], color: col[idx] };
    });

    // Valid corner around center: (top=top, left=left, right=center) OR (top=top, left=center, right=right)
    const correctCorner =
      i % 2 === 0
        ? { top: faces.top, left: faces.left, right: faces.center }
        : { top: faces.top, left: faces.center, right: faces.right };

    // 3 invalid cubes (each contains an opposite pair on adjacent visible faces!)
    const bad1 = { top: faces.top, left: faces.bottom, right: faces.center };
    const bad2 = { top: faces.center, left: faces.left, right: faces.right };
    const bad3 = { top: faces.tail, left: faces.center, right: faces.right };

    out.push({
      id: `ka-g-3d-${i + 1}`,
      prompt: 'Açık küp katlandığında aşağıdaki 3 boyutlu küplerden hangisi elde edilebilir?',
      hint: 'Karşılıklı iki yüz (örneğin üst-alt, sol-sağ veya orta-en alt) aynı anda komşu olamaz.',
      explanation: 'Doğru küpte görünen 3 yüz birbirine komşudur; diğer seçeneklerde karşılıklı yüzler yan yana konmuştur.',
      visualType: 'cube_net',
      visualData: { faces },
      options: [
        { id: 'a', visual: { cubeFaces: correctCorner }, isCorrect: true },
        { id: 'b', visual: { cubeFaces: bad1 }, isCorrect: false },
        { id: 'c', visual: { cubeFaces: bad2 }, isCorrect: false },
        { id: 'd', visual: { cubeFaces: bad3 }, isCorrect: false },
      ],
    });
  }

  // C. 8 adet 3B Küp Yapı Sorusu
  const towerHeights: number[][][] = [
    [[4, 2], [2, 1]],
    [[3, 3], [0, 2]],
    [[4, 0], [3, 2]],
    [[2, 3, 1], [1, 2, 1]],
    [[3, 1, 3], [1, 0, 2]],
    [[4, 3], [1, 1]],
    [[2, 4], [2, 0]],
    [[3, 2, 0], [2, 1, 2]],
  ];
  towerHeights.forEach((h, i) => {
    const total = h.flat().reduce((a, b) => a + b, 0);
    out.push({
      id: `ka-g-tw-${i + 1}`,
      prompt: 'İzometrik blok kulesinde toplam kaç adet birim küp kullanılmıştır?',
      hint: 'Görünmeyen arka kolonların altındaki destek küplerini saymayı unutma.',
      explanation: `Tüm sütunlardaki kat sayıları toplandığında ${total} birim küp elde edilir.`,
      visualType: 'cubes3d',
      visualData: { heights: h },
      options: [
        { id: 'a', label: `${total} Küp`, isCorrect: true },
        { id: 'b', label: `${total - 1} Küp`, isCorrect: false },
        { id: 'c', label: `${total + 1} Küp`, isCorrect: false },
        { id: 'd', label: `${total + 2} Küp`, isCorrect: false },
      ],
    });
  });

  return out;
}

// ============================================================================
// 12. SAYISAL & ŞEKİLSEL ÖRÜNTÜ DİZİLERİ (+45 -> Toplam 60)
// ============================================================================
export function generateExtraOruntuDizileri(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];

  // A. 20 adet Sayısal Örüntü Sorusu
  for (let i = 0; i < 20; i++) {
    const kind = i % 4;
    let nums: number[] = [];
    let ans = 0;
    let hint = '';
    let exp = '';

    if (kind === 0) {
      // Sabit artış (+3, +4, +5, +6, +7)
      const start = 2 + i;
      const step = 3 + (i % 5);
      nums = [start, start + step, start + step * 2, start + step * 3];
      ans = start + step * 4;
      hint = 'Ardışık sayılar arasındaki fark sabit artıyor.';
      exp = `Her adımda +${step} eklenerek ${ans} sayısına ulaşılır.`;
    } else if (kind === 1) {
      // Artan fark (+1, +2, +3, +4, +5)
      const start = 1 + i;
      const a1 = start;
      const a2 = a1 + 2;
      const a3 = a2 + 4;
      const a4 = a3 + 6;
      ans = a4 + 8;
      nums = [a1, a2, a3, a4];
      hint = 'Sayılar arasındaki fark her seferinde 2 artıyor (+2, +4, +6...).';
      exp = `Farklar +2, +4, +6, +8 şeklinde ilerlediği için cevap ${ans} olur.`;
    } else if (kind === 2) {
      // Dönüşümlü (+a, -b) veya (×2, +1)
      const start = 3 + (i % 6);
      const a1 = start;
      const a2 = a1 + 5;
      const a3 = a2 - 2;
      const a4 = a3 + 5;
      ans = a4 - 2;
      nums = [a1, a2, a3, a4];
      hint = 'Bir sayı artıyor, sonraki sayı azalıyor (+5, -2 kuralını dene).';
      exp = `+5 ve -2 adımları sırayla tekrarlandığı için sıradaki sayı ${ans} olur.`;
    } else {
      // İkişerli toplam (Fibonacci tipi)
      const a1 = 1 + (i % 4);
      const a2 = 2 + ((i + 1) % 4);
      const a3 = a1 + a2;
      const a4 = a2 + a3;
      ans = a3 + a4;
      nums = [a1, a2, a3, a4];
      hint = 'Önceki iki sayıyı toplayarak bir sonraki sayıyı elde etmeyi dene.';
      exp = `Her sayı kendinden önceki iki sayının toplamıdır: ${a3} + ${a4} = ${ans}.`;
    }

    out.push({
      id: `od-g-n-${i + 1}`,
      prompt: 'Sayı örüntüsündeki kuralı yakala ve "?" kutusuna gelecek sayıyı seç.',
      hint,
      explanation: exp,
      visualType: 'sequence_row',
      visualData: {
        items: [
          ...nums.map((n) => ({ kind: 'number', text: String(n), color: '#0284c7' })),
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: [
        { id: 'a', label: String(ans), isCorrect: true },
        { id: 'b', label: String(ans - 2), isCorrect: false },
        { id: 'c', label: String(ans + 2), isCorrect: false },
        { id: 'd', label: String(ans + 4), isCorrect: false },
      ],
    });
  }

  // B. 15 adet Şekilsel Dizi Örüntü Sorusu
  for (let i = 0; i < 15; i++) {
    const sA = pick(SHAPES, i);
    const sB = pick(SHAPES, i + 1);
    const sC = pick(SHAPES, i + 2);
    const cA = pick(COLORS, i);
    const cB = pick(COLORS, i + 2);
    const cC = pick(COLORS, i + 4);
    const useRot = i % 2 === 0;

    if (useRot) {
      const sh = (i % 4 === 0 ? 'triangle' : 'star') as ShapeKind;
      const seq = [
        { shape: sh, color: cA, rotation: 0 },
        { shape: sh, color: cB, rotation: 90 },
        { shape: sh, color: cA, rotation: 180 },
        { shape: sh, color: cB, rotation: 270 },
      ];
      out.push({
        id: `od-g-s-${i + 1}`,
        prompt: 'Dönüş ve renk örüntüsüne göre sıradaki şekil hangisi olmalıdır?',
        hint: 'Şekil her adımda saat yönünde 90° dönüyor ve iki renk dönüşümlü gidiyor.',
        explanation: '270° sonrasında şekil tekrar başlangıç konumuna (0°) ve ilk renge döner.',
        visualType: 'sequence_row',
        visualData: {
          items: [
            ...seq.map((cell) => ({ kind: 'shape', cell })),
            { kind: 'question', text: '?', color: '#d97706' },
          ],
        },
        options: [
          { id: 'a', visual: { shape: sh, color: cA, rotation: 0 }, isCorrect: true },
          { id: 'b', visual: { shape: sh, color: cB, rotation: 0 }, isCorrect: false },
          { id: 'c', visual: { shape: sh, color: cA, rotation: 180 }, isCorrect: false },
          { id: 'd', visual: { shape: sh, color: cC, rotation: 90 }, isCorrect: false },
        ],
      });
    } else {
      const seq = [
        { shape: sA, color: cA, count: 1 },
        { shape: sB, color: cB, count: 2 },
        { shape: sC, color: cC, count: 3 },
        { shape: sA, color: cA, count: 1 },
      ];
      out.push({
        id: `od-g-s-${i + 1}`,
        prompt: 'Şekil, renk ve adet döngüsünü inceleyerek "?" yerine gelecek kutuyu bul.',
        hint: 'Üçlü döngü baştan tekrar ediyor.',
        explanation: 'Döngünün 2. adımındaki şekil, renk ve 2 adet kuralı sıradaki kutuya gelir.',
        visualType: 'sequence_row',
        visualData: {
          items: [
            ...seq.map((cell) => ({ kind: 'shape', cell })),
            { kind: 'question', text: '?', color: '#d97706' },
          ],
        },
        options: [
          { id: 'a', visual: { shape: sB, color: cB, count: 2 }, isCorrect: true },
          { id: 'b', visual: { shape: sB, color: cB, count: 1 }, isCorrect: false },
          { id: 'c', visual: { shape: sC, color: cC, count: 2 }, isCorrect: false },
          { id: 'd', visual: { shape: sB, color: cA, count: 3 }, isCorrect: false },
        ],
      });
    }
  }

  // C. 10 adet Mantıksal Sınıflama (Farklı Kavramı Bul) Sorusu
  const wordSets: { words: [string, string, string, string]; oddIdx: number; reason: string }[] = [
    { words: ['Mars', 'Venüs', 'Ay', 'Jüpiter'], oddIdx: 2, reason: 'Ay bir gezegen değil, Dünya’nın uydusudur.' },
    { words: ['Keman', 'Gitar', 'Flüt', 'Piyano'], oddIdx: 2, reason: 'Flüt üflemeli, diğerleri telli/tuşlu çalgılardır.' },
    { words: ['Üçgen', 'Kare', 'Daire', 'Dikdörtgen'], oddIdx: 2, reason: 'Dairenin köşesi ve düz kenarı yoktur.' },
    { words: ['Papatya', 'Gül', 'Çam', 'Lale'], oddIdx: 2, reason: 'Çam bir ağaçtır, diğerleri çiçektir.' },
    { words: ['Uçak', 'Helikopter', 'Planör', 'Feribot'], oddIdx: 3, reason: 'Feribot deniz aracıdır, diğerleri hava aracıdır.' },
    { words: ['Saniye', 'Dakika', 'Saat', 'Kilometre'], oddIdx: 3, reason: 'Kilometre uzunluk birimidir, diğerleri zaman birimidir.' },
    { words: ['Bakır', 'Demir', 'Altın', 'Elmas'], oddIdx: 3, reason: 'Elmas metal değildir; karbon mineralidir.' },
    { words: ['Balina', 'Yunus', 'Fok', 'Köpekbalığı'], oddIdx: 3, reason: 'Köpekbalığı balıktır; diğerleri deniz memelisidir.' },
    { words: ['Ankara', 'İzmir', 'Antalya', 'Londra'], oddIdx: 3, reason: 'Londra Türkiye’de değildir.' },
    { words: ['Kış', 'İlkbahar', 'Ağustos', 'Sonbahar'], oddIdx: 2, reason: 'Ağustos mevsim değil bir aydır.' },
  ];

  wordSets.forEach((ws, i) => {
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#a855f7'];
    out.push({
      id: `od-g-w-${i + 1}`,
      prompt: 'Bu dört kavramdan üçü aynı gruba aittir. Grubu bozan kavram hangisidir?',
      hint: 'Kavramların ortak özelliğini ve türünü düşün.',
      explanation: ws.reason,
      visualType: 'sequence_row',
      visualData: {
        items: ws.words.map((w, idx) => ({ kind: 'badge', text: w, color: colors[idx] })),
      },
      options: ws.words.map((w, idx) => ({
        id: String.fromCharCode(97 + idx),
        label: w,
        isCorrect: idx === ws.oddIdx,
      })),
    });
  });

  return out;
}

// ============================================================================
// 13. KAĞIT KATLAMA VE DELİK AÇMA (+48 -> Toplam 60)
// ============================================================================
type HoleSpec = { x: number; y: number; shape?: 'circle' | 'diamond' | 'triangle' };

function unfoldPaperHoles(
  foldType: 'half_v' | 'half_h' | 'quarter' | 'diag_tr',
  holes: HoleSpec[]
): HoleSpec[] {
  let res: HoleSpec[] = [...holes];
  if (foldType === 'half_v') {
    res = [...res, ...holes.map((h) => ({ ...h, x: 100 - h.x }))];
  } else if (foldType === 'half_h') {
    res = [...res, ...holes.map((h) => ({ ...h, y: 100 - h.y }))];
  } else if (foldType === 'quarter') {
    const step1 = [...holes, ...holes.map((h) => ({ ...h, x: 100 - h.x }))];
    res = [...step1, ...step1.map((h) => ({ ...h, y: 100 - h.y }))];
  } else if (foldType === 'diag_tr') {
    // Diagonal fold across line y = x
    res = [...res, ...holes.map((h) => ({ ...h, x: h.y, y: h.x }))];
  }
  return res;
}

export function generateExtraKagitKatlama(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const foldLineMap: Record<string, 'v' | 'h' | 'vh' | 'diag'> = {
    half_v: 'v',
    half_h: 'h',
    quarter: 'vh',
    diag_tr: 'diag',
  };
  const foldLabelMap: Record<string, string> = {
    half_v: 'dikey eksenden ikiye',
    half_h: 'yatay eksenden ikiye',
    quarter: 'önce dikey sonra yatay dörde',
    diag_tr: 'köşegen boyunca ikiye',
  };

  // Curated hole positions inside each folded half/quarter/triangle
  const configs: {
    foldType: 'half_v' | 'half_h' | 'quarter' | 'diag_tr';
    holes: HoleSpec[];
  }[] = [
    // half_v (x in 16..38, y in 20..80)
    { foldType: 'half_v', holes: [{ x: 24, y: 26, shape: 'circle' }] },
    { foldType: 'half_v', holes: [{ x: 24, y: 74, shape: 'diamond' }] },
    { foldType: 'half_v', holes: [{ x: 36, y: 24, shape: 'triangle' }] },
    { foldType: 'half_v', holes: [{ x: 20, y: 30, shape: 'circle' }, { x: 34, y: 70, shape: 'circle' }] },
    { foldType: 'half_v', holes: [{ x: 22, y: 24, shape: 'diamond' }, { x: 22, y: 76, shape: 'circle' }] },
    { foldType: 'half_v', holes: [{ x: 36, y: 50, shape: 'diamond' }] },
    { foldType: 'half_v', holes: [{ x: 20, y: 50, shape: 'triangle' }, { x: 36, y: 26, shape: 'circle' }] },
    { foldType: 'half_v', holes: [{ x: 32, y: 32, shape: 'circle' }, { x: 22, y: 68, shape: 'diamond' }] },
    { foldType: 'half_v', holes: [{ x: 18, y: 22, shape: 'triangle' }] },
    { foldType: 'half_v', holes: [{ x: 36, y: 76, shape: 'circle' }, { x: 20, y: 24, shape: 'circle' }] },
    // half_h (x in 20..80, y in 18..38)
    { foldType: 'half_h', holes: [{ x: 26, y: 24, shape: 'circle' }] },
    { foldType: 'half_h', holes: [{ x: 74, y: 24, shape: 'diamond' }] },
    { foldType: 'half_h', holes: [{ x: 50, y: 36, shape: 'triangle' }] },
    { foldType: 'half_h', holes: [{ x: 24, y: 24, shape: 'circle' }, { x: 76, y: 36, shape: 'diamond' }] },
    { foldType: 'half_h', holes: [{ x: 30, y: 36, shape: 'diamond' }, { x: 70, y: 20, shape: 'circle' }] },
    { foldType: 'half_h', holes: [{ x: 50, y: 20, shape: 'diamond' }] },
    { foldType: 'half_h', holes: [{ x: 24, y: 34, shape: 'circle' }, { x: 76, y: 34, shape: 'triangle' }] },
    { foldType: 'half_h', holes: [{ x: 34, y: 22, shape: 'triangle' }, { x: 66, y: 36, shape: 'circle' }] },
    { foldType: 'half_h', holes: [{ x: 78, y: 34, shape: 'circle' }] },
    { foldType: 'half_h', holes: [{ x: 22, y: 22, shape: 'diamond' }, { x: 50, y: 36, shape: 'diamond' }] },
    // quarter (x in 16..38, y in 16..38)
    { foldType: 'quarter', holes: [{ x: 20, y: 20, shape: 'triangle' }] },
    { foldType: 'quarter', holes: [{ x: 36, y: 22, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 22, y: 36, shape: 'diamond' }] },
    { foldType: 'quarter', holes: [{ x: 36, y: 36, shape: 'triangle' }] },
    { foldType: 'quarter', holes: [{ x: 20, y: 20, shape: 'circle' }, { x: 36, y: 36, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 36, y: 20, shape: 'diamond' }, { x: 20, y: 36, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 26, y: 22, shape: 'triangle' }, { x: 36, y: 36, shape: 'diamond' }] },
    { foldType: 'quarter', holes: [{ x: 20, y: 32, shape: 'circle' }, { x: 36, y: 20, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 28, y: 28, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 18, y: 18, shape: 'diamond' }, { x: 38, y: 24, shape: 'triangle' }] },
    { foldType: 'quarter', holes: [{ x: 24, y: 38, shape: 'circle' }, { x: 38, y: 38, shape: 'diamond' }] },
    { foldType: 'quarter', holes: [{ x: 34, y: 18, shape: 'circle' }] },
    { foldType: 'quarter', holes: [{ x: 18, y: 28, shape: 'diamond' }] },
    { foldType: 'quarter', holes: [{ x: 28, y: 18, shape: 'triangle' }] },
    // diag_tr (upper-right triangle: x > y + 12, x in 34..84, y in 18..64)
    { foldType: 'diag_tr', holes: [{ x: 76, y: 24, shape: 'diamond' }] },
    { foldType: 'diag_tr', holes: [{ x: 64, y: 22, shape: 'circle' }] },
    { foldType: 'diag_tr', holes: [{ x: 80, y: 38, shape: 'triangle' }] },
    { foldType: 'diag_tr', holes: [{ x: 54, y: 20, shape: 'circle' }] },
    { foldType: 'diag_tr', holes: [{ x: 80, y: 52, shape: 'diamond' }] },
    { foldType: 'diag_tr', holes: [{ x: 76, y: 24, shape: 'circle' }, { x: 54, y: 22, shape: 'diamond' }] },
    { foldType: 'diag_tr', holes: [{ x: 80, y: 42, shape: 'circle' }, { x: 62, y: 22, shape: 'circle' }] },
    { foldType: 'diag_tr', holes: [{ x: 74, y: 32, shape: 'triangle' }] },
    { foldType: 'diag_tr', holes: [{ x: 78, y: 22, shape: 'circle' }, { x: 82, y: 58, shape: 'triangle' }] },
    { foldType: 'diag_tr', holes: [{ x: 68, y: 26, shape: 'diamond' }, { x: 82, y: 44, shape: 'circle' }] },
    // Extra mixed 2-hole quarter & half
    { foldType: 'quarter', holes: [{ x: 22, y: 24, shape: 'circle' }, { x: 22, y: 38, shape: 'triangle' }] },
    { foldType: 'half_v', holes: [{ x: 30, y: 22, shape: 'diamond' }, { x: 30, y: 78, shape: 'diamond' }] },
    { foldType: 'half_h', holes: [{ x: 22, y: 28, shape: 'circle' }, { x: 78, y: 28, shape: 'circle' }] },
    { foldType: 'diag_tr', holes: [{ x: 50, y: 18, shape: 'diamond' }, { x: 82, y: 50, shape: 'diamond' }] },
  ];

  configs.forEach((cfg, i) => {
    const foldLine = foldLineMap[cfg.foldType];
    const correctHoles = unfoldPaperHoles(cfg.foldType, cfg.holes);
    // Create 3 distinct wrong unfoldings
    const wrongMissing = cfg.holes; // didn't unfold
    const wrongAxis =
      cfg.foldType === 'half_v'
        ? unfoldPaperHoles('half_h', cfg.holes.map((h) => ({ ...h, y: 26 })))
        : cfg.foldType === 'half_h'
        ? unfoldPaperHoles('half_v', cfg.holes.map((h) => ({ ...h, x: 26 })))
        : cfg.foldType === 'quarter'
        ? unfoldPaperHoles('half_v', cfg.holes)
        : [...cfg.holes, ...cfg.holes.map((h) => ({ ...h, x: 100 - h.x }))];
    const wrongShifted = correctHoles.map((h) => ({
      ...h,
      x: h.x < 50 ? Math.min(44, h.x + 14) : Math.max(56, h.x - 14),
      y: h.y < 50 ? Math.min(44, h.y + 12) : Math.max(56, h.y - 12),
    }));

    out.push({
      id: `kk-g-${i + 1}`,
      prompt: `Kare kağıt ${foldLabelMap[cfg.foldType]} katlanıp işaretli yerden deliniyor. Kağıt açıldığında nasıl görünür?`,
      hint: 'Her kat izini bir ayna çizgisi gibi düşün ve delikleri karşı tarafa simetrik yansıt.',
      explanation: `Kağıt tamamen açıldığında kat izlerine göre simetrik toplam ${correctHoles.length} delik oluşur.`,
      visualType: 'paper_fold',
      visualData: { foldType: cfg.foldType, holes: cfg.holes },
      options: [
        { id: 'a', visual: { foldLine, holes: correctHoles }, isCorrect: true },
        { id: 'b', visual: { foldLine, holes: wrongMissing }, isCorrect: false },
        { id: 'c', visual: { foldLine, holes: wrongAxis }, isCorrect: false },
        { id: 'd', visual: { foldLine, holes: wrongShifted }, isCorrect: false },
      ],
    });
  });

  return out;
}

// ============================================================================
// 14. YÖN TAKİBİ, KODLAMA & GÖRSEL MANTIK (+46 -> Toplam 60)
// ============================================================================
export function generateExtraYonAlgoritma(): QuizVisualQuestion[] {
  const rng = makeRng(884422);
  const out: QuizVisualQuestion[] = [];
  const cols = ['A', 'B', 'C', 'D', 'E'];

  // A. 24 adet 4x4 ve 5x5 Yön & Koordinat Takip Sorusu
  for (let i = 0; i < 24; i++) {
    const size = i < 12 ? 4 : 5;
    const isTargetShapeMode = i % 2 === 0;
    const start: [number, number] = [
      Math.floor(rng() * size),
      Math.floor(rng() * size),
    ];

    // Generate 3 or 4 valid in-bounds moves ending at a distinct square !== start
    let r = start[0];
    let c = start[1];
    const moves: { dir: 'R' | 'L' | 'U' | 'D'; steps: number }[] = [];
    const moveCount = size === 4 ? 3 : 4;
    let lastAxis: 'h' | 'v' | null = null;

    for (let m = 0; m < moveCount; m++) {
      const useH: boolean = lastAxis === 'v' ? true : lastAxis === 'h' ? false : m % 2 === 0;
      lastAxis = useH ? 'h' : 'v';
      if (useH) {
        const maxR = size - 1 - c;
        const maxL = c;
        const goR = maxR >= maxL;
        const maxSteps = goR ? maxR : maxL;
        const steps = Math.max(1, Math.min(maxSteps, 1 + Math.floor(rng() * 3)));
        moves.push({ dir: goR ? 'R' : 'L', steps });
        c += goR ? steps : -steps;
      } else {
        const maxD = size - 1 - r;
        const maxU = r;
        const goD = maxD >= maxU;
        const maxSteps = goD ? maxD : maxU;
        const steps = Math.max(1, Math.min(maxSteps, 1 + Math.floor(rng() * 3)));
        moves.push({ dir: goD ? 'D' : 'U', steps });
        r += goD ? steps : -steps;
      }
    }

    // Ensure final !== start
    if (r === start[0] && c === start[1]) {
      const dir = c + 1 < size ? 'R' : 'L';
      moves.push({ dir, steps: 1 });
      c += dir === 'R' ? 1 : -1;
    }

    if (isTargetShapeMode) {
      // Place 4 distinct shapes on the grid, one at [r, c]
      const chosenShapes = [...SHAPES].slice(0, 4);
      const targets: { row: number; col: number; shape: ShapeKind; color: ShapeColor }[] = [
        { row: r, col: c, shape: chosenShapes[0], color: COLORS[0] },
      ];
      const occupied = new Set([`${start[0]},${start[1]}`, `${r},${c}`]);
      for (let t = 1; t < 4; t++) {
        let tr = 0;
        let tc = 0;
        let guard = 0;
        do {
          tr = Math.floor(rng() * size);
          tc = Math.floor(rng() * size);
          guard++;
        } while (occupied.has(`${tr},${tc}`) && guard < 40);
        occupied.add(`${tr},${tc}`);
        targets.push({ row: tr, col: tc, shape: chosenShapes[t], color: COLORS[t] });
      }

      out.push({
        id: `ya-g-p-${i + 1}`,
        prompt: 'BAŞLA karesinden ok komutlarını sırayla izleyerek hangi sembolün üzerine varırsın?',
        hint: 'Her okun başındaki sayı kadar o yöne ilerle ve son durduğun karedeki şekle bak.',
        explanation: `Komutları sırayla takip ettiğinde (${cols[c]}${r + 1}) karesindeki sembolün üzerine ulaşırsın.`,
        visualType: 'grid_path',
        visualData: { size, start, moves, targets, showCoords: false },
        options: targets.map((t, idx) => ({
          id: String.fromCharCode(97 + idx),
          visual: { shape: t.shape, color: t.color },
          isCorrect: idx === 0,
        })),
      });
    } else {
      const correctCoord = `${cols[c]}${r + 1}`;
      const candSet = new Set<string>([correctCoord]);
      const offsets: [number, number][] = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [-1, -1],
      ];
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          candSet.add(`${cols[nc]}${nr + 1}`);
        }
        if (candSet.size >= 4) break;
      }
      const coords = Array.from(candSet).slice(0, 4);

      out.push({
        id: `ya-g-p-${i + 1}`,
        prompt: 'BAŞLA karesinden tüm yön komutlarını sırayla uygula. Hangi koordinata ulaşırsın?',
        hint: 'Üstteki harfler sütunu, soldaki sayılar satırı gösterir.',
        explanation: `Başlangıçtan tüm adımları uyguladığında ${correctCoord} koordinatına ulaşırsın.`,
        visualType: 'grid_path',
        visualData: { size, start, moves, targets: [], showCoords: true },
        options: coords.map((lbl, idx) => ({
          id: String.fromCharCode(97 + idx),
          label: lbl,
          isCorrect: lbl === correctCoord,
        })),
      });
    }
  }

  // B. 22 adet Görsel Şekil Birleştirme (+), Kesişim (∩) ve XOR (⊕) Sorusu
  const ruleDefs: {
    sym: '+' | '∩' | '⊕';
    prompt: string;
    hint: string;
    exp: string;
  }[] = [
    {
      sym: '+',
      prompt: 'BİRLEŞİM (+): İki kutudaki tüm noktalar üst üste birleşince hangi desen oluşur?',
      hint: 'Birinci veya ikinci kutuda dolu olan tüm kareler sonuçta da dolu olur.',
      exp: 'Birleşim kuralına göre iki kutudaki tüm noktalar tek ızgarada toplanır.',
    },
    {
      sym: '∩',
      prompt: 'KESİŞİM (∩): Her iki kutuda da AYNI yerde bulunan ortak noktalar hangileridir?',
      hint: 'Sadece iki kutuda birden aynı konumda olan noktaları seç.',
      exp: 'Kesişim (∩) işleminde yalnızca her iki tabloda da ortak olan hücreler kalır.',
    },
    {
      sym: '⊕',
      prompt: 'FARKLI OLANLAR (⊕): İki kutu üst üste konduğunda aynı yerdekiler silinir. Geriye ne kalır?',
      hint: 'Sadece tek kutuda bulunan noktalar kalır, çakışanlar yok olur!',
      exp: 'Üst üste aynı konumda çakışan noktalar silinir, yalnızca farklı yerdekiler kalır.',
    },
  ];

  for (let i = 0; i < 22; i++) {
    const rd = ruleDefs[i % ruleDefs.length];
    const col = pick(['#0284c7', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'] as ShapeColor[], i);
    const setA = new Set<number>();
    const setB = new Set<number>();

    // Ensure non-empty result and distinct A, B, result
    while (setA.size < 4) setA.add(Math.floor(rng() * 9));
    while (setB.size < 4) setB.add(Math.floor(rng() * 9));
    // Guarantee overlap for intersection & XOR clarity
    const firstA = Array.from(setA)[0];
    setB.add(firstA);

    const expected: number[] = [];
    for (let idx = 0; idx < 9; idx++) {
      const inA = setA.has(idx);
      const inB = setB.has(idx);
      if (rd.sym === '+' && (inA || inB)) expected.push(idx);
      if (rd.sym === '∩' && inA && inB) expected.push(idx);
      if (rd.sym === '⊕' && inA !== inB) expected.push(idx);
    }

    // Build 3 guaranteed unique distractor index arrays
    const serialize = (arr: number[]) => [...arr].sort((a, b) => a - b).join(',');
    const used = new Set<string>([serialize(expected)]);
    const distractors: number[][] = [];

    const candidates = [
      Array.from(setA),
      Array.from(setB),
      Array.from({ length: 9 }, (_, k) => k).filter((k) => (setA.has(k) || setB.has(k)) && !expected.includes(k)),
      [...expected.slice(0, Math.max(0, expected.length - 1))],
      [...expected, (expected[0] ?? 0) === 4 ? 0 : 4].filter((v, idx, a) => a.indexOf(v) === idx),
      [0, 2, 6, 8],
      [1, 3, 5, 7],
    ];

    for (const cand of candidates) {
      const key = serialize(cand);
      if (cand.length > 0 && !used.has(key)) {
        used.add(key);
        distractors.push([...cand].sort((a, b) => a - b));
      }
      if (distractors.length >= 3) break;
    }

    while (distractors.length < 3) {
      const fallback = [Math.floor(rng() * 4), 4 + Math.floor(rng() * 5)].filter((v, idx, a) => a.indexOf(v) === idx);
      const key = serialize(fallback);
      if (!used.has(key)) {
        used.add(key);
        distractors.push(fallback);
      }
    }

    out.push({
      id: `ya-g-ov-${i + 1}`,
      prompt: rd.prompt,
      hint: rd.hint,
      explanation: rd.exp,
      visualType: 'shape_overlay',
      visualData: {
        gridSize: 3,
        ruleSymbol: rd.sym,
        gridA: Array.from(setA).sort((a, b) => a - b).map((idx) => ({ idx, color: col })),
        gridB: Array.from(setB).sort((a, b) => a - b).map((idx) => ({ idx, color: col })),
      },
      options: [
        { id: 'a', visual: { gridSize: 3, cells: expected.map((idx) => ({ idx, color: col })) }, isCorrect: true },
        { id: 'b', visual: { gridSize: 3, cells: distractors[0].map((idx) => ({ idx, color: col })) }, isCorrect: false },
        { id: 'c', visual: { gridSize: 3, cells: distractors[1].map((idx) => ({ idx, color: col })) }, isCorrect: false },
        { id: 'd', visual: { gridSize: 3, cells: distractors[2].map((idx) => ({ idx, color: col })) }, isCorrect: false },
      ],
    });
  }

  return out;
}

// ============================================================================
// ===== EK HAVUZ 2: YENİ SORU TÜRLERİ (çeşitliliği az etkinlikler için) ======
// ============================================================================
type NumOpt = { id: string; label: string; isCorrect: boolean };

function numberOptions(ans: number, salt: number): NumOpt[] {
  const deltas = [-2, 2, 4, -4, 1, -1, 3, 6];
  const vals: number[] = [];
  for (let k = 0; k < deltas.length && vals.length < 3; k++) {
    const v = ans + deltas[(k + salt) % deltas.length];
    if (v > 0 && v !== ans && !vals.includes(v)) vals.push(v);
  }
  return [ans, ...vals].map((v, i) => ({ id: String.fromCharCode(97 + i), label: String(v), isCorrect: i === 0 }));
}

function labelOptions(correct: string, wrongs: string[]): NumOpt[] {
  return [correct, ...wrongs.slice(0, 3)].map((l, i) => ({
    id: String.fromCharCode(97 + i),
    label: l,
    isCorrect: i === 0,
  }));
}

// ---------------------------------------------------------------------------
// ÖN TEST: 3x3 matriste yeni kural aileleri
// ---------------------------------------------------------------------------
export function generateMoreOnTest(): QuizVisualQuestion[] {
  type Cell = { shape: ShapeKind; color: ShapeColor; count?: number; rotation?: number; innerDot?: boolean };
  type P = { S: ShapeKind[]; C: ShapeColor[]; RS: ShapeKind[] };
  const rotShapes: ShapeKind[] = ['triangle', 'star'];
  const rules: {
    key: string;
    prompt: string;
    hint: string;
    exp: string;
    cell: (r: number, c: number, p: P) => Cell;
  }[] = [
    {
      key: 'colshape_rowcolor',
      prompt: 'Şekil sütuna, renk satıra göre belirlenir. "?" yerine hangi kare gelmelidir?',
      hint: 'Her sütunun şekli aynı, her satırın rengi aynıdır.',
      exp: 'Üçüncü sütunun şekli ile üçüncü satırın rengi birleşir.',
      cell: (r, c, p) => ({ shape: p.S[c], color: p.C[r] }),
    },
    {
      key: 'rowcount',
      prompt: 'Aşağı indikçe adet bir artıyor; şekil ve renk sütuna göre sabit. "?" hangisi?',
      hint: 'Üçüncü satırda her karede 3 şekil olmalı.',
      exp: 'Sütun şekli ve rengi korunur, üçüncü satırda adet 3 olur.',
      cell: (r, c, p) => ({ shape: p.S[c], color: p.C[c], count: r + 1 }),
    },
    {
      key: 'cyclecount',
      prompt: 'Her satırda adetler 1-2-3 sırasını bir kare kaydırarak tekrar eder. Eksik kareyi bul.',
      hint: 'Satırlar: 1-2-3, 2-3-1, 3-1-2 şeklinde kayıyor.',
      exp: 'Üçüncü satır 3-1-2 şeklindedir; son karede adet 2 olur.',
      cell: (r, c, p) => ({ shape: p.S[r], color: p.C[r], count: ((r + c) % 3) + 1 }),
    },
    {
      key: 'rot45',
      prompt: 'Sağa ve aşağıya gidildikçe şekil 45° saat yönünde dönüyor. "?" nasıl görünmelidir?',
      hint: 'Köşegen boyunca aynı dönüş açısı tekrar eder: 0°, 45°, 90°, 135°, 180°.',
      exp: 'Son karede satır ve sütun etkisi toplanır: 45° × 4 = 180°.',
      cell: (r, c, p) => ({ shape: p.RS[0], color: p.C[r], rotation: 45 * (r + c) }),
    },
    {
      key: 'rotrow',
      prompt: 'Her satırda şekil 90° daha fazla döndürülmüş. Şekil ve renk sütuna göre değişir. "?" hangisi?',
      hint: 'Aşağı indikçe dönüş açısı 0°, 90°, 180° olur.',
      exp: 'Son satırda şekil 180° dönmüş olmalı; şekli ve rengi üçüncü sütundan gelir.',
      cell: (r, c, p) => ({ shape: p.RS[c % 2], color: p.C[c], rotation: 90 * r }),
    },
    {
      key: 'dotdiag',
      prompt: 'Beyaz nokta yalnızca soldan sağa çapraz kareler üzerinde yer alır. "?" karesinde ne olmalı?',
      hint: 'Çaprazın son karesi sağ alt köşedir.',
      exp: 'Sağ alt kare çaprazın üzerinde olduğu için beyaz nokta içerir.',
      cell: (r, c, p) => ({ shape: p.S[c], color: p.C[r], innerDot: r === c }),
    },
    {
      key: 'dotcol',
      prompt: 'Beyaz nokta yalnızca üçüncü sütundaki karelerde bulunur. "?" karesi nasıl olmalı?',
      hint: 'Üçüncü sütundaki iki kareye bak; ikisinde de nokta var.',
      exp: 'Sağ alt kare üçüncü sütunda olduğu için beyaz nokta içerir.',
      cell: (r, c, p) => ({ shape: p.S[(r + c) % 3], color: p.C[r], innerDot: c === 2 }),
    },
    {
      key: 'latin_colorcount',
      prompt: 'Her satır ve sütunda şekiller farklı, aşağı indikçe adet artıyor. Renk sütuna göre sabit. "?" hangisi?',
      hint: 'Önce eksik şekli (satır/sütunda olmayan), sonra rengi ve adedi belirle.',
      exp: 'Satır ve sütunda eksik kalan şekil, sütun rengi ve 3 adetle birleşir.',
      cell: (r, c, p) => ({ shape: p.S[(r + c) % 3], color: p.C[c], count: r + 1 }),
    },
  ];

  const out: QuizVisualQuestion[] = [];
  const rng = makeRng(771133);
  let idx = 0;
  for (let round = 0; round < 5; round++) {
    for (const rule of rules) {
      idx++;
      const isRot = rule.key.startsWith('rot');
      const s0 = Math.floor(rng() * SHAPES.length);
      const S = [0, 1, 2].map((k) => SHAPES[(s0 + k * (1 + (round % 2))) % SHAPES.length]);
      if (new Set(S).size < 3) continue;
      const c0 = Math.floor(rng() * COLORS.length);
      const C = [0, 1, 2].map((k) => COLORS[(c0 + k * (1 + (round % 2))) % COLORS.length]);
      if (new Set(C).size < 3) continue;
      const RS = round % 2 === 0 ? rotShapes : ([...rotShapes].reverse() as ShapeKind[]);
      const p: P = { S: isRot ? [RS[0], RS[1], RS[0]] : S, C, RS };

      const cells: (Cell | null)[] = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push(rule.cell(r, c, p));
      const ans = cells[8] as Cell;
      cells[8] = null;

      // Çeldiriciler: her biri doğru cevabın tek bir özelliğini bozar
      const cands: Cell[] = [];
      const otherShape = p.S.find((x) => x !== ans.shape) ?? ans.shape;
      const otherColor = p.C.find((x) => x !== ans.color) ?? ans.color;
      if (ans.count !== undefined) cands.push({ ...ans, count: ans.count === 1 ? 2 : ans.count - 1 });
      if (ans.rotation !== undefined) cands.push({ ...ans, rotation: (ans.rotation + 90) % 360 });
      if (ans.innerDot !== undefined) cands.push({ ...ans, innerDot: !ans.innerDot });
      cands.push({ ...ans, color: otherColor });
      cands.push({ ...ans, shape: otherShape });
      if (ans.count !== undefined) cands.push({ ...ans, count: ans.count === 3 ? 1 : ans.count + 1, color: otherColor });
      if (ans.rotation !== undefined) cands.push({ ...ans, rotation: (ans.rotation + 180) % 360, shape: otherShape });
      cands.push({ ...ans, shape: otherShape, color: otherColor });

      const seen = new Set<string>([JSON.stringify(ans)]);
      const wrongs: Cell[] = [];
      for (const cd of cands) {
        const k = JSON.stringify(cd);
        if (!seen.has(k) && wrongs.length < 3) {
          seen.add(k);
          wrongs.push(cd);
        }
      }
      if (wrongs.length < 3) continue;

      out.push({
        id: `ot-m-${idx}`,
        prompt: rule.prompt,
        hint: rule.hint,
        explanation: rule.exp,
        visualType: 'matrix3x3',
        visualData: { cells },
        options: [ans, ...wrongs].map((v, i) => ({ id: String.fromCharCode(97 + i), visual: v, isCorrect: i === 0 })),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// ÖRÜNTÜ: yeni sayı kuralları, harf/gün/ay dizileri, şekil dizileri, yeni sınıflama
// ---------------------------------------------------------------------------
const TR_ALPHA = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];
const TR_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function generateMoreOruntu(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const rng = makeRng(556677);
  const NUM_COLOR = '#0284c7';
  const numItems = (nums: number[]) => [
    ...nums.map((n) => ({ kind: 'number', text: String(n), color: NUM_COLOR })),
    { kind: 'question', text: '?', color: '#d97706' },
  ];

  // A. Yeni sayı kuralları
  type NumRule = { hard: boolean; build: (j: number) => { nums: number[]; ans: number; hint: string; exp: string } };
  const numRules: NumRule[] = [
    {
      hard: true,
      build: (j) => {
        const k = 1 + (j % 5);
        const nums = [k, k + 1, k + 2, k + 3].map((x) => x * x);
        const ans = (k + 4) * (k + 4);
        return { nums, ans, hint: 'Sayılar ardışık sayıların kendisiyle çarpımıdır (kare sayılar).', exp: `Kare sayılar: ${nums.join(', ')}, sıradaki ${k + 4} × ${k + 4} = ${ans}.` };
      },
    },
    {
      hard: true,
      build: (j) => {
        const T = (n: number) => (n * (n + 1)) / 2;
        const k = 1 + (j % 3);
        const nums = [T(k), T(k + 1), T(k + 2), T(k + 3)];
        const ans = T(k + 4);
        return { nums, ans, hint: 'Farklar sırayla bir artıyor.', exp: `Farklar ${k + 1}, ${k + 2}, ${k + 3}, ${k + 4} olarak artar; cevap ${ans}.` };
      },
    },
    {
      hard: false,
      build: (j) => {
        const a = 1 + (j % 5);
        return { nums: [a, a * 2, a * 4, a * 8], ans: a * 16, hint: 'Her sayı bir öncekinin iki katıdır.', exp: `Her adımda 2 ile çarpılır: ${a * 8} × 2 = ${a * 16}.` };
      },
    },
    {
      hard: true,
      build: (j) => {
        const a = 1 + (j % 2);
        return { nums: [a, a * 3, a * 9, a * 27], ans: a * 81, hint: 'Her sayı bir öncekinin üç katıdır.', exp: `Her adımda 3 ile çarpılır: ${a * 27} × 3 = ${a * 81}.` };
      },
    },
    {
      hard: false,
      build: (j) => {
        const step = 3 + (j % 5);
        const start = 40 + (j % 4) * 5;
        const nums = [0, 1, 2, 3].map((i) => start - step * i);
        const ans = start - step * 4;
        return { nums, ans, hint: 'Sayılar küçülüyor. Aradaki farkı bul.', exp: `Her adımda ${step} azalır: ${nums[3]} − ${step} = ${ans}.` };
      },
    },
    {
      hard: true,
      build: (j) => {
        const a = 1 + (j % 3);
        const n1 = a * 2 + 1;
        const n2 = n1 * 2 + 1;
        const n3 = n2 * 2 + 1;
        const ans = n3 * 2 + 1;
        return { nums: [a, n1, n2, n3], ans, hint: 'Önce 2 ile çarp, sonra 1 ekle.', exp: `Kural: × 2 + 1. ${n3} × 2 + 1 = ${ans}.` };
      },
    },
    {
      hard: true,
      build: (j) => {
        const a = 2 + (j % 4);
        const b = 20 + (j % 3) * 5;
        const d = 3 + (j % 3);
        const e = 2 + (j % 2);
        // iki ayrı dizi iç içe: a, a+d, a+2d ... ve b, b-e, b-2e ...
        const nums = [a, b, a + d, b - e, a + 2 * d];
        const ans = b - 2 * e;
        return { nums, ans, hint: 'Sayılar iki ayrı dizi gibi: tek sıradakiler ve çift sıradakiler.', exp: `1., 3., 5. sayılar +${d} artar; 2., 4., 6. sayılar −${e} azalır. Cevap ${ans}.` };
      },
    },
    {
      hard: false,
      build: (j) => {
        const a0 = 10 + (j % 5);
        const d = 9 + (j % 3);
        const nums = [a0, a0 + d, a0 + d + (d - 1), a0 + d + (d - 1) + (d - 2)];
        const ans = nums[3] + (d - 3);
        return { nums, ans, hint: 'Artış miktarı her adımda 1 azalıyor.', exp: `Farklar ${d}, ${d - 1}, ${d - 2}, ${d - 3} şeklinde azalır. Cevap ${ans}.` };
      },
    },
  ];
  let nIdx = 0;
  for (let round = 0; round < 3; round++) {
    numRules.forEach((rule, ri) => {
      nIdx++;
      const b = rule.build(round * 3 + ri);
      out.push({
        id: `od-m-${rule.hard ? 'hard-' : ''}n-${nIdx}`,
        prompt: 'Sayı örüntüsündeki kuralı yakala ve "?" kutusuna gelecek sayıyı seç.',
        hint: b.hint,
        explanation: b.exp,
        visualType: 'sequence_row',
        visualData: { items: numItems(b.nums) },
        options: numberOptions(b.ans, nIdx),
      });
    });
  }

  // B. Harf örüntüleri (Türk alfabesi)
  for (let i = 0; i < 8; i++) {
    const step = 1 + (i % 3);
    const dir = i % 4 === 3 ? -1 : 1;
    const start = dir === 1 ? Math.floor(rng() * (TR_ALPHA.length - 5 * step)) : 14 + Math.floor(rng() * 10);
    const idxs = [0, 1, 2, 3, 4].map((k) => start + dir * step * k);
    if (idxs.some((x) => x < 0 || x >= TR_ALPHA.length)) continue;
    const letters = idxs.map((x) => TR_ALPHA[x]);
    const ans = letters[4];
    const wrongs = [TR_ALPHA[idxs[4] + 1], TR_ALPHA[idxs[4] - 1], TR_ALPHA[idxs[4] + 2]].filter((x) => x && x !== ans);
    if (wrongs.length < 3) continue;
    out.push({
      id: `od-m-let-${i + 1}`,
      prompt: 'Alfabedeki harflerin sırasına bakarak "?" yerine gelecek harfi bul.',
      hint: 'Harfler arasında atlanan harf sayısını say.',
      explanation: `Harfler her adımda alfabede ${step} ${dir === 1 ? 'ileri' : 'geri'} gidiyor. Cevap ${ans}.`,
      visualType: 'sequence_row',
      visualData: {
        items: [
          ...letters.slice(0, 4).map((l, k) => ({ kind: 'badge', text: l, color: ['#0284c7', '#10b981', '#f59e0b', '#a855f7'][k] })),
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: labelOptions(ans, wrongs),
    });
  }

  // C. Harf + sayı birlikte ilerleyen örüntüler
  for (let i = 0; i < 6; i++) {
    const start = 2 * i;
    const stepL = 1 + (i % 2);
    const items = [0, 1, 2, 3].map((k) => `${TR_ALPHA[start + stepL * k]}${k + 1 + (i % 3)}`);
    const ans = `${TR_ALPHA[start + stepL * 4]}${5 + (i % 3)}`;
    const wrongs = [
      `${TR_ALPHA[start + stepL * 4]}${4 + (i % 3)}`,
      `${TR_ALPHA[start + stepL * 4 + 1]}${5 + (i % 3)}`,
      `${TR_ALPHA[start + stepL * 3]}${5 + (i % 3)}`,
    ];
    out.push({
      id: `od-m-lns-${i + 1}`,
      prompt: 'Harf ve sayı birlikte ilerliyor. "?" yerine gelecek kutuyu bul.',
      hint: 'Harfler ve sayılar ayrı ayrı kendi kuralıyla ilerler.',
      explanation: `Harfler alfabede ${stepL} adım ilerler, sayılar 1 artar. Cevap ${ans}.`,
      visualType: 'sequence_row',
      visualData: {
        items: [
          ...items.map((t, k) => ({ kind: 'badge', text: t, color: ['#0284c7', '#10b981', '#f59e0b', '#a855f7'][k] })),
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: labelOptions(ans, wrongs),
    });
  }

  // D. Gün ve ay örüntüleri
  for (let i = 0; i < 6; i++) {
    const step = 1 + (i % 3);
    const s = (i * 2) % 7;
    const list = [0, 1, 2, 3, 4].map((k) => TR_DAYS[(s + step * k) % 7]);
    const ans = list[4];
    const wrongs = [TR_DAYS[(s + step * 4 + 1) % 7], TR_DAYS[(s + step * 4 + 6) % 7], TR_DAYS[(s + step * 4 + 2) % 7]];
    out.push({
      id: `od-m-day-${i + 1}`,
      prompt: 'Haftanın günleri belli bir kuralla ilerliyor. "?" yerine hangi gün gelmelidir?',
      hint: 'Günler arasında kaç gün atlandığını say. Pazar’dan sonra Pazartesi gelir.',
      explanation: `Her adımda ${step} gün ileri gidiliyor. Cevap ${ans}.`,
      visualType: 'sequence_row',
      visualData: {
        items: [
          ...list.slice(0, 4).map((t, k) => ({ kind: 'badge', text: t, color: ['#0284c7', '#10b981', '#f59e0b', '#a855f7'][k] })),
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: labelOptions(ans, wrongs),
    });
  }
  for (let i = 0; i < 6; i++) {
    const step = 2 + (i % 3);
    const s = (i * 3) % 12;
    const list = [0, 1, 2, 3, 4].map((k) => TR_MONTHS[(s + step * k) % 12]);
    const ans = list[4];
    const wrongs = [TR_MONTHS[(s + step * 4 + 1) % 12], TR_MONTHS[(s + step * 4 + 11) % 12], TR_MONTHS[(s + step * 4 + 2) % 12]];
    out.push({
      id: `od-m-mon-${i + 1}`,
      prompt: 'Aylar belli bir kuralla ilerliyor. "?" yerine hangi ay gelmelidir?',
      hint: 'Aylar arasında kaç ay atlandığını say. Aralık’tan sonra Ocak gelir.',
      explanation: `Her adımda ${step} ay ileri gidiliyor. Cevap ${ans}.`,
      visualType: 'sequence_row',
      visualData: {
        items: [
          ...list.slice(0, 4).map((t, k) => ({ kind: 'badge', text: t, color: ['#0284c7', '#10b981', '#f59e0b', '#a855f7'][k] })),
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: labelOptions(ans, wrongs),
    });
  }

  // E. Şekil dizileri: dönme, renk döngüsü, şekil döngüsü, adet döngüsü
  for (let i = 0; i < 16; i++) {
    const kind = i % 4;
    const shapeA = SHAPES[(i + 1) % SHAPES.length];
    const shapeB = SHAPES[(i + 3) % SHAPES.length];
    const shapeC = SHAPES[(i + 5) % SHAPES.length];
    const col = COLORS[i % COLORS.length];
    const colB = COLORS[(i + 2) % COLORS.length];
    const colC = COLORS[(i + 4) % COLORS.length];
    const toItems = (cells: any[]) => [
      ...cells.map((cell) => ({ kind: 'shape', cell })),
      { kind: 'question', text: '?', color: '#d97706' },
    ];
    if (kind === 0) {
      const sh = i % 8 < 4 ? 'triangle' : 'star';
      const step = i % 8 < 4 ? 90 : 45;
      const seq = [0, 1, 2, 3].map((k) => ({ shape: sh as ShapeKind, color: col, rotation: (k * step) % 360 }));
      const ans = { shape: sh as ShapeKind, color: col, rotation: (4 * step) % 360 };
      out.push({
        id: `od-m-sh-${i + 1}`,
        prompt: `Şekil her adımda ${step}° dönüyor. "?" yerine gelecek kutuyu bul.`,
        hint: 'Her kutuda şeklin duruşunu bir öncekiyle karşılaştır.',
        explanation: `Dönüş açısı ${step}° artar; sıradaki kutuda ${(4 * step) % 360}° olmalı.`,
        visualType: 'sequence_row',
        visualData: { items: toItems(seq) },
        options: [
          { id: 'a', visual: ans, isCorrect: true },
          { id: 'b', visual: { ...ans, rotation: (ans.rotation + step) % 360 }, isCorrect: false },
          { id: 'c', visual: { ...ans, color: colB }, isCorrect: false },
          { id: 'd', visual: { ...ans, shape: shapeA === sh ? shapeB : shapeA }, isCorrect: false },
        ],
      });
    } else if (kind === 1) {
      const cols = [col, colB, colC];
      const seq = [0, 1, 2, 3].map((k) => ({ shape: shapeA, color: cols[k % 3] }));
      out.push({
        id: `od-m-sh-${i + 1}`,
        prompt: 'Üç rengin döngüsünü bul ve "?" yerine gelecek kutuyu seç.',
        hint: 'Renkler her üç kutuda bir baştan tekrar ediyor.',
        explanation: 'Döngü: 1. renk, 2. renk, 3. renk, tekrar 1. renk... Sıradaki kutu 2. renktedir.',
        visualType: 'sequence_row',
        visualData: { items: toItems(seq) },
        options: [
          { id: 'a', visual: { shape: shapeA, color: colB }, isCorrect: true },
          { id: 'b', visual: { shape: shapeA, color: col }, isCorrect: false },
          { id: 'c', visual: { shape: shapeA, color: colC }, isCorrect: false },
          { id: 'd', visual: { shape: shapeB, color: colB }, isCorrect: false },
        ],
      });
    } else if (kind === 2) {
      const shapes = [shapeA, shapeB, shapeC];
      const seq = [0, 1, 2, 3, 4].map((k) => ({ shape: shapes[k % 3], color: col }));
      out.push({
        id: `od-m-sh-${i + 1}`,
        prompt: 'Şekillerin sıralanış düzenini bul. "?" yerine hangi şekil gelmelidir?',
        hint: 'Aynı üç şekil sırayla tekrar ediyor.',
        explanation: 'Şekiller 3’lü döngüyle tekrar eder; sıradaki şekil döngünün 3. şeklidir.',
        visualType: 'sequence_row',
        visualData: { items: toItems(seq) },
        options: [
          { id: 'a', visual: { shape: shapeC, color: col }, isCorrect: true },
          { id: 'b', visual: { shape: shapeA, color: col }, isCorrect: false },
          { id: 'c', visual: { shape: shapeB, color: col }, isCorrect: false },
          { id: 'd', visual: { shape: shapeC, color: colB }, isCorrect: false },
        ],
      });
    } else {
      const seq = [1, 2, 3, 1, 2].map((n) => ({ shape: shapeA, color: col, count: n }));
      out.push({
        id: `od-m-sh-${i + 1}`,
        prompt: 'Şekil sayısı belli bir düzenle artıp baştan başlıyor. "?" yerine gelecek kutuyu bul.',
        hint: '1-2-3 sayıları tekrar ediyor.',
        explanation: 'Adetler 1, 2, 3, 1, 2 şeklinde ilerler; sıradaki kutuda 3 şekil olmalı.',
        visualType: 'sequence_row',
        visualData: { items: toItems(seq) },
        options: [
          { id: 'a', visual: { shape: shapeA, color: col, count: 3 }, isCorrect: true },
          { id: 'b', visual: { shape: shapeA, color: col, count: 1 }, isCorrect: false },
          { id: 'c', visual: { shape: shapeA, color: col, count: 2 }, isCorrect: false },
          { id: 'd', visual: { shape: shapeB, color: col, count: 3 }, isCorrect: false },
        ],
      });
    }
  }

  // F. Yeni sınıflama (farklı olanı bul) kümeleri
  const sets: { words: [string, string, string, string]; odd: number; reason: string }[] = [
    { words: ['Elma', 'Armut', 'Muz', 'Havuç'], odd: 3, reason: 'Havuç sebzedir, diğerleri meyvedir.' },
    { words: ['Masa', 'Sandalye', 'Dolap', 'Kalem'], odd: 3, reason: 'Kalem mobilya değil, kırtasiye malzemesidir.' },
    { words: ['Kırmızı', 'Mavi', 'Yeşil', 'Kare'], odd: 3, reason: 'Kare bir şekildir, diğerleri renktir.' },
    { words: ['Kartal', 'Güvercin', 'Serçe', 'Balık'], odd: 3, reason: 'Balık uçmaz, diğerleri kuştur.' },
    { words: ['Gömlek', 'Pantolon', 'Ceket', 'Tabak'], odd: 3, reason: 'Tabak giysi değildir, mutfak eşyasıdır.' },
    { words: ['Otobüs', 'Tren', 'Bisiklet', 'Gemi'], odd: 3, reason: 'Gemi deniz taşıtıdır, diğerleri kara taşıtıdır.' },
    { words: ['2', '4', '6', '7'], odd: 3, reason: '7 tek sayıdır, diğerleri çift sayıdır.' },
    { words: ['5', '10', '15', '18'], odd: 3, reason: '18, 5’in katı değildir.' },
    { words: ['Pazartesi', 'Salı', 'Mart', 'Cuma'], odd: 2, reason: 'Mart bir aydır, diğerleri haftanın günüdür.' },
    { words: ['Güneş', 'Yıldız', 'Ay', 'Bulut'], odd: 3, reason: 'Bulut gök cismi değil, atmosferdeki su damlacıklarıdır.' },
    { words: ['Kitap', 'Defter', 'Dergi', 'Ekmek'], odd: 3, reason: 'Ekmek yenir, diğerleri okunur veya yazılır.' },
    { words: ['Aslan', 'Kaplan', 'Zürafa', 'Panter'], odd: 2, reason: 'Zürafa otçuldur, diğerleri etçil kedigillerdir.' },
    { words: ['Kalp', 'Akciğer', 'Mide', 'Kaş'], odd: 3, reason: 'Kaş dışarıdan görünür, diğerleri iç organdır.' },
    { words: ['Dünya', 'Mars', 'Venüs', 'Güneş'], odd: 3, reason: 'Güneş bir yıldızdır, diğerleri gezegendir.' },
    { words: ['Yaz', 'Kış', 'Pazar', 'Sonbahar'], odd: 2, reason: 'Pazar haftanın günüdür, diğerleri mevsimdir.' },
    { words: ['Doktor', 'Öğretmen', 'Hasta', 'Pilot'], odd: 2, reason: 'Hasta bir meslek değildir.' },
    { words: ['Piyano', 'Davul', 'Keman', 'Resim'], odd: 3, reason: 'Resim çalgı değil, bir sanat çalışmasıdır.' },
    { words: ['Su', 'Süt', 'Ayran', 'Ekmek'], odd: 3, reason: 'Ekmek içecek değil, yiyecektir.' },
    { words: ['Ördek', 'Kaz', 'Tavuk', 'Köpek'], odd: 3, reason: 'Köpek kümes hayvanı değildir.' },
    { words: ['Üçgen', 'Kare', 'Küp', 'Daire'], odd: 2, reason: 'Küp üç boyutlu bir cisimdir, diğerleri düz şekildir.' },
    { words: ['Silgi', 'Kalem', 'Cetvel', 'Bardak'], odd: 3, reason: 'Bardak kırtasiye malzemesi değildir.' },
    { words: ['İstanbul', 'Ankara', 'Paris', 'İzmir'], odd: 2, reason: 'Paris Türkiye’de değil, Fransa’dadır.' },
    { words: ['Gül', 'Lale', 'Papatya', 'Çam'], odd: 3, reason: 'Çam ağaçtır, diğerleri çiçektir.' },
    { words: ['Kedi', 'Köpek', 'At', 'Kuş'], odd: 3, reason: 'Kuşun kanatları ve gagası vardır; diğerleri dört ayaklı memelidir.' },
  ];
  const colors4 = ['#0284c7', '#10b981', '#f59e0b', '#a855f7'];
  sets.forEach((ws, i) => {
    // Farklı olanın yeri her soruda aynı olmasın diye konumunu değiştir
    const target = (i * 5 + 1) % 4;
    const words = [...ws.words];
    [words[ws.odd], words[target]] = [words[target], words[ws.odd]];
    out.push({
      id: `od-m-w-${i + 1}`,
      prompt: 'Bu dört kavramdan üçü aynı gruba aittir. Grubu bozan kavram hangisidir?',
      hint: 'Kavramların ortak özelliğini ve türünü düşün.',
      explanation: ws.reason,
      visualType: 'sequence_row',
      visualData: { items: words.map((w, k) => ({ kind: 'badge', text: w, color: colors4[k] })) },
      options: words.map((w, k) => ({ id: String.fromCharCode(97 + k), label: w, isCorrect: k === target })),
    });
  });

  return out;
}

// ---------------------------------------------------------------------------
// ÇOKLU ZEKA: sözel analoji + sayı makinesi
// ---------------------------------------------------------------------------
export function generateMoreCokluZeka(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const bc = ['#0284c7', '#10b981', '#f59e0b', '#a855f7'];
  const analogies: { a: string; b: string; c: string; d: string; wrong: string[]; why: string }[] = [
    { a: 'Kuş', b: 'Uçmak', c: 'Balık', d: 'Yüzmek', wrong: ['Koşmak', 'Yemek', 'Uyumak'], why: 'Kuş uçar, balık yüzer.' },
    { a: 'Göz', b: 'Görmek', c: 'Kulak', d: 'Duymak', wrong: ['Koklamak', 'Tatmak', 'Yürümek'], why: 'Göz ile görürüz, kulak ile duyarız.' },
    { a: 'Kedi', b: 'Miyav', c: 'Köpek', d: 'Hav', wrong: ['Cik cik', 'Mee', 'Möö'], why: 'Kedi miyavlar, köpek havlar.' },
    { a: 'Gece', b: 'Karanlık', c: 'Gündüz', d: 'Aydınlık', wrong: ['Yıldız', 'Uyku', 'Soğuk'], why: 'Gece karanlık, gündüz aydınlıktır.' },
    { a: 'Diş', b: 'Fırça', c: 'Saç', d: 'Tarak', wrong: ['Sabun', 'Şapka', 'Havlu'], why: 'Dişi fırçayla, saçı tarakla temizler/düzeltiriz.' },
    { a: 'El', b: 'Eldiven', c: 'Ayak', d: 'Çorap', wrong: ['Şapka', 'Atkı', 'Gözlük'], why: 'Eli eldiven, ayağı çorap korur.' },
    { a: 'Kış', b: 'Soğuk', c: 'Yaz', d: 'Sıcak', wrong: ['Kar', 'Yağmur', 'Rüzgâr'], why: 'Kış soğuk, yaz sıcak bir mevsimdir.' },
    { a: 'Kalem', b: 'Yazmak', c: 'Makas', d: 'Kesmek', wrong: ['Çizmek', 'Yapıştırmak', 'Boyamak'], why: 'Kalemle yazılır, makasla kesilir.' },
    { a: 'Arı', b: 'Bal', c: 'İnek', d: 'Süt', wrong: ['Yumurta', 'Yün', 'Peynir'], why: 'Arı bal, inek süt verir.' },
    { a: 'Arı', b: 'Kovan', c: 'Kuş', d: 'Yuva', wrong: ['Havuz', 'Ahır', 'Kafes'], why: 'Arı kovanda, kuş yuvada yaşar.' },
    { a: 'Saat', b: 'Zaman', c: 'Termometre', d: 'Sıcaklık', wrong: ['Ağırlık', 'Uzunluk', 'Hız'], why: 'Saat zamanı, termometre sıcaklığı ölçer.' },
    { a: 'Doktor', b: 'Hastane', c: 'Öğretmen', d: 'Okul', wrong: ['Market', 'Tiyatro', 'Park'], why: 'Doktor hastanede, öğretmen okulda çalışır.' },
    { a: 'Kitap', b: 'Okumak', c: 'Müzik', d: 'Dinlemek', wrong: ['Yazmak', 'Boyamak', 'Koklamak'], why: 'Kitap okunur, müzik dinlenir.' },
    { a: 'Ay', b: 'Gece', c: 'Güneş', d: 'Gündüz', wrong: ['Yıldız', 'Bulut', 'Sabah'], why: 'Ay geceleri, Güneş gündüz görünür.' },
  ];
  analogies.forEach((an, i) => {
    out.push({
      id: `cz-m-v-${i + 1}`,
      prompt: 'İlk iki kavram arasındaki ilişkiyi bul ve aynı ilişkiye göre "?" yerine gelecek kavramı seç.',
      hint: 'İlk çiftin birbirleriyle nasıl bağlantılı olduğunu bir cümleyle söyle.',
      explanation: an.why,
      visualType: 'sequence_row',
      visualData: {
        items: [
          { kind: 'badge', text: an.a, color: bc[0] },
          { kind: 'badge', text: an.b, color: bc[1] },
          { kind: 'badge', text: an.c, color: bc[2] },
          { kind: 'question', text: '?', color: '#d97706' },
        ],
      },
      options: labelOptions(an.d, an.wrong),
    });
  });

  // Sayı makinesi: iki çift gösterilir, üçüncü sayıya kural uygulanır
  const machines: { f: (x: number) => number; name: string; xs: number[] }[] = [
    { f: (x) => x * 2, name: '2 ile çarpılır', xs: [2, 3, 5, 4, 6, 7] },
    { f: (x) => x * 3, name: '3 ile çarpılır', xs: [2, 3, 5, 4, 1, 6] },
    { f: (x) => x + 5, name: '5 eklenir', xs: [4, 7, 10, 12, 3, 9] },
    { f: (x) => x + 8, name: '8 eklenir', xs: [2, 6, 9, 11, 5, 4] },
    { f: (x) => x - 3, name: '3 çıkarılır', xs: [10, 15, 20, 12, 18, 9] },
    { f: (x) => x * 5, name: '5 ile çarpılır', xs: [2, 4, 3, 6, 5, 1] },
    { f: (x) => x * x, name: 'kendisiyle çarpılır', xs: [2, 3, 4, 5, 6, 1] },
    { f: (x) => x * 2 + 1, name: '2 ile çarpılıp 1 eklenir', xs: [1, 3, 4, 5, 6, 2] },
  ];
  let k = 0;
  machines.forEach((m, mi) => {
    for (let rep = 0; rep < 2; rep++) {
      const xs = [m.xs[rep], m.xs[rep + 2], m.xs[rep + 4]];
      if (xs.some((x) => x === undefined)) continue;
      k++;
      const ans = m.f(xs[2]);
      out.push({
        id: `cz-m-n-${k}`,
        prompt: 'Sayı makinesi her sayıya aynı kuralı uyguluyor. "?" yerine hangi sayı çıkmalıdır?',
        hint: 'İlk iki çifte bakarak makinenin kuralını bul.',
        explanation: `Makinede sayı ${m.name}. Bu yüzden ${xs[2]} sayısı ${ans} olur.`,
        visualType: 'sequence_row',
        visualData: {
          items: [
            { kind: 'number', text: String(xs[0]), color: bc[0] },
            { kind: 'number', text: String(m.f(xs[0])), color: bc[1] },
            { kind: 'number', text: String(xs[1]), color: bc[0] },
            { kind: 'number', text: String(m.f(xs[1])), color: bc[1] },
            { kind: 'number', text: String(xs[2]), color: bc[0] },
            { kind: 'question', text: '?', color: '#d97706' },
          ],
        },
        options: numberOptions(ans, mi + rep),
      });
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// KAĞIT KATLAMA: rastgele yerleştirilmiş yeni delik konumları
// ---------------------------------------------------------------------------
export function generateMoreKagitKatlama(): QuizVisualQuestion[] {
  const rng = makeRng(990011);
  const out: QuizVisualQuestion[] = [];
  const foldLineMap: Record<string, 'v' | 'h' | 'vh' | 'diag'> = { half_v: 'v', half_h: 'h', quarter: 'vh', diag_tr: 'diag' };
  const foldLabelMap: Record<string, string> = {
    half_v: 'dikey eksenden ikiye',
    half_h: 'yatay eksenden ikiye',
    quarter: 'önce dikey sonra yatay dörde',
    diag_tr: 'köşegen boyunca ikiye',
  };
  const kinds: ('half_v' | 'half_h' | 'quarter' | 'diag_tr')[] = ['half_v', 'half_h', 'quarter', 'diag_tr'];
  const shapes: ('circle' | 'diamond' | 'triangle')[] = ['circle', 'diamond', 'triangle'];
  const rint = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1));

  const randomHole = (ft: (typeof kinds)[number]): HoleSpec => {
    const shape = shapes[Math.floor(rng() * 3)];
    if (ft === 'half_v') return { x: rint(16, 38), y: rint(20, 80), shape };
    if (ft === 'half_h') return { x: rint(20, 80), y: rint(18, 38), shape };
    if (ft === 'quarter') return { x: rint(16, 38), y: rint(16, 38), shape };
    // diag_tr: x > y + 12
    for (let t = 0; t < 40; t++) {
      const x = rint(34, 84);
      const y = rint(18, 64);
      if (x > y + 12) return { x, y, shape };
    }
    return { x: 76, y: 24, shape };
  };

  let guard = 0;
  while (out.length < 28 && guard++ < 400) {
    const ft = kinds[out.length % 4];
    const n = out.length % 3 === 2 ? 2 : 1;
    const holes: HoleSpec[] = [randomHole(ft)];
    if (n === 2) {
      const h2 = randomHole(ft);
      if (Math.abs(h2.x - holes[0].x) + Math.abs(h2.y - holes[0].y) < 18) continue;
      holes.push(h2);
    }
    const foldLine = foldLineMap[ft];
    const correctHoles = unfoldPaperHoles(ft, holes);
    const wrongMissing = holes;
    const wrongAxis =
      ft === 'half_v'
        ? unfoldPaperHoles('half_h', holes.map((h) => ({ ...h, y: 26 })))
        : ft === 'half_h'
        ? unfoldPaperHoles('half_v', holes.map((h) => ({ ...h, x: 26 })))
        : ft === 'quarter'
        ? unfoldPaperHoles('half_v', holes)
        : [...holes, ...holes.map((h) => ({ ...h, x: 100 - h.x }))];
    const wrongShifted = correctHoles.map((h) => ({
      ...h,
      x: h.x < 50 ? Math.min(44, h.x + 14) : Math.max(56, h.x - 14),
      y: h.y < 50 ? Math.min(44, h.y + 12) : Math.max(56, h.y - 12),
    }));
    const sigs = new Set([correctHoles, wrongMissing, wrongAxis, wrongShifted].map((h) => JSON.stringify(h)));
    if (sigs.size < 4) continue;

    out.push({
      id: `kk-m-${out.length + 1}`,
      prompt: `Kare kağıt ${foldLabelMap[ft]} katlanıp işaretli yerden deliniyor. Kağıt açıldığında nasıl görünür?`,
      hint: 'Her kat izini bir ayna çizgisi gibi düşün ve delikleri karşı tarafa simetrik yansıt.',
      explanation: `Kağıt tamamen açıldığında kat izlerine göre simetrik toplam ${correctHoles.length} delik oluşur.`,
      visualType: 'paper_fold',
      visualData: { foldType: ft, holes },
      options: [
        { id: 'a', visual: { foldLine, holes: correctHoles }, isCorrect: true },
        { id: 'b', visual: { foldLine, holes: wrongMissing }, isCorrect: false },
        { id: 'c', visual: { foldLine, holes: wrongAxis }, isCorrect: false },
        { id: 'd', visual: { foldLine, holes: wrongShifted }, isCorrect: false },
      ],
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// AYNA SİMETRİSİ: farklı tohumla yeni 3x3 mozaikler (6 renkli blok dahil)
// ---------------------------------------------------------------------------
export function generateMoreAyna(): QuizVisualQuestion[] {
  const rng = makeRng(445566);
  const out: QuizVisualQuestion[] = [];
  const blockCols = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#a855f7'];
  let attempts = 0;
  while (out.length < 30 && attempts < 800) {
    attempts++;
    const cells: (string | null)[] = Array(9).fill(null);
    const activeCount = 4 + (out.length % 3); // 4, 5 ya da 6 renkli blok
    const indices = new Set<number>();
    while (indices.size < activeCount) indices.add(Math.floor(rng() * 9));
    for (const idx of indices) cells[idx] = blockCols[Math.floor(rng() * blockCols.length)];
    const sSame = cells.map((x) => x || '_').join(',');
    const sX = reflectX3x3(cells);
    const sY = reflectY3x3(cells);
    const s180 = rotate180_3x3(cells);
    if (new Set([sSame, sX, sY, s180]).size !== 4) continue;
    const axis: 'vertical' | 'horizontal' = out.length % 2 === 0 ? 'horizontal' : 'vertical';
    const correctTransform = axis === 'vertical' ? 'reflectX' : 'reflectY';
    const wrong1 = axis === 'vertical' ? 'reflectY' : 'reflectX';
    const spec: MirrorMosaicSpec = { cells };
    const fid = `more_m_${out.length + 1}`;
    out.push({
      id: `as-m-${out.length + 1}`,
      prompt:
        axis === 'vertical'
          ? 'Renkli desen DİKEY bir aynaya konuyor. Aynadaki görüntüsü hangisidir?'
          : 'Renkli desen YATAY bir aynaya konuyor. Aynadaki görüntüsü hangisidir?',
      hint:
        axis === 'vertical'
          ? 'Dikey aynada sol ile sağ yer değiştirir.'
          : 'Yatay aynada üst ile alt yer değiştirir.',
      explanation:
        axis === 'vertical'
          ? 'Sol sütun sağa, sağ sütun sola geçer; satırlar yerinde kalır.'
          : 'Üst satır alta, alt satır üste geçer; sütunlar yerinde kalır.',
      visualType: 'mirror_axis',
      visualData: { figureId: fid, axis, spec },
      options: [
        { id: 'a', visual: { figureId: fid, spec, transform: correctTransform }, isCorrect: true },
        { id: 'b', visual: { figureId: fid, spec, transform: 'same' }, isCorrect: false },
        { id: 'c', visual: { figureId: fid, spec, transform: wrong1 }, isCorrect: false },
        { id: 'd', visual: { figureId: fid, spec, transform: 'rotate180' }, isCorrect: false },
      ],
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// DESEN: yeni renk paletleriyle ek mozaik karolar
// ---------------------------------------------------------------------------
export function generateMoreDesen(): QuizVisualQuestion[] {
  const out: QuizVisualQuestion[] = [];
  const motifs: PatternMotifKind[] = ['corner_tri', 'diag_band', 'arc_ring', 'double_stripe', 'star_dot', 'chevron_l', 'diamond_edge', 'petal_drop', 'step_corner', 'ring_dot'];
  const palettes: { bg: string; c1: string; c2: string }[] = [
    { bg: '#172554', c1: '#fbbf24', c2: '#f472b6' },
    { bg: '#451a03', c1: '#fdba74', c2: '#a3e635' },
    { bg: '#052e16', c1: '#86efac', c2: '#f9a8a8' },
    { bg: '#f1f5f9', c1: '#0f766e', c2: '#be185d' },
    { bg: '#fef3c7', c1: '#b45309', c2: '#1d4ed8' },
    { bg: '#ecfeff', c1: '#0e7490', c2: '#ea580c' },
  ];
  for (let i = 0; i < 30; i++) {
    const motif = motifs[(i * 3 + 1) % motifs.length];
    const pal = palettes[(i + Math.floor(i / 6)) % palettes.length];
    const spec: PatternTileSpec = { motif, bg: pal.bg, c1: pal.c1, c2: pal.c2 };
    const pid = `more_${motif}_${i}`;
    out.push({
      id: `ds-m-${i + 1}`,
      prompt: 'Simetrik 2×2 mozaik karosunun sağ alt köşesindeki "?" parçasını tamamla.',
      hint: 'Sol üst karonun 180° dönmüş (merkeze bakan) halini renk uyumuyla bul.',
      explanation: 'Merkezdeki desen bütünlüğünü sağlayan tek parça hem yön hem renk olarak tam oturur.',
      visualType: 'pattern_tile',
      visualData: { patternId: pid, spec },
      options: [
        { id: 'a', visual: { patternId: pid, spec, piece: 'exact' }, isCorrect: true },
        { id: 'b', visual: { patternId: pid, spec, piece: 'wrong_rot' }, isCorrect: false },
        { id: 'c', visual: { patternId: pid, spec, piece: 'swapped' }, isCorrect: false },
        { id: 'd', visual: { patternId: pid, spec, piece: 'missing_accent' }, isCorrect: false },
      ],
    });
  }
  return out;
}