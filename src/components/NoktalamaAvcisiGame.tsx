import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  AlertCircle, HelpCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { AutoFitOptionContent } from './AutoFitOptionContent';
import { TurkishActivityBackground } from './TurkishActivityBackground';

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
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
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
  onQuestionAnswered,
  onGameCompleted
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
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);
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
          onGameCompleted?.(playerIndex, playerMode);
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
    triggerSound('/op.mp3');
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* 1. TÜRKÇE TEMALI ÖZEL GÖRSEL ARKA PLAN */}
      <TurkishActivityBackground darkness="normal" />

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
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">

        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = questions[sPlayer.questionIndex % questions.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;
          return (

          <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
            <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
              <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

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
                        • Noktalama Avcısı
                      </span>
                    </div>
                    <img src="/MENUIKON/grid_icon_25.png" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 h-full">
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
                  <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2 sm:p-3 flex flex-col items-center justify-center text-center overflow-hidden min-h-0 w-full">
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center min-h-0 max-h-full overflow-hidden gap-1.5">
                      <span className="px-3 py-0.5 rounded-full bg-cyan-900/70 border border-cyan-400/60 text-cyan-200 font-black text-[10.5px] sm:text-xs uppercase shadow-sm shrink-0">
                        🎯 Renkli kutucuğa hangi noktalama işareti gelmeli?
                      </span>
                      <div className="text-base sm:text-lg md:text-xl font-black text-white leading-relaxed flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        <span>{currentQ.before}</span>
                        <span className={`inline-flex items-center justify-center min-w-[38px] sm:min-w-[46px] h-8 sm:h-10 px-2 rounded-xl font-black text-lg sm:text-2xl border-2 shadow-lg transition-all ${
                          sPlayer.showFeedback
                            ? sPlayer.isCorrect
                              ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-400'
                              : 'bg-rose-500 text-white border-rose-300 ring-4 ring-rose-400'
                            : 'bg-amber-400 text-slate-950 border-amber-200 animate-pulse'
                        }`}>
                          {sPlayer.selectedMark || '\u00A0'}
                        </span>
                        <span>{currentQ.after}</span>
                      </div>
                    </div>
                    {sPlayer.showFeedback && (
                      <div className="absolute bottom-1 inset-x-2 z-20 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 text-[10px] sm:text-xs text-amber-200 text-center animate-fade-in">
                        <span className="font-bold text-cyan-300 mr-1">{currentQ.markName}:</span>
                        <span className="line-clamp-2">{currentQ.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM: NOKTALAMA TUŞLARI (ÇERÇEVENİN İÇİNDE, TAKVİM ŞIK STİLİ) */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full shrink-0 mt-1">
                  {availableMarks.map((m) => {
                    const isChosen = sPlayer.selectedMark === m.symbol;
                    const isRight = m.symbol === currentQ.correctMark;
                    let btnClass = "border-2 border-blue-500/35 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/70 active:from-[#0e1726] active:to-[#090f1a] text-blue-50 shadow-md active:shadow-xs";
                    if (sPlayer.showFeedback) {
                      if (isRight) btnClass = "ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 shadow-md text-white";
                      else if (isChosen) btnClass = "ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 shadow-md text-white";
                      else btnClass = "opacity-35 border-slate-700/60 bg-slate-900/60 text-slate-400";
                    }
                    return (
                      <button
                        key={m.symbol}
                        disabled={sPlayer.showFeedback}
                        onClick={() => handleMarkClick(0, m.symbol)}
                        className={`fast-quiz-btn relative w-full py-1 sm:py-1.5 px-1 min-h-[44px] sm:min-h-[50px] md:min-h-[56px] rounded-2xl border-2 transition-colors duration-75 flex flex-col items-center justify-center text-center cursor-pointer uppercase tracking-wider overflow-hidden active:scale-98 ${btnClass}`}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                        <span className="relative text-2xl sm:text-3xl leading-none font-black">{m.symbol}</span>
                        <span className="relative text-[9px] sm:text-[10px] font-black mt-0.5 truncate max-w-full">{m.label}</span>
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
                className={`rounded-2xl border-2 ${cardBorder} p-2.5 sm:p-3 flex flex-col justify-between shadow-xl backdrop-blur-sm min-h-0 overflow-y-auto no-scrollbar`}
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
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* Soru Görevi Rozeti */}
                <div className="text-center my-0.5 shrink-0">
                  <span className="px-3 py-0.5 rounded-full bg-cyan-900/70 border border-cyan-400/60 text-cyan-200 font-black text-[11px] sm:text-xs uppercase shadow-sm">
                    🎯 Renkli kutucuğa hangi noktalama işareti gelmeli?
                  </span>
                </div>

                {/* 2. BÖLÜM: Cümle Kartı & Boşluk Alanı - 3 Bölümlü Dengeli Orta Alan */}
                <div className="flex-1 min-h-0 bg-black/50 border-2 border-white/20 rounded-2xl p-2.5 sm:p-3.5 my-1 flex items-center justify-center text-center shadow-inner">
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white leading-relaxed flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <span>{currentQ.before}</span>
                    <span className={`inline-flex items-center justify-center min-w-[42px] sm:min-w-[50px] h-9 sm:h-12 px-2.5 rounded-xl font-black text-xl sm:text-2xl md:text-3xl border-2 shadow-lg transition-all ${
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

                {/* 3. BÖLÜM: Noktalama İşareti Tuşları (ŞIKLAR) */}
                <div className={`grid grid-cols-5 ${
                  playerMode === 1 
                    ? 'gap-2 sm:gap-3.5 my-2 max-w-2xl mx-auto' 
                    : playerMode === 2 
                    ? 'gap-1.5 sm:gap-2 my-1.5' 
                    : 'gap-1 my-1'
                } w-full shrink-0`}>
                  {availableMarks.map((m) => {
                    const isChosen = player.selectedMark === m.symbol;
                    const isRight = m.symbol === currentQ.correctMark;
                    let btnStyle = `${m.color} text-slate-950 shadow-lg`;

                    if (player.showFeedback) {
                      if (isRight) {
                        btnStyle = 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-105 shadow-xl';
                      } else if (isChosen && !isRight) {
                        btnStyle = 'bg-rose-500 text-white ring-4 ring-rose-300';
                      } else {
                        btnStyle = 'opacity-30 bg-slate-700 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={m.symbol}
                        disabled={player.showFeedback}
                        onClick={() => handleMarkClick(pIdx, m.symbol)}
                        className={`flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all font-black cursor-pointer active:scale-95 border-2 border-white/30 ${
                          playerMode === 1
                            ? 'py-3 sm:py-4 px-2 min-h-[70px] sm:min-h-[84px] md:min-h-[94px]'
                            : playerMode === 2
                            ? 'py-2 sm:py-2.5 px-1.5 min-h-[56px] sm:min-h-[64px]'
                            : 'py-1.5 sm:py-2 px-1 min-h-[48px]'
                        } ${btnStyle}`}
                      >
                        <span className={`${
                          playerMode === 1 
                            ? 'text-3xl sm:text-4xl md:text-5xl' 
                            : playerMode === 2 
                            ? 'text-2xl sm:text-3xl' 
                            : 'text-xl sm:text-2xl'
                        } leading-none font-black drop-shadow`}>
                          {m.symbol}
                        </span>
                        <span className={`${
                          playerMode === 1 
                            ? 'text-xs sm:text-sm font-black mt-1' 
                            : playerMode === 2 
                            ? 'text-[10px] sm:text-xs font-black mt-0.5' 
                            : 'text-[9px] sm:text-[10px] font-bold mt-0.5'
                        } uppercase tracking-wider truncate max-w-full`}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-0.5 p-1 rounded-lg bg-black/50 border border-white/10 text-[10px] sm:text-xs text-amber-200 text-center animate-fade-in shrink-0">
                    <span className="font-bold text-cyan-300 mr-1">{currentQ.markName}:</span>
                    <span>{currentQ.explanation}</span>
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