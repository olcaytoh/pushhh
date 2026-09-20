import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Shuffle, HelpCircle, 
  Volume2, ArrowRight, ArrowLeft, Trophy, Star, Award, 
  GripVertical, ChevronLeft, ChevronRight, Home
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarSideGrid } from './StudentAvatarSideGrid';

export type GradeLevel = 1 | 2 | 3 | 4;

export interface KuralliCumleActivityProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  initialGrade?: number;
  students?: Student[];
  selectedStudentId?: string | null;
  onSelectStudent?: (id: string | null) => void;
  onOpenRosterModal?: () => void;
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
      correctWords: ["Neşeli", "çocuklar", "bahçede", "koştu"],
      punctuation: ".",
      didacticHint: "Kurallı cümlelerde hareket bildiren yüklem ('koştu') daima cümlenin en sonundadır!",
      funFact: "Koşup oynamak kalbimizi güçlendirir ve bizi çok daha zinde tutar!"
    },
    {
      id: "g2-3",
      grade: 2,
      themeTitle: "Pamuk Bulutlar",
      themeEmoji: "☁️",
      categoryTheme: 'nature',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Beyaz", "bulutlar", "gökyüzünü", "kapladı"],
      punctuation: ".",
      didacticHint: "Cümlenin eylemi olan 'kapladı' kelimesi cümlenin en sonuna yerleştirilmelidir!",
      funFact: "Gökyüzündeki bir bulutun ağırlığı yüzlerce tonu bulabilir!"
    },
    {
      id: "g2-4",
      grade: 2,
      themeTitle: "Mis Kokulu Mutfak",
      themeEmoji: "🍪",
      categoryTheme: 'school',
      themeGradient: "from-[#2d1b09] via-[#42270d] to-[#2d1b09]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(251,146,60,0.35)]",
      correctWords: ["Annem", "lezzetli", "kurabiyeler", "pişirdi"],
      punctuation: ".",
      didacticHint: "İşi yapan 'Annem' başta, eylemi anlatan 'pişirdi' cümlenin sonunda olmalıdır!",
      funFact: "Fırından yeni çıkmış kurabiye kokusu insanlara huzur ve mutluluk verir!"
    },
    {
      id: "g2-5",
      grade: 2,
      themeTitle: "Sonbahar Esintisi",
      themeEmoji: "🍂",
      categoryTheme: 'nature',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-yellow-400",
      glowColor: "shadow-[0_0_20px_rgba(250,204,21,0.35)]",
      correctWords: ["Rüzgar", "sarı", "yaprakları", "savurdu"],
      punctuation: ".",
      didacticHint: "Cümlenin hareketi 'savurdu' kelimesidir ve kurallı cümlelerde yüklem sonda yer alır!",
      funFact: "Ağaçlar kış mevsiminde hayatta kalabilmek için yapraklarını sonbaharda dökerler!"
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
      funFact: "Karıncalar kendi vücut ağırlıklarının 50 katı kadar yük taşıyabilirler!"
    }
  ],

  // 4. SINIF: 6 KELİMEYE SAHİP CÜMLELER
  4: [
    {
      id: "g4-1",
      grade: 4,
      themeTitle: "Geleceğin Teknolojisi",
      themeEmoji: "🤖",
      categoryTheme: 'robot',
      themeGradient: "from-[#2c0f24] via-[#411635] to-[#2c0f24]",
      borderColor: "border-fuchsia-400",
      glowColor: "shadow-[0_0_20px_rgba(244,114,182,0.35)]",
      correctWords: ["Marifetli", "robot", "çocuklara", "sihirli", "balonlar", "dağıttı"],
      punctuation: ".",
      didacticHint: "Özne olan 'Marifetli robot' cümlenin başında, yüklem olan 'dağıttı' ise cümlenin en sonundadır!",
      funFact: "Gelecekte robotlar yapay zeka sayesinde insanlara tıp, eğitim ve uzay keşfinde rehberlik edecek!"
    },
    {
      id: "g4-2",
      grade: 4,
      themeTitle: "Peteklerin Sırrı",
      themeEmoji: "🐝",
      categoryTheme: 'nature',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Çalışkan", "arılar", "peteklere", "tatlı", "bal", "doldurdu"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'doldurdu' eylemi cümlenin sonunda olmalıdır!",
      funFact: "Bal arıları yarım kilo bal üretebilmek için yaklaşık 2 milyon çiçeği dolaşırlar!"
    },
    {
      id: "g4-3",
      grade: 4,
      themeTitle: "Bahçedeki Av",
      themeEmoji: "🦋",
      categoryTheme: 'animals',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-teal-400",
      glowColor: "shadow-[0_0_20px_rgba(20,184,166,0.35)]",
      correctWords: ["Sevimli", "kedi", "bahçede", "rengarenk", "kelebeği", "kovaladı"],
      punctuation: ".",
      didacticHint: "İşi yapan 'Sevimli kedi' başta, eylemi bildiren 'kovaladı' cümlenin sonunda bulunmalıdır!",
      funFact: "Kelebekler ayaklarıyla tat alırlar ve kanatlarındaki desenlerle kendilerini korurlar!"
    },
    {
      id: "g4-4",
      grade: 4,
      themeTitle: "Fırtınalı Okyanus",
      themeEmoji: "🚢",
      categoryTheme: 'space',
      themeGradient: "from-[#0a1b33] via-[#0f294d] to-[#0a1b33]",
      borderColor: "border-blue-400",
      glowColor: "shadow-[0_0_20px_rgba(96,165,250,0.35)]",
      correctWords: ["Kaptan", "gemisini", "fırtınalı", "dalgalar", "arasından", "geçirdi"],
      punctuation: ".",
      didacticHint: "Cümlenin yüklemi 'geçirdi' kelimesidir ve kurallı cümlelerde yüklem daima sonda yer alır!",
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

export const KuralliCumleActivity: React.FC<KuralliCumleActivityProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  initialGrade,
  students,
  selectedStudentId,
  onSelectStudent,
  onOpenRosterModal,
  onQuestionAnswered
}) => {
  const leftStudents = useMemo(() => (students || []).slice(0, 12), [students]);
  const rightStudents = useMemo(() => (students || []).slice(12, 23), [students]);
  const assignedStudent = useMemo(() => students?.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => {
    if (initialGrade && initialGrade >= 1 && initialGrade <= 4) {
      return initialGrade as GradeLevel;
    }
    return 1;
  });

  useEffect(() => {
    if (initialGrade && initialGrade >= 1 && initialGrade <= 4) {
      setSelectedGrade(initialGrade as GradeLevel);
      setCurrentSentenceIndex(0);
      setIsCorrect(false);
      setShowErrorShake(false);
      setSelectedWordIndex(null);
    }
  }, [initialGrade]);

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [words, setWords] = useState<WordItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const [isCorrect, setIsCorrect] = useState(false);
  const [showErrorShake, setShowErrorShake] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const currentGradeSentences = GRADE_SENTENCES[selectedGrade];
  const currentSentence = currentGradeSentences[currentSentenceIndex] || currentGradeSentences[0];
  const gradeWordCount = selectedGrade + 2; // 1->3, 2->4, 3->5, 4->6

  const triggerSound = useCallback((src: string) => {
    if (playMp3) {
      playMp3(src);
    }
  }, [playMp3]);

  // Handle grade change
  const handleGradeChange = (grade: GradeLevel) => {
    if (grade === selectedGrade) return;
    triggerSound('/op.mp3');
    setSelectedGrade(grade);
    setCurrentSentenceIndex(0);
    setIsCorrect(false);
    setShowErrorShake(false);
    setSelectedWordIndex(null);
  };

  // Initialize or change sentence
  useEffect(() => {
    if (currentSentence) {
      setWords(shuffleWords(currentSentence.correctWords));
      setIsCorrect(false);
      setShowErrorShake(false);
      setSelectedWordIndex(null);
    }
  }, [selectedGrade, currentSentenceIndex]);

  // Read sentence aloud using Web Speech API
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
    setWords(shuffleWords(currentSentence.correctWords));
    setIsCorrect(false);
    setShowErrorShake(false);
    setSelectedWordIndex(null);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isCorrect) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    triggerSound('/tek.mp3');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isCorrect) return;
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex || isCorrect) {
      setDraggedIndex(null);
      return;
    }

    const updated = [...words];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setWords(updated);
    setDraggedIndex(null);
    setSelectedWordIndex(null);
    triggerSound('/coin.mp3');
  };

  // Click-to-swap / Click-to-move support for touchscreens & smartboards
  const handleWordClick = (index: number) => {
    if (isCorrect) return;

    if (selectedWordIndex === null) {
      // Select first word
      setSelectedWordIndex(index);
      triggerSound('/op.mp3');
    } else if (selectedWordIndex === index) {
      // Deselect if clicked again
      setSelectedWordIndex(null);
      triggerSound('/op.mp3');
    } else {
      // Swap selected word with target word
      const updated = [...words];
      const temp = updated[selectedWordIndex];
      updated[selectedWordIndex] = updated[index];
      updated[index] = temp;

      setWords(updated);
      setSelectedWordIndex(null);
      triggerSound('/coin.mp3');
    }
  };

  // Move a word left or right via button
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

  // Check the assembled sentence
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

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      const nextCompleted = completedSentences.includes(currentSentence.id) 
        ? completedSentences 
        : [...completedSentences, currentSentence.id];
      setCompletedSentences(nextCompleted);

      // Check if all sentences in current grade are completed
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

  // Move to next sentence
  const handleNextSentence = () => {
    triggerSound('/nextlvl.mp3');
    if (currentSentenceIndex < currentGradeSentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      setShowVictoryModal(true);
    }
  };

  // Current assembled text for preview
  const assembledText = words.map(w => w.text).join(' ') + currentSentence.punctuation;
  const gradeCompletedCount = currentGradeSentences.filter(s => completedSentences.includes(s.id)).length;

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white"
    >
      {/* 1. BACKGROUND IMAGE (/dere3.jpg) WITH BLUR */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* 2. SUB-HEADER BAR */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        {/* Left: Nav Buttons & Section badge */}
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

        {/* Right: Progress Indicator, Home & Close button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-xl shadow-xs">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-xs font-black text-amber-300">
              {gradeCompletedCount} / {currentGradeSentences.length}
            </span>
          </div>

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

      {/* ACTIVE STUDENT NOTIFICATION BADGE IF ANY */}
      {assignedStudent && (
        <div className="relative z-20 mt-1 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold shadow animate-fadeIn">
            <span>🎮 Oynayan Öğrenci:</span>
            <span className="text-white font-extrabold flex items-center gap-1">
              <span>{assignedStudent.avatar}</span>
              <span>{assignedStudent.name}</span>
            </span>
            {onSelectStudent && (
              <button
                type="button"
                onClick={() => onSelectStudent(null)}
                className="text-amber-400 hover:text-amber-200 ml-1 text-[11px] underline cursor-pointer"
              >
                (Değiştir)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH SIDE AVATAR GRIDS */}
      <div className="relative z-10 flex-1 flex flex-col xl:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 max-w-[1650px] mx-auto w-full overflow-y-auto no-scrollbar p-1.5 sm:p-2.5">
        {/* LEFT STUDENT SIDE GRID */}
        {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0">
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

        <main className="flex-1 max-w-4xl w-full flex flex-col items-center justify-between gap-2.5">
        
        {/* SINIF SEÇİCİ SEKMELERİ (1. Sınıf: 3 Kelime, 2. Sınıf: 4 Kelime, 3. Sınıf: 5 Kelime, 4. Sınıf: 6 Kelime) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 shrink-0 pt-0.5 flex-wrap">
          {([1, 2, 3, 4] as const).map((gradeNum) => {
            const isGradeActive = selectedGrade === gradeNum;
            const wordsCount = gradeNum + 2; // 1->3, 2->4, 3->5, 4->6
            const gradeTotal = GRADE_SENTENCES[gradeNum].length;
            const gradeDone = GRADE_SENTENCES[gradeNum].filter(s => completedSentences.includes(s.id)).length;

            return (
              <button
                key={gradeNum}
                onClick={() => handleGradeChange(gradeNum)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer border-2 shadow-md ${
                  isGradeActive
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-[#0f172a]/85 hover:bg-[#1e293b] text-slate-300 border-slate-700 hover:border-amber-400/60'
                }`}
              >
                <span>🎒 {gradeNum}. Sınıf</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold ${
                  isGradeActive ? 'bg-slate-950/80 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {wordsCount} Kelime
                </span>
                {gradeDone === gradeTotal && (
                  <CheckCircle2 size={13} className={isGradeActive ? "text-slate-950" : "text-emerald-400"} />
                )}
              </button>
            );
          })}
        </div>

        {/* CÜMLE SEÇİCİ SEKMELERİ (O SINIFIN 5 CÜMLESİ) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {currentGradeSentences.map((item, idx) => {
            const isSelected = currentSentenceIndex === idx;
            const isDone = completedSentences.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setCurrentSentenceIndex(idx);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-105'
                    : isDone
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70 hover:bg-emerald-900/80'
                    : 'bg-[#121c2e]/90 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:bg-[#18263e]'
                }`}
              >
                <span>{item.themeEmoji}</span>
                <span className="hidden xs:inline">{idx + 1}. Cümle</span>
                <span className="xs:hidden">{idx + 1}</span>
                {isDone && <CheckCircle2 size={13} className="text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* MISSION & INSTRUCTION CARD */}
        <div className="w-full max-w-4xl bg-gradient-to-r from-[#121c2e]/95 via-[#1b2b48]/95 to-[#121c2e]/95 border-2 border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.25)] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/20 border border-blue-400/60 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner">
              {currentSentence.themeEmoji}
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                  {selectedGrade}. SINIF • {gradeWordCount} KELİMELİ
                </span>
                <span className="text-slate-400 font-bold">•</span>
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                  {currentSentence.themeTitle}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                Karışık kelimeleri <span className="text-amber-300 font-bold">sürükleyerek</span> veya <span className="text-cyan-300 font-bold">dokunup yer değiştirerek</span> kurallı sıraya koy!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setShowHintModal(true);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-300 text-xs font-bold transition-all cursor-pointer"
              title="İpucu Al"
            >
              <HelpCircle size={14} />
              <span>İpucu</span>
            </button>

            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Kelimeleri Yeniden Karıştır"
            >
              <Shuffle size={14} />
              <span className="hidden sm:inline">Karıştır</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE DRAG-AND-DROP SENTENCE ASSEMBLY AREA */}
        <div className={`w-full max-w-4xl bg-[#091122]/95 border-2 ${
          isCorrect 
            ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
            : showErrorShake 
            ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-shake' 
            : 'border-slate-700 shadow-xl'
        } rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-2.5 sm:gap-3.5 transition-all`}>
          
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span className="flex items-center gap-1.5 text-blue-300">
              <GripVertical size={14} className="text-blue-400" />
              <span>Kelimeleri Sıraya Diz ({gradeWordCount} Kelime):</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Kelimeleri sürükleyin ya da yer değiştirmek için sırayla 2 kelimeye dokunun)
            </span>
          </div>

          {/* WORDS FLEX CONTAINER (DRAGGABLE & TOUCH-SWAPPABLE) */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#050a16] border border-slate-800/80 min-h-[90px] sm:min-h-[110px]">
            {words.map((word, index) => {
              const isSelected = selectedWordIndex === index;
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={word.id}
                  draggable={!isCorrect}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => handleWordClick(index)}
                  className={`group relative flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-sm sm:text-base md:text-lg transition-all cursor-grab active:cursor-grabbing select-none border-2 ${
                    isCorrect
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-100'
                      : isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 ring-4 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 z-20 animate-pulse'
                      : isOver
                      ? 'bg-sky-600/40 text-white border-sky-400 ring-2 ring-sky-400 scale-105'
                      : isDragging
                      ? 'opacity-40 scale-95 border-dashed border-slate-500'
                      : 'bg-gradient-to-b from-[#16233d] to-[#0d1628] hover:from-[#1d2f52] hover:to-[#121f38] text-slate-100 border-slate-600/80 hover:border-blue-400 shadow-md hover:scale-[1.03]'
                  }`}
                >
                  {/* WORD NUMBER INDICATOR */}
                  <span className={`text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0 ${
                    isCorrect 
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : isSelected 
                      ? 'bg-slate-950 text-amber-300 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>

                  {/* WORD TEXT */}
                  <span className="tracking-wide">
                    {word.text}
                  </span>

                  {/* MICRO MOVE BUTTONS (ACCESSIBILITY FOR MOUSE / TOUCH) */}
                  {!isCorrect && (
                    <div className="flex items-center gap-0.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveWord(index, 'left');
                          }}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-black/40 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition cursor-pointer"
                          title="Sola Kaydır"
                        >
                          ◀
                        </button>
                      )}
                      {index < words.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveWord(index, 'right');
                          }}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-black/40 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition cursor-pointer"
                          title="Sağa Kaydır"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  )}

                  {isCorrect && (
                    <span className="ml-1 text-xs text-emerald-200">✓</span>
                  )}
                </div>
              );
            })}

            {/* PUNCTUATION SYMBOL AT END */}
            <div className="flex items-center justify-center px-2 py-1 text-base sm:text-xl font-black text-amber-400/80">
              {currentSentence.punctuation}
            </div>
          </div>

          {/* REAL-TIME PREVIEW OF ASSEMBLED SENTENCE */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Okunuşu:
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate italic">
                "{assembledText}"
              </p>
            </div>

            <button
              onClick={() => speakSentence(assembledText)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/50 text-blue-300 text-xs font-bold transition cursor-pointer shrink-0"
              title="Cümleyi Sesli Dinle"
            >
              <Volume2 size={14} />
              <span className="hidden xs:inline">Dinle</span>
            </button>
          </div>

          {/* ACTION BUTTONS (KONTROL ET & SONRAKİ) */}
          <div className="w-full flex items-center justify-center gap-3 pt-1">
            {!isCorrect ? (
              <button
                onClick={handleCheck}
                className="group relative px-6 sm:px-10 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-500 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="text-slate-950" />
                <span>KONTROL ET</span>
              </button>
            ) : (
              <button
                onClick={handleNextSentence}
                className="group relative px-6 sm:px-10 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 animate-bounce"
              >
                <span>SONRAKİ CÜMLE</span>
                <ArrowRight size={18} className="text-slate-950" />
              </button>
            )}
          </div>

          {/* SUCCESS BANNER WHEN CORRECT */}
          {isCorrect && (
            <div className="w-full p-3 rounded-xl bg-emerald-950/90 border-2 border-emerald-400 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm sm:text-base">
                <Sparkles size={16} className="text-amber-400" />
                <span>TEBRİKLER! CÜMLE ANLAMLI VE KURALLI OLDU!</span>
                <Sparkles size={16} className="text-amber-400" />
              </div>
              <p className="text-xs text-emerald-200 mt-1 font-medium">
                💡 <span className="font-bold">Eğlenceli Bilgi:</span> {currentSentence.funFact}
              </p>
            </div>
          )}

          {/* ERROR NOTICE WHEN WRONG */}
          {showErrorShake && (
            <div className="w-full p-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-center text-rose-300 text-xs font-bold animate-fadeIn">
              ❌ Henüz kurallı değil! İpucu: İş, oluş, hareket bildiren eylem (yüklem) cümlenin en sonunda yer almalıdır. Tekrar dene!
            </div>
          )}

        </div>

      </main>

        {/* RIGHT STUDENT SIDE GRID */}
        {students && students.length > 0 && onSelectStudent && onOpenRosterModal && (
          <div className="hidden xl:flex shrink-0">
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

      {/* HINT MODAL */}
      {showHintModal && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d1628] border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl mx-auto">
              💡
            </div>
            <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wider">
              Kurallı Cümle İpucu
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentSentence.didacticHint}
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400">
              <span className="font-bold text-amber-400">Cümlenin son kelimesi (yüklem): </span>
              <span className="text-white font-mono font-black text-sm">
                "{currentSentence.correctWords[currentSentence.correctWords.length - 1]}"
              </span>
            </div>
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                setShowHintModal(false);
              }}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer"
            >
              Anladım, Devam Et!
            </button>
          </div>
        </div>
      )}

      {/* ALL COMPLETED VICTORY MODAL */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-[260] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-gradient-to-b from-[#121c2e] to-[#090f1d] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(251,191,36,0.5)] text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-lg animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-lg">
                ⭐⭐⭐⭐⭐
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                HARİKA BAŞARI!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                <span className="text-amber-300 font-bold">{selectedGrade}. Sınıf ({gradeWordCount} Kelime)</span> seviyesindeki tüm cümleleri başarıyla tamamladın!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#080d19] border border-slate-700/80 text-left space-y-1.5 text-xs">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                Tamamlanan Cümleler:
              </div>
              {currentGradeSentences.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="truncate">{idx + 1}. {s.correctWords.join(' ')}.</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {selectedGrade < 4 && (
                <button
                  onClick={() => {
                    handleGradeChange((selectedGrade + 1) as GradeLevel);
                    setShowVictoryModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Sonraki Sınıfa Geç ({selectedGrade + 1}. Sınıf - {selectedGrade + 3} Kelime) ▶</span>
                </button>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    triggerSound('/coin.mp3');
                    setShowVictoryModal(false);
                    setCurrentSentenceIndex(0);
                    setIsCorrect(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Yeniden Oyna</span>
                </button>

                <button
                  onClick={() => {
                    triggerSound('/op.mp3');
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trophy size={14} />
                  <span>Kapat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
