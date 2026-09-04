import React, { useState } from 'react';
import { Sparkles, MessageCircle, Heart, Star, Shield, Volume2 } from 'lucide-react';

export type MascotType = 'aslan' | 'kurt';

interface MascotProps {
  type: MascotType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speech?: string;
  isAnimated?: boolean;
  onClick?: () => void;
  className?: string;
}

// Mascot - Maskot (Renders /msk.png directly)
export const AslanSVG: React.FC<{ sizePx?: number; className?: string }> = ({ sizePx = 120, className = '' }) => (
  <img
    src="/msk.png"
    alt="Maskot"
    style={{ width: `${sizePx}px`, height: 'auto', maxHeight: `${Math.round(sizePx * 1.3)}px` }}
    className={`object-contain transition-transform duration-300 hover:scale-105 inline-block shrink-0 ${className}`}
  />
);

// Detailed SVG Mascot - Kurdum (Smart Cyber Husky/Wolf with Hoodie & Glowing Circuits)
export const KurtSVG: React.FC<{ sizePx?: number; className?: string }> = ({ sizePx = 120, className = '' }) => (
  <svg
    width={sizePx}
    height={sizePx}
    viewBox="0 0 200 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg transition-transform duration-300 hover:scale-105 ${className}`}
  >
    {/* Fluffy Wolf Tail */}
    <path d="M145 160 C180 150 195 180 165 200 C150 205 140 185 145 160 Z" fill="#64748b" stroke="#334155" strokeWidth="3" />
    <path d="M175 168 L185 178 L170 188 Z" fill="#f8fafc" />

    {/* Wolf Ears */}
    <polygon points="40,75 25,25 70,50" fill="#64748b" stroke="#334155" strokeWidth="3" />
    <polygon points="42,68 32,35 62,52" fill="#f8fafc" />

    <polygon points="160,75 175,25 130,50" fill="#64748b" stroke="#334155" strokeWidth="3" />
    <polygon points="158,68 168,35 138,52" fill="#f8fafc" />

    {/* Wolf Head Base */}
    <ellipse cx="100" cy="95" rx="46" ry="40" fill="#94a3b8" stroke="#475569" strokeWidth="3" />

    {/* White Face Markings */}
    <path d="M60 95 C60 120 75 130 100 130 C125 130 140 120 140 95 C140 80 125 75 100 88 C75 75 60 80 60 95 Z" fill="#f8fafc" />

    {/* Rosy Cheeks */}
    <circle cx="68" cy="102" r="7" fill="#f43f5e" opacity="0.3" />
    <circle cx="132" cy="102" r="7" fill="#f43f5e" opacity="0.3" />

    {/* Eyes */}
    <ellipse cx="82" cy="86" rx="7.5" ry="10" fill="#0f172a" />
    <circle cx="80" cy="82" r="3" fill="#ffffff" />
    <circle cx="83" cy="88" r="1.5" fill="#38bdf8" />

    <ellipse cx="118" cy="86" rx="7.5" ry="10" fill="#0f172a" />
    <circle cx="116" cy="82" r="3" fill="#ffffff" />
    <circle cx="119" cy="88" r="1.5" fill="#38bdf8" />

    {/* Eyebrows */}
    <path d="M74 72 Q82 68 88 73" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
    <path d="M126 72 Q118 68 112 73" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

    {/* Nose */}
    <path d="M93 100 C93 96 107 96 107 100 C107 106 93 106 93 100 Z" fill="#1e293b" />

    {/* Cute Mouth */}
    <path d="M92 110 Q100 118 108 110" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Body / Blue Cyber Hoodie */}
    <path d="M58 130 C58 120 142 120 142 130 L150 188 C150 196 138 203 100 203 C62 203 50 196 50 188 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />

    {/* Cyber Circuit Lines on Hoodie */}
    <path d="M65 140 L80 150 L80 170" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
    <circle cx="80" cy="170" r="2.5" fill="#38bdf8" />

    <path d="M135 140 L120 150 L120 170" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
    <circle cx="120" cy="170" r="2.5" fill="#38bdf8" />

    {/* Tech Lightbulb Icon */}
    <circle cx="100" cy="148" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
    <path d="M100 144 L100 152" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M96 148 L104 148" stroke="#ffffff" strokeWidth="1.5" />

    {/* Text "BİLGİ" on Hoodie */}
    <text x="100" y="174" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
      BİLGİ
    </text>

    {/* Waving Paw */}
    <g className="animate-bounce" style={{ animationDuration: '2.2s' }}>
      <path d="M48 135 C32 125 22 105 30 92 C38 85 48 95 50 110 Z" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
      <circle cx="33" cy="98" r="4" fill="#f8fafc" />
      <circle cx="28" cy="92" r="1.5" fill="#f8fafc" />
      <circle cx="34" cy="90" r="1.5" fill="#f8fafc" />
      <circle cx="40" cy="93" r="1.5" fill="#f8fafc" />
    </g>

    {/* Right Paw Waving / Open */}
    <path d="M152 135 C168 125 178 105 170 92 C162 85 152 95 150 110 Z" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="167" cy="98" r="4" fill="#f8fafc" />
  </svg>
);

export const MascotAvatar: React.FC<{ type: MascotType; sizePx?: number; className?: string }> = ({
  type,
  sizePx = 100,
  className = ''
}) => {
  return type === 'aslan' ? <AslanSVG sizePx={sizePx} className={className} /> : <KurtSVG sizePx={sizePx} className={className} />;
};

export const MascotBanner: React.FC<{
  selectedMascot: MascotType;
  onSelectMascot: (type: MascotType) => void;
  greetingText?: string;
}> = ({ selectedMascot, onSelectMascot, greetingText }) => {
  const isAslan = selectedMascot === 'aslan';

  const defaultGreeting = isAslan
    ? "Merhaba minik matador! 🐱 Ben **Kedim**. Bugün matematik maceramızda seninle birlikteyim. Hadi 4 ana başlıktan birini seç ve başlayalım!"
    : "Selam harika zeka! 🐺 Ben **Kurdum**. Matematik bulmacalarını çözmeye hazır mısın? İstediğin konuyu seç, yanındayım!";

  const activeText = greetingText || defaultGreeting;

  return (
    <div className="w-full max-w-4xl bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-blue-600/20 dark:from-amber-950/40 dark:via-yellow-900/30 dark:to-blue-950/40 border-3 border-yellow-400 dark:border-yellow-500 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-6 relative overflow-hidden transition-all">
      {/* Background sparkle accents */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
        {/* MASCOT GRAPHIC */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative">
            <MascotAvatar type={selectedMascot} sizePx={120} className="sm:w-[130px] sm:h-auto" />
            <span className="absolute -bottom-1 right-0 bg-yellow-400 text-blue-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow border border-yellow-200 flex items-center gap-1">
              <Sparkles size={12} fill="currentColor" />
              <span>{isAslan ? 'Kedim' : 'Kurdum'}</span>
            </span>
          </div>
        </div>

        {/* SPEECH BUBBLE & SELECTION */}
        <div className="flex-1 text-center sm:text-left flex flex-col justify-between h-full">
          {/* Speech bubble */}
          <div className="bg-white/90 dark:bg-gray-900/95 border-2 border-yellow-400 dark:border-yellow-500/80 rounded-2xl p-3.5 sm:p-4 shadow-md text-gray-900 dark:text-gray-100 relative mb-3">
            <div className="hidden sm:block absolute -left-3 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-yellow-400 border-b-8 border-b-transparent" />
            <div className="sm:hidden absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-b-12 border-b-yellow-400 border-r-8 border-r-transparent" />
            <p className="text-sm sm:text-base font-extrabold leading-relaxed">
              {activeText.split('**').map((part, index) =>
                index % 2 === 1 ? (
                  <strong key={index} className="text-blue-600 dark:text-yellow-400 font-black">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          </div>

          {/* MASCOT SELECTOR TOGGLE */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-xs font-black text-blue-900 dark:text-yellow-300 uppercase tracking-wider mr-1">
              Rehber Maskotun:
            </span>

            <button
              onClick={() => onSelectMascot('aslan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all border-2 ${
                isAslan
                  ? 'bg-yellow-400 text-blue-950 border-yellow-500 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-yellow-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-base">🐱</span>
              <span>Kedim</span>
            </button>

            <button
              onClick={() => onSelectMascot('kurt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all border-2 ${
                !isAslan
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-base">🐺</span>
              <span>Kurdum</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
