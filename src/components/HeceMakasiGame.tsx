import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Scissors, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import { HeceWord, HECE_MAKASI_WORDS, getRandomHeceWords } from '../data/heceMakasiData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { playScissorCutSound } from '../utils/scissorSound';

export const TARGET_QUESTIONS = 5;

// Diğer etkinliklerle tam uyumlu zafer videoları:
// 1. Oyuncu (Kaplumbağa) -> /kap.mp4
// 2. Oyuncu (Ejderha) -> /ejd.mp4
// 3. Oyuncu (Savaşçı / Balta) -> /sog.mp4
export const getWinnerVideoConfig = (winnerIdx: number | null) => {
  if (winnerIdx === 0) {
    return {
      videoSrc: '/kap.mp4',
      title: '1. OYUNCU (KAPLUMBAĞA) KAZANDI! 🏆',
      mascotName: '1. Oyuncu (Kaplumbağa)',
      img: '/kap1.png',
      badgeBg: 'from-blue-600 via-cyan-500 to-indigo-600',
      borderColor: 'border-cyan-400',
      glowColor: 'shadow-[0_0_35px_rgba(6,182,212,0.95)]'
    };
  }
  if (winnerIdx === 1) {
    return {
      videoSrc: '/ejd.mp4',
      title: '2. OYUNCU (EJDERHA) KAZANDI! 🏆',
      mascotName: '2. Oyuncu (Ejderha)',
      img: '/ejd1.png',
      badgeBg: 'from-rose-600 via-pink-500 to-red-600',
      borderColor: 'border-rose-400',
      glowColor: 'shadow-[0_0_35px_rgba(244,63,94,0.95)]'
    };
  }
  if (winnerIdx === 2) {
    return {
      videoSrc: '/sog.mp4',
      title: '3. OYUNCU (SAVAŞÇI) KAZANDI! 🏆',
      mascotName: '3. Oyuncu (Savaşçı)',
      img: '/balta1.png',
      badgeBg: 'from-emerald-600 via-teal-500 to-green-600',
      borderColor: 'border-emerald-400',
      glowColor: 'shadow-[0_0_35px_rgba(16,185,129,0.95)]'
    };
  }
  return {
    videoSrc: '/kap.mp4',
    title: 'ŞAMPİYON! 🏆',
    mascotName: 'Şampiyon',
    img: '/kap1.png',
    badgeBg: 'from-amber-500 via-yellow-400 to-amber-600',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-[0_0_35px_rgba(245,158,11,0.95)]'
  };
};

interface HeceMakasiGameProps {
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
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
}

type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'blue' | 'rose' | 'emerald';
  score: number;
  currentWordIndex: number;
  completedCount: number; // 5 hece sorusundan kaçı tamamlandı
  selectedCuts: number[]; // Slot indices cut by this player
  isCompleted: boolean;
  shakeSlot: number | null; // Slot index that just failed
  wrongAttempts: number;
}

export const HeceMakasiGame: React.FC<HeceMakasiGameProps> = ({
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
  onQuestionAnswered
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 2);
  const [filterSyllables, setFilterSyllables] = useState<number | null>(null); // null = all, 2, 3, 4
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [finalWinner, setFinalWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Sync mode from props
  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  // Questions pool for this match (15 words per match)
  const [wordList, setWordList] = useState<HeceWord[]>(() => getRandomHeceWords(15, filterSyllables || undefined));

  // Audio helper
  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      try {
        playMp3(src);
      } catch (err) {
        console.error(err);
      }
    }
  }, [soundEnabled, playMp3]);

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

  // Setup players
  const createInitialPlayers = useCallback((count: number): PlayerState[] => {
    const list: PlayerState[] = [];
    const colors: ('blue' | 'rose' | 'emerald')[] = ['blue', 'rose', 'emerald'];
    const names = ['1. Oyuncu', '2. Oyuncu', '3. Oyuncu'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Oyuncu' : names[i],
        colorName: colors[i],
        score: 0,
        currentWordIndex: 0,
        completedCount: 0,
        selectedCuts: [],
        isCompleted: false,
        shakeSlot: null,
        wrongAttempts: 0
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));

  // Reset when player count or filter changes
  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setWordList(getRandomHeceWords(15, filterSyllables || undefined));
    setGameOver(false);
    setFinalWinner(null);
    setRoundWinner(null);
  }, [playerMode, filterSyllables, createInitialPlayers]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Perform scissor cut at a letter gap
  const handleCutSlot = (playerIdx: number, slotIndex: number) => {
    const player = players[playerIdx];
    if (!player || player.isCompleted || gameOver) return;

    const currentWord = wordList[player.currentWordIndex % wordList.length];
    if (!currentWord) return;

    // Check if slotIndex is already cut
    if (player.selectedCuts.includes(slotIndex)) {
      return;
    }

    // Check if slotIndex is a valid cut point for this word
    const isValidCut = currentWord.cutIndices.includes(slotIndex);

    if (isValidCut) {
      // Scissors cut sound! (Makas kesme sesi)
      playScissorCutSound(triggerSound);

      const nextCuts = [...player.selectedCuts, slotIndex].sort((a, b) => a - b);
      const isWordFullyCut = nextCuts.length === currentWord.cutIndices.length;

      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          selectedCuts: nextCuts,
          isCompleted: isWordFullyCut,
          score: isWordFullyCut ? p.score + 10 : p.score,
          shakeSlot: null
        };
      }));

      if (isWordFullyCut) {
        triggerSound('/ding.mp3');
        onQuestionAnswered?.(true);

        const nextCompleted = player.completedCount + 1;
        const nextIdx = player.currentWordIndex + 1;
        const isMatchWon = nextCompleted >= TARGET_QUESTIONS || nextIdx >= TARGET_QUESTIONS;

        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          return {
            ...p,
            selectedCuts: nextCuts,
            isCompleted: true,
            score: p.score + 10,
            completedCount: nextCompleted,
            shakeSlot: null
          };
        }));

        // İLK BİTİREN KAZANIR!
        if (isMatchWon) {
          setFinalWinner(playerIdx);
          setGameOver(true);
          triggerSound('/coin.mp3');
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.5 }
          });
          return;
        }

        // Check victory in duel
        if (playerMode > 1) {
          setRoundWinner(playerIdx);
        }

        // Auto advance this player's word after 1.2s
        setTimeout(() => {
          setPlayers(prev => prev.map((p, idx) => {
            if (idx !== playerIdx) return p;
            return {
              ...p,
              currentWordIndex: nextIdx,
              selectedCuts: [],
              isCompleted: false,
              shakeSlot: null,
              wrongAttempts: 0
            };
          }));
          setRoundWinner(null);
        }, 1200);
      }
    } else {
      // Wrong cut attempt!
      triggerSound('/buzzer.mp3');
      onQuestionAnswered?.(false);

      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          shakeSlot: slotIndex,
          wrongAttempts: p.wrongAttempts + 1
        };
      }));

      // Clear shake after 600ms
      setTimeout(() => {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          return {
            ...p,
            shakeSlot: null
          };
        }));
      }, 600);
    }
  };

  const handleNextWordManually = (playerIdx: number) => {
    triggerSound('/op.mp3');
    const player = players[playerIdx];
    if (!player || gameOver) return;

    const nextIdx = player.currentWordIndex + 1;
    if (nextIdx >= TARGET_QUESTIONS) {
      setPlayers(prev => {
        const updated = prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          return {
            ...p,
            currentWordIndex: nextIdx,
            selectedCuts: [],
            isCompleted: false,
            shakeSlot: null,
            wrongAttempts: 0
          };
        });
        const highestScore = Math.max(...updated.map(p => p.score));
        const winner = updated.findIndex(p => p.score === highestScore);
        setFinalWinner(winner >= 0 ? winner : playerIdx);
        setGameOver(true);
        return updated;
      });
      return;
    }

    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== playerIdx) return p;
      return {
        ...p,
        currentWordIndex: nextIdx,
        selectedCuts: [],
        isCompleted: false,
        shakeSlot: null,
        wrongAttempts: 0
      };
    }));
  };

  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setWordList(getRandomHeceWords(15, filterSyllables || undefined));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setFinalWinner(null);
    setRoundWinner(null);
  };

  // Helper theme
  const getPlayerTheme = (color: 'blue' | 'rose' | 'emerald') => {
    switch (color) {
      case 'rose':
        return {
          border: 'border-rose-500/80',
          badgeBg: 'bg-rose-500',
          textColor: 'text-rose-400',
          glow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
          bgGrad: 'from-[#2b0d19] via-[#1a080f] to-[#0c0407]',
          ribbonBg: 'bg-gradient-to-r from-rose-900/60 via-rose-950/80 to-rose-900/60',
          letterBox: 'bg-gradient-to-b from-rose-500/30 to-rose-950/80 border-rose-400/50 text-white',
          cutPointHover: 'hover:bg-rose-400/30 hover:border-rose-400',
          cutPointActive: 'bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/80',
          badgeBg: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
          bgGrad: 'from-[#0b281f] via-[#071913] to-[#030d0a]',
          ribbonBg: 'bg-gradient-to-r from-emerald-900/60 via-emerald-950/80 to-emerald-900/60',
          letterBox: 'bg-gradient-to-b from-emerald-500/30 to-emerald-950/80 border-emerald-400/50 text-white',
          cutPointHover: 'hover:bg-emerald-400/30 hover:border-emerald-400',
          cutPointActive: 'bg-emerald-500 text-white border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
        };
      case 'blue':
      default:
        return {
          border: 'border-cyan-500/80',
          badgeBg: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
          bgGrad: 'from-[#0d2238] via-[#071524] to-[#040a12]',
          ribbonBg: 'bg-gradient-to-r from-cyan-900/60 via-cyan-950/80 to-cyan-900/60',
          letterBox: 'bg-gradient-to-b from-cyan-500/30 to-cyan-950/80 border-cyan-400/50 text-white',
          cutPointHover: 'hover:bg-cyan-400/30 hover:border-cyan-400',
          cutPointActive: 'bg-cyan-500 text-white border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
        };
    }
  };

  // Helper for responsive dynamic tile & slot sizing across 1, 2, and 3 player modes
  const getAdaptiveSizing = (mode: PlayerMode, wordLength: number) => {
    if (mode === 1) {
      if (wordLength >= 10) {
        return {
          ribbonPadding: 'p-2 sm:p-4',
          letterTile: 'w-9 h-12 xs:w-11 xs:h-14 sm:w-13 sm:h-16 md:w-15 md:h-18 rounded-xl sm:rounded-2xl border-2 text-xl xs:text-2xl sm:text-3xl md:text-4xl',
          cutSlot: 'w-4.5 sm:w-6 h-12 sm:h-16',
          cutLineHeight: 'h-12 sm:h-16',
          doneCircle: 'w-6 h-6 sm:w-7 sm:h-7 text-xs',
          triggerCircle: 'w-5 h-5 sm:w-6 sm:h-6',
          scissorIconSize: 13,
        };
      }
      return {
        ribbonPadding: 'p-3 sm:p-5',
        letterTile: 'w-11 h-14 xs:w-13 xs:h-16 sm:w-15 sm:h-18 md:w-18 md:h-22 rounded-2xl border-2 text-2xl xs:text-3xl sm:text-4xl md:text-5xl',
        cutSlot: 'w-6 sm:w-8 h-14 sm:h-18',
        cutLineHeight: 'h-14 sm:h-18',
        doneCircle: 'w-6 h-6 sm:w-7 sm:h-7 text-xs',
        triggerCircle: 'w-5 h-5 sm:w-6 sm:h-6',
        scissorIconSize: 14,
      };
    }

    if (mode === 2) {
      if (wordLength >= 10) {
        return {
          ribbonPadding: 'p-1 sm:p-2',
          letterTile: 'w-5.5 h-7.5 xs:w-6.5 xs:h-8.5 sm:w-8 sm:h-10 md:w-9.5 md:h-12 lg:w-11 lg:h-14 rounded-lg sm:rounded-xl border-[1.5px] sm:border-2 text-xs xs:text-sm sm:text-base md:text-xl lg:text-2xl font-black',
          cutSlot: 'w-3 xs:w-3.5 sm:w-4.5 md:w-5 h-7.5 sm:h-10 md:h-12',
          cutLineHeight: 'h-7.5 sm:h-10 md:h-12',
          doneCircle: 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[8px] sm:text-[9px]',
          triggerCircle: 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5',
          scissorIconSize: 9,
        };
      }
      if (wordLength >= 7) {
        return {
          ribbonPadding: 'p-1.5 sm:p-2.5',
          letterTile: 'w-6.5 h-8.5 xs:w-8 xs:h-10 sm:w-9.5 sm:h-12 md:w-11 md:h-14 lg:w-12 lg:h-15 rounded-xl border-2 text-sm xs:text-base sm:text-xl md:text-2xl font-black',
          cutSlot: 'w-3.5 xs:w-4 sm:w-5 md:w-6 h-8.5 sm:h-12 md:h-14',
          cutLineHeight: 'h-8.5 sm:h-12 md:h-14',
          doneCircle: 'w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[10px]',
          triggerCircle: 'w-4 h-4 sm:w-5 sm:h-5',
          scissorIconSize: 10,
        };
      }
      return {
        ribbonPadding: 'p-2 sm:p-3.5',
        letterTile: 'w-8 h-10 xs:w-9.5 xs:h-12 sm:w-11 sm:h-14 md:w-13 md:h-16 lg:w-15 lg:h-18 rounded-xl sm:rounded-2xl border-2 text-base xs:text-xl sm:text-2xl md:text-3xl font-black',
        cutSlot: 'w-4.5 xs:w-5.5 sm:w-6.5 md:w-7.5 h-10 sm:h-14 md:h-16',
        cutLineHeight: 'h-10 sm:h-14 md:h-16',
        doneCircle: 'w-5 h-5 sm:w-6 sm:h-6 text-xs',
        triggerCircle: 'w-5 h-5 sm:w-6 sm:h-6',
        scissorIconSize: 11,
      };
    }

    // 3 Players Mode - Ultra-Compact & Streamlined
    if (wordLength >= 10) {
      return {
        ribbonPadding: 'p-0.5 sm:p-1',
        letterTile: 'w-4 h-6 xs:w-4.5 xs:h-6.5 sm:w-5.5 sm:h-7.5 md:w-6.5 md:h-8.5 lg:w-7.5 lg:h-9.5 rounded-md border text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-black',
        cutSlot: 'w-2 xs:w-2.5 sm:w-3 md:w-3.5 h-6 sm:h-7.5 md:h-8.5',
        cutLineHeight: 'h-6 sm:h-7.5 md:h-8.5',
        doneCircle: 'w-2.5 h-2.5 sm:w-3 sm:h-3 text-[6px]',
        triggerCircle: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
        scissorIconSize: 7,
      };
    }
    if (wordLength >= 7) {
      return {
        ribbonPadding: 'p-1 sm:p-1.5',
        letterTile: 'w-5 h-7 xs:w-5.5 xs:h-7.5 sm:w-6.5 sm:h-8.5 md:w-7.5 md:h-9.5 lg:w-8.5 lg:h-10.5 rounded-lg border-[1.5px] text-xs xs:text-xs sm:text-sm md:text-base font-black',
        cutSlot: 'w-2.5 xs:w-3 sm:w-3.5 md:w-4 h-7 sm:h-8.5 md:h-9.5',
        cutLineHeight: 'h-7 sm:h-8.5 md:h-9.5',
        doneCircle: 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[7px]',
        triggerCircle: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
        scissorIconSize: 8,
      };
    }
    return {
      ribbonPadding: 'p-1 sm:p-2',
      letterTile: 'w-6 h-8 xs:w-7 xs:h-9 sm:w-8 sm:h-10 md:w-9 md:h-11 lg:w-10 lg:h-12 rounded-lg sm:rounded-xl border-2 text-xs xs:text-sm sm:text-base md:text-lg font-black',
      cutSlot: 'w-3 xs:w-3.5 sm:w-4 md:w-5 h-8 sm:h-10 md:h-11',
      cutLineHeight: 'h-8 sm:h-10 md:h-11',
      doneCircle: 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-[8px]',
      triggerCircle: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      scissorIconSize: 9,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-white select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER / APP BAR */}
      <header className="relative z-30 shrink-0 w-full bg-gradient-to-b from-[#0a1020] via-[#090e1c] to-[#060a14] border-b border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left Side: Navigation & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Menu / Close Button */}
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              onClose();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow transition cursor-pointer active:scale-95"
            title="Etkinlik Menüsüne Dön"
          >
            <ChevronLeft size={16} />
            <span className="hidden xs:inline">Menü</span>
          </button>

          {/* Home Button */}
          {onGoHome && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onGoHome();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition cursor-pointer active:scale-95"
              title="Ana Sayfaya Dön"
            >
              <Home size={15} />
            </button>
          )}

          {/* Prev / Next Activity Nav */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/60">
            {onPrevActivity && (
              <button
                onClick={() => {
                  triggerSound('/op.mp3');
                  onPrevActivity();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Önceki Etkinlik"
              >
                <ArrowLeft size={14} />
              </button>
            )}
            {onNextActivity && (
              <button
                onClick={() => {
                  triggerSound('/op.mp3');
                  onNextActivity();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Sonraki Etkinlik"
              >
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Title Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg border border-cyan-300/40">
              <Scissors size={16} className="text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm md:text-base text-white tracking-wide uppercase">
                  Hece Makası
                </span>
                <span className="hidden md:inline px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase">
                  2. Sınıf Türkçe
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-cyan-200/70 font-medium leading-none">
                Sözcükleri Doğru Yerden Keserek Hecelerine Ayır
              </p>
            </div>
          </div>
        </div>

        {/* Center: Mode Selector (1, 2, 3 Oyuncu) & Syllable Filter */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Player Count Mode Buttons */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-cyan-500/40 shadow-inner">
            {([1, 2, 3] as PlayerMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setPlayerMode(mode);
                  onSwitchPlayerCountMode?.(mode);
                }}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  playerMode === mode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {mode} Kişi
              </button>
            ))}
          </div>

          {/* Syllable Filter */}
          <div className="hidden lg:flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setFilterSyllables(null);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                filterSyllables === null ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            {[2, 3, 4].map(s => (
              <button
                key={s}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setFilterSyllables(s);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  filterSyllables === s ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s} Heceli
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tools (Reset, Sound, Fullscreen) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleResetGame}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition cursor-pointer active:scale-95"
            title="Yeniden Başlat"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800/90 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/90 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition cursor-pointer active:scale-95"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* 2. MAIN BATTLE ARENA / WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-row items-center justify-center gap-1 sm:gap-2 max-w-[1850px] mx-auto w-full min-h-0 min-w-0 overflow-hidden px-1 sm:px-2 py-1">
        <div className="flex-1 flex flex-row relative min-h-0 min-w-0 h-full w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-[#080d1a]">
          {players.map((player, pIdx) => {
            const theme = getPlayerTheme(player.colorName);
            const currentWord = wordList[player.currentWordIndex % wordList.length];
            const isWinnerThisRound = roundWinner === pIdx;
            const assignedStudent = effectiveSelectedStudentIds[pIdx]
              ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
              : null;

            if (!currentWord) return null;

            // Letters array
            const letters = currentWord.word.split('');
            const neededCutsCount = currentWord.cutIndices.length;
            const madeCutsCount = player.selectedCuts.length;
            const sizing = getAdaptiveSizing(playerMode, letters.length);

            return (
              <React.Fragment key={player.id}>
                {/* Individual Player Panel */}
                <div
                  className={`flex-1 min-w-0 flex flex-col justify-between relative bg-gradient-to-b ${theme.bgGrad} min-h-0 ${
                    playerMode === 3
                      ? 'px-1 sm:px-1.5 py-1 sm:py-1.5'
                      : playerMode === 2
                      ? 'px-1.5 sm:px-2.5 py-1.5 sm:py-2'
                      : 'px-3 sm:px-5 py-2 sm:py-3'
                  } transition-all`}
                >
                  {/* Top Bar for Player: Name, Avatar, Score */}
                  <div className="relative z-10 flex items-center justify-between gap-1 pb-1 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      {assignedStudent && (
                        <div className={`rounded-full bg-slate-900 border border-white/40 flex items-center justify-center shadow shrink-0 ${
                          playerMode === 3 ? 'w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-base'
                        }`}>
                          <span>{assignedStudent.avatar}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`rounded-full shrink-0 ${
                            playerMode === 3 ? 'w-2 h-2' : 'w-2.5 h-2.5'
                          } ${theme.badgeBg}`} />
                          <h4 className={`font-black text-white tracking-wide truncate ${
                            playerMode === 3
                              ? 'text-[11px] sm:text-xs max-w-[70px] xs:max-w-[90px] sm:max-w-[130px]'
                              : playerMode === 2
                              ? 'text-xs sm:text-sm max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]'
                              : 'text-xs sm:text-sm'
                          }`}>
                            {assignedStudent ? assignedStudent.name : player.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-cyan-300 font-extrabold block leading-tight ${
                            playerMode === 3 ? 'text-[8.5px] sm:text-[9px]' : 'text-[10px] sm:text-[11px]'
                          }`}>
                            Soru {Math.min(TARGET_QUESTIONS, player.currentWordIndex + 1)} / {TARGET_QUESTIONS}
                          </span>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {Array.from({ length: TARGET_QUESTIONS }).map((_, stepIdx) => {
                              const isPast = stepIdx < player.completedCount;
                              const isCurrent = stepIdx === player.currentWordIndex && !isPast;
                              return (
                                <div
                                  key={stepIdx}
                                  className={`rounded-full transition-all duration-300 ${
                                    playerMode === 3 ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-2 h-2 sm:w-2.5 sm:h-2.5'
                                  } ${
                                    isPast
                                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                                      : isCurrent
                                      ? 'bg-amber-400 ring-1 ring-amber-300 animate-pulse'
                                      : 'bg-slate-700/70 border border-slate-600'
                                  }`}
                                  title={`${stepIdx + 1}. Soru`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className={`flex items-center gap-1 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-inner shrink-0 ${
                      playerMode === 3 ? 'px-1.5 sm:px-2 py-0.5' : 'px-2.5 sm:px-3 py-1'
                    }`}>
                      <Trophy size={playerMode === 3 ? 12 : 14} className="text-amber-400" />
                      <span className={`font-black text-amber-300 ${
                        playerMode === 3 ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                      }`}>
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  {/* Word Hint & Category Badge */}
                  <div className={`flex items-center justify-between gap-1 px-1 shrink-0 ${
                    playerMode === 3 ? 'mt-0.5 sm:mt-1' : 'mt-1.5 sm:mt-2'
                  }`}>
                    <span className={`rounded-lg bg-black/40 border border-white/10 font-semibold text-slate-300 shrink-0 ${
                      playerMode === 3 ? 'px-1.5 py-0.2 text-[8.5px] sm:text-[9px]' : 'px-2 py-0.5 text-[10px] sm:text-xs'
                    }`}>
                      🏷️ {currentWord.category}
                    </span>
                    <span className={`font-medium text-amber-200/90 italic truncate text-center px-1 ${
                      playerMode === 3 ? 'text-[9.5px] sm:text-[10px]' : 'text-[11px] sm:text-xs'
                    }`}>
                      {currentWord.hint}
                    </span>
                    <span className={`rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold shrink-0 ${
                      playerMode === 3 ? 'px-1.5 py-0.2 text-[8.5px] sm:text-[9px]' : 'px-2 py-0.5 text-[10px] sm:text-xs'
                    }`}>
                      {currentWord.syllableCount} Hece
                    </span>
                  </div>

                  {/* Interactive Cutting Ribbon Workspace */}
                  <div className="flex-1 flex flex-col items-center justify-center my-0.5 sm:my-1 min-h-0 min-w-0 overflow-y-auto">
                    {/* Instructions Banner */}
                    {playerMode === 1 ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-cyan-400/30 mb-2 sm:mb-3 shadow shrink-0">
                        <Scissors size={13} className="text-cyan-400 animate-pulse" />
                        <span className="text-[11px] sm:text-xs font-bold text-cyan-200">
                          Hecelerin ayrıldığı harf aralarına makasla tıkla!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 border border-cyan-400/30 mb-1 sm:mb-1.5 shadow shrink-0">
                        <Scissors size={playerMode === 3 ? 10 : 11} className="text-cyan-400" />
                        <span className={`font-bold text-cyan-200 ${playerMode === 3 ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>
                          Hecelerin ayrıldığı aralardan makasla kes!
                        </span>
                      </div>
                    )}

                    {/* Word Ribbon */}
                    <div className={`relative flex items-center justify-center ${sizing.ribbonPadding} rounded-2xl sm:rounded-3xl border-2 ${theme.border} ${theme.ribbonBg} shadow-2xl max-w-full overflow-x-auto shrink-0`}>
                      {letters.map((letter, letterIdx) => {
                        const isCutSlot = letterIdx < letters.length - 1;
                        const isCutDone = isCutSlot && player.selectedCuts.includes(letterIdx);
                        const isCutShaking = isCutSlot && player.shakeSlot === letterIdx;

                        return (
                          <React.Fragment key={letterIdx}>
                            {/* Letter Tile */}
                            <div className={`${sizing.letterTile} flex items-center justify-center font-black shadow-lg transition-transform ${theme.letterBox}`}>
                              {letter}
                            </div>

                            {/* Cut Slot between this letter and next */}
                            {isCutSlot && (
                              <div
                                onClick={() => handleCutSlot(pIdx, letterIdx)}
                                className={`relative group mx-0.5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  isCutShaking ? 'animate-shake' : ''
                                }`}
                                title={isCutDone ? 'Hece buradan kesildi ✂️' : 'Makasla kes'}
                              >
                                {isCutDone ? (
                                  /* Already Cut Separator */
                                  <div className={`flex flex-col items-center justify-center ${sizing.cutSlot}`}>
                                    <div className={`w-0.5 ${sizing.cutLineHeight} bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]`} />
                                    <div className={`absolute ${sizing.doneCircle} rounded-full bg-cyan-500 border border-white flex items-center justify-center shadow-lg text-white animate-in zoom-in duration-200`}>
                                      ✂️
                                    </div>
                                  </div>
                                ) : (
                                  /* Clickable Scissors Cut Trigger */
                                  <div className={`flex flex-col items-center justify-center ${sizing.cutSlot} rounded-md sm:rounded-lg border border-dashed border-white/30 hover:border-cyan-400/80 bg-black/20 hover:bg-cyan-500/20 transition-all`}>
                                    <div className={`w-px ${sizing.cutLineHeight} border-r border-dashed border-white/40 group-hover:border-cyan-300`} />
                                    <div className={`absolute ${sizing.triggerCircle} rounded-full bg-slate-900 group-hover:bg-cyan-500 border border-white/40 group-hover:border-white flex items-center justify-center shadow transition-transform group-hover:scale-125`}>
                                      <Scissors size={sizing.scissorIconSize} className="text-slate-300 group-hover:text-white transform -rotate-45" />
                                    </div>
                                  </div>
                                )}

                                {/* Error tooltip when clicked wrong */}
                                {isCutShaking && (
                                  <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[8px] sm:text-[9px] font-black whitespace-nowrap shadow-lg border border-white/50 animate-bounce z-40">
                                    Buradan kesilmez! 🚫
                                  </div>
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Progress: cuts made */}
                    <div className={`flex items-center gap-1.5 shrink-0 ${
                      playerMode === 3 ? 'mt-1 sm:mt-1.5' : playerMode === 2 ? 'mt-1.5 sm:mt-2' : 'mt-3'
                    }`}>
                      <span className={`text-slate-300 font-bold ${
                        playerMode === 3 ? 'text-[9.5px] sm:text-[10px]' : 'text-xs'
                      }`}>
                        Kesim: {madeCutsCount} / {neededCutsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: neededCutsCount }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className={`rounded-full border flex items-center justify-center transition-all ${
                              playerMode === 3 ? 'w-2.5 h-2.5 text-[6px]' : 'w-3.5 h-3.5 text-[8px]'
                            } ${
                              cIdx < madeCutsCount
                                ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                                : 'bg-slate-800 border-slate-600 text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Syllable Boxes Result Area */}
                    <div className={`w-full max-w-xl flex flex-col items-center shrink-0 ${
                      playerMode === 3 ? 'mt-1 sm:mt-1.5' : playerMode === 2 ? 'mt-1.5 sm:mt-2' : 'mt-3'
                    }`}>
                      <span className={`uppercase tracking-wider text-slate-400 font-bold mb-0.5 ${
                        playerMode === 3 ? 'text-[8px] sm:text-[9px]' : 'text-[10px]'
                      }`}>
                        Oluşan Heceler
                      </span>

                      {player.isCompleted ? (
                        /* Complete Celebration Banner */
                        <div className={`w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300 ${
                          playerMode === 3 ? 'p-1 sm:p-1.5' : playerMode === 2 ? 'p-1.5 sm:p-2' : 'p-2.5'
                        }`}>
                          <Sparkles size={playerMode === 3 ? 12 : 16} className="text-amber-300 animate-spin" />
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            {currentWord.syllables.map((syl, sIdx) => (
                              <React.Fragment key={sIdx}>
                                <span className={`rounded-lg bg-emerald-500 text-slate-950 font-black shadow ${
                                  playerMode === 3
                                    ? 'px-1.5 py-0.5 text-xs'
                                    : playerMode === 2
                                    ? 'px-2 py-0.5 text-xs sm:text-sm'
                                    : 'px-3 py-1 text-sm sm:text-base md:text-lg'
                                }`}>
                                  {syl}
                                </span>
                                {sIdx < currentWord.syllables.length - 1 && (
                                  <span className={`font-black text-emerald-300 ${playerMode === 3 ? 'text-xs' : 'text-sm sm:text-base'}`}>-</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          <span className={`rounded-md bg-emerald-400/30 text-emerald-200 font-black ${
                            playerMode === 3 ? 'px-1 py-0.2 text-[9px]' : 'px-2 py-0.5 text-xs'
                          }`}>
                            TEBRİKLER! 🎉
                          </span>
                        </div>
                      ) : (
                        /* In-progress syllable segments */
                        <div className={`flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap ${
                          playerMode === 3 ? 'min-h-[26px]' : playerMode === 2 ? 'min-h-[32px]' : 'min-h-[44px]'
                        }`}>
                          {(() => {
                            // Compute separated parts based on player.selectedCuts
                            const cuts = [...player.selectedCuts].sort((a, b) => a - b);
                            const parts: string[] = [];
                            let lastIdx = 0;
                            for (const cut of cuts) {
                              parts.push(currentWord.word.substring(lastIdx, cut + 1));
                              lastIdx = cut + 1;
                            }
                            parts.push(currentWord.word.substring(lastIdx));

                            return parts.map((part, pPartIdx) => (
                              <React.Fragment key={pPartIdx}>
                                <div className={`rounded-lg bg-slate-900/90 border border-cyan-400/40 text-cyan-200 font-black shadow tracking-wider ${
                                  playerMode === 3
                                    ? 'px-1.5 py-0.5 text-[10.5px] sm:text-xs'
                                    : playerMode === 2
                                    ? 'px-2 py-0.5 sm:py-1 text-xs sm:text-sm'
                                    : 'px-3 py-1.5 text-sm sm:text-base'
                                }`}>
                                  {part}
                                </div>
                                {pPartIdx < parts.length - 1 && (
                                  <span className={`text-cyan-400 font-black ${playerMode === 3 ? 'text-xs' : 'text-base'}`}>-</span>
                                )}
                              </React.Fragment>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Player Footer Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10 shrink-0">
                    <button
                      onClick={() => handleNextWordManually(pIdx)}
                      className={`rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 ${
                        playerMode === 3 ? 'px-2 py-1 text-[10px] sm:text-[11px]' : 'px-3 py-1.5 text-xs'
                      }`}
                    >
                      <span>{playerMode === 3 ? 'Geç' : 'Kelimeyi Geç'}</span>
                      <ArrowRight size={playerMode === 3 ? 11 : 13} />
                    </button>
                  </div>
                </div>

                {/* VS Divider in Multiplayer */}
                {pIdx < players.length - 1 && (
                  <div className="relative z-20 flex flex-col items-center justify-center shrink-0 w-0 pointer-events-none">
                    <div className="w-[1.5px] sm:w-[2px] h-full bg-white/25 shadow-xs" />
                    <div className="absolute top-2 sm:top-2.5 -translate-x-1/2 px-1.5 py-0.5 rounded-lg bg-slate-950 text-white font-black text-[8.5px] sm:text-[10px] tracking-widest border border-white/60 shadow-lg z-30">
                      VS
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* 3. STUDENT AVATAR DOCK - EN ALTTA TEK SIRA (TÜM MODLARDA) */}
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

      {/* 4. ROUND WINNER POPUP BANNER */}
      {roundWinner !== null && !gameOver && (
        <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-40 flex items-center justify-center pointer-events-none animate-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-2.5 rounded-2xl bg-black/90 border-2 border-amber-400 text-white font-black text-sm sm:text-lg md:text-xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-3">
            <span className="text-xl sm:text-2xl">🎉</span>
            <span>
              {players[roundWinner]?.name} Heceleri Doğru Kesti! (+10 Puan)
            </span>
          </div>
        </div>
      )}

      {/* 5. MATCH COMPLETE VICTORY & VIDEO MODAL (5 Soruyu İlk Bitiren Kazanır) */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300 select-none">
          {(() => {
            const winnerIdx = finalWinner !== null ? finalWinner : (() => {
              const maxCompleted = Math.max(...players.map(p => p.completedCount));
              const topCompleted = players.findIndex(p => p.completedCount === maxCompleted);
              if (topCompleted >= 0) return topCompleted;
              const maxScore = Math.max(...players.map(p => p.score));
              return players.findIndex(p => p.score === maxScore);
            })();

            const safeWinnerIdx = winnerIdx >= 0 ? winnerIdx : 0;
            const winCfg = getWinnerVideoConfig(safeWinnerIdx);
            const winnerPlayer = players[safeWinnerIdx];
            const assignedStudent = effectiveSelectedStudentIds[safeWinnerIdx]
              ? students?.find(s => s.id === effectiveSelectedStudentIds[safeWinnerIdx])
              : null;
            const championDisplayName = assignedStudent
              ? assignedStudent.name
              : (winnerPlayer ? winnerPlayer.name : winCfg.mascotName);

            return (
              <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0d1b33] via-[#091326] to-[#040814] border-2 sm:border-3 border-yellow-400 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(250,204,21,0.7)] flex flex-col items-center gap-2.5 sm:gap-3 max-h-[96vh] overflow-y-auto">
                {/* Header Badge */}
                <div className="flex items-center justify-between w-full border-b border-yellow-400/30 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 flex items-center justify-center text-lg sm:text-2xl shadow-lg border border-white animate-bounce shrink-0">
                      🏆
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-lg md:text-xl font-black text-yellow-300 uppercase tracking-wide flex items-center gap-1.5 drop-shadow">
                        <img src={winCfg.img} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain inline-block" />
                        <span>{championDisplayName} KAZANDI!</span>
                      </h2>
                      <p className="text-[10.5px] sm:text-xs text-amber-200/90 font-bold">
                        🎉 5 Soruyu İlk Bitirerek Şampiyon Oldu! 🥇
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs font-bold"
                    title="Kapat"
                  >
                    ✕ Kapat
                  </button>
                </div>

                {/* THE CELEBRATION VICTORY VIDEO (kap.mp4, ejd.mp4, or sog.mp4) */}
                <div className={`relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 ${winCfg.borderColor} ${winCfg.glowColor} bg-black shadow-2xl flex items-center justify-center`}>
                  <video
                    key={winCfg.videoSrc}
                    src={winCfg.videoSrc}
                    autoPlay
                    loop
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Floating mascot watermark badge */}
                  <div className={`absolute top-2.5 left-2.5 bg-gradient-to-r ${winCfg.badgeBg} text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-lg flex items-center gap-1.5 pointer-events-none border border-white/60`}>
                    <img src={winCfg.img} alt="" className="w-4 h-4 object-contain" />
                    <span>{championDisplayName}</span>
                  </div>
                </div>

                {/* Final Scores Breakdown for All Players */}
                <div className="w-full flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {players.map((p, pIdx) => {
                    const isWin = pIdx === safeWinnerIdx;
                    const st = effectiveSelectedStudentIds[pIdx]
                      ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
                      : null;
                    const displayName = st ? st.name : p.name;
                    return (
                      <div
                        key={p.id}
                        className={`flex-1 p-2 sm:p-2.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                          isWin
                            ? 'bg-amber-500/25 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] text-yellow-200 scale-102 ring-2 ring-yellow-400/40'
                            : 'bg-slate-900/80 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isWin && <span>👑</span>}
                          <span className="font-bold text-[11px] sm:text-xs truncate max-w-[85px] sm:max-w-[120px]">
                            {displayName}
                          </span>
                        </div>
                        <span className="font-black text-sm sm:text-lg text-white">
                          {p.completedCount} / 5 Soru
                        </span>
                        <span className="text-[9.5px] sm:text-[10.5px] text-amber-300 font-bold">
                          {p.score} Puan
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center gap-2 sm:gap-3 w-full mt-1">
                  <button
                    onClick={handleResetGame}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all transform hover:scale-102 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Yeni 5 Soru (Tekrar Oyna)
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Menüye Dön
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
