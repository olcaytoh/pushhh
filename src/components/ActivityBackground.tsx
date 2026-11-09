import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';

export type ActivityBackgroundTheme = 'doga' | 'oyun' | 'akvaryum' | 'uzay' | 'sinif' | 'defter';

export interface ActivityBackgroundProps {
  theme?: ActivityBackgroundTheme;
  className?: string;
  showFloatingElements?: boolean;
  allowThemeSwitch?: boolean;
  opacity?: number;
  dimCenter?: boolean;
}

export const THEME_CONFIGS: Record<ActivityBackgroundTheme, {
  name: string;
  icon: string;
  desc: string;
}> = {
  doga: {
    name: 'Doğa & Macera',
    icon: '🌳',
    desc: 'Güneşli yeşil doğa manzarası ve sevimli hayvanlar',
  },
  oyun: {
    name: 'Oyun Dünyası',
    icon: '🧩',
    desc: 'Doğa manzarası üzerinde zeka oyunları ve maskotlar',
  },
  akvaryum: {
    name: 'Büyülü Akvaryum',
    icon: '🐠',
    desc: 'Derin berrak akvaryum ve yüzen renkli balıklar',
  },
  uzay: {
    name: 'Uzay Macerası',
    icon: '🚀',
    desc: 'Doğa manzarası üzerinde ışıltılı yıldızlar ve roket',
  },
  sinif: {
    name: 'Sevimli Sınıf',
    icon: '📚',
    desc: 'Doğa manzarası üzerinde renkli kırtasiye eşyaları',
  },
  defter: {
    name: 'Çizgili Defter',
    icon: '✏️',
    desc: 'Otantik Türkçe çizgili defteri ve renkli harfler',
  }
};

const STORAGE_KEY = 'student_activity_bg_theme';

export const ActivityBackground: React.FC<ActivityBackgroundProps> = ({
  theme = 'doga',
  className = '',
  showFloatingElements = true,
  allowThemeSwitch = false,
  dimCenter = true
}) => {
  // Varsayılan olarak ve kullanıcının isteğiyle 1. sınıftaki gibi her zaman "doga" (arka plandaki dere/doğa görselimiz)
  const [currentTheme, setCurrentTheme] = useState<ActivityBackgroundTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ActivityBackgroundTheme | null;
      // Eğer eski mor 'oyun' teması kayıtlıysa temizle ve 'doga' yap
      if (saved === 'oyun') {
        localStorage.setItem(STORAGE_KEY, 'doga');
        return 'doga';
      }
      if (saved && THEME_CONFIGS[saved]) return saved;
    } catch {
      // Fallback
    }
    return theme === 'oyun' ? 'doga' : theme;
  });

  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && THEME_CONFIGS[e.newValue as ActivityBackgroundTheme]) {
        const val = e.newValue === 'oyun' ? 'doga' : (e.newValue as ActivityBackgroundTheme);
        setCurrentTheme(val);
      }
    };
    const handleCustom = (e: Event) => {
      const custom = e as CustomEvent<ActivityBackgroundTheme>;
      if (custom.detail && THEME_CONFIGS[custom.detail]) {
        const val = custom.detail === 'oyun' ? 'doga' : custom.detail;
        setCurrentTheme(val);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('activity_bg_theme_changed', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('activity_bg_theme_changed', handleCustom);
    };
  }, []);

  const handleSelectTheme = (newTheme: ActivityBackgroundTheme) => {
    const safeTheme = newTheme === 'oyun' ? 'doga' : newTheme;
    setCurrentTheme(safeTheme);
    try {
      localStorage.setItem(STORAGE_KEY, safeTheme);
      window.dispatchEvent(new CustomEvent('activity_bg_theme_changed', { detail: safeTheme }));
    } catch {
      // Ignore
    }
    setShowThemePicker(false);
  };

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      
      {/* 1. TÜM ETKİNLİKLERDE 1. SINIFTAKİ GİBİ DAİMA GÖRÜNEN ARKA PLAN GÖRSELİMİZ (/dere3.webp) */}
      {currentTheme !== 'akvaryum' && currentTheme !== 'defter' && (
        <div className="absolute inset-0">
          {/* Manzara Görselimiz */}
          <img 
            src="/dere3.webp" 
            alt="Doğa Manzarası"
            className="w-full h-full object-cover object-center"
          />
          {/* Güneşli Sıcak Gökyüzü ve Yumuşak Işık (Asla mor veya düz koyu renk yok!) */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-transparent to-slate-950/35 pointer-events-none" />
          
          {/* 1. SINIFTAKİ SEVİMLİ DOĞA & HAYVAN MASKOTLARI (Güneş, Kelebek, Aslan, Zürafa) */}
          {showFloatingElements && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Sol Üst: Sevimli Parlayan Güneş */}
              <div className="absolute top-2 left-3 sm:left-6 w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_4px_16px_rgba(250,204,21,0.6)] animate-pulse opacity-95">
                <img src="/assets/sudoku/gunes.png" alt="Güneş" className="w-full h-full object-contain" />
              </div>
              
              {/* Sağ Üst: Renkli Uçan Kelebek */}
              <div className="absolute top-4 right-4 sm:right-10 w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md transform rotate-12 opacity-95">
                <img src="/assets/sudoku/kelebek.png" alt="Kelebek" className="w-full h-full object-contain" />
              </div>

              {/* Sol Alt: Sevimli Yavru Aslan */}
              <div className="absolute bottom-2 left-2 sm:left-4 w-14 h-14 sm:w-20 sm:h-20 drop-shadow-lg opacity-90">
                <img src="/assets/sudoku/aslan.png" alt="Aslan" className="w-full h-full object-contain" />
              </div>

              {/* Sağ Alt: Sevimli Zürafa */}
              <div className="absolute bottom-2 right-2 sm:right-4 w-14 h-14 sm:w-20 sm:h-20 drop-shadow-lg opacity-90">
                <img src="/assets/sudoku/zurafa.png" alt="Zürafa" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* AKVARYUM ÖZEL TEMASI (Sıvı Ölçme ve Balık Düelloları için) */}
      {currentTheme === 'akvaryum' && (
        <div className="absolute inset-0">
          <img 
            src="/akvaryum_arkaplan.jpeg" 
            alt="Akvaryum Arka Planı"
            className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-blue-950/30 pointer-events-none" />

          {showFloatingElements && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-4 left-4 sm:left-10 w-16 h-16 sm:w-22 sm:h-22 drop-shadow-[0_4px_16px_rgba(56,189,248,0.5)] opacity-95">
                <img src="/assets/sudoku/balina.png" alt="Balina" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3 right-4 sm:right-10 w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md opacity-90 transform rotate-12">
                <img src="/assets/sudoku/deniz_yildizi.png" alt="Deniz Yıldızı" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-3 left-4 sm:left-10 w-16 h-16 sm:w-22 sm:h-22 drop-shadow-lg opacity-95">
                <img src="/blklar/13_palyaco_baligi.webp" alt="Palyaço Balığı" className="w-full h-full object-contain" />
              </div>
              <div className="absolute bottom-3 right-4 sm:right-10 w-16 h-16 sm:w-22 sm:h-22 drop-shadow-lg opacity-95 transform -scale-x-100">
                <img src="/assets/sudoku/yunus.png" alt="Yunus" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEFTER TEMASI */}
      {currentTheme === 'defter' && (
        <div className="absolute inset-0 bg-[#091122]">
          <div 
            className="absolute inset-1 sm:inset-2 md:inset-3 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: `
                linear-gradient(to right, transparent 52px, rgba(239, 68, 68, 0.85) 52px, rgba(239, 68, 68, 0.85) 55px, transparent 55px),
                repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(96, 165, 250, 0.75) 30px, rgba(96, 165, 250, 0.75) 32px),
                linear-gradient(135deg, #ffffff 0%, #ffffff 100%)
              `,
            }}
          >
            <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-8 flex flex-col justify-around py-4 pointer-events-none opacity-75">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0a1222] border border-slate-400/40" />
                  <div className="w-2 h-1 bg-slate-300 rounded-sm -ml-1 transform -rotate-12" />
                </div>
              ))}
            </div>
            <div className="absolute top-2 right-4 sm:right-8 flex items-center gap-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>📅 TÜRKÇE DEFTERİ</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MERKEZİ ODAK ALANI: SORULARIN NET OKUNMASI İÇİN HAFİF SEFFAF KONTRAST ALANI */}
      {dimCenter && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-[96%] max-w-5xl h-[88%] rounded-3xl bg-slate-950/10 border border-white/5" />
        </div>
      )}

      {/* 3. TEMA DEĞİŞTİRİCİ BUTON (İSTEĞE BAĞLI) */}
      {allowThemeSwitch && (
        <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-3 z-50 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-400/50 shadow-lg text-[10px] sm:text-xs font-black flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
              title="Etkinlik Arka Planını Değiştir"
            >
              <Palette size={13} className="text-amber-400" />
              <span className="hidden xs:inline">Görsel:</span>
              <span className="text-white">{THEME_CONFIGS[currentTheme]?.icon || '🌳'} {THEME_CONFIGS[currentTheme]?.name || 'Doğa'}</span>
            </button>

            {showThemePicker && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-950/95 border-2 border-amber-400/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md z-50 animate-fadeIn">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 mb-1.5">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Arka Plan Görseli</span>
                  </span>
                  <button 
                    onClick={() => setShowThemePicker(false)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {(Object.keys(THEME_CONFIGS) as ActivityBackgroundTheme[])
                    .filter(k => k !== 'oyun') // Mor tema kaldırıldı
                    .map((tKey) => {
                      const cfg = THEME_CONFIGS[tKey];
                      const isSelected = currentTheme === tKey;
                      return (
                        <button
                          key={tKey}
                          onClick={() => handleSelectTheme(tKey)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left transition cursor-pointer border ${
                            isSelected 
                              ? 'bg-amber-500/20 text-white border-amber-400 shadow-sm' 
                              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{cfg.icon}</span>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate leading-tight">{cfg.name}</div>
                              <div className="text-[9px] text-slate-400 truncate leading-tight">{cfg.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-amber-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityBackground;
