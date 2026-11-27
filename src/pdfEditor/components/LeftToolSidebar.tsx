// Sol kenarda aşağı doğru tek sıra sabit PDF araç çubuğu: araçlar en altta, üstte tıklanınca açılan tek renk seçici, kalınlık ve çocuk dostu yan paneller
import React, { useEffect, useRef, useState } from 'react';
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
  type ToolMode,
} from '../types/pdf';
import {
  CloseIcon,
  CursorSelectIcon,
  EraserToolIcon,
  PenToolIcon,
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
  TextToolIcon,
} from './Icons';

export interface LeftToolSidebarProps {
  hasDocument: boolean;
  toolMode: ToolMode;
  activeColor: string;
  fontSizeKey: FontSizeKey;
  bold: boolean;
  penWidthKey: PenWidthKey;
  activeShapeType: ShapeType;
  activeShapeFillMode: ShapeFillMode;
  activeShapeBorderColor: string;
  activeShapeFillColor: string;
  syncShapeFillWithBorder: boolean;
  isGeometricShapeSelected: boolean;
  activeStampType: StampType;
  stampSizeKey: StampSizeKey;
  isSidePanelOpen: boolean;
  onCloseSidePanel: () => void;
  onSelectTool: (mode: ToolMode) => void;
  onSelectColor: (hex: string) => void;
  onSelectFontSize: (key: FontSizeKey) => void;
  onToggleBold: () => void;
  onSelectPenWidth: (key: PenWidthKey) => void;
  onSelectShapeType: (shape: ShapeType) => void;
  onSelectShapeFillMode: (mode: ShapeFillMode) => void;
  onSelectShapeBorderColor: (hex: string) => void;
  onSelectShapeFillColor: (hex: string) => void;
  onToggleSyncShapeFill: () => void;
  onSelectStampType: (stamp: StampType) => void;
  onSelectStampSize: (key: StampSizeKey) => void;
}

interface ToolItemConfig {
  mode: ToolMode;
  label: string;
  title: string;
  restClass: string;
  activeClass: string;
  indicatorClass: string;
}

const TOOL_CONFIG_MAP: Record<ToolMode, ToolItemConfig> = {
  select: {
    mode: 'select',
    label: 'İmleç / Seç',
    title: 'İmleç / Seç: Yazıları seç, sürükle, çift tıkla düzenle; çizimleri seç ve Delete ile sil',
    restClass:
      'bg-sky-50 text-sky-700 border-sky-200/90 hover:bg-sky-100 hover:border-sky-300 hover:text-sky-800 hover:shadow-sm',
    activeClass: 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300 shadow-md',
    indicatorClass: 'bg-sky-200',
  },
  text: {
    mode: 'text',
    label: 'Yazı (T)',
    title: 'Yazı (T): Sayfada tıklanan noktaya yazı ekle',
    restClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200/90 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-800 hover:shadow-sm',
    activeClass: 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-md',
    indicatorClass: 'bg-indigo-200',
  },
  pen: {
    mode: 'pen',
    label: 'Kalem',
    title: 'Kalem: Fare, kalem veya dokunmatik ekranla serbest çizim',
    restClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-800 hover:shadow-sm',
    activeClass: 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md',
    indicatorClass: 'bg-emerald-200',
  },
  shape: {
    mode: 'shape',
    label: 'Şekiller',
    title: 'Geometrik Şekiller: Çizgi, ok, dikdörtgen, çember, üçgen ve dik üçgen çiz',
    restClass:
      'bg-violet-50 text-violet-700 border-violet-200/90 hover:bg-violet-100 hover:border-violet-300 hover:text-violet-800 hover:shadow-sm',
    activeClass: 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-300 shadow-md',
    indicatorClass: 'bg-violet-200',
  },
  stamp: {
    mode: 'stamp',
    label: 'Sembol',
    title: 'Semboller: Yeşil tik, kırmızı çarpı, yıldız, soru işareti, ünlem ve kalp damgala',
    restClass:
      'bg-teal-50 text-teal-700 border-teal-200/90 hover:bg-teal-100 hover:border-teal-300 hover:text-teal-800 hover:shadow-sm',
    activeClass: 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-300 shadow-md',
    indicatorClass: 'bg-teal-200',
  },
  eraser: {
    mode: 'eraser',
    label: 'Silgi',
    title: 'Silgi: Tıklanan veya üzerinden geçilen yazı, çizim, şekil ve sembolleri sil',
    restClass:
      'bg-rose-50 text-rose-600 border-rose-200/90 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 hover:shadow-sm',
    activeClass: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 shadow-md',
    indicatorClass: 'bg-rose-200',
  },
};

/** Daha seyrek kullanılan yardımcı araçlar (üstte) */
const SECONDARY_TOOL_MODES: ToolMode[] = ['text', 'shape', 'stamp'];

/** En çok kullanılan temel çizim araçları (en altta, çocukların kolayca ulaşabileceği hizada) */
const PRIMARY_DRAW_TOOL_MODES: ToolMode[] = ['pen', 'eraser'];

const PEN_WIDTH_DOT_PX: Record<PenWidthKey, number> = {
  thin: 5,
  medium: 9,
  thick: 14,
};

const FONT_SIZE_ORDER: FontSizeKey[] = ['small', 'medium', 'large'];
const FONT_SIZE_SHORT: Record<FontSizeKey, string> = {
  small: 'A-',
  medium: 'A',
  large: 'A+',
};

const STAMP_SIZE_SHORT: Record<StampSizeKey, string> = {
  small: 'Kç',
  medium: 'Or',
  large: 'By',
};

export const LeftToolSidebar: React.FC<LeftToolSidebarProps> = ({
  hasDocument,
  toolMode,
  activeColor,
  fontSizeKey,
  bold,
  penWidthKey,
  activeShapeType,
  activeShapeFillMode,
  activeShapeBorderColor,
  activeShapeFillColor,
  syncShapeFillWithBorder,
  isGeometricShapeSelected,
  activeStampType,
  stampSizeKey,
  isSidePanelOpen,
  onCloseSidePanel,
  onSelectTool,
  onSelectColor,
  onSelectFontSize,
  onToggleBold,
  onSelectPenWidth,
  onSelectShapeType,
  onSelectShapeFillMode,
  onSelectShapeBorderColor,
  onSelectShapeFillColor,
  onToggleSyncShapeFill,
  onSelectStampType,
  onSelectStampSize,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const colorBtnRef = useRef<HTMLButtonElement | null>(null);
  const colorPopoverRef = useRef<HTMLDivElement | null>(null);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [colorPopoverTop, setColorPopoverTop] = useState<number>(0);

  const activeShapeMeta =
    SHAPE_OPTIONS.find((s) => s.type === activeShapeType) || SHAPE_OPTIONS[0];
  const activeColorLabel =
    COLOR_OPTIONS.find((c) => c.value === activeColor)?.label || 'Özel';

  // Dışarı tıklanınca veya belge kapandığında renk paletini kapat
  useEffect(() => {
    if (!isColorMenuOpen) return;
    if (!hasDocument) {
      setIsColorMenuOpen(false);
      return;
    }
    const handleOutside = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        (colorBtnRef.current?.contains(target) || colorPopoverRef.current?.contains(target))
      ) {
        return;
      }
      setIsColorMenuOpen(false);
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, [isColorMenuOpen, hasDocument]);

  const handleToggleColorMenu = () => {
    if (!isColorMenuOpen && wrapperRef.current && colorBtnRef.current) {
      const wrapRect = wrapperRef.current.getBoundingClientRect();
      const btnRect = colorBtnRef.current.getBoundingClientRect();
      const centerOffset = btnRect.top - wrapRect.top + btnRect.height / 2;
      const clampedOffset = Math.max(40, Math.min(wrapRect.height - 40, centerOffset));
      setColorPopoverTop(clampedOffset);
    }
    setIsColorMenuOpen((prev) => !prev);
  };

  const renderToolIcon = (mode: ToolMode) => {
    switch (mode) {
      case 'text':
        return <TextToolIcon className="w-5 h-5" />;
      case 'pen':
        return <PenToolIcon className="w-5 h-5" />;
      case 'shape':
        return <ShapesToolIcon className="w-5 h-5" />;
      case 'stamp':
        return <StampToolIcon className="w-5 h-5" />;
      case 'eraser':
        return <EraserToolIcon className="w-5 h-5" />;
      case 'select':
      default:
        return <CursorSelectIcon className="w-5 h-5" />;
    }
  };

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

  const renderStampIcon = (stampType: StampType, className = 'w-6 h-6') => {
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

  const handleCycleFontSize = () => {
    const idx = FONT_SIZE_ORDER.indexOf(fontSizeKey);
    const next = FONT_SIZE_ORDER[(idx + 1) % FONT_SIZE_ORDER.length];
    onSelectFontSize(next);
  };

  const showStampPanel = hasDocument && toolMode === 'stamp' && isSidePanelOpen;
  const showShapePanel =
    hasDocument && (toolMode === 'shape' || isGeometricShapeSelected) && isSidePanelOpen;

  const renderToolButton = (mode: ToolMode) => {
    const item = TOOL_CONFIG_MAP[mode];
    const isActive = toolMode === item.mode;
    return (
      <button
        key={item.mode}
        type="button"
        disabled={!hasDocument}
        aria-pressed={isActive}
        aria-label={item.label}
        title={item.title}
        onClick={() => {
          setIsColorMenuOpen(false);
          onSelectTool(item.mode);
        }}
        className={`relative w-11 h-11 rounded-xl border inline-flex items-center justify-center transition-all duration-150 ease-out cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 ${
          isActive ? `${item.activeClass} scale-[1.05]` : item.restClass
        }`}
      >
        {renderToolIcon(item.mode)}
        {isActive && (
          <span
            className={`absolute left-0.5 top-2 bottom-2 w-1 rounded-full ${item.indicatorClass}`}
          />
        )}
      </button>
    );
  };

  return (
    <div ref={wrapperRef} className="relative shrink-0 z-20 flex h-full">
      {/* Ana Sol Dikey Araç Çubuğu: En çok kullanılan araçlar (İmleç, Renk, Kalem, Silgi) en altta, yardımcı araçlar üstte */}
      <aside
        aria-label="PDF çizim ve düzenleme araç çubuğu"
        className="w-[62px] sm:w-[66px] h-full bg-white/95 backdrop-blur border-r border-slate-200 shadow-sm flex flex-col items-center pt-2 pb-3 px-1.5 overflow-y-auto select-none"
      >
        <div className="mt-auto flex flex-col items-center gap-1.5 w-full">
          {/* Yardımcı Araçlar (Üstte): Yazı biçimi, Yazı, Şekiller, Semboller ve Kalınlık */}
          <div
            role="group"
            aria-label="Yazı biçimi"
            className="flex flex-col items-center gap-1 w-full"
          >
            <button
              type="button"
              disabled={!hasDocument}
              onClick={handleCycleFontSize}
              title={`Yazı Boyutu: ${FONT_SIZE_RATIOS[fontSizeKey].label} (Değiştirmek için tıkla)`}
              aria-label={`Yazı Boyutu ${FONT_SIZE_RATIOS[fontSizeKey].label}`}
              className={`w-10 h-8 rounded-xl border text-xs font-extrabold inline-flex items-center justify-center transition-all duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                toolMode === 'text'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-2xs hover:bg-indigo-200/80'
                  : 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300'
              }`}
            >
              {FONT_SIZE_SHORT[fontSizeKey]}
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              aria-pressed={bold}
              onClick={onToggleBold}
              title="Kalın Yazı (Bold)"
              aria-label="Kalın Yazı"
              className={`w-10 h-8 rounded-xl border text-sm font-extrabold inline-flex items-center justify-center transition-all duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                bold
                  ? 'bg-indigo-700 text-white border-indigo-800 ring-2 ring-indigo-300 shadow-sm'
                  : 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300'
              }`}
            >
              K
            </button>
          </div>

          {/* Yazı, Şekiller ve Semboller */}
          <div
            role="group"
            aria-label="Yardımcı araç modları"
            className="flex flex-col items-center gap-1.5 w-full"
          >
            {SECONDARY_TOOL_MODES.map(renderToolButton)}
          </div>

          {/* Ayırıcı */}
          <div className="w-8 h-px bg-slate-200 my-0.5 shrink-0" />

          {/* Kalem / Çizgi Kalınlığı */}
          <div
            role="group"
            aria-label="Kalem kalınlığı"
            className="flex flex-col items-center gap-1 w-full"
          >
            {(Object.keys(PEN_WIDTH_RATIOS) as PenWidthKey[]).map((key) => {
              const isSelected = penWidthKey === key;
              const dotPx = PEN_WIDTH_DOT_PX[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!hasDocument}
                  aria-pressed={isSelected}
                  onClick={() => onSelectPenWidth(key)}
                  title={`Kalınlık: ${PEN_WIDTH_RATIOS[key].label}`}
                  aria-label={`Kalınlık ${PEN_WIDTH_RATIOS[key].label}`}
                  className={`w-10 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isSelected
                      ? 'bg-slate-800 border-slate-900 ring-2 ring-slate-300 shadow-sm'
                      : 'bg-emerald-50/60 border-emerald-200/75 hover:bg-emerald-100/80 hover:border-emerald-300'
                  }`}
                >
                  <span
                    className="rounded-full block"
                    style={{
                      width: `${dotPx}px`,
                      height: `${dotPx}px`,
                      backgroundColor: isSelected ? '#ffffff' : activeColor,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Ayırıcı */}
          <div className="w-8 h-px bg-slate-300/90 my-0.5 shrink-0" />

          {/* En Çok Kullanılan Araçlar (En Altta): İmleç, Renk Seçici, Kalem ve Silgi */}
          <div
            role="group"
            aria-label="En çok kullanılan araçlar"
            className="flex flex-col items-center gap-1.5 w-full py-1.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs"
          >
            {/* İmleç / Seç */}
            {renderToolButton('select')}

            {/* Tek Renk Seçici Butonu: En çok kullanılanların içinde, tıklanınca renk paletini açar */}
            <button
              ref={colorBtnRef}
              type="button"
              disabled={!hasDocument}
              aria-expanded={isColorMenuOpen}
              aria-haspopup="true"
              onClick={handleToggleColorMenu}
              title={`Aktif Renk: ${activeColorLabel} (Renk seçmek için tıklayın)`}
              aria-label={`Renk seç (${activeColorLabel})`}
              className={`relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-150 ease-out cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isColorMenuOpen
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 shadow-md scale-[1.06]'
                  : 'bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 border-amber-200/90 hover:from-amber-100 hover:via-rose-100 hover:to-sky-100 hover:border-amber-300 hover:shadow-sm'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-black/20 block"
                style={{ backgroundColor: activeColor }}
              />
              {/* Açılır menü olduğunu gösteren minik sağ-alt nokta */}
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-500/85 border border-white" />
            </button>

            {/* Kalem ve Silgi — En altta, çocukların anında ulaşabileceği konumda */}
            {PRIMARY_DRAW_TOOL_MODES.map(renderToolButton)}
          </div>
        </div>
      </aside>

      {/* Tıklanınca Açılan Renk Paleti Popover'ı */}
      {hasDocument && isColorMenuOpen && (
        <div
          ref={colorPopoverRef}
          role="group"
          aria-label="Renk paleti"
          style={{ top: `${Math.max(40, colorPopoverTop)}px` }}
          className="absolute left-full ml-2.5 -translate-y-1/2 z-40 bg-white/98 backdrop-blur border-2 border-slate-300 rounded-2xl shadow-xl px-2.5 py-2 flex items-center gap-2 select-none"
        >
          {COLOR_OPTIONS.map((c) => {
            const selected = activeColor === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onSelectColor(c.value);
                  setIsColorMenuOpen(false);
                }}
                title={`Renk: ${c.label}`}
                aria-label={`Renk ${c.label}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform cursor-pointer active:scale-95 ${
                  selected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-full border border-black/15 block shadow-2xs"
                  style={{ backgroundColor: c.value }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Semboller Yan Paneli: Çocukların boyunun yetişebilmesi için sol alt-orta hizada açılır */}
      {showStampPanel && (
        <div
          role="group"
          aria-label="Sembol ve damga seçimi"
          className="absolute left-full bottom-4 ml-2.5 z-30 w-[78px] max-h-[calc(100%-24px)] overflow-y-auto bg-white/98 backdrop-blur border-2 border-teal-300 rounded-2xl shadow-xl p-2 flex flex-col items-center gap-1.5 select-none"
        >
          <div className="w-full flex items-center justify-between px-0.5 pb-1 border-b border-teal-100">
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-tight">
              Sembol
            </span>
            <button
              type="button"
              onClick={onCloseSidePanel}
              title="Sembol panelini gizle (Sembol simgesine basınca tekrar açılır)"
              aria-label="Sembol panelini gizle"
              className="w-5 h-5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Büyük Renkli Sembol Butonu (Dokunmatik ve çocuk dostu) */}
          {STAMP_OPTIONS.map((opt) => {
            const isSelected = activeStampType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectStampType(opt.type)}
                title={`${opt.label}: Sayfaya tek dokunuşla ekle veya sürükle`}
                aria-label={opt.label}
                className={`w-12 h-12 rounded-xl border-2 inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-300 shadow-sm scale-[1.04]'
                    : 'bg-white border-slate-200 hover:bg-teal-50/60 hover:border-teal-300'
                }`}
              >
                <span style={{ color: opt.defaultColor }} className="inline-flex">
                  {renderStampIcon(opt.type, 'w-7 h-7')}
                </span>
              </button>
            );
          })}

          {/* Sembol Boyutu */}
          <div className="w-full pt-1.5 mt-0.5 border-t border-teal-100 flex flex-col items-center gap-1">
            {(Object.keys(STAMP_SIZE_RATIOS) as StampSizeKey[]).map((sizeKey) => {
              const isSelected = stampSizeKey === sizeKey;
              return (
                <button
                  key={sizeKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectStampSize(sizeKey)}
                  title={`Sembol Boyutu: ${STAMP_SIZE_RATIOS[sizeKey].label}`}
                  className={`w-full h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  {STAMP_SIZE_SHORT[sizeKey]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Geometrik Şekiller Yan Paneli: Aynı şekilde sol alt-orta erişilebilir hizada */}
      {showShapePanel && (
        <div
          role="group"
          aria-label="Geometrik şekil, kenar rengi ve iç dolgu ayarları"
          className="absolute left-full bottom-4 ml-2.5 z-30 w-[228px] max-h-[calc(100%-24px)] overflow-y-auto bg-white/98 backdrop-blur border-2 border-violet-300 rounded-2xl shadow-xl p-2.5 flex flex-col gap-2.5 select-none"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-violet-100">
            <span className="text-xs font-extrabold text-violet-900 uppercase tracking-wide">
              Geometrik Şekiller
            </span>
            <button
              type="button"
              onClick={onCloseSidePanel}
              title="Şekil panelini gizle (Şekiller simgesine basınca tekrar açılır)"
              aria-label="Şekil panelini gizle"
              className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Şekil Türleri (2 sütunlu dokunmatik ızgara) */}
          {toolMode === 'shape' && (
            <div className="grid grid-cols-2 gap-1.5">
              {SHAPE_OPTIONS.map((opt) => {
                const isSelected = activeShapeType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectShapeType(opt.type)}
                    title={opt.label}
                    className={`min-h-[40px] px-2 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-300 shadow-sm'
                        : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-50'
                    }`}
                  >
                    {renderShapeIcon(opt.type, 'w-4 h-4 shrink-0')}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Kenar Rengi */}
          <div className="space-y-1.5 pt-1 border-t border-violet-100">
            <span className="text-[11px] font-bold text-slate-700 block">Kenar Rengi</span>
            <div className="flex flex-wrap items-center gap-1.5">
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
          </div>

          {/* Dolgu Modu & İç Rengi */}
          {(activeShapeMeta.closable || isGeometricShapeSelected) && (
            <>
              <div className="space-y-1.5 pt-1 border-t border-violet-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <ShapeFillIcon className="w-3.5 h-3.5" />
                  <span>İç Dolgu</span>
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(Object.keys(SHAPE_FILL_MODE_OPTIONS) as ShapeFillMode[]).map((modeKey) => {
                    const isSelected = activeShapeFillMode === modeKey;
                    return (
                      <button
                        key={modeKey}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelectShapeFillMode(modeKey)}
                        className={`h-8 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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
              </div>

              <div className="space-y-1.5 pt-1 border-t border-violet-100">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-700">İç Rengi</span>
                  <button
                    type="button"
                    aria-pressed={syncShapeFillWithBorder}
                    onClick={onToggleSyncShapeFill}
                    title="Açıkken iç dolgu rengi her zaman kenar rengiyle aynı kalır"
                    className={`h-6 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      syncShapeFillWithBorder
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Kenarla Aynı
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SHAPE_COLOR_OPTIONS.map((c) => {
                    const selected =
                      activeShapeFillColor === c.value && activeShapeFillMode !== 'none';
                    return (
                      <button
                        key={`fill-${c.value}`}
                        type="button"
                        onClick={() => onSelectShapeFillColor(c.value)}
                        title={`İç Dolgu Rengi: ${c.label}`}
                        aria-label={`İç Dolgu Rengi ${c.label}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          selected
                            ? 'ring-2 ring-offset-1 ring-emerald-600 scale-110'
                            : 'hover:scale-105'
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
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
