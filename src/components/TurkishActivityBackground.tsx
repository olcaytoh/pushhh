import React from 'react';

export interface TurkishActivityBackgroundProps {
  className?: string;
  darkness?: 'light' | 'normal' | 'deep';
  blur?: 'none' | 'subtle' | 'medium';
  showFloatingAlphabet?: boolean;
}

/**
 * Türkçe etkinlikleri için otantik "Çizgili Defter Sayfası" arka plan bileşeni.
 * İlkokul çizgili Türkçe defteri dokusu, yatay mavi kılavuz çizgileri,
 * sol taraftaki kırmızı kenar çizgisi (margin), spiralli defter delikleri ve
 * nostaljik sevimli okul defteri detaylarıyla donatılmıştır.
 */
export const TurkishActivityBackground: React.FC<TurkishActivityBackgroundProps> = ({
  className = '',
  showFloatingAlphabet = true,
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#091122] ${className}`}>
      {/* 1. MASA VE ÇEVRESEL KOYU AHŞAP/LACİVERT ÇERÇEVE DERİNLİĞİ */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060b17] via-[#091326] to-[#040813]" />

      {/* 2. ANA ÇİZGİLİ DEFTER SAYFASI KATMANI (Büyük açık okul defteri sayfası) */}
      <div 
        className="absolute inset-1 sm:inset-2 md:inset-3 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(255,255,255,0.4)] overflow-hidden"
        style={{
          backgroundColor: '#fbf9f2',
          backgroundImage: `
            /* Kırmızı dikey kenar kılavuz çizgisi (Türkçe defteri kırmızı marjini) */
            linear-gradient(to right, transparent 52px, rgba(239, 68, 68, 0.85) 52px, rgba(239, 68, 68, 0.85) 55px, transparent 55px),
            /* Yatay açık mavi çizgili defter satırları (32px aralıklı Türkçe ilkokul defteri satırları) */
            repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(96, 165, 250, 0.8) 30px, rgba(96, 165, 250, 0.8) 32px),
            /* Doğal kağıt dokusu */
            linear-gradient(135deg, #fdfcf7 0%, #f7f3e8 50%, #f4eee0 100%)
          `,
        }}
      >
        {/* 2a. SPİRALLİ DEFTER DELİKLERİ & HALKALARI (Sol kenar boyunca delikli defter görünümü) */}
        <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-8 flex flex-col justify-around py-4 pointer-events-none z-10 opacity-75">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0a1222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-slate-400/40" />
              <div className="w-2 h-1 bg-gradient-to-r from-slate-400 to-slate-200 rounded-sm shadow-xs -ml-1 transform -rotate-12" />
            </div>
          ))}
        </div>

        {/* 2b. DEFTER ÜST BAŞLIK ALANI (Tarih ve Sayfa No Kılavuzu) */}
        <div className="absolute top-2 right-4 sm:right-8 flex items-center gap-4 text-[10px] sm:text-xs font-bold text-slate-600/90 uppercase tracking-widest pointer-events-none z-10">
          <span className="flex items-center gap-1 border-b-2 border-slate-300 pb-0.5">
            📅 TARİH: ...... / ...... / 202...
          </span>
          <span className="flex items-center gap-1 border-b-2 border-slate-300 pb-0.5">
            ✏️ TÜRKÇE DEFTERİ
          </span>
        </div>

        {/* 2c. DEFTER SAYFASI YUMUŞAK KAĞIT DOKUSU VE VİNYET */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.08)_100%)] pointer-events-none" />

        {/* 2d. HAFİF ARKA PLAN DERİNLİĞİ (Kartların ve renkli butonların okunabilirliğini artırır) */}
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
      </div>

      {/* 3. MERKEZİ ODAK IŞIĞI (Etkinlik kartlarının altındaki alana ekstra parlaklık ve okunabilirlik sağlar) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_75%)] pointer-events-none" />

      {/* 4. SEVİMLİ OKUL DEFTERİ DETAYLARI & TÜRKÇE ALFABE MOTİFLERİ (Köşelerde hafif çizimler) */}
      {showFloatingAlphabet && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 sm:opacity-35 select-none z-10">
          {/* Sol Üst köşe - Renkli alfabe & yıldız */}
          <div className="absolute top-5 left-16 flex items-center gap-2 transform -rotate-6 animate-pulse" style={{ animationDuration: '6s' }}>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">A</span>
            <span className="text-xl sm:text-2xl font-bold text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">b</span>
            <span className="text-sm">✏️</span>
          </div>

          {/* Sağ Üst köşe - Kitap ve Türkçe harf */}
          <div className="absolute top-6 right-12 flex items-center gap-2 transform rotate-6 animate-pulse" style={{ animationDuration: '7s' }}>
            <span className="text-2xl">📖</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">C</span>
            <span className="text-lg text-yellow-300 font-bold">ç</span>
          </div>

          {/* Sol Alt köşe - Kalem ve hece notu */}
          <div className="absolute bottom-10 left-16 flex items-center gap-2 transform rotate-6 animate-pulse" style={{ animationDuration: '8s' }}>
            <span className="text-xl">📐</span>
            <span className="text-2xl sm:text-3xl font-black text-rose-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">D</span>
            <span className="text-lg text-amber-200 font-bold">e</span>
          </div>

          {/* Sağ Alt köşe - Yıldız ve Türkçe karakterler */}
          <div className="absolute bottom-10 right-12 flex items-center gap-2 transform -rotate-6 animate-pulse" style={{ animationDuration: '5s' }}>
            <span className="text-lg">⭐</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">ğ</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Ş</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurkishActivityBackground;
