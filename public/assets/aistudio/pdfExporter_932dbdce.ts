// pdf-lib ve @pdf-lib/fontkit kullanarak düzenlenmiş PDF'i dışa aktarma modülü
import fontkit from '@pdf-lib/fontkit';
import { LineCapStyle, PDFDocument, type PDFFont, degrees, rgb } from 'pdf-lib';
import type { AnnotationsMap, FontAssets, TextAnnotation } from '../types/pdf';
import { getDisplayedPdfSize, screenNormToPdfPoint } from './geometry';

export interface ExportPdfResult {
  bytes: Uint8Array;
  usedCanvasFallback: boolean;
}

/** Hex renk kodunu pdf-lib RGB rengine çevirir */
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return rgb(r / 255, g / 255, b / 255);
}

/** Data URL'den PNG baytlarını çözer */
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
 * Font dosyası bulunamadığında devreye giren YEDEK YÖNTEM:
 * Metin bloğunu sistem fontuyla 4x yüksek çözünürlüklü şeffaf bir canvas'a çizer
 * ve PNG baytları + PDF point cinsinden gerçek boyut/konum bilgisi döndürür.
 */
function renderTextToHighResPng(
  item: TextAnnotation,
  dispHeightPt: number,
): { pngBytes: Uint8Array; widthPt: number; heightPt: number; padLeftPt: number; padTopPt: number } | null {
  const lines = item.text.split(/\r?\n/);
  if (lines.every((l) => l.length === 0)) return null;

  const fontSizePt = item.fontSizeRatio * dispHeightPt;
  const lineHeightPt = fontSizePt * 1.25;
  const scale = 4; // 4x çözünürlük sayesinde PDF yakınlaştırmasında keskin kalır

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

  // Türkçe uzantılı harflerin (ğ, Ş, İ, ç, y, g) kesilmemesi için güvenli şeffaf kenar boşluğu
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

  // Satır yüksekliği içinde dikey ortalama (CSS line-height: 1.25 ile uyumlu)
  const topLeadingPt = Math.max(0, (lineHeightPt - fontSizePt * 1.05) / 2);

  lines.forEach((line, idx) => {
    const drawX = padLeftPt * scale;
    const drawY = (padTopPt + idx * lineHeightPt + topLeadingPt) * scale;
    ctx.fillText(line, drawX, drawY);
  });

  const pngBytes = dataUrlToUint8Array(canvas.toDataURL('image/png'));
  return { pngBytes, widthPt, heightPt, padLeftPt, padTopPt };
}

/**
 * Orijinal PDF'i yükler, tüm sayfalardaki metin ve çizim notlarını
 * /Rotate ve CropBox değerlerine göre PDF'e kalıcı olarak işler.
 */
export async function exportAnnotatedPdf(
  originalPdfBytes: Uint8Array,
  annotations: AnnotationsMap,
  fontAssets: FontAssets,
): Promise<ExportPdfResult> {
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('encrypt')) {
      throw new Error('Şifreli PDF dosyası dışa aktarılamadı.');
    }
    throw new Error('PDF dosyası dışa aktarma için okunamadı.');
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

    // 1. Önce serbest çizimleri (polyline) işle
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

      for (let j = 0; j < stroke.points.length - 1; j++) {
        const start = screenNormToPdfPoint(stroke.points[j].x, stroke.points[j].y, cropBox, rotDeg);
        const end = screenNormToPdfPoint(stroke.points[j + 1].x, stroke.points[j + 1].y, cropBox, rotDeg);
        pdfPage.drawLine({
          start,
          end,
          thickness,
          color: strokeColor,
          lineCap: LineCapStyle.Round,
        });
      }
    }

    // 2. Ardından metinleri işle (font varsa fontkit ile, yoksa 4x şeffaf PNG yedek yöntemiyle)
    for (const textItem of pageData.texts) {
      if (!textItem.text.trim()) continue;

      const selectedFont = textItem.bold ? embeddedBold : embeddedRegular;
      const fontSizePt = textItem.fontSizeRatio * dispHeight;
      const lineHeightPt = fontSizePt * 1.25;
      const lines = textItem.text.split(/\r?\n/);

      let wroteWithVectorFont = false;

      if (selectedFont) {
        try {
          // Font metrikleriyle satır kutusu içindeki gerçek baseline konumunu hesapla
          const ascenderPt = selectedFont.heightAtSize(fontSizePt, { descender: false });
          const fullGlyphHeightPt = selectedFont.heightAtSize(fontSizePt, { descender: true });
          const topLeadingPt = Math.max(0, (lineHeightPt - fullGlyphHeightPt) / 2);
          const baselineOffsetPt = topLeadingPt + ascenderPt;
          const textColor = hexToRgb(textItem.color);

          // Önce tüm satırların font tarafından desteklendiğini doğrula (kısmi çizimi önler)
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
          // Font bazı özel karakterleri içermiyorsa yedek canvas-PNG yöntemine düş
          wroteWithVectorFont = false;
        }
      }

      if (!wroteWithVectorFont) {
        const rendered = renderTextToHighResPng(textItem, dispHeight);
        if (rendered) {
          usedCanvasFallback = true;
          const pngImage = await pdfDoc.embedPng(rendered.pngBytes);

          // PNG görüntüsünün sol-alt köşesinin normalize koordinatı (kenar boşluğu telafili)
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

  const savedBytes = await pdfDoc.save();
  return { bytes: savedBytes, usedCanvasFallback };
}
