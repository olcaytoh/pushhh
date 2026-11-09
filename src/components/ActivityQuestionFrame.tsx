import React from 'react';
import { AutoFitQuestionBox } from './AutoFitQuestionBox';

/**
 * Tüm etkinliklerde ORTAK soru kutusu (İleri Üçer Sayma ile aynı tasarım):
 *  - koyu zemin + amber çerçeve
 *  - içerik (soru görseli + soru cümlesi) kutuyu dolduracak şekilde otomatik ölçeklenir
 *  - 1 / 2 / 3 kişilik modlarda aynı yazı ölçeği
 */
interface ActivityQuestionFrameProps {
  mode: 1 | 2 | 3;
  /** Soru değiştiğinde ölçeği yeniden hesaplatmak için (ör. soru numarası) */
  contentKey?: string | number;
  className?: string;
  /** Soru içeriği çerçeveyi daha çok doldursun (5N1K gibi uzun metinli etkinlikler) */
  fillWide?: boolean;
  children: React.ReactNode;
}

export const ActivityQuestionFrame: React.FC<ActivityQuestionFrameProps> = ({
  mode,
  contentKey,
  className = '',
  fillWide = false,
  children,
}) => (
  <div
    className={`relative flex-1 min-h-0 w-full rounded-2xl sm:rounded-3xl bg-[#080e1d]/90 border-2 ${
      mode === 1 ? 'sm:border-3 border-amber-300/90' : 'border-amber-300/80'
    } shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(255,255,255,0.2)] overflow-hidden ${className}`}
  >
    <div className={`relative z-10 w-full h-full flex items-center justify-center min-h-0 max-h-full overflow-hidden ${fillWide ? 'px-0.5' : 'px-1 sm:px-2'}`}>
      <AutoFitQuestionBox mode={mode} notebookTheme={false} contentKey={contentKey} fillWide={fillWide}>
        {children}
      </AutoFitQuestionBox>
    </div>
  </div>
);

/** Küçük etiket rozeti (ör. "BİLEŞİK SÖZCÜKLER • SORU") - tüm etkinliklerde aynı boyut */
export const QuestionBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block px-3 py-0.5 mb-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider border border-amber-300/80 [text-shadow:none] drop-shadow-none">
    {children}
  </span>
);

/** Soru görseli / kelimesi (emoji, büyük kelime, defter satırı vb.) - ölçekle büyür */
export const QuestionVisual: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-center gap-2 mb-1 leading-tight ${className}`}>{children}</div>
);

/** Soru cümlesi: ortak font ölçeği (ActivityQuestionFrame içinde otomatik ölçeklenir) */
export const QuestionSentence: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`font-black leading-snug text-center px-1 ${className}`}>{children}</p>
);

export default ActivityQuestionFrame;
