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
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';

interface SozlukSiralaGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  initialGradeGroup?: '1-2' | '3-4';
  students?: Student[];
  selectedStudentId?: string | null;
  onSelectStudent?: (id: string | null) => void;
  onOpenRosterModal?: () => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
}

type GradeGroup = '1-2' | '3-4';
type PlayerMode = 2 | 3;

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
  students,
  selectedStudentId,
  onSelectStudent,
  onOpenRosterModal,
  onQuestionAnswered,
}) => {
  // Split students into Left (12) and Right (11) slots
  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 23), [students]);
  const assignedStudent = useMemo(
    () => students?.find(s => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

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
  const [playerMode, setPlayerMode] = useState<PlayerMode>(2);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAlphabetGuide, setShowAlphabetGuide] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Round data
  const letterCount: 4 | 5 = gradeGroup === '1-2' ? 4 : 5;
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
        name: mode === 2 ? '2. Oyuncu' : '2. Oyuncu',
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
    const count: 4 | 5 = grade === '1-2' ? 4 : 5;
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

      // Advance round or end game after 2.5s
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
      {/* 1. BACKGROUND IMAGE (/dere3.jpg) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
      </div>

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="relative z-30 bg-[#070e1c] border-b border-slate-800 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-md shrink-0 gap-1.5">
        {/* Left: Nav, Back & Round Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Etkinlik"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              triggerSound('/op.mp3');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-xl font-bold text-xs sm:text-sm border border-slate-700 shadow transition-all cursor-pointer"
            title="Çıkış"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Çıkış</span>
          </button>

          <button
            onClick={() => {
              triggerSound('/op.mp3');
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 active:bg-emerald-950 text-emerald-200 hover:text-white rounded-xl font-bold text-xs sm:text-sm border border-emerald-500/80 shadow transition-all cursor-pointer"
            title="Ana Sayfaya Dön"
          >
            <Home className="w-4 h-4" />
            <span className="hidden xs:inline">Ana Sayfa</span>
          </button>

          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Sonraki Etkinlik"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Eşleşme Counter badge (Matching photo: "Eşleşme 7 / 10") */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2 shadow-inner">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Eşleşme</span>
            <span className="text-xs sm:text-sm font-black text-amber-400">{currentRound} / {totalRounds}</span>
          </div>
        </div>

        {/* Center: Grade & Player Selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Grade selection toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
            <button
              onClick={() => handleGradeChange('1-2')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                gradeGroup === '1-2'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1-2. Sınıf (4 Harf)
            </button>
            <button
              onClick={() => handleGradeChange('3-4')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                gradeGroup === '3-4'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3-4. Sınıf (5 Harf)
            </button>
          </div>

          {/* Player Mode toggle (2 Kişilik vs 3 Kişilik) */}
          <div className="hidden md:flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
            <button
              onClick={() => handlePlayerModeChange(2)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 2
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2 Kişilik
            </button>
            <button
              onClick={() => handlePlayerModeChange(3)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                playerMode === 3
                  ? 'bg-orange-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3 Kişilik
            </button>
          </div>
        </div>

        {/* Right: Scores, Alphabet Reference & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Alphabet Guide Quick Toggle */}
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              setShowAlphabetGuide(prev => !prev);
            }}
            title="Alfabe Rehberi"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all cursor-pointer ${
              showAlphabetGuide
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Alfabe Rehberi</span>
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

      {/* ACTIVE STUDENT NOTIFICATION BADGE IF ANY */}
      {assignedStudent && (
        <div className="relative z-20 mt-1 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold shadow animate-fadeIn">
            <span>🎮 Oynayan Öğrenci:</span>
            <span className="text-white font-extrabold flex items-center gap-1">
              <span>{assignedStudent.avatar}</span>
              <span>{assignedStudent.name}</span>
            </span>
            {onSelectStudent && (
              <button
                type="button"
                onClick={() => onSelectStudent(null)}
                className="text-amber-400 hover:text-amber-200 ml-1 text-[11px] underline cursor-pointer"
              >
                (Değiştir)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH SIDE AVATAR GRIDS */}
      <div className="relative z-10 flex-1 flex flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden p-1 sm:p-2">
        {/* LEFT STUDENT SIDE GRID */}
        {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0 self-center">
            <StudentAvatarSideGrid
              slotsStudents={leftStudents}
              side="left"
              count={students.length}
              label="1. Grup (Sol)"
              selectedStudentId={selectedStudentId || null}
              onSelectStudent={onSelectStudent}
              onOpenRosterModal={onOpenRosterModal}
              playMp3={triggerSound}
            />
          </div>
        )}

        {/* CENTER BATTLE ARENA (EXACT SPLIT FROM PHOTO) */}
        <div className="flex-1 flex flex-row relative min-h-0 h-full w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
          {players.map((player, pIdx) => {
            const theme = getPlayerTheme(player.colorName);
            const isWinnerThisRound = roundWinner === pIdx;

            return (
              <React.Fragment key={player.id}>
                {/* Individual Player Screen Panel */}
                <div 
                  className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 px-2 sm:px-4 py-2 sm:py-3 transition-transform ${
                    player.shake ? 'animate-shake' : ''
                  }`}
                >
                  {/* Subtle Grid Ambient Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

                  {/* Player Header Info & Score */}
                  <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto mb-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-black/40 text-white font-black text-xs sm:text-sm border border-white/30 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                        {pIdx === 0 && assignedStudent ? (
                          <>
                            <span>{assignedStudent.avatar}</span>
                            <span>{assignedStudent.name}</span>
                          </>
                        ) : (
                          player.name
                        )}
                      </span>
                    </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 border border-amber-400/70 shadow-md">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-xs sm:text-sm font-black text-amber-300">
                      {player.score} Puan
                    </span>
                  </div>
                </div>

                {/* 3.1 ALFABE PORTALI (CONCENTRIC GLOWING CIRCLES - EXACT MATCH TO USER'S PHOTO) */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-[110px] max-h-[220px] shrink-0 my-auto">
                  <div className="relative flex items-center justify-center w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-48 md:h-48">
                    {/* Outer segmented tick marks ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 animate-[spin_30s_linear_infinite]" />

                    {/* Outer glow ring with white arc */}
                    <div className={`absolute inset-2 rounded-full border-4 ${theme.portalRing1} ${theme.portalGlow} animate-pulse`} />

                    {/* Inner glowing radial portal */}
                    <div className={`absolute inset-4 rounded-full ${theme.portalInner} flex items-center justify-center shadow-inner overflow-hidden`}>
                      {/* Swirling energy effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent animate-[spin_8s_linear_infinite]" />

                      {/* Concentric middle ring */}
                      <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/60 flex items-center justify-center bg-white/10 backdrop-blur-xs">
                        {/* Center core pulse */}
                        <div className={`w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-white ${theme.coreRing} flex items-center justify-center animate-ping`} />
                        <div className="absolute w-5 h-5 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_0_15px_#fff]" />
                      </div>
                    </div>

                    {/* Win celebration badge over portal */}
                    {isWinnerThisRound && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-full animate-in zoom-in-75 duration-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-md animate-bounce" />
                        <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">DOĞRU!</span>
                      </div>
                    )}

                    {/* Wrong buzzer badge over portal */}
                    {player.status === 'wrong' && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-xs rounded-full animate-in zoom-in-75 duration-150">
                        <XCircle className="w-12 h-12 text-rose-400 drop-shadow-md animate-bounce" />
                        <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">TEKRAR DENE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.2 MAIN INTERACTIVE LETTER CONSOLE CONTAINER */}
                <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-2 sm:gap-3 shrink-0 pb-1">
                  {/* Console Header Pill Badge (Matching photo: "HARFLERİ SIRALA") */}
                  <div className={`px-4 sm:px-6 py-1 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider border shadow-md ${theme.pillHeader}`}>
                    HARFLERİ SIRALA
                  </div>

                  {/* Glassy Card holding Upper Target Slots and Lower Tray */}
                  <div className={`w-full rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border backdrop-blur-md shadow-2xl flex flex-col gap-2.5 sm:gap-3.5 ${theme.cardBg}`}>
                    {/* UPPER TARGET ROW: BLANK / PLACED SLOTS FOR ALPHABETICAL ORDER */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full">
                      {player.upperSlots.map((letter, slotIdx) => (
                        <div
                          key={`upper_${slotIdx}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDropOnTarget(e, pIdx, slotIdx)}
                          onClick={() => handleTapUpperSlot(pIdx, slotIdx)}
                          draggable={letter !== null}
                          onDragStart={(e) => letter && handleDragStartTarget(e, pIdx, letter, slotIdx)}
                          className={`flex-1 max-w-[76px] aspect-square rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer font-black text-2xl xs:text-3xl sm:text-4xl select-none ${
                            letter 
                              ? `${theme.slotFilled} hover:scale-105 active:scale-95` 
                              : `${theme.slotEmpty} border-dashed hover:border-white/80`
                          }`}
                        >
                          {letter ? (
                            <span>{letter}</span>
                          ) : (
                            <span className="text-white/30 text-xs sm:text-sm font-bold">
                              {slotIdx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* DIVIDER LINE WITH HELPFUL TIP */}
                    <div className="w-full flex items-center justify-between px-1 text-[10px] sm:text-xs font-semibold text-white/70">
                      <span>Aşağıdaki harflere dokun veya sürükle:</span>
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
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full min-h-[48px] xs:min-h-[56px] sm:min-h-[64px]">
                      {/* Fixed length slots to keep alignment steady */}
                      {Array.from({ length: letterCount }).map((_, letterIdx) => {
                        const letter = player.availableLetters[letterIdx];
                        return (
                          <div
                            key={`source_slot_${letterIdx}`}
                            className="flex-1 max-w-[76px] aspect-square flex items-center justify-center"
                          >
                            {letter ? (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStartSource(e, pIdx, letter, letterIdx)}
                                onClick={() => handleTapSourceLetter(pIdx, letter, letterIdx)}
                                className="w-full h-full rounded-xl sm:rounded-2xl bg-white text-slate-900 border-2 border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-2xl xs:text-3xl sm:text-4xl cursor-pointer select-none"
                              >
                                {letter}
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-black/20 border border-white/10" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3.3 BOTTOM ACTION BUTTON: "ÇALIŞTIR" (EXACT MATCH TO PHOTO) */}
                  <button
                    onClick={() => handleExecuteCheck(pIdx)}
                    disabled={roundWinner !== null}
                    className={`w-full max-w-sm py-2.5 sm:py-3.5 px-6 rounded-full font-black text-sm sm:text-base md:text-lg tracking-widest uppercase transition-all cursor-pointer border-2 ${
                      theme.runBtn
                    } ${
                      roundWinner !== null ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    ÇALIŞTIR
                  </button>
                </div>
              </div>

              {/* VS DIVIDER BADGE BETWEEN PLAYERS (EXACT FROM PHOTO) */}
              {pIdx < players.length - 1 && (
                <div className="relative z-20 flex flex-col items-center justify-center shrink-0 w-0">
                  <div className="w-[3px] h-full bg-white/40 shadow-sm" />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-slate-950 text-white font-black text-xs sm:text-sm tracking-widest border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-30">
                    VS
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        </div>

        {/* RIGHT STUDENT SIDE GRID */}
        {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0 self-center">
            <StudentAvatarSideGrid
              slotsStudents={rightStudents}
              side="right"
              count={students.length}
              label="2. Grup (Sağ)"
              selectedStudentId={selectedStudentId || null}
              onSelectStudent={onSelectStudent}
              onOpenRosterModal={onOpenRosterModal}
              playMp3={triggerSound}
            />
          </div>
        )}
      </div>

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
