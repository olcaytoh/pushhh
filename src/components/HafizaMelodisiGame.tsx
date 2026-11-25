import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Users,
  User,
  Music,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useAppLanguage } from '../utils/appLanguage';

interface HafizaMelodisiGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type PlayMode = 'solo' | 'duel';
type PadCount = 4 | 6;
type SpeedMode = 'relaxed' | 'normal' | 'fast';
type Phase = 'idle' | 'watching' | 'input' | 'round_clear' | 'gameover';

interface PadConfig {
  id: number;
  noteTr: string;
  noteEn: string;
  symbol: string;
  freq: number;
  baseClass: string;
  activeClass: string;
  keyHint: string;
}

const ALL_PADS: PadConfig[] = [
  {
    id: 0,
    noteTr: 'DO',
    noteEn: 'C',
    symbol: '★',
    freq: 261.63,
    baseClass: 'from-rose-500 to-red-600 border-rose-300/60 shadow-rose-900/40',
    activeClass: 'from-rose-200 via-rose-300 to-red-400 border-white shadow-[0_0_42px_rgba(251,113,133,0.95)] scale-[1.04]',
    keyHint: '1',
  },
  {
    id: 1,
    noteTr: 'Mİ',
    noteEn: 'E',
    symbol: '●',
    freq: 329.63,
    baseClass: 'from-sky-500 to-blue-600 border-sky-300/60 shadow-blue-900/40',
    activeClass: 'from-sky-200 via-cyan-200 to-blue-400 border-white shadow-[0_0_42px_rgba(56,189,248,0.95)] scale-[1.04]',
    keyHint: '2',
  },
  {
    id: 2,
    noteTr: 'SOL',
    noteEn: 'G',
    symbol: '▲',
    freq: 392.0,
    baseClass: 'from-emerald-500 to-green-600 border-emerald-300/60 shadow-emerald-900/40',
    activeClass: 'from-emerald-200 via-lime-200 to-emerald-400 border-white shadow-[0_0_42px_rgba(52,211,153,0.95)] scale-[1.04]',
    keyHint: '3',
  },
  {
    id: 3,
    noteTr: 'DO²',
    noteEn: 'C5',
    symbol: '◆',
    freq: 523.25,
    baseClass: 'from-amber-400 to-yellow-500 border-yellow-200/70 shadow-amber-900/40',
    activeClass: 'from-yellow-100 via-amber-200 to-yellow-300 border-white shadow-[0_0_42px_rgba(251,191,36,0.95)] scale-[1.04]',
    keyHint: '4',
  },
  {
    id: 4,
    noteTr: 'RE',
    noteEn: 'D',
    symbol: '✿',
    freq: 293.66,
    baseClass: 'from-violet-500 to-purple-600 border-violet-300/60 shadow-purple-900/40',
    activeClass: 'from-violet-200 via-fuchsia-200 to-purple-400 border-white shadow-[0_0_42px_rgba(192,132,252,0.95)] scale-[1.04]',
    keyHint: '5',
  },
  {
    id: 5,
    noteTr: 'LA',
    noteEn: 'A',
    symbol: '♫',
    freq: 440.0,
    baseClass: 'from-orange-500 to-orange-600 border-orange-300/60 shadow-orange-900/40',
    activeClass: 'from-orange-200 via-amber-200 to-orange-400 border-white shadow-[0_0_42px_rgba(251,146,60,0.95)] scale-[1.04]',
    keyHint: '6',
  },
];

const SPEED_TIMINGS: Record<SpeedMode, { flashMs: number; gapMs: number }> = {
  relaxed: { flashMs: 620, gapMs: 260 },
  normal: { flashMs: 440, gapMs: 190 },
  fast: { flashMs: 300, gapMs: 130 },
};

const BEST_STORAGE_KEY = 'olcico_hafiza_melodisi_best_v1';

export const HafizaMelodisiGame: React.FC<HafizaMelodisiGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  onGameCompleted,
}) => {
  const { lang } = useAppLanguage();
  const isEn = lang === 'en';

  const [mode, setMode] = useState<PlayMode>('solo');
  const [padCount, setPadCount] = useState<PadCount>(4);
  const [speed, setSpeed] = useState<SpeedMode>('normal');
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [duelScores, setDuelScores] = useState({ p1: 0, p2: 0 });
  const [duelWinner, setDuelWinner] = useState<1 | 2 | null>(null);
  const [replaysLeft, setReplaysLeft] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestScores, setBestScores] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(BEST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const timersRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const bestKey = `${padCount}_${speed}`;
  const currentBest = bestScores[bestKey] || 0;
  const pads = ALL_PADS.slice(0, padCount);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const playNote = useCallback(
    (freq: number, durationSec = 0.32) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const now = ctx.currentTime;
        // Marimba-like harmonic tone (fundamental + soft octave overtone)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.22, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

        osc1.connect(gain);
        osc2.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + durationSec + 0.02);
        osc2.stop(now + durationSec + 0.02);
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled]
  );

  const playFeedbackSound = useCallback(
    (kind: 'success' | 'error') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;

        if (kind === 'success') {
          [523.25, 659.25, 783.99].forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.06);
            g.gain.setValueAtTime(0.16, now + idx * 0.06);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.24);
          });
        } else {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(115, now + 0.35);
          g.gain.setValueAtTime(0.16, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        }
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled]
  );

  const playSequence = useCallback(
    (seq: number[]) => {
      clearAllTimers();
      setPhase('watching');
      setInputIndex(0);
      setActivePad(null);

      const { flashMs, gapMs } = SPEED_TIMINGS[speed];
      const stepTotal = flashMs + gapMs;

      seq.forEach((padId, i) => {
        schedule(() => {
          setActivePad(padId);
          playNote(ALL_PADS[padId].freq, flashMs / 1000);
        }, 380 + i * stepTotal);

        schedule(() => {
          setActivePad(null);
        }, 380 + i * stepTotal + flashMs);
      });

      schedule(() => {
        setActivePad(null);
        setPhase('input');
      }, 380 + seq.length * stepTotal + 80);
    },
    [clearAllTimers, playNote, schedule, speed]
  );

  const startNewGame = useCallback(
    (customPadCount?: PadCount) => {
      clearAllTimers();
      const count = customPadCount ?? padCount;
      const firstNote = Math.floor(Math.random() * count);
      const initialSeq = [firstNote];
      setSequence(initialSeq);
      setInputIndex(0);
      setCurrentPlayer(1);
      setDuelScores({ p1: 0, p2: 0 });
      setDuelWinner(null);
      setReplaysLeft(1);
      playSequence(initialSeq);
    },
    [clearAllTimers, padCount, playSequence]
  );

  const handleResetIdle = useCallback(() => {
    clearAllTimers();
    setPhase('idle');
    setSequence([]);
    setInputIndex(0);
    setActivePad(null);
    setCurrentPlayer(1);
    setDuelWinner(null);
  }, [clearAllTimers]);

  const handlePadPress = useCallback(
    (padId: number) => {
      if (phase !== 'input') return;

      setActivePad(padId);
      playNote(ALL_PADS[padId].freq, 0.28);
      schedule(() => {
        setActivePad((curr) => (curr === padId ? null : curr));
      }, 220);

      if (sequence[inputIndex] === padId) {
        const nextIdx = inputIndex + 1;
        setInputIndex(nextIdx);

        if (nextIdx === sequence.length) {
          // Completed the full melody!
          setPhase('round_clear');
          const clearedLength = sequence.length;

          if (mode === 'solo') {
            if (clearedLength > currentBest) {
              setBestScores((prev) => {
                const updated = { ...prev, [bestKey]: clearedLength };
                try {
                  localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(updated));
                } catch {
                  // Ignore storage errors
                }
                return updated;
              });
            }
          } else {
            setDuelScores((prev) => ({
              p1: currentPlayer === 1 ? prev.p1 + 1 : prev.p1,
              p2: currentPlayer === 2 ? prev.p2 + 1 : prev.p2,
            }));
          }

          schedule(() => playFeedbackSound('success'), 180);

          const nextNote = Math.floor(Math.random() * padCount);
          const nextSeq = [...sequence, nextNote];

          schedule(() => {
            setSequence(nextSeq);
            setReplaysLeft(1);
            if (mode === 'duel') {
              setCurrentPlayer((p) => (p === 1 ? 2 : 1));
            }
            playSequence(nextSeq);
          }, 880);
        }
      } else {
        // Mistake!
        clearAllTimers();
        playFeedbackSound('error');
        setPhase('gameover');
        if (mode === 'duel') {
          const otherPlayer: 1 | 2 = currentPlayer === 1 ? 2 : 1;
          setDuelWinner(otherPlayer);
          onGameCompleted?.(otherPlayer === 1 ? 0 : 1, 2);
        } else {
          onGameCompleted?.(0, 1);
        }
      }
    },
    [
      bestKey,
      clearAllTimers,
      currentBest,
      currentPlayer,
      inputIndex,
      mode,
      onGameCompleted,
      padCount,
      phase,
      playFeedbackSound,
      playNote,
      playSequence,
      schedule,
      sequence,
    ]
  );

  // Keyboard shortcuts 1..6
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < padCount) {
        handlePadPress(idx);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePadPress, padCount]);

  const handleReplay = () => {
    if (phase !== 'input' || replaysLeft <= 0 || sequence.length === 0) return;
    setReplaysLeft((r) => r - 1);
    playSequence(sequence);
  };

  const completedCount =
    phase === 'gameover' ? Math.max(0, sequence.length - 1) : phase === 'round_clear' ? sequence.length : Math.max(0, sequence.length - 1);

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white"
    >
      {/* Subtle Ambient Stage Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-20 px-2.5 sm:px-5 py-2 bg-slate-950/90 border-b border-indigo-400/25 flex items-center justify-between gap-2 shrink-0 shadow-md">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shrink-0"
              title={isEn ? 'Previous Activity' : 'Önceki Etkinlik'}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/20 transition cursor-pointer shrink-0"
            title={isEn ? 'Back' : 'Geri Dön'}
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shrink-0"
              title={isEn ? 'Home' : 'Ana Sayfaya Dön'}
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shrink-0"
              title={isEn ? 'Next Activity' : 'Sonraki Etkinlik'}
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="flex flex-col min-w-0 ml-1">
            <h1 className="text-sm sm:text-base font-black tracking-wide text-fuchsia-300 uppercase whitespace-nowrap">
              {isEn ? 'Memory Melody' : 'Hafıza Melodisi'}
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              {isEn
                ? 'Watch the glowing colors, listen to the notes, and repeat the pattern'
                : 'Işıkları izle, notaları dinle ve renk dizisini sırayla tekrar et'}
            </span>
          </div>
        </div>

        {/* Mode, Pad Count & Speed Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                if (mode !== 'solo') {
                  setMode('solo');
                  handleResetIdle();
                }
              }}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                mode === 'solo' ? 'bg-fuchsia-500 text-white font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User size={14} />
              <span className="hidden sm:inline">{isEn ? '1P' : '1 Kişilik'}</span>
            </button>
            <button
              onClick={() => {
                if (mode !== 'duel') {
                  setMode('duel');
                  handleResetIdle();
                }
              }}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                mode === 'duel' ? 'bg-fuchsia-500 text-white font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">{isEn ? '2P' : '2 Kişilik'}</span>
            </button>
          </div>

          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            {([4, 6] as PadCount[]).map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  if (padCount !== cnt) {
                    setPadCount(cnt);
                    handleResetIdle();
                  }
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  padCount === cnt ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                {cnt} {isEn ? 'Pads' : 'Renk'}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            {(['relaxed', 'normal', 'fast'] as SpeedMode[]).map((sp) => (
              <button
                key={sp}
                onClick={() => {
                  if (speed !== sp) {
                    setSpeed(sp);
                    handleResetIdle();
                  }
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  speed === sp ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                {sp === 'relaxed'
                  ? isEn
                    ? 'Slow'
                    : 'Rahat'
                  : sp === 'normal'
                    ? isEn
                      ? 'Normal'
                      : 'Normal'
                    : isEn
                      ? 'Fast'
                      : 'Hızlı'}
              </button>
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {phase === 'input' && replaysLeft > 0 && (
            <button
              onClick={handleReplay}
              className="h-8 sm:h-9 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
              title={isEn ? 'Watch sequence again' : 'Diziyi tekrar izle'}
            >
              <Eye size={15} />
              <span className="hidden sm:inline">{isEn ? 'Replay' : 'Tekrar İzle'}</span>
            </button>
          )}
          <button
            onClick={() => startNewGame()}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 border border-indigo-400/50 transition cursor-pointer"
            title={isEn ? 'Restart' : 'Yeniden Başlat'}
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-600 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Stage */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 gap-4 overflow-hidden">
        {/* Top HUD Strip */}
        <div className="w-full max-w-[580px] flex items-center justify-between gap-3">
          {mode === 'solo' ? (
            <>
              <div className="flex-1 rounded-2xl bg-white/8 border border-white/15 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  {isEn ? 'Round' : 'Seviye'}
                </span>
                <span className="text-2xl font-black text-cyan-300 tabular-nums">
                  {sequence.length}
                </span>
              </div>
              <div className="flex-1 rounded-2xl bg-white/8 border border-white/15 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  {isEn ? 'Progress' : 'İlerleme'}
                </span>
                <span className="text-2xl font-black text-white tabular-nums">
                  {phase === 'input' ? `${inputIndex}/${sequence.length}` : `${completedCount}`}
                </span>
              </div>
              <div className="flex-1 rounded-2xl bg-amber-500/15 border border-amber-400/35 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200 uppercase flex items-center gap-1">
                  <Trophy size={14} />
                  {isEn ? 'Best' : 'Rekor'}
                </span>
                <span className="text-2xl font-black text-amber-300 tabular-nums">
                  {currentBest}
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                className={`flex-1 rounded-2xl px-4 py-2.5 border-2 flex items-center justify-between transition ${
                  currentPlayer === 1 && phase !== 'idle'
                    ? 'bg-rose-500/25 border-rose-400 shadow-lg'
                    : 'bg-white/8 border-white/15 opacity-75'
                }`}
              >
                <span className="text-xs sm:text-sm font-black text-rose-200">
                  {isEn ? 'Player 1' : '1. Oyuncu'}
                </span>
                <span className="text-2xl font-black text-white tabular-nums">{duelScores.p1}</span>
              </div>
              <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/20 text-center">
                <div className="text-[10px] font-bold text-slate-300 uppercase">
                  {isEn ? 'Melody' : 'Dizi'}
                </div>
                <div className="text-xl font-black text-amber-300 tabular-nums">{sequence.length}</div>
              </div>
              <div
                className={`flex-1 rounded-2xl px-4 py-2.5 border-2 flex items-center justify-between transition ${
                  currentPlayer === 2 && phase !== 'idle'
                    ? 'bg-sky-500/25 border-sky-400 shadow-lg'
                    : 'bg-white/8 border-white/15 opacity-75'
                }`}
              >
                <span className="text-xs sm:text-sm font-black text-sky-200">
                  {isEn ? 'Player 2' : '2. Oyuncu'}
                </span>
                <span className="text-2xl font-black text-white tabular-nums">{duelScores.p2}</span>
              </div>
            </>
          )}
        </div>

        {/* Status Pill / Prompt */}
        <div className="flex items-center justify-center min-h-[40px]">
          {phase === 'idle' && (
            <button
              onClick={() => startNewGame()}
              className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-base sm:text-lg shadow-[0_0_28px_rgba(45,212,191,0.5)] flex items-center gap-2 transition cursor-pointer"
            >
              <Play size={20} className="fill-slate-950" />
              {isEn ? 'Start Melody!' : 'Melodiyi Başlat!'}
            </button>
          )}
          {phase === 'watching' && (
            <div className="px-5 py-2 rounded-2xl bg-amber-400/20 border border-amber-300/50 text-amber-200 font-black text-sm sm:text-base flex items-center gap-2">
              <Music size={18} className="animate-bounce" />
              {mode === 'duel'
                ? isEn
                  ? `Player ${currentPlayer}: Watch & Listen Carefully!`
                  : `${currentPlayer}. Oyuncu: Dikkatle İzle ve Dinle!`
                : isEn
                  ? 'Watch & Listen Carefully...'
                  : 'Dikkatle İzle ve Dinle...'}
            </div>
          )}
          {phase === 'input' && (
            <div className="px-5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-black text-sm sm:text-base flex items-center gap-2">
              <Sparkles size={18} />
              {mode === 'duel'
                ? isEn
                  ? `Player ${currentPlayer}'s Turn! Repeat (${inputIndex}/${sequence.length})`
                  : `Sıra ${currentPlayer}. Oyuncuda! Tekrar Et (${inputIndex}/${sequence.length})`
                : isEn
                  ? `Your Turn! Repeat the Melody (${inputIndex}/${sequence.length})`
                  : `Sıra Sende! Melodiyi Tekrar Et (${inputIndex}/${sequence.length})`}
            </div>
          )}
          {phase === 'round_clear' && (
            <div className="px-5 py-2 rounded-2xl bg-cyan-500/25 border border-cyan-300/60 text-cyan-100 font-black text-sm sm:text-base">
              {isEn ? 'Awesome! Next note added...' : 'Harika! Yeni nota ekleniyor...'}
            </div>
          )}
          {phase === 'gameover' && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-400/50">
              <span className="font-black text-sm sm:text-base text-rose-100">
                {mode === 'duel' && duelWinner
                  ? isEn
                    ? `Player ${duelWinner} Wins the Duel!`
                    : `${duelWinner}. Oyuncu Düelloyu Kazandı!`
                  : isEn
                    ? `Nice Try! Score: ${completedCount} notes`
                    : `Harika Deneme! Skorun: ${completedCount} nota`}
              </span>
              <button
                onClick={() => startNewGame()}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                {isEn ? 'Play Again' : 'Tekrar Oyna'}
              </button>
            </div>
          )}
        </div>

        {/* Musical Color Pads Grid */}
        <div
          className={`w-full ${
            padCount === 4
              ? 'max-w-[440px] grid-cols-2'
              : 'max-w-[580px] grid-cols-3'
          } grid gap-3.5 sm:gap-5 p-4 sm:p-6 rounded-[32px] bg-slate-900/85 border-2 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.55)]`}
        >
          {pads.map((pad) => {
            const isLit = activePad === pad.id;
            const canClick = phase === 'input';

            return (
              <button
                key={pad.id}
                onClick={() => handlePadPress(pad.id)}
                disabled={!canClick}
                className={`relative aspect-square rounded-[24px] sm:rounded-[28px] bg-gradient-to-br border-4 transition-all duration-100 flex flex-col items-center justify-center gap-1.5 shadow-xl focus:outline-none ${
                  isLit ? pad.activeClass : pad.baseClass
                } ${
                  canClick
                    ? 'cursor-pointer hover:brightness-110 active:scale-95'
                    : 'cursor-default opacity-90'
                }`}
              >
                {/* Top specular glass highlight */}
                <span className="pointer-events-none absolute top-2.5 inset-x-4 h-3 rounded-full bg-white/30" />

                <span className="text-3xl sm:text-4xl font-black drop-shadow-md leading-none">
                  {pad.symbol}
                </span>
                <span className="text-lg sm:text-xl font-black tracking-wider drop-shadow-sm">
                  {isEn ? pad.noteEn : pad.noteTr}
                </span>
                <span className="absolute bottom-2 right-3 text-[11px] font-black text-white/65 tabular-nums">
                  {pad.keyHint}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HafizaMelodisiGame;
