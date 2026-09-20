import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, Volume2,
  Trophy, Star, Award, ChevronLeft, ChevronRight, Home,
  Swords, User, Users, BookOpen, Lightbulb, Zap, VolumeX
} from 'lucide-react';

export interface HeceSayisiActivityProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
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
  { id: 'h2_15', word: 'çanta', syllables: ['chan', 'ta'], count: 2, emoji: '🎒', vowels: ['a', 'a'], hint: '2 ünlü harf (a, a) -> çan - ta', category: 'Okul' },

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
  { id: 'h3_11', word: 'çikolata', syllables: ['çi', 'ko', 'la', 'ta'], count: 4, emoji: '🍫', vowels: ['i', 'o', 'a', 'a'], hint: '4 ünlü harf -> çi - ko - la - ta', category: 'Tatlılar' },
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

  // 5 HECELİ KELİMELER
  { id: 'h5_1', word: 'öğrencileri', syllables: ['öğ', 'ren', 'ci', 'le', 'ri'], count: 5, emoji: '🎒', vowels: ['ö', 'e', 'i', 'e', 'i'], hint: '5 ünlü harf -> öğ - ren - ci - le - ri', category: 'Okul' },
  { id: 'h5_2', word: 'cumhuriyetçi', syllables: ['cum', 'hu', 'ri', 'yet', 'çi'], count: 5, emoji: '✨', vowels: ['u', 'u', 'i', 'e', 'i'], hint: '5 ünlü harf -> cum - hu - ri - yet - çi', category: 'Kavramlar' },
  { id: 'h5_3', word: 'biliminsanı', syllables: ['bi', 'lim', 'in', 'sa', 'nı'], count: 5, emoji: '🔬', vowels: ['i', 'i', 'i', 'a', 'ı'], hint: '5 ünlü harf -> bi - lim - in - sa - nı', category: 'Bilim' }
];

export const HeceSayisiActivity: React.FC<HeceSayisiActivityProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  onQuestionAnswered
}) => {
  const [mode, setMode] = useState<'single' | 'duel'>('single');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [shuffledList, setShuffledList] = useState<WordSyllableItem[]>([]);
  
  // Single Player State
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRuleCard, setShowRuleCard] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Duel Mode State
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [duelWinner, setDuelWinner] = useState<string | null>(null);

  // Sound & Speech State
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Sound helper
  const triggerSound = useCallback((src: string) => {
    if (playMp3) {
      playMp3(src);
    }
  }, [playMp3]);

  // Shuffle questions on mount
  const restartGame = useCallback(() => {
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
    setP1Score(0);
    setP2Score(0);
    setDuelWinner(null);
  }, []);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  const currentWord = useMemo(() => {
    if (!shuffledList || shuffledList.length === 0) return HECE_WORDS_POOL[0];
    return shuffledList[questionIndex % shuffledList.length];
  }, [shuffledList, questionIndex]);

  // Speech helper
  const speakWord = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !speechEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.85; // Slightly slower for primary school students
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [speechEnabled]);

  // Play word on new question if speech enabled
  useEffect(() => {
    if (currentWord && !isAnswered && speechEnabled) {
      speakWord(currentWord.word);
    }
  }, [currentWord, isAnswered, speechEnabled, speakWord]);

  // Handle Option Select (Single Player)
  const handleSelectOption = (chosenCount: number) => {
    if (isAnswered || roundCompleted) return;

    setSelectedOption(chosenCount);
    setIsAnswered(true);
    setShowExplanation(true);

    const isCorrect = chosenCount === currentWord.count;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setCorrectCount(c => c + 1);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 }
        });
      } catch {}

      if (onQuestionAnswered) {
        onQuestionAnswered(true);
      }
    } else {
      triggerSound('/hata.mp3');
      setStreak(0);
      setWrongCount(w => w + 1);

      if (onQuestionAnswered) {
        onQuestionAnswered(false);
      }
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);

    if (questionIndex + 1 >= 10) {
      // 10 question round finished
      setRoundCompleted(true);
      triggerSound('/nextlvl.mp3');
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {}
    } else {
      setQuestionIndex(i => i + 1);
      triggerSound('/op.mp3');
    }
  };

  // Handle Duel Answer
  const handleDuelAnswer = (player: 1 | 2, chosenCount: number) => {
    if (isAnswered || duelWinner) return;

    setIsAnswered(true);
    const isCorrect = chosenCount === currentWord.count;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      if (player === 1) {
        const nextScore = p1Score + 1;
        setP1Score(nextScore);
        if (nextScore >= 10) {
          setDuelWinner('1. OYUNCU KAZANDI! 🏆');
          triggerSound('/nextlvl.mp3');
        }
      } else {
        const nextScore = p2Score + 1;
        setP2Score(nextScore);
        if (nextScore >= 10) {
          setDuelWinner('2. OYUNCU KAZANDI! 🏆');
          triggerSound('/nextlvl.mp3');
        }
      }
    } else {
      triggerSound('/hata.mp3');
      // Penalty or point to opponent
      if (player === 1) {
        setP1Score(s => Math.max(0, s - 1));
      } else {
        setP2Score(s => Math.max(0, s - 1));
      }
    }

    // Auto advance in duel after short delay
    setTimeout(() => {
      if (questionIndex + 1 < shuffledList.length) {
        setQuestionIndex(i => i + 1);
        setIsAnswered(false);
      } else {
        restartGame();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#070D1E]/95 backdrop-blur-xl z-[400] flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto">
      {/* TOP BAR / NAVIGATION */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 py-1.5 px-2 bg-[#0c162c] rounded-2xl border border-indigo-500/40 shadow-lg shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition active:scale-95 border border-slate-700"
              title="Ana Sayfaya Dön"
            >
              <Home size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-black text-xs transition active:scale-95 border border-rose-400"
            title="Kapat"
          >
            <ChevronLeft size={16} />
            <span>2. Sınıf Türkçe Menüsü</span>
          </button>
        </div>

        {/* TITLE & BADGE */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md text-base font-black">
            📖
          </div>
          <div className="text-left hidden sm:block">
            <h2 className="text-sm font-black text-white leading-tight">Kelimelerin Hece Sayısını Belirleme</h2>
            <p className="text-[10px] text-indigo-300 font-semibold">2. Sınıf Türkçe • Hece Bilgisi & Kuralı</p>
          </div>
        </div>

        {/* CONTROLS (MODE & SPEECH) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              setMode(m => m === 'single' ? 'duel' : 'single');
              setIsAnswered(false);
              setShowExplanation(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs transition border cursor-pointer ${
              mode === 'duel'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-indigo-950/80 text-indigo-200 border-indigo-400/40 hover:bg-indigo-900/60'
            }`}
            title="1 Kişilik / 2 Kişilik Mod Geçişi"
          >
            {mode === 'single' ? <User size={14} /> : <Swords size={14} />}
            <span className="hidden xs:inline">{mode === 'single' ? 'Tek Kişilik' : '2 Kişilik Düello'}</span>
          </button>

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              speechEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={speechEnabled ? 'Sesli Okuma Açık' : 'Sesli Okuma Kapalı'}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-2 sm:my-3">
        {roundCompleted ? (
          /* ROUND COMPLETION CELEBRATION CARD */
          <div className="w-full bg-gradient-to-b from-[#132042] to-[#0a1226] border-3 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg border-2 border-amber-200 mb-4 animate-bounce">
              🏆
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Tebrikler, 10 Soruluk Turu Tamamladın!
            </h3>
            <p className="text-sm text-indigo-200 font-semibold mb-6">
              2. Sınıf Hece Bilgisi Etkinliğini Başarıyla Bitirdin
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
              <div className="bg-emerald-950/80 border border-emerald-400/50 rounded-2xl p-3 text-center">
                <div className="text-xs text-emerald-300 font-bold">Doğru</div>
                <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
              </div>
              <div className="bg-rose-950/80 border border-rose-400/50 rounded-2xl p-3 text-center">
                <div className="text-xs text-rose-300 font-bold">Yanlış</div>
                <div className="text-2xl font-black text-rose-400">{wrongCount}</div>
              </div>
              <div className="bg-amber-950/80 border border-amber-400/50 rounded-2xl p-3 text-center">
                <div className="text-xs text-amber-300 font-bold">Puan</div>
                <div className="text-2xl font-black text-amber-400">{score}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw size={18} />
                <span>Tekrar Oyna</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600 transition active:scale-95 cursor-pointer"
              >
                <span>Türkçe Menüsüne Dön</span>
              </button>
            </div>
          </div>
        ) : mode === 'single' ? (
          /* SINGLE PLAYER GAMEPLAY CARD */
          <div className="w-full bg-gradient-to-b from-[#132042] via-[#0e1833] to-[#0a1226] border-2 sm:border-3 border-indigo-400/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col items-center">
            
            {/* PROGRESS & METRICS BAR */}
            <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-indigo-500/30 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-400/40">
                  Soru {questionIndex + 1} / 10
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>{score} Puan</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {streak > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[11px] shadow animate-pulse flex items-center gap-1">
                    <Zap size={12} fill="currentColor" />
                    <span>{streak}x Seri</span>
                  </span>
                )}
                <button
                  onClick={() => setShowRuleCard(!showRuleCard)}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                  title="Altın Kural: Sesli Harf Kuralı"
                >
                  <Lightbulb size={13} />
                  <span>Hece Kuralı</span>
                </button>
              </div>
            </div>

            {/* GOLDEN RULE BANNER (TOGGLEABLE OR POPUP) */}
            {showRuleCard && (
              <div className="w-full bg-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-3 mb-3 text-left shadow animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs mb-1">
                  <Lightbulb size={16} className="text-amber-400" />
                  <span>2. Sınıf Altın Kuralı:</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                  Türkçede bir kelimede <b>kaç tane sesli (ünlü) harf</b> varsa, o kelimede tam o kadar <b>hece</b> vardır!
                </p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-amber-300 font-bold">Sesli Harfler:</span>
                  {['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'].map(v => (
                    <span key={v} className="px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-200 font-black text-[11px] border border-amber-400/40">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* WORD DISPLAY STAGE */}
            <div className="w-full py-6 sm:py-8 my-2 rounded-2xl bg-[#091124] border-2 border-indigo-400/40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
              <div className="text-4xl sm:text-5xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">
                {currentWord.emoji}
              </div>

              {/* THE WORD */}
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider my-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {currentWord.word.split('').map((char, idx) => {
                  const isVowel = VOWELS.has(char);
                  return (
                    <span
                      key={idx}
                      className={`transition-colors duration-300 ${
                        isExplanationVisible(isAnswered, showExplanation) && isVowel
                          ? 'text-amber-300 underline decoration-amber-400 decoration-wavy decoration-2'
                          : 'text-white'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* PRONUNCIATION BUTTON */}
              <button
                onClick={() => speakWord(currentWord.word)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/40 text-indigo-300 text-xs font-bold transition active:scale-95 cursor-pointer"
                title="Kelimeyi Dinle"
              >
                <Volume2 size={14} />
                <span>Seslendir</span>
              </button>

              {/* SYLLABLE BREAKDOWN AFTER ANSWER */}
              {isAnswered && (
                <div className="mt-4 flex flex-col items-center animate-fadeIn">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">
                    Hecelerine Ayrılışı:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {currentWord.syllables.map((syl, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg sm:text-xl shadow-md border border-indigo-300 animate-pulse"
                      >
                        {syl}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-bold text-amber-300">
                    {currentWord.hint}
                  </div>
                </div>
              )}
            </div>

            {/* QUESTION PROMPT */}
            <div className="text-center my-2">
              <span className="text-xs sm:text-sm font-extrabold text-indigo-200">
                Bu kelime kaç heceden oluşmaktadır?
              </span>
            </div>

            {/* SYLLABLE OPTIONS (1, 2, 3, 4, 5) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md my-2">
              {[1, 2, 3, 4, 5].map(opt => {
                const isSelected = selectedOption === opt;
                const isCorrectChoice = opt === currentWord.count;
                
                let btnStyle = 'bg-gradient-to-b from-[#1c2c54] to-[#121c38] hover:from-[#253b70] hover:to-[#17254a] text-white border-indigo-400/50 hover:border-cyan-300';
                if (isAnswered) {
                  if (isCorrectChoice) {
                    btnStyle = 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300 scale-105';
                  } else if (isSelected && !isCorrectChoice) {
                    btnStyle = 'bg-gradient-to-b from-rose-600 to-red-700 text-white border-rose-300 shadow-md opacity-80';
                  } else {
                    btnStyle = 'bg-slate-900/60 text-slate-500 border-slate-700 opacity-50';
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`py-3 sm:py-4 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl border-2 transition-all transform active:scale-95 shadow-md flex flex-col items-center justify-center gap-0.5 cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Hece
                    </span>
                  </button>
                );
              })}
            </div>

            {/* FEEDBACK & NEXT BUTTON */}
            {isAnswered && (
              <div className="w-full mt-3 flex items-center justify-between gap-3 pt-3 border-t border-indigo-500/30 animate-fadeIn">
                <div className="flex items-center gap-2">
                  {selectedOption === currentWord.count ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <span>Harika! Doğru cevap {currentWord.count} Hece.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 font-black text-sm">
                      <XCircle size={20} className="text-rose-400" />
                      <span>Doğru cevap {currentWord.count} hece olmalıydı.</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                >
                  <span>{questionIndex + 1 >= 10 ? 'Sonuçları Gör' : 'Sıradaki Soru'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* DUEL (2 PLAYERS) GAMEPLAY CARD */
          <div className="w-full bg-gradient-to-b from-[#132042] via-[#0e1833] to-[#0a1226] border-2 sm:border-3 border-pink-400/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(236,72,153,0.25)] flex flex-col items-center">
            {/* DUEL SCOREBOARD */}
            <div className="w-full grid grid-cols-3 items-center gap-2 mb-4 pb-3 border-b border-pink-500/30 text-center">
              <div className="bg-blue-950/80 border-2 border-blue-400/60 rounded-2xl p-2.5 shadow">
                <div className="text-xs text-blue-300 font-extrabold">1. OYUNCU (SOL)</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400">{p1Score} / 10</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-base sm:text-lg font-black text-pink-400 uppercase tracking-widest flex items-center gap-1">
                  <Swords size={18} />
                  <span>DÜELLO</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">10 Puana Ulaşan Kazanır</div>
              </div>

              <div className="bg-rose-950/80 border-2 border-rose-400/60 rounded-2xl p-2.5 shadow">
                <div className="text-xs text-rose-300 font-extrabold">2. OYUNCU (SAĞ)</div>
                <div className="text-2xl sm:text-3xl font-black text-rose-400">{p2Score} / 10</div>
              </div>
            </div>

            {/* DUEL WINNER ANNOUNCEMENT */}
            {duelWinner ? (
              <div className="text-center py-8">
                <div className="text-4xl font-black text-amber-400 mb-2 animate-bounce">{duelWinner}</div>
                <button
                  onClick={restartGame}
                  className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg cursor-pointer"
                >
                  Yeniden Karşılaş
                </button>
              </div>
            ) : (
              <>
                {/* DUEL WORD STAGE */}
                <div className="w-full py-6 rounded-2xl bg-[#091124] border-2 border-pink-400/40 flex flex-col items-center justify-center my-2 shadow-inner">
                  <div className="text-4xl mb-1">{currentWord.emoji}</div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-wider drop-shadow">
                    {currentWord.word}
                  </div>
                  <div className="text-xs text-indigo-300 font-semibold mt-1">
                    İlk doğru hece sayısına dokunan puanı alır!
                  </div>
                </div>

                {/* TWO CONTROLLERS (LEFT & RIGHT) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* PLAYER 1 CONTROLLER */}
                  <div className="bg-blue-950/40 border border-blue-400/40 rounded-2xl p-3 flex flex-col items-center">
                    <div className="text-xs font-black text-blue-300 mb-2">1. Oyuncu Dokunsun:</div>
                    <div className="grid grid-cols-5 gap-1.5 w-full">
                      {[1, 2, 3, 4, 5].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => handleDuelAnswer(1, cnt)}
                          disabled={isAnswered}
                          className="py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-500 active:scale-95 text-white font-black text-lg border border-blue-400 shadow cursor-pointer"
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PLAYER 2 CONTROLLER */}
                  <div className="bg-rose-950/40 border border-rose-400/40 rounded-2xl p-3 flex flex-col items-center">
                    <div className="text-xs font-black text-rose-300 mb-2">2. Oyuncu Dokunsun:</div>
                    <div className="grid grid-cols-5 gap-1.5 w-full">
                      {[1, 2, 3, 4, 5].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => handleDuelAnswer(2, cnt)}
                          disabled={isAnswered}
                          className="py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 active:scale-95 text-white font-black text-lg border border-rose-400 shadow cursor-pointer"
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER TIP */}
      <div className="w-full max-w-3xl flex items-center justify-center gap-2 py-1 text-[11px] text-slate-400">
        <span>💡 İpucu: Bir sözcükte kaç ünlü (sesli) harf varsa o kadar hece vardır.</span>
      </div>
    </div>
  );
};

function isExplanationVisible(isAnswered: boolean, showExplanation: boolean): boolean {
  return isAnswered && showExplanation;
}
