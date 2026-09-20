import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, Volume2,
  Trophy, Star, Award, ChevronLeft, ChevronRight, Home,
  Swords, User, Users, BookOpen, Lightbulb, Zap, VolumeX
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';
import { StudentAvatarDock } from './StudentAvatarDock';
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
  onSelectStudent?: (id: string | null) => void;
  onOpenRosterModal?: () => void;
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
    buttonDefault: 'bg-gradient-to-b from-[#101b3b] via-[#0d1630] to-[#070c1d] hover:from-[#172552] hover:via-[#111e40] hover:to-[#0b1329] active:from-[#0a1228] active:to-[#050914] text-blue-50/95 border-2 border-blue-500/35 hover:border-blue-400/70 shadow-md',
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
    buttonDefault: 'bg-gradient-to-b from-[#2e101d] via-[#240c16] to-[#14060c] hover:from-[#3d1627] hover:via-[#30101e] hover:to-[#1c0911] active:from-[#18070f] active:to-[#0d0308] text-rose-50/95 border-2 border-rose-500/35 hover:border-rose-400/70 shadow-md',
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
    buttonDefault: 'bg-gradient-to-b from-[#142821] via-[#0f201a] to-[#091511] hover:from-[#1a332a] hover:via-[#142921] hover:to-[#0c1c16] active:from-[#0a1612] active:to-[#050c0a] text-emerald-50/95 border-2 border-emerald-500/35 hover:border-emerald-400/70 shadow-md',
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
  onSelectStudent,
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
    } else if (playerCountMode === 3 && activeMode !== 'duel3') {
      setActiveMode('duel3');
    }
  }, [playerCountMode]);

  const handleModeChange = (newCount: 1 | 2 | 3) => {
    if (newCount === 1) setActiveMode('quiz1');
    else if (newCount === 2) setActiveMode('duel2');
    else if (newCount === 3) setActiveMode('duel3');

    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(newCount);
    }
  };

  // Student list split into 1st group (left) and 2nd group (right)
  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 24), [students]);
  const assignedStudent = useMemo(() => students?.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<(string | null)[]>([
    selectedStudentId || null,
    null,
    null
  ]);

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
  const numDuelPlayers = activeMode === 'duel3' ? 3 : 2;

  const createInitialDuelPlayers = useCallback((num: number): HeceDuelPlayer[] => {
    const list: HeceDuelPlayer[] = [];
    for (let i = 0; i < num; i++) {
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

  const [duelPlayers, setDuelPlayers] = useState<HeceDuelPlayer[]>(() => createInitialDuelPlayers(numDuelPlayers));
  const [duelWinnerIndex, setDuelWinnerIndex] = useState<number | null>(null);
  const [trackVictoryVideoActive, setTrackVictoryVideoActive] = useState(false);
  const [isDuelFinished, setIsDuelFinished] = useState(false);

  const initDuelGame = useCallback(() => {
    setDuelPlayers(createInitialDuelPlayers(numDuelPlayers));
    setDuelWinnerIndex(null);
    setTrackVictoryVideoActive(false);
    setIsDuelFinished(false);
  }, [numDuelPlayers, createInitialDuelPlayers]);

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
  const renderDuelPlayerCard = (p: HeceDuelPlayer, pIdx: number) => {
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

    const optHeightClasses = activeMode === 'duel3' ? 'h-10 sm:h-11 md:h-12' : 'h-11 sm:h-12 md:h-14';
    const optFontClass = activeMode === 'duel3' ? 'text-xs sm:text-sm md:text-base' : 'text-sm sm:text-base md:text-lg';

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
        <div className={`relative flex-1 rounded-2xl sm:rounded-3xl bg-[#0f172a] border-2 border-cyan-300/60 shadow-[0_8px_32px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] ${activeMode === 'duel3' ? 'px-1.5 py-1.5 sm:px-2 sm:py-2 my-0.5' : 'px-3 py-2 sm:px-4 sm:py-3 my-1'} flex flex-col items-center justify-center text-center z-10 overflow-hidden min-h-0 w-full`}>
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
              <div className="text-xs sm:text-sm md:text-base font-black uppercase text-amber-300 tracking-wider mb-2 drop-shadow-[0_2px_4px_#000] [text-shadow:0_2px_4px_#000]">
                BU KELİME KAÇ HECE?
              </div>

              {/* TARGET WORD DISPLAY */}
              <div className="px-5 py-2 sm:px-7 sm:py-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wide uppercase shadow-[0_8px_20px_rgba(245,158,11,0.4)] border-2 sm:border-3 border-white flex items-center justify-center gap-2 max-w-full">
                <span className="text-xl sm:text-2xl md:text-3xl shrink-0 filter drop-shadow-sm">{p.currentQuestion.item.emoji}</span>
                <span className="truncate">{p.currentQuestion.item.word}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(p.currentQuestion!.item.word);
                  }}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 transition active:scale-90 ml-1 cursor-pointer"
                  title="Seslendir"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 4 CHOICES GRID UNDER THE QUESTION */}
        {!p.isEliminated && p.lives > 0 && p.currentQuestion && (
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full mx-auto shrink-0 z-10">
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
                  className={`fast-quiz-btn relative w-full ${optHeightClasses} rounded-xl sm:rounded-2xl border-2 transition-colors duration-75 flex items-center justify-center text-center cursor-pointer uppercase tracking-wide overflow-hidden active:scale-98 ${btnClass}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${theme.buttonGlare} pointer-events-none rounded-t-xl sm:rounded-t-2xl`} />
                  <span className={`relative z-10 px-1 max-w-full leading-tight flex items-center justify-center text-center ${optFontClass} text-white font-black truncate`}>
                    {opt} Hece
                  </span>
                  {p.feedback !== 'none' && isCorrectOpt && (
                    <CheckCircle2 size={18} className="absolute right-2 text-emerald-300 shrink-0 filter drop-shadow-md" />
                  )}
                  {p.feedback !== 'none' && isSelected && !isCorrectOpt && (
                    <XCircle size={18} className="absolute right-2 text-rose-300 shrink-0 filter drop-shadow-md" />
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
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
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

          <div className="flex items-center gap-2 px-2.5 sm:px-4 py-1 rounded-xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] border-l-4 border-l-amber-400">
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wide">
              2. SINIF TÜRKÇE
            </span>
            <span className="text-amber-400/60 font-bold">•</span>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Kelimelerin Hece Sayısı
            </h1>
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
          </div>

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

        {/* Right: 1-2-3 Player mode buttons, speech, home & close buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1, 2, 3 PLAYER MODE SELECTOR BUTTONS */}
          <div className="flex items-center gap-1 bg-[#0b1328] p-0.5 rounded-xl border border-slate-700/80">
            {/* 1 OYUNCU */}
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                handleModeChange(1);
              }}
              title="1 Oyuncu Modu (Alıştırma & Test)"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activeMode === 'quiz1'
                  ? 'bg-blue-600/30 border border-blue-400 ring-2 ring-blue-400/60 shadow-[0_0_8px_rgba(96,165,250,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/1oy.png" alt="1 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>

            {/* 2 OYUNCU KAPIŞMA */}
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                handleModeChange(2);
              }}
              title="2 Oyuncu Kapışma Modu (Dikey Basketbol Parkuru)"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activeMode === 'duel2'
                  ? 'bg-rose-600/30 border border-rose-400 ring-2 ring-rose-400/60 shadow-[0_0_8px_rgba(244,63,94,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/2oy.png" alt="2 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>

            {/* 3 OYUNCU KAPIŞMA */}
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                handleModeChange(3);
              }}
              title="3 Oyuncu Kapışma Modu (3 Grup Yarışı)"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activeMode === 'duel3'
                  ? 'bg-emerald-600/30 border border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/3oy.png" alt="3 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>
          </div>

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

      {/* ACTIVE STUDENT NOTIFICATION BADGE (IF ASSIGNED) */}
      {assignedStudent && (
        <div className="w-full bg-amber-500/15 border-b border-amber-400/30 px-3 py-1 flex items-center justify-center gap-2 text-xs font-bold text-amber-200">
          <span>🎮 Oynayan Öğrenci:</span>
          <span className="text-white font-extrabold flex items-center gap-1">
            <span>{assignedStudent.avatar}</span>
            <span>{assignedStudent.name}</span>
          </span>
          {onSelectStudent && (
            <button
              type="button"
              onClick={() => onSelectStudent(null)}
              className="text-amber-400 hover:text-amber-200 ml-1 text-[11px] underline cursor-pointer"
            >
              (Değiştir)
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTENT AREA WITH SYMMETRICAL SIDE STUDENT AVATAR GRIDS */}
      <div className="flex-1 flex flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden px-2 sm:px-3 py-1.5 sm:py-2">
        {/* LEFT STUDENT SIDE GRID - ONLY IN 1-PLAYER MODE */}
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
              playMp3={playMp3}
            />
          </div>
        )}

        {/* CENTER ACTIVITY CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center h-full min-h-0 min-w-0 max-w-full overflow-hidden">
          {activeMode === 'quiz1' ? (
            /* 1 PLAYER QUIZ MODE */
            <div className="w-full max-w-2xl bg-gradient-to-b from-[#111c3a] via-[#0d162e] to-[#080e1e] border-2 sm:border-3 border-indigo-400/50 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col items-center justify-between max-h-full overflow-y-auto no-scrollbar">
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
                  {/* PROGRESS & STATUS BAR */}
                  <div className="w-full flex items-center justify-between gap-2 mb-2 pb-2 border-b border-indigo-500/30 text-xs font-bold shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-400/40">
                        Soru {questionIndex + 1} / 10
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>{score} Puan</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {streak > 1 && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-0.5 animate-pulse">
                          <Zap size={11} fill="currentColor" />
                          <span>{streak}x Seri</span>
                        </span>
                      )}
                      <button
                        onClick={() => setShowRuleCard(!showRuleCard)}
                        className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/50 text-purple-300 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-900 transition cursor-pointer"
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

                  {/* TARGET WORD CARD */}
                  <div className="w-full py-4 sm:py-6 my-1 rounded-2xl bg-[#081024] border-2 border-indigo-400/40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0">
                    <div className="text-4xl sm:text-5xl mb-1 filter drop-shadow">
                      {currentWord.emoji}
                    </div>

                    <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider my-0.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                      {currentWord.word.split('').map((char, idx) => {
                        const isVowel = VOWELS.has(char);
                        return (
                          <span
                            key={idx}
                            className={`transition-colors duration-300 ${
                              isAnswered && showExplanation && isVowel
                                ? 'text-amber-300 underline decoration-amber-400 decoration-wavy decoration-2'
                                : 'text-white'
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => speakWord(currentWord.word)}
                      className="mt-1.5 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                      title="Kelimeyi Dinle"
                    >
                      <Volume2 size={13} />
                      <span>Seslendir</span>
                    </button>

                    {/* SYLLABLE BREAKDOWN DISPLAY AFTER ANSWER */}
                    {isAnswered && (
                      <div className="mt-3 flex flex-col items-center animate-fadeIn">
                        <div className="text-[10px] text-slate-400 font-semibold mb-1">
                          Hecelerine Ayrılışı:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          {currentWord.syllables.map((syl, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base sm:text-lg shadow-md border border-indigo-300"
                            >
                              {syl}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1.5 text-xs font-bold text-amber-300">
                          {currentWord.hint}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PROMPT */}
                  <div className="text-center my-1.5 shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-indigo-200">
                      Bu kelime kaç heceden oluşmaktadır?
                    </span>
                  </div>

                  {/* 5 SYLLABLE OPTION BUTTONS */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full max-w-md my-1.5 shrink-0">
                    {[1, 2, 3, 4, 5].map(opt => {
                      const isSelected = selectedOption === opt;
                      const isCorrectChoice = opt === currentWord.count;

                      let btnStyle = 'bg-gradient-to-b from-[#1c2c54] to-[#121c38] hover:from-[#253b70] hover:to-[#17254a] text-white border-indigo-400/50 hover:border-cyan-300';
                      if (isAnswered) {
                        if (isCorrectChoice) {
                          btnStyle = 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300 scale-105';
                        } else if (isSelected && !isCorrectChoice) {
                          btnStyle = 'bg-gradient-to-b from-rose-600 to-red-700 text-white border-rose-300 opacity-80';
                        } else {
                          btnStyle = 'bg-slate-900/60 text-slate-500 border-slate-700 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectOption(opt)}
                          disabled={isAnswered}
                          className={`py-2.5 sm:py-3.5 rounded-2xl font-black text-lg sm:text-2xl border-2 transition-all transform active:scale-95 shadow-md flex flex-col items-center justify-center gap-0.5 cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          <span className="text-[9px] font-bold uppercase opacity-80">
                            Hece
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
                  <div className="inline-flex items-center justify-center gap-1.5 max-w-full h-full rounded-xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.3)] border-l-4 border-l-amber-400 px-3 sm:px-6">
                    <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider break-words drop-shadow-md">
                      HECE SAYISI BULMA
                    </h2>
                    <img 
                      src="/icon_3.png" 
                      alt="Hece" 
                      className="h-4 sm:h-5 w-auto object-contain shrink-0 filter drop-shadow-sm ml-1" 
                    />
                  </div>
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

              {/* 3 VE 2 KİŞİLİK OYUNLARIN EN ALTINDA YANYANA KÜÇÜK İKON BÜYÜKLÜĞÜNDE ÇOCUKLARIN AVATARLARI */}
              {students && students.length > 0 && (
                <StudentAvatarDock
                  students={students}
                  currentGrade={2}
                  playerCount={activeMode === 'duel3' ? 3 : 2}
                  selectedStudentIds={selectedStudentIds}
                  onSelectStudentForPlayer={(pIdx, studentId) => {
                    setSelectedStudentIds(prev => {
                      const updated = [...prev];
                      updated[pIdx] = studentId;
                      return updated;
                    });
                    triggerSound('/coin.mp3');
                  }}
                  onOpenRosterModal={() => {
                    onOpenRosterModal?.();
                  }}
                  playMp3={playMp3}
                />
              )}
            </div>
          )}
        </div>

        {/* RIGHT STUDENT SIDE GRID - ONLY IN 1-PLAYER MODE */}
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
              playMp3={playMp3}
            />
          </div>
        )}
      </div>

      {/* FOOTER TIP BAR */}
      <div className="w-full bg-[#091024] border-t border-slate-800 px-3 py-1 flex items-center justify-center text-[10px] sm:text-[11px] text-slate-400 gap-1.5 shrink-0">
        <span>💡</span>
        <span>İpucu: Bir sözcükte kaç ünlü (sesli) harf varsa, o kadar hece vardır. (Örn: ke-le-bek = 3 hece)</span>
      </div>
    </div>
  );
};
