import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Users, Bot, 
  Sparkles, CheckCircle2, ShieldAlert, Zap, Undo2, Award, Swords,
  Home, ChevronLeft, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface AblukaGameProps {
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

// Board is 7x7 (49 cells)
const BOARD_SIZE = 7;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

// Cell values: 0 = Empty, 1 = Player 1 (Red), 2 = Player 2 (Blue), 3 = Obstacle (Blockade)
type CellValue = 0 | 1 | 2 | 3;
type Turn = 1 | 2; // 1 = Red, 2 = Blue
type TurnPhase = 'move' | 'block'; // 1st move token, 2nd place obstacle
type GameMode = 'pve' | 'pvp'; // pve: vs Bot, pvp: 2 Players
type BotDifficulty = 'easy' | 'medium' | 'hard';

// Initial Positions:
// Player 2 (Blue) starts at row 0, col 3 (index 3)
// Player 1 (Red) starts at row 6, col 3 (index 45)
const P2_START_POS = 3;
const P1_START_POS = 45;

// 8 Directions (Up, Down, Left, Right, Diagonals)
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const AblukaGame: React.FC<AblukaGameProps> = ({
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
  // Board State
  const [board, setBoard] = useState<CellValue[]>(() => {
    const initial = Array<CellValue>(TOTAL_CELLS).fill(0);
    initial[P1_START_POS] = 1;
    initial[P2_START_POS] = 2;
    return initial;
  });

  const [p1Pos, setP1Pos] = useState<number>(P1_START_POS);
  const [p2Pos, setP2Pos] = useState<number>(P2_START_POS);
  const [turn, setTurn] = useState<Turn>(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('move');
  const [winner, setWinner] = useState<Turn | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Settings
  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');

  // Scores & Stats
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [placedObstaclesCount, setPlacedObstaclesCount] = useState(0);

  // History for undo
  const [history, setHistory] = useState<{
    board: CellValue[];
    p1Pos: number;
    p2Pos: number;
    turn: Turn;
    turnPhase: TurnPhase;
    placedCount: number;
  }[]>([]);

  const triggerSound = useCallback((src: string) => {
    if (playMp3) playMp3(src);
  }, [playMp3]);

  // Assigned students
  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  // Calculate valid adjacent moves for a given position
  const getValidMoves = useCallback((pos: number, currentBoard: CellValue[]): number[] => {
    const row = Math.floor(pos / BOARD_SIZE);
    const col = pos % BOARD_SIZE;
    const moves: number[] = [];

    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        const nIndex = nr * BOARD_SIZE + nc;
        // Must be empty (no player, no obstacle)
        if (currentBoard[nIndex] === 0) {
          moves.push(nIndex);
        }
      }
    }
    return moves;
  }, []);

  // Compute valid moves for active player in current state
  const activeValidMoves = useMemo(() => {
    if (winner !== null || turnPhase !== 'move') return [];
    if (gameMode === 'pve' && turn === 2) return []; // Bot's turn
    const curPos = turn === 1 ? p1Pos : p2Pos;
    return getValidMoves(curPos, board);
  }, [board, p1Pos, p2Pos, turn, turnPhase, winner, gameMode, getValidMoves]);

  // Real-time mobility counts for tactical status display
  const p1MovesCount = useMemo(() => getValidMoves(p1Pos, board).length, [p1Pos, board, getValidMoves]);
  const p2MovesCount = useMemo(() => getValidMoves(p2Pos, board).length, [p2Pos, board, getValidMoves]);

  // Restart current round
  const restartGame = useCallback(() => {
    const freshBoard = Array<CellValue>(TOTAL_CELLS).fill(0);
    freshBoard[P1_START_POS] = 1;
    freshBoard[P2_START_POS] = 2;
    setBoard(freshBoard);
    setP1Pos(P1_START_POS);
    setP2Pos(P2_START_POS);
    setTurn(1);
    setTurnPhase('move');
    setWinner(null);
    setIsBotThinking(false);
    setPlacedObstaclesCount(0);
    setHistory([]);
    triggerSound('/tekrar.mp3');
  }, [triggerSound]);

  // Handle victory
  const handleVictory = useCallback((winningPlayer: Turn) => {
    setWinner(winningPlayer);
    onGameCompleted?.(winningPlayer === 1 ? 0 : 1, 2);
    setScores(prev => ({
      ...prev,
      [winningPlayer === 1 ? 'p1' : 'p2']: prev[winningPlayer === 1 ? 'p1' : 'p2'] + 1
    }));
    triggerSound('/alkis.mp3');
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore
    }
  }, [triggerSound]);

  // Check if player is trapped at start of their turn
  const checkTrappedCondition = useCallback((playerToCheck: Turn, b: CellValue[], pos1: number, pos2: number) => {
    const targetPos = playerToCheck === 1 ? pos1 : pos2;
    const moves = getValidMoves(targetPos, b);
    if (moves.length === 0) {
      // Player has NO legal moves -> The other player wins!
      const w = playerToCheck === 1 ? 2 : 1;
      handleVictory(w);
      return true;
    }
    return false;
  }, [getValidMoves, handleVictory]);

  // Save state to history for undo
  const saveSnapshot = useCallback(() => {
    setHistory(prev => [
      ...prev.slice(-10), // keep last 10 snapshots
      {
        board: [...board],
        p1Pos,
        p2Pos,
        turn,
        turnPhase,
        placedCount: placedObstaclesCount
      }
    ]);
  }, [board, p1Pos, p2Pos, turn, turnPhase, placedObstaclesCount]);

  // Undo last action (only available for human player before bot moves)
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isBotThinking || winner !== null) return;
    const lastSnap = history[history.length - 1];
    setBoard(lastSnap.board);
    setP1Pos(lastSnap.p1Pos);
    setP2Pos(lastSnap.p2Pos);
    setTurn(lastSnap.turn);
    setTurnPhase(lastSnap.turnPhase);
    setPlacedObstaclesCount(lastSnap.placedCount);
    setHistory(prev => prev.slice(0, -1));
    triggerSound('/click.mp3');
  }, [history, isBotThinking, winner, triggerSound]);

  // Player action: Move token
  const handleMoveToken = useCallback((targetIndex: number) => {
    if (winner !== null || turnPhase !== 'move' || isBotThinking) return;
    if (gameMode === 'pve' && turn === 2) return;

    saveSnapshot();

    const newBoard = [...board];
    const curPos = turn === 1 ? p1Pos : p2Pos;
    newBoard[curPos] = 0;
    newBoard[targetIndex] = turn;

    setBoard(newBoard);
    if (turn === 1) {
      setP1Pos(targetIndex);
    } else {
      setP2Pos(targetIndex);
    }

    setTurnPhase('block');
    triggerSound('/ding.mp3');
  }, [board, turn, turnPhase, winner, isBotThinking, gameMode, p1Pos, p2Pos, saveSnapshot, triggerSound]);

  // Player action: Place obstacle
  const handlePlaceObstacle = useCallback((targetIndex: number) => {
    if (winner !== null || turnPhase !== 'block' || isBotThinking) return;
    if (gameMode === 'pve' && turn === 2) return;
    if (board[targetIndex] !== 0) return; // Must be empty

    saveSnapshot();

    const newBoard = [...board];
    newBoard[targetIndex] = 3; // Obstacle
    setBoard(newBoard);
    setPlacedObstaclesCount(c => c + 1);
    triggerSound('/coin.mp3');

    // Next turn
    const nextTurn = turn === 1 ? 2 : 1;

    // Check if the other player is now trapped
    const isTrapped = checkTrappedCondition(nextTurn, newBoard, p1Pos, p2Pos);
    if (!isTrapped) {
      setTurn(nextTurn);
      setTurnPhase('move');
    }
  }, [board, turn, turnPhase, winner, isBotThinking, gameMode, p1Pos, p2Pos, saveSnapshot, checkTrappedCondition, triggerSound]);

  // Bot Turn Logic (PvE mode)
  useEffect(() => {
    if (gameMode !== 'pve' || turn !== 2 || winner !== null) return;

    setIsBotThinking(true);

    const botTimer = setTimeout(() => {
      // 1. Bot Move Phase
      if (turnPhase === 'move') {
        const botMoves = getValidMoves(p2Pos, board);
        if (botMoves.length === 0) {
          // Bot is trapped!
          handleVictory(1);
          setIsBotThinking(false);
          return;
        }

        // Choose best move based on difficulty
        let chosenMove = botMoves[0];
        if (difficulty === 'easy') {
          // Random move
          chosenMove = botMoves[Math.floor(Math.random() * botMoves.length)];
        } else {
          // Medium & Hard: Pick move that maximizes bot's future free options
          // and moves toward or tactically relative to opponent
          let bestScore = -Infinity;
          for (const m of botMoves) {
            const tempBoard = [...board];
            tempBoard[p2Pos] = 0;
            tempBoard[m] = 2;
            const futureMoves = getValidMoves(m, tempBoard);
            
            // Distance to human player (Manhattan)
            const mRow = Math.floor(m / BOARD_SIZE);
            const mCol = m % BOARD_SIZE;
            const p1Row = Math.floor(p1Pos / BOARD_SIZE);
            const p1Col = p1Pos % BOARD_SIZE;
            const dist = Math.abs(mRow - p1Row) + Math.abs(mCol - p1Col);

            // In hard, avoid getting cornered
            const centerDist = Math.abs(mRow - 3) + Math.abs(mCol - 3);
            const score = futureMoves.length * 4 - dist * 0.5 - centerDist * (difficulty === 'hard' ? 0.8 : 0.2);

            if (score > bestScore) {
              bestScore = score;
              chosenMove = m;
            }
          }
        }

        const newBoard = [...board];
        newBoard[p2Pos] = 0;
        newBoard[chosenMove] = 2;
        setBoard(newBoard);
        setP2Pos(chosenMove);
        setTurnPhase('block');
        triggerSound('/ding.mp3');
        setIsBotThinking(false);
      } 
      // 2. Bot Block Phase
      else if (turnPhase === 'block') {
        // Collect all empty cells
        const emptyCells: number[] = [];
        board.forEach((val, idx) => {
          if (val === 0) emptyCells.push(idx);
        });

        if (emptyCells.length === 0) {
          setIsBotThinking(false);
          return;
        }

        let chosenBlock = emptyCells[0];

        if (difficulty === 'easy') {
          // Random block
          chosenBlock = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else {
          // Medium & Hard: Block the human player's valid moves or escape paths!
          const humanMoves = getValidMoves(p1Pos, board);
          if (humanMoves.length > 0) {
            // Block one of the human's moves to trap them!
            chosenBlock = humanMoves[Math.floor(Math.random() * humanMoves.length)];
          } else {
            // Pick cell closest to human player
            let minDist = Infinity;
            const p1Row = Math.floor(p1Pos / BOARD_SIZE);
            const p1Col = p1Pos % BOARD_SIZE;
            for (const c of emptyCells) {
              const r = Math.floor(c / BOARD_SIZE);
              const col = c % BOARD_SIZE;
              const d = Math.abs(r - p1Row) + Math.abs(col - p1Col);
              if (d < minDist) {
                minDist = d;
                chosenBlock = c;
              }
            }
          }
        }

        const newBoard = [...board];
        newBoard[chosenBlock] = 3;
        setBoard(newBoard);
        setPlacedObstaclesCount(c => c + 1);
        triggerSound('/coin.mp3');

        // Check if human player is trapped
        const isTrapped = checkTrappedCondition(1, newBoard, p1Pos, p2Pos);
        if (!isTrapped) {
          setTurn(1);
          setTurnPhase('move');
        }
        setIsBotThinking(false);
      }
    }, 450);

    return () => clearTimeout(botTimer);
  }, [gameMode, turn, turnPhase, winner, board, p1Pos, p2Pos, difficulty, getValidMoves, handleVictory, checkTrappedCondition, triggerSound]);

  // Click on any board cell
  const handleCellClick = (index: number) => {
    if (winner !== null || isBotThinking) return;
    if (gameMode === 'pve' && turn === 2) return;

    if (turnPhase === 'move') {
      if (activeValidMoves.includes(index)) {
        handleMoveToken(index);
      }
    } else if (turnPhase === 'block') {
      if (board[index] === 0) {
        handlePlaceObstacle(index);
      }
    }
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50/70 dark:from-[#0B132B] dark:via-blue-950 dark:to-slate-950 text-white"
    >
      {/* SAME BACKGROUND IMAGE AS XOX GAME (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-20 px-2 sm:px-6 py-1.5 sm:py-2 bg-slate-950/85 backdrop-blur-md border-b border-amber-400/30 flex items-center justify-between shrink-0 shadow-md">
        {/* LEFT: BACK BUTTON & TITLE */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-sm"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black tracking-wide text-amber-300 drop-shadow-sm uppercase">
                Abluka
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40">
                ♟️ Turnuva Arenası
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold hidden xs:inline-block">
              Rakibini kıstır, tüm çıkış yollarını engelle!
            </span>
          </div>
        </div>

        {/* CENTER: MODE & DIFFICULTY SELECTORS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Game Mode Tabs */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                setGameMode('pve');
                restartGame();
                triggerSound('/click.mp3');
              }}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                gameMode === 'pve'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot size={14} />
              <span className="hidden sm:inline">Bilgisayara Karşı</span>
              <span className="sm:hidden">Bot</span>
            </button>
            <button
              onClick={() => {
                setGameMode('pvp');
                restartGame();
                triggerSound('/click.mp3');
              }}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">2 Kişilik Düello</span>
              <span className="sm:hidden">Düello</span>
            </button>
          </div>

          {/* Difficulty (Only in PvE) */}
          {gameMode === 'pve' && (
            <div className="hidden md:flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 text-xs">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    setDifficulty(diff);
                    triggerSound('/click.mp3');
                  }}
                  className={`px-2 py-0.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'easy' ? 'Kolay' : diff === 'medium' ? 'Orta' : 'Usta'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: NAVIGATION, RULES, UNDO & RESTART */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Ana Sayfaya Dön"
            >
              <Home size={13} />
              <span className="hidden md:inline">Ana Sayfa</span>
            </button>
          )}

          <button
            onClick={() => setShowRulesModal(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-400/40 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Nasıl Oynanır?"
          >
            <HelpCircle size={18} />
          </button>
          
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isBotThinking || winner !== null}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Geri Al"
          >
            <Undo2 size={16} />
          </button>

          <button
            onClick={restartGame}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:scale-105 active:scale-95 text-slate-950 font-black flex items-center justify-center transition-all cursor-pointer shadow-md"
            title="Yeniden Başlat"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* MAIN GAMEPLAY CONTAINER */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-1.5 sm:p-2.5 overflow-hidden min-h-0 w-full max-w-5xl mx-auto">
        {/* TURN & INSTRUCTION STATUS BAR */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.6)] shrink-0">
          {/* PLAYER 1 (RED) BADGE */}
          <div className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl transition-all ${
            turn === 1 && winner === null
              ? 'bg-gradient-to-r from-rose-950/95 to-red-950/90 border-2 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-102'
              : 'bg-slate-900/60 border border-slate-800/80 text-slate-400'
          }`}>
            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-800 border-2 border-white/90 flex items-center justify-center text-xs sm:text-sm shadow-md shrink-0 ${
              turn === 1 && winner === null ? 'animate-pulse' : ''
            }`}>
              {p1Student?.avatar || '😎'}
              {turn === 1 && winner === null && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 animate-ping" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm uppercase tracking-wide truncate text-white">
                  {p1Student ? p1Student.name : '1. Kırmızı'}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  {scores.p1}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {p1MovesCount <= 2 ? (
                  <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                    ⚠️ Kritik: {p1MovesCount} Çıkış!
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-rose-300/80">
                    Çıkış: <strong className="text-white">{p1MovesCount}</strong> yol
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* INSTRUCTION PILL (CENTER) */}
          <div className="flex-1 text-center px-1">
            {winner !== null ? (
              <div className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider animate-bounce flex items-center justify-center gap-1.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                <span>🏆</span>
                <span>{winner === 1 ? (p1Student ? p1Student.name : '1. Oyuncu (Kırmızı)') : (p2Student ? p2Student.name : gameMode === 'pve' ? 'Bilgisayar' : '2. Oyuncu (Mavi)')} KAZANDI!</span>
              </div>
            ) : isBotThinking ? (
              <div className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                <span className="animate-spin text-sm">⚙️</span>
                <span>Bilgisayar en iyi hamleyi hesaplıyor...</span>
              </div>
            ) : turnPhase === 'move' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide">
                  {turn === 1 ? '1. Aşama (Kırmızı)' : '1. Aşama (Mavi)'}: Taşını Yeşil Kareye Oynat!
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <span className="text-sm">🧱</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  2. Aşama: Boş Kareye Engel Taşı (Blok) Yerleştir!
                </span>
              </div>
            )}
          </div>

          {/* PLAYER 2 (BLUE / BOT) BADGE */}
          <div className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl transition-all ${
            turn === 2 && winner === null
              ? 'bg-gradient-to-r from-blue-950/95 to-indigo-950/90 border-2 border-blue-500 text-blue-100 ring-2 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-102'
              : 'bg-slate-900/60 border border-slate-800/80 text-slate-400'
          }`}>
            <div className="flex flex-col min-w-0 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {scores.p2}
                </span>
                <span className="font-black text-xs sm:text-sm uppercase tracking-wide truncate text-white">
                  {gameMode === 'pve' ? 'Bilgisayar' : p2Student ? p2Student.name : '2. Mavi'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {p2MovesCount <= 2 ? (
                  <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse">
                    ⚠️ Kritik: {p2MovesCount} Çıkış!
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-blue-300/80">
                    Çıkış: <strong className="text-white">{p2MovesCount}</strong> yol
                  </span>
                )}
              </div>
            </div>
            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800 border-2 border-white/90 flex items-center justify-center text-xs sm:text-sm shadow-md shrink-0 ${
              turn === 2 && winner === null ? 'animate-pulse' : ''
            }`}>
              {gameMode === 'pve' ? '🤖' : p2Student?.avatar || '😎'}
              {turn === 2 && winner === null && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* 7x7 TOURNAMENT BOARD CONTAINER */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0 py-1">
          {/* Physical Tournament Board Casing (Rich Walnut / Ebony Wood Bezel) */}
          <div className="relative aspect-square w-full max-w-[min(67vh,490px)] sm:max-w-[min(70vh,530px)] p-2 sm:p-3.5 rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-b from-[#2d1b11] via-[#1d1109] to-[#0e0704] border-[4px] sm:border-[6px] border-[#663e20] shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_35px_rgba(245,158,11,0.18),_inset_0_2px_4px_rgba(255,255,255,0.2)] flex flex-col justify-between">
            
            {/* Four Corner Brass Screws / Decorative Metal Rivets */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm border border-amber-900/60 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-0.5 bg-amber-950/80 rotate-45" />
            </div>
            <div className="absolute top-2 right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm border border-amber-900/60 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-0.5 bg-amber-950/80 -rotate-45" />
            </div>
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm border border-amber-900/60 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-0.5 bg-amber-950/80 -rotate-45" />
            </div>
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm border border-amber-900/60 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-0.5 bg-amber-950/80 rotate-45" />
            </div>

            {/* Top Coordinate Header (A to G) */}
            <div className="grid grid-cols-7 w-full text-center px-4 sm:px-6 pb-0.5 sm:pb-1">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(col => (
                <span key={col} className="text-[10px] sm:text-xs font-black text-amber-300/80 uppercase tracking-widest drop-shadow-sm select-none">
                  {col}
                </span>
              ))}
            </div>

            {/* Middle Row (Left Numbers + 7x7 Grid + Right Numbers) */}
            <div className="flex-1 flex items-stretch w-full min-h-0 gap-1 sm:gap-1.5">
              {/* Left Row Coordinates (1 to 7) */}
              <div className="flex flex-col justify-around text-center shrink-0 w-3 sm:w-4 select-none">
                {['1', '2', '3', '4', '5', '6', '7'].map(row => (
                  <span key={row} className="text-[10px] sm:text-xs font-black text-amber-300/80 drop-shadow-sm">
                    {row}
                  </span>
                ))}
              </div>

              {/* 7x7 Grid with Tactile Inlay Tray */}
              <div className="flex-1 grid grid-cols-7 grid-rows-7 gap-1 sm:gap-1.5 w-full h-full p-1 sm:p-1.5 bg-[#090e18] rounded-2xl sm:rounded-3xl border-2 border-[#4a2e18] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
                {board.map((cellValue, idx) => {
                  const isP1 = cellValue === 1;
                  const isP2 = cellValue === 2;
                  const isObstacle = cellValue === 3;
                  const isValidMove = activeValidMoves.includes(idx);
                  const canPlaceObstacle = turnPhase === 'block' && cellValue === 0 && !isBotThinking && winner === null;

                  let cellBgClass = "bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] border-t border-t-white border-b-[3px] border-b-slate-400 shadow-[0_2px_4px_rgba(0,0,0,0.25)] hover:brightness-105";
                  let cursorClass = "cursor-default";

                  if (isValidMove) {
                    // Radiant Emerald Portal Tile
                    cellBgClass = "bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-400 border-2 border-emerald-500 border-b-[3px] border-b-emerald-700 shadow-[0_0_16px_rgba(16,185,129,0.85),_inset_0_2px_4px_rgba(255,255,255,0.7)] animate-pulse";
                    cursorClass = "cursor-pointer active:scale-95";
                  } else if (canPlaceObstacle) {
                    // Tactile interactive cell for placing obstacle
                    cellBgClass = "bg-white/95 hover:bg-amber-100/95 border border-slate-300 hover:border-amber-400 border-b-[3px] border-b-slate-400 hover:border-b-amber-500 shadow-xs";
                    cursorClass = "cursor-pointer hover:scale-102 active:scale-95";
                  } else if (isObstacle) {
                    // 3D Stone Monolith Blockade
                    cellBgClass = "bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-t-2 border-t-slate-400 border-b-[4px] border-b-[#020617] border-x border-x-slate-700 shadow-[0_6px_14px_rgba(0,0,0,0.8)]";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCellClick(idx)}
                      disabled={!isValidMove && !canPlaceObstacle}
                      className={`relative w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${cellBgClass} ${cursorClass}`}
                      aria-label={`Kare ${idx + 1}`}
                    >
                      {/* PLAYER 1: GLOSSY RED TOURNAMENT PUCK */}
                      {isP1 && (
                        <div className={`relative w-[84%] h-[84%] rounded-full bg-gradient-to-br from-rose-400 via-red-600 to-rose-950 border-2 sm:border-[3px] border-amber-300 shadow-[0_6px_16px_rgba(225,29,72,0.7),_inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center transform transition-all duration-200 ${
                          turn === 1 && turnPhase === 'move' && winner === null
                            ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#090e18] animate-bounce scale-105'
                            : 'hover:scale-105'
                        }`}>
                          {/* Gloss highlight reflection */}
                          <div className="absolute top-1 left-1.5 w-3 sm:w-4 h-1.5 sm:h-2 rounded-full bg-white/60 -rotate-35 pointer-events-none" />
                          <span className="text-base sm:text-xl md:text-2xl filter drop-shadow-sm select-none">
                            {p1Student?.avatar || '😎'}
                          </span>
                        </div>
                      )}

                      {/* PLAYER 2: GLOSSY BLUE TOURNAMENT PUCK */}
                      {isP2 && (
                        <div className={`relative w-[84%] h-[84%] rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-950 border-2 sm:border-[3px] border-cyan-300 shadow-[0_6px_16px_rgba(37,99,235,0.7),_inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center transform transition-all duration-200 ${
                          turn === 2 && turnPhase === 'move' && winner === null
                            ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#090e18] animate-bounce scale-105'
                            : 'hover:scale-105'
                        }`}>
                          {/* Gloss highlight reflection */}
                          <div className="absolute top-1 left-1.5 w-3 sm:w-4 h-1.5 sm:h-2 rounded-full bg-white/60 -rotate-35 pointer-events-none" />
                          <span className="text-base sm:text-xl md:text-2xl filter drop-shadow-sm select-none">
                            {gameMode === 'pve' ? '🤖' : p2Student?.avatar || '😎'}
                          </span>
                        </div>
                      )}

                      {/* VALID MOVE TARGET RETICLE */}
                      {isValidMove && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/80 border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </div>
                      )}

                      {/* OBSTACLE: 3D STONE MONOLITH BARRICADE */}
                      {isObstacle && (
                        <div className="w-full h-full rounded-md sm:rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600/70 shadow-inner flex flex-col items-center justify-center">
                          <span className="text-sm sm:text-base md:text-lg filter drop-shadow-md select-none transform hover:scale-110 transition-transform">
                            🧱
                          </span>
                          <span className="text-[7px] sm:text-[8px] font-black text-amber-400/90 tracking-widest uppercase -mt-0.5">
                            BLOK
                          </span>
                        </div>
                      )}

                      {/* PLACING OBSTACLE HOVER PREVIEW */}
                      {canPlaceObstacle && (
                        <div className="opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-700 font-black">
                          <span className="text-xs sm:text-sm">🧱</span>
                          <span className="text-[7px] font-black tracking-tighter uppercase -mt-0.5">ENGEL</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Row Coordinates (1 to 7) */}
              <div className="flex flex-col justify-around text-center shrink-0 w-3 sm:w-4 select-none">
                {['1', '2', '3', '4', '5', '6', '7'].map(row => (
                  <span key={row} className="text-[10px] sm:text-xs font-black text-amber-300/80 drop-shadow-sm">
                    {row}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Coordinate Footer (A to G) */}
            <div className="grid grid-cols-7 w-full text-center px-4 sm:px-6 pt-0.5 sm:pt-1">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(col => (
                <span key={col} className="text-[10px] sm:text-xs font-black text-amber-300/80 uppercase tracking-widest drop-shadow-sm select-none">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM GAME INFO BANNER */}
        <div className="w-full flex items-center justify-between text-xs text-slate-300 font-semibold px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-md shrink-0">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <span>🧱</span>
            <span>Kullanılan Engel: <strong className="text-white font-black">{placedObstaclesCount}</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Kural: 1. Taşını komşu kareye taşı ➜ 2. İstediğin boş kareye engel koy
          </span>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>🎯</span>
            <span className="hidden xs:inline">Amaç:</span>
            <span>Rakibi Kıstır!</span>
          </div>
        </div>
      </main>

      {/* STUDENT AVATAR DOCK AT THE BOTTOM */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={gameMode === 'pvp' ? 2 : 1}
            selectedStudentIds={gameMode === 'pvp' ? selectedStudentIds : [selectedStudentIds?.[0] || null]}
            onSelectStudentForPlayer={(pIdx, sId) => {
              if (onSelectStudentForPlayer) {
                onSelectStudentForPlayer(pIdx, sId);
              }
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <span>📖 Abluka Oyunu Kuralları</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-medium leading-relaxed">
              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-amber-300 block mb-0.5">🎯 Oyunun Amacı:</span>
                Rakibinin tüm kaçış yollarını kapatıp onu tamamen ablukaya almak. Sırası geldiğinde hareket edecek boş komşu karesi kalmayan oyuncu oyunu kaybeder!
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-emerald-300 block mb-0.5">1. Aşama - Taşını Hareket Ettir:</span>
                Kendi ana taşını bulunduğu kareye komşu boş bir kareye taşı (İleri, geri, sağa, sola veya çapraz - toplam 8 yön).
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-blue-300 block mb-0.5">2. Aşama - Engel Taşı Koy:</span>
                Taşını taşıdıktan hemen sonra tahtadaki boş karelerden birine engel taşı (blok 🧱) koyarak o kareyi kalıcı olarak kapat!
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-rose-300 block mb-0.5">🏆 Kazanma Şartı:</span>
                Sırası geldiğinde taşını hareket ettirebilecek hiçbir boş karesi kalmayan oyuncu ablukaya alınmış olur ve rakip oyuncu seti kazanır!
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider cursor-pointer hover:scale-102 transition-transform shadow-md"
            >
              Anladım, Oyuna Başla!
            </button>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-sm w-full bg-slate-950 border-3 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center mb-3 animate-bounce">
              <Trophy size={36} className="text-slate-950" />
            </div>

            <span className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
              🏆 ŞAMPİYON BELLİ OLDU!
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide drop-shadow-md mb-2">
              {winner === 1 
                ? (p1Student ? `${p1Student.name} (Kırmızı)` : '1. Oyuncu (Kırmızı)') 
                : (gameMode === 'pve' ? 'Bilgisayar' : p2Student ? `${p2Student.name} (Mavi)` : '2. Oyuncu (Mavi)')
              } KAZANDI!
            </h3>

            <p className="text-white/80 text-xs sm:text-sm font-semibold mb-4">
              Rakibini ustaca ablukaya alarak galibiyete ulaştı!
            </p>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all border border-white cursor-pointer"
              >
                Yeniden Oyna
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/20 text-white font-black text-xs uppercase tracking-wider hover:bg-white/30 active:scale-95 transition-all border border-white/30 cursor-pointer"
              >
                Diğer Oyunlar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
