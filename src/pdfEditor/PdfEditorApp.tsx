// Çevrimdışı PDF Görüntüleyici, Yazı ve Serbest Çizim Editörü (sıfır harici istek, düzenlenebilir PDF kayıt)
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { BlankPageAddIcon, GridPageAddIcon, MergePdfIcon, PdfDocIcon } from './components/Icons';
import { LeftToolSidebar } from './components/LeftToolSidebar';
import { MergePdfModal, type MergeSourceEntry } from './components/MergePdfModal';
import { PdfPageItem } from './components/PdfPageItem';
import { OVERLAY_PAGE_NUMBER, ScratchpadOverlay } from './components/ScratchpadOverlay';
import { SettingsModal } from './components/SettingsModal';
import { ThumbnailSidebar } from './components/ThumbnailSidebar';
import { Toolbar } from './components/Toolbar';
import {
  type AnnotationsMap,
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  type FileSystemFileHandleLike,
  type FontAssets,
  type FontSizeKey,
  isStampShapeType,
  PEN_WIDTH_RATIOS,
  type PageAnnotations,
  type PageMeta,
  type PenWidthKey,
  type SelectedObject,
  type ShapeAnnotation,
  type ShapeFillMode,
  type ShapeType,
  STAMP_OPTIONS,
  STAMP_SIZE_RATIOS,
  type StampSizeKey,
  type StampType,
  type StrokeAnnotation,
  type StrokeSmoothingLevel,
  type TextAnnotation,
  type ToastNotice,
  type ToolMode,
} from './types/pdf';
import {
  buildSuggestedName,
  downloadPdfBytes,
  extractDropFileHandle,
  overwritePdfFileHandle,
  pickPdfWithFileSystemAccess,
  savePdfBytesAs,
} from './utils/fileSave';
import { loadDefaultLocalFonts, readFontFileBytes } from './utils/fontManager';
import {
  type InsertPageKind,
  exportAnnotatedPdf,
  extractEditableAttachments,
  insertCustomPageIntoPdf,
  mergePdfByteArrays,
} from './utils/pdfExporter';
import { ensurePdfWorkerConfigured } from './utils/pdfWorker';

const EMPTY_PAGE_ANNOTATIONS: PageAnnotations = { texts: [], strokes: [], shapes: [] };
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;
const MAX_UNDO_STACK = 60;

function clonePageAnnotations(entry: PageAnnotations): PageAnnotations {
  return {
    texts: entry.texts.map((t) => ({ ...t })),
    strokes: entry.strokes.map((s) => ({
      ...s,
      points: s.points.map((p) => ({ ...p })),
    })),
    shapes: (entry.shapes || []).map((sh) => ({ ...sh })),
  };
}

function cloneAnnotationsMap(map: AnnotationsMap): AnnotationsMap {
  const copy: AnnotationsMap = {};
  for (const key of Object.keys(map)) {
    const pageNum = Number(key);
    const entry = map[pageNum];
    if (!entry) continue;
    copy[pageNum] = clonePageAnnotations(entry);
  }
  return copy;
}

function clampZoom(val: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(val * 100) / 100));
}

/** Yeni sayfa eklendiğinde eklendiği konum ve sonrasındaki sayfaların not anahtarlarını +1 kaydırır */
function shiftAnnotationsAfterInsert(map: AnnotationsMap, insertedPageNumber: number): AnnotationsMap {
  const shifted: AnnotationsMap = {};
  for (const key of Object.keys(map)) {
    const pageNum = Number(key);
    const entry = map[pageNum];
    if (!entry) continue;
    const nextPageNum = pageNum >= insertedPageNumber ? pageNum + 1 : pageNum;
    shifted[nextPageNum] = {
      texts: entry.texts.map((t) => ({ ...t })),
      strokes: entry.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ ...p })),
      })),
      shapes: (entry.shapes || []).map((sh) => ({ ...sh })),
    };
  }
  return shifted;
}

const PDF_LAST_PAGES_STORAGE_KEY = 'pdfEditor_lastPages_v1';
const MAX_STORED_PDF_BOOKMARKS = 120;

interface StoredPageBookmark {
  page: number;
  updatedAt: number;
}

/**
 * Çevrimdışı, hızlı FNV-1a parmak izi: aynı PDF yeniden adlandırılsa bile içeriğinden tanınır.
 */
function computePdfFingerprint(bytes: Uint8Array, numPages: number): string {
  let hash = 0x811c9dc5;
  const len = bytes.length;
  const headEnd = Math.min(len, 16384);
  for (let i = 0; i < headEnd; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  const tailStart = Math.max(headEnd, len - 16384);
  for (let i = tailStart; i < len; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return `fp_${len}_${numPages}_${(hash >>> 0).toString(16)}`;
}

function buildNamePageKey(fileName: string, numPages: number): string {
  return `fn_${fileName.trim().toLowerCase()}::${numPages}`;
}

function readStoredBookmarks(): Record<string, StoredPageBookmark> {
  try {
    const raw = window.localStorage.getItem(PDF_LAST_PAGES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, StoredPageBookmark>;
  } catch {
    return {};
  }
}

function saveLastPageRecord(
  fingerprint: string | null,
  fileName: string,
  numPages: number,
  page: number,
): void {
  if (numPages < 1 || !Number.isInteger(page)) return;
  const clamped = Math.max(1, Math.min(numPages, page));
  try {
    const map = readStoredBookmarks();
    const now = Date.now();
    if (fingerprint) {
      map[fingerprint] = { page: clamped, updatedAt: now };
    }
    if (fileName.trim()) {
      map[buildNamePageKey(fileName, numPages)] = { page: clamped, updatedAt: now };
    }
    // En fazla 120 kayıt tut (eski kayıtları temizle)
    const keys = Object.keys(map);
    if (keys.length > MAX_STORED_PDF_BOOKMARKS) {
      keys
        .sort((a, b) => (map[a]?.updatedAt || 0) - (map[b]?.updatedAt || 0))
        .slice(0, keys.length - MAX_STORED_PDF_BOOKMARKS)
        .forEach((k) => {
          delete map[k];
        });
    }
    window.localStorage.setItem(PDF_LAST_PAGES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage kısıtlıysa sessizce yoksay
  }
}

function readLastPageRecord(
  fingerprint: string | null,
  fileName: string,
  numPages: number,
): number | null {
  if (numPages < 1) return null;
  const map = readStoredBookmarks();
  const candidates = [
    fingerprint ? map[fingerprint] : undefined,
    fileName.trim() ? map[buildNamePageKey(fileName, numPages)] : undefined,
  ];
  for (const item of candidates) {
    if (
      item &&
      typeof item.page === 'number' &&
      Number.isInteger(item.page) &&
      item.page >= 1 &&
      item.page <= numPages
    ) {
      return item.page;
    }
  }
  return null;
}

export interface PdfEditorAppProps {
  onExit?: () => void;
}

type ConfirmDialogState =
  | { kind: 'clear-page'; pageNumber: number }
  | { kind: 'clear-all' }
  | { kind: 'overwrite'; corruptWarning: boolean }
  | { kind: 'exit-unsaved' }
  | null;

export const PdfEditorApp: React.FC<PdfEditorAppProps> = ({ onExit }) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [docRevision, setDocRevision] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [pagesMeta, setPagesMeta] = useState<PageMeta[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isInsertingPage, setIsInsertingPage] = useState<boolean>(false);
  const [isMergingPdfs, setIsMergingPdfs] = useState<boolean>(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [isThumbnailSidebarOpen, setIsThumbnailSidebarOpen] = useState<boolean>(true);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);

  const cleanOriginalBytesRef = useRef<Uint8Array | null>(null);
  const rawOpenedBytesRef = useRef<Uint8Array | null>(null);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandleLike | null>(null);
  const overwriteConfirmedRef = useRef<boolean>(false);
  const hasCorruptAttachmentRef = useRef<boolean>(false);

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [renderZoom, setRenderZoom] = useState<number>(1);

  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [activeColor, setActiveColor] = useState<string>(COLOR_OPTIONS[0].value);
  const [fontSizeKey, setFontSizeKey] = useState<FontSizeKey>('medium');
  const [bold, setBold] = useState<boolean>(false);
  const [penWidthKey, setPenWidthKey] = useState<PenWidthKey>('medium');
  const [strokeSmoothing, setStrokeSmoothing] = useState<StrokeSmoothingLevel>('normal');
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rectangle');
  const [activeShapeFillMode, setActiveShapeFillMode] = useState<ShapeFillMode>('solid');
  const [activeShapeBorderColor, setActiveShapeBorderColor] = useState<string>('#2563eb');
  const [activeShapeFillColor, setActiveShapeFillColor] = useState<string>('#2563eb');
  const [syncShapeFillWithBorder, setSyncShapeFillWithBorder] = useState<boolean>(true);
  const [activeStampType, setActiveStampType] = useState<StampType>('check');
  const [stampSizeKey, setStampSizeKey] = useState<StampSizeKey>('medium');

  const [annotations, setAnnotations] = useState<AnnotationsMap>({});
  const [undoStack, setUndoStack] = useState<AnnotationsMap[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationsMap[]>([]);
  const [overlayBoardMode, setOverlayBoardMode] = useState<InsertPageKind | null>(null);
  const [overlayAnnotations, setOverlayAnnotations] = useState<PageAnnotations>(
    EMPTY_PAGE_ANNOTATIONS,
  );
  const [overlayUndoStack, setOverlayUndoStack] = useState<PageAnnotations[]>([]);
  const [overlayRedoStack, setOverlayRedoStack] = useState<PageAnnotations[]>([]);
  const overlayAnnotationsRef = useRef<PageAnnotations>(overlayAnnotations);
  overlayAnnotationsRef.current = overlayAnnotations;
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const canvasFallbackNotifiedRef = useRef<boolean>(false);

  const [fontAssets, setFontAssets] = useState<FontAssets>({
    regularBytes: null,
    boldBytes: null,
    regularLabel: 'Kontrol ediliyor...',
    boldLabel: 'Kontrol ediliyor...',
  });

  const appRootRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const toastTimerRef = useRef<number | null>(null);
  const annotationsRef = useRef<AnnotationsMap>(annotations);
  annotationsRef.current = annotations;
  const currentPageRef = useRef<number>(currentPage);
  currentPageRef.current = currentPage;
  const docFingerprintRef = useRef<string | null>(null);
  const pendingRestorePageRef = useRef<number | null>(null);
  const suppressScrollUntilRef = useRef<number>(0);
  const zoomAnchorRef = useRef<{
    pageNumber: number;
    relY: number;
    viewportOffsetY: number;
    relX: number;
    viewportOffsetX: number;
  } | null>(null);

  const showToast = useCallback((type: ToastNotice['type'], message: string, durationMs = 4500) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    let active = true;
    loadDefaultLocalFonts().then((assets) => {
      if (active) setFontAssets(assets);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch {
          // Yoksay
        }
        pdfDocRef.current = null;
      }
    };
  }, []);

  // Yakınlaştırma / uzaklaştırma sırasında mevcut sayfayı ve görünür okuma konumunu sabitle
  const applyZoom = useCallback((nextZoomOrUpdater: number | ((prev: number) => number)) => {
    const container = scrollContainerRef.current;
    const anchorPage = currentPageRef.current;
    const el = pageElementsRef.current.get(anchorPage);

    if (container && el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const visTop = Math.max(elRect.top, containerRect.top);
      const visBottom = Math.min(elRect.bottom, containerRect.bottom);
      const anchorScreenY =
        visBottom > visTop ? (visTop + visBottom) / 2 : containerRect.top + containerRect.height / 2;
      const viewportOffsetY = anchorScreenY - containerRect.top;
      const relY = Math.max(0, Math.min(1, (anchorScreenY - elRect.top) / Math.max(1, elRect.height)));

      const visLeft = Math.max(elRect.left, containerRect.left);
      const visRight = Math.min(elRect.right, containerRect.right);
      const anchorScreenX =
        visRight > visLeft ? (visLeft + visRight) / 2 : containerRect.left + containerRect.width / 2;
      const viewportOffsetX = anchorScreenX - containerRect.left;
      const relX = Math.max(0, Math.min(1, (anchorScreenX - elRect.left) / Math.max(1, elRect.width)));

      zoomAnchorRef.current = {
        pageNumber: anchorPage,
        relY,
        viewportOffsetY,
        relX,
        viewportOffsetX,
      };
    } else if (anchorPage >= 1) {
      zoomAnchorRef.current = {
        pageNumber: anchorPage,
        relY: 0.5,
        viewportOffsetY: (container?.clientHeight || 600) / 2,
        relX: 0.5,
        viewportOffsetX: (container?.clientWidth || 800) / 2,
      };
    }

    suppressScrollUntilRef.current = Date.now() + 500;
    setZoom((prev) =>
      clampZoom(
        typeof nextZoomOrUpdater === 'function' ? nextZoomOrUpdater(prev) : nextZoomOrUpdater,
      ),
    );
  }, []);

  // Zoom DOM boyutları güncellendikten hemen sonra (boyamadan önce) kaydırma konumunu aynı sayfaya kilitle
  useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current;
    if (!anchor) return;
    zoomAnchorRef.current = null;

    const container = scrollContainerRef.current;
    const el = pageElementsRef.current.get(anchor.pageNumber);
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const newElTop = container.scrollTop + (elRect.top - containerRect.top);
    const targetScrollTop = newElTop + anchor.relY * elRect.height - anchor.viewportOffsetY;
    container.scrollTop = Math.max(0, targetScrollTop);

    const newElLeft = container.scrollLeft + (elRect.left - containerRect.left);
    const targetScrollLeft = newElLeft + anchor.relX * elRect.width - anchor.viewportOffsetX;
    container.scrollLeft = Math.max(0, targetScrollLeft);

    setCurrentPage(anchor.pageNumber);
  }, [zoom]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRenderZoom(zoom);
    }, 170);
    return () => window.clearTimeout(timer);
  }, [zoom]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const syncFullscreen = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);

  const computeFitWidthZoom = useCallback((firstPageWidth: number): number => {
    const container = scrollContainerRef.current;
    const availWidth = container ? Math.max(320, container.clientWidth - 48) : window.innerWidth - 48;
    return clampZoom(availWidth / Math.max(1, firstPageWidth));
  }, []);

  const loadPdfFile = useCallback(
    async (file: File, handle: FileSystemFileHandleLike | null = null) => {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast('error', 'Lütfen geçerli bir PDF (.pdf) dosyası seçin.');
        return;
      }

      setIsLoadingPdf(true);

      let initialDoc: PDFDocumentProxy | null = null;
      let cleanDoc: PDFDocumentProxy | null = null;

      try {
        const buffer = await file.arrayBuffer();
        const headerText = new TextDecoder('ascii').decode(new Uint8Array(buffer.slice(0, 1024)));
        if (!headerText.includes('%PDF-')) {
          showToast('error', 'Seçilen dosya geçerli bir PDF belgesi değil.');
          return;
        }

        const rawBytes = new Uint8Array(buffer);
        const pdfjsLib = ensurePdfWorkerConfigured();

        const loadingTask = pdfjsLib.getDocument({
          data: rawBytes.slice(),
          useSystemFonts: true,
        });
        initialDoc = await loadingTask.promise;

        const extracted = await extractEditableAttachments(initialDoc);

        let activeDoc: PDFDocumentProxy = initialDoc;
        let cleanBytes: Uint8Array = rawBytes.slice();
        let initialAnnotations: AnnotationsMap = {};
        let openedBanner: { type: ToastNotice['type']; msg: string } | null = null;

        if (extracted.status === 'loaded' && extracted.cleanOriginalBytes) {
          const cleanTask = pdfjsLib.getDocument({
            data: extracted.cleanOriginalBytes.slice(),
            useSystemFonts: true,
          });
          cleanDoc = await cleanTask.promise;
          activeDoc = cleanDoc;
          cleanBytes = extracted.cleanOriginalBytes.slice();
          initialAnnotations = extracted.annotations || {};
          hasCorruptAttachmentRef.current = false;
          openedBanner = {
            type: 'success',
            msg: 'Bu dosyadaki notlar düzenlenebilir olarak yüklendi.',
          };

          try {
            await initialDoc.destroy();
          } catch {
            // Yoksay
          }
          initialDoc = null;
        } else if (extracted.status === 'corrupt') {
          hasCorruptAttachmentRef.current = true;
          openedBanner = {
            type: 'warning',
            msg:
              extracted.warningMessage ||
              'Gömülü not verisi bozuk veya uyumsuz. Dosya notlar olmadan açıldı.',
          };
        } else {
          hasCorruptAttachmentRef.current = false;
          openedBanner = {
            type: 'success',
            msg: `"${file.name}" açıldı (${activeDoc.numPages} sayfa).`,
          };
        }

        const metas: PageMeta[] = [];
        for (let i = 1; i <= activeDoc.numPages; i++) {
          const page = await activeDoc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          metas.push({
            pageNumber: i,
            baseWidth: vp.width,
            baseHeight: vp.height,
          });
        }

        if (pdfDocRef.current) {
          try {
            await pdfDocRef.current.destroy();
          } catch {
            // Yoksay
          }
        }

        const fingerprint = computePdfFingerprint(cleanBytes, activeDoc.numPages);
        const embeddedLastPage = extracted.status === 'loaded' ? extracted.lastPage : undefined;
        const localLastPage = readLastPageRecord(fingerprint, file.name, activeDoc.numPages);
        const rawTargetPage = embeddedLastPage ?? localLastPage ?? 1;
        const restoredPage = Math.max(1, Math.min(activeDoc.numPages, rawTargetPage));

        pdfDocRef.current = activeDoc;
        cleanOriginalBytesRef.current = cleanBytes;
        rawOpenedBytesRef.current = rawBytes.slice();
        docFingerprintRef.current = fingerprint;
        overwriteConfirmedRef.current = false;
        pendingRestorePageRef.current = restoredPage > 1 ? restoredPage : null;
        if (restoredPage > 1) {
          suppressScrollUntilRef.current = Date.now() + 900;
        }

        setPdfDoc(activeDoc);
        setDocRevision((r) => r + 1);
        setFileName(file.name);
        setFileHandle(handle);
        setPagesMeta(metas);
        setCurrentPage(restoredPage);
        setAnnotations(initialAnnotations);
        setUndoStack([]);
        setRedoStack([]);
        setSelectedObject(null);
        setHasUnsavedChanges(false);
        setToolMode('select');

        const initialZoom = metas.length > 0 ? computeFitWidthZoom(metas[0].baseWidth) : 1;
        setZoom(initialZoom);
        setRenderZoom(initialZoom);

        if (restoredPage <= 1 && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
        setOverlayBoardMode(null);

        if (openedBanner) {
          let finalMsg = openedBanner.msg;
          if (restoredPage > 1) {
            if (extracted.status === 'loaded') {
              finalMsg = `Notlar düzenlenebilir olarak yüklendi · Son kaldığınız ${restoredPage}. sayfada açıldı.`;
            } else if (extracted.status === 'none') {
              finalMsg = `"${file.name}" son kaldığınız ${restoredPage}. sayfada açıldı (${activeDoc.numPages} sayfa).`;
            }
          }
          showToast(openedBanner.type, finalMsg, openedBanner.type === 'warning' ? 6500 : 4800);
        }
      } catch (err) {
        if (initialDoc) {
          try {
            await initialDoc.destroy();
          } catch {
            // Yoksay
          }
        }
        if (cleanDoc) {
          try {
            await cleanDoc.destroy();
          } catch {
            // Yoksay
          }
        }

        const errName = err instanceof Error ? err.name : '';
        const errMsg = err instanceof Error ? err.message.toLowerCase() : '';
        if (errName === 'PasswordException' || errMsg.includes('password')) {
          showToast('error', 'Bu PDF dosyası şifre korumalı. Şifreli dosyalar açılamıyor.');
        } else if (errName === 'InvalidPDFException' || errMsg.includes('invalid pdf')) {
          showToast('error', 'PDF dosyası bozuk veya geçersiz biçimde.');
        } else {
          showToast('error', 'PDF dosyası okunamadı. Dosya bozuk veya desteklenmiyor olabilir.');
        }
      } finally {
        setIsLoadingPdf(false);
      }
    },
    [computeFitWidthZoom, showToast],
  );

  const handleOpenPdfClick = useCallback(async () => {
    const picker = await pickPdfWithFileSystemAccess();
    if (picker.status === 'opened' && picker.file) {
      await loadPdfFile(picker.file, picker.handle || null);
      return;
    }
    if (picker.status === 'cancelled') {
      return;
    }
    fileInputRef.current?.click();
  }, [loadPdfFile]);

  // Mevcut sayfadan hemen sonra (veya belge açık değilse yeni belge olarak) Boş / Kareli sayfa ekle
  const handleInsertPage = useCallback(
    async (kind: InsertPageKind) => {
      if (isInsertingPage || isExporting || isLoadingPdf) return;
      setIsInsertingPage(true);

      let nextDoc: PDFDocumentProxy | null = null;
      try {
        const hadExistingDoc = Boolean(pdfDocRef.current && cleanOriginalBytesRef.current);
        const insertAfter = hadExistingDoc ? currentPageRef.current : 0;

        const { bytes: updatedCleanBytes, insertedPageNumber } = await insertCustomPageIntoPdf(
          hadExistingDoc ? cleanOriginalBytesRef.current : null,
          kind,
          insertAfter,
        );

        const pdfjsLib = ensurePdfWorkerConfigured();
        const loadingTask = pdfjsLib.getDocument({
          data: updatedCleanBytes.slice(),
          useSystemFonts: true,
        });
        nextDoc = await loadingTask.promise;

        const metas: PageMeta[] = [];
        for (let i = 1; i <= nextDoc.numPages; i++) {
          const page = await nextDoc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          metas.push({
            pageNumber: i,
            baseWidth: vp.width,
            baseHeight: vp.height,
          });
        }

        const prevDoc = pdfDocRef.current;
        pdfDocRef.current = nextDoc;
        cleanOriginalBytesRef.current = updatedCleanBytes;
        if (!hadExistingDoc) {
          rawOpenedBytesRef.current = updatedCleanBytes.slice();
          docFingerprintRef.current = computePdfFingerprint(updatedCleanBytes, nextDoc.numPages);
          setFileName(kind === 'grid' ? 'kareli-defter.pdf' : 'bos-defter.pdf');
          setFileHandle(null);
          overwriteConfirmedRef.current = false;
          hasCorruptAttachmentRef.current = false;
        }

        if (prevDoc) {
          try {
            await prevDoc.destroy();
          } catch {
            // Yoksay
          }
        }

        pendingRestorePageRef.current = insertedPageNumber;
        suppressScrollUntilRef.current = Date.now() + 900;

        setPdfDoc(nextDoc);
        setDocRevision((r) => r + 1);
        setPagesMeta(metas);
        setCurrentPage(insertedPageNumber);
        setSelectedObject(null);
        setHasUnsavedChanges(true);

        if (hadExistingDoc) {
          setAnnotations((prev) => shiftAnnotationsAfterInsert(prev, insertedPageNumber));
          setUndoStack((stack) =>
            stack.map((snap) => shiftAnnotationsAfterInsert(snap, insertedPageNumber)),
          );
          setRedoStack((stack) =>
            stack.map((snap) => shiftAnnotationsAfterInsert(snap, insertedPageNumber)),
          );
        } else {
          setAnnotations({});
          setUndoStack([]);
          setRedoStack([]);
          setToolMode('pen');
          const initialZoom = metas.length > 0 ? computeFitWidthZoom(metas[0].baseWidth) : 1;
          setZoom(initialZoom);
          setRenderZoom(initialZoom);
        }

        const label = kind === 'grid' ? 'kareli sayfa' : 'boş sayfa';
        showToast(
          'success',
          hadExistingDoc
            ? `${insertedPageNumber}. sayfa olarak yeni ${label} eklendi.`
            : `Yeni ${label} oluşturuldu. Çizmeye başlayabilirsiniz.`,
        );
      } catch {
        if (nextDoc && nextDoc !== pdfDocRef.current) {
          try {
            await nextDoc.destroy();
          } catch {
            // Yoksay
          }
        }
        showToast('error', 'Yeni sayfa eklenirken bir hata oluştu.');
      } finally {
        setIsInsertingPage(false);
      }
    },
    [computeFitWidthZoom, isExporting, isInsertingPage, isLoadingPdf, showToast],
  );

  // Birden fazla PDF dosyasını seçilen sıraya göre uç uca birleştirir (düzenlenebilir notları korur)
  const handleConfirmMerge = useCallback(
    async (entries: MergeSourceEntry[]) => {
      if (isMergingPdfs || isExporting || isInsertingPage || isLoadingPdf || entries.length === 0) {
        return;
      }
      setIsMergingPdfs(true);

      let nextDoc: PDFDocumentProxy | null = null;
      try {
        const hadExistingDoc = Boolean(pdfDocRef.current && cleanOriginalBytesRef.current);
        const pdfjsLib = ensurePdfWorkerConfigured();

        const sourceByteList: Uint8Array[] = [];
        const mergedAnnotations: AnnotationsMap = {};
        let pageOffset = 0;
        let includedCurrentDoc = false;
        let currentDocFirstPageCount = 0;

        for (let idx = 0; idx < entries.length; idx++) {
          const entry = entries[idx];

          if (entry.isCurrentDoc && cleanOriginalBytesRef.current) {
            sourceByteList.push(cleanOriginalBytesRef.current);
            includedCurrentDoc = true;

            const currentAnns = annotationsRef.current;
            for (const key of Object.keys(currentAnns)) {
              const pNum = Number(key);
              const pageEntry = currentAnns[pNum];
              if (pageEntry) {
                mergedAnnotations[pNum + pageOffset] = clonePageAnnotations(pageEntry);
              }
            }

            const entryPageCount = pdfDocRef.current?.numPages || entry.pageCount;
            if (idx === 0) {
              currentDocFirstPageCount = entryPageCount;
            }
            pageOffset += entryPageCount;
            continue;
          }

          if (!entry.bytes) continue;

          let tempDoc: PDFDocumentProxy | null = null;
          let resolvedBytes: Uint8Array = entry.bytes;
          let entryPageCount = entry.pageCount;

          try {
            const tempTask = pdfjsLib.getDocument({
              data: entry.bytes.slice(),
              useSystemFonts: true,
            });
            tempDoc = await tempTask.promise;
            entryPageCount = tempDoc.numPages;

            const extracted = await extractEditableAttachments(tempDoc);
            if (extracted.status === 'loaded' && extracted.cleanOriginalBytes) {
              resolvedBytes = extracted.cleanOriginalBytes;
              if (extracted.annotations) {
                for (const key of Object.keys(extracted.annotations)) {
                  const pNum = Number(key);
                  const pageEntry = extracted.annotations[pNum];
                  if (pageEntry) {
                    mergedAnnotations[pNum + pageOffset] = clonePageAnnotations(pageEntry);
                  }
                }
              }
            }
          } finally {
            if (tempDoc) {
              try {
                await tempDoc.destroy();
              } catch {
                // Yoksay
              }
            }
          }

          sourceByteList.push(resolvedBytes);
          pageOffset += entryPageCount;
        }

        if (sourceByteList.length === 0) {
          showToast('error', 'Birleştirilecek geçerli bir PDF dosyası bulunamadı.');
          return;
        }

        const { bytes: mergedBytes, totalPages } = await mergePdfByteArrays(sourceByteList);

        const loadingTask = pdfjsLib.getDocument({
          data: mergedBytes.slice(),
          useSystemFonts: true,
        });
        nextDoc = await loadingTask.promise;

        const metas: PageMeta[] = [];
        for (let i = 1; i <= nextDoc.numPages; i++) {
          const page = await nextDoc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          metas.push({
            pageNumber: i,
            baseWidth: vp.width,
            baseHeight: vp.height,
          });
        }

        const prevDoc = pdfDocRef.current;
        pdfDocRef.current = nextDoc;
        cleanOriginalBytesRef.current = mergedBytes;
        rawOpenedBytesRef.current = mergedBytes.slice();
        docFingerprintRef.current = computePdfFingerprint(mergedBytes, nextDoc.numPages);
        overwriteConfirmedRef.current = false;
        hasCorruptAttachmentRef.current = false;

        if (prevDoc) {
          try {
            await prevDoc.destroy();
          } catch {
            // Yoksay
          }
        }

        const targetPage =
          includedCurrentDoc &&
          currentDocFirstPageCount > 0 &&
          currentDocFirstPageCount < nextDoc.numPages
            ? currentDocFirstPageCount + 1
            : 1;

        pendingRestorePageRef.current = targetPage > 1 ? targetPage : null;
        if (targetPage > 1) {
          suppressScrollUntilRef.current = Date.now() + 900;
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

        const baseSourceName =
          includedCurrentDoc && fileName
            ? fileName
            : entries[0]?.name || 'birlestirilmis-belge.pdf';
        const cleanBase = baseSourceName.replace(/\.pdf$/i, '').replace(/-birlesik$/i, '');
        const nextFileName = `${cleanBase}-birlesik.pdf`;

        setPdfDoc(nextDoc);
        setDocRevision((r) => r + 1);
        setFileName(nextFileName);
        setFileHandle(null);
        setPagesMeta(metas);
        setCurrentPage(targetPage);
        setAnnotations(mergedAnnotations);
        setUndoStack([]);
        setRedoStack([]);
        setSelectedObject(null);
        setHasUnsavedChanges(true);
        setOverlayBoardMode(null);
        setIsMergeModalOpen(false);
        setIsThumbnailSidebarOpen(true);

        if (!hadExistingDoc) {
          setToolMode('select');
          const initialZoom = metas.length > 0 ? computeFitWidthZoom(metas[0].baseWidth) : 1;
          setZoom(initialZoom);
          setRenderZoom(initialZoom);
        }

        showToast(
          'success',
          `${sourceByteList.length} PDF birleştirildi (Toplam ${totalPages} sayfa).`,
        );
      } catch {
        if (nextDoc && nextDoc !== pdfDocRef.current) {
          try {
            await nextDoc.destroy();
          } catch {
            // Yoksay
          }
        }
        showToast(
          'error',
          'PDF dosyaları birleştirilirken bir hata oluştu. Şifreli veya bozuk bir dosya olabilir.',
        );
      } finally {
        setIsMergingPdfs(false);
      }
    },
    [
      computeFitWidthZoom,
      fileName,
      isExporting,
      isInsertingPage,
      isLoadingPdf,
      isMergingPdfs,
      showToast,
    ],
  );

  const mutateAnnotations = useCallback(
    (updater: (prev: AnnotationsMap) => AnnotationsMap, recordUndo = true) => {
      setAnnotations((prev) => {
        if (recordUndo) {
          const snapshot = cloneAnnotationsMap(prev);
          setUndoStack((stack) => [...stack.slice(-(MAX_UNDO_STACK - 1)), snapshot]);
          setRedoStack([]);
        }
        return updater(prev);
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  const mutateTargetPage = useCallback(
    (
      pageNumber: number,
      pageUpdater: (page: PageAnnotations) => PageAnnotations,
      recordUndo = true,
    ) => {
      if (pageNumber === OVERLAY_PAGE_NUMBER) {
        setOverlayAnnotations((prev) => {
          if (recordUndo) {
            const snapshot = clonePageAnnotations(prev);
            setOverlayUndoStack((stack) => [...stack.slice(-(MAX_UNDO_STACK - 1)), snapshot]);
            setOverlayRedoStack([]);
          }
          return pageUpdater(prev);
        });
        return;
      }
      mutateAnnotations((prev) => {
        const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
        return {
          ...prev,
          [pageNumber]: pageUpdater(page),
        };
      }, recordUndo);
    },
    [mutateAnnotations],
  );

  const handleToggleOverlayBoard = useCallback((kind: InsertPageKind) => {
    setSelectedObject(null);
    setOverlayBoardMode((prev) => {
      if (prev === kind) {
        return null;
      }
      setToolMode((currentTool) => (currentTool === 'select' ? 'pen' : currentTool));
      return kind;
    });
  }, []);

  const handleInsertFromOverlay = useCallback(
    async (kind: InsertPageKind) => {
      setOverlayBoardMode(null);
      setSelectedObject(null);
      await handleInsertPage(kind);
    },
    [handleInsertPage],
  );

  const handleClearOverlayBoard = useCallback(() => {
    mutateTargetPage(OVERLAY_PAGE_NUMBER, () => EMPTY_PAGE_ANNOTATIONS, true);
    setSelectedObject(null);
    showToast('info', 'Açık sayfadaki çizimler temizlendi (Ctrl+Z ile geri alınabilir).');
  }, [mutateTargetPage, showToast]);

  const handleAddText = useCallback(
    (pageNumber: number, item: TextAnnotation) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        texts: [...page.texts, item],
      }));
    },
    [mutateTargetPage],
  );

  const handleUpdateText = useCallback(
    (pageNumber: number, id: string, patch: Partial<TextAnnotation>, recordUndo = true) => {
      mutateTargetPage(
        pageNumber,
        (page) => ({
          ...page,
          texts: page.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
        recordUndo,
      );
    },
    [mutateTargetPage],
  );

  const handleDeleteText = useCallback(
    (pageNumber: number, id: string) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        texts: page.texts.filter((t) => t.id !== id),
      }));
      setSelectedObject((sel) =>
        sel && sel.type === 'text' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateTargetPage],
  );

  const handleAddStroke = useCallback(
    (pageNumber: number, stroke: StrokeAnnotation) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        strokes: [...page.strokes, stroke],
      }));
    },
    [mutateTargetPage],
  );

  const handleUpdateStroke = useCallback(
    (pageNumber: number, id: string, patch: Partial<StrokeAnnotation>, recordUndo = true) => {
      mutateTargetPage(
        pageNumber,
        (page) => ({
          ...page,
          strokes: page.strokes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
        recordUndo,
      );
    },
    [mutateTargetPage],
  );

  const handleDeleteStroke = useCallback(
    (pageNumber: number, id: string) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        strokes: page.strokes.filter((s) => s.id !== id),
      }));
      setSelectedObject((sel) =>
        sel && sel.type === 'stroke' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateTargetPage],
  );

  const handleAddShape = useCallback(
    (pageNumber: number, shape: ShapeAnnotation) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        shapes: [...(page.shapes || []), shape],
      }));
    },
    [mutateTargetPage],
  );

  const handleUpdateShape = useCallback(
    (pageNumber: number, id: string, patch: Partial<ShapeAnnotation>, recordUndo = true) => {
      mutateTargetPage(
        pageNumber,
        (page) => ({
          ...page,
          shapes: (page.shapes || []).map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)),
        }),
        recordUndo,
      );
    },
    [mutateTargetPage],
  );

  const handleDeleteShape = useCallback(
    (pageNumber: number, id: string) => {
      mutateTargetPage(pageNumber, (page) => ({
        ...page,
        shapes: (page.shapes || []).filter((sh) => sh.id !== id),
      }));
      setSelectedObject((sel) =>
        sel && sel.type === 'shape' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateTargetPage],
  );

  const handleEraseBatch = useCallback(
    (pageNumber: number, textIds: string[], strokeIds: string[], shapeIds: string[]) => {
      if (textIds.length === 0 && strokeIds.length === 0 && shapeIds.length === 0) return;
      const textSet = new Set(textIds);
      const strokeSet = new Set(strokeIds);
      const shapeSet = new Set(shapeIds);
      mutateTargetPage(pageNumber, (page) => ({
        texts: page.texts.filter((t) => !textSet.has(t.id)),
        strokes: page.strokes.filter((s) => !strokeSet.has(s.id)),
        shapes: (page.shapes || []).filter((sh) => !shapeSet.has(sh.id)),
      }));
    },
    [mutateTargetPage],
  );

  const handleSelectColor = useCallback(
    (hex: string) => {
      setActiveColor(hex);
      if (toolMode === 'shape') {
        setActiveShapeBorderColor(hex);
        if (syncShapeFillWithBorder) {
          setActiveShapeFillColor(hex);
        }
      }
      if (selectedObject?.type === 'text') {
        handleUpdateText(selectedObject.pageNumber, selectedObject.id, { color: hex }, true);
      } else if (selectedObject?.type === 'stroke') {
        handleUpdateStroke(selectedObject.pageNumber, selectedObject.id, { color: hex }, true);
      } else if (selectedObject?.type === 'shape') {
        setActiveShapeBorderColor(hex);
        const patch: Partial<ShapeAnnotation> = { color: hex };
        if (syncShapeFillWithBorder) {
          setActiveShapeFillColor(hex);
          patch.fillColor = hex;
        }
        handleUpdateShape(selectedObject.pageNumber, selectedObject.id, patch, true);
      }
    },
    [
      toolMode,
      syncShapeFillWithBorder,
      selectedObject,
      handleUpdateText,
      handleUpdateStroke,
      handleUpdateShape,
    ],
  );

  const handleSelectFontSize = useCallback(
    (key: FontSizeKey) => {
      setFontSizeKey(key);
      if (selectedObject?.type === 'text') {
        handleUpdateText(
          selectedObject.pageNumber,
          selectedObject.id,
          { fontSizeRatio: FONT_SIZE_RATIOS[key].ratio },
          true,
        );
      }
    },
    [selectedObject, handleUpdateText],
  );

  const handleToggleBold = useCallback(() => {
    setBold((prev) => {
      const next = !prev;
      if (selectedObject?.type === 'text') {
        handleUpdateText(selectedObject.pageNumber, selectedObject.id, { bold: next }, true);
      }
      return next;
    });
  }, [selectedObject, handleUpdateText]);

  const handleSelectPenWidth = useCallback(
    (key: PenWidthKey) => {
      setPenWidthKey(key);
      if (selectedObject?.type === 'stroke') {
        handleUpdateStroke(
          selectedObject.pageNumber,
          selectedObject.id,
          { widthRatio: PEN_WIDTH_RATIOS[key].ratio },
          true,
        );
      } else if (selectedObject?.type === 'shape') {
        handleUpdateShape(
          selectedObject.pageNumber,
          selectedObject.id,
          { widthRatio: PEN_WIDTH_RATIOS[key].ratio },
          true,
        );
      }
    },
    [selectedObject, handleUpdateStroke, handleUpdateShape],
  );

  const handleSelectShapeFillMode = useCallback(
    (mode: ShapeFillMode) => {
      setActiveShapeFillMode(mode);
      if (selectedObject?.type === 'shape') {
        handleUpdateShape(
          selectedObject.pageNumber,
          selectedObject.id,
          { fillMode: mode, filled: mode !== 'none' },
          true,
        );
      }
    },
    [selectedObject, handleUpdateShape],
  );

  const handleSelectShapeBorderColor = useCallback(
    (hex: string) => {
      setActiveShapeBorderColor(hex);
      if (syncShapeFillWithBorder) {
        setActiveShapeFillColor(hex);
      }
      if (selectedObject?.type === 'shape') {
        const patch: Partial<ShapeAnnotation> = { color: hex };
        if (syncShapeFillWithBorder) {
          patch.fillColor = hex;
        }
        handleUpdateShape(selectedObject.pageNumber, selectedObject.id, patch, true);
      }
    },
    [syncShapeFillWithBorder, selectedObject, handleUpdateShape],
  );

  const handleSelectShapeFillColor = useCallback(
    (hex: string) => {
      setActiveShapeFillColor(hex);
      setSyncShapeFillWithBorder(hex === activeShapeBorderColor);
      const nextMode: ShapeFillMode = activeShapeFillMode === 'none' ? 'solid' : activeShapeFillMode;
      if (activeShapeFillMode === 'none') {
        setActiveShapeFillMode('solid');
      }
      if (selectedObject?.type === 'shape') {
        handleUpdateShape(
          selectedObject.pageNumber,
          selectedObject.id,
          { fillColor: hex, fillMode: nextMode, filled: true },
          true,
        );
      }
    },
    [activeShapeBorderColor, activeShapeFillMode, selectedObject, handleUpdateShape],
  );

  const handleToggleSyncShapeFill = useCallback(() => {
    setSyncShapeFillWithBorder((prev) => {
      const next = !prev;
      if (next) {
        setActiveShapeFillColor(activeShapeBorderColor);
        if (selectedObject?.type === 'shape') {
          handleUpdateShape(
            selectedObject.pageNumber,
            selectedObject.id,
            { fillColor: activeShapeBorderColor },
            true,
          );
        }
      }
      return next;
    });
  }, [activeShapeBorderColor, selectedObject, handleUpdateShape]);

  const handleSelectStampType = useCallback((stamp: StampType) => {
    setActiveStampType(stamp);
    const opt = STAMP_OPTIONS.find((s) => s.type === stamp);
    if (opt) {
      setActiveColor(opt.defaultColor);
    }
  }, []);

  const handleSelectTool = useCallback(
    (mode: ToolMode) => {
      setToolMode(mode);
      if (mode !== 'select') setSelectedObject(null);
      if (mode === 'stamp' || mode === 'shape') {
        setIsSidePanelOpen(true);
      }
      if (mode === 'stamp') {
        const opt = STAMP_OPTIONS.find((s) => s.type === activeStampType);
        if (opt) setActiveColor(opt.defaultColor);
      }
    },
    [activeStampType],
  );

  const handleSelectObject = useCallback((obj: SelectedObject | null) => {
    setSelectedObject(obj);
    if (!obj) return;
    const page =
      obj.pageNumber === OVERLAY_PAGE_NUMBER
        ? overlayAnnotationsRef.current
        : annotationsRef.current[obj.pageNumber];
    if (!page) return;
    if (obj.type === 'shape') {
      const sh = (page.shapes || []).find((item) => item.id === obj.id);
      if (sh && !isStampShapeType(sh.shapeType)) {
        setIsSidePanelOpen(true);
      }
    }
    if (obj.type === 'text') {
      const item = page.texts.find((t) => t.id === obj.id);
      if (!item) return;
      setActiveColor(item.color);
      setBold(item.bold);
      let bestKey: FontSizeKey = 'medium';
      let bestDiff = Infinity;
      (Object.keys(FONT_SIZE_RATIOS) as FontSizeKey[]).forEach((k) => {
        const diff = Math.abs(FONT_SIZE_RATIOS[k].ratio - item.fontSizeRatio);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestKey = k;
        }
      });
      setFontSizeKey(bestKey);
    } else if (obj.type === 'stroke') {
      const item = page.strokes.find((s) => s.id === obj.id);
      if (!item) return;
      setActiveColor(item.color);
      let bestKey: PenWidthKey = 'medium';
      let bestDiff = Infinity;
      (Object.keys(PEN_WIDTH_RATIOS) as PenWidthKey[]).forEach((k) => {
        const diff = Math.abs(PEN_WIDTH_RATIOS[k].ratio - item.widthRatio);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestKey = k;
        }
      });
      setPenWidthKey(bestKey);
    } else if (obj.type === 'shape') {
      const item = (page.shapes || []).find((sh) => sh.id === obj.id);
      if (!item) return;
      setActiveColor(item.color);
      if (isStampShapeType(item.shapeType)) {
        setActiveStampType(item.shapeType);
      } else {
        setActiveShapeType(item.shapeType);
        const resolvedMode: ShapeFillMode =
          item.fillMode ?? (item.filled ? 'translucent' : 'none');
        const resolvedFill = item.fillColor || item.color;
        setActiveShapeFillMode(resolvedMode);
        setActiveShapeBorderColor(item.color);
        setActiveShapeFillColor(resolvedFill);
        setSyncShapeFillWithBorder(resolvedFill === item.color);
      }
      let bestKey: PenWidthKey = 'medium';
      let bestDiff = Infinity;
      (Object.keys(PEN_WIDTH_RATIOS) as PenWidthKey[]).forEach((k) => {
        const diff = Math.abs(PEN_WIDTH_RATIOS[k].ratio - item.widthRatio);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestKey = k;
        }
      });
      setPenWidthKey(bestKey);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (overlayBoardMode !== null) {
      setOverlayUndoStack((stack) => {
        if (stack.length === 0) return stack;
        const previous = stack[stack.length - 1];
        setOverlayRedoStack((rStack) => [
          ...rStack,
          clonePageAnnotations(overlayAnnotationsRef.current),
        ]);
        setOverlayAnnotations(previous);
        setSelectedObject(null);
        return stack.slice(0, -1);
      });
      return;
    }
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setRedoStack((rStack) => [...rStack, cloneAnnotationsMap(annotationsRef.current)]);
      setAnnotations(previous);
      setSelectedObject(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, [overlayBoardMode]);

  const handleRedo = useCallback(() => {
    if (overlayBoardMode !== null) {
      setOverlayRedoStack((stack) => {
        if (stack.length === 0) return stack;
        const next = stack[stack.length - 1];
        setOverlayUndoStack((uStack) => [
          ...uStack,
          clonePageAnnotations(overlayAnnotationsRef.current),
        ]);
        setOverlayAnnotations(next);
        setSelectedObject(null);
        return stack.slice(0, -1);
      });
      return;
    }
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((uStack) => [...uStack, cloneAnnotationsMap(annotationsRef.current)]);
      setAnnotations(next);
      setSelectedObject(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, [overlayBoardMode]);

  const executeClearCurrentPage = useCallback(
    (pageNumber: number) => {
      mutateAnnotations((prev) => {
        const copy = { ...prev };
        delete copy[pageNumber];
        return copy;
      }, true);
      setSelectedObject(null);
      showToast('info', `Sayfa ${pageNumber} üzerindeki notlar temizlendi (Ctrl+Z ile geri alınabilir).`);
    },
    [mutateAnnotations, showToast],
  );

  const executeClearAllPages = useCallback(() => {
    mutateAnnotations(() => ({}), true);
    setSelectedObject(null);
    showToast('info', 'Tüm sayfalardaki notlar temizlendi (Ctrl+Z ile geri alınabilir).');
  }, [mutateAnnotations, showToast]);

  const notifyCanvasFallbackOnce = useCallback(
    (usedFallback: boolean) => {
      if (usedFallback && !canvasFallbackNotifiedRef.current) {
        canvasFallbackNotifiedRef.current = true;
        window.setTimeout(() => {
          showToast('info', 'Metinler resim olarak işlendi (Türkçe karakterler korundu).', 5200);
        }, 1400);
      }
    },
    [showToast],
  );

  const performOverwriteSave = useCallback(async () => {
    const cleanBytes = cleanOriginalBytesRef.current;
    if (!cleanBytes) {
      showToast('error', 'Kaydedilecek açık bir PDF belgesi bulunamadı.');
      return;
    }

    setIsExporting(true);
    try {
      const savedPage = currentPageRef.current;
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: true,
        lastPage: savedPage,
      });

      const writeRes = await overwritePdfFileHandle(
        fileHandle,
        result.bytes,
        fileName || 'belge.pdf',
      );

      saveLastPageRecord(docFingerprintRef.current, fileName || 'belge.pdf', pagesMeta.length, savedPage);
      setHasUnsavedChanges(false);
      hasCorruptAttachmentRef.current = false;

      if (writeRes.status === 'overwritten') {
        showToast('success', `"${fileName}" güncellendi (Sayfa ${savedPage} kaydedildi).`);
      } else {
        showToast(
          'warning',
          `Bu tarayıcıda orijinal dosyanın üzerine yazılamıyor, kopya indirildi (Sayfa ${savedPage} kaydedildi).`,
          5500,
        );
      }

      notifyCanvasFallbackOnce(result.usedCanvasFallback);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PDF kaydedilirken beklenmeyen bir hata oluştu.';
      showToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [fileHandle, fileName, fontAssets, notifyCanvasFallbackOnce, pagesMeta.length, showToast]);

  const handleSaveOverwriteClick = useCallback(() => {
    if (!cleanOriginalBytesRef.current || isExporting) return;

    if (fileHandle && (!overwriteConfirmedRef.current || hasCorruptAttachmentRef.current)) {
      setConfirmDialog({
        kind: 'overwrite',
        corruptWarning: hasCorruptAttachmentRef.current,
      });
      return;
    }

    void performOverwriteSave();
  }, [fileHandle, isExporting, performOverwriteSave]);

  const handleSaveAsEditable = useCallback(async () => {
    const cleanBytes = cleanOriginalBytesRef.current;
    if (!cleanBytes || isExporting) return;

    setIsExporting(true);
    try {
      const savedPage = currentPageRef.current;
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: true,
        lastPage: savedPage,
      });

      const suggested = buildSuggestedName(fileName || 'belge.pdf', '-notlu');
      const saveRes = await savePdfBytesAs(result.bytes, suggested);

      if (saveRes.status === 'cancelled') {
        return;
      }

      saveLastPageRecord(docFingerprintRef.current, saveRes.fileName, pagesMeta.length, savedPage);
      if (fileName && fileName !== saveRes.fileName) {
        saveLastPageRecord(docFingerprintRef.current, fileName, pagesMeta.length, savedPage);
      }
      setHasUnsavedChanges(false);
      hasCorruptAttachmentRef.current = false;
      setFileName(saveRes.fileName);

      if (saveRes.status === 'saved' && saveRes.handle) {
        setFileHandle(saveRes.handle);
        overwriteConfirmedRef.current = true;
        showToast('success', `"${saveRes.fileName}" kaydedildi (Sayfa ${savedPage} hatırlandı).`);
      } else {
        setFileHandle(null);
        showToast('success', `"${saveRes.fileName}" düzenlenebilir kopya olarak indirildi (Sayfa ${savedPage} hatırlandı).`);
      }

      notifyCanvasFallbackOnce(result.usedCanvasFallback);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Farklı kaydetme sırasında hata oluştu.';
      showToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [fileName, fontAssets, isExporting, notifyCanvasFallbackOnce, pagesMeta.length, showToast]);

  const handleExportFlatPdf = useCallback(async () => {
    const cleanBytes = cleanOriginalBytesRef.current;
    if (!cleanBytes || isExporting) return;

    setIsExporting(true);
    try {
      const savedPage = currentPageRef.current;
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: false,
      });

      const saveRes = await savePdfBytesAs(result.bytes, 'duzenlenmis_dosya.pdf');

      if (saveRes.status === 'cancelled') {
        return;
      }

      saveLastPageRecord(docFingerprintRef.current, saveRes.fileName, pagesMeta.length, savedPage);
      showToast('success', `"${saveRes.fileName}" düz PDF olarak dışa aktarıldı.`);
      notifyCanvasFallbackOnce(result.usedCanvasFallback);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Düz PDF dışa aktarılırken hata oluştu.';
      showToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [fontAssets, isExporting, notifyCanvasFallbackOnce, pagesMeta.length, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'INPUT' ||
        target?.isContentEditable;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (pdfDoc) handleSaveOverwriteClick();
        return;
      }

      if (isTypingField) return;

      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (isMod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject) {
        e.preventDefault();
        if (selectedObject.type === 'text') {
          handleDeleteText(selectedObject.pageNumber, selectedObject.id);
        } else if (selectedObject.type === 'stroke') {
          handleDeleteStroke(selectedObject.pageNumber, selectedObject.id);
        } else if (selectedObject.type === 'shape') {
          handleDeleteShape(selectedObject.pageNumber, selectedObject.id);
        }
        setSelectedObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    pdfDoc,
    handleSaveOverwriteClick,
    handleUndo,
    handleRedo,
    selectedObject,
    handleDeleteText,
    handleDeleteStroke,
    handleDeleteShape,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (!pdfDoc) return;
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      applyZoom((prev) => prev + delta);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pdfDoc, applyZoom]);

  const handleWorkspaceScroll = useCallback(() => {
    if (Date.now() < suppressScrollUntilRef.current) return;
    const container = scrollContainerRef.current;
    if (!container || pagesMeta.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const viewportCenterY = containerRect.top + containerRect.height / 2;

    let closestPage = currentPage;
    let smallestDistance = Infinity;

    pageElementsRef.current.forEach((el, pageNum) => {
      const rect = el.getBoundingClientRect();
      const pageCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(pageCenterY - viewportCenterY);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPage = pageNum;
      }
    });

    if (closestPage !== currentPage) {
      setCurrentPage(closestPage);
    }
  }, [currentPage, pagesMeta.length]);

  const registerPageElement = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
    if (el) {
      pageElementsRef.current.set(pageNumber, el);
    } else {
      pageElementsRef.current.delete(pageNumber);
    }
  }, []);

  const scrollToPage = useCallback((pageNum: number, instant = false) => {
    const clamped = Math.max(1, Math.min(pagesMeta.length || 1, pageNum));
    const el = pageElementsRef.current.get(clamped);
    const container = scrollContainerRef.current;
    setCurrentPage(clamped);

    if (el && container) {
      const pageDistance = Math.abs(clamped - currentPageRef.current);
      const useInstant = instant || pageDistance > 10;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetTop = Math.max(0, container.scrollTop + (elRect.top - containerRect.top) - 16);

      suppressScrollUntilRef.current = Date.now() + (useInstant ? 250 : 650);
      container.scrollTo({
        top: targetTop,
        behavior: useInstant ? 'auto' : 'smooth',
      });
    } else if (el) {
      suppressScrollUntilRef.current = Date.now() + (instant ? 250 : 650);
      el.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
    }
  }, [pagesMeta.length]);

  // Açılan PDF'in son kaldığı sayfaya yerleşim tamamlandıktan hemen sonra kaydır
  useEffect(() => {
    const targetPage = pendingRestorePageRef.current;
    if (!pdfDoc || pagesMeta.length === 0 || !targetPage) return;

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (pendingRestorePageRef.current === targetPage) {
          scrollToPage(targetPage, true);
          pendingRestorePageRef.current = null;
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [pdfDoc, pagesMeta, scrollToPage]);

  // Açık PDF'te sayfa değiştikçe son kalınan sayfayı tarayıcıda da yerel olarak hatırla
  useEffect(() => {
    if (!pdfDoc || pagesMeta.length === 0) return;
    saveLastPageRecord(docFingerprintRef.current, fileName, pagesMeta.length, currentPage);
  }, [pdfDoc, fileName, pagesMeta.length, currentPage]);

  const handleFitWidth = useCallback(() => {
    if (pagesMeta.length === 0) return;
    const currentMeta = pagesMeta[currentPage - 1] || pagesMeta[0];
    applyZoom(computeFitWidthZoom(currentMeta.baseWidth));
  }, [pagesMeta, currentPage, computeFitWidthZoom, applyZoom]);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void> | void;
      };
      const isCurrentlyFs = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);

      if (!isCurrentlyFs) {
        const target = (appRootRef.current || document.documentElement) as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        };
        if (typeof target.requestFullscreen === 'function') {
          await target.requestFullscreen();
        } else if (typeof target.webkitRequestFullscreen === 'function') {
          await target.webkitRequestFullscreen();
        } else {
          showToast(
            'warning',
            'Önizlemede tam ekran kısıtlı olabilir, uygulamayı yeni sekmede aç.',
            5000,
          );
        }
      } else if (typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen();
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        await doc.webkitExitFullscreen();
      }
    } catch {
      showToast(
        'warning',
        'Önizlemede tam ekran kısıtlı olabilir, uygulamayı yeni sekmede aç.',
        5000,
      );
    }
  }, [showToast]);

  const handleSelectFontFile = useCallback(
    async (weight: 'regular' | 'bold', file: File) => {
      try {
        const bytes = await readFontFileBytes(file);
        setFontAssets((prev) =>
          weight === 'regular'
            ? { ...prev, regularBytes: bytes, regularLabel: `Kullanıcı: ${file.name}` }
            : { ...prev, boldBytes: bytes, boldLabel: `Kullanıcı: ${file.name}` },
        );
        showToast(
          'success',
          `${weight === 'regular' ? 'Normal' : 'Kalın'} font yüklendi: ${file.name}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Font dosyası okunamadı.';
        showToast('error', msg);
      }
    },
    [showToast],
  );

  const handleResetFonts = useCallback(async () => {
    const assets = await loadDefaultLocalFonts();
    setFontAssets(assets);
    showToast('info', 'Varsayılan yerel fontlar kontrol edildi.');
  }, [showToast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isMergeModalOpen) return;
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (isMergeModalOpen) return;
    const handle = await extractDropFileHandle(e.dataTransfer);
    if (handle) {
      try {
        const file = await handle.getFile();
        await loadPdfFile(file, handle);
        return;
      } catch {
        // Handle okunamazsa klasik files[0] yedeğine düş
      }
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await loadPdfFile(file, null);
    }
  };

  const handleRequestExit = useCallback(() => {
    if (!onExit) return;
    if (hasUnsavedChanges) {
      setConfirmDialog({ kind: 'exit-unsaved' });
      return;
    }
    onExit();
  }, [hasUnsavedChanges, onExit]);

  const hasInteractiveCanvas = Boolean(pdfDoc) || overlayBoardMode !== null;
  const currentPageData = annotations[currentPage] || EMPTY_PAGE_ANNOTATIONS;
  const hasPdfCurrentPageAnnotations =
    currentPageData.texts.length > 0 ||
    currentPageData.strokes.length > 0 ||
    (currentPageData.shapes?.length || 0) > 0;
  const hasOverlayAnnotations =
    overlayAnnotations.texts.length > 0 ||
    overlayAnnotations.strokes.length > 0 ||
    (overlayAnnotations.shapes?.length || 0) > 0;
  const hasCurrentPageAnnotations =
    overlayBoardMode !== null ? hasOverlayAnnotations : hasPdfCurrentPageAnnotations;
  const hasAnyAnnotations = Object.values(annotations).some(
    (p) => p && (p.texts.length > 0 || p.strokes.length > 0 || (p.shapes?.length || 0) > 0),
  );

  const isGeometricShapeSelected = (() => {
    if (selectedObject?.type !== 'shape') return false;
    const targetPage =
      selectedObject.pageNumber === OVERLAY_PAGE_NUMBER
        ? overlayAnnotations
        : annotations[selectedObject.pageNumber];
    const sh = (targetPage?.shapes || []).find((s) => s.id === selectedObject.id);
    return Boolean(sh && !isStampShapeType(sh.shapeType));
  })();

  const toastStyles: Record<ToastNotice['type'], string> = {
    info: 'bg-slate-800 text-white border-slate-700',
    success: 'bg-emerald-700 text-white border-emerald-600',
    warning: 'bg-amber-600 text-white border-amber-500',
    error: 'bg-rose-700 text-white border-rose-600',
  };

  return (
    <div
      ref={appRootRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-screen w-screen flex flex-col bg-slate-200 text-slate-900 overflow-hidden select-none"
      style={{
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void loadPdfFile(file, null);
          e.target.value = '';
        }}
      />

      <Toolbar
        hasDocument={Boolean(pdfDoc)}
        hasInteractiveCanvas={hasInteractiveCanvas}
        overlayBoardMode={overlayBoardMode}
        fileName={fileName}
        hasUnsavedChanges={hasUnsavedChanges}
        canOverwriteHandle={Boolean(fileHandle)}
        currentPage={currentPage}
        numPages={pagesMeta.length}
        zoom={zoom}
        toolMode={toolMode}
        activeColor={activeColor}
        fontSizeKey={fontSizeKey}
        bold={bold}
        penWidthKey={penWidthKey}
        strokeSmoothing={strokeSmoothing}
        activeShapeType={activeShapeType}
        activeShapeFillMode={activeShapeFillMode}
        activeShapeBorderColor={activeShapeBorderColor}
        activeShapeFillColor={activeShapeFillColor}
        activeStampType={activeStampType}
        stampSizeKey={stampSizeKey}
        canUndo={overlayBoardMode !== null ? overlayUndoStack.length > 0 : undoStack.length > 0}
        canRedo={overlayBoardMode !== null ? overlayRedoStack.length > 0 : redoStack.length > 0}
        hasCurrentPageAnnotations={hasCurrentPageAnnotations}
        hasAnyAnnotations={hasAnyAnnotations}
        isFullscreen={isFullscreen}
        isExporting={isExporting}
        isInsertingPage={isInsertingPage}
        isMergingPdfs={isMergingPdfs}
        isThumbnailSidebarOpen={isThumbnailSidebarOpen}
        onExitToSite={onExit ? handleRequestExit : undefined}
        onOpenPdfClick={handleOpenPdfClick}
        onOpenMergeModal={() => setIsMergeModalOpen(true)}
        onToggleThumbnailSidebar={() => setIsThumbnailSidebarOpen((prev) => !prev)}
        onPrevPage={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => scrollToPage(Math.min(pagesMeta.length, currentPage + 1))}
        onJumpToPage={scrollToPage}
        onToggleBlankOverlay={() => handleToggleOverlayBoard('blank')}
        onToggleGridOverlay={() => handleToggleOverlayBoard('grid')}
        onZoomIn={() => applyZoom((z) => z + 0.2)}
        onZoomOut={() => applyZoom((z) => z - 0.2)}
        onFitWidth={handleFitWidth}
        onSelectStrokeSmoothing={setStrokeSmoothing}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRequestClearPage={() => {
          if (overlayBoardMode !== null) {
            handleClearOverlayBoard();
            return;
          }
          setConfirmDialog({ kind: 'clear-page', pageNumber: currentPage });
        }}
        onRequestClearAll={() => setConfirmDialog({ kind: 'clear-all' })}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSaveOverwrite={handleSaveOverwriteClick}
        onSaveAsEditable={handleSaveAsEditable}
        onExportFlatPdf={handleExportFlatPdf}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <LeftToolSidebar
          hasDocument={hasInteractiveCanvas}
          toolMode={toolMode}
          activeColor={activeColor}
          fontSizeKey={fontSizeKey}
          bold={bold}
          penWidthKey={penWidthKey}
          activeShapeType={activeShapeType}
          activeShapeFillMode={activeShapeFillMode}
          activeShapeBorderColor={activeShapeBorderColor}
          activeShapeFillColor={activeShapeFillColor}
          syncShapeFillWithBorder={syncShapeFillWithBorder}
          isGeometricShapeSelected={isGeometricShapeSelected}
          activeStampType={activeStampType}
          stampSizeKey={stampSizeKey}
          isSidePanelOpen={isSidePanelOpen}
          onCloseSidePanel={() => setIsSidePanelOpen(false)}
          onSelectTool={handleSelectTool}
          onSelectColor={handleSelectColor}
          onSelectFontSize={handleSelectFontSize}
          onToggleBold={handleToggleBold}
          onSelectPenWidth={handleSelectPenWidth}
          onSelectShapeType={setActiveShapeType}
          onSelectShapeFillMode={handleSelectShapeFillMode}
          onSelectShapeBorderColor={handleSelectShapeBorderColor}
          onSelectShapeFillColor={handleSelectShapeFillColor}
          onToggleSyncShapeFill={handleToggleSyncShapeFill}
          onSelectStampType={handleSelectStampType}
          onSelectStampSize={setStampSizeKey}
        />

        {pdfDoc && pagesMeta.length > 0 && isThumbnailSidebarOpen && (
          <ThumbnailSidebar
            pdfDoc={pdfDoc}
            docRevision={docRevision}
            pagesMeta={pagesMeta}
            currentPage={currentPage}
            annotations={annotations}
            onSelectPage={(pageNumber) => {
              if (overlayBoardMode !== null) {
                setOverlayBoardMode(null);
              }
              scrollToPage(pageNumber);
            }}
            onClose={() => setIsThumbnailSidebarOpen(false)}
          />
        )}

        <div className="flex-1 relative min-w-0 h-full flex">
          <main
            ref={scrollContainerRef}
            onScroll={handleWorkspaceScroll}
            className="flex-1 overflow-auto workspace-scroll relative px-4 py-6"
          >
        {isLoadingPdf && (
          <div className="fixed inset-0 z-40 bg-slate-900/30 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl px-6 py-4 text-slate-800 font-medium border border-slate-200">
              PDF yükleniyor, lütfen bekleyin...
            </div>
          </div>
        )}

        {!pdfDoc && !isLoadingPdf && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-sm max-w-lg w-full p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <PdfDocIcon className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-slate-900">
                  Çevrimdışı PDF Görüntüleyici ve Not Editörü
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PDF dosyanızı bu alana sürükleyip bırakın, aşağıdan seçin veya doğrudan boş /
                  kareli sayfa ile başlayın. Tüm işlemler yalnızca tarayıcınızda gerçekleşir.
                </p>
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenPdfClick}
                  className="min-h-[44px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  PDF Dosyası Aç
                </button>
                <button
                  type="button"
                  disabled={isMergingPdfs}
                  onClick={() => setIsMergeModalOpen(true)}
                  className="min-h-[44px] px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <MergePdfIcon className="w-4 h-4" />
                  <span>PDF Birleştir</span>
                </button>
                <button
                  type="button"
                  disabled={isInsertingPage}
                  onClick={() => void handleInsertPage('blank')}
                  className="min-h-[44px] px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <BlankPageAddIcon className="w-4 h-4" />
                  <span>Boş Sayfa</span>
                </button>
                <button
                  type="button"
                  disabled={isInsertingPage}
                  onClick={() => void handleInsertPage('grid')}
                  className="min-h-[44px] px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <GridPageAddIcon className="w-4 h-4" />
                  <span>Kareli Sayfa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Font ve Yardım
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Düzenlenebilir kayıt: Bu uygulamayla kaydedilen PDF&apos;leri tekrar açtığınızda
                eski yazı ve çizimlerinizi düzenleyip silebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {pdfDoc && pagesMeta.length > 0 && (
          <div className="flex flex-col items-center gap-5 pb-12 min-w-fit">
            {pagesMeta.map((meta) => (
              <PdfPageItem
                key={`${docRevision}-${meta.pageNumber}`}
                pdfDoc={pdfDoc}
                meta={meta}
                zoom={zoom}
                renderZoom={renderZoom}
                toolMode={toolMode}
                activeColor={activeColor}
                activeFontSizeRatio={FONT_SIZE_RATIOS[fontSizeKey].ratio}
                activeBold={bold}
                activePenWidthRatio={PEN_WIDTH_RATIOS[penWidthKey].ratio}
                activeStrokeSmoothing={strokeSmoothing}
                activeShapeType={activeShapeType}
                activeShapeFillMode={activeShapeFillMode}
                activeShapeBorderColor={activeShapeBorderColor}
                activeShapeFillColor={activeShapeFillColor}
                activeStampType={activeStampType}
                activeStampSizeRatio={STAMP_SIZE_RATIOS[stampSizeKey].ratio}
                annotations={annotations[meta.pageNumber] || EMPTY_PAGE_ANNOTATIONS}
                selectedObject={selectedObject}
                onSelectObject={handleSelectObject}
                onAddText={handleAddText}
                onUpdateText={handleUpdateText}
                onDeleteText={handleDeleteText}
                onAddStroke={handleAddStroke}
                onDeleteStroke={handleDeleteStroke}
                onAddShape={handleAddShape}
                onUpdateShape={handleUpdateShape}
                onDeleteShape={handleDeleteShape}
                onEraseBatch={handleEraseBatch}
                registerPageElement={registerPageElement}
              />
            ))}
          </div>
        )}
          </main>

          {overlayBoardMode !== null && (
            <ScratchpadOverlay
              mode={overlayBoardMode}
              hasPdfDocument={Boolean(pdfDoc)}
              isInsertingPage={isInsertingPage}
              toolMode={toolMode}
              activeColor={activeColor}
              activeFontSizeRatio={FONT_SIZE_RATIOS[fontSizeKey].ratio}
              activeBold={bold}
              activePenWidthRatio={PEN_WIDTH_RATIOS[penWidthKey].ratio}
              activeStrokeSmoothing={strokeSmoothing}
              activeShapeType={activeShapeType}
              activeShapeFillMode={activeShapeFillMode}
              activeShapeBorderColor={activeShapeBorderColor}
              activeShapeFillColor={activeShapeFillColor}
              activeStampType={activeStampType}
              activeStampSizeRatio={STAMP_SIZE_RATIOS[stampSizeKey].ratio}
              annotations={overlayAnnotations}
              selectedObject={selectedObject}
              onSelectObject={handleSelectObject}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onDeleteText={handleDeleteText}
              onAddStroke={handleAddStroke}
              onDeleteStroke={handleDeleteStroke}
              onAddShape={handleAddShape}
              onUpdateShape={handleUpdateShape}
              onDeleteShape={handleDeleteShape}
              onEraseBatch={handleEraseBatch}
              onSwitchMode={(nextKind) => setOverlayBoardMode(nextKind)}
              onInsertIntoPdf={(kind) => void handleInsertFromOverlay(kind)}
              onClearBoard={handleClearOverlayBoard}
              onClose={() => {
                setOverlayBoardMode(null);
                setSelectedObject((sel) => (sel?.pageNumber === OVERLAY_PAGE_NUMBER ? null : sel));
              }}
            />
          )}
        </div>
      </div>

      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-[1px] border-4 border-dashed border-blue-600 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-5 text-blue-700 font-bold text-lg">
            Açmak için PDF dosyasını buraya bırakın
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-xl border shadow-xl text-sm font-medium flex items-center gap-3 ${toastStyles[toast.type]}`}
        >
          <span className="leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Bildirimi kapat"
            className="shrink-0 opacity-80 hover:opacity-100 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmDialog.kind === 'overwrite' && (
              <>
                <h3 className="text-base font-bold text-slate-900">
                  Orijinal Dosyanın Üzerine Yazılsın mı?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Orijinal dosyanın üzerine yazılacak. Notlar dosyanın içinde düzenlenebilir olarak
                  saklanır ve orijinal içerik korunur. Devam?
                </p>
                {confirmDialog.corruptWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed">
                    <strong>Uyarı:</strong> Bu dosyadaki önceki gömülü not verisi bozuk veya
                    uyumsuz olduğu için yüklenemedi. Üzerine yazmadan önce yedek kopya indirmeniz
                    önerilir.
                  </div>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const backupBytes = rawOpenedBytesRef.current || cleanOriginalBytesRef.current;
                      if (backupBytes) {
                        const backupName = buildSuggestedName(fileName || 'belge.pdf', '-yedek');
                        downloadPdfBytes(backupBytes, backupName);
                        showToast('info', `Yedek kopya indirildi: ${backupName}`);
                      }
                    }}
                    className="min-h-[40px] px-3.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-sm font-medium cursor-pointer"
                  >
                    Önce yedek kopya indir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="min-h-[40px] px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      overwriteConfirmedRef.current = true;
                      setConfirmDialog(null);
                      void performOverwriteSave();
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Devam Et ve Kaydet
                  </button>
                </div>
              </>
            )}

            {confirmDialog.kind === 'clear-page' && (
              <>
                <h3 className="text-base font-bold text-slate-900">
                  Sayfa {confirmDialog.pageNumber} Notlarını Temizle
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bu sayfadaki tüm yazı ve çizim notları silinecek. İstediğinizde Geri Al (Ctrl+Z)
                  ile geri getirebilirsiniz. Devam edilsin mi?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="min-h-[40px] px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pNum = confirmDialog.pageNumber;
                      setConfirmDialog(null);
                      executeClearCurrentPage(pNum);
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Bu Sayfayı Temizle
                  </button>
                </div>
              </>
            )}

            {confirmDialog.kind === 'clear-all' && (
              <>
                <h3 className="text-base font-bold text-slate-900">Tüm Notları Temizle</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Belgedeki tüm sayfalara eklenmiş bütün yazı ve çizimler silinecek. İstediğinizde
                  Geri Al (Ctrl+Z) ile geri getirebilirsiniz. Emin misiniz?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="min-h-[40px] px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog(null);
                      executeClearAllPages();
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              </>
            )}

            {confirmDialog.kind === 'exit-unsaved' && (
              <>
                <h3 className="text-base font-bold text-slate-900">Kaydedilmemiş Değişiklikler Var</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PDF üzerinde yaptığınız son değişiklikler henüz kaydedilmedi. Kaydetmeden ana
                  siteye dönmek istiyor musunuz?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="min-h-[40px] px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium cursor-pointer"
                  >
                    PDF&apos;te Kal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog(null);
                      onExit?.();
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Kaydetmeden Dön
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontAssets={fontAssets}
        onSelectFontFile={handleSelectFontFile}
        onResetFonts={handleResetFonts}
      />

      <MergePdfModal
        isOpen={isMergeModalOpen}
        hasOpenDocument={Boolean(pdfDoc)}
        currentFileName={fileName || 'mevcut-belge.pdf'}
        currentPageCount={pagesMeta.length}
        currentSizeBytes={cleanOriginalBytesRef.current?.byteLength || 0}
        isMerging={isMergingPdfs}
        onClose={() => setIsMergeModalOpen(false)}
        onConfirmMerge={handleConfirmMerge}
      />
    </div>
  );
};

export default PdfEditorApp;
