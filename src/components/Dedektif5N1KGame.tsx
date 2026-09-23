import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  ChevronLeft, AlertCircle, ShieldCheck, HelpCircle, BookOpen
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

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
  onQuestionAnswered?: (isCorrect: boolean) => void;
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
  onQuestionAnswered
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

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
  }, [playerMode, createInitialPlayers]);

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
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(true);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered && playerIndex === 0) onQuestionAnswered(false);
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
    triggerSound('/nextlvl.mp3');
  };

  const currentLeaderIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < players.length; i++) {
      if (players[i].score > players[best].score) best = i;
    }
    return best;
  }, [players]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Sub-header Bar */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Geri Dön"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Activity Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#1b253b] via-[#243352] to-[#1b253b] border border-amber-400/80 shadow-md">
            <Search size={14} className="text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              5N 1K Dedektifi
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Ana Sayfaya Dön"
            >
              <Home size={13} />
              <span className="hidden xs:inline">Ana Sayfa</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kapat"
          >
            ✕ <span className="hidden xs:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 flex flex-col justify-between overflow-y-auto no-scrollbar min-h-0">
        {/* Story & Questions Area: 1, 2, or 3 columns */}
        <div className={`w-full flex-1 grid gap-2 sm:gap-3 ${
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
                className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-3 flex flex-col justify-between shadow-xl backdrop-blur-sm overflow-hidden`}
              >
                {/* Player Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
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

                {/* Vaka Dosyası (Hikaye Metni) */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-2 sm:p-2.5 mb-2 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-bold text-amber-300">
                    <span>🔍</span>
                    <span className="uppercase tracking-wide font-black">Vaka Dosyası: {currentQ.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    "{currentQ.story}"
                  </p>
                </div>

                {/* 5N 1K Soru Rozeti */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md">
                    {currentQ.qTypeLabel}
                  </span>
                </div>

                {/* Soru Cümlesi */}
                <h3 className="text-center font-black text-xs sm:text-sm md:text-base text-white mb-2.5 leading-snug px-1">
                  {currentQ.question}
                </h3>

                {/* Şıklar */}
                <div className="grid grid-cols-1 gap-1.5 my-auto">
                  {currentQ.options.map((opt, oIdx) => {
                    const isChosen = player.selectedOption === opt;
                    const isRight = opt === currentQ.correctAnswer;
                    let btnStyle = 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border-slate-600/80';

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
                        className={`w-full py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all text-left flex items-center justify-between cursor-pointer active:scale-98 ${btnStyle}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-black shrink-0">
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {player.showFeedback && isRight && <span className="text-white shrink-0">✓</span>}
                        {player.showFeedback && isChosen && !isRight && <span className="text-white shrink-0">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-2 p-1.5 rounded-lg bg-black/50 border border-white/10 text-[10.5px] sm:text-xs text-amber-200 text-center animate-fade-in">
                    {currentQ.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Student Avatar Dock (Single Row) */}
      {students && students.length > 0 && onOpenRosterModal && (
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
