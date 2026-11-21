import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ArrowLeft, RotateCcw, HelpCircle, Trophy, Users, Bot,
  Undo2, Home, ChevronLeft, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

interface KureGameProps {
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

const BOARD_SIZE = 7;
const WIN_CAPTURES = 4;

// 0 = Boş, 1 = Mor (1. Oyuncu - Alt sıra başlar), 2 = Turuncu (2. Oyuncu / Bot - Üst sıra)
type CellValue = 0 | 1 | 2;
type Player = 1 | 2;
type GameMode = 'pve' | 'pvp';
type BotDifficulty = 'easy' | 'medium' | 'hard';

interface Coord {
  r: number;
  c: number;
}

interface KureMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  captures: Coord[];
}

interface Snapshot {
  board: CellValue[][];
  turn: Player;
  capturedBy: { 1: number; 2: number };
  lastMove: { from: Coord; to: Coord; captured: Coord[] } | null;
  moveCount: number;
}

// 8 yön (Sıkıştırma / taş alma tüm 8 yönde geçerlidir)
const ALL_8_DIRS: readonly [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

// Dikey ve çapraz 6 yön (TAZOF güncel kurallarında yatay hareket yasaktır)
const NON_HORIZONTAL_DIRS: readonly [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const createInitialBoard = (): CellValue[][] => {
  const b: CellValue[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<CellValue>(BOARD_SIZE).fill(0)
  );
  // Resmi Küre başlangıç dizilimi:
  // Üst sıra (row 0): soldan 6 Turuncu (0..5) + sağ köşede 1 Mor (6)
  for (let c = 0; c < BOARD_SIZE - 1; c++) b[0][c] = 2;
  b[0][BOARD_SIZE - 1] = 1;
  // Alt sıra (row 6): sol köşede 1 Turuncu (0) + sağda 6 Mor (1..6) — Mor başlar
  b[BOARD_SIZE - 1][0] = 2;
  for (let c = 1; c < BOARD_SIZE; c++) b[BOARD_SIZE - 1][c] = 1;
  return b;
};

const cloneBoard = (b: CellValue[][]): CellValue[][] => b.map(row => [...row]);

const getOwnStartRow = (p: Player) => (p === 1 ? BOARD_SIZE - 1 : 0);
const getOppStartRow = (p: Player) => (p === 1 ? 0 : BOARD_SIZE - 1);
const getForwardDr = (p: Player) => (p === 1 ? -1 : 1);
const getOpponent = (p: Player): Player => (p === 1 ? 2 : 1);

/**
 * TAZOF Dörtlü Yasağı Kontrolü:
 * Tahtada (oyuncunun kendi başlangıç sırası hariç) yatay, dikey veya çapraz doğrultuda
 * aralıklı ya da bitişik aynı renkten 4 veya daha fazla taş bulunamaz.
 */
const violatesFourInLine = (
  boardAfter: CellValue[][],
  player: Player,
  nr: number,
  nc: number
): boolean => {
  const ownStartRow = getOwnStartRow(player);

  // 1. Yatay satır (kendi başlangıç sırası hariç; zaten oraya hamle yapılamaz)
  if (nr !== ownStartRow) {
    let rowCount = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (boardAfter[nr][c] === player) rowCount++;
    }
    if (rowCount >= 4) return true;
  }

  // 2. Dikey sütun
  let colCount = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (boardAfter[r][nc] === player) colCount++;
  }
  if (colCount >= 4) return true;

  // 3. Ana çapraz (r - c = nr - nc)
  let diag1Count = 0;
  const diff = nr - nc;
  for (let r = 0; r < BOARD_SIZE; r++) {
    const c = r - diff;
    if (c >= 0 && c < BOARD_SIZE && boardAfter[r][c] === player) diag1Count++;
  }
  if (diag1Count >= 4) return true;

  // 4. Ters çapraz (r + c = nr + nc)
  let diag2Count = 0;
  const sum = nr + nc;
  for (let r = 0; r < BOARD_SIZE; r++) {
    const c = sum - r;
    if (c >= 0 && c < BOARD_SIZE && boardAfter[r][c] === player) diag2Count++;
  }
  if (diag2Count >= 4) return true;

  return false;
};

/**
 * Hamle sonrası sıkıştırılan (iki kendi taşının arasında kalan) rakip taşları bulur.
 * Kendi isteğiyle iki rakip taş arasına giren taş alınmaz.
 */
const findCaptures = (
  boardAfter: CellValue[][],
  player: Player,
  nr: number,
  nc: number
): Coord[] => {
  const opp = getOpponent(player);
  const captured: Coord[] = [];

  for (const [dr, dc] of ALL_8_DIRS) {
    const midR = nr + dr;
    const midC = nc + dc;
    const farR = nr + 2 * dr;
    const farC = nc + 2 * dc;

    if (
      midR >= 0 && midR < BOARD_SIZE &&
      midC >= 0 && midC < BOARD_SIZE &&
      farR >= 0 && farR < BOARD_SIZE &&
      farC >= 0 && farC < BOARD_SIZE &&
      boardAfter[midR][midC] === opp &&
      boardAfter[farR][farC] === player
    ) {
      captured.push({ r: midR, c: midC });
    }
  }
  return captured;
};

type InvalidReason =
  | 'horizontal_forbidden'
  | 'no_return_start'
  | 'start_only_forward'
  | 'opp_start_limit'
  | 'four_in_line'
  | null;

const checkMoveValidity = (
  board: CellValue[][],
  player: Player,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { valid: boolean; reason: InvalidReason; captures: Coord[] } => {
  if (toR < 0 || toR >= BOARD_SIZE || toC < 0 || toC >= BOARD_SIZE) {
    return { valid: false, reason: null, captures: [] };
  }
  if (board[toR][toC] !== 0) {
    return { valid: false, reason: null, captures: [] };
  }

  const dr = toR - fromR;
  const dc = toC - fromC;
  if (Math.abs(dr) > 1 || Math.abs(dc) > 1 || (dr === 0 && dc === 0)) {
    return { valid: false, reason: null, captures: [] };
  }

  // Yatay hareket yasaktır (TAZOF güncel kuralı)
  if (dr === 0) {
    return { valid: false, reason: 'horizontal_forbidden', captures: [] };
  }

  const ownStartRow = getOwnStartRow(player);
  const oppStartRow = getOppStartRow(player);
  const forwardDr = getForwardDr(player);

  // Başlangıç sırasından çıkan taş geri dönemez
  if (toR === ownStartRow) {
    return { valid: false, reason: 'no_return_start', captures: [] };
  }

  // Başlangıç sırasındaki taş sadece ileri düz veya ileri çapraz gidebilir
  if (fromR === ownStartRow && dr !== forwardDr) {
    return { valid: false, reason: 'start_only_forward', captures: [] };
  }

  // Rakibin başlangıç sırasında aynı anda en fazla 1 taş bulunabilir
  if (toR === oppStartRow) {
    let existingInOppStart = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[oppStartRow][c] === player) existingInOppStart++;
    }
    if (existingInOppStart >= 1) {
      return { valid: false, reason: 'opp_start_limit', captures: [] };
    }
  }

  // Geçici tahtada dörtlü yasağı ve sıkıştırma kontrolü
  const sim = cloneBoard(board);
  sim[fromR][fromC] = 0;
  sim[toR][toC] = player;

  if (violatesFourInLine(sim, player, toR, toC)) {
    return { valid: false, reason: 'four_in_line', captures: [] };
  }

  const captures = findCaptures(sim, player, toR, toC);
  return { valid: true, reason: null, captures };
};

const getValidMovesForPiece = (
  board: CellValue[][],
  player: Player,
  fromR: number,
  fromC: number
): KureMove[] => {
  if (board[fromR][fromC] !== player) return [];
  const moves: KureMove[] = [];
  const ownStartRow = getOwnStartRow(player);
  const forwardDr = getForwardDr(player);

  const dirs =
    fromR === ownStartRow
      ? ([[forwardDr, -1], [forwardDr, 0], [forwardDr, 1]] as const)
      : NON_HORIZONTAL_DIRS;

  for (const [dr, dc] of dirs) {
    const toR = fromR + dr;
    const toC = fromC + dc;
    const check = checkMoveValidity(board, player, fromR, fromC, toR, toC);
    if (check.valid) {
      moves.push({ fromR, fromC, toR, toC, captures: check.captures });
    }
  }
  return moves;
};

const getAllValidMoves = (board: CellValue[][], player: Player): KureMove[] => {
  const all: KureMove[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) {
        all.push(...getValidMovesForPiece(board, player, r, c));
      }
    }
  }
  return all;
};

const applyMoveToBoard = (board: CellValue[][], player: Player, move: KureMove): CellValue[][] => {
  const next = cloneBoard(board);
  next[move.fromR][move.fromC] = 0;
  next[move.toR][move.toC] = player;
  for (const cap of move.captures) {
    next[cap.r][cap.c] = 0;
  }
  return next;
};

const evaluateBoard = (
  board: CellValue[][],
  capturedBy: { 1: number; 2: number },
  aiPlayer: Player
): number => {
  const human = getOpponent(aiPlayer);
  if (capturedBy[aiPlayer] >= WIN_CAPTURES) return 10000;
  if (capturedBy[human] >= WIN_CAPTURES) return -10000;

  let score = (capturedBy[aiPlayer] - capturedBy[human]) * 180;

  const aiStart = getOwnStartRow(aiPlayer);
  const humanStart = getOwnStartRow(human);

  // Merkez kontrolü ve başlangıç sırasından çıkış
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = board[r][c];
      if (val === 0) continue;
      const centerBonus = 6 - (Math.abs(r - 3) + Math.abs(c - 3));
      const developed = val === aiPlayer ? (r !== aiStart ? 8 : 0) : (r !== humanStart ? 8 : 0);
      if (val === aiPlayer) {
        score += centerBonus * 3 + developed;
      } else {
        score -= centerBonus * 3 + developed;
      }
    }
  }

  // Tehdit değerlendirmesi (rakibin hemen alabileceği taş sayısı)
  const humanMoves = getAllValidMoves(board, human);
  let maxHumanCap = 0;
  for (const hm of humanMoves) {
    if (hm.captures.length > maxHumanCap) maxHumanCap = hm.captures.length;
  }
  score -= maxHumanCap * 110;

  const aiMoves = getAllValidMoves(board, aiPlayer);
  let maxAiCap = 0;
  for (const am of aiMoves) {
    if (am.captures.length > maxAiCap) maxAiCap = am.captures.length;
  }
  score += maxAiCap * 45 + (aiMoves.length - humanMoves.length) * 1.5;

  return score;
};

const chooseBotMove = (
  board: CellValue[][],
  capturedBy: { 1: number; 2: number },
  difficulty: BotDifficulty
): KureMove | null => {
  const aiPlayer: Player = 2;
  const human: Player = 1;
  const aiMoves = getAllValidMoves(board, aiPlayer);
  if (aiMoves.length === 0) return null;

  // Anında kazandıran hamle varsa her zorlukta oynayabilir (kolay hariç %50)
  const winningMoves = aiMoves.filter(m => capturedBy[aiPlayer] + m.captures.length >= WIN_CAPTURES);
  if (winningMoves.length > 0 && (difficulty !== 'easy' || Math.random() < 0.6)) {
    return winningMoves[Math.floor(Math.random() * winningMoves.length)];
  }

  if (difficulty === 'easy') {
    const captureMoves = aiMoves.filter(m => m.captures.length > 0);
    if (captureMoves.length > 0 && Math.random() < 0.45) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return aiMoves[Math.floor(Math.random() * aiMoves.length)];
  }

  if (difficulty === 'medium') {
    let bestScore = -Infinity;
    let bestMoves: KureMove[] = [];
    for (const move of aiMoves) {
      const nextBoard = applyMoveToBoard(board, aiPlayer, move);
      const nextCap = { ...capturedBy, [aiPlayer]: capturedBy[aiPlayer] + move.captures.length };
      const score = evaluateBoard(nextBoard, nextCap, aiPlayer) + (Math.random() * 8 - 4);
      if (score > bestScore + 0.5) {
        bestScore = score;
        bestMoves = [move];
      } else if (Math.abs(score - bestScore) <= 0.5) {
        bestMoves.push(move);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // Usta (hard): 2-ply Minimax + Alpha-Beta budama
  let bestScore = -Infinity;
  let bestMoves: KureMove[] = [];
  let alpha = -Infinity;

  // Önce taş alan hamleleri sıralayarak budamayı hızlandır
  const orderedAiMoves = [...aiMoves].sort((a, b) => b.captures.length - a.captures.length);

  for (const move of orderedAiMoves) {
    const b1 = applyMoveToBoard(board, aiPlayer, move);
    const cap1 = { ...capturedBy, [aiPlayer]: capturedBy[aiPlayer] + move.captures.length };

    if (cap1[aiPlayer] >= WIN_CAPTURES) {
      return move;
    }

    const humanMoves = getAllValidMoves(b1, human);
    let worstForAi = Infinity;

    if (humanMoves.length === 0) {
      worstForAi = 9500;
    } else {
      const orderedHumanMoves = [...humanMoves].sort((a, b) => b.captures.length - a.captures.length);
      for (const hm of orderedHumanMoves) {
        const b2 = applyMoveToBoard(b1, human, hm);
        const cap2 = { ...cap1, [human]: cap1[human] + hm.captures.length };
        const val = evaluateBoard(b2, cap2, aiPlayer);
        if (val < worstForAi) worstForAi = val;
        if (worstForAi <= alpha) break;
      }
    }

    if (worstForAi > bestScore) {
      bestScore = worstForAi;
      bestMoves = [move];
      if (bestScore > alpha) alpha = bestScore;
    } else if (Math.abs(worstForAi - bestScore) < 1) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || aiMoves[0];
};

const REASON_MESSAGES: Record<Exclude<InvalidReason, null>, string> = {
  horizontal_forbidden: 'Yatay (sağa-sola) hareket yasaktır! İleri, geri veya çapraz oyna.',
  no_return_start: 'Başlangıç sırasından çıkan taş geri dönemez!',
  start_only_forward: 'Başlangıç sırasındaki taş sadece ileri veya ileri çapraz gider!',
  opp_start_limit: 'Rakibin başlangıç sırasında aynı anda en fazla 1 taşın bulunabilir!',
  four_in_line: 'Dörtlü yasağı! Aynı satır, sütun veya çaprazda 4 taşın dizilemez.',
};

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7'];

export const KureGame: React.FC<KureGameProps> = ({
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
  const [board, setBoard] = useState<CellValue[][]>(createInitialBoard);
  const [turn, setTurn] = useState<Player>(1); // Mor her zaman başlar
  const [selectedPiece, setSelectedPiece] = useState<Coord | null>(null);
  const [capturedBy, setCapturedBy] = useState<{ 1: number; 2: number }>({ 1: 0, 2: 0 });
  const [winner, setWinner] = useState<Player | null>(null);
  const [winReason, setWinReason] = useState<'captures' | 'no_moves' | null>(null);

  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Coord; to: Coord; captured: Coord[] } | null>(null);
  const [ruleHint, setRuleHint] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const hintTimeoutRef = useRef<number | null>(null);

  const triggerSound = useCallback((src: string) => {
    if (playMp3) playMp3(src);
  }, [playMp3]);

  const showHint = useCallback((msg: string) => {
    setRuleHint(msg);
    if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => {
      setRuleHint(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  const p1Label = p1Student ? p1Student.name : '1. Oyuncu (Mor)';
  const p2Label = gameMode === 'pve' ? 'Bilgisayar (Turuncu)' : (p2Student ? p2Student.name : '2. Oyuncu (Turuncu)');

  // Seçili taşın geçerli hamleleri
  const validMovesForSelected = useMemo(() => {
    if (!selectedPiece || winner !== null || isBotThinking) return [];
    if (gameMode === 'pve' && turn === 2) return [];
    return getValidMovesForPiece(board, turn, selectedPiece.r, selectedPiece.c);
  }, [board, selectedPiece, turn, winner, isBotThinking, gameMode]);

  const validMoveMap = useMemo(() => {
    const map = new Map<string, KureMove>();
    for (const m of validMovesForSelected) {
      map.set(`${m.toR},${m.toC}`, m);
    }
    return map;
  }, [validMovesForSelected]);

  // Seçili taşın alabileceği rakip taşları vurgula
  const capturePreviewSet = useMemo(() => {
    const s = new Set<string>();
    for (const m of validMovesForSelected) {
      for (const cap of m.captures) s.add(`${cap.r},${cap.c}`);
    }
    return s;
  }, [validMovesForSelected]);

  // Hareket edebilen kendi taşları (hiç hamlesi olmayanları ayırt etmek için)
  const movablePiecesSet = useMemo(() => {
    const s = new Set<string>();
    if (winner !== null) return s;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === turn && getValidMovesForPiece(board, turn, r, c).length > 0) {
          s.add(`${r},${c}`);
        }
      }
    }
    return s;
  }, [board, turn, winner]);

  const restartGame = useCallback(() => {
    setBoard(createInitialBoard());
    setTurn(1);
    setSelectedPiece(null);
    setCapturedBy({ 1: 0, 2: 0 });
    setWinner(null);
    setWinReason(null);
    setIsBotThinking(false);
    setMoveCount(0);
    setHistory([]);
    setLastMove(null);
    setRuleHint(null);
    triggerSound('/tekrar.mp3');
  }, [triggerSound]);

  const handleVictory = useCallback((winningPlayer: Player, reason: 'captures' | 'no_moves') => {
    setWinner(winningPlayer);
    setWinReason(reason);
    setSelectedPiece(null);
    onGameCompleted?.(winningPlayer === 1 ? 0 : 1, gameMode === 'pvp' ? 2 : 1);
    setScores(prev => ({
      ...prev,
      [winningPlayer === 1 ? 'p1' : 'p2']: prev[winningPlayer === 1 ? 'p1' : 'p2'] + 1,
    }));
    triggerSound('/alkis.mp3');
    try {
      confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.6 },
        colors: winningPlayer === 1
          ? ['#9333ea', '#c084fc', '#f59e0b', '#ffffff']
          : ['#ea580c', '#fb923c', '#facc15', '#ffffff'],
      });
    } catch {
      // Ignore confetti errors
    }
  }, [gameMode, onGameCompleted, triggerSound]);

  const executeMove = useCallback((move: KureMove, activePlayer: Player, saveHistory: boolean) => {
    if (saveHistory) {
      setHistory(prev => [
        ...prev.slice(-14),
        {
          board: cloneBoard(board),
          turn,
          capturedBy: { ...capturedBy },
          lastMove,
          moveCount,
        },
      ]);
    }

    const nextBoard = applyMoveToBoard(board, activePlayer, move);
    const nextCapturedBy = {
      ...capturedBy,
      [activePlayer]: capturedBy[activePlayer] + move.captures.length,
    };

    setBoard(nextBoard);
    setCapturedBy(nextCapturedBy);
    setSelectedPiece(null);
    setMoveCount(c => c + 1);
    setLastMove({
      from: { r: move.fromR, c: move.fromC },
      to: { r: move.toR, c: move.toC },
      captured: move.captures,
    });

    if (move.captures.length > 0) {
      triggerSound('/coin.mp3');
      showHint(
        move.captures.length > 1
          ? `Müthiş sıkıştırma! ${move.captures.length} rakip küre birden alındı!`
          : 'Sıkıştırma başarılı! 1 rakip küre oyun dışına çıkarıldı!'
      );
    } else {
      triggerSound('/ding.mp3');
    }

    // Kazanma kontrolü 1: 4 taş alındı mı?
    if (nextCapturedBy[activePlayer] >= WIN_CAPTURES) {
      handleVictory(activePlayer, 'captures');
      return;
    }

    // Kazanma kontrolü 2: Sıradaki oyuncunun yasal hamlesi kaldı mı?
    const nextPlayer = getOpponent(activePlayer);
    const oppMoves = getAllValidMoves(nextBoard, nextPlayer);
    if (oppMoves.length === 0) {
      handleVictory(activePlayer, 'no_moves');
      return;
    }

    setTurn(nextPlayer);
  }, [board, turn, capturedBy, lastMove, moveCount, triggerSound, showHint, handleVictory]);

  // Geri Al (PvE'de insan oyuncunun son hamlesine döner)
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isBotThinking || winner !== null) return;
    const snap = history[history.length - 1];
    setBoard(snap.board);
    setTurn(snap.turn);
    setCapturedBy(snap.capturedBy);
    setLastMove(snap.lastMove);
    setMoveCount(snap.moveCount);
    setSelectedPiece(null);
    setHistory(prev => prev.slice(0, -1));
    setRuleHint(null);
    triggerSound('/click.mp3');
  }, [history, isBotThinking, winner, triggerSound]);

  // Bilgisayar Hamlesi (1 Kişilik Mod)
  useEffect(() => {
    if (gameMode !== 'pve' || turn !== 2 || winner !== null) return;
    setIsBotThinking(true);

    const delay = difficulty === 'hard' ? 580 : 480;
    const timer = window.setTimeout(() => {
      const botMove = chooseBotMove(board, capturedBy, difficulty);
      setIsBotThinking(false);
      if (!botMove) {
        handleVictory(1, 'no_moves');
        return;
      }
      executeMove(botMove, 2, false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [gameMode, turn, winner, board, capturedBy, difficulty, executeMove, handleVictory]);

  const handleCellClick = (r: number, c: number) => {
    if (winner !== null || isBotThinking) return;
    if (gameMode === 'pve' && turn === 2) return;

    const cellVal = board[r][c];

    // 1. Kendi taşına tıklarsa seç (veya seçimi kaldır)
    if (cellVal === turn) {
      if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
        setSelectedPiece(null);
        triggerSound('/click.mp3');
        return;
      }
      const moves = getValidMovesForPiece(board, turn, r, c);
      setSelectedPiece({ r, c });
      triggerSound('/click.mp3');
      if (moves.length === 0) {
        showHint('Bu taşın şu an kurallara uygun boş hamlesi yok. Başka bir taş seç!');
      }
      return;
    }

    // 2. Seçili taş varsa hedef kareyi kontrol et
    if (selectedPiece) {
      const validMove = validMoveMap.get(`${r},${c}`);
      if (validMove) {
        executeMove(validMove, turn, true);
        return;
      }

      // Boş ama kural dışı bir komşu kareye tıklandıysa eğitici kural ipucu göster
      if (cellVal === 0) {
        const check = checkMoveValidity(board, turn, selectedPiece.r, selectedPiece.c, r, c);
        if (check.reason) {
          showHint(REASON_MESSAGES[check.reason]);
          triggerSound('/click.mp3');
        }
      }
    }
  };

  // Kalan taş sayıları
  const p1Remaining = 7 - capturedBy[2];
  const p2Remaining = 7 - capturedBy[1];

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-slate-100 dark:from-[#071521] dark:via-[#0b2236] dark:to-slate-950 text-white"
    >
      <ActivityBackground theme="doga" />

      {/* ÜST KONTROL ÇUBUĞU */}
      <header className="relative z-20 px-2 sm:px-5 py-1.5 sm:py-2 bg-slate-950/95 border-b border-cyan-400/30 flex items-center justify-between gap-2 shrink-0 shadow-md">
        {/* SOL: GEZİNTİ & BAŞLIK */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shrink-0"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/20 transition cursor-pointer shrink-0"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shrink-0"
              title="Ana Sayfaya Dön"
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
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
                Küre
              </h1>
              <span className="hidden sm:inline text-xs font-semibold text-slate-400 whitespace-nowrap">
                · 7×7 Akıl ve Strateji Oyunu
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              Rakip küreleri iki taşın arasına sıkıştır, 4 taş toplayan kazanır
            </span>
          </div>
        </div>

        {/* ORTA: 1 KİŞİLİK / 2 KİŞİLİK & ZORLUK */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                if (gameMode !== 'pve') {
                  setGameMode('pve');
                  restartGame();
                  triggerSound('/click.mp3');
                }
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                gameMode === 'pve'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bot size={14} />
              <span className="hidden sm:inline">1 Kişilik</span>
              <span className="sm:hidden">1K</span>
            </button>
            <button
              onClick={() => {
                if (gameMode !== 'pvp') {
                  setGameMode('pvp');
                  restartGame();
                  triggerSound('/click.mp3');
                }
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">2 Kişilik</span>
              <span className="sm:hidden">2K</span>
            </button>
          </div>

          {gameMode === 'pve' && (
            <div className="hidden md:flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-xs">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    setDifficulty(diff);
                    triggerSound('/click.mp3');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    difficulty === diff
                      ? 'bg-purple-500 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'easy' ? 'Kolay' : diff === 'medium' ? 'Orta' : 'Usta'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: KURALLAR, GERİ AL, YENİDEN */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowRulesModal(true)}
            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-400/40 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            title="Küre Oyunu Kuralları"
          >
            <HelpCircle size={16} />
            <span className="hidden lg:inline">Kurallar</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isBotThinking || winner !== null}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Son Hamleyi Geri Al"
          >
            <Undo2 size={16} />
          </button>

          <button
            onClick={restartGame}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black flex items-center justify-center transition cursor-pointer shadow-sm"
            title="Yeni Oyun"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* ANA OYUN ALANI */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-1.5 sm:p-2.5 overflow-hidden min-h-0 w-full max-w-5xl mx-auto gap-1.5">
        {/* SKOR & SIRA HUD ÇUBUĞU */}
        <div className="w-full flex items-center justify-between gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-slate-950/92 border border-slate-800 shadow-lg shrink-0">
          {/* OYUNCU 1: MOR */}
          <div
            className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all min-w-0 ${
              turn === 1 && winner === null
                ? 'bg-purple-950/95 border-2 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.45)]'
                : 'bg-slate-900/70 border border-slate-800 text-slate-400'
            }`}
          >
            <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-950 border-2 border-purple-200/90 shadow-md flex items-center justify-center shrink-0">
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full bg-white/65 -rotate-30" />
              <span className="text-xs sm:text-sm relative z-10">{p1Student?.avatar || ''}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-[150px]">
                  {p1Student ? p1Student.name : 'Mor'}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-purple-300 font-bold">
                  · {scores.p1} set
                </span>
              </div>
              {/* Alınan 4 Turuncu Taş Göstergesi */}
              <div className="flex items-center gap-1 mt-0.5" title="Alınan Turuncu Küreler">
                {[0, 1, 2, 3].map(slot => (
                  <span
                    key={slot}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all ${
                      slot < capturedBy[1]
                        ? 'bg-gradient-to-br from-amber-300 via-orange-500 to-red-700 border-amber-200 shadow-sm scale-105'
                        : 'bg-slate-900/90 border-slate-700'
                    }`}
                  />
                ))}
                <span className="text-[10px] sm:text-xs font-mono tabular-nums font-bold text-purple-200 ml-1">
                  {capturedBy[1]}/4
                </span>
              </div>
            </div>
          </div>

          {/* ORTA: DURUM VE KURAL BİLDİRİMİ */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1 min-w-0">
            {winner !== null ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                <Trophy size={16} className="shrink-0" />
                <span className="truncate">
                  {winner === 1 ? p1Label : p2Label} Kazandı!
                </span>
              </div>
            ) : ruleHint ? (
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/90 border border-amber-400/60 text-amber-200 text-[11px] sm:text-xs font-bold max-w-md">
                <AlertCircle size={14} className="shrink-0 text-amber-400" />
                <span className="line-clamp-2">{ruleHint}</span>
              </div>
            ) : isBotThinking ? (
              <div className="text-xs sm:text-sm font-bold text-orange-300 flex items-center gap-1.5">
                <Sparkles size={14} className="animate-spin shrink-0" />
                <span>Bilgisayar hamlesini düşünüyor...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span
                  className={`text-xs sm:text-sm font-black tracking-wide ${
                    turn === 1 ? 'text-purple-300' : 'text-orange-300'
                  }`}
                >
                  Sıra: {turn === 1 ? p1Label : p2Label}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
                  {selectedPiece
                    ? 'Parlayan yuvaya tıkla (sıkıştırılan taş otomatik alınır)'
                    : 'Oynatmak istediğin kendi kürene tıkla'}
                </span>
              </div>
            )}
          </div>

          {/* OYUNCU 2: TURUNCU */}
          <div
            className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all min-w-0 ${
              turn === 2 && winner === null
                ? 'bg-orange-950/95 border-2 border-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]'
                : 'bg-slate-900/70 border border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex flex-col items-end min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono tabular-nums text-orange-300 font-bold">
                  {scores.p2} set ·
                </span>
                <span className="font-black text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-[150px]">
                  {gameMode === 'pve' ? 'Bilgisayar' : (p2Student ? p2Student.name : 'Turuncu')}
                </span>
              </div>
              {/* Alınan 4 Mor Taş Göstergesi */}
              <div className="flex items-center gap-1 mt-0.5" title="Alınan Mor Küreler">
                <span className="text-[10px] sm:text-xs font-mono tabular-nums font-bold text-orange-200 mr-1">
                  {capturedBy[2]}/4
                </span>
                {[0, 1, 2, 3].map(slot => (
                  <span
                    key={slot}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all ${
                      slot < capturedBy[2]
                        ? 'bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-900 border-purple-200 shadow-sm scale-105'
                        : 'bg-slate-900/90 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-red-800 border-2 border-orange-200/90 shadow-md flex items-center justify-center shrink-0">
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full bg-white/65 -rotate-30" />
              <span className="text-xs sm:text-sm relative z-10">
                {gameMode === 'pve' ? '🤖' : (p2Student?.avatar || '')}
              </span>
            </div>
          </div>
        </div>

        {/* 7x7 TURKUAZ KÜRE OYUN TAHTASI (Referans Görseldeki Gerçek Kalıp Estetiği) */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0 py-0.5">
          <div className="relative aspect-square w-full max-w-[min(66vh,490px)] sm:max-w-[min(69vh,530px)] p-2.5 sm:p-4 rounded-[1.75rem] sm:rounded-[2.25rem] bg-gradient-to-br from-[#2ad1e8] via-[#12b4cc] to-[#088196] border-[4px] border-[#0a6b7d] shadow-[0_22px_50px_rgba(0,0,0,0.65),_inset_0_3px_6px_rgba(255,255,255,0.45),_inset_0_-6px_12px_rgba(4,54,66,0.5)] flex flex-col justify-between">
            {/* Üst Koordinatlar + Turuncu Başlangıç Çizgisi Etiketi */}
            <div className="grid grid-cols-7 w-full text-center px-4 sm:px-5 pb-0.5">
              {COL_LABELS.map(col => (
                <span
                  key={col}
                  className="text-[10px] sm:text-xs font-black text-cyan-950/75 tracking-widest select-none"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Orta Bölüm: Satır Numaraları + 7x7 Izgara */}
            <div className="flex-1 flex items-stretch w-full min-h-0 gap-1 sm:gap-1.5">
              <div className="flex flex-col justify-around text-center shrink-0 w-3 sm:w-4 select-none">
                {ROW_LABELS.map(row => (
                  <span key={row} className="text-[10px] sm:text-xs font-black text-cyan-950/75">
                    {row}
                  </span>
                ))}
              </div>

              {/* 7×7 Oyuk Taş Yuvaları ve Kanal Deseni */}
              <div className="relative flex-1 rounded-2xl bg-[#109eb5]/80 p-1.5 sm:p-2 shadow-[inset_0_4px_12px_rgba(4,56,68,0.45)] border border-cyan-200/35">
                {/* Arka plan SVG: Gerçek tahtadaki dikey ve çapraz hareket kanalları */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-35"
                  viewBox="0 0 700 700"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {/* Dikey ve çapraz yollar */}
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const pos = idx * 100 + 50;
                    return (
                      <g key={idx}>
                        <line x1={pos} y1={50} x2={pos} y2={650} stroke="#064e5e" strokeWidth="6" strokeLinecap="round" />
                        <line x1={50} y1={pos} x2={650} y2={pos} stroke="#064e5e" strokeWidth="3" strokeDasharray="6 8" opacity="0.55" />
                      </g>
                    );
                  })}
                  {/* Çapraz kanallar */}
                  {Array.from({ length: 6 }).map((_, r) =>
                    Array.from({ length: 6 }).map((__, c) => {
                      const x1 = c * 100 + 50;
                      const y1 = r * 100 + 50;
                      const x2 = (c + 1) * 100 + 50;
                      const y2 = (r + 1) * 100 + 50;
                      return (
                        <g key={`d-${r}-${c}`}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#064e5e" strokeWidth="5" />
                          <line x1={x2} y1={y1} x2={x1} y2={y2} stroke="#064e5e" strokeWidth="5" />
                        </g>
                      );
                    })
                  )}
                </svg>

                {/* 49 Yuvarlak Küre Yuvası */}
                <div className="relative z-10 grid grid-cols-7 grid-rows-7 gap-1 sm:gap-1.5 w-full h-full">
                  {board.map((rowArr, r) =>
                    rowArr.map((cellVal, c) => {
                      const key = `${r},${c}`;
                      const isSelected = selectedPiece?.r === r && selectedPiece?.c === c;
                      const validMove = validMoveMap.get(key);
                      const isValidTarget = Boolean(validMove);
                      const isCaptureTarget = Boolean(validMove && validMove.captures.length > 0);
                      const isCapturePreviewPiece = capturePreviewSet.has(key);
                      const isLastFrom = lastMove?.from.r === r && lastMove?.from.c === c;
                      const isLastTo = lastMove?.to.r === r && lastMove?.to.c === c;
                      const isLastCaptured = Boolean(lastMove?.captured.some(p => p.r === r && p.c === c));
                      const isOwnMovable =
                        winner === null &&
                        !isBotThinking &&
                        !(gameMode === 'pve' && turn === 2) &&
                        cellVal === turn &&
                        movablePiecesSet.has(key);

                      const isTopStartRow = r === 0;
                      const isBottomStartRow = r === BOARD_SIZE - 1;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCellClick(r, c)}
                          aria-label={`Kare ${COL_LABELS[c]}${ROW_LABELS[r]}`}
                          className={`relative w-full h-full rounded-full flex items-center justify-center transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                            isCaptureTarget
                              ? 'bg-amber-300/90 ring-3 ring-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.95)] cursor-pointer hover:scale-105 active:scale-95'
                              : isValidTarget
                                ? 'bg-emerald-300/85 ring-2 ring-white shadow-[0_0_14px_rgba(52,211,153,0.9)] cursor-pointer hover:scale-105 active:scale-95'
                                : isTopStartRow
                                  ? 'bg-gradient-to-b from-[#0b6f83] via-[#0d8197] to-[#159bb4] shadow-[inset_0_5px_9px_rgba(4,42,52,0.65),_0_1px_1px_rgba(255,255,255,0.45)] ring-1 ring-orange-300/45'
                                  : isBottomStartRow
                                    ? 'bg-gradient-to-b from-[#0b6f83] via-[#0d8197] to-[#159bb4] shadow-[inset_0_5px_9px_rgba(4,42,52,0.65),_0_1px_1px_rgba(255,255,255,0.45)] ring-1 ring-purple-300/50'
                                    : 'bg-gradient-to-b from-[#096e82] via-[#0c859c] to-[#1aa2ba] shadow-[inset_0_5px_9px_rgba(4,45,56,0.6),_0_1px_1px_rgba(255,255,255,0.45)]'
                          } ${isOwnMovable ? 'cursor-pointer' : isValidTarget ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          {/* Son hamle başlangıç izi */}
                          {isLastFrom && cellVal === 0 && !isValidTarget && (
                            <span className="w-2.5 h-2.5 rounded-full bg-white/45 pointer-events-none" />
                          )}

                          {/* Son turda alınan taş izi */}
                          {isLastCaptured && cellVal === 0 && !isValidTarget && (
                            <span className="text-xs sm:text-sm font-black text-rose-100/90 pointer-events-none">
                              ✕
                            </span>
                          )}

                          {/* Geçerli Hamle Hedef İşareti */}
                          {isValidTarget && (
                            <div className="flex flex-col items-center justify-center pointer-events-none">
                              <span
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm ${
                                  isCaptureTarget ? 'bg-rose-600 animate-bounce' : 'bg-emerald-600'
                                }`}
                              />
                              {isCaptureTarget && (
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-950 uppercase leading-none mt-0.5">
                                  AL!
                                </span>
                              )}
                            </div>
                          )}

                          {/* MOR KÜRE TAŞI (Oyuncu 1) */}
                          {cellVal === 1 && (
                            <div
                              className={`relative w-[86%] h-[86%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#e879f9_0%,#9333ea_38%,#581c87_78%,#2e1065_100%)] shadow-[0_7px_12px_rgba(15,23,42,0.65),_inset_0_-4px_6px_rgba(0,0,0,0.45)] transition-transform duration-150 flex items-center justify-center ${
                                isSelected
                                  ? 'scale-112 ring-3 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.9)] -translate-y-0.5'
                                  : isCapturePreviewPiece
                                    ? 'ring-3 ring-rose-400 animate-pulse'
                                    : isLastTo
                                      ? 'ring-2 ring-white/90'
                                      : isOwnMovable
                                        ? 'hover:scale-108'
                                        : ''
                              }`}
                            >
                              {/* Parlak cam yansıması */}
                              <div className="absolute top-[14%] left-[18%] w-[36%] h-[22%] rounded-full bg-white/65 -rotate-28 blur-[0.5px] pointer-events-none" />
                              <div className="absolute bottom-[16%] right-[18%] w-[18%] h-[12%] rounded-full bg-fuchsia-300/35 pointer-events-none" />
                            </div>
                          )}

                          {/* TURUNCU KÜRE TAŞI (Oyuncu 2 / Bilgisayar) */}
                          {cellVal === 2 && (
                            <div
                              className={`relative w-[86%] h-[86%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#fde047_0%,#f97316_36%,#c2410c_76%,#7c2d12_100%)] shadow-[0_7px_12px_rgba(15,23,42,0.65),_inset_0_-4px_6px_rgba(0,0,0,0.45)] transition-transform duration-150 flex items-center justify-center ${
                                isSelected
                                  ? 'scale-112 ring-3 ring-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.9)] -translate-y-0.5'
                                  : isCapturePreviewPiece
                                    ? 'ring-3 ring-amber-300 animate-pulse'
                                    : isLastTo
                                      ? 'ring-2 ring-white/90'
                                      : isOwnMovable
                                        ? 'hover:scale-108'
                                        : ''
                              }`}
                            >
                              {/* Parlak cam yansıması */}
                              <div className="absolute top-[14%] left-[18%] w-[36%] h-[22%] rounded-full bg-white/70 -rotate-28 blur-[0.5px] pointer-events-none" />
                              <div className="absolute bottom-[16%] right-[18%] w-[18%] h-[12%] rounded-full bg-amber-200/35 pointer-events-none" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sağ Kenar: Satır Numaraları (Referanstaki yön işareti estetiğiyle) */}
              <div className="flex flex-col justify-around text-center shrink-0 w-3 sm:w-4 select-none">
                {ROW_LABELS.map(row => (
                  <span key={row} className="text-[10px] sm:text-xs font-black text-cyan-950/75">
                    {row}
                  </span>
                ))}
              </div>
            </div>

            {/* Alt Koordinatlar */}
            <div className="grid grid-cols-7 w-full text-center px-4 sm:px-5 pt-0.5">
              {COL_LABELS.map(col => (
                <span
                  key={col}
                  className="text-[10px] sm:text-xs font-black text-cyan-950/75 tracking-widest select-none"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ALT BİLGİ ÇUBUĞU (Temiz metin, hap karmaşası yok) */}
        <div className="w-full flex items-center justify-between text-[11px] sm:text-xs text-slate-300 font-medium px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span className="text-purple-300 font-bold">Mor: {p1Remaining} taş</span>
            <span className="text-slate-600">·</span>
            <span className="text-orange-300 font-bold">Turuncu: {p2Remaining} taş</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">Hamle: {moveCount}</span>
          </div>
          <span className="hidden md:inline text-slate-400">
            İleri, geri veya çapraz 1 adım · Yatay hareket ve 4&apos;lü dizilim yasak
          </span>
          <button
            onClick={() => setShowRulesModal(true)}
            className="text-cyan-300 hover:text-cyan-200 font-bold underline underline-offset-2 cursor-pointer"
          >
            Turnuva Kuralları
          </button>
        </div>
      </main>

      {/* ÖĞRENCİ SEÇİM ÇUBUĞU */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={gameMode === 'pvp' ? 2 : 1}
            selectedStudentIds={gameMode === 'pvp' ? selectedStudentIds : [selectedStudentIds?.[0] || null]}
            onSelectStudentForPlayer={(pIdx, sId) => {
              if (onSelectStudentForPlayer) onSelectStudentForPlayer(pIdx, sId);
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* TAZOF KÜRE KURALLARI MODALI */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-cyan-400/70 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-cyan-300">
                  Küre Oyunu Kuralları (TAZOF)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  7×7 Tahta · 7 Mor &amp; 7 Turuncu Küre · İlk Hamle Mor
                </p>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-cyan-300 block mb-0.5">1. Amaç ve Kazanma</strong>
                Rakibinin taşlarını yatay, dikey veya çapraz olarak kendi iki taşının arasına sıkıştırıp oyun dışı bırak! Toplam <strong>4 rakip taşı</strong> toplayan (veya rakibini hamlesiz bırakan) oyuncu kazanır.
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-emerald-300 block mb-0.5">2. Hareket Kuralları</strong>
                Her turda 1 taş boş komşu yuvaya <strong>1 birim</strong> gider.
                <br />• <strong>Başlangıç sırasındaki taşlar:</strong> Yalnızca ileri düz veya ileri çapraz gider.
                <br />• <strong>Oyundaki diğer taşlar:</strong> İleri, geri veya çapraz gider.
                <br />• <strong>Yatay hareket yasaktır:</strong> Sağa veya sola doğrudan hareket yapılamaz.
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-purple-300 block mb-0.5">3. Başlangıç Dizilimi ve Sırası Kısıtları</strong>
                • Oyun başında her oyuncunun <strong>6 taşı kendi başlangıç sırasında</strong>, <strong>1 taşı ise rakibin başlangıç sırasının köşesinde</strong> yer alır.
                <br />• Başlangıç sırasından ayrılan bir taş <strong>bir daha kendi başlangıç sırasına dönemez</strong>.
                <br />• Rakibin başlangıç sırasında aynı anda <strong>en fazla 1 taş</strong> bulundurulabilir.
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-amber-300 block mb-0.5">4. Dörtlü Yasağı</strong>
                Kendi başlangıç sıran hariç herhangi bir yatay, dikey veya çapraz çizgide (aralarında boşluk veya rakip taş olsa bile) aynı renkten <strong>4 taş bulunamaz</strong>.
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/75 border border-slate-700">
                <strong className="text-rose-300 block mb-0.5">5. Sıkıştırma ve Araya Girme</strong>
                Hamlenle rakibin bir taşını iki taşın arasında bırakırsan (yatay, dikey veya çapraz) o taş anında alınır. Ancak kendi isteğinle rakibin iki taşının arasına girersen taşın <strong>alınamaz</strong>, güvende kalırsın!
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wide cursor-pointer transition-colors"
            >
              Anladım, Oyuna Başla
            </button>
          </div>
        </div>
      )}

      {/* KAZANAN MODALI */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="max-w-sm w-full bg-slate-950 border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-full border-2 border-white shadow-lg flex items-center justify-center mb-3 ${
                winner === 1
                  ? 'bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-900'
                  : 'bg-gradient-to-br from-amber-300 via-orange-500 to-red-800'
              }`}
            >
              <Trophy size={32} className="text-white" />
            </div>

            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">
              Oyun Bitti
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              {winner === 1 ? p1Label : p2Label} Kazandı!
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm mb-4">
              {winReason === 'no_moves'
                ? 'Rakibinin oynayabileceği hiçbir hamle kalmadı!'
                : `Rakibinin 4 küresini sıkıştırarak ${moveCount} hamlede galibiyete ulaştı!`}
            </p>

            <div className="w-full flex items-center justify-center gap-4 text-xs font-mono tabular-nums text-slate-300 mb-4 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-purple-300 font-bold">Mor: {capturedBy[1]}/4</span>
              <span className="text-slate-600">|</span>
              <span className="text-orange-300 font-bold">Turuncu: {capturedBy[2]}/4</span>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm cursor-pointer transition-colors"
              >
                Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 cursor-pointer transition-colors"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
