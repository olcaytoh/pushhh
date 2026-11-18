export type BilsemActivityId =
  | 'coklu_zeka'
  | 'on_test'
  | 'bilissel_uyarim'
  | 'dikkati_guclendirme'
  | 'golge_etkinlikleri'
  | 'desen_etkinlikleri'
  | 'sekil_bulmaca'
  | 'sekil_nesne_bulma'
  | 'gorsel_ayirt_etme'
  | 'ayna_simetrisi'
  | 'kup_acilimi'
  | 'oruntu_dizileri';

export type BilsemGrade = 1 | 2 | 3 | 4;

export interface BilsemActivityMeta {
  id: BilsemActivityId;
  order: number;
  title: string;
  shortDesc: string;
  skillFocus: string;
  accentColor: string;
  iconKey: string;
  questionCountLabel: string;
  grades: BilsemGrade[];
}

export const BILSEM_ACTIVITIES: BilsemActivityMeta[] = [
  {
    id: 'coklu_zeka',
    order: 1,
    title: 'Çoklu Zeka Etkinlikleri',
    shortDesc: 'Mantıksal, uzamsal, sözel ve sayısal zeka alanlarını birlikte geliştiren çok yönlü sorular.',
    skillFocus: 'Çoklu Zeka · Analoji · Uzamsal Düşünme',
    accentColor: 'amber',
    iconKey: '/MENUIKON/grid_icon_27.webp',
    questionCountLabel: '10 Etkinlik',
    grades: [2, 3, 4],
  },
  {
    id: 'on_test',
    order: 2,
    title: 'BİLSEM Ön Test Sınav Aktiviteleri',
    shortDesc: 'MEB tablet tarama formatında 3x3 matris, şifreleme, döndürme, küp ve simetri denemesi.',
    skillFocus: 'Matris · Şifreleme · Sınav Pratiği',
    accentColor: 'sky',
    iconKey: '/MENUIKON/grid_icon_14.webp',
    questionCountLabel: '10 Soru',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'bilissel_uyarim',
    order: 3,
    title: 'Bilişsel Uyarım Aktiviteleri',
    shortDesc: '3x3, 4x4 ve 5x5 çalışma belleği matrisi ile konumları aklında tut ve zihinsel esneklik kazan.',
    skillFocus: 'Çalışma Belleği · Zihinsel Hız',
    accentColor: 'violet',
    iconKey: '/MENUIKON/grid_icon_07.webp',
    questionCountLabel: '10 Seviye',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'dikkati_guclendirme',
    order: 4,
    title: 'Dikkati Güçlendirme Etkinlikleri',
    shortDesc: 'Karmaşık sembol tablosunda kurala uyan tüm hedef nesneleri hatasız bul ve işaretle.',
    skillFocus: 'Seçici Dikkat · Görsel Tarama',
    accentColor: 'emerald',
    iconKey: '/MENUIKON/grid_icon_17.webp',
    questionCountLabel: '10 Görev',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'golge_etkinlikleri',
    order: 5,
    title: 'Dikkati Geliştirme Gölge Etkinlikleri',
    shortDesc: 'Renkli nesne veya birleşik figürün birebir doğru siyah gölgesini çeldiriciler arasından seç.',
    skillFocus: 'Siluet Algısı · Dış Hat Takibi',
    accentColor: 'cyan',
    iconKey: '/MENUIKON/grid_icon_25.webp',
    questionCountLabel: '10 Bulmaca',
    grades: [1, 2, 3],
  },
  {
    id: 'desen_etkinlikleri',
    order: 6,
    title: 'Dikkati Geliştirme Desen Etkinlikleri',
    shortDesc: 'Mozaik, simetri ve dönüş kuralına göre eksik kalan deseni kusursuz tamamla.',
    skillFocus: 'Desen Tamamlama · Simetri',
    accentColor: 'rose',
    iconKey: '/MENUIKON/grid_icon_37.webp',
    questionCountLabel: '10 Desen',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'sekil_bulmaca',
    order: 7,
    title: 'Şekil Bulmaca (Puzzle) Etkinlikleri',
    shortDesc: 'Bütünden çıkarılmış eksik parçayı kenar, açı ve renk uyumuna göre bularak yerleştir.',
    skillFocus: 'Parça-Bütün · Tangram Mantığı',
    accentColor: 'orange',
    iconKey: '/MENUIKON/grid_icon_10.webp',
    questionCountLabel: '10 Puzzle',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'sekil_nesne_bulma',
    order: 8,
    title: 'Dikkati Geliştirme Şekil Nesne Bulma',
    shortDesc: 'İç içe geçmiş geometrik çizgiler arasında gizlenen hedef şekli ve sayısını keşfet.',
    skillFocus: 'Şekil-Zemin Ayrımı · Derin Odak',
    accentColor: 'indigo',
    iconKey: '/MENUIKON/grid_icon_03.webp',
    questionCountLabel: '10 Görev',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'gorsel_ayirt_etme',
    order: 9,
    title: 'Dikkati Geliştirme Görsel Ayırt Etme Etkinlikleri',
    shortDesc: 'Birbirinin neredeyse aynısı olan görseller arasında küçük detayı farklı olanı hemen yakala.',
    skillFocus: 'Detay Yakalama · Fark Bulma',
    accentColor: 'teal',
    iconKey: '/MENUIKON/grid_icon_15.webp',
    questionCountLabel: '10 Karşılaştırma',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'ayna_simetrisi',
    order: 10,
    title: 'Ayna Simetrisi ve Yansıma Etkinlikleri',
    shortDesc: 'Dikey ve yatay ayna eksenine göre şekillerin, piksellerin ve okların doğru yansımasını bul.',
    skillFocus: 'Uzamsal Yansıma · Yön Algısı',
    accentColor: 'cyan',
    iconKey: '/MENUIKON/grid_icon_30.webp',
    questionCountLabel: '8 Etkinlik',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'kup_acilimi',
    order: 11,
    title: 'Küp Açılımı ve 3B Uzamsal Düşünme',
    shortDesc: 'Açık küp ağlarında karşılıklı yüzleri, katlanmış küpü ve blokların üstten görünümünü çöz.',
    skillFocus: '3B Tasarım · Katlama · Perspektif',
    accentColor: 'amber',
    iconKey: '/MENUIKON/grid_icon_33.webp',
    questionCountLabel: '8 Görev',
    grades: [3, 4],
  },
  {
    id: 'oruntu_dizileri',
    order: 12,
    title: 'Sayısal & Şekilsel Örüntü Dizileri',
    shortDesc: 'Artan sayı dizileri, dönen sembol örüntüleri ve mantıksal sınıflamada kuralı yakala.',
    skillFocus: 'Akıl Yürütme · Örüntü Kurma',
    accentColor: 'lime',
    iconKey: '/MENUIKON/grid_icon_20.webp',
    questionCountLabel: '8 Bulmaca',
    grades: [2, 3, 4],
  },
];

// ============================================================================
// GÖREV VERİ MODELLERİ (HER ETKİNLİK TÜRÜ İÇİN ÖZGÜN GÖRSEL YAPILAR)
// ============================================================================

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'hexagon';
export type ShapeColor = '#38bdf8' | '#f59e0b' | '#10b981' | '#f43f5e' | '#a855f7' | '#eab308';

export interface MatrixCellSpec {
  shape: ShapeKind;
  color: ShapeColor;
  rotation?: number; // deg
  count?: number; // 1..3
  innerDot?: boolean;
}

export interface QuizVisualQuestion {
  id: string;
  prompt: string;
  hint: string;
  explanation: string;
  visualType:
    | 'matrix3x3'
    | 'cubes3d'
    | 'balance'
    | 'cipher'
    | 'analogy'
    | 'shadow'
    | 'pattern_tile'
    | 'puzzle_cut'
    | 'embedded_shape'
    | 'mirror_axis'
    | 'cube_net'
    | 'top_view'
    | 'sequence_row';
  visualData: any;
  options: {
    id: string;
    label?: string;
    visual?: any;
    isCorrect: boolean;
  }[];
}

export interface MemoryMatrixRound {
  id: string;
  title: string;
  gridSize: 3 | 4 | 5;
  targets: number[]; // flat indices
  previewMs: number;
  hint: string;
}

export interface TargetScanRound {
  id: string;
  prompt: string;
  gridCols: 4 | 5;
  items: {
    shape: ShapeKind;
    color: ShapeColor;
    rotation: number;
    isTarget: boolean;
  }[];
  explanation: string;
}

export type SpotOddTheme =
  | 'robot'
  | 'house'
  | 'owl'
  | 'ship'
  | 'flower'
  | 'clock'
  | 'train'
  | 'cake'
  | 'mushroom'
  | 'balloon';

export interface SpotOddRound {
  id: string;
  prompt: string;
  sceneTheme: SpotOddTheme;
  cards: {
    id: string;
    variant: 'normal' | 'odd';
    oddDetail: string;
  }[];
  explanation: string;
}

// ----------------------------------------------------------------------------
// 1. ÇOKLU ZEKA ETKİNLİKLERİ (10 Etkinlik)
// ----------------------------------------------------------------------------
export const COKLU_ZEKA_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'cz-1',
    prompt: 'Yandaki yapıda toplam kaç adet birim küp vardır? (Görünmeyen alt küpleri unutma!)',
    hint: 'Hiçbir küp havada duramaz. Arka sütunun yüksekliğini tabana kadar say.',
    explanation: 'Arka sırada 3 + 2 = 5 küp, ön sırada 1 + 1 = 2 küp vardır. Toplam 5 + 2 = 7 küp!',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 2], [1, 1]] },
    options: [
      { id: 'a', label: '5 Küp', isCorrect: false },
      { id: 'b', label: '6 Küp', isCorrect: false },
      { id: 'c', label: '7 Küp', isCorrect: true },
      { id: 'd', label: '8 Küp', isCorrect: false },
    ],
  },
  {
    id: 'cz-2',
    prompt: 'Dengedeki iki teraziye bak! 1 Yıldız ağırlığı kaç tane Üçgene eşittir?',
    hint: 'İlk terazide 1 Kare = 2 Üçgen olduğuna göre, ikinci terazide Karenin yerine 2 Üçgen koy.',
    explanation: '1 Kare = 2 Üçgen. İkinci terazide 1 Yıldız = 1 Kare + 1 Üçgen olduğuna göre 2 + 1 = 3 Üçgen eder!',
    visualType: 'balance',
    visualData: {
      scale1: { left: ['square'], right: ['triangle', 'triangle'] },
      scale2: { left: ['star'], right: ['square', 'triangle'] },
    },
    options: [
      { id: 'a', label: '2 Üçgen', isCorrect: false },
      { id: 'b', label: '3 Üçgen', isCorrect: true },
      { id: 'c', label: '4 Üçgen', isCorrect: false },
      { id: 'd', label: '5 Üçgen', isCorrect: false },
    ],
  },
  {
    id: 'cz-3',
    prompt: 'Şekiller arasındaki ilişkiyi bul! Soru işareti (?) yerine hangisi gelmelidir?',
    hint: 'İlk çiftte şekil 180° ters dönüyor ve rengi sıcak tona geçiyor.',
    explanation: 'İlk çiftte üçgen ters dönüp (180°) rengi değişiyor. Aynı kuralı uyguladığımızda elmas 180° döner, iç noktası korunur ve turuncu olur.',
    visualType: 'analogy',
    visualData: {
      a: { shape: 'triangle', color: '#38bdf8', rotation: 0 },
      b: { shape: 'triangle', color: '#f43f5e', rotation: 180 },
      c: { shape: 'diamond', color: '#10b981', rotation: 0, innerDot: true },
    },
    options: [
      { id: 'a', visual: { shape: 'diamond', color: '#f43f5e', rotation: 180, innerDot: true }, isCorrect: false },
      { id: 'b', visual: { shape: 'diamond', color: '#a855f7', rotation: 45, innerDot: false }, isCorrect: false },
      { id: 'c', visual: { shape: 'diamond', color: '#f59e0b', rotation: 180, innerDot: true }, isCorrect: true },
      { id: 'd', visual: { shape: 'circle', color: '#f59e0b', rotation: 0, innerDot: true }, isCorrect: false },
    ],
  },
  {
    id: 'cz-4',
    prompt: 'Görseldeki blok yığınında kaç tane küp kullanılmıştır?',
    hint: 'Her sütundaki kat yüksekliğini tek tek topla.',
    explanation: 'Arka sırada 3 + 2 = 5 küp, ön sırada 2 + 1 = 3 küp bulunur. Toplam 8 küp vardır.',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 2], [2, 1]] },
    options: [
      { id: 'a', label: '6 Küp', isCorrect: false },
      { id: 'b', label: '7 Küp', isCorrect: false },
      { id: 'c', label: '8 Küp', isCorrect: true },
      { id: 'd', label: '9 Küp', isCorrect: false },
    ],
  },
  {
    id: 'cz-5',
    prompt: 'Aşağıdaki terazide 1 Altıgen kaç Daire ağırlığındadır?',
    hint: '1 Yıldız = 3 Daire, 1 Altıgen = 1 Yıldız + 1 Daire.',
    explanation: 'Yıldız yerine 3 Daire koyduğumuzda 3 + 1 = 4 Daire elde edilir.',
    visualType: 'balance',
    visualData: {
      scale1: { left: ['star'], right: ['circle', 'circle', 'circle'] },
      scale2: { left: ['hexagon'], right: ['star', 'circle'] },
    },
    options: [
      { id: 'a', label: '2 Daire', isCorrect: false },
      { id: 'b', label: '3 Daire', isCorrect: false },
      { id: 'c', label: '4 Daire', isCorrect: true },
      { id: 'd', label: '5 Daire', isCorrect: false },
    ],
  },
  {
    id: 'cz-6',
    prompt: 'Satır ve sütundaki kurala göre boş kutuya hangi şekil gelmelidir?',
    hint: 'Her satırda 3 farklı şekil (Daire, Kare, Üçgen) ve 3 farklı renk birer kez yer almalı.',
    explanation: 'Son satırda Üçgen ve Daire var; eksik şekil Kare! Renklerden Kırmızı ve Yeşil var; eksik renk Mavi.',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'circle', color: '#38bdf8' },
        { shape: 'square', color: '#f43f5e' },
        { shape: 'triangle', color: '#10b981' },
        { shape: 'square', color: '#10b981' },
        { shape: 'triangle', color: '#38bdf8' },
        { shape: 'circle', color: '#f43f5e' },
        { shape: 'triangle', color: '#f43f5e' },
        { shape: 'circle', color: '#10b981' },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'square', color: '#38bdf8' }, isCorrect: true },
      { id: 'b', visual: { shape: 'square', color: '#f43f5e' }, isCorrect: false },
      { id: 'c', visual: { shape: 'triangle', color: '#38bdf8' }, isCorrect: false },
      { id: 'd', visual: { shape: 'circle', color: '#38bdf8' }, isCorrect: false },
    ],
  },
  {
    id: 'cz-7',
    prompt: 'Bu büyük basamaklı yapıda toplam kaç adet birim küp vardır?',
    hint: '3 sütun genişliğindeki yapının arka sırası 3 katlı, orta sırası 2 katlıdır.',
    explanation: 'Arka sırada 3 + 3 + 1 = 7 küp, ön sırada 2 + 1 + 0 = 3 küp bulunur. Toplam 10 küp vardır!',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 3, 1], [2, 1, 0]] },
    options: [
      { id: 'a', label: '8 Küp', isCorrect: false },
      { id: 'b', label: '9 Küp', isCorrect: false },
      { id: 'c', label: '10 Küp', isCorrect: true },
      { id: 'd', label: '11 Küp', isCorrect: false },
    ],
  },
  {
    id: 'cz-8',
    prompt: 'İki terazi de dengededir. 1 Yıldız + 1 Kare toplam kaç Daireye eşittir?',
    hint: 'İlk teraziden 1 Kare = 2 Daire olduğunu bul. İkinci terazide Yıldızı hesapla.',
    explanation: '1 Kare = 2 Daire. İkinci terazide 1 Yıldız = 1 Kare + 2 Daire = 4 Daire. O halde 1 Yıldız (4) + 1 Kare (2) = 6 Daire!',
    visualType: 'balance',
    visualData: {
      scale1: { left: ['square'], right: ['circle', 'circle'] },
      scale2: { left: ['star'], right: ['square', 'circle', 'circle'] },
    },
    options: [
      { id: 'a', label: '4 Daire', isCorrect: false },
      { id: 'b', label: '5 Daire', isCorrect: false },
      { id: 'c', label: '6 Daire', isCorrect: true },
      { id: 'd', label: '7 Daire', isCorrect: false },
    ],
  },
  {
    id: 'cz-9',
    prompt: 'İlişkiyi yakala: 1 Kare noktasızdan 2 noktalı Kareye dönüşüyorsa, "?" yerine ne gelir?',
    hint: 'Şekil ve renk aynı kalıyor, sayı 1 taneden 2 taneye çıkıp içine beyaz nokta ekleniyor.',
    explanation: '1 adet noktasız Yeşil Altıgen, 2 adet içi noktalı Yeşil Altıgene dönüşmelidir.',
    visualType: 'analogy',
    visualData: {
      a: { shape: 'square', color: '#38bdf8', count: 1, innerDot: false },
      b: { shape: 'square', color: '#38bdf8', count: 2, innerDot: true },
      c: { shape: 'hexagon', color: '#10b981', count: 1, innerDot: false },
    },
    options: [
      { id: 'a', visual: { shape: 'hexagon', color: '#10b981', count: 2, innerDot: false }, isCorrect: false },
      { id: 'b', visual: { shape: 'hexagon', color: '#10b981', count: 2, innerDot: true }, isCorrect: true },
      { id: 'c', visual: { shape: 'hexagon', color: '#f59e0b', count: 2, innerDot: true }, isCorrect: false },
      { id: 'd', visual: { shape: 'hexagon', color: '#10b981', count: 3, innerDot: true }, isCorrect: false },
    ],
  },
  {
    id: 'cz-10',
    prompt: 'Sözel-Görsel Mantık: Kuş — Yuva ilişkisi ne ise, Arı — "?" ilişkisi odur. Hangisi uygundur?',
    hint: 'Kuşların yaşadığı ev yuvadır. Arıların topluca yaşayıp bal yaptığı yer neresidir?',
    explanation: 'Kuşlar yuvada yaşar; arılar ise kovanda yaşar ve bal yapar!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'badge', text: '🐦 Kuş → 🪺 Yuva', color: '#38bdf8' },
        { kind: 'badge', text: '🐝 Arı → ?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '🍯 Kovan', isCorrect: true },
      { id: 'b', label: '🌊 Akvaryum', isCorrect: false },
      { id: 'c', label: '🕸️ Ağ', isCorrect: false },
      { id: 'd', label: '🏔️ Mağara', isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 2. BİLSEM ÖN TEST SINAV AKTİVİTELERİ (10 Soru)
// ----------------------------------------------------------------------------
export const ON_TEST_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'ot-1',
    prompt: 'BİLSEM Matris Sorusu: Satır ve sütun kuralına göre "?" yerine ne gelmelidir?',
    hint: 'Her satırda sembol sayısı 1, 2, 3 diye artıyor ve renkler değişiyor.',
    explanation: '3. satırda Yıldız sembolü 1 ve 2 adet verilmiş; eksik olan 3 adet Mor Yıldızdır!',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'circle', color: '#38bdf8', count: 1 },
        { shape: 'circle', color: '#38bdf8', count: 2 },
        { shape: 'circle', color: '#38bdf8', count: 3 },
        { shape: 'square', color: '#f59e0b', count: 1 },
        { shape: 'square', color: '#f59e0b', count: 2 },
        { shape: 'square', color: '#f59e0b', count: 3 },
        { shape: 'star', color: '#a855f7', count: 1 },
        { shape: 'star', color: '#a855f7', count: 2 },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'star', color: '#a855f7', count: 2 }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#a855f7', count: 3 }, isCorrect: true },
      { id: 'c', visual: { shape: 'circle', color: '#a855f7', count: 3 }, isCorrect: false },
      { id: 'd', visual: { shape: 'star', color: '#f59e0b', count: 3 }, isCorrect: false },
    ],
  },
  {
    id: 'ot-2',
    prompt: 'Şifreleme Sorusu: Sembollerin karşılığı olan sayıyı bularak "?" yerine gelecek kodu seç!',
    hint: 'İlk iki satırdan aynı şeklin aynı rakama eşit olduğunu keşfet.',
    explanation: 'Üçgen = 4, Kare = 7, Yıldız = 2. O halde [Yıldız - Üçgen - Kare] dizisinin şifresi 2 4 7 olur!',
    visualType: 'cipher',
    visualData: {
      rows: [
        { shapes: ['triangle', 'square', 'triangle'], code: '4 7 4' },
        { shapes: ['square', 'star', 'square'], code: '7 2 7' },
      ],
      target: ['star', 'triangle', 'square'],
    },
    options: [
      { id: 'a', label: '2 7 4', isCorrect: false },
      { id: 'b', label: '4 2 7', isCorrect: false },
      { id: 'c', label: '2 4 7', isCorrect: true },
      { id: 'd', label: '7 4 2', isCorrect: false },
    ],
  },
  {
    id: 'ot-3',
    prompt: 'Döndürme Matrisi: Şeklin saat yönünde 90° dönüşünü takip et ve "?" kutusunu bul!',
    hint: 'Soldan sağa geçerken üçgen 90° saat yönünde dönüyor.',
    explanation: 'İlk kare 0°, ikinci 90°, üçüncü 180° döner. Son satırda aşağı bakan Kırmızı Üçgen gelmelidir.',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'triangle', color: '#38bdf8', rotation: 0 },
        { shape: 'triangle', color: '#38bdf8', rotation: 90 },
        { shape: 'triangle', color: '#38bdf8', rotation: 180 },
        { shape: 'triangle', color: '#10b981', rotation: 90 },
        { shape: 'triangle', color: '#10b981', rotation: 180 },
        { shape: 'triangle', color: '#10b981', rotation: 270 },
        { shape: 'triangle', color: '#f43f5e', rotation: 0 },
        { shape: 'triangle', color: '#f43f5e', rotation: 90 },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'triangle', color: '#f43f5e', rotation: 0 }, isCorrect: false },
      { id: 'b', visual: { shape: 'triangle', color: '#f43f5e', rotation: 180 }, isCorrect: true },
      { id: 'c', visual: { shape: 'triangle', color: '#f43f5e', rotation: 270 }, isCorrect: false },
      { id: 'd', visual: { shape: 'triangle', color: '#38bdf8', rotation: 180 }, isCorrect: false },
    ],
  },
  {
    id: 'ot-4',
    prompt: 'Şifreleme: Sembollerden oluşan 3 basamaklı gizli şifreyi çöz!',
    hint: 'İlk ve son sembol aynıysa sayıların da başı ve sonu aynıdır.',
    explanation: 'Daire = 5, Altıgen = 9, Elmas = 3. Hedef sıra [Altıgen - Daire - Elmas] = 9 5 3.',
    visualType: 'cipher',
    visualData: {
      rows: [
        { shapes: ['circle', 'hexagon', 'circle'], code: '5 9 5' },
        { shapes: ['diamond', 'circle', 'diamond'], code: '3 5 3' },
      ],
      target: ['hexagon', 'circle', 'diamond'],
    },
    options: [
      { id: 'a', label: '9 3 5', isCorrect: false },
      { id: 'b', label: '5 9 3', isCorrect: false },
      { id: 'c', label: '9 5 3', isCorrect: true },
      { id: 'd', label: '3 9 5', isCorrect: false },
    ],
  },
  {
    id: 'ot-5',
    prompt: '3D Küp Sayma: Sağdaki merdiven blokta toplam kaç küp vardır?',
    hint: 'En arkadaki en yüksek kule 4 katlıdır, yanındakiler basamak şeklinde alçalır.',
    explanation: 'Arka sırada 4 ve 2 (6 küp), ön sırada 2 ve 1 (3 küp). Toplam 9 küp eder!',
    visualType: 'cubes3d',
    visualData: { heights: [[4, 2], [2, 1]] },
    options: [
      { id: 'a', label: '7 Küp', isCorrect: false },
      { id: 'b', label: '8 Küp', isCorrect: false },
      { id: 'c', label: '9 Küp', isCorrect: true },
      { id: 'd', label: '10 Küp', isCorrect: false },
    ],
  },
  {
    id: 'ot-6',
    prompt: 'İç Nokta Matrisi: Her satırda 1 noktalı, 2 noktasız ve şekil değişimi kuralını bul!',
    hint: '3. sütundaki her şeklin içinde mutlaka beyaz nokta var.',
    explanation: 'Son satırda Altıgen ve Daire verilmiş; eksik şekil Kare, sütun gereği içi noktalı Yeşil Kare!',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'circle', color: '#f59e0b', innerDot: false },
        { shape: 'square', color: '#f59e0b', innerDot: false },
        { shape: 'hexagon', color: '#f59e0b', innerDot: true },
        { shape: 'square', color: '#38bdf8', innerDot: false },
        { shape: 'hexagon', color: '#38bdf8', innerDot: false },
        { shape: 'circle', color: '#38bdf8', innerDot: true },
        { shape: 'hexagon', color: '#10b981', innerDot: false },
        { shape: 'circle', color: '#10b981', innerDot: false },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'square', color: '#10b981', innerDot: false }, isCorrect: false },
      { id: 'b', visual: { shape: 'square', color: '#10b981', innerDot: true }, isCorrect: true },
      { id: 'c', visual: { shape: 'hexagon', color: '#10b981', innerDot: true }, isCorrect: false },
      { id: 'd', visual: { shape: 'circle', color: '#10b981', innerDot: true }, isCorrect: false },
    ],
  },
  {
    id: 'ot-7',
    prompt: '4 Sembollü Şifre: Üç satırdaki ipuçlarından yararlanarak "?" yerine gelecek 4 rakamı bul!',
    hint: 'Ortak şekilleri kıyasla: 1. satırdan Kare ve Yıldızı, 2. satırdan Üçgeni bul.',
    explanation: 'Kare = 6, Yıldız = 1, Üçgen = 8, Daire = 3. Hedef [Daire - Yıldız - Üçgen - Kare] = 3 1 8 6!',
    visualType: 'cipher',
    visualData: {
      rows: [
        { shapes: ['square', 'star', 'square'], code: '6 1 6' },
        { shapes: ['triangle', 'square', 'triangle'], code: '8 6 8' },
        { shapes: ['circle', 'star', 'circle'], code: '3 1 3' },
      ],
      target: ['circle', 'star', 'triangle', 'square'],
    },
    options: [
      { id: 'a', label: '3 1 8 6', isCorrect: true },
      { id: 'b', label: '3 8 1 6', isCorrect: false },
      { id: 'c', label: '6 1 8 3', isCorrect: false },
      { id: 'd', label: '1 3 8 6', isCorrect: false },
    ],
  },
  {
    id: 'ot-8',
    prompt: 'Ayna Yansıması: Soldaki figürün dikey ayna eksenindeki tam görüntüsü hangisidir?',
    hint: 'Aynaya yakın olan kenar yine aynaya yakın kalır; okun yönü tersine döner.',
    explanation: 'Sağa bakan ok ve üst köşedeki kırmızı daire dikey aynada sola bakacak şekilde yansır (B şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'flag_arrow', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'flag_arrow', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'flag_arrow', transform: 'reflectX' }, isCorrect: true },
      { id: 'c', visual: { figureId: 'flag_arrow', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'flag_arrow', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'ot-9',
    prompt: 'Küp Açılımı: Verilen açık küp katlandığında Yıldız (★) yüzünün karşısında hangi şekil olur?',
    hint: 'Aynı doğru üzerindeki yüzlerden birer kare atlayarak karşılıklı yüzleri bul.',
    explanation: 'Dikey şeritte Yıldız ile Daire arasında bir kare (Kare yüzü) vardır. Bu yüzden Yıldızın tam karşısına Daire gelir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'square', color: '#38bdf8' }, isCorrect: false },
      { id: 'b', visual: { shape: 'circle', color: '#f43f5e' }, isCorrect: true },
      { id: 'c', visual: { shape: 'diamond', color: '#eab308' }, isCorrect: false },
      { id: 'd', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
    ],
  },
  {
    id: 'ot-10',
    prompt: 'Sütun Renk & Şekil Matrisi: Son boş kareye hangi grup gelmelidir?',
    hint: 'Her sütunda şekil sabit, satırlarda ise renk ve sayı değişiyor.',
    explanation: '3. sütunun şekli Elmas, 3. satırın rengi Mor ve adedi 2 tanedir: 2 adet Mor Elmas!',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'circle', color: '#38bdf8', count: 1 },
        { shape: 'triangle', color: '#38bdf8', count: 1 },
        { shape: 'diamond', color: '#38bdf8', count: 1 },
        { shape: 'circle', color: '#f59e0b', count: 3 },
        { shape: 'triangle', color: '#f59e0b', count: 3 },
        { shape: 'diamond', color: '#f59e0b', count: 3 },
        { shape: 'circle', color: '#a855f7', count: 2 },
        { shape: 'triangle', color: '#a855f7', count: 2 },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'diamond', color: '#a855f7', count: 1 }, isCorrect: false },
      { id: 'b', visual: { shape: 'diamond', color: '#a855f7', count: 2 }, isCorrect: true },
      { id: 'c', visual: { shape: 'diamond', color: '#f59e0b', count: 2 }, isCorrect: false },
      { id: 'd', visual: { shape: 'triangle', color: '#a855f7', count: 2 }, isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 3. BİLİŞSEL UYARIM AKTİVİTELERİ (10 Seviye: 3x3, 4x4 ve 5x5 Bellek Matrisi)
// ----------------------------------------------------------------------------
export const BILISSEL_UYARIM_ROUNDS: MemoryMatrixRound[] = [
  {
    id: 'bu-1',
    title: '1. Seviye: 3 Parlayan Kareyi Aklında Tut',
    gridSize: 3,
    targets: [0, 4, 8],
    previewMs: 2400,
    hint: 'Köşegen boyunca uzanan 3 kareye odaklan!',
  },
  {
    id: 'bu-2',
    title: '2. Seviye: L Şeklindeki 4 Konumu Hatırla',
    gridSize: 3,
    targets: [1, 4, 7, 8],
    previewMs: 2500,
    hint: 'Ortadan aşağı inip sağa dönen L harfini gözünde canlandır.',
  },
  {
    id: 'bu-3',
    title: '3. Seviye: 4x4 Izgarada 4 Yıldızlı Hücre',
    gridSize: 4,
    targets: [2, 5, 10, 15],
    previewMs: 2700,
    hint: 'Satır numaralarına göre konumları gruplayarak aklında tut.',
  },
  {
    id: 'bu-4',
    title: '4. Seviye: Simetrik 5 Hücreyi Yakala',
    gridSize: 4,
    targets: [0, 3, 5, 10, 13],
    previewMs: 2800,
    hint: 'Üst köşelerle alt ortadaki noktaları zihninde birleştir.',
  },
  {
    id: 'bu-5',
    title: '5. Seviye: Çapraz 5 Hücreli Bellek Testi',
    gridSize: 4,
    targets: [1, 6, 9, 12, 14],
    previewMs: 2900,
    hint: 'Her satırda hangi karelerin yandığını sırayla say.',
  },
  {
    id: 'bu-6',
    title: '6. Seviye: 6 Hücreli 4x4 Hafıza Matrisi',
    gridSize: 4,
    targets: [0, 2, 5, 7, 10, 15],
    previewMs: 3100,
    hint: 'Üst iki satırdaki çiftleri ve alt köşegeni ayrı kodla.',
  },
  {
    id: 'bu-7',
    title: '7. Seviye: 5x5 Geniş Matriste 5 Konum',
    gridSize: 5,
    targets: [0, 6, 12, 18, 24],
    previewMs: 2800,
    hint: 'Sol üstten sağ alta inen tam ana köşegen!',
  },
  {
    id: 'bu-8',
    title: '8. Seviye: 5x5 Artı (+) ve Köşe Deseni (6 Hücre)',
    gridSize: 5,
    targets: [2, 10, 12, 14, 20, 22],
    previewMs: 3100,
    hint: 'Orta artı işaretinin uçları ile sol alt köşeyi eşleştir.',
  },
  {
    id: 'bu-9',
    title: '9. Seviye: İleri 5x5 Bellek Testi (6 Hücre)',
    gridSize: 5,
    targets: [1, 3, 7, 15, 19, 22],
    previewMs: 3200,
    hint: 'İlk 2 satırı bir grup, alt 2 satırı ikinci grup olarak hatırla.',
  },
  {
    id: 'bu-10',
    title: '10. Seviye: Büyük Usta 7 Hücreli 5x5 Matris',
    gridSize: 5,
    targets: [0, 4, 8, 12, 16, 20, 24],
    previewMs: 3400,
    hint: 'İki büyük köşegenin kesişim noktası olan merkezi yakala!',
  },
];

// ----------------------------------------------------------------------------
// 4. DİKKATİ GÜÇLENDİRME ETKİNLİKLERİ (10 Görev)
// ----------------------------------------------------------------------------
export const DIKKATI_GUCLENDIRME_ROUNDS: TargetScanRound[] = [
  {
    id: 'dg-1',
    prompt: 'Tablodaki TÜM Mavi Yıldızları (★) seç!',
    gridCols: 4,
    items: [
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'square', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'star', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#f59e0b', rotation: 0, isTarget: false },
    ],
    explanation: 'Hem şekli Yıldız hem rengi Mavi olan 4 sembol vardı!',
  },
  {
    id: 'dg-2',
    prompt: 'Yalnızca YUKARI bakan Yeşil Üçgenleri (▲) işaretle!',
    gridCols: 4,
    items: [
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: true },
    ],
    explanation: 'Döndürülmüş (90°, 180°, 270°) üçgenlere kanmadan 4 adet yukarı bakan yeşil üçgeni seçtik!',
  },
  {
    id: 'dg-3',
    prompt: 'Tüm Kırmızı Altıgenleri (⬡) eksiksiz seç!',
    gridCols: 4,
    items: [
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'square', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
    ],
    explanation: 'Altı kenarlı kırmızı altıgenler toplam 4 taneydi!',
  },
  {
    id: 'dg-4',
    prompt: 'Yalnızca SAĞA (▶) dönük Mor Üçgenleri bul!',
    gridCols: 5,
    items: [
      { shape: 'triangle', color: '#a855f7', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#a855f7', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#a855f7', rotation: 180, isTarget: false },
      { shape: 'diamond', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#a855f7', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#f59e0b', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#a855f7', rotation: 90, isTarget: true },
    ],
    explanation: 'Sola bakan (270°) üçgenleri ayıklayıp sağa bakan 5 Mor Üçgeni yakaladın!',
  },
  {
    id: 'dg-5',
    prompt: 'Tüm Turuncu Elmasları (◆) seç!',
    gridCols: 4,
    items: [
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'square', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'square', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: true },
    ],
    explanation: 'Kare ve altıgen çeldiricileri eleyerek 5 Turuncu Elması buldun!',
  },
  {
    id: 'dg-6',
    prompt: 'Tüm Aşağı Bakan (▼) Sarı Üçgenleri seç!',
    gridCols: 4,
    items: [
      { shape: 'triangle', color: '#eab308', rotation: 180, isTarget: true },
      { shape: 'triangle', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 180, isTarget: true },
      { shape: 'triangle', color: '#38bdf8', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 180, isTarget: true },
      { shape: 'star', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 180, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#eab308', rotation: 90, isTarget: false },
    ],
    explanation: 'Yönü tam aşağı (180°) bakan 4 Sarı Üçgeni doğru tespit ettin!',
  },
  {
    id: 'dg-7',
    prompt: '20 Sembol İçinden Tüm YEŞİL KARE (■) Şekillerini Seç!',
    gridCols: 5,
    items: [
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'star', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'square', color: '#38bdf8', rotation: 0, isTarget: false },
    ],
    explanation: 'Elmas ve farklı renkli kare çeldiriciler arasından 6 Yeşil Kareyi hatasız seçtin!',
  },
  {
    id: 'dg-8',
    prompt: 'Yalnızca SOLA (◀) Bakan Mavi Üçgenleri Seç!',
    gridCols: 5,
    items: [
      { shape: 'triangle', color: '#38bdf8', rotation: 270, isTarget: true },
      { shape: 'triangle', color: '#38bdf8', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 270, isTarget: true },
      { shape: 'triangle', color: '#38bdf8', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 270, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 90, isTarget: false },
      { shape: 'diamond', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 270, isTarget: true },
      { shape: 'triangle', color: '#38bdf8', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 270, isTarget: true },
      { shape: 'triangle', color: '#f59e0b', rotation: 270, isTarget: false },
    ],
    explanation: 'Tam sola (270°) yönelmiş 5 adet Mavi Üçgeni buldun!',
  },
  {
    id: 'dg-9',
    prompt: 'Tüm Kırmızı Yıldızları (★) Hızlıca Bul!',
    gridCols: 5,
    items: [
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'square', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: true },
    ],
    explanation: 'Yoğun tablo içinde 6 adet Kırmızı Yıldızı eksiksiz işaretledin!',
  },
  {
    id: 'dg-10',
    prompt: 'Tüm Mor Daireleri (●) Seç (Altıgenlere Kanma!)',
    gridCols: 5,
    items: [
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
      { shape: 'square', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
      { shape: 'star', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#a855f7', rotation: 0, isTarget: true },
    ],
    explanation: 'Yuvarlağa çok benzeyen mor altıgenleri eleyerek 6 Mor Daireyi doğru seçtin!',
  },
];

// ----------------------------------------------------------------------------
// 5. DİKKATİ GELİŞTİRME GÖLGE ETKİNLİKLERİ (10 Bulmaca)
// ----------------------------------------------------------------------------
export const GOLGE_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'gl-1',
    prompt: 'Üstteki Roket figürünün birebir doğru siyah gölgesi hangisidir?',
    hint: 'Kanatların şekline, dış hatlara ve alt ateşe dikkat et!',
    explanation: 'A şıkkında tek kanat eksik, C ters dönmüş, D şıkkında tepe sivri değil. Doğru gölge B şıkkıdır.',
    visualType: 'shadow',
    visualData: { figure: 'rocket' },
    options: [
      { id: 'a', visual: { figure: 'rocket', variant: 'missing_fin' }, isCorrect: false },
      { id: 'b', visual: { figure: 'rocket', variant: 'exact' }, isCorrect: true },
      { id: 'c', visual: { figure: 'rocket', variant: 'flipped' }, isCorrect: false },
      { id: 'd', visual: { figure: 'rocket', variant: 'blunt_tip' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-2',
    prompt: 'Üstteki Kale / Kule yapısının tam gölgesi hangi şıktadır?',
    hint: 'Sol ve sağ kulenin boyunu ve sağ taraftaki bayrağın yönünü kontrol et.',
    explanation: 'Bayrağın sağa dalgalanması ve sol kulenin daha yüksek olması C şıkkındaki gölgede birebir eşleşir.',
    visualType: 'shadow',
    visualData: { figure: 'castle' },
    options: [
      { id: 'a', visual: { figure: 'castle', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'castle', variant: 'no_flag' }, isCorrect: false },
      { id: 'c', visual: { figure: 'castle', variant: 'exact' }, isCorrect: true },
      { id: 'd', visual: { figure: 'castle', variant: 'even_towers' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-3',
    prompt: 'Sevimli Balığın birebir aynı siyah siluetini (gölgesini) bul!',
    hint: 'Üst yüzgecin yeri ile kuyruk çatalının açısına ve burun yönüne bak.',
    explanation: 'Balık sola bakıyor, üstte 1 büyük yüzgeci, altta 1 küçük yüzgeci var. Doğru gölge A şıkkıdır.',
    visualType: 'shadow',
    visualData: { figure: 'fish' },
    options: [
      { id: 'a', visual: { figure: 'fish', variant: 'exact' }, isCorrect: true },
      { id: 'b', visual: { figure: 'fish', variant: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { figure: 'fish', variant: 'no_top_fin' }, isCorrect: false },
      { id: 'd', visual: { figure: 'fish', variant: 'round_tail' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-4',
    prompt: 'Üst üste binmiş Geometrik Kule figürünün gölgesi hangisidir?',
    hint: 'En tepedeki bayrak üçgeninin sağa baktığını ve alttaki ayakları incele.',
    explanation: 'Bayrak sağa bakıyor, ortada daire çıkıntısı ve altta iki köşeli destek var: Doğru cevap D şıkkıdır.',
    visualType: 'shadow',
    visualData: { figure: 'totem' },
    options: [
      { id: 'a', visual: { figure: 'totem', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'totem', variant: 'flat_sides' }, isCorrect: false },
      { id: 'c', visual: { figure: 'totem', variant: 'no_feet' }, isCorrect: false },
      { id: 'd', visual: { figure: 'totem', variant: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'gl-5',
    prompt: 'Antika Anahtar figürünün birebir doğru gölgesini seç!',
    hint: 'Anahtar dişlerinin sayısına (3 diş) ve tutamağın yuvarlak olmasına bak.',
    explanation: 'Sol tarafta yuvarlak halka, sağda 3 diş (uzun-kısa-uzun) aşağı bakar: Doğru gölge B şıkkıdır.',
    visualType: 'shadow',
    visualData: { figure: 'key' },
    options: [
      { id: 'a', visual: { figure: 'key', variant: 'two_teeth' }, isCorrect: false },
      { id: 'b', visual: { figure: 'key', variant: 'exact' }, isCorrect: true },
      { id: 'c', visual: { figure: 'key', variant: 'mirrored' }, isCorrect: false },
      { id: 'd', visual: { figure: 'key', variant: 'square_head' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-6',
    prompt: 'Yelkenli Teknenin kusursuz gölgesi hangi şıkta verilmiştir?',
    hint: 'Büyük yelken solda, küçük yelken sağda ve tepede küçük flama sola uzanıyor.',
    explanation: 'Yelkenlerin boyut sırası ve flamanın yönü sadece C şıkkındaki gölge ile tamamen örtüşüyor.',
    visualType: 'shadow',
    visualData: { figure: 'sailboat' },
    options: [
      { id: 'a', visual: { figure: 'sailboat', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'sailboat', variant: 'one_sail' }, isCorrect: false },
      { id: 'c', visual: { figure: 'sailboat', variant: 'exact' }, isCorrect: true },
      { id: 'd', visual: { figure: 'sailboat', variant: 'flag_right' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-7',
    prompt: 'Renkli Kelebek figürünün birebir doğru siyah gölgesini seç!',
    hint: 'İki antenin ucu topuzlu, sol ve sağ kanat boyutları birbirinin aynısıdır.',
    explanation: 'Antenlerden biri eksik olan (A), alt kanadı küçük (C) veya sağa asimetrik (D) gölgeler elendiğinde doğru cevap B şıkkıdır.',
    visualType: 'shadow',
    visualData: { figure: 'butterfly' },
    options: [
      { id: 'a', visual: { figure: 'butterfly', variant: 'one_antenna' }, isCorrect: false },
      { id: 'b', visual: { figure: 'butterfly', variant: 'exact' }, isCorrect: true },
      { id: 'c', visual: { figure: 'butterfly', variant: 'no_lower_wing' }, isCorrect: false },
      { id: 'd', visual: { figure: 'butterfly', variant: 'asymmetric' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-8',
    prompt: 'Kral Tacı figürünün tam gölgesini çeldiriciler arasından bul!',
    hint: 'Tacın tepesinde 3 sivri uç (ortadaki daha yüksek) ve uçlarında yuvarlak toplar vardır.',
    explanation: '3 sivri uç ve üstündeki 3 topuz sadece D şıkkında birebir doğru verilmiştir.',
    visualType: 'shadow',
    visualData: { figure: 'crown' },
    options: [
      { id: 'a', visual: { figure: 'crown', variant: 'no_balls' }, isCorrect: false },
      { id: 'b', visual: { figure: 'crown', variant: 'two_peaks' }, isCorrect: false },
      { id: 'c', visual: { figure: 'crown', variant: 'flat_top' }, isCorrect: false },
      { id: 'd', visual: { figure: 'crown', variant: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'gl-9',
    prompt: 'Çam Ağacı siluetlerinden hangisi üstteki ağacın birebir gölgesidir?',
    hint: '3 katlı üçgen yaprak katmanının sağ alt çıkıntısındaki küçük dala dikkat et!',
    explanation: 'Gövdenin sağındaki küçük yan dal ve 3 katmanlı tepe sadece A şıkkında tam eşleşir.',
    visualType: 'shadow',
    visualData: { figure: 'pine_tree' },
    options: [
      { id: 'a', visual: { figure: 'pine_tree', variant: 'exact' }, isCorrect: true },
      { id: 'b', visual: { figure: 'pine_tree', variant: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { figure: 'pine_tree', variant: 'no_branch' }, isCorrect: false },
      { id: 'd', visual: { figure: 'pine_tree', variant: 'two_tiers' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-10',
    prompt: 'Şampiyonluk Kupasının birebir siyah gölgesi hangisidir?',
    hint: 'İki kulp, kupa gövdesi ve alt kaide genişliğine dikkat et!',
    explanation: 'Çift kulplu kupa formu ve basamaklı kaide C şıkkındaki gölgede hatasız yer alır.',
    visualType: 'shadow',
    visualData: { figure: 'trophy' },
    options: [
      { id: 'a', visual: { figure: 'trophy', variant: 'one_handle' }, isCorrect: false },
      { id: 'b', visual: { figure: 'trophy', variant: 'thin_base' }, isCorrect: false },
      { id: 'c', visual: { figure: 'trophy', variant: 'exact' }, isCorrect: true },
      { id: 'd', visual: { figure: 'trophy', variant: 'no_handles' }, isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 6. DİKKATİ GELİŞTİRME DESEN ETKİNLİKLERİ (10 Desen)
// ----------------------------------------------------------------------------
export const DESEN_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'ds-1',
    prompt: 'Renkli mozaik desenindeki boş (?) kareye hangi parça gelirse desen tamamlanır?',
    hint: 'Merkeze doğru bakan üçgenlerin renk simetrisini izle.',
    explanation: 'Dış çerçeve mavi, iç merkez altın sarısı çapraz bir yıldız oluşturuyor. Sağ alt köşe sol üstle simetriktir: A şıkkı!',
    visualType: 'pattern_tile',
    visualData: { patternId: 'radial_star' },
    options: [
      { id: 'a', visual: { patternId: 'radial_star', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { patternId: 'radial_star', piece: 'inverted_color' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'radial_star', piece: 'rotated' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'radial_star', piece: 'wrong_corner' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-2',
    prompt: 'Çapraz çizgili desende boş bırakılan kareyi en doğru parça ile tamamla!',
    hint: 'Köşegenden geçen kırmızı ve turkuaz şeritlerin kesintisiz devam etmesi gerekiyor.',
    explanation: 'Kırmızı şerit sağ alta doğru inerken dış köşede turkuaz nokta yer almalıdır: C şıkkı kesintisiz devam ettirir.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'diagonal_stripes' },
    options: [
      { id: 'a', visual: { patternId: 'diagonal_stripes', piece: 'flipped' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'diagonal_stripes', piece: 'no_dot' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'diagonal_stripes', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { patternId: 'diagonal_stripes', piece: 'wrong_band' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-3',
    prompt: 'İç içe daire deseninde "?" köşesini tamamlayan parçayı seç!',
    hint: '4 köşe ortada tam bir büyük halka oluşturacak şekilde kavisleniyor.',
    explanation: 'Sağ alt kavis merkezden dışa doğru Mor -> Yeşil -> Sarı kavis sırasıyla sol üstün tam aynasıdır (B şıkkı).',
    visualType: 'pattern_tile',
    visualData: { patternId: 'concentric_arcs' },
    options: [
      { id: 'a', visual: { patternId: 'concentric_arcs', piece: 'wrong_order' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'concentric_arcs', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { patternId: 'concentric_arcs', piece: 'flipped_corner' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'concentric_arcs', piece: 'straight' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-4',
    prompt: 'Karo taşından oluşan bu süsleme deseninde eksik köşeyi bul!',
    hint: 'Çiçek yapraklarının ucu ortaya bakmalı ve dış köşede sarı nokta olmalı.',
    explanation: 'Merkeze bakan taç yaprağı ile dış köşedeki sarı motif D şıkkında doğru hizalanmıştır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'flower_mosaic' },
    options: [
      { id: 'a', visual: { patternId: 'flower_mosaic', piece: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'flower_mosaic', piece: 'missing_leaf' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'flower_mosaic', piece: 'color_swap' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'flower_mosaic', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'ds-5',
    prompt: 'Satranç ve ok motifli desende soru işareti yerine hangi parça gelir?',
    hint: 'Her satırda oklar içeri doğru bakarken renkler dama gibi yer değiştirir.',
    explanation: 'Sağ alt parçada koyu zemin üzerinde sol üste bakan altın ok yer almalıdır (A şıkkı).',
    visualType: 'pattern_tile',
    visualData: { patternId: 'checker_arrows' },
    options: [
      { id: 'a', visual: { patternId: 'checker_arrows', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { patternId: 'checker_arrows', piece: 'outward' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'checker_arrows', piece: 'wrong_bg' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'checker_arrows', piece: 'horizontal' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-6',
    prompt: 'Labirent çizgili kare deseni tamamlamak için hangi parça uygundur?',
    hint: 'Çizgiler birbirine dik açıyla bağlanarak kapalı bir L köşesi oluşturmalı.',
    explanation: 'Üstten gelen dikey çizgiyle soldan gelen yatay çizgiyi B şıkkındaki L dönüşü birleştirir.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'maze_corner' },
    options: [
      { id: 'a', visual: { patternId: 'maze_corner', piece: 'reverse_L' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'maze_corner', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { patternId: 'maze_corner', piece: 'cross' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'maze_corner', piece: 'broken' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-7',
    prompt: 'Rüzgar gülü deseninin saat yönünde dönen 4. kanadını tamamla!',
    hint: 'Her kare 90° saat yönünde dönüyor; kanat renkleri yeşil ve sarı dönüşümlüdür.',
    explanation: 'Sağ alt kanat sol üstün 180° dönmüş hali olan C şıkkıdır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'windmill' },
    options: [
      { id: 'a', visual: { patternId: 'windmill', piece: 'wrong_rot' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'windmill', piece: 'color_swap' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'windmill', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { patternId: 'windmill', piece: 'missing_blade' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-8',
    prompt: 'Baklava çerçeveli mozaikte sağ alt boşluğa hangi parça tam oturur?',
    hint: 'Merkezde büyük bir eşkenar dörtgen (baklava) ve köşelerde mor şeritler oluşuyor.',
    explanation: 'Sol üst köşeden merkeze inen eğik turuncu kenar sağ altta simetrik kapanır: B şıkkı!',
    visualType: 'pattern_tile',
    visualData: { patternId: 'diamond_frame' },
    options: [
      { id: 'a', visual: { patternId: 'diamond_frame', piece: 'flipped' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'diamond_frame', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { patternId: 'diamond_frame', piece: 'wrong_color' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'diamond_frame', piece: 'square_center' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-9',
    prompt: 'Yatay şeritli ve noktalı dokuma deseninin eksik karesini seç!',
    hint: 'Üstteki mavi şerit ve alttaki pembe şerit kesintisiz sağa devam etmeli.',
    explanation: 'Çift renk şerit ve ortadaki beyaz kare sadece D şıkkında kesintisiz bağlanır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'wave_bands' },
    options: [
      { id: 'a', visual: { patternId: 'wave_bands', piece: 'vertical' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'wave_bands', piece: 'no_center' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'wave_bands', piece: 'swapped_bands' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'wave_bands', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'ds-10',
    prompt: 'Merdiven ızgaralı geometrik deseni tamamlayan eksik parça hangisidir?',
    hint: 'Dış köşede koyu mavi, ortaya yakın köşede turkuaz basamaklar var.',
    explanation: 'Basamak sırası merkeze göre simetriktir; doğru parça A şıkkıdır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'stepped_grid' },
    options: [
      { id: 'a', visual: { patternId: 'stepped_grid', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { patternId: 'stepped_grid', piece: 'reversed' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'stepped_grid', piece: 'flat' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'stepped_grid', piece: 'extra_dot' }, isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 7. ŞEKİL BULMACA (PUZZLE) ETKİNLİKLERİ (10 Puzzle)
// ----------------------------------------------------------------------------
export const SEKIL_BULMACA_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'sb-1',
    prompt: 'Büyük şeklin kesilip çıkarılmış boşluğuna hangi puzzle parçası tam oturur?',
    hint: 'Üstteki girinti ile alttaki basamağın yönünü kontrol et.',
    explanation: 'Boşluğun solunda içe çıkıntı, sağında dışa basamak var. C şıkkı boşluğu sıfır boşlukla kapatır!',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'step_block' },
    options: [
      { id: 'a', visual: { puzzleId: 'step_block', piece: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'step_block', piece: 'too_tall' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'step_block', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { puzzleId: 'step_block', piece: 'wrong_notch' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-2',
    prompt: 'Tamamlanmamış Tangram Karesini dolduracak doğru parça hangisidir?',
    hint: 'Sol üst köşedeki eğimli kenarın açısına ve alt yatay tabana dikkat et.',
    explanation: 'Sol tarafı dik, alt kenarı yatay ve üst kenarı sağa doğru eğimli olan A şıkkı kareyi tamamlar.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'tangram_cut' },
    options: [
      { id: 'a', visual: { puzzleId: 'tangram_cut', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { puzzleId: 'tangram_cut', piece: 'flipped' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'tangram_cut', piece: 'triangle_only' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'tangram_cut', piece: 'reversed_slope' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-3',
    prompt: 'Daire puzzle içinden çıkarılmış dilime hangi parça tam uyar?',
    hint: 'Merkez açısı 90° olan dilimin alt kenarında küçük yarım daire çıkıntısı olmalı.',
    explanation: 'Hem çeyrek daire yayı hem de kenardaki yarım daire kilidi sadece B şıkkında doğru yerdedir.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'circle_jigsaw' },
    options: [
      { id: 'a', visual: { puzzleId: 'circle_jigsaw', piece: 'inward_knob' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'circle_jigsaw', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { puzzleId: 'circle_jigsaw', piece: 'mirrored' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'circle_jigsaw', piece: 'no_knob' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-4',
    prompt: 'Altıgen petek bulmacadaki eksik parçayı kenetleme dişlerine göre seç!',
    hint: 'Sol kenarda 2 adet kare diş girintisi var.',
    explanation: 'Sol kenarı 2 dişli ve sağ üst kenarı düz eğimli olan parça D şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'hex_puzzle' },
    options: [
      { id: 'a', visual: { puzzleId: 'hex_puzzle', piece: 'one_tooth' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'hex_puzzle', piece: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'hex_puzzle', piece: 'round_teeth' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'hex_puzzle', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'sb-5',
    prompt: 'Merdiven şeklindeki renkli bloğu tam dikdörtgene tamamlamak için hangisi gerekir?',
    hint: 'Boşluğun üstte 1, ortada 2 ve altta 3 birimlik genişliği var.',
    explanation: 'Basamak genişliklerini 1-2-3 olarak tamamlayan ters merdiven B şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'stairs_fit' },
    options: [
      { id: 'a', visual: { puzzleId: 'stairs_fit', piece: 'flipped' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'stairs_fit', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { puzzleId: 'stairs_fit', piece: 'equal_steps' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'stairs_fit', piece: 'two_steps' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-6',
    prompt: 'Zikzaklı mozaik puzzle parçasının boşluktan çıkarılan asıl şekli hangisidir?',
    hint: 'Üstteki Z benzeri kırık çizgiyi aşağıdan yukarı takip et.',
    explanation: 'Zikzaklı sol kenarı boşluğun sağ kenarına kilitlenen tek parça C şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'zigzag_piece' },
    options: [
      { id: 'a', visual: { puzzleId: 'zigzag_piece', piece: 'inverted' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'zigzag_piece', piece: 'straight_edge' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'zigzag_piece', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { puzzleId: 'zigzag_piece', piece: 'wrong_corner' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-7',
    prompt: 'Kemerli köprü bloğunun içindeki yarım daire boşluğu tam kapatan parça hangisidir?',
    hint: 'Üstü düz, ortasında aşağı inen yarım daire çıkıntısı olan parçayı ara.',
    explanation: 'Düz üst kenarı ve tam merkezdeki yarım daire uzantısı A şıkkında birebir uyumludur.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'arch_cut' },
    options: [
      { id: 'a', visual: { puzzleId: 'arch_cut', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { puzzleId: 'arch_cut', piece: 'triangle_arch' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'arch_cut', piece: 'upside_down' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'arch_cut', piece: 'square_arch' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-8',
    prompt: 'Artı (+) biçimli girintisi olan levhayı kapatacak doğru kilit parçası hangisidir?',
    hint: 'Sol ve alt kenarındaki T çıkıntısının uzunluğuna bak.',
    explanation: 'Kenar uzunlukları ve iç çıkıntısı birebir oturan tek parça D şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'cross_notch' },
    options: [
      { id: 'a', visual: { puzzleId: 'cross_notch', piece: 'thin_cross' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'cross_notch', piece: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'cross_notch', piece: 'no_tab' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'cross_notch', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'sb-9',
    prompt: 'Ok ucu kesimli bloğun boşluğuna hangi parça tam yerleşir?',
    hint: 'Sol kenar içeri doğru sivri bir V girintisi yapıyor.',
    explanation: 'Sola bakan sivri ok ucu sadece B şıkkındaki parçada doğru açıdadır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'arrow_fit' },
    options: [
      { id: 'a', visual: { puzzleId: 'arrow_fit', piece: 'blunt' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'arrow_fit', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { puzzleId: 'arrow_fit', piece: 'mirrored' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'arrow_fit', piece: 'steep' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-10',
    prompt: 'Kalkan şeklindeki bulmacanın kesilmiş sağ yarısı hangisidir?',
    hint: 'Ortadaki S şeklindeki dalgalı birleşim çizgisine dikkat et!',
    explanation: 'Üstten dışa, alttan içe kıvrılan birleşim çizgisi C şıkkıyla tam bütünleşir.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'shield_split' },
    options: [
      { id: 'a', visual: { puzzleId: 'shield_split', piece: 'straight' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'shield_split', piece: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'shield_split', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { puzzleId: 'shield_split', piece: 'reversed_wave' }, isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 8. DİKKATİ GELİŞTİRME ŞEKİL NESNE BULMA (10 Görev)
// ----------------------------------------------------------------------------
export const SEKIL_NESNE_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'sn-1',
    prompt: 'Karmaşık çizimin içinde TOPLAM kaç adet Üçgen şekli vardır?',
    hint: 'Küçük tekli üçgenlerin yanında onları çevreleyen büyük dış üçgeni de say!',
    explanation: 'Üstte 1 küçük, solda 1 küçük, sağda 1 küçük ve ortadaki 1 ters küçük üçgen ile birlikte 1 büyük dış üçgen = toplam 5 üçgen vardır!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'triangles_count' },
    options: [
      { id: 'a', label: '3 Üçgen', isCorrect: false },
      { id: 'b', label: '4 Üçgen', isCorrect: false },
      { id: 'c', label: '5 Üçgen', isCorrect: true },
      { id: 'd', label: '6 Üçgen', isCorrect: false },
    ],
  },
  {
    id: 'sn-2',
    prompt: 'Üstteki hedef şekil (Ev), aşağıdaki karmaşık çizimlerden HANGİSİNİN içinde gizlenmiştir?',
    hint: 'Hedef şekilde iki dikey duvar ve üstte üçgen çatı çizgisi var.',
    explanation: 'Çizgileri tek tek takip ettiğimizde aynı oran ve yöndeki ev figürünün B şıkkında gizli olduğunu görürüz.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_house' },
    options: [
      { id: 'a', visual: { sceneId: 'tangle_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'tangle_B_match' }, isCorrect: true },
      { id: 'c', visual: { sceneId: 'tangle_C' }, isCorrect: false },
      { id: 'd', visual: { sceneId: 'tangle_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-3',
    prompt: 'İç içe geçmiş geometrik çizimde TOPLAM kaç adet dikdörtgen/kare çerçeve vardır?',
    hint: 'En dış büyük kare + ortadaki sarı kare + sağ alt köşedeki kırmızı kare.',
    explanation: 'Büyük yeşil kare (1), ortadaki sarı kare (1) ve sağ alt köşedeki kırmızı kare (1) = toplam 3 kare vardır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'squares_count' },
    options: [
      { id: 'a', label: '2 Kare', isCorrect: false },
      { id: 'b', label: '3 Kare', isCorrect: true },
      { id: 'c', label: '4 Kare', isCorrect: false },
      { id: 'd', label: '5 Kare', isCorrect: false },
    ],
  },
  {
    id: 'sn-4',
    prompt: 'Üstteki Z şekli, aşağıdaki çizgi ağlarından hangisinin içinde gizlidir?',
    hint: 'Üst yatay çizgi, sola inen çapraz çizgi ve alt yatay çizginin açılarını takip et.',
    explanation: 'Aynı yön ve büyüklükteki Z çizgisi C şıkkındaki ağın tam ortasında saklıdır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_Z' },
    options: [
      { id: 'a', visual: { sceneId: 'z_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'z_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'z_C_match' }, isCorrect: true },
      { id: 'd', visual: { sceneId: 'z_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-5',
    prompt: 'Çizimdeki büyük altıgen ağın içinde kaç tane Yıldız sembolü gizlenmiş?',
    hint: 'Kenar çizgilerinin arasına ve merkeze dikkatlice bak.',
    explanation: 'Sol üstte, merkezde ve sağ altta gizlenmiş toplam 3 adet yıldız vardır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'stars_in_hex' },
    options: [
      { id: 'a', label: '2 Yıldız', isCorrect: false },
      { id: 'b', label: '3 Yıldız', isCorrect: true },
      { id: 'c', label: '4 Yıldız', isCorrect: false },
      { id: 'd', label: '5 Yıldız', isCorrect: false },
    ],
  },
  {
    id: 'sn-6',
    prompt: 'Üstteki Bayrak şekli hangi desen ağının içinde birebir gizlenmiştir?',
    hint: 'Bayrağın sapı dikeydir ve üçgen flama sağa doğru uzanır.',
    explanation: 'D şıkkındaki çizgi ağında aynı dikey sap ve sağa bakan flama birebir yer alır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_flag' },
    options: [
      { id: 'a', visual: { sceneId: 'flag_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'flag_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'flag_C' }, isCorrect: false },
      { id: 'd', visual: { sceneId: 'flag_D_match' }, isCorrect: true },
    ],
  },
  {
    id: 'sn-7',
    prompt: 'İç içe geçmiş daire halkaları çiziminde toplam kaç adet tam Daire vardır?',
    hint: 'Büyük dış daireden en içteki küçük daireye kadar hepsini say.',
    explanation: 'Büyük mavi daire, orta boy yeşil daire, sağ alt sarı daire ve merkezdeki küçük pembe daire ile toplam 4 daire vardır!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'circles_overlap_count' },
    options: [
      { id: 'a', label: '2 Daire', isCorrect: false },
      { id: 'b', label: '3 Daire', isCorrect: false },
      { id: 'c', label: '4 Daire', isCorrect: true },
      { id: 'd', label: '5 Daire', isCorrect: false },
    ],
  },
  {
    id: 'sn-8',
    prompt: 'Üstteki M harfi biçimindeki zikzak çizgi hangi ağın içinde gizlenmiştir?',
    hint: 'Sol ve sağ kenarları dikey, ortası aşağı inen sivri V olan M şeklini ara.',
    explanation: 'A şıkkındaki dikdörtgen ızgara içinde M çizgisi birebir saklanmıştır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_M' },
    options: [
      { id: 'a', visual: { sceneId: 'm_A_match' }, isCorrect: true },
      { id: 'b', visual: { sceneId: 'm_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'm_C' }, isCorrect: false },
      { id: 'd', visual: { sceneId: 'm_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-9',
    prompt: 'Üstteki Sağa Bakan Ok işareti hangi karmaşık çizimin içinde saklıdır?',
    hint: 'Yatay gövde ve sağ uçtaki açık ok ucunu takip et.',
    explanation: 'C şıkkındaki kare-köşegen ağında sağa uzanan ok şekli birebir gizlenmiştir.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_arrow' },
    options: [
      { id: 'a', visual: { sceneId: 'arrow_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'arrow_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'arrow_C_match' }, isCorrect: true },
      { id: 'd', visual: { sceneId: 'arrow_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-10',
    prompt: 'Çizimdeki büyük eşkenar dörtgen içinde toplam kaç adet Elmas (baklava) vardır?',
    hint: 'Büyük dış elmasın içindeki küçük elmasları tek tek say.',
    explanation: 'Büyük dış elmas (1), üstte küçük (1), altta küçük (1) ve merkezde (1) olmak üzere toplam 4 elmas vardır!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'diamonds_count' },
    options: [
      { id: 'a', label: '3 Elmas', isCorrect: false },
      { id: 'b', label: '4 Elmas', isCorrect: true },
      { id: 'c', label: '5 Elmas', isCorrect: false },
      { id: 'd', label: '6 Elmas', isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 9. DİKKATİ GELİŞTİRME GÖRSEL AYIRT ETME ETKİNLİKLERİ (10 Karşılaştırma)
// ----------------------------------------------------------------------------
export const GORSEL_AYIRT_ETME_ROUNDS: SpotOddRound[] = [
  {
    id: 'gae-1',
    prompt: '6 Robot arasından küçük bir detayı DİĞERLERİNDEN FARKLI olan robotu bul!',
    sceneTheme: 'robot',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'odd', oddDetail: 'Anten ucu kırmızı ve göğüs düğmesi eksik!' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '3 numaralı robotun anten ucu kırmızı ve göğsündeki yeşil düğme eksik!',
  },
  {
    id: 'gae-2',
    prompt: '6 Ev arasından gizli farkı olan evi dikkatlice incele ve tıkla!',
    sceneTheme: 'house',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'odd', oddDetail: 'Baca sağda değil solda ve çatı penceresi yok!' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '5 numaralı evin bacası diğerlerinin aksine sol tarafta ve çatı penceresi eksik!',
  },
  {
    id: 'gae-3',
    prompt: 'Sevimli Baykuşlardan yalnızca BİRİ diğerlerinden farklı. Hangisi?',
    sceneTheme: 'owl',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'odd', oddDetail: 'Tek kaşı kalkık ve göğüs beneği eksik!' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '2 numaralı baykuşun tek kaşı kalkık ve göğüs deseni diğerlerinden farklı!',
  },
  {
    id: 'gae-4',
    prompt: '6 Yelkenli Gemiden hangisi diğerleriyle aynı değil?',
    sceneTheme: 'ship',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'odd', oddDetail: 'Gövdedeki lomboz sayısı 2 yerine 3 ve bayrak ters!' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '4 numaralı geminin gövdesinde 3 pencere ve sola bakan bayrak bulunuyor!',
  },
  {
    id: 'gae-5',
    prompt: 'Renkli Çiçeklerden farklı olan tek çiçeği bul!',
    sceneTheme: 'flower',
    cards: [
      { id: 'c1', variant: 'odd', oddDetail: 'Sağ yaprağı eksik ve üst taç yaprağı mavi!' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '1 numaralı çiçeğin sapındaki sağ yaprak eksik ve taç yapraklarından biri mavi!',
  },
  {
    id: 'gae-6',
    prompt: 'Saatlerden hangisi diğerlerinden farklı bir zamanı gösteriyor?',
    sceneTheme: 'clock',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'odd', oddDetail: 'Akrep 3 yerine 9 yönünü gösteriyor!' },
    ],
    explanation: '6 numaralı saat 03:00 yerine 09:00 yönüne bakıyor!',
  },
  {
    id: 'gae-7',
    prompt: '6 Lokomotiften hangisinin detayı diğerlerinden farklı?',
    sceneTheme: 'train',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'odd', oddDetail: 'Duman bulutu eksik ve ön farı farklı!' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '5 numaralı trenin bacasından duman çıkmıyor ve pencere rengi farklı!',
  },
  {
    id: 'gae-8',
    prompt: 'Doğum günü pastalarından hangisi diğerleriyle aynı değil?',
    sceneTheme: 'cake',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'odd', oddDetail: 'Üzerinde 3 yerine 2 mum var!' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '3 numaralı pastanın üzerinde diğerlerinin aksine ortadaki mum eksik (2 mum var)!',
  },
  {
    id: 'gae-9',
    prompt: 'Benekli mantarlardan hangisinde gizli bir fark var?',
    sceneTheme: 'mushroom',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'odd', oddDetail: 'Şapkadaki ortadaki beyaz benek eksik!' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '2 numaralı mantarın şapkasındaki alt sağ beyaz benek eksik!',
  },
  {
    id: 'gae-10',
    prompt: 'Uçan Sıcak Hava Balonlarından farklı olan tek balonu seç!',
    sceneTheme: 'balloon',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'odd', oddDetail: 'Sepet halatlarından biri eksik ve orta şerit sarı!' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '4 numaralı balonun orta şeridi yeşil yerine sarı renkte!',
  },
];

// ----------------------------------------------------------------------------
// 10. AYNA SİMETRİSİ VE YANSIMA ETKİNLİKLERİ (8 Etkinlik)
// ----------------------------------------------------------------------------
export const AYNA_SIMETRI_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'as-1',
    prompt: 'Dikey ayna çizgisinin sağında oluşacak doğru yansıma hangisidir?',
    hint: 'Aynaya yakın olan mavi kare yine aynaya yakın tarafta kalır.',
    explanation: 'Dikey aynada sağ-sol yer değiştirir: Ok sola bakar ve üçgen bayrak ters yöne döner (B şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'flag_arrow', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'flag_arrow', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'flag_arrow', transform: 'reflectX' }, isCorrect: true },
      { id: 'c', visual: { figureId: 'flag_arrow', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'flag_arrow', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-2',
    prompt: 'L biçimindeki renkli blokların dikey ayna karşısındaki görüntüsü hangisidir?',
    hint: 'Alt yatay kol sola değil, aynadan uzaklaşacak şekilde sağa doğru uzanmalı.',
    explanation: 'Dikey yansımada sol üstteki daire sağ üstte görünür ve alt kol sağa uzanır (A şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'l_blocks', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'l_blocks', transform: 'reflectX' }, isCorrect: true },
      { id: 'b', visual: { figureId: 'l_blocks', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'l_blocks', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'l_blocks', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-3',
    prompt: 'YATAY ayna çizgisinin altında oluşacak doğru yansıma hangisidir?',
    hint: 'Dikkat! Bu kez ayna yataydır: Yukarı bakan tepe noktası aşağı bakmalıdır.',
    explanation: 'Yatay aynada üst-alt yer değiştirir. Üstteki kırmızı tepe aşağı iner, sağdaki nokta sağda kalır (C şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'boat_pin', axis: 'horizontal' },
    options: [
      { id: 'a', visual: { figureId: 'boat_pin', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'boat_pin', transform: 'reflectX' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'boat_pin', transform: 'reflectY' }, isCorrect: true },
      { id: 'd', visual: { figureId: 'boat_pin', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-4',
    prompt: '3x3 piksel deseninin dikey aynadaki tam yansımasını seç!',
    hint: 'Aynaya bitişik olan sağ sütundaki yeşil kareler yansımada sol sütunda olmalı.',
    explanation: 'Sağ-sol ters çevrildiğinde sağ sütun sola geçer: Doğru piksel deseni D şıkkıdır.',
    visualType: 'mirror_axis',
    visualData: { figureId: 'pixel_step', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'pixel_step', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'pixel_step', transform: 'reflectY' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'pixel_step', transform: 'rotate180' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'pixel_step', transform: 'reflectX' }, isCorrect: true },
    ],
  },
  {
    id: 'as-5',
    prompt: 'Çapraz ok ve yıldız şeklinin dikey aynadaki yansıması hangisidir?',
    hint: 'Sağ üste bakan ok, dikey aynada sol üste bakar!',
    explanation: 'Yatay tersleme sonucu ok sol üste döner, alt sağdaki yıldız alt solda kalır (B şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'diag_star', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'diag_star', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'diag_star', transform: 'reflectX' }, isCorrect: true },
      { id: 'c', visual: { figureId: 'diag_star', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'diag_star', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-6',
    prompt: 'YATAY ayna üzerinde duran ev/ok şeklinin suya yansıması hangisidir?',
    hint: 'Suya yansırken çatı/ok ucu aşağı doğru baş aşağı durur.',
    explanation: 'Yatay aynada şekil dikey olarak ters çevrilir (C şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'flag_arrow', axis: 'horizontal' },
    options: [
      { id: 'a', visual: { figureId: 'flag_arrow', transform: 'reflectX' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'flag_arrow', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'flag_arrow', transform: 'reflectY' }, isCorrect: true },
      { id: 'd', visual: { figureId: 'flag_arrow', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-7',
    prompt: 'Saat yönünde kıvrılan sarmal işaretin dikey aynadaki görüntüsü hangisidir?',
    hint: 'Sağ alt kavis aynada sol alt kavis olarak görünür.',
    explanation: 'Dikey ayna sağ ve solu yer değiştirir; A şıkkı tam yansımayı verir.',
    visualType: 'mirror_axis',
    visualData: { figureId: 'hook_spiral', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'hook_spiral', transform: 'reflectX' }, isCorrect: true },
      { id: 'b', visual: { figureId: 'hook_spiral', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'hook_spiral', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'hook_spiral', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-8',
    prompt: 'Piksel deseninin YATAY ayna altındaki yansıması hangisidir?',
    hint: 'Üst satırdaki pikseller alt satıra, alt satırdakiler üst satıra geçer.',
    explanation: 'Yatay ayna üst ve altı simetrik tersler; doğru piksel yansıması D şıkkıdır.',
    visualType: 'mirror_axis',
    visualData: { figureId: 'pixel_step', axis: 'horizontal' },
    options: [
      { id: 'a', visual: { figureId: 'pixel_step', transform: 'reflectX' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'pixel_step', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'pixel_step', transform: 'rotate180' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'pixel_step', transform: 'reflectY' }, isCorrect: true },
    ],
  },
];

// ----------------------------------------------------------------------------
// 11. KÜP AÇILIMI VE 3B UZAMSAL DÜŞÜNME (8 Görev)
// ----------------------------------------------------------------------------
export const KUP_ACILIMI_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'ka-1',
    prompt: 'Açık küp katlandığında SOLDAKİ Yeşil Üçgenin (▲) tam karşısına hangi yüz gelir?',
    hint: 'Yatay şeritteki 3 kare (Üçgen - Kare - Altıgen) yan yana katlanır.',
    explanation: 'Aynı satırda arada 1 kare (Kare) bırakılarak katlandığında Üçgenin tam karşısına Mor Altıgen gelir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'square', color: '#38bdf8' }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#f59e0b' }, isCorrect: false },
      { id: 'c', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: true },
      { id: 'd', visual: { shape: 'diamond', color: '#eab308' }, isCorrect: false },
    ],
  },
  {
    id: 'ka-2',
    prompt: 'Bu küp açılımında Mavi Karenin (■) tam karşısındaki yüz hangisidir?',
    hint: 'Merkezdeki kare taban olursa, en alttaki sarı elmas tam üst kapak olur!',
    explanation: 'Dikey 4 karelik şeritte Merkez Kare ile Sarı Elmas arasında 1 kare (Daire) vardır; yani bu ikisi karşılıklıdır!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'diamond', color: '#eab308' }, isCorrect: true },
      { id: 'b', visual: { shape: 'circle', color: '#f43f5e' }, isCorrect: false },
      { id: 'c', visual: { shape: 'star', color: '#f59e0b' }, isCorrect: false },
      { id: 'd', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
    ],
  },
  {
    id: 'ka-3',
    prompt: 'Küp Katlama: Verilen açık küp katlandığında aşağıdaki 3B küplerden HANGİSİ OLUŞABİLİR?',
    hint: 'Karşılıklı gelen iki şekil ASLA aynı anda komşu yüzlerde yan yana görünemez!',
    explanation: 'Yıldız-Daire, Üçgen-Altıgen, Kare-Elmas karşılıklıdır. Komşu yüzler [Yıldız - Kare - Altıgen] B şıkkında doğru birleşir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      {
        id: 'a',
        visual: {
          cubeFaces: {
            top: { shape: 'star', color: '#f59e0b' },
            left: { shape: 'circle', color: '#f43f5e' },
            right: { shape: 'square', color: '#38bdf8' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'b',
        visual: {
          cubeFaces: {
            top: { shape: 'star', color: '#f59e0b' },
            left: { shape: 'square', color: '#38bdf8' },
            right: { shape: 'hexagon', color: '#a855f7' },
          },
        },
        isCorrect: true,
      },
      {
        id: 'c',
        visual: {
          cubeFaces: {
            top: { shape: 'square', color: '#38bdf8' },
            left: { shape: 'triangle', color: '#10b981' },
            right: { shape: 'hexagon', color: '#a855f7' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'd',
        visual: {
          cubeFaces: {
            top: { shape: 'diamond', color: '#eab308' },
            left: { shape: 'square', color: '#38bdf8' },
            right: { shape: 'circle', color: '#f43f5e' },
          },
        },
        isCorrect: false,
      },
    ],
  },
  {
    id: 'ka-4',
    prompt: 'Üstten Görünüm: Bu 3 boyutlu küp yapısına TAM TEPEDEN (kuş bakışı) baktığımızda hangi tablo görünür?',
    hint: 'Her sütundaki blokların yüksekliği (kat sayısı) kutulara yazılır veya dolu/boş görünür.',
    explanation: 'Arka sırada 3 ve 1, ön sırada 2 ve boş (0) sütun vardır. Üstten bakış D şıkkıdır!',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 1], [2, 0]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[1, 3], [0, 2]] }, isCorrect: false },
      { id: 'b', visual: { grid: [[2, 0], [3, 1]] }, isCorrect: false },
      { id: 'c', visual: { grid: [[3, 2], [1, 0]] }, isCorrect: false },
      { id: 'd', visual: { grid: [[3, 1], [2, 0]] }, isCorrect: true },
    ],
  },
  {
    id: 'ka-5',
    prompt: 'Küp Katlama: Kırmızı Dairenin (●) komşusu OLMAYAN (tam karşısındaki) şekil hangisidir?',
    hint: 'Bir küpte her yüzün 4 komşusu ve 1 tam karşı yüzü vardır.',
    explanation: 'Üstteki Yıldız ile alttaki Kırmızı Daire arasında Merkez Kare olduğu için Yıldız ve Daire tam karşı karşıyadır!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#f59e0b' }, isCorrect: true },
      { id: 'c', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: false },
      { id: 'd', visual: { shape: 'diamond', color: '#eab308' }, isCorrect: false },
    ],
  },
  {
    id: 'ka-6',
    prompt: 'Üstten Görünüm: Sağdaki yapının kat sayılarını gösteren üstten görünüm planı hangisidir?',
    hint: 'Arka sıranın her iki kulesi de 2 katlı, ön sırada sadece sağ köşede 1 küp var.',
    explanation: 'Üst satır [2, 2], alt satır [0, 1] yerleşimini veren A şıkkıdır.',
    visualType: 'cubes3d',
    visualData: { heights: [[2, 2], [0, 1]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[2, 2], [0, 1]] }, isCorrect: true },
      { id: 'b', visual: { grid: [[2, 2], [1, 0]] }, isCorrect: false },
      { id: 'c', visual: { grid: [[0, 1], [2, 2]] }, isCorrect: false },
      { id: 'd', visual: { grid: [[2, 1], [2, 0]] }, isCorrect: false },
    ],
  },
  {
    id: 'ka-7',
    prompt: 'Hangi 3B küp bu açılımdan OLUŞABİLİR? (Karşılıklı yüzleri ele!)',
    hint: 'Aynı satır/sütunda karşılıklı olanlar yan yana gelemez.',
    explanation: 'Sarı Elmas (alt kapak) ile Yeşil Üçgen ve Kırmızı Daire birbirine komşudur: C şıkkı doğru birleşimdir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_basic',
      faces: {
        top: { shape: 'star', color: '#f59e0b' },
        left: { shape: 'triangle', color: '#10b981' },
        center: { shape: 'square', color: '#38bdf8' },
        right: { shape: 'hexagon', color: '#a855f7' },
        bottom: { shape: 'circle', color: '#f43f5e' },
        tail: { shape: 'diamond', color: '#eab308' },
      },
    },
    options: [
      {
        id: 'a',
        visual: {
          cubeFaces: {
            top: { shape: 'triangle', color: '#10b981' },
            left: { shape: 'hexagon', color: '#a855f7' },
            right: { shape: 'square', color: '#38bdf8' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'b',
        visual: {
          cubeFaces: {
            top: { shape: 'square', color: '#38bdf8' },
            left: { shape: 'diamond', color: '#eab308' },
            right: { shape: 'star', color: '#f59e0b' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'c',
        visual: {
          cubeFaces: {
            top: { shape: 'circle', color: '#f43f5e' },
            left: { shape: 'triangle', color: '#10b981' },
            right: { shape: 'diamond', color: '#eab308' },
          },
        },
        isCorrect: true,
      },
      {
        id: 'd',
        visual: {
          cubeFaces: {
            top: { shape: 'circle', color: '#f43f5e' },
            left: { shape: 'star', color: '#f59e0b' },
            right: { shape: 'triangle', color: '#10b981' },
          },
        },
        isCorrect: false,
      },
    ],
  },
  {
    id: 'ka-8',
    prompt: 'Bu L-kule yapısının üstten görünümü (kat yükseklikleri) hangisidir?',
    hint: 'Sol arka köşe 4 katlı en yüksek kuledir.',
    explanation: 'Üst satır [4, 2], alt satır [3, 1] planı B şıkkında yer alır.',
    visualType: 'cubes3d',
    visualData: { heights: [[4, 2], [3, 1]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[4, 3], [2, 1]] }, isCorrect: false },
      { id: 'b', visual: { grid: [[4, 2], [3, 1]] }, isCorrect: true },
      { id: 'c', visual: { grid: [[3, 1], [4, 2]] }, isCorrect: false },
      { id: 'd', visual: { grid: [[2, 4], [1, 3]] }, isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 12. SAYISAL & ŞEKİLSEL ÖRÜNTÜ DİZİLERİ (8 Bulmaca)
// ----------------------------------------------------------------------------
export const ORUNTU_DIZILERI_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'od-1',
    prompt: 'Sayı Örüntüsü: Dizideki artış kuralını keşfet! "?" yerine hangi sayı gelmelidir?',
    hint: 'Ardışık sayılar arasındaki farkları kontrol et: +2, +3, +4...',
    explanation: 'Farklar 1 artarak ilerliyor: 2 (+2)→ 4 (+3)→ 7 (+4)→ 11 (+5)→ 16!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '2', color: '#38bdf8' },
        { kind: 'number', text: '4', color: '#38bdf8' },
        { kind: 'number', text: '7', color: '#38bdf8' },
        { kind: 'number', text: '11', color: '#38bdf8' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '14', isCorrect: false },
      { id: 'b', label: '15', isCorrect: false },
      { id: 'c', label: '16', isCorrect: true },
      { id: 'd', label: '17', isCorrect: false },
    ],
  },
  {
    id: 'od-2',
    prompt: 'Şekil & Dönüş Dizisi: Her adımda 90° saat yönünde dönen şeklin 5. adımı hangisidir?',
    hint: '0° → 90° → 180° → 270° → bir tam turdan sonra tekrar başa (0°) döner.',
    explanation: '4 adımda tam tur atan üçgen 5. adımda tekrar yukarı (0°) bakar ve renk dönüşümü gereği Mavi olur!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'shape', cell: { shape: 'triangle', color: '#38bdf8', rotation: 0 } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#f59e0b', rotation: 90 } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#38bdf8', rotation: 180 } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#f59e0b', rotation: 270 } },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'triangle', color: '#38bdf8', rotation: 0 }, isCorrect: true },
      { id: 'b', visual: { shape: 'triangle', color: '#f59e0b', rotation: 0 }, isCorrect: false },
      { id: 'c', visual: { shape: 'triangle', color: '#38bdf8', rotation: 90 }, isCorrect: false },
      { id: 'd', visual: { shape: 'triangle', color: '#38bdf8', rotation: 180 }, isCorrect: false },
    ],
  },
  {
    id: 'od-3',
    prompt: 'İkişer İkişer Karma Örüntü: "?" yerine gelecek doğru sayıyı bul!',
    hint: 'Tek ve çift sıradaki sayıları ayrı ayrı takip et (10, 12, 14 ve 20, 18, ...).',
    explanation: '1. grup +2 artıyor (10, 12, 14), 2. grup -2 azalıyor (20, 18, 16). Soru işareti 16 olmalıdır!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '10', color: '#10b981' },
        { kind: 'number', text: '20', color: '#a855f7' },
        { kind: 'number', text: '12', color: '#10b981' },
        { kind: 'number', text: '18', color: '#a855f7' },
        { kind: 'number', text: '14', color: '#10b981' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '15', isCorrect: false },
      { id: 'b', label: '16', isCorrect: true },
      { id: 'c', label: '17', isCorrect: false },
      { id: 'd', label: '22', isCorrect: false },
    ],
  },
  {
    id: 'od-4',
    prompt: 'Büyüyen Çokgen Örüntüsü: Kenar sayılarına dikkat et! "?" yerine hangi şekil gelir?',
    hint: 'Üçgen → Kare → Altıgen üçlü döngüsü sırayla tekrarlanıyor!',
    explanation: 'Üçgen, Kare, Altıgen döngüsünde Kare sonrasında sıradaki şekil Mor Altıgen (A şıkkı) olmalıdır!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'shape', cell: { shape: 'triangle', color: '#38bdf8' } },
        { kind: 'shape', cell: { shape: 'square', color: '#10b981' } },
        { kind: 'shape', cell: { shape: 'hexagon', color: '#a855f7' } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#38bdf8' } },
        { kind: 'shape', cell: { shape: 'square', color: '#10b981' } },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: true },
      { id: 'b', visual: { shape: 'triangle', color: '#38bdf8' }, isCorrect: false },
      { id: 'c', visual: { shape: 'circle', color: '#f43f5e' }, isCorrect: false },
      { id: 'd', visual: { shape: 'hexagon', color: '#38bdf8' }, isCorrect: false },
    ],
  },
  {
    id: 'od-5',
    prompt: 'Mantıksal Sınıflama: Verilen 4 kavramdan hangisi diğerlerinden FARKLI bir gruba aittir?',
    hint: 'Üç tanesi doğal bir meyvedir; biri toprak altında yetişen bir sebzedir.',
    explanation: 'Elma, Muz ve Çilek meyvedir; Patates ise toprak altında yetişen bir sebzedir!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'badge', text: '🍎 Elma', color: '#f43f5e' },
        { kind: 'badge', text: '🍌 Muz', color: '#eab308' },
        { kind: 'badge', text: '🍓 Çilek', color: '#f43f5e' },
        { kind: 'badge', text: '🥔 Patates', color: '#a855f7' },
      ],
    },
    options: [
      { id: 'a', label: '🍎 Elma', isCorrect: false },
      { id: 'b', label: '🍌 Muz', isCorrect: false },
      { id: 'c', label: '🍓 Çilek', isCorrect: false },
      { id: 'd', label: '🥔 Patates', isCorrect: true },
    ],
  },
  {
    id: 'od-6',
    prompt: 'İki Katlı Sayı Örüntüsü: Her sayı bir öncekinin kaç katı veya fazlası?',
    hint: '3 → 6 → 12 → 24... Her adımda sayı ikiye katlanıyor!',
    explanation: 'Sayılar her adımda 2 ile çarpılıyor: 24 × 2 = 48!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '3', color: '#f59e0b' },
        { kind: 'number', text: '6', color: '#f59e0b' },
        { kind: 'number', text: '12', color: '#f59e0b' },
        { kind: 'number', text: '24', color: '#f59e0b' },
        { kind: 'question', text: '?', color: '#38bdf8' },
      ],
    },
    options: [
      { id: 'a', label: '36', isCorrect: false },
      { id: 'b', label: '46', isCorrect: false },
      { id: 'c', label: '48', isCorrect: true },
      { id: 'd', label: '50', isCorrect: false },
    ],
  },
  {
    id: 'od-7',
    prompt: 'Adet & İç Nokta Örüntüsü: Sıradaki kutuda kaç tane ve nasıl şekil olmalıdır?',
    hint: 'Adet 1 → 2 → 3 → 1 diye başa dönüyor; nokta ise boş-dolu-boş gidiyor.',
    explanation: 'Sayılar 1, 2, 3 döngüsünde olduğu için 4. adımda 1 adet, iç nokta sırası ise boş-dolu-boş-dolu olduğundan noktalı 1 Yıldız gelir!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'shape', cell: { shape: 'star', color: '#f59e0b', count: 1, innerDot: false } },
        { kind: 'shape', cell: { shape: 'star', color: '#f59e0b', count: 2, innerDot: true } },
        { kind: 'shape', cell: { shape: 'star', color: '#f59e0b', count: 3, innerDot: false } },
        { kind: 'question', text: '?', color: '#38bdf8' },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'star', color: '#f59e0b', count: 1, innerDot: true }, isCorrect: true },
      { id: 'b', visual: { shape: 'star', color: '#f59e0b', count: 1, innerDot: false }, isCorrect: false },
      { id: 'c', visual: { shape: 'star', color: '#f59e0b', count: 2, innerDot: true }, isCorrect: false },
      { id: 'd', visual: { shape: 'star', color: '#38bdf8', count: 1, innerDot: true }, isCorrect: false },
    ],
  },
  {
    id: 'od-8',
    prompt: 'Toplam Örüntüsü (Fibonacci Mantığı): Her yeni sayı kendinden önceki iki sayının toplamıdır!',
    hint: '1 + 2 = 3, 2 + 3 = 5, 3 + 5 = 8... Şimdi 5 + 8 = ?',
    explanation: 'Önceki iki sayıyı topladığımızda 5 + 8 = 13 elde edilir!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '1', color: '#a855f7' },
        { kind: 'number', text: '2', color: '#a855f7' },
        { kind: 'number', text: '3', color: '#a855f7' },
        { kind: 'number', text: '5', color: '#a855f7' },
        { kind: 'number', text: '8', color: '#a855f7' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '11', isCorrect: false },
      { id: 'b', label: '12', isCorrect: false },
      { id: 'c', label: '13', isCorrect: true },
      { id: 'd', label: '14', isCorrect: false },
    ],
  },
];

// ============================================================================
// SINIF DÜZEYİNE GÖRE ETKİNLİK VE SORU SEÇİM YARDIMCILARI (1. - 4. SINIF)
// ============================================================================

export const normalizeBilsemGrade = (grade?: number | null): BilsemGrade => {
  if (grade === 1 || grade === 2 || grade === 3 || grade === 4) return grade;
  return 2;
};

export const getActivitiesForGrade = (grade: BilsemGrade): BilsemActivityMeta[] => {
  const list = BILSEM_ACTIVITIES.filter((a) => a.grades.includes(grade));
  if (grade === 4) {
    // 4. Sınıfta ileri düzey MEB sınav ve 3B etkinlikler ön sırada yer alır
    const priority: BilsemActivityId[] = [
      'on_test',
      'coklu_zeka',
      'kup_acilimi',
      'oruntu_dizileri',
      'ayna_simetrisi',
      'bilissel_uyarim',
      'dikkati_guclendirme',
      'desen_etkinlikleri',
      'sekil_bulmaca',
      'sekil_nesne_bulma',
      'gorsel_ayirt_etme',
    ];
    return [...list].sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id));
  }
  return list;
};

const pickByIds = <T extends { id: string }>(items: T[], ids: string[]): T[] => {
  const map = new Map(items.map((item) => [item.id, item]));
  const picked = ids.map((id) => map.get(id)).filter((x): x is T => Boolean(x));
  return picked.length > 0 ? picked : items;
};

const sliceByGrade = <T,>(items: T[], grade: BilsemGrade): T[] => {
  if (grade === 1) return items.slice(0, Math.min(6, items.length));
  if (grade === 2) return items.slice(0, Math.min(8, items.length));
  if (grade === 3) return items.slice(1);
  // 4. Sınıf: zorlu sorular önce gelecek şekilde tüm havuzun ileri ağırlıklı sırası
  const mid = Math.min(3, items.length);
  return [...items.slice(mid), ...items.slice(0, mid)];
};

export const getQuizQuestionsForGrade = (
  activityId: BilsemActivityId,
  grade: BilsemGrade
): QuizVisualQuestion[] => {
  switch (activityId) {
    case 'coklu_zeka':
      if (grade === 2) return pickByIds(COKLU_ZEKA_QUESTIONS, ['cz-1', 'cz-2', 'cz-3', 'cz-4', 'cz-6', 'cz-9', 'cz-10']);
      if (grade === 3) return pickByIds(COKLU_ZEKA_QUESTIONS, ['cz-2', 'cz-3', 'cz-4', 'cz-5', 'cz-6', 'cz-7', 'cz-8', 'cz-9']);
      if (grade === 4) return pickByIds(COKLU_ZEKA_QUESTIONS, ['cz-5', 'cz-7', 'cz-8', 'cz-9', 'cz-3', 'cz-6', 'cz-4', 'cz-1', 'cz-2', 'cz-10']);
      return COKLU_ZEKA_QUESTIONS.slice(0, 6);

    case 'on_test':
      if (grade === 1) return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-3', 'ot-6', 'ot-8', 'ot-10']);
      if (grade === 2) return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-2', 'ot-3', 'ot-5', 'ot-6', 'ot-8', 'ot-10']);
      if (grade === 3) return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-2', 'ot-3', 'ot-4', 'ot-5', 'ot-6', 'ot-8', 'ot-9', 'ot-10']);
      return pickByIds(ON_TEST_QUESTIONS, ['ot-4', 'ot-6', 'ot-7', 'ot-8', 'ot-9', 'ot-10', 'ot-2', 'ot-3', 'ot-5']);

    case 'golge_etkinlikleri':
      return sliceByGrade(GOLGE_QUESTIONS, grade);

    case 'desen_etkinlikleri':
      return sliceByGrade(DESEN_QUESTIONS, grade);

    case 'sekil_bulmaca':
      return sliceByGrade(SEKIL_BULMACA_QUESTIONS, grade);

    case 'sekil_nesne_bulma':
      return sliceByGrade(SEKIL_NESNE_QUESTIONS, grade);

    case 'ayna_simetrisi':
      if (grade === 1) return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-1', 'as-2', 'as-3', 'as-5', 'as-6']);
      if (grade === 2) return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-1', 'as-2', 'as-3', 'as-4', 'as-5', 'as-6']);
      if (grade === 3) return AYNA_SIMETRI_QUESTIONS;
      return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-4', 'as-7', 'as-8', 'as-3', 'as-5', 'as-6', 'as-1', 'as-2']);

    case 'kup_acilimi':
      if (grade === 3) return pickByIds(KUP_ACILIMI_QUESTIONS, ['ka-1', 'ka-2', 'ka-4', 'ka-5', 'ka-6', 'ka-3']);
      return pickByIds(KUP_ACILIMI_QUESTIONS, ['ka-3', 'ka-4', 'ka-6', 'ka-7', 'ka-8', 'ka-1', 'ka-2', 'ka-5']);

    case 'oruntu_dizileri':
      if (grade === 2) return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-1', 'od-2', 'od-4', 'od-5', 'od-7']);
      if (grade === 3) return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-1', 'od-2', 'od-3', 'od-4', 'od-5', 'od-6', 'od-7']);
      return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-3', 'od-6', 'od-7', 'od-8', 'od-2', 'od-1', 'od-4']);

    default:
      return [];
  }
};

export const getMemoryRoundsForGrade = (grade: BilsemGrade): MemoryMatrixRound[] => {
  if (grade === 1) {
    return BILISSEL_UYARIM_ROUNDS.slice(0, 5).map((r) => ({ ...r, previewMs: r.previewMs + 400 }));
  }
  if (grade === 2) return BILISSEL_UYARIM_ROUNDS.slice(0, 7);
  if (grade === 3) return BILISSEL_UYARIM_ROUNDS.slice(2, 9);
  return BILISSEL_UYARIM_ROUNDS.slice(3, 10);
};

export const getScanRoundsForGrade = (grade: BilsemGrade): TargetScanRound[] => {
  if (grade === 1) return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-1', 'dg-2', 'dg-3', 'dg-5', 'dg-6']);
  if (grade === 2) return DIKKATI_GUCLENDIRME_ROUNDS.slice(0, 7);
  if (grade === 3) return DIKKATI_GUCLENDIRME_ROUNDS.slice(1, 9);
  return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-4', 'dg-7', 'dg-8', 'dg-9', 'dg-10', 'dg-2', 'dg-6']);
};

export const getSpotOddRoundsForGrade = (grade: BilsemGrade): SpotOddRound[] => {
  return sliceByGrade(GORSEL_AYIRT_ETME_ROUNDS, grade);
};

export const getTaskCountForGrade = (activityId: BilsemActivityId, grade: BilsemGrade): number => {
  if (activityId === 'bilissel_uyarim') return getMemoryRoundsForGrade(grade).length;
  if (activityId === 'dikkati_guclendirme') return getScanRoundsForGrade(grade).length;
  if (activityId === 'gorsel_ayirt_etme') return getSpotOddRoundsForGrade(grade).length;
  return getQuizQuestionsForGrade(activityId, grade).length;
};

