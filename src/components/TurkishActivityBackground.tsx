import React from 'react';

export interface TurkishActivityBackgroundProps {
  className?: string;
  darkness?: 'light' | 'normal' | 'deep';
  blur?: 'none' | 'subtle' | 'medium';
  showFloatingAlphabet?: boolean;
}

/**
 * Türkçe etkinlikleri için özel görsel arka plan bileşeni.
 * Dikkat çekici, sıcak ve zengin bir Türkçe öğrenme atmosferi sunarken;
 * özenle kalibre edilmiş yarı saydam katmanları ve radyal odak ışığı sayesinde
 * ön plandaki kelime kutucuklarını, vagonları ve metinleri asla gölgelemez veya gözü yormaz.
 */
export const TurkishActivityBackground: React.FC<TurkishActivityBackgroundProps> = ({
  className = '',
  darkness = 'normal',
  blur = 'subtle',
  showFloatingAlphabet = true,
}) => {
  // Karartma seviyeleri (etkinliğin okunabilirliğini koruyan tonlar)
  const darknessOverlay = {
    light: 'from-[#060c1d]/65 via-[#09132b]/40 to-[#050a18]/70',
    normal: 'from-[#060c1d]/75 via-[#09132b]/50 to-[#050a18]/80',
    deep: 'from-[#060c1d]/85 via-[#09132b]/65 to-[#050a18]/90',
  }[darkness];

  // Yumuşak odak bulanıklığı (yazıların arka plandan net ayrışması için)
  const blurClass = {
    none: 'blur-none',
    subtle: 'blur-[0.6px]',
    medium: 'blur-[1.5px]',
  }[blur];

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      {/* 1. TÜRKÇE TEMALI ANA GÖRSEL ARKA PLAN */}
      <img
        src="/tryarka.webp"
        alt="Türkçe Etkinlik Arka Planı"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover object-center scale-105 transition-all duration-500 ${blurClass}`}
      />

      {/* 2. DİNAMİK VİNYET VE MERKEZİ ODAK AYDINLATMASI (Ortadaki etkinlik alanını aydınlık tutar, kenarları yumuşakça çerçeveler) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,8,20,0.75)_100%)] pointer-events-none" />

      {/* 3. RENK VE KONTRAST KORUYUCU GEÇİŞLİ KATMAN */}
      <div className={`absolute inset-0 bg-gradient-to-b ${darknessOverlay} pointer-events-none`} />

      {/* 4. SICAK ALTIN & KEHRİBAR HAFİF IŞILTI KATMANI (Türkçe kitap & alfabe büyüsü atmosferi) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/10 via-transparent to-sky-600/10 mix-blend-screen pointer-events-none" />

      {/* 5. DİKKAT ÇEKİCİ AMA RAHATSIZ ETMEYEN İNCE FLOATING TÜRKÇE ALFABE VE KİTAP DETAYLARI (Köşelerde çok düşük opaklıkta) */}
      {showFloatingAlphabet && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 sm:opacity-25 select-none">
          {/* Sol Üst köşe - Sevimli harf & kitap motifi */}
          <div className="absolute top-6 left-6 flex items-center gap-2 transform -rotate-12 animate-pulse" style={{ animationDuration: '6s' }}>
            <span className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">A</span>
            <span className="text-xl sm:text-2xl font-bold text-sky-300 drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]">b</span>
            <span className="text-base text-amber-200">✨</span>
          </div>

          {/* Sağ Üst köşe - Okuma ve yıldız motifi */}
          <div className="absolute top-8 right-10 flex items-center gap-1.5 transform rotate-6 animate-pulse" style={{ animationDuration: '7s' }}>
            <span className="text-2xl sm:text-3xl">📖</span>
            <span className="text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]">C</span>
            <span className="text-lg text-emerald-300 font-bold">ç</span>
          </div>

          {/* Sol Alt köşe - Kalem & hece motifi */}
          <div className="absolute bottom-12 left-8 flex items-center gap-2 transform rotate-12 animate-pulse" style={{ animationDuration: '8s' }}>
            <span className="text-2xl sm:text-3xl">✏️</span>
            <span className="text-2xl sm:text-3xl font-black text-orange-300 drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)]">D</span>
            <span className="text-xl text-amber-200 font-bold">e</span>
          </div>

          {/* Sağ Alt köşe - Yıldız & Türkçe harf motifi */}
          <div className="absolute bottom-10 right-8 flex items-center gap-2 transform -rotate-6 animate-pulse" style={{ animationDuration: '5s' }}>
            <span className="text-xl text-yellow-200">⭐</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.5)]">ğ</span>
            <span className="text-2xl sm:text-3xl font-black text-rose-300 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]">Ş</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurkishActivityBackground;
