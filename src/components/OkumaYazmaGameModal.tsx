import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eraser,
  Eye,
  EyeOff,
  Home,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  LETTER_GROUPS,
  LetterGroupData,
  LetterGroupId,
  OKUMA_YAZMA_ACTIVITIES,
  OkumaYazmaActivityId,
  SyllableWord,
  getFilteredSentences,
  getFilteredWords,
  getGroupSyllables,
  getLetterGroupById,
  getOkumaYazmaActivityMeta,
  shuffleArray,
  speakTurkish,
  stopSpeaking,
} from '../data/okumaYazmaData';
import { TurkishActivityBackground } from './TurkishActivityBackground';
import { StudentAvatarDock } from './StudentAvatarDock';
import { OkumaArabaOyunu } from './OkumaArabaOyunu';
import { Student } from '../types/student';

interface OkumaYazmaGameModalProps {
  activityId: OkumaYazmaActivityId;
  groupId: LetterGroupId;
  focusLetter: string | null;
  onChangeGroup: (groupId: LetterGroupId) => void;
  onChangeFocusLetter: (letter: string | null) => void;
  onSwitchActivity: (activityId: OkumaYazmaActivityId) => void;
  onClose: () => void;
  onGoHome: () => void;
  onCompleted?: (activityId: OkumaYazmaActivityId, groupId: LetterGroupId) => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (pIdx: number, id: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, pIdx?: number) => void;
  onGameCompleted?: (winnerIdx: number, pCount: number) => void;
}

const SYLLABLE_CHIP_COLORS = [
  'bg-rose-100 text-rose-900 border-rose-300',
  'bg-sky-100 text-sky-900 border-sky-300',
  'bg-emerald-100 text-emerald-900 border-emerald-300',
  'bg-amber-100 text-amber-900 border-amber-300',
];

const SYLLABLE_TEXT_COLORS = [
  'text-slate-900',
  'text-orange-600',
  'text-sky-700',
  'text-rose-600',
];

/** PDF'deki renkli hece gösterimi (siyah + turuncu dönüşümlü hece) */
const ColoredSyllableWord: React.FC<{ syllables: string[]; className?: string }> = ({
  syllables,
  className = '',
}) => (
  <span className={`inline-flex items-baseline ${className}`}>
    {syllables.map((syl, idx) => (
      <span key={`${syl}-${idx}`} className={idx % 2 === 0 ? 'text-slate-900' : 'text-orange-600'}>
        {syl}
      </span>
    ))}
  </span>
);

/** Basit Türkçe heceleme yardımcısı (Piramit metinlerinde renkli hece vurgusu için) */
function roughSplitTurkishSyllables(word: string): string[] {
  const vowels = 'aeıioöuüAEIİOÖUÜ';
  const clean = word;
  const vowelIndices: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    if (vowels.includes(clean[i])) vowelIndices.push(i);
  }
  if (vowelIndices.length <= 1) return [clean];
  const parts: string[] = [];
  let start = 0;
  for (let v = 0; v < vowelIndices.length - 1; v++) {
    const currV = vowelIndices[v];
    const nextV = vowelIndices[v + 1];
    const between = nextV - currV - 1;
    let splitAt = currV + 1;
    if (between >= 2) {
      splitAt = nextV - 1;
    } else if (between === 1) {
      splitAt = currV + 1;
    }
    parts.push(clean.slice(start, splitAt));
    start = splitAt;
  }
  parts.push(clean.slice(start));
  return parts.filter(Boolean);
}

/* ============================================================================
 * 1. HECE BİRLEŞTİRME (Sürükle-Bırak & Dokun)
 * ========================================================================== */
interface TileItem {
  uid: string;
  text: string;
}

const HeceBirlestirmeGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const [roundSeed, setRoundSeed] = useState(0);
  const questions = useMemo(() => {
    const multiSyllable = getFilteredWords(group, focusLetter).filter((w) => w.syllables.length >= 2);
    const pool = multiSyllable.length >= 6 ? multiSyllable : group.words.filter((w) => w.syllables.length >= 2);
    return shuffleArray(pool).slice(0, 10);
  }, [group, focusLetter, roundSeed]);

  const [qIndex, setQIndex] = useState(0);
  const [slots, setSlots] = useState<(TileItem | null)[]>([]);
  const [tray, setTray] = useState<TileItem[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [finished, setFinished] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  const currentWord: SyllableWord | undefined = questions[qIndex];

  useEffect(() => {
    setQIndex(0);
    setFinished(false);
  }, [group.id, focusLetter, roundSeed]);

  useEffect(() => {
    if (!currentWord) return;
    const targetTiles: TileItem[] = currentWord.syllables.map((s, idx) => ({
      uid: `t-${qIndex}-${idx}-${s}`,
      text: s,
    }));
    const allSyls = getGroupSyllables(group, focusLetter).filter(
      (s) => !currentWord.syllables.includes(s)
    );
    const distractors: TileItem[] = shuffleArray(allSyls)
      .slice(0, 3)
      .map((s, idx) => ({
        uid: `d-${qIndex}-${idx}-${s}`,
        text: s,
      }));
    setSlots(new Array(currentWord.syllables.length).fill(null));
    setTray(shuffleArray([...targetTiles, ...distractors]));
    setFeedback('idle');
  }, [currentWord, qIndex, group, focusLetter]);

  const validateIfFull = (nextSlots: (TileItem | null)[]) => {
    if (!currentWord) return;
    if (nextSlots.some((s) => s === null)) return;
    const built = nextSlots.map((s) => s!.text).join('');
    if (built.toLocaleLowerCase('tr-TR') === currentWord.word.toLocaleLowerCase('tr-TR')) {
      setFeedback('correct');
      playMp3?.('/ding.mp3');
      speakTurkish(currentWord.word, 0.85);
      onScore(10, true);
      window.setTimeout(() => {
        if (qIndex + 1 < questions.length) {
          setQIndex((prev) => prev + 1);
        } else {
          setFinished(true);
          onRoundDone();
        }
      }, 1250);
    } else {
      setFeedback('wrong');
      playMp3?.('/op.mp3');
      onScore(0, false);
      window.setTimeout(() => {
        setFeedback('idle');
      }, 950);
    }
  };

  const placeTileIntoSlot = (tile: TileItem, targetSlotIndex?: number) => {
    if (feedback === 'correct') return;
    const openIdx =
      targetSlotIndex !== undefined && slots[targetSlotIndex] === null
        ? targetSlotIndex
        : slots.findIndex((s) => s === null);
    if (openIdx === -1) return;

    playMp3?.('/op.mp3');
    speakTurkish(tile.text, 0.9);
    const nextSlots = [...slots];
    nextSlots[openIdx] = tile;
    const nextTray = tray.filter((t) => t.uid !== tile.uid);
    setSlots(nextSlots);
    setTray(nextTray);
    setFeedback('idle');
    validateIfFull(nextSlots);
  };

  const removeSlotTile = (slotIdx: number) => {
    if (feedback === 'correct') return;
    const tile = slots[slotIdx];
    if (!tile) return;
    playMp3?.('/op.mp3');
    const nextSlots = [...slots];
    nextSlots[slotIdx] = null;
    setSlots(nextSlots);
    setTray((prev) => [...prev, tile]);
    setFeedback('idle');
  };

  if (finished) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border-2 border-emerald-300 p-6 text-center shadow-xl flex flex-col items-center gap-4">
        <Trophy className="w-14 h-14 text-amber-500" />
        <h3 className="text-2xl font-black text-slate-900">Harika Gidiyorsun!</h3>
        <p className="text-sm sm:text-base text-slate-600">
          {group.title} ({group.lettersLabel}) için {questions.length} kelimeyi başarıyla birleştirdin.
        </p>
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setRoundSeed((s) => s + 1);
          }}
          className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Kelimelerle Tekrar Oyna</span>
        </button>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
      <div className="w-full rounded-3xl bg-white/95 border-2 border-sky-200 p-4 sm:p-6 shadow-lg flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <span>
            Soru <strong className="text-sky-700">{qIndex + 1}</strong> / {questions.length}
          </span>
          <span className="text-slate-500">Heceleri sürükle ya da dokunarak sıraya koy</span>
        </div>

        {/* HEDEF KELİME İPUCU + SESLİ DİNLE */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentWord.emoji && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-4xl sm:text-5xl shadow-xs">
              {currentWord.emoji}
            </div>
          )}
          <button
            type="button"
            onClick={() => speakTurkish(currentWord.word, 0.8)}
            className="min-h-[52px] px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base sm:text-lg flex items-center gap-2.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
            <span>Kelimeyi Dinle</span>
          </button>
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-lg sm:text-2xl tracking-wide">
            {currentWord.word}
          </div>
        </div>

        {/* HECE YERLEŞTİRME KUTULARI */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
          {slots.map((slot, idx) => (
            <React.Fragment key={idx}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const uid = e.dataTransfer.getData('text/plain') || draggedTileId;
                  const found = tray.find((t) => t.uid === uid);
                  if (found) placeTileIntoSlot(found, idx);
                  setDraggedTileId(null);
                }}
                onClick={() => removeSlotTile(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') removeSlotTile(idx);
                }}
                className={`min-w-[88px] sm:min-w-[116px] h-16 sm:h-20 px-4 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all cursor-pointer ${
                  slot
                    ? feedback === 'correct'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 scale-105 shadow-md'
                      : feedback === 'wrong'
                        ? 'bg-rose-100 border-rose-500 text-rose-900'
                        : `${SYLLABLE_CHIP_COLORS[idx % SYLLABLE_CHIP_COLORS.length]} shadow-sm`
                    : 'bg-slate-50 border-dashed border-slate-400 text-slate-400 hover:border-sky-500 hover:bg-sky-50'
                }`}
              >
                {slot ? slot.text : `${idx + 1}. hece`}
              </div>
              {idx < slots.length - 1 && (
                <span className="text-2xl font-black text-slate-400 select-none">+</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* GERİ BİLDİRİM METNİ */}
        <div className="min-h-[32px] flex items-center justify-center">
          {feedback === 'correct' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-900 font-black text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Harika! {currentWord.syllables.join(' + ')} = {currentWord.word}
              </span>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-100 border border-rose-400 text-rose-900 font-black text-sm sm:text-base">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Hecelerin sırasını kontrol et! Kutudaki heceye dokunup çıkarabilirsin.</span>
            </div>
          )}
        </div>

        {/* HECE HAVUZU */}
        <div className="w-full pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {tray.map((tile, idx) => (
              <button
                key={tile.uid}
                type="button"
                draggable
                onDragStart={(e) => {
                  setDraggedTileId(tile.uid);
                  e.dataTransfer.setData('text/plain', tile.uid);
                }}
                onClick={() => placeTileIntoSlot(tile)}
                className={`min-w-[82px] sm:min-w-[104px] min-h-[56px] sm:min-h-[64px] px-4 py-2 rounded-2xl border-2 font-black text-2xl sm:text-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition cursor-grab active:cursor-grabbing ${
                  SYLLABLE_CHIP_COLORS[idx % SYLLABLE_CHIP_COLORS.length]
                }`}
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. BULUT EŞLEŞTİRME (PDF'deki Bulut Eşleştirme + Büyük/Küçük Harf + Görsel)
 * ========================================================================== */
type CloudMode = 'same_word' | 'case_match' | 'emoji_word';

interface CloudPair {
  id: string;
  leftText: string;
  rightText: string;
  speakText: string;
}

const BulutEslestirmeGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const [mode, setMode] = useState<CloudMode>('same_word');
  const [boardIndex, setBoardIndex] = useState(0);
  const [roundSeed, setRoundSeed] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const TOTAL_BOARDS = 3;

  const { leftCards, rightCards } = useMemo(() => {
    let pairs: CloudPair[] = [];
    if (mode === 'case_match') {
      const letters = shuffleArray(group.letters).slice(0, 4);
      pairs = letters.map((l) => ({
        id: l.upper,
        leftText: l.upper,
        rightText: l.lower,
        speakText: `${l.upper} harfi`,
      }));
    } else if (mode === 'emoji_word') {
      const emojiWords = getFilteredWords(group, focusLetter).filter((w) => Boolean(w.emoji));
      const pool = emojiWords.length >= 4 ? emojiWords : group.words.filter((w) => Boolean(w.emoji));
      const picked = shuffleArray(pool).slice(0, 4);
      pairs = picked.map((w) => ({
        id: w.word,
        leftText: w.emoji || '⭐',
        rightText: w.word,
        speakText: w.word,
      }));
    } else {
      const words = shuffleArray(getFilteredWords(group, focusLetter)).slice(0, 4);
      pairs = words.map((w) => ({
        id: w.word,
        leftText: w.word,
        rightText: w.word,
        speakText: w.word,
      }));
    }
    return {
      leftCards: shuffleArray(pairs),
      rightCards: shuffleArray(pairs),
    };
  }, [group, focusLetter, mode, boardIndex, roundSeed]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatchedIds([]);
    setWrongMsg(null);
  }, [group.id, focusLetter, mode, boardIndex, roundSeed]);

  useEffect(() => {
    setBoardIndex(0);
    setFinished(false);
  }, [group.id, focusLetter, mode, roundSeed]);

  const handleRightClick = (pair: CloudPair) => {
    if (matchedIds.includes(pair.id)) return;
    if (!selectedLeft) {
      setWrongMsg('Önce sol sütundan bir bulut seç!');
      return;
    }
    if (selectedLeft === pair.id) {
      playMp3?.('/ding.mp3');
      speakTurkish(pair.speakText, 0.9);
      const nextMatched = [...matchedIds, pair.id];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setWrongMsg(null);
      onScore(10, true);
      if (nextMatched.length === leftCards.length) {
        window.setTimeout(() => {
          if (boardIndex + 1 < TOTAL_BOARDS) {
            setBoardIndex((b) => b + 1);
          } else {
            setFinished(true);
            onRoundDone();
          }
        }, 900);
      }
    } else {
      playMp3?.('/op.mp3');
      onScore(0, false);
      setWrongMsg('Eşleşmedi, dikkatlice tekrar dene!');
    }
  };

  if (finished) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border-2 border-cyan-300 p-6 text-center shadow-xl flex flex-col items-center gap-4">
        <Trophy className="w-14 h-14 text-amber-500" />
        <h3 className="text-2xl font-black text-slate-900">Tüm Bulutlar Eşleşti!</h3>
        <p className="text-sm sm:text-base text-slate-600">
          {group.title} bulut eşleştirme turunu başarıyla tamamladın.
        </p>
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setRoundSeed((s) => s + 1);
          }}
          className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Bulutlarla Oyna</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white/95 border-2 border-cyan-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {(
            [
              { id: 'same_word', label: 'Aynı Kelime' },
              { id: 'emoji_word', label: 'Görsel - Kelime' },
              { id: 'case_match', label: 'Büyük - Küçük Harf' },
            ] as { id: CloudMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setMode(m.id);
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer ${
                mode === m.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
          Tablo {boardIndex + 1} / {TOTAL_BOARDS}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center">
        {/* SOL BULUTLAR */}
        <div className="flex flex-col gap-3">
          {leftCards.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft === item.id;
            return (
              <button
                key={`L-${item.id}`}
                type="button"
                disabled={isMatched}
                onClick={() => {
                  playMp3?.('/op.mp3');
                  setSelectedLeft(item.id);
                  setWrongMsg(null);
                  speakTurkish(item.speakText, 0.9);
                }}
                className={`min-h-[64px] sm:min-h-[74px] px-4 py-2 rounded-[28px] border-2 font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'emoji_word' ? 'text-4xl' : 'text-2xl sm:text-3xl'
                } ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-75 cursor-default'
                    : isSelected
                      ? 'bg-sky-600 border-sky-800 text-white scale-[1.03] shadow-lg ring-4 ring-sky-200'
                      : 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-slate-900 shadow-sm'
                }`}
              >
                <span>{item.leftText}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* SAĞ BULUTLAR */}
        <div className="flex flex-col gap-3">
          {rightCards.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            return (
              <button
                key={`R-${item.id}`}
                type="button"
                disabled={isMatched}
                onClick={() => handleRightClick(item)}
                className={`min-h-[64px] sm:min-h-[74px] px-4 py-2 rounded-[28px] border-2 text-2xl sm:text-3xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-75 cursor-default'
                    : selectedLeft
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 hover:border-amber-500 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <span>{item.rightText}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[28px] text-center">
        {wrongMsg ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700">
            <XCircle className="w-4 h-4" />
            {wrongMsg}
          </span>
        ) : (
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            Sol taraftan bir bulut seç, sonra sağdaki eşine dokun!
          </span>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. BALON PATLATMA · SES AVI (Hızlı Seç-Dokun)
 * ========================================================================== */
type BalloonMode = 'hece' | 'kelime' | 'harf';

interface BalloonItem {
  uid: string;
  label: string;
  isTarget: boolean;
  popped: boolean;
  colorClass: string;
}

const BALLOON_COLORS = [
  'from-rose-400 to-rose-600 border-rose-700',
  'from-sky-400 to-sky-600 border-sky-700',
  'from-amber-400 to-orange-500 border-orange-600',
  'from-emerald-400 to-emerald-600 border-emerald-700',
  'from-violet-400 to-purple-600 border-purple-700',
  'from-cyan-400 to-teal-600 border-teal-700',
];

const BalonSesAviGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const [mode, setMode] = useState<BalloonMode>('hece');
  const [listenOnly, setListenOnly] = useState(false);
  const [wave, setWave] = useState(0);
  const [roundSeed, setRoundSeed] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [targetText, setTargetText] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const TOTAL_WAVES = 8;

  useEffect(() => {
    setWave(0);
    setFinished(false);
  }, [group.id, focusLetter, mode, roundSeed]);

  useEffect(() => {
    if (finished) return;
    let pool: string[] = [];
    if (mode === 'harf') {
      pool = group.letters.flatMap((l) => [l.upper, l.lower]);
    } else if (mode === 'kelime') {
      pool = getFilteredWords(group, focusLetter).map((w) => w.word);
    } else {
      pool = getGroupSyllables(group, focusLetter);
    }
    const uniquePool = Array.from(new Set(pool));
    const chosenTarget = uniquePool[Math.floor(Math.random() * uniquePool.length)] || 'el';
    const distractors = shuffleArray(uniquePool.filter((x) => x !== chosenTarget));
    const targetCount = 3;
    const items: BalloonItem[] = [];
    for (let i = 0; i < targetCount; i++) {
      items.push({
        uid: `t-${wave}-${i}`,
        label: chosenTarget,
        isTarget: true,
        popped: false,
        colorClass: BALLOON_COLORS[i % BALLOON_COLORS.length],
      });
    }
    for (let i = 0; i < 8 - targetCount; i++) {
      const dist = distractors[i % distractors.length] || 'la';
      items.push({
        uid: `d-${wave}-${i}`,
        label: dist,
        isTarget: false,
        popped: false,
        colorClass: BALLOON_COLORS[(i + targetCount) % BALLOON_COLORS.length],
      });
    }
    setTargetText(chosenTarget);
    setBalloons(shuffleArray(items));
    setStatusMsg(null);
    speakTurkish(chosenTarget, 0.85);
  }, [group, focusLetter, mode, wave, roundSeed, finished]);

  const handlePop = (balloon: BalloonItem) => {
    if (balloon.popped) return;
    if (balloon.isTarget) {
      playMp3?.('/ding.mp3');
      onScore(10, true);
      const next = balloons.map((b) => (b.uid === balloon.uid ? { ...b, popped: true } : b));
      setBalloons(next);
      const remaining = next.filter((b) => b.isTarget && !b.popped).length;
      if (remaining === 0) {
        setStatusMsg(`Harika! "${targetText}" balonlarının hepsini patlattın!`);
        window.setTimeout(() => {
          if (wave + 1 < TOTAL_WAVES) {
            setWave((w) => w + 1);
          } else {
            setFinished(true);
            onRoundDone();
          }
        }, 850);
      } else {
        setStatusMsg(`Süper! Kalan hedef balon: ${remaining}`);
      }
    } else {
      playMp3?.('/op.mp3');
      onScore(0, false);
      speakTurkish(balloon.label, 0.9);
      setStatusMsg(`Bu balon "${balloon.label}". Hedefimiz: ${listenOnly ? 'Dinle!' : `"${targetText}"`}`);
    }
  };

  if (finished) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border-2 border-rose-300 p-6 text-center shadow-xl flex flex-col items-center gap-4">
        <Trophy className="w-14 h-14 text-amber-500" />
        <h3 className="text-2xl font-black text-slate-900">Balon Avcısı Oldun!</h3>
        <p className="text-sm sm:text-base text-slate-600">
          {TOTAL_WAVES} dalgadaki tüm hedef balonları başarıyla buldun.
        </p>
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setRoundSeed((s) => s + 1);
          }}
          className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Balonlarla Oyna</span>
        </button>
      </div>
    );
  }

  const remainingTargets = balloons.filter((b) => b.isTarget && !b.popped).length;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 border-2 border-rose-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {(
            [
              { id: 'hece', label: 'Hece Avı' },
              { id: 'kelime', label: 'Kelime Avı' },
              { id: 'harf', label: 'Harf Avı' },
            ] as { id: BalloonMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setMode(m.id);
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer ${
                mode === m.id ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setListenOnly((v) => !v)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              listenOnly
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {listenOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{listenOnly ? 'Sadece Dinle Modu' : 'Yazıyı Gizle'}</span>
          </button>
          <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
            Tur {wave + 1}/{TOTAL_WAVES}
          </span>
        </div>
      </div>

      {/* HEDEF ÇUBUĞU */}
      <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => speakTurkish(targetText, 0.8)}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition"
          >
            <Volume2 className="w-5 h-5" />
            <span>Sesi Dinle</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600">Hedef Balon:</span>
            <span className="px-4 py-1.5 rounded-xl bg-white border-2 border-rose-300 text-2xl sm:text-3xl font-black text-rose-700 min-w-[76px] text-center">
              {listenOnly ? '???' : targetText}
            </span>
          </div>
        </div>
        <span className="text-sm font-black text-rose-800 tabular-nums">
          Kalan: {remainingTargets} balon
        </span>
      </div>

      {/* BALON IZGARASI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-2">
        {balloons.map((b) => (
          <button
            key={b.uid}
            type="button"
            disabled={b.popped}
            onClick={() => handlePop(b)}
            className={`relative min-h-[112px] sm:min-h-[126px] rounded-[50%_50%_46%_46%/55%_55%_45%_45%] border-2 bg-gradient-to-b ${b.colorClass} text-white font-black text-2xl sm:text-3xl shadow-lg transition-all flex items-center justify-center cursor-pointer select-none ${
              b.popped
                ? 'scale-50 opacity-0 pointer-events-none'
                : 'hover:scale-105 active:scale-90'
            }`}
          >
            <span className="absolute top-3 left-5 w-4 h-7 rounded-full bg-white/30 rotate-12 pointer-events-none" />
            <span className="drop-shadow-sm px-2 text-center leading-tight">{b.label}</span>
          </button>
        ))}
      </div>

      {statusMsg && (
        <div className="text-center text-sm sm:text-base font-extrabold text-slate-800">
          {statusMsg}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 4. HECE & KELİME ÇARKIFELEĞİ (Akıllı Tahta Sınıf Oyunu)
 * ========================================================================== */
type WheelMode = 'hece' | 'kelime' | 'cumle';

const WHEEL_SLICE_COLORS = [
  '#0284c7',
  '#e11d48',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#4f46e5',
];

const HeceCarkifelekGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
}> = ({ group, focusLetter, playMp3, onScore }) => {
  const [mode, setMode] = useState<WheelMode>('kelime');
  const [wheelSeed, setWheelSeed] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ label: string; syllables?: string[] } | null>(null);
  const [readCount, setReadCount] = useState(0);

  const slices = useMemo(() => {
    if (mode === 'hece') {
      return shuffleArray(getGroupSyllables(group, focusLetter))
        .slice(0, 8)
        .map((s) => ({ label: s }));
    }
    if (mode === 'cumle') {
      const sents = shuffleArray(getFilteredSentences(group, focusLetter));
      const out: { label: string }[] = [];
      for (let i = 0; i < 8; i++) {
        out.push({ label: sents[i % sents.length].text });
      }
      return out;
    }
    const words = shuffleArray(getFilteredWords(group, focusLetter));
    const out: { label: string; syllables: string[] }[] = [];
    for (let i = 0; i < 8; i++) {
      const w = words[i % words.length];
      out.push({ label: w.word, syllables: w.syllables });
    }
    return out;
  }, [group, focusLetter, mode, wheelSeed]);

  useEffect(() => {
    setSelectedItem(null);
  }, [group.id, focusLetter, mode, wheelSeed]);

  const spinWheel = () => {
    if (spinning) return;
    playMp3?.('/op.mp3');
    setSpinning(true);
    setSelectedItem(null);
    const chosenIdx = Math.floor(Math.random() * slices.length);
    const sliceAngle = 360 / slices.length;
    // Pointer is at top (270deg in SVG coordinates -> 0deg visually top)
    const targetSliceCenter = chosenIdx * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * (4 + Math.floor(Math.random() * 2));
    const nextRotation = rotation + extraSpins + (360 - ((rotation + targetSliceCenter) % 360));
    setRotation(nextRotation);
    window.setTimeout(() => {
      setSpinning(false);
      const landed = slices[chosenIdx];
      setSelectedItem(landed);
      playMp3?.('/ding.mp3');
    }, 2600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 border-2 border-amber-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {(
            [
              { id: 'hece', label: 'Heceler' },
              { id: 'kelime', label: 'Kelimeler' },
              { id: 'cumle', label: 'Cümleler' },
            ] as { id: WheelMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setMode(m.id);
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer ${
                mode === m.id ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-700 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setWheelSeed((s) => s + 1);
          }}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Çarkı Yenile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* ÇARK SVG */}
        <div className="relative flex flex-col items-center justify-center py-2">
          {/* ÜST İŞARET OKU */}
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-slate-900 z-20 -mb-2 drop-shadow" />
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full drop-shadow-xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
              }}
            >
              {slices.map((slice, idx) => {
                const count = slices.length;
                const startAngle = (idx * 360) / count - 90;
                const endAngle = ((idx + 1) * 360) / count - 90;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 120 + 114 * Math.cos(startRad);
                const y1 = 120 + 114 * Math.sin(startRad);
                const x2 = 120 + 114 * Math.cos(endRad);
                const y2 = 120 + 114 * Math.sin(endRad);
                const midAngle = (startAngle + endAngle) / 2;
                const shortLabel =
                  slice.label.length > 10 ? `${slice.label.slice(0, 9)}…` : slice.label;

                return (
                  <g key={`${slice.label}-${idx}`}>
                    <path
                      d={`M120,120 L${x1},${y1} A114,114 0 0,1 ${x2},${y2} Z`}
                      fill={WHEEL_SLICE_COLORS[idx % WHEEL_SLICE_COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <text
                      x="120"
                      y="120"
                      fill="#ffffff"
                      fontSize={mode === 'cumle' ? '10' : '14'}
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle}, 120, 120) translate(68, 0)`}
                    >
                      {shortLabel}
                    </text>
                  </g>
                );
              })}
              <circle cx="120" cy="120" r="24" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
              <text x="120" y="125" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0f172a">
                ★
              </text>
            </svg>
          </div>
        </div>

        {/* SONUÇ KARTI & KONTROLLER */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <button
            type="button"
            disabled={spinning}
            onClick={spinWheel}
            className="w-full max-w-xs min-h-[56px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-black text-lg shadow-lg active:scale-95 transition cursor-pointer"
          >
            {spinning ? 'Çark Dönüyor...' : '🎡 Çarkı Çevir!'}
          </button>

          <div className="w-full rounded-3xl bg-amber-50/90 border-2 border-amber-300 p-5 min-h-[168px] flex flex-col items-center justify-center gap-3">
            {selectedItem ? (
              <>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  Şimdi Sesli Oku
                </span>
                <div className="text-3xl sm:text-5xl font-black tracking-wide leading-tight">
                  {selectedItem.syllables ? (
                    <ColoredSyllableWord syllables={selectedItem.syllables} />
                  ) : (
                    <span className="text-slate-900">{selectedItem.label}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => speakTurkish(selectedItem.label, 0.82)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Dinle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playMp3?.('/ding.mp3');
                      onScore(10, true);
                      setReadCount((c) => c + 1);
                      setSelectedItem(null);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Okudum! (+10 Puan)</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm sm:text-base font-bold text-amber-900/75">
                Çarkı çevir, gelen {mode === 'hece' ? 'heceyi' : mode === 'cumle' ? 'cümleyi' : 'kelimeyi'} sınıfça sesli oku!
              </p>
            )}
          </div>

          <span className="text-xs font-bold text-slate-500 tabular-nums">
            Okunan Kart Sayısı: {readCount}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. SÜRPRİZ KUTULAR (Kutuyu Aç & Oku / Dinle-Bul)
 * ========================================================================== */
const BOX_COLORS = [
  'from-violet-500 to-purple-700 border-purple-800',
  'from-sky-500 to-blue-700 border-blue-800',
  'from-rose-500 to-pink-700 border-pink-800',
  'from-emerald-500 to-teal-700 border-teal-800',
  'from-amber-500 to-orange-600 border-orange-700',
  'from-indigo-500 to-indigo-700 border-indigo-800',
];

const SurprizKutularGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const [seed, setSeed] = useState(0);
  const [openedBoxes, setOpenedBoxes] = useState<number[]>([]);
  const [activeBoxIdx, setActiveBoxIdx] = useState<number | null>(null);

  const boxes = useMemo(() => {
    const words = shuffleArray(getFilteredWords(group, focusLetter));
    const list: SyllableWord[] = [];
    for (let i = 0; i < 9; i++) {
      list.push(words[i % words.length]);
    }
    return list;
  }, [group, focusLetter, seed]);

  useEffect(() => {
    setOpenedBoxes([]);
    setActiveBoxIdx(null);
  }, [group.id, focusLetter, seed]);

  const activeWord = activeBoxIdx !== null ? boxes[activeBoxIdx] : null;

  const handleOpenBox = (idx: number) => {
    if (openedBoxes.includes(idx)) return;
    playMp3?.('/op.mp3');
    setActiveBoxIdx(idx);
    speakTurkish(boxes[idx].word, 0.85);
  };

  const handleConfirmRead = () => {
    if (activeBoxIdx === null) return;
    playMp3?.('/ding.mp3');
    onScore(10, true);
    const nextOpened = [...openedBoxes, activeBoxIdx];
    setOpenedBoxes(nextOpened);
    setActiveBoxIdx(null);
    if (nextOpened.length === boxes.length) {
      onRoundDone();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 border-2 border-violet-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Bir Sürpriz Kutu Seç ve Aç!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Açılan kutudaki renkli heceli kelimeyi sesli oku, sonra puanını al.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-violet-700 tabular-nums">
            Açılan: {openedBoxes.length}/{boxes.length}
          </span>
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setSeed((s) => s + 1);
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Kutular</span>
          </button>
        </div>
      </div>

      {/* AÇILAN KUTU SAHNESİ */}
      {activeWord && (
        <div className="rounded-3xl bg-violet-50 border-2 border-violet-400 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-violet-200 flex items-center justify-center text-4xl shadow-xs">
              {activeWord.emoji || '🎁'}
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase text-violet-700">
                {(activeBoxIdx ?? 0) + 1} Numaralı Kutu Açıldı!
              </div>
              <div className="text-3xl sm:text-5xl font-black tracking-wide mt-0.5">
                <ColoredSyllableWord syllables={activeWord.syllables} />
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1">
                Heceler: {activeWord.syllables.join(' - ')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => speakTurkish(activeWord.word, 0.8)}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Dinle</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmRead}
              className="min-h-[48px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Okudum! (+10)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3x3 SÜRPRİZ KUTULAR */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {boxes.map((wordObj, idx) => {
          const isOpened = openedBoxes.includes(idx);
          const isActive = activeBoxIdx === idx;
          return (
            <button
              key={`box-${seed}-${idx}`}
              type="button"
              disabled={isOpened}
              onClick={() => handleOpenBox(idx)}
              className={`min-h-[96px] sm:min-h-[116px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isOpened
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-default'
                  : isActive
                    ? 'bg-amber-100 border-amber-500 text-amber-950 scale-[1.03] shadow-lg'
                    : `bg-gradient-to-br ${BOX_COLORS[idx % BOX_COLORS.length]} text-white shadow-md hover:scale-[1.03] active:scale-95`
              }`}
            >
              {isOpened ? (
                <>
                  <span className="text-xl sm:text-2xl font-black">{wordObj.word}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Okundu
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">
                    🎁
                  </span>
                  <span className="text-xl sm:text-2xl font-black tabular-nums">{idx + 1}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. KELİME & CÜMLE KURMA (Sürükle-Bırak / Sırala — Anagram)
 * ========================================================================== */
type AnagramMode = 'cumle' | 'kelime';

const AnagramDizmeGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const [mode, setMode] = useState<AnagramMode>('cumle');
  const [roundSeed, setRoundSeed] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<TileItem[]>([]);
  const [bank, setBank] = useState<TileItem[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [finished, setFinished] = useState(false);

  const items = useMemo(() => {
    if (mode === 'cumle') {
      const sents = getFilteredSentences(group, focusLetter).filter((s) => s.words.length >= 2);
      return shuffleArray(sents)
        .slice(0, 8)
        .map((s) => ({
          answerText: s.text,
          tokens: s.words,
          emoji: '📝',
        }));
    }
    const words = getFilteredWords(group, focusLetter).filter((w) => w.syllables.length >= 2);
    return shuffleArray(words)
      .slice(0, 8)
      .map((w) => ({
        answerText: w.word,
        tokens: w.syllables,
        emoji: w.emoji || '🔤',
      }));
  }, [group, focusLetter, mode, roundSeed]);

  const current = items[qIndex];

  useEffect(() => {
    setQIndex(0);
    setFinished(false);
  }, [group.id, focusLetter, mode, roundSeed]);

  useEffect(() => {
    if (!current) return;
    let scrambled = current.tokens.map((t, idx) => ({ uid: `${qIndex}-${idx}-${t}`, text: t }));
    if (scrambled.length > 1) {
      let guard = 0;
      do {
        scrambled = shuffleArray(scrambled);
        guard++;
      } while (
        guard < 8 &&
        scrambled.map((x) => x.text).join(' ') === current.tokens.join(' ')
      );
    }
    setPicked([]);
    setBank(scrambled);
    setFeedback('idle');
  }, [current, qIndex]);

  const checkAnswer = (nextPicked: TileItem[]) => {
    if (!current || nextPicked.length !== current.tokens.length) return;
    const isMatch = nextPicked.every((t, i) => t.text === current.tokens[i]);
    if (isMatch) {
      setFeedback('correct');
      playMp3?.('/ding.mp3');
      speakTurkish(current.answerText, 0.85);
      onScore(10, true);
      window.setTimeout(() => {
        if (qIndex + 1 < items.length) {
          setQIndex((prev) => prev + 1);
        } else {
          setFinished(true);
          onRoundDone();
        }
      }, 1300);
    } else {
      setFeedback('wrong');
      playMp3?.('/op.mp3');
      onScore(0, false);
    }
  };

  const handlePickFromBank = (tile: TileItem) => {
    if (feedback === 'correct') return;
    playMp3?.('/op.mp3');
    const nextPicked = [...picked, tile];
    const nextBank = bank.filter((b) => b.uid !== tile.uid);
    setPicked(nextPicked);
    setBank(nextBank);
    setFeedback('idle');
    checkAnswer(nextPicked);
  };

  const handleReturnToBank = (tile: TileItem) => {
    if (feedback === 'correct') return;
    playMp3?.('/op.mp3');
    setPicked((prev) => prev.filter((p) => p.uid !== tile.uid));
    setBank((prev) => [...prev, tile]);
    setFeedback('idle');
  };

  if (finished) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border-2 border-emerald-300 p-6 text-center shadow-xl flex flex-col items-center gap-4">
        <Trophy className="w-14 h-14 text-amber-500" />
        <h3 className="text-2xl font-black text-slate-900">Tebrikler! Sıralama Ustası!</h3>
        <p className="text-sm sm:text-base text-slate-600">
          {items.length} {mode === 'cumle' ? 'cümleyi' : 'kelimeyi'} doğru sırayla kurdun.
        </p>
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setRoundSeed((s) => s + 1);
          }}
          className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Sorularla Tekrar Oyna</span>
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white/95 border-2 border-emerald-200 p-4 sm:p-6 shadow-lg flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {(
            [
              { id: 'cumle', label: 'Cümle Kur' },
              { id: 'kelime', label: 'Kelime Kur' },
            ] as { id: AnagramMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setMode(m.id);
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition cursor-pointer ${
                mode === m.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakTurkish(current.answerText, 0.8)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>İpucu Dinle</span>
          </button>
          <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
            {qIndex + 1}/{items.length}
          </span>
        </div>
      </div>

      {/* CEVAP RAYI (DROP TARGET) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const uid = e.dataTransfer.getData('text/plain');
          const found = bank.find((b) => b.uid === uid);
          if (found) handlePickFromBank(found);
        }}
        className={`min-h-[88px] rounded-2xl border-2 border-dashed p-3 sm:p-4 flex flex-wrap items-center justify-center gap-2.5 transition ${
          feedback === 'correct'
            ? 'bg-emerald-50 border-emerald-500'
            : feedback === 'wrong'
              ? 'bg-rose-50 border-rose-400'
              : 'bg-slate-50 border-slate-300'
        }`}
      >
        {picked.length === 0 ? (
          <span className="text-sm sm:text-base font-bold text-slate-400">
            Aşağıdaki kartlara sırayla dokun veya buraya sürükle
          </span>
        ) : (
          picked.map((tile, idx) => (
            <button
              key={tile.uid}
              type="button"
              onClick={() => handleReturnToBank(tile)}
              className={`min-h-[52px] px-4 py-2 rounded-xl border-2 font-black text-xl sm:text-2xl shadow-sm cursor-pointer active:scale-95 transition ${
                SYLLABLE_CHIP_COLORS[idx % SYLLABLE_CHIP_COLORS.length]
              }`}
            >
              {tile.text}
            </button>
          ))
        )}
      </div>

      {/* GERİ BİLDİRİM */}
      <div className="min-h-[30px] flex items-center justify-center">
        {feedback === 'correct' && (
          <span className="inline-flex items-center gap-2 text-emerald-700 font-black text-base">
            <CheckCircle2 className="w-5 h-5" />
            Doğru! “{current.answerText}”
          </span>
        )}
        {feedback === 'wrong' && (
          <span className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm sm:text-base">
            <XCircle className="w-5 h-5" />
            Sıra biraz karıştı! Yukarıdaki kartlara dokunup yeniden dizebilirsin.
          </span>
        )}
      </div>

      {/* KARIŞIK KARTLAR */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-200">
        {bank.map((tile, idx) => (
          <button
            key={tile.uid}
            type="button"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', tile.uid)}
            onClick={() => handlePickFromBank(tile)}
            className={`min-h-[56px] px-5 py-2.5 rounded-2xl border-2 bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-900 font-black text-xl sm:text-2xl shadow-sm hover:-translate-y-0.5 active:scale-95 transition cursor-grab ${
              SYLLABLE_TEXT_COLORS[idx % SYLLABLE_TEXT_COLORS.length]
            }`}
          >
            {tile.text}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 7. PİRAMİT & MERDİVEN OKUMA (PDF'deki Orijinal Piramit Metinler & Merdivenler)
 * ========================================================================== */
const PiramitOkumaGame: React.FC<{
  group: LetterGroupData;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, playMp3, onScore, onRoundDone }) => {
  const [subMode, setSubMode] = useState<'piramit' | 'merdiven'>('piramit');
  const [textIdx, setTextIdx] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [colorSyllables, setColorSyllables] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(2100);

  useEffect(() => {
    setTextIdx(0);
    setActiveLine(0);
    setAutoPlay(false);
  }, [group.id, subMode]);

  const currentPyramid = group.pyramids[textIdx % group.pyramids.length];
  const currentLadder = group.wordLadders[textIdx % group.wordLadders.length];
  const lines = subMode === 'piramit' ? currentPyramid.lines : currentLadder;
  const totalItems = subMode === 'piramit' ? group.pyramids.length : group.wordLadders.length;

  useEffect(() => {
    if (!autoPlay) return;
    speakTurkish(lines[activeLine] || '', speedMs <= 1400 ? 1.05 : 0.85);
    const timer = window.setTimeout(() => {
      if (activeLine + 1 < lines.length) {
        setActiveLine((l) => l + 1);
      } else {
        setAutoPlay(false);
        playMp3?.('/ding.mp3');
        onScore(10, true);
        onRoundDone();
      }
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [autoPlay, activeLine, lines, speedMs, playMp3, onScore, onRoundDone]);

  const renderStyledLine = (line: string) => {
    if (!colorSyllables) return <span>{line}</span>;
    return (
      <span className="inline-flex flex-wrap justify-center gap-x-2.5">
        {line.split(' ').map((word, wIdx) => (
          <ColoredSyllableWord key={`${word}-${wIdx}`} syllables={roughSplitTurkishSyllables(word)} />
        ))}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 border-2 border-orange-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setSubMode('piramit');
            }}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black cursor-pointer ${
              subMode === 'piramit' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
            }`}
          >
            Piramit Metinler
          </button>
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setSubMode('merdiven');
            }}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black cursor-pointer ${
              subMode === 'merdiven' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
            }`}
          >
            Kelime Merdivenleri
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setColorSyllables((c) => !c)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
              colorSyllables
                ? 'bg-orange-100 border-orange-400 text-orange-950'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            Renkli Hece: {colorSyllables ? 'Açık' : 'Kapalı'}
          </button>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            {[
              { label: 'Yavaş', ms: 2800 },
              { label: 'Orta', ms: 2000 },
              { label: 'Hızlı', ms: 1300 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setSpeedMs(sp.ms)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  speedMs === sp.ms ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* METİN BAŞLIĞI + GEÇİŞ */}
      <div className="flex items-center justify-between gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2.5">
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setAutoPlay(false);
            setActiveLine(0);
            setTextIdx((i) => (i - 1 + totalItems) % totalItems);
          }}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-orange-300 text-orange-800 font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Önceki</span>
        </button>

        <div className="text-center">
          <div className="text-lg sm:text-2xl font-black text-orange-700 tracking-wide">
            {subMode === 'piramit' ? currentPyramid.title : `Merdiven ${textIdx + 1}`}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            Satıra dokunarak sesli dinle ve takip et ({textIdx + 1}/{totalItems})
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setAutoPlay(false);
            setActiveLine(0);
            setTextIdx((i) => (i + 1) % totalItems);
          }}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-orange-300 text-orange-800 font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
        >
          <span>Sonraki</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* PİRAMİT / MERDİVEN SATIRLARI */}
      <div className="flex flex-col items-center gap-2 py-2">
        {lines.map((line, idx) => {
          const isActive = idx === activeLine;
          return (
            <button
              key={`${line}-${idx}`}
              type="button"
              onClick={() => {
                setAutoPlay(false);
                setActiveLine(idx);
                speakTurkish(line, 0.82);
              }}
              className={`w-full max-w-2xl min-h-[48px] px-4 py-2 rounded-2xl border-2 text-center font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-50 border-orange-500 text-2xl sm:text-4xl scale-[1.02] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-lg sm:text-2xl opacity-75 hover:opacity-100'
              }`}
            >
              {renderStyledLine(line)}
            </button>
          );
        })}
      </div>

      {/* ALT OYNATMA & TAMAMLAMA KONTROLLERİ */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => {
            if (autoPlay) {
              setAutoPlay(false);
              stopSpeaking();
            } else {
              setActiveLine(0);
              setAutoPlay(true);
            }
          }}
          className="min-h-[48px] px-5 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          {autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{autoPlay ? 'Durdur' : 'Otomatik Okuma Başlat'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playMp3?.('/ding.mp3');
            onScore(10, true);
            onRoundDone();
          }}
          className="min-h-[48px] px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Metni Okudum! (+10 Puan)</span>
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 8. ÇİZGİLİ YAZI TAHTASI (Kılavuz Çizgili İlkokul Defteri Üzerinde Yazma)
 * ========================================================================== */
const INK_COLORS = [
  { name: 'Lacivert', hex: '#1e3a8a' },
  { name: 'Kırmızı', hex: '#dc2626' },
  { name: 'Zümrüt', hex: '#047857' },
  { name: 'Mor', hex: '#6d28d9' },
];

const CizgiliYaziTahtasiGame: React.FC<{
  group: LetterGroupData;
  focusLetter: string | null;
  playMp3?: (src: string) => void;
  onScore: (delta: number, isCorrect: boolean) => void;
  onRoundDone: () => void;
}> = ({ group, focusLetter, playMp3, onScore, onRoundDone }) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [boardSize, setBoardSize] = useState({ w: 800, h: 300 });

  const practiceItems = useMemo(() => {
    const letters = focusLetter
      ? group.letters.filter((l) => l.upper === focusLetter)
      : group.letters;
    const letterPrompts = letters.map((l) => ({
      text: `${l.upper} ${l.lower}`,
      speak: `${l.upper} harfi. ${l.keyword}`,
      hint: `${l.emoji} ${l.keyword}`,
    }));
    const wordPrompts = getFilteredWords(group, focusLetter)
      .slice(0, 10)
      .map((w) => ({
        text: w.word,
        speak: w.word,
        hint: `${w.emoji || '✏️'} ${w.syllables.join(' - ')}`,
      }));
    return [...letterPrompts, ...wordPrompts];
  }, [group, focusLetter]);

  const [itemIdx, setItemIdx] = useState(0);
  const [inkColor, setInkColor] = useState(INK_COLORS[0].hex);
  const [brushWidth, setBrushWidth] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);

  const currentItem = practiceItems[itemIdx % practiceItems.length];

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoardSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Kılavuz çizgilerini gerçek yazı tipi metrikleriyle (cap-height, x-height, baseline) hizala:
  // Büyük harfler üst mavi çizgiye, küçük harfler orta pembe kesikli çizgiye ve taban çizgisine tam değer.
  useEffect(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGuide = () => {
      const W = Math.max(200, boardSize.w);
      const H = Math.max(180, boardSize.h);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const rawText = currentItem.text;
      const displayText =
        rawText.length === 3 && rawText[1] === ' '
          ? `${rawText[0]}   ${rawText[2]}`
          : rawText;

      const fontFamily =
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

      // Yazı tipinin gerçek büyük harf (cap-height) ve küçük harf (x-height) oranlarını ölç
      const REF = 100;
      ctx.font = `600 ${REF}px ${fontFamily}`;
      const capM = ctx.measureText('H');
      const capRatio = capM.actualBoundingBoxAscent > 0 ? capM.actualBoundingBoxAscent / REF : 0.72;

      ctx.font = `700 ${REF}px ${fontFamily}`;
      const xM = ctx.measureText('x');
      const xRatio = xM.actualBoundingBoxAscent > 0 ? xM.actualBoundingBoxAscent / REF : 0.52;

      const chars = Array.from(displayText);
      const isUpperChar = (ch: string) => ch !== ' ' && ch !== ch.toLocaleLowerCase('tr-TR');
      const ASCENDER_LOWER = new Set(['b', 'd', 'f', 'h', 'k', 'l', 't']);

      const layoutForUnit = (u: number) => {
        const upperSize = (2 * u) / capRatio;
        const lowerSize = u / xRatio;
        const gap = Math.max(2, u * 0.06);
        let totalWidth = 0;
        const items = chars.map((ch) => {
          if (ch === ' ') {
            const w = lowerSize * 0.36;
            totalWidth += w;
            return { ch, font: '', width: w, isUpper: false, isAscender: false };
          }
          const isUpper = isUpperChar(ch);
          const isAscender = !isUpper && ASCENDER_LOWER.has(ch);
          const font = isUpper
            ? `600 ${upperSize}px ${fontFamily}`
            : `700 ${lowerSize}px ${fontFamily}`;
          ctx.font = font;
          const w = ctx.measureText(ch).width;
          totalWidth += w + gap;
          return { ch, font, width: w, isUpper, isAscender };
        });
        if (items.length > 0 && chars[chars.length - 1] !== ' ') {
          totalWidth -= gap;
        }
        return { items, totalWidth, gap, lowerSize };
      };

      // 1. Sınıf kılavuz defteri: 3 EŞİT aralık (üst mavi ↔ kırmızı kesikli ↔ alt mavi ↔ alt kesikli)
      // Kırmızı kesikli çizgi üst ve alt mavi çizgilerin TAM ORTASINDA (%50) yer alır.
      let unit = Math.round(H * 0.25);
      let layout = layoutForUnit(unit);
      const maxTextWidth = W * 0.86;
      if (layout.totalWidth > maxTextWidth && layout.totalWidth > 0) {
        unit = Math.max(26, Math.floor(unit * (maxTextWidth / layout.totalWidth)));
        layout = layoutForUnit(unit);
      }

      const topBlueY = Math.round((H - 3 * unit) / 2);
      const midPinkY = topBlueY + unit;
      const baselineY = topBlueY + 2 * unit;
      const descBlueY = topBlueY + 3 * unit;

      // 1) Silik kılavuz harf / kelime (ek yerlerinde ton farkı olmaması için tek katmanlı offscreen tuvalde çizilir)
      if (showGuide) {
        const off = document.createElement('canvas');
        off.width = canvas.width;
        off.height = canvas.height;
        const octx = off.getContext('2d');
        if (octx) {
          octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          octx.fillStyle = '#94a3b8';
          octx.textAlign = 'left';
          octx.textBaseline = 'alphabetic';

          // Küçük harflerin gövde/yuvarlak üst sınırını ('o' dahil) ölç ki sadece dik çubuk üst mavi çizgiye uzasın
          octx.font = `700 ${layout.lowerSize}px ${fontFamily}`;
          const oAscent = octx.measureText('o').actualBoundingBoxAscent || unit;
          const xAscent = octx.measureText('x').actualBoundingBoxAscent || unit;
          const stemSplitY = baselineY - Math.max(oAscent, xAscent) - 2;

          let cursorX = (W - layout.totalWidth) / 2;
          for (const item of layout.items) {
            if (item.ch === ' ') {
              cursorX += item.width;
              continue;
            }
            octx.font = item.font;

            if (!item.isAscender) {
              octx.fillText(item.ch, cursorX, baselineY);
            } else {
              // Küçük b, d, f, h, k, l harfleri ÜST MAVİ ÇİZGİYE (topBlueY) tam değer;
              // küçük 't' harfi ise üst mavi çizgi ile kırmızı kesikli çizginin TAM ORTASINA gelir (MEB Dik Temel Harf kuralı).
              const targetTopY = item.ch === 't' ? Math.round((topBlueY + midPinkY) / 2) : topBlueY;
              const chMetrics = octx.measureText(item.ch);
              const chAscent = chMetrics.actualBoundingBoxAscent || unit * 1.38;
              const origTopY = baselineY - chAscent;
              const origUpperH = Math.max(4, stemSplitY - origTopY);
              const targetUpperH = Math.max(4, stemSplitY - targetTopY);

              // Alt gövde (kırmızı kesikli çizgi ↔ taban çizgisi) — hiç bozulmaz
              octx.save();
              octx.beginPath();
              octx.rect(0, stemSplitY - 0.5, W, H - stemSplitY + 1);
              octx.clip();
              octx.fillText(item.ch, cursorX, baselineY);
              octx.restore();

              if (item.ch === 'f') {
                // 'f' harfinin üst kıvrımını bozmadan üst mavi çizgiye taşı, aradaki dik boynu pürüzsüz bağla
                const hookH = Math.max(5, origUpperH * 0.48);
                const hookSplitOrigY = origTopY + hookH;
                const shiftY = targetTopY - origTopY;

                // 1) Üst kıvrım (tam topBlueY'ye değer)
                octx.save();
                octx.beginPath();
                octx.rect(0, targetTopY - 2, W, hookH + 3);
                octx.clip();
                octx.fillText(item.ch, cursorX, baselineY + shiftY);
                octx.restore();

                // 2) Ara dik çubuk (kıvrım altı ↔ stemSplitY)
                const origNeckH = Math.max(2, stemSplitY - hookSplitOrigY);
                const targetNeckTopY = targetTopY + hookH - 1;
                const targetNeckH = Math.max(2, stemSplitY + 1 - targetNeckTopY);
                octx.save();
                octx.beginPath();
                octx.rect(0, targetNeckTopY, W, targetNeckH);
                octx.clip();
                octx.translate(0, stemSplitY);
                octx.scale(1, targetNeckH / origNeckH);
                octx.translate(0, -stemSplitY);
                octx.fillText(item.ch, cursorX, baselineY);
                octx.restore();
              } else {
                // b, d, h, k, l üst mavi çizgiye; t ise mavi ile kırmızı çizginin tam ortasına uzanır
                const scaleY = targetUpperH / origUpperH;
                octx.save();
                octx.beginPath();
                octx.rect(0, targetTopY - 1, W, targetUpperH + 2);
                octx.clip();
                octx.translate(0, stemSplitY);
                octx.scale(1, scaleY);
                octx.translate(0, -stemSplitY);
                octx.fillText(item.ch, cursorX, baselineY);
                octx.restore();
              }
            }

            cursorX += item.width + layout.gap;
          }

          ctx.save();
          ctx.globalAlpha = 0.42;
          ctx.drawImage(off, 0, 0, W, H);
          ctx.restore();
        }
      }

      // 2) 1. Sınıf 4'lü kılavuz çizgileri (3 eşit aralık)
      const drawLine = (y: number, color: string, width: number, dashed: boolean) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dashed) {
          ctx.setLineDash([9, 6]);
        }
        const alignedY = Math.round(y) + 0.5;
        ctx.moveTo(0, alignedY);
        ctx.lineTo(W, alignedY);
        ctx.stroke();
        ctx.restore();
      };

      // Üst mavi sınır çizgisi (büyük harfler ve küçük b, d, f, h, k, l, t bu çizgiye tam değer)
      drawLine(topBlueY, '#0ea5e9', 2.5, false);
      // Tam ortadaki kırmızı kesikli çizgi (küçük harf gövdeleri bu çizgiye tam değer)
      drawLine(midPinkY, '#f43f5e', 2.2, true);
      // Taban mavi çizgisi (tüm harflerin oturduğu çizgi)
      drawLine(baselineY, '#0284c7', 2.5, false);
      // Alt uzantı kesikli mavi çizgi (g, y, p, j kuyruk sınırı — eşit aralık)
      drawLine(descBlueY, '#7dd3fc', 2, true);
    };

    drawGuide();
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) drawGuide();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [currentItem.text, showGuide, boardSize.w, boardSize.h]);

  useEffect(() => {
    setItemIdx(0);
    clearCanvas();
  }, [group.id, focusLetter]);

  useEffect(() => {
    clearCanvas();
  }, [itemIdx]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pt = getCanvasPoint(e);
    lastPosRef.current = pt;
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = getCanvasPoint(e);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushWidth * 2.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = brushWidth;
    }
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();
    lastPosRef.current = pt;
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 border-2 border-indigo-200 p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      {/* ÜST ARAÇ ÇUBUĞU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakTurkish(currentItem.speak, 0.82)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Dinle</span>
          </button>
          <span className="text-sm sm:text-base font-black text-slate-800 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
            {currentItem.hint}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {INK_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => {
                setIsEraser(false);
                setInkColor(c.hex);
              }}
              className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                !isEraser && inkColor === c.hex ? 'scale-110 ring-2 ring-slate-900 border-white' : 'border-slate-300'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <button
            type="button"
            onClick={() => setBrushWidth((w) => (w === 8 ? 14 : 8))}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
          >
            Kalınlık: {brushWidth === 8 ? 'Orta' : 'Kalın'}
          </button>
          <button
            type="button"
            onClick={() => setIsEraser((v) => !v)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isEraser
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Silgi</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGuide((g) => !g)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
          >
            Kılavuz: {showGuide ? 'Açık' : 'Kapalı'}
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-xs font-bold text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* 4 ÇİZGİLİ KILAVUZLU İLKOKUL YAZI TAHTASI */}
      <div
        ref={boardRef}
        className="relative w-full h-[250px] sm:h-[320px] rounded-2xl bg-white border-2 border-indigo-300 overflow-hidden shadow-inner touch-none"
      >
        <canvas
          ref={guideCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          aria-hidden="true"
        />

        <canvas
          ref={canvasRef}
          width={960}
          height={340}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* ÖNCEKİ / YAZDIM / SONRAKİ */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            playMp3?.('/op.mp3');
            setItemIdx((i) => (i - 1 + practiceItems.length) % practiceItems.length);
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-sm text-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Önceki</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playMp3?.('/ding.mp3');
            speakTurkish(`Harika yazdın! ${currentItem.text}`, 0.9);
            onScore(10, true);
            if (itemIdx >= 2) {
              onRoundDone();
            }
            setItemIdx((i) => (i + 1) % practiceItems.length);
          }}
          className="min-h-[48px] px-6 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-md"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{hasDrawn ? 'Yazdım, Sonrakine Geç (+10)' : 'Sonraki Örnek'}</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-slate-500 tabular-nums">
          {itemIdx + 1} / {practiceItems.length}
        </span>
      </div>
    </div>
  );
};

/* ============================================================================
 * ANA OKUMA YAZMA ETKİNLİK MODALI
 * ========================================================================== */
export const OkumaYazmaGameModal: React.FC<OkumaYazmaGameModalProps> = ({
  activityId,
  groupId,
  focusLetter,
  onChangeGroup,
  onChangeFocusLetter,
  onSwitchActivity,
  onClose,
  onGoHome,
  onCompleted,
  playMp3,
  students = [],
  selectedStudentIds = [null],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const activeGroup = getLetterGroupById(groupId);
  const activityMeta = getOkumaYazmaActivityMeta(activityId);
  const currentIdx = OKUMA_YAZMA_ACTIVITIES.findIndex((a) => a.id === activityId);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [activityId, groupId]);

  const handleScore = (delta: number, isCorrect: boolean, pIdx = 0) => {
    if (isCorrect) {
      setScore((s) => s + delta);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
    onQuestionAnswered?.(isCorrect, pIdx);
  };

  const handleRoundDone = (winnerIdx = 0, pCount = 1) => {
    onCompleted?.(activityId, groupId);
    onGameCompleted?.(winnerIdx, pCount);
  };

  const handlePrev = () => {
    playMp3?.('/op.mp3');
    const prev = OKUMA_YAZMA_ACTIVITIES[(currentIdx - 1 + OKUMA_YAZMA_ACTIVITIES.length) % OKUMA_YAZMA_ACTIVITIES.length];
    onSwitchActivity(prev.id);
  };

  const handleNext = () => {
    playMp3?.('/op.mp3');
    const next = OKUMA_YAZMA_ACTIVITIES[(currentIdx + 1) % OKUMA_YAZMA_ACTIVITIES.length];
    onSwitchActivity(next.id);
  };

  const isWhiteGroundActivity = activityId === 'araba_yarisi';

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[210] flex flex-col font-sans select-none overflow-hidden text-slate-900 ${
        isWhiteGroundActivity ? 'bg-white' : 'bg-slate-100'
      }`}
      style={{ top: 'var(--app-header-height, 64px)' }}
    >
      {!isWhiteGroundActivity && <TurkishActivityBackground showFloatingAlphabet={false} />}

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-2.5 sm:px-5 py-2.5 sm:py-3.5 overflow-y-auto no-scrollbar flex flex-col gap-3">
        {/* ÜST ETKİNLİK KONTROL ÇUBUĞU */}
        <header className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300 px-3 sm:px-4 py-2.5 shadow-md flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onClose();
                }}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Etkinlikler</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl" aria-hidden="true">
                    {activityMeta.emoji}
                  </span>
                  <h2 className="text-sm sm:text-lg font-black text-slate-900 truncate">
                    {activityMeta.title}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  {activeGroup.title}: {activeGroup.lettersLabel}
                  {focusLetter ? ` · Odak: ${focusLetter}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black flex items-center gap-1.5 tabular-nums">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{score} Puan</span>
                {streak >= 2 && <span className="text-emerald-700">· {streak} Seri</span>}
              </div>

              <button
                type="button"
                onClick={handlePrev}
                title="Önceki Okuma Yazma Etkinliği"
                className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                title="Sonraki Okuma Yazma Etkinliği"
                className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onGoHome}
                title="Ana Sayfaya Dön"
                className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-rose-700 flex items-center justify-center cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HIZLI HARF GRUBU DEĞİŞTİRİCİ */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
            {LETTER_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onChangeGroup(g.id);
                  onChangeFocusLetter(null);
                }}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-black transition cursor-pointer ${
                  g.id === groupId
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {g.shortTitle}: {g.lettersLabel}
              </button>
            ))}
          </div>
        </header>

        {/* AKTİF OYUN SAHNESİ */}
        <section className="flex-1 flex flex-col items-center justify-start py-1">
          {activityId === 'araba_yarisi' && (
            <OkumaArabaOyunu
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'hece_birlestirme' && (
            <HeceBirlestirmeGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'bulut_eslestirme' && (
            <BulutEslestirmeGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'balon_ses_avi' && (
            <BalonSesAviGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'hece_carkifelek' && (
            <HeceCarkifelekGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
            />
          )}
          {activityId === 'surpriz_kutular' && (
            <SurprizKutularGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'anagram_dizme' && (
            <AnagramDizmeGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'piramit_okuma' && (
            <PiramitOkumaGame
              group={activeGroup}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
          {activityId === 'cizgili_yazi_tahtasi' && (
            <CizgiliYaziTahtasiGame
              group={activeGroup}
              focusLetter={focusLetter}
              playMp3={playMp3}
              onScore={handleScore}
              onRoundDone={handleRoundDone}
            />
          )}
        </section>

        {/* ÖĞRENCİ SEÇİM DOCK (MEVCUT SINIF LİSTESİYLE UYUMLU) */}
        {students.length > 0 && onSelectStudentForPlayer && onOpenRosterModal && (
          <div className="shrink-0 pb-2">
            <StudentAvatarDock
              students={students}
              currentGrade={1}
              playerCount={1}
              selectedStudentIds={selectedStudentIds}
              onSelectStudentForPlayer={onSelectStudentForPlayer}
              onOpenRosterModal={onOpenRosterModal}
              playMp3={playMp3}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default OkumaYazmaGameModal;
