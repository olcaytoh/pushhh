import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, X, Clock, SkipBack, SkipForward, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

interface OnuBulGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

// Toplamı 10 yapan tüm tam sayı ikilileri havuzu
const ALL_PAIRS_SUM_10: [number, number][] = [
  [0, 10],
  [1, 9],
  [2, 8],
  [3, 7],
  [4, 6],
  [5, 5],
];

// Renk paleti - Sayı kartları için canlı, eğlenceli ve kontrastlı tonlar
const NUMBER_BADGE_COLORS = [
  { bg: 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-950', ring: 'ring-amber-500' },
  { bg: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-950', ring: 'ring-emerald-500' },
  { bg: 'bg-sky-100 hover:bg-sky-200 border-sky-400 text-sky-950', ring: 'ring-sky-500' },
  { bg: 'bg-purple-100 hover:bg-purple-200 border-purple-400 text-purple-950', ring: 'ring-purple-500' },
  { bg: 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-950', ring: 'ring-rose-500' },
  { bg: 'bg-orange-100 hover:bg-orange-200 border-orange-400 text-orange-950', ring: 'ring-orange-500' },
  { bg: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-400 text-indigo-950', ring: 'ring-indigo-500' },
  { bg: 'bg-teal-100 hover:bg-teal-200 border-teal-400 text-teal-950', ring: 'ring-teal-500' },
  { bg: 'bg-lime-100 hover:bg-lime-200 border-lime-400 text-lime-950', ring: 'ring-lime-500' },
  { bg: 'bg-pink-100 hover:bg-pink-200 border-pink-400 text-pink-950', ring: 'ring-pink-500' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 10 Slot Dairesel Koordinatları: 1 Merkez, 3 İç Halka (r=21%), 6 Dış Halka (r=37%)
function generateSafeCircleSlots(rotationDeg: number = 0): { x: number; y: number }[] {
  const rot = (rotationDeg * Math.PI) / 180;
  const slots: { x: number; y: number }[] = [{ x: 50, y: 50 }]; // Slot 0: Merkez

  // 3 İç Halka (r=21%)
  for (let k = 0; k < 3; k++) {
    const ang = ((k * 120 - 90) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 21 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 21 * Math.sin(ang)) * 10) / 10,
    });
  }

  // 6 Dış Halka (r=37%)
  for (let k = 0; k < 6; k++) {
    const ang = ((k * 60 - 60) * Math.PI) / 180 + rot;
    slots.push({
      x: Math.round((50 + 37 * Math.cos(ang)) * 10) / 10,
      y: Math.round((50 + 37 * Math.sin(ang)) * 10) / 10,
    });
  }

  return slots;
}

interface NumberTile {
  id: string;          // p1_item_0 or p2_item_0
  pairGroup: number;   // 0 .. 4 (which pair it belongs to)
  value: number;       // e.g. 7
  colorStyle: { bg: string; ring: string };
  x: number;           // percentage %
  y: number;           // percentage %
}

const TOTAL_PAIRS_PER_ROUND = 5;
const ROUND_TIME_SECONDS = 60;

export const OnuBulGame: React.FC<OnuBulGameProps> = ({
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const p1Student = selectedStudentIds?.[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds?.[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;

  // Tur Verileri
  const [p1Tiles, setP1Tiles] = useState<NumberTile[]>([]);
  const [p2Tiles, setP2Tiles] = useState<NumberTile[]>([]);

  // 1. Oyuncu Durumu
  const [p1SelectedId, setP1SelectedId] = useState<string | null>(null);
  const [p1MatchedIds, setP1MatchedIds] = useState<string[]>([]);
  const [p1WrongPair, setP1WrongPair] = useState<[string, string] | null>(null);
  const [p1RecentMatchSum, setP1RecentMatchSum] = useState<string | null>(null);

  // 2. Oyuncu Durumu
  const [p2SelectedId, setP2SelectedId] = useState<string | null>(null);
  const [p2MatchedIds, setP2MatchedIds] = useState<string[]>([]);
  const [p2WrongPair, setP2WrongPair] = useState<[string, string] | null>(null);
  const [p2RecentMatchSum, setP2RecentMatchSum] = useState<string | null>(null);

  // Geri Sayım Süresi (60 Saniye)
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Oyun Sonu & Kazanan
  const [winner, setWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);
  const [winReason, setWinReason] = useState<'all_pairs' | 'time_up' | null>(null);

  const triggerSound = useCallback((type: 'correct' | 'wrong' | 'win' | 'click') => {
    if (!playMp3) return;
    if (type === 'correct') playMp3('/coin.mp3');
    else if (type === 'wrong') playMp3('/hata.mp3');
    else if (type === 'win') playMp3('/coin.mp3');
    else playMp3('/op.mp3');
  }, [playMp3]);

  // Yeni Tur Kurulumu
  const setupNewRound = useCallback(() => {
    // 6 çiftten rastgele 5 çift seç
    const selectedPairs = shuffleArray(ALL_PAIRS_SUM_10).slice(0, TOTAL_PAIRS_PER_ROUND);

    // Her çift için 2 sayı objesi üret (toplam 10 sayı)
    const baseItems: { pairGroup: number; value: number; colorIndex: number }[] = [];
    selectedPairs.forEach((pair, pairIdx) => {
      baseItems.push({
        pairGroup: pairIdx,
        value: pair[0],
        colorIndex: (pairIdx * 2) % NUMBER_BADGE_COLORS.length,
      });
      baseItems.push({
        pairGroup: pairIdx,
        value: pair[1],
        colorIndex: (pairIdx * 2 + 1) % NUMBER_BADGE_COLORS.length,
      });
    });

    // 1. Oyuncu için slots ve karıştırma
    const p1Slots = generateSafeCircleSlots(0);
    const p1Shuffled = shuffleArray(baseItems);
    const p1Result: NumberTile[] = p1Shuffled.map((item, idx) => ({
      id: `p1_num_${idx}_${item.value}`,
      pairGroup: item.pairGroup,
      value: item.value,
      colorStyle: NUMBER_BADGE_COLORS[item.colorIndex],
      x: p1Slots[idx].x,
      y: p1Slots[idx].y,
    }));

    // 2. Oyuncu için slots ve karıştırma (aynı sayılar, farklı yerleşim açısı)
    const p2Slots = generateSafeCircleSlots(35);
    const p2Shuffled = shuffleArray(baseItems);
    const p2Result: NumberTile[] = p2Shuffled.map((item, idx) => ({
      id: `p2_num_${idx}_${item.value}`,
      pairGroup: item.pairGroup,
      value: item.value,
      colorStyle: NUMBER_BADGE_COLORS[item.colorIndex],
      x: p2Slots[idx].x,
      y: p2Slots[idx].y,
    }));

    setP1Tiles(p1Result);
    setP2Tiles(p2Result);

    // Seçimleri ve durumları sıfırla
    setP1SelectedId(null);
    setP1MatchedIds([]);
    setP1WrongPair(null);
    setP1RecentMatchSum(null);

    setP2SelectedId(null);
    setP2MatchedIds([]);
    setP2WrongPair(null);
    setP2RecentMatchSum(null);

    setTimeLeft(ROUND_TIME_SECONDS);
    setIsTimerActive(true);
    setWinner(null);
    setWinReason(null);
  }, []);

  // İlk yüklemede oyunu başlat
  useEffect(() => {
    setupNewRound();
  }, [setupNewRound]);

  // 60 Saniyelik Geri Sayım Sayacı
  useEffect(() => {
    if (!isTimerActive || winner !== null) return;

    if (timeLeft <= 0) {
      // Süre bitti! Kazananı belirle
      setIsTimerActive(false);
      const p1Pairs = Math.floor(p1MatchedIds.length / 2);
      const p2Pairs = Math.floor(p2MatchedIds.length / 2);

      if (p1Pairs > p2Pairs) {
        setWinner('p1');
        onGameCompleted?.(0, 2);
      } else if (p2Pairs > p1Pairs) {
        setWinner('p2');
        onGameCompleted?.(1, 2);
      } else {
        setWinner('tie');
      }
      setWinReason('time_up');
      triggerSound('win');
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isTimerActive, winner, p1MatchedIds.length, p2MatchedIds.length, triggerSound, onGameCompleted]);

  // Sayı Kartına Tıklama Mantığı
  const handleTileClick = (player: 'p1' | 'p2', tile: NumberTile) => {
    if (winner !== null || timeLeft <= 0) return;

    if (player === 'p1') {
      // Eşleşmiş karta tıklanamaz
      if (p1MatchedIds.includes(tile.id)) return;
      if (p1WrongPair !== null) return; // Yanlış animasyonu devam ederken kitle

      // İlk sayı seçimi
      if (p1SelectedId === null) {
        setP1SelectedId(tile.id);
        triggerSound('click');
        return;
      }

      // Aynı karta tekrar tıklandıysa seçimi kaldır
      if (p1SelectedId === tile.id) {
        setP1SelectedId(null);
        triggerSound('click');
        return;
      }

      // İkinci sayı seçildi -> Toplamı 10 mu kontrol et
      const firstTile = p1Tiles.find(t => t.id === p1SelectedId);
      if (!firstTile) {
        setP1SelectedId(tile.id);
        return;
      }

      const sum = firstTile.value + tile.value;
      if (sum === 10) {
        // DOĞRU İKİLİ!
        onQuestionAnswered?.(true, 0);
        const newMatched = [...p1MatchedIds, firstTile.id, tile.id];
        setP1MatchedIds(newMatched);
        setP1SelectedId(null);
        setP1RecentMatchSum(`${firstTile.value} + ${tile.value} = 10 ✓`);
        triggerSound('correct');

        setTimeout(() => {
          setP1RecentMatchSum(null);
        }, 1200);

        // Tüm ikililer bulundu mu? (5 çift = 10 kart)
        if (newMatched.length >= TOTAL_PAIRS_PER_ROUND * 2) {
          setIsTimerActive(false);
          setWinner('p1');
          setWinReason('all_pairs');
          triggerSound('win');
          onGameCompleted?.(0, 2);
          try {
            confetti({ particleCount: 90, spread: 80, origin: { x: 0.35, y: 0.5 } });
          } catch {
            // no-op
          }
        }
      } else {
        // YANLIŞ İKİLİ!
        onQuestionAnswered?.(false, 0);
        setP1WrongPair([firstTile.id, tile.id]);
        triggerSound('wrong');
        setTimeout(() => {
          setP1WrongPair(null);
          setP1SelectedId(null);
        }, 600);
      }
    } else {
      // 2. OYUNCU (MAVİ)
      if (p2MatchedIds.includes(tile.id)) return;
      if (p2WrongPair !== null) return;

      if (p2SelectedId === null) {
        setP2SelectedId(tile.id);
        triggerSound('click');
        return;
      }

      if (p2SelectedId === tile.id) {
        setP2SelectedId(null);
        triggerSound('click');
        return;
      }

      const firstTile = p2Tiles.find(t => t.id === p2SelectedId);
      if (!firstTile) {
        setP2SelectedId(tile.id);
        return;
      }

      const sum = firstTile.value + tile.value;
      if (sum === 10) {
        // DOĞRU İKİLİ!
        onQuestionAnswered?.(true, 1);
        const newMatched = [...p2MatchedIds, firstTile.id, tile.id];
        setP2MatchedIds(newMatched);
        setP2SelectedId(null);
        setP2RecentMatchSum(`${firstTile.value} + ${tile.value} = 10 ✓`);
        triggerSound('correct');

        setTimeout(() => {
          setP2RecentMatchSum(null);
        }, 1200);

        // Tüm ikililer bulundu mu?
        if (newMatched.length >= TOTAL_PAIRS_PER_ROUND * 2) {
          setIsTimerActive(false);
          setWinner('p2');
          setWinReason('all_pairs');
          triggerSound('win');
          onGameCompleted?.(1, 2);
          try {
            confetti({ particleCount: 90, spread: 80, origin: { x: 0.65, y: 0.5 } });
          } catch {
            // no-op
          }
        }
      } else {
        // YANLIŞ İKİLİ!
        onQuestionAnswered?.(false, 1);
        setP2WrongPair([firstTile.id, tile.id]);
        triggerSound('wrong');
        setTimeout(() => {
          setP2WrongPair(null);
          setP2SelectedId(null);
        }, 600);
      }
    }
  };

  const handleRestart = () => {
    triggerSound('click');
    setupNewRound();
  };

  const p1PairsFound = Math.floor(p1MatchedIds.length / 2);
  const p2PairsFound = Math.floor(p2MatchedIds.length / 2);

  return (
    <div
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden touch-none bg-slate-950"
    >
      {/* 1. ÜST ORTA: BEYAZ HAP SKOR VE 60 SANİYE GERİ SAYIM SAYACI */}
      <div className="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-1 sm:py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 flex items-center gap-3 sm:gap-5 text-slate-900">
          
          {/* Sol Oyuncu (Kırmızı): Bulunan Çift Sayısı */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-black text-xl sm:text-2xl md:text-3xl text-[#df4a42] min-w-[22px] text-right drop-shadow-xs">
              {p1PairsFound}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 whitespace-nowrap">
              / 5 Çift
            </span>
          </div>

          {/* Ayraç ve 60sn Geri Sayım Rozeti */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 shadow-inner">
            <Clock
              size={15}
              className={`shrink-0 ${timeLeft <= 10 ? 'text-red-500 animate-spin' : 'text-slate-700'}`}
            />
            <span
              className={`font-black text-base sm:text-xl font-mono min-w-[36px] text-center ${
                timeLeft <= 10 ? 'text-red-600 animate-pulse font-extrabold' : 'text-slate-800'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Sağ Oyuncu (Mavi): Bulunan Çift Sayısı */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 whitespace-nowrap">
              5 /
            </span>
            <span className="font-black text-xl sm:text-2xl md:text-3xl text-[#399ae2] min-w-[22px] text-left drop-shadow-xs">
              {p2PairsFound}
            </span>
          </div>
        </div>

        {/* Kural İpucu Rozeti */}
        <div className="mt-1 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-[10px] sm:text-xs font-bold text-white shadow-md tracking-wide flex items-center gap-1.5">
          <Sparkles size={11} className="text-amber-300" />
          <span>Toplamı 10 Yapan Çiftleri Bul • 60 Saniye</span>
        </div>
      </div>

      {/* 2. ALT ORTA: BEYAZ HAP EXIT / ÇIKIŞ VE KONTROL BUTONLARI */}
      <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto max-w-[96vw] overflow-x-auto px-1 py-0.5 scrollbar-none">
        {/* Yeniden Başlat Butonu */}
        <button
          onClick={handleRestart}
          className="bg-black/75 hover:bg-black/90 active:scale-95 text-amber-300 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-xs shadow-lg border border-amber-400/40 cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw size={13} />
          <span>Yeniden</span>
        </button>

        {/* İleri / Geri Etkinlik & Exit Butonları */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('click');
                onPrevActivity();
              }}
              title="Önceki Etkinliğe Geç"
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
            >
              <SkipBack size={13} />
              <span className="hidden md:inline">Önceki</span>
            </button>
          )}

          {/* Exit Butonu */}
          <button
            onClick={() => {
              triggerSound('click');
              onClose();
            }}
            className="bg-white hover:bg-slate-100 active:scale-95 text-slate-900 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 cursor-pointer transition-all flex items-center gap-1"
          >
            <X size={14} className="stroke-[3]" />
            <span>EXIT</span>
          </button>

          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('click');
                onNextActivity();
              }}
              title="Sonraki Etkinliğe Geç"
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
            >
              <span className="hidden md:inline">Sonraki</span>
              <SkipForward size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3. OYUN ARENASI (SOL KIRMIZI - SAĞ MAVİ) */}
      <div className="flex-1 min-h-0 w-full flex flex-row relative overflow-hidden">
        
        {/* SOL YARI: KIRMIZI ALAN (1. OYUNCU) */}
        <div className="w-1/2 h-full bg-[#df4a42] flex items-center justify-center p-2 sm:p-4 md:p-8 border-r-2 border-black/30 relative overflow-hidden">
          {/* Oyuncu Etiketi */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase border border-white/20">
              {p1Student ? `🔴 ${p1Student.name}` : '1. Oyuncu'}
            </span>
          </div>

          {/* Anlık Doğru Eşleşme Bildirimi */}
          {p1RecentMatchSum && (
            <div className="absolute top-12 left-3 sm:top-14 sm:left-4 z-30 pointer-events-none animate-bounce">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl border-2 border-white">
                {p1RecentMatchSum}
              </span>
            </div>
          )}

          {/* SOL BEYAZ DAİRE */}
          <div
            className={`relative w-[92vw] max-w-[min(46vw,72vh)] aspect-square bg-white rounded-full border-[3px] sm:border-[5px] border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${
              winner === 'p1' ? 'ring-8 ring-emerald-400 scale-[1.02]' : ''
            }`}
          >
            {p1Tiles.map((tile) => {
              const isSelected = p1SelectedId === tile.id;
              const isMatched = p1MatchedIds.includes(tile.id);
              const isWrong = p1WrongPair && (p1WrongPair[0] === tile.id || p1WrongPair[1] === tile.id);

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick('p1', tile)}
                  disabled={isMatched}
                  style={{
                    left: `${tile.x}%`,
                    top: `${tile.y}%`,
                    width: '17%',
                    height: '17%',
                    transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : isMatched ? 0.92 : 1.0})`,
                  }}
                  className={`absolute flex items-center justify-center rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-200 select-none shadow-md ${
                    isMatched
                      ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 opacity-40 shadow-xs pointer-events-none'
                      : isWrong
                      ? 'bg-red-200 border-3 border-red-600 text-red-950 ring-4 ring-red-400 animate-shake'
                      : isSelected
                      ? 'bg-amber-300 border-3 border-amber-600 text-slate-950 ring-4 ring-amber-400 shadow-xl animate-pulse z-20'
                      : `${tile.colorStyle.bg} border-2 sm:border-3 hover:scale-105 active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.15)]`
                  }`}
                  title={`Sayı: ${tile.value}`}
                >
                  {isMatched ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-black text-sm sm:text-base leading-none">{tile.value}</span>
                      <CheckCircle2 size={12} className="text-emerald-700 mt-0.5" />
                    </div>
                  ) : (
                    <span className="font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tighter drop-shadow-xs">
                      {tile.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SAĞ YARI: MAVİ ALAN (2. OYUNCU) */}
        <div className="w-1/2 h-full bg-[#399ae2] flex items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
          {/* Oyuncu Etiketi */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase border border-white/20">
              {p2Student ? `🔵 ${p2Student.name}` : '2. Oyuncu'}
            </span>
          </div>

          {/* Anlık Doğru Eşleşme Bildirimi */}
          {p2RecentMatchSum && (
            <div className="absolute top-12 right-3 sm:top-14 sm:right-4 z-30 pointer-events-none animate-bounce">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl border-2 border-white">
                {p2RecentMatchSum}
              </span>
            </div>
          )}

          {/* SAĞ BEYAZ DAİRE */}
          <div
            className={`relative w-[92vw] max-w-[min(46vw,72vh)] aspect-square bg-white rounded-full border-[3px] sm:border-[5px] border-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${
              winner === 'p2' ? 'ring-8 ring-emerald-400 scale-[1.02]' : ''
            }`}
          >
            {p2Tiles.map((tile) => {
              const isSelected = p2SelectedId === tile.id;
              const isMatched = p2MatchedIds.includes(tile.id);
              const isWrong = p2WrongPair && (p2WrongPair[0] === tile.id || p2WrongPair[1] === tile.id);

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick('p2', tile)}
                  disabled={isMatched}
                  style={{
                    left: `${tile.x}%`,
                    top: `${tile.y}%`,
                    width: '17%',
                    height: '17%',
                    transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : isMatched ? 0.92 : 1.0})`,
                  }}
                  className={`absolute flex items-center justify-center rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-200 select-none shadow-md ${
                    isMatched
                      ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 opacity-40 shadow-xs pointer-events-none'
                      : isWrong
                      ? 'bg-red-200 border-3 border-red-600 text-red-950 ring-4 ring-red-400 animate-shake'
                      : isSelected
                      ? 'bg-amber-300 border-3 border-amber-600 text-slate-950 ring-4 ring-amber-400 shadow-xl animate-pulse z-20'
                      : `${tile.colorStyle.bg} border-2 sm:border-3 hover:scale-105 active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.15)]`
                  }`}
                  title={`Sayı: ${tile.value}`}
                >
                  {isMatched ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-black text-sm sm:text-base leading-none">{tile.value}</span>
                      <CheckCircle2 size={12} className="text-emerald-700 mt-0.5" />
                    </div>
                  ) : (
                    <span className="font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tighter drop-shadow-xs">
                      {tile.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. EN ALTA YASLANMIŞ ÖĞRENCİ LİSTESİ DOCKU */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-40 px-1 sm:px-2 pb-0.5 mt-auto">
          <StudentAvatarDock
            students={students}
            currentGrade={1}
            playerCount={2}
            selectedStudentIds={selectedStudentIds || []}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* 5. ZAFER / SÜRE BİTİMİ SONUÇ MODALI */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0f172a] border-3 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl animate-scale-up">
            
            <div className="w-18 h-18 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
              <Trophy size={40} className="text-slate-950" />
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              {winReason === 'all_pairs' ? 'Tüm 10 Yapan Çiftler Bulundu!' : '60 Saniye Süre Doldu!'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {winner === 'p1'
                ? '🔴 1. OYUNCU KAZANDI!'
                : winner === 'p2'
                ? '🔵 2. OYUNCU KAZANDI!'
                : '🤝 DOSTLUK KAZANDI (BERABERE)!'}
            </h2>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              {winner === 'tie' ? (
                <>Her iki oyuncu da eşit sayıda çift bularak mücadeleyi tamamladı!</>
              ) : winReason === 'all_pairs' ? (
                <>
                  <span className="text-emerald-400 font-bold">5 çiftin tamamını</span> ilk bulan oyuncu şampiyon oldu!
                </>
              ) : (
                <>
                  60 saniyelik süre sonunda <span className="text-amber-400 font-bold">en çok 10 ikilisi bulan</span> oyuncu galip geldi!
                </>
              )}
            </p>

            {/* Skor Tablosu */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 mb-6 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-rose-400 font-bold uppercase">1. Oyuncu (Kırmızı)</div>
                <div className="text-2xl font-black text-white mt-0.5">{p1PairsFound} / 5 Çift</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-xs text-sky-400 font-bold uppercase">2. Oyuncu (Mavi)</div>
                <div className="text-2xl font-black text-white mt-0.5">{p2PairsFound} / 5 Çift</div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw size={18} />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
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
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <SkipBack size={14} />
                      <span>Önceki Etkinlik</span>
                    </button>
                  )}
                  {onNextActivity && (
                    <button
                      onClick={onNextActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
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
export default OnuBulGame;
