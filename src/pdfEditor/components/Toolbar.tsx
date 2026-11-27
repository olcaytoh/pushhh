// Sabit (sticky) tek satırlık üst araç çubuğu: sayfa gezinme, boş/kareli sayfa ekleme, yakınlaştırma, çizgi yumuşatma, sadece simgeli aktif mod ve kayıt kontrolleri
import React, { useEffect, useState } from 'react';
import {
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  type FontSizeKey,
  PEN_WIDTH_RATIOS,
  type PenWidthKey,
  SHAPE_COLOR_OPTIONS,
  SHAPE_FILL_MODE_OPTIONS,
  SHAPE_OPTIONS,
  type ShapeFillMode,
  type ShapeType,
  STAMP_OPTIONS,
  STAMP_SIZE_RATIOS,
  type StampSizeKey,
  type StampType,
  STROKE_SMOOTHING_OPTIONS,
  type StrokeSmoothingLevel,
  type ToolMode,
} from '../types/pdf';
import {
  BlankPageAddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CursorSelectIcon,
  EraserToolIcon,
  ExportFlatIcon,
  FitWidthIcon,
  FolderOpenIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GridPageAddIcon,
  HomeBackIcon,
  MergePdfIcon,
  PenToolIcon,
  RedoIcon,
  SaveAsIcon,
  SaveIcon,
  SettingsIcon,
  ShapeArrowIcon,
  ShapeCircleIcon,
  ShapeEllipseIcon,
  ShapeLineIcon,
  ShapeRectIcon,
  ShapeRightTriangleIcon,
  ShapeSquareIcon,
  ShapeTriangleIcon,
  StampCheckIcon,
  StampCrossIcon,
  StampExclamationIcon,
  StampHeartIcon,
  StampQuestionIcon,
  StampStarIcon,
  StrokeSmoothIcon,
  TextToolIcon,
  ThumbnailsSidebarIcon,
  TrashIcon,
  UndoIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './Icons';

import type { InsertPageKind } from '../utils/pdfExporter';

interface ToolbarProps {
  hasDocument: boolean;
  hasInteractiveCanvas: boolean;
  overlayBoardMode: InsertPageKind | null;
  fileName: string;
  hasUnsavedChanges: boolean;
  canOverwriteHandle: boolean;
  currentPage: number;
  numPages: number;
  zoom: number;
  toolMode: ToolMode;
  activeColor: string;
  fontSizeKey: FontSizeKey;
  bold: boolean;
  penWidthKey: PenWidthKey;
  strokeSmoothing: StrokeSmoothingLevel;
  activeShapeType: ShapeType;
  activeShapeFillMode: ShapeFillMode;
  activeShapeBorderColor: string;
  activeShapeFillColor: string;
  activeStampType: StampType;
  stampSizeKey: StampSizeKey;
  canUndo: boolean;
  canRedo: boolean;
  hasCurrentPageAnnotations: boolean;
  hasAnyAnnotations: boolean;
  isFullscreen: boolean;
  isExporting: boolean;
  isInsertingPage: boolean;
  isMergingPdfs: boolean;
  isThumbnailSidebarOpen: boolean;
  onExitToSite?: () => void;
  onOpenPdfClick: () => void;
  onOpenMergeModal: () => void;
  onToggleThumbnailSidebar: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (pageNum: number) => void;
  onToggleBlankOverlay: () => void;
  onToggleGridOverlay: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onSelectStrokeSmoothing: (level: StrokeSmoothingLevel) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClearPage: () => void;
  onRequestClearAll: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onSaveOverwrite: () => void;
  onSaveAsEditable: () => void;
  onExportFlatPdf: () => void;
}

/** Her araç modu için görsel vurgu ve aktif mod indikatörü tanımları */
const MODE_META: Record<
  ToolMode,
  {
    fullLabel: string;
    badgeBg: string;
    dotColor: string;
  }
> = {
  select: {
    fullLabel: 'İmleç / Seç',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-300',
    dotColor: 'bg-blue-600',
  },
  text: {
    fullLabel: 'Yazı Ekle (T)',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    dotColor: 'bg-indigo-600',
  },
  pen: {
    fullLabel: 'Serbest Kalem',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-600',
  },
  shape: {
    fullLabel: 'Geometrik Şekil',
    badgeBg: 'bg-violet-50 text-violet-800 border-violet-300',
    dotColor: 'bg-violet-600',
  },
  stamp: {
    fullLabel: 'Sembol Ekle',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-300',
    dotColor: 'bg-teal-600',
  },
  eraser: {
    fullLabel: 'Silgi Modu',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-600',
  },
};

const ACTIVE_DOT_PX: Record<PenWidthKey, number> = {
  thin: 5,
  medium: 8,
  thick: 12,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  hasDocument,
  hasInteractiveCanvas,
  overlayBoardMode,
  fileName,
  hasUnsavedChanges,
  canOverwriteHandle,
  currentPage,
  numPages,
  zoom,
  toolMode,
  activeColor,
  fontSizeKey,
  bold,
  penWidthKey,
  strokeSmoothing,
  activeShapeType,
  activeShapeFillMode,
  activeShapeBorderColor,
  activeShapeFillColor,
  activeStampType,
  stampSizeKey,
  canUndo,
  canRedo,
  hasCurrentPageAnnotations,
  hasAnyAnnotations,
  isFullscreen,
  isExporting,
  isInsertingPage,
  isMergingPdfs,
  isThumbnailSidebarOpen,
  onExitToSite,
  onOpenPdfClick,
  onOpenMergeModal,
  onToggleThumbnailSidebar,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onToggleBlankOverlay,
  onToggleGridOverlay,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onSelectStrokeSmoothing,
  onUndo,
  onRedo,
  onRequestClearPage,
  onRequestClearAll,
  onToggleFullscreen,
  onOpenSettings,
  onSaveOverwrite,
  onSaveAsEditable,
  onExportFlatPdf,
}) => {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [isEditingPage, setIsEditingPage] = useState(false);

  useEffect(() => {
    if (!isEditingPage) {
      setPageInput(String(currentPage));
    }
  }, [currentPage, isEditingPage]);

  const commitPageJump = (rawValue: string) => {
    if (!hasDocument || numPages < 1) {
      setPageInput(String(currentPage));
      return;
    }
    const parsed = parseInt(rawValue.trim(), 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      const clamped = Math.max(1, Math.min(numPages, parsed));
      setPageInput(String(clamped));
      onJumpToPage(clamped);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingPage(false);
    commitPageJump(pageInput);
    if (document.activeElement instanceof HTMLInputElement) {
      document.activeElement.blur();
    }
  };

  // Tek satırda maksimum PDF alanı açan, dokunmatik dostu 40px butonlar
  const baseBtn =
    'min-w-[40px] h-[40px] px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-all select-none cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0';
  const iconOnlyBtn =
    'w-[40px] h-[40px] rounded-xl inline-flex items-center justify-center transition-all select-none cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0';

  const activeModeInfo = MODE_META[toolMode];
  const getColorLabel = (hex: string) =>
    SHAPE_COLOR_OPTIONS.find((c) => c.value === hex)?.label ||
    COLOR_OPTIONS.find((c) => c.value === hex)?.label ||
    (hex === '#16a34a' ? 'Yeşil' : hex === '#e11d48' ? 'Pembe' : 'Özel');
  const activeColorLabel = getColorLabel(activeColor);
  const activeShapeMeta =
    SHAPE_OPTIONS.find((s) => s.type === activeShapeType) || SHAPE_OPTIONS[0];
  const activeStampMeta =
    STAMP_OPTIONS.find((s) => s.type === activeStampType) || STAMP_OPTIONS[0];

  const renderShapeIcon = (shapeType: ShapeType, className = 'w-5 h-5') => {
    switch (shapeType) {
      case 'line':
        return <ShapeLineIcon className={className} />;
      case 'arrow':
        return <ShapeArrowIcon className={className} />;
      case 'square':
        return <ShapeSquareIcon className={className} />;
      case 'rectangle':
        return <ShapeRectIcon className={className} />;
      case 'circle':
        return <ShapeCircleIcon className={className} />;
      case 'ellipse':
        return <ShapeEllipseIcon className={className} />;
      case 'triangle':
        return <ShapeTriangleIcon className={className} />;
      case 'right-triangle':
        return <ShapeRightTriangleIcon className={className} />;
      default:
        return <ShapeRectIcon className={className} />;
    }
  };

  const renderStampIcon = (stampType: StampType, className = 'w-5 h-5') => {
    switch (stampType) {
      case 'check':
        return <StampCheckIcon className={className} />;
      case 'cross':
        return <StampCrossIcon className={className} />;
      case 'star':
        return <StampStarIcon className={className} />;
      case 'question':
        return <StampQuestionIcon className={className} />;
      case 'exclamation':
        return <StampExclamationIcon className={className} />;
      case 'heart':
        return <StampHeartIcon className={className} />;
      default:
        return <StampCheckIcon className={className} />;
    }
  };

  const renderActiveModeIcon = (mode: ToolMode, className = 'w-5 h-5') => {
    switch (mode) {
      case 'text':
        return <TextToolIcon className={className} />;
      case 'pen':
        return <PenToolIcon className={className} />;
      case 'shape':
        return renderShapeIcon(activeShapeType, className);
      case 'stamp':
        return renderStampIcon(activeStampType, className);
      case 'eraser':
        return <EraserToolIcon className={className} />;
      case 'select':
      default:
        return <CursorSelectIcon className={className} />;
    }
  };

  // Sadece simge gösteren Aktif Mod göstergesinin erişilebilirlik ve ipucu (tooltip) metni
  const activeModeTooltip = (() => {
    const base =
      toolMode === 'shape'
        ? `Aktif Mod: ${activeModeInfo.fullLabel} (${activeShapeMeta.label})`
        : toolMode === 'stamp'
          ? `Aktif Mod: ${activeModeInfo.fullLabel} (${activeStampMeta.label})`
          : `Aktif Mod: ${activeModeInfo.fullLabel}`;

    if (toolMode === 'pen') {
      return `${base} · ${activeColorLabel} · ${PEN_WIDTH_RATIOS[penWidthKey].label} · Yumuşatma: ${STROKE_SMOOTHING_OPTIONS[strokeSmoothing].label}`;
    }
    if (toolMode === 'text') {
      return `${base} · ${activeColorLabel} · ${FONT_SIZE_RATIOS[fontSizeKey].label}${bold ? ' · Kalın' : ''}`;
    }
    if (toolMode === 'shape') {
      const fillPart = activeShapeMeta.closable
        ? ` · İç: ${SHAPE_FILL_MODE_OPTIONS[activeShapeFillMode].label}${
            activeShapeFillMode !== 'none' ? ` (${getColorLabel(activeShapeFillColor)})` : ''
          }`
        : '';
      return `${base} · Kenar: ${getColorLabel(activeShapeBorderColor)} · ${PEN_WIDTH_RATIOS[penWidthKey].label}${fillPart}`;
    }
    if (toolMode === 'stamp') {
      return `${base} · ${activeColorLabel} · ${STAMP_SIZE_RATIOS[stampSizeKey].label}`;
    }
    return base;
  })();

  const saveTitle = canOverwriteHandle
    ? `${fileName ? `${fileName} — ` : ''}Kaydet (Ctrl+S): Açılan dosyanın üzerine düzenlenebilir olarak yazar`
    : `${fileName ? `${fileName} — ` : ''}Kaydet (Ctrl+S): Düzenlenebilir kopya indirir`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm text-slate-800">
      {/* Tek Satırlık Kompakt Ana Üst Araç Çubuğu */}
      <div className="px-2.5 py-1.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {/* Siteye Dön + PDF Aç */}
        <div className="flex items-center gap-1 shrink-0">
          {onExitToSite && (
            <button
              type="button"
              onClick={onExitToSite}
              title="Ana siteye geri dön"
              aria-label="Siteye Dön"
              className={`${baseBtn} bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300`}
            >
              <HomeBackIcon className="w-5 h-5" />
              <span className="hidden 2xl:inline">Siteye Dön</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPdfClick}
            title={
              fileName
                ? `Açık dosya: ${fileName} (Yeni PDF seçmek için tıklayın)`
                : "Yerel PDF dosyası seç (Chrome'da üzerine yazma destekli)"
            }
            aria-label="PDF Aç"
            className={`${baseBtn} bg-slate-900 text-white hover:bg-slate-800 px-3 shadow-sm`}
          >
            <FolderOpenIcon className="w-5 h-5" />
            <span className="hidden xl:inline">PDF Aç</span>
          </button>

          <button
            type="button"
            disabled={isMergingPdfs || isExporting || isInsertingPage}
            onClick={onOpenMergeModal}
            title="Birden fazla PDF dosyasını seçip tek bir belgede uç uca birleştir"
            aria-label="PDF Birleştir"
            className={`${baseBtn} bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100`}
          >
            <MergePdfIcon className="w-5 h-5" />
            <span className="hidden xl:inline">Birleştir</span>
          </button>
        </div>

        {/* Sayfa Gezinme + Boş/Kareli Sayfa Ekleme Grubu */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 shrink-0">
          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={hasDocument && isThumbnailSidebarOpen}
            onClick={onToggleThumbnailSidebar}
            title={
              isThumbnailSidebarOpen
                ? 'Sayfa önizleme sütununu gizle'
                : 'Sayfa önizleme sütununu göster'
            }
            aria-label="Sayfa Önizlemeleri"
            className={`${iconOnlyBtn} border ${
              hasDocument && isThumbnailSidebarOpen
                ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ThumbnailsSidebarIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasDocument || currentPage <= 1}
            onClick={onPrevPage}
            title="Önceki Sayfa"
            aria-label="Önceki Sayfa"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <form onSubmit={handlePageSubmit} className="flex items-center gap-1 px-0.5">
            <input
              type="text"
              inputMode="numeric"
              disabled={!hasDocument}
              value={hasDocument ? pageInput : ''}
              placeholder="-"
              onFocus={(e) => {
                setIsEditingPage(true);
                e.currentTarget.select();
              }}
              onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditingPage(false);
                  setPageInput(String(currentPage));
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                setIsEditingPage(false);
                if (pageInput.trim() !== '' && pageInput.trim() !== String(currentPage)) {
                  commitPageJump(pageInput);
                } else {
                  setPageInput(String(currentPage));
                }
              }}
              aria-label="Sayfa numarası"
              title="Gitmek istediğiniz sayfa numarasını yazıp Enter'a veya Git butonuna basın"
              className="w-11 h-[40px] text-center text-sm font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
            <span className="text-xs sm:text-sm text-slate-500 font-semibold whitespace-nowrap">
              / {hasDocument ? numPages : 0}
            </span>
            <button
              type="submit"
              disabled={!hasDocument}
              onMouseDown={(e) => e.preventDefault()}
              title="Yazılan sayfa numarasına doğrudan git"
              aria-label="Sayfaya Git"
              className={`h-[40px] px-2 rounded-xl text-xs font-bold border transition-all select-none cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                hasDocument && pageInput.trim() !== '' && pageInput.trim() !== String(currentPage)
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Git
            </button>
          </form>

          <button
            type="button"
            disabled={!hasDocument || currentPage >= numPages}
            onClick={onNextPage}
            title="Sonraki Sayfa"
            aria-label="Sonraki Sayfa"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={isInsertingPage || isExporting}
            aria-pressed={overlayBoardMode === 'blank'}
            onClick={onToggleBlankOverlay}
            title={
              overlayBoardMode === 'blank'
                ? "Boş Sayfa katmanını kapat ve PDF'e dön"
                : 'PDF üzerine Boş Sayfa aç (tekrar tıklayınca kapanır)'
            }
            aria-label="Boş Sayfa Aç / Kapat"
            className={`${iconOnlyBtn} border ${
              overlayBoardMode === 'blank'
                ? 'bg-amber-500 border-amber-600 text-white ring-2 ring-amber-300 shadow-sm'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <BlankPageAddIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={isInsertingPage || isExporting}
            aria-pressed={overlayBoardMode === 'grid'}
            onClick={onToggleGridOverlay}
            title={
              overlayBoardMode === 'grid'
                ? "Kareli Sayfa katmanını kapat ve PDF'e dön"
                : 'PDF üzerine Kareli Sayfa aç (tekrar tıklayınca kapanır)'
            }
            aria-label="Kareli Sayfa Aç / Kapat"
            className={`${iconOnlyBtn} border ${
              overlayBoardMode === 'grid'
                ? 'bg-sky-600 border-sky-700 text-white ring-2 ring-sky-300 shadow-sm'
                : 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <GridPageAddIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Yakınlaştırma Grubu */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 shrink-0">
          <button
            type="button"
            disabled={!hasDocument || zoom <= 0.501}
            onClick={onZoomOut}
            title="Uzaklaştır (−)"
            aria-label="Uzaklaştır"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ZoomOutIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={onFitWidth}
            title="Genişliğe Sığdır"
            className={`${baseBtn} bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 min-w-[60px] px-2 text-xs font-bold`}
          >
            <FitWidthIcon className="w-4 h-4 hidden 2xl:inline" />
            <span>%{Math.round(zoom * 100)}</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || zoom >= 3.999}
            onClick={onZoomIn}
            title="Yakınlaştır (+)"
            aria-label="Yakınlaştır"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Geri Al / Yinele, Temizleme, Çizgi Yumuşatma ve Sadece Simgeli Aktif Mod */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 shrink-0">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Geri Al (Ctrl+Z)"
            aria-label="Geri Al"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <UndoIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Yinele (Ctrl+Y veya Ctrl+Shift+Z)"
            aria-label="Yinele"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <RedoIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasInteractiveCanvas || !hasCurrentPageAnnotations}
            onClick={onRequestClearPage}
            title={
              overlayBoardMode
                ? 'Açık Boş/Kareli Sayfadaki Çizimleri Temizle (geri alınabilir)'
                : 'Bu Sayfadaki Notları Temizle (geri alınabilir)'
            }
            aria-label="Sayfayı Temizle"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs`}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden 2xl:inline">Sayfayı Temizle</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || Boolean(overlayBoardMode) || !hasAnyAnnotations}
            onClick={onRequestClearAll}
            title="Tüm PDF Notlarını Temizle (geri alınabilir)"
            aria-label="Tümünü Temizle"
            className={`${baseBtn} bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs`}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden 2xl:inline">Tümünü Temizle</span>
          </button>

          {/* Çizgi Yumuşatma: Doğrudan Tümünü Temizle'nin yanında */}
          <div
            role="group"
            aria-label="Çizgi yumuşatma düzeyi"
            title={`Çizgi Yumuşatma: ${STROKE_SMOOTHING_OPTIONS[strokeSmoothing].description}`}
            className={`h-[40px] px-1 rounded-xl bg-emerald-50/85 border border-emerald-200 inline-flex items-center gap-0.5 shrink-0 ${
              !hasInteractiveCanvas ? 'opacity-45 pointer-events-none' : ''
            }`}
          >
            <span
              title="Çizgi Yumuşatma"
              className="w-7 h-7 rounded-lg text-emerald-800 inline-flex items-center justify-center shrink-0"
            >
              <StrokeSmoothIcon className="w-4 h-4" />
            </span>
            {(Object.keys(STROKE_SMOOTHING_OPTIONS) as StrokeSmoothingLevel[]).map((level) => {
              const opt = STROKE_SMOOTHING_OPTIONS[level];
              const isSelected = strokeSmoothing === level;
              return (
                <button
                  key={level}
                  type="button"
                  disabled={!hasInteractiveCanvas}
                  aria-pressed={isSelected}
                  onClick={() => onSelectStrokeSmoothing(level)}
                  title={`Çizgi Yumuşatma — ${opt.label}: ${opt.description}`}
                  className={`h-[30px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Aktif Mod Göstergesi (Sadece Simgeler): Doğrudan Çizgi Yumuşatma'nın yanında */}
          <div
            role="status"
            aria-live="polite"
            aria-label={activeModeTooltip}
            title={activeModeTooltip}
            className={`h-[40px] px-2 rounded-xl border inline-flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors ${activeModeInfo.badgeBg}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${activeModeInfo.dotColor} shrink-0`} />
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={toolMode === 'stamp' ? { color: activeColor } : undefined}
            >
              {renderActiveModeIcon(toolMode, 'w-5 h-5')}
            </span>

            {(toolMode === 'pen' ||
              toolMode === 'text' ||
              toolMode === 'shape' ||
              toolMode === 'stamp') && (
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/25 shrink-0"
                style={{
                  backgroundColor: toolMode === 'shape' ? activeShapeBorderColor : activeColor,
                }}
              />
            )}

            {(toolMode === 'pen' || toolMode === 'shape') && (
              <span
                className="rounded-full bg-current shrink-0"
                style={{
                  width: `${ACTIVE_DOT_PX[penWidthKey]}px`,
                  height: `${ACTIVE_DOT_PX[penWidthKey]}px`,
                }}
              />
            )}

            {toolMode === 'shape' &&
              activeShapeMeta.closable &&
              activeShapeFillMode !== 'none' && (
                <span
                  className="w-3.5 h-3.5 rounded-sm border border-black/25 shrink-0"
                  style={{
                    backgroundColor: activeShapeFillColor,
                    opacity: activeShapeFillMode === 'translucent' ? 0.45 : 1,
                  }}
                />
              )}
          </div>
        </div>

        {/* Sağ Bölüm: Ayarlar, Tam Ekran, Kaydet, Farklı Kaydet ve Düz PDF — En üstte sağda sadece simge */}
        <div className="flex items-center gap-1 ml-auto pl-1.5 border-l border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            title="Ayarlar, Türkçe Font Seçimi ve Yardım"
            aria-label="Ayarlar"
            className={`${iconOnlyBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran Moduna Geç'}
            aria-label={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            className={`${iconOnlyBtn} border ${
              isFullscreen
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-sm'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isFullscreen ? (
              <FullscreenExitIcon className="w-5 h-5" />
            ) : (
              <FullscreenEnterIcon className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onSaveOverwrite}
            title={isExporting ? 'Kaydediliyor...' : saveTitle}
            aria-label={isExporting ? 'Kaydediliyor...' : 'Kaydet'}
            className={`${iconOnlyBtn} bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm relative`}
          >
            <SaveIcon className={`w-5 h-5 ${isExporting ? 'animate-pulse' : ''}`} />
            {hasUnsavedChanges && !isExporting && (
              <span
                title="Kaydedilmemiş değişiklikler var"
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300 ring-1 ring-emerald-700"
              />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onSaveAsEditable}
            title="Farklı Kaydet: Notları düzenlenebilir olarak yeni PDF dosyasına kaydeder"
            aria-label="Farklı Kaydet"
            className={`${iconOnlyBtn} bg-blue-600 text-white hover:bg-blue-700 shadow-sm`}
          >
            <SaveAsIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onExportFlatPdf}
            title="Düz PDF Olarak Dışa Aktar: Notlar kalıcı işlenir, ek gömülmez (paylaşıma uygun)"
            aria-label="Düz PDF Olarak Dışa Aktar"
            className={`${iconOnlyBtn} bg-slate-700 text-white hover:bg-slate-800 shadow-sm`}
          >
            <ExportFlatIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
