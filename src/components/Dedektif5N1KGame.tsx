import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, ChevronRight, AlertCircle, ShieldCheck, HelpCircle, BookOpen
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { TurkishActivityBackground } from './TurkishActivityBackground';
import { AutoFitOptionContent } from './AutoFitOptionContent';

export interface Dedektif5N1KStory {
  id: string;
  title: string;
  story: string;
  question: string;
  qType: 'kim' | 'ne' | 'nerede' | 'ne_zaman' | 'nasil' | 'neden';
  qTypeLabel: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  emoji: string;
}

export const STORIES_5N1K: Dedektif5N1KStory[] = [
  {
    id: '5n1k-1',
    title: 'Yağmurlu Günün Sürprizi',
    story: 'Ali, dün yağmurlu bir sonbahar günü okul yolunda ıslanan minik bir kedi yavrusu gördü. Onu montunun içine sararak sevgiyle evine götürdü. Çünkü kedi çok üşüyordu.',
    question: 'Ali minik kedi yavrusunu nerede gördü?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Okul yolunda', 'Parkta', 'Bahçede', 'Kütüphanede'],
    correctAnswer: 'Okul yolunda',
    explanation: 'Metne göre Ali, kedi yavrusunu "okul yolunda" görmüştür.',
    emoji: '🐱'
  },
  {
    id: '5n1k-2',
    title: 'Yağmurlu Günün Sürprizi',
    story: 'Ali, dün yağmurlu bir sonbahar günü okul yolunda ıslanan minik bir kedi yavrusu gördü. Onu montunun içine sararak sevgiyle evine götürdü. Çünkü kedi çok üşüyordu.',
    question: 'Ali kediyi niçin (neden) evine götürdü?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Çok üşüdüğü için', 'Sütü bittiği için', 'Oyun oynamak için', 'Annesi istediği için'],
    correctAnswer: 'Çok üşüdüğü için',
    explanation: 'Metinde Ali kediyi "çok üşüdüğü için" evine götürmüştür.',
    emoji: '🌧️'
  },
  {
    id: '5n1k-3',
    title: 'Kütüphane Kaşifi',
    story: 'Zeynep, pazar günü sabah erkenden mahalle kütüphanesine gitti. Fen bilgisi projesi için uzay ve gezegenler hakkında sessizce kitap okudu.',
    question: 'Zeynep kütüphaneye ne zaman gitti?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Pazar günü sabah erkenden', 'Cuma akşamı', 'Pazartesi öğlen', 'Salı sabahı'],
    correctAnswer: 'Pazar günü sabah erkenden',
    explanation: 'Zeynep kütüphaneye pazar günü sabah erkenden gitmiştir.',
    emoji: '🚀'
  },
  {
    id: '5n1k-4',
    title: 'Kütüphane Kaşifi',
    story: 'Zeynep, pazar günü sabah erkenden mahalle kütüphanesine gitti. Fen bilgisi projesi için uzay ve gezegenler hakkında sessizce kitap okudu.',
    question: 'Kitapları sessizce okuyan kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Zeynep', 'Ali', 'Öğretmen', 'Kütüphaneci'],
    correctAnswer: 'Zeynep',
    explanation: 'İşi yapan kişi Zeynep\'tir.',
    emoji: '📚'
  },
  {
    id: '5n1k-5',
    title: 'Fidan Dikme Şenliği',
    story: 'Can ile dedesi, ilkbahar sabahı köyün tepesinde neşeyle çam fidanı dikti. Doğayı korumak ve yeşillendirmek istiyorlardı.',
    question: 'Can ile dedesi tepeye ne diktiler?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Çam fidanı', 'Çiçek tohumu', 'Elma ağacı', 'Gül fidesi'],
    correctAnswer: 'Çam fidanı',
    explanation: 'Metne göre tepeye çam fidanı dikilmiştir.',
    emoji: '🌲'
  },
  {
    id: '5n1k-6',
    title: 'Fidan Dikme Şenliği',
    story: 'Can ile dedesi, ilkbahar sabahı köyün tepesinde neşeyle çam fidanı dikti. Doğayı korumak ve yeşillendirmek istiyorlardı.',
    question: 'Can ile dedesi fidanı nasıl diktiler?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Neşeyle', 'Yavaşça', 'Üzgünce', 'Aceleyle'],
    correctAnswer: 'Neşeyle',
    explanation: 'Metinde fidanı "neşeyle" diktikleri belirtilmiştir.',
    emoji: '🌱'
  },
  {
    id: '5n1k-7',
    title: 'Uçurtma Yarışı',
    story: 'Mehmet, rüzgarlı bir cumartesi öğleden sonra sahil kenarında kırmızı uçurtmasını gökyüzüne uçurdu. Uçurtma gökyüzünde bir kuş gibi süzülüyordu.',
    question: 'Mehmet uçurtmasını nerede uçurdu?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Sahil kenarında', 'Okul bahçesinde', 'Evin terasında', 'Ormanlık alanda'],
    correctAnswer: 'Sahil kenarında',
    explanation: 'Mehmet uçurtmasını sahil kenarında uçurmuştur.',
    emoji: '🪁'
  },
  {
    id: '5n1k-8',
    title: 'Pasta Ustası Elif',
    story: 'Elif, annesinin doğum günü için mutfakta özenle çilekli bir pasta hazırladı. Çünkü annesine güzel bir sürpriz yapmak istiyordu.',
    question: 'Elif mutfakta ne hazırladı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Çilekli bir pasta', 'Elmalı turta', 'Çikolatalı kurabiye', 'Meyve salatası'],
    correctAnswer: 'Çilekli bir pasta',
    explanation: 'Elif çilekli bir pasta hazırlamıştır.',
    emoji: '🎂'
  },
  {
    id: '5n1k-9',
    title: 'Bisiklet Turu',
    story: 'Burak ve arkadaşları, dün akşamüstü parkın bisiklet yolunda kasklarını takarak dikkatlice pedal çevirdiler.',
    question: 'Burak ve arkadaşları bisikleti nasıl sürdüler?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Dikkatlice', 'Hızlıca', 'Korkarak', 'Gözlerini kapatarak'],
    correctAnswer: 'Dikkatlice',
    explanation: 'Metne göre "kasklarını takarak dikkatlice" pedal çevirmişlerdir.',
    emoji: '🚲'
  },
  {
    id: '5n1k-10',
    title: 'Resim Sergisi',
    story: 'Selin, 23 Nisan günü okulun konferans salonunda rengarenk boyalarla çizdiği Atatürk ve çocuk resimlerini gururla sergiledi.',
    question: 'Resimleri gururla sergileyen kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Selin', 'Öğretmen', 'Müdür', 'Can'],
    correctAnswer: 'Selin',
    explanation: 'Resimleri sergileyen öğrenci Selin\'dir.',
    emoji: '🎨'
  }
];

export const getRandom5N1KQuestions = (count: number = 8): Dedektif5N1KStory[] => {
  const shuffled = [...STORIES_5N1K].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface Dedektif5N1KGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'blue' | 'rose' | 'emerald';
  score: number;
  questionIndex: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const Dedektif5N1KGame: React.FC<Dedektif5N1KGameProps> = ({
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

  const [questions, setQuestions] = useState<Dedektif5N1KStory[]>(() => getRandom5N1KQuestions(8));

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
    const names = ['1. Dedektif', '2. Dedektif', '3. Dedektif'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? '5N 1K Dedektifi' : names[i],
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
  const [singleTimeLeft, setSingleTimeLeft] = useState<number>(100);

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
  }, [playerMode, createInitialPlayers]);

  // 100-Saniye Tek Kişilik Geri Sayım Sayacı
  useEffect(() => {
    if (playerMode !== 1 || gameOver) return;
    const p = players[0];
    if (!p || p.showFeedback) return;

    if (singleTimeLeft <= 0) {
      triggerSound('/hata.mp3');
      setSingleTimeLeft(100);
      setPlayers(prev => {
        const next = [...prev];
        if (!next[0]) return prev;
        const target = { ...next[0] };
        const nextIdx = target.questionIndex + 1;
        if (nextIdx >= 5) {
          setGameOver(true);
          setRoundWinner(0);
          triggerSound('/para.mp3');
        } else {
          target.questionIndex = nextIdx;
          target.selectedOption = null;
          target.isCorrect = false;
          target.showFeedback = false;
        }
        next[0] = target;
        return next;
      });
      return;
    }

    if (singleTimeLeft <= 3 && singleTimeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setSingleTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [playerMode, gameOver, players, singleTimeLeft, playMp3, triggerSound]);

  const handleSwitchMode = (mode: PlayerMode) => {
    setPlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    triggerSound('/op.mp3');
  };

  const handleOptionClick = (playerIndex: number, option: string) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentQ = questions[p.questionIndex % questions.length];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      triggerSound('/coin.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);
    }

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.selectedOption = option;
      target.isCorrect = isCorrect;
      target.showFeedback = true;
      if (isCorrect) {
        target.score += 10;
      }
      next[playerIndex] = target;
      return next;
    });

    // Auto advance after 1.2 seconds
    setTimeout(() => {
      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        const nextIdx = target.questionIndex + 1;

        if (nextIdx >= 5) {
          // Player completed match
          setGameOver(true);
          setRoundWinner(playerIndex);
          triggerSound('/para.mp3');
          onGameCompleted?.(playerIndex, playerMode);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          target.questionIndex = nextIdx;
          target.selectedOption = null;
          target.isCorrect = null;
          target.showFeedback = false;
          if (playerMode === 1) {
            setSingleTimeLeft(100);
          }
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1200);
  };

  const handleResetGame = () => {
    setQuestions(getRandom5N1KQuestions(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setSingleTimeLeft(100);
    triggerSound('/op.mp3');
  };

  const currentLeaderIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < players.length; i++) {
      if (players[i].score > players[best].score) best = i;
    }
    return best;
  }, [players]);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* 1. TÜRKÇE TEMALI ÖZEL GÖRSEL ARKA PLAN */}
      <TurkishActivityBackground darkness="normal" />

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
                <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

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
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                            {sStudent ? sStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • 5N1K Dedektifi
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_31.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      {/* 100-Second Countdown Timer Capsule */}
                      <div className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                        singleTimeLeft <= 3 
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                          : 'bg-[#080e1d] border-slate-700 text-slate-200'
                      }`}>
                        <span className="text-xs">⏱️</span>
                        <span>{singleTimeLeft}s</span>
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

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden min-h-0 w-full gap-1.5 sm:gap-2">
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      {/* Vaka Metni (Hikaye) - Otomatik kaydırılabilir, soru metnini asla ezmez */}
                      <div className="relative z-10 bg-black/60 border border-indigo-400/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shrink overflow-y-auto max-h-[140px] sm:max-h-[190px] shadow-md no-scrollbar">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300 mb-1">
                          <span>🔍</span>
                          <span className="uppercase tracking-wider">Vaka Dosyası: {currentQ.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-100 font-semibold">
                          "{currentQ.story}"
                        </p>
                      </div>

                      {/* Soru Rozeti & Soru Cümlesi - HER ZAMAN %100 NET VE GÖRÜNÜR VURGULU KART */}
                      <div className="relative z-10 flex flex-col items-center justify-center shrink-0 w-full py-1.5 sm:py-2 px-3 bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-2 border-amber-400/70 rounded-xl sm:rounded-2xl text-center shadow-md">
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-[10.5px] sm:text-xs uppercase shadow-sm shrink-0 mb-1">
                          {currentQ.qTypeLabel} • SORU
                        </span>
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-amber-200 leading-snug drop-shadow-md">
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
                      let btnStyle = "border-2 border-blue-500/35 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/70 text-blue-50 shadow-md";

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
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                          <div className="flex items-center gap-2 min-w-0 flex-1 h-full">
                            <span className="w-6 h-6 rounded-lg bg-black/45 flex items-center justify-center font-black text-xs shrink-0 border border-white/20 text-amber-300">
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
        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${
          playerMode === 1 ? 'grid-cols-1 max-w-3xl mx-auto' : playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
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
                {/* 1. BÖLÜM: Header */}
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

                {/* 2. BÖLÜM: Vaka Dosyası & Soru (Dengeli Orta Alan) */}
                <div className="flex-1 min-h-0 flex flex-col justify-between my-0.5 gap-1 overflow-hidden">
                  {/* Vaka Dosyası (Hikaye Metni) */}
                  <div className="bg-black/55 border border-indigo-400/40 rounded-xl p-1.5 sm:p-2 shrink overflow-y-auto max-h-[90px] sm:max-h-[120px] no-scrollbar shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5 text-[10.5px] sm:text-xs font-black text-amber-300">
                      <span className="text-xs sm:text-sm">🔍</span>
                      <span className="uppercase tracking-wider truncate">Vaka: {currentQ.title}</span>
                    </div>
                    <p className="text-[10.5px] sm:text-xs md:text-sm leading-snug font-semibold text-slate-100">
                      "{currentQ.story}"
                    </p>
                  </div>

                  {/* Soru Rozeti & Soru Cümlesi - HER ZAMAN GÖRÜNÜR VURGULU KART */}
                  <div className="shrink-0 bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border border-amber-400/60 rounded-xl px-2 py-1 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-[9.5px] sm:text-[10.5px] uppercase shadow-xs mb-0.5 shrink-0">
                      {currentQ.qTypeLabel} • SORU
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-base font-black text-amber-200 leading-tight px-1 drop-shadow-sm line-clamp-2">
                      {currentQ.question}
                    </h3>
                  </div>
                </div>

                {/* 3. BÖLÜM: Şıklar (HER MODDA 2x2 GRID) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto mb-0.5 w-full shrink-0">
                  {currentQ.options.map((opt, oIdx) => {
                    const isChosen = player.selectedOption === opt;
                    const isRight = opt === currentQ.correctAnswer;
                    let btnStyle = 'bg-slate-800/95 hover:bg-slate-700 text-slate-100 border-slate-600/90';

                    if (player.showFeedback) {
                      if (isRight) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-lg scale-102';
                      } else if (isChosen && !isRight) {
                        btnStyle = 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400';
                      } else {
                        btnStyle = 'opacity-40 bg-slate-800/40 border-slate-700';
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
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-black/45 flex items-center justify-center font-black shrink-0 border border-white/20 text-[10px] sm:text-xs text-amber-300">
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
                  <div className="mt-1 p-1 rounded-lg bg-black/50 border border-white/10 text-[10px] sm:text-xs text-amber-200 text-center animate-fade-in shrink-0">
                    <span className="line-clamp-2">{currentQ.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="bg-gradient-to-b from-[#1b2b48] to-[#0c1527] border-2 border-amber-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🔍
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase">
              Tebrikler Baş Dedektif!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              5N 1K ipuçlarını ustalıkla çözdün ve vakaları başarıyla tamamladın!
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
                    <span className="text-base font-black text-amber-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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