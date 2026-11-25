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
    accentText: 'text-sky-700',
    badgeBg: 'bg-sky-600'
  },
  uyari: {
    id: 'uyari',
    title: 'Sürücüleri Uyaran Levhalar',
    shortTitle: 'Sürücüleri Uyarır',
    shapeHint: 'Kırmızı Üçgen',
    summary: 'Sürücüleri ilerideki geçit ve ışıklar için uyarır; hızlarını azaltırlar.',
    headerBg: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-400',
    accentText: 'text-amber-700',
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
    accentText: 'text-rose-700',
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
    accentText: 'text-emerald-700',
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
  shortHint: string;
}

export const TRAFFIC_SIGNS: Record<TrafficSignId, TrafficSignInfo> = {
  yaya_gecidi_mavi: {
    id: 'yaya_gecidi_mavi',
    name: 'Yaya Geçidi (Bilgi)',
    shortName: 'Yaya Geçidi',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yaya geçidinin yerini gösterir. Buradan kontrollü olarak karşıya geçebiliriz.',
    shortHint: 'Yayalara güvenli geçiş yerini gösterir'
  },
  okul_gecidi_mavi: {
    id: 'okul_gecidi_mavi',
    name: 'Okul Geçidi (Bilgi)',
    shortName: 'Okul Geçidi',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Okul geçidinin yerini gösterir. Buradan kontrollü olarak karşıya geçebiliriz.',
    shortHint: 'Okul önündeki güvenli geçişi gösterir'
  },
  alt_gecit: {
    id: 'alt_gecit',
    name: 'Alt Geçit',
    shortName: 'Alt Geçit',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yayaların yolun altından güvenle karşıya geçebileceğini gösterir.',
    shortHint: 'Merdivenle yolun altından geçiş'
  },
  ust_gecit: {
    id: 'ust_gecit',
    name: 'Üst Geçit',
    shortName: 'Üst Geçit',
    category: 'bilgi',
    shapeLabel: 'Mavi Kare',
    meaning: 'Yayaların yolun üstünden güvenle karşıya geçebileceğini gösterir.',
    shortHint: 'Merdivenle yolun üstünden geçiş'
  },
  yaya_gecidi_ucgen: {
    id: 'yaya_gecidi_ucgen',
    name: 'Yaya Geçidi (Uyarı)',
    shortName: 'Yaya Geçidi Uyarısı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Sürücüleri ileride yaya geçidi olduğu konusunda uyarır, hızlarını azaltırlar.',
    shortHint: 'Sürücüye ileride yaya geçidi olduğunu söyler'
  },
  okul_gecidi_ucgen: {
    id: 'okul_gecidi_ucgen',
    name: 'Okul Geçidi (Uyarı)',
    shortName: 'Okul Geçidi Uyarısı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Sürücüleri ileride okul geçidi olduğu konusunda uyarır.',
    shortHint: 'Sürücüyü öğrenciler geçebilir diye uyarır'
  },
  isikli_isaret: {
    id: 'isikli_isaret',
    name: 'Işıklı İşaret Cihazı',
    shortName: 'Işıklı İşaret Cihazı',
    category: 'uyari',
    shapeLabel: 'Kırmızı Üçgen',
    meaning: 'Sürücüleri ileride trafik ışıkları (ışıklı işaret cihazı) bulunduğu konusunda uyarır.',
    shortHint: 'İleride trafik lambası olduğunu bildirir'
  },
  bisiklet_giremez: {
    id: 'bisiklet_giremez',
    name: 'Bisiklet Giremez',
    shortName: 'Bisiklet Giremez',
    category: 'yasak',
    shapeLabel: 'Kırmızı Çember',
    meaning: 'Bu yolda bisiklet sürmek yasaktır.',
    shortHint: 'Bisiklet girişinin yasak olduğu yol'
  },
  yaya_giremez: {
    id: 'yaya_giremez',
    name: 'Yaya Giremez',
    shortName: 'Yaya Giremez',
    category: 'yasak',
    shapeLabel: 'Kırmızı Çember',
    meaning: 'Bu yola yayaların girmesi yasaktır.',
    shortHint: 'Yayaların girmesinin yasak olduğu yol'
  },
  mecburi_bisiklet: {
    id: 'mecburi_bisiklet',
    name: 'Mecburi Bisiklet Yolu',
    shortName: 'Mecburi Bisiklet Yolu',
    category: 'mecburi',
    shapeLabel: 'Mavi Daire',
    meaning: 'Bisiklet sürmek için bu yol kullanılmalıdır.',
    shortHint: 'Bisikletliler bu yolu kullanmalıdır'
  },
  mecburi_yaya: {
    id: 'mecburi_yaya',
    name: 'Mecburi Yaya Yolu',
    shortName: 'Mecburi Yaya Yolu',
    category: 'mecburi',
    shapeLabel: 'Mavi Daire',
    meaning: 'Yayalar yürümek için bu yolu kullanmalıdır.',
    shortHint: 'Yayalar yürümek için bu yolu kullanır'
  }
};

export const TRAFFIC_SIGN_LIST: TrafficSignInfo[] = Object.values(TRAFFIC_SIGNS);

// ─── EXACT 11 PRIMARY-SCHOOL TRAFFIC SIGNS FROM USER'S images.png ───────────

export const TRAFFIC_SIGN_IMAGES: Record<TrafficSignId, string> = {
  yaya_gecidi_mavi: '/assets/trafik/yaya_gecidi_mavi.png',
  okul_gecidi_mavi: '/assets/trafik/okul_gecidi_mavi.png',
  alt_gecit: '/assets/trafik/alt_gecit.png',
  ust_gecit: '/assets/trafik/ust_gecit.png',
  yaya_gecidi_ucgen: '/assets/trafik/yaya_gecidi_ucgen.png',
  okul_gecidi_ucgen: '/assets/trafik/okul_gecidi_ucgen.png',
  isikli_isaret: '/assets/trafik/isikli_isaret.png',
  bisiklet_giremez: '/assets/trafik/bisiklet_giremez.png',
  yaya_giremez: '/assets/trafik/yaya_giremez.png',
  mecburi_bisiklet: '/assets/trafik/mecburi_bisiklet.png',
  mecburi_yaya: '/assets/trafik/mecburi_yaya.png'
};

export const TrafficSignSvg: React.FC<{ signId: TrafficSignId; className?: string }> = ({
  signId,
  className = 'w-20 h-20'
}) => {
  const info = TRAFFIC_SIGNS[signId];
  return (
    <img
      src={TRAFFIC_SIGN_IMAGES[signId]}
      alt={info.name}
      draggable={false}
      className={`${className} object-contain select-none pointer-events-none rounded-lg`}
    />
  );
};

// ─── 7 DISTINCT INTERACTIVE QUESTION STYLES ──────────────────────────────────

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
  segments: string[];
  blanks: {
    id: string;
    answer: string;
  }[];
  wordBank: string[];
  fact: string;
}

export interface OddSignOutQuestion {
  id: string;
  style: 'odd_sign_out';
  title: string;
  instruction: string;
  groupRuleHint: string;
  signs: TrafficSignId[];
  oddSignId: TrafficSignId;
  wrongGroupReason: string;
  fact: string;
}

export interface TrueFalseQuestion {
  id: string;
  style: 'true_false_check';
  title: string;
  instruction: string;
  signId: TrafficSignId;
  statement: string;
  isTrue: boolean;
  wrongFeedback: string;
  fact: string;
}

export interface SignRiddleQuestion {
  id: string;
  style: 'sign_riddle';
  title: string;
  instruction: string;
  clues: { label: string; value: string }[];
  correctSignId: TrafficSignId;
  choices: TrafficSignId[];
  fact: string;
}

export type TrafikQuestion =
  | MatchPairsQuestion
  | CategorySortQuestion
  | ScenarioSignQuestion
  | RuleBuilderQuestion
  | OddSignOutQuestion
  | TrueFalseQuestion
  | SignRiddleQuestion;

export const QUESTION_STYLE_LABELS: Record<
  TrafikQuestion['style'],
  { label: string; shortMapLabel: string; accent: string }
> = {
  match_pairs: { label: 'Levha Eşleştirme', shortMapLabel: 'Eşleştir', accent: 'text-sky-700' },
  category_sort: { label: 'Grup Kutularına Ayır', shortMapLabel: 'Grupla', accent: 'text-amber-700' },
  scenario_sign: { label: 'Yol Kenarına Levha Tak', shortMapLabel: 'Senaryo', accent: 'text-emerald-700' },
  rule_builder: { label: 'Trafik Kuralını Tamamla', shortMapLabel: 'Kural', accent: 'text-fuchsia-700' },
  odd_sign_out: { label: 'Farklı Levhayı Bul', shortMapLabel: 'Farklı', accent: 'text-cyan-700' },
  true_false_check: { label: 'Doğru mu, Yanlış mı?', shortMapLabel: 'D / Y', accent: 'text-rose-700' },
  sign_riddle: { label: 'Levha Bilmecesi', shortMapLabel: 'Bilmece', accent: 'text-violet-700' }
};

// ─── CURATED QUESTION POOLS USING STRICTLY THE 11 SIGNS ──────────────────────

const SCENARIO_POOL: ScenarioSignQuestion[] = [
  {
    id: 'sc_okul_mavi',
    style: 'scenario_sign',
    title: 'Okul Önünde Karşıya Geçiş',
    instruction: 'Duruma uygun levhayı yol kenarındaki boş direğe sürükle.',
    scenario:
      'Zeynep okul çıkışında arkadaşlarıyla karşıya geçmek istiyor. Yayalara okul geçidinin yerini gösteren mavi levha hangisi?',
    sceneHint: 'Okul kapısının önündeki geçit',
    correctSignId: 'okul_gecidi_mavi',
    choices: ['okul_gecidi_mavi', 'okul_gecidi_ucgen', 'yaya_giremez', 'ust_gecit'],
    fact: 'Mavi kare Okul Geçidi levhası yayalara bilgi verir; buradan kontrollü olarak karşıya geçeriz.'
  },
  {
    id: 'sc_yaya_mavi',
    style: 'scenario_sign',
    title: 'Çizgili Yaya Geçidini Bul!',
    instruction: 'Yayalara güvenli geçiş noktasını gösteren mavi kare levhayı direğe tak.',
    scenario:
      'Mert ile ablası parktan eve dönerken caddenin karşısına geçecekler. Yaya geçidinin tam yerini gösteren mavi levha hangisidir?',
    sceneHint: 'Park karşısındaki yaya geçidi',
    correctSignId: 'yaya_gecidi_mavi',
    choices: ['yaya_gecidi_mavi', 'yaya_gecidi_ucgen', 'mecburi_yaya', 'alt_gecit'],
    fact: 'Mavi kare Yaya Geçidi levhası yayalara güvenle geçebilecekleri yeri gösterir.'
  },
  {
    id: 'sc_okul_ucgen',
    style: 'scenario_sign',
    title: 'Sürücülere Okul Uyarısı!',
    instruction: 'Sürücüleri ileride okul geçidi olduğu konusunda uyaran levhayı direğe tak.',
    scenario:
      'Sabah okula giden öğrenciler yoldan geçiyor. Sürücülerin yavaşlayıp dikkatli olması için hangi kırmızı üçgen levha konulmalı?',
    sceneHint: 'Okula yaklaşan cadde',
    correctSignId: 'okul_gecidi_ucgen',
    choices: ['okul_gecidi_ucgen', 'okul_gecidi_mavi', 'yaya_gecidi_ucgen', 'isikli_isaret'],
    fact: 'Kırmızı üçgen Okul Geçidi levhası sürücüleri uyarır; sürücüler hızlarını azaltır.'
  },
  {
    id: 'sc_yaya_ucgen',
    style: 'scenario_sign',
    title: 'Sürücülere Yaya Geçidi Uyarısı',
    instruction: 'Sürücüleri ileride yaya geçidi bulunduğu konusunda uyaran levhayı direğe tak.',
    scenario:
      'Araba kullanan sürücüye "ileride yaya geçidi var, hızını azalt!" diyen kırmızı üçgen levha hangisidir?',
    sceneHint: 'Yaya geçidine yaklaşan cadde',
    correctSignId: 'yaya_gecidi_ucgen',
    choices: ['yaya_gecidi_ucgen', 'yaya_gecidi_mavi', 'okul_gecidi_ucgen', 'yaya_giremez'],
    fact: 'Kırmızı üçgen Yaya Geçidi levhası sürücüleri uyarmak için yol kenarına konur.'
  },
  {
    id: 'sc_bisiklet_yasak',
    style: 'scenario_sign',
    title: 'Bisiklet Sürmek Yasak!',
    instruction: 'Bu sokağın girişine takılması gereken yasak levhasını direğe sürükle.',
    scenario:
      'Bu yürüyüş yolunda çok fazla yaya var ve bisiklet sürmek yasak. Girişe hangi levha konulmalıdır?',
    sceneHint: 'Bisiklete kapalı yürüyüş yolu',
    correctSignId: 'bisiklet_giremez',
    choices: ['bisiklet_giremez', 'mecburi_bisiklet', 'yaya_giremez', 'isikli_isaret'],
    fact: 'Kırmızı çember içindeki bisiklet işareti, o yolda bisiklet sürmenin yasak olduğunu bildirir.'
  },
  {
    id: 'sc_ust_gecit',
    style: 'scenario_sign',
    title: 'Yolun Üstünden Güvenli Geçiş',
    instruction: 'Merdivenle yolun üstünden geçmeyi gösteren levhayı direğe tak.',
    scenario:
      'Geniş ve yoğun bir caddede araçların üstünden yürüyerek karşıya geçmek için hangi levhayı takip etmeliyiz?',
    sceneHint: 'Yoğun cadde üzerindeki köprü geçişi',
    correctSignId: 'ust_gecit',
    choices: ['alt_gecit', 'ust_gecit', 'yaya_gecidi_mavi', 'mecburi_yaya'],
    fact: 'Üst Geçit levhası yayaların merdivenle yukarı çıkıp yolun üstünden geçebileceğini gösterir.'
  },
  {
    id: 'sc_alt_gecit',
    style: 'scenario_sign',
    title: 'Yolun Altından Geçiş',
    instruction: 'Doğru bilgi levhasını direğe sürükleyip bırak.',
    scenario:
      'Kerem ile annesi merdivenlerden aşağı inerek yoğun caddenin altından karşı tarafa geçecekler. Hangi levhayı aramalılar?',
    sceneHint: 'Caddenin altındaki yaya tüneli',
    correctSignId: 'alt_gecit',
    choices: ['ust_gecit', 'alt_gecit', 'yaya_giremez', 'yaya_gecidi_ucgen'],
    fact: 'Alt Geçit levhasında yaya merdivenlerden aşağıya doğru iner.'
  },
  {
    id: 'sc_isikli',
    style: 'scenario_sign',
    title: 'İleride Trafik Lambası Var',
    instruction: 'Trafik ışıklarını bildiren kırmızı üçgen uyarı levhasını direğe tak.',
    scenario:
      'Babam arabayla ilerlerken az sonra trafik ışıklarına ulaşacağımızı gösteren kırmızı üçgen levhayı gördü. Bu levha hangisidir?',
    sceneHint: 'Trafik lambası öncesi cadde',
    correctSignId: 'isikli_isaret',
    choices: ['isikli_isaret', 'yaya_gecidi_ucgen', 'okul_gecidi_ucgen', 'okul_gecidi_mavi'],
    fact: 'Kırmızı üçgen içindeki üç renkli trafik lambası, Işıklı İşaret Cihazı levhasıdır.'
  },
  {
    id: 'sc_mecburi_bisiklet',
    style: 'scenario_sign',
    title: 'Sadece Bisikletlilere Özel Yol',
    instruction: 'Bisikletlilerin kullanması gereken mecburi yol levhasını direğe sürükle.',
    scenario:
      'Ali kaskını takıp bisikletine bindi. Bisiklet sürmek için kullanması gereken özel yolu gösteren mavi daire levha hangisi?',
    sceneHint: 'Park kenarındaki bisiklet şeridi',
    correctSignId: 'mecburi_bisiklet',
    choices: ['mecburi_bisiklet', 'bisiklet_giremez', 'mecburi_yaya', 'yaya_gecidi_mavi'],
    fact: 'Mavi daire içindeki beyaz bisiklet, Mecburi Bisiklet Yolu demektir.'
  },
  {
    id: 'sc_yaya_giremez',
    style: 'scenario_sign',
    title: 'Otoyola Yayalar Giremez!',
    instruction: 'Yayaların girmesinin yasak olduğunu bildiren levhayı direğe tak.',
    scenario:
      'Hızlı araçların geçtiği bir çevre yolunun girişinde yayaların girmemesi için hangi levha bulunmalıdır?',
    sceneHint: 'Hızlı araç yolu girişi',
    correctSignId: 'yaya_giremez',
    choices: ['yaya_giremez', 'mecburi_yaya', 'yaya_gecidi_ucgen', 'bisiklet_giremez'],
    fact: 'Kırmızı çember içindeki yaya işareti, o yola yayaların girmesinin yasak olduğunu gösterir.'
  },
  {
    id: 'sc_mecburi_yaya',
    style: 'scenario_sign',
    title: 'Yayalara Ayrılmış Yol',
    instruction: 'Yayaların kullanması gereken mecburi yol levhasını direğe tak.',
    scenario:
      'Pazar caddesi araçlara kapatıldı ve sadece yayalar için ayrıldı. Yayaların bu yolu kullanması gerektiğini gösteren levha hangisidir?',
    sceneHint: 'Araçlara kapalı yaya yolu',
    correctSignId: 'mecburi_yaya',
    choices: ['mecburi_yaya', 'yaya_giremez', 'yaya_gecidi_mavi', 'mecburi_bisiklet'],
    fact: 'Mavi daire içinde el ele yürüyen yetişkin ve çocuk işareti Mecburi Yaya Yolunu gösterir.'
  },
  {
    id: 'sc_bisiklet_park',
    style: 'scenario_sign',
    title: 'Parkta Bisiklet Şeridi',
    instruction: 'Bisiklet sürerken takip etmemiz gereken levhayı direğe yerleştir.',
    scenario:
      'Ece yeni bisikletiyle parkta güvenle gezmek istiyor. Sadece bisikletlilerin gideceği yolu gösteren levha hangisidir?',
    sceneHint: 'Yeşil park kenarındaki bisiklet yolu',
    correctSignId: 'mecburi_bisiklet',
    choices: ['mecburi_bisiklet', 'bisiklet_giremez', 'ust_gecit', 'mecburi_yaya'],
    fact: 'Bisiklet sürerken her zaman Mecburi Bisiklet Yolu levhasının olduğu şeridi kullanırız.'
  }
];

const RULE_BUILDER_POOL: RuleBuilderQuestion[] = [
  {
    id: 'rb_ayrim',
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
  {
    id: 'rb_kontrollu',
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
  {
    id: 'rb_yasak_mecburi',
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
  {
    id: 'rb_surucu_hiz',
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
  {
    id: 'rb_alt_ust',
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
    fact: 'Merdiven yönü aşağı ise Alt Geçit, yukarı ise Üst Geçittir.'
  },
  {
    id: 'rb_sorumluluk',
    style: 'rule_builder',
    title: 'Akılda Kalsın: Trafik Sorumluluğumuz',
    instruction: 'Doğru sözcükleri boşluklara sürükleyerek kuralı tamamla.',
    previewSigns: ['yaya_gecidi_mavi', 'isikli_isaret', 'mecburi_yaya'],
    segments: ['Trafik levhalarını tanır, kurallara ', '. Kurallara uymak hepimizin ', '!'],
    blanks: [
      { id: 'b1', answer: 'uyarız' },
      { id: 'b2', answer: 'sorumluluğudur' }
    ],
    wordBank: ['uyarız', 'sorumluluğudur', 'bakmayız', 'oyunudur'],
    fact: 'Levhaları tanıyıp trafik kurallarına uyarak kendimizin ve başkalarının güvenliğini koruruz!'
  },
  {
    id: 'rb_bisiklet_kural',
    style: 'rule_builder',
    title: 'Bisiklet Sürerken Levhaları Oku',
    instruction: 'Doğru sözcükleri sürükleyerek bisiklet güvenliği kuralını tamamla.',
    previewSigns: ['mecburi_bisiklet', 'bisiklet_giremez'],
    segments: ['Bisiklet sürerken ', ' daireli bisiklet yolunu seçeriz; ', ' çemberli yasak yollara girmeyiz.'],
    blanks: [
      { id: 'b1', answer: 'mavi' },
      { id: 'b2', answer: 'kırmızı' }
    ],
    wordBank: ['mavi', 'kırmızı', 'sarı', 'yeşil'],
    fact: 'Mavi daire bisiklet yolunu gösterir, kırmızı çember ise bisikletin girmesini yasaklar.'
  },
  {
    id: 'rb_trafik_isigi',
    style: 'rule_builder',
    title: 'Işıklı İşaret Cihazında Kurallar',
    instruction: 'Trafik ışıklarındaki temel kuralı doğru sözcüklerle tamamla.',
    previewSigns: ['isikli_isaret', 'yaya_gecidi_mavi'],
    segments: ['Yaya ışığı ', ' yandığında durup bekleriz, ', ' yandığında yolu kontrol edip geçeriz.'],
    blanks: [
      { id: 'b1', answer: 'kırmızı' },
      { id: 'b2', answer: 'yeşil' }
    ],
    wordBank: ['kırmızı', 'yeşil', 'mor', 'pembe'],
    fact: 'Yeşil ışık yansa bile araçların durduğundan emin olarak karşıya geçmeliyiz.'
  },
  {
    id: 'rb_yaya_yasak_mecburi',
    style: 'rule_builder',
    title: 'Yaya Olarak Nereden Yürürüz?',
    instruction: 'Doğru sözcükleri yerleştirip yaya kuralını tamamla.',
    previewSigns: ['mecburi_yaya', 'yaya_giremez'],
    segments: ['Yayalar yürümek için ', ' yaya yolunu kullanır, yaya giremez levhası olan yola ', '.'],
    blanks: [
      { id: 'b1', answer: 'mecburi' },
      { id: 'b2', answer: 'girmez' }
    ],
    wordBank: ['mecburi', 'girmez', 'yasak', 'koşar'],
    fact: 'Mavi daire Mecburi Yaya Yolunu, kırmızı çember ise Yaya Giremez yasağını bildirir.'
  }
];

const TRUE_FALSE_POOL: TrueFalseQuestion[] = [
  {
    id: 'tf_ucgen_yaya',
    style: 'true_false_check',
    title: 'Bu Bilgi Doğru mu, Yanlış mı?',
    instruction: 'Levhayı dikkatle incele, verilen cümle doğruysa DOĞRU, yanlışsa YANLIŞ kutusunu seç.',
    signId: 'yaya_gecidi_ucgen',
    statement: 'Bu kırmızı üçgen levha yayalara bilgi vermek için kullanılır.',
    isTrue: false,
    wrongFeedback: 'Dikkat! Kırmızı üçgen levhalar yayalara değil, sürücüleri uyarmak için kullanılır.',
    fact: 'Kırmızı üçgen Yaya Geçidi levhası sürücüleri uyarır; mavi kare olanı yayalara bilgi verir.'
  },
  {
    id: 'tf_alt_gecit',
    style: 'true_false_check',
    title: 'Alt Geçit Kontrolü',
    instruction: 'Verilen açıklama bu levha için doğru mu, yanlış mı?',
    signId: 'alt_gecit',
    statement: 'Bu levha yayaların yolun altından güvenle karşıya geçebileceğini gösterir.',
    isTrue: true,
    wrongFeedback: 'Merdivenin yönüne tekrar bak! Yaya aşağıya, yani yolun altına doğru iniyor.',
    fact: 'Alt Geçit levhasında yaya merdivenden aşağı iner ve yolun altından güvenle geçer.'
  },
  {
    id: 'tf_bisiklet_yasak',
    style: 'true_false_check',
    title: 'Bisiklet Yolu mu, Yasak mı?',
    instruction: 'Levhanın şekline ve rengine bakıp karar ver!',
    signId: 'bisiklet_giremez',
    statement: 'Bu levhayı gördüğümüz yolda bisiklet sürmek serbesttir ve zorunludur.',
    isTrue: false,
    wrongFeedback: 'Kırmızı çember her zaman YASAK bildirir! Bu yola bisikletle girilmez.',
    fact: 'Kırmızı çember içindeki bisiklet işareti "Bisiklet Giremez" demektir.'
  },
  {
    id: 'tf_mecburi_yaya',
    style: 'true_false_check',
    title: 'Mavi Daire Ne Anlatır?',
    instruction: 'Cümle doğruysa DOĞRU, yanlışsa YANLIŞ kartına tıkla veya levhayı sürükle.',
    signId: 'mecburi_yaya',
    statement: 'Bu mavi daire levha yayaların yürümek için bu yolu kullanması gerektiğini gösterir.',
    isTrue: true,
    wrongFeedback: 'Mavi daire içindeki yaya figürleri, yayaların kullanması gereken mecburi yolu gösterir.',
    fact: 'Mavi daire levhalar kullanılması gereken mecburi yolları bildirir.'
  },
  {
    id: 'tf_ust_gecit_alt',
    style: 'true_false_check',
    title: 'Merdiven Nereye Çıkıyor?',
    instruction: 'Levhanın üzerindeki merdiven yönünü kontrol et.',
    signId: 'ust_gecit',
    statement: 'Bu levha yayaların yolun altından geçmesi gerektiğini gösterir.',
    isTrue: false,
    wrongFeedback: 'Merdivene dikkatli bak! Yaya yukarı doğru çıkıyor, yani bu bir Üst Geçit levhasıdır.',
    fact: 'Üst Geçit levhasında yaya merdivenlerden yukarı çıkarak yolun üstünden geçer.'
  },
  {
    id: 'tf_yaya_giremez',
    style: 'true_false_check',
    title: 'Yayalar Buradan Geçebilir mi?',
    instruction: 'Kırmızı çemberli levhaya dikkatlice bak!',
    signId: 'yaya_giremez',
    statement: 'Bu levhayı gören yayalar güvenle yola girebilir.',
    isTrue: false,
    wrongFeedback: 'Kırmızı çember yasak bildirir! Bu levhayı gördüğümüz yola yayalar giremez.',
    fact: 'Yaya Giremez levhası genellikle otoyol ve hızlı araç yollarının girişinde bulunur.'
  },
  {
    id: 'tf_okul_mavi',
    style: 'true_false_check',
    title: 'Okul Geçidi Bilgi Levhası',
    instruction: 'Mavi kare levhaya dikkatle bak ve değerlendir.',
    signId: 'okul_gecidi_mavi',
    statement: 'Bu mavi kare levha yayalara okul geçidinin yerini bildirir.',
    isTrue: true,
    wrongFeedback: 'Mavi kare levhalar yayalara geçidin tam yerini gösteren bilgi levhalarıdır.',
    fact: 'Okul geçidi levhasının bulunduğu yerde araçların durmasını bekleyip kontrollü geçeriz.'
  },
  {
    id: 'tf_isikli_isaret',
    style: 'true_false_check',
    title: 'Trafik Işıkları Levhası',
    instruction: 'Üç renkli ışık simgesini incele ve karar ver.',
    signId: 'isikli_isaret',
    statement: 'Bu kırmızı üçgen levha ileride ışıklı işaret cihazı (trafik lambası) bulunduğunu bildirir.',
    isTrue: true,
    wrongFeedback: 'Üçgen içindeki kırmızı, sarı ve yeşil ışıklar ileride trafik lambası olduğunu anlatır.',
    fact: 'Trafik ışıkları hem yayaların hem araçların sırayla ve güvenle geçmesini sağlar.'
  },
  {
    id: 'tf_mecburi_bisiklet',
    style: 'true_false_check',
    title: 'Bisiklet Yolu Kontrolü',
    instruction: 'Mavi daire içindeki bisiklet simgesini incele.',
    signId: 'mecburi_bisiklet',
    statement: 'Bu levha bisiklet sürmek için bu yolun kullanılması gerektiğini gösterir.',
    isTrue: true,
    wrongFeedback: 'Mavi daire içindeki beyaz bisiklet, Mecburi Bisiklet Yolunu gösterir.',
    fact: 'Bisiklet sürerken güvenli olan mecburi bisiklet yollarını kullanmalıyız.'
  },
  {
    id: 'tf_okul_ucgen',
    style: 'true_false_check',
    title: 'Okul Geçidi Uyarısı',
    instruction: 'Kırmızı üçgen levhayı dikkatle incele ve karar ver.',
    signId: 'okul_gecidi_ucgen',
    statement: 'Bu levha sürücüleri ileride okul geçidi olduğu konusunda uyarır.',
    isTrue: true,
    wrongFeedback: 'Kırmızı üçgen içinde çantalı öğrenciler, sürücüleri okul geçidi için uyarır.',
    fact: 'Sürücüler kırmızı üçgen Okul Geçidi levhasını görünce hızlarını azaltır.'
  },
  {
    id: 'tf_yaya_mavi',
    style: 'true_false_check',
    title: 'Mavi Yaya Geçidi',
    instruction: 'Verilen cümle bu levha için doğru mu, yanlış mı?',
    signId: 'yaya_gecidi_mavi',
    statement: 'Bu mavi kare levha yayaların bu yola girmesinin yasak olduğunu bildirir.',
    isTrue: false,
    wrongFeedback: 'Hayır! Mavi kare yasak değil, bilgi levhasıdır — buradan kontrollü karşıya geçebiliriz.',
    fact: 'Mavi kare Yaya Geçidi levhası yayalara güvenli geçiş yerini gösterir.'
  },
  {
    id: 'tf_isikli_yasak',
    style: 'true_false_check',
    title: 'Işıklı İşaret Levhası Ne Grubu?',
    instruction: 'Kırmızı üçgenin görevini düşün ve karar ver.',
    signId: 'isikli_isaret',
    statement: 'Bu levha bisikletlilerin yola girmesini yasaklar.',
    isTrue: false,
    wrongFeedback: 'İçindeki simgeye bak! Trafik ışıkları var — bu levha ileride trafik lambası olduğunu uyarır.',
    fact: 'Işıklı İşaret Cihazı levhası sürücüleri ileride trafik ışıkları olduğu konusunda uyarır.'
  }
];

const SIGN_RIDDLE_POOL: SignRiddleQuestion[] = [
  {
    id: 'rid_alt_gecit',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Aşağı İnen Merdiven',
    instruction: 'Üç ipucunu oku, doğru levhaya dokun veya büyüteç kutusuna sürükle!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Kare' },
      { label: 'Görevim', value: 'Yayalara bilgi veririm' },
      { label: 'Sembolüm', value: 'Merdivenden aşağı inen yaya' }
    ],
    correctSignId: 'alt_gecit',
    choices: ['alt_gecit', 'ust_gecit', 'yaya_gecidi_mavi', 'mecburi_yaya'],
    fact: 'Alt Geçit levhası mavi karedir ve merdivenle yolun altından geçişi gösterir.'
  },
  {
    id: 'rid_ust_gecit',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Yukarı Çıkan Merdiven',
    instruction: 'İpuçlarını okuyup doğru bilgi levhasını seç!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Kare' },
      { label: 'Görevim', value: 'Yolun üstünden geçişi gösteririm' },
      { label: 'Sembolüm', value: 'Merdivenden yukarı çıkan yaya' }
    ],
    correctSignId: 'ust_gecit',
    choices: ['ust_gecit', 'alt_gecit', 'okul_gecidi_mavi', 'yaya_gecidi_mavi'],
    fact: 'Üst Geçit levhası yayaların yolun üstünden güvenle geçmesini sağlar.'
  },
  {
    id: 'rid_yaya_mavi',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Çizgili Geçit',
    instruction: 'Üç ipucunu takip ederek gizli levhayı seç!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Kare' },
      { label: 'Görevim', value: 'Yayalara geçiş yerini gösteririm' },
      { label: 'Sembolüm', value: 'Beyaz üçgen içinde tek yürüyen yaya' }
    ],
    correctSignId: 'yaya_gecidi_mavi',
    choices: ['yaya_gecidi_mavi', 'okul_gecidi_mavi', 'yaya_gecidi_ucgen', 'mecburi_yaya'],
    fact: 'Mavi kare Yaya Geçidi levhası yayalara güvenle geçebilecekleri yeri gösterir.'
  },
  {
    id: 'rid_okul_mavi',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Okul Önündeki Mavi Levha',
    instruction: 'İpuçlarını birleştirip gizli levhayı bul!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Kare' },
      { label: 'Görevim', value: 'Öğrencilere geçit yerini gösteririm' },
      { label: 'Sembolüm', value: 'Çantalı yürüyen iki öğrenci' }
    ],
    correctSignId: 'okul_gecidi_mavi',
    choices: ['okul_gecidi_mavi', 'okul_gecidi_ucgen', 'yaya_gecidi_mavi', 'alt_gecit'],
    fact: 'Mavi kare Okul Geçidi levhası yayalara okul geçidinin yerini bildirir.'
  },
  {
    id: 'rid_yaya_ucgen',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Sürücüye Yaya Uyarısı',
    instruction: 'Şekil ve görev ipuçlarına dikkat et!',
    clues: [
      { label: 'Şeklim', value: 'Kırmızı Üçgen' },
      { label: 'Görevim', value: 'Sürücüleri yavaşlamaları için uyarırım' },
      { label: 'Sembolüm', value: 'Çizgili geçitten yürüyen tek yaya' }
    ],
    correctSignId: 'yaya_gecidi_ucgen',
    choices: ['yaya_gecidi_ucgen', 'yaya_gecidi_mavi', 'okul_gecidi_ucgen', 'yaya_giremez'],
    fact: 'Kırmızı üçgen Yaya Geçidi levhası sürücüleri ilerideki yaya geçidi için uyarır.'
  },
  {
    id: 'rid_okul_ucgen',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Sürücüye Okul Uyarısı',
    instruction: 'Şekil ve görev ipuçlarına çok dikkat et!',
    clues: [
      { label: 'Şeklim', value: 'Kırmızı Üçgen' },
      { label: 'Görevim', value: 'Sürücüleri öğrenciler için uyarırım' },
      { label: 'Sembolüm', value: 'Çantalı yürüyen iki öğrenci' }
    ],
    correctSignId: 'okul_gecidi_ucgen',
    choices: ['okul_gecidi_ucgen', 'okul_gecidi_mavi', 'yaya_gecidi_ucgen', 'mecburi_yaya'],
    fact: 'Kırmızı üçgen Okul Geçidi levhası sürücüleri okul önü için uyarır.'
  },
  {
    id: 'rid_isikli',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Üç Renkli Işık',
    instruction: 'Verilen ipuçlarından hangi levha olduğunu bul!',
    clues: [
      { label: 'Şeklim', value: 'Kırmızı Üçgen' },
      { label: 'Görevim', value: 'Sürücüleri uyarırım' },
      { label: 'Sembolüm', value: 'Kırmızı, sarı ve yeşil trafik ışıkları' }
    ],
    correctSignId: 'isikli_isaret',
    choices: ['isikli_isaret', 'okul_gecidi_ucgen', 'yaya_gecidi_ucgen', 'bisiklet_giremez'],
    fact: 'Işıklı İşaret Cihazı levhası ileride trafik lambası olduğunu bildirir.'
  },
  {
    id: 'rid_bisiklet_yasak',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Bisiklet Yasağı',
    instruction: 'İpuçlarına uyan tek levhayı seç veya büyütece sürükle!',
    clues: [
      { label: 'Şeklim', value: 'Kırmızı Çember' },
      { label: 'Görevim', value: 'Yasak bildiririm' },
      { label: 'Sembolüm', value: 'Beyaz zemin içinde siyah bisiklet' }
    ],
    correctSignId: 'bisiklet_giremez',
    choices: ['bisiklet_giremez', 'mecburi_bisiklet', 'yaya_giremez', 'yaya_gecidi_ucgen'],
    fact: 'Bisiklet Giremez levhası kırmızı çemberli bir yasak levhasıdır.'
  },
  {
    id: 'rid_yaya_yasak',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Yaya Yasağı',
    instruction: 'Üç ipucunu okuyup yasak levhasını bul!',
    clues: [
      { label: 'Şeklim', value: 'Kırmızı Çember' },
      { label: 'Görevim', value: 'Yayaların girmesini yasaklarım' },
      { label: 'Sembolüm', value: 'Beyaz zemin içinde siyah yürüyen yaya' }
    ],
    correctSignId: 'yaya_giremez',
    choices: ['yaya_giremez', 'mecburi_yaya', 'bisiklet_giremez', 'yaya_gecidi_mavi'],
    fact: 'Kırmızı çember içindeki yaya işareti Yaya Giremez levhasıdır.'
  },
  {
    id: 'rid_mecburi_bisiklet',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: Bisikletlinin Dostu',
    instruction: 'İpuçlarını oku ve doğru levhayı bul!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Daire' },
      { label: 'Görevim', value: 'Kullanılacak yolu gösteririm' },
      { label: 'Sembolüm', value: 'Mavi zemin üstünde beyaz bisiklet' }
    ],
    correctSignId: 'mecburi_bisiklet',
    choices: ['mecburi_bisiklet', 'bisiklet_giremez', 'mecburi_yaya', 'alt_gecit'],
    fact: 'Mavi daire içindeki beyaz bisiklet, Mecburi Bisiklet Yolunu gösterir.'
  },
  {
    id: 'rid_mecburi_yaya',
    style: 'sign_riddle',
    title: 'Dedektif Bilmecesi: El Ele Yürüyüş',
    instruction: 'İpuçlarına uyan mavi daire levhayı seç!',
    clues: [
      { label: 'Şeklim', value: 'Mavi Daire' },
      { label: 'Görevim', value: 'Yayaların yürüyeceği yolu gösteririm' },
      { label: 'Sembolüm', value: 'El ele yürüyen büyük ve çocuk' }
    ],
    correctSignId: 'mecburi_yaya',
    choices: ['mecburi_yaya', 'yaya_giremez', 'mecburi_bisiklet', 'okul_gecidi_mavi'],
    fact: 'Mavi daire içinde el ele yürüyen yetişkin ve çocuk Mecburi Yaya Yolunu gösterir.'
  }
];

// ─── RANDOM UTILITIES & PROCEDURAL QUESTION SYNTHESIS ────────────────────────

export function randomShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SIGNS_BY_CATEGORY: Record<TrafficCategoryId, TrafficSignId[]> = {
  bilgi: TRAFFIC_SIGN_LIST.filter(s => s.category === 'bilgi').map(s => s.id),
  uyari: TRAFFIC_SIGN_LIST.filter(s => s.category === 'uyari').map(s => s.id),
  yasak: TRAFFIC_SIGN_LIST.filter(s => s.category === 'yasak').map(s => s.id),
  mecburi: TRAFFIC_SIGN_LIST.filter(s => s.category === 'mecburi').map(s => s.id)
};

const MATCH_PAIR_THEMES: {
  id: string;
  title: string;
  instruction: string;
  pool: TrafficSignId[];
  fact: string;
}[] = [
  {
    id: 'mp_bilgi',
    title: 'Yayalara Bilgi Veren Levhaları Eşleştir',
    instruction: 'Her mavi kare levhayı doğru açıklamasına sürükleyip bırak.',
    pool: SIGNS_BY_CATEGORY.bilgi,
    fact: 'Mavi kare levhalar yayalara güvenle karşıya geçebilecekleri yerleri gösterir.'
  },
  {
    id: 'mp_uyari',
    title: 'Sürücü Uyarı Levhalarını Eşleştir',
    instruction: 'Kırmızı üçgen uyarı levhalarını doğru anlamlarıyla eşleştir.',
    pool: SIGNS_BY_CATEGORY.uyari,
    fact: 'Kırmızı üçgen uyarı levhaları sürücülerin hız azaltıp dikkatli olmasını sağlar.'
  },
  {
    id: 'mp_yasak_mecburi',
    title: 'Yasak ve Mecburi Yol Levhaları',
    instruction: 'Kırmızı çember ve mavi daire levhaları doğru kurala sürükle.',
    pool: [...SIGNS_BY_CATEGORY.yasak, ...SIGNS_BY_CATEGORY.mecburi],
    fact: 'Kırmızı çember yasakları, mavi daire ise kullanılması gereken yolları gösterir.'
  },
  {
    id: 'mp_gecit_farki',
    title: 'Aynı Geçit, Farklı Görev!',
    instruction: 'Geçit levhalarını şekline ve kime seslendiğine göre eşleştir.',
    pool: ['yaya_gecidi_mavi', 'yaya_gecidi_ucgen', 'okul_gecidi_mavi', 'okul_gecidi_ucgen', 'alt_gecit', 'ust_gecit'],
    fact: 'Mavi kare geçit levhaları yayaya bilgi verir; kırmızı üçgen olanlar sürücüyü uyarır.'
  },
  {
    id: 'mp_karisik_1',
    title: 'Karışık Trafik Levhaları Eşleştirme',
    instruction: 'Her açıklamanın yanına uygun trafik levhasını sürükle.',
    pool: TRAFFIC_SIGN_LIST.map(s => s.id),
    fact: 'Renk ve şekil ipuçlarına bakarak her trafik levhasını kolayca tanıyabilirsin.'
  },
  {
    id: 'mp_karisik_2',
    title: 'Görevine Göre Levhayı Bul',
    instruction: 'Açıklamayı dikkatle oku ve doğru levhayı yanına bırak.',
    pool: TRAFFIC_SIGN_LIST.map(s => s.id),
    fact: 'Trafik levhalarının anlamını bilmek hepimizi kazalardan korur.'
  }
];

function generateDynamicMatchPair(theme: (typeof MATCH_PAIR_THEMES)[number], nonce: number): MatchPairsQuestion {
  const picked = randomShuffle(theme.pool).slice(0, 3);
  return {
    id: `${theme.id}_${nonce}_${picked.join('_')}`,
    style: 'match_pairs',
    title: theme.title,
    instruction: theme.instruction,
    pairs: picked.map(signId => {
      const info = TRAFFIC_SIGNS[signId];
      const meaningFocus = Math.random() < 0.4;
      return meaningFocus
        ? {
            signId,
            targetLabel: info.shortHint,
            targetSub: info.shapeLabel
          }
        : {
            signId,
            targetLabel: info.name,
            targetSub: info.shortHint
          };
    }),
    fact: theme.fact
  };
}

const CATEGORY_SORT_RECIPES: {
  id: string;
  title: string;
  instruction: string;
  categories: TrafficCategoryId[];
  perCat: number;
  fact: string;
}[] = [
  {
    id: 'cs_bilgi_uyari',
    title: 'Bilgi mi, Uyarı mı?',
    instruction: 'Mavi kare bilgi levhalarını ve kırmızı üçgen uyarı levhalarını doğru sepete bırak.',
    categories: ['bilgi', 'uyari'],
    perCat: 2,
    fact: 'Mavi kare levhalar bilgi verir; kırmızı üçgen levhalar sürücüleri uyarır.'
  },
  {
    id: 'cs_yasak_mecburi',
    title: 'Yasak mı, Kullanılacak Yol mu?',
    instruction: 'Kırmızı çemberli yasak levhaları ile mavi daireli yol levhalarını ayır.',
    categories: ['yasak', 'mecburi'],
    perCat: 2,
    fact: 'Kırmızı çember yasakları, mavi daire ise kullanılması gereken yolu gösterir.'
  },
  {
    id: 'cs_iki_mavi',
    title: 'İkisi de Mavi, Farkı Şekli!',
    instruction: 'Mavi kare (bilgi) ve mavi daire (kullanılacak yol) levhalarını doğru kutuya sürükle.',
    categories: ['bilgi', 'mecburi'],
    perCat: 2,
    fact: 'Mavi kare bilgi verir; mavi daire yayaların ve bisikletlilerin kullanacağı yolu bildirir.'
  },
  {
    id: 'cs_iki_kirmizi',
    title: 'İkisi de Kırmızı, Görevi Farklı!',
    instruction: 'Kırmızı üçgen uyarı levhaları ile kırmızı çember yasak levhalarını ayır.',
    categories: ['uyari', 'yasak'],
    perCat: 2,
    fact: 'Kırmızı üçgen sürücüleri uyarır; kırmızı çember yasakları bildirir.'
  },
  {
    id: 'cs_uclu_1',
    title: 'Üçlü Levha Ayrıştırma',
    instruction: 'Her levhayı rengine ve şekline göre 3 sepetten doğru olana bırak.',
    categories: ['bilgi', 'uyari', 'yasak'],
    perCat: 1,
    fact: 'Renk ve şekil trafik levhalarını tanımamızı çok kolaylaştırır.'
  },
  {
    id: 'cs_uclu_2',
    title: 'Üç Farklı Grup, Doğru Sepet!',
    instruction: 'Uyarı, yasak ve kullanılacak yol levhalarını doğru kutulara sürükle.',
    categories: ['uyari', 'yasak', 'mecburi'],
    perCat: 1,
    fact: 'Üçgen = Uyarı, Kırmızı Çember = Yasak, Mavi Daire = Kullanılacak Yol!'
  },
  {
    id: 'cs_dortlu',
    title: 'Büyük 4’lü Levha Sıralaması',
    instruction: 'Dört ana grubun her birinden bir levha var. Hepsini doğru kutuya yerleştir!',
    categories: ['bilgi', 'uyari', 'yasak', 'mecburi'],
    perCat: 1,
    fact: 'Harika! Dört ana trafik levhası grubunun hepsini ayırt edebiliyorsun.'
  }
];

function generateDynamicCategorySort(
  recipe: (typeof CATEGORY_SORT_RECIPES)[number],
  nonce: number
): CategorySortQuestion {
  const chosenSigns: TrafficSignId[] = [];
  for (const cat of recipe.categories) {
    const picked = randomShuffle(SIGNS_BY_CATEGORY[cat]).slice(0, recipe.perCat);
    chosenSigns.push(...picked);
  }
  return {
    id: `${recipe.id}_${nonce}_${chosenSigns.join('_')}`,
    style: 'category_sort',
    title: recipe.title,
    instruction: recipe.instruction,
    categories: randomShuffle(recipe.categories),
    signs: randomShuffle(chosenSigns),
    fact: recipe.fact
  };
}

function generateDynamicOddSignOut(mainCat: 'bilgi' | 'uyari', oddCat: TrafficCategoryId, nonce: number): OddSignOutQuestion {
  const threeSame = randomShuffle(SIGNS_BY_CATEGORY[mainCat]).slice(0, 3);
  const oneOdd = randomShuffle(SIGNS_BY_CATEGORY[oddCat])[0];

  const mainMeta = TRAFFIC_CATEGORIES[mainCat];
  const oddMeta = TRAFFIC_CATEGORIES[oddCat];

  return {
    id: `odd_${mainCat}_vs_${oddCat}_${nonce}_${oneOdd}`,
    style: 'odd_sign_out',
    title: 'Gruba Uymayan Farklı Levhayı Bul!',
    instruction: '3 levha aynı gruba ait, 1 tanesi farklı! Farklı levhaya dokun veya kutuya sürükle.',
    groupRuleHint: `Üç levha "${mainMeta.shortTitle} (${mainMeta.shapeHint})" grubundan. Hangisi farklı?`,
    signs: randomShuffle([...threeSame, oneOdd]),
    oddSignId: oneOdd,
    wrongGroupReason: `Bu levha "${mainMeta.shortTitle} (${mainMeta.shapeHint})" grubuna ait! Farklı şekil ve görevdeki levhayı ara.`,
    fact: `Diğer üç levha ${mainMeta.shapeHint} (${mainMeta.shortTitle}) iken, "${TRAFFIC_SIGNS[oneOdd].shortName}" bir ${oddMeta.shapeHint} (${oddMeta.shortTitle}) levhadır.`
  };
}

// ─── SESSION DECK BUILDER (NEVER SAME QUESTIONS IN SAME ORDER!) ───────────────

const RECENT_IDS_STORAGE_KEY = 'trafik_levhalari_recent_ids_v4';

function loadRecentIds(): string[] {
  try {
    const raw = window.sessionStorage.getItem(RECENT_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentIds(ids: string[]) {
  try {
    window.sessionStorage.setItem(RECENT_IDS_STORAGE_KEY, JSON.stringify(ids.slice(-30)));
  } catch {
    // ignore storage errors
  }
}

function pickPrioritizingUnseen<T extends { id: string }>(
  pool: T[],
  count: number,
  recentSet: Set<string>
): T[] {
  const unseen = randomShuffle(pool.filter(q => !recentSet.has(q.id)));
  const seen = randomShuffle(pool.filter(q => recentSet.has(q.id)));
  return [...unseen, ...seen].slice(0, count);
}

/**
 * Generates a fresh, randomized 25-question session across all 7 interactive styles
 * using strictly the 11 traffic signs from the user's images.png sheet.
 */
export function buildTrafikSessionQuestions(
  totalCount = 25,
  extraExcludeIds: string[] = []
): TrafikQuestion[] {
  const nonce = Math.floor(Math.random() * 100000);
  const recentSet = new Set([...loadRecentIds(), ...extraExcludeIds]);

  const scenarios = pickPrioritizingUnseen(SCENARIO_POOL, 5, recentSet).map(q => ({
    ...q,
    choices: randomShuffle(q.choices)
  }));

  const trueFalses = pickPrioritizingUnseen(TRUE_FALSE_POOL, 4, recentSet);

  const riddles = pickPrioritizingUnseen(SIGN_RIDDLE_POOL, 4, recentSet).map(q => ({
    ...q,
    choices: randomShuffle(q.choices)
  }));

  const rules = pickPrioritizingUnseen(RULE_BUILDER_POOL, 3, recentSet).map(q => ({
    ...q,
    wordBank: randomShuffle(q.wordBank)
  }));

  const matchThemes = randomShuffle(MATCH_PAIR_THEMES).slice(0, 3);
  const matchPairs = matchThemes.map((t, i) => generateDynamicMatchPair(t, nonce + i));

  const sortRecipes = randomShuffle(CATEGORY_SORT_RECIPES).slice(0, 3);
  const categorySorts = sortRecipes.map((r, i) => generateDynamicCategorySort(r, nonce + i));

  const oddPairs: ['bilgi' | 'uyari', TrafficCategoryId][] = randomShuffle([
    ['bilgi', 'uyari'],
    ['bilgi', 'yasak'],
    ['bilgi', 'mecburi'],
    ['uyari', 'bilgi'],
    ['uyari', 'yasak'],
    ['uyari', 'mecburi']
  ]);
  const oddOuts = oddPairs.slice(0, 3).map(([m, o], i) => generateDynamicOddSignOut(m, o, nonce + i));

  const buckets: Record<TrafikQuestion['style'], TrafikQuestion[]> = {
    scenario_sign: randomShuffle(scenarios),
    true_false_check: randomShuffle(trueFalses),
    sign_riddle: randomShuffle(riddles),
    odd_sign_out: randomShuffle(oddOuts),
    match_pairs: randomShuffle(matchPairs),
    category_sort: randomShuffle(categorySorts),
    rule_builder: randomShuffle(rules)
  };

  const result: TrafikQuestion[] = [];
  let lastStyle: TrafikQuestion['style'] | null = null;

  while (result.length < totalCount) {
    const availableStyles = (Object.keys(buckets) as TrafikQuestion['style'][]).filter(
      s => buckets[s].length > 0
    );
    if (availableStyles.length === 0) break;

    const nonRepeating = availableStyles.filter(s => s !== lastStyle);
    const poolStyles = nonRepeating.length > 0 ? nonRepeating : availableStyles;

    const maxLen = Math.max(...poolStyles.map(s => buckets[s].length));
    const topCandidates = poolStyles.filter(s => buckets[s].length >= maxLen - 1);
    const chosenStyle = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    const nextQ = buckets[chosenStyle].pop()!;
    result.push(nextQ);
    lastStyle = chosenStyle;
  }

  const curatedUsed = result
    .map(q => q.id)
    .filter(id => id.startsWith('sc_') || id.startsWith('rb_') || id.startsWith('tf_') || id.startsWith('rid_'));
  saveRecentIds(curatedUsed);

  return result;
}

export const TRAFIK_QUESTIONS: TrafikQuestion[] = buildTrafikSessionQuestions(25);
