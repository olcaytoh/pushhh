// Çevrimdışı PDF Görüntüleyici, Yazı ve Serbest Çizim Editörü (sıfır harici istek, düzenlenebilir PDF kayıt)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { PdfDocIcon } from './components/Icons';
import { PdfPageItem } from './components/PdfPageItem';
import { SettingsModal } from './components/SettingsModal';
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
  type ShapeType,
  STAMP_OPTIONS,
  STAMP_SIZE_RATIOS,
  type StampSizeKey,
  type StampType,
  type StrokeAnnotation,
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
import { exportAnnotatedPdf, extractEditableAttachments } from './utils/pdfExporter';
import { ensurePdfWorkerConfigured } from './utils/pdfWorker';

const EMPTY_PAGE_ANNOTATIONS: PageAnnotations = { texts: [], strokes: [], shapes: [] };
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;
const MAX_UNDO_STACK = 60;

function cloneAnnotationsMap(map: AnnotationsMap): AnnotationsMap {
  const copy: AnnotationsMap = {};
  for (const key of Object.keys(map)) {
    const pageNum = Number(key);
    const entry = map[pageNum];
    if (!entry) continue;
    copy[pageNum] = {
      texts: entry.texts.map((t) => ({ ...t })),
      strokes: entry.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ ...p })),
      })),
      shapes: (entry.shapes || []).map((sh) => ({ ...sh })),
    };
  }
  return copy;
}

function clampZoom(val: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(val * 100) / 100));
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
  const [fileName, setFileName] = useState<string>('');
  const [pagesMeta, setPagesMeta] = useState<PageMeta[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

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
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rectangle');
  const [activeShapeFilled, setActiveShapeFilled] = useState<boolean>(false);
  const [activeStampType, setActiveStampType] = useState<StampType>('check');
  const [stampSizeKey, setStampSizeKey] = useState<StampSizeKey>('medium');

  const [annotations, setAnnotations] = useState<AnnotationsMap>({});
  const [undoStack, setUndoStack] = useState<AnnotationsMap[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationsMap[]>([]);
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

        pdfDocRef.current = activeDoc;
        cleanOriginalBytesRef.current = cleanBytes;
        rawOpenedBytesRef.current = rawBytes.slice();
        overwriteConfirmedRef.current = false;

        setPdfDoc(activeDoc);
        setFileName(file.name);
        setFileHandle(handle);
        setPagesMeta(metas);
        setCurrentPage(1);
        setAnnotations(initialAnnotations);
        setUndoStack([]);
        setRedoStack([]);
        setSelectedObject(null);
        setHasUnsavedChanges(false);
        setToolMode('select');

        const initialZoom = metas.length > 0 ? computeFitWidthZoom(metas[0].baseWidth) : 1;
        setZoom(initialZoom);
        setRenderZoom(initialZoom);

        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

        if (openedBanner) {
          showToast(openedBanner.type, openedBanner.msg, openedBanner.type === 'warning' ? 6500 : 4500);
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

  const handleAddText = useCallback(
    (pageNumber: number, item: TextAnnotation) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            texts: [...page.texts, item],
          },
        };
      });
    },
    [mutateAnnotations],
  );

  const handleUpdateText = useCallback(
    (pageNumber: number, id: string, patch: Partial<TextAnnotation>, recordUndo = true) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            texts: page.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          },
        };
      }, recordUndo);
    },
    [mutateAnnotations],
  );

  const handleDeleteText = useCallback(
    (pageNumber: number, id: string) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            texts: page.texts.filter((t) => t.id !== id),
          },
        };
      });
      setSelectedObject((sel) =>
        sel && sel.type === 'text' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateAnnotations],
  );

  const handleAddStroke = useCallback(
    (pageNumber: number, stroke: StrokeAnnotation) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            strokes: [...page.strokes, stroke],
          },
        };
      });
    },
    [mutateAnnotations],
  );

  const handleUpdateStroke = useCallback(
    (pageNumber: number, id: string, patch: Partial<StrokeAnnotation>, recordUndo = true) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            strokes: page.strokes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          },
        };
      }, recordUndo);
    },
    [mutateAnnotations],
  );

  const handleDeleteStroke = useCallback(
    (pageNumber: number, id: string) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            strokes: page.strokes.filter((s) => s.id !== id),
          },
        };
      });
      setSelectedObject((sel) =>
        sel && sel.type === 'stroke' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateAnnotations],
  );

  const handleAddShape = useCallback(
    (pageNumber: number, shape: ShapeAnnotation) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            shapes: [...(page.shapes || []), shape],
          },
        };
      });
    },
    [mutateAnnotations],
  );

  const handleUpdateShape = useCallback(
    (pageNumber: number, id: string, patch: Partial<ShapeAnnotation>, recordUndo = true) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            shapes: (page.shapes || []).map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)),
          },
        };
      }, recordUndo);
    },
    [mutateAnnotations],
  );

  const handleDeleteShape = useCallback(
    (pageNumber: number, id: string) => {
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            shapes: (page.shapes || []).filter((sh) => sh.id !== id),
          },
        };
      });
      setSelectedObject((sel) =>
        sel && sel.type === 'shape' && sel.pageNumber === pageNumber && sel.id === id ? null : sel,
      );
    },
    [mutateAnnotations],
  );

  const handleEraseBatch = useCallback(
    (pageNumber: number, textIds: string[], strokeIds: string[], shapeIds: string[]) => {
      if (textIds.length === 0 && strokeIds.length === 0 && shapeIds.length === 0) return;
      const textSet = new Set(textIds);
      const strokeSet = new Set(strokeIds);
      const shapeSet = new Set(shapeIds);
      mutateAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        return {
          ...prev,
          [pageNumber]: {
            texts: page.texts.filter((t) => !textSet.has(t.id)),
            strokes: page.strokes.filter((s) => !strokeSet.has(s.id)),
            shapes: (page.shapes || []).filter((sh) => !shapeSet.has(sh.id)),
          },
        };
      });
    },
    [mutateAnnotations],
  );

  const handleSelectColor = useCallback(
    (hex: string) => {
      setActiveColor(hex);
      if (selectedObject?.type === 'text') {
        handleUpdateText(selectedObject.pageNumber, selectedObject.id, { color: hex }, true);
      } else if (selectedObject?.type === 'stroke') {
        handleUpdateStroke(selectedObject.pageNumber, selectedObject.id, { color: hex }, true);
      } else if (selectedObject?.type === 'shape') {
        handleUpdateShape(selectedObject.pageNumber, selectedObject.id, { color: hex }, true);
      }
    },
    [selectedObject, handleUpdateText, handleUpdateStroke, handleUpdateShape],
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

  const handleToggleShapeFilled = useCallback(() => {
    setActiveShapeFilled((prev) => {
      const next = !prev;
      if (selectedObject?.type === 'shape') {
        handleUpdateShape(selectedObject.pageNumber, selectedObject.id, { filled: next }, true);
      }
      return next;
    });
  }, [selectedObject, handleUpdateShape]);

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
    const page = annotationsRef.current[obj.pageNumber];
    if (!page) return;
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
        setActiveShapeFilled(Boolean(item.filled));
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
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setRedoStack((rStack) => [...rStack, cloneAnnotationsMap(annotationsRef.current)]);
      setAnnotations(previous);
      setSelectedObject(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((uStack) => [...uStack, cloneAnnotationsMap(annotationsRef.current)]);
      setAnnotations(next);
      setSelectedObject(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, []);

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
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: true,
      });

      const writeRes = await overwritePdfFileHandle(
        fileHandle,
        result.bytes,
        fileName || 'belge.pdf',
      );

      setHasUnsavedChanges(false);
      hasCorruptAttachmentRef.current = false;

      if (writeRes.status === 'overwritten') {
        showToast('success', `"${fileName}" düzenlenebilir olarak güncellendi.`);
      } else {
        showToast(
          'warning',
          'Bu tarayıcıda orijinal dosyanın üzerine yazılamıyor, kopya indirildi.',
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
  }, [fileHandle, fileName, fontAssets, notifyCanvasFallbackOnce, showToast]);

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
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: true,
      });

      const suggested = buildSuggestedName(fileName || 'belge.pdf', '-notlu');
      const saveRes = await savePdfBytesAs(result.bytes, suggested);

      if (saveRes.status === 'cancelled') {
        return;
      }

      setHasUnsavedChanges(false);
      hasCorruptAttachmentRef.current = false;
      setFileName(saveRes.fileName);

      if (saveRes.status === 'saved' && saveRes.handle) {
        setFileHandle(saveRes.handle);
        overwriteConfirmedRef.current = true;
        showToast('success', `"${saveRes.fileName}" düzenlenebilir olarak kaydedildi.`);
      } else {
        setFileHandle(null);
        showToast('success', `"${saveRes.fileName}" düzenlenebilir kopya olarak indirildi.`);
      }

      notifyCanvasFallbackOnce(result.usedCanvasFallback);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Farklı kaydetme sırasında hata oluştu.';
      showToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [fileName, fontAssets, isExporting, notifyCanvasFallbackOnce, showToast]);

  const handleExportFlatPdf = useCallback(async () => {
    const cleanBytes = cleanOriginalBytesRef.current;
    if (!cleanBytes || isExporting) return;

    setIsExporting(true);
    try {
      const result = await exportAnnotatedPdf(cleanBytes, annotationsRef.current, fontAssets, {
        includeEditableAttachments: false,
      });

      const saveRes = await savePdfBytesAs(result.bytes, 'duzenlenmis_dosya.pdf');

      if (saveRes.status === 'cancelled') {
        return;
      }

      showToast('success', `"${saveRes.fileName}" düz PDF olarak dışa aktarıldı.`);
      notifyCanvasFallbackOnce(result.usedCanvasFallback);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Düz PDF dışa aktarılırken hata oluştu.';
      showToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [fontAssets, isExporting, notifyCanvasFallbackOnce, showToast]);

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
      setZoom((prev) => clampZoom(prev + delta));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pdfDoc]);

  const handleWorkspaceScroll = useCallback(() => {
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

  const scrollToPage = useCallback((pageNum: number) => {
    const el = pageElementsRef.current.get(pageNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
    }
  }, []);

  const handleFitWidth = useCallback(() => {
    if (pagesMeta.length === 0) return;
    const currentMeta = pagesMeta[currentPage - 1] || pagesMeta[0];
    setZoom(computeFitWidthZoom(currentMeta.baseWidth));
  }, [pagesMeta, currentPage, computeFitWidthZoom]);

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

  const currentPageData = annotations[currentPage] || EMPTY_PAGE_ANNOTATIONS;
  const hasCurrentPageAnnotations =
    currentPageData.texts.length > 0 ||
    currentPageData.strokes.length > 0 ||
    (currentPageData.shapes?.length || 0) > 0;
  const hasAnyAnnotations = Object.values(annotations).some(
    (p) => p && (p.texts.length > 0 || p.strokes.length > 0 || (p.shapes?.length || 0) > 0),
  );

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
        activeShapeType={activeShapeType}
        activeShapeFilled={activeShapeFilled}
        activeStampType={activeStampType}
        stampSizeKey={stampSizeKey}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        hasCurrentPageAnnotations={hasCurrentPageAnnotations}
        hasAnyAnnotations={hasAnyAnnotations}
        isFullscreen={isFullscreen}
        isExporting={isExporting}
        onExitToSite={onExit ? handleRequestExit : undefined}
        onOpenPdfClick={handleOpenPdfClick}
        onPrevPage={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => scrollToPage(Math.min(pagesMeta.length, currentPage + 1))}
        onJumpToPage={scrollToPage}
        onZoomIn={() => setZoom((z) => clampZoom(z + 0.2))}
        onZoomOut={() => setZoom((z) => clampZoom(z - 0.2))}
        onFitWidth={handleFitWidth}
        onSelectTool={handleSelectTool}
        onSelectColor={handleSelectColor}
        onSelectFontSize={handleSelectFontSize}
        onToggleBold={handleToggleBold}
        onSelectPenWidth={handleSelectPenWidth}
        onSelectShapeType={setActiveShapeType}
        onToggleShapeFilled={handleToggleShapeFilled}
        onSelectStampType={handleSelectStampType}
        onSelectStampSize={setStampSizeKey}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRequestClearPage={() => setConfirmDialog({ kind: 'clear-page', pageNumber: currentPage })}
        onRequestClearAll={() => setConfirmDialog({ kind: 'clear-all' })}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSaveOverwrite={handleSaveOverwriteClick}
        onSaveAsEditable={handleSaveAsEditable}
        onExportFlatPdf={handleExportFlatPdf}
      />

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
                  PDF dosyanızı bu alana sürükleyip bırakın veya aşağıdan seçin. Tüm işlemler
                  yalnızca tarayıcınızda gerçekleşir; internetsiz ve yüksek hızda çalışır.
                </p>
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenPdfClick}
                  className="min-h-[44px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  PDF Dosyası Aç
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
                key={meta.pageNumber}
                pdfDoc={pdfDoc}
                meta={meta}
                zoom={zoom}
                renderZoom={renderZoom}
                toolMode={toolMode}
                activeColor={activeColor}
                activeFontSizeRatio={FONT_SIZE_RATIOS[fontSizeKey].ratio}
                activeBold={bold}
                activePenWidthRatio={PEN_WIDTH_RATIOS[penWidthKey].ratio}
                activeShapeType={activeShapeType}
                activeShapeFilled={activeShapeFilled}
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
    </div>
  );
};

export default PdfEditorApp;
