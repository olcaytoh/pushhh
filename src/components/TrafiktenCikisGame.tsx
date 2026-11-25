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
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActivityBackground } from './ActivityBackground';
import { useAppLanguage } from '../utils/appLanguage';

interface TrafiktenCikisGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

export interface Vehicle {
  id: string;
  row: number;
  col: number;
  len: 2 | 3;
  orientation: 'h' | 'v';
  color: 'red' | 'blue' | 'amber' | 'emerald' | 'purple' | 'orange' | 'teal' | 'pink' | 'indigo' | 'lime';
  isTarget?: boolean;
}

export interface TrafficLevel {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  par: number;
  vehicles: Vehicle[];
}

const GRID_SIZE = 6;
const EXIT_ROW = 2;

// 12 progressive 6x6 Rush Hour puzzles (mathematically BFS-verified solvable with exact optimal par counts)
export const TRAFFIC_LEVELS: TrafficLevel[] = [
  // 1 - Warmup (Easy, optimal 3)
  {
    id: 1,
    difficulty: 'easy',
    par: 3,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 1, col: 3, len: 3, orientation: 'v', color: 'amber' },
      { id: 'B', row: 4, col: 2, len: 2, orientation: 'h', color: 'blue' },
      { id: 'C', row: 0, col: 4, len: 2, orientation: 'h', color: 'emerald' },
    ],
  },
  // 2 - Easy (optimal 4)
  {
    id: 2,
    difficulty: 'easy',
    par: 4,
    vehicles: [
      { id: 'X', row: 2, col: 0, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 1, col: 2, len: 2, orientation: 'v', color: 'blue' },
      { id: 'B', row: 3, col: 2, len: 2, orientation: 'h', color: 'emerald' },
      { id: 'C', row: 1, col: 4, len: 3, orientation: 'v', color: 'amber' },
      { id: 'D', row: 0, col: 1, len: 2, orientation: 'h', color: 'purple' },
    ],
  },
  // 3 - Easy (optimal 5)
  {
    id: 3,
    difficulty: 'easy',
    par: 5,
    vehicles: [
      { id: 'X', row: 2, col: 0, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 2, col: 5, len: 2, orientation: 'v', color: 'blue' },
      { id: 'B', row: 4, col: 5, len: 2, orientation: 'v', color: 'amber' },
      { id: 'C', row: 5, col: 0, len: 2, orientation: 'h', color: 'emerald' },
      { id: 'D', row: 1, col: 4, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 2, col: 3, len: 3, orientation: 'v', color: 'orange' },
      { id: 'F', row: 0, col: 2, len: 2, orientation: 'h', color: 'teal' },
      { id: 'G', row: 2, col: 2, len: 3, orientation: 'v', color: 'pink' },
      { id: 'H', row: 1, col: 2, len: 2, orientation: 'h', color: 'indigo' },
      { id: 'I', row: 4, col: 4, len: 2, orientation: 'v', color: 'lime' },
      { id: 'J', row: 1, col: 0, len: 2, orientation: 'h', color: 'blue' },
    ],
  },
  // 4 - Easy (optimal 6)
  {
    id: 4,
    difficulty: 'easy',
    par: 6,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 5, col: 3, len: 2, orientation: 'h', color: 'blue' },
      { id: 'B', row: 1, col: 1, len: 2, orientation: 'h', color: 'amber' },
      { id: 'C', row: 2, col: 3, len: 3, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 4, col: 1, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 0, col: 5, len: 3, orientation: 'v', color: 'orange' },
      { id: 'F', row: 0, col: 2, len: 3, orientation: 'h', color: 'teal' },
      { id: 'G', row: 3, col: 0, len: 3, orientation: 'v', color: 'pink' },
      { id: 'H', row: 4, col: 2, len: 2, orientation: 'v', color: 'indigo' },
    ],
  },
  // 5 - Medium (optimal 7)
  {
    id: 5,
    difficulty: 'medium',
    par: 7,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 2, col: 0, len: 2, orientation: 'v', color: 'blue' },
      { id: 'B', row: 0, col: 4, len: 2, orientation: 'h', color: 'amber' },
      { id: 'C', row: 1, col: 3, len: 3, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 3, col: 1, len: 3, orientation: 'v', color: 'purple' },
      { id: 'E', row: 5, col: 4, len: 2, orientation: 'h', color: 'orange' },
      { id: 'F', row: 3, col: 4, len: 2, orientation: 'h', color: 'teal' },
      { id: 'G', row: 0, col: 0, len: 2, orientation: 'v', color: 'pink' },
      { id: 'H', row: 4, col: 2, len: 2, orientation: 'v', color: 'indigo' },
      { id: 'I', row: 0, col: 1, len: 2, orientation: 'h', color: 'lime' },
      { id: 'J', row: 1, col: 4, len: 2, orientation: 'v', color: 'blue' },
    ],
  },
  // 6 - Medium (optimal 8)
  {
    id: 6,
    difficulty: 'medium',
    par: 8,
    vehicles: [
      { id: 'X', row: 2, col: 0, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 2, col: 4, len: 2, orientation: 'v', color: 'blue' },
      { id: 'B', row: 3, col: 1, len: 2, orientation: 'h', color: 'amber' },
      { id: 'C', row: 4, col: 1, len: 2, orientation: 'h', color: 'emerald' },
      { id: 'D', row: 3, col: 5, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 0, col: 4, len: 2, orientation: 'h', color: 'orange' },
      { id: 'F', row: 1, col: 3, len: 3, orientation: 'v', color: 'teal' },
      { id: 'G', row: 0, col: 1, len: 2, orientation: 'v', color: 'pink' },
      { id: 'H', row: 3, col: 0, len: 3, orientation: 'v', color: 'indigo' },
      { id: 'I', row: 4, col: 3, len: 2, orientation: 'h', color: 'lime' },
      { id: 'J', row: 1, col: 4, len: 2, orientation: 'h', color: 'blue' },
    ],
  },
  // 7 - Medium (optimal 9)
  {
    id: 7,
    difficulty: 'medium',
    par: 9,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 5, col: 0, len: 2, orientation: 'h', color: 'blue' },
      { id: 'B', row: 3, col: 1, len: 3, orientation: 'h', color: 'amber' },
      { id: 'C', row: 2, col: 0, len: 2, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 4, col: 2, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 2, col: 4, len: 2, orientation: 'v', color: 'orange' },
      { id: 'F', row: 4, col: 3, len: 3, orientation: 'h', color: 'teal' },
      { id: 'G', row: 0, col: 0, len: 2, orientation: 'h', color: 'pink' },
      { id: 'H', row: 0, col: 2, len: 2, orientation: 'h', color: 'indigo' },
      { id: 'I', row: 1, col: 5, len: 3, orientation: 'v', color: 'lime' },
    ],
  },
  // 8 - Medium (optimal 10)
  {
    id: 8,
    difficulty: 'medium',
    par: 10,
    vehicles: [
      { id: 'X', row: 2, col: 0, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 0, col: 1, len: 2, orientation: 'h', color: 'blue' },
      { id: 'B', row: 5, col: 0, len: 3, orientation: 'h', color: 'amber' },
      { id: 'C', row: 1, col: 2, len: 3, orientation: 'h', color: 'emerald' },
      { id: 'D', row: 3, col: 1, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 2, col: 2, len: 3, orientation: 'v', color: 'orange' },
      { id: 'F', row: 4, col: 4, len: 2, orientation: 'v', color: 'teal' },
      { id: 'G', row: 3, col: 3, len: 2, orientation: 'h', color: 'pink' },
    ],
  },
  // 9 - Hard (optimal 11)
  {
    id: 9,
    difficulty: 'hard',
    par: 11,
    vehicles: [
      { id: 'X', row: 2, col: 2, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 1, col: 4, len: 3, orientation: 'v', color: 'blue' },
      { id: 'B', row: 2, col: 1, len: 3, orientation: 'v', color: 'amber' },
      { id: 'C', row: 2, col: 0, len: 3, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 1, col: 5, len: 2, orientation: 'v', color: 'purple' },
      { id: 'E', row: 4, col: 2, len: 2, orientation: 'v', color: 'orange' },
      { id: 'F', row: 5, col: 3, len: 2, orientation: 'h', color: 'teal' },
      { id: 'G', row: 0, col: 0, len: 2, orientation: 'h', color: 'pink' },
      { id: 'H', row: 4, col: 4, len: 2, orientation: 'h', color: 'indigo' },
      { id: 'I', row: 1, col: 1, len: 3, orientation: 'h', color: 'lime' },
    ],
  },
  // 10 - Hard (optimal 12)
  {
    id: 10,
    difficulty: 'hard',
    par: 12,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 0, col: 5, len: 3, orientation: 'v', color: 'blue' },
      { id: 'B', row: 0, col: 0, len: 3, orientation: 'v', color: 'amber' },
      { id: 'C', row: 4, col: 1, len: 2, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 3, col: 3, len: 2, orientation: 'h', color: 'purple' },
      { id: 'E', row: 4, col: 4, len: 2, orientation: 'h', color: 'orange' },
      { id: 'F', row: 5, col: 2, len: 2, orientation: 'h', color: 'teal' },
      { id: 'G', row: 1, col: 4, len: 2, orientation: 'v', color: 'pink' },
      { id: 'H', row: 0, col: 3, len: 2, orientation: 'v', color: 'indigo' },
      { id: 'I', row: 3, col: 1, len: 2, orientation: 'h', color: 'lime' },
      { id: 'J', row: 5, col: 4, len: 2, orientation: 'h', color: 'blue' },
    ],
  },
  // 11 - Hard (optimal 14)
  {
    id: 11,
    difficulty: 'hard',
    par: 14,
    vehicles: [
      { id: 'X', row: 2, col: 0, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 3, col: 3, len: 3, orientation: 'h', color: 'blue' },
      { id: 'B', row: 0, col: 3, len: 2, orientation: 'v', color: 'amber' },
      { id: 'C', row: 4, col: 4, len: 2, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 2, col: 2, len: 3, orientation: 'v', color: 'purple' },
      { id: 'E', row: 1, col: 0, len: 2, orientation: 'h', color: 'orange' },
      { id: 'F', row: 5, col: 2, len: 2, orientation: 'h', color: 'teal' },
      { id: 'G', row: 0, col: 5, len: 2, orientation: 'v', color: 'pink' },
      { id: 'H', row: 3, col: 0, len: 3, orientation: 'v', color: 'indigo' },
      { id: 'I', row: 0, col: 0, len: 3, orientation: 'h', color: 'lime' },
    ],
  },
  // 12 - Master (optimal 16)
  {
    id: 12,
    difficulty: 'hard',
    par: 16,
    vehicles: [
      { id: 'X', row: 2, col: 1, len: 2, orientation: 'h', color: 'red', isTarget: true },
      { id: 'A', row: 2, col: 4, len: 3, orientation: 'v', color: 'blue' },
      { id: 'B', row: 2, col: 3, len: 3, orientation: 'v', color: 'amber' },
      { id: 'C', row: 4, col: 1, len: 2, orientation: 'v', color: 'emerald' },
      { id: 'D', row: 3, col: 0, len: 2, orientation: 'h', color: 'purple' },
      { id: 'E', row: 5, col: 3, len: 2, orientation: 'h', color: 'orange' },
      { id: 'F', row: 1, col: 5, len: 3, orientation: 'v', color: 'teal' },
      { id: 'G', row: 0, col: 0, len: 2, orientation: 'v', color: 'pink' },
      { id: 'H', row: 0, col: 2, len: 2, orientation: 'v', color: 'indigo' },
    ],
  },
];

const buildOccupancyGrid = (vehicles: Vehicle[], ignoreId?: string): (string | null)[][] => {
  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array<string | null>(GRID_SIZE).fill(null)
  );
  for (const v of vehicles) {
    if (v.id === ignoreId) continue;
    for (let k = 0; k < v.len; k++) {
      const r = v.orientation === 'v' ? v.row + k : v.row;
      const c = v.orientation === 'h' ? v.col + k : v.col;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        grid[r][c] = v.id;
      }
    }
  }
  return grid;
};

const getSlideBounds = (vehicles: Vehicle[], vehicleId: string): { min: number; max: number } => {
  const v = vehicles.find((item) => item.id === vehicleId);
  if (!v) return { min: 0, max: 0 };
  const grid = buildOccupancyGrid(vehicles, vehicleId);

  if (v.orientation === 'h') {
    let min = v.col;
    while (min > 0 && grid[v.row][min - 1] === null) min--;
    let max = v.col;
    while (max + v.len < GRID_SIZE && grid[v.row][max + v.len] === null) max++;
    return { min, max };
  } else {
    let min = v.row;
    while (min > 0 && grid[min - 1][v.col] === null) min--;
    let max = v.row;
    while (max + v.len < GRID_SIZE && grid[max + v.len][v.col] === null) max++;
    return { min, max };
  }
};

export interface SolverHint {
  vehicleId: string;
  toRow: number;
  toCol: number;
  stepsRemaining: number;
}

export const solveRushHourBFS = (vehicles: Vehicle[]): SolverHint | null => {
  const targetIdx = vehicles.findIndex((v) => v.isTarget);
  if (targetIdx === -1) return null;

  const startPos = vehicles.map((v) => (v.orientation === 'h' ? v.col : v.row));
  const encode = (pos: number[]) => pos.join(',');

  if (startPos[targetIdx] + vehicles[targetIdx].len === GRID_SIZE) {
    return null;
  }

  const visited = new Set<string>([encode(startPos)]);
  interface Node {
    pos: number[];
    firstMove: { idx: number; toPos: number } | null;
    depth: number;
  }

  const queue: Node[] = [{ pos: startPos, firstMove: null, depth: 0 }];
  let head = 0;
  const MAX_STATES = 22000;

  while (head < queue.length && visited.size < MAX_STATES) {
    const current = queue[head++];
    const grid = new Int8Array(GRID_SIZE * GRID_SIZE).fill(-1);

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const p = current.pos[i];
      if (v.orientation === 'h') {
        for (let k = 0; k < v.len; k++) grid[v.row * GRID_SIZE + (p + k)] = i;
      } else {
        for (let k = 0; k < v.len; k++) grid[(p + k) * GRID_SIZE + v.col] = i;
      }
    }

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const p = current.pos[i];

      // Slide backward (-1, -2, ...)
      for (let np = p - 1; np >= 0; np--) {
        const checkCell =
          v.orientation === 'h' ? v.row * GRID_SIZE + np : np * GRID_SIZE + v.col;
        if (grid[checkCell] !== -1) break;

        const nextPos = current.pos.slice();
        nextPos[i] = np;
        const key = encode(nextPos);
        if (!visited.has(key)) {
          visited.add(key);
          const firstMove = current.firstMove ?? { idx: i, toPos: np };
          queue.push({ pos: nextPos, firstMove, depth: current.depth + 1 });
        }
      }

      // Slide forward (+1, +2, ...)
      for (let np = p + 1; np + v.len <= GRID_SIZE; np++) {
        const leading = np + v.len - 1;
        const checkCell =
          v.orientation === 'h' ? v.row * GRID_SIZE + leading : leading * GRID_SIZE + v.col;
        if (grid[checkCell] !== -1) break;

        const nextPos = current.pos.slice();
        nextPos[i] = np;
        const firstMove = current.firstMove ?? { idx: i, toPos: np };

        if (i === targetIdx && np + v.len === GRID_SIZE) {
          const mv = vehicles[firstMove.idx];
          return {
            vehicleId: mv.id,
            toRow: mv.orientation === 'v' ? firstMove.toPos : mv.row,
            toCol: mv.orientation === 'h' ? firstMove.toPos : mv.col,
            stepsRemaining: current.depth + 1,
          };
        }

        const key = encode(nextPos);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ pos: nextPos, firstMove, depth: current.depth + 1 });
        }
      }
    }
  }

  return null;
};

const COLOR_STYLES: Record<
  Vehicle['color'],
  { body: string; roof: string; border: string; badge: string }
> = {
  red: {
    body: 'from-rose-500 via-red-600 to-rose-700',
    roof: 'bg-red-400/90',
    border: 'border-red-900',
    badge: 'text-white',
  },
  blue: {
    body: 'from-sky-400 via-blue-500 to-blue-700',
    roof: 'bg-sky-300/90',
    border: 'border-blue-900',
    badge: 'text-white',
  },
  amber: {
    body: 'from-yellow-300 via-amber-400 to-amber-600',
    roof: 'bg-yellow-200/90',
    border: 'border-amber-800',
    badge: 'text-amber-950',
  },
  emerald: {
    body: 'from-emerald-400 via-emerald-500 to-teal-700',
    roof: 'bg-emerald-300/90',
    border: 'border-emerald-900',
    badge: 'text-white',
  },
  purple: {
    body: 'from-violet-400 via-purple-500 to-purple-700',
    roof: 'bg-violet-300/90',
    border: 'border-purple-900',
    badge: 'text-white',
  },
  orange: {
    body: 'from-orange-400 via-orange-500 to-orange-700',
    roof: 'bg-orange-300/90',
    border: 'border-orange-900',
    badge: 'text-white',
  },
  teal: {
    body: 'from-cyan-400 via-teal-500 to-cyan-700',
    roof: 'bg-cyan-200/90',
    border: 'border-teal-900',
    badge: 'text-white',
  },
  pink: {
    body: 'from-pink-400 via-fuchsia-500 to-pink-700',
    roof: 'bg-pink-300/90',
    border: 'border-pink-900',
    badge: 'text-white',
  },
  indigo: {
    body: 'from-indigo-400 via-indigo-500 to-indigo-700',
    roof: 'bg-indigo-300/90',
    border: 'border-indigo-900',
    badge: 'text-white',
  },
  lime: {
    body: 'from-lime-400 via-green-500 to-lime-700',
    roof: 'bg-lime-200/90',
    border: 'border-lime-900',
    badge: 'text-lime-950',
  },
};

const STORAGE_KEY = 'olcico_trafikten_cikis_stars_v1';

export const TrafiktenCikisGame: React.FC<TrafiktenCikisGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  onGameCompleted,
}) => {
  const { lang } = useAppLanguage();
  const isEn = lang === 'en';

  const [levelIdx, setLevelIdx] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    TRAFFIC_LEVELS[0].vehicles.map((v) => ({ ...v }))
  );
  const [history, setHistory] = useState<Vehicle[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('X');
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState<SolverHint | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Live pointer drag state
  const [dragState, setDragState] = useState<{
    id: string;
    startClientX: number;
    startClientY: number;
    origRow: number;
    origCol: number;
    minBound: number;
    maxBound: number;
    cellSize: number;
    previewOffsetPx: number;
    targetPos: number;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const level = TRAFFIC_LEVELS[levelIdx];
  const moves = history.length;

  const playTone = useCallback(
    (type: 'slide' | 'win' | 'hint' | 'undo' | 'click') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;

        if (type === 'slide') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(340, now + 0.06);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'win') {
          [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.08);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
          });
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(type === 'hint' ? 640 : type === 'undo' ? 300 : 440, now);
          gain.gain.setValueAtTime(0.11, now);
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

  const loadLevel = useCallback(
    (idx: number) => {
      const targetLevel = TRAFFIC_LEVELS[idx];
      setLevelIdx(idx);
      setVehicles(targetLevel.vehicles.map((v) => ({ ...v })));
      setHistory([]);
      setSelectedId('X');
      setSolved(false);
      setHint(null);
      setDragState(null);
      playTone('click');
    },
    [playTone]
  );

  const commitMove = useCallback(
    (vehicleId: string, newRow: number, newCol: number) => {
      const current = vehicles.find((v) => v.id === vehicleId);
      if (!current || (current.row === newRow && current.col === newCol)) return;

      const prevSnapshot = vehicles.map((v) => ({ ...v }));
      const nextVehicles = vehicles.map((v) =>
        v.id === vehicleId ? { ...v, row: newRow, col: newCol } : v
      );
      const nextMoveCount = history.length + 1;

      setHistory((prev) => [...prev, prevSnapshot]);
      setVehicles(nextVehicles);
      setHint(null);
      playTone('slide');

      const hero = nextVehicles.find((v) => v.isTarget);
      if (hero && hero.col + hero.len === GRID_SIZE) {
        setSolved(true);
        playTone('win');
        const earnedStars =
          nextMoveCount <= level.par + 1 ? 3 : nextMoveCount <= level.par + 4 ? 2 : 1;
        setLevelStars((prev) => {
          const updated = { ...prev, [level.id]: Math.max(prev[level.id] || 0, earnedStars) };
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
    [history.length, level.id, level.par, onGameCompleted, playTone, vehicles]
  );

  const nudgeSelected = useCallback(
    (delta: -1 | 1) => {
      if (!selectedId || solved) return;
      const v = vehicles.find((item) => item.id === selectedId);
      if (!v) return;
      const { min, max } = getSlideBounds(vehicles, selectedId);
      if (v.orientation === 'h') {
        const nextCol = Math.max(min, Math.min(max, v.col + delta));
        if (nextCol !== v.col) commitMove(selectedId, v.row, nextCol);
      } else {
        const nextRow = Math.max(min, Math.min(max, v.row + delta));
        if (nextRow !== v.row) commitMove(selectedId, nextRow, v.col);
      }
    },
    [commitMove, selectedId, solved, vehicles]
  );

  // Keyboard arrow controls for selected car
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (solved || !selectedId) return;
      const v = vehicles.find((item) => item.id === selectedId);
      if (!v) return;
      if (v.orientation === 'h') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nudgeSelected(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nudgeSelected(1);
        }
      } else {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          nudgeSelected(-1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          nudgeSelected(1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nudgeSelected, selectedId, solved, vehicles]);

  // Pointer drag handlers
  const handleVehiclePointerDown = (e: React.PointerEvent, v: Vehicle) => {
    if (solved) return;
    e.stopPropagation();
    setSelectedId(v.id);
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const cellSize = rect.width / GRID_SIZE;
    const { min, max } = getSlideBounds(vehicles, v.id);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragState({
      id: v.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origRow: v.row,
      origCol: v.col,
      minBound: min,
      maxBound: max,
      cellSize,
      previewOffsetPx: 0,
      targetPos: v.orientation === 'h' ? v.col : v.row,
    });
  };

  const handleVehiclePointerMove = (e: React.PointerEvent, v: Vehicle) => {
    if (!dragState || dragState.id !== v.id) return;
    const rawDeltaPx =
      v.orientation === 'h'
        ? e.clientX - dragState.startClientX
        : e.clientY - dragState.startClientY;

    const origPos = v.orientation === 'h' ? dragState.origCol : dragState.origRow;
    const minPx = (dragState.minBound - origPos) * dragState.cellSize;
    const maxPx = (dragState.maxBound - origPos) * dragState.cellSize;
    const clampedPx = Math.max(minPx, Math.min(maxPx, rawDeltaPx));
    const snappedPos = Math.round(origPos + clampedPx / dragState.cellSize);

    setDragState((prev) =>
      prev ? { ...prev, previewOffsetPx: clampedPx, targetPos: snappedPos } : null
    );
  };

  const handleVehiclePointerUp = (v: Vehicle) => {
    if (!dragState || dragState.id !== v.id) return;
    const finalPos = dragState.targetPos;
    const origRow = dragState.origRow;
    const origCol = dragState.origCol;
    setDragState(null);

    if (v.orientation === 'h' && finalPos !== origCol) {
      commitMove(v.id, origRow, finalPos);
    } else if (v.orientation === 'v' && finalPos !== origRow) {
      commitMove(v.id, finalPos, origCol);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setVehicles(prev);
    setHistory((h) => h.slice(0, -1));
    setSolved(false);
    setHint(null);
    playTone('undo');
  };

  const handleShowHint = () => {
    if (solved) return;
    const result = solveRushHourBFS(vehicles);
    if (result) {
      setHint(result);
      setSelectedId(result.vehicleId);
      playTone('hint');
    }
  };

  const handleApplyHint = () => {
    if (!hint || solved) return;
    commitMove(hint.vehicleId, hint.toRow, hint.toCol);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedId) || null;
  const selectedBounds = selectedVehicle
    ? getSlideBounds(vehicles, selectedVehicle.id)
    : { min: 0, max: 0 };

  const earnedStarsCurrent =
    moves <= level.par + 1 ? 3 : moves <= level.par + 4 ? 2 : 1;

  const totalStars = Object.values(levelStars).reduce((acc, s) => acc + s, 0);

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 text-slate-900"
    >
      <ActivityBackground theme="doga" />

      {/* Header */}
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
            <h1 className="text-sm sm:text-base font-black tracking-wide text-rose-400 uppercase whitespace-nowrap">
              {isEn ? 'Traffic Escape' : 'Trafikten Çıkış'}
            </h1>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
              {isEn
                ? 'Slide cars out of the way so the red car reaches the exit'
                : 'Araçları kaydırarak kırmızı arabayı çıkış kapısına ulaştır'}
            </span>
          </div>
        </div>

        {/* Center HUD Stats */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold flex items-center gap-2">
            <span className="text-slate-400">{isEn ? 'Level' : 'Seviye'}</span>
            <span className="text-amber-300 font-black tabular-nums">
              {level.id}/{TRAFFIC_LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold flex items-center gap-2">
            <span className="text-slate-400">{isEn ? 'Moves' : 'Hamle'}</span>
            <span className="text-white font-black tabular-nums">{moves}</span>
            <span className="text-slate-500 hidden sm:inline tabular-nums">
              ({isEn ? 'Goal' : 'Hedef'}: {level.par})
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black tabular-nums">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {totalStars}/{TRAFFIC_LEVELS.length * 3}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShowHint}
            disabled={solved}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
            title={isEn ? 'Show Optimal Hint' : 'İpucu Göster'}
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
            onClick={() => loadLevel(levelIdx)}
            className="h-8 sm:h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
            title={isEn ? 'Reset Level' : 'Sıfırla'}
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

      {/* Main Layout */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-7 p-3 sm:p-5 overflow-hidden">
        {/* Parking Lot Board Stage */}
        <section className="relative flex flex-col items-center justify-center">
          <div className="relative flex items-center">
            {/* Asphalt Parking Board */}
            <div className="relative p-2.5 sm:p-3.5 rounded-[26px] bg-slate-800 border-4 border-slate-900 shadow-[0_16px_38px_rgba(15,23,42,0.38)]">
              {/* Outer warning curb on right except exit row */}
              <div
                ref={boardRef}
                className="relative w-[min(82vw,370px)] sm:w-[min(60vh,430px)] aspect-square bg-slate-700 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-inner touch-none"
              >
                {/* 6x6 Asphalt Grid Cells */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                    const r = Math.floor(idx / GRID_SIZE);
                    const c = idx % GRID_SIZE;
                    const isExitLane = r === EXIT_ROW;
                    return (
                      <div
                        key={idx}
                        className={`border border-slate-600/50 relative ${
                          isExitLane ? 'bg-slate-600/35' : ''
                        }`}
                      >
                        {isExitLane && c === GRID_SIZE - 1 && (
                          <div className="absolute inset-0 flex items-center justify-end pr-1.5 pointer-events-none">
                            <ArrowRight className="w-5 h-5 text-amber-400/80 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hint Target Ghost Highlight */}
                {hint && (() => {
                  const hv = vehicles.find((v) => v.id === hint.vehicleId);
                  if (!hv) return null;
                  const cellPct = 100 / GRID_SIZE;
                  return (
                    <button
                      onClick={handleApplyHint}
                      style={{
                        top: `${hint.toRow * cellPct}%`,
                        left: `${hint.toCol * cellPct}%`,
                        width: `${(hv.orientation === 'h' ? hv.len : 1) * cellPct}%`,
                        height: `${(hv.orientation === 'v' ? hv.len : 1) * cellPct}%`,
                      }}
                      className="absolute z-10 p-1.5 cursor-pointer group"
                      title={isEn ? 'Click to apply hint' : 'İpucunu uygulamak için tıkla'}
                    >
                      <div className="w-full h-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-400/30 animate-pulse flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-amber-100 bg-amber-600/90 px-1.5 py-0.5 rounded-md shadow">
                          {isEn ? 'Move' : 'Buraya'}
                        </span>
                      </div>
                    </button>
                  );
                })()}

                {/* Vehicles Layer */}
                {vehicles.map((v) => {
                  const cellPct = 100 / GRID_SIZE;
                  const isDragging = dragState?.id === v.id;
                  const isSelected = selectedId === v.id;
                  const isHinted = hint?.vehicleId === v.id;
                  const style = COLOR_STYLES[v.color];
                  const tx = isDragging && v.orientation === 'h' ? dragState.previewOffsetPx : 0;
                  const ty = isDragging && v.orientation === 'v' ? dragState.previewOffsetPx : 0;
                  const exitSlide = solved && v.isTarget ? 'translateX(45%)' : `translate(${tx}px, ${ty}px)`;

                  return (
                    <div
                      key={v.id}
                      onPointerDown={(e) => handleVehiclePointerDown(e, v)}
                      onPointerMove={(e) => handleVehiclePointerMove(e, v)}
                      onPointerUp={() => handleVehiclePointerUp(v)}
                      onPointerCancel={() => setDragState(null)}
                      style={{
                        top: `${v.row * cellPct}%`,
                        left: `${v.col * cellPct}%`,
                        width: `${(v.orientation === 'h' ? v.len : 1) * cellPct}%`,
                        height: `${(v.orientation === 'v' ? v.len : 1) * cellPct}%`,
                        transform: exitSlide,
                        transition: isDragging ? 'none' : 'top 160ms ease, left 160ms ease, transform 320ms ease',
                      }}
                      className={`absolute z-20 p-1 sm:p-1.5 touch-none ${
                        v.orientation === 'h' ? 'cursor-ew-resize' : 'cursor-ns-resize'
                      }`}
                    >
                      <div
                        className={`relative w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br ${style.body} border-2 ${style.border} shadow-[0_5px_12px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.45)] flex items-center justify-center ${
                          isSelected ? 'ring-3 ring-white shadow-xl' : ''
                        } ${isHinted ? 'ring-4 ring-amber-300 animate-pulse' : ''}`}
                      >
                        {/* Windshield & Roof Detail */}
                        <div
                          className={`${style.roof} rounded-lg border border-black/15 shadow-inner flex items-center justify-center ${
                            v.orientation === 'h' ? 'w-[58%] h-[68%]' : 'w-[68%] h-[58%]'
                          }`}
                        >
                          {v.isTarget ? (
                            <span className="text-xs sm:text-sm font-black text-white drop-shadow flex items-center gap-0.5">
                              ★
                            </span>
                          ) : (
                            <span className={`text-[11px] font-black opacity-75 ${style.badge}`}>
                              {v.id}
                            </span>
                          )}
                        </div>

                        {/* Headlights on target red car (pointing right toward exit) */}
                        {v.isTarget && (
                          <>
                            <span className="absolute right-0.5 top-2 w-1.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_6px_#fef08a]" />
                            <span className="absolute right-0.5 bottom-2 w-1.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_6px_#fef08a]" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EXIT Gate Sign aligned with Row 2 */}
              <div
                style={{ top: `calc(${((EXIT_ROW + 0.5) / GRID_SIZE) * 100}%)` }}
                className="absolute -right-8 sm:-right-10 -translate-y-1/2 z-30 flex flex-col items-center"
              >
                <div className="px-1.5 py-2.5 rounded-r-xl bg-amber-400 border-2 border-l-0 border-slate-900 shadow-lg flex flex-col items-center gap-0.5">
                  <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span className="text-[9px] font-black text-slate-950 uppercase tracking-tighter [writing-mode:vertical-rl]">
                    {isEn ? 'EXIT' : 'ÇIKIŞ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Solved Overlay Banner */}
          {solved && (
            <div className="mt-3 w-full max-w-[440px] rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-3 shadow-xl border-2 border-white/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Trophy className="w-7 h-7 text-amber-300 shrink-0" />
                <div>
                  <div className="font-black text-sm sm:text-base flex items-center gap-1.5">
                    {isEn ? 'Escaped the Traffic!' : 'Trafikten Kurtuldun!'}
                    <span className="inline-flex">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={15}
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
                    {isEn
                      ? `Completed in ${moves} moves (Goal: ${level.par})`
                      : `${moves} hamlede tamamlandı (Hedef: ${level.par})`}
                  </div>
                </div>
              </div>
              {levelIdx < TRAFFIC_LEVELS.length - 1 ? (
                <button
                  onClick={() => loadLevel(levelIdx + 1)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={15} />
                  {isEn ? 'Next Level' : 'Sonraki Seviye'}
                </button>
              ) : (
                <button
                  onClick={() => loadLevel(0)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition shrink-0 cursor-pointer"
                >
                  {isEn ? 'Play Again' : 'Baştan Oyna'}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Right Side Controls & Level Selector */}
        <aside className="w-full max-w-[440px] lg:w-72 shrink-0 flex flex-col gap-3">
          {/* Touch-Friendly Direction Pad (great for Smartboards) */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-slate-200 p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                {isEn ? 'Slide Selected Car' : 'Seçili Aracı Kaydır'}
              </span>
              {selectedVehicle && (
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-900 text-white">
                  {selectedVehicle.isTarget
                    ? isEn
                      ? 'Red Car ★'
                      : 'Kırmızı Araba ★'
                    : `${isEn ? 'Car' : 'Araç'} ${selectedVehicle.id}`}
                </span>
              )}
            </div>

            {selectedVehicle && (
              <div className="flex items-center justify-center gap-3">
                {selectedVehicle.orientation === 'h' ? (
                  <>
                    <button
                      onClick={() => nudgeSelected(-1)}
                      disabled={solved || selectedVehicle.col <= selectedBounds.min}
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-white font-black text-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                      {isEn ? 'Left' : 'Sola'}
                    </button>
                    <button
                      onClick={() => nudgeSelected(1)}
                      disabled={solved || selectedVehicle.col >= selectedBounds.max}
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-white font-black text-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                    >
                      {isEn ? 'Right' : 'Sağa'}
                      <ArrowRight size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => nudgeSelected(-1)}
                      disabled={solved || selectedVehicle.row <= selectedBounds.min}
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-white font-black text-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                    >
                      <ArrowUp size={18} />
                      {isEn ? 'Up' : 'Yukarı'}
                    </button>
                    <button
                      onClick={() => nudgeSelected(1)}
                      disabled={solved || selectedVehicle.row >= selectedBounds.max}
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-white font-black text-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                    >
                      <ArrowDown size={18} />
                      {isEn ? 'Down' : 'Aşağı'}
                    </button>
                  </>
                )}
              </div>
            )}

            <p className="mt-2 text-[11px] font-medium text-slate-500 text-center">
              {isEn
                ? 'Drag any vehicle directly on the road, or tap a car and use the buttons.'
                : 'Araçları doğrudan sürükleyebilir veya dokunup yön tuşlarıyla kaydırabilirsin.'}
            </p>
          </div>

          {/* 12 Levels Grid */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-slate-200 p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                {isEn ? 'Levels (Easy → Hard)' : 'Seviyeler (Kolay → Zor)'}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {level.difficulty === 'easy'
                  ? isEn
                    ? 'Easy'
                    : 'Kolay'
                  : level.difficulty === 'medium'
                    ? isEn
                      ? 'Medium'
                      : 'Orta'
                    : isEn
                      ? 'Hard'
                      : 'Zor'}
              </span>
            </div>
            <div className="grid grid-cols-6 lg:grid-cols-4 gap-1.5">
              {TRAFFIC_LEVELS.map((lvl, idx) => {
                const stars = levelStars[lvl.id] || 0;
                const active = idx === levelIdx;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => loadLevel(idx)}
                    className={`py-1.5 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition cursor-pointer ${
                      active
                        ? 'bg-rose-600 border-rose-800 text-white shadow-md scale-105'
                        : stars > 0
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black tabular-nums leading-tight">
                      {lvl.id}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={8}
                          className={
                            s <= stars
                              ? active
                                ? 'fill-amber-300 text-amber-300'
                                : 'fill-amber-400 text-amber-400'
                              : active
                                ? 'text-white/35'
                                : 'text-slate-300'
                          }
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default TrafiktenCikisGame;
