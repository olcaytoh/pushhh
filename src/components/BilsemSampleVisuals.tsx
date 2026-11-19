import React from 'react';
import { QuizVisualQuestion } from '../data/bilsemActivitiesData';

// ============================================================================
// ORTAK YARDIMCILAR
// ============================================================================
const ARROW_CHAR: Record<string, string> = {
  U: '↑',
  D: '↓',
  L: '←',
  R: '→',
};

const renderFruitIcon = (fruit: string, size = 28, key?: React.Key) => {
  return (
    <svg key={key} width={size} height={size} viewBox="0 0 40 40" className="shrink-0 drop-shadow-xs">
      {fruit === 'apple' && (
        <g>
          <path d="M20,10 C19,6 22,4 25,4" fill="none" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="24.5" cy="7.5" rx="4.5" ry="2.5" fill="#22c55e" transform="rotate(-22 24.5 7.5)" stroke="#14532d" strokeWidth="1" />
          <path
            d="M20,12 C13,9 6,14 7,23 C8,31 14,36 18,35 C19.5,34.6 20.5,34.6 22,35 C26,36 32,31 33,23 C34,14 27,9 20,12 Z"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="1.8"
          />
          <ellipse cx="14" cy="19" rx="2.5" ry="5" fill="#fca5a5" opacity="0.55" transform="rotate(-15 14 19)" />
        </g>
      )}
      {fruit === 'pear' && (
        <g>
          <path d="M20,8 C20,5 22,3.5 24,3.5" fill="none" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="24" cy="7" rx="4" ry="2.2" fill="#16a34a" transform="rotate(-18 24 7)" stroke="#14532d" strokeWidth="1" />
          <path
            d="M20,8 C15,8 14,15 12,20 C9.5,25 9,34 20,35.5 C31,34 30.5,25 28,20 C26,15 25,8 20,8 Z"
            fill="#84cc16"
            stroke="#3f6212"
            strokeWidth="1.8"
          />
          <ellipse cx="15" cy="25" rx="2.2" ry="4.5" fill="#ecfccb" opacity="0.6" transform="rotate(-12 15 25)" />
        </g>
      )}
      {fruit === 'orange' && (
        <g>
          <path d="M20,9 L20,4" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="24" cy="7" rx="4.5" ry="2.4" fill="#22c55e" transform="rotate(-15 24 7)" stroke="#14532d" strokeWidth="1" />
          <circle cx="20" cy="22" r="13" fill="#f97316" stroke="#9a3412" strokeWidth="1.8" />
          <circle cx="15" cy="18" r="2.2" fill="#fed7aa" opacity="0.7" />
          <circle cx="25" cy="25" r="1.2" fill="#c2410c" opacity="0.5" />
          <circle cx="22" cy="28" r="1.2" fill="#c2410c" opacity="0.5" />
        </g>
      )}
      {fruit === 'strawberry' && (
        <g>
          <path d="M12,13 L20,8 L28,13 L24,15 L20,12 L16,15 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
          <path
            d="M10,15 C10,12 30,12 30,15 C30,25 23,35 20,36 C17,35 10,25 10,15 Z"
            fill="#f43f5e"
            stroke="#881337"
            strokeWidth="1.8"
          />
          <circle cx="16" cy="20" r="1.3" fill="#fef08a" />
          <circle cx="24" cy="20" r="1.3" fill="#fef08a" />
          <circle cx="20" cy="25" r="1.3" fill="#fef08a" />
          <circle cx="17" cy="29" r="1.2" fill="#fef08a" />
          <circle cx="23" cy="29" r="1.2" fill="#fef08a" />
        </g>
      )}
      {fruit === 'lemon' && (
        <g>
          <path d="M20,9 L20,5" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="24" cy="7.5" rx="4" ry="2" fill="#22c55e" transform="rotate(-15 24 7.5)" />
          <path
            d="M6,22 C9,12 31,12 34,22 C31,32 9,32 6,22 Z"
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="1.8"
          />
          <ellipse cx="16" cy="18" rx="4" ry="1.8" fill="#fef9c3" opacity="0.7" />
        </g>
      )}
      {fruit === 'plum' && (
        <g>
          <path d="M20,9 L22,4" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="25" cy="7" rx="4" ry="2" fill="#22c55e" transform="rotate(-18 25 7)" />
          <ellipse cx="20" cy="22" rx="12" ry="13.5" fill="#9333ea" stroke="#581c87" strokeWidth="1.8" />
          <path d="M20,10 C18,16 18,28 20,34" fill="none" stroke="#6b21a8" strokeWidth="1.6" />
          <ellipse cx="14.5" cy="18" rx="2.2" ry="4.5" fill="#e9d5ff" opacity="0.5" transform="rotate(-12 14.5 18)" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 1. Q20 & Q12: 7x5 IZGARA YÖN KODLAMA (grid_path_encode & grid_path_x)
// ============================================================================
const GridPathEncodeVisual: React.FC<{ data: any }> = ({ data }) => {
  const rows: number = data.rows ?? 5;
  const cols: number = data.cols ?? 7;
  const [sr, sc]: [number, number] = data.start ?? [2, 3];
  const cell = 24;
  const pad = 6;
  const w = cols * cell + pad * 2;
  const h = rows * cell + pad * 2;

  const givenSet = new Set<string>((data.givenCells || []).map(([r, c]: [number, number]) => `${r},${c}`));
  const targetSet = new Set<string>((data.targetCells || []).map(([r, c]: [number, number]) => `${r},${c}`));
  const givenColor = data.givenColor || '#fbbf24';
  const targetColor = data.targetColor || '#f87171';
  const givenArrows: string[] = data.givenArrows || [];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 px-3 py-2 bg-white rounded-2xl border border-slate-300 shadow-sm">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-48 sm:w-56 h-auto shrink-0">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const key = `${r},${c}`;
            const fill = givenSet.has(key)
              ? givenColor
              : targetSet.has(key)
              ? targetColor
              : '#ffffff';
            return (
              <rect
                key={key}
                x={pad + c * cell}
                y={pad + r * cell}
                width={cell}
                height={cell}
                fill={fill}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            );
          })
        )}
        <circle
          cx={pad + sc * cell + cell / 2}
          cy={pad + sr * cell + cell / 2}
          r={cell * 0.34}
          fill="#a3e635"
          stroke="#0f172a"
          strokeWidth="2"
        />
      </svg>

      <div className="flex flex-col gap-2.5 text-left">
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-sm border-2 border-slate-900 shrink-0"
            style={{ backgroundColor: givenColor }}
          />
          <span className="text-base sm:text-lg font-black tracking-wider text-slate-900">
            {givenArrows.map((d) => ARROW_CHAR[d] || d).join(' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-sm border-2 border-slate-900 shrink-0"
            style={{ backgroundColor: targetColor }}
          />
          <span className="text-lg sm:text-xl font-black text-amber-600">?</span>
        </div>
      </div>
    </div>
  );
};

const GridPathXQuestionVisual: React.FC<{ data: any }> = ({ data }) => {
  const rows: number = data.rows ?? 5;
  const cols: number = data.cols ?? 7;
  const [sr, sc]: [number, number] = data.start ?? [2, 3];
  const arrows: string[] = data.arrows || [];
  const cell = 22;
  const pad = 5;
  const w = cols * cell + pad * 2;
  const h = rows * cell + pad * 2;

  return (
    <div className="flex flex-col items-center gap-2.5 px-3 py-2 bg-white rounded-2xl border border-slate-300 shadow-sm">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {arrows.map((dir, i) => (
          <span
            key={i}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-lime-400 border-2 border-slate-900 flex items-center justify-center text-base sm:text-lg font-black text-slate-950 shadow-xs"
          >
            {ARROW_CHAR[dir] || dir}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-44 sm:w-52 h-auto">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={pad + c * cell}
              y={pad + r * cell}
              width={cell}
              height={cell}
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.4"
            />
          ))
        )}
        <circle
          cx={pad + sc * cell + cell / 2}
          cy={pad + sr * cell + cell / 2}
          r={cell * 0.34}
          fill="#a3e635"
          stroke="#0f172a"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

const GridPathXOptionVisual: React.FC<{ visual: any }> = ({ visual }) => {
  const rows: number = visual.rows ?? 5;
  const cols: number = visual.cols ?? 7;
  const [sr, sc]: [number, number] = visual.start ?? [2, 3];
  const [xr, xc]: [number, number] = visual.target ?? [0, 0];
  const cell = 16;
  const pad = 3;
  const w = cols * cell + pad * 2;
  const h = rows * cell + pad * 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 sm:w-32 h-auto mx-auto">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={pad + c * cell}
            y={pad + r * cell}
            width={cell}
            height={cell}
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.1"
          />
        ))
      )}
      <circle
        cx={pad + sc * cell + cell / 2}
        cy={pad + sr * cell + cell / 2}
        r={cell * 0.32}
        fill="#a3e635"
        stroke="#0f172a"
        strokeWidth="1.5"
      />
      <g
        stroke="#dc2626"
        strokeWidth="2.6"
        strokeLinecap="round"
      >
        <line
          x1={pad + xc * cell + 3.5}
          y1={pad + xr * cell + 3.5}
          x2={pad + (xc + 1) * cell - 3.5}
          y2={pad + (xr + 1) * cell - 3.5}
        />
        <line
          x1={pad + (xc + 1) * cell - 3.5}
          y1={pad + xr * cell + 3.5}
          x2={pad + xc * cell + 3.5}
          y2={pad + (xr + 1) * cell - 3.5}
        />
      </g>
    </svg>
  );
};

// ============================================================================
// 2. Q13: GÖRSEL MEYVE DENKLEMİ (fruit_equation)
// ============================================================================
const FruitCluster: React.FC<{ items: string[]; size?: number }> = ({ items, size = 28 }) => (
  <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-[140px]">
    {items.map((f, idx) => renderFruitIcon(f, size, idx))}
  </div>
);

const FruitEquationVisual: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="flex flex-col gap-2.5 px-4 py-3 bg-white rounded-2xl border border-slate-300 shadow-sm w-full max-w-md mx-auto">
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <FruitCluster items={data.eq1Left || []} size={30} />
        <span className="text-xl font-black text-slate-800">=</span>
        <FruitCluster items={data.eq1Right || []} size={30} />
      </div>
      <div className="h-px bg-slate-200 w-full" />
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <FruitCluster items={data.eq2Left || []} size={30} />
        <span className="text-xl font-black text-slate-800">=</span>
        <span className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-dashed border-amber-500 flex items-center justify-center text-2xl font-black text-amber-600">
          ?
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 3. Q17: KUTULU HARF / SEMBOL ŞERİDİ (letter_strip)
// ============================================================================
const LetterStripVisual: React.FC<{ data: any }> = ({ data }) => {
  const cells: (string | null)[] = data.cells || [];
  return (
    <div className="flex items-center justify-center flex-wrap p-3 bg-white rounded-2xl border border-slate-300 shadow-sm max-w-full">
      <div className="inline-flex items-stretch border-2 border-slate-900 rounded-lg overflow-hidden bg-white">
        {cells.map((ch, idx) => {
          const isBlank = ch === null || ch === '?';
          return (
            <div
              key={idx}
              className={`w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center text-base sm:text-xl font-black ${
                idx > 0 ? 'border-l-2 border-slate-900' : ''
              } ${isBlank ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-900'}`}
            >
              {isBlank ? '?' : ch}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 4. Q15: 3B RENKLİ PRİZMA YIĞINI & ÜSTTEN GÖRÜNÜM (colored_tower_top)
// ============================================================================
const darkenHex = (hex: string, factor: number): string => {
  const clean = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) * factor)));
  return `rgb(${r},${g},${b})`;
};

const ColoredTower3DVisual: React.FC<{ data: any }> = ({ data }) => {
  // Cabinet/oblique 3D projection: row 0 = back, row (R-1) = front; col 0 = left, col (C-1) = right
  // Looking straight down from above maps (row, col) directly to 2D grid (row, col)!
  const grid: ({ h: number; color: string } | null)[][] = data.grid || [];
  const rows = grid.length;
  const cols = grid[0]?.length || 3;

  const cellW = 34;
  const unitH = 22;
  const depthX = 16; // back-to-front shift along x (back is shifted +depthX right and -depthY up)
  const depthY = 14;

  const blocks: { r: number; c: number; h: number; color: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell && cell.h > 0) {
        blocks.push({ r, c, h: cell.h, color: cell.color });
      }
    }
  }
  // Painter's order: back rows first (small r), left-to-right (small c)
  blocks.sort((a, b) => a.r - b.r || a.c - b.c);

  const baseOriginX = 24;
  const baseOriginY = 148;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const blockGeoms = blocks.map((b) => {
    const backSteps = rows - 1 - b.r;
    const x = baseOriginX + b.c * cellW + backSteps * depthX;
    const yBottom = baseOriginY - backSteps * depthY;
    const bh = b.h * unitH;
    const yTop = yBottom - bh;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + cellW + depthX);
    minY = Math.min(minY, yTop - depthY);
    maxY = Math.max(maxY, yBottom);

    const topPts = `${x},${yTop} ${x + depthX},${yTop - depthY} ${x + cellW + depthX},${yTop - depthY} ${x + cellW},${yTop}`;
    const frontPts = `${x},${yTop} ${x + cellW},${yTop} ${x + cellW},${yBottom} ${x},${yBottom}`;
    const rightPts = `${x + cellW},${yTop} ${x + cellW + depthX},${yTop - depthY} ${x + cellW + depthX},${yBottom - depthY} ${x + cellW},${yBottom}`;

    return {
      ...b,
      topPts,
      frontPts,
      rightPts,
      topColor: b.color,
      frontColor: darkenHex(b.color, 0.88),
      rightColor: darkenHex(b.color, 0.72),
    };
  });

  const padX = 14;
  const padTop = 14;
  const padBottom = 18;
  const rawW = Number.isFinite(maxX) ? maxX - minX : 160;
  const rawH = Number.isFinite(maxY) ? maxY - minY : 140;
  const vbW = Math.ceil(rawW + padX * 2);
  const vbH = Math.ceil(rawH + padTop + padBottom);
  const shiftX = Number.isFinite(minX) ? -minX + padX : padX;
  const shiftY = Number.isFinite(minY) ? -minY + padTop : padTop;
  const scale = Math.min(200 / vbW, 155 / vbH, 1.1);
  const renderW = Math.round(vbW * scale);
  const renderH = Math.round(vbH * scale);

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-2.5 bg-white rounded-2xl border border-slate-300 shadow-sm">
      {/* Üstten bakış göz ikonu ve oklar */}
      <div className="flex flex-col items-center leading-none">
        <svg viewBox="0 0 64 28" className="w-12 h-5">
          <path d="M6,14 C16,3 48,3 58,14 C48,25 16,25 6,14 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2.4" />
          <circle cx="32" cy="14" r="6.5" fill="#0f172a" />
          <circle cx="30" cy="12" r="2.2" fill="#ffffff" />
        </svg>
        <div className="flex items-center gap-1 text-slate-900 font-black text-xs -mt-0.5">
          <span>↓</span>
          <span>↓</span>
          <span>↓</span>
        </div>
      </div>

      <svg
        width={renderW}
        height={renderH}
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="block mx-auto max-w-full h-auto overflow-visible"
      >
        <g transform={`translate(${shiftX}, ${shiftY})`}>
          {blockGeoms.map((g, i) => (
            <g key={i} stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round">
              <polygon points={g.frontPts} fill={g.frontColor} />
              <polygon points={g.rightPts} fill={g.rightColor} />
              <polygon points={g.topPts} fill={g.topColor} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

const ColoredTowerTopOptionVisual: React.FC<{ visual: any }> = ({ visual }) => {
  const grid: (string | null)[][] = visual.grid || [];
  const rows = grid.length;
  const cols = grid[0]?.length || 3;
  const cell = 24;
  const pad = 4;
  const w = cols * cell + pad * 2;
  const h = rows * cell + pad * 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
      {grid.map((row, r) =>
        row.map((colColor, c) =>
          colColor ? (
            <rect
              key={`${r}-${c}`}
              x={pad + c * cell}
              y={pad + r * cell}
              width={cell}
              height={cell}
              fill={colColor}
              stroke="#0f172a"
              strokeWidth="2"
              rx="1.5"
            />
          ) : null
        )
      )}
    </svg>
  );
};

// ============================================================================
// 5. Q18 & Q7: 2B ŞEKİL DÖNDÜRME & RENKLİ POLİOMİNO (rotate_poly & odd_poly_rotate)
// ============================================================================
const PolyominoSVG: React.FC<{
  cells: { r: number; c: number; color?: string; dot?: boolean }[];
  defaultFill?: string;
  sizeClass?: string;
  showInternalGrid?: boolean;
}> = ({ cells, defaultFill = '#c2a679', sizeClass = 'w-24 h-24 sm:w-28 sm:h-28', showInternalGrid = true }) => {
  if (!cells.length) return null;
  const maxR = Math.max(...cells.map((x) => x.r));
  const maxC = Math.max(...cells.map((x) => x.c));
  const rows = maxR + 1;
  const cols = maxC + 1;
  const dim = Math.max(rows, cols, 3);
  const cell = 26;
  const pad = 10;
  const total = dim * cell + pad * 2;
  const offsetX = pad + ((dim - cols) * cell) / 2;
  const offsetY = pad + ((dim - rows) * cell) / 2;

  const cellSet = new Set(cells.map((x) => `${x.r},${x.c}`));

  return (
    <svg viewBox={`0 0 ${total} ${total}`} className={`${sizeClass} mx-auto`}>
      {cells.map((item, idx) => {
        const x = offsetX + item.c * cell;
        const y = offsetY + item.r * cell;
        const fill = item.color || defaultFill;
        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill={fill}
              stroke={showInternalGrid ? '#0f172a' : fill}
              strokeWidth={showInternalGrid ? 2.2 : 0.6}
            />
          </g>
        );
      })}
      {/* Dış kenar konturu (showInternalGrid=false ise temiz birleşik çokgen görünümü) */}
      {!showInternalGrid &&
        cells.map((item, idx) => {
          const x = offsetX + item.c * cell;
          const y = offsetY + item.r * cell;
          return (
            <g key={`edge-${idx}`} stroke="#0f172a" strokeWidth="2.4" strokeLinecap="square">
              {!cellSet.has(`${item.r - 1},${item.c}`) && <line x1={x} y1={y} x2={x + cell} y2={y} />}
              {!cellSet.has(`${item.r + 1},${item.c}`) && <line x1={x} y1={y + cell} x2={x + cell} y2={y + cell} />}
              {!cellSet.has(`${item.r},${item.c - 1}`) && <line x1={x} y1={y} x2={x} y2={y + cell} />}
              {!cellSet.has(`${item.r},${item.c + 1}`) && <line x1={x + cell} y1={y} x2={x + cell} y2={y + cell} />}
            </g>
          );
        })}
      {/* İşaret noktası */}
      {cells.map((item, idx) => {
        if (!item.dot) return null;
        const cx = offsetX + item.c * cell + cell / 2;
        const cy = offsetY + item.r * cell + cell / 2;
        return (
          <circle
            key={`dot-${idx}`}
            cx={cx}
            cy={cy}
            r={cell * 0.25}
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

// ============================================================================
// 6. Q5: IZGARA AYNA SİMETRİSİ (grid_mirror)
// ============================================================================
const GridMirrorSVG: React.FC<{
  rows: number;
  cols: number;
  axis: 'vertical' | 'horizontal';
  cells: [number, number][];
  color?: string;
  compact?: boolean;
}> = ({ rows, cols, axis, cells, color = '#fde047', compact = false }) => {
  const cell = compact ? 16 : 24;
  const pad = compact ? 4 : 6;
  const w = cols * cell + pad * 2;
  const h = rows * cell + pad * 2;
  const set = new Set(cells.map(([r, c]) => `${r},${c}`));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={compact ? 'w-24 sm:w-28 h-auto mx-auto' : 'w-44 sm:w-52 h-auto mx-auto'}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={pad + c * cell}
            y={pad + r * cell}
            width={cell}
            height={cell}
            fill={set.has(`${r},${c}`) ? color : '#ffffff'}
            stroke="#0f172a"
            strokeWidth={compact ? 1.1 : 1.5}
          />
        ))
      )}
      {axis === 'vertical' ? (
        <line
          x1={pad + (cols / 2) * cell}
          y1={pad - 2}
          x2={pad + (cols / 2) * cell}
          y2={pad + rows * cell + 2}
          stroke="#dc2626"
          strokeWidth={compact ? 2.6 : 3.6}
        />
      ) : (
        <line
          x1={pad - 2}
          y1={pad + (rows / 2) * cell}
          x2={pad + cols * cell + 2}
          y2={pad + (rows / 2) * cell}
          stroke="#dc2626"
          strokeWidth={compact ? 2.6 : 3.6}
        />
      )}
    </svg>
  );
};

// ============================================================================
// 7. Q9: RENKLİ DAİRE - RAKAM ŞİFRE TABLOSU (color_digit_cipher)
// ============================================================================
const ColorOrb: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="shrink-0">
    <circle cx="16" cy="16" r="13" fill={color} stroke="#0f172a" strokeWidth="2" />
    <ellipse cx="12" cy="11" rx="4" ry="2.4" fill="#ffffff" opacity="0.45" transform="rotate(-25 12 11)" />
  </svg>
);

const ColorDigitCipherVisual: React.FC<{ data: any }> = ({ data }) => {
  const legend: { color: string; digit: string }[] = data.legend || [];
  const targetColors: string[] = data.targetColors || [];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-3 py-2.5 bg-white rounded-2xl border border-slate-300 shadow-sm">
      {/* Sol anahtar tablo */}
      <div className="inline-grid border-2 border-slate-900 rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${legend.length}, minmax(0, 1fr))` }}>
        {legend.map((item, i) => (
          <div
            key={`lc-${i}`}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white ${i > 0 ? 'border-l-2 border-slate-900' : ''}`}
          >
            <ColorOrb color={item.color} size={26} />
          </div>
        ))}
        {legend.map((item, i) => (
          <div
            key={`ld-${i}`}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-50 border-t-2 border-slate-900 font-black text-lg text-slate-900 tabular-nums ${i > 0 ? 'border-l-2 border-slate-900' : ''}`}
          >
            {item.digit}
          </div>
        ))}
      </div>

      {/* Sağ soru tablosu */}
      <div className="inline-grid border-2 border-slate-900 rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${targetColors.length}, minmax(0, 1fr))` }}>
        {targetColors.map((col, i) => (
          <div
            key={`tc-${i}`}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white ${i > 0 ? 'border-l-2 border-slate-900' : ''}`}
          >
            <ColorOrb color={col} size={26} />
          </div>
        ))}
        {targetColors.map((_, i) => (
          <div
            key={`td-${i}`}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-amber-50 border-t-2 border-slate-900 font-black text-lg text-amber-600 ${i > 0 ? 'border-l-2 border-slate-900' : ''}`}
          >
            ?
          </div>
        ))}
      </div>
    </div>
  );
};

const DigitBoxStripOption: React.FC<{ digits: string[] }> = ({ digits }) => (
  <div className="inline-flex border-2 border-slate-900 rounded-md overflow-hidden bg-white">
    {digits.map((d, i) => (
      <span
        key={i}
        className={`w-7 h-8 sm:w-8 sm:h-9 flex items-center justify-center font-black text-sm sm:text-base text-slate-900 tabular-nums ${
          i > 0 ? 'border-l-2 border-slate-900' : ''
        }`}
      >
        {d}
      </span>
    ))}
  </div>
);

// ============================================================================
// 8. Q8: DÜZ RENKLİ KÜP AÇILIMI & KATLANMIŞ 3B KÜP (colored_cube_net)
// ============================================================================
const ColoredCubeNetVisual: React.FC<{ faces: Record<string, string> }> = ({ faces }) => {
  const s = 38;
  const flap = 8;
  // Cross net layout:
  //        [top]     (col 1, row 0)
  // [left][center][right] (row 1)
  //       [bottom]   (col 1, row 2)
  //        [tail]    (col 1, row 3)
  const ox = 20;
  const oy = 14;
  const fx = (c: number) => ox + c * s;
  const fy = (r: number) => oy + r * s;
  const flapFill = '#bae6fd';

  return (
    <div className="p-2.5 bg-white rounded-2xl border border-slate-300 shadow-sm">
      <svg viewBox="0 0 156 180" className="w-36 sm:w-40 h-auto mx-auto">
        {/* Katlama kulakçıkları (flaps) */}
        <g fill={flapFill} stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round">
          {/* top sol & sağ */}
          <polygon points={`${fx(1)},${fy(0)} ${fx(1) - flap},${fy(0) + 5} ${fx(1) - flap},${fy(1) - 5} ${fx(1)},${fy(1)}`} />
          <polygon points={`${fx(2)},${fy(0)} ${fx(2) + flap},${fy(0) + 5} ${fx(2) + flap},${fy(1) - 5} ${fx(2)},${fy(1)}`} />
          {/* left üst & alt */}
          <polygon points={`${fx(0)},${fy(1)} ${fx(0) + 5},${fy(1) - flap} ${fx(1) - 5},${fy(1) - flap} ${fx(1)},${fy(1)}`} />
          <polygon points={`${fx(0)},${fy(2)} ${fx(0) + 5},${fy(2) + flap} ${fx(1) - 5},${fy(2) + flap} ${fx(1)},${fy(2)}`} />
          {/* right üst & alt */}
          <polygon points={`${fx(2)},${fy(1)} ${fx(2) + 5},${fy(1) - flap} ${fx(3) - 5},${fy(1) - flap} ${fx(3)},${fy(1)}`} />
          <polygon points={`${fx(2)},${fy(2)} ${fx(2) + 5},${fy(2) + flap} ${fx(3) - 5},${fy(2) + flap} ${fx(3)},${fy(2)}`} />
          {/* tail alt */}
          <polygon points={`${fx(1)},${fy(4)} ${fx(1) + 5},${fy(4) + flap} ${fx(2) - 5},${fy(4) + flap} ${fx(2)},${fy(4)}`} />
        </g>

        {/* 6 Renkli Yüz */}
        <g stroke="#0f172a" strokeWidth="1.8">
          <rect x={fx(1)} y={fy(0)} width={s} height={s} fill={faces.top} />
          <rect x={fx(0)} y={fy(1)} width={s} height={s} fill={faces.left} />
          <rect x={fx(1)} y={fy(1)} width={s} height={s} fill={faces.center} />
          <rect x={fx(2)} y={fy(1)} width={s} height={s} fill={faces.right} />
          <rect x={fx(1)} y={fy(2)} width={s} height={s} fill={faces.bottom} />
          <rect x={fx(1)} y={fy(3)} width={s} height={s} fill={faces.tail} />
        </g>
      </svg>
    </div>
  );
};

const IsometricSolidCubeSVG: React.FC<{ top: string; left: string; right: string }> = ({
  top,
  left,
  right,
}) => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto drop-shadow-xs">
    <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
      <polygon points="50,12 86,32 50,52 14,32" fill={top} />
      <polygon points="14,32 50,52 50,90 14,70" fill={left} />
      <polygon points="50,52 86,32 86,70 50,90" fill={right} />
    </g>
  </svg>
);

// ============================================================================
// 9. Q19: 5x5 KESİK IZGARA TAMAMLAMA (grid_cutout)
// ============================================================================
const GridCutoutQuestionVisual: React.FC<{ data: any }> = ({ data }) => {
  const size: number = data.size ?? 5;
  const holes = new Set<string>((data.holes || []).map(([r, c]: [number, number]) => `${r},${c}`));
  const fillColor = data.color || '#dc2626';
  const cell = 26;
  const pad = 6;
  const total = size * cell + pad * 2;

  return (
    <div className="p-2.5 bg-white rounded-2xl border border-slate-300 shadow-sm">
      <svg viewBox={`0 0 ${total} ${total}`} className="w-36 h-36 sm:w-44 sm:h-44 mx-auto">
        {Array.from({ length: size }).map((_, r) =>
          Array.from({ length: size }).map((__, c) => {
            const isHole = holes.has(`${r},${c}`);
            return (
              <rect
                key={`${r}-${c}`}
                x={pad + c * cell}
                y={pad + r * cell}
                width={cell}
                height={cell}
                fill={isHole ? '#ffffff' : fillColor}
                stroke={isHole ? '#e2e8f0' : '#ffffff'}
                strokeWidth="1.6"
              />
            );
          })
        )}
        <rect
          x={pad}
          y={pad}
          width={size * cell}
          height={size * cell}
          fill="none"
          stroke={fillColor}
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
};

// ============================================================================
// 10. Q10: İKİ TONLU YARIM SİMETRİ TAMAMLAMA (half_symmetry)
// ============================================================================
const HalfSymmetryPieceSVG: React.FC<{
  kind: string;
  color1: string;
  color2: string;
  rot?: number;
  sizeClass?: string;
}> = ({ kind, color1, color2, rot = 0, sizeClass = 'w-16 h-16 sm:w-20 sm:h-20' }) => {
  // Base shape is drawn as the LEFT half pointing left (so 180deg rotation gives exact mirror right half!)
  return (
    <svg viewBox="0 0 80 80" className={`${sizeClass} shrink-0`}>
      <g transform={`rotate(${rot} 40 40)`} stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
        {kind === 'chevron' && (
          <>
            <polygon points="56,10 18,40 34,40 62,18" fill={color1} />
            <polygon points="56,70 18,40 34,40 62,62" fill={color2} />
          </>
        )}
        {kind === 'diamond_wing' && (
          <>
            <polygon points="58,12 16,40 58,40" fill={color1} />
            <polygon points="58,68 16,40 58,40" fill={color2} />
          </>
        )}
        {kind === 'bracket_step' && (
          <>
            <polygon points="58,12 20,12 20,40 38,40 38,26 58,26" fill={color1} />
            <polygon points="58,68 20,68 20,40 38,40 38,54 58,54" fill={color2} />
          </>
        )}
        {kind === 'arrow_half' && (
          <>
            <polygon points="58,16 32,16 14,40 36,40 48,26 58,26" fill={color1} />
            <polygon points="58,64 32,64 14,40 36,40 48,54 58,54" fill={color2} />
          </>
        )}
        {kind === 'crown_half' && (
          <>
            <polygon points="58,12 18,24 34,40 58,40" fill={color1} />
            <polygon points="58,68 18,56 34,40 58,40" fill={color2} />
          </>
        )}
      </g>
    </svg>
  );
};

const HalfSymmetryQuestionVisual: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-300 shadow-sm">
    <HalfSymmetryPieceSVG
      kind={data.kind}
      color1={data.color1}
      color2={data.color2}
      rot={data.leftRot ?? 0}
      sizeClass="w-20 h-20 sm:w-24 sm:h-24"
    />
    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-amber-50 border-2 border-dashed border-amber-500 flex items-center justify-center">
      <span className="text-3xl font-black text-amber-600">?</span>
    </div>
  </div>
);

// ============================================================================
// 11. Q4: DOMİNO TOPLAM TAMAMLAMA (domino_sum)
// ============================================================================
const PIP_POS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

const DominoFaceSVG: React.FC<{ pips: number | null; sizeClass?: string }> = ({
  pips,
  sizeClass = 'w-14 h-14 sm:w-16 sm:h-16',
}) => (
  <svg viewBox="0 0 100 100" className={sizeClass}>
    <rect x="4" y="4" width="92" height="92" rx="14" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
    {pips === null ? (
      <text x="50" y="66" textAnchor="middle" fontSize="48" fontWeight="900" fill="#d97706">
        ?
      </text>
    ) : (
      (PIP_POS[pips] || []).map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="9.5" fill="#0f172a" />
      ))
    )}
  </svg>
);

const DominoSumQuestionVisual: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex flex-col items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-300 shadow-sm">
    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 border-slate-900 bg-slate-50 flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-900 tabular-nums shadow-xs">
      {data.targetSum}
    </div>
    <div className="flex items-center p-1.5 rounded-2xl border-2 border-slate-900 bg-slate-100 shadow-xs">
      <DominoFaceSVG pips={data.leftPips} sizeClass="w-16 h-16 sm:w-20 sm:h-20" />
      <div className="w-1 h-14 sm:h-16 bg-slate-900 mx-1 rounded-full" />
      <DominoFaceSVG pips={null} sizeClass="w-16 h-16 sm:w-20 sm:h-20" />
    </div>
  </div>
);

// ============================================================================
// 12. Q11 & Q16: KISA SÜRELİ GÖRSEL & SAYISAL HAFIZA (flash_memory)
// ============================================================================
export const FlashMemoryObjectSVG: React.FC<{ spec: any; sizeClass?: string }> = ({
  spec,
  sizeClass = 'w-28 h-28 sm:w-32 sm:h-32',
}) => {
  const kind: string = spec.kind || 'iced_cup';
  return (
    <svg viewBox="0 0 120 120" className={`${sizeClass} mx-auto`}>
      {kind === 'iced_cup' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          {/* Pipet */}
          {spec.strawDir === 'right' ? (
            <path d="M62,40 L74,14 L92,18" fill="none" stroke={spec.strawColor || '#ef4444'} strokeWidth="6" />
          ) : (
            <path d="M58,40 L46,14 L28,18" fill="none" stroke={spec.strawColor || '#ef4444'} strokeWidth="6" />
          )}
          {/* Kubbe kapak */}
          <path d="M30,44 C30,22 90,22 90,44 Z" fill={spec.lidColor || '#fde68a'} opacity="0.92" />
          <rect x="26" y="42" width="68" height="8" rx="4" fill={spec.lidColor || '#fbbf24'} />
          {/* Bardak gövdesi */}
          <polygon points="32,50 88,50 78,108 42,108" fill={spec.cupColor || '#fb923c'} />
          {/* Üst krema / şerit */}
          <rect x="35" y="56" width="50" height="10" rx="4" fill={spec.bandColor || '#ffffff'} />
          {/* İnciler / buz küpleri */}
          {Array.from({ length: spec.dots ?? 3 }).map((_, i) => {
            const positions: [number, number][] = [
              [48, 92],
              [60, 96],
              [72, 92],
              [54, 80],
            ];
            const [cx, cy] = positions[i] || [60, 86];
            return <circle key={i} cx={cx} cy={cy} r="5.5" fill={spec.dotColor || '#78350f'} />;
          })}
        </g>
      )}

      {kind === 'backpack' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Askı üst */}
          <path d="M46,24 C46,12 74,12 74,24" fill="none" stroke={spec.strapColor || '#334155'} strokeWidth="6" />
          {/* Yan cep (sol veya sağ) */}
          {spec.sidePocket === 'left' ? (
            <rect x="18" y="64" width="12" height="28" rx="5" fill={spec.accentColor || '#f59e0b'} />
          ) : (
            <rect x="90" y="64" width="12" height="28" rx="5" fill={spec.accentColor || '#f59e0b'} />
          )}
          {/* Ana gövde */}
          <rect x="28" y="24" width="64" height="80" rx="18" fill={spec.bodyColor || '#38bdf8'} />
          {/* Üst kapak şeridi */}
          <path d="M28,50 Q60,60 92,50" fill="none" stroke="#0f172a" strokeWidth="2.4" />
          {/* Ön cep */}
          <rect x="38" y="64" width="44" height="30" rx="8" fill={spec.pocketColor || '#fbbf24'} />
          {/* Rozet (yıldız veya daire) */}
          {spec.badge === 'star' ? (
            <polygon
              points="60,31 63,38 71,39 65,44 67,51 60,47 53,51 55,44 49,39 57,38"
              fill={spec.badgeColor || '#fef08a'}
            />
          ) : (
            <circle cx="60" cy="41" r="8" fill={spec.badgeColor || '#fef08a'} />
          )}
        </g>
      )}

      {kind === 'cake' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Mumlar */}
          {Array.from({ length: spec.candles ?? 3 }).map((_, i) => {
            const count = spec.candles ?? 3;
            const startX = count === 2 ? 48 : count === 4 ? 36 : 42;
            const step = count === 2 ? 24 : count === 4 ? 16 : 18;
            const x = startX + i * step;
            return (
              <g key={i}>
                <rect x={x - 3} y="26" width="6" height="22" rx="2" fill={spec.candleColor || '#38bdf8'} />
                <ellipse cx={x} cy="20" rx="3.5" ry="5.5" fill="#fbbf24" />
              </g>
            );
          })}
          {/* Üst kat */}
          <rect x="24" y="48" width="72" height="24" rx="7" fill={spec.topColor || '#fda4af'} />
          {/* Alt kat */}
          <rect x="18" y="72" width="84" height="26" rx="7" fill={spec.bottomColor || '#92400e'} />
          {/* Süsleme */}
          {spec.topping === 'cherry' ? (
            <>
              <circle cx="38" cy="60" r="5" fill="#dc2626" />
              <circle cx="60" cy="60" r="5" fill="#dc2626" />
              <circle cx="82" cy="60" r="5" fill="#dc2626" />
            </>
          ) : (
            <path d="M24,60 Q36,68 48,60 T72,60 T96,60" fill="none" stroke="#ffffff" strokeWidth="4" />
          )}
          <rect x="12" y="98" width="96" height="8" rx="4" fill="#cbd5e1" />
        </g>
      )}

      {kind === 'house' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Baca sol veya sağ */}
          <rect x={spec.chimney === 'left' ? 28 : 78} y="18" width="13" height="28" fill={spec.chimneyColor || '#64748b'} />
          {/* Çatı */}
          <polygon points="16,54 60,16 104,54" fill={spec.roofColor || '#ef4444'} />
          {spec.atticWindow && <circle cx="60" cy="39" r="7" fill="#fef08a" />}
          {/* Duvar */}
          <rect x="24" y="54" width="72" height="52" rx="4" fill={spec.wallColor || '#fde68a'} />
          {/* Kapı */}
          <rect x="50" y="74" width="20" height="32" rx="3" fill={spec.doorColor || '#92400e'} />
          {/* Pencereler */}
          <rect x="30" y="64" width="14" height="14" rx="2" fill={spec.winColor || '#38bdf8'} />
          <rect x="76" y="64" width="14" height="14" rx="2" fill={spec.winColor || '#38bdf8'} />
        </g>
      )}

      {kind === 'robot' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Anten */}
          {spec.antennas === 2 ? (
            <>
              <line x1="46" y1="26" x2="40" y2="12" stroke="#475569" strokeWidth="3" />
              <circle cx="40" cy="12" r="4.5" fill={spec.accentColor || '#fbbf24'} />
              <line x1="74" y1="26" x2="80" y2="12" stroke="#475569" strokeWidth="3" />
              <circle cx="80" cy="12" r="4.5" fill={spec.accentColor || '#fbbf24'} />
            </>
          ) : (
            <>
              <line x1="60" y1="26" x2="60" y2="11" stroke="#475569" strokeWidth="3.5" />
              <circle cx="60" cy="11" r="5.5" fill={spec.accentColor || '#fbbf24'} />
            </>
          )}
          {/* Kafa */}
          <rect x="32" y="26" width="56" height="32" rx="8" fill={spec.headColor || '#38bdf8'} />
          {/* Gözler */}
          {spec.eyeShape === 'square' ? (
            <>
              <rect x="42" y="34" width="10" height="10" rx="2" fill="#0f172a" />
              <rect x="68" y="34" width="10" height="10" rx="2" fill="#0f172a" />
            </>
          ) : (
            <>
              <circle cx="47" cy="39" r="5.5" fill="#0f172a" />
              <circle cx="73" cy="39" r="5.5" fill="#0f172a" />
            </>
          )}
          <rect x="46" y="49" width="28" height="4" rx="2" fill="#ffffff" />
          {/* Gövde */}
          <rect x="26" y="62" width="68" height="44" rx="10" fill={spec.bodyColor || '#0284c7'} />
          {/* Düğmeler */}
          <circle cx="46" cy="82" r="6" fill={spec.btnColor || '#f43f5e'} />
          <circle cx="60" cy="82" r="6" fill={spec.accentColor || '#fbbf24'} />
          <circle cx="74" cy="82" r="6" fill="#10b981" />
        </g>
      )}

      {kind === 'clock' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Üst çanlar */}
          {spec.hasBells && (
            <>
              <circle cx="30" cy="24" r="12" fill={spec.bellColor || '#f59e0b'} />
              <circle cx="90" cy="24" r="12" fill={spec.bellColor || '#f59e0b'} />
            </>
          )}
          {/* Gövde */}
          <circle cx="60" cy="62" r="42" fill={spec.rimColor || '#38bdf8'} />
          <circle cx="60" cy="62" r="33" fill="#ffffff" />
          {/* Saat işaretleri */}
          {[0, 90, 180, 270].map((d) => (
            <circle
              key={d}
              cx={60 + Math.cos((d * Math.PI) / 180) * 26}
              cy={62 + Math.sin((d * Math.PI) / 180) * 26}
              r="2.8"
              fill="#0f172a"
            />
          ))}
          {/* Akrep & Yelkovan */}
          <line
            x1="60"
            y1="62"
            x2={60 + Math.cos((((spec.minuteAngle ?? -90) * Math.PI) / 180)) * 22}
            y2={62 + Math.sin((((spec.minuteAngle ?? -90) * Math.PI) / 180)) * 22}
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <line
            x1="60"
            y1="62"
            x2={60 + Math.cos((((spec.hourAngle ?? 0) * Math.PI) / 180)) * 15}
            y2={62 + Math.sin((((spec.hourAngle ?? 0) * Math.PI) / 180)) * 15}
            stroke={spec.handColor || '#dc2626'}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="62" r="4" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// ANA EXPORT: YENİ SORU & SEÇENEK RENDERER'LARI
// ============================================================================
export const BilsemSampleQuestionVisual: React.FC<{
  question: QuizVisualQuestion;
  flashPhase?: 'memorize' | 'answer';
}> = ({ question, flashPhase = 'answer' }) => {
  const { visualType, visualData } = question;

  if (visualType === 'grid_path_encode') {
    return <GridPathEncodeVisual data={visualData} />;
  }
  if (visualType === 'grid_path_x') {
    return <GridPathXQuestionVisual data={visualData} />;
  }
  if (visualType === 'fruit_equation') {
    return <FruitEquationVisual data={visualData} />;
  }
  if (visualType === 'letter_strip') {
    return <LetterStripVisual data={visualData} />;
  }
  if (visualType === 'colored_tower_top') {
    return <ColoredTower3DVisual data={visualData} />;
  }
  if (visualType === 'rotate_poly') {
    return (
      <div className="p-3 bg-white rounded-2xl border border-slate-300 shadow-sm">
        <PolyominoSVG
          cells={visualData.cells || []}
          defaultFill={visualData.fill || '#c2a679'}
          sizeClass="w-32 h-32 sm:w-36 sm:h-36"
          showInternalGrid={false}
        />
      </div>
    );
  }
  if (visualType === 'odd_poly_rotate') {
    return (
      <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-bold text-amber-900 text-center">
        3 şekil aynı parçanın döndürülmüş hâlidir; 1 tanesi farklıdır (ters çevrilmiştir).
      </div>
    );
  }
  if (visualType === 'grid_mirror') {
    return (
      <div className="p-2.5 bg-white rounded-2xl border border-slate-300 shadow-sm">
        <GridMirrorSVG
          rows={visualData.rows}
          cols={visualData.cols}
          axis={visualData.axis}
          cells={visualData.cells || []}
          color={visualData.color || '#fde047'}
        />
      </div>
    );
  }
  if (visualType === 'color_digit_cipher') {
    return <ColorDigitCipherVisual data={visualData} />;
  }
  if (visualType === 'colored_cube_net') {
    return <ColoredCubeNetVisual faces={visualData.faces} />;
  }
  if (visualType === 'grid_cutout') {
    return <GridCutoutQuestionVisual data={visualData} />;
  }
  if (visualType === 'half_symmetry') {
    return <HalfSymmetryQuestionVisual data={visualData} />;
  }
  if (visualType === 'domino_sum') {
    return <DominoSumQuestionVisual data={visualData} />;
  }
  if (visualType === 'flash_memory') {
    if (flashPhase === 'memorize') {
      if (visualData.subType === 'sequence') {
        return (
          <div className="px-6 py-5 bg-white rounded-2xl border-2 border-indigo-300 shadow-sm flex flex-col items-center gap-2">
            <div className="text-2xl sm:text-4xl font-black tracking-[0.22em] text-slate-900 tabular-nums">
              {(visualData.sequence || []).join(', ')}
            </div>
          </div>
        );
      }
      return (
        <div className="p-4 bg-white rounded-2xl border-2 border-indigo-300 shadow-sm flex items-center justify-center">
          <FlashMemoryObjectSVG spec={visualData.objectSpec} sizeClass="w-32 h-32 sm:w-40 sm:h-40" />
        </div>
      );
    }
    return (
      <div className="px-5 py-3 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-300 text-center">
        <span className="text-xs sm:text-sm font-black text-indigo-800">
          {visualData.subType === 'sequence'
            ? 'Az önce gördüğün sıralamayı aşağıdan seç!'
            : 'Az önce gördüğün görselin birebir aynısını aşağıdan seç!'}
        </span>
      </div>
    );
  }
  return null;
};

export const BilsemSampleOptionVisual: React.FC<{
  question: QuizVisualQuestion;
  visual: any;
}> = ({ question, visual }) => {
  const { visualType } = question;
  if (!visual) return null;

  if (visualType === 'grid_path_encode') {
    const arrows: string[] = visual.arrows || [];
    return (
      <span className="text-sm sm:text-base font-black tracking-wider text-slate-900 text-center leading-tight">
        {arrows.map((d) => ARROW_CHAR[d] || d).join(' ')}
      </span>
    );
  }
  if (visualType === 'grid_path_x') {
    return <GridPathXOptionVisual visual={visual} />;
  }
  if (visualType === 'fruit_equation') {
    return <FruitCluster items={visual.items || []} size={26} />;
  }
  if (visualType === 'colored_tower_top') {
    return <ColoredTowerTopOptionVisual visual={visual} />;
  }
  if (visualType === 'rotate_poly') {
    return (
      <PolyominoSVG
        cells={visual.cells || []}
        defaultFill={visual.fill || question.visualData?.fill || '#c2a679'}
        sizeClass="w-20 h-20 sm:w-24 sm:h-24"
        showInternalGrid={false}
      />
    );
  }
  if (visualType === 'odd_poly_rotate') {
    return (
      <PolyominoSVG
        cells={visual.cells || []}
        sizeClass="w-20 h-20 sm:w-24 sm:h-24"
        showInternalGrid={true}
      />
    );
  }
  if (visualType === 'grid_mirror') {
    return (
      <GridMirrorSVG
        rows={visual.rows}
        cols={visual.cols}
        axis={visual.axis}
        cells={visual.cells || []}
        color={visual.color || '#fde047'}
        compact={true}
      />
    );
  }
  if (visualType === 'color_digit_cipher') {
    return <DigitBoxStripOption digits={visual.digits || []} />;
  }
  if (visualType === 'colored_cube_net') {
    return <IsometricSolidCubeSVG top={visual.top} left={visual.left} right={visual.right} />;
  }
  if (visualType === 'grid_cutout') {
    return (
      <PolyominoSVG
        cells={(visual.cells || []).map(([r, c]: [number, number]) => ({
          r,
          c,
          color: visual.color || question.visualData?.color || '#dc2626',
        }))}
        sizeClass="w-20 h-20 sm:w-24 sm:h-24"
        showInternalGrid={true}
      />
    );
  }
  if (visualType === 'half_symmetry') {
    return (
      <HalfSymmetryPieceSVG
        kind={visual.kind || question.visualData?.kind}
        color1={visual.color1 || question.visualData?.color1}
        color2={visual.color2 || question.visualData?.color2}
        rot={visual.rot ?? 0}
        sizeClass="w-16 h-16 sm:w-20 sm:h-20"
      />
    );
  }
  if (visualType === 'domino_sum') {
    return <DominoFaceSVG pips={visual.pips} sizeClass="w-14 h-14 sm:w-16 sm:h-16" />;
  }
  if (visualType === 'flash_memory') {
    if (visual.sequence) {
      return (
        <span className="text-sm sm:text-lg font-black tracking-widest text-slate-900 tabular-nums text-center">
          {visual.sequence.join(', ')}
        </span>
      );
    }
    return <FlashMemoryObjectSVG spec={visual.objectSpec} sizeClass="w-20 h-20 sm:w-24 sm:h-24" />;
  }
  return null;
};
