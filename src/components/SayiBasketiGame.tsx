import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowLeft, ArrowRight, Home, X, Users, User, Trophy, Search, Check, UserPlus } from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface SayiBasketiGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  soundEnabled?: boolean;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  grade?: number;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (studentId: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerIndex: number | null, pCount: number) => void;
}

const CFG = {
  WIN_SCORE: 5,
  TIME: 120,
  MAX_NUM: 100,
};

const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];

const numberToWordsLower = (n: number): string => {
  if (n === 100) return 'yüz';
  const t = TENS[Math.floor(n / 10)] || '';
  const o = ONES[n % 10] || '';
  return `${t} ${o}`.trim();
};

const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateOptions = (correct: number): number[] => {
  const set = new Set<number>([correct]);
  // Basamak karıştırma tuzağı (73 ↔ 37) ve yakın sayılar
  if (correct >= 10 && correct < 100) {
    const rev = Number(String(correct).split('').reverse().join(''));
    if (rev >= 1 && rev !== correct && rev <= CFG.MAX_NUM) {
      set.add(rev);
    }
  }
  shuffle([10, -10, 1, -1].map((d) => correct + d).filter((v) => v >= 1 && v <= CFG.MAX_NUM)).forEach((v) => {
    if (set.size < 4) set.add(v);
  });
  while (set.size < 4) {
    set.add(rand(1, CFG.MAX_NUM));
  }
  return shuffle([...set]);
};

interface PlayerGameState {
  currentNumber: number;
  word: string;
  options: number[];
  selectedOptIdx: number;
  score: number;
  streak: number;
}

export const SayiBasketiGame: React.FC<SayiBasketiGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  soundEnabled = true,
  playerCountMode = 2,
  onSwitchPlayerCountMode,
  grade = 2,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [numPlayers, setNumPlayers] = useState<1 | 2>(playerCountMode === 1 ? 1 : 2);
  const [seconds, setSeconds] = useState<number>(CFG.TIME);
  const [running, setRunning] = useState<boolean>(true);
  const [locked, setLocked] = useState<boolean[]>([false, false]);

  const [playerStates, setPlayerStates] = useState<PlayerGameState[]>([
    { currentNumber: 42, word: 'kırk iki', options: [24, 22, 42, 43], selectedOptIdx: 2, score: 0, streak: 0 },
    { currentNumber: 20, word: 'yirmi', options: [20, 10, 12, 22], selectedOptIdx: 0, score: 0, streak: 0 },
  ]);

  const [banners, setBanners] = useState<{ text: string; tone: 'good' | 'bad'; id: number }[]>([
    { text: '', tone: 'good', id: 0 },
    { text: '', tone: 'good', id: 0 },
  ]);

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    winner: number | null;
    title: string;
    message: string;
    icon: string;
  } | null>(null);

  const timerRef = useRef<any>(null);
  const courtRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const launcherRefs = useRef<(HTMLButtonElement | null)[]>([null, null]);
  const askedPerPlayer = useRef<number[][]>([[], []]);

  // Öğrenci seçimi (1 ve 2 kişilik mod)
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] !== undefined ? selectedStudentIds[0] : (selectedStudentId ?? null),
    selectedStudentIds?.[1] !== undefined ? selectedStudentIds[1] : null,
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([selectedStudentIds[0] ?? null, selectedStudentIds[1] ?? null]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds(prev => [selectedStudentId ?? null, prev[1] ?? null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedIds = [
    selectedStudentIds?.[0] !== undefined ? selectedStudentIds[0] : internalSelectedIds[0],
    selectedStudentIds?.[1] !== undefined ? selectedStudentIds[1] : internalSelectedIds[1],
  ];

  // Öğrenci Seçici Modal Durumu
  const [selectingPlayerIdx, setSelectingPlayerIdx] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerGradeTab, setPickerGradeTab] = useState<number | 'ALL'>(grade || 2);

  const handleSelectStudentForPlayer = useCallback(
    (pIdx: number, sid: string | null) => {
      setInternalSelectedIds(prev => {
        const u = [...prev];
        u[pIdx] = sid;
        return u;
      });
      if (onSelectStudentForPlayer) {
        onSelectStudentForPlayer(pIdx, sid);
      } else if (pIdx === 0 && onSelectStudent) {
        onSelectStudent(sid);
      }
      if (playMp3) {
        try {
          playMp3('/ding.mp3');
        } catch {
          // ignore
        }
      }
    },
    [onSelectStudentForPlayer, onSelectStudent, playMp3]
  );

  const getPlayerTitle = useCallback(
    (idx: number) => {
      const sid = effectiveSelectedIds[idx];
      const st = sid ? students?.find((s) => s.id === sid) : null;
      if (st) return `${st.name} (${idx === 0 ? 'Kırmızı' : 'Mavi'})`;
      return idx === 0 ? '1. Oyuncu (Kırmızı)' : '2. Oyuncu (Mavi)';
    },
    [effectiveSelectedIds, students]
  );

  const triggerSound = useCallback(
    (src: string) => {
      if (soundEnabled && playMp3) {
        try {
          playMp3(src);
        } catch {
          // ignore
        }
      }
    },
    [soundEnabled, playMp3]
  );

  const showBanner = (pIdx: number, text: string, tone: 'good' | 'bad', ms = 1800) => {
    setBanners((prev) => {
      const next = [...prev];
      next[pIdx] = { text, tone, id: Date.now() };
      return next;
    });
    if (ms > 0) {
      setTimeout(() => {
        setBanners((prev) => {
          const next = [...prev];
          if (next[pIdx]?.text === text) {
            next[pIdx] = { text: '', tone: 'good', id: 0 };
          }
          return next;
        });
      }, ms);
    }
  };

  const createQuestionForPlayer = useCallback((pIdx: number): { n: number; word: string; options: number[] } => {
    let n: number;
    let attempts = 0;
    do {
      n = rand(1, CFG.MAX_NUM);
      attempts++;
    } while (askedPerPlayer.current[pIdx].includes(n) && attempts < 50);

    askedPerPlayer.current[pIdx].push(n);
    const word = numberToWordsLower(n);
    const opts = generateOptions(n);
    return { n, word, options: opts };
  }, []);

  const finishGame = useCallback(
    (reason: 'score' | 'time', winnerIdx?: number) => {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);

      let winner: number | null = null;
      let title = 'Yarış Bitti!';
      let msg = '';
      let icon = '🏆';

      if (numPlayers === 1) {
        const sc = playerStates[0].score;
        if (sc >= CFG.WIN_SCORE) {
          winner = 0;
          title = 'Tebrikler!';
          msg = `${sc} sayı yaparak oyunu zaferle tamamladın! 🏀⭐`;
          triggerSound('/kazandin.mp3');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else {
          title = 'Süre Doldu!';
          msg = `Toplam ${sc} sayı yaptın. Tekrar oynamaya ne dersin?`;
          triggerSound('/op.mp3');
        }
      } else {
        if (winnerIdx !== undefined) {
          winner = winnerIdx;
          title = `Kazanan: ${getPlayerTitle(winnerIdx)}!`;
          msg = `${getPlayerTitle(winnerIdx)} ilk ${CFG.WIN_SCORE} sayıyı yaparak maçı kazandı! 🏆`;
          triggerSound('/alkis.mp3');
          confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
        } else {
          const s0 = playerStates[0].score;
          const s1 = playerStates[1].score;
          if (s0 !== s1) {
            winner = s0 > s1 ? 0 : 1;
            title = `Kazanan: ${getPlayerTitle(winner)}!`;
            msg = `Süre doldu! En çok sayıyı yapan ${getPlayerTitle(winner)} kazandı!`;
            triggerSound('/alkis.mp3');
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          } else {
            winner = null;
            icon = '🤝';
            title = 'Berabere!';
            msg = 'Her iki oyuncu da eşit sayıda basket attı!';
            triggerSound('/op.mp3');
          }
        }
      }

      setGameResult({ winner, title, message: msg, icon });
      setGameOver(true);
      onGameCompleted?.(winner, numPlayers);
    },
    [numPlayers, playerStates, getPlayerTitle, triggerSound, onGameCompleted]
  );

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    askedPerPlayer.current = [[], []];
    setSeconds(CFG.TIME);
    setGameOver(false);
    setGameResult(null);
    setRunning(true);
    setLocked([false, false]);

    const q0 = createQuestionForPlayer(0);
    const q1 = createQuestionForPlayer(1);

    setPlayerStates([
      { currentNumber: q0.n, word: q0.word, options: q0.options, selectedOptIdx: 0, score: 0, streak: 0 },
      { currentNumber: q1.n, word: q1.word, options: q1.options, selectedOptIdx: 0, score: 0, streak: 0 },
    ]);

    setBanners([
      { text: '', tone: 'good', id: 0 },
      { text: '', tone: 'good', id: 0 },
    ]);

    triggerSound('/op.mp3');

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [createQuestionForPlayer, triggerSound, finishGame]);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Senkronizasyon: Üst menüdeki 1 ve 2 kişilik butonlarından mod değiştiğinde
  const prevModePropRef = useRef<number | undefined>(playerCountMode);
  useEffect(() => {
    if (playerCountMode !== undefined && prevModePropRef.current !== playerCountMode) {
      prevModePropRef.current = playerCountMode;
      const targetMode: 1 | 2 = playerCountMode === 1 ? 1 : 2;
      setNumPlayers(targetMode);
      startGame();
    }
  }, [playerCountMode, startGame]);

  const handleSwitchMode = (mode: 1 | 2) => {
    if (numPlayers === mode) return;
    triggerSound('/op.mp3');
    prevModePropRef.current = mode;
    setNumPlayers(mode);
    onSwitchPlayerCountMode?.(mode);
    startGame();
  };

  // Parabolic shot animation with watercolor basketball
  const launchBall = (pIdx: number, isCorrect: boolean, onDone: () => void) => {
    const court = courtRefs.current[pIdx];
    const launcher = launcherRefs.current[pIdx];
    if (!court || !launcher) {
      onDone();
      return;
    }

    const cr = court.getBoundingClientRect();
    const lr = launcher.getBoundingClientRect();

    // Start position: center of launcher
    const s0 = lr.width * 0.9;
    const startX = lr.left + lr.width / 2 - cr.left;
    const startY = lr.top + lr.height / 2 - cr.top;

    // Rim position: center at x = 50%, y = 25%
    const rimX = cr.width * 0.5;
    const rimY = cr.height * 0.25;

    // Create flying clone element
    const flyBall = document.createElement('img');
    flyBall.src = '/basketbol_topu_watercolor.webp';
    flyBall.style.position = 'absolute';
    flyBall.style.zIndex = '40';
    flyBall.style.pointerEvents = 'none';
    flyBall.style.width = `${s0}px`;
    flyBall.style.height = `${s0}px`;
    flyBall.style.left = '0';
    flyBall.style.top = '0';
    court.appendChild(flyBall);

    const nFrames = 26;
    const arcHeight = Math.max(50, cr.height * 0.35);

    if (isCorrect) {
      // Correct shot: parabola up above rim, then drops right through net
      const topTarget = { x: rimX, y: rimY - 30 };
      const netInsideTarget = { x: rimX, y: rimY + 65 };

      const framesUp: Keyframe[] = [];
      for (let j = 0; j <= nFrames; j++) {
        const t = j / nFrames;
        const x = startX + (topTarget.x - startX) * t;
        const y = startY + (topTarget.y - startY) * t - arcHeight * 4 * t * (1 - t);
        const rot = 540 * t;
        const scale = 1 + (0.75 - 1) * t;
        framesUp.push({
          offset: t,
          transform: `translate(${x - s0 / 2}px, ${y - s0 / 2}px) rotate(${rot}deg) scale(${scale})`,
        });
      }

      const animUp = flyBall.animate(framesUp, { duration: 750, fill: 'forwards', easing: 'ease-out' });
      animUp.onfinish = () => {
        triggerSound('/correct.mp3');

        // Sparkle burst around the hoop
        for (let j = 0; j < 12; j++) {
          const spark = document.createElement('i');
          spark.style.position = 'absolute';
          spark.style.zIndex = '45';
          spark.style.pointerEvents = 'none';
          spark.style.fontSize = 'clamp(14px, 2.5vw, 22px)';
          spark.style.fontStyle = 'normal';
          spark.textContent = ['✨', '⭐', '🎉'][j % 3];
          spark.style.left = `${rimX}px`;
          spark.style.top = `${rimY}px`;
          court.appendChild(spark);
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 55;
          const animSpark = spark.animate(
            [
              { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
              {
                transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist - 20}px)) scale(1.2)`,
                opacity: 0,
              },
            ],
            { duration: 750 + Math.random() * 250, easing: 'ease-out' }
          );
          animSpark.onfinish = () => spark.remove();
        }

        // Drop through net
        const framesDown: Keyframe[] = [
          {
            offset: 0,
            transform: `translate(${topTarget.x - s0 / 2}px, ${topTarget.y - s0 / 2}px) rotate(540deg) scale(0.75)`,
          },
          {
            offset: 1,
            transform: `translate(${netInsideTarget.x - s0 / 2}px, ${netInsideTarget.y - s0 / 2}px) rotate(560deg) scale(0.7)`,
          },
        ];
        const animDown = flyBall.animate(framesDown, { duration: 320, fill: 'forwards', easing: 'ease-in' });
        animDown.onfinish = () => {
          const fadeAnim = flyBall.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
          fadeAnim.onfinish = () => {
            flyBall.remove();
            onDone();
          };
        };
      };
    } else {
      // Missed shot: hits rim and clangs away
      const hitTarget = { x: rimX - 45, y: rimY - 15 };
      const outTarget = { x: rimX - 120, y: rimY + 110 };

      const framesUp: Keyframe[] = [];
      for (let j = 0; j <= nFrames; j++) {
        const t = j / nFrames;
        const x = startX + (hitTarget.x - startX) * t;
        const y = startY + (hitTarget.y - startY) * t - arcHeight * 4 * t * (1 - t);
        const rot = 420 * t;
        const scale = 1 + (0.75 - 1) * t;
        framesUp.push({
          offset: t,
          transform: `translate(${x - s0 / 2}px, ${y - s0 / 2}px) rotate(${rot}deg) scale(${scale})`,
        });
      }

      const animUp = flyBall.animate(framesUp, { duration: 680, fill: 'forwards', easing: 'ease-out' });
      animUp.onfinish = () => {
        triggerSound('/buzzer.mp3');

        const framesOut: Keyframe[] = [
          {
            offset: 0,
            transform: `translate(${hitTarget.x - s0 / 2}px, ${hitTarget.y - s0 / 2}px) rotate(420deg) scale(0.75)`,
          },
          {
            offset: 1,
            transform: `translate(${outTarget.x - s0 / 2}px, ${outTarget.y - s0 / 2}px) rotate(350deg) scale(0.65)`,
            opacity: 0,
          },
        ];
        const animOut = flyBall.animate(framesOut, { duration: 500, fill: 'forwards', easing: 'ease-in' });
        animOut.onfinish = () => {
          flyBall.remove();
          onDone();
        };
      };
    }
  };

  const handleShootOption = (pIdx: number, optionValue: number, optIdx: number) => {
    if (!running || locked[pIdx]) return;

    // Update selected option index
    setPlayerStates((prev) => {
      const next = [...prev];
      next[pIdx] = { ...next[pIdx], selectedOptIdx: optIdx };
      return next;
    });

    const isCorrect = optionValue === playerStates[pIdx].currentNumber;

    // Lock player during shot animation
    setLocked((prev) => {
      const next = [...prev];
      next[pIdx] = true;
      return next;
    });

    if (isCorrect) {
      launchBall(pIdx, true, () => {
        onQuestionAnswered?.(true, pIdx);
        showBanner(pIdx, '🏀 SAYI! +1 Puan', 'good', 1400);

        setPlayerStates((prev) => {
          const next = [...prev];
          const newScore = next[pIdx].score + 1;
          const nextQ = createQuestionForPlayer(pIdx);

          next[pIdx] = {
            ...next[pIdx],
            score: newScore,
            streak: next[pIdx].streak + 1,
            currentNumber: nextQ.n,
            word: nextQ.word,
            options: nextQ.options,
            selectedOptIdx: 0,
          };

          if (newScore >= CFG.WIN_SCORE) {
            setTimeout(() => {
              finishGame('score', pIdx);
            }, 300);
          } else {
            setLocked((lPrev) => {
              const lNext = [...lPrev];
              lNext[pIdx] = false;
              return lNext;
            });
          }
          return next;
        });
      });
    } else {
      launchBall(pIdx, false, () => {
        onQuestionAnswered?.(false, pIdx);
        showBanner(pIdx, 'Yanlış! Tekrar dene ⚠️', 'bad', 1400);

        setLocked((lPrev) => {
          const lNext = [...lPrev];
          lNext[pIdx] = false;
          return lNext;
        });
      });
    }
  };

  const handleNavigateOptions = (pIdx: number, direction: -1 | 1) => {
    if (!running || locked[pIdx]) return;
    triggerSound('/click.mp3');
    setPlayerStates((prev) => {
      const next = [...prev];
      const curIdx = next[pIdx].selectedOptIdx;
      const optsLen = next[pIdx].options.length;
      const newIdx = (curIdx + direction + optsLen) % optsLen;
      next[pIdx] = { ...next[pIdx], selectedOptIdx: newIdx };
      return next;
    });
  };

  const handleShootSelected = (pIdx: number) => {
    if (!running || locked[pIdx]) return;
    const curState = playerStates[pIdx];
    const val = curState.options[curState.selectedOptIdx];
    if (val !== undefined) {
      handleShootOption(pIdx, val, curState.selectedOptIdx);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--app-header-height,60px)] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white">
      {/* ÜST SUB-BAR: Navigasyon, Süre, Mod Değiştirme, Yeniden Başlat, Ana Sayfa, Kapat */}
      <div className="shrink-0 flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-black/60 border-b border-white/10 z-30 backdrop-blur-md">
        {/* Sol düğmeler: Önceki / Sonraki */}
        <div className="flex items-center gap-1 sm:gap-2">
          {onPrevActivity && (
            <button
              type="button"
              onClick={() => {
                triggerSound('/click.mp3');
                onPrevActivity();
              }}
              title="Önceki etkinlik"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              type="button"
              onClick={() => {
                triggerSound('/click.mp3');
                onNextActivity();
              }}
              title="Sonraki etkinlik"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ArrowRight size={16} />
            </button>
          )}

          {/* Mod Değiştirici: 1 Oyuncu (Solo) / 2 Oyuncu (Düello) / 3 Oyuncu (Devre Dışı) */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/50 border border-white/15">
            <button
              type="button"
              onClick={() => handleSwitchMode(1)}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                numPlayers === 1
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-black ring-1 ring-sky-300'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="1 Oyuncu (Solo Pota Modu)"
            >
              <img src="/1oy.webp" alt="1 Oyuncu" className="w-4 h-4 object-contain pointer-events-none" />
              <span className="hidden xs:inline">1 Oyuncu</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode(2)}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                numPlayers === 2
                  ? 'bg-rose-500 text-white shadow-sm font-black ring-1 ring-rose-300'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="2 Oyuncu (Kapışma Düello Modu)"
            >
              <img src="/2oy.webp" alt="2 Oyuncu" className="w-4 h-4 object-contain pointer-events-none" />
              <span className="hidden xs:inline">2 Oyuncu Düello</span>
            </button>
            <button
              type="button"
              disabled
              title="Sayı Basketi oyununda 3 kişilik mod bulunmamaktadır (sadece 1 ve 2 kişiliktir)"
              className="px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 opacity-30 cursor-not-allowed text-slate-400 grayscale"
            >
              <img src="/3oy.webp" alt="3 Oyuncu" className="w-4 h-4 object-contain pointer-events-none opacity-40" />
              <span className="hidden xs:inline">3 Oyuncu (Yok)</span>
            </button>
          </div>
        </div>

        {/* Orta: Zamanlayıcı */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 border border-rose-400 text-white font-black text-xs sm:text-sm tracking-wide shadow-md">
            <span>⏱️</span>
            <span className={`tabular-nums ${seconds <= 15 ? 'animate-pulse text-amber-200' : ''}`}>
              {seconds} sn
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs">
            <span>🎯 Hedef:</span>
            <span className="font-black text-white">{CFG.WIN_SCORE} Basket</span>
          </div>
        </div>

        {/* Sağ: Baştan Başlat, Ana Sayfa, Kapat */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={startGame}
            title="Yeniden Başlat"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <RotateCcw size={16} />
          </button>
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              title="Ana sayfa"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Home size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Kapat"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ANA OYUN ALANI (DÜELLO BASKETBOL STADYUMU) */}
      <main className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden p-0 bg-slate-950">
        <div
          className={`w-full h-full max-w-[1920px] mx-auto grid ${
            numPlayers === 1 ? 'grid-cols-1 max-w-4xl' : 'grid-cols-2 divide-x-4 divide-slate-900'
          }`}
        >
          {Array.from({ length: numPlayers }).map((_, pIdx) => {
            const state = playerStates[pIdx];
            const bannerData = banners[pIdx];
            const isLeft = pIdx === 0;

            return (
              <div
                key={pIdx}
                ref={(el) => {
                  courtRefs.current[pIdx] = el;
                }}
                className="relative w-full h-full flex flex-col justify-between overflow-hidden p-2 sm:p-3 select-none"
              >
                {/* A. STADYUM TRİBÜN / DUVAR ÜST ALANI */}
                <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#0b1120] via-[#162038] to-[#1e293b] overflow-hidden pointer-events-none">
                  {/* Stadyum Spot Işıkları */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent" />
                  <div className="absolute top-0 left-1/4 w-32 h-44 bg-white/10 blur-xl -rotate-12 pointer-events-none" />
                  <div className="absolute top-0 right-1/4 w-32 h-44 bg-white/10 blur-xl rotate-12 pointer-events-none" />
                  {/* Tribün / Akustik Izgara Deseni */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                  {/* Pota Taşıyıcı Metal Direk (Arkada) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-[24%] bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 border-x border-slate-900/60 shadow-lg" />
                  <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-16 sm:w-22 h-3 bg-slate-700 border border-slate-900 rounded-sm" />
                </div>

                {/* B. SÜPÜRGELİK / SAHA SINIRI */}
                <div className="absolute inset-x-0 top-[38%] h-2.5 bg-gradient-to-b from-[#2b180a] via-[#160b04] to-[#3a2211] border-y border-amber-950/70 shadow-md z-2 pointer-events-none" />

                {/* C. PARKE BASKETBOL SAHASI ZEMİNİ */}
                <div
                  className="absolute inset-x-0 top-[38%] bottom-0 overflow-hidden pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, #e4933d 0%, #d4802c 25%, #c06e1e 65%, #a65813 100%)',
                  }}
                >
                  {/* Parke Tahta Çizgileri Deseni */}
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 32px, rgba(0,0,0,0.06) 32px, rgba(0,0,0,0.06) 34px), repeating-linear-gradient(0deg, transparent, transparent 16px, rgba(255,255,255,0.04) 16px, rgba(255,255,255,0.04) 18px)',
                    }}
                  />

                  {/* Zemin Üzerine Düşen Işık Parıltısı (Cilalı Zemin Efekti) */}
                  <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

                  {/* BASKETBOL SAHA ÇİZGİLERİ (BOYALI ALAN + SERBEST ATIŞ + 3 SAYI YAYI) */}
                  <svg
                    viewBox="0 0 400 400"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* Boyalı Alan (Key / Trapezoid) */}
                    <polygon
                      points="140,0 260,0 280,260 120,260"
                      fill={isLeft ? 'rgba(220, 38, 38, 0.28)' : 'rgba(37, 99, 235, 0.28)'}
                      stroke="rgba(255, 255, 255, 0.75)"
                      strokeWidth="3.5"
                    />
                    {/* Serbest Atış Çemberi */}
                    <path
                      d="M 120,260 A 80,60 0 0,0 280,260"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.75)"
                      strokeWidth="3.5"
                      strokeDasharray="8,6"
                    />
                    <path
                      d="M 120,260 A 80,60 0 0,1 280,260"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.75)"
                      strokeWidth="3.5"
                    />
                    {/* 3 Sayı Çizgisi Yayı */}
                    <path
                      d="M 20,400 C 20,120 380,120 380,400"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.55)"
                      strokeWidth="3.5"
                    />
                  </svg>
                </div>

                {/* 1. ÜST PANEL: KIRMIZI / MAVİ BAŞLIK VE SKOR ROZETİ */}
                <div
                  className={`w-full max-w-[97%] mx-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-2 sm:border-[2.5px] flex items-center justify-between shadow-lg z-20 backdrop-blur-md ${
                    isLeft
                      ? 'bg-gradient-to-r from-red-600/90 via-rose-600/90 to-red-700/90 border-red-300/80 text-white shadow-red-950/40'
                      : 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 border-blue-300/80 text-white shadow-blue-950/40'
                  }`}
                >
                  {(() => {
                    const sid = effectiveSelectedIds[pIdx];
                    const st = sid ? students?.find((s) => s.id === sid) : null;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectingPlayerIdx(pIdx);
                          setPickerSearch('');
                          setPickerGradeTab(st?.grade || grade || 2);
                        }}
                        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all text-left group/btn"
                        title={`${getPlayerTitle(pIdx)} - Tıkla ve Öğrenci Seç`}
                      >
                        {st ? (
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${
                              st.avatarBg || 'from-amber-400 to-yellow-500'
                            } border-2 border-white/90 flex items-center justify-center text-xs sm:text-sm shadow-md shrink-0`}
                          >
                            <span>{st.avatar}</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm">
                            {isLeft ? '🔴' : '🔵'}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-sm sm:text-base md:text-lg tracking-tight truncate max-w-[130px] sm:max-w-xs text-white drop-shadow-xs">
                            {st ? st.name : (isLeft ? '1. Oyuncu (Kırmızı)' : '2. Oyuncu (Mavi)')}
                          </span>
                          {st?.className && (
                            <span className="text-[10px] text-white/80 font-bold leading-none">
                              {st.className}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1 border border-white/30">
                          {st ? 'Değiştir ✏️' : 'Öğrenci Seç +'}
                        </span>
                      </button>
                    );
                  })()}

                  {/* Skor Rozeti */}
                  <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-xl bg-amber-400 border border-amber-200 text-slate-950 font-black text-xs sm:text-base shadow-md">
                    <span className="text-sm sm:text-base">🏀</span>
                    <span className="tabular-nums font-black text-sm sm:text-lg">{state.score}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-amber-900 opacity-80">/ {CFG.WIN_SCORE}</span>
                  </div>
                </div>

                {/* 2. POTA VE CAM PANYA (TAM 50% X, 25% Y RİM HİZALAMASI) */}
                <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-15 flex flex-col items-center">
                  {/* Cam Panya */}
                  <div className="relative w-[230px] sm:w-[310px] md:w-[360px] h-[120px] sm:h-[150px] md:h-[170px] -mb-[16px] sm:-mb-[22px] rounded-2xl bg-white/95 backdrop-blur-md border-4 sm:border-[5px] border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-2 sm:p-2.5 overflow-hidden">
                    {/* Panya Kırmızı Dış Şeridi */}
                    <div className="absolute inset-1.5 sm:inset-2 border-2 border-rose-500/80 rounded-xl pointer-events-none" />

                    {/* Soru Metni: Sayının Okunuşu */}
                    <div className="relative z-10 w-full text-center mt-0.5 sm:mt-1">
                      <span className="font-black text-slate-950 text-xl sm:text-2xl md:text-3xl tracking-tight block uppercase drop-shadow-xs">
                        {state.word}
                      </span>
                    </div>

                    {/* Kırmızı İç Hedef Kutusu */}
                    <div className="relative z-10 w-24 sm:w-32 h-12 sm:h-16 border-[3px] border-rose-600 rounded-sm bg-rose-50/50 mb-0.5 sm:mb-1 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-black text-rose-600/70 tracking-widest uppercase">
                        BASKET
                      </span>
                    </div>
                  </div>

                  {/* Pota Çemberi (Turuncu Metalik Rim) ve File */}
                  <div className="relative flex flex-col items-center z-20">
                    {/* Çember Bağlantı Desteği */}
                    <div className="w-6 sm:w-8 h-2 bg-gradient-to-r from-orange-800 to-amber-700 rounded-xs" />

                    {/* Turuncu Metalik Çember Ring */}
                    <div className="w-20 sm:w-26 md:w-28 h-6 sm:h-7 md:h-8 rounded-full border-[5px] sm:border-[6px] border-[#ea580c] bg-radial from-amber-500/20 to-orange-700/60 shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center" />

                    {/* Beyaz Örgü File (SVG) */}
                    <svg
                      viewBox="0 0 100 80"
                      className="w-16 sm:w-22 md:w-24 h-14 sm:h-18 -mt-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] stroke-white stroke-[2.5] fill-none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 12,0 L 25,25 L 18,50 L 30,78" />
                      <path d="M 28,0 L 40,25 L 32,50 L 42,78" />
                      <path d="M 44,0 L 52,25 L 48,50 L 50,78" />
                      <path d="M 60,0 L 58,25 L 64,50 L 58,78" />
                      <path d="M 76,0 L 70,25 L 80,50 L 68,78" />
                      <path d="M 88,0 L 78,25 L 85,50 L 72,78" />
                      <path d="M 15,25 Q 50,30 85,25" strokeWidth="2" strokeDasharray="3,1" />
                      <path d="M 18,50 Q 50,55 82,50" strokeWidth="2" strokeDasharray="3,1" />
                      <path d="M 28,78 Q 50,82 72,78" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                {/* 3. BİLDİRİM BANNERI (SAYI / HATA) */}
                {bannerData.text && (
                  <div
                    className={`absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-25 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full font-black text-sm sm:text-lg shadow-2xl transition-all duration-200 animate-bounce pointer-events-none whitespace-nowrap border-2 ${
                      bannerData.tone === 'good'
                        ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-500/50'
                        : 'bg-rose-600 text-white border-rose-300 shadow-rose-600/50'
                    }`}
                  >
                    {bannerData.text}
                  </div>
                )}

                {/* 4. ALT ALAN: SEÇENEK BUTONLARI + OKLAR VE BASKETBOL TOPU LAUNCHER (BEYAZ ÇERÇEVE KALDIRILDI) */}
                <div className="w-full max-w-xl mx-auto z-20 flex flex-col items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  {/* 4 Seçenek Butonu: Doğrudan Parke Sahada Yüzen 3D Düğmeler */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3.5 w-full px-2 sm:px-3">
                    {state.options.map((optVal, optIdx) => {
                      const isSelected = state.selectedOptIdx === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={locked[pIdx]}
                          onClick={() => handleShootOption(pIdx, optVal, optIdx)}
                          className={`group relative w-full py-2 sm:py-3 md:py-4 rounded-2xl sm:rounded-3xl font-black text-2xl sm:text-3xl md:text-4xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed select-none ${
                            isSelected
                              ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 sm:border-[3px] border-amber-950 text-slate-950 scale-105 shadow-[0_6px_0_#78350f,0_0_25px_rgba(251,191,36,0.7)] ring-4 ring-amber-300'
                              : 'bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 sm:border-[3px] border-slate-900/90 text-slate-950 shadow-[0_5px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_7px_0_#0f172a,0_12px_20px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#0f172a]'
                          }`}
                        >
                          <span>{optVal}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Alt Top Fırlatıcı: Sol Ok, Basketbol Topu, Sağ Ok (Beyaz Kutu Olmadan Doğrudan Sahada) */}
                  <div className="flex items-center justify-center gap-5 sm:gap-8 mt-1">
                    {/* Sol Ok */}
                    <button
                      type="button"
                      disabled={locked[pIdx]}
                      onClick={() => handleNavigateOptions(pIdx, -1)}
                      title="Önceki Seçenek"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-slate-950 border-2 border-white/70 text-white shadow-[0_6px_14px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-40"
                    >
                      <ArrowLeft size={22} className="stroke-[3]" />
                    </button>

                    {/* Basketbol Topu Fırlatma Butonu */}
                    <button
                      type="button"
                      ref={(el) => {
                        launcherRefs.current[pIdx] = el;
                      }}
                      disabled={locked[pIdx]}
                      onClick={() => handleShootSelected(pIdx)}
                      title="Potaya Basket At!"
                      className="group relative w-[80px] h-[80px] sm:w-[104px] sm:h-[104px] md:w-[124px] md:h-[124px] rounded-full p-2 bg-gradient-to-b from-amber-400/25 to-amber-600/20 border-2 sm:border-[3px] border-amber-400/80 shadow-[0_12px_24px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shrink-0 backdrop-blur-xs"
                    >
                      <div className="absolute inset-0 rounded-full bg-amber-400/15 animate-ping opacity-40 pointer-events-none" />
                      <img
                        src="/basketbol_topu_watercolor.webp"
                        alt="Basketbol Topu"
                        className="w-full h-full object-contain group-hover:rotate-12 transition-transform select-none pointer-events-none drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]"
                      />
                    </button>

                    {/* Sağ Ok */}
                    <button
                      type="button"
                      disabled={locked[pIdx]}
                      onClick={() => handleNavigateOptions(pIdx, 1)}
                      title="Sonraki Seçenek"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-slate-950 border-2 border-white/70 text-white shadow-[0_6px_14px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-40"
                    >
                      <ArrowRight size={22} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ÖĞRENCİ SEÇİCİ DOCK (SINIF ROSTERI) */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-30 px-1 sm:px-2 pb-0.5 bg-black/40 border-t border-white/10">
          <StudentAvatarDock
            students={students}
            currentGrade={grade || 2}
            playerCount={numPlayers}
            selectedStudentIds={effectiveSelectedIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* OYUN SONU KAZANAN / SKOR PENCERESİ */}
      {gameOver && gameResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-b from-[#142342] via-[#1c305c] to-[#0f1b34] border-4 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(251,191,36,0.4)] text-center flex flex-col items-center gap-3">
            <div className="text-5xl sm:text-6xl animate-bounce">{gameResult.icon}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {gameResult.title}
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-200 leading-snug">{gameResult.message}</p>

            {/* Skor Kartları */}
            <div className={`grid gap-2 w-full mt-2 ${numPlayers === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {Array.from({ length: numPlayers }).map((_, idx) => {
                const isWinner = gameResult.winner === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3 border-2 transition-all ${
                      isWinner
                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-300 block truncate">
                      {getPlayerTitle(idx)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
                      {playerStates[idx].score} <small className="text-xs text-white">Basket</small>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-2 w-full mt-2">
              <button
                onClick={startGame}
                className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={18} /> Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer border border-white/20 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ÖĞRENCİ SEÇİM MODALİ (1. VE 2. OYUNCU İÇİN ÖZEL SEÇİCİ) */}
      {selectingPlayerIdx !== null && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b1329] border-2 border-slate-700 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.85)] text-white">
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-sm ${
                    selectingPlayerIdx === 0 ? 'bg-[#dc2626]' : 'bg-[#2563eb]'
                  }`}
                >
                  {selectingPlayerIdx === 0 ? '🔴 1' : '🔵 2'}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {selectingPlayerIdx === 0 ? '1. Oyuncu (Kırmızı Sol Saha)' : '2. Oyuncu (Mavi Sağ Saha)'}
                  </h3>
                  <p className="text-xs text-slate-400">Bu oyuncu için sınıftan bir öğrenci seçin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectingPlayerIdx(null)}
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
                      Öğrenci bulunamadı. Yeni öğrenci eklemek için aşağıdaki butonu kullanabilirsiniz.
                    </div>
                  );
                }

                return availableStudents.map((st) => {
                  const isSelectedForCurrent = effectiveSelectedIds[selectingPlayerIdx] === st.id;
                  const isSelectedForOther = effectiveSelectedIds[selectingPlayerIdx === 0 ? 1 : 0] === st.id;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        handleSelectStudentForPlayer(selectingPlayerIdx, st.id);
                        setSelectingPlayerIdx(null);
                      }}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left ${
                        isSelectedForCurrent
                          ? selectingPlayerIdx === 0
                            ? 'bg-rose-500/20 border-rose-400 ring-2 ring-rose-500/50'
                            : 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-500/50'
                          : isSelectedForOther
                          ? 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:border-amber-400'
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
                        {isSelectedForCurrent && (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                              selectingPlayerIdx === 0 ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                            }`}
                          >
                            <Check size={12} /> Seçili
                          </span>
                        )}
                        {!isSelectedForCurrent && isSelectedForOther && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            Diğer Oyuncuda
                          </span>
                        )}
                        {!isSelectedForCurrent && !isSelectedForOther && (
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
                  handleSelectStudentForPlayer(selectingPlayerIdx, null);
                  setSelectingPlayerIdx(null);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                İsimsiz Oyna
              </button>

              {onOpenRosterModal && (
                <button
                  type="button"
                  onClick={() => {
                    const targetG = typeof pickerGradeTab === 'number' ? pickerGradeTab : (grade || 2);
                    setSelectingPlayerIdx(null);
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

export default SayiBasketiGame;
