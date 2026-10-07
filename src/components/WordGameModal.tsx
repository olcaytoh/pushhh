import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, RotateCcw, ArrowLeft, Trophy, Flame, 
  HelpCircle, Swords, Zap, CheckCircle2, XCircle, Heart, Star, Clock, Users, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZIT_ANLAM_DATA, ES_ANLAM_DATA, INGILIZCE_DATA, WordPair } from '../data/wordPairsData';
import { BasketballRaceTrack, SingleBasketballTrack } from './BasketballRaceTrack';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { AutoFitOptionContent } from './AutoFitOptionContent';

interface WordGameModalProps {
  gameType: 'zit_anlam' | 'es_anlam' | 'ingilizce';
  onClose: () => void;
  onGoHome?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  soundEnabled?: boolean;
  onQuestionAnswered?: (isCorrect: boolean, gameType: 'zit_anlam' | 'es_anlam' | 'ingilizce', playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
}

type GameMode = 'duel2' | 'duel3' | 'quiz1' | 'matching';

interface MemoryCard {
  id: string;
  pairId: number;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
  emoji?: string;
}

interface DuelPlayer {
  id: number;
  name: string;
  avatar: string;
  img: string;
  colorTheme: {
    border: string;
    bg: string;
    headerBg: string;
    optBg: string;
    text: string;
    tagBg: string;
  };
  score: number;
  lives: number;
  currentQuestion: {
    word: string;
    correct: string;
    options: string[];
    emoji?: string;
  } | null;
  selectedOption: string | null;
  feedback: 'none' | 'correct' | 'wrong';
  isEliminated: boolean;
}

const PLAYER_THEMES = [
  {
    name: '1. GRUP',
    avatar: 'KAPLAN',
    img: '/kap.webp',
    border: 'border-blue-500',
    bg: 'from-blue-950/80 via-slate-900/90 to-blue-950/90',
    headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800',
    optBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-300',
    text: 'text-blue-300',
    tagBg: 'bg-blue-500/30 text-blue-200 border-blue-400/50'
  },
  {
    name: '2. GRUP',
    avatar: 'EJDERHA',
    img: '/ejd.webp',
    border: 'border-rose-500',
    bg: 'from-rose-950/80 via-slate-900/90 to-rose-950/90',
    headerBg: 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800',
    optBg: 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-red-500 text-white border-rose-300',
    text: 'text-rose-300',
    tagBg: 'bg-rose-500/30 text-rose-200 border-rose-400/50'
  },
  {
    name: '3. GRUP',
    avatar: 'SAVAŞÇI',
    img: '/balta.webp',
    border: 'border-emerald-500',
    bg: 'from-emerald-950/80 via-slate-900/90 to-teal-950/90',
    headerBg: 'bg-gradient-to-r from-emerald-700 via-teal-600 to-green-800',
    optBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-300',
    text: 'text-emerald-300',
    tagBg: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
  }
];

function generateWordQuestion(data: WordPair[], excludeWord?: string) {
  const pool = data.filter(d => d.word !== excludeWord);
  const selected = pool[Math.floor(Math.random() * pool.length)] || data[0];

  const wrongOptions = data
    .filter(d => d.word !== selected.word && d.match !== selected.match)
    .map(d => d.match)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const allOptions = [selected.match, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    word: selected.word,
    correct: selected.match,
    options: allOptions,
    emoji: selected.emoji
  };
}

// Helper function for automatic max font size that matches standard activity design
const getWordOptionFontSize = (options: string[], mode: 1 | 2 | 3 = 1) => {
  const maxOptLen = Math.max(...options.map(o => String(o || '').trim().length), 0);
  if (mode === 3) {
    if (maxOptLen <= 4) return 'text-xs xs:text-sm sm:text-base font-black';
    if (maxOptLen <= 7) return 'text-[11px] xs:text-xs sm:text-sm font-black';
    if (maxOptLen <= 11) return 'text-[10px] xs:text-[11px] sm:text-xs font-bold';
    return 'text-[9px] xs:text-[10px] sm:text-[11px] font-bold';
  }
  if (mode === 2) {
    if (maxOptLen <= 4) return 'text-sm xs:text-base sm:text-lg md:text-xl font-black';
    if (maxOptLen <= 7) return 'text-xs xs:text-sm sm:text-base md:text-lg font-black';
    if (maxOptLen <= 11) return 'text-[11px] xs:text-xs sm:text-sm md:text-base font-bold';
    if (maxOptLen <= 15) return 'text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold';
    return 'text-[9px] xs:text-[10px] sm:text-[11px] font-bold';
  }
  // 1-Player Quiz - Yüzde 50 küçültülmüş kompakt ve dengeli buton boyutları
  if (maxOptLen <= 4) return 'text-base xs:text-lg sm:text-xl md:text-2xl font-black';
  if (maxOptLen <= 7) return 'text-sm xs:text-base sm:text-lg md:text-xl font-black';
  if (maxOptLen <= 11) return 'text-xs xs:text-sm sm:text-base md:text-lg font-bold';
  if (maxOptLen <= 15) return 'text-[11px] xs:text-xs sm:text-sm md:text-base font-bold';
  return 'text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold';
};

const getWinnerVideoConfig = (winnerIdx: number | null) => {
  if (winnerIdx === 0) {
    return {
      videoSrc: '/kap.mp4',
      title: '1. GRUP ŞAMPİYON! 🏆',
      img: '/kap1.webp',
      badgeBg: 'from-blue-600 via-cyan-500 to-indigo-600',
      borderColor: 'border-cyan-400',
      glowColor: 'shadow-[0_0_35px_rgba(6,182,212,0.95)]'
    };
  }
  if (winnerIdx === 1) {
    return {
      videoSrc: '/ejd.mp4',
      title: '2. GRUP ŞAMPİYON! 🏆',
      img: '/ejd1.webp',
      badgeBg: 'from-rose-600 via-pink-500 to-red-700',
      borderColor: 'border-rose-400',
      glowColor: 'shadow-[0_0_35px_rgba(244,63,94,0.95)]'
    };
  }
  return {
    videoSrc: '/sog.mp4',
    title: '3. GRUP ŞAMPİYON! 🏆',
    img: '/balta1.webp',
    badgeBg: 'from-emerald-600 via-teal-500 to-green-700',
    borderColor: 'border-emerald-400',
    glowColor: 'shadow-[0_0_35px_rgba(16,185,129,0.95)]'
  };
};

export const WordGameModal: React.FC<WordGameModalProps> = ({
  gameType,
  onClose,
  onGoHome,
  playMp3,
  playerCountMode = 2,
  onSwitchPlayerCountMode,
  soundEnabled = true,
  onQuestionAnswered,
  onGameCompleted,
  students,
  selectedStudentId,
  selectedStudentIds: propSelectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
}) => {
  const assignedStudent = useMemo(
    () => students?.find(s => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const [selectedStudentIds, setSelectedStudentIds] = useState<(string | null)[]>([
    selectedStudentId || null,
    null,
    null
  ]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (propSelectedStudentIds && propSelectedStudentIds.length >= 3) {
      return propSelectedStudentIds;
    }
    return selectedStudentIds;
  }, [propSelectedStudentIds, selectedStudentIds]);

  useEffect(() => {
    if (selectedStudentId !== undefined) {
      setSelectedStudentIds(prev => [selectedStudentId || null, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentId]);

  const isZit = gameType === 'zit_anlam';
  const isEs = gameType === 'es_anlam';
  const isIng = gameType === 'ingilizce';
  const gameTitle = isIng ? 'İngilizce Kelime Oyunları' : isZit ? 'Zıt Anlamlı Kelimeler' : 'Eş Anlamlı Kelimeler';
  const gameConcept = isIng ? 'TÜRKÇE KARŞILIĞI' : isZit ? 'ZIT (Karşıt)' : 'EŞ (Anlamdaş)';

  const [englishGrade, setEnglishGrade] = useState<'all' | '2. Sınıf' | '3. Sınıf' | '4. Sınıf'>('all');

  const baseData = isIng ? INGILIZCE_DATA : isZit ? ZIT_ANLAM_DATA : ES_ANLAM_DATA;
  const rawData = useMemo(() => {
    if (isIng && englishGrade !== 'all') {
      return baseData.filter(item => item.category === englishGrade);
    }
    return baseData;
  }, [baseData, isIng, englishGrade]);

  // Derive initial activeMode from playerCountMode
  const initialMode: GameMode = playerCountMode === 1 ? 'quiz1' : playerCountMode === 3 ? 'duel3' : 'duel2';
  const [activeMode, setActiveMode] = useState<GameMode>(initialMode);

  // Synchronize activeMode when global playerCountMode changes
  useEffect(() => {
    if (isZit && activeMode === 'matching') {
      setActiveMode(playerCountMode === 1 ? 'quiz1' : playerCountMode === 3 ? 'duel3' : 'duel2');
    } else if (activeMode !== 'matching') {
      setActiveMode(playerCountMode === 1 ? 'quiz1' : playerCountMode === 3 ? 'duel3' : 'duel2');
    }
  }, [playerCountMode, isZit]);

  const handleSwitchPlayerMode = (mode: 1 | 2 | 3) => {
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    setActiveMode(mode === 1 ? 'quiz1' : mode === 3 ? 'duel3' : 'duel2');
    playSound('click');
  };

  // Sound helper
  const playSound = (type: 'correct' | 'wrong' | 'win' | 'click' | 'flip') => {
    if (playMp3) {
      if (type === 'correct') playMp3('/para.mp3');
      else if (type === 'wrong') playMp3('/hata.mp3');
      else if (type === 'win') playMp3('/kazandinn.mp3');
      else if (type === 'flip') playMp3('/tek.mp3');
      else playMp3('/coin.mp3');
    }
  };

  // ==========================================
  // 1. MATCHING / MEMORY CARDS LOGIC
  // ==========================================
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [matchMoves, setMatchMoves] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const matchDifficulty = isIng ? 8 : 6; // İngilizce: 8 çift = 16 kart (4x4), Zıt/Eş: 6 çift = 12 kart

  const initMatchingGame = useCallback(() => {
    const shuffledSource = [...rawData].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledSource.slice(0, matchDifficulty);

    const generatedCards: MemoryCard[] = [];
    selectedPairs.forEach((pair, index) => {
      generatedCards.push({
        id: `pair-${index}-a`,
        pairId: index,
        text: pair.word,
        isFlipped: false,
        isMatched: false,
        emoji: isIng ? undefined : pair.emoji?.split(' ')[0]
      });
      generatedCards.push({
        id: `pair-${index}-b`,
        pairId: index,
        text: pair.match,
        isFlipped: false,
        isMatched: false,
        emoji: isIng ? undefined : (pair.emoji?.split(' ')[1] || pair.emoji)
      });
    });

    const shuffledCards = generatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCardIds([]);
    setMatchedPairsCount(0);
    setMatchMoves(0);
    setMatchTimer(0);
    setIsMatchComplete(false);
  }, [rawData, matchDifficulty]);

  useEffect(() => {
    if (activeMode === 'matching') {
      initMatchingGame();
    }
  }, [activeMode, initMatchingGame]);

  useEffect(() => {
    let interval: any = null;
    if (activeMode === 'matching' && !isMatchComplete) {
      interval = setInterval(() => {
        setMatchTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMode, isMatchComplete]);

  const handleCardClick = (cardId: string) => {
    if (flippedCardIds.length >= 2) return;
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    playSound('flip');

    const newFlipped = [...flippedCardIds, cardId];
    setFlippedCardIds(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMatchMoves(m => m + 1);
      const card1 = cards.find(c => c.id === newFlipped[0])!;
      const card2 = clickedCard;

      if (card1.pairId === card2.pairId) {
        // MATCH!
        onQuestionAnswered?.(true, gameType, 0);
        setTimeout(() => {
          playSound('correct');
          setCards(prev => prev.map(c => 
            (c.id === card1.id || c.id === card2.id) 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          ));
          setFlippedCardIds([]);
          setMatchedPairsCount(prev => {
            const nextCount = prev + 1;
            if (nextCount >= matchDifficulty) {
              setIsMatchComplete(true);
              playSound('win');
              onGameCompleted?.(0, 1);
              try {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              } catch {}
            }
            return nextCount;
          });
        }, 400);
      } else {
        // MISMATCH
        onQuestionAnswered?.(false, gameType, 0);
        setTimeout(() => {
          playSound('wrong');
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCardIds([]);
        }, 900);
      }
    }
  };

  // ==========================================
  // 2. 1-PLAYER QUIZ TEST LOGIC
  // ==========================================
  const [quizScore, setQuizScore] = useState(0);
  const [quizLives, setQuizLives] = useState(3);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState<{
    word: string;
    correct: string;
    options: string[];
    emoji?: string;
  } | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isQuizGameOver, setIsQuizGameOver] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(100);

  const initQuiz1 = useCallback(() => {
    setQuizScore(0);
    setQuizLives(3);
    setQuizStreak(0);
    setQuizSelectedOption(null);
    setQuizFeedback('none');
    setIsQuizGameOver(false);
    setQuizTimeLeft(100);
    setQuizQuestion(generateWordQuestion(rawData));
  }, [rawData]);

  useEffect(() => {
    if (activeMode === 'quiz1') {
      initQuiz1();
    }
  }, [activeMode, initQuiz1]);

  // 100-Second Countdown Timer for Single Player Quiz
  useEffect(() => {
    if (activeMode !== 'quiz1' || isQuizGameOver || !quizQuestion || quizFeedback !== 'none') {
      return;
    }

    if (quizTimeLeft <= 0) {
      playSound('wrong');
      setQuizFeedback('wrong');
      setTimeout(() => {
        setIsQuizGameOver(true);
        playSound('win');
      }, 600);
      return;
    }

    if (quizTimeLeft <= 3 && quizTimeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setQuizTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMode, isQuizGameOver, quizQuestion, quizFeedback, quizTimeLeft, quizLives, rawData, playMp3]);

  const handleQuizAnswer = (option: string) => {
    if (quizFeedback !== 'none' || !quizQuestion || isQuizGameOver) return;

    setQuizSelectedOption(option);
    const isCorrect = option === quizQuestion.correct;
    onQuestionAnswered?.(isCorrect, gameType, 0);

    if (isCorrect) {
      playSound('correct');
      setQuizFeedback('correct');
      const nextScore = quizScore + 1;
      setQuizScore(nextScore);
      setQuizStreak(st => st + 1);

      // Onuncu doğru yapıldığında oyunu zafer ile bitir
      if (nextScore >= 10) {
        setTimeout(() => {
          setIsQuizGameOver(true);
          playSound('win');
          onGameCompleted?.(0, 1);
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          } catch {}
        }, 600);
        return;
      }

      setTimeout(() => {
        setQuizQuestion(generateWordQuestion(rawData, quizQuestion.word));
        setQuizSelectedOption(null);
        setQuizFeedback('none');
      }, 700);
    } else {
      playSound('wrong');
      setQuizFeedback('wrong');
      setQuizStreak(0);
      const nextLives = quizLives - 1;
      setQuizLives(nextLives);

      if (nextLives <= 0) {
        setTimeout(() => {
          setIsQuizGameOver(true);
          playSound('win');
        }, 800);
      } else {
        setTimeout(() => {
          setQuizQuestion(generateWordQuestion(rawData, quizQuestion.word));
          setQuizSelectedOption(null);
          setQuizFeedback('none');
        }, 1000);
      }
    }
  };

  // ==========================================
  // 3. MULTIPLAYER DUEL: 2 & 3 PLAYER LOGIC
  // ==========================================
  const createInitialPlayers = useCallback((numPlayers: number, data: WordPair[]): DuelPlayer[] => {
    const initialized: DuelPlayer[] = [];
    for (let i = 0; i < numPlayers; i++) {
      initialized.push({
        id: i,
        name: PLAYER_THEMES[i].name,
        avatar: PLAYER_THEMES[i].avatar,
        img: PLAYER_THEMES[i].img,
        colorTheme: PLAYER_THEMES[i],
        score: 0,
        lives: 3,
        currentQuestion: generateWordQuestion(data),
        selectedOption: null,
        feedback: 'none',
        isEliminated: false
      });
    }
    return initialized;
  }, []);

  const [duelPlayers, setDuelPlayers] = useState<DuelPlayer[]>(() =>
    createInitialPlayers(playerCountMode === 3 ? 3 : 2, rawData)
  );
  const [duelWinnerIndex, setDuelWinnerIndex] = useState<number | null>(null);
  const [isDuelFinished, setIsDuelFinished] = useState(false);
  const [trackVictoryVideoActive, setTrackVictoryVideoActive] = useState(false);
  const duelTargetScore = 10;

  const initMultiplayerGame = useCallback((numPlayers: 2 | 3) => {
    setDuelPlayers(createInitialPlayers(numPlayers, rawData));
    setDuelWinnerIndex(null);
    setTrackVictoryVideoActive(false);
    setIsDuelFinished(false);
  }, [rawData, createInitialPlayers]);

  useEffect(() => {
    if (activeMode === 'duel2') {
      initMultiplayerGame(2);
    } else if (activeMode === 'duel3') {
      initMultiplayerGame(3);
    }
  }, [activeMode, initMultiplayerGame]);

  const handleMultiplayerAnswer = (pIdx: number, option: string) => {
    if (isDuelFinished) return;

    setDuelPlayers(prev => {
      const p = prev[pIdx];
      if (!p || p.isEliminated || p.feedback !== 'none' || !p.currentQuestion) {
        return prev;
      }

      const isCorrect = option === p.currentQuestion.correct;
      onQuestionAnswered?.(isCorrect, gameType, pIdx);
      const nextPlayers = [...prev];

      if (isCorrect) {
        playSound('correct');
        const nextScore = p.score + 1;
        nextPlayers[pIdx] = {
          ...p,
          score: nextScore,
          selectedOption: option,
          feedback: 'correct'
        };

        if (nextScore >= duelTargetScore) {
          setTimeout(() => {
            setDuelWinnerIndex(pIdx);
            setTrackVictoryVideoActive(true);
            playSound('win');
            onGameCompleted?.(pIdx, activeMode === 'duel3' ? 3 : 2);
            try {
              confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
            } catch {}
          }, 300);
        } else {
          setTimeout(() => {
            setDuelPlayers(curr => {
              const currentP = curr[pIdx];
              if (!currentP) return curr;
              const updated = [...curr];
              updated[pIdx] = {
                ...currentP,
                currentQuestion: generateWordQuestion(rawData, currentP.currentQuestion?.word),
                selectedOption: null,
                feedback: 'none'
              };
              return updated;
            });
          }, 550);
        }
      } else {
        playSound('wrong');
        const nextLives = p.lives - 1;
        const isEliminated = nextLives <= 0;

        nextPlayers[pIdx] = {
          ...p,
          lives: nextLives,
          isEliminated,
          selectedOption: option,
          feedback: 'wrong'
        };

        if (isEliminated) {
          const activeRemaining = nextPlayers.filter(pl => !pl.isEliminated);
          if (activeRemaining.length === 1) {
            const winner = activeRemaining[0];
            setTimeout(() => {
              setDuelWinnerIndex(winner.id);
              setTrackVictoryVideoActive(true);
              playSound('win');
              onGameCompleted?.(winner.id, activeMode === 'duel3' ? 3 : 2);
              try {
                confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
              } catch {}
            }, 500);
          } else if (activeRemaining.length === 0) {
            let maxScorer = nextPlayers[0];
            nextPlayers.forEach(pl => {
              if (pl.score > maxScorer.score) maxScorer = pl;
            });
            setTimeout(() => {
              setDuelWinnerIndex(maxScorer.id);
              setTrackVictoryVideoActive(true);
              playSound('win');
              onGameCompleted?.(maxScorer.id, activeMode === 'duel3' ? 3 : 2);
            }, 500);
          } else {
            setTimeout(() => {
              setDuelPlayers(curr => {
                const currentP = curr[pIdx];
                if (!currentP) return curr;
                const updated = [...curr];
                updated[pIdx] = {
                  ...currentP,
                  feedback: 'none'
                };
                return updated;
              });
            }, 800);
          }
        } else {
          setTimeout(() => {
            setDuelPlayers(curr => {
              const currentP = curr[pIdx];
              if (!currentP) return curr;
              const updated = [...curr];
              updated[pIdx] = {
                ...currentP,
                currentQuestion: generateWordQuestion(rawData, currentP.currentQuestion?.word),
                selectedOption: null,
                feedback: 'none'
              };
              return updated;
            });
          }, 800);
        }
      }

      return nextPlayers;
    });
  };

  const showCompletionScreen = 
    (activeMode === 'matching' && isMatchComplete) ||
    (activeMode === 'quiz1' && isQuizGameOver) ||
    ((activeMode === 'duel2' || activeMode === 'duel3') && isDuelFinished);

  const restartCurrentGame = () => {
    playSound('click');
    setTrackVictoryVideoActive(false);
    setDuelWinnerIndex(null);
    setIsDuelFinished(false);
    if (activeMode === 'matching') initMatchingGame();
    else if (activeMode === 'quiz1') initQuiz1();
    else if (activeMode === 'duel2') initMultiplayerGame(2);
    else initMultiplayerGame(3);
  };

  const renderDuelPlayerCard = (p: DuelPlayer | undefined, pIdx: number) => {
    if (!p) return null;

    const groupTheme = pIdx === 0 
      ? {
          accentColor: "blue",
          badgeBg: "from-blue-700 via-indigo-800 to-blue-950",
          badgeBorder: "border-blue-400",
          containerBorder: "border-blue-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)]",
          headerAccentBorder: "border-l-4 border-l-blue-400",
          headerTitleColor: "text-blue-200",
          avatarBorder: "border-2 border-blue-400",
          avatarBg: "bg-[#080e1d] text-blue-300",
          buttonDefault: "bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] active:from-[#0e1726] active:to-[#090f1a] text-blue-50/95 border-2 border-blue-500/35 hover:border-blue-400/70 shadow-md active:shadow-xs",
          buttonGlare: "from-blue-300/10 to-transparent",
        }
      : pIdx === 1
      ? {
          accentColor: "rose",
          badgeBg: "from-rose-700 via-pink-800 to-rose-950",
          badgeBorder: "border-rose-400",
          containerBorder: "border-rose-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(244,63,94,0.15)]",
          headerAccentBorder: "border-l-4 border-l-rose-400",
          headerTitleColor: "text-rose-200",
          avatarBorder: "border-2 border-rose-400",
          avatarBg: "bg-[#080e1d] text-rose-300",
          buttonDefault: "bg-gradient-to-b from-[#2e1925] via-[#24131d] to-[#180b13] hover:from-[#3a2030] hover:via-[#2c1724] hover:to-[#1d0e17] active:from-[#190c14] active:to-[#10070c] text-rose-50/95 border-2 border-rose-500/35 hover:border-rose-400/70 shadow-md active:shadow-xs",
          buttonGlare: "from-rose-300/10 to-transparent",
        }
      : {
          accentColor: "emerald",
          badgeBg: "from-emerald-700 via-teal-800 to-emerald-950",
          badgeBorder: "border-emerald-400",
          containerBorder: "border-emerald-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(16,185,129,0.15)]",
          headerAccentBorder: "border-l-4 border-l-emerald-400",
          headerTitleColor: "text-emerald-200",
          avatarBorder: "border-2 border-emerald-400",
          avatarBg: "bg-[#080e1d] text-emerald-300",
          buttonDefault: "bg-gradient-to-b from-[#142821] via-[#0f201a] to-[#091511] hover:from-[#1a332a] hover:via-[#142921] hover:to-[#0c1c16] active:from-[#0a1612] active:to-[#050c0a] text-emerald-50/95 border-2 border-emerald-500/35 hover:border-emerald-400/70 shadow-md active:shadow-xs",
          buttonGlare: "from-emerald-300/10 to-transparent",
        };

    const isWinnerGroup = trackVictoryVideoActive && duelWinnerIndex === pIdx;
    const isOtherGroup = trackVictoryVideoActive && duelWinnerIndex !== null && duelWinnerIndex !== pIdx;
    const winCfg = getWinnerVideoConfig(duelWinnerIndex);

    const optFontClass = getWordOptionFontSize(p.currentQuestion?.options || [], activeMode === 'duel3' ? 3 : 2);
    const optHeightClasses = activeMode === 'duel3' 
      ? "py-1.5 sm:py-2 px-1.5 min-h-[48px] sm:min-h-[54px] md:min-h-[60px] h-[48px] sm:h-[54px] md:h-[60px]" 
      : "py-2 sm:py-2.5 px-2 min-h-[54px] sm:min-h-[64px] md:min-h-[72px] h-[54px] sm:h-[64px] md:h-[72px]";

    // KAZANAN GRUP: KART KENDİ ALANINDA ZAFER VİDEOSUNU GÖSTERİR
    if (isWinnerGroup) {
      return (
        <div
          key={p.id}
          className={`relative flex-1 flex flex-col justify-between p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-4 border-yellow-400 bg-[#0a0f1d] shadow-[0_0_35px_rgba(250,204,21,0.85)] ring-4 ring-yellow-400/50 overflow-hidden min-h-0 z-30 scale-[1.02] transition-all w-full max-w-none mx-auto h-full`}
        >
          <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-600 border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.9)] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 animate-bounce">
              🏆
            </div>
            <div className="flex-1 ml-1.5 sm:ml-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white rounded-xl px-2.5 py-1 flex items-center justify-between shadow-lg">
              <span className="font-black text-[11px] sm:text-xs text-slate-950 uppercase tracking-wide truncate flex items-center gap-1.5">
                <img src={winCfg.img} alt={winCfg.title} className="w-4 h-4 sm:w-5 sm:h-5 object-contain inline-block" />
                <span>{pIdx + 1}. GRUP KAZANDI!</span>
              </span>
              <span className="bg-slate-950 text-yellow-300 font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg shadow-inner">
                {p.score} / {duelTargetScore}
              </span>
            </div>
          </div>

          <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-black border-2 border-yellow-400/80 shadow-[inset_0_0_25px_rgba(0,0,0,0.9),0_0_25px_rgba(250,204,21,0.5)] overflow-hidden flex flex-col items-center justify-center min-h-0 w-full my-0.5">
            <video
              key={winCfg.videoSrc}
              src={winCfg.videoSrc}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => {
                setTrackVictoryVideoActive(false);
                setIsDuelFinished(true);
              }}
              onError={() => {
                setTrackVictoryVideoActive(false);
                setIsDuelFinished(true);
              }}
            />
            <div className={`absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r ${winCfg.badgeBg} text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-full border border-white shadow-xl flex items-center gap-1.5 z-20 pointer-events-none drop-shadow-md animate-pulse`}>
              <img src={winCfg.img} alt="Şampiyon" className="w-4 h-4 object-contain" />
              <span>{winCfg.title}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTrackVictoryVideoActive(false);
                setIsDuelFinished(true);
              }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[10px] sm:text-xs px-3.5 py-1 rounded-full border border-white shadow-2xl transition cursor-pointer z-20 flex items-center gap-1"
            >
              <span>Sonuçları Gör</span>
              <span>⏩</span>
            </button>
          </div>
        </div>
      );
    }

    // DİĞER GRUPLAR (YARIŞMA TAMAMLANDI)
    if (isOtherGroup) {
      return (
        <div
          key={p.id}
          className={`relative flex-1 flex flex-col justify-between p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 border-slate-700 bg-[#0a0f1d] opacity-65 shadow-xl overflow-hidden min-h-0 z-10 transition-all w-full max-w-none mx-auto h-full`}
        >
          <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${groupTheme.badgeBg} border-2 ${groupTheme.badgeBorder} text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0`}>
              {pIdx + 1}
            </div>
            <div className="flex-1 ml-1.5 sm:ml-2 bg-slate-900 border border-slate-700 rounded-xl px-2 sm:px-2.5 py-1 flex items-center justify-between">
              <span className="font-black text-[11px] sm:text-xs text-slate-400 uppercase tracking-wide truncate">
                {pIdx + 1}. GRUP
              </span>
              <span className="bg-white/10 text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-lg">
                {p.score} / {duelTargetScore}
              </span>
            </div>
          </div>
          <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#0f172a] border border-white/20 flex flex-col items-center justify-center text-center p-3 my-0.5 min-h-0 w-full">
            <div className="text-2xl sm:text-3xl mb-1 filter drop-shadow">🏁</div>
            <div className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wide">
              YARIŞMA TAMAMLANDI
            </div>
            <div className="text-[11px] text-amber-300 font-bold mt-0.5">
              Final Skoru: {p.score} / {duelTargetScore}
            </div>
          </div>
        </div>
      );
    }

    const assignedPlayerStudent = effectiveSelectedStudentIds[pIdx]
      ? (students?.find(s => s.id === effectiveSelectedStudentIds[pIdx]) || null)
      : (pIdx === 0 ? assignedStudent : null);

    return (
      <div
        key={p.id}
        className={`relative flex-1 flex flex-col justify-between p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 ${groupTheme.containerBorder} bg-[#0b1328] shadow-2xl overflow-hidden min-h-0 z-10 transition-all w-full max-w-none mx-auto h-full`}
      >
        {/* PLAYER HEADER BAR */}
        <div className="flex items-center justify-between z-10 shrink-0 w-full mb-1 h-8 sm:h-9">
          {/* LEFT: CIRCLE BADGE OR AVATAR */}
          {assignedPlayerStudent ? (
            <div 
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${assignedPlayerStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}
              title={`Aktif Öğrenci: ${assignedPlayerStudent.name}`}
            >
              {assignedPlayerStudent.avatar}
            </div>
          ) : (
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${groupTheme.avatarBg} ${groupTheme.avatarBorder} font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}>
              {pIdx + 1}
            </div>
          )}

          {/* CONNECTED SOLID CAPSULE FOR GROUP NAME & SCORE */}
          <div className={`flex-1 h-full ml-1.5 sm:ml-2 bg-[#0e172a] border border-slate-700/80 ${groupTheme.headerAccentBorder} rounded-xl px-2 sm:px-2.5 flex items-center justify-between shadow-xs gap-1 sm:gap-1.5`}>
            <span className={`font-black text-xs ${groupTheme.headerTitleColor} uppercase tracking-wide truncate`}>
              {assignedPlayerStudent ? `${assignedPlayerStudent.name} (${p.avatar})` : `${pIdx + 1}. GRUP (${p.avatar})`}
            </span>

            {/* RIGHT: SCORE & HEARTS */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                {p.score} / {duelTargetScore}
              </span>
              <div className="flex items-center gap-1 px-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-xs sm:text-sm transition-all ${i < p.lives ? 'text-rose-500 scale-100' : 'text-slate-600 opacity-30 grayscale'}`}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION SOLID CONTAINER FOR THIS PLAYER */}
        <div className={`relative flex-1 rounded-2xl sm:rounded-3xl bg-[#0f172a] border-2 border-cyan-300/60 shadow-[0_8px_32px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] ${activeMode === 'duel3' ? 'px-1.5 py-1.5 sm:px-2 sm:py-2 my-0.5' : 'px-3 py-2 sm:px-4 sm:py-3 my-1'} flex flex-col items-center justify-center text-center z-10 overflow-hidden min-h-0 w-full`}>
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

          {p.isEliminated || p.lives <= 0 ? (
            <div className="relative z-20 flex flex-col items-center justify-center gap-1 p-2">
              <div className="text-2xl sm:text-3xl animate-bounce">💔</div>
              <div className="text-xl xs:text-2xl sm:text-3xl font-black text-rose-500 uppercase tracking-widest [text-shadow:0_3px_6px_#000,0_6px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_12px_rgba(225,29,72,0.95)] animate-pulse">
                ELENDİ!
              </div>
              <div className="text-white/90 text-[11px] sm:text-xs font-black [text-shadow:0_2px_4px_#000] drop-shadow-md">
                Diğer oyuncular yarışıyor...
              </div>
            </div>
          ) : p.currentQuestion ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-2 sm:px-3 w-full max-h-full overflow-hidden my-auto">
              <div className="text-xs sm:text-sm md:text-base font-black uppercase text-amber-300 tracking-wider mb-1.5 drop-shadow-[0_2px_4px_#000] [text-shadow:0_2px_4px_#000]">
                {isIng ? 'TÜRKÇE ANLAMI:' : isZit ? 'ZIT ANLAMLISI:' : 'EŞ ANLAMLISI:'}
              </div>

              {/* TARGET WORD DISPLAY - DİNAMİK VE ÇERÇEVEYE TAM SIĞAN KAPSÜL */}
              <div className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-[0_6px_20px_rgba(245,158,11,0.4)] border-2 sm:border-3 border-white flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full min-w-0">
                {!isIng && p.currentQuestion.emoji && (
                  <span className="text-base sm:text-xl md:text-2xl shrink-0 filter drop-shadow-sm">
                    {p.currentQuestion.emoji}
                  </span>
                )}
                {(() => {
                  const wText = p.currentQuestion.word || '';
                  const len = wText.length;
                  const isDuel3 = activeMode === 'duel3';
                  const wordFont = isDuel3
                    ? (len <= 5 ? 'text-sm sm:text-base md:text-lg' : len <= 8 ? 'text-xs sm:text-sm md:text-base' : len <= 12 ? 'text-[11px] sm:text-xs md:text-sm' : 'text-[10px] sm:text-[11px] md:text-xs')
                    : (len <= 5 ? 'text-base sm:text-xl md:text-2xl' : len <= 8 ? 'text-sm sm:text-lg md:text-xl' : len <= 12 ? 'text-xs sm:text-base md:text-lg' : 'text-xs sm:text-sm md:text-base');

                  return (
                    <span className={`${wordFont} font-black tracking-wide uppercase leading-tight text-slate-950 text-center break-words max-w-full px-0.5`}>
                      {wText}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : null}
        </div>

        {/* 4 CHOICES GRID UNDER THE QUESTION - EXACTLY MATCHING QUESTION FRAME WIDTH */}
        {!p.isEliminated && p.lives > 0 && p.currentQuestion && (
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full mx-auto shrink-0 z-10">
            {p.currentQuestion.options.map((opt, oIdx) => {
              const isSelected = p.selectedOption === opt;
              const isCorrectOpt = opt === p.currentQuestion?.correct;
              
              let btnClass = groupTheme.buttonDefault;
              if (p.feedback !== 'none') {
                if (isCorrectOpt) {
                  btnClass = "ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 shadow-md text-white";
                } else if (isSelected) {
                  btnClass = "ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 shadow-md text-white";
                } else {
                  btnClass = "opacity-35 border-slate-700/60 bg-slate-900/60 text-slate-400";
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={p.feedback !== 'none' || p.isEliminated || p.lives <= 0}
                  onClick={() => handleMultiplayerAnswer(pIdx, opt)}
                  className={`fast-quiz-btn relative w-full ${optHeightClasses} rounded-xl sm:rounded-2xl border-2 transition-colors duration-75 flex items-center justify-center text-center cursor-pointer uppercase tracking-wide overflow-hidden active:scale-98 ${btnClass}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${groupTheme.buttonGlare} pointer-events-none rounded-t-xl sm:rounded-t-2xl`} />
                  <AutoFitOptionContent
                    opt={opt}
                    displayOpt={opt}
                    mode={activeMode === 'duel3' ? 3 : 2}
                    fallbackFontClass={optFontClass}
                  />
                  {p.feedback !== 'none' && isCorrectOpt && (
                    <CheckCircle2 size={18} className="absolute right-2 text-emerald-300 shrink-0 filter drop-shadow-md z-20" />
                  )}
                  {p.feedback !== 'none' && isSelected && !isCorrectOpt && (
                    <XCircle size={18} className="absolute right-2 text-rose-300 shrink-0 filter drop-shadow-md z-20" />
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    );
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-40 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50/70 dark:from-[#0B132B] dark:via-blue-950 dark:to-slate-950 text-blue-950 dark:text-gray-100"
    >
      {/* 1. STANDART ARKA PLAN GÖRSELİ (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
      </div>

      {/* 2. SUB-HEADER: GRADE SELECTION & CONTROLS (CENTERED ON SCREEN) - REMOVED FOR ZIT ANLAM */}
      {!showCompletionScreen && !isZit && (
        <div className="relative z-20 px-3 sm:px-12 py-2 sm:py-2.5 bg-slate-950/85 border-b-2 border-amber-400/50 flex items-center justify-center shrink-0 shadow-lg">
          {isIng ? (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap text-center">
              <span className="text-[11px] sm:text-xs font-black text-amber-300 mr-0.5 sm:mr-1 uppercase drop-shadow-sm whitespace-nowrap">
                Sınıf Seç:
              </span>
              {[
                { id: 'all', label: '🌟 Tüm Seviyeler' },
                { id: '2. Sınıf', label: '🎒 2. Sınıf' },
                { id: '3. Sınıf', label: '🚀 3. Sınıf' },
                { id: '4. Sınıf', label: '👑 4. Sınıf' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setEnglishGrade(g.id as any);
                    if (activeMode === 'matching') {
                      setActiveMode(playerCountMode === 1 ? 'quiz1' : playerCountMode === 3 ? 'duel3' : 'duel2');
                    }
                    playSound('click');
                  }}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border whitespace-nowrap ${
                    englishGrade === g.id && activeMode !== 'matching'
                      ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_10px_rgba(251,191,36,0.7)] font-black scale-105'
                      : 'bg-white/15 text-white/90 border-white/20 hover:bg-white/25 hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}

              {/* HAFIZA KARTI BUTONU - 4. Sınıf Butonunun Hemen Yanında */}
              <button
                onClick={() => {
                  setActiveMode('matching');
                  playSound('click');
                }}
                className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                  activeMode === 'matching'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 border-white shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-105 font-black'
                    : 'bg-emerald-800/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-700/90 hover:text-white'
                }`}
              >
                <span>🧩 Hafıza Kartı</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap text-center">
              <button
                onClick={() => {
                  setActiveMode(playerCountMode === 1 ? 'quiz1' : playerCountMode === 3 ? 'duel3' : 'duel2');
                  playSound('click');
                }}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border whitespace-nowrap ${
                  activeMode !== 'matching'
                    ? 'bg-amber-400 text-slate-950 border-white shadow-md font-black scale-105'
                    : 'bg-white/15 text-white/90 border-white/20 hover:bg-white/25'
                }`}
              >
                <span>🎯 Kelime Kapışması</span>
              </button>

              <button
                onClick={() => {
                  setActiveMode('matching');
                  playSound('click');
                }}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                  activeMode === 'matching'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 border-white shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-105 font-black'
                    : 'bg-emerald-800/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-700/90 hover:text-white'
                }`}
              >
                <span>🧩 Hafıza Kartı</span>
              </button>
            </div>
          )}

          {/* ABSOLUTE RIGHT: RESTART BUTTON (YENİDEN BAŞLAT) */}
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center">
            <button
              onClick={restartCurrentGame}
              title="Yeniden Başlat"
              className="group relative w-8 h-8 sm:w-9 sm:h-9 aspect-square transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] shrink-0"
            >
              <img 
                src="/tekrar.webp" 
                alt="Yeniden Başlat" 
                className="w-full h-full object-contain pointer-events-none" 
              />
            </button>
          </div>
        </div>
      )}

      {/* RESTART BUTTON FOR ZIT ANLAM (Since sub-header bar is removed) */}
      {isZit && !showCompletionScreen && (
        <div className="absolute right-2 sm:right-4 top-2 sm:top-3 z-30 flex items-center">
          <button
            onClick={restartCurrentGame}
            title="Yeniden Başlat"
            className="group relative w-8 h-8 sm:w-9 sm:h-9 aspect-square transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] shrink-0"
          >
            <img 
              src="/tekrar.webp" 
              alt="Yeniden Başlat" 
              className="w-full h-full object-contain pointer-events-none" 
            />
          </button>
        </div>
      )}

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="relative z-10 flex-1 flex flex-col p-1 sm:p-2.5 overflow-hidden min-h-0">
        {/* ACTIVE STUDENT NOTIFICATION BADGE IF ANY */}
        {assignedStudent && (
          <div className="relative z-20 mb-1 flex items-center justify-center shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold shadow animate-fadeIn">
              <span>🎮 Oynayan Öğrenci:</span>
              <span className="text-white font-extrabold flex items-center gap-1">
                <span>{assignedStudent.avatar}</span>
                <span>{assignedStudent.name}</span>
              </span>
              {onSelectStudent && (
                <button
                  type="button"
                  onClick={() => onSelectStudent(null)}
                  className="text-amber-400 hover:text-amber-200 ml-1 text-[11px] underline cursor-pointer"
                >
                  (Değiştir)
                </button>
              )}
            </div>
          </div>
        )}

        {showCompletionScreen ? (
          /* ========================================================================= */
          /* A. VICTORY / GAME OVER COMPLETION SCREEN                                  */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 text-center animate-fadeIn min-h-0 overflow-y-auto no-scrollbar">
            <div className="relative max-w-md w-full bg-slate-950/80 backdrop-blur-xl border-3 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center mb-3 animate-bounce">
                <Trophy size={40} className="text-slate-950" />
              </div>

              {activeMode === 'matching' && (
                <>
                  <div className="w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-l-4 border-l-amber-400 text-center mb-2">
                    <h2 className="text-base sm:text-xl font-black text-amber-300 uppercase tracking-wide">
                      Tebrikler! Hafıza Tamamlandı!
                    </h2>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm font-bold mb-4">
                    {matchMoves} Hamlede ve {matchTimer} saniyede tüm çiftleri buldun!
                  </p>
                </>
              )}

              {activeMode === 'quiz1' && (
                <>
                  <div className="w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-l-4 border-l-amber-400 text-center mb-2">
                    <h2 className="text-base sm:text-xl font-black text-amber-300 uppercase tracking-wide">
                      {quizScore >= 10 ? '🎉 Tebrikler! 10 Doğru ile Tamamladın!' : 'Oyun Sona Erdi!'}
                    </h2>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm font-bold mb-4">
                    Toplam Doğru Sayısı: <span className="text-amber-400 font-black text-base">{quizScore} / 10</span>
                  </p>
                </>
              )}

              {(activeMode === 'duel2' || activeMode === 'duel3') && duelWinnerIndex !== null && (
                <>
                  <div className="w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-l-4 border-l-amber-400 text-center mb-2">
                    <div className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider mb-0.5">
                      Şampiyon Belli Oldu!
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wide drop-shadow-md">
                      👑 {duelPlayers[duelWinnerIndex]?.name} ({duelPlayers[duelWinnerIndex]?.avatar}) KAZANDI!
                    </h2>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm font-bold mb-4">
                    {duelPlayers[duelWinnerIndex]?.score} Puan ile zafer senin oldu!
                  </p>
                </>
              )}

              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <button
                  onClick={restartCurrentGame}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-white cursor-pointer"
                >
                  Yeniden Oyna
                </button>
                <button
                  onClick={onGoHome || onClose}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-white/20 text-white font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-white/30 active:scale-95 transition-all border border-white/40 cursor-pointer"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* B. ACTIVE GAMEPLAY SCREENS                                                */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 overflow-hidden">
            <div className="flex-1 w-full h-full min-h-0 flex flex-col items-center justify-between overflow-hidden">
            {/* MULTIPLAYER DUEL: 2 & 3 PLAYERS */}
            {(activeMode === 'duel2' || activeMode === 'duel3') && (
              <div className="flex-1 flex flex-col p-1 sm:p-2 md:p-2.5 w-full h-full overflow-hidden min-h-0 relative z-10 w-full max-w-none px-1.5 sm:px-3 md:px-4 mx-auto">
                {/* COMMON TOP BAR: SLEEK COMPACT GLASS CAPSULES */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 shrink-0 h-8 sm:h-9 w-full">
                  <span className="h-full px-2.5 sm:px-3 flex items-center bg-[#0e172a] border border-slate-700/80 text-slate-200 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider shrink-0">
                    ⚔️ {activeMode === 'duel2' ? '2' : '3'} OYUNCU DÜELLO
                  </span>
                  <div className="flex-1 min-w-0 text-center px-1 flex items-center justify-center gap-1.5 h-full">
                    <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest drop-shadow-sm">
                      ⚡ HIZLI VE DİKKATLİ OLAN KAZANIR ⚡
                    </span>
                  </div>
                  <span className="h-full px-2.5 sm:px-3 flex items-center bg-[#0e172a] border border-slate-700/80 text-slate-200 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider shrink-0">
                    🎯 HEDEF: {duelTargetScore} PUAN
                  </span>
                </div>

                {/* GAMEPLAY CONTAINER: SIDE-BY-SIDE WITH VERTICAL BASKETBALL TRACK */}
                {activeMode === 'duel2' ? (
                  /* 2 OYUNCU MODU: 1. OYUNCU (SOL) - DİKEY BASKETBOL PARKURU (ORTA) - 2. OYUNCU (SAĞ) */
                  <div className="flex-1 flex flex-row items-stretch justify-between gap-2 sm:gap-4 w-full min-h-0 overflow-hidden">
                    {/* 1. GRUP */}
                    <div className="flex-1 flex items-center justify-start h-full min-h-0 min-w-0">
                      {renderDuelPlayerCard(duelPlayers[0], 0)}
                    </div>

                    {/* DİKEY BASKETBOL PARKURU (TAM ORTADA) */}
                    <div className="h-full flex items-center justify-center shrink-0 px-1">
                      {(() => {
                        const winCfg = getWinnerVideoConfig(duelWinnerIndex);
                        return (
                          <BasketballRaceTrack
                            players={duelPlayers}
                            playerCountMode={2}
                            targetScore={duelTargetScore}
                            orientation="vertical"
                            showVictoryVideo={trackVictoryVideoActive}
                            victoryVideoSrc={winCfg.videoSrc}
                            winnerTitle={winCfg.title}
                            winnerImg={winCfg.img}
                            winnerBadgeBg={winCfg.badgeBg}
                            winnerBorderColor={winCfg.borderColor}
                            winnerGlowColor={winCfg.glowColor}
                            onVictoryVideoEnd={() => {
                              setTrackVictoryVideoActive(false);
                              setIsDuelFinished(true);
                            }}
                            soundEnabled={soundEnabled}
                          />
                        );
                      })()}
                    </div>

                    {/* 2. GRUP */}
                    <div className="flex-1 flex items-center justify-end h-full min-h-0 min-w-0">
                      {renderDuelPlayerCard(duelPlayers[1], 1)}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-row items-stretch min-h-0 h-full w-full gap-2 sm:gap-2.5 md:gap-3 overflow-hidden">
                    {/* 1. GRUP İSTASYONU (SOLDA: p1.png PARKURU + 1. GRUP KARTI) */}
                    <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-2 sm:gap-2.5 md:gap-3">
                      <div className="h-full flex items-center justify-center shrink-0">
                        <SingleBasketballTrack 
                          playerIndex={0} 
                          score={duelPlayers[0]?.score || 0} 
                          targetScore={duelTargetScore} 
                          isWinner={duelWinnerIndex === 0} 
                        />
                      </div>
                      <div className="flex-1 h-full min-h-0 min-w-0">
                        {renderDuelPlayerCard(duelPlayers[0], 0)}
                      </div>
                    </div>

                    {/* 2. GRUP İSTASYONU (ORTADA: p2.png PARKURU + 2. GRUP KARTI) */}
                    <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-2 sm:gap-2.5 md:gap-3">
                      <div className="h-full flex items-center justify-center shrink-0">
                        <SingleBasketballTrack 
                          playerIndex={1} 
                          score={duelPlayers[1]?.score || 0} 
                          targetScore={duelTargetScore} 
                          isWinner={duelWinnerIndex === 1} 
                        />
                      </div>
                      <div className="flex-1 h-full min-h-0 min-w-0">
                        {renderDuelPlayerCard(duelPlayers[1], 1)}
                      </div>
                    </div>

                    {/* 3. GRUP İSTASYONU (SAĞDA: p3.png PARKURU + 3. GRUP KARTI) */}
                    <div className="flex-1 flex flex-row items-stretch h-full min-h-0 min-w-0 gap-2 sm:gap-2.5 md:gap-3">
                      <div className="h-full flex items-center justify-center shrink-0">
                        <SingleBasketballTrack 
                          playerIndex={2} 
                          score={duelPlayers[2]?.score || 0} 
                          targetScore={duelTargetScore} 
                          isWinner={duelWinnerIndex === 2} 
                        />
                      </div>
                      <div className="flex-1 h-full min-h-0 min-w-0">
                        {renderDuelPlayerCard(duelPlayers[2], 2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 1-PLAYER TEST QUIZ — TAKVİM (GÜNLER-AYLAR) TEK KİŞİLİK TASARIMI & ÖLÇÜLERİ */}
            {activeMode === 'quiz1' && quizQuestion && (
              <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
                {/* MERKEZ: SORU ÇERÇEVESİ (ŞIKLARIN GENİŞLİĞİ KADAR, ŞIKLAR ÇERÇEVENİN İÇİNDE) */}
                <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
                  <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">
                    {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                      {/* LEFT: GROUP BADGE & TOPIC */}
                      <div className="flex items-center gap-1.5 min-w-0 h-full">
                        {assignedStudent ? (
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${assignedStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                            title={`Aktif Öğrenci: ${assignedStudent.name}`}
                          >
                            {assignedStudent.avatar}
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                            1
                          </div>
                        )}
                        <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center min-w-0">
                            <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                              {assignedStudent ? assignedStudent.name : '1. GRUP'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                              • {gameTitle}
                            </span>
                          </div>
                          <img
                            src={isIng ? '/icon_6.webp' : '/icon_5.webp'}
                            alt="Oyun İkonu"
                            className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1"
                          />
                        </div>
                      </div>

                      {/* RIGHT: SCORE, TIMER & LIVES */}
                      <div className="flex items-center gap-1.5 shrink-0 h-full">
                        {/* 100-Second Countdown Timer Capsule */}
                        <div className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                          quizTimeLeft <= 3 
                            ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                            : 'bg-[#080e1d] border-slate-700 text-slate-200'
                        }`}>
                          <span className="text-xs">⏱️</span>
                          <span>{quizTimeLeft}s</span>
                        </div>

                        <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                          <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                            {quizScore} / 10
                          </span>
                          {quizStreak >= 2 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-[11px] uppercase tracking-wider hidden sm:inline-block">
                              🔥 {quizStreak}x
                            </span>
                          )}
                          <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i} className={`text-xs sm:text-sm transition-all ${i < quizLives ? 'text-rose-500 scale-100' : 'text-slate-600 opacity-30 grayscale'}`}>
                                ❤️
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CENTER: ÇİZGİLİ DEFTER SAYFASI SORU ÇERÇEVESİ */}
                    <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                      <div 
                        className="relative flex-1 rounded-2xl sm:rounded-3xl border-3 border-amber-300/90 shadow-[0_16px_50px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.5)] p-2 sm:p-3 flex flex-col items-center justify-center text-center overflow-hidden min-h-0 w-full"
                        style={{
                          backgroundColor: '#fbf9f2',
                          backgroundImage: `
                            /* Kırmızı dikey marjin çizgisi */
                            linear-gradient(to right, transparent 48px, rgba(239, 68, 68, 0.75) 48px, rgba(239, 68, 68, 0.75) 50px, transparent 50px),
                            /* Yatay açık mavi çizgili defter satırları */
                            repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(147, 197, 253, 0.65) 31px, rgba(147, 197, 253, 0.65) 32px),
                            /* Doğal yumuşak defter kağıdı dokusu */
                            linear-gradient(135deg, #fdfcf7 0%, #f7f3e8 50%, #f4eee0 100%)
                          `
                        }}
                      >
                        {/* Sol kenar spiralli defter delikleri */}
                        <div className="absolute left-1 sm:left-1.5 top-0 bottom-0 w-8 flex flex-col justify-around py-3 pointer-events-none z-10 opacity-70">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b] shadow-inner border border-slate-400/50" />
                              <div className="w-2 h-1 bg-gradient-to-r from-slate-400 to-slate-200 rounded-xs shadow-xs -ml-1 transform -rotate-12" />
                            </div>
                          ))}
                        </div>

                        {/* Defter üst başlık çizgisi */}
                        <div className="relative z-10 flex items-center justify-between w-full pl-8 pr-1 shrink-0 pb-0.5 border-b border-sky-300/80">
                          <span className="text-[10px] sm:text-xs font-black text-rose-600/90 uppercase tracking-wider flex items-center gap-1">
                            ✏️ ÇİZGİLİ DEFTER • {isIng ? 'ENGLISH' : gameConcept.toUpperCase()}
                          </span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full min-h-0 max-h-full overflow-hidden px-2 pl-7">
                          <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-widest mb-1">
                            {isIng ? 'BU KELİMENİN TÜRKÇE KARŞILIĞI:' : `BU KELİMENİN ${gameConcept.toUpperCase()} ANLAMLISI:`}
                          </span>

                          <div className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-[0_6px_20px_rgba(245,158,11,0.5)] border-2 border-white flex items-center justify-center gap-2 sm:gap-3 my-0.5 max-w-full">
                            {!isIng && quizQuestion.emoji && (
                              <span className="text-xl sm:text-2xl md:text-3xl filter drop-shadow-md shrink-0">
                                {quizQuestion.emoji}
                              </span>
                            )}
                            {(() => {
                              const word = quizQuestion.word || '';
                              const len = word.length;
                              const wordFontClass = len <= 6
                                ? 'text-2xl sm:text-3xl md:text-4xl'
                                : len <= 10
                                ? 'text-xl sm:text-2xl md:text-3xl'
                                : len <= 14
                                ? 'text-lg sm:text-xl md:text-2xl'
                                : 'text-base sm:text-lg md:text-xl';
                              return (
                                <span className={`${wordFontClass} font-black tracking-wide uppercase text-slate-950 text-center leading-tight break-words max-w-full`}>
                                  {word}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM: ŞIKLAR (ÇERÇEVENİN İÇİNDE, 2x2 GRID) */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full shrink-0 mt-1">
                      {quizQuestion.options.map((opt, oIdx) => {
                        const isSelected = quizSelectedOption === opt;
                        const isCorrect = opt === quizQuestion.correct;
                        const optFontClass = getWordOptionFontSize(quizQuestion.options, 1);

                        let btnClass = "border-2 border-blue-500/35 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/70 active:from-[#0e1726] active:to-[#090f1a] text-blue-50 shadow-md active:shadow-xs";
                        if (quizFeedback !== 'none') {
                          if (isCorrect) {
                            btnClass = "ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 shadow-md text-white";
                          } else if (isSelected) {
                            btnClass = "ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 shadow-md text-white";
                          } else {
                            btnClass = "opacity-35 border-slate-700/60 bg-slate-900/60 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizFeedback !== 'none'}
                            onClick={() => handleQuizAnswer(opt)}
                            className={`fast-quiz-btn relative w-full py-1.5 sm:py-2 px-3 min-h-[38px] sm:min-h-[44px] md:min-h-[50px] max-h-[58px] rounded-2xl border-2 transition-colors duration-75 flex items-center justify-center text-center cursor-pointer uppercase tracking-wider overflow-hidden active:scale-98 ${btnClass}`}
                          >
                            {/* Subtle top glare in button */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                            <AutoFitOptionContent
                              opt={opt}
                              displayOpt={opt}
                              mode={1}
                              fallbackFontClass={optFontClass}
                            />
                            {quizFeedback !== 'none' && isCorrect && (
                              <CheckCircle2 size={18} className="absolute right-2.5 text-emerald-300 shrink-0 filter drop-shadow-md z-20" />
                            )}
                            {quizFeedback !== 'none' && isSelected && !isCorrect && (
                              <XCircle size={18} className="absolute right-2.5 text-rose-300 shrink-0 filter drop-shadow-md z-20" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MATCHING / MEMORY CARDS */}
            {activeMode === 'matching' && (
              <div className="flex-1 flex flex-col items-center justify-between w-full max-w-5xl lg:max-w-6xl mx-auto py-1 px-2 sm:px-4">
                {/* STATS */}
                <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-2xl bg-black/50 border border-amber-400/40 text-white shrink-0 mb-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Eşleşen: {matchedPairsCount} / {matchDifficulty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                    <RotateCcw size={16} className="text-cyan-400" />
                    <span>Hamle: {matchMoves}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                    <Clock size={16} className="text-emerald-400" />
                    <span>Süre: {matchTimer}s</span>
                  </div>
                </div>

                {/* 4x4 or 3x4 CARDS GRID */}
                <div className={`flex-1 grid ${isIng ? 'grid-cols-4 grid-rows-4' : 'grid-cols-3 sm:grid-cols-4'} gap-2 sm:gap-3 w-full min-h-0 items-center justify-center`}>
                  {cards.map(card => {
                    const isFlipped = card.isFlipped || card.isMatched;
                    return (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`relative ${isIng ? 'aspect-square sm:aspect-[4/3] min-h-[56px] sm:min-h-[72px] md:min-h-[82px]' : 'aspect-[4/3] min-h-[60px] sm:min-h-[76px]'} rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all transform cursor-pointer flex flex-col items-center justify-center p-1.5 sm:p-2 text-center shadow-lg ${
                          card.isMatched
                            ? 'bg-emerald-600/90 border-emerald-300 text-white opacity-85 scale-95'
                            : isFlipped
                            ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border-white text-slate-950 scale-102 shadow-amber-400/50'
                            : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-indigo-400/60 hover:border-amber-300 hover:scale-102 text-white'
                        }`}
                      >
                        {isFlipped ? (
                          <div className="flex flex-col items-center justify-center gap-0.5 max-w-full px-1 overflow-hidden">
                            {!isIng && card.emoji && (
                              <span className="text-sm sm:text-base md:text-lg shrink-0 filter drop-shadow-sm">
                                {card.emoji}
                              </span>
                            )}
                            {(() => {
                              const t = card.text || '';
                              const len = t.length;
                              const fontClass = len <= 6 
                                ? 'text-xs sm:text-sm md:text-base' 
                                : len <= 10 
                                ? 'text-[11px] sm:text-xs md:text-sm' 
                                : 'text-[10px] sm:text-[11px] md:text-xs';
                              return (
                                <span className={`font-black ${fontClass} uppercase tracking-wide leading-tight text-center break-words max-w-full`}>
                                  {t}
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-xl sm:text-2xl md:text-3xl filter drop-shadow-md">❓</span>
                            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-indigo-200/70 uppercase mt-0.5">
                              KART
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {/* EN ALTA YASLANMIŞ ÖĞRENCİ LİSTESİ DOCKU - TÜM MODLARDA (1, 2 VE 3 KİŞİLİK) EN ALTTA TEK SIRA */}
      {!showCompletionScreen && students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={activeMode === 'duel3' ? 3 : activeMode === 'duel2' ? 2 : 1}
            selectedStudentIds={(activeMode === 'duel2' || activeMode === 'duel3') ? effectiveSelectedStudentIds : [selectedStudentId || null]}
            onSelectStudentForPlayer={(pIdx, studentId) => {
              if (activeMode === 'duel2' || activeMode === 'duel3') {
                if (onSelectStudentForPlayer) {
                  onSelectStudentForPlayer(pIdx, studentId);
                }
                setSelectedStudentIds(prev => {
                  const updated = [...prev];
                  updated[pIdx] = studentId;
                  return updated;
                });
              } else {
                onSelectStudent?.(studentId);
                onSelectStudentForPlayer?.(0, studentId);
                setSelectedStudentIds(prev => {
                  const updated = [...prev];
                  updated[0] = studentId;
                  return updated;
                });
              }
              playSound('click');
            }}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}
    </div>
  );
};