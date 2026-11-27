// Çevrimdışı PDF Kütüphanesi ve Yerel Klasör Tarayıcı (IndexedDB + File System Access API)
// Tam ekrandan çıkmadan son PDF'leri ve bağlı klasördeki PDF'leri açmak için kullanılır.
import type { FileSystemFileHandleLike } from '../types/pdf';

export interface FileSystemDirectoryHandleLike {
  kind: 'directory';
  name: string;
  values?: () => AsyncIterable<FileSystemDirectoryHandleLike | FileSystemFileHandleLike>;
  queryPermission?: (desc?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission?: (desc?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
}

export interface StoredPdfMeta {
  id: string;
  name: string;
  sizeBytes: number;
  numPages?: number;
  updatedAt: number;
  hasHandle: boolean;
}

interface StoredPdfRecord extends StoredPdfMeta {
  buffer: ArrayBuffer;
  handle?: FileSystemFileHandleLike | null;
}

export interface LinkedFolderRecord {
  id: string;
  name: string;
  addedAt: number;
  handle: FileSystemDirectoryHandleLike;
}

export interface DirectoryPdfItem {
  name: string;
  handle: FileSystemFileHandleLike;
}

export interface DirectoryListingResult {
  status: 'ok' | 'permission-required' | 'denied' | 'error';
  subfolders: FileSystemDirectoryHandleLike[];
  pdfFiles: DirectoryPdfItem[];
}

interface WindowWithDirPicker extends Window {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: string;
  }) => Promise<FileSystemDirectoryHandleLike>;
}

const DB_NAME = 'pdfEditorOfflineLibrary_v1';
const DB_VERSION = 1;
const STORE_RECENT_PDFS = 'recentPdfs';
const STORE_LINKED_FOLDERS = 'linkedFolders';
const MAX_STORED_PDFS = 15;
const MAX_SINGLE_PDF_BYTES = 40 * 1024 * 1024; // 40 MB

function openLibraryDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_RECENT_PDFS)) {
          db.createObjectStore(STORE_RECENT_PDFS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_LINKED_FOLDERS)) {
          db.createObjectStore(STORE_LINKED_FOLDERS, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function buildPdfRecordId(name: string, sizeBytes: number): string {
  return `${name.trim().toLowerCase()}::${sizeBytes}`;
}

export function supportsDirectoryPicker(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as WindowWithDirPicker;
  return typeof win.showDirectoryPicker === 'function';
}

export async function savePdfToLibrary(
  fileName: string,
  bytes: Uint8Array,
  numPages?: number,
  handle?: FileSystemFileHandleLike | null,
): Promise<void> {
  if (!fileName || bytes.byteLength === 0 || bytes.byteLength > MAX_SINGLE_PDF_BYTES) {
    return;
  }

  const db = await openLibraryDb();
  if (!db) return;

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const id = buildPdfRecordId(fileName, bytes.byteLength);
  const now = Date.now();

  const recordWithHandle: StoredPdfRecord = {
    id,
    name: fileName,
    sizeBytes: bytes.byteLength,
    numPages,
    updatedAt: now,
    hasHandle: Boolean(handle),
    buffer: copy.buffer,
    handle: handle ?? null,
  };

  const putRecord = (rec: StoredPdfRecord): Promise<boolean> =>
    new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_RECENT_PDFS, 'readwrite');
        tx.objectStore(STORE_RECENT_PDFS).put(rec);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });

  let saved = await putRecord(recordWithHandle);
  if (!saved && handle) {
    // Bazı tarayıcılarda FileSystemHandle IndexedDB'de saklanamıyorsa handle olmadan kaydet
    saved = await putRecord({
      ...recordWithHandle,
      hasHandle: false,
      handle: null,
    });
  }

  if (saved) {
    // Eski kayıtları temizle (en fazla MAX_STORED_PDFS adet tut)
    try {
      const all = await listLibraryPdfs();
      if (all.length > MAX_STORED_PDFS) {
        const toDelete = all.slice(MAX_STORED_PDFS);
        const tx = db.transaction(STORE_RECENT_PDFS, 'readwrite');
        const store = tx.objectStore(STORE_RECENT_PDFS);
        for (const item of toDelete) {
          store.delete(item.id);
        }
      }
    } catch {
      // Yoksay
    }
  }
}

export async function listLibraryPdfs(): Promise<StoredPdfMeta[]> {
  const db = await openLibraryDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECENT_PDFS, 'readonly');
      const req = tx.objectStore(STORE_RECENT_PDFS).getAll();
      req.onsuccess = () => {
        const raw = (req.result || []) as StoredPdfRecord[];
        const metas: StoredPdfMeta[] = raw
          .map((r) => ({
            id: r.id,
            name: r.name,
            sizeBytes: r.sizeBytes,
            numPages: r.numPages,
            updatedAt: r.updatedAt,
            hasHandle: Boolean(r.hasHandle && r.handle),
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(metas);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function loadLibraryPdf(
  id: string,
): Promise<{ file: File; handle: FileSystemFileHandleLike | null } | null> {
  const db = await openLibraryDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECENT_PDFS, 'readonly');
      const req = tx.objectStore(STORE_RECENT_PDFS).get(id);
      req.onsuccess = () => {
        const rec = req.result as StoredPdfRecord | undefined;
        if (!rec || !rec.buffer) {
          resolve(null);
          return;
        }
        const file = new File([rec.buffer], rec.name, {
          type: 'application/pdf',
          lastModified: rec.updatedAt || Date.now(),
        });
        resolve({ file, handle: rec.handle ?? null });
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function deleteLibraryPdf(id: string): Promise<void> {
  const db = await openLibraryDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_RECENT_PDFS, 'readwrite');
      tx.objectStore(STORE_RECENT_PDFS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function listLinkedFolders(): Promise<LinkedFolderRecord[]> {
  const db = await openLibraryDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_LINKED_FOLDERS, 'readonly');
      const req = tx.objectStore(STORE_LINKED_FOLDERS).getAll();
      req.onsuccess = () => {
        const rows = ((req.result || []) as LinkedFolderRecord[]).sort(
          (a, b) => b.addedAt - a.addedAt,
        );
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function pickAndSavePdfFolder(): Promise<
  | { status: 'added'; folder: LinkedFolderRecord }
  | { status: 'cancelled' }
  | { status: 'unsupported' | 'blocked' }
> {
  const win = window as WindowWithDirPicker;
  if (typeof win.showDirectoryPicker !== 'function') {
    return { status: 'unsupported' };
  }

  try {
    const dirHandle = await win.showDirectoryPicker({ mode: 'read' });
    const record: LinkedFolderRecord = {
      id: `dir-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: dirHandle.name || 'PDF Klasörü',
      addedAt: Date.now(),
      handle: dirHandle,
    };

    const db = await openLibraryDb();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_LINKED_FOLDERS, 'readwrite');
          tx.objectStore(STORE_LINKED_FOLDERS).put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
          tx.onabort = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    return { status: 'added', folder: record };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { status: 'cancelled' };
    }
    if (err instanceof DOMException && err.name === 'SecurityError') {
      return { status: 'blocked' };
    }
    return { status: 'unsupported' };
  }
}

export async function deleteLinkedFolder(id: string): Promise<void> {
  const db = await openLibraryDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_LINKED_FOLDERS, 'readwrite');
      tx.objectStore(STORE_LINKED_FOLDERS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function readDirectoryPdfs(
  dirHandle: FileSystemDirectoryHandleLike,
  requestPermIfNeeded = false,
): Promise<DirectoryListingResult> {
  try {
    if (typeof dirHandle.queryPermission === 'function') {
      const current = await dirHandle.queryPermission({ mode: 'read' });
      if (current !== 'granted') {
        if (!requestPermIfNeeded) {
          return { status: 'permission-required', subfolders: [], pdfFiles: [] };
        }
        if (typeof dirHandle.requestPermission === 'function') {
          const next = await dirHandle.requestPermission({ mode: 'read' });
          if (next !== 'granted') {
            return { status: 'denied', subfolders: [], pdfFiles: [] };
          }
        } else {
          return { status: 'denied', subfolders: [], pdfFiles: [] };
        }
      }
    }

    if (typeof dirHandle.values !== 'function') {
      return { status: 'error', subfolders: [], pdfFiles: [] };
    }

    const subfolders: FileSystemDirectoryHandleLike[] = [];
    const pdfFiles: DirectoryPdfItem[] = [];

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        subfolders.push(entry);
      } else if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push({ name: entry.name, handle: entry });
      }
    }

    subfolders.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    pdfFiles.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    return { status: 'ok', subfolders, pdfFiles };
  } catch {
    return { status: 'error', subfolders: [], pdfFiles: [] };
  }
}
