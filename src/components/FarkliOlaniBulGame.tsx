import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ArrowLeft, RotateCcw, HelpCircle, Trophy, User,
  Home, ChevronLeft, ChevronRight, Lightbulb, Check, X, Zap,
  Clock, AlertCircle, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';
import {
  FARKLI_CATEGORIES,
  FarkliCategoryId,
  CategoryEmblem,
  TileArtwork,
  getLevelSpec,
  LevelSpec,
} from './farkliOlaniBulArt';

interface FarkliOlaniBulGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type GameMode = 'solo' | 'duel';
type ViewState = 'lobby' | 'play';
type RoundStatus = 'playing' | 'found' | 'timeout' | 'category_complete' | 'duel_over';

const STORAGE_KEY = 'farkli_olani_bul_progress_v1';
const DUEL_WIN_TARGET = 4; // İlk 4 puanı toplayan kazanır (en fazla 7 tur)

const DEFAULT_PROGRESS: Record<FarkliCategoryId, number> = {
  cats: 1,
  animals: 1,
  emojis: 1,
  fruits: 1,
  vehicles: 1,
  numbers: 1,
  letters: 1,
};

const loadProgress = (): Record<FarkliCategoryId, number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      cats: Math.max(1, Math.min(20, Number(parsed.cats) || 1)),
      animals: Math.max(1, Math.min(20, Number(parsed.animals) || 1)),
      emojis: Math.max(1, Math.min(20, Number(parsed.emojis) || 1)),
      fruits: Math.max(1, Math.min(20, Number(parsed.fruits) || 1)),
      vehicles: Math.max(1, Math.min(20, Number(parsed.vehicles) || 1)),
      numbers: Math.max(1, Math.min(20, Number(parsed.numbers) || 1)),
      letters: Math.max(1, Math.min(20, Number(parsed.letters) || 1)),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
};

const saveProgress = (prog: Record<FarkliCategoryId, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch {
    // Ignore storage quota errors
  }
};

const formatClock = (seconds: number): string => {
  const s = Math.max(0, Math.ceil(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

// Her kart için referans görseldeki gibi doğal hafif kağıt eğimi (-2° .. +2°)
const getTileTiltDeg = (index: number, seed: number): number => {
  const tilts = [-1.8, 1.4, -1.1, 1.9, -1.5, 0.9, -1.7, 1.2, -0.8, 1.6, -1.4, 1.1];
  return tilts[(index * 7 + seed * 3) % tilts.length];
};

const getDuelGridForRound = (round: number): { cols: number; rows: number } => {
  if (round <= 1) return { cols: 3, rows: 3 };
  if (round <= 3) return { cols: 4, rows: 3 };
  if (round <= 5) return { cols: 4, rows: 4 };
  return { cols: 5, rows: 4 };
};

export const FarkliOlaniBulGame: React.FC<FarkliOlaniBulGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students,
  selectedStudentIds = [],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onGameCompleted,
}) => {
  const [view, setView] = useState<ViewState>('lobby');
  const [mode, setMode] = useState<GameMode>('solo');
  const [progress, setProgress] = useState<Record<FarkliCategoryId, number>>(loadProgress);
  const [activeCategory, setActiveCategory] = useState<FarkliCategoryId>('cats');
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Oyun içi durumlar
  const [oddIndex, setOddIndex] = useState<number>(0);
  const [roundSeed, setRoundSeed] = useState<number>(1);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('playing');
  const [timeLeft, setTimeLeft] = useState<number>(32);
  const [mistakes, setMistakes] = useState<number>(0);
  const [wrongTileIdx, setWrongTileIdx] = useState<number | null>(null);
  const [penaltyFlash, setPenaltyFlash] = useState<boolean>(false);
  const [hintRow, setHintRow] = useState<number | null>(null);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // 2 Kişilik Düello durumları
  const [duelRound, setDuelRound] = useState<number>(1);
  const [duelScores, setDuelScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [duelRoundWinner, setDuelRoundWinner] = useState<1 | 2 | null>(null);
  const [duelMatchWinner, setDuelMatchWinner] = useState<1 | 2 | null>(null);
  const [duelFreeze, setDuelFreeze] = useState<{ p1: boolean; p2: boolean }>({ p1: false, p2: false });
  const [duelWrongTile, setDuelWrongTile] = useState<{ p1: number | null; p2: number | null }>({
    p1: null,
    p2: null,
  });

  const advanceTimerRef = useRef<number | null>(null);
  const wrongFlashRef = useRef<number | null>(null);
  const p1FreezeRef = useRef<number | null>(null);
  const p2FreezeRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (wrongFlashRef.current) {
      window.clearTimeout(wrongFlashRef.current);
      wrongFlashRef.current = null;
    }
    if (p1FreezeRef.current) {
      window.clearTimeout(p1FreezeRef.current);
      p1FreezeRef.current = null;
    }
    if (p2FreezeRef.current) {
      window.clearTimeout(p2FreezeRef.current);
      p2FreezeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const triggerSound = useCallback((src: string) => {
    if (playMp3) playMp3(src);
  }, [playMp3]);

  const fireConfetti = useCallback((colors?: string[]) => {
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: colors || ['#38bdf8', '#f59e0b', '#a855f7', '#10b981', '#ffffff'],
      });
    } catch {
      // Ignore confetti errors
    }
  }, []);

  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;
  const p1Label = p1Student ? p1Student.name : '1. Oyuncu';
  const p2Label = p2Student ? p2Student.name : '2. Oyuncu';

  const categoryMeta = useMemo(
    () => FARKLI_CATEGORIES.find(c => c.id === activeCategory) || FARKLI_CATEGORIES[0],
    [activeCategory]
  );

  // Aktif seviye / düello turu spesifikasyonu
  const activeSpec: LevelSpec = useMemo(() => {
    if (mode === 'duel') {
      const duelLevelIdx = ((duelRound - 1) * 3) % 20 + 1;
      const base = getLevelSpec(activeCategory, duelLevelIdx);
      const dGrid = getDuelGridForRound(duelRound);
      return {
        ...base,
        cols: dGrid.cols,
        rows: dGrid.rows,
      };
    }
    return getLevelSpec(activeCategory, currentLevel);
  }, [activeCategory, currentLevel, mode, duelRound]);

  const totalTiles = activeSpec.cols * activeSpec.rows;

  const setupSoloLevel = useCallback((cat: FarkliCategoryId, lvl: number) => {
    clearAllTimers();
    const spec = getLevelSpec(cat, lvl);
    const total = spec.cols * spec.rows;
    const nextOdd = Math.floor(Math.random() * total);

    setActiveCategory(cat);
    setCurrentLevel(lvl);
    setOddIndex(nextOdd);
    setRoundSeed(s => s + 1);
    setTimeLeft(spec.timeLimit);
    setMistakes(0);
    setWrongTileIdx(null);
    setPenaltyFlash(false);
    setHintRow(null);
    setHintUsed(false);
    setRoundStatus('playing');
    setView('play');
  }, [clearAllTimers]);

  const setupDuelRound = useCallback((cat: FarkliCategoryId, roundNo: number, resetMatch: boolean) => {
    clearAllTimers();
    const grid = getDuelGridForRound(roundNo);
    const total = grid.cols * grid.rows;
    const nextOdd = Math.floor(Math.random() * total);

    setActiveCategory(cat);
    setDuelRound(roundNo);
    setOddIndex(nextOdd);
    setRoundSeed(s => s + 1);
    setDuelRoundWinner(null);
    setDuelFreeze({ p1: false, p2: false });
    setDuelWrongTile({ p1: null, p2: null });
    if (resetMatch) {
      setDuelScores({ p1: 0, p2: 0 });
      setDuelMatchWinner(null);
    }
    setRoundStatus('playing');
    setView('play');
  }, [clearAllTimers]);

  const handleSelectCategory = (catId: FarkliCategoryId) => {
    triggerSound('/coin.mp3');
    if (mode === 'duel') {
      setupDuelRound(catId, 1, true);
    } else {
      const startLevel = progress[catId] || 1;
      setupSoloLevel(catId, startLevel);
    }
  };

  // Tek kişilik geri sayım zamanlayıcısı (100ms hassasiyet — pürüzsüz çubuk)
  useEffect(() => {
    if (view !== 'play' || mode !== 'solo' || roundStatus !== 'playing' || showRulesModal) return;
    const interval = window.setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          window.clearInterval(interval);
          setRoundStatus('timeout');
          triggerSound('/click.mp3');
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [view, mode, roundStatus, showRulesModal, triggerSound]);

  // Tek Kişilik kart tıklaması
  const handleSoloTileClick = (index: number) => {
    if (roundStatus !== 'playing') return;

    if (index === oddIndex) {
      setRoundStatus('found');
      triggerSound('/coin.mp3');

      const nextUnlocked = Math.min(20, Math.max(progress[activeCategory] || 1, currentLevel + 1));
      if (nextUnlocked !== progress[activeCategory]) {
        const updated = { ...progress, [activeCategory]: nextUnlocked };
        setProgress(updated);
        saveProgress(updated);
      }

      if (currentLevel >= 20) {
        triggerSound('/alkis.mp3');
        fireConfetti();
        onGameCompleted?.(0, 1);
        advanceTimerRef.current = window.setTimeout(() => {
          setRoundStatus('category_complete');
        }, 1250);
      } else {
        advanceTimerRef.current = window.setTimeout(() => {
          setupSoloLevel(activeCategory, currentLevel + 1);
        }, 1250);
      }
      return;
    }

    // Yanlış kart: -2 saniye ceza
    triggerSound('/click.mp3');
    setMistakes(m => m + 1);
    setWrongTileIdx(index);
    setPenaltyFlash(true);
    setTimeLeft(prev => {
      const next = Math.max(0, prev - 2);
      if (next <= 0) {
        setRoundStatus('timeout');
      }
      return next;
    });

    if (wrongFlashRef.current) window.clearTimeout(wrongFlashRef.current);
    wrongFlashRef.current = window.setTimeout(() => {
      setWrongTileIdx(null);
      setPenaltyFlash(false);
    }, 520);
  };

  // 2 Kişilik Düello kart tıklaması
  const handleDuelTileClick = (player: 1 | 2, index: number) => {
    if (roundStatus !== 'playing') return;
    if (player === 1 && duelFreeze.p1) return;
    if (player === 2 && duelFreeze.p2) return;

    if (index === oddIndex) {
      setRoundStatus('found');
      setDuelRoundWinner(player);
      triggerSound('/coin.mp3');

      const nextScores = {
        p1: duelScores.p1 + (player === 1 ? 1 : 0),
        p2: duelScores.p2 + (player === 2 ? 1 : 0),
      };
      setDuelScores(nextScores);

      if (nextScores.p1 >= DUEL_WIN_TARGET || nextScores.p2 >= DUEL_WIN_TARGET) {
        const matchWin: 1 | 2 = nextScores.p1 >= DUEL_WIN_TARGET ? 1 : 2;
        triggerSound('/alkis.mp3');
        fireConfetti(
          matchWin === 1
            ? ['#9333ea', '#c084fc', '#38bdf8', '#ffffff']
            : ['#ea580c', '#fb923c', '#facc15', '#ffffff']
        );
        onGameCompleted?.(matchWin === 1 ? 0 : 1, 2);
        advanceTimerRef.current = window.setTimeout(() => {
          setDuelMatchWinner(matchWin);
          setRoundStatus('duel_over');
        }, 1250);
      } else {
        advanceTimerRef.current = window.setTimeout(() => {
          setupDuelRound(activeCategory, duelRound + 1, false);
        }, 1300);
      }
      return;
    }

    // Yanlış seçim: sadece o oyuncuyu 1.5 sn dondur
    triggerSound('/click.mp3');
    if (player === 1) {
      setDuelFreeze(prev => ({ ...prev, p1: true }));
      setDuelWrongTile(prev => ({ ...prev, p1: index }));
      if (p1FreezeRef.current) window.clearTimeout(p1FreezeRef.current);
      p1FreezeRef.current = window.setTimeout(() => {
        setDuelFreeze(prev => ({ ...prev, p1: false }));
        setDuelWrongTile(prev => ({ ...prev, p1: null }));
      }, 1500);
    } else {
      setDuelFreeze(prev => ({ ...prev, p2: true }));
      setDuelWrongTile(prev => ({ ...prev, p2: index }));
      if (p2FreezeRef.current) window.clearTimeout(p2FreezeRef.current);
      p2FreezeRef.current = window.setTimeout(() => {
        setDuelFreeze(prev => ({ ...prev, p2: false }));
        setDuelWrongTile(prev => ({ ...prev, p2: null }));
      }, 1500);
    }
  };

  const handleUseHint = () => {
    if (view !== 'play' || mode !== 'solo' || roundStatus !== 'playing' || hintUsed) return;
    const targetRow = Math.floor(oddIndex / activeSpec.cols);
    setHintRow(targetRow);
    setHintUsed(true);
    triggerSound('/ding.mp3');
  };

  const handleRestartCurrent = () => {
    triggerSound('/tekrar.mp3');
    if (view !== 'play') return;
    if (mode === 'duel') {
      setupDuelRound(activeCategory, 1, true);
    } else {
      setupSoloLevel(activeCategory, currentLevel);
    }
  };

  const handleBackToLobby = () => {
    clearAllTimers();
    setView('lobby');
    triggerSound('/click.mp3');
  };

  const timePct = Math.max(0, Math.min(100, (timeLeft / activeSpec.timeLimit) * 100));
  const timerBarColor =
    timePct > 45
      ? 'from-cyan-400 via-indigo-500 to-amber-400'
      : timePct > 22
        ? 'from-amber-400 via-orange-500 to-rose-500'
        : 'from-rose-500 to-red-600';

  const maxUnlocked = progress[activeCategory] || 1;

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-slate-900 via-[#0e1b2d] to-slate-950 text-white"
    >
      <ActivityBackground theme="doga" />

      {/* ÜST KONTROL ÇUBUĞU (Uygulamamızın standart buton ve tasarım dili) */}
      <header className="relative z-20 px-2 sm:px-5 py-1.5 sm:py-2 bg-slate-950/95 border-b border-cyan-400/30 flex items-center justify-between gap-2 shrink-0 shadow-md">
        {/* SOL: GEZİNTİ BUTONLARI & BAŞLIK */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onPrevActivity && (
            <button
              type="button"
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shrink-0"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={view === 'play' ? handleBackToLobby : onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/20 transition cursor-pointer shrink-0"
            title={view === 'play' ? 'Oyun Seçimine Dön' : 'Geri Dön'}
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shrink-0"
              title="Ana Sayfaya Dön"
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              type="button"
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shrink-0"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="flex flex-col min-w-0 ml-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-cyan-300 uppercase whitespace-nowrap">
                Farklı Olanı Bul
              </h1>
              <span className="hidden md:inline text-xs font-semibold text-slate-400 whitespace-nowrap">
                · Görsel Dikkat Oyunları
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden lg:inline truncate">
              7 kategori · 140 seviye · Tek kişi veya 2 kişilik düello
            </span>
          </div>
        </div>

        {/* ORTA: MOD SEÇİMİ (Lobi) veya CANLI DURUM BİLGİSİ (Oyun içi) */}
        <div className="flex items-center gap-2 shrink-0">
          {view === 'lobby' ? (
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('solo');
                  triggerSound('/click.mp3');
                }}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mode === 'solo'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User size={14} />
                <span>Tek Kişi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('duel');
                  triggerSound('/click.mp3');
                }}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mode === 'duel'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap size={14} />
                <span>Düello (2K)</span>
              </button>
            </div>
          ) : mode === 'solo' ? (
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono tabular-nums text-slate-200 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <span className={`font-sans font-black ${categoryMeta.accentText}`}>
                {categoryMeta.title}
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Seviye <strong className="text-white">{currentLevel}/20</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className={mistakes > 0 ? 'text-rose-300 font-bold' : 'text-slate-300'}>
                Hata <strong className="text-white">{mistakes}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className={`inline-flex items-center gap-1 font-bold ${timeLeft <= 8 ? 'text-rose-400' : 'text-cyan-300'}`}>
                <Clock size={13} />
                {formatClock(timeLeft)}
                {penaltyFlash && <span className="text-rose-400 font-black ml-0.5">-2sn</span>}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-mono tabular-nums px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <span className="text-purple-300 font-black">
                {p1Label}: {duelScores.p1}/{DUEL_WIN_TARGET}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 font-bold font-sans">
                {categoryMeta.title} · Tur {duelRound}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-orange-300 font-black">
                {p2Label}: {duelScores.p2}/{DUEL_WIN_TARGET}
              </span>
            </div>
          )}
        </div>

        {/* SAĞ: İPUCU, KURALLAR, YENİDEN */}
        <div className="flex items-center gap-1.5 shrink-0">
          {view === 'play' && mode === 'solo' && (
            <button
              type="button"
              onClick={handleUseHint}
              disabled={hintUsed || roundStatus !== 'playing'}
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-35 disabled:cursor-not-allowed text-amber-200 border border-amber-400/50 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
              title="Doğru satırı göster (seviye başına 1 kez)"
            >
              <Lightbulb size={15} />
              <span className="hidden lg:inline">İpucu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-400/40 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            title="Oyun Kuralları"
          >
            <HelpCircle size={16} />
            <span className="hidden lg:inline">Kurallar</span>
          </button>

          {view === 'play' && (
            <button
              type="button"
              onClick={handleRestartCurrent}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black flex items-center justify-center transition cursor-pointer shadow-sm"
              title={mode === 'duel' ? 'Düelloyu Yeniden Başlat' : 'Bu Seviyeyi Yeniden Başlat'}
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ARKA PLAN OKUNURLUK PERDESİ (Çerçevelerin ve metinlerin arka planla karışmasını engeller) */}
      <div className="absolute inset-0 z-[1] bg-slate-950/72 backdrop-blur-[2px] pointer-events-none" />

      {/* ANA İÇERİK */}
      {view === 'lobby' ? (
        <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 py-4 sm:py-5 flex flex-col items-center justify-between max-w-6xl w-full mx-auto gap-4">
          {/* ÜST BAŞLIK BLOĞU (Tam opak, net okunaklı çerçeve) */}
          <div className="w-full flex flex-col gap-1 text-left bg-[#0b1324] border-2 border-cyan-400/50 rounded-2xl px-4 sm:px-6 py-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.6)]">
            <div className="text-xs font-bold text-cyan-300 tracking-wide">
              7 Oyun · 140 Seviye · {mode === 'solo' ? 'Tek Kişilik İlerleme' : '2 Kişilik Hız Düellosu'}
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight [text-wrap:balance]">
              Bir oyun seç,{' '}
              <span className="text-amber-300">farkı yakala.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Bir tanesinin bir ayrıntısı eksik: bir bıyık, bir parıltı, bir yaprak veya küçük bir çizgi. Seviye yükseldikçe kalabalık artar, fark küçülür.
            </p>
          </div>

          {/* 7 KATEGORİ KARTI IZGARASI (Tam opak yüksek kontrast kartlar) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5 my-auto">
            {FARKLI_CATEGORIES.map(cat => {
              const unlocked = progress[cat.id] || 1;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`group relative overflow-hidden flex flex-col justify-between text-left p-4 pt-5 rounded-2xl ${cat.cardBg} border-2 ${cat.borderColor} shadow-[0_12px_26px_rgba(0,0,0,0.65)] hover:-translate-y-1 active:translate-y-0 transition-all duration-150 cursor-pointer min-h-[172px] sm:min-h-[186px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
                >
                  {/* Üst Canlı Renk Şeridi */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${cat.topBarGradient}`} />

                  <div>
                    {/* 3D Canlı İkon Kutusu */}
                    <div
                      className={`w-13 h-13 rounded-2xl ${cat.iconBg} border-2 border-white/90 shadow-[0_6px_14px_rgba(0,0,0,0.45)] flex items-center justify-center p-1 mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-150`}
                    >
                      <CategoryEmblem category={cat.id} />
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Alt İlerleme & Başlat Oku */}
                  <div className="mt-4 pt-2.5 border-t border-slate-700/80 flex items-center justify-between gap-2">
                    <span className={`text-xs font-mono tabular-nums font-bold ${cat.accentText}`}>
                      {mode === 'duel' ? '7 Turlu Yarış' : `${unlocked}/20. seviye`}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5 shadow ${cat.accentBtn}`}
                    >
                      <ArrowRight size={14} strokeWidth={3} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ALT İPUCU SATIRI (Tam opak koyu kutu) */}
          <div className="w-full px-4 py-2.5 rounded-2xl bg-[#0b1324] border border-cyan-400/50 shadow-lg flex items-center gap-2.5 text-xs sm:text-sm text-slate-100 shrink-0">
            <Lightbulb size={16} className="text-amber-300 shrink-0" />
            <span>
              <strong className="text-amber-300">İpucu:</strong> Şeklin tamamına değil; bıyıklara, göz ışıltılarına, yaprak damarlarına ve küçük çizgilere bak.
            </span>
          </div>
        </main>
      ) : mode === 'solo' ? (
        /* ==================== 1 KİŞİLİK AKTİF OYUN ALANI ==================== */
        <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-2.5 sm:px-5 py-2 sm:py-2.5 overflow-hidden min-h-0 max-w-6xl w-full mx-auto gap-2">
          {/* OYUN ÜST ALT-ÇUBUĞU: ← Oyunlar | Başlık | Seviye Seçici */}
          <div className="w-full flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft size={14} />
              <span>Oyunlar</span>
            </button>

            <div className="flex-1 flex flex-col items-center text-center min-w-0 px-1">
              {roundStatus === 'found' ? (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm md:text-base font-black text-emerald-300 truncate">
                  <Check size={16} className="shrink-0" />
                  <span className="truncate">Harika! {activeSpec.diffLabel}</span>
                </div>
              ) : (
                <>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${categoryMeta.accentText}`}>
                    {categoryMeta.title} · {currentLevel}. Seviye
                  </span>
                  <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight leading-tight truncate max-w-full">
                    Diğerlerinden farklı olanı bul
                  </h2>
                </>
              )}
            </div>

            {/* Seviye Geçiş Kontrolü + Mobil Süre */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="sm:hidden text-xs font-mono tabular-nums font-bold text-cyan-300 mr-1">
                {formatClock(timeLeft)}
              </span>
              <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-0.5">
                <button
                  type="button"
                  disabled={currentLevel <= 1}
                  onClick={() => setupSoloLevel(activeCategory, currentLevel - 1)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-200 cursor-pointer"
                  title="Önceki Seviye"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2 text-xs font-mono tabular-nums font-black text-amber-300 whitespace-nowrap">
                  Seviye {currentLevel}
                </span>
                <button
                  type="button"
                  disabled={currentLevel >= maxUnlocked || currentLevel >= 20}
                  onClick={() => setupSoloLevel(activeCategory, currentLevel + 1)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-200 cursor-pointer"
                  title="Sonraki Açık Seviye"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ANA KART TAHTASI (Referans ekran 2'deki net beyaz kart & koyu mürekkep çizgili arena) */}
          <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
            <div
              className="relative w-full h-full max-w-[1120px] rounded-3xl bg-slate-100/98 border-[3px] border-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.55),_0_6px_0_#0f172a] p-2.5 sm:p-4 flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(15, 23, 42, 0.12) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            >
              <div
                className="w-full h-full grid gap-1.5 sm:gap-2.5 md:gap-3"
                style={{
                  gridTemplateColumns: `repeat(${activeSpec.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${activeSpec.rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: totalTiles }).map((_, idx) => {
                  const isOdd = idx === oddIndex;
                  const isRevealed = (roundStatus === 'found' || roundStatus === 'timeout') && isOdd;
                  const isWrong = wrongTileIdx === idx;
                  const rowIdx = Math.floor(idx / activeSpec.cols);
                  const isHintedRow = hintRow === rowIdx && roundStatus === 'playing';
                  const tilt = getTileTiltDeg(idx, roundSeed);

                  return (
                    <button
                      key={`${activeCategory}-${currentLevel}-${roundSeed}-${idx}`}
                      type="button"
                      onClick={() => handleSoloTileClick(idx)}
                      style={{
                        transform: isRevealed
                          ? 'rotate(0deg) scale(1.04)'
                          : `rotate(${tilt}deg)`,
                      }}
                      className={`relative w-full h-full min-h-0 min-w-0 rounded-xl sm:rounded-2xl bg-white border-2 flex items-center justify-center p-1 sm:p-2 transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500 ${
                        isRevealed
                          ? 'border-emerald-500 ring-4 ring-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.55)] z-20'
                          : isWrong
                            ? 'border-rose-500 bg-rose-50 ring-3 ring-rose-400/70 scale-95'
                            : isHintedRow
                              ? 'border-amber-500 ring-2 ring-amber-300/80 bg-amber-50/40 hover:scale-[1.03]'
                              : 'border-slate-900 shadow-[0_2px_0_rgba(15,23,42,0.18)] hover:scale-[1.03] hover:z-10 active:scale-95'
                      }`}
                    >
                      <div className="w-full h-full max-w-[118px] max-h-[118px] flex items-center justify-center">
                        <TileArtwork category={activeCategory} spec={activeSpec} isOdd={isOdd} />
                      </div>

                      {isRevealed && (
                        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-white shadow flex items-center justify-center">
                          <Check size={14} strokeWidth={3.5} />
                        </span>
                      )}

                      {isWrong && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow">
                          -2sn
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ALT SÜRE ÇUBUĞU (Referans ekran 2'deki akıcı geri sayım çubuğu) */}
          <div className="w-full max-w-[1120px] flex items-center gap-3 px-1 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-300 font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <AlertCircle size={13} className="text-amber-300 shrink-0" />
              <span className="hidden xs:inline">Yanlış dokunuş süreden 2 saniye götürür.</span>
              <span className="xs:hidden">Yanlış: -2 sn</span>
            </span>
            <div className="flex-1 h-2.5 sm:h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${timerBarColor} transition-all duration-100`}
                style={{ width: `${timePct}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono tabular-nums font-black shrink-0 ${
                timeLeft <= 8 ? 'text-rose-400' : 'text-cyan-300'
              }`}
            >
              {formatClock(timeLeft)}
            </span>
          </div>
        </main>
      ) : (
        /* ==================== 2 KİŞİLİK DÜELLO ARENASI ==================== */
        <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-2 sm:px-4 py-2 overflow-hidden min-h-0 w-full max-w-7xl mx-auto gap-2">
          {/* DÜELLO ÜST BİLGİ SATIRI */}
          <div className="w-full flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft size={14} />
              <span>Oyunlar</span>
            </button>

            <div className="text-center flex-1 min-w-0">
              {duelRoundWinner !== null ? (
                <span className="text-xs sm:text-sm font-black text-emerald-300">
                  {duelRoundWinner === 1 ? p1Label : p2Label} farkı yakaladı! ({activeSpec.diffLabel})
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  Farklı olanı ilk bulan puanı kapar · İlk {DUEL_WIN_TARGET} puana ulaşan kazanır
                </span>
              )}
            </div>

            <span className="text-xs font-mono tabular-nums font-bold text-amber-300 whitespace-nowrap">
              Tur {duelRound}
            </span>
          </div>

          {/* YAN YANA 2 OYUNCU TAHTASI */}
          <div className="flex-1 w-full min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
            {([1, 2] as const).map(player => {
              const isP1 = player === 1;
              const isFrozen = isP1 ? duelFreeze.p1 : duelFreeze.p2;
              const wrongIdx = isP1 ? duelWrongTile.p1 : duelWrongTile.p2;
              const score = isP1 ? duelScores.p1 : duelScores.p2;
              const name = isP1 ? p1Label : p2Label;
              const studentAvatar = isP1 ? p1Student?.avatar : p2Student?.avatar;

              return (
                <div
                  key={player}
                  className={`relative flex flex-col min-h-0 rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-2 shadow-xl ${
                    isP1
                      ? 'bg-purple-950/70 border-purple-400/70'
                      : 'bg-orange-950/70 border-orange-400/70'
                  }`}
                >
                  {/* Oyuncu Başlığı */}
                  <div className="flex items-center justify-between gap-2 pb-2 px-1 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border border-white/40 shrink-0 ${
                          isP1 ? 'bg-purple-600 text-white' : 'bg-orange-500 text-white'
                        }`}
                      >
                        {studentAvatar || (isP1 ? '1' : '2')}
                      </span>
                      <span className="font-black text-xs sm:text-sm text-white truncate">
                        {name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map(dot => (
                        <span
                          key={dot}
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${
                            dot < score
                              ? isP1
                                ? 'bg-purple-400 border-white scale-110'
                                : 'bg-amber-400 border-white scale-110'
                              : 'bg-slate-900/80 border-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-mono tabular-nums font-black text-white ml-1">
                        {score}/{DUEL_WIN_TARGET}
                      </span>
                    </div>
                  </div>

                  {/* Oyuncunun Kart Izgarası */}
                  <div
                    className="relative flex-1 min-h-0 rounded-2xl bg-slate-100/98 border-2 border-slate-900 p-2 overflow-hidden"
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(15, 23, 42, 0.1) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    <div
                      className="w-full h-full grid gap-1.5 sm:gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${activeSpec.cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${activeSpec.rows}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: totalTiles }).map((_, idx) => {
                        const isOdd = idx === oddIndex;
                        const isRevealed = roundStatus === 'found' && isOdd;
                        const isWrong = wrongIdx === idx;
                        const tilt = getTileTiltDeg(idx, roundSeed);

                        return (
                          <button
                            key={`duel-${player}-${duelRound}-${roundSeed}-${idx}`}
                            type="button"
                            disabled={isFrozen || roundStatus !== 'playing'}
                            onClick={() => handleDuelTileClick(player, idx)}
                            style={{
                              transform: isRevealed
                                ? 'rotate(0deg) scale(1.04)'
                                : `rotate(${tilt}deg)`,
                            }}
                            className={`relative w-full h-full min-h-0 min-w-0 rounded-xl bg-white border-2 flex items-center justify-center p-1 transition-transform duration-150 cursor-pointer disabled:cursor-not-allowed ${
                              isRevealed
                                ? 'border-emerald-500 ring-4 ring-emerald-400/80 z-20'
                                : isWrong
                                  ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-400'
                                  : 'border-slate-900 hover:scale-[1.03] active:scale-95'
                            }`}
                          >
                            <div className="w-full h-full max-w-[92px] max-h-[92px] flex items-center justify-center">
                              <TileArtwork category={activeCategory} spec={activeSpec} isOdd={isOdd} />
                            </div>
                            {isRevealed && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white border border-white flex items-center justify-center">
                                <Check size={12} strokeWidth={3.5} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Yanlış Dokunuş Donma Perdesi */}
                    {isFrozen && roundStatus === 'playing' && (
                      <div className="absolute inset-0 bg-rose-950/60 backdrop-blur-[1px] flex items-center justify-center z-30">
                        <div className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-1.5">
                          <X size={16} strokeWidth={3} />
                          <span>Yanlış! Kısa mola...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ÖĞRENCİ SEÇİM ÇUBUĞU (Uygulamamızın standart sınıf entegrasyonu) */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={mode === 'duel' ? 2 : 1}
            selectedStudentIds={mode === 'duel' ? selectedStudentIds : [selectedStudentIds?.[0] || null]}
            onSelectStudentForPlayer={(pIdx, sId) => {
              if (onSelectStudentForPlayer) onSelectStudentForPlayer(pIdx, sId);
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* KURALLAR MODALI */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-cyan-400/70 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-cyan-300">
                  Farklı Olanı Bul · Nasıl Oynanır?
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  7 Kategori · 140 Seviye · Tek Kişi &amp; 2 Kişilik Düello
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-cyan-300 block mb-0.5">1. Küçük Ayrıntıyı Yakala</strong>
                Tahtadaki tüm kartlar birbirinin aynısıdır — yalnızca <strong>1 tanesinde</strong> küçük bir ayrıntı farklıdır (eksik bir bıyık, siyah çerçevesi olmayan bir göz, eksik bir yaprak damarı veya karışan bir harf/rakam).
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">2. Süre ve Hata Cezası (Tek Kişi)</strong>
                Seviye yükseldikçe kart sayısı 9&apos;dan 42&apos;ye kadar artar. Her yanlış dokunuş sürenden <strong>2 saniye</strong> götürür. Zorlandığında her seviyede 1 kez <strong>İpucu</strong> butonunu kullanabilirsin.
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-purple-300 block mb-0.5">3. 2 Kişilik Düello Modu</strong>
                İki oyuncu aynı bulmacada yan yana yarışır! Farklı kartı ilk dokunan puanı kapar. Yanlış dokunan oyuncu 1.5 saniye bekler. İlk <strong>{DUEL_WIN_TARGET} puana</strong> ulaşan düelloyu kazanır.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wide cursor-pointer transition-colors"
            >
              Anladım, Oyuna Başla
            </button>
          </div>
        </div>
      )}

      {/* SÜRE DOLDU MODALI (Tek Kişi) */}
      {view === 'play' && mode === 'solo' && roundStatus === 'timeout' && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
          <div className="max-w-sm w-full bg-slate-950 border-2 border-rose-400/80 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mb-3 text-rose-300">
              <Clock size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Süre Doldu!</h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Fark şuydu: <strong className="text-amber-300">{activeSpec.diffLabel}</strong>
            </p>
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={() => setupSoloLevel(activeCategory, currentLevel)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm cursor-pointer transition-colors"
              >
                Tekrar Dene
              </button>
              <button
                type="button"
                onClick={handleBackToLobby}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 cursor-pointer transition-colors"
              >
                Oyunlar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 20/20 KATEGORİ TAMAMLANDI MODALI */}
      {view === 'play' && mode === 'solo' && roundStatus === 'category_complete' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="max-w-sm w-full bg-slate-950 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center mb-3">
              <Trophy size={32} className="text-slate-950" />
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">
              20 / 20 Seviye Tamamlandı
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              {categoryMeta.title} Ustası!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mb-4">
              Bütün seviyelerdeki gizli farkları başarıyla yakaladın!
            </p>
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setupSoloLevel(activeCategory, 1)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm cursor-pointer transition-colors"
              >
                Baştan Oyna
              </button>
              <button
                type="button"
                onClick={handleBackToLobby}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 cursor-pointer transition-colors"
              >
                Diğer Oyunlar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2 KİŞİLİK DÜELLO KAZANANI MODALI */}
      {view === 'play' && mode === 'duel' && roundStatus === 'duel_over' && duelMatchWinner !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="max-w-sm w-full bg-slate-950 border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-full border-2 border-white shadow-lg flex items-center justify-center mb-3 ${
                duelMatchWinner === 1
                  ? 'bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-900'
                  : 'bg-gradient-to-br from-amber-300 via-orange-500 to-red-800'
              }`}
            >
              <Trophy size={32} className="text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">
              Düello Bitti
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              {duelMatchWinner === 1 ? p1Label : p2Label} Kazandı!
            </h3>
            <div className="w-full flex items-center justify-center gap-4 text-xs font-mono tabular-nums text-slate-300 mb-4 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-purple-300 font-bold">
                {p1Label}: {duelScores.p1}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-orange-300 font-bold">
                {p2Label}: {duelScores.p2}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setupDuelRound(activeCategory, 1, true)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm cursor-pointer transition-colors"
              >
                Tekrar Düello
              </button>
              <button
                type="button"
                onClick={handleBackToLobby}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 cursor-pointer transition-colors"
              >
                Oyunlar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
