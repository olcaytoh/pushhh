import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  Trash2, ShieldCheck, Leaf
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export type BinType = 'kagit' | 'plastik' | 'cam' | 'organik' | 'pil';

export interface WasteItem {
  id: string;
  name: string;
  emoji: string;
  bin: BinType;
  binName: string;
  explanation: string;
}

export const RECYCLING_BINS: { type: BinType; name: string; color: string; border: string; bg: string; icon: string }[] = [
  { type: 'kagit', name: 'Kağıt', color: 'text-blue-300', border: 'border-blue-400', bg: 'bg-blue-600/30 hover:bg-blue-600/50', icon: '📄' },
  { type: 'plastik', name: 'Plastik', color: 'text-yellow-300', border: 'border-yellow-400', bg: 'bg-yellow-600/30 hover:bg-yellow-600/50', icon: '🧴' },
  { type: 'cam', name: 'Cam', color: 'text-emerald-300', border: 'border-emerald-400', bg: 'bg-emerald-600/30 hover:bg-emerald-600/50', icon: '🍾' },
  { type: 'organik', name: 'Organik', color: 'text-amber-300', border: 'border-amber-600', bg: 'bg-amber-800/30 hover:bg-amber-800/50', icon: '🍎' },
  { type: 'pil', name: 'Pil/Elektronik', color: 'text-rose-300', border: 'border-rose-400', bg: 'bg-rose-600/30 hover:bg-rose-600/50', icon: '🔋' }
];

export const WASTE_ITEMS: WasteItem[] = [
  { id: 'w-1', name: 'Plastik Su Şişesi', emoji: '🧴', bin: 'plastik', binName: 'Plastik Kutusu', explanation: 'Pet şişeler plastik geri dönüşüm kutusuna atılır.' },
  { id: 'w-2', name: 'Muz Kabuğu', emoji: '🍌', bin: 'organik', binName: 'Organik Atık Kutusu', explanation: 'Meyve ve sebze artıkları kompost ve organik atıktır.' },
  { id: 'w-3', name: 'Eski Gazete', emoji: '📰', bin: 'kagit', binName: 'Kağıt Kutusu', explanation: 'Gazeteler ve dergiler kağıt geri dönüşümüne girer.' },
  { id: 'w-4', name: 'Kırık Cam Bardak', emoji: '🥛', bin: 'cam', binName: 'Cam Kutusu', explanation: 'Cam şişe ve kavanozlar cam kumbarasına atılır.' },
  { id: 'w-5', name: 'Bitmiş Kalem Pil', emoji: '🔋', bin: 'pil', binName: 'Atık Pil Kutusu', explanation: 'Piller toprağa ve suya zarar vermemesi için atık pil kutusuna konur.' },
  { id: 'w-6', name: 'Karton Ayakkabı Kutusu', emoji: '📦', bin: 'kagit', binName: 'Kağıt Kutusu', explanation: 'Karton ve mukavvalar kağıt geri dönüşüm kutusuna atılır.' },
  { id: 'w-7', name: 'Poşet ve Ambalaj', emoji: '🛍️', bin: 'plastik', binName: 'Plastik Kutusu', explanation: 'Naylon poşetler ve ambalajlar plastik kutusuna atılmalıdır.' },
  { id: 'w-8', name: 'Elma Çöpü / Koçanı', emoji: '🍏', bin: 'organik', binName: 'Organik Atık Kutusu', explanation: 'Meyve artıkları doğada çözünen organik atıktır.' },
  { id: 'w-9', name: 'Reçel Kavanozu', emoji: '🫙', bin: 'cam', binName: 'Cam Kutusu', explanation: 'Cam kavanozlar sonsuz kez geri dönüştürülebilir.' },
  { id: 'w-10', name: 'Şampuan Şişesi', emoji: '🧼', bin: 'plastik', binName: 'Plastik Kutusu', explanation: 'Şampuan ve deterjan kutuları plastik atıktır.' }
];

export const getRandomWasteItems = (count: number = 8): WasteItem[] => {
  const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface GeriDonusumGameProps {
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
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'rose' | 'blue' | 'emerald';
  score: number;
  itemIndex: number;
  chosenBin: BinType | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const GeriDonusumGame: React.FC<GeriDonusumGameProps> = ({
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
  onQuestionAnswered,
  onGameCompleted
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [items, setItems] = useState<WasteItem[]>(() => getRandomWasteItems(8));

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
    const names = ['1. Kahraman', '2. Kahraman', '3. Kahraman'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Çevre Kahramanı' : names[i],
        colorName: colors[i],
        score: 0,
        itemIndex: 0,
        chosenBin: null,
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

  const handleSelectBin = (playerIndex: number, bin: BinType) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentItem = items[p.itemIndex % items.length];
    const isCorrect = bin === currentItem.bin;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);
    }

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.chosenBin = bin;
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
          onGameCompleted?.(playerIndex, playerMode);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          target.itemIndex = nextIdx;
          target.chosenBin = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1300);
  };

  const handleResetGame = () => {
    setItems(getRandomWasteItems(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    triggerSound('/op.mp3');
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

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentItem = items[sPlayer.itemIndex % items.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              <div className="flex-1 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    <div className="flex items-center gap-1.5 min-w-0 h-full">
                      {sStudent ? (
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${sStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                          title={`Aktif Öğrenci: ${sStudent.name}`}
                        >
                          {sStudent.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                            {sStudent ? sStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • Geri Dönüşüm
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_27.png" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.itemIndex + 1}/5
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-2 min-h-0 w-full overflow-hidden">
                    <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-3 sm:p-5 flex flex-col items-center justify-between text-center overflow-hidden min-h-0 w-full">
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      <div className="relative z-10 flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-950/80 border-2 border-emerald-400/60 text-emerald-200 font-black text-xs sm:text-sm md:text-base uppercase shadow-md shrink-0">
                        ♻️ Bu atığı hangi geri dönüşüm kutusuna atmalıyız?
                      </div>

                      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-2 py-1">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-emerald-500/25 to-teal-900/40 border-2 border-emerald-400/50 flex items-center justify-center shadow-inner">
                          <span className="text-6xl sm:text-7xl md:text-8xl animate-bounce filter drop-shadow-xl">
                            {currentItem.emoji}
                          </span>
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-200 text-center tracking-wide drop-shadow-md mt-1">
                          {currentItem.name}
                        </div>
                      </div>

                      {sPlayer.showFeedback && (
                        <div className="relative z-10 p-2 rounded-xl bg-black/80 border border-white/20 text-xs sm:text-sm text-amber-200 text-center animate-fade-in shrink-0 w-full shadow-lg">
                          <span className="font-black text-emerald-300 mr-1.5">{currentItem.binName}:</span>
                          <span className="font-semibold">{currentItem.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM: GERİ DÖNÜŞÜM KUTULARI (5 KUTU) */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full shrink-0 mt-1 sm:mt-2">
                    {RECYCLING_BINS.map((bin) => {
                      const isChosen = sPlayer.chosenBin === bin.type;
                      const isRight = bin.type === currentItem.bin;
                      let binStyle = `${bin.bg} ${bin.border}`;

                      if (sPlayer.showFeedback) {
                        if (isRight) {
                          binStyle = 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-400 scale-102';
                        } else if (isChosen && !isRight) {
                          binStyle = 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400';
                        } else {
                          binStyle = 'opacity-30 border-slate-700 bg-slate-800';
                        }
                      }

                      return (
                        <button
                          key={bin.type}
                          disabled={sPlayer.showFeedback}
                          onClick={() => handleSelectBin(0, bin.type)}
                          className={`fast-quiz-btn relative flex flex-col items-center justify-between p-2 sm:p-2.5 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] rounded-2xl border-2 transition-all cursor-pointer active:scale-95 shadow-md ${binStyle}`}
                        >
                          <span className="text-2xl sm:text-3xl md:text-4xl leading-none drop-shadow-sm">{bin.icon}</span>
                          <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-tight mt-1 truncate max-w-full ${bin.color}`}>
                            {bin.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })() : (
        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${
          playerMode === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
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
                className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-2.5 flex flex-col justify-between shadow-xl backdrop-blur-sm min-h-0 overflow-y-auto no-scrollbar`}
              >
                {/* 1. BÖLÜM: Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1 shrink-0 h-7 sm:h-8">
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
                      Atık: {player.itemIndex + 1}/5
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* 2. BÖLÜM: Atık Nesnesi Kartı - 3 Bölümlü Dengeli Orta Alan */}
                <div className="flex-1 min-h-0 my-1 py-2 sm:py-3 px-3 sm:px-4 rounded-2xl bg-black/60 border-2 border-emerald-400/40 flex flex-col items-center justify-center gap-1.5 sm:gap-2 shadow-xl">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border-2 border-emerald-400/40 flex items-center justify-center shadow-inner shrink-0">
                    <span className="text-5xl sm:text-6xl md:text-7xl animate-bounce filter drop-shadow-lg">
                      {currentItem.emoji}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black text-amber-200 text-center tracking-wide drop-shadow-sm">
                    {currentItem.name}
                  </div>
                  <div className="text-[11px] sm:text-xs md:text-sm font-bold text-emerald-300 text-center">
                    👉 Bu atığı hangi geri dönüşüm kutusuna atmalıyız?
                  </div>
                </div>

                {/* 3. BÖLÜM: Geri Dönüşüm Kutuları */}
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 my-1 shrink-0">
                  {RECYCLING_BINS.map((bin) => {
                    const isChosen = player.chosenBin === bin.type;
                    const isRight = bin.type === currentItem.bin;
                    let binStyle = `${bin.bg} ${bin.border}`;

                    if (player.showFeedback) {
                      if (isRight) {
                        binStyle = 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-400 scale-105';
                      } else if (isChosen && !isRight) {
                        binStyle = 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400';
                      } else {
                        binStyle = 'opacity-30 border-slate-700 bg-slate-800';
                      }
                    }

                    return (
                      <button
                        key={bin.type}
                        disabled={player.showFeedback}
                        onClick={() => handleSelectBin(pIdx, bin.type)}
                        className={`flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-95 shadow-md ${binStyle}`}
                      >
                        <span className="text-xl sm:text-2xl md:text-3xl leading-none">{bin.icon}</span>
                        <span className={`text-[8.5px] sm:text-[10px] md:text-xs font-black uppercase tracking-tight mt-0.5 truncate max-w-full ${bin.color}`}>
                          {bin.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-0.5 p-1.5 rounded-lg bg-black/60 border border-white/10 text-[10px] sm:text-xs text-amber-200 text-center animate-fade-in shrink-0">
                    <span className="font-black text-emerald-300 block">{currentItem.binName}</span>
                    <span className="line-clamp-2">{currentItem.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </main>

      {/* Student Avatar Dock (Single Row) */}
      {students && onOpenRosterModal && (
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
          <div className="bg-gradient-to-b from-[#0f2c1d] to-[#06140d] border-2 border-emerald-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🌱
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-300 uppercase">
              Doğa Sana Teşekkür Ediyor!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Atıkları doğru kutulara ayırarak çevremizi ve geleceğimizi korudun!
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
                    <span className="text-base font-black text-emerald-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
