import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, RotateCcw, Shuffle, HelpCircle, 
  Volume2, ArrowRight, ArrowLeft, Trophy, Star, Award, 
  GripVertical, ChevronLeft, ChevronRight, Home, Heart, XCircle
} from 'lucide-react';
import { Student } from '../types/student';
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
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
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
    },
    {
      id: "g1-6",
      grade: 1,
      themeTitle: "Temiz Çevre",
      themeEmoji: "🗑️",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çöpleri", "çöpe", "atarım"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'atarım' cümlenin sonunda yer alır!",
      funFact: "Çevremizi temiz tutmak hepimizin en önemli görevidir!"
    },
    {
      id: "g1-7",
      grade: 1,
      themeTitle: "Hayvan Sevgisi",
      themeEmoji: "🐾",
      categoryTheme: 'animals',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Hayvanları", "çok", "severim"],
      punctuation: ".",
      didacticHint: "'severim' eylemi cümlenin yüklemidir ve en sonda yer alır!",
      funFact: "Hayvanlara sevgi ve şefkat göstermek dünyayı güzelleştirir!"
    },
    {
      id: "g1-8",
      grade: 1,
      themeTitle: "Doğruluk",
      themeEmoji: "⭐",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Herkese", "dürüst", "olurum"],
      punctuation: ".",
      didacticHint: "'dürüst olurum' ifadesi cümlenin sonunda olmalıdır!",
      funFact: "Dürüstlük en güzel erdemdir ve bize saygınlık kazandırır!"
    },
    {
      id: "g1-user-1",
      grade: 1,
      themeTitle: "Paylaşma Erdemi",
      themeEmoji: "🧸",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Arkadaşımla", "oyuncaklarımı", "güzelce", "paylaşırım"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'paylaşırım' yüklemi kurallı cümlede en sonda yer alır!",
      funFact: "Paylaşmak dostlukları pekiştirir ve insanı çok mutlu eder!"
    },
    {
      id: "g1-user-2",
      grade: 1,
      themeTitle: "Düzenli Oda",
      themeEmoji: "🛏️",
      categoryTheme: 'school',
      themeGradient: "from-[#111936] via-[#1b2654] to-[#111936]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      correctWords: ["Odamı", "akşamları", "düzenli", "topluyorum"],
      punctuation: ".",
      didacticHint: "İş bildiren 'topluyorum' kelimesi cümlenin en sonunda yer alır!",
      funFact: "Düzenli bir oda zihnimizin dinlenmesini ve mutlu hissetmemizi sağlar!"
    },
    {
      id: "g1-user-3",
      grade: 1,
      themeTitle: "Sınıf Kuralları",
      themeEmoji: "👩‍🏫",
      categoryTheme: 'school',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Öğretmenimi", "sınıfta", "sessizce", "dinlerim"],
      punctuation: ".",
      didacticHint: "Cümlede yapılan iş olan 'dinlerim' kelimesi yüklemdir ve en sonda yer alır!",
      funFact: "Dersi dikkatle dinlemek bilgileri kalıcı ve kolay öğrenmemizi sağlar!"
    },
    {
      id: "g1-user-4",
      grade: 1,
      themeTitle: "Yardımlaşma",
      themeEmoji: "🤗",
      categoryTheme: 'school',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Arkadaşıma", "yardım", "etmeyi", "severim"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'severim' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Yardımlaşmak ve dayanışma içinde olmak hem bizi hem çevremizi mutlu eder!"
    },
    {
      id: "g1-user-5",
      grade: 1,
      themeTitle: "Güleryüzlü Selam",
      themeEmoji: "🌅",
      categoryTheme: 'school',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      correctWords: ["Sabahları", "günaydın", "demeyi", "unutmam"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'unutmam' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Sabahları güler yüzle günaydın demek etrafımıza neşe yayar!"
    },
    {
      id: "g1-user-6",
      grade: 1,
      themeTitle: "Nazik Davranış",
      themeEmoji: "💖",
      categoryTheme: 'school',
      themeGradient: "from-[#331122] via-[#4d1933] to-[#331122]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Arkadaşımın", "kalbini", "asla", "kırmam"],
      punctuation: ".",
      didacticHint: "Cümlenin yüklemi olan 'kırmam' eylemi en sonda yer almalıdır!",
      funFact: "Tatlı dilli olmak ve kalp kırmamak en güzel insanlık erdemidir!"
    },
    {
      id: "g1-user-7",
      grade: 1,
      themeTitle: "Özür Dilemek",
      themeEmoji: "🙏",
      categoryTheme: 'school',
      themeGradient: "from-[#111936] via-[#1b2654] to-[#111936]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      correctWords: ["Hata", "yapınca", "özür", "dilerim"],
      punctuation: ".",
      didacticHint: "Eylem olan 'özür dilerim' yüklemi cümlenin sonunda yer alır!",
      funFact: "Hata yaptığımızda samimiyetle özür dilemek büyük bir olgunluktur!"
    },
    {
      id: "g1-user-8",
      grade: 1,
      themeTitle: "Görgü Kuralları",
      themeEmoji: "🚪",
      categoryTheme: 'school',
      themeGradient: "from-[#2b1807] via-[#3f240b] to-[#2b1807]",
      borderColor: "border-amber-500",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Kapıyı", "çalarak", "içeri", "girerim"],
      punctuation: ".",
      didacticHint: "Hareket bildiren 'girerim' yüklemi cümlenin en sonunda bulunmalıdır!",
      funFact: "Kapıyı çalmak başkalarının haklarına ve mahremiyetine saygıdır!"
    },
    {
      id: "g1-user-9",
      grade: 1,
      themeTitle: "Sağlık ve Temizlik",
      themeEmoji: "🧼",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Yemekten", "önce", "ellerimi", "yıkarım"],
      punctuation: ".",
      didacticHint: "İş bildiren 'yıkarım' eylemi cümlenin en sonunda olmalıdır!",
      funFact: "Elleri sabunla yıkamak mikroplardan korunmanın en etkili yoludur!"
    },
    {
      id: "g1-user-10",
      grade: 1,
      themeTitle: "Sorumluluk Bilinci",
      themeEmoji: "⏰",
      categoryTheme: 'school',
      themeGradient: "from-[#2a1708] via-[#3d220c] to-[#2a1708]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      correctWords: ["Görevlerimi", "zamanında", "yerine", "getiririm"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'yerine getiririm' eylemi cümlenin en sonunda yer alır!",
      funFact: "Sorumluluklarını zamanında yerine getirenler her zaman başarılı olurlar!"
    },
    {
      id: "g1-user-11",
      grade: 1,
      themeTitle: "Hayvan Sevgisi",
      themeEmoji: "🐾",
      categoryTheme: 'animals',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Hayvanları", "çok", "şefkatle", "severim"],
      punctuation: ".",
      didacticHint: "Duygu ve eylem bildiren 'severim' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Can dostlarımıza sevgi ve şefkat göstermek kalbimizi zenginleştirir!"
    },
    {
      id: "g1-user-12",
      grade: 1,
      themeTitle: "Oyun Kuralları",
      themeEmoji: "🎲",
      categoryTheme: 'school',
      themeGradient: "from-[#171138] via-[#241a52] to-[#171138]",
      borderColor: "border-violet-400",
      glowColor: "shadow-[0_0_20px_rgba(167,139,250,0.35)]",
      correctWords: ["Arkadaşımın", "oyununa", "saygı", "duyarım"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'saygı duyarım' eylemi cümlenin en sonunda yer alır!",
      funFact: "Oyun oynarken kurallara uymak oyunu herkes için çok daha eğlenceli kılar!"
    },
    {
      id: "g1-user-13",
      grade: 1,
      themeTitle: "Dürüstlük ve İzin",
      themeEmoji: "🎒",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Başkalarının", "eşyalarını", "izinsiz", "almam"],
      punctuation: ".",
      didacticHint: "Cümlenin eylemi olan 'almam' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Bir eşyayı kullanmadan önce izin istemek büyük bir nezaket kuralıdır!"
    },
    {
      id: "g1-user-14",
      grade: 1,
      themeTitle: "Doğa Dostu",
      themeEmoji: "🌳",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çevreyi", "her", "zaman", "korurum"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'korurum' yüklemi cümlenin en sonunda yer alır!",
      funFact: "Temiz ve yeşil bir çevre tüm canlıların yaşam kaynağıdır!"
    },
    {
      id: "g1-user-15",
      grade: 1,
      themeTitle: "Tatlı Dil",
      themeEmoji: "💬",
      categoryTheme: 'school',
      themeGradient: "from-[#331122] via-[#4d1933] to-[#331122]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Güzel", "sözler", "söylemeyi", "severim"],
      punctuation: ".",
      didacticHint: "Eylem olan 'severim' cümlenin en sonunda bulunmalıdır!",
      funFact: "Tatlı dil yılanı deliğinden çıkarır, insanları birbirine sevdirir!"
    },
    {
      id: "g1-user-16",
      grade: 1,
      themeTitle: "Sabır ve Sıra",
      themeEmoji: "🧍",
      categoryTheme: 'school',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Sıramı", "sabırla", "sessizce", "beklerim"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'beklerim' yüklemi cümlenin en sonunda yer alır!",
      funFact: "Sıraya girmek ve sıramızı sabırla beklemek adaletin temelidir!"
    },
    {
      id: "g1-user-17",
      grade: 1,
      themeTitle: "Birlikte Oyun",
      themeEmoji: "⚽",
      categoryTheme: 'school',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Arkadaşımla", "güzel", "oyunlar", "kurarım"],
      punctuation: ".",
      didacticHint: "Eylem olan 'kurarım' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Birlikte hayal kurup oyun oynamak arkadaşlıkları ömür boyu unutulmaz kılar!"
    },
    {
      id: "g1-user-18",
      grade: 1,
      themeTitle: "Doğruluk ve Dürüstlük",
      themeEmoji: "⭐",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Herkese", "karşı", "dürüst", "olurum"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'dürüst olurum' eylemi cümlenin en sonunda yer alır!",
      funFact: "Dürüst olmak insanların bize güvenmesini ve bizi çok sevmesini sağlar!"
    },
    {
      id: "g1-user-19",
      grade: 1,
      themeTitle: "Temiz Çevre Bilinci",
      themeEmoji: "🗑️",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çöpleri", "her", "zaman", "çöpe", "atarım"],
      punctuation: ".",
      didacticHint: "Yapılan işi belirten 'atarım' yüklemi cümlenin en sonunda olmalıdır!",
      funFact: "Çöpleri doğru yerlere atmak doğamızı ve canlıları korur!"
    },
    {
      id: "g1-user-20",
      grade: 1,
      themeTitle: "Büyüklere Saygı",
      themeEmoji: "🤝",
      categoryTheme: 'school',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Büyüklere", "her", "zaman", "saygı", "duyarım"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'saygı duyarım' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Büyüklere saygı ve küçüklere sevgi toplumumuzu güzelleştirir!"
    }
  ],

  // 2. SINIF: 4 KELİMEYE SAHİP CÜMLELER (20 ÖZEL ERDEM & ALIŞKANLIK CÜMLESİ DAHİL)
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
    },
    {
      id: "g2-user-1",
      grade: 2,
      themeTitle: "Paylaşma Erdemi",
      themeEmoji: "🧸",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Arkadaşımla", "oyuncaklarımı", "güzelce", "paylaşırım"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'paylaşırım' yüklemi kurallı cümlede en sonda yer alır!",
      funFact: "Paylaşmak dostlukları pekiştirir ve insanı çok mutlu eder!"
    },
    {
      id: "g2-user-2",
      grade: 2,
      themeTitle: "Düzenli Oda",
      themeEmoji: "🛏️",
      categoryTheme: 'school',
      themeGradient: "from-[#111936] via-[#1b2654] to-[#111936]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      correctWords: ["Odamı", "akşamları", "düzenli", "topluyorum"],
      punctuation: ".",
      didacticHint: "İş bildiren 'topluyorum' kelimesi cümlenin en sonunda yer alır!",
      funFact: "Düzenli bir oda zihnimizin dinlenmesini ve mutlu hissetmemizi sağlar!"
    },
    {
      id: "g2-user-3",
      grade: 2,
      themeTitle: "Sınıf Kuralları",
      themeEmoji: "👩‍🏫",
      categoryTheme: 'school',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Öğretmenimi", "sınıfta", "sessizce", "dinlerim"],
      punctuation: ".",
      didacticHint: "Cümlede yapılan iş olan 'dinlerim' kelimesi yüklemdir ve en sonda yer alır!",
      funFact: "Dersi dikkatle dinlemek bilgileri kalıcı ve kolay öğrenmemizi sağlar!"
    },
    {
      id: "g2-user-4",
      grade: 2,
      themeTitle: "Yardımlaşma",
      themeEmoji: "🤗",
      categoryTheme: 'school',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Arkadaşıma", "yardım", "etmeyi", "severim"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'severim' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Yardımlaşmak ve dayanışma içinde olmak hem bizi hem çevremizi mutlu eder!"
    },
    {
      id: "g2-user-5",
      grade: 2,
      themeTitle: "Güleryüzlü Selam",
      themeEmoji: "🌅",
      categoryTheme: 'school',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      correctWords: ["Sabahları", "günaydın", "demeyi", "unutmam"],
      punctuation: ".",
      didacticHint: "Eylemi bildiren 'unutmam' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Sabahları güler yüzle günaydın demek etrafımıza neşe yayar!"
    },
    {
      id: "g2-user-6",
      grade: 2,
      themeTitle: "Nazik Davranış",
      themeEmoji: "💖",
      categoryTheme: 'school',
      themeGradient: "from-[#331122] via-[#4d1933] to-[#331122]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Arkadaşımın", "kalbini", "asla", "kırmam"],
      punctuation: ".",
      didacticHint: "Cümlenin yüklemi olan 'kırmam' eylemi en sonda yer almalıdır!",
      funFact: "Tatlı dilli olmak ve kalp kırmamak en güzel insanlık erdemidir!"
    },
    {
      id: "g2-user-7",
      grade: 2,
      themeTitle: "Özür Dilemek",
      themeEmoji: "🙏",
      categoryTheme: 'school',
      themeGradient: "from-[#111936] via-[#1b2654] to-[#111936]",
      borderColor: "border-indigo-400",
      glowColor: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      correctWords: ["Hata", "yapınca", "özür", "dilerim"],
      punctuation: ".",
      didacticHint: "Eylem olan 'özür dilerim' yüklemi cümlenin sonunda yer alır!",
      funFact: "Hata yaptığımızda samimiyetle özür dilemek büyük bir olgunluktur!"
    },
    {
      id: "g2-user-8",
      grade: 2,
      themeTitle: "Görgü Kuralları",
      themeEmoji: "🚪",
      categoryTheme: 'school',
      themeGradient: "from-[#2b1807] via-[#3f240b] to-[#2b1807]",
      borderColor: "border-amber-500",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Kapıyı", "çalarak", "içeri", "girerim"],
      punctuation: ".",
      didacticHint: "Hareket bildiren 'girerim' yüklemi cümlenin en sonunda bulunmalıdır!",
      funFact: "Kapıyı çalmak başkalarının haklarına ve mahremiyetine saygıdır!"
    },
    {
      id: "g2-user-9",
      grade: 2,
      themeTitle: "Sağlık ve Temizlik",
      themeEmoji: "🧼",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Yemekten", "önce", "ellerimi", "yıkarım"],
      punctuation: ".",
      didacticHint: "İş bildiren 'yıkarım' eylemi cümlenin en sonunda olmalıdır!",
      funFact: "Elleri sabunla yıkamak mikroplardan korunmanın en etkili yoludur!"
    },
    {
      id: "g2-user-10",
      grade: 2,
      themeTitle: "Sorumluluk Bilinci",
      themeEmoji: "⏰",
      categoryTheme: 'school',
      themeGradient: "from-[#2a1708] via-[#3d220c] to-[#2a1708]",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      correctWords: ["Görevlerimi", "zamanında", "yerine", "getiririm"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'yerine getiririm' eylemi cümlenin en sonunda yer alır!",
      funFact: "Sorumluluklarını zamanında yerine getirenler her zaman başarılı olurlar!"
    },
    {
      id: "g2-user-11",
      grade: 2,
      themeTitle: "Hayvan Sevgisi",
      themeEmoji: "🐾",
      categoryTheme: 'animals',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Hayvanları", "çok", "şefkatle", "severim"],
      punctuation: ".",
      didacticHint: "Duygu ve eylem bildiren 'severim' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Can dostlarımıza sevgi ve şefkat göstermek kalbimizi zenginleştirir!"
    },
    {
      id: "g2-user-12",
      grade: 2,
      themeTitle: "Oyun Kuralları",
      themeEmoji: "🎲",
      categoryTheme: 'school',
      themeGradient: "from-[#171138] via-[#241a52] to-[#171138]",
      borderColor: "border-violet-400",
      glowColor: "shadow-[0_0_20px_rgba(167,139,250,0.35)]",
      correctWords: ["Arkadaşımın", "oyununa", "saygı", "duyarım"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'saygı duyarım' eylemi cümlenin en sonunda yer alır!",
      funFact: "Oyun oynarken kurallara uymak oyunu herkes için çok daha eğlenceli kılar!"
    },
    {
      id: "g2-user-13",
      grade: 2,
      themeTitle: "Dürüstlük ve İzin",
      themeEmoji: "🎒",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Başkalarının", "eşyalarını", "izinsiz", "almam"],
      punctuation: ".",
      didacticHint: "Cümlenin eylemi olan 'almam' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Bir eşyayı kullanmadan önce izin istemek büyük bir nezaket kuralıdır!"
    },
    {
      id: "g2-user-14",
      grade: 2,
      themeTitle: "Doğa Dostu",
      themeEmoji: "🌳",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çevreyi", "her", "zaman", "korurum"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'korurum' yüklemi cümlenin en sonunda yer alır!",
      funFact: "Temiz ve yeşil bir çevre tüm canlıların yaşam kaynağıdır!"
    },
    {
      id: "g2-user-15",
      grade: 2,
      themeTitle: "Tatlı Dil",
      themeEmoji: "💬",
      categoryTheme: 'school',
      themeGradient: "from-[#331122] via-[#4d1933] to-[#331122]",
      borderColor: "border-rose-400",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      correctWords: ["Güzel", "sözler", "söylemeyi", "severim"],
      punctuation: ".",
      didacticHint: "Eylem olan 'severim' cümlenin en sonunda bulunmalıdır!",
      funFact: "Tatlı dil yılanı deliğinden çıkarır, insanları birbirine sevdirir!"
    },
    {
      id: "g2-user-16",
      grade: 2,
      themeTitle: "Sabır ve Sıra",
      themeEmoji: "🧍",
      categoryTheme: 'school',
      themeGradient: "from-[#2f2208] via-[#48330c] to-[#2f2208]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Sıramı", "sabırla", "sessizce", "beklerim"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'beklerim' yüklemi cümlenin en sonunda yer alır!",
      funFact: "Sıraya girmek ve sıramızı sabırla beklemek adaletin temelidir!"
    },
    {
      id: "g2-user-17",
      grade: 2,
      themeTitle: "Birlikte Oyun",
      themeEmoji: "⚽",
      categoryTheme: 'school',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Arkadaşımla", "güzel", "oyunlar", "kurarım"],
      punctuation: ".",
      didacticHint: "Eylem olan 'kurarım' kelimesi cümlenin sonunda olmalıdır!",
      funFact: "Birlikte hayal kurup oyun oynamak arkadaşlıkları ömür boyu unutulmaz kılar!"
    },
    {
      id: "g2-user-18",
      grade: 2,
      themeTitle: "Doğruluk ve Dürüstlük",
      themeEmoji: "⭐",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Herkese", "karşı", "dürüst", "olurum"],
      punctuation: ".",
      didacticHint: "Yüklem olan 'dürüst olurum' eylemi cümlenin en sonunda yer alır!",
      funFact: "Dürüst olmak insanların bize güvenmesini ve bizi çok sevmesini sağlar!"
    },
    {
      id: "g2-user-19",
      grade: 2,
      themeTitle: "Temiz Çevre Bilinci",
      themeEmoji: "🗑️",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çöpleri", "her", "zaman", "çöpe", "atarım"],
      punctuation: ".",
      didacticHint: "Yapılan işi belirten 'atarım' yüklemi cümlenin en sonunda olmalıdır!",
      funFact: "Çöpleri doğru yerlere atmak doğamızı ve canlıları korur!"
    },
    {
      id: "g2-user-20",
      grade: 2,
      themeTitle: "Büyüklere Saygı",
      themeEmoji: "🤝",
      categoryTheme: 'school',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Büyüklere", "her", "zaman", "saygı", "duyarım"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'saygı duyarım' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Büyüklere saygı ve küçüklere sevgi toplumumuzu güzelleştirir!"
    }
  ],

  // 3. SINIF: 5 KELİMEYE SAHİP CÜMLELER
  3: [
    {
      id: "g3-user-1",
      grade: 3,
      themeTitle: "Temiz Çevre Bilinci",
      themeEmoji: "🗑️",
      categoryTheme: 'nature',
      themeGradient: "from-[#0d2822] via-[#143a31] to-[#0d2822]",
      borderColor: "border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      correctWords: ["Çöpleri", "her", "zaman", "çöpe", "atarım"],
      punctuation: ".",
      didacticHint: "Yapılan işi belirten 'atarım' yüklemi cümlenin en sonunda olmalıdır!",
      funFact: "Çöpleri doğru yerlere atmak doğamızı ve canlıları korur!"
    },
    {
      id: "g3-user-2",
      grade: 3,
      themeTitle: "Büyüklere Saygı",
      themeEmoji: "🤝",
      categoryTheme: 'school',
      themeGradient: "from-[#2f1c0a] via-[#43270e] to-[#2f1c0a]",
      borderColor: "border-amber-400",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      correctWords: ["Büyüklere", "her", "zaman", "saygı", "duyarım"],
      punctuation: ".",
      didacticHint: "Eylem bildiren 'saygı duyarım' yüklemi cümlenin en sonunda bulunur!",
      funFact: "Büyüklere saygı ve küçüklere sevgi toplumumuzu güzelleştirir!"
    },
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
    },
    {
      id: "g3-6",
      grade: 3,
      themeTitle: "Sorumluluk Sevgisi",
      themeEmoji: "📖",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Görevlerimi", "her", "gün", "zamanında", "yaparım"],
      punctuation: ".",
      didacticHint: "'yaparım' eylemi yüklem olarak cümlenin en sonunda yer alır!",
      funFact: "Düzenli çalışan öğrenciler derslerinde her zaman başarılı olurlar!"
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
    },
    {
      id: "g4-6",
      grade: 4,
      themeTitle: "Paylaşma Erdemi",
      themeEmoji: "🤝",
      categoryTheme: 'school',
      themeGradient: "from-[#0c243f] via-[#12365e] to-[#0c243f]",
      borderColor: "border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      correctWords: ["Arkadaşımla", "oyuncaklarımı", "her", "zaman", "güzelce", "paylaşırım"],
      punctuation: ".",
      didacticHint: "'paylaşırım' yüklemi kurallı cümlenin en sonunda bulunur!",
      funFact: "Paylaşmak ve dostluk dünyayı güzelleştiren en değerli değerdir!"
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


// ---------------------------------------------------------------------------
// TrimmedImg: PNG'nin sağ/solundaki SAYDAM boşlukları otomatik kırpar.
// Lokomotif ve vagonların önündeki/arkasındaki boş alan silinir, tren kısalır.
// (Yalnızca yatayda kırpar; yükseklik ve vagon üstü yazı konumu değişmez.)
// ---------------------------------------------------------------------------
const trimCache = new Map<string, Promise<string | null>>();
function trimTransparentX(src: string): Promise<string | null> {
  const cached = trimCache.get(src);
  if (cached) return cached;
  const p = new Promise<string | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return resolve(null);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, w, h).data;
        let minX = w;
        let maxX = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 16) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
            }
          }
        }
        if (maxX < minX || (minX === 0 && maxX === w - 1)) return resolve(null);
        const cw = maxX - minX + 1;
        const out = document.createElement('canvas');
        out.width = cw;
        out.height = h;
        const octx = out.getContext('2d');
        if (!octx) return resolve(null);
        octx.drawImage(c, minX, 0, cw, h, 0, 0, cw, h);
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  trimCache.set(src, p);
  return p;
}

const TrimmedImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { src: string }> = ({ src, style, ...rest }) => {
  const [trimmed, setTrimmed] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let alive = true;
    trimTransparentX(src).then((r) => {
      if (!alive) return;
      setTrimmed(r);
      setDone(true);
    });
    return () => { alive = false; };
  }, [src]);
  return <img src={trimmed ?? src} style={{ ...style, opacity: done ? undefined : 0 }} {...rest} />;
};

// ---------------------------------------------------------------------------
// FitTrain: 2 / 3 oyunculu modda treni, bulunduğu kutuya SIĞACAK şekilde
// otomatik ölçekler. Gerekirse treni 2-4 satıra böler (lokomotif + vagonlar),
// hangi düzen daha büyük ölçek veriyorsa onu seçer. Kutu boyutu değişince
// (pencere, 2↔3 oyuncu, kelime sayısı) kendiliğinden yeniden hesaplar.
// ---------------------------------------------------------------------------
interface FitTrainItem {
  key: string;
  node: React.ReactNode;
}

const FitTrain: React.FC<{
  items: FitTrainItem[];
  className?: string;
  gapX?: number;
  gapY?: number;
  maxScale?: number;
}> = ({ items, className = '', gapX = 6, gapY = 4, maxScale = 1.35 }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState({ rows: 1, scale: 1, ready: false });
  const count = items.length;

  const recompute = useCallback(() => {
    const box = boxRef.current;
    if (!box || count === 0) return;
    const aw = box.clientWidth - 12;
    const ah = box.clientHeight - 8;
    if (aw <= 0 || ah <= 0) return;

    const nodes = itemRefs.current.slice(0, count);
    if (nodes.some(n => !n)) return;
    const widths = nodes.map(n => (n as HTMLDivElement).offsetWidth);
    if (widths.some(w => w === 0)) return;
    const itemH = Math.max(...nodes.map(n => (n as HTMLDivElement).offsetHeight));
    if (itemH === 0) return;

    let best = { rows: 1, scale: -1 };
    for (let r = 1; r <= Math.min(4, count); r++) {
      const perRow = Math.ceil(count / r);
      const realRows = Math.ceil(count / perRow);
      let maxW = 0;
      for (let i = 0; i < count; i += perRow) {
        const chunk = widths.slice(i, i + perRow);
        const w = chunk.reduce((a, b) => a + b, 0) + gapX * (chunk.length - 1);
        if (w > maxW) maxW = w;
      }
      const totalH = realRows * itemH + (realRows - 1) * gapY;
      const sc = Math.min(aw / maxW, ah / totalH, maxScale);
      // Sadece belirgin kazanç varsa satır sayısını artır (titreme olmasın)
      if (best.scale < 0 || sc > best.scale * 1.04) {
        best = { rows: r, scale: sc };
      }
    }
    const scale = Math.max(0.2, best.scale * 0.98);
    setLayout(prev =>
      prev.rows === best.rows && Math.abs(prev.scale - scale) < 0.005 && prev.ready
        ? prev
        : { rows: best.rows, scale, ready: true }
    );
  }, [count, gapX, gapY, maxScale]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, items]);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(box);
    if (inner) ro.observe(inner); // görseller yüklenince boyut değişir
    return () => ro.disconnect();
  }, [recompute]);

  const perRow = Math.ceil(count / layout.rows) || 1;
  const chunks: { item: FitTrainItem; index: number }[][] = [];
  for (let i = 0; i < count; i += perRow) {
    chunks.push(items.slice(i, i + perRow).map((item, k) => ({ item, index: i + k })));
  }

  return (
    <div ref={boxRef} className={`relative flex-1 min-h-0 w-full overflow-hidden ${className}`}>
      <div
        ref={innerRef}
        className="flex flex-col items-center"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 'max-content',
          gap: gapY,
          transform: `translate(-50%, -50%) scale(${layout.scale})`,
          transformOrigin: 'center center',
          opacity: layout.ready ? 1 : 0,
        }}
      >
        {chunks.map((row, ri) => (
          <div key={ri} className="flex items-end justify-center" style={{ gap: gapX }}>
            {row.map(({ item, index }) => (
              <div
                key={item.key}
                ref={el => { itemRefs.current[index] = el; }}
                className="shrink-0"
              >
                {item.node}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Çok oyunculu mod: vagon boyutu (doğal) ve kelime uzunluğuna göre yazı boyutu
const MULTI_CAR_H = 120;
const multiCarFont = (text: string) =>
  text.length <= 6 ? 22 : text.length <= 9 ? 19 : text.length <= 11 ? 16 : 14;

const PLAYER_THEMES = {
  p1: {
    panelBg: 'bg-[#3f161f]/90', border: 'border-rose-500/80', divider: 'border-rose-500/30',
    dot: '🔴', nameText: 'text-rose-200', labelText: 'text-rose-200',
    previewText: 'text-rose-100 border-rose-400/20',
    btn: 'from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 border-rose-300',
  },
  p2: {
    panelBg: 'bg-[#132847]/90', border: 'border-sky-500/80', divider: 'border-sky-500/30',
    dot: '🔵', nameText: 'text-sky-200', labelText: 'text-sky-200',
    previewText: 'text-sky-100 border-sky-400/20',
    btn: 'from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 border-sky-300',
  },
  p3: {
    panelBg: 'bg-[#0f2e20]/90', border: 'border-emerald-500/80', divider: 'border-emerald-500/30',
    dot: '🟢', nameText: 'text-emerald-200', labelText: 'text-emerald-200',
    previewText: 'text-emerald-100 border-emerald-400/20',
    btn: 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-emerald-300',
  },
} as const;

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
  onQuestionAnswered,
  onGameCompleted
}) => {
  // Aktif Oyuncu Modu (1, 2 veya 3)
  const [activePlayerMode, setActivePlayerMode] = useState<1 | 2 | 3>(playerCountMode || 1);

  // Sync mode with parent
  useEffect(() => {
    if (playerCountMode && playerCountMode !== activePlayerMode) {
      setActivePlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  // Fisher-Yates array shuffle helper
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => {
    if (initialGrade && initialGrade >= 1 && initialGrade <= 4) {
      return initialGrade as GradeLevel;
    }
    return 1;
  });

  // Her seferinde cümlelerin rastgele değişmesi için karıştırılmış cümle havuzu
  const [shuffledGradeSentences, setShuffledGradeSentences] = useState<SentenceData[]>(() => {
    const initGrade = initialGrade && initialGrade >= 1 && initialGrade <= 4 ? (initialGrade as GradeLevel) : 1;
    const list = GRADE_SENTENCES[initGrade] || GRADE_SENTENCES[1];
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  });

  // Etkinlik açıldığında veya sınıf değiştiğinde her seferinde cümleleri baştan rastgele karıştır
  useEffect(() => {
    const targetGrade = initialGrade && initialGrade >= 1 && initialGrade <= 4 ? (initialGrade as GradeLevel) : selectedGrade;
    setSelectedGrade(targetGrade);
    setShuffledGradeSentences(shuffleArray(GRADE_SENTENCES[targetGrade] || GRADE_SENTENCES[1]));
    setCurrentSentenceIndex(0);
    setSingleTimeLeft(100);
  }, [initialGrade, shuffleArray]);

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const currentGradeSentences = shuffledGradeSentences;
  const currentSentence = currentGradeSentences[currentSentenceIndex % currentGradeSentences.length] || currentGradeSentences[0];
  const [singleTimeLeft, setSingleTimeLeft] = useState<number>(100);

  // -------------------------------------------------------------------------
  // 1 OYUNCU MODU DURUMLARI
  // -------------------------------------------------------------------------
  const [words, setWords] = useState<WordItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
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
  const [p1DraggedIdx, setP1DraggedIdx] = useState<number | null>(null);
  const [p2DraggedIdx, setP2DraggedIdx] = useState<number | null>(null);
  const [p3DraggedIdx, setP3DraggedIdx] = useState<number | null>(null);
  const [p1DragOverIdx, setP1DragOverIdx] = useState<number | null>(null);
  const [p2DragOverIdx, setP2DragOverIdx] = useState<number | null>(null);
  const [p3DragOverIdx, setP3DragOverIdx] = useState<number | null>(null);

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

  // Sınıf değiştir (Yeni sınıftaki cümleleri de her seferinde karıştır)
  const handleGradeChange = (grade: GradeLevel) => {
    if (grade === selectedGrade) return;
    triggerSound('/op.mp3');
    setSelectedGrade(grade);
    setShuffledGradeSentences(shuffleArray(GRADE_SENTENCES[grade]));
    setCurrentSentenceIndex(0);
    setSingleTimeLeft(100);
  };

  // 100-Saniye Tek Kişilik Geri Sayım Sayacı (Her soru için 100 saniye)
  useEffect(() => {
    if (activePlayerMode !== 1 || isCorrect || showVictoryModal) {
      return;
    }

    if (singleTimeLeft <= 0) {
      triggerSound('/hata.mp3');
      setShowErrorShake(true);
      setTimeout(() => setShowErrorShake(false), 800);
      setMatchWinner('p1');
      setShowVictoryModal(true);
      return;
    }

    if (singleTimeLeft <= 3 && singleTimeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setSingleTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activePlayerMode, isCorrect, showVictoryModal, singleTimeLeft, currentSentenceIndex, currentGradeSentences.length, selectedGrade, shuffleArray, playMp3, triggerSound]);

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

  // SÜRÜKLE & BIRAK (DRAG & DROP) DESTEĞİ
  const handleDropWord = (fromIdx: number, toIdx: number) => {
    if (isCorrect || fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const updated = [...words];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setWords(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setSelectedWordIndex(null);
    triggerSound('/coin.mp3');
  };

  const handleMultiDropWord = (player: 'p1' | 'p2' | 'p3', fromIdx: number, toIdx: number) => {
    if (roundWinner !== null || fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    if (player === 'p1') {
      const updated = [...p1Words];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setP1Words(updated);
      setP1DraggedIdx(null);
      setP1DragOverIdx(null);
    } else if (player === 'p2') {
      const updated = [...p2Words];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setP2Words(updated);
      setP2DraggedIdx(null);
      setP2DragOverIdx(null);
    } else if (player === 'p3') {
      const updated = [...p3Words];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setP3Words(updated);
      setP3DraggedIdx(null);
      setP3DragOverIdx(null);
    }
    triggerSound('/coin.mp3');
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
        onQuestionAnswered(true, 0);
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
      if (gradeCompletedCount >= 10 || gradeCompletedCount >= currentGradeSentences.length) {
        setTimeout(() => {
          setShowVictoryModal(true);
          triggerSound('/para.mp3');
          onGameCompleted?.(0, 1);
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
        onQuestionAnswered(false, 0);
      }

      setTimeout(() => setShowErrorShake(false), 800);
    }
  };

  const handleNextSentence = () => {
    triggerSound('/op.mp3');
    if (currentSentenceIndex < currentGradeSentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      setShuffledGradeSentences(shuffleArray(GRADE_SENTENCES[selectedGrade]));
      setCurrentSentenceIndex(0);
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

      const pIdx = player === 'p1' ? 0 : player === 'p2' ? 1 : 2;
      if (onQuestionAnswered) onQuestionAnswered(true, pIdx);

      let nextScore = 0;
      if (player === 'p1') {
        nextScore = player1Score + 1;
        setPlayer1Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p1');
          onGameCompleted?.(0, activePlayerMode);
          return;
        }
      } else if (player === 'p2') {
        nextScore = player2Score + 1;
        setPlayer2Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p2');
          onGameCompleted?.(1, activePlayerMode);
          return;
        }
      } else if (player === 'p3') {
        nextScore = player3Score + 1;
        setPlayer3Score(nextScore);
        if (nextScore >= TARGET_WIN_SCORE) {
          setMatchWinner('p3');
          onGameCompleted?.(2, activePlayerMode);
          return;
        }
      }

      // 1.5 saniye sonra sonraki cümleye geç (Tüm cümleler bittiğinde yeniden karıştır)
      setTimeout(() => {
        if (currentSentenceIndex < currentGradeSentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          setShuffledGradeSentences(shuffleArray(GRADE_SENTENCES[selectedGrade]));
          setCurrentSentenceIndex(0);
        }
      }, 1500);
    } else {
      triggerSound('/hata.mp3');
      const pIdx = player === 'p1' ? 0 : player === 'p2' ? 1 : 2;
      if (onQuestionAnswered) onQuestionAnswered(false, pIdx);

      if (player === 'p1') {
        setP1Shake(true);
        const nextMistakes = player1Mistakes + 1;
        setPlayer1Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setMatchWinner('p2');
          onGameCompleted?.(1, activePlayerMode);
          return;
        }
        setTimeout(() => setP1Shake(false), 800);
      } else if (player === 'p2') {
        setP2Shake(true);
        const nextMistakes = player2Mistakes + 1;
        setPlayer2Mistakes(nextMistakes);
        if (nextMistakes >= MAX_MISTAKES) {
          setMatchWinner('p1');
          onGameCompleted?.(0, activePlayerMode);
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
    setShuffledGradeSentences(shuffleArray(GRADE_SENTENCES[selectedGrade] || GRADE_SENTENCES[1]));
    setCurrentSentenceIndex(0);
    setSingleTimeLeft(100);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer3Score(0);
    setPlayer1Mistakes(0);
    setPlayer2Mistakes(0);
    setPlayer3Mistakes(0);
    setMatchWinner(null);
    setRoundWinner(null);
    setIsCorrect(false);
    setCompletedSentences([]);
  };

  const p1Student = selectedStudentIds[0] ? students?.find(s => s.id === selectedStudentIds[0]) : null;
  const p2Student = selectedStudentIds[1] ? students?.find(s => s.id === selectedStudentIds[1]) : null;
  const p3Student = selectedStudentIds[2] ? students?.find(s => s.id === selectedStudentIds[2]) : null;

  const multiPlayers = [
    {
      key: 'p1' as const, label: '1. Oyuncu', student: p1Student, score: player1Score, mistakes: player1Mistakes,
      words: p1Words, selIdx: p1SelectedIdx, draggedIdx: p1DraggedIdx, overIdx: p1DragOverIdx, shake: p1Shake,
      setDragged: setP1DraggedIdx, setOver: setP1DragOverIdx,
    },
    {
      key: 'p2' as const, label: '2. Oyuncu', student: p2Student, score: player2Score, mistakes: player2Mistakes,
      words: p2Words, selIdx: p2SelectedIdx, draggedIdx: p2DraggedIdx, overIdx: p2DragOverIdx, shake: p2Shake,
      setDragged: setP2DraggedIdx, setOver: setP2DragOverIdx,
    },
    {
      key: 'p3' as const, label: '3. Oyuncu', student: p3Student, score: player3Score, mistakes: player3Mistakes,
      words: p3Words, selIdx: p3SelectedIdx, draggedIdx: p3DraggedIdx, overIdx: p3DragOverIdx, shake: p3Shake,
      setDragged: setP3DraggedIdx, setOver: setP3DragOverIdx,
    },
  ];

  const assembledText = words.map(w => w.text).join(' ') + currentSentence.punctuation;
  const gradeCompletedCount = currentGradeSentences.filter(s => completedSentences.includes(s.id)).length;

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] xs:top-[60px] sm:top-[74px] md:top-[80px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
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

      {/* 3. OYUN ALANI (ORTA ALAN) */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-between w-full overflow-y-auto no-scrollbar p-1.5 sm:p-2.5">
        
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
        {activePlayerMode === 1 ? (() => {
          const singleCarItems: FitTrainItem[] = [
            {
              key: 'single-loko',
              node: (
                <div className="relative flex flex-col items-center justify-end select-none pb-0.5">
                  <div className="relative">
                    <TrimmedImg
                      src="/loko.webp"
                      alt="Lokomotif"
                      style={{ height: MULTI_CAR_H }}
                      className="w-auto object-contain select-none pointer-events-none drop-shadow-md block"
                      draggable={false}
                    />
                    <div className="absolute -top-2 left-4 px-1.5 py-0.5 bg-black/75 rounded-full border border-amber-400/50 text-[8.5px] font-black text-amber-300 shadow flex items-center gap-0.5">
                      <span>💨</span>
                      <span>LOKO</span>
                    </div>
                  </div>
                </div>
              ),
            },
            ...words.map((word, idx) => {
              const isSelected = selectedWordIndex === idx;
              const isDragged = draggedIndex === idx;
              const isOver = dragOverIndex === idx;
              return {
                key: `single-${word.id}`,
                node: (
                  <div
                    draggable={!isCorrect}
                    onDragStart={(e) => {
                      setDraggedIndex(idx);
                      e.dataTransfer.setData('text/plain', String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverIndex !== idx) setDragOverIndex(idx);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null) {
                        handleDropWord(draggedIndex, idx);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onClick={() => handleWordClick(idx)}
                    className={`group relative flex flex-col items-center justify-end select-none cursor-grab active:cursor-grabbing transition-all pb-0.5 ${
                      isCorrect
                        ? 'scale-105 filter drop-shadow-[0_0_16px_rgba(16,185,129,0.85)] animate-bounce'
                        : isOver
                        ? 'scale-110 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.95)] z-20'
                        : isSelected
                        ? 'scale-110 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.95)] z-20 animate-pulse'
                        : isDragged
                        ? 'opacity-40 scale-95'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                  >
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-0.5 shadow-sm border ${
                      isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-300'
                        : isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-200'
                        : 'bg-black/75 text-amber-200 border-amber-400/40'
                    }`}>
                      Vagon #{idx + 1}
                    </div>
                    <div className="relative flex items-center justify-center">
                      <TrimmedImg
                        src="/vago.webp"
                        alt={`Vagon ${idx + 1}`}
                        style={{ height: MULTI_CAR_H }}
                        className="w-auto object-contain select-none pointer-events-none block"
                        draggable={false}
                      />
                      <div className="absolute top-[20%] inset-x-2 bottom-[36%] flex items-center justify-center pointer-events-none px-1">
                        <span
                          style={{ fontSize: multiCarFont(word.text) }}
                          className="text-slate-950 font-black text-center leading-tight tracking-tight whitespace-nowrap"
                        >
                          {word.text}
                        </span>
                      </div>
                      {isCorrect ? (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-md">✓</span>
                      ) : isSelected ? (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 text-[10px] font-black shadow-md animate-ping">●</span>
                      ) : null}
                    </div>
                  </div>
                ),
              };
            }),
          ];

          return (
            <div className="w-full flex-1 flex flex-col items-center justify-between max-w-5xl mx-auto min-h-0 overflow-hidden px-1 sm:px-2 py-0.5">
              <main className="flex-1 w-full flex flex-col items-center justify-between gap-1 sm:gap-1.5 min-h-0 overflow-hidden py-0.5">
              
                {/* Cümle Kartı Başlığı & Geri Sayım Sayacı */}
                <div className="flex items-center gap-2 sm:gap-3 bg-black/60 px-3 sm:px-4 py-0.5 rounded-xl border border-white/15 shadow-sm shrink-0">
                  <span className="text-base sm:text-lg">{currentSentence.themeEmoji}</span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                    {currentSentence.themeTitle}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({currentSentenceIndex + 1} / {currentGradeSentences.length})
                  </span>
                  {/* 100s Geri Sayım Sayacı */}
                  <div className={`border rounded-lg px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                    singleTimeLeft <= 3 
                      ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                      : 'bg-[#080e1d] border-slate-700 text-slate-200'
                  }`}>
                    <span className="text-xs">⏱️</span>
                    <span>{singleTimeLeft}s</span>
                  </div>
                </div>

                {/* Kelimeler & Tren Alanı */}
                <div className={`w-full flex-1 min-h-0 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b ${currentSentence.themeGradient} border-2 ${currentSentence.borderColor} ${currentSentence.glowColor} shadow-xl flex flex-col items-center justify-between gap-1 overflow-hidden transition-all ${
                  showErrorShake ? 'animate-shake' : ''
                }`}>
                  {/* Bilgilendirme */}
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 border border-amber-400/40 text-[10px] sm:text-xs font-bold text-amber-200 text-center shrink-0">
                    <img src="/loko.webp" alt="Lokomotif" className="w-4 h-auto object-contain inline-block" />
                    <span>Vagonları sürükleyerek veya tıklayarak doğru sıraya diz!</span>
                  </div>

                  {/* TREN ARENASI: FitTrain ile kutuya otomatik sığdırılır, asla ekrandan taşmaz */}
                  <FitTrain
                    items={singleCarItems}
                    className="w-full flex-1 min-h-0 my-0.5 border-2 border-amber-300/80 rounded-xl shadow-md bg-notebook-paper relative"
                    gapX={0}
                    maxScale={1.5}
                  />

                  {/* Önizleme Cümlesi */}
                  <div className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-center shrink-0">
                    <span className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-widest block font-bold">
                      Oluşturulan Cümle
                    </span>
                    <span className={`text-sm sm:text-base md:text-lg font-black ${
                      isCorrect ? 'text-emerald-400' : 'text-white'
                    }`}>
                      "{assembledText}"
                    </span>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      onClick={handleShuffle}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition"
                      title="Kelimeleri Karıştır"
                    >
                      <Shuffle size={13} />
                      <span>Karıştır</span>
                    </button>

                    {!isCorrect ? (
                      <button
                        onClick={handleCheck}
                        className="px-5 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-emerald-300 flex items-center gap-2 cursor-pointer transition active:scale-95"
                      >
                        <CheckCircle2 size={15} />
                        <span>KONTROL ET</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNextSentence}
                        className="px-5 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-200 flex items-center gap-2 cursor-pointer transition active:scale-95 animate-bounce"
                      >
                        <span>SONRAKİ CÜMLE</span>
                        <ArrowRight size={15} />
                      </button>
                    )}

                    <button
                      onClick={() => speakSentence(assembledText)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition"
                      title="Sesli Oku"
                    >
                      <Volume2 size={13} />
                      <span>Dinle</span>
                    </button>
                  </div>

                  {/* Didaktik İpucu ve Eğlenceli Bilgi (Kompakt Tek Satır Izgara) */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1 shrink-0">
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg px-2 py-0.5 text-[11px] text-amber-200 flex items-center gap-1.5 truncate">
                      <HelpCircle size={13} className="text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-300 shrink-0">Kural:</span>
                      <span className="truncate">{currentSentence.didacticHint}</span>
                    </div>

                    <div className="bg-sky-950/40 border border-sky-500/30 rounded-lg px-2 py-0.5 text-[11px] text-sky-200 flex items-center gap-1.5 truncate">
                      <Sparkles size={13} className="text-sky-400 shrink-0" />
                      <span className="font-bold text-sky-300 shrink-0">İpucu:</span>
                      <span className="truncate">{currentSentence.funFact}</span>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          );
        })() : (
          /* =================================================================== */
          /* B) 2 VE 3 OYUNCU MODU (KAPIŞMA DÜELLOSU) */
          /* =================================================================== */
          <main className="flex-1 min-h-[290px] w-full flex flex-col items-center gap-1.5 py-0.5">
            
            {/* Cümle Konusu Bilgi Şeridi */}
            <div className="bg-black/60 px-3 py-0.5 rounded-2xl border border-white/20 flex items-center gap-2 shrink-0 max-w-full">
              <span className="text-base">{currentSentence.themeEmoji}</span>
              <span className="text-xs sm:text-sm font-black text-amber-300 uppercase whitespace-nowrap">
                {currentSentence.themeTitle}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 truncate">
                — Cümleyi ilk kurup "KONTROL ET" butonuna basan kazanır!
              </span>
            </div>

            {/* Oyuncu Alanları: sütunlar eşit paylaşır (min-w-0), tren kutuya otomatik sığar */}
            <div className="w-full flex-1 min-h-0 flex flex-row gap-1.5 sm:gap-3">
              {multiPlayers.slice(0, activePlayerMode).map((p) => {
                const t = PLAYER_THEMES[p.key];
                const carItems: FitTrainItem[] = [
                  {
                    key: `${p.key}-loko`,
                    node: (
                      <img
                        src="/loko.webp"
                        alt="Lokomotif"
                        style={{ height: MULTI_CAR_H }}
                        className="w-auto object-contain select-none pointer-events-none drop-shadow-md block"
                        draggable={false}
                      />
                    ),
                  },
                  ...p.words.map((word, idx) => {
                    const isSel = p.selIdx === idx;
                    const isDragged = p.draggedIdx === idx;
                    const isOver = p.overIdx === idx;
                    return {
                      key: `${p.key}-${word.id}`,
                      node: (
                        <div
                          draggable={roundWinner === null}
                          onDragStart={(e) => {
                            p.setDragged(idx);
                            e.dataTransfer.setData('text/plain', String(idx));
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (p.overIdx !== idx) p.setOver(idx);
                          }}
                          onDragLeave={() => p.setOver(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (p.draggedIdx !== null) {
                              handleMultiDropWord(p.key, p.draggedIdx, idx);
                            }
                          }}
                          onDragEnd={() => {
                            p.setDragged(null);
                            p.setOver(null);
                          }}
                          onClick={() => handleMultiWordClick(p.key, idx)}
                          className={`group relative flex flex-col items-center justify-end select-none cursor-grab active:cursor-grabbing transition-all ${
                            roundWinner === p.key
                              ? 'scale-105 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-bounce'
                              : isOver
                              ? 'scale-110 filter drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] z-20'
                              : isSel
                              ? 'scale-110 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] z-20'
                              : isDragged
                              ? 'opacity-40 scale-95'
                              : 'hover:scale-105 active:scale-95'
                          }`}
                        >
                          <div className={`text-[11px] font-black uppercase mb-0.5 ${t.labelText}`}>#{idx + 1}</div>
                          <div className="relative flex items-center justify-center">
                            <img
                              src="/vago.webp"
                              alt={`Vagon ${idx + 1}`}
                              style={{ height: MULTI_CAR_H }}
                              className="w-auto object-contain select-none pointer-events-none block"
                              draggable={false}
                            />
                            <div className="absolute top-[20%] inset-x-2 bottom-[36%] flex items-center justify-center pointer-events-none px-1">
                              <span
                                style={{ fontSize: multiCarFont(word.text) }}
                                className="text-slate-950 font-black text-center leading-tight tracking-tight whitespace-nowrap"
                              >
                                {word.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    };
                  }),
                ];

                return (
                  <div
                    key={p.key}
                    className={`flex-1 basis-0 min-w-0 min-h-0 rounded-2xl sm:rounded-3xl ${t.panelBg} border-2 ${
                      roundWinner === p.key ? 'border-emerald-400 ring-4 ring-emerald-400/50' : t.border
                    } p-1.5 sm:p-2 flex flex-col shadow-xl transition-all ${p.shake ? 'animate-shake' : ''}`}
                  >
                    {/* OYUNCU BİLGİ VE SKOR ŞERİDİ */}
                    <div className={`flex items-center justify-between gap-1 border-b ${t.divider} pb-1 shrink-0 h-8`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base sm:text-lg shrink-0">{t.dot}</span>
                        <span className={`font-black ${t.nameText} text-xs sm:text-sm uppercase truncate`}>
                          {p.student ? p.student.name : p.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-black text-amber-300 text-xs sm:text-sm bg-black/40 px-1.5 py-0.5 rounded-lg border border-amber-400/30 whitespace-nowrap">
                          {p.score} Puan
                        </span>
                        <div className="flex items-center gap-0.5 text-xs sm:text-sm">
                          {[0, 1, 2].map(i => (
                            <span key={i} className={i >= (MAX_MISTAKES - p.mistakes) ? 'opacity-30 grayscale' : ''}>
                              {i < (MAX_MISTAKES - p.mistakes) ? '❤️' : '❌'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* TREN ARENASI: kutuya otomatik sığdırılır */}
                    <FitTrain
                      items={carItems}
                      className="my-1 border-2 border-amber-300/80 rounded-2xl shadow-sm bg-notebook-paper-dense relative"
                    />

                    {/* ÖNİZLEME VE KONTROL BUTONU */}
                    <div className={`pt-1 border-t ${t.divider} flex flex-col gap-1 shrink-0`}>
                      <div className={`bg-black/50 px-2 py-0.5 rounded-xl text-xs sm:text-sm font-bold text-center truncate border ${t.previewText}`}>
                        "{p.words.map(w => w.text).join(' ')}"
                      </div>
                      <button
                        onClick={() => handleMultiCheck(p.key)}
                        className={`w-full py-1.5 sm:py-2 bg-gradient-to-r ${t.btn} text-white font-black text-xs sm:text-sm md:text-base rounded-xl sm:rounded-2xl shadow-lg border active:scale-95 cursor-pointer transition-all`}
                      >
                        ✓ KONTROL ET
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* 4. ALT DOCK - TÜM MODLARDA (1, 2 VE 3 KİŞİLİK) EN ALTTA TEK SIRA ÖĞRENCİ LİSTESİ */}
        {students && onOpenRosterModal && (
          <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
            <StudentAvatarDock
              students={students}
              currentGrade={selectedGrade}
              playerCount={activePlayerMode}
              selectedStudentIds={activePlayerMode === 1 ? [selectedStudentId || null] : (selectedStudentIds || [])}
              onSelectStudentForPlayer={(pIdx, sId) => {
                if (activePlayerMode === 1) {
                  onSelectStudent?.(sId);
                  onSelectStudentForPlayer?.(0, sId);
                } else {
                  if (onSelectStudentForPlayer) {
                    onSelectStudentForPlayer(pIdx, sId);
                  } else if (onSelectStudent && pIdx === 0) {
                    onSelectStudent(sId);
                  }
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