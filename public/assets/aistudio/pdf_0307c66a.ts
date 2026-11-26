// Uygulama genelindeki veri modelleri ve araç tipleri

/** Aktif düzenleme aracı modu */
export type ToolMode = 'select' | 'text' | 'pen' | 'eraser';

/** Kullanıcı tarafından seçilebilen yazı boyutu önayarları */
export type FontSizePreset = 'small' | 'medium' | 'large';

/** Kullanıcı tarafından seçilebilen kalem kalınlığı önayarları */
export type PenWidthPreset = 'thin' | 'medium' | 'thick';

/** Sayfa üzerindeki tek bir metin notu (koordinatlar 0-1 arasında normalize edilmiştir) */
export interface TextAnnotation {
  id: string;
  /** Sayfanın sol üstüne göre normalize X konumu (0-1) */
  x: number;
  /** Sayfanın sol üstüne göre normalize Y konumu (0-1) */
  y: number;
  /** Metin içeriği (çok satırlı olabilir) */
  text: string;
  /** Sayfa yüksekliğine oranlı yazı boyutu */
  fontSizeRatio: number;
  /** Hex renk kodu */
  color: string;
  /** Kalın yazı tipi bayrağı */
  bold: boolean;
}

/** Çizim üzerindeki tek bir normalize nokta */
export interface StrokePoint {
  x: number;
  y: number;
}

/** Sayfa üzerindeki tek bir serbest çizim nesnesi */
export interface StrokeAnnotation {
  id: string;
  /** Sayfa boyutuna göre normalize edilmiş noktalar dizisi (0-1) */
  points: StrokePoint[];
  /** Hex renk kodu */
  color: string;
  /** Sayfa genişliğine oranlı çizgi kalınlığı */
  widthRatio: number;
}

/** Tek bir PDF sayfasına ait bağımsız not katmanı */
export interface PageAnnotations {
  texts: TextAnnotation[];
  strokes: StrokeAnnotation[];
}

/** Tüm PDF sayfalarının notlarını sayfa numarasına (1-tabanlı) göre tutan harita */
export type AnnotationsMap = Record<number, PageAnnotations>;

/** Yüklenmiş PDF sayfasının temel boyut bilgisi (scale = 1 iken) */
export interface PageBaseDimension {
  pageNumber: number;
  width: number;
  height: number;
}

/** Seçilebilir renk tanımı */
export interface ColorOption {
  label: string;
  value: string;
}

/** Uygulama içi font durumu */
export interface FontAssets {
  regularBytes: Uint8Array | null;
  boldBytes: Uint8Array | null;
  regularLabel: string;
  boldLabel: string;
}

/** Desteklenen renk paleti */
export const COLOR_OPTIONS: ColorOption[] = [
  { label: 'Siyah', value: '#111827' },
  { label: 'Kırmızı', value: '#dc2626' },
  { label: 'Mavi', value: '#2563eb' },
  { label: 'Yeşil', value: '#16a34a' },
];

/** Yazı boyutu önayarlarının sayfa yüksekliğine oranı */
export const FONT_SIZE_RATIOS: Record<FontSizePreset, { label: string; ratio: number }> = {
  small: { label: 'Küçük', ratio: 0.016 },
  medium: { label: 'Orta', ratio: 0.024 },
  large: { label: 'Büyük', ratio: 0.036 },
};

/** Kalem kalınlığı önayarlarının sayfa genişliğine oranı */
export const PEN_WIDTH_RATIOS: Record<PenWidthPreset, { label: string; ratio: number; previewPx: number }> = {
  thin: { label: 'İnce', ratio: 0.0024, previewPx: 3 },
  medium: { label: 'Orta', ratio: 0.0048, previewPx: 6 },
  thick: { label: 'Kalın', ratio: 0.009, previewPx: 10 },
};
