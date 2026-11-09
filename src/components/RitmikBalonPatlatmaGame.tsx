import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, RotateCcw, X, Clock, SkipBack, SkipForward, Sparkles, Heart, HeartCrack, Volume2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

export type RitmikStep = 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface RitmikStepConfig {
  step: RitmikStep;
  title: string;
  shortTitle: string;
  rangeText: string;
  subtitle: string;
  sequence: number[];
  colorTheme: string;
}

export const RITMIK_CONFIGS: Record<RitmikStep, RitmikStepConfig> = {
  3: {
    step: 3,
    title: "3'er Ritmik Balon",
    shortTitle: "3'er Sayma",
    rangeText: "3 - 30",
    subtitle: "3'ten 30'a kadar sırayla balonları patlat!",
    sequence: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
    colorTheme: 'from-amber-500 to-orange-500',
  },
  4: {
    step: 4,
    title: "4'er Ritmik Balon",
    shortTitle: "4'er Sayma",
    rangeText: "4 - 40",
    subtitle: "4'ten 40'a kadar sırayla balonları patlat!",
    sequence: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    colorTheme: 'from-emerald-500 to-teal-500',
  },
  5: {
    step: 5,
    title: "5'er Ritmik Balon",
    shortTitle: "5'er Sayma",
    rangeText: "5 - 50",
    subtitle: "5'ten 50'ye kadar sırayla balonları patlat!",
    sequence: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    colorTheme: 'from-sky-500 to-blue-500',
  },
  6: {
    step: 6,
    title: "6'şar Ritmik Balon",
    shortTitle: "6'şar Sayma",
    rangeText: "6 - 60",
    subtitle: "6'dan 60'a kadar sırayla balonları patlat!",
    sequence: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60],
    colorTheme: 'from-purple-500 to-pink-500',
  },
  7: {
    step: 7,
    title: "7'şer Ritmik Balon",
    shortTitle: "7'şer Sayma",
    rangeText: "7 - 70",
    subtitle: "7'den 70'e kadar sırayla balonları patlat!",
    sequence: [7, 14, 21, 28, 35, 42, 49, 56, 63, 70],
    colorTheme: 'from-rose-500 to-red-500',
  },
  8: {
    step: 8,
    title: "8'er Ritmik Balon",
    shortTitle: "8'er Sayma",
    rangeText: "8 - 80",
    subtitle: "8'den 80'e kadar sırayla balonları patlat!",
    sequence: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
    colorTheme: 'from-cyan-500 to-sky-500',
  },
  9: {
    step: 9,
    title: "9'ar Ritmik Balon",
    shortTitle: "9'ar Sayma",
    rangeText: "9 - 90",
    subtitle: "9'dan 90'a kadar sırayla balonları patlat!",
    sequence: [9, 18, 27, 36, 45, 54, 63, 72, 81, 90],
    colorTheme: 'from-lime-500 to-emerald-500',
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

interface PoppedAnim {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface RitmikBalonPatlatmaGameProps {
  initialStep?: RitmikStep;
  onStepChange?: (step: RitmikStep) => void;
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

const ROUND_TIME_SECONDS = 100; // Kullanıcı kuralı: 100 saniye süre ver
const MAX_MISTAKES = 3;         // Kullanıcı kuralı: 3 hata yapan yanar

export const RitmikBalonPatlatmaGame: React.FC<RitmikBalonPatlatmaGameProps> = ({
  initialStep = 3,
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
  const [currentStep, setCurrentStep] = useState<RitmikStep>(initialStep);

  // Üst menüden ileri/geri butonlarıyla etkinlik değiştiğinde modu anında güncelle
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);
  const activeConfig = RITMIK_CONFIGS[currentStep] || RITMIK_CONFIGS[3];

  const p1Student = selectedStudentIds?.[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds?.[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  // Balon Listeleri
  const [p1Balloons, setP1Balloons] = useState<BalloonTile[]>([]);
  const [p2Balloons, setP2Balloons] = useState<BalloonTile[]>([]);

  // Patlatılan Sayılar
  const [p1Popped, setP1Popped] = useState<number[]>([]);
  const [p2Popped, setP2Popped] = useState<number[]>([]);

  // Hata Sayacı (0, 1, 2, 3 -> 3'te elenir)
  const [p1Mistakes, setP1Mistakes] = useState<number>(0);
  const [p2Mistakes, setP2Mistakes] = useState<number>(0);

  // Yanlış Tıklama Animasyonu için ID
  const [p1WrongId, setP1WrongId] = useState<string | null>(null);
  const [p2WrongId, setP2WrongId] = useState<string | null>(null);

  // Patlama Efekti Animasyonları
  const [p1PoppedAnims, setP1PoppedAnims] = useState<PoppedAnim[]>([]);
  const [p2PoppedAnims, setP2PoppedAnims] = useState<PoppedAnim[]>([]);

  // 100 Saniyelik Sayaç
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [finishTimeSeconds, setFinishTimeSeconds] = useState<number | null>(null);
  const roundStartTimeRef = useRef<number>(Date.now());

  // Sonuç Durumu
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

  // Sıradaki hedefler
  const currentP1Target = activeConfig.sequence[p1Popped.length] ?? null;
  const currentP2Target = activeConfig.sequence[p2Popped.length] ?? null;

  // Yeni Tur Kurulumu
  const setupRound = useCallback((stepToUse?: RitmikStep) => {
    const step = stepToUse || currentStep;
    const cfg = RITMIK_CONFIGS[step] || RITMIK_CONFIGS[3];
    const sequence = cfg.sequence;

    // Renk stillerini karıştır
    const shuffledColors = shuffleArray(BALLOON_COLOR_STYLES);

    // 1. Oyuncu için slotlar (rot: 0°)
    const p1Slots = generateBalloonSlots(0);
    const p1ShuffledSeq = shuffleArray(sequence);
    const p1List: BalloonTile[] = p1ShuffledSeq.map((val, idx) => ({
      id: `p1_balloon_${val}_${idx}`,
      value: val,
      x: p1Slots[idx].x,
      y: p1Slots[idx].y,
      colorStyle: shuffledColors[idx % shuffledColors.length],
    }));

    // 2. Oyuncu için slotlar (rot: 40° - farklı açı, aynı sayılar)
    const p2Slots = generateBalloonSlots(40);
    const p2ShuffledSeq = shuffleArray(sequence);
    const p2List: BalloonTile[] = p2ShuffledSeq.map((val, idx) => ({
      id: `p2_balloon_${val}_${idx}`,
      value: val,
      x: p2Slots[idx].x,
      y: p2Slots[idx].y,
      colorStyle: shuffledColors[(idx + 3) % shuffledColors.length],
    }));

    setP1Balloons(p1List);
    setP2Balloons(p2List);

    setP1Popped([]);
    setP2Popped([]);
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

  // İlk yüklemede ve mod değişiminde turu hazırla
  useEffect(() => {
    setupRound(currentStep);
  }, [currentStep, setupRound]);

  // Geri Sayım Sayacı (100 Saniye)
  useEffect(() => {
    if (!isTimerActive || winner !== null) return;

    if (timeLeft <= 0) {
      setIsTimerActive(false);
      // Süre doldu: En çok balon patlatan kazanır
      if (p1Popped.length > p2Popped.length) {
        setWinner('p1');
        onGameCompleted?.(0, 2);
      } else if (p2Popped.length > p1Popped.length) {
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
  }, [timeLeft, isTimerActive, winner, p1Popped.length, p2Popped.length, onGameCompleted, triggerSound]);

  // Balon Tıklama Mantığı
  const handleBalloonClick = (player: 'p1' | 'p2', balloon: BalloonTile) => {
    if (winner !== null || timeLeft <= 0) return;

    const isP1 = player === 'p1';
    const currentMistakes = isP1 ? p1Mistakes : p2Mistakes;
    const currentPopped = isP1 ? p1Popped : p2Popped;
    const currentTarget = activeConfig.sequence[currentPopped.length];

    // Oyuncu zaten 3 hata yapıp elenmişse tıklayamaz
    if (currentMistakes >= MAX_MISTAKES) return;

    // Balon zaten patlatılmışsa tıklanamaz
    if (currentPopped.includes(balloon.value)) return;

    // DOĞRU BALONA DOKUNULDU!
    if (balloon.value === currentTarget) {
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
        setTimeout(() => {
          setP1PoppedAnims(prev => prev.filter(a => a.id !== animItem.id));
        }, 800);
      } else {
        setP2PoppedAnims(prev => [...prev, animItem]);
        setTimeout(() => {
          setP2PoppedAnims(prev => prev.filter(a => a.id !== animItem.id));
        }, 800);
      }

      const nextPopped = [...currentPopped, balloon.value];
      if (isP1) {
        setP1Popped(nextPopped);
      } else {
        setP2Popped(nextPopped);
      }

      // KULLANICI KURALI: İLK BİTİREN KAZANIR!
      if (nextPopped.length >= activeConfig.sequence.length) {
        if (currentMistakes === 0) {
          setFinishTimeSeconds(Math.max(1, Math.floor((Date.now() - roundStartTimeRef.current) / 1000)));
        }
        setIsTimerActive(false);
        setWinner(player);
        setWinReason('all_popped');
        triggerSound('win');
        onGameCompleted?.(isP1 ? 0 : 1, 2);

        // Şampiyonluk Konfetisi
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { x: isP1 ? 0.3 : 0.7, y: 0.5 },
          });
        } catch {
          // ignore
        }
      }
    } else {
      // YANLIŞ BALONA DOKUNULDU!
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

      // KULLANICI KURALI: 3 HATA YAPAN YANAR!
      if (nextMistakes >= MAX_MISTAKES) {
        triggerSound('burn');
        const otherPlayer = isP1 ? 'p2' : 'p1';
        const otherMistakes = isP1 ? p2Mistakes : p1Mistakes;

        if (otherMistakes >= MAX_MISTAKES) {
          // İki oyuncu da yandı!
          setIsTimerActive(false);
          setWinner('tie');
          setWinReason('both_burned');
        } else {
          // Rakip kazandı!
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
          } catch {
            // ignore
          }
        }
      }
    }
  };

  // Üstteki başlık çubuğunda App tarafından açılan yuva (süre + canlar buraya basılır)
  const [statusSlot, setStatusSlot] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const find = () => document.getElementById('ritmik-status-slot');
    setStatusSlot(find());
    const t = window.setInterval(() => {
      const el = find();
      setStatusSlot(prev => (prev === el ? prev : el));
    }, 400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 60px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col bg-[#070d19] text-white select-none overflow-hidden font-sans"
    >
      <ActivityBackground theme="oyun" opacity={0.35} />

      {/* SÜRE + CANLAR: başlık çubuğundaki yuvaya taşınır; yuva yoksa oyunun sağ üstünde gösterilir */}
      {statusSlot
        ? createPortal(
            <>
          {/* 100 Saniye Süre */}
          <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border font-black text-xs sm:text-sm tracking-wider shadow-sm transition-all ${
            timeLeft <= 15
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-800/90 border-slate-600 text-amber-300'
          }`}>
            <Clock size={13} className={timeLeft <= 15 ? 'text-rose-400' : 'text-amber-400'} />
            <span>{timeLeft}s</span>
          </div>

          {/* 1. Oyuncu Hata Görselleri (Canlar) */}
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-red-950/80 border border-red-500/50 shadow-xs" title="1. Oyuncu Kalan Can (3 hata yapan yanar)">
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
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-blue-950/80 border border-blue-500/50 shadow-xs" title="2. Oyuncu Kalan Can (3 hata yapan yanar)">
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

            </>,
            statusSlot
          )
        : (
          <div className="absolute top-1 right-2 z-30 flex items-center gap-1 sm:gap-1.5">
          {/* 100 Saniye Süre */}
          <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border font-black text-xs sm:text-sm tracking-wider shadow-sm transition-all ${
            timeLeft <= 15
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-800/90 border-slate-600 text-amber-300'
          }`}>
            <Clock size={13} className={timeLeft <= 15 ? 'text-rose-400' : 'text-amber-400'} />
            <span>{timeLeft}s</span>
          </div>

          {/* 1. Oyuncu Hata Görselleri (Canlar) */}
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-red-950/80 border border-red-500/50 shadow-xs" title="1. Oyuncu Kalan Can (3 hata yapan yanar)">
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
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-blue-950/80 border border-blue-500/50 shadow-xs" title="2. Oyuncu Kalan Can (3 hata yapan yanar)">
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

          </div>
        )}

      {/* 2. DÜELLO ALANI: SOL KIRMIZI ARENA (1. OYUNCU) & SAĞ MAVİ ARENA (2. OYUNCU) */}
      <div className="flex-1 min-h-0 w-full flex flex-row relative overflow-hidden">

        {/* ----------------- SOL YARI: 1. OYUNCU (KIRMIZI ALAN) ----------------- */}
        <div className="w-1/2 h-full bg-gradient-to-b from-[#b91c1c]/90 via-[#991b1b]/80 to-[#7f1d1d]/90 flex flex-col items-center justify-between p-1.5 sm:p-2.5 border-r-2 sm:border-r-4 border-black/40 relative overflow-hidden">
          
          {/* Oyuncu Üst Bilgi Barı: İsim & Sıradaki Hedef */}
          <div className="w-full flex items-center justify-between gap-1.5 z-20 shrink-0">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm tracking-wide border border-white/20 shadow-xs">
              {p1Student ? `🔴 ${p1Student.name}` : '🔴 1. Oyuncu'}
            </span>

            {/* Sıradaki Hedef Balon Göstergesi */}
            {currentP1Target !== null && p1Mistakes < MAX_MISTAKES && (
              <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm border-2 border-white">
                <span>🎯 Hedef:</span>
                <span className="text-sm sm:text-base font-black">{currentP1Target}</span>
              </div>
            )}
          </div>

          {/* Ritmik İlerleme Şeridi */}
          <div className="w-full max-w-md flex items-center justify-center gap-1 sm:gap-1.5 py-1 z-20 shrink-0 overflow-x-auto no-scrollbar">
            {activeConfig.sequence.map((num, idx) => {
              const isPopped = p1Popped.includes(num);
              const isCurrent = currentP1Target === num;
              return (
                <div
                  key={idx}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-xs transition-all ${
                    isPopped
                      ? 'bg-emerald-500 text-white line-through opacity-70 scale-90'
                      : isCurrent
                      ? 'bg-amber-300 text-slate-950 scale-110 ring-2 ring-white shadow-lg animate-pulse'
                      : 'bg-black/30 text-white/70'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {/* SOL OYUN DAİRESİ (BALON ARENASI) */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            <div
              className={`relative w-[92vw] max-w-[min(44vw,68vh)] aspect-square bg-gradient-to-b from-sky-100 to-indigo-100 rounded-full border-[4px] sm:border-[6px] border-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
                winner === 'p1' ? 'ring-8 ring-amber-400 scale-[1.02]' : ''
              } ${p1Mistakes >= MAX_MISTAKES ? 'grayscale opacity-60' : ''}`}
            >
              {/* Arka plan bulut ve hava deseni */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />

              {/* 10 Balon */}
              {p1Balloons.map(b => {
                const isPopped = p1Popped.includes(b.value);
                const isWrong = p1WrongId === b.id;
                const isCurrent = currentP1Target === b.value;

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
                        : isCurrent
                        ? 'hover:scale-115 active:scale-95 animate-float'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Parlak 3B Balon Gövdesi */}
                    <div className={`relative w-full h-[88%] rounded-[50%_50%_50%_50%_/_42%_42%_58%_58%] bg-gradient-to-br ${b.colorStyle.gradient} border-2 ${b.colorStyle.border} shadow-lg ${b.colorStyle.shadow} flex items-center justify-center overflow-hidden`}>
                      {/* Üst-Sol Işıltı (Specular Glare) */}
                      <div className="absolute top-1 left-1.5 w-3 h-2 sm:w-4 sm:h-2.5 rounded-full bg-white/70 filter blur-[0.4px] rotate-[-25deg] pointer-events-none" />
                      
                      {/* Balon Üzerindeki Sayı */}
                      <span className={`font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl ${b.colorStyle.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10`}>
                        {b.value}
                      </span>
                    </div>

                    {/* Balon Düğümü (Knot) */}
                    <div className={`w-2 sm:w-2.5 h-1.5 sm:h-2 ${b.colorStyle.knot} rounded-xs -mt-0.5 shadow-sm`} />

                    {/* Balon İpi (String) */}
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

              {/* Elendi / Yandı Overlay */}
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

          {/* Skor Sayacı */}
          <div className="w-full flex items-center justify-between text-xs font-bold text-white/80 z-20 shrink-0 px-2">
            <span>Patlatılan: {p1Popped.length} / {activeConfig.sequence.length}</span>
            <span>Kalan Hata Hakkı: {Math.max(0, MAX_MISTAKES - p1Mistakes)}</span>
          </div>
        </div>

        {/* ----------------- SAĞ YARI: 2. OYUNCU (MAVİ ALAN) ----------------- */}
        <div className="w-1/2 h-full bg-gradient-to-b from-[#1d4ed8]/90 via-[#1e40af]/80 to-[#1e3a8a]/90 flex flex-col items-center justify-between p-1.5 sm:p-2.5 relative overflow-hidden">
          
          {/* Oyuncu Üst Bilgi Barı: İsim & Sıradaki Hedef */}
          <div className="w-full flex items-center justify-between gap-1.5 z-20 shrink-0">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm tracking-wide border border-white/20 shadow-xs">
              {p2Student ? `🔵 ${p2Student.name}` : '🔵 2. Oyuncu'}
            </span>

            {/* Sıradaki Hedef Balon Göstergesi */}
            {currentP2Target !== null && p2Mistakes < MAX_MISTAKES && (
              <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm border-2 border-white">
                <span>🎯 Hedef:</span>
                <span className="text-sm sm:text-base font-black">{currentP2Target}</span>
              </div>
            )}
          </div>

          {/* Ritmik İlerleme Şeridi */}
          <div className="w-full max-w-md flex items-center justify-center gap-1 sm:gap-1.5 py-1 z-20 shrink-0 overflow-x-auto no-scrollbar">
            {activeConfig.sequence.map((num, idx) => {
              const isPopped = p2Popped.includes(num);
              const isCurrent = currentP2Target === num;
              return (
                <div
                  key={idx}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg font-black text-[10px] sm:text-xs transition-all ${
                    isPopped
                      ? 'bg-emerald-500 text-white line-through opacity-70 scale-90'
                      : isCurrent
                      ? 'bg-amber-300 text-slate-950 scale-110 ring-2 ring-white shadow-lg animate-pulse'
                      : 'bg-black/30 text-white/70'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {/* SAĞ OYUN DAİRESİ (BALON ARENASI) */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            <div
              className={`relative w-[92vw] max-w-[min(44vw,68vh)] aspect-square bg-gradient-to-b from-sky-100 to-indigo-100 rounded-full border-[4px] sm:border-[6px] border-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
                winner === 'p2' ? 'ring-8 ring-amber-400 scale-[1.02]' : ''
              } ${p2Mistakes >= MAX_MISTAKES ? 'grayscale opacity-60' : ''}`}
            >
              {/* Arka plan bulut ve hava deseni */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />

              {/* 10 Balon */}
              {p2Balloons.map(b => {
                const isPopped = p2Popped.includes(b.value);
                const isWrong = p2WrongId === b.id;
                const isCurrent = currentP2Target === b.value;

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
                        : isCurrent
                        ? 'hover:scale-115 active:scale-95 animate-float'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Parlak 3B Balon Gövdesi */}
                    <div className={`relative w-full h-[88%] rounded-[50%_50%_50%_50%_/_42%_42%_58%_58%] bg-gradient-to-br ${b.colorStyle.gradient} border-2 ${b.colorStyle.border} shadow-lg ${b.colorStyle.shadow} flex items-center justify-center overflow-hidden`}>
                      {/* Üst-Sol Işıltı (Specular Glare) */}
                      <div className="absolute top-1 left-1.5 w-3 h-2 sm:w-4 sm:h-2.5 rounded-full bg-white/70 filter blur-[0.4px] rotate-[-25deg] pointer-events-none" />
                      
                      {/* Balon Üzerindeki Sayı */}
                      <span className={`font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl ${b.colorStyle.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10`}>
                        {b.value}
                      </span>
                    </div>

                    {/* Balon Düğümü (Knot) */}
                    <div className={`w-2 sm:w-2.5 h-1.5 sm:h-2 ${b.colorStyle.knot} rounded-xs -mt-0.5 shadow-sm`} />

                    {/* Balon İpi (String) */}
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

              {/* Elendi / Yandı Overlay */}
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

          {/* Skor Sayacı */}
          <div className="w-full flex items-center justify-between text-xs font-bold text-white/80 z-20 shrink-0 px-2">
            <span>Patlatılan: {p2Popped.length} / {activeConfig.sequence.length}</span>
            <span>Kalan Hata Hakkı: {Math.max(0, MAX_MISTAKES - p2Mistakes)}</span>
          </div>
        </div>

      </div>

      {/* 3. ALT DOCK: AKILLI TAHTA ÖĞRENCİ SEÇİCİ */}
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

      {/* 4. ZAFER / OYUN SONU MODALI */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0f172a] border-4 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl animate-scale-up">
            
            {/* Kupa İkonu */}
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-amber-300 animate-bounce">
              <Trophy size={44} className="text-slate-950" />
            </div>

            {winner === 'tie' ? (
              <>
                <h3 className="text-2xl font-black text-amber-300 tracking-wide uppercase">
                  Dostluk Kazandı! (Berabere)
                </h3>
                <p className="text-sm text-slate-300 mt-2 font-medium">
                  {winReason === 'both_burned'
                    ? 'İki yarışmacı da 3 hata yaptı!'
                    : 'Süre bittiğinde iki oyuncunun da patlattığı balon sayısı eşitti!'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide uppercase">
                  Tebrikler! Kazanan:
                </h3>
                <div className="mt-2 py-2 px-4 rounded-2xl bg-white/10 border border-white/20 inline-block">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {winner === 'p1'
                      ? p1Student ? `🔴 ${p1Student.name}` : '1. OYUNCU'
                      : p2Student ? `🔵 ${p2Student.name}` : '2. OYUNCU'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium">
                  {winReason === 'all_popped'
                    ? 'Tüm balonları sırasıyla ilk bitirerek şampiyon oldu! 🎈🏆'
                    : winReason === 'opponent_burned'
                    ? 'Rakip 3 hata yaparak elendi, şampiyon belli oldu! 🎯'
                    : '100 saniye sonunda en çok balon patlatan oyuncu oldu! ⏱️'}
                </p>
                {winReason === 'all_popped' &&
                  (winner === 'p1' ? p1Mistakes : p2Mistakes) === 0 &&
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
                <div className="text-xl font-black text-white mt-0.5">{p1Popped.length} / 10</div>
                <div className="text-[10px] text-red-400 mt-0.5">{p1Mistakes} Hata</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="text-[11px] font-bold text-blue-300">2. Oyuncu</div>
                <div className="text-xl font-black text-white mt-0.5">{p2Popped.length} / 10</div>
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
