import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  HelpCircle, Trash2, Check
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { TurkishActivityBackground } from './TurkishActivityBackground';

export interface HarfCorbasiWord {
  id: string;
  word: string;
  scrambled: string[];
  hint: string;
  emoji: string;
}

export const HARF_CORBASI_WORDS: HarfCorbasiWord[] = [
  {
    id: 'hc-1',
    word: 'ASLAN',
    scrambled: ['S', 'L', 'A', 'N', 'A'],
    hint: 'Ormanların kralı olarak bilinen yeleli hayvan',
    emoji: '🦁'
  },
  {
    id: 'hc-2',
    word: 'GÜNEŞ',
    scrambled: ['Ş', 'N', 'G', 'E', 'Ü'],
    hint: 'Dünyamızı ısıtan ve aydınlatan gök cismi',
    emoji: '☀️'
  },
  {
    id: 'hc-3',
    word: 'TAVŞAN',
    scrambled: ['Ş', 'A', 'T', 'N', 'V', 'A'],
    hint: 'Havuç seven, uzun kulaklı sevimli hayvan',
    emoji: '🐰'
  },
  {
    id: 'hc-4',
    word: 'KİTAP',
    scrambled: ['P', 'T', 'K', 'İ', 'A'],
    hint: 'Sayfalarında bilgiler ve maceralar saklayan hazine',
    emoji: '📚'
  },
  {
    id: 'hc-5',
    word: 'KELEBEK',
    scrambled: ['E', 'B', 'K', 'L', 'E', 'K', 'E'],
    hint: 'Tırtıldan dönüşen, rengarenk kanatlı sevimli böcek',
    emoji: '🦋'
  },
  {
    id: 'hc-6',
    word: 'ŞEMSİYE',
    scrambled: ['M', 'Ş', 'E', 'Y', 'İ', 'S', 'E'],
    hint: 'Yağmurlu günlerde bizi ıslanmaktan korur',
    emoji: '☂️'
  },
  {
    id: 'hc-7',
    word: 'DÜNYA',
    scrambled: ['N', 'Y', 'D', 'A', 'Ü'],
    hint: 'Üzerinde yaşadığımız mavi gezegen',
    emoji: '🌍'
  },
  {
    id: 'hc-8',
    word: 'ELMA',
    scrambled: ['M', 'A', 'E', 'L'],
    hint: 'Kırmızı veya yeşil, çok lezzetli vitaminli meyve',
    emoji: '🍎'
  },
  {
    id: 'hc-9',
    word: 'YILDIZ',
    scrambled: ['D', 'Z', 'Y', 'I', 'L', 'I'],
    hint: 'Geceleri gökyüzünde ışıl ışıl parlar',
    emoji: '⭐'
  },
  {
    id: 'hc-10',
    word: 'BALIK',
    scrambled: ['L', 'K', 'B', 'I', 'A'],
    hint: 'Denizlerde ve göllerde yüzen pullu canlı',
    emoji: '🐟'
  }
];

export const getRandomCorbaWords = (count: number = 6): HarfCorbasiWord[] => {
  const shuffled = [...HARF_CORBASI_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(item => {
    // Shuffle the letters so each match feels fresh
    const letters = item.word.split('').sort(() => Math.random() - 0.5);
    return { ...item, scrambled: letters };
  });
};

interface HarfCorbasiGameProps {
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
  wordIndex: number;
  placedLetters: { char: string; poolIndex: number }[];
  usedPoolIndices: number[];
  isSuccess: boolean | null;
  showError: boolean;
}

export const HarfCorbasiGame: React.FC<HarfCorbasiGameProps> = ({
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

  const [words, setWords] = useState<HarfCorbasiWord[]>(() => getRandomCorbaWords(6));

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
    const names = ['1. Aşçı', '2. Aşçı', '3. Aşçı'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Harf Çorbası Ustası' : names[i],
        colorName: colors[i],
        score: 0,
        wordIndex: 0,
        placedLetters: [],
        usedPoolIndices: [],
        isSuccess: null,
        showError: false
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

  // Click letter from pool to put in soup bowl
  const handlePickLetter = (playerIndex: number, char: string, poolIndex: number) => {
    const p = players[playerIndex];
    if (p.usedPoolIndices.includes(poolIndex) || p.isSuccess || gameOver) return;

    triggerSound('/op.mp3');

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.placedLetters = [...target.placedLetters, { char, poolIndex }];
      target.usedPoolIndices = [...target.usedPoolIndices, poolIndex];
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  // Remove letter from placed word
  const handleRemoveLetter = (playerIndex: number, placedIdx: number) => {
    const p = players[playerIndex];
    if (p.isSuccess || gameOver) return;

    triggerSound('/op.mp3');

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      const itemToRemove = target.placedLetters[placedIdx];
      target.placedLetters = target.placedLetters.filter((_, i) => i !== placedIdx);
      target.usedPoolIndices = target.usedPoolIndices.filter(idx => idx !== itemToRemove.poolIndex);
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  const handleClearLetters = (playerIndex: number) => {
    triggerSound('/op.mp3');
    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.placedLetters = [];
      target.usedPoolIndices = [];
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  const handleCheckWord = (playerIndex: number) => {
    const p = players[playerIndex];
    const currentW = words[p.wordIndex % words.length];
    const assembled = p.placedLetters.map(l => l.char).join('');

    if (assembled === currentW.word) {
      triggerSound('/farklilvl.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);

      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        target.isSuccess = true;
        target.score += 15;
        next[playerIndex] = target;
        return next;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          const target = { ...next[playerIndex] };
          const nextIdx = target.wordIndex + 1;

          if (nextIdx >= 4) {
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
            target.wordIndex = nextIdx;
            target.placedLetters = [];
            target.usedPoolIndices = [];
            target.isSuccess = null;
            target.showError = false;
          }
          next[playerIndex] = target;
          return next;
        });
      }, 1200);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);

      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        target.showError = true;
        next[playerIndex] = target;
        return next;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          next[playerIndex] = { ...next[playerIndex], showError: false };
          return next;
        });
      }, 800);
    }
  };

  const handleResetGame = () => {
    setWords(getRandomCorbaWords(6));
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
      {/* 1. TÜRKÇE TEMALI ÖZEL GÖRSEL ARKA PLAN */}
      <TurkishActivityBackground darkness="normal" />

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentW = words[sPlayer.wordIndex % words.length];
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
                            • Harf Çorbası
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_26.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.wordIndex + 1}/4
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-2 min-h-0 w-full overflow-hidden">
                    <div className={`relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 ${
                      sPlayer.showError ? 'border-rose-500 animate-shake' : sPlayer.isSuccess ? 'border-emerald-400' : 'border-slate-700/70'
                    } shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-3 sm:p-5 flex flex-col items-center justify-between text-center overflow-hidden min-h-0 w-full`}>
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      {/* İpucu Rozeti */}
                      <div className="relative z-10 flex items-center gap-2.5 px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl bg-orange-950/80 border-2 border-orange-500/50 shadow-md shrink-0">
                        <span className="text-2xl sm:text-3xl shrink-0">{currentW.emoji}</span>
                        <span className="text-sm sm:text-base md:text-lg font-black text-orange-200">{currentW.hint}</span>
                      </div>

                      {/* Oluşturulan Kelime Yuvaları */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-2 sm:gap-3 py-1">
                        <div className="text-xs sm:text-sm md:text-base font-extrabold text-amber-200 tracking-wide">
                          🍲 Harfleri tıkla, doğru kelimeyi tabağa diz:
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          {Array.from({ length: currentW.word.length }).map((_, idx) => {
                            const placed = sPlayer.placedLetters[idx];
                            return (
                              <button
                                key={idx}
                                onClick={() => placed && handleRemoveLetter(0, idx)}
                                className={`w-11 sm:w-14 md:w-16 h-13 sm:h-16 md:h-18 rounded-2xl font-black text-2xl sm:text-3xl md:text-4xl border-2 sm:border-3 flex items-center justify-center transition-all cursor-pointer ${
                                  sPlayer.isSuccess
                                    ? 'bg-emerald-500 text-white border-emerald-300 shadow-xl scale-105'
                                    : placed
                                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-white/10 border-dashed border-white/40 text-transparent hover:bg-white/15'
                                }`}
                              >
                                {placed ? placed.char : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Çorbadaki Harfler */}
                      <div className="relative z-10 w-full shrink-0 flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className="text-xs sm:text-sm font-black text-center text-amber-300 uppercase tracking-widest">
                          ÇORBADAKİ HARFLER
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                          {currentW.scrambled.map((char, poolIdx) => {
                            const isUsed = sPlayer.usedPoolIndices.includes(poolIdx);
                            return (
                              <button
                                key={poolIdx}
                                disabled={isUsed || sPlayer.isSuccess !== null}
                                onClick={() => handlePickLetter(0, char, poolIdx)}
                                className={`w-11 sm:w-13 md:w-15 h-13 sm:h-15 md:h-17 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all shadow-md cursor-pointer active:scale-95 ${
                                  isUsed
                                    ? 'opacity-20 bg-slate-800 border border-slate-700 pointer-events-none'
                                    : 'bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 border-2 border-amber-200 hover:scale-105'
                                }`}
                              >
                                {char}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: ACTIONS (TEMİZLE & KONTROL ET) */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-1 shrink-0 w-full mt-1">
                    <button
                      onClick={() => handleClearLetters(0)}
                      disabled={sPlayer.placedLetters.length === 0 || sPlayer.isSuccess !== null}
                      className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 border border-slate-700 shadow-md active:scale-95"
                      title="Harfleri Temizle"
                    >
                      <RotateCcw size={16} />
                      <span>Temizle</span>
                    </button>
                    <button
                      onClick={() => handleCheckWord(0)}
                      disabled={sPlayer.placedLetters.length !== currentW.word.length || sPlayer.isSuccess !== null}
                      className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base md:text-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 uppercase tracking-wider active:scale-95"
                    >
                      <Check size={20} /> KONTROL ET
                    </button>
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
            const currentW = words[player.wordIndex % words.length];
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
                      Kelime: {player.wordIndex + 1}/4
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-orange-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* İpucu Kutusu */}
                <div className="bg-black/50 border border-orange-500/30 rounded-xl p-1.5 mb-1 flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-xl shrink-0">
                    {currentW.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] uppercase font-bold text-orange-300 tracking-wider">İpucu</div>
                    <div className="text-xs sm:text-sm text-slate-200 font-semibold leading-tight truncate">
                      {currentW.hint}
                    </div>
                  </div>
                </div>

                {/* 2. BÖLÜM: Çorba Tenceresi & Oluşturulan Kelime Yuvaları (3 Bölümlü Dengeli Orta Alan) */}
                <div className={`p-2 sm:p-2.5 rounded-2xl bg-black/45 border-2 ${
                  player.showError ? 'border-rose-500 animate-shake' : player.isSuccess ? 'border-emerald-400' : 'border-white/20'
                } flex-1 min-h-0 my-1 flex flex-col items-center justify-center gap-1.5`}>
                  <div className="text-[10.5px] font-bold text-slate-300">
                    🍲 Harfleri tıkla, doğru kelimeyi tabağa diz:
                  </div>

                  {/* Kelime Yuvaları */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {Array.from({ length: currentW.word.length }).map((_, idx) => {
                      const placed = player.placedLetters[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => placed && handleRemoveLetter(pIdx, idx)}
                          className={`w-8 sm:w-10 h-9 sm:h-11 rounded-xl font-black text-base sm:text-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            player.isSuccess
                              ? 'bg-emerald-500 text-white border-emerald-300 shadow-lg scale-105'
                              : placed
                              ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-md hover:scale-105'
                              : 'bg-white/10 border-dashed border-white/30 text-transparent'
                          }`}
                        >
                          {placed ? placed.char : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Karışık Harfler Havuzu */}
                <div className="my-1 shrink-0">
                  <div className="text-[9.5px] text-center font-bold text-amber-300/80 mb-1 uppercase">
                    Çorbadaki Harfler
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                    {currentW.scrambled.map((char, poolIdx) => {
                      const isUsed = player.usedPoolIndices.includes(poolIdx);
                      return (
                        <button
                          key={poolIdx}
                          disabled={isUsed || player.isSuccess !== null}
                          onClick={() => handlePickLetter(pIdx, char, poolIdx)}
                          className={`w-7 sm:w-9 h-8 sm:h-10 rounded-xl font-black text-sm sm:text-lg transition-all shadow cursor-pointer active:scale-95 ${
                            isUsed
                              ? 'opacity-20 bg-slate-800 border border-slate-700 pointer-events-none'
                              : 'bg-gradient-to-b from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950 border border-orange-300'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. BÖLÜM: Butonlar: Temizle & Kontrol Et */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/15 shrink-0">
                  <button
                    onClick={() => handleClearLetters(pIdx)}
                    disabled={player.placedLetters.length === 0 || player.isSuccess !== null}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Harfleri Temizle"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden xs:inline">Temizle</span>
                  </button>
                  <button
                    onClick={() => handleCheckWord(pIdx)}
                    disabled={player.placedLetters.length !== currentW.word.length || player.isSuccess !== null}
                    className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Check size={16} /> KONTROL ET
                  </button>
                </div>
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
          <div className="bg-gradient-to-b from-[#2e1d0f] to-[#120b05] border-2 border-orange-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🍲
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-orange-300 uppercase">
              Harf Çorbası Hazır!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Kelimeleri ustalıkla çözdün ve lezzetli harf çorbalarını afiyetle pişirdin!
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
                    <span className="text-base font-black text-orange-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
