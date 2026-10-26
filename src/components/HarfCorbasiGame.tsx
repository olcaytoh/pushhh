import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  HelpCircle, Trash2, Check
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface HarfCorbasiWord {
  id: string;
  word: string;
  scrambled: string[];
  hint: string;
  emoji: string;
}

export const HARF_CORBASI_WORDS: HarfCorbasiWord[] = [
  { id: 'hc-1', word: 'ASLAN', scrambled: ['S', 'L', 'A', 'N', 'A'], hint: 'Ormanların kralı olarak bilinen yeleli hayvan', emoji: '🦁' },
  { id: 'hc-2', word: 'GÜNEŞ', scrambled: ['Ş', 'N', 'G', 'E', 'Ü'], hint: 'Dünyamızı ısıtan ve aydınlatan gök cismi', emoji: '☀️' },
  { id: 'hc-3', word: 'TAVŞAN', scrambled: ['Ş', 'A', 'T', 'N', 'V', 'A'], hint: 'Havuç seven, uzun kulaklı sevimli hayvan', emoji: '🐰' },
  { id: 'hc-4', word: 'KİTAP', scrambled: ['P', 'T', 'K', 'İ', 'A'], hint: 'Sayfalarında bilgiler ve maceralar saklayan hazine', emoji: '📚' },
  { id: 'hc-5', word: 'KELEBEK', scrambled: ['E', 'B', 'K', 'L', 'E', 'K', 'E'], hint: 'Tırtıldan dönüşen, rengarenk kanatlı sevimli böcek', emoji: '🦋' },
  { id: 'hc-6', word: 'ŞEMSİYE', scrambled: ['M', 'Ş', 'E', 'Y', 'İ', 'S', 'E'], hint: 'Yağmurlu günlerde bizi ıslanmaktan korur', emoji: '☂️' },
  { id: 'hc-7', word: 'DÜNYA', scrambled: ['N', 'Y', 'D', 'A', 'Ü'], hint: 'Üzerinde yaşadığımız mavi gezegen', emoji: '🌍' },
  { id: 'hc-8', word: 'ELMA', scrambled: ['M', 'A', 'E', 'L'], hint: 'Kırmızı veya yeşil, çok lezzetli vitaminli meyve', emoji: '🍎' },
  { id: 'hc-9', word: 'YILDIZ', scrambled: ['D', 'Z', 'Y', 'I', 'L', 'I'], hint: 'Geceleri gökyüzünde ışıl ışıl parlar', emoji: '⭐' },
  { id: 'hc-10', word: 'BALIK', scrambled: ['L', 'K', 'B', 'I', 'A'], hint: 'Denizlerde ve göllerde yüzen pullu canlı', emoji: '🐟' },
  { id: 'hc-11', word: 'ZÜRAFA', scrambled: ['F', 'Z', 'R', 'A', 'Ü', 'A'], hint: 'Uzun boynuyla ağaçların en tepesine ulaşır', emoji: '🦒' },
  { id: 'hc-12', word: 'PENGUEN', scrambled: ['N', 'P', 'G', 'E', 'U', 'E', 'N'], hint: 'Kutuplarda yaşayan, uçamayan ama usta yüzen kuş', emoji: '🐧' },
  { id: 'hc-13', word: 'GÖKKUŞAĞI', scrambled: ['Ş', 'G', 'Ö', 'K', 'U', 'A', 'K', 'Ğ', 'I'], hint: 'Yağmur sonrası gökyüzünü saran yedi renk', emoji: '🌈' },
  { id: 'hc-14', word: 'ASTRONOT', scrambled: ['T', 'S', 'A', 'R', 'N', 'O', 'O', 'T'], hint: 'Uzay mekiğiyle yıldızlara ve aya yolculuk yapar', emoji: '👨‍🚀' },
  { id: 'hc-15', word: 'KİTAPLIK', scrambled: ['P', 'K', 'L', 'İ', 'T', 'I', 'A', 'K'], hint: 'Kitaplarımızı düzenli yerleştirdiğimiz mobilya', emoji: '📖' },
  { id: 'hc-16', word: 'DİNOZOR', scrambled: ['N', 'Z', 'D', 'O', 'İ', 'R', 'O'], hint: 'Milyonlarca yıl önce yaşamış devasa canlı', emoji: '🦖' },
  { id: 'hc-17', word: 'PUSULA', scrambled: ['L', 'P', 'S', 'U', 'A', 'U'], hint: 'Yönümüzü bulmamızı sağlayan manyetik araç', emoji: '🧭' },
  { id: 'hc-18', word: 'PAPATYA', scrambled: ['T', 'P', 'P', 'A', 'Y', 'A', 'A'], hint: 'Beyaz yapraklı, sarı göbekli narin kır çiçeği', emoji: '🌼' },
  { id: 'hc-19', word: 'DENİZALTI', scrambled: ['Z', 'D', 'T', 'E', 'N', 'İ', 'A', 'L', 'I'], hint: 'Okyanusların derinliklerinde yüzen su altı gemisi', emoji: '🤿' },
  { id: 'hc-20', word: 'TİYATRO', scrambled: ['R', 'T', 'İ', 'O', 'Y', 'A', 'T'], hint: 'Oyuncuların sahnede canlandırdığı gösteri sanatı', emoji: '🎭' },
  { id: 'hc-21', word: 'KARINCA', scrambled: ['R', 'K', 'N', 'A', 'A', 'C', 'I'], hint: 'Çok çalışkan, yuvasına yiyecek taşıyan minik böcek', emoji: '🐜' },
  { id: 'hc-22', word: 'TİMSAH', scrambled: ['M', 'T', 'S', 'İ', 'H', 'A'], hint: 'Nehirlerde yaşayan, güçlü çeneli büyük sürüngen', emoji: '🐊' },
  { id: 'hc-23', word: 'PAPAĞAN', scrambled: ['Ğ', 'P', 'P', 'A', 'A', 'A', 'N'], hint: 'Rengarenk tüyleri olan ve konuşmayı taklit eden kuş', emoji: '🦜' },
  { id: 'hc-24', word: 'ÇİLEK', scrambled: ['L', 'Ç', 'K', 'İ', 'E'], hint: 'Kırmızı renkli, mis kokulu ve çekirdekli yaz meyvesi', emoji: '🍓' },
  { id: 'hc-25', word: 'ŞELALE', scrambled: ['L', 'Ş', 'E', 'E', 'A', 'L'], hint: 'Yüksek kayalıklardan köpük köpük dökülen su', emoji: '🌊' },
  { id: 'hc-26', word: 'KARPUZ', scrambled: ['P', 'K', 'Z', 'A', 'R', 'U'], hint: 'Yazın sofraları süsleyen kocaman, tatlı sulu meyve', emoji: '🍉' },
  { id: 'hc-27', word: 'PORTAKAL', scrambled: ['R', 'P', 'L', 'O', 'T', 'A', 'K', 'A'], hint: 'Turuncu kabuklu, C vitamini zengini kış meyvesi', emoji: '🍊' },
  { id: 'hc-28', word: 'SİNCAP', scrambled: ['C', 'S', 'P', 'İ', 'N', 'A'], hint: 'Ağaçlarda yaşayan, meşe palamudu saklayan sevimli hayvan', emoji: '🐿️' },
  { id: 'hc-29', word: 'KARTAL', scrambled: ['T', 'K', 'R', 'A', 'A', 'L'], hint: 'Keskin gözleriyle göklerde süzülen heybetli avcı kuş', emoji: '🦅' },
  { id: 'hc-30', word: 'YUNUS', scrambled: ['N', 'Y', 'S', 'U', 'U'], hint: 'Denizlerde neşeyle zıplayan akıllı memeli hayvan', emoji: '🐬' },
  { id: 'hc-31', word: 'BİSİKLET', scrambled: ['S', 'B', 'K', 'İ', 'T', 'İ', 'L', 'E'], hint: 'Pedal çevirerek sürdüğümüz iki tekerlekli eğlenceli araç', emoji: '🚲' },
  { id: 'hc-32', word: 'UÇAK', scrambled: ['Ç', 'U', 'K', 'A'], hint: 'Bulutların üzerinde süzülerek şehirleri kavuşturan hava taşıtı', emoji: '✈️' },
  { id: 'hc-33', word: 'ORMAN', scrambled: ['M', 'O', 'N', 'R', 'A'], hint: 'Binlerce ağaç ve hayvanın yaşadığı yemyeşil doğa', emoji: '🌲' },
  { id: 'hc-35', word: 'KÖPEK', scrambled: ['P', 'K', 'K', 'Ö', 'E'], hint: 'İnsanların en sadık ve neşeli koruyucu dostu', emoji: '🐶' },
  { id: 'hc-36', word: 'GÜVERCİN', scrambled: ['R', 'G', 'C', 'Ü', 'İ', 'V', 'N', 'E'], hint: 'Barışın ve özgürlüğün simgesi kanatlı kuş', emoji: '🕊️' },
  { id: 'hc-37', word: 'BALİNA', scrambled: ['L', 'B', 'N', 'A', 'İ', 'A'], hint: 'Okyanusların en büyük devasa memeli canlısı', emoji: '🐋' },
  { id: 'hc-38', word: 'GEZEGEN', scrambled: ['Z', 'G', 'N', 'E', 'G', 'E', 'E'], hint: 'Güneşin çevresinde dönen büyük gök cismi', emoji: '🪐' },
  { id: 'hc-39', word: 'PİYANO', scrambled: ['Y', 'P', 'O', 'İ', 'N', 'A'], hint: 'Siyah ve beyaz tuşlarıyla harika melodiler çalan çalgı', emoji: '🎹' },
  { id: 'hc-40', word: 'KEMAN', scrambled: ['M', 'K', 'N', 'E', 'A'], hint: 'Yay ile çalınan, büyüleyici sesli narin enstrüman', emoji: '🎻' },
  { id: 'hc-41', word: 'TELESKOP', scrambled: ['S', 'T', 'K', 'E', 'P', 'L', 'O', 'E'], hint: 'Uzak yıldızları ve gezegenleri yakından görmemizi sağlar', emoji: '🔭' },
  { id: 'hc-42', word: 'VOLKAN', scrambled: ['L', 'V', 'N', 'O', 'A', 'K'], hint: 'İçinden lavlar ve dumanlar fışkıran yanardağ', emoji: '🌋' },
  { id: 'hc-43', word: 'KANGURU', scrambled: ['G', 'K', 'R', 'A', 'U', 'N', 'U'], hint: 'Yavrusunu karnındaki kesesinde taşıyan zıplayan hayvan', emoji: '🦘' },
  { id: 'hc-44', word: 'YELKENLİ', scrambled: ['K', 'Y', 'N', 'E', 'İ', 'L', 'L', 'E'], hint: 'Rüzgarın gücüyle dalgaları yaran beyaz yelkenli gemi', emoji: '⛵' },
  { id: 'hc-45', word: 'PİRAMİT', scrambled: ['M', 'P', 'T', 'İ', 'A', 'R', 'İ'], hint: 'Eski Mısır krallarının dev taş anıt mezarları', emoji: '🏛️' },
  { id: 'hc-46', word: 'LABİRENT', scrambled: ['R', 'L', 'T', 'A', 'N', 'B', 'E', 'İ'], hint: 'Çıkışını bulması eğlenceli ve zeka gerektiren dolambaçlı yol', emoji: '🌀' },
  { id: 'hc-47', word: 'ŞAMPİYON', scrambled: ['P', 'Ş', 'N', 'A', 'O', 'M', 'Y', 'İ'], hint: 'Yarışmayı ve turnuvayı birincilikle bitiren kazanan', emoji: '🏆' },
  { id: 'hc-48', word: 'TRAKTÖR', scrambled: ['K', 'T', 'R', 'R', 'Ö', 'A', 'T'], hint: 'Tarlaları sürmek için köylerde kullanılan güçlü motorlu araç', emoji: '🚜' },
  { id: 'hc-49', word: 'MIKNATIS', scrambled: ['T', 'M', 'S', 'I', 'I', 'K', 'A', 'N'], hint: 'Demir ve metalleri kendine doğru çeken mucizevi cisim', emoji: '🧲' },
  { id: 'hc-50', word: 'ZEYTİN', scrambled: ['T', 'Z', 'N', 'E', 'İ', 'Y'], hint: 'Kahvaltıların vazgeçilmezi, dalında barış yeşeren meyve', emoji: '🫒' },
  { id: 'hc-51', word: 'BÜLBÜL', scrambled: ['L', 'B', 'B', 'Ü', 'L', 'Ü'], hint: 'Gül dalında en güzel şarkıları söyleyen ötücü kuş', emoji: '🐦' },
  { id: 'hc-52', word: 'GÖKTAŞI', scrambled: ['Ş', 'G', 'I', 'Ö', 'A', 'K', 'T'], hint: 'Uzay boşluğundan atmosfere girip parlayan taş parçası', emoji: '☄️' },
  { id: 'hc-53', word: 'LOKOMOTİF', scrambled: ['M', 'L', 'F', 'O', 'İ', 'K', 'T', 'O', 'O'], hint: 'Tren vagonlarını raylar üzerinde çeken güçlü baş araç', emoji: '🚂' },
  { id: 'hc-54', word: 'RESSAM', scrambled: ['S', 'R', 'M', 'E', 'A', 'S'], hint: 'Fırçası ve tuvaliyle harika tablolar çizen sanatçı', emoji: '🎨' },
  { id: 'hc-55', word: 'FLÜT', scrambled: ['Ü', 'F', 'T', 'L'], hint: 'Üflenerek çalınan delikli ince zarif müzik aleti', emoji: '🪈' },
  { id: 'hc-56', word: 'MERCAN', scrambled: ['C', 'M', 'N', 'E', 'A', 'R'], hint: 'Deniz altını süsleyen renkli ve canlı su altı resifi', emoji: '🪸' },
  { id: 'hc-57', word: 'KAHRAMAN', scrambled: ['R', 'K', 'N', 'A', 'A', 'H', 'M', 'A'], hint: 'Cesaretiyle zorlukların üstesinden gelen iyilik elçisi', emoji: '🦸' },
  { id: 'hc-58', word: 'MACERA', scrambled: ['C', 'M', 'A', 'A', 'R', 'E'], hint: 'Bilinmeyene doğru çıkılan heyecan dolu keşif yolculuğu', emoji: '🧭' },
  { id: 'hc-59', word: 'GİTAR', scrambled: ['T', 'G', 'R', 'İ', 'A'], hint: 'Tellerine dokunularak neşeli şarkılar çalınan enstrüman', emoji: '🎸' },
  { id: 'hc-60', word: 'ÇADIR', scrambled: ['D', 'Ç', 'R', 'A', 'I'], hint: 'Kampta doğayla baş başa uyumak için kurulan kumaş barınak', emoji: '⛺' },
  { id: 'hc-61', word: 'DENİZKABUĞU', scrambled: ['K', 'D', 'Ğ', 'E', 'U', 'N', 'B', 'İ', 'U', 'Z', 'A'], hint: 'Kumsalda bulunan, kulağa tutulduğunda dalga sesi veren kabuk', emoji: '🐚' },
  { id: 'hc-62', word: 'KARTOPU', scrambled: ['T', 'K', 'U', 'A', 'P', 'R', 'O'], hint: 'Kışın kardan yuvarlanarak oynanan eğlenceli oyun aracı', emoji: '⛄' },
  { id: 'hc-63', word: 'UÇURTMA', scrambled: ['R', 'U', 'A', 'Ç', 'M', 'U', 'T'], hint: 'İpi elinde, rüzgarda gökyüzüne doğru dans eden renkli oyuncak', emoji: '🪁' },
  { id: 'hc-64', word: 'HARİTA', scrambled: ['R', 'H', 'A', 'A', 'T', 'İ'], hint: 'Yeryüzünü veya bir ülkeyi kağıt üstünde gösteren rehber çizim', emoji: '🗺️' },
  { id: 'hc-65', word: 'DENİZCİ', scrambled: ['Z', 'D', 'İ', 'E', 'C', 'N', 'İ'], hint: 'Gemisiyle fırtınalara meydan okuyan kaptan dostu', emoji: '⚓' },
  { id: 'hc-66', word: 'SAATKULESİ', scrambled: ['K', 'S', 'İ', 'A', 'S', 'A', 'E', 'T', 'L', 'U'], hint: 'Meydanları süsleyen, zamanı herkese duyuran yüksek kule', emoji: '🕰️' },
  { id: 'hc-67', word: 'BAYRAK', scrambled: ['R', 'B', 'K', 'A', 'A', 'Y'], hint: 'Gökyüzünde gururla dalgalanan ay yıldızlı bağımsızlık simgemiz', emoji: '🇹🇷' },
  { id: 'hc-68', word: 'KUMBARA', scrambled: ['M', 'K', 'A', 'U', 'A', 'B', 'R'], hint: 'Harçlıklarımızı biriktirdiğimiz sevimli tasarruf kutusu', emoji: '🪙' },
  { id: 'hc-69', word: 'FUTBOL', scrambled: ['T', 'F', 'L', 'U', 'O', 'B'], hint: 'Yeşil sahada 11 kişilik takımlarla oynanan popüler top oyunu', emoji: '⚽' },
  { id: 'hc-70', word: 'BASKETBOL', scrambled: ['K', 'B', 'L', 'A', 'O', 'S', 'T', 'E', 'B'], hint: 'Topu potadaki çemberden geçirerek sayı kazanılan spor', emoji: '🏀' }
];

export const getRandomCorbaWords = (count: number = 6): HarfCorbasiWord[] => {
  const shuffled = [...HARF_CORBASI_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(item => {
    // Shuffle the letters so each match feels fresh
    const letters = item.word.split('').sort(() => Math.random() - 0.5);
    return { ...item, scrambled: letters };
  });
};

interface HarfCorbasiGameProps {
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
  wordIndex: number;
  placedLetters: { char: string; poolIndex: number }[];
  usedPoolIndices: number[];
  isSuccess: boolean | null;
  showError: boolean;
}

export const HarfCorbasiGame: React.FC<HarfCorbasiGameProps> = ({
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

  const [words, setWords] = useState<HarfCorbasiWord[]>(() => getRandomCorbaWords(6));

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
    const names = ['1. Aşçı', '2. Aşçı', '3. Aşçı'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Harf Çorbası Ustası' : names[i],
        colorName: colors[i],
        score: 0,
        wordIndex: 0,
        placedLetters: [],
        usedPoolIndices: [],
        isSuccess: null,
        showError: false
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

  // Click letter from pool to put in soup bowl
  const handlePickLetter = (playerIndex: number, char: string, poolIndex: number) => {
    const p = players[playerIndex];
    if (p.usedPoolIndices.includes(poolIndex) || p.isSuccess || gameOver) return;

    triggerSound('/op.mp3');

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.placedLetters = [...target.placedLetters, { char, poolIndex }];
      target.usedPoolIndices = [...target.usedPoolIndices, poolIndex];
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  // Remove letter from placed word
  const handleRemoveLetter = (playerIndex: number, placedIdx: number) => {
    const p = players[playerIndex];
    if (p.isSuccess || gameOver) return;

    triggerSound('/op.mp3');

    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      const itemToRemove = target.placedLetters[placedIdx];
      target.placedLetters = target.placedLetters.filter((_, i) => i !== placedIdx);
      target.usedPoolIndices = target.usedPoolIndices.filter(idx => idx !== itemToRemove.poolIndex);
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  const handleClearLetters = (playerIndex: number) => {
    triggerSound('/op.mp3');
    setPlayers(prev => {
      const next = [...prev];
      const target = { ...next[playerIndex] };
      target.placedLetters = [];
      target.usedPoolIndices = [];
      target.showError = false;
      next[playerIndex] = target;
      return next;
    });
  };

  const handleCheckWord = (playerIndex: number) => {
    const p = players[playerIndex];
    const currentW = words[p.wordIndex % words.length];
    const assembled = p.placedLetters.map(l => l.char).join('');

    if (assembled === currentW.word) {
      triggerSound('/farklilvl.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIndex);

      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        target.isSuccess = true;
        target.score += 15;
        next[playerIndex] = target;
        return next;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          const target = { ...next[playerIndex] };
          const nextIdx = target.wordIndex + 1;

          if (nextIdx >= 4) {
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
            target.wordIndex = nextIdx;
            target.placedLetters = [];
            target.usedPoolIndices = [];
            target.isSuccess = null;
            target.showError = false;
          }
          next[playerIndex] = target;
          return next;
        });
      }, 1200);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIndex);

      setPlayers(prev => {
        const next = [...prev];
        const target = { ...next[playerIndex] };
        target.showError = true;
        next[playerIndex] = target;
        return next;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const next = [...prev];
          next[playerIndex] = { ...next[playerIndex], showError: false };
          return next;
        });
      }, 800);
    }
  };

  const handleResetGame = () => {
    setWords(getRandomCorbaWords(6));
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

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentW = words[sPlayer.wordIndex % words.length];
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
                            • Harf Çorbası
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_26.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.wordIndex + 1}/4
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: ÇİZGİLİ DEFTER SAYFASI SORU ÇERÇEVESİ */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-2 min-h-0 w-full overflow-hidden">
                    <div 
                      className={`relative flex-1 rounded-2xl sm:rounded-3xl border-3 ${
                        sPlayer.showError ? 'border-rose-500 animate-shake' : sPlayer.isSuccess ? 'border-emerald-400' : 'border-amber-300/90'
                      } shadow-[0_16px_50px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.5)] p-3 sm:p-5 flex flex-col items-center justify-between text-center overflow-hidden min-h-0 w-full`}
                      style={{
                        backgroundColor: '#ffffff',
                        backgroundImage: `
                          /* Kırmızı dikey marjin çizgisi */
                          linear-gradient(to right, transparent 52px, rgba(239, 68, 68, 0.75) 52px, rgba(239, 68, 68, 0.75) 54px, transparent 54px),
                          /* Yatay açık mavi çizgili defter satırları */
                          repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(147, 197, 253, 0.65) 31px, rgba(147, 197, 253, 0.65) 32px),
                          /* Beyaz temiz defter kağıdı dokusu */
                          linear-gradient(135deg, #ffffff 0%, #ffffff 100%)
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
                          ✏️ TÜRKÇE DEFTERİ • HARF ÇORBASI
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 font-mono">
                          Kelime: {sPlayer.wordIndex + 1}/4
                        </span>
                      </div>

                      {/* İpucu Rozeti */}
                      <div className="relative z-10 ml-6 flex items-center gap-2.5 px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl bg-orange-100 border-2 border-orange-400 shadow-sm shrink-0">
                        <span className="text-2xl sm:text-3xl shrink-0">{currentW.emoji}</span>
                        <span className="text-sm sm:text-base md:text-lg font-black text-orange-950">{currentW.hint}</span>
                      </div>

                      {/* Oluşturulan Kelime Yuvaları */}
                      <div className="relative z-10 ml-6 flex flex-col items-center justify-center my-auto gap-2 sm:gap-3 py-1">
                        <div className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 tracking-wide">
                          🍲 Harfleri tıkla, doğru kelimeyi deftere yaz:
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          {Array.from({ length: currentW.word.length }).map((_, idx) => {
                            const placed = sPlayer.placedLetters[idx];
                            return (
                              <button
                                key={idx}
                                onClick={() => placed && handleRemoveLetter(0, idx)}
                                className={`w-11 sm:w-14 md:w-16 h-13 sm:h-16 md:h-18 rounded-2xl font-black text-2xl sm:text-3xl md:text-4xl border-2 sm:border-3 flex items-center justify-center transition-all cursor-pointer ${
                                  sPlayer.isSuccess
                                    ? 'bg-emerald-500 text-white border-emerald-300 shadow-xl scale-105'
                                    : placed
                                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-white/10 border-dashed border-white/40 text-transparent hover:bg-white/15'
                                }`}
                              >
                                {placed ? placed.char : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Çorbadaki Harfler */}
                      <div className="relative z-10 w-full shrink-0 flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className="text-xs sm:text-sm font-black text-center text-amber-300 uppercase tracking-widest">
                          ÇORBADAKİ HARFLER
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                          {currentW.scrambled.map((char, poolIdx) => {
                            const isUsed = sPlayer.usedPoolIndices.includes(poolIdx);
                            return (
                              <button
                                key={poolIdx}
                                disabled={isUsed || sPlayer.isSuccess !== null}
                                onClick={() => handlePickLetter(0, char, poolIdx)}
                                className={`w-11 sm:w-13 md:w-15 h-13 sm:h-15 md:h-17 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all shadow-md cursor-pointer active:scale-95 ${
                                  isUsed
                                    ? 'opacity-20 bg-slate-800 border border-slate-700 pointer-events-none'
                                    : 'bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 border-2 border-amber-200 hover:scale-105'
                                }`}
                              >
                                {char}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: ACTIONS (TEMİZLE & KONTROL ET) */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-1 shrink-0 w-full mt-1">
                    <button
                      onClick={() => handleClearLetters(0)}
                      disabled={sPlayer.placedLetters.length === 0 || sPlayer.isSuccess !== null}
                      className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 border border-slate-700 shadow-md active:scale-95"
                      title="Harfleri Temizle"
                    >
                      <RotateCcw size={16} />
                      <span>Temizle</span>
                    </button>
                    <button
                      onClick={() => handleCheckWord(0)}
                      disabled={sPlayer.placedLetters.length !== currentW.word.length || sPlayer.isSuccess !== null}
                      className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base md:text-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 uppercase tracking-wider active:scale-95"
                    >
                      <Check size={20} /> KONTROL ET
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })() : (
        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${
          playerMode === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
        } min-h-0 items-stretch`}>
          {players.map((player, pIdx) => {
            const currentW = words[player.wordIndex % words.length];
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
                className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-2.5 flex flex-col justify-between shadow-xl min-h-0 overflow-y-auto no-scrollbar`}
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
                      Kelime: {player.wordIndex + 1}/4
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-orange-400 text-slate-950 font-black text-xs">
                      {player.score} P
                    </span>
                  </div>
                </div>

                {/* İpucu Kutusu */}
                <div className="bg-black/50 border border-orange-500/30 rounded-xl p-1.5 mb-1 flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-xl shrink-0">
                    {currentW.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] uppercase font-bold text-orange-300 tracking-wider">İpucu</div>
                    <div className="text-xs sm:text-sm text-slate-200 font-semibold leading-tight truncate">
                      {currentW.hint}
                    </div>
                  </div>
                </div>

                {/* 2. BÖLÜM: Çorba Tenceresi & Oluşturulan Kelime Yuvaları (Çizgili Defter Alanı) */}
                <div 
                  className={`p-2 sm:p-2.5 rounded-2xl border-2 ${
                    player.showError ? 'border-rose-500 animate-shake' : player.isSuccess ? 'border-emerald-400' : 'border-amber-300/80'
                  } flex-1 min-h-0 my-1 flex flex-col items-center justify-center gap-1.5 shadow-md`}
                  style={{
                    backgroundColor: '#ffffff',
                    backgroundImage: `
                      linear-gradient(to right, transparent 32px, rgba(239, 68, 68, 0.7) 32px, rgba(239, 68, 68, 0.7) 34px, transparent 34px),
                      repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, rgba(147, 197, 253, 0.6) 23px, rgba(147, 197, 253, 0.6) 24px),
                      linear-gradient(135deg, #ffffff 0%, #ffffff 100%)
                    `
                  }}
                >
                  <div className="text-[10.5px] font-bold text-slate-800">
                    🍲 Harfleri tıkla, doğru kelimeyi deftere yaz:
                  </div>

                  {/* Kelime Yuvaları */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {Array.from({ length: currentW.word.length }).map((_, idx) => {
                      const placed = player.placedLetters[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => placed && handleRemoveLetter(pIdx, idx)}
                          className={`w-8 sm:w-10 h-9 sm:h-11 rounded-xl font-black text-base sm:text-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            player.isSuccess
                              ? 'bg-emerald-500 text-white border-emerald-300 shadow-lg scale-105'
                              : placed
                              ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-md hover:scale-105'
                              : 'bg-white/10 border-dashed border-white/30 text-transparent'
                          }`}
                        >
                          {placed ? placed.char : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Karışık Harfler Havuzu */}
                <div className="my-1 shrink-0">
                  <div className="text-[9.5px] text-center font-bold text-amber-300/80 mb-1 uppercase">
                    Çorbadaki Harfler
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                    {currentW.scrambled.map((char, poolIdx) => {
                      const isUsed = player.usedPoolIndices.includes(poolIdx);
                      return (
                        <button
                          key={poolIdx}
                          disabled={isUsed || player.isSuccess !== null}
                          onClick={() => handlePickLetter(pIdx, char, poolIdx)}
                          className={`w-7 sm:w-9 h-8 sm:h-10 rounded-xl font-black text-sm sm:text-lg transition-all shadow cursor-pointer active:scale-95 ${
                            isUsed
                              ? 'opacity-20 bg-slate-800 border border-slate-700 pointer-events-none'
                              : 'bg-gradient-to-b from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950 border border-orange-300'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. BÖLÜM: Butonlar: Temizle & Kontrol Et */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/15 shrink-0">
                  <button
                    onClick={() => handleClearLetters(pIdx)}
                    disabled={player.placedLetters.length === 0 || player.isSuccess !== null}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Harfleri Temizle"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden xs:inline">Temizle</span>
                  </button>
                  <button
                    onClick={() => handleCheckWord(pIdx)}
                    disabled={player.placedLetters.length !== currentW.word.length || player.isSuccess !== null}
                    className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Check size={16} /> KONTROL ET
                  </button>
                </div>
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

      {/* Victory Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 animate-fade-in">
          <div className="bg-gradient-to-b from-[#2e1d0f] to-[#120b05] border-2 border-orange-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              🍲
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-orange-300 uppercase">
              Harf Çorbası Hazır!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Kelimeleri ustalıkla çözdün ve lezzetli harf çorbalarını afiyetle pişirdin!
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
                    <span className="text-base font-black text-orange-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
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
