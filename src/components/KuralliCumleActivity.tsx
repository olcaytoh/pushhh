import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Shuffle, HelpCircle, 
  Volume2, ArrowRight, ArrowLeft, Trophy, Star, Award, 
  GripVertical, ChevronLeft, ChevronRight, Home, Heart, XCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';
import { StudentAvatarDock } from './StudentAvatarDock';

export type GradeLevel = 1 | 2 | 3 | 4;

export interface KuralliCumleActivityProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  initialGrade?: number;
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

interface SentenceData {
  id: string;
  grade: GradeLevel;
  themeTitle: string;
  themeEmoji: string;
  categoryTheme: 'nature' | 'animals' | 'space' | 'school' | 'robot';
  themeGradient: string;
  borderColor: string;
  glowColor: string;
  correctWords: string[];
  punctuation: string;
  didacticHint: string;
  funFact: string;
}

const GRADE_SENTENCES: Record<GradeLevel, SentenceData[]> = {
  // 1. SINIF: 3 KELİMEYE SAHİP CÜMLELER
  1: [
    {
      id: "g1-1",
      grade: 1,
      themeTitle: "Elma Bahçesi",
      themeEmoji: "🍎",
      categoryTheme: 'nature',
      themeGradient: "from-[#2f0e14] via-[#45141e] to-[#2f0e14]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Ali", "elma", "yedi"],
      punctuation: ".",
      didacticHint: "Türkçe kurallı cümlelerde iş, oluş, hareket bildiren eylem (yüklem) cümlenin en sonunda yer alır. Bu cümlede 'yedi' kelimesi en sonda olmalıdır!",
      funFact: "Elmalar C vitamini bakımından çok zengindir ve bize enerji verir!"
    },
    {
      id: "g1-2",
      grade: 1,
      themeTitle: "Sevimli Kedi",
      themeEmoji: "🐱",
      categoryTheme: 'animals',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Kedi", "süt", "içti"],
      punctuation: ".",
      didacticHint: "İşi yapan (Kedi) başta, yapılan hareket (içti) cümlenin en sonunda bulunur!",
      funFact: "Kediler karanlıkta insanlardan yaklaşık 6 kat daha iyi görürler!"
    },
    {
      id: "g1-3",
      grade: 1,
      themeTitle: "Pırıl Pırıl Sabah",
      themeEmoji: "☀️",
      categoryTheme: 'nature',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Güneş", "neşeyle", "doğdu"],
      punctuation: ".",
      didacticHint: "Hareket bildiren 'doğdu' eylemi cümlenin en sonunda yer almalıdır!",
      funFact: "Güneş ışınları Dünya'mıza yaklaşık 8 dakikada ulaşır!"
    },
    {
      id: "g1-4",
      grade: 1,
      themeTitle: "Kitap Sevgisi",
      themeEmoji: "📖",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Ayşe", "kitap", "okudu"],
      punctuation: ".",
      didacticHint: "İşi yapan 'Ayşe' başta, yapılan eylem olan 'okudu' en sonda yer alır!",
      funFact: "Her gün düzenli kitap okumak hayal gücünü ve hafızayı güçlendirir!"
    },
    {
      id: "g1-5",
      grade: 1,
      themeTitle: "Mavi Gökyüzü",
      themeEmoji: "🕊️",
      categoryTheme: 'animals',
      themeGradient: "from-[#171138] via-[#241a52] to-[#171138]",
      borderColor: "border-violet-400",
      glowColor: "shadow-[0_0_20px_rgba(167,139,250,0.35)]",
      correctWords: ["Kuşlar", "gökyüzünde", "uçtu"],
      punctuation: ".",
      didacticHint: "'uçtu' eylemi cümlenin yüklemidir ve kurallı cümlelerde en sonda yer alır!",
      funFact: "Kuşların kemikleri hafif ve içi boş olduğu için gökyüzünde rahatça uçarlar!"
    }
  ],

  // 2. SINIF: 4 KELİMEYE SAHİP CÜMLELER
  2: [
    {
      id: "g2-1",
      grade: 2,
      themeTitle: "Orman Macerası",
      themeEmoji: "🐿️",
      categoryTheme: 'animals',
      themeGradient: "from-[#2b1807] via-[#3f240b] to-[#2b1807]",
      borderColor: "border-amber-500",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Küçük", "sincap", "ceviz", "topladı"],
      punctuation: ".",
      didacticHint: "İşi yapan 'Küçük sincap' başta, yapılan işi belirten 'topladı' en sonda yer alır!",
      funFact: "Sincaplar toprağa sakladıkları cevizleri unutarak yeni ağaçların büyümesine vesile olurlar!"
    },
    {
      id: "g2-2",
      grade: 2,
      themeTitle: "Okul Bahçesi",
      themeEmoji: "🏃",
      categoryTheme: 'school',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çocuklar", "bahçede", "hızlıca", "koştu"],
      punctuation: ".",
      didacticHint: "Eylem olan 'koştu' kelimesi cümlenin sonunda bulunmalıdır!",
      funFact: "Koşmak kalp sağlığımızı korur ve vücudumuzun mutluluk hormonu salgılamasını sağlar!"
    },
    {
      id: "g2-3",
      grade: 2,
      themeTitle: "Çiçekli Balkon",
      themeEmoji: "🌸",
      categoryTheme: 'nature',
      themeGradient: "from-[#331122] via-[#4d1933] to-[#331122]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Annem", "balkondaki", "çiçekleri", "suladı"],
      punctuation: ".",
      didacticHint: "Cümlede yapılan işi bildiren 'suladı' kelimesi yüklemdir ve sonda yer almalıdır!",
      funFact: "Çiçekler sabahın erken saatlerinde sulandığında suyu köklerine çok daha verimli çekerler!"
    },
    {
      id: "g2-4",
      grade: 2,
      themeTitle: "Gece Masalı",
      themeEmoji: "🌙",
      categoryTheme: 'school',
      themeGradient: "from-[#111936] via-[#1b2654] to-[#111936]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      correctWords: ["Dedem", "bize", "güzel", "masal", "anlattı"],
      punctuation: ".",
      didacticHint: "'anlattı' eylemi cümlenin yüklemi olduğu için cümlenin sonunda olmalıdır!",
      funFact: "Masallar yüzyıllar boyunca dilden dile aktarılarak günümüze kadar ulaşmış kültürel mirasımızdır!"
    },
    {
      id: "g2-5",
      grade: 2,
      themeTitle: "Resim Atölyesi",
      themeEmoji: "🎨",
      categoryTheme: 'school',
      themeGradient: "from-[#2a1708] via-[#3d220c] to-[#2a1708]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      correctWords: ["Can", "rengarenk", "resimler", "çizdi"],
      punctuation: ".",
      didacticHint: "Resmi yapan 'Can' başta, yapılan işi bildiren 'çizdi' yüklemi ise en sonda olmalıdır!",
      funFact: "Resim yapmak el-göz koordinasyonunu ve yaratıcı düşünme becerilerini geliştirir!"
    }
  ],

  // 3. SINIF: 5 KELİMEYE SAHİP CÜMLELER
  3: [
    {
      id: "g3-1",
      grade: 3,
      themeTitle: "Uzay Keşfi",
      themeEmoji: "🚀",
      categoryTheme: 'space',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Cesur", "astronot", "uzay", "gemisine", "bindi"],
      punctuation: ".",
      didacticHint: "Eylemi yapan 'Cesur astronot' cümlenin başında, yapılan eylem 'bindi' en sonda bulunmalıdır!",
      funFact: "Astronotlar uzayda yerçekimi olmadığı için özel uzay giysileriyle hareket ederler!"
    },
    {
      id: "g3-2",
      grade: 3,
      themeTitle: "Parkta Oyun",
      themeEmoji: "🐕",
      categoryTheme: 'animals',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Yavru", "köpek", "sokakta", "top", "oynadı"],
      punctuation: ".",
      didacticHint: "'Yavru köpek' özne olarak başta, 'oynadı' eylemi cümlenin en sonunda yer alır!",
      funFact: "Köpeklerin koku alma duyusu insanlarınkinden binlerce kat daha güçlüdür!"
    },
    {
      id: "g3-3",
      grade: 3,
      themeTitle: "Müzik Dersi",
      themeEmoji: "🎵",
      categoryTheme: 'school',
      themeGradient: "from-[#2c0f24] via-[#411635] to-[#2c0f24]",
      borderColor: "border-fuchsia-400",
      glowColor: "shadow-[0_0_20px_rgba(244,114,182,0.35)]",
      correctWords: ["Öğretmenimiz", "sınıfta", "yeni", "şarkı", "öğretti"],
      punctuation: ".",
      didacticHint: "İşi yapan 'Öğretmenimiz' başta, eylem 'öğretti' cümlenin sonunda olmalıdır!",
      funFact: "Müzik dinlemek ve şarkı söylemek beynimizin iki yarım küresini birden çalıştırır!"
    },
    {
      id: "g3-4",
      grade: 3,
      themeTitle: "Tarih Öncesi Orman",
      themeEmoji: "🦖",
      categoryTheme: 'animals',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Yeşil", "dinozor", "ormanda", "meyveleri", "yedi"],
      punctuation: ".",
      didacticHint: "Cümlede yapılan iş olan 'yedi' kelimesi yüklemdir ve cümlenin sonunda yer alır!",
      funFact: "Bazı otçul dinozorlar günde yüzlerce kilo yaprak ve meyve tüketebilirdi!"
    },
    {
      id: "g3-5",
      grade: 3,
      themeTitle: "Karınca Yuvası",
      themeEmoji: "🐜",
      categoryTheme: 'nature',
      themeGradient: "from-[#1e1e24] via-[#2e2e38] to-[#1e1e24]",
      borderColor: "border-stone-400",
      glowColor: "shadow-[0_0_20px_rgba(168,162,158,0.35)]",
      correctWords: ["Çalışkan", "karıncalar", "yuvalarına", "buğday", "taşıdı"],
      punctuation: ".",
      didacticHint: "Hareket bildiren 'taşıdı' eylemi kurallı cümle gereği en sona yerleştirilmelidir!",
      funFact: "Karıncalar kendi vücut ağırlıklarının 20 katına kadar yük taşıyabilirler!"
    }
  ],

  // 4. SINIF: 6 KELİMEYE SAHİP CÜMLELER
  4: [
    {
      id: "g4-1",
      grade: 4,
      themeTitle: "Robot Fabrikası",
      themeEmoji: "🤖",
      categoryTheme: 'robot',
      themeGradient: "from-[#08222a] via-[#0d3440] to-[#08222a]",
      borderColor: "border-cyan-400",
      glowColor: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
      correctWords: ["Akıllı", "robot", "fabrikada", "parçaları", "başarıyla", "birleştirdi"],
      punctuation: ".",
      didacticHint: "Cümlenin yüklemi olan 'birleştirdi' kelimesi kurallı cümlelerde mutlaka en sonda olmalıdır!",
      funFact: "Sanayi robotları milimetrenin binde biri hassasiyetle parça yerleştirebilir!"
    },
    {
      id: "g4-2",
      grade: 4,
      themeTitle: "Derin Denizler",
      themeEmoji: "🐬",
      categoryTheme: 'animals',
      themeGradient: "from-[#0a1e38] via-[#0f2d54] to-[#0a1e38]",
      borderColor: "border-blue-400",
      glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.35)]",
      correctWords: ["Neşeli", "yunuslar", "masmavi", "denizde", "birlikte", "dans", "etti"],
      punctuation: ".",
      didacticHint: "'dans etti' birleşik eylemi cümlenin yüklemidir ve en sonda yer almalıdır!",
      funFact: "Yunuslar ses dalgalarını kullanarak suyun altında nesneleri haritalandırabilirler!"
    },
    {
      id: "g4-3",
      grade: 4,
      themeTitle: "Tohumdan Çınara",
      themeEmoji: "🌱",
      categoryTheme: 'nature',
      themeGradient: "from-[#0c2512] via-[#13381b] to-[#0c2512]",
      borderColor: "border-green-400",
      glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.35)]",
      correctWords: ["Bahçıvan", "özenle", "toprağa", "küçük", "fidanlar", "dikti"],
      punctuation: ".",
      didacticHint: "Eylemi yapan 'Bahçıvan' başta, yapılan işi bildiren 'dikti' yüklemi en sonda yer alır!",
      funFact: "Tek bir meşe ağacı ömrü boyunca milyonlarca meşe palamudu üretebilir!"
    },
    {
      id: "g4-4",
      grade: 4,
      themeTitle: "Okyanus Yolculuğu",
      themeEmoji: "⛵",
      categoryTheme: 'nature',
      themeGradient: "from-[#091b2c] via-[#0e2944] to-[#091b2c]",
      borderColor: "border-teal-400",
      glowColor: "shadow-[0_0_20px_rgba(20,184,166,0.35)]",
      correctWords: ["Kaptan", "fırtınalı", "denizde", "gemisini", "güvenle", "limana", "yanaştırdı"],
      punctuation: ".",
      didacticHint: "Cümlenin yüklemi 'yanaştırdı' kelimesidir ve kurallı cümlelerde yüklem daima sonda yer alır!",
      funFact: "Modern gemiler dev dalgalarda savrulmamak için akıllı jiroskopik dengeleyiciler kullanırlar!"
    },
    {
      id: "g4-5",
      grade: 4,
      themeTitle: "Bilim Laboratuvarı",
      themeEmoji: "🔬",
      categoryTheme: 'school',
      themeGradient: "from-[#180f33] via-[#271952] to-[#180f33]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(129,140,248,0.35)]",
      correctWords: ["Meraklı", "bilim", "insanı", "laboratuvarda", "buluşlar", "yaptı"],
      punctuation: ".",
      didacticHint: "'yaptı' eylemi cümlenin yüklemidir ve kurallı cümle yapısında en sonda yer alır!",
      funFact: "Tarihteki en büyük buluşların çoğu, bilim insanlarının bitmek bilmeyen merak duygusuyla ortaya çıkmıştır!"
    }
  ]
};

interface WordItem {
  id: string;
  text: string;
}

// Fisher-Yates shuffle that ensures the scrambled words are NOT already in correct order
function shuffleWords(words: string[]): WordItem[] {
  let items = words.map((w, idx) => ({ id: `${idx}-${w}`, text: w }));
  let isIdentical = true;
  let attempts = 0;

  while (isIdentical && attempts < 20) {
    attempts++;
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    // Check if exactly equals original
    isIdentical = items.every((item, i) => item.text === words[i]);
  }
  return items;
}

const TARGET_WIN_SCORE = 7;
const MAX_MISTAKES = 3;

export const KuralliCumleActivity: React.FC<KuralliCumleActivityProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  initialGrade,
  playerCountMode = 1,
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
  const [activePlayerMode, setActivePlayerMode] = useState<1 | 2 | 3>(playerCountMode || 1);

  // Sync mode with parent
  useEffect(() => {
    if (playerCountMode && playerCountMode !== activePlayerMode) {
      setActivePlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 24), [students]);

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => {
    if (initialGrade && initialGrade >= 1 && initialGrade <= 4) {
      return initialGrade as GradeLevel;
    }
    return 1;
  });

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const currentGradeSentences = GRADE_SENTENCES[selectedGrade];
  const currentSentence = currentGradeSentences[currentSentenceIndex] || currentGradeSentences[0];

  // -------------------------------------------------------------------------
  // 1 OYUNCU MODU DURUMLARI
  // -------------------------------------------------------------------------
  const [words, setWords] = useState<WordItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showErrorShake, setShowErrorShake] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // -------------------------------------------------------------------------
  // 2 VE 3 OYUNCU MODU DURUMLARI
  // -------------------------------------------------------------------------
  const [p1Words, setP1Words] = useState<WordItem[]>([]);
  const [p2Words, setP2Words] = useState<WordItem[]>([]);
  const [p3Words, setP3Words] = useState<WordItem[]>([]);

  const [p1SelectedIdx, setP1SelectedIdx] = useState<number | null>(null);
  const [p2SelectedIdx, setP2SelectedIdx] = useState<number | null>(null);
  const [p3SelectedIdx, setP3SelectedIdx] = useState<number | null>(null);

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player3Score, setPlayer3Score] = useState(0);

  const [player1Mistakes, setPlayer1Mistakes] = useState(0);
  const [player2Mistakes, setPlayer2Mistakes] = useState(0);
  const [player3Mistakes, setPlayer3Mistakes] = useState(0);

  const [p1Shake, setP1Shake] = useState(false);
  const [p2Shake, setP2Shake] = useState(false);
  const [p3Shake, setP3Shake] = useState(false);

  const [roundWinner, setRoundWinner] = useState<'p1' | 'p2' | 'p3' | null>(null);
  const [matchWinner, setMatchWinner] = useState<'p1' | 'p2' | 'p3' | null>(null);

  const triggerSound = useCallback((src: string) => {
    if (playMp3) {
      playMp3(src);
    }
  }, [playMp3]);

  // Yeni Tur veya Cümle Hazırla
  const initRoundWords = useCallback((sentence: SentenceData) => {
    if (!sentence) return;
    const shuffled1 = shuffleWords(sentence.correctWords);
    const shuffled2 = shuffleWords(sentence.correctWords);
    const shuffled3 = shuffleWords(sentence.correctWords);

    setWords(shuffled1);
    setP1Words(shuffled1);
    setP2Words(shuffled2);
    setP3Words(shuffled3);

    setP1SelectedIdx(null);
    setP2SelectedIdx(null);
    setP3SelectedIdx(null);
    setSelectedWordIndex(null);

    setIsCorrect(false);
    setShowErrorShake(false);
    setP1Shake(false);
    setP2Shake(false);
    setP3Shake(false);
    setRoundWinner(null);
  }, []);

  // Cümle veya seviye değişince kur
  useEffect(() => {
    if (currentSentence) {
      initRoundWords(currentSentence);
    }
  }, [selectedGrade, currentSentenceIndex, initRoundWords]);

  // Sınıf değiştir
  const handleGradeChange = (grade: GradeLevel) => {
    if (grade === selectedGrade) return;
    triggerSound('/op.mp3');
    setSelectedGrade(grade);
    setCurrentSentenceIndex(0);
  };

  // Sesli Oku
  const speakSentence = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {}
  };

  // Re-shuffle current sentence
  const handleShuffle = () => {
    triggerSound('/op.mp3');
    if (currentSentence) {
      initRoundWords(currentSentence);
    }
  };

  // Mod Değiştir (1, 2 veya 3)
  const handleSwitchMode = (mode: 1 | 2 | 3) => {
    triggerSound('/op.mp3');
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
    setMatchWinner(null);
    setRoundWinner(null);
    if (currentSentence) {
      initRoundWords(currentSentence);
    }
  };

  // =========================================================================
  // 1 OYUNCU MODU TIKLAMA VE KONTROL
  // =========================================================================
  const handleWordClick = (index: number) => {
    if (isCorrect) return;

    if (selectedWordIndex === null) {
      setSelectedWordIndex(index);
      triggerSound('/op.mp3');
    } else if (selectedWordIndex === index) {
      setSelectedWordIndex(null);
      triggerSound('/op.mp3');
    } else {
      const updated = [...words];
      const temp = updated[selectedWordIndex];
      updated[selectedWordIndex] = updated[index];
      updated[index] = temp;

      setWords(updated);
      setSelectedWordIndex(null);
      triggerSound('/coin.mp3');
    }
  };

  const moveWord = (index: number, direction: 'left' | 'right') => {
    if (isCorrect) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= words.length) return;

    const updated = [...words];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setWords(updated);
    setSelectedWordIndex(null);
    triggerSound('/op.mp3');
  };

  const handleCheck = () => {
    const currentOrder = words.map(w => w.text);
    const correctOrder = currentSentence.correctWords;
    const isMatch = currentOrder.every((w, i) => w === correctOrder[i]);

    if (isMatch) {
      setIsCorrect(true);
      setShowErrorShake(false);
      triggerSound('/farklilvl.mp3');

      if (onQuestionAnswered) {
        onQuestionAnswered(true);
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      const nextCompleted = completedSentences.includes(currentSentence.id) 
        ? completedSentences 
        : [...completedSentences, currentSentence.id];
      setCompletedSentences(nextCompleted);

      const gradeCompletedCount = currentGradeSentences.filter(s => nextCompleted.includes(s.id)).length;
      if (gradeCompletedCount >= currentGradeSentences.length) {
        setTimeout(() => {
          setShowVictoryModal(true);
          triggerSound('/para.mp3');
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        }, 1200);
      }
    } else {
      setIsCorrect(false);
      setShowErrorShake(true);
      triggerSound('/hata.mp3');

      if (onQuestionAnswered) {
        onQuestionAnswered(false);
      }

      setTimeout(() => setShowErrorShake(false), 800);
    }
  };

  const handleNextSentence = () => {
    triggerSound('/nextlvl.mp3');
    if (currentSentenceIndex < currentGradeSentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      setShowVictoryModal(true);
    }
  };

  // =========================================================================
  // 2 VE 3 OYUNCU (KAPIŞMA) KELİME TIKLAMA VE KONTROL MANTIĞI
  // =========================================================================
  const handleMultiWordClick = (player: 'p1' | 'p2' | 'p3', index: number) => {
    if (roundWinner || matchWinner) return;

    if (player === 'p1') {
      if (p1SelectedIdx === null) {
        setP1SelectedIdx(index);
        triggerSound('/op.mp3');
      } else if (p1SelectedIdx === index) {
        setP1SelectedIdx(null);
      } else {
        const copy = [...p1Words];
        const temp = copy[p1SelectedIdx];
        copy[p1SelectedIdx] = copy[index];
        copy[index] = temp;
        setP1Words(copy);
        setP1SelectedIdx(null);
        triggerSound('/coin.mp3');
      }
    } else if (player === 'p2') {
      if (p2SelectedIdx === null) {
        setP2SelectedIdx(index);
        triggerSound('/op.mp3');
      } else if (p2SelectedIdx === index) {
        setP2SelectedIdx(null);
      } else {
        const copy = [...p2Words];
        const temp = copy[p2SelectedIdx];
        copy[p2SelectedIdx] = copy[index];
        copy[index] = temp;
        setP2Words(copy);
        setP2SelectedIdx(null);
        triggerSound('/coin.mp3');
      }
    } else if (player === 'p3') {
      if (p3SelectedIdx === null) {
        setP3SelectedIdx(index);
        triggerSound('/op.mp3');
      } else if (p3SelectedIdx === index) {
        setP3SelectedIdx(null);
      } else {
        const copy = [...p3Words];
        const temp = copy[p3SelectedIdx];
        copy[p3SelectedIdx] = copy[index];
        copy[index] = temp;
        setP3Words(copy);
        setP3SelectedIdx(null);
        triggerSound('/coin.mp3');
      }
    }
  };

  // Çok oyunculu kontrol butonu
  const handleMultiCheck = (player: 'p1' | 'p2' | 'p3') => {
    if (roundWinner || matchWinner) return;

    const targetWords = player === 'p1' ? p1Words : player === 'p2' ? p2Words : p3Words;
    const currentOrder = targetWords.map(w => w.text);
    const correctOrder = currentSentence.correctWords;
    const isMatch = currentOrder.every((w, i) => w === correctOrder[i]);

    if (isMatch) {
      setRoundWinner(player);
      triggerSound('/correct.mp3');

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 }
      });

      if (onQuestionAnswered) onQuestionAnswered(true);

      let nextScore = 0;
      if (player === 'p1') {
        nextScore = player1Score + 1;
        setPlayer1Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p1');
          return;
        }
      } else if (player === 'p2') {
        nextScore = player2Score + 1;
        setPlayer2Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p2');
          return;
        }
      } else if (player === 'p3') {
        nextScore = player3Score + 1;
        setPlayer3Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p3');
          return;
        }
      }

      // 1.5 saniye sonra sonraki cümleye geç
      setTimeout(() => {
        if (currentSentenceIndex < currentGradeSentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          setCurrentSentenceIndex(0);
        }
      }, 1500);
    } else {
      triggerSound('/hata.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false);

      if (player === 'p1') {
        setP1Shake(true);
        const nextMistakes = player1Mistakes + 1;
        setPlayer1Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setMatchWinner('p2');
          return;
        }
        setTimeout(() => setP1Shake(false), 800);
      } else if (player === 'p2') {
        setP2Shake(true);
        const nextMistakes = player2Mistakes + 1;
        setPlayer2Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setMatchWinner('p1');
          return;
        }
        setTimeout(() => setP2Shake(false), 800);
      } else if (player === 'p3') {
        setP3Shake(true);
        const nextMistakes = player3Mistakes + 1;
        setPlayer3Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setMatchWinner('p1');
          return;
        }
        setTimeout(() => setP3Shake(false), 800);
      }
    }
  };

  const handleRestartMatch = () => {
    triggerSound('/op.mp3');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer3Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setPlayer3Mistakes(0);
    setMatchWinner(null);
    setRoundWinner(null);
    if (currentSentence) {
      initRoundWords(currentSentence);
    }
  };

  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;
  const p3Student = selectedStudentIds[2] ? students?.find(s => s.id === selectedStudentIds[2]) : null;

  const assembledText = words.map(w => w.text).join(' ') + currentSentence.punctuation;
  const gradeCompletedCount = currentGradeSentences.filter(s => completedSentences.includes(s.id)).length;

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
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

      {/* 2. SUB-HEADER BAR */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className="flex items-center gap-2 px-2.5 sm:px-4 py-1 rounded-xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] border-l-4 border-l-amber-400">
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wide">
              5. DİĞER OYUNLAR
            </span>
            <span className="text-amber-400/60 font-bold">•</span>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Kurallı Cümle
            </h1>
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
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

        {/* Çok Oyunculu / Tek Oyunculu Skor Göstergeleri & Mod Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1, 2, 3 PLAYER MODE SELECTOR BUTTONS */}
          <div className="flex items-center gap-1 bg-[#0b1328] p-0.5 rounded-xl border border-slate-700/80">
            {/* 1 OYUNCU */}
            <button
              onClick={() => {
                playMp3?.('/op.mp3');
                handleSwitchMode(1);
              }}
              title="1 Oyuncu Modu (Bireysel)"
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
                handleSwitchMode(2);
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
                handleSwitchMode(3);
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

          {activePlayerMode !== 1 ? (
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl border border-white/15">
              <span className="text-rose-400 font-bold text-xs">🔴 1.P: {player1Score}</span>
              <span className="text-slate-500 font-bold">•</span>
              <span className="text-sky-400 font-bold text-xs">🔵 2.P: {player2Score}</span>
              {activePlayerMode === 3 && (
                <>
                  <span className="text-slate-500 font-bold">•</span>
                  <span className="text-emerald-400 font-bold text-xs">🟢 3.P: {player3Score}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-xl shadow-xs">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] sm:text-xs font-black text-amber-300">
                {gradeCompletedCount} / {currentGradeSentences.length}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 text-emerald-200 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Ana Sayfaya Dön"
          >
            <Home size={13} />
            <span className="hidden xs:inline">Ana Sayfa</span>
          </button>

          <button
            onClick={onClose}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Kapat"
          >
            ✕ <span className="hidden xs:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* 3. OYUN ALANI (ORTA ALAN) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between w-full overflow-y-auto no-scrollbar p-1.5 sm:p-2.5">
        
        {/* Sınıf Düzeyi Seçici */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 shrink-0 pt-0.5 flex-wrap">
          {([1, 2, 3, 4] as const).map((gradeNum) => {
            const isGradeActive = selectedGrade === gradeNum;
            const wordsCount = gradeNum + 2;
            return (
              <button
                key={gradeNum}
                onClick={() => handleGradeChange(gradeNum)}
                className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md ${
                  isGradeActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-105 border-2 border-white/60'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/80'
                }`}
              >
                <span>{gradeNum}. Sınıf</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isGradeActive ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-900/60 text-slate-300'
                }`}>
                  {wordsCount} Kelime
                </span>
              </button>
            );
          })}
        </div>

        {/* =================================================================== */}
        {/* A) 1 OYUNCU MODU */}
        {/* =================================================================== */}
        {activePlayerMode === 1 ? (
          <div className="w-full flex-1 flex flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1850px] mx-auto min-h-0 overflow-hidden px-1 sm:px-2">
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

            <main className="flex-1 max-w-4xl w-full flex flex-col items-center justify-center gap-2.5 py-2">
            
            {/* Cümle Kartı Başlığı */}
            <div className="flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-2xl border border-white/15 shadow-md">
              <span className="text-xl">{currentSentence.themeEmoji}</span>
              <span className="text-base font-black text-amber-300 uppercase tracking-wide">
                {currentSentence.themeTitle}
              </span>
              <span className="text-xs text-slate-400">
                ({currentSentenceIndex + 1} / {currentGradeSentences.length})
              </span>
            </div>

            {/* Kelimeler Alanı */}
            <div className={`w-full max-w-3xl p-4 sm:p-6 rounded-3xl bg-gradient-to-b ${currentSentence.themeGradient} border-2 ${currentSentence.borderColor} ${currentSentence.glowColor} shadow-2xl flex flex-col items-center gap-4 transition-all ${
              showErrorShake ? 'animate-shake' : ''
            }`}>
              
              <div className="text-xs sm:text-sm font-semibold text-slate-300 text-center">
                👉 Kelimelere tıklayarak veya sürükleyerek kurallı cümle oluştur!
              </div>

              {/* Kelime Butonları / Blokları */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-2">
                {words.map((word, idx) => {
                  const isSelected = selectedWordIndex === idx;
                  return (
                    <button
                      key={word.id}
                      onClick={() => handleWordClick(idx)}
                      className={`relative px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-black text-base sm:text-xl md:text-2xl transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-500 text-white border-2 border-emerald-300 shadow-emerald-500/50'
                          : isSelected
                          ? 'bg-amber-400 text-slate-950 border-3 border-white ring-4 ring-amber-300/80 scale-105'
                          : 'bg-white text-slate-900 hover:bg-amber-100 border-2 border-slate-300'
                      }`}
                    >
                      <span className="text-xs opacity-40 select-none">#{idx + 1}</span>
                      <span>{word.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Önizleme Cümlesi */}
              <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">
                  Oluşturulan Cümle
                </span>
                <span className={`text-base sm:text-xl font-black ${
                  isCorrect ? 'text-emerald-400' : 'text-white'
                }`}>
                  "{assembledText}"
                </span>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={handleShuffle}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition"
                  title="Kelimeleri Karıştır"
                >
                  <Shuffle size={14} />
                  <span>Karıştır</span>
                </button>

                {!isCorrect ? (
                  <button
                    onClick={handleCheck}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg border border-emerald-300 flex items-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    <span>KONTROL ET</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextSentence}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg border border-amber-200 flex items-center gap-2 cursor-pointer transition active:scale-95 animate-bounce"
                  >
                    <span>SONRAKİ CÜMLE</span>
                    <ArrowRight size={18} />
                  </button>
                )}

                <button
                  onClick={() => speakSentence(assembledText)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition"
                  title="Sesli Oku"
                >
                  <Volume2 size={14} />
                  <span>Dinle</span>
                </button>
              </div>

              {/* Didaktik İpucu ve Eğlenceli Bilgi */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2">
                  <HelpCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-300">Kurallı Cümle Kuralı:</span>
                    <span>{currentSentence.didacticHint}</span>
                  </div>
                </div>

                <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-2.5 text-xs text-sky-200 flex items-start gap-2">
                  <Sparkles size={15} className="text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sky-300">Biliyor muydunuz?</span>
                    <span>{currentSentence.funFact}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

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
          /* B) 2 VE 3 OYUNCU MODU (KAPIŞMA DÜELLOSU) */
          /* =================================================================== */
          <main className="flex-1 w-full flex flex-col items-center justify-between gap-2 py-1">
            
            {/* Cümle Konusu Bilgi Şeridi */}
            <div className="bg-black/60 px-4 py-1 rounded-2xl border border-white/20 flex items-center gap-2">
              <span className="text-lg">{currentSentence.themeEmoji}</span>
              <span className="text-sm font-black text-amber-300 uppercase">
                {currentSentence.themeTitle}
              </span>
              <span className="text-xs text-slate-300">
                — Cümleyi ilk kurup "KONTROL ET" butonuna basan kazanır!
              </span>
            </div>

            {/* Oyuncu Alanları (2 veya 3 sütun) */}
            <div className="w-full flex-1 flex flex-row gap-2 sm:gap-3 min-h-[340px]">
              
              {/* 1. OYUNCU (KIRMIZI / KAPLAN) */}
              <div className={`flex-1 rounded-2xl bg-[#3f161f]/90 border-2 ${
                roundWinner === 'p1' ? 'border-emerald-400 ring-4 ring-emerald-400/50' : 'border-rose-500/80'
              } p-2 sm:p-3 flex flex-col justify-between shadow-xl transition-all ${
                p1Shake ? 'animate-shake' : ''
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-rose-500/30 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🔴</span>
                    <span className="font-black text-rose-200 text-xs sm:text-sm uppercase truncate max-w-[130px]">
                      {p1Student ? p1Student.name : '1. Oyuncu'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-amber-300 text-xs sm:text-sm">{player1Score} Puan</span>
                    <div className="flex items-center gap-0.5">
                      {[0, 1, 2].map(idx => (
                        <span key={idx} className={idx >= (MAX_MISTAKES - player1Mistakes) ? 'opacity-30 grayscale' : ''}>
                          {idx < (MAX_MISTAKES - player1Mistakes) ? '❤️' : '❌'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kelimeler Listesi */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-auto">
                  {p1Words.map((word, idx) => {
                    const isSel = p1SelectedIdx === idx;
                    return (
                      <button
                        key={`p1-${word.id}`}
                        onClick={() => handleMultiWordClick('p1', idx)}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-base transition-all active:scale-95 cursor-pointer shadow-md ${
                          roundWinner === 'p1'
                            ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                            : isSel
                            ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105'
                            : 'bg-white text-slate-950 hover:bg-rose-100 border border-slate-300'
                        }`}
                      >
                        {word.text}
                      </button>
                    );
                  })}
                </div>

                {/* Önizleme & Kontrol Butonu */}
                <div className="pt-2 border-t border-rose-500/30 flex flex-col gap-1.5">
                  <div className="text-[11px] text-rose-100/90 text-center truncate px-1">
                    "{p1Words.map(w => w.text).join(' ')}"
                  </div>
                  <button
                    onClick={() => handleMultiCheck('p1')}
                    className="w-full py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-rose-300 active:scale-95 cursor-pointer"
                  >
                    ✓ KONTROL ET
                  </button>
                </div>
              </div>

              {/* 2. OYUNCU (MAVİ / EJDERHA) */}
              <div className={`flex-1 rounded-2xl bg-[#132847]/90 border-2 ${
                roundWinner === 'p2' ? 'border-emerald-400 ring-4 ring-emerald-400/50' : 'border-sky-500/80'
              } p-2 sm:p-3 flex flex-col justify-between shadow-xl transition-all ${
                p2Shake ? 'animate-shake' : ''
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-sky-500/30 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🔵</span>
                    <span className="font-black text-sky-200 text-xs sm:text-sm uppercase truncate max-w-[130px]">
                      {p2Student ? p2Student.name : '2. Oyuncu'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-amber-300 text-xs sm:text-sm">{player2Score} Puan</span>
                    <div className="flex items-center gap-0.5">
                      {[0, 1, 2].map(idx => (
                        <span key={idx} className={idx >= (MAX_MISTAKES - player2Mistakes) ? 'opacity-30 grayscale' : ''}>
                          {idx < (MAX_MISTAKES - player2Mistakes) ? '❤️' : '❌'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kelimeler Listesi */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-auto">
                  {p2Words.map((word, idx) => {
                    const isSel = p2SelectedIdx === idx;
                    return (
                      <button
                        key={`p2-${word.id}`}
                        onClick={() => handleMultiWordClick('p2', idx)}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-base transition-all active:scale-95 cursor-pointer shadow-md ${
                          roundWinner === 'p2'
                            ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                            : isSel
                            ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105'
                            : 'bg-white text-slate-950 hover:bg-sky-100 border border-slate-300'
                        }`}
                      >
                        {word.text}
                      </button>
                    );
                  })}
                </div>

                {/* Önizleme & Kontrol Butonu */}
                <div className="pt-2 border-t border-sky-500/30 flex flex-col gap-1.5">
                  <div className="text-[11px] text-sky-100/90 text-center truncate px-1">
                    "{p2Words.map(w => w.text).join(' ')}"
                  </div>
                  <button
                    onClick={() => handleMultiCheck('p2')}
                    className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-sky-300 active:scale-95 cursor-pointer"
                  >
                    ✓ KONTROL ET
                  </button>
                </div>
              </div>

              {/* 3. OYUNCU (YEŞİL / SAVAŞÇI - SADECE 3 OYUNCU MODUNDA) */}
              {activePlayerMode === 3 && (
                <div className={`flex-1 rounded-2xl bg-[#0f2e20]/90 border-2 ${
                  roundWinner === 'p3' ? 'border-emerald-400 ring-4 ring-emerald-400/50' : 'border-emerald-500/80'
                } p-2 sm:p-3 flex flex-col justify-between shadow-xl transition-all ${
                  p3Shake ? 'animate-shake' : ''
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🟢</span>
                      <span className="font-black text-emerald-200 text-xs sm:text-sm uppercase truncate max-w-[130px]">
                        {p3Student ? p3Student.name : '3. Oyuncu'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-amber-300 text-xs sm:text-sm">{player3Score} Puan</span>
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2].map(idx => (
                          <span key={idx} className={idx >= (MAX_MISTAKES - player3Mistakes) ? 'opacity-30 grayscale' : ''}>
                            {idx < (MAX_MISTAKES - player3Mistakes) ? '❤️' : '❌'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kelimeler Listesi */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-auto">
                    {p3Words.map((word, idx) => {
                      const isSel = p3SelectedIdx === idx;
                      return (
                        <button
                          key={`p3-${word.id}`}
                          onClick={() => handleMultiWordClick('p3', idx)}
                          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-base transition-all active:scale-95 cursor-pointer shadow-md ${
                            roundWinner === 'p3'
                              ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                              : isSel
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105'
                              : 'bg-white text-slate-950 hover:bg-emerald-100 border border-slate-300'
                          }`}
                        >
                          {word.text}
                        </button>
                      );
                    })}
                  </div>

                  {/* Önizleme & Kontrol Butonu */}
                  <div className="pt-2 border-t border-emerald-500/30 flex flex-col gap-1.5">
                    <div className="text-[11px] text-emerald-100/90 text-center truncate px-1">
                      "{p3Words.map(w => w.text).join(' ')}"
                    </div>
                    <button
                      onClick={() => handleMultiCheck('p3')}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-emerald-300 active:scale-95 cursor-pointer"
                    >
                      ✓ KONTROL ET
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* 4. ALT DOCK - SADECE 2 VE 3 KİŞİLİK MODDA (ÖĞRENCİ LİSTESİ) */}
        {activePlayerMode >= 2 && students && students.length > 0 && onOpenRosterModal && (
          <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
            <StudentAvatarDock
              students={students}
              currentGrade={selectedGrade}
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
                if (onOpenRosterModal) onOpenRosterModal(grade || selectedGrade);
              }}
              playMp3={playMp3}
            />
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. ZAFER MODALI / ŞAMPİYONLUK EKRANI */}
      {/* ===================================================================== */}
      {(showVictoryModal || matchWinner) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(250,204,21,0.5)] animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <Trophy size={42} className="text-slate-950 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
              {matchWinner === 'p1' 
                ? (p1Student ? `${p1Student.name} Şampiyon!` : '1. Oyuncu Kazandı! 🏆')
                : matchWinner === 'p2'
                ? (p2Student ? `${p2Student.name} Şampiyon!` : '2. Oyuncu Kazandı! 🏆')
                : matchWinner === 'p3'
                ? (p3Student ? `${p3Student.name} Şampiyon!` : '3. Oyuncu Kazandı! 🏆')
                : 'Tebrikler! Bölüm Tamamlandı!'}
            </h2>

            <p className="text-sm text-slate-300 mb-6">
              {matchWinner 
                ? `Harika bir kapışma oldu! ${TARGET_WIN_SCORE} puana ulaşan oyuncu şampiyon oldu.`
                : `${selectedGrade}. Sınıf kurallı cümle etkinliklerini başarıyla tamamladın!`
              }
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  handleRestartMatch();
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <RotateCcw size={18} />
                <span>Tekrar Oyna</span>
              </button>
              <button
                onClick={() => {
                  if (onGoHome) onGoHome();
                  else onClose();
                }}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Home size={18} />
                <span>Ana Sayfa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
