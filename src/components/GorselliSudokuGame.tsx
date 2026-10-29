import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Sparkles, 
  CheckCircle2, Eraser, Lightbulb, Clock, AlertCircle, 
  Award, Undo2, Star, Users, User, Flame, Volume2, VolumeX,
  Palette, ChevronLeft, ChevronRight, Home, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface GorselliSudokuGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  currentGrade?: number;
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

export type SudokuSize = '4x4' | '6x6';
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface SudokuVisualItem {
  id: number;
  name: string;
  image: string;
  color: string;
}

export interface SudokuTheme {
  id: string;
  name: string;
  emoji: string;
  items4: SudokuVisualItem[];
  items6: SudokuVisualItem[];
}

// ==========================================
// VISUAL THEMES WITH 4 & 6 CUTE GRAPHICS
// ==========================================
export const SUDOKU_THEMES: SudokuTheme[] = [
  {
    id: 'friends',
    name: 'Sevimli Dostlar & Roket',
    emoji: '🚀',
    items4: [
      { id: 1, name: 'Balina', image: '/assets/sudoku/balina.png', color: '#0ea5e9' },
      { id: 2, name: 'Kurbağa', image: '/assets/sudoku/kurbaga.png', color: '#22c55e' },
      { id: 3, name: 'Kelebek', image: '/assets/sudoku/kelebek.png', color: '#f59e0b' },
      { id: 4, name: 'Roket', image: '/assets/sudoku/roket.png', color: '#ef4444' }
    ],
    items6: [
      { id: 1, name: 'Balina', image: '/assets/sudoku/balina.png', color: '#0ea5e9' },
      { id: 2, name: 'Kurbağa', image: '/assets/sudoku/kurbaga.png', color: '#22c55e' },
      { id: 3, name: 'Kelebek', image: '/assets/sudoku/kelebek.png', color: '#f59e0b' },
      { id: 4, name: 'Roket', image: '/assets/sudoku/roket.png', color: '#ef4444' },
      { id: 5, name: 'Dinozor', image: '/assets/sudoku/dinozor.png', color: '#10b981' },
      { id: 6, name: 'Panda', image: '/assets/sudoku/panda.png', color: '#8b5cf6' }
    ]
  },
  {
    id: 'safari',
    name: 'Vahşi Orman Hayvanları',
    emoji: '🦁',
    items4: [
      { id: 1, name: 'Aslan', image: '/assets/sudoku/aslan.png', color: '#f97316' },
      { id: 2, name: 'Tavşan', image: '/assets/sudoku/tavsan.png', color: '#ec4899' },
      { id: 3, name: 'Maymun', image: '/assets/sudoku/maymun.png', color: '#d97706' },
      { id: 4, name: 'Zürafa', image: '/assets/sudoku/zurafa.png', color: '#eab308' }
    ],
    items6: [
      { id: 1, name: 'Aslan', image: '/assets/sudoku/aslan.png', color: '#f97316' },
      { id: 2, name: 'Tavşan', image: '/assets/sudoku/tavsan.png', color: '#ec4899' },
      { id: 3, name: 'Maymun', image: '/assets/sudoku/maymun.png', color: '#d97706' },
      { id: 4, name: 'Zürafa', image: '/assets/sudoku/zurafa.png', color: '#eab308' },
      { id: 5, name: 'Koala', image: '/assets/sudoku/koala.png', color: '#64748b' },
      { id: 6, name: 'Ayı', image: '/assets/sudoku/ayi.png', color: '#78350f' }
    ]
  },
  {
    id: 'ocean',
    name: 'Mavi Deniz Dünyası',
    emoji: '🐬',
    items4: [
      { id: 1, name: 'Yunus', image: '/assets/sudoku/yunus.png', color: '#06b6d4' },
      { id: 2, name: 'Denizyıldızı', image: '/assets/sudoku/deniz_yildizi.png', color: '#f43f5e' },
      { id: 3, name: 'Yengeç', image: '/assets/sudoku/yengec.png', color: '#ea580c' },
      { id: 4, name: 'Denizanası', image: '/assets/sudoku/denizanasi.png', color: '#a855f7' }
    ],
    items6: [
      { id: 1, name: 'Yunus', image: '/assets/sudoku/yunus.png', color: '#06b6d4' },
      { id: 2, name: 'Denizyıldızı', image: '/assets/sudoku/deniz_yildizi.png', color: '#f43f5e' },
      { id: 3, name: 'Yengeç', image: '/assets/sudoku/yengec.png', color: '#ea580c' },
      { id: 4, name: 'Denizanası', image: '/assets/sudoku/denizanasi.png', color: '#a855f7' },
      { id: 5, name: 'Kaplumbağa', image: '/assets/sudoku/kaplumbaga.png', color: '#16a34a' },
      { id: 6, name: 'Penguen', image: '/assets/sudoku/penguen.png', color: '#3b82f6' }
    ]
  },
  {
    id: 'garden',
    name: 'Minik Bahçe Canlıları',
    emoji: '🐞',
    items4: [
      { id: 1, name: 'Uğurböceği', image: '/assets/sudoku/ugur_bocegi.png', color: '#dc2626' },
      { id: 2, name: 'Çekirge', image: '/assets/sudoku/cekirge.png', color: '#84cc16' },
      { id: 3, name: 'Tırtıl', image: '/assets/sudoku/tirtil.png', color: '#10b981' },
      { id: 4, name: 'Mantar', image: '/assets/sudoku/mantar.png', color: '#f97316' }
    ],
    items6: [
      { id: 1, name: 'Uğurböceği', image: '/assets/sudoku/ugur_bocegi.png', color: '#dc2626' },
      { id: 2, name: 'Çekirge', image: '/assets/sudoku/cekirge.png', color: '#84cc16' },
      { id: 3, name: 'Tırtıl', image: '/assets/sudoku/tirtil.png', color: '#10b981' },
      { id: 4, name: 'Mantar', image: '/assets/sudoku/mantar.png', color: '#f97316' },
      { id: 5, name: 'Flamingo', image: '/assets/sudoku/flamingo.png', color: '#f43f5e' },
      { id: 6, name: 'Ördek', image: '/assets/sudoku/ordek.png', color: '#eab308' }
    ]
  }
];

// ==========================================
// 4x4 SUDOKU VALID GENERATOR (2x2 BLOCKS)
// ==========================================
const BASE_4X4: number[][] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

function generateValid4x4(): number[][] {
  let grid = BASE_4X4.map(row => [...row]);

  // 1. Permute digits
  const digits = [1, 2, 3, 4];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  const digitMap = new Map<number, number>();
  [1, 2, 3, 4].forEach((d, idx) => digitMap.set(d, digits[idx]));
  grid = grid.map(row => row.map(v => digitMap.get(v) || v));

  // 2. Randomly swap rows within band 1 and band 2
  if (Math.random() > 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
  if (Math.random() > 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];

  // 3. Randomly swap columns within stack 1 and stack 2
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
// 6x6 SUDOKU VALID GENERATOR (2 rows x 3 cols BLOCKS)
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

  // 1. Permute digits
  const digits = [1, 2, 3, 4, 5, 6];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  const digitMap = new Map<number, number>();
  [1, 2, 3, 4, 5, 6].forEach((d, idx) => digitMap.set(d, digits[idx]));
  grid = grid.map(row => row.map(v => digitMap.get(v) || v));

  // 2. Swap rows within each band (2 rows each)
  if (Math.random() > 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
  if (Math.random() > 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];
  if (Math.random() > 0.5) [grid[4], grid[5]] = [grid[5], grid[4]];

  // 3. Swap columns within stack 1 (cols 0, 1, 2)
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

// Function to generate puzzle by removing cells
function createSudokuPuzzle(
  size: SudokuSize, 
  difficulty: SudokuDifficulty = 'easy'
): { initial: number[][]; solution: number[][] } {
  const is4x4 = size === '4x4';
  const solution = is4x4 ? generateValid4x4() : generateValid6x6();
  const initial = solution.map(row => [...row]);

  const totalCells = is4x4 ? 16 : 36;
  
  // Clues count:
  // 4x4: Easy: 8 clues (8 to fill), Medium: 6 clues, Hard: 5 clues
  // 6x6: Easy: 18 clues (18 to fill), Medium: 15 clues, Hard: 12 clues
  let cluesToKeep = 0;
  if (is4x4) {
    cluesToKeep = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 6 : 5;
  } else {
    cluesToKeep = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 15 : 12;
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

export const GorselliSudokuGame: React.FC<GorselliSudokuGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students = [],
  currentGrade = 2,
  selectedStudentIds = [],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  // Player Mode: 2 = 2 Kişilik Yan Yana Düello (Varsayılan), 1 = Tek Kişilik Antrenman
  const [playerMode, setPlayerMode] = useState<1 | 2>(2);
  const [size, setSize] = useState<SudokuSize>('4x4');
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [themeId, setThemeId] = useState<string>('friends');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHintBanner, setShowHintBanner] = useState<boolean>(true);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  // Active theme items
  const currentTheme = useMemo(() => {
    return SUDOKU_THEMES.find(t => t.id === themeId) || SUDOKU_THEMES[0];
  }, [themeId]);

  const visualItems = useMemo(() => {
    return size === '4x4' ? currentTheme.items4 : currentTheme.items6;
  }, [currentTheme, size]);

  const dim = size === '4x4' ? 4 : 6;
  const boxRows = 2;
  const boxCols = size === '4x4' ? 2 : 3;

  // Sound triggering helper
  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) playMp3(src);
  }, [soundEnabled, playMp3]);

  // Shared puzzle boards
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>([]);

  // Player 1 state
  const [board1, setBoard1] = useState<number[][]>([]);
  const [selectedCell1, setSelectedCell1] = useState<[number, number] | null>(null);
  const [history1, setHistory1] = useState<{ r: number; c: number; prevVal: number; newVal: number }[]>([]);
  const [errors1, setErrors1] = useState<number>(0);
  const [hintsRemaining1, setHintsRemaining1] = useState<number>(3);
  const [score1, setScore1] = useState<number>(0);
  const [errorCell1, setErrorCell1] = useState<[number, number] | null>(null);
  const [isCompleted1, setIsCompleted1] = useState<boolean>(false);

  // Player 2 state
  const [board2, setBoard2] = useState<number[][]>([]);
  const [selectedCell2, setSelectedCell2] = useState<[number, number] | null>(null);
  const [history2, setHistory2] = useState<{ r: number; c: number; prevVal: number; newVal: number }[]>([]);
  const [errors2, setErrors2] = useState<number>(0);
  const [hintsRemaining2, setHintsRemaining2] = useState<number>(3);
  const [score2, setScore2] = useState<number>(0);
  const [errorCell2, setErrorCell2] = useState<[number, number] | null>(null);
  const [isCompleted2, setIsCompleted2] = useState<boolean>(false);

  // Timer & Game State
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | 'draw' | null>(null);
  const [winnerReason, setWinnerReason] = useState<string>('');

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
    setHistory1([]);
    setHistory2([]);

    setErrors1(0);
    setErrors2(0);
    setHintsRemaining1(3);
    setHintsRemaining2(3);

    setScore1(0);
    setScore2(0);

    setErrorCell1(null);
    setErrorCell2(null);

    setIsCompleted1(false);
    setIsCompleted2(false);

    setTimeLeft(targetSize === '4x4' ? 120 : 180);
    setGameOver(false);
    setWinner(null);
    setWinnerReason('');

    triggerSound('/op.mp3');
  }, [size, difficulty, triggerSound]);

  // Initial load & when size changes
  useEffect(() => {
    startNewGame(size, difficulty);
  }, [size, difficulty]);

  // Timer effect
  useEffect(() => {
    if (gameOver || !timerActive) return;

    if (timeLeft <= 0) {
      triggerSound('/hata.mp3');
      setGameOver(true);

      // Determine winner based on score / correct items placed
      if (playerMode === 1) {
        setWinner(0);
        setWinnerReason('Süre doldu! Tebrikler.');
        onGameCompleted?.(0, 1);
      } else {
        if (score1 > score2) {
          setWinner(0);
          setWinnerReason('Süre doldu! 1. Oyuncu daha yüksek skorla kazandı! 🏆');
          onGameCompleted?.(0, 2);
        } else if (score2 > score1) {
          setWinner(1);
          setWinnerReason('Süre doldu! 2. Oyuncu daha yüksek skorla kazandı! 🏆');
          onGameCompleted?.(1, 2);
        } else {
          setWinner('draw');
          setWinnerReason('Süre doldu! Her iki oyuncu eşit puanla bitirdi! 🤝');
          onGameCompleted?.(null, 2);
        }
      }
      return;
    }

    if (timeLeft <= 3 && timeLeft >= 1) {
      triggerSound('/tek.mp3');
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft, timerActive, playerMode, score1, score2, triggerSound, onGameCompleted]);

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

  // Remaining count for a specific item on a player's board
  const getItemRemainingCount = useCallback((playerIndex: 0 | 1, itemId: number): number => {
    const currentBoard = playerIndex === 0 ? board1 : board2;
    let placed = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (currentBoard[r]?.[c] === itemId) {
          placed++;
        }
      }
    }
    return Math.max(0, dim - placed);
  }, [board1, board2, dim]);

  // Total empty cells remaining on board
  const getRemainingEmptyCells = useCallback((playerIndex: 0 | 1): number => {
    const currentBoard = playerIndex === 0 ? board1 : board2;
    let count = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (currentBoard[r]?.[c] === 0) {
          count++;
        }
      }
    }
    return count;
  }, [board1, board2, dim]);

  // Handle item placement for player
  const handleItemInput = (playerIndex: 0 | 1, itemId: number) => {
    if (gameOver) return;

    const isP1 = playerIndex === 0;
    const selected = isP1 ? selectedCell1 : selectedCell2;
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

    const currentBoard = isP1 ? board1 : board2;
    const prevVal = currentBoard[r]?.[c] || 0;
    const expected = solutionBoard[r]?.[c];
    const isCorrect = itemId === expected;

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = itemId;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      onQuestionAnswered?.(true, playerIndex);

      if (isP1) {
        setBoard1(newBoard);
        setHistory1(prev => [...prev, { r, c, prevVal, newVal: itemId }]);
        setScore1(prev => prev + 10);
      } else {
        setBoard2(newBoard);
        setHistory2(prev => [...prev, { r, c, prevVal, newVal: itemId }]);
        setScore2(prev => prev + 10);
      }

      // Check for victory
      if (checkIsBoardFullAndValid(newBoard)) {
        triggerSound('/alkis.mp3');
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.5 } });

        if (isP1) {
          setIsCompleted1(true);
          setScore1(prev => prev + 50);
          setWinner(0);
          setWinnerReason(p1Student ? `${p1Student.name} Sudoku'yu ilk tamamlayarak kazandı! 👑` : '1. Oyuncu Sudoku\'yu ilk tamamlayarak kazandı! 👑');
          setGameOver(true);
          onGameCompleted?.(0, playerMode);
        } else {
          setIsCompleted2(true);
          setScore2(prev => prev + 50);
          setWinner(1);
          setWinnerReason(p2Student ? `${p2Student.name} Sudoku'yu ilk tamamlayarak kazandı! 👑` : '2. Oyuncu Sudoku\'yu ilk tamamlayarak kazandı! 👑');
          setGameOver(true);
          onGameCompleted?.(1, playerMode);
        }
      }
    } else {
      // Wrong placement: Shake error and count mistake
      triggerSound('/hata.mp3');
      onQuestionAnswered?.(false, playerIndex);

      if (isP1) {
        setErrorCell1([r, c]);
        setTimeout(() => setErrorCell1(null), 600);
        const newErr = errors1 + 1;
        setErrors1(newErr);
        if (newErr >= 3) {
          // 3 Hatada bitsin kuralı!
          setGameOver(true);
          if (playerMode === 2) {
            setWinner(1);
            setWinnerReason('1. Oyuncu 3 hata yaptı! 2. Oyuncu kazandı! 🏆');
            onGameCompleted?.(1, 2);
          } else {
            setWinner(null);
            setWinnerReason('3 hata hakkınız doldu! Tekrar deneyin.');
            onGameCompleted?.(null, 1);
          }
        }
      } else {
        setErrorCell2([r, c]);
        setTimeout(() => setErrorCell2(null), 600);
        const newErr = errors2 + 1;
        setErrors2(newErr);
        if (newErr >= 3) {
          setGameOver(true);
          setWinner(0);
          setWinnerReason('2. Oyuncu 3 hata yaptı! 1. Oyuncu kazandı! 🏆');
          onGameCompleted?.(0, 2);
        }
      }
    }
  };

  // Erase cell for player
  const handleErase = (playerIndex: 0 | 1) => {
    if (gameOver) return;
    const isP1 = playerIndex === 0;
    const selected = isP1 ? selectedCell1 : selectedCell2;
    if (!selected) return;

    const [r, c] = selected;
    if (initialBoard[r]?.[c] > 0) return; // Cannot erase locked initial clue

    const currentBoard = isP1 ? board1 : board2;
    const prevVal = currentBoard[r]?.[c] || 0;
    if (prevVal === 0) return;

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = 0;

    triggerSound('/click.mp3');
    if (isP1) {
      setBoard1(newBoard);
      setHistory1(prev => [...prev, { r, c, prevVal, newVal: 0 }]);
    } else {
      setBoard2(newBoard);
      setHistory2(prev => [...prev, { r, c, prevVal, newVal: 0 }]);
    }
  };

  // Undo last move for player
  const handleUndo = (playerIndex: 0 | 1) => {
    if (gameOver) return;
    const isP1 = playerIndex === 0;
    const history = isP1 ? history1 : history2;
    if (history.length === 0) return;

    const last = history[history.length - 1];
    const currentBoard = isP1 ? board1 : board2;

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[last.r][last.c] = last.prevVal;

    triggerSound('/op.mp3');
    if (isP1) {
      setBoard1(newBoard);
      setHistory1(prev => prev.slice(0, -1));
      setSelectedCell1([last.r, last.c]);
    } else {
      setBoard2(newBoard);
      setHistory2(prev => prev.slice(0, -1));
      setSelectedCell2([last.r, last.c]);
    }
  };

  // Use a hint (reveals 1 correct cell)
  const handleHint = (playerIndex: 0 | 1) => {
    if (gameOver) return;
    const isP1 = playerIndex === 0;
    const remainingHints = isP1 ? hintsRemaining1 : hintsRemaining2;
    if (remainingHints <= 0) {
      triggerSound('/hata.mp3');
      return;
    }

    const currentBoard = isP1 ? board1 : board2;
    const emptyPositions: [number, number][] = [];

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (currentBoard[r]?.[c] === 0 || currentBoard[r]?.[c] !== solutionBoard[r]?.[c]) {
          if (initialBoard[r]?.[c] === 0) {
            emptyPositions.push([r, c]);
          }
        }
      }
    }

    if (emptyPositions.length === 0) return;

    // Pick random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const [r, c] = emptyPositions[randomIndex];
    const correctItem = solutionBoard[r][c];

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = correctItem;

    triggerSound('/para.mp3');

    if (isP1) {
      setBoard1(newBoard);
      setSelectedCell1([r, c]);
      setHintsRemaining1(prev => prev - 1);
      setScore1(prev => prev + 5);
    } else {
      setBoard2(newBoard);
      setSelectedCell2([r, c]);
      setHintsRemaining2(prev => prev - 1);
      setScore2(prev => prev + 5);
    }

    // Check completion
    if (checkIsBoardFullAndValid(newBoard)) {
      triggerSound('/alkis.mp3');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      setGameOver(true);
      setWinner(isP1 ? 0 : 1);
      setWinnerReason(isP1 ? '1. Oyuncu Sudoku\'yu tamamladı! 👑' : '2. Oyuncu Sudoku\'yu tamamladı! 👑');
      onGameCompleted?.(isP1 ? 0 : 1, playerMode);
    }
  };

  // Helper to get visual item object from number 1..6
  const getItemById = useCallback((id: number): SudokuVisualItem | undefined => {
    return visualItems.find(item => item.id === id);
  }, [visualItems]);

  // ==========================================
  // RENDER SUDOKU GRID FOR A PLAYER (REFERENCE STYLE)
  // ==========================================
  const renderSudokuGrid = (
    playerIndex: 0 | 1,
    board: number[][],
    selectedCell: [number, number] | null,
    onSelectCell: (r: number, c: number) => void
  ) => {
    const isP1 = playerIndex === 0;
    const errorCell = isP1 ? errorCell1 : errorCell2;

    const accentBorder = isP1 ? 'border-cyan-400' : 'border-rose-400';
    const accentShadow = isP1 ? 'shadow-[0_0_25px_rgba(6,182,212,0.35)]' : 'shadow-[0_0_25px_rgba(244,63,94,0.35)]';

    return (
      <div className={`relative p-2 sm:p-2.5 rounded-3xl bg-[#081226]/95 border-2 ${accentBorder} ${accentShadow} max-w-full`}>
        <div 
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`
          }}
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const isLocked = initialBoard[r]?.[c] > 0;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isError = errorCell?.[0] === r && errorCell?.[1] === c;
              const itemObj = val > 0 ? getItemById(val) : undefined;

              // Subgrid box borders
              const isRightBoxBorder = size === '4x4' 
                ? c === 1 
                : (c === 2); // 6x6 has 3 cols per box: col 2 divides left and right half
              const isBottomBoxBorder = size === '4x4'
                ? r === 1
                : (r === 1 || r === 3); // 6x6 has 2 rows per box: row 1 and row 3 divide bands

              // Cell sizes
              const cellSizeClasses = size === '4x4'
                ? 'w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20'
                : 'w-10 h-10 xs:w-12 xs:h-12 sm:w-13 sm:h-13 md:w-14 md:h-14';

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => onSelectCell(r, c)}
                  className={`relative ${cellSizeClasses} rounded-2xl flex items-center justify-center p-1 sm:p-1.5 transition-all cursor-pointer select-none ${
                    isLocked 
                      ? 'bg-[#0f1d3a] border border-cyan-800/60 shadow-inner' 
                      : isSelected
                      ? 'bg-[#162a55] ring-2 ring-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-102 z-10'
                      : 'bg-[#0b162c] hover:bg-[#122244] border border-slate-700/60 active:scale-95'
                  } ${
                    isError ? 'ring-4 ring-rose-500 bg-rose-950/80 animate-shake' : ''
                  } ${
                    isRightBoxBorder ? 'mr-1 sm:mr-1.5 border-r-2 border-r-cyan-400/80' : ''
                  } ${
                    isBottomBoxBorder ? 'mb-1 sm:mb-1.5 border-b-2 border-b-cyan-400/80' : ''
                  }`}
                >
                  {itemObj ? (
                    <img 
                      src={itemObj.image} 
                      alt={itemObj.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-200"
                    />
                  ) : null}

                  {/* Locked clue indicator */}
                  {isLocked && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER DOCK WITH ITEM BUTTONS & BADGES (REFERENCE STYLE)
  // ==========================================
  const renderItemSelectorDock = (playerIndex: 0 | 1) => {
    const isP1 = playerIndex === 0;

    return (
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        {/* Visual Item Cards */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 max-w-full">
          {visualItems.map((item) => {
            const remaining = getItemRemainingCount(playerIndex, item.id);
            const isCompleted = remaining === 0;

            const btnBorder = isP1 ? 'border-cyan-500/60 hover:border-cyan-300' : 'border-rose-500/60 hover:border-rose-300';
            const btnBg = isP1 ? 'bg-[#0e1d3d]' : 'bg-[#1f0e24]';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemInput(playerIndex, item.id)}
                disabled={gameOver}
                className={`relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl ${btnBg} border-2 ${btnBorder} flex items-center justify-center p-1 sm:p-2 shadow-md active:scale-95 transition-all cursor-pointer ${
                  isCompleted ? 'opacity-50 ring-1 ring-emerald-500/50' : 'hover:scale-105'
                }`}
                title={`${item.name} (${remaining} adet kaldı)`}
              >
                <img 
                  src={item.image} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow"
                />

                {/* Badge showing remaining count needed (Reference Style!) */}
                <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center shadow-md border ${
                  isCompleted 
                    ? 'bg-emerald-600 border-emerald-400 text-white' 
                    : isP1
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-rose-950 border-rose-400 text-rose-300'
                }`}>
                  {isCompleted ? '✓' : remaining}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Geri Al, Sil, İpucu (Reference Style!) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Geri Al (Purple Pill) */}
          <button
            type="button"
            onClick={() => handleUndo(playerIndex)}
            disabled={gameOver || (isP1 ? history1.length === 0 : history2.length === 0)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-black shadow-md border border-purple-400/50 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            title="Son hamleyi geri al"
          >
            <Undo2 size={13} />
            <span>Geri Al</span>
          </button>

          {/* Sil (Cyan/Blue Pill) */}
          <button
            type="button"
            onClick={() => handleErase(playerIndex)}
            disabled={gameOver}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] sm:text-xs font-black shadow-md border border-cyan-400/50 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            title="Seçili kareyi sil"
          >
            <Eraser size={13} />
            <span>Sil</span>
          </button>

          {/* İpucu (Amber Pill with Remaining Badge) */}
          <button
            type="button"
            onClick={() => handleHint(playerIndex)}
            disabled={gameOver || (isP1 ? hintsRemaining1 <= 0 : hintsRemaining2 <= 0)}
            className="relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-[11px] sm:text-xs font-black shadow-md border border-amber-300 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            title="Bir boş kareyi doğru görsel ile doldur"
          >
            <Lightbulb size={13} className="text-slate-950" />
            <span>İpucu</span>
            <span className="ml-1 w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
              {isP1 ? hintsRemaining1 : hintsRemaining2}
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      {/* BACKGROUND IMAGE WITH MOODY GRADIENT OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm pointer-events-none" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-30 px-2 sm:px-4 py-1.5 bg-slate-950/95 border-b border-cyan-500/40 flex items-center justify-between shrink-0 shadow-xl gap-2 flex-wrap sm:flex-nowrap">
        {/* LEFT: PREV, BACK, HOME, NEXT & TITLE */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shadow-sm shrink-0"
              title="Ana Sayfaya Dön"
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 flex items-center justify-center shadow-lg border border-cyan-300 shrink-0">
              <img 
                src="/assets/sudoku/gorselli.png" 
                alt="Görselli Sudoku" 
                className="w-full h-full object-contain filter drop-shadow" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-cyan-300 tracking-wide uppercase truncate flex items-center gap-1.5">
                <span>Görselli Sudoku</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                  {playerMode === 2 ? '2 Kişilik Kapışma' : 'Tekli Mod'}
                </span>
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold truncate hidden xs:inline-block">
                {size} • {currentTheme.name}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: MODE, SIZE, DIFFICULTY & TIMER */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          {/* Mode Switcher: 2P vs 1P */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => {
                setPlayerMode(2);
                startNewGame(size, difficulty);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                playerMode === 2
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2 Kişilik Yan Yana Düello"
            >
              <Users size={13} />
              <span>2 Kişilik</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPlayerMode(1);
                startNewGame(size, difficulty);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                playerMode === 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tek Kişilik Antrenman"
            >
              <User size={13} />
              <span>Tekli</span>
            </button>
          </div>

          {/* Size Switcher: 4x4 vs 6x6 */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setSize('4x4')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                size === '4x4'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
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
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6x6
            </button>
          </div>

          {/* Difficulty Selector */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 text-xs shrink-0">
            {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map(diff => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff === 'easy' ? 'Kolay' : diff === 'medium' ? 'Orta' : 'Zor'}
              </button>
            ))}
          </div>

          {/* Theme Chooser Button */}
          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="px-2 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer shrink-0"
            title="Görsel Temasını Değiştir"
          >
            <span>{currentTheme.emoji}</span>
            <span className="hidden lg:inline">{currentTheme.name}</span>
          </button>

          {/* Countdown Timer */}
          <div className={`px-2.5 sm:px-3 py-1 rounded-xl border font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shrink-0 transition-all ${
            timeLeft <= 15
              ? 'bg-rose-950/95 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse'
              : 'bg-slate-900/90 border-cyan-400/60 text-cyan-300'
          }`}>
            <Clock size={13} className={timeLeft <= 15 ? 'text-rose-400 animate-spin' : 'text-cyan-400'} />
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>

        {/* RIGHT: SOUND, RESET, RULES */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition cursor-pointer shadow-sm ${
              soundEnabled ? 'bg-slate-800 text-cyan-300 border-slate-600' : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            type="button"
            onClick={() => startNewGame(size, difficulty)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            title="Yeniden Başlat"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            title="Nasıl Oynanır?"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* TUTORIAL HINT BANNER (REFERENCE STYLE!) */}
      {showHintBanner && (
        <div className="relative z-20 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">💡</span>
            <span className="truncate">
              <strong>Öğretici Kural:</strong> Her satırda, sütunda ve kalın çizgili kutuda her görselden yalnızca <strong>BİR</strong> tane bulunmalıdır!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHintBanner(false)}
            className="shrink-0 text-[10px] px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 flex items-center gap-1 cursor-pointer"
          >
            <X size={12} />
            <span>Kapat</span>
          </button>
        </div>
      )}

      {/* MAIN GAME ARENA: SIDE BY SIDE IN 2-PLAYER MODE (REFERENCE DESIGN!) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-3 overflow-y-auto no-scrollbar">
        {playerMode === 1 ? (
          /* ================================================= */
          /* 1 OYUNCU (TEKLİ MOD) ARENA                       */
          /* ================================================= */
          <div className="flex flex-col items-center justify-center gap-2.5 max-w-lg w-full my-auto">
            {/* Player Info Pill */}
            <div className="flex items-center justify-between w-full max-w-md px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg text-xs font-bold">
              <div className="flex items-center gap-2 min-w-0">
                {p1Student ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${p1Student.avatarBg || 'from-cyan-500 to-blue-600'} text-slate-950 font-black text-xs flex items-center justify-center border border-cyan-400 shrink-0 shadow`}>
                      {p1Student.avatar}
                    </div>
                    <span className="text-cyan-300 font-black truncate max-w-[140px]">
                      {p1Student.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                    <User size={14} className="text-cyan-400" />
                    <span>1. Oyuncu</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-rose-400 font-mono text-xs flex items-center gap-1">
                  <span>Hata:</span>
                  <b className="text-white">{errors1}/3</b>
                </span>
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <span>Kalan:</span>
                  <b className="text-white">{getRemainingEmptyCells(0)}</b>
                </span>
                <span className="text-amber-300 font-mono text-xs flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <b className="text-white">{score1}</b>
                </span>
              </div>
            </div>

            {/* Sudoku Grid */}
            {renderSudokuGrid(0, board1, selectedCell1, (r, c) => setSelectedCell1([r, c]))}

            {/* Visual Items Dock with Badges */}
            {renderItemSelectorDock(0)}
          </div>
        ) : (
          /* ================================================= */
          /* 2 OYUNCU (YAN YANA DÜELLO) ARENA - EXACT MATCH    */
          /* ================================================= */
          <div className="flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-6 w-full max-w-6xl my-auto">
            {/* PLAYER 1 (SOL TARAF - MAVİ GÖKYÜZÜ) */}
            <div className="flex-1 flex flex-col items-center p-2.5 sm:p-3.5 rounded-3xl bg-[#071126]/90 border-2 border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.25)] w-full max-w-lg">
              {/* Header & Status Pill */}
              <div className="flex items-center justify-between w-full mb-2 pb-1.5 border-b border-cyan-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs shadow border border-cyan-300 shrink-0">
                    1
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-cyan-300 text-xs font-black truncate">
                      {p1Student?.name || '1. Oyuncu (Mavi)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {size} Sudoku
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] font-mono">
                    Hata: <b className="text-white">{errors1}/3</b>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-mono flex items-center gap-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <b className="text-white">{score1}</b>
                  </span>
                </div>
              </div>

              {/* Grid 1 */}
              {renderSudokuGrid(0, board1, selectedCell1, (r, c) => setSelectedCell1([r, c]))}

              {/* Items Dock 1 */}
              {renderItemSelectorDock(0)}
            </div>

            {/* VS DIVIDER PILL */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-1 px-1 shrink-0">
              <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 via-amber-400 to-rose-500 p-0.5 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-xs text-amber-300">
                  VS
                </div>
              </div>
              <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-rose-500 to-transparent" />
            </div>

            {/* PLAYER 2 (SAĞ TARAF - KIRMIZI ATEŞ) */}
            <div className="flex-1 flex flex-col items-center p-2.5 sm:p-3.5 rounded-3xl bg-[#1a081d]/90 border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.25)] w-full max-w-lg">
              {/* Header & Status Pill */}
              <div className="flex items-center justify-between w-full mb-2 pb-1.5 border-b border-rose-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-xs shadow border border-rose-300 shrink-0">
                    2
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-rose-300 text-xs font-black truncate">
                      {p2Student?.name || '2. Oyuncu (Kırmızı)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {size} Sudoku
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] font-mono">
                    Hata: <b className="text-white">{errors2}/3</b>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-mono flex items-center gap-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <b className="text-white">{score2}</b>
                  </span>
                </div>
              </div>

              {/* Grid 2 */}
              {renderSudokuGrid(1, board2, selectedCell2, (r, c) => setSelectedCell2([r, c]))}

              {/* Items Dock 2 */}
              {renderItemSelectorDock(1)}
            </div>
          </div>
        )}
      </main>

      {/* STUDENT AVATAR DOCK (ÖĞRENCİ ÇARKI VE SINIF SEÇİMİ) */}
      {students && onOpenRosterModal && (
        <footer className="relative z-20 w-full shrink-0 px-2 sm:px-4 pb-1">
          <StudentAvatarDock
            students={students}
            currentGrade={currentGrade || 2}
            playerCount={playerMode === 2 ? 2 : 1}
            selectedStudentIds={playerMode === 2 ? selectedStudentIds : [selectedStudentIds?.[0] || null]}
            onSelectStudentForPlayer={(pIdx, sId) => {
              if (onSelectStudentForPlayer) {
                onSelectStudentForPlayer(pIdx, sId);
              }
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </footer>
      )}

      {/* WINNER / GAME OVER CELEBRATION MODAL */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0a1428] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-rose-400" />

            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
              <Trophy size={36} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wide">
              {winner === 'draw' ? 'Berabere!' : winner === 0 ? (p1Student?.name ? `${p1Student.name} Kazandı!` : '1. Oyuncu Kazandı!') : winner === 1 ? (p2Student?.name ? `${p2Student.name} Kazandı!` : '2. Oyuncu Kazandı!') : 'Oyun Bitti!'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 mb-4 leading-relaxed font-semibold">
              {winnerReason || 'Tebrikler, harika bir Sudoku mücadelesiydi!'}
            </p>

            {/* Final Scores Comparison */}
            <div className="w-full grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40">
                <span className="text-[10px] text-cyan-300 font-bold block">1. Oyuncu</span>
                <span className="text-lg font-black text-white">{score1} Puan</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40">
                <span className="text-[10px] text-rose-300 font-bold block">2. Oyuncu</span>
                <span className="text-lg font-black text-white">{score2} Puan</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => startNewGame(size, difficulty)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} />
                <span>Tekrar Oyna</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition active:scale-95 cursor-pointer border border-slate-600"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THEME CHOOSER MODAL */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0a1428] border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl flex flex-col text-white">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
                <Palette size={18} />
                <span>Görsel Temasını Seçin</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {SUDOKU_THEMES.map(t => {
                const isSelected = t.id === themeId;
                const sampleItems = size === '4x4' ? t.items4 : t.items6;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setShowThemeModal(false);
                      triggerSound('/coin.mp3');
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg' 
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl">{t.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-white truncate">{t.name}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {sampleItems.slice(0, 4).map(it => (
                            <img 
                              key={it.id} 
                              src={it.image} 
                              alt={it.name} 
                              className="w-5 h-5 object-contain"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0a1428] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <HelpCircle size={18} />
                <span>Görselli Sudoku Nasıl Oynanır?</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                <h4 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Oyunun Amacı</span>
                </h4>
                <p>
                  Her satırda, her sütunda ve kalın çizgilerle ayrılmış her kutuda her görselden <strong>tam olarak bir tane</strong> olacak şekilde boş kareleri doğru görsellerle doldurun.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1.5">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>2 Kişilik Kapışma & Kurallar</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>İki oyuncu da yan yana aynı Sudoku bulmacasıyla başlar.</li>
                  <li>Önce doldurmak istediğiniz boş kareye dokunun, ardından aşağıdaki görsel çubuğundan yerleştirmek istediğiniz görsele tıklayın.</li>
                  <li>Doğru yerleştirilen her görsel için <strong>+10 ⭐ puan</strong> kazanırsınız.</li>
                  <li><strong>3 Hata Kuralı:</strong> Bir oyuncu 3 hata yaparsa turu kaybeder, rakibi kazanır!</li>
                  <li>Tüm kareleri doğru ve eksiksiz ilk tamamlayan oyuncu şampiyon olur!</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Anladım, Oyuna Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
