import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';

interface AutoFitQuestionBoxProps {
  questionHTML?: string;
  questionText?: string;
  mode?: 1 | 2 | 3;
  className?: string;
  notebookTheme?: boolean;
}

export const AutoFitQuestionBox: React.FC<AutoFitQuestionBoxProps> = ({
  questionHTML,
  questionText,
  mode = 1,
  className = '',
  notebookTheme = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [isReady, setIsReady] = useState<boolean>(false);

  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl) return;

    // Temporarily reset transform to measure true unscaled natural dimensions!
    measureEl.style.transform = 'none';

    const availWidth = container.clientWidth;
    const availHeight = container.clientHeight;

    if (availWidth <= 0 || availHeight <= 0) return;

    // Measure natural (unscaled) content dimensions
    const trueNaturalWidth = measureEl.scrollWidth || measureEl.offsetWidth;
    const trueNaturalHeight = measureEl.scrollHeight || measureEl.offsetHeight;

    if (trueNaturalWidth <= 0 || trueNaturalHeight <= 0) return;

    // Detect if content has full-width image container (such as uzamsal iliskiler)
    const hasFullWidthImage = !!measureEl.querySelector('[data-full-width="true"], .uzamsal-soru-container');
    const hasHalatBox = !!measureEl.querySelector('.halat-islem-box');
    const isClockQuestion = !!measureEl.querySelector('.analog-clock-svg, .clock-svg-container');

    // Margins
    const marginX = hasFullWidthImage ? 0 : hasHalatBox ? 2 : (mode === 3 ? 2 : mode === 2 ? 4 : 6);
    const marginY = hasFullWidthImage ? 0 : hasHalatBox ? 2 : isClockQuestion ? 10 : (mode === 3 ? 2 : mode === 2 ? 4 : 6);

    const targetAvailW = Math.max(10, availWidth - marginX);
    const targetAvailH = Math.max(10, availHeight - marginY);

    const scaleX = targetAvailW / trueNaturalWidth;
    const scaleY = targetAvailH / trueNaturalHeight;

    // For full-width image questions, let flexbox naturally fill 100% height and width
    if (hasFullWidthImage) {
      setScale(1);
      setIsReady(true);
      return;
    }

    // Scale required so that neither width nor height overflows the card frame
    let computedScale = Math.min(scaleX, scaleY);

    // Allow content with surplus room to scale up proportionally so it fills the frame beautifully
    // For clock questions, constrain enlargement so the clock never blows out of bounds
    const maxEnlargeScale = isClockQuestion ? 1.05 : (mode === 1 ? 1.8 : mode === 2 ? 1.5 : 1.3);
    const minShrinkScale = mode === 3 ? 0.35 : mode === 2 ? 0.40 : 0.45;

    if (computedScale > 1.02) {
      computedScale = Math.min(computedScale, maxEnlargeScale);
    } else if (computedScale >= 0.98) {
      computedScale = 1;
    } else {
      computedScale = Math.max(minShrinkScale, computedScale * 0.985);
    }

    // Round to 3 decimals to avoid subpixel fluttering
    const rounded = Math.round(computedScale * 1000) / 1000;
    setScale(rounded);
    setIsReady(true);
  }, [mode]);

  // Recalculate whenever question, mode, or layout changes
  useLayoutEffect(() => {
    calculateScale();
  }, [questionHTML, questionText, mode]);

  useEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container) return;

    // ResizeObserver on container and content
    const ro = new ResizeObserver(() => {
      calculateScale();
    });
    ro.observe(container);
    if (measureEl) ro.observe(measureEl);

    // Watch for images loading
    if (measureEl) {
      const imgs = measureEl.querySelectorAll('img');
      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', calculateScale);
          img.addEventListener('error', calculateScale);
        }
      });
    }

    const timer = setTimeout(calculateScale, 50);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [calculateScale, questionHTML, questionText]);

  // Responsive font size baseline based on mode
  const fontClass = mode === 1
    ? 'text-lg xs:text-xl sm:text-2xl md:text-3xl'
    : mode === 2
    ? 'text-base xs:text-lg sm:text-xl'
    : 'text-sm xs:text-base sm:text-lg';

  // Detect if question contains a full-width/full-height visual container (like uzamsal iliskiler)
  const isFullImageQuestion = Boolean(
    questionHTML && (questionHTML.includes('uzamsal-soru-container') || questionHTML.includes('data-full-width="true"'))
  );

  const htmlHasQuestion = Boolean(
    questionHTML && (
      (questionText && questionHTML.toLowerCase().includes(questionText.trim().toLowerCase().slice(0, 15))) ||
      questionHTML.includes('?') ||
      questionHTML.includes('hangisidir') ||
      questionHTML.includes('kaçtır') ||
      questionHTML.includes('nedir') ||
      questionHTML.includes('soru')
    )
  );
  const shouldRenderSeparateQuestionText = Boolean(questionText && questionText.trim().length > 0 && !htmlHasQuestion);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex ${isFullImageQuestion ? 'flex-col justify-between' : 'items-center justify-center'} overflow-hidden min-h-0 relative select-none`}
    >
      <div
        ref={measureRef}
        style={{
          transform: isFullImageQuestion ? 'none' : `scale(${scale})`,
          transformOrigin: 'center center',
          opacity: isReady ? 1 : 0.95,
        }}
        className={`w-full max-w-full ${isFullImageQuestion ? 'h-full flex flex-col justify-between' : 'flex flex-col items-center justify-center'} text-center ${className}`}
      >
        {questionHTML ? (
          <div className="flex flex-col items-center justify-center w-full">
            <div
              dangerouslySetInnerHTML={{ __html: questionHTML }}
              className={`question-visual-box multi-player-${mode} w-full ${isFullImageQuestion ? 'h-full flex flex-col justify-between' : 'flex flex-col items-center justify-center'} font-black tracking-wide leading-snug ${
                notebookTheme
                  ? 'text-slate-900 drop-shadow-xs'
                  : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] [text-shadow:0_2px_4px_#000] text-white'
              } ${fontClass}`}
            />
            {shouldRenderSeparateQuestionText && (
              <div className={`mt-1.5 text-sm xs:text-base sm:text-lg md:text-xl font-black text-center leading-snug px-2 ${
                notebookTheme
                  ? 'text-blue-950 drop-shadow-xs'
                  : 'text-amber-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
              }`}>
                {questionText}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`my-auto font-black tracking-wide leading-snug px-2 py-1 max-w-full text-center ${
              notebookTheme
                ? 'text-slate-900 drop-shadow-xs'
                : 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_6px_#000,_0_4px_14px_rgba(0,0,0,0.9)]'
            } ${fontClass}`}
          >
            {questionText}
          </div>
        )}
      </div>
    </div>
  );
};
export default AutoFitQuestionBox;
