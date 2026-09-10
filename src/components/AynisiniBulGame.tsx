import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, X, Layers, SkipBack, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AynisiniBulGameProps {
  onClose: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
}

export type ThemeCategory = 'all' | 'meyveler' | 'sevimli' | 'okul' | 'rozets';

interface GameObject {
  id: string;
  name: string;
  imageSrc: string;
  category: 'meyveler' | 'okul' | 'rozets' | 'sevimli';
}

// 1. MEYVELER (public/meyveler/M1.png - M19.png) - 19 adet tam orantılı meyve
const MEYVE_ISIMLERI = [
  'Kırmızı Elma', 'Tatlı Çilek', 'Sarı Muz', 'Sulu Karpuz', 'Turuncu Portakal',
  'Mor Üzüm', 'Sarı Limon', 'Yeşil Armut', 'Şeftali', 'Kırmızı Kiraz',
  'Ananas', 'Kivi', 'Avokado', 'İncir', 'Nar',
  'Mor Erik', 'Hindistan Cevizi', 'Mango', 'Kavun'
];

const MEYVELER_OBJECTS: GameObject[] = Array.from({ length: 19 }, (_, i) => ({
  id: `meyve_m${i + 1}`,
  name: MEYVE_ISIMLERI[i] || `Meyve ${i + 1}`,
  imageSrc: `/meyveler/M${i + 1}.png`,
  category: 'meyveler',
}));

// 2. ROZETLER & KUPALAR (public/rozets/d1.png - d16.png + kupa/tac/yildiz) - 19 adet tam orantılı madalya ve kupa
const ROZET_ISIMLERI = [
  'Yıldız Rozeti', 'Ateş Rozeti', 'Şimşek Rozeti', 'Zafer Rozeti', 'Altın Kupa',
  'Mavi Elmas', 'Kristal Rozet', 'Altın Taç', 'Şampiyon Rozeti', 'Onur Madalyası',
  'Süper Yıldız', 'Lider Rozeti', 'Gümüş Kalkan', 'Zümrüt Rozet', 'Usta Rozeti', 'Efsane Rozeti'
];

const ROZETS_BASE: GameObject[] = Array.from({ length: 16 }, (_, i) => ({
  id: `rozet_d${i + 1}`,
  name: ROZET_ISIMLERI[i] || `Rozet ${i + 1}`,
  imageSrc: `/rozets/d${i + 1}.png`,
  category: 'rozets',
}));

const ROZETS_OBJECTS: GameObject[] = [
  ...ROZETS_BASE,
  { id: 'rozet_kupa_kirmizi', name: 'Şampiyon Kupası', imageSrc: '/icoo/kirmizi_kupa.png', category: 'rozets' },
  { id: 'rozet_altin_tac', name: 'Kral Tacı', imageSrc: '/icoo/tac.png', category: 'rozets' },
  { id: 'rozet_sari_yildiz', name: 'Parlayan Yıldız', imageSrc: '/icoo/yildiz_sari.png', category: 'rozets' },
];

// 3. OKUL GÖRSELLERİ - Küçük veya ince görseller elenmiş, hepsi dolgun ve net 19 okul objesi
const OKUL_OBJECTS: GameObject[] = [
  { id: 'okul_kitap', name: 'Açık Kitap', imageSrc: '/okul_gorseller/acik_kitap.png', category: 'okul' },
  { id: 'okul_tahta', name: 'Kara Tahta', imageSrc: '/okul_gorseller/kara_tahta.png', category: 'okul' },
  { id: 'okul_otobus', name: 'Okul Servisi', imageSrc: '/okul_gorseller/okul_otobusu.png', category: 'okul' },
  { id: 'okul_lego', name: 'Lego Blokları', imageSrc: '/okul_gorseller/lego_bloklari.png', category: 'okul' },
  { id: 'okul_palet', name: 'Boya Paleti', imageSrc: '/okul_gorseller/boya_paleti.png', category: 'okul' },
  { id: 'okul_harf', name: 'Harf Küpleri', imageSrc: '/okul_gorseller/harf_kupleri.png', category: 'okul' },
  { id: 'okul_buyutec', name: 'Büyüteç', imageSrc: '/okul_gorseller/buyutec.png', category: 'okul' },
  { id: 'okul_pastel_kutu', name: 'Pastel Boya Kutusu', imageSrc: '/okul_gorseller/pastel_boya_kutusu.png', category: 'okul' },
  { id: 'okul_harita', name: 'Küre Harita', imageSrc: '/okul_gorseller/kuresel_harita.png', category: 'okul' },
  { id: 'okul_hesap', name: 'Hesap Makinesi', imageSrc: '/okul_gorseller/hesap_makinesi.png', category: 'okul' },
  { id: 'okul_kalemtiras', name: 'Kalemtıraş', imageSrc: '/okul_gorseller/kalemtiras.png', category: 'okul' },
  { id: 'okul_bant', name: 'Bant Makinesi', imageSrc: '/okul_gorseller/bantli_seloteyp_makinesi.png', category: 'okul' },
  { id: 'okul_defter', name: 'Yıldızlı Defter', imageSrc: '/okul_gorseller/yildizli_kahverengi_defter.png', category: 'okul' },
  { id: 'okul_makas', name: 'Okul Makası', imageSrc: '/okul_gorseller/makas.png', category: 'okul' },
  { id: 'okul_renkli_kalemler', name: 'Boya Kalemleri', imageSrc: '/okul_gorseller/renkli_pastel_boya_kalemleri.png', category: 'okul' },
  { id: 'okul_sirt_cantasi_mavi', name: 'Mavi Okul Çantası', imageSrc: '/icoo/sirt_cantasi_mavi.png', category: 'okul' },
  { id: 'okul_sirt_cantasi_kahve', name: 'Deri Sırt Çantası', imageSrc: '/icoo/sirt_cantasi_kahverengi.png', category: 'okul' },
  { id: 'okul_kitap_icoo', name: 'Ders Kitabı', imageSrc: '/icoo/kitap.png', category: 'okul' },
  { id: 'okul_kalem_icoo', name: 'Yazı Kalemi', imageSrc: '/icoo/kalem.png', category: 'okul' },
];

// 4. SEVİMLİ DOSTLAR & NESNELER (public/icoo/...) - 34 adet canlı 3D simge (Küçük emojiler yerine!)
const SEVIMLI_OBJECTS: GameObject[] = [
  { id: 'ico_ayicik', name: 'Oyuncak Ayı', imageSrc: '/icoo/ayicik.png', category: 'sevimli' },
  { id: 'ico_balik', name: 'Sevimli Balık', imageSrc: '/icoo/balik.png', category: 'sevimli' },
  { id: 'ico_kedi', name: 'Yavru Kedi', imageSrc: '/icoo/kedi_yavrusu.png', category: 'sevimli' },
  { id: 'ico_kopek', name: 'Sadık Köpek', imageSrc: '/icoo/kopek.png', category: 'sevimli' },
  { id: 'ico_panda', name: 'Sevimli Panda', imageSrc: '/icoo/panda.png', category: 'sevimli' },
  { id: 'ico_penguen', name: 'Minik Penguen', imageSrc: '/icoo/penguen.png', category: 'sevimli' },
  { id: 'ico_ordek', name: 'Sarı Ördek', imageSrc: '/icoo/sari_ordek.png', category: 'sevimli' },
  { id: 'ico_kurbaga', name: 'Yeşil Kurbağa', imageSrc: '/icoo/kurbaga.png', category: 'sevimli' },
  { id: 'ico_kaplumbaga', name: 'Kaplumbağa', imageSrc: '/icoo/kaplumbaga.png', category: 'sevimli' },
  { id: 'ico_kelebek_mavi', name: 'Mavi Kelebek', imageSrc: '/icoo/kelebek_mavi.png', category: 'sevimli' },
  { id: 'ico_kelebek_mor', name: 'Mor Kelebek', imageSrc: '/icoo/kelebek_mor.png', category: 'sevimli' },
  { id: 'ico_ugur_bocegi', name: 'Uğur Böceği', imageSrc: '/icoo/ugur_bocegi_1.png', category: 'sevimli' },
  { id: 'ico_yunus', name: 'Sevimli Yunus', imageSrc: '/icoo/yunus_1.png', category: 'sevimli' },
  { id: 'ico_futbol', name: 'Futbol Topu', imageSrc: '/icoo/futbol_topu.png', category: 'sevimli' },
  { id: 'ico_basketbol', name: 'Basketbol Topu', imageSrc: '/icoo/basketbol_topu.png', category: 'sevimli' },
  { id: 'ico_voleybol', name: 'Voleybol Topu', imageSrc: '/icoo/voleybol_topu.png', category: 'sevimli' },
  { id: 'ico_plaj_topu', name: 'Plaj Topu', imageSrc: '/icoo/plaj_topu.png', category: 'sevimli' },
  { id: 'ico_hediye_mavi', name: 'Hediye Paketi', imageSrc: '/icoo/hediye_kutusu_mavi.png', category: 'sevimli' },
  { id: 'ico_hediye_yesil', name: 'Yeşil Hediye', imageSrc: '/icoo/hediye_kutusu_yesil.png', category: 'sevimli' },
  { id: 'ico_gunes', name: 'Gülümseyen Güneş', imageSrc: '/icoo/gunes.png', category: 'sevimli' },
  { id: 'ico_kalp', name: 'Kırmızı Kalp', imageSrc: '/icoo/kalp.png', category: 'sevimli' },
  { id: 'ico_semsiye', name: 'Renkli Şemsiye', imageSrc: '/icoo/semsiye.png', category: 'sevimli' },
  { id: 'ico_fotograf', name: 'Fotoğraf Makinesi', imageSrc: '/icoo/fotograf_makinesi.png', category: 'sevimli' },
  { id: 'ico_araba', name: 'Mavi Araba', imageSrc: '/icoo/mavi_araba.png', category: 'sevimli' },
  { id: 'ico_tren', name: 'Hızlı Tren', imageSrc: '/icoo/tren.png', category: 'sevimli' },
  { id: 'ico_ucak', name: 'Beyaz Uçak', imageSrc: '/icoo/ucak.png', category: 'sevimli' },
  { id: 'ico_helikopter', name: 'Helikopter', imageSrc: '/icoo/helikopter.png', category: 'sevimli' },
  { id: 'ico_itfaiye', name: 'İtfaiye Kamyonu', imageSrc: '/icoo/itfaiye_araci.png', category: 'sevimli' },
  { id: 'ico_damperli', name: 'Damperli Kamyon', imageSrc: '/icoo/damperli_kamyon.png', category: 'sevimli' },
  { id: 'ico_traktor', name: 'Yeşil Traktör', imageSrc: '/icoo/traktor.png', category: 'sevimli' },
  { id: 'ico_roket', name: 'Uzay Roketi', imageSrc: '/icoo/roket.png', category: 'sevimli' },
  { id: 'ico_cilek', name: 'Taze Çilek', imageSrc: '/icoo/cilek.png', category: 'sevimli' },
  { id: 'ico_elma', name: 'Kırmızı Elma', imageSrc: '/icoo/elma.png', category: 'sevimli' },
  { id: 'ico_karpuz', name: 'Dilim Karpuz', imageSrc: '/icoo/karpuz.png', category: 'sevimli' },
];

// Tüm havuz (Meyveler + Okul + Rozetler + Sevimli)
const ALL_OBJECTS: GameObject[] = [
  ...MEYVELER_OBJECTS,
  ...OKUL_OBJECTS,
  ...ROZETS_OBJECTS,
  ...SEVIMLI_OBJECTS,
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 10 Slot Dairesel Koordinatları: 1 Merkez, 3 İç Halka (r=21%), 6 Dış Halka (r=37%)
// Tüm nesneler arasındaki minimum merkez-merkez mesafesi %21.0'dir.
// Nesne genişliği %16.5 olduğunda kenarlar arası net boşluk kalır, ASLA birbirine değmez!
function generateSafeCircleSlots(rotationDeg: number = 0): { x: number; y: number }[] {
  const rot = (rotationDeg * Math.PI) / 180;
  const slots: { x: number; y: number }[] = [{ x: 50, y: 50 }]; // Slot 0: Merkez

  // 3 İç Halka (r=21%)
  for (let k = 0; k < 3; k++) {
    const ang = ((k * 120 - 90) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 21 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 21 * Math.sin(ang)) * 10) / 10,
    });
  }

  // 6 Dış Halka (r=37%)
  for (let k = 0; k < 6; k++) {
    const ang = ((k * 60 - 60) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 37 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 37 * Math.sin(ang)) * 10) / 10,
    });
  }

  return slots;
}

interface PlacedItem extends GameObject {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const TARGET_WIN_SCORE = 7;
const MAX_MISTAKES = 3;

export const AynisiniBulGame: React.FC<AynisiniBulGameProps> = ({
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3,
}) => {
  const [theme, setTheme] = useState<ThemeCategory>('all');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Mistakes, setPlayer1Mistakes] = useState(0);
  const [player2Mistakes, setPlayer2Mistakes] = useState(0);

  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);
  const [winReason, setWinReason] = useState<'score' | 'mistake' | null>(null);

  // Tur Nesneleri
  const [commonItem, setCommonItem] = useState<GameObject>(ALL_OBJECTS[0]);
  const [p1Items, setP1Items] = useState<PlacedItem[]>([]);
  const [p2Items, setP2Items] = useState<PlacedItem[]>([]);

  // Geri Bildirim Durumları
  const [p1WrongId, setP1WrongId] = useState<string | null>(null);
  const [p2WrongId, setP2WrongId] = useState<string | null>(null);
  const [foundItemId, setFoundItemId] = useState<string | null>(null);
  const [roundWinnerPlayer, setRoundWinnerPlayer] = useState<'p1' | 'p2' | null>(null);

  const isTransitioningRef = useRef(false);

  const triggerSound = useCallback((type: 'correct' | 'wrong' | 'win' | 'click') => {
    if (!playMp3) return;
    if (type === 'correct') playMp3('/correct.mp3');
    else if (type === 'wrong') playMp3('/hata.mp3');
    else if (type === 'win') playMp3('/nextlvl.mp3');
    else playMp3('/op.mp3');
  }, [playMp3]);

  // Aktif havuzu belirle (Tema filtresine göre)
  const getActivePool = useCallback((selectedTheme: ThemeCategory): GameObject[] => {
    if (selectedTheme === 'meyveler') return MEYVELER_OBJECTS;
    if (selectedTheme === 'okul') return OKUL_OBJECTS;
    if (selectedTheme === 'rozets') return ROZETS_OBJECTS;
    if (selectedTheme === 'sevimli') return SEVIMLI_OBJECTS;
    return ALL_OBJECTS;
  }, []);

  // Yeni Tur Kurulumu
  const setupNewRound = useCallback((activeTheme: ThemeCategory = theme) => {
    isTransitioningRef.current = false;
    setRoundWinnerPlayer(null);
    setFoundItemId(null);
    setP1WrongId(null);
    setP2WrongId(null);

    const pool = getActivePool(activeTheme);
    const shuffledPool = shuffleArray(pool);

    // En az 19 nesneye ihtiyacımız var (1 ortak + 9 p1 + 9 p2)
    // Eğer seçili temada 19'dan az varsa ALL_OBJECTS ile tamamla
    let selected19: GameObject[] = [];
    if (shuffledPool.length >= 19) {
      selected19 = shuffledPool.slice(0, 19);
    } else {
      const rest = shuffleArray(ALL_OBJECTS.filter(o => !shuffledPool.some(sp => sp.id === o.id)));
      selected19 = [...shuffledPool, ...rest].slice(0, 19);
    }

    const common = selected19[0];
    const p1Unique = selected19.slice(1, 10);
    const p2Unique = selected19.slice(10, 19);

    const p1Raw = shuffleArray([...p1Unique, common]);
    const p2Raw = shuffleArray([...p2Unique, common]);

    // P1 ve P2 için farklı rastgele açılarda güvenli slotlar oluştur (%21 min mesafe ile asla çakışmaz)
    const rotP1 = Math.floor(Math.random() * 360);
    const rotP2 = Math.floor(Math.random() * 360);

    const slotsP1 = shuffleArray(generateSafeCircleSlots(rotP1));
    const slotsP2 = shuffleArray(generateSafeCircleSlots(rotP2));

    // TÜM GÖRSELLER İÇİN EŞİT VE SABİT ÖLÇEK (scale: 1.0)
    // Küçük görsel kullanılmaz, hepsi aynı net boyutta ve dik açıda render edilir
    const p1Placed: PlacedItem[] = p1Raw.map((it, idx) => ({
      ...it,
      x: slotsP1[idx].x,
      y: slotsP1[idx].y,
      scale: 1.0,
      rotation: 0,
    }));

    const p2Placed: PlacedItem[] = p2Raw.map((it, idx) => ({
      ...it,
      x: slotsP2[idx].x,
      y: slotsP2[idx].y,
      scale: 1.0,
      rotation: 0,
    }));

    setCommonItem(common);
    setP1Items(p1Placed);
    setP2Items(p2Placed);
  }, [theme, getActivePool]);

  // Oyun ilk başladığında turu hazırla
  useEffect(() => {
    setupNewRound(theme);
  }, [setupNewRound, theme]);

  // Kazanma durumunda konfeti
  useEffect(() => {
    if (winner) {
      triggerSound('win');
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [winner, triggerSound]);

  // Nesneye Tıklama Olayı
  const handleItemClick = (player: 'p1' | 'p2', item: GameObject) => {
    if (winner || isTransitioningRef.current) return;

    // Ortak nesneye mi basıldı?
    if (item.id === commonItem.id) {
      isTransitioningRef.current = true;
      triggerSound('correct');
      setRoundWinnerPlayer(player);
      setFoundItemId(item.id);

      const nextP1 = player === 'p1' ? player1Score + 1 : player1Score;
      const nextP2 = player === 'p2' ? player2Score + 1 : player2Score;

      if (player === 'p1') setPlayer1Score(nextP1);
      if (player === 'p2') setPlayer2Score(nextP2);

      // 7 Doğruya ulaşıldı mı?
      if (nextP1 >= TARGET_WIN_SCORE) {
        setWinner('p1');
        setWinReason('score');
        return;
      }
      if (nextP2 >= TARGET_WIN_SCORE) {
        setWinner('p2');
        setWinReason('score');
        return;
      }

      // 0.65 saniye sonra yeni tur
      setTimeout(() => {
        setupNewRound(theme);
      }, 700);
    } else {
      // Yanlış nesneye basıldı! Hata ekle
      triggerSound('wrong');
      if (player === 'p1') {
        const nextMistakes = player1Mistakes + 1;
        setPlayer1Mistakes(nextMistakes);
        setP1WrongId(item.id);

        setTimeout(() => setP1WrongId(null), 600);

        // 3 Hata yapan elensin!
        if (nextMistakes >= MAX_MISTAKES) {
          isTransitioningRef.current = true;
          setWinner('p2'); // Karşı taraf kazanır
          setWinReason('mistake');
        }
      } else {
        const nextMistakes = player2Mistakes + 1;
        setPlayer2Mistakes(nextMistakes);
        setP2WrongId(item.id);

        setTimeout(() => setP2WrongId(null), 600);

        // 3 Hata yapan elensin!
        if (nextMistakes >= MAX_MISTAKES) {
          isTransitioningRef.current = true;
          setWinner('p1'); // Karşı taraf kazanır
          setWinReason('mistake');
        }
      }
    }
  };

  const handleRestart = () => {
    triggerSound('click');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setWinner(null);
    setWinReason(null);
    setupNewRound(theme);
  };

  const handleThemeChange = (newTheme: ThemeCategory) => {
    triggerSound('click');
    setTheme(newTheme);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setWinner(null);
    setWinReason(null);
    setupNewRound(newTheme);
  };

  return (
    // Z-INDEX 250: Üstteki tüm header ve butonların tamamen ÜSTÜNDE yer alır, altına girmez!
    <div className="fixed inset-0 z-[250] flex flex-row font-sans select-none overflow-hidden touch-none bg-slate-950">
      
      {/* 1. ÜST ORTA: BEYAZ HAP SKOR VE CAN ROZETİ (FOTOĞRAFTAKİ GİBİ) */}
      <div className="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-1 sm:py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 flex items-center gap-3.5 sm:gap-5 text-slate-900">
          
          {/* Sol Oyuncu (Kırmızı): Canlar & Skor */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-0.5" title="Kırmızı Oyuncu Kalan Hak">
              {[0, 1, 2].map((idx) => {
                const isAlive = idx < (MAX_MISTAKES - player1Mistakes);
                return (
                  <span
                    key={idx}
                    className={`text-xs sm:text-base transition-transform ${
                      !isAlive ? 'opacity-30 scale-90 grayscale' : 'scale-100'
                    }`}
                  >
                    {isAlive ? '❤️' : '❌'}
                  </span>
                );
              })}
            </div>
            <span className="font-black text-xl sm:text-2xl md:text-3xl text-[#df4a42] min-w-[22px] text-right drop-shadow-xs">
              {player1Score}
            </span>
          </div>

          {/* Ayraç Nokta */}
          <span className="text-slate-400 font-black text-lg sm:text-xl">•</span>

          {/* Sağ Oyuncu (Mavi): Skor & Canlar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-black text-xl sm:text-2xl md:text-3xl text-[#399ae2] min-w-[22px] text-left drop-shadow-xs">
              {player2Score}
            </span>
            <div className="flex items-center gap-0.5" title="Mavi Oyuncu Kalan Hak">
              {[0, 1, 2].map((idx) => {
                const isAlive = idx < (MAX_MISTAKES - player2Mistakes);
                return (
                  <span
                    key={idx}
                    className={`text-xs sm:text-base transition-transform ${
                      !isAlive ? 'opacity-30 scale-90 grayscale' : 'scale-100'
                    }`}
                  >
                    {isAlive ? '❤️' : '❌'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kural İpucu: 7 Doğru Kazanır • 3 Hata Elenir */}
        <div className="mt-1 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-[10px] sm:text-xs font-bold text-white shadow-md tracking-wide">
          7 Doğru Kazandırır • 3 Hata Elendirir
        </div>
      </div>

      {/* 2. ALT ORTA: BEYAZ HAP EXIT / ÇIKIŞ VE TEMA SEÇİCİ */}
      <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto max-w-[96vw] overflow-x-auto px-1 py-0.5 scrollbar-none">
        {/* Tema Seçici Butonları */}
        <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-lg shrink-0">
          <button
            onClick={() => handleThemeChange('all')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              theme === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🌟 Tümü
          </button>
          <button
            onClick={() => handleThemeChange('meyveler')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              theme === 'meyveler'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🍎 Meyveler
          </button>
          <button
            onClick={() => handleThemeChange('sevimli')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              theme === 'sevimli'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🧸 Sevimli
          </button>
          <button
            onClick={() => handleThemeChange('okul')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              theme === 'okul'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🎒 Okul
          </button>
          <button
            onClick={() => handleThemeChange('rozets')}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              theme === 'rozets'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🎖️ Rozetler
          </button>
        </div>

        {/* İleri / Geri Etkinlik & Exit Butonları */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('click');
                onPrevActivity();
              }}
              title="Önceki Etkinliğe Geç"
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
            >
              <SkipBack size={13} />
              <span className="hidden md:inline">Önceki</span>
            </button>
          )}

          {/* Exit Butonu */}
          <button
            onClick={() => {
              triggerSound('click');
              onClose();
            }}
            className="bg-white hover:bg-slate-100 active:scale-95 text-slate-900 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 cursor-pointer transition-all flex items-center gap-1"
          >
            <X size={14} className="stroke-[3]" />
            <span>EXIT</span>
          </button>

          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('click');
                onNextActivity();
              }}
              title="Sonraki Etkinliğe Geç"
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
            >
              <span className="hidden md:inline">Sonraki</span>
              <SkipForward size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3. SOL YARI: KIRMIZI ALAN (1. OYUNCU) */}
      <div className="w-1/2 h-full bg-[#df4a42] flex items-center justify-center p-2 sm:p-4 md:p-8 border-r-2 border-black/30 relative overflow-hidden">
        
        {/* Oyuncu Etiketi */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/30 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase border border-white/20">
            1. Oyuncu
          </span>
        </div>

        {/* Hata Uyarısı Katmanı */}
        {player1Mistakes >= 1 && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/40 text-amber-300 font-bold text-[10px] sm:text-xs border border-amber-400/40">
              {player1Mistakes}/3 Hata
            </span>
          </div>
        )}

        {/* SOL BEYAZ DAİRE (SPOT IT / DOBBLE KARTI) */}
        <div
          className={`relative w-[92vw] max-w-[min(46vw,72vh)] aspect-square bg-white rounded-full border-[3px] sm:border-[5px] border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${
            roundWinnerPlayer === 'p1' ? 'ring-8 ring-emerald-400 scale-[1.02]' : ''
          }`}
        >
          {p1Items.map((item) => {
            const isFoundCommon = foundItemId === item.id && roundWinnerPlayer === 'p1';
            const isWrong = p1WrongId === item.id;

            return (
              <button
                key={`p1-${item.id}`}
                onClick={() => handleItemClick('p1', item)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: '16.5%',
                  height: '16.5%',
                  transform: `translate(-50%, -50%) scale(${isFoundCommon ? 1.25 : 1.0})`,
                }}
                className={`absolute flex items-center justify-center rounded-2xl cursor-pointer transition-transform active:scale-95 hover:scale-105 focus:outline-hidden p-0.5 ${
                  isFoundCommon
                    ? 'bg-emerald-100 ring-4 ring-emerald-500 animate-bounce shadow-xl'
                    : isWrong
                    ? 'bg-red-100 ring-4 ring-red-500 animate-shake'
                    : 'hover:bg-slate-100/50'
                }`}
                title={item.name}
              >
                <img
                  src={item.imageSrc}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)] select-none pointer-events-none"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SAĞ YARI: MAVİ ALAN (2. OYUNCU) */}
      <div className="w-1/2 h-full bg-[#399ae2] flex items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
        
        {/* Oyuncu Etiketi */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/30 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase border border-white/20">
            2. Oyuncu
          </span>
        </div>

        {/* Hata Uyarısı Katmanı */}
        {player2Mistakes >= 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/40 text-amber-300 font-bold text-[10px] sm:text-xs border border-amber-400/40">
              {player2Mistakes}/3 Hata
            </span>
          </div>
        )}

        {/* SAĞ BEYAZ DAİRE (SPOT IT / DOBBLE KARTI) */}
        <div
          className={`relative w-[92vw] max-w-[min(46vw,72vh)] aspect-square bg-white rounded-full border-[3px] sm:border-[5px] border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${
            roundWinnerPlayer === 'p2' ? 'ring-8 ring-emerald-400 scale-[1.02]' : ''
          }`}
        >
          {p2Items.map((item) => {
            const isFoundCommon = foundItemId === item.id && roundWinnerPlayer === 'p2';
            const isWrong = p2WrongId === item.id;

            return (
              <button
                key={`p2-${item.id}`}
                onClick={() => handleItemClick('p2', item)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: '16.5%',
                  height: '16.5%',
                  transform: `translate(-50%, -50%) scale(${isFoundCommon ? 1.25 : 1.0})`,
                }}
                className={`absolute flex items-center justify-center rounded-2xl cursor-pointer transition-transform active:scale-95 hover:scale-105 focus:outline-hidden p-0.5 ${
                  isFoundCommon
                    ? 'bg-emerald-100 ring-4 ring-emerald-500 animate-bounce shadow-xl'
                    : isWrong
                    ? 'bg-red-100 ring-4 ring-red-500 animate-shake'
                    : 'hover:bg-slate-100/50'
                }`}
                title={item.name}
              >
                <img
                  src={item.imageSrc}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)] select-none pointer-events-none"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. ZAFER / ELENME SONUÇ MODALI */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0f172a] border-3 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl animate-scale-up">
            
            <div className="w-18 h-18 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
              <Trophy size={40} className="text-slate-950" />
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              {winReason === 'mistake' ? 'Rakip Elendi' : 'Hedefe Ulaşıldı'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {winner === 'p1' ? '🔴 1. OYUNCU KAZANDI!' : '🔵 2. OYUNCU KAZANDI!'}
            </h2>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              {winReason === 'mistake' ? (
                <>
                  <span className="text-rose-400 font-bold">
                    {winner === 'p1' ? '2. Oyuncu' : '1. Oyuncu'} 3 hata yaptığı için elendi!
                  </span>{' '}
                  Rakip oyuncu maçı galip tamamladı!
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold">7 Doğru hedefine</span> ilk ulaşan oyuncu şampiyon oldu!
                </>
              )}
            </p>

            {/* Skor Tablosu */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 mb-6 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-rose-400 font-bold uppercase">1. Oyuncu (Kırmızı)</div>
                <div className="text-2xl font-black text-white mt-0.5">{player1Score} Doğru</div>
                <div className="text-[11px] text-slate-400">{player1Mistakes} Hata</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-xs text-sky-400 font-bold uppercase">2. Oyuncu (Mavi)</div>
                <div className="text-2xl font-black text-white mt-0.5">{player2Score} Doğru</div>
                <div className="text-[11px] text-slate-400">{player2Mistakes} Hata</div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw size={18} />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <X size={18} />
                  <span>Kapat</span>
                </button>
              </div>

              {(onPrevActivity || onNextActivity) && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  {onPrevActivity && (
                    <button
                      onClick={onPrevActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <SkipBack size={14} />
                      <span>Önceki Etkinlik</span>
                    </button>
                  )}
                  {onNextActivity && (
                    <button
                      onClick={onNextActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Sonraki Etkinlik</span>
                      <SkipForward size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
