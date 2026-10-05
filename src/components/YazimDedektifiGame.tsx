import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, XCircle, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, AlertCircle, ShieldCheck
} from 'lucide-react';
import { YazimDedektifiQuestion, getRandomYazimQuestions } from '../data/yazimDedektifiData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { TurkishActivityBackground } from './TurkishActivityBackground';
import { AutoFitOptionContent } from './AutoFitOptionContent';

// Helper function for automatic max font size matching single player standard design
const getWordOptionFontSize = (options: string[], mode: 1 | 2 | 3 = 1) => {
  const maxOptLen = Math.max(...options.map(o => String(o || '').trim().length), 0);
  if (mode === 3) {
    if (maxOptLen <= 4) return 'text-xs xs:text-sm sm:text-base font-black';
    if (maxOptLen <= 7) return 'text-[11px] xs:text-xs sm:text-sm font-black';
    if (maxOptLen <= 11) return 'text-[10px] xs:text-[11px] sm:text-xs font-bold';
    return 'text-[9px] xs:text-[10px] sm:text-[11px] font-bold';
  }
  if (mode === 2) {
    if (maxOptLen <= 4) return 'text-sm xs:text-base sm:text-lg md:text-xl font-black';
    if (maxOptLen <= 7) return 'text-xs xs:text-sm sm:text-base md:text-lg font-black';
    if (maxOptLen <= 11) return 'text-[11px] xs:text-xs sm:text-sm md:text-base font-bold';
    if (maxOptLen <= 15) return 'text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold';
    return 'text-[9px] xs:text-[10px] sm:text-[11px] font-bold';
  }
  // 1-Player Quiz
  if (maxOptLen <= 4) return 'text-base xs:text-lg sm:text-xl md:text-2xl font-black';
  if (maxOptLen <= 7) return 'text-sm xs:text-base sm:text-lg md:text-xl font-black';
  if (maxOptLen <= 11) return 'text-xs xs:text-sm sm:text-base md:text-lg font-bold';
  if (maxOptLen <= 15) return 'text-[11px] xs:text-xs sm:text-sm md:text-base font-bold';
  return 'text-[10px] xs:text-[11px] sm:text-xs font-bold';
};

interface YazimDedektifiGameProps {
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
  colorName: 'blue' | 'rose' | 'emerald';
  score: number;
  questionIndex: number;
  step: 'find_wrong' | 'choose_correct' | 'solved';
  clickedWordIndex: number | null;
  wrongClickedWordIndex: number | null;
  chosenOption: string | null;
  isCorrectOption: boolean | null;
}

export const YazimDedektifiGame: React.FC<YazimDedektifiGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  playerCountMode = 2,
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
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // 10 questions per match
  const [questions, setQuestions] = useState<YazimDedektifiQuestion[]>(() => getRandomYazimQuestions(10));

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
    const colors: ('blue' | 'rose' | 'emerald')[] = ['blue', 'rose', 'emerald'];
    const names = ['1. Dedektif', '2. Dedektif', '3. Dedektif'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Dedektif' : names[i],
        colorName: colors[i],
        score: 0,
        questionIndex: 0,
        step: 'find_wrong',
        clickedWordIndex: null,
        wrongClickedWordIndex: null,
        chosenOption: null,
        isCorrectOption: null
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));
  const [singleTimeLeft, setSingleTimeLeft] = useState<number>(100);

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setQuestions(getRandomYazimQuestions(10));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
  }, [playerMode, createInitialPlayers]);

  // 100-Saniye Tek Kişilik Geri Sayım Sayacı
  useEffect(() => {
    if (playerMode !== 1 || gameOver) return;
    const p = players[0];
    if (!p || p.step === 'solved') return;

    if (singleTimeLeft <= 0) {
      triggerSound('/buzzer.mp3');
      setGameOver(true);
      setRoundWinner(0);
      triggerSound('/para.mp3');
      return;
    }

    if (singleTimeLeft <= 3 && singleTimeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setSingleTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [playerMode, gameOver, players, singleTimeLeft, playMp3, triggerSound]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Step 1: Click a word in the sentence
  const handleWordClick = (playerIdx: number, wordIdx: number) => {
    const player = players[playerIdx];
    if (!player || player.step !== 'find_wrong' || gameOver) return;

    const currentQ = questions[player.questionIndex % questions.length];
    if (!currentQ) return;

    if (wordIdx === currentQ.wrongWordIndex) {
      // Correct! Identified the misspelled word
      triggerSound('/op.mp3');
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          step: 'choose_correct',
          clickedWordIndex: wordIdx,
          wrongClickedWordIndex: null
        };
      }));
    } else {
      // Wrong word clicked
      triggerSound('/buzzer.mp3');
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          wrongClickedWordIndex: wordIdx
        };
      }));

      setTimeout(() => {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          return {
            ...p,
            wrongClickedWordIndex: null
          };
        }));
      }, 700);
    }
  };

  // Step 2: Choose the correct spelling
  const handleChooseOption = (playerIdx: number, optionWord: string) => {
    const player = players[playerIdx];
    if (!player || player.step !== 'choose_correct' || gameOver) return;

    const currentQ = questions[player.questionIndex % questions.length];
    if (!currentQ) return;

    const isCorrect = optionWord === currentQ.correctWord;

    if (isCorrect) {
      triggerSound('/ding.mp3');
      onQuestionAnswered?.(true, playerIdx);

      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          step: 'solved',
          chosenOption: optionWord,
          isCorrectOption: true,
          score: p.score + 10
        };
      }));

      if (playerMode > 1) {
        setRoundWinner(playerIdx);
      }

      // Advance after delay
      setTimeout(() => {
        setPlayers(prev => {
          const nextPlayers = prev.map((p, idx) => {
            if (idx !== playerIdx) return p;
            const nextQ = p.questionIndex + 1;
            if (nextQ >= 10) {
              setGameOver(true);
            }
            return {
              ...p,
              questionIndex: nextQ,
              step: 'find_wrong' as const,
              clickedWordIndex: null,
              wrongClickedWordIndex: null,
              chosenOption: null,
              isCorrectOption: null
            };
          });

          const isEnd = nextPlayers.some(p => p.questionIndex >= 10);
          if (isEnd) {
            const bestP = [...nextPlayers].sort((a, b) => b.score - a.score)[0];
            const bestIdx = bestP ? (bestP.id - 1) : null;
            onGameCompleted?.(bestIdx, playerMode);
          }

          return nextPlayers;
        });
        setRoundWinner(null);
      }, 1600);
    } else {
      triggerSound('/buzzer.mp3');
      onQuestionAnswered?.(false, playerIdx);
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          chosenOption: optionWord,
          isCorrectOption: false
        };
      }));

      setTimeout(() => {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          if (p.step === 'choose_correct' && p.isCorrectOption === false) {
            return {
              ...p,
              chosenOption: null,
              isCorrectOption: null
            };
          }
          return p;
        }));
      }, 800);
    }
  };

  const handleSkipQuestion = (playerIdx: number) => {
    triggerSound('/op.mp3');
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== playerIdx) return p;
      return {
        ...p,
        questionIndex: p.questionIndex + 1,
        step: 'find_wrong',
        clickedWordIndex: null,
        wrongClickedWordIndex: null,
        chosenOption: null,
        isCorrectOption: null
      };
    }));
  };

  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setQuestions(getRandomYazimQuestions(10));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
  };

  const getPlayerTheme = (color: 'blue' | 'rose' | 'emerald') => {
    switch (color) {
      case 'rose':
        return {
          badgeBg: 'bg-rose-500',
          textColor: 'text-rose-400',
          border: 'border-rose-500/80',
          bgGrad: 'from-[#2b0d19] via-[#1a080f] to-[#0c0407]',
          boardBg: 'bg-gradient-to-b from-[#3a1222] to-[#1e0a12] border-rose-500/40',
          optionHover: 'hover:bg-rose-500/30 hover:border-rose-400'
        };
      case 'emerald':
        return {
          badgeBg: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          border: 'border-emerald-500/80',
          bgGrad: 'from-[#0b281f] via-[#071913] to-[#030d0a]',
          boardBg: 'bg-gradient-to-b from-[#0e3b2e] to-[#071d17] border-emerald-500/40',
          optionHover: 'hover:bg-emerald-500/30 hover:border-emerald-400'
        };
      case 'blue':
      default:
        return {
          badgeBg: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          border: 'border-cyan-500/80',
          bgGrad: 'from-[#0d2238] via-[#071524] to-[#040a12]',
          boardBg: 'bg-gradient-to-b from-[#103152] to-[#081a2e] border-cyan-500/40',
          optionHover: 'hover:bg-cyan-500/30 hover:border-cyan-400'
        };
    }
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col bg-[#050811] text-white select-none overflow-hidden font-sans"
    >
      {/* 1. TÜRKÇE TEMALI ÖZEL GÖRSEL ARKA PLAN */}
      <TurkishActivityBackground darkness="normal" />

      {/* 2. MAIN BATTLE ARENA */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = questions[sPlayer.questionIndex % questions.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;
          const options = [currentQ.correctWord, currentQ.distractorWord].sort();

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              {/* MERKEZ: SORU ÇERÇEVESİ (ŞIKLARIN GENİŞLİĞİ KADAR, ŞIKLAR ÇERÇEVENİN İÇİNDE) */}
              <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    {/* LEFT: GROUP BADGE & TOPIC */}
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
                            • Yazım Dedektifi
                          </span>
                        </div>
                        <img
                          src="/MENUIKON/grid_icon_21.webp"
                          alt="Oyun İkonu"
                          className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1"
                        />
                      </div>
                    </div>

                    {/* RIGHT: SCORE & LIVES / QUESTION PROGRESS & SKIP */}
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      {/* 100-Second Countdown Timer Capsule */}
                      <div className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                        singleTimeLeft <= 3 
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                          : 'bg-[#080e1d] border-slate-700 text-slate-200'
                      }`}>
                        <span className="text-xs">⏱️</span>
                        <span>{singleTimeLeft}s</span>
                      </div>

                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.questionIndex + 1} / 10
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                      <button
                        onClick={() => handleSkipQuestion(0)}
                        className="h-full px-2 sm:px-2.5 rounded-xl bg-[#0e172a] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                        title="Soruyu Geç"
                      >
                        <span className="hidden sm:inline">Geç</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2 sm:p-3 flex flex-col items-center justify-center text-center overflow-hidden min-h-0 w-full">
                      {/* Subtle top inner gradient */}
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full min-h-0 max-h-full overflow-hidden px-2">
                        <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-widest mb-1.5 [text-shadow:_0_2px_4px_#000]">
                          {sPlayer.step === 'find_wrong'
                            ? `🔍 ${currentQ.category} • YANLIŞ YAZILAN KELİMEYE TIKLA:`
                            : sPlayer.step === 'choose_correct'
                            ? `🔍 ${currentQ.category} • DOĞRU YAZILIŞI HANGİSİDİR?`
                            : '🎉 TEBRİKLER! İPUCU ÇÖZÜLDÜ!'}
                        </span>

                        {/* SENTENCE BOARD - WORD BUTTONS */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center my-1 sm:my-2 max-w-full z-10">
                          {currentQ.words.map((word, wIdx) => {
                            const isWrongTarget = wIdx === currentQ.wrongWordIndex;
                            const isFound = sPlayer.step !== 'find_wrong' && isWrongTarget;
                            const isShaking = sPlayer.wrongClickedWordIndex === wIdx;

                            return (
                              <button
                                key={wIdx}
                                onClick={() => handleWordClick(0, wIdx)}
                                disabled={sPlayer.step !== 'find_wrong'}
                                className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all cursor-pointer border-2 shadow-md ${
                                  isShaking
                                    ? 'bg-rose-600 border-white text-white animate-shake'
                                    : isFound
                                    ? sPlayer.step === 'solved'
                                      ? 'bg-emerald-500 border-white text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-105'
                                      : 'bg-amber-400 border-white text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse scale-105'
                                    : sPlayer.step === 'find_wrong'
                                    ? 'bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:to-[#101c2f] border-blue-400/60 hover:border-blue-300 text-blue-50 hover:scale-105 active:scale-95'
                                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
                                }`}
                              >
                                {sPlayer.step === 'solved' && isWrongTarget ? currentQ.correctWord : word}
                              </button>
                            );
                          })}
                        </div>

                        {/* Step 2 indicator: Identified misspelled word in amber card */}
                        {sPlayer.step === 'choose_correct' && (
                          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-[0_6px_20px_rgba(245,158,11,0.5)] border-2 border-white flex items-center justify-center gap-2 my-1 max-w-full animate-fadeIn">
                            <span className="text-xs sm:text-sm">Hatalı Yazım:</span>
                            <span className="line-through decoration-red-600 decoration-2 text-red-950 text-sm sm:text-base md:text-lg font-black uppercase">
                              "{currentQ.wrongWord}"
                            </span>
                          </div>
                        )}

                        {/* Step 3: Solved banner with rule explanation */}
                        {sPlayer.step === 'solved' && (
                          <div className="mt-1 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 flex items-center justify-center gap-2 max-w-full text-center animate-in zoom-in duration-200">
                            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                            <div className="text-left">
                              <span className="font-black text-xs sm:text-sm text-emerald-300 block">
                                Doğrusu: "{currentQ.correctWord}" (+10 Puan)
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-200">
                                💡 Kural: {currentQ.explanation}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: ŞIKLAR (ÇERÇEVENİN İÇİNDE, 2x2 GRID / ZIT ANLAM ŞIKLARIYLA TAM AYNI) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full shrink-0 mt-1">
                    {sPlayer.step === 'find_wrong' ? (
                      <div className="col-span-2 py-2 px-3 rounded-2xl bg-[#0e172a] border border-slate-700/80 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-bold text-amber-300 shadow-sm">
                        <span>🔍</span>
                        <span>1. Adım: Cümlede hatalı yazılmış kelimeye dokunun!</span>
                      </div>
                    ) : (
                      options.map((opt, oIdx) => {
                        const isSelected = sPlayer.chosenOption === opt;
                        const isCorrect = opt === currentQ.correctWord;
                        const optFontClass = getWordOptionFontSize(options, 1);

                        let btnClass = "border-2 border-blue-500/35 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/70 active:from-[#0e1726] active:to-[#090f1a] text-blue-50 shadow-md active:shadow-xs";
                        if (sPlayer.chosenOption) {
                          if (isCorrect) {
                            btnClass = "ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 shadow-md text-white";
                          } else if (isSelected) {
                            btnClass = "ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 shadow-md text-white";
                          } else {
                            btnClass = "opacity-35 border-slate-700/60 bg-slate-900/60 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={sPlayer.step === 'solved'}
                            onClick={() => handleChooseOption(0, opt)}
                            className={`fast-quiz-btn relative w-full py-1.5 sm:py-2 px-3 min-h-[38px] sm:min-h-[44px] md:min-h-[50px] max-h-[58px] rounded-2xl border-2 transition-colors duration-75 flex items-center justify-center text-center cursor-pointer uppercase tracking-wider overflow-hidden active:scale-98 ${btnClass}`}
                          >
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                            <AutoFitOptionContent
                              opt={opt}
                              displayOpt={opt}
                              mode={1}
                              fallbackFontClass={optFontClass}
                            />
                            {sPlayer.chosenOption && isCorrect && (
                              <CheckCircle2 size={18} className="absolute right-2.5 text-emerald-300 shrink-0 filter drop-shadow-md z-20" />
                            )}
                            {sPlayer.chosenOption && isSelected && !isCorrect && (
                              <XCircle size={18} className="absolute right-2.5 text-rose-300 shrink-0 filter drop-shadow-md z-20" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="flex-1 flex flex-row relative min-h-0 h-full w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-[#080d1a]">
            {players.map((player, pIdx) => {
              const theme = getPlayerTheme(player.colorName);
              const currentQ = questions[player.questionIndex % questions.length];
              const assignedStudent = effectiveSelectedStudentIds[pIdx]
                ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
                : null;

              if (!currentQ) return null;

              // Options for Step 2
              const options = [currentQ.correctWord, currentQ.distractorWord].sort();

              return (
                <React.Fragment key={player.id}>
                  <div
                    className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 overflow-y-auto no-scrollbar ${
                      playerMode === 3 ? 'px-1 sm:px-2 py-1' : 'px-2 sm:px-3 py-1.5 sm:py-2'
                    } transition-all`}
                  >
                    {/* Top Bar for Player */}
                    <div className="relative z-10 flex items-center justify-between gap-1 pb-1 border-b border-white/10 shrink-0">
                      <div className="flex items-center gap-2">
                        {assignedStudent && (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-white/40 flex items-center justify-center text-xs sm:text-base shadow">
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
                            Soru {player.questionIndex + 1} / 10
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-inner">
                        <Trophy size={14} className="text-amber-400" />
                        <span className="font-black text-xs sm:text-sm text-amber-300">
                          {player.score} Puan
                        </span>
                      </div>
                    </div>

                    {/* Category Pill */}
                    <div className="flex items-center justify-between gap-2 mt-1 sm:mt-1.5 px-1 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-[10px] sm:text-xs font-bold text-amber-300">
                        🔍 {currentQ.category}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-300">
                        {player.step === 'find_wrong' 
                          ? '1. Adım: Yanlış yazılan kelimeye tıkla!' 
                          : player.step === 'choose_correct' 
                          ? '2. Adım: Kelimenin doğrusunu seç!' 
                          : 'Harika Dedektif! İpucu Çözüldü! 🎉'}
                      </span>
                    </div>

                    {/* Detective Workspace */}
                    <div className="flex-1 flex flex-col items-center justify-center my-1 sm:my-2 min-h-0">
                      {/* Sentence Board */}
                      <div className={`w-full max-w-2xl p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 shadow-2xl ${theme.boardBg} flex flex-col items-center gap-2 sm:gap-3`}>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                          {currentQ.words.map((word, wIdx) => {
                            const isWrongTarget = wIdx === currentQ.wrongWordIndex;
                            const isFound = player.step !== 'find_wrong' && isWrongTarget;
                            const isShaking = player.wrongClickedWordIndex === wIdx;

                            return (
                              <button
                                key={wIdx}
                                onClick={() => handleWordClick(pIdx, wIdx)}
                                disabled={player.step !== 'find_wrong'}
                                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg md:text-xl transition-all cursor-pointer border-2 ${
                                  isShaking
                                    ? 'bg-rose-600 border-white text-white animate-shake'
                                    : isFound
                                    ? player.step === 'solved'
                                      ? 'bg-emerald-500 border-white text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-110'
                                      : 'bg-amber-400 border-white text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse scale-105'
                                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-amber-400 text-white hover:scale-105'
                                }`}
                              >
                                {player.step === 'solved' && isWrongTarget ? currentQ.correctWord : word}
                              </button>
                            );
                          })}
                        </div>

                        {/* Step 2: Options Selection Area */}
                        {player.step === 'choose_correct' && (
                          <div className="w-full mt-1 pt-2 sm:pt-2.5 border-t border-white/20 flex flex-col items-center animate-in zoom-in duration-300">
                            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-200 mb-1.5 text-center">
                              "{currentQ.wrongWord}" sözcüğünün doğru yazılışı hangisidir?
                            </span>
                            <div className="flex items-center gap-2 sm:gap-3 w-full justify-center">
                              {options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => handleChooseOption(pIdx, opt)}
                                  className={`flex-1 max-w-[190px] py-1.5 sm:py-2 px-3 rounded-xl sm:rounded-2xl bg-slate-950 border-2 font-black text-xs sm:text-base transition-all cursor-pointer shadow-lg active:scale-95 ${
                                    player.chosenOption === opt
                                      ? player.isCorrectOption
                                      ? 'bg-emerald-600 border-white text-white'
                                      : 'bg-rose-600 border-white text-white animate-shake'
                                    : 'border-amber-400/60 hover:border-amber-300 hover:bg-amber-400/20 text-white hover:scale-105'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 3: Solved banner with rule explanation */}
                        {player.step === 'solved' && (
                          <div className="w-full mt-1 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 flex items-center gap-2 sm:gap-3 animate-in zoom-in duration-200">
                            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                            <div className="text-left">
                              <span className="font-black text-[11px] sm:text-xs md:text-sm text-emerald-300 block">
                                Doğrusu: "{currentQ.correctWord}" (+10 Puan)
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-slate-200">
                                💡 Kural: {currentQ.explanation}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Player Footer */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                      <button
                        onClick={() => handleSkipQuestion(pIdx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Soruyu Geç</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* VS Divider */}
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

      {/* 3. STUDENT AVATAR DOCK */}
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

      {/* 4. GAME OVER MODAL */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <Trophy size={36} className="text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              DEDEKTİF SINAVI BİTTİ!
            </h2>

            {(() => {
              const maxScore = Math.max(...players.map(p => p.score));
              const winners = players.filter(p => p.score === maxScore);

              if (winners.length === 1) {
                return (
                  <div className="px-5 py-2.5 rounded-2xl bg-amber-400/15 border border-amber-400 text-amber-300 font-bold text-base sm:text-lg">
                    🏆 Baş Dedektif: <span className="font-black text-white">{winners[0].name}</span>
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