// Çizim yumuşatma, geometrik şekil ve sembol hesapları, silgi/seçim çarpışma testi (hit-test) ve CropBox + /Rotate koordinat dönüşümleri
import {
  isStampShapeType,
  type ShapeAnnotation,
  type ShapeType,
  type StrokeAnnotation,
  type StrokePoint,
  type TextAnnotation,
} from '../types/pdf';

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
  if (!shiftKey || pageWidthPx <= 0 || pageHeightPx <= 0) {
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

  if (shape.filled && isPointInPolygon(point, poly)) {
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
 * Kalem noktalarını aşırı yoğunluktan arındırır (performans ve pürüzsüz eğriler için)
 */
export function appendSmoothedPoint(
  points: StrokePoint[],
  next: StrokePoint,
  minNormDistance = 0.0022,
): StrokePoint[] {
  if (points.length === 0) {
    return [next];
  }
  const last = points[points.length - 1];
  const dist = Math.hypot(next.x - last.x, next.y - last.y);
  if (dist < minNormDistance) {
    return points;
  }
  return [...points, next];
}

/**
 * Normalize noktaları kuadratik Bezier eğrileriyle pürüzsüz SVG path dizgisine çevirir
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

  let d = `M ${p0x.toFixed(2)} ${p0y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const currX = points[i].x * widthPx;
    const currY = points[i].y * heightPx;
    const nextX = points[i + 1].x * widthPx;
    const nextY = points[i + 1].y * heightPx;
    const midX = (currX + nextX) / 2;
    const midY = (currY + nextY) / 2;
    d += ` Q ${currX.toFixed(2)} ${currY.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }

  const last = points[points.length - 1];
  d += ` L ${(last.x * widthPx).toFixed(2)} ${(last.y * heightPx).toFixed(2)}`;
  return d;
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
