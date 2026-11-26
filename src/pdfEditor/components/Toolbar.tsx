// Sabit (sticky) üst araç çubuğu: en az 40px dokunmatik butonlar, tüm araçlar ve 3 kaydetme modu
import React, { useEffect, useState } from 'react';
import {
  COLOR_OPTIONS,
  FONT_SIZE_RATIOS,
  type FontSizeKey,
  PEN_WIDTH_RATIOS,
  type PenWidthKey,
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

  const baseBtn =
    'min-w-[40px] min-h-[40px] px-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const modeBtnClass = (active: boolean) =>
    `${baseBtn} ${
      active
        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300/70'
        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm text-slate-800">
      <div className="px-2.5 py-2 flex flex-wrap items-center gap-1.5">
        {onExitToSite && (
          <button
            type="button"
            onClick={onExitToSite}
            title="Ana siteye geri dön"
            className={`${baseBtn} bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold`}
          >
            <HomeBackIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Siteye Dön</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPdfClick}
          title="Yerel PDF dosyası seç (Chrome'da üzerine yazma destekli)"
          className={`${baseBtn} bg-slate-900 text-white hover:bg-slate-800 px-3`}
        >
          <FolderOpenIcon className="w-5 h-5" />
          <span className="hidden sm:inline">PDF Aç</span>
        </button>

        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
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

          <form onSubmit={handlePageSubmit} className="flex items-center gap-1 px-1">
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
              className="w-12 h-[40px] text-center text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
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

        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
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
            className={`${baseBtn} bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 min-w-[68px] text-xs font-semibold`}
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

        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
          <button
            type="button"
            disabled={!hasDocument}
            onClick={() => onSelectTool('select')}
            title="İmleç / Seç: Yazıları seç, sürükle, çift tıkla düzenle; çizimleri seç ve Delete ile sil"
            className={modeBtnClass(toolMode === 'select')}
          >
            <CursorSelectIcon className="w-5 h-5" />
            <span className="hidden lg:inline">Seç</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={() => onSelectTool('text')}
            title="Yazı (T): Sayfada tıklanan noktaya yazı ekle"
            className={modeBtnClass(toolMode === 'text')}
          >
            <TextToolIcon className="w-5 h-5" />
            <span className="hidden lg:inline">Yazı</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={() => onSelectTool('pen')}
            title="Kalem: Fare, kalem veya dokunmatik ekranla serbest çizim"
            className={modeBtnClass(toolMode === 'pen')}
          >
            <PenToolIcon className="w-5 h-5" />
            <span className="hidden lg:inline">Kalem</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={() => onSelectTool('eraser')}
            title="Silgi: Tıklanan veya üzerinden geçilen yazı ve çizimleri sil"
            className={modeBtnClass(toolMode === 'eraser')}
          >
            <EraserToolIcon className="w-5 h-5" />
            <span className="hidden lg:inline">Silgi</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-1.5 h-[40px]">
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
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer disabled:opacity-40 ${
                    selected ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/15 block"
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
            className="h-[40px] px-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
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
            className={`${baseBtn} font-bold text-base ${
              bold
                ? 'bg-slate-800 text-white border border-slate-800'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
            className="h-[40px] px-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
          >
            {(Object.keys(PEN_WIDTH_RATIOS) as PenWidthKey[]).map((key) => (
              <option key={key} value={key}>
                Kalem: {PEN_WIDTH_RATIOS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
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
            <TrashIcon className="w-4 h-4" />
            <span className="hidden xl:inline">Sayfayı Temizle</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || !hasAnyAnnotations}
            onClick={onRequestClearAll}
            title="Tüm Notları Temizle (geri alınabilir)"
            className={`${baseBtn} bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs`}
          >
            <TrashIcon className="w-4 h-4" />
            <span className="hidden xl:inline">Tümünü Temizle</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 ml-auto pl-1.5 border-l border-slate-200">
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
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran'}
            aria-label={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            className={`${baseBtn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-100`}
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
            title={
              canOverwriteHandle
                ? 'Kaydet (Ctrl+S): Açılan dosyanın üzerine düzenlenebilir olarak yazar'
                : 'Kaydet (Ctrl+S): Düzenlenebilir kopya indirir'
            }
            className={`${baseBtn} bg-emerald-600 text-white hover:bg-emerald-700 px-3 shadow-sm relative`}
          >
            <SaveIcon className="w-4 h-4" />
            <span>{isExporting ? 'Kaydediliyor...' : 'Kaydet'}</span>
            {hasUnsavedChanges && !isExporting && (
              <span
                title="Kaydedilmemiş değişiklikler var"
                className="w-2 h-2 rounded-full bg-amber-300 inline-block"
              />
            )}
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onSaveAsEditable}
            title="Farklı Kaydet: Notları düzenlenebilir olarak yeni PDF dosyasına kaydeder"
            className={`${baseBtn} bg-blue-600 text-white hover:bg-blue-700 px-3 shadow-sm`}
          >
            <SaveAsIcon className="w-4 h-4" />
            <span className="hidden md:inline">Farklı Kaydet</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument || isExporting}
            onClick={onExportFlatPdf}
            title="Düz PDF Olarak Dışa Aktar: Notlar kalıcı işlenir, ek gömülmez (paylaşıma uygun)"
            className={`${baseBtn} bg-slate-700 text-white hover:bg-slate-800 px-3 shadow-sm`}
          >
            <ExportFlatIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Düz PDF</span>
          </button>
        </div>
      </div>

      {hasDocument && (
        <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="truncate font-medium text-slate-700 flex items-center gap-2">
            <span className="truncate">{fileName}</span>
            {canOverwriteHandle && (
              <span className="shrink-0 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Üzerine Yazma Hazır
              </span>
            )}
          </div>
          <div className="shrink-0">
            {hasUnsavedChanges ? (
              <span className="text-amber-700 font-semibold">● Kaydedilmemiş değişiklikler var</span>
            ) : (
              <span className="text-emerald-700">Güncel</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
