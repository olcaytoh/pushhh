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
  GraduationCap
} from 'lucide-react';
import { StatRecord, GroupStatsRecord, SinglePlayerStatsRecord } from '../types';
import { Student } from '../types/student';
import { exportStudentsToPDF } from '../utils/studentPdfExport';
import { StudentTopicStatsDetail } from './StudentTopicStatsDetail';
import { resetSingleStudentStat } from '../utils/studentStore';

export const Cute3DRobotMascotSVG: React.FC<{ sizePx?: number; className?: string }> = ({ sizePx = 90, className = '' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: sizePx, height: sizePx }}>
    <img
      src="/robot.png"
      alt="Robot Maskot"
      className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform"
    />
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
  confirmReset?: boolean;
  setConfirmReset?: (val: boolean) => void;
  onClose: () => void;
}

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
  confirmReset: propConfirmReset,
  setConfirmReset: propSetConfirmReset,
  onClose
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

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');

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
  const gradeTopics: Record<string, { title: string; desc?: string; icon?: string }> = 
    (topicsByGrade && topicsByGrade[currentGrade as 1 | 2 | 3 | 4]) || topics;

  const topicKeys = Object.keys(gradeTopics);

  // Grade-specific group stats
  const activeGradeGroups = (gradeGroupStatsData && gradeGroupStatsData[currentGrade]) || groupStatsData || defaultGroups;
  const groupsList = [
    activeGradeGroups.grup1 || defaultGroups.grup1,
    activeGradeGroups.grup2 || defaultGroups.grup2,
    activeGradeGroups.grup3 || defaultGroups.grup3,
  ].map(g => {
    let gradeDogru = 0;
    let gradeYanlis = 0;
    let hasGradeTopicStats = false;
    topicKeys.forEach(k => {
      if (g.topicStats && g.topicStats[k]) {
        gradeDogru += g.topicStats[k].dogru || 0;
        gradeYanlis += g.topicStats[k].yanlis || 0;
        hasGradeTopicStats = true;
      }
    });
    return {
      ...g,
      dogru: hasGradeTopicStats ? gradeDogru : g.dogru,
      yanlis: hasGradeTopicStats ? gradeYanlis : g.yanlis,
    };
  });

  // Grade-specific individual / topic stats (Doğru / Yanlış)
  const activeGradeStats = (gradeStatsData && gradeStatsData[currentGrade]) || (currentGrade === 2 ? statsData : {});

  // Category classification per grade
  const getTopicCategory = (key: string, grade: number): string => {
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
      if (key.includes('cisim') || key.includes('geometri') || key.includes('simetri') || (key.includes('oruntu') && !key.includes('sayi'))) return 'geometri';
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
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.png' },
        { id: 'geometri', label: 'Geometri & Uzamsal', icon: '/MENUIKON/grid_icon_10.png' },
        { id: 'sayilar', label: 'Sayılar', icon: '/MENUIKON/grid_icon_05.png' },
        { id: 'ritmik', label: 'Ritmik Sayma', icon: '/MENUIKON/grid_icon_07.png' },
        { id: 'toplama', label: 'Toplama', icon: '/MENUIKON/grid_icon_04.png' },
        { id: 'cikarma', label: 'Çıkarma', icon: '/MENUIKON/grid_icon_11.png' },
        { id: 'olcme', label: 'Ölçme & Veri', icon: '/MENUIKON/grid_icon_21.png' }
      ];
    }
    if (grade === 2) {
      return [
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.png' },
        { id: 'sayilar', label: 'Sayılar & Ritmik', icon: '/MENUIKON/grid_icon_05.png' },
        { id: 'toplama', label: 'Toplama İşlemi', icon: '/MENUIKON/grid_icon_04.png' },
        { id: 'cikarma', label: 'Çıkarma İşlemi', icon: '/MENUIKON/grid_icon_11.png' },
        { id: 'carpma_bolme', label: 'Çarpma & Bölme', icon: '/MENUIKON/grid_icon_15.png' },
        { id: 'geometri', label: 'Geometri & Şekiller', icon: '/MENUIKON/grid_icon_10.png' },
        { id: 'zaman_olcme', label: 'Zaman & Ölçme', icon: '/MENUIKON/grid_icon_35.png' },
        { id: 'problemler', label: 'Problemler', icon: '/MENUIKON/grid_icon_31.png' }
      ];
    }
    if (grade === 3) {
      return [
        { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.png' },
        { id: 'g3_tema1', label: 'Tema 1: Sayılar & Ritmik', icon: '/MENUIKON/grid_icon_21.png' },
        { id: 'g3_tema2', label: 'Tema 2: Kesirler & Ölçme', icon: '/MENUIKON/grid_icon_11.png' },
        { id: 'g3_tema3', label: 'Tema 3: İşlemler & Problemler', icon: '/MENUIKON/grid_icon_15.png' },
        { id: 'g3_tema4', label: 'Tema 4: Geometri & Veri', icon: '/MENUIKON/grid_icon_26.png' }
      ];
    }
    return [
      { id: 'hepsi', label: 'Tüm Konular', icon: '/MENUIKON/grid_icon_32.png' },
      { id: 'g4_tema1', label: 'Tema 1: Sayılar ve Nicelikler (1)', icon: '/MENUIKON/grid_icon_21.png' },
      { id: 'g4_tema2', label: 'Tema 2: Sayılar ve Nicelikler (2)', icon: '/MENUIKON/grid_icon_11.png' },
      { id: 'g4_tema3', label: 'Tema 3: İşlemler ve Cebirsel', icon: '/MENUIKON/grid_icon_15.png' },
      { id: 'g4_tema4', label: 'Tema 4: Geometri ve Ölçme', icon: '/MENUIKON/grid_icon_26.png' }
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
  const singleTopicStats = singleStatsData?.topicStats || {};
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
    { grade: 1, label: '1. SINIF', icon: '/icon_1.png', theme: 'from-amber-500 to-orange-600', ring: 'ring-amber-400' },
    { grade: 2, label: '2. SINIF', icon: '/icon_2.png', theme: 'from-blue-600 to-indigo-700', ring: 'ring-blue-400' },
    { grade: 3, label: '3. SINIF', icon: '/icon_3.png', theme: 'from-emerald-500 to-teal-700', ring: 'ring-emerald-400' },
    { grade: 4, label: '4. SINIF', icon: '/icon_4.png', theme: 'from-purple-600 to-fuchsia-700', ring: 'ring-purple-400' }
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
                <img src={`/icon_${currentGrade}.png`} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0" />
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
                <div className="text-base sm:text-xl font-black text-cyan-300 leading-tight mt-0.5">{singleStatsData?.wins || 0}</div>
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
                    <img src="/icon_1.png" alt="1" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
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
                    <img src="/icon_2.png" alt="2" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
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
                    <img src="/icon_3.png" alt="3" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 drop-shadow" />
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
                || (key.includes('zit_anlam') ? '/MENUIKON/grid_icon_27.png' : undefined)
                || (key.includes('es_anlam') ? '/MENUIKON/grid_icon_21.png' : undefined)
                || (key.includes('ingilizce') ? '/MENUIKON/grid_icon_14.png' : undefined)
                || (key.includes('xox') ? '/MENUIKON/grid_icon_32.png' : undefined)
                || `/MENUIKON/grid_icon_${(((idx % 38) + 3)).toString().padStart(2, '0')}.png`;

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

              return (
                <div
                  key={key}
                  onClick={() => {
                    onSelectTopic(key, currentGrade);
                    onClose();
                  }}
                  className="bg-gradient-to-b from-[#2e1882] to-[#221069] hover:from-[#371e98] hover:to-[#29147d] border-2 border-purple-400/30 rounded-2xl p-2.5 sm:p-3 transition-all shadow-md relative overflow-hidden group cursor-pointer"
                >
                  {/* TOPIC HEADER ROW */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-2 pb-2 border-b border-purple-400/20">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 flex items-center justify-center shadow-md border border-amber-300 overflow-hidden">
                      <img
                        src={topicIconPath}
                        alt={topic.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/MENUIKON/grid_icon_27.png';
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
                          <img src="/icon_1.png" alt="1" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
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
                          <img src="/icon_2.png" alt="2" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
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
                          <img src="/icon_3.png" alt="3" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
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
                      if (resetScope === 'grade' && onResetGradeStats) {
                        onResetGradeStats(currentGrade);
                      } else if (onResetStats) {
                        onResetStats();
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
