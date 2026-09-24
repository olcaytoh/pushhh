import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  Utensils, Heart, CheckCircle2, XCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  isHealthy: boolean;
  category: 'Protein' | 'Sebze/Meyve' | 'Tahıl' | 'Süt Ürünü' | 'Abur Cubur';
  explanation: string;
}

export const FOOD_ITEMS: FoodItem[] = [
  { id: 'f-1', name: 'Haşlanmış Yumurta', emoji: '🥚', isHealthy: true, category: 'Protein', explanation: 'Yumurta kaslarımızın gelişimi için harika bir protein kaynağıdır.' },
  { id: 'f-2', name: 'Gazlı İçecek / Kola', emoji: '🥤', isHealthy: false, category: 'Abur Cubur', explanation: 'Aşırı şeker ve asit içerir, dişlere ve mideye zararlıdır.' },
  { id: 'f-3', name: 'Taze Brokoli', emoji: '🥦', isHealthy: true, category: 'Sebze/Meyve', explanation: 'Bol vitamin ve lif içerir, bağışıklık sistemimizi güçlendirir.' },
  { id: 'f-4', name: 'Patates Cipsi', emoji: '🍟', isHealthy: false, category: 'Abur Cubur', explanation: 'Aşırı yağlı ve tuzludur, sağlığımıza faydası yoktur.' },
  { id: 'f-5', name: 'Taze Süt', emoji: '🥛', isHealthy: true, category: 'Süt Ürünü', explanation: 'Kalsiyum deposudur, kemiklerimizi ve dişlerimizi güçlendirir.' },
  { id: 'f-6', name: 'Kırmızı Elma', emoji: '🍎', isHealthy: true, category: 'Sebze/Meyve', explanation: 'C vitamini kaynağıdır, hastalıklara karşı korur.' },
  { id: 'f-7', name: 'Renkli Şekerleme & Lolipop', emoji: '🍭', isHealthy: false, category: 'Abur Cubur', explanation: 'Dişleri çürütür ve sağlığımıza yararlı besin değeri taşımaz.' },
  { id: 'f-8', name: 'Izgara Balık', emoji: '🐟', isHealthy: true, category: 'Protein', explanation: 'Omega-3 ve protein bakımından çok zengindir, zekayı geliştirir.' },
  { id: 'f-9', name: 'Tam Buğday Ekmeği', emoji: '🍞', isHealthy: true, category: 'Tahıl', explanation: 'Bize gün boyu koşup oynayabilmemiz için sağlıklı enerji verir.' },
  { id: 'f-10', name: 'Çıtır Havuç', emoji: '🥕', isHealthy: true, category: 'Sebze/Meyve', explanation: 'A vitamini içerir, gözlerimizin sağlıklı görmesini destekler.' }
];

export const getRandomFoods = (count: number = 8): FoodItem[] => {
  const shuffled = [...FOOD_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface SaglikliTabakGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
}

type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'rose' | 'blue' | 'emerald';
  score: number;
  foodIndex: number;
  chosenHealthy: boolean | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
  plate: string[];
}

export const SaglikliTabakGame: React.FC<SaglikliTabakGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  playerCountMode = 1,
  onSwitchPlayerCountMode,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [foods, setFoods] = useState<FoodItem[]>(() => getRandomFoods(8));

  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      try {
        playMp3(src);
      } catch (err) {
        console.error(err);
      }
    }
  }, [soundEnabled, playMp3]);

  // Student selection state
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    selectedStudentIds?.[1] || null,
    selectedStudentIds?.[2] || null
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([
        selectedStudentIds[0] || null,
        selectedStudentIds[1] || null,
        selectedStudentIds[2] || null
      ]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds(prev => [selectedStudentId, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      return selectedStudentIds;
    }
    return internalSelectedIds;
  }, [selectedStudentIds, internalSelectedIds]);

  const handleSelectStudentForPlayer = (pIdx: number, studentId: string | null) => {
    setInternalSelectedIds(prev => {
      const updated = [...prev];
      updated[pIdx] = studentId;
      return updated;
    });
    if (onSelectStudentForPlayer) {
      onSelectStudentForPlayer(pIdx, studentId);
    } else if (pIdx === 0 && onSelectStudent) {
      onSelectStudent(studentId);
    }
    triggerSound('/op.mp3');
  };

  const createInitialPlayers = useCallback((count: number): PlayerState[] => {
    const list: PlayerState[] = [];
    const colors: ('rose' | 'blue' | 'emerald')[] = ['rose', 'blue', 'emerald'];
    const names = ['1. Şef', '2. Şef', '3. Şef'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Tabak Şefi' : names[i],
        colorName: colors[i],
        score: 0,
        foodIndex: 0,
        chosenHealthy: null,
        isCorrect: null,
        showFeedback: false,
        plate: []
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
  }, [playerMode, createInitialPlayers]);

  const handleSwitchMode = (mode: PlayerMode) => {
    setPlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    triggerSound('/op.mp3');
  };

  const handleChoice = (playerIndex: number, isHealthyChoice: boolean) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentFood = foods[p.foodIndex % foods.length];
    const isCorrect = isHealthyChoice === currentFood.isHealthy;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(true);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(false);
    }

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.chosenHealthy = isHealthyChoice;
      target.isCorrect = isCorrect;
      target.showFeedback = true;
      if (isCorrect) {
        target.score += 10;
        if (currentFood.isHealthy) {
          target.plate = [...target.plate, currentFood.emoji];
        }
      }
      next[playerIndex] = target;
      return next;
    });

    setTimeout(() => {
      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        const nextIdx = target.foodIndex + 1;

        if (nextIdx >= 5) {
          setGameOver(true);
          setRoundWinner(playerIndex);
          triggerSound('/para.mp3');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          target.foodIndex = nextIdx;
          target.chosenHealthy = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1300);
  };

  const handleResetGame = () => {
    setFoods(getRandomFoods(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    triggerSound('/nextlvl.mp3');
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Geri Dön"
          >
            <ChevronLeft size={18} />
          </button>

          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Ana Sayfaya Dön"
            >
              <Home size={13} />
              <span className="hidden xs:inline">Ana Sayfa</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kapat"
          >
            ✕ <span className="hidden xs:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 flex flex-col justify-between overflow-y-auto no-scrollbar min-h-0">
        <div className={`w-full flex-1 grid gap-2 sm:gap-3 ${
          playerMode === 1 ? 'grid-cols-1 max-w-3xl mx-auto' : playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
        } min-h-0 items-stretch`}>
          {players.map((player, pIdx) => {
            const currentFood = foods[player.foodIndex % foods.length];
            const pStudent = effectiveSelectedStudentIds[pIdx]
              ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
              : null;
            const displayName = pStudent ? pStudent.name : player.name;

            const cardBorder = player.colorName === 'rose'
              ? 'border-rose-500/80 bg-[#250d18]/90'
              : player.colorName === 'blue'
              ? 'border-sky-500/80 bg-[#0d1c31]/90'
              : 'border-emerald-500/80 bg-[#0b2419]/90';

            return (
              <div
                key={player.id}
                className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-3 flex flex-col justify-between shadow-xl backdrop-blur-sm overflow-hidden`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm sm:text-base shrink-0">
                      {player.colorName === 'rose' ? '🔴' : player.colorName === 'blue' ? '🔵' : '🟢'}
                    </span>
                    <span className="font-black text-xs sm:text-sm text-slate-100 truncate">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                      Yiyecek: {player.foodIndex + 1}/5
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* Tabak Görünümü (Toplanan Sağlıklı Besinler) */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 mb-1">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-200">
                    🥗 Sağlıklı Tabağım:
                  </span>
                  <div className="flex items-center gap-1">
                    {player.plate.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">Tabak boş</span>
                    ) : (
                      player.plate.map((em, idx) => (
                        <span key={idx} className="text-base animate-bounce">{em}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Yiyecek Kartı - Soru Görseli ve Punto Büyütüldü */}
                <div className="my-auto py-4 sm:py-6 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-black/60 border-2 sm:border-3 border-amber-400/50 flex flex-col items-center justify-center gap-2.5 shadow-2xl">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-900/40 border-2 border-amber-400/40 flex items-center justify-center shadow-inner">
                    <span className="text-6xl sm:text-7xl md:text-8xl animate-bounce filter drop-shadow-lg">
                      {currentFood.emoji}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white text-center tracking-wide drop-shadow-sm">
                    {currentFood.name}
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-white/15 text-xs sm:text-sm font-black text-amber-300 border border-amber-400/30">
                    {currentFood.category}
                  </span>
                </div>

                {/* Karar Butonları: Sağlıklı mı? Abur Cubur mu? */}
                <div className="grid grid-cols-2 gap-2.5 my-2">
                  <button
                    disabled={player.showFeedback}
                    onClick={() => handleChoice(pIdx, true)}
                    className={`py-3.5 sm:py-4 px-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base border-2 sm:border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 shadow-lg ${
                      player.showFeedback
                        ? currentFood.isHealthy
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-400 scale-102'
                          : 'opacity-30 bg-slate-800 border-slate-700'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">🥗</span>
                    <span>SAĞLIKLI BESİN</span>
                  </button>

                  <button
                    disabled={player.showFeedback}
                    onClick={() => handleChoice(pIdx, false)}
                    className={`py-3.5 sm:py-4 px-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base border-2 sm:border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 shadow-lg ${
                      player.showFeedback
                        ? !currentFood.isHealthy
                          ? 'bg-rose-500 text-white border-rose-300 ring-4 ring-rose-400 scale-102'
                          : 'opacity-30 bg-slate-800 border-slate-700'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-rose-400'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">🚫</span>
                    <span>ABUR CUBUR</span>
                  </button>
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-1 p-2 rounded-lg bg-black/60 border border-white/10 text-[11px] sm:text-xs text-amber-200 text-center animate-fade-in">
                    <span className={`font-black block ${currentFood.isHealthy ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {currentFood.isHealthy ? '✓ Sağlıklı ve Faydalı Besin!' : '✗ Zararlı Abur Cubur!'}
                    </span>
                    <span>{currentFood.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Student Avatar Dock (Single Row) */}
      {students && students.length > 0 && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={effectiveSelectedStudentIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* Victory Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#2e1c0d] to-[#120a04] border-2 border-amber-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              👨‍🍳
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase">
              Tebrikler Usta Şef!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Vücudumuz için en faydalı besinleri seçerek harika ve dengeli bir tabak hazırladın!
            </p>

            <div className="w-full flex items-center justify-center gap-2 py-2">
              {players.map((p, idx) => {
                const st = effectiveSelectedStudentIds[idx]
                  ? students?.find(s => s.id === effectiveSelectedStudentIds[idx])
                  : null;
                return (
                  <div key={p.id} className="flex-1 bg-black/40 border border-white/15 rounded-xl p-2">
                    <span className="text-[11px] block font-bold text-slate-300 truncate">
                      {st ? st.name : p.name}
                    </span>
                    <span className="text-base font-black text-amber-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} /> Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Menüye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
