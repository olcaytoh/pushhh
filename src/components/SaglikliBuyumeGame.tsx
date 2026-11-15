import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, Sparkles, RotateCcw, Volume2, Home, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, Apple, Dumbbell, Moon, Bath, Shield, Award
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

export interface SaglikliBuyumeQuestion {
  id: string;
  type: 'saglik_cantasi' | 'besin_sepeti' | 'dogru_yanlis' | 'kelime_tamamla';
  title: string;
  scenario: string;
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

export const SAGLIKLI_BUYUME_QUESTIONS: SaglikliBuyumeQuestion[] = [
  // 1. SAĞLIK ÇANTAMI DOLDURUYORUM (6 Soru / Cümle)
  {
    id: 'sb-1',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Günde en az 2 kez dişlerimizi düzenli fırçalamak',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '🪥',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK (Çantama Ekle)', isCorrect: true, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI (Zararlı)', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Günde en az 2 kez diş fırçalamak çürükleri önler ve ağız sağlığımızı korur.'
  },
  {
    id: 'sb-2',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Gece geç saatte uyumak ve uykusuz kalmak',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '🥱',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK', isCorrect: false, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI (Büyümeyi Engeller)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Büyüme hormonları en çok gece uykusundayken salgılanır. Erken yatıp en az 9-10 saat uyumalıyız!'
  },
  {
    id: 'sb-3',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Mevsiminde taze meyve ve sebze tüketmek',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '🍎',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK (Vitamin Deposu)', isCorrect: true, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Taze meyve ve sebzeler vitamin deposudur, vücudumuzu mikroplara ve hastalıklara karşı korur.'
  },
  {
    id: 'sb-4',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Sürekli paketli cips, kola ve aşırı şekerli gıdalar tüketmek',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '🍟',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK', isCorrect: false, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI (Zararlı Alışkanlık)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Paketli ve aşırı şekerli gıdalar kemiklerimizi ve kaslarımızı beslemez, çabuk yorulmamıza neden olur.'
  },
  {
    id: 'sb-5',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Günde 1 - 1.5 litre temiz içme suyu içmek',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '💧',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK (Hayat Kaynağı)', isCorrect: true, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Vücudumuzun susuz kalmaması ve organlarımızın sağlıklı çalışması için her gün bol su içmeliyiz.'
  },
  {
    id: 'sb-6',
    type: 'saglik_cantasi',
    title: 'Sağlık Çantamı Dolduruyorum',
    scenario: 'Tırnaklarımızı düzenli kesmek ve haftada en az 2 kez banyo yapmak',
    badge: 'Sağlıklı mı? Uzak mı Durulmalı?',
    emoji: '🛁',
    options: [
      { id: 'opt-1', text: '🟢 SAĞLIKLI ALIŞKANLIK (Temizlik & Hijyen)', isCorrect: true, color: 'emerald', icon: '✨' },
      { id: 'opt-2', text: '🛑 UZAK DURULMALI', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Kişisel bakımımızı düzenli yapmak tırnak altlarındaki mikropları temizler ve bizi hastalıklardan korur.'
  },

  // 2. BESİN SEPETLERİNİ AYIRALIM (6 Soru / Cümle)
  {
    id: 'sb-7',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Ayran, Yoğurt ve Taze Ceviz',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🥛',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Ayran, yoğurt ve ceviz kemiklerimizi güçlendiren ve zihnimizi açan çok faydalı besinlerdir.'
  },
  {
    id: 'sb-8',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Asitli Gazlı İçecekler ve Şekerli Lolipop',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🍭',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Asitli içecekler ve şekerli şekerlemeler dişlerimizi çürütür ve mideye zarar verir.'
  },
  {
    id: 'sb-9',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Balık, Yumurta ve Taze Ispanak',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🐟',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ (Güçlü Büyüme)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Balık, yumurta ve sebzeler kaslarımızın büyümesi ve boyumuzun uzaması için gereklidir.'
  },
  {
    id: 'sb-10',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Yağda Aşırı Kızarmış Patates ve Hazır Hamburger',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🍔',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Aşırı yağlı ve kızartılmış hazır gıdalar damar sağlığımıza zarar verir ve obeziteye yol açabilir.'
  },
  {
    id: 'sb-11',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Süt, Beyaz Peynir, Zeytin ve Domates',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🧀',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ (Harika Kahvaltı)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Peynir, süt ve zeytin kalsiyum deposudur, kemiklerimizi çelik gibi sağlam yapar.'
  },
  {
    id: 'sb-12',
    type: 'besin_sepeti',
    title: 'Besin Sepetlerini Ayıralım',
    scenario: 'Açıkta Satılan Tarihi Geçmiş Renkli Şekerlemeler',
    badge: 'Hangi Sepete Koymalıyız?',
    emoji: '🍬',
    options: [
      { id: 'opt-1', text: '🥗 SAĞLIKLI BESİNLER SEPETİ', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '🍟 SAĞLIĞA ZARARLI BESİNLER SEPETİ', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Açıkta satılan veya son kullanma tarihi geçmiş gıdalar besin zehirlenmesine neden olabilir.'
  },

  // 3. DOĞRU MU, YANLIŞ MI? (6 Soru / Cümle)
  {
    id: 'sb-13',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Büyüme hormonları en çok biz gece derin uykudayken salgılanır.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '🌙',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Bu nedenle her akşam 21.00-21.30 gibi erken saatte yatağa gitmeliyiz.'
  },
  {
    id: 'sb-14',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Kahvaltı yapmadan okula gitmek gün boyu enerjik olmamızı sağlar.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '🍳',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE (Kahvaltı Şarttır!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Kahvaltı günün en önemli öğünüdür. Kahvaltı yapmazsak derslerde halsiz ve dikkatsiz oluruz.'
  },
  {
    id: 'sb-15',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Yemeklerden önce ve sonra ellerimizi en az 20 saniye sabunla yıkamalıyız.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '🧼',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE (Hijyen Kuralı)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: '20 saniye sabunla el yıkamak mikropları tamamen yok eder ve bizi hastalıktan korur.'
  },
  {
    id: 'sb-16',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Ambalajı yırtılmış veya son kullanma tarihi geçmiş yiyecekleri güvenle yiyebiliriz.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '⚠️',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE (Tarihi Kontrol Edilmeli!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Gıda ürünlerini satın alırken daima son kullanma tarihine ve ambalajın sağlam olmasına bakmalıyız.'
  },
  {
    id: 'sb-17',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Günde en az 8-10 saat uyumak zihinsel ve bedensel gelişimimizi destekler.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '🛌',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE (Yeterli Uyku)', isCorrect: true, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE', isCorrect: false, color: 'rose', icon: '✗' }
    ],
    explanation: 'Çocuklar için düzenli ve yeterli uyku boy uzaması ve ders başarısı için vazgeçilmezdir.'
  },
  {
    id: 'sb-18',
    type: 'dogru_yanlis',
    title: 'Sağlıklı Büyüme İlkeleri',
    scenario: 'Ders çalışırken loş ve karanlık ortamda oturmak gözlerimizi dinlendirir.',
    badge: 'Doğru mu? Yanlış mı?',
    emoji: '💡',
    options: [
      { id: 'opt-1', text: '✅ DOĞRU İFADE', isCorrect: false, color: 'emerald', icon: '✓' },
      { id: 'opt-2', text: '❌ YANLIŞ İFADE (Aydınlık Olmalı!)', isCorrect: true, color: 'rose', icon: '✗' }
    ],
    explanation: 'Ders çalışırken ve kitap okurken ortam yeterince aydınlık olmalı ve ışık sol üstten gelmelidir.'
  },

  // 4. KELİME TAMAMLAMA (6 Soru / Cümle)
  {
    id: 'sb-19',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Düzenli olarak __________ yapmak kaslarımızı güçlendirir ve bizi dinç tutar.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '🏃‍♂️',
    options: [
      { id: 'opt-1', text: 'spor', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'uyku', isCorrect: false, color: 'amber' },
      { id: 'opt-3', text: 'şeker', isCorrect: false, color: 'rose' }
    ],
    explanation: 'İp atlamak, top oynamak ve spor yapmak bedenimizi zinde ve neşeli tutar.'
  },
  {
    id: 'sb-20',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Ellerimizi sabunla düzenli yıkayarak bedenimizi __________ koruruz.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '🦠',
    options: [
      { id: 'opt-1', text: 'mikroplardan', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'arkadaşlardan', isCorrect: false, color: 'amber' },
      { id: 'opt-3', text: 'vitaminlerden', isCorrect: false, color: 'rose' }
    ],
    explanation: 'Kişisel temizlik ve hijyen sayesinde mikroplardan korunuruz.'
  },
  {
    id: 'sb-21',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Kemiklerimizin güçlenmesi ve boyumuzun uzaması için her gün düzenli olarak __________ içmeliyiz.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '🥛',
    options: [
      { id: 'opt-1', text: 'süt', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'kola', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'şerbet', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Süt ve süt ürünleri zengin kalsiyum içerir ve kemik gelişimini hızlandırır.'
  },
  {
    id: 'sb-22',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Vücudumuzun ihtiyacı olan tüm besinlerden yeteri kadar tüketmeye __________ beslenme denir.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '🥗',
    options: [
      { id: 'opt-1', text: 'dengeli', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'tek yönlü', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'hızlı', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Her besin grubundan (protein, vitamin, karbonhidrat, mineral) yeterli miktarda almaya dengeli beslenme denir.'
  },
  {
    id: 'sb-23',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Yemek yerken sandalyede dik oturmalı ve yiyeceklerimizi acele etmeden __________ çiğnemeliyiz.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '🍽️',
    options: [
      { id: 'opt-1', text: 'iyice', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'çiğnemeden', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'hızlıca', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Lokmaları iyice çiğnemek sindirimi kolaylaştırır ve midemizi rahatlatır.'
  },
  {
    id: 'sb-24',
    type: 'kelime_tamamla',
    title: 'Cümleyi Doğru Kelimeyle Tamamla',
    scenario: 'Kişisel bakımımız için uzayan tırnaklarımızı düzenli olarak __________ gerekir.',
    badge: 'Hangi Kelime Gelmeli?',
    emoji: '✂️',
    options: [
      { id: 'opt-1', text: 'kesmemiz', isCorrect: true, color: 'emerald' },
      { id: 'opt-2', text: 'uzatmamız', isCorrect: false, color: 'rose' },
      { id: 'opt-3', text: 'boyamamız', isCorrect: false, color: 'amber' }
    ],
    explanation: 'Tırnak altlarında biriken mikropların vücudumuza girmemesi için tırnaklarımızı uzadıkça kesmeliyiz.'
  }
];

interface SaglikliBuyumeGameProps {
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

export const SaglikliBuyumeGame: React.FC<SaglikliBuyumeGameProps> = ({
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

  const [questions, setQuestions] = useState<SaglikliBuyumeQuestion[]>(() =>
    [...SAGLIKLI_BUYUME_QUESTIONS].sort(() => Math.random() - 0.5)
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

  const handleSelectOption = (option: SaglikliBuyumeQuestion['options'][0]) => {
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
    setQuestions([...SAGLIKLI_BUYUME_QUESTIONS].sort(() => Math.random() - 0.5));
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
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col bg-slate-950 text-white select-none overflow-hidden"
    >
      <ActivityBackground theme="doga" opacity={0.65} dimCenter={true} />

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#0c241d]/95 via-[#133529]/95 to-[#0c241d]/95 border-b-2 border-emerald-500/40 shadow-xl backdrop-blur-md shrink-0">
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
            <Home className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </button>

          {/* Önceki Etkinlik */}
          {onPrevActivity && (
            <button
              onClick={() => {
                triggerSound('/op.mp3');
                onPrevActivity();
              }}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/50 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
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
            <span className="text-base sm:text-xl">🍎</span>
            <h1 className="font-black text-xs sm:text-sm md:text-base tracking-wide bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent uppercase drop-shadow">
              SAĞLIKLI BÜYÜYORUM VE GELİŞİYORUM
            </h1>
            <span className="text-base sm:text-xl">💪</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-emerald-300/80 font-bold">
            <span>2. Sınıf Hayat Bilgisi</span>
            <span>•</span>
            <span className="text-amber-300">8. Hafta Ders Notları</span>
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
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
              soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'
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
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white border border-teal-400/60 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              title="Sonraki Hayat Bilgisi Etkinliği"
            >
              <span className="hidden md:inline">Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* SCORE & TURN INDICATORS (MULTI-PLAYER) */}
      {playerMode > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 py-2 px-3 bg-black/40 border-b border-emerald-500/20 shrink-0">
          {Array.from({ length: playerMode }).map((_, pIdx) => {
            const isTurn = activePlayer === pIdx;
            const pInfo = playerColors[pIdx];
            return (
              <div 
                key={pIdx}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border-2 transition-all ${
                  isTurn 
                    ? `${pInfo.border} bg-slate-900/90 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105` 
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
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {!gameOver ? (
          <div className="w-full max-w-3xl flex flex-col items-center gap-3 sm:gap-4">
            {/* QUESTION PROGRESS & BADGE */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-emerald-400" />
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
            <div className="w-full rounded-3xl bg-gradient-to-b from-[#0e2a20]/95 via-[#0c231a]/95 to-[#081812]/95 border-2 border-emerald-400/60 p-4 sm:p-6 shadow-[0_0_35px_rgba(16,185,129,0.25)] flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400/50 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                {currentQ.emoji}
              </div>

              <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-emerald-300/90">
                {currentQ.title}
              </h2>

              <p className="font-black text-lg sm:text-2xl md:text-3xl text-white leading-snug drop-shadow-md max-w-2xl px-2">
                "{currentQ.scenario}"
              </p>
            </div>

            {/* INTERACTIVE OPTION BUTTONS */}
            <div className={`grid ${currentQ.options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 sm:gap-3.5 w-full`}>
              {currentQ.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                let btnStyle = "bg-slate-900/90 hover:bg-slate-850 border-slate-700 text-slate-100 hover:border-emerald-400/70";

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
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b241c]/95 border-2 border-emerald-400/70 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-2.5 text-left">
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className={`font-black text-xs sm:text-sm uppercase tracking-wide ${isCorrectAnswer ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {isCorrectAnswer ? 'HARİKA! SAĞLIKLI BÜYÜME SEÇİMİ' : 'DİKKAT! ÖĞRENCİ DEFTER NOTU'}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 border border-emerald-200 flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform cursor-pointer"
                >
                  <span>{currentIndex + 1 >= Math.min(questions.length, 10) ? 'Sonuçları Gör' : 'Sıradaki Soru'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* GAME OVER / RESULTS MODAL */
          <div className="w-full max-w-md rounded-3xl bg-[#0c241c]/95 border-2 border-emerald-400/80 p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-4xl shadow-lg animate-bounce">
              🍎
            </div>

            <h2 className="font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
              SAĞLIKLI YAŞAM ŞAMPİYONU!
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200">
              Tebrikler! 8. Hafta Sağlıklı Büyüme ve Gelişme alışkanlıklarını harika puanlarla tamamladın!
            </p>

            {/* Final Scores */}
            <div className="w-full space-y-2 my-2">
              {Array.from({ length: playerMode }).map((_, pIdx) => (
                <div 
                  key={pIdx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30"
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
                  className="w-full flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm shadow-md border border-teal-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Sonraki Etkinliğe Geç</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* STUDENT AVATAR DOCK (BOTTOM) */}
      {onOpenRosterModal && (
        <div className="relative z-20 shrink-0 bg-slate-950/90 border-t border-emerald-500/20 px-1 py-1">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}
    </div>
  );
};
