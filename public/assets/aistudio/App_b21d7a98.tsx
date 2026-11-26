// Ana uygulama bileşeni: PDF yükleme, sürekli dikey kaydırma, zoom, sayfa bazlı not katmanları, geçmiş ve dışa aktarma
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from 'react';
import { UploadCloudIcon } from './components/Icons';
import { PdfPageItem } from './components/PdfPageItem';
import { SettingsModal } from './components/SettingsModal';
import { Toolbar } from './components/Toolbar';
import {
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  PEN_WIDTH_RATIOS,
  type AnnotationsMap,
  type FontAssets,
  type FontSizePreset,
  type PageAnnotations,
  type PageBaseDimension,
  type PenWidthPreset,
  type StrokeAnnotation,
  type StrokePoint,
  type TextAnnotation,
  type ToolMode,
} from './types/pdf';
import { savePdfBytesToDevice } from './utils/fileSave';
import { loadDefaultLocalFonts } from './utils/fontManager';
import { isPointInsideText, isPointNearStroke } from './utils/geometry';
import { exportAnnotatedPdf } from './utils/pdfExporter';
import { ensurePdfWorkerConfigured } from './utils/pdfWorker';

const EMPTY_PAGE_ANNOTATIONS: PageAnnotations = { texts: [], strokes: [] };
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.2;

interface NoticeBanner {
  type: 'error' | 'info' | 'success';
  text: string;
}

function clampZoom(val: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(val * 100) / 100));
}

export default function App() {
  const appRootRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Orijinal PDF baytları (pdf-lib için bozulmadan saklanır) ve PDF.js belge örneği
  const originalPdfBytesRef = useRef<Uint8Array | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [pageDimensions, setPageDimensions] = useState<PageBaseDimension[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);

  // Görünüm durumları
  const [zoom, setZoom] = useState<number>(1);
  const [renderZoom, setRenderZoom] = useState<number>(1);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([1, 2]));
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Araç ve biçimlendirme durumları
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [activeColor, setActiveColor] = useState<string>(COLOR_OPTIONS[0].value);
  const [fontSizePreset, setFontSizePreset] = useState<FontSizePreset>('medium');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [penWidthPreset, setPenWidthPreset] = useState<PenWidthPreset>('medium');

  // Sayfa bazlı not katmanları ve Geri Al / Yinele yığınları
  const [annotations, setAnnotations] = useState<AnnotationsMap>({});
  const [undoStack, setUndoStack] = useState<AnnotationsMap[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationsMap[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<{ pageNumber: number; id: string } | null>(null);

  // Sürükleme / silme sırasında geçici başlangıç anlık görüntüsü
  const dragBaselineRef = useRef<AnnotationsMap | null>(null);
  const eraseBaselineRef = useRef<AnnotationsMap | null>(null);
  const eraseDidChangeRef = useRef<boolean>(false);

  // Sayfa DOM referansları (scroll ve IntersectionObserver için)
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Font, ayar penceresi, sürükle-bırak ve bildirim durumları
  const [fontAssets, setFontAssets] = useState<FontAssets>({
    regularBytes: null,
    boldBytes: null,
    regularLabel: 'Kontrol ediliyor...',
    boldLabel: 'Kontrol ediliyor...',
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<NoticeBanner | null>(null);
  const fallbackNoticeShownRef = useRef<boolean>(false);

  const showNotice = useCallback((type: NoticeBanner['type'], text: string, durationMs = 5000) => {
    setNotice({ type, text });
    if (durationMs > 0) {
      window.setTimeout(() => {
        setNotice((prev) => (prev?.text === text ? null : prev));
      }, durationMs);
    }
  }, []);

  // Başlangıçta yerel Noto Sans fontlarını sessizce kontrol et
  const refreshDefaultFonts = useCallback(async () => {
    const loaded = await loadDefaultLocalFonts();
    setFontAssets(loaded);
  }, []);

  useEffect(() => {
    refreshDefaultFonts();
  }, [refreshDefaultFonts]);

  // Kaydedilmemiş değişiklik varsa sekme kapatma/yenileme uyarısı
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Tam ekran durumu senkronizasyonu (Esc tuşu dahil)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Zoom değiştiğinde debounced yüksek kaliteli canvas yeniden çizimi
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRenderZoom(zoom);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [zoom]);

  // Görünür sayfaları izleyen IntersectionObserver kurulumu
  useEffect(() => {
    const rootEl = workspaceRef.current;
    if (!rootEl || pageDimensions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          const next = new Set(prev);
          let changed = false;
          for (const entry of entries) {
            const pageAttr = entry.target.getAttribute('data-page-number');
            const pageNum = pageAttr ? parseInt(pageAttr, 10) : NaN;
            if (Number.isNaN(pageNum)) continue;
            if (entry.isIntersecting) {
              if (!next.has(pageNum)) {
                next.add(pageNum);
                changed = true;
              }
            } else if (next.has(pageNum)) {
              next.delete(pageNum);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      {
        root: rootEl,
        rootMargin: '600px 0px',
        threshold: 0.01,
      },
    );

    observerRef.current = observer;
    pageElementsRef.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [pageDimensions]);

  const registerPageRef = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
    const prevEl = pageElementsRef.current.get(pageNumber);
    if (prevEl && observerRef.current) {
      observerRef.current.unobserve(prevEl);
    }

    if (el) {
      pageElementsRef.current.set(pageNumber, el);
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    } else {
      pageElementsRef.current.delete(pageNumber);
    }
  }, []);

  // Ekranın ortasına en yakın sayfayı otomatik aktif sayfa olarak güncelle
  useEffect(() => {
    const rootEl = workspaceRef.current;
    if (!rootEl || pageDimensions.length === 0) return;

    let rafId = 0;

    const updateCurrentPageFromScroll = () => {
      rafId = 0;
      const containerRect = rootEl.getBoundingClientRect();
      const viewportCenterY = containerRect.top + containerRect.height / 2;

      let closestPage = 1;
      let minDistance = Infinity;

      pageElementsRef.current.forEach((el, pageNum) => {
        const rect = el.getBoundingClientRect();
        const pageCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(pageCenterY - viewportCenterY);
        if (dist < minDistance) {
          minDistance = dist;
          closestPage = pageNum;
        }
      });

      setCurrentPage(closestPage);
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateCurrentPageFromScroll);
      }
    };

    rootEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      rootEl.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pageDimensions]);

  // Zoom değişirken odak noktasını koruyarak yumuşak ölçekleme uygula
  const applyZoom = useCallback(
    (nextZoomRaw: number) => {
      const nextZoom = clampZoom(nextZoomRaw);
      const container = workspaceRef.current;

      setZoom((prevZoom) => {
        if (prevZoom === nextZoom) return prevZoom;

        if (container && prevZoom > 0) {
          const ratio = nextZoom / prevZoom;
          const centerY = container.scrollTop + container.clientHeight / 2;
          const centerX = container.scrollLeft + container.clientWidth / 2;
          window.requestAnimationFrame(() => {
            if (!workspaceRef.current) return;
            workspaceRef.current.scrollTop = centerY * ratio - workspaceRef.current.clientHeight / 2;
            workspaceRef.current.scrollLeft = centerX * ratio - workspaceRef.current.clientWidth / 2;
          });
        }

        return nextZoom;
      });
    },
    [],
  );

  // Ctrl + Fare Tekerleği ile zoom (tarayıcının kendi zoom'u engellenir)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      if (!pdfDocRef.current) return;

      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      applyZoom(zoom + delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoom, applyZoom]);

  // Genişliğe sığdır (Fit-Width) hesaplaması
  const calculateFitWidthZoom = useCallback((firstPageWidth: number): number => {
    const container = workspaceRef.current;
    const availableWidth = container ? Math.max(320, container.clientWidth - 48) : window.innerWidth - 48;
    return clampZoom(availableWidth / firstPageWidth);
  }, []);

  const handleFitWidth = useCallback(() => {
    if (pageDimensions.length === 0) return;
    applyZoom(calculateFitWidthZoom(pageDimensions[0].width));
  }, [pageDimensions, calculateFitWidthZoom, applyZoom]);

  // Yerel PDF dosyasını yükle ve tüm sayfaların temel boyutlarını oku
  const loadPdfFile = useCallback(
    async (file: File) => {
      setNotice(null);

      // Uzantı ve MIME türü ön kontrolü
      const lowerName = file.name.toLowerCase();
      if (file.type && file.type !== 'application/pdf' && !lowerName.endsWith('.pdf')) {
        showNotice('error', 'Lütfen geçerli bir PDF (.pdf) dosyası seçin.');
        return;
      }

      setIsLoadingPdf(true);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const rawBytes = new Uint8Array(arrayBuffer);

        // %PDF- imza kontrolü (bozuk veya PDF olmayan dosyaları hızlı yakalar)
        const headerSlice = new TextDecoder('ascii').decode(rawBytes.slice(0, 1024));
        if (!headerSlice.includes('%PDF-')) {
          throw new Error('INVALID_PDF');
        }

        const pdfjsLib = ensurePdfWorkerConfigured();
        // PDF.js worker'a ayrı bir kopya gönderilir; orijinal baytlar export için saklanır
        const pdfJsCopy = rawBytes.slice(0);
        const loadingTask = pdfjsLib.getDocument({ data: pdfJsCopy });
        const loadedDoc = await loadingTask.promise;

        // Tüm sayfaların 1x boyutlarını topla
        const dims: PageBaseDimension[] = [];
        for (let p = 1; p <= loadedDoc.numPages; p++) {
          const page = await loadedDoc.getPage(p);
          const vp = page.getViewport({ scale: 1 });
          dims.push({ pageNumber: p, width: vp.width, height: vp.height });
        }

        // Önceki PDF örneğini temizle
        if (pdfDocRef.current) {
          try {
            await pdfDocRef.current.destroy();
          } catch {
            // yoksay
          }
        }

        originalPdfBytesRef.current = rawBytes;
        pdfDocRef.current = loadedDoc;

        const initialFit = dims.length > 0 ? calculateFitWidthZoom(dims[0].width) : 1;

        setPdfDoc(loadedDoc);
        setFileName(file.name);
        setPageDimensions(dims);
        setCurrentPage(1);
        setVisiblePages(new Set([1, 2]));
        setZoom(initialFit);
        setRenderZoom(initialFit);
        setAnnotations({});
        setUndoStack([]);
        setRedoStack([]);
        setSelectedText(null);
        setHasUnsavedChanges(false);

        if (workspaceRef.current) {
          workspaceRef.current.scrollTop = 0;
        }
      } catch (err) {
        const errName = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
        const errMsg = err instanceof Error ? err.message : '';

        if (errName === 'PasswordException' || errMsg.toLowerCase().includes('password')) {
          showNotice('error', 'Şifreli veya parola korumalı PDF dosyaları açılamıyor.');
        } else if (errMsg === 'INVALID_PDF' || errName === 'InvalidPDFException') {
          showNotice('error', 'Seçilen dosya geçerli bir PDF belgesi değil.');
        } else {
          showNotice('error', 'PDF dosyası bozuk olabilir veya okunamadı.');
        }
      } finally {
        setIsLoadingPdf(false);
      }
    },
    [calculateFitWidthZoom, showNotice],
  );

  // Sayfaya yumuşak kaydırma
  const scrollToPage = useCallback((targetPage: number) => {
    const el = pageElementsRef.current.get(targetPage);
    const container = workspaceRef.current;
    if (!el || !container) return;

    const topOffset = el.offsetTop - 20;
    container.scrollTo({
      top: Math.max(0, topOffset),
      behavior: 'smooth',
    });
  }, []);

  // Tam ekran geçişi (iframe içinde kısıtlıysa güvenli bilgi mesajı gösterir)
  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const target = appRootRef.current || document.documentElement;
        if (!target.requestFullscreen) {
          throw new Error('FULLSCREEN_UNSUPPORTED');
        }
        await target.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      showNotice(
        'info',
        'Önizlemede tam ekran kısıtlı olabilir, uygulamayı yeni sekmede aç.',
        6000,
      );
    }
  }, [showNotice]);

  // Geçmiş yardımcıları
  const commitNewAnnotations = useCallback(
    (updater: (prev: AnnotationsMap) => AnnotationsMap) => {
      setAnnotations((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        setUndoStack((stack) => [...stack.slice(-99), prev]);
        setRedoStack([]);
        setHasUnsavedChanges(true);
        return next;
      });
    },
    [],
  );

  const handleUndo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setAnnotations((curr) => {
        setRedoStack((rStack) => [...rStack.slice(-99), curr]);
        return previous;
      });
      setSelectedText(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const nextState = stack[stack.length - 1];
      setAnnotations((curr) => {
        setUndoStack((uStack) => [...uStack.slice(-99), curr]);
        return nextState;
      });
      setSelectedText(null);
      setHasUnsavedChanges(true);
      return stack.slice(0, -1);
    });
  }, []);

  // Not ekleme, güncelleme, silme işleyicileri
  const handleAddText = useCallback(
    (pageNumber: number, item: TextAnnotation) => {
      commitNewAnnotations((prev) => {
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
    [commitNewAnnotations],
  );

  const handleUpdateText = useCallback(
    (pageNumber: number, item: TextAnnotation, recordHistory = true) => {
      if (!recordHistory) {
        // Sürükleme sırasında yalnızca ilk adımda başlangıç anlık görüntüsünü al
        setAnnotations((prev) => {
          if (dragBaselineRef.current === null) {
            dragBaselineRef.current = prev;
          }
          const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
          return {
            ...prev,
            [pageNumber]: {
              ...page,
              texts: page.texts.map((t) => (t.id === item.id ? item : t)),
            },
          };
        });
        return;
      }

      if (dragBaselineRef.current !== null) {
        const baseline = dragBaselineRef.current;
        dragBaselineRef.current = null;
        setAnnotations((prev) => {
          const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
          const next = {
            ...prev,
            [pageNumber]: {
              ...page,
              texts: page.texts.map((t) => (t.id === item.id ? item : t)),
            },
          };
          setUndoStack((stack) => [...stack.slice(-99), baseline]);
          setRedoStack([]);
          setHasUnsavedChanges(true);
          return next;
        });
        return;
      }

      commitNewAnnotations((prev) => {
        const page = prev[pageNumber] || EMPTY_PAGE_ANNOTATIONS;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            texts: page.texts.map((t) => (t.id === item.id ? item : t)),
          },
        };
      });
    },
    [commitNewAnnotations],
  );

  const handleDeleteText = useCallback(
    (pageNumber: number, textId: string) => {
      commitNewAnnotations((prev) => {
        const page = prev[pageNumber];
        if (!page) return prev;
        const filtered = page.texts.filter((t) => t.id !== textId);
        if (filtered.length === page.texts.length) return prev;
        return {
          ...prev,
          [pageNumber]: {
            ...page,
            texts: filtered,
          },
        };
      });
      setSelectedText((curr) =>
        curr && curr.pageNumber === pageNumber && curr.id === textId ? null : curr,
      );
    },
    [commitNewAnnotations],
  );

  const handleAddStroke = useCallback(
    (pageNumber: number, stroke: StrokeAnnotation) => {
      commitNewAnnotations((prev) => {
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
    [commitNewAnnotations],
  );

  const handleEraseAtPoint = useCallback(
    (
      pageNumber: number,
      point: StrokePoint,
      pageWidthPx: number,
      pageHeightPx: number,
      isSessionStart: boolean,
    ) => {
      setAnnotations((prev) => {
        if (isSessionStart && eraseBaselineRef.current === null) {
          eraseBaselineRef.current = prev;
          eraseDidChangeRef.current = false;
        }
        const page = prev[pageNumber];
        if (!page) return prev;

        const nextStrokes = page.strokes.filter(
          (s) => !isPointNearStroke(point, s, pageWidthPx, pageHeightPx),
        );
        const nextTexts = page.texts.filter(
          (t) => !isPointInsideText(point, t, pageWidthPx, pageHeightPx),
        );

        if (
          nextStrokes.length === page.strokes.length &&
          nextTexts.length === page.texts.length
        ) {
          return prev;
        }

        eraseDidChangeRef.current = true;
        return {
          ...prev,
          [pageNumber]: {
            texts: nextTexts,
            strokes: nextStrokes,
          },
        };
      });
    },
    [],
  );

  const handleEndEraseSession = useCallback(() => {
    if (eraseBaselineRef.current !== null && eraseDidChangeRef.current) {
      const baseline = eraseBaselineRef.current;
      setUndoStack((stack) => [...stack.slice(-99), baseline]);
      setRedoStack([]);
      setHasUnsavedChanges(true);
    }
    eraseBaselineRef.current = null;
    eraseDidChangeRef.current = false;
  }, []);

  // Seçili nesne varsa renk / boyut / kalın değişikliklerini ona da uygula
  const handleChangeColor = useCallback(
    (color: string) => {
      setActiveColor(color);
      if (!selectedText) return;
      const existing = annotations[selectedText.pageNumber]?.texts.find(
        (t) => t.id === selectedText.id,
      );
      if (existing && existing.color !== color) {
        handleUpdateText(selectedText.pageNumber, { ...existing, color }, true);
      }
    },
    [selectedText, annotations, handleUpdateText],
  );

  const handleChangeFontSize = useCallback(
    (preset: FontSizePreset) => {
      setFontSizePreset(preset);
      const ratio = FONT_SIZE_RATIOS[preset].ratio;
      if (!selectedText) return;
      const existing = annotations[selectedText.pageNumber]?.texts.find(
        (t) => t.id === selectedText.id,
      );
      if (existing && existing.fontSizeRatio !== ratio) {
        handleUpdateText(selectedText.pageNumber, { ...existing, fontSizeRatio: ratio }, true);
      }
    },
    [selectedText, annotations, handleUpdateText],
  );

  const handleToggleBold = useCallback(() => {
    setIsBold((prev) => {
      const nextBold = !prev;
      if (selectedText) {
        const existing = annotations[selectedText.pageNumber]?.texts.find(
          (t) => t.id === selectedText.id,
        );
        if (existing && existing.bold !== nextBold) {
          handleUpdateText(selectedText.pageNumber, { ...existing, bold: nextBold }, true);
        }
      }
      return nextBold;
    });
  }, [selectedText, annotations, handleUpdateText]);

  // Seçim değiştiğinde araç çubuğundaki biçim değerlerini seçili metinle eşitle
  const handleSelectText = useCallback(
    (pageNumber: number, textId: string | null) => {
      if (!textId) {
        setSelectedText(null);
        return;
      }
      setSelectedText({ pageNumber, id: textId });
      const item = annotations[pageNumber]?.texts.find((t) => t.id === textId);
      if (item) {
        setActiveColor(item.color);
        setIsBold(item.bold);
        const matchedPreset = (Object.keys(FONT_SIZE_RATIOS) as FontSizePreset[]).find(
          (k) => Math.abs(FONT_SIZE_RATIOS[k].ratio - item.fontSizeRatio) < 0.002,
        );
        if (matchedPreset) setFontSizePreset(matchedPreset);
      }
    },
    [annotations],
  );

  // Klavye kısayolları: Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z ve Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditingInput =
        activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement;

      if (isEditingInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && toolMode === 'select' && selectedText) {
        e.preventDefault();
        handleDeleteText(selectedText.pageNumber, selectedText.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, toolMode, selectedText, handleDeleteText]);

  // PDF Olarak Kaydet (pdf-lib + fontkit / yedek PNG)
  const handleSavePdf = useCallback(async () => {
    if (!originalPdfBytesRef.current || isSaving) return;

    setIsSaving(true);
    try {
      const { bytes, usedCanvasFallback } = await exportAnnotatedPdf(
        originalPdfBytesRef.current,
        annotations,
        fontAssets,
      );

      const saveResult = await savePdfBytesToDevice(bytes, 'duzenlenmis_dosya.pdf');
      if (saveResult.cancelled) {
        return;
      }

      setHasUnsavedChanges(false);

      if (usedCanvasFallback && !fallbackNoticeShownRef.current) {
        fallbackNoticeShownRef.current = true;
        showNotice('info', 'Metinler resim olarak işlendi.', 5500);
      } else {
        showNotice('success', 'PDF başarıyla kaydedildi.', 3500);
      }
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? err.message : 'PDF kaydedilirken beklenmeyen bir hata oluştu.',
        6000,
      );
    } finally {
      setIsSaving(false);
    }
  }, [annotations, fontAssets, isSaving, showNotice]);

  // Sürükle-bırak dosya açma olayları
  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      loadPdfFile(droppedFile);
    }
  };

  const activeFontSizeRatio = FONT_SIZE_RATIOS[fontSizePreset].ratio;
  const activePenWidthRatio = PEN_WIDTH_RATIOS[penWidthPreset].ratio;

  const noticeClass = useMemo(() => {
    if (!notice) return '';
    if (notice.type === 'error') return 'bg-red-50 border-red-300 text-red-900';
    if (notice.type === 'success') return 'bg-emerald-50 border-emerald-300 text-emerald-900';
    return 'bg-amber-50 border-amber-300 text-amber-900';
  }, [notice]);

  return (
    <div
      ref={appRootRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-200 text-slate-900"
    >
      {/* Gizli dosya seçici */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) loadPdfFile(selected);
          e.target.value = '';
        }}
      />

      {/* Sabit Üst Araç Çubuğu */}
      <Toolbar
        hasDocument={Boolean(pdfDoc)}
        fileName={fileName}
        currentPage={currentPage}
        numPages={pageDimensions.length}
        zoom={zoom}
        isFullscreen={isFullscreen}
        toolMode={toolMode}
        activeColor={activeColor}
        fontSizePreset={fontSizePreset}
        isBold={isBold}
        penWidthPreset={penWidthPreset}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenFileClick={() => fileInputRef.current?.click()}
        onPrevPage={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => scrollToPage(Math.min(pageDimensions.length, currentPage + 1))}
        onJumpToPage={scrollToPage}
        onZoomIn={() => applyZoom(zoom + ZOOM_STEP)}
        onZoomOut={() => applyZoom(zoom - ZOOM_STEP)}
        onFitWidth={handleFitWidth}
        onToggleFullscreen={handleToggleFullscreen}
        onSelectTool={(mode) => {
          setToolMode(mode);
          if (mode !== 'select') setSelectedText(null);
        }}
        onChangeColor={handleChangeColor}
        onChangeFontSize={handleChangeFontSize}
        onToggleBold={handleToggleBold}
        onChangePenWidth={setPenWidthPreset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSavePdf={handleSavePdf}
      />

      {/* Sayfa İçi Bildirim Çubuğu */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-40 max-w-md">
          <div
            role="status"
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${noticeClass}`}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Bildirimi kapat"
              className="text-xs underline opacity-75 hover:opacity-100 shrink-0 cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Sürükle-Bırak Kaplama Ekranı */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/15 backdrop-blur-xs pointer-events-none">
          <div className="rounded-2xl bg-white border-2 border-dashed border-blue-600 px-10 py-8 shadow-xl text-center">
            <UploadCloudIcon className="w-12 h-12 mx-auto text-blue-600 mb-3" />
            <p className="text-base font-semibold text-slate-900">PDF dosyasını buraya bırakın</p>
            <p className="text-xs text-slate-500 mt-1">Belge tamamen cihazınızda açılır</p>
          </div>
        </div>
      )}

      {/* Ana Kaydırılabilir PDF Çalışma Alanı */}
      <main
        ref={workspaceRef}
        className="flex-1 w-full overflow-auto workspace-scroll relative"
      >
        {!pdfDoc ? (
          <div className="h-full w-full flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <UploadCloudIcon className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  Çevrimdışı PDF Görüntüleyici ve Not Editörü
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PDF dosyanızı açın; sayfalar üzerine yazı yazın, serbest çizim yapın ve değişiklikleri
                  yeni bir PDF olarak kaydedin.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={isLoadingPdf}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoadingPdf ? 'PDF Yükleniyor...' : 'PDF Dosyası Seç'}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Veya bir <code>.pdf</code> dosyasını bu pencereye sürükleyip bırakın. İnternet bağlantısı gerekmez.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-full w-max mx-auto flex flex-col items-center gap-6 py-6 px-6">
            {pageDimensions.map((dim) => (
              <PdfPageItem
                key={dim.pageNumber}
                pdfDoc={pdfDoc}
                pageNumber={dim.pageNumber}
                baseWidth={dim.width}
                baseHeight={dim.height}
                zoom={zoom}
                renderZoom={renderZoom}
                isVisible={visiblePages.has(dim.pageNumber)}
                annotations={annotations[dim.pageNumber] || EMPTY_PAGE_ANNOTATIONS}
                toolMode={toolMode}
                activeColor={activeColor}
                activeFontSizeRatio={activeFontSizeRatio}
                activeBold={isBold}
                activePenWidthRatio={activePenWidthRatio}
                selectedTextId={
                  selectedText && selectedText.pageNumber === dim.pageNumber
                    ? selectedText.id
                    : null
                }
                onSelectText={handleSelectText}
                onAddText={handleAddText}
                onUpdateText={handleUpdateText}
                onDeleteText={handleDeleteText}
                onAddStroke={handleAddStroke}
                onEraseAtPoint={handleEraseAtPoint}
                onEndEraseSession={handleEndEraseSession}
                registerPageRef={registerPageRef}
              />
            ))}
          </div>
        )}
      </main>

      {/* Font Seçimi ve Yardım Penceresi */}
      <SettingsModal
        isOpen={isSettingsOpen}
        fontAssets={fontAssets}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateFonts={setFontAssets}
        onResetDefaultFonts={refreshDefaultFonts}
      />
    </div>
  );
}
