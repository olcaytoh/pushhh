import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, CheckCircle2, Eraser, X, Search, UserPlus, Check } from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface OnlukBirlikGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type Level = 50 | 100;
type BlockKind = 'ten' | 'one';

const TOTAL_QUESTIONS = 10;
const MAX_ONES = 9;
const MAX_TENS = 10;

/** Cube/rod boyutu: ekran yüksekliği ve genişliğine göre ölçeklenir */
const UNIT = 'clamp(14px, min(3.1vh, 2.1vw), 34px)';

const pickNumber = (level: Level, recent: number[]): number => {
  for (let i = 0; i < 40; i++) {
    const n = 10 + Math.floor(Math.random() * (level - 10 + 1));
    if (!recent.includes(n)) return n;
  }
  return 10 + Math.floor(Math.random() * (level - 10 + 1));
};

/** Tek birlik küp: parlak turuncu-sarı, şeker gibi */
const OneCube: React.FC<{ size?: string; className?: string }> = ({ size = UNIT, className = '' }) => (
  <div
    className={`relative rounded-[28%] bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-500 border-2 border-white shadow-[inset_0_3px_3px_rgba(255,255,255,0.8),inset_0_-3px_4px_rgba(194,65,12,0.45),0_3px_5px_rgba(0,0,0,0.35)] ${className}`}
    style={{ width: size, height: size }}
  >
    <span className="absolute top-[14%] left-[16%] w-[26%] h-[18%] rounded-full bg-white/80" />
  </div>
);

/** Onluk çubuğu: 10 küp üst üste, parlak mavi-turkuaz */
const TenRod: React.FC<{ className?: string; unit?: string }> = ({ className = '', unit = UNIT }) => (
  <div
    className={`flex flex-col rounded-lg overflow-hidden border-2 border-white shadow-[0_3px_6px_rgba(0,0,0,0.35)] bg-white ${className}`}
    style={{ width: unit }}
  >
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="relative bg-gradient-to-br from-cyan-200 via-sky-400 to-blue-600 border-b border-white/90 last:border-b-0 shadow-[inset_0_2px_2px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(30,64,175,0.4)]"
        style={{ width: unit, height: unit }}
      >
        <span className="absolute top-[16%] left-[18%] w-[24%] h-[16%] rounded-full bg-white/80" />
      </div>
    ))}
  </div>
);

export const OnlukBirlikGame: React.FC<OnlukBirlikGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [level, setLevel] = useState<Level>(50);
  const recentRef = useRef<number[]>([]);
  const [target, setTarget] = useState<number>(() => {
    const n = pickNumber(50, []);
    return n;
  });
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const [questionNo, setQuestionNo] = useState(1);
  const [score, setScore] = useState(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'ok' | 'bad' } | null>(null);
  const [shake, setShake] = useState<'tens' | 'ones' | 'box' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Sürükleme durumu
  const [drag, setDrag] = useState<{ kind: BlockKind; x: number; y: number } | null>(null);
  const dragRef = useRef<{ kind: BlockKind; startX: number; startY: number } | null>(null);
  const tensColRef = useRef<HTMLDivElement>(null);
  const onesColRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  // Öğrenci seçimi (1 kişilik)
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    null,
    null,
  ]);
  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([selectedStudentIds[0] || null, selectedStudentIds[1] || null, selectedStudentIds[2] || null]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds(prev => [selectedStudentId, prev[1], prev[2]]);
    }
  }, [selectedStudentIds, selectedStudentId]);
  const effectiveIds = selectedStudentIds && selectedStudentIds.length > 0 ? selectedStudentIds : internalSelectedIds;
  const sStudent = effectiveIds[0] ? students?.find(s => s.id === effectiveIds[0]) : null;

  const [showStudentPicker, setShowStudentPicker] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerGradeTab, setPickerGradeTab] = useState<number | 'ALL'>(2);

  const handleSelectStudentForPlayer = (pIdx: number, id: string | null) => {
    setInternalSelectedIds(prev => {
      const u = [...prev];
      u[pIdx] = id;
      return u;
    });
    if (onSelectStudentForPlayer) onSelectStudentForPlayer(pIdx, id);
    else if (pIdx === 0 && onSelectStudent) onSelectStudent(id);
    playMp3?.('/ding.mp3');
  };

  useEffect(() => () => { timersRef.current.forEach(t => window.clearTimeout(t)); }, []);
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const flash = (text: string, tone: 'info' | 'ok' | 'bad' = 'info') => setMessage({ text, tone });
  const doShake = (which: 'tens' | 'ones' | 'box') => {
    setShake(which);
    later(() => setShake(null), 450);
  };

  const builtValue = tens * 10 + ones;

  const startNewQuestion = useCallback((lv: Level) => {
    const n = pickNumber(lv, recentRef.current);
    recentRef.current = [...recentRef.current.slice(-5), n];
    setTarget(n);
    setTens(0);
    setOnes(0);
    setWrongTries(0);
    setLocked(false);
    setMessage(null);
  }, []);

  const resetGame = useCallback((lv: Level) => {
    timersRef.current.forEach(t => window.clearTimeout(t));
    timersRef.current = [];
    recentRef.current = [];
    setQuestionNo(1);
    setScore(0);
    setGameOver(false);
    startNewQuestion(lv);
  }, [startNewQuestion]);

  const handleLevelChange = (lv: Level) => {
    if (lv === level) return;
    setLevel(lv);
    playMp3?.('/op.mp3');
    resetGame(lv);
  };

  // ---- Sürükle & bırak ----
  const addBlock = useCallback((kind: BlockKind) => {
    if (kind === 'ten') {
      if (tens >= MAX_TENS) {
        flash('En fazla 10 onluk koyabilirsin.', 'info');
        return;
      }
      setTens(t => t + 1);
      playMp3?.('/op.mp3');
    } else {
      if (ones >= MAX_ONES) {
        flash('10 birlik 1 onluk eder! Birlikler 9\'dan fazla olamaz.', 'info');
        doShake('ones');
        return;
      }
      setOnes(o => o + 1);
      playMp3?.('/op.mp3');
    }
    setMessage(null);
  }, [tens, ones, playMp3]);

  const hitColumn = (x: number, y: number): 'tens' | 'ones' | 'outside' => {
    const inRect = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    if (inRect(tensColRef.current)) return 'tens';
    if (inRect(onesColRef.current)) return 'ones';
    return 'outside';
  };

  const startDrag = (kind: BlockKind) => (e: React.PointerEvent) => {
    if (locked || gameOver) return;
    e.preventDefault();
    dragRef.current = { kind, startX: e.clientX, startY: e.clientY };
    setDrag({ kind, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag(d => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    };
    const up = (e: PointerEvent) => {
      const info = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!info) return;
      // Neredeyse hiç hareket etmediyse bu bir TIKLAMA: bloğu doğrudan ekle
      if (Math.hypot(e.clientX - info.startX, e.clientY - info.startY) < 8 && e.type === 'pointerup') {
        addBlock(info.kind);
        return;
      }
      const col = hitColumn(e.clientX, e.clientY);
      if (col === 'outside') return;
      if (info.kind === 'ten' && col === 'tens') addBlock('ten');
      else if (info.kind === 'one' && col === 'ones') addBlock('one');
      else {
        // Yanlış sütun
        playMp3?.('/hata.mp3');
        doShake(col);
        flash(
          info.kind === 'ten'
            ? 'Onluk çubuğu ONLUK sütununa bırakmalısın.'
            : 'Birlik küpü BİRLİK sütununa bırakmalısın.',
          'bad'
        );
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null, addBlock]);

  const removeBlock = (kind: BlockKind) => {
    if (locked || gameOver) return;
    if (kind === 'ten') setTens(t => Math.max(0, t - 1));
    else setOnes(o => Math.max(0, o - 1));
    playMp3?.('/op.mp3');
    setMessage(null);
  };

  const clearAll = () => {
    if (locked || gameOver) return;
    setTens(0);
    setOnes(0);
    setMessage(null);
    playMp3?.('/op.mp3');
  };

  const advance = useCallback(() => {
    if (questionNo >= TOTAL_QUESTIONS) {
      setGameOver(true);
      playMp3?.('/para.mp3');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onGameCompleted?.(0, 1);
    } else {
      setQuestionNo(q => q + 1);
      startNewQuestion(level);
    }
  }, [questionNo, level, startNewQuestion, onGameCompleted, playMp3]);

  const checkAnswer = () => {
    if (locked || gameOver) return;
    if (builtValue === 0) {
      flash('Önce yanlardan onluk ve birlik sürükle.', 'info');
      doShake('box');
      return;
    }
    if (builtValue === target) {
      setLocked(true);
      playMp3?.('/coin.mp3');
      if (wrongTries === 0) {
        setScore(s => s + 10);
        onQuestionAnswered?.(true, 0);
      }
      flash(`Harika! ${tens} onluk ve ${ones} birlik = ${target}`, 'ok');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.65 } });
      later(advance, 1700);
    } else {
      playMp3?.('/hata.mp3');
      doShake('box');
      const tries = wrongTries + 1;
      setWrongTries(tries);
      if (tries === 1) onQuestionAnswered?.(false, 0);
      if (tries >= 2) {
        // Doğru cevabı göster ve devam et
        setLocked(true);
        setTens(Math.floor(target / 10));
        setOnes(target % 10);
        flash(`${target} sayısı ${Math.floor(target / 10)} onluk ve ${target % 10} birliktir.`, 'bad');
        later(advance, 2800);
      } else {
        flash(`Şu an ${builtValue} yaptın. Hedef sayıyı tekrar düşün ve dene!`, 'bad');
      }
    }
  };

  const msgColor = useMemo(() => {
    if (!message) return '';
    return message.tone === 'ok'
      ? 'text-green-600'
      : message.tone === 'bad'
      ? 'text-rose-600'
      : 'text-indigo-700';
  }, [message]);

  const shakeCls = (k: 'tens' | 'ones' | 'box') => (shake === k ? 'animate-[ob-shake_0.4s_ease-in-out]' : '');

  const tensGlow = drag?.kind === 'ten' ? 'ring-4 ring-inset ring-yellow-300 animate-pulse' : '';
  const onesGlow = drag?.kind === 'one' ? 'ring-4 ring-inset ring-yellow-300 animate-pulse' : '';

  const tensDigit = target >= 100 ? null : Math.floor(target / 10);
  const onesDigit = target % 10;

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      <style>{`
        @keyframes ob-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes ob-pop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ob-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Arka plan (diğer etkinliklerle aynı) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/dere3.webp"
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-[1850px] mx-auto p-1 sm:p-2 flex flex-col items-center min-h-0 overflow-hidden">
        <div className="flex-1 w-full max-w-5xl 2xl:max-w-6xl flex flex-col min-h-0">
          <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-gradient-to-b from-sky-400 via-indigo-500 to-violet-600 border-4 border-yellow-300 shadow-[0_12px_36px_rgba(0,0,0,0.6)] rounded-3xl w-full overflow-hidden min-h-0 relative gap-1.5 sm:gap-2">

            {/* ÜST ÇUBUK */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 w-full h-9 sm:h-10">
              <button
                type="button"
                onClick={() => {
                  setShowStudentPicker(true);
                  setPickerSearch('');
                  setPickerGradeTab(sStudent?.grade || 2);
                  playMp3?.('/op.mp3');
                }}
                className="flex items-center gap-1.5 min-w-0 h-full cursor-pointer hover:opacity-90 active:scale-95 transition-all text-left"
                title={`${sStudent ? sStudent.name : 'Öğrenci Seç'} - Tıkla ve Değiştir`}
              >
                {sStudent ? (
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${sStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-[3px] border-white text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {sStudent.avatar}
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-[3px] border-white text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                    👤
                  </div>
                )}
                <div className="h-full bg-white/95 border-2 border-yellow-300 rounded-2xl px-2.5 sm:px-3 flex items-center min-w-0 shadow-md gap-1">
                  <span className="font-black text-xs sm:text-sm text-indigo-700 uppercase tracking-wide truncate max-w-[120px] sm:max-w-[180px]">
                    {sStudent ? sStudent.name : 'Öğrenci Seç'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-100 rounded px-1.5 py-0.5">
                    {sStudent ? '✏️' : '+'}
                  </span>
                </div>
              </button>

              {/* Kademe seçimi */}
              <div className="flex items-center gap-1.5 h-full">
                {([50, 100] as Level[]).map(lv => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => handleLevelChange(lv)}
                    className={`h-full px-3 sm:px-5 rounded-2xl font-black text-sm sm:text-base border-[3px] transition cursor-pointer active:scale-95 shadow-md ${
                      level === lv
                        ? 'bg-gradient-to-b from-lime-300 to-green-500 text-green-950 border-white scale-105 shadow-[0_0_14px_rgba(190,242,100,0.9)]'
                        : 'bg-white/90 text-indigo-700 border-indigo-200 hover:bg-yellow-100 hover:border-yellow-300'
                    }`}
                  >
                    10 - {lv}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 h-full">
                <div className="h-full bg-white/95 border-2 border-yellow-300 rounded-2xl px-2 sm:px-3 flex items-center gap-1.5 shadow-md">
                  <span className="text-[11px] sm:text-sm font-black text-indigo-700">{questionNo}/{TOTAL_QUESTIONS}</span>
                  <span className="bg-gradient-to-b from-yellow-300 to-orange-400 text-orange-950 font-black text-xs sm:text-sm px-2 py-0.5 rounded-xl border border-white tracking-wider">
                    ⭐ {score}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { playMp3?.('/op.mp3'); resetGame(level); }}
                  title="Yeniden başla"
                  className="h-full px-2.5 rounded-2xl bg-gradient-to-b from-pink-400 to-rose-500 border-2 border-white text-white cursor-pointer active:scale-95 shadow-md"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* SAYI GÖSTERGESİ: onlar mavi, birler turuncu balon */}
            <div className="shrink-0 w-full rounded-3xl bg-white/95 border-4 border-yellow-300 shadow-[0_8px_20px_rgba(0,0,0,0.35)] flex items-center justify-center gap-3 sm:gap-5 py-1 sm:py-1.5">
              <span className="text-[clamp(14px,2.6vh,28px)] font-black text-fuchsia-600 uppercase tracking-wider">
                Bu sayıyı yap:
              </span>
              <div key={target} className="flex items-center gap-2 sm:gap-3" style={{ animation: 'ob-pop 0.35s ease-out' }}>
                {tensDigit === null ? (
                  <span
                    className="px-4 rounded-3xl font-black text-white leading-none bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 border-4 border-white shadow-lg"
                    style={{ fontSize: 'clamp(44px, 10vh, 108px)' }}
                  >
                    {target}
                  </span>
                ) : (
                  <>
                    <span
                      className="px-3 sm:px-5 rounded-3xl font-black text-white leading-none bg-gradient-to-b from-cyan-400 to-blue-600 border-4 border-white shadow-[0_6px_0_rgba(30,64,175,0.5)]"
                      style={{ fontSize: 'clamp(44px, 10vh, 108px)' }}
                    >
                      {tensDigit}
                    </span>
                    <span
                      className="px-3 sm:px-5 rounded-3xl font-black text-white leading-none bg-gradient-to-b from-yellow-300 to-orange-500 border-4 border-white shadow-[0_6px_0_rgba(194,65,12,0.5)]"
                      style={{ fontSize: 'clamp(44px, 10vh, 108px)' }}
                    >
                      {onesDigit}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* OYUN ALANI: [onluk deposu] [onluk-birlik kutusu] [birlik deposu] */}
            <div className="flex-1 min-h-0 w-full flex items-stretch gap-1.5 sm:gap-3">

              {/* SOL: ONLUK deposu */}
              <div className="w-[17%] sm:w-[16%] shrink-0 rounded-3xl bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 border-4 border-white shadow-lg flex flex-col items-center justify-between py-2 px-1 min-h-0 overflow-hidden">
                <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider text-center leading-tight drop-shadow-[0_2px_2px_rgba(30,64,175,0.8)]">
                  Onluk<br />Çubuğu
                </span>
                <div
                  onPointerDown={startDrag('ten')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!locked && !gameOver) addBlock('ten'); } }}
                  role="button"
                  tabIndex={0}
                  aria-label="Onluk çubuğu ekle"
                  style={{ touchAction: 'none', animation: 'ob-bounce 1.6s ease-in-out infinite' }}
                  className="cursor-pointer active:cursor-grabbing hover:scale-110 transition-transform p-1.5 rounded-2xl bg-white/50 border-[3px] border-dashed border-white"
                  title="Sürükle ya da tıkla: 1 onluk = 10 birlik"
                >
                  <TenRod />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-blue-900 text-center leading-tight bg-white/80 rounded-lg px-1.5 py-0.5">
                  1 onluk<br />= 10 birlik
                </span>
              </div>

              {/* ORTA: ONLUK | BİRLİK KUTUSU */}
              <div
                ref={boxRef}
                className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-3xl bg-white border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden ${shakeCls('box')}`}
              >
                <div className="flex-1 min-h-0 grid grid-cols-2">
                  {/* ONLUK sütunu: Onluklar yan yana sıralanır */}
                  <div
                    ref={tensColRef}
                    className={`relative flex flex-col items-center min-h-0 border-r-4 border-white bg-gradient-to-b from-cyan-100 to-sky-300 ${tensGlow} ${shakeCls('tens')}`}
                  >
                    <div className="w-full shrink-0 text-center py-1 bg-gradient-to-b from-sky-400 to-blue-600 text-white font-black text-sm sm:text-lg uppercase tracking-widest border-b-4 border-white">
                      Onluk
                    </div>
                    <div className="flex-1 min-h-0 flex flex-row flex-wrap content-center justify-center gap-2 p-2 overflow-y-auto w-full" style={{ fontSize: UNIT }}>
                      {tens === 0 && (
                        <span className="text-blue-700/70 font-black text-center px-2 my-auto" style={{ fontSize: 'clamp(12px, 2vh, 18px)' }}>
                          🟦 Onluk çubuklarını buraya bırak
                        </span>
                      )}
                      {Array.from({ length: tens }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeBlock('ten')}
                          title="Geri almak için dokun"
                          className="cursor-pointer hover:brightness-110 active:scale-95 shrink-0"
                          style={{ animation: 'ob-pop 0.25s ease-out' }}
                        >
                          <TenRod unit="1em" />
                        </button>
                      ))}
                    </div>
                    <div className="w-full shrink-0 text-center py-0.5 bg-blue-600 font-black text-white text-sm sm:text-lg border-t-4 border-white">
                      {tens} onluk
                    </div>
                  </div>

                  {/* BİRLİK sütunu: Birlikler dikey, alttan üste doğru sıralanır */}
                  <div
                    ref={onesColRef}
                    className={`relative flex flex-col items-center min-h-0 bg-gradient-to-b from-yellow-100 to-orange-300 ${onesGlow} ${shakeCls('ones')}`}
                  >
                    <div className="w-full shrink-0 text-center py-1 bg-gradient-to-b from-orange-400 to-pink-500 text-white font-black text-sm sm:text-lg uppercase tracking-widest border-b-4 border-white">
                      Birlik
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col-reverse items-center justify-start gap-[0.3em] p-2 overflow-y-auto w-full" style={{ fontSize: UNIT }}>
                      {ones === 0 && (
                        <span className="text-orange-700/70 font-black text-center px-2 my-auto" style={{ fontSize: 'clamp(12px, 2vh, 18px)' }}>
                          🟧 Birlik küplerini buraya bırak
                        </span>
                      )}
                      {Array.from({ length: ones }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeBlock('one')}
                          title="Geri almak için dokun"
                          className="cursor-pointer hover:brightness-110 active:scale-95 shrink-0"
                          style={{ animation: 'ob-pop 0.25s ease-out' }}
                        >
                          <OneCube size="1em" />
                        </button>
                      ))}
                    </div>
                    <div className="w-full shrink-0 text-center py-0.5 bg-orange-500 font-black text-white text-sm sm:text-lg border-t-4 border-white">
                      {ones} birlik
                    </div>
                  </div>
                </div>

                {/* Mesaj + kontrol */}
                <div className="shrink-0 flex items-center justify-between gap-2 px-2 py-1.5 bg-gradient-to-r from-fuchsia-100 via-yellow-50 to-sky-100 border-t-4 border-white min-h-[48px]">
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={locked || (tens === 0 && ones === 0)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-rose-400 to-red-500 border-2 border-white disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 shadow-md"
                  >
                    <Eraser size={15} /> Temizle
                  </button>
                  <span className={`flex-1 text-center font-black text-xs sm:text-base leading-tight ${msgColor}`}>
                    {message?.text || 'Onluk ve birlikleri sürükle, sonra Kontrol Et\'e bas.'}
                  </span>
                  <button
                    type="button"
                    onClick={checkAnswer}
                    disabled={locked}
                    className="px-3 sm:px-5 py-1.5 rounded-xl bg-gradient-to-b from-lime-400 to-green-600 border-2 border-white disabled:opacity-50 text-white font-black text-sm sm:text-base flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_4px_0_rgba(21,128,61,0.6)] shrink-0"
                  >
                    <CheckCircle2 size={18} /> Kontrol Et
                  </button>
                </div>
              </div>

              {/* SAĞ: BİRLİK deposu */}
              <div className="w-[17%] sm:w-[16%] shrink-0 rounded-3xl bg-gradient-to-b from-yellow-300 via-orange-400 to-pink-500 border-4 border-white shadow-lg flex flex-col items-center justify-between py-2 px-1 min-h-0 overflow-hidden">
                <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider text-center leading-tight drop-shadow-[0_2px_2px_rgba(190,24,93,0.8)]">
                  Birlik<br />Küpü
                </span>
                <div
                  onPointerDown={startDrag('one')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!locked && !gameOver) addBlock('one'); } }}
                  role="button"
                  tabIndex={0}
                  aria-label="Birlik küpü ekle"
                  style={{ touchAction: 'none', animation: 'ob-bounce 1.6s ease-in-out infinite' }}
                  className="cursor-pointer active:cursor-grabbing hover:scale-110 transition-transform p-2 rounded-2xl bg-white/50 border-[3px] border-dashed border-white"
                  title="Sürükle ya da tıkla: 1 birlik"
                >
                  <OneCube size={UNIT} />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-pink-700 text-center leading-tight bg-white/80 rounded-lg px-1.5 py-0.5">
                  1 birlik
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Öğrenci seçici */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={1}
            selectedStudentIds={effectiveIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* Sürüklenen blok (imleci takip eder) */}
      {drag && (
        <div
          className="fixed z-[400] pointer-events-none"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -50%) scale(1.15)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}
        >
          {drag.kind === 'ten' ? <TenRod /> : <OneCube size={UNIT} />}
        </div>
      )}

      {/* Bitiş penceresi */}
      {gameOver && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 bg-black/70">
          <div className="bg-gradient-to-b from-sky-400 via-indigo-500 to-fuchsia-600 border-4 border-yellow-300 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="text-6xl" style={{ animation: 'ob-bounce 1s ease-in-out infinite' }}>🏆</div>
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-300 uppercase drop-shadow-[0_3px_0_rgba(88,28,135,0.8)]">Tebrikler!</h2>
            <p className="text-sm sm:text-base font-bold text-white">
              Onluk ve birlikleri ustalıkla kullandın. Puanın: <b className="text-yellow-300 text-lg">⭐ {score}</b> / {TOTAL_QUESTIONS * 10}
            </p>
            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={() => { playMp3?.('/op.mp3'); resetGame(level); }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-b from-lime-400 to-green-600 border-2 border-white text-white font-black text-sm sm:text-base shadow-[0_4px_0_rgba(21,128,61,0.6)] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} /> Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-indigo-700 font-black text-sm cursor-pointer border-2 border-indigo-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÖĞRENCİ SEÇİM MODALİ */}
      {showStudentPicker && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b1329] border-2 border-slate-700 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.85)] text-white">
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-black text-slate-950 shrink-0 shadow-sm">
                  👤
                </span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    Öğrenci Seç
                  </h3>
                  <p className="text-xs text-slate-400">Bu etkinlik için öğrenci seçin (istatistiklere kaydedilir)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentPicker(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sınıf Kademesi Sekmeleri */}
            <div className="flex items-center gap-1.5 py-2.5 shrink-0 overflow-x-auto no-scrollbar">
              {(['ALL', 1, 2, 3, 4] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPickerGradeTab(tab)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    pickerGradeTab === tab
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {tab === 'ALL' ? 'Tüm Sınıflar' : `${tab}. Sınıf`}
                </button>
              ))}
            </div>

            {/* Arama Çubuğu */}
            <div className="relative mb-2.5 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Öğrenci adı ile ara..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              {pickerSearch && (
                <button
                  type="button"
                  onClick={() => setPickerSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Öğrenci Listesi */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {(() => {
                const availableStudents = (students || []).filter((s) => {
                  const matchesGrade = pickerGradeTab === 'ALL' || s.grade === pickerGradeTab;
                  const matchesSearch =
                    !pickerSearch.trim() || s.name.toLowerCase().includes(pickerSearch.toLowerCase().trim());
                  return matchesGrade && matchesSearch;
                });

                if (availableStudents.length === 0) {
                  return (
                    <div className="p-6 text-center text-slate-400 text-xs sm:text-sm bg-white/5 rounded-2xl border border-dashed border-white/10">
                      Öğrenci bulunamadı.
                    </div>
                  );
                }

                return availableStudents.map((st) => {
                  const isSelected = effectiveIds[0] === st.id;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        handleSelectStudentForPlayer(0, st.id);
                        setShowStudentPicker(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                            st.avatarBg || 'from-indigo-500 to-purple-600'
                          } flex items-center justify-center text-base shadow-sm shrink-0 border border-white/20`}
                        >
                          <span>{st.avatar}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-white block truncate">
                            {st.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {st.grade}. Sınıf {st.className ? `• ${st.className}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                            <Check size={12} /> Seçili
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200">
                            Seç
                          </span>
                        )}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Alt İşlemler */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleSelectStudentForPlayer(0, null);
                  setShowStudentPicker(false);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                İsimsiz Oyna
              </button>

              {onOpenRosterModal && (
                <button
                  type="button"
                  onClick={() => {
                    const targetG = typeof pickerGradeTab === 'number' ? pickerGradeTab : 2;
                    setShowStudentPicker(false);
                    onOpenRosterModal(targetG);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-black text-amber-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={13} />
                  <span>Sınıf Listesini Yönet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlukBirlikGame;