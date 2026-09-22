import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Scissors, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import { HeceWord, HECE_MAKASI_WORDS, getRandomHeceWords } from '../data/heceMakasiData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

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
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Sync mode from props
  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  // Questions pool for this match (10 words per match)
  const [wordList, setWordList] = useState<HeceWord[]>(() => getRandomHeceWords(12, filterSyllables || undefined));

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
    setWordList(getRandomHeceWords(12, filterSyllables || undefined));
    setGameOver(false);
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
      // Snip sound!
      triggerSound('/op.mp3');

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

        // Check victory in duel
        if (playerMode > 1) {
          setRoundWinner(playerIdx);
        }

        // Auto advance this player's word after 1.4s
        setTimeout(() => {
          setPlayers(prev => prev.map((p, idx) => {
            if (idx !== playerIdx) return p;
            const nextIdx = p.currentWordIndex + 1;
            const isMatchOver = nextIdx >= 10;
            if (isMatchOver) {
              setGameOver(true);
            }
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
        }, 1400);
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
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== playerIdx) return p;
      return {
        ...p,
        currentWordIndex: p.currentWordIndex + 1,
        selectedCuts: [],
        isCompleted: false,
        shakeSlot: null,
        wrongAttempts: 0
      };
    }));
  };

  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setWordList(getRandomHeceWords(12, filterSyllables || undefined));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
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
      <main className="relative z-10 flex-1 flex flex-row items-center justify-center gap-2 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden px-1 sm:px-3 py-1 sm:py-2">
        <div className="flex-1 flex flex-row relative min-h-0 h-full w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-[#080d1a]">
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

            return (
              <React.Fragment key={player.id}>
                {/* Individual Player Panel */}
                <div
                  className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 ${
                    playerMode === 3 ? 'px-1 sm:px-2 py-1.5' : 'px-2 sm:px-4 py-2 sm:py-3'
                  } transition-all`}
                >
                  {/* Top Bar for Player: Name, Avatar, Score */}
                  <div className="relative z-10 flex items-center justify-between gap-1 pb-1 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      {assignedStudent && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-white/40 flex items-center justify-center text-xs sm:text-base shadow">
                          <span>{assignedStudent.avatar}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.badgeBg}`} />
                          <h4 className="font-black text-xs sm:text-sm text-white tracking-wide">
                            {assignedStudent ? assignedStudent.name : player.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Kelime {player.currentWordIndex + 1} / 10
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-inner">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="font-black text-xs sm:text-sm text-amber-300">
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  {/* Word Hint & Category Badge */}
                  <div className="flex items-center justify-between gap-2 mt-2 px-1">
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] sm:text-xs font-semibold text-slate-300">
                      🏷️ {currentWord.category}
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-amber-200/90 italic truncate">
                      {currentWord.hint}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] sm:text-xs font-bold shrink-0">
                      {currentWord.syllableCount} Hece
                    </span>
                  </div>

                  {/* Interactive Cutting Ribbon Workspace */}
                  <div className="flex-1 flex flex-col items-center justify-center my-2 sm:my-3 min-h-0">
                    {/* Instructions Banner */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-cyan-400/30 mb-3 shadow">
                      <Scissors size={13} className="text-cyan-400 animate-pulse" />
                      <span className="text-[11px] sm:text-xs font-bold text-cyan-200">
                        Hecelerin ayrıldığı harf aralarına makasla tıkla!
                      </span>
                    </div>

                    {/* Word Ribbon */}
                    <div className={`relative flex items-center justify-center p-3 sm:p-5 rounded-3xl border-2 ${theme.border} ${theme.ribbonBg} shadow-2xl max-w-full overflow-x-auto`}>
                      {letters.map((letter, letterIdx) => {
                        const isCutSlot = letterIdx < letters.length - 1;
                        const isCutDone = isCutSlot && player.selectedCuts.includes(letterIdx);
                        const isCutShaking = isCutSlot && player.shakeSlot === letterIdx;

                        return (
                          <React.Fragment key={letterIdx}>
                            {/* Letter Tile */}
                            <div className={`w-10 h-12 xs:w-12 xs:h-14 sm:w-14 sm:h-18 md:w-16 md:h-20 rounded-2xl border-2 flex items-center justify-center font-black text-xl xs:text-2xl sm:text-3xl md:text-4xl shadow-lg transition-transform ${theme.letterBox}`}>
                              {letter}
                            </div>

                            {/* Cut Slot between this letter and next */}
                            {isCutSlot && (
                              <div
                                onClick={() => handleCutSlot(pIdx, letterIdx)}
                                className={`relative group mx-0.5 sm:mx-1 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  isCutShaking ? 'animate-shake' : ''
                                }`}
                                title={isCutDone ? 'Hece buradan kesildi ✂️' : 'Makasla kes'}
                              >
                                {isCutDone ? (
                                  /* Already Cut Separator */
                                  <div className="flex flex-col items-center justify-center w-6 sm:w-8 h-12 sm:h-18">
                                    <div className="w-0.5 h-full bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                    <div className="absolute w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-lg text-white text-[11px] sm:text-xs animate-in zoom-in duration-200">
                                      ✂️
                                    </div>
                                  </div>
                                ) : (
                                  /* Clickable Scissors Cut Trigger */
                                  <div className="flex flex-col items-center justify-center w-5 sm:w-7 h-12 sm:h-18 rounded-xl border border-dashed border-white/30 hover:border-cyan-400/80 bg-black/20 hover:bg-cyan-500/20 transition-all">
                                    <div className="w-px h-full border-r border-dashed border-white/40 group-hover:border-cyan-300" />
                                    <div className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 group-hover:bg-cyan-500 border border-white/40 group-hover:border-white flex items-center justify-center shadow transition-transform group-hover:scale-125">
                                      <Scissors size={12} className="text-slate-300 group-hover:text-white transform -rotate-45" />
                                    </div>
                                  </div>
                                )}

                                {/* Error tooltip when clicked wrong */}
                                {isCutShaking && (
                                  <div className="absolute -top-8 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[9px] font-black whitespace-nowrap shadow-lg border border-white/50 animate-bounce">
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
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-bold">
                        Kesim: {madeCutsCount} / {neededCutsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: neededCutsCount }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] transition-all ${
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
                    <div className="mt-3 w-full max-w-xl flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                        Oluşan Heceler
                      </span>

                      {player.isCompleted ? (
                        /* Complete Celebration Banner */
                        <div className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
                          <Sparkles size={18} className="text-amber-300 animate-spin" />
                          <div className="flex items-center gap-2">
                            {currentWord.syllables.map((syl, sIdx) => (
                              <React.Fragment key={sIdx}>
                                <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm sm:text-base md:text-lg shadow">
                                  {syl}
                                </span>
                                {sIdx < currentWord.syllables.length - 1 && (
                                  <span className="font-black text-lg text-emerald-300">-</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          <span className="ml-1 px-2 py-0.5 rounded-lg bg-emerald-400/30 text-emerald-200 text-xs font-black">
                            TEBRİKLER! 🎉
                          </span>
                        </div>
                      ) : (
                        /* In-progress syllable segments */
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-[44px]">
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
                                <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-cyan-200 font-black text-sm sm:text-base shadow tracking-wider">
                                  {part}
                                </div>
                                {pPartIdx < parts.length - 1 && (
                                  <span className="text-cyan-400 font-black text-base">-</span>
                                )}
                              </React.Fragment>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Player Footer Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                    <button
                      onClick={() => handleNextWordManually(pIdx)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Kelimeyi Geç</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* VS Divider in Multiplayer */}
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

      {/* 5. MATCH COMPLETE GAME-OVER MODAL */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <Trophy size={36} className="text-amber-400" />
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
                  className="flex-1 p-3 rounded-2xl border flex flex-col items-center gap-1 bg-slate-950/80 border-slate-700 text-slate-200"
                >
                  <span className="font-bold text-xs">{p.name}</span>
                  <span className="font-black text-2xl text-amber-300">{p.score}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Puan</span>
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
