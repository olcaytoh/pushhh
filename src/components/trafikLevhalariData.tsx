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
    shapeLabel: 'Trafik Işıkları',
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

// ─── CROPPED REAL TRAFFIC SIGN IMAGES FROM USER POSTERS ──────────────────────

export const TRAFFIC_SIGN_IMAGES: Record<TrafficSignId, string> = {
  yaya_gecidi_mavi: '/assets/trafik/yaya_gecidi_mavi.png',
  okul_gecidi_mavi: '/assets/trafik/okul_gecidi_mavi.png',
  alt_gecit: '/assets/trafik/alt_gecit.png',
  ust_gecit: '/assets/trafik/ust_gecit.png',
  yaya_gecidi_ucgen: '/assets/trafik/yaya_gecidi_ucgen.png',
  okul_gecidi_ucgen: '/assets/trafik/okul_gecidi_ucgen.png',
  isikli_isaret: '/assets/trafik/isikli_isaret.png',
  kontrolsuz_kavsak: '/assets/trafik/kontrolsuz_kavsak.png',
  yolda_calisma: '/assets/trafik/yolda_calisma.png',
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
    title: 'Sürücüleri Uyaran Trafik İşaretleri',
    instruction: 'Sürücüleri uyaran trafik işaretlerini doğru açıklamalarıyla eşleştir.',
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
