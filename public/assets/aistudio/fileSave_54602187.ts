// Chrome File System Access API + otomatik indirme geri dönüşü ile PDF kaydetme yardımcısı

export interface SaveFileResult {
  saved: boolean;
  cancelled: boolean;
}

interface SaveFilePickerWindow extends Window {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
}

/**
 * Düzenlenmiş PDF baytlarını diske kaydeder.
 * Önce Chrome showSaveFilePicker dener; kullanıcı iptali (AbortError) dışındaki
 * tüm hatalarda (iframe SecurityError dahil) otomatik Blob indirmesine geçer.
 */
export async function savePdfBytesToDevice(
  bytes: Uint8Array,
  suggestedFileName = 'duzenlenmis_dosya.pdf',
): Promise<SaveFileResult> {
  const safeBytes = new Uint8Array(bytes);
  const blob = new Blob([safeBytes.buffer], { type: 'application/pdf' });
  const win = window as SaveFilePickerWindow;

  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const fileHandle = await win.showSaveFilePicker({
        suggestedName: suggestedFileName,
        types: [
          {
            description: 'PDF Belgesi',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { saved: true, cancelled: false };
    } catch (err) {
      // Kullanıcı kaydetme penceresini bilerek iptal ettiyse indirme başlatma
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { saved: false, cancelled: true };
      }
      // SecurityError (iframe kısıtı) veya diğer tüm hatalarda klasik indirmeye geç
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = suggestedFileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);

  return { saved: true, cancelled: false };
}
