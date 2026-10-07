import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Maximize2, Minimize2, RotateCcw, Trophy, 
  HelpCircle, Volume2, VolumeX, Sparkles, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  TURKISH_ALPHABET, 
  generateRoundLetters, 
  isAlphabeticalOrder, 
  sortLettersAlphabetically 
} from '../data/sozlukSiralaData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface SozlukSiralaGameProps {
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
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type GradeGroup = '1-2' | '3-4';
type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'blue' | 'pink' | 'orange';
  score: number;
  upperSlots: (string | null)[];
  availableLetters: string[];
  status: 'idle' | 'checking' | 'correct' | 'wrong';
  shake: boolean;
}

export const SozlukSiralaGame: React.FC<SozlukSiralaGameProps> = ({
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
  onGameCompleted,
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
  const [showAlphabetGuide, setShowAlphabetGuide] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Round data
  const letterCount: 3 | 4 = gradeGroup === '1-2' ? 3 : 4;
  const [roundLetters, setRoundLetters] = useState<string[]>([]);
  const [sortedRoundLetters, setSortedRoundLetters] = useState<string[]>([]);

  // Drag-and-drop transfer state tracking
  const dragItemRef = useRef<{ playerIdx: number; letter: string; from: 'source' | 'target'; index: number } | null>(null);

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      playMp3(src);
    }
  }, [soundEnabled, playMp3]);

  // Players initial configuration
  const createInitialPlayers = useCallback((mode: PlayerMode, letters: string[], count: number): PlayerState[] => {
    if (mode === 1) {
      return [
        {
          id: 1,
          name: '1. Oyuncu',
          colorName: 'blue',
          score: 0,
          upperSlots: Array(count).fill(null),
          availableLetters: [...letters],
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
        availableLetters: [...letters],
        status: 'idle',
        shake: false
      },
      {
        id: 2,
        name: '2. Oyuncu',
        colorName: mode === 2 ? 'pink' : 'orange',
        score: 0,
        upperSlots: Array(count).fill(null),
        availableLetters: [...letters],
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
        availableLetters: [...letters],
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
    const { originalSorted, scrambled } = generateRoundLetters(count);
    setRoundLetters(scrambled);
    setSortedRoundLetters(originalSorted);
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

  // Move letter from available to first empty slot (TAP to PLACE)
  const handleTapSourceLetter = (playerIdx: number, letter: string, letterIndex: number) => {
    if (roundWinner !== null) return;
    triggerSound('/tek.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const emptySlotIdx = p.upperSlots.indexOf(null);
      if (emptySlotIdx === -1) return prev; // Upper slots already full

      const newUpper = [...p.upperSlots];
      newUpper[emptySlotIdx] = letter;

      const newAvailable = [...p.availableLetters];
      newAvailable.splice(letterIndex, 1);

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableLetters: newAvailable,
        status: 'idle'
      };
      return nextPlayers;
    });
  };

  // Move letter from upper slot back to available (TAP to RETURN)
  const handleTapUpperSlot = (playerIdx: number, slotIndex: number) => {
    if (roundWinner !== null) return;
    triggerSound('/dtt.mp3');

    setPlayers(prev => {
      const p = prev[playerIdx];
      if (!p) return prev;

      const letter = p.upperSlots[slotIndex];
      if (!letter) return prev;

      const newUpper = [...p.upperSlots];
      newUpper[slotIndex] = null;

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableLetters: [...p.availableLetters, letter],
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
        upperSlots: Array(letterCount).fill(null),
        availableLetters: [...roundLetters],
        status: 'idle',
        shake: false
      };
      return nextPlayers;
    });
  };

  // HTML5 Drag & Drop handlers
  const handleDragStartSource = (e: React.DragEvent, playerIdx: number, letter: string, index: number) => {
    dragItemRef.current = { playerIdx, letter, from: 'source', index };
    e.dataTransfer.setData('text/plain', letter);
  };

  const handleDragStartTarget = (e: React.DragEvent, playerIdx: number, letter: string, index: number) => {
    dragItemRef.current = { playerIdx, letter, from: 'target', index };
    e.dataTransfer.setData('text/plain', letter);
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
      const newAvailable = [...p.availableLetters];

      if (item.from === 'source') {
        const existingInTarget = newUpper[targetSlotIndex];
        newUpper[targetSlotIndex] = item.letter;
        newAvailable.splice(item.index, 1);
        if (existingInTarget) {
          newAvailable.push(existingInTarget);
        }
      } else if (item.from === 'target') {
        // Swap slots inside upper row
        const existingInTarget = newUpper[targetSlotIndex];
        newUpper[targetSlotIndex] = item.letter;
        newUpper[item.index] = existingInTarget;
      }

      const nextPlayers = [...prev];
      nextPlayers[playerIdx] = {
        ...p,
        upperSlots: newUpper,
        availableLetters: newAvailable,
        status: 'idle'
      };
      return nextPlayers;
    });

    dragItemRef.current = null;
  };

  // "ÇALIŞTIR" BUTTON CHECK
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

    const isCorrect = isAlphabeticalOrder(p.upperSlots);

    if (isCorrect) {
      // WINNER OF THIS ROUND!
      setRoundWinner(playerIdx);
      triggerSound('/coin.mp3');

      if (onQuestionAnswered) {
        onQuestionAnswered(true, playerIdx);
      }

      // Confetti burst
      const isLeft = playerIdx === 0;
      const isRight = playerIdx === (players.length - 1);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { x: isLeft ? 0.25 : isRight ? 0.75 : 0.5, y: 0.6 }
      });

      const nextPlayers = [...players];
      nextPlayers[playerIdx] = {
        ...nextPlayers[playerIdx],
        score: nextPlayers[playerIdx].score + 1,
        status: 'correct'
      };
      setPlayers(nextPlayers);

      // Advance round or end game after 2.5s
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          setGameOver(true);
          triggerSound('/para.mp3');
          confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.5 } });
          const bestPlayer = [...nextPlayers].sort((a, b) => b.score - a.score)[0];
          const bestIdx = bestPlayer ? (bestPlayer.id - 1) : null;
          onGameCompleted?.(bestIdx, playerMode);
        } else {
          startNewRound(currentRound + 1, gradeGroup, playerMode, false);
        }
      }, 2400);
    } else {
      // INCORRECT ORDER
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) {
        onQuestionAnswered(false, playerIdx);
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

  // Color schemes matching the photo
  const getPlayerTheme = (color: 'blue' | 'pink' | 'orange') => {
    switch (color) {
      case 'blue':
        return {
          bgGrad: 'from-[#0096ea] via-[#0081cf] to-[#005fa3]',
          portalRing1: 'border-cyan-300',
          portalGlow: 'shadow-[0_0_50px_rgba(0,180,255,0.7)]',
          portalInner: 'bg-gradient-to-br from-cyan-400 to-blue-700',
          coreRing: 'border-cyan-200 shadow-[0_0_20px_#38bdf8]',
          pillHeader: 'bg-[#0b386b] text-cyan-200 border-cyan-400/60',
          cardBg: 'bg-[#072549]/70 border-cyan-400/40',
          slotEmpty: 'bg-[#051c38]/80 border-cyan-400/50 text-cyan-400',
          slotFilled: 'bg-white text-[#072b53] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
          runBtn: 'bg-gradient-to-b from-[#00b0ff] to-[#0077c2] hover:from-[#38c2ff] hover:to-[#008de6] text-white border-cyan-200 shadow-[0_6px_0_#004f85] active:translate-y-1 active:shadow-[0_2px_0_#004f85]',
          accentText: 'text-cyan-300'
        };
      case 'pink':
        return {
          bgGrad: 'from-[#e60067] via-[#c70055] to-[#99003f]',
          portalRing1: 'border-pink-300',
          portalGlow: 'shadow-[0_0_50px_rgba(255,0,128,0.7)]',
          portalInner: 'bg-gradient-to-br from-pink-400 to-fuchsia-800',
          coreRing: 'border-pink-200 shadow-[0_0_20px_#f472b6]',
          pillHeader: 'bg-[#6b0b38] text-pink-200 border-pink-400/60',
          cardBg: 'bg-[#490725]/70 border-pink-400/40',
          slotEmpty: 'bg-[#38051c]/80 border-pink-400/50 text-pink-400',
          slotFilled: 'bg-white text-[#53072b] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
          runBtn: 'bg-gradient-to-b from-[#ff2e8c] to-[#c2005a] hover:from-[#ff529f] hover:to-[#e6006a] text-white border-pink-200 shadow-[0_6px_0_#85003d] active:translate-y-1 active:shadow-[0_2px_0_#85003d]',
          accentText: 'text-pink-300'
        };
      case 'orange':
        return {
          bgGrad: 'from-[#f97316] via-[#ea580c] to-[#b43a04]',
          portalRing1: 'border-amber-300',
          portalGlow: 'shadow-[0_0_50px_rgba(249,115,22,0.7)]',
          portalInner: 'bg-gradient-to-br from-amber-400 to-orange-800',
          coreRing: 'border-amber-200 shadow-[0_0_20px_#fbbf24]',
          pillHeader: 'bg-[#6b300b] text-amber-200 border-amber-400/60',
          cardBg: 'bg-[#491c07]/70 border-amber-400/40',
          slotEmpty: 'bg-[#381405]/80 border-amber-400/50 text-amber-400',
          slotFilled: 'bg-white text-[#532007] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
          runBtn: 'bg-gradient-to-b from-[#fb923c] to-[#c2410c] hover:from-[#fdba74] hover:to-[#ea580c] text-white border-amber-200 shadow-[0_6px_0_#7c2d12] active:translate-y-1 active:shadow-[0_2px_0_#7c2d12]',
          accentText: 'text-amber-300'
        };
    }
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col bg-slate-950 font-sans select-none overflow-hidden text-white"
    >
      {/* 1. STANDART ESKİ ARKA PLAN GÖRSELİ (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none select-none filter brightness-95" 
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* 2. ALPHABET QUICK GUIDE POPUP STRIP (A-Z) */}
      {showAlphabetGuide && (
        <div className="relative z-20 bg-slate-900/95 border-b border-amber-400/40 px-2 py-1.5 flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap text-center shadow-lg animate-in slide-in-from-top duration-200">
          <span className="text-amber-400 font-black text-xs sm:text-sm mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> TÜRK ALFABESİ (29 HARF):
          </span>
          {TURKISH_ALPHABET.map((l, i) => (
            <span 
              key={l} 
              className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 text-slate-100 font-black text-xs sm:text-sm border border-slate-700 shadow-sm"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH BATTLE ARENA */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const player = players[0];
          const isWinnerThisRound = roundWinner === 0;
          const assignedPlayerStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              {/* MERKEZ: TEK KİŞİLİK STANDART KART ÇERÇEVESİ */}
              <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    {/* LEFT: GROUP BADGE & TOPIC */}
                    <div className="flex items-center gap-1.5 min-w-0 h-full">
                      {assignedPlayerStudent ? (
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${assignedPlayerStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                          title={`Aktif Öğrenci: ${assignedPlayerStudent.name}`}
                        >
                          {assignedPlayerStudent.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                            {assignedPlayerStudent ? assignedPlayerStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • Sözlük Sıralama
                          </span>
                        </div>
                        <img
                          src="/MENUIKON/grid_icon_24.webp"
                          alt="Sözlük Sıralama"
                          className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1"
                        />
                      </div>
                    </div>

                    {/* RIGHT: SCORE & ROUND */}
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {currentRound} / {totalRounds}
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {player.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2.5 sm:p-3.5 flex flex-col items-center justify-between text-center overflow-hidden min-h-0 w-full">
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      {/* Header Notification Badge */}
                      <div className="relative z-10 h-6 sm:h-7 flex items-center justify-center shrink-0">
                        {isWinnerThisRound ? (
                          <div className="px-3 py-0.5 rounded-full bg-emerald-500/90 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-bounce">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>HARİKA! DOĞRU SIRALAMA</span>
                          </div>
                        ) : player.status === 'wrong' ? (
                          <div className="px-3 py-0.5 rounded-full bg-rose-600/90 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-shake">
                            <XCircle className="w-3.5 h-3.5 text-white" />
                            <span>SIRALAMA YANLIŞ, TEKRAR DENE!</span>
                          </div>
                        ) : (
                          <div className="px-3 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 font-bold text-xs uppercase tracking-wider">
                            🔤 HARFLERİ ALFABETİK SIRAYA DİZ
                          </div>
                        )}
                      </div>

                      {/* UPPER TARGET ROW: SLOTS */}
                      <div className="relative z-10 w-full my-auto flex flex-col items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                          {player.upperSlots.map((letter, slotIdx) => (
                            <div
                              key={`single_upper_${slotIdx}`}
                              onClick={() => handleTapUpperSlot(0, slotIdx)}
                              className={`flex-1 max-w-[75px] sm:max-w-[90px] min-h-[75px] sm:min-h-[90px] rounded-2xl border-2 sm:border-3 aspect-square flex items-center justify-center transition-all cursor-pointer font-black text-3xl sm:text-4xl select-none ${
                                letter
                                  ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-xl scale-105'
                                  : 'bg-white/5 border-dashed border-white/30 text-white/30 hover:border-white/60'
                              }`}
                            >
                              {letter ? (
                                <span className="drop-shadow-sm">{letter}</span>
                              ) : (
                                <span className="text-white/40 text-base font-black">
                                  {slotIdx + 1}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Helper Hint */}
                        <div className="w-full flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
                          <span>Harflere dokunarak boş kutulara yerleştir:</span>
                          {player.upperSlots.some(s => s !== null) && (
                            <button
                              onClick={() => handleResetPlayerSlots(0)}
                              className="text-amber-400 hover:text-amber-300 underline font-bold transition-colors cursor-pointer"
                            >
                              Sıfırla
                            </button>
                          )}
                        </div>

                        {/* LOWER SOURCE ROW: AVAILABLE LETTERS */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                          {Array.from({ length: letterCount }).map((_, letterIdx) => {
                            const letter = player.availableLetters[letterIdx];
                            return (
                              <div
                                key={`single_source_${letterIdx}`}
                                className="flex-1 max-w-[75px] sm:max-w-[90px] aspect-square flex items-center justify-center"
                              >
                                {letter ? (
                                  <div
                                    onClick={() => handleTapSourceLetter(0, letter, letterIdx)}
                                    className="w-full h-full rounded-2xl bg-white text-slate-900 border-2 sm:border-3 border-slate-100 shadow-[0_6px_14px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-3xl sm:text-4xl cursor-pointer select-none"
                                  >
                                    {letter}
                                  </div>
                                ) : (
                                  <div className="w-full h-full rounded-2xl bg-black/25 border border-white/10" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* BOTTOM: CONTROLS */}
                      <div className="relative z-10 w-full shrink-0 flex items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => handleResetPlayerSlots(0)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
                        >
                          Temizle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })() : (
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
                  className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 overflow-y-auto no-scrollbar ${playerMode === 3 ? 'px-1 sm:px-2 py-1' : 'px-2 sm:px-3 py-1.5'} transition-transform ${
                    player.shake ? 'animate-shake' : ''
                  }`}
                >
                  {/* Subtle Grid Ambient Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

                  {/* Player Header Info & Score */}
                  <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto mb-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm border border-white/30 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                        {assignedPlayerStudent ? (
                          <>
                            <span className="text-sm sm:text-base">{assignedPlayerStudent.avatar}</span>
                            <span className="font-extrabold text-amber-200">{assignedPlayerStudent.name}</span>
                          </>
                        ) : (
                          player.name
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-black/50 border border-amber-400/70 shadow-md">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-black text-amber-300">
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  {/* 3.1 STATUS NOTIFICATION BADGE (NO LAG / NO ROTATING HEAVY CANVAS) */}
                  <div className="h-6 sm:h-7 flex items-center justify-center shrink-0 my-0.5">
                    {isWinnerThisRound ? (
                      <div className="px-3 py-0.5 rounded-full bg-emerald-500/90 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-bounce">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>HARİKA! DOĞRU SIRALAMA</span>
                      </div>
                    ) : player.status === 'wrong' ? (
                      <div className="px-3 py-0.5 rounded-full bg-rose-600/90 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-shake">
                        <XCircle className="w-3.5 h-3.5 text-white" />
                        <span>SIRALAMA YANLIŞ, TEKRAR DENE!</span>
                      </div>
                    ) : null}
                  </div>

                  {/* 3.2 MAIN INTERACTIVE LETTER CONSOLE CONTAINER */}
                  <div className={`relative z-10 w-full ${playerMode === 1 ? 'max-w-xl' : playerMode === 2 ? 'max-w-lg' : 'max-w-md'} mx-auto flex flex-col items-center justify-center flex-1 min-h-0 ${playerMode === 3 ? 'gap-1' : 'gap-1.5'}`}>
                    {/* Console Header Pill Badge */}
                    <div className={`px-3 py-0.5 rounded-full font-black ${playerMode === 3 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} uppercase tracking-wider border shadow-md shrink-0 ${theme.pillHeader}`}>
                      HARFLERİ SIRALA
                    </div>

                    {/* Glassy Card holding Upper Target Slots and Lower Tray */}
                    <div className={`w-full rounded-2xl border backdrop-blur-md shadow-2xl flex flex-col ${playerMode === 3 ? 'p-1.5 gap-1' : 'p-2 sm:p-2.5 gap-1.5'} ${theme.cardBg}`}>
                      {/* UPPER TARGET ROW: BLANK / PLACED SLOTS FOR ALPHABETICAL ORDER */}
                      <div className={`flex items-center justify-center w-full ${playerMode === 3 ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}`}>
                        {player.upperSlots.map((letter, slotIdx) => (
                          <div
                            key={`upper_${slotIdx}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnTarget(e, pIdx, slotIdx)}
                            onClick={() => handleTapUpperSlot(pIdx, slotIdx)}
                            draggable={letter !== null}
                            onDragStart={(e) => letter && handleDragStartTarget(e, pIdx, letter, slotIdx)}
                            className={`flex-1 ${
                              playerMode === 3 
                                ? 'max-w-[62px] sm:max-w-[72px] min-h-[62px] sm:min-h-[72px] rounded-xl text-xl sm:text-2xl' 
                                : playerMode === 1 
                                ? 'max-w-[85px] sm:max-w-[110px] min-h-[85px] sm:min-h-[110px] rounded-2xl text-4xl sm:text-5xl' 
                                : 'max-w-[75px] sm:max-w-[92px] min-h-[75px] sm:min-h-[92px] rounded-xl text-3xl sm:text-4xl'
                            } aspect-square border-2 sm:border-3 flex items-center justify-center transition-all cursor-pointer font-black select-none ${
                              letter 
                                ? `${theme.slotFilled} hover:scale-105 active:scale-95 shadow-xl` 
                                : `${theme.slotEmpty} border-dashed hover:border-white/80`
                            }`}
                          >
                            {letter ? (
                              <span className="drop-shadow-sm">{letter}</span>
                            ) : (
                              <span className="text-white/40 text-sm sm:text-base font-black">
                                {slotIdx + 1}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* DIVIDER LINE WITH HELPFUL TIP */}
                      <div className={`w-full flex items-center justify-between px-1 font-semibold text-white/70 ${playerMode === 3 ? 'text-[8.5px] sm:text-[9.5px]' : 'text-[9.5px] sm:text-xs'}`}>
                        <span>Harflere dokunarak sıraya koy:</span>
                        {player.upperSlots.some(s => s !== null) && (
                          <button
                            onClick={() => handleResetPlayerSlots(pIdx)}
                            className="text-white/90 hover:text-white underline font-bold transition-colors cursor-pointer"
                          >
                            Sıfırla
                          </button>
                        )}
                      </div>

                      {/* LOWER SOURCE ROW: SCRAMBLED LETTERS AVAILABLE */}
                      <div className={`flex items-center justify-center w-full ${playerMode === 3 ? 'gap-1 sm:gap-1.5 min-h-[50px] sm:min-h-[62px]' : 'gap-1.5 sm:gap-2 min-h-[70px] sm:min-h-[85px]'}`}>
                        {Array.from({ length: letterCount }).map((_, letterIdx) => {
                          const letter = player.availableLetters[letterIdx];
                          return (
                            <div
                              key={`source_slot_${letterIdx}`}
                              className={`flex-1 ${
                                playerMode === 3 
                                  ? 'max-w-[62px] sm:max-w-[72px]' 
                                  : playerMode === 1 
                                  ? 'max-w-[85px] sm:max-w-[110px]' 
                                  : 'max-w-[75px] sm:max-w-[92px]'
                              } aspect-square flex items-center justify-center`}
                            >
                              {letter ? (
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStartSource(e, pIdx, letter, letterIdx)}
                                  onClick={() => handleTapSourceLetter(pIdx, letter, letterIdx)}
                                  className={`w-full h-full ${
                                    playerMode === 3 
                                      ? 'rounded-xl text-xl sm:text-2xl' 
                                      : playerMode === 1 
                                      ? 'rounded-2xl text-4xl sm:text-5xl' 
                                      : 'rounded-xl text-3xl sm:text-4xl'
                                  } bg-white text-slate-900 border-2 sm:border-3 border-slate-100 shadow-[0_6px_14px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black cursor-pointer select-none`}
                                >
                                  {letter}
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-xl bg-black/25 border border-white/10" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3.3 BOTTOM ACTION BUTTON: "ÇALIŞTIR" */}
                    <button
                      onClick={() => handleExecuteCheck(pIdx)}
                      disabled={roundWinner !== null}
                      className={`w-full ${playerMode === 1 ? 'max-w-sm' : 'max-w-xs'} ${
                        playerMode === 3 
                          ? 'py-1 sm:py-1.5 px-3 text-[11px] sm:text-xs' 
                          : 'py-1.5 sm:py-2 px-5 text-xs sm:text-sm'
                      } rounded-full font-black tracking-widest uppercase transition-all cursor-pointer border-2 shrink-0 ${
                        theme.runBtn
                      } ${
                        roundWinner !== null ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      ÇALIŞTIR
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
        )}
      </main>

      {/* ÖĞRENCİ LİSTESİ DOCK'U - EN ALTTA TEK SIRA (1, 2 VE 3 KİŞİLİK MODLAR İÇİN) */}
      {students && onOpenRosterModal && (
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
              {players[roundWinner]?.name} Bildi! Sıradaki Eşleşmeye Geçiliyor...
            </span>
            <span className="text-amber-400">({sortedRoundLetters.join(' - ')})</span>
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
