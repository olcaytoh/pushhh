// Tek bir PDF sayfasının tembel (lazy) canvas render'ı ve sayfaya gömülü SVG çizim + metin katmanı
import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api';
import type {
  PageAnnotations,
  PageMeta,
  SelectedObject,
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
  meta: PageMeta;
  zoom: number;
  renderZoom: number;
  toolMode: ToolMode;
  activeColor: string;
  activeFontSizeRatio: number;
  activeBold: boolean;
  activePenWidthRatio: number;
  annotations: PageAnnotations;
  selectedObject: SelectedObject | null;
  onSelectObject: (obj: SelectedObject | null) => void;
  onAddText: (pageNumber: number, item: TextAnnotation) => void;
  onUpdateText: (pageNumber: number, id: string, patch: Partial<TextAnnotation>, recordUndo?: boolean) => void;
  onDeleteText: (pageNumber: number, id: string) => void;
  onAddStroke: (pageNumber: number, stroke: StrokeAnnotation) => void;
  onDeleteStroke: (pageNumber: number, id: string) => void;
  onEraseBatch: (pageNumber: number, textIds: string[], strokeIds: string[]) => void;
  registerPageElement: (pageNumber: number, el: HTMLDivElement | null) => void;
}

interface ActiveTextEditorState {
  id: string | null;
  x: number;
  y: number;
  text: string;
  fontSizeRatio: number;
  color: string;
  bold: boolean;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const PdfPageItem: React.FC<PdfPageItemProps> = ({
  pdfDoc,
  meta,
  zoom,
  renderZoom,
  toolMode,
  activeColor,
  activeFontSizeRatio,
  activeBold,
  activePenWidthRatio,
  annotations,
  selectedObject,
  onSelectObject,
  onAddText,
  onUpdateText,
  onDeleteText,
  onAddStroke,
  onDeleteStroke,
  onEraseBatch,
  registerPageElement,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [isNearViewport, setIsNearViewport] = useState(meta.pageNumber <= 2);
  const [isRendered, setIsRendered] = useState(false);

  const [draftStroke, setDraftStroke] = useState<StrokeAnnotation | null>(null);
  const draftStrokeRef = useRef<StrokeAnnotation | null>(null);
  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const erasedInGestureRef = useRef<{ texts: Set<string>; strokes: Set<string> }>({
    texts: new Set(),
    strokes: new Set(),
  });

  const [editingText, setEditingText] = useState<ActiveTextEditorState | null>(null);
  const [draggingText, setDraggingText] = useState<{
    id: string;
    startPointerX: number;
    startPointerY: number;
    origX: number;
    origY: number;
    currX: number;
    currY: number;
    moved: boolean;
  } | null>(null);

  const pageWidthPx = Math.max(1, meta.baseWidth * zoom);
  const pageHeightPx = Math.max(1, meta.baseHeight * zoom);

  useEffect(() => {
    registerPageElement(meta.pageNumber, wrapperRef.current);
    return () => registerPageElement(meta.pageNumber, null);
  }, [meta.pageNumber, registerPageElement]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsNearViewport(entry.isIntersecting);
        }
      },
      {
        rootMargin: '850px 0px',
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isNearViewport) {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Yoksay
        }
        renderTaskRef.current = null;
      }
      canvas.width = 0;
      canvas.height = 0;
      setIsRendered(false);
      return;
    }

    let cancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Yoksay
          }
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(meta.pageNumber);
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const viewport = page.getViewport({ scale: renderZoom });

        const maxCanvasDim = 4096;
        const targetW = viewport.width * dpr;
        const targetH = viewport.height * dpr;
        const clampRatio = Math.min(1, maxCanvasDim / Math.max(targetW, targetH, 1));
        const effectiveDpr = dpr * clampRatio;

        canvas.width = Math.max(1, Math.floor(viewport.width * effectiveDpr));
        canvas.height = Math.max(1, Math.floor(viewport.height * effectiveDpr));

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx || cancelled) return;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        const renderContext = {
          canvasContext: ctx,
          viewport,
          transform: effectiveDpr !== 1 ? [effectiveDpr, 0, 0, effectiveDpr, 0, 0] : undefined,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (!cancelled) {
          setIsRendered(true);
        }
      } catch (err) {
        const name = err instanceof Error ? err.name : '';
        if (name !== 'RenderingCancelledException') {
          console.warn(`Sayfa ${meta.pageNumber} çizilemedi:`, err);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Yoksay
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, meta.pageNumber, renderZoom, isNearViewport]);

  useEffect(() => {
    if (editingText && textareaRef.current) {
      const ta = textareaRef.current;
      ta.focus();
      const len = ta.value.length;
      ta.setSelectionRange(len, len);
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [editingText?.id, editingText?.x, editingText?.y]);

  useEffect(() => {
    if (toolMode !== 'text' && toolMode !== 'select' && editingText) {
      commitEditingText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolMode]);

  const getNormalizedPoint = (clientX: number, clientY: number): StrokePoint => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return { x: 0, y: 0 };
    }
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, ny)),
    };
  };

  const commitEditingText = () => {
    if (!editingText) return;
    const trimmed = editingText.text.replace(/\s+$/g, '');
    const isEmpty = trimmed.trim().length === 0;

    if (editingText.id === null) {
      if (!isEmpty) {
        const newItem: TextAnnotation = {
          id: createId('txt'),
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          fontSizeRatio: editingText.fontSizeRatio,
          color: editingText.color,
          bold: editingText.bold,
        };
        onAddText(meta.pageNumber, newItem);
      }
    } else if (isEmpty) {
      onDeleteText(meta.pageNumber, editingText.id);
    } else {
      onUpdateText(meta.pageNumber, editingText.id, { text: trimmed }, true);
    }

    setEditingText(null);
  };

  const eraseAtPoint = (pt: StrokePoint) => {
    for (const stroke of annotations.strokes) {
      if (erasedInGestureRef.current.strokes.has(stroke.id)) continue;
      if (isPointNearStroke(pt, stroke, pageWidthPx, pageHeightPx, 14)) {
        erasedInGestureRef.current.strokes.add(stroke.id);
      }
    }
    for (const txt of annotations.texts) {
      if (erasedInGestureRef.current.texts.has(txt.id)) continue;
      if (isPointInsideText(pt, txt, pageWidthPx, pageHeightPx)) {
        erasedInGestureRef.current.texts.add(txt.id);
      }
    }
  };

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (editingText) {
      commitEditingText();
      return;
    }

    const pt = getNormalizedPoint(e.clientX, e.clientY);

    if (toolMode === 'select') {
      for (let i = annotations.strokes.length - 1; i >= 0; i--) {
        const stroke = annotations.strokes[i];
        if (isPointNearStroke(pt, stroke, pageWidthPx, pageHeightPx, 12)) {
          e.stopPropagation();
          onSelectObject({ type: 'stroke', pageNumber: meta.pageNumber, id: stroke.id });
          return;
        }
      }
      onSelectObject(null);
      return;
    }

    if (toolMode === 'text') {
      e.preventDefault();
      e.stopPropagation();
      onSelectObject(null);
      setEditingText({
        id: null,
        x: Math.min(pt.x, 0.92),
        y: Math.min(pt.y, 0.94),
        text: '',
        fontSizeRatio: activeFontSizeRatio,
        color: activeColor,
        bold: activeBold,
      });
      return;
    }

    if (toolMode === 'pen') {
      e.preventDefault();
      e.stopPropagation();
      onSelectObject(null);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isDrawingRef.current = true;
      const newStroke: StrokeAnnotation = {
        id: createId('str'),
        points: [pt],
        color: activeColor,
        widthRatio: activePenWidthRatio,
      };
      draftStrokeRef.current = newStroke;
      setDraftStroke(newStroke);
      return;
    }

    if (toolMode === 'eraser') {
      e.preventDefault();
      e.stopPropagation();
      onSelectObject(null);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isErasingRef.current = true;
      erasedInGestureRef.current = { texts: new Set(), strokes: new Set() };
      eraseAtPoint(pt);
    }
  };

  const handleOverlayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDrawingRef.current && draftStrokeRef.current) {
      e.preventDefault();
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      const nextPoints = appendSmoothedPoint(draftStrokeRef.current.points, pt);
      if (nextPoints !== draftStrokeRef.current.points) {
        const updated = { ...draftStrokeRef.current, points: nextPoints };
        draftStrokeRef.current = updated;
        setDraftStroke(updated);
      }
      return;
    }

    if (isErasingRef.current) {
      e.preventDefault();
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      eraseAtPoint(pt);
      if (
        erasedInGestureRef.current.texts.size > 0 ||
        erasedInGestureRef.current.strokes.size > 0
      ) {
        const textIds = Array.from(erasedInGestureRef.current.texts);
        const strokeIds = Array.from(erasedInGestureRef.current.strokes);
        erasedInGestureRef.current = { texts: new Set(), strokes: new Set() };
        onEraseBatch(meta.pageNumber, textIds, strokeIds);
      }
    }
  };

  const finishOverlayPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Yoksay
      }
      const finalized = draftStrokeRef.current;
      draftStrokeRef.current = null;
      setDraftStroke(null);
      if (finalized && finalized.points.length > 0) {
        onAddStroke(meta.pageNumber, finalized);
      }
      return;
    }

    if (isErasingRef.current) {
      isErasingRef.current = false;
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Yoksay
      }
      const textIds = Array.from(erasedInGestureRef.current.texts);
      const strokeIds = Array.from(erasedInGestureRef.current.strokes);
      erasedInGestureRef.current = { texts: new Set(), strokes: new Set() };
      if (textIds.length > 0 || strokeIds.length > 0) {
        onEraseBatch(meta.pageNumber, textIds, strokeIds);
      }
    }
  };

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>, item: TextAnnotation) => {
    if (toolMode === 'eraser') {
      e.stopPropagation();
      e.preventDefault();
      onDeleteText(meta.pageNumber, item.id);
      return;
    }

    if (toolMode !== 'select') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.stopPropagation();
    onSelectObject({ type: 'text', pageNumber: meta.pageNumber, id: item.id });

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Yoksay
    }

    setDraggingText({
      id: item.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      origX: item.x,
      origY: item.y,
      currX: item.x,
      currY: item.y,
      moved: false,
    });
  };

  const handleTextPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingText) return;
    const dxPx = e.clientX - draggingText.startPointerX;
    const dyPx = e.clientY - draggingText.startPointerY;
    if (!draggingText.moved && Math.hypot(dxPx, dyPx) < 3) return;

    const nextX = Math.max(0, Math.min(0.95, draggingText.origX + dxPx / pageWidthPx));
    const nextY = Math.max(0, Math.min(0.96, draggingText.origY + dyPx / pageHeightPx));

    setDraggingText((prev) =>
      prev ? { ...prev, currX: nextX, currY: nextY, moved: true } : null,
    );
  };

  const handleTextPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingText) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Yoksay
    }

    const finished = draggingText;
    setDraggingText(null);
    if (finished.moved) {
      onUpdateText(
        meta.pageNumber,
        finished.id,
        { x: finished.currX, y: finished.currY },
        true,
      );
    }
  };

  const handleTextDoubleClick = (e: React.MouseEvent, item: TextAnnotation) => {
    if (toolMode !== 'select') return;
    e.stopPropagation();
    setDraggingText(null);
    setEditingText({
      id: item.id,
      x: item.x,
      y: item.y,
      text: item.text,
      fontSizeRatio: item.fontSizeRatio,
      color: item.color,
      bold: item.bold,
    });
  };

  const overlayCursorClass =
    toolMode === 'pen'
      ? 'cursor-crosshair'
      : toolMode === 'text'
        ? 'cursor-text'
        : toolMode === 'eraser'
          ? 'cursor-cell'
          : 'cursor-default';

  const blockTouchScroll = toolMode === 'pen' || toolMode === 'eraser';

  return (
    <div
      ref={wrapperRef}
      data-page-number={meta.pageNumber}
      className="relative bg-white shadow-md ring-1 ring-slate-300/80 select-none mx-auto"
      style={{
        width: `${pageWidthPx}px`,
        height: `${pageHeightPx}px`,
      }}
    >
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-slate-400 text-sm">
          Sayfa {meta.pageNumber} yükleniyor...
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      <div
        onPointerDown={handleOverlayPointerDown}
        onPointerMove={handleOverlayPointerMove}
        onPointerUp={finishOverlayPointer}
        onPointerCancel={finishOverlayPointer}
        className={`absolute inset-0 ${overlayCursorClass}`}
        style={{
          touchAction: blockTouchScroll ? 'none' : 'auto',
        }}
      >
        <svg
          width={pageWidthPx}
          height={pageHeightPx}
          viewBox={`0 0 ${pageWidthPx} ${pageHeightPx}`}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          {annotations.strokes.map((stroke) => {
            const pathD = buildSmoothSvgPath(stroke.points, pageWidthPx, pageHeightPx);
            const strokePx = Math.max(1, stroke.widthRatio * pageWidthPx);
            const isSelectedStroke =
              selectedObject?.type === 'stroke' &&
              selectedObject.pageNumber === meta.pageNumber &&
              selectedObject.id === stroke.id;

            return (
              <g key={stroke.id}>
                {isSelectedStroke && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeOpacity={0.35}
                    strokeWidth={strokePx + 8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={strokePx}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
          {draftStroke && (
            <path
              d={buildSmoothSvgPath(draftStroke.points, pageWidthPx, pageHeightPx)}
              fill="none"
              stroke={draftStroke.color}
              strokeWidth={Math.max(1, draftStroke.widthRatio * pageWidthPx)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {annotations.texts.map((item) => {
          if (editingText && editingText.id === item.id) return null;

          const isSelected =
            selectedObject?.type === 'text' &&
            selectedObject.pageNumber === meta.pageNumber &&
            selectedObject.id === item.id;
          const isBeingDragged = draggingText?.id === item.id;
          const displayX = isBeingDragged ? draggingText.currX : item.x;
          const displayY = isBeingDragged ? draggingText.currY : item.y;
          const fontSizePx = item.fontSizeRatio * pageHeightPx;

          return (
            <div
              key={item.id}
              onPointerDown={(e) => handleTextPointerDown(e, item)}
              onPointerMove={handleTextPointerMove}
              onPointerUp={handleTextPointerUp}
              onDoubleClick={(e) => handleTextDoubleClick(e, item)}
              title={
                toolMode === 'select'
                  ? 'Taşımak için sürükle, düzenlemek için çift tıkla, silmek için Delete'
                  : undefined
              }
              className={`pdf-text-overlay absolute whitespace-pre bg-transparent ${
                toolMode === 'select'
                  ? 'cursor-move pointer-events-auto'
                  : toolMode === 'eraser'
                    ? 'cursor-cell pointer-events-auto'
                    : 'pointer-events-none'
              } ${
                isSelected
                  ? 'ring-2 ring-blue-500/80 ring-offset-2 ring-offset-transparent rounded-sm'
                  : ''
              }`}
              style={{
                left: `${displayX * 100}%`,
                top: `${displayY * 100}%`,
                fontSize: `${fontSizePx}px`,
                lineHeight: 1.25,
                color: item.color,
                fontWeight: item.bold ? 700 : 400,
                touchAction: toolMode === 'select' ? 'none' : 'auto',
              }}
            >
              {item.text}

              {isSelected && toolMode === 'select' && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteText(meta.pageNumber, item.id);
                    onSelectObject(null);
                  }}
                  title="Metni sil (Delete)"
                  className="absolute -top-7 -right-7 w-7 h-7 rounded-full bg-rose-600 text-white shadow-md flex items-center justify-center text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {selectedObject?.type === 'stroke' &&
          selectedObject.pageNumber === meta.pageNumber &&
          toolMode === 'select' &&
          (() => {
            const st = annotations.strokes.find((s) => s.id === selectedObject.id);
            if (!st || st.points.length === 0) return null;
            const anchor = st.points[0];
            return (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStroke(meta.pageNumber, st.id);
                  onSelectObject(null);
                }}
                title="Seçili çizimi sil (Delete)"
                className="absolute z-20 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer"
                style={{
                  left: `${anchor.x * 100}%`,
                  top: `${Math.max(0.03, anchor.y) * 100}%`,
                }}
              >
                Çizimi Sil ✕
              </button>
            );
          })()}

        {editingText && (
          <textarea
            ref={textareaRef}
            value={editingText.text}
            rows={1}
            spellCheck={false}
            placeholder="Yazın..."
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = e.target.value;
              setEditingText((prev) => (prev ? { ...prev, text: val } : null));
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitEditingText();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setEditingText(null);
              }
            }}
            onBlur={commitEditingText}
            className="pdf-text-overlay absolute bg-transparent border border-dashed border-blue-500 rounded-sm outline-none resize-none overflow-hidden px-0.5 py-0 m-0 min-w-[70px] z-30"
            style={{
              left: `${editingText.x * 100}%`,
              top: `${editingText.y * 100}%`,
              fontSize: `${editingText.fontSizeRatio * pageHeightPx}px`,
              lineHeight: 1.25,
              color: editingText.color,
              fontWeight: editingText.bold ? 700 : 400,
              maxWidth: `${Math.max(120, (1 - editingText.x) * pageWidthPx - 8)}px`,
            }}
          />
        )}
      </div>

      <div className="absolute bottom-1.5 right-2 pointer-events-none px-1.5 py-0.5 rounded bg-slate-900/55 text-white text-[11px] font-medium">
        {meta.pageNumber}
      </div>
    </div>
  );
};
