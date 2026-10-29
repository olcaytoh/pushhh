import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  HelpCircle,
  Volume2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Heart
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface SaatZamanActivityProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
  initialMode?: 'tam' | 'yarim' | 'ceyrek' | 'hepsi';
  grade?: 1 | 2 | 3 | 4;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, id: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
}

type ModeFilter = 'tam' | 'yarim' | 'ceyrek' | 'hepsi';
type GameTab = 'ayarla' | 'oku' | 'kesfet';

export const SaatZamanActivity: React.FC<SaatZamanActivityProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  initialMode = 'hepsi',
  grade = 2,
  students = [],
  selectedStudentId,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal
}) => {
  const [filterMode, setFilterMode] = useState<ModeFilter>(initialMode);
  const [gameTab, setGameTab] = useState<GameTab>('ayarla');

  // Saat durumu: Saat (1-12) ve Dakika (0-59)
  const [currentHour, setCurrentHour] = useState<number>(3);
  const [currentMinute, setCurrentMinute] = useState<number>(0);

  // Görev Modu (Hedef Zaman)
  const [targetHour, setTargetHour] = useState<number>(3);
  const [targetMinute, setTargetMinute] = useState<number>(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // 10 SORU VE 3 HATA KURALI
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Okuma Modu (Şıklar)
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 12h / 24h formatı (Öğleden sonra modu)
  const [isAfternoon, setIsAfternoon] = useState<boolean>(false);

  const clockRef = useRef<HTMLDivElement>(null);
  const isDraggingMinute = useRef(false);
  const isDraggingHour = useRef(false);

  // Rastgele Hedef Zaman Üret
  const generateNewQuestion = useCallback((mode: ModeFilter) => {
    let m = 0;
    if (mode === 'tam') {
      m = 0;
    } else if (mode === 'yarim') {
      m = 30;
    } else if (mode === 'ceyrek') {
      m = Math.random() > 0.5 ? 15 : 45;
    } else {
      // hepsi
      const pool = [0, 15, 30, 45, 10, 20, 40, 50];
      m = pool[Math.floor(Math.random() * pool.length)];
    }

    const h = 1 + Math.floor(Math.random() * 12);
    setTargetHour(h);
    setTargetMinute(m);
    setFeedback('none');
    setSelectedOption(null);

    // Okuma modu için şıklar
    const correctStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const wrongList: string[] = [];
    while (wrongList.length < 3) {
      const wh = 1 + Math.floor(Math.random() * 12);
      let wm = 0;
      if (mode === 'tam') wm = 0;
      else if (mode === 'yarim') wm = 30;
      else if (mode === 'ceyrek') wm = Math.random() > 0.5 ? 15 : 45;
      else wm = [0, 15, 30, 45, 10, 20][Math.floor(Math.random() * 6)];

      const wStr = `${String(wh).padStart(2, '0')}:${String(wm).padStart(2, '0')}`;
      if (wStr !== correctStr && !wrongList.includes(wStr)) {
        wrongList.push(wStr);
      }
    }
    const all = [correctStr, ...wrongList].sort(() => Math.random() - 0.5);
    setOptions(all);

    // Saat ibrelerini rastgele farklı bir konuma başlat (Ayarla modunda)
    if (gameTab === 'ayarla') {
      let initH = 1 + Math.floor(Math.random() * 12);
      if (initH === h) initH = (h % 12) + 1;
      setCurrentHour(initH);
      setCurrentMinute(0);
    } else {
      setCurrentHour(h);
      setCurrentMinute(m);
    }
  }, [gameTab]);

  useEffect(() => {
    generateNewQuestion(filterMode);
  }, [filterMode, gameTab, generateNewQuestion]);

  // Yelkovan ve Akrep Açıları
  // Yelkovan: 0-59 dakika -> 0° - 354°
  const minuteAngle = currentMinute * 6;
  // Akrep: 1-12 saat + dakikaya göre kayma -> 0.5° her dakika
  const hourAngle = ((currentHour % 12) + currentMinute / 60) * 30;

  // Türkçe Saat Okunuşu Açıklaması
  const getTurkishTimeDescription = (h: number, m: number, afternoon: boolean) => {
    const displayHour = afternoon ? (h === 12 ? 12 : h + 12) : h;
    const hourWords = [
      '', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı',
      'yedi', 'sekiz', 'dokuz', 'on', 'on bir', 'on iki'
    ];
    const nextHour = h === 12 ? 1 : h + 1;

    if (m === 0) {
      return `Saat tam ${hourWords[h]}`;
    }
    if (m === 30) {
      return `Saat ${hourWords[h]} buçuk`;
    }
    if (m === 15) {
      return `Saat ${hourWords[h]}'i çeyrek geçiyor`;
    }
    if (m === 45) {
      return `Saat ${hourWords[nextHour]}'e çeyrek var`;
    }
    if (m < 30) {
      return `Saat ${hourWords[h]}'i ${m} geçiyor`;
    }
    return `Saat ${hourWords[nextHour]}'e ${60 - m} var`;
  };

  // Saat Dokunmatik / Sürükleme Hesaplaması
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!clockRef.current || (!isDraggingMinute.current && !isDraggingHour.current)) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Açı hesabı (12 saati yukarısı 0 derece olacak şekilde)
    let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (theta < 0) theta += 360;

    if (isDraggingMinute.current) {
      // 5'er dakika veya 15'er dakikaya yapışma (snap)
      let rawMin = Math.round(theta / 6) % 60;
      if (filterMode === 'tam') {
        rawMin = 0;
      } else if (filterMode === 'yarim') {
        rawMin = rawMin >= 15 && rawMin < 45 ? 30 : 0;
      } else if (filterMode === 'ceyrek') {
        const snaps = [0, 15, 30, 45];
        rawMin = snaps.reduce((prev, curr) =>
          Math.abs(curr - rawMin) < Math.abs(prev - rawMin) ? curr : prev
        );
      }
      setCurrentMinute(rawMin);
    } else if (isDraggingHour.current) {
      let rawHour = Math.round(theta / 30);
      if (rawHour === 0) rawHour = 12;
      setCurrentHour(rawHour);
    }
  }, [filterMode]);

  const handlePointerUp = useCallback(() => {
    isDraggingMinute.current = false;
    isDraggingHour.current = false;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (target: 'minute' | 'hour') => {
    if (target === 'minute') isDraggingMinute.current = true;
    else isDraggingHour.current = true;

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  // Butonla Dakika/Saat Değiştir
  const adjustMinute = (delta: number) => {
    setCurrentMinute(prev => {
      let next = (prev + delta) % 60;
      if (next < 0) next += 60;
      return next;
    });
  };

  const adjustHour = (delta: number) => {
    setCurrentHour(prev => {
      let next = ((prev - 1 + delta) % 12 + 12) % 12 + 1;
      return next;
    });
  };

  // Yeniden Başla
  const handleRestartGame = () => {
    if (playMp3) playMp3('/op.mp3');
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    generateNewQuestion(filterMode);
  };

  // Ayarla Modunda Kontrol Et
  const handleCheckSetTime = () => {
    if (isGameOver) return;
    const isHourMatch = currentHour === targetHour;
    const isMinuteMatch = currentMinute === targetMinute;

    if (isHourMatch && isMinuteMatch) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(st => st + 1);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      if (playMp3) playMp3('/alkis.mp3');

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {}

      if (questionCount >= 10) {
        setTimeout(() => setIsGameOver(true), 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          generateNewQuestion(filterMode);
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

  // Okuma Modunda Şık Seçimi
  const handleSelectOption = (opt: string) => {
    if (isGameOver) return;
    setSelectedOption(opt);
    const targetStr = `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`;

    if (opt === targetStr) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(st => st + 1);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      if (playMp3) playMp3('/alkis.mp3');

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {}

      if (questionCount >= 10) {
        setTimeout(() => setIsGameOver(true), 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          generateNewQuestion(filterMode);
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

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] bg-gradient-to-br from-[#0284c7] via-[#2563eb] to-[#7c3aed] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn"
    >
      {/* ÇOCUKLAR İÇİN NEŞELİ UÇAN ZAMAN VE GÖKYÜZÜ İKONLARI */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex justify-between items-center text-3xl sm:text-4xl select-none px-4">
        <div className="flex flex-col gap-12 sm:gap-16">
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>☀️</span>
          <span className="animate-bounce" style={{ animationDuration: '7s' }}>⏰</span>
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>☁️</span>
          <span className="animate-bounce" style={{ animationDuration: '4.5s' }}>⭐</span>
        </div>
        <div className="flex flex-col gap-14 sm:gap-20">
          <span className="animate-bounce" style={{ animationDuration: '6.5s' }}>🕒</span>
          <span className="animate-bounce" style={{ animationDuration: '5.5s' }}>🌈</span>
          <span className="animate-bounce" style={{ animationDuration: '7.5s' }}>✨</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🎈</span>
        </div>
      </div>

      {/* MOD VE FİLTRE ÇUBUĞU */}
      <div className="w-full flex flex-wrap items-center justify-between px-2 sm:px-5 py-2 bg-[#0c2a4a]/95 border-b-2 border-cyan-300/40 gap-2 shrink-0 backdrop-blur-md z-20 shadow-md">
        {/* Sol: Gezinme Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition cursor-pointer shadow-sm"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-white flex items-center justify-center border border-cyan-400/40 transition cursor-pointer shadow-sm"
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition cursor-pointer shadow-sm"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Oyun Modu Sekmeleri */}
        <div className="flex items-center gap-1 bg-[#06182c]/80 p-1 rounded-xl border border-cyan-400/40 shadow-inner">
          <button
            onClick={() => setGameTab('ayarla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              gameTab === 'ayarla'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md font-black scale-102'
                : 'text-cyan-100 hover:text-white'
            }`}
          >
            🎯 Saati Ayarla
          </button>
          <button
            onClick={() => setGameTab('oku')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              gameTab === 'oku'
                ? 'bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 shadow-md font-black scale-102'
                : 'text-cyan-100 hover:text-white'
            }`}
          >
            📖 Saat Kaç?
          </button>
          <button
            onClick={() => setGameTab('kesfet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              gameTab === 'kesfet'
                ? 'bg-gradient-to-r from-purple-400 to-pink-300 text-slate-950 shadow-md font-black scale-102'
                : 'text-cyan-100 hover:text-white'
            }`}
          >
            🔬 Serbest Keşfet
          </button>
        </div>

        {/* Zaman Tipi Filtreleri (Tam, Yarım, Çeyrek, Hepsi) */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="text-yellow-300 mr-1 hidden sm:inline font-black">Konu:</span>
          {(['tam', 'yarim', 'ceyrek', 'hepsi'] as ModeFilter[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterMode === mode
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-white font-black shadow-md scale-105'
                  : 'bg-[#08223c]/90 text-cyan-100 border-cyan-400/40 hover:border-yellow-300'
              }`}
            >
              {mode === 'tam' && '🕒 Tam'}
              {mode === 'yarim' && '🕧 Yarım'}
              {mode === 'ceyrek' && '🕒 Çeyrek'}
              {mode === 'hepsi' && '🎲 Hepsi'}
            </button>
          ))}
        </div>

        {/* Soru Sayacı (10 Soru), Kalan Can (3 Hata) ve Puan */}
        <div className="flex items-center gap-2">
          {/* Soru Sayacı */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-400/20 border border-cyan-300 text-cyan-200 text-xs font-black shadow">
            <span>Soru:</span>
            <span className="font-mono text-sm text-white">{questionCount}/10</span>
          </div>

          {/* Kalan Can (3 Hata Sınırı) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400 text-xs font-black shadow" title="3 Hata Hakkı">
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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-300 text-amber-300 text-xs font-black shadow">
            <Trophy size={13} />
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
                : 'Saat okuma ve ayarlama görevlerini başarıyla tamamladın!'}
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

      {/* ANA OYUN ALANI */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-3 sm:p-6 gap-6 min-h-0 overflow-y-auto">
        {/* SOL: BÜYÜK İNTERAKTİF ANALOG SAAT */}
        <div className="relative flex flex-col items-center justify-center shrink-0 bg-[#0b3356]/95 border-3 border-amber-300 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div
            ref={clockRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-slate-100 via-white to-slate-200 border-[10px] sm:border-[14px] border-[#08223c] shadow-[0_0_35px_rgba(6,182,212,0.4),inset_0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center select-none"
          >
            {/* Altın Çerçeve Halkası */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 pointer-events-none" />

            {/* Dakika Çentikleri (60 adet) */}
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 flex justify-center pointer-events-none"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div
                  className={`w-0.5 rounded-full ${
                    i % 5 === 0 ? 'h-3.5 bg-slate-800 w-1' : 'h-1.5 bg-slate-400/80'
                  }`}
                />
              </div>
            ))}

            {/* 1 - 12 Sayıları */}
            {Array.from({ length: 12 }).map((_, i) => {
              const num = i + 1;
              const angle = (num * 30 * Math.PI) / 180;
              const r = 40; // Yarıçap yüzdesi
              const left = 50 + r * Math.sin(angle);
              const top = 50 - r * Math.cos(angle);

              return (
                <div
                  key={num}
                  className="absolute text-slate-900 font-black text-lg sm:text-2xl md:text-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-sm font-sans"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {num}
                </div>
              );
            })}

            {/* AKREP (Kısa, Mavi/Lacivert) */}
            <div
              className="absolute w-2.5 sm:w-3.5 h-20 sm:h-24 md:h-28 rounded-full bg-gradient-to-t from-blue-700 via-sky-600 to-cyan-400 shadow-[0_3px_8px_rgba(0,0,0,0.5)] z-20 cursor-grab active:cursor-grabbing origin-bottom transition-transform duration-100 ease-out flex flex-col items-center justify-start border border-white"
              style={{
                bottom: '50%',
                transform: `rotate(${hourAngle}deg)`
              }}
              onMouseDown={() => startDrag('hour')}
              onTouchStart={() => startDrag('hour')}
              title="Akrepi çevirmek için sürükle"
            >
              <div className="w-4 h-4 rounded-full bg-white -mt-1 shadow" />
            </div>

            {/* YELKOVAN (Uzun, Kırmızı/Turuncu) */}
            <div
              className="absolute w-2 sm:w-2.5 h-28 sm:h-36 md:h-40 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_3px_8px_rgba(0,0,0,0.5)] z-20 cursor-grab active:cursor-grabbing origin-bottom transition-transform duration-100 ease-out flex flex-col items-center justify-start border border-white"
              style={{
                bottom: '50%',
                transform: `rotate(${minuteAngle}deg)`
              }}
              onMouseDown={() => startDrag('minute')}
              onTouchStart={() => startDrag('minute')}
              title="Yelkovanı çevirmek için sürükle"
            >
              <div className="w-3 h-3 rounded-full bg-white -mt-1 shadow" />
            </div>

            {/* Merkez Göbek Altın Rozeti */}
            <div className="absolute z-30 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-white shadow-lg pointer-events-none" />
          </div>

          {/* İbre İpuçları */}
          <div className="flex items-center gap-4 mt-3 text-xs font-black">
            <span className="flex items-center gap-1.5 text-cyan-200 bg-[#08223c] px-3 py-1 rounded-full border border-cyan-400/40">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border border-white" />
              Akrep (Kısa - Saat)
            </span>
            <span className="flex items-center gap-1.5 text-amber-200 bg-[#08223c] px-3 py-1 rounded-full border border-amber-400/40">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-white" />
              Yelkovan (Uzun - Dakika)
            </span>
          </div>
        </div>

        {/* SAĞ: PANEL, GÖREV KARTLARI VE KONTROLLER */}
        <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-4">
          {/* DİJİTAL SAAT EKRANI */}
          <div className="w-full bg-[#08223c]/95 border-2 border-cyan-300 rounded-3xl p-4 shadow-2xl flex flex-col items-center backdrop-blur-md">
            <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-200 tracking-widest mb-1">
              DİJİTAL SAAT GÖSTERGESİ
            </span>
            <div className="flex items-center justify-center gap-2 font-mono text-4xl sm:text-5xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              <span>{String(isAfternoon ? (currentHour === 12 ? 12 : currentHour + 12) : currentHour).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span>{String(currentMinute).padStart(2, '0')}</span>
            </div>

            {/* Türkçe Okunuş Kartı */}
            <div className="mt-2 text-center text-xs sm:text-sm font-bold text-amber-200 bg-amber-400/20 px-3 py-1 rounded-xl border border-amber-300/60 shadow">
              🗣️ {getTurkishTimeDescription(currentHour, currentMinute, isAfternoon)}
            </div>

            {/* 12h / 24h Geçiş Butonu */}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsAfternoon(prev => !prev)}
                className="px-3 py-1 rounded-xl bg-[#0b3356] hover:bg-[#0e416d] text-cyan-200 font-bold border border-cyan-400/60 cursor-pointer shadow transition-all"
              >
                {isAfternoon ? '🌙 Öğleden Sonra (PM)' : '☀️ Öğleden Önce (AM)'}
              </button>
            </div>
          </div>

          {/* OYUN TABINA GÖRE İÇERİK */}
          {gameTab === 'ayarla' && (
            <div className="w-full bg-[#0b3356]/95 border-2 border-amber-300 rounded-3xl p-4 flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md">
              <div className="text-center">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">GÖREV</span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Saati <span className="text-yellow-300 underline font-mono text-2xl font-black">{String(targetHour).padStart(2, '0')}:{String(targetMinute).padStart(2, '0')}</span> konumuna ayarla!
                </h3>
                <p className="text-xs text-cyan-200 font-semibold mt-0.5">
                  ({getTurkishTimeDescription(targetHour, targetMinute, false)})
                </p>
              </div>

              {/* Hızlı İbre Ayar Butonları */}
              <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-cyan-400/30 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="text-cyan-200 text-xs font-bold">Dakika:</span>
                  <button onClick={() => adjustMinute(-15)} className="px-2.5 py-1 rounded-lg bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 font-black border border-cyan-400/40 cursor-pointer shadow">-15dk</button>
                  <button onClick={() => adjustMinute(-5)} className="px-2.5 py-1 rounded-lg bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 font-black border border-cyan-400/40 cursor-pointer shadow">-5dk</button>
                  <button onClick={() => adjustMinute(5)} className="px-2.5 py-1 rounded-lg bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 font-black border border-cyan-400/40 cursor-pointer shadow">+5dk</button>
                  <button onClick={() => adjustMinute(15)} className="px-2.5 py-1 rounded-lg bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 font-black border border-cyan-400/40 cursor-pointer shadow">+15dk</button>
                </div>
              </div>

              {/* Kontrol Et Butonu */}
              <button
                onClick={handleCheckSetTime}
                className="w-full py-3 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 border-2 border-white shadow-xl hover:brightness-110 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>SAATİ KONTROL ET</span>
              </button>

              {/* Geri Bildirim */}
              {feedback === 'correct' && (
                <div className="w-full py-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 text-center font-black text-sm animate-bounce shadow">
                  🎉 HARİKA! Saati tam doğru ayarladın! (+10 Puan)
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="w-full py-2 rounded-xl bg-rose-500/20 border-2 border-rose-400 text-rose-200 text-center font-bold text-xs shadow">
                  ❌ Henüz doğru değil. İbreleri çevirerek tekrar dene!
                </div>
              )}
            </div>
          )}

          {gameTab === 'oku' && (
            <div className="w-full bg-[#0b3356]/95 border-2 border-cyan-300 rounded-3xl p-4 flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md">
              <div className="text-center">
                <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">SORU</span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Analog saatteki zaman hangisidir?
                </h3>
              </div>

              {/* 4 Şık */}
              <div className="w-full grid grid-cols-2 gap-2.5">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 px-2 rounded-2xl font-mono text-xl sm:text-2xl font-black border-2 transition-all cursor-pointer shadow-md ${
                      selectedOption === opt
                        ? opt === `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`
                          ? 'bg-emerald-500 text-white border-white scale-102 shadow-emerald-500/50'
                          : 'bg-rose-500 text-white border-white'
                        : 'bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 border-cyan-400/50 hover:border-yellow-300 hover:scale-102'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {feedback === 'correct' && (
                <div className="w-full py-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 text-center font-black text-sm animate-bounce shadow">
                  🎉 TEBRİKLER! Saati doğru okudun!
                </div>
              )}
            </div>
          )}

          {gameTab === 'kesfet' && (
            <div className="w-full bg-[#0b3356]/95 border-2 border-purple-300 rounded-3xl p-4 flex flex-col items-center text-center gap-2 shadow-2xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <h4 className="text-base font-black text-white">Akıllı Tahta Serbest İnceleme</h4>
              <p className="text-xs text-cyan-100 leading-relaxed">
                Soldaki saatin akrep ve yelkovanını parmağınızla veya fareyle çevirin. Dijital saat ve Türkçe okunuş anlık olarak güncellenecektir.
              </p>
              <div className="w-full flex justify-center gap-2 mt-2">
                <button
                  onClick={() => { setCurrentHour(12); setCurrentMinute(0); }}
                  className="px-3 py-1.5 rounded-xl bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 text-xs font-bold border border-cyan-400/50 cursor-pointer shadow"
                >
                  12:00 Yap
                </button>
                <button
                  onClick={() => { setCurrentHour(6); setCurrentMinute(30); }}
                  className="px-3 py-1.5 rounded-xl bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 text-xs font-bold border border-cyan-400/50 cursor-pointer shadow"
                >
                  06:30 Yap
                </button>
                <button
                  onClick={() => { setCurrentHour(9); setCurrentMinute(15); }}
                  className="px-3 py-1.5 rounded-xl bg-[#08223c] hover:bg-[#0e416d] text-cyan-200 text-xs font-bold border border-cyan-400/50 cursor-pointer shadow"
                >
                  09:15 Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
