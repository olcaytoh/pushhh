// PDF görüntüleyici, not editörü ve düzenlenebilir kayıt biçimi için veri tipleri ve sabitler

export type ToolMode = 'select' | 'text' | 'pen' | 'eraser';

export type FontSizeKey = 'small' | 'medium' | 'large';
export type PenWidthKey = 'thin' | 'medium' | 'thick';

export interface StrokePoint {
  /** Sayfa genişliğine göre 0-1 arası normalize X koordinatı */
  x: number;
  /** Sayfa yüksekliğine göre 0-1 arası normalize Y koordinatı */
  y: number;
}

export interface TextAnnotation {
  id: string;
  /** Sayfa sol üstüne göre normalize X (0-1) */
  x: number;
  /** Sayfa sol üstüne göre normalize Y (0-1) */
  y: number;
  text: string;
  /** Sayfa yüksekliğine oranlı yazı tipi boyutu */
  fontSizeRatio: number;
  color: string;
  bold: boolean;
}

export interface StrokeAnnotation {
  id: string;
  points: StrokePoint[];
  color: string;
  /** Sayfa genişliğine oranlı çizgi kalınlığı */
  widthRatio: number;
}

export interface PageAnnotations {
  texts: TextAnnotation[];
  strokes: StrokeAnnotation[];
}

/** Sayfa numarası (1 tabanlı) -> sayfa not katmanı eşlemesi */
export type AnnotationsMap = Record<number, PageAnnotations>;

/** PDF içine gömülecek düzenlenebilir not JSON şeması */
export interface EmbeddedNotesPayload {
  surum: 1;
  sayfaSayisi: number;
  sayfalar: Record<string, PageAnnotations>;
}

/** Seçili nesne (Seç aracında metin veya çizim seçimi) */
export interface SelectedObject {
  type: 'text' | 'stroke';
  pageNumber: number;
  id: string;
}

export interface PageMeta {
  pageNumber: number;
  /** Zoom=1 düzeyinde PDF piksel/point genişliği */
  baseWidth: number;
  /** Zoom=1 düzeyinde PDF piksel/point yüksekliği */
  baseHeight: number;
}

export interface FontAssets {
  regularBytes: Uint8Array | null;
  boldBytes: Uint8Array | null;
  regularLabel: string;
  boldLabel: string;
}

export interface ToastNotice {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

/** File System Access API için güvenli ve tarayıcıdan bağımsız tutamaç arayüzü */
export interface FileSystemWritableStreamLike {
  write: (data: Blob | BufferSource | string) => Promise<void>;
  close: () => Promise<void>;
}

export interface FileSystemFileHandleLike {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableStreamLike>;
  queryPermission?: (descriptor: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission?: (descriptor: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
}

export interface ColorOption {
  label: string;
  value: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { label: 'Siyah', value: '#111827' },
  { label: 'Kırmızı', value: '#dc2626' },
  { label: 'Mavi', value: '#2563eb' },
  { label: 'Yeşil', value: '#15803d' },
];

/** Sayfa yüksekliğine oranlı metin boyutu seçenekleri */
export const FONT_SIZE_RATIOS: Record<FontSizeKey, { label: string; ratio: number }> = {
  small: { label: 'Küçük', ratio: 0.017 },
  medium: { label: 'Orta', ratio: 0.024 },
  large: { label: 'Büyük', ratio: 0.034 },
};

/** Sayfa genişliğine oranlı kalem kalınlığı seçenekleri */
export const PEN_WIDTH_RATIOS: Record<PenWidthKey, { label: string; ratio: number }> = {
  thin: { label: 'İnce', ratio: 0.0028 },
  medium: { label: 'Orta', ratio: 0.0052 },
  thick: { label: 'Kalın', ratio: 0.0092 },
};

/** Düzenlenebilir PDF kayıt ekleri sabitleri */
export const EMBEDDED_ORIGINAL_FILENAME = 'orijinal.pdf';
export const EMBEDDED_NOTES_FILENAME = 'duzenlenebilir-notlar.json';
export const EMBEDDED_ATTACHMENT_DESCRIPTION = 'PDF-Not-Uygulamasi v1';
export const EMBEDDED_NOTES_VERSION = 1;
