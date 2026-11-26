// Sabit (sticky) üst araç çubuğu: akıllı tahta/dokunmatik ekranlar için geniş aralıklı ikonlar, belirgin Aktif Mod indikatörü ve Tam Ekran kontrolü
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
  ChevronLeftIcon,
  ChevronRightIcon,
  CursorSelectIcon,
  EraserToolIcon,
  ExportFlatIcon,
  FitWidthIcon,
  FolderOpenIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  HomeBackIcon,
  PenToolIcon,
  RedoIcon,
  SaveAsIcon,
  SaveIcon,
  SettingsIcon,
  ShapeArrowIcon,
  ShapeCircleIcon,
  ShapeEllipseIcon,
  ShapeFillIcon,
  ShapeLineIcon,
  ShapeRectIcon,
  ShapeRightTriangleIcon,
  ShapeSquareIcon,
  ShapeTriangleIcon,
  ShapesToolIcon,
  StampCheckIcon,
  StampCrossIcon,
  StampExclamationIcon,
  StampHeartIcon,
  StampQuestionIcon,
  StampStarIcon,
  StampToolIcon,
  StrokeSmoothIcon,
  TextToolIcon,
  TrashIcon,
  UndoIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './Icons';

interface ToolbarProps {
  hasDocument: boolean;
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
  syncShapeFillWithBorder: boolean;
  isGeometricShapeSelected: boolean;
  activeStampType: StampType;
  stampSizeKey: StampSizeKey;
  canUndo: boolean;
  canRedo: boolean;
  hasCurrentPageAnnotations: boolean;
  hasAnyAnnotations: boolean;
  isFullscreen: boolean;
  isExporting: boolean;
  onExitToSite?: () => void;
  onOpenPdfClick: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (pageNum: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onSelectTool: (mode: ToolMode) => void;
  onSelectColor: (hex: string) => void;
  onSelectFontSize: (key: FontSizeKey) => void;
  onToggleBold: () => void;
  onSelectPenWidth: (key: PenWidthKey) => void;
  onSelectStrokeSmoothing: (level: StrokeSmoothingLevel) => void;
  onSelectShapeType: (shape: ShapeType) => void;
  onSelectShapeFillMode: (mode: ShapeFillMode) => void;
  onSelectShapeBorderColor: (hex: string) => void;
  onSelectShapeFillColor: (hex: string) => void;
  onToggleSyncShapeFill: () => void;
  onSelectStampType: (stamp: StampType) => void;
  onSelectStampSize: (key: StampSizeKey) => void;
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
    shortLabel: string;
    fullLabel: string;
    hint: string;
    activeBtn: string;
    badgeBg: string;
    dotColor: string;
  }
> = {
  select: {
    shortLabel: 'İmleç',
    fullLabel: 'İmleç / Seç',
    hint: 'Seç, sürükle veya çift tıkla düzenle',
    activeBtn: 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 shadow-md',
    badgeBg: 'bg-blue-50 text-blue-900 border-blue-300',
    dotColor: 'bg-blue-600',
  },
  text: {
    shortLabel: 'Yazı',
    fullLabel: 'Yazı Ekle (T)',
    hint: 'Yazmak için sayfada bir yere dokun',
    activeBtn: 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-md',
    badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    dotColor: 'bg-indigo-600',
  },
  pen: {
    shortLabel: 'Kalem',
    fullLabel: 'Serbest Kalem',
    hint: 'Basılı tutarak serbest çizim yap',
    activeBtn: 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md',
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    dotColor: 'bg-emerald-600',
  },
  shape: {
    shortLabel: 'Şekiller',
    fullLabel: 'Geometrik Şekil',
    hint: 'Sürükleyerek şekil çiz (Shift ile düzgün kare/çember)',
    activeBtn: 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-300 shadow-md',
    badgeBg: 'bg-violet-50 text-violet-900 border-violet-300',
    dotColor: 'bg-violet-600',
  },
  stamp: {
    shortLabel: 'Sembol',
    fullLabel: 'Sembol Ekle',
    hint: 'Tek dokunuşla ekle veya sürükleyerek boyutlandır',
    activeBtn: 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-300 shadow-md',
    badgeBg: 'bg-teal-50 text-teal-900 border-teal-300',
    dotColor: 'bg-teal-600',
  },
  eraser: {
    shortLabel: 'Silgi',
    fullLabel: 'Silgi Modu',
    hint: 'Silmek için notların, şekillerin veya sembollerin üzerinden geç',
    activeBtn: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 shadow-md',
    badgeBg: 'bg-rose-50 text-rose-900 border-rose-300',
    dotColor: 'bg-rose-600',
  },
};

export const Toolbar: React.FC<ToolbarProps> = ({
  hasDocument,
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
  syncShapeFillWithBorder,
  isGeometricShapeSelected,
  activeStampType,
  stampSizeKey,
  canUndo,
  canRedo,
  hasCurrentPageAnnotations,
  hasAnyAnnotations,
  isFullscreen,
  isExporting,
  onExitToSite,
  onOpenPdfClick,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onSelectTool,
  onSelectColor,
  onSelectFontSize,
  onToggleBold,
  onSelectPenWidth,
  onSelectStrokeSmoothing,
  onSelectShapeType,
  onSelectShapeFillMode,
  onSelectShapeBorderColor,
  onSelectShapeFillColor,
  onToggleSyncShapeFill,
  onSelectStampType,
  onSelectStampSize,
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

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      onJumpToPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Dokunmatik ekran ve akıllı tahta konforu için geniş 44-46px butonlar ve ferah aralıklar
  const baseBtn =
    'min-w-[44px] min-h-[44px] px-3 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-semibold transition-all select-none cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

  const modeBtnClass = (mode: ToolMode) => {
    const active = toolMode === mode;
    return `${baseBtn} relative border ${
      active
        ? `${MODE_META[mode].activeBtn} scale-[1.02]`
        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
    }`;
  };

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

  const renderActiveModeIcon = (mode: ToolMode, className = 'w-4 h-4') => {
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm text-slate-800">
      {/* Ana Araç Çubuğu: Dokunmatik dostu geniş aralıklı buton grupları */}
      <div className="px-3 py-2.5 flex flex-wrap items-center gap-2.5">
        {/* Siteye Dön + PDF Aç */}
        <div className="flex items-center gap-2">
          {onExitToSite && (
            <button
              type="button"
              onClick={onExitToSite}
              title="Ana siteye geri dön"
              className={`${baseBtn} bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300`}
            >
              <HomeBackIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Siteye Dön</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPdfClick}
            title="Yerel PDF dosyası seç (Chrome'da üzerine yazma destekli)"
            className={`${baseBtn} bg-slate-900 text-white hover:bg-slate-800 px-3.5 shadow-sm`}
          >
            <FolderOpenIcon className="w-5 h-5" />
            <span className="hidden sm:inline">PDF Aç</span>
          </button>
        </div>

        {/* Sayfa Gezinme Grubu */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
          <button
            type="button"
            disabled={!hasDocument || currentPage <= 1}
            onClick={onPrevPage}
            title="Önceki Sayfa"
            aria-label="Önceki Sayfa"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5 px-0.5">
            <input
              type="text"
              inputMode="numeric"
              disabled={!hasDocument}
              value={hasDocument ? pageInput : ''}
              placeholder="-"
              onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
              onBlur={handlePageSubmit}
              aria-label="Sayfa numarası"
              title="Gitmek istediğiniz sayfa numarasını yazıp Enter'a basın"
              className="w-13 h-[44px] text-center text-sm font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
            <span className="text-sm text-slate-500 font-semibold whitespace-nowrap">
              / {hasDocument ? numPages : 0}
            </span>
          </form>

          <button
            type="button"
            disabled={!hasDocument || currentPage >= numPages}
            onClick={onNextPage}
            title="Sonraki Sayfa"
            aria-label="Sonraki Sayfa"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Yakınlaştırma Grubu */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
          <button
            type="button"
            disabled={!hasDocument || zoom <= 0.501}
            onClick={onZoomOut}
            title="Uzaklaştır (−)"
            aria-label="Uzaklaştır"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ZoomOutIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={onFitWidth}
            title="Genişliğe Sığdır"
            className={`${baseBtn} bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 min-w-[74px] text-xs font-bold`}
          >
            <FitWidthIcon className="w-4 h-4 hidden md:inline" />
            <span>%{Math.round(zoom * 100)}</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || zoom >= 3.999}
            onClick={onZoomIn}
            title="Yakınlaştır (+)"
            aria-label="Yakınlaştır"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Araç Modları (İmleç / Yazı / Kalem / Silgi) - Geniş dokunma aralıklı ve renk kodlu */}
        <div
          role="group"
          aria-label="Çizim ve düzenleme modları"
          className="flex items-center gap-2 pl-2.5 border-l border-slate-200"
        >
          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'select'}
            onClick={() => onSelectTool('select')}
            title="İmleç / Seç: Yazıları seç, sürükle, çift tıkla düzenle; çizimleri seç ve Delete ile sil"
            className={modeBtnClass('select')}
          >
            <CursorSelectIcon className="w-5 h-5" />
            <span className="hidden md:inline">İmleç</span>
            {toolMode === 'select' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-blue-200" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'text'}
            onClick={() => onSelectTool('text')}
            title="Yazı (T): Sayfada tıklanan noktaya yazı ekle"
            className={modeBtnClass('text')}
          >
            <TextToolIcon className="w-5 h-5" />
            <span className="hidden md:inline">Yazı</span>
            {toolMode === 'text' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-indigo-200" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'pen'}
            onClick={() => onSelectTool('pen')}
            title="Kalem: Fare, kalem veya dokunmatik ekranla serbest çizim"
            className={modeBtnClass('pen')}
          >
            <PenToolIcon className="w-5 h-5" />
            <span className="hidden md:inline">Kalem</span>
            {toolMode === 'pen' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-emerald-200" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'shape'}
            onClick={() => onSelectTool('shape')}
            title="Geometrik Şekiller: Çizgi, ok, dikdörtgen, çember, üçgen ve dik üçgen çiz"
            className={modeBtnClass('shape')}
          >
            <ShapesToolIcon className="w-5 h-5" />
            <span className="hidden md:inline">Şekiller</span>
            {toolMode === 'shape' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-violet-200" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'stamp'}
            onClick={() => onSelectTool('stamp')}
            title="Semboller: Yeşil tik, kırmızı çarpı, yıldız, soru işareti, ünlem ve kalp damgala"
            className={modeBtnClass('stamp')}
          >
            <StampToolIcon className="w-5 h-5" />
            <span className="hidden md:inline">Sembol</span>
            {toolMode === 'stamp' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-teal-200" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            aria-pressed={toolMode === 'eraser'}
            onClick={() => onSelectTool('eraser')}
            title="Silgi: Tıklanan veya üzerinden geçilen yazı, çizim, şekil ve sembolleri sil"
            className={modeBtnClass('eraser')}
          >
            <EraserToolIcon className="w-5 h-5" />
            <span className="hidden md:inline">Silgi</span>
            {toolMode === 'eraser' && (
              <span className="absolute -bottom-1 left-2.5 right-2.5 h-1 rounded-full bg-rose-200" />
            )}
          </button>
        </div>

        {/* Stil Ayarları (Renk, Yazı Boyutu, Kalın, Kalem Kalınlığı) */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 h-[44px]">
            {COLOR_OPTIONS.map((c) => {
              const selected = activeColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  disabled={!hasDocument}
                  onClick={() => onSelectColor(c.value)}
                  title={`Renk: ${c.label}`}
                  aria-label={`Renk ${c.label}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer disabled:opacity-40 ${
                    selected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/15 block"
                    style={{ backgroundColor: c.value }}
                  />
                </button>
              );
            })}
          </div>

          <select
            disabled={!hasDocument}
            value={fontSizeKey}
            onChange={(e) => onSelectFontSize(e.target.value as FontSizeKey)}
            title="Yazı boyutu (yeni ve seçili metinlere uygulanır)"
            aria-label="Yazı boyutu"
            className="h-[44px] px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
          >
            {(Object.keys(FONT_SIZE_RATIOS) as FontSizeKey[]).map((key) => (
              <option key={key} value={key}>
                Yazı: {FONT_SIZE_RATIOS[key].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={onToggleBold}
            title="Kalın Yazı (Bold)"
            aria-label="Kalın"
            className={`${baseBtn} font-extrabold text-base border ${
              bold
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            K
          </button>

          <select
            disabled={!hasDocument}
            value={penWidthKey}
            onChange={(e) => onSelectPenWidth(e.target.value as PenWidthKey)}
            title="Kalem kalınlığı (yeni ve seçili çizimlere uygulanır)"
            aria-label="Kalem kalınlığı"
            className="h-[44px] px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
          >
            {(Object.keys(PEN_WIDTH_RATIOS) as PenWidthKey[]).map((key) => (
              <option key={key} value={key}>
                Kalem: {PEN_WIDTH_RATIOS[key].label}
              </option>
            ))}
          </select>
        </div>

        {/* Geri Al / Yinele ve Toplu Temizleme */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Geri Al (Ctrl+Z)"
            aria-label="Geri Al"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <UndoIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Yinele (Ctrl+Y veya Ctrl+Shift+Z)"
            aria-label="Yinele"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <RedoIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={!hasDocument || !hasCurrentPageAnnotations}
            onClick={onRequestClearPage}
            title="Bu Sayfadaki Notları Temizle (geri alınabilir)"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs`}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden xl:inline">Sayfayı Temizle</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || !hasAnyAnnotations}
            onClick={onRequestClearAll}
            title="Tüm Notları Temizle (geri alınabilir)"
            className={`${baseBtn} bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs`}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden xl:inline">Tümünü Temizle</span>
          </button>
        </div>

        {/* Sağ Bölüm: Ayarlar, Belirgin Tam Ekran Modu ve 3 Kaydetme Seçeneği */}
        <div className="flex flex-wrap items-center gap-2 ml-auto pl-2.5 border-l border-slate-200">
          <button
            type="button"
            onClick={onOpenSettings}
            title="Ayarlar, Türkçe Font Seçimi ve Yardım"
            aria-label="Ayarlar"
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran Moduna Geç'}
            aria-label={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            className={`${baseBtn} border ${
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
            <span className="hidden sm:inline">
              {isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            </span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onSaveOverwrite}
            title={
              canOverwriteHandle
                ? 'Kaydet (Ctrl+S): Açılan dosyanın üzerine düzenlenebilir olarak yazar'
                : 'Kaydet (Ctrl+S): Düzenlenebilir kopya indirir'
            }
            className={`${baseBtn} bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 shadow-sm relative`}
          >
            <SaveIcon className="w-5 h-5" />
            <span>{isExporting ? 'Kaydediliyor...' : 'Kaydet'}</span>
            {hasUnsavedChanges && !isExporting && (
              <span
                title="Kaydedilmemiş değişiklikler var"
                className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block"
              />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onSaveAsEditable}
            title="Farklı Kaydet: Notları düzenlenebilir olarak yeni PDF dosyasına kaydeder"
            className={`${baseBtn} bg-blue-600 text-white hover:bg-blue-700 px-3.5 shadow-sm`}
          >
            <SaveAsIcon className="w-5 h-5" />
            <span className="hidden md:inline">Farklı Kaydet</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onExportFlatPdf}
            title="Düz PDF Olarak Dışa Aktar: Notlar kalıcı işlenir, ek gömülmez (paylaşıma uygun)"
            className={`${baseBtn} bg-slate-700 text-white hover:bg-slate-800 px-3.5 shadow-sm`}
          >
            <ExportFlatIcon className="w-5 h-5" />
            <span className="hidden lg:inline">Düz PDF</span>
          </button>
        </div>
      </div>

      {/* Kalem Çizgi Yumuşatma (Stroke Smoothing) Alt Çubuğu */}
      {hasDocument && toolMode === 'pen' && (
        <div
          role="group"
          aria-label="Çizgi yumuşatma düzeyi"
          className="px-3 py-2 bg-emerald-50/75 border-t border-emerald-200/80 flex flex-wrap items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide mr-1">
            <StrokeSmoothIcon className="w-4 h-4 shrink-0" />
            <span>Çizgi Yumuşatma:</span>
          </span>
          {(Object.keys(STROKE_SMOOTHING_OPTIONS) as StrokeSmoothingLevel[]).map((level) => {
            const opt = STROKE_SMOOTHING_OPTIONS[level];
            const isSelected = strokeSmoothing === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectStrokeSmoothing(level)}
                title={opt.description}
                className={`min-h-[38px] px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-xs'
                    : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <span className="text-xs text-emerald-800/80 hidden sm:inline ml-1">
            {STROKE_SMOOTHING_OPTIONS[strokeSmoothing].description}
          </span>
        </div>
      )}

      {/* Geometrik Şekil Seçim & Kenar/İç Renk Alt Çubuğu */}
      {hasDocument && (toolMode === 'shape' || isGeometricShapeSelected) && (
        <div
          role="group"
          aria-label="Geometrik şekil, kenar rengi ve iç dolgu ayarları"
          className="px-3 py-2 bg-violet-50/80 border-t border-violet-200/80 flex flex-col gap-2"
        >
          {/* Satır 1: Şekil Türleri (yalnızca Şekiller modunda göster) */}
          {toolMode === 'shape' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-violet-900 uppercase tracking-wide mr-1">
                Şekil:
              </span>
              {SHAPE_OPTIONS.map((opt) => {
                const isSelected = activeShapeType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectShapeType(opt.type)}
                    title={opt.label}
                    className={`min-h-[40px] px-2.5 rounded-xl inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-300 shadow-sm'
                        : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-100/70'
                    }`}
                  >
                    {renderShapeIcon(opt.type, 'w-4 h-4 shrink-0')}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Satır 2: Dolgu Modu + Ayrı Kenar Rengi + Ayrı İç Rengi (ve Kenarla Aynı hızlı seçeneği) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Kenar Rengi */}
            <div className="flex items-center gap-1.5 bg-white/90 border border-violet-200 rounded-xl px-2 py-1">
              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                Kenar:
              </span>
              {SHAPE_COLOR_OPTIONS.map((c) => {
                const selected = activeShapeBorderColor === c.value;
                return (
                  <button
                    key={`border-${c.value}`}
                    type="button"
                    onClick={() => onSelectShapeBorderColor(c.value)}
                    title={`Kenar Rengi: ${c.label}`}
                    aria-label={`Kenar Rengi ${c.label}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      selected ? 'ring-2 ring-offset-1 ring-violet-600 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-slate-400/70 block"
                      style={{ backgroundColor: c.value }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dolgu Modu (Boş / Saydam / Tam Dolu) */}
            {(activeShapeMeta.closable || isGeometricShapeSelected) && (
              <>
                <div className="flex items-center gap-1 bg-white/90 border border-violet-200 rounded-xl p-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 px-1.5">
                    <ShapeFillIcon className="w-3.5 h-3.5" />
                    <span>İç Dolgu:</span>
                  </span>
                  {(Object.keys(SHAPE_FILL_MODE_OPTIONS) as ShapeFillMode[]).map((modeKey) => {
                    const isSelected = activeShapeFillMode === modeKey;
                    return (
                      <button
                        key={modeKey}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelectShapeFillMode(modeKey)}
                        className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-violet-100'
                        }`}
                      >
                        {SHAPE_FILL_MODE_OPTIONS[modeKey].label}
                      </button>
                    );
                  })}
                </div>

                {/* İç Renk Paleti + Kenarla Aynı Seçeneği */}
                <div className="flex flex-wrap items-center gap-1.5 bg-white/90 border border-violet-200 rounded-xl px-2 py-1">
                  <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                    İç Rengi:
                  </span>
                  <button
                    type="button"
                    aria-pressed={syncShapeFillWithBorder}
                    onClick={onToggleSyncShapeFill}
                    title="Açıkken iç dolgu rengi her zaman kenar rengiyle aynı kalır"
                    className={`h-7 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      syncShapeFillWithBorder
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Kenarla Aynı
                  </button>
                  {SHAPE_COLOR_OPTIONS.map((c) => {
                    const selected = activeShapeFillColor === c.value && activeShapeFillMode !== 'none';
                    return (
                      <button
                        key={`fill-${c.value}`}
                        type="button"
                        onClick={() => onSelectShapeFillColor(c.value)}
                        title={`İç Dolgu Rengi: ${c.label}`}
                        aria-label={`İç Dolgu Rengi ${c.label}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          selected ? 'ring-2 ring-offset-1 ring-emerald-600 scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-slate-400/70 block"
                          style={{ backgroundColor: c.value }}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hızlı Sembol Seçim Alt Çubuğu (Yeşil Tik, Kırmızı Çarpı, Yıldız, Soru, Ünlem, Kalp) */}
      {hasDocument && toolMode === 'stamp' && (
        <div
          role="group"
          aria-label="Sembol ve damga seçimi"
          className="px-3 py-2 bg-teal-50/80 border-t border-teal-200/80 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs font-bold text-teal-900 uppercase tracking-wide mr-1">
            Sembol Seç:
          </span>
          {STAMP_OPTIONS.map((opt) => {
            const isSelected = activeStampType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectStampType(opt.type)}
                title={`${opt.label}: Sayfaya tek dokunuşla ekle veya sürükle`}
                className={`min-h-[42px] px-3 rounded-xl inline-flex items-center gap-2 text-xs sm:text-sm font-semibold border transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-white text-slate-900 border-teal-600 ring-2 ring-teal-400 shadow-sm'
                    : 'bg-white/90 text-slate-700 border-teal-200 hover:bg-white'
                }`}
              >
                <span style={{ color: opt.defaultColor }} className="inline-flex shrink-0">
                  {renderStampIcon(opt.type, 'w-5 h-5')}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}

          <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-teal-200">
            <span className="text-xs font-bold text-teal-900">Boyut:</span>
            {(Object.keys(STAMP_SIZE_RATIOS) as StampSizeKey[]).map((sizeKey) => {
              const isSelected = stampSizeKey === sizeKey;
              return (
                <button
                  key={sizeKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectStampSize(sizeKey)}
                  className={`min-h-[38px] px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-100/70'
                  }`}
                >
                  {STAMP_SIZE_RATIOS[sizeKey].label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Aktif Mod İndikatörü ve Belge Durum Şeridi */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Sol: Net Aktif Mod İndikatörü */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-bold shadow-2xs transition-colors ${activeModeInfo.badgeBg}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${activeModeInfo.dotColor} shrink-0`} />
            <span style={toolMode === 'stamp' ? { color: activeColor } : undefined}>
              {renderActiveModeIcon(toolMode, 'w-4 h-4 shrink-0')}
            </span>
            <span>
              Aktif Mod:{' '}
              {toolMode === 'shape'
                ? `${activeModeInfo.fullLabel} (${activeShapeMeta.label})`
                : toolMode === 'stamp'
                  ? `${activeModeInfo.fullLabel} (${activeStampMeta.label})`
                  : activeModeInfo.fullLabel}
            </span>
            {(toolMode === 'pen' ||
              toolMode === 'text' ||
              toolMode === 'shape' ||
              toolMode === 'stamp') && (
              <span className="inline-flex items-center gap-1 pl-1.5 ml-0.5 border-l border-current/25 font-semibold">
                <span
                  className="w-3 h-3 rounded-full border border-black/25 inline-block"
                  style={{
                    backgroundColor: toolMode === 'shape' ? activeShapeBorderColor : activeColor,
                  }}
                />
                <span>
                  {toolMode === 'shape'
                    ? `Kenar: ${getColorLabel(activeShapeBorderColor)}`
                    : activeColorLabel}
                </span>
                {(toolMode === 'pen' || toolMode === 'shape') && (
                  <span>· {PEN_WIDTH_RATIOS[penWidthKey].label}</span>
                )}
                {toolMode === 'pen' && (
                  <span>· Yumuşatma: {STROKE_SMOOTHING_OPTIONS[strokeSmoothing].label}</span>
                )}
                {toolMode === 'stamp' && <span>· {STAMP_SIZE_RATIOS[stampSizeKey].label}</span>}
                {toolMode === 'shape' && activeShapeMeta.closable && (
                  <span className="inline-flex items-center gap-1">
                    · İç: {SHAPE_FILL_MODE_OPTIONS[activeShapeFillMode].label}
                    {activeShapeFillMode !== 'none' && (
                      <>
                        <span
                          className="w-3 h-3 rounded-full border border-black/25 inline-block"
                          style={{ backgroundColor: activeShapeFillColor }}
                        />
                        <span>{getColorLabel(activeShapeFillColor)}</span>
                      </>
                    )}
                  </span>
                )}
                {toolMode === 'text' && (
                  <span>
                    · {FONT_SIZE_RATIOS[fontSizeKey].label}
                    {bold ? ' · Kalın' : ''}
                  </span>
                )}
              </span>
            )}
          </div>

          <span className="text-slate-500 hidden md:inline">{activeModeInfo.hint}</span>
        </div>

        {/* Sağ: Dosya adı ve kayıt durumu */}
        {hasDocument && (
          <div className="flex items-center gap-2.5 min-w-0 ml-auto text-slate-500">
            <span className="truncate max-w-[200px] sm:max-w-[280px] font-medium text-slate-700">
              {fileName}
            </span>
            {canOverwriteHandle && (
              <span className="shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Üzerine Yazma Hazır
              </span>
            )}
            <span className="shrink-0">
              {hasUnsavedChanges ? (
                <span className="text-amber-700 font-semibold">● Kaydedilmemiş</span>
              ) : (
                <span className="text-emerald-700 font-medium">Güncel</span>
              )}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
