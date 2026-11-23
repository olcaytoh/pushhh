import React, { useId } from 'react';

export type FarkliCategoryId =
  | 'cats'
  | 'animals'
  | 'emojis'
  | 'fruits'
  | 'vehicles'
  | 'numbers'
  | 'letters';

export interface FarkliCategoryMeta {
  id: FarkliCategoryId;
  title: string;
  description: string;
  cardBg: string;
  topBarGradient: string;
  borderColor: string;
  accentText: string;
  accentBtn: string;
  iconBg: string;
  totalLevels: number;
}

export const FARKLI_CATEGORIES: FarkliCategoryMeta[] = [
  {
    id: 'cats',
    title: 'Kediler',
    description: 'Bir bıyık eksik, bir göz ışıltısı kayıp. Dikkatle bak.',
    cardBg: 'bg-[#0e172a]',
    topBarGradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    borderColor: 'border-rose-400/80 hover:border-rose-300',
    accentText: 'text-rose-300',
    accentBtn: 'bg-rose-500 group-hover:bg-rose-400 text-white',
    iconBg: 'bg-gradient-to-br from-rose-50 to-pink-100',
    totalLevels: 20,
  },
  {
    id: 'animals',
    title: 'Hayvanlar',
    description: 'Sevimli hayvanlardan birinin küçük bir ayrıntısı eksik.',
    cardBg: 'bg-[#12162b]',
    topBarGradient: 'from-violet-500 via-purple-500 to-indigo-500',
    borderColor: 'border-purple-400/80 hover:border-purple-300',
    accentText: 'text-purple-300',
    accentBtn: 'bg-purple-500 group-hover:bg-purple-400 text-white',
    iconBg: 'bg-gradient-to-br from-purple-50 to-indigo-100',
    totalLevels: 20,
  },
  {
    id: 'emojis',
    title: 'Emojiler',
    description: 'Renkli yüzlerden birinde küçük bir çizgi veya parıltı eksik.',
    cardBg: 'bg-[#171625]',
    topBarGradient: 'from-amber-400 via-yellow-400 to-orange-400',
    borderColor: 'border-amber-400/80 hover:border-amber-300',
    accentText: 'text-amber-300',
    accentBtn: 'bg-amber-400 group-hover:bg-amber-300 text-slate-950',
    iconBg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    totalLevels: 20,
  },
  {
    id: 'fruits',
    title: 'Meyveler',
    description: 'Sap, yaprak, damla veya çekirdek — biri diğerine uymuyor.',
    cardBg: 'bg-[#0d1d1f]',
    topBarGradient: 'from-emerald-400 via-teal-400 to-lime-400',
    borderColor: 'border-emerald-400/80 hover:border-emerald-300',
    accentText: 'text-emerald-300',
    accentBtn: 'bg-emerald-500 group-hover:bg-emerald-400 text-slate-950',
    iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    totalLevels: 20,
  },
  {
    id: 'vehicles',
    title: 'Araçlar',
    description: 'Far, pervane, pencere veya siren ayrıntısı eksik olanı bul.',
    cardBg: 'bg-[#1a151b]',
    topBarGradient: 'from-orange-500 via-amber-500 to-red-500',
    borderColor: 'border-orange-400/80 hover:border-orange-300',
    accentText: 'text-orange-300',
    accentBtn: 'bg-orange-500 group-hover:bg-orange-400 text-white',
    iconBg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    totalLevels: 20,
  },
  {
    id: 'numbers',
    title: 'Rakamlar',
    description: 'Birbirine çok benzeyen rakamlardan farklı olanı bul.',
    cardBg: 'bg-[#0b192c]',
    topBarGradient: 'from-sky-400 via-cyan-400 to-blue-500',
    borderColor: 'border-sky-400/80 hover:border-sky-300',
    accentText: 'text-sky-300',
    accentBtn: 'bg-sky-500 group-hover:bg-sky-400 text-white',
    iconBg: 'bg-gradient-to-br from-sky-50 to-cyan-100',
    totalLevels: 20,
  },
  {
    id: 'letters',
    title: 'Harfler',
    description: 'Karışan harfler arasından farklı olanı hemen yakala.',
    cardBg: 'bg-[#15122b]',
    topBarGradient: 'from-indigo-400 via-violet-500 to-fuchsia-500',
    borderColor: 'border-indigo-400/80 hover:border-indigo-300',
    accentText: 'text-indigo-300',
    accentBtn: 'bg-indigo-500 group-hover:bg-indigo-400 text-white',
    iconBg: 'bg-gradient-to-br from-indigo-50 to-violet-100',
    totalLevels: 20,
  },
];

export interface LevelSpec {
  level: number;
  cols: number;
  rows: number;
  timeLimit: number;
  variant: string;
  diffKey: string;
  diffLabel: string;
  normalText?: string;
  oddText?: string;
}

const getGridForLevel = (level: number): { cols: number; rows: number; timeLimit: number } => {
  if (level <= 2) return { cols: 3, rows: 3, timeLimit: 32 };
  if (level <= 4) return { cols: 4, rows: 3, timeLimit: 36 };
  if (level <= 7) return { cols: 5, rows: 3, timeLimit: 40 };
  if (level <= 10) return { cols: 5, rows: 4, timeLimit: 44 };
  if (level <= 13) return { cols: 6, rows: 4, timeLimit: 46 };
  if (level <= 16) return { cols: 6, rows: 5, timeLimit: 50 };
  if (level <= 18) return { cols: 7, rows: 5, timeLimit: 54 };
  return { cols: 7, rows: 6, timeLimit: 58 };
};

interface GraphicRecipe {
  variant: string;
  diffKey: string;
  diffLabel: string;
}

const CAT_RECIPES: GraphicRecipe[] = [
  { variant: 'mint_astro_cat', diffKey: 'missing_star', diffLabel: 'Alındaki altın yıldız eksik!' },
  { variant: 'lavender_bowtie_cat', diffKey: 'missing_bowtie_gem', diffLabel: 'Papyonun orta taşı eksik!' },
  { variant: 'berry_ribbon_cat', diffKey: 'missing_ribbon_dot', diffLabel: 'Kurdeledeki beyaz benek eksik!' },
  { variant: 'sky_captain_cat', diffKey: 'missing_cap_badge', diffLabel: 'Kaptan şapkasındaki rozet eksik!' },
  { variant: 'honey_glasses_cat', diffKey: 'missing_lens_glare', diffLabel: 'Sağ gözlük camı parıltısı eksik!' },
  { variant: 'mint_astro_cat', diffKey: 'missing_whisker_r', diffLabel: 'Sağ alt bıyık eksik!' },
  { variant: 'lavender_bowtie_cat', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
  { variant: 'berry_ribbon_cat', diffKey: 'missing_blush_r', diffLabel: 'Sağ yanak allığı eksik!' },
  { variant: 'sky_captain_cat', diffKey: 'missing_whisker_l', diffLabel: 'Sol üst bıyık eksik!' },
  { variant: 'honey_glasses_cat', diffKey: 'missing_bridge', diffLabel: 'Gözlük köprüsü eksik!' },
  { variant: 'mint_astro_cat', diffKey: 'missing_bell', diffLabel: 'Tasma zili eksik!' },
  { variant: 'lavender_bowtie_cat', diffKey: 'missing_ear_inner', diffLabel: 'Sağ kulak içi pembe eksik!' },
  { variant: 'berry_ribbon_cat', diffKey: 'missing_eyelash', diffLabel: 'Sağ kirpik çizgisi eksik!' },
  { variant: 'sky_captain_cat', diffKey: 'missing_eye_spark', diffLabel: 'Sol göz ışıltısı eksik!' },
  { variant: 'honey_glasses_cat', diffKey: 'missing_scarf_stripe', diffLabel: 'Atkı çizgisi eksik!' },
  { variant: 'mint_astro_cat', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz ışıltısı eksik!' },
  { variant: 'lavender_bowtie_cat', diffKey: 'missing_whisker_r', diffLabel: 'Sağ alt bıyık eksik!' },
  { variant: 'berry_ribbon_cat', diffKey: 'missing_nose_shine', diffLabel: 'Burun parıltısı eksik!' },
  { variant: 'sky_captain_cat', diffKey: 'missing_cap_stripe', diffLabel: 'Şapka altın şeridi eksik!' },
  { variant: 'honey_glasses_cat', diffKey: 'missing_whisker_l', diffLabel: 'Sol alt bıyık eksik!' },
];

const ANIMAL_RECIPES: GraphicRecipe[] = [
  { variant: 'koala_3d', diffKey: 'missing_leaf', diffLabel: 'Yeşil yaprak eksik!' },
  { variant: 'penguin_3d', diffKey: 'missing_pom', diffLabel: 'Bere ponponu eksik!' },
  { variant: 'bunny_3d', diffKey: 'missing_ear_pink', diffLabel: 'Sağ kulak içi pembe eksik!' },
  { variant: 'lion_3d', diffKey: 'missing_mane_dot', diffLabel: 'Üst yele kıvrımı eksik!' },
  { variant: 'duck_3d', diffKey: 'missing_crown_gem', diffLabel: 'Taçtaki elmas eksik!' },
  { variant: 'koala_3d', diffKey: 'missing_nose_shine', diffLabel: 'Burun parıltısı eksik!' },
  { variant: 'penguin_3d', diffKey: 'missing_scarf_tail', diffLabel: 'Atkı ucu eksik!' },
  { variant: 'bunny_3d', diffKey: 'missing_blush_r', diffLabel: 'Sağ yanak pembesi eksik!' },
  { variant: 'lion_3d', diffKey: 'missing_whisker_r', diffLabel: 'Sağ bıyık çizgisi eksik!' },
  { variant: 'duck_3d', diffKey: 'missing_droplet', diffLabel: 'Su damlası eksik!' },
  { variant: 'koala_3d', diffKey: 'missing_ear_inner', diffLabel: 'Sağ kulak içi beyaz eksik!' },
  { variant: 'penguin_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
  { variant: 'bunny_3d', diffKey: 'missing_tooth', diffLabel: 'Sevimli tavşan dişi eksik!' },
  { variant: 'lion_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sol göz ışıltısı eksik!' },
  { variant: 'duck_3d', diffKey: 'missing_blush_l', diffLabel: 'Sol yanak pembesi eksik!' },
  { variant: 'koala_3d', diffKey: 'missing_blush_r', diffLabel: 'Sağ yanak pembesi eksik!' },
  { variant: 'penguin_3d', diffKey: 'missing_beak_shine', diffLabel: 'Gaga parıltısı eksik!' },
  { variant: 'bunny_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
  { variant: 'lion_3d', diffKey: 'missing_nose_shine', diffLabel: 'Burun ışığı eksik!' },
  { variant: 'duck_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
];

const EMOJI_RECIPES: GraphicRecipe[] = [
  { variant: 'sun_wink_3d', diffKey: 'missing_blush_r', diffLabel: 'Sağ yanak allığı eksik!' },
  { variant: 'aqua_cool_3d', diffKey: 'missing_lens_glare', diffLabel: 'Sağ gözlük yansıması eksik!' },
  { variant: 'coral_spark_3d', diffKey: 'missing_tongue', diffLabel: 'Pembe dil detayı eksik!' },
  { variant: 'mint_propeller_3d', diffKey: 'missing_propeller_knob', diffLabel: 'Pervane düğmesi eksik!' },
  { variant: 'violet_crown_3d', diffKey: 'missing_crown_gem', diffLabel: 'Taçtaki orta taş eksik!' },
  { variant: 'sun_wink_3d', diffKey: 'missing_eyebrow_l', diffLabel: 'Sol kaş eksik!' },
  { variant: 'aqua_cool_3d', diffKey: 'missing_bridge', diffLabel: 'Gözlük köprüsü eksik!' },
  { variant: 'coral_spark_3d', diffKey: 'missing_right_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
  { variant: 'mint_propeller_3d', diffKey: 'missing_blush_l', diffLabel: 'Sol yanak pembesi eksik!' },
  { variant: 'violet_crown_3d', diffKey: 'missing_cheek_star', diffLabel: 'Sağ yanak yıldızı eksik!' },
  { variant: 'sun_wink_3d', diffKey: 'missing_eyelash', diffLabel: 'Göz kırpan kirpik eksik!' },
  { variant: 'aqua_cool_3d', diffKey: 'missing_smirk_dimple', diffLabel: 'Gülümseme gamzesi eksik!' },
  { variant: 'coral_spark_3d', diffKey: 'missing_eyebrow_r', diffLabel: 'Sağ kaş eksik!' },
  { variant: 'mint_propeller_3d', diffKey: 'missing_hat_stripe', diffLabel: 'Şapka şeridi eksik!' },
  { variant: 'violet_crown_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sol göz ışıltısı eksik!' },
  { variant: 'sun_wink_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sol göz parıltısı eksik!' },
  { variant: 'aqua_cool_3d', diffKey: 'missing_eyebrow_r', diffLabel: 'Sağ kaş eksik!' },
  { variant: 'coral_spark_3d', diffKey: 'missing_blush_r', diffLabel: 'Sağ yanak allığı eksik!' },
  { variant: 'mint_propeller_3d', diffKey: 'missing_eye_spark', diffLabel: 'Sağ göz parıltısı eksik!' },
  { variant: 'violet_crown_3d', diffKey: 'missing_blush_l', diffLabel: 'Sol yanak yıldızı eksik!' },
];

const FRUIT_RECIPES: GraphicRecipe[] = [
  { variant: 'pear_3d', diffKey: 'missing_leaf_vein', diffLabel: 'Yaprak damarı eksik!' },
  { variant: 'orange_3d', diffKey: 'missing_second_leaf', diffLabel: 'İkinci küçük yaprak eksik!' },
  { variant: 'grape_3d', diffKey: 'missing_bottom_shine', diffLabel: 'Alt üzüm tanesi parıltısı eksik!' },
  { variant: 'kiwi_3d', diffKey: 'missing_seed_top', diffLabel: 'Üstteki kivi çekirdeği eksik!' },
  { variant: 'peach_3d', diffKey: 'missing_droplet', diffLabel: 'Su damlası eksik!' },
  { variant: 'pear_3d', diffKey: 'missing_shine', diffLabel: 'Armut parıltısı eksik!' },
  { variant: 'orange_3d', diffKey: 'missing_pore_dots', diffLabel: 'Portakal kabuğu benekleri eksik!' },
  { variant: 'grape_3d', diffKey: 'missing_tendril', diffLabel: 'Asma kıvrımı eksik!' },
  { variant: 'kiwi_3d', diffKey: 'missing_seed_right', diffLabel: 'Sağ kivi çekirdeği eksik!' },
  { variant: 'peach_3d', diffKey: 'missing_leaf_vein', diffLabel: 'Yaprak çizgisi eksik!' },
  { variant: 'pear_3d', diffKey: 'missing_droplet', diffLabel: 'Parlak su damlası eksik!' },
  { variant: 'orange_3d', diffKey: 'missing_shine', diffLabel: 'Portakal parıltısı eksik!' },
  { variant: 'grape_3d', diffKey: 'missing_center_shine', diffLabel: 'Orta üzüm parıltısı eksik!' },
  { variant: 'kiwi_3d', diffKey: 'missing_inner_ring', diffLabel: 'İç çekirdek halkası farklı!' },
  { variant: 'peach_3d', diffKey: 'missing_shine', diffLabel: 'Şeftali parıltısı eksik!' },
  { variant: 'pear_3d', diffKey: 'missing_stem_tip', diffLabel: 'Sap ucu kısa!' },
  { variant: 'orange_3d', diffKey: 'missing_leaf_vein', diffLabel: 'Yaprak damarı eksik!' },
  { variant: 'grape_3d', diffKey: 'missing_leaf', diffLabel: 'Üst yaprak eksik!' },
  { variant: 'kiwi_3d', diffKey: 'missing_seed_left', diffLabel: 'Sol kivi çekirdeği eksik!' },
  { variant: 'peach_3d', diffKey: 'missing_blush_dot', diffLabel: 'Parıltı noktası eksik!' },
];

const VEHICLE_RECIPES: GraphicRecipe[] = [
  { variant: 'helicopter_3d', diffKey: 'missing_tail_rotor', diffLabel: 'Kuyruk pervanesi eksik!' },
  { variant: 'submarine_3d', diffKey: 'missing_periscope', diffLabel: 'Periskop camı eksik!' },
  { variant: 'balloon_3d', diffKey: 'missing_flame', diffLabel: 'Balon alevi eksik!' },
  { variant: 'tractor_3d', diffKey: 'missing_headlight', diffLabel: 'Ön far eksik!' },
  { variant: 'firetruck_3d', diffKey: 'missing_siren', diffLabel: 'Mavi siren lambası eksik!' },
  { variant: 'helicopter_3d', diffKey: 'missing_window_glare', diffLabel: 'Kokpit camı parıltısı eksik!' },
  { variant: 'submarine_3d', diffKey: 'missing_mid_porthole', diffLabel: 'Orta yuvarlak pencere eksik!' },
  { variant: 'balloon_3d', diffKey: 'missing_center_star', diffLabel: 'Balondaki yıldız eksik!' },
  { variant: 'tractor_3d', diffKey: 'missing_exhaust', diffLabel: 'Egzoz bacası eksik!' },
  { variant: 'firetruck_3d', diffKey: 'missing_ladder_rung', diffLabel: 'Merdiven basamağı eksik!' },
  { variant: 'helicopter_3d', diffKey: 'missing_stripe', diffLabel: 'Gövde şeridi eksik!' },
  { variant: 'submarine_3d', diffKey: 'missing_bubble', diffLabel: 'Su baloncuğu eksik!' },
  { variant: 'balloon_3d', diffKey: 'missing_basket_rope', diffLabel: 'Sağ sepet ipi eksik!' },
  { variant: 'tractor_3d', diffKey: 'missing_big_hub', diffLabel: 'Büyük teker göbeği eksik!' },
  { variant: 'firetruck_3d', diffKey: 'missing_headlight', diffLabel: 'Ön far eksik!' },
  { variant: 'helicopter_3d', diffKey: 'missing_rotor_cap', diffLabel: 'Üst pervane göbeği eksik!' },
  { variant: 'submarine_3d', diffKey: 'missing_propeller', diffLabel: 'Arka pervane eksik!' },
  { variant: 'balloon_3d', diffKey: 'missing_shine', diffLabel: 'Balon parıltısı eksik!' },
  { variant: 'tractor_3d', diffKey: 'missing_small_hub', diffLabel: 'Ön jant kapağı eksik!' },
  { variant: 'firetruck_3d', diffKey: 'missing_wheel_hub', diffLabel: 'Ön teker göbeği eksik!' },
];

const NUMBER_PAIRS: Array<{ normal: string; odd: string; label: string }> = [
  { normal: '6', odd: '9', label: '6 yerine 9 yazıyor!' },
  { normal: '3', odd: '8', label: '3 yerine 8 yazıyor!' },
  { normal: '5', odd: '2', label: '5 yerine 2 yazıyor!' },
  { normal: '7', odd: '1', label: '7 yerine 1 yazıyor!' },
  { normal: '8', odd: '0', label: '8 yerine 0 yazıyor!' },
  { normal: '68', odd: '86', label: '68 yerine 86 yazıyor!' },
  { normal: '35', odd: '53', label: '35 yerine 53 yazıyor!' },
  { normal: '96', odd: '69', label: '96 yerine 69 yazıyor!' },
  { normal: '88', odd: '80', label: '88 yerine 80 yazıyor!' },
  { normal: '55', odd: '56', label: '55 yerine 56 yazıyor!' },
  { normal: '71', odd: '17', label: '71 yerine 17 yazıyor!' },
  { normal: '24', odd: '27', label: '24 yerine 27 yazıyor!' },
  { normal: '83', odd: '88', label: '83 yerine 88 yazıyor!' },
  { normal: '90', odd: '60', label: '90 yerine 60 yazıyor!' },
  { normal: '118', odd: '113', label: '118 yerine 113 yazıyor!' },
  { normal: '558', odd: '556', label: '558 yerine 556 yazıyor!' },
  { normal: '808', odd: '888', label: '808 yerine 888 yazıyor!' },
  { normal: '696', odd: '666', label: '696 yerine 666 yazıyor!' },
  { normal: '383', odd: '333', label: '383 yerine 333 yazıyor!' },
  { normal: '8808', odd: '8888', label: '8808 yerine 8888 yazıyor!' },
];

const LETTER_PAIRS: Array<{ normal: string; odd: string; label: string }> = [
  { normal: 'b', odd: 'd', label: 'b yerine d harfi var!' },
  { normal: 'p', odd: 'q', label: 'p yerine q harfi var!' },
  { normal: 'O', odd: 'Ö', label: 'O yerine Ö harfi var!' },
  { normal: 'C', odd: 'Ç', label: 'C yerine Ç harfi var!' },
  { normal: 'S', odd: 'Ş', label: 'S yerine Ş harfi var!' },
  { normal: 'U', odd: 'Ü', label: 'U yerine Ü harfi var!' },
  { normal: 'G', odd: 'Ğ', label: 'G yerine Ğ harfi var!' },
  { normal: 'I', odd: 'İ', label: 'I yerine İ harfi var!' },
  { normal: 'm', odd: 'n', label: 'm yerine n harfi var!' },
  { normal: 'E', odd: 'F', label: 'E yerine F harfi var!' },
  { normal: 'M', odd: 'N', label: 'M yerine N harfi var!' },
  { normal: 'R', odd: 'P', label: 'R yerine P harfi var!' },
  { normal: 'Q', odd: 'O', label: 'Q yerine O harfi var!' },
  { normal: 'B', odd: 'R', label: 'B yerine R harfi var!' },
  { normal: 'bb', odd: 'bd', label: 'bb yerine bd yazıyor!' },
  { normal: 'ŞŞ', odd: 'ŞS', label: 'ŞŞ yerine ŞS yazıyor!' },
  { normal: 'ÖÖ', odd: 'ÖO', label: 'ÖÖ yerine ÖO yazıyor!' },
  { normal: 'rn', odd: 'm', label: 'rn yerine m yazıyor!' },
  { normal: 'İİİ', odd: 'İIİ', label: 'Ortadaki harf noktasız I!' },
  { normal: 'ĞĞĞ', odd: 'ĞGĞ', label: 'Ortadaki harf G!' },
];

export const getLevelSpec = (category: FarkliCategoryId, level: number): LevelSpec => {
  const safeLevel = Math.max(1, Math.min(20, level));
  const idx = safeLevel - 1;
  const grid = getGridForLevel(safeLevel);

  if (category === 'numbers') {
    const pair = NUMBER_PAIRS[idx % NUMBER_PAIRS.length];
    return {
      level: safeLevel,
      ...grid,
      variant: 'number',
      diffKey: 'odd_text',
      diffLabel: pair.label,
      normalText: pair.normal,
      oddText: pair.odd,
    };
  }

  if (category === 'letters') {
    const pair = LETTER_PAIRS[idx % LETTER_PAIRS.length];
    return {
      level: safeLevel,
      ...grid,
      variant: 'letter',
      diffKey: 'odd_text',
      diffLabel: pair.label,
      normalText: pair.normal,
      oddText: pair.odd,
    };
  }

  const map: Record<'cats' | 'animals' | 'emojis' | 'fruits' | 'vehicles', GraphicRecipe[]> = {
    cats: CAT_RECIPES,
    animals: ANIMAL_RECIPES,
    emojis: EMOJI_RECIPES,
    fruits: FRUIT_RECIPES,
    vehicles: VEHICLE_RECIPES,
  };
  const recipe = map[category][idx % 20];
  return {
    level: safeLevel,
    ...grid,
    variant: recipe.variant,
    diffKey: recipe.diffKey,
    diffLabel: recipe.diffLabel,
  };
};

// =========================================================================
// 100% ÖZGÜN, CANLI VE PARLAK 3D GÖLGELENDİRMELİ VEKTÖR KARAKTER MOTORU
// =========================================================================

const renderCat3D = (variant: string, diff: string | null, uid: string) => {
  if (variant === 'mint_astro_cat') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="52%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
          <radialGradient id={`${uid}-ear`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#ec4899" />
          </radialGradient>
          <radialGradient id={`${uid}-bell`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        {/* Yumuşak zemin gölgesi */}
        <ellipse cx="50" cy="89" rx="28" ry="5" fill="#0f172a" opacity="0.14" />
        {/* 3D Kulaklar & Kafa */}
        <path
          d="M22 44 C19 30 19 16 26 16 C33 16 40 25 43 29 Q50 27 57 29 C60 25 67 16 74 16 C81 16 81 30 78 44 C84 56 80 74 68 80 C62 83 56 84 50 84 C44 84 38 83 32 80 C20 74 16 56 22 44 Z"
          fill={`url(#${uid}-fur)`}
          stroke="#115e59"
          strokeWidth="2.4"
        />
        {/* 3D Üst Parlama */}
        <ellipse cx="42" cy="36" rx="18" ry="8" fill="#ffffff" opacity="0.35" />
        {/* Kulak içleri */}
        <path d="M25 23 C29 22 35 28 36 33 C31 35 26 35 25 23 Z" fill={`url(#${uid}-ear)`} />
        <path d="M75 23 C71 22 65 28 64 33 C69 35 74 35 75 23 Z" fill={`url(#${uid}-ear)`} />
        {/* Alındaki 3D Altın Yıldız */}
        {diff !== 'missing_star' && (
          <polygon
            points="50,30 52.3,35.5 58,36 53.5,39.8 54.8,45.5 50,42.3 45.2,45.5 46.5,39.8 42,36 47.7,35.5"
            fill="#fde047"
            stroke="#b45309"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
        {/* İri 3D Parlak Gözler */}
        <circle cx="36" cy="54" r="9" fill="#0f172a" />
        <circle cx="36" cy="55" r="6" fill="#312e81" />
        <circle cx="33" cy="50.5" r="3.1" fill="#ffffff" />
        <circle cx="39" cy="57" r="1.4" fill="#ffffff" opacity="0.8" />
        <circle cx="64" cy="54" r="9" fill="#0f172a" />
        <circle cx="64" cy="55" r="6" fill="#312e81" />
        {diff !== 'missing_eye_spark' && <circle cx="61" cy="50.5" r="3.1" fill="#ffffff" />}
        <circle cx="67" cy="57" r="1.4" fill="#ffffff" opacity="0.8" />
        {/* Pembe 3D Yanaklar */}
        <ellipse cx="26" cy="64" rx="6" ry="3.6" fill="#f472b6" opacity="0.65" />
        <ellipse cx="74" cy="64" rx="6" ry="3.6" fill="#f472b6" opacity="0.65" />
        {/* 3D Pembe Burun & Gülüş */}
        <ellipse cx="50" cy="61" rx="4.5" ry="3.4" fill="#fb7185" stroke="#9f1239" strokeWidth="1.3" />
        <ellipse cx="48.8" cy="60" rx="1.6" ry="0.9" fill="#ffffff" opacity="0.8" />
        <path d="M43 67 Q46.5 72 50 67 Q53.5 72 57 67" fill="none" stroke="#134e4a" strokeWidth="2.8" strokeLinecap="round" />
        {/* Bıyıklar */}
        <line x1="23" y1="62" x2="10" y2="60" stroke="#115e59" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="24" y1="68" x2="11" y2="72" stroke="#115e59" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="77" y1="62" x2="90" y2="60" stroke="#115e59" strokeWidth="2.6" strokeLinecap="round" />
        {diff !== 'missing_whisker_r' && (
          <line x1="76" y1="68" x2="89" y2="72" stroke="#115e59" strokeWidth="2.6" strokeLinecap="round" />
        )}
        {/* Tasma ve 3D Zil */}
        <path d="M35 81 Q50 87 65 81" fill="none" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" />
        {diff !== 'missing_bell' && (
          <g>
            <circle cx="50" cy="86" r="5.2" fill={`url(#${uid}-bell)`} stroke="#92400e" strokeWidth="1.5" />
            <circle cx="48.5" cy="84.3" r="1.4" fill="#ffffff" opacity="0.85" />
          </g>
        )}
      </svg>
    );
  }

  if (variant === 'lavender_bowtie_cat') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="34%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="48%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </radialGradient>
          <radialGradient id={`${uid}-bow`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="90" rx="26" ry="4.5" fill="#0f172a" opacity="0.14" />
        <path
          d="M23 44 C20 30 21 15 28 16 C35 17 41 26 44 30 Q50 28 56 30 C59 26 65 17 72 16 C79 15 80 30 77 44 C83 56 79 74 67 80 C61 83 56 84 50 84 C44 84 39 83 33 80 C21 74 17 56 23 44 Z"
          fill={`url(#${uid}-fur)`}
          stroke="#581c87"
          strokeWidth="2.4"
        />
        <ellipse cx="44" cy="36" rx="17" ry="7" fill="#ffffff" opacity="0.38" />
        <path d="M27 23 C31 22 36 28 37 33 C32 34 27 34 27 23 Z" fill="#fbcfe8" />
        {diff !== 'missing_ear_inner' && (
          <path d="M73 23 C69 22 64 28 63 33 C68 34 73 34 73 23 Z" fill="#fbcfe8" />
        )}
        {/* Zümrüt Yeşil 3D Gözler */}
        <circle cx="36" cy="52" r="8.8" fill="#14532d" stroke="#581c87" strokeWidth="1.5" />
        <circle cx="36" cy="52" r="6.4" fill="#22c55e" />
        <circle cx="36" cy="52" r="3.8" fill="#0f172a" />
        <circle cx="33.5" cy="49" r="2.6" fill="#ffffff" />
        <circle cx="64" cy="52" r="8.8" fill="#14532d" stroke="#581c87" strokeWidth="1.5" />
        <circle cx="64" cy="52" r="6.4" fill="#22c55e" />
        <circle cx="64" cy="52" r="3.8" fill="#0f172a" />
        {diff !== 'missing_eye_spark' && <circle cx="61.5" cy="49" r="2.6" fill="#ffffff" />}
        {/* Burun & Ağız */}
        <ellipse cx="50" cy="61" rx="4.2" ry="3" fill="#f43f5e" />
        <path d="M43 66 Q46.5 71 50 66 Q53.5 71 57 66" fill="none" stroke="#4c1d95" strokeWidth="2.6" strokeLinecap="round" />
        {/* Bıyıklar */}
        <line x1="23" y1="60" x2="10" y2="58" stroke="#581c87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="67" x2="11" y2="71" stroke="#581c87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="60" x2="90" y2="58" stroke="#581c87" strokeWidth="2.5" strokeLinecap="round" />
        {diff !== 'missing_whisker_r' && (
          <line x1="76" y1="67" x2="89" y2="71" stroke="#581c87" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* 3D Altın Papyon */}
        <path d="M34 78 L50 85 L34 92 Q30 85 34 78 Z" fill={`url(#${uid}-bow)`} stroke="#92400e" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M66 78 L50 85 L66 92 Q70 85 66 78 Z" fill={`url(#${uid}-bow)`} stroke="#92400e" strokeWidth="1.8" strokeLinejoin="round" />
        {diff !== 'missing_bowtie_gem' && (
          <circle cx="50" cy="85" r="4.8" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.6" />
        )}
      </svg>
    );
  }

  if (variant === 'berry_ribbon_cat') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#ffe4e6" />
            <stop offset="50%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="89" rx="26" ry="4.5" fill="#0f172a" opacity="0.14" />
        <path
          d="M22 47 C19 33 21 19 28 20 C35 21 41 29 44 33 Q50 31 56 33 C59 29 65 21 72 20 C79 19 81 33 78 47 C83 59 79 76 67 82 C61 85 56 86 50 86 C44 86 39 85 33 82 C21 76 17 59 22 47 Z"
          fill={`url(#${uid}-fur)`}
          stroke="#881337"
          strokeWidth="2.4"
        />
        <ellipse cx="45" cy="39" rx="16" ry="6.5" fill="#ffffff" opacity="0.35" />
        {/* 3D Mavi Kurdele */}
        <g transform="translate(50 26)">
          <ellipse cx="-11" cy="0" rx="10" ry="6.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <ellipse cx="11" cy="0" rx="10" ry="6.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <circle cx="0" cy="0" r="5" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2" />
          {diff !== 'missing_ribbon_dot' && <circle cx="-11" cy="-1" r="2.2" fill="#ffffff" />}
          <circle cx="11" cy="-1" r="2.2" fill="#ffffff" />
        </g>
        {/* Parlak Gözler & Kirpik */}
        <circle cx="36" cy="56" r="8" fill="#1e1b4b" />
        <circle cx="33.5" cy="53" r="2.8" fill="#ffffff" />
        <line x1="29" y1="51" x2="24" y2="48" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="64" cy="56" r="8" fill="#1e1b4b" />
        <circle cx="61.5" cy="53" r="2.8" fill="#ffffff" />
        {diff !== 'missing_eyelash' && (
          <line x1="71" y1="51" x2="76" y2="48" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* Yanak Allığı */}
        <ellipse cx="26" cy="66" rx="6" ry="3.5" fill="#fde047" opacity="0.7" />
        {diff !== 'missing_blush_r' && <ellipse cx="74" cy="66" rx="6" ry="3.5" fill="#fde047" opacity="0.7" />}
        {/* Burun */}
        <ellipse cx="50" cy="64" rx="4.5" ry="3.3" fill="#881337" />
        {diff !== 'missing_nose_shine' && <ellipse cx="48.5" cy="63" rx="1.6" ry="0.9" fill="#ffffff" />}
        <path d="M43 71 Q50 77 57 71" fill="none" stroke="#881337" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'sky_captain_cat') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="90" rx="26" ry="4.5" fill="#0f172a" opacity="0.14" />
        {/* Kafa */}
        <path
          d="M23 48 C21 35 23 23 30 25 L41 34 Q50 32 59 34 L70 25 C77 23 79 35 77 48 C82 60 78 76 66 82 C60 85 55 86 50 86 C45 86 40 85 34 82 C22 76 18 60 23 48 Z"
          fill={`url(#${uid}-fur)`}
          stroke="#0c4a6e"
          strokeWidth="2.4"
        />
        {/* 3D Kaptan Şapkası */}
        <path d="M27 31 Q50 11 73 31 L69 38 Q50 32 31 38 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M31 35 Q50 30 69 35 L68 40 Q50 35 32 40 Z" fill="#1e3a8a" />
        {diff !== 'missing_cap_stripe' && (
          <path d="M34 36.5 Q50 32 66 36.5" fill="none" stroke="#facc15" strokeWidth="2.6" strokeLinecap="round" />
        )}
        {diff !== 'missing_cap_badge' && (
          <circle cx="50" cy="24" r="4.5" fill="#facc15" stroke="#b45309" strokeWidth="1.6" />
        )}
        {/* Gözler */}
        <circle cx="37" cy="56" r="8" fill="#0f172a" />
        {diff !== 'missing_eye_spark' && <circle cx="34.5" cy="53" r="2.8" fill="#ffffff" />}
        <circle cx="63" cy="56" r="8" fill="#0f172a" />
        <circle cx="60.5" cy="53" r="2.8" fill="#ffffff" />
        {/* Burun & Gülüş */}
        <ellipse cx="50" cy="64" rx="4.5" ry="3.2" fill="#f97316" stroke="#9a3412" strokeWidth="1.4" />
        <path d="M42 70 Q50 77 58 70" fill="none" stroke="#0c4a6e" strokeWidth="2.8" strokeLinecap="round" />
        {/* Bıyıklar */}
        {diff !== 'missing_whisker_l' && (
          <line x1="23" y1="62" x2="10" y2="60" stroke="#0c4a6e" strokeWidth="2.6" strokeLinecap="round" />
        )}
        <line x1="24" y1="69" x2="11" y2="73" stroke="#0c4a6e" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="77" y1="62" x2="90" y2="60" stroke="#0c4a6e" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="76" y1="69" x2="89" y2="73" stroke="#0c4a6e" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  }

  // honey_glasses_cat
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
      <defs>
        <radialGradient id={`${uid}-fur`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="90" rx="26" ry="4.5" fill="#0f172a" opacity="0.14" />
      <path
        d="M23 44 C20 30 21 16 28 17 C35 18 41 26 44 30 Q50 28 56 30 C59 26 65 18 72 17 C79 16 80 30 77 44 C83 56 79 74 67 80 C61 83 56 84 50 84 C44 84 39 83 33 80 C21 74 17 56 23 44 Z"
        fill={`url(#${uid}-fur)`}
        stroke="#854d0e"
        strokeWidth="2.4"
      />
      <ellipse cx="45" cy="36" rx="16" ry="6.5" fill="#ffffff" opacity="0.4" />
      {/* 3D Yuvarlak Bilgin Gözlüğü */}
      <circle cx="35" cy="52" r="12" fill="#e0f2fe" fillOpacity="0.65" stroke="#1e293b" strokeWidth="3.2" />
      <circle cx="65" cy="52" r="12" fill="#e0f2fe" fillOpacity="0.65" stroke="#1e293b" strokeWidth="3.2" />
      {diff !== 'missing_bridge' && (
        <line x1="47" y1="52" x2="53" y2="52" stroke="#1e293b" strokeWidth="3.2" strokeLinecap="round" />
      )}
      <circle cx="35" cy="53" r="4.8" fill="#0f172a" />
      <circle cx="33" cy="50.8" r="1.8" fill="#ffffff" />
      <circle cx="65" cy="53" r="4.8" fill="#0f172a" />
      <circle cx="63" cy="50.8" r="1.8" fill="#ffffff" />
      <line x1="27" y1="46" x2="31" y2="43" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      {diff !== 'missing_lens_glare' && (
        <line x1="57" y1="46" x2="61" y2="43" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      )}
      {/* Burun & Ağız */}
      <ellipse cx="50" cy="64" rx="4" ry="2.8" fill="#ea580c" />
      <path d="M44 69 Q50 74 56 69" fill="none" stroke="#713f12" strokeWidth="2.6" strokeLinecap="round" />
      {/* Bıyıklar */}
      <line x1="22" y1="62" x2="10" y2="60" stroke="#854d0e" strokeWidth="2.4" strokeLinecap="round" />
      {diff !== 'missing_whisker_l' && (
        <line x1="23" y1="69" x2="11" y2="73" stroke="#854d0e" strokeWidth="2.4" strokeLinecap="round" />
      )}
      <line x1="78" y1="62" x2="90" y2="60" stroke="#854d0e" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="77" y1="69" x2="89" y2="73" stroke="#854d0e" strokeWidth="2.4" strokeLinecap="round" />
      {/* Kırmızı 3D Atkı */}
      <path d="M32 79 Q50 87 68 79 L65 89 Q50 94 35 89 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      {diff !== 'missing_scarf_stripe' && (
        <path d="M38 84 Q50 89 62 84" fill="none" stroke="#fde047" strokeWidth="2.8" strokeLinecap="round" />
      )}
    </svg>
  );
};

const renderAnimal3D = (variant: string, diff: string | null, uid: string) => {
  if (variant === 'koala_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="52%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="89" rx="28" ry="4.5" fill="#0f172a" opacity="0.14" />
        {/* Pofuduk 3D Kulaklar */}
        <circle cx="20" cy="40" r="15" fill={`url(#${uid}-fur)`} stroke="#334155" strokeWidth="2.4" />
        <circle cx="20" cy="40" r="8" fill="#f8fafc" />
        <circle cx="80" cy="40" r="15" fill={`url(#${uid}-fur)`} stroke="#334155" strokeWidth="2.4" />
        {diff !== 'missing_ear_inner' && <circle cx="80" cy="40" r="8" fill="#f8fafc" />}
        {/* Kafa */}
        <ellipse cx="50" cy="54" rx="31" ry="29" fill={`url(#${uid}-fur)`} stroke="#334155" strokeWidth="2.4" />
        <ellipse cx="43" cy="36" rx="16" ry="7" fill="#ffffff" opacity="0.35" />
        {/* Gözler */}
        <circle cx="35" cy="51" r="6.5" fill="#0f172a" />
        <circle cx="33" cy="48.5" r="2.3" fill="#ffffff" />
        <circle cx="65" cy="51" r="6.5" fill="#0f172a" />
        <circle cx="63" cy="48.5" r="2.3" fill="#ffffff" />
        {/* Yanaklar */}
        <ellipse cx="27" cy="63" rx="5.5" ry="3.4" fill="#fb7185" opacity="0.65" />
        {diff !== 'missing_blush_r' && <ellipse cx="73" cy="63" rx="5.5" ry="3.4" fill="#fb7185" opacity="0.65" />}
        {/* İri 3D Koala Burnu */}
        <ellipse cx="50" cy="58" rx="8.5" ry="11.5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        {diff !== 'missing_nose_shine' && <ellipse cx="47.5" cy="53" rx="2.6" ry="4" fill="#ffffff" opacity="0.45" />}
        <path d="M43 74 Q50 79 57 74" fill="none" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
        {/* Okaliptüs Yaprağı */}
        {diff !== 'missing_leaf' && (
          <path d="M58 75 Q74 68 82 79 Q69 87 58 75 Z" fill="#22c55e" stroke="#166534" strokeWidth="2" strokeLinejoin="round" />
        )}
      </svg>
    );
  }

  if (variant === 'penguin_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-body`} cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="48%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="91" rx="26" ry="4.5" fill="#0f172a" opacity="0.14" />
        {/* Bere ve Ponpon */}
        <path d="M30 33 Q50 13 70 33 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.2" />
        <rect x="27" y="29" width="46" height="7" rx="3.5" fill="#fde047" stroke="#b45309" strokeWidth="2" />
        {diff !== 'missing_pom' && (
          <circle cx="50" cy="15" r="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        )}
        {/* Gövde */}
        <ellipse cx="50" cy="60" rx="29" ry="30" fill={`url(#${uid}-body)`} stroke="#0f172a" strokeWidth="2.4" />
        {/* Beyaz Yüz & Karın */}
        <path d="M29 58 C29 44 41 42 50 48 C59 42 71 44 71 58 C71 76 62 86 50 86 C38 86 29 76 29 58 Z" fill="#f8fafc" />
        {/* Gözler */}
        <circle cx="38" cy="54" r="6.2" fill="#0f172a" />
        <circle cx="36" cy="51.8" r="2.2" fill="#ffffff" />
        <circle cx="62" cy="54" r="6.2" fill="#0f172a" />
        {diff !== 'missing_eye_spark' && <circle cx="60" cy="51.8" r="2.2" fill="#ffffff" />}
        {/* 3D Turuncu Gaga */}
        <path d="M41 61 Q50 56 59 61 L50 71 Z" fill="#f97316" stroke="#9a3412" strokeWidth="2" strokeLinejoin="round" />
        {diff !== 'missing_beak_shine' && <ellipse cx="48" cy="61.5" rx="3" ry="1.2" fill="#fef08a" />}
        {/* Atkı */}
        <path d="M28 76 Q50 83 72 76 L70 83 Q50 89 30 83 Z" fill="#10b981" stroke="#065f46" strokeWidth="1.8" />
        {diff !== 'missing_scarf_tail' && (
          <rect x="61" y="79" width="8" height="14" rx="3" fill="#10b981" stroke="#065f46" strokeWidth="1.8" />
        )}
      </svg>
    );
  }

  if (variant === 'bunny_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-fur`} cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="91" rx="25" ry="4" fill="#0f172a" opacity="0.14" />
        {/* Uzun 3D Kulaklar */}
        <ellipse cx="36" cy="27" rx="9" ry="22" transform="rotate(-10 36 27)" fill={`url(#${uid}-fur)`} stroke="#92400e" strokeWidth="2.2" />
        <ellipse cx="36" cy="28" rx="4.5" ry="14" transform="rotate(-10 36 28)" fill="#f9a8d4" />
        <ellipse cx="64" cy="27" rx="9" ry="22" transform="rotate(10 64 27)" fill={`url(#${uid}-fur)`} stroke="#92400e" strokeWidth="2.2" />
        {diff !== 'missing_ear_pink' && (
          <ellipse cx="64" cy="28" rx="4.5" ry="14" transform="rotate(10 64 28)" fill="#f9a8d4" />
        )}
        {/* Kafa */}
        <ellipse cx="50" cy="61" rx="31" ry="26" fill={`url(#${uid}-fur)`} stroke="#92400e" strokeWidth="2.4" />
        <ellipse cx="44" cy="46" rx="14" ry="5.5" fill="#ffffff" opacity="0.55" />
        {/* Gözler */}
        <circle cx="37" cy="58" r="6.8" fill="#1e1b4b" />
        <circle cx="34.8" cy="55.5" r="2.4" fill="#ffffff" />
        <circle cx="63" cy="58" r="6.8" fill="#1e1b4b" />
        {diff !== 'missing_eye_spark' && <circle cx="60.8" cy="55.5" r="2.4" fill="#ffffff" />}
        {/* Yanaklar */}
        <ellipse cx="27" cy="68" rx="5.5" ry="3.3" fill="#fb7185" opacity="0.65" />
        {diff !== 'missing_blush_r' && <ellipse cx="73" cy="68" rx="5.5" ry="3.3" fill="#fb7185" opacity="0.65" />}
        {/* Burun & Diş */}
        <ellipse cx="50" cy="66" rx="4.5" ry="3.2" fill="#f43f5e" />
        {diff !== 'missing_tooth' && (
          <rect x="46.5" y="72" width="7" height="6" rx="2" fill="#ffffff" stroke="#92400e" strokeWidth="1.6" />
        )}
        <path d="M42 71 Q46 75 50 71 Q54 75 58 71" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'lion_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-mane`} cx="35%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>
          <radialGradient id={`${uid}-face`} cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
        </defs>
        {/* 3D Katmanlı Yele */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
          if (diff === 'missing_mane_dot' && deg === 270) return null;
          const rad = (deg * Math.PI) / 180;
          const cx = 50 + Math.cos(rad) * 29;
          const cy = 52 + Math.sin(rad) * 29;
          return <circle key={idx} cx={cx} cy={cy} r="13" fill={`url(#${uid}-mane)`} stroke="#7c2d12" strokeWidth="2" />;
        })}
        {/* Yüz */}
        <circle cx="50" cy="52" r="27" fill={`url(#${uid}-face)`} stroke="#854d0e" strokeWidth="2.4" />
        <ellipse cx="44" cy="36" rx="13" ry="5.5" fill="#ffffff" opacity="0.4" />
        {/* Gözler */}
        <circle cx="39" cy="49" r="6" fill="#0f172a" />
        {diff !== 'missing_eye_spark' && <circle cx="37" cy="46.8" r="2.2" fill="#ffffff" />}
        <circle cx="61" cy="49" r="6" fill="#0f172a" />
        <circle cx="59" cy="46.8" r="2.2" fill="#ffffff" />
        {/* Burun */}
        <polygon points="44,56 56,56 50,63" fill="#9a3412" stroke="#7c2d12" strokeWidth="1.6" strokeLinejoin="round" />
        {diff !== 'missing_nose_shine' && <ellipse cx="49" cy="57.8" rx="2.2" ry="0.9" fill="#fed7aa" />}
        <path d="M43 66 Q50 72 57 66" fill="none" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
        {/* Bıyıklar */}
        <line x1="29" y1="60" x2="18" y2="59" stroke="#7c2d12" strokeWidth="2.3" strokeLinecap="round" />
        <line x1="71" y1="60" x2="82" y2="59" stroke="#7c2d12" strokeWidth="2.3" strokeLinecap="round" />
        {diff !== 'missing_whisker_r' && (
          <line x1="70" y1="65" x2="81" y2="68" stroke="#7c2d12" strokeWidth="2.3" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  // duck_3d
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
      <defs>
        <radialGradient id={`${uid}-duck`} cx="34%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="89" rx="27" ry="4.5" fill="#0f172a" opacity="0.14" />
      {/* Mini Taç */}
      <polygon points="37,28 40,12 50,20 60,12 63,28" fill="#f472b6" stroke="#9d174d" strokeWidth="2.2" strokeLinejoin="round" />
      {diff !== 'missing_crown_gem' && <circle cx="50" cy="22" r="3.2" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.4" />}
      {/* Kafa */}
      <circle cx="50" cy="56" r="31" fill={`url(#${uid}-duck)`} stroke="#a16207" strokeWidth="2.4" />
      <ellipse cx="42" cy="39" rx="14" ry="6" fill="#ffffff" opacity="0.45" />
      {/* Gözler */}
      <circle cx="36" cy="51" r="6.8" fill="#0f172a" />
      <circle cx="34" cy="48.5" r="2.4" fill="#ffffff" />
      <circle cx="64" cy="51" r="6.8" fill="#0f172a" />
      {diff !== 'missing_eye_spark' && <circle cx="62" cy="48.5" r="2.4" fill="#ffffff" />}
      {/* Yanaklar */}
      {diff !== 'missing_blush_l' && <ellipse cx="26" cy="61" rx="5.5" ry="3.4" fill="#fb7185" opacity="0.65" />}
      <ellipse cx="74" cy="61" rx="5.5" ry="3.4" fill="#fb7185" opacity="0.65" />
      {/* 3D Gaga */}
      <ellipse cx="50" cy="65" rx="14" ry="7.5" fill="#f97316" stroke="#9a3412" strokeWidth="2.2" />
      <ellipse cx="46" cy="62.5" rx="5" ry="1.8" fill="#fed7aa" opacity="0.7" />
      {/* Su Damlası */}
      {diff !== 'missing_droplet' && (
        <path d="M84 28 Q90 37 84 42 Q78 37 84 28 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.8" />
      )}
    </svg>
  );
};

const renderEmoji3D = (variant: string, diff: string | null, uid: string) => {
  if (variant === 'sun_wink_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-orb`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="48%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="51" r="37" fill={`url(#${uid}-orb)`} stroke="#92400e" strokeWidth="2.6" />
        <ellipse cx="40" cy="29" rx="18" ry="8" fill="#ffffff" opacity="0.45" />
        {diff !== 'missing_eyebrow_l' && (
          <path d="M27 36 Q35 30 43 35" fill="none" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
        )}
        <path d="M57 35 Q65 30 73 36" fill="none" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
        {/* Sol parlak göz */}
        <circle cx="35" cy="49" r="7.5" fill="#1e1b4b" />
        {diff !== 'missing_eye_spark' && <circle cx="32.5" cy="46.2" r="2.7" fill="#ffffff" />}
        {/* Sağ göz kırpma */}
        <path d="M56 50 Q64 42 72 50" fill="none" stroke="#1e1b4b" strokeWidth="3.8" strokeLinecap="round" />
        {diff !== 'missing_eyelash' && (
          <line x1="72" y1="48" x2="77" y2="44" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" />
        )}
        <ellipse cx="26" cy="60" rx="6" ry="3.8" fill="#fb7185" opacity="0.7" />
        {diff !== 'missing_blush_r' && <ellipse cx="74" cy="60" rx="6" ry="3.8" fill="#fb7185" opacity="0.7" />}
        <path d="M34 64 Q50 80 66 64" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'aqua_cool_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-orb`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#cffafe" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>
          <linearGradient id={`${uid}-lens`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="51" r="37" fill={`url(#${uid}-orb)`} stroke="#0c4a6e" strokeWidth="2.6" />
        <ellipse cx="40" cy="29" rx="18" ry="8" fill="#ffffff" opacity="0.42" />
        <path d="M25 32 Q34 28 42 32" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
        {diff !== 'missing_eyebrow_r' && (
          <path d="M58 32 Q66 28 75 32" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* 3D Neon Gözlük */}
        <rect x="19" y="38" width="27" height="19" rx="7" fill={`url(#${uid}-lens)`} stroke="#1e1b4b" strokeWidth="3" />
        <rect x="54" y="38" width="27" height="19" rx="7" fill={`url(#${uid}-lens)`} stroke="#1e1b4b" strokeWidth="3" />
        {diff !== 'missing_bridge' && (
          <line x1="46" y1="45" x2="54" y2="45" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" />
        )}
        <line x1="25" y1="43" x2="31" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        {diff !== 'missing_lens_glare' && (
          <line x1="60" y1="43" x2="66" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        )}
        <path d="M34 69 Q50 78 66 66" fill="none" stroke="#0c4a6e" strokeWidth="4" strokeLinecap="round" />
        {diff !== 'missing_smirk_dimple' && (
          <line x1="66" y1="63" x2="70" y2="68" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  if (variant === 'coral_spark_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-orb`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="51" r="37" fill={`url(#${uid}-orb)`} stroke="#9a3412" strokeWidth="2.6" />
        <ellipse cx="40" cy="29" rx="18" ry="8" fill="#ffffff" opacity="0.4" />
        <path d="M27 33 Q35 28 42 33" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
        {diff !== 'missing_eyebrow_r' && (
          <path d="M58 33 Q65 28 73 33" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* 3D Elmas Parıltı Gözler */}
        <polygon points="36,37 44,48 36,59 28,48" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="34" cy="45" r="2.3" fill="#ffffff" />
        <polygon points="64,37 72,48 64,59 56,48" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" strokeLinejoin="round" />
        {diff !== 'missing_right_spark' && <circle cx="62" cy="45" r="2.3" fill="#ffffff" />}
        <ellipse cx="26" cy="62" rx="5.5" ry="3.5" fill="#fde047" opacity="0.7" />
        {diff !== 'missing_blush_r' && <ellipse cx="74" cy="62" rx="5.5" ry="3.5" fill="#fde047" opacity="0.7" />}
        <path d="M34 65 Q50 67 66 65 Q62 81 50 81 Q38 81 34 65 Z" fill="#881337" stroke="#4c0519" strokeWidth="2.4" />
        {diff !== 'missing_tongue' && (
          <path d="M41 75 Q50 71 59 75 Q55 80 50 80 Q45 80 41 75 Z" fill="#fb7185" />
        )}
      </svg>
    );
  }

  if (variant === 'mint_propeller_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-orb`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="52%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
        </defs>
        {/* Pervaneli 3D Şapka */}
        <ellipse cx="38" cy="14" rx="10" ry="3.2" fill="#facc15" stroke="#b45309" strokeWidth="1.8" />
        <ellipse cx="62" cy="14" rx="10" ry="3.2" fill="#facc15" stroke="#b45309" strokeWidth="1.8" />
        {diff !== 'missing_propeller_knob' && <circle cx="50" cy="14" r="4.2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />}
        <path d="M29 33 Q50 15 71 33 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2.2" />
        {diff !== 'missing_hat_stripe' && (
          <path d="M35 28 Q50 22 65 28" fill="none" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {/* Yüz */}
        <circle cx="50" cy="59" r="31" fill={`url(#${uid}-orb)`} stroke="#065f46" strokeWidth="2.4" />
        <ellipse cx="42" cy="41" rx="14" ry="5.5" fill="#ffffff" opacity="0.4" />
        <circle cx="38" cy="54" r="6.8" fill="#0f172a" />
        <circle cx="35.8" cy="51.8" r="2.4" fill="#ffffff" />
        <circle cx="62" cy="54" r="6.8" fill="#0f172a" />
        {diff !== 'missing_eye_spark' && <circle cx="59.8" cy="51.8" r="2.4" fill="#ffffff" />}
        {diff !== 'missing_blush_l' && <ellipse cx="29" cy="65" rx="5.2" ry="3.2" fill="#fb7185" opacity="0.7" />}
        <ellipse cx="71" cy="65" rx="5.2" ry="3.2" fill="#fb7185" opacity="0.7" />
        <circle cx="50" cy="72" r="7.5" fill="#064e3b" stroke="#022c22" strokeWidth="2.2" />
      </svg>
    );
  }

  // violet_crown_3d
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
      <defs>
        <radialGradient id={`${uid}-orb`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </radialGradient>
      </defs>
      {/* 3D Altın Taç */}
      <polygon points="33,29 36,11 50,20 64,11 67,29" fill="#facc15" stroke="#b45309" strokeWidth="2.4" strokeLinejoin="round" />
      {diff !== 'missing_crown_gem' && <circle cx="50" cy="23" r="3.8" fill="#ec4899" stroke="#9d174d" strokeWidth="1.5" />}
      {/* Yüz */}
      <circle cx="50" cy="58" r="31" fill={`url(#${uid}-orb)`} stroke="#4c1d95" strokeWidth="2.4" />
      <ellipse cx="42" cy="40" rx="14" ry="5.5" fill="#ffffff" opacity="0.38" />
      <circle cx="38" cy="53" r="6.8" fill="#0f172a" />
      {diff !== 'missing_eye_spark' && <circle cx="35.8" cy="50.5" r="2.4" fill="#ffffff" />}
      <circle cx="62" cy="53" r="6.8" fill="#0f172a" />
      <circle cx="59.8" cy="50.5" r="2.4" fill="#ffffff" />
      {/* Yanak Yıldızları */}
      {diff !== 'missing_blush_l' && <circle cx="29" cy="64" r="4.2" fill="#fde047" />}
      {diff !== 'missing_cheek_star' && <circle cx="71" cy="64" r="4.2" fill="#fde047" />}
      <path d="M38 69 Q50 80 62 69" fill="none" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
    </svg>
  );
};

const renderFruit3D = (variant: string, diff: string | null, uid: string) => {
  if (variant === 'pear_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-pear`} cx="35%" cy="35%" r="68%">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="48%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#3f6212" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="90" rx="22" ry="4" fill="#0f172a" opacity="0.14" />
        {/* Sap */}
        <path
          d={diff === 'missing_stem_tip' ? 'M50 28 Q50 22 52 20' : 'M50 28 Q50 15 58 10'}
          fill="none"
          stroke="#78350f"
          strokeWidth="4.4"
          strokeLinecap="round"
        />
        {/* 3D Yaprak */}
        <path d="M52 22 Q68 11 76 23 Q64 33 52 22 Z" fill="#16a34a" stroke="#14532d" strokeWidth="2.2" />
        {diff !== 'missing_leaf_vein' && (
          <line x1="56" y1="22" x2="70" y2="22" stroke="#dcfce7" strokeWidth="2.2" strokeLinecap="round" />
        )}
        {/* Armut Gövdesi */}
        <path
          d="M50 26 C60 26 65 37 68 48 C74 58 76 74 67 82 C61 87 56 88 50 88 C44 88 39 87 33 82 C24 74 26 58 32 48 C35 37 40 26 50 26 Z"
          fill={`url(#${uid}-pear)`}
          stroke="#365314"
          strokeWidth="2.4"
        />
        {diff !== 'missing_shine' && (
          <path d="M36 56 Q33 66 38 74" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        )}
        {diff !== 'missing_droplet' && (
          <path d="M62 58 Q66 64 62 68 Q58 64 62 58 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.4" />
        )}
      </svg>
    );
  }

  if (variant === 'orange_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-org`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="90" rx="26" ry="4" fill="#0f172a" opacity="0.14" />
        {/* Yapraklar */}
        <path d="M50 25 Q68 10 78 22 Q65 34 50 25 Z" fill="#22c55e" stroke="#166534" strokeWidth="2.2" />
        {diff !== 'missing_leaf_vein' && (
          <line x1="54" y1="24" x2="71" y2="22" stroke="#dcfce7" strokeWidth="2.2" strokeLinecap="round" />
        )}
        {diff !== 'missing_second_leaf' && (
          <path d="M48 24 Q33 14 27 25 Q39 33 48 24 Z" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
        )}
        <circle cx="50" cy="56" r="32" fill={`url(#${uid}-org)`} stroke="#9a3412" strokeWidth="2.4" />
        {diff !== 'missing_shine' && (
          <ellipse cx="37" cy="41" rx="10" ry="5.5" transform="rotate(-25 37 41)" fill="#ffffff" opacity="0.55" />
        )}
        {/* Kabuk dokusu */}
        {diff !== 'missing_pore_dots' && (
          <g fill="#9a3412" opacity="0.45">
            <circle cx="62" cy="52" r="2.2" />
            <circle cx="68" cy="60" r="2.2" />
            <circle cx="58" cy="66" r="2.2" />
          </g>
        )}
      </svg>
    );
  }

  if (variant === 'grape_3d') {
    const berries = [
      { cx: 36, cy: 40 }, { cx: 50, cy: 40 }, { cx: 64, cy: 40 },
      { cx: 42, cy: 54 }, { cx: 58, cy: 54 },
      { cx: 50, cy: 68 },
    ];
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-grp`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="48%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#581c87" />
          </radialGradient>
        </defs>
        <path d="M50 30 L50 15" stroke="#78350f" strokeWidth="4.2" strokeLinecap="round" />
        {diff !== 'missing_tendril' && (
          <path d="M50 18 Q35 12 32 22" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
        )}
        {diff !== 'missing_leaf' && (
          <path d="M51 22 Q68 12 75 24 Q62 32 51 22 Z" fill="#22c55e" stroke="#166534" strokeWidth="2.2" />
        )}
        {berries.map((b, i) => (
          <g key={i}>
            <circle cx={b.cx} cy={b.cy} r="12.5" fill={`url(#${uid}-grp)`} stroke="#4c1d95" strokeWidth="2.2" />
            {!(diff === 'missing_center_shine' && i === 3) &&
              !(diff === 'missing_bottom_shine' && i === 5) && (
                <circle cx={b.cx - 4} cy={b.cy - 4} r="3.4" fill="#ffffff" opacity="0.65" />
              )}
          </g>
        ))}
      </svg>
    );
  }

  if (variant === 'kiwi_3d') {
    const seeds = [
      { deg: 0 }, { deg: 60 }, { deg: 120 }, { deg: 180 }, { deg: 240 }, { deg: 300 },
    ];
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-kiwi`} cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="35%" stopColor="#84cc16" />
            <stop offset="85%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="38" fill="#92400e" stroke="#451a03" strokeWidth="2.6" />
        <circle cx="50" cy="50" r="33" fill={`url(#${uid}-kiwi)`} />
        <ellipse
          cx="50"
          cy="50"
          rx={diff === 'missing_inner_ring' ? 6 : 11}
          ry={diff === 'missing_inner_ring' ? 6 : 11}
          fill="#fefce8"
        />
        {seeds.map((s, idx) => {
          if (diff === 'missing_seed_top' && s.deg === 240) return null;
          if (diff === 'missing_seed_right' && s.deg === 0) return null;
          if (diff === 'missing_seed_left' && s.deg === 180) return null;
          const rad = (s.deg * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 20;
          const y = 50 + Math.sin(rad) * 20;
          return <ellipse key={idx} cx={x} cy={y} rx="3.8" ry="2.2" transform={`rotate(${s.deg} ${x} ${y})`} fill="#0f172a" />;
        })}
      </svg>
    );
  }

  // peach_3d
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
      <defs>
        <radialGradient id={`${uid}-pch`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="90" rx="23" ry="4" fill="#0f172a" opacity="0.14" />
      <path d="M50 28 Q68 12 78 24 Q64 35 50 28 Z" fill="#22c55e" stroke="#166534" strokeWidth="2.2" />
      {diff !== 'missing_leaf_vein' && (
        <line x1="55" y1="26" x2="71" y2="24" stroke="#dcfce7" strokeWidth="2.2" strokeLinecap="round" />
      )}
      <path
        d="M50 32 C35 22 18 35 20 56 C22 73 38 85 50 88 C62 85 78 73 80 56 C82 35 65 22 50 32 Z"
        fill={`url(#${uid}-pch)`}
        stroke="#9f1239"
        strokeWidth="2.4"
      />
      <path d="M50 32 Q44 52 50 74" fill="none" stroke="#be123c" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
      {diff !== 'missing_shine' && (
        <ellipse cx="34" cy="46" rx="7" ry="12" transform="rotate(-18 34 46)" fill="#ffffff" opacity="0.45" />
      )}
      {diff !== 'missing_blush_dot' && <circle cx="34" cy="64" r="2.8" fill="#ffffff" opacity="0.7" />}
      {diff !== 'missing_droplet' && (
        <path d="M68 50 Q73 57 68 62 Q63 57 68 50 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.6" />
      )}
    </svg>
  );
};

const renderVehicle3D = (variant: string, diff: string | null, uid: string) => {
  if (variant === 'helicopter_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-heli`} cx="35%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        {/* Üst Pervane */}
        <line x1="18" y1="22" x2="82" y2="22" stroke="#1e293b" strokeWidth="4.2" strokeLinecap="round" />
        <line x1="50" y1="22" x2="50" y2="34" stroke="#475569" strokeWidth="4.5" />
        {diff !== 'missing_rotor_cap' && <circle cx="50" cy="22" r="4.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />}
        {/* Kuyruk */}
        <path d="M26 52 L10 47 L10 56 L26 60 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="2.2" strokeLinejoin="round" />
        {diff !== 'missing_tail_rotor' && (
          <circle cx="11" cy="51" r="6" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.2" />
        )}
        {/* İniş Kızağı */}
        <line x1="36" y1="73" x2="36" y2="83" stroke="#334155" strokeWidth="3.5" />
        <line x1="64" y1="73" x2="64" y2="83" stroke="#334155" strokeWidth="3.5" />
        <path d="M26 83 L76 83 Q82 83 84 78" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        {/* 3D Gövde */}
        <ellipse cx="54" cy="54" rx="28" ry="20" fill={`url(#${uid}-heli)`} stroke="#92400e" strokeWidth="2.5" />
        {diff !== 'missing_stripe' && (
          <line x1="29" y1="59" x2="79" y2="59" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
        )}
        {/* Kokpit Camı */}
        <path d="M52 38 Q76 38 78 55 L52 55 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" strokeLinejoin="round" />
        {diff !== 'missing_window_glare' && (
          <line x1="58" y1="43" x2="64" y2="50" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  if (variant === 'submarine_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-sub`} cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
        </defs>
        {/* Periskop */}
        <path d="M50 38 L50 20 L62 20" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {diff !== 'missing_periscope' && <circle cx="63" cy="20" r="4" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.8" />}
        {/* Kule */}
        <rect x="38" y="34" width="24" height="14" rx="6" fill="#f97316" stroke="#9a3412" strokeWidth="2.2" />
        {/* Arka Pervane */}
        {diff !== 'missing_propeller' && (
          <ellipse cx="13" cy="60" rx="5" ry="12" fill="#ef4444" stroke="#991b1b" strokeWidth="2.2" />
        )}
        {/* 3D Gövde */}
        <rect x="17" y="44" width="69" height="32" rx="16" fill={`url(#${uid}-sub)`} stroke="#854d0e" strokeWidth="2.6" />
        <ellipse cx="52" cy="50" rx="22" ry="4" fill="#ffffff" opacity="0.45" />
        {/* Lomboz Pencereleri */}
        <circle cx="34" cy="60" r="6.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" />
        {diff !== 'missing_mid_porthole' && (
          <circle cx="52" cy="60" r="6.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" />
        )}
        <circle cx="70" cy="60" r="6.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.4" />
        {/* Baloncuklar */}
        <circle cx="22" cy="28" r="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.6" />
        {diff !== 'missing_bubble' && <circle cx="15" cy="18" r="2.8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />}
      </svg>
    );
  }

  if (variant === 'balloon_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-bal`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4338ca" />
          </radialGradient>
        </defs>
        {/* İpler */}
        <line x1="41" y1="67" x2="42" y2="78" stroke="#78350f" strokeWidth="2.4" />
        {diff !== 'missing_basket_rope' && <line x1="59" y1="67" x2="58" y2="78" stroke="#78350f" strokeWidth="2.4" />}
        {/* Alev */}
        {diff !== 'missing_flame' && (
          <path d="M47 73 Q50 66 53 73 Q50 76 47 73 Z" fill="#f97316" />
        )}
        {/* Sepet */}
        <rect x="39" y="77" width="22" height="13" rx="3.5" fill="#d97706" stroke="#78350f" strokeWidth="2.2" />
        {/* 3D Balon */}
        <path
          d="M50 10 C71 10 81 26 78 44 C75 56 64 65 59 68 L41 68 C36 65 25 56 22 44 C19 26 29 10 50 10 Z"
          fill={`url(#${uid}-bal)`}
          stroke="#312e81"
          strokeWidth="2.5"
        />
        <path d="M50 10 C60 22 61 48 55 68 L45 68 C39 48 40 22 50 10 Z" fill="#38bdf8" opacity="0.85" />
        {diff !== 'missing_shine' && (
          <ellipse cx="34" cy="29" rx="5.5" ry="11" transform="rotate(-18 34 29)" fill="#ffffff" opacity="0.45" />
        )}
        {diff !== 'missing_center_star' && (
          <polygon
            points="50,27 52.8,34 60,34.5 54.4,39 56.2,46 50,42 43.8,46 45.6,39 40,34.5 47.2,34"
            fill="#fde047"
            stroke="#b45309"
            strokeWidth="1.5"
          />
        )}
      </svg>
    );
  }

  if (variant === 'tractor_3d') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
        <defs>
          <radialGradient id={`${uid}-tr`} cx="35%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="52%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </radialGradient>
        </defs>
        {/* Egzoz */}
        {diff !== 'missing_exhaust' && (
          <path d="M68 45 L68 25 Q68 21 73 21" fill="none" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
        )}
        {/* Kabin */}
        <rect x="20" y="26" width="32" height="32" rx="5" fill={`url(#${uid}-tr)`} stroke="#14532d" strokeWidth="2.4" />
        <rect x="26" y="32" width="20" height="16" rx="3" fill="#bae6fd" stroke="#0369a1" strokeWidth="2" />
        {/* Motor Kaputu */}
        <rect x="49" y="42" width="34" height="24" rx="6" fill={`url(#${uid}-tr)`} stroke="#14532d" strokeWidth="2.4" />
        {diff !== 'missing_headlight' && (
          <circle cx="84" cy="52" r="5" fill="#fde047" stroke="#b45309" strokeWidth="2" />
        )}
        {/* Büyük Arka Teker */}
        <circle cx="32" cy="70" r="16" fill="#1e293b" stroke="#0f172a" strokeWidth="2.8" />
        {diff !== 'missing_big_hub' && <circle cx="32" cy="70" r="7.5" fill="#facc15" stroke="#b45309" strokeWidth="2" />}
        {/* Küçük Ön Teker */}
        <circle cx="72" cy="75" r="11" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
        {diff !== 'missing_small_hub' && <circle cx="72" cy="75" r="4.8" fill="#facc15" stroke="#b45309" strokeWidth="1.8" />}
      </svg>
    );
  }

  // firetruck_3d
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none drop-shadow-[0_4px_5px_rgba(15,23,42,0.22)]">
      <defs>
        <radialGradient id={`${uid}-ft`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="45%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>
      {/* Siren */}
      {diff !== 'missing_siren' && (
        <rect x="62" y="22" width="12" height="9" rx="4" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
      )}
      {/* Merdiven */}
      <line x1="16" y1="28" x2="54" y2="28" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
      <line x1="22" y1="28" x2="22" y2="35" stroke="#94a3b8" strokeWidth="3" />
      {diff !== 'missing_ladder_rung' && <line x1="35" y1="28" x2="35" y2="35" stroke="#94a3b8" strokeWidth="3" />}
      <line x1="48" y1="28" x2="48" y2="35" stroke="#94a3b8" strokeWidth="3" />
      {/* Gövde */}
      <rect x="12" y="34" width="76" height="38" rx="8" fill={`url(#${uid}-ft)`} stroke="#7f1d1d" strokeWidth="2.5" />
      <line x1="14" y1="57" x2="86" y2="57" stroke="#ffffff" strokeWidth="4" />
      {/* Kabin Camı */}
      <rect x="61" y="40" width="21" height="13" rx="3" fill="#bae6fd" stroke="#0369a1" strokeWidth="2.2" />
      {diff !== 'missing_headlight' && (
        <rect x="82" y="59" width="7" height="6" rx="2" fill="#fde047" stroke="#b45309" strokeWidth="1.8" />
      )}
      {/* Tekerlekler */}
      <circle cx="29" cy="74" r="11" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
      <circle cx="29" cy="74" r="4.6" fill="#e2e8f0" />
      <circle cx="71" cy="74" r="11" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
      {diff !== 'missing_wheel_hub' && <circle cx="71" cy="74" r="4.6" fill="#e2e8f0" />}
    </svg>
  );
};

export const CategoryEmblem: React.FC<{ category: FarkliCategoryId }> = ({ category }) => {
  const uid = useId().replace(/:/g, '');
  if (category === 'numbers') {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-9 h-9 p-0.5 font-black text-[11px] leading-none text-slate-900 select-none">
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-sky-100 border border-sky-700 shadow-xs">1</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-sky-100 border border-sky-700 shadow-xs">2</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-sky-100 border border-sky-700 shadow-xs">3</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-sky-300 to-sky-500 text-white border border-sky-800 shadow-xs">4</span>
      </div>
    );
  }
  if (category === 'letters') {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-9 h-9 p-0.5 font-black text-[11px] leading-none text-slate-900 select-none">
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-violet-100 border border-violet-700 shadow-xs">A</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-violet-100 border border-violet-700 shadow-xs">B</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-white to-violet-100 border border-violet-700 shadow-xs">C</span>
        <span className="flex items-center justify-center rounded bg-gradient-to-b from-violet-400 to-indigo-600 text-white border border-indigo-900 shadow-xs">Ç</span>
      </div>
    );
  }
  if (category === 'cats') return renderCat3D('mint_astro_cat', null, `${uid}-e1`);
  if (category === 'animals') return renderAnimal3D('koala_3d', null, `${uid}-e2`);
  if (category === 'emojis') return renderEmoji3D('sun_wink_3d', null, `${uid}-e3`);
  if (category === 'fruits') return renderFruit3D('pear_3d', null, `${uid}-e4`);
  return renderVehicle3D('helicopter_3d', null, `${uid}-e5`);
};

interface TileArtworkProps {
  category: FarkliCategoryId;
  spec: LevelSpec;
  isOdd: boolean;
}

export const TileArtwork: React.FC<TileArtworkProps> = ({ category, spec, isOdd }) => {
  const uid = useId().replace(/:/g, '');
  const activeDiff = isOdd ? spec.diffKey : null;

  if (category === 'numbers' || category === 'letters') {
    const label = isOdd ? spec.oddText : spec.normalText;
    const len = (label || '').length;
    const textSize =
      len >= 4
        ? 'text-lg sm:text-xl md:text-2xl'
        : len === 3
          ? 'text-xl sm:text-2xl md:text-3xl'
          : len === 2
            ? 'text-2xl sm:text-3xl md:text-4xl'
            : 'text-3xl sm:text-4xl md:text-5xl';

    return (
      <span
        className={`font-black tracking-tight select-none leading-none drop-shadow-[0_2px_0_rgba(15,23,42,0.16)] ${textSize} ${
          category === 'numbers'
            ? 'font-mono tabular-nums text-sky-900'
            : 'font-sans text-indigo-950'
        }`}
      >
        {label}
      </span>
    );
  }

  if (category === 'cats') return renderCat3D(spec.variant, activeDiff, uid);
  if (category === 'animals') return renderAnimal3D(spec.variant, activeDiff, uid);
  if (category === 'emojis') return renderEmoji3D(spec.variant, activeDiff, uid);
  if (category === 'fruits') return renderFruit3D(spec.variant, activeDiff, uid);
  return renderVehicle3D(spec.variant, activeDiff, uid);
};
