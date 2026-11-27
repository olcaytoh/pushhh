// Birden fazla PDF dosyasını seçip sıralayarak tek bir belgede uç uca birleştiren çevrimdışı pencere
import React, { useEffect, useRef, useState } from 'react';
import { inspectPdfPageCount } from '../utils/pdfExporter';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  FolderOpenIcon,
  MergePdfIcon,
  PdfDocIcon,
  TrashIcon,
} from './Icons';

export interface MergeSourceEntry {
  id: string;
  name: string;
  pageCount: number;
  sizeBytes: number;
  isCurrentDoc: boolean;
  bytes?: Uint8Array;
}

export interface MergePdfModalProps {
  isOpen: boolean;
  hasOpenDocument: boolean;
  currentFileName: string;
  currentPageCount: number;
  currentSizeBytes: number;
  isMerging: boolean;
  onClose: () => void;
  onConfirmMerge: (entries: MergeSourceEntry[]) => Promise<void>;
  onBeforeFileDialog?: () => void;
  onAfterFileDialog?: () => void;
}

function createMergeId(): string {
  return `mrg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MergePdfModal: React.FC<MergePdfModalProps> = ({
  isOpen,
  hasOpenDocument,
  currentFileName,
  currentPageCount,
  currentSizeBytes,
  isMerging,
  onClose,
  onConfirmMerge,
  onBeforeFileDialog,
  onAfterFileDialog,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [entries, setEntries] = useState<MergeSourceEntry[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pencere her açıldığında mevcut açık belge varsa ilk sıraya otomatik yerleştir
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setIsDragOver(false);
    if (hasOpenDocument && currentPageCount > 0) {
      setEntries([
        {
          id: 'current-open-doc',
          name: currentFileName || 'Açık PDF Belgesi',
          pageCount: currentPageCount,
          sizeBytes: currentSizeBytes,
          isCurrentDoc: true,
        },
      ]);
    } else {
      setEntries([]);
    }
  }, [isOpen, hasOpenDocument, currentFileName, currentPageCount, currentSizeBytes]);

  if (!isOpen) return null;

  const appendPdfFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsReadingFiles(true);
    setErrorMsg(null);

    const added: MergeSourceEntry[] = [];
    const failedNames: string[] = [];

    for (const file of files) {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.pdf') && file.type !== 'application/pdf') {
        failedNames.push(`${file.name} (PDF değil)`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const pageCount = await inspectPdfPageCount(bytes);
        if (pageCount < 1) {
          failedNames.push(`${file.name} (sayfa yok)`);
          continue;
        }
        added.push({
          id: createMergeId(),
          name: file.name,
          pageCount,
          sizeBytes: bytes.byteLength,
          isCurrentDoc: false,
          bytes,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        if (msg.includes('encrypt') || msg.includes('password')) {
          failedNames.push(`${file.name} (şifreli)`);
        } else {
          failedNames.push(`${file.name} (okunamadı)`);
        }
      }
    }

    if (added.length > 0) {
      setEntries((prev) => [...prev, ...added]);
    }

    if (failedNames.length > 0) {
      setErrorMsg(`Eklenemeyen dosyalar: ${failedNames.join(', ')}`);
    }

    setIsReadingFiles(false);
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const nextIdx = index + delta;
    if (nextIdx < 0 || nextIdx >= entries.length) return;
    setEntries((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPages = entries.reduce((sum, item) => sum + item.pageCount, 0);
  const canMerge = entries.length >= 2 && !isReadingFiles && !isMerging;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PDF Sayfa Birleştirme"
      onClick={() => {
        if (!isMerging) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* Başlık */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-indigo-50/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MergePdfIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                PDF Sayfa Birleştirme
              </h2>
              <p className="text-xs text-slate-600 leading-snug">
                Birden fazla PDF dosyasını seçip sıralayın, tek belge olarak uç uca birleştirin.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isMerging}
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 inline-flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              onAfterFileDialog?.();
              if (e.target.files && e.target.files.length > 0) {
                void appendPdfFiles(e.target.files);
              }
              e.target.value = '';
            }}
          />

          {/* Dosya Ekleme / Sürükle-Bırak Alanı */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                void appendPdfFiles(e.dataTransfer.files);
              }
            }}
            className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 bg-slate-50/70 hover:border-indigo-400'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={isReadingFiles || isMerging}
                onClick={() => {
                  onBeforeFileDialog?.();
                  inputRef.current?.click();
                }}
                className="min-h-[42px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FolderOpenIcon className="w-4 h-4" />
                <span>{isReadingFiles ? 'PDF Okunuyor...' : 'PDF Dosyaları Ekle'}</span>
              </button>
              <span className="text-xs text-slate-500">
                veya birden fazla PDF dosyasını bu kutuya sürükleyip bırakın
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
              {errorMsg}
            </div>
          )}

          {/* Sıralı Birleştirme Listesi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-0.5">
              <span>Birleştirme Sırası ({entries.length} dosya)</span>
              <span>Toplam {totalPages} sayfa</span>
            </div>

            {entries.length === 0 ? (
              <div className="py-8 text-center rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                Birleştirmek için en az 2 PDF dosyası ekleyin.
              </div>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry, idx) => (
                  <li
                    key={entry.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                      entry.isCurrentDoc
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-xs font-extrabold inline-flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 inline-flex items-center justify-center shrink-0">
                      <PdfDocIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {entry.name}
                        </span>
                        {entry.isCurrentDoc && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                            Açık Belge
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {entry.pageCount} sayfa
                        {entry.sizeBytes > 0 ? ` · ${formatSize(entry.sizeBytes)}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0 || isMerging}
                        onClick={() => handleMove(idx, -1)}
                        title="Yukarı taşı"
                        aria-label="Yukarı taşı"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === entries.length - 1 || isMerging}
                        onClick={() => handleMove(idx, 1)}
                        title="Aşağı taşı"
                        aria-label="Aşağı taşı"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isMerging}
                        onClick={() => handleRemove(entry.id)}
                        title="Listeden kaldır"
                        aria-label="Listeden kaldır"
                        className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-35"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {entries.length < 2
              ? 'Birleştirme için en az 2 PDF seçilmelidir.'
              : 'Mevcut notlar sayfa sırasına göre korunur.'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isMerging}
              onClick={onClose}
              className="min-h-[40px] px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold cursor-pointer disabled:opacity-40"
            >
              İptal
            </button>
            <button
              type="button"
              disabled={!canMerge}
              onClick={() => void onConfirmMerge(entries)}
              className="min-h-[40px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <MergePdfIcon className="w-4 h-4" />
              <span>{isMerging ? 'Birleştiriliyor...' : 'Birleştir ve Aç'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
