import React from 'react';
import type { QuizVisualQuestion } from '../data/bilsemActivitiesData';

type Dir = 'U' | 'D' | 'L' | 'R';

const ARROW_CHAR: Record<Dir, string> = {
  U: '↑',
  D: '↓',
  L: '←',
  R: '→',
};

const ArrowBadgeRow: React.FC<{
  arrows: Dir[];
  color?: string;
  compact?: boolean;
}> = ({ arrows, color = '#16a34a', compact = false }) => (
  <div className={`flex flex-wrap items-center justify-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
    {arrows.map((dir, i) => (
      <span
        key={i}
        style={{ backgroundColor: color }}
        className={`${
          compact ? 'w-6 h-6 text-sm rounded-md' : 'w-8 h-8 text-base rounded-lg'
        } text-white font-black inline-flex items-center justify-center shadow-sm border border-black/15`}
      >
        {ARROW_CHAR[dir] || dir}
      </span>
    ))}
  </div>
);

const FruitGlyphSVG: React.FC<{ kind: string; size?: number }> = ({ kind, size = 32 }) => {
  switch (kind) {
    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 11 C15 8, 7 11, 8 21 C9 30, 15 35, 20 33 C25 35, 31 30, 32 21 C33 11, 25 8, 20 11 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />
          <path d="M20 11 C20 7, 22 5, 24 4" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M20 9 C24 5, 29 6, 28 10 C25 11, 22 11, 20 9 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
          <ellipse cx="14" cy="18" rx="2.3" ry="4" fill="#fca5a5" opacity="0.7" />
        </svg>
      );
    case 'pear':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 10 C16 10, 15 15, 13 19 C10 23, 10 33, 20 34 C30 33, 30 23, 27 19 C25 15, 24 10, 20 10 Z" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1.8" />
          <path d="M20 10 C20 6, 22 5, 23 4" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M20 8 C24 5, 28 6, 27 9 C25 10, 22 10, 20 8 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
          <ellipse cx="15" cy="24" rx="2" ry="3.6" fill="#ecfccb" opacity="0.7" />
        </svg>
      );
    case 'orange':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="22" r="12" fill="#f97316" stroke="#9a3412" strokeWidth="1.8" />
          <path d="M20 10 C20 7, 21 5, 22 4" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M20 9 C24 6, 29 7, 27 11 C24 12, 21 11, 20 9 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
          <circle cx="15" cy="18" r="2.2" fill="#fed7aa" opacity="0.75" />
          <circle cx="24" cy="26" r="0.9" fill="#c2410c" />
          <circle cx="26" cy="22" r="0.9" fill="#c2410c" />
          <circle cx="22" cy="28" r="0.9" fill="#c2410c" />
        </svg>
      );
    case 'strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M11 16 C11 11, 29 11, 29 16 C29 24, 24 34, 20 35 C16 34, 11 24, 11 16 Z" fill="#e11d48" stroke="#881337" strokeWidth="1.8" />
          <path d="M12 13 L17 15 L20 10 L23 15 L28 13 L24 17 L16 17 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="16" cy="21" r="1.1" fill="#fef08a" />
          <circle cx="20" cy="23" r="1.1" fill="#fef08a" />
          <circle cx="24" cy="21" r="1.1" fill="#fef08a" />
          <circle cx="18" cy="28" r="1.1" fill="#fef08a" />
          <circle cx="22" cy="28" r="1.1" fill="#fef08a" />
        </svg>
      );
    case 'lemon':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M7 22 C10 12, 30 12, 33 22 C30 31, 10 31, 7 22 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.8" />
          <circle cx="7" cy="22" r="2.2" fill="#facc15" stroke="#a16207" strokeWidth="1.4" />
          <circle cx="33" cy="22" r="2.2" fill="#facc15" stroke="#a16207" strokeWidth="1.4" />
          <ellipse cx="16" cy="18" rx="4" ry="1.8" fill="#fef9c3" opacity="0.8" />
        </svg>
      );
    case 'plum':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="22" rx="11" ry="12" fill="#7c3aed" stroke="#4c1d95" strokeWidth="1.8" />
          <path d="M20 10 C19 16, 19 26, 20 34" stroke="#5b21b6" strokeWidth="1.4" fill="none" />
          <path d="M20 10 C20 7, 22 5, 24 4" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="15" cy="18" rx="2.1" ry="3.8" fill="#ddd6fe" opacity="0.7" />
        </svg>
      );
  }
};

const shadeHex = (hex: string, factor: number): string => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) * factor)));
  return `rgb(${r},${g},${b})`;
};

const IsometricColoredTowerSVG: React.FC<{
  grid: ({ h: number; color: string } | null)[][];
}> = ({ grid }) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const tileW = 36;
  const tileH = 19;
  const unitZ = 16;

  const blocks: { r: number; c: number; h: number; color: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell && cell.h > 0) blocks.push({ r, c, h: cell.h, color: cell.color });
    }
  }
  blocks.sort((a, b) => a.r + a.c - (b.r + b.c) || a.r - b.r);

  const originX = 115;
  const originY = 98;

  const iso = (r: number, c: number, z: number): [number, number] => {
    const x = originX + (c - r) * (tileW / 2);
    const y = originY + (c + r) * (tileH / 2) - z * unitZ;
    return [x, y];
  };

  return (
    <svg viewBox="0 0 230 175" className="w-48 h-36 sm:w-56 sm:h-44">
      {blocks.map((b, idx) => {
        const zTop = b.h;
        const p0 = iso(b.r, b.c, zTop);
        const p1 = iso(b.r, b.c + 1, zTop);
        const p2 = iso(b.r + 1, b.c + 1, zTop);
        const p3 = iso(b.r + 1, b.c, zTop);

        const b1 = iso(b.r, b.c + 1, 0);
        const b2 = iso(b.r + 1, b.c + 1, 0);
        const b3 = iso(b.r + 1, b.c, 0);

        const pts = (arr: [number, number][]) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
        return (
          <g key={idx}>
            <polygon points={pts([p3, p2, b2, b3])} fill={shadeHex(b.color, 0.82)} stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round" />
            <polygon points={pts([p2, p1, b1, b2])} fill={shadeHex(b.color, 0.65)} stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round" />
            <polygon points={pts([p0, p1, p2, p3])} fill={b.color} stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

const IsometricColoredCubeSVG: React.FC<{ top: string; left: string; right: string }> = ({
  top,
  left,
  right,
}) => (
  <svg viewBox="0 0 96 96" className="w-16 h-16 sm:w-20 sm:h-20">
    {/* Top face */}
    <polygon points="48,12 82,30 48,48 14,30" fill={top} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Left face */}
    <polygon points="14,30 48,48 48,84 14,66" fill={left} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Right face */}
    <polygon points="82,30 48,48 48,84 82,66" fill={right} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

const HalfSymmetrySVG: React.FC<{
  kind: string;
  color1: string;
  color2: string;
  rot?: number;
  sizeClass?: string;
}> = ({ kind, color1, color2, rot = 0, sizeClass = 'w-16 h-16 sm:w-20 sm:h-20' }) => {
  let upperPath = 'M50,12 L16,50 L50,50 Z';
  let lowerPath = 'M50,50 L16,50 L50,88 Z';

  if (kind === 'chevron') {
    upperPath = 'M72,14 L24,50 L46,50 L72,30 Z';
    lowerPath = 'M24,50 L72,86 L72,70 L46,50 Z';
  } else if (kind === 'diamond_wing') {
    upperPath = 'M72,14 L22,40 L36,50 L72,50 Z';
    lowerPath = 'M72,50 L36,50 L22,60 L72,86 Z';
  } else if (kind === 'bracket_step') {
    upperPath = 'M72,14 L32,14 L32,32 L18,32 L18,50 L72,50 Z';
    lowerPath = 'M72,50 L18,50 L18,68 L32,68 L32,86 L72,86 Z';
  } else if (kind === 'arrow_half') {
    upperPath = 'M74,16 L36,16 L18,50 L74,50 Z';
    lowerPath = 'M74,50 L18,50 L36,84 L74,84 Z';
  } else if (kind === 'crown_half') {
    upperPath = 'M72,16 L46,34 L22,22 L28,50 L72,50 Z';
    lowerPath = 'M72,50 L28,50 L22,78 L46,66 L72,84 Z';
  }

  return (
    <svg viewBox="0 0 100 100" className={sizeClass}>
      <g transform={`rotate(${rot} 50 50)`}>
        <path d={upperPath} fill={color1} stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
        <path d={lowerPath} fill={color2} stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const DOMINO_PIP_POS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

const DominoFaceSVG: React.FC<{ pips: number; sizeClass?: string }> = ({
  pips,
  sizeClass = 'w-14 h-14 sm:w-16 sm:h-16',
}) => {
  const pts = DOMINO_PIP_POS[pips] || [];
  return (
    <svg viewBox="0 0 100 100" className={sizeClass}>
      <rect x="6" y="6" width="88" height="88" rx="14" fill="#ffffff" stroke="#0f172a" strokeWidth="5" />
      {pts.map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="9" fill="#0f172a" />
      ))}
    </svg>
  );
};

const FlashObjectSVG: React.FC<{ spec: Record<string, any>; sizeClass?: string }> = ({
  spec,
  sizeClass = 'w-20 h-20 sm:w-24 sm:h-24',
}) => {
  if (!spec) return null;
  switch (spec.kind) {
    case 'iced_cup': {
      const dotCount = spec.dots || 3;
      const strawX = spec.strawDir === 'left' ? 32 : 68;
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          <path
            d={`M50,30 L${strawX},8`}
            stroke={spec.strawColor || '#ef4444'}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M26,34 C26,18 74,18 74,34 Z" fill={spec.lidColor || '#fde68a'} stroke="#0f172a" strokeWidth="2.5" />
          <polygon points="24,34 76,34 68,88 32,88" fill={spec.cupColor || '#fb923c'} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="27" y="48" width="46" height="14" rx="3" fill={spec.bandColor || '#ffffff'} stroke="#0f172a" strokeWidth="1.8" />
          {Array.from({ length: dotCount }).map((_, idx) => {
            const spacing = 30 / Math.max(1, dotCount - 1);
            const cx = dotCount === 1 ? 50 : 35 + idx * spacing;
            return <circle key={idx} cx={cx} cy={76} r="4.5" fill={spec.dotColor || '#78350f'} />;
          })}
        </svg>
      );
    }
    case 'backpack': {
      const pocketX = spec.sidePocket === 'left' ? 12 : 76;
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          <path d="M38,24 C38,10 62,10 62,24" fill="none" stroke={spec.strapColor || '#334155'} strokeWidth="5" strokeLinecap="round" />
          <rect x={pocketX} y="54" width="12" height="24" rx="5" fill={spec.pocketColor || '#fbbf24'} stroke="#0f172a" strokeWidth="2.2" />
          <rect x="22" y="22" width="56" height="66" rx="18" fill={spec.bodyColor || '#38bdf8'} stroke="#0f172a" strokeWidth="2.5" />
          <rect x="30" y="54" width="40" height="24" rx="8" fill={spec.pocketColor || '#fbbf24'} stroke="#0f172a" strokeWidth="2.2" />
          {spec.badge === 'star' ? (
            <polygon points="50,30 53,38 62,38 55,43 57,51 50,46 43,51 45,43 38,38 47,38" fill={spec.badgeColor || '#fef08a'} stroke="#0f172a" strokeWidth="1.8" />
          ) : (
            <circle cx="50" cy="40" r="9" fill={spec.badgeColor || '#fef08a'} stroke="#0f172a" strokeWidth="2" />
          )}
        </svg>
      );
    }
    case 'cake': {
      const candles = spec.candles || 3;
      const startX = 50 - ((candles - 1) * 14) / 2;
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          {Array.from({ length: candles }).map((_, idx) => {
            const cx = startX + idx * 14;
            return (
              <g key={idx}>
                <rect x={cx - 3} y="20" width="6" height="20" rx="2" fill={spec.candleColor || '#38bdf8'} stroke="#0f172a" strokeWidth="1.6" />
                <ellipse cx={cx} cy="15" rx="3.5" ry="5" fill="#facc15" stroke="#ea580c" strokeWidth="1.2" />
              </g>
            );
          })}
          <rect x="24" y="40" width="52" height="22" rx="6" fill={spec.topColor || '#fda4af'} stroke="#0f172a" strokeWidth="2.4" />
          <rect x="16" y="62" width="68" height="24" rx="6" fill={spec.bottomColor || '#92400e'} stroke="#0f172a" strokeWidth="2.4" />
          {spec.topping === 'cherry' ? (
            <>
              <circle cx="34" cy="48" r="4" fill="#e11d48" />
              <circle cx="50" cy="48" r="4" fill="#e11d48" />
              <circle cx="66" cy="48" r="4" fill="#e11d48" />
            </>
          ) : (
            <path d="M24,52 Q32,44 40,52 T56,52 T72,52" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
          )}
        </svg>
      );
    }
    case 'house': {
      const chimneyX = spec.chimney === 'left' ? 24 : 64;
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          <rect x={chimneyX} y="16" width="12" height="24" rx="2" fill={spec.chimneyColor || '#64748b'} stroke="#0f172a" strokeWidth="2" />
          <polygon points="14,48 50,16 86,48" fill={spec.roofColor || '#ef4444'} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
          {spec.atticWindow && (
            <circle cx="50" cy="36" r="6" fill={spec.winColor || '#38bdf8'} stroke="#0f172a" strokeWidth="1.8" />
          )}
          <rect x="22" y="48" width="56" height="40" rx="3" fill={spec.wallColor || '#fde68a'} stroke="#0f172a" strokeWidth="2.5" />
          <rect x="42" y="62" width="16" height="26" rx="2" fill={spec.doorColor || '#92400e'} stroke="#0f172a" strokeWidth="2" />
          <rect x="28" y="56" width="10" height="10" rx="1.5" fill={spec.winColor || '#38bdf8'} stroke="#0f172a" strokeWidth="1.6" />
          <rect x="62" y="56" width="10" height="10" rx="1.5" fill={spec.winColor || '#38bdf8'} stroke="#0f172a" strokeWidth="1.6" />
        </svg>
      );
    }
    case 'robot': {
      const antXs = spec.antennas === 2 ? [38, 62] : [50];
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          {antXs.map((ax, idx) => (
            <g key={idx}>
              <line x1={ax} y1="24" x2={ax} y2="12" stroke="#0f172a" strokeWidth="3" />
              <circle cx={ax} cy="10" r="4" fill={spec.accentColor || '#fbbf24'} stroke="#0f172a" strokeWidth="1.6" />
            </g>
          ))}
          <rect x="26" y="24" width="48" height="30" rx="8" fill={spec.headColor || '#38bdf8'} stroke="#0f172a" strokeWidth="2.4" />
          {spec.eyeShape === 'square' ? (
            <>
              <rect x="34" y="33" width="10" height="10" rx="1.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <rect x="56" y="33" width="10" height="10" rx="1.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            </>
          ) : (
            <>
              <circle cx="39" cy="38" r="5.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <circle cx="61" cy="38" r="5.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            </>
          )}
          <rect x="30" y="56" width="40" height="30" rx="7" fill={spec.bodyColor || '#0284c7'} stroke="#0f172a" strokeWidth="2.4" />
          <circle cx="50" cy="71" r="6" fill={spec.btnColor || '#f43f5e'} stroke="#0f172a" strokeWidth="1.8" />
        </svg>
      );
    }
    case 'clock':
    default: {
      const hRad = ((spec.hourAngle ?? 0) * Math.PI) / 180;
      const mRad = ((spec.minuteAngle ?? -90) * Math.PI) / 180;
      return (
        <svg viewBox="0 0 100 100" className={sizeClass}>
          {spec.hasBells && (
            <>
              <circle cx="25" cy="24" r="10" fill={spec.bellColor || '#f59e0b'} stroke="#0f172a" strokeWidth="2.2" />
              <circle cx="75" cy="24" r="10" fill={spec.bellColor || '#f59e0b'} stroke="#0f172a" strokeWidth="2.2" />
            </>
          )}
          <circle cx="50" cy="54" r="32" fill={spec.rimColor || '#38bdf8'} stroke="#0f172a" strokeWidth="2.6" />
          <circle cx="50" cy="54" r="24" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="50" y1="54" x2={50 + Math.cos(hRad) * 12} y2={54 + Math.sin(hRad) * 12} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="54" x2={50 + Math.cos(mRad) * 18} y2={54 + Math.sin(mRad) * 18} stroke={spec.handColor || '#dc2626'} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="50" cy="54" r="3" fill="#0f172a" />
        </svg>
      );
    }
  }
};

const PolyominoSVG: React.FC<{
  cells: { r: number; c: number; color?: string; dot?: boolean }[];
  fill?: string;
  sizeClass?: string;
}> = ({ cells, fill = '#60a5fa', sizeClass = 'w-20 h-20 sm:w-24 sm:h-24' }) => {
  if (!cells || cells.length === 0) return null;
  const maxR = Math.max(...cells.map((x) => x.r)) + 1;
  const maxC = Math.max(...cells.map((x) => x.c)) + 1;
  const step = 22;
  const pad = 8;
  const vbW = maxC * step + pad * 2;
  const vbH = maxR * step + pad * 2;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={sizeClass}>
      {cells.map((cell, idx) => (
        <g key={idx}>
          <rect
            x={pad + cell.c * step}
            y={pad + cell.r * step}
            width={step}
            height={step}
            rx="3"
            fill={cell.color || fill}
            stroke="#0f172a"
            strokeWidth="2"
          />
          {cell.dot && (
            <circle
              cx={pad + cell.c * step + step / 2}
              cy={pad + cell.r * step + step / 2}
              r="5"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export const BilsemSampleQuestionVisual: React.FC<{
  question: QuizVisualQuestion;
  flashPhase?: 'memorize' | 'answer';
}> = ({ question, flashPhase }) => {
  const { visualType, visualData } = question;
  if (!visualData) return null;

  if (visualType === 'grid_path_encode') {
    const {
      rows = 5,
      cols = 7,
      start = [2, 3],
      givenCells = [],
      targetCells = [],
      givenArrows = [],
      givenColor = '#fbbf24',
      targetColor = '#f87171',
    } = visualData;
    const givenSet = new Set(givenCells.map(([r, c]: [number, number]) => `${r},${c}`));
    const targetSet = new Set(targetCells.map(([r, c]: [number, number]) => `${r},${c}`));

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div
          className="grid gap-1 p-2 rounded-xl bg-white border-2 border-slate-300 shadow-sm"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const k = `${r},${c}`;
            const isStart = r === start[0] && c === start[1];
            const bg = givenSet.has(k) ? givenColor : targetSet.has(k) ? targetColor : '#f8fafc';
            return (
              <div
                key={i}
                style={{ backgroundColor: bg }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-slate-300 flex items-center justify-center"
              >
                {isStart && <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-800 shadow-sm" />}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="w-4 h-4 rounded border border-slate-400" style={{ backgroundColor: givenColor }} />
          <span className="text-xs font-bold text-slate-600">=</span>
          <ArrowBadgeRow arrows={givenArrows} color={givenColor} compact={true} />
        </div>
      </div>
    );
  }

  if (visualType === 'grid_path_x') {
    const { rows = 5, cols = 7, start = [2, 3], arrows = [] } = visualData;
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <ArrowBadgeRow arrows={arrows} color="#16a34a" />
        <div
          className="grid gap-1 p-2 rounded-xl bg-white border-2 border-slate-300 shadow-sm"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const isStart = r === start[0] && c === start[1];
            return (
              <div
                key={i}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-slate-300 bg-slate-50 flex items-center justify-center"
              >
                {isStart && <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-800" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (visualType === 'fruit_equation') {
    const { eq1Left = [], eq1Right = [], eq2Left = [] } = visualData;
    return (
      <div className="flex flex-col items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 flex-wrap w-full pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {eq1Left.map((f: string, idx: number) => (
              <FruitGlyphSVG key={idx} kind={f} size={32} />
            ))}
          </div>
          <span className="text-xl font-black text-slate-700">=</span>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {eq1Right.map((f: string, idx: number) => (
              <FruitGlyphSVG key={idx} kind={f} size={32} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2.5 flex-wrap w-full">
          <div className="flex items-center gap-1 flex-wrap justify-center max-w-[190px]">
            {eq2Left.map((f: string, idx: number) => (
              <FruitGlyphSVG key={idx} kind={f} size={32} />
            ))}
          </div>
          <span className="text-xl font-black text-slate-700">=</span>
          <div className="w-11 h-11 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 flex items-center justify-center text-xl font-black text-amber-600">
            ?
          </div>
        </div>
      </div>
    );
  }

  if (visualType === 'letter_strip') {
    const cells: (string | null)[] = visualData.cells || [];
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {cells.map((ch, idx) => (
          <div
            key={idx}
            className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg border-2 flex items-center justify-center font-black text-lg ${
              ch === null
                ? 'border-dashed border-amber-500 bg-amber-50 text-amber-600'
                : 'border-slate-700 bg-sky-50 text-slate-900'
            }`}
          >
            {ch ?? '?'}
          </div>
        ))}
      </div>
    );
  }

  if (visualType === 'colored_tower_top') {
    return (
      <div className="flex items-center justify-center bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
        <IsometricColoredTowerSVG grid={visualData.grid || []} />
      </div>
    );
  }

  if (visualType === 'colored_cube_net') {
    const f = visualData.faces || {};
    const layout: (string | null)[][] = [
      [null, f.top, null],
      [f.left, f.center, f.right],
      [null, f.bottom, null],
      [null, f.tail, null],
    ];
    return (
      <div className="inline-grid grid-cols-3 gap-1 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {layout.flat().map((color, idx) =>
          color ? (
            <div
              key={idx}
              style={{ backgroundColor: color }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border-2 border-slate-900 shadow-inner"
            />
          ) : (
            <div key={idx} className="w-9 h-9 sm:w-10 sm:h-10" />
          )
        )}
      </div>
    );
  }

  if (visualType === 'grid_mirror') {
    const { rows = 5, cols = 6, axis = 'vertical', cells = [], color = '#fde047' } = visualData;
    const cellSet = new Set(cells.map(([r, c]: [number, number]) => `${r},${c}`));
    return (
      <div className="relative inline-block p-2 rounded-xl bg-white border-2 border-slate-300 shadow-sm">
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const filled = cellSet.has(`${r},${c}`);
            return (
              <div
                key={i}
                style={{ backgroundColor: filled ? color : '#f8fafc' }}
                className="w-6 h-6 sm:w-7 sm:h-7 border border-slate-300 rounded-[3px]"
              />
            );
          })}
        </div>
        {axis === 'vertical' ? (
          <div className="pointer-events-none absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-1 bg-rose-500 rounded-full" />
        ) : (
          <div className="pointer-events-none absolute left-1 right-1 top-1/2 -translate-y-1/2 h-1 bg-rose-500 rounded-full" />
        )}
      </div>
    );
  }

  if (visualType === 'color_digit_cipher') {
    const { legend = [], targetColors = [] } = visualData;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pr-0 sm:pr-4 sm:border-r border-slate-200">
          {legend.map((item: { color: string; digit: string }, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span
                style={{ backgroundColor: item.color }}
                className="w-8 h-8 rounded-full border-2 border-slate-900 shadow-sm"
              />
              <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 font-black text-slate-900 flex items-center justify-center">
                {item.digit}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {targetColors.map((col: string, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span
                style={{ backgroundColor: col }}
                className="w-8 h-8 rounded-full border-2 border-slate-900 shadow-sm"
              />
              <span className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-dashed border-amber-500 font-black text-amber-600 flex items-center justify-center">
                ?
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visualType === 'grid_cutout') {
    const { size = 5, holes = [], color = '#dc2626' } = visualData;
    const holeSet = new Set(holes.map(([r, c]: [number, number]) => `${r},${c}`));
    return (
      <div
        className="inline-grid gap-0.5 p-2 rounded-xl bg-white border-2 border-slate-800 shadow-sm"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          const isHole = holeSet.has(`${r},${c}`);
          return (
            <div
              key={i}
              style={{ backgroundColor: isHole ? '#ffffff' : color }}
              className="w-7 h-7 sm:w-8 sm:h-8 border border-slate-900/40 rounded-[2px]"
            />
          );
        })}
      </div>
    );
  }

  if (visualType === 'half_symmetry') {
    const { kind, color1, color2, leftRot = 0 } = visualData;
    return (
      <div className="flex items-center justify-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <HalfSymmetrySVG kind={kind} color1={color1} color2={color2} rot={leftRot} sizeClass="w-20 h-20" />
        <div className="w-1 h-20 bg-rose-500 rounded-full" />
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 flex items-center justify-center text-3xl font-black text-amber-600">
          ?
        </div>
      </div>
    );
  }

  if (visualType === 'domino_sum') {
    const { targetSum, leftPips } = visualData;
    return (
      <div className="flex flex-col items-center gap-2.5 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-4 py-1 rounded-full bg-indigo-600 text-white font-black text-xl shadow">
          {targetSum}
        </div>
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900 shadow-md">
          <DominoFaceSVG pips={leftPips} sizeClass="w-16 h-16" />
          <div className="w-16 h-16 rounded-xl bg-amber-50 border-2 border-dashed border-amber-400 flex items-center justify-center text-2xl font-black text-amber-600">
            ?
          </div>
        </div>
      </div>
    );
  }

  if (visualType === 'flash_memory') {
    const isMemorize = flashPhase === 'memorize';
    if (!isMemorize) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-300 text-indigo-700 font-bold text-sm">
          <span className="text-3xl mb-1">🧠</span>
          <span>Aklında tuttuğun görseli/sırayı aşağıdan seç!</span>
        </div>
      );
    }
    if (visualData.subType === 'sequence' && Array.isArray(visualData.sequence)) {
      return (
        <div className="flex items-center justify-center gap-2 bg-white px-5 py-4 rounded-2xl border-2 border-indigo-400 shadow-md">
          {visualData.sequence.map((item: string, idx: number) => (
            <span
              key={idx}
              className="w-12 h-14 rounded-xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center bg-white px-6 py-3 rounded-2xl border-2 border-indigo-400 shadow-md">
        <FlashObjectSVG spec={visualData.objectSpec} sizeClass="w-28 h-28" />
      </div>
    );
  }

  if (visualType === 'rotate_poly') {
    return (
      <div className="flex items-center justify-center bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <PolyominoSVG cells={visualData.cells || []} fill={visualData.fill} sizeClass="w-24 h-24 sm:w-28 sm:h-28" />
      </div>
    );
  }

  if (visualType === 'odd_poly_rotate') {
    return (
      <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs sm:text-sm font-bold text-center">
        3 şekil döndürülmüş aynı parçadır — farklı (ters çevrilmiş) olanı seç!
      </div>
    );
  }

  return null;
};

export const BilsemSampleOptionVisual: React.FC<{
  question: QuizVisualQuestion;
  visual: any;
}> = ({ question, visual }) => {
  if (!visual) return null;
  const { visualType } = question;

  if (visualType === 'grid_path_encode' && Array.isArray(visual.arrows)) {
    return <ArrowBadgeRow arrows={visual.arrows} color={question.visualData?.targetColor || '#f87171'} compact={true} />;
  }

  if (visualType === 'grid_path_x') {
    const { rows = 5, cols = 7, start = [2, 3], target = [0, 0] } = visual;
    return (
      <div
        className="grid gap-[2px] p-1 rounded-lg bg-white border border-slate-300"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const isStart = r === start[0] && c === start[1];
          const isTarget = r === target[0] && c === target[1];
          return (
            <div
              key={i}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-200 bg-slate-50 flex items-center justify-center text-[9px] font-black"
            >
              {isStart && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              {isTarget && <span className="text-rose-600 leading-none">✕</span>}
            </div>
          );
        })}
      </div>
    );
  }

  if (visualType === 'fruit_equation' && Array.isArray(visual.items)) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[170px]">
        {visual.items.map((f: string, idx: number) => (
          <FruitGlyphSVG key={idx} kind={f} size={28} />
        ))}
      </div>
    );
  }

  if (visualType === 'colored_tower_top' && Array.isArray(visual.grid)) {
    const grid: (string | null)[][] = visual.grid;
    const cols = grid[0]?.length || 3;
    return (
      <div
        className="grid gap-1 p-1.5 rounded-lg bg-slate-50 border border-slate-300"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((color, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: color || 'transparent' }}
            className={`w-6 h-6 rounded ${color ? 'border-2 border-slate-900' : 'border border-dashed border-slate-200'}`}
          />
        ))}
      </div>
    );
  }

  if (visualType === 'colored_cube_net') {
    return <IsometricColoredCubeSVG top={visual.top} left={visual.left} right={visual.right} />;
  }

  if (visualType === 'grid_mirror') {
    const { rows = 5, cols = 6, axis = 'vertical', cells = [], color = '#fde047' } = visual;
    const cellSet = new Set(cells.map(([r, c]: [number, number]) => `${r},${c}`));
    return (
      <div className="relative inline-block p-1 rounded-lg bg-white border border-slate-300">
        <div
          className="grid gap-[1px]"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const filled = cellSet.has(`${r},${c}`);
            return (
              <div
                key={i}
                style={{ backgroundColor: filled ? color : '#f8fafc' }}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-200"
              />
            );
          })}
        </div>
        {axis === 'vertical' ? (
          <div className="pointer-events-none absolute top-0.5 bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 bg-rose-500" />
        ) : (
          <div className="pointer-events-none absolute left-0.5 right-0.5 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500" />
        )}
      </div>
    );
  }

  if (visualType === 'color_digit_cipher' && Array.isArray(visual.digits)) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        {visual.digits.map((d: string, idx: number) => (
          <span
            key={idx}
            className="w-8 h-9 rounded-lg bg-slate-100 border-2 border-slate-700 font-black text-base text-slate-900 flex items-center justify-center"
          >
            {d}
          </span>
        ))}
      </div>
    );
  }

  if (visualType === 'grid_cutout' && Array.isArray(visual.cells)) {
    const cells: [number, number][] = visual.cells;
    const maxR = Math.max(...cells.map(([r]) => r)) + 1;
    const maxC = Math.max(...cells.map(([, c]) => c)) + 1;
    const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));
    return (
      <div
        className="inline-grid gap-[2px] p-1"
        style={{ gridTemplateColumns: `repeat(${maxC}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: maxR * maxC }).map((_, i) => {
          const r = Math.floor(i / maxC);
          const c = i % maxC;
          const active = cellSet.has(`${r},${c}`);
          return (
            <div
              key={i}
              style={{ backgroundColor: active ? visual.color || '#dc2626' : 'transparent' }}
              className={`w-5 h-5 rounded-[2px] ${active ? 'border border-slate-900' : ''}`}
            />
          );
        })}
      </div>
    );
  }

  if (visualType === 'half_symmetry') {
    return (
      <HalfSymmetrySVG
        kind={visual.kind}
        color1={visual.color1}
        color2={visual.color2}
        rot={visual.rot || 0}
        sizeClass="w-16 h-16"
      />
    );
  }

  if (visualType === 'domino_sum') {
    return <DominoFaceSVG pips={visual.pips} sizeClass="w-14 h-14" />;
  }

  if (visualType === 'flash_memory') {
    if (Array.isArray(visual.sequence)) {
      return (
        <div className="flex items-center justify-center gap-1">
          {visual.sequence.map((item: string, idx: number) => (
            <span
              key={idx}
              className="w-8 h-9 rounded-lg bg-indigo-50 border-2 border-indigo-400 font-black text-base text-indigo-900 flex items-center justify-center"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
    if (visual.objectSpec) {
      return <FlashObjectSVG spec={visual.objectSpec} sizeClass="w-16 h-16 sm:w-20 sm:h-20" />;
    }
  }

  if (visualType === 'rotate_poly' || visualType === 'odd_poly_rotate') {
    return (
      <PolyominoSVG
        cells={visual.cells || []}
        fill={visual.fill}
        sizeClass="w-16 h-16 sm:w-20 sm:h-20"
      />
    );
  }

  return null;
};
