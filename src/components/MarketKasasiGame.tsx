import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Coins,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Trophy,
  ArrowRight,
  Receipt,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface MarketKasasiGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
  grade?: 1 | 2 | 3 | 4;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, id: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
}

type MarketMode = 'musteri' | 'kasiyer'; // musteri: parayı öde, kasiyer: para üstü ver

interface MarketProduct {
  id: string;
  name: string;
  price: number; // TL
  icon: string;
  category: string;
}

// Sınıf seviyelerine göre özel kazanım ürünleri
const GRADE_PRODUCTS: Record<number, MarketProduct[]> = {
  // 1. Sınıf: Küçük sayılar (2 - 8 TL), sepet <= 15 TL
  1: [
    { id: 'kalem', name: 'Kurşun Kalem', price: 3, icon: '✏️', category: 'Kırtasiye' },
    { id: 'silgi', name: 'Kokulu Silgi', price: 2, icon: '🧼', category: 'Kırtasiye' },
    { id: 'ekmek', name: 'Taze Ekmek', price: 5, icon: '🍞', category: 'Gıda' },
    { id: 'sut', name: 'Kutu Süt', price: 7, icon: '🥛', category: 'Gıda' },
    { id: 'elma', name: 'Kırmızı Elma', price: 4, icon: '🍎', category: 'Manav' },
    { id: 'simit', name: 'Çıtır Simit', price: 6, icon: '🥯', category: 'Gıda' },
    { id: 'kalemtiras', name: 'Kalemtıraş', price: 5, icon: '✂️', category: 'Kırtasiye' },
    { id: 'muz', name: 'Muz', price: 8, icon: '🍌', category: 'Manav' }
  ],
  // 2. Sınıf: 8 - 25 TL ürünler, sepet <= 40 TL
  2: [
    { id: 'defter', name: 'Çizgili Defter', price: 12, icon: '📓', category: 'Kırtasiye' },
    { id: 'boya', name: 'Kuru Boya Seti', price: 20, icon: '🎨', category: 'Kırtasiye' },
    { id: 'masal', name: 'Masal Kitabı', price: 25, icon: '📚', category: 'Kitap' },
    { id: 'sandvic', name: 'Sandviç', price: 15, icon: '🥪', category: 'Gıda' },
    { id: 'muz2', name: 'Yerli Muz', price: 10, icon: '🍌', category: 'Manav' },
    { id: 'cikolata', name: 'Fındıklı Çikolata', price: 14, icon: '🍫', category: 'Atıştırmalık' },
    { id: 'cetvel', name: 'Cetvel Takımı', price: 8, icon: '📐', category: 'Kırtasiye' },
    { id: 'kalemlik', name: 'Renkli Kalemlik', price: 18, icon: '👝', category: 'Kırtasiye' }
  ],
  // 3. Sınıf: 20 - 55 TL ürünler, sepet <= 75 TL
  3: [
    { id: 'resim_def', name: 'Resim Defteri', price: 28, icon: '📒', category: 'Kırtasiye' },
    { id: 'pastel', name: 'Pastel Boya', price: 34, icon: '🖍️', category: 'Kırtasiye' },
    { id: 'bilim_kitap', name: 'Bilim Kitabı', price: 45, icon: '📖', category: 'Kitap' },
    { id: 'araba', name: 'Metal Oyuncak Araba', price: 50, icon: '🚗', category: 'Oyuncak' },
    { id: 'matara', name: 'Termos Matara', price: 55, icon: '🍶', category: 'Yaşam' },
    { id: 'hikaye', name: 'Hikaye Seti', price: 40, icon: '📚', category: 'Kitap' },
    { id: 'zeka', name: 'Zeka Küpü', price: 32, icon: '🧩', category: 'Oyuncak' }
  ],
  // 4. Sınıf: 40 - 120 TL ürünler, sepet <= 150 TL
  4: [
    { id: 'futbol', name: 'Futbol Topu', price: 85, icon: '⚽', category: 'Spor' },
    { id: 'canta', name: 'Sırt Çantası', price: 120, icon: '🎒', category: 'Okul' },
    { id: 'satranc', name: 'Satranç Takımı', price: 95, icon: '♟️', category: 'Oyun' },
    { id: 'kulaklik', name: 'Kulaklık', price: 110, icon: '🎧', category: 'Elektronik' },
    { id: 'lamba', name: 'Masa Lambası', price: 75, icon: '💡', category: 'Yaşam' },
    { id: 'ansiklopedi', name: 'Büyük Ansiklopedi', price: 130, icon: '📚', category: 'Kitap' }
  ]
};

// Türk Lirası Paralarımız (Gerçek Görseller)
interface CurrencyItem {
  id: string;
  value: number; // TL
  label: string;
  type: 'coin' | 'note';
  imgSrc: string;
  sub: string;
}

const ALL_MONEY_ITEMS: CurrencyItem[] = [
  { id: 'coin_25k', value: 0.25, label: '25 Kuruş', type: 'coin', imgSrc: '/paralar/25_kurus_madeni_para.webp', sub: '25 Kr' },
  { id: 'coin_50k', value: 0.5, label: '50 Kuruş', type: 'coin', imgSrc: '/paralar/50_kurus_madeni_para.webp', sub: '50 Kr' },
  { id: 'coin_1tl', value: 1, label: '1 Lira', type: 'coin', imgSrc: '/paralar/1_tl_madeni_para.webp', sub: '1 TL' },
  { id: 'note_5tl', value: 5, label: '5 TL', type: 'note', imgSrc: '/paralar/5_tl_kagit_para.webp', sub: '5 Lira' },
  { id: 'note_10tl', value: 10, label: '10 TL', type: 'note', imgSrc: '/paralar/10_tl_kagit_para.webp', sub: '10 Lira' },
  { id: 'note_20tl', value: 20, label: '20 TL', type: 'note', imgSrc: '/paralar/20_tl_kagit_para.webp', sub: '20 Lira' },
  { id: 'note_50tl', value: 50, label: '50 TL', type: 'note', imgSrc: '/paralar/50_tl_kagit_para.webp', sub: '50 Lira' },
  { id: 'note_100tl', value: 100, label: '100 TL', type: 'note', imgSrc: '/paralar/100_tl_kagit_para.webp', sub: '100 Lira' },
  { id: 'note_200tl', value: 200, label: '200 TL', type: 'note', imgSrc: '/paralar/200_tl_kagit_para.webp', sub: '200 Lira' }
];

// Sınıf seviyesine göre kasada izin verilen paralar (MEB müfredatına tam uyumlu)
const getMoneyItemsForGrade = (g: number): CurrencyItem[] => {
  if (g === 1) {
    // 1. Sınıf: 25 Kr, 50 Kr, 1 TL, 5 TL, 10 TL, 20 TL (50, 100, 200 TL yok)
    return ALL_MONEY_ITEMS.filter(m => m.value <= 20);
  }
  if (g === 2) {
    // 2. Sınıf: En fazla 50 TL (100 ve 200 TL yok)
    return ALL_MONEY_ITEMS.filter(m => m.value <= 50);
  }
  if (g === 3) {
    // 3. Sınıf: En fazla 100 TL (200 TL yok)
    return ALL_MONEY_ITEMS.filter(m => m.value <= 100);
  }
  // 4. Sınıf: Tüm paralar serbest
  return ALL_MONEY_ITEMS;
};

// Müşterinin uzattığı paranın görsel karşılığı
const getCustomerCashVisual = (val: number): { imgSrc: string; label: string; isCoin: boolean } => {
  if (val === 200) return { imgSrc: '/paralar/200_tl_kagit_para.webp', label: '200 TL', isCoin: false };
  if (val === 100) return { imgSrc: '/paralar/100_tl_kagit_para.webp', label: '100 TL', isCoin: false };
  if (val === 50) return { imgSrc: '/paralar/50_tl_kagit_para.webp', label: '50 TL', isCoin: false };
  if (val === 20) return { imgSrc: '/paralar/20_tl_kagit_para.webp', label: '20 TL', isCoin: false };
  if (val === 10) return { imgSrc: '/paralar/10_tl_kagit_para.webp', label: '10 TL', isCoin: false };
  if (val === 5) return { imgSrc: '/paralar/5_tl_kagit_para.webp', label: '5 TL', isCoin: false };
  return { imgSrc: '/paralar/1_tl_madeni_para.webp', label: `${val} TL`, isCoin: true };
};

export const MarketKasasiGame: React.FC<MarketKasasiGameProps> = ({
  onClose,
  onNextActivity,
  playMp3,
  grade = 2,
  students = [],
  selectedStudentId,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal
}) => {
  // Sınıf seviyesi (1, 2, 3, 4)
  const [activeGrade, setActiveGrade] = useState<number>(grade || 2);
  const [mode, setMode] = useState<MarketMode>('musteri');
  const [basket, setBasket] = useState<MarketProduct[]>([]);
  const [givenCash, setGivenCash] = useState<number>(0); // Kasiyer modunda müşterinin uzattığı para
  const [selectedMoney, setSelectedMoney] = useState<{ id: string; value: number; imgSrc: string; type: 'coin' | 'note'; label: string }[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // 10 SORU VE 3 HATA KURALI
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Toplam Sepet Tutarı
  const basketTotal = basket.reduce((acc, p) => acc + p.price, 0);
  // Kasaya Verilen/Seçilen Toplam Para
  const currentTotal = Number(selectedMoney.reduce((acc, m) => acc + m.value, 0).toFixed(2));

  // Hedef Tutar:
  // Müşteri modu: Sepet tutarını tam ödemek
  // Kasiyer modu: Müşterinin verdiği para - sepet tutarı (Para üstü)
  const targetAmount = mode === 'musteri' ? basketTotal : Math.max(0, givenCash - basketTotal);

  // Yeni Soru / Sepet Oluştur
  const generateNewRound = useCallback((currentMode: MarketMode, g: number) => {
    setSelectedMoney([]);
    setFeedback('none');

    const products = GRADE_PRODUCTS[g] || GRADE_PRODUCTS[2];
    // 1. sınıfta 1 ürün, diğer sınıflarda 1 veya 2 ürün
    const itemCount = g === 1 ? (Math.random() > 0.7 ? 2 : 1) : (Math.random() > 0.4 ? 2 : 1);
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const newBasket = shuffled.slice(0, itemCount);
    setBasket(newBasket);

    const total = newBasket.reduce((sum, p) => sum + p.price, 0);

    if (currentMode === 'kasiyer') {
      // Müşterinin vereceği banknot sınıf seviyesine ve toplam fiyata uygun olsun
      let possibleBills: number[] = [];
      if (g === 1) {
        // 1. Sınıf: 5, 10, 20 TL
        possibleBills = [5, 10, 20].filter(b => b > total);
        if (possibleBills.length === 0) possibleBills = [20];
      } else if (g === 2) {
        // 2. Sınıf: 10, 20, 50 TL
        possibleBills = [10, 20, 50].filter(b => b > total);
        if (possibleBills.length === 0) possibleBills = [50];
      } else if (g === 3) {
        // 3. Sınıf: 20, 50, 100 TL
        possibleBills = [20, 50, 100].filter(b => b > total);
        if (possibleBills.length === 0) possibleBills = [100];
      } else {
        // 4. Sınıf: 50, 100, 200 TL
        possibleBills = [50, 100, 200].filter(b => b > total);
        if (possibleBills.length === 0) possibleBills = [200];
      }
      const chosenBill = possibleBills[Math.floor(Math.random() * possibleBills.length)];
      setGivenCash(chosenBill);
    }
  }, []);

  // Oyun ve Sınıf Değişimi
  useEffect(() => {
    generateNewRound(mode, activeGrade);
  }, [mode, activeGrade, generateNewRound]);

  // Sınıf değiştirme
  const handleGradeChange = (newG: number) => {
    if (playMp3) playMp3('/op.mp3');
    setActiveGrade(newG);
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setIsGameOver(false);
  };

  // Oyunu Sıfırla / Baştan Başla
  const handleRestartGame = () => {
    if (playMp3) playMp3('/op.mp3');
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    generateNewRound(mode, activeGrade);
  };

  // Para Ekle (Gerçek Ses ve Görsel ile)
  const handleAddMoney = (item: CurrencyItem) => {
    if (playMp3) {
      if (item.type === 'coin') playMp3('/coin.mp3');
      else playMp3('/para.mp3');
    }
    setSelectedMoney(prev => [
      ...prev,
      {
        id: `${item.id}_${Date.now()}_${Math.random()}`,
        value: item.value,
        imgSrc: item.imgSrc,
        type: item.type,
        label: item.label
      }
    ]);
    setFeedback('none');
  };

  // Para Çıkar (Kasadan geri al)
  const handleRemoveMoney = (index: number) => {
    setSelectedMoney(prev => prev.filter((_, i) => i !== index));
    setFeedback('none');
  };

  // Hepsini Temizle
  const handleClearMoney = () => {
    setSelectedMoney([]);
    setFeedback('none');
  };

  // Kontrol Et & Ödemeyi Tamamla
  const handleConfirm = () => {
    if (isGameOver) return;

    const diff = Math.abs(currentTotal - targetAmount);

    if (diff < 0.01) {
      // Doğru Cevap
      setFeedback('correct');
      setScore(s => s + 15);
      setStreak(st => st + 1);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);

      if (playMp3) playMp3('/alkis.mp3');
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (questionCount >= 10) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          generateNewRound(mode, activeGrade);
        }, 1400);
      }
    } else {
      // Yanlış Cevap
      setFeedback('wrong');
      setStreak(0);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (playMp3) playMp3('/hata.mp3');

      if (newMistakes >= 3) {
        // 3 Hata hakkı doldu
        setTimeout(() => {
          setIsGameOver(true);
        }, 1200);
      } else if (questionCount >= 10) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1200);
      }
    }
  };

  const availableMoneyItems = getMoneyItemsForGrade(activeGrade);
  const customerCashInfo = getCustomerCashVisual(givenCash);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#047857] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn"
    >
      {/* ÇOCUKLARA ÖZEL NEŞELİ MARKET ARKA PLAN PARÇACIKLARI & IŞIKLARI */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 sm:w-96 sm:h-96 bg-yellow-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-16 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-300/35 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-cyan-300/35 rounded-full blur-3xl" />
        {/* Sevimli Market & Para Emojileri */}
        <div className="absolute inset-0 flex flex-wrap justify-around items-center text-3xl sm:text-4xl select-none opacity-25">
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>🛒</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🍎</span>
          <span className="animate-bounce" style={{ animationDuration: '7s' }}>🥖</span>
          <span className="animate-bounce" style={{ animationDuration: '4s' }}>🪙</span>
          <span className="animate-bounce" style={{ animationDuration: '6.5s' }}>🥛</span>
          <span className="animate-bounce" style={{ animationDuration: '5.5s' }}>🍌</span>
          <span className="animate-bounce" style={{ animationDuration: '7.5s' }}>🍫</span>
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>✏️</span>
          <span className="animate-bounce" style={{ animationDuration: '4.5s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🥪</span>
        </div>
      </div>

      {/* ROL / MOD SEÇİMİ, SINIF SEÇİCİ, SORU SAYACI VE CAN BARI */}
      <div className="w-full flex flex-wrap items-center justify-between px-2 sm:px-5 py-2 bg-[#082f49]/90 border-b-2 border-emerald-400/50 gap-2 shrink-0 backdrop-blur-md z-20 shadow-md">
        {/* Sol: Mod Seçimi */}
        <div className="flex items-center gap-1.5 bg-[#0c2a4a]/90 p-1 rounded-xl border border-emerald-400/40 shadow-inner">
          <button
            onClick={() => { setMode('musteri'); setFeedback('none'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'musteri'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-md scale-102 font-black'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Alışverişi Öde (Müşteri)</span>
          </button>
          <button
            onClick={() => { setMode('kasiyer'); setFeedback('none'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'kasiyer'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md scale-102 font-black'
                : 'text-amber-100 hover:text-white hover:bg-amber-800/30'
            }`}
          >
            <Receipt size={14} />
            <span>Para Üstü Ver (Kasiyer)</span>
          </button>
        </div>

        {/* Orta: Sınıf Seviyesi Seçici */}
        <div className="flex items-center gap-1 bg-[#0c2a4a]/90 p-1 rounded-xl border border-amber-400/40 shadow-inner">
          <span className="text-[10px] sm:text-xs font-bold text-amber-300 px-1 hidden md:inline">Sınıf:</span>
          {[1, 2, 3, 4].map(g => (
            <button
              key={g}
              onClick={() => handleGradeChange(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeGrade === g
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {g}. Sınıf
            </button>
          ))}
        </div>

        {/* Sağ: Soru Sayacı (10 Soru), Kalan Can (3 Hata) ve Puan */}
        <div className="flex items-center gap-2">
          {/* Soru Sayacı */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-black">
            <span>Soru:</span>
            <span className="font-mono text-sm text-white">{questionCount}/10</span>
          </div>

          {/* Kalan Can (3 Hata Sınırı) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400/50 text-xs font-black" title="3 Hata Hakkı">
            <span className="text-slate-300 text-[10px] hidden sm:inline">Can:</span>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map(idx => (
                <Heart
                  key={idx}
                  size={14}
                  className={idx < 3 - mistakes ? 'text-rose-400 fill-rose-500' : 'text-slate-600'}
                />
              ))}
            </div>
          </div>

          {/* Skor */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black">
            <Trophy size={14} />
            <span>{score} P</span>
          </div>
        </div>
      </div>

      {/* OYUN BİTTİ / 10 SORU VEYA 3 HATA ÖZET MODALI */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0f172a] via-[#1a2c4e] to-[#0f172a] border-3 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            {mistakes >= 3 ? (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-3xl mb-3 animate-bounce">
                💔
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-3 animate-bounce">
                🏆
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
              {mistakes >= 3 ? '3 Hata Hakkı Doldu!' : 'Tebrikler! 10 Soru Tamamlandı!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5">
              {mistakes >= 3 
                ? 'Biraz daha pratik yaparak yeniden deneyebilirsin.' 
                : 'Market alışverişi ve para hesaplamalarını başarıyla tamamladın!'}
            </p>

            {/* İstatistik Kutusu */}
            <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-700 mb-5">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Doğru</span>
                <span className="font-mono text-xl font-black text-emerald-300">{correctCount}</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-700">
                <span className="text-[10px] text-rose-400 font-bold uppercase">Hata</span>
                <span className="font-mono text-xl font-black text-rose-400">{mistakes}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Toplam Puan</span>
                <span className="font-mono text-xl font-black text-amber-300">{score}</span>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={handleRestartGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw size={16} />
                <span>Yeniden Başla</span>
              </button>
              {onNextActivity && (
                <button
                  onClick={onNextActivity}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <ArrowRight size={16} />
                  <span>Sonraki Etkinlik</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANA OYUN DÜNYASI */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-2 sm:p-4 gap-3 min-h-0 overflow-y-auto">
        {/* SOL: SEPET VE FİŞ BİLGİSİ / SORU ALANI (SORUDAKİ PARALAR BURADA BÜYÜK VE NET) */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#0b3356]/95 border-2 border-emerald-300 rounded-3xl p-3 sm:p-4 shadow-2xl shrink-0 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-400/40">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag size={14} className="text-emerald-300" />
              {activeGrade}. Sınıf Market Sepeti
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-black border border-emerald-400/40">{basket.length} Ürün</span>
          </div>

          {/* Ürün Listesi */}
          <div className="flex flex-col gap-1.5 my-2.5 max-h-40 overflow-y-auto pr-1">
            {basket.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#08223c]/90 border border-emerald-400/40 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl drop-shadow">{p.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                    <span className="text-[10px] text-cyan-200 font-semibold">{p.category}</span>
                  </div>
                </div>
                <span className="font-mono text-base sm:text-lg font-black text-yellow-300 bg-amber-400/20 px-2.5 py-1 rounded-lg border-2 border-amber-300 shadow-sm">
                  {p.price} TL
                </span>
              </div>
            ))}
          </div>

          {/* KASİYER MODUNDA: MÜŞTERİNİN UZATTIĞI PARA (GERÇEK BÜYÜK VE NET GÖRSEL) */}
          {mode === 'kasiyer' && (
            <div className="my-2 p-3 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex flex-col items-center text-center shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-200 uppercase tracking-wide mb-1.5">
                <span>👤</span>
                <span>MÜŞTERİNİN UZATTIĞI PARA</span>
              </div>

              {/* Gerçek Para Görseli - Sınıf seviyesine uygun büyük boyutta */}
              <div className="my-1.5 flex flex-col items-center justify-center">
                {customerCashInfo.isCoin ? (
                  <img
                    src={customerCashInfo.imgSrc}
                    alt={customerCashInfo.label}
                    className="w-18 h-18 sm:w-22 sm:h-22 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)] filter hover:scale-105 transition-transform"
                  />
                ) : (
                  <img
                    src={customerCashInfo.imgSrc}
                    alt={customerCashInfo.label}
                    className="h-18 sm:h-22 md:h-26 w-auto max-w-[220px] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] rounded-md border border-amber-400/40 filter hover:scale-105 transition-transform"
                  />
                )}
                <span className="mt-2 font-mono text-2xl sm:text-3xl font-black text-yellow-300 bg-[#06182c] px-6 py-1.5 rounded-2xl border-3 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse">
                  {givenCash} TL
                </span>
              </div>

              <p className="text-xs text-amber-100 font-semibold mt-1 leading-snug">
                Müşteri size <strong className="text-yellow-300 font-mono text-sm sm:text-base font-black underline">{givenCash} TL</strong> verdi. Sepet tutarı <strong className="text-white font-mono text-sm sm:text-base font-black underline">{basketTotal} TL</strong>. Kaç TL para üstü vermelisin?
              </p>
            </div>
          )}

          {/* Fiyat Özeti & Hedef Kartı */}
          <div className="mt-auto pt-2.5 border-t-2 border-dashed border-emerald-400/40 flex flex-col gap-2 font-sans">
            <div className="flex justify-between items-center text-xs text-cyan-100 font-bold">
              <span>Sepet Tutarı:</span>
              <span className="font-mono text-base sm:text-lg font-black text-white bg-cyan-950 px-3 py-1 rounded-xl border-2 border-cyan-300 shadow">
                {basketTotal} TL
              </span>
            </div>

            {mode === 'kasiyer' && (
              <div className="flex justify-between items-center text-xs sm:text-sm text-amber-200 font-black pt-1.5 border-t border-emerald-400/30">
                <span>Verilecek Para Üstü:</span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-yellow-200 bg-amber-500/40 px-4 py-1 rounded-2xl border-2 border-yellow-300 shadow-lg">
                  {targetAmount} TL
                </span>
              </div>
            )}

            {mode === 'musteri' && (
              <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-200 font-black pt-1.5 border-t border-emerald-400/30">
                <span>Ödenecek Tutar:</span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-100 bg-emerald-500/40 px-4 py-1 rounded-2xl border-2 border-emerald-300 shadow-lg">
                  {targetAmount} TL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ORTA & SAĞ: KASA VE PARALARI SEÇME ALANI */}
        <div className="flex-1 w-full flex flex-col gap-2.5 min-h-0">
          {/* KASA ÖDEME MASASI (SEÇİLEN PARALAR) */}
          <div className="w-full bg-[#0b3356]/95 border-3 border-amber-300 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col min-h-[140px] justify-between backdrop-blur-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-300/40">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Coins size={14} />
                {mode === 'musteri' ? 'Kasaya Bırakılan Paralar' : 'Müşteriye Verilen Para Üstü'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-100 font-bold">
                  Toplam: <strong className="font-mono text-xl sm:text-2xl font-black text-yellow-300 bg-amber-400/30 px-3.5 py-1 rounded-xl border-2 border-amber-300 shadow-md">{currentTotal} TL</strong>
                </span>
                {selectedMoney.length > 0 && (
                  <button
                    onClick={handleClearMoney}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-[10px] font-black border border-rose-400 cursor-pointer transition-all shadow"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Masadaki Paralar (Büyük, Canlı, Tıklanabilir) */}
            <div className="flex-1 flex flex-wrap items-center gap-2.5 py-2 overflow-y-auto content-start min-h-[65px]">
              {selectedMoney.length === 0 ? (
                <div className="w-full text-center text-cyan-200/90 text-xs py-4 font-bold flex flex-col items-center justify-center gap-1">
                  <span>👇 Aşağıdaki paralara dokunarak masaya ekleyin.</span>
                  <span className="text-[11px] text-amber-200 font-semibold">(Geri kaldırmak için paraya tekrar dokunabilirsiniz)</span>
                </div>
              ) : (
                selectedMoney.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => handleRemoveMoney(idx)}
                    className="cursor-pointer hover:scale-105 active:scale-95 transition-all p-1.5 rounded-2xl bg-[#06182c]/90 border border-cyan-400/50 hover:border-rose-400 hover:ring-2 hover:ring-rose-400 group relative shadow-md"
                    title={`${m.label} - Geri almak için tıkla`}
                  >
                    {m.type === 'coin' ? (
                      <div className="relative flex flex-col items-center">
                        <img 
                          src={m.imgSrc} 
                          alt={m.label} 
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" 
                        />
                        <span className="font-mono text-xs sm:text-sm font-black text-yellow-300 bg-slate-950/90 px-2 py-0.5 rounded-full border border-amber-300/80 shadow mt-0.5">
                          {m.value < 1 ? `${m.value * 100} Kr` : `${m.value} TL`}
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center">
                        <img 
                          src={m.imgSrc} 
                          alt={m.label} 
                          className="h-11 sm:h-14 w-auto max-w-[120px] sm:max-w-[140px] object-contain rounded filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" 
                        />
                        <span className="font-mono text-xs sm:text-sm font-black text-emerald-300 bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-emerald-300/80 shadow mt-0.5">{m.value} TL</span>
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Kontrol Butonu */}
            <div className="pt-2 border-t border-amber-300/40 flex items-center gap-3">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 border-2 border-white shadow-xl hover:brightness-110 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2`}
              >
                <CheckCircle2 size={20} />
                <span>
                  {mode === 'musteri' ? 'ÖDEMEYİ TAMAMLA' : 'PARA ÜSTÜNÜ VER'}
                </span>
                <span className="font-mono text-lg sm:text-2xl font-black bg-slate-950/20 px-3 py-0.5 rounded-xl border border-slate-950/30 shadow-inner">
                  ({currentTotal} TL)
                </span>
              </button>
            </div>
          </div>

          {/* CÜZDAN / KASA ÇEKMECESİ: GERÇEK PARALARIMIZ (SINIF SEVİYESİNE UYGUN) */}
          <div className="w-full bg-[#08223c]/95 border-2 border-cyan-400/80 rounded-3xl p-3 sm:p-4 flex flex-col gap-2.5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-cyan-400/30 pb-1.5">
              <span className="text-[11px] sm:text-xs font-black uppercase text-cyan-200 tracking-wider flex items-center gap-1.5">
                <Coins size={14} className="text-amber-300" />
                {activeGrade}. SINIF PARALARIMIZ (Dokunarak Kasaya Ekle)
              </span>
              <span className="text-[10px] text-cyan-200 font-bold bg-cyan-900/50 px-2 py-0.5 rounded-full border border-cyan-400/30">Tıklayarak kasaya ekle</span>
            </div>

            {/* Madeni Paralar */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wide">Madeni Paralar</span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {availableMoneyItems.filter(i => i.type === 'coin').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddMoney(item)}
                    className="p-1 sm:p-1.5 rounded-2xl bg-[#0b3356] border-2 border-amber-300 hover:border-white shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                    title={`${item.label} ekle`}
                  >
                    <img 
                      src={item.imgSrc} 
                      alt={item.label} 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full filter drop-shadow group-hover:brightness-110" 
                    />
                    <div className="text-left pr-2">
                      <div className="font-mono text-base sm:text-lg font-black text-yellow-300 leading-tight">{item.sub}</div>
                      <div className="text-[9px] text-cyan-200 font-bold leading-none">{item.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Kağıt Banknotlar (Sınıf seviyesine göre filtrelenmiş) */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-cyan-200 uppercase tracking-wide">Kağıt Banknotlar</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availableMoneyItems.filter(i => i.type === 'note').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddMoney(item)}
                    className="p-1.5 sm:p-2 rounded-xl bg-[#0b3356] border-2 border-cyan-400 hover:border-white shadow-md flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                    title={`${item.label} ekle`}
                  >
                    <img 
                      src={item.imgSrc} 
                      alt={item.label} 
                      className="w-full h-11 sm:h-13 object-contain rounded filter drop-shadow group-hover:brightness-110" 
                    />
                    <div className="text-center mt-1">
                      <span className="font-mono text-xs sm:text-sm font-black text-yellow-300 bg-cyan-950/90 px-2.5 py-0.5 rounded-md border border-cyan-300/60 leading-tight block">
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GERİ BİLDİRİM BİLGİSİ */}
          {feedback === 'correct' && (
            <div className="w-full py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-center font-black text-sm animate-bounce">
              🎉 TEBRİKLER! Para tam doğru sayıldı! (+15 Puan)
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="w-full py-2 rounded-2xl bg-red-500/20 border border-red-400 text-red-300 text-center font-bold text-xs">
              {currentTotal > targetAmount
                ? `Fazla para verdin! (${currentTotal} TL yerine ${targetAmount} TL olmalı)`
                : `Eksik para verdin! (${currentTotal} TL verdin, ${targetAmount} TL olmalı)`}
            </div>
          )}
        </div>
      </div>

      {/* EN ALTA YASLANMIŞ ÖĞRENCİ LİSTESİ DOCKU (SINIF LİSTESİ SEÇİLEBİLİR) */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-2 sm:px-4 py-1 bg-slate-950/95 border-t border-slate-800">
          <StudentAvatarDock
            students={students}
            currentGrade={activeGrade}
            playerCount={1}
            selectedStudentIds={[selectedStudentId || null]}
            onSelectStudentForPlayer={(_pIdx, studentId) => {
              onSelectStudent?.(studentId);
              onSelectStudentForPlayer?.(0, studentId);
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}
    </div>
  );
};
