import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Check,
  Play,
  Target,
  X,
  Trash2,
  Users,
  Crown,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  GraduationCap,
  Cloud,
  RotateCcw
} from 'lucide-react';
import { User } from '../firebase';
import { StatRecord, GroupStatsRecord, SinglePlayerStatsRecord } from '../types';
import { Student } from '../types/student';
import { exportStudentsToPDF } from '../utils/studentPdfExport';
import { StudentTopicStatsDetail } from './StudentTopicStatsDetail';
import { resetSingleStudentStat, resetSingleStudentTopicStat } from '../utils/studentStore';
import { loadHomeworkData, getTodayDateString } from '../utils/homeworkStore';
import { topics1stGrade } from '../data/topics1stGrade';
import { topics2ndGrade } from '../data/topics2ndGrade';
import { topics3rdGrade } from '../data/topics3rdGrade';
import { topics4thGrade } from '../data/topics4thGrade';
import { halatCekmeTopics } from '../data/halatCekmeTopics';

export const Cute3DRobotMascotSVG: React.FC<{ sizePx?: number; className?: string }> = ({ sizePx = 90, className = '' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: sizePx, height: sizePx }}>
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-xl hover:scale-105 transition-transform"
    >
      <rect x="25" y="30" width="50" height="42" rx="10" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2.5" />
      <circle cx="50" cy="18" r="6" fill="#f59e0b" />
      <line x1="50" y1="24" x2="50" y2="30" stroke="#94a3b8" strokeWidth="3" />
      <rect x="33" y="40" width="34" height="18" rx="6" fill="#0f172a" />
      <circle cx="42" cy="49" r="4.5" fill="#38bdf8" />
      <circle cx="58" cy="49" r="4.5" fill="#38bdf8" />
      <circle cx="43.5" cy="47.5" r="1.5" fill="#ffffff" />
      <circle cx="59.5" cy="47.5" r="1.5" fill="#ffffff" />
      <path d="M 44 64 Q 50 67 56 64" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <rect x="17" y="44" width="8" height="14" rx="3" fill="#64748b" />
      <rect x="75" y="44" width="8" height="14" rx="3" fill="#64748b" />
      <rect x="35" y="72" width="10" height="8" rx="2" fill="#475569" />
      <rect x="55" y="72" width="10" height="8" rx="2" fill="#475569" />
    </svg>
  </div>
);

export const Cute3DStarMascotSVG = Cute3DRobotMascotSVG;

interface ModernStatsViewProps {
  statsData?: Record<string, StatRecord>;
  groupStatsData?: GroupStatsRecord;
  singleStatsData?: SinglePlayerStatsRecord;
  gradeStatsData?: Record<number, Record<string, StatRecord>>;
  gradeGroupStatsData?: Record<number, GroupStatsRecord>;
  activeGrade?: number | null;
  topicsByGrade?: {
    1: Record<string, { title: string; desc?: string; icon?: string }>;
    2: Record<string, { title: string; desc?: string; icon?: string }>;
    3: Record<string, { title: string; desc?: string; icon?: string }>;
    4: Record<string, { title: string; desc?: string; icon?: string }>;
  };
  topic3DIcons?: Record<string, string>;
  topics?: Record<string, { title: string; desc?: string; icon?: string }>;
  openedTopics?: string[];
  unlockedBadges?: string[];
  badgeCounts?: Record<string, number>;
  playerLevel?: {
    currentLevel: number;
    levelTitle: string;
    levelIcon: string;
    totalCorrect: number;
    totalBadgesEarned: number;
  };
  streak?: number;
  students?: Student[];
  onOpenRosterModal?: (grade?: number) => void;
  onSelectTopic: (topicKey: string, grade?: number) => void;
  onResetStats?: () => void;
  onResetGradeStats?: (grade: number) => void;
  onResetTopicStats?: (topicKey: string, grade?: number) => void;
  confirmReset?: boolean;
  setConfirmReset?: (val: boolean) => void;
  onClose: () => void;
  currentUser?: User | null;
  onOpenCloudSync?: () => void;
  onOpenOdevAkvaryumu?: () => void;
}

const ALL_INTERACTIVE_TOPICS: Record<string, { title: string; desc?: string; icon?: string }> = {
  turkce_sozluk_sirala: {
    title: 'Sözlük Sıralama (Harf Sıralaması)',
    desc: 'Alfabetik harf sıralama portalı (1, 2 & 3 Kişilik Yarış)',
    icon: '/MENUIKON/grid_icon_25.webp',
  },
  turkce_kelime_sirala: {
    title: 'Kelime Sıralama (Sözlük Sırası)',
    desc: 'Kelimeleri sözlük sırasına göre dizme portalı (1, 2 & 3 Kişilik Yarış)',
    icon: '/MENUIKON/grid_icon_26.webp',
  },
  turkce_sozcuk_sirala: {
    title: 'Sözlük Sıralama (Harf Sıralaması)',
    desc: 'Alfabetik harf ve kelime sıralama portalı (2 & 3 Kişilik Yarış)',
    icon: '/MENUIKON/grid_icon_25.webp',
  },
  turkce_zit_anlam: {
    title: 'Zıt Anlamlı Kelimeler',
    desc: 'Karşıt anlamlı sözcükleri eşleştirme & çok oyunculu düello',
    icon: '/MENUIKON/grid_icon_27.webp',
  },
  turkce_es_anlam: {
    title: 'Eş Anlamlı Kelimeler',
    desc: 'Anlamdaş kelimeleri bulma & yarışma modu',
    icon: '/MENUIKON/grid_icon_21.webp',
  },
  turkce_kuralli_cumle: {
    title: 'Kurallı Cümle Oluşturma',
    desc: 'Kelimeleri kurallı ve anlamlı şekilde doğru sıraya dizme treni',
    icon: '/MENUIKON/grid_icon_28.webp',
  },
  turkce_hece_sayisi: {
    title: 'Kelimelerin Hece Sayısını Belirleme',
    desc: 'Sözcükleri hecelerine ayırma & sesli harfe göre hece sayma',
    icon: '/MENUIKON/grid_icon_05.webp',
  },
  turkce_hece_makasi: {
    title: 'Hece Makası (Hecelere Ayırma)',
    desc: 'Sözcükleri heceleme çizgilerinden doğru kesme yarışı',
    icon: '/MENUIKON/grid_icon_28.webp',
  },
  turkce_yazim_dedektifi: {
    title: 'Yazım Yanlışı Dedektifi',
    desc: 'Cümledeki yazım ve imla hatalarını keşfetme dedektifi',
    icon: '/MENUIKON/grid_icon_31.webp',
  },
  dedektif_5n1k: {
    title: '5N1K Dedektifi',
    desc: 'Ne, Nerede, Ne Zaman, Nasıl, Neden, Kim sorularını çözme',
    icon: '/MENUIKON/grid_icon_32.webp',
  },
  noktalama_avcisi: {
    title: 'Noktalama İşaretleri Avcısı',
    desc: 'Nokta, virgül, soru ve ünlem işaretlerini tamamlama',
    icon: '/MENUIKON/grid_icon_35.webp',
  },
  harf_corbasi: {
    title: 'Harf Çorbası (Anagram Kelime)',
    desc: 'Karışık harflerden anlamlı kelime türetme yarışı',
    icon: '/MENUIKON/grid_icon_04.webp',
  },
  geometrik_sekilleri_bul: {
    title: 'Geometrik Cisimleri Bul',
    desc: 'Günlük hayat nesnelerini geometrik cisimlerle eşleştirme',
    icon: '/MENUIKON/grid_icon_10.webp',
  },
  saglikli_tabak: {
    title: 'Sağlıklı Tabak (Dengeli Beslenme)',
    desc: 'Yararlı ve zararlı besinleri ayırt etme',
    icon: '/MENUIKON/grid_icon_15.webp',
  },
  geri_donusum: {
    title: 'Geri Dönüşüm Kahramanı',
    desc: 'Atıkları cam, plastik, kağıt ve metal kutularına ayırma',
    icon: '/MENUIKON/grid_icon_11.webp',
  },
  istek_ihtiyac: {
    title: 'İstek mi, İhtiyaç mı?',
    desc: 'Zorunlu ihtiyaçlar ile keyifli istekleri ayırt etme',
    icon: '/MENUIKON/grid_icon_07.webp',
  },
  mevsim_gardirobu: {
    title: 'Mevsim Gardırobu',
    desc: 'Hava durumuna ve mevsime uygun giysileri seçme',
    icon: '/MENUIKON/grid_icon_21.webp',
  },
  aynisini_bul: {
    title: 'Aynısını Bul Dikkat Düellosu',
    desc: 'Kartlar arasındaki ortak nesneyi ilk bulan kazanır',
    icon: '/MENUIKON/grid_icon_26.webp',
  },
  onu_bul: {
    title: '10\'u Bul Matematik Düellosu',
    desc: 'Toplamı 10 yapan sayı çiftlerini hızlıca keşfet',
    icon: '/MENUIKON/grid_icon_18.webp',
  },
  yirmiyi_bul: {
    title: '20\'yi Bul Matematik Düellosu',
    desc: 'Toplamı 20 yapan sayı çiftlerini hızlıca keşfet',
    icon: '/MENUIKON/grid_icon_05.webp',
  },
};

export const ModernStatsView: React.FC<ModernStatsViewProps> = ({
  statsData = {},
  groupStatsData,
  singleStatsData,
  gradeStatsData = {},
  gradeGroupStatsData = {},
  activeGrade = 2,
  topicsByGrade,
  topic3DIcons = {},
  topics = {},
  students = [],
  onOpenRosterModal,
  onSelectTopic,
  onResetStats,
  onResetGradeStats,
  onResetTopicStats,
  confirmReset: propConfirmReset,
  setConfirmReset: propSetConfirmReset,
  onClose,
  currentUser,
  onOpenCloudSync,
  onOpenOdevAkvaryumu
}) => {
  // Active grade tab: defaults to currently chosen grade in the app, or 2nd grade
  const initialGrade = (activeGrade && [1, 2, 3, 4].includes(activeGrade)) ? activeGrade : 2;
  const [currentGrade, setCurrentGrade] = useState<number>(initialGrade);

  // Sync currentGrade when activeGrade prop changes
  useEffect(() => {
    if (activeGrade && [1, 2, 3, 4].includes(activeGrade)) {
      setCurrentGrade(activeGrade);
      setViewMode('tek_kisilik');
      setCategoryFilter('hepsi');
      setConfirmReset(false);
    }
  }, [activeGrade]);

  // View mode: 'tek_kisilik' | 'dogru_yanlis' | 'gruplar' | 'ogrenciler'
  const [viewMode, setViewMode] = useState<'tek_kisilik' | 'dogru_yanlis' | 'gruplar' | 'ogrenciler'>('tek_kisilik');

  const [localStudents, setLocalStudents] = useState<Student[]>(students || []);
  useEffect(() => {
    setLocalStudents(students || []);
  }, [students]);

  const [localSingleStats, setLocalSingleStats] = useState<SinglePlayerStatsRecord | undefined>(singleStatsData);
  useEffect(() => {
    setLocalSingleStats(singleStatsData);
  }, [singleStatsData]);

  const [localStatsData, setLocalStatsData] = useState<Record<string, StatRecord>>(statsData || {});
  useEffect(() => {
    setLocalStatsData(statsData || {});
  }, [statsData]);

  const [localGroupStats, setLocalGroupStats] = useState<GroupStatsRecord | undefined>(groupStatsData);
  useEffect(() => {
    setLocalGroupStats(groupStatsData);
  }, [groupStatsData]);

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [homeworkMap, setHomeworkMap] = useState<Record<string, any>>(() => loadHomeworkData());
  const todayStr = getTodayDateString();

  useEffect(() => {
    setHomeworkMap(loadHomeworkData());
  }, [viewMode, currentGrade]);

  const gradeStudents = localStudents.filter(s => s.grade === currentGrade);
  const studentTotalCorrect = gradeStudents.reduce((sum, s) => sum + (s.totalCorrect || 0), 0);
  const studentTotalWrong = gradeStudents.reduce((sum, s) => sum + (s.totalWrong || 0), 0);
  const studentTotalQuestions = studentTotalCorrect + studentTotalWrong;
  const studentAvgAccuracy = studentTotalQuestions > 0 ? Math.round((studentTotalCorrect / studentTotalQuestions) * 100) : 0;

  const filteredGradeStudents = gradeStudents.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.className && s.className.toLowerCase().includes(q));
  });

  const handleResetSingleStudent = (studentId: string) => {
    const updated = resetSingleStudentStat(studentId);
    setLocalStudents(updated);
  };

  const handleResetSingleStudentTopic = (studentId: string, topicKey: string) => {
    const updated = resetSingleStudentTopicStat(studentId, topicKey);
    setLocalStudents(updated);
  };

  const [confirmTopicResetKey, setConfirmTopicResetKey] = useState<string | null>(null);

  const handleResetTopic = (topicKey: string) => {
    // 1. Notify parent handler to persist to localStorage & cloud
    if (onResetTopicStats) {
      onResetTopicStats(topicKey, currentGrade);
    }

    // 2. Immediately update local state in ModernStatsView for instant UI feedback
    setLocalSingleStats(prev => {
      if (!prev) return prev;
      const nextTopicStats = { ...(prev.topicStats || {}) };
      delete nextTopicStats[topicKey];
      let dogru = 0;
      let yanlis = 0;
      Object.values(nextTopicStats).forEach(st => {
        dogru += st.dogru || 0;
        yanlis += st.yanlis || 0;
      });
      return {
        ...prev,
        dogru,
        yanlis,
        topicStats: nextTopicStats
      };
    });

    setLocalStatsData(prev => {
      const next = { ...prev };
      delete next[topicKey];
      return next;
    });

    setLocalGroupStats(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      Object.keys(next).forEach(grpKey => {
        const grp = next[grpKey];
        if (grp && grp.topicStats && grp.topicStats[topicKey]) {
          const nextTopicStats = { ...grp.topicStats };
          delete nextTopicStats[topicKey];
          let dogru = 0;
          let yanlis = 0;
          Object.values(nextTopicStats).forEach(st => {
            dogru += st.dogru || 0;
            yanlis += st.yanlis || 0;
          });
          next[grpKey] = {
            ...grp,
            dogru,
            yanlis,
            topicStats: nextTopicStats
          };
        }
      });
      return next;
    });

    setLocalStudents(prev => {
      return prev.map(s => {
        if (!s.topicStats || !s.topicStats[topicKey]) return s;
        const topicStat = s.topicStats[topicKey];
        const topicCorrect = topicStat.correct || 0;
        const topicWrong = topicStat.wrong || 0;
        const nextTopicStats = { ...s.topicStats };
        delete nextTopicStats[topicKey];
        return {
          ...s,
          totalCorrect: Math.max(0, (s.totalCorrect || 0) - topicCorrect),
          totalWrong: Math.max(0, (s.totalWrong || 0) - topicWrong),
          topicStats: nextTopicStats
        };
      });
    });

    setConfirmTopicResetKey(null);
  };

  const [categoryFilter, setCategoryFilter] = useState<string>('hepsi');
  const [localConfirmReset, setLocalConfirmReset] = useState<boolean>(false);
  const [resetScope, setResetScope] = useState<'grade' | 'all'>('grade');
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);

  const confirmReset = propConfirmReset !== undefined ? propConfirmReset : localConfirmReset;
  const setConfirmReset = (val: boolean) => {
    if (propSetConfirmReset) propSetConfirmReset(val);
    setLocalConfirmReset(val);
  };

  // Switch grade tab helper
  const handleGradeChange = (grade: number) => {
    setCurrentGrade(grade);
    // When in 2nd grade, default to 'dogru_yanlis'; other grades default to 'gruplar'
    setViewMode(grade === 2 ? 'dogru_yanlis' : 'gruplar');
    setCategoryFilter('hepsi');
    setConfirmReset(false);
  };

  // Default group stats fallback
  const defaultGroups: GroupStatsRecord = {
    grup1: { id: 'grup1', name: '1. GRUP', badge: '🥇', color: 'blue', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
    grup2: { id: 'grup2', name: '2. GRUP', badge: '🥈', color: 'rose', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
    grup3: { id: 'grup3', name: '3. GRUP', badge: '🥉', color: 'emerald', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
  };

  // Grade-specific topics
  const baseGradeTopics: Record<string, { title: string; desc?: string; icon?: string }> = 
    (topicsByGrade && topicsByGrade[currentGrade as 1 | 2 | 3 | 4]) || (
      currentGrade === 1 ? topics1stGrade :
      currentGrade === 3 ? topics3rdGrade :
      currentGrade === 4 ? topics4thGrade :
      topics2ndGrade
    );

  const gradeTopics: Record<string, { title: string; desc?: string; icon?: string }> = {
    ...baseGradeTopics,
    ...(currentGrade === 2 ? ALL_INTERACTIVE_TOPICS : {})
  };

  // Attach grade-specific Halat Çekme activities
  if (currentGrade === 4) {
    if (halatCekmeTopics['halat_toplama_g4']) gradeTopics['halat_toplama_g4'] = halatCekmeTopics['halat_toplama_g4'];
    if (halatCekmeTopics['halat_carpma_g4']) gradeTopics['halat_carpma_g4'] = halatCekmeTopics['halat_carpma_g4'];
    if (halatCekmeTopics['halat_bolme_g4']) gradeTopics['halat_bolme_g4'] = halatCekmeTopics['halat_bolme_g4'];
  } else if (currentGrade === 1) {
    if (halatCekmeTopics['halat_toplama']) gradeTopics['halat_toplama'] = halatCekmeTopics['halat_toplama'];
    if (halatCekmeTopics['halat_cikarma']) gradeTopics['halat_cikarma'] = halatCekmeTopics['halat_cikarma'];
  } else if (currentGrade === 2) {
    if (halatCekmeTopics['halat_toplama_g2']) gradeTopics['halat_toplama_g2'] = halatCekmeTopics['halat_toplama_g2'];
    if (halatCekmeTopics['halat_cikarma_g2']) gradeTopics['halat_cikarma_g2'] = halatCekmeTopics['halat_cikarma_g2'];
  } else if (currentGrade === 3) {
    if (halatCekmeTopics['halat_toplama_g3']) gradeTopics['halat_toplama_g3'] = halatCekmeTopics['halat_toplama_g3'];
  }

  const topicKeys = Object.keys(gradeTopics);

  // Grade-specific group stats
  const activeGradeGroups = (gradeGroupStatsData && gradeGroupStatsData[currentGrade]) || localGroupStats || defaultGroups;
  const groupsList = [
    activeGradeGroups.grup1 || defaultGroups.grup1,
    activeGradeGroups.grup2 || defaultGroups.grup2,
    activeGradeGroups.grup3 || defaultGroups.grup3,
  ].map((g, gIdx) => {
    let gradeDogru = 0;
    let gradeYanlis = 0;
    let gradeWins = 0;

    const otherG1 = activeGradeGroups[`grup${gIdx === 0 ? 2 : 1}` as 'grup1'|'grup2'|'grup3'] || defaultGroups.grup2;
    const otherG2 = activeGradeGroups[`grup${gIdx === 2 ? 2 : 3}` as 'grup1'|'grup2'|'grup3'] || defaultGroups.grup3;

    topicKeys.forEach(k => {
      const myDogru = g.topicStats?.[k]?.dogru || 0;
      const myYanlis = g.topicStats?.[k]?.yanlis || 0;
      gradeDogru += myDogru;
      gradeYanlis += myYanlis;

      const o1Dogru = otherG1.topicStats?.[k]?.dogru || 0;
      const o2Dogru = otherG2.topicStats?.[k]?.dogru || 0;
      if (myDogru > 0 && myDogru > o1Dogru && myDogru > o2Dogru) {
        gradeWins += 1;
      }
    });

    return {
      ...g,
      dogru: gradeDogru,
      yanlis: gradeYanlis,
      wins: gradeWins,
    };
  });

  // Grade-specific individual / topic stats (Doğru / Yanlış)
  const activeGradeStats = (gradeStatsData && gradeStatsData[currentGrade]) || (currentGrade === 2 ? localStatsData : {});

  // Category classification per grade
  const getTopicCategory = (key: string, grade: number): string => {
    if (
      key.startsWith('turkce_') ||
      key === 'sozluk_sirala' ||
      key === 'kelime_sirala' ||
      key === 'zit_anlam' ||
      key === 'es_anlam' ||
      key === 'kuralli_cumle' ||
      key === 'hece_sayisi' ||
      key === 'hece_makasi' ||
      key === 'yazim_dedektifi' ||
      key === 'dedektif_5n1k' ||
      key === 'turkce_5n1k' ||
      key === 'noktalama_avcisi' ||
      key === 'turkce_noktalama' ||
      key === 'harf_corbasi' ||
      key === 'turkce_harf_corbasi'
    ) return 'turkce';

    if (
      key === 'saglikli_tabak' ||
      key === 'geri_donusum' ||
      key === 'istek_ihtiyac' ||
      key === 'mevsim_gardirobu'
    ) return 'hayat_bilgisi';

    if (
      key === 'aynisini_bul' ||
      key === 'onu_bul' ||
      key === 'yirmiyi_bul' ||
      key === 'xox' ||
      key === 'xox_matematik' ||
      key === 'abluka'
    ) return 'diger_oyunlar';

    if (grade === 1) {
      if (key.includes('geometri') || key.includes('uzamsal') || key.includes('es_nesneler')) return 'geometri';
      if (key.includes('ritmik')) return 'ritmik';
      if (key.includes('toplama')) return 'toplama';
      if (key.includes('cikarma')) return 'cikarma';
      if (key.includes('veri') || key.includes('takvim') || key.includes('uzunluk') || key.includes('tartma') || key.includes('paralar')) return 'olcme';
      return 'sayilar';
    }
    if (grade === 2) {
      if (key.includes('problem')) return 'problemler';
      if (key === 'geometrik_sekilleri_bul' || key.includes('cisim') || key.includes('geometri') || key.includes('simetri') || (key.includes('oruntu') && !key.includes('sayi'))) return 'geometri';
      if (key.includes('saat') || key.includes('takvim') || key.includes('zaman') || key.includes('uzunluk') || key.includes('sivi') || key.includes('tartma') || key.includes('paralar')) return 'zaman_olcme';
      if (key.includes('toplama')) return 'toplama';
      if (key.includes('cikarma')) return 'cikarma';
      if (key.includes('carp') || key.includes('bolme') || key.includes('paylastirma')) return 'carpma_bolme';
      return 'sayilar';
    }
    if (grade === 3) {
      if (key.startsWith('g3_tema1') || key.includes('uc_basamakli') || key.includes('cozumleme') || key.includes('siralama') || key.includes('yuvarlama') || key.includes('ritmik') || key.includes('tek_cift') || key.includes('tahmin')) return 'g3_tema1';
      if (key.startsWith('g3_tema2') || key.includes('kesir') || key.includes('payda') || key.includes('zaman') || key.includes('uzunluk') || key.includes('paralar')) return 'g3_tema2';
      if (key.startsWith('g3_tema3') || key.includes('toplama') || key.includes('cikarma') || key.includes('carpma') || key.includes('bolme') || key.includes('verilmeyen')) return 'g3_tema3';
      if (key.startsWith('g3_tema4') || key.includes('geometri') || key.includes('cisim') || key.includes('cevre')) return 'g3_tema4';
      return 'hepsi';
    }
    if (grade === 4) {
      if (key.startsWith('g4_sayi') || key.includes('basamak') || key.includes('yuvarlama') || key.includes('ritmik') || key.includes('oruntuleri')) return 'g4_tema1';
      if (key.includes('kesir') || key.includes('uzunluk') || key.includes('kutle')) return 'g4_tema2';
      if (key.includes('dort_islem') || key.includes('carpma') || key.includes('bolme') || key.includes('esitlik')) return 'g4_tema3';
      if (key.includes('geometrik') || key.includes('cevre') || key.includes('alan') || key.includes('dogru') || key.includes('simetri') || key.includes('grafigi') || key.includes('olasiligi')) return 'g4_tema4';
      return 'hepsi';
    }
    return 'sayilar';
  };

  // Grade categories configuration
  const getCategoriesForGrade = (grade: number) => {
    if (grade === 1) {
      return [
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.webp' },
        { id: 'turkce', label: '📖 Türkçe & Kelime', icon: '/MENUIKON/grid_icon_28.webp' },
        { id: 'hayat_bilgisi', label: '🌱 Hayat Bilgisi', icon: '/MENUIKON/grid_icon_15.webp' },
        { id: 'geometri', label: 'Geometri & Uzamsal', icon: '/MENUIKON/grid_icon_10.webp' },
        { id: 'sayilar', label: 'Sayılar', icon: '/MENUIKON/grid_icon_05.webp' },
        { id: 'ritmik', label: 'Ritmik Sayma', icon: '/MENUIKON/grid_icon_07.webp' },
        { id: 'toplama', label: 'Toplama', icon: '/MENUIKON/grid_icon_04.webp' },
        { id: 'cikarma', label: 'Çıkarma', icon: '/MENUIKON/grid_icon_11.webp' },
        { id: 'olcme', label: 'Ölçme & Veri', icon: '/MENUIKON/grid_icon_21.webp' },
        { id: 'diger_oyunlar', label: '🎮 Zeka Oyunları & Düellolar', icon: '/MENUIKON/grid_icon_26.webp' }
      ];
    }
    if (grade === 2) {
      return [
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.webp' },
        { id: 'turkce', label: '📖 2. Sınıf Türkçe', icon: '/MENUIKON/grid_icon_28.webp' },
        { id: 'hayat_bilgisi', label: '🌱 Hayat Bilgisi', icon: '/MENUIKON/grid_icon_15.webp' },
        { id: 'sayilar', label: 'Sayılar & Ritmik', icon: '/MENUIKON/grid_icon_05.webp' },
        { id: 'toplama', label: 'Toplama İşlemi', icon: '/MENUIKON/grid_icon_04.webp' },
        { id: 'cikarma', label: 'Çıkarma İşlemi', icon: '/MENUIKON/grid_icon_11.webp' },
        { id: 'carpma_bolme', label: 'Çarpma & Bölme', icon: '/MENUIKON/grid_icon_15.webp' },
        { id: 'geometri', label: 'Geometri & Şekiller', icon: '/MENUIKON/grid_icon_10.webp' },
        { id: 'zaman_olcme', label: 'Zaman & Ölçme', icon: '/MENUIKON/grid_icon_35.webp' },
        { id: 'problemler', label: 'Problemler', icon: '/MENUIKON/grid_icon_31.webp' },
        { id: 'diger_oyunlar', label: '🎮 Zeka Oyunları & Düellolar', icon: '/MENUIKON/grid_icon_26.webp' }
      ];
    }
    if (grade === 3) {
      return [
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.webp' },
        { id: 'turkce', label: '📖 Türkçe & Kelime', icon: '/MENUIKON/grid_icon_28.webp' },
        { id: 'g3_tema1', label: 'Tema 1: Sayılar & Ritmik', icon: '/MENUIKON/grid_icon_21.webp' },
        { id: 'g3_tema2', label: 'Tema 2: Kesirler & Ölçme', icon: '/MENUIKON/grid_icon_11.webp' },
        { id: 'g3_tema3', label: 'Tema 3: İşlemler & Problemler', icon: '/MENUIKON/grid_icon_15.webp' },
        { id: 'g3_tema4', label: 'Tema 4: Geometri & Veri', icon: '/MENUIKON/grid_icon_26.webp' },
        { id: 'diger_oyunlar', label: '🎮 Zeka Oyunları & Düellolar', icon: '/MENUIKON/grid_icon_26.webp' }
      ];
    }
    return [
      { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.webp' },
      { id: 'turkce', label: '📖 Türkçe & Kelime', icon: '/MENUIKON/grid_icon_28.webp' },
      { id: 'g4_tema1', label: 'Tema 1: Sayılar ve Nicelikler (1)', icon: '/MENUIKON/grid_icon_21.webp' },
      { id: 'g4_tema2', label: 'Tema 2: Sayılar ve Nicelikler (2)', icon: '/MENUIKON/grid_icon_11.webp' },
      { id: 'g4_tema3', label: 'Tema 3: İşlemler ve Cebirsel', icon: '/MENUIKON/grid_icon_15.webp' },
      { id: 'g4_tema4', label: 'Tema 4: Geometri ve Ölçme', icon: '/MENUIKON/grid_icon_26.webp' },
      { id: 'diger_oyunlar', label: '🎮 Zeka Oyunları & Düellolar', icon: '/MENUIKON/grid_icon_26.webp' }
    ];
  };

  const categories = getCategoriesForGrade(currentGrade);

  const filteredTopicKeys = topicKeys.filter(key => {
    if (categoryFilter === 'hepsi') return true;
    return getTopicCategory(key, currentGrade) === categoryFilter;
  });

  // Totals for active grade individual Doğru / Yanlış
  const gradeTotalDogru = Object.values(activeGradeStats).reduce((sum, item) => sum + ((item && item.dogru) || 0), 0);
  const gradeTotalYanlis = Object.values(activeGradeStats).reduce((sum, item) => sum + ((item && item.yanlis) || 0), 0);
  const gradeTotalSolved = gradeTotalDogru + gradeTotalYanlis;
  const gradeAccuracy = gradeTotalSolved > 0 ? Math.round((gradeTotalDogru / gradeTotalSolved) * 100) : 0;

  // Single player topic stats calculation
  const currentSingleStats = localSingleStats || singleStatsData;
  const singleTopicStats = currentSingleStats?.topicStats || {};
  let gradeSingleDogru = 0;
  let gradeSingleYanlis = 0;
  topicKeys.forEach(k => {
    if (singleTopicStats[k]) {
      gradeSingleDogru += singleTopicStats[k].dogru || 0;
      gradeSingleYanlis += singleTopicStats[k].yanlis || 0;
    }
  });
  const gradeSingleTotal = gradeSingleDogru + gradeSingleYanlis;
  const gradeSingleAccuracy = gradeSingleTotal > 0 ? Math.round((gradeSingleDogru / gradeSingleTotal) * 100) : 0;

  // Grade Badges Definition
  const GRADE_OPTIONS = [
    { grade: 1, label: '1. SINIF', icon: '/icon_1.webp', theme: 'from-amber-500 to-orange-600', ring: 'ring-amber-400' },
    { grade: 2, label: '2. SINIF', icon: '/icon_2.webp', theme: 'from-blue-600 to-indigo-700', ring: 'ring-blue-400' },
    { grade: 3, label: '3. SINIF', icon: '/icon_3.webp', theme: 'from-emerald-500 to-teal-700', ring: 'ring-emerald-400' },
    { grade: 4, label: '4. SINIF', icon: '/icon_4.webp', theme: 'from-purple-600 to-fuchsia-700', ring: 'ring-purple-400' }
  ];

  return (
    <div className="fixed inset-0 bg-[#0f0a2e]/95 backdrop-blur-xl z-[300] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* VIBRANT PURPLE CONTAINER FRAME - USING FULL EXPANDABLE HEIGHT */}
      <div className="bg-gradient-to-b from-[#3b239b] via-[#2f1b82] to-[#1e0f5c] text-white rounded-[22px] sm:rounded-[30px] border-2 sm:border-3 border-[#7d60ff]/50 shadow-[0_25px_70px_rgba(15,5,45,0.95)] max-w-3xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden relative">
        
        {/* COMPACT TOP HEADER - REDUCED HEIGHT FOR MORE TOPIC SPACE */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#240e78] via-[#351996] to-[#240e78] border-b border-[#7d60ff]/30 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow border border-amber-300 shrink-0 text-sm sm:text-base">
              🏆
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>{currentGrade}. Sınıf Matematik İstatistikleri</span>
                <img src={`/icon_${currentGrade}.webp`} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0" />
              </h2>
              <p className="text-[10px] text-purple-200/80 truncate">
                {viewMode === 'tek_kisilik'
                  ? 'Tek kişilik oyun ve etkinliklerin konu bazlı analizi'
                  : viewMode === 'dogru_yanlis'
                  ? 'Konulara göre doğru ve yanlış cevap analizi'
                  : viewMode === 'gruplar'
                  ? 'Grupların yarışma skorları ve konu başarıları'
                  : 'Öğrenci bazlı detaylı konu performans karnesi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95 shadow"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. ROW: 4 GRADE SELECTOR TABS (COMPACT) */}
        <div className="px-3 sm:px-4 pt-1.5 pb-1 shrink-0">
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-purple-400/30">
            {GRADE_OPTIONS.map(opt => {
              const isSelected = currentGrade === opt.grade;
              return (
                <button
                  key={opt.grade}
                  onClick={() => handleGradeChange(opt.grade)}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg font-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${opt.theme} text-white shadow-md ring-1.5 ${opt.ring}`
                      : 'bg-purple-950/40 text-purple-200/70 hover:bg-purple-900/60 hover:text-white'
                  }`}
                >
                  <img src={opt.icon} alt="" className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0 filter drop-shadow-sm" />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ROW: VIEW MODE SWITCHER (COMPACT) */}
        <div className="px-3 sm:px-4 py-0.5 shrink-0 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-lg border border-purple-400/30 flex-wrap">
            <button
              onClick={() => {
                setViewMode('tek_kisilik');
                setExpandedStudentId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'tek_kisilik'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow ring-1 ring-amber-300'
                  : 'text-purple-200/70 hover:text-white'
              }`}
              title={`${currentGrade}. Sınıf Tek Kişilik Etkinlik İstatistiklerini Gör`}
            >
              <Target size={13} className={viewMode === 'tek_kisilik' ? 'text-slate-950 stroke-[3]' : 'text-amber-300'} />
              <span>🎯 {currentGrade}. Sınıf Tek Kişilik</span>
            </button>
            <button
              onClick={() => {
                setViewMode('dogru_yanlis');
                setExpandedStudentId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'dogru_yanlis'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow ring-1 ring-emerald-300'
                  : 'text-purple-200/70 hover:text-white'
              }`}
            >
              <CheckCircle2 size={13} className="text-emerald-300" />
              <span>{currentGrade}. Sınıf Doğru - Yanlış</span>
            </button>
            <button
              onClick={() => {
                setViewMode('gruplar');
                setExpandedStudentId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'gruplar'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow ring-1 ring-blue-300'
                  : 'text-purple-200/70 hover:text-white'
              }`}
            >
              <Users size={13} className="text-blue-300" />
              <span>{currentGrade}. Sınıf Grupları</span>
            </button>
            <button
              onClick={() => {
                setViewMode('ogrenciler');
                setExpandedStudentId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'ogrenciler'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow ring-1 ring-purple-300'
                  : 'text-purple-200/70 hover:text-white'
              }`}
              title={`${currentGrade}. Sınıf Öğrencilerinin Konu Konu İstatistiklerini Gör`}
            >
              <Award size={13} className="text-amber-300 shrink-0" />
              <span>🎓 {currentGrade}. Sınıf Öğrencileri ({gradeStudents.length})</span>
            </button>

            {localStudents.length > 0 && (
              <button
                disabled={isPdfExporting}
                onClick={async () => {
                  try {
                    setIsPdfExporting(true);
                    await exportStudentsToPDF(gradeStudents, currentGrade);
                  } catch (e) {
                    console.error('PDF export error', e);
                  } finally {
                    setIsPdfExporting(false);
                  }
                }}
                className="px-2 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow ring-1 ring-rose-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title={`${currentGrade}. Sınıf Öğrenci Başarı ve İstatistik PDF Raporunu İndir`}
              >
                <FileText size={12} className="text-rose-200 shrink-0" />
                <span>{isPdfExporting ? 'Hazırlanıyor...' : 'PDF İndir'}</span>
              </button>
            )}

            {onOpenOdevAkvaryumu && (
              <button
                onClick={onOpenOdevAkvaryumu}
                className="px-2 py-1 rounded-md font-black text-[10px] sm:text-[11px] flex items-center gap-1 bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow ring-1 ring-cyan-300 transition-all cursor-pointer active:scale-95"
                title="Ödev Kontrol Akvaryumunu Aç (1-4. Sınıflar)"
              >
                <span className="text-xs">🐠</span>
                <span>Ödev Akvaryumu</span>
              </button>
            )}

            {onOpenRosterModal && (
              <button
                onClick={() => onOpenRosterModal(currentGrade)}
                className="px-2 py-1 rounded-md font-bold text-[10px] sm:text-[11px] flex items-center gap-1 bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-400/30 transition cursor-pointer"
                title="Öğrenci Ekle / Düzenle / Listeyi Yönet"
              >
                <UserPlus size={12} className="text-purple-300 shrink-0" />
                <span className="hidden sm:inline">Öğrenci Yönetimi</span>
              </button>
            )}

            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className={`px-2 py-1 rounded-md font-bold text-[10px] sm:text-[11px] flex items-center gap-1 border transition cursor-pointer ${
                  currentUser
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-500/40'
                }`}
                title="Google ile Bulut Senkronizasyonu & Yedekleme"
              >
                <Cloud size={12} className={currentUser ? "text-emerald-400" : "text-cyan-400"} />
                <span className="hidden sm:inline">
                  {currentUser ? 'Buluta Bağlı' : 'Buluta Yedekle'}
                </span>
                {currentUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Bağımsız sınıf kaydı</span>
          </div>
        </div>

        {/* 3. ROW: COMPACT SUMMARY CARDS (SHRUNK TO FREE UP MAXIMUM SPACE FOR TOPICS BELOW) */}
        <div className="px-3 sm:px-4 py-1 shrink-0">
          {viewMode === 'tek_kisilik' ? (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <div className="bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border border-emerald-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-emerald-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Tek Kişilik Doğru</span>
                </div>
                <div className="text-base sm:text-xl font-black text-emerald-300 leading-tight mt-0.5">{gradeSingleDogru}</div>
              </div>
              <div className="bg-gradient-to-b from-rose-950/90 to-slate-950/95 border border-rose-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-rose-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <XCircle size={12} className="text-rose-400" />
                  <span>Tek Kişilik Yanlış</span>
                </div>
                <div className="text-base sm:text-xl font-black text-rose-300 leading-tight mt-0.5">{gradeSingleYanlis}</div>
              </div>
              <div className="bg-gradient-to-b from-amber-950/90 to-slate-950/95 border border-amber-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <Trophy size={12} className="text-amber-400" />
                  <span>Başarı Oranı</span>
                </div>
                <div className="text-base sm:text-xl font-black text-amber-300 leading-tight mt-0.5">%{gradeSingleAccuracy}</div>
              </div>
              <div className="bg-gradient-to-b from-cyan-950/90 to-slate-950/95 border border-cyan-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-cyan-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Tamamlanan Oyun</span>
                </div>
                <div className="text-base sm:text-xl font-black text-cyan-300 leading-tight mt-0.5">{currentSingleStats?.wins || 0}</div>
              </div>
            </div>
          ) : viewMode === 'ogrenciler' ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-gradient-to-b from-amber-950/90 to-slate-950/95 border border-amber-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <Award size={12} className="text-amber-400" />
                  <span>Kayıtlı Öğrenci</span>
                </div>
                <div className="text-base sm:text-xl font-black text-amber-300 leading-tight mt-0.5">{gradeStudents.length}</div>
              </div>
              <div className="bg-gradient-to-b from-indigo-950/90 to-slate-950/95 border border-indigo-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-indigo-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <BarChart3 size={12} className="text-indigo-400" />
                  <span>Toplam Soru</span>
                </div>
                <div className="text-base sm:text-xl font-black text-indigo-300 leading-tight mt-0.5">{studentTotalQuestions}</div>
              </div>
              <div className="bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border border-emerald-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-emerald-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <Trophy size={12} className="text-emerald-400" />
                  <span>Sınıf Ortalaması</span>
                </div>
                <div className="text-base sm:text-xl font-black text-emerald-300 leading-tight mt-0.5">%{studentAvgAccuracy}</div>
              </div>
            </div>
          ) : viewMode === 'dogru_yanlis' ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border border-emerald-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-emerald-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Toplam Doğru</span>
                </div>
                <div className="text-base sm:text-xl font-black text-emerald-300 leading-tight mt-0.5">{gradeTotalDogru}</div>
              </div>
              <div className="bg-gradient-to-b from-rose-950/90 to-slate-950/95 border border-rose-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-rose-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <XCircle size={12} className="text-rose-400" />
                  <span>Toplam Yanlış</span>
                </div>
                <div className="text-base sm:text-xl font-black text-rose-300 leading-tight mt-0.5">{gradeTotalYanlis}</div>
              </div>
              <div className="bg-gradient-to-b from-amber-950/90 to-slate-950/95 border border-amber-400/60 rounded-xl p-1.5 sm:p-2 text-center shadow">
                <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-[9px] sm:text-[10px] uppercase">
                  <Trophy size={12} className="text-amber-400" />
                  <span>Başarı Yüzdesi</span>
                </div>
                <div className="text-base sm:text-xl font-black text-amber-300 leading-tight mt-0.5">%{gradeAccuracy}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {/* 1. GRUP */}
              <div className="bg-gradient-to-b from-blue-950/90 via-indigo-950/90 to-slate-950/95 border border-blue-400/60 rounded-xl p-1.5 sm:p-2 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <img src="/icon_1.webp" alt="1" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
                    <span className="font-black text-[10px] sm:text-xs text-blue-200 truncate">1. GRUP</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 shrink-0">
                    🏆 {groupsList[0].wins}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-blue-500/25">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-xl font-black text-amber-300 leading-none">{groupsList[0].dogru}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-blue-200/80 uppercase">DOĞRU</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-rose-300">
                    {groupsList[0].yanlis} <span className="text-rose-300/70 text-[8px]">Y</span>
                  </div>
                </div>
              </div>

              {/* 2. GRUP */}
              <div className="bg-gradient-to-b from-rose-950/90 via-red-950/90 to-slate-950/95 border border-rose-400/60 rounded-xl p-1.5 sm:p-2 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <img src="/icon_2.webp" alt="2" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
                    <span className="font-black text-[10px] sm:text-xs text-rose-200 truncate">2. GRUP</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 shrink-0">
                    🏆 {groupsList[1].wins}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-rose-500/25">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-xl font-black text-amber-300 leading-none">{groupsList[1].dogru}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-rose-200/80 uppercase">DOĞRU</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-rose-300">
                    {groupsList[1].yanlis} <span className="text-rose-300/70 text-[8px]">Y</span>
                  </div>
                </div>
              </div>

              {/* 3. GRUP */}
              <div className="bg-gradient-to-b from-emerald-950/90 via-teal-950/90 to-slate-950/95 border border-emerald-400/60 rounded-xl p-1.5 sm:p-2 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <img src="/icon_3.webp" alt="3" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
                    <span className="font-black text-[10px] sm:text-xs text-emerald-200 truncate">3. GRUP</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 shrink-0">
                    🏆 {groupsList[2].wins}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-emerald-500/25">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-xl font-black text-amber-300 leading-none">{groupsList[2].dogru}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-emerald-200/80 uppercase">DOĞRU</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-rose-300">
                    {groupsList[2].yanlis} <span className="text-rose-300/70 text-[8px]">Y</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. MAIN SCROLLABLE CONTENT: EXPANDED TOPIC LIST WITH MIN-H-0 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-2 space-y-2">
          
          {viewMode === 'ogrenciler' ? (
            <div className="space-y-2.5 pb-2">
              {/* TOP ACTIONS & SEARCH */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="Öğrenci ara..."
                      className="w-40 sm:w-60 py-1 pl-7 pr-2 rounded-xl bg-slate-950/80 border border-purple-400/30 text-white text-xs placeholder:text-purple-300/50 focus:outline-none focus:border-amber-400"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-purple-300/60 pointer-events-none" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-300/90">
                    {filteredGradeStudents.length} Öğrenci
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-purple-200/80">
                  <Sparkles size={12} className="text-amber-300 shrink-0" />
                  <span>Öğrenciye tıklayarak konu konu istatistiklerini açabilirsiniz</span>
                </div>
              </div>

              {/* STUDENTS LIST */}
              {filteredGradeStudents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#2a1380]/60 border border-purple-400/20 text-center flex flex-col items-center justify-center">
                  <span className="text-3xl mb-2">🎓</span>
                  <p className="text-sm font-bold text-white">
                    {studentSearch ? 'Aranan öğrenci bulunamadı.' : `${currentGrade}. Sınıfta kayıtlı öğrenci bulunmuyor.`}
                  </p>
                  {onOpenRosterModal && (
                    <button
                      onClick={() => onOpenRosterModal(currentGrade)}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow transition"
                    >
                      + Öğrenci Listesini Aç ve Ekle
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGradeStudents.map(student => {
                    const isExpanded = expandedStudentId === student.id;
                    const totalAnswers = (student.totalCorrect || 0) + (student.totalWrong || 0);
                    const studentSuccessRate = totalAnswers > 0 ? Math.round(((student.totalCorrect || 0) / totalAnswers) * 100) : 0;
                    const topicCount = Object.keys(student.topicStats || {}).length;

                    return (
                      <div
                        key={student.id}
                        className={`rounded-2xl bg-gradient-to-b from-[#2e1882] to-[#221069] border transition shadow-md overflow-hidden ${
                          isExpanded ? 'border-amber-400/70 ring-1 ring-amber-400/40' : 'border-purple-400/30 hover:border-purple-400/60'
                        } p-2.5 sm:p-3`}
                      >
                        {/* MAIN STUDENT ROW */}
                        <div
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          className="flex items-center justify-between gap-2.5 cursor-pointer group select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* AVATAR */}
                            <div
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${student.avatarBg || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xl sm:text-2xl shadow border border-white/20 shrink-0 group-hover:scale-105 transition-transform`}
                            >
                              {student.avatar}
                            </div>

                            {/* NAME & META */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-xs sm:text-sm text-white tracking-wide truncate group-hover:text-amber-300 transition-colors">
                                  {student.name}
                                </h4>
                                {student.className && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[9px] font-bold">
                                    {student.className}
                                  </span>
                                )}
                                <span className="text-[10px] text-amber-300 font-extrabold">
                                  {isExpanded ? '▲ Konu Detaylarını Gizle' : `▼ ${topicCount} Konu Analizini Gör`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-purple-200/70 mt-0.5">
                                <span>🎮 {student.gamesPlayed} Oyun</span>
                                {student.gamesWon > 0 && (
                                  <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                    <Trophy size={11} />
                                    <span>{student.gamesWon} Galibiyet</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* STATS CAPSULES */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {[1, 2, 3, 4].includes(student.grade) && (
                              <div
                                onClick={(e) => {
                                  if (onOpenOdevAkvaryumu) {
                                    e.stopPropagation();
                                    onOpenOdevAkvaryumu();
                                  }
                                }}
                                className={`px-2 py-1 rounded-xl border flex items-center gap-1 text-[10px] sm:text-xs font-black cursor-pointer transition hover:scale-105 ${
                                  homeworkMap[student.id]?.lastCompletedDate === todayStr
                                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
                                }`}
                                title="Ödev Akvaryumunu Aç"
                              >
                                <span>🐠</span>
                                <span>{homeworkMap[student.id]?.homeworkCount || 0} Ödev</span>
                                {homeworkMap[student.id]?.lastCompletedDate === todayStr ? (
                                  <span className="text-emerald-400 font-black">✔</span>
                                ) : (
                                  <span className="text-slate-400 text-[9px]">bekliyor</span>
                                )}
                              </div>
                            )}

                            <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 text-[11px] sm:text-xs font-black">
                              <CheckCircle2 size={13} />
                              <span>{student.totalCorrect}</span>
                            </div>

                            <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 flex items-center gap-1 text-[11px] sm:text-xs font-black">
                              <XCircle size={13} />
                              <span>{student.totalWrong}</span>
                            </div>

                            <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black min-w-[48px] text-center">
                              %{studentSuccessRate}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedStudentId(isExpanded ? null : student.id);
                              }}
                              className={`p-1.5 rounded-lg border text-purple-200 transition cursor-pointer ${
                                isExpanded ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow' : 'bg-purple-900/60 border-purple-400/30 hover:text-white'
                              }`}
                              title={isExpanded ? 'Konu detaylarını kapat' : 'Öğrencinin konu konu tüm istatistiklerini gör'}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* EXPANDED TOPIC STATS DETAIL */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2.5 border-t border-purple-400/20">
                            <StudentTopicStatsDetail
                              student={student}
                              onResetScore={handleResetSingleStudent}
                              onResetTopicScore={handleResetSingleStudentTopic}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  categoryFilter === cat.id
                    ? 'bg-[#7c5cf7] text-white shadow-md border-amber-300 scale-102'
                    : 'bg-[#2a1380]/80 text-purple-200/80 hover:bg-[#361a99] border-purple-400/20'
                }`}
              >
                {cat.icon.startsWith('/') ? (
                  <img src={cat.icon} alt="" className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <span>{cat.icon}</span>
                )}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* TOPIC LIST */}
          <div className="space-y-2.5 pb-2">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={15} />
                <span>
                  {viewMode === 'dogru_yanlis'
                    ? `${currentGrade}. SINIF KONU BAZLI DOĞRU & YANLIŞ ANALİZİ`
                    : `${currentGrade}. SINIF KONU BAZLI GRUP KARŞILAŞTIRMASI`}
                </span>
              </div>
              <span className="text-[10px] text-purple-200/70 font-semibold">
                {filteredTopicKeys.length} Konu
              </span>
            </div>

            {filteredTopicKeys.map((key, idx) => {
              const topic = gradeTopics[key];
              if (!topic) return null;

              // Topic 3D Icon with guaranteed support for Zıt Anlam, Eş Anlam, and valid icon index
              const topicIconPath = (topic as any).icon
                || topic3DIcons[key]
                || (key.includes('zit_anlam') ? '/MENUIKON/grid_icon_27.webp' : undefined)
                || (key.includes('es_anlam') ? '/MENUIKON/grid_icon_21.webp' : undefined)
                || (key.includes('ingilizce') ? '/MENUIKON/grid_icon_14.webp' : undefined)
                || (key.includes('xox') ? '/MENUIKON/grid_icon_32.webp' : undefined)
                || `/MENUIKON/grid_icon_${(((idx % 38) + 3)).toString().padStart(2, '0')}.webp`;

              // Individual topic stats
              const tStat = activeGradeStats[key] || { dogru: 0, yanlis: 0 };
              const tTotal = tStat.dogru + tStat.yanlis;
              const tRate = tTotal > 0 ? Math.round((tStat.dogru / tTotal) * 100) : 0;

              // Single player topic stats
              const sStat = singleTopicStats[key] || { dogru: 0, yanlis: 0 };
              const sTotal = sStat.dogru + sStat.yanlis;
              const sRate = sTotal > 0 ? Math.round((sStat.dogru / sTotal) * 100) : 0;

              // Group topic stats
              const g1Dogru = groupsList[0].topicStats[key]?.dogru || 0;
              const g2Dogru = groupsList[1].topicStats[key]?.dogru || 0;
              const g3Dogru = groupsList[2].topicStats[key]?.dogru || 0;
              const maxDogruInTopic = Math.max(g1Dogru, g2Dogru, g3Dogru, 1);

              let leaderName = '';
              if (maxDogruInTopic > 0) {
                if (g1Dogru === maxDogruInTopic && g1Dogru > g2Dogru && g1Dogru > g3Dogru) leaderName = '1. GRUP LİDER';
                else if (g2Dogru === maxDogruInTopic && g2Dogru > g1Dogru && g2Dogru > g3Dogru) leaderName = '2. GRUP LİDER';
                else if (g3Dogru === maxDogruInTopic && g3Dogru > g1Dogru && g3Dogru > g2Dogru) leaderName = '3. GRUP LİDER';
              }

              const isTurkce = key.startsWith('turkce_') || ['sozluk_sirala', 'kelime_sirala', 'zit_anlam', 'es_anlam', 'kuralli_cumle', 'hece_sayisi'].includes(key);
              const prevKey = idx > 0 ? filteredTopicKeys[idx - 1] : null;
              const prevIsTurkce = prevKey ? (prevKey.startsWith('turkce_') || ['sozluk_sirala', 'kelime_sirala', 'zit_anlam', 'es_anlam', 'kuralli_cumle', 'hece_sayisi'].includes(prevKey)) : false;
              const showTurkceHeader = currentGrade === 2 && isTurkce && (!prevIsTurkce || idx === 0);
              const showMatematikHeader = currentGrade === 2 && !isTurkce && idx === 0 && categoryFilter === 'hepsi';

              return (
                <React.Fragment key={key}>
                  {showMatematikHeader && (
                    <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/40 flex items-center justify-between my-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📐</span>
                        <span className="text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider">
                          2. Sınıf Matematik Dersi Etkinlikleri
                        </span>
                      </div>
                      <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                        Matematik
                      </span>
                    </div>
                  )}
                  {showTurkceHeader && (
                    <div className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-900/40 via-red-800/30 to-rose-950/40 border-2 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center justify-between my-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📖</span>
                        <div>
                          <h4 className="text-rose-200 text-xs sm:text-sm font-black uppercase tracking-wider">
                            2. Sınıf Türkçe Dersi Etkinlikleri (Yeni Ders)
                          </h4>
                          <p className="text-[10px] text-rose-300/80 font-medium">
                            Sözlük Sıralama, Kelime Sıralama, Zıt Anlam, Eş Anlam, Kurallı Cümle & Hece Sayısı
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/50 px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                        6 Türkçe Etkinliği
                      </span>
                    </div>
                  )}
                  <div
                    onClick={() => {
                      onSelectTopic(key, currentGrade);
                      onClose();
                    }}
                    className={`bg-gradient-to-b ${isTurkce ? 'from-[#38102a] to-[#250a1b] hover:from-[#471536] hover:to-[#310d24] border-rose-400/40' : 'from-[#2e1882] to-[#221069] hover:from-[#371e98] hover:to-[#29147d] border-purple-400/30'} border-2 rounded-2xl p-2.5 sm:p-3 transition-all shadow-md relative overflow-hidden group cursor-pointer`}
                  >
                  {/* TOPIC HEADER ROW */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-2 pb-2 border-b border-purple-400/20">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 flex items-center justify-center shadow-md border border-amber-300 overflow-hidden">
                      <img
                        src={topicIconPath}
                        alt={topic.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/MENUIKON/grid_icon_27.webp';
                        }}
                        className="w-full h-full object-contain filter drop-shadow-sm scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm md:text-base font-black text-white truncate drop-shadow-sm flex items-center gap-1.5">
                        <span>{topic.title}</span>
                      </h4>
                      <p className="text-[10px] sm:text-xs text-purple-200/80 truncate">
                        {topic.desc || `${currentGrade}. Sınıf Matematik Alıştırması`}
                      </p>
                    </div>

                    {viewMode === 'gruplar' && leaderName && (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/50 rounded-full font-black text-[9px] sm:text-[10px] uppercase shrink-0 flex items-center gap-1">
                        <Crown size={11} className="text-amber-300" />
                        <span>{leaderName}</span>
                      </span>
                    )}

                    {viewMode === 'tek_kisilik' && (
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] sm:text-xs border ${
                          sTotal > 0 && sRate >= 70
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : sTotal > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                        }`}>
                          {sTotal > 0 ? `%${sRate} Başarı` : 'Henüz Çözülmedi'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTopic(key, currentGrade);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow cursor-pointer transition active:scale-95"
                          title="Tek kişilik modda başlat"
                        >
                          <Play size={10} fill="currentColor" />
                          <span>Oyna</span>
                        </button>
                      </div>
                    )}

                    {viewMode === 'dogru_yanlis' && (
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] sm:text-xs border ${
                          tTotal > 0 && tRate >= 70
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : tTotal > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                        }`}>
                          {tTotal > 0 ? `%${tRate} Başarı` : 'Henüz Çözülmedi'}
                        </span>
                      </div>
                    )}

                    {/* RESET SINGLE TOPIC ACTION */}
                    <div className="shrink-0 flex items-center ml-auto pl-1">
                      {confirmTopicResetKey === key ? (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1.5 bg-red-950/95 border-2 border-red-500 px-2 py-1 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <span className="text-[10px] text-red-200 font-bold whitespace-nowrap">
                            Bu konu sıfırlansın mı?
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetTopic(key);
                            }}
                            className="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-black text-[10px] shadow cursor-pointer transition active:scale-95"
                          >
                            Evet
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmTopicResetKey(null);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] border border-slate-600 cursor-pointer transition active:scale-95"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmTopicResetKey(key);
                          }}
                          className="p-1 sm:px-2 sm:py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 hover:border-rose-400/60 text-rose-300 hover:text-rose-100 text-[10px] font-black flex items-center gap-1 shadow-sm cursor-pointer transition active:scale-95 shrink-0"
                          title="Bu konunun tüm grup ve tek kişilik istatistiklerini sıfırla"
                        >
                          <RotateCcw size={11} className="text-rose-400 shrink-0" />
                          <span className="hidden md:inline">Konuyu Sıfırla</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STAT BODY ACCORDING TO VIEW MODE */}
                  {viewMode === 'tek_kisilik' ? (
                    /* TEK KİŞİLİK METRİKLER & PROGRESS BAR */
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-black">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <Check size={12} className="text-emerald-400 stroke-[3]" />
                            <b>{sStat.dogru}</b> Tek Kişilik Doğru
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                            <X size={12} className="text-rose-400 stroke-[3]" />
                            <b>{sStat.yanlis}</b> Tek Kişilik Yanlış
                          </span>
                        </div>
                        <span className="text-purple-200/80 text-[10px] sm:text-xs font-semibold">
                          Toplam: <b className="text-white">{sTotal}</b> soru
                        </span>
                      </div>

                      {/* Accuracy bar */}
                      <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-purple-500/30 flex">
                        {sTotal > 0 ? (
                          <>
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${(sStat.dogru / sTotal) * 100}%` }}
                            />
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                              style={{ width: `${(sStat.yanlis / sTotal) * 100}%` }}
                            />
                          </>
                        ) : (
                          <div className="h-full w-full bg-purple-900/30" />
                        )}
                      </div>
                    </div>
                  ) : viewMode === 'dogru_yanlis' ? (
                    /* DOĞRU / YANLIŞ METRICS & PROGRESS BAR (2. SINIF & GRADE SPECIFIC) */
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-black">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <Check size={12} className="text-emerald-400 stroke-[3]" />
                            <b>{tStat.dogru}</b> Doğru
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                            <X size={12} className="text-rose-400 stroke-[3]" />
                            <b>{tStat.yanlis}</b> Yanlış
                          </span>
                        </div>
                        <span className="text-purple-200/80 text-[10px] sm:text-xs font-semibold">
                          Toplam: <b className="text-white">{tTotal}</b> soru
                        </span>
                      </div>

                      {/* Accuracy bar */}
                      <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-purple-500/30 flex">
                        {tTotal > 0 ? (
                          <>
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${(tStat.dogru / tTotal) * 100}%` }}
                            />
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                              style={{ width: `${(tStat.yanlis / tTotal) * 100}%` }}
                            />
                          </>
                        ) : (
                          <div className="h-full w-full bg-purple-900/30" />
                        )}
                      </div>
                    </div>
                  ) : (
                    /* 3 GROUP COMPARISON BARS (GRUPLAR YARIŞIYOR) */
                    <div className="space-y-1.5">
                      {/* 1. GRUP ROW */}
                      <div className="flex items-center gap-2">
                        <span className="w-22 text-[10px] sm:text-xs font-black text-blue-300 truncate shrink-0 flex items-center gap-1">
                          <img src="/icon_1.webp" alt="1" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                          <span>1. GRUP</span>
                        </span>
                        <div className="flex-1 bg-black/40 rounded-full h-3 overflow-hidden border border-blue-500/30 relative">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((g1Dogru / maxDogruInTopic) * 100))}%` }}
                          />
                        </div>
                        <span className="w-20 text-[10px] sm:text-xs font-black text-right shrink-0">
                          <b className="text-amber-300">{g1Dogru}</b> <span className="text-blue-200/70">doğru</span>
                        </span>
                      </div>

                      {/* 2. GRUP ROW */}
                      <div className="flex items-center gap-2">
                        <span className="w-22 text-[10px] sm:text-xs font-black text-rose-300 truncate shrink-0 flex items-center gap-1">
                          <img src="/icon_2.webp" alt="2" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                          <span>2. GRUP</span>
                        </span>
                        <div className="flex-1 bg-black/40 rounded-full h-3 overflow-hidden border border-rose-500/30 relative">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((g2Dogru / maxDogruInTopic) * 100))}%` }}
                          />
                        </div>
                        <span className="w-20 text-[10px] sm:text-xs font-black text-right shrink-0">
                          <b className="text-amber-300">{g2Dogru}</b> <span className="text-rose-200/70">doğru</span>
                        </span>
                      </div>

                      {/* 3. GRUP ROW */}
                      <div className="flex items-center gap-2">
                        <span className="w-22 text-[10px] sm:text-xs font-black text-emerald-300 truncate shrink-0 flex items-center gap-1">
                          <img src="/icon_3.webp" alt="3" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
                          <span>3. GRUP</span>
                        </span>
                        <div className="flex-1 bg-black/40 rounded-full h-3 overflow-hidden border border-emerald-500/30 relative">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((g3Dogru / maxDogruInTopic) * 100))}%` }}
                          />
                        </div>
                        <span className="w-20 text-[10px] sm:text-xs font-black text-right shrink-0">
                          <b className="text-amber-300">{g3Dogru}</b> <span className="text-emerald-200/70">doğru</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          </div>
            </>
          )}

        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-2 sm:p-2.5 pt-1.5 bg-[#180b47] flex flex-col items-center shrink-0 border-t border-purple-500/30">
          <button
            onClick={() => {
              const firstTopic = filteredTopicKeys[0] || topicKeys[0] || 'nesne_sayisi';
              onSelectTopic(firstTopic, currentGrade);
              onClose();
            }}
            className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-emerald-300/40 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Play size={16} fill="currentColor" />
            <span>{currentGrade}. Sınıf Alıştırmalarına Başla</span>
          </button>

          {/* RESET STATS CONTROLS */}
          <div className="mt-1.5 flex items-center justify-between w-full px-1 text-xs">
            {confirmReset ? (
              <div className="flex items-center gap-2 bg-red-950/95 p-1 px-2 rounded-lg border border-red-700 w-full justify-between flex-wrap">
                <span className="font-bold text-red-200 text-[10px] sm:text-[11px]">
                  {resetScope === 'grade' ? `${currentGrade}. Sınıf istatistikleri sıfırlansın mı?` : 'TÜM sınıfların istatistikleri sıfırlansın mı?'}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (resetScope === 'grade') {
                        if (onResetGradeStats) {
                          onResetGradeStats(currentGrade);
                        } else if (onResetStats) {
                          onResetStats();
                        }
                        if (currentSingleStats) {
                          const updatedTopicStats = { ...(currentSingleStats.topicStats || {}) };
                          topicKeys.forEach(k => {
                            delete updatedTopicStats[k];
                          });
                          let remainingDogru = 0;
                          let remainingYanlis = 0;
                          Object.values(updatedTopicStats).forEach(st => {
                            remainingDogru += st.dogru || 0;
                            remainingYanlis += st.yanlis || 0;
                          });
                          setLocalSingleStats({
                            ...currentSingleStats,
                            dogru: remainingDogru,
                            yanlis: remainingYanlis,
                            wins: currentGrade === 2 ? 0 : (currentSingleStats.wins || 0),
                            topicStats: updatedTopicStats
                          });
                        }
                        const updatedStats = { ...localStatsData };
                        topicKeys.forEach(k => {
                          delete updatedStats[k];
                        });
                        setLocalStatsData(updatedStats);

                        setLocalGroupStats(prev => {
                          const updated: GroupStatsRecord = { ...prev };
                          (['grup1', 'grup2', 'grup3'] as const).forEach(gKey => {
                            if (updated[gKey]) {
                              const updatedTopicStats = { ...(updated[gKey].topicStats || {}) };
                              topicKeys.forEach(tk => {
                                delete updatedTopicStats[tk];
                              });
                              let remainingDogru = 0;
                              let remainingYanlis = 0;
                              Object.values(updatedTopicStats).forEach(st => {
                                remainingDogru += st.dogru || 0;
                                remainingYanlis += st.yanlis || 0;
                              });
                              updated[gKey] = {
                                ...updated[gKey],
                                dogru: remainingDogru,
                                yanlis: remainingYanlis,
                                topicStats: updatedTopicStats
                              };
                            }
                          });
                          return updated;
                        });

                        setLocalStudents(prev => prev.map(s => s.grade === currentGrade ? {
                          ...s,
                          totalCorrect: 0,
                          totalWrong: 0,
                          gamesPlayed: 0,
                          gamesWon: 0,
                          topicStats: {}
                        } : s));
                      } else {
                        if (onResetStats) {
                          onResetStats();
                        }
                        setLocalSingleStats({ dogru: 0, yanlis: 0, wins: 0, topicStats: {} });
                        setLocalStatsData({});
                        setLocalGroupStats(defaultGroups);
                        setLocalStudents(prev => prev.map(s => ({
                          ...s,
                          totalCorrect: 0,
                          totalWrong: 0,
                          gamesPlayed: 0,
                          gamesWon: 0,
                          topicStats: {}
                        })));
                      }
                      setConfirmReset(false);
                    }}
                    className="px-2 py-0.5 bg-red-600 text-white rounded-md font-black text-[10px] sm:text-[11px] hover:bg-red-500 cursor-pointer shadow-sm"
                  >
                    Evet, Sıfırla
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-0.5 bg-purple-900 text-purple-200 rounded-md font-bold text-[10px] sm:text-[11px] hover:bg-purple-800 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setResetScope('grade');
                    setConfirmReset(true);
                  }}
                  className="text-purple-300/70 hover:text-red-300 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title={`${currentGrade}. Sınıf İstatistiklerini Sıfırla`}
                >
                  <Trash2 size={12} />
                  <span>{currentGrade}. Sınıfı Sıfırla</span>
                </button>
                <button
                  onClick={() => {
                    setResetScope('all');
                    setConfirmReset(true);
                  }}
                  className="text-purple-300/50 hover:text-red-400 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tüm Sınıfların İstatistiklerini Sıfırla"
                >
                  <span>Tümünü Sıfırla</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-purple-200/80 hover:text-white font-bold text-[10px] sm:text-[11px] cursor-pointer ml-auto"
            >
              Kapat ✕
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
