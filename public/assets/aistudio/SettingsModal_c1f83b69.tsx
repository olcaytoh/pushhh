// Font dosyası seçimi, klavye kısayolları ve çevrimdışı kullanım bilgi penceresi
import { useRef, useState } from 'react';
import type { FontAssets } from '../types/pdf';
import { readFontFileBytes } from '../utils/fontManager';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  fontAssets: FontAssets;
  onClose: () => void;
  onUpdateFonts: (next: FontAssets) => void;
  onResetDefaultFonts: () => Promise<void>;
}

export function SettingsModal({
  isOpen,
  fontAssets,
  onClose,
  onUpdateFonts,
  onResetDefaultFonts,
}: SettingsModalProps) {
  const regularInputRef = useRef<HTMLInputElement | null>(null);
  const boldInputRef = useRef<HTMLInputElement | null>(null);
  const [fontError, setFontError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectFont = async (file: File | undefined, kind: 'regular' | 'bold') => {
    if (!file) return;
    setFontError(null);
    try {
      const bytes = await readFontFileBytes(file);
      if (kind === 'regular') {
        onUpdateFonts({
          ...fontAssets,
          regularBytes: bytes,
          regularLabel: `Özel: ${file.name}`,
        });
      } else {
        onUpdateFonts({
          ...fontAssets,
          boldBytes: bytes,
          boldLabel: `Özel: ${file.name}`,
        });
      }
    } catch (err) {
      setFontError(err instanceof Error ? err.message : 'Font dosyası yüklenemedi.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 id="settings-modal-title" className="text-base font-semibold text-slate-900">
            Font Ayarları ve Yardım
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-sm text-slate-700">
          {/* Font Dosyası Seç Bölümü */}
          <section className="space-y-3">
            <h3 className="font-semibold text-slate-900">Font Dosyası Seç (Türkçe PDF Dışa Aktarma)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PDF kaydederken <code className="px-1 py-0.5 bg-slate-100 rounded">/fonts/NotoSans-Regular.ttf</code> ve{' '}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/fonts/NotoSans-Bold.ttf</code> dosyaları
              otomatik aranır. Dosyalar bulunamazsa Türkçe harflerin (ğ, ü, ş, ı, İ, ö, ç) doğru çıkması
              için metinler yüksek çözünürlüklü şeffaf PNG olarak PDF&apos;e gömülür. İsterseniz kendi{' '}
              <code>.ttf</code> font dosyalarınızı seçebilirsiniz:
            </p>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-800">Normal Font (Regular)</div>
                  <div className="text-xs text-slate-500 truncate">{fontAssets.regularLabel}</div>
                </div>
                <button
                  type="button"
                  onClick={() => regularInputRef.current?.click()}
                  className="min-h-[38px] px-3 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-100 shrink-0 cursor-pointer"
                >
                  Font Dosyası Seç
                </button>
                <input
                  ref={regularInputRef}
                  type="file"
                  accept=".ttf,.otf"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectFont(e.target.files?.[0], 'regular');
                    e.target.value = '';
                  }}
                />
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-800">Kalın Font (Bold)</div>
                  <div className="text-xs text-slate-500 truncate">{fontAssets.boldLabel}</div>
                </div>
                <button
                  type="button"
                  onClick={() => boldInputRef.current?.click()}
                  className="min-h-[38px] px-3 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-100 shrink-0 cursor-pointer"
                >
                  Font Dosyası Seç
                </button>
                <input
                  ref={boldInputRef}
                  type="file"
                  accept=".ttf,.otf"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectFont(e.target.files?.[0], 'bold');
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            {fontError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {fontError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onResetDefaultFonts}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Varsayılan yerel fontları yeniden tara
              </button>
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          {/* Kısayollar */}
          <section className="space-y-2">
            <h3 className="font-semibold text-slate-900">Klavye Kısayolları ve İpuçları</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Geri Al / Yinele:</span> Ctrl+Z ve Ctrl+Y (veya Ctrl+Shift+Z)
              </li>
              <li>
                <span className="font-medium text-slate-800">Yakınlaştırma:</span> Ctrl + Fare Tekerleği
              </li>
              <li>
                <span className="font-medium text-slate-800">Yazı Düzenleme:</span> Seç modunda yazıya çift tıklayın; yeni satır için Shift+Enter, kaydetmek için Enter kullanın.
              </li>
              <li>
                <span className="font-medium text-slate-800">Yazı Silme:</span> Seç modunda yazıyı seçip Delete tuşuna basın veya Silgi aracını kullanın.
              </li>
              <li>
                <span className="font-medium text-slate-800">Çevrimdışı Çalışma:</span> Tüm işlemler tamamen tarayıcınızda çalışır, internet bağlantısı gerektirmez.
              </li>
            </ul>
          </section>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
