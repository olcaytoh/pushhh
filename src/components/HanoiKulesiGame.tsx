import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Undo2,
  Lightbulb,
  Star,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ActivityBackground } from './ActivityBackground';
import { useAppLanguage } from '../utils/appLanguage';

interface HanoiKulesiGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type DiskCount = 3 | 4 | 5 | 6;
type PegIndex = 0 | 1 | 2;
type Towers = [number[], number[], number[]];

const createInitialTowers = (n: DiskCount): Towers => {
  const startPeg: number[] = [];
  for (let size = n; size >= 1; size--) {
    startPeg.push(size);
  }
  return [startPeg, [], []];
};

const cloneTowers = (t: Towers): Towers => [[...t[0]], [...t[1]], [...t[2]]];

// Exact optimal next move from ANY valid Tower of Hanoi configuration to move all disks to targetPeg (2)
const computeOptimalNextMove = (
  towers: Towers,
  diskCount: number,
  targetPeg: PegIndex = 2
): { from: PegIndex; to: PegIndex; disk: number } | null => {
  // Locate which peg each disk (1..diskCount) is currently on
  const pos = new Array<PegIndex>(diskCount + 1);
  for (let p = 0 as PegIndex; p <= 2; p = (p + 1) as PegIndex) {
    for (const d of towers[p]) {
      pos[d] = p;
    }
  }

  let desired: PegIndex = targetPeg;
  // Find the largest disk not yet on its desired peg, walking downward to find the exact immediate move
  let move: { from: PegIndex; to: PegIndex; disk: number } | null = null;
  for (let d = diskCount; d >= 1; d--) {
    if (pos[d] !== desired) {
      const from = pos[d];
      const to = desired;
      move = { from, to, disk: d };
      // To move disk d from `from` to `to`, all smaller disks (d-1..1) must first move to the auxiliary peg
      desired = (3 - from - to) as PegIndex;
    }
  }
  return move;
};

const DISK_COLORS: Record<number, { grad: string; border: string; text: string }> = {
  1: { grad: 'from-rose-400 via-red-500 to-rose-600', border: 'border-rose-800', text: 'text-white' },
  2: { grad: 'from-orange-400 via-orange-500 to-amber-600', border: 'border-orange-800', text: 'text-white' },
  3: { grad: 'from-yellow-300 via-amber-400 to-yellow-500', border: 'border-amber-700', text: 'text-amber-950' },
  4: { grad: 'from-emerald-400 via-green-500 to-emerald-600', border: 'border-emerald-800', text: 'text-white' },
  5: { grad: 'from-sky-400 via-blue-500 to-blue-600', border: 'border-blue-800', text: 'text-white' },
  6: { grad: 'from-violet-400 via-purple-500 to-purple-600', border: 'border-purple-800', text: 'text-white' },
};

const STORAGE_KEY = 'olcico_hanoi_kulesi_stars_v1';

export const HanoiKulesiGame: React.FC<HanoiKulesiGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  onGameCompleted,
}) => {
  const { lang } = useAppLanguage();
  const isEn = lang === 'en';

  const [diskCount, setDiskCount] = useState<DiskCount>(3);
  const [towers, setTowers] = useState<Towers>(() => createInitialTowers(3));
  const [history, setHistory] = useState<Towers[]>([]);
  const [selectedPeg, setSelectedPeg] = useState<PegIndex | null>(null);
  const [solved, setSolved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakePeg, setShakePeg] = useState<PegIndex | null>(null);
  const [hintMove, setHintMove] = useState<{ from: PegIndex; to: PegIndex; disk: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestStars, setBestStars] = useState<Record<number, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  const minMoves = Math.pow(2, diskCount) - 1;
  const moves = history.length;

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    };
  }, []);

  const playTone = useCallback(
    (kind: 'pick' | 'place' | 'error' | 'win' | 'hint' | 'undo', diskSize = 3) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;

        if (kind === 'pick' || kind === 'place') {
          const baseFreq = 260 + (7 - diskSize) * 55;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(kind === 'pick' ? baseFreq : baseFreq * 0.85, now);
          osc.frequency.exponentialRampToValueAtTime(
            kind === 'pick' ? baseFreq * 1.18 : baseFreq * 0.72,
            now + 0.09
          );
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (kind === 'error') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(175, now);
          osc.frequency.exponentialRampToValueAtTime(125, now + 0.18);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.21);
        } else if (kind === 'win') {
          [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.08);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.32);
          });
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(kind === 'hint' ? 620 : 320, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        }
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled]
  );

  const resetGame = useCallback((nextDiskCount?: DiskCount) => {
    const count = nextDiskCount ?? diskCount;
    setDiskCount(count);
    setTowers(createInitialTowers(count));
    setHistory([]);
    setSelectedPeg(null);
    setSolved(false);
    setErrorMsg(null);
    setShakePeg(null);
    setHintMove(null);
  }, [diskCount]);

  const showTemporaryError = useCallback((msg: string, peg: PegIndex) => {
    setErrorMsg(msg);
    setShakePeg(peg);
    if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => {
      setErrorMsg(null);
      setShakePeg(null);
    }, 1800);
  }, []);

  const handlePegClick = useCallback(
    (pegIdx: PegIndex) => {
      if (solved) return;
      setErrorMsg(null);

      // Step 1: Picking up a disk
      if (selectedPeg === null) {
        if (towers[pegIdx].length === 0) return;
        const topDisk = towers[pegIdx][towers[pegIdx].length - 1];
        setSelectedPeg(pegIdx);
        playTone('pick', topDisk);
        return;
      }

      // Clicking the same peg cancels selection
      if (selectedPeg === pegIdx) {
        setSelectedPeg(null);
        return;
      }

      // Step 2: Placing the picked disk onto pegIdx
      const sourceStack = towers[selectedPeg];
      const targetStack = towers[pegIdx];
      const movingDisk = sourceStack[sourceStack.length - 1];
      const targetTop = targetStack.length > 0 ? targetStack[targetStack.length - 1] : Infinity;

      if (movingDisk > targetTop) {
        playTone('error');
        showTemporaryError(
          isEn
            ? 'A larger ring cannot sit on top of a smaller ring!'
            : 'Büyük halka, küçük halkanın üstüne konulamaz!',
          pegIdx
        );
        setSelectedPeg(null);
        return;
      }

      const nextTowers = cloneTowers(towers);
      const popped = nextTowers[selectedPeg].pop()!;
      nextTowers[pegIdx].push(popped);

      const nextMoveCount = history.length + 1;
      setHistory((prev) => [...prev, cloneTowers(towers)]);
      setTowers(nextTowers);
      setSelectedPeg(null);
      setHintMove(null);
      playTone('place', popped);

      // Win condition: all disks cleanly stacked on target peg C (index 2)
      if (nextTowers[2].length === diskCount) {
        setSolved(true);
        playTone('win');
        const stars =
          nextMoveCount <= minMoves
            ? 3
            : nextMoveCount <= Math.ceil(minMoves * 1.35)
              ? 2
              : 1;
        setBestStars((prev) => {
          const updated = { ...prev, [diskCount]: Math.max(prev[diskCount] || 0, stars) };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
          return updated;
        });
        onGameCompleted?.(0, 1);
      }
    },
    [diskCount, history.length, isEn, minMoves, onGameCompleted, playTone, selectedPeg, showTemporaryError, solved, towers]
  );

  // Keyboard shortcuts: 1, 2, 3 to select/drop pegs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handlePegClick(0);
      else if (e.key === '2') handlePegClick(1);
      else if (e.key === '3') handlePegClick(2);
      else if (e.key === 'Escape') setSelectedPeg(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePegClick]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTowers(prev);
    setHistory((h) => h.slice(0, -1));
    setSelectedPeg(null);
    setSolved(false);
    setHintMove(null);
    playTone('undo');
  };

  const handleHint = () => {
    if (solved) return;
    const next = computeOptimalNextMove(towers, diskCount, 2);
    if (next) {
      setHintMove(next);
      setSelectedPeg(next.from);
      playTone('hint');
    }
  };

  const pegNames = isEn
    ? ['A · Start', 'B · Helper', 'C · Target']
    : ['A · Başlangıç', 'B · Yardımcı', 'C · Hedef'];

  const earnedStarsCurrent =
    moves <= minMoves ? 3 : moves <= Math.ceil(minMoves * 1.35) ? 2 : 1;

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-sky-100 text-slate-900"
    >
      <ActivityBackground theme="doga" />

      {/* Top Bar */}
      <header className="relative z-20 px-2.5 sm:px-5 py-2 bg-slate-950/95 border-b border-amber-400/30 flex items-center justify-between gap-2 shrink-0 shadow-md text-white">
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
            <h1 className="text-sm sm:text-base font-black tracking-wide text-amber-300 uppercase whitespace-nowrap">
              {isEn ? 'Tower of Hanoi' : 'Hanoi Kulesi'}
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              {isEn
                ? 'Move all rings from A to C without placing a big ring on a small ring'
                : 'Büyük halkayı küçüğün üstüne koymadan tüm kuleyi C çubuğuna taşı'}
            </span>
          </div>
        </div>

        {/* Center Disk Selector */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 shrink-0">
          {([3, 4, 5, 6] as DiskCount[]).map((cnt) => {
            const stars = bestStars[cnt] || 0;
            return (
              <button
                key={cnt}
                onClick={() => resetGame(cnt)}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  diskCount === cnt
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{cnt}</span>
                <span className="hidden sm:inline">{isEn ? 'Rings' : 'Halka'}</span>
                {stars > 0 && (
                  <Star
                    size={11}
                    className={
                      diskCount === cnt
                        ? 'fill-slate-950 text-slate-950'
                        : 'fill-amber-400 text-amber-400'
                    }
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleHint}
            disabled={solved}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
            title={isEn ? 'Show Optimal Next Move' : 'En İyi Hamle İpucu'}
          >
            <Lightbulb size={15} />
            <span className="hidden sm:inline">{isEn ? 'Hint' : 'İpucu'}</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
            title={isEn ? 'Undo' : 'Geri Al'}
          >
            <Undo2 size={15} />
            <span className="hidden md:inline">{isEn ? 'Undo' : 'Geri Al'}</span>
          </button>
          <button
            onClick={() => resetGame()}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
            title={isEn ? 'Reset' : 'Sıfırla'}
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

      {/* Main Play Area */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-6 gap-4 overflow-hidden">
        {/* Top Metrics Strip */}
        <div className="w-full max-w-[780px] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="px-4 py-2 rounded-2xl bg-white/95 border-2 border-amber-200 shadow-sm flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {isEn ? 'Moves' : 'Hamle'}
              </span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">{moves}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/95 border-2 border-emerald-200 shadow-sm flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {isEn ? 'Minimum Goal' : 'En Az Hamle'}
              </span>
              <span className="text-2xl font-black text-emerald-700 tabular-nums">{minMoves}</span>
            </div>
          </div>

          {/* Rule Reminder or Error Toast */}
          <div className="flex-1 min-w-[220px] flex justify-end">
            {errorMsg ? (
              <div className="px-4 py-2 rounded-2xl bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : hintMove ? (
              <div className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2">
                <Lightbulb size={16} className="shrink-0" />
                <span>
                  {isEn
                    ? `Move ring #${hintMove.disk} from ${['A', 'B', 'C'][hintMove.from]} → ${['A', 'B', 'C'][hintMove.to]}`
                    : `${hintMove.disk} numaralı halkayı ${['A', 'B', 'C'][hintMove.from]} → ${['A', 'B', 'C'][hintMove.to]} çubuğuna taşı`}
                </span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-white/85 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm">
                {selectedPeg !== null
                  ? isEn
                    ? 'Now tap a target peg to drop the ring.'
                    : 'Şimdi halkayı bırakmak istediğin çubuğa dokun.'
                  : isEn
                    ? 'Tap a peg to lift its top ring (Keys 1, 2, 3).'
                    : 'Üstteki halkayı kaldırmak için bir çubuğa dokun.'}
              </div>
            )}
          </div>
        </div>

        {/* Win Celebration Banner */}
        {solved && (
          <div className="w-full max-w-[780px] rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-5 py-3 shadow-xl border-2 border-white/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-300 shrink-0" />
              <div>
                <div className="font-black text-sm sm:text-base flex items-center gap-2">
                  {isEn ? 'Tower Completed!' : 'Kule Başarıyla Taşındı!'}
                  <span className="inline-flex">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          s <= earnedStarsCurrent
                            ? 'fill-amber-300 text-amber-300'
                            : 'text-white/35'
                        }
                      />
                    ))}
                  </span>
                </div>
                <div className="text-xs text-emerald-100 font-semibold">
                  {moves === minMoves
                    ? isEn
                      ? `Perfect score! Solved in the exact minimum ${minMoves} moves!`
                      : `Kusursuz! Tam olarak en az ${minMoves} hamlede çözdün!`
                    : isEn
                      ? `Solved in ${moves} moves (Minimum possible: ${minMoves})`
                      : `${moves} hamlede tamamlandı (En az hamle: ${minMoves})`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resetGame()}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                {isEn ? 'Replay' : 'Tekrar Dene'}
              </button>
              {diskCount < 6 && (
                <button
                  onClick={() => resetGame((diskCount + 1) as DiskCount)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={15} />
                  {isEn ? `Try ${diskCount + 1} Rings` : `${diskCount + 1} Halkaya Geç`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wooden Montessori Tower Stage */}
        <section className="w-full max-w-[820px] flex-1 max-h-[430px] rounded-[32px] bg-white/90 backdrop-blur-sm border-2 border-amber-200/90 shadow-[0_18px_42px_rgba(120,53,15,0.14)] p-4 sm:p-7 flex flex-col justify-end">
          {/* 3 Interactive Peg Columns */}
          <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-6 items-end pt-12">
            {([0, 1, 2] as PegIndex[]).map((pegIdx) => {
              const stack = towers[pegIdx];
              const isSelectedSource = selectedPeg === pegIdx;
              const isHintFrom = hintMove?.from === pegIdx;
              const isHintTo = hintMove?.to === pegIdx;
              const isTargetPeg = pegIdx === 2;
              const isShaking = shakePeg === pegIdx;

              // Can drop currently selected disk onto this peg?
              const canDropHere =
                selectedPeg !== null &&
                selectedPeg !== pegIdx &&
                (stack.length === 0 ||
                  towers[selectedPeg][towers[selectedPeg].length - 1] < stack[stack.length - 1]);

              return (
                <button
                  key={pegIdx}
                  onClick={() => handlePegClick(pegIdx)}
                  className={`relative h-full min-h-[210px] sm:min-h-[250px] flex flex-col justify-end items-center rounded-2xl transition-all focus:outline-none cursor-pointer group ${
                    isHintTo
                      ? 'bg-amber-100/80 ring-3 ring-amber-400'
                      : isHintFrom
                        ? 'bg-sky-100/70 ring-3 ring-sky-400'
                        : canDropHere
                          ? 'hover:bg-emerald-50/80'
                          : isTargetPeg
                            ? 'bg-emerald-50/35 hover:bg-emerald-50/60'
                            : 'hover:bg-amber-50/60'
                  } ${isShaking ? 'animate-pulse bg-rose-100/90 ring-3 ring-rose-500' : ''}`}
                >
                  {/* Wooden Vertical Rod */}
                  <div
                    className={`absolute bottom-0 w-3.5 sm:w-4 h-[84%] rounded-t-full border-x border-t shadow-inner pointer-events-none ${
                      isTargetPeg
                        ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 border-emerald-700'
                        : 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 border-amber-800'
                    }`}
                  />

                  {/* Disks Stacked Bottom-Up */}
                  <div className="relative z-10 w-full px-1.5 sm:px-3 flex flex-col-reverse items-center gap-1 pb-0.5">
                    {stack.map((diskSize, stackIdx) => {
                      const isTop = stackIdx === stack.length - 1;
                      const isLifted = isSelectedSource && isTop;
                      const widthPct = 36 + (diskSize / diskCount) * 60;
                      const palette = DISK_COLORS[diskSize] || DISK_COLORS[1];

                      return (
                        <div
                          key={diskSize}
                          style={{
                            width: `${widthPct}%`,
                            transform: isLifted ? 'translateY(-32px) scale(1.04)' : 'translateY(0)',
                          }}
                          className={`h-8 sm:h-10 rounded-full bg-gradient-to-b ${palette.grad} border-2 ${palette.border} shadow-[0_4px_10px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,0.5)] transition-transform duration-200 flex items-center justify-center ${
                            isLifted ? 'ring-4 ring-white shadow-2xl' : ''
                          }`}
                        >
                          <span className={`text-xs sm:text-sm font-black tabular-nums ${palette.text}`}>
                            {diskSize}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Solid Oak Wooden Base */}
          <div className="w-full h-5 sm:h-6 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-950 shadow-lg mt-0.5" />

          {/* Peg Labels */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-2.5">
            {pegNames.map((label, idx) => (
              <div
                key={label}
                className={`text-center text-xs sm:text-sm font-black uppercase tracking-wide ${
                  idx === 2 ? 'text-emerald-700' : 'text-slate-700'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HanoiKulesiGame;
