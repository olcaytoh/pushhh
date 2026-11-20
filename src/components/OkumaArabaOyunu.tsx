import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Star,
  Trophy,
  Users,
  User,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  LetterGroupData,
  OKUMA_ARABA_VEHICLES,
  getFilteredWords,
  getGroupSyllables,
  isValidTurkishSyllableOrWord,
  shuffleArray,
  speakTurkish,
  stopSpeaking,
} from '../data/okumaYazmaData';

export type ArabaContentType = 'karisik' | 'hece' | 'kelime';
export type ArabaRepeatMode = 2 | 3;

interface ArabaQuestion {
  target: string;
  optionsP1: string[]; // length 3
  optionsP2: string[]; // length 3 (independently shuffled for 2-player mode)
  kind: 'hece' | 'kelime';
}

interface OkumaArabaOyunuProps {
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string, onEnded?: () => void) => void;
  onScore: (delta: number, isCorrect: boolean, pIdx?: number) => void;
  onRoundDone: (winnerIdx?: number, playerCount?: number) => void;
}

const TOTAL_QUESTIONS = 7;
const WAVE_DURATION_MS = 8800;

const CUBE_STYLES = [
  {
    outer: 'bg-gradient-to-b from-violet-400 to-violet-600 border-violet-700 shadow-[0_6px_0_#5b21b6]',
    inner: 'bg-white text-slate-900 border-violet-200',
  },
  {
    outer: 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-700 shadow-[0_6px_0_#b45309]',
    inner: 'bg-white text-slate-900 border-amber-200',
  },
  {
    outer: 'bg-gradient-to-b from-cyan-400 to-sky-500 border-cyan-700 shadow-[0_6px_0_#0e7490]',
    inner: 'bg-white text-slate-900 border-cyan-200',
  },
];

function buildPoolForMode(
  group: LetterGroupData,
  focusLetter: string | null,
  contentType: ArabaContentType
): { text: string; kind: 'hece' | 'kelime' }[] {
  const syllables = getGroupSyllables(group, focusLetter)
    .filter(isValidTurkishSyllableOrWord)
    .map((s) => ({ text: s, kind: 'hece' as const }));
  const words = getFilteredWords(group, focusLetter)
    .filter((w) => isValidTurkishSyllableOrWord(w.word))
    .map((w) => ({ text: w.word, kind: 'kelime' as const }));

  if (contentType === 'hece') return syllables;
  if (contentType === 'kelime') return words;
  return [...syllables, ...words];
}

function generateSevenQuestions(
  group: LetterGroupData,
  focusLetter: string | null,
  contentType: ArabaContentType,
  recentHistory: Set<string>
): ArabaQuestion[] {
  const fullPool = buildPoolForMode(group, focusLetter, contentType);
  // Deduplicate by lowercase text
  const map = new Map<string, { text: string; kind: 'hece' | 'kelime' }>();
  for (const item of fullPool) {
    const key = item.text.toLocaleLowerCase('tr-TR');
    if (!map.has(key)) map.set(key, item);
  }
  const uniquePool = Array.from(map.values());

  // Prefer unseen targets so every new game shows fresh words/syllables
  let fresh = shuffleArray(uniquePool.filter((u) => !recentHistory.has(u.text.toLocaleLowerCase('tr-TR'))));
  if (fresh.length < TOTAL_QUESTIONS) {
    recentHistory.clear();
    fresh = shuffleArray(uniquePool);
  }

  const chosen: { text: string; kind: 'hece' | 'kelime' }[] = [];
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const item = fresh[i % fresh.length];
    chosen.push(item);
    recentHistory.add(item.text.toLocaleLowerCase('tr-TR'));
  }

  return chosen.map((item) => {
    // Prefer distractors of the same kind (syllable vs syllable, word vs word)
    const sameKindDistractors = shuffleArray(
      uniquePool
        .filter((u) => u.kind === item.kind && u.text.toLocaleLowerCase('tr-TR') !== item.text.toLocaleLowerCase('tr-TR'))
        .map((u) => u.text)
    );
    const anyDistractors = shuffleArray(
      uniquePool
        .filter((u) => u.text.toLocaleLowerCase('tr-TR') !== item.text.toLocaleLowerCase('tr-TR'))
        .map((u) => u.text)
    );
    const d1 = sameKindDistractors[0] || anyDistractors[0] || 'el';
    const d2 =
      sameKindDistractors.find((x) => x !== d1) ||
      anyDistractors.find((x) => x !== d1) ||
      'al';
    return {
      target: item.text,
      kind: item.kind,
      optionsP1: shuffleArray([item.text, d1, d2]),
      optionsP2: shuffleArray([item.text, d1, d2]),
    };
  });
}

// 3 şeritli perspektif yolda (SVG viewBox 400×320: üst 74..326, alt 20..380)
// herhangi bir dikey konumdaki (yFrac: 0..1) şerit merkezi (%) ve şerit genişliği (%)
function getLaneCenterPct(laneIdx: 0 | 1 | 2, yFrac: number): number {
  if (laneIdx === 0) return 29 - 9 * yFrac;
  if (laneIdx === 2) return 71 + 9 * yFrac;
  return 50;
}

function getLaneWidthPct(yFrac: number): number {
  return 21 + 9 * yFrac;
}

interface LaneTrackProps {
  playerLabel: string;
  playerAccent: 'orange' | 'sky';
  vehicleIdx: number;
  lane: 0 | 1 | 2;
  onSelectLane: (lane: 0 | 1 | 2, commitNow?: boolean) => void;
  options: string[];
  target: string;
  progressY: number; // 0 (horizon) -> 1 (car contact)
  score: number;
  questionNumber: number;
  totalQuestions: number;
  result: 'idle' | 'correct' | 'wrong';
  showTextHint: boolean;
  onReplayAudio: () => void;
  compact: boolean;
  keysHint: string;
  repeatMode: ArabaRepeatMode;
}

const RoadLaneTrack: React.FC<LaneTrackProps> = ({
  playerLabel,
  playerAccent,
  vehicleIdx,
  lane,
  onSelectLane,
  options,
  target,
  progressY,
  score,
  questionNumber,
  totalQuestions,
  result,
  showTextHint,
  onReplayAudio,
  compact,
  keysHint,
  repeatMode,
}) => {
  const vehicle = OKUMA_ARABA_VEHICLES[vehicleIdx] || OKUMA_ARABA_VEHICLES[0];
  const touchStartX = useRef<number | null>(null);

  // Küp dikey yolculuğu (yol konteynerinin %13'ünden %69'una — tam şerit merkezinde perspektifle büyüyerek iner)
  const cubeYFrac = 0.13 + progressY * 0.56;
  const cubeWidthPct = getLaneWidthPct(cubeYFrac) * 0.78;
  const cubeHeightPx = Math.round((compact ? 48 : 54) + progressY * (compact ? 18 : 22));

  // Araç şerit merkezi (yolun alt %84 hizasında şeridin tam ortasında)
  const carLeftPct = getLaneCenterPct(lane, 0.84);

  const badgeBg =
    playerAccent === 'orange'
      ? 'bg-orange-500 text-white border-orange-600'
      : 'bg-sky-500 text-white border-sky-600';

  return (
    <div
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 30) {
          const next = dx > 0 ? Math.min(2, lane + 1) : Math.max(0, lane - 1);
          onSelectLane(next as 0 | 1 | 2, false);
        }
      }}
      className="relative w-full h-[430px] sm:h-[490px] rounded-3xl overflow-hidden border-2 border-slate-200 bg-white shadow-lg select-none flex flex-col"
    >
      {/* ÜST GÖKYÜZÜ + HUD (2. REFERANS GÖRSEL TARZI) */}
      <div className="relative h-[34%] w-full bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 px-3 pt-2.5 flex flex-col items-center justify-between z-20">
        {/* Oyuncu etiketi + İlerleme + Yıldız */}
        <div className="w-full flex items-center justify-between gap-2">
          <div className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-black shadow-xs ${badgeBg}`}>
            {playerLabel}
          </div>

          <div className="flex-1 max-w-[140px] h-3 rounded-full bg-white/80 border border-sky-200 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${((questionNumber) / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-slate-900 text-xs sm:text-sm font-black flex items-center gap-1 shadow-xs tabular-nums">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{score}</span>
          </div>
        </div>

        {/* BÜYÜK HOPARLÖR KARTI (2. REFERANS GÖRSELDEKİ GİBİ) */}
        <button
          type="button"
          onClick={onReplayAudio}
          title="Sesli tekrar dinle"
          className="group relative -mb-3 z-30 min-w-[96px] sm:min-w-[118px] px-4 py-2 rounded-2xl bg-white hover:bg-sky-50 border-2 border-amber-300 shadow-[0_5px_0_#d97706] active:translate-y-0.5 active:shadow-[0_2px_0_#d97706] transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-sky-600 group-hover:scale-110 transition-transform" />
            {showTextHint && (
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide">
                {target}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">
            Dinle · {repeatMode}× ({questionNumber}/{totalQuestions})
          </span>
        </button>

        {/* UFUK ÇİZGİSİ AĞAÇLARI */}
        <div className="w-full flex items-end justify-between px-1 pointer-events-none">
          <div className="flex items-end gap-1.5">
            <span className="text-lg sm:text-xl leading-none">🌳</span>
            <span className="text-base sm:text-lg leading-none">🌲</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-base sm:text-lg leading-none">🌲</span>
            <span className="text-lg sm:text-xl leading-none">🌳</span>
          </div>
        </div>
      </div>

      {/* ALT BÖLÜM: ÇİMEN + 3 ŞERİTLİ PERSPEKTİF YOL */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-lime-400 via-emerald-400 to-green-500 overflow-hidden">
        {/* YOL PERSPEKTİF ZEMİNİ (SVG - Kırmızı/Beyaz Bordürlü Geniş 3 Şeritli Yol) */}
        <svg
          viewBox="0 0 400 320"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Yol dış kenar kırmızı-beyaz bordür (sol & sağ) */}
          <polygon points="64,0 336,0 392,320 8,320" fill="#dc2626" />
          <polygon
            points="64,0 336,0 392,320 8,320"
            fill="none"
            stroke="#ffffff"
            strokeWidth="12"
            strokeDasharray="18 18"
          />
          {/* Ana krem-altın asfalt yüzeyi (üst: 74..326, alt: 20..380 — 3 eşit şerit) */}
          <polygon points="74,0 326,0 380,320 20,320" fill="#e6d79c" />
          {/* 3 şerit ayırıcı kesikli beyaz çizgiler (158→140 ve 242→260) */}
          <line
            x1="158"
            y1="0"
            x2="140"
            y2="320"
            stroke="#ffffff"
            strokeWidth="6"
            strokeDasharray="24 22"
            className="okuma-road-dash"
          />
          <line
            x1="242"
            y1="0"
            x2="260"
            y2="320"
            stroke="#ffffff"
            strokeWidth="6"
            strokeDasharray="24 22"
            className="okuma-road-dash"
          />
        </svg>

        {/* ŞERİT TIKLAMA ALANLARI (Dokunarak anında şerit değiştir) */}
        <div className="absolute inset-0 z-10 grid grid-cols-3">
          {([0, 1, 2] as const).map((lIdx) => (
            <button
              key={lIdx}
              type="button"
              aria-label={`${lIdx + 1}. Şeride Geç`}
              onClick={() => onSelectLane(lIdx, false)}
              className={`h-full w-full cursor-pointer transition-colors ${
                lane === lIdx ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            />
          ))}
        </div>

        {/* KARŞIDAN GELEN 3 RENKLİ 3B KÜP — HER KÜP KENDİ ŞERİDİNİN TAM ORTASINDA */}
        {options.map((opt, idx) => {
          const laneIdx = idx as 0 | 1 | 2;
          const style = CUBE_STYLES[idx % CUBE_STYLES.length];
          const isTargetOpt = opt.toLocaleLowerCase('tr-TR') === target.toLocaleLowerCase('tr-TR');
          const isPlayerHere = lane === laneIdx;
          const highlightCorrect = result !== 'idle' && isTargetOpt;
          const highlightWrong = result === 'wrong' && isPlayerHere && !isTargetOpt;
          const laneCenterX = getLaneCenterPct(laneIdx, cubeYFrac);

          return (
            <button
              key={`${opt}-${idx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLane(laneIdx, true);
              }}
              style={{
                left: `${laneCenterX}%`,
                top: `${cubeYFrac * 100}%`,
                width: `${cubeWidthPct}%`,
                transform: `translate(-50%, -50%) ${
                  highlightCorrect ? 'scale(1.08)' : highlightWrong ? 'scale(0.95)' : ''
                }`,
              }}
              className={`absolute z-20 p-1 sm:p-1.5 rounded-2xl border-2 transition-shadow cursor-pointer active:scale-95 ${
                highlightCorrect
                  ? 'bg-emerald-500 border-emerald-700 shadow-[0_6px_0_#047857] ring-4 ring-emerald-200'
                  : highlightWrong
                    ? 'bg-rose-500 border-rose-700 shadow-[0_6px_0_#be123c]'
                    : style.outer
              } ${isPlayerHere && result === 'idle' ? 'ring-3 ring-white/95' : ''}`}
            >
              <div
                style={{ minHeight: `${cubeHeightPx}px` }}
                className={`w-full rounded-xl border-2 flex items-center justify-center px-1 font-black leading-none text-center break-keep ${
                  compact
                    ? opt.length > 6
                      ? 'text-xs sm:text-sm'
                      : opt.length > 4
                        ? 'text-sm sm:text-base'
                        : 'text-base sm:text-xl'
                    : opt.length > 6
                      ? 'text-sm sm:text-lg'
                      : opt.length > 4
                        ? 'text-base sm:text-xl'
                        : 'text-lg sm:text-2xl'
                } ${style.inner}`}
              >
                {opt}
              </div>
            </button>
          );
        })}

        {/* SEÇİLİ ARAÇ (oyna.png ÜSTTEN GÖRÜNÜM — AŞAĞIDAN YUKARI GİDİYOR) */}
        <div
          className="absolute bottom-3 z-25 pointer-events-none transition-all duration-200 ease-out"
          style={{
            left: `${carLeftPct}%`,
            transform: `translateX(-50%) ${
              result === 'correct'
                ? 'translateY(-16px) scale(1.06)'
                : result === 'wrong'
                  ? 'rotate(-6deg)'
                  : 'translateY(0)'
            }`,
          }}
        >
          <img
            src={vehicle.driveImg}
            alt={vehicle.name}
            draggable={false}
            className={`${
              compact ? 'w-14 h-22 sm:w-16 sm:h-26' : 'w-16 h-26 sm:w-20 sm:h-32'
            } object-contain drop-shadow-[0_10px_10px_rgba(15,23,42,0.45)]`}
          />
        </div>

        {/* ANLIK DOĞRU / YANLIŞ BİLDİRİMİ */}
        {result !== 'idle' && (
          <div className="absolute inset-x-0 bottom-28 z-30 flex justify-center pointer-events-none">
            <div
              className={`px-4 py-1.5 rounded-2xl border-2 font-black text-sm sm:text-base shadow-lg flex items-center gap-1.5 ${
                result === 'correct'
                  ? 'bg-emerald-500 border-white text-white'
                  : 'bg-rose-500 border-white text-white'
              }`}
            >
              {result === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Harika! “{target}”</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Doğru küp: “{target}”</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ALT HIZLI ŞERİT BUTONLARI (Mobil & Akıllı Tahta İçin Kolay Kontrol) */}
      <div className="bg-white border-t border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2 z-20">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {(['⬅ Sol', '⬆ Orta', 'Sağ ➡'] as const).map((lbl, idx) => (
            <button
              key={lbl}
              type="button"
              onClick={() => onSelectLane(idx as 0 | 1 | 2, false)}
              className={`min-h-[40px] rounded-xl border text-xs font-black transition cursor-pointer ${
                lane === idx
                  ? playerAccent === 'orange'
                    ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                    : 'bg-sky-500 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <span className="hidden xl:inline text-[11px] font-bold text-slate-400 shrink-0">
          {keysHint}
        </span>
      </div>
    </div>
  );
};

export const OkumaArabaOyunu: React.FC<OkumaArabaOyunuProps> = ({
  group,
  focusLetter,
  playMp3,
  onScore,
  onRoundDone,
}) => {
  const [phase, setPhase] = useState<'select' | 'playing' | 'finished'>('select');
  const [playerCount, setPlayerCount] = useState<1 | 2>(1);
  const [contentType, setContentType] = useState<ArabaContentType>('karisik');
  const [repeatMode, setRepeatMode] = useState<ArabaRepeatMode>(2); // 2× Aralıklı (pedagojik olarak önerilen varsayılan)
  const [p1Vehicle, setP1Vehicle] = useState<number>(0); // Kırmızı Araba
  const [p2Vehicle, setP2Vehicle] = useState<number>(1); // Mavi Motor
  const [activePickerPlayer, setActivePickerPlayer] = useState<1 | 2>(1);
  const [showTextHint, setShowTextHint] = useState<boolean>(false);

  const recentTargetsRef = useRef<Set<string>>(new Set());
  const speechTimersRef = useRef<number[]>([]);
  const [questions, setQuestions] = useState<ArabaQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);

  const [p1Lane, setP1Lane] = useState<0 | 1 | 2>(1);
  const [p2Lane, setP2Lane] = useState<0 | 1 | 2>(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Result, setP1Result] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [p2Result, setP2Result] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [progressY, setProgressY] = useState(0);

  const p1LaneRef = useRef<0 | 1 | 2>(1);
  const p2LaneRef = useRef<0 | 1 | 2>(1);
  const p1ResultRef = useRef<'idle' | 'correct' | 'wrong'>('idle');
  const p2ResultRef = useRef<'idle' | 'correct' | 'wrong'>('idle');
  const advancingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const waveStartRef = useRef<number>(0);

  const clearScheduledSpeech = useCallback(() => {
    speechTimersRef.current.forEach((id) => window.clearTimeout(id));
    speechTimersRef.current = [];
  }, []);

  // Net, anlaşılır ve düşünme paylı seslendirme (üst üste bindirmeden aralıklı tekrar)
  const speakTargetWithPause = useCallback(
    (target: string, times: ArabaRepeatMode = repeatMode) => {
      clearScheduledSpeech();
      const clean = target.trim();
      if (!clean) return;
      speakTurkish(clean, 0.84);

      const gapMs = times === 2 ? 1550 : 1350;
      for (let i = 1; i < times; i++) {
        const timerId = window.setTimeout(() => {
          const allAnswered =
            playerCount === 1
              ? p1ResultRef.current !== 'idle'
              : p1ResultRef.current !== 'idle' && p2ResultRef.current !== 'idle';
          if (!allAnswered) {
            speakTurkish(clean, 0.84);
          }
        }, gapMs * i);
        speechTimersRef.current.push(timerId);
      }
    },
    [clearScheduledSpeech, repeatMode, playerCount]
  );

  useEffect(() => {
    return () => {
      clearScheduledSpeech();
    };
  }, [clearScheduledSpeech]);

  useEffect(() => {
    p1LaneRef.current = p1Lane;
  }, [p1Lane]);
  useEffect(() => {
    p2LaneRef.current = p2Lane;
  }, [p2Lane]);
  useEffect(() => {
    p1ResultRef.current = p1Result;
  }, [p1Result]);
  useEffect(() => {
    p2ResultRef.current = p2Result;
  }, [p2Result]);

  // Harf grubu veya içerik değiştiğinde yeni 7 soru ile taze başla
  useEffect(() => {
    recentTargetsRef.current.clear();
    if (phase === 'playing') {
      clearScheduledSpeech();
      const fresh = generateSevenQuestions(group, focusLetter, contentType, recentTargetsRef.current);
      setQuestions(fresh);
      setQIndex(0);
      setP1Score(0);
      setP2Score(0);
      setP1Result('idle');
      setP2Result('idle');
      p1ResultRef.current = 'idle';
      p2ResultRef.current = 'idle';
      setP1Lane(1);
      setP2Lane(1);
      setProgressY(0);
      advancingRef.current = false;
      if (fresh[0]) {
        speakTargetWithPause(fresh[0].target, repeatMode);
      }
    }
  }, [group.id, focusLetter, contentType]);

  const currentQ = questions[qIndex];

  const startRace = useCallback(
    (overridePlayerCount?: 1 | 2) => {
      playMp3?.('/op.mp3');
      clearScheduledSpeech();
      const count = overridePlayerCount ?? playerCount;
      const fresh = generateSevenQuestions(group, focusLetter, contentType, recentTargetsRef.current);
      setQuestions(fresh);
      setQIndex(0);
      setP1Score(0);
      setP2Score(0);
      setP1Lane(1);
      setP2Lane(1);
      setP1Result('idle');
      setP2Result('idle');
      p1ResultRef.current = 'idle';
      p2ResultRef.current = 'idle';
      setProgressY(0);
      advancingRef.current = false;
      setPlayerCount(count);
      setPhase('playing');
      if (fresh[0]) {
        // Kullanıcı tıklaması içinde ilk hedefi hemen net ve aralıklı seslendir
        speakTargetWithPause(fresh[0].target, repeatMode);
      }
    },
    [group, focusLetter, contentType, playerCount, playMp3, clearScheduledSpeech, speakTargetWithPause, repeatMode]
  );

  // Yeni soru başladığında hedefi net ve aralıklı seslendir
  useEffect(() => {
    if (phase !== 'playing' || !currentQ) return;
    if (qIndex > 0) {
      speakTargetWithPause(currentQ.target, repeatMode);
    }
    return () => {
      clearScheduledSpeech();
    };
  }, [phase, qIndex, currentQ, speakTargetWithPause, repeatMode, clearScheduledSpeech]);

  const advanceToNextQuestion = useCallback(
    (finalP1Score: number, finalP2Score: number) => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      clearScheduledSpeech();
      window.setTimeout(() => {
        if (qIndex + 1 < questions.length) {
          setQIndex((prev) => prev + 1);
          setP1Result('idle');
          setP2Result('idle');
          p1ResultRef.current = 'idle';
          p2ResultRef.current = 'idle';
          setProgressY(0);
          advancingRef.current = false;
        } else {
          setPhase('finished');
          stopSpeaking();
          playMp3?.('/kazandin.mp3');
          const winnerIdx = playerCount === 2 ? (finalP2Score > finalP1Score ? 1 : 0) : 0;
          onRoundDone(winnerIdx, playerCount);
        }
      }, 1150);
    },
    [qIndex, questions.length, playerCount, playMp3, onRoundDone, clearScheduledSpeech]
  );

  const evaluatePlayer = useCallback(
    (pNum: 1 | 2, laneChosen: 0 | 1 | 2) => {
      if (!currentQ) return;
      const options = pNum === 1 ? currentQ.optionsP1 : currentQ.optionsP2;
      const chosenText = options[laneChosen] || '';
      const isCorrect = chosenText.toLocaleLowerCase('tr-TR') === currentQ.target.toLocaleLowerCase('tr-TR');

      if (pNum === 1 && p1ResultRef.current === 'idle') {
        const res = isCorrect ? 'correct' : 'wrong';
        p1ResultRef.current = res;
        setP1Result(res);
        if (isCorrect) {
          playMp3?.('/ding.mp3');
          setP1Score((s) => s + 1);
          onScore(10, true, 0);
        } else {
          playMp3?.('/yanlis.mp3');
          onScore(0, false, 0);
        }
      }

      if (pNum === 2 && p2ResultRef.current === 'idle') {
        const res = isCorrect ? 'correct' : 'wrong';
        p2ResultRef.current = res;
        setP2Result(res);
        if (isCorrect) {
          playMp3?.('/ding.mp3');
          setP2Score((s) => s + 1);
          onScore(10, true, 1);
        } else {
          playMp3?.('/yanlis.mp3');
          onScore(0, false, 1);
        }
      }

      const bothDone =
        playerCount === 1
          ? p1ResultRef.current !== 'idle'
          : p1ResultRef.current !== 'idle' && p2ResultRef.current !== 'idle';

      if (bothDone) {
        const nextP1 = p1Score + (pNum === 1 && isCorrect ? 1 : 0);
        const nextP2 = p2Score + (pNum === 2 && isCorrect ? 1 : 0);
        advanceToNextQuestion(nextP1, nextP2);
      }
    },
    [currentQ, playerCount, playMp3, onScore, p1Score, p2Score, advanceToNextQuestion]
  );

  // Küplerin ufuktan arabaya doğru akıcı ilerlemesi
  useEffect(() => {
    if (phase !== 'playing' || !currentQ) return;
    waveStartRef.current = performance.now();
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const bothResolved =
        playerCount === 1
          ? p1ResultRef.current !== 'idle'
          : p1ResultRef.current !== 'idle' && p2ResultRef.current !== 'idle';

      if (bothResolved) {
        return;
      }

      const elapsed = now - waveStartRef.current;
      const ratio = Math.min(1, elapsed / WAVE_DURATION_MS);
      setProgressY(ratio);

      if (ratio >= 1) {
        if (p1ResultRef.current === 'idle') {
          evaluatePlayer(1, p1LaneRef.current);
        }
        if (playerCount === 2 && p2ResultRef.current === 'idle') {
          evaluatePlayer(2, p2LaneRef.current);
        }
        return;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phase, qIndex, currentQ, playerCount, evaluatePlayer]);

  // Klavye kontrolleri (1. Oyuncu: A/D + W; 2. Oyuncu: Sol/Sağ + Yukarı; Tek kişilikte ikisi de!)
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (playerCount === 1) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setP1Lane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setP1Lane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
        } else if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (p1ResultRef.current === 'idle') {
            setProgressY(0.96);
            evaluatePlayer(1, p1LaneRef.current);
          }
        }
      } else {
        if (e.key === 'a' || e.key === 'A') {
          setP1Lane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
        } else if (e.key === 'd' || e.key === 'D') {
          setP1Lane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
        } else if (e.key === 'w' || e.key === 'W') {
          if (p1ResultRef.current === 'idle') evaluatePlayer(1, p1LaneRef.current);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setP2Lane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setP2Lane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (p2ResultRef.current === 'idle') evaluatePlayer(2, p2LaneRef.current);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, playerCount, evaluatePlayer]);

  const handlePlayerLaneSelect = (pNum: 1 | 2, laneIdx: 0 | 1 | 2, commitNow = false) => {
    if (pNum === 1) {
      if (p1ResultRef.current !== 'idle') return;
      setP1Lane(laneIdx);
      p1LaneRef.current = laneIdx;
      if (commitNow) {
        if (playerCount === 1) setProgressY(0.95);
        evaluatePlayer(1, laneIdx);
      }
    } else {
      if (p2ResultRef.current !== 'idle') return;
      setP2Lane(laneIdx);
      p2LaneRef.current = laneIdx;
      if (commitNow) {
        evaluatePlayer(2, laneIdx);
      }
    }
  };

  /* -------------------- 1. ARAÇ SEÇİM EKRANI (secc.png) -------------------- */
  if (phase === 'select') {
    const selectedIdx = activePickerPlayer === 1 ? p1Vehicle : p2Vehicle;
    return (
      <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border-2 border-slate-200 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
        {/* ÜST MOD VE İÇERİK ÇUBUĞU */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <Car className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Aracını Seç ve Yarışa Başla!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {group.title} ({group.lettersLabel}) · 7 Soruluk Sesli Şerit Yarışı
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1 KİŞİLİK / 2 KİŞİLİK SEÇİCİ */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  setPlayerCount(1);
                  setActivePickerPlayer(1);
                }}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${
                  playerCount === 1
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tek Kişilik</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  setPlayerCount(2);
                }}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${
                  playerCount === 2
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>2 Kişilik Yarış</span>
              </button>
            </div>

            {/* İÇERİK TÜRÜ (Sadece Türkçe Hece ve Kelime) */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {(
                [
                  { id: 'karisik', label: 'Hece + Kelime' },
                  { id: 'hece', label: 'Sadece Hece' },
                  { id: 'kelime', label: 'Sadece Kelime' },
                ] as { id: ArabaContentType; label: string }[]
              ).map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    setContentType(ct.id);
                  }}
                  className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                    contentType === ct.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            {/* SESLENDİRME RİTMİ */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {([2, 3] as ArabaRepeatMode[]).map((rep) => (
                <button
                  key={rep}
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    setRepeatMode(rep);
                  }}
                  title={rep === 2 ? 'Net ve düşünme paylı 2 tekrar (Önerilen)' : 'Aralıklı 3 tekrar'}
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                    repeatMode === rep
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {rep}× Ses
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2 KİŞİLİK MODDA OYUNCU SEÇİM SEKMESİ */}
        {playerCount === 2 && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setActivePickerPlayer(1);
              }}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                activePickerPlayer === 1
                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-200'
                  : 'bg-white border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-extrabold uppercase text-orange-600">1. Oyuncu Aracı</div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {OKUMA_ARABA_VEHICLES[p1Vehicle].name}
                </div>
              </div>
              <img
                src={OKUMA_ARABA_VEHICLES[p1Vehicle].selectImg}
                alt={OKUMA_ARABA_VEHICLES[p1Vehicle].name}
                className="w-16 h-12 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setActivePickerPlayer(2);
              }}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                activePickerPlayer === 2
                  ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200'
                  : 'bg-white border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-extrabold uppercase text-sky-600">2. Oyuncu Aracı</div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {OKUMA_ARABA_VEHICLES[p2Vehicle].name}
                </div>
              </div>
              <img
                src={OKUMA_ARABA_VEHICLES[p2Vehicle].selectImg}
                alt={OKUMA_ARABA_VEHICLES[p2Vehicle].name}
                className="w-16 h-12 object-contain"
              />
            </button>
          </div>
        )}

        {/* 9 ARAÇ SEÇİM IZGARASI (secc.png GÖRSELLERİ) */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {OKUMA_ARABA_VEHICLES.map((v, idx) => {
            const isPickedByActive = selectedIdx === idx;
            const isP1 = p1Vehicle === idx;
            const isP2 = playerCount === 2 && p2Vehicle === idx;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  if (activePickerPlayer === 1 || playerCount === 1) {
                    setP1Vehicle(idx);
                  } else {
                    setP2Vehicle(idx);
                  }
                }}
                className={`relative rounded-2xl border-2 p-2.5 bg-white flex flex-col items-center justify-between gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                  isPickedByActive
                    ? activePickerPlayer === 2 && playerCount === 2
                      ? 'border-sky-500 bg-sky-50/70 ring-3 ring-sky-200 shadow-md'
                      : 'border-orange-500 bg-orange-50/70 ring-3 ring-orange-200 shadow-md'
                    : 'border-slate-200 hover:border-slate-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-center w-full h-16 sm:h-20">
                  <img
                    src={v.selectImg}
                    alt={v.name}
                    draggable={false}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </div>
                <span className="text-[11px] font-black text-slate-800 text-center leading-tight">
                  {v.name}
                </span>

                {(isP1 || isP2) && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
                    {isP1 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-sky-600 text-white text-[9px] font-black">
                        2P
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* BAŞLAT BUTONU */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => startRace()}
            className="min-h-[54px] px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base sm:text-lg shadow-lg active:scale-95 transition flex items-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{playerCount === 2 ? '2 Kişilik Yarışa Başla!' : 'Yarışa Başla!'}</span>
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- 3. BİTİŞ / PODYUM EKRANI -------------------- */
  if (phase === 'finished') {
    const p1Veh = OKUMA_ARABA_VEHICLES[p1Vehicle];
    const p2Veh = OKUMA_ARABA_VEHICLES[p2Vehicle];
    const winnerText =
      playerCount === 1
        ? `Harika! ${TOTAL_QUESTIONS} sorudan ${p1Score} yıldız kazandın!`
        : p1Score > p2Score
          ? '1. Oyuncu Kazandı!'
          : p2Score > p1Score
            ? '2. Oyuncu Kazandı!'
            : 'Berabere! İkiniz de Harikasınız!';

    return (
      <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white border-2 border-emerald-300 p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-5">
        <Trophy className="w-16 h-16 text-amber-500" />
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{winnerText}</h3>

        <div className={`grid ${playerCount === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full max-w-md`}>
          <div className="rounded-2xl bg-orange-50 border-2 border-orange-300 p-4 flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase text-orange-700">1. Oyuncu</span>
            <img src={p1Veh.selectImg} alt={p1Veh.name} className="w-24 h-18 object-contain" />
            <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              <span>
                {p1Score} / {TOTAL_QUESTIONS}
              </span>
            </div>
          </div>

          {playerCount === 2 && (
            <div className="rounded-2xl bg-sky-50 border-2 border-sky-300 p-4 flex flex-col items-center gap-2">
              <span className="text-xs font-black uppercase text-sky-700">2. Oyuncu</span>
              <img src={p2Veh.selectImg} alt={p2Veh.name} className="w-24 h-18 object-contain" />
              <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                <span>
                  {p2Score} / {TOTAL_QUESTIONS}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => startRace()}
            className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Yeni Kelimelerle Tekrar Oyna</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setPhase('select');
            }}
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
          >
            <Car className="w-5 h-5" />
            <span>Araç Değiştir</span>
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- 2. AKTİF YARIŞ SAHNESİ (BEYAZ ZEMİN + 3 ŞERİT) -------------------- */
  if (!currentQ) return null;

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white border-2 border-slate-200 p-3 sm:p-4 shadow-xl flex flex-col gap-3">
      {/* Hızlı yol animasyonu keyframes */}
      <style>{`
        @keyframes okumaRoadScroll {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -46; }
        }
        .okuma-road-dash {
          animation: okumaRoadScroll 0.48s linear infinite;
        }
      `}</style>

      {/* ÜST OYUN KONTROL SATIRI */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              clearScheduledSpeech();
              stopSpeaking();
              setPhase('select');
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Car className="w-4 h-4 text-rose-600" />
            <span>Araç / Mod Değiştir</span>
          </button>

          <button
            type="button"
            onClick={() => speakTargetWithPause(currentQ.target, repeatMode)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tekrar Dinle</span>
          </button>

          <button
            type="button"
            onClick={() => setRepeatMode((r) => (r === 2 ? 3 : 2))}
            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-black cursor-pointer"
            title="Ses tekrar sayısını değiştir"
          >
            {repeatMode}× Aralıklı
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTextHint((v) => !v)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              showTextHint
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {showTextHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showTextHint ? 'Yazıyı Gizle' : 'Yazıyı Göster'}</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 tabular-nums">
            Soru {qIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>
      </div>

      {/* 1 KİŞİLİK VEYA 2 KİŞİLİK BÖLÜNMÜŞ EKRAN PİSTİ */}
      <div
        className={`grid gap-3 ${
          playerCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl w-full mx-auto'
        }`}
      >
        <RoadLaneTrack
          playerLabel="1. Oyuncu"
          playerAccent="orange"
          vehicleIdx={p1Vehicle}
          lane={p1Lane}
          onSelectLane={(l, commit) => handlePlayerLaneSelect(1, l, commit)}
          options={currentQ.optionsP1}
          target={currentQ.target}
          progressY={progressY}
          score={p1Score}
          questionNumber={qIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
          result={p1Result}
          showTextHint={showTextHint}
          onReplayAudio={() => speakTargetWithPause(currentQ.target, repeatMode)}
          compact={playerCount === 2}
          keysHint={playerCount === 2 ? 'A / D · W' : '← / → veya Dokun'}
          repeatMode={repeatMode}
        />

        {playerCount === 2 && (
          <RoadLaneTrack
            playerLabel="2. Oyuncu"
            playerAccent="sky"
            vehicleIdx={p2Vehicle}
            lane={p2Lane}
            onSelectLane={(l, commit) => handlePlayerLaneSelect(2, l, commit)}
            options={currentQ.optionsP2}
            target={currentQ.target}
            progressY={progressY}
            score={p2Score}
            questionNumber={qIndex + 1}
            totalQuestions={TOTAL_QUESTIONS}
            result={p2Result}
            showTextHint={showTextHint}
            onReplayAudio={() => speakTargetWithPause(currentQ.target, repeatMode)}
            compact
            keysHint="← / → · ↑"
            repeatMode={repeatMode}
          />
        )}
      </div>
    </div>
  );
};

export default OkumaArabaOyunu;
