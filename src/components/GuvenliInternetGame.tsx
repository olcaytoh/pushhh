import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, ShieldAlert, Sparkles, RotateCcw, Volume2, Home, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, AlertTriangle,
  Lock, Globe, Users, HelpCircle
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

export interface GuvenliInternetQuestion {
  id: string;
  type: 'kisisel_bilgi' | 'guvenli_mi' | 'cumle_tamamla';
  title: string;
  scenario: string;
  detail?: string;
  badge: string;
  emoji: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    color: 'emerald' | 'rose' | 'amber' | 'blue';
    icon?: string;
  }[];
  explanation: string;
}

export const GUVENLI_INTERNET_QUESTIONS: GuvenliInternetQuestion[] = [
  // 1. KİŞİSEL BİLGİ DEDEKTİFİ (8 Soru / Cümle)
  {
    id: 'gi-1',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Adımız ve Soyadımız',
    detail: 'İnternette oyun oynarken veya sohbet ederken',
    badge: 'Kişisel Bilgi mi?',
    emoji: '👤',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Gizli Tut / Paylaşma!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Genel Bilgi)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'Adımız ve soyadımız bize ait kişisel bir bilgidir, internette tanımadığımız kişilerle paylaşılmamalıdır!'
  },
  {
    id: 'gi-2',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Ev Adresimiz ve Okulumuzun Adı',
    detail: 'İnternette karşılaştığımız yabancı kişilere',
    badge: 'Kişisel Bilgi mi?',
    emoji: '🏠',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Gizli Tut / Paylaşma!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Genel Bilgi)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'Ev adresimiz ve okulumuz sadece bize ve ailemize özeldir, internette asla paylaşılmaz!'
  },
  {
    id: 'gi-3',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'En Sevdiğim Oyun ve Sevdiğim Renk',
    detail: 'Arkadaşlarla genel oyun sohbeti yaparken',
    badge: 'Kişisel Bilgi mi?',
    emoji: '🎨',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Gizli Tut / Paylaşma!)', isCorrect: false, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Genel Beğeni)', isCorrect: true, color: 'emerald', icon: '✨' }
    ],
    explanation: 'Sevdiğimiz renk veya oyun bir tehlike oluşturmaz, genel bir beğenidir.'
  },
  {
    id: 'gi-4',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Hesap Şifrelerimiz ve Gizli Kodlarımız',
    detail: 'En yakın okul arkadaşımız bile istese',
    badge: 'Kişisel Bilgi mi?',
    emoji: '🔑',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Sadece Ailem Bilir!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Arkadaşa Verilir)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'Şifrelerimizi sadece anne ve babamızla paylaşırız; arkadaşlarımıza bile asla vermeyiz!'
  },
  {
    id: 'gi-5',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Telefon Numaramız ve Anne-Babamızın Mesleği',
    detail: 'İnternette puan veya hediye teklif eden birine',
    badge: 'Kişisel Bilgi mi?',
    emoji: '📱',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Gizli Tut / Paylaşma!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Genel Bilgi)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'Telefon numaramız ve ailemizin bilgileri en önemli kişisel bilgilerimizdendir, yabancılara verilmez!'
  },
  {
    id: 'gi-6',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'T.C. Kimlik Numaramız ve Doğum Tarihimiz',
    detail: 'İnternette kayıt formu doldururken sorulduğunda',
    badge: 'Kişisel Bilgi mi?',
    emoji: '🪪',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Asla Paylaşılmaz!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Herkes Görebilir)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'T.C. kimlik numarası ve doğum tarihi yalnızca resmi işlemlerde ailemiz tarafından kullanılır, internette paylaşılamaz!'
  },
  {
    id: 'gi-7',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Tuttuğumuz Takım ve Dinlediğimiz Müzik Türü',
    detail: 'Müzik dinlerken veya spor konuşurken',
    badge: 'Kişisel Bilgi mi?',
    emoji: '⚽',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Gizli Tutulmalı)', isCorrect: false, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Genel İlgi Alanı)', isCorrect: true, color: 'emerald', icon: '✨' }
    ],
    explanation: 'Sevdiğimiz spor takımı veya müzik türü kişisel gizlilik içermeyen genel zevklerimizdir.'
  },
  {
    id: 'gi-8',
    type: 'kisisel_bilgi',
    title: 'Kişisel Bilgi Dedektifi',
    scenario: 'Ailemizin Kredi Kartı ve Banka Bilgileri',
    detail: 'Oyun içi ücretsiz elmas/altın vaat eden bir sitede',
    badge: 'Kişisel Bilgi mi?',
    emoji: '💳',
    options: [
      { id: 'opt-1', text: '🛑 KİŞİSEL BİLGİ (Çok Gizli / Sakın Verme!)', isCorrect: true, color: 'rose', icon: '🔒' },
      { id: 'opt-2', text: '🟢 PAYLAŞILABİLİR (Ödül İçin Girilir)', isCorrect: false, color: 'emerald', icon: '🌐' }
    ],
    explanation: 'Banka ve kart bilgileri ailemize aittir; bu bilgileri asla hiçbir yere yazmamalıyız!'
  },

  // 2. GÜVENLİ Mİ, GÜVENLİ DEĞİL Mİ? (8 Soru / Cümle)
  {
    id: 'gi-9',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Tanımadığım bir kişiden gelen mesajı açmak ve ona cevap yazmak',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '✉️',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL (Uzak Dur!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Gerçek hayatta tanımadığımız kişiler internette de yabancıdır. Mesajlarına cevap vermemeliyiz!'
  },
  {
    id: 'gi-10',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Eğitici ve güvenilir bir siteden ders anlatım videosu izlemek',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '📺',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL (Uzak Dur!)', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Öğretmenimizin ve ailemizin onayladığı eğitici sitelerden faydalanmak güvenli ve faydalıdır.'
  },
  {
    id: 'gi-11',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Ekranda aniden çıkan "Tebrikler hediye kazandınız!" yazan linke tıklamak',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '🔗',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL (Tıklama!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Aniden çıkan renkli pencereler ve bilinmeyen linkler zararlı yazılımlar içerebilir, tıklamamalıyız!'
  },
  {
    id: 'gi-12',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Bizi üzen, korkutan bir resim veya video gördüğümüzde ailemize ve öğretmenimize haber vermek',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '👨‍👩‍👧‍👦',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ (Doğru Adım)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'İnternette bizi rahatsız eden bir durumla karşılaşırsak hemen tableti bırakıp bir büyüğümüze haber vermeliyiz.'
  },
  {
    id: 'gi-13',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Ekran başında geçireceğimiz günlük süreyi ailemizle birlikte belirlemek',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '⏱️',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ (Bilinçli Kullanım)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Ekran süresini ailemizle planlamak sağlığımızı ve derslerimizi korur.'
  },
  {
    id: 'gi-14',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'İnternette tanıştığımız tanımadığımız biriyle gerçek hayatta buluşmaya gitmek',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '🚫',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL (Çok Tehlikeli!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'İnternetteki yabancılar gerçek kimliklerini saklayabilir. Ailemizin haberi olmadan asla yabancılarla buluşulmaz!'
  },
  {
    id: 'gi-15',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Arkadaşlarımızın fotoğraflarını onlardan ve ailelerinden izin almadan internette paylaşmak',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '📸',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL (İzinsiz Paylaşılmaz!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Başkalarının fotoğraflarını ve bilgilerini izinsiz paylaşmak onların haklarına saygısızlıktır ve tehlikelidir.'
  },
  {
    id: 'gi-16',
    type: 'guvenli_mi',
    title: 'Güvenli İnternet Davranışı',
    scenario: 'Tableti ve telefonu gözümüze en az 35-40 cm mesafede tutarak aydınlık odada kullanmak',
    badge: 'Güvenli mi? Güvenli Değil mi?',
    emoji: '👀',
    options: [
      { id: 'opt-1', text: '✅ GÜVENLİ DAVRANIŞ (Göz Sağlığı)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ GÜVENLİ DEĞİL', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Karanlıkta ekrana bakmamak ve mesafeyi korumak göz sağlığımız için en temel kuraldır.'
  },

  // 3. CÜMLE TAMAMLAMA & ALTIN KURALLAR (8 Soru / Cümle)
  {
    id: 'gi-17',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'İnternette tanımadığım kişilerle ilgili bir sorun yaşarsam __________ haber veririm.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '📝',
    options: [
      { id: 'opt-1', text: 'aileme', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'yabancılara', isCorrect: false, color: 'amber' },
      { id: 'opt-3', text: 'hiç kimseye', isCorrect: false, color: 'rose' }
    ],
    explanation: 'Sorun yaşadığımızda daima ailemize ve öğretmenimize haber veririz.'
  },
  {
    id: 'gi-18',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'Adım, ev adresim ve okul numaram __________ bilgilerimdir.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '🛡️',
    options: [
      { id: 'opt-1', text: 'kişisel', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'herkese açık', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'önemsiz', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Adımız, adresimiz ve okul numaramız kimseyle paylaşılmaması gereken kişisel bilgilerimizdir.'
  },
  {
    id: 'gi-19',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'Bilinmeyen ve güven vermeyen __________ tıklamak çok tehlikeli olabilir.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '⚠️',
    options: [
      { id: 'opt-1', text: 'linklere', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'kitaplara', isCorrect: false, color: 'amber' },
      { id: 'opt-3', text: 'ödevlere', isCorrect: false, color: 'blue' }
    ],
    explanation: 'Bilinmeyen internet linkleri (bağlantıları) cihazımıza ve bilgilerimize zarar verebilir.'
  },
  {
    id: 'gi-20',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'İnternette iletişim kurarken gerçek hayattaki gibi her zaman __________ bir dil kullanmalıyız.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '🤝',
    options: [
      { id: 'opt-1', text: 'nazik ve saygılı', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'kırıcı', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'öfkeli', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Sanal dünyada da olsa herkese karşı kibar, saygılı ve anlayışlı davranmalıyız.'
  },
  {
    id: 'gi-21',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'İnternet şifrelerimizi anne ve babamız dışında __________ ile paylaşmamalıyız.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '🔐',
    options: [
      { id: 'opt-1', text: 'hiç kimse', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'oyundaki yabancılar', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'tüm sınıf', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Şifrelerimiz yalnızca ailemizle aramızdaki özel bir sırdır.'
  },
  {
    id: 'gi-22',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'İnternette gördüğümüz her bilgi her zaman __________ olmayabilir, büyüklerimize sormalıyız.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '💡',
    options: [
      { id: 'opt-1', text: 'doğru', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'yanlış', isCorrect: false, color: 'amber' },
      { id: 'opt-3', text: 'güzel', isCorrect: false, color: 'blue' }
    ],
    explanation: 'İnternette yanıltıcı ve hatalı bilgiler olabilir; bilgiyi öğretmenimize veya ailemize teyit ettirmeliyiz.'
  },
  {
    id: 'gi-23',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'Ekran başında saatlerce oturmak yerine derslerimize ve __________ vakit ayırmalıyız.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '🏃',
    options: [
      { id: 'opt-1', text: 'fiziksel oyunlara', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'daha çok tablete', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'televizyona', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Açık havada oyun oynamak, kitap okumak ve spor yapmak bedenimizi ve ruhumuzu geliştirir.'
  },
  {
    id: 'gi-24',
    type: 'cumle_tamamla',
    title: 'Güvenli İnternet Cümle Tamamlama',
    scenario: 'Cihazımıza yeni bir oyun veya uygulama yüklemeden önce mutlaka __________ izin almalıyız.',
    badge: 'Boşluğa Hangi Kelime Gelmeli?',
    emoji: '👨‍👧',
    options: [
      { id: 'opt-1', text: 'ailemizden', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'internetteki yabancıdan', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'hiç kimseden', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Uygulamaların ve oyunların güvenli olup olmadığını sadece ailemiz kontrol edebilir.'
  }
];

interface GuvenliInternetGameProps {
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

export const GuvenliInternetGame: React.FC<GuvenliInternetGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  playerCountMode = 1,
  onSwitchPlayerCountMode,
  students = [],
  selectedStudentId,
  selectedStudentIds = [null, null, null],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  const [playerMode, setPlayerMode] = useState<1 | 2 | 3>(playerCountMode || 1);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Karıştırılmış sorular
  const [questions, setQuestions] = useState<GuvenliInternetQuestion[]>(() => 
    [...GUVENLI_INTERNET_QUESTIONS].sort(() => Math.random() - 0.5)
  );

  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const currentQ = questions[currentIndex] || questions[0];

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      try {
        playMp3(src);
      } catch (err) {
        console.error(err);
      }
    }
  }, [soundEnabled, playMp3]);

  const handleSelectOption = (option: GuvenliInternetQuestion['options'][0]) => {
    if (isAnswered || gameOver) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);
    const correct = option.isCorrect;
    setIsCorrectAnswer(correct);

    if (correct) {
      triggerSound('/ding.mp3');
      setScores(prev => {
        const next = [...prev];
        next[activePlayer] = (next[activePlayer] || 0) + 10;
        return next;
      });
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      triggerSound('/buzz.mp3');
    }

    if (onQuestionAnswered) {
      onQuestionAnswered(correct, activePlayer);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length || currentIndex >= 9) {
      // Oyun bitti
      setGameOver(true);
      triggerSound('/alkis.mp3');
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 }
      });

      if (onGameCompleted) {
        let winnerIdx: number | null = 0;
        if (playerMode > 1) {
          const maxScore = Math.max(...scores.slice(0, playerMode));
          winnerIdx = scores.slice(0, playerMode).indexOf(maxScore);
        }
        onGameCompleted(winnerIdx, playerMode);
      }
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrectAnswer(null);

    if (playerMode > 1) {
      setActivePlayer(prev => (prev + 1) % playerMode);
    }
  };

  const handleRestart = () => {
    setQuestions([...GUVENLI_INTERNET_QUESTIONS].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setActivePlayer(0);
    setScores([0, 0, 0]);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrectAnswer(null);
    setGameOver(false);
    triggerSound('/op.mp3');
  };

  const playerColors = [
    { name: '1. Oyuncu', badge: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-300' },
    { name: '2. Oyuncu', badge: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-300' },
    { name: '3. Oyuncu', badge: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-300' }
  ];

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden"
    >
      <ActivityBackground theme="uzay" opacity={0.65} dimCenter={true} />

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#09111e]/95 via-[#132238]/95 to-[#09111e]/95 border-b-2 border-cyan-500/40 shadow-xl backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ana Sayfa */}
          <button
            onClick={() => {
              triggerSound('/op.mp3');
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/80 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            title="Ana Sayfaya Dön"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </button>

          {/* Önceki Etkinlik */}
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onPrevActivity();
              }}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-500/50 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              title="Önceki Hayat Bilgisi Etkinliği"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Önceki</span>
            </button>
          )}
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col items-center text-center px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-xl">🛡️</span>
            <h1 className="font-black text-xs sm:text-sm md:text-base tracking-wide bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 bg-clip-text text-transparent uppercase drop-shadow">
              GÜVENLİ İNTERNET DÜNYASI
            </h1>
            <span className="text-base sm:text-xl">💻</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-cyan-300/80 font-bold">
            <span>2. Sınıf Hayat Bilgisi</span>
            <span>•</span>
            <span className="text-amber-300">9. Hafta Ders Notları</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Oyuncu Sayısı Seçimi */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            {([1, 2, 3] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  triggerSound('/op.mp3');
                  setPlayerMode(mode);
                  if (onSwitchPlayerCountMode) onSwitchPlayerCountMode(mode);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  playerMode === mode 
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}P
              </button>
            ))}
          </div>

          {/* Ses Aç / Kapa */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Sonraki Etkinlik */}
          {onNextActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onNextActivity();
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border border-emerald-400/60 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              title="Sonraki Hayat Bilgisi Etkinliği"
            >
              <span className="hidden md:inline">Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* STUDENT AVATAR DOCK */}
      {students.length > 0 && onSelectStudentForPlayer && onOpenRosterModal && (
        <div className="relative z-20 shrink-0 bg-slate-900/60 border-b border-slate-800/80 px-2 py-1">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds}
            onSelectStudentForPlayer={onSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* SCORE & TURN INDICATORS (MULTI-PLAYER) */}
      {playerMode > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 py-2 px-3 bg-black/40 border-b border-cyan-500/20 shrink-0">
          {Array.from({ length: playerMode }).map((_, pIdx) => {
            const isTurn = activePlayer === pIdx;
            const pInfo = playerColors[pIdx];
            return (
              <div 
                key={pIdx}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border-2 transition-all ${
                  isTurn 
                    ? `${pInfo.border} bg-slate-900/90 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105` 
                    : 'border-slate-800 bg-slate-950/60 opacity-60'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${pInfo.badge} ${isTurn ? 'animate-ping' : ''}`} />
                <span className={`font-black text-xs sm:text-sm ${pInfo.text}`}>
                  {pInfo.name}
                </span>
                <span className="font-extrabold text-xs sm:text-sm bg-black/50 px-2 py-0.5 rounded-lg border border-slate-700 text-amber-300">
                  {scores[pIdx]} P
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN GAMEPLAY CONTENT AREA */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {!gameOver ? (
          <div className="w-full max-w-3xl flex flex-col items-center gap-3 sm:gap-4">
            {/* QUESTION PROGRESS & BADGE */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                {currentQ.badge}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700">
                  Soru {currentIndex + 1} / {Math.min(questions.length, 10)}
                </span>
                {playerMode === 1 && (
                  <span className="text-xs sm:text-sm font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-400/40">
                    Puan: {scores[0]}
                  </span>
                )}
              </div>
            </div>

            {/* QUESTION DISPLAY CARD */}
            <div className="w-full rounded-3xl bg-gradient-to-b from-[#101d33]/95 via-[#0e182b]/95 to-[#0b1322]/95 border-2 border-cyan-400/60 p-4 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/50 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                {currentQ.emoji}
              </div>

              <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-cyan-300/90">
                {currentQ.title}
              </h2>

              <p className="font-black text-lg sm:text-2xl md:text-3xl text-white leading-snug drop-shadow-md max-w-2xl px-2">
                "{currentQ.scenario}"
              </p>

              {currentQ.detail && (
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 italic">
                  ({currentQ.detail})
                </p>
              )}
            </div>

            {/* INTERACTIVE OPTION BUTTONS */}
            <div className={`grid ${currentQ.options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 sm:gap-3.5 w-full`}>
              {currentQ.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                let btnStyle = "bg-slate-900/90 hover:bg-slate-850 border-slate-700 text-slate-100 hover:border-cyan-400/70";

                if (isAnswered) {
                  if (option.isCorrect) {
                    btnStyle = "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]";
                  } else if (isSelected) {
                    btnStyle = "bg-gradient-to-r from-rose-700 to-red-800 border-rose-400 text-white opacity-90";
                  } else {
                    btnStyle = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`group relative p-3 sm:p-4 rounded-2xl border-2 font-black text-sm sm:text-base md:text-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${btnStyle}`}
                  >
                    {option.icon && <span className="text-xl sm:text-2xl">{option.icon}</span>}
                    <span className="text-center">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* FEEDBACK & NEXT BUTTON */}
            {isAnswered && (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d1c2f]/95 border-2 border-cyan-400/70 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-2.5 text-left">
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className={`font-black text-xs sm:text-sm uppercase tracking-wide ${isCorrectAnswer ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {isCorrectAnswer ? 'TEBRİKLER! HARİKA CEVAP' : 'DİKKAT! GÜVENLİ İNTERNET NOTU'}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-black text-sm sm:text-base shadow-lg shadow-cyan-500/30 border border-cyan-200 flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform cursor-pointer"
                >
                  <span>{currentIndex + 1 >= Math.min(questions.length, 10) ? 'Sonuçları Gör' : 'Sıradaki Soru'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* GAME OVER / RESULTS MODAL */
          <div className="w-full max-w-md rounded-3xl bg-[#0e1b2f]/95 border-2 border-cyan-400/80 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-4xl shadow-lg animate-bounce">
              🏆
            </div>

            <h2 className="font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
              GÜVENLİ İNTERNET ŞAMPİYONU!
            </h2>

            <p className="text-xs sm:text-sm text-cyan-200">
              Harika! İnternette kişisel bilgilerini koruma ve güvenli davranış kurallarını başarıyla tamamladın!
            </p>

            {/* Final Scores */}
            <div className="w-full space-y-2 my-2">
              {Array.from({ length: playerMode }).map((_, pIdx) => (
                <div 
                  key={pIdx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30"
                >
                  <span className={`font-black text-sm ${playerColors[pIdx].text}`}>
                    {playerColors[pIdx].name}
                  </span>
                  <span className="font-black text-base text-amber-300">
                    {scores[pIdx]} Puan
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
              <button
                onClick={handleRestart}
                className="w-full flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Oyna</span>
              </button>

              {onNextActivity && (
                <button
                  onClick={() => {
                    triggerSound('/op.mp3');
                    onNextActivity();
                  }}
                  className="w-full flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md border border-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Sonraki Etkinliğe Geç</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
