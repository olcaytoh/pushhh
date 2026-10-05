import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Sparkles, 
  CheckCircle2, Eraser, Lightbulb, Clock, AlertCircle, 
  Award, Play, Undo2, Star, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SudokuGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
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

  // 4. Random band swap (rows 0,1 with 2,3)
  if (Math.random() > 0.5) {
    [grid[0], grid[2]] = [grid[2], grid[0]];
    [grid[1], grid[3]] = [grid[3], grid[1]];
  }

  // 5. Random stack swap (cols 0,1 with 2,3)
  if (Math.random() > 0.5) {
    for (let r = 0; r < 4; r++) {
      [grid[r][0], grid[r][2]] = [grid[r][2], grid[r][0]];
      [grid[r][1], grid[r][3]] = [grid[r][3], grid[r][1]];
    }
  }

  // 6. Random transpose
  if (Math.random() > 0.5) {
    const next: number[][] = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) next[c][r] = grid[r][c];
    }
    grid = next;
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

  // 4. Randomly swap stacks (cols 0..2 with 3..5)
  if (Math.random() > 0.5) {
    grid = grid.map(row => [row[3], row[4], row[5], row[0], row[1], row[2]]);
  }

  // 5. Randomly swap bands (pairs of rows: [0,1], [2,3], [4,5])
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
function createSudokuPuzzle(size: SudokuSize, difficulty: SudokuDifficulty): { initial: number[][]; solution: number[][] } {
  const is4x4 = size === '4x4';
  const solution = is4x4 ? generateValid4x4() : generateValid6x6();
  const initial = solution.map(row => [...row]);

  const totalCells = is4x4 ? 16 : 36;
  
  // Clues count:
  // 4x4: Easy: 8-9 clues, Medium: 6-7 clues, Hard: 5 clues
  // 6x6: Easy: 18-20 clues, Medium: 14-16 clues, Hard: 11-13 clues
  let cluesToKeep = 0;
  if (is4x4) {
    cluesToKeep = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 7 : 5;
  } else {
    cluesToKeep = difficulty === 'easy' ? 19 : difficulty === 'medium' ? 15 : 12;
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
  playMp3
}) => {
  const [size, setSize] = useState<SudokuSize>('4x4');
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');

  // Game state
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [currentBoard, setCurrentBoard] = useState<number[][]>([]);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [conflictedCells, setConflictedCells] = useState<Set<string>>(new Set());

  // History stack for undo
  const [history, setHistory] = useState<{ board: number[][]; notes: Record<string, number[]> }[]>([]);

  const dim = size === '4x4' ? 4 : 6;
  const boxRows = 2;
  const boxCols = size === '4x4' ? 2 : 3;

  const triggerSound = useCallback((src: string) => {
    if (playMp3) playMp3(src);
  }, [playMp3]);

  // Start / restart puzzle
  const startNewGame = useCallback((targetSize = size, targetDiff = difficulty) => {
    const { initial, solution } = createSudokuPuzzle(targetSize, targetDiff);
    setInitialBoard(initial.map(r => [...r]));
    setCurrentBoard(initial.map(r => [...r]));
    setSolutionBoard(solution.map(r => [...r]));
    setSelectedCell(null);
    setMistakes(0);
    setIsCompleted(false);
    setSecondsElapsed(0);
    setNotes({});
    setHistory([]);
    setConflictedCells(new Set());
    triggerSound('/op.webp');
  }, [size, difficulty, triggerSound]);

  // Initial load
  useEffect(() => {
    startNewGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Check board completion
  const checkCompletion = useCallback((board: number[][], solution: number[][]) => {
    const d = board.length;
    for (let r = 0; r < d; r++) {
      for (let c = 0; c < d; c++) {
        if (board[r][c] !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, []);

  // Calculate conflicts on the board
  const calculateConflicts = useCallback((board: number[][]) => {
    const conflicts = new Set<string>();
    const d = board.length;
    const bRows = 2;
    const bCols = d === 4 ? 2 : 3;

    // Check rows
    for (let r = 0; r < d; r++) {
      const seen = new Map<number, number[]>();
      for (let c = 0; c < d; c++) {
        const val = board[r][c];
        if (val > 0) {
          const list = seen.get(val) || [];
          list.push(c);
          seen.set(val, list);
        }
      }
      seen.forEach((cols) => {
        if (cols.length > 1) {
          cols.forEach(c => conflicts.add(`${r}-${c}`));
        }
      });
    }

    // Check columns
    for (let c = 0; c < d; c++) {
      const seen = new Map<number, number[]>();
      for (let r = 0; r < d; r++) {
        const val = board[r][c];
        if (val > 0) {
          const list = seen.get(val) || [];
          list.push(r);
          seen.set(val, list);
        }
      }
      seen.forEach((rows) => {
        if (rows.length > 1) {
          rows.forEach(r => conflicts.add(`${r}-${c}`));
        }
      });
    }

    // Check boxes
    const numBoxesRow = d / bRows;
    const numBoxesCol = d / bCols;
    for (let br = 0; br < numBoxesRow; br++) {
      for (let bc = 0; bc < numBoxesCol; bc++) {
        const seen = new Map<number, [number, number][]>();
        for (let r = 0; r < bRows; r++) {
          for (let c = 0; c < bCols; c++) {
            const actualR = br * bRows + r;
            const actualC = bc * bCols + c;
            const val = board[actualR][actualC];
            if (val > 0) {
              const list = seen.get(val) || [];
              list.push([actualR, actualC]);
              seen.set(val, list);
            }
          }
        }
        seen.forEach((cells) => {
          if (cells.length > 1) {
            cells.forEach(([r, c]) => conflicts.add(`${r}-${c}`));
          }
        });
      }
    }

    return conflicts;
  }, []);

  // Enter a digit into currently selected cell
  const handleDigitInput = useCallback((digit: number) => {
    if (!selectedCell || isCompleted) return;
    const [r, c] = selectedCell;

    // Fixed clue cannot be modified
    if (initialBoard[r] && initialBoard[r][c] > 0) {
      triggerSound('/hata.mp3');
      return;
    }

    // Notes mode toggle
    if (notesMode) {
      const key = `${r}-${c}`;
      const currentNotes = notes[key] || [];
      const newNotes = currentNotes.includes(digit)
        ? currentNotes.filter(n => n !== digit)
        : [...currentNotes, digit].sort((a, b) => a - b);

      setNotes(prev => ({ ...prev, [key]: newNotes }));
      triggerSound('/tek.mp3');
      return;
    }

    // Push history
    setHistory(prev => [...prev.slice(-20), { 
      board: currentBoard.map(row => [...row]), 
      notes: { ...notes } 
    }]);

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = digit;

    // Check correctness against solution
    const isCorrect = digit === solutionBoard[r][c];
    if (!isCorrect) {
      setMistakes(m => m + 1);
      triggerSound('/hata.mp3');
    } else {
      triggerSound('/coin.mp3');
    }

    // Remove any notes in this cell
    const cellKey = `${r}-${c}`;
    if (notes[cellKey]) {
      const updatedNotes = { ...notes };
      delete updatedNotes[cellKey];
      setNotes(updatedNotes);
    }

    setCurrentBoard(newBoard);
    const conflicts = calculateConflicts(newBoard);
    setConflictedCells(conflicts);

    // Check completion
    if (checkCompletion(newBoard, solutionBoard)) {
      setIsCompleted(true);
      triggerSound('/dtt.mp3');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [selectedCell, isCompleted, initialBoard, notesMode, notes, currentBoard, solutionBoard, triggerSound, calculateConflicts, checkCompletion]);

  // Erase active cell
  const handleErase = useCallback(() => {
    if (!selectedCell || isCompleted) return;
    const [r, c] = selectedCell;

    if (initialBoard[r] && initialBoard[r][c] > 0) {
      triggerSound('/hata.mp3');
      return;
    }

    if (currentBoard[r][c] === 0 && !notes[`${r}-${c}`]) return;

    setHistory(prev => [...prev.slice(-20), { 
      board: currentBoard.map(row => [...row]), 
      notes: { ...notes } 
    }]);

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = 0;
    setCurrentBoard(newBoard);

    const cellKey = `${r}-${c}`;
    if (notes[cellKey]) {
      const updated = { ...notes };
      delete updated[cellKey];
      setNotes(updated);
    }

    setConflictedCells(calculateConflicts(newBoard));
    triggerSound('/op.webp');
  }, [selectedCell, isCompleted, initialBoard, currentBoard, notes, triggerSound, calculateConflicts]);

  // Hint
  const handleHint = useCallback(() => {
    if (!selectedCell || isCompleted) return;
    const [r, c] = selectedCell;

    if (initialBoard[r] && initialBoard[r][c] > 0) return;
    if (currentBoard[r][c] === solutionBoard[r][c]) return;

    const correctDigit = solutionBoard[r][c];
    handleDigitInput(correctDigit);
  }, [selectedCell, isCompleted, initialBoard, currentBoard, solutionBoard, handleDigitInput]);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isCompleted) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentBoard(last.board);
    setNotes(last.notes);
    setConflictedCells(calculateConflicts(last.board));
    triggerSound('/op.webp');
  }, [history, isCompleted, calculateConflicts, triggerSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      // Digits
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= dim) {
        handleDigitInput(num);
        return;
      }

      // Backspace / Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
        return;
      }

      // Arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell(prev => {
          if (!prev) return [0, 0];
          let [r, c] = prev;
          if (e.key === 'ArrowUp') r = (r - 1 + dim) % dim;
          if (e.key === 'ArrowDown') r = (r + 1) % dim;
          if (e.key === 'ArrowLeft') c = (c - 1 + dim) % dim;
          if (e.key === 'ArrowRight') c = (c + 1) % dim;
          return [r, c];
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, dim, handleDigitInput, handleErase]);

  // Format timer
  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsElapsed]);

  // Count remaining numbers to place
  const numberCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let d = 1; d <= dim; d++) counts[d] = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const val = currentBoard[r]?.[c] || 0;
        if (val > 0) counts[val] = (counts[val] || 0) + 1;
      }
    }
    return counts;
  }, [currentBoard, dim]);

  const selectedValue = selectedCell && currentBoard[selectedCell[0]] ? currentBoard[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden text-white"
    >
      {/* 1. SAME BACKGROUND IMAGE AS OTHER ACTIVITIES (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* 2. TOP HEADER BAR */}
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
                Sudoku
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40">
                {size} {difficulty === 'easy' ? 'Kolay' : difficulty === 'medium' ? 'Orta' : 'Zor'}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold hidden xs:inline-block">
              Satır, sütun ve kutularda her rakam sadece bir kez bulunmalı!
            </span>
          </div>
        </div>

        {/* CENTER: 4x4 / 6x6 SIZE TABS & DIFFICULTY */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Size Select */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 shadow-inner">
            <button
              onClick={() => {
                if (size !== '4x4') {
                  setSize('4x4');
                  startNewGame('4x4', difficulty);
                }
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                size === '4x4'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4x4 Minik
            </button>
            <button
              onClick={() => {
                if (size !== '6x6') {
                  setSize('6x6');
                  startNewGame('6x6', difficulty);
                }
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                size === '6x6'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6x6 Klasik
            </button>
          </div>

          {/* Difficulty Dropdown / Tabs */}
          <div className="hidden sm:flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  startNewGame(size, d);
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: STATS & CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 font-mono text-xs font-black text-amber-300 shadow-sm">
            <Clock size={13} className="text-amber-400" />
            <span>{formattedTime}</span>
          </div>

          {/* Mistakes badge */}
          <div 
            title="Hatalı Denemeler"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-bold text-rose-300"
          >
            <AlertCircle size={13} className="text-rose-400" />
            <span>{mistakes}</span>
          </div>

          {/* Restart */}
          <button
            onClick={() => startNewGame(size, difficulty)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-sm"
            title="Yeni Oyun Başlat"
          >
            <RotateCcw size={16} />
          </button>

          {/* Rules Modal */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 flex items-center justify-center border border-amber-400/40 transition-all cursor-pointer shadow-sm"
            title="Nasıl Oynanır?"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* 3. MAIN GAME ARENA */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 p-2 sm:p-4 overflow-y-auto z-10">
        
        {/* SUDOKU BOARD CONTAINER */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div 
            className={`relative p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#0b1328]/95 border-3 border-amber-400/80 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center`}
          >
            {/* GRID */}
            <div 
              className={`grid ${size === '4x4' ? 'grid-cols-4' : 'grid-cols-6'} gap-1 sm:gap-1.5 bg-slate-950 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 border-slate-700/80`}
            >
              {currentBoard.map((row, rIdx) => 
                row.map((cellVal, cIdx) => {
                  const isSelected = selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx;
                  const isInitial = initialBoard[rIdx] && initialBoard[rIdx][cIdx] > 0;
                  const isConflict = conflictedCells.has(`${rIdx}-${cIdx}`);
                  
                  // Same row, col, or block highlighting
                  const isSameRow = selectedCell && selectedCell[0] === rIdx;
                  const isSameCol = selectedCell && selectedCell[1] === cIdx;
                  const isSameBlock = selectedCell && 
                    Math.floor(selectedCell[0] / boxRows) === Math.floor(rIdx / boxRows) &&
                    Math.floor(selectedCell[1] / boxCols) === Math.floor(cIdx / boxCols);
                  const isSameValue = selectedValue > 0 && cellVal === selectedValue;

                  // Block border separation
                  const isBottomBoxBorder = (rIdx + 1) % boxRows === 0 && rIdx + 1 < dim;
                  const isRightBoxBorder = (cIdx + 1) % boxCols === 0 && cIdx + 1 < dim;

                  let cellBg = 'bg-[#121c2e] hover:bg-[#1a2840]';
                  if (isSelected) {
                    cellBg = 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-102 z-20 font-black';
                  } else if (isConflict) {
                    cellBg = 'bg-rose-900/80 text-rose-200 border-rose-500 animate-pulse font-black';
                  } else if (isSameValue) {
                    cellBg = 'bg-blue-600/40 text-blue-200 border-blue-400 font-black';
                  } else if (isSameRow || isSameCol || isSameBlock) {
                    cellBg = 'bg-[#18263f] text-blue-100';
                  }

                  const cellNotes = notes[`${rIdx}-${cIdx}`] || [];

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => {
                        setSelectedCell([rIdx, cIdx]);
                        triggerSound('/tek.mp3');
                      }}
                      className={`
                        fast-quiz-btn relative flex items-center justify-center transition-all cursor-pointer rounded-lg sm:rounded-xl border
                        ${size === '4x4' 
                          ? 'w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 text-2xl sm:text-3xl md:text-4xl' 
                          : 'w-10 h-10 sm:w-13 sm:h-13 md:w-15 md:h-15 text-lg sm:text-2xl md:text-3xl'
                        }
                        ${cellBg}
                        ${isInitial ? 'text-amber-300 font-black' : isSelected ? 'text-slate-950 font-black' : 'text-blue-50 font-bold'}
                        ${isRightBoxBorder ? 'mr-1 sm:mr-1.5 border-r-2 border-r-amber-400/60' : 'border-slate-700/60'}
                        ${isBottomBoxBorder ? 'mb-1 sm:mb-1.5 border-b-2 border-b-amber-400/60' : 'border-slate-700/60'}
                      `}
                    >
                      {cellVal > 0 ? (
                        <span>{cellVal}</span>
                      ) : cellNotes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 text-[8px] sm:text-[10px] text-amber-300/80 font-mono leading-none">
                          {cellNotes.map(n => <span key={n}>{n}</span>)}
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* NUMBER PAD & ACTION CONTROLS */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 w-full max-w-xs shrink-0">
          
          {/* NUMBER PAD GRID */}
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
            {Array.from({ length: dim }, (_, i) => i + 1).map(num => {
              const count = numberCounts[num] || 0;
              const isMaxed = count >= dim;

              return (
                <button
                  key={num}
                  disabled={isMaxed || isCompleted}
                  onClick={() => handleDigitInput(num)}
                  className={`fast-quiz-btn relative flex flex-col items-center justify-center p-2 sm:p-2.5 h-13 sm:h-15 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-95 shadow-md ${
                    isMaxed 
                      ? 'opacity-30 border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'border-blue-500/40 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:border-amber-400 hover:from-[#1e304f] text-blue-100'
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-sm leading-none">
                    {num}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">
                    {dim - count} kaldı
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTION BUTTONS (ERASE, HINT, UNDO, NOTES) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
            {/* ERASE */}
            <button
              onClick={handleErase}
              disabled={isCompleted}
              className="fast-quiz-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-rose-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm text-center"
              title="Seçili Hücreyi Sil"
            >
              <Eraser size={18} />
              <span className="text-[10px] font-bold mt-1">Sil</span>
            </button>

            {/* HINT */}
            <button
              onClick={handleHint}
              disabled={isCompleted}
              className="fast-quiz-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer active:scale-95 shadow-sm text-center"
              title="İpucu Al"
            >
              <Lightbulb size={18} />
              <span className="text-[10px] font-bold mt-1">İpucu</span>
            </button>

            {/* UNDO */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isCompleted}
              className="fast-quiz-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-blue-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-sm text-center"
              title="Geri Al"
            >
              <Undo2 size={18} />
              <span className="text-[10px] font-bold mt-1">Geri</span>
            </button>

            {/* NOTES MODE */}
            <button
              onClick={() => {
                setNotesMode(prev => !prev);
                triggerSound('/tek.mp3');
              }}
              disabled={isCompleted}
              className={`fast-quiz-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-sm text-center ${
                notesMode 
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Not / Karalama Modu"
            >
              <span className="text-xs font-black">✏️</span>
              <span className="text-[10px] font-bold mt-1">{notesMode ? 'Açık' : 'Not'}</span>
            </button>
          </div>

          {/* QUICK REPLAY & NEW PUZZLE BUTTON */}
          <button
            onClick={() => startNewGame(size, difficulty)}
            className="w-full py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 border border-white/40 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Yeni Sudoku Başlat</span>
          </button>
        </div>
      </div>

      {/* 4. RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>🧩</span>
                <span>Sudoku Nasıl Oynanır?</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed overflow-y-auto max-h-[60vh] pr-1">
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <span className="font-black text-amber-300 block mb-1">🎯 4x4 Minik Sudoku:</span>
                Tabloda 4 satır, 4 sütun ve dört adet 2x2'lik kutu bulunur. Her satır, sütun ve 2x2 kutuda 1, 2, 3 ve 4 rakamları sadece birer kez yer almalıdır!
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="font-black text-amber-300 block mb-1">🧠 6x6 Klasik Sudoku:</span>
                Tabloda 6 satır, 6 sütun ve 6 adet 2x3'lük kutu bulunur. Her satır, sütun ve kutuda 1'den 6'ya kadar tüm rakamlar tekrarsız bulunmalıdır!
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="font-black text-emerald-300 block mb-1">💡 Akıllı İpuçları:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                  <li>Bir hücreye tıkladığınızda aynı rakamlar maviyle parlar.</li>
                  <li>Kırmızı renk çakışma (aynı rakamın tekrarı) olduğunu gösterir.</li>
                  <li>Takıldığınızda <b>İpucu</b> butonuna basarak yardım alabilirsiniz.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Anladım, Oyuna Başla
            </button>
          </div>
        </div>
      )}

      {/* 5. VICTORY CELEBRATION MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-sm w-full bg-slate-950 border-3 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Top Glow Banner */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white shadow-xl flex items-center justify-center mb-3 animate-bounce">
              <Trophy size={36} className="text-slate-950" />
            </div>

            <span className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
              🎉 HARİKA BAŞARI!
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide drop-shadow-md mb-2">
              SUDOKUYU ÇÖZDÜN!
            </h3>

            <div className="flex items-center gap-3 my-2 text-xs font-bold text-slate-300 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700/80">
              <div className="flex items-center gap-1 text-amber-300">
                <Clock size={14} />
                <span>Süre: {formattedTime}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-blue-300">
                <span>Mod: {size}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-emerald-300">
                <span>Hata: {mistakes}</span>
              </div>
            </div>

            <p className="text-white/80 text-xs sm:text-sm font-semibold mb-5">
              Tüm satır, sütun ve kutuları eksiksiz ve doğru şekilde tamamladın.
            </p>

            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={() => startNewGame(size, difficulty)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all border border-white cursor-pointer"
              >
                Yeni Bulmaca
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/20 text-white font-black text-xs uppercase tracking-wider hover:bg-white/30 active:scale-95 transition-all border border-white/30 cursor-pointer"
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
