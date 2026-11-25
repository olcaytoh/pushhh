import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import iconDortluSira from '../assets/images/icon_dortlu_sira_1795634814162.jpg';
import iconTrafiktenCikis from '../assets/images/icon_trafikten_cikis_1795634815553.jpg';
import iconHafizaMelodisi from '../assets/images/icon_hafiza_melodisi_1795634816857.jpg';
import iconHanoiKulesi from '../assets/images/icon_hanoi_kulesi_1795634815180.jpg';

export type RecentTopicActionId =
  | 'pentago'
  | 'dortlu_sira'
  | 'trafikten_cikis'
  | 'hafiza_melodisi'
  | 'hanoi_kulesi'
  | 'trafik_levhalari'
  | 'farkli_olani_bul'
  | 'bilsem_hub'
  | 'adresimi_biliyorum'
  | 'guvenli_internet'
  | 'saglikli_buyume'
  | 'okuma_yazma'
  | 'noktalama_surukle'
  | 'kure'
  | 'kodlama_mutfagi'
  | 'ritmik_balon'
  | 'carpim_balon'
  | 'en_yakin_onluk_oyunu';

export interface RecentTopicEntry {
  id: RecentTopicActionId;
  title: string;
  categoryLabel: string;
  addedAt: string; // YYYY-MM-DD
  icon: string;
  whiteIconBg?: boolean;
  accentText: string;
}

/**
 * Son 15 günde eklenen konu ve etkinliklerin tarihli listesi.
 * Yeni konu/etkinlik eklendikçe en üste YYYY-MM-DD tarihiyle eklenir;
 * bileşen otomatik olarak son 15 gün içindeki kayıtları süzer ve sırayla döndürür.
 */
export const RECENT_TOPICS_CATALOG: RecentTopicEntry[] = [
  {
    id: 'pentago',
    title: 'Pentago (5’li Sıra & Dönen Bloklar)',
    categoryLabel: 'Akıl ve Zeka Oyunları',
    addedAt: '2026-11-25',
    icon: '/assets/aistudio/Ekran_Resmi_2026-11-25_22.43.00_9e54085f.png',
    whiteIconBg: true,
    accentText: 'text-rose-300',
  },
  {
    id: 'dortlu_sira',
    title: 'Dörtlü Sıra (Connect 4)',
    categoryLabel: 'Akıl ve Zeka Oyunları',
    addedAt: '2026-11-25',
    icon: iconDortluSira,
    accentText: 'text-amber-300',
  },
  {
    id: 'trafikten_cikis',
    title: 'Trafikten Çıkış (Akıllı Otopark)',
    categoryLabel: 'Akıl ve Zeka Oyunları',
    addedAt: '2026-11-25',
    icon: iconTrafiktenCikis,
    accentText: 'text-rose-300',
  },
  {
    id: 'hafiza_melodisi',
    title: 'Hafıza Melodisi (Renk & Nota)',
    categoryLabel: 'Akıl ve Zeka Oyunları',
    addedAt: '2026-11-25',
    icon: iconHafizaMelodisi,
    accentText: 'text-fuchsia-300',
  },
  {
    id: 'hanoi_kulesi',
    title: 'Hanoi Kulesi (Mantık Halkaları)',
    categoryLabel: 'Akıl ve Zeka Oyunları',
    addedAt: '2026-11-25',
    icon: iconHanoiKulesi,
    accentText: 'text-emerald-300',
  },
  {
    id: 'trafik_levhalari',
    title: 'Trafik İşaret Levhaları Atölyesi',
    categoryLabel: '2. Sınıf Hayat Bilgisi',
    addedAt: '2026-11-25',
    icon: '/assets/trafik/yaya_gecidi_mavi.png',
    whiteIconBg: true,
    accentText: 'text-sky-300',
  },
  {
    id: 'farkli_olani_bul',
    title: 'Farklı Olanı Bul (120 Seviye)',
    categoryLabel: 'Diğer Oyunlar',
    addedAt: '2026-11-24',
    icon: '/assets/farkbl/faces_odd_18.webp',
    whiteIconBg: true,
    accentText: 'text-cyan-300',
  },
  {
    id: 'bilsem_hub',
    title: 'BİLSEM Görsel Zeka & Denge',
    categoryLabel: '1.–3. Sınıf BİLSEM',
    addedAt: '2026-11-24',
    icon: '/MENUIKON/grid_icon_27.webp',
    accentText: 'text-amber-300',
  },
  {
    id: 'adresimi_biliyorum',
    title: 'Adresimi Biliyorum',
    categoryLabel: '2. Sınıf Hayat Bilgisi',
    addedAt: '2026-11-22',
    icon: '/MENUIKON/grid_icon_34.webp',
    accentText: 'text-rose-300',
  },
  {
    id: 'guvenli_internet',
    title: 'Güvenli İnternet Dünyası',
    categoryLabel: '2. Sınıf Hayat Bilgisi',
    addedAt: '2026-11-20',
    icon: '/MENUIKON/grid_icon_35.webp',
    accentText: 'text-cyan-300',
  },
  {
    id: 'saglikli_buyume',
    title: 'Sağlıklı Büyüme ve Alışkanlıklar',
    categoryLabel: '2. Sınıf Hayat Bilgisi',
    addedAt: '2026-11-19',
    icon: '/MENUIKON/grid_icon_27.webp',
    accentText: 'text-emerald-300',
  },
  {
    id: 'okuma_yazma',
    title: '1. Sınıf Okuma Yazma Atölyesi',
    categoryLabel: '1. Sınıf · 5 Harf Grubu',
    addedAt: '2026-11-18',
    icon: '/icon_1.webp',
    accentText: 'text-rose-300',
  },
  {
    id: 'noktalama_surukle',
    title: 'Noktalama İşaretleri Etkinliği',
    categoryLabel: '2. Sınıf Türkçe',
    addedAt: '2026-11-17',
    icon: '/MENUIKON/grid_icon_25.webp',
    accentText: 'text-red-300',
  },
  {
    id: 'kure',
    title: 'Küre Zeka Oyunu (7×7)',
    categoryLabel: 'Diğer Oyunlar',
    addedAt: '2026-11-16',
    icon: '/MENUIKON/grid_icon_39.webp',
    accentText: 'text-violet-300',
  },
  {
    id: 'kodlama_mutfagi',
    title: 'Kodlama & Algoritma Mutfağı',
    categoryLabel: 'Diğer Oyunlar',
    addedAt: '2026-11-15',
    icon: '/MENUIKON/grid_icon_27.webp',
    accentText: 'text-amber-300',
  },
  {
    id: 'ritmik_balon',
    title: 'Ritmik Balon Patlatma Düellosu',
    categoryLabel: '2. Sınıf Matematik',
    addedAt: '2026-11-14',
    icon: '/MENUIKON/grid_icon_03.webp',
    accentText: 'text-pink-300',
  },
  {
    id: 'carpim_balon',
    title: 'Çarpım Tablosu Balon Düellosu',
    categoryLabel: 'Diğer Oyunlar',
    addedAt: '2026-11-13',
    icon: '/MENUIKON/grid_icon_15.webp',
    accentText: 'text-sky-300',
  },
  {
    id: 'en_yakin_onluk_oyunu',
    title: 'En Yakın Onluğa Yuvarlama Oyunu',
    categoryLabel: '2.–4. Sınıf Matematik',
    addedAt: '2026-11-12',
    icon: '/MENUIKON/grid_icon_21.webp',
    accentText: 'text-emerald-300',
  },
];

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const ROTATE_INTERVAL_MS = 3200;

function getLast15DaysItems(): RecentTopicEntry[] {
  const now = Date.now();
  const sorted = [...RECENT_TOPICS_CATALOG].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  const within15Days = sorted.filter(item => {
    const addedTs = new Date(`${item.addedAt}T00:00:00`).getTime();
    if (Number.isNaN(addedTs)) return false;
    const diff = now - addedTs;
    // Gelecek tarih veya son 15 gün içindekileri al
    return diff >= -86_400_000 && diff <= FIFTEEN_DAYS_MS;
  });

  // Takvim 15 günü aşsa bile çerçevenin boş kalmaması için en güncel kayıtları döndür
  return within15Days.length > 0 ? within15Days : sorted.slice(0, 10);
}

interface RecentTopicsTickerProps {
  onSelectTopic: (actionId: RecentTopicActionId) => void;
}

export const RecentTopicsTicker: React.FC<RecentTopicsTickerProps> = ({ onSelectTopic }) => {
  const items = useMemo(() => getLast15DaysItems(), []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToIndex = (nextIndex: number) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setActiveIdx((nextIndex + items.length) % items.length);
      setIsTransitioning(false);
    }, 170);
  };

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setIsTransitioning(true);
      window.setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % items.length);
        setIsTransitioning(false);
      }, 170);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [items.length, isPaused]);

  const current = items[activeIdx] || items[0];
  if (!current) return null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full max-w-[330px] sm:max-w-[350px] lg:w-[295px] xl:w-[340px] h-[50px] sm:h-[56px] rounded-2xl"
    >
      {/* Katman 1: GPU-Only (sadece opacity) Nefes Alan Çift Renkli Parlak Neon Box-Shadow Haleleri */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl recent-neon-halo-a"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl recent-neon-halo-b"
      />

      {/* Katman 2: Parlak Neon Işık Tüpü Çerçevesi (Sadece transform: rotate ile 60fps döner) */}
      <div className="relative w-full h-full p-[3.5px] rounded-2xl overflow-hidden ring-[1.5px] ring-white/90 group-hover:ring-yellow-200 transition-colors">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl"
        >
          <div className="w-[420px] h-[420px] shrink-0 will-change-transform animate-[spin_2.4s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_0deg,#ffffff_0deg,#00f5ff_45deg,#fde047_115deg,#ffffff_165deg,#ff2a85_225deg,#a855f7_290deg,#00f5ff_330deg,#ffffff_360deg)]" />
        </div>

        {/* Dikkat Çekici Canlı Turuncu–Kırmızı–Fuşya İç Zemin + İç Neon Rim Parıltısı */}
        <div className="relative z-10 w-full h-full rounded-[12.5px] bg-gradient-to-r from-[#ea580c] via-[#e11d48] to-[#9333ea] shadow-[inset_0_0_12px_rgba(255,255,255,0.42),inset_0_0_20px_rgba(34,211,238,0.28)] overflow-hidden flex items-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/15" />

          {/* Ana Tıklanabilir Etkinlik Alanı */}
          <button
            type="button"
            onClick={() => onSelectTopic(current.id)}
          title={`${current.title} — Açmak için tıkla`}
          className="relative z-10 flex-1 min-w-0 h-full px-2.5 sm:px-3 flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 rounded-l-[12.5px]"
        >
          {/* Beyaz Zeminli Net İkon */}
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center overflow-hidden bg-white p-0.5 border-2 border-yellow-200/90 shadow-md transition-all duration-200 ${
              isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100 group-hover:scale-105'
            }`}
          >
            <img
              src={current.icon}
              alt={current.title}
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          {/* Metin Alanı (Yüksek Kontrastlı Beyaz & Parlak Sarı) */}
          <div
            className={`flex-1 min-w-0 transition-all duration-200 ${
              isTransitioning ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-wide leading-none truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              <span className="text-yellow-200 shrink-0">YENİ EKLENEN</span>
              <span className="text-white/70 shrink-0">·</span>
              <span className="text-white/95 truncate">{current.categoryLabel}</span>
            </div>
            <div className="text-[11px] sm:text-[13px] font-black text-white group-hover:text-yellow-100 truncate leading-tight mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors">
              {current.title}
            </div>
          </div>

          {/* Parlak Sarı Açma Oku */}
          <div className="shrink-0 w-6 h-6 rounded-lg bg-yellow-300 group-hover:bg-white text-slate-950 border border-yellow-100 flex items-center justify-center transition-colors shadow-md">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
        </button>

        {/* Sağda Kompakt İleri/Geri + Sıra Göstergesi */}
        <div className="relative z-10 shrink-0 h-full pr-1.5 pl-0.5 flex flex-col items-center justify-center border-l border-white/25 bg-black/20">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                goToIndex(activeIdx - 1);
              }}
              aria-label="Önceki yeni etkinlik"
              className="w-4 h-4 rounded hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                goToIndex(activeIdx + 1);
              }}
              aria-label="Sonraki yeni etkinlik"
              className="w-4 h-4 rounded hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[9px] font-mono font-black text-yellow-200 tabular-nums leading-none mt-0.5">
            {activeIdx + 1}/{items.length}
          </span>
        </div>

          {/* Alt İlerleme Çizgisi */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[2.5px] bg-black/25">
            <div
              className="h-full bg-gradient-to-r from-yellow-200 via-white to-cyan-200 transition-all duration-300"
              style={{ width: `${((activeIdx + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
