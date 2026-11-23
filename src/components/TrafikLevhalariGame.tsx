import React, { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid,
  HelpCircle,
  Home,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';
import {
  TRAFFIC_CATEGORIES,
  TRAFFIC_SIGNS,
  TRAFFIC_SIGN_LIST,
  TRAFIK_QUESTIONS,
  QUESTION_STYLE_LABELS,
  TrafficCategoryId,
  TrafficSignId,
  TrafficSignSvg,
  TrafikQuestion
} from './trafikLevhalariData';

interface TrafikLevhalariGameProps {
  onClose: () => void;
  onGoHome: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (path: string) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, id: string | null) => void;
  onOpenRoster?: () => void;
  onAnswerRecorded?: (isCorrect: boolean, playerIdx: number) => void;
  onGameCompleted?: (winnerIdx: number, playerCount: number) => void;
}

// Deterministic shuffle per question index so order is varied but stable across re-renders
function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = (seed + 1) * 9301 + 49297;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const TrafikLevhalariGame: React.FC<TrafikLevhalariGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students = [],
  selectedStudentId = null,
  selectedStudentIds = [null, null, null],
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRoster,
  onAnswerRecorded,
  onGameCompleted
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctDrops, setCorrectDrops] = useState(0);
  const [wrongDrops, setWrongDrops] = useState(0);

  // Per-question interactive state
  // For match_pairs: map targetIdx -> TrafficSignId
  const [matchedPairs, setMatchedPairs] = useState<Record<number, TrafficSignId>>({});
  // For category_sort: map TrafficCategoryId -> TrafficSignId[]
  const [sortedCategories, setSortedCategories] = useState<Record<TrafficCategoryId, TrafficSignId[]>>({
    bilgi: [],
    uyari: [],
    yasak: [],
    mecburi: []
  });
  // For scenario_sign: placed sign on the roadside pole
  const [placedScenarioSign, setPlacedScenarioSign] = useState<TrafficSignId | null>(null);
  // For rule_builder: map blankId -> word
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});

  // Drag / tap selection state
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);
  const [draggingPayload, setDraggingPayload] = useState<string | null>(null);
  const [hoverTargetKey, setHoverTargetKey] = useState<string | null>(null);
  const [shakeTargetKey, setShakeTargetKey] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'error' | 'hint'; text: string } | null>(null);

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const currentQuestion: TrafikQuestion = TRAFIK_QUESTIONS[questionIndex];
  const totalQuestions = TRAFIK_QUESTIONS.length;

  // Reset local board when switching question
  const resetQuestionBoard = useCallback(() => {
    setMatchedPairs({});
    setSortedCategories({ bilgi: [], uyari: [], yasak: [], mecburi: [] });
    setPlacedScenarioSign(null);
    setFilledBlanks({});
    setSelectedPayload(null);
    setDraggingPayload(null);
    setHoverTargetKey(null);
    setShakeTargetKey(null);
    setFeedbackBanner(null);
  }, []);

  useEffect(() => {
    resetQuestionBoard();
  }, [questionIndex, resetQuestionBoard]);

  // Determine whether the active question is completely solved
  const isCurrentSolved = useMemo(() => {
    switch (currentQuestion.style) {
      case 'match_pairs':
        return Object.keys(matchedPairs).length === currentQuestion.pairs.length;
      case 'category_sort': {
        const placedCount = Object.values(sortedCategories).reduce((acc, list) => acc + list.length, 0);
        return placedCount === currentQuestion.signs.length;
      }
      case 'scenario_sign':
        return placedScenarioSign === currentQuestion.correctSignId;
      case 'rule_builder':
        return currentQuestion.blanks.every(b => filledBlanks[b.id] === b.answer);
    }
  }, [currentQuestion, matchedPairs, sortedCategories, placedScenarioSign, filledBlanks]);

  // Mark solved & celebrate on completion
  useEffect(() => {
    if (!isCurrentSolved) return;
    setSelectedPayload(null);
    setDraggingPayload(null);
    setFeedbackBanner(null);

    setCompletedIds(prev => {
      if (prev.includes(currentQuestion.id)) return prev;
      const next = [...prev, currentQuestion.id];
      if (next.length === totalQuestions) {
        playMp3?.('/alkis.mp3');
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        onGameCompleted?.(0, 1);
      } else {
        playMp3?.('/ding.mp3');
      }
      return next;
    });
  }, [isCurrentSolved, currentQuestion.id, totalQuestions, playMp3, onGameCompleted]);

  // Shuffled draggable trays
  const shuffledMatchSigns = useMemo(() => {
    if (currentQuestion.style !== 'match_pairs') return [];
    const placedSet = new Set(Object.values(matchedPairs));
    const all = deterministicShuffle(
      currentQuestion.pairs.map(p => p.signId),
      questionIndex + 11
    );
    return all.filter(s => !placedSet.has(s));
  }, [currentQuestion, matchedPairs, questionIndex]);

  const shuffledSortSigns = useMemo(() => {
    if (currentQuestion.style !== 'category_sort') return [];
    const placedSet = new Set(Object.values(sortedCategories).flat());
    const all = deterministicShuffle(currentQuestion.signs, questionIndex + 23);
    return all.filter(s => !placedSet.has(s));
  }, [currentQuestion, sortedCategories, questionIndex]);

  const shuffledScenarioChoices = useMemo(() => {
    if (currentQuestion.style !== 'scenario_sign') return [];
    return deterministicShuffle(currentQuestion.choices, questionIndex + 37);
  }, [currentQuestion, questionIndex]);

  const shuffledWordBank = useMemo(() => {
    if (currentQuestion.style !== 'rule_builder') return [];
    const usedWords = new Set(Object.values(filledBlanks));
    const all = deterministicShuffle(currentQuestion.wordBank, questionIndex + 53);
    return all.filter(w => !usedWords.has(w));
  }, [currentQuestion, filledBlanks, questionIndex]);

  // Trigger error feedback
  const triggerWrongDrop = useCallback(
    (targetKey: string, message: string) => {
      playMp3?.('/click.mp3');
      setStreak(0);
      setWrongDrops(w => w + 1);
      onAnswerRecorded?.(false, 0);
      setShakeTargetKey(targetKey);
      setFeedbackBanner({ type: 'error', text: message });
      setTimeout(() => {
        setShakeTargetKey(prev => (prev === targetKey ? null : prev));
      }, 520);
    },
    [playMp3, onAnswerRecorded]
  );

  // Trigger correct drop
  const triggerCorrectDrop = useCallback(() => {
    playMp3?.('/coin.mp3');
    setScore(s => s + 10);
    setStreak(st => st + 1);
    setCorrectDrops(c => c + 1);
    onAnswerRecorded?.(true, 0);
    setSelectedPayload(null);
    setDraggingPayload(null);
    setFeedbackBanner(null);
  }, [playMp3, onAnswerRecorded]);

  // Placement handlers per style
  const handlePlaceOnMatchSlot = useCallback(
    (slotIdx: number, payload: string | null) => {
      if (!payload || currentQuestion.style !== 'match_pairs' || isCurrentSolved) return;
      if (matchedPairs[slotIdx]) return;
      const expected = currentQuestion.pairs[slotIdx].signId;
      if (payload === expected) {
        setMatchedPairs(prev => ({ ...prev, [slotIdx]: payload as TrafficSignId }));
        triggerCorrectDrop();
      } else {
        const pickedInfo = TRAFFIC_SIGNS[payload as TrafficSignId];
        triggerWrongDrop(
          `match-${slotIdx}`,
          pickedInfo
            ? `"${pickedInfo.shortName}" bu kutuya uymuyor. Levhanın şekline ve simgesine tekrar bak!`
            : 'Bu levha bu kutuya uymuyor, tekrar dene!'
        );
      }
    },
    [currentQuestion, isCurrentSolved, matchedPairs, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePlaceOnCategoryBasket = useCallback(
    (catId: TrafficCategoryId, payload: string | null) => {
      if (!payload || currentQuestion.style !== 'category_sort' || isCurrentSolved) return;
      const signId = payload as TrafficSignId;
      const signInfo = TRAFFIC_SIGNS[signId];
      if (!signInfo) return;
      const alreadyPlaced = Object.values(sortedCategories).flat().includes(signId);
      if (alreadyPlaced) return;

      if (signInfo.category === catId) {
        setSortedCategories(prev => ({
          ...prev,
          [catId]: [...prev[catId], signId]
        }));
        triggerCorrectDrop();
      } else {
        triggerWrongDrop(
          `cat-${catId}`,
          `Dikkat! "${signInfo.shortName}" bir ${signInfo.shapeLabel} levhadır. Şekline göre doğru kutuyu seç!`
        );
      }
    },
    [currentQuestion, isCurrentSolved, sortedCategories, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePlaceOnSignpost = useCallback(
    (payload: string | null) => {
      if (!payload || currentQuestion.style !== 'scenario_sign' || isCurrentSolved) return;
      const signId = payload as TrafficSignId;
      if (signId === currentQuestion.correctSignId) {
        setPlacedScenarioSign(signId);
        triggerCorrectDrop();
      } else {
        const pickedInfo = TRAFFIC_SIGNS[signId];
        triggerWrongDrop(
          'signpost',
          pickedInfo
            ? `Seçtiğin levha "${pickedInfo.name}". Hikâyeyi tekrar okuyup doğru levhayı direğe tak!`
            : 'Bu levha hikâyeye uymuyor, tekrar dene!'
        );
      }
    },
    [currentQuestion, isCurrentSolved, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePlaceOnBlank = useCallback(
    (blankId: string, payload: string | null) => {
      if (!payload || currentQuestion.style !== 'rule_builder' || isCurrentSolved) return;
      if (filledBlanks[blankId]) return;
      const blank = currentQuestion.blanks.find(b => b.id === blankId);
      if (!blank) return;

      if (payload === blank.answer) {
        setFilledBlanks(prev => ({ ...prev, [blankId]: payload }));
        triggerCorrectDrop();
      } else {
        triggerWrongDrop(
          `blank-${blankId}`,
          `"${payload}" sözcüğü bu boşluğa uymuyor. Cümleyi baştan okuyup tekrar dene!`
        );
      }
    },
    [currentQuestion, isCurrentSolved, filledBlanks, triggerCorrectDrop, triggerWrongDrop]
  );

  // Helpful Hint handler
  const handleShowHint = () => {
    if (isCurrentSolved) return;
    playMp3?.('/op.mp3');
    if (currentQuestion.style === 'match_pairs') {
      const nextIdx = currentQuestion.pairs.findIndex((_, i) => !matchedPairs[i]);
      if (nextIdx !== -1) {
        const p = currentQuestion.pairs[nextIdx];
        const info = TRAFFIC_SIGNS[p.signId];
        setSelectedPayload(p.signId);
        setFeedbackBanner({
          type: 'hint',
          text: `İpucu: "${p.targetLabel}" kutusu için ${info.shapeLabel} şeklindeki levhayı sürükle!`
        });
      }
    } else if (currentQuestion.style === 'category_sort') {
      const nextSign = shuffledSortSigns[0];
      if (nextSign) {
        const info = TRAFFIC_SIGNS[nextSign];
        const cat = TRAFFIC_CATEGORIES[info.category];
        setSelectedPayload(nextSign);
        setFeedbackBanner({
          type: 'hint',
          text: `İpucu: "${info.shortName}" bir ${info.shapeLabel} levhadır — "${cat.shortTitle}" kutusuna gider!`
        });
      }
    } else if (currentQuestion.style === 'scenario_sign') {
      const info = TRAFFIC_SIGNS[currentQuestion.correctSignId];
      setFeedbackBanner({
        type: 'hint',
        text: `İpucu: Aradığımız levha ${info.shapeLabel} şeklindedir (${TRAFFIC_CATEGORIES[info.category].shortTitle}).`
      });
    } else if (currentQuestion.style === 'rule_builder') {
      const nextBlank = currentQuestion.blanks.find(b => !filledBlanks[b.id]);
      if (nextBlank) {
        setSelectedPayload(nextBlank.answer);
        setFeedbackBanner({
          type: 'hint',
          text: `İpucu: Sıradaki boşluğa "${nextBlank.answer}" sözcüğü çok güzel uyar!`
        });
      }
    }
  };

  const handleNextQuestion = () => {
    playMp3?.('/op.mp3');
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex(i => i + 1);
    } else {
      setShowVictoryModal(true);
    }
  };

  const handlePrevQuestion = () => {
    playMp3?.('/op.mp3');
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1);
    }
  };

  const handleRestartAll = () => {
    playMp3?.('/op.mp3');
    setQuestionIndex(0);
    setCompletedIds([]);
    setScore(0);
    setStreak(0);
    setCorrectDrops(0);
    setWrongDrops(0);
    setShowVictoryModal(false);
    resetQuestionBoard();
  };

  // Drag helper handlers
  const startDrag = (e: React.DragEvent, payload: string) => {
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPayload(payload);
    setSelectedPayload(payload);
  };

  const endDrag = () => {
    setDraggingPayload(null);
    setHoverTargetKey(null);
  };

  const readDropPayload = (e: React.DragEvent): string | null => {
    const dt = e.dataTransfer.getData('text/plain');
    return dt || draggingPayload || selectedPayload;
  };

  const styleMeta = QUESTION_STYLE_LABELS[currentQuestion.style];
  const progressPercent = Math.round(((completedIds.length) / totalQuestions) * 100);
  const accuracy = correctDrops + wrongDrops > 0 ? Math.round((correctDrops / (correctDrops + wrongDrops)) * 100) : 100;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] md:top-[68px] z-30 flex flex-col overflow-hidden select-none">
      {/* Background + High-contrast dark readability scrim */}
      <ActivityBackground theme="doga" />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-0" />

      {/* ─── TOP CONTROL BAR ─── */}
      <div className="relative z-20 shrink-0 px-2 sm:px-4 pt-2 pb-1.5">
        <div className="max-w-6xl mx-auto bg-[#0b1324] border-2 border-sky-400/50 rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-[0_8px_24px_rgba(0,0,0,0.55)] flex flex-wrap items-center justify-between gap-2">
          {/* Left: Navigation & Title */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onPrevActivity && (
              <button
                type="button"
                onClick={onPrevActivity}
                className="p-1.5 sm:p-2 rounded-xl bg-[#16223b] hover:bg-[#1f3154] text-sky-200 border border-sky-400/30 transition cursor-pointer"
                title="Önceki Etkinlik"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-[#16223b] hover:bg-[#1f3154] text-slate-100 border border-slate-600/60 font-bold text-xs sm:text-sm flex items-center gap-1 transition cursor-pointer"
              title="2. Sınıf Hayat Bilgisi Menüsüne Dön"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Geri</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="p-1.5 sm:p-2 rounded-xl bg-[#16223b] hover:bg-[#1f3154] text-amber-300 border border-amber-400/30 transition cursor-pointer"
              title="Ana Sayfa"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {onNextActivity && (
              <button
                type="button"
                onClick={onNextActivity}
                className="p-1.5 sm:p-2 rounded-xl bg-[#16223b] hover:bg-[#1f3154] text-sky-200 border border-sky-400/30 transition cursor-pointer"
                title="Sonraki Etkinlik"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="pl-1 sm:pl-2 border-l border-slate-700/80 hidden md:block">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-300 leading-none">
                2. Sınıf Hayat Bilgisi • Sürükle-Bırak
              </div>
              <div className="text-sm lg:text-base font-black text-white leading-tight mt-0.5">
                Trafik İşaret Levhaları
              </div>
            </div>
          </div>

          {/* Center: Question Selector & Progress */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={questionIndex === 0}
              className="p-1.5 rounded-xl bg-[#16223b] hover:bg-[#22345a] disabled:opacity-35 text-white border border-slate-600/60 transition cursor-pointer disabled:cursor-not-allowed"
              title="Önceki Soru"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setShowQuestionMap(v => !v);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#16223b] hover:bg-[#1f3154] border border-sky-400/50 text-white font-black text-xs sm:text-sm tabular-nums flex items-center gap-1.5 transition cursor-pointer"
              title="Tüm 30 Soruyu Gör"
            >
              <Grid className="w-3.5 h-3.5 text-sky-300" />
              <span>
                Soru {questionIndex + 1} / {totalQuestions}
              </span>
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={questionIndex === totalQuestions - 1 && !isCurrentSolved}
              className="p-1.5 rounded-xl bg-[#16223b] hover:bg-[#22345a] disabled:opacity-35 text-white border border-slate-600/60 transition cursor-pointer disabled:cursor-not-allowed"
              title="Sonraki Soru"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Stats + Guide + Hint + Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-[#132038] border border-amber-400/40 text-amber-300 font-black text-xs sm:text-sm tabular-nums flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{score}</span>
              {streak >= 2 && (
                <span className="ml-1 text-[11px] text-emerald-300">×{streak}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setShowGuideModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow transition cursor-pointer border border-sky-300/60"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Levha Rehberi</span>
            </button>

            <button
              type="button"
              onClick={handleShowHint}
              disabled={isCurrentSolved}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1 shadow transition cursor-pointer disabled:cursor-not-allowed"
              title="İpucu Göster"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden md:inline">İpucu</span>
            </button>

            <button
              type="button"
              onClick={handleRestartAll}
              className="p-1.5 sm:p-2 rounded-xl bg-[#16223b] hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-600/60 transition cursor-pointer"
              title="Baştan Başla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slim progress strip */}
        <div className="max-w-6xl mx-auto mt-1.5 flex items-center gap-2 px-1">
          <div className="flex-1 h-2 bg-[#0b1324] rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, Math.round(((questionIndex + 1) / totalQuestions) * 100))}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-200 tabular-nums shrink-0">
            Tamamlanan: {completedIds.length}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* ─── MAIN ACTIVITY STAGE ─── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-2 sm:px-4 pb-3 pt-1">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          {/* Question Header Card (Solid Opaque High Contrast) */}
          <div className="bg-[#0d172b] border-2 border-slate-600/80 rounded-2xl px-4 py-3 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black uppercase tracking-wider ${styleMeta.accent}`}>
                  {styleMeta.label}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-300">
                  Sürükle-bırak veya önce karta, sonra hedef kutuya dokun
                </span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white mt-0.5 leading-snug">
                {questionIndex + 1}. {currentQuestion.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
                {currentQuestion.instruction}
              </p>
            </div>

            {selectedPayload && !isCurrentSolved && (
              <div className="shrink-0 bg-cyan-950 border-2 border-cyan-400 rounded-xl px-3 py-1.5 text-cyan-200 text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Seçili — hedef kutuya dokun!</span>
              </div>
            )}
          </div>

          {/* Feedback Banner (Error or Hint) */}
          {feedbackBanner && !isCurrentSolved && (
            <div
              className={`rounded-xl px-4 py-2.5 border-2 font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-lg ${
                feedbackBanner.type === 'error'
                  ? 'bg-[#2a0f18] border-rose-400 text-rose-100'
                  : 'bg-[#261c0a] border-amber-400 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackBanner.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{feedbackBanner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 1: MATCH PAIRS (3 Signs -> 3 Meaning Drop Cards)         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'match_pairs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Draggable Sign Tray */}
              <div className="lg:col-span-4 bg-[#0d172b] border-2 border-sky-400/50 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-sky-300 mb-2.5">
                    Sürüklenecek Levhalar ({shuffledMatchSigns.length})
                  </div>

                  {shuffledMatchSigns.length === 0 ? (
                    <div className="py-8 text-center rounded-xl bg-emerald-950 border-2 border-emerald-400/60 text-emerald-200 font-black text-sm flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                      <span>Tüm levhalar doğru yerleşti!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
                      {shuffledMatchSigns.map(signId => {
                        const isSelected = selectedPayload === signId;
                        return (
                          <div
                            key={signId}
                            draggable
                            onDragStart={e => startDrag(e, signId)}
                            onDragEnd={endDrag}
                            onClick={() => {
                              playMp3?.('/click.mp3');
                              setSelectedPayload(prev => (prev === signId ? null : signId));
                            }}
                            className={`cursor-grab active:cursor-grabbing rounded-2xl p-2.5 sm:p-3 border-2 transition-all flex flex-col lg:flex-row items-center gap-2.5 shadow-md ${
                              isSelected
                                ? 'bg-[#173057] border-cyan-300 ring-2 ring-cyan-400 scale-[1.02]'
                                : 'bg-[#15223d] hover:bg-[#1c2e52] border-slate-500/80 hover:border-sky-300'
                            }`}
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow">
                              <TrafficSignSvg signId={signId} className="w-full h-full" />
                            </div>
                            <div className="text-center lg:text-left">
                              <div className="text-xs sm:text-sm font-black text-white">
                                Sürükle veya Seç
                              </div>
                              <div className="text-[11px] font-bold text-sky-300 mt-0.5">
                                {TRAFFIC_SIGNS[signId].shapeLabel}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Target Drop Slots */}
              <div className="lg:col-span-8 grid grid-cols-1 gap-2.5">
                {currentQuestion.pairs.map((pair, idx) => {
                  const placed = matchedPairs[idx];
                  const targetKey = `match-${idx}`;
                  const isHovered = hoverTargetKey === targetKey;
                  const isShaking = shakeTargetKey === targetKey;

                  return (
                    <div
                      key={pair.signId}
                      onDragOver={e => {
                        e.preventDefault();
                        if (!placed) setHoverTargetKey(targetKey);
                      }}
                      onDragLeave={() => setHoverTargetKey(prev => (prev === targetKey ? null : prev))}
                      onDrop={e => {
                        e.preventDefault();
                        setHoverTargetKey(null);
                        handlePlaceOnMatchSlot(idx, readDropPayload(e));
                      }}
                      onClick={() => {
                        if (!placed && selectedPayload) {
                          handlePlaceOnMatchSlot(idx, selectedPayload);
                        }
                      }}
                      className={`rounded-2xl p-3 sm:p-4 border-2 transition-all flex items-center gap-3 sm:gap-4 shadow-xl ${
                        placed
                          ? 'bg-[#0c291f] border-emerald-400'
                          : isShaking
                          ? 'bg-[#2b1019] border-rose-400 translate-x-1'
                          : isHovered
                          ? 'bg-[#17335e] border-cyan-300 scale-[1.01]'
                          : selectedPayload
                          ? 'bg-[#111e38] border-cyan-400/75 cursor-pointer hover:bg-[#17294a]'
                          : 'bg-[#0f1a30] border-slate-600/80'
                      }`}
                    >
                      {/* Drop box */}
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 flex items-center justify-center border-2 transition-all ${
                          placed
                            ? 'bg-white p-1.5 border-emerald-300 shadow-lg'
                            : isHovered
                            ? 'bg-cyan-950 border-dashed border-cyan-300'
                            : 'bg-[#091020] border-dashed border-slate-500'
                        }`}
                      >
                        {placed ? (
                          <TrafficSignSvg signId={placed} className="w-full h-full" />
                        ) : (
                          <span className="text-[11px] font-black text-slate-400 text-center px-1 leading-tight">
                            LEVHAYI BIRAK
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight">
                            {pair.targetLabel}
                          </h3>
                          {placed && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        </div>
                        {pair.targetSub && (
                          <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                            {pair.targetSub}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 2: CATEGORY SORT (Signs -> 2, 3 or 4 Category Baskets)   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'category_sort' && (
            <div className="flex flex-col gap-3">
              {/* Top Tray of Unsorted Signs */}
              <div className="bg-[#0d172b] border-2 border-amber-400/50 rounded-2xl p-3 sm:p-4 shadow-xl">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-2.5">
                  Gruplandırılacak Levhalar ({shuffledSortSigns.length})
                </div>

                {shuffledSortSigns.length === 0 ? (
                  <div className="py-4 text-center rounded-xl bg-emerald-950 border-2 border-emerald-400/60 text-emerald-200 font-black text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span>Harika! Tüm levhalar doğru grubuna yerleştirildi!</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {shuffledSortSigns.map(signId => {
                      const isSelected = selectedPayload === signId;
                      return (
                        <div
                          key={signId}
                          draggable
                          onDragStart={e => startDrag(e, signId)}
                          onDragEnd={endDrag}
                          onClick={() => {
                            playMp3?.('/click.mp3');
                            setSelectedPayload(prev => (prev === signId ? null : signId));
                          }}
                          className={`cursor-grab active:cursor-grabbing rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 w-32 sm:w-36 shadow-lg ${
                            isSelected
                              ? 'bg-[#173057] border-cyan-300 ring-2 ring-cyan-400 scale-105'
                              : 'bg-[#15223d] hover:bg-[#1d3056] border-slate-500/80 hover:border-amber-300'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-xl bg-white p-1.5 flex items-center justify-center shadow">
                            <TrafficSignSvg signId={signId} className="w-full h-full" />
                          </div>
                          <span className="text-xs font-black text-white text-center leading-tight">
                            {TRAFFIC_SIGNS[signId].shortName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Drop Baskets */}
              <div
                className={`grid gap-3 ${
                  currentQuestion.categories.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : currentQuestion.categories.length === 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {currentQuestion.categories.map(catId => {
                  const meta = TRAFFIC_CATEGORIES[catId];
                  const placedSigns = sortedCategories[catId] || [];
                  const targetKey = `cat-${catId}`;
                  const isHovered = hoverTargetKey === targetKey;
                  const isShaking = shakeTargetKey === targetKey;

                  return (
                    <div
                      key={catId}
                      onDragOver={e => {
                        e.preventDefault();
                        setHoverTargetKey(targetKey);
                      }}
                      onDragLeave={() => setHoverTargetKey(prev => (prev === targetKey ? null : prev))}
                      onDrop={e => {
                        e.preventDefault();
                        setHoverTargetKey(null);
                        handlePlaceOnCategoryBasket(catId, readDropPayload(e));
                      }}
                      onClick={() => {
                        if (selectedPayload) {
                          handlePlaceOnCategoryBasket(catId, selectedPayload);
                        }
                      }}
                      className={`rounded-2xl border-2 overflow-hidden flex flex-col min-h-[190px] shadow-xl transition-all ${
                        isShaking
                          ? 'bg-[#2b1019] border-rose-400 translate-x-1'
                          : isHovered
                          ? 'bg-[#173057] border-cyan-300 scale-[1.01]'
                          : selectedPayload
                          ? `bg-[#0e1930] ${meta.borderColor} cursor-pointer hover:bg-[#152546]`
                          : `bg-[#0d172b] ${meta.borderColor}`
                      }`}
                    >
                      {/* Solid vivid top header */}
                      <div className={`bg-gradient-to-r ${meta.headerBg} px-3.5 py-2.5 text-white`}>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-95">
                          {meta.shapeHint}
                        </div>
                        <div className="text-sm sm:text-base font-black leading-tight mt-0.5">
                          {meta.shortTitle}
                        </div>
                      </div>

                      {/* Drop body */}
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-300 leading-snug">
                          {meta.summary}
                        </p>

                        {placedSigns.length === 0 ? (
                          <div className="flex-1 min-h-[76px] rounded-xl bg-[#080f1f] border-2 border-dashed border-slate-600 flex items-center justify-center text-xs font-black text-slate-400 text-center px-2">
                            Levhaları buraya bırak
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 justify-center bg-[#091224] rounded-xl p-2 border border-emerald-500/40">
                            {placedSigns.map(sId => (
                              <div
                                key={sId}
                                className="flex flex-col items-center gap-1 bg-emerald-950 border border-emerald-400 rounded-xl p-1.5 w-20"
                              >
                                <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center">
                                  <TrafficSignSvg signId={sId} className="w-full h-full" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-200 text-center leading-tight line-clamp-2">
                                  {TRAFFIC_SIGNS[sId].shortName}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 3: SCENARIO SIGN (Drag 1 Correct Sign onto Road Signpost)*/}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'scenario_sign' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Road Scenario + Signpost Drop Target */}
              <div className="lg:col-span-7 bg-[#0d172b] border-2 border-emerald-400/60 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                    <span>📍 {currentQuestion.sceneHint}</span>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-black text-white leading-relaxed">
                    {currentQuestion.scenario}
                  </p>
                  <div className="text-xs sm:text-sm font-bold text-slate-300 bg-[#14223d] border border-slate-600/80 rounded-xl px-3 py-2">
                    Sağdaki boş trafik direğine doğru levhayı sürükle veya bir levhaya dokunup direğe tıkla!
                  </div>
                </div>

                {/* Interactive Signpost Pole */}
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      if (!placedScenarioSign) setHoverTargetKey('signpost');
                    }}
                    onDragLeave={() => setHoverTargetKey(prev => (prev === 'signpost' ? null : prev))}
                    onDrop={e => {
                      e.preventDefault();
                      setHoverTargetKey(null);
                      handlePlaceOnSignpost(readDropPayload(e));
                    }}
                    onClick={() => {
                      if (!placedScenarioSign && selectedPayload) {
                        handlePlaceOnSignpost(selectedPayload);
                      }
                    }}
                    className={`w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 flex flex-col items-center justify-center transition-all shadow-2xl ${
                      placedScenarioSign
                        ? 'bg-white p-2.5 border-emerald-400 scale-105'
                        : shakeTargetKey === 'signpost'
                        ? 'bg-[#2b1019] border-rose-400 translate-x-1'
                        : hoverTargetKey === 'signpost'
                        ? 'bg-cyan-950 border-dashed border-cyan-300 scale-105'
                        : selectedPayload
                        ? 'bg-[#122444] border-dashed border-cyan-400 cursor-pointer hover:bg-[#193058]'
                        : 'bg-[#081022] border-dashed border-amber-400/80'
                    }`}
                  >
                    {placedScenarioSign ? (
                      <TrafficSignSvg signId={placedScenarioSign} className="w-full h-full" />
                    ) : (
                      <div className="text-center px-3">
                        <div className="text-2xl mb-1">🪧</div>
                        <div className="text-xs font-black text-amber-300 uppercase leading-tight">
                          LEVHAYI BURAYA TAK
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Metal pole & curb base */}
                  <div className="w-3.5 h-16 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-500 border-x border-slate-700" />
                  <div className="w-24 h-3.5 rounded-t-lg bg-slate-600 border-t-2 border-slate-400" />
                </div>
              </div>

              {/* 4 Draggable Sign Choices */}
              <div className="lg:col-span-5 bg-[#0d172b] border-2 border-slate-600/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-center">
                <div className="text-xs font-black uppercase tracking-wider text-sky-300 mb-2.5">
                  Levha Seçenekleri (1 Doğru Levha)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {shuffledScenarioChoices.map(signId => {
                    const isPlacedCorrect = placedScenarioSign === signId;
                    const isSelected = selectedPayload === signId;
                    return (
                      <div
                        key={signId}
                        draggable={!isCurrentSolved}
                        onDragStart={e => !isCurrentSolved && startDrag(e, signId)}
                        onDragEnd={endDrag}
                        onClick={() => {
                          if (isCurrentSolved) return;
                          playMp3?.('/click.mp3');
                          setSelectedPayload(prev => (prev === signId ? null : signId));
                        }}
                        className={`rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 shadow-md ${
                          isPlacedCorrect
                            ? 'bg-emerald-950 border-emerald-400 opacity-75'
                            : isCurrentSolved
                            ? 'bg-[#0b1324] border-slate-700 opacity-45'
                            : isSelected
                            ? 'bg-[#173057] border-cyan-300 ring-2 ring-cyan-400 scale-[1.03] cursor-grab'
                            : 'bg-[#15223d] hover:bg-[#1e3158] border-slate-500/80 hover:border-emerald-300 cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl bg-white p-1.5 flex items-center justify-center shadow">
                          <TrafficSignSvg signId={signId} className="w-full h-full" />
                        </div>
                        <span className="text-xs font-black text-white text-center leading-tight">
                          {TRAFFIC_SIGNS[signId].shapeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 4: RULE BUILDER (Drag Word Chips into Sentence Blanks)   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'rule_builder' && (
            <div className="flex flex-col gap-3">
              {/* Rule Sentence Card + Sign Visuals */}
              <div className="bg-[#0d172b] border-2 border-fuchsia-400/60 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col items-center gap-4">
                {/* Preview signs */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentQuestion.previewSigns.map(sId => (
                    <div
                      key={sId}
                      className="flex items-center gap-2 bg-[#15223d] border border-slate-500/70 rounded-xl px-2.5 py-1.5"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shadow">
                        <TrafficSignSvg signId={sId} className="w-full h-full" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white leading-tight">
                          {TRAFFIC_SIGNS[sId].shortName}
                        </div>
                        <div className="text-[11px] font-bold text-slate-300">
                          {TRAFFIC_SIGNS[sId].shapeLabel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sentence with inline drop blanks */}
                <div className="w-full bg-[#091224] border-2 border-slate-700 rounded-2xl p-4 sm:p-6 text-center text-lg sm:text-xl md:text-2xl font-black text-white leading-[2.3] flex flex-wrap items-center justify-center gap-y-2">
                  {currentQuestion.segments.map((seg, i) => {
                    const blank = currentQuestion.blanks[i];
                    const filledWord = blank ? filledBlanks[blank.id] : undefined;
                    const targetKey = blank ? `blank-${blank.id}` : '';
                    const isHovered = blank && hoverTargetKey === targetKey;
                    const isShaking = blank && shakeTargetKey === targetKey;

                    return (
                      <React.Fragment key={i}>
                        <span className="px-1">{seg}</span>
                        {blank && (
                          <span
                            onDragOver={e => {
                              e.preventDefault();
                              if (!filledWord) setHoverTargetKey(targetKey);
                            }}
                            onDragLeave={() => setHoverTargetKey(prev => (prev === targetKey ? null : prev))}
                            onDrop={e => {
                              e.preventDefault();
                              setHoverTargetKey(null);
                              handlePlaceOnBlank(blank.id, readDropPayload(e));
                            }}
                            onClick={() => {
                              if (!filledWord && selectedPayload) {
                                handlePlaceOnBlank(blank.id, selectedPayload);
                              }
                            }}
                            className={`inline-flex items-center justify-center min-w-[130px] sm:min-w-[155px] px-3 py-1 mx-1.5 rounded-xl border-2 text-base sm:text-xl font-black transition-all align-middle ${
                              filledWord
                                ? 'bg-emerald-700 border-emerald-300 text-white shadow-lg'
                                : isShaking
                                ? 'bg-rose-950 border-rose-400 text-rose-200'
                                : isHovered
                                ? 'bg-cyan-900 border-cyan-300 text-cyan-100 scale-105'
                                : selectedPayload
                                ? 'bg-[#172c52] border-dashed border-cyan-400 text-cyan-200 cursor-pointer'
                                : 'bg-[#13203b] border-dashed border-fuchsia-400 text-fuchsia-300'
                            }`}
                          >
                            {filledWord || 'Sözcüğü Bırak'}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Word Chip Tray */}
              <div className="bg-[#0d172b] border-2 border-slate-600/80 rounded-2xl p-4 shadow-xl">
                <div className="text-xs font-black uppercase tracking-wider text-fuchsia-300 mb-3 text-center">
                  Sözcük Kartları — Doğru sözcüğü yukarıdaki boşluğa sürükle
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {shuffledWordBank.map(word => {
                    const isSelected = selectedPayload === word;
                    return (
                      <div
                        key={word}
                        draggable={!isCurrentSolved}
                        onDragStart={e => !isCurrentSolved && startDrag(e, word)}
                        onDragEnd={endDrag}
                        onClick={() => {
                          if (isCurrentSolved) return;
                          playMp3?.('/click.mp3');
                          setSelectedPayload(prev => (prev === word ? null : word));
                        }}
                        className={`px-5 py-3 rounded-2xl border-2 font-black text-base sm:text-lg transition-all shadow-lg ${
                          isCurrentSolved
                            ? 'bg-[#0b1324] border-slate-700 text-slate-500 opacity-50'
                            : isSelected
                            ? 'bg-cyan-600 border-cyan-200 text-white ring-2 ring-cyan-300 scale-105 cursor-grab'
                            : 'bg-[#18294a] hover:bg-[#223966] border-fuchsia-400/70 hover:border-cyan-300 text-white cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        {word}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── SOLVED / AKILDA KALSIN MICRO-FEEDBACK & NEXT CTA ─── */}
          {isCurrentSolved && (
            <div className="bg-[#0b261d] border-2 border-emerald-400 rounded-2xl p-4 shadow-[0_0_28px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Harika! Doğru Tamamladın — Akılda Kalsın
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                    {currentQuestion.fact}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{questionIndex < totalQuestions - 1 ? 'Sonraki Soru' : 'Sonucu Gör'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM STUDENT AVATAR DOCK ─── */}
      {students.length > 0 && (
        <div className="relative z-20 shrink-0">
          <StudentAvatarDock
            students={students}
            selectedStudentIds={selectedStudentIds}
            onSelectStudentForPlayer={onSelectStudentForPlayer || ((_, id) => onSelectStudent?.(id))}
            onOpenRosterModal={() => onOpenRoster?.()}
            playMp3={playMp3}
            currentGrade={2}
            playerCount={1}
          />
        </div>
      )}

      {/* ─── QUESTION MAP MODAL (1–30 Quick Jump) ─── */}
      {showQuestionMap && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#0b1324] border-2 border-sky-400 rounded-3xl max-w-2xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">30 Soru Haritası</h3>
                <p className="text-xs font-semibold text-slate-300">
                  İstediğin soruya dokunup doğrudan geçebilirsin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionMap(false)}
                className="p-2 rounded-xl bg-[#16223b] hover:bg-rose-600 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 py-4 overflow-y-auto">
              {TRAFIK_QUESTIONS.map((q, idx) => {
                const done = completedIds.includes(q.id);
                const active = idx === questionIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      playMp3?.('/op.mp3');
                      setQuestionIndex(idx);
                      setShowQuestionMap(false);
                    }}
                    className={`rounded-xl p-2 border-2 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                      active
                        ? 'bg-sky-600 border-white text-white shadow-lg scale-105'
                        : done
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                        : 'bg-[#142038] hover:bg-[#1e3156] border-slate-600 text-slate-100'
                    }`}
                  >
                    <span className="text-sm font-black tabular-nums">{idx + 1}</span>
                    <span className="text-[9px] font-bold opacity-85 truncate max-w-full">
                      {q.style === 'match_pairs'
                        ? 'Eşleştir'
                        : q.style === 'category_sort'
                        ? 'Grupla'
                        : q.style === 'scenario_sign'
                        ? 'Senaryo'
                        : 'Kural'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEVHA REHBERİ MODAL (Full Opaque Visual Poster) ─── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#0b1324] border-2 border-sky-400 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 px-5 py-3.5 flex items-center justify-between gap-2 shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  🚦 Çocuklar İçin Trafik İşaret Levhaları Rehberi
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-sky-100">
                  Trafik işaret levhaları yayalara bilgi verir, sürücüleri uyarır ve trafiği düzenler.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-slate-950/40 hover:bg-rose-600 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {(['bilgi', 'uyari', 'yasak', 'mecburi'] as TrafficCategoryId[]).map(catId => {
                const cat = TRAFFIC_CATEGORIES[catId];
                const signs = TRAFFIC_SIGN_LIST.filter(s => s.category === catId);
                return (
                  <div key={catId} className={`rounded-2xl border-2 ${cat.borderColor} bg-[#101c34] overflow-hidden`}>
                    <div className={`bg-gradient-to-r ${cat.headerBg} px-4 py-2 flex items-center justify-between`}>
                      <span className="font-black text-sm sm:text-base text-white">{cat.title}</span>
                      <span className="text-xs font-extrabold text-white/95 uppercase">{cat.shapeHint}</span>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {signs.map(sign => (
                        <div
                          key={sign.id}
                          className="bg-[#0b1324] border border-slate-600/80 rounded-xl p-2.5 flex items-center gap-3"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                            <TrafficSignSvg signId={sign.id} className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-sm text-white leading-tight">{sign.name}</div>
                            <p className="text-xs font-medium text-slate-300 mt-0.5 leading-snug">
                              {sign.meaning}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Önemli Ayrım & Akılda Kalsın */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#23190b] border-2 border-amber-400 rounded-2xl p-3.5">
                  <div className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Önemli Ayrım</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1 leading-snug">
                    Mavi geçit levhaları yayalara bilgi verir; kırmızı üçgen geçit levhaları sürücüleri uyarır.
                  </p>
                </div>
                <div className="bg-[#0c261d] border-2 border-emerald-400 rounded-2xl p-3.5">
                  <div className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Akılda Kalsın</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1 leading-snug">
                    Levhaları tanır, trafik kurallarına uyarız. Kurallara uymak hepimizin sorumluluğudur!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VICTORY SUMMARY MODAL ─── */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1324] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Tebrikler Trafik Kahramanı!</h3>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                Trafik İşaret Levhaları etkinliğini harika bir şekilde tamamladın!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#142038] border border-slate-600 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Puan</div>
                <div className="text-xl font-black text-amber-300 tabular-nums">{score}</div>
              </div>
              <div className="bg-[#142038] border border-slate-600 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Soru</div>
                <div className="text-xl font-black text-emerald-300 tabular-nums">
                  {completedIds.length}/{totalQuestions}
                </div>
              </div>
              <div className="bg-[#142038] border border-slate-600 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Başarı</div>
                <div className="text-xl font-black text-sky-300 tabular-nums">%{accuracy}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRestartAll}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white font-black text-sm shadow-lg cursor-pointer"
              >
                Tekrar Oyna
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-[#16223b] hover:bg-[#1f3154] text-white border border-slate-500 font-black text-sm cursor-pointer"
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
