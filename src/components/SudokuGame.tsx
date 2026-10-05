import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Sparkles, 
  CheckCircle2, Eraser, Lightbulb, Clock, AlertCircle, 
  Award, Play, Undo2, Star, Eye, Users, User, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface SudokuGameProps {
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

export type SudokuSize = '4x4' | '6x6';
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

// ==========================================
// 4x4 SUDOKU GENERATOR (2x2 BLOCKS)
// ==========================================
const BASE_4X4: number[][] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

function generateValid4x4(): number[][] {
  let grid = BASE_4X4.map(row => [...row]);

  // 1. Random digit permutation
  const digits = [1, 2, 3, 4];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  const digitMap = new Map<number, number>();
  [1, 2, 3, 4].forEach((d, idx) => digitMap.set(d, digits[idx]));
  grid = grid.map(row => row.map(v => digitMap.get(v) || v));

  // 2. Randomly swap rows within band 1 (0, 1) and band 2 (2, 3)
  if (Math.random() > 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
  if (Math.random() > 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];

  // 3. Randomly swap columns within stack 1 (0, 1) and stack 2 (2, 3)
  if (Math.random() > 0.5) {
    for (let r = 0; r < 4; r++) [grid[r][0], grid[r][1]] = [grid[r][1], grid[r][0]];
  }
  if (Math.random() > 0.5) {
    for (let r = 0; r < 4; r++) [grid[r][2], grid[r][3]] = [grid[r][3], grid[r][2]];
  }

  // 4. Random band swap
  if (Math.random() > 0.5) {
    [grid[0], grid[2]] = [grid[2], grid[0]];
    [grid[1], grid[3]] = [grid[3], grid[1]];
  }

  // 5. Random stack swap
  if (Math.random() > 0.5) {
    for (let r = 0; r < 4; r++) {
      [grid[r][0], grid[r][2]] = [grid[r][2], grid[r][0]];
      [grid[r][1], grid[r][3]] = [grid[r][3], grid[r][1]];
    }
  }

  return grid;
}

// ==========================================
// 6x6 SUDOKU GENERATOR (2 rows x 3 cols BLOCKS)
// ==========================================
const BASE_6X6: number[][] = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 1, 5, 6, 4],
  [5, 6, 4, 2, 3, 1],
  [3, 1, 2, 6, 4, 5],
  [6, 4, 5, 3, 1, 2]
];

function generateValid6x6(): number[][] {
  let grid = BASE_6X6.map(row => [...row]);

  // 1. Random digit permutation
  const digits = [1, 2, 3, 4, 5, 6];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  const digitMap = new Map<number, number>();
  [1, 2, 3, 4, 5, 6].forEach((d, idx) => digitMap.set(d, digits[idx]));
  grid = grid.map(row => row.map(v => digitMap.get(v) || v));

  // 2. Randomly swap rows within band 1 (0, 1), band 2 (2, 3), band 3 (4, 5)
  if (Math.random() > 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
  if (Math.random() > 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];
  if (Math.random() > 0.5) [grid[4], grid[5]] = [grid[5], grid[4]];

  // 3. Randomly swap columns within stack 1 (0, 1, 2)
  const stack1Cols = [0, 1, 2];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stack1Cols[i], stack1Cols[j]] = [stack1Cols[j], stack1Cols[i]];
  }
  const stack2Cols = [3, 4, 5];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stack2Cols[i], stack2Cols[j]] = [stack2Cols[j], stack2Cols[i]];
  }
  const newCols = [...stack1Cols, ...stack2Cols];
  grid = grid.map(row => newCols.map(c => row[c]));

  // 4. Randomly swap stacks
  if (Math.random() > 0.5) {
    grid = grid.map(row => [row[3], row[4], row[5], row[0], row[1], row[2]]);
  }

  // 5. Randomly swap bands
  const bands = [0, 1, 2];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bands[i], bands[j]] = [bands[j], bands[i]];
  }
  const newGrid: number[][] = [];
  bands.forEach(b => {
    newGrid.push([...grid[b * 2]]);
    newGrid.push([...grid[b * 2 + 1]]);
  });
  grid = newGrid;

  return grid;
}

// Function to generate puzzle by removing numbers
function createSudokuPuzzle(size: SudokuSize, difficulty: SudokuDifficulty = 'easy'): { initial: number[][]; solution: number[][] } {
  const is4x4 = size === '4x4';
  const solution = is4x4 ? generateValid4x4() : generateValid6x6();
  const initial = solution.map(row => [...row]);

  const totalCells = is4x4 ? 16 : 36;
  
  // Clues count:
  // 4x4: Easy: 9 clues, Medium: 7 clues, Hard: 5 clues
  // 6x6: Easy: 20 clues, Medium: 16 clues, Hard: 12 clues
  let cluesToKeep = 0;
  if (is4x4) {
    cluesToKeep = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 7 : 5;
  } else {
    cluesToKeep = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 16 : 12;
  }

  const cellsToRemove = totalCells - cluesToKeep;
  const positions: [number, number][] = [];
  const dim = is4x4 ? 4 : 6;
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < cellsToRemove; i++) {
    const [r, c] = positions[i];
    initial[r][c] = 0;
  }

  return { initial, solution };
}

export const SudokuGame: React.FC<SudokuGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students = [],
  selectedStudentIds = [],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  // Mode: 1 = Tek Kişilik, 2 = 2 Kişilik Kapışma
  const [playerMode, setPlayerMode] = useState<1 | 2>(1);
  const [size, setSize] = useState<SudokuSize>('4x4');
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');

  // Shared puzzle boards
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>([]);

  // Player 1 state
  const [board1, setBoard1] = useState<number[][]>([]);
  const [selectedCell1, setSelectedCell1] = useState<[number, number] | null>(null);
  const [score1, setScore1] = useState<number>(0);
  const [isCompleted1, setIsCompleted1] = useState<boolean>(false);

  // Player 2 state (for 2-Player mode)
  const [board2, setBoard2] = useState<number[][]>([]);
  const [selectedCell2, setSelectedCell2] = useState<[number, number] | null>(null);
  const [score2, setScore2] = useState<number>(0);
  const [isCompleted2, setIsCompleted2] = useState<boolean>(false);

  // 100-Second Continuous Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(100);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | 'draw' | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const dim = size === '4x4' ? 4 : 6;
  const boxRows = 2;
  const boxCols = size === '4x4' ? 2 : 3;

  const triggerSound = useCallback((src: string) => {
    if (playMp3) playMp3(src);
  }, [playMp3]);

  // Assigned students
  const p1Student = selectedStudentIds[0] ? students.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students.find(s => s.id === selectedStudentIds[1]) : null;

  // Initialize new game / puzzle
  const startNewGame = useCallback((targetSize = size, targetDiff = difficulty) => {
    const { initial, solution } = createSudokuPuzzle(targetSize, targetDiff);
    setInitialBoard(initial.map(r => [...r]));
    setSolutionBoard(solution.map(r => [...r]));

    setBoard1(initial.map(r => [...r]));
    setBoard2(initial.map(r => [...r]));

    setSelectedCell1(null);
    setSelectedCell2(null);

    setScore1(0);
    setScore2(0);

    setIsCompleted1(false);
    setIsCompleted2(false);

    setTimeLeft(100);
    setGameOver(false);
    setWinner(null);

    triggerSound('/op.mp3');
  }, [size, difficulty, triggerSound]);

  // Initial load & when size changes
  useEffect(() => {
    startNewGame(size, difficulty);
  }, [size, difficulty]);

  // 100-Second Countdown Timer effect
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      triggerSound('/hata.mp3');
      setGameOver(true);

      // Determine winner based on score / correct cells
      if (playerMode === 1) {
        setWinner(0);
        onGameCompleted?.(0, 1);
      } else {
        if (score1 > score2) {
          setWinner(0);
          onGameCompleted?.(0, 2);
        } else if (score2 > score1) {
          setWinner(1);
          onGameCompleted?.(1, 2);
        } else {
          setWinner('draw');
          onGameCompleted?.(null, 2);
        }
      }
      return;
    }

    if (timeLeft <= 3 && timeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft, playerMode, score1, score2, playMp3, triggerSound, onGameCompleted]);

  // Check if player board matches solution
  const checkIsBoardFullAndValid = (b: number[][]): boolean => {
    if (!solutionBoard.length) return false;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (b[r]?.[c] !== solutionBoard[r]?.[c]) {
          return false;
        }
      }
    }
    return true;
  };

  // Count correct filled cells
  const countFilledCorrect = (b: number[][]): number => {
    if (!solutionBoard.length) return 0;
    let count = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (initialBoard[r]?.[c] === 0 && b[r]?.[c] === solutionBoard[r]?.[c]) {
          count++;
        }
      }
    }
    return count;
  };

  const totalEmptyCells = useMemo(() => {
    let count = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (initialBoard[r]?.[c] === 0) count++;
      }
    }
    return count;
  }, [initialBoard, dim]);

  // Handle digit input for player
  const handleDigitInput = (playerIndex: 0 | 1, digit: number) => {
    if (gameOver) return;

    const selected = playerIndex === 0 ? selectedCell1 : selectedCell2;
    if (!selected) {
      triggerSound('/op.mp3');
      return;
    }

    const [r, c] = selected;

    // Locked initial clue
    if (initialBoard[r]?.[c] > 0) {
      triggerSound('/hata.mp3');
      return;
    }

    const isP1 = playerIndex === 0;
    const currentBoard = isP1 ? board1 : board2;
    const expected = solutionBoard[r]?.[c];
    const isCorrect = digit === expected;

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = digit;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      onQuestionAnswered?.(true, playerIndex);

      if (isP1) {
        setBoard1(newBoard);
        setScore1(prev => prev + 10);
      } else {
        setBoard2(newBoard);
        setScore2(prev => prev + 10);
      }

      // Check for completion
      if (checkIsBoardFullAndValid(newBoard)) {
        triggerSound('/para.mp3');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

        if (isP1) {
          setIsCompleted1(true);
          setScore1(prev => prev + 50); // bonus for finishing first
          setWinner(0);
          setGameOver(true);
          onGameCompleted?.(0, playerMode);
        } else {
          setIsCompleted2(true);
          setScore2(prev => prev + 50);
          setWinner(1);
          setGameOver(true);
          onGameCompleted?.(1, playerMode);
        }
      }
    } else {
      triggerSound('/hata.mp3');
      onQuestionAnswered?.(false, playerIndex);

      // Still place digit or highlight error
      if (isP1) {
        setBoard1(newBoard);
      } else {
        setBoard2(newBoard);
      }
    }
  };

  // Handle erase cell
  const handleErase = (playerIndex: 0 | 1) => {
    if (gameOver) return;
    const selected = playerIndex === 0 ? selectedCell1 : selectedCell2;
    if (!selected) return;

    const [r, c] = selected;
    if (initialBoard[r]?.[c] > 0) return;

    triggerSound('/op.mp3');
    if (playerIndex === 0) {
      setBoard1(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = 0;
        return next;
      });
    } else {
      setBoard2(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = 0;
        return next;
      });
    }
  };

  // Render a player's Sudoku grid
  const renderSudokuGrid = (
    playerIndex: 0 | 1,
    board: number[][],
    selectedCell: [number, number] | null,
    onSelectCell: (r: number, c: number) => void
  ) => {
    const isP1 = playerIndex === 0;
    const themeBorder = isP1 ? 'border-blue-500' : 'border-rose-500';
    const themeSelected = isP1 ? 'bg-blue-600/50 ring-2 ring-blue-400' : 'bg-rose-600/50 ring-2 ring-rose-400';

    return (
      <div className={`relative p-1 sm:p-2 rounded-2xl bg-black/50 border-2 ${themeBorder} shadow-2xl backdrop-blur-md flex flex-col items-center justify-center shrink-0`}>
        <div 
          className="grid gap-0.5 sm:gap-1 bg-slate-800 p-1 sm:p-1.5 rounded-xl border border-slate-700 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: dim }).map((_, r) =>
            Array.from({ length: dim }).map((_, c) => {
              const val = board[r]?.[c] || 0;
              const isLocked = initialBoard[r]?.[c] > 0;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isError = val > 0 && !isLocked && val !== solutionBoard[r]?.[c];
              const isCorrectFilled = val > 0 && !isLocked && val === solutionBoard[r]?.[c];

              // Box border classes
              const isRightBoxBorder = (c + 1) % boxCols === 0 && c + 1 < dim;
              const isBottomBoxBorder = (r + 1) % boxRows === 0 && r + 1 < dim;

              const cellSizes = dim === 4
                ? 'w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-xl sm:text-2xl md:text-3xl'
                : 'w-7 h-7 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 text-base sm:text-lg md:text-xl';

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => onSelectCell(r, c)}
                  className={`relative flex items-center justify-center font-black rounded-lg transition-all cursor-pointer font-mono select-none ${cellSizes} ${
                    isSelected
                      ? themeSelected
                      : isLocked
                      ? 'bg-slate-900/90 text-cyan-200 border border-slate-700/60 shadow-xs'
                      : isError
                      ? 'bg-rose-950/80 text-rose-300 border-2 border-rose-500 animate-pulse'
                      : isCorrectFilled
                      ? isP1
                        ? 'bg-blue-950/70 text-blue-200 border border-blue-400/50'
                        : 'bg-rose-950/70 text-rose-200 border border-rose-400/50'
                      : 'bg-slate-900/50 text-amber-300 border border-slate-700/40 hover:bg-slate-800/80'
                  } ${isRightBoxBorder ? 'mr-1 sm:mr-1.5 border-r-2 border-r-amber-400/70' : ''} ${
                    isBottomBoxBorder ? 'mb-1 sm:mb-1.5 border-b-2 border-b-amber-400/70' : ''
                  }`}
                >
                  {val > 0 ? val : ''}
                  {isLocked && (
                    <span className="absolute top-0.5 right-0.5 text-[8px] sm:text-[9px] opacity-40">
                      🔒
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Render keypad for a player
  const renderKeypad = (playerIndex: 0 | 1) => {
    const isP1 = playerIndex === 0;
    const digits = Array.from({ length: dim }, (_, i) => i + 1);

    const btnGrad = isP1
      ? 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400/60'
      : 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 border-rose-400/60';

    return (
      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 flex-wrap max-w-sm">
        {digits.map(num => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigitInput(playerIndex, num)}
            className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-b ${btnGrad} text-white font-black text-base sm:text-lg md:text-xl shadow-lg border active:scale-95 transition-transform flex items-center justify-center cursor-pointer`}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleErase(playerIndex)}
          className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs sm:text-sm shadow-lg border border-slate-600 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          title="Sil"
        >
          <Eraser size={18} />
        </button>
      </div>
    );
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      {/* 1. BACKGROUND IMAGE (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
      </div>

      {/* 2. TOP HEADER BAR */}
      <header className="relative z-20 px-2 sm:px-4 py-1.5 bg-slate-950/90 backdrop-blur-md border-b border-amber-400/40 flex items-center justify-between shrink-0 shadow-lg gap-2">
        {/* LEFT: BACK, HOME & TITLE */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center border border-blue-400 transition cursor-pointer shadow-sm shrink-0"
              title="Ana Sayfaya Dön"
            >
              <img src="/ana.webp" alt="Ana Sayfa" className="w-5 h-5 object-contain" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center shadow border border-amber-300 shrink-0">
              <img src="/MENUIKON/grid_icon_19.webp" alt="Sudoku" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase truncate">
                Sudoku Zeka Oyunu
              </h2>
              <span className="text-[10px] text-slate-300 font-semibold truncate hidden xs:inline-block">
                {size} • {playerMode === 1 ? '1 Oyuncu Tek' : '2 Oyuncu Kapışma'}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: MODE & SIZE CONTROLS & 100S TIMER */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mode Switcher: 1P vs 2P */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => {
                if (playerMode !== 1) {
                  setPlayerMode(1);
                  startNewGame(size, difficulty);
                }
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                playerMode === 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>1 Oyuncu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (playerMode !== 2) {
                  setPlayerMode(2);
                  startNewGame(size, difficulty);
                }
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                playerMode === 2
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>2 Oyuncu</span>
            </button>
          </div>

          {/* Size Switcher: 4x4 vs 6x6 */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setSize('4x4')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                size === '4x4'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4x4
            </button>
            <button
              type="button"
              onClick={() => setSize('6x6')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                size === '6x6'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6x6
            </button>
          </div>

          {/* 100-Second Countdown Timer Capsule */}
          <div className={`px-2.5 sm:px-3 py-1 rounded-xl border font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shrink-0 transition-all ${
            timeLeft <= 10
              ? 'bg-rose-950/95 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse'
              : 'bg-slate-900/90 border-amber-400/60 text-amber-300'
          }`}>
            <Clock size={14} className={timeLeft <= 10 ? 'text-rose-400 animate-spin' : 'text-amber-400'} />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* RIGHT: REPLAY & HELP */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => startNewGame(size, difficulty)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 border border-amber-400/40 flex items-center justify-center transition cursor-pointer shadow-sm"
            title="Yeniden Başlat (100s)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setShowRulesModal(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-600 flex items-center justify-center transition cursor-pointer shadow-sm"
            title="Kurallar"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* 3. MAIN ARENA */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto no-scrollbar">
        {playerMode === 1 ? (
          /* 1 OYUNCU (TEK KİŞİLİK) ARENA */
          <div className="flex flex-col items-center justify-center gap-2 max-w-lg w-full my-auto">
            {/* Top Info pill */}
            <div className="flex items-center justify-between w-full max-w-md px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 shadow-md text-xs font-bold">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Kalan Hücre: <b>{totalEmptyCells - countFilledCorrect(board1)}</b></span>
              </span>
              <span className="text-blue-300 font-mono">
                Skor: <b className="text-white text-sm">{score1}</b> Puan
              </span>
            </div>

            {/* Sudoku Board */}
            {renderSudokuGrid(0, board1, selectedCell1, (r, c) => setSelectedCell1([r, c]))}

            {/* Numeric Keypad */}
            {renderKeypad(0)}
          </div>
        ) : (
          /* 2 OYUNCU KAPIŞMA YARIŞI ARENA */
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-5xl my-auto">
            {/* PLAYER 1 (SOL: MAVİ - 1. GRUP) */}
            <div className="flex-1 flex flex-col items-center p-2.5 sm:p-3 rounded-3xl bg-[#091224]/85 border-2 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.25)] w-full max-w-md">
              <div className="flex items-center justify-between w-full mb-2 pb-1.5 border-b border-blue-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow border border-white/20">
                    1
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-blue-200 uppercase tracking-wide">
                      {p1Student ? p1Student.name : '1. GRUP'}
                    </h3>
                    <p className="text-[10px] text-blue-300/70 font-semibold">Mavi Takım</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-950 border border-blue-400 text-blue-300 font-mono font-black text-xs">
                    {score1} Puan
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {countFilledCorrect(board1)}/{totalEmptyCells}
                  </span>
                </div>
              </div>

              {renderSudokuGrid(0, board1, selectedCell1, (r, c) => setSelectedCell1([r, c]))}
              {renderKeypad(0)}
            </div>

            {/* VS CENTER BADGE */}
            <div className="shrink-0 flex lg:flex-col items-center justify-center gap-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">
                VS
              </div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider hidden lg:block">
                Yarış
              </span>
            </div>

            {/* PLAYER 2 (SAĞ: KIRMIZI - 2. GRUP) */}
            <div className="flex-1 flex flex-col items-center p-2.5 sm:p-3 rounded-3xl bg-[#1c0b1a]/85 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.25)] w-full max-w-md">
              <div className="flex items-center justify-between w-full mb-2 pb-1.5 border-b border-rose-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xs shadow border border-white/20">
                    2
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-rose-200 uppercase tracking-wide">
                      {p2Student ? p2Student.name : '2. GRUP'}
                    </h3>
                    <p className="text-[10px] text-rose-300/70 font-semibold">Kırmızı Takım</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-950 border border-rose-400 text-rose-300 font-mono font-black text-xs">
                    {score2} Puan
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {countFilledCorrect(board2)}/{totalEmptyCells}
                  </span>
                </div>
              </div>

              {renderSudokuGrid(1, board2, selectedCell2, (r, c) => setSelectedCell2([r, c]))}
              {renderKeypad(1)}
            </div>
          </div>
        )}
      </main>

      {/* 4. GAME OVER & VICTORY MODAL */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#131f38] to-[#0c1424] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.4)] p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-white mb-3 animate-bounce">
              🏆
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase">
              {playerMode === 1
                ? (isCompleted1 ? 'Tebrikler! Sudoku Tamamlandı!' : 'Süre Doldu!')
                : (winner === 'draw' ? 'Berabere!' : `${winner === 0 ? '1. GRUP' : '2. GRUP'} Kazandı!`)}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1 mb-4">
              {playerMode === 1
                ? `Toplam Skor: ${score1} Puan • ${100 - timeLeft} saniyede çözüldü`
                : `1. Grup: ${score1} Puan • 2. Grup: ${score2} Puan`}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => startNewGame(size, difficulty)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} />
                <span>Tekrar Oyna</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm uppercase tracking-wider border border-slate-600 transition active:scale-95 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0f172a] border-2 border-amber-400/80 p-5 sm:p-6 shadow-2xl text-left">
            <h3 className="text-lg font-black text-amber-300 mb-2 flex items-center gap-2">
              <HelpCircle size={20} className="text-amber-400" />
              <span>Sudoku Nasıl Oynanır?</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-300 space-y-2 mb-5 list-disc pl-5">
              <li><b>4x4 Modu:</b> Her satır, sütun ve 2x2'lik kutuda <b>1, 2, 3 ve 4</b> sayıları tam birer kez bulunmalıdır.</li>
              <li><b>6x6 Modu:</b> Her satır, sütun ve 2x3'lük kutuda <b>1, 2, 3, 4, 5 ve 6</b> sayıları tam birer kez bulunmalıdır.</li>
              <li><b>2 Kişilik Kapışma:</b> İki oyuncu aynı bulmaca üzerinde eş zamanlı yarışır! Doğru hücreler +10 puan, bulmacayı ilk bitiren +50 puan bonus alır.</li>
              <li><b>100 Saniye:</b> Süre dolmadan en çok doğru hücreyi yerleştiren veya bulmacayı tamamlayan şampiyon olur!</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow cursor-pointer transition active:scale-95"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
