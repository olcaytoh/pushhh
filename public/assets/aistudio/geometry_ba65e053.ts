// Çizim yumuşatma, silgi çarpışma testi (hit-test) ve koordinat dönüşüm yardımcıları
import type { StrokeAnnotation, StrokePoint, TextAnnotation } from '../types/pdf';

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
  // X eksenini en-boy oranıyla ölçekleyerek yatay/dikey hassasiyeti eşitleriz
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
 * Silgi aracının bir çizim çizgisine temas edip etmediğini kontrol eder
 */
export function isPointNearStroke(
  point: StrokePoint,
  stroke: StrokeAnnotation,
  pageWidthPx: number,
  pageHeightPx: number,
  eraserRadiusPx = 14,
): boolean {
  if (stroke.points.length === 0 || pageWidthPx <= 0 || pageHeightPx <= 0) {
    return false;
  }

  const aspectRatio = pageWidthPx / pageHeightPx;
  const strokeHalfWidthPx = (stroke.widthRatio * pageWidthPx) / 2;
  const hitThresholdNorm = (eraserRadiusPx + strokeHalfWidthPx) / pageHeightPx;

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
 * Silgi veya seçim için bir noktanın metin kutusu alanı içinde olup olmadığını tahmin eder
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

  // Yaklaşık genişlik ve yükseklik tahmini + konforlu dokunma payı
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
 * Kalem noktalarını aşırı yoğunluktan arındırır (performans ve pürüzsüzlük için)
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
 * Normalize noktaları kuadratik Bezier eğrileriyle yumuşak SVG path dizgisine çevirir
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
    // Tek dokunuş için yuvarlak nokta (sıfır uzunluklu çizgi + round linecap)
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
 * koordinatı pdf-lib sayfa koordinatına (point) dönüştürür.
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
