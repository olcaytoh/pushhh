import React from 'react';
import { Sparkles } from 'lucide-react';

export interface ActivityHeaderBannerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * ActivityHeaderBanner
 * Tüm etkinliklerde oyuna girince üstteki butonların hemen altında ortada
 * belirgin bir punto ve şık altın çerçeve ile etkinlik adını görüntüler.
 */
export const ActivityHeaderBanner: React.FC<ActivityHeaderBannerProps> = ({
  title,
  subtitle,
  icon,
  className = ''
}) => {
  return (
    <div className={`w-full flex items-center justify-center py-1 sm:py-1.5 px-2 shrink-0 z-20 select-none ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] border-l-4 border-l-amber-400">
        <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
        {icon && (
          <span className="shrink-0 flex items-center justify-center text-sm sm:text-base">
            {icon}
          </span>
        )}
        <div className="flex items-center gap-2 text-center">
          <h2 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-wider drop-shadow-sm whitespace-nowrap">
            {title}
          </h2>
          {subtitle && (
            <>
              <span className="text-amber-400/60 font-bold hidden xs:inline">•</span>
              <span className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wide hidden xs:inline whitespace-nowrap">
                {subtitle}
              </span>
            </>
          )}
        </div>
        <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
      </div>
    </div>
  );
};
