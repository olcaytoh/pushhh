import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  AlertCircle, HelpCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface NoktalamaQuestion {
  id: string;
  before: string;
  after: string;
  correctMark: '.' | ',' | '?' | '!' | "'";
  markName: string;
  explanation: string;
}

export const NOKTALAMA_QUESTIONS: NoktalamaQuestion[] = [
  {
    id: 'nok-1',
    before: 'Yarın bizimle parka gelecek misin',
    after: '',
    correctMark: '?',
    markName: 'Soru İşareti (?)',
    explanation: 'Soru bildiren cümlelerin sonuna soru işareti konur.'
  },
  {
    id: 'nok-2',
    before: 'Eyvah, süt yere döküldü',
    after: '',
    correctMark: '!',
    markName: 'Ünlem İşareti (!)',
    explanation: 'Korku, heyecan, şaşkınlık bildiren cümlelerin sonuna ünlem işareti konur.'
  },
  {
    id: 'nok-3',
    before: 'Pazardan elma',
    after: 'armut ve muz aldık.',
    correctMark: ',',
    markName: 'Virgül (,)',
    explanation: 'Eş görevli kelimeleri birbirinden ayırmak için aralarına virgül konur.'
  },
  {
    id: 'nok-4',
    before: 'Güneş her sabah doğudan doğar',
    after: '',
    correctMark: '.',
    markName: 'Nokta (.)',
    explanation: 'Tamamlanmış kurallı cümlelerin sonuna nokta konur.'
  },
  {
    id: 'nok-5',
    before: 'Mustafa Kemal Atatürk 1881 yılında Selanik',
    after: 'te doğdu.',
    correctMark: "'",
    markName: 'Kesme İşareti (\')',
    explanation: 'Özel isimlere getirilen ekleri ayırmak için kesme işareti kullanılır.'
  },
  {
    id: 'nok-6',
    before: 'Ankara',
    after: 'nın başkentimiz olduğunu öğrendik.',
    correctMark: "'",
    markName: 'Kesme İşareti (\')',
    explanation: 'Özel adlara getirilen çekim eklerini ayırmak için kesme işareti konur.'
  },
  {
    id: 'nok-7',
    before: 'Yaşasın, okullar açıldı',
    after: '',
    correctMark: '!',
    markName: 'Ünlem İşareti (!)',
    explanation: 'Büyük sevinç ve coşku bildiren cümlelerin sonuna ünlem işareti konur.'
  },
  {
    id: 'nok-8',
    before: 'Kardeşim sabah sütünü içti',
    after: '',
    correctMark: '.',
    markName: 'Nokta (.)',
    explanation: 'Anlamca bitmiş cümlenin sonuna nokta konur.'
  },
  {
    id: 'nok-9',
    before: 'Kaçıncı sınıfa gidiyorsun',
    after: '',
    correctMark: '?',
    markName: 'Soru İşareti (?)',
    explanation: 'Soru anlamı taşıyan cümlenin sonuna soru işareti gelir.'
  },
  {
    id: 'nok-10',
    before: 'Piknikte top oynadık',
    after: 'ip atladık ve şarkılar söyledik.',
    correctMark: ',',
    markName: 'Virgül (,)',
    explanation: 'Birbiri ardınca sıralanan cümleleri veya sözcükleri ayırmak için virgül konur.'
  },
  {
    id: 'nok-11',
    before: 'Ahmet',
    after: 'in kedisi pamuk gibi bembeyazdır.',
    correctMark: "'",
    markName: 'Kesme İşareti (\')',
    explanation: 'Kişi isimlerine getirilen ekleri ayırmak için kesme işareti kullanılır.'
  },
  {
    id: 'nok-12',
    before: 'İmdat, yangın var',
    after: '',
    correctMark: '!',
    markName: 'Ünlem İşareti (!)',
    explanation: 'Tehlike, korku ve acil durum bildiren cümlelerin sonuna ünlem işareti konur.'
  },
  {
    id: 'nok-13',
    before: 'Ödevlerini bitirdin mi',
    after: '',
    correctMark: '?',
    markName: 'Soru İşareti (?)',
    explanation: 'Cevap bekleyen soru cümlelerinin sonuna soru işareti konur.'
  },
  {
    id: 'nok-14',
    before: 'Çantamda defter',
    after: 'kalem ve silgi var.',
    correctMark: ',',
    markName: 'Virgül (,)',
    explanation: 'Birbiri ardına sıralanan benzer kelimeleri ayırmak için virgül kullanılır.'
  },
  {
    id: 'nok-15',
    before: 'Okulumuzu ve öğretmenimizi çok seviyoruz',
    after: '',
    correctMark: '.',
    markName: 'Nokta (.)',
    explanation: 'Tamamlanan duyguların ve düşüncelerin sonuna nokta konur.'
  }
];

export const getRandomNoktalamaQuestions = (count: number = 8): NoktalamaQuestion[] => {
  const shuffled = [...NOKTALAMA_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface NoktalamaAvcisiGameProps {
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
  colorName: 'rose' | 'blue' | 'emerald';
  score: number;
  questionIndex: number;
  selectedMark: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const NoktalamaAvcisiGame: React.FC<NoktalamaAvcisiGameProps> = ({
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

  const [questions, setQuestions] = useState<NoktalamaQuestion[]>(() => getRandomNoktalamaQuestions(8));

  const availableMarks: { symbol: '.' | ',' | '?' | '!' | "'"; label: string; color: string }[] = [
    { symbol: '.', label: 'Nokta', color: 'bg-emerald-500 hover:bg-emerald-400' },
    { symbol: ',', label: 'Virgül', color: 'bg-amber-500 hover:bg-amber-400' },
    { symbol: '?', label: 'Soru', color: 'bg-sky-500 hover:bg-sky-400' },
    { symbol: '!', label: 'Ünlem', color: 'bg-rose-500 hover:bg-rose-400' },
    { symbol: "'", label: 'Kesme', color: 'bg-purple-500 hover:bg-purple-400' }
  ];

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
    const names = ['1. Avcı', '2. Avcı', '3. Avcı'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Noktalama Avcısı' : names[i],
        colorName: colors[i],
        score: 0,
        questionIndex: 0,
        selectedMark: null,
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

  const handleMarkClick = (playerIndex: number, mark: string) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentQ = questions[p.questionIndex % questions.length];
    const isCorrect = mark === currentQ.correctMark;

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
      target.selectedMark = mark;
      target.isCorrect = isCorrect;
      target.showFeedback = true;
      if (isCorrect) {
        target.score += 10;
      }
      next[playerIndex] = target;
      return next;
    });

    setTimeout(() => {
      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        const nextIdx = target.questionIndex + 1;

        if (nextIdx >= 5) {
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
          target.selectedMark = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1200);
  };

  const handleResetGame = () => {
    setQuestions(getRandomNoktalamaQuestions(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    triggerSound('/nextlvl.mp3');
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Geri Dön"
          >
            <ChevronLeft size={18} />
          </button>

          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-[#1c1d38] via-[#26284f] to-[#1c1d38] border border-cyan-400/80 shadow-md">
            <span className="text-sm">🎯</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Noktalama İşareti Avcısı
            </span>
          </div>

          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Soru Görevi */}
        <div className="hidden md:flex items-center">
          <span className="px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-400/50 text-cyan-200 font-bold text-xs">
            🎯 Renkli kutucuğa uygun noktalama işaretini seç
          </span>
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

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 flex flex-col justify-between overflow-y-auto no-scrollbar min-h-0">
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
                {/* Header */}
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
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* Soru Görevi */}
                <div className="text-center my-1">
                  <span className="px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-400/50 text-cyan-200 font-bold text-[10.5px] sm:text-xs uppercase">
                    🎯 Renkli kutucuğa hangi noktalama işareti gelmeli?
                  </span>
                </div>

                {/* Cümle Kartı & Boşluk Alanı */}
                <div className="bg-black/50 border-2 border-white/20 rounded-2xl p-3 sm:p-4 my-auto text-center shadow-inner">
                  <div className="text-base sm:text-xl md:text-2xl font-black text-white leading-relaxed flex flex-wrap items-center justify-center gap-2">
                    <span>{currentQ.before}</span>
                    <span className={`inline-flex items-center justify-center min-w-[40px] sm:min-w-[48px] h-9 sm:h-11 px-2.5 rounded-xl font-black text-lg sm:text-2xl border-2 shadow-lg transition-all ${
                      player.showFeedback
                        ? player.isCorrect
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-400'
                          : 'bg-rose-500 text-white border-rose-300 ring-4 ring-rose-400'
                        : 'bg-amber-400 text-slate-950 border-amber-200 animate-pulse'
                    }`}>
                      {player.selectedMark || '\u00A0'}
                    </span>
                    <span>{currentQ.after}</span>
                  </div>
                </div>

                {/* Noktalama İşareti Tuşları */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 my-2 w-full max-w-xl mx-auto">
                  {availableMarks.map((m) => {
                    const isChosen = player.selectedMark === m.symbol;
                    const isRight = m.symbol === currentQ.correctMark;
                    let btnStyle = `${m.color} text-slate-950 shadow-md`;

                    if (player.showFeedback) {
                      if (isRight) {
                        btnStyle = 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105';
                      } else if (isChosen && !isRight) {
                        btnStyle = 'bg-rose-500 text-white ring-2 ring-rose-300';
                      } else {
                        btnStyle = 'opacity-30 bg-slate-700 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={m.symbol}
                        disabled={player.showFeedback}
                        onClick={() => handleMarkClick(pIdx, m.symbol)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all font-black cursor-pointer active:scale-95 ${btnStyle}`}
                      >
                        <span className="text-xl sm:text-2xl leading-none">{m.symbol}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold mt-1 uppercase truncate max-w-full">
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-1 p-2 rounded-lg bg-black/50 border border-white/10 text-[11px] sm:text-xs text-amber-200 text-center animate-fade-in">
                    <span className="font-bold block text-cyan-300">{currentQ.markName}</span>
                    <span>{currentQ.explanation}</span>
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
          <div className="bg-gradient-to-b from-[#1b2b48] to-[#0c1527] border-2 border-cyan-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🎯
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase">
              Tebrikler Noktalama Avcısı!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Tüm noktalama işaretlerini hedeften vurarak cümleleri eksiksiz tamamladın!
            </p>

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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
