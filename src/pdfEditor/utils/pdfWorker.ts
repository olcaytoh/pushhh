// PDF.js kütüphanesini harici CDN kullanmadan derlemeye gömülü yerel worker ile başlatır
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerCode from 'pdfjs-dist/build/pdf.worker.min.js?raw';

let initialized = false;
let workerBlobUrl: string | null = null;

/**
 * PDF.js worker'ını bellekteki Blob URL üzerinden tek seferlik yapılandırır.
 * İnternet bağlantısı olmadan ve tek HTML dosyası (file://) modunda da sorunsuz çalışır.
 */
export function ensurePdfWorkerConfigured(): typeof pdfjsLib {
  if (!initialized) {
    const blob = new Blob([pdfWorkerCode], { type: 'application/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerBlobUrl;
    initialized = true;
  }
  return pdfjsLib;
}
