import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, AlertCircle, ShieldCheck
} from 'lucide-react';
import { YazimDedektifiQuestion, getRandomYazimQuestions } from '../data/yazimDedektifiData';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

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
  onQuestionAnswered?: (isCorrect: boolean) => void;
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
  onQuestionAnswered
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

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setQuestions(getRandomYazimQuestions(10));
    setGameOver(false);
    setRoundWinner(null);
  }, [playerMode, createInitialPlayers]);

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
      onQuestionAnswered?.(true);

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
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          const nextQ = p.questionIndex + 1;
          if (nextQ >= 10) {
            setGameOver(true);
          }
          return {
            ...p,
            questionIndex: nextQ,
            step: 'find_wrong',
            clickedWordIndex: null,
            wrongClickedWordIndex: null,
            chosenOption: null,
            isCorrectOption: null
          };
        }));
        setRoundWinner(null);
      }, 1600);
    } else {
      triggerSound('/buzzer.mp3');
      onQuestionAnswered?.(false);
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        return {
          ...p,
          chosenOption: optionWord,
          isCorrectOption: false
        };
      }));
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
      {/* 1. TOP HEADER */}
      <header className="relative z-30 shrink-0 w-full bg-gradient-to-b from-[#0a1020] via-[#090e1c] to-[#060a14] border-b border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left Side */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
        </div>

        {/* Center: Mode Selector */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-amber-500/40 shadow-inner">
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
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {mode} Kişi
            </button>
          ))}
        </div>

        {/* Right Side */}
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
                ? 'bg-slate-800/90 text-amber-300 border-amber-500/40'
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

      {/* 2. MAIN BATTLE ARENA */}
      <main className="relative z-10 flex-1 flex flex-row items-center justify-center gap-2 max-w-[1850px] mx-auto w-full min-h-0 overflow-hidden px-1 sm:px-3 py-1 sm:py-2">
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
                  className={`flex-1 flex flex-col relative bg-gradient-to-b ${theme.bgGrad} min-h-0 ${
                    playerMode === 3 ? 'px-1 sm:px-2 py-1.5' : 'px-2 sm:px-4 py-2 sm:py-3'
                  } transition-all`}
                >
                  {/* Top Bar for Player */}
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
                          Soru {player.questionIndex + 1} / 10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-inner">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="font-black text-xs sm:text-sm text-amber-300">
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mt-2 px-1">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-[10px] sm:text-xs font-bold text-amber-300">
                      🔍 {currentQ.category}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
                      {player.step === 'find_wrong' 
                        ? '1. Adım: Yanlış yazılan kelimeye tıkla!' 
                        : player.step === 'choose_correct' 
                        ? '2. Adım: Kelimenin doğrusunu seç!' 
                        : 'Harika Dedektif! İpucu Çözüldü! 🎉'}
                    </span>
                  </div>

                  {/* Detective Workspace */}
                  <div className="flex-1 flex flex-col items-center justify-center my-2 min-h-0">
                    {/* Sentence Board */}
                    <div className={`w-full max-w-2xl p-4 sm:p-6 rounded-3xl border-2 shadow-2xl ${theme.boardBg} flex flex-col items-center gap-4`}>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {currentQ.words.map((word, wIdx) => {
                          const isWrongTarget = wIdx === currentQ.wrongWordIndex;
                          const isFound = player.step !== 'find_wrong' && isWrongTarget;
                          const isShaking = player.wrongClickedWordIndex === wIdx;

                          return (
                            <button
                              key={wIdx}
                              onClick={() => handleWordClick(pIdx, wIdx)}
                              disabled={player.step !== 'find_wrong'}
                              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-black text-base sm:text-xl md:text-2xl transition-all cursor-pointer border-2 ${
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
                        <div className="w-full mt-2 pt-3 border-t border-white/20 flex flex-col items-center animate-in zoom-in duration-300">
                          <span className="text-xs sm:text-sm font-bold text-amber-200 mb-2">
                            "{currentQ.wrongWord}" sözcüğünün doğru yazılışı hangisidir?
                          </span>
                          <div className="flex items-center gap-3 w-full justify-center">
                            {options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleChooseOption(pIdx, opt)}
                                className={`flex-1 max-w-[200px] py-3 px-4 rounded-2xl bg-slate-950 border-2 font-black text-sm sm:text-lg transition-all cursor-pointer shadow-lg active:scale-95 ${
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
                        <div className="w-full mt-2 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 flex items-center gap-3 animate-in zoom-in duration-200">
                          <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
                          <div className="text-left">
                            <span className="font-black text-xs sm:text-sm text-emerald-300 block">
                              Doğrusu: "{currentQ.correctWord}" (+10 Puan)
                            </span>
                            <span className="text-[11px] sm:text-xs text-slate-200">
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
      </main>

      {/* 3. STUDENT AVATAR DOCK */}
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
