import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, X, SkipBack, SkipForward, Sparkles, Star, Heart, HeartCrack, Clock, Lightbulb, Users, User, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface RoundingGameConfig {
  topicKey: string;
  unit: 10 | 100;
  grade: 2 | 3 | 4;
  min: number;
  max: number;
  title: string;
  statsTopic: string;
  categoryKey: 'grade2' | 'grade3' | 'grade4';
}

const ROUNDING_CONFIGS: Record<string, RoundingGameConfig> = {
  en_yakin_onluk_oyunu: {
    topicKey: 'en_yakin_onluk_oyunu', unit: 10, grade: 2, min: 11, max: 99,
    title: 'En Yakın Onluğa Yuvarlama Oyunu', statsTopic: 'en_yakin_onluk', categoryKey: 'grade2',
  },
  g3_onluk_yuvarlama_oyunu: {
    topicKey: 'g3_onluk_yuvarlama_oyunu', unit: 10, grade: 3, min: 101, max: 999,
    title: "En Yakın Onluğa Yuvarlama Oyunu (1000'e Kadar)", statsTopic: 'g3_en_yakin_onluga_yuvarlama', categoryKey: 'grade3',
  },
  g3_yuzluk_yuvarlama_oyunu: {
    topicKey: 'g3_yuzluk_yuvarlama_oyunu', unit: 100, grade: 3, min: 101, max: 999,
    title: "En Yakın Yüzlüğe Yuvarlama Oyunu (1000'e Kadar)", statsTopic: 'g3_en_yakin_yuzluge_yuvarlama', categoryKey: 'grade3',
  },
  g4_onluk_yuvarlama_oyunu: {
    topicKey: 'g4_onluk_yuvarlama_oyunu', unit: 10, grade: 4, min: 1001, max: 9999,
    title: 'En Yakın Onluğa Yuvarlama Oyunu (4 Basamaklı)', statsTopic: 'g4_en_yakin_onluk_yuzluk', categoryKey: 'grade4',
  },
  g4_yuzluk_yuvarlama_oyunu: {
    topicKey: 'g4_yuzluk_yuvarlama_oyunu', unit: 100, grade: 4, min: 1001, max: 9999,
    title: 'En Yakın Yüzlüğe Yuvarlama Oyunu (4 Basamaklı)', statsTopic: 'g4_en_yakin_onluk_yuzluk', categoryKey: 'grade4',
  },
};

export function isRoundingGameKey(key?: string | null): boolean {
  return !!key && Object.prototype.hasOwnProperty.call(ROUNDING_CONFIGS, key);
}

export function getRoundingGameConfig(key?: string | null): RoundingGameConfig {
  return (key && ROUNDING_CONFIGS[key]) || ROUNDING_CONFIGS.en_yakin_onluk_oyunu;
}

const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('tr-TR') : String(n));

interface Question {
  target: number;
  leftTen: number;
  rightTen: number;
  correctSide: 'left' | 'right';
}

function generateQuestion(cfg: RoundingGameConfig, usedTargets: number[] = []): Question {
  const { unit, min, max } = cfg;
  const allEligibleTargets: number[] = [];
  const unseenTargets: number[] = [];
  for (let value = min; value <= max; value++) {
    if (value % unit === 0) continue;
    allEligibleTargets.push(value);
    if (!usedTargets.includes(value)) unseenTargets.push(value);
  }
  const targetPool = unseenTargets.length > 0 ? unseenTargets : allEligibleTargets;
  const target = targetPool[Math.floor(Math.random() * targetPool.length)];

  const leftTen = Math.floor(target / unit) * unit;
  const rightTen = leftTen + unit;
  return {
    target,
    leftTen,
    rightTen,
    correctSide: target - leftTen < rightTen - target ? 'left' : 'right',
  };
}

interface EnYakinOnlugaYuvarlamaGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  soundEnabled?: boolean;
  grade?: number;
  topicKey?: string;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  playerCountMode?: 1 | 2 | 3;
}

const TARGET_CORRECT = 7;
const TOTAL_QUESTIONS = 7;
const MAX_MISTAKES = 3;
const TIME_LIMIT = 100;
const SITE_FONT = "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

interface PlayerState {
  question: Question;
  questionNo: number;
  usedTargets: number[];
  correctCount: number;
  score: number;
  mistakes: number;
  feedback: null | { correct: boolean; picked: 'left' | 'right' };
  shakeSide: 'left' | 'right' | null;
  isFinished: boolean;
  isEliminated: boolean;
  isLocked: boolean;
}

export const EnYakinOnlugaYuvarlamaGame: React.FC<EnYakinOnlugaYuvarlamaGameProps> = ({
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3,
  grade = 2,
  topicKey,
  students,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  playerCountMode = 1,
}) => {
  const cfg = getRoundingGameConfig(topicKey);
  const unitWord = cfg.unit === 10 ? 'Onluk' : 'Yüzlük';
  const unitDat = cfg.unit === 10 ? 'onluğuna' : 'yüzlüğüne';
  const unitDatQ = cfg.unit === 10 ? 'onluğa' : 'yüzlüğe';

  // 1 Kişilik / 2 Kişilik Mod
  const [playerMode, setPlayerMode] = useState<1 | 2>(playerCountMode === 2 ? 2 : 1);

  // Ortak Süre
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [endReason, setEndReason] = useState<'done' | 'lives' | 'time'>('done');
  const [duelWinner, setDuelWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);

  // 1. Oyuncu Durumu
  const [p1, setP1] = useState<PlayerState>(() => ({
    question: generateQuestion(cfg),
    questionNo: 1,
    usedTargets: [],
    correctCount: 0,
    score: 0,
    mistakes: 0,
    feedback: null,
    shakeSide: null,
    isFinished: false,
    isEliminated: false,
    isLocked: false,
  }));

  // 2. Oyuncu Durumu (2 Kişilik Kapışma için)
  const [p2, setP2] = useState<PlayerState>(() => ({
    question: generateQuestion(cfg),
    questionNo: 1,
    usedTargets: [],
    correctCount: 0,
    score: 0,
    mistakes: 0,
    feedback: null,
    shakeSide: null,
    isFinished: false,
    isEliminated: false,
    isLocked: false,
  }));

  const p1TimerRef = useRef<number | null>(null);
  const p2TimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (p1TimerRef.current !== null) {
      window.clearTimeout(p1TimerRef.current);
      p1TimerRef.current = null;
    }
    if (p2TimerRef.current !== null) {
      window.clearTimeout(p2TimerRef.current);
      p2TimerRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  // Öğrenci Adları
  const p1Student = selectedStudentIds?.[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds?.[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  const p1Name = p1Student ? p1Student.name.split(' ')[0] : '1. Oyuncu';
  const p2Name = p2Student ? p2Student.name.split(' ')[0] : '2. Oyuncu';

  // 100 Saniyelik Hafif Zamanlayıcı
  useEffect(() => {
    if (gameOver) return;
    const interval = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameOver]);

  // Süre Dolduğunda Oyunu Bitir
  useEffect(() => {
    if (!gameOver && timeLeft === 0) {
      playMp3?.('/hata.mp3');
      finishGame('time');
    }
  }, [timeLeft, gameOver, playMp3]);

  // Oyun Sonu Hesaplama
  const finishGame = useCallback((reason: 'done' | 'lives' | 'time', winnerOverride?: 'p1' | 'p2' | 'tie') => {
    clearTimers();
    setEndReason(reason);
    setGameOver(true);

    if (playerMode === 2) {
      if (winnerOverride) {
        setDuelWinner(winnerOverride);
      } else {
        // 2 Kişilik Düelloda Kazananı Belirle
        setP1(currP1 => {
          setP2(currP2 => {
            let win: 'p1' | 'p2' | 'tie' = 'tie';
            if (currP1.isEliminated && !currP2.isEliminated) {
              win = 'p2';
            } else if (currP2.isEliminated && !currP1.isEliminated) {
              win = 'p1';
            } else if (currP1.isFinished && !currP2.isFinished) {
              win = 'p1';
            } else if (currP2.isFinished && !currP1.isFinished) {
              win = 'p2';
            } else if (currP1.score > currP2.score) {
              win = 'p1';
            } else if (currP2.score > currP1.score) {
              win = 'p2';
            } else {
              win = 'tie';
            }
            setDuelWinner(win);
            return currP2;
          });
          return currP1;
        });
      }
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  }, [playerMode]);

  // 1. Oyuncunun Cevap Vermesi
  const handleAnswerP1 = (side: 'left' | 'right') => {
    if (p1.isLocked || p1.isFinished || p1.isEliminated || gameOver) return;

    const isCorrect = side === p1.question.correctSide;
    const newMistakes = isCorrect ? p1.mistakes : p1.mistakes + 1;
    const newCorrectCount = isCorrect ? p1.correctCount + 1 : p1.correctCount;
    const isEliminated = newMistakes >= MAX_MISTAKES;
    const isFinished = newCorrectCount >= TARGET_CORRECT;

    setP1(prev => ({
      ...prev,
      isLocked: true,
      feedback: { correct: isCorrect, picked: side },
      shakeSide: isCorrect ? null : side,
      mistakes: newMistakes,
      isEliminated,
      isFinished,
      score: isCorrect ? prev.score + 10 : prev.score,
      correctCount: newCorrectCount,
    }));

    onQuestionAnswered?.(isCorrect, 0);

    if (isCorrect) {
      playMp3?.('/ding.mp3');
      if (isFinished) {
        p1TimerRef.current = window.setTimeout(() => {
          finishGame('done', playerMode === 2 ? 'p1' : undefined);
        }, 600);
      } else {
        p1TimerRef.current = window.setTimeout(() => {
          setP1(prev => {
            const usedTargets = [...prev.usedTargets, prev.question.target];
            return {
              ...prev,
              questionNo: prev.questionNo + 1,
              question: generateQuestion(cfg, usedTargets),
              usedTargets,
              feedback: null,
              shakeSide: null,
              isLocked: false,
            };
          });
        }, 700);
      }
    } else {
      playMp3?.('/hata.mp3');
      if (isEliminated) {
        p1TimerRef.current = window.setTimeout(() => {
          finishGame('lives', playerMode === 2 ? 'p2' : undefined);
        }, 800);
      } else {
        p1TimerRef.current = window.setTimeout(() => {
          setP1(prev => {
            const usedTargets = [...prev.usedTargets, prev.question.target];
            return {
              ...prev,
              usedTargets,
              shakeSide: null,
              isLocked: false,
              feedback: null,
              questionNo: prev.questionNo + 1,
              question: generateQuestion(cfg, usedTargets),
            };
          });
        }, 900);
      }
    }
  };

  // 2. Oyuncunun Cevap Vermesi (2 Kişilik Mod)
  const handleAnswerP2 = (side: 'left' | 'right') => {
    if (p2.isLocked || p2.isFinished || p2.isEliminated || gameOver) return;

    const isCorrect = side === p2.question.correctSide;
    const newMistakes = isCorrect ? p2.mistakes : p2.mistakes + 1;
    const newCorrectCount = isCorrect ? p2.correctCount + 1 : p2.correctCount;
    const isEliminated = newMistakes >= MAX_MISTAKES;
    const isFinished = newCorrectCount >= TARGET_CORRECT;

    setP2(prev => ({
      ...prev,
      isLocked: true,
      feedback: { correct: isCorrect, picked: side },
      shakeSide: isCorrect ? null : side,
      mistakes: newMistakes,
      isEliminated,
      isFinished,
      score: isCorrect ? prev.score + 10 : prev.score,
      correctCount: newCorrectCount,
    }));

    onQuestionAnswered?.(isCorrect, 1);

    if (isCorrect) {
      playMp3?.('/ding.mp3');
      if (isFinished) {
        p2TimerRef.current = window.setTimeout(() => {
          finishGame('done', 'p2');
        }, 600);
      } else {
        p2TimerRef.current = window.setTimeout(() => {
          setP2(prev => {
            const usedTargets = [...prev.usedTargets, prev.question.target];
            return {
              ...prev,
              questionNo: prev.questionNo + 1,
              question: generateQuestion(cfg, usedTargets),
              usedTargets,
              feedback: null,
              shakeSide: null,
              isLocked: false,
            };
          });
        }, 700);
      }
    } else {
      playMp3?.('/hata.mp3');
      if (isEliminated) {
        p2TimerRef.current = window.setTimeout(() => {
          finishGame('lives', 'p1');
        }, 800);
      } else {
        p2TimerRef.current = window.setTimeout(() => {
          setP2(prev => {
            const usedTargets = [...prev.usedTargets, prev.question.target];
            return {
              ...prev,
              usedTargets,
              shakeSide: null,
              isLocked: false,
              feedback: null,
              questionNo: prev.questionNo + 1,
              question: generateQuestion(cfg, usedTargets),
            };
          });
        }, 900);
      }
    }
  };

  // Yeniden Başlat
  const handleRestart = () => {
    clearTimers();
    setTimeLeft(TIME_LIMIT);
    setGameOver(false);
    setEndReason('done');
    setDuelWinner(null);

    setP1({
      question: generateQuestion(cfg),
      questionNo: 1,
      usedTargets: [],
      correctCount: 0,
      score: 0,
      mistakes: 0,
      feedback: null,
      shakeSide: null,
      isFinished: false,
      isEliminated: false,
      isLocked: false,
    });

    setP2({
      question: generateQuestion(cfg),
      questionNo: 1,
      usedTargets: [],
      correctCount: 0,
      score: 0,
      mistakes: 0,
      feedback: null,
      shakeSide: null,
      isFinished: false,
      isEliminated: false,
      isLocked: false,
    });

    playMp3?.('/op.mp3');
  };

  // Mod Değiştir
  const handleSwitchMode = (mode: 1 | 2) => {
    if (mode === playerMode) return;
    setPlayerMode(mode);
    handleRestart();
  };

  // Sayı Doğrusu Hesaplayıcı (Hafif ve Sıfır Kasan SVG/DOM)
  const renderNumberLine = (q: Question, isCompact = false) => {
    const step = cfg.unit / 10;
    const ticks: number[] = [];
    for (let k = 0; k <= 10; k++) ticks.push(q.leftTen + k * step);
    const targetPct = Math.max(0, Math.min(100, ((q.target - q.leftTen) / (q.rightTen - q.leftTen)) * 100));

    return (
      <div className={`w-full bg-emerald-950/80 border border-emerald-500/40 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 ${isCompact ? 'py-1.5' : 'py-2 sm:py-3'} shadow-md`}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] sm:text-xs font-black text-emerald-300 flex items-center gap-1">
            📏 Sayı Doğrusu
          </span>
          <span className="text-[9px] sm:text-[11px] text-emerald-200/70 font-semibold">
            {fmt(q.target)} kime daha yakın?
          </span>
        </div>
        <div className={`relative mx-4 sm:mx-6 ${isCompact ? 'mt-5 mb-4 h-4' : 'mt-7 mb-5 h-5'}`}>
          {/* Çizgi */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-700/60 rounded-full" />
          {/* Çentikler */}
          {ticks.map((v, k) => {
            const isExtreme = k === 0 || k === 10;
            return (
              <div
                key={v}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${k * 10}%` }}
              >
                <div
                  className={`rounded-full border ${
                    isExtreme
                      ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-amber-400 border-white'
                      : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 border-transparent'
                  }`}
                />
                <span
                  className={`mt-1 font-bold tabular-nums whitespace-nowrap ${
                    isExtreme ? 'text-[9px] sm:text-xs text-amber-300 font-black' : 'hidden md:inline text-[8px] text-emerald-300/80'
                  }`}
                >
                  {fmt(v)}
                </span>
              </div>
            );
          })}
          {/* Hedef Sayı İşareti */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            style={{ left: `${targetPct}%` }}
          >
            <div className="absolute -top-6 bg-red-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded shadow whitespace-nowrap">
              {fmt(q.target)} 📍
            </div>
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-white shadow" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)', fontFamily: SITE_FONT }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col select-none overflow-hidden bg-gradient-to-b from-[#0a182b] via-[#0f243e] to-[#06101d] text-white"
    >
      {/* ÜST KONTROL & BİLGİ ŞERİDİ */}
      <div className="relative z-30 px-3 sm:px-6 py-2 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between shrink-0 flex-wrap gap-2">
        {/* Sol: Başlık ve Mod Değiştirme Butonu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🎯</span>
            <span className="font-black text-sm sm:text-base text-cyan-300 hidden md:inline">
              {cfg.title}
            </span>
          </div>

          {/* 1 Kişilik / 2 Kişilik Mod Butonları */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-cyan-500/40 shadow-inner">
            <button
              onClick={() => handleSwitchMode(1)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 1
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>1 Kişilik</span>
            </button>
            <button
              onClick={() => handleSwitchMode(2)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 2
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>2 Kişilik Kapışma</span>
            </button>
          </div>
        </div>

        {/* Orta: Süre ve Oyun Bilgisi */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-xs font-black text-emerald-300 shadow">
            <span>🎯 7 Doğru Yapan Bitirir • 3 Hata Yapan Yanar</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 shadow">
            <Clock size={16} className={timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-cyan-400'} />
            <span className={`font-black text-sm sm:text-base tabular-nums ${timeLeft <= 15 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Sağ: Kontrol Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw size={16} />
          </button>
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all cursor-pointer"
              title="Önceki Etkinlik"
            >
              <SkipBack size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-all cursor-pointer font-bold text-xs flex items-center gap-1"
              title="Sonraki Etkinlik"
            >
              <SkipForward size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black border border-red-400 transition-all cursor-pointer shadow ml-1"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 1 KİŞİLİK OYUN ALANI */}
      {playerMode === 1 && (
        <div className="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-between p-2 sm:p-4 max-w-4xl mx-auto w-full overflow-y-auto">
          {/* Oyuncu Durum Hapı */}
          <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl px-4 py-2 flex items-center justify-between shadow-lg">
            {/* Canlar */}
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_MISTAKES }).map((_, i) =>
                i < MAX_MISTAKES - p1.mistakes ? (
                  <Heart key={i} size={22} className="text-rose-500 fill-rose-500" />
                ) : (
                  <HeartCrack key={i} size={22} className="text-slate-600" />
                )
              )}
            </div>

            {/* Doğru Hedefi */}
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-xl">
              <span>🎯 Hedef:</span>
              <span className="text-base sm:text-lg text-white tabular-nums">{p1.correctCount} / {TARGET_CORRECT} Doğru</span>
            </div>

            {/* Puan */}
            <div className="flex items-center gap-1.5 font-black text-base sm:text-xl text-amber-400">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              <span>{p1.score} Puan</span>
            </div>
          </div>

          {/* Soru Gövdesi */}
          <div className="flex-1 w-full flex flex-col items-center justify-center my-3 gap-4">
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              Bu sayı hangi {unitDatQ} daha yakın? Seçimini yap!
            </span>

            {/* Yan Yana Butonlar ve Merkez Sayı */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-8">
              {/* Sol Onluk Butonu */}
              <button
                onClick={() => handleAnswerP1('left')}
                disabled={p1.isLocked || gameOver}
                className={`flex-1 max-w-[220px] h-28 sm:h-36 rounded-3xl border-b-6 flex flex-col items-center justify-center text-white font-black shadow-xl transition-all cursor-pointer select-none active:scale-95 ${
                  p1.feedback?.picked === 'left'
                    ? p1.feedback.correct
                      ? 'bg-emerald-500 border-emerald-700 ring-4 ring-emerald-300'
                      : 'bg-red-500 border-red-700 ring-4 ring-red-300'
                    : 'bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 border-blue-900'
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase font-bold opacity-80 mb-0.5">Sol {unitWord}</span>
                <span className="text-3xl sm:text-5xl md:text-6xl tabular-nums drop-shadow">{fmt(p1.question.leftTen)}</span>
              </button>

              {/* Merkez Sayı Rozeti */}
              <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 border-4 sm:border-6 border-white shadow-2xl flex flex-col items-center justify-center z-10">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-950 bg-white/80 px-2 py-0.2 rounded-full mb-0.5">
                  Sayı
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tabular-nums leading-none">
                  {fmt(p1.question.target)}
                </span>
              </div>

              {/* Sağ Onluk Butonu */}
              <button
                onClick={() => handleAnswerP1('right')}
                disabled={p1.isLocked || gameOver}
                className={`flex-1 max-w-[220px] h-28 sm:h-36 rounded-3xl border-b-6 flex flex-col items-center justify-center text-white font-black shadow-xl transition-all cursor-pointer select-none active:scale-95 ${
                  p1.feedback?.picked === 'right'
                    ? p1.feedback.correct
                      ? 'bg-emerald-500 border-emerald-700 ring-4 ring-emerald-300'
                      : 'bg-red-500 border-red-700 ring-4 ring-red-300'
                    : 'bg-gradient-to-b from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 border-purple-900'
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase font-bold opacity-80 mb-0.5">Sağ {unitWord}</span>
                <span className="text-3xl sm:text-5xl md:text-6xl tabular-nums drop-shadow">{fmt(p1.question.rightTen)}</span>
              </button>
            </div>

            {/* Sayı Doğrusu Yardımı */}
            <div className="w-full mt-2">
              {renderNumberLine(p1.question, false)}
            </div>
          </div>
        </div>
      )}

      {/* 2 KİŞİLİK KAPIŞMA (DÜELLO) ALANI - AKILLI TAHTADA YAN YANA İKİ ÖĞRENCİ */}
      {playerMode === 2 && (
        <div className="relative z-20 flex-1 min-h-0 flex items-stretch divide-x-2 divide-cyan-500/30 p-1 sm:p-2 overflow-y-auto">
          {/* 1. OYUNCU (SOL TARAF - MAVİ TAKIM) */}
          <div className="flex-1 flex flex-col justify-between px-2 sm:px-4 py-1.5">
            {/* Üst Kartuş */}
            <div className="bg-sky-950/80 border border-sky-400/50 rounded-2xl p-2 flex items-center justify-between shadow">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                <span className="font-black text-xs sm:text-sm text-sky-200 truncate max-w-[100px]">{p1Name}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: MAX_MISTAKES }).map((_, i) =>
                  i < MAX_MISTAKES - p1.mistakes ? (
                    <Heart key={i} size={16} className="text-rose-500 fill-rose-500" />
                  ) : (
                    <HeartCrack key={i} size={16} className="text-slate-600" />
                  )
                )}
              </div>
              <div className="font-black text-xs text-amber-300">
                {p1.score} P <span className="text-emerald-300 font-bold">({p1.correctCount}/{TARGET_CORRECT} Doğru)</span>
              </div>
            </div>

            {/* Soru & Butonlar */}
            <div className="flex-1 flex flex-col items-center justify-center my-2 gap-2 sm:gap-3">
              {/* Hedef Sayı */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-3 border-white shadow-lg flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-amber-950 bg-white/80 px-1.5 rounded-full">Sayı</span>
                <span className="text-2xl sm:text-4xl font-black text-slate-950 tabular-nums">{fmt(p1.question.target)}</span>
              </div>

              {/* Sol ve Sağ Seçenek Butonları */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleAnswerP1('left')}
                  disabled={p1.isLocked || p1.isEliminated || gameOver}
                  className={`flex-1 h-20 sm:h-24 rounded-2xl border-b-4 flex flex-col items-center justify-center text-white font-black shadow transition-all cursor-pointer active:scale-95 ${
                    p1.feedback?.picked === 'left'
                      ? p1.feedback.correct
                        ? 'bg-emerald-500 border-emerald-700'
                        : 'bg-red-500 border-red-700'
                      : 'bg-gradient-to-b from-sky-400 to-blue-600 border-blue-900'
                  }`}
                >
                  <span className="text-[9px] uppercase opacity-75">Sol</span>
                  <span className="text-xl sm:text-3xl tabular-nums">{fmt(p1.question.leftTen)}</span>
                </button>

                <button
                  onClick={() => handleAnswerP1('right')}
                  disabled={p1.isLocked || p1.isEliminated || gameOver}
                  className={`flex-1 h-20 sm:h-24 rounded-2xl border-b-4 flex flex-col items-center justify-center text-white font-black shadow transition-all cursor-pointer active:scale-95 ${
                    p1.feedback?.picked === 'right'
                      ? p1.feedback.correct
                        ? 'bg-emerald-500 border-emerald-700'
                        : 'bg-red-500 border-red-700'
                      : 'bg-gradient-to-b from-indigo-500 to-blue-700 border-indigo-900'
                  }`}
                >
                  <span className="text-[9px] uppercase opacity-75">Sağ</span>
                  <span className="text-xl sm:text-3xl tabular-nums">{fmt(p1.question.rightTen)}</span>
                </button>
              </div>

              {/* Kompakt Sayı Doğrusu */}
              <div className="w-full">
                {renderNumberLine(p1.question, true)}
              </div>
            </div>

            {p1.isEliminated && (
              <div className="py-1 px-2 rounded-lg bg-red-950/90 border border-red-500/60 text-center text-red-200 text-xs font-bold">
                💔 3 Hata Yaptın! (Elendin)
              </div>
            )}
            {p1.isFinished && !p1.isEliminated && (
              <div className="py-1 px-2 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-center text-emerald-200 text-xs font-bold">
                ⭐ 7 Doğru Tamamlandı! Tebrikler!
              </div>
            )}
          </div>

          {/* 2. OYUNCU (SAĞ TARAF - KIRMIZI/MOR TAKIM) */}
          <div className="flex-1 flex flex-col justify-between px-2 sm:px-4 py-1.5">
            {/* Üst Kartuş */}
            <div className="bg-rose-950/80 border border-rose-400/50 rounded-2xl p-2 flex items-center justify-between shadow">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center">2</span>
                <span className="font-black text-xs sm:text-sm text-rose-200 truncate max-w-[100px]">{p2Name}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: MAX_MISTAKES }).map((_, i) =>
                  i < MAX_MISTAKES - p2.mistakes ? (
                    <Heart key={i} size={16} className="text-rose-500 fill-rose-500" />
                  ) : (
                    <HeartCrack key={i} size={16} className="text-slate-600" />
                  )
                )}
              </div>
              <div className="font-black text-xs text-amber-300">
                {p2.score} P <span className="text-emerald-300 font-bold">({p2.correctCount}/{TARGET_CORRECT} Doğru)</span>
              </div>
            </div>

            {/* Soru & Butonlar */}
            <div className="flex-1 flex flex-col items-center justify-center my-2 gap-2 sm:gap-3">
              {/* Hedef Sayı */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-3 border-white shadow-lg flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-amber-950 bg-white/80 px-1.5 rounded-full">Sayı</span>
                <span className="text-2xl sm:text-4xl font-black text-slate-950 tabular-nums">{fmt(p2.question.target)}</span>
              </div>

              {/* Sol ve Sağ Seçenek Butonları */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleAnswerP2('left')}
                  disabled={p2.isLocked || p2.isEliminated || gameOver}
                  className={`flex-1 h-20 sm:h-24 rounded-2xl border-b-4 flex flex-col items-center justify-center text-white font-black shadow transition-all cursor-pointer active:scale-95 ${
                    p2.feedback?.picked === 'left'
                      ? p2.feedback.correct
                        ? 'bg-emerald-500 border-emerald-700'
                        : 'bg-red-500 border-red-700'
                      : 'bg-gradient-to-b from-fuchsia-500 to-purple-600 border-purple-900'
                  }`}
                >
                  <span className="text-[9px] uppercase opacity-75">Sol</span>
                  <span className="text-xl sm:text-3xl tabular-nums">{fmt(p2.question.leftTen)}</span>
                </button>

                <button
                  onClick={() => handleAnswerP2('right')}
                  disabled={p2.isLocked || p2.isEliminated || gameOver}
                  className={`flex-1 h-20 sm:h-24 rounded-2xl border-b-4 flex flex-col items-center justify-center text-white font-black shadow transition-all cursor-pointer active:scale-95 ${
                    p2.feedback?.picked === 'right'
                      ? p2.feedback.correct
                        ? 'bg-emerald-500 border-emerald-700'
                        : 'bg-red-500 border-red-700'
                      : 'bg-gradient-to-b from-rose-500 to-pink-600 border-rose-900'
                  }`}
                >
                  <span className="text-[9px] uppercase opacity-75">Sağ</span>
                  <span className="text-xl sm:text-3xl tabular-nums">{fmt(p2.question.rightTen)}</span>
                </button>
              </div>

              {/* Kompakt Sayı Doğrusu */}
              <div className="w-full">
                {renderNumberLine(p2.question, true)}
              </div>
            </div>

            {p2.isEliminated && (
              <div className="py-1 px-2 rounded-lg bg-red-950/90 border border-red-500/60 text-center text-red-200 text-xs font-bold">
                💔 3 Hata Yaptın! (Elendin)
              </div>
            )}
            {p2.isFinished && !p2.isEliminated && (
              <div className="py-1 px-2 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-center text-emerald-200 text-xs font-bold">
                ⭐ 7 Doğru Tamamlandı! Tebrikler!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALT: ÖĞRENCİ SEÇİM ÇUBUĞU (1 veya 2 Kişilik) */}
      {students && onOpenRosterModal && (
        <div className="relative w-full shrink-0 z-40 px-1 sm:px-2 pb-0.5 mt-auto bg-slate-950/90 border-t border-slate-800">
          <StudentAvatarDock
            students={students}
            currentGrade={grade}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds || []}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* SONUÇ PENCERESİ (1 KİŞİLİK VEYA 2 KİŞİLİK DÜELLO) */}
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-3">
          <div className="relative w-full max-w-md bg-[#0f172a] border-4 border-amber-400 rounded-3xl p-5 text-center text-white shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
              <Trophy size={32} className="text-slate-950" />
            </div>

            {playerMode === 2 ? (
              <>
                <h2 className="text-2xl font-black mb-1 text-amber-300">
                  {duelWinner === 'p1'
                    ? `🏆 ${p1Name} Kazandı!`
                    : duelWinner === 'p2'
                    ? `🏆 ${p2Name} Kazandı!`
                    : '🤝 Berabere!'}
                </h2>
                <p className="text-xs text-slate-300 mb-3">
                  {endReason === 'lives'
                    ? `💔 ${duelWinner === 'p1' ? p2Name : p1Name} 3 hata yaparak elendi!`
                    : endReason === 'done'
                    ? `⚡ ${duelWinner === 'p1' ? p1Name : p2Name} 7 doğru cevaba ilk ulaşarak kazandı!`
                    : '⏰ 100 Saniye Süre Doldu!'}
                </p>

                {/* Skor Karşılaştırması */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2.5 rounded-xl border ${duelWinner === 'p1' ? 'bg-sky-950/90 border-sky-400' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="text-xs font-bold text-sky-300 truncate">{p1Name}</div>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">{p1.score} P</div>
                    <div className="text-[11px] text-slate-300">{p1.correctCount} Doğru • {p1.mistakes} Hata</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${duelWinner === 'p2' ? 'bg-rose-950/90 border-rose-400' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="text-xs font-bold text-rose-300 truncate">{p2Name}</div>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">{p2.score} P</div>
                    <div className="text-[11px] text-slate-300">{p2.correctCount} Doğru • {p2.mistakes} Hata</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase mb-1.5">
                  {endReason === 'done' ? '7 Doğru Tamamlandı' : endReason === 'lives' ? '3 Hata Yapıldı' : '100 Saniye Doldu'}
                </div>
                <h2 className="text-2xl font-black mb-1">
                  {endReason === 'lives'
                    ? '💔 Elendin!'
                    : endReason === 'time'
                    ? '⏰ Süre Bitti!'
                    : p1.correctCount >= TARGET_CORRECT
                    ? '🌟 Harika! 7 Doğru Tamam!'
                    : '👏 Çok İyi!'}
                </h2>
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 mb-4 flex items-center justify-around">
                  <div className="text-center">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">Doğru</div>
                    <div className="text-xl font-black text-emerald-400">{p1.correctCount} / {TARGET_CORRECT}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-700" />
                  <div className="text-center">
                    <div className="text-[10px] text-rose-400 font-bold uppercase">Hata</div>
                    <div className="text-xl font-black">{p1.mistakes} / {MAX_MISTAKES}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-700" />
                  <div className="text-center">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Puan</div>
                    <div className="text-xl font-black text-amber-400">{p1.score}</div>
                  </div>
                </div>
              </>
            )}

            {/* Butonlar */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow border border-amber-200 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <RotateCcw size={16} />
                <span>Tekrar Oyna</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <X size={16} />
                <span>Kapat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
