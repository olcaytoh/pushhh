import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  BILSEM_ACTIVITIES,
  BilsemActivityId,
  BilsemGrade,
  generateFreshBilsemSeed,
  getActivitiesForGrade,
  getMemoryRoundsForGrade,
  getQuizQuestionsForGrade,
  getScanRoundsForGrade,
  getSpotOddRoundsForGrade,
  normalizeBilsemGrade,
} from '../data/bilsemActivitiesData';
import {
  BilsemOptionVisual,
  BilsemQuestionVisual,
  ShapeGlyph,
  SpotOddCardSVG,
} from './BilsemVisualEngine';
import { ActivityBackground } from './ActivityBackground';
import { StudentAvatarDock } from './StudentAvatarDock';
import { Student } from '../types/student';

interface BilsemGameModalProps {
  activityId: BilsemActivityId;
  bilsemGrade?: BilsemGrade;
  onClose: () => void;
  onGoHome?: () => void;
  onSwitchActivity?: (nextId: BilsemActivityId) => void;
  onCompleted?: (activityId: BilsemActivityId, grade: BilsemGrade) => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  currentGrade?: number;
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerIdx: number, playerCount: number) => void;
}

type ActivityMode = 'quiz' | 'memory' | 'scan' | 'spot_odd';

const getModeForActivity = (id: BilsemActivityId): ActivityMode => {
  switch (id) {
    case 'bilissel_uyarim':
      return 'memory';
    case 'dikkati_guclendirme':
      return 'scan';
    case 'gorsel_ayirt_etme':
      return 'spot_odd';
    default:
      return 'quiz';
  }
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const BilsemGameModal: React.FC<BilsemGameModalProps> = ({
  activityId,
  bilsemGrade,
  onClose,
  onSwitchActivity,
  onCompleted,
  playMp3,
  students = [],
  currentGrade = 2,
  selectedStudentIds = [null, null, null],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const activeGrade: BilsemGrade = normalizeBilsemGrade(bilsemGrade ?? currentGrade);

  const gradeActivities = useMemo(
    () => getActivitiesForGrade(activeGrade),
    [activeGrade]
  );

  const activityMeta = useMemo(
    () =>
      gradeActivities.find((a) => a.id === activityId) ||
      BILSEM_ACTIVITIES.find((a) => a.id === activityId) ||
      BILSEM_ACTIVITIES[0],
    [gradeActivities, activityId]
  );

  const currentMetaIdx = useMemo(
    () => gradeActivities.findIndex((a) => a.id === activityId),
    [gradeActivities, activityId]
  );

  const mode = getModeForActivity(activityId);
  // Her etkinlik açılışında, üst/iç ileri-geri geçişte, sınıf değişiminde ve tekrarda benzersiz yeni seed üretilir.
  const [runSeed, setRunSeed] = useState(0);
  const seedStateRef = useRef<{ sig: string; seed: number } | null>(null);
  const currentSeedSig = `${activityId}:${activeGrade}:${runSeed}`;
  if (!seedStateRef.current || seedStateRef.current.sig !== currentSeedSig) {
    seedStateRef.current = {
      sig: currentSeedSig,
      seed: generateFreshBilsemSeed(),
    };
  }
  const sessionSeed = seedStateRef.current.seed;

  const quizQuestions = useMemo(
    () => (mode === 'quiz' ? getQuizQuestionsForGrade(activityId, activeGrade, sessionSeed) : []),
    [mode, activityId, activeGrade, sessionSeed]
  );
  const memoryRounds = useMemo(
    () => (mode === 'memory' ? getMemoryRoundsForGrade(activeGrade, sessionSeed) : []),
    [mode, activeGrade, sessionSeed]
  );
  const scanRounds = useMemo(
    () => (mode === 'scan' ? getScanRoundsForGrade(activeGrade, sessionSeed) : []),
    [mode, activeGrade, sessionSeed]
  );
  const spotRounds = useMemo(
    () => (mode === 'spot_odd' ? getSpotOddRoundsForGrade(activeGrade, sessionSeed) : []),
    [mode, activeGrade, sessionSeed]
  );

  const totalSteps =
    mode === 'quiz'
      ? quizQuestions.length
      : mode === 'memory'
      ? memoryRounds.length
      : mode === 'scan'
      ? scanRounds.length
      : spotRounds.length;

  // Shared game progress state
  const [stepIndex, setStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [failedByThreeStrikes, setFailedByThreeStrikes] = useState(false);
  const [threeStrikeEnabled, setThreeStrikeEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bilsem_three_strike_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [autoNextSeconds, setAutoNextSeconds] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Quiz state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizOutcome, setQuizOutcome] = useState<'idle' | 'correct' | 'wrong'>('idle');
  // Kısa süreli hafıza (flash_memory) soruları için ezberleme / cevaplama aşaması
  const [flashPhase, setFlashPhase] = useState<'memorize' | 'answer'>('answer');
  const [flashRemainingPct, setFlashRemainingPct] = useState(100);
  const flashIntervalRef = useRef<number | null>(null);

  // Memory matrix state
  const [memoryPhase, setMemoryPhase] = useState<'preview' | 'recall' | 'won' | 'lost'>('preview');
  const [memorySelected, setMemorySelected] = useState<number[]>([]);
  const [memoryWrongCell, setMemoryWrongCell] = useState<number | null>(null);
  const [memoryMistakes, setMemoryMistakes] = useState(0);
  const previewTimerRef = useRef<number | null>(null);
  const threeStrikeTimerRef = useRef<number | null>(null);

  // Target scan state
  const [scanSelected, setScanSelected] = useState<number[]>([]);
  const [scanWrongIdx, setScanWrongIdx] = useState<number | null>(null);
  const [scanCompletedRound, setScanCompletedRound] = useState(false);
  const [scanWarning, setScanWarning] = useState<string | null>(null);

  // Spot-odd state
  const [spotSelectedCardId, setSpotSelectedCardId] = useState<string | null>(null);
  const [spotOutcome, setSpotOutcome] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const clearTimers = () => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (threeStrikeTimerRef.current !== null) {
      window.clearTimeout(threeStrikeTimerRef.current);
      threeStrikeTimerRef.current = null;
    }
    if (flashIntervalRef.current !== null) {
      window.clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
  };

  // Reset all round state cleanly when activity changes or restarted
  const resetRoundStates = () => {
    clearTimers();
    setShowHint(false);
    setSelectedOptionId(null);
    setQuizOutcome('idle');
    setFlashPhase('answer');
    setFlashRemainingPct(100);
    setMemoryPhase('preview');
    setMemorySelected([]);
    setMemoryWrongCell(null);
    setMemoryMistakes(0);
    setScanSelected([]);
    setScanWrongIdx(null);
    setScanCompletedRound(false);
    setScanWarning(null);
    setSpotSelectedCardId(null);
    setSpotOutcome('idle');
  };

  const handleToggleThreeStrike = () => {
    playMp3?.('/op.mp3');
    setThreeStrikeEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bilsem_three_strike_enabled', String(next));
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  const handleRestartActivity = () => {
    playMp3?.('/op.mp3');
    resetRoundStates();
    setStepIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setScore(0);
    setIsFinished(false);
    setFailedByThreeStrikes(false);
    setAutoNextSeconds(null);
    setRunSeed((prev) => prev + 1);
  };

  useEffect(() => {
    resetRoundStates();
    setStepIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setScore(0);
    setIsFinished(false);
    setFailedByThreeStrikes(false);
    setAutoNextSeconds(null);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, activeGrade]);

  // Memory Matrix timer setup for preview phase
  useEffect(() => {
    if (mode !== 'memory' || isFinished) return;
    const round = memoryRounds[stepIndex];
    if (!round) return;

    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
    }
    setMemoryPhase('preview');
    setMemorySelected([]);
    setMemoryWrongCell(null);
    setMemoryMistakes(0);

    previewTimerRef.current = window.setTimeout(() => {
      setMemoryPhase('recall');
      previewTimerRef.current = null;
    }, round.previewMs);

    return () => {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    };
  }, [mode, stepIndex, isFinished, activityId, activeGrade, memoryRounds, runSeed]);

  // Flash-memory (Görsel & Sayısal Hafıza) soruları için süreli gösterim
  useEffect(() => {
    if (flashIntervalRef.current !== null) {
      window.clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    if (mode !== 'quiz' || isFinished) {
      setFlashPhase('answer');
      return;
    }
    const q = quizQuestions[stepIndex];
    if (!q || q.visualType !== 'flash_memory') {
      setFlashPhase('answer');
      return;
    }

    const durationMs =
      (q.visualData?.previewMs ?? 4000) + (activeGrade === 1 ? 700 : 0);
    const startedAt = Date.now();
    setFlashPhase('memorize');
    setFlashRemainingPct(100);

    flashIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setFlashRemainingPct(pct);
      if (elapsed >= durationMs) {
        if (flashIntervalRef.current !== null) {
          window.clearInterval(flashIntervalRef.current);
          flashIntervalRef.current = null;
        }
        setFlashPhase('answer');
      }
    }, 50);

    return () => {
      if (flashIntervalRef.current !== null) {
        window.clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
      }
    };
  }, [mode, stepIndex, isFinished, activityId, activeGrade, quizQuestions, runSeed]);

  const finishActivity = () => {
    setFailedByThreeStrikes(false);
    setIsFinished(true);
    setAutoNextSeconds(onSwitchActivity ? 3 : null);
    playMp3?.('/alkis.mp3');
    onCompleted?.(activityId, activeGrade);
    onGameCompleted?.(0, 1);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignore confetti errors in constrained contexts
    }
  };

  const advanceStep = () => {
    playMp3?.('/op.mp3');
    if (stepIndex + 1 >= totalSteps) {
      finishActivity();
    } else {
      resetRoundStates();
      setStepIndex((prev) => prev + 1);
    }
  };

  const switchNeighborActivity = (delta: number) => {
    if (!onSwitchActivity || gradeActivities.length === 0) return;
    playMp3?.('/op.mp3');
    clearTimers();
    setAutoNextSeconds(null);
    setRunSeed((prev) => prev + 1);
    const baseIdx = currentMetaIdx >= 0 ? currentMetaIdx : 0;
    const nextIdx = (baseIdx + delta + gradeActivities.length) % gradeActivities.length;
    onSwitchActivity(gradeActivities[nextIdx].id);
  };

  // 10 soru tamamlandığında otomatik olarak bir sonraki etkinliğe geç
  useEffect(() => {
    if (!isFinished || failedByThreeStrikes || autoNextSeconds === null || !onSwitchActivity) return;
    if (autoNextSeconds <= 0) {
      switchNeighborActivity(1);
      return;
    }
    const timer = window.setTimeout(() => {
      setAutoNextSeconds((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, failedByThreeStrikes, autoNextSeconds]);

  const registerMistake = () => {
    const nextWrong = wrongCount + 1;
    setWrongCount(nextWrong);
    if (threeStrikeEnabled && nextWrong >= 3) {
      if (threeStrikeTimerRef.current !== null) {
        window.clearTimeout(threeStrikeTimerRef.current);
      }
      threeStrikeTimerRef.current = window.setTimeout(() => {
        setAutoNextSeconds(null);
        setFailedByThreeStrikes(true);
        setIsFinished(true);
        threeStrikeTimerRef.current = null;
      }, 650);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS BY MODE
  // --------------------------------------------------------------------------
  const strikeLocked = threeStrikeEnabled && wrongCount >= 3;

  const handleQuizSelect = (optId: string, isCorrect: boolean) => {
    if (quizOutcome !== 'idle' || strikeLocked) return;
    setSelectedOptionId(optId);
    if (isCorrect) {
      setQuizOutcome('correct');
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 20);
      playMp3?.('/dogru.mp3');
      onQuestionAnswered?.(true, 0);
    } else {
      setQuizOutcome('wrong');
      registerMistake();
      playMp3?.('/yanlis.mp3');
      onQuestionAnswered?.(false, 0);
    }
  };

  const handleMemoryCellClick = (cellIdx: number) => {
    if (memoryPhase !== 'recall' || strikeLocked) return;
    const round = memoryRounds[stepIndex];
    if (!round || memorySelected.includes(cellIdx)) return;

    if (round.targets.includes(cellIdx)) {
      const nextSelected = [...memorySelected, cellIdx];
      setMemorySelected(nextSelected);
      if (nextSelected.length === round.targets.length) {
        setMemoryPhase('won');
        setCorrectCount((c) => c + 1);
        setScore((s) => s + 25);
        playMp3?.('/dogru.mp3');
        onQuestionAnswered?.(true, 0);
      } else {
        playMp3?.('/op.mp3');
      }
    } else {
      setMemoryWrongCell(cellIdx);
      const nextMistakes = memoryMistakes + 1;
      setMemoryMistakes(nextMistakes);
      playMp3?.('/yanlis.mp3');
      if (nextMistakes >= 2) {
        setMemoryPhase('lost');
        registerMistake();
        onQuestionAnswered?.(false, 0);
      }
    }
  };

  const handleMemoryReplayRound = () => {
    if (strikeLocked) return;
    const round = memoryRounds[stepIndex];
    if (!round) return;
    playMp3?.('/op.mp3');
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
    }
    setMemoryPhase('preview');
    setMemorySelected([]);
    setMemoryWrongCell(null);
    setMemoryMistakes(0);
    previewTimerRef.current = window.setTimeout(() => {
      setMemoryPhase('recall');
      previewTimerRef.current = null;
    }, round.previewMs);
  };

  const handleScanItemClick = (idx: number) => {
    if (scanCompletedRound || strikeLocked) return;
    const round = scanRounds[stepIndex];
    if (!round) return;
    const item = round.items[idx];
    if (!item || scanSelected.includes(idx)) return;

    if (item.isTarget) {
      const nextSelected = [...scanSelected, idx];
      setScanSelected(nextSelected);
      setScanWrongIdx(null);
      setScanWarning(null);
      const totalTargets = round.items.filter((x) => x.isTarget).length;
      if (nextSelected.length === totalTargets) {
        setScanCompletedRound(true);
        setCorrectCount((c) => c + 1);
        setScore((s) => s + 25);
        playMp3?.('/dogru.mp3');
        onQuestionAnswered?.(true, 0);
      } else {
        playMp3?.('/op.mp3');
      }
    } else {
      setScanWrongIdx(idx);
      registerMistake();
      setScanWarning('Dikkat! Seçtiğin sembol kurala uymuyor, şekil ve yönünü tekrar incele.');
      playMp3?.('/yanlis.mp3');
      onQuestionAnswered?.(false, 0);
    }
  };

  const handleSpotCardClick = (cardId: string, variant: 'normal' | 'odd') => {
    if (spotOutcome === 'correct' || strikeLocked) return;
    setSpotSelectedCardId(cardId);
    if (variant === 'odd') {
      setSpotOutcome('correct');
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 20);
      playMp3?.('/dogru.mp3');
      onQuestionAnswered?.(true, 0);
    } else {
      setSpotOutcome('wrong');
      registerMistake();
      playMp3?.('/yanlis.mp3');
      onQuestionAnswered?.(false, 0);
    }
  };

  // Current round references
  const activeQuiz = mode === 'quiz' ? quizQuestions[stepIndex] : null;
  const activeMemory = mode === 'memory' ? memoryRounds[stepIndex] : null;
  const activeScan = mode === 'scan' ? scanRounds[stepIndex] : null;
  const activeSpot = mode === 'spot_odd' ? spotRounds[stepIndex] : null;

  const currentHint =
    activeQuiz?.hint ||
    activeMemory?.hint ||
    (mode === 'scan'
      ? 'Şekil, renk ve dönüş yönünü aynı anda kontrol ederek satır satır tara.'
      : 'Önce üst/sol bölümleri, sonra detayları (sayı, yön, renk) sırayla karşılaştır.');

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col bg-slate-200 text-slate-900 select-none overflow-hidden"
      style={{ top: 'var(--app-header-height, 64px)' }}
    >
      <ActivityBackground theme="doga" dimCenter={false} />

      {/* ÜST KONTROL ÇUBUĞU */}
      <div className="relative z-20 shrink-0 px-2 sm:px-4 pt-1.5 sm:pt-2 pb-1">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300 px-2 sm:px-3.5 py-1.5 sm:py-2 shadow-md flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Sol: Menüye Dön & Önceki/Sonraki Etkinlik */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onClose();
              }}
              className="min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              <span>BİLSEM</span>
            </button>

            {onSwitchActivity && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => switchNeighborActivity(-1)}
                  title="Önceki BİLSEM Etkinliği"
                  className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => switchNeighborActivity(1)}
                  title="Sonraki BİLSEM Etkinliği"
                  className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Orta: Başlık & İlerleme */}
          <div className="flex-1 min-w-0 text-center px-1">
            <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
              {activeGrade}. Sınıf · {activityMeta.title}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-600 tabular-nums">
              Görev {Math.min(stepIndex + 1, totalSteps)}/{totalSteps} · Doğru: {correctCount}
              {threeStrikeEnabled ? ` · Hata: ${wrongCount}/3` : ''} · Puan: {score}
            </div>
          </div>

          {/* Sağ: 3 Hata Kuralı Toggle, İpucu & Sıfırla */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleToggleThreeStrike}
              title="3 Hata Kuralını Aç / Kapat"
              aria-pressed={threeStrikeEnabled}
              className={`min-h-[36px] sm:min-h-[44px] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer whitespace-nowrap ${
                threeStrikeEnabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {threeStrikeEnabled ? (
                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
              ) : (
                <ShieldOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              )}
              <span className="hidden md:inline">
                3 Hata: {threeStrikeEnabled ? 'Açık' : 'Kapalı'}
              </span>
              <span className="md:hidden">
                3H:{threeStrikeEnabled ? 'Aç' : 'Kp'}
              </span>
            </button>

            {!isFinished && (
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  setShowHint((h) => !h);
                }}
                className={`min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap ${
                  showHint
                    ? 'bg-amber-400 text-slate-950 border-amber-500'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">İpucu</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRestartActivity}
              title="Yeni Sorularla Baştan Başlat"
              className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ORTA ETKİNLİK SAHNESİ */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl my-auto rounded-2xl sm:rounded-3xl bg-slate-100/95 backdrop-blur-md border border-slate-300 shadow-2xl p-2.5 sm:p-5 flex flex-col gap-2 sm:gap-3 text-slate-900">
          {showHint && !isFinished && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 text-xs sm:text-sm text-amber-950 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{currentHint}</span>
            </div>
          )}

          {/* BİTİŞ ÖZET EKRANI */}
          {isFinished ? (
            <div className="py-4 sm:py-6 flex flex-col items-center text-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                  failedByThreeStrikes
                    ? 'bg-rose-100 border-rose-300'
                    : 'bg-amber-100 border-amber-300'
                }`}
              >
                {failedByThreeStrikes ? (
                  <AlertTriangle className="w-9 h-9 text-rose-600" />
                ) : (
                  <Trophy className="w-9 h-9 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                  {failedByThreeStrikes
                    ? '3 Hata Doldu! Oyun Sonlandı'
                    : 'Tebrikler! 10 Soru Tamamlandı'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {failedByThreeStrikes
                    ? '3 hata hakkın dolduğu için etkinlik sona erdi. Yeni sorularla tekrar oynayabilir veya üstten 3 Hata kuralını kapatabilirsin.'
                    : `${activityMeta.title} bölümündeki ${totalSteps} soruyu başarıyla tamamladın.`}
                </p>
              </div>

              {!failedByThreeStrikes && autoNextSeconds !== null && onSwitchActivity && (
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2 text-xs sm:text-sm text-amber-950 font-semibold tabular-nums">
                  <span>Sonraki etkinliğe geçiliyor: {autoNextSeconds} sn</span>
                  <button
                    type="button"
                    onClick={() => setAutoNextSeconds(null)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer transition"
                  >
                    Burada Kal
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-md">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3">
                  <div className="text-xs text-emerald-700 font-semibold">Doğru</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums mt-0.5">
                    {correctCount}
                  </div>
                </div>
                <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3">
                  <div className="text-xs text-rose-700 font-semibold">Hata</div>
                  <div className="text-xl sm:text-2xl font-black text-rose-600 tabular-nums mt-0.5">
                    {threeStrikeEnabled ? `${wrongCount}/3` : wrongCount}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3">
                  <div className="text-xs text-amber-700 font-semibold">Puan</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums mt-0.5">
                    {score}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRestartActivity}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeni Sorularla Tekrar Oyna</span>
                </button>
                {onSwitchActivity && (
                  <button
                    type="button"
                    onClick={() => switchNeighborActivity(1)}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    <span>Sonraki Etkinlik</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    onClose();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 border border-sky-700 text-white text-xs sm:text-sm font-bold cursor-pointer active:scale-95 transition"
                >
                  BİLSEM Menüsüne Dön
                </button>
              </div>
            </div>
          ) : mode === 'quiz' && activeQuiz ? (
            /* ----------------------------------------------------------------
               MODE 1: GÖRSEL ÇOKTAN SEÇMELİ BİLSEM SORULARI
               ---------------------------------------------------------------- */
            <div className="flex flex-col gap-2 sm:gap-3.5">
              <p className="text-xs sm:text-base font-bold text-slate-900 text-center leading-snug">
                {activeQuiz.visualType === 'flash_memory' && flashPhase === 'memorize'
                  ? activeQuiz.visualData?.subType === 'sequence'
                    ? 'Sayıları / harfleri sırasıyla aklında tut...'
                    : 'Görseli dikkatlice incele ve aklında tut...'
                  : activeQuiz.prompt}
              </p>

              <div className="py-1 flex items-center justify-center overflow-visible">
                <BilsemQuestionVisual question={activeQuiz} flashPhase={flashPhase} />
              </div>

              {activeQuiz.visualType === 'flash_memory' && flashPhase === 'memorize' ? (
                <div className="flex flex-col items-center gap-3 py-2 max-w-sm mx-auto w-full">
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <div
                      className="h-full bg-indigo-600 transition-[width] duration-75 ease-linear rounded-full"
                      style={{ width: `${flashRemainingPct}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playMp3?.('/op.mp3');
                      if (flashIntervalRef.current !== null) {
                        window.clearInterval(flashIntervalRef.current);
                        flashIntervalRef.current = null;
                      }
                      setFlashPhase('answer');
                    }}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer active:scale-95 transition shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Aklımda Tuttum, Seçenekleri Göster</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
                  {activeQuiz.options.map((opt, idx) => {
                    const isSelected = selectedOptionId === opt.id;
                    const answered = quizOutcome !== 'idle';
                    let cardStyle =
                      'bg-white hover:bg-slate-50 border-slate-300 hover:border-sky-500 text-slate-900 shadow-sm';

                    if (answered) {
                      if (opt.isCorrect) {
                        cardStyle =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/50 shadow-sm';
                      } else if (isSelected && !opt.isCorrect) {
                        cardStyle =
                          'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400/50 shadow-sm';
                      } else {
                        cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-65';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={answered}
                        onClick={() => handleQuizSelect(opt.id, opt.isCorrect)}
                        className={`relative rounded-xl sm:rounded-2xl border p-1.5 sm:p-3 min-h-[54px] sm:min-h-[76px] flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer active:scale-95 ${cardStyle}`}
                      >
                        <span className="self-start text-[10px] sm:text-[11px] font-black text-sky-700 tabular-nums leading-none">
                          {OPTION_LETTERS[idx] || idx + 1})
                        </span>
                        {opt.visual ? (
                          <BilsemOptionVisual question={activeQuiz} visual={opt.visual} />
                        ) : (
                          <span className="text-xs sm:text-base font-black text-center leading-tight">
                            {opt.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {quizOutcome !== 'idle' && (
                <div
                  className={`rounded-2xl border p-3 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    quizOutcome === 'correct'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-rose-400 text-rose-950'
                  }`}
                >
                  <div className="text-xs sm:text-sm leading-snug">
                    <span className="font-black mr-1.5">
                      {quizOutcome === 'correct' ? 'Doğru!' : 'Yanlış Cevap.'}
                    </span>
                    <span>{activeQuiz.explanation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={advanceStep}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition"
                  >
                    <span>{stepIndex + 1 >= totalSteps ? 'Sonucu Gör' : 'Sonraki Soru'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'memory' && activeMemory ? (
            /* ----------------------------------------------------------------
               MODE 2: BİLİŞSEL UYARIM (ÇALIŞMA BELLEĞİ MATRİSİ)
               ---------------------------------------------------------------- */
            <div className="flex flex-col items-center gap-3.5">
              <div className="text-center">
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  {activeMemory.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 tabular-nums">
                  {memoryPhase === 'preview'
                    ? `Parlayan ${activeMemory.targets.length} kareyi aklında tut!`
                    : memoryPhase === 'recall'
                    ? `Hatırladığın karelere dokun (${memorySelected.length}/${activeMemory.targets.length})`
                    : memoryPhase === 'won'
                    ? 'Harika hafıza! Tüm kareleri doğru buldun.'
                    : 'Sarı çerçeveli kareleri inceleyip tekrar deneyebilirsin.'}
                </p>
              </div>

              <div
                className={`grid gap-2 p-3 rounded-2xl bg-slate-200 border border-slate-300 ${
                  activeMemory.gridSize === 3
                    ? 'grid-cols-3 w-56 sm:w-64'
                    : activeMemory.gridSize === 5
                    ? 'grid-cols-5 w-72 sm:w-80'
                    : 'grid-cols-4 w-64 sm:w-72'
                }`}
              >
                {Array.from({ length: activeMemory.gridSize * activeMemory.gridSize }).map(
                  (_, idx) => {
                    const isTarget = activeMemory.targets.includes(idx);
                    const isFound = memorySelected.includes(idx);
                    const isPreviewLit = memoryPhase === 'preview' && isTarget;
                    const isRevealedLost = memoryPhase === 'lost' && isTarget && !isFound;
                    const isWrong = memoryWrongCell === idx;

                    let cellClass =
                      'bg-white border-slate-300 hover:border-sky-500 text-transparent';
                    if (isPreviewLit) {
                      cellClass =
                        'bg-amber-400 border-amber-500 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.65)] scale-[1.02]';
                    } else if (isFound) {
                      cellClass = 'bg-emerald-500 border-emerald-600 text-white';
                    } else if (isRevealedLost) {
                      cellClass = 'bg-amber-100 border-amber-500 text-amber-700';
                    } else if (isWrong) {
                      cellClass = 'bg-rose-100 border-rose-500 text-rose-700';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={memoryPhase !== 'recall'}
                        onClick={() => handleMemoryCellClick(idx)}
                        className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${cellClass}`}
                      >
                        {(isPreviewLit || isFound || isRevealedLost) && (
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {memoryPhase === 'preview' && (
                <button
                  type="button"
                  onClick={() => {
                    clearTimers();
                    setMemoryPhase('recall');
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 border border-sky-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ezberledim, Gizle</span>
                </button>
              )}

              {(memoryPhase === 'won' || memoryPhase === 'lost') && (
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {memoryPhase === 'lost' && (
                    <button
                      type="button"
                      onClick={handleMemoryReplayRound}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tekrar İzle</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={advanceStep}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  >
                    <span>{stepIndex + 1 >= totalSteps ? 'Sonucu Gör' : 'Sonraki Seviye'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'scan' && activeScan ? (
            /* ----------------------------------------------------------------
               MODE 3: DİKKATİ GÜÇLENDİRME (HEDEF SEMBOL TARAMA)
               ---------------------------------------------------------------- */
            (() => {
              const targetCount = activeScan.items.filter((x) => x.isTarget).length;
              return (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="text-center">
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      {activeScan.prompt}
                    </h2>
                    <p className="text-xs sm:text-sm text-sky-700 font-semibold mt-0.5 tabular-nums">
                      Bulunan Hedef: {scanSelected.length} / {targetCount}
                    </p>
                  </div>

                  <div
                    className={`grid gap-2 w-full max-w-lg ${
                      activeScan.gridCols === 5 ? 'grid-cols-5' : 'grid-cols-4'
                    }`}
                  >
                    {activeScan.items.map((item, idx) => {
                      const isPicked = scanSelected.includes(idx);
                      const isWrong = scanWrongIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={scanCompletedRound || isPicked}
                          onClick={() => handleScanItemClick(idx)}
                          className={`relative rounded-2xl border min-h-[64px] sm:min-h-[72px] p-2 flex items-center justify-center transition cursor-pointer active:scale-95 ${
                            isPicked
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/50'
                              : isWrong
                              ? 'bg-rose-50 border-rose-500'
                              : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-sky-500 shadow-sm'
                          }`}
                        >
                          <ShapeGlyph
                            shape={item.shape}
                            color={item.color}
                            rotation={item.rotation}
                            size={40}
                          />
                          {isPicked && (
                            <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {scanWarning && !scanCompletedRound && (
                    <div className="rounded-xl bg-rose-50 border border-rose-300 px-3 py-2 text-xs sm:text-sm text-rose-900">
                      {scanWarning}
                    </div>
                  )}

                  {scanCompletedRound && (
                    <div className="w-full rounded-2xl bg-emerald-50 border border-emerald-400 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-emerald-950">
                        <span className="font-black mr-1.5">Kusursuz Tarama!</span>
                        <span>{activeScan.explanation}</span>
                      </div>
                      <button
                        type="button"
                        onClick={advanceStep}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition"
                      >
                        <span>{stepIndex + 1 >= totalSteps ? 'Sonucu Gör' : 'Sonraki Görev'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : mode === 'spot_odd' && activeSpot ? (
            /* ----------------------------------------------------------------
               MODE 4: GÖRSEL AYIRT ETME (FARKLI OLANI BUL)
               ---------------------------------------------------------------- */
            <div className="flex flex-col gap-2 sm:gap-3.5">
              <p className="text-xs sm:text-base font-bold text-slate-900 text-center">
                {activeSpot.prompt}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-3">
                {activeSpot.cards.map((card, idx) => {
                  const isPicked = spotSelectedCardId === card.id;
                  const isDone = spotOutcome === 'correct';
                  let cardStyle =
                    'bg-white hover:bg-slate-50 border-slate-300 hover:border-teal-500 shadow-sm';

                  if (isDone && card.variant === 'odd') {
                    cardStyle =
                      'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/50';
                  } else if (isPicked && card.variant === 'normal') {
                    cardStyle = 'bg-rose-50 border-rose-500';
                  }

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isDone}
                      onClick={() => handleSpotCardClick(card.id, card.variant)}
                      className={`relative rounded-xl sm:rounded-2xl border p-1.5 sm:p-3 flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${cardStyle}`}
                    >
                      <span className="self-start text-[10px] sm:text-[11px] font-black text-slate-500 tabular-nums">
                        #{idx + 1}
                      </span>
                      <SpotOddCardSVG
                        theme={activeSpot.sceneTheme}
                        isOdd={card.variant === 'odd'}
                        variantIndex={activeSpot.variantIndex}
                        glyphSpec={activeSpot.glyphSpec}
                      />
                    </button>
                  );
                })}
              </div>

              {spotOutcome === 'wrong' && (
                <div className="rounded-xl bg-rose-50 border border-rose-300 px-3 py-2 text-xs sm:text-sm text-rose-900 text-center">
                  Bu görsel diğerleriyle aynı görünüyor! Küçük detaylara bir daha bak.
                </div>
              )}

              {spotOutcome === 'correct' && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-400 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-emerald-950">
                    <span className="font-black mr-1.5">Harika Gözlem!</span>
                    <span>{activeSpot.explanation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={advanceStep}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition"
                  >
                    <span>
                      {stepIndex + 1 >= totalSteps ? 'Sonucu Gör' : 'Sonraki Karşılaştırma'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ALTTA ÖĞRENCİ SEÇİM LİSTESİ (İSTATİSTİĞE EKLENMESİ İÇİN) */}
      {onOpenRosterModal && (
        <StudentAvatarDock
          students={students}
          currentGrade={activeGrade}
          playerCount={1}
          selectedStudentIds={selectedStudentIds}
          onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
          onOpenRosterModal={onOpenRosterModal}
          playMp3={playMp3}
        />
      )}
    </div>
  );
};