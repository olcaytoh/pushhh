import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Shuffle, HelpCircle, 
  Volume2, ArrowRight, ArrowLeft, Trophy, Star, Award, 
  GripVertical, ChevronLeft, ChevronRight
} from 'lucide-react';

export interface KuralliCumleActivityProps {
  onClose: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
}

interface SentenceData {
  id: number;
  themeTitle: string;
  themeEmoji: string;
  categoryTheme: 'space' | 'animals' | 'dino' | 'robot';
  themeGradient: string;
  borderColor: string;
  glowColor: string;
  correctWords: string[];
  punctuation: string;
  didacticHint: string;
  funFact: string;
}

const SENTENCES: SentenceData[] = [
  {
    id: 1,
    themeTitle: "Uzay Macerası",
    themeEmoji: "🚀",
    categoryTheme: 'space',
    themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
    borderColor: "border-sky-400",
    glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
    correctWords: ["Cesur", "astronot", "uzay", "gemisiyle", "parlayan", "yıldızlara", "uçtu"],
    punctuation: ".",
    didacticHint: "Türkçe kurallı cümlelerde iş, oluş, hareket bildiren eylem (yüklem) daima cümlenin en sonunda yer alır. Bu cümlede 'uçtu' eylemi en sonda olmalıdır!",
    funFact: "Astronotlar uzayda yerçekimi olmadığı için havada süzülürler!"
  },
  {
    id: 2,
    themeTitle: "Sevimli Dostumuz",
    themeEmoji: "🐱",
    categoryTheme: 'animals',
    themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
    borderColor: "border-emerald-400",
    glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    correctWords: ["Sevimli", "yavru", "kedi", "bahçede", "rengarenk", "kelebeğin", "peşinden", "koştu"],
    punctuation: ".",
    didacticHint: "Eylemi yapan (özne: Sevimli yavru kedi) başta, yapılan hareket (koştu) ise cümlenin en sonunda bulunur!",
    funFact: "Kediler uyanık oldukları zamanın üçte birini kendilerini temizleyerek geçirirler!"
  },
  {
    id: 3,
    themeTitle: "Neşeli Dinozor",
    themeEmoji: "🦖",
    categoryTheme: 'dino',
    themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
    borderColor: "border-amber-400",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    correctWords: ["Yeşil", "dinozor", "ormanda", "kocaman", "çilekli", "pastayı", "afiyetle", "yedi"],
    punctuation: ".",
    didacticHint: "İşi yapan 'Yeşil dinozor' cümlenin başında, yapılan iş olan 'yedi' kelimesi cümlenin sonunda olmalıdır!",
    funFact: "Bazı dinozor türleri bir otobüsten bile daha büyüktü!"
  },
  {
    id: 4,
    themeTitle: "Sihirli Robot",
    themeEmoji: "🤖",
    categoryTheme: 'robot',
    themeGradient: "from-[#2c0f24] via-[#411635] to-[#2c0f24]",
    borderColor: "border-fuchsia-400",
    glowColor: "shadow-[0_0_20px_rgba(244,114,182,0.35)]",
    correctWords: ["Marifetli", "akıllı", "robot", "neşeli", "çocuklara", "sihirli", "balonlar", "dağıttı"],
    punctuation: ".",
    didacticHint: "'Dağıttı' kelimesi cümlenin yüklemidir ve kurallı cümlelerde yüklem en sonda yer alır!",
    funFact: "Gelecekte robotlar çocuklara matematik ve kodlama oyunları öğretecek!"
  }
];

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
  onPrevActivity,
  onNextActivity,
  playMp3
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [words, setWords] = useState<WordItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const [isCorrect, setIsCorrect] = useState(false);
  const [showErrorShake, setShowErrorShake] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<number[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const currentSentence = SENTENCES[currentSentenceIndex];

  const triggerSound = useCallback((src: string) => {
    if (playMp3) {
      playMp3(src);
    }
  }, [playMp3]);

  // Initialize or change sentence
  useEffect(() => {
    const s = SENTENCES[currentSentenceIndex];
    setWords(shuffleWords(s.correctWords));
    setIsCorrect(false);
    setShowErrorShake(false);
    setSelectedWordIndex(null);
  }, [currentSentenceIndex]);

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

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (!completedSentences.includes(currentSentence.id)) {
        setCompletedSentences(prev => [...prev, currentSentence.id]);
      }

      // Check if all 4 are completed
      if (completedSentences.length + 1 >= SENTENCES.length || (completedSentences.length === 3 && !completedSentences.includes(currentSentence.id))) {
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
      setTimeout(() => setShowErrorShake(false), 800);
    }
  };

  // Move to next sentence
  const handleNextSentence = () => {
    triggerSound('/nextlvl.mp3');
    if (currentSentenceIndex < SENTENCES.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      setShowVictoryModal(true);
    }
  };

  // Current assembled text for preview
  const assembledText = words.map(w => w.text).join(' ') + currentSentence.punctuation;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-900 text-white">
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

      {/* 2. TOP HEADER BAR */}
      <header className="relative z-30 bg-[#0b1328]/95 backdrop-blur-md border-b border-slate-700/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0">
        {/* Left: Return Button */}
        <button
          onClick={onClose}
          title="Menüye Dön"
          className="group relative w-[88px] h-[30px] sm:w-[110px] sm:h-[38px] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
        >
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: `url('/butt.png')` }}
          />
          <span className="relative z-10 text-white font-black text-[9px] sm:text-xs tracking-wider [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.8)] uppercase select-none -translate-y-[1px]">
            ANA MENÜ
          </span>
        </button>

        {/* Center: Activity Badge */}
        <div className="flex items-center justify-center text-center">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-xl bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] border-l-4 border-l-amber-400">
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wide">
              5. DİĞER OYUNLAR
            </span>
            <span className="text-amber-400/60 font-bold">•</span>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              Kurallı Cümle Oluştur
            </h1>
            <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Right: Progress Indicator & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-xl shadow-xs">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-xs font-black text-amber-300">
              {completedSentences.length} / {SENTENCES.length}
            </span>
          </div>

          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onNextActivity();
              }}
              title="Sonraki Etkinlik"
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              <span className="hidden sm:inline">Sonraki</span> ▶
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="relative z-10 flex-1 p-2 sm:p-4 max-w-5xl mx-auto w-full overflow-y-auto no-scrollbar flex flex-col items-center justify-between gap-3">
        
        {/* TOP SENTENCE LEVEL SELECTOR (4 CÜMLE SEKMESİ) */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 shrink-0 pt-1">
          {SENTENCES.map((item, idx) => {
            const isSelected = currentSentenceIndex === idx;
            const isDone = completedSentences.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setCurrentSentenceIndex(idx);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
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
        <div className="w-full max-w-4xl bg-gradient-to-r from-[#121c2e]/95 via-[#1b2b48]/95 to-[#121c2e]/95 border-2 border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.25)] rounded-2xl p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 border border-blue-400/60 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner">
              {currentSentence.themeEmoji}
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                  CÜMLE {currentSentenceIndex + 1} / 4
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
        } rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center gap-3 sm:gap-4 transition-all`}>
          
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span className="flex items-center gap-1.5 text-blue-300">
              <GripVertical size={14} className="text-blue-400" />
              <span>Kelimeleri Sıraya Diz:</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Kelimeleri sürükleyin ya da yer değiştirmek için sırayla 2 kelimeye dokunun)
            </span>
          </div>

          {/* WORDS FLEX CONTAINER (DRAGGABLE & TOUCH-SWAPPABLE) */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#050a16] border border-slate-800/80 min-h-[100px] sm:min-h-[120px]">
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
              <span className="font-bold text-amber-400">Cümlenin son kelimesi: </span>
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
                ⭐⭐⭐⭐
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                HARİKA BAŞARI!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Tüm <span className="text-amber-300 font-bold">4 kurallı cümleyi</span> başarıyla tamamladın!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#080d19] border border-slate-700/80 text-left space-y-1.5 text-xs">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                Tamamlanan Cümleler:
              </div>
              {SENTENCES.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="truncate">{idx + 1}. {s.correctWords.join(' ')}.</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  triggerSound('/coin.mp3');
                  setShowVictoryModal(false);
                  setCurrentSentenceIndex(0);
                  setCompletedSentences([]);
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
                <span>Diğer Oyunlara Dön</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
