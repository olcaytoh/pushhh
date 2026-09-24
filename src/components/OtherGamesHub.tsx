import React from 'react';
import { Sparkles, ArrowLeft, Swords, BookOpen, Brain, Play, Star, Flame, Trophy, Home } from 'lucide-react';
import { getIconAccentColor } from '../App';

interface OtherGamesHubProps {
  onClose: () => void;
  onGoHome?: () => void;
  onOpenXOX: () => void;
  onOpenZitAnlam: () => void;
  onOpenEsAnlam: () => void;
  onOpen3DLab?: () => void;
  onOpenGeoboard?: () => void;
  onOpenAynisiniBul?: () => void;
  onOpenGeometricNets?: () => void;
  onOpenKuralliCumle?: () => void;
  onOpenSozlukSirala?: () => void;
  onOpenKelimeSirala?: () => void;
  onOpenHeceMakasi?: () => void;
  onOpenYazimDedektifi?: () => void;
  onOpenGeometrikSekilleriBul?: () => void;
  onOpenDedektif5N1K?: () => void;
  onOpenNoktalamaAvcisi?: () => void;
  onOpenHarfCorbasi?: () => void;
  onOpenGeriDonusum?: () => void;
  onOpenSaglikliTabak?: () => void;
  onOpenIstekIhtiyac?: () => void;
  onOpenMevsimGardirobu?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
}

export const OtherGamesHub: React.FC<OtherGamesHubProps> = ({
  onClose,
  onGoHome,
  onOpenXOX,
  onOpenZitAnlam,
  onOpenEsAnlam,
  onOpen3DLab,
  onOpenGeoboard,
  onOpenAynisiniBul,
  onOpenGeometricNets,
  onOpenKuralliCumle,
  onOpenSozlukSirala,
  onOpenKelimeSirala,
  onOpenHeceMakasi,
  onOpenYazimDedektifi,
  onOpenGeometrikSekilleriBul,
  onOpenDedektif5N1K,
  onOpenNoktalamaAvcisi,
  onOpenHarfCorbasi,
  onOpenGeriDonusum,
  onOpenSaglikliTabak,
  onOpenIstekIhtiyac,
  onOpenMevsimGardirobu,
  playMp3
}) => {
  const triggerSound = (src: string) => {
    if (playMp3) {
      playMp3(src);
    }
  };

  const games = [
    {
      id: 'sozluk_sirala',
      title: 'Sözlük Sıralama (Alfabe Portalı)',
      subtitle: '1, 2 ve 3 Kişilik Alfabetik Harf Sıralama Yarışı (1-2. Sınıf: 3 Harf, 3-4. Sınıf: 4 Harf)',
      icon: '/MENUIKON/grid_icon_25.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenSozlukSirala) onOpenSozlukSirala();
      },
    },
    {
      id: 'kelime_sirala',
      title: 'Kelime Sıralama (Sözlük Sırası)',
      subtitle: '1, 2 ve 3 Kişilik Sözlük Sırasına Göre Kelime Dizme (1-2. Sınıf: 3 Kelime, 3-4. Sınıf: 4 Kelime)',
      icon: '/MENUIKON/grid_icon_26.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenKelimeSirala) onOpenKelimeSirala();
      },
    },
    {
      id: 'hece_makasi',
      title: 'Hece Makası (Hecelere Ayırma)',
      subtitle: '1, 2 ve 3 Kişilik Sözcükleri Doğru Yerden Keserek Hecelerine Ayırma Oyunu',
      icon: '/MENUIKON/grid_icon_35.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenHeceMakasi) onOpenHeceMakasi();
      },
    },
    {
      id: 'yazim_dedektifi',
      title: 'Yazım Yanlışı Dedektifi',
      subtitle: '1, 2 ve 3 Kişilik Hatalı Sözcüğü Bulup Doğru Yazılışını Çözme Oyunu',
      icon: '/MENUIKON/grid_icon_21.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenYazimDedektifi) onOpenYazimDedektifi();
      },
    },
    {
      id: 'aynisini_bul',
      title: 'Aynısını Bul (2 Kişilik)',
      subtitle: 'Ortak Nesneyi İlk Sen Bul! (7 Doğru Kazanır, 3 Hata Elenir)',
      icon: '/MENUIKON/grid_icon_20.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenAynisiniBul) onOpenAynisiniBul();
      },
    },
    {
      id: 'xox',
      title: 'XOX & Zeka Düellosu',
      subtitle: 'Tic-Tac-Toe & Bot/Arkadaş Meydan Okuması',
      icon: '/MENUIKON/grid_icon_32.png',
      sound: '/coin.mp3',
      action: onOpenXOX,
    },
    {
      id: 'zit_anlam',
      title: 'Zıt Anlamlı Kelimeler',
      subtitle: '1, 2 ve 3 Kişilik Yarış & Hafıza Kartları',
      icon: '/MENUIKON/grid_icon_27.png',
      sound: '/farklilvl.mp3',
      action: onOpenZitAnlam,
    },
    {
      id: 'es_anlam',
      title: 'Eş Anlamlı Kelimeler',
      subtitle: '1, 2 ve 3 Kişilik Anlamdaş Kelime Kapışması',
      icon: '/MENUIKON/grid_icon_21.png',
      sound: '/para.mp3',
      action: onOpenEsAnlam,
    },
    {
      id: 'lab3d',
      title: '3D Geometri & Şekil Laboratuvarı',
      subtitle: '3 Boyutlu Cisimler, Döndürme & Yüzey Keşfi',
      icon: '/MENUIKON/grid_icon_39.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpen3DLab) onOpen3DLab();
      },
    },
    {
      id: 'geoboard',
      title: 'Geometri Tahtası',
      subtitle: 'Noktalı Tahta & Parmakla Şekil Çizimi',
      icon: '/MENUIKON/grid_icon_29.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeoboard) onOpenGeoboard();
      },
    },
    {
      id: 'cisimler_acilimi',
      title: 'Geometrik Cisimler Açılımı',
      subtitle: '3D Katlama & Yüzey Açınım Simülasyonu',
      icon: '/MENUIKON/grid_icon_10.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenGeometricNets) onOpenGeometricNets();
      },
    },
    {
      id: 'kuralli_cumle',
      title: 'Kurallı Cümle Oluştur',
      subtitle: 'Kelimeleri Sürükle, Anlamlı ve Kurallı Cümleleri Kur!',
      icon: '/MENUIKON/grid_icon_28.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenKuralliCumle) onOpenKuralliCumle();
      },
    },
    {
      id: 'geometrik_sekilleri_bul',
      title: 'Geometrik Cisimleri Bul',
      subtitle: 'Günlük Hayat Eşyaları, 20 Sn Sprint & 2-3 Kişilik Kapışma',
      icon: '/MENUIKON/grid_icon_39.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeometrikSekilleriBul) onOpenGeometrikSekilleriBul();
      },
    },
    {
      id: 'dedektif_5n1k',
      title: '5N 1K Dedektifi',
      subtitle: 'Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin Sorularını Çöz!',
      icon: '/MENUIKON/grid_icon_33.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenDedektif5N1K) onOpenDedektif5N1K();
      },
    },
    {
      id: 'noktalama_avcisi',
      title: 'Noktalama İşareti Avcısı',
      subtitle: 'Nokta, Virgül, Soru ve Ünlem İşaretlerini Cümlelerde Yakala!',
      icon: '/MENUIKON/grid_icon_25.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenNoktalamaAvcisi) onOpenNoktalamaAvcisi();
      },
    },
    {
      id: 'harf_corbasi',
      title: 'Harf Çorbası / Anagram',
      subtitle: 'Karışık Harfleri Çöz, Gizli Kelimeleri Tabağa Diz!',
      icon: '/MENUIKON/grid_icon_26.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenHarfCorbasi) onOpenHarfCorbasi();
      },
    },
    {
      id: 'geri_donusum',
      title: 'Geri Dönüşüm Kahramanı (Doğada Hayat)',
      subtitle: 'Atıkları Doğru Geri Dönüşüm Kutularına Ayır, Doğayı Koru!',
      icon: '/MENUIKON/grid_icon_05.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeriDonusum) onOpenGeriDonusum();
      },
    },
    {
      id: 'saglikli_tabak',
      title: 'Sağlıklı Tabak Şefi',
      subtitle: 'Faydalı Besinleri Seç, Sağlıklı ve Dengeli Tabağını Hazırla!',
      icon: '/MENUIKON/grid_icon_27.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenSaglikliTabak) onOpenSaglikliTabak();
      },
    },
    {
      id: 'istek_ihtiyac',
      title: 'İstek mi, İhtiyaç mı?',
      subtitle: 'Zorunlu İhtiyaçlar ile Keyifli İstekleri Ayırt Et, Tutumlu Ol!',
      icon: '/MENUIKON/grid_icon_20.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenIstekIhtiyac) onOpenIstekIhtiyac();
      },
    },
    {
      id: 'mevsim_gardirobu',
      title: 'Mevsim Gardırobu',
      subtitle: 'Mevsimine ve Hava Durumuna Göre Doğru Kıyafetleri Seç!',
      icon: '/MENUIKON/grid_icon_28.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenMevsimGardirobu) onOpenMevsimGardirobu();
      },
    }
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white">
      {/* 1. SAME BACKGROUND IMAGE AS OTHER CLASSROOM ACTIVITIES (/dere3.jpg) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />
      </div>

      {/* 2. SUB-HEADER BAR */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          {/* Nav/status spacer */}
        </div>

        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Ana Sayfaya Dön"
            >
              <Home size={13} />
              <span>Ana Sayfa</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kapat"
          >
            ✕ Kapat
          </button>
        </div>
      </header>

      {/* 3. GAMES CONTAINER */}
      <main className="relative z-10 flex-1 p-2 sm:p-4 max-w-4xl mx-auto w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-2 sm:gap-2.5 pt-3 sm:pt-4 md:pt-5">
        {/* GLOWING HEADER BADGE - 5. DİĞER OYUNLAR */}
        <div className="flex flex-col items-center justify-center mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 max-w-2xl w-full mx-auto shrink-0 py-0.5">
          <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-l-4 border-l-amber-400">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/icon_5.png" alt="5. Diğer Oyunlar" className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-sm shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                5. DİĞER OYUNLAR
              </span>
              <span className="text-amber-400/60 font-bold">•</span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-amber-300 tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                OYUNUNU SEÇ VE BAŞLA
              </span>
            </div>
            <span className="text-amber-400 text-sm sm:text-base animate-pulse">✨</span>
          </div>
        </div>

        <div className="w-full flex justify-center py-0.5 mb-1.5 sm:mb-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0d172e]/95 via-[#142344]/95 to-[#0d172e]/95 backdrop-blur-md border border-slate-700/90 shadow-[0_4px_16px_rgba(0,0,0,0.6)] border-b-2 border-b-amber-400/70">
            <span className="text-base sm:text-lg shrink-0">🎮</span>
            <p className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Oynamak istediğin oyuna dokun ve kapışmaya başla!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
          {games.map((game, index) => {
            const accent = getIconAccentColor(game.icon);
            return (
              <button
                key={game.id}
                onClick={() => {
                  triggerSound(game.sound);
                  game.action();
                }}
                className={`group relative w-full bg-gradient-to-r from-[#2c0f24] via-[#411635] to-[#2c0f24] hover:from-[#3a1430] hover:via-[#541c45] hover:to-[#3a1430] border-2 border-pink-500/70 border-l-4 border-l-pink-400 hover:border-pink-400 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 pr-3.5 min-h-[76px] sm:min-h-[86px] md:min-h-[96px] flex items-center gap-2.5 sm:gap-3.5 shadow-[0_0_16px_rgba(244,114,182,0.22)] hover:shadow-[0_0_22px_rgba(244,114,182,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer overflow-hidden text-left ${
                  index === games.length - 1 && games.length % 2 === 1 ? 'sm:col-span-2 sm:max-w-xl sm:mx-auto' : ''
                }`}
              >
                {/* Pure 3D borderless icon without box */}
                <div className="relative shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 -my-1">
                  <img
                    src={game.icon}
                    alt={game.title}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] group-hover:scale-115 group-hover:-rotate-3 transition-transform select-none pointer-events-none"
                  />
                </div>

                {/* Text Area - Full title, subtitle wraps cleanly */}
                <div className="flex-1 min-w-0 py-0.5 z-10">
                  <h4 className="font-black text-xs sm:text-sm md:text-base text-slate-100 group-hover:text-pink-300 transition-colors leading-snug uppercase tracking-wide break-words">
                    {game.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-pink-200/70 font-medium mt-0.5 flex items-center gap-1 leading-snug break-words">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block shrink-0" />
                    <span>{game.subtitle}</span>
                  </p>
                </div>

                {/* Modern BAŞLA Button */}
                <div className="z-10 shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black/25 group-hover:bg-black/40 border border-pink-400/30 shadow-inner group-hover:scale-105 group-hover:translate-x-1 transition-all">
                  <span className="font-black text-[10px] xs:text-xs sm:text-xs md:text-sm text-pink-300 tracking-wider uppercase drop-shadow">BAŞLA</span>
                  <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 rounded-lg bg-pink-400 text-slate-950 flex items-center justify-center font-black text-[10px] sm:text-xs shadow group-hover:rotate-6 transition-transform">
                    ▶
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
