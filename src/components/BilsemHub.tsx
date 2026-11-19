import React, { useEffect, useState } from 'react';
import { CheckCircle2, Brain, ArrowRight, Home } from 'lucide-react';
import {
  BilsemActivityId,
  BilsemGrade,
  getActivitiesForGrade,
  getPoolSize,
  getTaskCountForGrade,
  normalizeBilsemGrade,
} from '../data/bilsemActivitiesData';
import { ActivityBackground } from './ActivityBackground';
import { BilsemActivityMiniPreview } from './BilsemVisualEngine';

interface BilsemHubProps {
  onClose: () => void;
  onGoHome?: () => void;
  onSelectActivity: (activityId: BilsemActivityId, grade: BilsemGrade) => void;
  selectedGrade?: number | null;
  onSelectGrade?: (grade: BilsemGrade) => void;
  completedIds?: string[];
  playMp3?: (src: string, onEnded?: () => void) => void;
}

const GRADE_TABS: { grade: BilsemGrade; label: string; focus: string }[] = [
  { grade: 1, label: '1. Sınıf', focus: 'Görsel Algı · Dikkat · Gölge' },
  { grade: 2, label: '2. Sınıf', focus: 'Matris · Simetri · Hafıza' },
  { grade: 3, label: '3. Sınıf', focus: '3B Küp · Örüntü · Mantık' },
];

const ACCENT_CLASSES: Record<string, { border: string; iconBg: string; action: string; numberText: string }> = {
  amber: {
    border: 'border-amber-300 hover:border-amber-500',
    iconBg: 'bg-amber-50 border-amber-200',
    action: 'bg-amber-400 text-slate-950',
    numberText: 'text-amber-700',
  },
  sky: {
    border: 'border-sky-300 hover:border-sky-500',
    iconBg: 'bg-sky-50 border-sky-200',
    action: 'bg-sky-500 text-white',
    numberText: 'text-sky-700',
  },
  violet: {
    border: 'border-violet-300 hover:border-violet-500',
    iconBg: 'bg-violet-50 border-violet-200',
    action: 'bg-violet-500 text-white',
    numberText: 'text-violet-700',
  },
  emerald: {
    border: 'border-emerald-300 hover:border-emerald-500',
    iconBg: 'bg-emerald-50 border-emerald-200',
    action: 'bg-emerald-500 text-white',
    numberText: 'text-emerald-700',
  },
  cyan: {
    border: 'border-cyan-300 hover:border-cyan-500',
    iconBg: 'bg-cyan-50 border-cyan-200',
    action: 'bg-cyan-500 text-white',
    numberText: 'text-cyan-700',
  },
  rose: {
    border: 'border-rose-300 hover:border-rose-500',
    iconBg: 'bg-rose-50 border-rose-200',
    action: 'bg-rose-500 text-white',
    numberText: 'text-rose-700',
  },
  orange: {
    border: 'border-orange-300 hover:border-orange-500',
    iconBg: 'bg-orange-50 border-orange-200',
    action: 'bg-orange-500 text-white',
    numberText: 'text-orange-700',
  },
  indigo: {
    border: 'border-indigo-300 hover:border-indigo-500',
    iconBg: 'bg-indigo-50 border-indigo-200',
    action: 'bg-indigo-500 text-white',
    numberText: 'text-indigo-700',
  },
  teal: {
    border: 'border-teal-300 hover:border-teal-500',
    iconBg: 'bg-teal-50 border-teal-200',
    action: 'bg-teal-500 text-white',
    numberText: 'text-teal-700',
  },
  lime: {
    border: 'border-lime-300 hover:border-lime-500',
    iconBg: 'bg-lime-50 border-lime-200',
    action: 'bg-lime-500 text-slate-950',
    numberText: 'text-lime-700',
  },
};

export const BilsemHub: React.FC<BilsemHubProps> = ({
  onClose,
  onGoHome,
  onSelectActivity,
  selectedGrade,
  onSelectGrade,
  completedIds = [],
  playMp3,
}) => {
  const [activeGrade, setActiveGrade] = useState<BilsemGrade>(() => normalizeBilsemGrade(selectedGrade));

  useEffect(() => {
    if (selectedGrade === 1 || selectedGrade === 2 || selectedGrade === 3 || selectedGrade === 4) {
      setActiveGrade(normalizeBilsemGrade(selectedGrade));
    }
  }, [selectedGrade]);

  const handleGradeChange = (grade: BilsemGrade) => {
    playMp3?.('/op.mp3');
    setActiveGrade(grade);
    onSelectGrade?.(grade);
  };

  const gradeActivities = getActivitiesForGrade(activeGrade);
  const completedInGrade = gradeActivities.filter(
    (item) => completedIds.includes(`${activeGrade}:${item.id}`) || completedIds.includes(item.id)
  ).length;
  const activeGradeMeta = GRADE_TABS.find((t) => t.grade === activeGrade) || GRADE_TABS[1];

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-200 text-slate-900"
      style={{ top: 'var(--app-header-height, 64px)' }}
    >
      <ActivityBackground theme="doga" dimCenter={false} />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 sm:py-4 overflow-y-auto no-scrollbar flex flex-col gap-3">
        {/* ÜST BİLSEM BAŞLIK ÇUBUĞU */}
        <div className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300 px-3.5 sm:px-4 py-3 shadow-lg flex flex-col gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black tracking-wide uppercase text-slate-900 leading-tight">
                  7. BİLSEM Zeka &amp; Dikkat Merkezi
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 tabular-nums">
                  {activeGrade}. Sınıf Düzeyi · {gradeActivities.length} Etkinlik · Tamamlanan{' '}
                  <span className="font-black text-amber-700">
                    {completedInGrade}/{gradeActivities.length}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                if (onGoHome) {
                  onGoHome();
                } else {
                  onClose();
                }
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Home className="w-4 h-4 text-amber-600" />
              <span>Ana Menü</span>
            </button>
          </div>

          {/* SINIF SEÇİM SEKMELERİ (1. SINIF - 3. SINIF) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <div
              className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto"
              role="tablist"
              aria-label="BİLSEM Sınıf Seçimi"
            >
              {GRADE_TABS.map((tab) => {
                const isActive = tab.grade === activeGrade;
                return (
                  <button
                    key={tab.grade}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleGradeChange(tab.grade)}
                    className={`min-h-[44px] px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {activeGradeMeta.focus}
            </span>
          </div>
        </div>

        {/* SINIFA ÖZEL BİLSEM ETKİNLİK KARTLARI (İKON + ETKİNLİK GÖRSELİ + BAŞLIK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
          {gradeActivities.map((item, idx) => {
            const theme = ACCENT_CLASSES[item.accentColor] || ACCENT_CLASSES.sky;
            const isCompleted =
              completedIds.includes(`${activeGrade}:${item.id}`) || completedIds.includes(item.id);
            const paddedOrder = String(idx + 1).padStart(2, '0');
            const taskCount = getTaskCountForGrade(item.id, activeGrade);

            return (
              <button
                key={`${activeGrade}-${item.id}`}
                type="button"
                onClick={() => {
                  playMp3?.('/coin.mp3');
                  onSelectActivity(item.id, activeGrade);
                }}
                className={`group relative w-full text-left rounded-2xl bg-white/95 hover:bg-slate-50 backdrop-blur-md border ${theme.border} p-3 sm:p-3.5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 sm:gap-3 cursor-pointer min-h-[88px]`}
              >
                {/* İkon */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border ${theme.iconBg} flex items-center justify-center shrink-0 p-1.5`}
                >
                  <img
                    src={item.iconKey}
                    alt={item.title}
                    className="w-full h-full object-contain drop-shadow group-hover:scale-110 transition-transform pointer-events-none"
                  />
                </div>

                {/* İkonun Yanında Etkinliği Anlatan Görsel Şema */}
                <div className="w-[88px] h-12 sm:w-[108px] sm:h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <BilsemActivityMiniPreview activityId={item.id} />
                </div>

                {/* Başlık & Kısa Görev Sayısı */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <span className={`text-xs sm:text-sm font-black tabular-nums shrink-0 mt-0.5 ${theme.numberText}`}>
                      {paddedOrder}.
                    </span>
                    <h2 className="font-black text-xs sm:text-sm md:text-[15px] text-slate-900 group-hover:text-sky-700 transition-colors leading-snug break-words">
                      {item.title}
                    </h2>
                    {isCompleted && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                        aria-label="Tamamlandı"
                      />
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 tabular-nums">
                    {activeGrade}. Sınıf · {taskCount} Soru · {getPoolSize(item.id)} Soru Havuzu
                  </div>
                </div>

                {/* Başla Butonu */}
                <div className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] rounded-xl bg-slate-100 border border-slate-300 group-hover:border-slate-400 transition-colors">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 hidden sm:inline">
                    Başla
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg ${theme.action} flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
