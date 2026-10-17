import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, ChevronRight, AlertCircle, ShieldCheck, HelpCircle, BookOpen
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { AutoFitOptionContent } from './AutoFitOptionContent';
import { ActivityQuestionFrame } from './ActivityQuestionFrame';

import { 
  Dedektif5N1KStory, 
  STORIES_5N1K, 
  getRandom5N1KQuestions,
  getMultiplayerUniqueQuestionSets,
  getFreshReplacementQuestion
} from '../data/dedektif5N1KData';

export type { Dedektif5N1KStory };
export { STORIES_5N1K, getRandom5N1KQuestions };

/** Soru kutusu içeriği: rozet + vaka başlığı + vaka metni + soru cümlesi (tüm modlarda aynı, kutuya göre ölçeklenir) */
const N1KQuestionContent: React.FC<{ q: Dedektif5N1KStory }> = ({ q }) => (
  <div className="flex flex-col items-center justify-center w-full gap-[0.12em]">
    {/* Üst etiket: tek ince satır (yer kaplamasın, metin büyüsün) */}
    <div className="flex items-center justify-center gap-[0.25em] text-[0.3em] leading-none uppercase tracking-wider">
      <span className="px-[0.6em] py-[0.15em] rounded-full bg-amber-400 text-slate-950 font-black [text-shadow:none]">
        {q.qTypeLabel} • SORU
      </span>
      <span className="text-amber-200">{q.emoji || '🔍'} VAKA: {q.title}</span>
    </div>
    {/* Vaka metni: en büyük alan */}
    <p className="w-full text-[0.54em] font-extrabold leading-[1.18] text-white px-[0.15em]">{q.story}</p>
    {/* Soru cümlesi */}
    <p className="w-full text-[0.6em] font-black leading-[1.15] text-center text-amber-200 px-[0.15em]">{q.question}</p>
  </div>
);


interface Dedektif5N1KGameProps {
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
  selectedOption: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const Dedektif5N1KGame: React.FC<Dedektif5N1KGameProps> = ({
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

  // Oturum boyunca daha önce çözülen vaka ID'lerini takip ederek tekrarsız sürekli değişim sağlar
  const usedIdsRef = React.useRef<Set<string>>(new Set());

  // Her oyuncuya özel bağımsız soru listesi (2 ve 3 kişilik modda oyuncular farklı sorular görür)
  const [playerQuestionSets, setPlayerQuestionSets] = useState<Dedektif5N1KStory[][]>(() => {
    const initialSets = getMultiplayerUniqueQuestionSets(3, 8);
    initialSets.forEach(set => set.forEach(q => usedIdsRef.current.add(q.id)));
    return initialSets;
  });

  const getPlayerCurrentQuestion = useCallback((pIdx: number, qIdx: number): Dedektif5N1KStory => {
    const pSet = playerQuestionSets[pIdx];
    if (pSet && pSet.length > 0) {
      return pSet[qIdx % pSet.length] || STORIES_5N1K[0];
    }
    return STORIES_5N1K[0];
  }, [playerQuestionSets]);

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
    const names = ['1. Dedektif', '2. Dedektif', '3. Dedektif'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? '5N 1K Dedektifi' : names[i],
        colorName: colors[i],
        score: 0,
        questionIndex: 0,
        selectedOption: null,
        isCorrect: null,
        showFeedback: false
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));
  const [singleTimeLeft, setSingleTimeLeft] = useState<number>(100);

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
  }, [playerMode, createInitialPlayers]);

  // 100-Saniye Geri Sayım Sayacı (1, 2 VE 3 KİŞİLİK TÜM MODLARDA AKTİFTİR)
  useEffect(() => {
    if (gameOver) return;

    if (singleTimeLeft <= 0) {
      triggerSound('/hata.mp3');
      setGameOver(true);
      let bestIdx = 0;
      let maxScore = -1;
      players.forEach((p, idx) => {
        if (p.score > maxScore) {
          maxScore = p.score;
          bestIdx = idx;
        }
      });
      setRoundWinner(bestIdx);
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
  }, [gameOver, players, singleTimeLeft, playMp3, triggerSound]);

  const handleSwitchMode = (mode: PlayerMode) => {
    setPlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    triggerSound('/op.mp3');
  };

  // Tekil bir oyuncunun aktif vakasını anında farklı bir 5N1K metniyle değiştirir
  const handleReplaceCurrentStory = useCallback((playerIndex: number) => {
    const activeIds = playerQuestionSets.flatMap(list => list.map(q => q.id));
    const newQuestion = getFreshReplacementQuestion([...activeIds, ...Array.from(usedIdsRef.current)]);
    usedIdsRef.current.add(newQuestion.id);

    setPlayerQuestionSets(prev => {
      const updated = prev.map((arr, pI) => {
        if (pI !== playerIndex) return arr;
        const copy = [...arr];
        const qIdx = (players[playerIndex]?.questionIndex || 0) % copy.length;
        copy[qIdx] = newQuestion;
        return copy;
      });
      return updated;
    });
    triggerSound('/op.mp3');
  }, [playerQuestionSets, players, triggerSound]);

  // Tüm oyuncuların vakalarını aynı anda taze vakalarla yeniler
  const handleReplaceAllStories = useCallback(() => {
    let excludeList = Array.from(usedIdsRef.current);
    if (excludeList.length > STORIES_5N1K.length - 24) {
      usedIdsRef.current.clear();
      excludeList = [];
    }
    const newSets = getMultiplayerUniqueQuestionSets(3, 8, excludeList);
    newSets.forEach(set => set.forEach(q => usedIdsRef.current.add(q.id)));
    setPlayerQuestionSets(newSets);
    triggerSound('/op.mp3');
  }, [triggerSound]);

  const handleOptionClick = (playerIndex: number, option: string) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentQ = getPlayerCurrentQuestion(playerIndex, p.questionIndex);
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);
    }

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.selectedOption = option;
      target.isCorrect = isCorrect;
      target.showFeedback = true;
      if (isCorrect) {
        target.score += 10;
      }
      next[playerIndex] = target;
      return next;
    });

    // Auto advance after 1.2 seconds
    setTimeout(() => {
      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        const nextIdx = target.questionIndex + 1;

        if (nextIdx >= 5) {
          // Player completed match
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
          target.questionIndex = nextIdx;
          target.selectedOption = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1200);
  };

  const handleResetGame = () => {
    let excludeList = Array.from(usedIdsRef.current);
    if (excludeList.length > STORIES_5N1K.length - 24) {
      usedIdsRef.current.clear();
      excludeList = [];
    }
    const newSets = getMultiplayerUniqueQuestionSets(3, 8, excludeList);
    newSets.forEach(set => set.forEach(q => usedIdsRef.current.add(q.id)));

    setPlayerQuestionSets(newSets);
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
    triggerSound('/op.mp3');
  };

  const currentLeaderIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < players.length; i++) {
      if (players[i].score > players[best].score) best = i;
    }
    return best;
  }, [players]);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
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

      {/* Main Game Arena */}
      <main className={`relative z-10 flex-1 w-full ${
        playerMode === 3 
          ? 'max-w-none px-2 sm:px-3' 
          : playerMode === 2 
          ? 'max-w-[1700px] px-2.5 sm:px-4' 
          : 'max-w-6xl px-2 sm:px-4'
      } mx-auto p-1 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0`}>
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = getPlayerCurrentQuestion(0, sPlayer.questionIndex);
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              <div className="flex-1 w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col justify-center min-h-0 z-10 shrink">
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
                            • 5N1K Dedektifi
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_31.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
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
                          {sPlayer.questionIndex + 1}/5
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ÜST ŞERİT: başlık + vaka değiştir + vaka no */}
                  <div className="flex items-center justify-between gap-2 shrink-0 mt-1 px-1">
                    <span className="text-xs sm:text-sm font-black text-teal-300 uppercase tracking-wider truncate">
                      🔍 5N1K Dedektifi
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReplaceCurrentStory(0)}
                        title="Farklı bir 5N1K metnine geç"
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        <RotateCcw size={13} />
                        <span>Vakayı Değiştir</span>
                      </button>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono">#{sPlayer.questionIndex + 1}</span>
                    </div>
                  </div>

                  {/* CENTER: SORU ÇERÇEVESİ (İleri Üçer Sayma ile aynı tasarım) */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <ActivityQuestionFrame fillWide mode={1} contentKey={sPlayer.questionIndex}>
                      <N1KQuestionContent q={currentQ} />
                    </ActivityQuestionFrame>
                  </div>

                  {/* BOTTOM: ŞIKLAR (2x2 GRID) - BÜYÜTÜLMÜŞ */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-3.5 w-full shrink-0 mt-1.5 sm:mt-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = sPlayer.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = "border-2 sm:border-3 border-blue-500/40 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/80 text-blue-50 shadow-md";

                      if (sPlayer.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400 bg-emerald-700 text-white shadow-xl scale-[1.01]';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400 bg-rose-800 text-white shadow-xl';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={sPlayer.showFeedback}
                          onClick={() => handleOptionClick(0, opt)}
                          className={`fast-quiz-btn relative flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 min-h-[58px] sm:min-h-[68px] md:min-h-[78px] lg:min-h-[86px] rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-98 shadow-md ${btnStyle}`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 h-full">
                            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/50 flex items-center justify-center font-black text-sm sm:text-base md:text-lg shrink-0 border-2 border-white/20 text-amber-300 shadow-inner">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <div className="flex-1 min-w-0 h-full">
                              <AutoFitOptionContent opt={opt} displayOpt={opt} mode={1} isLarge={true} />
                            </div>
                          </div>
                          {sPlayer.showFeedback && isRight && (
                            <CheckCircle2 size={24} className="text-emerald-300 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })() : playerMode === 2 ? (() => {
          return (
            <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
              {/* ÜST ORTAK GERİ SAYIM SAYACI (2 KİŞİLİKTE ÇOK BELİRGİN SÜRE) */}
              <div className="w-full flex items-center justify-between bg-black/60 border border-teal-500/40 rounded-xl px-3 py-1.5 mb-2 shrink-0">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-teal-300 uppercase tracking-wider">
                  <span>🔍 2 KİŞİLİK 5N 1K DEDEKTİF KAPIŞMASI</span>
                  <button
                    type="button"
                    onClick={handleReplaceAllStories}
                    title="Her iki oyuncu için yeni vakalar getir"
                    className="ml-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition shadow-xs"
                  >
                    <RotateCcw size={12} />
                    <span>Tüm Vakaları Değiştir</span>
                  </button>
                </div>
                <div className={`border rounded-xl px-3.5 py-1 flex items-center gap-2 font-mono font-black text-xs sm:text-sm shrink-0 transition-all ${
                  singleTimeLeft <= 5 
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                    : 'bg-[#080e1d] border-teal-500/60 text-teal-200'
                }`}>
                  <span>⏱️ KALAN SÜRE:</span>
                  <span className="text-amber-300 text-sm sm:text-base">{singleTimeLeft}s</span>
                </div>
              </div>

              {/* 2 OYUNCU YAN YANA (GENİŞ VE FERAH SÜTUNLAR) */}
              <div className="w-full flex-1 grid grid-cols-2 gap-3 min-h-0 items-stretch">
                {players.map((player, pIdx) => {
                  const currentQ = getPlayerCurrentQuestion(pIdx, player.questionIndex);
                  const pStudent = effectiveSelectedStudentIds[pIdx]
                    ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
                    : null;
                  const displayName = pStudent ? pStudent.name : player.name;

                  const cardBorder = player.colorName === 'rose'
                    ? 'border-rose-500/80 bg-[#250d18]/90'
                    : 'border-sky-500/80 bg-[#0d1c31]/90';

                  return (
                    <div
                      key={player.id}
                      className={`rounded-2xl border-2 ${cardBorder} p-2.5 sm:p-3 flex flex-col justify-between shadow-xl min-h-0 overflow-hidden`}
                    >
                      {/* 1. BÖLÜM: Header */}
                      <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1.5 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base sm:text-lg shrink-0">
                            {player.colorName === 'rose' ? '🔴' : '🔵'}
                          </span>
                          <span className="font-black text-sm sm:text-base text-slate-100 truncate">
                            {displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-300">
                            Soru: {player.questionIndex + 1}/5
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs sm:text-sm">
                            {player.score} P
                          </span>
                        </div>
                      </div>

                      {/* Soru Alanı: İleri Üçer Sayma ile aynı tasarım, kutuyu doldurur */}
                      <div className="flex-1 min-h-0 flex flex-col gap-1 my-1 overflow-hidden">
                        <div className="flex justify-end shrink-0">
                          <button
                            type="button"
                            disabled={player.showFeedback}
                            onClick={() => handleReplaceCurrentStory(pIdx)}
                            title="Bu oyuncu için farklı vaka getir"
                            className="px-2 py-0.5 rounded-md bg-amber-300 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs disabled:opacity-40"
                          >
                            <RotateCcw size={11} />
                            <span>Değiştir</span>
                          </button>
                        </div>
                        <div className="flex-1 min-h-0 flex overflow-hidden">
                          <ActivityQuestionFrame fillWide mode={2} contentKey={player.questionIndex}>
                            <N1KQuestionContent q={currentQ} />
                          </ActivityQuestionFrame>
                        </div>
                      </div>

                      {/* 3. BÖLÜM: Şıklar (2x2 GRID - BÜYÜTÜLMÜŞ, GENİŞ, RAHAT OKUNUR) */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-1.5 w-full shrink-0">
                        {currentQ.options.map((opt, oIdx) => {
                          const isChosen = player.selectedOption === opt;
                          const isRight = opt === currentQ.correctAnswer;
                          let btnStyle = 'border-2 border-blue-500/40 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/80 text-blue-50 shadow-md';

                          if (player.showFeedback) {
                            if (isRight) {
                              btnStyle = 'ring-3 ring-inset ring-emerald-500/80 border-emerald-400 bg-emerald-700 text-white shadow-xl scale-[1.01]';
                            } else if (isChosen && !isRight) {
                              btnStyle = 'ring-3 ring-inset ring-rose-600/80 border-rose-400 bg-rose-800 text-white shadow-xl';
                            } else {
                              btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={player.showFeedback}
                              onClick={() => handleOptionClick(pIdx, opt)}
                              className={`fast-quiz-btn relative flex items-center justify-between px-3 py-2 min-h-[64px] sm:min-h-[74px] md:min-h-[82px] lg:min-h-[90px] rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-98 shadow-md ${btnStyle}`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 h-full">
                                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/50 flex items-center justify-center font-black text-sm sm:text-base shrink-0 border border-white/20 text-amber-300 shadow-inner">
                                  {['A', 'B', 'C', 'D'][oIdx]}
                                </span>
                                <div className="flex-1 min-w-0 h-full">
                                  <AutoFitOptionContent opt={opt} displayOpt={opt} mode={2} isLarge={true} />
                                </div>
                              </div>
                              {player.showFeedback && isRight && <CheckCircle2 size={22} className="text-emerald-300 shrink-0 ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Didaktik Açıklama */}
                      {player.showFeedback && (
                        <div className="mt-1 p-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-amber-200 text-center animate-fade-in shrink-0">
                          <span className="line-clamp-2">{currentQ.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })() : (() => {
          return (
            <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
              {/* ÜST ORTAK GERİ SAYIM SAYACI (3 KİŞİLİKTE ÇOK BELİRGİN SÜRE) */}
              <div className="w-full flex items-center justify-between bg-black/60 border border-teal-500/40 rounded-xl px-2.5 py-1 mb-1.5 shrink-0">
                <div className="flex items-center gap-1.5 font-black text-xs text-teal-300 uppercase tracking-wider">
                  <span>🔍 3 KİŞİLİK 5N 1K DEDEKTİF KAPIŞMASI</span>
                  <button
                    type="button"
                    onClick={handleReplaceAllStories}
                    title="Tüm oyuncular için yeni vakalar getir"
                    className="ml-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer active:scale-95 transition shadow-xs"
                  >
                    <RotateCcw size={10} />
                    <span>Tümünü Değiştir</span>
                  </button>
                </div>
                <div className={`border rounded-xl px-2.5 py-0.5 flex items-center gap-1.5 font-mono font-black text-xs shrink-0 transition-all ${
                  singleTimeLeft <= 5 
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                    : 'bg-[#080e1d] border-teal-500/60 text-teal-200'
                }`}>
                  <span>⏱️ SÜRE:</span>
                  <span className="text-amber-300 text-xs sm:text-sm">{singleTimeLeft}s</span>
                </div>
              </div>

              {/* 3 OYUNCU YAN YANA (3 SÜTUN) */}
              <div className="w-full flex-1 grid grid-cols-3 gap-1.5 sm:gap-2.5 min-h-0 items-stretch">
                {players.map((player, pIdx) => {
                  const currentQ = getPlayerCurrentQuestion(pIdx, player.questionIndex);
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
                      className={`rounded-2xl border-2 ${cardBorder} p-1.5 sm:p-2 flex flex-col justify-between shadow-xl min-h-0 overflow-hidden`}
                    >
                      {/* 1. BÖLÜM: Header */}
                      <div className="flex items-center justify-between border-b border-white/15 pb-0.5 mb-1 shrink-0 h-7">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">
                            {player.colorName === 'rose' ? '🔴' : player.colorName === 'blue' ? '🔵' : '🟢'}
                          </span>
                          <span className="font-black text-xs sm:text-sm text-slate-100 truncate">
                            {displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-slate-300">
                            Soru: {player.questionIndex + 1}/5
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-xs">
                            {player.score} P
                          </span>
                        </div>
                      </div>

                      {/* Soru Alanı: İleri Üçer Sayma ile aynı tasarım, kutuyu doldurur */}
                      <div className="flex-1 min-h-0 flex flex-col gap-1 my-1 overflow-hidden">
                        <div className="flex justify-end shrink-0">
                          <button
                            type="button"
                            disabled={player.showFeedback}
                            onClick={() => handleReplaceCurrentStory(pIdx)}
                            title="Bu oyuncu için farklı vaka getir"
                            className="px-2 py-0.5 rounded-md bg-amber-300 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs disabled:opacity-40"
                          >
                            <RotateCcw size={11} />
                            <span>Değiştir</span>
                          </button>
                        </div>
                        <div className="flex-1 min-h-0 flex overflow-hidden">
                          <ActivityQuestionFrame fillWide mode={3} contentKey={player.questionIndex}>
                            <N1KQuestionContent q={currentQ} />
                          </ActivityQuestionFrame>
                        </div>
                      </div>

                      {/* 3. BÖLÜM: Şıklar (2x2 GRID - BÜYÜTÜLMÜŞ, GENİŞ, FERAH VE RAHAT OKUNUR) */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1.5 w-full shrink-0">
                        {currentQ.options.map((opt, oIdx) => {
                          const isChosen = player.selectedOption === opt;
                          const isRight = opt === currentQ.correctAnswer;
                          let btnStyle = 'border-2 border-blue-500/40 bg-gradient-to-b from-[#18263e] to-[#0d1626] hover:from-[#1e304f] hover:to-[#101c2f] text-blue-50';

                          if (player.showFeedback) {
                            if (isRight) {
                              btnStyle = 'ring-2 ring-inset ring-emerald-500 border-emerald-400 bg-emerald-700 text-white';
                            } else if (isChosen && !isRight) {
                              btnStyle = 'ring-2 ring-inset ring-rose-600 border-rose-400 bg-rose-800 text-white';
                            } else {
                              btnStyle = 'opacity-30 border-slate-700 bg-slate-800 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={player.showFeedback}
                              onClick={() => handleOptionClick(pIdx, opt)}
                              className={`relative flex items-center justify-between px-2 py-1.5 min-h-[58px] sm:min-h-[66px] md:min-h-[74px] lg:min-h-[82px] rounded-xl border-2 transition-all cursor-pointer active:scale-98 shadow-sm ${btnStyle}`}
                            >
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 h-full">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-black/50 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border border-white/20 text-amber-300 shadow-inner">
                                  {['A', 'B', 'C', 'D'][oIdx]}
                                </span>
                                <div className="flex-1 min-w-0 h-full">
                                  <AutoFitOptionContent opt={opt} displayOpt={opt} mode={3} isLarge={true} />
                                </div>
                              </div>
                              {player.showFeedback && isRight && <span className="text-emerald-300 shrink-0 font-black text-sm ml-1">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Didaktik Açıklama */}
                      {player.showFeedback && (
                        <div className="mt-1 p-1 rounded-md bg-black/60 border border-white/10 text-[10px] text-amber-200 text-center animate-fade-in shrink-0">
                          <span className="line-clamp-2">{currentQ.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
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

      {/* Victory Celebration Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1b2b48] to-[#0c1527] border-2 border-amber-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🔍
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase">
              Tebrikler Baş Dedektif!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              5N 1K ipuçlarını ustalıkla çözdün ve vakaları başarıyla tamamladın!
            </p>

            {/* Scores summary */}
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
                    <span className="text-base font-black text-amber-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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