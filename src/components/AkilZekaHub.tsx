import React from 'react';
import { Brain, Home, Globe, ArrowLeft } from 'lucide-react';
import { ActivityBackground } from './ActivityBackground';
import { useAppLanguage } from '../utils/appLanguage';
import iconDortluSira from '../assets/images/icon_dortlu_sira_1795634814162.jpg';
import iconTrafiktenCikis from '../assets/images/icon_trafikten_cikis_1795634815553.jpg';
import iconHafizaMelodisi from '../assets/images/icon_hafiza_melodisi_1795634816857.jpg';
import iconHanoiKulesi from '../assets/images/icon_hanoi_kulesi_1795634815180.jpg';

const PENTAGO_ICON = '/assets/aistudio/Ekran_Resmi_2026-11-25_22.43.00_9e54085f.png';

interface AkilZekaHubProps {
  onClose: () => void;
  onGoHome?: () => void;
  onOpenPentago: () => void;
  onOpenDortluSira: () => void;
  onOpenTrafiktenCikis: () => void;
  onOpenHafizaMelodisi: () => void;
  onOpenHanoiKulesi: () => void;
  onOpenKure: () => void;
  onOpenAbluka: () => void;
  onOpenFarkliOlaniBul: () => void;
  onOpenGorselliSudoku: () => void;
  onOpenSudoku: () => void;
  onOpenAynisiniBul: () => void;
  onOpenXOX: () => void;
  onOpenKodlamaMutfagi: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
}

export const AkilZekaHub: React.FC<AkilZekaHubProps> = ({
  onClose,
  onGoHome,
  onOpenPentago,
  onOpenDortluSira,
  onOpenTrafiktenCikis,
  onOpenHafizaMelodisi,
  onOpenHanoiKulesi,
  onOpenKure,
  onOpenAbluka,
  onOpenFarkliOlaniBul,
  onOpenGorselliSudoku,
  onOpenSudoku,
  onOpenAynisiniBul,
  onOpenXOX,
  onOpenKodlamaMutfagi,
  playMp3,
}) => {
  const { lang, setLang, effectiveLang } = useAppLanguage();
  const isEn = effectiveLang === 'en';

  const triggerSound = (src: string) => {
    if (playMp3) playMp3(src);
  };

  const games = [
    {
      id: 'pentago',
      title: 'Pentago',
      subtitle: '1 & 2 Kişilik · 5’li Sıra & Dönen Bloklar',
      icon: PENTAGO_ICON,
      isRoundedIcon: true,
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenPentago,
    },
    {
      id: 'dortlu_sira',
      title: 'Dörtlü Sıra',
      subtitle: '1 & 2 Kişilik · Akıllı Bot & Strateji',
      icon: iconDortluSira,
      isRoundedIcon: true,
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenDortluSira,
    },
    {
      id: 'trafikten_cikis',
      title: 'Trafikten Çıkış',
      subtitle: '12 Seviye · Mantık & Akıllı Otopark',
      icon: iconTrafiktenCikis,
      isRoundedIcon: true,
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenTrafiktenCikis,
    },
    {
      id: 'hafiza_melodisi',
      title: 'Hafıza Melodisi',
      subtitle: '1 & 2 Kişilik · Renk, Nota & Dikkat',
      icon: iconHafizaMelodisi,
      isRoundedIcon: true,
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenHafizaMelodisi,
    },
    {
      id: 'hanoi_kulesi',
      title: 'Hanoi Kulesi',
      subtitle: '3–6 Halka · Algoritmik Planlama',
      icon: iconHanoiKulesi,
      isRoundedIcon: true,
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenHanoiKulesi,
    },
    {
      id: 'kure',
      title: 'Küre Zeka Oyunu',
      subtitle: '1 & 2 Kişilik · 7x7 Strateji & Sıkıştırma',
      icon: '/MENUIKON/grid_icon_39.webp',
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenKure,
    },
    {
      id: 'abluka',
      title: 'Abluka Zeka Oyunu',
      subtitle: '7x7 Taktik & Kıstırma',
      icon: '/MENUIKON/grid_icon_30.webp',
      sound: '/coin.mp3',
      action: onOpenAbluka,
    },
    {
      id: 'farkli_olani_bul',
      title: 'Farklı Olanı Bul',
      subtitle: '6 Kategori · 120 Seviye · Tek Kişi & Düello',
      icon: '/assets/farkbl/faces_odd_18.webp',
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenFarkliOlaniBul,
    },
    {
      id: 'gorselli_sudoku',
      title: '2 Kişilik Görselli Sudoku',
      subtitle: '4x4 & 6x6 Yan Yana Şekilli Akıl Oyunu',
      icon: '/assets/sudoku/gorselli.png',
      sound: '/coin.mp3',
      action: onOpenGorselliSudoku,
    },
    {
      id: 'sudoku',
      title: 'Sudoku Zeka Oyunu',
      subtitle: '4x4 & 6x6 Sayısal Akıl Oyunu',
      icon: '/MENUIKON/grid_icon_19.webp',
      sound: '/coin.mp3',
      action: onOpenSudoku,
    },
    {
      id: 'kodlama_mutfagi',
      title: 'Kodlama & Algoritma Mutfağı',
      subtitle: 'Tarifi Sırala & Hata Ayıkla',
      icon: '/MENUIKON/grid_icon_27.webp',
      sound: '/coin.mp3',
      isNew: true,
      action: onOpenKodlamaMutfagi,
    },
    {
      id: 'aynisini_bul',
      title: 'Aynısını Bul',
      subtitle: '2 Kişilik Dikkat Yarışı',
      icon: '/MENUIKON/grid_icon_20.webp',
      sound: '/coin.mp3',
      action: onOpenAynisiniBul,
    },
    {
      id: 'xox',
      title: 'XOX & Zeka Düellosu',
      subtitle: 'Zeka & Strateji Düellosu',
      icon: '/MENUIKON/grid_icon_32.webp',
      sound: '/coin.mp3',
      action: onOpenXOX,
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white">
      <ActivityBackground theme="doga" />

      <main className="relative z-10 flex-1 p-2 sm:p-4 max-w-6xl mx-auto w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-2 sm:gap-2.5 pt-3 sm:pt-4 md:pt-5">
        {/* GLOWING HEADER BAR - 8. AKIL VE ZEKA OYUNLARI */}
        <div className="flex flex-col items-center justify-center mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 max-w-2xl w-full mx-auto shrink-0 py-0.5">
          <div className="w-full flex items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#1a1033] via-[#2b1754] to-[#1a1033] border-2 border-violet-400/90 shadow-[0_0_24px_rgba(167,139,250,0.35)] border-l-4 border-l-rose-400">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow shrink-0 border border-white/30">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                {isEn ? '8. Mind & Strategy Games' : '8. Akıl ve Zeka Oyunları'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerSound('/op.mp3');
                  setLang(lang === 'en' ? 'tr' : 'en');
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-black text-white transition cursor-pointer"
                title={isEn ? 'Switch to Turkish' : 'İngilizceye geç'}
              >
                <Globe size={13} />
                <span>{lang === 'en' ? 'TR' : 'EN'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSound('/op.mp3');
                  if (onGoHome) onGoHome();
                  else onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-300/60 text-xs font-black text-white shadow transition cursor-pointer"
                title={isEn ? 'Home' : 'Ana Sayfa'}
              >
                <Home size={14} />
                <span className="hidden sm:inline">{isEn ? 'Home' : 'Ana Sayfa'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSound('/op.mp3');
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title={isEn ? 'Close' : 'Kapat'}
              >
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* GAMES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 w-full pb-6">
          {games.map((game) => {
            const isNew = Boolean(game.isNew);
            return (
              <div
                key={game.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  triggerSound(game.sound);
                  game.action();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerSound(game.sound);
                    game.action();
                  }
                }}
                className={`group relative w-full ${
                  isNew
                    ? 'bg-gradient-to-r from-[#2c1222] via-[#411a34] to-[#241338] hover:from-[#3a172d] hover:via-[#532142] hover:to-[#2f184a] border-2 border-amber-400 border-l-4 border-l-amber-300 hover:border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.55)]'
                    : 'bg-gradient-to-r from-[#1a1333] via-[#281c4d] to-[#1a1333] hover:from-[#231945] hover:via-[#352666] hover:to-[#231945] border-2 border-violet-500/70 border-l-4 border-l-violet-400 hover:border-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.22)] hover:shadow-[0_0_22px_rgba(139,92,246,0.4)]'
                } rounded-xl px-2 sm:px-2.5 py-1.5 pr-2 sm:pr-2.5 h-[58px] sm:h-[62px] md:h-[66px] min-h-[58px] sm:min-h-[62px] md:min-h-[66px] max-h-[58px] sm:max-h-[62px] md:max-h-[66px] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer overflow-hidden text-left`}
              >
                {isNew && (
                  <div className="absolute top-0 right-0 z-30 flex items-center gap-1 px-2 py-0.5 rounded-bl-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-[0_2px_12px_rgba(239,68,68,0.7)] border-b-2 border-l-2 border-yellow-300 animate-pulse select-none pointer-events-none">
                    <span className="text-yellow-200">✨</span>
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">YENİ</span>
                  </div>
                )}

                <div className="relative shrink-0 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 -my-0.5">
                  <img
                    src={game.icon}
                    alt={game.title}
                    className={`w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] group-hover:scale-115 group-hover:-rotate-3 transition-transform select-none pointer-events-none ${
                      game.icon.startsWith('/assets/farkbl/')
                        ? 'object-contain rounded-xl bg-white p-0.5'
                        : game.isRoundedIcon
                          ? 'object-cover rounded-xl border border-white/35 bg-white'
                          : 'object-contain'
                    }`}
                  />
                </div>

                <div className="flex-1 text-left min-w-0 py-0.5 z-10">
                  <h4 className="font-black text-[11px] sm:text-xs md:text-[13px] text-slate-100 group-hover:text-white transition-colors leading-snug drop-shadow-xs uppercase tracking-wide truncate">
                    {game.title}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-1.5 py-px rounded bg-black/35 border ${
                        isNew ? 'border-amber-400/40 text-amber-300' : 'border-violet-400/35 text-violet-200'
                      } text-[9px] sm:text-[10px] font-bold uppercase tracking-wide shadow-xs truncate max-w-full`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-amber-400' : 'bg-violet-400'} inline-block shrink-0`}
                      />
                      <span className="truncate">{game.subtitle}</span>
                    </span>
                  </div>
                </div>

                <div className="z-10 shrink-0 flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-black/25 group-hover:bg-black/40 border border-white/15 shadow-inner group-hover:scale-105 group-hover:translate-x-0.5 transition-all">
                  <span
                    className={`font-black hidden xl:inline text-[10px] ${
                      isNew ? 'text-amber-300' : 'text-violet-300'
                    } tracking-wider uppercase drop-shadow`}
                  >
                    BAŞLA
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md ${
                      isNew ? 'bg-amber-400' : 'bg-violet-400'
                    } text-slate-950 flex items-center justify-center font-black text-[10px] shadow group-hover:rotate-6 transition-transform`}
                  >
                    ▶
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AkilZekaHub;
