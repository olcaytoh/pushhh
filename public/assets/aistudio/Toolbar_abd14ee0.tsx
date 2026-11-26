// Üst sabit araç çubuğu: dosya işlemleri, sayfa gezinme, zoom, araç modları, biçimlendirme ve kaydetme
import { useEffect, useState } from 'react';
import {
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  PEN_WIDTH_RATIOS,
  type FontSizePreset,
  type PenWidthPreset,
  type ToolMode,
} from '../types/pdf';
import {
  CursorSelectIcon,
  EraserToolIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  NextPageIcon,
  OpenPdfIcon,
  PenToolIcon,
  PrevPageIcon,
  RedoIcon,
  SavePdfIcon,
  SettingsHelpIcon,
  TextToolIcon,
  UndoIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './Icons';

interface ToolbarProps {
  hasDocument: boolean;
  fileName: string;
  currentPage: number;
  numPages: number;
  zoom: number;
  isFullscreen: boolean;
  toolMode: ToolMode;
  activeColor: string;
  fontSizePreset: FontSizePreset;
  isBold: boolean;
  penWidthPreset: PenWidthPreset;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onOpenFileClick: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onToggleFullscreen: () => void;
  onSelectTool: (mode: ToolMode) => void;
  onChangeColor: (color: string) => void;
  onChangeFontSize: (preset: FontSizePreset) => void;
  onToggleBold: () => void;
  onChangePenWidth: (preset: PenWidthPreset) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSettings: () => void;
  onSavePdf: () => void;
}

export function Toolbar({
  hasDocument,
  fileName,
  currentPage,
  numPages,
  zoom,
  isFullscreen,
  toolMode,
  activeColor,
  fontSizePreset,
  isBold,
  penWidthPreset,
  canUndo,
  canRedo,
  isSaving,
  hasUnsavedChanges,
  onOpenFileClick,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onToggleFullscreen,
  onSelectTool,
  onChangeColor,
  onChangeFontSize,
  onToggleBold,
  onChangePenWidth,
  onUndo,
  onRedo,
  onOpenSettings,
  onSavePdf,
}: ToolbarProps) {
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const commitPageInput = () => {
    const parsed = parseInt(pageInput.trim(), 10);
    if (!Number.isNaN(parsed) && numPages > 0) {
      const clamped = Math.max(1, Math.min(numPages, parsed));
      setPageInput(String(clamped));
      onJumpToPage(clamped);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const baseBtn =
    'inline-flex items-center justify-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-sm font-medium transition-colors select-none whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600';

  const toolBtnClass = (mode: ToolMode) =>
    toolMode === mode
      ? `${baseBtn} bg-blue-600 text-white shadow-xs`
      : `${baseBtn} text-slate-700 hover:bg-slate-100`;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2">
        {/* 1. Dosya Aç ve Sayfa Gezinme */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenFileClick}
            title={fileName ? `Açık dosya: ${fileName} (Yeni PDF Aç)` : 'Yerel PDF dosyası aç'}
            className={`${baseBtn} bg-slate-100 text-slate-800 hover:bg-slate-200 px-3`}
          >
            <OpenPdfIcon className="w-4 h-4 shrink-0" />
            <span>PDF Aç</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={onPrevPage}
            disabled={!hasDocument || currentPage <= 1}
            title="Önceki Sayfa"
            aria-label="Önceki Sayfa"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <PrevPageIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-sm text-slate-700 px-1" title="Sayfa numarası yazıp Enter'a basın">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Sayfa numarası"
              disabled={!hasDocument}
              value={hasDocument ? pageInput : '-'}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitPageInput();
                  (e.currentTarget as HTMLInputElement).blur();
                }
              }}
              className="w-11 min-h-[36px] text-center tabular-nums rounded-md border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none disabled:opacity-50"
            />
            <span className="text-slate-500 tabular-nums whitespace-nowrap">
              / {hasDocument ? numPages : 0}
            </span>
          </div>

          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasDocument || currentPage >= numPages}
            title="Sonraki Sayfa"
            aria-label="Sonraki Sayfa"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <NextPageIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

        {/* 2. Yakınlaştırma ve Tam Ekran */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={!hasDocument || zoom <= 0.5}
            title="Uzaklaştır (−) [Ctrl + Tekerlek]"
            aria-label="Uzaklaştır"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <ZoomOutIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onFitWidth}
            disabled={!hasDocument}
            title="Genişliğe sığdır"
            className={`${baseBtn} min-w-[60px] px-2 text-slate-700 hover:bg-slate-100 tabular-nums`}
          >
            %{Math.round(zoom * 100)}
          </button>

          <button
            type="button"
            onClick={onZoomIn}
            disabled={!hasDocument || zoom >= 4}
            title="Yakınlaştır (+) [Ctrl + Tekerlek]"
            aria-label="Yakınlaştır"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <ZoomInIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran'}
            aria-label={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            {isFullscreen ? (
              <FullscreenExitIcon className="w-4 h-4" />
            ) : (
              <FullscreenEnterIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

        {/* 3. Araç Modları */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl" role="group" aria-label="Araç modları">
          <button
            type="button"
            onClick={() => onSelectTool('select')}
            title="İmleç / Seç (Seç, taşı, çift tıkla düzenle, Delete ile sil)"
            className={toolBtnClass('select')}
          >
            <CursorSelectIcon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Seç</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('text')}
            title="Yazı Aracı (Sayfada tıklanan yere yazı ekle)"
            className={toolBtnClass('text')}
          >
            <TextToolIcon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Yazı</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('pen')}
            title="Kalem (Serbest çizim)"
            className={toolBtnClass('pen')}
          >
            <PenToolIcon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Kalem</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('eraser')}
            title="Silgi (Üzerine tıklanan veya sürüklenen yazı/çizimi sil)"
            className={toolBtnClass('eraser')}
          >
            <EraserToolIcon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Silgi</span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden lg:block" aria-hidden="true" />

        {/* 4. Renk, Yazı Boyutu, Kalın ve Kalem Kalınlığı */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Renk Seçimi */}
          <div className="flex items-center gap-0.5" role="group" aria-label="Renk seçimi">
            {COLOR_OPTIONS.map((c) => {
              const selected = activeColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChangeColor(c.value)}
                  title={`Renk: ${c.label}`}
                  aria-label={`Renk: ${c.label}`}
                  aria-pressed={selected}
                  className={`inline-flex items-center justify-center w-[40px] h-[40px] rounded-lg transition-colors cursor-pointer ${
                    selected ? 'bg-slate-200 ring-2 ring-blue-600' : 'hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20"
                    style={{ backgroundColor: c.value }}
                  />
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

          {/* Yazı Boyutu */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg" role="group" aria-label="Yazı boyutu">
            {(Object.keys(FONT_SIZE_RATIOS) as FontSizePreset[]).map((preset) => {
              const active = fontSizePreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChangeFontSize(preset)}
                  title={`Yazı boyutu: ${FONT_SIZE_RATIOS[preset].label}`}
                  className={`min-h-[36px] px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {FONT_SIZE_RATIOS[preset].label}
                </button>
              );
            })}
          </div>

          {/* Kalın (Bold) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggleBold}
            title="Kalın Yazı (Bold)"
            aria-label="Kalın Yazı"
            aria-pressed={isBold}
            className={`${baseBtn} font-bold ${
              isBold
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            K
          </button>

          <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

          {/* Kalem Kalınlığı */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg" role="group" aria-label="Kalem kalınlığı">
            {(Object.keys(PEN_WIDTH_RATIOS) as PenWidthPreset[]).map((preset) => {
              const item = PEN_WIDTH_RATIOS[preset];
              const active = penWidthPreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChangePenWidth(preset)}
                  title={`Kalem kalınlığı: ${item.label}`}
                  aria-label={`Kalem kalınlığı: ${item.label}`}
                  className={`inline-flex items-center justify-center min-w-[36px] min-h-[36px] px-2 rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: `${item.previewPx + 3}px`, height: `${item.previewPx + 3}px` }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Geri Al / Yinele, Ayarlar ve Kaydet */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Geri Al (Ctrl+Z)"
            aria-label="Geri Al"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <UndoIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Yinele (Ctrl+Y / Ctrl+Shift+Z)"
            aria-label="Yinele"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <RedoIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Font Ayarları ve Yardım"
            aria-label="Font Ayarları ve Yardım"
            className={`${baseBtn} text-slate-700 hover:bg-slate-100`}
          >
            <SettingsHelpIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onSavePdf}
            disabled={!hasDocument || isSaving}
            title="Tüm yazı ve çizimleri PDF dosyasına işle ve kaydet"
            className={`${baseBtn} px-3.5 ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <SavePdfIcon className="w-4 h-4 shrink-0" />
            <span>{isSaving ? 'Kaydediliyor...' : 'PDF Olarak Kaydet'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
