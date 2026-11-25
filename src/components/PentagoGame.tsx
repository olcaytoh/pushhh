import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Undo2,
  Bot,
  Users,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { useAppLanguage } from '../utils/appLanguage';

interface PentagoGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type Cell = 0 | 1 | 2; // 0 = empty, 1 = White (P1), 2 = Black (P2 / Bot)
type Board = Cell[][]; // 6x6
type TurnPhase = 'place' | 'rotate';
type GameMode = 'pve' | 'pvp';
type Difficulty = 'easy' | 'medium' | 'hard';
type QuadrantIdx = 0 | 1 | 2 | 3; // 0: TL, 1: TR, 2: BL, 3: BR
type RotDir = 'cw' | 'ccw';

interface HistoryEntry {
  board: Board;
  currentPlayer: 1 | 2;
}

const QUADRANT_OFFSETS: Record<QuadrantIdx, [number, number]> = {
  0: [0, 0],
  1: [0, 3],
  2: [3, 0],
  3: [3, 3],
};

const createEmptyBoard = (): Board =>
  Array.from({ length: 6 }, () => Array<Cell>(6).fill(0));

const cloneBoard = (b: Board): Board => b.map((row) => [...row]);

const rotateQuadrantOnBoard = (board: Board, q: QuadrantIdx, dir: RotDir): Board => {
  const next = cloneBoard(board);
  const [r0, c0] = QUADRANT_OFFSETS[q];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (dir === 'cw') {
        next[r0 + c][c0 + (2 - r)] = board[r0 + r][c0 + c];
      } else {
        next[r0 + (2 - c)][c0 + r] = board[r0 + r][c0 + c];
      }
    }
  }
  return next;
};

const findFiveInRow = (board: Board, player: 1 | 2): [number, number][] | null => {
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 6; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && board[nr][nc] === player) {
            line.push([nr, nc]);
          } else {
            break;
          }
        }
        if (line.length >= 5) return line;
      }
    }
  }
  return null;
};

const isBoardFull = (board: Board): boolean => {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
};

// Heuristic board evaluator for Pentago AI (player 2 = Black Bot, player 1 = White Human)
const evaluatePentagoBoard = (board: Board): number => {
  let score = 0;
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  // Center dimples of each 3x3 quadrant are invariant under rotation — hugely strategic!
  const centers: [number, number][] = [
    [1, 1],
    [1, 4],
    [4, 1],
    [4, 4],
  ];
  for (const [cr, cc] of centers) {
    if (board[cr][cc] === 2) score += 14;
    else if (board[cr][cc] === 1) score -= 14;
  }

  // Evaluate all 5-cell windows across the 6x6 board
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      for (const [dr, dc] of dirs) {
        const endR = r + dr * 4;
        const endC = c + dc * 4;
        if (endR < 0 || endR >= 6 || endC < 0 || endC >= 6) continue;

        let bot = 0;
        let human = 0;
        for (let k = 0; k < 5; k++) {
          const v = board[r + dr * k][c + dc * k];
          if (v === 2) bot++;
          else if (v === 1) human++;
        }

        if (bot > 0 && human > 0) continue; // blocked line
        if (bot === 5) score += 100000;
        else if (bot === 4) score += 650;
        else if (bot === 3) score += 75;
        else if (bot === 2) score += 12;
        else if (human === 5) score -= 100000;
        else if (human === 4) score -= 950;
        else if (human === 3) score -= 105;
        else if (human === 2) score -= 14;
      }
    }
  }
  return score;
};

interface BotDecision {
  row: number;
  col: number;
  quadrant: QuadrantIdx;
  dir: RotDir;
  immediateWinBeforeRotate: boolean;
}

const chooseBotMove = (board: Board, difficulty: Difficulty): BotDecision | null => {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return null;

  // 1. Check immediate win BEFORE rotating (all difficulties)
  for (const [r, c] of emptyCells) {
    board[r][c] = 2;
    const wins = !!findFiveInRow(board, 2);
    board[r][c] = 0;
    if (wins) {
      return { row: r, col: c, quadrant: 0, dir: 'cw', immediateWinBeforeRotate: true };
    }
  }

  const quads: QuadrantIdx[] = [0, 1, 2, 3];
  const dirs: RotDir[] = ['cw', 'ccw'];

  // Easy mode: occasionally takes a winning twist, otherwise plays playfully
  if (difficulty === 'easy') {
    if (Math.random() < 0.45) {
      for (const [r, c] of emptyCells) {
        board[r][c] = 2;
        for (const q of quads) {
          for (const d of dirs) {
            const after = rotateQuadrantOnBoard(board, q, d);
            if (findFiveInRow(after, 2) && !findFiveInRow(after, 1)) {
              board[r][c] = 0;
              return { row: r, col: c, quadrant: q, dir: d, immediateWinBeforeRotate: false };
            }
          }
        }
        board[r][c] = 0;
      }
    }
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const q = quads[Math.floor(Math.random() * 4)];
    const d = dirs[Math.floor(Math.random() * 2)];
    return { row: r, col: c, quadrant: q, dir: d, immediateWinBeforeRotate: false };
  }

  // Medium & Hard: evaluate all (cell, quadrant, dir) combinations (max 36*8 = 288 states, <5ms!)
  let bestScore = -Infinity;
  let bestMoves: BotDecision[] = [];

  for (const [r, c] of emptyCells) {
    board[r][c] = 2;
    for (const q of quads) {
      for (const d of dirs) {
        const after = rotateQuadrantOnBoard(board, q, d);
        const botWins = !!findFiveInRow(after, 2);
        const humanWins = !!findFiveInRow(after, 1);

        let sc: number;
        if (botWins && !humanWins) {
          sc = 1000000;
        } else if (humanWins && !botWins) {
          sc = -1000000;
        } else if (botWins && humanWins) {
          sc = 0;
        } else {
          sc = evaluatePentagoBoard(after);
          if (difficulty === 'medium') {
            sc += (Math.random() - 0.5) * 45;
          } else {
            // Hard: also penalize if human has an immediate 1-move win on next turn (sample fast)
            let humanImmediateThreat = false;
            for (let hr = 0; hr < 6 && !humanImmediateThreat; hr++) {
              for (let hc = 0; hc < 6 && !humanImmediateThreat; hc++) {
                if (after[hr][hc] !== 0) continue;
                after[hr][hc] = 1;
                if (findFiveInRow(after, 1)) {
                  humanImmediateThreat = true;
                }
                after[hr][hc] = 0;
              }
            }
            if (humanImmediateThreat) sc -= 8000;
            sc += (Math.random() - 0.5) * 6;
          }
        }

        if (sc > bestScore) {
          bestScore = sc;
          bestMoves = [{ row: r, col: c, quadrant: q, dir: d, immediateWinBeforeRotate: false }];
        } else if (sc === bestScore) {
          bestMoves.push({ row: r, col: c, quadrant: q, dir: d, immediateWinBeforeRotate: false });
        }
      }
    }
    board[r][c] = 0;
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || null;
};

export const PentagoGame: React.FC<PentagoGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  onGameCompleted,
}) => {
  const { lang } = useAppLanguage();
  const isEn = lang === 'en';

  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<TurnPhase>('place');
  const [winner, setWinner] = useState<0 | 1 | 2 | 'draw'>(0);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastPlaced, setLastPlaced] = useState<{ row: number; col: number } | null>(null);
  const [rotatingQuad, setRotatingQuad] = useState<{ q: QuadrantIdx; dir: RotDir } | null>(null);
  const [isBotBusy, setIsBotBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const pendingBotMoveRef = useRef<BotDecision | null>(null);
  const boardRef = useRef<Board>(board);
  boardRef.current = board;

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

  const playTone = useCallback(
    (type: 'marble' | 'twist' | 'win' | 'draw' | 'undo' | 'click') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;

        if (type === 'marble') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(290, now + 0.06);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'twist') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.14);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.24);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'win') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.09);
            gain.gain.setValueAtTime(0.2, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.32);
          });
        } else if (type === 'draw') {
          [340, 290].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.14);
            gain.gain.setValueAtTime(0.15, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.24);
          });
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(type === 'undo' ? 310 : 480, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        }
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled]
  );

  const playToneRef = useRef(playTone);
  playToneRef.current = playTone;

  const onGameCompletedRef = useRef(onGameCompleted);
  onGameCompletedRef.current = onGameCompleted;

  const resetGame = useCallback(
    (resetScores = false) => {
      clearAllTimers();
      pendingBotMoveRef.current = null;
      setBoard(createEmptyBoard());
      setCurrentPlayer(1);
      setPhase('place');
      setWinner(0);
      setWinningCells([]);
      setHistory([]);
      setLastPlaced(null);
      setRotatingQuad(null);
      setIsBotBusy(false);
      if (resetScores) setScores({ p1: 0, p2: 0, draws: 0 });
      playToneRef.current('click');
    },
    [clearAllTimers]
  );

  const finalizeTurnAfterBoardUpdate = useCallback(
    (nextBoard: Board, activePlayer: 1 | 2) => {
      const p1Win = findFiveInRow(nextBoard, 1);
      const p2Win = findFiveInRow(nextBoard, 2);

      if (p1Win && p2Win) {
        setWinner('draw');
        setWinningCells([...p1Win, ...p2Win]);
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
        playToneRef.current('draw');
        onGameCompletedRef.current?.(null, gameMode === 'pve' ? 1 : 2);
        return true;
      }
      if (p1Win) {
        setWinner(1);
        setWinningCells(p1Win);
        setScores((s) => ({ ...s, p1: s.p1 + 1 }));
        playToneRef.current('win');
        onGameCompletedRef.current?.(0, gameMode === 'pve' ? 1 : 2);
        return true;
      }
      if (p2Win) {
        setWinner(2);
        setWinningCells(p2Win);
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
        playToneRef.current('win');
        onGameCompletedRef.current?.(1, gameMode === 'pve' ? 1 : 2);
        return true;
      }
      if (isBoardFull(nextBoard)) {
        setWinner('draw');
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
        playToneRef.current('draw');
        onGameCompletedRef.current?.(null, gameMode === 'pve' ? 1 : 2);
        return true;
      }

      setCurrentPlayer(activePlayer === 1 ? 2 : 1);
      setPhase('place');
      return false;
    },
    [gameMode]
  );

  const handleCellClick = (r: number, c: number) => {
    if (winner !== 0 || phase !== 'place' || rotatingQuad || isBotBusy) return;
    if (gameMode === 'pve' && currentPlayer === 2) return;
    if (board[r][c] !== 0) return;

    // Save snapshot before turn begins for clean Undo
    setHistory((prev) => [...prev, { board: cloneBoard(board), currentPlayer }]);

    const nextBoard = cloneBoard(board);
    nextBoard[r][c] = currentPlayer;
    setBoard(nextBoard);
    setLastPlaced({ row: r, col: c });
    playTone('marble');

    // Official Pentago rule: if placing a marble immediately creates 5-in-a-row, game ends right away!
    const instantWin = findFiveInRow(nextBoard, currentPlayer);
    if (instantWin) {
      setWinner(currentPlayer);
      setWinningCells(instantWin);
      setScores((s) => ({
        ...s,
        p1: currentPlayer === 1 ? s.p1 + 1 : s.p1,
        p2: currentPlayer === 2 ? s.p2 + 1 : s.p2,
      }));
      playTone('win');
      onGameCompleted?.(currentPlayer === 1 ? 0 : 1, gameMode === 'pve' ? 1 : 2);
      return;
    }

    setPhase('rotate');
  };

  const handleRotateQuadrant = useCallback(
    (q: QuadrantIdx, dir: RotDir, baseBoard?: Board, activePlayer?: 1 | 2) => {
      if (winner !== 0 || rotatingQuad) return;
      const targetBoard = baseBoard ?? board;
      const actor = activePlayer ?? currentPlayer;

      setRotatingQuad({ q, dir });
      playTone('twist');

      schedule(() => {
        const rotated = rotateQuadrantOnBoard(targetBoard, q, dir);
        setBoard(rotated);
        setRotatingQuad(null);
        setLastPlaced(null);
        finalizeTurnAfterBoardUpdate(rotated, actor);
      }, 310);
    },
    [board, currentPlayer, finalizeTurnAfterBoardUpdate, playTone, rotatingQuad, schedule, winner]
  );

  // Bot Step 1: Choose and place a black marble
  useEffect(() => {
    if (gameMode !== 'pve' || currentPlayer !== 2 || winner !== 0 || phase !== 'place') return;

    setIsBotBusy(true);
    const placeTimer = window.setTimeout(() => {
      const snapshot = cloneBoard(boardRef.current);
      const decision = chooseBotMove(snapshot, difficulty);
      if (!decision) {
        setIsBotBusy(false);
        return;
      }

      const afterPlace = cloneBoard(boardRef.current);
      afterPlace[decision.row][decision.col] = 2;
      pendingBotMoveRef.current = decision;
      setBoard(afterPlace);
      setLastPlaced({ row: decision.row, col: decision.col });
      playToneRef.current('marble');

      if (decision.immediateWinBeforeRotate) {
        const winLine = findFiveInRow(afterPlace, 2) || [];
        pendingBotMoveRef.current = null;
        setWinner(2);
        setWinningCells(winLine);
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
        playToneRef.current('win');
        setIsBotBusy(false);
        onGameCompletedRef.current?.(1, 1);
        return;
      }

      setPhase('rotate');
    }, 450);

    return () => window.clearTimeout(placeTimer);
  }, [currentPlayer, difficulty, gameMode, phase, winner]);

  // Bot Step 2: Pause briefly so kids clearly see the placed marble, then spin the chosen 3x3 block 90°
  useEffect(() => {
    if (gameMode !== 'pve' || currentPlayer !== 2 || winner !== 0 || phase !== 'rotate') return;

    setIsBotBusy(true);
    const saved = pendingBotMoveRef.current;
    const quadrant: QuadrantIdx = saved ? saved.quadrant : (Math.floor(Math.random() * 4) as QuadrantIdx);
    const dir: RotDir = saved ? saved.dir : Math.random() < 0.5 ? 'cw' : 'ccw';

    let finishTimer: number | null = null;
    const spinStartTimer = window.setTimeout(() => {
      setRotatingQuad({ q: quadrant, dir });
      playToneRef.current('twist');

      finishTimer = window.setTimeout(() => {
        const rotated = rotateQuadrantOnBoard(boardRef.current, quadrant, dir);
        pendingBotMoveRef.current = null;
        setBoard(rotated);
        setRotatingQuad(null);
        setLastPlaced(null);
        setIsBotBusy(false);
        finalizeTurnAfterBoardUpdate(rotated, 2);
      }, 320);
    }, 480);

    return () => {
      window.clearTimeout(spinStartTimer);
      if (finishTimer !== null) window.clearTimeout(finishTimer);
    };
  }, [currentPlayer, finalizeTurnAfterBoardUpdate, gameMode, phase, winner]);

  const handleUndo = () => {
    if (history.length === 0 || isBotBusy || rotatingQuad) return;
    clearAllTimers();
    pendingBotMoveRef.current = null;
    const last = history[history.length - 1];
    setBoard(last.board);
    setCurrentPlayer(last.currentPlayer);
    setPhase('place');
    setWinner(0);
    setWinningCells([]);
    setLastPlaced(null);
    setHistory((prev) => prev.slice(0, -1));
    playTone('undo');
  };

  const isWinningCell = (r: number, c: number) =>
    winningCells.some(([wr, wc]) => wr === r && wc === c);

  const p1Name = isEn ? 'White (P1)' : 'Beyaz (1. Oyuncu)';
  const p2Name =
    gameMode === 'pve'
      ? isEn
        ? 'Black (Bot)'
        : 'Siyah (Bot)'
      : isEn
        ? 'Black (P2)'
        : 'Siyah (2. Oyuncu)';

  const canHumanRotate =
    winner === 0 &&
    phase === 'rotate' &&
    !rotatingQuad &&
    !isBotBusy &&
    !(gameMode === 'pve' && currentPlayer === 2);

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-slate-100 via-stone-50 to-rose-50 text-slate-900"
    >
      {/* Top Control Bar */}
      <header className="relative z-20 px-2.5 sm:px-5 py-2 bg-slate-950/95 border-b border-rose-500/40 flex items-center justify-between gap-2 shrink-0 shadow-md text-white">
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
            <h1 className="text-sm sm:text-base font-black tracking-wide text-rose-400 uppercase whitespace-nowrap">
              PENTAGO
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              {isEn
                ? 'Place a marble, then twist any 3×3 block 90° · First to 5 in a row wins!'
                : 'Bir taş koy, ardından istediğin 3×3 bloğu 90° döndür · 5 taşı sıralayan kazanır!'}
            </span>
          </div>
        </div>

        {/* Center Mode & Difficulty */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                if (gameMode !== 'pve') {
                  setGameMode('pve');
                  resetGame(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'pve'
                  ? 'bg-rose-500 text-white font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bot size={14} />
              <span className="hidden sm:inline">{isEn ? '1 Player' : '1 Kişilik'}</span>
            </button>
            <button
              onClick={() => {
                if (gameMode !== 'pvp') {
                  setGameMode('pvp');
                  resetGame(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-rose-500 text-white font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">{isEn ? '2 Players' : '2 Kişilik'}</span>
            </button>
          </div>

          {gameMode === 'pve' && (
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    if (difficulty !== level) {
                      setDifficulty(level);
                      resetGame(false);
                    }
                  }}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    difficulty === level
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level === 'easy'
                    ? isEn
                      ? 'Easy'
                      : 'Kolay'
                    : level === 'medium'
                      ? isEn
                        ? 'Medium'
                        : 'Orta'
                      : isEn
                        ? 'Hard'
                        : 'Zor'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isBotBusy || !!rotatingQuad}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
            title={isEn ? 'Undo' : 'Geri Al'}
          >
            <Undo2 size={15} />
            <span className="hidden md:inline">{isEn ? 'Undo' : 'Geri Al'}</span>
          </button>
          <button
            onClick={() => resetGame(false)}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 border border-rose-400/50 transition cursor-pointer"
            title={isEn ? 'New Game' : 'Yeni Oyun'}
          >
            <RotateCcw size={15} />
            <span className="hidden md:inline">{isEn ? 'Restart' : 'Yeni Oyun'}</span>
          </button>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-600 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Play Stage */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 p-3 sm:p-5 overflow-hidden">
        {/* Left/Top Player Cards & Step Guide */}
        <aside className="w-full max-w-[480px] lg:w-64 shrink-0 flex lg:flex-col items-stretch gap-2.5 sm:gap-3">
          {/* Player 1 — White Marbles */}
          <div
            className={`flex-1 rounded-2xl p-3 sm:p-4 border-2 transition-all bg-white shadow-md ${
              winner === 1 || (winner === 0 && currentPlayer === 1)
                ? 'border-rose-500 ring-4 ring-rose-500/20 scale-[1.02]'
                : 'border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[radial-gradient(circle_at_30%_28%,#ffffff_0%,#e2e8f0_65%,#94a3b8_100%)] border border-slate-300 shadow-md shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-900 truncate">{p1Name}</div>
                  <div className="text-[11px] font-bold text-rose-600">
                    {winner === 1
                      ? isEn
                        ? 'Winner!'
                        : 'Kazandı!'
                      : winner === 0 && currentPlayer === 1
                        ? phase === 'place'
                          ? isEn
                            ? '1. Place marble'
                            : '1. Taşını koy'
                          : isEn
                            ? '2. Twist a block'
                            : '2. Bloğu döndür'
                        : isEn
                          ? 'Waiting'
                          : 'Bekliyor'}
                  </div>
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">
                {scores.p1}
              </span>
            </div>
          </div>

          {/* Player 2 / Bot — Black Marbles */}
          <div
            className={`flex-1 rounded-2xl p-3 sm:p-4 border-2 transition-all bg-white shadow-md ${
              winner === 2 || (winner === 0 && currentPlayer === 2)
                ? 'border-slate-900 ring-4 ring-slate-900/15 scale-[1.02]'
                : 'border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative w-8 h-8 rounded-full bg-[radial-gradient(circle_at_30%_25%,#52525b_0%,#18181b_45%,#020617_100%)] border border-slate-950 shadow-md shrink-0">
                  <span className="absolute top-1.5 left-2 w-2 h-1.5 rounded-full bg-white/45 rotate-[-25deg]" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-900 truncate">{p2Name}</div>
                  <div className="text-[11px] font-bold text-slate-600">
                    {winner === 2
                      ? isEn
                        ? 'Winner!'
                        : 'Kazandı!'
                      : winner === 0 && currentPlayer === 2
                        ? isBotBusy
                          ? isEn
                            ? 'Bot playing...'
                            : 'Bot oynuyor...'
                          : phase === 'place'
                            ? isEn
                              ? '1. Place marble'
                              : '1. Taşını koy'
                            : isEn
                              ? '2. Twist a block'
                              : '2. Bloğu döndür'
                        : isEn
                          ? 'Waiting'
                          : 'Bekliyor'}
                  </div>
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {scores.p2}
              </span>
            </div>
          </div>

          {/* Rules Card (Desktop) */}
          <div className="hidden lg:flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-md text-xs">
            <div className="font-black uppercase tracking-wider text-rose-400">
              {isEn ? 'How to Play' : 'Nasıl Oynanır?'}
            </div>
            <p className="text-slate-300 leading-snug">
              <strong className="text-white">1.</strong>{' '}
              {isEn
                ? 'Place one marble into any empty red dimple.'
                : 'Boş bir kırmızı yuvaya kendi taşını yerleştir.'}
            </p>
            <p className="text-slate-300 leading-snug">
              <strong className="text-white">2.</strong>{' '}
              {isEn
                ? 'Twist ANY of the 4 blocks 90° left or right.'
                : '4 kırmızı bloktan istediğini sola veya sağa 90° döndür.'}
            </p>
            <p className="text-slate-300 leading-snug">
              <strong className="text-amber-300">★</strong>{' '}
              {isEn
                ? 'First player to align 5 marbles in a row wins!'
                : 'Yatay, dikey veya çapraz 5 taş sıralayan kazanır!'}
            </p>
          </div>
        </aside>

        {/* Center Iconic Pentago Board (Exact Reference Look!) */}
        <section className="flex flex-col items-center justify-center min-h-0">
          {/* Active Phase Prompt or Winner Banner */}
          <div className="mb-3 w-full max-w-[460px] flex justify-center">
            {winner !== 0 ? (
              <div className="w-full rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white px-4 py-2.5 shadow-xl border-2 border-white/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Trophy className="w-6 h-6 text-yellow-200 shrink-0" />
                  <span className="font-black text-sm sm:text-base truncate">
                    {winner === 'draw'
                      ? isEn
                        ? "It's a Draw!"
                        : 'Berabere! Harika Strateji!'
                      : winner === 1
                        ? isEn
                          ? 'White Wins! 5 in a Row!'
                          : 'Beyaz Kazandı! 5’li Sıra Tamam!'
                        : gameMode === 'pve'
                          ? isEn
                            ? 'Black Bot Wins!'
                            : 'Siyah Bot Kazandı!'
                          : isEn
                            ? 'Black Wins! 5 in a Row!'
                            : 'Siyah Kazandı! 5’li Sıra Tamam!'}
                  </span>
                </div>
                <button
                  onClick={() => resetGame(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-rose-700 font-black text-xs sm:text-sm shadow active:scale-95 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={14} />
                  {isEn ? 'Play Again' : 'Tekrar Oyna'}
                </button>
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-2xl border-2 font-black text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all ${
                  phase === 'rotate'
                    ? 'bg-amber-400 border-amber-500 text-slate-950 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full shrink-0 border ${
                    currentPlayer === 1
                      ? 'bg-white border-slate-400'
                      : 'bg-slate-950 border-slate-700'
                  }`}
                />
                {phase === 'place'
                  ? isBotBusy
                    ? isEn
                      ? 'Black Bot is choosing a move...'
                      : 'Siyah Bot hamlesini düşünüyor...'
                    : isEn
                      ? 'Step 1: Tap an empty dimple to place your marble'
                      : '1. Adım: Taşını yerleştirmek için boş bir yuvaya dokun'
                  : isBotBusy
                    ? isEn
                      ? 'Black Bot is twisting a block...'
                      : 'Siyah Bot bir bloğu döndürüyor...'
                    : isEn
                      ? 'Step 2: Tap ↺ or ↻ on ANY block to twist it 90°!'
                      : '2. Adım: İstediğin bir bloğun üzerindeki ↺ veya ↻ tuşuna bas!'}
              </div>
            )}
          </div>

          {/* Pearl-White Outer Pentago Tray Holding Four Glossy Red 3x3 Rotating Sub-Boards */}
          <div className="relative p-2.5 sm:p-3.5 rounded-[30px] sm:rounded-[34px] bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-300/90 shadow-[0_22px_50px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,0.9)]">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              {([0, 1, 2, 3] as QuadrantIdx[]).map((qIdx) => {
                const [r0, c0] = QUADRANT_OFFSETS[qIdx];
                const isSpinning = rotatingQuad?.q === qIdx;
                const spinDeg = isSpinning
                  ? rotatingQuad.dir === 'cw'
                    ? 'rotate(90deg) scale(0.95)'
                    : 'rotate(-90deg) scale(0.95)'
                  : 'rotate(0deg) scale(1)';

                return (
                  <div key={qIdx} className="relative">
                    {/* Rotating Red-and-White 3x3 Molded Plastic Sub-Board (matches reference photo!) */}
                    <div
                      style={{
                        transform: spinDeg,
                        transition: isSpinning ? 'transform 300ms cubic-bezier(0.34, 1.35, 0.64, 1)' : 'none',
                      }}
                      className={`relative w-[min(41vw,182px)] sm:w-[min(27vh,212px)] aspect-square p-2 sm:p-2.5 rounded-[22px] sm:rounded-[26px] bg-gradient-to-br from-[#ef2323] via-[#dc1e1e] to-[#b81414] border-[5px] sm:border-[6px] border-white shadow-[0_8px_18px_rgba(15,23,42,0.28),inset_0_2px_6px_rgba(255,255,255,0.3)] ${
                        canHumanRotate
                          ? 'ring-3 ring-amber-400/90 shadow-[0_0_22px_rgba(251,191,36,0.55)]'
                          : ''
                      }`}
                    >
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2">
                        {Array.from({ length: 9 }).map((_, localIdx) => {
                          const lr = Math.floor(localIdx / 3);
                          const lc = localIdx % 3;
                          const r = r0 + lr;
                          const c = c0 + lc;
                          const val = board[r][c];
                          const isWin = isWinningCell(r, c);
                          const isRecent = lastPlaced?.row === r && lastPlaced?.col === c;
                          const canPlace =
                            winner === 0 &&
                            phase === 'place' &&
                            !isBotBusy &&
                            !rotatingQuad &&
                            !(gameMode === 'pve' && currentPlayer === 2) &&
                            val === 0;

                          return (
                            <button
                              key={`${r}-${c}`}
                              onClick={() => handleCellClick(r, c)}
                              disabled={!canPlace && val === 0}
                              aria-label={`Row ${r + 1} Column ${c + 1}`}
                              className={`relative rounded-full flex items-center justify-center transition-all focus:outline-none bg-gradient-to-b from-[#991111] via-[#b91515] to-[#d92626] shadow-[inset_0_5px_9px_rgba(69,10,10,0.72),inset_0_-2px_3px_rgba(255,180,180,0.28)] ${
                                canPlace
                                  ? 'cursor-pointer hover:brightness-115 hover:ring-2 hover:ring-white/80 active:scale-95'
                                  : 'cursor-default'
                              }`}
                            >
                              {val === 1 && (
                                /* Glossy Pearl-White Marble (matches left side of reference image!) */
                                <div
                                  className={`relative w-[94%] h-[94%] rounded-full bg-[radial-gradient(circle_at_32%_26%,#ffffff_0%,#f8fafc_48%,#e2e8f0_82%,#cbd5e1_100%)] shadow-[0_5px_10px_rgba(69,10,10,0.55),inset_0_-4px_7px_rgba(148,163,184,0.55)] ${
                                    isWin
                                      ? 'ring-4 ring-amber-300 scale-105 animate-pulse'
                                      : isRecent
                                        ? 'ring-3 ring-sky-300'
                                        : ''
                                  }`}
                                >
                                  <span className="pointer-events-none absolute top-[14%] left-[20%] w-[28%] h-[18%] rounded-full bg-white/95 blur-[0.5px] -rotate-25" />
                                </div>
                              )}
                              {val === 2 && (
                                /* Glossy Jet-Black Obsidian Marble (matches right side of reference image!) */
                                <div
                                  className={`relative w-[94%] h-[94%] rounded-full bg-[radial-gradient(circle_at_30%_25%,#52525b_0%,#1c1917_34%,#09090b_74%,#000000_100%)] shadow-[0_6px_12px_rgba(0,0,0,0.72),inset_0_-3px_6px_rgba(255,255,255,0.12)] ${
                                    isWin
                                      ? 'ring-4 ring-amber-300 scale-105 animate-pulse'
                                      : isRecent
                                        ? 'ring-3 ring-amber-400'
                                        : ''
                                  }`}
                                >
                                  {/* Crisp studio reflection highlight like the reference photo */}
                                  <span className="pointer-events-none absolute top-[14%] left-[20%] w-[26%] h-[16%] rounded-full bg-white/55 blur-[0.5px] -rotate-25" />
                                  <span className="pointer-events-none absolute bottom-[18%] right-[18%] w-[16%] h-[10%] rounded-full bg-white/15 blur-[1px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual direction badge while a block is spinning (especially helpful when Bot twists!) */}
                    {isSpinning && (
                      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-400/95 text-slate-950 border-2 border-white shadow-xl flex items-center justify-center">
                          {rotatingQuad?.dir === 'cw' ? (
                            <RotateCw className="w-6 h-6 stroke-[2.75]" />
                          ) : (
                            <RotateCcw className="w-6 h-6 stroke-[2.75]" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Intuitive On-Quadrant Rotation Controls during Step 2 (Twist Phase) */}
                    {canHumanRotate && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center gap-2.5 sm:gap-3 bg-slate-950/28 backdrop-blur-[1px] rounded-[22px] sm:rounded-[26px]">
                        <button
                          onClick={() => handleRotateQuadrant(qIdx, 'ccw')}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white hover:bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-xl flex flex-col items-center justify-center active:scale-90 transition cursor-pointer"
                          title={isEn ? 'Twist 90° Left' : 'Sola 90° Döndür'}
                        >
                          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.75]" />
                          <span className="text-[9px] font-black uppercase leading-none mt-0.5">
                            {isEn ? 'Left' : 'Sola'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleRotateQuadrant(qIdx, 'cw')}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white hover:bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-xl flex flex-col items-center justify-center active:scale-90 transition cursor-pointer"
                          title={isEn ? 'Twist 90° Right' : 'Sağa 90° Döndür'}
                        >
                          <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.75]" />
                          <span className="text-[9px] font-black uppercase leading-none mt-0.5">
                            {isEn ? 'Right' : 'Sağa'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PentagoGame;
