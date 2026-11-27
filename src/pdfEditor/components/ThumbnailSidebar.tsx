// Tüm PDF sayfalarının küçük önizlemelerini (thumbnails) gösteren hızlı gezinti sütunu (%100 çevrimdışı)
import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api';
import type { AnnotationsMap, PageMeta } from '../types/pdf';
import { CloseIcon, ThumbnailsSidebarIcon } from './Icons';

interface ThumbnailCardProps {
  pdfDoc: PDFDocumentProxy;
  docRevision: number;
  meta: PageMeta;
  isActive: boolean;
  hasAnnotations: boolean;
  onSelect: (pageNumber: number) => void;
}

const THUMB_WIDTH_PX = 108;

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  pdfDoc,
  docRevision,
  meta,
  isActive,
  hasAnnotations,
  onSelect,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  const aspectRatio = meta.baseHeight / Math.max(1, meta.baseWidth);
  const thumbHeightPx = Math.max(60, Math.min(200, Math.round(THUMB_WIDTH_PX * aspectRatio)));

  // Görünürlük algılama (çok sayfalı PDF'lerde yüksek performans için tembel çizim)
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '260px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [docRevision]);

  // Aktif sayfa değiştiğinde ilgili önizlemeyi yan panelde görünür alana kaydır
  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isActive]);

  // Önizleme canvas'ını çiz
  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    setIsRendered(false);

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(meta.pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const cssScale = THUMB_WIDTH_PX / Math.max(1, baseViewport.width);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const viewport = page.getViewport({ scale: cssScale * dpr });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Yoksay
          }
          renderTaskRef.current = null;
        }

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) {
          setIsRendered(true);
        }
      } catch {
        // İptal veya geçici çizim hatasını sessizce yoksay
      } finally {
        renderTaskRef.current = null;
      }
    };

    void renderThumbnail();

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
  }, [pdfDoc, docRevision, meta.pageNumber, isVisible]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onSelect(meta.pageNumber)}
      aria-current={isActive ? 'page' : undefined}
      title={`Sayfa ${meta.pageNumber} — gitmek için tıklayın`}
      className={`group w-full rounded-xl p-1.5 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer border text-left ${
        isActive
          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/70 shadow-sm'
          : 'bg-white border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/35 hover:shadow-xs'
      }`}
    >
      <div
        className="relative rounded-md overflow-hidden bg-white shadow-2xs ring-1 ring-slate-200/90 flex items-center justify-center shrink-0"
        style={{
          width: `${THUMB_WIDTH_PX}px`,
          height: `${thumbHeightPx}px`,
        }}
      >
        {!isRendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[11px] font-semibold text-slate-400">
            {meta.pageNumber}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`block w-full h-full object-contain transition-opacity duration-150 ${
            isRendered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {hasAnnotations && (
          <span
            title="Bu sayfada not / çizim var"
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
          />
        )}
      </div>

      <span
        className={`text-[11px] font-bold leading-none px-2 py-0.5 rounded-md transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-600 group-hover:text-blue-700'
        }`}
      >
        {meta.pageNumber}
      </span>
    </button>
  );
};

export interface ThumbnailSidebarProps {
  pdfDoc: PDFDocumentProxy;
  docRevision: number;
  pagesMeta: PageMeta[];
  currentPage: number;
  annotations: AnnotationsMap;
  onSelectPage: (pageNumber: number) => void;
  onClose: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pdfDoc,
  docRevision,
  pagesMeta,
  currentPage,
  annotations,
  onSelectPage,
  onClose,
}) => {
  return (
    <aside
      aria-label="Sayfa önizlemeleri gezinti paneli"
      className="w-[136px] sm:w-[148px] h-full bg-slate-50/95 backdrop-blur border-r border-slate-200 shadow-2xs flex flex-col shrink-0 z-10 select-none"
    >
      <div className="px-2.5 py-2 border-b border-slate-200 bg-white/90 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <ThumbnailsSidebarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-extrabold text-slate-800 truncate">Sayfalar</span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {pagesMeta.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Önizleme panelini gizle"
          aria-label="Önizleme panelini gizle"
          className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto workspace-scroll px-2 py-2.5 space-y-2.5">
        {pagesMeta.map((meta) => {
          const pageAnn = annotations[meta.pageNumber];
          const hasAnnotations = Boolean(
            pageAnn &&
              (pageAnn.texts.length > 0 ||
                pageAnn.strokes.length > 0 ||
                (pageAnn.shapes?.length || 0) > 0),
          );
          return (
            <ThumbnailCard
              key={`${docRevision}-${meta.pageNumber}`}
              pdfDoc={pdfDoc}
              docRevision={docRevision}
              meta={meta}
              isActive={currentPage === meta.pageNumber}
              hasAnnotations={hasAnnotations}
              onSelect={onSelectPage}
            />
          );
        })}
      </div>
    </aside>
  );
};
