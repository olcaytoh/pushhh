import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  Scale, ShoppingBag, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface NeedWantItem {
  id: string;
  name: string;
  emoji: string;
  isNeed: boolean; // true: Zorunlu İhtiyaç, false: İstek
  explanation: string;
}

export const NEED_WANT_ITEMS: NeedWantItem[] = [
  { id: 'nw-1', name: 'Ekmek ve Temel Gıda', emoji: '🥖', isNeed: true, explanation: 'Beslenme ve yaşamak için temel gıdalar zorunlu bir ihtiyaçtır.' },
  { id: 'nw-2', name: 'Akülü Oyuncak Araba', emoji: '🏎️', isNeed: false, explanation: 'Oyuncaklar eğlencelidir ama yaşamamız için zorunlu bir ihtiyaç değildir, istektir.' },
  { id: 'nw-3', name: 'Temiz İçme Suyu', emoji: '💧', isNeed: true, explanation: 'Su, tüm canlıların hayatta kalması için en temel vazgeçilmez ihtiyaçtır.' },
  { id: 'nw-4', name: 'Kışlık Sıcak Mont', emoji: '🧥', isNeed: true, explanation: 'Soğuk kış günlerinde hastalanmamak için giyinmek zorunlu bir ihtiyaçtır.' },
  { id: 'nw-5', name: 'Video Oyun Konsolu', emoji: '🎮', isNeed: false, explanation: 'Oyun konsolu keyifli bir istektir, olmadan da sağlıklı yaşayabiliriz.' },
  { id: 'nw-6', name: 'Diş Fırçası ve Macun', emoji: '🪥', isNeed: true, explanation: 'Ağız ve diş sağlığımızı korumak temel bir temizlik ihtiyacıdır.' },
  { id: 'nw-7', name: 'Paten ve Kaykay', emoji: '🛹', isNeed: false, explanation: 'Spor ve eğlence aracıdır, bütçemiz uygun olduğunda alınabilecek bir istektir.' },
  { id: 'nw-8', name: 'Okul Defteri ve Kalem', emoji: '✏️', isNeed: true, explanation: 'Eğitim almak ve ders çalışmak için gerekli okul araçları ihtiyaçtır.' },
  { id: 'nw-9', name: 'Pamuk Şeker', emoji: '🍥', isNeed: false, explanation: 'Tatlı bir atıştırmalık olan pamuk şeker isteğe girer.' },
  { id: 'nw-10', name: 'Hasta Olunca Alınan İlaç', emoji: '💊', isNeed: true, explanation: 'İyileşmek ve hayatta kalmak için sağlık ve ilaçlar zorunlu ihtiyaçtır.' }
];

export const getRandomNeedWants = (count: number = 8): NeedWantItem[] => {
  const shuffled = [...NEED_WANT_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface IstekIhtiyacGameProps {
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
  itemIndex: number;
  chosenNeed: boolean | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const IstekIhtiyacGame: React.FC<IstekIhtiyacGameProps> = ({
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

  const [items, setItems] = useState<NeedWantItem[]>(() => getRandomNeedWants(8));

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
    const names = ['1. Tutumlu', '2. Tutumlu', '3. Tutumlu'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Bilinçli Tüketici' : names[i],
        colorName: colors[i],
        score: 0,
        itemIndex: 0,
        chosenNeed: null,
        isCorrect: null,
        showFeedback: false
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

  const handleChoice = (playerIndex: number, isNeedChoice: boolean) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentItem = items[p.itemIndex % items.length];
    const isCorrect = isNeedChoice === currentItem.isNeed;

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
      target.chosenNeed = isNeedChoice;
      target.isCorrect = isCorrect;
      target.showFeedback = true;
      if (isCorrect) {
        target.score += 10;
      }
      next[playerIndex] = target;
      return next;
    });

    setTimeout(() => {
      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        const nextIdx = target.itemIndex + 1;

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
          target.itemIndex = nextIdx;
          target.chosenNeed = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1300);
  };

  const handleResetGame = () => {
    setItems(getRandomNeedWants(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    triggerSound('/nextlvl.mp3');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white">
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

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554] border border-blue-400/80 shadow-md">
            <Scale size={14} className="text-blue-400" />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              İstek mi, İhtiyaç mı? (Tutumluluk)
            </span>
          </div>

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
            const currentItem = items[player.itemIndex % items.length];
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
                      Öğe: {player.itemIndex + 1}/5
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* Eşya Kartı - Görsel ve Yazı Puntosu Büyütüldü */}
                <div className="my-auto py-4 sm:py-6 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-black/60 border-2 sm:border-3 border-blue-400/50 flex flex-col items-center justify-center gap-2.5 shadow-2xl">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-900/40 border-2 border-blue-400/40 flex items-center justify-center shadow-inner">
                    <span className="text-6xl sm:text-7xl md:text-8xl animate-bounce filter drop-shadow-lg">
                      {currentItem.emoji}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-200 text-center tracking-wide drop-shadow-sm">
                    {currentItem.name}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-bold text-cyan-200 text-center">
                    👉 Bu eşya yaşamak için temel bir İHTİYAÇ mı, yoksa eğlenceli bir İSTEK mi?
                  </div>
                </div>

                {/* Seçim Butonları: İhtiyaç mı? İstek mi? */}
                <div className="grid grid-cols-2 gap-2.5 my-2">
                  <button
                    disabled={player.showFeedback}
                    onClick={() => handleChoice(pIdx, true)}
                    className={`py-3.5 sm:py-4 px-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base border-2 sm:border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 shadow-lg ${
                      player.showFeedback
                        ? currentItem.isNeed
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-400 scale-102'
                          : 'opacity-30 bg-slate-800 border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-400'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">🏠</span>
                    <span>ZORUNLU İHTİYAÇ</span>
                  </button>

                  <button
                    disabled={player.showFeedback}
                    onClick={() => handleChoice(pIdx, false)}
                    className={`py-3.5 sm:py-4 px-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base border-2 sm:border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 shadow-lg ${
                      player.showFeedback
                        ? !currentItem.isNeed
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400 scale-102'
                          : 'opacity-30 bg-slate-800 border-slate-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-purple-400'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">✨</span>
                    <span>KEYİFLİ İSTEK</span>
                  </button>
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-1 p-2 rounded-lg bg-black/60 border border-white/10 text-[11px] sm:text-xs text-amber-200 text-center animate-fade-in">
                    <span className={`font-black block ${currentItem.isNeed ? 'text-blue-300' : 'text-amber-300'}`}>
                      {currentItem.isNeed ? '✓ Zorunlu Temel İhtiyaç!' : '✓ Bütçeye Bağlı İstek!'}
                    </span>
                    <span>{currentItem.explanation}</span>
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
          <div className="bg-gradient-to-b from-[#172554] to-[#0b1328] border-2 border-blue-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              ⚖️
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-blue-300 uppercase">
              Tebrikler Tutumlu Kaşif!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              İstek ve ihtiyaçlarını harika ayırt ettin, ailene ve geleceğine katkı sağladın!
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
                    <span className="text-base font-black text-blue-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-300 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
