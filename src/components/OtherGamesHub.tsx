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
  onOpenOnuBul?: () => void;
  onOpenYirmiyiBul?: () => void;
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
  onOpenAbluka?: () => void;
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
  onOpenOnuBul,
  onOpenYirmiyiBul,
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
  onOpenAbluka,
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
      title: 'Sözlük Sıralama',
      subtitle: 'Harf Sıralama Yarışı',
      icon: '/MENUIKON/grid_icon_25.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenSozlukSirala) onOpenSozlukSirala();
      },
    },
    {
      id: 'kelime_sirala',
      title: 'Kelime Sıralama',
      subtitle: 'Sözlük Sırasına Dizme',
      icon: '/MENUIKON/grid_icon_26.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenKelimeSirala) onOpenKelimeSirala();
      },
    },
    {
      id: 'hece_makasi',
      title: 'Hece Makası',
      subtitle: 'Hecelere Ayırma Oyunu',
      icon: '/MENUIKON/grid_icon_35.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenHeceMakasi) onOpenHeceMakasi();
      },
    },
    {
      id: 'yazim_dedektifi',
      title: 'Yazım Yanlışı Dedektifi',
      subtitle: 'Hatalı Sözcük Avı',
      icon: '/MENUIKON/grid_icon_21.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenYazimDedektifi) onOpenYazimDedektifi();
      },
    },
    {
      id: 'aynisini_bul',
      title: 'Aynısını Bul',
      subtitle: '2 Kişilik Dikkat Yarışı',
      icon: '/MENUIKON/grid_icon_20.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenAynisiniBul) onOpenAynisiniBul();
      },
    },
    {
      id: 'onu_bul',
      title: "10'u Bul",
      subtitle: 'Toplamı 10 Yapan Çiftler',
      icon: '/MENUIKON/grid_icon_18.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenOnuBul) onOpenOnuBul();
      },
    },
    {
      id: 'yirmiyi_bul',
      title: "20'yi Bul",
      subtitle: 'Toplamı 20 Yapan Çiftler',
      icon: '/MENUIKON/grid_icon_19.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenYirmiyiBul) onOpenYirmiyiBul();
      },
    },
    {
      id: 'xox',
      title: 'XOX & Zeka Düellosu',
      subtitle: 'Zeka & Strateji Düellosu',
      icon: '/MENUIKON/grid_icon_32.png',
      sound: '/coin.mp3',
      action: onOpenXOX,
    },
    {
      id: 'zit_anlam',
      title: 'Zıt Anlamlı Kelimeler',
      subtitle: 'Karşıt Kelime Kapışması',
      icon: '/MENUIKON/grid_icon_27.png',
      sound: '/farklilvl.mp3',
      action: onOpenZitAnlam,
    },
    {
      id: 'es_anlam',
      title: 'Eş Anlamlı Kelimeler',
      subtitle: 'Anlamdaş Kelime Kapışması',
      icon: '/MENUIKON/grid_icon_21.png',
      sound: '/para.mp3',
      action: onOpenEsAnlam,
    },
    {
      id: 'lab3d',
      title: '3D Geometri Laboratuvarı',
      subtitle: '3 Boyutlu Cisim Keşfi',
      icon: '/MENUIKON/grid_icon_39.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpen3DLab) onOpen3DLab();
      },
    },
    {
      id: 'geoboard',
      title: 'Geometri Tahtası',
      subtitle: 'Noktalı Tahta Çizimi',
      icon: '/MENUIKON/grid_icon_29.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeoboard) onOpenGeoboard();
      },
    },
    {
      id: 'cisimler_acilimi',
      title: 'Geometrik Cisimler Açılımı',
      subtitle: '3D Yüzey Açınımı',
      icon: '/MENUIKON/grid_icon_10.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenGeometricNets) onOpenGeometricNets();
      },
    },
    {
      id: 'kuralli_cumle',
      title: 'Kurallı Cümle Oluştur',
      subtitle: 'Kurallı Cümle Kurma',
      icon: '/MENUIKON/grid_icon_28.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenKuralliCumle) onOpenKuralliCumle();
      },
    },
    {
      id: 'geometrik_sekilleri_bul',
      title: 'Geometrik Cisimleri Bul',
      subtitle: 'Hızlı Cisim & Eşya Avı',
      icon: '/MENUIKON/grid_icon_39.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeometrikSekilleriBul) onOpenGeometrikSekilleriBul();
      },
    },
    {
      id: 'dedektif_5n1k',
      title: '5N 1K Dedektifi',
      subtitle: '5N 1K İpucu Çözme',
      icon: '/MENUIKON/grid_icon_33.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenDedektif5N1K) onOpenDedektif5N1K();
      },
    },
    {
      id: 'noktalama_avcisi',
      title: 'Noktalama İşareti Avcısı',
      subtitle: 'Cümle İçi İşaret Avı',
      icon: '/MENUIKON/grid_icon_25.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenNoktalamaAvcisi) onOpenNoktalamaAvcisi();
      },
    },
    {
      id: 'harf_corbasi',
      title: 'Harf Çorbası / Anagram',
      subtitle: 'Gizli Kelimeyi Bul',
      icon: '/MENUIKON/grid_icon_26.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenHarfCorbasi) onOpenHarfCorbasi();
      },
    },
    {
      id: 'geri_donusum',
      title: 'Geri Dönüşüm Kahramanı',
      subtitle: 'Geri Dönüşüm Bilinci',
      icon: '/MENUIKON/grid_icon_05.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenGeriDonusum) onOpenGeriDonusum();
      },
    },
    {
      id: 'saglikli_tabak',
      title: 'Sağlıklı Tabak Şefi',
      subtitle: 'Dengeli Beslenme Şefi',
      icon: '/MENUIKON/grid_icon_27.png',
      sound: '/para.mp3',
      action: () => {
        if (onOpenSaglikliTabak) onOpenSaglikliTabak();
      },
    },
    {
      id: 'istek_ihtiyac',
      title: 'İstek mi, İhtiyaç mı?',
      subtitle: 'İstek ve İhtiyaç Ayrımı',
      icon: '/MENUIKON/grid_icon_20.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenIstekIhtiyac) onOpenIstekIhtiyac();
      },
    },
    {
      id: 'mevsim_gardirobu',
      title: 'Mevsim Gardırobu',
      subtitle: 'Hava & Mevsim Kıyafeti',
      icon: '/MENUIKON/grid_icon_28.png',
      sound: '/farklilvl.mp3',
      action: () => {
        if (onOpenMevsimGardirobu) onOpenMevsimGardirobu();
      },
    },
    {
      id: 'abluka',
      title: 'Abluka Zeka Oyunu',
      subtitle: '7x7 Taktik & Kıstırma',
      icon: '/MENUIKON/grid_icon_30.png',
      sound: '/coin.mp3',
      action: () => {
        if (onOpenAbluka) onOpenAbluka();
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

      {/* 2. GAMES CONTAINER */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 w-full">
          {games.map((game, index) => {
            return (
              <button
                key={game.id}
                onClick={() => {
                  triggerSound(game.sound);
                  game.action();
                }}
                className={`group relative w-full bg-gradient-to-r from-[#2c0f24] via-[#411635] to-[#2c0f24] hover:from-[#3a1430] hover:via-[#541c45] hover:to-[#3a1430] border-2 border-pink-500/70 border-l-4 border-l-pink-400 hover:border-pink-400 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 pr-3 sm:pr-3.5 h-[74px] sm:h-[82px] md:h-[90px] min-h-[74px] sm:min-h-[82px] md:min-h-[90px] max-h-[74px] sm:max-h-[82px] md:max-h-[90px] flex items-center gap-2.5 sm:gap-3.5 shadow-[0_0_16px_rgba(244,114,182,0.22)] hover:shadow-[0_0_22px_rgba(244,114,182,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer overflow-hidden text-left ${
                  index === games.length - 1 && games.length % 2 === 1 ? 'sm:col-span-2 sm:max-w-xl sm:mx-auto' : ''
                }`}
              >
                {/* Left 3D Icon - Enlarged 100%, pure 3D borderless icon with rich depth shadow */}
                <div className="relative shrink-0 z-10 flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 md:w-17 md:h-17 -my-1">
                  <img
                    src={game.icon}
                    alt={game.title}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] group-hover:scale-115 group-hover:-rotate-3 transition-transform select-none pointer-events-none"
                  />
                </div>

                {/* Center Text Body - Exactly same as classroom topic buttons */}
                <div className="flex-1 text-left min-w-0 py-0.5 z-10">
                  <h4 className="font-black text-xs sm:text-sm md:text-base text-slate-100 group-hover:text-white transition-colors leading-snug drop-shadow-xs uppercase tracking-wide truncate">
                    {game.title}
                  </h4>
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/35 border border-pink-400/30 text-pink-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs truncate max-w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block shrink-0" />
                      <span className="truncate">{game.subtitle}</span>
                    </span>
                  </div>
                </div>

                {/* Right Action: Clean BAŞLA Action badge - Exactly same as classroom topic buttons */}
                <div className="z-10 shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/25 group-hover:bg-black/40 border border-white/15 shadow-inner group-hover:scale-105 group-hover:translate-x-0.5 transition-all">
                  <span className="font-black text-[10px] sm:text-xs text-pink-300 tracking-wider uppercase drop-shadow">
                    BAŞLA
                  </span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-pink-400 text-slate-950 flex items-center justify-center font-black text-[10px] sm:text-xs shadow group-hover:rotate-6 transition-transform">
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
