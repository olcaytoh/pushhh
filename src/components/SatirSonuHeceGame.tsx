import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  BookOpen, Sparkles
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { AutoFitOptionContent } from './AutoFitOptionContent';

export interface SatirSonuQuestion {
  id: string;
  title: string;
  ruleCategory: 'tek_harf' | 'heceleme' | 'bilesik_kelime' | 'kesme_isareti';
  ruleCategoryLabel: string;
  word: string;
  question: string;
  line1: string; // Satır sonunda kalan kısım
  line2: string; // Alt satıra geçen kısım
  options: string[];
  correctAnswer: string;
  explanation: string;
  isCorrectSplit: boolean;
}

export const SATIR_SONU_QUESTIONS: SatirSonuQuestion[] = [
  {
    id: 'ssh-1',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'uçurtma',
    question: 'Aşağıdaki satır sonu bölmelerinden hangisi DOĞRUDUR?',
    line1: 'uçur-',
    line2: 'tma',
    options: ['uçur- / tma', 'u- / çurtma', 'uç- / urtma', 'uçurtm- / a'],
    correctAnswer: 'uçur- / tma',
    explanation: 'Satır sonunda veya başında tek harf bırakılamaz! Bu yüzden "u- / çurtma" yanlıştır, "uçur- / tma" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-2',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'araba',
    question: 'Hangisi satır sonunda YANLIŞ bölünmüştür?',
    line1: 'a-',
    line2: 'raba',
    options: ['a- / raba', 'ara- / ba', 'ar- / aba', 'araba- / lar'],
    correctAnswer: 'a- / raba',
    explanation: '"a- / raba" yanlıştır! Çünkü satır sonunda tek bir harf (a-) asla tek başına bırakılamaz.',
    isCorrectSplit: false
  },
  {
    id: 'ssh-3',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'ilkokul',
    question: '"İlkokul" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ilko-',
    line2: 'kul',
    options: ['ilko- / kul', 'ilk- / okul', 'i- / lkokul', 'ilkok- / ul'],
    correctAnswer: 'ilko- / kul',
    explanation: 'Bileşik kelimeler hecelenirken ulama yapılır: il-ko-kul. Bu nedenle "ilko- / kul" doğrudur, "ilk- / okul" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-4',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'bilgisayar',
    question: 'Hangisi satır sonuna DOĞRU hecelenerek sığdırılmıştır?',
    line1: 'bilgi-',
    line2: 'sayar',
    options: ['bilgi- / sayar', 'bi- / lgisayar', 'bilgis- / ayar', 'bil- / g-isayar'],
    correctAnswer: 'bilgi- / sayar',
    explanation: 'Sözcük bil-gi-sa-yar şeklinde hecelenir. Hecenin ortasından "bi- / lgisayar" diye bölünemez.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-5',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'başöğretmen',
    question: '"Başöğretmen" sözcüğü satır sonunda nasıl bölünmelidir?',
    line1: 'ba-',
    line2: 'şöğretmen',
    options: ['ba- / şöğretmen', 'baş- / öğretmen', 'başö- / ğretmen', 'b- / aşöğretmen'],
    correctAnswer: 'ba- / şöğretmen',
    explanation: 'Bileşik sözcükler ba-şöğ-ret-men şeklinde hecelenir! "baş- / öğretmen" heceleme yanlışıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-6',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'öğrenci',
    question: '"Ö- / ğrenci" ayrımı neden YANLIŞTIR?',
    line1: 'ö-',
    line2: 'ğrenci',
    options: [
      'Satır sonunda tek harf bırakılamaz',
      'Kelime yanlış yazılmıştır',
      'Kısa çizgi konulmaz',
      'Ö harfi büyük olmalıdır'
    ],
    correctAnswer: 'Satır sonunda tek harf bırakılamaz',
    explanation: 'Türkçede satır sonunda tek başına sesli ya da sessiz tek bir harf bırakılamaz! Doğrusu "öğ- / renci"dir.',
    isCorrectSplit: false
  },
  {
    id: 'ssh-7',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'pencere',
    question: 'Hangisi satır sonunda DOĞRU ayrılmıştır?',
    line1: 'pen-',
    line2: 'cere',
    options: ['pen- / cere', 'p- / encere', 'penc- / ere', 'pencer- / e'],
    correctAnswer: 'pen- / cere',
    explanation: '"pen-cere" doğru heceden bölünmüştür. Hem tek harf kuralına hem de hece yapısına tam uygundur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-8',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'sandalye',
    question: 'Hangisi satır sonunda YANLIŞ bölünmüştür?',
    line1: 'sa-',
    line2: 'ndalye',
    options: ['sa- / ndalye', 'san- / dalye', 'sandal- / ye', 'san- / dal-ye'],
    correctAnswer: 'sa- / ndalye',
    explanation: '"sa- / ndalye" yanlıştır! Çünkü "nd" aynı hecede kalamaz, sözcük san-dal-ye şeklinde ayrılır.',
    isCorrectSplit: false
  },
  {
    id: 'ssh-9',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'hanımeli',
    question: '"Hanımeli" çiçeğinin satır sonu doğru ayrımı hangisidir?',
    line1: 'hanı-',
    line2: 'meli',
    options: ['hanı- / meli', 'hanım- / eli', 'h- / anımeli', 'hanımel- / i'],
    correctAnswer: 'hanı- / meli',
    explanation: 'Bileşik kelime ha-nı-me-li olarak hecelenir. Bu yüzden "hanı- / meli" doğrudur, "hanım- / eli" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-10',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Ankara'ya",
    question: 'Özel isimlerde satır sonuna kesme işareti gelirse ne yapılır?',
    line1: "Ankara'",
    line2: 'ya',
    options: [
      "Yalnızca kesme işareti konur (kısa çizgi konmaz)",
      "Hem kesme hem kısa çizgi konur",
      "Hiçbir işaret konmaz",
      "Kelime bölünemez"
    ],
    correctAnswer: "Yalnızca kesme işareti konur (kısa çizgi konmaz)",
    explanation: "Özel isimler satır sonuna geldiğinde kesme işareti (') yeterlidir; ayrıca kısa çizgi (-) konulmaz!",
    isCorrectSplit: true
  },
  {
    id: 'ssh-11',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'elma',
    question: '"Elma" sözcüğü satır sonunda nasıl ayrılmalıdır?',
    line1: 'el-',
    line2: 'ma',
    options: ['el- / ma', 'e- / lma', 'elm- / a', 'elma- / s'],
    correctAnswer: 'el- / ma',
    explanation: '"e- / lma" ve "elm- / a" yanlıştır çünkü satır başında veya sonunda tek harf kalamaz! "el- / ma" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-12',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'türkçe',
    question: '"Türkçe" sözcüğü satır sonunda nasıl bölünür?',
    line1: 'türk-',
    line2: 'çe',
    options: ['türk- / çe', 'tür- / kçe', 't- / ürkçe', 'türkç- / e'],
    correctAnswer: 'türk- / çe',
    explanation: 'Sözcük türk-çe olarak hecelenir. Bu yüzden "türk- / çe" doğrudur.',
    isCorrectSplit: true
  }
];

function getRandomSatirSonuQuestions(count = 8): SatirSonuQuestion[] {
  const shuffled = [...SATIR_SONU_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'rose' | 'blue' | 'emerald';
  score: number;
  questionIndex: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export interface SatirSonuHeceGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (studentId: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
  onGameCompleted?: (winnerIndex: number | null, pCount: number) => void;
}

export const SatirSonuHeceGame: React.FC<SatirSonuHeceGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  playerCountMode = 1,
  onSwitchPlayerCountMode,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [questions, setQuestions] = useState<SatirSonuQuestion[]>(() => getRandomSatirSonuQuestions(8));

  // 100 Saniye Geri Sayım Sayacı (1, 2 VE 3 KİŞİLİK OYUNLARIN HEPSİNDE KESİNTİSİZ GERİ SAYAR)
  const [timeLeft, setTimeLeft] = useState<number>(100);

  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      try {
        playMp3(src);
      } catch (err) {
        console.error(err);
      }
    }
  }, [soundEnabled, playMp3]);

  // Student selection state
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    selectedStudentIds?.[1] || null,
    selectedStudentIds?.[2] || null
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([
        selectedStudentIds[0] || null,
        selectedStudentIds[1] || null,
        selectedStudentIds[2] || null
      ]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds(prev => [selectedStudentId, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      return selectedStudentIds;
    }
    return internalSelectedIds;
  }, [selectedStudentIds, internalSelectedIds]);

  const handleSelectStudentForPlayer = (pIdx: number, studentId: string | null) => {
    setInternalSelectedIds(prev => {
      const updated = [...prev];
      updated[pIdx] = studentId;
      return updated;
    });
    if (onSelectStudentForPlayer) {
      onSelectStudentForPlayer(pIdx, studentId);
    } else if (pIdx === 0 && onSelectStudent) {
      onSelectStudent(studentId);
    }
    triggerSound('/op.mp3');
  };

  const createInitialPlayers = useCallback((count: number): PlayerState[] => {
    const list: PlayerState[] = [];
    const colors: ('rose' | 'blue' | 'emerald')[] = ['rose', 'blue', 'emerald'];
    const names = ['1. Öğrenci', '2. Öğrenci', '3. Öğrenci'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Türkçe Ustası' : names[i],
        colorName: colors[i],
        score: 0,
        questionIndex: 0,
        selectedOption: null,
        isCorrect: null,
        showFeedback: false
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setTimeLeft(100);
  }, [playerMode, createInitialPlayers]);

  // 100 Saniye Geri Sayım Zamanlayıcısı: 1, 2 VE 3 KİŞİLİK TÜM MODLARDA AKTİFTİR!
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      triggerSound('/hata.mp3');
      setGameOver(true);
      // Kazananı en yüksek puana göre belirle
      let bestIdx = 0;
      let maxScore = -1;
      players.forEach((p, idx) => {
        if (p.score > maxScore) {
          maxScore = p.score;
          bestIdx = idx;
        }
      });
      setRoundWinner(bestIdx);
      triggerSound('/para.mp3');
      return;
    }

    if (timeLeft <= 3 && timeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft, players, playMp3, triggerSound]);

  const handleSwitchMode = (mode: PlayerMode) => {
    setPlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    triggerSound('/op.mp3');
  };

  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setQuestions(getRandomSatirSonuQuestions(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setTimeLeft(100);
  };

  const handleOptionClick = (playerIndex: number, optionText: string) => {
    const player = players[playerIndex];
    if (!player || player.showFeedback || gameOver) return;

    const currentQ = questions[player.questionIndex % questions.length];
    const isRight = optionText === currentQ.correctAnswer;

    if (isRight) {
      triggerSound('/coin.mp3');
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      triggerSound('/hata.mp3');
    }

    if (onQuestionAnswered) {
      onQuestionAnswered(isRight);
    }

    setPlayers(prev =>
      prev.map((p, idx) => {
        if (idx !== playerIndex) return p;
        return {
          ...p,
          selectedOption: optionText,
          isCorrect: isRight,
          score: isRight ? p.score + 10 : p.score,
          showFeedback: true
        };
      })
    );

    // 1.3 saniye sonra sonraki soruya geç
    setTimeout(() => {
      setPlayers(prev => {
        const nextList = prev.map((p, idx) => {
          if (idx !== playerIndex) return p;
          const nextQIdx = p.questionIndex + 1;
          return {
            ...p,
            questionIndex: nextQIdx,
            selectedOption: null,
            isCorrect: null,
            showFeedback: false
          };
        });

        // Tüm oyuncular 5 soru tamamladı mı kontrolü
        const allCompleted = nextList.every(p => p.questionIndex >= 5);
        if (allCompleted) {
          setGameOver(true);
          let bestIdx = 0;
          let maxScore = -1;
          nextList.forEach((p, i) => {
            if (p.score > maxScore) {
              maxScore = p.score;
              bestIdx = i;
            }
          });
          setRoundWinner(bestIdx);
          triggerSound('/para.mp3');
          if (onGameCompleted) {
            onGameCompleted(bestIdx, playerMode);
          }
          try {
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
          } catch {}
        }

        return nextList;
      });
    }, 1300);
  };

  const winnerPlayer = useMemo(() => {
    if (roundWinner === null) return null;
    return players[roundWinner] || players[0];
  }, [roundWinner, players]);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      {/* 1. STANDART ESKİ ARKA PLAN GÖRSELİ (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none select-none filter brightness-95" 
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Main Game Arena */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = questions[sPlayer.questionIndex % questions.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              <div className="flex-1 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-[#0b1328] border-2 border-cyan-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(6,182,212,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    <div className="flex items-center gap-1.5 min-w-0 h-full">
                      {sStudent ? (
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${sStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                          title={`Aktif Öğrenci: ${sStudent.name}`}
                        >
                          {sStudent.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] border-l-4 border-l-cyan-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-cyan-200 uppercase tracking-wide truncate">
                            {sStudent ? sStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • Satır Sonu Hece Ayırma
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_35.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      {/* 100-Saniye Geri Sayım Sayacı */}
                      <div className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                        timeLeft <= 5 
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                          : 'bg-[#080e1d] border-slate-700 text-slate-200'
                      }`}>
                        <span className="text-xs">⏱️</span>
                        <span>{timeLeft}s</span>
                      </div>

                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.questionIndex + 1}/5
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: ÇİZGİLİ DEFTER SAYFASI SORU ÇERÇEVESİ */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <div 
                      className="relative flex-1 rounded-2xl sm:rounded-3xl border-3 border-amber-300/90 shadow-[0_16px_50px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.5)] p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden min-h-0 w-full gap-1.5 sm:gap-2"
                      style={{
                        backgroundColor: '#fbf9f2',
                        backgroundImage: `
                          /* Kırmızı dikey marjin çizgisi */
                          linear-gradient(to right, transparent 52px, rgba(239, 68, 68, 0.75) 52px, rgba(239, 68, 68, 0.75) 54px, transparent 54px),
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
                      <div className="relative z-10 flex items-center justify-between w-full pl-8 pr-1 shrink-0 pb-1 border-b border-sky-300/80">
                        <span className="text-[10px] sm:text-xs font-black text-rose-600/90 uppercase tracking-wider flex items-center gap-1">
                          ✏️ TÜRKÇE DEFTERİ • SATIR SONU HECE BÖLÜNMESİ
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 font-mono">
                          Kelime: {sPlayer.questionIndex + 1}/10
                        </span>
                      </div>

                      {/* İNTERAKTİF ÇİZGİLİ DEFTER SATIR SONU MODELİ & SORU ÇERÇEVESİ */}
                      <div className="relative z-10 ml-6 sm:ml-7 text-slate-900 bg-white/90 border-2 border-amber-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 shrink shadow-md overflow-hidden">
                        {/* Kırmızı dikey marjin çizgisi ve etiket */}
                        <div className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>✏️</span> Defter Satırı ({currentQ.word}):
                          </span>
                          <span className="text-[9px] text-rose-600 font-bold tracking-tight">
                            Satır Sonu Kırmızı Çizgisi |
                          </span>
                        </div>
                        {/* 1. Satır: Satır sonu hecesi ve kısa çizgi */}
                        <div className="flex items-center justify-between border-b-2 border-sky-300 py-1.5 px-2 font-mono font-black text-base sm:text-xl md:text-2xl tracking-wider text-slate-900">
                          <span className="text-slate-600 font-sans text-xs sm:text-sm font-bold">... deftere yazarken:</span>
                          <span className="bg-amber-100 px-2.5 py-0.5 rounded-lg border-2 border-amber-400 text-slate-950 shadow-xs">
                            {currentQ.line1}
                          </span>
                        </div>
                        {/* 2. Satır: Alt satıra geçen hece */}
                        <div className="flex items-center justify-start border-b-2 border-sky-300 py-1.5 px-2 font-mono font-black text-base sm:text-xl md:text-2xl tracking-wider text-slate-900">
                          <span className="bg-sky-100 px-2.5 py-0.5 rounded-lg border-2 border-sky-400 text-slate-950 shadow-xs">
                            {currentQ.line2}
                          </span>
                        </div>
                      </div>

                      {/* Soru Rozeti & Soru Cümlesi */}
                      <div className="relative z-10 ml-6 sm:ml-7 flex flex-col items-center justify-center shrink-0 py-1.5 sm:py-2 px-3 bg-gradient-to-r from-sky-500/20 via-cyan-400/25 to-sky-500/20 border-2 border-sky-400 rounded-xl sm:rounded-2xl text-center shadow-xs">
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white font-black text-[10.5px] sm:text-xs uppercase shadow-xs shrink-0 mb-1">
                          {currentQ.ruleCategoryLabel} • SORU
                        </span>
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-900 leading-snug">
                          {currentQ.question}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: ŞIKLAR (2x2 GRID) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full shrink-0 mt-1">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = sPlayer.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = "border-2 border-cyan-500/35 bg-gradient-to-b from-[#102334] via-[#0c1c2b] to-[#07131e] hover:from-[#142e44] hover:via-[#0f2437] hover:to-[#0a1b28] hover:border-cyan-400/70 text-cyan-50 shadow-md";

                      if (sPlayer.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 text-white shadow-md scale-102';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 text-white shadow-md';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={sPlayer.showFeedback}
                          onClick={() => handleOptionClick(0, opt)}
                          className={`fast-quiz-btn relative flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 min-h-[42px] sm:min-h-[48px] md:min-h-[54px] max-h-[58px] rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-98 shadow-md ${btnStyle}`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-cyan-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                          <div className="flex items-center gap-2 min-w-0 flex-1 h-full">
                            <span className="w-6 h-6 rounded-lg bg-black/45 flex items-center justify-center font-black text-xs shrink-0 border border-white/20 text-cyan-300">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <span className="relative text-xs sm:text-sm md:text-base font-bold truncate max-w-full text-left">
                              {opt}
                            </span>
                          </div>
                          {sPlayer.showFeedback && isRight && (
                            <CheckCircle2 size={18} className="text-emerald-300 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })() : (
        /* 2 VE 3 KİŞİLİK YARIŞMA ARENASI */
        <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
          {/* ÜST ORTAK GERİ SAYIM SAYACI (2 VE 3 KİŞİLİKTE ÇOK BELİRGİN SÜRE) */}
          <div className="w-full flex items-center justify-between bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-1.5 mb-1.5 shrink-0">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-cyan-300 uppercase tracking-wider">
              <span>⚔️ {playerMode} KİŞİLİK SATIR SONU KAPIŞMASI</span>
            </div>
            <div className={`border rounded-xl px-3 py-0.5 flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm shrink-0 transition-all ${
              timeLeft <= 5 
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                : 'bg-[#080e1d] border-cyan-500/60 text-cyan-200'
            }`}>
              <span>⏱️ KALAN SÜRE:</span>
              <span className="text-amber-300">{timeLeft}s</span>
            </div>
          </div>

          <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${
            playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
          } min-h-0 items-stretch`}>
            {players.map((player, pIdx) => {
              const currentQ = questions[player.questionIndex % questions.length];
              const pStudent = effectiveSelectedStudentIds[pIdx]
                ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
                : null;
              const displayName = pStudent ? pStudent.name : player.name;

              const cardBorder = player.colorName === 'rose'
                ? 'border-rose-500/80 bg-[#250d18]/90'
                : player.colorName === 'blue'
                ? 'border-sky-500/80 bg-[#0d1c31]/90'
                : 'border-emerald-500/80 bg-[#0b2419]/90';

              return (
                <div
                  key={player.id}
                  className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-2.5 flex flex-col justify-between shadow-xl backdrop-blur-sm min-h-0 overflow-hidden`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1 shrink-0 h-7 sm:h-8">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm sm:text-base shrink-0">
                        {player.colorName === 'rose' ? '🔴' : player.colorName === 'blue' ? '🔵' : '🟢'}
                      </span>
                      <span className="font-black text-xs sm:text-sm text-slate-100 truncate">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                        Soru: {player.questionIndex + 1}/5
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                        {player.score} P
                      </span>
                    </div>
                  </div>

                  {/* Defter Modeli & Soru Alanı */}
                  <div className="flex-1 min-h-0 flex flex-col justify-between my-0.5 gap-1 overflow-hidden">
                    <div 
                      className="text-slate-900 border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 shrink shadow-sm overflow-hidden text-center relative"
                      style={{
                        backgroundColor: '#fbf9f2',
                        backgroundImage: `
                          linear-gradient(to right, transparent calc(100% - 40px), rgba(239, 68, 68, 0.7) calc(100% - 40px), rgba(239, 68, 68, 0.7) calc(100% - 38px), transparent calc(100% - 38px)),
                          repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, rgba(147, 197, 253, 0.6) 23px, rgba(147, 197, 253, 0.6) 24px),
                          linear-gradient(135deg, #fdfcf7 0%, #f7f3e8 50%, #f4eee0 100%)
                        `
                      }}
                    >
                      <div className="text-[9.5px] font-bold text-slate-500 uppercase">
                        Defter Satırı ({currentQ.word}):
                      </div>
                      <div className="font-mono font-black text-xs sm:text-sm md:text-base text-slate-900 flex justify-between px-1">
                        <span>...</span>
                        <span className="bg-amber-200/90 px-1.5 rounded">{currentQ.line1}</span>
                      </div>
                      <div className="font-mono font-black text-xs sm:text-sm md:text-base text-slate-900 text-left px-1">
                        <span className="bg-sky-200/90 px-1.5 rounded">{currentQ.line2}</span>
                      </div>
                    </div>

                    <div className="shrink-0 bg-gradient-to-r from-cyan-500/20 via-sky-400/25 to-cyan-500/20 border border-cyan-400/60 rounded-xl px-2 py-1 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="px-2 py-0.2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 text-slate-950 font-black text-[9.5px] sm:text-[10.5px] uppercase shadow-xs mb-0.5 shrink-0">
                        {currentQ.ruleCategoryLabel}
                      </span>
                      <h3 className="text-xs sm:text-sm md:text-base font-black text-cyan-200 leading-tight px-1 drop-shadow-sm line-clamp-2">
                        {currentQ.question}
                      </h3>
                    </div>
                  </div>

                  {/* Şıklar */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto mb-0.5 w-full shrink-0">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = player.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = 'bg-slate-800/95 hover:bg-slate-700 text-slate-100 border-slate-600/90';

                      if (player.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 text-white shadow-md';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 text-white shadow-md';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={player.showFeedback}
                          onClick={() => handleOptionClick(pIdx, opt)}
                          className={`w-full rounded-xl sm:rounded-2xl border-2 font-bold transition-all text-left flex items-center justify-between cursor-pointer active:scale-98 shadow-sm py-1 sm:py-1.5 px-2 min-h-[38px] sm:min-h-[44px] md:min-h-[48px] max-h-[52px] overflow-hidden ${btnStyle}`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 h-full">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-black/45 flex items-center justify-center font-black shrink-0 border border-white/20 text-[10px] sm:text-xs text-cyan-300">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <div className="flex-1 min-w-0 h-full">
                              <AutoFitOptionContent opt={opt} displayOpt={opt} mode={playerMode as 1 | 2 | 3} />
                            </div>
                          </div>
                          {player.showFeedback && isRight && <span className="text-white shrink-0 font-black text-xs sm:text-sm ml-1">✓</span>}
                          {player.showFeedback && isChosen && !isRight && <span className="text-white shrink-0 font-black text-xs sm:text-sm ml-1">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Didaktik Açıklama */}
                  {player.showFeedback && (
                    <div className="mt-1 p-1 rounded-lg bg-black/50 border border-white/10 text-[10px] sm:text-xs text-cyan-200 text-center animate-fade-in shrink-0">
                      <span className="line-clamp-2">{currentQ.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </main>

      {/* Student Avatar Dock (Single Row) */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={effectiveSelectedStudentIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* Victory Celebration Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#102438] to-[#071320] border-2 border-cyan-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              ✏️
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase">
              Tebrikler Satır Sonu Ustası!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Kısa çizgi ve hece kurallarını eksiksiz uygulayarak tüm soruları tamamladın!
            </p>

            {/* Scores summary */}
            <div className="w-full flex items-center justify-center gap-2 py-2">
              {players.map((p, idx) => {
                const st = effectiveSelectedStudentIds[idx]
                  ? students?.find(s => s.id === effectiveSelectedStudentIds[idx])
                  : null;
                return (
                  <div key={p.id} className="flex-1 bg-black/40 border border-white/15 rounded-xl p-2">
                    <span className="text-[11px] block font-bold text-slate-300 truncate">
                      {st ? st.name : p.name}
                    </span>
                    <span className="text-base font-black text-cyan-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} /> Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
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
