// pdf-lib ve @pdf-lib/fontkit ile notları PDF'e işleme, düzenlenebilir ek gömme ve geri okuma modülü
import fontkit from '@pdf-lib/fontkit';
import { LineCapStyle, PDFDocument, type PDFFont, degrees, rgb } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import {
  type AnnotationsMap,
  EMBEDDED_ATTACHMENT_DESCRIPTION,
  EMBEDDED_NOTES_FILENAME,
  EMBEDDED_NOTES_VERSION,
  EMBEDDED_ORIGINAL_FILENAME,
  type EmbeddedNotesPayload,
  type FontAssets,
  isStampShapeType,
  type PageAnnotations,
  type ShapeAnnotation,
  type ShapeFillMode,
  type ShapeType,
  type StrokeAnnotation,
  type TextAnnotation,
} from '../types/pdf';
import {
  getArrowHeadNormPoints,
  getClosedShapeNormPolygon,
  getDisplayedPdfSize,
  getStampGeometry,
  resolveShapeFill,
  sampleSmoothStrokeForPdf,
  screenNormToPdfPoint,
} from './geometry';

export interface ExportPdfOptions {
  /** true: orijinal.pdf + duzenlenebilir-notlar.json eklerini gömer; false: düz paylaşım PDF'i üretir */
  includeEditableAttachments: boolean;
}

export interface ExportPdfResult {
  bytes: Uint8Array;
  usedCanvasFallback: boolean;
}

export interface ExtractedEditableData {
  status: 'none' | 'loaded' | 'corrupt';
  cleanOriginalBytes?: Uint8Array;
  annotations?: AnnotationsMap;
  warningMessage?: string;
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return rgb(r / 255, g / 255, b / 255);
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Font dosyası bulunamadığında devreye giren 4x şeffaf PNG yedek yöntemi (ğ, ü, ş, ı, İ, ö, ç tam destekli)
 */
function renderTextToHighResPng(
  item: TextAnnotation,
  dispHeightPt: number,
): { pngBytes: Uint8Array; widthPt: number; heightPt: number; padLeftPt: number; padTopPt: number } | null {
  const lines = item.text.split(/\r?\n/);
  if (lines.every((l) => l.length === 0)) return null;

  const fontSizePt = item.fontSizeRatio * dispHeightPt;
  const lineHeightPt = fontSizePt * 1.25;
  const scale = 4;

  const fontSpec = `${item.bold ? '700' : '400'} ${fontSizePt * scale}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) return null;

  measureCtx.font = fontSpec;
  let maxLineWidthPx = 10;
  for (const line of lines) {
    const w = measureCtx.measureText(line || ' ').width;
    if (w > maxLineWidthPx) maxLineWidthPx = w;
  }

  const padLeftPt = Math.max(2, fontSizePt * 0.12);
  const padTopPt = Math.max(2, fontSizePt * 0.12);
  const padRightPt = Math.max(4, fontSizePt * 0.25);
  const padBottomPt = Math.max(4, fontSizePt * 0.28);

  const contentWidthPt = maxLineWidthPx / scale;
  const contentHeightPt = lines.length * lineHeightPt;

  const widthPt = contentWidthPt + padLeftPt + padRightPt;
  const heightPt = contentHeightPt + padTopPt + padBottomPt;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(widthPt * scale));
  canvas.height = Math.max(1, Math.ceil(heightPt * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSpec;
  ctx.fillStyle = item.color;
  ctx.textBaseline = 'top';

  const topLeadingPt = Math.max(0, (lineHeightPt - fontSizePt * 1.05) / 2);

  lines.forEach((line, idx) => {
    const drawX = padLeftPt * scale;
    const drawY = (padTopPt + idx * lineHeightPt + topLeadingPt) * scale;
    ctx.fillText(line, drawX, drawY);
  });

  const pngBytes = dataUrlToUint8Array(canvas.toDataURL('image/png'));
  return { pngBytes, widthPt, heightPt, padLeftPt, padTopPt };
}

function buildEmbeddedNotesPayload(annotations: AnnotationsMap, pageCount: number): EmbeddedNotesPayload {
  const sayfalar: Record<string, PageAnnotations> = {};
  for (let p = 1; p <= pageCount; p++) {
    const data = annotations[p];
    const shapes = data?.shapes || [];
    if (data && (data.texts.length > 0 || data.strokes.length > 0 || shapes.length > 0)) {
      sayfalar[String(p)] = {
        texts: data.texts,
        strokes: data.strokes,
        shapes,
      };
    }
  }
  return {
    surum: EMBEDDED_NOTES_VERSION,
    sayfaSayisi: pageCount,
    sayfalar,
  };
}

export async function exportAnnotatedPdf(
  cleanOriginalPdfBytes: Uint8Array,
  annotations: AnnotationsMap,
  fontAssets: FontAssets,
  options: ExportPdfOptions,
): Promise<ExportPdfResult> {
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(cleanOriginalPdfBytes, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('encrypt')) {
      throw new Error('Şifreli PDF dosyası kaydedilemedi.');
    }
    throw new Error('PDF dosyası kaydetme için okunamadı.');
  }

  pdfDoc.registerFontkit(fontkit);

  let embeddedRegular: PDFFont | null = null;
  let embeddedBold: PDFFont | null = null;

  if (fontAssets.regularBytes) {
    try {
      embeddedRegular = await pdfDoc.embedFont(fontAssets.regularBytes, { subset: true });
    } catch {
      embeddedRegular = null;
    }
  }

  if (fontAssets.boldBytes) {
    try {
      embeddedBold = await pdfDoc.embedFont(fontAssets.boldBytes, { subset: true });
    } catch {
      embeddedBold = null;
    }
  }

  let usedCanvasFallback = false;
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const pageNumber = i + 1;
    const pageData = annotations[pageNumber];
    if (!pageData) continue;

    const pdfPage = pages[i];
    const cropBox = pdfPage.getCropBox();
    const rotDeg = ((pdfPage.getRotation().angle % 360) + 360) % 360;
    const { dispWidth, dispHeight } = getDisplayedPdfSize(cropBox, rotDeg);

    // 1. Serbest çizimleri (yuvarlak uçlu polyline) işle
    for (const stroke of pageData.strokes) {
      if (stroke.points.length === 0) continue;
      const strokeColor = hexToRgb(stroke.color);
      const thickness = Math.max(0.5, stroke.widthRatio * dispWidth);

      if (stroke.points.length === 1) {
        const p = screenNormToPdfPoint(stroke.points[0].x, stroke.points[0].y, cropBox, rotDeg);
        pdfPage.drawLine({
          start: p,
          end: { x: p.x + 0.01, y: p.y },
          thickness,
          color: strokeColor,
          lineCap: LineCapStyle.Round,
        });
        continue;
      }

      const smoothPts = sampleSmoothStrokeForPdf(stroke.points, 4);
      for (let j = 0; j < smoothPts.length - 1; j++) {
        const start = screenNormToPdfPoint(smoothPts[j].x, smoothPts[j].y, cropBox, rotDeg);
        const end = screenNormToPdfPoint(smoothPts[j + 1].x, smoothPts[j + 1].y, cropBox, rotDeg);
        pdfPage.drawLine({
          start,
          end,
          thickness,
          color: strokeColor,
          lineCap: LineCapStyle.Round,
        });
      }
    }

    // 1b. Geometrik şekilleri ve sembolleri işle (vektörel)
    for (const shape of pageData.shapes || []) {
      const shapeColor = hexToRgb(shape.color);
      const thickness = Math.max(0.75, shape.widthRatio * dispWidth);

      if (isStampShapeType(shape.shapeType)) {
        const geom = getStampGeometry(shape);
        const boxMinPt = Math.min(
          Math.abs(shape.x2 - shape.x1) * dispWidth,
          Math.abs(shape.y2 - shape.y1) * dispHeight,
        );
        const stampStrokePt = Math.max(thickness * 1.35, boxMinPt * 0.14);

        for (const linePts of geom.polylines) {
          for (let k = 0; k < linePts.length - 1; k++) {
            const start = screenNormToPdfPoint(linePts[k].x, linePts[k].y, cropBox, rotDeg);
            const end = screenNormToPdfPoint(linePts[k + 1].x, linePts[k + 1].y, cropBox, rotDeg);
            pdfPage.drawLine({
              start,
              end,
              thickness: stampStrokePt,
              color: shapeColor,
              lineCap: LineCapStyle.Round,
            });
          }
        }

        if (geom.polygon && geom.polygon.length >= 3) {
          const pdfPts = geom.polygon.map((pt) => screenNormToPdfPoint(pt.x, pt.y, cropBox, rotDeg));
          const svgPath =
            pdfPts
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`)
              .join(' ') + ' Z';
          pdfPage.drawSvgPath(svgPath, {
            x: 0,
            y: 0,
            color: geom.fillOpacity > 0 ? shapeColor : undefined,
            opacity: geom.fillOpacity > 0 ? geom.fillOpacity : undefined,
            borderColor: shapeColor,
            borderOpacity: 1,
            borderWidth: Math.max(1, boxMinPt * 0.065),
            borderLineCap: LineCapStyle.Round,
          });
        }

        for (const dotPoly of geom.dotPolygons) {
          if (dotPoly.length < 3) continue;
          const pdfPts = dotPoly.map((pt) => screenNormToPdfPoint(pt.x, pt.y, cropBox, rotDeg));
          const svgPath =
            pdfPts
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`)
              .join(' ') + ' Z';
          pdfPage.drawSvgPath(svgPath, {
            x: 0,
            y: 0,
            color: shapeColor,
            opacity: 1,
          });
        }
        continue;
      }

      if (shape.shapeType === 'line' || shape.shapeType === 'arrow') {
        const start = screenNormToPdfPoint(shape.x1, shape.y1, cropBox, rotDeg);
        const end = screenNormToPdfPoint(shape.x2, shape.y2, cropBox, rotDeg);
        pdfPage.drawLine({
          start,
          end,
          thickness,
          color: shapeColor,
          lineCap: LineCapStyle.Round,
        });

        if (shape.shapeType === 'arrow') {
          const wings = getArrowHeadNormPoints(shape, dispWidth, dispHeight);
          if (wings) {
            const leftPdf = screenNormToPdfPoint(wings[0].x, wings[0].y, cropBox, rotDeg);
            const rightPdf = screenNormToPdfPoint(wings[1].x, wings[1].y, cropBox, rotDeg);
            pdfPage.drawLine({
              start: end,
              end: leftPdf,
              thickness,
              color: shapeColor,
              lineCap: LineCapStyle.Round,
            });
            pdfPage.drawLine({
              start: end,
              end: rightPdf,
              thickness,
              color: shapeColor,
              lineCap: LineCapStyle.Round,
            });
          }
        }
        continue;
      }

      const normPoly = getClosedShapeNormPolygon(shape, 64);
      if (normPoly.length >= 3) {
        const pdfPts = normPoly.map((pt) => screenNormToPdfPoint(pt.x, pt.y, cropBox, rotDeg));
        const svgPath =
          pdfPts
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`)
            .join(' ') + ' Z';
        const resolvedFill = resolveShapeFill(shape);
        const fillRgb = resolvedFill.mode !== 'none' ? hexToRgb(resolvedFill.fillColor) : undefined;

        pdfPage.drawSvgPath(svgPath, {
          x: 0,
          y: 0,
          color: fillRgb,
          opacity: resolvedFill.mode !== 'none' ? resolvedFill.opacity : undefined,
          borderColor: shapeColor,
          borderOpacity: 1,
          borderWidth: thickness,
          borderLineCap: LineCapStyle.Round,
        });
      }
    }

    // 2. Metinleri işle (vektörel font varsa fontkit ile, yoksa 4x PNG yedek yöntemiyle)
    for (const textItem of pageData.texts) {
      if (!textItem.text.trim()) continue;

      const selectedFont = textItem.bold ? embeddedBold : embeddedRegular;
      const fontSizePt = textItem.fontSizeRatio * dispHeight;
      const lineHeightPt = fontSizePt * 1.25;
      const lines = textItem.text.split(/\r?\n/);

      let wroteWithVectorFont = false;

      if (selectedFont) {
        try {
          const ascenderPt = selectedFont.heightAtSize(fontSizePt, { descender: false });
          const fullGlyphHeightPt = selectedFont.heightAtSize(fontSizePt, { descender: true });
          const topLeadingPt = Math.max(0, (lineHeightPt - fullGlyphHeightPt) / 2);
          const baselineOffsetPt = topLeadingPt + ascenderPt;
          const textColor = hexToRgb(textItem.color);

          for (const line of lines) {
            if (line.length > 0) {
              selectedFont.encodeText(line);
            }
          }

          lines.forEach((line, lineIdx) => {
            if (!line) return;
            const baselineNy =
              textItem.y + (baselineOffsetPt + lineIdx * lineHeightPt) / dispHeight;
            const pdfPos = screenNormToPdfPoint(textItem.x, baselineNy, cropBox, rotDeg);

            pdfPage.drawText(line, {
              x: pdfPos.x,
              y: pdfPos.y,
              size: fontSizePt,
              font: selectedFont,
              color: textColor,
              rotate: degrees(rotDeg),
            });
          });

          wroteWithVectorFont = true;
        } catch {
          wroteWithVectorFont = false;
        }
      }

      if (!wroteWithVectorFont) {
        const rendered = renderTextToHighResPng(textItem, dispHeight);
        if (rendered) {
          usedCanvasFallback = true;
          const pngImage = await pdfDoc.embedPng(rendered.pngBytes);

          const imgLeftNx = textItem.x - rendered.padLeftPt / dispWidth;
          const imgBottomNy =
            textItem.y - rendered.padTopPt / dispHeight + rendered.heightPt / dispHeight;
          const pdfBottomLeft = screenNormToPdfPoint(imgLeftNx, imgBottomNy, cropBox, rotDeg);

          pdfPage.drawImage(pngImage, {
            x: pdfBottomLeft.x,
            y: pdfBottomLeft.y,
            width: rendered.widthPt,
            height: rendered.heightPt,
            rotate: degrees(rotDeg),
          });
        }
      }
    }
  }

  // 3. Düzenlenebilir kayıt modunda tek bir orijinal.pdf ve tek bir duzenlenebilir-notlar.json göm
  if (options.includeEditableAttachments) {
    const payload = buildEmbeddedNotesPayload(annotations, pages.length);
    const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
    const now = new Date();

    await pdfDoc.attach(cleanOriginalPdfBytes, EMBEDDED_ORIGINAL_FILENAME, {
      mimeType: 'application/pdf',
      description: EMBEDDED_ATTACHMENT_DESCRIPTION,
      creationDate: now,
      modificationDate: now,
    });

    await pdfDoc.attach(jsonBytes, EMBEDDED_NOTES_FILENAME, {
      mimeType: 'application/json',
      description: EMBEDDED_ATTACHMENT_DESCRIPTION,
      creationDate: now,
      modificationDate: now,
    });
  }

  const savedBytes = await pdfDoc.save();
  return { bytes: savedBytes, usedCanvasFallback };
}

function sanitizeTextList(raw: unknown): TextAnnotation[] {
  if (!Array.isArray(raw)) return [];
  const valid: TextAnnotation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const t = item as Record<string, unknown>;
    if (
      typeof t.id === 'string' &&
      typeof t.x === 'number' &&
      Number.isFinite(t.x) &&
      typeof t.y === 'number' &&
      Number.isFinite(t.y) &&
      typeof t.text === 'string' &&
      typeof t.fontSizeRatio === 'number' &&
      Number.isFinite(t.fontSizeRatio) &&
      typeof t.color === 'string'
    ) {
      valid.push({
        id: t.id,
        x: Math.max(0, Math.min(1, t.x)),
        y: Math.max(0, Math.min(1, t.y)),
        text: t.text,
        fontSizeRatio: Math.max(0.005, Math.min(0.2, t.fontSizeRatio)),
        color: t.color,
        bold: Boolean(t.bold),
      });
    }
  }
  return valid;
}

function sanitizeStrokeList(raw: unknown): StrokeAnnotation[] {
  if (!Array.isArray(raw)) return [];
  const valid: StrokeAnnotation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const s = item as Record<string, unknown>;
    if (
      typeof s.id === 'string' &&
      Array.isArray(s.points) &&
      typeof s.color === 'string' &&
      typeof s.widthRatio === 'number' &&
      Number.isFinite(s.widthRatio)
    ) {
      const points = s.points
        .filter(
          (pt): pt is { x: number; y: number } =>
            Boolean(pt) &&
            typeof pt === 'object' &&
            typeof (pt as { x: unknown }).x === 'number' &&
            Number.isFinite((pt as { x: number }).x) &&
            typeof (pt as { y: unknown }).y === 'number' &&
            Number.isFinite((pt as { y: number }).y),
        )
        .map((pt) => ({
          x: Math.max(0, Math.min(1, pt.x)),
          y: Math.max(0, Math.min(1, pt.y)),
        }));

      if (points.length > 0) {
        valid.push({
          id: s.id,
          points,
          color: s.color,
          widthRatio: Math.max(0.0005, Math.min(0.1, s.widthRatio)),
        });
      }
    }
  }
  return valid;
}

const VALID_SHAPE_TYPES = new Set<ShapeType>([
  'line',
  'arrow',
  'square',
  'rectangle',
  'circle',
  'ellipse',
  'triangle',
  'right-triangle',
  'check',
  'cross',
  'star',
  'question',
  'exclamation',
  'heart',
]);

const VALID_FILL_MODES = new Set<ShapeFillMode>(['none', 'translucent', 'solid']);

function sanitizeShapeList(raw: unknown): ShapeAnnotation[] {
  if (!Array.isArray(raw)) return [];
  const valid: ShapeAnnotation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const sh = item as Record<string, unknown>;
    if (
      typeof sh.id === 'string' &&
      typeof sh.shapeType === 'string' &&
      VALID_SHAPE_TYPES.has(sh.shapeType as ShapeType) &&
      typeof sh.x1 === 'number' &&
      Number.isFinite(sh.x1) &&
      typeof sh.y1 === 'number' &&
      Number.isFinite(sh.y1) &&
      typeof sh.x2 === 'number' &&
      Number.isFinite(sh.x2) &&
      typeof sh.y2 === 'number' &&
      Number.isFinite(sh.y2) &&
      typeof sh.color === 'string' &&
      typeof sh.widthRatio === 'number' &&
      Number.isFinite(sh.widthRatio)
    ) {
      const fillMode: ShapeFillMode | undefined =
        typeof sh.fillMode === 'string' && VALID_FILL_MODES.has(sh.fillMode as ShapeFillMode)
          ? (sh.fillMode as ShapeFillMode)
          : undefined;
      const fillColor = typeof sh.fillColor === 'string' ? sh.fillColor : undefined;

      valid.push({
        id: sh.id,
        shapeType: sh.shapeType as ShapeType,
        x1: Math.max(0, Math.min(1, sh.x1)),
        y1: Math.max(0, Math.min(1, sh.y1)),
        x2: Math.max(0, Math.min(1, sh.x2)),
        y2: Math.max(0, Math.min(1, sh.y2)),
        color: sh.color,
        fillColor,
        fillMode,
        widthRatio: Math.max(0.0005, Math.min(0.1, sh.widthRatio)),
        filled: Boolean(sh.filled),
      });
    }
  }
  return valid;
}

export async function extractEditableAttachments(
  openedPdfDoc: PDFDocumentProxy,
): Promise<ExtractedEditableData> {
  try {
    const attachments = (await openedPdfDoc.getAttachments()) as Record<
      string,
      { filename?: string; content: Uint8Array }
    > | null;

    if (!attachments) {
      return { status: 'none' };
    }

    const entries = Object.entries(attachments);
    const findAttachment = (targetName: string): Uint8Array | null => {
      const lowerTarget = targetName.toLowerCase();
      for (const [key, val] of entries) {
        const keyLower = key.toLowerCase();
        const fileLower = (val?.filename || '').toLowerCase();
        if (
          (keyLower === lowerTarget || fileLower === lowerTarget) &&
          val?.content instanceof Uint8Array
        ) {
          return val.content;
        }
      }
      return null;
    };

    const originalBytes = findAttachment(EMBEDDED_ORIGINAL_FILENAME);
    const notesBytes = findAttachment(EMBEDDED_NOTES_FILENAME);

    if (!originalBytes && !notesBytes) {
      return { status: 'none' };
    }

    if (!originalBytes || !notesBytes) {
      return {
        status: 'corrupt',
        warningMessage:
          'Bu dosyada eksik not ekleri bulundu. Dosya notlar yüklenmeden açıldı; üzerine yazmadan önce kontrol edin.',
      };
    }

    let parsed: unknown;
    try {
      const jsonText = new TextDecoder('utf-8').decode(notesBytes);
      parsed = JSON.parse(jsonText);
    } catch {
      return {
        status: 'corrupt',
        warningMessage:
          'Gömülü not verisi (JSON) bozuk olduğu için dosya notlar olmadan açıldı. Kaydetmeden önce yedek almanız önerilir.',
      };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        status: 'corrupt',
        warningMessage: 'Gömülü not verisi okunamadı. Dosya notlar olmadan açıldı.',
      };
    }

    const payload = parsed as Partial<EmbeddedNotesPayload>;
    if (payload.surum !== EMBEDDED_NOTES_VERSION) {
      return {
        status: 'corrupt',
        warningMessage: `Gömülü not sürümü (${String(payload.surum)}) desteklenmiyor. Dosya notlar olmadan açıldı.`,
      };
    }

    if (
      typeof payload.sayfaSayisi !== 'number' ||
      !Number.isInteger(payload.sayfaSayisi) ||
      payload.sayfaSayisi < 1 ||
      !payload.sayfalar ||
      typeof payload.sayfalar !== 'object'
    ) {
      return {
        status: 'corrupt',
        warningMessage: 'Gömülü not yapısı geçersiz olduğu için dosya notlar olmadan açıldı.',
      };
    }

    const cleanCopy = new Uint8Array(originalBytes.byteLength);
    cleanCopy.set(originalBytes);

    let originalPdfPageCount = 0;
    try {
      const checkDoc = await PDFDocument.load(cleanCopy, { ignoreEncryption: false });
      originalPdfPageCount = checkDoc.getPageCount();
    } catch {
      return {
        status: 'corrupt',
        warningMessage: 'Gömülü orijinal PDF eki açılamadı. Dosya notlar olmadan açıldı.',
      };
    }

    if (originalPdfPageCount !== payload.sayfaSayisi) {
      return {
        status: 'corrupt',
        warningMessage:
          'Gömülü notların sayfa sayısı orijinal PDF ile uyuşmuyor. Dosya notlar olmadan açıldı.',
      };
    }

    const restored: AnnotationsMap = {};
    for (const [pageKey, pageVal] of Object.entries(payload.sayfalar)) {
      const pageNum = Number(pageKey);
      if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > originalPdfPageCount) continue;
      if (!pageVal || typeof pageVal !== 'object') continue;
      const pv = pageVal as { texts?: unknown; strokes?: unknown; shapes?: unknown };
      const texts = sanitizeTextList(pv.texts);
      const strokes = sanitizeStrokeList(pv.strokes);
      const shapes = sanitizeShapeList(pv.shapes);
      if (texts.length > 0 || strokes.length > 0 || shapes.length > 0) {
        restored[pageNum] = { texts, strokes, shapes };
      }
    }

    return {
      status: 'loaded',
      cleanOriginalBytes: cleanCopy,
      annotations: restored,
    };
  } catch {
    return { status: 'none' };
  }
}
