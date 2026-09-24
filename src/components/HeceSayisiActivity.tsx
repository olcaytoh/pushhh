import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, Volume2,
  Trophy, Star, Award, ChevronLeft, ChevronRight, Home,
  Swords, User, Users, BookOpen, Lightbulb, Zap, VolumeX
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';
import { BasketballRaceTrack, SingleBasketballTrack } from './BasketballRaceTrack';

export interface HeceSayisiActivityProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  soundEnabled?: boolean;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
}

export interface WordSyllableItem {
  id: string;
  word: string;
  syllables: string[];
  count: number;
  emoji: string;
  vowels: string[];
  hint: string;
  category: string;
}

const VOWELS = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü', 'â', 'î']);

export const HECE_WORDS_POOL: WordSyllableItem[] = [
  // 1 HECELİ KELİMELER
  { id: 'h1_1', word: 'Türk', syllables: ['Türk'], count: 1, emoji: '🇹🇷', vowels: ['ü'], hint: '1 ünlü harf (ü) vardır.', category: 'Ülkemiz' },
  { id: 'h1_2', word: 'yurt', syllables: ['yurt'], count: 1, emoji: '🏡', vowels: ['u'], hint: '1 ünlü harf (u) vardır.', category: 'Vatan' },
  { id: 'h1_3', word: 'kurt', syllables: ['kurt'], count: 1, emoji: '🐺', vowels: ['u'], hint: '1 ünlü harf (u) vardır.', category: 'Hayvanlar' },
  { id: 'h1_4', word: 'tren', syllables: ['tren'], count: 1, emoji: '🚂', vowels: ['e'], hint: '1 ünlü harf (e) vardır. Tek hecedir!', category: 'Ulaşım' },
  { id: 'h1_5', word: 'spor', syllables: ['spor'], count: 1, emoji: '⚽', vowels: ['o'], hint: '1 ünlü harf (o) vardır. Tek hecedir!', category: 'Spor' },
  { id: 'h1_6', word: 'kuş', syllables: ['kuş'], count: 1, emoji: '🐦', vowels: ['u'], hint: '1 ünlü harf (u) vardır.', category: 'Hayvanlar' },
  { id: 'h1_7', word: 'ev', syllables: ['ev'], count: 1, emoji: '🏠', vowels: ['e'], hint: '1 ünlü harf (e) vardır.', category: 'Yaşam' },
  { id: 'h1_8', word: 'göz', syllables: ['göz'], count: 1, emoji: '👀', vowels: ['ö'], hint: '1 ünlü harf (ö) vardır.', category: 'Vücudumuz' },
  { id: 'h1_9', word: 'park', syllables: ['park'], count: 1, emoji: '🛝', vowels: ['a'], hint: '1 ünlü harf (a) vardır.', category: 'Çevre' },
  { id: 'h1_10', word: 'renk', syllables: ['renk'], count: 1, emoji: '🎨', vowels: ['e'], hint: '1 ünlü harf (e) vardır.', category: 'Sanat' },
  { id: 'h1_11', word: 'bal', syllables: ['bal'], count: 1, emoji: '🍯', vowels: ['a'], hint: '1 ünlü harf (a) vardır.', category: 'Besinler' },
  { id: 'h1_12', word: 'kalp', syllables: ['kalp'], count: 1, emoji: '❤️', vowels: ['a'], hint: '1 ünlü harf (a) vardır.', category: 'Vücudumuz' },
  { id: 'h1_13', word: 'gül', syllables: ['gül'], count: 1, emoji: '🌹', vowels: ['ü'], hint: '1 ünlü harf (ü) vardır.', category: 'Bitkiler' },
  { id: 'h1_14', word: 'çan', syllables: ['çan'], count: 1, emoji: '🔔', vowels: ['a'], hint: '1 ünlü harf (a) vardır.', category: 'Eşyalar' },

  // 2 HECELİ KELİMELER
  { id: 'h2_1', word: 'kitap', syllables: ['ki', 'tap'], count: 2, emoji: '📖', vowels: ['i', 'a'], hint: '2 ünlü harf (i, a) -> ki - tap', category: 'Okul' },
  { id: 'h2_2', word: 'okul', syllables: ['o', 'kul'], count: 2, emoji: '🏫', vowels: ['o', 'u'], hint: '2 ünlü harf (o, u) -> o - kul', category: 'Okul' },
  { id: 'h2_3', word: 'kalem', syllables: ['ka', 'lem'], count: 2, emoji: '✏️', vowels: ['a', 'e'], hint: '2 ünlü harf (a, e) -> ka - lem', category: 'Okul' },
  { id: 'h2_4', word: 'çiçek', syllables: ['çi', 'çek'], count: 2, emoji: '🌸', vowels: ['i', 'e'], hint: '2 ünlü harf (i, e) -> çi - çek', category: 'Doğa' },
  { id: 'h2_5', word: 'orman', syllables: ['or', 'man'], count: 2, emoji: '🌲', vowels: ['o', 'a'], hint: '2 ünlü harf (o, a) -> or - man', category: 'Doğa' },
  { id: 'h2_6', word: 'elma', syllables: ['el', 'ma'], count: 2, emoji: '🍎', vowels: ['e', 'a'], hint: '2 ünlü harf (e, a) -> el - ma', category: 'Meyveler' },
  { id: 'h2_7', word: 'deniz', syllables: ['de', 'niz'], count: 2, emoji: '🌊', vowels: ['e', 'i'], hint: '2 ünlü harf (e, i) -> de - niz', category: 'Doğa' },
  { id: 'h2_8', word: 'güneş', syllables: ['gü', 'neş'], count: 2, emoji: '☀️', vowels: ['ü', 'e'], hint: '2 ünlü harf (ü, e) -> gü - neş', category: 'Gökyüzü' },
  { id: 'h2_9', word: 'balık', syllables: ['ba', 'lık'], count: 2, emoji: '🐟', vowels: ['a', 'ı'], hint: '2 ünlü harf (a, ı) -> ba - lık', category: 'Hayvanlar' },
  { id: 'h2_10', word: 'dünya', syllables: ['dün', 'ya'], count: 2, emoji: '🌍', vowels: ['ü', 'a'], hint: '2 ünlü harf (ü, a) -> dün - ya', category: 'Uzay' },
  { id: 'h2_11', word: 'bayrak', syllables: ['bay', 'rak'], count: 2, emoji: '🚩', vowels: ['a', 'a'], hint: '2 ünlü harf (a, a) -> bay - rak', category: 'Ülkemiz' },
  { id: 'h2_12', word: 'aslan', syllables: ['as', 'lan'], count: 2, emoji: '🦁', vowels: ['a', 'a'], hint: '2 ünlü harf (a, a) -> as - lan', category: 'Hayvanlar' },
  { id: 'h2_13', word: 'köpek', syllables: ['kö', 'pek'], count: 2, emoji: '🐶', vowels: ['ö', 'e'], hint: '2 ünlü harf (ö, e) -> kö - pek', category: 'Hayvanlar' },
  { id: 'h2_14', word: 'yağmur', syllables: ['yağ', 'mur'], count: 2, emoji: '🌧️', vowels: ['a', 'u'], hint: '2 ünlü harf (a, u) -> yağ - mur', category: 'Hava' },
  { id: 'h2_15', word: 'çanta', syllables: ['çan', 'ta'], count: 2, emoji: '🎒', vowels: ['a', 'a'], hint: '2 ünlü harf (a, a) -> çan - ta', category: 'Okul' },

  // 3 HECELİ KELİMELER
  { id: 'h3_1', word: 'öğrenci', syllables: ['öğ', 'ren', 'ci'], count: 3, emoji: '🧑‍🎓', vowels: ['ö', 'e', 'i'], hint: '3 ünlü harf (ö, e, i) -> öğ - ren - ci', category: 'Okul' },
  { id: 'h3_2', word: 'öğretmen', syllables: ['öğ', 'ret', 'men'], count: 3, emoji: '👩‍🏫', vowels: ['ö', 'e', 'e'], hint: '3 ünlü harf (ö, e, e) -> öğ - ret - men', category: 'Okul' },
  { id: 'h3_3', word: 'kelebek', syllables: ['ke', 'le', 'bek'], count: 3, emoji: '🦋', vowels: ['e', 'e', 'e'], hint: '3 ünlü harf (e, e, e) -> ke - le - bek', category: 'Hayvanlar' },
  { id: 'h3_4', word: 'arkadaş', syllables: ['ar', 'ka', 'daş'], count: 3, emoji: '🤝', vowels: ['a', 'a', 'a'], hint: '3 ünlü harf (a, a, a) -> ar - ka - daş', category: 'Sosyal' },
  { id: 'h3_5', word: 'papatya', syllables: ['pa', 'pat', 'ya'], count: 3, emoji: '🌼', vowels: ['a', 'a', 'a'], hint: '3 ünlü harf (a, a, a) -> pa - pat - ya', category: 'Çiçekler' },
  { id: 'h3_6', word: 'sandalye', syllables: ['san', 'dal', 'ye'], count: 3, emoji: '🪑', vowels: ['a', 'a', 'e'], hint: '3 ünlü harf (a, a, e) -> san - dal - ye', category: 'Eşyalar' },
  { id: 'h3_7', word: 'pencere', syllables: ['pen', 'ce', 're'], count: 3, emoji: '🪟', vowels: ['e', 'e', 'e'], hint: '3 ünlü harf (e, e, e) -> pen - ce - re', category: 'Ev' },
  { id: 'h3_8', word: 'portakal', syllables: ['por', 'ta', 'kal'], count: 3, emoji: '🍊', vowels: ['o', 'a', 'a'], hint: '3 ünlü harf (o, a, a) -> por - ta - kal', category: 'Meyveler' },
  { id: 'h3_9', word: 'yumurta', syllables: ['yu', 'mur', 'ta'], count: 3, emoji: '🥚', vowels: ['u', 'u', 'a'], hint: '3 ünlü harf (u, u, a) -> yu - mur - ta', category: 'Besinler' },
  { id: 'h3_10', word: 'merdiven', syllables: ['mer', 'di', 'ven'], count: 3, emoji: '🪜', vowels: ['e', 'i', 'e'], hint: '3 ünlü harf (e, i, e) -> mer - di - ven', category: 'Yapılar' },
  { id: 'h3_12', word: 'uçurtma', syllables: ['u', 'çurt', 'ma'], count: 3, emoji: '🪁', vowels: ['u', 'u', 'a'], hint: '3 ünlü harf (u, u, a) -> u - çurt - ma', category: 'Oyunlar' },
  { id: 'h3_13', word: 'tiyatro', syllables: ['ti', 'yat', 'ro'], count: 3, emoji: '🎭', vowels: ['i', 'a', 'o'], hint: '3 ünlü harf (i, a, o) -> ti - yat - ro', category: 'Sanat' },
  { id: 'h3_14', word: 'otobüs', syllables: ['o', 'to', 'büs'], count: 3, emoji: '🚌', vowels: ['o', 'o', 'ü'], hint: '3 ünlü harf (o, o, ü) -> o - to - büs', category: 'Ulaşım' },

  // 4 HECELİ KELİMELER
  { id: 'h4_1', word: 'televizyon', syllables: ['te', 'le', 'viz', 'yon'], count: 4, emoji: '📺', vowels: ['e', 'e', 'i', 'o'], hint: '4 ünlü harf (e, e, i, o) -> te - le - viz - yon', category: 'Teknoloji' },
  { id: 'h4_2', word: 'helikopter', syllables: ['he', 'li', 'kop', 'ter'], count: 4, emoji: '🚁', vowels: ['e', 'i', 'o', 'e'], hint: '4 ünlü harf (e, i, o, e) -> he - li - kop - ter', category: 'Havacılık' },
  { id: 'h4_3', word: 'cumhuriyet', syllables: ['cum', 'hu', 'ri', 'yet'], count: 4, emoji: '🇹🇷', vowels: ['u', 'u', 'i', 'e'], hint: '4 ünlü harf (u, u, i, e) -> cum - hu - ri - yet', category: 'Tarih' },
  { id: 'h4_4', word: 'kitaplıklar', syllables: ['ki', 'tap', 'lık', 'lar'], count: 4, emoji: '📚', vowels: ['i', 'a', 'ı', 'a'], hint: '4 ünlü harf -> ki - tap - lık - lar', category: 'Okul' },
  { id: 'h4_5', word: 'matematik', syllables: ['ma', 'te', 'ma', 'tik'], count: 4, emoji: '📐', vowels: ['a', 'e', 'a', 'i'], hint: '4 ünlü harf (a, e, a, i) -> ma - te - ma - tik', category: 'Dersler' },
  { id: 'h4_6', word: 'kalemtıraş', syllables: ['ka', 'lem', 'tı', 'raş'], count: 4, emoji: '✏️', vowels: ['a', 'e', 'ı', 'a'], hint: '4 ünlü harf -> ka - lem - tı - raş', category: 'Kırtasiye' },
  { id: 'h4_7', word: 'kaplumbağa', syllables: ['kap', 'lum', 'ba', 'ğa'], count: 4, emoji: '🐢', vowels: ['a', 'u', 'a', 'a'], hint: '4 ünlü harf -> kap - lum - ba - ğa', category: 'Hayvanlar' },
  { id: 'h4_8', word: 'denizaltı', syllables: ['de', 'niz', 'al', 'tı'], count: 4, emoji: '🤿', vowels: ['e', 'i', 'a', 'ı'], hint: '4 ünlü harf -> de - niz - al - tı', category: 'Taşıtlar' },
  { id: 'h4_9', word: 'çikolata', syllables: ['çi', 'ko', 'la', 'ta'], count: 4, emoji: '🍫', vowels: ['i', 'o', 'a', 'a'], hint: '4 ünlü harf -> çi - ko - la - ta', category: 'Tatlılar' },

  // 5 HECELİ KELİMELER
  { id: 'h5_1', word: 'öğrencileri', syllables: ['öğ', 'ren', 'ci', 'le', 'ri'], count: 5, emoji: '🎒', vowels: ['ö', 'e', 'i', 'e', 'i'], hint: '5 ünlü harf -> öğ - ren - ci - le - ri', category: 'Okul' },
  { id: 'h5_2', word: 'cumhuriyetçi', syllables: ['cum', 'hu', 'ri', 'yet', 'çi'], count: 5, emoji: '✨', vowels: ['u', 'u', 'i', 'e', 'i'], hint: '5 ünlü harf -> cum - hu - ri - yet - çi', category: 'Kavramlar' },
  { id: 'h5_3', word: 'biliminsanı', syllables: ['bi', 'lim', 'in', 'sa', 'nı'], count: 5, emoji: '🔬', vowels: ['i', 'i', 'i', 'a', 'ı'], hint: '5 ünlü harf -> bi - lim - in - sa - nı', category: 'Bilim' }
];

export interface HeceDuelQuestion {
  item: WordSyllableItem;
  correct: number;
  options: number[];
}

export interface HeceDuelPlayer {
  id: number;
  name: string;
  avatar: string;
  img: string;
  score: number;
  lives: number;
  currentQuestion: HeceDuelQuestion | null;
  selectedOption: number | null;
  feedback: 'none' | 'correct' | 'wrong';
  isEliminated: boolean;
}

const PLAYER_THEMES = [
  {
    name: '1. GRUP',
    avatar: 'KAPLAN',
    img: '/kap.png',
    border: 'border-blue-500',
    headerTitleColor: 'text-blue-200',
    headerAccentBorder: 'border-l-4 border-l-blue-400',
    containerBorder: 'border-blue-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)]',
    avatarBg: 'bg-[#080e1d] text-blue-300',
    avatarBorder: 'border-2 border-blue-400',
    buttonDefault: 'bg-gradient-to-b from-[#162957] via-[#102044] to-[#09142c] hover:from-[#203b78] hover:via-[#172d5c] hover:to-[#0d1d3d] active:from-[#0a1228] active:to-[#050914] text-blue-50/95 border-2 border-blue-300/90 hover:border-blue-200 shadow-[0_3px_0_rgba(59,130,246,0.65),0_5px_12px_rgba(0,0,0,0.5)]',
    buttonGlare: 'from-blue-300/10 to-transparent'
  },
  {
    name: '2. GRUP',
    avatar: 'EJDERHA',
    img: '/ejd.png',
    border: 'border-rose-500',
    headerTitleColor: 'text-rose-200',
    headerAccentBorder: 'border-l-4 border-l-rose-400',
    containerBorder: 'border-rose-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(244,63,94,0.15)]',
    avatarBg: 'bg-[#080e1d] text-rose-300',
    avatarBorder: 'border-2 border-rose-400',
    buttonDefault: 'bg-gradient-to-b from-[#421526] via-[#32101f] to-[#1b080f] hover:from-[#5b1d36] hover:via-[#43152a] hover:to-[#250b16] active:from-[#18070f] active:to-[#0d0308] text-rose-50/95 border-2 border-rose-300/90 hover:border-rose-200 shadow-[0_3px_0_rgba(244,63,94,0.65),0_5px_12px_rgba(0,0,0,0.5)]',
    buttonGlare: 'from-rose-300/10 to-transparent'
  },
  {
    name: '3. GRUP',
    avatar: 'SAVAŞÇI',
    img: '/balta.png',
    border: 'border-emerald-500',
    headerTitleColor: 'text-emerald-200',
    headerAccentBorder: 'border-l-4 border-l-emerald-400',
    containerBorder: 'border-emerald-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(16,185,129,0.15)]',
    avatarBg: 'bg-[#080e1d] text-emerald-300',
    avatarBorder: 'border-2 border-emerald-400',
    buttonDefault: 'bg-gradient-to-b from-[#193b2e] via-[#123025] to-[#0a1c15] hover:from-[#24563f] hover:via-[#1a402f] hover:to-[#0d281c] active:from-[#0a1612] active:to-[#050c0a] text-emerald-50/95 border-2 border-emerald-300/90 hover:border-emerald-200 shadow-[0_3px_0_rgba(16,185,129,0.65),0_5px_12px_rgba(0,0,0,0.5)]',
    buttonGlare: 'from-emerald-300/10 to-transparent'
  }
];

function generateDuelQuestion(pool: WordSyllableItem[], excludeId?: string): HeceDuelQuestion {
  const filtered = pool.filter(w => w.id !== excludeId);
  const selected = filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
  const correct = selected.count;

  let options: number[];
  if (correct <= 3) {
    options = [1, 2, 3, 4];
  } else {
    options = [2, 3, 4, 5];
  }

  return {
    item: selected,
    correct,
    options
  };
}

const SINGLE_HECE_CHOICES = [
  {
    count: 1,
    label: '1 HECE',
    bg: 'from-sky-500 via-blue-600 to-indigo-800',
    border: 'border-sky-300',
    badge: 'bg-sky-300 text-slate-950',
    shadow: 'shadow-[0_5px_0_#1e3a8a,0_10px_20px_rgba(0,0,0,0.5)]',
    hoverRing: 'hover:ring-4 hover:ring-sky-400/60'
  },
  {
    count: 2,
    label: '2 HECE',
    bg: 'from-emerald-500 via-teal-600 to-emerald-800',
    border: 'border-emerald-300',
    badge: 'bg-emerald-300 text-slate-950',
    shadow: 'shadow-[0_5px_0_#064e3b,0_10px_20px_rgba(0,0,0,0.5)]',
    hoverRing: 'hover:ring-4 hover:ring-emerald-400/60'
  },
  {
    count: 3,
    label: '3 HECE',
    bg: 'from-amber-500 via-amber-600 to-orange-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-300 text-slate-950',
    shadow: 'shadow-[0_5px_0_#7c2d12,0_10px_20px_rgba(0,0,0,0.5)]',
    hoverRing: 'hover:ring-4 hover:ring-yellow-400/60'
  },
  {
    count: 4,
    label: '4 HECE',
    bg: 'from-purple-500 via-violet-600 to-purple-900',
    border: 'border-fuchsia-300',
    badge: 'bg-fuchsia-300 text-slate-950',
    shadow: 'shadow-[0_5px_0_#4c1d95,0_10px_20px_rgba(0,0,0,0.5)]',
    hoverRing: 'hover:ring-4 hover:ring-fuchsia-400/60'
  },
  {
    count: 5,
    label: '5 HECE',
    bg: 'from-rose-500 via-rose-600 to-red-800',
    border: 'border-rose-300',
    badge: 'bg-rose-300 text-slate-950',
    shadow: 'shadow-[0_5px_0_#881337,0_10px_20px_rgba(0,0,0,0.5)]',
    hoverRing: 'hover:ring-4 hover:ring-rose-400/60'
  }
];

export const HeceSayisiActivity: React.FC<HeceSayisiActivityProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  onQuestionAnswered,
  playerCountMode = 1,
  onSwitchPlayerCountMode,
  soundEnabled = true,
  students,
  selectedStudentId,
  selectedStudentIds: propSelectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal
}) => {
  // Current active mode (1: Single Quiz, 2: 2-Player duel, 3: 3-Player duel)
  const [activeMode, setActiveMode] = useState<'quiz1' | 'duel2' | 'duel3'>(
    playerCountMode === 2 ? 'duel2' : playerCountMode === 3 ? 'duel3' : 'quiz1'
  );

  // Sync mode with playerCountMode prop if provided
  useEffect(() => {
    if (playerCountMode === 1 && activeMode !== 'quiz1') {
      setActiveMode('quiz1');
    } else if (playerCountMode === 2 && activeMode !== 'duel2') {
      setActiveMode('duel2');
      setDuelPlayers(prev => (prev && prev.length >= 3) ? prev : createInitialDuelPlayers(3));
    } else if (playerCountMode === 3 && activeMode !== 'duel3') {
      setActiveMode('duel3');
      setDuelPlayers(prev => (prev && prev.length >= 3) ? prev : createInitialDuelPlayers(3));
    }
  }, [playerCountMode]);

  const handleModeChange = (newCount: 1 | 2 | 3) => {
    if (newCount === 1) {
      setActiveMode('quiz1');
    } else if (newCount === 2) {
      setActiveMode('duel2');
      setDuelPlayers(prev => (prev && prev.length >= 3) ? prev : createInitialDuelPlayers(3));
    } else if (newCount === 3) {
      setActiveMode('duel3');
      setDuelPlayers(prev => (prev && prev.length >= 3) ? prev : createInitialDuelPlayers(3));
    }

    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(newCount);
    }
  };

  const assignedStudent = useMemo(() => students?.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 24), [students]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<(string | null)[]>([
    selectedStudentId || null,
    null,
    null
  ]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (propSelectedStudentIds && propSelectedStudentIds.length >= 3) {
      return propSelectedStudentIds;
    }
    return selectedStudentIds;
  }, [propSelectedStudentIds, selectedStudentIds]);

  useEffect(() => {
    if (selectedStudentId !== undefined) {
      setSelectedStudentIds(prev => [selectedStudentId || null, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentId]);

  // Audio helper
  const triggerSound = useCallback((src: string) => {
    if (playMp3 && soundEnabled) {
      playMp3(src);
    }
  }, [playMp3, soundEnabled]);

  // Web Speech API for Turkish word pronunciation
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const speakWord = useCallback((word: string) => {
    if (!speechEnabled || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synth error if unsupported
    }
  }, [speechEnabled]);

  // =========================================================================
  // 1. SINGLE PLAYER QUIZ STATE & LOGIC
  // =========================================================================
  const [questionIndex, setQuestionIndex] = useState(0);
  const [shuffledList, setShuffledList] = useState<WordSyllableItem[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRuleCard, setShowRuleCard] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);

  const initSingleGame = useCallback(() => {
    const shuffled = [...HECE_WORDS_POOL].sort(() => Math.random() - 0.5);
    setShuffledList(shuffled);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setRoundCompleted(false);
  }, []);

  useEffect(() => {
    if (activeMode === 'quiz1') {
      initSingleGame();
    }
  }, [activeMode, initSingleGame]);

  const currentWord = shuffledList[questionIndex] || HECE_WORDS_POOL[0];

  const handleSelectOption = (chosenCount: number) => {
    if (isAnswered || roundCompleted) return;

    setSelectedOption(chosenCount);
    setIsAnswered(true);
    setShowExplanation(true);

    const isCorrect = chosenCount === currentWord.count;
    onQuestionAnswered?.(isCorrect);

    if (isCorrect) {
      triggerSound('/coin.mp3');
      setScore(s => s + 10 + streak * 2);
      setStreak(st => st + 1);
      setCorrectCount(c => c + 1);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      triggerSound('/hata.mp3');
      setStreak(0);
      setWrongCount(w => w + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 >= 10 || questionIndex + 1 >= shuffledList.length) {
      setRoundCompleted(true);
      triggerSound('/alkis.mp3');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      return;
    }
    setQuestionIndex(idx => idx + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
  };

  // =========================================================================
  // 2. MULTIPLAYER DUEL (2 & 3 PLAYERS) STATE & LOGIC
  // =========================================================================
  const duelTargetScore = 10;

  const createInitialDuelPlayers = useCallback((num: number = 3): HeceDuelPlayer[] => {
    const count = Math.max(3, num);
    const list: HeceDuelPlayer[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        name: PLAYER_THEMES[i].name,
        avatar: PLAYER_THEMES[i].avatar,
        img: PLAYER_THEMES[i].img,
        score: 0,
        lives: 3,
        currentQuestion: generateDuelQuestion(HECE_WORDS_POOL),
        selectedOption: null,
        feedback: 'none',
        isEliminated: false
      });
    }
    return list;
  }, []);

  const [duelPlayers, setDuelPlayers] = useState<HeceDuelPlayer[]>(() => createInitialDuelPlayers(3));
  const [duelWinnerIndex, setDuelWinnerIndex] = useState<number | null>(null);
  const [trackVictoryVideoActive, setTrackVictoryVideoActive] = useState(false);
  const [isDuelFinished, setIsDuelFinished] = useState(false);

  const initDuelGame = useCallback(() => {
    setDuelPlayers(createInitialDuelPlayers(3));
    setDuelWinnerIndex(null);
    setTrackVictoryVideoActive(false);
    setIsDuelFinished(false);
  }, [createInitialDuelPlayers]);

  useEffect(() => {
    if (activeMode === 'duel2' || activeMode === 'duel3') {
      initDuelGame();
    }
  }, [activeMode, initDuelGame]);

  const handleDuelAnswer = (pIdx: number, chosenOption: number) => {
    const player = duelPlayers[pIdx];
    if (!player || player.feedback !== 'none' || player.isEliminated || player.lives <= 0 || isDuelFinished) {
      return;
    }

    const question = player.currentQuestion;
    if (!question) return;

    const isCorrect = chosenOption === question.correct;
    onQuestionAnswered?.(isCorrect);

    if (isCorrect) {
      triggerSound('/coin.mp3');
      const newScore = player.score + 1;

      setDuelPlayers(prev => prev.map((p, idx) => {
        if (idx !== pIdx) return p;
        return {
          ...p,
          score: newScore,
          selectedOption: chosenOption,
          feedback: 'correct'
        };
      }));

      // Check for winner
      if (newScore >= duelTargetScore) {
        setDuelWinnerIndex(pIdx);
        setTrackVictoryVideoActive(true);
        triggerSound('/alkis.mp3');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        return;
      }

      setTimeout(() => {
        setDuelPlayers(prev => prev.map((p, idx) => {
          if (idx !== pIdx) return p;
          return {
            ...p,
            selectedOption: null,
            feedback: 'none',
            currentQuestion: generateDuelQuestion(HECE_WORDS_POOL, p.currentQuestion?.item.id)
          };
        }));
      }, 600);
    } else {
      triggerSound('/hata.mp3');
      const nextLives = player.lives - 1;

      setDuelPlayers(prev => prev.map((p, idx) => {
        if (idx !== pIdx) return p;
        return {
          ...p,
          lives: nextLives,
          selectedOption: chosenOption,
          feedback: 'wrong',
          isEliminated: nextLives <= 0
        };
      }));

      // Check if all players but one eliminated
      setTimeout(() => {
        setDuelPlayers(prev => {
          const active = prev.filter(p => !p.isEliminated && p.lives > 0);
          if (active.length === 1 && prev.length > 1) {
            setDuelWinnerIndex(active[0].id);
            setTrackVictoryVideoActive(true);
            triggerSound('/alkis.mp3');
          }
          return prev.map((p, idx) => {
            if (idx !== pIdx) return p;
            return {
              ...p,
              selectedOption: null,
              feedback: 'none',
              currentQuestion: generateDuelQuestion(HECE_WORDS_POOL, p.currentQuestion?.item.id)
            };
          });
        });
      }, 800);
    }
  };

  const getWinnerConfig = (winnerIdx: number | null) => {
    if (winnerIdx === 0) {
      return {
        videoSrc: '/kap.mp4',
        title: '1. GRUP KAZANDI! 🏆',
        img: '/p1.png',
        badgeBg: 'bg-blue-600',
        borderColor: 'border-blue-400',
        glowColor: 'rgba(59, 130, 246, 0.6)'
      };
    } else if (winnerIdx === 1) {
      return {
        videoSrc: '/kap.mp4',
        title: '2. GRUP KAZANDI! 🏆',
        img: '/p2.png',
        badgeBg: 'bg-rose-600',
        borderColor: 'border-rose-400',
        glowColor: 'rgba(244, 63, 94, 0.6)'
      };
    } else if (winnerIdx === 2) {
      return {
        videoSrc: '/kap.mp4',
        title: '3. GRUP KAZANDI! 🏆',
        img: '/p3.png',
        badgeBg: 'bg-emerald-600',
        borderColor: 'border-emerald-400',
        glowColor: 'rgba(16, 185, 129, 0.6)'
      };
    }
    return {
      videoSrc: '/kap.mp4',
      title: 'ŞAMPİYON! 🏆',
      img: '/p1.png',
      badgeBg: 'bg-amber-600',
      borderColor: 'border-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.6)'
    };
  };

  // Helper to render duel player card
  const renderDuelPlayerCard = (p: HeceDuelPlayer | undefined, pIdx: number) => {
    if (!p) return null;
    const theme = PLAYER_THEMES[pIdx] || PLAYER_THEMES[0];
    const isWinnerGroup = trackVictoryVideoActive && duelWinnerIndex === pIdx;
    const isOtherGroup = trackVictoryVideoActive && duelWinnerIndex !== null && duelWinnerIndex !== pIdx;
    const winCfg = getWinnerConfig(duelWinnerIndex);

    if (isWinnerGroup) {
      return (
        <div
          key={p.id}
          className="relative flex-1 flex flex-col justify-between p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-4 border-yellow-400 bg-[#0a0f1d] shadow-[0_0_35px_rgba(250,204,21,0.85)] ring-4 ring-yellow-400/50 overflow-hidden min-h-0 z-30 scale-[1.02] transition-all w-full max-w-[540px] mx-auto h-full"
        >
          <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-600 border-2 border-white text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 animate-bounce">
              🏆
            </div>
            <div className="flex-1 ml-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white rounded-xl px-2.5 py-1 flex items-center justify-between shadow-lg">
              <span className="font-black text-xs text-slate-950 uppercase tracking-wide truncate flex items-center gap-1.5">
                <img src={winCfg.img} alt={winCfg.title} className="w-4 h-4 sm:w-5 sm:h-5 object-contain inline-block" />
                <span>{pIdx + 1}. GRUP KAZANDI!</span>
              </span>
              <span className="bg-slate-950 text-yellow-300 font-black text-[11px] px-2 py-0.5 rounded-lg">
                {p.score} / {duelTargetScore}
              </span>
            </div>
          </div>

          <div className="relative flex-1 rounded-2xl bg-black border-2 border-yellow-400/80 overflow-hidden flex flex-col items-center justify-center min-h-0 w-full my-1">
            <video
              key={winCfg.videoSrc}
              src={winCfg.videoSrc}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => {
                setTrackVictoryVideoActive(false);
                setIsDuelFinished(true);
              }}
              onError={() => {
                setTrackVictoryVideoActive(false);
                setIsDuelFinished(true);
              }}
            />
            <div className={`absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap ${winCfg.badgeBg} text-white font-black text-xs px-3 py-1 rounded-full border border-white shadow-xl flex items-center gap-1.5 z-20 pointer-events-none drop-shadow-md animate-pulse`}>
              <img src={winCfg.img} alt="Şampiyon" className="w-4 h-4 object-contain" />
              <span>{winCfg.title}</span>
            </div>
          </div>
        </div>
      );
    }

    if (isOtherGroup) {
      return (
        <div
          key={p.id}
          className="relative flex-1 flex flex-col justify-between p-2 rounded-2xl border-2 border-slate-700 bg-[#0a0f1d] opacity-60 shadow-xl overflow-hidden min-h-0 z-10 transition-all w-full max-w-[500px] mx-auto h-full"
        >
          <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1">
            <div className={`w-8 h-8 rounded-full ${theme.avatarBg} ${theme.avatarBorder} font-black text-xs flex items-center justify-center shrink-0`}>
              {pIdx + 1}
            </div>
            <div className="flex-1 ml-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 flex items-center justify-between">
              <span className="font-black text-xs text-slate-400 uppercase tracking-wide truncate">
                {pIdx + 1}. GRUP
              </span>
              <span className="bg-white/10 text-white font-black text-xs px-1.5 py-0.5 rounded-lg">
                {p.score} / {duelTargetScore}
              </span>
            </div>
          </div>
          <div className="relative flex-1 rounded-2xl bg-[#0f172a] border border-white/20 flex flex-col items-center justify-center text-center p-3 my-1 min-h-0 w-full">
            <div className="text-2xl mb-1 filter drop-shadow">🏁</div>
            <div className="text-xs font-black text-slate-300 uppercase tracking-wide">
              YARIŞMA TAMAMLANDI
            </div>
            <div className="text-xs text-amber-300 font-bold mt-1">
              Final Skoru: {p.score} / {duelTargetScore}
            </div>
          </div>
        </div>
      );
    }

    const assignedPlayerStudent = selectedStudentIds[pIdx]
      ? (students?.find(s => s.id === selectedStudentIds[pIdx]) || null)
      : (pIdx === 0 ? assignedStudent : null);

    const optHeightClasses = activeMode === 'duel3' ? 'h-11 sm:h-13 md:h-14' : 'h-13 sm:h-15 md:h-16';
    const optFontClass = activeMode === 'duel3' ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl';

    return (
      <div
        key={p.id}
        className={`relative flex-1 flex flex-col justify-between p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 ${theme.containerBorder} bg-[#0b1328] shadow-2xl overflow-hidden min-h-0 z-10 transition-all w-full ${activeMode === 'duel2' ? 'max-w-[500px] lg:max-w-[560px]' : 'max-w-none'} mx-auto h-full`}
      >
        {/* PLAYER HEADER BAR */}
        <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1 h-8 sm:h-9">
          {assignedPlayerStudent ? (
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${assignedPlayerStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}
              title={`Aktif Öğrenci: ${assignedPlayerStudent.name}`}
            >
              {assignedPlayerStudent.avatar}
            </div>
          ) : (
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${theme.avatarBg} ${theme.avatarBorder} font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}>
              {pIdx + 1}
            </div>
          )}

          <div className={`flex-1 h-full ml-1.5 sm:ml-2 bg-[#0e172a] border border-slate-700/80 ${theme.headerAccentBorder} rounded-xl px-2 sm:px-2.5 flex items-center justify-between shadow-xs gap-1 sm:gap-1.5`}>
            <span className={`font-black text-xs ${theme.headerTitleColor} uppercase tracking-wide truncate`}>
              {assignedPlayerStudent ? `${assignedPlayerStudent.name} (${p.avatar})` : `${pIdx + 1}. GRUP (${p.avatar})`}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                {p.score} / {duelTargetScore}
              </span>
              <div className="flex items-center gap-1 px-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-xs sm:text-sm transition-all ${i < p.lives ? 'text-rose-500 scale-100' : 'text-slate-600 opacity-30 grayscale'}`}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION DISPLAY CONTAINER */}
        <div className={`relative flex-1 rounded-2xl sm:rounded-3xl bg-[#0f172a] border-2 border-cyan-300/60 shadow-[0_8px_32px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] ${activeMode === 'duel3' ? 'px-1.5 py-1 sm:px-2 sm:py-1.5 my-0.5' : 'px-2.5 py-1.5 sm:px-3 sm:py-2 my-0.5'} flex flex-col items-center justify-center text-center z-10 overflow-hidden min-h-0 w-full`}>
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

          {p.isEliminated || p.lives <= 0 ? (
            <div className="relative z-20 flex flex-col items-center justify-center gap-1 p-2">
              <div className="text-2xl sm:text-3xl animate-bounce">💔</div>
              <div className="text-xl xs:text-2xl sm:text-3xl font-black text-rose-500 uppercase tracking-widest [text-shadow:0_3px_6px_#000,0_6px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_12px_rgba(225,29,72,0.95)] animate-pulse">
                ELENDİ!
              </div>
              <div className="text-white/90 text-[11px] sm:text-xs font-black [text-shadow:0_2px_4px_#000] drop-shadow-md">
                Diğer oyuncular yarışıyor...
              </div>
            </div>
          ) : p.currentQuestion ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-2 sm:px-3 w-full max-h-full overflow-hidden my-auto">
              <div className="text-[11px] sm:text-xs md:text-sm font-black uppercase text-amber-300 tracking-wider mb-1 drop-shadow-[0_2px_4px_#000]">
                BU KELİME KAÇ HECE?
              </div>

              {/* TARGET WORD DISPLAY */}
              <div className="px-3 py-1 sm:px-5 sm:py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm xs:text-base sm:text-lg md:text-xl tracking-wide uppercase shadow-[0_6px_16px_rgba(245,158,11,0.35)] border-2 border-white flex items-center justify-center gap-1.5 max-w-full">
                <span className="text-lg sm:text-xl shrink-0 filter drop-shadow-sm">{p.currentQuestion.item.emoji}</span>
                <span className="truncate">{p.currentQuestion.item.word}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(p.currentQuestion!.item.word);
                  }}
                  className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 transition active:scale-90 ml-1 cursor-pointer"
                  title="Seslendir"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 4 CHOICES GRID UNDER THE QUESTION */}
        {!p.isEliminated && p.lives > 0 && p.currentQuestion && (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full mx-auto shrink-0 z-10 my-0.5">
            {p.currentQuestion.options.map((opt, oIdx) => {
              const isSelected = p.selectedOption === opt;
              const isCorrectOpt = opt === p.currentQuestion?.correct;

              let btnClass = theme.buttonDefault;
              if (p.feedback !== 'none') {
                if (isCorrectOpt) {
                  btnClass = "ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 shadow-md text-white";
                } else if (isSelected) {
                  btnClass = "ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 shadow-md text-white";
                } else {
                  btnClass = "opacity-35 border-slate-700/60 bg-slate-900/60 text-slate-400";
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={p.feedback !== 'none' || p.isEliminated || p.lives <= 0}
                  onClick={() => handleDuelAnswer(pIdx, opt)}
                  style={{
                    border: `3px solid ${p.feedback === 'none'
                      ? pIdx === 0
                        ? '#60a5fa'
                        : pIdx === 1
                          ? '#fb7185'
                          : '#34d399'
                      : isCorrectOpt
                        ? '#86efac'
                        : isSelected
                          ? '#fda4af'
                          : '#64748b'}`,
                    background: p.feedback !== 'none'
                      ? isCorrectOpt
                        ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.92), rgba(13, 148, 136, 0.92))'
                        : isSelected
                          ? 'linear-gradient(180deg, rgba(225, 29, 72, 0.92), rgba(185, 28, 28, 0.92))'
                          : 'linear-gradient(180deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.92))'
                      : pIdx === 0
                        ? 'linear-gradient(180deg, rgba(30, 64, 125, 0.96), rgba(16, 38, 82, 0.96))'
                        : pIdx === 1
                          ? 'linear-gradient(180deg, rgba(104, 35, 59, 0.96), rgba(58, 18, 35, 0.96))'
                          : 'linear-gradient(180deg, rgba(31, 91, 68, 0.96), rgba(16, 52, 39, 0.96))',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -5px 10px rgba(0,0,0,0.22), 0 3px 0 rgba(0, 0, 0, 0.35), 0 5px 12px rgba(0, 0, 0, 0.45)'
                  }}
                  className={`fast-quiz-btn relative w-full ${optHeightClasses} rounded-xl sm:rounded-2xl border-2 transition-colors duration-75 flex items-center justify-center text-center cursor-pointer uppercase tracking-wide overflow-hidden active:scale-98 ${btnClass}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${theme.buttonGlare} pointer-events-none rounded-t-xl sm:rounded-t-2xl`} />
                  <div className="relative z-10 flex items-center justify-center gap-1.5 px-2">
                    <span className="text-base sm:text-lg md:text-xl text-white font-black drop-shadow-sm">
                      {opt}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-200 tracking-wider">
                      HECE
                    </span>
                  </div>
                  {p.feedback !== 'none' && isCorrectOpt && (
                    <CheckCircle2 size={16} className="absolute right-1.5 text-emerald-300 shrink-0 filter drop-shadow-md" />
                  )}
                  {p.feedback !== 'none' && isSelected && !isCorrectOpt && (
                    <XCircle size={16} className="absolute right-1.5 text-rose-300 shrink-0 filter drop-shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* 1. BACKGROUND IMAGE (/dere3.jpg) WITH BLUR */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
      </div>

      {/* 2. SUB-HEADER BAR */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0 gap-1.5 sm:gap-2">
        {/* Left: Nav Buttons & Section badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onPrevActivity();
              }}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onNextActivity();
              }}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Right: speech, home & close buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* SESLİ OKUMA TOGGLE */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer ${
              speechEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={speechEnabled ? 'Sesli Okuma Açık' : 'Sesli Okuma Kapalı'}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => {
              triggerSound('/op.mp3');
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Ana Sayfaya Dön"
          >
            <Home size={13} />
            <span className="hidden xs:inline">Ana Sayfa</span>
          </button>

          <button
            onClick={() => {
              triggerSound('/op.mp3');
              onClose();
            }}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kapat"
          >
            ✕ <span className="hidden xs:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden px-2 sm:px-3 py-1 sm:py-1.5">
        {/* LEFT STUDENT SIDE GRID - SADECE 1 KİŞİLİK MODDA */}
        {activeMode === 'quiz1' && students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0 self-center">
            <StudentAvatarSideGrid
              slotsStudents={leftStudents}
              side="left"
              count={students.length}
              label="1. Grup (Sol)"
              selectedStudentId={selectedStudentId || null}
              onSelectStudent={onSelectStudent}
              onOpenRosterModal={onOpenRosterModal}
              playMp3={triggerSound}
            />
          </div>
        )}

        {/* CENTER ACTIVITY CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center h-full min-h-0 min-w-0 max-w-full overflow-hidden">
          {activeMode === 'quiz1' ? (
            /* 1 PLAYER QUIZ MODE - DİĞER ETKİNLİKLERDEKİ GİBİ ŞIK VE ÇERÇEVELİ SORU ALANI */
            <div className="w-full max-w-xl lg:max-w-2xl bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(59,130,246,0.18)] rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between max-h-full overflow-y-auto relative my-auto">
              {roundCompleted ? (
                /* COMPLETION CELEBRATION */
                <div className="w-full text-center py-6 animate-fadeIn">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg border-2 border-amber-200 mb-3 animate-bounce">
                    🏆
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                    Tebrikler, Turu Tamamladın!
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-200 font-semibold mb-5">
                    10 soruluk hece bilgisi alıştırmasını bitirdin.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto mb-5">
                    <div className="bg-emerald-950/80 border border-emerald-400/50 rounded-2xl p-2.5 text-center">
                      <div className="text-[11px] text-emerald-300 font-bold">Doğru</div>
                      <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
                    </div>
                    <div className="bg-rose-950/80 border border-rose-400/50 rounded-2xl p-2.5 text-center">
                      <div className="text-[11px] text-rose-300 font-bold">Yanlış</div>
                      <div className="text-2xl font-black text-rose-400">{wrongCount}</div>
                    </div>
                    <div className="bg-amber-950/80 border border-amber-400/50 rounded-2xl p-2.5 text-center">
                      <div className="text-[11px] text-amber-300 font-bold">Puan</div>
                      <div className="text-2xl font-black text-amber-400">{score}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={initSingleGame}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
                    >
                      <RotateCcw size={16} />
                      <span>Tekrar Oyna</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-600 transition active:scale-95 cursor-pointer"
                    >
                      Türkçe Menüsü
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* UNIFORM TOP STATUS BAR */}
                  <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 mb-2 pb-2 border-b border-indigo-500/30 text-xs font-bold shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {assignedStudent ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 text-amber-200">
                          <span className="text-sm">{assignedStudent.avatar}</span>
                          <span className="text-xs font-black text-white truncate max-w-[90px] sm:max-w-[120px]">{assignedStudent.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                          <span className="text-xs font-bold">1. Oyuncu</span>
                        </div>
                      )}

                      <span className="px-2.5 py-1 rounded-xl bg-indigo-950/90 text-indigo-300 border border-indigo-400/40 text-xs font-bold">
                        Soru {questionIndex + 1} / 10
                      </span>

                      <span className="px-2.5 py-1 rounded-xl bg-amber-950/90 text-amber-300 border border-amber-400/40 flex items-center gap-1 text-xs font-bold">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>{score} Puan</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {streak > 1 && (
                        <span className="px-2 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-0.5 animate-pulse">
                          <Zap size={11} fill="currentColor" />
                          <span>{streak}x</span>
                        </span>
                      )}
                      <button
                        onClick={() => setShowRuleCard(!showRuleCard)}
                        className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-400/50 text-purple-300 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-900 transition cursor-pointer"
                        title="Kuralı Gör"
                      >
                        <Lightbulb size={12} />
                        <span>Kural</span>
                      </button>
                    </div>
                  </div>

                  {/* RULE POPUP BANNER */}
                  {showRuleCard && (
                    <div className="w-full mb-2 p-2.5 rounded-2xl bg-amber-950/70 border border-amber-400/70 text-amber-100 text-xs shadow animate-fadeIn shrink-0">
                      <div className="font-extrabold text-amber-300 flex items-center gap-1 mb-0.5">
                        <Lightbulb size={14} />
                        <span>Altın Kural:</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-snug">
                        Türkçede bir kelimede <b>kaç sesli (ünlü) harf</b> varsa, o kelimede tam o kadar <b>hece</b> vardır!
                      </p>
                      <div className="mt-1 flex items-center gap-1 flex-wrap text-[10px]">
                        <span className="text-amber-300 font-bold">Ünlüler:</span>
                        {['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'].map(v => (
                          <span key={v} className="px-1 py-0.2 rounded bg-amber-400/30 text-amber-200 font-black border border-amber-400/40">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 100% OPAQUE SOLID QUESTION CONTAINER (DİĞER ETKİNLİKLERDEKİ GİBİ ŞIK VE BELİRGİN ÇERÇEVE) */}
                  <div className="w-full my-1.5 sm:my-2 shrink-0">
                    <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-indigo-400/60 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-3 sm:p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                      {/* Subtle top inner gradient glare */}
                      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-indigo-400/10 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      <div className="relative z-10 flex flex-col items-center justify-center w-full">
                        <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest mb-1.5 [text-shadow:_0_2px_4px_#000] flex items-center gap-1.5">
                          <span>📖</span>
                          <span>BU KELİME KAÇ HECEDEN OLUŞUR?</span>
                        </span>

                        {/* LARGE GOLDEN PLAQUE FOR THE WORD (KART / LEVHA) */}
                        <div className="w-full max-w-md sm:max-w-xl py-3 sm:py-4 px-5 sm:px-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_8px_24px_rgba(245,158,11,0.5)] border-3 sm:border-4 border-white flex items-center justify-center gap-3.5 my-1.5">
                          <span className="text-4xl sm:text-5xl filter drop-shadow-md shrink-0">
                            {currentWord.emoji}
                          </span>
                          <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-slate-950 drop-shadow-xs max-w-full overflow-hidden">
                            {currentWord.word.split('').map((char, idx) => {
                              const isVowel = VOWELS.has(char);
                              return (
                                <span
                                  key={idx}
                                  className={`transition-all duration-300 ${
                                    isAnswered && showExplanation && isVowel
                                      ? 'text-rose-700 underline decoration-rose-600 decoration-wavy decoration-3 font-black scale-105'
                                      : 'text-slate-950'
                                  }`}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* AUDIO VOICE BUTTON */}
                        <button
                          onClick={() => speakWord(currentWord.word)}
                          className="mt-1.5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-400/60 text-indigo-200 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-sm"
                          title="Kelimeyi Dinle"
                        >
                          <Volume2 size={15} className="text-cyan-400" />
                          <span>Seslendir</span>
                        </button>

                        {/* SYLLABLE BREAKDOWN DISPLAY AFTER ANSWER */}
                        {isAnswered && (
                          <div className="mt-2.5 flex flex-col items-center animate-fadeIn">
                            <div className="text-xs sm:text-sm text-slate-300 font-semibold mb-1">
                              Hecelerine Ayrılışı:
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              {currentWord.syllables.map((syl, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base sm:text-lg shadow-md border border-indigo-300"
                                >
                                  {syl}
                                </span>
                              ))}
                            </div>
                            <div className="mt-1.5 text-xs sm:text-sm font-bold text-amber-300">
                              {currentWord.hint}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5 SYLLABLE OPTION BUTTONS */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-3.5 w-full max-w-2xl my-2 shrink-0">
                    {SINGLE_HECE_CHOICES.map(opt => {
                      const isSelected = selectedOption === opt.count;
                      const isCorrectChoice = opt.count === currentWord.count;

                      if (!isAnswered) {
                        return (
                          <button
                            key={opt.count}
                            onClick={() => handleSelectOption(opt.count)}
                            className={`relative group min-h-[85px] sm:min-h-[105px] md:min-h-[120px] py-3.5 sm:py-5 px-1.5 rounded-2xl sm:rounded-3xl font-black border-[3.5px] sm:border-4 transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-b ${opt.bg} ${opt.border} ${opt.shadow} ${opt.hoverRing} overflow-hidden`}
                          >
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-xl" />
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)] leading-none">
                              {opt.count}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full ${opt.badge} font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm`}>
                              {opt.label}
                            </span>
                          </button>
                        );
                      }

                      if (isCorrectChoice) {
                        return (
                          <button
                            key={opt.count}
                            disabled={true}
                            className="relative min-h-[85px] sm:min-h-[105px] md:min-h-[120px] py-3.5 sm:py-5 px-1.5 rounded-2xl sm:rounded-3xl font-black border-4 sm:border-[5px] border-emerald-200 bg-gradient-to-b from-emerald-500 via-teal-600 to-emerald-800 text-white shadow-[0_0_25px_rgba(16,185,129,0.9)] ring-4 ring-emerald-400 scale-105 flex flex-col items-center justify-center gap-1.5 cursor-default overflow-hidden animate-pulse"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl" />
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)] leading-none">
                              {opt.count}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-emerald-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow flex items-center gap-1">
                              <CheckCircle2 size={15} className="text-emerald-600" />
                              <span>DOĞRU</span>
                            </span>
                          </button>
                        );
                      }

                      if (isSelected && !isCorrectChoice) {
                        return (
                          <button
                            key={opt.count}
                            disabled={true}
                            className="relative min-h-[85px] sm:min-h-[105px] md:min-h-[120px] py-3.5 sm:py-5 px-1.5 rounded-2xl sm:rounded-3xl font-black border-4 sm:border-[5px] border-rose-200 bg-gradient-to-b from-rose-600 via-red-700 to-rose-900 text-white shadow-[0_0_25px_rgba(225,29,72,0.9)] ring-4 ring-rose-400 scale-100 flex flex-col items-center justify-center gap-1.5 cursor-default overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-xl" />
                            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)] leading-none">
                              {opt.count}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-rose-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow flex items-center gap-1">
                              <XCircle size={15} className="text-rose-600" />
                              <span>YANLIŞ</span>
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={opt.count}
                          disabled={true}
                          className="relative min-h-[85px] sm:min-h-[105px] md:min-h-[120px] py-3.5 sm:py-5 px-1.5 rounded-2xl sm:rounded-3xl font-black border-2 border-slate-700 bg-slate-900/80 text-slate-400 opacity-40 flex flex-col items-center justify-center gap-1.5 cursor-default"
                        >
                          <span className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-400 leading-none">
                            {opt.count}
                          </span>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* FEEDBACK & NEXT BUTTON */}
                  {isAnswered && (
                    <div className="w-full mt-2 flex items-center justify-between gap-2 pt-2 border-t border-indigo-500/30 animate-fadeIn shrink-0">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                        {selectedOption === currentWord.count ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 size={18} />
                            <span>Tebrikler! {currentWord.count} Hece.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-400">
                            <XCircle size={18} />
                            <span>Cevap: {currentWord.count} hece.</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                      >
                        <span>{questionIndex + 1 >= 10 ? 'Sonuçlar' : 'Sıradaki'}</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* MULTIPLAYER DUEL: 2 & 3 PLAYERS */
            <div className={`flex-1 flex flex-col p-1.5 sm:p-2.5 w-full h-full overflow-hidden min-h-0 relative z-10 ${
              activeMode === 'duel2' 
                ? 'max-w-[clamp(1024px,calc(512px+50vw),1800px)]' 
                : 'max-w-[clamp(1200px,calc(500px+70vw),2200px)] w-full'
            } mx-auto`}>
              {/* COMMON TOP BAR: SLEEK COMPACT GLASS CAPSULES */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 shrink-0 h-8 sm:h-9 w-full">
                <span className="h-full px-2.5 sm:px-3 flex items-center bg-[#0e172a] border border-slate-700/80 text-slate-200 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider shrink-0">
                  ⚔️ {activeMode === 'duel2' ? '2' : '3'} OYUNCU DÜELLO
                </span>
                <div className="flex-1 min-w-0 text-center px-1 flex items-center justify-center gap-1.5 h-full">
                  <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest drop-shadow-sm">
                    ⚡ HIZLI VE DİKKATLİ OLAN KAZANIR ⚡
                  </span>
                </div>
                <span className="h-full px-2.5 sm:px-3 flex items-center bg-[#0e172a] border border-slate-700/80 text-slate-200 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider shrink-0">
                  🎯 HEDEF: {duelTargetScore} PUAN
                </span>
              </div>

              {activeMode === 'duel2' ? (
                /* 2 PLAYERS DUEL: 1. GRUP (SOL) - DİKEY BASKETBOL PARKURU (ORTA) - 2. GRUP (SAĞ) */
                <div className="flex-1 flex flex-row items-stretch justify-between gap-2 sm:gap-3 lg:gap-4 w-full min-h-0 overflow-hidden">
                  {/* 1. GRUP */}
                  <div className="flex-1 flex items-center justify-start h-full min-h-0 min-w-0">
                    {renderDuelPlayerCard(duelPlayers[0], 0)}
                  </div>

                  {/* DİKEY BASKETBOL PARKURU (TAM ORTADA) */}
                  <div className="h-full flex items-center justify-center shrink-0 px-1">
                    {(() => {
                      const winCfg = getWinnerConfig(duelWinnerIndex);
                      return (
                        <BasketballRaceTrack
                          players={duelPlayers}
                          playerCountMode={2}
                          targetScore={duelTargetScore}
                          orientation="vertical"
                          showVictoryVideo={trackVictoryVideoActive}
                          victoryVideoSrc={winCfg.videoSrc}
                          winnerTitle={winCfg.title}
                          winnerImg={winCfg.img}
                          winnerBadgeBg={winCfg.badgeBg}
                          winnerBorderColor={winCfg.borderColor}
                          winnerGlowColor={winCfg.glowColor}
                          onVictoryVideoEnd={() => {
                            setTrackVictoryVideoActive(false);
                            setIsDuelFinished(true);
                          }}
                          soundEnabled={soundEnabled}
                        />
                      );
                    })()}
                  </div>

                  {/* 2. GRUP */}
                  <div className="flex-1 flex items-center justify-end h-full min-h-0 min-w-0">
                    {renderDuelPlayerCard(duelPlayers[1], 1)}
                  </div>
                </div>
              ) : (
                /* 3 PLAYERS DUEL: 3 COLUMNS SIDE BY SIDE WITH BASKETBALL TRACKS */
                <div className="flex-1 flex flex-row items-stretch min-h-0 h-full w-full gap-2 sm:gap-2.5 md:gap-3 overflow-hidden">
                  {/* 1. GRUP */}
                  <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-1.5 sm:gap-2">
                    <div className="h-full flex items-center justify-center shrink-0">
                      <SingleBasketballTrack
                        playerIndex={0}
                        score={duelPlayers[0]?.score || 0}
                        targetScore={duelTargetScore}
                        isWinner={duelWinnerIndex === 0}
                      />
                    </div>
                    <div className="flex-1 h-full min-h-0 min-w-0">
                      {renderDuelPlayerCard(duelPlayers[0], 0)}
                    </div>
                  </div>

                  {/* 2. GRUP */}
                  <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-1.5 sm:gap-2">
                    <div className="h-full flex items-center justify-center shrink-0">
                      <SingleBasketballTrack
                        playerIndex={1}
                        score={duelPlayers[1]?.score || 0}
                        targetScore={duelTargetScore}
                        isWinner={duelWinnerIndex === 1}
                      />
                    </div>
                    <div className="flex-1 h-full min-h-0 min-w-0">
                      {renderDuelPlayerCard(duelPlayers[1], 1)}
                    </div>
                  </div>

                  {/* 3. GRUP */}
                  <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-1.5 sm:gap-2">
                    <div className="h-full flex items-center justify-center shrink-0">
                      <SingleBasketballTrack
                        playerIndex={2}
                        score={duelPlayers[2]?.score || 0}
                        targetScore={duelTargetScore}
                        isWinner={duelWinnerIndex === 2}
                      />
                    </div>
                    <div className="flex-1 h-full min-h-0 min-w-0">
                      {renderDuelPlayerCard(duelPlayers[2], 2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT STUDENT SIDE GRID - SADECE 1 KİŞİLİK MODDA */}
        {activeMode === 'quiz1' && students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0 self-center">
            <StudentAvatarSideGrid
              slotsStudents={rightStudents}
              side="right"
              count={students.length}
              label="2. Grup (Sağ)"
              selectedStudentId={selectedStudentId || null}
              onSelectStudent={onSelectStudent}
              onOpenRosterModal={onOpenRosterModal}
              playMp3={triggerSound}
            />
          </div>
        )}
      </div>

      {/* 4. EN ALTA YASLANMIŞ ÖĞRENCİ LİSTESİ DOCKU - SADECE 2 VE 3 KİŞİLİK MODDA (KAYDIRMA ÇUBUĞU OLMADAN SIĞDIRILDI) */}
      {activeMode !== 'quiz1' && students && students.length > 0 && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={activeMode === 'duel3' ? 3 : 2}
            selectedStudentIds={effectiveSelectedStudentIds}
            onSelectStudentForPlayer={(pIdx, studentId) => {
              if (onSelectStudentForPlayer) {
                onSelectStudentForPlayer(pIdx, studentId);
              }
              setSelectedStudentIds(prev => {
                const updated = [...prev];
                updated[pIdx] = studentId;
                return updated;
              });
              triggerSound('/coin.mp3');
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* FOOTER TIP BAR */}
      <div className="w-full bg-[#091024] border-t border-slate-800 px-3 py-1 flex items-center justify-center text-[10px] sm:text-[11px] text-slate-400 gap-1.5 shrink-0">
        <span>💡</span>
        <span>İpucu: Bir sözcükte kaç ünlü (sesli) harf varsa, o kadar hece vardır. (Örn: ke-le-bek = 3 hece)</span>
      </div>
    </div>
  );
};
