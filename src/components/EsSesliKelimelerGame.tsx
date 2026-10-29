import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
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
  BookOpen,
  HelpCircle,
  Heart
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface EsSesliKelimelerGameProps {
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

interface SesteşItem {
  word: string;
  meaning1: {
    sentence: string; // "Cümledeki boşluğa gelecek"
    definition: string;
    icon: string;
    targetWord: string;
  };
  meaning2: {
    sentence: string;
    definition: string;
    icon: string;
    targetWord: string;
  };
}

const SESTES_POOL: SesteşItem[] = [
  {
    word: 'ÇAY',
    meaning1: {
      sentence: 'Kahvaltıda annem taze demlenmiş sıcak bir bardak ... doldurdu.',
      definition: 'İçilen sıcak içecek',
      icon: '☕',
      targetWord: 'İçecek Çay'
    },
    meaning2: {
      sentence: 'Köydeki serin ... kenarında piknik yapıp ayaklarımızı suya soktuk.',
      definition: 'Küçük akarsu, dere',
      icon: '🏞️',
      targetWord: 'Akarsu / Dere'
    }
  },
  {
    word: 'YÜZ',
    meaning1: {
      sentence: 'Sıcak yaz günlerinde serinlemek için masmavi denizde ...düm.',
      definition: 'Suda ilerleme eylemi',
      icon: '🏊‍♂️',
      targetWord: 'Suda Yüzmek'
    },
    meaning2: {
      sentence: 'Sınavdan tam ... puan alınca öğretmenim beni tebrik etti.',
      definition: '99\'dan sonra gelen sayı',
      icon: '💯',
      targetWord: 'Sayı Olan 100'
    }
  },
  {
    word: 'GÜL',
    meaning1: {
      sentence: 'Bahçemizdeki kırmızı ...ler mis gibi kokuyordu.',
      definition: 'Güzel kokulu bir çiçek',
      icon: '🌹',
      targetWord: 'Çiçek Olan Gül'
    },
    meaning2: {
      sentence: 'Anlattığı komik fıkraya sınıftaki herkes kahkahalarla ...dü.',
      definition: 'Gülümsemek, neşelenmek',
      icon: '😄',
      targetWord: 'Gülmek Eylemi'
    }
  },
  {
    word: 'DAL',
    meaning1: {
      sentence: 'Ağacın yüksek ...ına sevimli bir serçe kuşu kondu.',
      definition: 'Ağacın gövdesinden ayrılan kol',
      icon: '🌿',
      targetWord: 'Ağaç Dalı'
    },
    meaning2: {
      sentence: 'Dalgıç özel maskesini takıp derin denizlerin dibine ...dı.',
      definition: 'Suyun içine batmak, girmek',
      icon: '🤿',
      targetWord: 'Suya Dalmak'
    }
  },
  {
    word: 'KIR',
    meaning1: {
      sentence: 'İlkbaharda yemyeşil ...larda rengarenk papatyalar topladık.',
      definition: 'Şehir dışı geniş yeşil alan',
      icon: '🌼',
      targetWord: 'Kır Bahçesi'
    },
    meaning2: {
      sentence: 'Sakarlık yapıp elindeki porselen tabağı yere düşürüp ...dı.',
      definition: 'Parçalamak, bozmak',
      icon: '💥',
      targetWord: 'Kırmak Eylemi'
    }
  },
  {
    word: 'DOLU',
    meaning1: {
      sentence: 'Kovayı çeşmeden musluğu açarak tepeleme su ile ...durdu.',
      definition: 'Boş olmayan, dolmuş',
      icon: '🪣',
      targetWord: 'Dolu Kova'
    },
    meaning2: {
      sentence: 'Aniden başlayan fırtınada gökyüzünden ceviz büyüklüğünde ... yağdı.',
      definition: 'Buz parçacığı yağışı',
      icon: '🌨️',
      targetWord: 'Dolu Yağışı'
    }
  },
  {
    word: 'YAZ',
    meaning1: {
      sentence: 'Okullar tatil olunca sıcak ... mevsiminde tatile gittik.',
      definition: 'En sıcak mevsim',
      icon: '☀️',
      targetWord: 'Yaz Mevsimi'
    },
    meaning2: {
      sentence: 'Öğretmenin tahtaya yazdığı notları hemen defterine ...dı.',
      definition: 'Kalemle harf dökmek',
      icon: '✍️',
      targetWord: 'Yazı Yazmak'
    }
  },
  {
    word: 'EKMEK',
    meaning1: {
      sentence: 'Sabah fırından yeni çıkmış sıcacık çıtır çıtır bir ... aldım.',
      definition: 'Unla yapılan temel gıda',
      icon: '🍞',
      targetWord: 'Fırın Ekmeği'
    },
    meaning2: {
      sentence: 'Çiftçi bahçesine domates ve biber tohumları ...ti.',
      definition: 'Toprağa tohum serpmek',
      icon: '🌱',
      targetWord: 'Tohum Ekmek'
    }
  },
  {
    word: 'AT',
    meaning1: {
      sentence: 'Çiftlikteki asil beyaz ... çimlerin üzerinde neşeyle dörtnala koştu.',
      definition: 'Binek ve koşu hayvanı',
      icon: '🐎',
      targetWord: 'Hayvan Olan At'
    },
    meaning2: {
      sentence: 'Basketbol maçında oyuncu topu tam zamanında potaya ...tı.',
      definition: 'Fırlatmak eylemi',
      icon: '🏀',
      targetWord: 'Fırlatmak / Atmak'
    }
  },
  {
    word: 'KAZ',
    meaning1: {
      sentence: 'Gölün kıyısında beyaz tüylü yavrularıyla yüzen bir ... gördük.',
      definition: 'Perde ayaklı su kuşu',
      icon: '🪿',
      targetWord: 'Kuş Olan Kaz'
    },
    meaning2: {
      sentence: 'Bahçıvan fidan dikmek için kürekle toprağı derin bir şekilde ...tı.',
      definition: 'Toprakta çukur açmak',
      icon: '⛏️',
      targetWord: 'Toprağı Kazmak'
    }
  }
];

export const EsSesliKelimelerGame: React.FC<EsSesliKelimelerGameProps> = ({
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedWord, setSelectedWord] = useState<SesteşItem>(SESTES_POOL[0]);

  // Cümle 1 ve Cümle 2 eşleşme durumu (Hangi görsel seçildi?)
  const [matchedBox1, setMatchedBox1] = useState<number | null>(null); // 1 or 2
  const [matchedBox2, setMatchedBox2] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // 10 SORU VE 3 HATA KURALI
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Yeni Soru Seçimi
  const loadQuestion = useCallback((idx: number) => {
    const item = SESTES_POOL[idx % SESTES_POOL.length];
    setSelectedWord(item);
    setMatchedBox1(null);
    setMatchedBox2(null);
    setFeedback('none');
  }, []);

  useEffect(() => {
    loadQuestion(currentIndex);
  }, [currentIndex, loadQuestion]);

  // Yeniden Başla
  const handleRestartGame = () => {
    if (playMp3) playMp3('/op.mp3');
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    setCurrentIndex(0);
    loadQuestion(0);
  };

  // Görseli Kutuya Ata
  const assignIconToBox = (boxIndex: 1 | 2, meaningIdx: 1 | 2) => {
    if (playMp3) playMp3('/op.mp3');

    if (boxIndex === 1) {
      setMatchedBox1(meaningIdx);
    } else {
      setMatchedBox2(meaningIdx);
    }
    setFeedback('none');
  };

  // Kontrol Et
  const handleCheck = () => {
    if (isGameOver) return;
    // Doğru eşleşme: Kutu 1 meaning 1'e, Kutu 2 meaning 2'ye eşit olmalı
    const isBox1Correct = matchedBox1 === 1;
    const isBox2Correct = matchedBox2 === 2;

    if (isBox1Correct && isBox2Correct) {
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
        setTimeout(() => setIsGameOver(true), 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          setCurrentIndex(prev => prev + 1);
        }, 1600);
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
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] bg-gradient-to-br from-[#4338ca] via-[#6366f1] to-[#a855f7] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn"
    >
      {/* ÇOCUKLAR İÇİN DEDEKTİF VE MERAK EMOJİLERİ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex justify-between items-center text-3xl sm:text-4xl select-none px-4">
        <div className="flex flex-col gap-12 sm:gap-16">
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🔍</span>
          <span className="animate-bounce" style={{ animationDuration: '7s' }}>🕵️</span>
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>💡</span>
          <span className="animate-bounce" style={{ animationDuration: '4.5s' }}>⭐</span>
        </div>
        <div className="flex flex-col gap-14 sm:gap-20">
          <span className="animate-bounce" style={{ animationDuration: '6.5s' }}>👣</span>
          <span className="animate-bounce" style={{ animationDuration: '5.5s' }}>📚</span>
          <span className="animate-bounce" style={{ animationDuration: '7.5s' }}>🗝️</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>🎯</span>
        </div>
      </div>

      {/* ÜST DEDEKTİF ŞERİDİ & SKOR */}
      <div className="w-full flex items-center justify-between px-2 sm:px-5 py-2 bg-[#312e81]/95 border-b-2 border-amber-300/40 backdrop-blur-md z-20 shrink-0 shadow-md">
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
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-white text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
            <Search size={15} />
            <span>Sesteş Kelimeler Dedektifi</span>
          </div>
        </div>

        {/* Soru Sayacı (10 Soru), Kalan Can (3 Hata) ve Puan */}
        <div className="flex items-center gap-2">
          {/* Soru Sayacı */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-400/25 border border-cyan-300 text-cyan-200 text-xs font-black shadow">
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
                : 'Sesteş kelimelerin farklı anlamlarını başarıyla buldun!'}
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

      {/* DEDEKTİF ANA ALANI */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 gap-4 min-h-0 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* SESTEŞ KELİME BÜYÜK ROZETİ */}
        <div className="flex flex-col items-center animate-bounce">
          <span className="text-xs font-black uppercase text-yellow-300 tracking-widest mb-1 flex items-center gap-1">
            <Sparkles size={14} className="text-yellow-300" />
            GİZEMLİ SESTEŞ KELİME
          </span>
          <div className="px-8 py-3 rounded-3xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border-4 border-white shadow-[0_0_35px_rgba(251,191,36,0.6)]">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-wider">
              "{selectedWord.word}"
            </h2>
          </div>
          <p className="text-xs text-yellow-200 font-black mt-2 bg-[#312e81]/80 px-3 py-1 rounded-full border border-amber-300/40">
            Aşağıdaki 2 farklı cümleyi okuyup uygun olan görseli seçin!
          </p>
        </div>

        {/* 2 CÜMLE VE EŞLEŞTİRME KARTLARI */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CÜMLE 1 KUTUSU */}
          <div className="bg-[#1e1b4b]/95 border-3 border-cyan-400 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between gap-3 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-cyan-400/40">
                <span className="text-xs font-black text-cyan-300 uppercase">1. KULLANIM ALANI</span>
                <span className="text-[10px] text-cyan-200 font-bold bg-cyan-900/60 px-2 py-0.5 rounded-full border border-cyan-400/40">Anlam A</span>
              </div>
              <p className="mt-3 text-sm sm:text-base font-bold text-white leading-relaxed">
                "{selectedWord.meaning1.sentence}"
              </p>
            </div>

            {/* Seçilen Görsel Yuvası */}
            <div className="p-3 rounded-2xl bg-[#0f0e26] border-2 border-dashed border-cyan-400/60 flex items-center justify-between">
              <span className="text-xs text-cyan-200 font-medium">Bu cümlenin anlamı:</span>
              {matchedBox1 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs shadow">
                  <span className="text-xl">
                    {matchedBox1 === 1 ? selectedWord.meaning1.icon : selectedWord.meaning2.icon}
                  </span>
                  <span>
                    {matchedBox1 === 1 ? selectedWord.meaning1.targetWord : selectedWord.meaning2.targetWord}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-yellow-300 font-black animate-pulse">👇 Görsel Seçiniz</span>
              )}
            </div>

            {/* Seçim Butonları */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => assignIconToBox(1, 1)}
                className={`p-2 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                  matchedBox1 === 1
                    ? 'bg-cyan-500 text-slate-950 border-white shadow-lg font-black scale-102'
                    : 'bg-[#2e2a72] hover:bg-[#3d3896] text-white border-cyan-400/50 hover:border-white'
                }`}
              >
                <span className="text-2xl drop-shadow">{selectedWord.meaning1.icon}</span>
                <span className="text-xs font-bold truncate">{selectedWord.meaning1.targetWord}</span>
              </button>
              <button
                onClick={() => assignIconToBox(1, 2)}
                className={`p-2 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                  matchedBox1 === 2
                    ? 'bg-cyan-500 text-slate-950 border-white shadow-lg font-black scale-102'
                    : 'bg-[#2e2a72] hover:bg-[#3d3896] text-white border-cyan-400/50 hover:border-white'
                }`}
              >
                <span className="text-2xl drop-shadow">{selectedWord.meaning2.icon}</span>
                <span className="text-xs font-bold truncate">{selectedWord.meaning2.targetWord}</span>
              </button>
            </div>
          </div>

          {/* CÜMLE 2 KUTUSU */}
          <div className="bg-[#1e1b4b]/95 border-3 border-pink-400 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between gap-3 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-pink-400/40">
                <span className="text-xs font-black text-pink-300 uppercase">2. KULLANIM ALANI</span>
                <span className="text-[10px] text-pink-200 font-bold bg-pink-900/60 px-2 py-0.5 rounded-full border border-pink-400/40">Anlam B</span>
              </div>
              <p className="mt-3 text-sm sm:text-base font-bold text-white leading-relaxed">
                "{selectedWord.meaning2.sentence}"
              </p>
            </div>

            {/* Seçilen Görsel Yuvası */}
            <div className="p-3 rounded-2xl bg-[#0f0e26] border-2 border-dashed border-pink-400/60 flex items-center justify-between">
              <span className="text-xs text-pink-200 font-medium">Bu cümlenin anlamı:</span>
              {matchedBox2 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow">
                  <span className="text-xl">
                    {matchedBox2 === 1 ? selectedWord.meaning1.icon : selectedWord.meaning2.icon}
                  </span>
                  <span>
                    {matchedBox2 === 1 ? selectedWord.meaning1.targetWord : selectedWord.meaning2.targetWord}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-yellow-300 font-black animate-pulse">👇 Görsel Seçiniz</span>
              )}
            </div>

            {/* Seçim Butonları */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => assignIconToBox(2, 1)}
                className={`p-2 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                  matchedBox2 === 1
                    ? 'bg-pink-500 text-white border-white shadow-lg font-black scale-102'
                    : 'bg-[#2e2a72] hover:bg-[#3d3896] text-white border-pink-400/50 hover:border-white'
                }`}
              >
                <span className="text-2xl drop-shadow">{selectedWord.meaning1.icon}</span>
                <span className="text-xs font-bold truncate">{selectedWord.meaning1.targetWord}</span>
              </button>
              <button
                onClick={() => assignIconToBox(2, 2)}
                className={`p-2 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                  matchedBox2 === 2
                    ? 'bg-pink-500 text-white border-white shadow-lg font-black scale-102'
                    : 'bg-[#2e2a72] hover:bg-[#3d3896] text-white border-pink-400/50 hover:border-white'
                }`}
              >
                <span className="text-2xl drop-shadow">{selectedWord.meaning2.icon}</span>
                <span className="text-xs font-bold truncate">{selectedWord.meaning2.targetWord}</span>
              </button>
            </div>
          </div>
        </div>

        {/* KONTROL BUTONU */}
        <div className="w-full flex flex-col items-center gap-2 pt-2">
          <button
            onClick={handleCheck}
            disabled={!matchedBox1 || !matchedBox2}
            className={`w-full max-w-md py-3 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 border-2 border-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !matchedBox1 || !matchedBox2
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            <CheckCircle2 size={20} />
            <span>ANLAMLARI KONTROL ET</span>
          </button>

          {feedback === 'correct' && (
            <div className="w-full max-w-md py-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-center font-black text-sm animate-bounce">
              🎉 HARİKA BİR DEDEKTİFSİN! Her iki anlamı da tam doğru buldun! (+15 Puan)
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="w-full max-w-md py-2 rounded-2xl bg-red-500/20 border border-red-400 text-red-300 text-center font-bold text-xs">
              ❌ Bazı eşleştirmeler doğru değil. Cümleleri tekrar okuyarak dene!
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
