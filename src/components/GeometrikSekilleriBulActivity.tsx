import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, RotateCcw, SkipBack, SkipForward, Home,
  Award, Heart, Sparkles, CheckCircle2, XCircle, Info, HelpCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';
import { 
  GeometricSolidType, 
  GEOMETRIC_SOLIDS, 
  GeometricSolidDef,
  EverydayObjectItem, 
  EVERYDAY_OBJECTS_POOL 
} from '../data/geometricShapesGameData';
import { GEO2D_OBJECTS_POOL, Geo2dObjectItem } from '../data/geo2dItemsData';
import { Solid3DIcon, EverydayObjectGraphic } from './GeometricItemIcon';

export interface GeometrikSekilleriBulProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  soundEnabled?: boolean;
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

export type GeometricThemeCategory = 'all' | '3d_cisimler' | 'gunluk_esya' | 'prizmalar' | 'yuvarlak';

export interface GeometricSpotItem {
  id: string;
  name: string;
  solidType: GeometricSolidType;
  category: 'cisim' | 'ev' | 'oyun' | 'okul' | 'spor' | 'yiyecek' | 'doga';
  is3DSolid: boolean;
  imgSrc?: string;
  hint?: string;
}

// 1. SAF 3D GEOMETRİK CİSİMLER (7 Cisim)
const PURE_3D_SOLIDS: GeometricSpotItem[] = [
  { id: 'cisim_kup', name: 'Küp', solidType: 'kup', category: 'cisim', is3DSolid: true },
  { id: 'cisim_silindir', name: 'Silindir', solidType: 'silindir', category: 'cisim', is3DSolid: true },
  { id: 'cisim_kure', name: 'Küre', solidType: 'kure', category: 'cisim', is3DSolid: true },
  { id: 'cisim_koni', name: 'Koni', solidType: 'koni', category: 'cisim', is3DSolid: true },
  { id: 'cisim_dikdortgen_prizma', name: 'Dikdörtgen Prizma', solidType: 'dikdortgen_prizma', category: 'cisim', is3DSolid: true },
  { id: 'cisim_ucgen_prizma', name: 'Üçgen Prizma', solidType: 'ucgen_prizma', category: 'cisim', is3DSolid: true },
  { id: 'cisim_kare_prizma', name: 'Kare Prizma', solidType: 'kare_prizma', category: 'cisim', is3DSolid: true },
];

// 2. PUBLIC/GEO2D KLASÖRÜNDEN GERÇEK GÖRSELLİ NESNELER HAVUZU (100'e yakın nesne)
const GEO2D_SPOT_ITEMS: GeometricSpotItem[] = GEO2D_OBJECTS_POOL.map(obj => ({
  id: obj.id,
  name: obj.name,
  solidType: obj.solidType,
  category: obj.category,
  is3DSolid: false,
  imgSrc: obj.imgSrc,
  hint: obj.hint
}));

// 3. VEKTÖREL SVG GÜNLÜK EŞYALAR
const EVERYDAY_SPOT_ITEMS: GeometricSpotItem[] = EVERYDAY_OBJECTS_POOL.map(obj => ({
  id: obj.id,
  name: obj.name,
  solidType: obj.solidType,
  category: obj.category,
  is3DSolid: false,
  hint: obj.hint
}));

// TÜM GEOMETRİK NESNELER (Saf 3D + geo2d gerçek fotoğraflar + vektörel nesneler)
const ALL_GEOMETRIC_ITEMS: GeometricSpotItem[] = [
  ...GEO2D_SPOT_ITEMS,
  ...PURE_3D_SOLIDS,
  ...EVERYDAY_SPOT_ITEMS
];

// Prizmalar Grubu (Küp, Dikdörtgen Prizma, Kare Prizma, Üçgen Prizma ve eşyaları)
const PRIZMALAR_ITEMS: GeometricSpotItem[] = ALL_GEOMETRIC_ITEMS.filter(item => 
  ['kup', 'dikdortgen_prizma', 'kare_prizma', 'ucgen_prizma'].includes(item.solidType)
);

// Yuvarlak Cisimler Grubu (Küre, Silindir, Koni ve eşyaları)
const YUVARLAK_ITEMS: GeometricSpotItem[] = ALL_GEOMETRIC_ITEMS.filter(item => 
  ['kure', 'silindir', 'koni'].includes(item.solidType)
);

const ALL_SOLID_TYPES: GeometricSolidType[] = [
  'kup', 'silindir', 'kure', 'koni', 'dikdortgen_prizma', 'ucgen_prizma', 'kare_prizma'
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const TARGET_WIN_SCORE = 7;
const MAX_MISTAKES = 3;

export const GeometrikSekilleriBulActivity: React.FC<GeometrikSekilleriBulProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  soundEnabled = true,
  playerCountMode = 2,
  onSwitchPlayerCountMode,
  students,
  selectedStudentId,
  selectedStudentIds = [null, null, null],
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered
}) => {
  // Aktif Oyuncu Modu (1, 2 veya 3)
  const [activePlayerMode, setActivePlayerMode] = useState<1 | 2 | 3>(playerCountMode || 2);
  const [theme, setTheme] = useState<GeometricThemeCategory>('all');

  // Skorlar ve Canlar
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player3Score, setPlayer3Score] = useState(0);

  const [player1Mistakes, setPlayer1Mistakes] = useState(0);
  const [player2Mistakes, setPlayer2Mistakes] = useState(0);
  const [player3Mistakes, setPlayer3Mistakes] = useState(0);

  // Kazanan Durumu
  const [winner, setWinner] = useState<'p1' | 'p2' | 'p3' | null>(null);
  const [winReason, setWinReason] = useState<'score' | 'mistake' | 'time' | null>(null);

  // =========================================================================
  // ORTAK SORU VE HEDEF GEOMETRİK CİSİM DURUMU (1, 2 VE 3 KİŞİLİKTE ORTAK!)
  // =========================================================================
  const [targetSolidType, setTargetSolidType] = useState<GeometricSolidType>('kup');

  // Kart Öğeleri
  const [singleCardItems, setSingleCardItems] = useState<GeometricSpotItem[]>([]);
  const [p1Items, setP1Items] = useState<GeometricSpotItem[]>([]);
  const [p2Items, setP2Items] = useState<GeometricSpotItem[]>([]);
  const [p3Items, setP3Items] = useState<GeometricSpotItem[]>([]);

  // Geri Bildirim Durumları
  const [singleFeedback, setSingleFeedback] = useState<{
    status: 'correct' | 'wrong' | null;
    itemId: string | null;
    message: string;
  }>({ status: null, itemId: null, message: '' });

  const [p1WrongId, setP1WrongId] = useState<string | null>(null);
  const [p2WrongId, setP2WrongId] = useState<string | null>(null);
  const [p3WrongId, setP3WrongId] = useState<string | null>(null);
  const [foundPlayer, setFoundPlayer] = useState<'p1' | 'p2' | 'p3' | null>(null);
  const [foundItemId, setFoundItemId] = useState<string | null>(null);

  const isTransitioningRef = useRef(false);

  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 24), [students]);

  // Sync mode with parent playerCountMode
  useEffect(() => {
    if (playerCountMode && playerCountMode !== activePlayerMode) {
      setActivePlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const triggerSound = useCallback((type: 'correct' | 'wrong' | 'win' | 'click') => {
    if (!soundEnabled || !playMp3) return;
    if (type === 'correct') playMp3('/correct.mp3');
    else if (type === 'wrong') playMp3('/hata.mp3');
    else if (type === 'win') playMp3('/nextlvl.mp3');
    else playMp3('/op.mp3');
  }, [soundEnabled, playMp3]);

  // Aktif Havuzu Belirle
  const getActivePool = useCallback((selectedTheme: GeometricThemeCategory): GeometricSpotItem[] => {
    if (selectedTheme === '3d_cisimler') {
      const solids = ALL_GEOMETRIC_ITEMS.filter(it => it.is3DSolid);
      const others = ALL_GEOMETRIC_ITEMS.filter(it => !it.is3DSolid);
      return [...solids, ...others.slice(0, 30)];
    }
    if (selectedTheme === 'gunluk_esya') {
      return ALL_GEOMETRIC_ITEMS.filter(it => !it.is3DSolid);
    }
    if (selectedTheme === 'prizmalar') return PRIZMALAR_ITEMS;
    if (selectedTheme === 'yuvarlak') return YUVARLAK_ITEMS;
    return ALL_GEOMETRIC_ITEMS;
  }, []);

  // =========================================================================
  // TUR KURULUMU (1 OYUNCU VE 2/3 OYUNCU İÇİN ŞEKİL ODAKLI SORU ÜRETİMİ)
  // =========================================================================
  const setupNewRound = useCallback((activeTheme: GeometricThemeCategory = theme, mode: 1 | 2 | 3 = activePlayerMode) => {
    isTransitioningRef.current = false;
    setFoundPlayer(null);
    setFoundItemId(null);
    setP1WrongId(null);
    setP2WrongId(null);
    setP3WrongId(null);
    setSingleFeedback({ status: null, itemId: null, message: '' });

    const pool = getActivePool(activeTheme);

    // 1. Hedef Geometrik Şekil Seç (Örn: Küp, Silindir, Küre, Dikdörtgen Prizma, Kare Prizma, Üçgen Prizma, Koni)
    const availableSolidTypes = Array.from(new Set(pool.map(it => it.solidType)));
    const chosenSolidType: GeometricSolidType = 
      availableSolidTypes.length > 0
        ? availableSolidTypes[Math.floor(Math.random() * availableSolidTypes.length)]
        : ALL_SOLID_TYPES[Math.floor(Math.random() * ALL_SOLID_TYPES.length)];

    setTargetSolidType(chosenSolidType);

    // Hedef tipe uyan nesneler
    const matchingItems = pool.filter(it => it.solidType === chosenSolidType);
    // Hedef tipe uymayan çeldirici nesneler
    const nonMatchingItems = pool.filter(it => it.solidType !== chosenSolidType);

    // -----------------------------------------------------------------------
    // A) 1 OYUNCU MODU: TEK KİŞİLİK EĞİTİCİ GEOMETRİK CİSİM BULMA OYUNU
    // -----------------------------------------------------------------------
    if (mode === 1) {
      // 1 tane doğru nesne seç
      const correctItem = matchingItems[Math.floor(Math.random() * matchingItems.length)] || 
        PURE_3D_SOLIDS.find(s => s.solidType === chosenSolidType)!;

      // 8 tane çeldirici seç (farklı cisimlerden)
      const shuffledNonMatch = shuffleArray(nonMatchingItems);
      const distractors = shuffledNonMatch.slice(0, 8);

      // 1 doğru + 8 çeldirici = 9 nesne (3x3 kare kart)
      const finalCard = shuffleArray([correctItem, ...distractors]);
      setSingleCardItems(finalCard);
      return;
    }

    // -----------------------------------------------------------------------
    // B) 2 VE 3 OYUNCU MODU: HEDEF GEOMETRİK CİSME UYAN NESNEYİ İLK BULAN KAZANIR!
    // -----------------------------------------------------------------------
    // Her oyuncunun kartında hedef geometrik cisme uyan birer nesne (ve 8'er çeldirici) bulunur
    const shuffledMatches = shuffleArray(matchingItems);
    const p1TargetItem = shuffledMatches[0] || PURE_3D_SOLIDS.find(s => s.solidType === chosenSolidType)!;
    // İster aynı ister farklı nesne olsun; yarışma heyecanı için ortak veya benzer olabilir
    const p2TargetItem = shuffledMatches[1 % shuffledMatches.length] || p1TargetItem;
    const p3TargetItem = shuffledMatches[2 % shuffledMatches.length] || p1TargetItem;

    const shuffledDistractors = shuffleArray(nonMatchingItems);
    const p1Distractors = shuffledDistractors.slice(0, 8);
    const p2Distractors = shuffledDistractors.slice(8, 16);
    const p3Distractors = shuffledDistractors.slice(16, 24);

    setP1Items(shuffleArray([p1TargetItem, ...p1Distractors]));
    setP2Items(shuffleArray([p2TargetItem, ...p2Distractors]));
    if (mode === 3) {
      setP3Items(shuffleArray([p3TargetItem, ...p3Distractors]));
    }
  }, [theme, activePlayerMode, getActivePool]);

  // Oyun başladığında veya tema/mod değiştiğinde yeni tur kur
  useEffect(() => {
    setupNewRound(theme, activePlayerMode);
  }, [setupNewRound, theme, activePlayerMode]);

  // Kazanma durumunda konfeti
  useEffect(() => {
    if (winner) {
      triggerSound('win');
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [winner, triggerSound]);

  // =========================================================================
  // 1 OYUNCU TIKLAMA MANTIĞI
  // =========================================================================
  const handleSingleItemClick = (item: GeometricSpotItem) => {
    if (winner || isTransitioningRef.current) return;

    // Tıklanan nesne hedef geometrik cisme uyuyor mu?
    const isCorrect = item.solidType === targetSolidType;

    if (isCorrect) {
      isTransitioningRef.current = true;
      triggerSound('correct');

      const targetDef = GEOMETRIC_SOLIDS[targetSolidType];
      setSingleFeedback({
        status: 'correct',
        itemId: item.id,
        message: `Harika! "${item.name}" bir ${targetDef?.name || ''} modelidir! 👏`
      });

      if (onQuestionAnswered) {
        onQuestionAnswered(true);
      }

      const nextScore = player1Score + 1;
      setPlayer1Score(nextScore);

      if (nextScore >= TARGET_WIN_SCORE) {
        setWinner('p1');
        setWinReason('score');
        return;
      }

      setTimeout(() => {
        setupNewRound(theme, 1);
      }, 1200);
    } else {
      triggerSound('wrong');

      const itemDef = GEOMETRIC_SOLIDS[item.solidType];
      setSingleFeedback({
        status: 'wrong',
        itemId: item.id,
        message: `Dikkat! "${item.name}" bir ${itemDef?.name || 'başka şekil'} modelidir.`
      });

      if (onQuestionAnswered) {
        onQuestionAnswered(false);
      }

      const nextMistakes = player1Mistakes + 1;
      setPlayer1Mistakes(nextMistakes);

      if (nextMistakes >= MAX_MISTAKES) {
        setWinner('p1');
        setWinReason('mistake');
        return;
      }

      setTimeout(() => {
        setSingleFeedback(prev => (prev.status === 'wrong' ? { status: null, itemId: null, message: '' } : prev));
      }, 1000);
    }
  };

  // =========================================================================
  // 2 VE 3 OYUNCU TIKLAMA MANTIĞI (HEDEF ŞEKLE UYAN NESNEYİ İLK BULAN KAZANIR!)
  // =========================================================================
  const handleMultiItemClick = (player: 'p1' | 'p2' | 'p3', item: GeometricSpotItem) => {
    if (winner || isTransitioningRef.current) return;

    // Tıklanan nesne hedef geometrik cisme uyuyor mu?
    const isCorrect = item.solidType === targetSolidType;

    if (isCorrect) {
      isTransitioningRef.current = true;
      triggerSound('correct');
      setFoundPlayer(player);
      setFoundItemId(item.id);

      if (onQuestionAnswered) {
        onQuestionAnswered(true);
      }

      if (player === 'p1') {
        const nextScore = player1Score + 1;
        setPlayer1Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setWinner('p1');
          setWinReason('score');
          return;
        }
      } else if (player === 'p2') {
        const nextScore = player2Score + 1;
        setPlayer2Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setWinner('p2');
          setWinReason('score');
          return;
        }
      } else if (player === 'p3') {
        const nextScore = player3Score + 1;
        setPlayer3Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setWinner('p3');
          setWinReason('score');
          return;
        }
      }

      setTimeout(() => {
        setupNewRound(theme, activePlayerMode);
      }, 1300);
    } else {
      triggerSound('wrong');

      if (player === 'p1') {
        setP1WrongId(item.id);
        const nextMistakes = player1Mistakes + 1;
        setPlayer1Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setWinner('p2');
          setWinReason('mistake');
          return;
        }
      } else if (player === 'p2') {
        setP2WrongId(item.id);
        const nextMistakes = player2Mistakes + 1;
        setPlayer2Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setWinner('p1');
          setWinReason('mistake');
          return;
        }
      } else if (player === 'p3') {
        setP3WrongId(item.id);
        const nextMistakes = player3Mistakes + 1;
        setPlayer3Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setWinner('p1');
          setWinReason('mistake');
          return;
        }
      }

      if (onQuestionAnswered) {
        onQuestionAnswered(false);
      }

      setTimeout(() => {
        if (player === 'p1') setP1WrongId(null);
        if (player === 'p2') setP2WrongId(null);
        if (player === 'p3') setP3WrongId(null);
      }, 800);
    }
  };

  const handleRestart = () => {
    triggerSound('click');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer3Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setPlayer3Mistakes(0);
    setWinner(null);
    setWinReason(null);
    setupNewRound(theme, activePlayerMode);
  };

  const handleThemeChange = (newTheme: GeometricThemeCategory) => {
    triggerSound('click');
    setTheme(newTheme);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer3Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setPlayer3Mistakes(0);
    setWinner(null);
    setWinReason(null);
    setupNewRound(newTheme, activePlayerMode);
  };

  const handleSwitchPlayerMode = (mode: 1 | 2 | 3) => {
    triggerSound('click');
    setActivePlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer3Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setPlayer3Mistakes(0);
    setWinner(null);
    setWinReason(null);
    setupNewRound(theme, mode);
  };

  // Öğrenci Çözümleme
  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;
  const p3Student = selectedStudentIds[2] ? students?.find(s => s.id === selectedStudentIds[2]) : null;

  const targetSolidDef = GEOMETRIC_SOLIDS[targetSolidType];

  // =========================================================================
  // NESNE İKONU RENDER EDİCİ (GERÇEK PNG / 3D İKON / SVG FALLBACK)
  // =========================================================================
  const renderItemGraphic = (item: GeometricSpotItem, sizeClass: string = "max-w-[62px] max-h-[62px]") => {
    if (item.imgSrc) {
      return (
        <img 
          src={item.imgSrc} 
          alt={item.name} 
          className={`w-full h-full ${sizeClass} object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] select-none pointer-events-none transition-transform group-hover:scale-105`} 
          loading="lazy"
        />
      );
    }

    if (item.is3DSolid) {
      return (
        <Solid3DIcon 
          solidType={item.solidType} 
          className={`w-full h-full ${sizeClass} object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]`} 
          size={50} 
        />
      );
    }

    return (
      <EverydayObjectGraphic 
        itemId={item.id} 
        className={`w-full h-full ${sizeClass} object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]`} 
        size={50} 
      />
    );
  };

  // =========================================================================
  // ÇOK OYUNCULU KARE KART RENDER EDİCİ (2 VE 3 OYUNCU)
  // =========================================================================
  const renderMultiSquareCard = (
    player: 'p1' | 'p2' | 'p3',
    items: GeometricSpotItem[],
    wrongId: string | null,
    isWinnerOfRound: boolean
  ) => {
    return (
      <div
        className={`relative w-full max-w-[min(44vw,46vh,360px)] aspect-square bg-white rounded-2xl sm:rounded-3xl border-4 sm:border-[5px] border-slate-900 shadow-[0_14px_45px_rgba(0,0,0,0.45)] overflow-hidden p-1 sm:p-2 transition-all duration-300 ${
          isWinnerOfRound ? 'ring-8 ring-emerald-400 scale-[1.02]' : ''
        }`}
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5 w-full h-full">
          {items.map((item, idx) => {
            const isFoundThis = foundItemId === item.id && isWinnerOfRound;
            const isWrong = wrongId === item.id;

            return (
              <button
                key={`${player}-${item.id}-${idx}`}
                onClick={() => handleMultiItemClick(player, item)}
                className={`relative aspect-square rounded-xl sm:rounded-2xl border-2 transition-all active:scale-95 hover:scale-102 flex flex-col items-center justify-center p-0.5 sm:p-1 cursor-pointer select-none group shadow-xs ${
                  isFoundThis
                    ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-400 animate-bounce z-20 shadow-xl'
                    : isWrong
                    ? 'bg-rose-100 border-rose-500 ring-4 ring-rose-400 animate-shake z-20'
                    : 'bg-slate-50 hover:bg-amber-50/90 border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
                title={item.name}
              >
                <div className="w-full flex-1 flex items-center justify-center min-h-0 pointer-events-none p-0.5">
                  {renderItemGraphic(item, "max-w-[54px] max-h-[54px]")}
                </div>

                <div className="w-full shrink-0 text-center px-0.5">
                  <span className="block text-[8px] sm:text-[9.5px] md:text-[10.5px] font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-amber-700">
                    {item.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden touch-none bg-slate-950 text-white">
      
      {/* 1. BACKGROUND IMAGE (/dere3.jpg) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
      </div>
      
      {/* ===================================================================== */}
      {/* 1. ÜST HEADER: SKOR, CANLAR VE MOD DETAYLARI */}
      {/* ===================================================================== */}
      <div className="shrink-0 w-full bg-slate-900/95 border-b border-white/10 px-3 py-1.5 sm:py-2 z-30 flex items-center justify-between shadow-md">
        
        {/* Sol Bilgi: 1. Oyuncu Canlar & Skor */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-white/15">
            <span className="text-[11px] font-bold text-rose-300 mr-1 hidden sm:inline">1. Oyuncu:</span>
            {[0, 1, 2].map((idx) => {
              const isAlive = idx < (MAX_MISTAKES - player1Mistakes);
              return (
                <span
                  key={idx}
                  className={`text-xs sm:text-sm transition-transform ${
                    !isAlive ? 'opacity-30 scale-90 grayscale' : 'scale-100'
                  }`}
                  title="Kalan Can"
                >
                  {isAlive ? '❤️' : '❌'}
                </span>
              );
            })}
          </div>

          <div className="bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-sm border border-amber-300 flex items-center gap-1.5">
            <span>🎯 {player1Score} / {TARGET_WIN_SCORE}</span>
            <span className="hidden md:inline text-[11px] opacity-80 font-bold">Puan</span>
          </div>

          {activePlayerMode !== 1 && (
            <div className="flex items-center gap-2 bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-400/40 text-blue-200 text-xs font-bold">
              <span>🔵 2. Oyuncu: {player2Score}</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2].map((idx) => {
                  const isAlive = idx < (MAX_MISTAKES - player2Mistakes);
                  return (
                    <span key={idx} className={!isAlive ? 'opacity-30 grayscale' : ''}>
                      {isAlive ? '❤️' : '❌'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {activePlayerMode === 3 && (
            <div className="flex items-center gap-2 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-400/40 text-emerald-200 text-xs font-bold">
              <span>🟢 3. Oyuncu: {player3Score}</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2].map((idx) => {
                  const isAlive = idx < (MAX_MISTAKES - player3Mistakes);
                  return (
                    <span key={idx} className={!isAlive ? 'opacity-30 grayscale' : ''}>
                      {isAlive ? '❤️' : '❌'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: 1-2-3 Mod Butonları & Seçili Öğrenci Rozeti */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1, 2, 3 PLAYER MODE SELECTOR BUTTONS */}
          <div className="flex items-center gap-1 bg-[#0b1328] p-0.5 rounded-xl border border-slate-700/80">
            {/* 1 OYUNCU */}
            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                handleSwitchPlayerMode(1);
              }}
              title="1 Oyuncu Modu"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activePlayerMode === 1
                  ? 'bg-blue-600/30 border border-blue-400 ring-2 ring-blue-400/60 shadow-[0_0_8px_rgba(96,165,250,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/1oy.png" alt="1 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>

            {/* 2 OYUNCU KAPIŞMA */}
            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                handleSwitchPlayerMode(2);
              }}
              title="2 Oyuncu Kapışma Modu"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activePlayerMode === 2
                  ? 'bg-rose-600/30 border border-rose-400 ring-2 ring-rose-400/60 shadow-[0_0_8px_rgba(244,63,94,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/2oy.png" alt="2 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>

            {/* 3 OYUNCU KAPIŞMA */}
            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                handleSwitchPlayerMode(3);
              }}
              title="3 Oyuncu Kapışma Modu"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activePlayerMode === 3
                  ? 'bg-emerald-600/30 border border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-105'
                  : 'opacity-60 hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              <img src="/3oy.png" alt="3 Oyuncu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none" />
            </button>
          </div>

          {p1Student ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-400/50 text-indigo-200 text-xs font-bold shadow-xs">
              <span>👤</span>
              <span className="truncate max-w-[120px]">{p1Student.name}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              {activePlayerMode === 1 ? '1 Oyuncu Modu' : `${activePlayerMode} Oyuncu Kapışma`}
            </span>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ORTAK SORU BANDI (HEM 1 HEM 2 HEM 3 KİŞİLİKTE ŞEKİL İSMİYLE DEV GÖZÜKÜR!) */}
      {/* ===================================================================== */}
      <div className="shrink-0 w-full bg-slate-900/90 border-b border-amber-400/40 px-3 py-1.5 sm:py-2 flex items-center justify-center shadow-md">
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 bg-black/60 border border-amber-400/80 px-3 sm:px-6 py-1 rounded-2xl shadow-[0_0_16px_rgba(245,158,11,0.2)]">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500/30 to-yellow-400/20 border-2 border-amber-400 flex items-center justify-center p-1 shrink-0 shadow-inner">
            <Solid3DIcon 
              solidType={targetSolidType} 
              className="w-full h-full max-w-[36px] max-h-[36px] object-contain filter drop-shadow-md" 
              size={34} 
            />
          </div>
          
          <div className="text-center sm:text-left">
            <div className="text-[9px] sm:text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <span>🎯 SORULAN GEOMETRİK ŞEKİL:</span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black text-[9px]">
                {activePlayerMode === 1 ? 'DOĞRUYU BUL' : 'İLK BULAN KAZANIR'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-base sm:text-2xl font-black text-white uppercase tracking-wide drop-shadow-sm">
                {targetSolidDef?.name || 'Geometrik Cisim'}
              </span>
              <span className="hidden sm:inline text-xs text-slate-300 font-semibold">
                — Kartındaki <b className="text-amber-300">{targetSolidDef?.name}</b> modeline benzeyen nesneye tıkla!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. OYUN ALANI (ORTA ALAN) */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden">
        
        {/* =================================================================== */}
        {/* A) 1 OYUNCU (TEK KİŞİLİK) MERKEZİ OYUN DÜZENİ */}
        {/* =================================================================== */}
        {activePlayerMode === 1 ? (
          <div className="w-full h-full flex flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1850px] mx-auto p-1 sm:p-2 overflow-hidden">
            {/* LEFT STUDENT SIDE GRID - SADECE 1 KİŞİLİK MODDA */}
            {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
              <div className="hidden xl:flex shrink-0 self-center">
                <StudentAvatarSideGrid
                  slotsStudents={leftStudents}
                  side="left"
                  count={students.length}
                  label="1. Grup (Sol)"
                  selectedStudentId={selectedStudentId || null}
                  onSelectStudent={onSelectStudent}
                  onOpenRosterModal={onOpenRosterModal}
                  playMp3={playMp3}
                />
              </div>
            )}

            {/* MERKEZİ TEK KİŞİLİK OYUN DÜZENİ */}
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-0 min-w-0 max-w-xl">
              {/* Geri Bildirim Mesajı (Doğru / Yanlış) */}
              {singleFeedback.message && (
                <div className={`shrink-0 mb-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black animate-fadeIn ${
                  singleFeedback.status === 'correct' 
                    ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300' 
                    : 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-300 animate-shake'
                }`}>
                  {singleFeedback.message}
                </div>
              )}

              {/* TEK KİŞİLİK 3x3 KARE KART */}
              <div className="relative w-full max-w-[min(88vw,48vh,380px)] aspect-square bg-white rounded-2xl sm:rounded-3xl border-4 sm:border-[5px] border-slate-900 shadow-[0_16px_50px_rgba(0,0,0,0.6)] overflow-hidden p-2 sm:p-2.5 transition-all">
                <div className="grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2 w-full h-full">
                  {singleCardItems.map((item, idx) => {
                    const isSelectedCorrect = singleFeedback.status === 'correct' && singleFeedback.itemId === item.id;
                    const isSelectedWrong = singleFeedback.status === 'wrong' && singleFeedback.itemId === item.id;

                    return (
                      <button
                        key={`single-${item.id}-${idx}`}
                        onClick={() => handleSingleItemClick(item)}
                        className={`relative aspect-square rounded-xl sm:rounded-2xl border-2 transition-all active:scale-95 hover:scale-102 flex flex-col items-center justify-center p-1 sm:p-1.5 cursor-pointer select-none group shadow-xs ${
                          isSelectedCorrect
                            ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-400 animate-bounce z-20 shadow-xl'
                            : isSelectedWrong
                            ? 'bg-rose-100 border-rose-500 ring-4 ring-rose-400 animate-shake z-20'
                            : 'bg-slate-50 hover:bg-amber-50/90 border-slate-200 hover:border-amber-400 hover:shadow-md'
                        }`}
                        title={item.name}
                      >
                        <div className="w-full flex-1 flex items-center justify-center min-h-0 pointer-events-none p-0.5">
                          {renderItemGraphic(item, "max-w-[58px] max-h-[58px]")}
                        </div>

                        <div className="w-full shrink-0 text-center px-0.5 mt-0.5">
                          <span className="block text-[8px] sm:text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-amber-700">
                            {item.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT STUDENT SIDE GRID - SADECE 1 KİŞİLİK MODDA */}
            {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
              <div className="hidden xl:flex shrink-0 self-center">
                <StudentAvatarSideGrid
                  slotsStudents={rightStudents}
                  side="right"
                  count={students.length}
                  label="2. Grup (Sağ)"
                  selectedStudentId={selectedStudentId || null}
                  onSelectStudent={onSelectStudent}
                  onOpenRosterModal={onOpenRosterModal}
                  playMp3={playMp3}
                />
              </div>
            )}
          </div>
        ) : (
          /* =================================================================== */
          /* B) 2 VE 3 OYUNCU (KAPIŞMA / ŞEKLE GÖRE YARIŞMA) DÜZENİ */
          /* =================================================================== */
          <div className="w-full h-full flex flex-row">
            {/* SOL YARI: KIRMIZI ALAN (1. OYUNCU) */}
            <div className={`${activePlayerMode === 3 ? 'w-1/3' : 'w-1/2'} h-full bg-[#df4a42] flex flex-col items-center justify-center p-2 sm:p-3 border-r-2 border-black/30 relative overflow-hidden`}>
              <div className="mb-1.5 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 text-white font-black text-[10px] sm:text-xs tracking-wider uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
                  <span>🔴 {p1Student ? p1Student.name : '1. Oyuncu (Kırmızı)'}</span>
                  <span className="text-amber-300">({player1Score} Puan)</span>
                </span>
              </div>
              {renderMultiSquareCard('p1', p1Items, p1WrongId, foundPlayer === 'p1')}
            </div>

            {/* SAĞ YARI: MAVİ ALAN (2. OYUNCU) */}
            <div className={`${activePlayerMode === 3 ? 'w-1/3' : 'w-1/2'} h-full bg-[#399ae2] flex flex-col items-center justify-center p-2 sm:p-3 relative overflow-hidden ${activePlayerMode === 3 ? 'border-r-2 border-black/30' : ''}`}>
              <div className="mb-1.5 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 text-white font-black text-[10px] sm:text-xs tracking-wider uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
                  <span>🔵 {p2Student ? p2Student.name : '2. Oyuncu (Mavi)'}</span>
                  <span className="text-amber-300">({player2Score} Puan)</span>
                </span>
              </div>
              {renderMultiSquareCard('p2', p2Items, p2WrongId, foundPlayer === 'p2')}
            </div>

            {/* 3. ALAN: YEŞİL ALAN (3. OYUNCU) */}
            {activePlayerMode === 3 && (
              <div className="w-1/3 h-full bg-[#10b981] flex flex-col items-center justify-center p-2 sm:p-3 relative overflow-hidden">
                <div className="mb-1.5 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 text-white font-black text-[10px] sm:text-xs tracking-wider uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
                    <span>🟢 {p3Student ? p3Student.name : '3. Oyuncu (Yeşil)'}</span>
                    <span className="text-amber-300">({player3Score} Puan)</span>
                  </span>
                </div>
                {renderMultiSquareCard('p3', p3Items, p3WrongId, foundPlayer === 'p3')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. ALT BÖLGE: ÖĞRENCİ DOCK PANELİ VE MOD / TEMA / ÇIKIŞ BUTONLARI */}
      {/* ===================================================================== */}
      <div className="shrink-0 w-full bg-slate-950/95 border-t border-white/10 flex flex-col items-center justify-center z-30 pt-1 pb-1.5 px-2 gap-1">
        
        {/* ÖĞRENCİ DOCK PANELİ - SADECE 2 VE 3 KİŞİLİK MODDA */}
        {activePlayerMode >= 2 && students && students.length > 0 && onOpenRosterModal && (
          <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
            <StudentAvatarDock
              students={students}
              currentGrade={2}
              playerCount={activePlayerMode}
              selectedStudentIds={selectedStudentIds || []}
              onSelectStudentForPlayer={(pIdx, sId) => {
                if (onSelectStudentForPlayer) {
                  onSelectStudentForPlayer(pIdx, sId);
                } else if (onSelectStudent) {
                  onSelectStudent(sId);
                }
              }}
              onOpenRosterModal={(grade) => {
                if (onOpenRosterModal) onOpenRosterModal(grade || 2);
              }}
              playMp3={playMp3}
            />
          </div>
        )}

        {/* TEMALAR VE ÇIKIŞ KONTROL ÇUBUĞU */}
        <div className="flex items-center gap-1 sm:gap-2 max-w-[98vw] overflow-x-auto py-0.5 scrollbar-none">
          {/* Tema Filtreleri */}
          <div className="bg-black/75 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-lg shrink-0">
            <button
              onClick={() => handleThemeChange('all')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                theme === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🌟 Tümü
            </button>
            <button
              onClick={() => handleThemeChange('3d_cisimler')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                theme === '3d_cisimler'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🧊 3D Cisimler
            </button>
            <button
              onClick={() => handleThemeChange('gunluk_esya')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                theme === 'gunluk_esya'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🎲 Günlük Eşyalar
            </button>
            <button
              onClick={() => handleThemeChange('prizmalar')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                theme === 'prizmalar'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📦 Prizmalar
            </button>
            <button
              onClick={() => handleThemeChange('yuvarlak')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                theme === 'yuvarlak'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              ⚽ Yuvarlak
            </button>
          </div>

          {/* İleri / Geri ve Ana Sayfa Butonları */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onPrevActivity && (
              <button
                onClick={() => {
                  triggerSound('click');
                  onPrevActivity();
                }}
                title="Önceki Etkinliğe Geç"
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
              >
                <SkipBack size={13} />
                <span className="hidden md:inline">Önceki</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerSound('click');
                if (onGoHome) {
                  onGoHome();
                } else {
                  onClose();
                }
              }}
              title="Ana Sayfaya Dön"
              className="bg-white hover:bg-slate-100 active:scale-95 text-slate-900 px-3 sm:px-4 py-1 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.35)] border-2 border-slate-900 cursor-pointer transition-all flex items-center gap-1"
            >
              <Home size={14} className="stroke-[3]" />
              <span>ANA SAYFA</span>
            </button>

            {onNextActivity && (
              <button
                onClick={() => {
                  triggerSound('click');
                  onNextActivity();
                }}
                title="Sonraki Etkinliğe Geç"
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs shadow-md border border-slate-600 cursor-pointer transition-all flex items-center gap-1"
              >
                <span className="hidden md:inline">Sonraki</span>
                <SkipForward size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. KAZANAN MODALI (ŞAMPİYON POPUP) */}
      {/* ===================================================================== */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(250,204,21,0.5)] animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <Trophy size={42} className="text-slate-950 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
              {activePlayerMode === 1
                ? (winReason === 'mistake' ? 'Oyun Bitti!' : (p1Student ? `${p1Student.name} Tebrikler!` : 'Harika! Şampiyonsun!'))
                : winner === 'p1' 
                ? (p1Student ? `${p1Student.name} Şampiyon!` : '1. Oyuncu Kazandı!') 
                : winner === 'p2' 
                ? (p2Student ? `${p2Student.name} Şampiyon!` : '2. Oyuncu Kazandı!')
                : (p3Student ? `${p3Student.name} Şampiyon!` : '3. Oyuncu Kazandı!')}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mb-5">
              {winReason === 'mistake' ? (
                activePlayerMode === 1 ? (
                  <span className="text-rose-400 font-bold">
                    3 hata hakkın bitti! Tekrar deneyerek şampiyon olabilirsin.
                  </span>
                ) : (
                  <>
                    <span className="text-rose-400 font-bold">
                      Rakip oyuncu 3 hata yaptığı için elendi!
                    </span>{' '}
                    Maç galibiyetle tamamlandı!
                  </>
                )
              ) : (
                <>
                  <span className="text-emerald-400 font-bold">{TARGET_WIN_SCORE} Doğru hedefine</span> başarıyla ulaşıldı!
                </>
              )}
            </p>

            {/* Skor Tablosu */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 mb-6 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-amber-400 font-bold uppercase">
                  {activePlayerMode === 1 ? 'Senin Skorun' : '1. Oyuncu (Kırmızı)'}
                </div>
                <div className="text-2xl font-black text-white mt-0.5">{player1Score} Doğru</div>
                <div className="text-[11px] text-slate-400">{player1Mistakes} Hata</div>
              </div>

              {activePlayerMode !== 1 && (
                <>
                  <div className="w-px h-10 bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xs text-sky-400 font-bold uppercase">2. Oyuncu (Mavi)</div>
                    <div className="text-2xl font-black text-white mt-0.5">{player2Score} Doğru</div>
                    <div className="text-[11px] text-slate-400">{player2Mistakes} Hata</div>
                  </div>
                </>
              )}

              {activePlayerMode === 3 && (
                <>
                  <div className="w-px h-10 bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xs text-emerald-400 font-bold uppercase">3. Oyuncu (Yeşil)</div>
                    <div className="text-2xl font-black text-white mt-0.5">{player3Score} Doğru</div>
                    <div className="text-[11px] text-slate-400">{player3Mistakes} Hata</div>
                  </div>
                </>
              )}
            </div>

            {/* Butonlar */}
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
                  onClick={() => {
                    if (onGoHome) onGoHome();
                    else onClose();
                  }}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Home size={18} />
                  <span>Ana Sayfa</span>
                </button>
              </div>

              {(onPrevActivity || onNextActivity) && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  {onPrevActivity && (
                    <button
                      onClick={onPrevActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <SkipBack size={14} />
                      <span>Önceki Etkinlik</span>
                    </button>
                  )}
                  {onNextActivity && (
                    <button
                      onClick={onNextActivity}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
