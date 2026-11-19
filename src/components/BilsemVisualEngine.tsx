import React from 'react';
import {
  BilsemActivityId,
  MatrixCellSpec,
  QuizVisualQuestion,
  ShapeKind,
  SpotOddTheme,
} from '../data/bilsemActivitiesData';
import {
  EmbeddedSceneSpec,
  MirrorMosaicSpec,
  PatternTileSpec,
  PuzzleCutSpec,
  SpotOddGlyphSpec,
} from '../data/bilsemVisualTypes';
import {
  BilsemSampleOptionVisual,
  BilsemSampleQuestionVisual,
} from './BilsemSampleVisuals';

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

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const projected = cubes.map((cube) => {
    const cx = (cube.x - cube.y) * dx;
    const cy = (cube.x + cube.y) * dy - cube.z * cubeH;
    minX = Math.min(minX, cx - dx);
    maxX = Math.max(maxX, cx + dx);
    minY = Math.min(minY, cy - dy * 2);
    maxY = Math.max(maxY, cy + cubeH);
    return { cx, cy };
  });

  const padX = 16;
  const padTop = 16;
  const padBottom = 22;
  const rawW = Number.isFinite(maxX) ? maxX - minX : 100;
  const rawH = Number.isFinite(maxY) ? maxY - minY : 100;
  const vbW = Math.ceil(rawW + padX * 2);
  const vbH = Math.ceil(rawH + padTop + padBottom);
  const shiftX = Number.isFinite(minX) ? -minX + padX : padX;
  const shiftY = Number.isFinite(minY) ? -minY + padTop : padTop;

  // Orantılı sığdırma: her yükseklikte tüm küpler (en alt köşe dahil) kutuya tam oturur
  const scale = Math.min(196 / vbW, 178 / vbH, 1.15);
  const renderW = Math.round(vbW * scale);
  const renderH = Math.round(vbH * scale);

  return (
    <svg
      width={renderW}
      height={renderH}
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      className="block mx-auto max-w-full h-auto overflow-visible"
    >
      {projected.map(({ cx: rawCx, cy: rawCy }, idx) => {
        const cx = rawCx + shiftX;
        const cy = rawCy + shiftY;
        const topPts = `${cx},${cy - dy * 2} ${cx + dx},${cy - dy} ${cx},${cy} ${cx - dx},${cy - dy}`;
        const leftPts = `${cx - dx},${cy - dy} ${cx},${cy} ${cx},${cy + cubeH} ${cx - dx},${cy + cubeH - dy}`;
        const rightPts = `${cx},${cy} ${cx + dx},${cy - dy} ${cx + dx},${cy + cubeH - dy} ${cx},${cy + cubeH}`;
        return (
          <g key={idx}>
            <polygon points={topPts} fill="#38bdf8" stroke="#0f172a" strokeWidth="1.9" strokeLinejoin="round" />
            <polygon points={leftPts} fill="#0284c7" stroke="#0f172a" strokeWidth="1.9" strokeLinejoin="round" />
            <polygon points={rightPts} fill="#0369a1" stroke="#0f172a" strokeWidth="1.9" strokeLinejoin="round" />
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
  angle?: number;
  flipX?: boolean;
}> = ({ figure, isShadow, variant = 'exact', angle = 0, flipX = false }) => {
  const fillMain = isShadow ? '#090d16' : '#38bdf8';
  const fillAccent = isShadow ? '#090d16' : '#f59e0b';
  const fillThird = isShadow ? '#090d16' : '#f43f5e';
  const strokeCol = isShadow ? '#334155' : '#0f172a';
  const netFlipX = variant === 'mirrored' || variant === 'flipped' ? !flipX : Boolean(flipX);
  const flipY = figure === 'rocket' && variant === 'flipped';
  const netAngle =
    angle +
    (variant === 'wrong_rot_90'
      ? 90
      : variant === 'wrong_rot_neg90'
      ? -90
      : variant === 'wrong_rot_180'
      ? 180
      : 0);

  const transformParts: string[] = [];
  if (netAngle !== 0) transformParts.push(`rotate(${netAngle}deg)`);
  if (netFlipX || flipY) transformParts.push(`scale(${netFlipX ? -1 : 1}, ${flipY ? -1 : 1})`);
  const transformStyle = transformParts.length > 0 ? transformParts.join(' ') : undefined;

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

      {figure === 'helicopter' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Üst pervane */}
          <rect x="55" y="24" width="6" height="12" fill={fillAccent} />
          <rect
            x={variant === 'short_blade' ? 38 : 16}
            y="18"
            width={variant === 'short_blade' ? 42 : 84}
            height="6"
            rx="3"
            fill={fillThird}
          />
          {/* Kuyruk ve arka pervane */}
          <rect x="68" y="50" width="38" height="9" rx="4" fill={fillAccent} />
          <circle cx="106" cy="52" r="9" fill={fillThird} />
          {/* Gövde */}
          <ellipse cx="48" cy="56" rx="28" ry="20" fill={fillMain} />
          {!isShadow && <path d="M25,52 C28,40 44,40 48,40 L48,56 L22,56 Z" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.8" />}
          {/* İniş kızağı */}
          {variant !== 'no_skid' && (
            <>
              <line x1="36" y1="74" x2="36" y2="88" stroke={strokeCol} strokeWidth="3.5" />
              <line x1="60" y1="74" x2="60" y2="88" stroke={strokeCol} strokeWidth="3.5" />
              <rect x="20" y="86" width="56" height="6" rx="3" fill={fillAccent} />
            </>
          )}
        </g>
      )}

      {figure === 'teapot' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Emzik (sola yukarı) */}
          <path d="M36,68 Q16,60 18,38 L28,40 Q28,54 40,56 Z" fill={fillAccent} />
          {/* Kulp (sağda) */}
          {variant === 'flat_handle' ? (
            <rect x="80" y="46" width="16" height="32" rx="2" fill={fillAccent} />
          ) : (
            <path d="M80,48 C104,44 104,82 80,78" fill="none" stroke={fillAccent} strokeWidth="8" strokeLinecap="round" />
          )}
          {/* Gövde */}
          <ellipse cx="60" cy="68" rx="28" ry="24" fill={fillMain} />
          {/* Kapak ve topuz */}
          <path d="M40,48 Q60,34 80,48 Z" fill={fillThird} />
          {variant !== 'no_knob' && <circle cx="60" cy="34" r="6" fill={fillAccent} />}
          <rect x="44" y="88" width="32" height="8" rx="3" fill={fillAccent} />
        </g>
      )}

      {figure === 'guitar' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Sap ve burgular */}
          <rect
            x="54"
            y={variant === 'short_neck' ? 36 : 16}
            width="12"
            height={variant === 'short_neck' ? 28 : 48}
            fill={fillAccent}
          />
          {variant !== 'no_pegs' && (
            <>
              <rect x="48" y="10" width="24" height="14" rx="4" fill={fillThird} />
              <circle cx="44" cy="14" r="3.5" fill={fillAccent} />
              <circle cx="44" cy="21" r="3.5" fill={fillAccent} />
              <circle cx="76" cy="14" r="3.5" fill={fillAccent} />
              <circle cx="76" cy="21" r="3.5" fill={fillAccent} />
            </>
          )}
          {/* Gövde */}
          {variant === 'round_body' ? (
            <circle cx="60" cy="80" r="28" fill={fillMain} />
          ) : (
            <>
              <ellipse cx="60" cy="64" rx="20" ry="16" fill={fillMain} />
              <ellipse cx="60" cy="88" rx="28" ry="20" fill={fillMain} />
            </>
          )}
          {!isShadow && <circle cx="60" cy="68" r="8" fill="#0f172a" />}
        </g>
      )}

      {figure === 'umbrella' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Tepe uç */}
          {variant !== 'no_tip' && <polygon points="57,10 63,10 60,20" fill={fillAccent} />}
          {/* Kubbe */}
          <path d="M16,58 C16,22 104,22 104,58 Q89,50 75,58 Q60,50 45,58 Q31,50 16,58 Z" fill={fillMain} />
          {!isShadow && <path d="M40,54 Q60,22 80,54" fill="none" stroke="#fef08a" strokeWidth="3" />}
          {/* Baston sap */}
          {variant === 'straight_handle' ? (
            <rect x="57" y="56" width="6" height="50" rx="3" fill={fillThird} />
          ) : (
            <path d="M60,56 L60,94 A10,10 0 0 0 80,94" fill="none" stroke={fillThird} strokeWidth="7" strokeLinecap="round" />
          )}
        </g>
      )}

      {figure === 'elephant' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Kuyruk */}
          {variant !== 'no_tail' && (
            <path d="M94,64 Q108,68 106,82" fill="none" stroke={fillMain} strokeWidth="5" strokeLinecap="round" />
          )}
          {/* Bacaklar */}
          <rect x="44" y="76" width="14" height="28" rx="4" fill={fillMain} />
          <rect x="72" y="76" width="14" height="28" rx="4" fill={fillMain} />
          {/* Gövde ve kafa */}
          <ellipse cx="68" cy="64" rx="28" ry="22" fill={fillMain} />
          <circle cx="42" cy="52" r="20" fill={fillMain} />
          {/* Hortum */}
          {variant !== 'no_trunk' && (
            <path d="M24,54 Q10,64 16,80 Q22,88 30,80" fill="none" stroke={fillMain} strokeWidth="9" strokeLinecap="round" />
          )}
          {/* Büyük kulak */}
          <ellipse cx="52" cy="52" rx="12" ry="17" fill={fillAccent} />
          {!isShadow && <circle cx="34" cy="46" r="3.5" fill="#0f172a" />}
        </g>
      )}

      {figure === 'locomotive' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Baca */}
          {variant !== 'no_chimney' && (
            <polygon points="28,26 44,26 40,46 32,46" fill={fillThird} />
          )}
          {/* Ön kazan ve kabin */}
          <rect x="20" y="46" width="46" height="32" rx="4" fill={fillMain} />
          <rect x="64" y="30" width="34" height="48" rx="4" fill={fillAccent} />
          {!isShadow && <rect x="72" y="38" width="18" height="16" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="1.8" />}
          {/* Tekerlekler */}
          <circle cx="32" cy="86" r="10" fill={fillThird} />
          {variant !== 'two_wheels' && <circle cx="56" cy="86" r="10" fill={fillThird} />}
          <circle cx="84" cy="84" r="12" fill={fillThird} />
        </g>
      )}

      {figure === 'duck' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Gaga (sağa bakar) */}
          {variant !== 'no_beak' && (
            <polygon points="82,36 106,42 82,48" fill={fillAccent} />
          )}
          {/* Kafa */}
          <circle cx="72" cy="40" r="16" fill={fillMain} />
          {/* Gövde ve kuyruk */}
          <path d="M22,64 C22,52 38,54 58,54 C76,54 84,68 82,82 C78,94 34,94 24,80 Z" fill={fillMain} />
          {/* Kuyruk çıkıntısı */}
          {variant !== 'round_tail' && (
            <polygon points="24,66 10,48 34,58" fill={fillThird} />
          )}
          {/* Kanat */}
          {variant === 'raised_wing' && (
            <polygon points="48,54 36,30 62,54" fill={fillAccent} />
          )}
          {!isShadow && <circle cx="76" cy="36" r="3" fill="#0f172a" />}
        </g>
      )}

      {figure === 'cactus' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Saksı */}
          <polygon points="36,86 84,86 78,108 42,108" fill={fillThird} />
          {/* Ana gövde */}
          <rect x="50" y="22" width="20" height="64" rx="10" fill={fillMain} />
          {/* Sol yüksek kol */}
          {variant !== 'no_left_arm' && (
            <path d="M50,52 L30,52 L30,32" fill="none" stroke={isShadow ? '#090d16' : '#38bdf8'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Sağ alçak kol */}
          {variant !== 'even_arms' ? (
            <path d="M70,64 L90,64 L90,46" fill="none" stroke={isShadow ? '#090d16' : '#38bdf8'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M70,52 L90,52 L90,32" fill="none" stroke={isShadow ? '#090d16' : '#38bdf8'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Tepe çiçeği */}
          {variant !== 'no_flower' && <circle cx="60" cy="18" r="7" fill={fillAccent} />}
        </g>
      )}

      {figure === 'mug' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Buhar */}
          {variant !== 'no_steam' && (
            <>
              <path d="M44,32 Q38,20 46,12" fill="none" stroke={isShadow ? '#090d16' : '#94a3b8'} strokeWidth="5" strokeLinecap="round" />
              <path d="M62,32 Q68,20 60,12" fill="none" stroke={isShadow ? '#090d16' : '#94a3b8'} strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {/* Kulp */}
          {variant !== 'no_handle' && (
            <path d="M80,48 C104,48 104,84 80,84" fill="none" stroke={fillAccent} strokeWidth="9" strokeLinecap="round" />
          )}
          {/* Gövde */}
          <rect x="26" y="40" width="54" height="58" rx={variant === 'round_cup' ? 22 : 6} fill={fillMain} />
          <rect x="20" y="96" width="66" height="8" rx="4" fill={fillThird} />
        </g>
      )}

      {figure === 'lamp' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Abajur başlık */}
          {variant === 'round_shade' ? (
            <circle cx="60" cy="40" r="26" fill={fillAccent} />
          ) : (
            <polygon points="36,20 84,20 100,56 20,56" fill={fillAccent} />
          )}
          {/* Sarkıt ip / düğme sağda */}
          {variant !== 'no_pull' && (
            <>
              <line x1="80" y1="56" x2="80" y2="72" stroke={isShadow ? '#090d16' : '#0f172a'} strokeWidth="3.5" />
              <circle cx="80" cy="74" r="4.5" fill={fillThird} />
            </>
          )}
          {/* Direk ve taban */}
          <rect x="55" y="56" width="10" height="38" fill={fillMain} />
          <rect x={variant === 'thin_base' ? 44 : 30} y="92" width={variant === 'thin_base' ? 32 : 60} height="12" rx="4" fill={fillThird} />
        </g>
      )}

      {figure === 'bicycle' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Tekerlekler */}
          <circle cx="28" cy="80" r="18" fill="none" stroke={isShadow ? '#090d16' : '#0f172a'} strokeWidth="7" />
          {variant !== 'small_front' ? (
            <circle cx="92" cy="80" r="18" fill="none" stroke={isShadow ? '#090d16' : '#0f172a'} strokeWidth="7" />
          ) : (
            <circle cx="92" cy="86" r="11" fill="none" stroke={isShadow ? '#090d16' : '#0f172a'} strokeWidth="7" />
          )}
          {/* Kadro */}
          <polygon points="28,80 56,50 80,50 60,80" fill="none" stroke={fillMain} strokeWidth="6" strokeLinejoin="round" />
          <line x1="80" y1="36" x2="92" y2="80" stroke={fillThird} strokeWidth="6" strokeLinecap="round" />
          {/* Sele ve gidon */}
          {variant !== 'no_seat' && <rect x="44" y="40" width="18" height="7" rx="3" fill={fillAccent} />}
          <path d="M74,36 L90,36 L94,42" fill="none" stroke={fillAccent} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {figure === 'anchor' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Üst halka */}
          {variant !== 'no_ring' && <circle cx="60" cy="20" r="9" fill="none" stroke={fillAccent} strokeWidth="6" />}
          {/* Çubuk */}
          <rect x="55" y="28" width="10" height="66" fill={fillMain} />
          {/* Yatay kol */}
          {variant !== 'no_crossbar' && <rect x="34" y="38" width="52" height="9" rx="4" fill={fillAccent} />}
          {/* Alt yay ve uçlar */}
          <path d="M24,68 C24,102 96,102 96,68" fill="none" stroke={fillMain} strokeWidth="10" strokeLinecap="round" />
          <polygon points="16,72 24,54 34,72" fill={fillThird} />
          <polygon points="86,72 96,54 104,72" fill={fillThird} />
        </g>
      )}

      {figure === 'snowman' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Şapka */}
          {variant !== 'no_hat' && (
            <>
              <rect x="42" y="10" width="36" height="16" rx="2" fill={fillThird} />
              <rect x="34" y="24" width="52" height="6" rx="3" fill={fillAccent} />
            </>
          )}
          {/* Kafa ve gövde */}
          <circle cx="60" cy="44" r="16" fill={fillMain} />
          {/* Havuç burun sağa */}
          {variant !== 'no_nose' && <polygon points="74,42 94,46 74,50" fill={fillAccent} />}
          <circle cx="60" cy="82" r="24" fill={fillMain} />
          {/* Süpürge / kol sola yukarı */}
          {variant !== 'no_arm' && (
            <line x1="40" y1="74" x2="16" y2="54" stroke={isShadow ? '#090d16' : '#78350f'} strokeWidth="6" strokeLinecap="round" />
          )}
        </g>
      )}

      {figure === 'owl_sil' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Kulak tüyleri */}
          {variant !== 'no_ears' && (
            <>
              <polygon points="34,36 28,16 48,30" fill={fillThird} />
              <polygon points="86,36 92,16 72,30" fill={fillThird} />
            </>
          )}
          <ellipse cx="60" cy="64" rx="32" ry="36" fill={fillMain} />
          {/* Sağ kanat çıkık */}
          {variant !== 'flat_wings' && <ellipse cx="92" cy="68" rx="8" ry="18" fill={fillAccent} />}
          {/* Ayaklar */}
          <polygon points="44,98 38,108 50,108" fill={fillAccent} />
          <polygon points="76,98 70,108 82,108" fill={fillAccent} />
          {!isShadow && (
            <>
              <circle cx="48" cy="48" r="9" fill="#ffffff" />
              <circle cx="72" cy="48" r="9" fill="#ffffff" />
              <circle cx="48" cy="48" r="4" fill="#0f172a" />
              <circle cx="72" cy="48" r="4" fill="#0f172a" />
              <polygon points="56,56 64,56 60,64" fill="#f59e0b" />
            </>
          )}
        </g>
      )}

      {figure === 'car_sil' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Tavan sireni */}
          {variant !== 'no_siren' && <rect x="52" y="24" width="16" height="10" rx="4" fill={fillAccent} />}
          <path d="M32,54 L42,34 L76,34 L88,54 Z" fill={fillMain} />
          <rect x="14" y="54" width="92" height="26" rx="8" fill={fillThird} />
          {/* Tekerlekler */}
          <circle cx="36" cy="84" r="12" fill={fillAccent} />
          {variant !== 'one_wheel' && <circle cx="84" cy="84" r="12" fill={fillAccent} />}
          {!isShadow && <rect x="44" y="38" width="28" height="14" rx="2" fill="#e0f2fe" />}
        </g>
      )}

      {figure === 'mushroom_sil' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Sap */}
          <rect x={variant === 'thin_stem' ? 52 : 44} y="58" width={variant === 'thin_stem' ? 16 : 32} height="44" rx="8" fill={fillAccent} />
          {/* Küçük yan mantar */}
          {variant !== 'no_mini' && <circle cx="90" cy="92" r="10" fill={fillMain} />}
          {/* Şapka */}
          <path d="M16,64 C16,20 104,20 104,64 Z" fill={fillThird} />
          {!isShadow && (
            <>
              <circle cx="44" cy="44" r="7" fill="#ffffff" />
              <circle cx="72" cy="40" r="8" fill="#ffffff" />
            </>
          )}
        </g>
      )}

      {figure === 'sword' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Bıçak ucu */}
          {variant === 'blunt_tip' ? (
            <rect x="52" y="14" width="16" height="58" rx="3" fill={fillMain} />
          ) : (
            <polygon points="60,10 69,26 69,72 51,72 51,26" fill={fillMain} />
          )}
          {/* Kabza koruma */}
          {variant !== 'no_guard' && <rect x="30" y="70" width="60" height="10" rx="5" fill={fillAccent} />}
          {/* Sap ve topuz */}
          <rect x="54" y="80" width="12" height="20" fill={fillThird} />
          <circle cx="60" cy="104" r="8" fill={fillAccent} />
        </g>
      )}

      {figure === 'flower_pot' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Saksı */}
          <polygon points="36,72 84,72 76,106 44,106" fill={fillThird} />
          <rect x="32" y="66" width="56" height="10" rx="3" fill={fillAccent} />
          {/* Sap ve tek yaprak (sağda) */}
          <rect x="57" y="38" width="6" height="28" fill={fillMain} />
          {variant !== 'no_leaf' && <ellipse cx="76" cy="54" rx="14" ry="7" fill={fillMain} transform="rotate(-22 76 54)" />}
          {/* Taç yapraklar */}
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle
              key={deg}
              cx={60 + Math.cos((deg * Math.PI) / 180) * 14}
              cy={30 + Math.sin((deg * Math.PI) / 180) * 14}
              r={variant === 'small_flower' ? 5 : 9}
              fill={fillThird}
            />
          ))}
          {!isShadow && <circle cx="60" cy="30" r="8" fill="#fbbf24" />}
        </g>
      )}

      {figure === 'penguin_sil' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Ayaklar */}
          <ellipse cx="44" cy="100" rx="11" ry="6" fill={fillAccent} />
          <ellipse cx="76" cy="100" rx="11" ry="6" fill={fillAccent} />
          {/* Sağ yukarı kalkık kanat */}
          {variant !== 'no_wing' && <ellipse cx="94" cy="54" rx="12" ry="7" fill={fillMain} transform="rotate(-32 94 54)" />}
          {/* Sol inik kanat */}
          <ellipse cx="26" cy="68" rx="7" ry="15" fill={fillMain} transform="rotate(14 26 68)" />
          {/* Gövde ve gaga */}
          <ellipse cx="60" cy="60" rx="28" ry="38" fill={fillMain} />
          {variant !== 'no_beak' && <polygon points="84,38 102,42 84,48" fill={fillAccent} />}
          {!isShadow && (
            <>
              <ellipse cx="60" cy="68" rx="18" ry="25" fill="#ffffff" />
              <circle cx="68" cy="38" r="4" fill="#0f172a" />
            </>
          )}
        </g>
      )}

      {figure === 'whale' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Su fıskiyesi */}
          {variant !== 'no_spout' && (
            <>
              <path d="M46,36 Q38,20 28,22" fill="none" stroke={isShadow ? '#090d16' : '#38bdf8'} strokeWidth="5" strokeLinecap="round" />
              <path d="M52,36 Q58,18 68,20" fill="none" stroke={isShadow ? '#090d16' : '#38bdf8'} strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {/* Kuyruk */}
          {variant !== 'round_tail' ? (
            <polygon points="84,70 108,46 100,68 108,88" fill={fillThird} />
          ) : (
            <circle cx="96" cy="68" r="13" fill={fillThird} />
          )}
          {/* Gövde */}
          <path d="M16,66 C16,42 54,38 78,56 C90,66 88,88 54,88 C28,88 16,80 16,66 Z" fill={fillMain} />
          {!isShadow && <circle cx="32" cy="64" r="4" fill="#0f172a" />}
        </g>
      )}

      {figure === 'book_stack' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Alt kitap (yatay kalın) */}
          <rect x="18" y="76" width="84" height="24" rx="4" fill={fillMain} />
          {!isShadow && <rect x="26" y="81" width="68" height="14" rx="2" fill="#e0f2fe" />}
          {/* Orta kitap (hafif sağa kayık) */}
          <rect x="26" y="52" width="76" height="24" rx="4" fill={fillThird} />
          {!isShadow && <rect x="34" y="57" width="60" height="14" rx="2" fill="#ffe4e6" />}
          {/* Ayraç şeridi (sağdan sarkan) */}
          {variant !== 'no_bookmark' && (
            <polygon points="84,76 92,76 92,108 88,101 84,108" fill={fillAccent} />
          )}
          {/* Üst eğik kitap */}
          {variant !== 'two_books' && (
            <g transform="rotate(-10 56 38)">
              <rect x="20" y="26" width="70" height="22" rx="4" fill={fillAccent} />
              {!isShadow && <rect x="28" y="31" width="54" height="12" rx="2" fill="#fef3c7" />}
            </g>
          )}
        </g>
      )}

      {figure === 'watering_can' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Arka kulp */}
          {variant !== 'no_handle' && (
            <path d="M36,44 C12,38 12,84 36,84" fill="none" stroke={fillAccent} strokeWidth="8" strokeLinecap="round" />
          )}
          {/* Üst kulp */}
          <path d="M38,44 C38,24 76,24 76,44" fill="none" stroke={fillThird} strokeWidth="6" strokeLinecap="round" />
          {/* Uzun sulama borusu (sağa yukarı) */}
          <polygon points="74,74 102,42 108,48 76,86" fill={fillMain} />
          {/* Süzgeç başlığı */}
          {variant !== 'no_rose' && (
            <ellipse cx="106" cy="42" rx="8" ry="12" fill={fillAccent} transform="rotate(-42 106 42)" />
          )}
          {/* Gövde */}
          <polygon points="34,44 80,44 84,96 30,96" fill={fillMain} />
        </g>
      )}

      {figure === 'alarm_clock' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Üst tokmak */}
          {variant !== 'no_hammer' && (
            <>
              <rect x="57" y="14" width="6" height="16" fill={fillThird} />
              <rect x="46" y="12" width="28" height="6" rx="3" fill={fillAccent} />
            </>
          )}
          {/* Çanlar */}
          <circle cx="32" cy="30" r="13" fill={fillAccent} />
          {variant !== 'one_bell' && <circle cx="88" cy="30" r="13" fill={fillAccent} />}
          {/* Ayaklar */}
          {variant !== 'no_feet' && (
            <>
              <polygon points="34,90 22,108 38,108 46,94" fill={fillThird} />
              <polygon points="86,90 98,108 82,108 74,94" fill={fillThird} />
            </>
          )}
          {/* Ana daire */}
          <circle cx="60" cy="64" r="34" fill={fillMain} />
          {!isShadow && (
            <>
              <circle cx="60" cy="64" r="26" fill="#ffffff" />
              <line x1="60" y1="64" x2="60" y2="44" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <line x1="60" y1="64" x2="76" y2="64" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}
        </g>
      )}

      {figure === 'backpack_sil' && (
        <g stroke={strokeCol} strokeWidth="2.2" strokeLinejoin="round">
          {/* Üst askı */}
          {variant !== 'no_top_loop' && (
            <path d="M44,28 C44,10 76,10 76,28" fill="none" stroke={fillThird} strokeWidth="7" strokeLinecap="round" />
          )}
          {/* Sağ yan cep */}
          {variant !== 'no_side_pocket' && (
            <rect x="86" y="64" width="16" height="30" rx="6" fill={fillAccent} />
          )}
          {/* Ana gövde */}
          <rect x="26" y="26" width="62" height="78" rx="18" fill={fillMain} />
          {!isShadow && (
            <>
              <rect x="36" y="64" width="42" height="28" rx="8" fill="#fbbf24" />
              <circle cx="57" cy="44" r="7" fill="#fef08a" />
            </>
          )}
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
  spec?: PatternTileSpec;
}> = ({ patternId, quadrant, piece = 'exact', spec }) => {
  // Quadrant 0=TL, 1=TR, 2=BL, 3=BR
  // Transform helpers so TL/TR/BL mirror naturally toward center (BR is target)
  const renderContent = () => {
    if (spec) {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const baseRot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const rot =
        quadrant === 'option' && piece === 'wrong_rot'
          ? 0
          : quadrant === 'option' && piece === 'wrong_rot_90'
          ? 90
          : baseRot;
      const bg = quadrant === 'option' && piece === 'wrong_bg' ? '#475569' : spec.bg;
      const c1 = quadrant === 'option' && piece === 'swapped' ? spec.c2 : spec.c1;
      const c2 = quadrant === 'option' && piece === 'swapped' ? spec.c1 : spec.c2;
      const hideAccent = quadrant === 'option' && piece === 'missing_accent';

      return (
        <g transform={`rotate(${rot} 30 30)`}>
          <rect width="60" height="60" fill={bg} />
          {spec.motif === 'corner_tri' && (
            <>
              <polygon points="60,60 12,60 60,12" fill={c1} />
              {!hideAccent && <circle cx="18" cy="18" r="8" fill={c2} />}
            </>
          )}
          {spec.motif === 'diag_band' && (
            <>
              <line x1="0" y1="60" x2="60" y2="0" stroke={c1} strokeWidth="14" />
              {!hideAccent && <rect x="40" y="40" width="16" height="16" rx="3" fill={c2} />}
            </>
          )}
          {spec.motif === 'arc_ring' && (
            <>
              <circle cx="60" cy="60" r="46" fill="none" stroke={c1} strokeWidth="11" />
              {!hideAccent && <circle cx="60" cy="60" r="22" fill={c2} />}
            </>
          )}
          {spec.motif === 'double_stripe' && (
            <>
              <rect x="0" y="42" width="60" height="14" fill={c1} />
              <rect x="42" y="0" width="14" height="60" fill={c1} />
              {!hideAccent && <circle cx="18" cy="18" r="9" fill={c2} />}
            </>
          )}
          {spec.motif === 'star_dot' && (
            <>
              <polygon points="60,60 22,60 60,34" fill={c1} />
              <polygon points="60,60 34,60 60,22" fill={c2} />
              {!hideAccent && <circle cx="16" cy="24" r="7" fill={c1} />}
            </>
          )}
          {spec.motif === 'chevron_l' && (
            <>
              <path d="M16,60 L16,16 L60,16" fill="none" stroke={c1} strokeWidth="10" strokeLinecap="square" />
              {!hideAccent && <circle cx="44" cy="44" r="10" fill={c2} />}
            </>
          )}
          {spec.motif === 'diamond_edge' && (
            <>
              <polygon points="60,20 40,60 60,60" fill={c1} />
              <polygon points="14,14 34,14 24,34" fill={c2} />
              {!hideAccent && <circle cx="44" cy="18" r="5" fill={c1} />}
            </>
          )}
          {spec.motif === 'petal_drop' && (
            <>
              <ellipse cx="42" cy="42" rx="22" ry="12" fill={c1} transform="rotate(-45 42 42)" />
              {!hideAccent && <circle cx="56" cy="56" r="12" fill={c2} />}
            </>
          )}
          {spec.motif === 'step_corner' && (
            <>
              <rect x="34" y="34" width="26" height="26" fill={c1} />
              <rect x="16" y="44" width="18" height="16" fill={c2} />
              {!hideAccent && <circle cx="20" cy="20" r="7" fill={c1} />}
            </>
          )}
          {spec.motif === 'ring_dot' && (
            <>
              <circle cx="60" cy="60" r="38" fill="none" stroke={c1} strokeWidth="9" />
              <line x1="12" y1="12" x2="36" y2="36" stroke={c2} strokeWidth="7" strokeLinecap="round" />
              {!hideAccent && <circle cx="14" cy="44" r="6" fill={c2} />}
            </>
          )}
        </g>
      );
    }

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

    if (patternId === 'spiral_quarter') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const centers: Record<number, [number, number]> = {
        0: [60, 60],
        1: [0, 60],
        2: [60, 0],
        3: [0, 0],
      };
      let [cx, cy] = centers[qIdx];
      if (quadrant === 'option' && piece === 'flipped') [cx, cy] = [60, 60];
      const strokeA = quadrant === 'option' && piece === 'wrong_color' ? '#f43f5e' : '#38bdf8';
      return (
        <>
          <rect width="60" height="60" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="44" fill="none" stroke={strokeA} strokeWidth="9" />
          {!(quadrant === 'option' && piece === 'missing_ring') && (
            <circle cx={cx} cy={cy} r="22" fill="none" stroke="#fbbf24" strokeWidth="8" />
          )}
        </>
      );
    }

    if (patternId === 'sunburst_corner') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'outward' ? 0 : rot;
      const rayCol = quadrant === 'option' && piece === 'wrong_color' ? '#38bdf8' : '#fbbf24';
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#1e1b4b" />
          <line x1="60" y1="60" x2="10" y2="10" stroke={rayCol} strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="60" x2="10" y2="42" stroke={rayCol} strokeWidth="5" strokeLinecap="round" />
          <line x1="60" y1="60" x2="42" y2="10" stroke={rayCol} strokeWidth="5" strokeLinecap="round" />
          {!(quadrant === 'option' && piece === 'no_core') && (
            <circle cx="60" cy="60" r="18" fill="#f97316" />
          )}
        </g>
      );
    }

    if (patternId === 'chevron_frame') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'reversed' ? 0 : rot;
      const cOut = quadrant === 'option' && piece === 'swapped' ? '#38bdf8' : '#f59e0b';
      const cIn = quadrant === 'option' && piece === 'swapped' ? '#f59e0b' : '#38bdf8';
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#0f172a" />
          <path d="M12,60 L12,12 L60,12" fill="none" stroke={cOut} strokeWidth="10" strokeLinecap="square" />
          {!(quadrant === 'option' && piece === 'single_bar') && (
            <path d="M34,60 L34,34 L60,34" fill="none" stroke={cIn} strokeWidth="8" strokeLinecap="square" />
          )}
        </g>
      );
    }

    if (patternId === 'dot_constellation') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'mirrored' ? 0 : rot;
      const dotCol = quadrant === 'option' && piece === 'wrong_color' ? '#2dd4bf' : '#fb7185';
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#312e81" />
          <line x1="16" y1="16" x2="48" y2="48" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="16" cy="16" r="8" fill="#ffffff" />
          <circle cx="34" cy="34" r="5" fill={dotCol} />
          {!(quadrant === 'option' && piece === 'missing_dot') && (
            <circle cx="48" cy="48" r="5" fill={dotCol} />
          )}
        </g>
      );
    }

    if (patternId === 'clover_petal') {
      const qIdx = quadrant === 'option' ? 3 : quadrant;
      const rot = qIdx === 0 ? 0 : qIdx === 1 ? 90 : qIdx === 2 ? 270 : 180;
      const useRot = quadrant === 'option' && piece === 'reversed' ? 0 : rot;
      const leafCol = quadrant === 'option' && piece === 'wrong_color' ? '#f43f5e' : '#10b981';
      return (
        <g transform={`rotate(${useRot} 30 30)`}>
          <rect width="60" height="60" fill="#ecfdf5" />
          <ellipse cx="34" cy="34" rx="22" ry="14" fill={leafCol} transform="rotate(-45 34 34)" />
          {!(quadrant === 'option' && piece === 'no_core') && (
            <circle cx="60" cy="60" r="13" fill="#fbbf24" />
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
  spec?: PuzzleCutSpec;
}> = ({ puzzleId, mode, piece = 'exact', spec }) => {
  if (spec) {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="12" y="12" width="116" height="96" rx="8" fill={spec.boardColor} stroke="#f8fafc" strokeWidth="3" />
          <polygon
            points={spec.boardCutPoints}
            fill="#e2e8f0"
            stroke="#334155"
            strokeWidth="2.5"
            strokeDasharray="4,3"
          />
          <text x="88" y="66" textAnchor="middle" fill="#0f172a" fontSize="19" fontWeight="900">
            ?
          </text>
        </svg>
      );
    }
    const pts = piece === 'exact' ? spec.exactPoints : spec.wrongPoints[piece] || spec.exactPoints;
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill={spec.pieceColor} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

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

  if (puzzleId === 'keyhole_fit') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#0284c7" stroke="#e0f2fe" strokeWidth="3" />
          <path d="M35,15 L105,15 L105,40 L80,40 L80,58 A16,16 0 1 1 60,58 L60,40 L35,40 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="70" y="34" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const d =
      piece === 'square_tip'
        ? 'M25,20 L95,20 L95,45 L70,45 L70,84 L50,84 L50,45 L25,45 Z'
        : piece === 'wide_neck'
        ? 'M25,20 L95,20 L95,45 L82,45 A16,16 0 1 1 38,45 L25,45 Z'
        : piece === 'no_knob'
        ? 'M25,20 L95,20 L95,45 L25,45 Z'
        : 'M25,20 L95,20 L95,45 L70,45 L70,63 A16,16 0 1 1 50,63 L50,45 L25,45 Z';
    return (
      <svg viewBox="0 0 120 110" className="w-20 h-20">
        <path d={d} fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'castle_battlement') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#ea580c" stroke="#ffedd5" strokeWidth="3" />
          <polygon points="25,15 115,15 115,48 92,48 92,70 78,70 78,48 62,48 62,70 48,70 48,48 25,48" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="70" y="38" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'one_tooth'
        ? '15,25 105,25 105,58 70,58 70,80 50,80 50,58 15,58'
        : piece === 'flat'
        ? '15,25 105,25 105,58 15,58'
        : piece === 'too_deep'
        ? '15,25 105,25 105,58 84,58 84,96 68,96 68,58 52,58 52,96 36,96 36,58 15,58'
        : '15,25 105,25 105,58 82,58 82,80 68,80 68,58 52,58 52,80 38,80 38,58 15,58';
    return (
      <svg viewBox="0 0 120 110" className="w-20 h-20">
        <polygon points={pts} fill="#fb923c" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'wave_ribbon') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#7c3aed" stroke="#ede9fe" strokeWidth="3" />
          <path d="M15,62 Q42,42 70,62 Q98,82 125,62 L125,105 L15,105 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="70" y="92" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const d =
      piece === 'reversed'
        ? 'M10,50 Q38,70 65,50 Q92,30 120,50 L120,90 L10,90 Z'
        : piece === 'straight'
        ? 'M10,50 L120,50 L120,90 L10,90 Z'
        : piece === 'zigzag'
        ? 'M10,50 L38,32 L65,50 L92,68 L120,50 L120,90 L10,90 Z'
        : 'M10,50 Q38,30 65,50 Q92,70 120,50 L120,90 L10,90 Z';
    return (
      <svg viewBox="0 0 130 110" className="w-20 h-20">
        <path d={d} fill="#a78bfa" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'diamond_corner') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#10b981" stroke="#d1fae5" strokeWidth="3" />
          <polygon points="55,15 125,15 125,85 95,55 82,68 72,42" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="102" y="42" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'flat_edge'
        ? '45,15 115,15 115,85'
        : piece === 'mirrored'
        ? '15,15 85,15 68,42 58,68 45,55 15,85'
        : piece === 'inward'
        ? '45,15 115,15 115,85 88,58 98,42 75,38'
        : '45,15 115,15 115,85 85,55 72,68 62,42';
    return (
      <svg viewBox="0 0 130 110" className="w-20 h-20">
        <polygon points={pts} fill="#34d399" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (puzzleId === 'triple_tooth') {
    if (mode === 'board') {
      return (
        <svg viewBox="0 0 140 120" className="w-full max-w-[190px] h-auto mx-auto">
          <rect x="15" y="15" width="110" height="90" rx="8" fill="#e11d48" stroke="#ffe4e6" strokeWidth="3" />
          <polygon points="80,15 125,15 125,105 80,105 80,92 60,92 60,78 80,78 80,66 60,66 60,52 80,52 80,40 60,40 60,26 80,26" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" strokeDasharray="4,3" />
          <text x="102" y="66" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">?</text>
        </svg>
      );
    }
    const pts =
      piece === 'two_teeth'
        ? '60,15 105,15 105,105 60,105 60,82 40,82 40,66 60,66 60,48 40,48 40,32 60,32'
        : piece === 'mirrored'
        ? '15,15 60,15 60,26 80,26 80,40 60,40 60,52 80,52 80,66 60,66 60,78 80,78 80,92 60,92 60,105 15,105'
        : piece === 'round'
        ? '60,15 105,15 105,105 60,105 46,85 60,60 46,35'
        : '60,15 105,15 105,105 60,105 60,92 40,92 40,78 60,78 60,66 40,66 40,52 60,52 60,40 40,40 40,26 60,26';
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20">
        <polygon points={pts} fill="#fb7185" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
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
const EmbeddedShapeSVG: React.FC<{
  sceneId: string;
  compact?: boolean;
  spec?: EmbeddedSceneSpec;
}> = ({ sceneId, compact = false, spec }) => {
  if (spec) {
    if (spec.mode === 'count_shapes') {
      const count = spec.countValue || 4;
      const kind = spec.countKind || 'triangles';
      const col = spec.strokeColor || '#0284c7';
      return (
        <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
          {kind === 'triangles' && (
            <>
              <polygon points="90,14 162,132 18,132" fill="rgba(14,165,233,0.10)" stroke={col} strokeWidth="3.2" strokeLinejoin="round" />
              {Array.from({ length: Math.max(0, count - 1) }).map((_, i) => {
                const y = 38 + i * (76 / Math.max(1, count - 1));
                const t = (y - 14) / 118;
                const halfW = t * 72;
                return (
                  <line
                    key={i}
                    x1={90 - halfW}
                    y1={y}
                    x2={90 + halfW}
                    y2={y}
                    stroke="#d97706"
                    strokeWidth="2.6"
                  />
                );
              })}
            </>
          )}
          {kind === 'squares' && (
            <>
              {Array.from({ length: count }).map((_, i) => {
                const s = 114 - i * 14;
                const x = 90 - s / 2 + (i % 2 === 0 ? -4 : 4);
                const y = 75 - s / 2;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={s}
                    height={s}
                    fill={i % 2 === 0 ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)'}
                    stroke={i % 2 === 0 ? '#059669' : '#d97706'}
                    strokeWidth="2.8"
                  />
                );
              })}
            </>
          )}
          {kind === 'circles' && (
            <>
              {Array.from({ length: count }).map((_, i) => {
                const r = 58 - i * 7;
                const cx = 90 + (i % 2 === 0 ? -5 : 5);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={75}
                    r={Math.max(8, r)}
                    fill="rgba(56,189,248,0.08)"
                    stroke={i % 2 === 0 ? col : '#e11d48'}
                    strokeWidth="2.8"
                  />
                );
              })}
            </>
          )}
          {kind === 'diamonds' && (
            <>
              {Array.from({ length: count }).map((_, i) => {
                const rx = 64 - i * 8;
                const ry = 56 - i * 7;
                return (
                  <polygon
                    key={i}
                    points={`90,${75 - ry} ${90 + rx},75 90,${75 + ry} ${90 - rx},75`}
                    fill="rgba(168,85,247,0.08)"
                    stroke={i % 2 === 0 ? '#7e22ce' : '#0284c7'}
                    strokeWidth="2.8"
                  />
                );
              })}
            </>
          )}
          {kind === 'stars' && (
            <>
              <rect x="20" y="16" width="140" height="118" rx="10" fill="rgba(248,250,252,0.8)" stroke="#94a3b8" strokeWidth="2" />
              <line x1="20" y1="75" x2="160" y2="75" stroke="#cbd5e1" strokeWidth="1.8" strokeDasharray="4,3" />
              <line x1="90" y1="16" x2="90" y2="134" stroke="#cbd5e1" strokeWidth="1.8" strokeDasharray="4,3" />
              {Array.from({ length: count }).map((_, i) => {
                const pts: [number, number][] = [
                  [50, 42],
                  [128, 44],
                  [52, 106],
                  [126, 106],
                  [90, 75],
                  [88, 36],
                  [92, 114],
                ];
                const [sx, sy] = pts[i % pts.length];
                return (
                  <g key={i} transform={`translate(${sx - 12}, ${sy - 12}) scale(0.5)`}>
                    <polygon
                      points="24,5 29.5,17 42,18.5 32.5,27.5 35,40.5 24,34 13,40.5 15.5,27.5 6,18.5 18.5,17"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="4.2"
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>
      );
    }

    const wirePaths: Record<string, string> = {
      house_frame: 'M34,82 L34,46 L60,22 L86,46 L86,82',
      z_bolt: 'M28,24 L92,24 L28,76 L92,76',
      flag_pole: 'M38,84 L38,20 L90,36 L38,54',
      m_crown: 'M24,80 L24,24 L60,54 L96,24 L96,80',
      arrow_right: 'M22,50 L92,50 M68,26 L92,50 L68,74',
      hourglass: 'M32,22 L88,22 L32,78 L88,78 L32,22',
      umbrella: 'M26,48 A34,28 0 0 1 94,48 Z M60,48 L60,78 A8,8 0 0 0 76,78',
      kite_tail: 'M60,16 L86,42 L60,68 L34,42 Z M60,68 L74,84',
      sailboat_frame: 'M58,18 L58,74 M58,20 L26,64 L58,64 M22,74 L94,74 L82,88 L34,88 Z',
      lightning: 'M68,14 L34,54 L60,54 L46,88 L88,46 L62,46 Z',
      bowtie: 'M26,26 L94,74 L94,26 L26,74 Z',
      hook_j: 'M42,20 L82,20 M66,20 L66,72 A14,14 0 0 1 38,72',
      diamond_cross: 'M60,16 L96,50 L60,84 L24,50 Z M60,16 L60,84',
      double_tri: 'M24,78 L58,24 L58,78 L96,24 L96,78',
      tree_branch: 'M60,84 L60,18 M60,52 L88,30 M60,64 L32,46',
      key_line: 'M36,50 A14,14 0 1 0 36,49.9 M50,50 L94,50 M78,50 L78,66 M90,50 L90,62',
      pentagon_cut: 'M60,18 L92,44 L80,82 L40,82 L28,44 Z',
      fish_wire: 'M24,50 Q52,22 80,50 Q52,78 24,50 Z M80,50 L98,34 L98,66 Z',
      cup_handle: 'M32,26 L76,26 L72,78 L36,78 Z M76,38 C94,38 94,64 74,64',
      stair_step: 'M22,78 L44,78 L44,58 L66,58 L66,38 L88,38 L88,20',
    };

    const brokenPaths: Record<string, string> = {
      house_frame: 'M34,82 L60,22 L86,82',
      z_bolt: 'M28,24 L92,24 L92,76 L28,76',
      flag_pole: 'M38,84 L38,20 L90,20 L90,54 L38,54',
      m_crown: 'M24,80 L60,24 L96,80',
      arrow_right: 'M28,26 L92,50 L28,74 Z',
      hourglass: 'M32,22 L88,22 L88,78 L32,78 Z',
      umbrella: 'M26,48 L94,48 L60,20 Z M60,48 L60,80',
      kite_tail: 'M34,26 L86,26 L86,76 L34,76 Z',
      sailboat_frame: 'M26,74 L94,74 L60,22 Z',
      lightning: 'M32,24 L88,24 L60,82 Z',
      bowtie: 'M26,26 L94,26 L60,78 Z',
      hook_j: 'M36,20 L36,80 L84,80',
      diamond_cross: 'M28,26 L92,26 L92,74 L28,74 Z',
      double_tri: 'M24,78 L60,22 L96,78 Z',
      tree_branch: 'M60,84 L60,18 M30,50 L90,50',
      key_line: 'M26,50 L94,50 M60,30 L60,70',
      pentagon_cut: 'M28,26 L92,26 L92,78 L28,78 Z',
      fish_wire: 'M26,50 A34,24 0 1 0 94,50 A34,24 0 1 0 26,50',
      cup_handle: 'M32,26 L84,26 L84,78 L32,78 Z',
      stair_step: 'M22,78 L88,20',
    };

    const pathD =
      spec.variant === 'broken'
        ? brokenPaths[spec.kind || 'house_frame'] || wirePaths.house_frame
        : wirePaths[spec.kind || 'house_frame'] || wirePaths.house_frame;
    const strokeCol = spec.strokeColor || (spec.mode === 'target' ? '#d97706' : '#0284c7');
    const transform =
      spec.variant === 'flipX'
        ? 'translate(120, 0) scale(-1, 1)'
        : spec.variant === 'flipY'
        ? 'translate(0, 100) scale(1, -1)'
        : undefined;

    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24 mx-auto'}>
        {spec.mode === 'clutter' && (
          <g stroke="#94a3b8" strokeWidth="1.8" fill="none">
            {spec.clutterFrame === 'circle' ? (
              <>
                <circle cx="60" cy="50" r="36" />
                <line x1="20" y1="50" x2="100" y2="50" />
              </>
            ) : spec.clutterFrame === 'diag' ? (
              <>
                <rect x="18" y="16" width="84" height="68" />
                <line x1="18" y1="16" x2="102" y2="84" />
                <line x1="102" y1="16" x2="18" y2="84" />
              </>
            ) : spec.clutterFrame === 'hex' ? (
              <>
                <polygon points="60,12 96,31 96,69 60,88 24,69 24,31" />
                <line x1="24" y1="50" x2="96" y2="50" />
              </>
            ) : (
              <>
                <rect x="18" y="16" width="84" height="68" />
                <line x1="18" y1="50" x2="102" y2="50" />
                <line x1="60" y1="16" x2="60" y2="84" />
              </>
            )}
          </g>
        )}
        <g transform={transform}>
          <path
            d={pathD}
            fill="none"
            stroke={strokeCol}
            strokeWidth={spec.mode === 'target' ? 4.8 : 3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

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
  if (sceneId === 'window_squares_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <rect x="35" y="20" width="110" height="110" fill="rgba(14,165,233,0.12)" stroke="#0284c7" strokeWidth="4" />
        <line x1="90" y1="20" x2="90" y2="130" stroke="#0284c7" strokeWidth="3.5" />
        <line x1="35" y1="75" x2="145" y2="75" stroke="#0284c7" strokeWidth="3.5" />
      </svg>
    );
  }
  if (sceneId === 'hexagons_overlap_count') {
    return (
      <svg viewBox="0 0 180 150" className="w-full max-w-[230px] h-auto mx-auto">
        <polygon points="90,12 152,43 152,107 90,138 28,107 28,43" fill="rgba(168,85,247,0.12)" stroke="#7e22ce" strokeWidth="3.5" />
        <polygon points="90,32 130,53 130,97 90,118 50,97 50,53" fill="rgba(14,165,233,0.12)" stroke="#0284c7" strokeWidth="3" />
        <polygon points="90,52 110,63 110,87 90,98 70,87 70,63" fill="rgba(245,158,11,0.14)" stroke="#d97706" strokeWidth="3" />
      </svg>
    );
  }
  if (sceneId === 'find_embedded_crown') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <polygon points="24,78 24,38 42,58 60,24 78,58 96,38 96,78" fill="none" stroke="#d97706" strokeWidth="4.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('crown_')) {
    const isMatch = sceneId === 'crown_C_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="20" y="20" width="80" height="62" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="20" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <polygon points="24,78 24,38 42,58 60,24 78,58 96,38 96,78" fill="none" stroke="#0284c7" strokeWidth="3.2" strokeLinejoin="round" />
        ) : sceneId === 'crown_A' ? (
          <polygon points="24,78 24,38 60,64 96,38 96,78" fill="none" stroke="#0284c7" strokeWidth="3.2" />
        ) : sceneId === 'crown_B' ? (
          <polygon points="24,24 24,64 42,44 60,78 78,44 96,64 96,24" fill="none" stroke="#0284c7" strokeWidth="3.2" />
        ) : (
          <polygon points="24,78 60,24 96,78" fill="none" stroke="#0284c7" strokeWidth="3.2" />
        )}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_hourglass') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <polygon points="30,22 90,22 30,78 90,78" fill="none" stroke="#d97706" strokeWidth="4.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('hg_')) {
    const isMatch = sceneId === 'hg_A_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <circle cx="60" cy="50" r="36" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="60" y1="14" x2="60" y2="86" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <polygon points="30,22 90,22 30,78 90,78" fill="none" stroke="#7e22ce" strokeWidth="3.2" strokeLinejoin="round" />
        ) : sceneId === 'hg_B' ? (
          <polygon points="30,22 90,22 90,78 30,78" fill="none" stroke="#7e22ce" strokeWidth="3.2" />
        ) : sceneId === 'hg_C' ? (
          <polygon points="30,22 90,50 30,78" fill="none" stroke="#7e22ce" strokeWidth="3.2" />
        ) : (
          <polygon points="60,20 92,50 60,80 28,50" fill="none" stroke="#7e22ce" strokeWidth="3.2" />
        )}
      </svg>
    );
  }
  if (sceneId === 'find_embedded_umbrella') {
    return (
      <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto">
        <path d="M26,48 A34,30 0 0 1 94,48 Z" fill="none" stroke="#d97706" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M60,48 L60,78 A8,8 0 0 0 76,78" fill="none" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (sceneId.startsWith('umb_')) {
    const isMatch = sceneId === 'umb_D_match';
    return (
      <svg viewBox="0 0 120 100" className={compact ? 'w-24 h-20' : 'w-28 h-24'}>
        <rect x="20" y="16" width="80" height="70" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="20" y1="48" x2="100" y2="48" stroke="#94a3b8" strokeWidth="2" />
        {isMatch ? (
          <>
            <path d="M26,48 A34,30 0 0 1 94,48 Z" fill="none" stroke="#059669" strokeWidth="3.2" strokeLinejoin="round" />
            <path d="M60,48 L60,78 A8,8 0 0 0 76,78" fill="none" stroke="#059669" strokeWidth="3.2" strokeLinecap="round" />
          </>
        ) : sceneId === 'umb_A' ? (
          <>
            <path d="M26,48 A34,30 0 0 1 94,48 Z" fill="none" stroke="#059669" strokeWidth="3.2" />
            <path d="M60,48 L60,78 A8,8 0 0 1 44,78" fill="none" stroke="#059669" strokeWidth="3.2" />
          </>
        ) : sceneId === 'umb_B' ? (
          <>
            <path d="M26,56 A34,30 0 0 0 94,56 Z" fill="none" stroke="#059669" strokeWidth="3.2" />
            <line x1="60" y1="22" x2="60" y2="56" stroke="#059669" strokeWidth="3.2" />
          </>
        ) : (
          <circle cx="60" cy="48" r="28" fill="none" stroke="#059669" strokeWidth="3.2" />
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
  spec?: MirrorMosaicSpec;
}> = ({ figureId, transform = 'same', compact = false, spec }) => {
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
      {spec && (
        <g stroke="#94a3b8" strokeWidth="1.6">
          {spec.cells.map((col, idx) => {
            const r = Math.floor(idx / 3);
            const c = idx % 3;
            const x = 14 + c * 25;
            const y = 14 + r * 25;
            const fill = col || '#e2e8f0';
            const ac = spec.accentCorner && spec.accentCorner.idx === idx ? spec.accentCorner : null;
            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width="22"
                  height="22"
                  rx="3.5"
                  fill={fill}
                  stroke={col ? '#0f172a' : '#94a3b8'}
                />
                {ac && (
                  <polygon
                    points={
                      ac.corner === 'tl'
                        ? `${x},${y} ${x + 12},${y} ${x},${y + 12}`
                        : ac.corner === 'tr'
                        ? `${x + 22},${y} ${x + 10},${y} ${x + 22},${y + 12}`
                        : ac.corner === 'bl'
                        ? `${x},${y + 22} ${x + 12},${y + 22} ${x},${y + 10}`
                        : `${x + 22},${y + 22} ${x + 10},${y + 22} ${x + 22},${y + 10}`
                    }
                    fill={ac.color}
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}
        </g>
      )}
      {!spec && figureId === 'flag_arrow' && (
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

      {figureId === 'rocket_tilt' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          {/* Sağa doğru eğimli roket + sol üstte yıldız */}
          <g transform="translate(54, 52) rotate(35)">
            <path d="M0,-34 C12,-18 14,4 14,26 L-14,26 C-14,4 -12,-18 0,-34 Z" fill="#38bdf8" />
            <polygon points="-14,10 -24,28 -14,24" fill="#f43f5e" />
            <polygon points="14,10 24,28 14,24" fill="#f43f5e" />
            <circle cx="0" cy="-4" r="6" fill="#fef08a" />
          </g>
          <polygon points="22,16 25,22 31,23 26,27 28,33 22,30 16,33 18,27 13,23 19,22" fill="#f59e0b" />
        </g>
      )}

      {figureId === 'stairs_dot' && (
        <g stroke="#0f172a" strokeWidth="2.3" strokeLinejoin="round">
          {/* Soldan sağa yükselen 3 basamak + en tepede kırmızı bayrak */}
          <rect x="16" y="64" width="22" height="22" rx="3" fill="#38bdf8" />
          <rect x="38" y="42" width="22" height="44" rx="3" fill="#10b981" />
          <rect x="60" y="20" width="22" height="66" rx="3" fill="#f59e0b" />
          <polygon points="60,20 42,27 60,34" fill="#f43f5e" />
        </g>
      )}

      {figureId === 'key_asym' && (
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          <circle cx="28" cy="48" r="15" fill="#fbbf24" />
          <circle cx="28" cy="48" r="5" fill="#ffffff" />
          <rect x="42" y="43" width="44" height="10" rx="3" fill="#fbbf24" />
          <rect x="62" y="53" width="7" height="18" fill="#f43f5e" />
          <rect x="76" y="53" width="7" height="11" fill="#38bdf8" />
        </g>
      )}

      {figureId === 'pixel_4x4' && (
        <g stroke="#94a3b8" strokeWidth="1.4">
          {[
            ['#f43f5e', '#e2e8f0', '#e2e8f0', '#10b981'],
            ['#e2e8f0', '#38bdf8', '#e2e8f0', '#10b981'],
            ['#e2e8f0', '#38bdf8', '#fbbf24', '#10b981'],
            ['#a855f7', '#e2e8f0', '#e2e8f0', '#e2e8f0'],
          ].map((row, r) =>
            row.map((col, c) => (
              <rect
                key={`${r}-${c}`}
                x={12 + c * 20}
                y={12 + r * 20}
                width="18"
                height="18"
                rx="3"
                fill={col}
                stroke={col === '#e2e8f0' ? '#94a3b8' : '#0f172a'}
              />
            ))
          )}
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
  const cols = grid[0]?.length || 2;
  return (
    <div
      className={`grid gap-1.5 p-1.5 rounded-xl bg-slate-200 border border-slate-300 ${
        cols === 3 ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {grid.flat().map((val, idx) => (
        <div
          key={idx}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm tabular-nums border ${
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
// KAĞIT KATLAMA & DELİK AÇMA / ŞEKİL BİRLEŞTİRME / YÖN ALGORİTMASI SVG'LERİ
// ============================================================================
const renderPaperHole = (
  h: { x: number; y: number; shape?: 'circle' | 'diamond' | 'triangle' },
  idx: number
) => {
  if (h.shape === 'diamond') {
    return (
      <polygon
        key={idx}
        points={`${h.x},${h.y - 7.5} ${h.x + 7.5},${h.y} ${h.x},${h.y + 7.5} ${h.x - 7.5},${h.y}`}
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="1.2"
      />
    );
  }
  if (h.shape === 'triangle') {
    return (
      <polygon
        key={idx}
        points={`${h.x},${h.y - 7} ${h.x + 7},${h.y + 6} ${h.x - 7},${h.y + 6}`}
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="1.2"
      />
    );
  }
  return <circle key={idx} cx={h.x} cy={h.y} r="6.8" fill="#0f172a" />;
};

const PaperFoldQuestionSVG: React.FC<{
  foldType: 'half_v' | 'half_h' | 'quarter' | 'diag_tr';
  holes: { x: number; y: number; shape?: 'circle' | 'diamond' | 'triangle' }[];
}> = ({ foldType, holes }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
      {/* Adım 1: Katlama Yönü */}
      <div className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-300 shadow-sm flex flex-col items-center gap-1">
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
          <rect x="6" y="6" width="88" height="88" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
          {(foldType === 'half_v' || foldType === 'quarter') && (
            <>
              <line x1="50" y1="6" x2="50" y2="94" stroke="#0284c7" strokeWidth="2.2" strokeDasharray="4 3" />
              <path d="M78,34 Q62,22 44,34" fill="none" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
              <polygon points="41,34 48,29 48,39" fill="#0284c7" />
            </>
          )}
          {(foldType === 'half_h' || foldType === 'quarter') && (
            <>
              <line x1="6" y1="50" x2="94" y2="50" stroke="#e11d48" strokeWidth="2.2" strokeDasharray="4 3" />
              <path d="M34,76 Q22,62 34,44" fill="none" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" />
              <polygon points="34,40 29,48 39,48" fill="#e11d48" />
            </>
          )}
          {foldType === 'diag_tr' && (
            <>
              <line x1="6" y1="6" x2="94" y2="94" stroke="#7c3aed" strokeWidth="2.2" strokeDasharray="4 3" />
              <path d="M26,74 Q42,58 64,34" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />
              <polygon points="67,31 58,34 64,40" fill="#7c3aed" />
            </>
          )}
        </svg>
        <span className="text-[10px] font-bold text-slate-600">Katla</span>
      </div>

      <span className="text-sky-600 font-black text-base sm:text-lg">→</span>

      {/* Adım 2: Delik Açma */}
      <div className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-300 shadow-sm flex flex-col items-center gap-1">
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
          <rect x="6" y="6" width="88" height="88" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
          {foldType === 'half_v' && (
            <rect x="6" y="6" width="44" height="88" rx="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" />
          )}
          {foldType === 'half_h' && (
            <rect x="6" y="6" width="88" height="44" rx="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" />
          )}
          {foldType === 'quarter' && (
            <rect x="6" y="6" width="44" height="44" rx="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" />
          )}
          {foldType === 'diag_tr' && (
            <polygon points="6,6 94,6 94,94" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
          )}
          {holes.map((h, i) => renderPaperHole(h, i))}
        </svg>
        <span className="text-[10px] font-bold text-slate-600">Del</span>
      </div>

      <span className="text-sky-600 font-black text-base sm:text-lg">→</span>

      {/* Adım 3: Açılmışı */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-50 border-2 border-dashed border-amber-500 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-amber-600 leading-none">?</span>
        <span className="text-[10px] font-bold text-amber-700 mt-1">Aç</span>
      </div>
    </div>
  );
};

const PaperUnfoldedSVG: React.FC<{
  holes: { x: number; y: number; shape?: 'circle' | 'diamond' | 'triangle' }[];
  foldLine?: 'v' | 'h' | 'vh' | 'diag';
}> = ({ holes, foldLine }) => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
    <rect x="6" y="6" width="88" height="88" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.4" />
    {(foldLine === 'v' || foldLine === 'vh') && (
      <line x1="50" y1="6" x2="50" y2="94" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
    )}
    {(foldLine === 'h' || foldLine === 'vh') && (
      <line x1="6" y1="50" x2="94" y2="50" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
    )}
    {foldLine === 'diag' && (
      <line x1="6" y1="6" x2="94" y2="94" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
    )}
    {holes.map((h, i) => renderPaperHole(h, i))}
  </svg>
);

const MiniOverlayGridSVG: React.FC<{
  gridSize: number;
  cells: { idx: number; color?: string }[];
  sizeClass?: string;
}> = ({ gridSize, cells, sizeClass = 'w-16 h-16 sm:w-20 sm:h-20' }) => {
  const cellMap = new Map(cells.map((c) => [c.idx, c.color || '#0284c7']));
  return (
    <div
      className={`grid gap-1 p-1.5 rounded-xl bg-slate-200 border border-slate-300 ${sizeClass}`}
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
        const col = cellMap.get(idx);
        return (
          <div
            key={idx}
            className="rounded-md bg-white border border-slate-300 flex items-center justify-center"
          >
            {col && (
              <div
                className="w-3/5 h-3/5 rounded-full border border-slate-900/40 shadow-sm"
                style={{ backgroundColor: col }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const GridPathSceneSVG: React.FC<{
  size: number;
  start: [number, number];
  moves: { dir: 'R' | 'L' | 'U' | 'D'; steps: number }[];
  targets?: { row: number; col: number; shape: ShapeKind; color: string }[];
  showCoords?: boolean;
}> = ({ size, start, moves, targets = [], showCoords = false }) => {
  const cols = ['A', 'B', 'C', 'D', 'E'].slice(0, size);
  const dirArrow: Record<'R' | 'L' | 'U' | 'D', string> = {
    R: '→',
    L: '←',
    U: '↑',
    D: '↓',
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap bg-white rounded-2xl border border-slate-300 p-2 sm:p-3 shadow-sm">
      <div className="flex flex-col items-center">
        {showCoords && (
          <div className="flex ml-5 mb-0.5 gap-1">
            {cols.map((c) => (
              <span key={c} className={`${size >= 5 ? 'w-7' : 'w-8'} sm:w-9 text-center text-[10px] font-black text-slate-500`}>
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center">
          {showCoords && (
            <div className="flex flex-col gap-1 mr-1">
              {Array.from({ length: size }).map((_, r) => (
                <span
                  key={r}
                  className={`${size >= 5 ? 'h-7' : 'h-8'} sm:h-9 flex items-center justify-center text-[10px] font-black text-slate-500 w-4`}
                >
                  {r + 1}
                </span>
              ))}
            </div>
          )}
          <div
            className="grid gap-1 p-1 rounded-xl bg-slate-200 border border-slate-300"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: size * size }).map((_, flatIdx) => {
              const r = Math.floor(flatIdx / size);
              const c = flatIdx % size;
              const isStart = start[0] === r && start[1] === c;
              const tgt = targets.find((t) => t.row === r && t.col === c);
              return (
                <div
                  key={flatIdx}
                  className={`${size >= 5 ? 'w-7 h-7' : 'w-8 h-8'} sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center ${
                    isStart
                      ? 'bg-emerald-100 border-emerald-500'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isStart ? (
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[11px] font-black text-emerald-700">★</span>
                      <span className="text-[7px] font-black text-emerald-700">BAŞLA</span>
                    </div>
                  ) : tgt ? (
                    <ShapeGlyph shape={tgt.shape} color={tgt.color} size={20} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Yön Adımları */}
      <div className="flex flex-row sm:flex-col gap-1.5 flex-wrap justify-center max-w-[140px]">
        {moves.map((m, idx) => (
          <div
            key={idx}
            className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-300 text-sky-900 font-black text-xs sm:text-sm flex items-center gap-1 tabular-nums shadow-sm"
          >
            <span>{m.steps}</span>
            <span className="text-sky-600 text-base leading-none">{dirArrow[m.dir]}</span>
          </div>
        ))}
      </div>
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
export const BilsemQuestionVisual: React.FC<{
  question: QuizVisualQuestion;
  flashPhase?: 'memorize' | 'answer';
}> = ({ question, flashPhase }) => {
  const { visualType, visualData } = question;

  if (visualType === 'cubes3d') {
    return (
      <div className="flex items-center justify-center px-4 py-3 bg-white rounded-2xl border border-slate-300 shadow-sm mx-auto">
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
        <ShadowFigureSVG
          figure={visualData.figure}
          isShadow={false}
          angle={visualData.angle}
          flipX={visualData.flipX}
        />
      </div>
    );
  }

  if (visualType === 'pattern_tile') {
    return (
      <div className="grid grid-cols-2 w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-slate-400 mx-auto shadow-md bg-white">
        <div className="border-r border-b border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={0} spec={visualData.spec} />
        </div>
        <div className="border-b border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={1} spec={visualData.spec} />
        </div>
        <div className="border-r border-slate-300">
          <PatternTileSquareSVG patternId={visualData.patternId} quadrant={2} spec={visualData.spec} />
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
        <PuzzleCutSVG puzzleId={visualData.puzzleId} mode="board" spec={visualData.spec} />
      </div>
    );
  }

  if (visualType === 'embedded_shape') {
    return (
      <div className="p-2.5 rounded-2xl bg-white border border-slate-300 shadow-sm flex items-center justify-center max-w-[260px] mx-auto">
        <EmbeddedShapeSVG sceneId={visualData.sceneId} spec={visualData.spec} />
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
          <MirrorFigureSVG figureId={visualData.figureId} transform="same" spec={visualData.spec} />
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

  if (visualType === 'paper_fold') {
    return (
      <PaperFoldQuestionSVG
        foldType={visualData.foldType}
        holes={visualData.holes || []}
      />
    );
  }

  if (visualType === 'grid_path') {
    return (
      <GridPathSceneSVG
        size={visualData.size || 4}
        start={visualData.start || [0, 0]}
        moves={visualData.moves || []}
        targets={visualData.targets || []}
        showCoords={Boolean(visualData.showCoords)}
      />
    );
  }

  if (visualType === 'shape_overlay') {
    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap p-2 rounded-2xl bg-white border border-slate-300 shadow-sm">
        <MiniOverlayGridSVG
          gridSize={visualData.gridSize || 3}
          cells={visualData.gridA || []}
          sizeClass="w-16 h-16 sm:w-20 sm:h-20"
        />
        <span className="px-2 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-700 font-black text-base sm:text-lg">
          {visualData.ruleSymbol || '+'}
        </span>
        <MiniOverlayGridSVG
          gridSize={visualData.gridSize || 3}
          cells={visualData.gridB || []}
          sizeClass="w-16 h-16 sm:w-20 sm:h-20"
        />
        <span className="text-slate-600 font-black text-base sm:text-lg">=</span>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-50 border-2 border-dashed border-amber-500 flex items-center justify-center">
          <span className="text-2xl font-black text-amber-600">?</span>
        </div>
      </div>
    );
  }

  return <BilsemSampleQuestionVisual question={question} flashPhase={flashPhase} />;
};

export const BilsemOptionVisual: React.FC<{
  question: QuizVisualQuestion;
  visual: any;
}> = ({ question, visual }) => {
  if (!visual) return null;
  if (
    question.visualType === 'matrix3x3' ||
    question.visualType === 'analogy' ||
    question.visualType === 'sequence_row' ||
    (question.visualType === 'grid_path' && visual.shape)
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
    return (
      <MirrorFigureSVG
        figureId={visual.figureId}
        transform={visual.transform}
        compact={true}
        spec={visual.spec || question.visualData?.spec}
      />
    );
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
        <ShadowFigureSVG
          figure={visual.figure}
          isShadow={true}
          variant={visual.variant}
          angle={visual.angle}
          flipX={visual.flipX}
        />
      </div>
    );
  }
  if (question.visualType === 'pattern_tile') {
    return (
      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
        <PatternTileSquareSVG
          patternId={visual.patternId}
          quadrant="option"
          piece={visual.piece}
          spec={visual.spec || question.visualData?.spec}
        />
      </div>
    );
  }
  if (question.visualType === 'puzzle_cut') {
    return (
      <PuzzleCutSVG
        puzzleId={visual.puzzleId}
        mode="piece"
        piece={visual.piece}
        spec={visual.spec || question.visualData?.spec}
      />
    );
  }
  if (question.visualType === 'embedded_shape') {
    return (
      <EmbeddedShapeSVG
        sceneId={visual.sceneId}
        compact={true}
        spec={visual.spec}
      />
    );
  }
  if (question.visualType === 'paper_fold') {
    return <PaperUnfoldedSVG holes={visual.holes || []} foldLine={visual.foldLine} />;
  }
  if (question.visualType === 'shape_overlay') {
    return (
      <MiniOverlayGridSVG
        gridSize={visual.gridSize || 3}
        cells={visual.cells || []}
        sizeClass="w-16 h-16 sm:w-20 sm:h-20"
      />
    );
  }
  return <BilsemSampleOptionVisual question={question} visual={visual} />;
};

// ============================================================================
// GÖRSEL AYIRT ETME KARTI (FARKLI OLANI BUL)
// ============================================================================
export const SpotOddCardSVG: React.FC<{
  theme: SpotOddTheme;
  isOdd: boolean;
  variantIndex?: number;
  glyphSpec?: SpotOddGlyphSpec;
}> = ({ theme, isOdd, variantIndex = 0, glyphSpec }) => {
  if (glyphSpec) {
    const useAltDot = isOdd && glyphSpec.oddChange === 'dot_count';
    const useRot = isOdd && glyphSpec.oddChange === 'inner_rot';
    const useSwap = isOdd && glyphSpec.oddChange === 'color_swap';
    const useAltInner = isOdd && glyphSpec.oddChange === 'inner_shape';
    const hideRing = isOdd && glyphSpec.oddChange === 'missing_ring';

    const cMain = useSwap ? glyphSpec.accentColor : glyphSpec.primaryColor;
    const cAcc = useSwap ? glyphSpec.primaryColor : glyphSpec.accentColor;
    const dotCount = useAltDot
      ? glyphSpec.cornerDots === 4
        ? 3
        : glyphSpec.cornerDots + 1
      : glyphSpec.cornerDots;
    const dotPos: [number, number][] = [
      [22, 22],
      [98, 22],
      [22, 98],
      [98, 98],
    ];
    const renderGlyphShape = (kind: ShapeKind, fill: string, rScale: number, rotDeg = 0) => {
      const cx = 60;
      const cy = 60;
      const s = 30 * rScale;
      if (kind === 'circle') return <circle cx={cx} cy={cy} r={s} fill={fill} stroke="#0f172a" strokeWidth="2.2" />;
      if (kind === 'square')
        return (
          <rect
            x={cx - s}
            y={cy - s}
            width={s * 2}
            height={s * 2}
            rx="5"
            fill={fill}
            stroke="#0f172a"
            strokeWidth="2.2"
            transform={`rotate(${rotDeg} 60 60)`}
          />
        );
      if (kind === 'triangle')
        return (
          <polygon
            points={`${cx},${cy - s} ${cx + s},${cy + s * 0.85} ${cx - s},${cy + s * 0.85}`}
            fill={fill}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
            transform={`rotate(${rotDeg} 60 60)`}
          />
        );
      if (kind === 'diamond')
        return (
          <polygon
            points={`${cx},${cy - s * 1.1} ${cx + s * 1.1},${cy} ${cx},${cy + s * 1.1} ${cx - s * 1.1},${cy}`}
            fill={fill}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
            transform={`rotate(${rotDeg} 60 60)`}
          />
        );
      if (kind === 'hexagon')
        return (
          <polygon
            points={`${cx},${cy - s} ${cx + s * 0.88},${cy - s * 0.5} ${cx + s * 0.88},${cy + s * 0.5} ${cx},${cy + s} ${cx - s * 0.88},${cy + s * 0.5} ${cx - s * 0.88},${cy - s * 0.5}`}
            fill={fill}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
            transform={`rotate(${rotDeg} 60 60)`}
          />
        );
      return (
        <polygon
          points="60,34 67,49 84,51 71,62 74,78 60,70 46,78 49,62 36,51 53,49"
          fill={fill}
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinejoin="round"
          transform={`translate(60 60) scale(${rScale}) translate(-60 -60) rotate(${rotDeg} 60 60)`}
        />
      );
    };
    const innerKind: ShapeKind = useAltInner
      ? glyphSpec.innerShape === 'star'
        ? 'triangle'
        : 'star'
      : glyphSpec.innerShape;

    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
        <rect x="8" y="8" width="104" height="104" rx="16" fill={glyphSpec.bg} stroke="#cbd5e1" strokeWidth="2.2" />
        {!hideRing && <circle cx="60" cy="60" r="40" fill="none" stroke={cMain} strokeWidth="3.5" strokeDasharray="6 4" />}
        {renderGlyphShape(glyphSpec.outerShape, cMain, 0.96, 0)}
        {renderGlyphShape(innerKind, cAcc, 0.48, useRot ? 180 : 0)}
        {dotPos.slice(0, dotCount).map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r="5.5" fill={cAcc} stroke="#0f172a" strokeWidth="1.5" />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
      {theme === 'robot' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <line x1="60" y1="22" x2="60" y2="10" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="60" cy="10" r="5" fill={isOdd && variantIndex === 0 ? '#f43f5e' : '#fbbf24'} />
          <rect x="34" y="22" width="52" height="34" rx="8" fill="#38bdf8" />
          <circle cx="48" cy="37" r="5" fill="#0f172a" />
          <circle cx="72" cy="37" r={isOdd && variantIndex === 1 ? 8 : 5} fill="#0f172a" />
          <rect x="46" y="47" width="28" height="4" rx="2" fill="#ffffff" />
          <rect x="28" y="60" width="64" height="42" rx="8" fill="#0284c7" />
          <circle cx="46" cy="76" r="5" fill="#fbbf24" />
          {!(isOdd && variantIndex === 0) && <circle cx="60" cy="76" r="5" fill="#10b981" />}
          <circle cx="74" cy="76" r="5" fill={isOdd && variantIndex === 1 ? '#fbbf24' : '#f43f5e'} />
        </g>
      )}

      {theme === 'house' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {/* Baca */}
          <rect x={isOdd && variantIndex === 0 ? '28' : '76'} y="18" width="12" height="24" fill="#94a3b8" />
          {/* Çatı */}
          <polygon points="18,52 60,16 102,52" fill="#f43f5e" />
          {!(isOdd && variantIndex === 0) && <circle cx="60" cy="38" r="6" fill="#fef08a" />}
          {/* Gövde */}
          <rect x="24" y="52" width="72" height="54" rx="4" fill="#fde68a" />
          <rect x="50" y="72" width="20" height="34" fill={isOdd && variantIndex === 1 ? '#10b981' : '#92400e'} />
          <rect x="30" y="62" width="14" height="14" fill="#38bdf8" />
          {!(isOdd && variantIndex === 1) && <rect x="76" y="62" width="14" height="14" fill="#38bdf8" />}
        </g>
      )}

      {theme === 'owl' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="60" cy="68" rx="34" ry="38" fill="#a855f7" />
          <ellipse cx="60" cy="78" rx="22" ry="22" fill="#e9d5ff" />
          <circle cx="45" cy="46" r="12" fill="#ffffff" />
          <circle cx="75" cy="46" r="12" fill="#ffffff" />
          <circle cx="46" cy="46" r="5" fill="#0f172a" />
          <circle cx="74" cy="46" r="5" fill="#0f172a" />
          {isOdd && variantIndex === 0 && <line x1="65" y1="30" x2="86" y2="25" stroke="#fde047" strokeWidth="3.5" />}
          <polygon points="54,54 66,54 60,64" fill={isOdd && variantIndex === 1 ? '#e11d48' : '#f59e0b'} />
          <circle cx="52" cy="76" r="3" fill="#7e22ce" />
          {!isOdd && <circle cx="60" cy="84" r="3" fill="#7e22ce" />}
          <circle cx="68" cy="76" r="3" fill="#7e22ce" />
        </g>
      )}

      {theme === 'ship' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="58" y="18" width="4" height="58" fill="#78350f" />
          <polygon points={isOdd && variantIndex === 0 ? '58,18 38,24 58,30' : '62,18 82,24 62,30'} fill="#f43f5e" />
          <polygon points="58,28 24,72 58,72" fill="#ffffff" />
          <polygon points="62,36 92,72 62,72" fill={isOdd && variantIndex === 1 ? '#38bdf8' : '#fde047'} />
          <polygon points="16,74 104,74 90,98 30,98" fill="#0284c7" />
          <circle cx="44" cy="86" r="5" fill="#e0f2fe" />
          {isOdd && variantIndex === 0 && <circle cx="60" cy="86" r="5" fill="#e0f2fe" />}
          {!(isOdd && variantIndex === 1) && <circle cx="76" cy="86" r="5" fill="#e0f2fe" />}
        </g>
      )}

      {theme === 'flower' && (
        <g stroke="#0f172a" strokeWidth="2" strokeLinejoin="round">
          <line x1="60" y1="54" x2="60" y2="108" stroke="#22c55e" strokeWidth="5" />
          <ellipse cx="44" cy="86" rx="12" ry="6" fill="#22c55e" transform="rotate(-25 44 86)" />
          {!(isOdd && variantIndex === 0) && <ellipse cx="76" cy="86" rx="12" ry="6" fill="#22c55e" transform="rotate(25 76 86)" />}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={deg}
              cx={60 + Math.cos((deg * Math.PI) / 180) * 18}
              cy={42 + Math.sin((deg * Math.PI) / 180) * 18}
              r="11"
              fill={
                isOdd && variantIndex === 0 && deg === 120
                  ? '#38bdf8'
                  : isOdd && variantIndex === 1 && deg === 0
                  ? '#a855f7'
                  : '#fb7185'
              }
            />
          ))}
          <circle cx="60" cy="42" r={isOdd && variantIndex === 1 ? 7 : 12} fill="#fde047" />
        </g>
      )}

      {theme === 'clock' && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round">
          <circle cx="60" cy="60" r="44" fill="#f8fafc" stroke={isOdd && variantIndex === 1 ? '#f59e0b' : '#38bdf8'} strokeWidth="5" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
            <circle
              key={d}
              cx={60 + Math.cos((d * Math.PI) / 180) * 35}
              cy={60 + Math.sin((d * Math.PI) / 180) * 35}
              r="2.2"
              fill="#334155"
            />
          ))}
          <line x1="60" y1="60" x2="60" y2={isOdd && variantIndex === 1 ? '90' : '30'} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <line
            x1="60"
            y1="60"
            x2={isOdd && variantIndex === 0 ? '36' : '84'}
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
          {!(isOdd && variantIndex === 0) && (
            <>
              <circle cx="38" cy="20" r="7" fill="#e2e8f0" />
              <circle cx="50" cy="14" r="9" fill="#f8fafc" />
            </>
          )}
          <rect x="30" y="28" width="12" height="22" fill="#334155" />
          <rect x="22" y="48" width="46" height="32" rx="4" fill="#ef4444" />
          <rect x="64" y="34" width="34" height="46" rx="4" fill="#2563eb" />
          <rect x="72" y="42" width="18" height="16" rx="3" fill={isOdd && variantIndex === 0 ? '#10b981' : '#fef08a'} />
          <circle cx="34" cy="86" r="10" fill="#fbbf24" />
          {!(isOdd && variantIndex === 1) && <circle cx="58" cy="86" r="10" fill="#fbbf24" />}
          <circle cx="84" cy="86" r="12" fill={isOdd && variantIndex === 1 ? '#10b981' : '#fbbf24'} />
        </g>
      )}

      {theme === 'cake' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="38" y="26" width="6" height="22" fill="#38bdf8" />
          <ellipse cx="41" cy="20" rx="3.5" ry="5.5" fill="#fbbf24" />
          {!(isOdd && variantIndex === 0) && (
            <>
              <rect x="57" y="22" width="6" height="26" fill="#a855f7" />
              <ellipse cx="60" cy="16" rx="3.5" ry="5.5" fill="#fbbf24" />
            </>
          )}
          {!(isOdd && variantIndex === 1) && (
            <>
              <rect x="76" y="26" width="6" height="22" fill="#10b981" />
              <ellipse cx="79" cy="20" rx="3.5" ry="5.5" fill="#fbbf24" />
            </>
          )}
          <rect x="22" y="48" width="76" height="24" rx="6" fill={isOdd && variantIndex === 1 ? '#fde047' : '#fda4af'} />
          <rect x="18" y="70" width="84" height="28" rx="6" fill="#92400e" />
          <rect x="14" y="96" width="92" height="8" rx="4" fill="#cbd5e1" />
        </g>
      )}

      {theme === 'mushroom' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="46" y="60" width="28" height="44" rx="8" fill="#fef3c7" />
          <path d="M16,64 C16,24 104,24 104,64 Z" fill={isOdd && variantIndex === 1 ? '#f59e0b' : '#ef4444'} />
          <circle cx="42" cy="44" r="7" fill="#ffffff" />
          {!(isOdd && variantIndex === 1) && <circle cx="62" cy="36" r="8" fill="#ffffff" />}
          <circle cx="80" cy="48" r="6" fill="#ffffff" />
          {!(isOdd && variantIndex === 0) && <circle cx="68" cy="54" r="5" fill="#ffffff" />}
        </g>
      )}

      {theme === 'balloon' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <line x1="46" y1="74" x2="50" y2="90" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="74" y1="74" x2="70" y2="90" stroke="#cbd5e1" strokeWidth="2.5" />
          <rect x="46" y="88" width="28" height="18" rx="4" fill={isOdd && variantIndex === 1 ? '#fbbf24' : '#92400e'} />
          <circle cx="60" cy="44" r="32" fill={isOdd && variantIndex === 1 ? '#f43f5e' : '#38bdf8'} />
          <ellipse cx="60" cy="44" rx="14" ry="32" fill={isOdd && variantIndex === 0 ? '#eab308' : '#10b981'} />
        </g>
      )}

      {theme === 'car' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {!(isOdd && variantIndex === 0) && <rect x="52" y="28" width="16" height="8" rx="3" fill="#38bdf8" />}
          <path d="M34,54 L44,36 L76,36 L86,54 Z" fill="#f43f5e" />
          <polygon points="46,40 58,40 58,52 39,52" fill="#e0f2fe" />
          <polygon points="62,40 74,40 81,52 62,52" fill={isOdd && variantIndex === 1 ? '#fbbf24' : '#e0f2fe'} />
          <rect x="18" y="54" width="84" height="24" rx="7" fill="#ef4444" />
          <circle cx="24" cy="64" r="5" fill={isOdd && variantIndex === 0 ? '#fbbf24' : '#ffffff'} />
          <circle cx="38" cy="82" r="11" fill="#334155" />
          <circle cx="38" cy="82" r="4.5" fill="#e2e8f0" />
          <circle cx="82" cy="82" r={isOdd && variantIndex === 1 ? 7 : 11} fill="#334155" />
          <circle cx="82" cy="82" r="4.5" fill="#e2e8f0" />
        </g>
      )}

      {theme === 'penguin' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="44" cy="100" rx="10" ry="5" fill="#f59e0b" />
          <ellipse cx="76" cy="100" rx="10" ry="5" fill="#f59e0b" />
          <ellipse cx="60" cy="62" rx="32" ry="38" fill="#1e293b" />
          <ellipse cx="60" cy="68" rx="21" ry="26" fill="#ffffff" />
          <circle cx="49" cy="40" r="4.5" fill="#ffffff" />
          <circle cx="71" cy="40" r="4.5" fill="#ffffff" />
          <circle cx="49" cy="40" r="2.2" fill="#0f172a" />
          <circle cx="71" cy="40" r="2.2" fill="#0f172a" />
          <polygon points="54,46 66,46 60,55" fill="#f59e0b" />
          {!(isOdd && variantIndex === 1) && (
            <>
              <polygon points="48,58 60,64 48,70" fill={isOdd && variantIndex === 0 ? '#ef4444' : '#38bdf8'} />
              <polygon points="72,58 60,64 72,70" fill={isOdd && variantIndex === 0 ? '#ef4444' : '#38bdf8'} />
            </>
          )}
          {!(isOdd && variantIndex === 0) && <circle cx="60" cy="79" r="3" fill="#38bdf8" />}
        </g>
      )}

      {theme === 'icecream' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          {!(isOdd && variantIndex === 0) && <circle cx="60" cy="18" r="7" fill="#e11d48" />}
          <circle cx="60" cy="36" r="18" fill="#fda4af" />
          <circle cx="46" cy="54" r="16" fill={isOdd && variantIndex === 1 ? '#a855f7' : '#fde047'} />
          <circle cx="74" cy="54" r="16" fill="#67e8f9" />
          <polygon points="34,62 86,62 60,108" fill="#d97706" />
          <line x1="46" y1="68" x2="66" y2="96" stroke="#92400e" strokeWidth="2" />
          {!(isOdd && variantIndex === 1) && <line x1="74" y1="68" x2="54" y2="96" stroke="#92400e" strokeWidth="2" />}
        </g>
      )}

      {theme === 'castle_spot' && (
        <g stroke="#0f172a" strokeWidth="2" strokeLinejoin="round">
          <line x1="60" y1="14" x2="60" y2="34" stroke="#475569" strokeWidth="2.5" />
          <polygon points={isOdd && variantIndex === 0 ? '60,14 42,20 60,26' : '60,14 78,20 60,26'} fill="#ef4444" />
          <rect x="20" y="42" width="22" height="58" fill="#cbd5e1" />
          <polygon points="18,42 31,26 44,42" fill={isOdd && variantIndex === 1 ? '#f59e0b' : '#3b82f6'} />
          <rect x="78" y="42" width="22" height="58" fill="#cbd5e1" />
          <polygon points="76,42 89,26 102,42" fill="#3b82f6" />
          <rect x="42" y="34" width="36" height="66" fill="#e2e8f0" />
          {!(isOdd && variantIndex === 0) && <rect x="55" y="44" width="10" height="12" rx="3" fill="#38bdf8" />}
          <path d="M51,100 L51,78 A9,9 0 0 1 69,78 L69,100 Z" fill="#92400e" />
        </g>
      )}

      {theme === 'bee' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="48" cy="36" rx="14" ry="18" fill="#e0f2fe" transform="rotate(-15 48 36)" />
          {!(isOdd && variantIndex === 1) && (
            <ellipse cx="72" cy="36" rx="14" ry="18" fill="#e0f2fe" transform="rotate(15 72 36)" />
          )}
          <ellipse cx="60" cy="68" rx="32" ry="22" fill="#fbbf24" />
          <rect x="48" y="47" width="8" height="42" rx="3" fill="#0f172a" />
          <rect x="64" y="47" width="8" height="42" rx="3" fill="#0f172a" />
          {!(isOdd && variantIndex === 0) && <rect x="78" y="53" width="6" height="30" rx="2" fill="#0f172a" />}
          <circle cx="30" cy="66" r="14" fill="#0f172a" />
          <circle cx="26" cy="63" r="3.5" fill={isOdd && variantIndex === 1 ? '#fbbf24' : '#ffffff'} />
        </g>
      )}

      {theme === 'trophy_spot' && (
        <g stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M36,30 C18,30 18,56 38,56" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          {!(isOdd && variantIndex === 1) && (
            <path d="M84,30 C102,30 102,56 82,56" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          )}
          <path d="M34,22 L86,22 L80,62 C78,74 42,74 40,62 Z" fill="#fbbf24" />
          {!(isOdd && variantIndex === 0) && (
            <polygon points="60,33 63,40 71,41 65,46 67,53 60,49 53,53 55,46 49,41 57,40" fill="#ffffff" />
          )}
          <rect x="54" y="72" width="12" height="18" fill="#d97706" />
          <rect x="34" y="90" width="52" height="14" rx="4" fill="#92400e" />
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

      {/* 13. KAĞIT KATLAMA VE DELİK AÇMA */}
      {activityId === 'kagit_katlama' && (
        <g>
          <rect x="8" y="10" width="32" height="36" rx="4" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1.5" />
          <line x1="24" y1="10" x2="24" y2="46" stroke="#0284c7" strokeWidth="1.4" strokeDasharray="3 2" />
          <circle cx="16" cy="28" r="3.5" fill="#0f172a" />
          <path d="M44,28 L55,28 M52,24 L56,28 L52,32" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="62" y="10" width="38" height="36" rx="4" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
          <line x1="81" y1="10" x2="81" y2="46" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="71" cy="28" r="3.5" fill="#0f172a" />
          <circle cx="91" cy="28" r="3.5" fill="#0f172a" />
        </g>
      )}

      {/* 14. YÖN TAKİBİ, KODLAMA & GÖRSEL MANTIK */}
      {activityId === 'yon_algoritma' && (
        <g>
          <g transform="translate(8, 6)">
            <rect x="0" y="0" width="44" height="44" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.3" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={3 + c * 13.2}
                  y={3 + r * 13.2}
                  width="11.2"
                  height="11.2"
                  rx="2"
                  fill={r === 0 && c === 0 ? '#bbf7d0' : r === 2 && c === 2 ? '#bae6fd' : '#ffffff'}
                  stroke={r === 2 && c === 2 ? '#0284c7' : '#cbd5e1'}
                  strokeWidth="1"
                />
              ))
            )}
          </g>
          <rect x="60" y="10" width="44" height="15" rx="4" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.3" />
          <text x="82" y="21" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0369a1">2 →</text>
          <rect x="60" y="30" width="44" height="15" rx="4" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.3" />
          <text x="82" y="41" textAnchor="middle" fontSize="10" fontWeight="900" fill="#15803d">2 ↓</text>
        </g>
      )}

      {/* 15. KISA SÜRELİ GÖRSEL & SAYISAL HAFIZA */}
      {activityId === 'kisa_sureli_hafiza' && (
        <g>
          {/* Sol: Sayı dizisi kartı */}
          <rect x="6" y="8" width="54" height="24" rx="5" fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5" />
          <text x="33" y="24" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1e1b4b">8, 3, 0, 1</text>
          {/* Alt: Süre çubuğu */}
          <rect x="6" y="38" width="54" height="7" rx="3.5" fill="#e2e8f0" />
          <rect x="6" y="38" width="36" height="7" rx="3.5" fill="#6366f1" />
          {/* Sağ: Göz / Hatırla kartı */}
          <rect x="68" y="8" width="38" height="38" rx="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M74,27 C79,19 95,19 100,27 C95,35 79,35 74,27 Z" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.6" />
          <circle cx="87" cy="27" r="4" fill="#4f46e5" />
        </g>
      )}

      {/* 16. ZİHİNSEL DÖNDÜRME & FARKLI ŞEKİL */}
      {activityId === 'zihinsel_dondurme' && (
        <g>
          {/* Sol renkli T-parçası */}
          <g transform="translate(8, 13)" stroke="#0f172a" strokeWidth="1.2">
            <rect x="0" y="0" width="11" height="11" fill="#fde047" />
            <rect x="11" y="0" width="11" height="11" fill="#22c55e" />
            <rect x="22" y="0" width="11" height="11" fill="#ef4444" />
            <rect x="11" y="11" width="11" height="11" fill="#38bdf8" />
          </g>
          {/* Dönüş oku */}
          <path d="M49,21 A10,10 0 1,1 55,34" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
          <polygon points="51,17 53,24 46,23" fill="#ea580c" />
          {/* Sağ: 90° dönmüş renkli T-parçası */}
          <g transform="translate(72, 10)" stroke="#0f172a" strokeWidth="1.2">
            <rect x="11" y="0" width="11" height="11" fill="#fde047" />
            <rect x="11" y="11" width="11" height="11" fill="#22c55e" />
            <rect x="11" y="22" width="11" height="11" fill="#ef4444" />
            <rect x="0" y="11" width="11" height="11" fill="#38bdf8" />
          </g>
        </g>
      )}
    </svg>
  );
};