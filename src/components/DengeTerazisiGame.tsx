import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Scale,
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
  HelpCircle,
  Heart
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface DengeTerazisiGameProps {
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

interface WeightItem {
  id: string;
  name: string;
  weight: number; // Gram cinsinden
  label: string;
  color: string;
  isObject?: boolean;
  icon?: string;
}

const STANDARD_WEIGHTS: WeightItem[] = [
  { id: 'w_100', name: '100 Gram', weight: 100, label: '100 g', color: 'from-amber-400 to-amber-600' },
  { id: 'w_250', name: '250 Gram', weight: 250, label: '250 g', color: 'from-amber-500 to-yellow-600' },
  { id: 'w_500', name: '500 Gram (Yarım Kilo)', weight: 500, label: '500 g', color: 'from-amber-600 to-orange-700' },
  { id: 'w_1000', name: '1 Kilogram (1000 g)', weight: 1000, label: '1 kg', color: 'from-orange-600 to-red-700' },
  { id: 'w_2000', name: '2 Kilogram', weight: 2000, label: '2 kg', color: 'from-red-600 to-rose-800' }
];

interface TargetProblem {
  objectName: string;
  icon: string;
  weight: number; // Gram
  description: string;
}

const OBJECT_PROBLEMS: TargetProblem[] = [
  { objectName: 'Kırmızı Elma Paketi', icon: '🍎', weight: 500, description: 'Yarım kilogramlık taze elmalar' },
  { objectName: 'Büyük Karpuz', icon: '🍉', weight: 2000, description: 'Tatlı sulu büyük karpuz' },
  { objectName: 'Ansiklopedi Kitabı', icon: '📚', weight: 750, description: 'Ağır bilim ansiklopedisi' },
  { objectName: 'Oyuncak Ayıcık', icon: '🧸', weight: 350, description: 'Sevimli peluş oyuncak' },
  { objectName: 'Un Çuvalı', icon: '🌾', weight: 1500, description: '1.5 kilogramlık tam buğday unu' },
  { objectName: 'Hediye Paketi', icon: '🎁', weight: 1000, description: 'Tam 1 kilogramlık doğum günü hediyesi' },
  { objectName: 'Teneke Zeytinyağı', icon: '🫒', weight: 2500, description: 'Doğal soğuk sıkım zeytinyağı' }
];

export const DengeTerazisiGame: React.FC<DengeTerazisiGameProps> = ({
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
  const [currentProblem, setCurrentProblem] = useState<TargetProblem>(OBJECT_PROBLEMS[0]);

  // Sağ kefeye konulan ağırlıklar
  const [rightPanWeights, setRightPanWeights] = useState<{ id: string; weight: number; label: string }[]>([]);

  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // 10 SORU VE 3 HATA KURALI
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Ağırlık Hesapları
  const leftTotal = currentProblem.weight;
  const rightTotal = rightPanWeights.reduce((sum, w) => sum + w.weight, 0);

  // Eğim Açısı Hesaplama (Derece cinsinden):
  const diff = rightTotal - leftTotal;
  const tiltAngle = Math.max(-18, Math.min(18, diff / 50));
  const isBalanced = diff === 0;

  // Yeni Soru Oluştur
  const generateNewQuestion = useCallback(() => {
    const randomProb = OBJECT_PROBLEMS[Math.floor(Math.random() * OBJECT_PROBLEMS.length)];
    setCurrentProblem(randomProb);
    setRightPanWeights([]);
    setFeedback('none');
  }, []);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  // Yeniden Başla
  const handleRestartGame = () => {
    if (playMp3) playMp3('/op.mp3');
    setQuestionCount(1);
    setMistakes(0);
    setCorrectCount(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    generateNewQuestion();
  };

  // Sağ Kefeye Ağırlık Ekle
  const handleAddWeight = (item: WeightItem) => {
    if (playMp3) playMp3('/op.mp3');
    setRightPanWeights(prev => [
      ...prev,
      { id: `${item.id}_${Date.now()}_${Math.random()}`, weight: item.weight, label: item.label }
    ]);
    setFeedback('none');
  };

  // Sağ Kefeden Ağırlık Çıkar
  const handleRemoveWeight = (index: number) => {
    setRightPanWeights(prev => prev.filter((_, i) => i !== index));
    setFeedback('none');
  };

  // Kefeyi Temizle
  const handleClear = () => {
    setRightPanWeights([]);
    setFeedback('none');
  };

  // Teraziyi Kontrol Et
  const handleCheck = () => {
    if (isGameOver) return;
    if (isBalanced) {
      setFeedback('correct');
      setScore(s => s + 20);
      setStreak(st => st + 1);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      if (playMp3) playMp3('/alkis.mp3');

      try {
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
      } catch {}

      if (questionCount >= 10) {
        setTimeout(() => setIsGameOver(true), 1200);
      } else {
        setTimeout(() => {
          setQuestionCount(q => q + 1);
          generateNewQuestion();
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
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] bg-gradient-to-br from-[#0f766e] via-[#0284c7] to-[#4338ca] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn"
    >
      {/* ÇOCUKLAR İÇİN BİLİM VE TERAZİ DENGESİ EMOJİLERİ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex justify-between items-center text-3xl sm:text-4xl select-none px-4">
        <div className="flex flex-col gap-12 sm:gap-16">
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>⚖️</span>
          <span className="animate-bounce" style={{ animationDuration: '7s' }}>🧪</span>
          <span className="animate-bounce" style={{ animationDuration: '6s' }}>🍎</span>
          <span className="animate-bounce" style={{ animationDuration: '4.5s' }}>🍉</span>
        </div>
        <div className="flex flex-col gap-14 sm:gap-20">
          <span className="animate-bounce" style={{ animationDuration: '6.5s' }}>⚛️</span>
          <span className="animate-bounce" style={{ animationDuration: '5.5s' }}>🔬</span>
          <span className="animate-bounce" style={{ animationDuration: '7.5s' }}>🎁</span>
          <span className="animate-bounce" style={{ animationDuration: '5s' }}>⭐</span>
        </div>
      </div>

      {/* GÖREV VE SKOR ŞERİDİ */}
      <div className="w-full flex flex-wrap items-center justify-between px-2 sm:px-5 py-2 bg-[#0c2a4a]/95 border-b-2 border-cyan-300/40 backdrop-blur-md z-20 shrink-0 gap-2 shadow-md">
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
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-white text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
            <Scale size={15} />
            <span>Eşit Kollu Denge Terazisi</span>
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
                : 'Ağırlıkları ve terazi dengesini başarıyla tamamladın!'}
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

      {/* ANA OYUN ALANI (TERAZİ FİZİK SİMÜLASYONU) */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 gap-6 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto">
        {/* TERAZİ GÖRSELİ */}
        <div className="relative w-full max-w-2xl h-72 sm:h-80 flex flex-col items-center justify-end select-none bg-[#0c2a4a]/90 border-3 border-cyan-400 rounded-3xl p-4 shadow-2xl backdrop-blur-md">
          {/* İBRE VE DERECE GÖSTERGESİ (Üst Kısım) */}
          <div className="absolute top-3 z-20 flex flex-col items-center">
            <div className={`px-4 py-1.5 rounded-full border-2 text-xs font-black flex items-center gap-1.5 shadow-xl transition-colors ${
              isBalanced
                ? 'bg-emerald-500 text-white border-white animate-bounce shadow-emerald-500/50'
                : 'bg-[#06182c] text-amber-300 border-amber-400'
            }`}>
              <span>{isBalanced ? '⚖️ TAM DENGELENDİ!' : '⚖️ TERAZİ DENGEDE DEĞİL'}</span>
            </div>
          </div>

          {/* TERAZİ MERKEZ STANDI (DİREK) */}
          <div className="absolute bottom-4 w-6 sm:w-8 h-48 sm:h-52 bg-gradient-to-t from-slate-900 via-amber-700 to-amber-500 rounded-t-lg border-2 border-white/60 shadow-2xl flex flex-col items-center justify-start z-10">
            {/* Göbek Pivot Halkası */}
            <div className="w-10 h-10 -mt-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-950" />
            </div>
          </div>

          {/* TERAZİ TABAN AYAKLIĞI */}
          <div className="absolute bottom-0 w-48 sm:w-64 h-6 rounded-t-2xl bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 border-t-2 border-white/80 shadow-2xl" />

          {/* DÖNEN TERAZİ KOLU VE KEFELER (Tilt Group) */}
          <div
            className="absolute top-16 sm:top-20 w-full max-w-lg sm:max-w-xl flex items-center justify-between z-20 transition-transform duration-500 ease-out"
            style={{
              transform: `rotate(${tiltAngle}deg)`,
              transformOrigin: '50% 50%'
            }}
          >
            {/* SOL KEFELİK ASKI VE KEFE (Nesnenin Durduğu Yer) */}
            <div
              className="flex flex-col items-center transition-transform duration-500"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              {/* Asma Zincirleri */}
              <div className="w-0.5 h-14 sm:h-18 bg-amber-300/80 shadow" />
              {/* Kefe Çanağı */}
              <div className="w-32 sm:w-40 min-h-[50px] rounded-b-3xl bg-gradient-to-b from-amber-300/90 to-amber-600 border-2 border-white shadow-xl flex flex-col items-center justify-center p-2 relative">
                <div className="text-3xl sm:text-4xl filter drop-shadow">
                  {currentProblem.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-black text-slate-950 mt-0.5 truncate max-w-[110px]">
                  {currentProblem.objectName}
                </span>
                <span className="text-[10px] font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.2 rounded-full">
                  {currentProblem.weight >= 1000
                    ? `${(currentProblem.weight / 1000).toFixed(1)} kg (${currentProblem.weight} g)`
                    : `${currentProblem.weight} g`}
                </span>
              </div>
            </div>

            {/* DÖNEN METAL KOL (Beam) */}
            <div className="flex-1 h-3 sm:h-4 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 border-2 border-white shadow-md rounded-full -mx-4" />

            {/* SAĞ KEFELİK ASKI VE KEFE (Ağırlıkların Konulduğu Yer) */}
            <div
              className="flex flex-col items-center transition-transform duration-500"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              {/* Asma Zincirleri */}
              <div className="w-0.5 h-14 sm:h-18 bg-amber-300/80 shadow" />
              {/* Kefe Çanağı */}
              <div className="w-32 sm:w-40 min-h-[50px] rounded-b-3xl bg-gradient-to-b from-amber-300/90 to-amber-600 border-2 border-white shadow-xl flex flex-col items-center justify-center p-2 relative">
                <div className="flex flex-wrap gap-1 items-center justify-center max-w-[120px] min-h-[30px]">
                  {rightPanWeights.length === 0 ? (
                    <span className="text-[10px] text-amber-950 font-black">Boş Kefe</span>
                  ) : (
                    rightPanWeights.map((w, idx) => (
                      <button
                        key={w.id}
                        onClick={() => handleRemoveWeight(idx)}
                        className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono text-[9px] font-black border border-white shadow hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        title="Kefeden çıkarmak için dokun"
                      >
                        {w.label}
                      </button>
                    ))
                  )}
                </div>
                <span className="text-[10px] font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.2 rounded-full mt-1">
                  Toplam: {rightTotal} g
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ALT KONTROL ALANI: AĞIRLIK SEÇME KUTULARI */}
        <div className="w-full bg-[#08223c]/95 border-3 border-amber-300 rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md">
          <div className="w-full flex items-center justify-between pb-1 border-b border-amber-400/40">
            <span className="text-xs font-black uppercase text-yellow-300 tracking-wider">
              STANDART AĞIRLIKLAR (Sağ Kefeye Eklemek İçin Dokunun)
            </span>
            {rightPanWeights.length > 0 && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-[10px] font-black border border-rose-400 cursor-pointer shadow transition-all"
              >
                Kefeyi Boşalt
              </button>
            )}
          </div>

          {/* Ağırlık Düğmeleri */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STANDARD_WEIGHTS.map(item => (
              <button
                key={item.id}
                onClick={() => handleAddWeight(item)}
                className={`p-2.5 rounded-2xl bg-gradient-to-br ${item.color} border-2 border-white shadow-lg flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer`}
              >
                <Scale size={16} className="text-white drop-shadow mb-0.5" />
                <span className="text-sm sm:text-base font-black text-white drop-shadow">
                  {item.label}
                </span>
                <span className="text-[9px] text-white/95 font-black">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Teraziyi Kontrol Et Butonu */}
          <button
            onClick={handleCheck}
            className="w-full max-w-md py-3 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 border-2 border-white shadow-xl hover:brightness-110 active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2 mt-1"
          >
            <CheckCircle2 size={20} />
            <span>DENGEYİ KONTROL ET ({rightTotal} g)</span>
          </button>

          {/* Geri Bildirim */}
          {feedback === 'correct' && (
            <div className="w-full max-w-md py-2.5 rounded-2xl bg-emerald-500/25 border-2 border-emerald-300 text-emerald-200 text-center font-black text-sm animate-bounce shadow">
              🎉 MÜKEMMEL! Terazi tam dengelendi! (+20 Puan)
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="w-full max-w-md py-2 rounded-2xl bg-rose-500/25 border-2 border-rose-300 text-rose-200 text-center font-bold text-xs shadow">
              {rightTotal > leftTotal
                ? `Sağ kefe fazla ağır bastı! (${rightTotal} g koydun, ${leftTotal} g olmalı)`
                : `Sağ kefe henüz hafif kaldı! (${rightTotal} g koydun, ${leftTotal} g olmalı)`}
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
