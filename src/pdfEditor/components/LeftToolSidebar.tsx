// Sol kenarda aşağı doğru tek sıra sabit PDF araç çubuğu (İmleç, Yazı, Kalem, Şekiller, Sembol, Silgi, Renkler, Kalınlık)
import React from 'react';
import {
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  type FontSizeKey,
  PEN_WIDTH_RATIOS,
  type PenWidthKey,
  type ToolMode,
} from '../types/pdf';
import {
  CursorSelectIcon,
  EraserToolIcon,
  PenToolIcon,
  ShapesToolIcon,
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
  onSelectTool: (mode: ToolMode) => void;
  onSelectColor: (hex: string) => void;
  onSelectFontSize: (key: FontSizeKey) => void;
  onToggleBold: () => void;
  onSelectPenWidth: (key: PenWidthKey) => void;
}

const TOOL_ITEMS: {
  mode: ToolMode;
  label: string;
  title: string;
  activeClass: string;
  indicatorClass: string;
}[] = [
  {
    mode: 'select',
    label: 'İmleç / Seç',
    title: 'İmleç / Seç: Yazıları seç, sürükle, çift tıkla düzenle; çizimleri seç ve Delete ile sil',
    activeClass: 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 shadow-md',
    indicatorClass: 'bg-blue-200',
  },
  {
    mode: 'text',
    label: 'Yazı (T)',
    title: 'Yazı (T): Sayfada tıklanan noktaya yazı ekle',
    activeClass: 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-md',
    indicatorClass: 'bg-indigo-200',
  },
  {
    mode: 'pen',
    label: 'Kalem',
    title: 'Kalem: Fare, kalem veya dokunmatik ekranla serbest çizim',
    activeClass: 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md',
    indicatorClass: 'bg-emerald-200',
  },
  {
    mode: 'shape',
    label: 'Şekiller',
    title: 'Geometrik Şekiller: Çizgi, ok, dikdörtgen, çember, üçgen ve dik üçgen çiz',
    activeClass: 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-300 shadow-md',
    indicatorClass: 'bg-violet-200',
  },
  {
    mode: 'stamp',
    label: 'Sembol',
    title: 'Semboller: Yeşil tik, kırmızı çarpı, yıldız, soru işareti, ünlem ve kalp damgala',
    activeClass: 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-300 shadow-md',
    indicatorClass: 'bg-teal-200',
  },
  {
    mode: 'eraser',
    label: 'Silgi',
    title: 'Silgi: Tıklanan veya üzerinden geçilen yazı, çizim, şekil ve sembolleri sil',
    activeClass: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 shadow-md',
    indicatorClass: 'bg-rose-200',
  },
];

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

export const LeftToolSidebar: React.FC<LeftToolSidebarProps> = ({
  hasDocument,
  toolMode,
  activeColor,
  fontSizeKey,
  bold,
  penWidthKey,
  onSelectTool,
  onSelectColor,
  onSelectFontSize,
  onToggleBold,
  onSelectPenWidth,
}) => {
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

  const handleCycleFontSize = () => {
    const idx = FONT_SIZE_ORDER.indexOf(fontSizeKey);
    const next = FONT_SIZE_ORDER[(idx + 1) % FONT_SIZE_ORDER.length];
    onSelectFontSize(next);
  };

  return (
    <aside
      aria-label="PDF çizim ve düzenleme araç çubuğu"
      className="w-[62px] sm:w-[66px] shrink-0 bg-white/95 backdrop-blur border-r border-slate-200 shadow-sm z-20 flex flex-col items-center gap-1.5 py-2.5 px-1.5 overflow-y-auto select-none"
    >
      {/* Araç Modları: Tek dikey sıra */}
      <div role="group" aria-label="Araç modları" className="flex flex-col items-center gap-1.5 w-full">
        {TOOL_ITEMS.map((item) => {
          const isActive = toolMode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              disabled={!hasDocument}
              aria-pressed={isActive}
              aria-label={item.label}
              title={item.title}
              onClick={() => onSelectTool(item.mode)}
              className={`relative w-11 h-11 rounded-xl border inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
                isActive
                  ? `${item.activeClass} scale-[1.03]`
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
        })}
      </div>

      {/* Ayırıcı */}
      <div className="w-8 h-px bg-slate-200 my-1 shrink-0" />

      {/* Renkler: Tek dikey sıra */}
      <div role="group" aria-label="Renk seçimi" className="flex flex-col items-center gap-1.5 w-full">
        {COLOR_OPTIONS.map((c) => {
          const selected = activeColor === c.value;
          return (
            <button
              key={c.value}
              type="button"
              disabled={!hasDocument}
              aria-pressed={selected}
              onClick={() => onSelectColor(c.value)}
              title={`Renk: ${c.label}`}
              aria-label={`Renk ${c.label}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
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

      {/* Ayırıcı */}
      <div className="w-8 h-px bg-slate-200 my-1 shrink-0" />

      {/* Kalem / Çizgi Kalınlığı: Tek dikey sıra */}
      <div
        role="group"
        aria-label="Kalem kalınlığı"
        className="flex flex-col items-center gap-1.5 w-full"
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
              className={`w-10 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-slate-800 border-slate-900 ring-2 ring-slate-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
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
      <div className="w-8 h-px bg-slate-200 my-1 shrink-0" />

      {/* Yazı Boyutu ve Kalın (Bold): Tek dikey sıra */}
      <div
        role="group"
        aria-label="Yazı biçimi"
        className="flex flex-col items-center gap-1.5 w-full"
      >
        <button
          type="button"
          disabled={!hasDocument}
          onClick={handleCycleFontSize}
          title={`Yazı Boyutu: ${FONT_SIZE_RATIOS[fontSizeKey].label} (Değiştirmek için tıkla)`}
          aria-label={`Yazı Boyutu ${FONT_SIZE_RATIOS[fontSizeKey].label}`}
          className={`w-10 h-9 rounded-xl border text-xs font-extrabold inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            toolMode === 'text'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
          className={`w-10 h-9 rounded-xl border text-sm font-extrabold inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            bold
              ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          K
        </button>
      </div>
    </aside>
  );
};
