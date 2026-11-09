export type ContainerType = 'fanus' | 'kova' | 'surahi' | 'akvaryum' | 'tencere' | 'damacana' | 'vazo';
export type ToolType = 'surahi' | 'su_bardagi' | 'cay_bardagi' | 'kova' | 'kepce' | 'sise' | 'kasik' | 'fincan';

export interface SiviTahminRound {
  id: string;
  roundNumber: number;
  title: string;
  question: string;
  // Hedef Kap
  containerType: ContainerType;
  containerName: string;
  containerEmoji: string;
  // Doldurma Aracı
  toolType: ToolType;
  toolName: string;
  toolEmoji: string;
  // Gerçek miktar ve Sayı Doğrusu aralığı
  targetAmount: number;
  maxScale: number; // örn: 20
  unitLabel: string; // 'sürahi', 'bardak', 'çay bardağı' vb.
  hint: string;
  waterColor?: string; // örn: 'from-cyan-400 to-blue-500'
}

export const SIVI_TAHMIN_ROUNDS: SiviTahminRound[] = [
  {
    id: 'st-1',
    roundNumber: 1,
    title: 'Cam Fanus Tahmini',
    question: 'Bu fanus kaç sürahiyle dolar?',
    containerType: 'fanus',
    containerName: 'Cam Fanus',
    containerEmoji: '🐠',
    toolType: 'surahi',
    toolName: 'Sürahi',
    toolEmoji: '🫗',
    targetAmount: 7,
    maxScale: 20,
    unitLabel: 'sürahi',
    hint: 'Küçük balık fanusu orta boy sürahi ile dolduruluyor.'
  },
  {
    id: 'st-2',
    roundNumber: 2,
    title: 'Büyük Kova Tahmini',
    question: 'Bu kova kaç bardak su ile dolar?',
    containerType: 'kova',
    containerName: 'Büyük Kova',
    containerEmoji: '🪣',
    toolType: 'su_bardagi',
    toolName: 'Su Bardağı',
    toolEmoji: '🥛',
    targetAmount: 12,
    maxScale: 20,
    unitLabel: 'bardak',
    hint: 'Temizlik kovası standart su bardaklarıyla dolduruluyor.'
  },
  {
    id: 'st-3',
    roundNumber: 3,
    title: 'Sürahi & Çay Bardağı',
    question: 'Bu sürahi kaç çay bardağı ile dolar?',
    containerType: 'surahi',
    containerName: 'Cam Sürahi',
    containerEmoji: '🫗',
    toolType: 'cay_bardagi',
    toolName: 'Çay Bardağı',
    toolEmoji: '☕',
    targetAmount: 8,
    maxScale: 15,
    unitLabel: 'çay bardağı',
    hint: 'İnce belli çay bardağı küçük olduğu için sürahiyi doldurmak birkaç bardak ister.'
  },
  {
    id: 'st-4',
    roundNumber: 4,
    title: 'Geniş Akvaryum Tahmini',
    question: 'Bu akvaryum kaç sürahi su ile dolar?',
    containerType: 'akvaryum',
    containerName: 'Büyük Akvaryum',
    containerEmoji: '🐟',
    toolType: 'surahi',
    toolName: 'Sürahi',
    toolEmoji: '🫗',
    targetAmount: 14,
    maxScale: 20,
    unitLabel: 'sürahi',
    hint: 'Geniş cam akvaryum fanustan çok daha fazla su alır.'
  },
  {
    id: 'st-5',
    roundNumber: 5,
    title: 'Yemek Tenceresi & Kepçe',
    question: 'Bu tencere kaç kepçe su ile dolar?',
    containerType: 'tencere',
    containerName: 'Mutfak Tenceresi',
    containerEmoji: '🍲',
    toolType: 'kepce',
    toolName: 'Kepçe',
    toolEmoji: '🥄',
    targetAmount: 8,
    maxScale: 15,
    unitLabel: 'kepçe',
    hint: 'Çorba tenceremiz sofraya yetecek kadar kepçe su ile dolduruluyor.'
  },
  {
    id: 'st-6',
    roundNumber: 6,
    title: 'Su Kovası & Sürahi',
    question: 'Bu kova kaç sürahi ile dolar?',
    containerType: 'kova',
    containerName: 'Plastik Kova',
    containerEmoji: '🪣',
    toolType: 'surahi',
    toolName: 'Sürahi',
    toolEmoji: '🫗',
    targetAmount: 5,
    maxScale: 15,
    unitLabel: 'sürahi',
    hint: 'Sürahi büyük bir araç olduğu için kovayı daha az seferde doldurur.'
  },
  {
    id: 'st-7',
    roundNumber: 7,
    title: 'Cam Fanus & Su Bardağı',
    question: 'Bu fanus kaç bardak su ile dolar?',
    containerType: 'fanus',
    containerName: 'Cam Fanus',
    containerEmoji: '🐠',
    toolType: 'su_bardagi',
    toolName: 'Su Bardağı',
    toolEmoji: '🥛',
    targetAmount: 15,
    maxScale: 20,
    unitLabel: 'bardak',
    hint: 'Su bardağı sürahiden küçük olduğu için daha çok bardak gerekir.'
  },
  {
    id: 'st-8',
    roundNumber: 8,
    title: 'Çiçek Vazosu Tahmini',
    question: 'Bu vazo kaç çay bardağı su ile dolar?',
    containerType: 'vazo',
    containerName: 'Cam Vazo',
    containerEmoji: '🏺',
    toolType: 'cay_bardagi',
    toolName: 'Çay Bardağı',
    toolEmoji: '☕',
    targetAmount: 6,
    maxScale: 15,
    unitLabel: 'çay bardağı',
    hint: 'Masanın üzerindeki çiçek vazosu birkaç çay bardağıyla dolar.'
  },
  {
    id: 'st-9',
    roundNumber: 9,
    title: 'Büyük Akvaryum & Kova',
    question: 'Bu akvaryum kaç kova su ile dolar?',
    containerType: 'akvaryum',
    containerName: 'Büyük Akvaryum',
    containerEmoji: '🐟',
    toolType: 'kova',
    toolName: 'Kova',
    toolEmoji: '🪣',
    targetAmount: 4,
    maxScale: 10,
    unitLabel: 'kova',
    hint: 'Kova çok büyük bir ölçme aracıdır, akvaryumu çabuk doldurur.'
  },
  {
    id: 'st-10',
    roundNumber: 10,
    title: 'Büyük Damacana Tahmini',
    question: 'Bu damacana kaç sürahi ile dolar?',
    containerType: 'damacana',
    containerName: 'Su Damacanası',
    containerEmoji: '🍶',
    toolType: 'surahi',
    toolName: 'Sürahi',
    toolEmoji: '🫗',
    targetAmount: 9,
    maxScale: 20,
    unitLabel: 'sürahi',
    hint: 'Büyük damacana çok su alır, sürahi ile doldurmak sabır ister.'
  },
  {
    id: 'st-11',
    roundNumber: 11,
    title: 'Cam Sürahi & Su Bardağı',
    question: 'Bu sürahi kaç su bardağı su alır?',
    containerType: 'surahi',
    containerName: 'Cam Sürahi',
    containerEmoji: '🫗',
    toolType: 'su_bardagi',
    toolName: 'Su Bardağı',
    toolEmoji: '🥛',
    targetAmount: 5,
    maxScale: 15,
    unitLabel: 'bardak',
    hint: 'Standart bir cam sürahi genellikle 4-5 su bardağı su alır.'
  },
  {
    id: 'st-12',
    roundNumber: 12,
    title: 'Tencere & Kepçe',
    question: 'Bu tencere kaç kepçe çorba / su alır?',
    containerType: 'tencere',
    containerName: 'Tencere',
    containerEmoji: '🍲',
    toolType: 'kepce',
    toolName: 'Mutfak Kepçesi',
    toolEmoji: '🥣',
    targetAmount: 16,
    maxScale: 20,
    unitLabel: 'kepçe',
    hint: 'Kepçe bardaktan daha küçük olduğu için tencereyi doldurmak çok kepçe ister.'
  }
];

export const getRandomSiviTahminRounds = (count: number = 5): SiviTahminRound[] => {
  const shuffled = [...SIVI_TAHMIN_ROUNDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((item, idx) => ({
    ...item,
    roundNumber: idx + 1
  }));
};
