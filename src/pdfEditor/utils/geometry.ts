// Çizim yumuşatma, geometrik şekil ve sembol hesapları, silgi/seçim çarpışma testi (hit-test) ve CropBox + /Rotate koordinat dönüşümleri
import {
  isStampShapeType,
  SHAPE_FILL_MODE_OPTIONS,
  type ShapeAnnotation,
  type ShapeFillMode,
  type ShapeType,
  type StrokeAnnotation,
  type StrokePoint,
  type StrokeSmoothingLevel,
  type TextAnnotation,
} from '../types/pdf';

/**
 * Şeklin etkin dolgu modunu, opaklığını ve iç dolgu rengini (geriye dönük uyumlu olarak) çözer
 */
export function resolveShapeFill(shape: ShapeAnnotation): {
  mode: ShapeFillMode;
  opacity: number;
  fillColor: string;
} {
  const mode: ShapeFillMode = shape.fillMode ?? (shape.filled ? 'translucent' : 'none');
  const opacity = SHAPE_FILL_MODE_OPTIONS[mode].opacity;
  const fillColor = shape.fillColor || shape.color;
  return { mode, opacity, fillColor };
}

/**
 * Bir noktanın bir doğru parçasına olan en kısa mesafesini hesaplar (en-boy oranı düzeltmeli)
 */
function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  aspectRatio: number,
): number {
  const sx = px * aspectRatio;
  const sy = py;
  const sax = ax * aspectRatio;
  const say = ay;
  const sbx = bx * aspectRatio;
  const sby = by;

  const dx = sbx - sax;
  const dy = sby - say;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(sx - sax, sy - say);
  }

  const t = Math.max(0, Math.min(1, ((sx - sax) * dx + (sy - say) * dy) / lenSq));
  const projX = sax + t * dx;
  const projY = say + t * dy;

  return Math.hypot(sx - projX, sy - projY);
}

/**
 * Verilen noktanın bir serbest çizim çizgisine yakın olup olmadığını kontrol eder (silgi ve seçim için)
 */
export function isPointNearStroke(
  point: StrokePoint,
  stroke: StrokeAnnotation,
  pageWidthPx: number,
  pageHeightPx: number,
  hitRadiusPx = 14,
): boolean {
  if (stroke.points.length === 0 || pageWidthPx <= 0 || pageHeightPx <= 0) {
    return false;
  }

  const aspectRatio = pageWidthPx / pageHeightPx;
  const strokeHalfWidthPx = (stroke.widthRatio * pageWidthPx) / 2;
  const hitThresholdNorm = (hitRadiusPx + strokeHalfWidthPx) / pageHeightPx;

  if (stroke.points.length === 1) {
    const p0 = stroke.points[0];
    const dist = Math.hypot((point.x - p0.x) * aspectRatio, point.y - p0.y);
    return dist <= hitThresholdNorm;
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const a = stroke.points[i];
    const b = stroke.points[i + 1];
    const dist = pointToSegmentDistance(point.x, point.y, a.x, a.y, b.x, b.y, aspectRatio);
    if (dist <= hitThresholdNorm) {
      return true;
    }
  }

  return false;
}

/**
 * Shift basılıyken şekil bitiş noktasını düzgün kare/daire veya 45° açıya kilitler
 */
export function constrainShapeEndPoint(
  shapeType: ShapeType,
  start: StrokePoint,
  end: StrokePoint,
  pageWidthPx: number,
  pageHeightPx: number,
  shiftKey: boolean,
): StrokePoint {
  const forceSquareRatio = shapeType === 'square' || shapeType === 'circle';
  if ((!shiftKey && !forceSquareRatio) || pageWidthPx <= 0 || pageHeightPx <= 0) {
    return end;
  }

  const dxPx = (end.x - start.x) * pageWidthPx;
  const dyPx = (end.y - start.y) * pageHeightPx;

  if (shapeType === 'line' || shapeType === 'arrow') {
    const len = Math.hypot(dxPx, dyPx);
    if (len < 1) return end;
    const snappedAngle = Math.round(Math.atan2(dyPx, dxPx) / (Math.PI / 4)) * (Math.PI / 4);
    const nx = start.x + (Math.cos(snappedAngle) * len) / pageWidthPx;
    const ny = start.y + (Math.sin(snappedAngle) * len) / pageHeightPx;
    return {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, ny)),
    };
  }

  const sizePx = Math.max(Math.abs(dxPx), Math.abs(dyPx));
  const signX = dxPx >= 0 ? 1 : -1;
  const signY = dyPx >= 0 ? 1 : -1;
  return {
    x: Math.max(0, Math.min(1, start.x + (signX * sizePx) / pageWidthPx)),
    y: Math.max(0, Math.min(1, start.y + (signY * sizePx) / pageHeightPx)),
  };
}

/**
 * Ok şeklinin uç kanat noktalarını normalize (0-1) sayfa koordinatında hesaplar
 */
export function getArrowHeadNormPoints(
  shape: ShapeAnnotation,
  pageWidth: number,
  pageHeight: number,
): [StrokePoint, StrokePoint] | null {
  if (pageWidth <= 0 || pageHeight <= 0) return null;
  const x1 = shape.x1 * pageWidth;
  const y1 = shape.y1 * pageHeight;
  const x2 = shape.x2 * pageWidth;
  const y2 = shape.y2 * pageHeight;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return null;

  const strokePx = Math.max(1.5, shape.widthRatio * pageWidth);
  const headLen = Math.min(len * 0.45, Math.max(12, strokePx * 4.2));
  const angle = Math.atan2(dy, dx);
  const wingAngle = Math.PI / 6.2;

  const leftPx = {
    x: x2 - headLen * Math.cos(angle - wingAngle),
    y: y2 - headLen * Math.sin(angle - wingAngle),
  };
  const rightPx = {
    x: x2 - headLen * Math.cos(angle + wingAngle),
    y: y2 - headLen * Math.sin(angle + wingAngle),
  };

  return [
    { x: leftPx.x / pageWidth, y: leftPx.y / pageHeight },
    { x: rightPx.x / pageWidth, y: rightPx.y / pageHeight },
  ];
}

/**
 * Kapalı geometrik şekiller (dikdörtgen, çember/elips, üçgen, dik üçgen) için normalize çokgen köşelerini döndürür
 */
export function getClosedShapeNormPolygon(
  shape: ShapeAnnotation,
  ellipseSegments = 64,
): StrokePoint[] {
  const minX = Math.min(shape.x1, shape.x2);
  const maxX = Math.max(shape.x1, shape.x2);
  const minY = Math.min(shape.y1, shape.y2);
  const maxY = Math.max(shape.y1, shape.y2);

  switch (shape.shapeType) {
    case 'square':
    case 'rectangle':
      return [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ];
    case 'triangle':
      return [
        { x: (minX + maxX) / 2, y: minY },
        { x: minX, y: maxY },
        { x: maxX, y: maxY },
      ];
    case 'right-triangle':
      return [
        { x: minX, y: minY },
        { x: minX, y: maxY },
        { x: maxX, y: maxY },
      ];
    case 'circle':
    case 'ellipse': {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = (maxX - minX) / 2;
      const ry = (maxY - minY) / 2;
      const pts: StrokePoint[] = [];
      for (let i = 0; i < ellipseSegments; i++) {
        const theta = (i / ellipseSegments) * Math.PI * 2;
        pts.push({
          x: cx + rx * Math.cos(theta),
          y: cy + ry * Math.sin(theta),
        });
      }
      return pts;
    }
    default:
      return [];
  }
}

/**
 * Bir noktanın kapalı çokgen içinde olup olmadığını ray-casting yöntemiyle kontrol eder
 */
function isPointInPolygon(pt: StrokePoint, poly: StrokePoint[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi || 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface StampVectorGeometry {
  /** Açık çizgi parçaları (tik, çarpı, soru işareti kancası, ünlem çizgisi) */
  polylines: StrokePoint[][];
  /** Ana kapalı çokgen (yıldız, kalp) */
  polygon: StrokePoint[] | null;
  /** Dolgulu dairesel noktalar (soru işareti ve ünlem noktası) */
  dotPolygons: StrokePoint[][];
  /** Dolgu opaklığı (kapalı sembollerde canlı dolgu) */
  fillOpacity: number;
}

/**
 * Sembol/damga şekilleri (yeşil tik, kırmızı çarpı, yıldız, soru işareti, ünlem, kalp)
 * için hem SVG hem PDF dışa aktarımında birebir aynı sonucu veren normalize vektör geometrisini üretir
 */
export function getStampGeometry(shape: ShapeAnnotation): StampVectorGeometry {
  const minX = Math.min(shape.x1, shape.x2);
  const maxX = Math.max(shape.x1, shape.x2);
  const minY = Math.min(shape.y1, shape.y2);
  const maxY = Math.max(shape.y1, shape.y2);
  const w = Math.max(1e-6, maxX - minX);
  const h = Math.max(1e-6, maxY - minY);

  const mapPt = (u: number, v: number): StrokePoint => ({
    x: minX + u * w,
    y: minY + v * h,
  });

  const makeDot = (cu: number, cv: number, r = 0.072, segs = 16): StrokePoint[] => {
    const pts: StrokePoint[] = [];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(mapPt(cu + r * Math.cos(a), cv + r * Math.sin(a)));
    }
    return pts;
  };

  switch (shape.shapeType) {
    case 'check':
      return {
        polylines: [[mapPt(0.1, 0.56), mapPt(0.39, 0.85), mapPt(0.9, 0.16)]],
        polygon: null,
        dotPolygons: [],
        fillOpacity: 0,
      };
    case 'cross':
      return {
        polylines: [
          [mapPt(0.16, 0.16), mapPt(0.84, 0.84)],
          [mapPt(0.84, 0.16), mapPt(0.16, 0.84)],
        ],
        polygon: null,
        dotPolygons: [],
        fillOpacity: 0,
      };
    case 'star': {
      const pts: StrokePoint[] = [];
      const cx = 0.5;
      const cy = 0.53;
      const outerR = 0.46;
      const innerR = 0.2;
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push(mapPt(cx + r * Math.cos(angle), cy + r * Math.sin(angle)));
      }
      return {
        polylines: [],
        polygon: pts,
        dotPolygons: [],
        fillOpacity: shape.filled === false ? 0 : 0.78,
      };
    }
    case 'heart': {
      const pts: StrokePoint[] = [];
      const count = 36;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        // hx aralığı [-16..16], hy aralığı [-12..17]
        const u = 0.5 + (hx / 36) * 0.92;
        const v = 0.44 + (hy / 32) * 0.92;
        pts.push(mapPt(u, v));
      }
      return {
        polylines: [],
        polygon: pts,
        dotPolygons: [],
        fillOpacity: shape.filled === false ? 0 : 0.78,
      };
    }
    case 'question': {
      const hook: [number, number][] = [
        [0.31, 0.31],
        [0.34, 0.21],
        [0.42, 0.14],
        [0.52, 0.13],
        [0.62, 0.16],
        [0.69, 0.24],
        [0.7, 0.34],
        [0.65, 0.42],
        [0.56, 0.48],
        [0.5, 0.55],
        [0.5, 0.65],
      ];
      return {
        polylines: [hook.map(([u, v]) => mapPt(u, v))],
        polygon: null,
        dotPolygons: [makeDot(0.5, 0.85, 0.075)],
        fillOpacity: 0,
      };
    }
    case 'exclamation':
      return {
        polylines: [[mapPt(0.5, 0.13), mapPt(0.5, 0.64)]],
        polygon: null,
        dotPolygons: [makeDot(0.5, 0.85, 0.078)],
        fillOpacity: 0,
      };
    default:
      return { polylines: [], polygon: null, dotPolygons: [], fillOpacity: 0 };
  }
}

/**
 * Verilen noktanın bir geometrik şekle veya sembole (kenarına veya iç alanına) yakın olup olmadığını kontrol eder
 */
export function isPointNearShape(
  point: StrokePoint,
  shape: ShapeAnnotation,
  pageWidthPx: number,
  pageHeightPx: number,
  hitRadiusPx = 14,
): boolean {
  if (pageWidthPx <= 0 || pageHeightPx <= 0) return false;

  if (isStampShapeType(shape.shapeType)) {
    const padX = hitRadiusPx / pageWidthPx;
    const padY = hitRadiusPx / pageHeightPx;
    const minX = Math.min(shape.x1, shape.x2) - padX;
    const maxX = Math.max(shape.x1, shape.x2) + padX;
    const minY = Math.min(shape.y1, shape.y2) - padY;
    const maxY = Math.max(shape.y1, shape.y2) + padY;
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
  }

  const aspectRatio = pageWidthPx / pageHeightPx;
  const strokeHalfWidthPx = (shape.widthRatio * pageWidthPx) / 2;
  const hitThresholdNorm = (hitRadiusPx + strokeHalfWidthPx) / pageHeightPx;

  if (shape.shapeType === 'line' || shape.shapeType === 'arrow') {
    const dMain = pointToSegmentDistance(
      point.x,
      point.y,
      shape.x1,
      shape.y1,
      shape.x2,
      shape.y2,
      aspectRatio,
    );
    if (dMain <= hitThresholdNorm) return true;

    if (shape.shapeType === 'arrow') {
      const wings = getArrowHeadNormPoints(shape, pageWidthPx, pageHeightPx);
      if (wings) {
        const [leftW, rightW] = wings;
        if (
          pointToSegmentDistance(point.x, point.y, shape.x2, shape.y2, leftW.x, leftW.y, aspectRatio) <=
            hitThresholdNorm ||
          pointToSegmentDistance(point.x, point.y, shape.x2, shape.y2, rightW.x, rightW.y, aspectRatio) <=
            hitThresholdNorm
        ) {
          return true;
        }
      }
    }
    return false;
  }

  const poly = getClosedShapeNormPolygon(shape, 40);
  if (poly.length < 3) return false;

  const { mode } = resolveShapeFill(shape);
  if (mode !== 'none' && isPointInPolygon(point, poly)) {
    return true;
  }

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dist = pointToSegmentDistance(point.x, point.y, a.x, a.y, b.x, b.y, aspectRatio);
    if (dist <= hitThresholdNorm) {
      return true;
    }
  }

  return false;
}

/**
 * Silgi veya tıklama için bir noktanın metin kutusu alanı içinde olup olmadığını hesaplar
 */
export function isPointInsideText(
  point: StrokePoint,
  item: TextAnnotation,
  pageWidthPx: number,
  pageHeightPx: number,
): boolean {
  if (pageWidthPx <= 0 || pageHeightPx <= 0) return false;

  const fontSizePx = item.fontSizeRatio * pageHeightPx;
  const lineHeightPx = fontSizePx * 1.25;
  const lines = item.text.split(/\r?\n/);
  const maxChars = Math.max(1, ...lines.map((l) => l.length));

  const estimatedWidthPx = Math.max(24, maxChars * fontSizePx * 0.62);
  const estimatedHeightPx = Math.max(fontSizePx * 1.3, lines.length * lineHeightPx);
  const padPx = 8;

  const px = point.x * pageWidthPx;
  const py = point.y * pageHeightPx;
  const left = item.x * pageWidthPx - padPx;
  const top = item.y * pageHeightPx - padPx;

  return (
    px >= left &&
    px <= left + estimatedWidthPx + padPx * 2 &&
    py >= top &&
    py <= top + estimatedHeightPx + padPx * 2
  );
}

/**
 * Çizim sırasında gerçek zamanlı üstel hareketli ortalama (EMA) sabitleme ve mesafe filtreleme uygular.
 * Titrek fare/dokunmatik hareketlerini anlık olarak yumuşatır.
 */
export function appendSmoothedPoint(
  points: StrokePoint[],
  next: StrokePoint,
  smoothing: StrokeSmoothingLevel = 'normal',
): StrokePoint[] {
  if (points.length === 0) {
    return [next];
  }

  const minNormDistance =
    smoothing === 'off' ? 0.0014 : smoothing === 'high' ? 0.0032 : 0.0022;

  const last = points[points.length - 1];
  const rawDist = Math.hypot(next.x - last.x, next.y - last.y);
  if (rawDist < minNormDistance) {
    return points;
  }

  if (smoothing === 'off' || points.length === 1) {
    return [...points, next];
  }

  // EMA ağırlığı (düşük alpha = daha güçlü el titremesi sönümleme)
  const alpha = smoothing === 'high' ? 0.36 : 0.62;
  const stabilized: StrokePoint = {
    x: Math.max(0, Math.min(1, last.x + alpha * (next.x - last.x))),
    y: Math.max(0, Math.min(1, last.y + alpha * (next.y - last.y))),
  };

  if (Math.hypot(stabilized.x - last.x, stabilized.y - last.y) < minNormDistance * 0.45) {
    return points;
  }

  return [...points, stabilized];
}

/**
 * Akıllı tahta / dokunmatik kalem için O(1) yerinde (in-place) nokta ekleme ve hafif EMA sabitleme.
 * Her pointermove olayında dizi kopyalamadan yüksek frekanslı (coalesced) örnekleri işler.
 */
export function appendSmoothedPointInPlace(
  points: StrokePoint[],
  next: StrokePoint,
  smoothing: StrokeSmoothingLevel = 'normal',
): boolean {
  if (points.length === 0) {
    points.push(next);
    return true;
  }

  const minNormDistance =
    smoothing === 'off' ? 0.0009 : smoothing === 'high' ? 0.0022 : 0.0014;

  const last = points[points.length - 1];
  const rawDist = Math.hypot(next.x - last.x, next.y - last.y);
  if (rawDist < minNormDistance) {
    return false;
  }

  if (smoothing === 'off' || points.length === 1) {
    points.push(next);
    return true;
  }

  // Dokunmatik tahtada gecikme hissini önlemek için daha tepkisel EMA ağırlığı
  const alpha = smoothing === 'high' ? 0.42 : 0.72;
  const stabilized: StrokePoint = {
    x: Math.max(0, Math.min(1, last.x + alpha * (next.x - last.x))),
    y: Math.max(0, Math.min(1, last.y + alpha * (next.y - last.y))),
  };

  if (Math.hypot(stabilized.x - last.x, stabilized.y - last.y) < minNormDistance * 0.4) {
    return false;
  }

  points.push(stabilized);
  return true;
}

/**
 * Ramer-Douglas-Peucker (RDP) sadeleştirme: el titremesinden kaynaklanan gereksiz mikro noktaları
 * temizlerken gerçek şekil ve el yazısı köşelerini korur.
 */
function simplifyStrokeRDP(
  points: StrokePoint[],
  epsilon: number,
  aspectRatio: number,
): StrokePoint[] {
  if (points.length <= 2) return points;

  const first = points[0];
  const last = points[points.length - 1];
  let maxDist = -1;
  let splitIdx = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = pointToSegmentDistance(
      points[i].x,
      points[i].y,
      first.x,
      first.y,
      last.x,
      last.y,
      aspectRatio,
    );
    if (d > maxDist) {
      maxDist = d;
      splitIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyStrokeRDP(points.slice(0, splitIdx + 1), epsilon, aspectRatio);
    const right = simplifyStrokeRDP(points.slice(splitIdx), epsilon, aspectRatio);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

/**
 * Köşe duyarlı Chaikin alt bölme (Corner-Preserving Chaikin Smoothing):
 * Yumuşak eğrileri pürüzsüzleştirirken keskin harf/rakam köşelerinin (ör. M, Z, 7) ezilmesini önler.
 */
function chaikinCornerAwarePass(
  points: StrokePoint[],
  aspectRatio: number,
  sharpAngleThresholdDeg = 72,
): StrokePoint[] {
  if (points.length < 3) return points;

  const result: StrokePoint[] = [points[0]];
  const cosSharpThreshold = Math.cos(((180 - sharpAngleThresholdDeg) * Math.PI) / 180);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const v1x = (curr.x - prev.x) * aspectRatio;
    const v1y = curr.y - prev.y;
    const v2x = (next.x - curr.x) * aspectRatio;
    const v2y = next.y - curr.y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    let isSharpCorner = false;
    if (len1 > 1e-6 && len2 > 1e-6) {
      // cosTheta: 1 = düz devam, -1 = tam geri dönüş
      const cosTheta = (v1x * v2x + v1y * v2y) / (len1 * len2);
      if (cosTheta < cosSharpThreshold) {
        isSharpCorner = true;
      }
    }

    if (isSharpCorner) {
      // Keskin el yazısı köşesini koru
      result.push(curr);
    } else {
      const q: StrokePoint = {
        x: 0.75 * curr.x + 0.25 * prev.x,
        y: 0.75 * curr.y + 0.25 * prev.y,
      };
      const r: StrokePoint = {
        x: 0.75 * curr.x + 0.25 * next.x,
        y: 0.75 * curr.y + 0.25 * next.y,
      };
      result.push(q, r);
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Kalem kaldırıldığında (pointerUp) tamamlanan serbest çizime son iyileştirme uygular:
 * 1) Ağırlıklı hareketli ortalama ile mikro titreme giderme
 * 2) RDP ile gereksiz nokta sadeleştirme
 * 3) Köşe duyarlı Chaikin eğri yumuşatma
 */
export function smoothCompletedStroke(
  points: StrokePoint[],
  smoothing: StrokeSmoothingLevel,
  pageWidthPx: number,
  pageHeightPx: number,
): StrokePoint[] {
  if (smoothing === 'off' || points.length < 3) {
    return points;
  }

  const aspectRatio = pageWidthPx > 0 && pageHeightPx > 0 ? pageWidthPx / pageHeightPx : 1;

  // 1. Hafif 3 noktalı ortalama geçişi (uç noktalar sabit)
  let refined: StrokePoint[] = points.map((pt, idx) => {
    if (idx === 0 || idx === points.length - 1) return pt;
    const prev = points[idx - 1];
    const next = points[idx + 1];
    const wCenter = smoothing === 'high' ? 0.5 : 0.64;
    const wSide = (1 - wCenter) / 2;
    return {
      x: prev.x * wSide + pt.x * wCenter + next.x * wSide,
      y: prev.y * wSide + pt.y * wCenter + next.y * wSide,
    };
  });

  // 2. RDP sadeleştirme (titreme noktalarını temizle)
  const epsilon = smoothing === 'high' ? 0.0026 : 0.0013;
  refined = simplifyStrokeRDP(refined, epsilon, aspectRatio);

  // 3. Köşe duyarlı Chaikin yumuşatma
  const passes = smoothing === 'high' ? 2 : 1;
  for (let p = 0; p < passes; p++) {
    refined = chaikinCornerAwarePass(refined, aspectRatio, smoothing === 'high' ? 62 : 76);
  }

  return refined;
}

/**
 * Normalize noktaları Catmull-Rom -> Kübik Bezier eğrilerine çevirerek
 * tüm kontrol noktalarından pürüzsüz (C1 sürekli) geçen profesyonel SVG path üretir
 */
export function buildSmoothSvgPath(
  points: StrokePoint[],
  widthPx: number,
  heightPx: number,
): string {
  if (points.length === 0) return '';

  const p0x = points[0].x * widthPx;
  const p0y = points[0].y * heightPx;

  if (points.length === 1) {
    return `M ${p0x.toFixed(2)} ${p0y.toFixed(2)} L ${(p0x + 0.01).toFixed(2)} ${p0y.toFixed(2)}`;
  }

  if (points.length === 2) {
    const p1x = points[1].x * widthPx;
    const p1y = points[1].y * heightPx;
    return `M ${p0x.toFixed(2)} ${p0y.toFixed(2)} L ${p1x.toFixed(2)} ${p1y.toFixed(2)}`;
  }

  const tension = 0.5;
  let d = `M ${p0x.toFixed(2)} ${p0y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = (p1.x + ((p2.x - p0.x) * tension) / 3) * widthPx;
    const cp1y = (p1.y + ((p2.y - p0.y) * tension) / 3) * heightPx;
    const cp2x = (p2.x - ((p3.x - p1.x) * tension) / 3) * widthPx;
    const cp2y = (p2.y - ((p3.y - p1.y) * tension) / 3) * heightPx;
    const endX = p2.x * widthPx;
    const endY = p2.y * heightPx;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  return d;
}

/**
 * PDF dışa aktarımında serbest çizimlerin ekrandaki Catmull-Rom eğrileriyle aynı pürüzsüzlükte
 * çıkması için normalize kübik Bezier noktalarını örnekler
 */
export function sampleSmoothStrokeForPdf(
  points: StrokePoint[],
  stepsPerSegment = 4,
): StrokePoint[] {
  if (points.length <= 2) return points;

  const tension = 0.5;
  const sampled: StrokePoint[] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = segDist < 0.004 ? 1 : stepsPerSegment;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const mt = 1 - t;
      const x =
        mt * mt * mt * p1.x +
        3 * mt * mt * t * cp1x +
        3 * mt * t * t * cp2x +
        t * t * t * p2.x;
      const y =
        mt * mt * mt * p1.y +
        3 * mt * mt * t * cp1y +
        3 * mt * t * t * cp2y +
        t * t * t * p2.y;
      sampled.push({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      });
    }
  }

  return sampled;
}

/**
 * Sayfanın CropBox ve /Rotate değerlerini dikkate alarak ekrandaki normalize (0-1)
 * koordinatı pdf-lib sayfa koordinatına (point, sol-alt başlangıçlı) dönüştürür.
 */
export function screenNormToPdfPoint(
  nx: number,
  ny: number,
  cropBox: { x: number; y: number; width: number; height: number },
  rotationDeg: number,
): { x: number; y: number } {
  const rot = ((rotationDeg % 360) + 360) % 360;
  const { x: cx, y: cy, width: cw, height: ch } = cropBox;

  switch (rot) {
    case 90:
      return {
        x: cx + ny * cw,
        y: cy + nx * ch,
      };
    case 180:
      return {
        x: cx + (1 - nx) * cw,
        y: cy + ny * ch,
      };
    case 270:
      return {
        x: cx + (1 - ny) * cw,
        y: cy + (1 - nx) * ch,
      };
    case 0:
    default:
      return {
        x: cx + nx * cw,
        y: cy + (1 - ny) * ch,
      };
  }
}

/**
 * Döndürülmüş sayfanın ekranda görünen genişlik ve yüksekliğini (PDF point cinsinden) döndürür
 */
export function getDisplayedPdfSize(
  cropBox: { width: number; height: number },
  rotationDeg: number,
): { dispWidth: number; dispHeight: number } {
  const rot = ((rotationDeg % 360) + 360) % 360;
  if (rot === 90 || rot === 270) {
    return { dispWidth: cropBox.height, dispHeight: cropBox.width };
  }
  return { dispWidth: cropBox.width, dispHeight: cropBox.height };
}
