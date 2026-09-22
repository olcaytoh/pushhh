import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Maximize2, Minimize2, RotateCcw, Trophy, 
  HelpCircle, Volume2, VolumeX, Sparkles, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Home, BookOpen, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  TURKISH_ALPHABET, 
  generateRoundWords, 
  isWordsAlphabeticalOrder, 
  sortWordsAlphabetically 
} from '../data/kelimeSiralaData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface KelimeSiralaGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  initialGradeGroup?: '1-2' | '3-4';
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
}

type GradeGroup = '1-2' | '3-4';
type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'blue' | 'pink' | 'orange';
  score: number;
  upperSlots: (string | null)[];
  availableWords: string[];
  status: 'idle' | 'checking' | 'correct' | 'wrong';
  shake: boolean;
}

export const KelimeSiralaGame: React.FC<KelimeSiralaGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  initialGradeGroup = '1-2',
  playerCountMode = 2,
  onSwitchPlayerCountMode,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
}) => {
  // Config state
  const [gradeGroup, setGradeGroup] = useState<GradeGroup>(initialGradeGroup);

  useEffect(() => {
    if (initialGradeGroup) {
      setGradeGroup(initialGradeGroup);
      setCurrentRound(1);
      setGameOver(false);
      setRoundWinner(null);
    }
  }, [initialGradeGroup]);

  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 2);

  // Local student selection state
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

  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDictionaryGuide, setShowDictionaryGuide] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Round data
  const wordCount: 3 | 4 = gradeGroup === '1-2' ? 3 : 4;
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [sortedRoundWords, setSortedRoundWords] = useState<string[]>([]);

  // Drag-and-drop transfer state tracking
  const dragItemRef = useRef<{ playerIdx: number; word: string; from: 'source' | 'target'; index: number } | null>(null);

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      playMp3(src);
    }
  }, [soundEnabled, playMp3]);

  // Players initial configuration
  const createInitialPlayers = useCallback((mode: PlayerMode, words: string[], count: number): PlayerState[] => {
    if (mode === 1) {
      return [
        {
          id: 1,
          name: '1. Oyuncu',
          colorName: 'blue',
          score: 0,
          upperSlots: Array(count).fill(null),
          availableWords: [...words],
          status: 'idle',
          shake: false
        }
      ];
    }

    const list: PlayerState[] = [
      {
        id: 1,
        name: '1. Oyuncu',
        colorName: 'blue',
        score: 0,
        upperSlots: Array(count).fill(null),
        availableWords: [...words],
        status: 'idle',
        shake: false
      },
      {
        id: 2,
        name: '2. Oyuncu',
        colorName: mode === 2 ? 'pink' : 'orange',
        score: 0,
        upperSlots: Array(count).fill(null),
        availableWords: [...words],
        status: 'idle',
        shake: false
      }
    ];

    if (mode === 3) {
      list.push({
        id: 3,
        name: '3. Oyuncu',
        colorName: 'pink',
        score: 0,
        upperSlots: Array(count).fill(null),
        availableWords: [...words],
        status: 'idle',
        shake: false
      });
    }

    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>([]);

  // Start new round
  const startNewRound = useCallback((roundNum: number, grade: GradeGroup, mode: PlayerMode, resetScores = false) => {
    const count: 3 | 4 = grade === '1-2' ? 3 : 4;
    const { originalSorted, scrambled } = generateRoundWords(count);
    setRoundWords(scrambled);
    setSortedRoundWords(originalSorted);
    setCurrentRound(roundNum);
    setRoundWinner(null);

    setPlayers(prev => {
      const existingScores = resetScores ? [0, 0, 0] : prev.map(p => p.score);
      const newPlayers = createInitialPlayers(mode, scrambled, count);
      return newPlayers.map((p, idx) => ({
        ...p,
        score: existingScores[idx] || 0
      }));
    });
  }, [createInitialPlayers]);

  // Initial load
  useEffect(() => {
    startNewRound(1, gradeGroup, playerMode, true);
  }, []);

  // Synchronize playerMode when playerCountMode prop changes
  useEffect(() => {
    if (playerCountMode && (playerCountMode === 1 || playerCountMode === 2 || playerCountMode === 3)) {
      if (playerCountMode !== playerMode) {
        setPlayerMode(playerCountMode);
        setGameOver(false);
        startNewRound(1, gradeGroup, playerCountMode, true);
      }
    }
  }, [playerCountMode, playerMode, gradeGroup, startNewRound]);

  // Handle Grade Change
  const handleGradeChange = (newGrade: GradeGroup) => {
    triggerSound('/op.mp3');
    setGradeGroup(newGrade);
    setGameOver(false);
    startNewRound(1, newGrade, playerMode, true);
  };

  // Handle Player Mode Change
  const handlePlayerModeChange = (newMode: PlayerMode) => {
    triggerSound('/op.mp3');
    setPlayerMode(newMode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(newMode);
    }
    setGameOver(false);
    startNewRound(1, gradeGroup, newMode, true);
  };

  // Reset entire game
  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setGameOver(false);
    startNewRound(1, gradeGroup, playerMode, true);
  };

  // Move word from available to first empty slot (TAP to PLACE)
  const handleTapSourceWord = (playerIdx: number, word: string, wordIndex: number) => {
    if (roundWinner !== null) return;
    triggerSound('/tek.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const emptySlotIdx = p.upperSlots.indexOf(null);
      if (emptySlotIdx === -1) return prev; // Upper slots already full

      const newUpper = [...p.upperSlots];
      newUpper[emptySlotIdx] = word;

      const newAvailable = [...p.availableWords];
      newAvailable.splice(wordIndex, 1);

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableWords: newAvailable,
        status: 'idle'
      };
      return nextPlayers;
    });
  };

  // Move word from upper slot back to available (TAP to RETURN)
  const handleTapUpperSlot = (playerIdx: number, slotIndex: number) => {
    if (roundWinner !== null) return;
    triggerSound('/dtt.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const word = p.upperSlots[slotIndex];
      if (!word) return prev;

      const newUpper = [...p.upperSlots];
      newUpper[slotIndex] = null;

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableWords: [...p.availableWords, word],
        status: 'idle'
      };
      return nextPlayers;
    });
  };

  // Reset a specific player's slots back to lower tray
  const handleResetPlayerSlots = (playerIdx: number) => {
    if (roundWinner !== null) return;
    triggerSound('/dtt.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: Array(wordCount).fill(null),
        availableWords: [...roundWords],
        status: 'idle',
        shake: false
      };
      return nextPlayers;
    });
  };

  // HTML5 Drag & Drop handlers
  const handleDragStartSource = (e: React.DragEvent, playerIdx: number, word: string, index: number) => {
    dragItemRef.current = { playerIdx, word, from: 'source', index };
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDragStartTarget = (e: React.DragEvent, playerIdx: number, word: string, index: number) => {
    dragItemRef.current = { playerIdx, word, from: 'target', index };
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDropOnTarget = (e: React.DragEvent, playerIdx: number, targetSlotIndex: number) => {
    e.preventDefault();
    const item = dragItemRef.current;
    if (!item || item.playerIdx !== playerIdx || roundWinner !== null) return;

    triggerSound('/tek.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const newUpper = [...p.upperSlots];
      const newAvailable = [...p.availableWords];

      if (item.from === 'source') {
        const existingInTarget = newUpper[targetSlotIndex];
        newUpper[targetSlotIndex] = item.word;
        newAvailable.splice(item.index, 1);
        if (existingInTarget) {
          newAvailable.push(existingInTarget);
        }
      } else if (item.from === 'target') {
        // Swap slots inside upper row
        const existingInTarget = newUpper[targetSlotIndex];
        newUpper[targetSlotIndex] = item.word;
        newUpper[item.index] = existingInTarget;
      }

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableWords: newAvailable,
        status: 'idle'
      };
      return nextPlayers;
    });

    dragItemRef.current = null;
  };

  // "KONTROL ET / ÇALIŞTIR" BUTTON CHECK
  const handleExecuteCheck = (playerIdx: number) => {
    if (roundWinner !== null) return;

    const p = players[playerIdx];
    if (!p) return;

    // Must fill all slots first
    if (p.upperSlots.some(s => s === null)) {
      triggerSound('/hata.mp3');
      setPlayers(prev => {
        const next = [...prev];
        next[playerIdx] = { ...next[playerIdx], shake: true };
        return next;
      });
      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], shake: false };
          return next;
        });
      }, 500);
      return;
    }

    const isCorrect = isWordsAlphabeticalOrder(p.upperSlots);

    if (isCorrect) {
      // WINNER OF THIS ROUND!
      setRoundWinner(playerIdx);
      triggerSound('/coin.mp3');

      if (onQuestionAnswered) {
        onQuestionAnswered(true);
      }

      // Confetti burst
      const isLeft = playerIdx === 0;
      const isRight = playerIdx === (players.length - 1);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { x: isLeft ? 0.25 : isRight ? 0.75 : 0.5, y: 0.6 }
      });

      setPlayers(prev => {
        const next = [...prev];
        next[playerIdx] = {
          ...next[playerIdx],
          score: next[playerIdx].score + 1,
          status: 'correct'
        };
        return next;
      });

      // Advance round or end game after 2.4s
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          setGameOver(true);
          triggerSound('/para.mp3');
          confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.5 } });
        } else {
          startNewRound(currentRound + 1, gradeGroup, playerMode, false);
        }
      }, 2400);
    } else {
      // INCORRECT ORDER
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) {
        onQuestionAnswered(false);
      }
      setPlayers(prev => {
        const next = [...prev];
        next[playerIdx] = {
          ...next[playerIdx],
          status: 'wrong',
          shake: true
        };
        return next;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          if (next[playerIdx]) {
            next[playerIdx] = {
              ...next[playerIdx],
              status: 'idle',
              shake: false
            };
          }
          return next;
        });
      }, 900);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Player themes
  const getPlayerTheme = (colorName: 'blue' | 'pink' | 'orange') => {
    switch (colorName) {
      case 'blue':
        return {
          bgGrad: 'from-[#0b1536] via-[#091b40] to-[#04091a]',
          cardBg: 'bg-blue-950/70 border-cyan-400/50',
          portalGlow: 'shadow-[0_0_50px_rgba(6,182,212,0.85)]',
          portalRing1: 'border-cyan-400',
          portalInner: 'bg-radial from-cyan-400/40 via-blue-600/50 to-blue-950',
          coreRing: 'border-cyan-300',
          slotEmpty: 'bg-blue-950/50 border-cyan-500/40 text-cyan-300',
          slotFilled: 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]',
          pillHeader: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          runBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95'
        };
      case 'pink':
        return {
          bgGrad: 'from-[#2b0824] via-[#36092e] to-[#140212]',
          cardBg: 'bg-pink-950/70 border-pink-400/50',
          portalGlow: 'shadow-[0_0_50px_rgba(244,114,182,0.85)]',
          portalRing1: 'border-pink-400',
          portalInner: 'bg-radial from-pink-400/40 via-rose-600/50 to-pink-950',
          coreRing: 'border-pink-300',
          slotEmpty: 'bg-pink-950/50 border-pink-500/40 text-pink-300',
          slotFilled: 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-300 text-white shadow-[0_0_15px_rgba(244,114,182,0.6)]',
          pillHeader: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
          runBtn: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white border-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.5)] active:scale-95'
        };
      case 'orange':
      default:
        return {
          bgGrad: 'from-[#301602] via-[#3b1c05] to-[#170a01]',
          cardBg: 'bg-amber-950/70 border-amber-400/50',
          portalGlow: 'shadow-[0_0_50px_rgba(245,158,11,0.85)]',
          portalRing1: 'border-amber-400',
          portalInner: 'bg-radial from-amber-400/40 via-orange-600/50 to-amber-950',
          coreRing: 'border-amber-300',
          slotEmpty: 'bg-amber-950/50 border-amber-500/40 text-amber-300',
          slotFilled: 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]',
          pillHeader: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          runBtn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-white select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER / APP BAR */}
      <header className="relative z-20 shrink-0 h-12 sm:h-14 bg-slate-950/90 border-b border-slate-800/80 px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Back & Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              onClose();
            }}
            title="Geri Dön"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Geri</span>
          </button>

          {onGoHome && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onGoHome();
              }}
              title="Ana Sayfa"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onPrevActivity();
              }}
              title="Önceki Etkinlik"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onNextActivity();
              }}
              title="Sonraki Etkinlik"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Title badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-400/40">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h1 className="text-xs sm:text-sm font-black text-indigo-200 tracking-wide uppercase">
              Kelime Sıralama (Sözlük Sırası)
            </h1>
          </div>
        </div>

        {/* Center: Grade Group & Player Count Toggles */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Grade group tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => handleGradeChange('1-2')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                gradeGroup === '1-2'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="1 ve 2. Sınıf: 3 Kelime (Kısa & Basit)"
            >
              1-2. Sınıf (3 Kelime)
            </button>
            <button
              onClick={() => handleGradeChange('3-4')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                gradeGroup === '3-4'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3 ve 4. Sınıf: 4 Kelime"
            >
              3-4. Sınıf (4 Kelime)
            </button>
          </div>

          {/* Player Mode tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => handlePlayerModeChange(1)}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 1 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tek Kişilik Antrenman"
            >
              1 Kişi
            </button>
            <button
              onClick={() => handlePlayerModeChange(2)}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 2 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="2 Kişilik Karşılıklı Düello"
            >
              2 Kişi
            </button>
            <button
              onClick={() => handlePlayerModeChange(3)}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 3 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3 Kişilik Dev Kapışma"
            >
              3 Kişi
            </button>
          </div>

          {/* Round counter */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300">
            <span>Tur:</span>
            <span className="font-black text-white">{currentRound} / {totalRounds}</span>
          </div>
        </div>

        {/* Right: Sound, Dictionary Guide, Reset & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dictionary Guide Quick Toggle */}
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              setShowDictionaryGuide(prev => !prev);
            }}
            title="Sözlük Sırası İpuçları & Alfabe"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all cursor-pointer ${
              showDictionaryGuide
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Sözlük Rehberi</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Reset */}
          <button
            onClick={handleResetGame}
            title="Yeni Oyun Başlat"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. ALPHABET & DICTIONARY GUIDE POPUP STRIP */}
      {showDictionaryGuide && (
        <div className="relative z-20 bg-slate-900/98 border-b-2 border-amber-400/50 px-3 py-2 flex flex-col items-center justify-center gap-1.5 text-center shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>SÖZLÜK SIRASI KURALI:</span>
            <span className="font-normal text-slate-200 text-xs">
              Kelimelerin ilk harfine bakılır. İlk harfler aynıysa 2. harfe, onlar da aynıysa 3. harfe bakılarak alfabetik sıraya konur.
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            {TURKISH_ALPHABET.map((l) => (
              <span 
                key={l} 
                className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-800 text-slate-100 font-black text-[11px] sm:text-xs border border-slate-700"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH BATTLE ARENA */}
      <div className="relative z-10 flex-1 flex flex-row items-center justify-center gap-1 sm:gap-2 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden px-1 sm:px-2 py-0.5 sm:py-1">
        {/* CENTER BATTLE ARENA */}
        <div className="flex-1 flex flex-row relative min-h-0 h-full w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
          {players.map((player, pIdx) => {
            const theme = getPlayerTheme(player.colorName);
            const isWinnerThisRound = roundWinner === pIdx;
            const assignedPlayerStudent = effectiveSelectedStudentIds[pIdx]
              ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
              : null;

            return (
              <React.Fragment key={player.id}>
                {/* Individual Player Screen Panel */}
                <div 
                  className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 ${playerMode === 3 ? 'px-1 sm:px-2 py-1 sm:py-1.5' : 'px-2 sm:px-4 py-2 sm:py-3'} transition-transform ${
                    player.shake ? 'animate-shake' : ''
                  }`}
                >
                  {/* Top Player Info Bar */}
                  <div className="relative z-10 flex items-center justify-between gap-1 pb-1">
                    <div className="flex items-center gap-1.5">
                      {assignedPlayerStudent && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/90 border border-white/40 flex items-center justify-center text-xs sm:text-sm">
                          {assignedPlayerStudent.avatar}
                        </div>
                      )}
                      <div>
                        <span className="font-black text-xs sm:text-sm md:text-base text-white tracking-wide drop-shadow block">
                          {assignedPlayerStudent ? assignedPlayerStudent.name : player.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-black/50 border border-amber-400/70 shadow-md">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-black text-amber-300">
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  {/* 3.1 DECORATIVE LEXICON PORTAL / BOOK ICON */}
                  <div className={`relative z-10 flex-1 flex flex-col items-center justify-center shrink-0 my-auto ${
                    playerMode === 3 
                      ? 'min-h-[40px] max-h-[64px]' 
                      : playerMode === 1 
                      ? 'min-h-[90px] max-h-[160px]' 
                      : 'min-h-[65px] max-h-[120px]'
                  }`}>
                    <div className={`relative flex items-center justify-center ${
                      playerMode === 3 
                        ? 'w-12 h-12 sm:w-14 sm:h-14' 
                        : playerMode === 1 
                        ? 'w-26 h-26 sm:w-32 sm:h-32' 
                        : 'w-20 h-20 sm:w-24 sm:h-24'
                    }`}>
                      {/* Outer segmented tick marks ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 animate-[spin_30s_linear_infinite]" />

                      {/* Outer glow ring with color arc */}
                      <div className={`absolute inset-1 sm:inset-2 rounded-full border-2 sm:border-4 ${theme.portalRing1} ${theme.portalGlow} animate-pulse`} />

                      {/* Inner glowing radial portal */}
                      <div className={`absolute inset-2 sm:inset-3 rounded-full ${theme.portalInner} flex items-center justify-center shadow-inner overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent animate-[spin_8s_linear_infinite]" />
                        <BookOpen className={`${playerMode === 3 ? 'w-5 h-5' : 'w-8 h-8 sm:w-11 sm:h-11'} text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]`} />
                      </div>

                      {/* Win celebration badge over portal */}
                      {isWinnerThisRound && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs rounded-full animate-in zoom-in-75 duration-200">
                          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-md animate-bounce" />
                          <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-wider">DOĞRU!</span>
                        </div>
                      )}

                      {/* Wrong buzzer badge over portal */}
                      {player.status === 'wrong' && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-xs rounded-full animate-in zoom-in-75 duration-150">
                          <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 drop-shadow-md animate-bounce" />
                          <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-wider">TEKRAR</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3.2 MAIN INTERACTIVE WORDS CONSOLE CONTAINER */}
                  <div className={`relative z-10 w-full ${playerMode === 1 ? 'max-w-2xl' : 'max-w-xl'} mx-auto flex flex-col items-center shrink-0 ${playerMode === 3 ? 'gap-1 pb-0.5' : 'gap-1.5 sm:gap-2 pb-1'}`}>
                    {/* Console Header Pill Badge */}
                    <div className={`px-3 sm:px-4 py-0.5 rounded-full font-black ${playerMode === 3 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${theme.pillHeader}`}>
                      <Layers className="w-3.5 h-3.5" />
                      <span>SÖZLÜK SIRASINA GÖRE DİZ</span>
                    </div>

                    {/* Glassy Card holding Upper Target Slots and Lower Tray */}
                    <div className={`w-full rounded-xl sm:rounded-2xl border backdrop-blur-md shadow-2xl flex flex-col ${playerMode === 3 ? 'p-1.5 sm:p-2 gap-1.5' : 'p-2.5 sm:p-3.5 gap-2.5'} ${theme.cardBg}`}>
                      {/* UPPER TARGET ROW: BLANK / PLACED SLOTS FOR DICTIONARY ORDER */}
                      <div className={`grid ${wordCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} items-center justify-center w-full ${playerMode === 3 ? 'gap-1 sm:gap-1.5' : 'gap-2 sm:gap-2.5'}`}>
                        {player.upperSlots.map((word, slotIdx) => (
                          <div
                            key={`upper_${slotIdx}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnTarget(e, pIdx, slotIdx)}
                            onClick={() => handleTapUpperSlot(pIdx, slotIdx)}
                            draggable={word !== null}
                            onDragStart={(e) => word && handleDragStartTarget(e, pIdx, word, slotIdx)}
                            className={`min-h-[46px] xs:min-h-[52px] sm:min-h-[60px] rounded-xl border-2 flex flex-col items-center justify-center p-1 sm:p-1.5 transition-all cursor-pointer font-black select-none ${
                              word 
                                ? `${theme.slotFilled} hover:scale-105 active:scale-95` 
                                : `${theme.slotEmpty} border-dashed hover:border-white/80`
                            }`}
                          >
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold opacity-75 leading-none mb-0.5">
                              {slotIdx + 1}. Sözcük
                            </span>
                            {word ? (
                              <span className={`font-black uppercase tracking-wide truncate max-w-full ${
                                playerMode === 3 
                                  ? 'text-xs xs:text-sm sm:text-base' 
                                  : 'text-sm xs:text-base sm:text-lg'
                              }`}>
                                {word}
                              </span>
                            ) : (
                              <span className="text-white/40 text-xs font-bold">
                                ---
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* DIVIDER LINE WITH HELPFUL TIP */}
                      <div className={`w-full flex items-center justify-between px-1 font-semibold text-white/70 ${playerMode === 3 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-xs'}`}>
                        <span>Kelimelere dokunarak yerleştir:</span>
                        {player.upperSlots.some(s => s !== null) && (
                          <button
                            onClick={() => handleResetPlayerSlots(pIdx)}
                            className="text-white/90 hover:text-white underline font-bold transition-colors cursor-pointer"
                          >
                            Sıfırla
                          </button>
                        )}
                      </div>

                      {/* LOWER SOURCE ROW: SCRAMBLED WORDS AVAILABLE */}
                      <div className={`grid ${wordCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} items-center justify-center w-full ${playerMode === 3 ? 'gap-1 sm:gap-1.5 min-h-[44px]' : 'gap-2 sm:gap-2.5 min-h-[52px]'}`}>
                        {Array.from({ length: wordCount }).map((_, wordIdx) => {
                          const word = player.availableWords[wordIdx];
                          return (
                            <div
                              key={`source_slot_${wordIdx}`}
                              className="w-full min-h-[46px] xs:min-h-[52px] sm:min-h-[60px] flex items-center justify-center"
                            >
                              {word ? (
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStartSource(e, pIdx, word, wordIdx)}
                                  onClick={() => handleTapSourceWord(pIdx, word, wordIdx)}
                                  className={`w-full h-full rounded-xl bg-white text-slate-900 border-2 border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center px-1 sm:px-2 font-black uppercase tracking-wide cursor-pointer select-none text-center truncate ${
                                    playerMode === 3 
                                      ? 'text-xs xs:text-sm sm:text-base' 
                                      : 'text-sm xs:text-base sm:text-lg'
                                  }`}
                                >
                                  {word}
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-xl bg-black/25 border border-white/10" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3.3 BOTTOM ACTION BUTTON: "KONTROL ET" */}
                    <button
                      onClick={() => handleExecuteCheck(pIdx)}
                      disabled={roundWinner !== null}
                      className={`w-full ${playerMode === 1 ? 'max-w-md' : 'max-w-sm'} ${
                        playerMode === 3 
                          ? 'py-1 sm:py-1.5 px-3 text-[11px] sm:text-xs' 
                          : 'py-2 sm:py-2.5 px-6 text-sm sm:text-base'
                      } rounded-full font-black tracking-widest uppercase transition-all cursor-pointer border-2 ${
                        theme.runBtn
                      } ${
                        roundWinner !== null ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      KONTROL ET
                    </button>
                  </div>
                </div>

                {/* VS DIVIDER BADGE BETWEEN PLAYERS */}
                {pIdx < players.length - 1 && (
                  <div className="relative z-20 flex flex-col items-center justify-center shrink-0 w-0">
                    <div className="w-[2px] sm:w-[3px] h-full bg-white/40 shadow-sm" />
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 py-1 rounded-xl bg-slate-950 text-white font-black text-[10px] sm:text-xs tracking-widest border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-30">
                      VS
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ÖĞRENCİ LİSTESİ DOCK'U - EN ALTTA TEK SIRA (TÜM MODLARDA: 1, 2 VE 3 KİŞİLİK) */}
      {students && students.length > 0 && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={gradeGroup === '3-4' ? 3 : 2}
            playerCount={playerMode}
            selectedStudentIds={effectiveSelectedStudentIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* 4. ROUND VICTORY OVERLAY BANNER */}
      {roundWinner !== null && !gameOver && (
        <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-40 flex items-center justify-center pointer-events-none animate-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-2.5 rounded-2xl bg-black/90 border-2 border-amber-400 text-white font-black text-sm sm:text-lg md:text-xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-3">
            <span className="text-xl sm:text-2xl">🎉</span>
            <span>
              {players[roundWinner]?.name} Bildi! Sıradaki Kelimelere Geçiliyor...
            </span>
            <span className="text-amber-400">({sortedRoundWords.join(' - ')})</span>
          </div>
        </div>
      )}

      {/* 5. MATCH COMPLETE GAME-OVER MODAL */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400 animate-bounce" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              YARIŞMA TAMAMLANDI!
            </h2>

            {/* Winner announcement */}
            {(() => {
              const maxScore = Math.max(...players.map(p => p.score));
              const winners = players.filter(p => p.score === maxScore);

              if (winners.length === 1) {
                return (
                  <div className="px-5 py-2.5 rounded-2xl bg-amber-400/15 border border-amber-400 text-amber-300 font-bold text-base sm:text-lg">
                    🏆 Şampiyon: <span className="font-black text-white">{winners[0].name}</span>
                  </div>
                );
              } else {
                return (
                  <div className="px-5 py-2.5 rounded-2xl bg-cyan-400/15 border border-cyan-400 text-cyan-300 font-bold text-base sm:text-lg">
                    🤝 Berabere Bitti! Tebrikler!
                  </div>
                );
              }
            })()}

            {/* Final Scores Breakdown */}
            <div className="w-full flex items-center justify-center gap-3 my-2">
              {players.map(p => (
                <div 
                  key={p.id}
                  className={`flex-1 p-3 rounded-2xl border flex flex-col items-center gap-1 ${
                    p.colorName === 'blue' 
                      ? 'bg-blue-950/60 border-cyan-400/60 text-cyan-200' 
                      : p.colorName === 'orange'
                      ? 'bg-orange-950/60 border-amber-400/60 text-amber-200'
                      : 'bg-pink-950/60 border-pink-400/60 text-pink-200'
                  }`}
                >
                  <span className="font-bold text-xs">{p.name}</span>
                  <span className="font-black text-2xl text-white">{p.score}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Doğru</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={handleResetGame}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Tekrar Oyna
              </button>

              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all cursor-pointer"
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
