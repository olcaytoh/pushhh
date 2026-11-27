// PDF üzerinde tek tıkla açılıp kapanabilen etkileşimli Boş / Kareli sayfa katmanı (çevrimdışı)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  isStampShapeType,
  type PageAnnotations,
  type StrokePoint,
  type SelectedObject,
  type ShapeAnnotation,
  type ShapeFillMode,
  type ShapeType,
  STAMP_OPTIONS,
  type StampType,
  type StrokeAnnotation,
  type StrokeSmoothingLevel,
  type TextAnnotation,
  type ToolMode,
} from '../types/pdf';
import {
  appendSmoothedPointInPlace,
  buildSmoothSvgPath,
  constrainShapeEndPoint,
  getArrowHeadNormPoints,
  getClosedShapeNormPolygon,
  getStampGeometry,
  isPointInsideText,
  isPointNearShape,
  isPointNearStroke,
  resolveShapeFill,
  smoothCompletedStroke,
} from '../utils/geometry';
import type { InsertPageKind } from '../utils/pdfExporter';
import { BlankPageAddIcon, CloseIcon, GridPageAddIcon, TrashIcon } from './Icons';

export const OVERLAY_PAGE_NUMBER = 0;

interface EditingTextState {
  id: string | null;
  x: number;
  y: number;
  text: string;
  fontSizeRatio: number;
  color: string;
  bold: boolean;
}

interface DraggingTextState {
  id: string;
  startPointerX: number;
  startPointerY: number;
  origX: number;
  origY: number;
  currX: number;
  currY: number;
  moved: boolean;
}

interface DraggingShapeState {
  id: string;
  startPointerX: number;
  startPointerY: number;
  origX1: number;
  origY1: number;
  origX2: number;
  origY2: number;
  dx: number;
  dy: number;
  moved: boolean;
}

export interface ScratchpadOverlayProps {
  mode: InsertPageKind;
  hasPdfDocument: boolean;
  isInsertingPage: boolean;
  toolMode: ToolMode;
  activeColor: string;
  activeFontSizeRatio: number;
  activeBold: boolean;
  activePenWidthRatio: number;
  activeStrokeSmoothing: StrokeSmoothingLevel;
  activeShapeType: ShapeType;
  activeShapeFillMode: ShapeFillMode;
  activeShapeBorderColor: string;
  activeShapeFillColor: string;
  activeStampType: StampType;
  activeStampSizeRatio: number;
  annotations: PageAnnotations;
  selectedObject: SelectedObject | null;
  onSelectObject: (obj: SelectedObject | null) => void;
  onAddText: (pageNumber: number, item: TextAnnotation) => void;
  onUpdateText: (
    pageNumber: number,
    id: string,
    patch: Partial<TextAnnotation>,
    recordUndo?: boolean,
  ) => void;
  onDeleteText: (pageNumber: number, id: string) => void;
  onAddStroke: (pageNumber: number, stroke: StrokeAnnotation) => void;
  onDeleteStroke: (pageNumber: number, id: string) => void;
  onAddShape: (pageNumber: number, shape: ShapeAnnotation) => void;
  onUpdateShape: (
    pageNumber: number,
    id: string,
    patch: Partial<ShapeAnnotation>,
    recordUndo?: boolean,
  ) => void;
  onDeleteShape: (pageNumber: number, id: string) => void;
  onEraseBatch: (
    pageNumber: number,
    textIds: string[],
    strokeIds: string[],
    shapeIds: string[],
  ) => void;
  onSwitchMode: (mode: InsertPageKind) => void;
  onInsertIntoPdf: (kind: InsertPageKind) => void;
  onClearBoard: () => void;
  onClose: () => void;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const ScratchpadOverlay: React.FC<ScratchpadOverlayProps> = ({
  mode,
  hasPdfDocument,
  isInsertingPage,
  toolMode,
  activeColor,
  activeFontSizeRatio,
  activeBold,
  activePenWidthRatio,
  activeStrokeSmoothing,
  activeShapeType,
  activeShapeFillMode,
  activeShapeBorderColor,
  activeShapeFillColor,
  activeStampType,
  activeStampSizeRatio,
  annotations,
  selectedObject,
  onSelectObject,
  onAddText,
  onUpdateText,
  onDeleteText,
  onAddStroke,
  onDeleteStroke,
  onAddShape,
  onUpdateShape,
  onDeleteShape,
  onEraseBatch,
  onSwitchMode,
  onInsertIntoPdf,
  onClearBoard,
  onClose,
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const liveStrokePathRef = useRef<SVGPathElement | null>(null);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 700,
  });

  const [editingText, setEditingText] = useState<EditingTextState | null>(null);
  const [draggingText, setDraggingText] = useState<DraggingTextState | null>(null);
  const [draggingShape, setDraggingShape] = useState<DraggingShapeState | null>(null);
  const draggingShapeRef = useRef<DraggingShapeState | null>(null);

  // Akıllı tahtada avuç içi / ikinci dokunuşun çizimi kesmemesi için aktif işaretçi kilidi
  const activePointerIdRef = useRef<number | null>(null);
  const activeRectRef = useRef<DOMRect | null>(null);

  const liveStrokeMetaRef = useRef<{ id: string; color: string; widthRatio: number } | null>(null);
  const liveStrokePointsRef = useRef<StrokePoint[]>([]);
  const liveRafRef = useRef<number | null>(null);
  const lastRawPenPointRef = useRef<StrokePoint | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const [draftShape, setDraftShape] = useState<ShapeAnnotation | null>(null);
  const draftShapeRef = useRef<ShapeAnnotation | null>(null);
  const isDrawingShapeRef = useRef<boolean>(false);
  const isPlacingStampRef = useRef<boolean>(false);
  const stampOriginRef = useRef<{ pt: StrokePoint; dragged: boolean } | null>(null);

  const isErasingRef = useRef<boolean>(false);
  const erasedInGestureRef = useRef<{
    texts: Set<string>;
    strokes: Set<string>;
    shapes: Set<string>;
  }>({ texts: new Set(), strokes: new Set(), shapes: new Set() });

  const boardWidthPx = Math.max(200, boardSize.width);
  const boardHeightPx = Math.max(200, boardSize.height);

  // Tahta alanının boyutunu canlı izle (tam ekran / pencere değişimlerinde doğru koordinatlar için)
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoardSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    if (editingText && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editingText?.id, editingText?.x, editingText?.y]);

  useEffect(() => {
    return () => {
      if (liveRafRef.current !== null) {
        window.cancelAnimationFrame(liveRafRef.current);
        liveRafRef.current = null;
      }
    };
  }, []);

  const flushLiveStrokePath = () => {
    liveRafRef.current = null;
    const pathEl = liveStrokePathRef.current;
    const pts = liveStrokePointsRef.current;
    if (!pathEl || pts.length === 0) return;
    pathEl.setAttribute('d', buildSmoothSvgPath(pts, boardWidthPx, boardHeightPx));
  };

  const scheduleLiveStrokeRender = () => {
    if (liveRafRef.current !== null) return;
    liveRafRef.current = window.requestAnimationFrame(flushLiveStrokePath);
  };

  const clearLiveStrokePath = () => {
    if (liveRafRef.current !== null) {
      window.cancelAnimationFrame(liveRafRef.current);
      liveRafRef.current = null;
    }
    const pathEl = liveStrokePathRef.current;
    if (pathEl) {
      pathEl.setAttribute('visibility', 'hidden');
      pathEl.setAttribute('d', '');
    }
  };

  const getNormalizedPoint = (
    clientX: number,
    clientY: number,
    useCachedRect = false,
  ): StrokePoint => {
    const rect =
      (useCachedRect ? activeRectRef.current : null) ?? boardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  const commitEditingText = () => {
    if (!editingText) return;
    const trimmed = editingText.text.replace(/\s+$/g, '');
    if (editingText.id === null) {
      if (trimmed.trim().length > 0) {
        onAddText(OVERLAY_PAGE_NUMBER, {
          id: createId('ovl-txt'),
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          fontSizeRatio: editingText.fontSizeRatio,
          color: editingText.color,
          bold: editingText.bold,
        });
      }
    } else if (trimmed.trim().length === 0) {
      onDeleteText(OVERLAY_PAGE_NUMBER, editingText.id);
    } else {
      onUpdateText(OVERLAY_PAGE_NUMBER, editingText.id, { text: trimmed }, true);
    }
    setEditingText(null);
  };

  const eraseAtPoint = (pt: StrokePoint) => {
    for (const stroke of annotations.strokes) {
      if (erasedInGestureRef.current.strokes.has(stroke.id)) continue;
      if (isPointNearStroke(pt, stroke, boardWidthPx, boardHeightPx, 14)) {
        erasedInGestureRef.current.strokes.add(stroke.id);
      }
    }
    for (const shape of annotations.shapes || []) {
      if (erasedInGestureRef.current.shapes.has(shape.id)) continue;
      if (isPointNearShape(pt, shape, boardWidthPx, boardHeightPx, 14)) {
        erasedInGestureRef.current.shapes.add(shape.id);
      }
    }
    for (const txt of annotations.texts) {
      if (erasedInGestureRef.current.texts.has(txt.id)) continue;
      if (isPointInsideText(pt, txt, boardWidthPx, boardHeightPx)) {
        erasedInGestureRef.current.texts.add(txt.id);
      }
    }
  };

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Zaten aktif bir kalem/şekil/silgi/sürükleme dokunuşu varsa avuç içi / ikinci dokunuşu yoksay
    if (activePointerIdRef.current !== null) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (editingText) {
      commitEditingText();
      return;
    }

    activeRectRef.current = boardRef.current?.getBoundingClientRect() ?? null;
    const pt = getNormalizedPoint(e.clientX, e.clientY, true);

    if (toolMode === 'select') {
      const shapes = annotations.shapes || [];
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (isPointNearShape(pt, shape, boardWidthPx, boardHeightPx, 12)) {
          e.stopPropagation();
          onSelectObject({ type: 'shape', pageNumber: OVERLAY_PAGE_NUMBER, id: shape.id });
          activePointerIdRef.current = e.pointerId;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Yoksay
          }
          const dragState: DraggingShapeState = {
            id: shape.id,
            startPointerX: e.clientX,
            startPointerY: e.clientY,
            origX1: shape.x1,
            origY1: shape.y1,
            origX2: shape.x2,
            origY2: shape.y2,
            dx: 0,
            dy: 0,
            moved: false,
          };
          draggingShapeRef.current = dragState;
          setDraggingShape(dragState);
          return;
        }
      }

      for (let i = annotations.strokes.length - 1; i >= 0; i--) {
        const stroke = annotations.strokes[i];
        if (isPointNearStroke(pt, stroke, boardWidthPx, boardHeightPx, 12)) {
          e.stopPropagation();
          onSelectObject({ type: 'stroke', pageNumber: OVERLAY_PAGE_NUMBER, id: stroke.id });
          activeRectRef.current = null;
          return;
        }
      }
      activeRectRef.current = null;
      onSelectObject(null);
      return;
    }

    if (toolMode === 'text') {
      e.preventDefault();
      e.stopPropagation();
      activeRectRef.current = null;
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
      if (selectedObject) onSelectObject(null);
      activePointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isDrawingRef.current = true;
      lastRawPenPointRef.current = pt;
      liveStrokeMetaRef.current = {
        id: createId('ovl-str'),
        color: activeColor,
        widthRatio: activePenWidthRatio,
      };
      liveStrokePointsRef.current = [pt];

      const pathEl = liveStrokePathRef.current;
      if (pathEl) {
        const strokePx = Math.max(
          1.2,
          activePenWidthRatio * Math.min(boardWidthPx, boardHeightPx * 1.15),
        );
        pathEl.setAttribute('stroke', activeColor);
        pathEl.setAttribute('stroke-width', String(strokePx));
        pathEl.setAttribute('d', buildSmoothSvgPath(liveStrokePointsRef.current, boardWidthPx, boardHeightPx));
        pathEl.setAttribute('visibility', 'visible');
      }
      return;
    }

    if (toolMode === 'shape') {
      e.preventDefault();
      e.stopPropagation();
      if (selectedObject) onSelectObject(null);
      activePointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isDrawingShapeRef.current = true;
      const isClosable = activeShapeType !== 'line' && activeShapeType !== 'arrow';
      const effectiveFillMode: ShapeFillMode = isClosable ? activeShapeFillMode : 'none';
      const newShape: ShapeAnnotation = {
        id: createId('ovl-shp'),
        shapeType: activeShapeType,
        x1: pt.x,
        y1: pt.y,
        x2: pt.x,
        y2: pt.y,
        color: activeShapeBorderColor,
        fillColor: activeShapeFillColor,
        fillMode: effectiveFillMode,
        widthRatio: activePenWidthRatio,
        filled: effectiveFillMode !== 'none',
      };
      draftShapeRef.current = newShape;
      setDraftShape(newShape);
      return;
    }

    if (toolMode === 'stamp') {
      e.preventDefault();
      e.stopPropagation();
      if (selectedObject) onSelectObject(null);
      activePointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isPlacingStampRef.current = true;
      stampOriginRef.current = { pt, dragged: false };
      const stampOpt = STAMP_OPTIONS.find((s) => s.type === activeStampType);
      const sizePx = Math.max(24, activeStampSizeRatio * Math.min(boardWidthPx, boardHeightPx * 1.2));
      const halfW = sizePx / 2 / boardWidthPx;
      const halfH = sizePx / 2 / boardHeightPx;
      const clampedCx = Math.max(halfW, Math.min(1 - halfW, pt.x));
      const clampedCy = Math.max(halfH, Math.min(1 - halfH, pt.y));
      const newStamp: ShapeAnnotation = {
        id: createId('ovl-stp'),
        shapeType: activeStampType,
        x1: Math.max(0, clampedCx - halfW),
        y1: Math.max(0, clampedCy - halfH),
        x2: Math.min(1, clampedCx + halfW),
        y2: Math.min(1, clampedCy + halfH),
        color: activeColor,
        widthRatio: activePenWidthRatio,
        filled: stampOpt ? stampOpt.filled : false,
      };
      draftShapeRef.current = newStamp;
      setDraftShape(newStamp);
      return;
    }

    if (toolMode === 'eraser') {
      e.preventDefault();
      e.stopPropagation();
      if (selectedObject) onSelectObject(null);
      activePointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Yoksay
      }
      isErasingRef.current = true;
      erasedInGestureRef.current = { texts: new Set(), strokes: new Set(), shapes: new Set() };
      eraseAtPoint(pt);
    }
  };

  const handleOverlayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === null || e.pointerId !== activePointerIdRef.current) {
      return;
    }

    if (draggingShapeRef.current) {
      const ds = draggingShapeRef.current;
      const dxPx = e.clientX - ds.startPointerX;
      const dyPx = e.clientY - ds.startPointerY;
      if (!ds.moved && Math.hypot(dxPx, dyPx) < 3) return;

      const rawDx = dxPx / boardWidthPx;
      const rawDy = dyPx / boardHeightPx;
      const minX = Math.min(ds.origX1, ds.origX2);
      const maxX = Math.max(ds.origX1, ds.origX2);
      const minY = Math.min(ds.origY1, ds.origY2);
      const maxY = Math.max(ds.origY1, ds.origY2);
      const clampedDx = Math.max(-minX, Math.min(1 - maxX, rawDx));
      const clampedDy = Math.max(-minY, Math.min(1 - maxY, rawDy));

      const updated = { ...ds, dx: clampedDx, dy: clampedDy, moved: true };
      draggingShapeRef.current = updated;
      setDraggingShape(updated);
      return;
    }

    if (isDrawingRef.current && liveStrokeMetaRef.current) {
      e.preventDefault();
      const nativeEvt = e.nativeEvent;
      const coalesced =
        typeof nativeEvt.getCoalescedEvents === 'function'
          ? nativeEvt.getCoalescedEvents()
          : null;
      const samples = coalesced && coalesced.length > 0 ? coalesced : [nativeEvt];

      let addedAny = false;
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const pt = getNormalizedPoint(sample.clientX, sample.clientY, true);
        lastRawPenPointRef.current = pt;
        if (appendSmoothedPointInPlace(liveStrokePointsRef.current, pt, activeStrokeSmoothing)) {
          addedAny = true;
        }
      }

      if (addedAny) {
        scheduleLiveStrokeRender();
      }
      return;
    }

    if (isDrawingShapeRef.current && draftShapeRef.current) {
      e.preventDefault();
      const rawPt = getNormalizedPoint(e.clientX, e.clientY, true);
      const constrained = constrainShapeEndPoint(
        draftShapeRef.current.shapeType,
        { x: draftShapeRef.current.x1, y: draftShapeRef.current.y1 },
        rawPt,
        boardWidthPx,
        boardHeightPx,
        e.shiftKey,
      );
      const updated: ShapeAnnotation = {
        ...draftShapeRef.current,
        x2: constrained.x,
        y2: constrained.y,
      };
      draftShapeRef.current = updated;
      setDraftShape(updated);
      return;
    }

    if (isPlacingStampRef.current && stampOriginRef.current && draftShapeRef.current) {
      e.preventDefault();
      const rawPt = getNormalizedPoint(e.clientX, e.clientY, true);
      const origin = stampOriginRef.current;
      const distPx = Math.hypot(
        (rawPt.x - origin.pt.x) * boardWidthPx,
        (rawPt.y - origin.pt.y) * boardHeightPx,
      );
      if (origin.dragged || distPx >= 12) {
        origin.dragged = true;
        const constrained = constrainShapeEndPoint(
          'rectangle',
          origin.pt,
          rawPt,
          boardWidthPx,
          boardHeightPx,
          true,
        );
        const updated: ShapeAnnotation = {
          ...draftShapeRef.current,
          x1: origin.pt.x,
          y1: origin.pt.y,
          x2: constrained.x,
          y2: constrained.y,
        };
        draftShapeRef.current = updated;
        setDraftShape(updated);
      }
      return;
    }

    if (isErasingRef.current) {
      e.preventDefault();
      const nativeEvt = e.nativeEvent;
      const coalesced =
        typeof nativeEvt.getCoalescedEvents === 'function'
          ? nativeEvt.getCoalescedEvents()
          : null;
      const samples = coalesced && coalesced.length > 0 ? coalesced : [nativeEvt];
      for (let i = 0; i < samples.length; i++) {
        const pt = getNormalizedPoint(samples[i].clientX, samples[i].clientY, true);
        eraseAtPoint(pt);
      }
      if (
        erasedInGestureRef.current.texts.size > 0 ||
        erasedInGestureRef.current.strokes.size > 0 ||
        erasedInGestureRef.current.shapes.size > 0
      ) {
        const textIds = Array.from(erasedInGestureRef.current.texts);
        const strokeIds = Array.from(erasedInGestureRef.current.strokes);
        const shapeIds = Array.from(erasedInGestureRef.current.shapes);
        erasedInGestureRef.current = { texts: new Set(), strokes: new Set(), shapes: new Set() };
        onEraseBatch(OVERLAY_PAGE_NUMBER, textIds, strokeIds, shapeIds);
      }
    }
  };

  const finishOverlayPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === null || e.pointerId !== activePointerIdRef.current) {
      return;
    }
    activePointerIdRef.current = null;
    activeRectRef.current = null;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Yoksay
    }

    if (draggingShapeRef.current) {
      const finished = draggingShapeRef.current;
      draggingShapeRef.current = null;
      setDraggingShape(null);
      if (finished.moved) {
        onUpdateShape(
          OVERLAY_PAGE_NUMBER,
          finished.id,
          {
            x1: finished.origX1 + finished.dx,
            y1: finished.origY1 + finished.dy,
            x2: finished.origX2 + finished.dx,
            y2: finished.origY2 + finished.dy,
          },
          true,
        );
      }
      return;
    }

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      clearLiveStrokePath();

      const strokeMeta = liveStrokeMetaRef.current;
      const rawPoints = liveStrokePointsRef.current;
      const lastRawPt = lastRawPenPointRef.current;
      liveStrokeMetaRef.current = null;
      liveStrokePointsRef.current = [];
      lastRawPenPointRef.current = null;

      if (strokeMeta && rawPoints.length > 0) {
        const pts = rawPoints.slice();
        if (lastRawPt && pts.length >= 2) {
          const tail = pts[pts.length - 1];
          if (Math.hypot(lastRawPt.x - tail.x, lastRawPt.y - tail.y) > 0.0012) {
            pts.push(lastRawPt);
          }
        }
        const smoothedPoints = smoothCompletedStroke(
          pts,
          activeStrokeSmoothing,
          boardWidthPx,
          boardHeightPx,
        );
        onAddStroke(OVERLAY_PAGE_NUMBER, {
          id: strokeMeta.id,
          color: strokeMeta.color,
          widthRatio: strokeMeta.widthRatio,
          points: smoothedPoints,
        });
      }
      return;
    }

    if (isDrawingShapeRef.current) {
      isDrawingShapeRef.current = false;
      const finalized = draftShapeRef.current;
      draftShapeRef.current = null;
      setDraftShape(null);
      if (finalized) {
        const spanPx = Math.hypot(
          (finalized.x2 - finalized.x1) * boardWidthPx,
          (finalized.y2 - finalized.y1) * boardHeightPx,
        );
        if (spanPx >= 5) {
          onAddShape(OVERLAY_PAGE_NUMBER, finalized);
        }
      }
      return;
    }

    if (isPlacingStampRef.current) {
      isPlacingStampRef.current = false;
      stampOriginRef.current = null;
      const finalized = draftShapeRef.current;
      draftShapeRef.current = null;
      setDraftShape(null);
      if (finalized) {
        onAddShape(OVERLAY_PAGE_NUMBER, finalized);
      }
      return;
    }

    if (isErasingRef.current) {
      isErasingRef.current = false;
      const textIds = Array.from(erasedInGestureRef.current.texts);
      const strokeIds = Array.from(erasedInGestureRef.current.strokes);
      const shapeIds = Array.from(erasedInGestureRef.current.shapes);
      erasedInGestureRef.current = { texts: new Set(), strokes: new Set(), shapes: new Set() };
      if (textIds.length > 0 || strokeIds.length > 0 || shapeIds.length > 0) {
        onEraseBatch(OVERLAY_PAGE_NUMBER, textIds, strokeIds, shapeIds);
      }
    }
  };

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>, item: TextAnnotation) => {
    if (toolMode === 'eraser') {
      e.stopPropagation();
      e.preventDefault();
      onDeleteText(OVERLAY_PAGE_NUMBER, item.id);
      return;
    }

    if (toolMode !== 'select') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.stopPropagation();
    onSelectObject({ type: 'text', pageNumber: OVERLAY_PAGE_NUMBER, id: item.id });

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

    const nextX = Math.max(0, Math.min(0.95, draggingText.origX + dxPx / boardWidthPx));
    const nextY = Math.max(0, Math.min(0.96, draggingText.origY + dyPx / boardHeightPx));

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
        OVERLAY_PAGE_NUMBER,
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
    toolMode === 'pen' || toolMode === 'shape' || toolMode === 'stamp'
      ? 'cursor-crosshair'
      : toolMode === 'text'
        ? 'cursor-text'
        : toolMode === 'eraser'
          ? 'cursor-cell'
          : draggingShape
            ? 'cursor-grabbing'
            : 'cursor-default';

  const hasBoardContent =
    annotations.texts.length > 0 ||
    annotations.strokes.length > 0 ||
    (annotations.shapes?.length || 0) > 0;

  const renderSvgShape = (shape: ShapeAnnotation, isSelected: boolean, isDraft = false) => {
    const strokePx = Math.max(1.4, shape.widthRatio * Math.min(boardWidthPx, boardHeightPx * 1.15));
    const dx = draggingShape?.id === shape.id ? draggingShape.dx : 0;
    const dy = draggingShape?.id === shape.id ? draggingShape.dy : 0;
    const effectiveShape: ShapeAnnotation =
      dx !== 0 || dy !== 0
        ? {
            ...shape,
            x1: shape.x1 + dx,
            y1: shape.y1 + dy,
            x2: shape.x2 + dx,
            y2: shape.y2 + dy,
          }
        : shape;

    if (isStampShapeType(effectiveShape.shapeType)) {
      const geom = getStampGeometry(effectiveShape);
      const boxMinPx = Math.min(
        Math.abs(effectiveShape.x2 - effectiveShape.x1) * boardWidthPx,
        Math.abs(effectiveShape.y2 - effectiveShape.y1) * boardHeightPx,
      );
      const stampStrokePx = Math.max(strokePx * 1.35, boxMinPx * 0.14);
      const minX = Math.min(effectiveShape.x1, effectiveShape.x2) * boardWidthPx;
      const minY = Math.min(effectiveShape.y1, effectiveShape.y2) * boardHeightPx;
      const boxW = Math.abs(effectiveShape.x2 - effectiveShape.x1) * boardWidthPx;
      const boxH = Math.abs(effectiveShape.y2 - effectiveShape.y1) * boardHeightPx;

      return (
        <g key={shape.id} opacity={isDraft ? 0.85 : 1}>
          {isSelected && (
            <rect
              x={minX - 5}
              y={minY - 5}
              width={boxW + 10}
              height={boxH + 10}
              rx={8}
              fill="#3b82f6"
              fillOpacity={0.08}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
          )}

          {geom.polygon && geom.polygon.length >= 3 && (
            <polygon
              points={geom.polygon
                .map((pt) => `${(pt.x * boardWidthPx).toFixed(2)},${(pt.y * boardHeightPx).toFixed(2)}`)
                .join(' ')}
              fill={geom.fillOpacity > 0 ? effectiveShape.color : 'none'}
              fillOpacity={geom.fillOpacity}
              stroke={effectiveShape.color}
              strokeWidth={Math.max(1.5, boxMinPx * 0.065)}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {geom.polylines.map((linePts, idx) => (
            <polyline
              key={idx}
              points={linePts
                .map((pt) => `${(pt.x * boardWidthPx).toFixed(2)},${(pt.y * boardHeightPx).toFixed(2)}`)
                .join(' ')}
              fill="none"
              stroke={effectiveShape.color}
              strokeWidth={stampStrokePx}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {geom.dotPolygons.map((dotPts, idx) => (
            <polygon
              key={idx}
              points={dotPts
                .map((pt) => `${(pt.x * boardWidthPx).toFixed(2)},${(pt.y * boardHeightPx).toFixed(2)}`)
                .join(' ')}
              fill={effectiveShape.color}
            />
          ))}
        </g>
      );
    }

    if (effectiveShape.shapeType === 'line' || effectiveShape.shapeType === 'arrow') {
      const x1 = effectiveShape.x1 * boardWidthPx;
      const y1 = effectiveShape.y1 * boardHeightPx;
      const x2 = effectiveShape.x2 * boardWidthPx;
      const y2 = effectiveShape.y2 * boardHeightPx;
      const wings =
        effectiveShape.shapeType === 'arrow'
          ? getArrowHeadNormPoints(effectiveShape, boardWidthPx, boardHeightPx)
          : null;
      const wingPoints = wings
        ? `${(wings[0].x * boardWidthPx).toFixed(2)},${(wings[0].y * boardHeightPx).toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${(wings[1].x * boardWidthPx).toFixed(2)},${(wings[1].y * boardHeightPx).toFixed(2)}`
        : '';

      return (
        <g key={shape.id} opacity={isDraft ? 0.85 : 1}>
          {isSelected && (
            <>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3b82f6"
                strokeOpacity={0.35}
                strokeWidth={strokePx + 8}
                strokeLinecap="round"
              />
              {wingPoints && (
                <polyline
                  points={wingPoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeOpacity={0.35}
                  strokeWidth={strokePx + 8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          )}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={effectiveShape.color}
            strokeWidth={strokePx}
            strokeLinecap="round"
          />
          {wingPoints && (
            <polyline
              points={wingPoints}
              fill="none"
              stroke={effectiveShape.color}
              strokeWidth={strokePx}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      );
    }

    const poly = getClosedShapeNormPolygon(effectiveShape, 64);
    if (poly.length < 3) return null;
    const pointsAttr = poly
      .map((pt) => `${(pt.x * boardWidthPx).toFixed(2)},${(pt.y * boardHeightPx).toFixed(2)}`)
      .join(' ');
    const resolvedFill = resolveShapeFill(effectiveShape);

    return (
      <g key={shape.id} opacity={isDraft ? 0.85 : 1}>
        {isSelected && (
          <polygon
            points={pointsAttr}
            fill="none"
            stroke="#3b82f6"
            strokeOpacity={0.35}
            strokeWidth={strokePx + 8}
            strokeLinejoin="round"
          />
        )}
        <polygon
          points={pointsAttr}
          fill={resolvedFill.mode !== 'none' ? resolvedFill.fillColor : 'none'}
          fillOpacity={resolvedFill.opacity}
          stroke={effectiveShape.color}
          strokeWidth={strokePx}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    );
  };

  const selectedStrokeId =
    selectedObject?.type === 'stroke' && selectedObject.pageNumber === OVERLAY_PAGE_NUMBER
      ? selectedObject.id
      : null;

  const committedStrokesSvg = useMemo(
    () =>
      annotations.strokes.map((stroke) => {
        const pathD = buildSmoothSvgPath(stroke.points, boardWidthPx, boardHeightPx);
        const strokePx = Math.max(
          1.2,
          stroke.widthRatio * Math.min(boardWidthPx, boardHeightPx * 1.15),
        );
        const isSelectedStroke = selectedStrokeId === stroke.id;

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
      }),
    [annotations.strokes, boardWidthPx, boardHeightPx, selectedStrokeId],
  );

  return (
    <div
      role="region"
      aria-label={mode === 'grid' ? 'Kareli Sayfa Katmanı' : 'Boş Sayfa Katmanı'}
      className="absolute inset-0 z-10 p-2.5 sm:p-4 bg-slate-900/20 backdrop-blur-[1px] flex items-stretch justify-center select-none"
    >
      <div
        ref={boardRef}
        className="relative w-full h-full bg-white rounded-2xl shadow-2xl border-2 border-slate-300/90 overflow-hidden"
      >
        {/* Kareli Sayfa Arka Plan Izgarası (%100 çevrimdışı vektörel SVG desen) */}
        {mode === 'grid' && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="scratchpad-grid-minor"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="1"
                />
              </pattern>
              <pattern
                id="scratchpad-grid-major"
                width="140"
                height="140"
                patternUnits="userSpaceOnUse"
              >
                <rect width="140" height="140" fill="url(#scratchpad-grid-minor)" />
                <path
                  d="M 140 0 L 0 0 0 140"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="1.4"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#scratchpad-grid-major)" />
          </svg>
        )}

        {/* Etkileşimli Çizim ve Yazı Katmanı */}
        <div
          onPointerDown={handleOverlayPointerDown}
          onPointerMove={handleOverlayPointerMove}
          onPointerUp={finishOverlayPointer}
          onPointerCancel={finishOverlayPointer}
          onLostPointerCapture={finishOverlayPointer}
          onContextMenu={(e) => {
            if (!editingText) e.preventDefault();
          }}
          className={`absolute inset-0 ${overlayCursorClass}`}
          style={{
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <svg
            width={boardWidthPx}
            height={boardHeightPx}
            viewBox={`0 0 ${boardWidthPx} ${boardHeightPx}`}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          >
            {committedStrokesSvg}

            {(annotations.shapes || []).map((shape) => {
              const isSelectedShape =
                selectedObject?.type === 'shape' &&
                selectedObject.pageNumber === OVERLAY_PAGE_NUMBER &&
                selectedObject.id === shape.id;
              return renderSvgShape(shape, isSelectedShape, false);
            })}

            <path
              ref={liveStrokePathRef}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              visibility="hidden"
            />

            {draftShape && renderSvgShape(draftShape, false, true)}
          </svg>

          {annotations.texts.map((item) => {
            if (editingText && editingText.id === item.id) return null;

            const isSelected =
              selectedObject?.type === 'text' &&
              selectedObject.pageNumber === OVERLAY_PAGE_NUMBER &&
              selectedObject.id === item.id;
            const isBeingDragged = draggingText?.id === item.id;
            const displayX = isBeingDragged ? draggingText.currX : item.x;
            const displayY = isBeingDragged ? draggingText.currY : item.y;
            const fontSizePx = item.fontSizeRatio * boardHeightPx;

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
                      onDeleteText(OVERLAY_PAGE_NUMBER, item.id);
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
            selectedObject.pageNumber === OVERLAY_PAGE_NUMBER &&
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
                    onDeleteStroke(OVERLAY_PAGE_NUMBER, st.id);
                    onSelectObject(null);
                  }}
                  title="Seçili çizimi sil (Delete)"
                  className="absolute z-20 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer"
                  style={{
                    left: `${anchor.x * 100}%`,
                    top: `${Math.max(0.04, anchor.y) * 100}%`,
                  }}
                >
                  Çizimi Sil ✕
                </button>
              );
            })()}

          {selectedObject?.type === 'shape' &&
            selectedObject.pageNumber === OVERLAY_PAGE_NUMBER &&
            toolMode === 'select' &&
            (() => {
              const sh = (annotations.shapes || []).find((s) => s.id === selectedObject.id);
              if (!sh) return null;
              const dx = draggingShape?.id === sh.id ? draggingShape.dx : 0;
              const dy = draggingShape?.id === sh.id ? draggingShape.dy : 0;
              const anchorX = (sh.x1 + sh.x2) / 2 + dx;
              const anchorY = Math.min(sh.y1, sh.y2) + dy;
              return (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteShape(OVERLAY_PAGE_NUMBER, sh.id);
                    onSelectObject(null);
                  }}
                  title="Seçili şekli sil (Delete)"
                  className="absolute z-20 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer"
                  style={{
                    left: `${Math.max(0.06, Math.min(0.94, anchorX)) * 100}%`,
                    top: `${Math.max(0.05, anchorY - 0.01) * 100}%`,
                  }}
                >
                  {isStampShapeType(sh.shapeType) ? 'Sembolü Sil ✕' : 'Şekli Sil ✕'}
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
                fontSize: `${editingText.fontSizeRatio * boardHeightPx}px`,
                lineHeight: 1.25,
                color: editingText.color,
                fontWeight: editingText.bold ? 700 : 400,
                maxWidth: `${Math.max(120, (1 - editingText.x) * boardWidthPx - 8)}px`,
              }}
            />
          )}
        </div>

        {/* Sağ Üst Yüzen Kontrol Şeridi: Boş/Kareli Geçiş, PDF'e Kalıcı Ekle, Temizle ve Kapat */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-md px-2 py-1.5"
        >
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              aria-pressed={mode === 'blank'}
              onClick={() => onSwitchMode('blank')}
              title="Boş Sayfa görünümüne geç"
              className={`h-8 px-2.5 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'blank'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <BlankPageAddIcon className="w-3.5 h-3.5" />
              <span>Boş</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === 'grid'}
              onClick={() => onSwitchMode('grid')}
              title="Kareli Sayfa görünümüne geç"
              className={`h-8 px-2.5 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'grid'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-800'
              }`}
            >
              <GridPageAddIcon className="w-3.5 h-3.5" />
              <span>Kareli</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isInsertingPage}
            onClick={() => onInsertIntoPdf(mode)}
            title={
              hasPdfDocument
                ? "Bu sayfayı PDF'e kalıcı sayfa olarak ekle"
                : 'Bu türde kalıcı PDF belgesi oluştur'
            }
            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            {hasPdfDocument ? "PDF'e Ekle" : 'PDF Oluştur'}
          </button>

          <button
            type="button"
            disabled={!hasBoardContent}
            onClick={onClearBoard}
            title="Bu sayfadaki çizimleri temizle (Ctrl+Z ile geri alınabilir)"
            aria-label="Tahtayı temizle"
            className="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Kapat ve PDF'e geri dön (üstteki sayfa simgesine tekrar basarak da kapatabilirsiniz)"
            aria-label="Sayfa katmanını kapat"
            className="h-8 px-2.5 rounded-lg inline-flex items-center gap-1 text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
