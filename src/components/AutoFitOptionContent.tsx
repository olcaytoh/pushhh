import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

interface AutoFitOptionContentProps {
  opt: string | number;
  displayOpt: string | number;
  isGrade4?: boolean;
  mode?: 1 | 2 | 3;
  fallbackFontClass?: string;
}

function formatOptionText(rawText: string | number, mode: 1 | 2 | 3): string | number {
  if (typeof rawText !== 'string') return rawText;
  if (rawText.includes('<')) return rawText; // HTML tags (fractions etc.)
  const clean = rawText.trim();
  const words = clean.split(/\s+/);
  if (words.length <= 1) return clean;

  // 3 Oyuncu modunda (ve 2 oyuncu modundaki uzun şıklarda) kelimeler alt satıra kaysın, büyüklük korunsun
  if (mode === 3 || (mode === 2 && clean.length > 14)) {
    if (words.length === 2) {
      return words[0] + '\n' + words[1];
    }
    // 3 veya daha fazla kelime varsa ortadan dengeli 2 satıra böl
    const half = Math.ceil(words.length / 2);
    return words.slice(0, half).join(' ') + '\n' + words.slice(half).join(' ');
  }

  return clean;
}

export const AutoFitOptionContent: React.FC<AutoFitOptionContentProps> = ({
  opt,
  displayOpt,
  isGrade4 = false,
  mode = 1,
  fallbackFontClass = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const formattedDisplayOpt = React.useMemo(() => {
    return formatOptionText(displayOpt, mode);
  }, [displayOpt, mode]);

  const hasLineBreak = typeof formattedDisplayOpt === 'string' && formattedDisplayOpt.includes('\n');
  const isHTML = typeof displayOpt === 'string' && displayOpt.includes('<');

  // Compute adaptive base font class based on character count and player mode
  const baseFontClass = React.useMemo(() => {
    const clean = String(opt ?? '').replace(/<[^>]*>/g, '').trim();
    const len = clean.length;
    const isFraction = clean.includes('/') || (typeof displayOpt === 'string' && displayOpt.includes('inline-flex flex-col'));

    if (isFraction) {
      if (mode === 1) return "text-xl sm:text-2xl md:text-3xl font-black";
      if (mode === 2) return "text-lg sm:text-xl md:text-2xl font-black";
      return "text-base sm:text-lg font-black";
    }

    if (mode === 1) {
      if (len <= 3) return "text-2xl sm:text-3xl md:text-4xl font-black";
      if (len <= 6) return "text-xl sm:text-2xl md:text-3xl font-black";
      if (len <= 9) return "text-base sm:text-lg md:text-xl lg:text-2xl font-black";
      if (len <= 14) return "text-sm sm:text-base md:text-lg lg:text-xl font-bold";
      if (len <= 20) return "text-xs sm:text-sm md:text-base font-bold";
      return "text-[11px] sm:text-xs md:text-sm font-bold";
    }

    if (mode === 2) {
      const words = clean.split(/\s+/);
      const effectiveLen = words.length > 1 && clean.length > 14
        ? Math.max(...words.map(w => w.length))
        : len;

      if (effectiveLen <= 3) return "text-lg sm:text-xl md:text-2xl font-black";
      if (effectiveLen <= 6) return "text-base sm:text-lg md:text-xl font-black";
      if (effectiveLen <= 10) return "text-xs sm:text-sm md:text-base font-bold";
      if (effectiveLen <= 16) return "text-[11px] sm:text-xs md:text-sm font-bold";
      return "text-[10px] sm:text-[11px] font-bold";
    }

    // mode === 3: Şıklar alt alta kaysın, yazı büyüklüğü yüksek tutulup korunsun
    const words = clean.split(/\s+/);
    const effectiveLen = words.length > 1
      ? Math.max(...words.map(w => w.length))
      : len;

    if (effectiveLen <= 3) return "text-base sm:text-lg md:text-xl font-black";
    if (effectiveLen <= 6) return "text-sm sm:text-base md:text-lg font-black";
    if (effectiveLen <= 10) return "text-xs sm:text-sm md:text-base font-black";
    if (effectiveLen <= 14) return "text-[11px] sm:text-xs md:text-sm font-black";
    return "text-[10px] sm:text-[11px] md:text-xs font-bold";
  }, [opt, displayOpt, mode]);

  const updateScale = React.useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Temporarily reset transform to measure natural size
    content.style.transform = 'none';

    const availW = container.clientWidth;
    const availH = container.clientHeight;
    if (availW <= 0 || availH <= 0) return;

    // Measure accurate natural content dimensions without artificial flex stretching
    const naturalW = content.offsetWidth || content.scrollWidth;
    const naturalH = content.offsetHeight || content.scrollHeight;
    if (naturalW <= 0 || naturalH <= 0) return;

    // Target available dimensions with generous 6px horizontal padding so text never touches borders
    const targetW = Math.max(10, availW - 6);
    const targetH = Math.max(10, availH - 4);

    const scaleW = targetW / naturalW;
    const scaleH = targetH / naturalH;
    let s = Math.min(scaleW, scaleH);

    // If s > 1, short numbers/text expand nicely up to 1.15x
    // If s < 1, long text scales down smoothly without arbitrary minimum clipping to prevent any overflow!
    if (s > 1.0) {
      s = Math.min(s, 1.15);
    } else {
      s = Math.max(s, 0.20);
    }

    setScale(s);
  }, []);

  useLayoutEffect(() => {
    updateScale();
  }, [updateScale, opt, displayOpt, formattedDisplayOpt, baseFontClass]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      updateScale();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden px-1 py-0.5 pointer-events-none select-none"
    >
      <div
        ref={contentRef}
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
        }}
        className={`inline-flex flex-col items-center justify-center text-center font-black text-white ${
          hasLineBreak ? 'whitespace-pre-line leading-[1.12] break-words' : 'whitespace-nowrap leading-tight'
        } px-0.5 shrink-0 ${
          isHTML ? '' : `${baseFontClass} [text-shadow:_0_1px_3px_#000]`
        }`}
        {...(isHTML
          ? { dangerouslySetInnerHTML: { __html: formattedDisplayOpt as string } }
          : { children: formattedDisplayOpt })}
      />
    </div>
  );
};
