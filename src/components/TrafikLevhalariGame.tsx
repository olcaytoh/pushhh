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
  AlertCircle,
  Shuffle,
  Search,
  Check,
  XCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import trafikCaddeBg from '../assets/images/trafik_cadde_arkaplan_1795612670048.jpg';
import {
  TRAFFIC_CATEGORIES,
  TRAFFIC_SIGNS,
  TRAFFIC_SIGN_LIST,
  QUESTION_STYLE_LABELS,
  buildTrafikSessionQuestions,
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
  const [questions, setQuestions] = useState<TrafikQuestion[]>(() => buildTrafikSessionQuestions(25));
  const [sessionSeed, setSessionSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
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
  // For odd_sign_out: found odd sign
  const [foundOddSign, setFoundOddSign] = useState<TrafficSignId | null>(null);
  // For true_false_check: answered boolean
  const [answeredTrueFalse, setAnsweredTrueFalse] = useState<boolean | null>(null);
  // For sign_riddle: solved sign
  const [solvedRiddleSign, setSolvedRiddleSign] = useState<TrafficSignId | null>(null);

  // Drag / tap selection state
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);
  const [draggingPayload, setDraggingPayload] = useState<string | null>(null);
  const [hoverTargetKey, setHoverTargetKey] = useState<string | null>(null);
  const [shakeTargetKey, setShakeTargetKey] = useState<string | null>(null);
  const [wrongPreview, setWrongPreview] = useState<{ targetKey: string; payload: string } | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'error' | 'hint'; text: string } | null>(null);

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const currentQuestion: TrafikQuestion = questions[questionIndex] || questions[0];
  const totalQuestions = questions.length;

  // Reset local board when switching question
  const resetQuestionBoard = useCallback(() => {
    setMatchedPairs({});
    setSortedCategories({ bilgi: [], uyari: [], yasak: [], mecburi: [] });
    setPlacedScenarioSign(null);
    setFilledBlanks({});
    setFoundOddSign(null);
    setAnsweredTrueFalse(null);
    setSolvedRiddleSign(null);
    setSelectedPayload(null);
    setDraggingPayload(null);
    setHoverTargetKey(null);
    setShakeTargetKey(null);
    setWrongPreview(null);
    setFeedbackBanner(null);
  }, []);

  useEffect(() => {
    resetQuestionBoard();
  }, [questionIndex, sessionSeed, resetQuestionBoard]);

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
      case 'odd_sign_out':
        return foundOddSign === currentQuestion.oddSignId;
      case 'true_false_check':
        return answeredTrueFalse === currentQuestion.isTrue;
      case 'sign_riddle':
        return solvedRiddleSign === currentQuestion.correctSignId;
    }
  }, [
    currentQuestion,
    matchedPairs,
    sortedCategories,
    placedScenarioSign,
    filledBlanks,
    foundOddSign,
    answeredTrueFalse,
    solvedRiddleSign
  ]);

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

  // Shuffled draggable trays (seeded by sessionSeed + questionIndex so every session is fresh!)
  const shuffledMatchSigns = useMemo(() => {
    if (currentQuestion.style !== 'match_pairs') return [];
    const placedSet = new Set(Object.values(matchedPairs));
    const all = deterministicShuffle(
      currentQuestion.pairs.map(p => p.signId),
      sessionSeed + questionIndex + 11
    );
    return all.filter(s => !placedSet.has(s));
  }, [currentQuestion, matchedPairs, questionIndex, sessionSeed]);

  const shuffledSortSigns = useMemo(() => {
    if (currentQuestion.style !== 'category_sort') return [];
    const placedSet = new Set(Object.values(sortedCategories).flat());
    const all = deterministicShuffle(currentQuestion.signs, sessionSeed + questionIndex + 23);
    return all.filter(s => !placedSet.has(s));
  }, [currentQuestion, sortedCategories, questionIndex, sessionSeed]);

  const shuffledScenarioChoices = useMemo(() => {
    if (currentQuestion.style !== 'scenario_sign') return [];
    return deterministicShuffle(currentQuestion.choices, sessionSeed + questionIndex + 37);
  }, [currentQuestion, questionIndex, sessionSeed]);

  const shuffledWordBank = useMemo(() => {
    if (currentQuestion.style !== 'rule_builder') return [];
    const usedWords = new Set(Object.values(filledBlanks));
    const all = deterministicShuffle(currentQuestion.wordBank, sessionSeed + questionIndex + 53);
    return all.filter(w => !usedWords.has(w));
  }, [currentQuestion, filledBlanks, questionIndex, sessionSeed]);

  const shuffledOddSigns = useMemo(() => {
    if (currentQuestion.style !== 'odd_sign_out') return [];
    return deterministicShuffle(currentQuestion.signs, sessionSeed + questionIndex + 71);
  }, [currentQuestion, questionIndex, sessionSeed]);

  const shuffledRiddleChoices = useMemo(() => {
    if (currentQuestion.style !== 'sign_riddle') return [];
    return deterministicShuffle(currentQuestion.choices, sessionSeed + questionIndex + 89);
  }, [currentQuestion, questionIndex, sessionSeed]);

  // Trigger error feedback — ALWAYS clear stale selection/drag state so the game NEVER locks up!
  const triggerWrongDrop = useCallback(
    (targetKey: string, message: string, wrongItem?: string) => {
      playMp3?.('/click.mp3');
      setStreak(0);
      setWrongDrops(w => w + 1);
      onAnswerRecorded?.(false, 0);
      setSelectedPayload(null);
      setDraggingPayload(null);
      setHoverTargetKey(null);
      setShakeTargetKey(targetKey);
      if (wrongItem) {
        setWrongPreview({ targetKey, payload: wrongItem });
      }
      setFeedbackBanner({ type: 'error', text: message });
      window.setTimeout(() => {
        setShakeTargetKey(prev => (prev === targetKey ? null : prev));
      }, 520);
      window.setTimeout(() => {
        setWrongPreview(prev => (prev && prev.targetKey === targetKey ? null : prev));
      }, 1400);
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
    setHoverTargetKey(null);
    setWrongPreview(null);
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
            : 'Bu levha bu kutuya uymuyor, tekrar dene!',
          payload
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
          `Dikkat! "${signInfo.shortName}" bir ${signInfo.shapeLabel} levhadır. Şekline göre doğru kutuyu seç!`,
          payload
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
            : 'Bu levha hikâyeye uymuyor, tekrar dene!',
          payload
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
          `"${payload}" sözcüğü bu boşluğa uymuyor. Cümleyi baştan okuyup tekrar dene!`,
          payload
        );
      }
    },
    [currentQuestion, isCurrentSolved, filledBlanks, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePickOddSign = useCallback(
    (payload: string | null) => {
      if (!payload || currentQuestion.style !== 'odd_sign_out' || isCurrentSolved) return;
      const signId = payload as TrafficSignId;
      if (signId === currentQuestion.oddSignId) {
        setFoundOddSign(signId);
        triggerCorrectDrop();
      } else {
        const pickedInfo = TRAFFIC_SIGNS[signId];
        triggerWrongDrop(
          `odd-${signId}`,
          pickedInfo
            ? `"${pickedInfo.shortName}" (${pickedInfo.shapeLabel}) diğerleriyle aynı grupta! ${currentQuestion.wrongGroupReason}`
            : currentQuestion.wrongGroupReason,
          payload
        );
      }
    },
    [currentQuestion, isCurrentSolved, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePickTrueFalse = useCallback(
    (choice: boolean) => {
      if (currentQuestion.style !== 'true_false_check' || isCurrentSolved) return;
      if (choice === currentQuestion.isTrue) {
        setAnsweredTrueFalse(choice);
        triggerCorrectDrop();
      } else {
        triggerWrongDrop(
          choice ? 'tf-true' : 'tf-false',
          currentQuestion.wrongFeedback
        );
      }
    },
    [currentQuestion, isCurrentSolved, triggerCorrectDrop, triggerWrongDrop]
  );

  const handlePickRiddleSign = useCallback(
    (payload: string | null) => {
      if (!payload || currentQuestion.style !== 'sign_riddle' || isCurrentSolved) return;
      const signId = payload as TrafficSignId;
      if (signId === currentQuestion.correctSignId) {
        setSolvedRiddleSign(signId);
        triggerCorrectDrop();
      } else {
        const pickedInfo = TRAFFIC_SIGNS[signId];
        triggerWrongDrop(
          'riddle-box',
          pickedInfo
            ? `Seçtiğin levha "${pickedInfo.shortName}" (${pickedInfo.shapeLabel}). Üç ipucunu birlikte kontrol et!`
            : 'İpuçlarına uymuyor, tekrar dene!',
          payload
        );
      }
    },
    [currentQuestion, isCurrentSolved, triggerCorrectDrop, triggerWrongDrop]
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
    } else if (currentQuestion.style === 'odd_sign_out') {
      const oddInfo = TRAFFIC_SIGNS[currentQuestion.oddSignId];
      setFeedbackBanner({
        type: 'hint',
        text: `İpucu: Farklı olan levha ${oddInfo.shapeLabel} şeklindedir (${TRAFFIC_CATEGORIES[oddInfo.category].shortTitle}).`
      });
    } else if (currentQuestion.style === 'true_false_check') {
      const signInfo = TRAFFIC_SIGNS[currentQuestion.signId];
      setFeedbackBanner({
        type: 'hint',
        text: `İpucu: Bu levha "${signInfo.name}" levhasıdır (${signInfo.shapeLabel}). Şimdi cümleyi tekrar oku!`
      });
    } else if (currentQuestion.style === 'sign_riddle') {
      const info = TRAFFIC_SIGNS[currentQuestion.correctSignId];
      setFeedbackBanner({
        type: 'hint',
        text: `İpucu: Aradığımız levha "${info.shapeLabel}" grubundan ve adı "${info.shortName}"!`
      });
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
    const prevIds = questions.map(q => q.id);
    setQuestions(buildTrafikSessionQuestions(25, prevIds));
    setSessionSeed(Math.floor(Math.random() * 100000));
    setQuestionIndex(0);
    setCompletedIds([]);
    setScore(0);
    setStreak(0);
    setCorrectDrops(0);
    setWrongDrops(0);
    setShowVictoryModal(false);
    resetQuestionBoard();
  };

  // Drag helper handlers — clear selection on dragEnd so dropped/cancelled drags never stick
  const startDrag = (e: React.DragEvent, payload: string) => {
    setWrongPreview(null);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPayload(payload);
  };

  const endDrag = () => {
    setDraggingPayload(null);
    setHoverTargetKey(null);
    setSelectedPayload(null);
  };

  const readDropPayload = (e: React.DragEvent): string | null => {
    let dt = '';
    try {
      dt = e.dataTransfer.getData('text/plain');
    } catch {
      dt = '';
    }
    return dt || draggingPayload || selectedPayload;
  };

  const styleMeta = QUESTION_STYLE_LABELS[currentQuestion.style];
  const progressPercent = Math.round(((completedIds.length) / totalQuestions) * 100);
  const accuracy = correctDrops + wrongDrops > 0 ? Math.round((correctDrops / (correctDrops + wrongDrops)) * 100) : 100;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] md:top-[68px] z-30 flex flex-col overflow-hidden select-none bg-slate-100">
      {/* Bright Daylight Primary-School Traffic Street Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-slate-100 overflow-hidden">
        <img
          src={trafikCaddeBg}
          alt="İlkokul önü trafik kavşağı, yaya geçidi ve bisiklet yolu arka planı"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-55"
        />
        {/* Soft luminous light-gray / white veil so the street feels bright and airy */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-slate-100/65 to-slate-200/75" />
      </div>

      {/* ─── TOP CONTROL BAR ─── */}
      <div className="relative z-20 shrink-0 px-2 sm:px-4 pt-2 pb-1.5">
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-md shadow-slate-900/10 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Navigation & Title */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onPrevActivity && (
              <button
                type="button"
                onClick={onPrevActivity}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                title="Önceki Etkinlik"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1 transition cursor-pointer"
              title="2. Sınıf Hayat Bilgisi Menüsüne Dön"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Geri</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-amber-600 border border-slate-300 hover:border-amber-300 transition cursor-pointer"
              title="Ana Sayfa"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {onNextActivity && (
              <button
                type="button"
                onClick={onNextActivity}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                title="Sonraki Etkinlik"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="pl-2 border-l border-slate-300 hidden md:block">
              <div className="text-[11px] font-bold tracking-wide text-sky-700 leading-none">
                2. Sınıf Hayat Bilgisi · Sürükle-Bırak
              </div>
              <div className="text-sm lg:text-base font-black text-slate-900 leading-tight mt-0.5">
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
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 border border-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
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
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 text-slate-900 font-black text-xs sm:text-sm tabular-nums flex items-center gap-1.5 transition cursor-pointer"
              title="Tüm Soruları Gör"
            >
              <Grid className="w-3.5 h-3.5 text-sky-600" />
              <span>
                Soru {questionIndex + 1} / {totalQuestions}
              </span>
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={questionIndex === totalQuestions - 1 && !isCurrentSolved}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 border border-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
              title="Sonraki Soru"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Stats + Guide + Hint + Shuffle/Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 font-black text-xs sm:text-sm tabular-nums flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{score}</span>
              {streak >= 2 && (
                <span className="ml-1 text-[11px] text-emerald-700">×{streak}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setShowGuideModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Levha Rehberi</span>
            </button>

            <button
              type="button"
              onClick={handleShowHint}
              disabled={isCurrentSolved}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1 shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
              title="İpucu Göster"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden md:inline">İpucu</span>
            </button>

            <button
              type="button"
              onClick={handleRestartAll}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-1 transition cursor-pointer"
              title="Yeni Karışık Sorularla Baştan Başla"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden lg:inline">Yeni Set</span>
            </button>

            <button
              type="button"
              onClick={handleRestartAll}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white border border-slate-300 hover:border-rose-600 transition cursor-pointer"
              title="Karışık Baştan Başla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slim progress strip */}
        <div className="max-w-6xl mx-auto mt-1.5 flex items-center gap-2 px-1">
          <div className="flex-1 h-2.5 bg-white/95 rounded-full overflow-hidden border border-slate-300 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, Math.round(((questionIndex + 1) / totalQuestions) * 100))}%` }}
            />
          </div>
          <span className="text-[11px] font-extrabold text-slate-800 bg-white/90 border border-slate-300 rounded-lg px-2 py-0.5 tabular-nums shrink-0 shadow-xs">
            Tamamlanan: {completedIds.length}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* ─── MAIN ACTIVITY STAGE ─── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-2 sm:px-4 pb-3 pt-1">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          {/* Question Header Card (Crisp White Frame) */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl px-4 py-3 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black tracking-wide ${styleMeta.accent}`}>
                  {styleMeta.label}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600">
                  Sürükle-bırak veya önce karta, sonra hedef kutuya dokun
                </span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 mt-0.5 leading-snug">
                {questionIndex + 1}. {currentQuestion.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                {currentQuestion.instruction}
              </p>
            </div>

            {selectedPayload && !isCurrentSolved && (
              <div className="shrink-0 bg-sky-50 border-2 border-sky-400 rounded-xl px-3 py-1.5 text-sky-900 text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>Seçili — hedef kutuya dokun!</span>
              </div>
            )}
          </div>

          {/* Feedback Banner (Error or Hint) */}
          {feedbackBanner && !isCurrentSolved && (
            <div
              className={`rounded-xl px-4 py-2.5 border-2 font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm ${
                feedbackBanner.type === 'error'
                  ? 'bg-rose-50 border-rose-400 text-rose-900'
                  : 'bg-amber-50 border-amber-400 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackBanner.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{feedbackBanner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="p-1 rounded-lg hover:bg-black/5 text-slate-600 cursor-pointer"
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
              <div className="lg:col-span-4 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-md shadow-slate-900/5">
                <div>
                  <div className="text-xs font-black tracking-wide text-sky-700 mb-2.5">
                    Sürüklenecek Levhalar ({shuffledMatchSigns.length})
                  </div>

                  {shuffledMatchSigns.length === 0 ? (
                    <div className="py-8 text-center rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 font-black text-sm flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
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
                            className={`cursor-grab active:cursor-grabbing rounded-2xl p-2.5 sm:p-3 border-2 transition-all flex flex-col lg:flex-row items-center gap-2.5 shadow-xs ${
                              isSelected
                                ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 scale-[1.02]'
                                : 'bg-slate-50 hover:bg-white border-slate-300 hover:border-sky-400'
                            }`}
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                              <TrafficSignSvg signId={signId} className="w-full h-full" />
                            </div>
                            <div className="text-center lg:text-left">
                              <div className="text-xs sm:text-sm font-black text-slate-900">
                                Sürükle veya Seç
                              </div>
                              <div className="text-[11px] font-bold text-sky-700 mt-0.5">
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
                        e.stopPropagation();
                        setHoverTargetKey(null);
                        handlePlaceOnMatchSlot(idx, readDropPayload(e));
                      }}
                      onClick={() => {
                        if (wrongPreview?.targetKey === targetKey) {
                          setWrongPreview(null);
                          setFeedbackBanner(null);
                          return;
                        }
                        if (!placed && selectedPayload) {
                          handlePlaceOnMatchSlot(idx, selectedPayload);
                        }
                      }}
                      className={`rounded-2xl p-3 sm:p-4 border-2 transition-all flex items-center gap-3 sm:gap-4 shadow-md shadow-slate-900/5 ${
                        placed
                          ? 'bg-emerald-50 border-emerald-500'
                          : isShaking || wrongPreview?.targetKey === targetKey
                          ? 'bg-rose-50 border-rose-400 cursor-pointer'
                          : isHovered
                          ? 'bg-sky-50 border-sky-500 scale-[1.01]'
                          : selectedPayload
                          ? 'bg-white border-sky-400 cursor-pointer hover:bg-sky-50/70'
                          : 'bg-white/95 border-slate-300'
                      }`}
                    >
                      {/* Drop box */}
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 flex items-center justify-center border-2 transition-all relative ${
                          placed
                            ? 'bg-white p-1.5 border-emerald-500 shadow-sm'
                            : wrongPreview?.targetKey === targetKey
                            ? 'bg-white p-1.5 border-rose-500 ring-2 ring-rose-300'
                            : isHovered
                            ? 'bg-sky-100 border-dashed border-sky-500'
                            : 'bg-slate-100 border-dashed border-slate-400'
                        }`}
                      >
                        {placed ? (
                          <TrafficSignSvg signId={placed} className="w-full h-full" />
                        ) : wrongPreview?.targetKey === targetKey ? (
                          <>
                            <TrafficSignSvg signId={wrongPreview.payload as TrafficSignId} className="w-full h-full opacity-75" />
                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">✕</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-black text-slate-500 text-center px-1 leading-tight">
                            LEVHAYI BIRAK
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-tight">
                            {pair.targetLabel}
                          </h3>
                          {placed && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        </div>
                        {pair.targetSub && (
                          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
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
              <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-3 sm:p-4 shadow-md shadow-slate-900/5">
                <div className="text-xs font-black tracking-wide text-amber-700 mb-2.5">
                  Gruplandırılacak Levhalar ({shuffledSortSigns.length})
                </div>

                {shuffledSortSigns.length === 0 ? (
                  <div className="py-4 text-center rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 font-black text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
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
                          className={`cursor-grab active:cursor-grabbing rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 w-32 sm:w-36 shadow-xs ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 scale-105'
                              : 'bg-slate-50 hover:bg-white border-slate-300 hover:border-amber-400'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                            <TrafficSignSvg signId={signId} className="w-full h-full" />
                          </div>
                          <span className="text-xs font-black text-slate-900 text-center leading-tight">
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
                      className={`rounded-2xl border-2 overflow-hidden flex flex-col min-h-[190px] shadow-md shadow-slate-900/5 transition-all ${
                        isShaking
                          ? 'bg-rose-50 border-rose-400 translate-x-1'
                          : isHovered
                          ? 'bg-sky-50 border-sky-500 scale-[1.01]'
                          : selectedPayload
                          ? `bg-white ${meta.borderColor} cursor-pointer hover:bg-slate-50`
                          : `bg-white/95 ${meta.borderColor}`
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
                        <p className="text-xs font-semibold text-slate-600 leading-snug">
                          {meta.summary}
                        </p>

                        {placedSigns.length === 0 ? (
                          <div className="flex-1 min-h-[76px] rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-xs font-black text-slate-500 text-center px-2">
                            Levhaları buraya bırak
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 justify-center bg-emerald-50/70 rounded-xl p-2 border border-emerald-300">
                            {placedSigns.map(sId => (
                              <div
                                key={sId}
                                className="flex flex-col items-center gap-1 bg-white border border-emerald-400 rounded-xl p-1.5 w-20 shadow-xs"
                              >
                                <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center">
                                  <TrafficSignSvg signId={sId} className="w-full h-full" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-900 text-center leading-tight line-clamp-2">
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
              <div className="lg:col-span-7 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide text-emerald-700">
                    <span>📍 {currentQuestion.sceneHint}</span>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-relaxed">
                    {currentQuestion.scenario}
                  </p>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2">
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
                      e.stopPropagation();
                      setHoverTargetKey(null);
                      handlePlaceOnSignpost(readDropPayload(e));
                    }}
                    onClick={() => {
                      if (wrongPreview?.targetKey === 'signpost') {
                        setWrongPreview(null);
                        setFeedbackBanner(null);
                        return;
                      }
                      if (!placedScenarioSign && selectedPayload) {
                        handlePlaceOnSignpost(selectedPayload);
                      }
                    }}
                    className={`w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 flex flex-col items-center justify-center transition-all shadow-lg relative ${
                      placedScenarioSign
                        ? 'bg-white p-2.5 border-emerald-500 scale-105'
                        : shakeTargetKey === 'signpost' || wrongPreview?.targetKey === 'signpost'
                        ? 'bg-white p-2.5 border-rose-500 ring-4 ring-rose-300 cursor-pointer'
                        : hoverTargetKey === 'signpost'
                        ? 'bg-sky-50 border-dashed border-sky-500 scale-105'
                        : selectedPayload
                        ? 'bg-sky-50/70 border-dashed border-sky-500 cursor-pointer hover:bg-sky-100'
                        : 'bg-slate-100 border-dashed border-amber-500'
                    }`}
                  >
                    {placedScenarioSign ? (
                      <TrafficSignSvg signId={placedScenarioSign} className="w-full h-full" />
                    ) : wrongPreview?.targetKey === 'signpost' ? (
                      <>
                        <TrafficSignSvg signId={wrongPreview.payload as TrafficSignId} className="w-full h-full opacity-75" />
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black border-2 border-white shadow">Yanlış ✕</span>
                      </>
                    ) : (
                      <div className="text-center px-3">
                        <div className="text-2xl mb-1">🪧</div>
                        <div className="text-xs font-black text-amber-700 uppercase leading-tight">
                          LEVHAYI BURAYA TAK
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Metal pole & curb base */}
                  <div className="w-3.5 h-16 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-x border-slate-500" />
                  <div className="w-24 h-3.5 rounded-t-lg bg-slate-500 border-t-2 border-slate-300" />
                </div>
              </div>

              {/* 4 Draggable Sign Choices */}
              <div className="lg:col-span-5 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-3 sm:p-4 shadow-md shadow-slate-900/5 flex flex-col justify-center">
                <div className="text-xs font-black tracking-wide text-sky-700 mb-2.5">
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
                        className={`rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 shadow-xs ${
                          isPlacedCorrect
                            ? 'bg-emerald-50 border-emerald-500 opacity-85'
                            : isCurrentSolved
                            ? 'bg-slate-100 border-slate-200 opacity-50'
                            : isSelected
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 scale-[1.03] cursor-grab'
                            : 'bg-slate-50 hover:bg-white border-slate-300 hover:border-emerald-500 cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                          <TrafficSignSvg signId={signId} className="w-full h-full" />
                        </div>
                        <span className="text-xs font-black text-slate-800 text-center leading-tight">
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
              <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-md shadow-slate-900/5 flex flex-col items-center gap-4">
                {/* Preview signs */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentQuestion.previewSigns.map(sId => (
                    <div
                      key={sId}
                      className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1.5"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        <TrafficSignSvg signId={sId} className="w-full h-full" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-slate-900 leading-tight">
                          {TRAFFIC_SIGNS[sId].shortName}
                        </div>
                        <div className="text-[11px] font-bold text-slate-600">
                          {TRAFFIC_SIGNS[sId].shapeLabel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sentence with inline drop blanks */}
                <div className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 sm:p-6 text-center text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-[2.3] flex flex-wrap items-center justify-center gap-y-2">
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
                              e.stopPropagation();
                              setHoverTargetKey(null);
                              handlePlaceOnBlank(blank.id, readDropPayload(e));
                            }}
                            onClick={() => {
                              if (wrongPreview?.targetKey === targetKey) {
                                setWrongPreview(null);
                                setFeedbackBanner(null);
                                return;
                              }
                              if (!filledWord && selectedPayload) {
                                handlePlaceOnBlank(blank.id, selectedPayload);
                              }
                            }}
                            className={`inline-flex items-center justify-center min-w-[125px] sm:min-w-[150px] min-h-[38px] sm:min-h-[44px] px-3 py-1 mx-1.5 rounded-xl border-2 text-base sm:text-xl font-black transition-all align-middle ${
                              filledWord
                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                                : isShaking || wrongPreview?.targetKey === targetKey
                                ? 'bg-rose-100 border-rose-500 text-rose-900 cursor-pointer'
                                : isHovered
                                ? 'bg-sky-100 border-sky-500 text-sky-900 scale-105'
                                : selectedPayload
                                ? 'bg-sky-50 border-sky-500 text-sky-900 cursor-pointer shadow-xs'
                                : 'bg-fuchsia-50 border-fuchsia-500 text-transparent shadow-xs'
                            }`}
                          >
                            {filledWord || (wrongPreview?.targetKey === targetKey ? `${wrongPreview.payload} ✕` : '\u00A0')}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Word Chip Tray */}
              <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 shadow-md shadow-slate-900/5">
                <div className="text-xs font-black tracking-wide text-fuchsia-700 mb-3 text-center">
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
                        className={`px-5 py-3 rounded-2xl border-2 font-black text-base sm:text-lg transition-all shadow-xs ${
                          isCurrentSolved
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            : isSelected
                            ? 'bg-sky-600 border-sky-700 text-white ring-2 ring-sky-300 scale-105 cursor-grab'
                            : 'bg-slate-50 hover:bg-white border-fuchsia-400 hover:border-sky-500 text-slate-900 cursor-grab active:cursor-grabbing'
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 5: ODD SIGN OUT (4 Signs -> Tap or Drag the Odd One Out)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'odd_sign_out' && (
            <div className="flex flex-col gap-3">
              {/* Top Detective Hint + Drop Target */}
              <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide text-cyan-700">
                    <Search className="w-4 h-4" />
                    <span>Grup Dedektifi</span>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-snug">
                    {currentQuestion.groupRuleHint}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Farklı olan levhaya doğrudan dokunabilir veya sağdaki kutuya sürükleyebilirsin.
                  </p>
                </div>

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    if (!foundOddSign) setHoverTargetKey('odd-drop');
                  }}
                  onDragLeave={() => setHoverTargetKey(prev => (prev === 'odd-drop' ? null : prev))}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoverTargetKey(null);
                    handlePickOddSign(readDropPayload(e));
                  }}
                  onClick={() => {
                    if (!foundOddSign && selectedPayload) {
                      handlePickOddSign(selectedPayload);
                    }
                  }}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-4 shrink-0 flex flex-col items-center justify-center transition-all shadow-md ${
                    foundOddSign
                      ? 'bg-white p-2.5 border-emerald-500 scale-105'
                      : hoverTargetKey === 'odd-drop'
                      ? 'bg-cyan-50 border-dashed border-cyan-500 scale-105'
                      : 'bg-slate-100 border-dashed border-cyan-500'
                  }`}
                >
                  {foundOddSign ? (
                    <TrafficSignSvg signId={foundOddSign} className="w-full h-full" />
                  ) : (
                    <div className="text-center px-2">
                      <Search className="w-7 h-7 text-cyan-700 mx-auto mb-1" />
                      <div className="text-[11px] font-black text-cyan-800 uppercase leading-tight">
                        FARKLI LEVHA
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Sign Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shuffledOddSigns.map(signId => {
                  const isSolvedCard = foundOddSign === signId;
                  const isShaking = shakeTargetKey === `odd-${signId}`;
                  const info = TRAFFIC_SIGNS[signId];
                  return (
                    <button
                      key={signId}
                      type="button"
                      draggable={!isCurrentSolved}
                      onDragStart={e => !isCurrentSolved && startDrag(e, signId)}
                      onDragEnd={endDrag}
                      onClick={() => handlePickOddSign(signId)}
                      disabled={isCurrentSolved}
                      className={`rounded-2xl p-3 sm:p-4 border-2 transition-all flex flex-col items-center gap-2.5 shadow-md shadow-slate-900/5 cursor-pointer disabled:cursor-default ${
                        isSolvedCard
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 scale-[1.03]'
                          : isShaking
                          ? 'bg-rose-50 border-rose-400 scale-95'
                          : isCurrentSolved
                          ? 'bg-slate-100 border-slate-200 opacity-55'
                          : 'bg-white/95 hover:bg-sky-50/70 border-slate-300 hover:border-cyan-500 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs">
                        <TrafficSignSvg signId={signId} className="w-full h-full" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-black text-slate-900 leading-tight">{info.shortName}</div>
                        <div className="text-[11px] font-bold text-slate-600 mt-0.5">{info.shapeLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 6: TRUE / FALSE CHECK (Big Sign + Statement -> D / Y)    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'true_false_check' && (
            <div className="flex flex-col gap-3">
              {/* Sign + Statement Card */}
              <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row items-center gap-5">
                <div
                  draggable={!isCurrentSolved}
                  onDragStart={e => !isCurrentSolved && startDrag(e, currentQuestion.signId)}
                  onDragEnd={endDrag}
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-3 flex items-center justify-center shrink-0 shadow-md border-2 border-slate-300 ${
                    !isCurrentSolved ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition' : ''
                  }`}
                >
                  <TrafficSignSvg signId={currentQuestion.signId} className="w-full h-full" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide text-rose-700">
                    <span>🔍 Bu ifade doğru mu, yanlış mı?</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                    “{currentQuestion.statement}”
                  </p>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600">
                    Aşağıdan <strong className="text-emerald-700">DOĞRU</strong> ya da{' '}
                    <strong className="text-rose-700">YANLIŞ</strong> kutusuna dokun (veya levhayı sürükle)!
                  </div>
                </div>
              </div>

              {/* True / False Interactive Buttons & Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePickTrueFalse(true)}
                  onDragOver={e => {
                    e.preventDefault();
                    if (!isCurrentSolved) setHoverTargetKey('tf-true');
                  }}
                  onDragLeave={() => setHoverTargetKey(prev => (prev === 'tf-true' ? null : prev))}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoverTargetKey(null);
                    handlePickTrueFalse(true);
                  }}
                  disabled={isCurrentSolved}
                  className={`rounded-2xl p-5 sm:p-6 border-2 transition-all flex items-center justify-center gap-3 shadow-md shadow-slate-900/5 cursor-pointer disabled:cursor-default ${
                    answeredTrueFalse === true
                      ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-300 scale-[1.02]'
                      : shakeTargetKey === 'tf-true'
                      ? 'bg-rose-50 border-rose-500 scale-95'
                      : hoverTargetKey === 'tf-true'
                      ? 'bg-emerald-100 border-emerald-500 scale-[1.02]'
                      : isCurrentSolved
                      ? 'bg-slate-100 border-slate-200 opacity-55'
                      : 'bg-white/95 hover:bg-emerald-50 border-emerald-400 hover:border-emerald-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div className="text-left">
                    <div className={`text-xl sm:text-2xl font-black ${answeredTrueFalse === true ? 'text-white' : 'text-emerald-950'}`}>
                      DOĞRU
                    </div>
                    <div className={`text-xs font-bold ${answeredTrueFalse === true ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      Bu bilgi levha ile uyuşuyor
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePickTrueFalse(false)}
                  onDragOver={e => {
                    e.preventDefault();
                    if (!isCurrentSolved) setHoverTargetKey('tf-false');
                  }}
                  onDragLeave={() => setHoverTargetKey(prev => (prev === 'tf-false' ? null : prev))}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoverTargetKey(null);
                    handlePickTrueFalse(false);
                  }}
                  disabled={isCurrentSolved}
                  className={`rounded-2xl p-5 sm:p-6 border-2 transition-all flex items-center justify-center gap-3 shadow-md shadow-slate-900/5 cursor-pointer disabled:cursor-default ${
                    answeredTrueFalse === false
                      ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-300 scale-[1.02]'
                      : shakeTargetKey === 'tf-false'
                      ? 'bg-rose-100 border-rose-500 scale-95'
                      : hoverTargetKey === 'tf-false'
                      ? 'bg-rose-100 border-rose-500 scale-[1.02]'
                      : isCurrentSolved
                      ? 'bg-slate-100 border-slate-200 opacity-55'
                      : 'bg-white/95 hover:bg-rose-50 border-rose-400 hover:border-rose-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                    <XCircle className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <div className={`text-xl sm:text-2xl font-black ${answeredTrueFalse === false ? 'text-white' : 'text-rose-950'}`}>
                      YANLIŞ
                    </div>
                    <div className={`text-xs font-bold ${answeredTrueFalse === false ? 'text-emerald-100' : 'text-rose-700'}`}>
                      Bu bilgi levha için doğru değil
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STYLE 7: SIGN RIDDLE (3 Clues + Magnifier Box + 4 Sign Cards)   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentQuestion.style === 'sign_riddle' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Clues & Detective Box */}
              <div className="lg:col-span-7 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full space-y-2.5">
                  <div className="text-xs font-black tracking-wide text-violet-700 flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    <span>Gizli Levhanın 3 İpucu</span>
                  </div>
                  {currentQuestion.clues.map((clue, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                    >
                      <span className="px-2 py-0.5 rounded-lg bg-violet-600 text-white text-[11px] font-black uppercase shrink-0">
                        {clue.label}
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {clue.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Magnifier Drop Box */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    if (!solvedRiddleSign) setHoverTargetKey('riddle-box');
                  }}
                  onDragLeave={() => setHoverTargetKey(prev => (prev === 'riddle-box' ? null : prev))}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoverTargetKey(null);
                    handlePickRiddleSign(readDropPayload(e));
                  }}
                  onClick={() => {
                    if (wrongPreview?.targetKey === 'riddle-box') {
                      setWrongPreview(null);
                      setFeedbackBanner(null);
                      return;
                    }
                    if (!solvedRiddleSign && selectedPayload) {
                      handlePickRiddleSign(selectedPayload);
                    }
                  }}
                  className={`w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 shrink-0 flex flex-col items-center justify-center transition-all shadow-lg relative ${
                    solvedRiddleSign
                      ? 'bg-white p-2.5 border-emerald-500 scale-105'
                      : shakeTargetKey === 'riddle-box' || wrongPreview?.targetKey === 'riddle-box'
                      ? 'bg-white p-2.5 border-rose-500 ring-4 ring-rose-300 cursor-pointer'
                      : hoverTargetKey === 'riddle-box'
                      ? 'bg-violet-50 border-dashed border-violet-500 scale-105'
                      : 'bg-slate-100 border-dashed border-violet-400'
                  }`}
                >
                  {solvedRiddleSign ? (
                    <TrafficSignSvg signId={solvedRiddleSign} className="w-full h-full" />
                  ) : wrongPreview?.targetKey === 'riddle-box' ? (
                    <>
                      <TrafficSignSvg
                        signId={wrongPreview.payload as TrafficSignId}
                        className="w-full h-full opacity-75"
                      />
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black border-2 border-white shadow">
                        Yanlış ✕
                      </span>
                    </>
                  ) : (
                    <div className="text-center px-3">
                      <Search className="w-8 h-8 text-violet-600 mx-auto mb-1" />
                      <div className="text-xs font-black text-violet-800 uppercase leading-tight">
                        GİZLİ LEVHAYI BUL
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Choice Signs (Click directly OR Drag into Magnifier) */}
              <div className="lg:col-span-5 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl p-3 sm:p-4 shadow-md shadow-slate-900/5 flex flex-col justify-center">
                <div className="text-xs font-black tracking-wide text-violet-700 mb-2.5">
                  Doğru Levhaya Dokun veya Büyütece Sürükle
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {shuffledRiddleChoices.map(signId => {
                    const isSolved = solvedRiddleSign === signId;
                    return (
                      <button
                        key={signId}
                        type="button"
                        draggable={!isCurrentSolved}
                        onDragStart={e => !isCurrentSolved && startDrag(e, signId)}
                        onDragEnd={endDrag}
                        onClick={() => handlePickRiddleSign(signId)}
                        disabled={isCurrentSolved}
                        className={`rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-default ${
                          isSolved
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300'
                            : isCurrentSolved
                            ? 'bg-slate-100 border-slate-200 opacity-50'
                            : 'bg-slate-50 hover:bg-white border-slate-300 hover:border-violet-500 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                          <TrafficSignSvg signId={signId} className="w-full h-full" />
                        </div>
                        <span className="text-xs font-black text-slate-800 text-center leading-tight">
                          {TRAFFIC_SIGNS[signId].shapeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── SOLVED / AKILDA KALSIN MICRO-FEEDBACK & NEXT CTA ─── */}
          {isCurrentSolved && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-wide text-emerald-800">
                    Harika! Doğru Tamamladın · Akılda Kalsın
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {currentQuestion.fact}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="shrink-0 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
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

      {/* ─── QUESTION MAP MODAL (1–25 Quick Jump) ─── */}
      {showQuestionMap && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-2xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">{totalQuestions} Karışık Soru Haritası</h3>
                <p className="text-xs font-semibold text-slate-600">
                  Her oturumda 7 farklı türden yeni ve karışık sorular hazırlanır.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionMap(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 py-4 overflow-y-auto">
              {questions.map((q, idx) => {
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
                        ? 'bg-sky-600 border-sky-700 text-white shadow-md scale-105'
                        : done
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="text-sm font-black tabular-nums">{idx + 1}</span>
                    <span className="text-[9px] font-bold opacity-85 truncate max-w-full">
                      {QUESTION_STYLE_LABELS[q.style].shortMapLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEVHA REHBERİ MODAL (Clean Bright Visual Poster) ─── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-5 py-3.5 flex items-center justify-between gap-2 shrink-0">
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
                className="p-2 rounded-xl bg-white/20 hover:bg-rose-600 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50">
              {(['bilgi', 'uyari', 'yasak', 'mecburi'] as TrafficCategoryId[]).map(catId => {
                const cat = TRAFFIC_CATEGORIES[catId];
                const signs = TRAFFIC_SIGN_LIST.filter(s => s.category === catId);
                return (
                  <div key={catId} className={`rounded-2xl border-2 ${cat.borderColor} bg-white overflow-hidden shadow-xs`}>
                    <div className={`bg-gradient-to-r ${cat.headerBg} px-4 py-2 flex items-center justify-between`}>
                      <span className="font-black text-sm sm:text-base text-white">{cat.title}</span>
                      <span className="text-xs font-extrabold text-white/95 uppercase">{cat.shapeHint}</span>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {signs.map(sign => (
                        <div
                          key={sign.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <TrafficSignSvg signId={sign.id} className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-sm text-slate-900 leading-tight">{sign.name}</div>
                            <p className="text-xs font-medium text-slate-600 mt-0.5 leading-snug">
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
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5">
                  <div className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Önemli Ayrım</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    Mavi geçit levhaları yayalara bilgi verir; kırmızı üçgen geçit levhaları sürücüleri uyarır.
                  </p>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3.5">
                  <div className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Akılda Kalsın</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1 leading-snug">
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
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Tebrikler Trafik Kahramanı!</h3>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Trafik İşaret Levhaları etkinliğini harika bir şekilde tamamladın!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Puan</div>
                <div className="text-xl font-black text-amber-600 tabular-nums">{score}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Soru</div>
                <div className="text-xl font-black text-emerald-600 tabular-nums">
                  {completedIds.length}/{totalQuestions}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Başarı</div>
                <div className="text-xl font-black text-sky-600 tabular-nums">%{accuracy}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRestartAll}
                className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-md cursor-pointer transition"
              >
                Tekrar Oyna
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-black text-sm cursor-pointer transition"
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
