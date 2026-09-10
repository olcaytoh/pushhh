import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

interface AutoFitOptionContentProps {
  opt: string | number;
  displayOpt: string | number;
  isGrade4?: boolean;
  mode?: 1 | 2 | 3;
  fallbackFontClass?: string;
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
      if (len <= 3) return "text-lg sm:text-xl md:text-2xl font-black";
      if (len <= 6) return "text-base sm:text-lg md:text-xl font-black";
      if (len <= 10) return "text-xs sm:text-sm md:text-base font-bold";
      if (len <= 16) return "text-[11px] sm:text-xs md:text-sm font-bold";
      return "text-[10px] sm:text-[11px] font-bold";
    }

    // mode === 3
    if (len <= 3) return "text-base sm:text-lg md:text-xl font-black";
    if (len <= 6) return "text-xs sm:text-sm md:text-base font-black";
    if (len <= 10) return "text-[11px] sm:text-xs md:text-sm font-bold";
    if (len <= 16) return "text-[10px] sm:text-[11px] font-bold";
    return "text-[9px] sm:text-[10px] font-bold";
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

    // Target available dimensions with generous 8px horizontal padding so text never touches or clips borders
    const targetW = Math.max(10, availW - 8);
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
  }, [updateScale, opt, displayOpt, baseFontClass]);

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
        className={`inline-flex items-center justify-center text-center font-black text-white leading-tight whitespace-nowrap px-0.5 shrink-0 ${
          isHTML ? '' : `${baseFontClass} [text-shadow:_0_1px_3px_#000]`
        }`}
        {...(isHTML
          ? { dangerouslySetInnerHTML: { __html: displayOpt as string } }
          : { children: displayOpt })}
      />
    </div>
  );
};
