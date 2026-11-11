import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, RotateCcw, X, Clock, SkipBack, SkipForward, Sparkles, Heart, HeartCrack, Volume2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

export type CarpimStep = 2 | 3 | 4 | 5 | 6;

export interface CarpimStepConfig {
  step: CarpimStep;
  title: string;
  shortTitle: string;
  rangeText: string;
  subtitle: string;
  colorTheme: string;
}

export const CARPIM_CONFIGS: Record<CarpimStep, CarpimStepConfig> = {
  2: {
    step: 2,
    title: "2'ler Çarpım Tablosu Balon",
    shortTitle: "2'ler",
    rangeText: "1×2 ... 10×2",
    subtitle: "2'ler çarpım tablosu işlemlerinin cevaplarını balonlarda bulup patlat!",
    colorTheme: 'from-amber-500 to-orange-500',
  },
  3: {
    step: 3,
    title: "3'ler Çarpım Tablosu Balon",
    shortTitle: "3'ler",
    rangeText: "1×3 ... 10×3",
    subtitle: "3'ler çarpım tablosu işlemlerinin cevaplarını balonlarda bulup patlat!",
    colorTheme: 'from-emerald-500 to-teal-500',
  },
  4: {
    step: 4,
    title: "4'ler Çarpım Tablosu Balon",
    shortTitle: "4'ler",
    rangeText: "1×4 ... 10×4",
    subtitle: "4'ler çarpım tablosu işlemlerinin cevaplarını balonlarda bulup patlat!",
    colorTheme: 'from-sky-500 to-blue-500',
  },
  5: {
    step: 5,
    title: "5'ler Çarpım Tablosu Balon",
    shortTitle: "5'ler",
    rangeText: "1×5 ... 10×5",
    subtitle: "5'ler çarpım tablosu işlemlerinin cevaplarını balonlarda bulup patlat!",
    colorTheme: 'from-purple-500 to-pink-500',
  },
  6: {
    step: 6,
    title: "6'lar Çarpım Tablosu Balon",
    shortTitle: "6'lar",
    rangeText: "1×6 ... 10×6",
    subtitle: "6'lar çarpım tablosu işlemlerinin cevaplarını balonlarda bulup patlat!",
    colorTheme: 'from-rose-500 to-red-500',
  },
};

// Canlı, 3B parlak balon renk stilleri
const BALLOON_COLOR_STYLES = [
  { gradient: 'from-rose-500 via-red-500 to-rose-700', border: 'border-rose-300', text: 'text-white', knot: 'bg-rose-700', shadow: 'shadow-rose-900/40' },
  { gradient: 'from-amber-400 via-orange-500 to-amber-600', border: 'border-amber-200', text: 'text-slate-950', knot: 'bg-orange-700', shadow: 'shadow-orange-900/40' },
  { gradient: 'from-emerald-400 via-teal-500 to-emerald-700', border: 'border-emerald-200', text: 'text-white', knot: 'bg-emerald-800', shadow: 'shadow-emerald-900/40' },
  { gradient: 'from-sky-400 via-blue-500 to-sky-700', border: 'border-sky-200', text: 'text-white', knot: 'bg-blue-800', shadow: 'shadow-blue-900/40' },
  { gradient: 'from-purple-500 via-fuchsia-600 to-purple-800', border: 'border-purple-300', text: 'text-white', knot: 'bg-purple-900', shadow: 'shadow-purple-900/40' },
  { gradient: 'from-pink-400 via-rose-500 to-pink-700', border: 'border-pink-200', text: 'text-white', knot: 'bg-rose-800', shadow: 'shadow-pink-900/40' },
  { gradient: 'from-cyan-400 via-teal-500 to-cyan-700', border: 'border-cyan-200', text: 'text-slate-950', knot: 'bg-teal-800', shadow: 'shadow-cyan-900/40' },
  { gradient: 'from-lime-400 via-emerald-500 to-lime-600', border: 'border-lime-200', text: 'text-slate-950', knot: 'bg-emerald-700', shadow: 'shadow-lime-900/40' },
  { gradient: 'from-indigo-500 via-purple-600 to-indigo-800', border: 'border-indigo-300', text: 'text-white', knot: 'bg-indigo-900', shadow: 'shadow-indigo-900/40' },
  { gradient: 'from-yellow-300 via-amber-400 to-yellow-600', border: 'border-yellow-200', text: 'text-slate-950', knot: 'bg-amber-700', shadow: 'shadow-yellow-900/40' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 10 Dairesel Slot Koordinatları: 1 Merkez (50,50), 3 İç Halka (r=21%), 6 Dış Halka (r=37%)
function generateBalloonSlots(rotationDeg: number = 0): { x: number; y: number }[] {
  const rot = (rotationDeg * Math.PI) / 180;
  const slots: { x: number; y: number }[] = [{ x: 50, y: 50 }]; // Merkez

  // 3 İç Halka (r=21%)
  for (let k = 0; k < 3; k++) {
    const ang = ((k * 120 - 90) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 21 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 21 * Math.sin(ang)) * 10) / 10,
    });
  }

  // 6 Dış Halka (r=37%)
  for (let k = 0; k < 6; k++) {
    const ang = ((k * 60 - 60) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 37 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 37 * Math.sin(ang)) * 10) / 10,
    });
  }

  return slots;
}

interface BalloonTile {
  id: string;
  value: number;
  x: number;
  y: number;
  colorStyle: typeof BALLOON_COLOR_STYLES[number];
}

interface QuestionItem {
  id: string;
  multiplier: number;
  table: number;
  answer: number;
  text: string;
}

interface PoppedAnim {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface CarpimTablosuBalonGameProps {
  initialStep?: CarpimStep;
  onStepChange?: (step: CarpimStep) => void;
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

const ROUND_TIME_SECONDS = 100;
const MAX_MISTAKES = 3; // 3 hatada oyun biter

export const CarpimTablosuBalonGame: React.FC<CarpimTablosuBalonGameProps> = ({
  initialStep = 2,
  onStepChange,
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<CarpimStep>(initialStep);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const activeConfig = CARPIM_CONFIGS[currentStep] || CARPIM_CONFIGS[2];

  const p1Student = selectedStudentIds?.[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds?.[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  // 10 Soru Listesi (Sırayla 3x2, 7x2 gibi gelecek)
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Oyuncuların Soru İndeksleri (0..9)
  const [p1QuestionIdx, setP1QuestionIdx] = useState<number>(0);
  const [p2QuestionIdx, setP2QuestionIdx] = useState<number>(0);

  // Balon Listeleri
  const [p1Balloons, setP1Balloons] = useState<BalloonTile[]>([]);
  const [p2Balloons, setP2Balloons] = useState<BalloonTile[]>([]);

  // Patlatılan Cevaplar (Patlayan balonlar)
  const [p1PoppedValues, setP1PoppedValues] = useState<number[]>([]);
  const [p2PoppedValues, setP2PoppedValues] = useState<number[]>([]);

  // Hata Sayacı (0, 1, 2, 3 -> 3'te elenir)
  const [p1Mistakes, setP1Mistakes] = useState<number>(0);
  const [p2Mistakes, setP2Mistakes] = useState<number>(0);

  // Yanlış Tıklama Animasyonu
  const [p1WrongId, setP1WrongId] = useState<string | null>(null);
  const [p2WrongId, setP2WrongId] = useState<string | null>(null);

  // Patlama Efekti Animasyonları
  const [p1PoppedAnims, setP1PoppedAnims] = useState<PoppedAnim[]>([]);
  const [p2PoppedAnims, setP2PoppedAnims] = useState<PoppedAnim[]>([]);

  // Süre
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [finishTimeSeconds, setFinishTimeSeconds] = useState<number | null>(null);
  const roundStartTimeRef = useRef<number>(Date.now());

  // Sonuç
  const [winner, setWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);
  const [winReason, setWinReason] = useState<'all_popped' | 'opponent_burned' | 'both_burned' | 'time_up' | null>(null);

  const triggerSound = useCallback((type: 'pop' | 'wrong' | 'win' | 'burn' | 'click') => {
    if (!playMp3) return;
    if (type === 'pop') playMp3('/op.mp3');
    else if (type === 'wrong') playMp3('/hata.mp3');
    else if (type === 'burn') playMp3('/buzzer.mp3');
    else if (type === 'win') playMp3('/kazandinn.mp3');
    else playMp3('/coin.mp3');
  }, [playMp3]);

  // Yeni Tur Kurulumu
  const setupRound = useCallback((stepToUse?: CarpimStep) => {
    const step = stepToUse || currentStep;

    // 1'den 10'a kadar çarpanları karıştırarak 10 soru üret (örn: 3x2, 7x2, 1x2...)
    const multipliers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const qList: QuestionItem[] = multipliers.map((m, idx) => ({
      id: `q_${step}_${m}_${idx}`,
      multiplier: m,
      table: step,
      answer: m * step,
      text: `${m} × ${step}`,
    }));
    setQuestions(qList);

    // Balonlar: 1'den 10'a kadar çarpım sonuçları (1*step, 2*step, ..., 10*step)
    const allAnswers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => m * step);
    const shuffledColors = shuffleArray(BALLOON_COLOR_STYLES);

    // 1. Oyuncu balonları
    const p1Slots = generateBalloonSlots(0);
    const p1ShuffledAnswers = shuffleArray(allAnswers);
    const p1List: BalloonTile[] = p1ShuffledAnswers.map((val, idx) => ({
      id: `p1_balloon_${val}_${idx}`,
      value: val,
      x: p1Slots[idx].x,
      y: p1Slots[idx].y,
      colorStyle: shuffledColors[idx % shuffledColors.length],
    }));

    // 2. Oyuncu balonları (Farklı slot açısı ve farklı yerleşim)
    const p2Slots = generateBalloonSlots(40);
    const p2ShuffledAnswers = shuffleArray(allAnswers);
    const p2List: BalloonTile[] = p2ShuffledAnswers.map((val, idx) => ({
      id: `p2_balloon_${val}_${idx}`,
      value: val,
      x: p2Slots[idx].x,
      y: p2Slots[idx].y,
      colorStyle: shuffledColors[(idx + 4) % shuffledColors.length],
    }));

    setP1Balloons(p1List);
    setP2Balloons(p2List);

    setP1QuestionIdx(0);
    setP2QuestionIdx(0);
    setP1PoppedValues([]);
    setP2PoppedValues([]);
    setP1Mistakes(0);
    setP2Mistakes(0);
    setP1WrongId(null);
    setP2WrongId(null);
    setP1PoppedAnims([]);
    setP2PoppedAnims([]);

    setTimeLeft(ROUND_TIME_SECONDS);
    roundStartTimeRef.current = Date.now();
    setFinishTimeSeconds(null);
    setIsTimerActive(true);
    setWinner(null);
    setWinReason(null);
  }, [currentStep]);

  const handleSelectStep = (step: CarpimStep) => {
    if (step === currentStep) return;
    setCurrentStep(step);
    onStepChange?.(step);
    setupRound(step);
    triggerSound('click');
  };

  const stepsList: CarpimStep[] = [2, 3, 4, 5, 6];

  useEffect(() => {
    setupRound(currentStep);
  }, [currentStep, setupRound]);

  // Sayaç
  useEffect(() => {
    if (!isTimerActive || winner !== null) return;

    if (timeLeft <= 0) {
      setIsTimerActive(false);
      if (p1PoppedValues.length > p2PoppedValues.length) {
        setWinner('p1');
        onGameCompleted?.(0, 2);
      } else if (p2PoppedValues.length > p1PoppedValues.length) {
        setWinner('p2');
        onGameCompleted?.(1, 2);
      } else {
        setWinner('tie');
      }
      setWinReason('time_up');
      triggerSound('win');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive, winner, p1PoppedValues.length, p2PoppedValues.length, onGameCompleted, triggerSound]);

  // Balona Dokunma
  const handleBalloonClick = (player: 'p1' | 'p2', balloon: BalloonTile) => {
    if (winner !== null || timeLeft <= 0) return;

    const isP1 = player === 'p1';
    const currentMistakes = isP1 ? p1Mistakes : p2Mistakes;
    const currentQIdx = isP1 ? p1QuestionIdx : p2QuestionIdx;
    const currentPopped = isP1 ? p1PoppedValues : p2PoppedValues;
    const currentQuestion = questions[currentQIdx];

    if (!currentQuestion) return;
    if (currentMistakes >= MAX_MISTAKES) return;
    if (currentPopped.includes(balloon.value)) return;

    // DOĞRU CEVAP
    if (balloon.value === currentQuestion.answer) {
      triggerSound('pop');
      onQuestionAnswered?.(true, isP1 ? 0 : 1);

      // Patlama partikül efekti
      const animItem: PoppedAnim = {
        id: `pop_${Date.now()}_${Math.random()}`,
        x: balloon.x,
        y: balloon.y,
        value: balloon.value,
      };
      if (isP1) {
        setP1PoppedAnims(prev => [...prev, animItem]);
        setTimeout(() => setP1PoppedAnims(prev => prev.filter(a => a.id !== animItem.id)), 800);
      } else {
        setP2PoppedAnims(prev => [...prev, animItem]);
        setTimeout(() => setP2PoppedAnims(prev => prev.filter(a => a.id !== animItem.id)), 800);
      }

      const nextPopped = [...currentPopped, balloon.value];
      const nextQIdx = currentQIdx + 1;

      if (isP1) {
        setP1PoppedValues(nextPopped);
        setP1QuestionIdx(nextQIdx);
      } else {
        setP2PoppedValues(nextPopped);
        setP2QuestionIdx(nextQIdx);
      }

      // 10 SORUYU BİTİREN KAZANIR
      if (nextPopped.length >= 10 || nextQIdx >= questions.length) {
        if (currentMistakes === 0) {
          setFinishTimeSeconds(Math.max(1, Math.floor((Date.now() - roundStartTimeRef.current) / 1000)));
        }
        setIsTimerActive(false);
        setWinner(player);
        setWinReason('all_popped');
        triggerSound('win');
        onGameCompleted?.(isP1 ? 0 : 1, 2);

        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { x: isP1 ? 0.3 : 0.7, y: 0.5 },
          });
        } catch {}
      }
    } else {
      // YANLIŞ CEVAP
      triggerSound('wrong');
      onQuestionAnswered?.(false, isP1 ? 0 : 1);

      if (isP1) {
        setP1WrongId(balloon.id);
        setTimeout(() => setP1WrongId(null), 500);
      } else {
        setP2WrongId(balloon.id);
        setTimeout(() => setP2WrongId(null), 500);
      }

      const nextMistakes = currentMistakes + 1;
      if (isP1) {
        setP1Mistakes(nextMistakes);
      } else {
        setP2Mistakes(nextMistakes);
      }

      // 3 HATA YAPAN YANAR
      if (nextMistakes >= MAX_MISTAKES) {
        triggerSound('burn');
        const otherPlayer = isP1 ? 'p2' : 'p1';
        const otherMistakes = isP1 ? p2Mistakes : p1Mistakes;

        if (otherMistakes >= MAX_MISTAKES) {
          setIsTimerActive(false);
          setWinner('tie');
          setWinReason('both_burned');
        } else {
          setIsTimerActive(false);
          setWinner(otherPlayer);
          setWinReason('opponent_burned');
          triggerSound('win');
          onGameCompleted?.(isP1 ? 1 : 0, 2);

          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { x: otherPlayer === 'p1' ? 0.3 : 0.7, y: 0.5 },
            });
          } catch {}
        }
      }
    }
  };

  const p1CurrentQuestion = questions[p1QuestionIdx];
  const p2CurrentQuestion = questions[p2QuestionIdx];

  const [statusSlot, setStatusSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('activity-status-controls-slot') || document.getElementById('ritmik-status-slot');
    setStatusSlot(el);
  }, []);

  const renderStatusControls = () => (
    <>
      {/* 100 Saniye Süre */}
      <div
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border font-black text-xs sm:text-sm tracking-wider shadow-sm transition-all ${
          timeLeft <= 15
            ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
            : 'bg-slate-800/90 border-slate-600 text-amber-300'
        }`}
      >
        <Clock size={13} className={timeLeft <= 15 ? 'text-rose-400' : 'text-amber-400'} />
        <span>{timeLeft}s</span>
      </div>

      {/* 1. Oyuncu Hata Görselleri (Canlar) */}
      <div
        className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-red-950/80 border border-red-500/50 shadow-xs"
        title="1. Oyuncu Kalan Can (3 hata yapan yanar)"
      >
        <span className="text-[10px] sm:text-xs font-black text-red-300 mr-0.5">1.O:</span>
        {[1, 2, 3].map(heartIdx => {
          const isLost = p1Mistakes >= heartIdx;
          return isLost ? (
            <HeartCrack key={heartIdx} size={14} className="text-rose-300 opacity-40 animate-pulse" />
          ) : (
            <Heart key={heartIdx} size={14} className="text-rose-400 fill-rose-400 drop-shadow" />
          );
        })}
      </div>

      {/* 2. Oyuncu Hata Görselleri (Canlar) */}
      <div
        className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-blue-950/80 border border-blue-500/50 shadow-xs"
        title="2. Oyuncu Kalan Can (3 hata yapan yanar)"
      >
        <span className="text-[10px] sm:text-xs font-black text-blue-300 mr-0.5">2.O:</span>
        {[1, 2, 3].map(heartIdx => {
          const isLost = p2Mistakes >= heartIdx;
          return isLost ? (
            <HeartCrack key={heartIdx} size={14} className="text-rose-300 opacity-40 animate-pulse" />
          ) : (
            <Heart key={heartIdx} size={14} className="text-blue-400 fill-blue-400 drop-shadow" />
          );
        })}
      </div>

      {/* 2'ler, 3'ler, 4'ler, 5'ler, 6'lar Geçiş Butonları */}
      <div
        className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 p-0.5 sm:p-1 rounded-xl border border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.35)] ml-1 sm:ml-2 shrink-0"
        title="Çarpım tablosu adımını seç"
      >
        <span className="text-[10px] sm:text-xs font-black text-amber-300 uppercase px-1 hidden md:inline tracking-wider">
          ÇARPIM:
        </span>
        {stepsList.map(step => {
          const isActive = currentStep === step;
          const label = `${step}'${step === 6 ? 'lar' : 'ler'}`;
          return (
            <button
              key={step}
              onClick={() => handleSelectStep(step)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md ring-2 ring-white scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-600 hover:border-amber-400'
              }`}
              title={`${step}'${step === 6 ? 'lar' : 'ler'} Çarpım Tablosu Balonu`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden touch-manipulation">
      <ActivityBackground theme="oyun" />

      {/* ÜST BAŞLIK & KONTROL BARI */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/90 border-b border-cyan-500/30 backdrop-blur-md shadow-md shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl animate-bounce">🎈</span>
            <div>
              <h1 className="font-black text-sm sm:text-lg md:text-xl text-amber-300 drop-shadow flex items-center gap-1.5">
                <span>{activeConfig.title}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black">
                  2 KİŞİLİK DÜELLO
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden lg:block">
                {activeConfig.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Portal yoksa durum kontrolleri doğrudan başlıkta */}
        {!statusSlot && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {renderStatusControls()}
          </div>
        )}

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95 shadow"
              title="Önceki Etkinlik"
            >
              <SkipBack size={16} />
            </button>
          )}

          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95 shadow"
              title="Sonraki Etkinlik"
            >
              <SkipForward size={16} />
            </button>
          )}

          <button
            onClick={() => {
              triggerSound('click');
              setupRound();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer active:scale-95 shadow border border-amber-300"
            title="Yeniden Başlat"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Yeniden</span>
          </button>

          <button
            onClick={() => {
              triggerSound('click');
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black border border-rose-400 transition-all cursor-pointer active:scale-95 shadow"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* PORTAL VARSA STATUS BARI AKTİVİTE BAŞLIĞINDAKİ SLOTA PORTALLA */}
      {statusSlot ? createPortal(renderStatusControls(), statusSlot) : null}
      <div className="flex-1 min-h-0 w-full flex flex-row relative overflow-hidden">
        {/* ----------------- SOL YARI: 1. OYUNCU (KIRMIZI ALAN) ----------------- */}
        <div className="w-1/2 h-full bg-gradient-to-b from-[#b91c1c]/90 via-[#991b1b]/80 to-[#7f1d1d]/90 flex flex-col items-center justify-between p-1.5 sm:p-2 border-r-2 sm:border-r-4 border-black/40 relative overflow-hidden">
          {/* Oyuncu Üst Bilgi Barı */}
          <div className="w-full flex items-center justify-between gap-1.5 z-20 shrink-0">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm tracking-wide border border-white/20 shadow-xs">
              {p1Student ? `🔴 ${p1Student.name}` : '🔴 1. Oyuncu'}
            </span>
          </div>

          {/* SOL OYUN DAİRESİ (BALON ARENASI) */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto min-h-0">
            <div
              className={`relative w-[92vw] max-w-[min(42vw,56vh)] aspect-square bg-gradient-to-b from-sky-100 to-indigo-100 rounded-full border-[4px] sm:border-[6px] border-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
                winner === 'p1' ? 'ring-8 ring-amber-400 scale-[1.02]' : ''
              } ${p1Mistakes >= MAX_MISTAKES ? 'grayscale opacity-60' : ''}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />

              {/* 10 Balon */}
              {p1Balloons.map(b => {
                const isPopped = p1PoppedValues.includes(b.value);
                const isWrong = p1WrongId === b.id;

                if (isPopped) {
                  return (
                    <div
                      key={b.id}
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: '18%',
                        height: '18%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-xl sm:text-2xl opacity-20 filter drop-shadow">💥</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={b.id}
                    onClick={() => handleBalloonClick('p1', b)}
                    disabled={p1Mistakes >= MAX_MISTAKES || winner !== null}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: '18%',
                      height: '21%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 select-none ${
                      isWrong
                        ? 'animate-shake ring-4 ring-rose-500 scale-110'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Parlak 3B Balon Gövdesi */}
                    <div className={`relative w-full h-[88%] rounded-[50%_50%_50%_50%_/_42%_42%_58%_58%] bg-gradient-to-br ${b.colorStyle.gradient} border-2 ${b.colorStyle.border} shadow-lg ${b.colorStyle.shadow} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute top-1 left-1.5 w-3 h-2 sm:w-4 sm:h-2.5 rounded-full bg-white/70 filter blur-[0.4px] rotate-[-25deg] pointer-events-none" />
                      <span className={`font-black text-xl sm:text-2xl md:text-3xl ${b.colorStyle.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10`}>
                        {b.value}
                      </span>
                    </div>
                    <div className={`w-2 sm:w-2.5 h-1.5 sm:h-2 ${b.colorStyle.knot} rounded-xs -mt-0.5 shadow-sm`} />
                    <div className="w-0.5 h-2.5 sm:h-3.5 bg-slate-500/60 rounded-full" />
                  </button>
                );
              })}

              {/* Anlık Pop Efektleri */}
              {p1PoppedAnims.map(a => (
                <div
                  key={a.id}
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute pointer-events-none z-30 flex flex-col items-center justify-center animate-ping"
                >
                  <span className="text-3xl sm:text-4xl">💥</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-600 bg-white/90 px-1 rounded shadow">
                    +{a.value}
                  </span>
                </div>
              ))}

              {/* Elendi Overlay */}
              {p1Mistakes >= MAX_MISTAKES && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-3xl mb-2 shadow-lg border-2 border-white animate-bounce">
                    💥
                  </div>
                  <h4 className="font-black text-base sm:text-xl text-white">YANDIN!</h4>
                  <p className="text-xs sm:text-sm text-rose-300 font-bold mt-1">3 Hata Yaptın</p>
                </div>
              )}
            </div>
          </div>

          {/* KULLANICI KURALI: DAİRENİN HEMEN ALTINDA SADECE DEV "6x2" ÇARPMA SORUSU (%100 BÜYÜTÜLMÜŞ, YAZISIZ VE ÇERÇEVESİZ) */}
          <div className="w-full max-w-[min(44vw,58vh)] z-20 shrink-0 mt-1 sm:mt-2 mb-1 flex justify-center">
            <div className="w-full py-1.5 sm:py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-2 sm:border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] flex items-center justify-center">
              {p1CurrentQuestion && p1Mistakes < MAX_MISTAKES && p1QuestionIdx < 10 ? (
                <div className="flex items-center justify-center gap-2 sm:gap-4 px-6 sm:px-12 py-1 sm:py-2 rounded-xl bg-slate-950/95 text-white font-black shadow-inner border-2 border-amber-300/70">
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-300 tracking-wider drop-shadow-md">
                    {p1CurrentQuestion.multiplier}
                  </span>
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-rose-400">
                    ×
                  </span>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-cyan-300 tracking-wider drop-shadow-md">
                    {p1CurrentQuestion.table}
                  </span>
                </div>
              ) : (
                <div className="px-5 py-2 rounded-xl bg-slate-950/95 text-amber-300 font-black text-xl sm:text-3xl">
                  {p1Mistakes >= MAX_MISTAKES ? '💥 Elendi' : '🏆 Tamamlandı!'}
                </div>
              )}
            </div>
          </div>

          {/* Alt Skor */}
          <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-bold text-white/80 z-20 shrink-0 px-2 mt-0.5">
            <span>Patlatılan: {p1PoppedValues.length} / 10</span>
            <span>Kalan Can: {Math.max(0, MAX_MISTAKES - p1Mistakes)}</span>
          </div>
        </div>

        {/* ----------------- SAĞ YARI: 2. OYUNCU (MAVİ ALAN) ----------------- */}
        <div className="w-1/2 h-full bg-gradient-to-b from-[#1d4ed8]/90 via-[#1e40af]/80 to-[#1e3a8a]/90 flex flex-col items-center justify-between p-1.5 sm:p-2 relative overflow-hidden">
          {/* Oyuncu Üst Bilgi Barı */}
          <div className="w-full flex items-center justify-between gap-1.5 z-20 shrink-0">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm tracking-wide border border-white/20 shadow-xs">
              {p2Student ? `🔵 ${p2Student.name}` : '🔵 2. Oyuncu'}
            </span>
          </div>

          {/* SAĞ OYUN DAİRESİ (BALON ARENASI) */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto min-h-0">
            <div
              className={`relative w-[92vw] max-w-[min(42vw,56vh)] aspect-square bg-gradient-to-b from-sky-100 to-indigo-100 rounded-full border-[4px] sm:border-[6px] border-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
                winner === 'p2' ? 'ring-8 ring-amber-400 scale-[1.02]' : ''
              } ${p2Mistakes >= MAX_MISTAKES ? 'grayscale opacity-60' : ''}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />

              {/* 10 Balon */}
              {p2Balloons.map(b => {
                const isPopped = p2PoppedValues.includes(b.value);
                const isWrong = p2WrongId === b.id;

                if (isPopped) {
                  return (
                    <div
                      key={b.id}
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: '18%',
                        height: '18%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-xl sm:text-2xl opacity-20 filter drop-shadow">💥</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={b.id}
                    onClick={() => handleBalloonClick('p2', b)}
                    disabled={p2Mistakes >= MAX_MISTAKES || winner !== null}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: '18%',
                      height: '21%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 select-none ${
                      isWrong
                        ? 'animate-shake ring-4 ring-rose-500 scale-110'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Parlak 3B Balon Gövdesi */}
                    <div className={`relative w-full h-[88%] rounded-[50%_50%_50%_50%_/_42%_42%_58%_58%] bg-gradient-to-br ${b.colorStyle.gradient} border-2 ${b.colorStyle.border} shadow-lg ${b.colorStyle.shadow} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute top-1 left-1.5 w-3 h-2 sm:w-4 sm:h-2.5 rounded-full bg-white/70 filter blur-[0.4px] rotate-[-25deg] pointer-events-none" />
                      <span className={`font-black text-xl sm:text-2xl md:text-3xl ${b.colorStyle.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10`}>
                        {b.value}
                      </span>
                    </div>
                    <div className={`w-2 sm:w-2.5 h-1.5 sm:h-2 ${b.colorStyle.knot} rounded-xs -mt-0.5 shadow-sm`} />
                    <div className="w-0.5 h-2.5 sm:h-3.5 bg-slate-500/60 rounded-full" />
                  </button>
                );
              })}

              {/* Anlık Pop Efektleri */}
              {p2PoppedAnims.map(a => (
                <div
                  key={a.id}
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute pointer-events-none z-30 flex flex-col items-center justify-center animate-ping"
                >
                  <span className="text-3xl sm:text-4xl">💥</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-600 bg-white/90 px-1 rounded shadow">
                    +{a.value}
                  </span>
                </div>
              ))}

              {/* Elendi Overlay */}
              {p2Mistakes >= MAX_MISTAKES && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-3xl mb-2 shadow-lg border-2 border-white animate-bounce">
                    💥
                  </div>
                  <h4 className="font-black text-base sm:text-xl text-white">YANDIN!</h4>
                  <p className="text-xs sm:text-sm text-rose-300 font-bold mt-1">3 Hata Yaptın</p>
                </div>
              )}
            </div>
          </div>

          {/* KULLANICI KURALI: DAİRENİN HEMEN ALTINDA SADECE DEV "6x2" ÇARPMA SORUSU (%100 BÜYÜTÜLMÜŞ, YAZISIZ VE ÇERÇEVESİZ) */}
          <div className="w-full max-w-[min(44vw,58vh)] z-20 shrink-0 mt-1 sm:mt-2 mb-1 flex justify-center">
            <div className="w-full py-1.5 sm:py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 border-2 sm:border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] flex items-center justify-center">
              {p2CurrentQuestion && p2Mistakes < MAX_MISTAKES && p2QuestionIdx < 10 ? (
                <div className="flex items-center justify-center gap-2 sm:gap-4 px-6 sm:px-12 py-1 sm:py-2 rounded-xl bg-slate-950/95 text-white font-black shadow-inner border-2 border-cyan-300/70">
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-cyan-300 tracking-wider drop-shadow-md">
                    {p2CurrentQuestion.multiplier}
                  </span>
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-rose-400">
                    ×
                  </span>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-300 tracking-wider drop-shadow-md">
                    {p2CurrentQuestion.table}
                  </span>
                </div>
              ) : (
                <div className="px-5 py-2 rounded-xl bg-slate-950/95 text-cyan-300 font-black text-xl sm:text-3xl">
                  {p2Mistakes >= MAX_MISTAKES ? '💥 Elendi' : '🏆 Tamamlandı!'}
                </div>
              )}
            </div>
          </div>

          {/* Alt Skor */}
          <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-bold text-white/80 z-20 shrink-0 px-2 mt-0.5">
            <span>Patlatılan: {p2PoppedValues.length} / 10</span>
            <span>Kalan Can: {Math.max(0, MAX_MISTAKES - p2Mistakes)}</span>
          </div>
        </div>
      </div>

      {/* ALT: ÖĞRENCİ AVATAR DOCK */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-40 px-1 sm:px-2 pb-0.5 mt-auto">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={2}
            selectedStudentIds={selectedStudentIds || []}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* KAZANAN / BİTİŞ MODALI */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-center">
            {/* Şampiyonluk Rozeti */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-lg border-4 border-white mb-4 animate-bounce">
              {winner === 'tie' ? '🤝' : '🏆'}
            </div>

            {winner === 'tie' ? (
              <>
                <h3 className="text-2xl font-black text-amber-300">BERABERE!</h3>
                <p className="text-sm text-slate-300 mt-2">
                  {winReason === 'both_burned'
                    ? 'Her iki oyuncu da 3 hata yaparak elendi!'
                    : '100 saniye süre doldu ve skorlar eşit kaldı!'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wide">
                  ŞAMPİYON: {winner === 'p1' ? (p1Student?.name || '1. OYUNCU (KIRMIZI)') : (p2Student?.name || '2. OYUNCU (MAVİ)')}
                </h3>
                <p className="text-sm text-emerald-300 font-bold mt-2">
                  {winReason === 'all_popped'
                    ? '10 sorunun tamamını doğru bilerek tüm balonları ilk patlatan oldu!'
                    : 'Rakip 3 hata yaparak elendi, şampiyonluk senin!'}
                </p>

                {winReason === 'all_popped' &&
                  ((winner === 'p1' && p1Mistakes === 0) || (winner === 'p2' && p2Mistakes === 0)) &&
                  finishTimeSeconds !== null && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-300/50 bg-emerald-500/15 px-4 py-2 text-emerald-200 font-bold">
                      <Clock size={16} />
                      <span>
                        Hatasız bitirme süresi:{' '}
                        <strong>
                          {finishTimeSeconds >= 60
                            ? `${Math.floor(finishTimeSeconds / 60)} dk ${String(finishTimeSeconds % 60).padStart(2, '0')} sn`
                            : `${finishTimeSeconds} sn`}
                        </strong>
                      </span>
                    </div>
                  )}
              </>
            )}

            {/* Skor Özeti */}
            <div className="grid grid-cols-2 gap-3 my-5 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30">
                <div className="text-[11px] font-bold text-red-300">1. Oyuncu</div>
                <div className="text-xl font-black text-white mt-0.5">{p1PoppedValues.length} / 10</div>
                <div className="text-[10px] text-red-400 mt-0.5">{p1Mistakes} Hata</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="text-[11px] font-bold text-blue-300">2. Oyuncu</div>
                <div className="text-xl font-black text-white mt-0.5">{p2PoppedValues.length} / 10</div>
                <div className="text-[10px] text-blue-400 mt-0.5">{p2Mistakes} Hata</div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  triggerSound('click');
                  setupRound();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Tekrar Oyna</span>
              </button>

              <button
                onClick={() => {
                  triggerSound('click');
                  onClose();
                }}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wider uppercase border border-slate-600 shadow cursor-pointer transition-all active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
