import React from 'react';
import {
  BilsemActivityId,
  MatrixCellSpec,
  QuizVisualQuestion,
  ShapeKind,
  SpotOddTheme,
} from '../data/bilsemActivitiesData';

export const ShapeGlyph: React.FC<{
  shape: ShapeKind;
  color: string;
  rotation?: number;
  count?: number;
  innerDot?: boolean;
  size?: number;
}> = ({ shape, color, rotation = 0, count = 1, innerDot = false, size = 44 }) => {
  const renderOne = (key: number, s: number) => (
    <svg
      key={key}
      width={s}
      height={s}
      viewBox="0 0 48 48"
      style={{ transform: `rotate(${rotation}deg)` }}
      className="shrink-0 transition-transform"
    >
      {shape === 'circle' && <circle cx="24" cy="24" r="17" fill={color} stroke="#0f172a" strokeWidth="2.5" />}
      {shape === 'square' && <rect x="8" y="8" width="32" height="32" rx="4" fill={color} stroke="#0f172a" strokeWidth="2.5" />}
      {shape === 'triangle' && (
        <polygon points="24,6 42,40 6,40" fill={color} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {shape === 'diamond' && (
        <polygon points="24,5 43,24 24,43 5,24" fill={color} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {shape === 'hexagon' && (
        <polygon
          points="24,5 40,14 40,34 24,43 8,34 8,14"
          fill={color}
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {shape === 'star' && (
        <polygon
          points="24,5 29.5,17 42,18.5 32.5,27.5 35,40.5 24,34 13,40.5 15.5,27.5 6,18.5 18.5,17"
          fill={color}
          stroke="#0f172a"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
      )}
      {innerDot && <circle cx="24" cy={shape === 'triangle' ? 28 : 24} r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />}
    </svg>
  );

  if (count <= 1) return renderOne(0, size);
  const itemSize = count === 2 ? Math.round(size * 0.62) : Math.round(size * 0.48);
  return (
    <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
      {Array.from({ length: count }).map((_, idx) => renderOne(idx, itemSize))}
    </div>
  );
};

// ============================================================================
// 2.5D İZOMETRİK KÜP YIĞINI (3D KÜP SAYMA)
// ============================================================================
const IsometricCubesSVG: React.FC<{ heights: number[][] }> = ({ heights }) => {
  const rows = heights.length;
  const cols = heights[0]?.length || 2;
  const dx = 28;
  const dy = 14;
  const cubeH = 26;

  // Painter's algorithm: back-to-front (r+c ascending), bottom-to-top (z ascending)
  const cubes: { x: number; y: number; z: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = heights[r][c] || 0;
      for (let z = 0; z < h; z++) {
        cubes.push({ x: c, y: r, z });
      }
    }
  }
  cubes.sort((a, b) => a.y + a.x - (b.y + b.x) || a.z - b.z);

  const originX = 110;
  const originY = 145;

  return (
    <svg viewBox="0 0 220 190" className="w-full max-w-[240px] h-auto mx-auto drop-shadow-md">
      {cubes.map((cube, idx) => {
        const cx = originX + (cube.x - cube.y) * dx;
        const cy = originY + (cube.x + cube.y) * dy - cube.z * cubeH;
        const topPts = `${cx},${cy - dy * 2} ${cx + dx},${cy - dy} ${cx},${cy} ${cx - dx},${cy - dy}`;
        const leftPts = `${cx - dx},${cy - dy} ${cx},${cy} ${cx},${cy + cubeH} ${cx - dx},${cy + cubeH - dy}`;
        const rightPts = `${cx},${cy} ${cx + dx},${cy - dy} ${cx + dx},${cy + cubeH - dy} ${cx},${cy + cubeH}`;
        return (
          <g key={idx}>
            <polygon points={topPts} fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points={leftPts} fill="#0284c7" stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points={rightPts} fill="#0369a1" stroke="#0f172a" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================================
// GÖLGE SİLUETLERİ (RENKLİ NESNE & SİYAH GÖLGE ÇELDİRİCİLERİ)
// ============================================================================
export const ShadowFigureSVG: React.FC<{
  figure: string;
  isShadow: boolean;
  variant?: string;
}> = ({ figure, isShadow, variant = 'exact' }) => {
  const fillMain = isShadow ? '#090d16' : '#38bdf8';
  const fillAccent = isShadow ? '#090d16' : '#f59e0b';
  const fillThird = isShadow ? '#090d16' : '#f43f5e';
  const strokeCol = isShadow ? '#334155' : '#0f172a';
  const flipX = variant === 'mirrored' || variant === 'flipped';
  const flipY = figure === 'rocket' && variant === 'flipped';

  const transformStyle =
    flipX && flipY
      ? 'scale(-1, -1)'
      : flipX
      ? 'scale(-1, 1)'
      : flipY
      ? 'scale(1, -1)'
      : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full max-w-[110px] max-h-[110px]"
      style={transformStyle ? { transform: transformStyle } : undefined}
    >
      {figure === 'rocket' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Sol kanat */}
          {variant !== 'missing_fin' && (
            <polygon points="42,66 20,90 42,86" fill={fillThird} />
          )}
          {/* Sağ kanat */}
          <polygon points="78,66 100,90 78,86" fill={fillThird} />
          {/* Gövde */}
          {variant === 'blunt_tip' ? (
            <rect x="42" y="22" width="36" height="66" rx="6" fill={fillMain} />
          ) : (
            <path d="M60,10 C75,28 78,52 78,86 L42,86 C42,52 45,28 60,10 Z" fill={fillMain} />
          )}
          {/* Alev */}
          <polygon points="48,86 60,110 72,86" fill={fillAccent} />
          {!isShadow && <circle cx="60" cy="48" r="9" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />}
        </g>
      )}

      {figure === 'castle' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Sol Yüksek Kule */}
          <rect x="20" y="28" width="24" height="74" fill={fillMain} />
          <polygon points="18,28 32,12 46,28" fill={fillThird} />
          {/* Orta Duvar */}
          <rect x="44" y="54" width="32" height="48" fill={fillMain} />
          <rect x="46" y="46" width="8" height="8" fill={fillMain} />
          <rect x="66" y="46" width="8" height="8" fill={fillMain} />
          {/* Sağ Kule */}
          <rect
            x="76"
            y={variant === 'even_towers' ? '28' : '42'}
            width="24"
            height={variant === 'even_towers' ? '74' : '60'}
            fill={fillMain}
          />
          {variant !== 'no_flag' && (
            <g>
              <line x1="88" y1="42" x2="88" y2="20" stroke={isShadow ? '#090d16' : '#f8fafc'} strokeWidth="3" />
              <polygon points="88,20 108,27 88,34" fill={fillAccent} />
            </g>
          )}
          {!isShadow && (
            <>
              <path d="M52,102 L52,80 A8,8 0 0 1 68,80 L68,102 Z" fill="#78350f" />
              <rect x="28" y="42" width="8" height="12" rx="4" fill="#fef08a" />
            </>
          )}
        </g>
      )}

      {figure === 'fish' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Üst yüzgeç */}
          {variant !== 'no_top_fin' && (
            <polygon points="48,40 62,18 74,42" fill={fillAccent} />
          )}
          {/* Alt küçük yüzgeç */}
          <polygon points="56,78 68,94 74,77" fill={fillAccent} />
          {/* Kuyruk */}
          {variant === 'round_tail' ? (
            <ellipse cx="96" cy="60" rx="14" ry="18" fill={fillThird} />
          ) : (
            <polygon points="82,60 108,34 100,60 108,86" fill={fillThird} />
          )}
          {/* Gövde */}
          <ellipse cx="52" cy="60" rx="34" ry="22" fill={fillMain} />
          {!isShadow && (
            <>
              <circle cx="32" cy="54" r="4.5" fill="#ffffff" />
              <circle cx="31" cy="54" r="2" fill="#0f172a" />
            </>
          )}
        </g>
      )}

      {figure === 'totem' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Alt ayaklar */}
          {variant !== 'no_feet' && (
            <>
              <polygon points="34,98 20,110 46,110" fill={fillThird} />
              <polygon points="86,98 100,110 74,110" fill={fillThird} />
            </>
          )}
          {/* Alt kare */}
          <rect x="34" y="68" width="52" height="32" rx="4" fill={fillMain} />
          {/* Orta çıkıntılı daire */}
          {variant !== 'flat_sides' && (
            <circle cx="60" cy="56" r="22" fill={fillAccent} />
          )}
          {/* Üst kule + sağa bakan bayrak */}
          <rect x="52" y="18" width="16" height="24" fill={fillMain} />
          <polygon points="68,18 96,26 68,34" fill={fillThird} />
        </g>
      )}

      {figure === 'key' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {variant === 'square_head' ? (
            <rect x="14" y="34" width="36" height="36" rx="4" fill={fillAccent} />
          ) : (
            <circle cx="32" cy="52" r="19" fill={fillAccent} />
          )}
          {!isShadow && <circle cx="32" cy="52" r="7" fill="#0f172a" />}
          <rect x="48" y="47" width="56" height="10" rx="4" fill={fillAccent} />
          {/* Dişler */}
          <rect x="66" y="57" width="8" height="18" fill={fillAccent} />
          {variant !== 'two_teeth' && (
            <rect x="80" y="57" width="7" height="11" fill={fillAccent} />
          )}
          <rect x="93" y="57" width="8" height="20" fill={fillAccent} />
        </g>
      )}

      {figure === 'sailboat' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Direk */}
          <rect x="58" y="16" width="5" height="68" fill={fillAccent} />
          {/* Tepe flama (sola uzanır) */}
          {variant === 'flag_right' ? (
            <polygon points="63,16 84,22 63,28" fill={fillThird} />
          ) : (
            <polygon points="58,16 36,22 58,28" fill={fillThird} />
          )}
          {/* Büyük sol yelken */}
          <polygon points="58,28 22,76 58,76" fill={fillMain} />
          {/* Küçük sağ yelken */}
          {variant !== 'one_sail' && (
            <polygon points="63,38 92,76 63,76" fill={fillAccent} />
          )}
          {/* Tekne gövdesi */}
          <polygon points="16,80 104,80 90,100 30,100" fill={fillThird} />
        </g>
      )}

      {figure === 'butterfly' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Antenler */}
          <path d="M55,34 Q46,16 38,16" fill="none" stroke={strokeCol} strokeWidth="3" strokeLinecap="round" />
          <circle cx="38" cy="16" r="3.5" fill={fillAccent} />
          {variant !== 'one_antenna' && (
            <>
              <path d="M65,34 Q74,16 82,16" fill="none" stroke={strokeCol} strokeWidth="3" strokeLinecap="round" />
              <circle cx="82" cy="16" r="3.5" fill={fillAccent} />
            </>
          )}
          {/* Üst kanatlar */}
          <ellipse cx="36" cy="46" rx="22" ry="18" fill={fillMain} transform="rotate(-18 36 46)" />
          <ellipse
            cx="84"
            cy="46"
            rx={variant === 'asymmetric' ? 14 : 22}
            ry={variant === 'asymmetric' ? 12 : 18}
            fill={fillMain}
            transform="rotate(18 84 46)"
          />
          {/* Alt kanatlar */}
          <ellipse cx="40" cy="76" rx="16" ry="15" fill={fillThird} transform="rotate(15 40 76)" />
          {variant !== 'no_lower_wing' && (
            <ellipse cx="80" cy="76" rx="16" ry="15" fill={fillThird} transform="rotate(-15 80 76)" />
          )}
          {/* Gövde */}
          <rect x="55" y="32" width="10" height="58" rx="5" fill={fillAccent} />
        </g>
      )}

      {figure === 'crown' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {variant === 'flat_top' ? (
            <rect x="20" y="40" width="80" height="52" rx="6" fill={fillAccent} />
          ) : variant === 'two_peaks' ? (
            <polygon points="20,92 20,38 50,62 60,62 70,62 100,38 100,92" fill={fillAccent} />
          ) : (
            <polygon points="18,92 18,38 40,62 60,26 80,62 102,38 102,92" fill={fillAccent} />
          )}
          {variant !== 'no_balls' && variant !== 'flat_top' && (
            <>
              <circle cx="18" cy="34" r="6" fill={fillThird} />
              {variant !== 'two_peaks' && <circle cx="60" cy="22" r="7" fill={fillThird} />}
              <circle cx="102" cy="34" r="6" fill={fillThird} />
            </>
          )}
          <rect x="18" y="84" width="84" height="12" rx="3" fill={fillMain} />
        </g>
      )}

      {figure === 'pine_tree' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Gövde ve sağ yan dal */}
          <rect x="52" y="82" width="16" height="28" fill={fillAccent} />
          {variant !== 'no_branch' && (
            <polygon points="68,94 88,88 86,95 68,99" fill={fillAccent} />
          )}
          {/* Alt kat */}
          <polygon points="60,46 18,86 102,86" fill={fillMain} />
          {/* Orta kat */}
          {variant !== 'two_tiers' && (
            <polygon points="60,28 28,62 92,62" fill={fillMain} />
          )}
          {/* Üst kat */}
          <polygon points="60,10 38,38 82,38" fill={fillThird} />
        </g>
      )}

      {figure === 'trophy' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Sol kulp */}
          {variant !== 'no_handles' && (
            <path d="M36,28 C16,28 16,58 38,58" fill="none" stroke={fillAccent} strokeWidth="7" strokeLinecap="round" />
          )}
          {/* Sağ kulp */}
          {variant !== 'no_handles' && variant !== 'one_handle' && (
            <path d="M84,28 C104,28 104,58 82,58" fill="none" stroke={fillAccent} strokeWidth="7" strokeLinecap="round" />
          )}
          {/* Kupa gövdesi */}
          <path d="M34,20 L86,20 L80,62 C78,76 42,76 40,62 Z" fill={fillAccent} />
          {/* Sap */}
          <rect x="54" y="72" width="12" height="20" fill={fillMain} />
          {/* Kaide */}
          <rect
            x={variant === 'thin_base' ? 44 : 30}
            y="92"
            width={variant === 'thin_base' ? 32 : 60}
            height="14"
            rx="4"
            fill={fillThird}
          />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 2D DESEN MOZAİĞİ (SAĞ ALT KÖŞE EKSİK PARÇA TAMAMLAMA)
// ============================================================================
const PatternTileSquareSVG: React.FC<{
  patternId: string;
  quadrant: 0 | 1 | 2 | 3 | 'option';
  piece?: string;
}> = ({ patternId, quadrant, piece = 'exact' }) => {
  // Quadrant 0=TL, 1=TR, 2=BL, 3=BR
  // Transform helpers so TL/TR/BL mirror naturally toward center (BR is target)
  const renderContent = () => {
    if (patternId === 'radial_star') {
      if (quadrant === 'option') {
        if (piece === 'inverted_color') {
          return (
            <>
              <rect width="60" height="60" fill="#f59e0b" />
              <polygon points="0,0 60,0 0,60" fill="#0284c7" />
              <circle cx="44" cy="44" r="8" fill="#0284c7" />
            </>
          );
        }
        if (piece === 'rotated') {
          return (
            <>
              <rect width="60" height="60" fill="#0284c7" />
              <polygon points="60,0 60,60 0,60" fill="#f59e0b" />
              <circle cx="16" cy="16" r="8" fill="#f59e0b" />
            </>
          );
        }
        if (piece === 'wrong_corner') {
          return (
            <>
              <rect width="60" height="60" fill="#0284c7" />
              <polygon points="0,0 60,0 0,60" fill="#f43f5e" />
              <circle cx="44" cy="44" r="8" fill="#f59e0b" />
            </>
          );
        }
      }
      // Corner pointing to center of 2x2 grid:
      // TL: center is BR (60,60). TR: center is BL (0,60). BL: center is TR (60,0). BR: center is TL (0,0).
      const polyMap: Record<number, string> = {
        0: '60,60 0,60 60,0',
        1: '0,60 60,60 0,0',
        2: '60,0 0,0 60,60',
        3: '0,0 60,0 0,60',
      };
      const dotMap: Record<number, [number, number]> = {
        0: [16, 16],
        1: [44, 16],
        2: [16, 44],
        3: [44, 44],
      };
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const [dx, dy] = dotMap[qIdx];
      return (
        <>
          <rect width="60" height="60" fill="#0284c7" />
          <polygon points={polyMap[qIdx]} fill="#f59e0b" />
          <circle cx={dx} cy={dy} r="8" fill="#f59e0b" />
        </>
      );
    }

    if (patternId === 'diagonal_stripes') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      if (quadrant === 'option' && piece === 'flipped') {
        return (
          <g transform="rotate(90 30 30)">
            <rect width="60" height="60" fill="#0f172a" />
            <line x1="0" y1="60" x2="60" y2="0" stroke="#f43f5e" strokeWidth="14" />
            <circle cx="18" cy="18" r="7" fill="#2dd4bf" />
          </g>
        );
      }
      if (quadrant === 'option' && piece === 'no_dot') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#0f172a" />
            <line x1="0" y1="60" x2="60" y2="0" stroke="#f43f5e" strokeWidth="14" />
          </g>
        );
      }
      if (quadrant === 'option' && piece === 'wrong_band') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#0f172a" />
            <line x1="0" y1="60" x2="60" y2="0" stroke="#38bdf8" strokeWidth="14" />
            <circle cx="18" cy="18" r="7" fill="#f59e0b" />
          </g>
        );
      }
      return (
        <g transform={`rotate(${rot} 30 30)`}>
          <rect width="60" height="60" fill="#0f172a" />
          <line x1="0" y1="60" x2="60" y2="0" stroke="#f43f5e" strokeWidth="14" />
          <circle cx="18" cy="18" r="7" fill="#2dd4bf" />
        </g>
      );
    }

    if (patternId === 'concentric_arcs') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      // center points: TL=(60,60), TR=(0,60), BL=(60,0), BR=(0,0)
      const centers: Record<number, [number, number]> = {
        0: [60, 60],
        1: [0, 60],
        2: [60, 0],
        3: [0, 0],
      };
      let [cx, cy] = centers[qIdx];
      if (quadrant === 'option' && piece === 'flipped_corner') [cx, cy] = [60, 60];
      if (quadrant === 'option' && piece === 'straight') {
        return (
          <>
            <rect width="60" height="60" fill="#1e293b" />
            <rect x="0" y="10" width="60" height="12" fill="#eab308" />
            <rect x="0" y="28" width="60" height="12" fill="#10b981" />
          </>
        );
      }
      const c1 = quadrant === 'option' && piece === 'wrong_order' ? '#a855f7' : '#eab308';
      const c3 = quadrant === 'option' && piece === 'wrong_order' ? '#eab308' : '#a855f7';
      return (
        <>
          <rect width="60" height="60" fill="#1e293b" />
          <circle cx={cx} cy={cy} r="52" fill={c1} />
          <circle cx={cx} cy={cy} r="36" fill="#10b981" />
          <circle cx={cx} cy={cy} r="20" fill={c3} />
        </>
      );
    }

    if (patternId === 'flower_mosaic') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      if (quadrant === 'option' && piece === 'mirrored') {
        return (
          <g transform="rotate(0 30 30)">
            <rect width="60" height="60" fill="#134e4a" />
            <path d="M60,60 Q20,55 15,15 Q55,20 60,60 Z" fill="#fb7185" />
            <circle cx="15" cy="15" r="7" fill="#fde047" />
          </g>
        );
      }
      if (quadrant === 'option' && piece === 'missing_leaf') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#134e4a" />
            <path d="M60,60 Q20,55 15,15 Q55,20 60,60 Z" fill="#fb7185" />
          </g>
        );
      }
      if (quadrant === 'option' && piece === 'color_swap') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#134e4a" />
            <path d="M60,60 Q20,55 15,15 Q55,20 60,60 Z" fill="#fde047" />
            <circle cx="15" cy="15" r="7" fill="#fb7185" />
          </g>
        );
      }
      return (
        <g transform={`rotate(${rot} 30 30)`}>
          <rect width="60" height="60" fill="#134e4a" />
          <path d="M60,60 Q20,55 15,15 Q55,20 60,60 Z" fill="#fb7185" />
          <circle cx="15" cy="15" r="7" fill="#fde047" />
        </g>
      );
    }

    if (patternId === 'checker_arrows') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const isDark = qIdx === 0 || qIdx === 3;
      const rot = qIdx === 0 ? 135 : qIdx === 1 ? 225 : qIdx === 2 ? 45 : 315;
      let useDark = isDark;
      let useRot = rot;
      if (quadrant === 'option') {
        if (piece === 'outward') useRot = 135;
        if (piece === 'wrong_bg') useDark = false;
        if (piece === 'horizontal') useRot = 0;
      }
      return (
        <>
          <rect width="60" height="60" fill={useDark ? '#1e1b4b' : '#312e81'} />
          <g transform={`rotate(${useRot} 30 30)`}>
            <polygon points="30,10 46,30 36,30 36,48 24,48 24,30 14,30" fill="#fbbf24" />
          </g>
        </>
      );
    }

    if (patternId === 'windmill') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const bladeA = quadrant === 'option' && piece === 'color_swap' ? '#f59e0b' : '#10b981';
      const bladeB = quadrant === 'option' && piece === 'color_swap' ? '#10b981' : '#f59e0b';
      const useRot = quadrant === 'option' && piece === 'wrong_rot' ? 90 : rot;
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#0f172a" />
          <polygon points="60,60 12,60 12,18" fill={bladeA} />
          {!(quadrant === 'option' && piece === 'missing_blade') && (
            <polygon points="60,60 60,12 18,12" fill={bladeB} />
          )}
        </g>
      );
    }

    if (patternId === 'diamond_frame') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'flipped' ? 0 : rot;
      const bandColor = quadrant === 'option' && piece === 'wrong_color' ? '#38bdf8' : '#f59e0b';
      if (quadrant === 'option' && piece === 'square_center') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#312e81" />
            <rect x="26" y="26" width="34" height="34" fill="#a855f7" />
          </g>
        );
      }
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#312e81" />
          <polygon points="60,12 12,60 60,60" fill="#a855f7" />
          <line x1="60" y1="12" x2="12" y2="60" stroke={bandColor} strokeWidth="7" />
        </g>
      );
    }

    if (patternId === 'wave_bands') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      if (quadrant === 'option' && piece === 'vertical') {
        return (
          <>
            <rect width="60" height="60" fill="#0f172a" />
            <rect x="12" y="0" width="12" height="60" fill="#38bdf8" />
            <rect x="36" y="0" width="12" height="60" fill="#f43f5e" />
          </>
        );
      }
      const cTop = quadrant === 'option' && piece === 'swapped_bands' ? '#f43f5e' : '#38bdf8';
      const cBot = quadrant === 'option' && piece === 'swapped_bands' ? '#38bdf8' : '#f43f5e';
      return (
        <g transform={`rotate(${rot} 30 30)`}>
          <rect width="60" height="60" fill="#0f172a" />
          <rect x="0" y="12" width="60" height="10" fill={cTop} />
          <rect x="0" y="38" width="60" height="10" fill={cBot} />
          {!(quadrant === 'option' && piece === 'no_center') && (
            <rect x="44" y="44" width="16" height="16" fill="#f8fafc" />
          )}
        </g>
      );
    }

    if (patternId === 'stepped_grid') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'reversed' ? 0 : rot;
      if (quadrant === 'option' && piece === 'flat') {
        return (
          <g transform="rotate(180 30 30)">
            <rect width="60" height="60" fill="#0f172a" />
            <rect x="0" y="0" width="60" height="24" fill="#1e40af" />
          </g>
        );
      }
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#0f172a" />
          <rect x="0" y="0" width="26" height="26" fill="#1e40af" />
          <rect x="26" y="26" width="34" height="34" fill="#2dd4bf" />
          {quadrant === 'option' && piece === 'extra_dot' && (
            <circle cx="14" cy="46" r="8" fill="#fbbf24" />
          )}
        </g>
      );
    }

    // maze_corner
    const qIdx = quadrant === 'option' ? 3 : quadrant;
    const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
    if (quadrant === 'option' && piece === 'reverse_L') {
      return (
        <g transform="rotate(0 30 30)">
          <rect width="60" height="60" fill="#0f172a" />
          <path d="M22,60 L22,22 L60,22" fill="none" stroke="#38bdf8" strokeWidth="10" strokeLinecap="square" />
        </g>
      );
    }
    if (quadrant === 'option' && piece === 'cross') {
      return (
        <>
          <rect width="60" height="60" fill="#0f172a" />
          <line x1="0" y1="30" x2="60" y2="30" stroke="#38bdf8" strokeWidth="10" />
          <line x1="30" y1="0" x2="30" y2="60" stroke="#38bdf8" strokeWidth="10" />
        </>
      );
    }
    if (quadrant === 'option' && piece === 'broken') {
      return (
        <g transform="rotate(180 30 30)">
          <rect width="60" height="60" fill="#0f172a" />
          <line x1="22" y1="60" x2="22" y2="36" stroke="#38bdf8" strokeWidth="10" />
        </g>
      );
    }
    return (
      <g transform={`rotate(${rot} 30 30)`}>
        <rect width="60" height="60" fill="#0f172a" />
        <path d="M22,60 L22,22 L60,22" fill="none" stroke="#38bdf8" strokeWidth="10" strokeLinecap="square" />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 60 60" className="w-full h-full block">
      {renderContent()}
    </svg>
  );
};

// ============================================================================
// ŞEKİL BULMACA (PUZZLE KESİK PARÇA)
// ============================================================================
const PuzzleCutSVG: React.FC<{
  puzzleId: string;
  mode: 'board' | 'piece';
  piece?: string;
}> = ({ puzzleId, mode, piece = 'exact' }) => {
  if (puzzleId === 'step_block') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="10" y="10" width="120" height="100" rx="10" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="3" />
          {/* Missing cutout on right side */}
          <polygon points="72,10 130,10 130,110 88,110 88,80 62,80 62,48 72,48" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="5,3" />
          <text x="98" y="66" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'mirrored'
        ? '10,10 68,10 68,48 78,48 78,80 52,80 52,110 10,110'
        : piece === 'too_tall'
        ? '42,4 100,4 100,116 58,116 58,80 32,80 32,48 42,48'
        : piece === 'wrong_notch'
        ? '42,10 100,10 100,110 58,110 58,72 80,72 80,45 42,45'
        : '42,10 100,10 100,110 58,110 58,80 32,80 32,48 42,48';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'tangram_cut') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 130 130" className="w-full max-w-[175px] h-auto mx-auto">
          <rect x="15" y="15" width="100" height="100" rx="8" fill="#10b981" stroke="#d1fae5" strokeWidth="3" />
          <polygon points="15,50 85,15 115,15 115,115 15,115" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="5,3" />
          <text x="72" y="76" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'flipped'
        ? '15,15 115,15 115,115 45,115 15,80'
        : piece === 'triangle_only'
        ? '15,115 115,15 115,115'
        : piece === 'reversed_slope'
        ? '15,15 45,15 115,50 115,115 15,115'
        : '15,50 85,15 115,15 115,115 15,115';
    return (
      <svg viewBox="0 0 130 130" className="w-20 h-20">
        <polygon points={pts} fill="#34d399" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'circle_jigsaw') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 130 130" className="w-full max-w-[175px] h-auto mx-auto">
          <circle cx="65" cy="65" r="50" fill="#f59e0b" stroke="#fef3c7" strokeWidth="3" />
          {/* Top-right missing quadrant with knob */}
          <path d="M65,65 L65,15 A50,50 0 0 1 115,65 L92,65 A10,10 0 0 1 72,65 Z" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="88" y="48" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const d =
      piece === 'inward_knob'
        ? 'M35,85 L35,35 A50,50 0 0 1 85,85 L68,85 A10,10 0 0 0 48,85 Z'
        : piece === 'mirrored'
        ? 'M85,85 L85,35 A50,50 0 0 0 35,85 L52,85 A10,10 0 0 0 72,85 Z'
        : piece === 'no_knob'
        ? 'M35,85 L35,35 A50,50 0 0 1 85,85 Z'
        : 'M35,85 L35,35 A50,50 0 0 1 85,85 L62,85 A10,10 0 0 1 42,85 Z';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <path d={d} fill="#fbbf24" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'hex_puzzle') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <polygon points="70,10 122,35 122,85 70,110 18,85 18,35" fill="#8b5cf6" stroke="#ede9fe" strokeWidth="3" />
          {/* Missing right half with 2 square teeth */}
          <polygon points="70,10 122,35 122,85 70,110 70,88 56,88 56,74 70,74 70,48 56,48 56,34 70,34" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="95" y="66" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'one_tooth'
        ? '50,10 102,35 102,85 50,110 50,70 36,70 36,52 50,52'
        : piece === 'mirrored'
        ? '70,10 18,35 18,85 70,110 70,88 84,88 84,74 70,74 70,48 84,48 84,34 70,34'
        : piece === 'round_teeth'
        ? '50,10 102,35 102,85 50,110 50,75 40,60 50,45'
        : '50,10 102,35 102,85 50,110 50,88 36,88 36,74 50,74 50,48 36,48 36,34 50,34';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill="#a78bfa" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'stairs_fit') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="6" fill="#ec4899" stroke="#fce7f3" strokeWidth="3" />
          {/* Missing stairs top-right: top width 30, mid 55, bottom 85? Wait hint says top 1, mid 2, bottom 3 units! */}
          <polygon points="88,15 125,15 125,105 40,105 40,75 64,75 64,45 88,45" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="95" y="75" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'flipped'
        ? '25,15 110,15 110,45 86,45 86,75 62,75 62,105 25,105'
        : piece === 'equal_steps'
        ? '60,15 105,15 105,105 25,105 25,60 60,60'
        : piece === 'two_steps'
        ? '65,15 105,15 105,105 30,105 30,58 65,58'
        : '73,15 110,15 110,105 25,105 25,75 49,75 49,45 73,45';
    return (
      <svg viewBox="0 0 130 120" className="w-20 h-20">
        <polygon points={pts} fill="#f472b6" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'arch_cut') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="3" />
          <path d="M35,15 L105,15 L105,45 L90,45 A20,20 0 0 1 50,45 L35,45 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="70" y="38" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const d =
      piece === 'triangle_arch'
        ? 'M25,30 L95,30 L95,60 L75,60 L60,86 L45,60 L25,60 Z'
        : piece === 'upside_down'
        ? 'M25,80 L95,80 L95,50 L80,50 A20,20 0 0 0 40,50 L25,50 Z'
        : piece === 'square_arch'
        ? 'M25,30 L95,30 L95,60 L80,60 L80,84 L40,84 L40,60 L25,60 Z'
        : 'M25,30 L95,30 L95,60 L80,60 A20,20 0 0 1 40,60 L25,60 Z';
    return (
      <svg viewBox="0 0 120 110" className="w-20 h-20">
        <path d={d} fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'cross_notch') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#a855f7" stroke="#f3e8ff" strokeWidth="3" />
          <polygon points="75,15 125,15 125,105 75,105 75,78 46,78 46,44 75,44" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="95" y="67" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'thin_cross'
        ? '60,15 105,15 105,105 60,105 60,70 48,70 48,54 60,54'
        : piece === 'mirrored'
        ? '15,15 65,15 65,44 94,44 94,78 65,78 65,105 15,105'
        : piece === 'no_tab'
        ? '60,15 105,15 105,105 60,105'
        : '60,15 105,15 105,105 60,105 60,78 31,78 31,44 60,44';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill="#c084fc" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'arrow_fit') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#f59e0b" stroke="#fef3c7" strokeWidth="3" />
          <polygon points="76,15 125,15 125,105 76,105 42,60" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="95" y="67" textAnchor="middle" fill="#38bdf8" fontSize="20" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'blunt'
        ? '56,15 105,15 105,105 56,105 42,78 42,42'
        : piece === 'mirrored'
        ? '15,15 64,15 98,60 64,105 15,105'
        : piece === 'steep'
        ? '62,15 105,15 105,105 62,105 48,60'
        : '56,15 105,15 105,105 56,105 22,60';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill="#fbbf24" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'shield_split') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <path d="M25,15 L115,15 L115,65 C115,90 70,108 70,108 C70,108 25,90 25,65 Z" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="3" />
          <path d="M70,15 L115,15 L115,65 C115,90 70,108 70,108 C54,84 86,44 70,15 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="92" y="64" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const d =
      piece === 'straight'
        ? 'M60,15 L105,15 L105,65 C105,90 60,108 60,108 Z'
        : piece === 'mirrored'
        ? 'M15,15 L60,15 C76,44 44,84 60,108 C60,108 15,90 15,65 Z'
        : piece === 'reversed_wave'
        ? 'M60,15 L105,15 L105,65 C105,90 60,108 60,108 C76,84 44,44 60,15 Z'
        : 'M60,15 L105,15 L105,65 C105,90 60,108 60,108 C44,84 76,44 60,15 Z';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <path d={d} fill="#fb7185" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  // zigzag_piece
  if (mode === 'board') {
    return (
      <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
        <rect x="15" y="15" width="110" height="90" rx="8" fill="#14b8a6" stroke="#ccfbf1" strokeWidth="3" />
        <polygon points="75,15 125,15 125,105 60,105 88,75 55,48" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
        <text x="96" y="68" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900">?</text>
      </svg>
    );
  }
  const pts =
    piece === 'inverted'
      ? '45,15 105,15 105,105 55,105 28,75 62,48'
      : piece === 'straight_edge'
      ? '55,15 105,15 105,105 55,105'
      : piece === 'wrong_corner'
      ? '55,15 105,15 105,105 40,105 40,55'
      : '55,15 105,15 105,105 40,105 68,75 35,48';
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20">
      <polygon points={pts} fill="#2dd4bf" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
};

// ============================================================================
// ŞEKİL-ZEMİN AYRIMI & GÖMÜLÜ ŞEKİL BULMA
// ============================================================================
const EmbeddedShapeSVG: React.FC<{ sceneId: string; compact?: boolean }> = ({ sceneId, compact = false }) => {
  if (sceneId === 'triangles_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <polygon points="90,15 160,130 20,130" fill="rgba(14,165,233,0.14)" stroke="#0284c7" strokeWidth="3.5" strokeLinejoin="round" />
        <line x1="55" y1="73" x2="125" y2="73" stroke="#d97706" strokeWidth="3" />
        <line x1="55" y1="73" x2="90" y2="130" stroke="#d97706" strokeWidth="3" />
        <line x1="125" y1="73" x2="90" y2="130" stroke="#d97706" strokeWidth="3" />
      </svg>
    );
  }
  if (sceneId === 'squares_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <rect x="25" y="15" width="130" height="120" fill="rgba(16,185,129,0.12)" stroke="#059669" strokeWidth="3.5" />
        <rect x="52" y="40" width="60" height="60" fill="rgba(217,119,6,0.14)" stroke="#d97706" strokeWidth="3" />
        <rect x="112" y="95" width="43" height="40" fill="rgba(225,29,72,0.14)" stroke="#e11d48" strokeWidth="3" />
        <line x1="25" y1="15" x2="155" y2="135" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,3" />
      </svg>
    );
  }
  if (sceneId === 'stars_in_hex') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <polygon points="90,10 155,42 155,108 90,140 25,108 25,42" fill="rgba(147,51,234,0.10)" stroke="#7e22ce" strokeWidth="3" />
        <line x1="25" y1="42" x2="155" y2="108" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="155" y1="42" x2="25" y2="108" stroke="#94a3b8" strokeWidth="1.5" />
        {/* 3 embedded subtle stars */}
        {[
          [52, 46, 0.45],
          [90, 75, 0.52],
          [126, 98, 0.45],
        ].map(([sx, sy, sc], i) => (
          <g key={i} transform={`translate(${sx - 24 * sc}, ${sy - 24 * sc}) scale(${sc})`}>
            <polygon
              points="24,5 29.5,17 42,18.5 32.5,27.5 35,40.5 24,34 13,40.5 15.5,27.5 6,18.5 18.5,17"
              fill="none"
              stroke="#d97706"
              strokeWidth="4"
            />
          </g>
        ))}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_house') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <path d="M35,85 L35,45 L60,22 L85,45 L85,85" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('tangle_')) {
    const isMatch = sceneId === 'tangle_B_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="18" y="16" width="84" height="72" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="18" y1="50" x2="102" y2="50" stroke="#94a3b8" strokeWidth="2" />
        <line x1="60" y1="16" x2="60" y2="88" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <path d="M35,85 L35,45 L60,22 L85,45 L85,85" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : sceneId === 'tangle_A' ? (
          <polygon points="28,82 60,24 92,82" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        ) : sceneId === 'tangle_C' ? (
          <path d="M30,30 L90,30 L60,80 Z" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        ) : (
          <path d="M35,20 L35,60 L60,82 L85,60 L85,20" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        )}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_Z') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <polyline points="28,24 92,24 28,76 92,76" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('z_')) {
    const isMatch = sceneId === 'z_C_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="20" y="16" width="80" height="68" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="20" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <polyline points="28,24 92,24 28,76 92,76" fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : sceneId === 'z_A' ? (
          <polyline points="28,76 28,24 92,76 92,24" fill="none" stroke="#059669" strokeWidth="3.5" />
        ) : sceneId === 'z_B' ? (
          <polyline points="92,24 28,24 28,76 92,76" fill="none" stroke="#059669" strokeWidth="3.5" />
        ) : (
          <polyline points="28,24 60,76 92,24" fill="none" stroke="#059669" strokeWidth="3.5" />
        )}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_flag') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <path d="M40,86 L40,20 L92,38 L40,56" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('flag_')) {
    const isMatch = sceneId === 'flag_D_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <circle cx="60" cy="50" r="36" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="20" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <path d="M40,86 L40,20 L92,38 L40,56" fill="none" stroke="#7e22ce" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : sceneId === 'flag_A' ? (
          <path d="M80,86 L80,20 L28,38 L80,56" fill="none" stroke="#7e22ce" strokeWidth="3.5" />
        ) : sceneId === 'flag_B' ? (
          <path d="M40,86 L40,20 L90,20 L90,56 L40,56" fill="none" stroke="#7e22ce" strokeWidth="3.5" />
        ) : (
          <path d="M25,65 L95,65 L60,22 Z" fill="none" stroke="#7e22ce" strokeWidth="3.5" />
        )}
      </svg>
    );
  }
  if (sceneId === 'circles_overlap_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <circle cx="80" cy="75" r="56" fill="rgba(14,165,233,0.12)" stroke="#0284c7" strokeWidth="3.5" />
        <circle cx="72" cy="72" r="34" fill="rgba(16,185,129,0.12)" stroke="#059669" strokeWidth="3" />
        <circle cx="114" cy="96" r="24" fill="rgba(217,119,6,0.12)" stroke="#d97706" strokeWidth="3" />
        <circle cx="80" cy="75" r="12" fill="rgba(225,29,72,0.16)" stroke="#e11d48" strokeWidth="3" />
      </svg>
    );
  }
  if (sceneId === 'diamonds_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <polygon points="90,10 162,75 90,140 18,75" fill="rgba(14,165,233,0.10)" stroke="#0284c7" strokeWidth="3.5" />
        <polygon points="90,22 114,48 90,74 66,48" fill="rgba(217,119,6,0.14)" stroke="#d97706" strokeWidth="3" />
        <polygon points="90,76 114,102 90,128 66,102" fill="rgba(16,185,129,0.14)" stroke="#059669" strokeWidth="3" />
        <polygon points="90,54 114,75 90,96 66,75" fill="rgba(225,29,72,0.16)" stroke="#e11d48" strokeWidth="3" />
      </svg>
    );
  }
  if (sceneId === 'find_embedded_M') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <polyline points="26,82 26,22 60,56 94,22 94,82" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('m_')) {
    const isMatch = sceneId === 'm_A_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="20" y="16" width="80" height="70" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="20" y1="52" x2="100" y2="52" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <polyline points="26,82 26,22 60,56 94,22 94,82" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : sceneId === 'm_B' ? (
          <polyline points="26,22 26,82 60,48 94,82 94,22" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        ) : sceneId === 'm_C' ? (
          <polyline points="26,22 94,22 94,82 26,82" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        ) : (
          <polyline points="26,82 60,22 94,82" fill="none" stroke="#0284c7" strokeWidth="3.5" />
        )}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_arrow') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <line x1="22" y1="50" x2="94" y2="50" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
        <polyline points="68,26 94,50 68,74" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('arrow_')) {
    const isMatch = sceneId === 'arrow_C_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="18" y="18" width="84" height="64" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="60" y1="18" x2="60" y2="82" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <>
            <line x1="22" y1="50" x2="94" y2="50" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <polyline points="68,26 94,50 68,74" fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : sceneId === 'arrow_A' ? (
          <>
            <line x1="26" y1="50" x2="98" y2="50" stroke="#059669" strokeWidth="3.5" />
            <polyline points="52,26 26,50 52,74" fill="none" stroke="#059669" strokeWidth="3.5" />
          </>
        ) : sceneId === 'arrow_B' ? (
          <>
            <line x1="60" y1="20" x2="60" y2="82" stroke="#059669" strokeWidth="3.5" />
            <polyline points="36,44 60,20 84,44" fill="none" stroke="#059669" strokeWidth="3.5" />
          </>
        ) : (
          <polygon points="30,26 92,50 30,74" fill="none" stroke="#059669" strokeWidth="3.5" />
        )}
      </svg>
    );
  }
  return null;
};

// ============================================================================
// AYNA SİMETRİSİ FİGÜRLERİ (DİKEY & YATAY YANSIMA)
// ============================================================================
const MirrorFigureSVG: React.FC<{
  figureId: string;
  transform?: 'same' | 'reflectX' | 'reflectY' | 'rotate180';
  compact?: boolean;
}> = ({ figureId, transform = 'same', compact = false }) => {
  const cssTransform =
    transform === 'reflectX'
      ? 'scale(-1, 1)'
      : transform === 'reflectY'
      ? 'scale(1, -1)'
      : transform === 'rotate180'
      ? 'scale(-1, -1)'
      : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      className={compact ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'}
      style={cssTransform ? { transform: cssTransform } : undefined}
    >
      {figureId === 'flag_arrow' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          {/* Asimetrik: sol dikey mavi blok, üstten sağa ok bayrağı, sağ alt köşede kırmızı nokta */}
          <rect x="20" y="16" width="14" height="68" rx="4" fill="#38bdf8" />
          <polygon points="34,20 84,36 34,54" fill="#f59e0b" />
          <circle cx="72" cy="72" r="11" fill="#f43f5e" />
        </g>
      )}

      {figureId === 'l_blocks' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          {/* Sol dikey kol + üstte sarı daire + sağ alt yatay ayak + sağ alt üçgen */}
          <rect x="22" y="18" width="18" height="62" rx="4" fill="#10b981" />
          <rect x="22" y="62" width="56" height="18" rx="4" fill="#10b981" />
          <circle cx="66" cy="30" r="10" fill="#fbbf24" />
          <polygon points="78,46 90,62 66,62" fill="#a855f7" />
        </g>
      )}

      {figureId === 'boat_pin' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          {/* Üstte kırmızı üçgen bayrak sağa, altta tekne tabanı sola eğimli */}
          <rect x="44" y="16" width="8" height="54" fill="#94a3b8" />
          <polygon points="52,16 86,30 52,44" fill="#f43f5e" />
          <polygon points="18,68 84,68 72,88 30,88" fill="#38bdf8" />
          <circle cx="78" cy="78" r="8" fill="#fbbf24" />
        </g>
      )}

      {figureId === 'pixel_step' && (
        <g stroke="#94a3b8" strokeWidth="1.8">
          {/* 3x3 asimetrik piksel */}
          <rect x="14" y="14" width="22" height="22" rx="3" fill="#e2e8f0" />
          <rect x="39" y="14" width="22" height="22" rx="3" fill="#e2e8f0" />
          <rect x="64" y="14" width="22" height="22" rx="3" fill="#10b981" stroke="#0f172a" />

          <rect x="14" y="39" width="22" height="22" rx="3" fill="#e2e8f0" />
          <rect x="39" y="39" width="22" height="22" rx="3" fill="#38bdf8" stroke="#0f172a" />
          <rect x="64" y="39" width="22" height="22" rx="3" fill="#10b981" stroke="#0f172a" />

          <rect x="14" y="64" width="22" height="22" rx="3" fill="#f59e0b" stroke="#0f172a" />
          <rect x="39" y="64" width="22" height="22" rx="3" fill="#e2e8f0" />
          <rect x="64" y="64" width="22" height="22" rx="3" fill="#e2e8f0" />
        </g>
      )}

      {figureId === 'diag_star' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          {/* Sol alttan sağ üste uzanan ok + sağ altta pembe yıldız/elmas */}
          <line x1="22" y1="78" x2="76" y2="24" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
          <polygon points="82,18 54,22 78,46" fill="#38bdf8" />
          <polygon points="74,60 88,74 74,88 60,74" fill="#f43f5e" />
          <circle cx="28" cy="30" r="9" fill="#fbbf24" />
        </g>
      )}

      {figureId === 'hook_spiral' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          <path
            d="M24,26 L70,26 A16,16 0 0 1 86,42 L86,66 A14,14 0 0 1 72,80 L48,80"
            fill="none"
            stroke="#a855f7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <polygon points="20,26 36,16 36,36" fill="#fbbf24" />
          <circle cx="46" cy="80" r="8" fill="#10b981" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// KÜP AÇILIMI & 3B KATLANMIŞ KÜP & ÜSTTEN GÖRÜNÜM
// ============================================================================
const CubeNetSVG: React.FC<{ faces: Record<string, { shape: ShapeKind; color: string }> }> = ({
  faces,
}) => {
  const renderFace = (faceKey: string | null) => {
    if (!faceKey || !faces[faceKey]) {
      return <div className="w-11 h-11 sm:w-12 sm:h-12" />;
    }
    const spec = faces[faceKey];
    return (
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-white border-2 border-slate-400 flex items-center justify-center shadow-sm">
        <ShapeGlyph shape={spec.shape} color={spec.color} size={28} />
      </div>
    );
  };

  // Classic 3-col x 4-row cross net
  const layout: (string | null)[][] = [
    [null, 'top', null],
    ['left', 'center', 'right'],
    [null, 'bottom', null],
    [null, 'tail', null],
  ];

  return (
    <div className="inline-flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-200 border border-slate-300 mx-auto">
      {layout.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1">
          {row.map((key, cIdx) => (
            <React.Fragment key={cIdx}>{renderFace(key)}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

const IsometricLabeledCubeSVG: React.FC<{
  cubeFaces: {
    top: { shape: ShapeKind; color: string };
    left: { shape: ShapeKind; color: string };
    right: { shape: ShapeKind; color: string };
  };
}> = ({ cubeFaces }) => {
  const renderIconInGroup = (
    spec: { shape: ShapeKind; color: string },
    cx: number,
    cy: number,
    scale: number
  ) => (
    <g transform={`translate(${cx - 24 * scale}, ${cy - 24 * scale}) scale(${scale})`}>
      {spec.shape === 'circle' && (
        <circle cx="24" cy="24" r="16" fill={spec.color} stroke="#0f172a" strokeWidth="2.8" />
      )}
      {spec.shape === 'square' && (
        <rect x="9" y="9" width="30" height="30" rx="4" fill={spec.color} stroke="#0f172a" strokeWidth="2.8" />
      )}
      {spec.shape === 'triangle' && (
        <polygon points="24,7 41,39 7,39" fill={spec.color} stroke="#0f172a" strokeWidth="2.8" strokeLinejoin="round" />
      )}
      {spec.shape === 'diamond' && (
        <polygon points="24,6 42,24 24,42 6,24" fill={spec.color} stroke="#0f172a" strokeWidth="2.8" strokeLinejoin="round" />
      )}
      {spec.shape === 'hexagon' && (
        <polygon
          points="24,6 39,14 39,34 24,42 9,34 9,14"
          fill={spec.color}
          stroke="#0f172a"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      )}
      {spec.shape === 'star' && (
        <polygon
          points="24,6 29.5,17.5 41.5,19 32.5,27.5 35,40 24,33.5 13,40 15.5,27.5 6.5,19 18.5,17.5"
          fill={spec.color}
          stroke="#0f172a"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      )}
    </g>
  );

  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20">
      {/* Top face */}
      <polygon points="60,12 104,34 60,56 16,34" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Left face */}
      <polygon points="16,34 60,56 60,104 16,82" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Right face */}
      <polygon points="60,56 104,34 104,82 60,104" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
      {renderIconInGroup(cubeFaces.top, 60, 34, 0.56)}
      {renderIconInGroup(cubeFaces.left, 38, 69, 0.56)}
      {renderIconInGroup(cubeFaces.right, 82, 69, 0.56)}
    </svg>
  );
};

const TopViewGridSVG: React.FC<{ grid: number[][] }> = ({ grid }) => {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-200 border border-slate-300">
      {grid.flat().map((val, idx) => (
        <div
          key={idx}
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm tabular-nums border ${
            val === 0
              ? 'bg-white border-dashed border-slate-400 text-slate-400'
              : val >= 3
              ? 'bg-sky-600 border-sky-700 text-white'
              : 'bg-sky-200 border-sky-400 text-slate-900'
          }`}
        >
          {val}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SAYISAL & ŞEKİLSEL ÖRÜNTÜ DİZİSİ SATIRI
// ============================================================================
const SequenceRowView: React.FC<{ items: any[] }> = ({ items }) => {
  const hasOnlyBadges = items.every((it) => it.kind === 'badge');
  return (
    <div
      className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap p-2.5 rounded-2xl bg-white border border-slate-300 shadow-sm max-w-2xl mx-auto"
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && !hasOnlyBadges && (
            <span className="text-sky-600 font-black text-sm sm:text-base">→</span>
          )}
          {item.kind === 'number' && (
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border-2 flex items-center justify-center font-black text-lg sm:text-xl tabular-nums text-slate-900 shadow-sm"
              style={{ borderColor: item.color || '#0284c7' }}
            >
              {item.text}
            </div>
          )}
          {item.kind === 'question' && (
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border-2 border-dashed flex items-center justify-center font-black text-xl text-amber-600"
              style={{ borderColor: item.color || '#d97706' }}
            >
              {item.text}
            </div>
          )}
          {item.kind === 'shape' && item.cell && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-center p-1">
              <ShapeGlyph
                shape={item.cell.shape}
                color={item.cell.color}
                rotation={item.cell.rotation}
                count={item.cell.count}
                innerDot={item.cell.innerDot}
                size={36}
              />
            </div>
          )}
          {item.kind === 'badge' && (
            <div
              className="px-3 py-2 rounded-xl bg-slate-50 border-2 text-xs sm:text-sm font-bold text-slate-900"
              style={{ borderColor: item.color || '#0284c7' }}
            >
              {item.text}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ============================================================================
// ANA SORU SAHNESİ RENDERER (QUIZ GÖRSELLERİ)
// ============================================================================
export const BilsemQuestionVisual: React.FC<{ question: QuizVisualQuestion }> = ({ question }) => {
  const { visualType, visualData } = question;

  if (visualType === 'cubes3d') {
    return (
      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-300 shadow-sm max-w-[260px] mx-auto">
        <IsometricCubesSVG heights={visualData.heights} />
      </div>
    );
  }

  if (visualType === 'balance') {
    const renderPan = (shapes: ShapeKind[]) => (
      <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300">
        {shapes.map((s, i) => (
          <ShapeGlyph
            key={i}
            shape={s}
            color={s === 'square' ? '#38bdf8' : s === 'star' ? '#f59e0b' : s === 'hexagon' ? '#a855f7' : '#10b981'}
            size={28}
          />
        ))}
      </div>
    );
    return (
      <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto">
        {[visualData.scale1, visualData.scale2].map((sc, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-300 shadow-sm">
            {renderPan(sc.left)}
            <div className="flex flex-col items-center px-2">
              <span className="text-amber-600 font-black text-lg">=</span>
              <span className="text-[10px] text-slate-500 font-bold">DENGE</span>
            </div>
            {renderPan(sc.right)}
          </div>
        ))}
      </div>
    );
  }

  if (visualType === 'analogy') {
    const renderBox = (cell: MatrixCellSpec | null, label?: string) => (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center">
        {cell ? (
          <ShapeGlyph
            shape={cell.shape}
            color={cell.color}
            rotation={cell.rotation}
            count={cell.count}
            innerDot={cell.innerDot}
            size={44}
          />
        ) : (
          <span className="text-2xl font-black text-amber-600">{label || '?'}</span>
        )}
      </div>
    );
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2">
        {renderBox(visualData.a)}
        <span className="text-xl font-black text-sky-600">→</span>
        {renderBox(visualData.b)}
        <span className="text-lg font-black text-slate-500 px-1">::</span>
        {renderBox(visualData.c)}
        <span className="text-xl font-black text-sky-600">→</span>
        {renderBox(null, '?')}
      </div>
    );
  }

  if (visualType === 'matrix3x3') {
    const cells: (MatrixCellSpec | null)[] = visualData.cells;
    return (
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2.5 rounded-2xl bg-slate-200 border-2 border-slate-300 max-w-[260px] mx-auto shadow-inner">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`aspect-square rounded-xl flex items-center justify-center p-1 border ${
              cell ? 'bg-white border-slate-300' : 'bg-amber-100 border-2 border-dashed border-amber-500'
            }`}
          >
            {cell ? (
              <ShapeGlyph
                shape={cell.shape}
                color={cell.color}
                rotation={cell.rotation}
                count={cell.count}
                innerDot={cell.innerDot}
                size={42}
              />
            ) : (
              <span className="text-2xl font-black text-amber-600">?</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (visualType === 'cipher') {
    const colorMap: Record<ShapeKind, string> = {
      triangle: '#38bdf8',
      square: '#f59e0b',
      star: '#a855f7',
      circle: '#10b981',
      hexagon: '#f43f5e',
      diamond: '#eab308',
    };
    return (
      <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
        {visualData.rows.map((r: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between px-4 py-2 rounded-xl bg-white border border-slate-300 shadow-sm">
            <div className="flex items-center gap-2">
              {r.shapes.map((s: ShapeKind, si: number) => (
                <ShapeGlyph key={si} shape={s} color={colorMap[s]} size={32} />
              ))}
            </div>
            <span className="text-slate-500 font-black">→</span>
            <span className="font-mono font-black text-lg text-slate-900 tracking-widest tabular-nums">{r.code}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-sky-50 border-2 border-sky-400">
          <div className="flex items-center gap-2">
            {visualData.target.map((s: ShapeKind, si: number) => (
              <ShapeGlyph key={si} shape={s} color={colorMap[s]} size={32} />
            ))}
          </div>
          <span className="text-sky-600 font-black">→</span>
          <span className="font-mono font-black text-xl text-amber-600 tracking-widest">? ? ?</span>
        </div>
      </div>
    );
  }

  if (visualType === 'shadow') {
    return (
      <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center mx-auto p-3 shadow-sm">
        <ShadowFigureSVG figure={visualData.figure} isShadow={false} />
      </div>
    );
  }

  if (visualType === 'pattern_tile') {
    return (
      <div className="grid grid-cols-2 w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-slate-400 mx-auto shadow-md bg-white">
        <div className="border-r border-b border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={0} />
        </div>
        <div className="border-b border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={1} />
        </div>
        <div className="border-r border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={2} />
        </div>
        <div className="bg-amber-50 flex items-center justify-center border-2 border-dashed border-amber-500">
          <span className="text-3xl font-black text-amber-600">?</span>
        </div>
      </div>
    );
  }

  if (visualType === 'puzzle_cut') {
    return (
      <div className="p-2 rounded-2xl bg-white border border-slate-300 shadow-sm flex items-center justify-center max-w-[230px] mx-auto">
        <PuzzleCutSVG puzzleId={visualData.puzzleId} mode="board" />
      </div>
    );
  }

  if (visualType === 'embedded_shape') {
    return (
      <div className="p-2.5 rounded-2xl bg-white border border-slate-300 shadow-sm flex items-center justify-center max-w-[260px] mx-auto">
        <EmbeddedShapeSVG sceneId={visualData.sceneId} />
      </div>
    );
  }

  if (visualType === 'mirror_axis') {
    const isHorizontal = visualData.axis === 'horizontal';
    return (
      <div
        className={`p-3 rounded-2xl bg-white border border-slate-300 shadow-sm flex ${
          isHorizontal ? 'flex-col' : 'flex-row'
        } items-center justify-center gap-3 max-w-xs mx-auto`}
      >
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
          <MirrorFigureSVG figureId={visualData.figureId} transform="same" />
        </div>
        <div
          className={
            isHorizontal
              ? 'w-32 h-0.5 border-t-2 border-dashed border-cyan-600 relative flex items-center justify-center'
              : 'h-24 w-0.5 border-l-2 border-dashed border-cyan-600 relative flex items-center justify-center'
          }
        >
          <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-500 text-[10px] font-black text-cyan-800 whitespace-nowrap">
            AYNA
          </span>
        </div>
        <div className="w-20 h-20 rounded-xl bg-amber-50 border-2 border-dashed border-amber-500 flex items-center justify-center text-2xl font-black text-amber-600">
          ?
        </div>
      </div>
    );
  }

  if (visualType === 'cube_net') {
    return <CubeNetSVG faces={visualData.faces} />;
  }

  if (visualType === 'sequence_row') {
    return <SequenceRowView items={visualData.items} />;
  }

  return null;
};

export const BilsemOptionVisual: React.FC<{
  question: QuizVisualQuestion;
  visual: any;
}> = ({ question, visual }) => {
  if (!visual) return null;
  if (
    question.visualType === 'matrix3x3' ||
    question.visualType === 'analogy' ||
    question.visualType === 'sequence_row'
  ) {
    return (
      <ShapeGlyph
        shape={visual.shape}
        color={visual.color}
        rotation={visual.rotation}
        count={visual.count}
        innerDot={visual.innerDot}
        size={48}
      />
    );
  }
  if (question.visualType === 'mirror_axis') {
    return <MirrorFigureSVG figureId={visual.figureId} transform={visual.transform} compact={true} />;
  }
  if (question.visualType === 'cube_net') {
    if (visual.cubeFaces) {
      return <IsometricLabeledCubeSVG cubeFaces={visual.cubeFaces} />;
    }
    return <ShapeGlyph shape={visual.shape} color={visual.color} size={46} />;
  }
  if (question.visualType === 'cubes3d' && visual.grid) {
    return <TopViewGridSVG grid={visual.grid} />;
  }
  if (question.visualType === 'shadow') {
    return (
      <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center">
        <ShadowFigureSVG figure={visual.figure} isShadow={true} variant={visual.variant} />
      </div>
    );
  }
  if (question.visualType === 'pattern_tile') {
    return (
      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
        <PatternTileSquareSVG patternId={visual.patternId} quadrant="option" piece={visual.piece} />
      </div>
    );
  }
  if (question.visualType === 'puzzle_cut') {
    return <PuzzleCutSVG puzzleId={visual.puzzleId} mode="piece" piece={visual.piece} />;
  }
  if (question.visualType === 'embedded_shape') {
    return <EmbeddedShapeSVG sceneId={visual.sceneId} compact={true} />;
  }
  return null;
};

// ============================================================================
// GÖRSEL AYIRT ETME KARTI (FARKLI OLANI BUL)
// ============================================================================
export const SpotOddCardSVG: React.FC<{
  theme: SpotOddTheme;
  isOdd: boolean;
}> = ({ theme, isOdd }) => {
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
      {theme === 'robot' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <line x1="60" y1="22" x2="60" y2="10" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="60" cy="10" r="5" fill={isOdd ? '#f43f5e' : '#fbbf24'} />
          <rect x="34" y="22" width="52" height="34" rx="8" fill="#38bdf8" />
          <circle cx="48" cy="37" r="5" fill="#0f172a" />
          <circle cx="72" cy="37" r="5" fill="#0f172a" />
          <rect x="46" y="47" width="28" height="4" rx="2" fill="#ffffff" />
          <rect x="28" y="60" width="64" height="42" rx="8" fill="#0284c7" />
          <circle cx="46" cy="76" r="5" fill="#fbbf24" />
          {!isOdd && <circle cx="60" cy="76" r="5" fill="#10b981" />}
          <circle cx="74" cy="76" r="5" fill="#f43f5e" />
        </g>
      )}

      {theme === 'house' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* Baca */}
          <rect x={isOdd ? '28' : '76'} y="18" width="12" height="24" fill="#94a3b8" />
          {/* Çatı */}
          <polygon points="18,52 60,16 102,52" fill="#f43f5e" />
          {!isOdd && <circle cx="60" cy="38" r="6" fill="#fef08a" />}
          {/* Gövde */}
          <rect x="24" y="52" width="72" height="54" rx="4" fill="#fde68a" />
          <rect x="50" y="72" width="20" height="34" fill="#92400e" />
          <rect x="30" y="62" width="14" height="14" fill="#38bdf8" />
          <rect x="76" y="62" width="14" height="14" fill="#38bdf8" />
        </g>
      )}

      {theme === 'owl' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="60" cy="68" rx="34" ry="38" fill="#a855f7" />
          <ellipse cx="60" cy="78" rx="22" ry="22" fill="#e9d5ff" />
          {/* Gözler */}
          <circle cx="45" cy="46" r="12" fill="#ffffff" />
          <circle cx="75" cy="46" r="12" fill="#ffffff" />
          <circle cx="46" cy="46" r="5" fill="#0f172a" />
          <circle cx="74" cy="46" r="5" fill="#0f172a" />
          {/* Kaş farkı */}
          {isOdd && <line x1="65" y1="30" x2="86" y2="25" stroke="#fde047" strokeWidth="3.5" />}
          {/* Gaga */}
          <polygon points="54,54 66,54 60,64" fill="#f59e0b" />
          {/* Göğüs benekleri */}
          <circle cx="52" cy="76" r="3" fill="#7e22ce" />
          {!isOdd && <circle cx="60" cy="84" r="3" fill="#7e22ce" />}
          <circle cx="68" cy="76" r="3" fill="#7e22ce" />
        </g>
      )}

      {theme === 'ship' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="58" y="18" width="4" height="58" fill="#78350f" />
          <polygon points={isOdd ? '58,18 38,24 58,30' : '62,18 82,24 62,30'} fill="#f43f5e" />
          <polygon points="58,28 24,72 58,72" fill="#ffffff" />
          <polygon points="62,36 92,72 62,72" fill="#fde047" />
          <polygon points="16,74 104,74 90,98 30,98" fill="#0284c7" />
          <circle cx="44" cy="86" r="5" fill="#e0f2fe" />
          {isOdd && <circle cx="60" cy="86" r="5" fill="#e0f2fe" />}
          <circle cx="76" cy="86" r="5" fill="#e0f2fe" />
        </g>
      )}

      {theme === 'flower' && (
        <g stroke="#0f172a" strokeWidth="2" strokeLinejoin="round">
          <line x1="60" y1="54" x2="60" y2="108" stroke="#22c55e" strokeWidth="5" />
          <ellipse cx="44" cy="86" rx="12" ry="6" fill="#22c55e" transform="rotate(-25 44 86)" />
          {!isOdd && <ellipse cx="76" cy="86" rx="12" ry="6" fill="#22c55e" transform="rotate(25 76 86)" />}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={deg}
              cx={60 + Math.cos((deg * Math.PI) / 180) * 18}
              cy={42 + Math.sin((deg * Math.PI) / 180) * 18}
              r="11"
              fill={isOdd && deg === 120 ? '#38bdf8' : '#fb7185'}
            />
          ))}
          <circle cx="60" cy="42" r="12" fill="#fde047" />
        </g>
      )}

      {theme === 'clock' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          <circle cx="60" cy="60" r="44" fill="#f8fafc" stroke="#38bdf8" strokeWidth="5" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
            <circle
              key={d}
              cx={60 + Math.cos((d * Math.PI) / 180) * 35}
              cy={60 + Math.sin((d * Math.PI) / 180) * 35}
              r="2.2"
              fill="#334155"
            />
          ))}
          {/* Yelkovan (12'ye) */}
          <line x1="60" y1="60" x2="60" y2="30" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          {/* Akrep: normal 3'e, odd 9'a */}
          <line
            x1="60"
            y1="60"
            x2={isOdd ? '36' : '84'}
            y2="60"
            stroke="#dc2626"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="4" fill="#0f172a" />
        </g>
      )}

      {theme === 'train' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* Duman bulutu (odd olanda yok) */}
          {!isOdd && (
            <>
              <circle cx="38" cy="20" r="7" fill="#e2e8f0" />
              <circle cx="50" cy="14" r="9" fill="#f8fafc" />
            </>
          )}
          {/* Baca */}
          <rect x="30" y="28" width="12" height="22" fill="#334155" />
          {/* Kazanlı ön gövde */}
          <rect x="22" y="48" width="46" height="32" rx="4" fill="#ef4444" />
          {/* Kabin */}
          <rect x="64" y="34" width="34" height="46" rx="4" fill="#2563eb" />
          {/* Pencere rengi farkı */}
          <rect x="72" y="42" width="18" height="16" rx="3" fill={isOdd ? '#10b981' : '#fef08a'} />
          {/* Tekerlekler */}
          <circle cx="34" cy="86" r="10" fill="#fbbf24" />
          <circle cx="58" cy="86" r="10" fill="#fbbf24" />
          <circle cx="84" cy="86" r="12" fill="#fbbf24" />
        </g>
      )}

      {theme === 'cake' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* Mumlar (odd olanda orta mum eksik) */}
          <rect x="38" y="26" width="6" height="22" fill="#38bdf8" />
          <ellipse cx="41" cy="20" rx="3.5" ry="5.5" fill="#fbbf24" />
          {!isOdd && (
            <>
              <rect x="57" y="22" width="6" height="26" fill="#a855f7" />
              <ellipse cx="60" cy="16" rx="3.5" ry="5.5" fill="#fbbf24" />
            </>
          )}
          <rect x="76" y="26" width="6" height="22" fill="#10b981" />
          <ellipse cx="79" cy="20" rx="3.5" ry="5.5" fill="#fbbf24" />
          {/* Pasta üst kreması ve gövdesi */}
          <rect x="22" y="48" width="76" height="24" rx="6" fill="#fda4af" />
          <rect x="18" y="70" width="84" height="28" rx="6" fill="#92400e" />
          <rect x="14" y="96" width="92" height="8" rx="4" fill="#cbd5e1" />
        </g>
      )}

      {theme === 'mushroom' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* Sap */}
          <rect x="46" y="60" width="28" height="44" rx="8" fill="#fef3c7" />
          {/* Şapka */}
          <path d="M16,64 C16,24 104,24 104,64 Z" fill="#ef4444" />
          {/* Beyaz benekler */}
          <circle cx="42" cy="44" r="7" fill="#ffffff" />
          <circle cx="62" cy="36" r="8" fill="#ffffff" />
          <circle cx="80" cy="48" r="6" fill="#ffffff" />
          {!isOdd && <circle cx="68" cy="54" r="5" fill="#ffffff" />}
        </g>
      )}

      {theme === 'balloon' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* İpler */}
          <line x1="46" y1="74" x2="50" y2="90" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="74" y1="74" x2="70" y2="90" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Sepet */}
          <rect x="46" y="88" width="28" height="18" rx="4" fill="#92400e" />
          {/* Balon kubbesi */}
          <circle cx="60" cy="44" r="32" fill="#38bdf8" />
          {/* Orta şerit */}
          <ellipse cx="60" cy="44" rx="14" ry="32" fill={isOdd ? '#eab308' : '#10b981'} />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// ETKİNLİK KARTI MİNİ ANLATIM GÖRSELLERİ (İKONUN YANINDAKİ AÇIKLAYICI ŞEMA)
// ============================================================================
export const BilsemActivityMiniPreview: React.FC<{ activityId: BilsemActivityId }> = ({
  activityId,
}) => {
  return (
    <svg
      viewBox="0 0 112 56"
      className="w-full h-full overflow-visible"
      aria-hidden="true"
    >
      {/* 1. ÇOKLU ZEKA: Küçük denge terazisi + analoji okları */}
      {activityId === 'coklu_zeka' && (
        <g>
          {/* Sol: 1 yıldız -> 2 yıldız */}
          <rect x="4" y="10" width="22" height="36" rx="5" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.6" />
          <polygon points="15,17 17.5,23 23.5,23.5 19,27.5 20.5,33.5 15,30 9.5,33.5 11,27.5 6.5,23.5 12.5,23" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
          <path d="M29,28 L38,28 M35,24 L39,28 L35,32" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Orta: Terazi / İki kare */}
          <rect x="42" y="10" width="28" height="36" rx="5" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.6" />
          <polygon points="51,21 57,33 45,33" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
          <polygon points="62,21 68,33 56,33" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
          <path d="M73,28 L82,28 M79,24 L83,28 L79,32" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sağ: ? Kutusu */}
          <rect x="86" y="10" width="22" height="36" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="1.8" strokeDasharray="3 2" />
          <text x="97" y="34" textAnchor="middle" fontSize="18" fontWeight="900" fill="#b45309">?</text>
        </g>
      )}

      {/* 2. BİLSEM ÖN TEST: 3x3 Matris ve ? */}
      {activityId === 'on_test' && (
        <g transform="translate(29, 3)">
          <rect x="0" y="0" width="54" height="50" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.4" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const x = 3 + c * 16.5;
              const y = 3 + r * 15.2;
              const isLast = r === 2 && c === 2;
              return (
                <g key={`${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width="14.5"
                    height="13.2"
                    rx="3"
                    fill={isLast ? '#fef3c7' : '#ffffff'}
                    stroke={isLast ? '#d97706' : '#cbd5e1'}
                    strokeWidth={isLast ? '1.4' : '1'}
                    strokeDasharray={isLast ? '2.5 1.5' : undefined}
                  />
                  {!isLast && r === 0 && (
                    <circle cx={x + 7.2} cy={y + 6.6} r={2.2 + c * 1.1} fill="#0284c7" />
                  )}
                  {!isLast && r === 1 && (
                    <rect x={x + 4.2 - c * 0.6} y={y + 3.6 - c * 0.4} width={6 + c * 1.2} height={6 + c * 1.2} rx="1" fill="#f59e0b" />
                  )}
                  {!isLast && r === 2 && (
                    <polygon points={`${x + 7.2},${y + 2.5} ${x + 11.5 - (1 - c)},${y + 10.5} ${x + 3 + (1 - c)},${y + 10.5}`} fill="#7c3aed" />
                  )}
                  {isLast && (
                    <text x={x + 7.2} y={y + 10.2} textAnchor="middle" fontSize="10" fontWeight="900" fill="#b45309">?</text>
                  )}
                </g>
              );
            })
          )}
        </g>
      )}

      {/* 3. BİLİŞSEL UYARIM: Parlayan Hafıza Matrisi */}
      {activityId === 'bilissel_uyarim' && (
        <g>
          <g transform="translate(14, 4)">
            <rect x="0" y="0" width="48" height="48" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.4" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
              const r = Math.floor(idx / 3);
              const c = idx % 3;
              const lit = idx === 0 || idx === 4 || idx === 7;
              return (
                <rect
                  key={idx}
                  x={3 + c * 14.5}
                  y={3 + r * 14.5}
                  width="12.5"
                  height="12.5"
                  rx="2.5"
                  fill={lit ? '#fbbf24' : '#ffffff'}
                  stroke={lit ? '#b45309' : '#cbd5e1'}
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
          {/* Göz / Hafıza ikonu sağda */}
          <path d="M72,28 C78,18 94,18 100,28 C94,38 78,38 72,28 Z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.8" />
          <circle cx="86" cy="28" r="5" fill="#7c3aed" />
          <circle cx="84.5" cy="26.5" r="1.6" fill="#ffffff" />
        </g>
      )}

      {/* 4. DİKKATİ GÜÇLENDİRME: Hedef Sembol Tarama (✓) */}
      {activityId === 'dikkati_guclendirme' && (
        <g transform="translate(8, 5)">
          <rect x="0" y="0" width="96" height="46" rx="7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
          {[
            { x: 14, y: 14, kind: 'star', ok: true },
            { x: 37, y: 14, kind: 'circle', ok: false },
            { x: 60, y: 14, kind: 'star', ok: true },
            { x: 83, y: 14, kind: 'tri', ok: false },
            { x: 14, y: 34, kind: 'tri', ok: false },
            { x: 37, y: 34, kind: 'star', ok: true },
            { x: 60, y: 34, kind: 'sq', ok: false },
            { x: 83, y: 34, kind: 'circle', ok: false },
          ].map((item, i) => (
            <g key={i}>
              {item.ok && (
                <rect x={item.x - 9} y={item.y - 8} width="18" height="16" rx="4" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.3" />
              )}
              {item.kind === 'star' && (
                <polygon
                  points={`${item.x},${item.y - 6} ${item.x + 2},${item.y - 2} ${item.x + 6.5},${item.y - 1.5} ${item.x + 3},${item.y + 1.5} ${item.x + 4},${item.y + 6} ${item.x},${item.y + 3.5} ${item.x - 4},${item.y + 6} ${item.x - 3},${item.y + 1.5} ${item.x - 6.5},${item.y - 1.5} ${item.x - 2},${item.y - 2}`}
                  fill="#0284c7"
                  stroke="#0f172a"
                  strokeWidth="0.9"
                />
              )}
              {item.kind === 'circle' && (
                <circle cx={item.x} cy={item.y} r="5.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.9" />
              )}
              {item.kind === 'tri' && (
                <polygon points={`${item.x},${item.y - 6} ${item.x + 6},${item.y + 5} ${item.x - 6},${item.y + 5}`} fill="#f43f5e" stroke="#0f172a" strokeWidth="0.9" />
              )}
              {item.kind === 'sq' && (
                <rect x={item.x - 5} y={item.y - 5} width="10" height="10" rx="1.5" fill="#a855f7" stroke="#0f172a" strokeWidth="0.9" />
              )}
              {item.ok && (
                <circle cx={item.x + 7} cy={item.y - 6} r="4" fill="#16a34a" />
              )}
            </g>
          ))}
        </g>
      )}

      {/* 5. GÖLGE ETKİNLİKLERİ: Renkli Roket -> Siyah Gölge */}
      {activityId === 'golge_etkinlikleri' && (
        <g>
          {/* Sol: Renkli Roket */}
          <g transform="translate(26, 28) scale(0.42)">
            <polygon points="0,-42 16,-14 -16,-14" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
            <rect x="-14" y="-14" width="28" height="36" rx="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="0" cy="2" r="7" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
            <polygon points="-14,6 -26,24 -14,22" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
            <polygon points="14,6 26,24 14,22" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
          </g>
          <path d="M46,28 L64,28 M60,23 L65,28 L60,33" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sağ: Siyah Gölge */}
          <g transform="translate(86, 28) scale(0.42)">
            <polygon points="0,-42 16,-14 -16,-14" fill="#0f172a" />
            <rect x="-14" y="-14" width="28" height="36" rx="4" fill="#0f172a" />
            <polygon points="-14,6 -26,24 -14,22" fill="#0f172a" />
            <polygon points="14,6 26,24 14,22" fill="#0f172a" />
          </g>
        </g>
      )}

      {/* 6. DESEN ETKİNLİKLERİ: 2x2 Simetrik Karo ve ? */}
      {activityId === 'desen_etkinlikleri' && (
        <g transform="translate(32, 4)">
          <rect x="0" y="0" width="48" height="48" rx="7" fill="#ffffff" stroke="#64748b" strokeWidth="1.6" />
          {/* Sol üst */}
          <rect x="2" y="2" width="21" height="21" rx="3" fill="#0f172a" />
          <path d="M2,23 A21,21 0 0,1 23,2 L23,23 Z" fill="#f43f5e" />
          {/* Sağ üst */}
          <rect x="25" y="2" width="21" height="21" rx="3" fill="#0f172a" />
          <path d="M25,2 A21,21 0 0,1 46,23 L25,23 Z" fill="#f43f5e" />
          {/* Sol alt */}
          <rect x="2" y="25" width="21" height="21" rx="3" fill="#0f172a" />
          <path d="M2,25 A21,21 0 0,0 23,46 L23,25 Z" fill="#f43f5e" />
          {/* Sağ alt ? */}
          <rect x="25" y="25" width="21" height="21" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="35.5" y="40.5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#b45309">?</text>
        </g>
      )}

      {/* 7. ŞEKİL BULMACA (PUZZLE): Eksik parça yerleşimi */}
      {activityId === 'sekil_bulmaca' && (
        <g>
          {/* Sol: Büyük blok ve kesik boşluk */}
          <rect x="14" y="6" width="44" height="44" rx="6" fill="#0284c7" stroke="#0f172a" strokeWidth="1.6" />
          <polygon points="36,6 58,6 58,28 38,22" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.4" strokeDasharray="2.5 2" />
          {/* Ok */}
          <path d="M72,22 L62,22 M65,18 L61,22 L65,26" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sağ: Çıkan parça */}
          <polygon points="78,12 100,12 100,34 80,28" fill="#fb923c" stroke="#0f172a" strokeWidth="1.6" />
        </g>
      )}

      {/* 8. ŞEKİL NESNE BULMA: Karmaşık çizgiler içinde gizli üçgen */}
      {activityId === 'sekil_nesne_bulma' && (
        <g>
          <rect x="24" y="5" width="64" height="46" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
          {/* Arka gri çizgiler */}
          <rect x="34" y="12" width="42" height="32" fill="none" stroke="#94a3b8" strokeWidth="1.4" />
          <line x1="34" y1="12" x2="76" y2="44" stroke="#94a3b8" strokeWidth="1.4" />
          <line x1="76" y1="12" x2="34" y2="44" stroke="#94a3b8" strokeWidth="1.4" />
          <circle cx="55" cy="28" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.4" />
          {/* Vurgulanmış gizli üçgen */}
          <polygon points="55,11 73,41 37,41" fill="#4f46e5" fillOpacity="0.18" stroke="#4f46e5" strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      )}

      {/* 9. GÖRSEL AYIRT ETME: İki yan yana şekil + fark işareti */}
      {activityId === 'gorsel_ayirt_etme' && (
        <g>
          {/* Normal yüz/robot */}
          <rect x="10" y="13" width="30" height="30" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.6" />
          <line x1="25" y1="13" x2="25" y2="7" stroke="#64748b" strokeWidth="2" />
          <circle cx="25" cy="6" r="3.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="19" cy="24" r="2.8" fill="#0f172a" />
          <circle cx="31" cy="24" r="2.8" fill="#0f172a" />
          <rect x="18" y="32" width="14" height="3" rx="1.5" fill="#ffffff" />

          {/* ≠ işaret */}
          <text x="56" y="33" textAnchor="middle" fontSize="16" fontWeight="900" fill="#e11d48">≠</text>

          {/* Farklı yüz/robot (kırmızı anten vurgusu) */}
          <rect x="72" y="13" width="30" height="30" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.6" />
          <line x1="87" y1="13" x2="87" y2="7" stroke="#64748b" strokeWidth="2" />
          <circle cx="87" cy="6" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="87" cy="6" r="7" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2.5 1.5" />
          <circle cx="81" cy="24" r="2.8" fill="#0f172a" />
          <circle cx="93" cy="24" r="2.8" fill="#0f172a" />
          <rect x="80" y="32" width="14" height="3" rx="1.5" fill="#ffffff" />
        </g>
      )}

      {/* 10. AYNA SİMETRİSİ: Dikey ayna ekseni & yansıyan L-şekli */}
      {activityId === 'ayna_simetrisi' && (
        <g>
          {/* Sol şekil */}
          <polygon points="16,14 38,14 38,24 26,24 26,42 16,42" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="32" cy="19" r="2.8" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
          {/* Ayna çizgisi */}
          <line x1="56" y1="4" x2="56" y2="52" stroke="#0891b2" strokeWidth="2.4" strokeDasharray="4 3" />
          {/* Sağ yansıma */}
          <polygon points="96,14 74,14 74,24 86,24 86,42 96,42" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="80" cy="19" r="2.8" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
        </g>
      )}

      {/* 11. KÜP AÇILIMI: Açık artı ağı -> 3B küp */}
      {activityId === 'kup_acilimi' && (
        <g>
          {/* Küçük küp ağı (sol) */}
          <g transform="translate(10, 4)" stroke="#0f172a" strokeWidth="1.1">
            <rect x="11" y="0" width="11" height="11" fill="#fde68a" />
            <rect x="0" y="11" width="11" height="11" fill="#a7f3d0" />
            <rect x="11" y="11" width="11" height="11" fill="#bae6fd" />
            <rect x="22" y="11" width="11" height="11" fill="#ddd6fe" />
            <rect x="11" y="22" width="11" height="11" fill="#fecdd3" />
            <rect x="11" y="33" width="11" height="11" fill="#fef08a" />
          </g>
          <path d="M48,28 L61,28 M57,24 L62,28 L57,32" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sağ: 3B İzometrik Küp */}
          <g transform="translate(84, 29)" stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round">
            <polygon points="0,-20 17,-10 0,0 -17,-10" fill="#fde68a" />
            <polygon points="-17,-10 0,0 0,18 -17,8" fill="#bae6fd" />
            <polygon points="0,0 17,-10 17,8 0,18" fill="#ddd6fe" />
          </g>
        </g>
      )}

      {/* 12. ÖRÜNTÜ DİZİLERİ: [2] -> [4] -> [7] -> [?] */}
      {activityId === 'oruntu_dizileri' && (
        <g>
          {[
            { x: 4, text: '2', fill: '#f0f9ff', stroke: '#0284c7', color: '#0f172a' },
            { x: 31, text: '4', fill: '#f0f9ff', stroke: '#0284c7', color: '#0f172a' },
            { x: 58, text: '7', fill: '#f0f9ff', stroke: '#0284c7', color: '#0f172a' },
            { x: 85, text: '?', fill: '#fef3c7', stroke: '#d97706', color: '#b45309' },
          ].map((box, idx) => (
            <g key={idx}>
              {idx > 0 && (
                <path
                  d={`M${box.x - 5},28 L${box.x - 1},28`}
                  stroke="#65a30d"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
              <rect
                x={box.x}
                y="15"
                width="22"
                height="26"
                rx="5"
                fill={box.fill}
                stroke={box.stroke}
                strokeWidth="1.6"
                strokeDasharray={box.text === '?' ? '3 2' : undefined}
              />
              <text
                x={box.x + 11}
                y="33"
                textAnchor="middle"
                fontSize="13"
                fontWeight="900"
                fill={box.color}
              >
                {box.text}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

