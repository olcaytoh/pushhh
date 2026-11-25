import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Undo2,
  Bot,
  Users,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { ActivityBackground } from './ActivityBackground';
import { useAppLanguage } from '../utils/appLanguage';

interface DortluSiraGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

const ROWS = 6;
const COLS = 7;

type CellValue = 0 | 1 | 2;
type Board = CellValue[][];
type GameMode = 'pve' | 'pvp';
type Difficulty = 'easy' | 'medium' | 'hard';

interface MoveRecord {
  row: number;
  col: number;
  player: 1 | 2;
}

const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<CellValue>(COLS).fill(0));

const cloneBoard = (board: Board): Board => board.map((r) => [...r]);

const getLowestEmptyRow = (board: Board, col: number): number => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
};

const getValidCols = (board: Board): number[] => {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) cols.push(c);
  }
  return cols;
};

const findWinningCells = (board: Board, player: 1 | 2): [number, number][] | null => {
  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of directions) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) {
            line.push([nr, nc]);
          } else {
            break;
          }
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
};

const isBoardFull = (board: Board): boolean => {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) return false;
  }
  return true;
};

// Heuristic evaluation for Connect 4 AI (player 2 is AI, player 1 is human)
const evaluateWindow = (window: CellValue[], ai: 1 | 2, human: 1 | 2): number => {
  let aiCount = 0;
  let humanCount = 0;
  let emptyCount = 0;
  for (const cell of window) {
    if (cell === ai) aiCount++;
    else if (cell === human) humanCount++;
    else emptyCount++;
  }
  if (aiCount === 4) return 10000;
  if (humanCount === 4) return -10000;
  if (aiCount === 3 && emptyCount === 1) return 14;
  if (aiCount === 2 && emptyCount === 2) return 4;
  if (humanCount === 3 && emptyCount === 1) return -18;
  if (humanCount === 2 && emptyCount === 2) return -3;
  return 0;
};

const scoreBoard = (board: Board, ai: 1 | 2): number => {
  const human: 1 | 2 = ai === 2 ? 1 : 2;
  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === ai) centerCount++;
  }
  score += centerCount * 6;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(
        [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]],
        ai,
        human
      );
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += evaluateWindow(
        [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]],
        ai,
        human
      );
    }
  }
  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(
        [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]],
        ai,
        human
      );
    }
  }
  // Diagonal down-left
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      score += evaluateWindow(
        [board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]],
        ai,
        human
      );
    }
  }
  return score;
};

const COL_ORDER = [3, 2, 4, 1, 5, 0, 6];

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): { col: number; score: number } => {
  const validCols = COL_ORDER.filter((c) => board[0][c] === 0);
  if (findWinningCells(board, 2)) return { col: -1, score: 100000 + depth * 100 };
  if (findWinningCells(board, 1)) return { col: -1, score: -100000 - depth * 100 };
  if (validCols.length === 0) return { col: -1, score: 0 };
  if (depth === 0) return { col: -1, score: scoreBoard(board, 2) };

  if (maximizing) {
    let bestScore = -Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      const row = getLowestEmptyRow(board, col);
      board[row][col] = 2;
      const result = minimax(board, depth - 1, alpha, beta, false);
      board[row][col] = 0;
      if (result.score > bestScore) {
        bestScore = result.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: bestScore };
  } else {
    let bestScore = Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      const row = getLowestEmptyRow(board, col);
      board[row][col] = 1;
      const result = minimax(board, depth - 1, alpha, beta, true);
      board[row][col] = 0;
      if (result.score < bestScore) {
        bestScore = result.score;
        bestCol = col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: bestScore };
  }
};

const chooseBotColumn = (board: Board, difficulty: Difficulty): number => {
  const validCols = getValidCols(board);
  if (validCols.length === 0) return -1;

  // Immediate win check (all difficulties take an obvious win)
  for (const col of validCols) {
    const r = getLowestEmptyRow(board, col);
    board[r][col] = 2;
    const wins = !!findWinningCells(board, 2);
    board[r][col] = 0;
    if (wins) return col;
  }

  if (difficulty === 'easy') {
    // 35% chance to block immediate player win, otherwise playful random with slight center bias
    if (Math.random() < 0.35) {
      for (const col of validCols) {
        const r = getLowestEmptyRow(board, col);
        board[r][col] = 1;
        const blocks = !!findWinningCells(board, 1);
        board[r][col] = 0;
        if (blocks) return col;
      }
    }
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  // Immediate block check for medium & hard
  for (const col of validCols) {
    const r = getLowestEmptyRow(board, col);
    board[r][col] = 1;
    const blocks = !!findWinningCells(board, 1);
    board[r][col] = 0;
    if (blocks) return col;
  }

  if (difficulty === 'medium') {
    const copy = cloneBoard(board);
    const { col } = minimax(copy, 2, -Infinity, Infinity, true);
    return col !== -1 ? col : validCols[0];
  }

  // Hard: depth-4 alpha-beta minimax
  const copy = cloneBoard(board);
  const { col } = minimax(copy, 4, -Infinity, Infinity, true);
  return col !== -1 ? col : validCols[0];
};

export const DortluSiraGame: React.FC<DortluSiraGameProps> = ({
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
  const [winner, setWinner] = useState<0 | 1 | 2 | 'draw'>(0);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const botTimerRef = useRef<number | null>(null);

  const playTone = useCallback(
    (type: 'drop' | 'win' | 'draw' | 'undo' | 'click') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        if (type === 'drop') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.09);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'win') {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.09);
            gain.gain.setValueAtTime(0.18, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.32);
          });
        } else if (type === 'draw') {
          [330, 293.66].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.14);
            gain.gain.setValueAtTime(0.16, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.27);
          });
        } else if (type === 'undo' || type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(type === 'undo' ? 280 : 480, now);
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

  const clearBotTimer = useCallback(() => {
    if (botTimerRef.current !== null) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearBotTimer();
    };
  }, [clearBotTimer]);

  const resetBoard = useCallback(
    (resetScores = false) => {
      clearBotTimer();
      setIsBotThinking(false);
      setBoard(createEmptyBoard());
      setCurrentPlayer(1);
      setWinner(0);
      setWinningCells([]);
      setHistory([]);
      setLastMove(null);
      if (resetScores) {
        setScores({ p1: 0, p2: 0, draws: 0 });
      }
      playTone('click');
    },
    [clearBotTimer, playTone]
  );

  const executeDrop = useCallback(
    (col: number, player: 1 | 2, baseBoard: Board) => {
      const row = getLowestEmptyRow(baseBoard, col);
      if (row === -1) return;

      const nextBoard = cloneBoard(baseBoard);
      nextBoard[row][col] = player;

      setBoard(nextBoard);
      setLastMove({ row, col });
      setHistory((prev) => [...prev, { row, col, player }]);
      playTone('drop');

      const winLine = findWinningCells(nextBoard, player);
      if (winLine) {
        setWinner(player);
        setWinningCells(winLine);
        setScores((prev) => ({
          ...prev,
          p1: player === 1 ? prev.p1 + 1 : prev.p1,
          p2: player === 2 ? prev.p2 + 1 : prev.p2,
        }));
        playTone('win');
        onGameCompleted?.(player === 1 ? 0 : 1, gameMode === 'pve' ? 1 : 2);
        return;
      }

      if (isBoardFull(nextBoard)) {
        setWinner('draw');
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        playTone('draw');
        onGameCompleted?.(null, gameMode === 'pve' ? 1 : 2);
        return;
      }

      setCurrentPlayer(player === 1 ? 2 : 1);
    },
    [gameMode, onGameCompleted, playTone]
  );

  const handleColumnClick = useCallback(
    (col: number) => {
      if (winner !== 0 || isBotThinking) return;
      if (gameMode === 'pve' && currentPlayer === 2) return;
      if (getLowestEmptyRow(board, col) === -1) return;
      executeDrop(col, currentPlayer, board);
    },
    [board, currentPlayer, executeDrop, gameMode, isBotThinking, winner]
  );

  // Bot turn effect
  useEffect(() => {
    if (gameMode !== 'pve' || currentPlayer !== 2 || winner !== 0) return;

    setIsBotThinking(true);
    clearBotTimer();
    botTimerRef.current = window.setTimeout(() => {
      const col = chooseBotColumn(cloneBoard(board), difficulty);
      setIsBotThinking(false);
      if (col !== -1) {
        executeDrop(col, 2, board);
      }
    }, 420);

    return () => clearBotTimer();
  }, [board, clearBotTimer, currentPlayer, difficulty, executeDrop, gameMode, winner]);

  // Keyboard support (keys 1-7 to drop)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '7') {
        handleColumnClick(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleColumnClick]);

  const handleUndo = () => {
    if (history.length === 0 || isBotThinking) return;
    clearBotTimer();

    const stepsToUndo = gameMode === 'pve' && currentPlayer === 1 && history.length >= 2 && winner === 0 ? 2 : 1;
    const nextHistory = history.slice(0, history.length - stepsToUndo);
    const nextBoard = createEmptyBoard();
    for (const move of nextHistory) {
      nextBoard[move.row][move.col] = move.player;
    }

    setBoard(nextBoard);
    setHistory(nextHistory);
    setWinner(0);
    setWinningCells([]);
    const prevLast = nextHistory[nextHistory.length - 1];
    setLastMove(prevLast ? { row: prevLast.row, col: prevLast.col } : null);
    setCurrentPlayer(nextHistory.length % 2 === 0 ? 1 : 2);
    playTone('undo');
  };

  const isWinningCell = (r: number, c: number) =>
    winningCells.some(([wr, wc]) => wr === r && wc === c);

  const p1Label = isEn ? 'Red (P1)' : 'Kırmızı (1. Oyuncu)';
  const p2Label =
    gameMode === 'pve'
      ? isEn
        ? 'Yellow (Bot)'
        : 'Sarı (Bot)'
      : isEn
        ? 'Yellow (P2)'
        : 'Sarı (2. Oyuncu)';

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-100 text-slate-900"
    >
      <ActivityBackground theme="oyun" />

      {/* Top Control Bar */}
      <header className="relative z-20 px-2.5 sm:px-5 py-2 bg-slate-950/95 border-b border-blue-400/30 flex items-center justify-between gap-2 shrink-0 shadow-md text-white">
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
              {isEn ? 'Connect Four' : 'Dörtlü Sıra'}
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              {isEn
                ? 'Drop 4 discs in a row horizontally, vertically, or diagonally'
                : 'Yatay, dikey veya çapraz 4 pulu ilk sıralayan kazanır'}
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
                  resetBoard(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'pve'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
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
                  resetBoard(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
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
                      resetBoard(false);
                    }
                  }}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    difficulty === level
                      ? 'bg-blue-500 text-white shadow-sm'
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
            disabled={history.length === 0 || isBotThinking}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
            title={isEn ? 'Undo' : 'Geri Al'}
          >
            <Undo2 size={15} />
            <span className="hidden md:inline">{isEn ? 'Undo' : 'Geri Al'}</span>
          </button>
          <button
            onClick={() => resetBoard(false)}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 border border-blue-400/50 transition cursor-pointer"
            title={isEn ? 'New Game' : 'Yeni Oyun'}
          >
            <RotateCcw size={15} />
            <span className="hidden md:inline">{isEn ? 'Restart' : 'Yeni Oyun'}</span>
          </button>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-600 transition cursor-pointer"
            title={soundEnabled ? (isEn ? 'Mute' : 'Sesi Kapat') : isEn ? 'Unmute' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Play Stage */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 p-3 sm:p-5 overflow-hidden">
        {/* Left/Top Score & Turn Panel */}
        <aside className="w-full max-w-[520px] lg:w-64 shrink-0 flex lg:flex-col items-stretch justify-between gap-2.5 sm:gap-3">
          {/* Player 1 Card */}
          <div
            className={`flex-1 rounded-2xl p-3 sm:p-4 border-2 transition-all bg-white/90 backdrop-blur-sm shadow-md ${
              winner === 1 || (winner === 0 && currentPlayer === 1)
                ? 'border-rose-500 ring-4 ring-rose-500/20 scale-[1.02]'
                : 'border-slate-200/90 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 via-red-500 to-rose-700 border-2 border-red-200 shadow-inner shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-800 truncate">{p1Label}</div>
                  <div className="text-[11px] font-bold text-rose-600">
                    {winner === 1
                      ? isEn
                        ? 'Winner!'
                        : 'Kazandı!'
                      : winner === 0 && currentPlayer === 1
                        ? isEn
                          ? 'Your Turn'
                          : 'Sıra Sende'
                        : isEn
                          ? 'Waiting'
                          : 'Bekliyor'}
                  </div>
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
                {scores.p1}
              </span>
            </div>
          </div>

          {/* Player 2 / Bot Card */}
          <div
            className={`flex-1 rounded-2xl p-3 sm:p-4 border-2 transition-all bg-white/90 backdrop-blur-sm shadow-md ${
              winner === 2 || (winner === 0 && currentPlayer === 2)
                ? 'border-amber-500 ring-4 ring-amber-400/25 scale-[1.02]'
                : 'border-slate-200/90 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-inner shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-800 truncate">{p2Label}</div>
                  <div className="text-[11px] font-bold text-amber-600">
                    {winner === 2
                      ? isEn
                        ? 'Winner!'
                        : 'Kazandı!'
                      : winner === 0 && currentPlayer === 2
                        ? isBotThinking
                          ? isEn
                            ? 'Thinking...'
                            : 'Düşünüyor...'
                          : isEn
                            ? 'Your Turn'
                            : 'Sıra Sende'
                        : isEn
                          ? 'Waiting'
                          : 'Bekliyor'}
                  </div>
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
                {scores.p2}
              </span>
            </div>
          </div>

          {/* Draws & Move Count (Desktop) */}
          <div className="hidden lg:flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white border border-slate-700 shadow-md">
            <div className="text-xs font-bold text-slate-300">
              {isEn ? 'Moves' : 'Hamle'}:{' '}
              <span className="text-white font-black tabular-nums">{history.length}</span>
            </div>
            <div className="text-xs font-bold text-slate-300">
              {isEn ? 'Draws' : 'Berabere'}:{' '}
              <span className="text-amber-300 font-black tabular-nums">{scores.draws}</span>
            </div>
          </div>
        </aside>

        {/* Center Board Container */}
        <section className="flex flex-col items-center justify-center min-h-0 w-full max-w-[560px]">
          {/* Winner / Status Banner */}
          {winner !== 0 && (
            <div className="mb-2.5 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white px-4 py-2.5 shadow-xl border-2 border-white/40 flex items-center justify-between gap-3 animate-bounce-once">
              <div className="flex items-center gap-2.5 min-w-0">
                <Trophy className="w-6 h-6 text-amber-300 shrink-0" />
                <span className="font-black text-sm sm:text-base truncate">
                  {winner === 'draw'
                    ? isEn
                      ? "It's a Draw! Well played!"
                      : 'Berabere! Harika bir maçtı!'
                    : winner === 1
                      ? isEn
                        ? 'Red Wins! 4 in a Row!'
                        : 'Kırmızı Kazandı! Dörtlü Sıra Tamam!'
                      : gameMode === 'pve'
                        ? isEn
                          ? 'Bot Wins! Try Again!'
                          : 'Bot Kazandı! Tekrar Dene!'
                        : isEn
                          ? 'Yellow Wins! 4 in a Row!'
                          : 'Sarı Kazandı! Dörtlü Sıra Tamam!'}
                </span>
              </div>
              <button
                onClick={() => resetBoard(false)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={15} />
                {isEn ? 'Play Again' : 'Tekrar Oyna'}
              </button>
            </div>
          )}

          {/* Hover Preview Row */}
          <div className="w-full px-3 sm:px-4 grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-1.5 h-8 sm:h-10 items-center">
            {Array.from({ length: COLS }).map((_, c) => {
              const canDrop =
                winner === 0 &&
                !isBotThinking &&
                !(gameMode === 'pve' && currentPlayer === 2) &&
                board[0][c] === 0;
              const showGhost = canDrop && hoverCol === c;
              return (
                <button
                  key={c}
                  onClick={() => handleColumnClick(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  disabled={!canDrop}
                  aria-label={`${isEn ? 'Drop in column' : 'Sütuna bırak'} ${c + 1}`}
                  className="h-full flex items-center justify-center cursor-pointer disabled:cursor-default focus:outline-none"
                >
                  {showGhost ? (
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-lg border-2 transition-transform animate-bounce ${
                        currentPlayer === 1
                          ? 'bg-gradient-to-br from-rose-400 to-red-600 border-red-100'
                          : 'bg-gradient-to-br from-yellow-300 to-amber-500 border-yellow-50'
                      }`}
                    />
                  ) : (
                    <span className="text-[11px] font-black text-slate-500/70 tabular-nums">
                      {c + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tactile Blue Tabletop Connect-4 Frame */}
          <div className="relative w-full bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 p-2.5 sm:p-4 rounded-[26px] border-4 border-blue-900 shadow-[0_14px_34px_rgba(15,23,42,0.35),inset_0_3px_6px_rgba(255,255,255,0.35)]">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {Array.from({ length: ROWS }).map((_, r) =>
                Array.from({ length: COLS }).map((__, c) => {
                  const val = board[r][c];
                  const isWin = isWinningCell(r, c);
                  const isLast = lastMove?.row === r && lastMove?.col === c;
                  const canDrop =
                    winner === 0 &&
                    !isBotThinking &&
                    !(gameMode === 'pve' && currentPlayer === 2) &&
                    board[0][c] === 0;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleColumnClick(c)}
                      onMouseEnter={() => setHoverCol(c)}
                      onMouseLeave={() => setHoverCol(null)}
                      disabled={!canDrop && val === 0}
                      className={`relative aspect-square rounded-full flex items-center justify-center transition-all focus:outline-none ${
                        canDrop ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        hoverCol === c && canDrop && val === 0
                          ? 'bg-sky-100 shadow-[inset_0_4px_10px_rgba(30,58,138,0.45)]'
                          : 'bg-sky-50/95 shadow-[inset_0_5px_10px_rgba(15,23,42,0.5)]'
                      }`}
                    >
                      {val !== 0 && (
                        <div
                          className={`w-[92%] h-[92%] rounded-full transition-all duration-200 flex items-center justify-center ${
                            val === 1
                              ? 'bg-gradient-to-br from-rose-400 via-red-500 to-rose-700 shadow-[inset_0_-4px_8px_rgba(127,29,29,0.55),inset_0_3px_6px_rgba(255,255,255,0.55)] border-2 border-rose-300/60'
                              : 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 shadow-[inset_0_-4px_8px_rgba(146,64,14,0.5),inset_0_3px_6px_rgba(255,255,255,0.7)] border-2 border-yellow-100/80'
                          } ${isWin ? 'ring-4 ring-white scale-105 animate-pulse' : ''}`}
                        >
                          {/* Inner molded disc groove */}
                          <div
                            className={`w-[64%] h-[64%] rounded-full border-2 ${
                              val === 1 ? 'border-rose-300/40' : 'border-yellow-100/60'
                            } flex items-center justify-center`}
                          >
                            {isWin && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />}
                            {!isWin && isLast && (
                              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/90 shadow" />
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Wooden Stand Base */}
          <div className="w-[96%] h-3.5 sm:h-4 bg-gradient-to-b from-blue-800 to-slate-900 rounded-b-2xl shadow-lg border-x-4 border-b-4 border-blue-950" />
        </section>
      </main>
    </div>
  );
};

export default DortluSiraGame;
