import React from 'react';

export type TrafficCategoryId = 'bilgi' | 'uyari' | 'yasak' | 'mecburi';

export type TrafficSignId =
  | 'yaya_gecidi_mavi'
  | 'okul_gecidi_mavi'
  | 'alt_gecit'
  | 'ust_gecit'
  | 'yaya_gecidi_ucgen'
  | 'okul_gecidi_ucgen'
  | 'isikli_isaret'
  | 'kontrolsuz_kavsak'
  | 'yolda_calisma'
  | 'bisiklet_giremez'
  | 'yaya_giremez'
  | 'mecburi_bisiklet'
  | 'mecburi_yaya';

export interface TrafficCategoryMeta {
  id: TrafficCategoryId;
  title: string;
  shortTitle: string;
  shapeHint: string;
  summary: string;
  headerBg: string;
  borderColor: string;
  accentText: string;
  badgeBg: string;
}

export const TRAFFIC_CATEGORIES: Record<TrafficCategoryId, TrafficCategoryMeta> = {
  bilgi: {
    id: 'bilgi',
    title: 'Yayalara Bilgi Veren Levhalar',
    shortTitle: 'Yayalara Bilgi Verir',
    shapeHint: 'Mavi Kare',
    summary: 'Karşıya güvenle geçebileceğimiz yerleri gösterir.',
    headerBg: 'from-sky-600 to-blue-700',
    borderColor: 'border-sky-400',
    accentText: 'text-sky-300',
    badgeBg: 'bg-sky-600'
  },
  uyari: {
    id: 'uyari',
    title: 'Sürücüleri Uyaran Levhalar',
    shortTitle: 'Sürücüleri Uyarır',
    shapeHint: 'Kırmızı Üçgen',
    summary: 'Sürücüleri yoldaki durumlar için uyarır; hızlarını azaltırlar.',
    headerBg: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-400',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-600'
  },
  yasak: {
    id: 'yasak',
    title: 'Yasakları Bildiren Levhalar',
    shortTitle: 'Yasak Bildirir',
    shapeHint: 'Kırmızı Çember',
    summary: 'Yapılması yasak olan davranışları gösterir.',
    headerBg: 'from-rose-600 to-red-700',
    borderColor: 'border-rose-400',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-600'
  },
  mecburi: {
    id: 'mecburi',
    title: 'Kullanılacak Yolu Gösteren Levhalar',
    shortTitle: 'Kullanılacak Yol',
    shapeHint: 'Mavi Daire',
    summary: 'Yayaların ve bisikletlilerin kullanması gereken yolu gösterir.',
    headerBg: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-400',
    accentText: 'text-emerald-300',
    badgeBg: 'bg-emerald-600'
  }
};

export interface TrafficSignInfo {
  id: TrafficSignId;
  name: string;
  shortName: string;
  category: TrafficCategoryId;
  shapeLabel: string;
  meaning: string;
}

export const TRAFFIC_SIGNS: Record<TrafficSignId, TrafficSignInfo> = {
  yaya_gecidi_mavi: {
    id: 'yaya_gecidi_mavi',
    name: 'Yaya Geçidi (Bilgi)',
    shortName: 'Yaya Geçidi',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yaya geçidinin yerini gösterir. Buradan kontrollü olarak karşıya geçebiliriz.'
  },
  okul_gecidi_mavi: {
    id: 'okul_gecidi_mavi',
    name: 'Okul Geçidi (Bilgi)',
    shortName: 'Okul Geçidi',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Okul geçidinin yerini gösterir. Buradan kontrollü olarak karşıya geçebiliriz.'
  },
  alt_gecit: {
    id: 'alt_gecit',
    name: 'Alt Geçit',
    shortName: 'Alt Geçit',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yayaların yolun altından güvenle karşıya geçebileceğini gösterir.'
  },
  ust_gecit: {
    id: 'ust_gecit',
    name: 'Üst Geçit',
    shortName: 'Üst Geçit',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yayaların yolun üstünden güvenle karşıya geçebileceğini gösterir.'
  },
  yaya_gecidi_ucgen: {
    id: 'yaya_gecidi_ucgen',
    name: 'Yaya Geçidi (Uyarı)',
    shortName: 'Yaya Geçidi Uyarısı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Sürücüleri ileride yaya geçidi olduğu konusunda uyarır, hızlarını azaltırlar.'
  },
  okul_gecidi_ucgen: {
    id: 'okul_gecidi_ucgen',
    name: 'Okul Geçidi (Uyarı)',
    shortName: 'Okul Geçidi Uyarısı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Sürücüleri ileride okul geçidi olduğu konusunda uyarır.'
  },
  isikli_isaret: {
    id: 'isikli_isaret',
    name: 'Işıklı İşaret Cihazı',
    shortName: 'Işıklı İşaret Cihazı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Yolda trafik ışıkları (ışıklı işaret cihazı) bulunduğunu bildirir.'
  },
  kontrolsuz_kavsak: {
    id: 'kontrolsuz_kavsak',
    name: 'Kontrolsüz Kavşak',
    shortName: 'Kontrolsüz Kavşak',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Kavşağa yaklaşırken sürücülerin çok dikkatli olması gerektiğini bildirir.'
  },
  yolda_calisma: {
    id: 'yolda_calisma',
    name: 'Yolda Çalışma',
    shortName: 'Yolda Çalışma',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'İleride yol çalışması olduğunu bildirir; yavaşlanmalıdır.'
  },
  bisiklet_giremez: {
    id: 'bisiklet_giremez',
    name: 'Bisiklet Giremez',
    shortName: 'Bisiklet Giremez',
    category: 'yasak',
    shapeLabel: 'Kırmızı Çember',
    meaning: 'Bu yolda bisiklet sürmek yasaktır.'
  },
  yaya_giremez: {
    id: 'yaya_giremez',
    name: 'Yaya Giremez',
    shortName: 'Yaya Giremez',
    category: 'yasak',
    shapeLabel: 'Kırmızı Çember',
    meaning: 'Bu yola yayaların girmesi yasaktır.'
  },
  mecburi_bisiklet: {
    id: 'mecburi_bisiklet',
    name: 'Mecburi Bisiklet Yolu',
    shortName: 'Mecburi Bisiklet Yolu',
    category: 'mecburi',
    shapeLabel: 'Mavi Daire',
    meaning: 'Bisiklet sürmek için bu yol kullanılmalıdır.'
  },
  mecburi_yaya: {
    id: 'mecburi_yaya',
    name: 'Mecburi Yaya Yolu',
    shortName: 'Mecburi Yaya Yolu',
    category: 'mecburi',
    shapeLabel: 'Mavi Daire',
    meaning: 'Yayalar yürümek için bu yolu kullanmalıdır.'
  }
};

export const TRAFFIC_SIGN_LIST: TrafficSignInfo[] = Object.values(TRAFFIC_SIGNS);

// ─── CRISP AUTHENTIC TURKISH TRAFFIC SIGN SVG ARTWORK ────────────────────────

const PedestrianWalking: React.FC<{ fill?: string; tx?: number; ty?: number; scale?: number }> = ({
  fill = '#111827',
  tx = 0,
  ty = 0,
  scale = 1
}) => (
  <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
    <circle cx="50" cy="31" r="5.5" fill={fill} />
    <path
      d="M49 38 L44 52 L38 67 M51 38 L55 52 L61 67 M49 41 L38 49 M51 41 L61 48"
      stroke={fill}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M46 39 L54 39 L53 54 L46 54 Z" fill={fill} rx="2" />
  </g>
);

const TwoSchoolChildren: React.FC<{ fill?: string; tx?: number; ty?: number; scale?: number }> = ({
  fill = '#111827',
  tx = 0,
  ty = 0,
  scale = 1
}) => (
  <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
    {/* Left student (boy with backpack) */}
    <circle cx="38" cy="35" r="4.6" fill={fill} />
    <rect x="30" y="42" width="5" height="9" rx="1.5" fill={fill} />
    <path d="M35 42 L42 42 L42 56 L35 56 Z" fill={fill} />
    <path
      d="M36 56 L32 70 M41 56 L45 70 M36 44 L31 53 M42 44 L50 51"
      stroke={fill}
      strokeWidth="4.2"
      strokeLinecap="round"
    />
    {/* Right student (girl with skirt & bag) */}
    <circle cx="60" cy="37" r="4.3" fill={fill} />
    <polygon points="56,43 64,43 67,58 53,58" fill={fill} />
    <path
      d="M57 58 L54 70 M63 58 L66 70 M56 45 L50 51 M64 45 L69 52"
      stroke={fill}
      strokeWidth="3.8"
      strokeLinecap="round"
    />
  </g>
);

const BicycleGlyph: React.FC<{ color?: string; tx?: number; ty?: number; scale?: number }> = ({
  color = '#111827',
  tx = 0,
  ty = 0,
  scale = 1
}) => (
  <g transform={`translate(${tx} ${ty}) scale(${scale})`} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="31" cy="60" r="11" strokeWidth="4.2" />
    <circle cx="69" cy="60" r="11" strokeWidth="4.2" />
    <path d="M31 60 L46 43 L62 43 L69 60 M46 43 L50 60 L31 60 M62 43 L50 60" strokeWidth="3.8" />
    <path d="M41 37 L50 37" strokeWidth="3.8" />
    <path d="M59 35 L65 35 L62 43" strokeWidth="3.6" />
  </g>
);

export const TrafficSignSvg: React.FC<{ signId: TrafficSignId; className?: string }> = ({
  signId,
  className = 'w-20 h-20'
}) => {
  switch (signId) {
    case 'yaya_gecidi_mavi':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Yaya Geçidi Mavi Levha">
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <rect x="9" y="9" width="82" height="82" rx="8" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
          <polygon points="50,15 84,80 16,80" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
          <PedestrianWalking fill="#111827" tx={10} ty={16} scale={0.78} />
          {/* Zebra crossing bars */}
          <rect x="26" y="72" width="7" height="5" rx="1" fill="#111827" />
          <rect x="37" y="72" width="7" height="5" rx="1" fill="#111827" />
          <rect x="48" y="72" width="7" height="5" rx="1" fill="#111827" />
          <rect x="59" y="72" width="7" height="5" rx="1" fill="#111827" />
          <rect x="69" y="72" width="5" height="5" rx="1" fill="#111827" />
        </svg>
      );

    case 'okul_gecidi_mavi':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Okul Geçidi Mavi Levha">
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <rect x="9" y="9" width="82" height="82" rx="8" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
          <polygon points="50,15 84,80 16,80" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
          <TwoSchoolChildren fill="#111827" tx={12} ty={19} scale={0.76} />
        </svg>
      );

    case 'alt_gecit':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Alt Geçit Levhası">
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <rect x="14" y="14" width="72" height="72" rx="6" fill="#ffffff" />
          {/* Downward stairs */}
          <path d="M22 44 L36 44 L36 53 L47 53 L47 62 L58 62 L58 71 L78 71" fill="none" stroke="#111827" strokeWidth="5.5" strokeLinejoin="miter" />
          <polygon points="36,53 36,78 78,78 78,71 58,71 58,62 47,62 47,53" fill="#111827" opacity="0.16" />
          {/* Down arrow + walking person going down */}
          <circle cx="52" cy="27" r="5" fill="#111827" />
          <path d="M51 33 L50 45 L44 53 M53 35 L58 45 L62 56 M51 36 L43 41 M53 36 L61 42" stroke="#111827" strokeWidth="4.4" strokeLinecap="round" fill="none" />
          {/* Blue down indicator arrow */}
          <path d="M68 24 L68 42 M62 36 L68 43 L74 36" stroke="#0b63ce" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'ust_gecit':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Üst Geçit Levhası">
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <rect x="14" y="14" width="72" height="72" rx="6" fill="#ffffff" />
          {/* Upward stairs */}
          <path d="M22 73 L38 73 L38 64 L49 64 L49 55 L60 55 L60 46 L78 46" fill="none" stroke="#111827" strokeWidth="5.5" />
          <polygon points="38,73 78,73 78,46 60,46 60,55 49,55 49,64 38,64" fill="#111827" opacity="0.16" />
          {/* Person climbing up */}
          <circle cx="48" cy="26" r="5" fill="#111827" />
          <path d="M47 32 L45 45 L38 56 M49 34 L55 43 L54 53 M47 35 L38 41 M49 35 L58 37" stroke="#111827" strokeWidth="4.4" strokeLinecap="round" fill="none" />
          {/* Blue up indicator arrow */}
          <path d="M29 45 L29 27 M23 33 L29 26 L35 33" stroke="#0b63ce" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'yaya_gecidi_ucgen':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Yaya Geçidi Uyarı Levhası">
          <polygon points="50,7 94,86 6,86" fill="#ffffff" stroke="#dc2626" strokeWidth="9" strokeLinejoin="round" />
          <PedestrianWalking fill="#111827" tx={10} ty={20} scale={0.78} />
          <rect x="24" y="75" width="7.5" height="4.8" rx="1" fill="#111827" />
          <rect x="35.5" y="75" width="7.5" height="4.8" rx="1" fill="#111827" />
          <rect x="47" y="75" width="7.5" height="4.8" rx="1" fill="#111827" />
          <rect x="58.5" y="75" width="7.5" height="4.8" rx="1" fill="#111827" />
          <rect x="69.5" y="75" width="6.5" height="4.8" rx="1" fill="#111827" />
        </svg>
      );

    case 'okul_gecidi_ucgen':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Okul Geçidi Uyarı Levhası">
          <polygon points="50,7 94,86 6,86" fill="#ffffff" stroke="#dc2626" strokeWidth="9" strokeLinejoin="round" />
          <TwoSchoolChildren fill="#111827" tx={11} ty={23} scale={0.77} />
        </svg>
      );

    case 'isikli_isaret':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Işıklı İşaret Cihazı Levhası">
          <polygon points="50,7 94,86 6,86" fill="#ffffff" stroke="#dc2626" strokeWidth="9" strokeLinejoin="round" />
          <rect x="40" y="32" width="20" height="47" rx="5" fill="#111827" />
          <circle cx="50" cy="42" r="5.5" fill="#ef4444" />
          <circle cx="50" cy="55.5" r="5.5" fill="#facc15" />
          <circle cx="50" cy="69" r="5.5" fill="#22c55e" />
        </svg>
      );

    case 'kontrolsuz_kavsak':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Kontrolsüz Kavşak Levhası">
          <polygon points="50,7 94,86 6,86" fill="#ffffff" stroke="#dc2626" strokeWidth="9" strokeLinejoin="round" />
          <path d="M36 46 L64 74 M64 46 L36 74" stroke="#111827" strokeWidth="10" strokeLinecap="butt" />
        </svg>
      );

    case 'yolda_calisma':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Yolda Çalışma Levhası">
          <polygon points="50,7 94,86 6,86" fill="#ffffff" stroke="#dc2626" strokeWidth="9" strokeLinejoin="round" />
          {/* Worker */}
          <circle cx="44" cy="42" r="5" fill="#111827" />
          <path d="M42 49 L35 61 L30 76 M45 50 L49 62 L44 76 M43 51 L55 58 M41 53 L49 63" stroke="#111827" strokeWidth="4.6" strokeLinecap="round" fill="none" />
          {/* Shovel */}
          <path d="M46 53 L64 73" stroke="#111827" strokeWidth="3.6" strokeLinecap="round" />
          {/* Dirt pile */}
          <path d="M54 78 Q65 60 76 78 Z" fill="#111827" />
        </svg>
      );

    case 'bisiklet_giremez':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Bisiklet Giremez Levhası">
          <circle cx="50" cy="50" r="43" fill="#ffffff" stroke="#dc2626" strokeWidth="10" />
          <BicycleGlyph color="#111827" tx={4} ty={4} scale={0.92} />
        </svg>
      );

    case 'yaya_giremez':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Yaya Giremez Levhası">
          <circle cx="50" cy="50" r="43" fill="#ffffff" stroke="#dc2626" strokeWidth="10" />
          <PedestrianWalking fill="#111827" tx={0} ty={2} scale={1} />
        </svg>
      );

    case 'mecburi_bisiklet':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Mecburi Bisiklet Yolu Levhası">
          <circle cx="50" cy="50" r="44" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <circle cx="50" cy="50" r="39" fill="none" stroke="#ffffff" strokeWidth="2.2" />
          <BicycleGlyph color="#ffffff" tx={4} ty={4} scale={0.92} />
        </svg>
      );

    case 'mecburi_yaya':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-label="Mecburi Yaya Yolu Levhası">
          <circle cx="50" cy="50" r="44" fill="#0b63ce" stroke="#ffffff" strokeWidth="4" />
          <circle cx="50" cy="50" r="39" fill="none" stroke="#ffffff" strokeWidth="2.2" />
          {/* Adult + child holding hands */}
          <circle cx="41" cy="27" r="6" fill="#ffffff" />
          <path d="M35 36 L47 36 L46 56 L36 56 Z" fill="#ffffff" />
          <path d="M38 56 L35 76 M44 56 L47 76 M36 39 L30 53 M46 39 L55 51" stroke="#ffffff" strokeWidth="5.2" strokeLinecap="round" />
          <circle cx="62" cy="43" r="4.8" fill="#ffffff" />
          <path d="M58 50 L66 50 L68 64 L56 64 Z" fill="#ffffff" />
          <path d="M60 64 L58 76 M64 64 L66 76 M58 52 L54 51 M66 52 L71 60" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      );
  }
};

// ─── 30 VARIED DRAG-AND-DROP QUESTIONS (4 DISTINCT STYLES) ────────────────────

export interface MatchPairsQuestion {
  id: string;
  style: 'match_pairs';
  title: string;
  instruction: string;
  pairs: {
    signId: TrafficSignId;
    targetLabel: string;
    targetSub?: string;
  }[];
  fact: string;
}

export interface CategorySortQuestion {
  id: string;
  style: 'category_sort';
  title: string;
  instruction: string;
  categories: TrafficCategoryId[];
  signs: TrafficSignId[];
  fact: string;
}

export interface ScenarioSignQuestion {
  id: string;
  style: 'scenario_sign';
  title: string;
  instruction: string;
  scenario: string;
  sceneHint: string;
  correctSignId: TrafficSignId;
  choices: TrafficSignId[];
  fact: string;
}

export interface RuleBuilderQuestion {
  id: string;
  style: 'rule_builder';
  title: string;
  instruction: string;
  previewSigns: TrafficSignId[];
  /** Segments alternate plain text and blank slots: text[0], blank[0], text[1], blank[1], ... */
  segments: string[];
  blanks: {
    id: string;
    answer: string;
  }[];
  wordBank: string[];
  fact: string;
}

export type TrafikQuestion =
  | MatchPairsQuestion
  | CategorySortQuestion
  | ScenarioSignQuestion
  | RuleBuilderQuestion;

export const QUESTION_STYLE_LABELS: Record<TrafikQuestion['style'], { label: string; accent: string }> = {
  match_pairs: { label: 'Levha Eşleştirme', accent: 'text-sky-300' },
  category_sort: { label: 'Grup Kutularına Ayır', accent: 'text-amber-300' },
  scenario_sign: { label: 'Yol Kenarına Levha Tak', accent: 'text-emerald-300' },
  rule_builder: { label: 'Trafik Kuralını Tamamla', accent: 'text-fuchsia-300' }
};

export const TRAFIK_QUESTIONS: TrafikQuestion[] = [
  // 1 — Match Pairs (Mavi Bilgi Levhaları)
  {
    id: 'q1',
    style: 'match_pairs',
    title: 'Yayalara Bilgi Veren Levhaları Eşleştir',
    instruction: 'Her mavi levhayı doğru adına sürükleyip bırak.',
    pairs: [
      { signId: 'yaya_gecidi_mavi', targetLabel: 'Yaya Geçidi', targetSub: 'Kontrollü geçiş yeri' },
      { signId: 'alt_gecit', targetLabel: 'Alt Geçit', targetSub: 'Yolun altından geçiş' },
      { signId: 'ust_gecit', targetLabel: 'Üst Geçit', targetSub: 'Yolun üstünden geçiş' }
    ],
    fact: 'Mavi kare levhalar yayalara güvenle karşıya geçebilecekleri yerleri gösterir.'
  },
  // 2 — Scenario Sign
  {
    id: 'q2',
    style: 'scenario_sign',
    title: 'Okul Önünde Karşıya Geçiş',
    instruction: 'Duruma uygun levhayı yol kenarındaki boş direğe sürükle.',
    scenario: 'Zeynep okul çıkışında arkadaşlarıyla karşıya geçmek istiyor. Yayalara okul geçidinin yerini gösteren mavi levha hangisi?',
    sceneHint: 'Okul kapısının önündeki geçit',
    correctSignId: 'okul_gecidi_mavi',
    choices: ['okul_gecidi_mavi', 'okul_gecidi_ucgen', 'yaya_giremez', 'ust_gecit'],
    fact: 'Mavi kare Okul Geçidi levhası yayalara bilgi verir; buradan kontrollü olarak karşıya geçeriz.'
  },
  // 3 — Category Sort (Bilgi vs Uyarı)
  {
    id: 'q3',
    style: 'category_sort',
    title: 'Bilgi mi, Uyarı mı?',
    instruction: 'Levhaları doğru kutuya sürükleyip yerleştir.',
    categories: ['bilgi', 'uyari'],
    signs: ['yaya_gecidi_mavi', 'isikli_isaret', 'alt_gecit', 'yolda_calisma'],
    fact: 'Mavi kare levhalar yayalara bilgi verir; kırmızı üçgen levhalar sürücüleri uyarır.'
  },
  // 4 — Rule Builder
  {
    id: 'q4',
    style: 'rule_builder',
    title: 'Önemli Ayrımı Tamamla',
    instruction: 'Doğru sözcükleri sürükleyip boşluklara yerleştir.',
    previewSigns: ['yaya_gecidi_mavi', 'yaya_gecidi_ucgen'],
    segments: ['Mavi geçit levhaları ', ' bilgi verir; kırmızı üçgen geçit levhaları ise ', ' uyarır.'],
    blanks: [
      { id: 'b1', answer: 'yayalara' },
      { id: 'b2', answer: 'sürücüleri' }
    ],
    wordBank: ['yayalara', 'sürücüleri', 'bisikletleri', 'pilotları'],
    fact: 'Mavi geçit levhaları yayalara, kırmızı üçgen geçit levhaları sürücülere yöneliktir.'
  },
  // 5 — Match Pairs (Sürücü Uyarı Levhaları)
  {
    id: 'q5',
    style: 'match_pairs',
    title: 'Sürücüleri Uyaran Levhalar',
    instruction: 'Kırmızı üçgen levhaları doğru açıklamalarıyla eşleştir.',
    pairs: [
      { signId: 'isikli_isaret', targetLabel: 'Işıklı İşaret Cihazı', targetSub: 'İleride trafik ışıkları var' },
      { signId: 'kontrolsuz_kavsak', targetLabel: 'Kontrolsüz Kavşak', targetSub: 'Kavşağa yaklaşırken dikkatli ol' },
      { signId: 'yolda_calisma', targetLabel: 'Yolda Çalışma', targetSub: 'İleride yol çalışması yapılıyor' }
    ],
    fact: 'Sürücüler kırmızı üçgen uyarı levhalarını gördüklerinde hızlarını azaltıp dikkatli olurlar.'
  },
  // 6 — Scenario Sign
  {
    id: 'q6',
    style: 'scenario_sign',
    title: 'Bisiklet Sürmek Yasak!',
    instruction: 'Bu sokağın girişine takılması gereken yasak levhasını direğe sürükle.',
    scenario: 'Bu yürüyüş yolunda çok fazla yaya var ve bisiklet sürmek yasak. Girişe hangi levha konulmalıdır?',
    sceneHint: 'Bisiklete kapalı yürüyüş yolu',
    correctSignId: 'bisiklet_giremez',
    choices: ['bisiklet_giremez', 'mecburi_bisiklet', 'yaya_giremez', 'kontrolsuz_kavsak'],
    fact: 'Kırmızı çember içindeki bisiklet işareti, o yolda bisiklet sürmenin yasak olduğunu bildirir.'
  },
  // 7 — Category Sort (Yasak vs Mecburi)
  {
    id: 'q7',
    style: 'category_sort',
    title: 'Yasak mı, Kullanılacak Yol mu?',
    instruction: 'Kırmızı çemberli yasak levhalarını ve mavi daire yol levhalarını ayır.',
    categories: ['yasak', 'mecburi'],
    signs: ['bisiklet_giremez', 'mecburi_bisiklet', 'yaya_giremez', 'mecburi_yaya'],
    fact: 'Kırmızı çemberler yasakları, mavi daireler ise kullanılması gereken yolları gösterir.'
  },
  // 8 — Match Pairs (Yasak & Mecburi Karşılaştırma)
  {
    id: 'q8',
    style: 'match_pairs',
    title: 'Bisiklet ve Yaya Kuralları',
    instruction: 'Her levhayı anlattığı doğru kural kutusuna sürükle.',
    pairs: [
      { signId: 'yaya_giremez', targetLabel: 'Yaya Giremez', targetSub: 'Yayaların girmesi yasaktır' },
      { signId: 'mecburi_yaya', targetLabel: 'Mecburi Yaya Yolu', targetSub: 'Yayalar bu yolu kullanmalıdır' },
      { signId: 'mecburi_bisiklet', targetLabel: 'Mecburi Bisiklet Yolu', targetSub: 'Bisikletler bu yoldan gitmelidir' }
    ],
    fact: 'Mavi daire levhalar hangi yolu kullanmamız gerektiğini gösterir.'
  },
  // 9 — Scenario Sign
  {
    id: 'q9',
    style: 'scenario_sign',
    title: 'Yolun Üstünden Güvenli Geçiş',
    instruction: 'Merdivenle yolun üstünden geçmeyi gösteren levhayı direğe tak.',
    scenario: 'Geniş ve yoğun bir caddede araçların üstünden yürüyerek karşıya geçmek için hangi levhayı takip etmeliyiz?',
    sceneHint: 'Yoğun cadde üzerindeki köprü geçişi',
    correctSignId: 'ust_gecit',
    choices: ['alt_gecit', 'ust_gecit', 'yaya_gecidi_mavi', 'mecburi_yaya'],
    fact: 'Üst Geçit levhası yayaların merdivenle yukarı çıkıp yolun üstünden geçebileceğini gösterir.'
  },
  // 10 — Rule Builder
  {
    id: 'q10',
    style: 'rule_builder',
    title: 'Yaya ve Okul Geçitlerinde Nasıl Davranırız?',
    instruction: 'Doğru sözcükleri sürükleyerek güvenlik kuralını tamamla.',
    previewSigns: ['yaya_gecidi_mavi', 'okul_gecidi_mavi'],
    segments: ['Yaya ve okul geçitlerini kullanırken ', ' hareket ederiz. Levhaların anlamlarını bilmek ', ' için önemlidir.'],
    blanks: [
      { id: 'b1', answer: 'kontrollü' },
      { id: 'b2', answer: 'güvenliğimiz' }
    ],
    wordBank: ['kontrollü', 'güvenliğimiz', 'koşarak', 'oyunumuz'],
    fact: 'Geçitlerde önce sola, sonra sağa, tekrar sola bakarak kontrollü geçeriz.'
  },
  // 11 — Scenario Sign
  {
    id: 'q11',
    style: 'scenario_sign',
    title: 'İleride Yol Çalışması Var!',
    instruction: 'Sürücüleri yol çalışması konusunda uyaran levhayı direğe sürükle.',
    scenario: 'Belediye ekipleri ileride asfalt tamir ediyor. Sürücülerin yavaşlaması için hangi uyarı levhası konmalıdır?',
    sceneHint: 'Tamir edilen cadde girişi',
    correctSignId: 'yolda_calisma',
    choices: ['yolda_calisma', 'kontrolsuz_kavsak', 'isikli_isaret', 'yaya_gecidi_ucgen'],
    fact: 'Yolda Çalışma levhası sürücüleri ileride onarım ve işçiler olduğu konusunda uyarır.'
  },
  // 12 — Category Sort (3 Grup!)
  {
    id: 'q12',
    style: 'category_sort',
    title: 'Üçlü Levha Ayrıştırma',
    instruction: 'Her levhayı rengine ve görevine göre doğru sepete bırak.',
    categories: ['bilgi', 'uyari', 'yasak'],
    signs: ['okul_gecidi_mavi', 'kontrolsuz_kavsak', 'yaya_giremez'],
    fact: 'Renk ve şekil trafik levhalarını tanımamızı çok kolaylaştırır.'
  },
  // 13 — Match Pairs (Geçit Çeşitleri)
  {
    id: 'q13',
    style: 'match_pairs',
    title: 'Aynı İsim, Farklı Görev!',
    instruction: 'Yaya ve okul geçidi levhalarını kime seslendiğine göre eşleştir.',
    pairs: [
      { signId: 'yaya_gecidi_ucgen', targetLabel: 'Sürücüyü Uyarır (Yaya)', targetSub: 'Kırmızı üçgen — hız azalt!' },
      { signId: 'okul_gecidi_mavi', targetLabel: 'Yayaya Bilgi Verir (Okul)', targetSub: 'Mavi kare — geçit burada' },
      { signId: 'okul_gecidi_ucgen', targetLabel: 'Sürücüyü Uyarır (Okul)', targetSub: 'Kırmızı üçgen — öğrenciler geçebilir' }
    ],
    fact: 'Aynı geçit için mavi kare yayaya yol gösterir, kırmızı üçgen sürücüyü uyarır.'
  },
  // 14 — Scenario Sign
  {
    id: 'q14',
    style: 'scenario_sign',
    title: 'Yolun Altından Geçiş',
    instruction: 'Doğru bilgi levhasını direğe sürükleyip bırak.',
    scenario: 'Kerem ile annesi merdivenlerden aşağı inerek yoğun caddenin altından karşı tarafa geçecekler. Hangi levhayı aramalılar?',
    sceneHint: 'Caddenin altındaki yaya tüneli',
    correctSignId: 'alt_gecit',
    choices: ['ust_gecit', 'alt_gecit', 'yaya_giremez', 'yaya_gecidi_ucgen'],
    fact: 'Alt Geçit levhasında yaya merdivenlerden aşağıya doğru iner.'
  },
  // 15 — Rule Builder
  {
    id: 'q15',
    style: 'rule_builder',
    title: 'Yasak ve Mecburi Levhalar',
    instruction: 'Sözcükleri doğru yerlere sürükleyip kuralı oluştur.',
    previewSigns: ['bisiklet_giremez', 'mecburi_bisiklet'],
    segments: ['Kırmızı çemberli levhalar yapılması ', ' davranışları, mavi daire levhalar ise ', ' yolu gösterir.'],
    blanks: [
      { id: 'b1', answer: 'yasak olan' },
      { id: 'b2', answer: 'kullanılacak' }
    ],
    wordBank: ['yasak olan', 'kullanılacak', 'eğlenceli', 'kısa'],
    fact: 'Kırmızı çember = YASAK, Mavi daire = MECBURİ (kullanılacak yol)!'
  },
  // 16 — Category Sort (Mavi Kare vs Mavi Daire!)
  {
    id: 'q16',
    style: 'category_sort',
    title: 'İkisi de Mavi, Farkı Şekli!',
    instruction: 'Mavi kare (bilgi) ve mavi daire (mecburi yol) levhalarını ayır.',
    categories: ['bilgi', 'mecburi'],
    signs: ['ust_gecit', 'mecburi_yaya', 'yaya_gecidi_mavi', 'mecburi_bisiklet'],
    fact: 'Mavi kare levhalar geçit bilgisi verir; mavi daire levhalar zorunlu yolu gösterir.'
  },
  // 17 — Scenario Sign
  {
    id: 'q17',
    style: 'scenario_sign',
    title: 'Kavşağa Yaklaşırken Dikkat!',
    instruction: 'Kontrolsüz kavşak levhasını bulup direğe sürükle.',
    scenario: 'İki yolun kesiştiği yerde trafik lambası yok. Sürücülere "kavşağa yaklaşırken çok dikkatli ol" diyen levha hangisidir?',
    sceneHint: 'Işıksız yol kesişimi',
    correctSignId: 'kontrolsuz_kavsak',
    choices: ['kontrolsuz_kavsak', 'isikli_isaret', 'yolda_calisma', 'bisiklet_giremez'],
    fact: 'Üçgen içindeki siyah çarpı (✕) işareti Kontrolsüz Kavşak anlamına gelir.'
  },
  // 18 — Match Pairs (Karışık 3 Anlam)
  {
    id: 'q18',
    style: 'match_pairs',
    title: 'Açıklamayı Oku, Levhayı Bırak',
    instruction: 'Her açıklamanın yanına uygun trafik levhasını sürükle.',
    pairs: [
      { signId: 'bisiklet_giremez', targetLabel: 'Bu yolda bisiklet sürmek yasaktır' },
      { signId: 'isikli_isaret', targetLabel: 'İleride trafik ışıkları bulunuyor' },
      { signId: 'mecburi_yaya', targetLabel: 'Yayalar yürümek için bu yolu kullanmalıdır' }
    ],
    fact: 'Her trafik levhası yol kullanıcılarına net ve kısa bir mesaj verir.'
  },
  // 19 — Category Sort (Kırmızı Üçgen vs Kırmızı Çember!)
  {
    id: 'q19',
    style: 'category_sort',
    title: 'İkisi de Kırmızı, Görevi Farklı!',
    instruction: 'Kırmızı üçgen uyarı levhaları ile kırmızı çember yasak levhalarını ayır.',
    categories: ['uyari', 'yasak'],
    signs: ['okul_gecidi_ucgen', 'yaya_giremez', 'yolda_calisma', 'bisiklet_giremez'],
    fact: 'Kırmızı üçgen sürücüleri uyarır; kırmızı çember yasakları bildirir.'
  },
  // 20 — Scenario Sign
  {
    id: 'q20',
    style: 'scenario_sign',
    title: 'İleride Trafik Lambası Var',
    instruction: 'Trafik ışıklarını bildiren uyarı levhasını direğe tak.',
    scenario: 'Babam arabayla ilerlerken az sonra trafik ışıklarına ulaşacağımızı gösteren levhayı gördü. Bu levha hangisidir?',
    sceneHint: 'Trafik lambası öncesi cadde',
    correctSignId: 'isikli_isaret',
    choices: ['isikli_isaret', 'kontrolsuz_kavsak', 'yaya_gecidi_ucgen', 'okul_gecidi_mavi'],
    fact: 'Işıklı İşaret Cihazı levhası sürücüleri ileride trafik lambası olduğu konusunda uyarır.'
  },
  // 21 — Rule Builder
  {
    id: 'q21',
    style: 'rule_builder',
    title: 'Sürücü Uyarı Kuralı',
    instruction: 'Doğru sözcükleri boşluklara sürükleyip cümleyi tamamla.',
    previewSigns: ['okul_gecidi_ucgen', 'yaya_gecidi_ucgen'],
    segments: ['Sürücüler kırmızı üçgen levhaları gördüklerinde ', ' azaltır ve ', ' olurlar.'],
    blanks: [
      { id: 'b1', answer: 'hızlarını' },
      { id: 'b2', answer: 'dikkatli' }
    ],
    wordBank: ['hızlarını', 'dikkatli', 'korna sesini', 'hızlı'],
    fact: 'Sürücüler yaya ve okul geçidi uyarı levhalarını görünce hızlarını düşürür.'
  },
  // 22 — Match Pairs (Alt/Üst Geçit + Yaya Geçidi)
  {
    id: 'q22',
    style: 'match_pairs',
    title: 'Karşıya Nasıl Geçelim?',
    instruction: 'Geçiş yöntemine göre doğru mavi levhayı eşleştir.',
    pairs: [
      { signId: 'alt_gecit', targetLabel: 'Yolun altından geç', targetSub: 'Merdivenden aşağı inilir' },
      { signId: 'ust_gecit', targetLabel: 'Yolun üstünden geç', targetSub: 'Merdivenden yukarı çıkılır' },
      { signId: 'okul_gecidi_mavi', targetLabel: 'Okul geçidinden geç', targetSub: 'İki öğrenci sembolü' }
    ],
    fact: 'Alt geçit, üst geçit, yaya ve okul geçitleri en güvenli geçiş noktalarıdır.'
  },
  // 23 — Scenario Sign
  {
    id: 'q23',
    style: 'scenario_sign',
    title: 'Sadece Bisikletlilere Özel Yol',
    instruction: 'Bisikletlilerin kullanması gereken mecburi yol levhasını direğe sürükle.',
    scenario: 'Ali kaskını takıp bisikletine bindi. Bisiklet sürmek için kullanması gereken özel yolu gösteren mavi levha hangisi?',
    sceneHint: 'Park kenarındaki bisiklet şeridi',
    correctSignId: 'mecburi_bisiklet',
    choices: ['mecburi_bisiklet', 'bisiklet_giremez', 'mecburi_yaya', 'yaya_gecidi_mavi'],
    fact: 'Mavi daire içindeki beyaz bisiklet, Mecburi Bisiklet Yolu demektir.'
  },
  // 24 — Category Sort (3 Grup: Uyarı, Yasak, Mecburi)
  {
    id: 'q24',
    style: 'category_sort',
    title: 'Doğru Gruba Yerleştir',
    instruction: '3 farklı gruptaki levhaları doğru kutulara sürükle.',
    categories: ['uyari', 'yasak', 'mecburi'],
    signs: ['yaya_gecidi_ucgen', 'bisiklet_giremez', 'mecburi_yaya'],
    fact: 'Levhanın şekli (üçgen, çember, daire) görevini hemen ele verir.'
  },
  // 25 — Scenario Sign
  {
    id: 'q25',
    style: 'scenario_sign',
    title: 'Otoyola Yayalar Giremez!',
    instruction: 'Yayaların girmesinin yasak olduğunu bildiren levhayı direğe tak.',
    scenario: 'Hızlı araçların geçtiği bir çevre yolunun girişinde yayaların girmemesi için hangi levha bulunmalıdır?',
    sceneHint: 'Hızlı araç yolu girişi',
    correctSignId: 'yaya_giremez',
    choices: ['yaya_giremez', 'mecburi_yaya', 'yaya_gecidi_ucgen', 'alt_gecit'],
    fact: 'Kırmızı çember içindeki yaya işareti, o yola yayaların girmesinin yasak olduğunu gösterir.'
  },
  // 26 — Rule Builder
  {
    id: 'q26',
    style: 'rule_builder',
    title: 'Alt Geçit mi, Üst Geçit mi?',
    instruction: 'Doğru sözcükleri boşluklara sürükleyip açıklamaları tamamla.',
    previewSigns: ['alt_gecit', 'ust_gecit'],
    segments: ['Alt geçit yayaların yolun ', ', üst geçit ise yolun ', ' geçebileceğini gösterir.'],
    blanks: [
      { id: 'b1', answer: 'altından' },
      { id: 'b2', answer: 'üstünden' }
    ],
    wordBank: ['altından', 'üstünden', 'ortasından', 'kenarından'],
    fact: 'Ok ve merdiven yönü aşağı ise Alt Geçit, yukarı ise Üst Geçittir.'
  },
  // 27 — Match Pairs (Bisiklet & Yaya 4'lüden 3'ü)
  {
    id: 'q27',
    style: 'match_pairs',
    title: 'Sürücüleri Uyar, Yasakları Tanı',
    instruction: 'Her levhayı doğru görev kartına sürükleyip bırak.',
    pairs: [
      { signId: 'okul_gecidi_ucgen', targetLabel: 'Okul Geçidi Uyarısı', targetSub: 'Sürücüler yavaşlamalı' },
      { signId: 'yaya_giremez', targetLabel: 'Yaya Giremez', targetSub: 'Yayalar için yasak yol' },
      { signId: 'yolda_calisma', targetLabel: 'Yolda Çalışma', targetSub: 'İleride onarım var' }
    ],
    fact: 'Trafik levhaları hem yayaları hem sürücüleri kazalardan korur.'
  },
  // 28 — Scenario Sign
  {
    id: 'q28',
    style: 'scenario_sign',
    title: 'Yayalara Ayrılmış Yol',
    instruction: 'Yayaların kullanması gereken mecburi yol levhasını direğe tak.',
    scenario: 'Pazar caddesi araçlara kapatıldı ve sadece yayalar için ayrıldı. Yayaların bu yolu kullanması gerektiğini gösteren levha hangisidir?',
    sceneHint: 'Araçlara kapalı yaya yolu',
    correctSignId: 'mecburi_yaya',
    choices: ['mecburi_yaya', 'yaya_giremez', 'yaya_gecidi_mavi', 'mecburi_bisiklet'],
    fact: 'Mavi daire içinde el ele yürüyen yetişkin ve çocuk işareti Mecburi Yaya Yolunu gösterir.'
  },
  // 29 — Category Sort (Tüm 4 Kategori!)
  {
    id: 'q29',
    style: 'category_sort',
    title: 'Büyük 4’lü Levha Sıralaması',
    instruction: 'Dört farklı grubun her birinden bir levha var. Hepsini doğru kutuya yerleştir!',
    categories: ['bilgi', 'uyari', 'yasak', 'mecburi'],
    signs: ['alt_gecit', 'isikli_isaret', 'bisiklet_giremez', 'mecburi_bisiklet'],
    fact: 'Harika! Dört ana trafik levhası grubunun hepsini ayırt edebiliyorsun.'
  },
  // 30 — Rule Builder (Akılda Kalsın — Final!)
  {
    id: 'q30',
    style: 'rule_builder',
    title: 'Akılda Kalsın: Trafik Sorumluluğumuz',
    instruction: 'Son kuralımızı tamamlamak için doğru sözcükleri boşluklara sürükle.',
    previewSigns: ['yaya_gecidi_mavi', 'isikli_isaret', 'mecburi_yaya'],
    segments: ['Trafik levhalarını tanır, kurallara ', '. Kurallara uymak hepimizin ', '!'],
    blanks: [
      { id: 'b1', answer: 'uyarız' },
      { id: 'b2', answer: 'sorumluluğudur' }
    ],
    wordBank: ['uyarız', 'sorumluluğudur', 'bakmayız', 'oyunudur'],
    fact: 'Levhaları tanıyıp trafik kurallarına uyarak kendimizin ve başkalarının güvenliğini koruruz!'
  }
];
