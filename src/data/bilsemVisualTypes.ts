export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'hexagon';
export type ShapeColor = '#38bdf8' | '#f59e0b' | '#10b981' | '#f43f5e' | '#a855f7' | '#eab308';

export type PatternMotifKind =
  | 'corner_tri'
  | 'diag_band'
  | 'arc_ring'
  | 'double_stripe'
  | 'star_dot'
  | 'chevron_l'
  | 'diamond_edge'
  | 'petal_drop'
  | 'step_corner'
  | 'ring_dot';

export interface PatternTileSpec {
  motif: PatternMotifKind;
  bg: string;
  c1: string;
  c2: string;
}

export interface PuzzleCutSpec {
  boardColor: string;
  pieceColor: string;
  boardCutPoints: string;
  exactPoints: string;
  wrongPoints: Record<string, string>;
}

export type EmbeddedWireKind =
  | 'house_frame'
  | 'z_bolt'
  | 'flag_pole'
  | 'm_crown'
  | 'arrow_right'
  | 'hourglass'
  | 'umbrella'
  | 'kite_tail'
  | 'sailboat_frame'
  | 'lightning'
  | 'bowtie'
  | 'hook_j'
  | 'diamond_cross'
  | 'double_tri'
  | 'tree_branch'
  | 'key_line'
  | 'pentagon_cut'
  | 'fish_wire'
  | 'cup_handle'
  | 'stair_step';

export interface EmbeddedSceneSpec {
  mode: 'target' | 'clutter' | 'count_shapes';
  kind?: EmbeddedWireKind;
  strokeColor?: string;
  clutterFrame?: 'grid' | 'circle' | 'diag' | 'hex';
  variant?: 'match' | 'flipX' | 'flipY' | 'broken';
  countKind?: 'triangles' | 'squares' | 'circles' | 'diamonds' | 'stars';
  countValue?: number;
}

export interface MirrorMosaicSpec {
  cells: (string | null)[]; // length 9 (3x3)
  accentCorner?: { idx: number; color: string; corner: 'tl' | 'tr' | 'bl' | 'br' };
}

export interface SpotOddGlyphSpec {
  bg: string;
  primaryColor: string;
  accentColor: string;
  outerShape: ShapeKind;
  innerShape: ShapeKind;
  cornerDots: 1 | 2 | 3 | 4;
  oddChange: 'dot_count' | 'inner_rot' | 'color_swap' | 'inner_shape' | 'missing_ring';
}
