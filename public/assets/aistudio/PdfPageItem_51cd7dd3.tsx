// Tek bir PDF sayfasını lazy render + bağımsız SVG/metin katmanı ile yöneten bileşen
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type {
  PageAnnotations,
  StrokeAnnotation,
  StrokePoint,
  TextAnnotation,
  ToolMode,
} from '../types/pdf';
import {
  appendSmoothedPoint,
  buildSmoothSvgPath,
  isPointInsideText,
  isPointNearStroke,
} from '../utils/geometry';

interface PdfPageItemProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  baseWidth: number;
  baseHeight: number;
  /** Anlık görüntülenen zoom oranı (CSS boyutunu hemen günceller) */
  zoom: number;
  /** Debounce sonrası gerçek PDF.js render oranı */
  renderZoom: number;
  isVisible: boolean;
  annotations: PageAnnotations;
  toolMode: ToolMode;
  activeColor: string;
  activeFontSizeRatio: number;
  activeBold: boolean;
  activePenWidthRatio: number;
  selectedTextId: string | null;
  onSelectText: (pageNumber: number, textId: string | null) => void;
  onAddText: (pageNumber: number, item: TextAnnotation) => void;
  onUpdateText: (pageNumber: number, item: TextAnnotation, recordHistory?: boolean) => void;
  onDeleteText: (pageNumber: number, textId: string) => void;
  onAddStroke: (pageNumber: number, stroke: StrokeAnnotation) => void;
  onEraseAtPoint: (
    pageNumber: number,
    point: StrokePoint,
    pageWidthPx: number,
    pageHeightPx: number,
    isSessionStart: boolean,
  ) => void;
  onEndEraseSession: () => void;
  registerPageRef: (pageNumber: number, el: HTMLDivElement | null) => void;
}

interface DraftTextState {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSizeRatio: number;
  color: string;
  bold: boolean;
  isExisting: boolean;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function PdfPageItem({
  pdfDoc,
  pageNumber,
  baseWidth,
  baseHeight,
  zoom,
  renderZoom,
  isVisible,
  annotations,
  toolMode,
  activeColor,
  activeFontSizeRatio,
  activeBold,
  activePenWidthRatio,
  selectedTextId,
  onSelectText,
  onAddText,
  onUpdateText,
  onDeleteText,
  onAddStroke,
  onEraseAtPoint,
  onEndEraseSession,
  registerPageRef,
}: PdfPageItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Aktif çizim ve silme oturumu için referanslar
  const drawingPointsRef = useRef<StrokePoint[] | null>(null);
  const [liveStrokePoints, setLiveStrokePoints] = useState<StrokePoint[] | null>(null);
  const isErasingRef = useRef(false);
  const eraseStartedSnapshotRef = useRef(false);

  // Seçim modunda sürükleme durumu
  const dragStateRef = useRef<{
    textId: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
    moved: boolean;
    snapshotItem: TextAnnotation;
  } | null>(null);

  // Düzenlenmekte olan veya yeni açılan metin kutusu durumu
  const [draftText, setDraftText] = useState<DraftTextState | null>(null);

  const pageWidthPx = baseWidth * zoom;
  const pageHeightPx = baseHeight * zoom;

  // Sayfa container referansını üst bileşene bildir
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      registerPageRef(pageNumber, el);
    },
    [pageNumber, registerPageRef],
  );

  // Görünürlük ve debounced zoom'a göre PDF.js canvas render yönetimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Önceki devam eden render işlemini iptal et
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // iptal hatalarını yoksay
      }
      renderTaskRef.current = null;
    }

    // Sayfa görünüm alanının dışındaysa belleği serbest bırak
    if (!isVisible) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const viewport = page.getViewport({ scale: renderZoom * dpr });

        // Çok yüksek zoomlarda tarayıcı canvas bellek sınırını aşmamak için koruma
        const maxCanvasDim = 8192;
        const clampedScale =
          viewport.width > maxCanvasDim || viewport.height > maxCanvasDim
            ? Math.min(maxCanvasDim / viewport.width, maxCanvasDim / viewport.height)
            : 1;

        const targetW = Math.max(1, Math.floor(viewport.width * clampedScale));
        const targetH = Math.max(1, Math.floor(viewport.height * clampedScale));
        const finalViewport =
          clampedScale < 1
            ? page.getViewport({ scale: renderZoom * dpr * clampedScale })
            : viewport;

        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx || cancelled) return;

        ctx.clearRect(0, 0, targetW, targetH);

        const task = page.render({
          canvasContext: ctx,
          viewport: finalViewport,
        });
        renderTaskRef.current = task;

        await task.promise;
      } catch (err) {
        // RenderingCancelledException beklenen bir durumdur
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          return;
        }
      } finally {
        renderTaskRef.current = null;
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // yoksay
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, isVisible, renderZoom]);

  // Taslak metin açıldığında imleci hemen içine yerleştir
  useEffect(() => {
    if (draftText && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [draftText?.id]);

  // Araç değişirse açık taslağı kaydet ve bitir
  useEffect(() => {
    if (toolMode !== 'text' && toolMode !== 'select' && draftText) {
      commitDraftText();
    }
  }, [toolMode]);

  const getNormalizedPoint = (clientX: number, clientY: number): StrokePoint => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return { x: 0, y: 0 };
    }
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { x: nx, y: ny };
  };

  const commitDraftText = () => {
    if (!draftText) return;
    const trimmed = draftText.text.trim();

    if (draftText.isExisting) {
      if (!trimmed) {
        onDeleteText(pageNumber, draftText.id);
      } else {
        onUpdateText(
          pageNumber,
          {
            id: draftText.id,
            x: draftText.x,
            y: draftText.y,
            text: draftText.text.replace(/\s+$/, ''),
            fontSizeRatio: draftText.fontSizeRatio,
            color: draftText.color,
            bold: draftText.bold,
          },
          true,
        );
      }
    } else if (trimmed) {
      onAddText(pageNumber, {
        id: draftText.id,
        x: draftText.x,
        y: draftText.y,
        text: draftText.text.replace(/\s+$/, ''),
        fontSizeRatio: draftText.fontSizeRatio,
        color: draftText.color,
        bold: draftText.bold,
      });
    }

    setDraftText(null);
  };

  // Overlay katmanı pointer olayları (Kalem, Silgi, Yazı oluşturma, Seçim temizleme)
  const handleOverlayPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Yalnızca birincil fare tuşu veya dokunma/kalem
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    if (toolMode === 'pen') {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      drawingPointsRef.current = [pt];
      setLiveStrokePoints([pt]);
      return;
    }

    if (toolMode === 'eraser') {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      isErasingRef.current = true;
      eraseStartedSnapshotRef.current = false;
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      const hasHit =
        annotations.strokes.some((s) => isPointNearStroke(pt, s, pageWidthPx, pageHeightPx)) ||
        annotations.texts.some((t) => isPointInsideText(pt, t, pageWidthPx, pageHeightPx));
      if (hasHit) {
        onEraseAtPoint(pageNumber, pt, pageWidthPx, pageHeightPx, !eraseStartedSnapshotRef.current);
        eraseStartedSnapshotRef.current = true;
      }
      return;
    }

    if (toolMode === 'text') {
      if (draftText) {
        commitDraftText();
        return;
      }
      e.preventDefault();
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      // Sağ/alt kenara çok yakın tıklanırsa taşmayı önle
      const clampedX = Math.min(0.92, pt.x);
      const clampedY = Math.min(0.95, pt.y);
      const newId = createId();
      setDraftText({
        id: newId,
        x: clampedX,
        y: clampedY,
        text: '',
        fontSizeRatio: activeFontSizeRatio,
        color: activeColor,
        bold: activeBold,
        isExisting: false,
      });
      onSelectText(pageNumber, null);
      return;
    }

    if (toolMode === 'select') {
      // Boş yere tıklanınca yeni yazı kutusu AÇMAZ, yalnızca mevcut seçimi temizler
      if (draftText) {
        commitDraftText();
      }
      onSelectText(pageNumber, null);
    }
  };

  const handleOverlayPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (toolMode === 'pen' && drawingPointsRef.current) {
      e.preventDefault();
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      const next = appendSmoothedPoint(drawingPointsRef.current, pt);
      if (next !== drawingPointsRef.current) {
        drawingPointsRef.current = next;
        setLiveStrokePoints(next);
      }
      return;
    }

    if (toolMode === 'eraser' && isErasingRef.current) {
      e.preventDefault();
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      onEraseAtPoint(pageNumber, pt, pageWidthPx, pageHeightPx, !eraseStartedSnapshotRef.current);
      eraseStartedSnapshotRef.current = true;
    }
  };

  const handleOverlayPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (toolMode === 'pen' && drawingPointsRef.current) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      const finalPoints = drawingPointsRef.current;
      drawingPointsRef.current = null;
      setLiveStrokePoints(null);

      if (finalPoints.length > 0) {
        onAddStroke(pageNumber, {
          id: createId(),
          points: finalPoints,
          color: activeColor,
          widthRatio: activePenWidthRatio,
        });
      }
      return;
    }

    if (toolMode === 'eraser' && isErasingRef.current) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      isErasingRef.current = false;
      eraseStartedSnapshotRef.current = false;
      onEndEraseSession();
    }
  };

  // Metin kutusu sürükleme olayları (İmleç/Seç modunda)
  const handleTextPointerDown = (e: ReactPointerEvent<HTMLDivElement>, item: TextAnnotation) => {
    if (toolMode === 'eraser') {
      // Silgi modundaysa olayın arka katmana geçip silmesini sağla
      return;
    }
    if (toolMode !== 'select') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.stopPropagation();
    onSelectText(pageNumber, item.id);

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      textId: item.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: item.x,
      origY: item.y,
      moved: false,
      snapshotItem: item,
    };
  };

  const handleTextPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || toolMode !== 'select') return;

    const dxPx = e.clientX - drag.startClientX;
    const dyPx = e.clientY - drag.startClientY;
    if (!drag.moved && Math.hypot(dxPx, dyPx) < 3) return;

    drag.moved = true;
    const newX = Math.max(0, Math.min(0.96, drag.origX + dxPx / pageWidthPx));
    const newY = Math.max(0, Math.min(0.96, drag.origY + dyPx / pageHeightPx));

    onUpdateText(
      pageNumber,
      {
        ...drag.snapshotItem,
        x: newX,
        y: newY,
      },
      false,
    );
  };

  const handleTextPointerUp = (e: ReactPointerEvent<HTMLDivElement>, currentItem: TextAnnotation) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current = null;

    if (drag.moved) {
      // Taşıma tamamlandı: geri alma geçmişine kaydet (başlangıç konumunu koruyarak)
      onUpdateText(pageNumber, currentItem, true);
    }
  };

  // Araç moduna göre imleç stili
  const cursorClass =
    toolMode === 'pen'
      ? 'cursor-crosshair'
      : toolMode === 'text'
        ? 'cursor-text'
        : toolMode === 'eraser'
          ? 'cursor-cell'
          : 'cursor-default';

  const touchActionClass =
    toolMode === 'pen' || toolMode === 'eraser' ? 'touch-none' : 'touch-auto';

  const draftLines = draftText ? draftText.text.split(/\r?\n/) : [];
  const draftCols = draftText
    ? Math.max(12, ...draftLines.map((l) => l.length + 2))
    : 12;

  return (
    <div
      ref={setRefs}
      data-page-number={pageNumber}
      style={{
        width: `${pageWidthPx}px`,
        height: `${pageHeightPx}px`,
      }}
      className="relative shrink-0 bg-white shadow-md ring-1 ring-slate-300/80 select-none overflow-hidden"
    >
      {/* 1. PDF Sayfa Canvas Katmanı */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />

      {/* Sayfa numarası küçük köşe belirteci sadece sayfa henüz render edilmemişken gösterilir */}
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 pointer-events-none">
          Sayfa {pageNumber}
        </div>
      )}

      {/* 2. Serbest Çizim SVG Katmanı (Zoom sırasında daima keskin kalır) */}
      <svg
        width={pageWidthPx}
        height={pageHeightPx}
        viewBox={`0 0 ${pageWidthPx} ${pageHeightPx}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {annotations.strokes.map((stroke) => (
          <path
            key={stroke.id}
            d={buildSmoothSvgPath(stroke.points, pageWidthPx, pageHeightPx)}
            fill="none"
            stroke={stroke.color}
            strokeWidth={Math.max(1, stroke.widthRatio * pageWidthPx)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {liveStrokePoints && liveStrokePoints.length > 0 && (
          <path
            d={buildSmoothSvgPath(liveStrokePoints, pageWidthPx, pageHeightPx)}
            fill="none"
            stroke={activeColor}
            strokeWidth={Math.max(1, activePenWidthRatio * pageWidthPx)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* 3. Etkileşimli İşaretçi Katmanı (Kalem / Silgi / Yazı tıklama) */}
      <div
        onPointerDown={handleOverlayPointerDown}
        onPointerMove={handleOverlayPointerMove}
        onPointerUp={handleOverlayPointerUp}
        onPointerCancel={handleOverlayPointerUp}
        className={`absolute inset-0 ${cursorClass} ${touchActionClass}`}
      />

      {/* 4. Sayfa İçi Metin Notları Katmanı */}
      {annotations.texts.map((item) => {
        const isBeingEdited = draftText?.id === item.id;
        if (isBeingEdited) return null;

        const isSelected = toolMode === 'select' && selectedTextId === item.id;
        const fontSizePx = item.fontSizeRatio * pageHeightPx;

        return (
          <div
            key={item.id}
            onPointerDown={(e) => handleTextPointerDown(e, item)}
            onPointerMove={handleTextPointerMove}
            onPointerUp={(e) => handleTextPointerUp(e, item)}
            onDoubleClick={(e) => {
              if (toolMode !== 'select' && toolMode !== 'text') return;
              e.stopPropagation();
              onSelectText(pageNumber, item.id);
              setDraftText({
                id: item.id,
                x: item.x,
                y: item.y,
                text: item.text,
                fontSizeRatio: item.fontSizeRatio,
                color: item.color,
                bold: item.bold,
                isExisting: true,
              });
            }}
            style={{
              left: `${item.x * 100}%`,
              top: `${item.y * 100}%`,
              fontSize: `${fontSizePx}px`,
              lineHeight: 1.25,
              color: item.color,
              fontWeight: item.bold ? 700 : 400,
              whiteSpace: 'pre',
              pointerEvents: toolMode === 'pen' || toolMode === 'eraser' ? 'none' : 'auto',
            }}
            className={`pdf-text-overlay absolute bg-transparent m-0 p-0 ${
              toolMode === 'select' ? 'cursor-move' : 'cursor-text'
            } ${
              isSelected
                ? 'outline-1 outline-dashed outline-blue-600 bg-blue-50/15'
                : 'border-none outline-none'
            }`}
          >
            {item.text}
          </div>
        );
      })}

      {/* 5. Aktif Düzenlenen Metin Kutusu (İnce kesikli çerçeveli, sabitlenince çerçevesiz) */}
      {draftText && (
        <textarea
          ref={textareaRef}
          value={draftText.text}
          rows={Math.max(1, draftLines.length)}
          cols={draftCols}
          placeholder="Yazın..."
          onChange={(e) => setDraftText({ ...draftText, text: e.target.value })}
          onBlur={commitDraftText}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitDraftText();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setDraftText(null);
            }
          }}
          style={{
            left: `${draftText.x * 100}%`,
            top: `${draftText.y * 100}%`,
            fontSize: `${draftText.fontSizeRatio * pageHeightPx}px`,
            lineHeight: 1.25,
            color: draftText.color,
            fontWeight: draftText.bold ? 700 : 400,
            whiteSpace: 'pre',
          }}
          className="pdf-text-overlay absolute m-0 p-0 bg-transparent border border-dashed border-blue-600 outline-none resize-none overflow-hidden min-w-[80px]"
        />
      )}
    </div>
  );
}
