// Yerel font dosyalarını (/fonts/NotoSans-*.ttf) yükleme ve kullanıcı seçimli .ttf font yönetimi
import type { FontAssets } from '../types/pdf';

async function tryFetchLocalFont(paths: string[]): Promise<Uint8Array | null> {
  for (const candidate of paths) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) continue;
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength < 1000) continue;
      const view = new DataView(buffer);
      const header = view.getUint32(0, false);
      const isValidFont = header === 0x00010000 || header === 0x4f54544f || header === 0x74746366;
      if (!isValidFont) continue;
      return new Uint8Array(buffer);
    } catch {
      // Yerel dosya bulunamadı veya tarayıcı kısıtı var — sonraki yola geç
    }
  }
  return null;
}

export async function loadDefaultLocalFonts(): Promise<FontAssets> {
  const [regularBytes, boldBytes] = await Promise.all([
    tryFetchLocalFont(['./fonts/NotoSans-Regular.ttf', '/fonts/NotoSans-Regular.ttf']),
    tryFetchLocalFont(['./fonts/NotoSans-Bold.ttf', '/fonts/NotoSans-Bold.ttf']),
  ]);

  return {
    regularBytes,
    boldBytes,
    regularLabel: regularBytes ? 'Yerel NotoSans-Regular.ttf' : 'Bulunamadı (4x PNG yedek yöntem aktif)',
    boldLabel: boldBytes ? 'Yerel NotoSans-Bold.ttf' : 'Bulunamadı (4x PNG yedek yöntem aktif)',
  };
}

export async function readFontFileBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength < 256) {
    throw new Error('Seçilen dosya geçerli bir font dosyası gibi görünmüyor.');
  }
  const view = new DataView(buffer);
  const header = view.getUint32(0, false);
  const isValidFont = header === 0x00010000 || header === 0x4f54544f || header === 0x74746366;
  if (!isValidFont) {
    throw new Error('Lütfen geçerli bir .ttf veya .otf yazı tipi dosyası seçin.');
  }
  return new Uint8Array(buffer);
}
