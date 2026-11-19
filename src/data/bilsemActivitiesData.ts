import type { SpotOddGlyphSpec } from './bilsemVisualTypes';
import {
  generateExtraCokluZeka,
  generateExtraOnTest,
  generateExtraBiliselUyarim,
  generateExtraDikkatiGuclendirme,
  generateExtraGolge,
  generateExtraDesen,
  generateExtraSekilBulmaca,
  generateExtraSekilNesne,
  generateExtraGorselAyirtEtme,
  generateExtraAynaSimetrisi,
  generateExtraKupAcilimi,
  generateExtraOruntuDizileri,
  generateExtraKagitKatlama,
  generateExtraYonAlgoritma,
  generateMoreOnTest,
  generateMoreOruntu,
  generateMoreCokluZeka,
  generateMoreKagitKatlama,
  generateMoreAyna,
  generateMoreDesen,
} from './bilsemQuestionGenerators';
import {
  generateKisaSureliHafizaQuestions,
  generateZihinselDondurmeQuestions,
  generateSampleYonAlgoritma,
  generateSampleCokluZeka,
  generateSampleOnTest,
  generateSampleOruntuDizileri,
  generateSampleKupAcilimi,
  generateSampleAynaSimetrisi,
  generateSampleSekilBulmaca,
  generateSampleDesen,
  generateSampleGolgeQuestions,
} from './bilsemSampleGenerators';

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
  | 'oruntu_dizileri'
  | 'kagit_katlama'
  | 'yon_algoritma'
  | 'kisa_sureli_hafiza'
  | 'zihinsel_dondurme';

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
    questionCountLabel: '83 Etkinlik',
    grades: [2, 3],
  },
  {
    id: 'on_test',
    order: 2,
    title: 'BİLSEM Ön Test Sınav Aktiviteleri',
    shortDesc: 'MEB tablet tarama formatında 3x3 matris, şifreleme, döndürme, küp, kağıt katlama ve simetri denemesi.',
    skillFocus: 'Matris · Şifreleme · Sınav Pratiği',
    accentColor: 'sky',
    iconKey: '/MENUIKON/grid_icon_14.webp',
    questionCountLabel: '83 Soru',
    grades: [1, 2, 3],
  },
  {
    id: 'bilissel_uyarim',
    order: 3,
    title: 'Bilişsel Uyarım Aktiviteleri',
    shortDesc: '3x3, 4x4 ve 5x5 çalışma belleği matrisi ile konumları aklında tut ve zihinsel esneklik kazan.',
    skillFocus: 'Çalışma Belleği · Zihinsel Hız',
    accentColor: 'violet',
    iconKey: '/MENUIKON/grid_icon_07.webp',
    questionCountLabel: '60 Seviye',
    grades: [1, 2, 3],
  },
  {
    id: 'dikkati_guclendirme',
    order: 4,
    title: 'Dikkati Güçlendirme Etkinlikleri',
    shortDesc: 'Karmaşık sembol tablosunda kurala uyan tüm hedef nesneleri hatasız bul ve işaretle.',
    skillFocus: 'Seçici Dikkat · Görsel Tarama',
    accentColor: 'emerald',
    iconKey: '/MENUIKON/grid_icon_17.webp',
    questionCountLabel: '60 Görev',
    grades: [1, 2, 3],
  },
  {
    id: 'golge_etkinlikleri',
    order: 5,
    title: 'Dikkati Geliştirme Gölge Etkinlikleri',
    shortDesc: 'Renkli nesne veya birleşik figürün birebir doğru siyah gölgesini çeldiriciler arasından seç.',
    skillFocus: 'Siluet Algısı · Dış Hat Takibi',
    accentColor: 'cyan',
    iconKey: '/MENUIKON/grid_icon_25.webp',
    questionCountLabel: '60 Bulmaca',
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
    questionCountLabel: '90 Desen',
    grades: [1, 2, 3],
  },
  {
    id: 'sekil_bulmaca',
    order: 7,
    title: 'Şekil Bulmaca (Puzzle) Etkinlikleri',
    shortDesc: 'Bütünden çıkarılmış eksik parçayı kenar, açı ve renk uyumuna göre bularak yerleştir.',
    skillFocus: 'Parça-Bütün · Tangram Mantığı',
    accentColor: 'orange',
    iconKey: '/MENUIKON/grid_icon_10.webp',
    questionCountLabel: '60 Puzzle',
    grades: [1, 2, 3],
  },
  {
    id: 'sekil_nesne_bulma',
    order: 8,
    title: 'Dikkati Geliştirme Şekil Nesne Bulma',
    shortDesc: 'İç içe geçmiş geometrik çizgiler arasında gizlenen hedef şekli ve sayısını keşfet.',
    skillFocus: 'Şekil-Zemin Ayrımı · Derin Odak',
    accentColor: 'indigo',
    iconKey: '/MENUIKON/grid_icon_03.webp',
    questionCountLabel: '60 Görev',
    grades: [1, 2, 3],
  },
  {
    id: 'gorsel_ayirt_etme',
    order: 9,
    title: 'Dikkati Geliştirme Görsel Ayırt Etme Etkinlikleri',
    shortDesc: 'Birbirinin neredeyse aynısı olan görseller arasında küçük detayı farklı olanı hemen yakala.',
    skillFocus: 'Detay Yakalama · Fark Bulma',
    accentColor: 'teal',
    iconKey: '/MENUIKON/grid_icon_15.webp',
    questionCountLabel: '60 Karşılaştırma',
    grades: [1, 2, 3],
  },
  {
    id: 'ayna_simetrisi',
    order: 10,
    title: 'Ayna Simetrisi ve Yansıma Etkinlikleri',
    shortDesc: 'Dikey ve yatay ayna eksenine göre şekillerin, piksellerin ve okların doğru yansımasını bul.',
    skillFocus: 'Uzamsal Yansıma · Yön Algısı',
    accentColor: 'cyan',
    iconKey: '/MENUIKON/grid_icon_30.webp',
    questionCountLabel: '90 Etkinlik',
    grades: [1, 2, 3],
  },
  {
    id: 'kup_acilimi',
    order: 11,
    title: 'Küp Açılımı ve 3B Uzamsal Düşünme',
    shortDesc: 'Açık küp ağlarında karşılıklı yüzleri, katlanmış küpü ve blokların üstten görünümünü çöz.',
    skillFocus: '3B Tasarım · Katlama · Perspektif',
    accentColor: 'amber',
    iconKey: '/MENUIKON/grid_icon_33.webp',
    questionCountLabel: '60 Görev',
    grades: [3],
  },
  {
    id: 'oruntu_dizileri',
    order: 12,
    title: 'Sayısal & Şekilsel Örüntü Dizileri',
    shortDesc: 'Artan sayı dizileri, dönen sembol örüntüleri ve mantıksal sınıflamada kuralı yakala.',
    skillFocus: 'Akıl Yürütme · Örüntü Kurma',
    accentColor: 'lime',
    iconKey: '/MENUIKON/grid_icon_20.webp',
    questionCountLabel: '129 Bulmaca',
    grades: [2, 3],
  },
  {
    id: 'kagit_katlama',
    order: 13,
    title: 'Kağıt Katlama ve Delik Açma',
    shortDesc: 'İkiye, dörde veya çapraz katlanıp delinen kare kağıdın açıldığında nasıl görüneceğini tahmin et.',
    skillFocus: 'Simetrik Katlama · Uzamsal Hayal',
    accentColor: 'rose',
    iconKey: '/MENUIKON/grid_icon_29.webp',
    questionCountLabel: '88 Görev',
    grades: [2, 3],
  },
  {
    id: 'yon_algoritma',
    order: 14,
    title: 'Yön Takibi, Kodlama & Görsel Mantık',
    shortDesc: 'Ok yönleriyle hedef kareyi bul ve şekil birleştirme / çakıştırma (XOR) kurallarını çöz.',
    skillFocus: 'Algoritmik Düşünme · Görsel İşlem',
    accentColor: 'teal',
    iconKey: '/MENUIKON/grid_icon_38.webp',
    questionCountLabel: '92 Görev',
    grades: [1, 2, 3],
  },
  {
    id: 'kisa_sureli_hafiza',
    order: 15,
    title: 'Görsel & Sayısal Hafıza (Aklında Tut)',
    shortDesc: 'Kısa süre görünen nesneleri ve sayı/harf dizilerini sırasıyla aklında tutup doğru seçeneği yakala.',
    skillFocus: 'Kısa Süreli Bellek · Sıralı Hatırlama',
    accentColor: 'indigo',
    iconKey: '/MENUIKON/grid_icon_22.webp',
    questionCountLabel: '64 Hafıza',
    grades: [1, 2, 3],
  },
  {
    id: 'zihinsel_dondurme',
    order: 16,
    title: 'Zihinsel Döndürme & Farklı Şekil',
    shortDesc: 'Çokgenlerin döndürülmüş hâlini ve renkli şekiller arasında ters çevrilmiş farklı parçayı bul.',
    skillFocus: 'Zihinsel Döndürme · Uzamsal Algı',
    accentColor: 'orange',
    iconKey: '/MENUIKON/grid_icon_18.webp',
    questionCountLabel: '64 Bulmaca',
    grades: [1, 2, 3],
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
    | 'sequence_row'
    | 'paper_fold'
    | 'grid_path'
    | 'shape_overlay'
    | 'grid_path_encode'
    | 'grid_path_x'
    | 'fruit_equation'
    | 'letter_strip'
    | 'colored_tower_top'
    | 'rotate_poly'
    | 'odd_poly_rotate'
    | 'grid_mirror'
    | 'color_digit_cipher'
    | 'colored_cube_net'
    | 'grid_cutout'
    | 'half_symmetry'
    | 'domino_sum'
    | 'flash_memory';
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
  | 'balloon'
  | 'car'
  | 'penguin'
  | 'icecream'
  | 'castle_spot'
  | 'bee'
  | 'trophy_spot';

export interface SpotOddRound {
  id: string;
  prompt: string;
  sceneTheme: SpotOddTheme;
  /** 0 = ilk görünüm, 1 = aynı temanın ikinci (farklı detaylı) görünümü */
  variantIndex?: number;
  /** Geometrik rozet turlarında kullanılır (tema yerine bu çizilir) */
  glyphSpec?: SpotOddGlyphSpec;
  cards: {
    id: string;
    variant: 'normal' | 'odd';
    oddDetail?: string;
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
  {
    id: 'cz-11',
    prompt: 'Bu 3 katmanlı büyük küp yapısında toplam kaç adet birim küp vardır?',
    hint: 'Arka sıradan ön sıraya doğru her sütundaki kat sayılarını sırayla topla.',
    explanation: 'Arka sırada 3 + 3 + 2 = 8, orta sırada 2 + 1 + 1 = 4, ön sırada 1 = Toplam 13 küp vardır!',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 3, 2], [2, 1, 1], [1, 0, 0]] },
    options: [
      { id: 'a', label: '11 Küp', isCorrect: false },
      { id: 'b', label: '12 Küp', isCorrect: false },
      { id: 'c', label: '13 Küp', isCorrect: true },
      { id: 'd', label: '14 Küp', isCorrect: false },
    ],
  },
  {
    id: 'cz-12',
    prompt: 'İki terazi dengede! 1 Yıldız ağırlığı kaç Kareye eşittir?',
    hint: 'İlk teraziden 1 Altıgen = 2 Kare. İkinci terazide Altıgen yerine 2 Kare yaz.',
    explanation: '1 Altıgen = 2 Kare olduğuna göre, 1 Yıldız = 2 Kare + 1 Kare = 3 Kare ağırlığındadır!',
    visualType: 'balance',
    visualData: {
      scale1: { left: ['hexagon'], right: ['square', 'square'] },
      scale2: { left: ['star'], right: ['hexagon', 'square'] },
    },
    options: [
      { id: 'a', label: '2 Kare', isCorrect: false },
      { id: 'b', label: '3 Kare', isCorrect: true },
      { id: 'c', label: '4 Kare', isCorrect: false },
      { id: 'd', label: '5 Kare', isCorrect: false },
    ],
  },
  {
    id: 'cz-13',
    prompt: 'Dikey ortadan sola katlanıp üstten delinen kare kağıt açıldığında nasıl görünür?',
    hint: 'Kat izi dikey merkez çizgisidir; delik çizgiye göre sağ tarafa simetrik kopyalanır.',
    explanation: 'Kağıt açıldığında sol üstteki deliğin aynısı sağ üstte oluşur: Yan yana 2 üst delik (B şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'half_v',
      holes: [{ x: 25, y: 30, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 25, y: 30 }, { x: 25, y: 70 }], foldLine: 'v' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 25, y: 30 }, { x: 75, y: 30 }], foldLine: 'v' }, isCorrect: true },
      { id: 'c', visual: { holes: [{ x: 25, y: 30 }, { x: 75, y: 70 }], foldLine: 'v' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 50, y: 30 }], foldLine: 'v' }, isCorrect: false },
    ],
  },
  {
    id: 'cz-14',
    prompt: 'Görsel Mantık (⊕ Çakıştırma): İki tablo üst üste konuyor, AYNI yerde olan noktalar birbirini siliyor! Sonuç hangisidir?',
    hint: 'Sadece tek bir tabloda bulunan noktalar kalır; ikisinde de olan ortak noktalar yok olur.',
    explanation: 'Üst orta ve merkezdeki noktalar iki tabloda da olduğu için silinir; geriye sol üst ve sol alt kalır (A şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'xor',
      ruleSymbol: '⊕',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 4, color: '#0284c7' }],
      gridB: [{ idx: 2, color: '#f59e0b' }, { idx: 4, color: '#f59e0b' }, { idx: 6, color: '#f59e0b' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 6, color: '#10b981' }] }, isCorrect: true },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }] }, isCorrect: false },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 6, color: '#10b981' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: false },
    ],
  },
  {
    id: 'cz-15',
    prompt: 'Çoklu Kural Matrisi: Her satırda şekil sayısı artıyor, şekil ve renk eksik kalmadan tamamlanıyor. "?" nedir?',
    hint: '3. satırda 3’lü grup var; Yıldız ve Daire kullanılmış. Eksik renk Mavi!',
    explanation: '3. satırda sayı 3, eksik şekil Üçgen ve eksik renk Mavi (#38bdf8): 3 Mavi Üçgen!',
    visualType: 'matrix3x3',
    visualData: {
      cells: [
        { shape: 'circle', color: '#38bdf8', count: 1 },
        { shape: 'triangle', color: '#f59e0b', count: 1 },
        { shape: 'star', color: '#10b981', count: 1 },
        { shape: 'triangle', color: '#10b981', count: 2 },
        { shape: 'star', color: '#38bdf8', count: 2 },
        { shape: 'circle', color: '#f59e0b', count: 2 },
        { shape: 'star', color: '#f59e0b', count: 3 },
        { shape: 'circle', color: '#10b981', count: 3 },
        null,
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'triangle', color: '#38bdf8', count: 2 }, isCorrect: false },
      { id: 'b', visual: { shape: 'triangle', color: '#38bdf8', count: 3 }, isCorrect: true },
      { id: 'c', visual: { shape: 'triangle', color: '#f59e0b', count: 3 }, isCorrect: false },
      { id: 'd', visual: { shape: 'circle', color: '#38bdf8', count: 3 }, isCorrect: false },
    ],
  },
  {
    id: 'cz-16',
    prompt: 'Yön Algoritması: A1 karesinden başlayıp okları sırayla takip edersen hangi kareye ulaşırsın?',
    hint: 'A1’den 2 adım sağa (C1), 2 adım aşağı (C3), 1 adım sola (B3)!',
    explanation: 'Sağa 2 adım C sütununa, aşağı 2 adım 3. satıra, sola 1 adım ise B3 karesine ulaştırır!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [0, 0],
      showCoords: true,
      moves: [
        { dir: 'R', steps: 2 },
        { dir: 'D', steps: 2 },
        { dir: 'L', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'B2', isCorrect: false },
      { id: 'b', label: 'C3', isCorrect: false },
      { id: 'c', label: 'B3', isCorrect: true },
      { id: 'd', label: 'D2', isCorrect: false },
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
  {
    id: 'ot-11',
    prompt: 'Kağıt Katlama Testi: İki kez katlanıp sol üstten 1 kez delinen kare kağıt açılınca nasıl olur?',
    hint: 'Kağıt dörde katlandığı için açıldığında delik sayısı 4 katına çıkar!',
    explanation: 'Her çeyrek karede 1 delik yer alacağından 4 köşede simetrik 4 daire oluşur (C şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 25, y: 25, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 75 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }], foldLine: 'vh' }, isCorrect: true },
      { id: 'd', visual: { holes: [{ x: 42, y: 42 }, { x: 58, y: 42 }, { x: 42, y: 58 }, { x: 58, y: 58 }], foldLine: 'vh' }, isCorrect: false },
    ],
  },
  {
    id: 'ot-12',
    prompt: 'Görsel Birleştirme (+): İki 3x3 deseni üst üste birleştirirsek ortaya çıkan tüm noktalar hangi şekli oluşturur?',
    hint: 'Sol üstten sağ alta ve sağ üstten sol alta iki köşegen birleşiyor.',
    explanation: 'İki köşegenin birleşimi tam bir X (çarpı) deseni oluşturur: B şıkkı!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'union',
      ruleSymbol: '+',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 8, color: '#0284c7' }],
      gridB: [{ idx: 2, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 6, color: '#0284c7' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 1, color: '#0284c7' }, { idx: 3, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 5, color: '#0284c7' }, { idx: 7, color: '#0284c7' }] }, isCorrect: false },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 6, color: '#0284c7' }, { idx: 8, color: '#0284c7' }] }, isCorrect: true },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 6, color: '#0284c7' }, { idx: 8, color: '#0284c7' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 4, color: '#0284c7' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ot-13',
    prompt: 'Yön Takibi: Başlangıç noktasından 2 Sağa ve 2 Aşağı ilerlersen hangi şeklin üzerine gelirsin?',
    hint: 'A1 karesinden 2 adım sağa C1, sonra 2 adım aşağı in: C3!',
    explanation: '2 sağa + 2 aşağı hareketi seni tam olarak Yeşil Üçgenin bulunduğu C3 karesine götürür!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [0, 0],
      showCoords: false,
      targets: [
        { row: 1, col: 2, shape: 'star', color: '#38bdf8' },
        { row: 2, col: 1, shape: 'square', color: '#f43f5e' },
        { row: 2, col: 2, shape: 'triangle', color: '#10b981' },
        { row: 3, col: 2, shape: 'circle', color: '#f59e0b' },
      ],
      moves: [
        { dir: 'R', steps: 2 },
        { dir: 'D', steps: 2 },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'star', color: '#38bdf8' }, isCorrect: false },
      { id: 'b', visual: { shape: 'square', color: '#f43f5e' }, isCorrect: false },
      { id: 'c', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: true },
      { id: 'd', visual: { shape: 'circle', color: '#f59e0b' }, isCorrect: false },
    ],
  },
  {
    id: 'ot-14',
    prompt: 'Analoji Testi: İlk çifte bakarak "?" yerine hangi şekil grubunun geleceğini bul!',
    hint: 'Şekil 180° ters dönüyor ve adedi 1’den 2’ye çıkıyor; renk ve iç nokta aynı kalıyor.',
    explanation: '1 adet noktalı Yeşil Yıldız ters dönüp (180°) 2 adet noktalı Yeşil Yıldız olur (D şıkkı)!',
    visualType: 'analogy',
    visualData: {
      a: { shape: 'triangle', color: '#38bdf8', rotation: 0, count: 1 },
      b: { shape: 'triangle', color: '#38bdf8', rotation: 180, count: 2 },
      c: { shape: 'star', color: '#10b981', rotation: 0, count: 1, innerDot: true },
    },
    options: [
      { id: 'a', visual: { shape: 'star', color: '#10b981', rotation: 0, count: 2, innerDot: true }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#10b981', rotation: 180, count: 1, innerDot: true }, isCorrect: false },
      { id: 'c', visual: { shape: 'star', color: '#38bdf8', rotation: 180, count: 2, innerDot: false }, isCorrect: false },
      { id: 'd', visual: { shape: 'star', color: '#10b981', rotation: 180, count: 2, innerDot: true }, isCorrect: true },
    ],
  },
  {
    id: 'ot-15',
    prompt: 'Denge Terazisi: İkinci terazide 1 Altıgen kaç adet Daireye eşittir?',
    hint: 'İlk terazide 1 Kare = 2 Daire. İkinci terazideki Karenin yerine 2 Daire koy!',
    explanation: '1 Kare = 2 Daire olduğuna göre, 1 Altıgen = 2 Daire + 1 Daire = 3 Daire ağırlığındadır.',
    visualType: 'balance',
    visualData: {
      scale1: { left: ['circle', 'circle'], right: ['square'] },
      scale2: { left: ['hexagon'], right: ['square', 'circle'] },
    },
    options: [
      { id: 'a', label: '2 Daire', isCorrect: false },
      { id: 'b', label: '3 Daire', isCorrect: true },
      { id: 'c', label: '4 Daire', isCorrect: false },
      { id: 'd', label: '5 Daire', isCorrect: false },
    ],
  },
  {
    id: 'ot-16',
    prompt: '3B Küp Sayma: Görseldeki ikiz kule yapısında toplam kaç küp kullanılmıştır?',
    hint: 'Arka sırada 4 ve 3 yüksekliğinde iki kule, ön sırada ikişer küp var.',
    explanation: '4 + 3 + 2 + 2 = toplam 11 birim küp vardır!',
    visualType: 'cubes3d',
    visualData: { heights: [[4, 3], [2, 2]] },
    options: [
      { id: 'a', label: '9 Küp', isCorrect: false },
      { id: 'b', label: '10 Küp', isCorrect: false },
      { id: 'c', label: '11 Küp', isCorrect: true },
      { id: 'd', label: '12 Küp', isCorrect: false },
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
  {
    id: 'bu-11',
    title: '11. Seviye: Hızlı 3x3 Zikzak Bellek (4 Hücre)',
    gridSize: 3,
    targets: [0, 2, 4, 7],
    previewMs: 2100,
    hint: 'Üst köşelerle alt ortadaki T biçimini hemen fotoğrafla!',
  },
  {
    id: 'bu-12',
    title: '12. Seviye: 4x4 Çapraz & Köşe Kombinasyonu (5 Hücre)',
    gridSize: 4,
    targets: [0, 3, 6, 9, 12],
    previewMs: 2700,
    hint: 'Sol üstten başka sağ üstten sol alta inen ters köşegene odaklan.',
  },
  {
    id: 'bu-13',
    title: '13. Seviye: 4x4 Çift Blok Hafızası (6 Hücre)',
    gridSize: 4,
    targets: [1, 2, 4, 7, 13, 14],
    previewMs: 3000,
    hint: 'Üst ve alt kenarların ortaları ile orta satırın iki ucunu grupla!',
  },
  {
    id: 'bu-14',
    title: '14. Seviye: 5x5 Elmas Halka Deseni (7 Hücre)',
    gridSize: 5,
    targets: [2, 6, 8, 10, 14, 17, 22],
    previewMs: 3300,
    hint: 'Üst, sol, sağ ve alt uç noktalarla iç baklavayı aklında tut.',
  },
  {
    id: 'bu-15',
    title: '15. Seviye: Efsanevi 5x5 Çerçeve & Merkez (8 Hücre)',
    gridSize: 5,
    targets: [0, 2, 4, 12, 16, 18, 20, 24],
    previewMs: 3600,
    hint: 'Üst sırada 3 nokta, tam merkezde 1 ve alt yarıda simetrik 4 nokta!',
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
  {
    id: 'dg-11',
    prompt: 'Tüm Turuncu Yıldızları (★) Dikkatlice İşaretle!',
    gridCols: 5,
    items: [
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
      { shape: 'square', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'star', color: '#f59e0b', rotation: 0, isTarget: true },
    ],
    explanation: 'Farklı renkteki yıldızları ayıklayarak 6 Turuncu Yıldızı doğru seçtin!',
  },
  {
    id: 'dg-12',
    prompt: 'Yalnızca YUKARI (▲) Bakan Kırmızı Üçgenleri Seç!',
    gridCols: 5,
    items: [
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 180, isTarget: false },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f59e0b', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#f43f5e', rotation: 270, isTarget: false },
    ],
    explanation: 'Sadece tam yukarı (0°) bakan 5 Kırmızı Üçgeni buldun!',
  },
  {
    id: 'dg-13',
    prompt: '20 Sembol İçinden Tüm SARI ELMAS (◆) Şekillerini Seç!',
    gridCols: 5,
    items: [
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'square', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'star', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'square', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'triangle', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'square', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'star', color: '#eab308', rotation: 0, isTarget: false },
      { shape: 'diamond', color: '#eab308', rotation: 0, isTarget: true },
    ],
    explanation: 'Karelerle karışabilen 7 adet Sarı Elması hatasız yakaladın!',
  },
  {
    id: 'dg-14',
    prompt: 'Yalnızca SAĞA (▶) Bakan Yeşil Üçgenleri İşaretle!',
    gridCols: 5,
    items: [
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 270, isTarget: false },
      { shape: 'triangle', color: '#38bdf8', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 180, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#f59e0b', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 270, isTarget: false },
      { shape: 'square', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'triangle', color: '#f43f5e', rotation: 90, isTarget: false },
      { shape: 'triangle', color: '#10b981', rotation: 90, isTarget: true },
      { shape: 'triangle', color: '#10b981', rotation: 180, isTarget: false },
    ],
    explanation: 'Sola ve yukarı bakanları eleyip sağa bakan 5 Yeşil Üçgeni seçtin!',
  },
  {
    id: 'dg-15',
    prompt: 'Tüm Mavi Altıgenleri (⬡) Hızlıca Yakala!',
    gridCols: 5,
    items: [
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#a855f7', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'square', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#10b981', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'diamond', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'circle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'hexagon', color: '#f43f5e', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
      { shape: 'circle', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'star', color: '#38bdf8', rotation: 0, isTarget: false },
      { shape: 'hexagon', color: '#38bdf8', rotation: 0, isTarget: true },
    ],
    explanation: 'Yuvarlak dairelerle karışan 6 Mavi Altıgeni doğru tespit ettin!',
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
    explanation: 'İki kanadı simetrik, burun ucu sivri ve altta alev çıkıntısı olan birebir gölge doğru cevaptır.',
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
  {
    id: 'gl-11',
    prompt: 'Helikopterin birebir doğru siyah gölgesini bul!',
    hint: 'Üstteki büyük pervane, arka kuyruk pervanesi ve alt iniş kızaklarına dikkat et.',
    explanation: 'Sola bakan kokpit, alt kızak ayakları ve kuyruk pervanesi sadece B şıkkında birebir doğrudur!',
    visualType: 'shadow',
    visualData: { figure: 'helicopter' },
    options: [
      { id: 'a', visual: { figure: 'helicopter', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'helicopter', variant: 'exact' }, isCorrect: true },
      { id: 'c', visual: { figure: 'helicopter', variant: 'no_skid' }, isCorrect: false },
      { id: 'd', visual: { figure: 'helicopter', variant: 'short_blade' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-12',
    prompt: 'Porselen Çaydanlığın birebir gölgesi hangisidir?',
    hint: 'Emzik sol tarafta yukarı eğimli, kulp sağda ve tepede yuvarlak kapak topuzu var.',
    explanation: 'Sola bakan emzik, sağdaki halka kulp ve üst kapak topuzu D şıkkında tam olarak eşleşir.',
    visualType: 'shadow',
    visualData: { figure: 'teapot' },
    options: [
      { id: 'a', visual: { figure: 'teapot', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'teapot', variant: 'no_knob' }, isCorrect: false },
      { id: 'c', visual: { figure: 'teapot', variant: 'flat_handle' }, isCorrect: false },
      { id: 'd', visual: { figure: 'teapot', variant: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'gl-13',
    prompt: 'Klasik Gitar figürünün kusursuz siyah gölgesi hangisidir?',
    hint: 'Çift boğumlu gitar gövdesi, uzun sapı ve ucundaki 4 akort burgusunu kontrol et.',
    explanation: 'Üstteki akort burguları ve ince belli gövde hatları A şıkkındaki gölgeyle birebir örtüşür.',
    visualType: 'shadow',
    visualData: { figure: 'guitar' },
    options: [
      { id: 'a', visual: { figure: 'guitar', variant: 'exact' }, isCorrect: true },
      { id: 'b', visual: { figure: 'guitar', variant: 'short_neck' }, isCorrect: false },
      { id: 'c', visual: { figure: 'guitar', variant: 'no_pegs' }, isCorrect: false },
      { id: 'd', visual: { figure: 'guitar', variant: 'round_body' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-14',
    prompt: 'Renkli Şemsiyenin tam gölgesini çeldiriciler arasından seç!',
    hint: 'Alttaki J kanca sapın sağa kıvrılmasına ve tepedeki sivri uca bak.',
    explanation: 'Tepede sivri uç, kubbe altı dilimleri ve sağa kıvrılan baston sap C şıkkında doğrudur.',
    visualType: 'shadow',
    visualData: { figure: 'umbrella' },
    options: [
      { id: 'a', visual: { figure: 'umbrella', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'umbrella', variant: 'straight_handle' }, isCorrect: false },
      { id: 'c', visual: { figure: 'umbrella', variant: 'exact' }, isCorrect: true },
      { id: 'd', visual: { figure: 'umbrella', variant: 'no_tip' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-15',
    prompt: 'Sevimli Fil figürünün birebir doğru siyah gölgesi hangisidir?',
    hint: 'Sola uzanan kıvrık hortuma, büyük kulağa ve sağdaki küçük kuyruğa dikkat et!',
    explanation: 'Sola kıvrık hortum ve arkasındaki kuyruk çıkıntısı sadece B şıkkında yer alır.',
    visualType: 'shadow',
    visualData: { figure: 'elephant' },
    options: [
      { id: 'a', visual: { figure: 'elephant', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'elephant', variant: 'exact' }, isCorrect: true },
      { id: 'c', visual: { figure: 'elephant', variant: 'no_trunk' }, isCorrect: false },
      { id: 'd', visual: { figure: 'elephant', variant: 'no_tail' }, isCorrect: false },
    ],
  },
  {
    id: 'gl-16',
    prompt: 'Buharlı Lokomotifin birebir siyah gölgesini bul!',
    hint: 'Önde baca, arkada yüksek kabin ve altta 3 tekerleği tek tek say.',
    explanation: 'Öndeki baca çıkıntısı, arka kabin ve 3 tekerlek D şıkkında hatasız verilmiştir.',
    visualType: 'shadow',
    visualData: { figure: 'locomotive' },
    options: [
      { id: 'a', visual: { figure: 'locomotive', variant: 'mirrored' }, isCorrect: false },
      { id: 'b', visual: { figure: 'locomotive', variant: 'no_chimney' }, isCorrect: false },
      { id: 'c', visual: { figure: 'locomotive', variant: 'two_wheels' }, isCorrect: false },
      { id: 'd', visual: { figure: 'locomotive', variant: 'exact' }, isCorrect: true },
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
  {
    id: 'ds-11',
    prompt: 'Çeyrek Spiral Halkası: Ortada tam bir halka oluşturan kavislerden eksik parçayı bul!',
    hint: 'İç ve dış halka çizgisi merkeze doğru aynı kalınlıkta kavislenmelidir.',
    explanation: 'Sağ alt köşeden merkeze doğru sol üst kavisle birleşen tek parça B şıkkıdır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'spiral_quarter' },
    options: [
      { id: 'a', visual: { patternId: 'spiral_quarter', piece: 'flipped' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'spiral_quarter', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { patternId: 'spiral_quarter', piece: 'missing_ring' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'spiral_quarter', piece: 'wrong_color' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-12',
    prompt: 'Güneş Işını Mozaiği: Merkezden köşelere uzanan ışınları hangi parça tamamlar?',
    hint: 'Sarı merkez çemberi ile 3 ışın çizgisi sol üst köşeye doğru uzanmalı.',
    explanation: 'Merkez çeyrek dairesi ve üçlü sarı ışın çizgileri C şıkkında kesintisiz birleşir.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'sunburst_corner' },
    options: [
      { id: 'a', visual: { patternId: 'sunburst_corner', piece: 'outward' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'sunburst_corner', piece: 'no_core' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'sunburst_corner', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { patternId: 'sunburst_corner', piece: 'wrong_color' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-13',
    prompt: 'Köşebent Çerçeve Deseni: İç içe geçmiş kare çerçeveyi tamamlayan parça hangisidir?',
    hint: 'Dışta turuncu şerit, içte mavi L köşesi tam sağ alt köşeyi kapatmalı.',
    explanation: 'Sol üstün 180° dönmüş simetriği olan D şıkkı kare çerçeveyi tam kapatır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'chevron_frame' },
    options: [
      { id: 'a', visual: { patternId: 'chevron_frame', piece: 'reversed' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'chevron_frame', piece: 'swapped' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'chevron_frame', piece: 'single_bar' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'chevron_frame', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'ds-14',
    prompt: 'Simetrik Takımyıldız Deseni: Eksik sağ alt köşeye hangi nokta grubu gelmelidir?',
    hint: 'Dış köşede büyük beyaz yıldız/daire, içe doğru 2 küçük pembe nokta çizgiyle bağlı.',
    explanation: 'Merkeze göre simetrik nokta yerleşimi sadece A şıkkında doğru hizalanmıştır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'dot_constellation' },
    options: [
      { id: 'a', visual: { patternId: 'dot_constellation', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { patternId: 'dot_constellation', piece: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'dot_constellation', piece: 'missing_dot' }, isCorrect: false },
      { id: 'd', visual: { patternId: 'dot_constellation', piece: 'wrong_color' }, isCorrect: false },
    ],
  },
  {
    id: 'ds-15',
    prompt: 'Dört Yapraklı Yonca Mozaiği: Deseni tam bir yoncaya dönüştüren parçayı seç!',
    hint: 'Ortadaki kalp/yaprak şekli merkezdeki sarı noktadan dışa açılıyor.',
    explanation: 'Sağ alt yaprağı ve ortadaki sarı çekirdek parçasını tamamlayan tek karo C şıkkıdır.',
    visualType: 'pattern_tile',
    visualData: { patternId: 'clover_petal' },
    options: [
      { id: 'a', visual: { patternId: 'clover_petal', piece: 'reversed' }, isCorrect: false },
      { id: 'b', visual: { patternId: 'clover_petal', piece: 'no_core' }, isCorrect: false },
      { id: 'c', visual: { patternId: 'clover_petal', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { patternId: 'clover_petal', piece: 'wrong_color' }, isCorrect: false },
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
  {
    id: 'sb-11',
    prompt: 'Anahtar Deliği Kesimi: Bloğun üstündeki boşluğu sıfır boşlukla kapatan parça hangisidir?',
    hint: 'Üstten dar bir boğazla inip altta yuvarlak daireye genişleyen çıkıntıyı ara.',
    explanation: 'Boyun genişliği ve alt yuvarlak kilidi birebir oturan tek parça B şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'keyhole_fit' },
    options: [
      { id: 'a', visual: { puzzleId: 'keyhole_fit', piece: 'square_tip' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'keyhole_fit', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { puzzleId: 'keyhole_fit', piece: 'wide_neck' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'keyhole_fit', piece: 'no_knob' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-12',
    prompt: 'Kale Burcu Puzzle: Üstteki 3 dişli kale boşluğunu tamamlayan doğru parça hangisidir?',
    hint: 'İki aşağı inen diş ve ortasında bir çıkıntı olmalıdır.',
    explanation: 'Diş aralıkları ve derinlikleri kale duvarına tam oturan parça A şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'castle_battlement' },
    options: [
      { id: 'a', visual: { puzzleId: 'castle_battlement', piece: 'exact' }, isCorrect: true },
      { id: 'b', visual: { puzzleId: 'castle_battlement', piece: 'one_tooth' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'castle_battlement', piece: 'flat' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'castle_battlement', piece: 'too_deep' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-13',
    prompt: 'Dalgalı Şerit Bulmaca: Alt kenarı S dalgası yapan bu bloğu hangi parça tamamlar?',
    hint: 'Sol tarafı tümsek (yukarı kavis), sağ tarafı çukur (aşağı kavis) olmalıdır.',
    explanation: 'Ters S dalgasına birebir kilitlenen alt parça D şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'wave_ribbon' },
    options: [
      { id: 'a', visual: { puzzleId: 'wave_ribbon', piece: 'reversed' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'wave_ribbon', piece: 'straight' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'wave_ribbon', piece: 'zigzag' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'wave_ribbon', piece: 'exact' }, isCorrect: true },
    ],
  },
  {
    id: 'sb-14',
    prompt: 'Köşe Elmas Kesimi: Büyük kareden kesilmiş eğik köşe parçasını bul!',
    hint: 'Sol alt kenarda içeri girmiş üçgen V dişi ve eğik kesim hattını incele.',
    explanation: 'Üst köşesi dik, kesim kenarında küçük V çıkıntısı olan C şıkkı kareyi tamamlar.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'diamond_corner' },
    options: [
      { id: 'a', visual: { puzzleId: 'diamond_corner', piece: 'flat_edge' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'diamond_corner', piece: 'mirrored' }, isCorrect: false },
      { id: 'c', visual: { puzzleId: 'diamond_corner', piece: 'exact' }, isCorrect: true },
      { id: 'd', visual: { puzzleId: 'diamond_corner', piece: 'inward' }, isCorrect: false },
    ],
  },
  {
    id: 'sb-15',
    prompt: 'Üç Dişli Kilit: Sağ kenarı 3 basamaklı olan bloğu kapatacak doğru puzzle parçası hangisidir?',
    hint: 'Üst, orta ve alt dişin çıkıntı boylarının birbirine eşit ve hizalı olmasına bak.',
    explanation: '3 dişli kilide tam kenetlenen tek parça B şıkkıdır.',
    visualType: 'puzzle_cut',
    visualData: { puzzleId: 'triple_tooth' },
    options: [
      { id: 'a', visual: { puzzleId: 'triple_tooth', piece: 'two_teeth' }, isCorrect: false },
      { id: 'b', visual: { puzzleId: 'triple_tooth', piece: 'exact' }, isCorrect: true },
      { id: 'c', visual: { puzzleId: 'triple_tooth', piece: 'mirrored' }, isCorrect: false },
      { id: 'd', visual: { puzzleId: 'triple_tooth', piece: 'round' }, isCorrect: false },
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
  {
    id: 'sn-11',
    prompt: '2x2 bölünmüş bu pencere çerçevesinde TOPLAM kaç adet Kare vardır? (Büyük kareyi unutma!)',
    hint: '4 küçük pencere karesi ile en dıştaki 1 büyük kareyi birlikte topla.',
    explanation: '4 küçük iç kare + 1 büyük dış kare = toplam 5 kare vardır!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'window_squares_count' },
    options: [
      { id: 'a', label: '4 Kare', isCorrect: false },
      { id: 'b', label: '5 Kare', isCorrect: true },
      { id: 'c', label: '6 Kare', isCorrect: false },
      { id: 'd', label: '8 Kare', isCorrect: false },
    ],
  },
  {
    id: 'sn-12',
    prompt: 'Üstteki Taç çizgisi aşağıdaki karmaşık şekillerden HANGİSİNİN içinde gizlenmiştir?',
    hint: 'Üç sivri tepesi (ortadaki daha yüksek) ve düz alt tabanı olan M benzeri tacı ara.',
    explanation: 'C şıkkındaki çizgi ağında aynı açılara sahip taç figürü birebir saklıdır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_crown' },
    options: [
      { id: 'a', visual: { sceneId: 'crown_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'crown_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'crown_C_match' }, isCorrect: true },
      { id: 'd', visual: { sceneId: 'crown_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-13',
    prompt: 'Üstteki Kum Saati (⧗) şekli hangi ağın içinde gizlenmiştir?',
    hint: 'Üst ve alt yatay kenarları birleştiren tam bir X çaprazı aramalısın.',
    explanation: 'A şıkkındaki ağ içinde tam kapalı kum saati çerçevesi gizlidir!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_hourglass' },
    options: [
      { id: 'a', visual: { sceneId: 'hg_A_match' }, isCorrect: true },
      { id: 'b', visual: { sceneId: 'hg_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'hg_C' }, isCorrect: false },
      { id: 'd', visual: { sceneId: 'hg_D' }, isCorrect: false },
    ],
  },
  {
    id: 'sn-14',
    prompt: 'İç içe geçmiş bu geometrik çizimde toplam kaç adet Altıgen vardır?',
    hint: 'Büyük dış altıgenden en merkezdeki küçük altıgene kadar say.',
    explanation: 'Büyük mor altıgen (1), orta mavi altıgen (1) ve içteki küçük turuncu altıgen (1) = 3 Altıgen!',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'hexagons_overlap_count' },
    options: [
      { id: 'a', label: '2 Altıgen', isCorrect: false },
      { id: 'b', label: '3 Altıgen', isCorrect: true },
      { id: 'c', label: '4 Altıgen', isCorrect: false },
      { id: 'd', label: '5 Altıgen', isCorrect: false },
    ],
  },
  {
    id: 'sn-15',
    prompt: 'Üstteki Şemsiye çizimi aşağıdaki karmaşık ağlardan hangisinde gizlidir?',
    hint: 'Üst yarım daire kubbesi ve aşağı inip sağa kıvrılan baston sapını takip et.',
    explanation: 'D şıkkında yarım kubbe ve sağa kıvrılan kanca sap birebir yer alır.',
    visualType: 'embedded_shape',
    visualData: { sceneId: 'find_embedded_umbrella' },
    options: [
      { id: 'a', visual: { sceneId: 'umb_A' }, isCorrect: false },
      { id: 'b', visual: { sceneId: 'umb_B' }, isCorrect: false },
      { id: 'c', visual: { sceneId: 'umb_C' }, isCorrect: false },
      { id: 'd', visual: { sceneId: 'umb_D_match' }, isCorrect: true },
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
  {
    id: 'gae-11',
    prompt: '6 Arabadan yalnızca BİRİNİN küçük bir detayı farklı. Dikkatle incele!',
    sceneTheme: 'car',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'odd', oddDetail: 'Üstteki tavan lambası yok ve ön farı sarı!' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '2 numaralı arabanın tavan lambası eksik ve ön far rengi diğerlerinden farklı!',
  },
  {
    id: 'gae-12',
    prompt: 'Sevimli Penguenlerden hangisi diğerleriyle aynı değil?',
    sceneTheme: 'penguin',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'odd', oddDetail: 'Boynundaki papyonu mavi yerine kırmızı!' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '5 numaralı penguenin papyonu farklı renkte ve göbek çizgisi eksik!',
  },
  {
    id: 'gae-13',
    prompt: '6 Dondurma Külahından farklı olanı hemen yakala!',
    sceneTheme: 'icecream',
    cards: [
      { id: 'c1', variant: 'odd', oddDetail: 'Üstteki kiraz tanesi eksik!' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '1 numaralı dondurmanın tepesindeki kiraz diğerlerinin aksine yok!',
  },
  {
    id: 'gae-14',
    prompt: '6 Şatodan gizli bir farkı olan şatoyu tıkla!',
    sceneTheme: 'castle_spot',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'odd', oddDetail: 'Orta kapı rengi farklı ve tepe bayrağı sola bakıyor!' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '3 numaralı şatonun bayrağı ters yöne dalgalanıyor ve penceresi eksik!',
  },
  {
    id: 'gae-15',
    prompt: 'Çalışkan Arılardan yalnızca biri diğerlerinden farklı. Hangisi?',
    sceneTheme: 'bee',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'normal', oddDetail: '' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'odd', oddDetail: 'Gövdedeki siyah şeritlerden biri eksik!' },
    ],
    explanation: '6 numaralı arının gövdesinde diğerlerine göre bir siyah çizgi eksik!',
  },
  {
    id: 'gae-16',
    prompt: 'Şampiyonluk Kupalarından farklı olan tek kupayı seç!',
    sceneTheme: 'trophy_spot',
    cards: [
      { id: 'c1', variant: 'normal', oddDetail: '' },
      { id: 'c2', variant: 'normal', oddDetail: '' },
      { id: 'c3', variant: 'normal', oddDetail: '' },
      { id: 'c4', variant: 'odd', oddDetail: 'Ortadaki yıldız rozeti yok ve kaide renkli!' },
      { id: 'c5', variant: 'normal', oddDetail: '' },
      { id: 'c6', variant: 'normal', oddDetail: '' },
    ],
    explanation: '4 numaralı kupanın gövdesindeki yıldız eksik!',
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
  {
    id: 'as-9',
    prompt: 'Sağa eğik roket figürünün DİKEY ayna karşısındaki doğru yansıması hangisidir?',
    hint: 'Sağa doğru uçan roket dikey aynada sola doğru uçar!',
    explanation: 'Dikey eksende yansıdığında roket sola eğilir ve ay-yıldız işareti sağ köşeye geçer (B şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'rocket_tilt', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'rocket_tilt', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'rocket_tilt', transform: 'reflectX' }, isCorrect: true },
      { id: 'c', visual: { figureId: 'rocket_tilt', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'rocket_tilt', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-10',
    prompt: 'Renkli basamakların YATAY ayna altındaki yansıması hangisidir?',
    hint: 'En üstteki bayrak yatay aynada en alta baş aşağı iner.',
    explanation: 'Yatay yansıma üst-alt eksenini tersler; basamakların geniş tabanı üste çıkar (C şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'stairs_dot', axis: 'horizontal' },
    options: [
      { id: 'a', visual: { figureId: 'stairs_dot', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'stairs_dot', transform: 'reflectX' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'stairs_dot', transform: 'reflectY' }, isCorrect: true },
      { id: 'd', visual: { figureId: 'stairs_dot', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-11',
    prompt: 'Asimetrik Anahtarın DİKEY ayna eksenindeki görüntüsü hangisidir?',
    hint: 'Anahtar halkası solda ise yansımada sağa geçer; dişler hala aşağı bakar.',
    explanation: 'Dikey ayna sol-sağ yönünü çevirir ama yukarı-aşağı yönünü değiştirmez (A şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'key_asym', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'key_asym', transform: 'reflectX' }, isCorrect: true },
      { id: 'b', visual: { figureId: 'key_asym', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'key_asym', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'key_asym', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-12',
    prompt: '4x4 Renkli Piksel Tablosunun DİKEY aynadaki yansıması hangisidir?',
    hint: 'Sol üst köşedeki kırmızı kare sağ üst köşeye, sağdaki dikey şerit sola geçer.',
    explanation: 'Her satır yatay olarak ters çevrilir: Doğru 4x4 piksel yansıması D şıkkıdır!',
    visualType: 'mirror_axis',
    visualData: { figureId: 'pixel_4x4', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'pixel_4x4', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'pixel_4x4', transform: 'reflectY' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'pixel_4x4', transform: 'rotate180' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'pixel_4x4', transform: 'reflectX' }, isCorrect: true },
    ],
  },
  {
    id: 'as-13',
    prompt: 'Basamaklı yapının DİKEY aynadaki yansımasını bul!',
    hint: 'Yüksek basamak sağda ise yansımada solda (aynaya yakın) olur!',
    explanation: 'Dikey ayna soldan sağa yükselen merdiveni sağdan sola yükselir hale getirir (B şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'stairs_dot', axis: 'vertical' },
    options: [
      { id: 'a', visual: { figureId: 'stairs_dot', transform: 'same' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'stairs_dot', transform: 'reflectX' }, isCorrect: true },
      { id: 'c', visual: { figureId: 'stairs_dot', transform: 'reflectY' }, isCorrect: false },
      { id: 'd', visual: { figureId: 'stairs_dot', transform: 'rotate180' }, isCorrect: false },
    ],
  },
  {
    id: 'as-14',
    prompt: '4x4 Renkli Piksel Tablosunun YATAY aynadaki yansıması hangisidir?',
    hint: 'Üstteki kırmızı kare sol alt köşeye inmeli; sağ kenardaki yeşil şerit sağda kalmalıdır.',
    explanation: 'Yatay yansımada sütunlar aynı kalır, sadece üst-alt satırlar yer değiştirir (C şıkkı).',
    visualType: 'mirror_axis',
    visualData: { figureId: 'pixel_4x4', axis: 'horizontal' },
    options: [
      { id: 'a', visual: { figureId: 'pixel_4x4', transform: 'reflectX' }, isCorrect: false },
      { id: 'b', visual: { figureId: 'pixel_4x4', transform: 'same' }, isCorrect: false },
      { id: 'c', visual: { figureId: 'pixel_4x4', transform: 'reflectY' }, isCorrect: true },
      { id: 'd', visual: { figureId: 'pixel_4x4', transform: 'rotate180' }, isCorrect: false },
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
  {
    id: 'ka-9',
    prompt: 'Yeni Küp Ağı: Açık küp katlandığında SOLDAKİ Sarı Yıldızın (★) tam karşısında hangi şekil olur?',
    hint: 'Orta yatay sıradaki 3 kare katlandığında sol ve sağ uçlar birbirine bakar.',
    explanation: 'Yatay şeritte Sol Yıldız ile Sağ Kırmızı Üçgen arasında Elmas vardır; yani Yıldızın karşısı Kırmızı Üçgendir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_alt',
      faces: {
        top: { shape: 'circle', color: '#10b981' },
        left: { shape: 'star', color: '#f59e0b' },
        center: { shape: 'diamond', color: '#38bdf8' },
        right: { shape: 'triangle', color: '#f43f5e' },
        bottom: { shape: 'hexagon', color: '#a855f7' },
        tail: { shape: 'square', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'circle', color: '#10b981' }, isCorrect: false },
      { id: 'b', visual: { shape: 'diamond', color: '#38bdf8' }, isCorrect: false },
      { id: 'c', visual: { shape: 'triangle', color: '#f43f5e' }, isCorrect: true },
      { id: 'd', visual: { shape: 'square', color: '#eab308' }, isCorrect: false },
    ],
  },
  {
    id: 'ka-10',
    prompt: 'Geniş Üstten Görünüm: 3 sütunlu küp yapısına TAM TEPEDEN bakıldığında kat sayıları nasıl görünür?',
    hint: 'Arka sırada soldan sağa 3, 2, 1; ön sırada ise 1, 0, 2 katlı kuleler var.',
    explanation: 'Üst satır [3, 2, 1] ve alt satır [1, 0, 2] yerleşimini veren C şıkkıdır!',
    visualType: 'cubes3d',
    visualData: { heights: [[3, 2, 1], [1, 0, 2]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[1, 2, 3], [2, 0, 1]] }, isCorrect: false },
      { id: 'b', visual: { grid: [[1, 0, 2], [3, 2, 1]] }, isCorrect: false },
      { id: 'c', visual: { grid: [[3, 2, 1], [1, 0, 2]] }, isCorrect: true },
      { id: 'd', visual: { grid: [[3, 1, 1], [2, 0, 2]] }, isCorrect: false },
    ],
  },
  {
    id: 'ka-11',
    prompt: 'Bu açık küp katlandığında aşağıdaki 3B küplerden HANGİSİ OLUŞABİLİR?',
    hint: 'Karşılıklı çiftler (Daire-Altıgen, Yıldız-Üçgen, Elmas-Kare) aynı küpte yan yana gelemez!',
    explanation: 'Komşu yüzler olan [Yeşil Daire, Mavi Elmas, Kırmızı Üçgen] sadece A şıkkında doğru birleşebilir!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_alt',
      faces: {
        top: { shape: 'circle', color: '#10b981' },
        left: { shape: 'star', color: '#f59e0b' },
        center: { shape: 'diamond', color: '#38bdf8' },
        right: { shape: 'triangle', color: '#f43f5e' },
        bottom: { shape: 'hexagon', color: '#a855f7' },
        tail: { shape: 'square', color: '#eab308' },
      },
    },
    options: [
      {
        id: 'a',
        visual: {
          cubeFaces: {
            top: { shape: 'circle', color: '#10b981' },
            left: { shape: 'diamond', color: '#38bdf8' },
            right: { shape: 'triangle', color: '#f43f5e' },
          },
        },
        isCorrect: true,
      },
      {
        id: 'b',
        visual: {
          cubeFaces: {
            top: { shape: 'circle', color: '#10b981' },
            left: { shape: 'hexagon', color: '#a855f7' },
            right: { shape: 'diamond', color: '#38bdf8' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'c',
        visual: {
          cubeFaces: {
            top: { shape: 'star', color: '#f59e0b' },
            left: { shape: 'triangle', color: '#f43f5e' },
            right: { shape: 'square', color: '#eab308' },
          },
        },
        isCorrect: false,
      },
      {
        id: 'd',
        visual: {
          cubeFaces: {
            top: { shape: 'diamond', color: '#38bdf8' },
            left: { shape: 'square', color: '#eab308' },
            right: { shape: 'hexagon', color: '#a855f7' },
          },
        },
        isCorrect: false,
      },
    ],
  },
  {
    id: 'ka-12',
    prompt: 'Üstten Görünüm: Sağdaki 2x2 kulenin tepeden görünüm planı hangisidir?',
    hint: 'Sol arka köşe 4 katlı, sağ ön köşe ise 3 katlı yüksek kulelerdir.',
    explanation: 'Üst satır [4, 1], alt satır [2, 3] değerlerini veren D şıkkıdır.',
    visualType: 'cubes3d',
    visualData: { heights: [[4, 1], [2, 3]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[4, 2], [1, 3]] }, isCorrect: false },
      { id: 'b', visual: { grid: [[1, 4], [3, 2]] }, isCorrect: false },
      { id: 'c', visual: { grid: [[2, 3], [4, 1]] }, isCorrect: false },
      { id: 'd', visual: { grid: [[4, 1], [2, 3]] }, isCorrect: true },
    ],
  },
  {
    id: 'ka-13',
    prompt: 'En alttaki Sarı Karenin (■) tam karşısındaki yüz hangi şekildir?',
    hint: 'Dikey 4’lü sütunun ortasındaki Mavi Elmasa dikkat et (arada 1 yüz var).',
    explanation: 'Merkezdeki Mavi Elmas ile en alttaki Sarı Kare arasında Mor Altıgen olduğu için bu ikisi karşılıklıdır!',
    visualType: 'cube_net',
    visualData: {
      netId: 'cross_alt',
      faces: {
        top: { shape: 'circle', color: '#10b981' },
        left: { shape: 'star', color: '#f59e0b' },
        center: { shape: 'diamond', color: '#38bdf8' },
        right: { shape: 'triangle', color: '#f43f5e' },
        bottom: { shape: 'hexagon', color: '#a855f7' },
        tail: { shape: 'square', color: '#eab308' },
      },
    },
    options: [
      { id: 'a', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: false },
      { id: 'b', visual: { shape: 'diamond', color: '#38bdf8' }, isCorrect: true },
      { id: 'c', visual: { shape: 'circle', color: '#10b981' }, isCorrect: false },
      { id: 'd', visual: { shape: 'star', color: '#f59e0b' }, isCorrect: false },
    ],
  },
  {
    id: 'ka-14',
    prompt: '3 Sütunlu Üstten Görünüm: Bu merdivenli küp bloklarının üstten haritası hangisidir?',
    hint: 'Arka sırada ortadaki kule 4 katlı; ön sağ köşede ise hiç küp (0) yok.',
    explanation: 'Üst satır [2, 4, 2] ve alt satır [1, 3, 0] ile eşleşen B şıkkıdır!',
    visualType: 'cubes3d',
    visualData: { heights: [[2, 4, 2], [1, 3, 0]], optionMode: 'top_view' },
    options: [
      { id: 'a', visual: { grid: [[2, 4, 2], [0, 3, 1]] }, isCorrect: false },
      { id: 'b', visual: { grid: [[2, 4, 2], [1, 3, 0]] }, isCorrect: true },
      { id: 'c', visual: { grid: [[1, 3, 0], [2, 4, 2]] }, isCorrect: false },
      { id: 'd', visual: { grid: [[2, 3, 2], [1, 4, 0]] }, isCorrect: false },
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
  {
    id: 'od-9',
    prompt: 'Azalan Sayı Örüntüsü: Her adımda sayı kaçar kaçar azalıyor? "?" nedir?',
    hint: '35 - 31 = 4, 31 - 27 = 4... Aynı miktarı çıkar!',
    explanation: 'Sayılar her adımda 4 azalıyor: 23 - 4 = 19!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '35', color: '#f43f5e' },
        { kind: 'number', text: '31', color: '#f43f5e' },
        { kind: 'number', text: '27', color: '#f43f5e' },
        { kind: 'number', text: '23', color: '#f43f5e' },
        { kind: 'question', text: '?', color: '#38bdf8' },
      ],
    },
    options: [
      { id: 'a', label: '17', isCorrect: false },
      { id: 'b', label: '18', isCorrect: false },
      { id: 'c', label: '19', isCorrect: true },
      { id: 'd', label: '20', isCorrect: false },
    ],
  },
  {
    id: 'od-10',
    prompt: 'İkili Kural Örüntüsü: Renk ve daire sayısı sırasını izle! "?" yerine ne gelir?',
    hint: 'Adet 1 → 2 → 3 → 1 → 2 diye giderken renkler Mavi-Yeşil dönüşümlü değişiyor.',
    explanation: 'Adet 3 ve renk Yeşil olmalı: 3 adet Yeşil Daire (B şıkkı)!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'shape', cell: { shape: 'circle', color: '#38bdf8', count: 1 } },
        { kind: 'shape', cell: { shape: 'circle', color: '#10b981', count: 2 } },
        { kind: 'shape', cell: { shape: 'circle', color: '#38bdf8', count: 3 } },
        { kind: 'shape', cell: { shape: 'circle', color: '#10b981', count: 1 } },
        { kind: 'shape', cell: { shape: 'circle', color: '#38bdf8', count: 2 } },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'circle', color: '#38bdf8', count: 3 }, isCorrect: false },
      { id: 'b', visual: { shape: 'circle', color: '#10b981', count: 3 }, isCorrect: true },
      { id: 'c', visual: { shape: 'circle', color: '#10b981', count: 1 }, isCorrect: false },
      { id: 'd', visual: { shape: 'circle', color: '#f59e0b', count: 3 }, isCorrect: false },
    ],
  },
  {
    id: 'od-11',
    prompt: 'İleri Düzey Örüntü: Her sayı bir öncekinin 2 katının 1 fazlası! "?" kaçtır?',
    hint: '2→5 (2×2+1), 5→11 (5×2+1), 11→23 (11×2+1)... Şimdi 23 × 2 + 1 = ?',
    explanation: '23 × 2 = 46 ve 46 + 1 = 47 elde edilir!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '2', color: '#0284c7' },
        { kind: 'number', text: '5', color: '#0284c7' },
        { kind: 'number', text: '11', color: '#0284c7' },
        { kind: 'number', text: '23', color: '#0284c7' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '35', isCorrect: false },
      { id: 'b', label: '45', isCorrect: false },
      { id: 'c', label: '47', isCorrect: true },
      { id: 'd', label: '48', isCorrect: false },
    ],
  },
  {
    id: 'od-12',
    prompt: 'Mantıksal Sınıflama: Verilen taşıtlardan hangisi diğerlerinden FARKLI bir ulaşım grubundadır?',
    hint: 'Üç tanesi kara yolu/raylı kara taşıtı, biri deniz taşıtıdır.',
    explanation: 'Araba, Otobüs ve Tren karada giderken Yelkenli bir deniz taşıtıdır!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'badge', text: '🚗 Araba', color: '#ef4444' },
        { kind: 'badge', text: '🚌 Otobüs', color: '#f59e0b' },
        { kind: 'badge', text: '🚂 Tren', color: '#3b82f6' },
        { kind: 'badge', text: '⛵ Yelkenli', color: '#06b6d4' },
      ],
    },
    options: [
      { id: 'a', label: '🚗 Araba', isCorrect: false },
      { id: 'b', label: '🚌 Otobüs', isCorrect: false },
      { id: 'c', label: '🚂 Tren', isCorrect: false },
      { id: 'd', label: '⛵ Yelkenli', isCorrect: true },
    ],
  },
  {
    id: 'od-13',
    prompt: 'Üçgensel Sayı Örüntüsü: Artış miktarı her adımda 1 büyüyor! "?" kaç olmalıdır?',
    hint: '+3, +4, +5, +6... Bir sonraki artış +7 olacak!',
    explanation: '21 + 7 = 28 olarak örüntü devam eder!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '3', color: '#10b981' },
        { kind: 'number', text: '6', color: '#10b981' },
        { kind: 'number', text: '10', color: '#10b981' },
        { kind: 'number', text: '15', color: '#10b981' },
        { kind: 'number', text: '21', color: '#10b981' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '26', isCorrect: false },
      { id: 'b', label: '27', isCorrect: false },
      { id: 'c', label: '28', isCorrect: true },
      { id: 'd', label: '29', isCorrect: false },
    ],
  },
  {
    id: 'od-14',
    prompt: 'Çiftli Şekil & İç Nokta Dizisi: İkişerli grupları incele ve "?" yerine doğru şekli koy!',
    hint: 'Her şekil önce boş sonra içi noktalı olarak çift geliyor: Elmas-Elmas, Üçgen-Üçgen, Yıldız-?',
    explanation: 'Yıldız çiftinin ikinci parçası noktalı Mor Yıldız (C şıkkı) olmalıdır!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'shape', cell: { shape: 'diamond', color: '#38bdf8', innerDot: false } },
        { kind: 'shape', cell: { shape: 'diamond', color: '#38bdf8', innerDot: true } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#10b981', innerDot: false } },
        { kind: 'shape', cell: { shape: 'triangle', color: '#10b981', innerDot: true } },
        { kind: 'shape', cell: { shape: 'star', color: '#a855f7', innerDot: false } },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'star', color: '#a855f7', innerDot: false }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#38bdf8', innerDot: true }, isCorrect: false },
      { id: 'c', visual: { shape: 'star', color: '#a855f7', innerDot: true }, isCorrect: true },
      { id: 'd', visual: { shape: 'diamond', color: '#a855f7', innerDot: true }, isCorrect: false },
    ],
  },
  {
    id: 'od-15',
    prompt: 'Ayna Sayı Şifresi: Sayı çiftlerinin yer değişim kuralını bul ve "?" yerine geleni seç!',
    hint: '12 → 21, 34 → 43, 56 → ... Rakamların yeri ters çevriliyor!',
    explanation: '56 sayısının rakamları yer değiştirdiğinde 65 elde edilir!',
    visualType: 'sequence_row',
    visualData: {
      items: [
        { kind: 'number', text: '12', color: '#a855f7' },
        { kind: 'number', text: '21', color: '#38bdf8' },
        { kind: 'number', text: '34', color: '#a855f7' },
        { kind: 'number', text: '43', color: '#38bdf8' },
        { kind: 'number', text: '56', color: '#a855f7' },
        { kind: 'question', text: '?', color: '#f59e0b' },
      ],
    },
    options: [
      { id: 'a', label: '57', isCorrect: false },
      { id: 'b', label: '65', isCorrect: true },
      { id: 'c', label: '66', isCorrect: false },
      { id: 'd', label: '75', isCorrect: false },
    ],
  },
];

// ----------------------------------------------------------------------------
// 13. KAĞIT KATLAMA VE DELİK AÇMA ETKİNLİKLERİ (12 Görev)
// ----------------------------------------------------------------------------
export const KAGIT_KATLAMA_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'kk-1',
    prompt: 'Sağdan sola ikiye katlanıp tam ortadan delinen kare kağıt açıldığında nasıl görünür?',
    hint: 'Kat çizgisi ortadan dikey geçiyor; delik sağ tarafa da simetrik açılır.',
    explanation: 'Yatay orta hizada sağda ve solda olmak üzere 2 yuvarlak delik oluşur (B şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'half_v',
      holes: [{ x: 25, y: 50, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 50, y: 25 }, { x: 50, y: 75 }], foldLine: 'v' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 25, y: 50 }, { x: 75, y: 50 }], foldLine: 'v' }, isCorrect: true },
      { id: 'c', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 75 }], foldLine: 'v' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 25, y: 50 }], foldLine: 'v' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-2',
    prompt: 'Alttan yukarı doğru ikiye katlanıp tam ortadan delinen kare kağıt açıldığında nasıl görünür?',
    hint: 'Kat çizgisi yataydır; üst yarıdaki delik alt yarıya simetrik kopyalanır.',
    explanation: 'Dikey orta hizada üstte ve altta 2 simetrik delik açılır (A şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'half_h',
      holes: [{ x: 50, y: 25, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 50, y: 25 }, { x: 50, y: 75 }], foldLine: 'h' }, isCorrect: true },
      { id: 'b', visual: { holes: [{ x: 25, y: 50 }, { x: 75, y: 50 }], foldLine: 'h' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }], foldLine: 'h' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 50, y: 50 }], foldLine: 'h' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-3',
    prompt: 'Dikey ortadan katlanan sol yarıya üst ve alt 2 delik açılıyor. Kağıt açıldığında toplam kaç delik ve nerede olur?',
    hint: 'Sol kenara yakın 2 delik varsa, sağ kenara yakın da 2 simetrik delik olur!',
    explanation: 'Sol kenarda 2, sağ kenarda 2 olmak üzere toplam 4 delik oluşur (C şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'half_v',
      holes: [
        { x: 20, y: 25, shape: 'circle' },
        { x: 20, y: 75, shape: 'circle' },
      ],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 20, y: 25 }, { x: 80, y: 25 }], foldLine: 'v' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 38, y: 25 }, { x: 62, y: 25 }, { x: 38, y: 75 }, { x: 62, y: 75 }], foldLine: 'v' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 20, y: 25 }, { x: 80, y: 25 }, { x: 20, y: 75 }, { x: 80, y: 75 }], foldLine: 'v' }, isCorrect: true },
      { id: 'd', visual: { holes: [{ x: 20, y: 25 }, { x: 80, y: 75 }], foldLine: 'v' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-4',
    prompt: 'Dörde katlanmış kare kağıdın ortasından 1 yuvarlak delik açılıyor. Tamamen açıldığında nasıl görünür?',
    hint: '4 kat üst üste delindiği için her çeyrek karede ortada 1’er delik belirir.',
    explanation: '4 çeyreğin her birinde birer daire simetrik bir kare oluşturur (D şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 25, y: 25, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 50, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 50, y: 75 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 75 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }], foldLine: 'vh' }, isCorrect: true },
    ],
  },
  {
    id: 'kk-5',
    prompt: 'Dörde katlı kağıdın en dış köşesine yakın 1 ELMAS delik açılıyor. Açılınca hangisi olur?',
    hint: 'Delik katlı karenin en dış köşesinde olduğu için tüm kağıdın 4 dış köşesinde yer alır!',
    explanation: 'Merkeze değil, en dış 4 köşeye yakın elmas delikler oluşur (A şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 18, y: 18, shape: 'diamond' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 18, y: 18, shape: 'diamond' }, { x: 82, y: 18, shape: 'diamond' }, { x: 18, y: 82, shape: 'diamond' }, { x: 82, y: 82, shape: 'diamond' }], foldLine: 'vh' }, isCorrect: true },
      { id: 'b', visual: { holes: [{ x: 40, y: 40, shape: 'diamond' }, { x: 60, y: 40, shape: 'diamond' }, { x: 40, y: 60, shape: 'diamond' }, { x: 60, y: 60, shape: 'diamond' }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 18, y: 18, shape: 'diamond' }, { x: 82, y: 82, shape: 'diamond' }], foldLine: 'vh' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 50, y: 18, shape: 'diamond' }, { x: 50, y: 82, shape: 'diamond' }], foldLine: 'vh' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-6',
    prompt: 'Dörde katlanmış kağıtta merkeze çok yakın köşeye 1 delik açılırsa açıldığında nasıl görünür?',
    hint: 'Delik kat yerlerinin kesişimine (tam ortaya) yakın açılmış!',
    explanation: 'Açıldığında 4 delik de kağıdın tam merkezinde küçük bir dörtlü küme oluşturur (C şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 40, y: 40, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 18, y: 18 }, { x: 82, y: 18 }, { x: 18, y: 82 }, { x: 82, y: 82 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 40, y: 20 }, { x: 60, y: 20 }, { x: 40, y: 80 }, { x: 60, y: 80 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 40, y: 40 }, { x: 60, y: 40 }, { x: 40, y: 60 }, { x: 60, y: 60 }], foldLine: 'vh' }, isCorrect: true },
      { id: 'd', visual: { holes: [{ x: 25, y: 50 }, { x: 75, y: 50 }], foldLine: 'vh' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-7',
    prompt: 'Yatay ikiye katlı kağıdın soluna ELMAS, sağına DAİRE delik açılıyor. Kağıt açılırsa nasıl olur?',
    hint: 'Sol sütunda üstte-altta Elmaslar, sağ sütunda üstte-altta Daireler yer alır.',
    explanation: 'Yatay kat izi boyunca yukarıdan aşağı simetri oluşur: Solda 2 Elmas, sağda 2 Daire (B şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'half_h',
      holes: [
        { x: 25, y: 25, shape: 'diamond' },
        { x: 75, y: 25, shape: 'circle' },
      ],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 25, y: 25, shape: 'diamond' }, { x: 75, y: 25, shape: 'circle' }, { x: 25, y: 75, shape: 'circle' }, { x: 75, y: 75, shape: 'diamond' }], foldLine: 'h' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 25, y: 25, shape: 'diamond' }, { x: 75, y: 25, shape: 'circle' }, { x: 25, y: 75, shape: 'diamond' }, { x: 75, y: 75, shape: 'circle' }], foldLine: 'h' }, isCorrect: true },
      { id: 'c', visual: { holes: [{ x: 25, y: 25, shape: 'circle' }, { x: 75, y: 25, shape: 'circle' }, { x: 25, y: 75, shape: 'diamond' }, { x: 75, y: 75, shape: 'diamond' }], foldLine: 'h' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 25, y: 25, shape: 'diamond' }, { x: 75, y: 75, shape: 'circle' }], foldLine: 'h' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-8',
    prompt: 'Dörde katlı kağıtta yatay çizgiye yakın dış kenardan delik açılıyor. Açıldığında hangisi olur?',
    hint: 'Delikler yan kenarların ortasına yakın ikişerli grup oluşturur.',
    explanation: 'Sol ve sağ kenarların orta bölgesinde ikişer adet delik belirir (A şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 20, y: 40, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 20, y: 40 }, { x: 80, y: 40 }, { x: 20, y: 60 }, { x: 80, y: 60 }], foldLine: 'vh' }, isCorrect: true },
      { id: 'b', visual: { holes: [{ x: 40, y: 20 }, { x: 60, y: 20 }, { x: 40, y: 80 }, { x: 60, y: 80 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 20, y: 80 }, { x: 80, y: 80 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 20, y: 50 }, { x: 80, y: 50 }], foldLine: 'vh' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-9',
    prompt: 'Dörde katlı kağıdın üst kenarına ve dikey orta çizgiye yakın delik açılırsa sonuç hangisidir?',
    hint: 'Üst kenarda yan yana 2, alt kenarda yan yana 2 delik oluşmalı.',
    explanation: 'Üst ve alt kenarların ortasına yakın dikey simetrik 4 delik oluşur (C şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [{ x: 38, y: 20, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 20, y: 38 }, { x: 80, y: 38 }, { x: 20, y: 62 }, { x: 80, y: 62 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 20, y: 80 }, { x: 80, y: 80 }], foldLine: 'vh' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 38, y: 20 }, { x: 62, y: 20 }, { x: 38, y: 80 }, { x: 62, y: 80 }], foldLine: 'vh' }, isCorrect: true },
      { id: 'd', visual: { holes: [{ x: 38, y: 38 }, { x: 62, y: 38 }, { x: 38, y: 62 }, { x: 62, y: 62 }], foldLine: 'vh' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-10',
    prompt: 'Çapraz Katlama: Köşegen boyunca üçgen katlanıp sağ üst bölgeden deliniyor. Açılınca ne olur?',
    hint: 'Çapraz aynalama yap! Sağ üst köşedeki delik açıldığında sol alt köşeye yansır.',
    explanation: 'Köşegen boyunca açıldığında sağ üstteki ve sol alttaki karşılıklı köşelerde delik bulunur (D şıkkı).',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'diag_tr',
      holes: [{ x: 75, y: 25, shape: 'circle' }],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 25 }], foldLine: 'diag' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 75, y: 25 }, { x: 75, y: 75 }], foldLine: 'diag' }, isCorrect: false },
      { id: 'c', visual: { holes: [{ x: 25, y: 25 }, { x: 75, y: 75 }], foldLine: 'diag' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 75, y: 25 }, { x: 25, y: 75 }], foldLine: 'diag' }, isCorrect: true },
    ],
  },
  {
    id: 'kk-11',
    prompt: 'İleri Çapraz Katlama: Üçgende 1 ELMAS ve 1 DAİRE delik açılırsa açıldığında nasıl görünür?',
    hint: 'Köşegen eksenine göre iki şekil de karşı yarıya simetrik kopyalanır.',
    explanation: 'Üstteki Elmas sol kenara, sağdaki Daire alt kenara yansır: Toplam 4 delik (B şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'diag_tr',
      holes: [
        { x: 65, y: 20, shape: 'diamond' },
        { x: 80, y: 45, shape: 'circle' },
      ],
    },
    options: [
      { id: 'a', visual: { holes: [{ x: 65, y: 20, shape: 'diamond' }, { x: 35, y: 20, shape: 'diamond' }, { x: 80, y: 45 }, { x: 20, y: 45 }], foldLine: 'diag' }, isCorrect: false },
      { id: 'b', visual: { holes: [{ x: 65, y: 20, shape: 'diamond' }, { x: 20, y: 65, shape: 'diamond' }, { x: 80, y: 45 }, { x: 45, y: 80 }], foldLine: 'diag' }, isCorrect: true },
      { id: 'c', visual: { holes: [{ x: 65, y: 20, shape: 'diamond' }, { x: 65, y: 80, shape: 'diamond' }, { x: 80, y: 45 }, { x: 80, y: 55 }], foldLine: 'diag' }, isCorrect: false },
      { id: 'd', visual: { holes: [{ x: 65, y: 20, shape: 'diamond' }, { x: 80, y: 45 }], foldLine: 'diag' }, isCorrect: false },
    ],
  },
  {
    id: 'kk-12',
    prompt: 'Çift Şekilli Dörde Katlama: Dış köşede DAİRE, iç merkezde ELMAS delik açılıyor! Açılınca sonuç nedir?',
    hint: 'Dışta 4 daire köşelerde, içte 4 elmas ise merkezde toplanır!',
    explanation: 'Toplam 8 delik oluşur: 4 köşede Daireler ve tam ortada 4 Elmas kümesi (A şıkkı)!',
    visualType: 'paper_fold',
    visualData: {
      foldType: 'quarter',
      holes: [
        { x: 18, y: 20, shape: 'circle' },
        { x: 38, y: 38, shape: 'diamond' },
      ],
    },
    options: [
      {
        id: 'a',
        visual: {
          holes: [
            { x: 18, y: 20 }, { x: 82, y: 20 }, { x: 18, y: 80 }, { x: 82, y: 80 },
            { x: 38, y: 38, shape: 'diamond' }, { x: 62, y: 38, shape: 'diamond' }, { x: 38, y: 62, shape: 'diamond' }, { x: 62, y: 62, shape: 'diamond' },
          ],
          foldLine: 'vh',
        },
        isCorrect: true,
      },
      {
        id: 'b',
        visual: {
          holes: [
            { x: 18, y: 20, shape: 'diamond' }, { x: 82, y: 20, shape: 'diamond' }, { x: 18, y: 80, shape: 'diamond' }, { x: 82, y: 80, shape: 'diamond' },
            { x: 38, y: 38 }, { x: 62, y: 38 }, { x: 38, y: 62 }, { x: 62, y: 62 },
          ],
          foldLine: 'vh',
        },
        isCorrect: false,
      },
      {
        id: 'c',
        visual: {
          holes: [
            { x: 18, y: 20 }, { x: 82, y: 20 }, { x: 18, y: 80 }, { x: 82, y: 80 },
          ],
          foldLine: 'vh',
        },
        isCorrect: false,
      },
      {
        id: 'd',
        visual: {
          holes: [
            { x: 18, y: 20 }, { x: 82, y: 80 },
            { x: 38, y: 38, shape: 'diamond' }, { x: 62, y: 62, shape: 'diamond' },
          ],
          foldLine: 'vh',
        },
        isCorrect: false,
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// 14. YÖN TAKİBİ, KODLAMA & GÖRSEL MANTIK ETKİNLİKLERİ (14 Görev)
// ----------------------------------------------------------------------------
export const YON_ALGORITMA_QUESTIONS: QuizVisualQuestion[] = [
  {
    id: 'ya-1',
    prompt: 'Başlangıç noktasından 1 Sağa ve 1 Aşağı ilerlersen hangi şeklin üstüne gelirsin?',
    hint: '1 adım sağa ve 1 adım aşağı gittiğinde tam çapraz komşu kareye varırsın.',
    explanation: 'Sol üstten 1 sağa, 1 aşağı gidildiğinde Mavi Yıldız karesine ulaşılır!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [0, 0],
      showCoords: false,
      targets: [
        { row: 0, col: 2, shape: 'circle', color: '#f59e0b' },
        { row: 1, col: 1, shape: 'star', color: '#38bdf8' },
        { row: 2, col: 1, shape: 'triangle', color: '#10b981' },
        { row: 1, col: 2, shape: 'square', color: '#f43f5e' },
      ],
      moves: [
        { dir: 'R', steps: 1 },
        { dir: 'D', steps: 1 },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'circle', color: '#f59e0b' }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#38bdf8' }, isCorrect: true },
      { id: 'c', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
      { id: 'd', visual: { shape: 'square', color: '#f43f5e' }, isCorrect: false },
    ],
  },
  {
    id: 'ya-2',
    prompt: 'Sol alttaki başlangıçtan 2 Sağa ve 2 Yukarı gidersen hangi şekle ulaşırsın?',
    hint: 'Alt satırdan 2 sağa git, sonra 2 basamak yukarı çık.',
    explanation: 'Sol alttan 2 sağa ve 2 yukarı çıkınca Turuncu Kare üzerine varılır (C şıkkı)!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [3, 0],
      showCoords: false,
      targets: [
        { row: 1, col: 1, shape: 'circle', color: '#38bdf8' },
        { row: 2, col: 2, shape: 'triangle', color: '#10b981' },
        { row: 1, col: 2, shape: 'square', color: '#f59e0b' },
        { row: 0, col: 2, shape: 'hexagon', color: '#a855f7' },
      ],
      moves: [
        { dir: 'R', steps: 2 },
        { dir: 'U', steps: 2 },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'circle', color: '#38bdf8' }, isCorrect: false },
      { id: 'b', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
      { id: 'c', visual: { shape: 'square', color: '#f59e0b' }, isCorrect: true },
      { id: 'd', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: false },
    ],
  },
  {
    id: 'ya-3',
    prompt: 'Şekil Birleştirme (+): Üstteki iki 3x3 deseni bir araya getirirsek hangisi oluşur?',
    hint: 'İlk desendeki 3 nokta ile ikinci desendeki 3 nokta hiç çakışmadan tamamlanıyor (toplam 6 nokta).',
    explanation: 'Üst köşeler ve yan kenar noktaları birleşince D şıkkındaki 6 noktalı desen oluşur!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'union',
      ruleSymbol: '+',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#0284c7' }, { idx: 1, color: '#0284c7' }, { idx: 3, color: '#0284c7' }],
      gridB: [{ idx: 5, color: '#0284c7' }, { idx: 7, color: '#0284c7' }, { idx: 8, color: '#0284c7' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 6, color: '#0284c7' }, { idx: 8, color: '#0284c7' }] }, isCorrect: false },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 1, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 6, color: '#0284c7' }, { idx: 7, color: '#0284c7' }, { idx: 8, color: '#0284c7' }] }, isCorrect: false },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 1, color: '#0284c7' }, { idx: 3, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 5, color: '#0284c7' }, { idx: '7', color: '#0284c7' }].map(c => ({ ...c, idx: Number(c.idx) })) }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 1, color: '#0284c7' }, { idx: 3, color: '#0284c7' }, { idx: 5, color: '#0284c7' }, { idx: 7, color: '#0284c7' }, { idx: 8, color: '#0284c7' }] }, isCorrect: true },
    ],
  },
  {
    id: 'ya-4',
    prompt: 'Koordinat Algoritması: A1 karesinden yola çıkıp okları izle! Hangi karede durursun?',
    hint: '3 sağa D1 yapar, 2 aşağı D3 yapar, 1 sola C3 yapar!',
    explanation: 'A1 → D1 → D3 → C3 adım sırasıyla varış noktası C3 karesidir!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [0, 0],
      showCoords: true,
      moves: [
        { dir: 'R', steps: 3 },
        { dir: 'D', steps: 2 },
        { dir: 'L', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'B3', isCorrect: false },
      { id: 'b', label: 'C3', isCorrect: true },
      { id: 'c', label: 'C4', isCorrect: false },
      { id: 'd', label: 'D3', isCorrect: false },
    ],
  },
  {
    id: 'ya-5',
    prompt: 'Birleştirme (+): Dikey çizgi ve yatay çizgi birleştiğinde hangi sembol oluşur?',
    hint: 'Orta sütundaki 3 kare ile orta satırdaki 3 kare üst üste biner.',
    explanation: 'Dikey ve yatay şeridin birleşimi tam bir ARTI (+) işareti oluşturur (A şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'union',
      ruleSymbol: '+',
      gridSize: 3,
      gridA: [{ idx: 1, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 7, color: '#10b981' }],
      gridB: [{ idx: 3, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 5, color: '#10b981' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 1, color: '#10b981' }, { idx: 3, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 5, color: '#10b981' }, { idx: 7, color: '#10b981' }] }, isCorrect: true },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 6, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: false },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 4, color: '#10b981' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 1, color: '#10b981' }, { idx: 3, color: '#10b981' }, { idx: 5, color: '#10b981' }, { idx: 7, color: '#10b981' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ya-6',
    prompt: 'D2 karesinden başlayarak yön kodlarını uygula! Bitiş karesi hangisidir?',
    hint: 'D2 → 2 sola B2 → 2 aşağı B4 → 1 sağa C4!',
    explanation: 'Verilen 3 komutu sırayla uyguladığımızda C4 karesine ulaşırız.',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [1, 3],
      showCoords: true,
      moves: [
        { dir: 'L', steps: 2 },
        { dir: 'D', steps: 2 },
        { dir: 'R', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'B4', isCorrect: false },
      { id: 'b', label: 'C3', isCorrect: false },
      { id: 'c', label: 'C4', isCorrect: true },
      { id: 'd', label: 'D4', isCorrect: false },
    ],
  },
  {
    id: 'ya-7',
    prompt: 'Ortakları Bulma (∩): İki tabloda DAİMA AYNI YERDE bulunan (kesişim) noktalar hangisidir?',
    hint: 'İlk tabloda çarpı (X), ikinci tabloda artı (+) var. Sadece ikisinde ortak olan nokta hangisi?',
    explanation: 'Hem X hem + şeklinin kesiştiği tek ortak nokta tam merkezdir (B şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'intersect',
      ruleSymbol: '∩',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#a855f7' }, { idx: 2, color: '#a855f7' }, { idx: 4, color: '#a855f7' }, { idx: 6, color: '#a855f7' }, { idx: 8, color: '#a855f7' }],
      gridB: [{ idx: 1, color: '#a855f7' }, { idx: 3, color: '#a855f7' }, { idx: 4, color: '#a855f7' }, { idx: 5, color: '#a855f7' }, { idx: 7, color: '#a855f7' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 0, color: '#a855f7' }, { idx: 2, color: '#a855f7' }, { idx: 6, color: '#a855f7' }, { idx: 8, color: '#a855f7' }] }, isCorrect: false },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 4, color: '#a855f7' }] }, isCorrect: true },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 1, color: '#a855f7' }, { idx: 3, color: '#a855f7' }, { idx: 5, color: '#a855f7' }, { idx: 7, color: '#a855f7' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 1, color: '#a855f7' }, { idx: 4, color: '#a855f7' }, { idx: 7, color: '#a855f7' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ya-8',
    prompt: 'Robotu Hedefe Götür: 3 Sola, 2 Yukarı ve 2 Sağa gidersen hangi şekle varırsın?',
    hint: 'Başlangıçtan önce en sol sütuna gel, en üste çık ve 2 adım sağa dön!',
    explanation: '3 sola → 2 yukarı → 2 sağa yolu seni en üst satırdaki Mor Altıgene ulaştırır (D şıkkı)!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [2, 3],
      showCoords: false,
      targets: [
        { row: 0, col: 0, shape: 'circle', color: '#f43f5e' },
        { row: 0, col: 2, shape: 'hexagon', color: '#a855f7' },
        { row: 1, col: 2, shape: 'star', color: '#f59e0b' },
        { row: 2, col: 0, shape: 'triangle', color: '#10b981' },
      ],
      moves: [
        { dir: 'L', steps: 3 },
        { dir: 'U', steps: 2 },
        { dir: 'R', steps: 2 },
      ],
    },
    options: [
      { id: 'a', visual: { shape: 'circle', color: '#f43f5e' }, isCorrect: false },
      { id: 'b', visual: { shape: 'star', color: '#f59e0b' }, isCorrect: false },
      { id: 'c', visual: { shape: 'triangle', color: '#10b981' }, isCorrect: false },
      { id: 'd', visual: { shape: 'hexagon', color: '#a855f7' }, isCorrect: true },
    ],
  },
  {
    id: 'ya-9',
    prompt: 'Çakıştırma Kuralı (⊕): İki tabloda AYNI karede olan noktalar birbirini SİLER! Hangisi kalır?',
    hint: 'Üst orta ve merkez her iki tabloda da olduğu için silinir.',
    explanation: 'Kesişen 2 nokta silinince sadece 4 dış köşedeki noktalar kalır (C şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'xor',
      ruleSymbol: '⊕',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#0284c7' }, { idx: 1, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 8, color: '#0284c7' }],
      gridB: [{ idx: 1, color: '#f59e0b' }, { idx: 2, color: '#f59e0b' }, { idx: 4, color: '#f59e0b' }, { idx: 6, color: '#f59e0b' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 1, color: '#10b981' }, { idx: 4, color: '#10b981' }] }, isCorrect: false },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 6, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: false },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 6, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: true },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 1, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 6, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ya-10',
    prompt: '4 Adımlı Rota: B3 karesinden başlayıp yönleri izle! Varış koordinatı nedir?',
    hint: 'B3 → 1 yukarı B2 → 2 sağa D2 → 2 aşağı D4 → 1 sola C4!',
    explanation: 'Tüm adımları uyguladığımızda C4 karesine ulaşırız.',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [2, 1],
      showCoords: true,
      moves: [
        { dir: 'U', steps: 1 },
        { dir: 'R', steps: 2 },
        { dir: 'D', steps: 2 },
        { dir: 'L', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'C3', isCorrect: false },
      { id: 'b', label: 'C4', isCorrect: true },
      { id: 'c', label: 'D4', isCorrect: false },
      { id: 'd', label: 'B4', isCorrect: false },
    ],
  },
  {
    id: 'ya-11',
    prompt: 'İleri Çakıştırma (⊕): İki şekilde de aynı yerde bulunan noktalar yok olursa geriye ne kalır?',
    hint: 'Sol sütundaki tüm kareler (üst, orta, alt) iki şeklin ikisinde de var; birbirini yok eder!',
    explanation: 'Sol sütun tamamen silinir; sadece üst orta, üst sağ, merkez ve sağ orta noktalar kalır (A şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'xor',
      ruleSymbol: '⊕',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#f43f5e' }, { idx: 3, color: '#f43f5e' }, { idx: 4, color: '#f43f5e' }, { idx: 5, color: '#f43f5e' }, { idx: 6, color: '#f43f5e' }],
      gridB: [{ idx: 0, color: '#38bdf8' }, { idx: 1, color: '#38bdf8' }, { idx: 2, color: '#38bdf8' }, { idx: 3, color: '#38bdf8' }, { idx: 6, color: '#38bdf8' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 1, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 5, color: '#0284c7' }] }, isCorrect: true },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 0, color: '#0284c7' }, { idx: 3, color: '#0284c7' }, { idx: 6, color: '#0284c7' }] }, isCorrect: false },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 1, color: '#0284c7' }, { idx: 2, color: '#0284c7' }, { idx: 4, color: '#0284c7' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 3, color: '#0284c7' }, { idx: 4, color: '#0284c7' }, { idx: 5, color: '#0284c7' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ya-12',
    prompt: 'D4 köşesinden yola çıkan gezgin verilen adımları izlerse nereye ulaşır?',
    hint: 'D4 → 3 yukarı D1 → 2 sola B1 → 1 aşağı B2 → 1 sola A2!',
    explanation: 'Adım adım ilerlediğimizde son durak A2 karesi olur!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [3, 3],
      showCoords: true,
      moves: [
        { dir: 'U', steps: 3 },
        { dir: 'L', steps: 2 },
        { dir: 'D', steps: 1 },
        { dir: 'L', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'A1', isCorrect: false },
      { id: 'b', label: 'A2', isCorrect: true },
      { id: 'c', label: 'B2', isCorrect: false },
      { id: 'd', label: 'A3', isCorrect: false },
    ],
  },
  {
    id: 'ya-13',
    prompt: 'Ortakları Bulma (∩): İki desende DE ortak bulunan kareler hangisidir?',
    hint: 'Sadece hem 1. hem 2. tabloda boyalı olan 3 kareyi tespit et.',
    explanation: 'Sağ üst, tam merkez ve alt orta hücreler her iki tabloda da ortaktır (B şıkkı)!',
    visualType: 'shape_overlay',
    visualData: {
      mode: 'intersect',
      ruleSymbol: '∩',
      gridSize: 3,
      gridA: [{ idx: 0, color: '#10b981' }, { idx: 1, color: '#10b981' }, { idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 7, color: '#10b981' }],
      gridB: [{ idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 6, color: '#10b981' }, { idx: 7, color: '#10b981' }, { idx: 8, color: '#10b981' }],
    },
    options: [
      { id: 'a', visual: { gridSize: 3, cells: [{ idx: 0, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 7, color: '#10b981' }] }, isCorrect: false },
      { id: 'b', visual: { gridSize: 3, cells: [{ idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 7, color: '#10b981' }] }, isCorrect: true },
      { id: 'c', visual: { gridSize: 3, cells: [{ idx: 2, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 8, color: '#10b981' }] }, isCorrect: false },
      { id: 'd', visual: { gridSize: 3, cells: [{ idx: 1, color: '#10b981' }, { idx: 4, color: '#10b981' }, { idx: 7, color: '#10b981' }] }, isCorrect: false },
    ],
  },
  {
    id: 'ya-14',
    prompt: 'Uzun Rota Algoritması: C1 karesinden 5 komutla ilerlediğinde hangi kareye varırsın?',
    hint: 'C1 → 2 aşağı C3 → 2 sola A3 → 1 aşağı A4 → 3 sağa D4 → 1 yukarı D3!',
    explanation: 'Tüm 5 komutu takip ettiğimizde D3 karesinde dururuz!',
    visualType: 'grid_path',
    visualData: {
      size: 4,
      start: [0, 2],
      showCoords: true,
      moves: [
        { dir: 'D', steps: 2 },
        { dir: 'L', steps: 2 },
        { dir: 'D', steps: 1 },
        { dir: 'R', steps: 3 },
        { dir: 'U', steps: 1 },
      ],
    },
    options: [
      { id: 'a', label: 'C3', isCorrect: false },
      { id: 'b', label: 'D2', isCorrect: false },
      { id: 'c', label: 'D3', isCorrect: true },
      { id: 'd', label: 'D4', isCorrect: false },
    ],
  },
];

// ============================================================================
// SINIF DÜZEYİNE GÖRE ETKİNLİK VE SORU SEÇİM YARDIMCILARI (1. - 3. SINIF)
// ============================================================================

export const normalizeBilsemGrade = (grade?: number | null): BilsemGrade => {
  if (grade === 1 || grade === 2 || grade === 3) return grade;
  // BİLSEM bölümü 1-3. sınıflar içindir; 4. sınıf seçilirse 3. sınıf düzeyi gösterilir.
  if (grade === 4) return 3;
  return 2;
};

export const getActivitiesForGrade = (grade: BilsemGrade): BilsemActivityMeta[] =>
  BILSEM_ACTIVITIES.filter((a) => a.grades.includes(grade));

const pickByIds = <T extends { id: string }>(items: T[], ids: string[]): T[] => {
  const map = new Map(items.map((item) => [item.id, item]));
  const picked = ids.map((id) => map.get(id)).filter((x): x is T => Boolean(x));
  return picked.length > 0 ? picked : items;
};

const sliceByGrade = <T,>(items: T[], grade: BilsemGrade): T[] => {
  if (grade === 1) return items.slice(0, Math.min(10, items.length));
  if (grade === 2) return items.slice(0, Math.min(12, items.length));
  if (grade === 3) return items.slice(0, Math.min(14, items.length));
  // 4. Sınıf: zorlu sorular önce gelecek şekilde tüm havuzun tamamı
  const mid = Math.min(4, items.length);
  return [...items.slice(mid), ...items.slice(0, mid)];
};

const getCuratedQuizQuestions = (
  activityId: BilsemActivityId,
  grade: BilsemGrade
): QuizVisualQuestion[] => {
  switch (activityId) {
    case 'coklu_zeka':
      if (grade === 2) {
        return pickByIds(COKLU_ZEKA_QUESTIONS, [
          'cz-1', 'cz-2', 'cz-3', 'cz-4', 'cz-6', 'cz-9', 'cz-10', 'cz-12', 'cz-13', 'cz-16',
        ]);
      }
      if (grade === 3) {
        return pickByIds(COKLU_ZEKA_QUESTIONS, [
          'cz-2', 'cz-3', 'cz-4', 'cz-5', 'cz-6', 'cz-7', 'cz-8', 'cz-9', 'cz-12', 'cz-13', 'cz-14', 'cz-15', 'cz-16',
        ]);
      }
      return pickByIds(COKLU_ZEKA_QUESTIONS, [
        'cz-5', 'cz-7', 'cz-8', 'cz-11', 'cz-12', 'cz-13', 'cz-14', 'cz-15', 'cz-16', 'cz-9', 'cz-3', 'cz-6', 'cz-4', 'cz-1', 'cz-2', 'cz-10',
      ]);

    case 'on_test':
      if (grade === 1) {
        return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-3', 'ot-6', 'ot-8', 'ot-10', 'ot-12', 'ot-13', 'ot-15']);
      }
      if (grade === 2) {
        return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-2', 'ot-3', 'ot-5', 'ot-6', 'ot-8', 'ot-10', 'ot-11', 'ot-12', 'ot-13', 'ot-15']);
      }
      if (grade === 3) {
        return pickByIds(ON_TEST_QUESTIONS, ['ot-1', 'ot-2', 'ot-3', 'ot-4', 'ot-5', 'ot-6', 'ot-8', 'ot-9', 'ot-10', 'ot-11', 'ot-12', 'ot-13', 'ot-14', 'ot-16']);
      }
      return pickByIds(ON_TEST_QUESTIONS, ['ot-4', 'ot-7', 'ot-9', 'ot-11', 'ot-12', 'ot-13', 'ot-14', 'ot-15', 'ot-16', 'ot-6', 'ot-8', 'ot-10', 'ot-2', 'ot-3', 'ot-5', 'ot-1']);

    case 'golge_etkinlikleri':
      return sliceByGrade(GOLGE_QUESTIONS, grade);

    case 'desen_etkinlikleri':
      return sliceByGrade(DESEN_QUESTIONS, grade);

    case 'sekil_bulmaca':
      return sliceByGrade(SEKIL_BULMACA_QUESTIONS, grade);

    case 'sekil_nesne_bulma':
      return sliceByGrade(SEKIL_NESNE_QUESTIONS, grade);

    case 'ayna_simetrisi':
      if (grade === 1) return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-1', 'as-2', 'as-3', 'as-5', 'as-6', 'as-9', 'as-10', 'as-11']);
      if (grade === 2) return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-1', 'as-2', 'as-3', 'as-4', 'as-5', 'as-6', 'as-9', 'as-10', 'as-11', 'as-13']);
      if (grade === 3) return AYNA_SIMETRI_QUESTIONS.slice(0, 12);
      return pickByIds(AYNA_SIMETRI_QUESTIONS, ['as-4', 'as-7', 'as-8', 'as-12', 'as-14', 'as-9', 'as-10', 'as-11', 'as-13', 'as-3', 'as-5', 'as-6', 'as-1', 'as-2']);

    case 'kup_acilimi':
      if (grade === 3) {
        return pickByIds(KUP_ACILIMI_QUESTIONS, ['ka-1', 'ka-2', 'ka-4', 'ka-5', 'ka-6', 'ka-3', 'ka-9', 'ka-10', 'ka-12', 'ka-13']);
      }
      return pickByIds(KUP_ACILIMI_QUESTIONS, ['ka-3', 'ka-4', 'ka-6', 'ka-7', 'ka-8', 'ka-9', 'ka-10', 'ka-11', 'ka-12', 'ka-13', 'ka-14', 'ka-1', 'ka-2', 'ka-5']);

    case 'oruntu_dizileri':
      if (grade === 2) return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-1', 'od-2', 'od-4', 'od-5', 'od-7', 'od-9', 'od-10', 'od-12', 'od-14']);
      if (grade === 3) return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-1', 'od-2', 'od-3', 'od-4', 'od-5', 'od-6', 'od-7', 'od-9', 'od-10', 'od-12', 'od-13', 'od-14']);
      return pickByIds(ORUNTU_DIZILERI_QUESTIONS, ['od-3', 'od-6', 'od-7', 'od-8', 'od-11', 'od-13', 'od-14', 'od-15', 'od-9', 'od-10', 'od-12', 'od-2', 'od-1', 'od-4', 'od-5']);

    case 'kagit_katlama':
      if (grade === 2) return pickByIds(KAGIT_KATLAMA_QUESTIONS, ['kk-1', 'kk-2', 'kk-3', 'kk-4', 'kk-5', 'kk-6', 'kk-7', 'kk-8']);
      if (grade === 3) return pickByIds(KAGIT_KATLAMA_QUESTIONS, ['kk-1', 'kk-3', 'kk-4', 'kk-5', 'kk-6', 'kk-7', 'kk-8', 'kk-9', 'kk-10', 'kk-12']);
      return pickByIds(KAGIT_KATLAMA_QUESTIONS, ['kk-4', 'kk-5', 'kk-6', 'kk-7', 'kk-8', 'kk-9', 'kk-10', 'kk-11', 'kk-12', 'kk-1', 'kk-2', 'kk-3']);

    case 'yon_algoritma':
      if (grade === 1) return pickByIds(YON_ALGORITMA_QUESTIONS, ['ya-1', 'ya-2', 'ya-3', 'ya-4', 'ya-5', 'ya-6', 'ya-7', 'ya-8']);
      if (grade === 2) return pickByIds(YON_ALGORITMA_QUESTIONS, ['ya-1', 'ya-2', 'ya-3', 'ya-4', 'ya-5', 'ya-6', 'ya-7', 'ya-8', 'ya-9', 'ya-10']);
      if (grade === 3) return pickByIds(YON_ALGORITMA_QUESTIONS, ['ya-2', 'ya-3', 'ya-4', 'ya-5', 'ya-6', 'ya-7', 'ya-8', 'ya-9', 'ya-10', 'ya-11', 'ya-12', 'ya-13']);
      return pickByIds(YON_ALGORITMA_QUESTIONS, ['ya-4', 'ya-6', 'ya-7', 'ya-8', 'ya-9', 'ya-10', 'ya-11', 'ya-12', 'ya-13', 'ya-14', 'ya-1', 'ya-2', 'ya-3', 'ya-5']);

    default:
      return [];
  }
};

const getCuratedMemoryRounds = (grade: BilsemGrade): MemoryMatrixRound[] => {
  if (grade === 1) {
    return pickByIds(BILISSEL_UYARIM_ROUNDS, ['bu-1', 'bu-2', 'bu-11', 'bu-3', 'bu-4', 'bu-5', 'bu-6', 'bu-12']).map(
      (r) => ({ ...r, previewMs: r.previewMs + 400 })
    );
  }
  if (grade === 2) {
    return pickByIds(BILISSEL_UYARIM_ROUNDS, ['bu-1', 'bu-2', 'bu-11', 'bu-3', 'bu-4', 'bu-5', 'bu-6', 'bu-12', 'bu-13', 'bu-7']);
  }
  if (grade === 3) {
    return pickByIds(BILISSEL_UYARIM_ROUNDS, ['bu-2', 'bu-3', 'bu-4', 'bu-5', 'bu-6', 'bu-12', 'bu-13', 'bu-7', 'bu-8', 'bu-9', 'bu-14', 'bu-10']);
  }
  return pickByIds(BILISSEL_UYARIM_ROUNDS, ['bu-4', 'bu-5', 'bu-6', 'bu-12', 'bu-13', 'bu-7', 'bu-8', 'bu-9', 'bu-10', 'bu-14', 'bu-15', 'bu-3', 'bu-11']);
};

const getCuratedScanRounds = (grade: BilsemGrade): TargetScanRound[] => {
  if (grade === 1) return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-1', 'dg-2', 'dg-3', 'dg-5', 'dg-6', 'dg-11', 'dg-12', 'dg-13']);
  if (grade === 2) return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-1', 'dg-2', 'dg-3', 'dg-5', 'dg-6', 'dg-7', 'dg-11', 'dg-12', 'dg-13', 'dg-15']);
  if (grade === 3) return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-2', 'dg-3', 'dg-4', 'dg-5', 'dg-6', 'dg-7', 'dg-8', 'dg-9', 'dg-11', 'dg-12', 'dg-13', 'dg-14']);
  return pickByIds(DIKKATI_GUCLENDIRME_ROUNDS, ['dg-4', 'dg-7', 'dg-8', 'dg-9', 'dg-10', 'dg-11', 'dg-12', 'dg-13', 'dg-14', 'dg-15', 'dg-2', 'dg-3', 'dg-5', 'dg-6']);
};


// ----------------------------------------------------------------------------
// GENİŞLETİLMİŞ HAVUZLAR: el yapımı sorular + otomatik üretilen ek sorular
// ----------------------------------------------------------------------------
// Aynı bulmaca + aynı doğru cevap tekrar etmesin diye imzalarına göre ayıklanır.
const quizSig = (q: QuizVisualQuestion): string => {
  const correct = q.options.find((o) => o.isCorrect);
  return JSON.stringify([q.visualType, q.visualData, correct?.label ?? null, correct?.visual ?? null]);
};
const memorySig = (r: MemoryMatrixRound): string =>
  JSON.stringify([r.gridSize, [...r.targets].sort((a, b) => a - b)]);
const scanSig = (r: TargetScanRound): string => JSON.stringify([r.gridCols, r.items]);
const spotSig = (r: SpotOddRound): string =>
  JSON.stringify([r.sceneTheme, r.variantIndex ?? 0, r.glyphSpec ?? null, r.cards.map((c) => c.variant)]);

const mergeUnique = <T,>(base: T[], extra: T[], sig: (x: T) => string): T[] => {
  const seen = new Set(base.map(sig));
  const out: T[] = [];
  for (const item of extra) {
    const key = sig(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
};

const EXTRA_QUIZ: Partial<Record<BilsemActivityId, QuizVisualQuestion[]>> = {
  coklu_zeka: mergeUnique(
    COKLU_ZEKA_QUESTIONS,
    [...generateSampleCokluZeka(), ...generateExtraCokluZeka(), ...generateMoreCokluZeka()],
    quizSig
  ),
  on_test: mergeUnique(
    ON_TEST_QUESTIONS,
    [...generateSampleOnTest(), ...generateExtraOnTest(), ...generateMoreOnTest()],
    quizSig
  ),
  golge_etkinlikleri: mergeUnique(
    GOLGE_QUESTIONS,
    [...generateSampleGolgeQuestions(), ...generateExtraGolge()],
    quizSig
  ),
  desen_etkinlikleri: mergeUnique(
    DESEN_QUESTIONS,
    [...generateSampleDesen(), ...generateExtraDesen(), ...generateMoreDesen()],
    quizSig
  ),
  sekil_bulmaca: mergeUnique(
    SEKIL_BULMACA_QUESTIONS,
    [...generateSampleSekilBulmaca(), ...generateExtraSekilBulmaca()],
    quizSig
  ),
  sekil_nesne_bulma: mergeUnique(SEKIL_NESNE_QUESTIONS, generateExtraSekilNesne(), quizSig),
  ayna_simetrisi: mergeUnique(
    AYNA_SIMETRI_QUESTIONS,
    [...generateSampleAynaSimetrisi(), ...generateExtraAynaSimetrisi(), ...generateMoreAyna()],
    quizSig
  ),
  kup_acilimi: mergeUnique(
    KUP_ACILIMI_QUESTIONS,
    [...generateSampleKupAcilimi(), ...generateExtraKupAcilimi()],
    quizSig
  ),
  oruntu_dizileri: mergeUnique(
    ORUNTU_DIZILERI_QUESTIONS,
    [...generateSampleOruntuDizileri(), ...generateExtraOruntuDizileri(), ...generateMoreOruntu()],
    quizSig
  ),
  kagit_katlama: mergeUnique(
    KAGIT_KATLAMA_QUESTIONS,
    [...generateExtraKagitKatlama(), ...generateMoreKagitKatlama()],
    quizSig
  ),
  yon_algoritma: mergeUnique(
    YON_ALGORITMA_QUESTIONS,
    [...generateSampleYonAlgoritma(), ...generateExtraYonAlgoritma()],
    quizSig
  ),
  kisa_sureli_hafiza: mergeUnique([], generateKisaSureliHafizaQuestions(), quizSig),
  zihinsel_dondurme: mergeUnique([], generateZihinselDondurmeQuestions(), quizSig),
};
const EXTRA_MEMORY = mergeUnique(BILISSEL_UYARIM_ROUNDS, generateExtraBiliselUyarim(), memorySig);
const EXTRA_SCAN = mergeUnique(DIKKATI_GUCLENDIRME_ROUNDS, generateExtraDikkatiGuclendirme(), scanSig);
const EXTRA_SPOT = mergeUnique(GORSEL_AYIRT_ETME_ROUNDS, generateExtraGorselAyirtEtme(), spotSig);

/** Bir oturumda (bir kez oynayışta) çıkacak soru sayısı */
export const SESSION_SIZE: Record<BilsemGrade, number> = { 1: 10, 2: 10, 3: 10, 4: 10 };

/** Etkinlik başına toplam havuz büyüklüğü (el yapımı + ek) */
export const getPoolSize = (activityId: BilsemActivityId): number => {
  switch (activityId) {
    case 'bilissel_uyarim':
      return BILISSEL_UYARIM_ROUNDS.length + EXTRA_MEMORY.length;
    case 'dikkati_guclendirme':
      return DIKKATI_GUCLENDIRME_ROUNDS.length + EXTRA_SCAN.length;
    case 'gorsel_ayirt_etme':
      return GORSEL_AYIRT_ETME_ROUNDS.length + EXTRA_SPOT.length;
    default: {
      const base: Record<string, QuizVisualQuestion[]> = {
        coklu_zeka: COKLU_ZEKA_QUESTIONS,
        on_test: ON_TEST_QUESTIONS,
        golge_etkinlikleri: GOLGE_QUESTIONS,
        desen_etkinlikleri: DESEN_QUESTIONS,
        sekil_bulmaca: SEKIL_BULMACA_QUESTIONS,
        sekil_nesne_bulma: SEKIL_NESNE_QUESTIONS,
        ayna_simetrisi: AYNA_SIMETRI_QUESTIONS,
        kup_acilimi: KUP_ACILIMI_QUESTIONS,
        oruntu_dizileri: ORUNTU_DIZILERI_QUESTIONS,
        kagit_katlama: KAGIT_KATLAMA_QUESTIONS,
        yon_algoritma: YON_ALGORITMA_QUESTIONS,
      };
      return (base[activityId]?.length ?? 0) + (EXTRA_QUIZ[activityId]?.length ?? 0);
    }
  }
};

// Aynı seed her zaman aynı sırayı verir; modal her oyun başında ve tekrarda yeni seed verir.
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  let s = (seed >>> 0) || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Doğru cevap hep aynı şıkta çıkmasın diye şıkları karıştırır ve açıklamadaki harf referansını günceller. */
const withShuffledOptions = (questions: QuizVisualQuestion[], seed: number): QuizVisualQuestion[] =>
  questions.map((q) => {
    let h = 0;
    for (let i = 0; i < q.id.length; i++) h = (h * 31 + q.id.charCodeAt(i)) >>> 0;
    const origCorrectIdx = q.options.findIndex((o) => o.isCorrect);
    const shuffledOptions = seededShuffle(q.options, seed + h);
    const newCorrectIdx = shuffledOptions.findIndex((o) => o.isCorrect);

    let explanation = q.explanation;
    if (origCorrectIdx >= 0 && newCorrectIdx >= 0 && origCorrectIdx !== newCorrectIdx) {
      const origLetter = OPTION_LETTERS[origCorrectIdx];
      const newLetter = OPTION_LETTERS[newCorrectIdx];
      if (origLetter && newLetter) {
        const letterRegex = new RegExp(`\\b${origLetter}\\s+(şıkk[a-zçğıöşüA-ZÇĞIÖŞÜ]*)`, 'g');
        explanation = explanation.replace(letterRegex, `${newLetter} $1`);
      }
    }

    return { ...q, explanation, options: shuffledOptions };
  });

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
};

// Tekrarlarda hep yeni soru gelmesi için oturum geçmişi ve React StrictMode için seed önbelleği
const RECENT_IDS_BY_KEY = new Map<string, Set<string>>();
const LAST_BATCH_BY_KEY = new Map<string, Set<string>>();
const SESSION_PICK_CACHE = new Map<string, unknown>();

function pickFreshSession<T extends { id: string }>(
  key: string,
  pool: T[],
  count: number,
  seed: number
): T[] {
  if (pool.length === 0) return [];
  const targetCount = Math.min(count, pool.length);
  if (seed === 0) return pool.slice(0, targetCount);

  const cacheKey = `${key}:${seed}`;
  const cached = SESSION_PICK_CACHE.get(cacheKey) as T[] | undefined;
  if (cached) return cached;

  const seen = RECENT_IDS_BY_KEY.get(key) ?? new Set<string>();
  const lastBatch = LAST_BATCH_BY_KEY.get(key) ?? new Set<string>();

  const unseen = seededShuffle(
    pool.filter((item) => !seen.has(item.id)),
    seed
  );

  let picked: T[];
  let nextSeen: Set<string>;

  if (unseen.length >= targetCount) {
    picked = unseen.slice(0, targetCount);
    nextSeen = new Set(seen);
    for (const item of picked) nextSeen.add(item.id);
  } else {
    picked = [...unseen];
    const pickedIds = new Set(picked.map((x) => x.id));
    const freshBackfill = seededShuffle(
      pool.filter((item) => !pickedIds.has(item.id) && !lastBatch.has(item.id)),
      seed + 31
    );
    for (const item of freshBackfill) {
      if (picked.length >= targetCount) break;
      picked.push(item);
      pickedIds.add(item.id);
    }
    if (picked.length < targetCount) {
      const remaining = seededShuffle(
        pool.filter((item) => !pickedIds.has(item.id)),
        seed + 67
      );
      for (const item of remaining) {
        if (picked.length >= targetCount) break;
        picked.push(item);
        pickedIds.add(item.id);
      }
    }
    nextSeen = new Set(picked.map((x) => x.id));
  }

  RECENT_IDS_BY_KEY.set(key, nextSeen);
  LAST_BATCH_BY_KEY.set(key, new Set(picked.map((x) => x.id)));

  if (SESSION_PICK_CACHE.size >= 60) {
    const oldestKey = SESSION_PICK_CACHE.keys().next().value;
    if (oldestKey !== undefined) SESSION_PICK_CACHE.delete(oldestKey);
  }
  SESSION_PICK_CACHE.set(cacheKey, picked);
  return picked;
}

/** Küçük sınıflara fazla zor gelecek ek soruları ayıklar (havuzun >= 50 kalmasını korur). */
const isExtraAllowedForGrade = (
  activityId: BilsemActivityId,
  grade: BilsemGrade,
  q: QuizVisualQuestion
): boolean => {
  if (activityId === 'on_test' && grade === 1 && q.visualType === 'cubes3d') return false;
  if (activityId === 'oruntu_dizileri' && grade === 2 && q.id.startsWith('od-m-hard')) return false;
  if (activityId === 'yon_algoritma') {
    const isGrid = q.visualType === 'grid_path';
    const size = q.visualData?.size;
    if (grade === 1 && isGrid && size === 5 && q.visualData?.showCoords) return false;
  }
  return true;
};

const getBaseQuizPool = (activityId: BilsemActivityId): QuizVisualQuestion[] => {
  switch (activityId) {
    case 'coklu_zeka':
      return COKLU_ZEKA_QUESTIONS;
    case 'on_test':
      return ON_TEST_QUESTIONS;
    case 'golge_etkinlikleri':
      return GOLGE_QUESTIONS;
    case 'desen_etkinlikleri':
      return DESEN_QUESTIONS;
    case 'sekil_bulmaca':
      return SEKIL_BULMACA_QUESTIONS;
    case 'sekil_nesne_bulma':
      return SEKIL_NESNE_QUESTIONS;
    case 'ayna_simetrisi':
      return AYNA_SIMETRI_QUESTIONS;
    case 'kup_acilimi':
      return KUP_ACILIMI_QUESTIONS;
    case 'oruntu_dizileri':
      return ORUNTU_DIZILERI_QUESTIONS;
    case 'kagit_katlama':
      return KAGIT_KATLAMA_QUESTIONS;
    case 'yon_algoritma':
      return YON_ALGORITMA_QUESTIONS;
    default:
      return [];
  }
};

export const getQuizQuestionsForGrade = (
  activityId: BilsemActivityId,
  grade: BilsemGrade,
  seed = 0
): QuizVisualQuestion[] => {
  const curated = getCuratedQuizQuestions(activityId, grade);
  const fullBase = getBaseQuizPool(activityId);
  const extras = (EXTRA_QUIZ[activityId] ?? []).filter((q) => isExtraAllowedForGrade(activityId, grade, q));
  const pool = dedupeById([...curated, ...fullBase, ...extras]);
  if (pool.length === 0) return [];

  const picked = pickFreshSession(`quiz:${activityId}:${grade}`, pool, SESSION_SIZE[grade], seed);
  return withShuffledOptions(picked, seed);
};

const sortByDifficulty = <T,>(items: T[], key: (x: T) => [number, number]): T[] =>
  [...items].sort((a, b) => {
    const [a1, a2] = key(a);
    const [b1, b2] = key(b);
    return a1 - b1 || a2 - b2;
  });

export const getMemoryRoundsForGrade = (grade: BilsemGrade, seed = 0): MemoryMatrixRound[] => {
  const curated = getCuratedMemoryRounds(grade);
  const bonus = grade === 1 ? 450 : 0;
  const pool = dedupeById([...curated, ...BILISSEL_UYARIM_ROUNDS, ...EXTRA_MEMORY]).map((r) => ({
    ...r,
    previewMs: r.previewMs + (r.gridSize === 5 && grade === 1 ? bonus + 250 : bonus),
  }));
  const picked = pickFreshSession(`memory:${grade}`, pool, SESSION_SIZE[grade], seed);
  // Seçilen 10 farklı turu kolaydan zora sırala
  return sortByDifficulty(picked, (r) => [r.gridSize, r.targets.length]);
};

export const getScanRoundsForGrade = (grade: BilsemGrade, seed = 0): TargetScanRound[] => {
  const curated = getCuratedScanRounds(grade);
  const pool = dedupeById([...curated, ...DIKKATI_GUCLENDIRME_ROUNDS, ...EXTRA_SCAN]);
  const picked = pickFreshSession(`scan:${grade}`, pool, SESSION_SIZE[grade], seed);
  return sortByDifficulty(picked, (r) => [
    r.items.length,
    r.items.filter((i) => i.isTarget).length,
  ]);
};

export const getSpotOddRoundsForGrade = (grade: BilsemGrade, seed = 0): SpotOddRound[] => {
  const pool = dedupeById([...GORSEL_AYIRT_ETME_ROUNDS, ...EXTRA_SPOT]);
  const picked = pickFreshSession(`spot:${grade}`, pool, SESSION_SIZE[grade], seed);
  return picked.map((round, idx) => ({
    ...round,
    cards: seededShuffle(round.cards, seed + idx * 131 + 19),
  }));
};

const taskCountCache = new Map<string, number>();
export const getTaskCountForGrade = (activityId: BilsemActivityId, grade: BilsemGrade): number => {
  const key = `${activityId}:${grade}`;
  const cached = taskCountCache.get(key);
  if (cached !== undefined) return cached;
  let count: number;
  if (activityId === 'bilissel_uyarim') count = getMemoryRoundsForGrade(grade).length;
  else if (activityId === 'dikkati_guclendirme') count = getScanRoundsForGrade(grade).length;
  else if (activityId === 'gorsel_ayirt_etme') count = getSpotOddRoundsForGrade(grade).length;
  else count = getQuizQuestionsForGrade(activityId, grade).length;
  taskCountCache.set(key, count);
  return count;
};