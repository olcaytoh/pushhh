import type { QuizVisualQuestion } from './bilsemActivitiesData';

// ============================================================================
// TOHUMLU RASTGELE ÜRETEÇ & YARDIMCILAR
// ============================================================================
const makeRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const pick = <T,>(arr: readonly T[], rnd: () => number): T =>
  arr[Math.floor(rnd() * arr.length)];

const shuffle = <T,>(arr: readonly T[], rnd: () => number): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

type Dir = 'U' | 'D' | 'L' | 'R';
const DIR_DELTA: Record<Dir, [number, number]> = {
  U: [-1, 0],
  D: [1, 0],
  L: [0, -1],
  R: [0, 1],
};
const ALL_DIRS: Dir[] = ['U', 'D', 'L', 'R'];

const buildSnakePath = (
  rows: number,
  cols: number,
  start: [number, number],
  len: number,
  forbidden: Set<string>,
  rnd: () => number
): { arrows: Dir[]; cells: [number, number][] } | null => {
  for (let attempt = 0; attempt < 80; attempt++) {
    let [r, c] = start;
    const arrows: Dir[] = [];
    const cells: [number, number][] = [];
    const visited = new Set<string>([`${r},${c}`]);
    let ok = true;

    for (let step = 0; step < len; step++) {
      const candidates = shuffle(ALL_DIRS, rnd).filter((d) => {
        const [dr, dc] = DIR_DELTA[d];
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
        const key = `${nr},${nc}`;
        if (visited.has(key) || forbidden.has(key)) return false;
        // Basit yılan kuralı: yeni hücre kendi önceki hücresi dışında başka yol hücresine değmesin (tek anlamlı rota!)
        for (const nd of ALL_DIRS) {
          const [ndr, ndc] = DIR_DELTA[nd];
          const ar = nr + ndr;
          const ac = nc + ndc;
          if (ar === r && ac === c) continue;
          if (visited.has(`${ar},${ac}`)) return false;
        }
        return true;
      });
      if (candidates.length === 0) {
        ok = false;
        break;
      }
      const chosen = candidates[0];
      const [dr, dc] = DIR_DELTA[chosen];
      r += dr;
      c += dc;
      arrows.push(chosen);
      cells.push([r, c]);
      visited.add(`${r},${c}`);
    }

    if (ok && arrows.length === len) {
      return { arrows, cells };
    }
  }
  return null;
};

// ============================================================================
// 1. Q20 (grid_path_encode) & Q12 (grid_path_x) — YÖN ALGORİTMA
// ============================================================================
export const generateGridPathEncodeQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const rows = 5;
  const cols = 7;
  const start: [number, number] = [2, 3];
  const colorPairs: [string, string, string, string][] = [
    ['#fbbf24', '#f87171', 'Sarı', 'Kırmızı'],
    ['#38bdf8', '#f59e0b', 'Mavi', 'Turuncu'],
    ['#a78bfa', '#34d399', 'Mor', 'Yeşil'],
    ['#f472b6', '#60a5fa', 'Pembe', 'Mavi'],
  ];

  const out: QuizVisualQuestion[] = [];
  const usedKeys = new Set<string>();
  let guard = 0;

  while (out.length < count && guard < count * 30) {
    guard++;
    const len1 = 4 + (out.length % 3); // 4..6
    const len2 = 4 + ((out.length + 1) % 3); // 4..6
    const p1 = buildSnakePath(rows, cols, start, len1, new Set(), rnd);
    if (!p1) continue;

    // İkinci yol birinci yola değmesin diye birinci yolun tüm hücrelerini ve komşularını koru
    const forbid = new Set<string>();
    for (const [r, c] of p1.cells) {
      forbid.add(`${r},${c}`);
    }
    const p2 = buildSnakePath(rows, cols, start, len2, forbid, rnd);
    if (!p2) continue;

    const sig = `${p1.arrows.join('')}|${p2.arrows.join('')}`;
    if (usedKeys.has(sig)) continue;
    usedKeys.add(sig);

    const correctStr = p2.arrows.join('');
    const distractors: Dir[][] = [];
    const seenOpts = new Set<string>([correctStr]);

    // Çeldiriciler: 1 adım değiştirme, ters çevirme, iki komşu oku takas etme
    const candidates: Dir[][] = [];
    for (let i = 0; i < p2.arrows.length; i++) {
      for (const alt of ALL_DIRS) {
        if (alt !== p2.arrows[i]) {
          const copy = [...p2.arrows];
          copy[i] = alt;
          candidates.push(copy);
        }
      }
    }
    for (let i = 0; i < p2.arrows.length - 1; i++) {
      if (p2.arrows[i] !== p2.arrows[i + 1]) {
        const copy = [...p2.arrows];
        [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
        candidates.push(copy);
      }
    }
    candidates.push([...p2.arrows].reverse());

    for (const cand of shuffle(candidates, rnd)) {
      const k = cand.join('');
      if (!seenOpts.has(k)) {
        seenOpts.add(k);
        distractors.push(cand);
        if (distractors.length === 3) break;
      }
    }
    if (distractors.length < 3) continue;

    const [c1, c2, name1, name2] = colorPairs[out.length % colorPairs.length];
    const arrowMap: Record<Dir, string> = { U: '↑', D: '↓', L: '←', R: '→' };
    const correctHuman = p2.arrows.map((d) => arrowMap[d]).join(' ');

    out.push({
      id: `${prefix}-enc-${out.length + 1}`,
      prompt: `Yeşil daireden başlayarak ${name1.toLowerCase()} yolun ok kodu verilmiştir. Buna göre ${name2.toLowerCase()} yolun ok kodu hangisidir?`,
      hint: `Yeşil dairenin hemen yanındaki ${name2.toLowerCase()} kareden başla ve boyalı kareleri tek tek takip et.`,
      explanation: `Yeşil daireden başlayıp ${name2.toLowerCase()} yolu adım adım izlediğimizde doğru ok dizisi ${correctHuman} olur.`,
      visualType: 'grid_path_encode',
      visualData: {
        rows,
        cols,
        start,
        givenCells: p1.cells,
        targetCells: p2.cells,
        givenArrows: p1.arrows,
        givenColor: c1,
        targetColor: c2,
      },
      options: [
        { id: 'a', visual: { arrows: p2.arrows }, isCorrect: true },
        { id: 'b', visual: { arrows: distractors[0] }, isCorrect: false },
        { id: 'c', visual: { arrows: distractors[1] }, isCorrect: false },
        { id: 'd', visual: { arrows: distractors[2] }, isCorrect: false },
      ],
    });
  }
  return out;
};

export const generateGridPathXQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const rows = 5;
  const cols = 7;
  const start: [number, number] = [2, 3];
  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();
  let guard = 0;

  while (out.length < count && guard < count * 30) {
    guard++;
    const len = 4 + (out.length % 3); // 4..6
    const path = buildSnakePath(rows, cols, start, len, new Set(), rnd);
    if (!path) continue;
    const sig = path.arrows.join('');
    if (used.has(sig)) continue;
    used.add(sig);

    const endCell = path.cells[path.cells.length - 1];
    const [er, ec] = endCell;

    // Çeldirici X konumları: hedefe 1–2 kare yakın ama farklı kareler
    const nearTargets: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === er && c === ec) continue;
        if (r === start[0] && c === start[1]) continue;
        const dist = Math.abs(r - er) + Math.abs(c - ec);
        if (dist >= 1 && dist <= 2) nearTargets.push([r, c]);
      }
    }
    const pickedWrong = shuffle(nearTargets, rnd).slice(0, 3);
    if (pickedWrong.length < 3) continue;

    out.push({
      id: `${prefix}-gpx-${out.length + 1}`,
      prompt: 'Yeşil daireden başlayıp yukarıdaki yeşil okları sırayla takip edersen kırmızı X hangi karede olur?',
      hint: 'Her yeşil ok 1 kare hareket ettirir. Yeşil daireden tek tek sayarak ilerle!',
      explanation: `Yeşil daireden başlayarak ${path.arrows.length} oku sırayla uyguladığımızda ${er + 1}. satır ${ec + 1}. sütundaki kareye ulaşırız.`,
      visualType: 'grid_path_x',
      visualData: {
        rows,
        cols,
        start,
        arrows: path.arrows,
      },
      options: [
        { id: 'a', visual: { rows, cols, start, target: endCell }, isCorrect: true },
        { id: 'b', visual: { rows, cols, start, target: pickedWrong[0] }, isCorrect: false },
        { id: 'c', visual: { rows, cols, start, target: pickedWrong[1] }, isCorrect: false },
        { id: 'd', visual: { rows, cols, start, target: pickedWrong[2] }, isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 2. Q13: GÖRSEL MEYVE DENKLEMİ (fruit_equation)
// ============================================================================
const FRUIT_PAIRS: { a: string; b: string; aName: string; bName: string }[] = [
  { a: 'apple', b: 'pear', aName: 'elma', bName: 'armut' },
  { a: 'orange', b: 'strawberry', aName: 'portakal', bName: 'çilek' },
  { a: 'pear', b: 'lemon', aName: 'armut', bName: 'limon' },
  { a: 'apple', b: 'plum', aName: 'elma', bName: 'erik' },
  { a: 'orange', b: 'lemon', aName: 'portakal', bName: 'limon' },
  { a: 'plum', b: 'strawberry', aName: 'erik', bName: 'çilek' },
];

export const generateFruitEquationQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  // 1 A = ratio * B  (ratio = 2 veya 3)
  // Row 1: a1 A + ratio B = (a1 + 1) A
  // Row 2: a2 A + (k*ratio + rem) B = (a2 + k) A + rem B
  const templates = [
    { ratio: 2, a1: 2, a2: 3, k: 1, rem: 1 }, // 2A+2B=3A, 3A+3B = 4A+1B (Q13 birebir kalıbı!)
    { ratio: 2, a1: 1, a2: 2, k: 1, rem: 1 }, // 1A+2B=2A, 2A+3B = 3A+1B
    { ratio: 2, a1: 2, a2: 1, k: 2, rem: 0 }, // 2A+2B=3A, 1A+4B = 3A
    { ratio: 2, a1: 1, a2: 2, k: 2, rem: 1 }, // 1A+2B=2A, 2A+5B = 4A+1B
    { ratio: 3, a1: 1, a2: 2, k: 1, rem: 1 }, // 1A+3B=2A, 2A+4B = 3A+1B
    { ratio: 3, a1: 2, a2: 1, k: 1, rem: 2 }, // 2A+3B=3A, 1A+5B = 2A+2B
    { ratio: 2, a1: 3, a2: 2, k: 1, rem: 1 }, // 3A+2B=4A, 2A+3B = 3A+1B
    { ratio: 2, a1: 1, a2: 3, k: 1, rem: 1 }, // 1A+2B=2A, 3A+3B = 4A+1B
  ];

  const makeItems = (fa: string, na: number, fb: string, nb: number) => [
    ...Array.from({ length: na }, () => fa),
    ...Array.from({ length: nb }, () => fb),
  ];

  const out: QuizVisualQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const pair = FRUIT_PAIRS[i % FRUIT_PAIRS.length];
    const tpl = templates[Math.floor(i / FRUIT_PAIRS.length) % templates.length];
    const { ratio, a1, a2, k, rem } = tpl;

    const eq1Left = makeItems(pair.a, a1, pair.b, ratio);
    const eq1Right = makeItems(pair.a, a1 + 1, pair.b, 0);
    const b2 = k * ratio + rem;
    const eq2Left = makeItems(pair.a, a2, pair.b, b2);

    const ansA = a2 + k;
    const ansB = rem;
    const targetVal = ansA * ratio + ansB;

    // Farklı toplam değere sahip 3 çeldirici üret (hiçbiri gizlice eşit olmasın!)
    const distractorPairs: [number, number][] = [];
    const seenPair = new Set<string>([`${ansA},${ansB}`]);
    const poolPairs: [number, number][] = [
      [ansA - 1, ansB + 1],
      [ansA + 1, ansB],
      [ansA, ansB + 1],
      [Math.max(1, ansA - 1), ansB],
      [ansA + 1, Math.max(0, ansB - 1)],
      [ansA - 1, ansB + 2],
      [ansA + 2, 0],
      [ansA, Math.max(0, ansB + 2)],
    ];
    for (const [da, db] of shuffle(poolPairs, rnd)) {
      if (da < 0 || db < 0 || da + db < 2 || da + db > 6) continue;
      if (da * ratio + db === targetVal) continue; // denk olanı reddet!
      const pk = `${da},${db}`;
      if (!seenPair.has(pk)) {
        seenPair.add(pk);
        distractorPairs.push([da, db]);
        if (distractorPairs.length === 3) break;
      }
    }

    out.push({
      id: `${prefix}-feq-${i + 1}`,
      prompt: 'Üstteki eşitliğe göre alttaki "?" yerine hangi meyve grubu gelmelidir?',
      hint: `İlk eşitlikte her iki taraftan ${a1} ${pair.aName} çıkarırsan ${ratio} ${pair.bName} = 1 ${pair.aName} olduğunu görürsün.`,
      explanation: `İlk satırdan ${ratio} ${pair.bName} = 1 ${pair.aName} bulunur. İkinci satırdaki ${b2} ${pair.bName} yerine ${k} ${pair.aName}${rem > 0 ? ` ve ${rem} ${pair.bName}` : ''} yazarsak sonuç ${ansA} ${pair.aName}${ansB > 0 ? ` + ${ansB} ${pair.bName}` : ''} olur.`,
      visualType: 'fruit_equation',
      visualData: { eq1Left, eq1Right, eq2Left },
      options: [
        { id: 'a', visual: { items: makeItems(pair.a, ansA, pair.b, ansB) }, isCorrect: true },
        { id: 'b', visual: { items: makeItems(pair.a, distractorPairs[0][0], pair.b, distractorPairs[0][1]) }, isCorrect: false },
        { id: 'c', visual: { items: makeItems(pair.a, distractorPairs[1][0], pair.b, distractorPairs[1][1]) }, isCorrect: false },
        { id: 'd', visual: { items: makeItems(pair.a, distractorPairs[2][0], pair.b, distractorPairs[2][1]) }, isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 3. Q17: KUTULU HARF / SEMBOL ŞERİDİ (letter_strip)
// ============================================================================
const LETTER_ALPHABETS: string[][] = [
  ['T', 'Z', 'X', 'Y'],
  ['A', 'B', 'C', 'D'],
  ['K', 'L', 'M', 'N'],
  ['P', 'R', 'S', 'T'],
  ['E', 'F', 'G', 'H'],
  ['M', 'N', 'P', 'R'],
  ['B', 'D', 'F', 'H'],
  ['S', 'T', 'V', 'Y'],
];

export const generateLetterStripQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 4 && out.length < count; i++) {
    const baseAlpha = shuffle(LETTER_ALPHABETS[i % LETTER_ALPHABETS.length], rnd);
    const patternKind = out.length % 4;
    let full: string[];
    let ruleHint: string;
    let ruleExp: string;

    if (patternKind === 0) {
      // 4'lü tekrar: A B C D A B C D A [?] -> B (Q17 birebir!)
      const [a, b, c, d] = baseAlpha;
      const len = 10;
      full = Array.from({ length: len }, (_, k) => [a, b, c, d][k % 4]);
      ruleHint = `Harfler 4’erli blok hâlinde (${a}-${b}-${c}-${d}) tekrar ediyor.`;
      ruleExp = `Şerit ${a}, ${b}, ${c}, ${d} şeklinde 4’lü tekrar etmektedir; bu yüzden "?" yerine ${full[len - 1]} gelir.`;
    } else if (patternKind === 1) {
      // 3'lü tekrar: A B C A B C A B [?] -> C
      const [a, b, c] = baseAlpha;
      const len = 9;
      full = Array.from({ length: len }, (_, k) => [a, b, c][k % 3]);
      ruleHint = `Harfler 3’erli blok hâlinde (${a}-${b}-${c}) tekrar ediyor.`;
      ruleExp = `Örüntü ${a}, ${b}, ${c} sırasıyla tekrar ettiğinden "?" yerine ${full[len - 1]} gelmelidir.`;
    } else if (patternKind === 2) {
      // ABAC tekrar: A B A C A B A [?] -> C
      const [a, b, c] = baseAlpha;
      const cycle = [a, b, a, c];
      const len = 8 + (out.length % 2);
      full = Array.from({ length: len }, (_, k) => cycle[k % 4]);
      ruleHint = `Her adımdan sonra ${a} harfi dönüyor: ${a}-${b}-${a}-${c} kuralını incele.`;
      ruleExp = `Dizi ${a}-${b}-${a}-${c} kalıbını tekrar ettiği için "?" yerine ${full[len - 1]} gelir.`;
    } else {
      // AABBCC tekrar veya çiftli simetri: A B C C B A A B [?] -> C
      const [a, b, c] = baseAlpha;
      const cycle = [a, b, c, c, b, a];
      const len = 9;
      full = Array.from({ length: len }, (_, k) => cycle[k % 6]);
      ruleHint = `Harfler önce ileri (${a}-${b}-${c}), sonra geri (${c}-${b}-${a}) sıralanıyor.`;
      ruleExp = `İleri-geri ayna örüntüsü (${a}-${b}-${c}-${c}-${b}-${a}) devam ettiğinde "?" yerine ${full[len - 1]} gelir.`;
    }

    const sig = full.join('');
    if (used.has(sig)) continue;
    used.add(sig);

    const answer = full[full.length - 1];
    const cells: (string | null)[] = [...full.slice(0, -1), null];
    const wrongs = baseAlpha.filter((ch) => ch !== answer).slice(0, 3);

    out.push({
      id: `${prefix}-lst-${out.length + 1}`,
      prompt: 'Şeritteki harf örüntüsünü bul! Soru işareti (?) yerine hangi harf gelmelidir?',
      hint: ruleHint,
      explanation: ruleExp,
      visualType: 'letter_strip',
      visualData: { cells },
      options: [
        { id: 'a', label: answer, isCorrect: true },
        { id: 'b', label: wrongs[0], isCorrect: false },
        { id: 'c', label: wrongs[1], isCorrect: false },
        { id: 'd', label: wrongs[2], isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 4. Q15: 3B RENKLİ PRİZMA ÜSTTEN GÖRÜNÜMÜ (colored_tower_top)
// ============================================================================
const TOWER_PALETTE = [
  '#ef4444', // kırmızı
  '#38bdf8', // açık mavi
  '#a855f7', // mor
  '#facc15', // sarı
  '#22c55e', // yeşil
  '#f97316', // turuncu
  '#94a3b8', // gri
];

export const generateColoredTowerTopQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  // 2x3 veya 3x3 ızgarada her bloğun üstten ve önden 100% görünür olduğu düzenler:
  // Arka satır (r=0) her zaman ön satırdan (r=1) en az 1 kat daha yüksek!
  const shapes: { r: number; c: number; h: number }[][] = [
    // 5 bloklu çapraz/T/L yığınları
    [{ r: 0, c: 0, h: 3 }, { r: 0, c: 1, h: 4 }, { r: 0, c: 2, h: 3 }, { r: 1, c: 0, h: 1 }, { r: 1, c: 2, h: 2 }],
    [{ r: 0, c: 0, h: 4 }, { r: 0, c: 1, h: 3 }, { r: 1, c: 0, h: 2 }, { r: 1, c: 1, h: 1 }, { r: 1, c: 2, h: 2 }],
    [{ r: 0, c: 1, h: 4 }, { r: 0, c: 2, h: 3 }, { r: 1, c: 0, h: 2 }, { r: 1, c: 1, h: 2 }, { r: 1, c: 2, h: 1 }],
    [{ r: 0, c: 0, h: 3 }, { r: 0, c: 2, h: 4 }, { r: 1, c: 0, h: 1 }, { r: 1, c: 1, h: 2 }, { r: 1, c: 2, h: 1 }],
    [{ r: 0, c: 0, h: 4 }, { r: 0, c: 1, h: 3 }, { r: 0, c: 2, h: 2 }, { r: 1, c: 1, h: 1 }, { r: 2, c: 1, h: 1 }],
    [{ r: 0, c: 0, h: 4 }, { r: 0, c: 1, h: 4 }, { r: 1, c: 1, h: 2 }, { r: 1, c: 2, h: 3 }, { r: 2, c: 2, h: 1 }],
    [{ r: 0, c: 1, h: 4 }, { r: 0, c: 2, h: 4 }, { r: 1, c: 0, h: 3 }, { r: 1, c: 1, h: 2 }, { r: 2, c: 0, h: 1 }],
    [{ r: 0, c: 0, h: 3 }, { r: 0, c: 1, h: 4 }, { r: 0, c: 2, h: 3 }, { r: 1, c: 1, h: 2 }, { r: 1, c: 2, h: 1 }],
  ];

  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 5 && out.length < count; i++) {
    const layout = shapes[i % shapes.length];
    const colors = shuffle(TOWER_PALETTE, rnd).slice(0, layout.length);
    const maxR = Math.max(...layout.map((x) => x.r)) + 1;
    const maxC = Math.max(...layout.map((x) => x.c)) + 1;

    const grid3d: ({ h: number; color: string } | null)[][] = Array.from({ length: maxR }, () =>
      Array.from({ length: maxC }, () => null)
    );
    const topGrid: (string | null)[][] = Array.from({ length: maxR }, () =>
      Array.from({ length: maxC }, () => null)
    );

    layout.forEach((b, idx) => {
      grid3d[b.r][b.c] = { h: b.h, color: colors[idx] };
      topGrid[b.r][b.c] = colors[idx];
    });

    const sig = JSON.stringify(topGrid);
    if (used.has(sig)) continue;
    used.add(sig);

    // 3 farklı çeldirici üstten görünüm üret:
    // 1) İki bloğun rengini takas et
    const swapGrid = (g: (string | null)[][], i1: number, i2: number) => {
      const cp = g.map((row) => [...row]);
      const p1 = layout[i1];
      const p2 = layout[i2];
      [cp[p1.r][p1.c], cp[p2.r][p2.c]] = [cp[p2.r][p2.c], cp[p1.r][p1.c]];
      return cp;
    };
    // 2) Yatay ayna (sol-sağ ters)
    const mirrorH = (g: (string | null)[][]) => g.map((row) => [...row].reverse());
    // 3) Dikey ayna (ön-arka ters)
    const mirrorV = (g: (string | null)[][]) => [...g].reverse().map((row) => [...row]);

    const distractorCandidates = [
      swapGrid(topGrid, 0, 1),
      swapGrid(topGrid, 1, 3),
      mirrorH(topGrid),
      mirrorV(topGrid),
      swapGrid(topGrid, 2, 4),
    ];

    const seenOpt = new Set<string>([sig]);
    const distractors: (string | null)[][][] = [];
    for (const cand of distractorCandidates) {
      const k = JSON.stringify(cand);
      if (!seenOpt.has(k)) {
        seenOpt.add(k);
        distractors.push(cand);
        if (distractors.length === 3) break;
      }
    }
    if (distractors.length < 3) continue;

    out.push({
      id: `${prefix}-top-${out.length + 1}`,
      prompt: 'Yukarıdaki renkli blokların üstten görünümünü bul!',
      hint: 'Arkadaki yüksek bloklar üst satırda, öndeki bloklar alt satırda; soldakiler solda, sağdakiler sağda görünür.',
      explanation: 'Bloklara tam tepeden baktığımızda ön-arka ve sol-sağ renk yerleşimleri birebir korunan tek seçenek doğrudur.',
      visualType: 'colored_tower_top',
      visualData: { grid: grid3d },
      options: [
        { id: 'a', visual: { grid: topGrid }, isCorrect: true },
        { id: 'b', visual: { grid: distractors[0] }, isCorrect: false },
        { id: 'c', visual: { grid: distractors[1] }, isCorrect: false },
        { id: 'd', visual: { grid: distractors[2] }, isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 5. Q8: DÜZ RENKLİ KÜP AÇILIMI & KATLANMIŞ 3B KÜP (colored_cube_net)
// ============================================================================
// Kesin 3B normal vektörleri (açık artı ağı dıştan görünüm, arkaya doğru katlanır):
type FaceKey = 'top' | 'left' | 'center' | 'right' | 'bottom' | 'tail';
type Vec3 = [number, number, number];
const FACE_NORMALS: Record<FaceKey, Vec3> = {
  center: [0, 0, 1],
  tail: [0, 0, -1],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
};

const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const vecEq = (a: Vec3, b: Vec3) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

// Fiziksel olarak geçerli 24 (top, left, right) yüz üçlüsünü önceden hesapla:
// İzometrik küpte Left × Right = Top sağ-el kuralını sağlamak ZORUNDADIR!
const FACE_KEYS: FaceKey[] = ['top', 'left', 'center', 'right', 'bottom', 'tail'];
const VALID_CUBE_TRIPLES: [FaceKey, FaceKey, FaceKey][] = [];
const INVALID_CUBE_TRIPLES: [FaceKey, FaceKey, FaceKey][] = [];

for (const t of FACE_KEYS) {
  for (const l of FACE_KEYS) {
    if (l === t) continue;
    for (const r of FACE_KEYS) {
      if (r === t || r === l) continue;
      const valid = vecEq(cross3(FACE_NORMALS[l], FACE_NORMALS[r]), FACE_NORMALS[t]);
      if (valid) {
        VALID_CUBE_TRIPLES.push([t, l, r]);
      } else {
        INVALID_CUBE_TRIPLES.push([t, l, r]);
      }
    }
  }
}

const CUBE_COLOR_SETS: string[][] = [
  ['#16a34a', '#f97316', '#facc15', '#78350f', '#a3e635', '#065f46'], // Q8 tonları
  ['#ef4444', '#38bdf8', '#facc15', '#9333ea', '#22c55e', '#f97316'],
  ['#0284c7', '#fbbf24', '#f43f5e', '#10b981', '#8b5cf6', '#334155'],
  ['#e11d48', '#22d3ee', '#a3e635', '#f59e0b', '#6366f1', '#78350f'],
  ['#2563eb', '#fb923c', '#f472b6', '#4ade80', '#eab308', '#6b21a8'],
];

export const generateColoredCubeNetQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 5 && out.length < count; i++) {
    const palette = shuffle(CUBE_COLOR_SETS[i % CUBE_COLOR_SETS.length], rnd);
    const faces: Record<FaceKey, string> = {
      top: palette[0],
      left: palette[1],
      center: palette[2],
      right: palette[3],
      bottom: palette[4],
      tail: palette[5],
    };

    const validTriple = pick(VALID_CUBE_TRIPLES, rnd);
    const sig = `${palette.join(',')}|${validTriple.join('-')}`;
    if (used.has(sig)) continue;
    used.add(sig);

    // 3 geçersiz üçlü seç: en az 1 tanesi karşıt yüzleri yan yana getirsin, en az 1 tanesi ters yönlü (chiral) olsun!
    const mirrored = [validTriple[0], validTriple[2], validTriple[1]] as [FaceKey, FaceKey, FaceKey];
    const others = shuffle(
      INVALID_CUBE_TRIPLES.filter(
        ([t, l, r]) => !(t === mirrored[0] && l === mirrored[1] && r === mirrored[2])
      ),
      rnd
    );
    const wrongTriples = [mirrored, others[0], others[1]];

    const toCubeVisual = ([t, l, r]: [FaceKey, FaceKey, FaceKey]) => ({
      top: faces[t],
      left: faces[l],
      right: faces[r],
    });

    out.push({
      id: `${prefix}-ccn-${out.length + 1}`,
      prompt: 'Yukarıdaki renkli açılım katlandığında hangi 3B küp elde edilebilir?',
      hint: 'Açılımda aralarında bir kare bulunan renkler birbirinin tam karşısında kalır ve asla yan yana görünmez. Ayrıca komşu yüzlerin saat yönü sırasına dikkat et!',
      explanation: 'Karşılıklı yüzler aynı anda görünemez ve komşu 3 yüzün katlanma yönü yalnızca doğru küp seçeneğinde tutarlıdır.',
      visualType: 'colored_cube_net',
      visualData: { faces },
      options: [
        { id: 'a', visual: toCubeVisual(validTriple), isCorrect: true },
        { id: 'b', visual: toCubeVisual(wrongTriples[0]), isCorrect: false },
        { id: 'c', visual: toCubeVisual(wrongTriples[1]), isCorrect: false },
        { id: 'd', visual: toCubeVisual(wrongTriples[2]), isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 6. Q5: IZGARA AYNA SİMETRİSİ (grid_mirror)
// ============================================================================
export const generateGridMirrorQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  // Sol yarı (6x5 dikey ayna için c ∈ 0..2, r ∈ 0..4) asimetrik şekiller
  const leftShapes: [number, number][][] = [
    [[1, 1], [1, 2], [2, 1], [2, 2], [3, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2], [3, 2]],
    [[1, 1], [2, 0], [2, 1], [2, 2], [3, 1]],
    [[0, 2], [1, 2], [2, 1], [2, 2], [3, 0], [3, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 2], [2, 1], [2, 2], [3, 1], [4, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]],
    [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 2], [3, 1]],
    [[1, 1], [1, 2], [2, 0], [2, 1], [3, 0]],
  ];

  const colors = ['#fde047', '#38bdf8', '#fb923c', '#4ade80', '#f472b6', '#a78bfa'];
  const normKey = (cells: [number, number][]) =>
    [...cells]
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .map(([r, c]) => `${r},${c}`)
      .join(';');

  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 4 && out.length < count; i++) {
    const axis: 'vertical' | 'horizontal' = i % 3 === 2 ? 'horizontal' : 'vertical';
    const baseLeft = leftShapes[i % leftShapes.length];
    const color = colors[i % colors.length];

    if (axis === 'vertical') {
      const rows = 5;
      const cols = 6;
      const correctRight: [number, number][] = baseLeft.map(([r, c]) => [r, cols - 1 - c]);
      const fullCorrect = [...baseLeft, ...correctRight];
      const sig = `v|${normKey(baseLeft)}|${color}`;
      if (used.has(sig)) continue;
      used.add(sig);

      // Çeldiriciler
      const shiftCopy: [number, number][] = baseLeft.map(([r, c]) => [r, c + 3]);
      const flipVRight: [number, number][] = correctRight.map(([r, c]) => [rows - 1 - r, c]);
      const shiftDown: [number, number][] = correctRight.map(([r, c]) => [(r + 1) % rows, c]);
      const dropOne: [number, number][] = correctRight.slice(0, -1);
      const shiftLeft: [number, number][] = correctRight.map(([r, c]) => [r, Math.min(cols - 1, Math.max(3, c - 1))]);

      const cands = [shiftCopy, flipVRight, shiftDown, dropOne, shiftLeft];
      const correctKey = normKey(correctRight);
      const seen = new Set<string>([correctKey]);
      const wrongs: [number, number][][] = [];
      for (const cand of shuffle(cands, rnd)) {
        const k = normKey(cand);
        if (!seen.has(k)) {
          seen.add(k);
          wrongs.push([...baseLeft, ...cand]);
          if (wrongs.length === 3) break;
        }
      }
      if (wrongs.length < 3) continue;

      out.push({
        id: `${prefix}-gm-${out.length + 1}`,
        prompt: 'Kırmızı dikey ayna çizgisine göre şeklin doğru simetrisini bul!',
        hint: 'Kırmızı çizgiye en yakın boyalı kareler sağ tarafta da çizgiye aynı uzaklıkta (bitişik) olmalıdır.',
        explanation: 'Dikey ayna yansımasında sol taraftaki her kare, kırmızı çizgiden eşit uzaklıkta sağ tarafa yansır.',
        visualType: 'grid_mirror',
        visualData: { rows, cols, axis: 'vertical', cells: baseLeft, color },
        options: [
          { id: 'a', visual: { rows, cols, axis: 'vertical', cells: fullCorrect, color }, isCorrect: true },
          { id: 'b', visual: { rows, cols, axis: 'vertical', cells: wrongs[0], color }, isCorrect: false },
          { id: 'c', visual: { rows, cols, axis: 'vertical', cells: wrongs[1], color }, isCorrect: false },
          { id: 'd', visual: { rows, cols, axis: 'vertical', cells: wrongs[2], color }, isCorrect: false },
        ],
      });
    } else {
      // Yatay ayna: 6 satır x 5 sütun, üst yarı r ∈ 0..2
      const rows = 6;
      const cols = 5;
      const baseTop: [number, number][] = baseLeft.map(([r, c]) => [c, r]);
      const correctBot: [number, number][] = baseTop.map(([r, c]) => [rows - 1 - r, c]);
      const fullCorrect = [...baseTop, ...correctBot];
      const sig = `h|${normKey(baseTop)}|${color}`;
      if (used.has(sig)) continue;
      used.add(sig);

      const shiftCopy: [number, number][] = baseTop.map(([r, c]) => [r + 3, c]);
      const flipHBot: [number, number][] = correctBot.map(([r, c]) => [r, cols - 1 - c]);
      const shiftRight: [number, number][] = correctBot.map(([r, c]) => [r, (c + 1) % cols]);
      const dropOne: [number, number][] = correctBot.slice(0, -1);

      const cands = [shiftCopy, flipHBot, shiftRight, dropOne];
      const correctKey = normKey(correctBot);
      const seen = new Set<string>([correctKey]);
      const wrongs: [number, number][][] = [];
      for (const cand of shuffle(cands, rnd)) {
        const k = normKey(cand);
        if (!seen.has(k)) {
          seen.add(k);
          wrongs.push([...baseTop, ...cand]);
          if (wrongs.length === 3) break;
        }
      }
      if (wrongs.length < 3) continue;

      out.push({
        id: `${prefix}-gm-${out.length + 1}`,
        prompt: 'Kırmızı yatay ayna çizgisine göre şeklin doğru simetrisini bul!',
        hint: 'Kırmızı çizgiye yakın olan üst kareler, çizginin hemen altında aynı sütunda yer almalıdır.',
        explanation: 'Yatay ayna yansımasında üstteki her kare aynı sütunda kalıp çizgiden eşit uzaklıkta alta yansır.',
        visualType: 'grid_mirror',
        visualData: { rows, cols, axis: 'horizontal', cells: baseTop, color },
        options: [
          { id: 'a', visual: { rows, cols, axis: 'horizontal', cells: fullCorrect, color }, isCorrect: true },
          { id: 'b', visual: { rows, cols, axis: 'horizontal', cells: wrongs[0], color }, isCorrect: false },
          { id: 'c', visual: { rows, cols, axis: 'horizontal', cells: wrongs[1], color }, isCorrect: false },
          { id: 'd', visual: { rows, cols, axis: 'horizontal', cells: wrongs[2], color }, isCorrect: false },
        ],
      });
    }
  }
  return out;
};

// ============================================================================
// 7. Q9: RENKLİ DAİRE - RAKAM ŞİFRE TABLOSU (color_digit_cipher)
// ============================================================================
const ORB_PALETTES: string[][] = [
  ['#9333ea', '#f97316', '#16a34a'], // Mor, Turuncu, Yeşil (Q9 birebir!)
  ['#0284c7', '#ef4444', '#facc15'],
  ['#ec4899', '#14b8a6', '#6366f1'],
  ['#f59e0b', '#22c55e', '#e11d48'],
  ['#7c3aed', '#06b6d4', '#84cc16', '#f97316'],
];

export const generateColorDigitCipherQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 5 && out.length < count; i++) {
    const colors = ORB_PALETTES[i % ORB_PALETTES.length];
    const digitsPool = shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9'], rnd).slice(0, colors.length);
    const legend = colors.map((color, idx) => ({ color, digit: digitsPool[idx] }));
    const colorToDigit = new Map(legend.map((x) => [x.color, x.digit]));

    // 4 hücreli hedef renk dizisi (en az 2 farklı renk, mümkünse hepsi kullanılsın)
    const targetColors: string[] = [];
    for (let k = 0; k < 4; k++) {
      targetColors.push(colors[(k + Math.floor(rnd() * colors.length)) % colors.length]);
    }
    if (new Set(targetColors).size < 2) continue;

    const correctDigits = targetColors.map((c) => colorToDigit.get(c)!);
    const correctStr = correctDigits.join('');
    const sig = `${digitsPool.join('')}|${correctStr}`;
    if (used.has(sig)) continue;
    used.add(sig);

    // 3 çeldirici 4-basamaklı kod
    const seen = new Set<string>([correctStr]);
    const wrongs: string[][] = [];
    const candList: string[][] = [
      [...correctDigits].reverse(),
      [correctDigits[1], correctDigits[0], correctDigits[2], correctDigits[3]],
      [correctDigits[0], correctDigits[2], correctDigits[1], correctDigits[3]],
      [correctDigits[0], correctDigits[1], correctDigits[3], correctDigits[2]],
      correctDigits.map((d, idx) => (idx === 0 ? digitsPool.find((x) => x !== d)! : d)),
      correctDigits.map((d, idx) => (idx === 3 ? digitsPool.find((x) => x !== d)! : d)),
    ];
    for (const c of shuffle(candList, rnd)) {
      const k = c.join('');
      if (!seen.has(k)) {
        seen.add(k);
        wrongs.push(c);
        if (wrongs.length === 3) break;
      }
    }
    if (wrongs.length < 3) continue;

    out.push({
      id: `${prefix}-cdc-${out.length + 1}`,
      prompt: 'Soldaki renk-rakam tablosuna göre sağdaki "?" kutularına hangi sayılar gelmelidir?',
      hint: 'Her renkli dairenin altındaki rakamı soldan sağa sırayla eşleştir.',
      explanation: `Renklerin karşılığı olan rakamları soldan sağa yerleştirdiğimizde doğru şifre ${correctDigits.join(' - ')} olur.`,
      visualType: 'color_digit_cipher',
      visualData: { legend, targetColors },
      options: [
        { id: 'a', visual: { digits: correctDigits }, isCorrect: true },
        { id: 'b', visual: { digits: wrongs[0] }, isCorrect: false },
        { id: 'c', visual: { digits: wrongs[1] }, isCorrect: false },
        { id: 'd', visual: { digits: wrongs[2] }, isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 8. Q19: 5x5 KESİK IZGARA TAMAMLAMA (grid_cutout)
// ============================================================================
const normalizeCoords = (pts: [number, number][]): [number, number][] => {
  const minR = Math.min(...pts.map(([r]) => r));
  const minC = Math.min(...pts.map(([, c]) => c));
  return pts
    .map(([r, c]): [number, number] => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

const rotCoords90 = (pts: [number, number][]): [number, number][] =>
  normalizeCoords(pts.map(([r, c]) => [c, -r]));

const mirrorCoords = (pts: [number, number][]): [number, number][] =>
  normalizeCoords(pts.map(([r, c]) => [r, -c]));

const coordsKey = (pts: [number, number][]) =>
  normalizeCoords(pts)
    .map(([r, c]) => `${r},${c}`)
    .join(';');

export const generateGridCutoutQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  // 5x5 ızgaranın ortasından çıkarılan bağlı çokgen boşluklar
  const cutoutShapes: [number, number][][] = [
    [[1, 1], [1, 2], [2, 1], [2, 2], [2, 3], [3, 2]],
    [[1, 1], [1, 3], [2, 1], [2, 2], [2, 3], [3, 2]],
    [[1, 2], [2, 1], [2, 2], [2, 3], [3, 1]],
    [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3]],
    [[1, 1], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2]],
    [[1, 2], [1, 3], [2, 1], [2, 2], [3, 1]],
    [[1, 1], [1, 2], [1, 3], [2, 2], [3, 1], [3, 2]],
    [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3]],
    [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
    [[1, 1], [1, 2], [2, 2], [3, 1], [3, 2], [3, 3]],
    [[1, 1], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1]],
    [[1, 2], [1, 3], [2, 2], [2, 3], [3, 1], [3, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 2], [2, 3]],
    [[1, 1], [1, 2], [2, 1], [2, 3], [3, 2], [3, 3]],
  ];

  const colors = ['#dc2626', '#0284c7', '#16a34a', '#9333ea', '#ea580c', '#0d9488'];
  const out: QuizVisualQuestion[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 4 && out.length < count; i++) {
    const rawHoles = cutoutShapes[i % cutoutShapes.length];
    const color = colors[i % colors.length];
    const correctNorm = normalizeCoords(rawHoles);
    const correctKey = coordsKey(correctNorm);
    const sig = `${correctKey}|${color}`;
    if (used.has(sig)) continue;
    used.add(sig);

    // Çeldirici parçalar: 90°, 180°, 270°, ayna, 1 kare eksiltilmiş / kaydırılmış
    const r90 = rotCoords90(correctNorm);
    const r180 = rotCoords90(r90);
    const r270 = rotCoords90(r180);
    const mir = mirrorCoords(correctNorm);
    const dropFirst = normalizeCoords(correctNorm.slice(1));
    const dropLast = normalizeCoords(correctNorm.slice(0, -1));

    const seen = new Set<string>([correctKey]);
    const wrongs: [number, number][][] = [];
    for (const cand of shuffle([r90, r180, r270, mir, dropFirst, dropLast], rnd)) {
      const k = coordsKey(cand);
      if (!seen.has(k)) {
        seen.add(k);
        wrongs.push(cand);
        if (wrongs.length === 3) break;
      }
    }
    if (wrongs.length < 3) continue;

    out.push({
      id: `${prefix}-cut-${out.length + 1}`,
      prompt: 'Yukarıdaki görseldeki beyaz boşluğu döndürmeden tam dolduran parçayı bul!',
      hint: 'Beyaz karelerin her satırdaki sayısını ve çıkıntı yönünü tek tek sayarak seçeneklerle karşılaştır.',
      explanation: 'Boşluğun üst, orta ve alt satırındaki kare dizilimiyle birebir örtüşen tek parça doğru cevaptır.',
      visualType: 'grid_cutout',
      visualData: { size: 5, holes: rawHoles, color },
      options: [
        { id: 'a', visual: { cells: correctNorm, color }, isCorrect: true },
        { id: 'b', visual: { cells: wrongs[0], color }, isCorrect: false },
        { id: 'c', visual: { cells: wrongs[1], color }, isCorrect: false },
        { id: 'd', visual: { cells: wrongs[2], color }, isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 9. Q10: İKİ TONLU YARIM SİMETRİ TAMAMLAMA (half_symmetry)
// ============================================================================
export const generateHalfSymmetryQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const kinds = ['chevron', 'diamond_wing', 'bracket_step', 'arrow_half', 'crown_half'];
  const colorPairs: [string, string][] = [
    ['#1e293b', '#94a3b8'], // Q10 koyu-açık gri çifti
    ['#0284c7', '#7dd3fc'],
    ['#dc2626', '#fca5a5'],
    ['#15803d', '#86efac'],
    ['#7c3aed', '#c4b5fd'],
    ['#d97706', '#fde68a'],
  ];

  const out: QuizVisualQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length];
    const [color1, color2] = colorPairs[Math.floor(i / kinds.length) % colorPairs.length];
    // Sol parça rot=0 (sola bakan yarım); sağ tamamlayıcı parça rot=180 (sağa bakan yarım, ama renkler ters dönerse dikkat!)
    // Not: 180° döndürme üst ve alt rengi de değiştirir; o yüzden doğru ayna tamamlamada
    // üstte color1, altta color2 kalması için option'a color1/color2'yi swap ederek rot=180 veriyoruz!
    const correctVisual = { kind, color1: color2, color2: color1, rot: 180 };
    const wrongVisuals = shuffle(
      [
        { kind, color1, color2, rot: 0 }, // aynı yön (<)
        { kind, color1, color2, rot: 90 }, // yukarı/aşağı dönük
        { kind, color1, color2, rot: 270 }, // ters dikey dönük
        { kind, color1, color2, rot: 180 }, // doğru yön ama üst-alt renk tonu ters!
      ],
      rnd
    ).slice(0, 3);

    out.push({
      id: `${prefix}-hsym-${i + 1}`,
      prompt: 'Soldaki yarım şekli dikey simetriyle tamamlayan "?" parçası hangisidir?',
      hint: 'İki parça yan yana geldiğinde sağa-sola tam simetrik kapalı bir şekil oluşturmalı ve üstteki koyu renk üstte kalmalı!',
      explanation: 'Soldaki yarım şeklin dikey aynadaki tam karşılığı sağa bakan ve üst-alt renk tonu eşleşen parçadır.',
      visualType: 'half_symmetry',
      visualData: { kind, color1, color2, leftRot: 0 },
      options: [
        { id: 'a', visual: correctVisual, isCorrect: true },
        { id: 'b', visual: wrongVisuals[0], isCorrect: false },
        { id: 'c', visual: wrongVisuals[1], isCorrect: false },
        { id: 'd', visual: wrongVisuals[2], isCorrect: false },
      ],
    });
  }
  return out;
};

// ============================================================================
// 10. Q4: DOMİNO TOPLAM TAMAMLAMA (domino_sum)
// ============================================================================
export const generateDominoSumQuestions = (
  prefix: string,
  count: number,
  seed: number
): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  // Geçerli tüm (leftPips, rightPips) çiftleri (1..6 x 1..6 = 36 eşsiz soru)
  const pairs: [number, number][] = [];
  for (let l = 1; l <= 6; l++) {
    for (let r = 1; r <= 6; r++) {
      pairs.push([l, r]);
    }
  }
  // Q4 örneği (5 + 5 = 10) en başta olsun, kalanı karıştır
  const ordered: [number, number][] = [
    [5, 5],
    ...shuffle(
      pairs.filter(([l, r]) => !(l === 5 && r === 5)),
      rnd
    ),
  ];

  return ordered.slice(0, count).map(([leftPips, rightPips], idx) => {
    const targetSum = leftPips + rightPips;
    const wrongPips = shuffle(
      [1, 2, 3, 4, 5, 6].filter((p) => p !== rightPips),
      rnd
    ).slice(0, 3);

    return {
      id: `${prefix}-dom-${idx + 1}`,
      prompt: 'Üstteki sayıya ulaşmak için domino taşındaki "?" yerine kaç noktalı yüz gelmelidir?',
      hint: `Domino taşının sol tarafında ${leftPips} nokta var. ${targetSum} olması için kaç nokta daha eklemelisin?`,
      explanation: `${leftPips} + ${rightPips} = ${targetSum} eder. Bu yüzden "?" yerine ${rightPips} noktalı yüz gelmelidir.`,
      visualType: 'domino_sum',
      visualData: { targetSum, leftPips },
      options: [
        { id: 'a', visual: { pips: rightPips }, isCorrect: true },
        { id: 'b', visual: { pips: wrongPips[0] }, isCorrect: false },
        { id: 'c', visual: { pips: wrongPips[1] }, isCorrect: false },
        { id: 'd', visual: { pips: wrongPips[2] }, isCorrect: false },
      ],
    };
  });
};

// ============================================================================
// 11. YENİ ETKİNLİK 15: KISA SÜRELİ GÖRSEL & SAYISAL HAFIZA (kisa_sureli_hafiza)
//     Q11 (Görseli aklında tut) + Q16 (Sayıları sırasıyla aklında tut) — 64 Soru
// ============================================================================
export const generateKisaSureliHafizaQuestions = (seed = 202615): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const out: QuizVisualQuestion[] = [];

  // A) 32 Görsel Nesne Hafıza Sorusu (Q11 tarzı)
  const objectBuilders: (() => {
    name: string;
    spec: Record<string, any>;
    mutations: { label: string; spec: Record<string, any> }[];
  })[] = [
    () => {
      const cupColors = ['#fb923c', '#38bdf8', '#f472b6', '#4ade80', '#a78bfa'];
      const lidColors = ['#fde68a', '#bae6fd', '#fecdd3', '#bbf7d0'];
      const strawColors = ['#ef4444', '#2563eb', '#16a34a', '#9333ea'];
      const cupColor = pick(cupColors, rnd);
      const lidColor = pick(lidColors, rnd);
      const strawColor = pick(strawColors, rnd);
      const strawDir = rnd() < 0.5 ? 'right' : 'left';
      const dots = pick([2, 3, 4], rnd);
      const spec = { kind: 'iced_cup', cupColor, lidColor, strawColor, strawDir, dots, bandColor: '#ffffff', dotColor: '#78350f' };
      const altCup = cupColors.find((c) => c !== cupColor)!;
      const altStraw = strawColors.find((c) => c !== strawColor)!;
      return {
        name: 'buzlu içecek bardağı',
        spec,
        mutations: [
          { label: 'pipet yönü', spec: { ...spec, strawDir: strawDir === 'right' ? 'left' : 'right' } },
          { label: 'bardak rengi', spec: { ...spec, cupColor: altCup } },
          { label: 'inci sayısı', spec: { ...spec, dots: dots === 4 ? 2 : dots + 1 } },
          { label: 'pipet rengi', spec: { ...spec, strawColor: altStraw } },
        ],
      };
    },
    () => {
      const bodyColors = ['#38bdf8', '#f43f5e', '#22c55e', '#a855f7', '#f97316'];
      const pocketColors = ['#fbbf24', '#fde68a', '#bae6fd', '#fda4af'];
      const bodyColor = pick(bodyColors, rnd);
      const pocketColor = pick(pocketColors, rnd);
      const sidePocket = rnd() < 0.5 ? 'left' : 'right';
      const badge = rnd() < 0.5 ? 'star' : 'circle';
      const spec = { kind: 'backpack', bodyColor, pocketColor, sidePocket, badge, accentColor: '#f59e0b', badgeColor: '#fef08a', strapColor: '#334155' };
      const altBody = bodyColors.find((c) => c !== bodyColor)!;
      return {
        name: 'sırt çantası',
        spec,
        mutations: [
          { label: 'yan cep yönü', spec: { ...spec, sidePocket: sidePocket === 'left' ? 'right' : 'left' } },
          { label: 'rozet şekli', spec: { ...spec, badge: badge === 'star' ? 'circle' : 'star' } },
          { label: 'çanta rengi', spec: { ...spec, bodyColor: altBody } },
          { label: 'cep ve rozet', spec: { ...spec, sidePocket: sidePocket === 'left' ? 'right' : 'left', badge: badge === 'star' ? 'circle' : 'star' } },
        ],
      };
    },
    () => {
      const topColors = ['#fda4af', '#bae6fd', '#fde047', '#c4b5fd'];
      const bottomColors = ['#92400e', '#f97316', '#be185d', '#1d4ed8'];
      const topColor = pick(topColors, rnd);
      const bottomColor = pick(bottomColors, rnd);
      const candles = pick([2, 3, 4], rnd);
      const topping = rnd() < 0.5 ? 'cherry' : 'wave';
      const spec = { kind: 'cake', topColor, bottomColor, candles, topping, candleColor: '#38bdf8' };
      const altTop = topColors.find((c) => c !== topColor)!;
      return {
        name: 'doğum günü pastası',
        spec,
        mutations: [
          { label: 'mum sayısı', spec: { ...spec, candles: candles === 4 ? 2 : candles + 1 } },
          { label: 'süsleme şekli', spec: { ...spec, topping: topping === 'cherry' ? 'wave' : 'cherry' } },
          { label: 'üst kat rengi', spec: { ...spec, topColor: altTop } },
          { label: 'mum ve süsleme', spec: { ...spec, candles: candles === 2 ? 3 : 2, topping: topping === 'cherry' ? 'wave' : 'cherry' } },
        ],
      };
    },
    () => {
      const roofColors = ['#ef4444', '#2563eb', '#16a34a', '#9333ea'];
      const wallColors = ['#fde68a', '#e0f2fe', '#fce7f3', '#dcfce7'];
      const roofColor = pick(roofColors, rnd);
      const wallColor = pick(wallColors, rnd);
      const chimney = rnd() < 0.5 ? 'left' : 'right';
      const atticWindow = rnd() < 0.5;
      const spec = { kind: 'house', roofColor, wallColor, chimney, atticWindow, doorColor: '#92400e', winColor: '#38bdf8', chimneyColor: '#64748b' };
      const altRoof = roofColors.find((c) => c !== roofColor)!;
      return {
        name: 'ev',
        spec,
        mutations: [
          { label: 'baca yönü', spec: { ...spec, chimney: chimney === 'left' ? 'right' : 'left' } },
          { label: 'çatı penceresi', spec: { ...spec, atticWindow: !atticWindow } },
          { label: 'çatı rengi', spec: { ...spec, roofColor: altRoof } },
          { label: 'baca ve pencere', spec: { ...spec, chimney: chimney === 'left' ? 'right' : 'left', atticWindow: !atticWindow } },
        ],
      };
    },
    () => {
      const headColors = ['#38bdf8', '#a855f7', '#4ade80', '#fb923c'];
      const headColor = pick(headColors, rnd);
      const antennas = rnd() < 0.5 ? 1 : 2;
      const eyeShape = rnd() < 0.5 ? 'circle' : 'square';
      const btnColor = pick(['#f43f5e', '#38bdf8', '#facc15'], rnd);
      const spec = { kind: 'robot', headColor, bodyColor: '#0284c7', antennas, eyeShape, btnColor, accentColor: '#fbbf24' };
      const altHead = headColors.find((c) => c !== headColor)!;
      return {
        name: 'robot',
        spec,
        mutations: [
          { label: 'anten sayısı', spec: { ...spec, antennas: antennas === 1 ? 2 : 1 } },
          { label: 'göz şekli', spec: { ...spec, eyeShape: eyeShape === 'circle' ? 'square' : 'circle' } },
          { label: 'kafa rengi', spec: { ...spec, headColor: altHead } },
          { label: 'anten ve göz', spec: { ...spec, antennas: antennas === 1 ? 2 : 1, eyeShape: eyeShape === 'circle' ? 'square' : 'circle' } },
        ],
      };
    },
    () => {
      const rimColors = ['#38bdf8', '#ef4444', '#22c55e', '#a855f7', '#f59e0b'];
      const rimColor = pick(rimColors, rnd);
      const hasBells = rnd() < 0.5;
      const hourAngle = pick([0, 90, 180, -90], rnd);
      const minuteAngle = pick([-90, 0, 90, 180].filter((a) => a !== hourAngle), rnd);
      const spec = { kind: 'clock', rimColor, hasBells, hourAngle, minuteAngle, bellColor: '#f59e0b', handColor: '#dc2626' };
      const altRim = rimColors.find((c) => c !== rimColor)!;
      return {
        name: 'saat',
        spec,
        mutations: [
          { label: 'çanlar', spec: { ...spec, hasBells: !hasBells } },
          { label: 'akrep yönü', spec: { ...spec, hourAngle: (hourAngle + 90) % 360 } },
          { label: 'çerçeve rengi', spec: { ...spec, rimColor: altRim } },
          { label: 'yelkovan yönü', spec: { ...spec, minuteAngle: (minuteAngle + 180) % 360 } },
        ],
      };
    },
  ];

  const seenObj = new Set<string>();
  let objGuard = 0;
  while (out.length < 32 && objGuard < 400) {
    objGuard++;
    const builder = objectBuilders[out.length % objectBuilders.length];
    const built = builder();
    const sig = JSON.stringify(built.spec);
    if (seenObj.has(sig)) continue;
    seenObj.add(sig);

    const pickedMuts = shuffle(built.mutations, rnd).slice(0, 3);
    out.push({
      id: `ksh-obj-${out.length + 1}`,
      prompt: 'Görseli aklında tut ve süre bitince birebir aynısını seç!',
      hint: `Renkleri, yönleri ve detay sayısını (${built.name}) zihninde kısa bir hikâye gibi kodla.`,
      explanation: `Doğru seçenek az önce ekranda gördüğün ${built.name} görselinin renk, yön ve detay bakımından birebir aynısıdır.`,
      visualType: 'flash_memory',
      visualData: {
        subType: 'object',
        previewMs: 4000,
        objectSpec: built.spec,
      },
      options: [
        { id: 'a', visual: { objectSpec: built.spec }, isCorrect: true },
        { id: 'b', visual: { objectSpec: pickedMuts[0].spec }, isCorrect: false },
        { id: 'c', visual: { objectSpec: pickedMuts[1].spec }, isCorrect: false },
        { id: 'd', visual: { objectSpec: pickedMuts[2].spec }, isCorrect: false },
      ],
    });
  }

  // B) 32 Sayı / Harf Dizisi Hafıza Sorusu (Q16 tarzı: "Sayıları, sırasıyla aklında tut. 8, 3, 0, 1")
  const seenSeq = new Set<string>();
  let seqCount = 0;
  let seqGuard = 0;
  while (seqCount < 32 && seqGuard < 400) {
    seqGuard++;
    const useLetters = seqCount >= 22; // 22 sayı dizisi + 10 harf dizisi
    const len = seqCount % 3 === 2 ? 5 : 4;
    const alphabet = useLetters
      ? ['A', 'B', 'C', 'D', 'E', 'K', 'L', 'M', 'P', 'R', 'S', 'T']
      : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const seq = shuffle(alphabet, rnd).slice(0, len);
    const sig = seq.join(',');
    if (seenSeq.has(sig)) continue;
    seenSeq.add(sig);

    // 3 akıllı çeldirici: iki rakamı yer değiştir, ters çevir, 1 rakamı değiştir
    const swap01 = [...seq];
    [swap01[0], swap01[1]] = [swap01[1], swap01[0]];
    const swapMid = [...seq];
    [swapMid[1], swapMid[2]] = [swapMid[2], swapMid[1]];
    const swapEnd = [...seq];
    [swapEnd[len - 2], swapEnd[len - 1]] = [swapEnd[len - 1], swapEnd[len - 2]];
    const altChar = alphabet.find((c) => !seq.includes(c))!;
    const replaceOne = [...seq];
    replaceOne[Math.floor(len / 2)] = altChar;

    const seenOpt = new Set<string>([sig]);
    const wrongs: string[][] = [];
    for (const cand of shuffle([swap01, swapMid, swapEnd, replaceOne], rnd)) {
      const k = cand.join(',');
      if (!seenOpt.has(k)) {
        seenOpt.add(k);
        wrongs.push(cand);
        if (wrongs.length === 3) break;
      }
    }
    if (wrongs.length < 3) continue;

    seqCount++;
    out.push({
      id: `ksh-seq-${seqCount}`,
      prompt: useLetters
        ? 'Harfleri sırasıyla aklında tut ve süre bitince doğru sırayı seç!'
        : 'Sayıları, sırasıyla aklında tut ve süre bitince doğru sırayı seç!',
      hint: useLetters
        ? 'Harfleri bir kelime veya ritim gibi içinden tekrar ederek hatırla.'
        : 'Sayıları ikişerli gruplar hâlinde (örneğin 83 - 01 gibi) içinden okuyarak aklında tut!',
      explanation: `Ekranda gösterilen doğru sıralama soldan sağa "${seq.join(', ')}" şeklindeydi.`,
      visualType: 'flash_memory',
      visualData: {
        subType: 'sequence',
        previewMs: len >= 5 ? 4400 : 3800,
        sequence: seq,
      },
      options: [
        { id: 'a', visual: { sequence: seq }, isCorrect: true },
        { id: 'b', visual: { sequence: wrongs[0] }, isCorrect: false },
        { id: 'c', visual: { sequence: wrongs[1] }, isCorrect: false },
        { id: 'd', visual: { sequence: wrongs[2] }, isCorrect: false },
      ],
    });
  }

  return out;
};

// ============================================================================
// 12. YENİ ETKİNLİK 16: ZİHİNSEL DÖNDÜRME & FARKLI ŞEKİL (zihinsel_dondurme)
//     Q18 (Döndürülmüş hâli) + Q7 (Renkli poliomino "Hangisi farklı?") — 64 Soru
// ============================================================================
interface PolyCell {
  r: number;
  c: number;
  color?: string;
  dot?: boolean;
}

const normPoly = (cells: PolyCell[]): PolyCell[] => {
  const minR = Math.min(...cells.map((x) => x.r));
  const minC = Math.min(...cells.map((x) => x.c));
  return cells
    .map((x) => ({ ...x, r: x.r - minR, c: x.c - minC }))
    .sort((a, b) => a.r - b.r || a.c - b.c);
};

const rotPoly90 = (cells: PolyCell[]): PolyCell[] =>
  normPoly(cells.map((x) => ({ ...x, r: x.c, c: -x.r })));

const rotPolyN = (cells: PolyCell[], times: number): PolyCell[] => {
  let cur = normPoly(cells);
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) cur = rotPoly90(cur);
  return cur;
};

const mirrorPolyH = (cells: PolyCell[]): PolyCell[] =>
  normPoly(cells.map((x) => ({ ...x, c: -x.c })));

const polyKey = (cells: PolyCell[]): string =>
  normPoly(cells)
    .map((x) => `${x.r},${x.c},${x.color ?? ''},${x.dot ? 1 : 0}`)
    .join('|');

const isStrictlyChiral = (cells: PolyCell[]): boolean => {
  const rotKeys = new Set([0, 1, 2, 3].map((k) => polyKey(rotPolyN(cells, k))));
  const mir = mirrorPolyH(cells);
  for (let k = 0; k < 4; k++) {
    if (rotKeys.has(polyKey(rotPolyN(mir, k)))) return false;
  }
  return true;
};

export const generateZihinselDondurmeQuestions = (seed = 202616): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const out: QuizVisualQuestion[] = [];

  // A) 32 adet Q18 tarzı: Noktalı çokgen/poliomino döndürme
  const q18BaseShapes: [number, number][][] = [
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]], // merdiven (Q18 benzeri)
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3]],
    [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
    [[0, 2], [1, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [2, 1]],
    [[0, 1], [0, 2], [1, 1], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]],
  ];
  const fills = ['#c2a679', '#60a5fa', '#4ade80', '#f472b6', '#fbbf24', '#a78bfa'];

  const usedQ18 = new Set<string>();
  let q18Count = 0;
  let guard = 0;

  while (q18Count < 32 && guard < 500) {
    guard++;
    const baseCoords = q18BaseShapes[guard % q18BaseShapes.length];
    const dotIdx = Math.floor(rnd() * baseCoords.length);
    const fill = fills[q18Count % fills.length];
    const basePoly: PolyCell[] = normPoly(
      baseCoords.map(([r, c], idx) => ({ r, c, dot: idx === dotIdx }))
    );

    // Mutlaka kiral (ayna yansıması hiçbir döndürmeyle çakışmayan) olmalı!
    if (!isStrictlyChiral(basePoly)) continue;

    const targetRot = pick([1, 2, 3], rnd); // 90°, 180°, 270°
    const sig = `${polyKey(basePoly)}|rot=${targetRot}|${fill}`;
    if (usedQ18.has(sig)) continue;
    usedQ18.add(sig);

    const correctPoly = rotPolyN(basePoly, targetRot);
    const mirrored = mirrorPolyH(basePoly);

    // 3 çeldirici: ayna yansımasının farklı dönüşleri (hepsi garantili olarak yanlış!) + nokta kayması
    const altDotIdx = (dotIdx + 1) % baseCoords.length;
    const wrongDotPoly = rotPolyN(
      normPoly(baseCoords.map(([r, c], idx) => ({ r, c, dot: idx === altDotIdx }))),
      targetRot
    );

    const candWrongs = [
      rotPolyN(mirrored, 0),
      rotPolyN(mirrored, 1),
      rotPolyN(mirrored, 2),
      rotPolyN(mirrored, 3),
      wrongDotPoly,
    ];
    const seen = new Set<string>([polyKey(correctPoly)]);
    const wrongs: PolyCell[][] = [];
    for (const w of shuffle(candWrongs, rnd)) {
      const k = polyKey(w);
      if (!seen.has(k)) {
        seen.add(k);
        wrongs.push(w);
        if (wrongs.length === 3) break;
      }
    }
    if (wrongs.length < 3) continue;

    q18Count++;
    const deg = targetRot * 90;
    out.push({
      id: `zd-rot-${q18Count}`,
      prompt: 'Hangisi yukarıdaki şeklin döndürülmüş hâlidir?',
      hint: 'Şekli ters çevirmeden (ayna gibi yansıtmadan) yalnızca saat yönünde döndür ve beyaz noktanın hangi köşede kaldığını takip et!',
      explanation: `Şekli ters çevirmeden saat yönünde ${deg}° döndürdüğümüzde beyaz nokta ve basamak yönü yalnızca doğru seçenekte korunur.`,
      visualType: 'rotate_poly',
      visualData: { cells: basePoly, fill },
      options: [
        { id: 'a', visual: { cells: correctPoly, fill }, isCorrect: true },
        { id: 'b', visual: { cells: wrongs[0], fill }, isCorrect: false },
        { id: 'c', visual: { cells: wrongs[1], fill }, isCorrect: false },
        { id: 'd', visual: { cells: wrongs[2], fill }, isCorrect: false },
      ],
    });
  }

  // B) 32 adet Q7 tarzı: Renkli 4'lü/5'li poliomino "Hangisi farklı?"
  // 3 seçenek aynı renkli parçanın farklı açılardaki dönüşü, 1 seçenek ayna yansıması (veya renk sırası ters)!
  const q7Templates: [number, number][][] = [
    [[0, 0], [0, 1], [0, 2], [1, 1]], // T-tetromino (Q7 birebir!)
    [[0, 0], [1, 0], [2, 0], [2, 1]], // L-tetromino
    [[0, 0], [0, 1], [1, 1], [1, 2]], // Z-tetromino
    [[0, 0], [0, 1], [0, 2], [1, 0]], // J-tetromino
    [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2]], // F-pentomino
    [[0, 0], [1, 0], [1, 1], [1, 2], [2, 1]], // Y-pentomino
    [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]], // Z-pentomino
    [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1]], // U-pentomino
  ];
  const colorBank = ['#fde047', '#22c55e', '#ef4444', '#38bdf8', '#a855f7', '#fb923c'];

  const usedQ7 = new Set<string>();
  let q7Count = 0;
  let guard7 = 0;

  while (q7Count < 32 && guard7 < 500) {
    guard7++;
    const shapeCoords = q7Templates[guard7 % q7Templates.length];
    const cols = shuffle(colorBank, rnd).slice(0, shapeCoords.length);
    const base: PolyCell[] = normPoly(
      shapeCoords.map(([r, c], idx) => ({ r, c, color: cols[idx] }))
    );

    if (!isStrictlyChiral(base)) continue;

    // 4 dönüşten 3 farklı açı seç (normal) + 1 ayna yansımasının rastgele dönüşü (odd!)
    const rotAngles = shuffle([0, 1, 2, 3], rnd).slice(0, 3);
    const mirrorAngle = pick([0, 1, 2, 3], rnd);
    const normals = rotAngles.map((a) => rotPolyN(base, a));
    const oddPiece = rotPolyN(mirrorPolyH(base), mirrorAngle);

    // 4 seçeneğin tamamının görsel olarak benzersiz olduğunu doğrula
    const allKeys = new Set([...normals.map(polyKey), polyKey(oddPiece)]);
    if (allKeys.size !== 4) continue;

    const sig = `${polyKey(base)}|${rotAngles.join('')}|m${mirrorAngle}`;
    if (usedQ7.has(sig)) continue;
    usedQ7.add(sig);

    q7Count++;
    out.push({
      id: `zd-odd-${q7Count}`,
      prompt: 'Hangisi farklı? (3 şekil aynı parçanın döndürülmüş hâlidir)',
      hint: 'Bir rengi (örneğin kırmızı veya sarı kareyi) referans al ve diğer renklerin saat yönündeki sırasını 4 şıkta karşılaştır!',
      explanation: 'Diğer 3 seçenek aynı renkli parçanın 90°/180°/270° döndürülmüş hâlidir; doğru cevap olan farklı şekil ise ters çevrilmiştir (ayna yansıması).',
      visualType: 'odd_poly_rotate',
      visualData: { mode: 'chiral_color_poly' },
      options: [
        { id: 'a', visual: { cells: oddPiece }, isCorrect: true },
        { id: 'b', visual: { cells: normals[0] }, isCorrect: false },
        { id: 'c', visual: { cells: normals[1] }, isCorrect: false },
        { id: 'd', visual: { cells: normals[2] }, isCorrect: false },
      ],
    });
  }

  return out;
};

// ============================================================================
// 13. Q14: DETAYLI ÇOK PARÇALI GÖLGE SORULARI (golge_etkinlikleri)
// ============================================================================
export const generateSampleGolgeQuestions = (seed = 202614): QuizVisualQuestion[] => {
  const rnd = makeRng(seed);
  const newFigures: {
    figure: string;
    name: string;
    wrongs: string[];
    hint: string;
  }[] = [
    {
      figure: 'book_stack',
      name: 'üst üste 3 kitap',
      wrongs: ['two_books', 'mirrored', 'no_bookmark'],
      hint: 'En üstteki kitabın eğimine, orta kitabın çıkıntısına ve sarkan ayraç ucuna dikkat et!',
    },
    {
      figure: 'watering_can',
      name: 'sulama kabı',
      wrongs: ['no_rose', 'mirrored', 'no_handle'],
      hint: 'Sulama ucunun (süzgecin) baktığı yöne ve arka kulpun şekline dikkat et!',
    },
    {
      figure: 'alarm_clock',
      name: 'çalar saat',
      wrongs: ['one_bell', 'no_feet', 'no_hammer'],
      hint: 'Üstteki iki çana, ortadaki tokmağa ve alt ayaklara tek tek bak!',
    },
    {
      figure: 'backpack_sil',
      name: 'okul çantası',
      wrongs: ['no_side_pocket', 'mirrored', 'no_top_loop'],
      hint: 'Üst taşıma sapı ile yan cebin hangi tarafta olduğuna dikkat et!',
    },
  ];

  const poses: { angle: number; flipX: boolean }[] = [
    { angle: 0, flipX: false },
    { angle: 0, flipX: true },
    { angle: -10, flipX: false },
    { angle: 10, flipX: true },
  ];

  const out: QuizVisualQuestion[] = [];
  for (const fig of newFigures) {
    for (let p = 0; p < poses.length; p++) {
      const pose = poses[p];
      const wrongs = shuffle(fig.wrongs, rnd);
      out.push({
        id: `gl-s-${fig.figure}-${p + 1}`,
        prompt: 'Yukarıdaki şeklin birebir doğru gölgesini bul!',
        hint: fig.hint,
        explanation: `${fig.name.charAt(0).toUpperCase() + fig.name.slice(1)} şeklinin yönü ve dış hat çıkıntılarıyla birebir eşleşen tek gölge doğru cevaptır.`,
        visualType: 'shadow',
        visualData: { figure: fig.figure, angle: pose.angle, flipX: pose.flipX },
        options: [
          { id: 'a', visual: { figure: fig.figure, variant: 'exact', angle: pose.angle, flipX: pose.flipX }, isCorrect: true },
          { id: 'b', visual: { figure: fig.figure, variant: wrongs[0], angle: pose.angle, flipX: pose.flipX }, isCorrect: false },
          { id: 'c', visual: { figure: fig.figure, variant: wrongs[1], angle: pose.angle, flipX: pose.flipX }, isCorrect: false },
          { id: 'd', visual: { figure: fig.figure, variant: wrongs[2], angle: pose.angle, flipX: pose.flipX }, isCorrect: false },
        ],
      });
    }
  }
  return out;
};

// ============================================================================
// MEVCUT ETKİNLİKLERE TOPLU EXPORT'LAR
// ============================================================================
export const generateSampleYonAlgoritma = (): QuizVisualQuestion[] => [
  ...generateGridPathEncodeQuestions('ya-s', 16, 81001),
  ...generateGridPathXQuestions('ya-s', 16, 81002),
];

export const generateSampleCokluZeka = (): QuizVisualQuestion[] => [
  ...generateFruitEquationQuestions('cz-s', 14, 82001),
  ...generateDominoSumQuestions('cz-s', 12, 82002),
  ...generateColorDigitCipherQuestions('cz-s', 12, 82003),
];

export const generateSampleOnTest = (): QuizVisualQuestion[] => [
  ...generateFruitEquationQuestions('ot-s', 6, 83001),
  ...generateColorDigitCipherQuestions('ot-s', 6, 83002),
  ...generateDominoSumQuestions('ot-s', 6, 83003),
  ...generateColoredTowerTopQuestions('ot-s', 6, 83004),
  ...generateGridPathXQuestions('ot-s', 6, 83005),
  ...generateLetterStripQuestions('ot-s', 6, 83006),
  ...generateGridMirrorQuestions('ot-s', 6, 83007),
  ...generateGridCutoutQuestions('ot-s', 6, 83008),
];

export const generateSampleOruntuDizileri = (): QuizVisualQuestion[] => [
  ...generateLetterStripQuestions('od-s', 16, 84001),
  ...generateDominoSumQuestions('od-s', 12, 84002),
];

export const generateSampleKupAcilimi = (): QuizVisualQuestion[] => [
  ...generateColoredTowerTopQuestions('ka-s', 16, 85001),
  ...generateColoredCubeNetQuestions('ka-s', 16, 85002),
];

export const generateSampleAynaSimetrisi = (): QuizVisualQuestion[] => [
  ...generateGridMirrorQuestions('as-s', 16, 86001),
  ...generateHalfSymmetryQuestions('as-s', 14, 86002),
];

export const generateSampleSekilBulmaca = (): QuizVisualQuestion[] => [
  ...generateGridCutoutQuestions('sb-s', 16, 87001),
  ...generateHalfSymmetryQuestions('sb-s', 10, 87002),
];

export const generateSampleDesen = (): QuizVisualQuestion[] => [
  ...generateGridCutoutQuestions('ds-s', 14, 88001),
];
