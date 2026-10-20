import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';

interface LessonVideoPlayerProps {
  title: string;
  videoSrc: string;
  soundEnabled?: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
}

/**
 * Konu anlatım videosu etkinliği.
 * Diğer Türkçe etkinlikleriyle aynı tasarım: koyu zemin, amber çerçeve, üstte başlık şeridi,
 * geri / ileri etkinlik düğmeleri, ana sayfa ve kapat düğmeleri.
 */
export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  title,
  videoSrc,
  soundEnabled = true,
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Oyun/menü müziği vb. sesler video ile çakışmasın: video açılırken oynatmayı başlat
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = !soundEnabled;
    v.play().catch(() => {
      /* tarayıcı otomatik oynatmayı engellediyse kullanıcı oynat düğmesine basar */
    });
    return () => {
      v.pause();
    };
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  const btn =
    'w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer';

  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--app-header-height,60px)] z-[200] flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-[#0B132B] via-blue-950 to-slate-950">
      {/* Üst şerit */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 py-1 sm:py-1.5 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button type="button" className={btn} onClick={() => { playMp3?.('/click.mp3'); onPrevActivity(); }} title="Önceki etkinlik">
              <ChevronLeft size={18} />
            </button>
          )}
          {onNextActivity && (
            <button type="button" className={btn} onClick={() => { playMp3?.('/click.mp3'); onNextActivity(); }} title="Sonraki etkinlik">
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-sm">
          <span>✨</span>
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onGoHome && (
            <button type="button" className={btn} onClick={onGoHome} title="Ana sayfa">
              <Home size={17} />
            </button>
          )}
          <button type="button" className={btn} onClick={onClose} title="Kapat">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Video alanı: ekranı dolduran 16:9 çerçeve */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4">
        <div className="relative max-w-full max-h-full aspect-video w-full sm:w-auto sm:h-full rounded-2xl sm:rounded-3xl bg-[#080e1d]/90 border-2 sm:border-4 border-amber-300/90 shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(255,255,255,0.2)] overflow-hidden">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            aria-label={title}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />
        </div>
      </div>
    </div>
  );
};

export default LessonVideoPlayer;