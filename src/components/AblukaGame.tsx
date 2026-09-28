import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Users, Bot, 
  Sparkles, CheckCircle2, ShieldAlert, Zap, Undo2, Award, Swords,
  Home, ChevronLeft, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { TurkishActivityBackground } from './TurkishActivityBackground';

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
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-slate-900 via-[#0B132B] to-slate-950 text-white"
    >
      <TurkishActivityBackground darkness="normal" />

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-20 px-2 sm:px-6 py-1.5 sm:py-2 bg-slate-950/85 border-b border-amber-400/30 flex items-center justify-between shrink-0 shadow-md">
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
                ♟️ Zeka Oyunu
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
        <div className="w-full flex items-center justify-between gap-2 px-2 sm:px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 shadow-lg">
          {/* PLAYER 1 (RED) BADGE */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all ${
            turn === 1 && winner === null
              ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 shadow-md scale-102'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400'
          }`}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-red-700 border border-white flex items-center justify-center text-xs shadow-xs shrink-0">
              😎
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-xs uppercase tracking-wide truncate">
                {p1Student ? p1Student.name : '1. Oyuncu (Kırmızı)'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Skor: {scores.p1}
              </span>
            </div>
          </div>

          {/* INSTRUCTION PILL (CENTER) */}
          <div className="flex-1 text-center px-1">
            {winner !== null ? (
              <div className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider animate-bounce">
                🎉 {winner === 1 ? (p1Student ? p1Student.name : '1. Oyuncu (Kırmızı)') : (p2Student ? p2Student.name : gameMode === 'pve' ? 'Bilgisayar' : '2. Oyuncu (Mavi)')} KAZANDI!
              </div>
            ) : isBotThinking ? (
              <div className="text-xs sm:text-sm font-black text-blue-300 uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
                <span>🤖 Bilgisayar düşünüyor...</span>
              </div>
            ) : turnPhase === 'move' ? (
              <div className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>1. Aşama: Taşını komşu yeşil karelerden birine taşı!</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <span className="text-base">🧱</span>
                <span>2. Aşama: Boş bir kareye Engel Taşı (Blok) koy!</span>
              </div>
            )}
          </div>

          {/* PLAYER 2 (BLUE / BOT) BADGE */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all ${
            turn === 2 && winner === null
              ? 'bg-blue-950/90 border-2 border-blue-500 text-blue-200 ring-2 ring-blue-500/40 shadow-md scale-102'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400'
          }`}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border border-white flex items-center justify-center text-xs shadow-xs shrink-0">
              😎
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <span className="font-black text-xs uppercase tracking-wide truncate">
                {gameMode === 'pve' ? 'Bilgisayar' : p2Student ? p2Student.name : '2. Oyuncu (Mavi)'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Skor: {scores.p2}
              </span>
            </div>
          </div>
        </div>

        {/* 7x7 ABLUKA BOARD (EXACT VISUAL DESIGN MATCHING USER'S SCREENSHOT) */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0 py-1">
          {/* Outer Rounded Container with thick tactile border */}
          <div className="relative aspect-square w-full max-w-[min(65vh,480px)] p-2 sm:p-3 rounded-3xl sm:rounded-4xl bg-slate-300/60 dark:bg-slate-900/80 border-[8px] sm:border-[12px] border-white/80 dark:border-slate-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-center">
            
            {/* 7x7 Grid */}
            <div className="grid grid-cols-7 grid-rows-7 gap-1 sm:gap-1.5 w-full h-full p-1 bg-slate-400/40 dark:bg-slate-950/60 rounded-2xl sm:rounded-3xl border-2 border-slate-400/30">
              {board.map((cellValue, idx) => {
                const isP1 = cellValue === 1;
                const isP2 = cellValue === 2;
                const isObstacle = cellValue === 3;
                const isValidMove = activeValidMoves.includes(idx);
                const canPlaceObstacle = turnPhase === 'block' && cellValue === 0 && !isBotThinking && winner === null;

                let cellBgClass = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs";
                let cursorClass = "cursor-default";

                if (isValidMove) {
                  // Mint green valid move (matching user's screenshot exactly!)
                  cellBgClass = "bg-emerald-200/90 dark:bg-emerald-900/80 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-300 hover:scale-102 shadow-sm";
                  cursorClass = "cursor-pointer active:scale-95";
                } else if (canPlaceObstacle) {
                  // Selectable for placing obstacle
                  cellBgClass = "bg-white dark:bg-slate-800 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 shadow-xs";
                  cursorClass = "cursor-pointer hover:scale-102 active:scale-95";
                } else if (isObstacle) {
                  // Solid Blockade Stone
                  cellBgClass = "bg-slate-900 dark:bg-slate-950 border-2 border-slate-700 shadow-inner";
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
                    {/* PLAYER 1: GLOSSY RED DISC WITH SUNGLASSES EMOJI */}
                    {isP1 && (
                      <div className="w-[82%] h-[82%] rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 border-2 sm:border-3 border-white shadow-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-105 filter drop-shadow-md">
                        <span className="text-base sm:text-xl md:text-2xl filter drop-shadow-xs select-none">
                          {p1Student?.avatar || '😎'}
                        </span>
                      </div>
                    )}

                    {/* PLAYER 2: GLOSSY BLUE DISC WITH SUNGLASSES EMOJI */}
                    {isP2 && (
                      <div className="w-[82%] h-[82%] rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 border-2 sm:border-3 border-white shadow-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-105 filter drop-shadow-md">
                        <span className="text-base sm:text-xl md:text-2xl filter drop-shadow-xs select-none">
                          {p2Student?.avatar || '😎'}
                        </span>
                      </div>
                    )}

                    {/* OBSTACLE: DARK STONE WITH BLOCK ICON */}
                    {isObstacle && (
                      <div className="w-full h-full rounded-md sm:rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600/80 shadow-inner flex items-center justify-center">
                        <span className="text-xs sm:text-sm md:text-base filter drop-shadow-xs select-none opacity-85">
                          🧱
                        </span>
                      </div>
                    )}

                    {/* SUBTLE INDICATOR ON HOVER FOR PLACING OBSTACLE */}
                    {canPlaceObstacle && (
                      <span className="opacity-0 hover:opacity-100 text-xs sm:text-sm filter drop-shadow-sm select-none transition-opacity">
                        ➕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM GAME INFO BANNER */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold px-2 py-0.5 shrink-0">
          <span>Toplam Engel Taşı: {placedObstaclesCount}</span>
          <span className="hidden sm:inline">Her turda: 1. Taşını taşı → 2. Engel koy!</span>
          <span>Hedef: Rakibin tüm komşu karelerini kapatmak</span>
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
