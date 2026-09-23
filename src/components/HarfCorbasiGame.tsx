import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft,
  HelpCircle, Trash2, Check
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

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
  onQuestionAnswered?: (isCorrect: boolean) => void;
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
  onQuestionAnswered
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
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(true);

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
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(false);

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
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Geri Dön"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#2c1c0c] via-[#45280e] to-[#2c1c0c] border border-orange-400/80 shadow-md">
            <span className="text-sm">🍲</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Harf Çorbası (Anagram)
            </span>
          </div>
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
                      Kelime: {player.wordIndex + 1}/4
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-orange-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* İpucu Kutusu */}
                <div className="bg-black/50 border border-orange-500/30 rounded-xl p-2 mb-2 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-2xl shrink-0">
                    {currentW.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9.5px] uppercase font-bold text-orange-300 tracking-wider">İpucu</div>
                    <div className="text-xs sm:text-sm text-slate-200 font-semibold leading-tight truncate">
                      {currentW.hint}
                    </div>
                  </div>
                </div>

                {/* Çorba Tenceresi & Oluşturulan Kelime Yuvaları */}
                <div className={`p-3 rounded-2xl bg-black/45 border-2 ${
                  player.showError ? 'border-rose-500 animate-shake' : player.isSuccess ? 'border-emerald-400' : 'border-white/20'
                } my-auto flex flex-col items-center gap-2`}>
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
                          className={`w-9 sm:w-11 h-10 sm:h-12 rounded-xl font-black text-lg sm:text-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
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
                <div className="my-2">
                  <div className="text-[10px] text-center font-bold text-amber-300/80 mb-1.5 uppercase">
                    Çorbadaki Harfler
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {currentW.scrambled.map((char, poolIdx) => {
                      const isUsed = player.usedPoolIndices.includes(poolIdx);
                      return (
                        <button
                          key={poolIdx}
                          disabled={isUsed || player.isSuccess !== null}
                          onClick={() => handlePickLetter(pIdx, char, poolIdx)}
                          className={`w-8 sm:w-10 h-9 sm:h-11 rounded-xl font-black text-base sm:text-xl transition-all shadow cursor-pointer active:scale-95 ${
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

                {/* Butonlar: Temizle & Kontrol Et */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/15">
                  <button
                    onClick={() => handleClearLetters(pIdx)}
                    disabled={player.placedLetters.length === 0 || player.isSuccess !== null}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Harfleri Temizle"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden xs:inline">Temizle</span>
                  </button>
                  <button
                    onClick={() => handleCheckWord(pIdx)}
                    disabled={player.placedLetters.length !== currentW.word.length || player.isSuccess !== null}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Check size={16} /> KONTROL ET
                  </button>
                </div>
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
