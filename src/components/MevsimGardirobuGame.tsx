import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  Sun, CloudSnow, CloudRain, Flower2
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface WeatherScenario {
  id: string;
  season: 'Kış' | 'Yaz' | 'Sonbahar' | 'İlkbahar';
  weatherDesc: string;
  emoji: string;
  question: string;
  options: { name: string; emoji: string; isCorrect: boolean }[];
  explanation: string;
}

export const WEATHER_SCENARIOS: WeatherScenario[] = [
  {
    id: 'w-sc-1',
    season: 'Kış',
    weatherDesc: 'Dışarıda lapa lapa kar yağıyor ve hava dondurucu derecede soğuk! ❄️',
    emoji: '☃️',
    question: 'Dışarı çıkarken üzerine ne giymelisin?',
    options: [
      { name: 'Kalın Mont ve Yün Bere', emoji: '🧥', isCorrect: true },
      { name: 'Kısa Kollu Tişört', emoji: '👕', isCorrect: false },
      { name: 'Deniz Şortu', emoji: '🩳', isCorrect: false },
      { name: 'Açık Sandalet', emoji: '👡', isCorrect: false }
    ],
    explanation: 'Karlı ve dondurucu kış günlerinde kalın mont, bere ve eldiven giyeriz.'
  },
  {
    id: 'w-sc-2',
    season: 'Yaz',
    weatherDesc: 'Güneş pırıl pırıl parlıyor, hava çok sıcak ve kumsala gidiyoruz! ☀️',
    emoji: '🏖️',
    question: 'Güneşten korunmak için hangisini takmalıyız?',
    options: [
      { name: 'Güneş Şapkası ve Gözlük', emoji: '🧢', isCorrect: true },
      { name: 'Kalın Yün Kaşkol', emoji: '🧣', isCorrect: false },
      { name: 'Kürklü Kar Botu', emoji: '🥾', isCorrect: false },
      { name: 'Deri Eldiven', emoji: '🧤', isCorrect: false }
    ],
    explanation: 'Sıcak yaz günlerinde güneş çarpmasından korunmak için şapka ve güneş gözlüğü takarız.'
  },
  {
    id: 'w-sc-3',
    season: 'Sonbahar',
    weatherDesc: 'Gökyüzü gri bulutlarla kaplı, şiddetli bir sonbahar yağmuru yağıyor! 🌧️',
    emoji: '☔',
    question: 'Islanmamak için yanımıza ne almalıyız?',
    options: [
      { name: 'Şemsiye ve Yağmurluk', emoji: '☂️', isCorrect: true },
      { name: 'Plaj Terliği', emoji: '🩴', isCorrect: false },
      { name: 'Güneş Kremi', emoji: '🧴', isCorrect: false },
      { name: 'Askılı Mayo', emoji: '🩱', isCorrect: false }
    ],
    explanation: 'Yağmurlu günlerde ıslanmamak için şemsiye ve yağmurluk kullanırız.'
  },
  {
    id: 'w-sc-4',
    season: 'İlkbahar',
    weatherDesc: 'Ağaçlar çiçek açtı, kuşlar cıvıldıyor, hava tatlı ve ılık! 🌸',
    emoji: '🌷',
    question: 'Parkta oynarken ne giymek en uygundur?',
    options: [
      { name: 'İnce Hırka ve Spor Ayakkabı', emoji: '👟', isCorrect: true },
      { name: 'Ağır Kar Tulumu', emoji: '🎿', isCorrect: false },
      { name: 'Yün Çorap ve Termal İçlik', emoji: '🧦', isCorrect: false },
      { name: 'Dalgıç Kıyafeti', emoji: '🤿', isCorrect: false }
    ],
    explanation: 'İlkbaharda ne çok sıcak ne çok soğuk olan havalarda ince mevsimlik hırkalar uygundur.'
  },
  {
    id: 'w-sc-5',
    season: 'Kış',
    weatherDesc: 'Yollar buz tutmuş, soğuk rüzgarlar esiyor! 💨',
    emoji: '🧤',
    question: 'Ellerimizin ve ayaklarımızın üşümemesi için ne giymeliyiz?',
    options: [
      { name: 'Sıcak Yün Eldiven ve Bot', emoji: '🧤', isCorrect: true },
      { name: 'Bez Bezbol Ayakkabısı', emoji: '👟', isCorrect: false },
      { name: 'Parmak Arası Terlik', emoji: '🩴', isCorrect: false },
      { name: 'İnce İpek Fular', emoji: '🧣', isCorrect: false }
    ],
    explanation: 'Buzlu ve karlı havalarda kaymayan sıcak botlar ve yün eldivenler giyilir.'
  },
  {
    id: 'w-sc-6',
    season: 'Yaz',
    weatherDesc: 'Termometreler 35 dereceyi gösteriyor, hava çok sıcak! 🌡️',
    emoji: '🎽',
    question: 'Terlememek için hangi kıyafeti tercih etmeliyiz?',
    options: [
      { name: 'Pamuklu Tişört ve Şort', emoji: '👕', isCorrect: true },
      { name: 'Boğazlı Yün Kazak', emoji: '🧶', isCorrect: false },
      { name: 'Peluş Kaban', emoji: '🧥', isCorrect: false },
      { name: 'Su Geçirmez Balıkçı Çizmesi', emoji: '👢', isCorrect: false }
    ],
    explanation: 'Sıcak havalarda açık renkli, ince pamuklu tişört ve şortlar giyilir.'
  }
];

export const getRandomWeatherScenarios = (count: number = 5): WeatherScenario[] => {
  const shuffled = [...WEATHER_SCENARIOS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

interface MevsimGardirobuGameProps {
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
  scenarioIndex: number;
  chosenOptionIdx: number | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const MevsimGardirobuGame: React.FC<MevsimGardirobuGameProps> = ({
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

  const [scenarios, setScenarios] = useState<WeatherScenario[]>(() => getRandomWeatherScenarios(5));

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
    const names = ['1. Modacı', '2. Modacı', '3. Modacı'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Mevsim Stilisti' : names[i],
        colorName: colors[i],
        score: 0,
        scenarioIndex: 0,
        chosenOptionIdx: null,
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

  const handleChooseOption = (playerIndex: number, optionIdx: number) => {
    const p = players[playerIndex];
    if (p.showFeedback || gameOver) return;

    const currentSc = scenarios[p.scenarioIndex % scenarios.length];
    const option = currentSc.options[optionIdx];
    const isCorrect = option.isCorrect;

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
      target.chosenOptionIdx = optionIdx;
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
        const nextIdx = target.scenarioIndex + 1;

        if (nextIdx >= scenarios.length) {
          setGameOver(true);
          setRoundWinner(playerIndex);
          triggerSound('/para.mp3');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          target.scenarioIndex = nextIdx;
          target.chosenOptionIdx = null;
          target.isCorrect = null;
          target.showFeedback = false;
        }
        next[playerIndex] = target;
        return next;
      });
    }, 1300);
  };

  const handleResetGame = () => {
    setScenarios(getRandomWeatherScenarios(5));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    triggerSound('/nextlvl.mp3');
  };

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

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] border border-indigo-400/80 shadow-md">
            <span className="text-sm">🧥</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Mevsim Gardırobu (Hava Durumu)
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
            const currentSc = scenarios[player.scenarioIndex % scenarios.length];
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
                      Mevsim: {player.scenarioIndex + 1}/{scenarios.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* Mevsim & Hava Durumu Sahnesi - Görsel ve Yazı Puntoları Büyütüldü */}
                <div className="my-auto py-3.5 sm:py-5 px-3.5 sm:px-5 rounded-2xl sm:rounded-3xl bg-black/60 border-2 sm:border-3 border-indigo-400/50 flex flex-col items-center justify-center gap-2 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl sm:text-6xl md:text-7xl animate-pulse filter drop-shadow-md">{currentSc.emoji}</span>
                    <span className="px-4 py-1.5 rounded-full bg-indigo-600/80 border-2 border-indigo-400 text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-wider shadow-md">
                      {currentSc.season} Mevsimi
                    </span>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-slate-100 text-center font-semibold leading-relaxed px-1">
                    {currentSc.weatherDesc}
                  </p>
                  <div className="text-xs sm:text-sm md:text-base font-black text-amber-300 mt-1 drop-shadow-sm">
                    👉 {currentSc.question}
                  </div>
                </div>

                {/* Gardırop Kıyafet Seçenekleri */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 my-2">
                  {currentSc.options.map((opt, oIdx) => {
                    const isChosen = player.chosenOptionIdx === oIdx;
                    const isRight = opt.isCorrect;
                    let optStyle = 'bg-slate-800/95 hover:bg-slate-700 text-slate-100 border-slate-600/90';

                    if (player.showFeedback) {
                      if (isRight) {
                        optStyle = 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-400 scale-102';
                      } else if (isChosen && !isRight) {
                        optStyle = 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400';
                      } else {
                        optStyle = 'opacity-30 bg-slate-800/40 border-slate-700';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={player.showFeedback}
                        onClick={() => handleChooseOption(pIdx, oIdx)}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 font-bold text-xs sm:text-sm md:text-base transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 shadow-lg ${optStyle}`}
                      >
                        <span className="text-3xl sm:text-4xl shrink-0 filter drop-shadow-sm">{opt.emoji}</span>
                        <span className="text-left leading-tight text-xs sm:text-sm md:text-base font-bold">
                          {opt.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Didaktik Açıklama */}
                {player.showFeedback && (
                  <div className="mt-1 p-2 rounded-lg bg-black/60 border border-white/10 text-[11px] sm:text-xs text-amber-200 text-center animate-fade-in">
                    <span className="font-bold text-indigo-300 block">{currentSc.season} Gardırobu İpucu:</span>
                    <span>{currentSc.explanation}</span>
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

      {/* Victory Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#1e1b4b] to-[#0d0c24] border-2 border-indigo-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🧥
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-300 uppercase">
              Mevsim Şıklığı Tam Puan!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Hava durumuna ve mevsime en uygun kıyafetleri seçerek sağlığını korudun!
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
                    <span className="text-base font-black text-indigo-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-300 hover:to-purple-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
