import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PieChart,
  CheckCircle2,
  RotateCcw,
  X,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Heart
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface KesirDuvariPizzaGameProps {
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

type KesirSubTab = 'pizza' | 'duvar';

export const KesirDuvariPizzaGame: React.FC<KesirDuvariPizzaGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  grade = 2,
  students = [],
  selectedStudentId,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal
}) => {
  const [subTab, setSubTab] = useState<KesirSubTab>('pizza');

  // Pizza Atölyesi Durumu
  // Payda (Denominator): 2, 4, 6 veya 8 eşit parça
  const [totalSlices, setTotalSlices] = useState<number>(4);
  // Seçilen / Yenen dilimler (Indexes)
  const [selectedSlices, setSelectedSlices] = useState<number[]>([0, 1]);

  // Görev Sorusunda Hedef Kesir
  const [targetDenominator, setTargetDenominator] = useState<number>(4);
  const [targetNumerator, setTargetNumerator] = useState<number>(3);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // 10 SORU VE 3 HATA KURALI
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Duvar Modu için Aktif Katmanlar
  const [activeWallBars, setActiveWallBars] = useState<Record<string, boolean>>({
    '1/1': true,
    '1/2': true,
    '1/4': true,
    '1/8': false
  });

  // Yeni Pizza Görevi Oluştur
  const generateNewTask = useCallback(() => {
    const denoms = grade === 1 ? [2] : grade === 2 ? [2, 4] : [2, 3, 4, 6, 8];
    const denom = denoms[Math.floor(Math.random() * denoms.length)];
    const num = 1 + Math.floor(Math.random() * (denom - 1));

    setTargetDenominator(denom);
    setTargetNumerator(num);
    setTotalSlices(denom);
    setSelectedSlices([]);
    setFeedback('none');
  }, [grade]);

  useEffect(() => {
    generateNewTask();
  }, [generateNewTask]);

  // Yeniden Başla
  const handleRestartGame = () => {
    if (playMp3) playMp3('/op.mp3');
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    generateNewTask();
  };

  // Dilim Tıklama (Aç / Kapa)
  const toggleSlice = (idx: number) => {
    if (playMp3) playMp3('/op.mp3');
    setSelectedSlices(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
    setFeedback('none');
  };

  // Kontrol Et
  const handleCheck = () => {
    if (isGameOver) return;
    const isDenomMatch = totalSlices === targetDenominator;
    const isNumMatch = selectedSlices.length === targetNumerator;

    if (isDenomMatch && isNumMatch) {
      setFeedback('correct');
      setScore(s => s + 15);
      setStreak(st => st + 1);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      if (playMp3) playMp3('/alkis.mp3');

      try {
        confetti({ particleCount: 65, spread: 65, origin: { y: 0.6 } });
      } catch {}

      if (questionCount >= 10) {
        setTimeout(() => setIsGameOver(true), 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          generateNewTask();
        }, 1500);
      }
    } else {
      setFeedback('wrong');
      setStreak(0);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (playMp3) playMp3('/hata.mp3');

      if (newMistakes >= 3 || questionCount >= 10) {
        setTimeout(() => setIsGameOver(true), 1200);
      }
    }
  };

  // Dilim SVG Yolu Üretimi (Daire Dilimi)
  const renderSlicePath = (index: number, total: number) => {
    const sliceAngle = 360 / total;
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const r = 90; // Yarıçap
    const x1 = Math.cos(startAngle) * r;
    const y1 = Math.sin(startAngle) * r;
    const x2 = Math.cos(endAngle) * r;
    const y2 = Math.sin(endAngle) * r;
    const largeArc = sliceAngle > 180 ? 1 : 0;

    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#d97706] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn"
    >
      {/* ÇOCUKLAR İÇİN PİZZA VE ŞEF EMOJİLERİ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex justify-between items-center text-3xl sm:text-4xl select-none px-4">
        <div className="flex flex-col gap-12 sm:gap-16">
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🍕</span>
          <span className="animate-bounce" style={{ animationDuration: '7s' }}>🧀</span>
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>🍅</span>
          <span className="animate-bounce" style={{ animationDuration: '4.5s' }}>🍄</span>
        </div>
        <div className="flex flex-col gap-14 sm:gap-20">
          <span className="animate-bounce" style={{ animationDuration: '6.5s' }}>👩‍🍳</span>
          <span className="animate-bounce" style={{ animationDuration: '5.5s' }}>🥖</span>
          <span className="animate-bounce" style={{ animationDuration: '7.5s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🥧</span>
        </div>
      </div>

      {/* ÜST GEZİNME VE SEKME GEÇİŞİ */}
      <div className="w-full flex flex-wrap items-center justify-between px-2 sm:px-5 py-2 bg-[#7c2d12]/95 border-b-2 border-amber-300/40 gap-2 shrink-0 backdrop-blur-md z-20 shadow-md">
        {/* Sol: Gezinme Butonları (Önceki, Geri, Ana Sayfa, Sonraki) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-amber-200 hover:text-white flex items-center justify-center border border-amber-400/40 transition cursor-pointer shadow-sm"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-white flex items-center justify-center border border-amber-400/40 transition cursor-pointer shadow-sm"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400/60 transition cursor-pointer shadow-sm"
              title="Ana Sayfaya Dön"
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-amber-200 hover:text-white flex items-center justify-center border border-amber-400/40 transition cursor-pointer shadow-sm"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-[#431407]/90 p-1 rounded-xl border border-amber-400/50 shadow-inner">
          <button
            onClick={() => setSubTab('pizza')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'pizza'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-300 text-slate-950 shadow-md scale-102 font-black'
                : 'text-amber-100 hover:text-white'
            }`}
          >
            🍕 Pizza Dilimleme
          </button>
          <button
            onClick={() => setSubTab('duvar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'duvar'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 shadow-md scale-102 font-black'
                : 'text-amber-100 hover:text-white'
            }`}
          >
            🧱 Kesir Duvarı
          </button>
        </div>

        {/* Soru Sayacı (10 Soru), Kalan Can (3 Hata) ve Puan */}
        <div className="flex items-center gap-2">
          {/* Soru Sayacı */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/25 border border-amber-300 text-amber-200 text-xs font-black shadow">
            <span>Soru:</span>
            <span className="font-mono text-sm text-white">{questionCount}/10</span>
          </div>

          {/* Kalan Can (3 Hata Sınırı) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/25 border border-rose-300 text-xs font-black shadow" title="3 Hata Hakkı">
            <span className="text-rose-200 text-[10px] hidden sm:inline">Can:</span>
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
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-300/25 border border-amber-300 text-amber-200 text-xs font-black shadow">
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
                : 'Pizza dilimleme ve kesirleri modellemeyi başarıyla tamamladın!'}
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

      {/* ANA İÇERİK */}
      {subTab === 'pizza' ? (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-3 sm:p-6 gap-6 min-h-0 overflow-y-auto">
          {/* SOL: GÖRSEL PİZZA / PASTA */}
          <div className="relative flex flex-col items-center justify-center bg-[#7c2d12]/90 border-3 border-amber-300 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-br from-[#b45309] via-[#78350f] to-[#451a03] border-4 border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.45)] flex items-center justify-center">
              {/* Ahşap Servis Tepsisi Kenarı */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-300/60 pointer-events-none" />

              <svg viewBox="-100 -100 200 200" className="w-full h-full drop-shadow-lg cursor-pointer">
                {Array.from({ length: totalSlices }).map((_, idx) => {
                  const isSelected = selectedSlices.includes(idx);
                  return (
                    <g
                      key={idx}
                      onClick={() => toggleSlice(idx)}
                      className="transition-transform duration-200 hover:opacity-90"
                    >
                      <path
                        d={renderSlicePath(idx, totalSlices)}
                        fill={isSelected ? '#f59e0b' : '#334155'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-colors duration-200"
                      />
                      {/* Üzerindeki Malzemeler (Mantar, Zeytin, Sucuk) */}
                      {isSelected && (
                        <circle
                          cx={Math.cos(((idx + 0.5) * (360 / totalSlices) - 90) * (Math.PI / 180)) * 50}
                          cy={Math.sin(((idx + 0.5) * (360 / totalSlices) - 90) * (Math.PI / 180)) * 50}
                          r="6"
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Dilimleme Çizgileri */}
              <div className="absolute w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 text-sm font-black pointer-events-none">
                🍕
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-200 font-black bg-[#431407]/80 px-3 py-1 rounded-full border border-amber-300/40">
              Dilimlere dokunarak tabağa al veya geri bırak!
            </p>
          </div>

          {/* SAĞ: KESİR KARTI & GÖREV KONTROLÜ */}
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-4">
            {/* HEDEF GÖREV KUTUSU */}
            <div className="w-full bg-[#7c2d12]/95 border-3 border-yellow-300 rounded-3xl p-4 shadow-2xl flex flex-col items-center text-center gap-2 backdrop-blur-md">
              <span className="text-xs font-black text-yellow-300 uppercase tracking-widest">
                MÜŞTERİ SİPARİŞİ
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Pizzanın <span className="text-yellow-300 font-mono text-2xl font-black bg-black/30 px-2.5 py-0.5 rounded-lg border border-amber-300">{targetNumerator} / {targetDenominator}</span>'ini tabağa koy!
              </h3>
              <p className="text-xs text-amber-100 font-semibold">
                ({targetDenominator === 2 && 'Yarım Pizza'}
                {targetDenominator === 4 && (targetNumerator === 1 ? 'Çeyrek Pizza' : `${targetNumerator} Çeyrek Pizza`)}
                {targetDenominator > 4 && `${targetDenominator} eşit parçadan ${targetNumerator} tanesini seç`})
              </p>

              {/* CANLI KESİR GÖSTERGESİ (PAY / PAYDA KARTI) */}
              <div className="my-2 p-3 rounded-2xl bg-[#431407] border-2 border-amber-300/60 flex items-center justify-center gap-4 shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-3xl font-black text-amber-300">
                    {selectedSlices.length}
                  </span>
                  <div className="w-12 h-1 bg-white rounded-full my-0.5" />
                  <span className="font-mono text-3xl font-black text-cyan-300">
                    {totalSlices}
                  </span>
                </div>
                <div className="text-left text-xs font-bold leading-tight">
                  <p className="text-amber-300 font-black">▲ PAY: Seçilen {selectedSlices.length} dilim</p>
                  <p className="text-cyan-300 font-black mt-1">▼ PAYDA: Toplam {totalSlices} dilim</p>
                </div>
              </div>

              {/* Dilim Sayısı Seçimi (Kaça Bölelim?) */}
              <div className="w-full flex items-center justify-center gap-1.5 pt-2 border-t border-amber-400/40 text-xs flex-wrap">
                <span className="text-amber-200 text-xs font-black">Böl:</span>
                {[2, 4, 6, 8].map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setTotalSlices(d);
                      setSelectedSlices([]);
                    }}
                    className={`px-3 py-1 rounded-xl font-black border transition-all cursor-pointer shadow ${
                      totalSlices === d
                        ? 'bg-gradient-to-r from-amber-300 to-yellow-300 text-slate-950 border-white scale-105'
                        : 'bg-[#431407] text-amber-200 border-amber-400/40 hover:border-white'
                    }`}
                  >
                    {d} Parça {d === 2 && '(Yarım)'} {d === 4 && '(Çeyrek)'}
                  </button>
                ))}
              </div>

              {/* Kontrol Et Butonu */}
              <button
                onClick={handleCheck}
                className="w-full mt-2 py-3 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 border-2 border-white shadow-xl hover:brightness-110 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>SİPARİŞİ KONTROL ET</span>
              </button>

              {/* Geri Bildirim */}
              {feedback === 'correct' && (
                <div className="w-full py-2 rounded-xl bg-emerald-500/25 border-2 border-emerald-300 text-emerald-200 text-center font-black text-sm animate-bounce shadow">
                  🎉 HARİKA! Doğru kesir miktarını seçtin! (+15 Puan)
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="w-full py-2 rounded-xl bg-rose-500/25 border-2 border-rose-300 text-rose-200 text-center font-bold text-xs shadow">
                  ❌ Dilim sayısı uyuşmuyor. Lütfen {targetNumerator}/{targetDenominator} olacak şekilde tekrar dene!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* İNTERAKTİF KESİR DUVARI (FRACTION WALL) */
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 gap-3 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto">
          <div className="text-center mb-1">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
              <Layers className="w-5 h-5 text-yellow-300" />
              Görsel Kesir Duvarı (Denk Kesirleri Keşfet)
            </h3>
            <p className="text-xs text-amber-100 font-semibold">
              Aynı hizada biten kesirler birbirine eşittir! Örneğin: 1/2 = 2/4 = 4/8
            </p>
          </div>

          <div className="w-full bg-[#7c2d12]/95 border-3 border-amber-300 rounded-3xl p-4 shadow-2xl flex flex-col gap-2.5 backdrop-blur-md">
            {/* 1 BÜTÜN */}
            <div className="w-full">
              <span className="text-[10px] text-amber-200 font-bold mb-0.5 block">1 Bütün</span>
              <div className="w-full h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 border-2 border-white flex items-center justify-center font-black text-white shadow">
                1 Tam (Bütün)
              </div>
            </div>

            {/* 2 ADET 1/2 (YARIM) */}
            <div className="w-full">
              <span className="text-[10px] text-cyan-200 font-bold mb-0.5 block">2 Yarım (1/2)</span>
              <div className="w-full grid grid-cols-2 gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-white flex items-center justify-center font-black text-white shadow">
                    1 / 2 (Yarım)
                  </div>
                ))}
              </div>
            </div>

            {/* 4 ADET 1/4 (ÇEYREK) */}
            <div className="w-full">
              <span className="text-[10px] text-amber-200 font-bold mb-0.5 block">4 Çeyrek (1/4)</span>
              <div className="w-full grid grid-cols-4 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 border-2 border-white flex items-center justify-center font-black text-slate-950 text-xs shadow">
                    1 / 4 (Çeyrek)
                  </div>
                ))}
              </div>
            </div>

            {/* 8 ADET 1/8 */}
            <div className="w-full">
              <span className="text-[10px] text-emerald-200 font-bold mb-0.5 block">8 Parça (1/8)</span>
              <div className="w-full grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-white flex items-center justify-center font-black text-white text-[11px] shadow">
                    1 / 8
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EN ALTA YASLANMIŞ ÖĞRENCİ LİSTESİ DOCKU */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-2 sm:px-4 py-1 bg-slate-950/95 border-t border-slate-800">
          <StudentAvatarDock
            students={students}
            currentGrade={grade || 2}
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
