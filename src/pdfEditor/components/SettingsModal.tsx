// Ayarlar / Yardım modalı: yerel font dosyaları, kullanıcı .ttf seçimi, kısayollar ve internetsiz kullanım bilgisi
import React, { useRef } from 'react';
import type { FontAssets } from '../types/pdf';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontAssets: FontAssets;
  onSelectFontFile: (weight: 'regular' | 'bold', file: File) => void;
  onResetFonts: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fontAssets,
  onSelectFontFile,
  onResetFonts,
}) => {
  const regularInputRef = useRef<HTMLInputElement | null>(null);
  const boldInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto workspace-scroll text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Ayarlar ve Yardım</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          <section className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-base">
              Türkçe PDF Yazı Tipi (.ttf / .otf)
            </h3>
            <p className="text-slate-600 leading-relaxed">
              PDF kaydedilirken yerel <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/fonts/NotoSans-Regular.ttf</code> ve{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/fonts/NotoSans-Bold.ttf</code> dosyaları
              aranır. Dosyalar yoksa uygulama çökmez; <strong>ğ, ü, ş, ı, İ, ö, ç</strong> harflerini yüksek çözünürlüklü (4x)
              şeffaf PNG olarak kusursuz şekilde PDF&apos;e işler. İsterseniz aşağıdan kendi font dosyanızı seçebilirsiniz:
            </p>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="min-w-0">
                <div className="font-medium text-slate-800">Normal Yazı Tipi (Regular)</div>
                <div className="text-xs text-slate-500 truncate">{fontAssets.regularLabel}</div>
              </div>
              <button
                type="button"
                onClick={() => regularInputRef.current?.click()}
                className="shrink-0 min-h-[40px] px-3.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
              >
                Font Dosyası Seç
              </button>
              <input
                ref={regularInputRef}
                type="file"
                accept=".ttf,.otf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelectFontFile('regular', file);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="min-w-0">
                <div className="font-medium text-slate-800">Kalın Yazı Tipi (Bold)</div>
                <div className="text-xs text-slate-500 truncate">{fontAssets.boldLabel}</div>
              </div>
              <button
                type="button"
                onClick={() => boldInputRef.current?.click()}
                className="shrink-0 min-h-[40px] px-3.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
              >
                Font Dosyası Seç
              </button>
              <input
                ref={boldInputRef}
                type="file"
                accept=".ttf,.otf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelectFontFile('bold', file);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onResetFonts}
                className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
              >
                Varsayılan yerel fontları yeniden kontrol et
              </button>
            </div>
          </section>

          <section className="space-y-2 pt-3 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 text-base">Kaydetme Seçenekleri</h3>
            <ul className="space-y-1.5 text-slate-600 text-xs leading-relaxed">
              <li>
                <strong>Kaydet (Ctrl+S):</strong> Dosya &quot;PDF Aç&quot; ile açıldıysa (Chrome/Edge) orijinal dosyanın üzerine düzenlenebilir olarak yazar.
              </li>
              <li>
                <strong>Farklı Kaydet:</strong> Notları düzenlenebilir olarak yeni bir PDF dosyasına kaydeder.
              </li>
              <li>
                <strong>Düz PDF Dışa Aktar:</strong> Notları kalıcı olarak işler, ek gömmez (küçük boyutlu paylaşım kopyası).
              </li>
            </ul>
          </section>

          <section className="space-y-2 pt-3 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 text-base">Kısayollar ve İpuçları</h3>
            <ul className="space-y-1.5 text-slate-600 text-xs">
              <li><strong>Ctrl + S:</strong> Kaydet</li>
              <li><strong>Ctrl + Fare Tekerleği:</strong> Yakınlaştır / Uzaklaştır (%50–%400)</li>
              <li><strong>Ctrl + Z / Ctrl + Y:</strong> Geri Al / Yinele (Ctrl + Shift + Z desteklenir)</li>
              <li><strong>Shift + Enter:</strong> Metin kutusunda alt satıra geç (Enter sabitler)</li>
              <li><strong>Çift Tıkla (Seç Modu):</strong> Mevcut yazıyı yeniden düzenle</li>
              <li><strong>Delete / Backspace:</strong> Seçili yazıyı veya çizimi sil</li>
              <li><strong>Esc:</strong> Tam ekrandan çık veya metin düzenlemeyi iptal et</li>
            </ul>
          </section>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
