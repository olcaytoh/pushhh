// File System Access API (showOpenFilePicker, showSaveFilePicker, üzerine yazma) ve Blob indirme yedekleri
import type { FileSystemFileHandleLike } from '../types/pdf';

interface WindowWithFilePickers extends Window {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: Array<{ description?: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandleLike[]>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    excludeAcceptAllOption?: boolean;
    types?: Array<{ description?: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandleLike>;
}

export interface OpenPickerResult {
  status: 'opened' | 'cancelled' | 'fallback';
  file?: File;
  handle?: FileSystemFileHandleLike | null;
}

export interface SaveAsResult {
  status: 'saved' | 'downloaded' | 'cancelled';
  fileName: string;
  handle?: FileSystemFileHandleLike | null;
}

export interface OverwriteResult {
  status: 'overwritten' | 'downloaded';
  reason?: string;
}

export async function pickPdfWithFileSystemAccess(): Promise<OpenPickerResult> {
  const win = window as WindowWithFilePickers;
  if (typeof win.showOpenFilePicker !== 'function') {
    return { status: 'fallback' };
  }

  try {
    const handles = await win.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: 'PDF Dosyaları',
          accept: { 'application/pdf': ['.pdf'] },
        },
      ],
    });
    const handle = handles?.[0];
    if (!handle) {
      return { status: 'cancelled' };
    }
    const file = await handle.getFile();
    return { status: 'opened', file, handle };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { status: 'cancelled' };
    }
    return { status: 'fallback' };
  }
}

export async function extractDropFileHandle(
  dataTransfer: DataTransfer,
): Promise<FileSystemFileHandleLike | null> {
  try {
    const items = dataTransfer.items;
    if (!items || items.length === 0) return null;
    const firstItem = items[0] as DataTransferItem & {
      getAsFileSystemHandle?: () => Promise<FileSystemFileHandleLike | { kind: string } | null>;
    };
    if (typeof firstItem.getAsFileSystemHandle !== 'function') {
      return null;
    }
    const handle = await firstItem.getAsFileSystemHandle();
    if (handle && handle.kind === 'file') {
      return handle as FileSystemFileHandleLike;
    }
    return null;
  } catch {
    return null;
  }
}

export function downloadPdfBytes(pdfBytes: Uint8Array, fileName: string): void {
  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const copy = new Uint8Array(pdfBytes.byteLength);
  copy.set(pdfBytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

export async function overwritePdfFileHandle(
  handle: FileSystemFileHandleLike | null,
  pdfBytes: Uint8Array,
  fallbackFileName: string,
): Promise<OverwriteResult> {
  if (!handle || typeof handle.createWritable !== 'function') {
    downloadPdfBytes(pdfBytes, fallbackFileName);
    return { status: 'downloaded', reason: 'no-handle' };
  }

  try {
    if (typeof handle.queryPermission === 'function') {
      const current = await handle.queryPermission({ mode: 'readwrite' });
      if (current !== 'granted' && typeof handle.requestPermission === 'function') {
        const requested = await handle.requestPermission({ mode: 'readwrite' });
        if (requested !== 'granted') {
          downloadPdfBytes(pdfBytes, fallbackFileName);
          return { status: 'downloaded', reason: 'permission-denied' };
        }
      }
    } else if (typeof handle.requestPermission === 'function') {
      const requested = await handle.requestPermission({ mode: 'readwrite' });
      if (requested !== 'granted') {
        downloadPdfBytes(pdfBytes, fallbackFileName);
        return { status: 'downloaded', reason: 'permission-denied' };
      }
    }

    const writable = await handle.createWritable();
    const copy = new Uint8Array(pdfBytes.byteLength);
    copy.set(pdfBytes);
    await writable.write(new Blob([copy.buffer], { type: 'application/pdf' }));
    await writable.close();
    return { status: 'overwritten' };
  } catch {
    downloadPdfBytes(pdfBytes, fallbackFileName);
    return { status: 'downloaded', reason: 'write-failed' };
  }
}

export async function savePdfBytesAs(
  pdfBytes: Uint8Array,
  suggestedName: string,
): Promise<SaveAsResult> {
  const safeName = suggestedName.toLowerCase().endsWith('.pdf')
    ? suggestedName
    : `${suggestedName}.pdf`;
  const win = window as WindowWithFilePickers;

  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: safeName,
        types: [
          {
            description: 'PDF Dosyası',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      const copy = new Uint8Array(pdfBytes.byteLength);
      copy.set(pdfBytes);
      await writable.write(new Blob([copy.buffer], { type: 'application/pdf' }));
      await writable.close();
      return {
        status: 'saved',
        fileName: handle.name || safeName,
        handle,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { status: 'cancelled', fileName: safeName };
      }
    }
  }

  downloadPdfBytes(pdfBytes, safeName);
  return { status: 'downloaded', fileName: safeName, handle: null };
}

export function buildSuggestedName(originalName: string, suffix: string): string {
  const clean = originalName.replace(/\.pdf$/i, '').trim() || 'belge';
  return `${clean}${suffix}.pdf`;
}
