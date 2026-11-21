export type LetterGroupId = 'grup1' | 'grup2' | 'grup3' | 'grup4' | 'grup5';

export type OkumaYazmaActivityId =
  | 'araba_yarisi'
  | 'hece_birlestirme'
  | 'bulut_eslestirme'
  | 'balon_ses_avi'
  | 'hece_carkifelek'
  | 'surpriz_kutular'
  | 'anagram_dizme'
  | 'piramit_okuma'
  | 'cizgili_yazi_tahtasi';

export interface OkumaArabaVehicle {
  id: string;
  name: string;
  selectImg: string;
  driveImg: string;
}

export const OKUMA_ARABA_VEHICLES: OkumaArabaVehicle[] = [
  { id: 'spor_araba', name: 'Kırmızı Araba', selectImg: '/assets/okuma_araba/select_0.png', driveImg: '/assets/okuma_araba/drive_0.png' },
  { id: 'motor', name: 'Mavi Motor', selectImg: '/assets/okuma_araba/select_1.png', driveImg: '/assets/okuma_araba/drive_1.png' },
  { id: 'okul_otobusu', name: 'Okul Otobüsü', selectImg: '/assets/okuma_araba/select_2.png', driveImg: '/assets/okuma_araba/drive_2.png' },
  { id: 'kamyon', name: 'Turuncu Kamyon', selectImg: '/assets/okuma_araba/select_3.png', driveImg: '/assets/okuma_araba/drive_3.png' },
  { id: 'kirmizi_otobus', name: 'Kırmızı Otobüs', selectImg: '/assets/okuma_araba/select_4.png', driveImg: '/assets/okuma_araba/drive_4.png' },
  { id: 'sari_mini', name: 'Sarı Mini', selectImg: '/assets/okuma_araba/select_5.png', driveImg: '/assets/okuma_araba/drive_5.png' },
  { id: 'sari_minibus', name: 'Sarı Minibüs', selectImg: '/assets/okuma_araba/select_6.png', driveImg: '/assets/okuma_araba/drive_6.png' },
  { id: 'polis', name: 'Polis Arabası', selectImg: '/assets/okuma_araba/select_7.png', driveImg: '/assets/okuma_araba/drive_7.png' },
  { id: 'panelvan', name: 'Gri Panelvan', selectImg: '/assets/okuma_araba/select_8.png', driveImg: '/assets/okuma_araba/drive_8.png' },
];

export interface SyllableWord {
  word: string;
  syllables: string[];
  letter: string; // Primary letter uppercase (e.g. 'E', 'L', 'A', 'K', 'İ', 'N')
  emoji?: string;
}

export interface SentenceItem {
  text: string;
  words: string[];
  letter: string;
}

export interface PyramidText {
  id: string;
  title: string;
  lines: string[];
}

export interface LetterEntry {
  upper: string;
  lower: string;
  keyword: string;
  emoji: string;
  syllables: string[];
  sampleWords: string[];
}

export interface LetterGroupData {
  id: LetterGroupId;
  order: number;
  title: string;
  shortTitle: string;
  lettersLabel: string;
  accent: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
  letters: LetterEntry[];
  words: SyllableWord[];
  sentences: SentenceItem[];
  wordLadders: string[][];
  pyramids: PyramidText[];
}

export interface OkumaYazmaActivityMeta {
  id: OkumaYazmaActivityId;
  order: number;
  title: string;
  interactionLabel: string;
  description: string;
  accent: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'orange' | 'indigo';
  emoji: string;
}

export const OKUMA_YAZMA_ACTIVITIES: OkumaYazmaActivityMeta[] = [
  {
    id: 'araba_yarisi',
    order: 1,
    title: 'Okuma Araba Yarışı',
    interactionLabel: '1 & 2 Kişilik · 3 Şerit',
    description: 'Aracını seç, sesli okunan hece veya kelime küpünün şeridine geç.',
    accent: 'rose',
    emoji: '🚗',
  },
  {
    id: 'hece_birlestirme',
    order: 2,
    title: 'Hece Birleştirme',
    interactionLabel: 'Sürükle-Bırak · Dokun',
    description: 'Renkli heceleri sırayla birleştir, anlamlı kelimeler oluştur ve dinle.',
    accent: 'sky',
    emoji: '🧩',
  },
  {
    id: 'bulut_eslestirme',
    order: 3,
    title: 'Bulut Eşleştirme',
    interactionLabel: 'Seç & Eşleştir',
    description: 'Aynı hece, kelime ve büyük-küçük harf bulutlarını bularak eşleştir.',
    accent: 'cyan',
    emoji: '☁️',
  },
  {
    id: 'balon_ses_avi',
    order: 4,
    title: 'Balon Patlatma · Ses Avı',
    interactionLabel: 'Hızlı Dokun',
    description: 'Söylenen harf, hece veya kelimeyi taşıyan renkli balonları patlat.',
    accent: 'amber',
    emoji: '🎈',
  },
  {
    id: 'hece_carkifelek',
    order: 5,
    title: 'Hece & Kelime Çarkıfeleği',
    interactionLabel: 'Akıllı Tahta Oyunu',
    description: 'Çarkı çevir, gelen hece, kelime ya da cümleyi sesli oku ve puan kazan.',
    accent: 'orange',
    emoji: '🎡',
  },
  {
    id: 'surpriz_kutular',
    order: 6,
    title: 'Sürpriz Kutular',
    interactionLabel: 'Kutuyu Aç & Oku',
    description: 'Numaralı kutuları aç, saklı kelimeyi sesli oku ve doğru eşini seç.',
    accent: 'violet',
    emoji: '🎁',
  },
  {
    id: 'anagram_dizme',
    order: 7,
    title: 'Kelime & Cümle Kurma',
    interactionLabel: 'Sürükle-Bırak · Sırala',
    description: 'Karışık hecelerden kelime, karışık kelimelerden anlamlı cümle kur.',
    accent: 'emerald',
    emoji: '🔤',
  },
  {
    id: 'piramit_okuma',
    order: 8,
    title: 'Piramit & Merdiven Okuma',
    interactionLabel: 'Akıcı Okuma',
    description: 'Hece Kitabım piramit metinleri ve kelime merdivenleri ile hızlı okuma.',
    accent: 'sky',
    emoji: '📖',
  },
  {
    id: 'cizgili_yazi_tahtasi',
    order: 9,
    title: 'Çizgili Yazı Tahtası',
    interactionLabel: 'Yazma Pratiği',
    description: 'Kılavuz çizgili ilkokul defteri üzerinde harf, hece ve kelimeleri yaz.',
    accent: 'indigo',
    emoji: '✏️',
  },
];

export const LETTER_GROUPS: LetterGroupData[] = [
  {
    id: 'grup1',
    order: 1,
    title: '1. Harf Grubu',
    shortTitle: '1. Grup',
    lettersLabel: 'E - L - A - K - İ - N',
    accent: 'sky',
    letters: [
      { upper: 'E', lower: 'e', keyword: 'elma', emoji: '🍎', syllables: ['el', 'le', 'ek', 'en'], sampleWords: ['el', 'ele', 'elle'] },
      { upper: 'L', lower: 'l', keyword: 'lale', emoji: '🌷', syllables: ['el', 'le', 'al', 'la'], sampleWords: ['el', 'ele', 'elle', 'lale'] },
      { upper: 'A', lower: 'a', keyword: 'arı', emoji: '🐝', syllables: ['al', 'la', 'ak', 'an'], sampleWords: ['ela', 'ala', 'lale', 'Ela', 'Lale'] },
      { upper: 'K', lower: 'k', keyword: 'kale', emoji: '🏰', syllables: ['ek', 'ke', 'ak', 'ka', 'kal', 'kek'], sampleWords: ['kal', 'kek', 'kale', 'elek', 'ekle', 'leke', 'kelek'] },
      { upper: 'İ', lower: 'i', keyword: 'inek', emoji: '🐄', syllables: ['il', 'li', 'ki', 'in', 'ni', 'kil'], sampleWords: ['Ali', 'iki', 'ile', 'kil', 'elli', 'aile', 'kekik', 'keklik'] },
      { upper: 'N', lower: 'n', keyword: 'nane', emoji: '🌿', syllables: ['en', 'ne', 'an', 'na', 'in', 'ni', 'nal'], sampleWords: ['anne', 'nine', 'nane', 'inek', 'ekin', 'nal', 'ninni', 'Kenan'] },
    ],
    words: [
      { word: 'el', syllables: ['el'], letter: 'L', emoji: '✋' },
      { word: 'ele', syllables: ['e', 'le'], letter: 'L' },
      { word: 'elle', syllables: ['el', 'le'], letter: 'L', emoji: '🤝' },
      { word: 'ela', syllables: ['e', 'la'], letter: 'A' },
      { word: 'ala', syllables: ['a', 'la'], letter: 'A' },
      { word: 'lale', syllables: ['la', 'le'], letter: 'A', emoji: '🌷' },
      { word: 'Ela', syllables: ['E', 'la'], letter: 'A', emoji: '👧' },
      { word: 'Lale', syllables: ['La', 'le'], letter: 'A', emoji: '👧' },
      { word: 'kek', syllables: ['kek'], letter: 'K', emoji: '🧁' },
      { word: 'kale', syllables: ['ka', 'le'], letter: 'K', emoji: '🏰' },
      { word: 'ekle', syllables: ['ek', 'le'], letter: 'K', emoji: '➕' },
      { word: 'leke', syllables: ['le', 'ke'], letter: 'K' },
      { word: 'elek', syllables: ['e', 'lek'], letter: 'K' },
      { word: 'kelek', syllables: ['ke', 'lek'], letter: 'K', emoji: '🍈' },
      { word: 'elekle', syllables: ['e', 'lek', 'le'], letter: 'K' },
      { word: 'alaka', syllables: ['a', 'la', 'ka'], letter: 'K' },
      { word: 'Ali', syllables: ['A', 'li'], letter: 'İ', emoji: '👦' },
      { word: 'iki', syllables: ['i', 'ki'], letter: 'İ', emoji: '2️⃣' },
      { word: 'ile', syllables: ['i', 'le'], letter: 'İ' },
      { word: 'elli', syllables: ['el', 'li'], letter: 'İ' },
      { word: 'ilik', syllables: ['i', 'lik'], letter: 'İ' },
      { word: 'lila', syllables: ['li', 'la'], letter: 'İ', emoji: '🟣' },
      { word: 'aile', syllables: ['a', 'i', 'le'], letter: 'İ', emoji: '👨‍👩‍👧‍👦' },
      { word: 'ikili', syllables: ['i', 'ki', 'li'], letter: 'İ' },
      { word: 'lekeli', syllables: ['le', 'ke', 'li'], letter: 'İ' },
      { word: 'laleli', syllables: ['la', 'le', 'li'], letter: 'İ', emoji: '🌷' },
      { word: 'kekik', syllables: ['ke', 'kik'], letter: 'İ', emoji: '🌿' },
      { word: 'keklik', syllables: ['kek', 'lik'], letter: 'İ', emoji: '🐦' },
      { word: 'anne', syllables: ['an', 'ne'], letter: 'N', emoji: '👩' },
      { word: 'nine', syllables: ['ni', 'ne'], letter: 'N', emoji: '👵' },
      { word: 'nane', syllables: ['na', 'ne'], letter: 'N', emoji: '🌿' },
      { word: 'inek', syllables: ['i', 'nek'], letter: 'N', emoji: '🐄' },
      { word: 'ninni', syllables: ['nin', 'ni'], letter: 'N', emoji: '🌙' },
      { word: 'ekin', syllables: ['e', 'kin'], letter: 'N', emoji: '🌾' },
      { word: 'anla', syllables: ['an', 'la'], letter: 'N', emoji: '💡' },
      { word: 'naneli', syllables: ['na', 'ne', 'li'], letter: 'N', emoji: '🌿' },
      { word: 'kalkan', syllables: ['kal', 'kan'], letter: 'N', emoji: '🛡️' },
      { word: 'Kenan', syllables: ['Ke', 'nan'], letter: 'N', emoji: '👦' },
      { word: 'Nalan', syllables: ['Na', 'lan'], letter: 'N', emoji: '👧' },
      { word: 'eline', syllables: ['e', 'li', 'ne'], letter: 'N', emoji: '✋' },
    ],
    sentences: [
      { text: 'El ele.', words: ['El', 'ele.'], letter: 'L' },
      { text: 'Ela lale al.', words: ['Ela', 'lale', 'al.'], letter: 'A' },
      { text: 'Lale lale al.', words: ['Lale', 'lale', 'al.'], letter: 'A' },
      { text: 'Ela kalk.', words: ['Ela', 'kalk.'], letter: 'K' },
      { text: 'Ela kale al.', words: ['Ela', 'kale', 'al.'], letter: 'K' },
      { text: 'Lale kelek al.', words: ['Lale', 'kelek', 'al.'], letter: 'K' },
      { text: 'Kalk kek al.', words: ['Kalk', 'kek', 'al.'], letter: 'K' },
      { text: 'Ali iki kil al.', words: ['Ali', 'iki', 'kil', 'al.'], letter: 'İ' },
      { text: 'İlke kekik ek.', words: ['İlke', 'kekik', 'ek.'], letter: 'İ' },
      { text: 'Ali ile İlke aile.', words: ['Ali', 'ile', 'İlke', 'aile.'], letter: 'İ' },
      { text: 'Eline kalkan al.', words: ['Eline', 'kalkan', 'al.'], letter: 'N' },
      { text: 'Kenan ekin ek.', words: ['Kenan', 'ekin', 'ek.'], letter: 'N' },
      { text: 'Nil annene nane al.', words: ['Nil', 'annene', 'nane', 'al.'], letter: 'N' },
      { text: 'Ali aileni anla.', words: ['Ali', 'aileni', 'anla.'], letter: 'N' },
    ],
    wordLadders: [
      ['el', 'ele', 'elek', 'elekle'],
      ['al', 'ala', 'alan', 'alana'],
      ['il', 'ilk', 'ilke', 'ilkel'],
      ['ek', 'eki', 'ekin', 'ekinle'],
      ['kel', 'kele', 'kelek', 'kelekle'],
      ['kal', 'kala', 'kalan', 'kalana'],
      ['an', 'anne', 'annen', 'annene'],
      ['kek', 'kekli', 'keklik', 'keklikle'],
    ],
    pyramids: [
      {
        id: 'p1_nil',
        title: 'NİL',
        lines: ['Nil ek', 'Nil ekin ek', 'Nil ikili ekin ek', 'Nil ile ikili ekin ek', 'Nil ikili ekin ek', 'Nil ekin ek', 'Nil ek'],
      },
      {
        id: 'p1_ilke',
        title: 'İLKE',
        lines: ['İlke al', 'İlke kek al', 'İlke eline kek al', 'İlke eline iki kek al', 'İlke eline kek al', 'İlke kek al', 'İlke al'],
      },
      {
        id: 'p1_ali',
        title: 'ALİ',
        lines: ['Ali ekle', 'Ali keke ekle', 'Ali keke nane ekle', 'Ali ile keke nane ekle', 'Ali keke nane ekle', 'Ali keke ekle', 'Ali ekle'],
      },
      {
        id: 'p1_ela',
        title: 'ELA',
        lines: ['Ela al', 'Ela inek al', 'Ela nine inek al', 'Ela nine iki inek al', 'Ela nine inek al', 'Ela inek al', 'Ela al'],
      },
    ],
  },
  {
    id: 'grup2',
    order: 2,
    title: '2. Harf Grubu',
    shortTitle: '2. Grup',
    lettersLabel: 'O - M - U - T - Ü - Y',
    accent: 'emerald',
    letters: [
      { upper: 'O', lower: 'o', keyword: 'okul', emoji: '🏫', syllables: ['ol', 'lo', 'ok', 'ko', 'on', 'kol', 'kon'], sampleWords: ['kol', 'koli', 'kilo', 'kokla', 'konak', 'koala'] },
      { upper: 'M', lower: 'm', keyword: 'limon', emoji: '🍋', syllables: ['em', 'me', 'mi', 'om', 'mo', 'ma', 'mum', 'nem'], sampleWords: ['elma', 'limon', 'kalem', 'ekmek', 'keman', 'kilim'] },
      { upper: 'U', lower: 'u', keyword: 'uçak', emoji: '✈️', syllables: ['lu', 'ku', 'un', 'nu', 'um', 'mu', 'kum', 'kul'], sampleWords: ['okul', 'koku', 'kule', 'kulak', 'lokum', 'mum', 'kum'] },
      { upper: 'T', lower: 't', keyword: 'tilki', emoji: '🦊', syllables: ['et', 'te', 'at', 'ta', 'it', 'ti', 'ot', 'to', 'ut', 'tu', 'tat', 'tel'], sampleWords: ['toka', 'kutu', 'etek', 'mutlu', 'tatil', 'tilki', 'koltuk'] },
      { upper: 'Ü', lower: 'ü', keyword: 'ütü', emoji: '🧺', syllables: ['ül', 'lü', 'kü', 'ün', 'nü', 'mü', 'üt', 'tü', 'tül', 'küt'], sampleWords: ['ütü', 'tül', 'küme', 'ülke', 'tünel', 'kütük', 'ünlem'] },
      { upper: 'Y', lower: 'y', keyword: 'yayla', emoji: '⛰️', syllables: ['ey', 'ye', 'ay', 'ya', 'yi', 'oy', 'yo', 'uy', 'yu', 'yü', 'yay', 'yol', 'yem'], sampleWords: ['oyun', 'ayna', 'kuyu', 'yemek', 'leylek', 'kamyon', 'maymun'] },
    ],
    words: [
      { word: 'koli', syllables: ['ko', 'li'], letter: 'O', emoji: '📦' },
      { word: 'kilo', syllables: ['ki', 'lo'], letter: 'O', emoji: '⚖️' },
      { word: 'kokla', syllables: ['kok', 'la'], letter: 'O', emoji: '👃' },
      { word: 'konak', syllables: ['ko', 'nak'], letter: 'O', emoji: '🏛️' },
      { word: 'koala', syllables: ['ko', 'a', 'la'], letter: 'O', emoji: '🐨' },
      { word: 'kakao', syllables: ['ka', 'ka', 'o'], letter: 'O', emoji: '🍫' },
      { word: 'Okan', syllables: ['O', 'kan'], letter: 'O', emoji: '👦' },
      { word: 'elma', syllables: ['el', 'ma'], letter: 'M', emoji: '🍎' },
      { word: 'limon', syllables: ['li', 'mon'], letter: 'M', emoji: '🍋' },
      { word: 'kalem', syllables: ['ka', 'lem'], letter: 'M', emoji: '✏️' },
      { word: 'ekmek', syllables: ['ek', 'mek'], letter: 'M', emoji: '🍞' },
      { word: 'keman', syllables: ['ke', 'man'], letter: 'M', emoji: '🎻' },
      { word: 'minik', syllables: ['mi', 'nik'], letter: 'M' },
      { word: 'kilim', syllables: ['ki', 'lim'], letter: 'M', emoji: '🧶' },
      { word: 'lokma', syllables: ['lok', 'ma'], letter: 'M', emoji: '🍩' },
      { word: 'makine', syllables: ['ma', 'ki', 'ne'], letter: 'M', emoji: '⚙️' },
      { word: 'okul', syllables: ['o', 'kul'], letter: 'U', emoji: '🏫' },
      { word: 'kule', syllables: ['ku', 'le'], letter: 'U', emoji: '🗼' },
      { word: 'kulak', syllables: ['ku', 'lak'], letter: 'U', emoji: '👂' },
      { word: 'lokum', syllables: ['lo', 'kum'], letter: 'U', emoji: '🍬' },
      { word: 'konuk', syllables: ['ko', 'nuk'], letter: 'U', emoji: '🚪' },
      { word: 'kokulu', syllables: ['ko', 'ku', 'lu'], letter: 'U', emoji: '🌸' },
      { word: 'toka', syllables: ['to', 'ka'], letter: 'T', emoji: '🎀' },
      { word: 'kutu', syllables: ['ku', 'tu'], letter: 'T', emoji: '📦' },
      { word: 'etek', syllables: ['e', 'tek'], letter: 'T', emoji: '👗' },
      { word: 'mutlu', syllables: ['mut', 'lu'], letter: 'T', emoji: '😊' },
      { word: 'tatil', syllables: ['ta', 'til'], letter: 'T', emoji: '🏖️' },
      { word: 'tilki', syllables: ['til', 'ki'], letter: 'T', emoji: '🦊' },
      { word: 'koltuk', syllables: ['kol', 'tuk'], letter: 'T', emoji: '🛋️' },
      { word: 'kanat', syllables: ['ka', 'nat'], letter: 'T', emoji: '🪽' },
      { word: 'ütü', syllables: ['ü', 'tü'], letter: 'Ü', emoji: '🧺' },
      { word: 'ülke', syllables: ['ül', 'ke'], letter: 'Ü', emoji: '🗺️' },
      { word: 'tünel', syllables: ['tü', 'nel'], letter: 'Ü', emoji: '🚇' },
      { word: 'kütük', syllables: ['kü', 'tük'], letter: 'Ü', emoji: '🪵' },
      { word: 'ünlem', syllables: ['ün', 'lem'], letter: 'Ü', emoji: '❗' },
      { word: 'ütülü', syllables: ['ü', 'tü', 'lü'], letter: 'Ü' },
      { word: 'oyun', syllables: ['o', 'yun'], letter: 'Y', emoji: '🎮' },
      { word: 'ayna', syllables: ['ay', 'na'], letter: 'Y', emoji: '🪞' },
      { word: 'yemek', syllables: ['ye', 'mek'], letter: 'Y', emoji: '🍽️' },
      { word: 'leylek', syllables: ['ley', 'lek'], letter: 'Y', emoji: '🦢' },
      { word: 'kamyon', syllables: ['kam', 'yon'], letter: 'Y', emoji: '🚚' },
      { word: 'maymun', syllables: ['may', 'mun'], letter: 'Y', emoji: '🐒' },
      { word: 'yelken', syllables: ['yel', 'ken'], letter: 'Y', emoji: '⛵' },
    ],
    sentences: [
      { text: 'Okan nane kokla.', words: ['Okan', 'nane', 'kokla.'], letter: 'O' },
      { text: 'Ali Okan kol kola.', words: ['Ali', 'Okan', 'kol', 'kola.'], letter: 'O' },
      { text: 'Mine kalem al.', words: ['Mine', 'kalem', 'al.'], letter: 'M' },
      { text: 'Minik elma al.', words: ['Minik', 'elma', 'al.'], letter: 'M' },
      { text: 'Numan limon al.', words: ['Numan', 'limon', 'al.'], letter: 'U' },
      { text: 'Kokulu mum al.', words: ['Kokulu', 'mum', 'al.'], letter: 'U' },
      { text: 'Tuna mont al.', words: ['Tuna', 'mont', 'al.'], letter: 'T' },
      { text: 'Ona etek al.', words: ['Ona', 'etek', 'al.'], letter: 'T' },
      { text: 'Ünal tülü ütüle.', words: ['Ünal', 'tülü', 'ütüle.'], letter: 'Ü' },
      { text: 'O ülke ünlü.', words: ['O', 'ülke', 'ünlü.'], letter: 'Ü' },
      { text: 'Oya oyun oyna.', words: ['Oya', 'oyun', 'oyna.'], letter: 'Y' },
      { text: 'Kaya uyan.', words: ['Kaya', 'uyan.'], letter: 'Y' },
    ],
    wordLadders: [
      ['kol', 'kolu', 'kolum', 'koluma'],
      ['yol', 'yolu', 'yolum', 'yoluma'],
      ['ütü', 'ütüm', 'ütümü', 'ütümün'],
      ['ok', 'oku', 'okul', 'okulu'],
      ['tat', 'tatil', 'tatili', 'tatilim'],
      ['kum', 'kumu', 'kumun', 'kumunu'],
    ],
    pyramids: [
      {
        id: 'p2_umut',
        title: 'UMUT',
        lines: ['Umut al', 'Umut not al', 'Umut tam not al', 'Umut onu tam not al', 'Umut tam not al', 'Umut not al', 'Umut al'],
      },
      {
        id: 'p2_umit',
        title: 'ÜMİT',
        lines: ['Ümit ütüle', 'Ümit tülü ütüle', 'Ümit iki tülü ütüle', 'Ümit o iki tülü ütüle', 'Ümit iki tülü ütüle', 'Ümit tülü ütüle', 'Ümit ütüle'],
      },
      {
        id: 'p2_oya',
        title: 'OYA',
        lines: ['Oya al', 'Oya limonu al', 'Oya o limonu al', 'Oya ile o limonu al', 'Oya o limonu al', 'Oya limonu al', 'Oya al'],
      },
      {
        id: 'p2_tuna',
        title: 'TUNA',
        lines: ['Tuna oyna', 'Tuna oyun oyna', 'Tuna ona oyun oyna', 'Tuna ile ona oyun oyna', 'Tuna ona oyun oyna', 'Tuna oyun oyna', 'Tuna oyna'],
      },
    ],
  },
  {
    id: 'grup3',
    order: 3,
    title: '3. Harf Grubu',
    shortTitle: '3. Grup',
    lettersLabel: 'Ö - R - I - D - S - B',
    accent: 'amber',
    letters: [
      { upper: 'Ö', lower: 'ö', keyword: 'ördek', emoji: '🦆', syllables: ['öl', 'lö', 'kö', 'ön', 'nö', 'öt', 'tö', 'köy', 'dört'], sampleWords: ['köy', 'önlük', 'öykü', 'yöntem', 'atölye', 'önemli'] },
      { upper: 'R', lower: 'r', keyword: 'radyo', emoji: '📻', syllables: ['er', 're', 'ar', 'ra', 'ri', 'or', 'ro', 'ur', 'ru', 'nar', 'kar', 'mor'], sampleWords: ['nar', 'mor', 'kar', 'market', 'ayran', 'kartal', 'makarna'] },
      { upper: 'I', lower: 'ı', keyword: 'ırmak', emoji: '🏞️', syllables: ['lı', 'kı', 'nı', 'mı', 'rı', 'kır', 'tır', 'sır', 'yıl'], sampleWords: ['ayı', 'arı', 'ırmak', 'yılan', 'tırtıl', 'martı', 'atkı'] },
      { upper: 'D', lower: 'd', keyword: 'dondurma', emoji: '🍦', syllables: ['ad', 'de', 'da', 'di', 'do', 'du', 'dü', 'dal', 'dört'], sampleWords: ['dede', 'kedi', 'dört', 'doktor', 'radyo', 'ördek', 'dondurma'] },
      { upper: 'S', lower: 's', keyword: 'saat', emoji: '⏰', syllables: ['es', 'se', 'as', 'sa', 'is', 'si', 'os', 'so', 'us', 'su', 'ses', 'sal'], sampleWords: ['saat', 'sarı', 'masa', 'masal', 'aslan', 'salata', 'kestane'] },
      { upper: 'B', lower: 'b', keyword: 'balık', emoji: '🐟', syllables: ['be', 'ba', 'bi', 'bo', 'bu', 'bal', 'bol', 'bel'], sampleWords: ['baba', 'balık', 'bebek', 'bulut', 'sabun', 'bayrak', 'kelebek', 'araba'] },
    ],
    words: [
      { word: 'önlük', syllables: ['ön', 'lük'], letter: 'Ö', emoji: '🥼' },
      { word: 'öykü', syllables: ['öy', 'kü'], letter: 'Ö', emoji: '📖' },
      { word: 'köylü', syllables: ['köy', 'lü'], letter: 'Ö', emoji: '🏡' },
      { word: 'yöntem', syllables: ['yön', 'tem'], letter: 'Ö' },
      { word: 'önemli', syllables: ['ö', 'nem', 'li'], letter: 'Ö', emoji: '⭐' },
      { word: 'atölye', syllables: ['a', 'töl', 'ye'], letter: 'Ö', emoji: '🎨' },
      { word: 'kural', syllables: ['ku', 'ral'], letter: 'R', emoji: '📋' },
      { word: 'roman', syllables: ['ro', 'man'], letter: 'R', emoji: '📚' },
      { word: 'market', syllables: ['mar', 'ket'], letter: 'R', emoji: '🛒' },
      { word: 'ayran', syllables: ['ay', 'ran'], letter: 'R', emoji: '🥛' },
      { word: 'kartal', syllables: ['kar', 'tal'], letter: 'R', emoji: '🦅' },
      { word: 'terlik', syllables: ['ter', 'lik'], letter: 'R', emoji: '🩴' },
      { word: 'yumurta', syllables: ['yu', 'mur', 'ta'], letter: 'R', emoji: '🥚' },
      { word: 'makarna', syllables: ['ma', 'kar', 'na'], letter: 'R', emoji: '🍝' },
      { word: 'ayı', syllables: ['a', 'yı'], letter: 'I', emoji: '🐻' },
      { word: 'arı', syllables: ['a', 'rı'], letter: 'I', emoji: '🐝' },
      { word: 'ırmak', syllables: ['ır', 'mak'], letter: 'I', emoji: '🏞️' },
      { word: 'yılan', syllables: ['yı', 'lan'], letter: 'I', emoji: '🐍' },
      { word: 'tırtıl', syllables: ['tır', 'tıl'], letter: 'I', emoji: '🐛' },
      { word: 'martı', syllables: ['mar', 'tı'], letter: 'I', emoji: '🕊️' },
      { word: 'atkı', syllables: ['at', 'kı'], letter: 'I', emoji: '🧣' },
      { word: 'kulaklık', syllables: ['ku', 'lak', 'lık'], letter: 'I', emoji: '🎧' },
      { word: 'dede', syllables: ['de', 'de'], letter: 'D', emoji: '👴' },
      { word: 'kedi', syllables: ['ke', 'di'], letter: 'D', emoji: '🐱' },
      { word: 'doktor', syllables: ['dok', 'tor'], letter: 'D', emoji: '🩺' },
      { word: 'radyo', syllables: ['rad', 'yo'], letter: 'D', emoji: '📻' },
      { word: 'ördek', syllables: ['ör', 'dek'], letter: 'D', emoji: '🦆' },
      { word: 'düdük', syllables: ['dü', 'dük'], letter: 'D', emoji: '📣' },
      { word: 'dondurma', syllables: ['don', 'dur', 'ma'], letter: 'D', emoji: '🍦' },
      { word: 'saat', syllables: ['sa', 'at'], letter: 'S', emoji: '⏰' },
      { word: 'sarı', syllables: ['sa', 'rı'], letter: 'S', emoji: '🟡' },
      { word: 'masa', syllables: ['ma', 'sa'], letter: 'S', emoji: '🪑' },
      { word: 'masal', syllables: ['ma', 'sal'], letter: 'S', emoji: '📖' },
      { word: 'aslan', syllables: ['as', 'lan'], letter: 'S', emoji: '🦁' },
      { word: 'salata', syllables: ['sa', 'la', 'ta'], letter: 'S', emoji: '🥗' },
      { word: 'kestane', syllables: ['kes', 'ta', 'ne'], letter: 'S', emoji: '🌰' },
      { word: 'balık', syllables: ['ba', 'lık'], letter: 'B', emoji: '🐟' },
      { word: 'bebek', syllables: ['be', 'bek'], letter: 'B', emoji: '👶' },
      { word: 'bulut', syllables: ['bu', 'lut'], letter: 'B', emoji: '☁️' },
      { word: 'sabun', syllables: ['sa', 'bun'], letter: 'B', emoji: '🧼' },
      { word: 'bayrak', syllables: ['bay', 'rak'], letter: 'B', emoji: '🚩' },
      { word: 'kelebek', syllables: ['ke', 'le', 'bek'], letter: 'B', emoji: '🦋' },
      { word: 'araba', syllables: ['a', 'ra', 'ba'], letter: 'B', emoji: '🚗' },
      { word: 'biber', syllables: ['bi', 'ber'], letter: 'B', emoji: '🫑' },
    ],
    sentences: [
      { text: 'Öykü önlük al.', words: ['Öykü', 'önlük', 'al.'], letter: 'Ö' },
      { text: 'O renk mor.', words: ['O', 'renk', 'mor.'], letter: 'R' },
      { text: 'Ömer roman oku.', words: ['Ömer', 'roman', 'oku.'], letter: 'R' },
      { text: 'Anıl akıllı ol.', words: ['Anıl', 'akıllı', 'ol.'], letter: 'I' },
      { text: 'Tarık kulaklık taktı.', words: ['Tarık', 'kulaklık', 'taktı.'], letter: 'I' },
      { text: 'Kedi eti yedi.', words: ['Kedi', 'eti', 'yedi.'], letter: 'D' },
      { text: 'Demet doktor oldu.', words: ['Demet', 'doktor', 'oldu.'], letter: 'D' },
      { text: 'Eda radyo dinledi.', words: ['Eda', 'radyo', 'dinledi.'], letter: 'D' },
      { text: 'Selma masal anlat.', words: ['Selma', 'masal', 'anlat.'], letter: 'S' },
      { text: 'Osman maske tak.', words: ['Osman', 'maske', 'tak.'], letter: 'S' },
      { text: 'Bora balon aldı.', words: ['Bora', 'balon', 'aldı.'], letter: 'B' },
      { text: 'Tombul balık bitki yedi.', words: ['Tombul', 'balık', 'bitki', 'yedi.'], letter: 'B' },
    ],
    wordLadders: [
      ['sür', 'süre', 'sürem', 'süremi'],
      ['bul', 'bulu', 'bulut', 'buluta'],
      ['köy', 'köyü', 'köyüm', 'köyüme'],
      ['sor', 'soru', 'sorun', 'sorunu'],
      ['sar', 'sarı', 'sarıl', 'sarılı'],
      ['bal', 'balı', 'balık', 'balıkçı'],
    ],
    pyramids: [
      {
        id: 'p3_nar',
        title: 'NAR',
        lines: ['Buse ye', 'Buse nar ye', 'Buse iri nar ye', 'Buse iki iri nar ye', 'Buse iri nar ye', 'Buse nar ye', 'Buse ye'],
      },
      {
        id: 'p3_kedi',
        title: 'KEDİ',
        lines: ['Kedi yedi', 'Kedi eti yedi', 'Kedi sulu eti yedi', 'Kedi sulu eti mi yedi', 'Kedi sulu eti yedi', 'Kedi eti yedi', 'Kedi yedi'],
      },
      {
        id: 'p3_ari',
        title: 'ARI',
        lines: ['Arı kon', 'Arı bala kon', 'Arı sarı bala kon', 'Arı o sarı bala kon', 'Arı sarı bala kon', 'Arı bala kon', 'Arı kon'],
      },
      {
        id: 'p3_mor',
        title: 'MOR',
        lines: ['O mor', 'O renk mor', 'Bak o renk mor', 'Arda bak o renk mor', 'Bak o renk mor', 'O renk mor', 'O mor'],
      },
    ],
  },
  {
    id: 'grup4',
    order: 4,
    title: '4. Harf Grubu',
    shortTitle: '4. Grup',
    lettersLabel: 'Z - Ç - G - Ş - C - P',
    accent: 'rose',
    letters: [
      { upper: 'Z', lower: 'z', keyword: 'zebra', emoji: '🦓', syllables: ['ez', 'ze', 'az', 'za', 'iz', 'zi', 'zu', 'zar', 'zil', 'muz', 'tuz', 'buz'], sampleWords: ['zar', 'zil', 'muz', 'üzüm', 'zebra', 'zeytin', 'yıldız'] },
      { upper: 'Ç', lower: 'ç', keyword: 'çiçek', emoji: '🌸', syllables: ['çe', 'aç', 'ça', 'iç', 'çi', 'uç', 'çu', 'çay', 'üç', 'saç', 'taç'], sampleWords: ['çay', 'uçak', 'çiçek', 'çilek', 'çanta', 'çikolata', 'çaydanlık'] },
      { upper: 'G', lower: 'g', keyword: 'gemi', emoji: '🚢', syllables: ['ge', 'ga', 'gi', 'go', 'gu', 'gü', 'göl', 'göz', 'gül'], sampleWords: ['göl', 'göz', 'gemi', 'gitar', 'geyik', 'gözlük', 'gazete'] },
      { upper: 'Ş', lower: 'ş', keyword: 'şeker', emoji: '🍬', syllables: ['eş', 'şe', 'aş', 'şa', 'iş', 'şi', 'şu', 'kuş', 'beş', 'taş', 'kaş'], sampleWords: ['kuş', 'beş', 'şişe', 'şeker', 'şarkı', 'güneş', 'yeşil'] },
      { upper: 'C', lower: 'c', keyword: 'ceylan', emoji: '🦌', syllables: ['ce', 'ca', 'ci', 'co', 'cam', 'can', 'cem', 'cin'], sampleWords: ['cam', 'inci', 'gece', 'böcek', 'çocuk', 'ceylan', 'oyuncak'] },
      { upper: 'P', lower: 'p', keyword: 'pasta', emoji: '🎂', syllables: ['ip', 'öp', 'pe', 'pa', 'pi', 'po', 'pu', 'pil', 'pul', 'top', 'kap'], sampleWords: ['pil', 'park', 'pide', 'kapı', 'şapka', 'pasta', 'karpuz', 'portakal'] },
    ],
    words: [
      { word: 'üzüm', syllables: ['ü', 'züm'], letter: 'Z', emoji: '🍇' },
      { word: 'zeytin', syllables: ['zey', 'tin'], letter: 'Z', emoji: '🫒' },
      { word: 'zebra', syllables: ['zeb', 'ra'], letter: 'Z', emoji: '🦓' },
      { word: 'deniz', syllables: ['de', 'niz'], letter: 'Z', emoji: '🌊' },
      { word: 'yıldız', syllables: ['yıl', 'dız'], letter: 'Z', emoji: '⭐' },
      { word: 'kırmızı', syllables: ['kır', 'mı', 'zı'], letter: 'Z', emoji: '🔴' },
      { word: 'kozalak', syllables: ['ko', 'za', 'lak'], letter: 'Z', emoji: '🌲' },
      { word: 'uçak', syllables: ['u', 'çak'], letter: 'Ç', emoji: '✈️' },
      { word: 'çiçek', syllables: ['çi', 'çek'], letter: 'Ç', emoji: '🌸' },
      { word: 'çilek', syllables: ['çi', 'lek'], letter: 'Ç', emoji: '🍓' },
      { word: 'çatal', syllables: ['ça', 'tal'], letter: 'Ç', emoji: '🍴' },
      { word: 'çanta', syllables: ['çan', 'ta'], letter: 'Ç', emoji: '🎒' },
      { word: 'uçurtma', syllables: ['u', 'çurt', 'ma'], letter: 'Ç', emoji: '🪁' },
      { word: 'çaydanlık', syllables: ['çay', 'dan', 'lık'], letter: 'Ç', emoji: '🫖' },
      { word: 'çikolata', syllables: ['çi', 'ko', 'la', 'ta'], letter: 'Ç', emoji: '🍫' },
      { word: 'gemi', syllables: ['ge', 'mi'], letter: 'G', emoji: '🚢' },
      { word: 'gitar', syllables: ['gi', 'tar'], letter: 'G', emoji: '🎸' },
      { word: 'geyik', syllables: ['ge', 'yik'], letter: 'G', emoji: '🦌' },
      { word: 'silgi', syllables: ['sil', 'gi'], letter: 'G', emoji: '🧽' },
      { word: 'gözlük', syllables: ['göz', 'lük'], letter: 'G', emoji: '👓' },
      { word: 'yengeç', syllables: ['yen', 'geç'], letter: 'G', emoji: '🦀' },
      { word: 'gezegen', syllables: ['ge', 'ze', 'gen'], letter: 'G', emoji: '🪐' },
      { word: 'gazete', syllables: ['ga', 'ze', 'te'], letter: 'G', emoji: '📰' },
      { word: 'şişe', syllables: ['şi', 'şe'], letter: 'Ş', emoji: '🍾' },
      { word: 'şato', syllables: ['şa', 'to'], letter: 'Ş', emoji: '🏰' },
      { word: 'şeker', syllables: ['şe', 'ker'], letter: 'Ş', emoji: '🍬' },
      { word: 'şarkı', syllables: ['şar', 'kı'], letter: 'Ş', emoji: '🎵' },
      { word: 'yeşil', syllables: ['ye', 'şil'], letter: 'Ş', emoji: '🟢' },
      { word: 'güneş', syllables: ['gü', 'neş'], letter: 'Ş', emoji: '☀️' },
      { word: 'arkadaş', syllables: ['ar', 'ka', 'daş'], letter: 'Ş', emoji: '🤝' },
      { word: 'inci', syllables: ['in', 'ci'], letter: 'C', emoji: '🦪' },
      { word: 'gece', syllables: ['ge', 'ce'], letter: 'C', emoji: '🌙' },
      { word: 'böcek', syllables: ['bö', 'cek'], letter: 'C', emoji: '🐞' },
      { word: 'çocuk', syllables: ['ço', 'cuk'], letter: 'C', emoji: '🧒' },
      { word: 'ceylan', syllables: ['cey', 'lan'], letter: 'C', emoji: '🦌' },
      { word: 'karınca', syllables: ['ka', 'rın', 'ca'], letter: 'C', emoji: '🐜' },
      { word: 'oyuncak', syllables: ['o', 'yun', 'cak'], letter: 'C', emoji: '🧸' },
      { word: 'kapı', syllables: ['ka', 'pı'], letter: 'P', emoji: '🚪' },
      { word: 'şapka', syllables: ['şap', 'ka'], letter: 'P', emoji: '🧢' },
      { word: 'pasta', syllables: ['pas', 'ta'], letter: 'P', emoji: '🎂' },
      { word: 'peynir', syllables: ['pey', 'nir'], letter: 'P', emoji: '🧀' },
      { word: 'kitap', syllables: ['ki', 'tap'], letter: 'P', emoji: '📕' },
      { word: 'karpuz', syllables: ['kar', 'puz'], letter: 'P', emoji: '🍉' },
      { word: 'portakal', syllables: ['por', 'ta', 'kal'], letter: 'P', emoji: '🍊' },
    ],
    sentences: [
      { text: 'Azra izin aldı.', words: ['Azra', 'izin', 'aldı.'], letter: 'Z' },
      { text: 'Ozan özür diledi.', words: ['Ozan', 'özür', 'diledi.'], letter: 'Z' },
      { text: 'Seçil ilaç içti.', words: ['Seçil', 'ilaç', 'içti.'], letter: 'Ç' },
      { text: 'Çikolata çok lezzetli.', words: ['Çikolata', 'çok', 'lezzetli.'], letter: 'Ç' },
      { text: 'Ezgi gitar çaldı.', words: ['Ezgi', 'gitar', 'çaldı.'], letter: 'G' },
      { text: 'Gülten dergi okur.', words: ['Gülten', 'dergi', 'okur.'], letter: 'G' },
      { text: 'Beş kuş uçtu.', words: ['Beş', 'kuş', 'uçtu.'], letter: 'Ş' },
      { text: 'Ayşe şiir okudu.', words: ['Ayşe', 'şiir', 'okudu.'], letter: 'Ş' },
      { text: 'Ece camdan baktı.', words: ['Ece', 'camdan', 'baktı.'], letter: 'C' },
      { text: 'Ceren inci dizdi.', words: ['Ceren', 'inci', 'dizdi.'], letter: 'C' },
      { text: 'Pelin poşet taşır.', words: ['Pelin', 'poşet', 'taşır.'], letter: 'P' },
      { text: 'Parkta pasta yedi.', words: ['Parkta', 'pasta', 'yedi.'], letter: 'P' },
    ],
    wordLadders: [
      ['buz', 'buzu', 'buzul', 'buzulu'],
      ['çay', 'çayı', 'çayır', 'çayıra'],
      ['göl', 'göle', 'gölet', 'göleti'],
      ['kaş', 'kaşı', 'kaşık', 'kaşıkla'],
      ['kap', 'kapı', 'kapım', 'kapıma'],
      ['çiz', 'çizi', 'çizim', 'çizimi'],
    ],
    pyramids: [
      {
        id: 'p4_cay',
        title: 'ÇAY',
        lines: ['Ece iç', 'Ece çay iç', 'Ece buzlu çay iç', 'Ece üç buzlu çay iç', 'Ece buzlu çay iç', 'Ece çay iç', 'Ece iç'],
      },
      {
        id: 'p4_uctu',
        title: 'UÇTU',
        lines: ['Kuş uçtu', 'Beş kuş uçtu', 'Bak beş kuş uçtu', 'Cem bak beş kuş uçtu', 'Bak beş kuş uçtu', 'Beş kuş uçtu', 'Kuş uçtu'],
      },
      {
        id: 'p4_pul',
        title: 'PUL',
        lines: ['Pul topla', 'Pembe pul topla', 'Üç pembe pul topla', 'Üç pembe pul bul topla', 'Üç pembe pul topla', 'Pembe pul topla', 'Pul topla'],
      },
      {
        id: 'p4_cinar',
        title: 'ÇINAR',
        lines: ['Çınar yer', 'Çınar muz yer', 'Çınar kiraz muz yer', 'Çınar kiraz ile muz yer', 'Çınar kiraz muz yer', 'Çınar muz yer', 'Çınar yer'],
      },
    ],
  },
  {
    id: 'grup5',
    order: 5,
    title: '5. Harf Grubu',
    shortTitle: '5. Grup',
    lettersLabel: 'H - V - Ğ - F - J',
    accent: 'violet',
    letters: [
      { upper: 'H', lower: 'h', keyword: 'horoz', emoji: '🐓', syllables: ['ah', 'he', 'ha', 'hi', 'ho', 'hu', 'hak', 'hal', 'han'], sampleWords: ['halı', 'hece', 'horoz', 'bahar', 'hediye', 'ahtapot'] },
      { upper: 'V', lower: 'v', keyword: 'vazo', emoji: '🏺', syllables: ['ev', 'av', 've', 'va', 'vi', 'vo', 'var', 'ver'], sampleWords: ['vazo', 'mavi', 'havuz', 'havuç', 'tavuk', 'vapur', 'civciv', 'tavşan'] },
      { upper: 'Ğ', lower: 'ğ', keyword: 'ağaç', emoji: '🌳', syllables: ['ağ', 'dağ', 'yağ', 'bağ', 'çağ', 'sağ'], sampleWords: ['dağ', 'yağ', 'ağaç', 'kuğu', 'iğne', 'yoğurt', 'yağmur', 'kurbağa'] },
      { upper: 'F', lower: 'f', keyword: 'fil', emoji: '🐘', syllables: ['af', 'of', 'fe', 'fa', 'fi', 'fo', 'fu', 'fil', 'far', 'fen'], sampleWords: ['fil', 'fare', 'fener', 'fırın', 'fındık', 'futbol', 'defter', 'zürafa'] },
      { upper: 'J', lower: 'j', keyword: 'japon', emoji: '🇯🇵', syllables: ['je', 'ja', 'ji', 'jo', 'ju', 'jö', 'jel', 'jet'], sampleWords: ['jel', 'oje', 'judo', 'jöle', 'garaj', 'pijama', 'ejderha', 'japon'] },
    ],
    words: [
      { word: 'halı', syllables: ['ha', 'lı'], letter: 'H', emoji: '🧶' },
      { word: 'hece', syllables: ['he', 'ce'], letter: 'H', emoji: '🔤' },
      { word: 'horoz', syllables: ['ho', 'roz'], letter: 'H', emoji: '🐓' },
      { word: 'bahar', syllables: ['ba', 'har'], letter: 'H', emoji: '🌼' },
      { word: 'sabah', syllables: ['sa', 'bah'], letter: 'H', emoji: '🌅' },
      { word: 'hediye', syllables: ['he', 'di', 'ye'], letter: 'H', emoji: '🎁' },
      { word: 'ahtapot', syllables: ['ah', 'ta', 'pot'], letter: 'H', emoji: '🐙' },
      { word: 'vazo', syllables: ['va', 'zo'], letter: 'V', emoji: '🏺' },
      { word: 'mavi', syllables: ['ma', 'vi'], letter: 'V', emoji: '🔵' },
      { word: 'havuz', syllables: ['ha', 'vuz'], letter: 'V', emoji: '🏊' },
      { word: 'havuç', syllables: ['ha', 'vuç'], letter: 'V', emoji: '🥕' },
      { word: 'tavuk', syllables: ['ta', 'vuk'], letter: 'V', emoji: '🐔' },
      { word: 'vapur', syllables: ['va', 'pur'], letter: 'V', emoji: '⛴️' },
      { word: 'civciv', syllables: ['civ', 'civ'], letter: 'V', emoji: '🐤' },
      { word: 'tavşan', syllables: ['tav', 'şan'], letter: 'V', emoji: '🐇' },
      { word: 'ağaç', syllables: ['a', 'ğaç'], letter: 'Ğ', emoji: '🌳' },
      { word: 'kuğu', syllables: ['ku', 'ğu'], letter: 'Ğ', emoji: '🦢' },
      { word: 'iğne', syllables: ['iğ', 'ne'], letter: 'Ğ', emoji: '🪡' },
      { word: 'düğme', syllables: ['düğ', 'me'], letter: 'Ğ', emoji: '🔘' },
      { word: 'yoğurt', syllables: ['yo', 'ğurt'], letter: 'Ğ', emoji: '🥣' },
      { word: 'yağmur', syllables: ['yağ', 'mur'], letter: 'Ğ', emoji: '🌧️' },
      { word: 'kurbağa', syllables: ['kur', 'ba', 'ğa'], letter: 'Ğ', emoji: '🐸' },
      { word: 'öğretmen', syllables: ['öğ', 'ret', 'men'], letter: 'Ğ', emoji: '👩‍🏫' },
      { word: 'fare', syllables: ['fa', 're'], letter: 'F', emoji: '🐭' },
      { word: 'fener', syllables: ['fe', 'ner'], letter: 'F', emoji: '🔦' },
      { word: 'fırın', syllables: ['fı', 'rın'], letter: 'F', emoji: '🥖' },
      { word: 'köfte', syllables: ['köf', 'te'], letter: 'F', emoji: '🧆' },
      { word: 'fındık', syllables: ['fın', 'dık'], letter: 'F', emoji: '🌰' },
      { word: 'futbol', syllables: ['fut', 'bol'], letter: 'F', emoji: '⚽' },
      { word: 'defter', syllables: ['def', 'ter'], letter: 'F', emoji: '📓' },
      { word: 'zürafa', syllables: ['zü', 'ra', 'fa'], letter: 'F', emoji: '🦒' },
      { word: 'telefon', syllables: ['te', 'le', 'fon'], letter: 'F', emoji: '📞' },
      { word: 'judo', syllables: ['ju', 'do'], letter: 'J', emoji: '🥋' },
      { word: 'jöle', syllables: ['jö', 'le'], letter: 'J', emoji: '🍮' },
      { word: 'jeton', syllables: ['je', 'ton'], letter: 'J', emoji: '🪙' },
      { word: 'garaj', syllables: ['ga', 'raj'], letter: 'J', emoji: '🚗' },
      { word: 'mesaj', syllables: ['me', 'saj'], letter: 'J', emoji: '💌' },
      { word: 'pijama', syllables: ['pi', 'ja', 'ma'], letter: 'J', emoji: '👚' },
      { word: 'japon', syllables: ['ja', 'pon'], letter: 'J', emoji: '🇯🇵' },
      { word: 'ejderha', syllables: ['ej', 'der', 'ha'], letter: 'J', emoji: '🐉' },
    ],
    sentences: [
      { text: 'Hale hamur açar.', words: ['Hale', 'hamur', 'açar.'], letter: 'H' },
      { text: 'Horoz bahçeye kaçtı.', words: ['Horoz', 'bahçeye', 'kaçtı.'], letter: 'H' },
      { text: 'Hülya hırka ördü.', words: ['Hülya', 'hırka', 'ördü.'], letter: 'H' },
      { text: 'Tavşan havuç sever.', words: ['Tavşan', 'havuç', 'sever.'], letter: 'V' },
      { text: 'Yavuz cevap verdi.', words: ['Yavuz', 'cevap', 'verdi.'], letter: 'V' },
      { text: 'Sevgi mavi valiz aldı.', words: ['Sevgi', 'mavi', 'valiz', 'aldı.'], letter: 'V' },
      { text: 'Buğra düğme kırık.', words: ['Buğra', 'düğme', 'kırık.'], letter: 'Ğ' },
      { text: 'Sağlığın için yoğurt ye.', words: ['Sağlığın', 'için', 'yoğurt', 'ye.'], letter: 'Ğ' },
      { text: 'Fırında köfte var.', words: ['Fırında', 'köfte', 'var.'], letter: 'F' },
      { text: 'Zafer fabrikada çalışıyor.', words: ['Zafer', 'fabrikada', 'çalışıyor.'], letter: 'F' },
      { text: 'Araba viraja girdi.', words: ['Araba', 'viraja', 'girdi.'], letter: 'J' },
      { text: 'Jüpiter bir gezegendir.', words: ['Jüpiter', 'bir', 'gezegendir.'], letter: 'J' },
    ],
    wordLadders: [
      ['ver', 'veri', 'verim', 'verimli'],
      ['far', 'fark', 'farkı', 'farkım'],
      ['kov', 'kova', 'kovan', 'kovana'],
      ['dağ', 'dağı', 'dağım', 'dağıma'],
      ['dev', 'deve', 'deven', 'deveni'],
      ['doğ', 'doğu', 'doğum', 'doğumu'],
    ],
    pyramids: [
      {
        id: 'p5_firin',
        title: 'FIRIN',
        lines: ['Fırın hazır', 'Harlı fırın hazır', 'O harlı fırın hazır', 'Filiz o harlı fırın hazır', 'O harlı fırın hazır', 'Harlı fırın hazır', 'Fırın hazır'],
      },
      {
        id: 'p5_kahve',
        title: 'KAHVE',
        lines: ['Kahve iç', 'Sütlü kahve iç', 'Efe sütlü kahve iç', 'Sütlü kahve iç', 'Kahve iç'],
      },
      {
        id: 'p5_veli',
        title: 'VELİ',
        lines: ['Veli aldı', 'Veli ev aldı', 'Veli bir ev aldı', 'Veli mavi bir ev aldı', 'Veli bir ev aldı', 'Veli ev aldı', 'Veli aldı'],
      },
      {
        id: 'p5_agac',
        title: 'AĞAÇ',
        lines: ['Ağaç dik', 'Elma ağacı dik', 'On elma ağacı dik', 'Jale on elma ağacı dik', 'On elma ağacı dik', 'Elma ağacı dik', 'Ağaç dik'],
      },
    ],
  },
];

export function getLetterGroupById(id: LetterGroupId): LetterGroupData {
  return LETTER_GROUPS.find((g) => g.id === id) || LETTER_GROUPS[0];
}

export function getOkumaYazmaActivityMeta(id: OkumaYazmaActivityId): OkumaYazmaActivityMeta {
  return OKUMA_YAZMA_ACTIVITIES.find((a) => a.id === id) || OKUMA_YAZMA_ACTIVITIES[0];
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export {
  speakTurkish,
  speakTurkishRepeated,
  speakEnglish,
  stopSpeaking,
  prefetchTurkishBatch,
  prefetchTurkishItems,
  unlockAudioPlayback,
  getTeacherVoice,
  setTeacherVoice,
  subscribeTeacherVoice,
  type TeacherVoiceId,
} from '../utils/turkishSpeech';

/**
 * Seçili harf grubundan (ve isteğe bağlı tek harf filtresinden) kelimeleri getirir.
 */
export function getFilteredWords(group: LetterGroupData, focusLetter: string | null): SyllableWord[] {
  if (!focusLetter) return group.words;
  const matched = group.words.filter(
    (w) =>
      w.letter.toLocaleUpperCase('tr-TR') === focusLetter.toLocaleUpperCase('tr-TR') ||
      w.word.toLocaleUpperCase('tr-TR').includes(focusLetter.toLocaleUpperCase('tr-TR'))
  );
  return matched.length >= 4 ? matched : group.words;
}

export function getFilteredSentences(group: LetterGroupData, focusLetter: string | null): SentenceItem[] {
  if (!focusLetter) return group.sentences;
  const matched = group.sentences.filter(
    (s) =>
      s.letter.toLocaleUpperCase('tr-TR') === focusLetter.toLocaleUpperCase('tr-TR') ||
      s.text.toLocaleUpperCase('tr-TR').includes(focusLetter.toLocaleUpperCase('tr-TR'))
  );
  return matched.length >= 3 ? matched : group.sentences;
}

// Türkçe dilbilgisi, çocuk güvenliği ve TTS doğru telaffuz filtresi:
// 1) İlkokul ortamına uygun olmayan heceler (özellikle 'am', 'sik' vb.) kesinlikle yasaklıdır.
// 2) TTS motorunun kısaltma/harf adıyla yanlış okuduğu heceler ('ik'→'i-ke', 'no'→'numara', 'üy'→'üye' vb.) engellenir.
// 3) Türkçede hece/kelime sonunda bulunmayan b, c, d, g, j ile biten yapay heceler engellenir.
const BLOCKED_OR_MISREAD_SYLLABLES = new Set([
  // Çocuk güvenliği / uygunsuz hece engeli
  'am',
  'sik',
  'bok',
  'göt',
  'piç',
  'amk',
  'mal',
  // Google Türkçe TTS tarafından harf adıyla veya kısaltma olarak yanlış okunanlar
  'ik',
  'uk',
  'ul',
  'ıl',
  'ım',
  'im',
  'üm',
  'ir',
  'ır',
  'eç',
  'uş',
  'uz',
  'ök',
  'ük',
  'ık',
  'ın',
  'cu',
  'no',
  'üy',
  'iy',
  // Türkçe ses/yazım kurallarına aykırı kapalı heceler
  'ab',
  'eb',
  'ib',
  'ob',
  'ub',
  'ac',
  'ec',
  'ic',
  'oc',
  'uc',
  'ed',
  'id',
  'od',
  'ud',
  'ag',
  'eg',
  'ig',
  'og',
  'ug',
  'eğ',
  'iğ',
  'ığ',
  'oğ',
  'uğ',
  'öğ',
  'üğ',
  'aj',
  'ej',
  'ij',
  'oj',
  'uj',
]);

const TURKISH_VOWEL_REGEX = /[aeıioöuüAEIİOÖUÜ]/;

export function isValidTurkishSyllableOrWord(text: string): boolean {
  const clean = text.trim().toLocaleLowerCase('tr-TR');
  if (clean.length < 2) return false;
  if (!TURKISH_VOWEL_REGEX.test(clean)) return false;
  if (BLOCKED_OR_MISREAD_SYLLABLES.has(clean)) return false;
  return true;
}

export function getGroupSyllables(group: LetterGroupData, focusLetter: string | null): string[] {
  const sourceLetters = focusLetter
    ? group.letters.filter((l) => l.upper === focusLetter)
    : group.letters;
  const set = new Set<string>();
  sourceLetters.forEach((l) =>
    l.syllables.forEach((s) => {
      if (isValidTurkishSyllableOrWord(s)) set.add(s);
    })
  );
  if (set.size < 8) {
    group.letters.forEach((l) =>
      l.syllables.forEach((s) => {
        if (isValidTurkishSyllableOrWord(s)) set.add(s);
      })
    );
  }
  return Array.from(set);
}
