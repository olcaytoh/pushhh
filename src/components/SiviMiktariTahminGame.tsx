import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  X, ArrowRight, ArrowLeft, Home, Sparkles, User, Users, CheckCircle2, 
  ChevronLeft, ChevronRight, Droplets, Waves, Star
} from 'lucide-react';
import { 
  SiviTahminRound, 
  SIVI_TAHMIN_ROUNDS, 
  getRandomSiviTahminRounds,
  ContainerType,
  ToolType 
} from '../data/siviMiktariTahminData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export const TOTAL_ROUNDS = 5;

interface SiviMiktariTahminGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

export const SiviMiktariTahminGame: React.FC<SiviMiktariTahminGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  // Player mode: 2-player duel by default (can toggle to 1-player)
  const [playerMode, setPlayerMode] = useState<1 | 2>(2);
  const [activePlayerTurn, setActivePlayerTurn] = useState<0 | 1>(0); // 0 = Turuncu, 1 = Mor

  // Rounds pool
  const [rounds, setRounds] = useState<SiviTahminRound[]>(() => getRandomSiviTahminRounds(TOTAL_ROUNDS));
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const currentRound = rounds[currentRoundIndex] || rounds[0];

  // Player Guesses
  const [guessP1, setGuessP1] = useState<number | null>(null); // Turuncu (P1)
  const [guessP2, setGuessP2] = useState<number | null>(null); // Mor (P2)

  // Scores / Stars
  const [starsP1, setStarsP1] = useState<number>(0);
  const [starsP2, setStarsP2] = useState<number>(0);

  // Animation & Gameplay Phases: 'guessing' | 'filling' | 'result' | 'game_over'
  const [phase, setPhase] = useState<'guessing' | 'filling' | 'result' | 'game_over'>('guessing');
  const [currentPoured, setCurrentPoured] = useState<number>(0);

  // Audio & Fullscreen
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Student assignment
  const assignedStudentP1 = useMemo(() => {
    const id = selectedStudentIds?.[0];
    return id ? students?.find(s => s.id === id) : null;
  }, [selectedStudentIds, students]);

  const assignedStudentP2 = useMemo(() => {
    const id = selectedStudentIds?.[1];
    return id ? students?.find(s => s.id === id) : null;
  }, [selectedStudentIds, students]);

  // Handle number click on number line
  const handleSelectNumber = (num: number) => {
    if (phase !== 'guessing') return;
    triggerSound('/click.mp3');

    if (playerMode === 1) {
      setGuessP1(num);
    } else {
      if (activePlayerTurn === 0) {
        setGuessP1(num);
        // If P2 hasn't guessed, auto-switch focus to P2
        if (guessP2 === null) {
          setActivePlayerTurn(1);
        }
      } else {
        setGuessP2(num);
        // If P1 hasn't guessed, switch to P1
        if (guessP1 === null) {
          setActivePlayerTurn(0);
        }
      }
    }
  };

  // Handle fine-tune guess
  const adjustGuess = (playerIdx: 0 | 1, delta: number) => {
    if (phase !== 'guessing') return;
    triggerSound('/click.mp3');
    const max = currentRound.maxScale;

    if (playerIdx === 0) {
      const cur = guessP1 ?? 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      setGuessP1(next);
      setActivePlayerTurn(0);
    } else {
      const cur = guessP2 ?? 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      setGuessP2(next);
      setActivePlayerTurn(1);
    }
  };

  // Check if both players are ready
  const isReadyToFill = useMemo(() => {
    if (playerMode === 1) {
      return guessP1 !== null;
    }
    return guessP1 !== null && guessP2 !== null;
  }, [playerMode, guessP1, guessP2]);

  // Start pouring simulation ("Doldur!")
  const handleStartFill = () => {
    if (!isReadyToFill || phase !== 'guessing') return;
    setPhase('filling');
    setCurrentPoured(0);
    triggerSound('/op.mp3');

    const target = currentRound.targetAmount;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setCurrentPoured(step);
      triggerSound('/op.mp3');

      if (step >= target) {
        clearInterval(interval);
        // Transition to result phase after small delay
        setTimeout(() => {
          evaluateRound();
        }, 600);
      }
    }, 450); // Each poured unit takes 450ms
  };

  // Evaluate Round Result
  const evaluateRound = () => {
    setPhase('result');
    const target = currentRound.targetAmount;

    let p1Correct = false;
    let p2Correct = false;
    let p1Closer = false;
    let p2Closer = false;

    const diff1 = guessP1 !== null ? Math.abs(guessP1 - target) : 999;
    const diff2 = guessP2 !== null ? Math.abs(guessP2 - target) : 999;

    if (diff1 === 0) p1Correct = true;
    if (diff2 === 0) p2Correct = true;

    if (p1Correct || p2Correct) {
      triggerSound('/dogru.mp3');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } else {
      triggerSound('/correct.mp3');
    }

    // Award Stars / Points
    if (p1Correct) {
      setStarsP1(prev => prev + 2);
      onQuestionAnswered?.(true, 0);
    } else if (diff1 < diff2) {
      p1Closer = true;
      setStarsP1(prev => prev + 1);
      onQuestionAnswered?.(true, 0);
    }

    if (playerMode === 2) {
      if (p2Correct) {
        setStarsP2(prev => prev + 2);
        onQuestionAnswered?.(true, 1);
      } else if (diff2 < diff1) {
        p2Closer = true;
        setStarsP2(prev => prev + 1);
        onQuestionAnswered?.(true, 1);
      } else if (diff1 === diff2 && diff1 > 0) {
        // Tie
        setStarsP1(prev => prev + 1);
        setStarsP2(prev => prev + 1);
        onQuestionAnswered?.(true, 0);
        onQuestionAnswered?.(true, 1);
      }
    }
  };

  // Next Round Handler
  const handleNextRound = () => {
    triggerSound('/op.mp3');
    if (currentRoundIndex + 1 >= rounds.length) {
      // Game Completed
      setPhase('game_over');
      triggerSound('/kazandinn.mp3');
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });

      let winnerIdx: number | null = null;
      if (playerMode === 2) {
        if (starsP1 > starsP2) winnerIdx = 0;
        else if (starsP2 > starsP1) winnerIdx = 1;
      } else {
        winnerIdx = 0;
      }
      onGameCompleted?.(winnerIdx, playerMode);
    } else {
      setCurrentRoundIndex(prev => prev + 1);
      setGuessP1(null);
      setGuessP2(null);
      setCurrentPoured(0);
      setPhase('guessing');
      setActivePlayerTurn(0);
    }
  };

  // Reset / Play Again
  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setRounds(getRandomSiviTahminRounds(TOTAL_ROUNDS));
    setCurrentRoundIndex(0);
    setGuessP1(null);
    setGuessP2(null);
    setStarsP1(0);
    setStarsP2(0);
    setCurrentPoured(0);
    setPhase('guessing');
    setActivePlayerTurn(0);
  };

  // Render Target Container Graphic using real cropped sprites
  const renderContainerGraphic = () => {
    const fillPercent = currentRound.targetAmount > 0 
      ? Math.min(100, (currentPoured / currentRound.targetAmount) * 100)
      : 0;
    const isPouring = phase === 'filling';

    // Proportional container sizing registry based directly on user's Sivivi.png dimensions
    // Base dimensions from Sivivi.png:
    // akvaryum: 837x709, damacana: 608x581, tencere: 642x407, kova: 500x499,
    // fanus: 474x475, surahi: 320x389, kepce: 221x311, su_bardagi: 227x262,
    // cay_bardagi: 123x171, fincan: 148x151, kasik: 67x296, balik: 119x91
    const toolConfig: Record<ToolType, {
      sprite: string;
      desktopW: number;
      desktopH: number;
      tilt: number;
      mouthTop: string;
      mouthLeft: string;
      streamW: string;
      streamH: string;
    }> = {
      surahi: {
        sprite: '/sivi_oyunu/sprites/surahi_bos.png',
        desktopW: 118,
        desktopH: 144,
        tilt: -32,
        mouthTop: '10%',
        mouthLeft: '-20px',
        streamW: '75px',
        streamH: '135px'
      },
      kova: {
        sprite: '/sivi_oyunu/sprites/kova_bos.png',
        desktopW: 135,
        desktopH: 135,
        tilt: -30,
        mouthTop: '14%',
        mouthLeft: '-25px',
        streamW: '80px',
        streamH: '140px'
      },
      kepce: {
        sprite: '/sivi_oyunu/sprites/kepce.png',
        desktopW: 76,
        desktopH: 108,
        tilt: -38,
        mouthTop: '65%',
        mouthLeft: '-20px',
        streamW: '55px',
        streamH: '110px'
      },
      su_bardagi: {
        sprite: '/sivi_oyunu/sprites/su_bardagi_bos.png',
        desktopW: 84,
        desktopH: 98,
        tilt: -35,
        mouthTop: '12%',
        mouthLeft: '-18px',
        streamW: '60px',
        streamH: '115px'
      },
      cay_bardagi: {
        sprite: '/sivi_oyunu/sprites/cay_bardagi_bos.png',
        desktopW: 60,
        desktopH: 82,
        tilt: -35,
        mouthTop: '10%',
        mouthLeft: '-16px',
        streamW: '50px',
        streamH: '105px'
      },
      kasik: {
        sprite: '/sivi_oyunu/sprites/kasik.png',
        desktopW: 34,
        desktopH: 115,
        tilt: -42,
        mouthTop: '70%',
        mouthLeft: '-16px',
        streamW: '42px',
        streamH: '95px'
      },
      fincan: {
        sprite: '/sivi_oyunu/sprites/fincan.png',
        desktopW: 72,
        desktopH: 74,
        tilt: -35,
        mouthTop: '10%',
        mouthLeft: '-18px',
        streamW: '54px',
        streamH: '105px'
      },
      sise: {
        sprite: '/sivi_oyunu/sprites/su_bardagi_bos.png',
        desktopW: 84,
        desktopH: 98,
        tilt: -35,
        mouthTop: '12%',
        mouthLeft: '-18px',
        streamW: '60px',
        streamH: '115px'
      }
    };

    const containerConfig: Record<ContainerType, {
      empty: string;
      full: string;
      desktopW: number;
      desktopH: number;
    }> = {
      akvaryum: {
        empty: '/sivi_oyunu/sprites/akvaryum_bos.png',
        full: '/sivi_oyunu/sprites/akvaryum_dolu.png',
        desktopW: 340,
        desktopH: 288
      },
      damacana: {
        empty: '/sivi_oyunu/sprites/damacana_bos.png',
        full: '/sivi_oyunu/sprites/damacana_dolu.png',
        desktopW: 240,
        desktopH: 230
      },
      tencere: {
        empty: '/sivi_oyunu/sprites/tencere_bos.png',
        full: '/sivi_oyunu/sprites/tencere_dolu.png',
        desktopW: 260,
        desktopH: 165
      },
      kova: {
        empty: '/sivi_oyunu/sprites/kova_bos.png',
        full: '/sivi_oyunu/sprites/kova_dolu.png',
        desktopW: 200,
        desktopH: 200
      },
      fanus: {
        empty: '/sivi_oyunu/sprites/fanus_bos.png',
        full: '/sivi_oyunu/sprites/fanus_dolu.png',
        desktopW: 195,
        desktopH: 195
      },
      surahi: {
        empty: '/sivi_oyunu/sprites/surahi_bos.png',
        full: '/sivi_oyunu/sprites/surahi_dolu.png',
        desktopW: 130,
        desktopH: 158
      },
      vazo: {
        empty: '/sivi_oyunu/sprites/surahi_bos.png',
        full: '/sivi_oyunu/sprites/surahi_dolu.png',
        desktopW: 130,
        desktopH: 158
      }
    };

    const cfg = containerConfig[currentRound.containerType] || containerConfig.fanus;
    const tool = toolConfig[currentRound.toolType] || toolConfig.surahi;

    return (
      <div 
        className="relative flex items-center justify-center filter drop-shadow-2xl select-none transition-all duration-300"
        style={{
          width: `min(${cfg.desktopW}px, 60vw)`,
          height: `min(${cfg.desktopH}px, 40vh)`,
          maxWidth: `${cfg.desktopW}px`,
          maxHeight: `${cfg.desktopH}px`,
          aspectRatio: `${cfg.desktopW} / ${cfg.desktopH}`
        }}
      >
        {/* 1. Base Empty Container */}
        <img
          src={cfg.empty}
          alt={currentRound.containerName}
          className="w-full h-full object-contain pointer-events-none transition-transform duration-300"
        />

        {/* 2. Full Container reveal layer with vertical clip-path */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out flex items-center justify-center overflow-hidden"
          style={{
            clipPath: `inset(${100 - fillPercent}% 0 0 0)`
          }}
        >
          <img
            src={cfg.full}
            alt={`${currentRound.containerName} Dolu`}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* 3. Water surface glow wave when partially filled */}
        {fillPercent > 0 && fillPercent < 100 && (
          <div 
            className="absolute inset-x-4 sm:inset-x-8 h-2 sm:h-3 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent rounded-full blur-xs pointer-events-none animate-pulse z-20"
            style={{
              bottom: `${Math.max(6, fillPercent * 0.85)}%`
            }}
          />
        )}

        {/* 4. Rising bubbles when pouring */}
        {isPouring && (
          <div className="absolute inset-x-8 bottom-6 top-8 flex justify-around pointer-events-none z-25 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-200/90 shadow-sm animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-2 h-2 rounded-full bg-white/90 shadow-sm animate-bounce" style={{ animationDelay: '0.35s' }} />
            <span className="w-3 h-3 rounded-full bg-sky-200/90 shadow-sm animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-100/90 shadow-sm animate-bounce" style={{ animationDelay: '0.45s' }} />
          </div>
        )}

        {/* 5. Swimming Goldfish Reward upon filling Fanus or Akvaryum */}
        {(currentRound.containerType === 'fanus' || currentRound.containerType === 'akvaryum') && fillPercent >= 30 && (
          <div 
            className={`absolute z-30 pointer-events-none transition-all duration-700 ${
              fillPercent >= 100 ? 'top-1/3 left-1/3 animate-bounce' : 'bottom-12 left-1/2 -translate-x-1/2'
            }`}
          >
            <img
              src="/sivi_oyunu/sprites/balik.png"
              alt="Japon Balığı"
              className="w-10 h-8 sm:w-12 sm:h-10 object-contain filter drop-shadow-md scale-x-[-1]"
            />
          </div>
        )}

        {/* 6. Active Pouring Tool at container mouth with water pouring from mouth */}
        {isPouring && (
          <div 
            className={`absolute z-40 pointer-events-none transition-all duration-300 ${
              currentRound.containerType === 'akvaryum'
                ? '-top-14 sm:-top-20 right-4 sm:right-8'
                : currentRound.containerType === 'tencere'
                ? '-top-14 sm:-top-20 right-2 sm:right-6'
                : '-top-14 sm:-top-20 -right-2 sm:right-2'
            }`}
          >
            <div
              className="relative flex flex-col items-center"
              style={{
                transform: `rotate(${tool.tilt}deg)`,
                transformOrigin: '20% 25%'
              }}
            >
              <div
                style={{
                  width: `${tool.desktopW}px`,
                  height: `${tool.desktopH}px`
                }}
                className="relative flex items-center justify-center filter drop-shadow-2xl"
              >
                <img
                  src={tool.sprite}
                  alt={currentRound.toolName}
                  className="w-full h-full object-contain"
                />

                {/* WATER STREAM ATTACHED DIRECTLY TO MOUTH / SPOUT */}
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    top: tool.mouthTop,
                    left: tool.mouthLeft,
                    width: tool.streamW,
                    height: tool.streamH,
                    transform: `rotate(${-tool.tilt}deg)`,
                    transformOrigin: 'top right'
                  }}
                >
                  <img
                    src="/sivi_oyunu/sprites/su_akisi.png"
                    alt="Su Akışı"
                    className="w-full h-full object-fill animate-pulse filter drop-shadow-[0_0_12px_rgba(56,189,248,0.95)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Splash ripple at water entrance */}
        {isPouring && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-14 sm:w-20 h-3 bg-cyan-300/80 rounded-full blur-xs animate-ping pointer-events-none z-20"
            style={{
              bottom: `${Math.max(6, fillPercent * 0.85)}%`
            }}
          />
        )}

        {/* 8. Container Name Plate Badge */}
        <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/50 shadow-md text-[11px] sm:text-xs font-black text-cyan-200 whitespace-nowrap">
          {currentRound.containerName}
        </div>
      </div>
    );
  };

  // Render Measuring Tool Station on the Countertop (Always visible beside the container)
  const renderTableToolStation = () => {
    const isPouring = phase === 'filling';

    const toolConfig: Record<ToolType, {
      sprite: string;
      desktopW: number;
      desktopH: number;
    }> = {
      surahi: {
        sprite: '/sivi_oyunu/sprites/surahi_bos.png',
        desktopW: 118,
        desktopH: 144
      },
      kova: {
        sprite: '/sivi_oyunu/sprites/kova_bos.png',
        desktopW: 135,
        desktopH: 135
      },
      kepce: {
        sprite: '/sivi_oyunu/sprites/kepce.png',
        desktopW: 76,
        desktopH: 108
      },
      su_bardagi: {
        sprite: '/sivi_oyunu/sprites/su_bardagi_bos.png',
        desktopW: 84,
        desktopH: 98
      },
      cay_bardagi: {
        sprite: '/sivi_oyunu/sprites/cay_bardagi_bos.png',
        desktopW: 60,
        desktopH: 82
      },
      kasik: {
        sprite: '/sivi_oyunu/sprites/kasik.png',
        desktopW: 34,
        desktopH: 115
      },
      fincan: {
        sprite: '/sivi_oyunu/sprites/fincan.png',
        desktopW: 72,
        desktopH: 74
      },
      sise: {
        sprite: '/sivi_oyunu/sprites/su_bardagi_bos.png',
        desktopW: 84,
        desktopH: 98
      }
    };

    const tool = toolConfig[currentRound.toolType] || toolConfig.surahi;

    return (
      <div className="relative ml-3 sm:ml-6 md:ml-10 self-end mb-1 select-none flex flex-col items-center shrink-0">
        <div 
          className={`flex flex-col items-center transition-all duration-300 ${
            isPouring ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Tool Visual */}
          <div
            style={{
              width: `min(${tool.desktopW}px, 22vw)`,
              height: `min(${tool.desktopH}px, 22vh)`,
              maxWidth: `${tool.desktopW}px`,
              maxHeight: `${tool.desktopH}px`,
              aspectRatio: `${tool.desktopW} / ${tool.desktopH}`
            }}
            className="relative flex items-center justify-center filter drop-shadow-xl"
          >
            <img
              src={tool.sprite}
              alt={currentRound.toolName}
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Tool Label Badge */}
          <div className="mt-1 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-400/50 shadow-md whitespace-nowrap">
              {currentRound.toolName}
            </span>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-900 bg-amber-200/95 px-2 py-0.2 rounded-full mt-0.5 shadow-xs whitespace-nowrap">
              Ölçü Aracı
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#091022] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER BANNER */}
      <header className="w-full shrink-0 z-20 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-950 via-[#0e1b38] to-slate-950 border-b border-cyan-500/30 flex items-center justify-between gap-2 shadow-lg">
        {/* Left: Gezinme & Activity Title & Round */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
            title="Geri Dön"
          >
            <ArrowLeft size={18} />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shadow-sm shrink-0"
              title="Ana Sayfaya Dön"
            >
              <Home size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition cursor-pointer shadow-sm shrink-0"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-300 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shrink-0">
            <span>🐠 Sıvı Ölçme Tahmini</span>
            <span className="text-cyan-200 text-[10px] sm:text-xs">| Düello</span>
          </div>
          <div className="px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 font-extrabold text-[11px] sm:text-xs shrink-0">
            {currentRoundIndex + 1}. tur / {rounds.length}
          </div>
        </div>

        {/* Center: Instruction / Status Banner */}
        <div className="hidden md:flex flex-col items-center justify-center px-4 py-1 rounded-2xl bg-white border-2 border-cyan-400 text-slate-900 shadow-md min-w-[280px]">
          {phase === 'result' ? (
            <div className="text-center">
              <span className="text-sm font-black text-blue-600">
                {currentRound.targetAmount} {currentRound.unitLabel}
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                {guessP1 === currentRound.targetAmount && guessP2 === currentRound.targetAmount
                  ? 'İki Oyuncu da Tam Bildi! 🏆'
                  : guessP1 === currentRound.targetAmount
                  ? 'Turuncu Tam Bildi! 🏆'
                  : guessP2 === currentRound.targetAmount
                  ? 'Mor Tam Bildi! 🏆'
                  : Math.abs((guessP1 ?? 99) - currentRound.targetAmount) < Math.abs((guessP2 ?? 99) - currentRound.targetAmount)
                  ? 'Turuncu daha yakın tahmin etti! 🎉'
                  : Math.abs((guessP2 ?? 99) - currentRound.targetAmount) < Math.abs((guessP1 ?? 99) - currentRound.targetAmount)
                  ? 'Mor daha yakın tahmin etti! 🎉'
                  : 'Berabere! Her iki tahmin de eşit yakınlıkta! 🤝'}
              </h3>
            </div>
          ) : phase === 'filling' ? (
            <div className="text-center">
              <span className="text-xs font-bold text-sky-600">Dolduruluyor...</span>
              <h3 className="text-sm sm:text-base font-black text-blue-700">
                {currentPoured} {currentRound.unitLabel}
              </h3>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">{currentRound.roundNumber}. tur</span>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                {currentRound.question}
              </h3>
            </div>
          )}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setPhase('game_over')}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Oyunu Bitir"
          >
            <span>🏁 Bitir</span>
          </button>

          <button
            onClick={() => {
              const nextMode = playerMode === 1 ? 2 : 1;
              setPlayerMode(nextMode);
              triggerSound('/click.mp3');
            }}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Oyuncu Modunu Değiştir"
          >
            {playerMode === 1 ? <User size={13} /> : <Users size={13} />}
            <span className="hidden sm:inline">{playerMode} Oyuncu</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition cursor-pointer"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition cursor-pointer"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-400 text-white transition cursor-pointer"
            title="Kapat"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* MOBILE CENTER QUESTION BANNER */}
      <div className="md:hidden w-full px-2 py-1 bg-white border-b border-cyan-400 text-slate-900 text-center shadow-xs">
        {phase === 'result' ? (
          <h3 className="text-xs font-black text-blue-700">
            {currentRound.targetAmount} {currentRound.unitLabel} • Sonuç Değerlendirildi!
          </h3>
        ) : phase === 'filling' ? (
          <h3 className="text-xs font-black text-blue-700">
            Dolduruluyor: {currentPoured} {currentRound.unitLabel}
          </h3>
        ) : (
          <h3 className="text-xs font-black text-slate-900">
            {currentRound.question}
          </h3>
        )}
      </div>

      {/* 2. MAIN BATTLE ARENA & STAGE */}
      <main className="relative flex-1 w-full flex flex-col justify-between overflow-hidden min-h-0 bg-gradient-to-b from-[#bfe8ff] via-[#dff4ff] to-[#f4ecd8]">
        {/* ROOM BACKGROUND DECORATIONS */}
        {/* Window on right */}
        <div className="absolute top-2 right-4 w-32 sm:w-44 md:w-56 h-40 sm:h-52 md:h-64 rounded-t-2xl border-4 border-white/90 shadow-lg bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 overflow-hidden pointer-events-none select-none opacity-90">
          <div className="absolute top-0 inset-x-0 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 text-4xl sm:text-5xl text-emerald-600/70">
            🌳 🍃 🌿
          </div>
          <div className="absolute top-1/2 inset-x-0 h-1 bg-white/80" />
          <div className="absolute left-1/2 inset-y-0 w-1 bg-white/80" />
        </div>

        {/* Framed pictures on left */}
        <div className="absolute top-4 left-4 hidden sm:flex flex-col gap-2 pointer-events-none select-none opacity-90">
          <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-xl bg-amber-100 border-3 border-amber-600/80 shadow-md flex items-center justify-center text-2xl sm:text-3xl">
            🐚
          </div>
          <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-xl bg-amber-100 border-3 border-amber-600/80 shadow-md flex items-center justify-center text-2xl sm:text-3xl">
            ⭐
          </div>
        </div>

        {/* Small Fishbowl on the counter (Waiting little friend) */}
        <div className="absolute bottom-24 left-6 sm:left-14 hidden md:flex flex-col items-center pointer-events-none select-none">
          <div className="w-18 h-16 rounded-full border-2 border-cyan-300/80 bg-cyan-200/40 shadow flex items-center justify-center p-1">
            <img
              src="/sivi_oyunu/sprites/balik.png"
              alt="Dost Balık"
              className="w-12 h-10 object-contain drop-shadow"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-white/80 px-1.5 rounded-full shadow-xs mt-0.5">
            Dost Balık
          </span>
        </div>

        {/* STAGE CENTER: TARGET CONTAINER & MEASURING TOOL STATION */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-0 pt-4 pb-1">
          {/* Main Tabletop Arena: Container + Tool Stand */}
          <div className="relative flex items-end justify-center min-h-0 max-h-[46vh] px-2 sm:px-6">
            {/* Center Target Container (with top-mounted pouring tool when filling) */}
            {renderContainerGraphic()}

            {/* Measuring Tool Station on the Countertop (Always visible) */}
            {renderTableToolStation()}
          </div>

          {/* Current Pouring Counter Bubble in Center during filling */}
          {phase === 'filling' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-2xl bg-white/95 border-2 border-cyan-500 shadow-2xl flex flex-col items-center pointer-events-none animate-pulse">
              <span className="text-3xl sm:text-4xl font-black text-blue-700">
                {currentPoured}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase">
                {currentRound.unitLabel}
              </span>
            </div>
          )}
        </div>

        {/* WOODEN COUNTER TOP WITH NUMBER LINE & SLIDER */}
        <div className="w-full relative z-20 px-2 sm:px-4 md:px-8 pb-1 pt-1 bg-gradient-to-b from-[#e3caa5] via-[#d4b589] to-[#b99462] border-t-4 border-[#9a7647] shadow-[0_-8px_20px_rgba(0,0,0,0.15)] flex flex-col items-center">
          
          {/* NUMBER LINE CONTAINER (SAYI ÇİZGİSİ) */}
          <div className="w-full max-w-4xl bg-white/95 rounded-2xl border-2 sm:border-3 border-blue-500 shadow-xl px-2 sm:px-4 py-2 relative">
            
            {/* NUMBER TICKS & TRACK */}
            <div className="relative w-full h-12 sm:h-14 flex items-center select-none">
              {/* Blue Rail Track */}
              <div className="absolute inset-x-2 h-2 sm:h-2.5 bg-blue-500 rounded-full" />

              {/* SLIDING BLUE BEAD (BONCUK) */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 border-2 border-white shadow-lg z-30 transition-all duration-300 pointer-events-none flex items-center justify-center"
                style={{
                  left: `calc((${Math.min(currentRound.maxScale, currentPoured)} / ${currentRound.maxScale}) * (100% - 1.5rem))`
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>

              {/* TICKS AND LABELS */}
              <div className="relative w-full flex justify-between items-center z-10">
                {Array.from({ length: currentRound.maxScale + 1 }, (_, idx) => {
                  const isP1 = guessP1 === idx;
                  const isP2 = playerMode === 2 && guessP2 === idx;
                  const isTarget = phase === 'result' && currentRound.targetAmount === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectNumber(idx)}
                      className="group flex flex-col items-center cursor-pointer transition-transform relative py-1 px-0.5 hover:scale-110 active:scale-95"
                      title={`${idx} ${currentRound.unitLabel}`}
                    >
                      {/* FLAG 1 (Turuncu - P1) */}
                      {isP1 && (
                        <div className="absolute -top-10 sm:-top-11 z-40 flex flex-col items-center animate-bounce">
                          {/* Result status pill if round evaluated */}
                          {phase === 'result' && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black shadow-md border ${
                              idx === currentRound.targetAmount
                                ? 'bg-amber-400 text-slate-950 border-white'
                                : idx > currentRound.targetAmount
                                ? 'bg-slate-700 text-slate-200 border-slate-500'
                                : 'bg-orange-500 text-white border-white'
                            }`}>
                              {idx === currentRound.targetAmount ? 'Doğru!' : idx > currentRound.targetAmount ? 'Fazla' : 'Az'}
                            </span>
                          )}
                          <div className="w-5 sm:w-6 h-4 sm:h-5 bg-orange-500 border border-white rounded-t font-black text-[10px] sm:text-xs text-white flex items-center justify-center shadow">
                            T
                          </div>
                          <div className="w-0.5 h-3 bg-orange-700" />
                        </div>
                      )}

                      {/* FLAG 2 (Mor - P2) */}
                      {isP2 && (
                        <div className={`absolute -top-10 sm:-top-11 z-40 flex flex-col items-center animate-bounce ${isP1 ? 'translate-x-3' : ''}`}>
                          {/* Result status pill if round evaluated */}
                          {phase === 'result' && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black shadow-md border ${
                              idx === currentRound.targetAmount
                                ? 'bg-amber-400 text-slate-950 border-white'
                                : idx > currentRound.targetAmount
                                ? 'bg-slate-700 text-slate-200 border-slate-500'
                                : 'bg-purple-500 text-white border-white'
                            }`}>
                              {idx === currentRound.targetAmount ? 'Doğru!' : idx > currentRound.targetAmount ? 'Fazla' : 'Az'}
                            </span>
                          )}
                          <div className="w-5 sm:w-6 h-4 sm:h-5 bg-purple-600 border border-white rounded-t font-black text-[10px] sm:text-xs text-white flex items-center justify-center shadow">
                            M
                          </div>
                          <div className="w-0.5 h-3 bg-purple-800" />
                        </div>
                      )}

                      {/* Tick line */}
                      <div className={`w-0.5 h-3.5 sm:h-4.5 rounded-full ${
                        isTarget ? 'bg-amber-500 h-5 sm:h-6 w-1' : 'bg-blue-600'
                      }`} />

                      {/* Number Text */}
                      <span className={`text-[11px] sm:text-sm md:text-base font-black transition-colors ${
                        isTarget 
                          ? 'text-amber-600 scale-125' 
                          : isP1 || isP2 
                          ? 'text-blue-900 font-extrabold scale-110' 
                          : 'text-slate-800'
                      }`}>
                        {idx}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM CARDS & ACTION DOCK */}
      <footer className="w-full shrink-0 z-20 px-2 sm:px-6 py-2 bg-[#080f22] border-t-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl">
        
        {/* PLAYER 1 CARD (TURUNCU) */}
        <div 
          onClick={() => {
            if (phase === 'guessing') setActivePlayerTurn(0);
          }}
          className={`flex-1 w-full sm:w-auto p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
            activePlayerTurn === 0 && phase === 'guessing'
              ? 'bg-orange-950/40 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] ring-2 ring-orange-400/40'
              : 'bg-slate-900/80 border-orange-500/50'
          }`}
        >
          {/* Header pill & Avatar */}
          <div className="flex items-center justify-between pb-1 border-b border-orange-500/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow" />
              <span className="font-black text-xs sm:text-sm text-orange-400">
                {assignedStudentP1 ? assignedStudentP1.name : 'Turuncu (1. Oyuncu)'}
              </span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-0.5 text-amber-400 font-black text-xs">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{starsP1}</span>
            </div>
          </div>

          {/* Guess Status & Controls */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="flex items-center gap-1">
              <button
                disabled={phase !== 'guessing'}
                onClick={(e) => { e.stopPropagation(); adjustGuess(0, -1); }}
                className="w-6 h-6 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 border border-orange-400/60 text-orange-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Bayrağın: <strong className="text-orange-400 text-base sm:text-lg">{guessP1 !== null ? guessP1 : '?'}</strong>
              </span>
              <button
                disabled={phase !== 'guessing'}
                onClick={(e) => { e.stopPropagation(); adjustGuess(0, 1); }}
                className="w-6 h-6 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 border border-orange-400/60 text-orange-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Turn or Result note */}
            {phase === 'guessing' ? (
              <span className={`text-[10px] sm:text-xs font-bold ${activePlayerTurn === 0 ? 'text-orange-300 animate-pulse' : 'text-slate-400'}`}>
                {activePlayerTurn === 0 ? '👆 Tahminine dokun!' : 'Sıra arkadaşında...'}
              </span>
            ) : phase === 'result' ? (
              <span className="text-[10px] sm:text-xs font-black text-amber-300">
                {guessP1 === currentRound.targetAmount
                  ? '+2 ⭐ Doğru!'
                  : (guessP1 ?? 99) > currentRound.targetAmount
                  ? 'Fazla tahmin'
                  : 'Az tahmin'}
              </span>
            ) : null}
          </div>
        </div>

        {/* CENTER ACTION BUTTON */}
        <div className="shrink-0 flex items-center justify-center py-1">
          {phase === 'guessing' ? (
            <button
              disabled={!isReadyToFill}
              onClick={handleStartFill}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all transform shadow-xl flex items-center gap-2 cursor-pointer ${
                isReadyToFill
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white hover:scale-105 active:scale-95 ring-2 ring-cyan-300 animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
              }`}
            >
              <Droplets size={18} />
              <span>Doldur!</span>
            </button>
          ) : phase === 'filling' ? (
            <div className="px-5 py-2.5 rounded-2xl bg-slate-800/90 border border-cyan-400/40 text-cyan-300 font-extrabold text-sm flex items-center gap-2 shadow">
              <span className="animate-spin">💧</span>
              <span>Dolduruluyor ({currentPoured}/{currentRound.targetAmount})</span>
            </div>
          ) : (
            <button
              onClick={handleNextRound}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer ring-2 ring-emerald-300"
            >
              <span>Sonraki tur</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* PLAYER 2 CARD (MOR) - Sadece 2 oyuncu modunda */}
        {playerMode === 2 && (
          <div 
            onClick={() => {
              if (phase === 'guessing') setActivePlayerTurn(1);
            }}
            className={`flex-1 w-full sm:w-auto p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
              activePlayerTurn === 1 && phase === 'guessing'
                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/40'
                : 'bg-slate-900/80 border-purple-500/50'
            }`}
          >
            {/* Header pill & Avatar */}
            <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow" />
                <span className="font-black text-xs sm:text-sm text-purple-400">
                  {assignedStudentP2 ? assignedStudentP2.name : 'Mor (2. Oyuncu)'}
                </span>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-0.5 text-amber-400 font-black text-xs">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{starsP2}</span>
              </div>
            </div>

            {/* Guess Status & Controls */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <div className="flex items-center gap-1">
                <button
                  disabled={phase !== 'guessing'}
                  onClick={(e) => { e.stopPropagation(); adjustGuess(1, -1); }}
                  className="w-6 h-6 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/60 text-purple-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  -
                </button>
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  Bayrağın: <strong className="text-purple-400 text-base sm:text-lg">{guessP2 !== null ? guessP2 : '?'}</strong>
                </span>
                <button
                  disabled={phase !== 'guessing'}
                  onClick={(e) => { e.stopPropagation(); adjustGuess(1, 1); }}
                  className="w-6 h-6 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/60 text-purple-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Turn or Result note */}
              {phase === 'guessing' ? (
                <span className={`text-[10px] sm:text-xs font-bold ${activePlayerTurn === 1 ? 'text-purple-300 animate-pulse' : 'text-slate-400'}`}>
                  {activePlayerTurn === 1 ? '👆 Tahminine dokun!' : 'Sıra arkadaşında...'}
                </span>
              ) : phase === 'result' ? (
                <span className="text-[10px] sm:text-xs font-black text-amber-300">
                  {guessP2 === currentRound.targetAmount
                    ? '+2 ⭐ Doğru!'
                    : (guessP2 ?? 99) > currentRound.targetAmount
                    ? 'Fazla tahmin'
                    : 'Az tahmin'}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </footer>

      {/* 4. STUDENT AVATAR DOCK */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5 bg-slate-950/90">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds || []}
            onSelectStudentForPlayer={(pIdx, id) => {
              if (onSelectStudentForPlayer) {
                onSelectStudentForPlayer(pIdx, id);
              }
              triggerSound('/op.mp3');
            }}
            onOpenRosterModal={() => onOpenRosterModal(2)}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* 5. GAME OVER / VICTORY MODAL */}
      {phase === 'game_over' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0d1c3a] to-[#081022] border-2 sm:border-3 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center text-center">
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-lg flex items-center justify-center text-3xl sm:text-4xl -mt-10 sm:-mt-12 mb-2 animate-bounce">
              🏆
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide">
              {playerMode === 2 
                ? (starsP1 > starsP2 
                    ? `${assignedStudentP1 ? assignedStudentP1.name : 'Turuncu'} Kazandı!` 
                    : starsP2 > starsP1 
                    ? `${assignedStudentP2 ? assignedStudentP2.name : 'Mor'} Kazandı!` 
                    : 'Dostluk Kazandı (Berabere)!')
                : 'Tebrikler! Sıvı Tahminini Tamamladın!'}
            </h2>

            <div className="my-2 flex items-center justify-center gap-2">
              <img
                src="/sivi_oyunu/sprites/balik.png"
                alt="Şampiyon Balık"
                className="w-14 h-12 sm:w-16 sm:h-14 object-contain filter drop-shadow-lg animate-bounce"
              />
              <img
                src="/sivi_oyunu/sprites/fanus_dolu.png"
                alt="Dolu Fanus"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-lg"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4">
              Harika bir sıvı ölçme tahmini sergilediniz!
            </p>

            {/* Score Breakdown */}
            <div className="w-full flex items-center justify-center gap-3 mb-5">
              <div className="flex-1 p-2.5 rounded-2xl bg-orange-950/40 border border-orange-400 flex flex-col items-center">
                <span className="text-xs font-bold text-orange-300">
                  {assignedStudentP1 ? assignedStudentP1.name : 'Turuncu'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                  {starsP1} ⭐
                </span>
              </div>

              {playerMode === 2 && (
                <div className="flex-1 p-2.5 rounded-2xl bg-purple-950/40 border border-purple-400 flex flex-col items-center">
                  <span className="text-xs font-bold text-purple-300">
                    {assignedStudentP2 ? assignedStudentP2.name : 'Mor'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                    {starsP2} ⭐
                  </span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="w-full flex items-center gap-2">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition transform hover:scale-102 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>Tekrar Oyna</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
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
