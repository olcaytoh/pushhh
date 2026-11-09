import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, X, SkipBack, SkipForward, Sparkles, Star, Heart, HeartCrack, Clock, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

interface EnYakinOnlugaYuvarlamaGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  soundEnabled?: boolean;
  grade?: number;
  /** Hangi yuvarlama sürümü (sınıf + onluk/yüzlük); yoksa 2. sınıf onluk */
  topicKey?: string;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
}

const TOTAL_QUESTIONS = 7;
const MAX_MISTAKES = 3;
const TIME_LIMIT = 100;

type EndReason = 'done' | 'lives' | 'time';

// Sitenin ana yazı tipi (Nunito) – bileşen gövdeden devralır
const SITE_FONT = "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

interface Question {
  target: number;
  leftTen: number;
  rightTen: number;
  correctSide: 'left' | 'right';
}

export interface RoundingGameConfig {
  topicKey: string;
  unit: 10 | 100;
  grade: 2 | 3 | 4;
  min: number;
  max: number;
  title: string;
  /** İstatistiklerin yazılacağı mevcut konu anahtarı */
  statsTopic: string;
  categoryKey: 'grade2' | 'grade3' | 'grade4';
}

const ROUNDING_CONFIGS: Record<string, RoundingGameConfig> = {
  en_yakin_onluk_oyunu: {
    topicKey: 'en_yakin_onluk_oyunu', unit: 10, grade: 2, min: 11, max: 99,
    title: 'En Yakın Onluğa Yuvarlama Oyunu', statsTopic: 'en_yakin_onluk', categoryKey: 'grade2',
  },
  g3_onluk_yuvarlama_oyunu: {
    topicKey: 'g3_onluk_yuvarlama_oyunu', unit: 10, grade: 3, min: 101, max: 999,
    title: "En Yakın Onluğa Yuvarlama Oyunu (1000'e Kadar)", statsTopic: 'g3_en_yakin_onluga_yuvarlama', categoryKey: 'grade3',
  },
  g3_yuzluk_yuvarlama_oyunu: {
    topicKey: 'g3_yuzluk_yuvarlama_oyunu', unit: 100, grade: 3, min: 101, max: 999,
    title: "En Yakın Yüzlüğe Yuvarlama Oyunu (1000'e Kadar)", statsTopic: 'g3_en_yakin_yuzluge_yuvarlama', categoryKey: 'grade3',
  },
  g4_onluk_yuvarlama_oyunu: {
    topicKey: 'g4_onluk_yuvarlama_oyunu', unit: 10, grade: 4, min: 1001, max: 9999,
    title: 'En Yakın Onluğa Yuvarlama Oyunu (4 Basamaklı)', statsTopic: 'g4_en_yakin_onluk_yuzluk', categoryKey: 'grade4',
  },
  g4_yuzluk_yuvarlama_oyunu: {
    topicKey: 'g4_yuzluk_yuvarlama_oyunu', unit: 100, grade: 4, min: 1001, max: 9999,
    title: 'En Yakın Yüzlüğe Yuvarlama Oyunu (4 Basamaklı)', statsTopic: 'g4_en_yakin_onluk_yuzluk', categoryKey: 'grade4',
  },
};

export function isRoundingGameKey(key?: string | null): boolean {
  return !!key && Object.prototype.hasOwnProperty.call(ROUNDING_CONFIGS, key);
}

export function getRoundingGameConfig(key?: string | null): RoundingGameConfig {
  return (key && ROUNDING_CONFIGS[key]) || ROUNDING_CONFIGS.en_yakin_onluk_oyunu;
}

const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('tr-TR') : String(n));

// Sonu 0 olmayan (onluk için) / 00 olmayan (yüzlük için) sayı üretir. Yarıdan itibaren yukarı yuvarlanır.
function generateQuestion(cfg: RoundingGameConfig, previousTarget?: number): Question {
  const { unit, min, max } = cfg;
  let target = 0;
  let guard = 0;
  do {
    target = Math.floor(Math.random() * (max - min + 1)) + min;
    guard++;
  } while ((target % unit === 0 || target === previousTarget) && guard < 200);

  const leftTen = Math.floor(target / unit) * unit;
  const rightTen = leftTen + unit;
  return {
    target,
    leftTen,
    rightTen,
    correctSide: target - leftTen < rightTen - target ? 'left' : 'right',
  };
}

export const EnYakinOnlugaYuvarlamaGame: React.FC<EnYakinOnlugaYuvarlamaGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  grade = 2,
  topicKey,
  students,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
}) => {
  const cfg = getRoundingGameConfig(topicKey);
  const unitWord = cfg.unit === 10 ? 'Onluk' : 'Yüzlük';
  const unitDat = cfg.unit === 10 ? 'onluğuna' : 'yüzlüğüne';
  const unitDatQ = cfg.unit === 10 ? 'onluğa' : 'yüzlüğe';
  const bigNumbers = cfg.max >= 1000;
  const [question, setQuestion] = useState<Question>(() => generateQuestion(cfg));
  const [questionNo, setQuestionNo] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean; picked: 'left' | 'right' }>(null);
  const [finished, setFinished] = useState(false);
  const [endReason, setEndReason] = useState<EndReason>('done');
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [shakeSide, setShakeSide] = useState<'left' | 'right' | null>(null);
  const lockRef = useRef(false);
  const nextTimerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (nextTimerRef.current !== null) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const finishGame = useCallback((reason: EndReason) => {
    clearTimer();
    lockRef.current = true;
    setEndReason(reason);
    setFinished(true);
  }, []);

  // 100 saniyelik geri sayım
  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (!finished && timeLeft === 0) {
      playMp3?.('/hata.mp3');
      finishGame('time');
    }
  }, [timeLeft, finished, finishGame, playMp3]);

  const goNextQuestion = useCallback(() => {
    clearTimer();
    lockRef.current = false;
    setFeedback(null);
    setShakeSide(null);
    setQuestionNo(prev => {
      if (prev >= TOTAL_QUESTIONS) {
        finishGame('done');
        return prev;
      }
      setQuestion(q => generateQuestion(cfg, q.target));
      return prev + 1;
    });
  }, [finishGame, cfg]);

  const handleAnswer = (side: 'left' | 'right') => {
    if (lockRef.current || finished) return;
    lockRef.current = true;
    const isCorrect = side === question.correctSide;
    setFeedback({ correct: isCorrect, picked: side });
    onQuestionAnswered?.(isCorrect, 0);

    if (isCorrect) {
      playMp3?.('/ding.mp3');
      setCorrectCount(c => c + 1);
      setScore(s => s + 10);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      // Doğru cevapta kısa bir kutlamadan sonra kendiliğinden sıradaki soruya geç
      nextTimerRef.current = window.setTimeout(goNextQuestion, 1700);
    } else {
      playMp3?.('/hata.mp3');
      setShakeSide(side);
      window.setTimeout(() => setShakeSide(null), 500);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= MAX_MISTAKES) {
        // 3. hata: oyuncu elenir (sayı doğrusunu görmesi için kısa bir bekleme)
        nextTimerRef.current = window.setTimeout(() => finishGame('lives'), 2600);
      }
      // Aksi halde sayı doğrusunu inceleyip "Sıradaki Soru"ya basılır
    }
  };

  const handleRestart = () => {
    clearTimer();
    lockRef.current = false;
    setQuestion(generateQuestion(cfg));
    setQuestionNo(1);
    setCorrectCount(0);
    setScore(0);
    setFeedback(null);
    setShakeSide(null);
    setFinished(false);
    setEndReason('done');
    setMistakes(0);
    setTimeLeft(TIME_LIMIT);
    playMp3?.('/op.mp3');
  };

  const { target, leftTen, rightTen, correctSide } = question;
  const correctTen = correctSide === 'left' ? leftTen : rightTen;
  const step = cfg.unit / 10;
  const ticks: number[] = [];
  for (let k = 0; k <= 10; k++) ticks.push(leftTen + k * step);
  const targetPct = ((target - leftTen) / (rightTen - leftTen)) * 100;

  const optionClasses = (side: 'left' | 'right') => {
    const base =
      'relative flex-1 min-w-0 max-w-[260px] h-28 sm:h-36 md:h-44 rounded-3xl border-b-8 flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all duration-200 cursor-pointer select-none';
    const palette =
      side === 'left'
        ? 'bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 border-blue-900'
        : 'bg-gradient-to-b from-fuchsia-400 to-purple-600 hover:from-fuchsia-300 hover:to-purple-500 border-purple-900';
    let state = 'hover:scale-105 active:scale-95';
    if (feedback) {
      if (side === correctSide) state = 'ring-4 ring-emerald-400 scale-105 shadow-[0_0_28px_rgba(52,211,153,0.8)]';
      else if (feedback.picked === side) state = 'ring-4 ring-red-500 opacity-70';
      else state = 'opacity-60';
    }
    const shake = shakeSide === side ? 'animate-[wiggle_0.4s_ease-in-out]' : '';
    return `${base} ${palette} ${state} ${shake}`;
  };

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)', fontFamily: SITE_FONT }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col select-none overflow-hidden bg-slate-950"
    >
      <style>{`@keyframes wiggle { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-10px)} 75%{transform:translateX(10px)} }`}</style>
      <ActivityBackground theme="doga" />

      {/* ÜST ORTA: CANLAR • SÜRE • SORU • PUAN (diğer etkinliklerle aynı beyaz hap tasarımı) */}
      <div className="relative z-40 mt-2 sm:mt-3 flex flex-col items-center pointer-events-auto shrink-0">
        <div className="bg-white/95 backdrop-blur-md px-3 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 flex items-center gap-2.5 sm:gap-4 text-slate-900">
          {/* 3 can */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) =>
              i < MAX_MISTAKES - mistakes ? (
                <Heart key={i} size={20} className="text-rose-500 fill-rose-500 drop-shadow" />
              ) : (
                <HeartCrack key={i} size={20} className="text-slate-400" />
              )
            )}
          </div>

          {/* 100 sn geri sayım */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 shadow-inner">
            <Clock
              size={15}
              className={`shrink-0 ${timeLeft <= 10 ? 'text-red-500 animate-spin' : 'text-slate-700'}`}
            />
            <span
              className={`font-black text-base sm:text-xl min-w-[44px] text-center tabular-nums ${
                timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-800'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Soru sayacı */}
          <div className="flex items-center gap-1">
            <span className="font-black text-lg sm:text-2xl text-indigo-600 tabular-nums">
              {Math.min(questionNo, TOTAL_QUESTIONS)}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">/ {TOTAL_QUESTIONS} Soru</span>
          </div>

          {/* Puan */}
          <div className="flex items-center gap-1">
            <Star size={16} className="text-amber-500 fill-amber-400" />
            <span className="font-black text-lg sm:text-2xl text-amber-600 min-w-[26px] tabular-nums">{score}</span>
          </div>
        </div>
        <div className="mt-1 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-[10px] sm:text-xs font-bold text-white shadow-md tracking-wide flex items-center gap-1.5">
          <Sparkles size={11} className="text-amber-300" />
          <span>Hangi {unitDatQ} daha yakın? • 3 hata yaparsan elenirsin • 100 saniye</span>
        </div>
      </div>

      {/* ORTA: SOL ONLUK • SAYI • SAĞ ONLUK (her ekran boyunda yan yana) */}
      <div className="relative z-30 flex-1 min-h-0 flex flex-col items-center justify-center gap-3 sm:gap-5 px-2 sm:px-6">
        <div className="w-full max-w-4xl flex items-center justify-center gap-2 sm:gap-6 md:gap-10">
          <button onClick={() => handleAnswer('left')} disabled={!!feedback} className={optionClasses('left')}>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold opacity-80 mb-0.5">Sol {unitWord}</span>
            <span className={`${bigNumbers ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-4xl sm:text-6xl md:text-7xl'} leading-none drop-shadow tabular-nums`}>{fmt(leftTen)}</span>
          </button>

          <div className="shrink-0 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 shadow-2xl border-4 sm:border-8 border-white flex flex-col items-center justify-center relative z-10">
            <span className="text-[9px] sm:text-xs uppercase font-black tracking-widest text-amber-900 mb-0.5 bg-white/70 px-2.5 py-0.5 rounded-full">
              Sayı
            </span>
            <span className={`${bigNumbers ? 'text-4xl sm:text-6xl md:text-7xl' : 'text-5xl sm:text-7xl md:text-8xl'} font-black text-amber-950 tracking-tighter leading-none drop-shadow tabular-nums`}>
              {fmt(target)}
            </span>
          </div>

          <button onClick={() => handleAnswer('right')} disabled={!!feedback} className={optionClasses('right')}>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold opacity-80 mb-0.5">Sağ {unitWord}</span>
            <span className={`${bigNumbers ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-4xl sm:text-6xl md:text-7xl'} leading-none drop-shadow tabular-nums`}>{fmt(rightTen)}</span>
          </button>
        </div>

        {/* GERİ BİLDİRİM ŞERİDİ (düzeni bozmayan satır içi bildirim) */}
        <div className="h-12 sm:h-14 w-full max-w-3xl flex items-center justify-center">
          {feedback && (
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border-2 shadow-xl backdrop-blur-md text-white ${
                feedback.correct ? 'bg-emerald-700/90 border-emerald-300' : 'bg-slate-900/90 border-amber-400'
              }`}
            >
              {feedback.correct ? (
                <>
                  <span className="text-xl">⭐</span>
                  <span className="font-black text-sm sm:text-base">
                    Harika! {fmt(target)} sayısı {fmt(correctTen)} {unitDat} daha yakın.
                  </span>
                </>
              ) : (
                <>
                  <Lightbulb size={20} className="text-amber-300 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm">
                    Dikkat! {fmt(target)} sayısı sayı doğrusunda <b className="text-amber-300">{fmt(correctTen)}</b> {unitDat} daha yakın.
                  </span>
                  <button
                    onClick={() => {
                      playMp3?.('/op.mp3');
                      if (mistakes >= MAX_MISTAKES) finishGame('lives');
                      else goNextQuestion();
                    }}
                    className="ml-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow border border-amber-200 cursor-pointer whitespace-nowrap"
                  >
                    {mistakes >= MAX_MISTAKES || questionNo >= TOTAL_QUESTIONS ? 'Sonucu Gör ➔' : 'Sıradaki Soru ➔'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* SAYI DOĞRUSU YARDIMI */}
        <div className="w-full max-w-4xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl sm:rounded-3xl px-3 sm:px-6 pt-2.5 pb-3 shadow-2xl border-2 sm:border-4 border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl">📏</span>
              <h3 className="text-xs sm:text-base font-black text-white drop-shadow">Sayı Doğrusu Yardımı</h3>
            </div>
            <span className="hidden sm:block text-xs text-white/90 font-bold">Sayı nerede duruyor? Bak ve karar ver!</span>
          </div>
          <div className="relative mx-7 sm:mx-12 mt-10 mb-7 sm:mb-8 h-6">
            {/* çizgi */}
            <div className="absolute left-0 right-0 top-[7px] h-2.5 bg-white/50 rounded-full" />
            {/* çentikler */}
            {ticks.map((v, k) => {
              const isExtreme = k === 0 || k === 10;
              return (
                <div
                  key={v}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${k * 10}%` }}
                >
                  <div className="h-6 flex items-center">
                    <div
                      className={`rounded-full border-2 border-white shadow ${
                        isExtreme ? 'w-4 h-4 sm:w-5 sm:h-5 bg-amber-300' : 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-0.5 font-black tabular-nums whitespace-nowrap ${
                      bigNumbers ? 'text-[9px] sm:text-xs' : 'text-[10px] sm:text-sm'
                    } ${isExtreme ? 'text-amber-200 drop-shadow' : 'text-white/90 font-bold'}`}
                  >
                    {fmt(v)}
                  </span>
                </div>
              );
            })}
            {/* aranan sayı işareti */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-20"
              style={{ left: `${targetPct}%` }}
            >
              <div className="absolute -top-9 bg-red-500 text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-lg shadow-md animate-bounce whitespace-nowrap">
                {fmt(target)} 📍
              </div>
              <div className="h-6 flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 border-2 border-white shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALT: ÖĞRENCİ SEÇİM ÇUBUĞU (istatistik kaydı için) */}
      {students && onOpenRosterModal && (
        <div className="relative w-full shrink-0 z-40 px-1 sm:px-2 pb-0.5 mt-auto">
          <StudentAvatarDock
            students={students}
            currentGrade={grade}
            playerCount={1}
            selectedStudentIds={selectedStudentIds || []}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* SONUÇ PENCERESİ */}
      {finished && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0f172a] border-4 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
              <Trophy size={38} className="text-slate-950" />
            </div>
            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              {endReason === 'done' ? `${TOTAL_QUESTIONS} Soru Tamamlandı` : endReason === 'lives' ? '3 Hata Yapıldı' : '100 Saniye Doldu'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              {endReason === 'lives'
                ? '💔 Elendin!'
                : endReason === 'time'
                ? '⏰ Süre Bitti!'
                : correctCount === TOTAL_QUESTIONS
                ? '🌟 Muhteşem!'
                : correctCount >= 5
                ? '👏 Çok İyi!'
                : '💪 Biraz Daha Çalışalım!'}
            </h2>
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 mb-5 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-emerald-400 font-bold uppercase">Doğru</div>
                <div className="text-2xl font-black mt-0.5">
                  {correctCount} / {TOTAL_QUESTIONS}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-xs text-rose-400 font-bold uppercase">Hata</div>
                <div className="text-2xl font-black mt-0.5">{mistakes} / {MAX_MISTAKES}</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-xs text-amber-400 font-bold uppercase">Puan</div>
                <div className="text-2xl font-black mt-0.5">{score}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg border border-amber-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw size={18} />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <X size={18} />
                  <span>Kapat</span>
                </button>
              </div>
              {(onPrevActivity || onNextActivity) && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  {onPrevActivity && (
                    <button
                      onClick={onPrevActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <SkipBack size={14} />
                      <span>Önceki Etkinlik</span>
                    </button>
                  )}
                  {onNextActivity && (
                    <button
                      onClick={onNextActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Sonraki Etkinlik</span>
                      <SkipForward size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};