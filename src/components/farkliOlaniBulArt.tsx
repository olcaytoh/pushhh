import React, { useState } from 'react';

export type FarkliCategoryId =
  | 'faces'
  | 'animals'
  | 'fruits'
  | 'vehicles'
  | 'numbers'
  | 'letters';

export interface FarkliCategoryMeta {
  id: FarkliCategoryId;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  accentText: string;
  accentBtn: string;
  cardBg: string;
  topBarGradient: string;
  borderColor: string;
  iconBg: string;
  emblemSrc: string;
}

export const FARKLI_CATEGORIES: FarkliCategoryMeta[] = [
  {
    id: 'faces',
    title: 'Sevimli Yüzler',
    titleEn: 'Cute Faces',
    description: 'Göz kırpan, kulağı kıvrık veya ifadesi farklı tek sevimli yüzü yakala.',
    descriptionEn: 'Spot the single cute face with a wink, folded ear, or different expression.',
    accentText: 'text-amber-300',
    accentBtn: 'bg-amber-400 text-slate-950',
    cardBg: 'bg-[#10192d]',
    topBarGradient: 'from-amber-400 via-orange-500 to-rose-500',
    borderColor: 'border-amber-400/75 hover:border-amber-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/faces_odd_00.webp',
  },
  {
    id: 'animals',
    title: 'Hayvanlar',
    titleEn: 'Animals',
    description: 'Aslan, fil, ahtapot, panda ve sevimli hayvanlar arasında tek farklı olanı bul.',
    descriptionEn: 'Find the one animal with a different expression or hidden detail.',
    accentText: 'text-emerald-300',
    accentBtn: 'bg-emerald-400 text-slate-950',
    cardBg: 'bg-[#0c1c22]',
    topBarGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    borderColor: 'border-emerald-400/75 hover:border-emerald-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/animals_odd_01.webp',
  },
  {
    id: 'fruits',
    title: 'Meyveler',
    titleEn: 'Fruits',
    description: 'Isırılmış elma, kesik nar, farklı yaprak ve çekirdekli meyveyi hemen keşfet.',
    descriptionEn: 'Spot the bitten apple, sliced pomegranate, or subtle fruit detail.',
    accentText: 'text-rose-300',
    accentBtn: 'bg-rose-400 text-slate-950',
    cardBg: 'bg-[#201021]',
    topBarGradient: 'from-rose-400 via-pink-500 to-amber-400',
    borderColor: 'border-rose-400/75 hover:border-rose-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/fruits_odd_00.webp',
  },
  {
    id: 'vehicles',
    title: 'Araçlar',
    titleEn: 'Vehicles',
    description: 'Araba, ambulans, itfaiye, roket ve uçaklar içinde ayrıntısı farklı aracı bul.',
    descriptionEn: 'Spot the vehicle with a different detail, emblem, or design.',
    accentText: 'text-sky-300',
    accentBtn: 'bg-sky-400 text-slate-950',
    cardBg: 'bg-[#0d1930]',
    topBarGradient: 'from-sky-400 via-blue-500 to-indigo-500',
    borderColor: 'border-sky-400/75 hover:border-sky-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/vehicles_12.webp',
  },
  {
    id: 'numbers',
    title: 'Rakamlar',
    titleEn: 'Numbers',
    description: 'Parlak 3D rakamlar arasında biçimi ve çizgisi farklı tek rakamı yakala.',
    descriptionEn: 'Find the single 3D glossy number with a different shape or detail.',
    accentText: 'text-violet-300',
    accentBtn: 'bg-violet-400 text-slate-950',
    cardBg: 'bg-[#17122f]',
    topBarGradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    borderColor: 'border-violet-400/75 hover:border-violet-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/numbers_07.webp',
  },
  {
    id: 'letters',
    title: 'Harfler',
    titleEn: 'Letters',
    description: 'Renkli 3D harfler arasında biçimi ve ayrıntısı farklı tek harfi bul.',
    descriptionEn: 'Catch the single 3D letter with a subtle shape or style difference.',
    accentText: 'text-cyan-300',
    accentBtn: 'bg-cyan-400 text-slate-950',
    cardBg: 'bg-[#0b1b2b]',
    topBarGradient: 'from-cyan-400 via-teal-400 to-sky-500',
    borderColor: 'border-cyan-400/75 hover:border-cyan-300',
    iconBg: 'bg-white',
    emblemSrc: '/assets/farkbl/letters_03.webp',
  },
];

export type OddTransform = 'none' | 'flipX' | 'hueShift';

export interface LevelSpec {
  level: number;
  cols: number;
  rows: number;
  timeLimit: number;
  baseSrc: string;
  oddSrc: string;
  oddTransform: OddTransform;
  diffLabel: string;
  diffLabelEn: string;
}

const getGridForLevel = (level: number): { cols: number; rows: number; timeLimit: number } => {
  // İlkokul öğrencileri için rahat ve aşamalı büyüme: 6 → 8 → 10 → 12 → 15 kart
  if (level <= 2) return { cols: 3, rows: 2, timeLimit: 45 }; // 6 kart
  if (level <= 5) return { cols: 4, rows: 2, timeLimit: 45 }; // 8 kart
  if (level <= 9) return { cols: 5, rows: 2, timeLimit: 48 }; // 10 kart
  if (level <= 15) return { cols: 4, rows: 3, timeLimit: 50 }; // 12 kart
  return { cols: 5, rows: 3, timeLimit: 55 }; // 15 kart
};

interface PairDef {
  idx: number;
  tr: string;
  en: string;
}

const baseIconPath = (cat: FarkliCategoryId, idx: number): string =>
  `/assets/farkbl/${cat}_${String(idx).padStart(2, '0')}.webp`;

const oddIconPath = (cat: FarkliCategoryId, idx: number): string =>
  `/assets/farkbl/${cat}_odd_${String(idx).padStart(2, '0')}.webp`;

// Her kategoride 20 seviye: farkbl.png'deki her görselin birebir karşılığı olan farkliolan_e4b46911.png görseli
const CATEGORY_LEVEL_PAIRS: Record<FarkliCategoryId, PairDef[]> = {
  faces: [
    { idx: 0, tr: 'Bir kedi göz kırpıyor!', en: 'One cat is winking!' },
    { idx: 2, tr: 'Bir tavşanın kulağı kıvrık!', en: 'One bunny has a folded ear!' },
    { idx: 3, tr: 'Bir panda göz kırpıyor!', en: 'One panda is winking!' },
    { idx: 4, tr: 'Bir tilkinin gözleri kapalı!', en: 'One fox has its eyes closed!' },
    { idx: 5, tr: 'Bir aslanın gözleri kapalı!', en: 'One lion has its eyes closed!' },
    { idx: 6, tr: 'Bir penguenin gözleri kapalı!', en: 'One penguin has its eyes closed!' },
    { idx: 7, tr: 'Bir kurbağanın ağzı açık gülüyor!', en: 'One frog has an open-mouth smile!' },
    { idx: 12, tr: 'Bir ayıcık göz kırpıyor!', en: 'One bear is winking!' },
    { idx: 18, tr: 'Bir baykuş göz kırpıyor!', en: 'One owl is winking!' },
    { idx: 10, tr: 'Bir kuzunun gözleri kapalı!', en: 'One lamb has its eyes closed!' },
    { idx: 1, tr: 'Bir köpeğin yüz ifadesi farklı!', en: 'One puppy has a different expression!' },
    { idx: 8, tr: 'Bir rakun dilini çıkarmış!', en: 'One raccoon is sticking out its tongue!' },
    { idx: 9, tr: 'Bir rakun göz kırpıyor!', en: 'One raccoon is winking!' },
    { idx: 11, tr: 'Bir civcivin ifadesi farklı!', en: 'One chick has a different expression!' },
    { idx: 13, tr: 'Bir filin gözleri kapalı!', en: 'One elephant has its eyes closed!' },
    { idx: 14, tr: 'Bir zürafa göz kırpıyor!', en: 'One giraffe is winking!' },
    { idx: 17, tr: 'Bir ördeğin gözleri kapalı!', en: 'One duck has its eyes closed!' },
    { idx: 19, tr: 'Bir kirpinin gözleri kapalı!', en: 'One hedgehog has its eyes closed!' },
    { idx: 15, tr: 'Bir yunusun ayrıntısı farklı!', en: 'One dolphin has a different detail!' },
    { idx: 16, tr: 'Uzman seviye: Farklı kaplumbağayı bul!', en: 'Master level: Spot the different turtle!' },
  ],
  animals: [
    { idx: 0, tr: 'Bir aslan göz kırpıp dilini çıkarmış!', en: 'One lion is winking with its tongue out!' },
    { idx: 1, tr: 'Bir fil göz kırpıyor!', en: 'One elephant is winking!' },
    { idx: 2, tr: 'Bir zebranın gözü kapalı!', en: 'One zebra has its eye closed!' },
    { idx: 4, tr: 'Bir kaplanın gözleri kapalı!', en: 'One tiger has its eyes closed!' },
    { idx: 7, tr: 'Bir ahtapot göz kırpıyor!', en: 'One octopus is winking!' },
    { idx: 8, tr: 'Bir maymunun gözleri kapalı!', en: 'One monkey has its eyes closed!' },
    { idx: 9, tr: 'Bir penguenin gözleri kapalı!', en: 'One penguin has its eyes closed!' },
    { idx: 10, tr: 'Bir panda göz kırpıyor!', en: 'One panda is winking!' },
    { idx: 11, tr: 'Bir tilkinin gözleri kapalı!', en: 'One fox has its eyes closed!' },
    { idx: 3, tr: 'Bir zürafa göz kırpıyor!', en: 'One giraffe is winking!' },
    { idx: 12, tr: 'Bir geyik göz kırpıyor!', en: 'One deer is winking!' },
    { idx: 14, tr: 'Bir papağan göz kırpıyor!', en: 'One parrot is winking!' },
    { idx: 17, tr: 'Bir ördeğin gözü kapalı!', en: 'One duck has its eye closed!' },
    { idx: 6, tr: 'Bir balinanın ifadesi farklı!', en: 'One whale has a different expression!' },
    { idx: 5, tr: 'Bir yunusun ayrıntısı farklı!', en: 'One dolphin has a different detail!' },
    { idx: 15, tr: 'Bir horozun ayrıntısı farklı!', en: 'One rooster has a different detail!' },
    { idx: 16, tr: 'Bir tavuğun ayrıntısı farklı!', en: 'One hen has a different detail!' },
    { idx: 18, tr: 'Bir kaplumbağanın ayrıntısı farklı!', en: 'One turtle has a different detail!' },
    { idx: 19, tr: 'Bir kurbağanın ifadesi farklı!', en: 'One frog has a different expression!' },
    { idx: 13, tr: 'Uzman seviye: Farklı timsahı yakala!', en: 'Master level: Spot the different crocodile!' },
  ],
  fruits: [
    { idx: 0, tr: 'Bir elmadan ısırık alınmış!', en: 'One apple has a bite taken out!' },
    { idx: 13, tr: 'Bir nar ortadan kesilmiş!', en: 'One pomegranate is sliced open!' },
    { idx: 6, tr: 'Bir karpuz diliminin çekirdekleri farklı!', en: 'One watermelon slice has different seeds!' },
    { idx: 7, tr: 'Bir kirazın yaprağı farklı!', en: 'One cherry pair has a different leaf!' },
    { idx: 1, tr: 'Bir muzun şekli farklı!', en: 'One banana has a different shape!' },
    { idx: 2, tr: 'Bir portakalın yaprağı farklı!', en: 'One orange has a different leaf!' },
    { idx: 3, tr: 'Bir mor üzüm salkımı farklı!', en: 'One purple grape bunch is different!' },
    { idx: 4, tr: 'Bir çileğin ayrıntısı farklı!', en: 'One strawberry has a different detail!' },
    { idx: 5, tr: 'Bir armudun yaprağı farklı!', en: 'One pear has a different leaf!' },
    { idx: 8, tr: 'Bir ananasın ayrıntısı farklı!', en: 'One pineapple has a different detail!' },
    { idx: 9, tr: 'Bir portakal dilimi farklı!', en: 'One orange slice is different!' },
    { idx: 10, tr: 'Bir yaban mersini salkımı farklı!', en: 'One blueberry cluster is different!' },
    { idx: 11, tr: 'Bir kivi diliminin ayrıntısı farklı!', en: 'One kiwi slice has a different detail!' },
    { idx: 12, tr: 'Bir şeftalinin yaprağı farklı!', en: 'One peach has a different leaf!' },
    { idx: 14, tr: 'Bir limonun ayrıntısı farklı!', en: 'One lemon has a different detail!' },
    { idx: 15, tr: 'Bir yeşil elmanın yaprağı farklı!', en: 'One green apple has a different leaf!' },
    { idx: 16, tr: 'Bir bütün karpuzun çizgileri farklı!', en: 'One whole watermelon has different stripes!' },
    { idx: 17, tr: 'Bir ahududunun ayrıntısı farklı!', en: 'One raspberry has a different detail!' },
    { idx: 18, tr: 'Bir ikili yaban mersini farklı!', en: 'One pair of blueberries is different!' },
    { idx: 19, tr: 'Uzman seviye: Farklı yeşil üzümü bul!', en: 'Master level: Spot the different green grapes!' },
  ],
  vehicles: [
    { idx: 5, tr: 'Bir ambulansın artı işareti kırmızı!', en: 'One ambulance has a red cross!' },
    { idx: 0, tr: 'Bir kırmızı arabanın tasarımı farklı!', en: 'One red car has a different design!' },
    { idx: 1, tr: 'Bir mavi otobüsün ayrıntısı farklı!', en: 'One blue bus has a different detail!' },
    { idx: 2, tr: 'Bir sarı taksinin ayrıntısı farklı!', en: 'One yellow taxi has a different detail!' },
    { idx: 3, tr: 'Bir itfaiye aracının ayrıntısı farklı!', en: 'One firetruck has a different detail!' },
    { idx: 4, tr: 'Bir polis arabasının ayrıntısı farklı!', en: 'One police car has a different detail!' },
    { idx: 6, tr: 'Bir damperli kamyonun ayrıntısı farklı!', en: 'One dump truck has a different detail!' },
    { idx: 7, tr: 'Bir traktörün ayrıntısı farklı!', en: 'One tractor has a different detail!' },
    { idx: 8, tr: 'Bir motosikletin ayrıntısı farklı!', en: 'One motorcycle has a different detail!' },
    { idx: 9, tr: 'Bir bisikletin ayrıntısı farklı!', en: 'One bicycle has a different detail!' },
    { idx: 10, tr: 'Bir buharlı trenin ayrıntısı farklı!', en: 'One steam train has a different detail!' },
    { idx: 11, tr: 'Bir metro aracının ayrıntısı farklı!', en: 'One metro train has a different detail!' },
    { idx: 12, tr: 'Bir roketin ayrıntısı farklı!', en: 'One rocket has a different detail!' },
    { idx: 13, tr: 'Bir uçağın ayrıntısı farklı!', en: 'One airplane has a different detail!' },
    { idx: 14, tr: 'Bir helikopterin ayrıntısı farklı!', en: 'One helicopter has a different detail!' },
    { idx: 15, tr: 'Bir sıcak hava balonunun ayrıntısı farklı!', en: 'One hot air balloon has a different detail!' },
    { idx: 16, tr: 'Bir yelkenlinin ayrıntısı farklı!', en: 'One sailboat has a different detail!' },
    { idx: 17, tr: 'Bir geminin ayrıntısı farklı!', en: 'One cruise ship has a different detail!' },
    { idx: 18, tr: 'Bir kamyonetin ayrıntısı farklı!', en: 'One delivery truck has a different detail!' },
    { idx: 19, tr: 'Uzman seviye: Farklı okul servisini bul!', en: 'Master level: Spot the different school bus!' },
  ],
  numbers: [
    { idx: 0, tr: 'Bir kırmızı 1 rakamı farklı!', en: 'One red number 1 is different!' },
    { idx: 1, tr: 'Bir turuncu 2 rakamı farklı!', en: 'One orange number 2 is different!' },
    { idx: 2, tr: 'Bir sarı 3 rakamı farklı!', en: 'One yellow number 3 is different!' },
    { idx: 3, tr: 'Bir yeşil 4 rakamı farklı!', en: 'One green number 4 is different!' },
    { idx: 4, tr: 'Bir mavi 5 rakamı farklı!', en: 'One blue number 5 is different!' },
    { idx: 5, tr: 'Bir mor 6 rakamı farklı!', en: 'One purple number 6 is different!' },
    { idx: 6, tr: 'Bir pembe 7 rakamı farklı!', en: 'One pink number 7 is different!' },
    { idx: 7, tr: 'Bir turkuaz 8 rakamı farklı!', en: 'One teal number 8 is different!' },
    { idx: 8, tr: 'Bir yeşil 9 rakamı farklı!', en: 'One green number 9 is different!' },
    { idx: 9, tr: 'Bir turuncu 0 rakamı farklı!', en: 'One orange number 0 is different!' },
    { idx: 10, tr: 'Bir mavi 1 rakamı farklı!', en: 'One blue number 1 is different!' },
    { idx: 11, tr: 'Bir yeşil 2 rakamı farklı!', en: 'One green number 2 is different!' },
    { idx: 12, tr: 'Bir mor 3 rakamı farklı!', en: 'One purple number 3 is different!' },
    { idx: 13, tr: 'Bir turuncu 4 rakamı farklı!', en: 'One orange number 4 is different!' },
    { idx: 14, tr: 'Bir pembe 5 rakamı farklı!', en: 'One pink number 5 is different!' },
    { idx: 15, tr: 'Bir yeşil 6 rakamı farklı!', en: 'One green number 6 is different!' },
    { idx: 16, tr: 'Bir sarı 7 rakamı farklı!', en: 'One yellow number 7 is different!' },
    { idx: 17, tr: 'Bir mavi 8 rakamı farklı!', en: 'One blue number 8 is different!' },
    { idx: 18, tr: 'Bir kırmızı 9 rakamı farklı!', en: 'One red number 9 is different!' },
    { idx: 19, tr: 'Uzman seviye: Farklı mor 0 rakamını bul!', en: 'Master level: Spot the different purple 0!' },
  ],
  letters: [
    { idx: 0, tr: 'Bir A harfi farklı!', en: 'One letter A is different!' },
    { idx: 1, tr: 'Bir B harfi farklı!', en: 'One letter B is different!' },
    { idx: 2, tr: 'Bir C harfi farklı!', en: 'One letter C is different!' },
    { idx: 3, tr: 'Bir Ç harfi farklı!', en: 'One letter Ç is different!' },
    { idx: 4, tr: 'Bir D harfi farklı!', en: 'One letter D is different!' },
    { idx: 5, tr: 'Bir E harfi farklı!', en: 'One letter E is different!' },
    { idx: 6, tr: 'Bir F harfi farklı!', en: 'One letter F is different!' },
    { idx: 7, tr: 'Bir G harfi farklı!', en: 'One letter G is different!' },
    { idx: 8, tr: 'Bir Ğ harfi farklı!', en: 'One letter Ğ is different!' },
    { idx: 9, tr: 'Bir H harfi farklı!', en: 'One letter H is different!' },
    { idx: 10, tr: 'Bir İ harfi farklı!', en: 'One letter İ is different!' },
    { idx: 11, tr: 'Bir J harfi farklı!', en: 'One letter J is different!' },
    { idx: 12, tr: 'Bir K harfi farklı!', en: 'One letter K is different!' },
    { idx: 13, tr: 'Bir L harfi farklı!', en: 'One letter L is different!' },
    { idx: 14, tr: 'Bir M harfi farklı!', en: 'One letter M is different!' },
    { idx: 15, tr: 'Bir N harfi farklı!', en: 'One letter N is different!' },
    { idx: 16, tr: 'Bir O harfi farklı!', en: 'One letter O is different!' },
    { idx: 17, tr: 'Bir Ö harfi farklı!', en: 'One letter Ö is different!' },
    { idx: 18, tr: 'Bir P harfi farklı!', en: 'One letter P is different!' },
    { idx: 19, tr: 'Uzman seviye: Farklı R harfini bul!', en: 'Master level: Spot the different letter R!' },
  ],
};

export const getLevelSpec = (category: FarkliCategoryId, level: number): LevelSpec => {
  const safeLevel = Math.max(1, Math.min(20, level));
  const { cols, rows, timeLimit } = getGridForLevel(safeLevel);
  const pairs = CATEGORY_LEVEL_PAIRS[category] || CATEGORY_LEVEL_PAIRS.faces;
  const pair = pairs[(safeLevel - 1) % pairs.length];

  return {
    level: safeLevel,
    cols,
    rows,
    timeLimit,
    baseSrc: baseIconPath(category, pair.idx),
    oddSrc: oddIconPath(category, pair.idx),
    oddTransform: 'none',
    diffLabel: pair.tr,
    diffLabelEn: pair.en,
  };
};

const FALLBACK_EMBLEMS: Record<FarkliCategoryId, string> = {
  faces: '😺', animals: '🦁', fruits: '🍎', vehicles: '🚗', numbers: '🔢', letters: '🔤',
};
const FALLBACK_TILES: Record<FarkliCategoryId, string[]> = {
  faces: ['🐱','🐶','🐰','🐼','🦊','🦁','🐧','🐸','🦝','🦝','🐑','🐥','🐻','🐘','🦒','🐬','🐢','🦆','🦉','🦔'],
  animals: ['🦁','🐘','🦓','🦒','🐅','🐬','🐋','🐙','🐒','🐧','🐼','🦊','🦌','🐊','🦜','🐓','🐔','🦆','🐢','🐸'],
  fruits: ['🍎','🍌','🍊','🍇','🍓','🍐','🍉','🍒','🍍','🍊','🫐','🥝','🍑','🍎','🍋','🍏','🍉','🍓','🫐','🍇'],
  vehicles: ['🚗','🚌','🚕','🚒','🚓','🚑','🚚','🚜','🏍️','🚲','🚂','🚆','🚀','✈️','🚁','🎈','⛵','🚢','🚚','🚌'],
  numbers: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','0️⃣'],
  letters: ['A','B','C','Ç','D','E','F','G','Ğ','H','İ','J','K','L','M','N','O','Ö','P','R'],
};

export const CategoryEmblem: React.FC<{ category: FarkliCategoryId }> = ({ category }) => {
  const meta = FARKLI_CATEGORIES.find(c => c.id === category) || FARKLI_CATEGORIES[0];
  const [failed, setFailed] = useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [meta.emblemSrc]);

  if (failed) return <span aria-hidden="true" className="text-4xl leading-none">{FALLBACK_EMBLEMS[category]}</span>;
  return <img src={meta.emblemSrc} alt={meta.title} draggable={false} onError={() => setFailed(true)} className="w-full h-full object-contain select-none pointer-events-none" />;
};

export const TileArtwork: React.FC<{
  category: FarkliCategoryId;
  spec: LevelSpec;
  isOdd: boolean;
}> = ({ category, spec, isOdd }) => {
  const src = isOdd ? spec.oddSrc : spec.baseSrc;
  const [failed, setFailed] = useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  const transformStyle: React.CSSProperties | undefined = isOdd
    ? spec.oddTransform === 'flipX'
      ? { transform: 'scaleX(-1)' }
      : spec.oddTransform === 'hueShift'
        ? { filter: 'hue-rotate(165deg) saturate(1.45)' }
        : undefined
    : undefined;

  const imageIndex = Number(src.match(/_(\d+)\.webp$/)?.[1] || 0);
  if (failed) {
    const options = FALLBACK_TILES[category];
    return <span aria-hidden="true" style={transformStyle} className="text-[clamp(2rem,7vw,5rem)] leading-none select-none">{options[imageIndex % options.length]}</span>;
  }
  return <img src={src} alt="" draggable={false} onError={() => setFailed(true)} style={transformStyle} className="w-full h-full object-contain select-none pointer-events-none" />;
};
