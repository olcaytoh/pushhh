// Yerel font dosyalarını yükleme ve kullanıcı tarafından seçilen .ttf fontlarını yönetme yardımcıları
import type { FontAssets } from '../types/pdf';

/**
 * Yerel ./fonts/NotoSans-Regular.ttf ve ./fonts/NotoSans-Bold.ttf dosyalarını
 * harici istek atmadan yüklemeyi dener. Bulunamazsa veya file:// kısıtı varsa hata fırlatmaz,
 * null döndürerek yüksek çözünürlüklü canvas yedek yönteminin devreye girmesini sağlar.
 */
async function tryFetchLocalFont(relativePath: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(relativePath);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 1000) return null;
    // Geçerli bir TTF/OTF başlığı mı basit kontrol (0x00010000, 'OTTO', 'ttcf')
    const view = new DataView(buffer);
    const header = view.getUint32(0, false);
    const isValidFont = header === 0x00010000 || header === 0x4f54544f || header === 0x74746366;
    if (!isValidFont) return null;
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

/**
 * Varsayılan yerel Noto Sans fontlarını yüklemeye çalışır
 */
export async function loadDefaultLocalFonts(): Promise<FontAssets> {
  const [regularBytes, boldBytes] = await Promise.all([
    tryFetchLocalFont('./fonts/NotoSans-Regular.ttf'),
    tryFetchLocalFont('./fonts/NotoSans-Bold.ttf'),
  ]);

  return {
    regularBytes,
    boldBytes,
    regularLabel: regularBytes ? 'Yerel NotoSans-Regular.ttf' : 'Bulunamadı (Yedek yöntem aktif)',
    boldLabel: boldBytes ? 'Yerel NotoSans-Bold.ttf' : 'Bulunamadı (Yedek yöntem aktif)',
  };
}

/**
 * Kullanıcının seçtiği .ttf veya .otf dosyasını Uint8Array olarak okur
 */
export async function readFontFileBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength < 256) {
    throw new Error('Seçilen dosya geçerli bir font dosyası gibi görünmüyor.');
  }
  return new Uint8Array(buffer);
}
