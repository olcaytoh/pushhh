import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Users,
  User,
  Trophy,
  Sparkles,
  Eye,
  EyeOff,
  HelpCircle,
  Shuffle,
  Clock,
  CheckCircle2,
  Lightbulb,
  X,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { ActivityBackground } from './ActivityBackground';
import { StudentAvatarDock } from './StudentAvatarDock';
import { Student } from '../types/student';
import { useAppLanguage } from '../utils/appLanguage';

// ============================================================
// Q-BITZ TİP TANIMLARI VE KÜP YÜZEYLERİ
// ============================================================

/**
 * Gerçek Q-Bitz küpünün 6 yüzü, döndürmelerle 8 görsel duruma karşılık gelir:
 * 0: Boş Beyaz Yüzey
 * 1: Tam Renkli Yüzey
 * 2: Beyaz Zemin Üzerinde Renkli Daire
 * 3: Renkli Zemin Üzerinde Beyaz Daire
 * 4: Sol-Üst Üçgen (köşegen)
 * 5: Sağ-Üst Üçgen (köşegen)
 * 6: Sağ-Alt Üçgen (köşegen)
 * 7: Sol-Alt Üçgen (köşegen)
 */
export type QBitzFace = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type CellValue = QBitzFace | null;
type GridSize = 3 | 4;
type PlayerMode = 1 | 2;
type RoundRule = 'speed' | 'memory';

interface QBitzPattern {
  id: string;
  name: string;
  nameEn: string;
  size: GridSize;
  cells: QBitzFace[];
}

export interface QBitzGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

const ALL_FACES: QBitzFace[] = [0, 1, 2, 3, 4, 5, 6, 7];

const FACE_LABELS: Record<QBitzFace, { tr: string; en: string }> = {
  0: { tr: 'Boş Beyaz', en: 'White' },
  1: { tr: 'Tam Dolu', en: 'Solid' },
  2: { tr: 'Renkli Nokta', en: 'Color Dot' },
  3: { tr: 'Beyaz Nokta', en: 'White Dot' },
  4: { tr: 'Sol-Üst Üçgen', en: 'Top-Left' },
  5: { tr: 'Sağ-Üst Üçgen', en: 'Top-Right' },
  6: { tr: 'Sağ-Alt Üçgen', en: 'Bottom-Right' },
  7: { tr: 'Sol-Alt Üçgen', en: 'Bottom-Left' },
};

const isTriangleFace = (f: QBitzFace): boolean => f >= 4 && f <= 7;
const rotateTriangleCW = (f: QBitzFace): QBitzFace => {
  if (f === 4) return 5;
  if (f === 5) return 6;
  if (f === 6) return 7;
  if (f === 7) return 4;
  return f;
};

// ============================================================
// ÖZENLE SEÇİLMİŞ 3x3 VE 4x4 Q-BITZ DESEN KARTLARI
// ============================================================

const PATTERNS_3X3: QBitzPattern[] = [
  {
    id: 'p3_diamond',
    name: 'Küçük Elmas',
    nameEn: 'Mini Diamond',
    size: 3,
    cells: [
      6, 1, 7,
      1, 3, 1,
      5, 1, 4,
    ],
  },
  {
    id: 'p3_pinwheel',
    name: 'Rüzgar Gülü',
    nameEn: 'Pinwheel',
    size: 3,
    cells: [
      5, 4, 7,
      7, 2, 5,
      5, 6, 4,
    ],
  },
  {
    id: 'p3_butterfly',
    name: 'Kelebek',
    nameEn: 'Butterfly',
    size: 3,
    cells: [
      4, 2, 5,
      1, 3, 1,
      7, 2, 6,
    ],
  },
  {
    id: 'p3_crown',
    name: 'Kral Tacı',
    nameEn: 'Royal Crown',
    size: 3,
    cells: [
      7, 2, 6,
      1, 1, 1,
      3, 1, 3,
    ],
  },
  {
    id: 'p3_hourglass',
    name: 'Kum Saati',
    nameEn: 'Hourglass',
    size: 3,
    cells: [
      1, 1, 1,
      5, 3, 4,
      1, 1, 1,
    ],
  },
  {
    id: 'p3_star',
    name: 'Parlayan Yıldız',
    nameEn: 'Shining Star',
    size: 3,
    cells: [
      6, 3, 7,
      3, 2, 3,
      5, 3, 4,
    ],
  },
  {
    id: 'p3_house',
    name: 'Küçük Ev',
    nameEn: 'Little House',
    size: 3,
    cells: [
      6, 1, 7,
      1, 3, 1,
      1, 0, 1,
    ],
  },
  {
    id: 'p3_target',
    name: 'Hedef Tahtası',
    nameEn: 'Bullseye',
    size: 3,
    cells: [
      2, 1, 2,
      1, 3, 1,
      2, 1, 2,
    ],
  },
  {
    id: 'p3_bowtie',
    name: 'Papyon',
    nameEn: 'Bowtie',
    size: 3,
    cells: [
      7, 0, 6,
      1, 2, 1,
      4, 0, 5,
    ],
  },
  {
    id: 'p3_arrow',
    name: 'Roket Ucu',
    nameEn: 'Rocket Tip',
    size: 3,
    cells: [
      6, 1, 7,
      0, 3, 0,
      7, 2, 6,
    ],
  },
  {
    id: 'p3_flower',
    name: 'Papatya',
    nameEn: 'Daisy',
    size: 3,
    cells: [
      2, 3, 2,
      3, 1, 3,
      2, 3, 2,
    ],
  },
  {
    id: 'p3_frame',
    name: 'Sihirli Çerçeve',
    nameEn: 'Magic Frame',
    size: 3,
    cells: [
      4, 1, 5,
      1, 2, 1,
      7, 1, 6,
    ],
  },
];

const PATTERNS_4X4: QBitzPattern[] = [
  {
    id: 'p4_diamond_star',
    name: 'Elmas Yıldız',
    nameEn: 'Diamond Star',
    size: 4,
    cells: [
      0, 6, 7, 0,
      6, 3, 3, 7,
      5, 3, 3, 4,
      0, 5, 4, 0,
    ],
  },
  {
    id: 'p4_butterfly',
    name: 'Kelebek Kanadı',
    nameEn: 'Butterfly Wings',
    size: 4,
    cells: [
      4, 7, 6, 5,
      1, 3, 3, 1,
      1, 2, 2, 1,
      7, 4, 5, 6,
    ],
  },
  {
    id: 'p4_windmill',
    name: 'Rüzgar Gülü',
    nameEn: 'Windmill',
    size: 4,
    cells: [
      0, 6, 7, 1,
      4, 2, 1, 7,
      5, 1, 2, 6,
      1, 5, 4, 0,
    ],
  },
  {
    id: 'p4_castle',
    name: 'Kale Burcu',
    nameEn: 'Castle Tower',
    size: 4,
    cells: [
      1, 0, 0, 1,
      1, 3, 3, 1,
      1, 1, 1, 1,
      3, 7, 6, 3,
    ],
  },
  {
    id: 'p4_hourglass',
    name: 'Büyük Kum Saati',
    nameEn: 'Grand Hourglass',
    size: 4,
    cells: [
      1, 1, 1, 1,
      5, 6, 7, 4,
      6, 5, 4, 7,
      1, 1, 1, 1,
    ],
  },
  {
    id: 'p4_compass',
    name: 'Altın Pusula',
    nameEn: 'Golden Compass',
    size: 4,
    cells: [
      2, 6, 7, 2,
      6, 1, 1, 7,
      5, 1, 1, 4,
      2, 5, 4, 2,
    ],
  },
  {
    id: 'p4_rocket',
    name: 'Uzay Roketi',
    nameEn: 'Space Rocket',
    size: 4,
    cells: [
      0, 6, 7, 0,
      6, 3, 3, 7,
      1, 1, 1, 1,
      5, 2, 2, 4,
    ],
  },
  {
    id: 'p4_owl',
    name: 'Gece Baykuşu',
    nameEn: 'Night Owl',
    size: 4,
    cells: [
      7, 0, 0, 6,
      1, 3, 3, 1,
      5, 6, 7, 4,
      0, 2, 2, 0,
    ],
  },
  {
    id: 'p4_shield',
    name: 'Kahraman Kalkanı',
    nameEn: 'Hero Shield',
    size: 4,
    cells: [
      4, 1, 1, 5,
      1, 2, 2, 1,
      5, 3, 3, 4,
      0, 5, 4, 0,
    ],
  },
  {
    id: 'p4_sunburst',
    name: 'Güneş Çiçeği',
    nameEn: 'Sunburst',
    size: 4,
    cells: [
      6, 2, 2, 7,
      2, 3, 3, 2,
      2, 3, 3, 2,
      5, 2, 2, 4,
    ],
  },
  {
    id: 'p4_bowtie',
    name: 'Büyük Papyon',
    nameEn: 'Grand Bowtie',
    size: 4,
    cells: [
      7, 0, 0, 6,
      1, 7, 6, 1,
      1, 4, 5, 1,
      4, 0, 0, 5,
    ],
  },
  {
    id: 'p4_pyramid',
    name: 'Mısır Piramidi',
    nameEn: 'Pyramid',
    size: 4,
    cells: [
      2, 0, 0, 2,
      0, 6, 7, 0,
      6, 3, 3, 7,
      1, 1, 1, 1,
    ],
  },
  {
    id: 'p4_frame',
    name: 'Mücevher Çerçeve',
    nameEn: 'Jewel Frame',
    size: 4,
    cells: [
      4, 1, 1, 5,
      1, 0, 0, 1,
      1, 2, 2, 1,
      7, 1, 1, 6,
    ],
  },
  {
    id: 'p4_robot',
    name: 'Akıllı Robot',
    nameEn: 'Smart Robot',
    size: 4,
    cells: [
      0, 2, 2, 0,
      1, 3, 3, 1,
      7, 1, 1, 6,
      1, 0, 0, 1,
    ],
  },
  {
    id: 'p4_crystal',
    name: 'Buz Kristali',
    nameEn: 'Ice Crystal',
    size: 4,
    cells: [
      4, 5, 4, 5,
      7, 3, 3, 6,
      4, 3, 3, 5,
      7, 6, 7, 6,
    ],
  },
  {
    id: 'p4_cat',
    name: 'Sevimli Kedi',
    nameEn: 'Cute Cat',
    size: 4,
    cells: [
      7, 0, 0, 6,
      1, 2, 2, 1,
      1, 3, 3, 1,
      5, 1, 1, 4,
    ],
  },
  {
    id: 'p4_checker_dots',
    name: 'Nokta Mozaik',
    nameEn: 'Dot Mosaic',
    size: 4,
    cells: [
      3, 2, 3, 2,
      2, 1, 1, 3,
      3, 1, 1, 2,
      2, 3, 2, 3,
    ],
  },
  {
    id: 'p4_crown',
    name: 'İmparator Tacı',
    nameEn: 'Emperor Crown',
    size: 4,
    cells: [
      7, 6, 7, 6,
      1, 3, 3, 1,
      1, 1, 1, 1,
      2, 1, 1, 2,
    ],
  },
  {
    id: 'p4_arrows',
    name: 'İkiz Oklar',
    nameEn: 'Twin Arrows',
    size: 4,
    cells: [
      6, 1, 1, 5,
      5, 2, 2, 4,
      6, 2, 2, 7,
      4, 1, 1, 6,
    ],
  },
  {
    id: 'p4_sailboat',
    name: 'Yelkenli Gemi',
    nameEn: 'Sailboat',
    size: 4,
    cells: [
      0, 6, 1, 0,
      6, 1, 1, 0,
      1, 1, 1, 7,
      5, 3, 3, 4,
    ],
  },
];

// Yatay aynalama yardımcısı (simetrik rastgele desen üretimi için)
const mirrorFaceHorizontal = (f: QBitzFace): QBitzFace => {
  if (f === 4) return 5;
  if (f === 5) return 4;
  if (f === 6) return 7;
  if (f === 7) return 6;
  return f;
};

// Dikey aynalama yardımcısı
const mirrorFaceVertical = (f: QBitzFace): QBitzFace => {
  if (f === 4) return 7;
  if (f === 7) return 4;
  if (f === 5) return 6;
  if (f === 6) return 5;
  return f;
};

/**
 * Estetik 4 yönlü veya yatay simetrik rastgele Q-Bitz deseni üretir
 */
const generateSymmetricPattern = (size: GridSize, seqNum: number): QBitzPattern => {
  const cells: QBitzFace[] = Array(size * size).fill(0);
  const halfRows = Math.ceil(size / 2);
  const halfCols = Math.ceil(size / 2);
  const fourWay = Math.random() > 0.35;

  // Ağırlıklı yüzey havuzu (çok fazla boş beyaz olmaması için)
  const pool: QBitzFace[] = [0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 4, 5, 6, 7];

  for (let r = 0; r < (fourWay ? halfRows : size); r++) {
    for (let c = 0; c < halfCols; c++) {
      const f = pool[Math.floor(Math.random() * pool.length)];
      cells[r * size + c] = f;
      const mc = size - 1 - c;
      if (mc !== c) {
        cells[r * size + mc] = mirrorFaceHorizontal(f);
      }
      if (fourWay) {
        const mr = size - 1 - r;
        if (mr !== r) {
          cells[mr * size + c] = mirrorFaceVertical(f);
          if (mc !== c) {
            cells[mr * size + mc] = mirrorFaceHorizontal(mirrorFaceVertical(f));
          }
        }
      }
    }
  }

  return {
    id: `gen_${size}_${seqNum}_${Date.now()}`,
    name: `Özel Desen #${seqNum}`,
    nameEn: `Custom Pattern #${seqNum}`,
    size,
    cells,
  };
};

// ============================================================
// TACTILE Q-BITZ KÜP YÜZEYİ BİLEŞENİ (SVG)
// ============================================================

interface QBitzTileSvgProps {
  face: QBitzFace;
  color: string;
  bgColor?: string;
}

const QBitzTileSvg: React.FC<QBitzTileSvgProps> = React.memo(
  ({ face, color, bgColor = '#FFFFFF' }) => {
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full block pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* Taban */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={face === 1 || face === 3 ? color : bgColor}
        />
        {/* Renkli Daire (Beyaz Üzerinde) */}
        {face === 2 && <circle cx="50" cy="50" r="30" fill={color} />}
        {/* Beyaz Daire (Renkli Üzerinde) */}
        {face === 3 && <circle cx="50" cy="50" r="30" fill={bgColor} />}
        {/* Sol-Üst Üçgen */}
        {face === 4 && <polygon points="0,0 100,0 0,100" fill={color} />}
        {/* Sağ-Üst Üçgen */}
        {face === 5 && <polygon points="0,0 100,0 100,100" fill={color} />}
        {/* Sağ-Alt Üçgen */}
        {face === 6 && <polygon points="100,0 100,100 0,100" fill={color} />}
        {/* Sol-Alt Üçgen */}
        {face === 7 && <polygon points="0,0 100,100 0,100" fill={color} />}
      </svg>
    );
  }
);

// ============================================================
// HAFİF SES SENTEZLEYİCİ (TAHTA KÜP TIKIRTI SESİ)
// ============================================================
let audioCtxSingleton: AudioContext | null = null;
const playWoodClick = (pitch = 520) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxSingleton) audioCtxSingleton = new AudioCtx();
    if (audioCtxSingleton.state === 'suspended') {
      audioCtxSingleton.resume().catch(() => {});
    }
    const now = audioCtxSingleton.currentTime;
    const osc = audioCtxSingleton.createOscillator();
    const gain = audioCtxSingleton.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, now + 0.055);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(audioCtxSingleton.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  } catch {
    // Ses bağlamı engellenirse sessiz devam et
  }
};

// ============================================================
// ANA Q-BITZ OYUN BİLEŞENİ
// ============================================================

export const QBitzGame: React.FC<QBitzGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students = [],
  selectedStudentIds = [null, null, null],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onGameCompleted,
}) => {
  const { effectiveLang } = useAppLanguage();
  const isEn = effectiveLang === 'en';

  // Oyun ayarları
  const [playerMode, setPlayerMode] = useState<PlayerMode>(2);
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [roundRule, setRoundRule] = useState<RoundRule>('speed');
  const [targetScore, setTargetScore] = useState<3 | 5>(3);
  const [showLiveHints, setShowLiveHints] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Desen destesi & aktif kart
  const [patternIndex, setPatternIndex] = useState<number>(0);
  const [customSeq, setCustomSeq] = useState<number>(1);
  const [currentPattern, setCurrentPattern] = useState<QBitzPattern>(() => PATTERNS_4X4[0]);

  // Skorlar & tur durumu
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundWinner, setRoundWinner] = useState<0 | 1 | null>(null);
  const [matchWinner, setMatchWinner] = useState<0 | 1 | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [soloBestSec, setSoloBestSec] = useState<number | null>(null);

  // Hafıza turu sayaçları
  const [memorySecondsLeft, setMemorySecondsLeft] = useState<number>(0);
  const [isCardHidden, setIsCardHidden] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const peekTimeoutRef = useRef<number | null>(null);

  // 2 Oyuncunun birbirinden tamamen bağımsız tahtaları ve seçili küp yüzeyleri
  const createEmptyBoard = useCallback((sz: GridSize): CellValue[] => Array(sz * sz).fill(null), []);
  const [p1Board, setP1Board] = useState<CellValue[]>(() => createEmptyBoard(4));
  const [p2Board, setP2Board] = useState<CellValue[]>(() => createEmptyBoard(4));
  const [p1SelectedFace, setP1SelectedFace] = useState<QBitzFace>(1);
  const [p2SelectedFace, setP2SelectedFace] = useState<QBitzFace>(1);

  // Son tıklanan hücre pop animasyonu
  const [p1LastCell, setP1LastCell] = useState<number | null>(null);
  const [p2LastCell, setP2LastCell] = useState<number | null>(null);

  // Öğrenci isimleri
  const p1Student = useMemo(
    () => (selectedStudentIds[0] ? students.find((s) => s.id === selectedStudentIds[0]) : null),
    [students, selectedStudentIds]
  );
  const p2Student = useMemo(
    () => (selectedStudentIds[1] ? students.find((s) => s.id === selectedStudentIds[1]) : null),
    [students, selectedStudentIds]
  );

  const p1Name = p1Student?.name || (playerMode === 1 ? (isEn ? 'Player' : 'Oyuncu') : isEn ? 'Player 1' : '1. Oyuncu');
  const p2Name = p2Student?.name || (isEn ? 'Player 2' : '2. Oyuncu');

  // Hafıza modu geri sayımı
  const triggerMemoryCountdown = useCallback((rule: RoundRule, sz: GridSize) => {
    if (peekTimeoutRef.current) {
      window.clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    setIsPeeking(false);
    if (rule === 'memory') {
      setIsCardHidden(false);
      setMemorySecondsLeft(sz === 3 ? 8 : 10);
    } else {
      setIsCardHidden(false);
      setMemorySecondsLeft(0);
    }
  }, []);

  useEffect(() => {
    if (roundRule !== 'memory' || roundWinner !== null || matchWinner !== null) return;
    if (memorySecondsLeft <= 0) return;

    const id = window.setTimeout(() => {
      if (memorySecondsLeft <= 1) {
        setMemorySecondsLeft(0);
        setIsCardHidden(true);
        playMp3?.('/op.mp3');
      } else {
        setMemorySecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [memorySecondsLeft, roundRule, roundWinner, matchWinner, playMp3]);

  // Tur kronometresi
  useEffect(() => {
    if (roundWinner !== null || matchWinner !== null) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [roundWinner, matchWinner]);

  // Temizleme
  useEffect(() => {
    return () => {
      if (peekTimeoutRef.current) window.clearTimeout(peekTimeoutRef.current);
    };
  }, []);

  // Yeni tura başla
  const startNextRound = useCallback(
    (opts?: {
      newSize?: GridSize;
      newRule?: RoundRule;
      newMode?: PlayerMode;
      resetMatch?: boolean;
      randomCard?: boolean;
    }) => {
      const sz = opts?.newSize ?? gridSize;
      const rule = opts?.newRule ?? roundRule;
      const resetMatch = opts?.resetMatch ?? false;

      const nextIdx = resetMatch ? 0 : patternIndex + 1;
      const deck = sz === 3 ? PATTERNS_3X3 : PATTERNS_4X4;
      const pat = opts?.randomCard
        ? generateSymmetricPattern(sz, customSeq + 1)
        : nextIdx < deck.length
          ? deck[nextIdx]
          : generateSymmetricPattern(sz, customSeq + 1);

      if (opts?.randomCard || nextIdx >= deck.length) {
        setCustomSeq((c) => c + 1);
      }
      setPatternIndex(resetMatch ? 0 : nextIdx);
      setCurrentPattern(pat);
      setP1Board(createEmptyBoard(sz));
      setP2Board(createEmptyBoard(sz));
      setRoundWinner(null);
      setElapsedSec(0);
      setP1LastCell(null);
      setP2LastCell(null);

      if (resetMatch) {
        setScores([0, 0]);
        setRoundNumber(1);
        setMatchWinner(null);
      } else {
        setRoundNumber((r) => r + 1);
      }

      triggerMemoryCountdown(rule, sz);
    },
    [gridSize, roundRule, patternIndex, customSeq, createEmptyBoard, triggerMemoryCountdown]
  );

  // Eşleşme sayısı hesapla (boş slot null ise beyaz 0 ile eşleşmez — oyuncunun kasıtlı koyması gerekir)
  const countMatches = useCallback(
    (board: CellValue[], target: QBitzFace[]): number => {
      let count = 0;
      for (let i = 0; i < target.length; i++) {
        if (board[i] === target[i]) count++;
      }
      return count;
    },
    []
  );

  const totalCells = gridSize * gridSize;
  const p1Matches = useMemo(() => countMatches(p1Board, currentPattern.cells), [p1Board, currentPattern.cells, countMatches]);
  const p2Matches = useMemo(() => countMatches(p2Board, currentPattern.cells), [p2Board, currentPattern.cells, countMatches]);

  // Kazanma tetikleyici
  const triggerRoundWin = useCallback(
    (winnerIdx: 0 | 1) => {
      if (roundWinner !== null || matchWinner !== null) return;
      setRoundWinner(winnerIdx);
      setIsCardHidden(false);
      playMp3?.('/alkis.mp3');

      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { x: winnerIdx === 0 ? (playerMode === 1 ? 0.5 : 0.25) : 0.75, y: 0.55 },
          colors: winnerIdx === 0 ? ['#2563EB', '#60A5FA', '#FACC15', '#FFFFFF'] : ['#E11D48', '#FB7185', '#FACC15', '#FFFFFF'],
        });
      } catch {
        // Konfeti hata verirse yoksay
      }

      if (playerMode === 1) {
        setSoloBestSec((prev) => (prev === null || elapsedSec < prev ? elapsedSec : prev));
        setScores(([s1, s2]) => [s1 + 1, s2]);
        onGameCompleted?.(0, 1);
        return;
      }

      setScores(([s1, s2]) => {
        const next: [number, number] = winnerIdx === 0 ? [s1 + 1, s2] : [s1, s2 + 1];
        if (next[winnerIdx] >= targetScore) {
          setMatchWinner(winnerIdx);
          onGameCompleted?.(winnerIdx, 2);
        }
        return next;
      });
    },
    [roundWinner, matchWinner, playMp3, playerMode, elapsedSec, targetScore, onGameCompleted]
  );

  // Hücreye tıklama (dokunmatik akıllı tahta için sıfır gecikmeli)
  const handleCellTap = useCallback(
    (player: 0 | 1, cellIdx: number) => {
      if (roundWinner !== null || matchWinner !== null) return;
      // Hafıza modunda geri sayım sürerken tahtaya erken koymayı engelleyelim ki önce deseni incelesinler
      if (roundRule === 'memory' && memorySecondsLeft > 0) return;

      const selectedFace = player === 0 ? p1SelectedFace : p2SelectedFace;
      const setBoard = player === 0 ? setP1Board : setP2Board;
      const setLastCell = player === 0 ? setP1LastCell : setP2LastCell;

      playWoodClick(player === 0 ? 540 : 470);
      setLastCell(cellIdx);

      setBoard((prev) => {
        const next = [...prev];
        const current = next[cellIdx];

        if (current === selectedFace) {
          // Aynı üçgene tekrar dokunulursa saat yönünde 90° döndür
          if (isTriangleFace(selectedFace)) {
            next[cellIdx] = rotateTriangleCW(current);
          } else {
            // Üçgen dışı aynı yüze tekrar basılırsa yuvayı boşalt
            next[cellIdx] = null;
          }
        } else if (current !== null && isTriangleFace(current) && isTriangleFace(selectedFace)) {
          // Zaten bir üçgen varsa ve oyuncu paletten başka bir üçgen seçtiyse doğrudan seçileni koy
          next[cellIdx] = selectedFace;
        } else {
          next[cellIdx] = selectedFace;
        }

        // Anlık %100 eşleşme kontrolü
        let allMatched = true;
        for (let i = 0; i < currentPattern.cells.length; i++) {
          if (next[i] !== currentPattern.cells[i]) {
            allMatched = false;
            break;
          }
        }
        if (allMatched) {
          window.setTimeout(() => triggerRoundWin(player), 40);
        }

        return next;
      });
    },
    [
      roundWinner,
      matchWinner,
      roundRule,
      memorySecondsLeft,
      p1SelectedFace,
      p2SelectedFace,
      currentPattern.cells,
      triggerRoundWin,
    ]
  );

  const handleClearPlayerBoard = useCallback(
    (player: 0 | 1) => {
      if (roundWinner !== null || matchWinner !== null) return;
      playMp3?.('/op.mp3');
      if (player === 0) setP1Board(createEmptyBoard(gridSize));
      else setP2Board(createEmptyBoard(gridSize));
    },
    [roundWinner, matchWinner, playMp3, createEmptyBoard, gridSize]
  );

  // Hafıza modunda 3 saniyelik göz atma
  const handlePeekCard = useCallback(() => {
    if (!isCardHidden || roundWinner !== null) return;
    playMp3?.('/op.mp3');
    setIsPeeking(true);
    if (peekTimeoutRef.current) window.clearTimeout(peekTimeoutRef.current);
    peekTimeoutRef.current = window.setTimeout(() => {
      setIsPeeking(false);
    }, 3000);
  }, [isCardHidden, roundWinner, playMp3]);

  // Süre biçimlendir
  const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Oyuncu Paneli Bileşeni (1. ve 2. Oyuncu simetrik ve bağımsız)
  const renderPlayerStation = (playerIdx: 0 | 1) => {
    const isP1 = playerIdx === 0;
    const board = isP1 ? p1Board : p2Board;
    const selectedFace = isP1 ? p1SelectedFace : p2SelectedFace;
    const setSelectedFace = isP1 ? setP1SelectedFace : setP2SelectedFace;
    const matches = isP1 ? p1Matches : p2Matches;
    const lastCell = isP1 ? p1LastCell : p2LastCell;
    const cubeColor = isP1 ? '#2563EB' : '#E11D48';
    const playerName = isP1 ? p1Name : p2Name;
    const playerScore = scores[playerIdx];
    const pct = Math.round((matches / totalCells) * 100);
    const isWinner = roundWinner === playerIdx;
    const isLocked = (roundRule === 'memory' && memorySecondsLeft > 0) || roundWinner !== null;

    return (
      <section
        className={`relative flex flex-col justify-between rounded-2xl border-2 p-2 sm:p-3 transition-all min-h-0 h-full ${
          isWinner
            ? 'border-amber-400 bg-gradient-to-b from-amber-950/80 via-slate-900/95 to-slate-950/95 shadow-[0_0_32px_rgba(251,191,36,0.45)]'
            : isP1
              ? 'border-blue-500/70 bg-gradient-to-b from-[#0d1c3d]/95 via-[#0b142b]/95 to-[#091020]/95 shadow-[0_0_24px_rgba(37,99,235,0.22)]'
              : 'border-rose-500/70 bg-gradient-to-b from-[#3b0e24]/95 via-[#210d1b]/95 to-[#140a14]/95 shadow-[0_0_24px_rgba(225,29,72,0.22)]'
        }`}
      >
        {/* Oyuncu Üst Bilgi Şeridi */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-sm sm:text-base text-white shadow-md shrink-0 border border-white/25 ${
                isP1
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-700'
                  : 'bg-gradient-to-br from-rose-500 to-red-700'
              }`}
            >
              {isP1 ? '1' : '2'}
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs sm:text-sm md:text-base text-white truncate leading-tight">
                {playerName}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-300">
                <span className={isP1 ? 'text-sky-300' : 'text-rose-300'}>
                  {matches}/{totalCells} {isEn ? 'cubes' : 'küp'}
                </span>
                <span className="text-slate-500">·</span>
                <span>%{pct}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {playerMode === 2 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/45 border border-amber-400/45 shadow-inner">
                <Trophy size={13} className="text-amber-400" />
                <span className="font-black text-sm sm:text-base text-amber-300 tabular-nums">
                  {playerScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400">/{targetScore}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleClearPlayerBoard(playerIdx)}
              disabled={isLocked}
              title={isEn ? 'Clear tray' : 'Tepsiyi Temizle'}
              className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 border border-white/15 text-[11px] font-extrabold text-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden xl:inline">{isEn ? 'Clear' : 'Temizle'}</span>
            </button>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="w-full h-1.5 rounded-full bg-slate-800/90 overflow-hidden my-1.5 shrink-0">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isWinner
                ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                : isP1
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600'
                  : 'bg-gradient-to-r from-pink-400 to-rose-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Q-BITZ AHŞAP / AKRİLİK KÜP TEPSİSİ (IZGARA) */}
        <div className="flex-1 flex items-center justify-center min-h-0 py-1">
          <div
            className={`relative aspect-square w-full max-w-[290px] sm:max-w-[330px] md:max-w-[360px] lg:max-w-[380px] max-h-full p-2 sm:p-2.5 rounded-2xl border-2 shadow-[inset_0_4px_14px_rgba(0,0,0,0.65),0_10px_28px_rgba(0,0,0,0.45)] ${
              isP1
                ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 border-blue-400/50'
                : 'bg-gradient-to-br from-slate-800 via-slate-900 to-rose-950 border-rose-400/50'
            }`}
          >
            <div
              className="grid w-full h-full gap-1.5 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {board.map((cell, idx) => {
                const isCorrect = cell !== null && cell === currentPattern.cells[idx];
                const isWrong = cell !== null && cell !== currentPattern.cells[idx];
                const justTapped = lastCell === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLocked}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleCellTap(playerIdx, idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellTap(playerIdx, idx);
                      }
                    }}
                    aria-label={`${playerName} ${idx + 1}. küp`}
                    className={`relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden transition-transform duration-100 touch-none select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      cell === null
                        ? 'bg-slate-950/75 border-2 border-dashed border-slate-600/70 hover:border-slate-400/90 shadow-[inset_0_3px_8px_rgba(0,0,0,0.7)]'
                        : 'border-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.6),0_3px_8px_rgba(0,0,0,0.45)] active:scale-95'
                    } ${
                      cell !== null && showLiveHints && isWrong
                        ? 'border-amber-400 ring-2 ring-amber-400/70'
                        : cell !== null && showLiveHints && isCorrect
                          ? 'border-emerald-400'
                          : cell !== null
                            ? isP1
                              ? 'border-blue-200/80'
                              : 'border-rose-200/80'
                            : ''
                    } ${justTapped ? 'scale-[1.03]' : ''}`}
                  >
                    {cell !== null ? (
                      <QBitzTileSvg face={cell} color={cubeColor} />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600/70">+</span>
                    )}
                    {/* İpucu açıksa doğru/yanlış küçük köşe işareti */}
                    {showLiveHints && cell !== null && isWrong && (
                      <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hafıza modunda geri sayım kilidi katmanı */}
            {roundRule === 'memory' && memorySecondsLeft > 0 && (
              <div className="absolute inset-0 rounded-2xl bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-3 pointer-events-none">
                <Clock className="w-7 h-7 text-amber-300 animate-pulse mb-1" />
                <div className="font-black text-sm sm:text-base text-amber-200">
                  {isEn ? 'Study the Card!' : 'Kartı Hafızana Al!'}
                </div>
                <div className="text-xs font-bold text-slate-300 mt-0.5">
                  {memorySecondsLeft} {isEn ? 'sec' : 'sn'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BAĞIMSIZ 8 YÜZLÜ KÜP PALETİ (TEK DOKUNUŞLA SEÇ, TEKRAR DOKUNARAK ÜÇGENİ DÖNDÜR) */}
        <div className="pt-1.5 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              {isEn ? 'Cube Faces (Tap to Select)' : 'Küp Yüzeyleri (Seç & Yerleştir)'}
            </span>
            <span className="text-[10px] font-bold text-amber-300/90 truncate max-w-[140px]">
              {isEn ? FACE_LABELS[selectedFace].en : FACE_LABELS[selectedFace].tr}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
            {ALL_FACES.map((face) => {
              const isSelected = selectedFace === face;
              return (
                <button
                  key={face}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    playWoodClick(isP1 ? 660 : 600);
                    setSelectedFace(face);
                  }}
                  onClick={() => setSelectedFace(face)}
                  title={isEn ? FACE_LABELS[face].en : FACE_LABELS[face].tr}
                  aria-label={isEn ? FACE_LABELS[face].en : FACE_LABELS[face].tr}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all touch-none cursor-pointer ${
                    isSelected
                      ? 'border-amber-300 ring-2 ring-amber-400/90 scale-110 -translate-y-0.5 shadow-[0_0_14px_rgba(251,191,36,0.7)] z-10'
                      : 'border-white/25 hover:border-white/70 opacity-85 hover:opacity-100 active:scale-95'
                  }`}
                >
                  <QBitzTileSvg face={face} color={cubeColor} />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white">
      <ActivityBackground theme="doga" showFloatingElements={false} />
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* ÜST KONTROL ÇUBUĞU */}
      <header className="relative z-20 flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 bg-slate-950/90 border-b border-white/15 shrink-0 flex-wrap">
        {/* Sol: Geri / Ana Sayfa / Başlık */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition cursor-pointer"
            title={isEn ? 'Back' : 'Geri'}
          >
            <ArrowLeft size={16} />
          </button>

          {onGoHome && (
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onGoHome();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 h-8 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/40 text-xs font-black transition cursor-pointer"
              title={isEn ? 'Home' : 'Ana Sayfa'}
            >
              <Home size={14} />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600/80 via-violet-600/80 to-fuchsia-600/80 border border-white/25 shadow">
            <LayoutGrid size={15} className="text-amber-300 shrink-0" />
            <span className="font-black text-xs sm:text-sm tracking-wide uppercase">
              Q-Bitz
            </span>
          </div>
        </div>

        {/* Orta: Oyuncu Sayısı · Izgara · Kural Modu · İpucu */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
          {/* 1 / 2 Kişilik */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-white/15">
            <button
              type="button"
              onClick={() => {
                if (playerMode === 2) return;
                playMp3?.('/op.mp3');
                setPlayerMode(2);
                startNextRound({ newMode: 2, resetMatch: true });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                playerMode === 2
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>{isEn ? '2 Players' : '2 Kişilik'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (playerMode === 1) return;
                playMp3?.('/op.mp3');
                setPlayerMode(1);
                startNextRound({ newMode: 1, resetMatch: true });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                playerMode === 1
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>{isEn ? 'Solo' : '1 Kişilik'}</span>
            </button>
          </div>

          {/* 3x3 / 4x4 Boyut */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-white/15">
            <button
              type="button"
              onClick={() => {
                if (gridSize === 3) return;
                playMp3?.('/op.mp3');
                setGridSize(3);
                startNextRound({ newSize: 3, resetMatch: true });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                gridSize === 3
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Grid3X3 size={12} />
              <span>3×3</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (gridSize === 4) return;
                playMp3?.('/op.mp3');
                setGridSize(4);
                startNextRound({ newSize: 4, resetMatch: true });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                gridSize === 4
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid size={12} />
              <span>4×4</span>
            </button>
          </div>

          {/* Hız / Hafıza Turu */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-white/15">
            <button
              type="button"
              onClick={() => {
                if (roundRule === 'speed') return;
                playMp3?.('/op.mp3');
                setRoundRule('speed');
                startNextRound({ newRule: 'speed', resetMatch: false });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                roundRule === 'speed'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles size={12} />
              <span>{isEn ? 'Speed' : 'Hız Turu'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (roundRule === 'memory') return;
                playMp3?.('/op.mp3');
                setRoundRule('memory');
                startNextRound({ newRule: 'memory', resetMatch: false });
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-black transition cursor-pointer ${
                roundRule === 'memory'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <EyeOff size={12} />
              <span>{isEn ? 'Memory' : 'Hafıza Turu'}</span>
            </button>
          </div>

          {/* Hedef Puan (2 Kişilikte) */}
          {playerMode === 2 && (
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                setTargetScore((prev) => (prev === 3 ? 5 : 3));
              }}
              className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-400/35 text-[11px] sm:text-xs font-black text-amber-300 flex items-center gap-1 cursor-pointer"
              title={isEn ? 'Target match score' : 'Maç hedef skoru (3 veya 5)'}
            >
              <Trophy size={12} />
              <span>{targetScore} {isEn ? 'Pts' : 'Puan'}</span>
            </button>
          )}

          {/* Canlı İpucu Aç/Kapat */}
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setShowLiveHints((v) => !v);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] sm:text-xs font-black transition cursor-pointer ${
              showLiveHints
                ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                : 'bg-slate-900 border-white/15 text-slate-300 hover:text-white'
            }`}
            title={isEn ? 'Highlight mismatched tiles' : 'Yanlış yerleştirilen küpleri vurgula'}
          >
            <Lightbulb size={13} />
            <span className="hidden md:inline">{isEn ? 'Hint' : 'İpucu'}</span>
          </button>
        </div>

        {/* Sağ: Kurallar + Önceki/Sonraki Etkinlik */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setShowRulesModal(true);
            }}
            className="px-2 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center gap-1 text-xs font-bold text-slate-100 cursor-pointer"
            title={isEn ? 'How to Play' : 'Nasıl Oynanır?'}
          >
            <HelpCircle size={15} className="text-sky-300" />
            <span className="hidden lg:inline">{isEn ? 'Rules' : 'Kurallar'}</span>
          </button>

          {onPrevActivity && (
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onPrevActivity();
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center cursor-pointer"
              title={isEn ? 'Previous Activity' : 'Önceki Etkinlik'}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {onNextActivity && (
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onNextActivity();
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center cursor-pointer"
              title={isEn ? 'Next Activity' : 'Sonraki Etkinlik'}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ANA OYUN SAHNESİ */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1520px] mx-auto p-2 sm:p-3 overflow-y-auto lg:overflow-hidden">
        <div
          className={`h-full grid gap-2 sm:gap-3 items-stretch ${
            playerMode === 2
              ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)_minmax(0,1fr)]'
              : 'grid-cols-1 md:grid-cols-[minmax(260px,340px)_minmax(0,540px)] justify-center'
          }`}
        >
          {/* 1. OYUNCU İSTASYONU (2 kişilikte solda; tek kişilikte sağda göstermek için order ayarı) */}
          <div className={playerMode === 1 ? 'order-2 h-full min-h-0' : 'order-2 lg:order-1 h-full min-h-0'}>
            {renderPlayerStation(0)}
          </div>

          {/* ORTA HEDEF DESEN KARTI */}
          <section
            className={`${
              playerMode === 1 ? 'order-1' : 'order-1 lg:order-2'
            } flex flex-col items-center justify-between rounded-2xl border-2 border-amber-400/75 bg-gradient-to-b from-[#1a1333]/95 via-[#131830]/95 to-[#0c1122]/95 p-2.5 sm:p-3 shadow-[0_0_28px_rgba(251,191,36,0.2)] min-h-0`}
          >
            {/* Kart Üst Başlık & Tur Bilgisi */}
            <div className="w-full flex items-center justify-between gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase shrink-0">
                  {isEn ? `Card #${roundNumber}` : `Kart #${roundNumber}`}
                </span>
                <h2 className="font-black text-xs sm:text-sm text-amber-100 truncate">
                  {isEn ? currentPattern.nameEn : currentPattern.name}
                </h2>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/15 text-[11px] font-black text-sky-200 tabular-nums shrink-0">
                <Clock size={12} className="text-sky-400" />
                <span>{formatTime(elapsedSec)}</span>
              </div>
            </div>

            {/* 2 Kişilik Skor Panosu veya Tek Kişilik Rekor */}
            {playerMode === 2 ? (
              <div className="w-full flex items-center justify-center gap-2 my-1.5 py-1.5 px-2.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                <div className="flex-1 text-right min-w-0">
                  <div className="text-[10px] font-bold text-sky-300 truncate">{p1Name}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-slate-900 border border-amber-400/40 font-black text-base sm:text-lg tabular-nums">
                  <span className="text-sky-400">{scores[0]}</span>
                  <span className="text-slate-500 text-xs">:</span>
                  <span className="text-rose-400">{scores[1]}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] font-bold text-rose-300 truncate">{p2Name}</div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between my-1.5 py-1.5 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold shrink-0">
                <span className="text-slate-300">
                  {isEn ? 'Solved:' : 'Çözülen:'}{' '}
                  <strong className="text-amber-300">{scores[0]}</strong>
                </span>
                <span className="text-slate-300">
                  {isEn ? 'Best:' : 'En İyi:'}{' '}
                  <strong className="text-emerald-300">
                    {soloBestSec !== null ? formatTime(soloBestSec) : '--:--'}
                  </strong>
                </span>
              </div>
            )}

            {/* HEDEF KART GÖRSELİ (OTANTİK Q-BITZ KARTI) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 py-1">
              <div className="relative aspect-square w-full max-w-[200px] sm:max-w-[235px] lg:max-w-[250px] max-h-full rounded-2xl bg-gradient-to-b from-amber-50 to-slate-100 p-2.5 sm:p-3 border-[3px] border-amber-300 shadow-[0_12px_28px_rgba(0,0,0,0.55)] flex items-center justify-center">
                {isCardHidden && !isPeeking ? (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-950 border-2 border-violet-400/50 flex flex-col items-center justify-center text-center p-3 gap-2">
                    <EyeOff className="w-10 h-10 text-violet-300" />
                    <div className="font-black text-sm text-white uppercase tracking-wide">
                      {isEn ? 'Memory Mode' : 'Hafıza Turu'}
                    </div>
                    <p className="text-[11px] text-violet-200/85 leading-snug">
                      {isEn
                        ? 'Rebuild the pattern from memory!'
                        : 'Deseni aklında kaldığı gibi oluştur!'}
                    </p>
                    <button
                      type="button"
                      onClick={handlePeekCard}
                      className="mt-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>{isEn ? 'Peek (3s)' : 'İpucu Bak (3 sn)'}</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="grid w-full h-full gap-[2px] bg-slate-300 p-[2px] rounded-lg overflow-hidden border border-slate-300"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                    }}
                  >
                    {currentPattern.cells.map((face, idx) => (
                      <div key={idx} className="w-full h-full bg-white overflow-hidden">
                        <QBitzTileSvg face={face} color="#1E293B" bgColor="#FFFFFF" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Hafıza geri sayım rozeti */}
                {roundRule === 'memory' && memorySecondsLeft > 0 && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-lg border-2 border-white whitespace-nowrap animate-bounce">
                    {isEn ? `Memorize: ${memorySecondsLeft}s` : `Ezberle: ${memorySecondsLeft} sn`}
                  </div>
                )}
              </div>
            </div>

            {/* Kart Alt Aksiyonları */}
            <div className="w-full flex items-center gap-1.5 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/coin.mp3');
                  startNextRound({ randomCard: false });
                }}
                className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 border border-indigo-300/40 font-black text-xs text-white flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Shuffle size={14} />
                <span>{isEn ? 'New Card' : 'Yeni Kart'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  startNextRound({ resetMatch: true });
                }}
                className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 font-black text-xs text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                title={isEn ? 'Reset Match' : 'Maçı Sıfırla'}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </section>

          {/* 2. OYUNCU İSTASYONU (Sadece 2 Kişilik Modda) */}
          {playerMode === 2 && (
            <div className="order-3 h-full min-h-0">
              {renderPlayerStation(1)}
            </div>
          )}
        </div>
      </main>

      {/* SINIF ÖĞRENCİ SEÇİM ÇUBUĞU (VARSA) */}
      {onSelectStudentForPlayer && onOpenRosterModal && (
        <div className="relative z-20 shrink-0 px-2 pb-1">
          <StudentAvatarDock
            students={students}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds}
            onSelectStudentForPlayer={onSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* TUR / MAÇ ZAFERİ MODAL KATMANI */}
      {roundWinner !== null && (
        <div className="fixed inset-0 z-[260] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-900 via-[#151a33] to-slate-950 p-6 text-center shadow-[0_0_50px_rgba(251,191,36,0.4)]">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-yellow-200">
              {matchWinner !== null ? (
                <Trophy className="w-9 h-9 text-slate-950" />
              ) : (
                <CheckCircle2 className="w-9 h-9 text-slate-950" />
              )}
            </div>

            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-xs uppercase tracking-wider mb-2">
              {matchWinner !== null
                ? isEn
                  ? 'Match Champion!'
                  : 'Maç Şampiyonu!'
                : isEn
                  ? `Round ${roundNumber} Complete!`
                  : `${roundNumber}. Tur Tamamlandı!`}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {roundWinner === 0 ? p1Name : p2Name} {isEn ? 'Wins!' : 'Kazandı!'}
            </h3>

            <p className="text-sm text-slate-300 font-semibold mb-4">
              {isEn
                ? `Completed "${currentPattern.nameEn}" in ${formatTime(elapsedSec)}`
                : `"${currentPattern.name}" desenini ${formatTime(elapsedSec)} sürede tamamladı!`}
            </p>

            {playerMode === 2 && (
              <div className="flex items-center justify-center gap-4 mb-5 py-2.5 px-4 rounded-2xl bg-black/45 border border-white/10">
                <div className="text-center">
                  <div className="text-xs font-bold text-sky-300">{p1Name}</div>
                  <div className="text-2xl font-black text-white tabular-nums">{scores[0]}</div>
                </div>
                <div className="text-slate-500 font-black text-lg">—</div>
                <div className="text-center">
                  <div className="text-xs font-bold text-rose-300">{p2Name}</div>
                  <div className="text-2xl font-black text-white tabular-nums">{scores[1]}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              {matchWinner !== null ? (
                <button
                  type="button"
                  onClick={() => {
                    playMp3?.('/coin.mp3');
                    startNextRound({ resetMatch: true });
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wide shadow-lg transition cursor-pointer"
                >
                  {isEn ? 'Play New Match' : 'Yeni Maça Başla'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playMp3?.('/coin.mp3');
                    startNextRound({ resetMatch: false });
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wide shadow-lg transition cursor-pointer"
                >
                  {isEn ? 'Next Pattern Card' : 'Sonraki Kartla Devam Et'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NASIL OYNANIR MODALI */}
      {showRulesModal && (
        <div className="fixed inset-0 z-[270] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border-2 border-indigo-400/70 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="font-black text-lg text-white">
                  {isEn ? 'How to Play Q-Bitz' : 'Q-Bitz Nasıl Oynanır?'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-sm text-slate-200 leading-relaxed">
              <p>
                <strong className="text-amber-300">
                  {isEn ? '1. Goal:' : '1. Amaç:'}
                </strong>{' '}
                {isEn
                  ? 'Recreate the center Pattern Card on your cube tray faster than your opponent.'
                  : 'Ortadaki hedef desen kartını kendi küp tepsinde rakibinden daha hızlı oluştur.'}
              </p>
              <p>
                <strong className="text-sky-300">
                  {isEn ? '2. Place & Rotate:' : '2. Yerleştir ve Döndür:'}
                </strong>{' '}
                {isEn
                  ? 'Pick a cube face from your bottom tray and tap grid slots to place it. Tap an already placed triangle again to rotate it 90°!'
                  : 'Alttaki 8 küp yüzeyinden birini seçip tepsideki karelere dokunarak yerleştir. Yerleştirdiğin bir üçgene tekrar dokunursan 90° saat yönünde döner!'}
              </p>
              <p>
                <strong className="text-violet-300">
                  {isEn ? '3. Speed & Memory Modes:' : '3. Hız ve Hafıza Turları:'}
                </strong>{' '}
                {isEn
                  ? 'In Speed Mode the card stays visible. In Memory Mode you study the card for 10 seconds before it flips face-down!'
                  : 'Hız Turunda kart hep açık kalır. Hafıza Turunda kartı 10 saniye inceledikten sonra kart kapanır ve aklından tamamlarsın!'}
              </p>
              <p className="text-xs text-slate-400 pt-1">
                {isEn
                  ? 'Tip: White squares in the target pattern also require placing the white cube face.'
                  : 'İpucu: Hedef karttaki boş beyaz kareler için de en soldaki "Boş Beyaz" küp yüzeyini yerleştirmelisin.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black text-sm text-white cursor-pointer"
            >
              {isEn ? 'Got It!' : 'Anladım, Başlayalım!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QBitzGame;
