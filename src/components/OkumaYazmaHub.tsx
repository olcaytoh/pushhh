import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Home, Volume2, ArrowRight, Sparkles } from 'lucide-react';
import {
  LETTER_GROUPS,
  LetterGroupId,
  OKUMA_YAZMA_ACTIVITIES,
  OkumaYazmaActivityId,
  getLetterGroupById,
  speakTurkish,
} from '../data/okumaYazmaData';
import { TurkishActivityBackground } from './TurkishActivityBackground';
import { TeacherVoiceToggle } from './TeacherVoiceToggle';

interface OkumaYazmaHubProps {
  onClose: () => void;
  onGoHome?: () => void;
  selectedGroupId: LetterGroupId;
  onSelectGroup: (groupId: LetterGroupId) => void;
  focusLetter: string | null;
  onSelectFocusLetter: (letter: string | null) => void;
  onSelectActivity: (
    activityId: OkumaYazmaActivityId,
    groupId: LetterGroupId,
    focusLetter: string | null
  ) => void;
  completedIds?: string[];
  playMp3?: (src: string, onEnded?: () => void) => void;
}

const GROUP_TAB_STYLES: Record<
  string,
  { active: string; letters: string }
> = {
  sky: {
    active: 'bg-sky-600 text-white border-sky-700 shadow-md',
    letters: 'text-sky-700',
  },
  emerald: {
    active: 'bg-emerald-600 text-white border-emerald-700 shadow-md',
    letters: 'text-emerald-700',
  },
  amber: {
    active: 'bg-amber-600 text-white border-amber-700 shadow-md',
    letters: 'text-amber-700',
  },
  rose: {
    active: 'bg-rose-600 text-white border-rose-700 shadow-md',
    letters: 'text-rose-700',
  },
  violet: {
    active: 'bg-violet-600 text-white border-violet-700 shadow-md',
    letters: 'text-violet-700',
  },
};

const CARD_ACCENTS: Record<
  string,
  { border: string; iconBg: string; cta: string; labelText: string }
> = {
  sky: {
    border: 'border-sky-300 hover:border-sky-500',
    iconBg: 'bg-sky-50 border-sky-200',
    cta: 'bg-sky-600 text-white group-hover:bg-sky-700',
    labelText: 'text-sky-700',
  },
  cyan: {
    border: 'border-cyan-300 hover:border-cyan-500',
    iconBg: 'bg-cyan-50 border-cyan-200',
    cta: 'bg-cyan-600 text-white group-hover:bg-cyan-700',
    labelText: 'text-cyan-700',
  },
  rose: {
    border: 'border-rose-300 hover:border-rose-500',
    iconBg: 'bg-rose-50 border-rose-200',
    cta: 'bg-rose-600 text-white group-hover:bg-rose-700',
    labelText: 'text-rose-700',
  },
  amber: {
    border: 'border-amber-300 hover:border-amber-500',
    iconBg: 'bg-amber-50 border-amber-200',
    cta: 'bg-amber-500 text-slate-950 group-hover:bg-amber-600',
    labelText: 'text-amber-700',
  },
  violet: {
    border: 'border-violet-300 hover:border-violet-500',
    iconBg: 'bg-violet-50 border-violet-200',
    cta: 'bg-violet-600 text-white group-hover:bg-violet-700',
    labelText: 'text-violet-700',
  },
  emerald: {
    border: 'border-emerald-300 hover:border-emerald-500',
    iconBg: 'bg-emerald-50 border-emerald-200',
    cta: 'bg-emerald-600 text-white group-hover:bg-emerald-700',
    labelText: 'text-emerald-700',
  },
  orange: {
    border: 'border-orange-300 hover:border-orange-500',
    iconBg: 'bg-orange-50 border-orange-200',
    cta: 'bg-orange-600 text-white group-hover:bg-orange-700',
    labelText: 'text-orange-700',
  },
  indigo: {
    border: 'border-indigo-300 hover:border-indigo-500',
    iconBg: 'bg-indigo-50 border-indigo-200',
    cta: 'bg-indigo-600 text-white group-hover:bg-indigo-700',
    labelText: 'text-indigo-700',
  },
};

export const OkumaYazmaHub: React.FC<OkumaYazmaHubProps> = ({
  onClose,
  onGoHome,
  selectedGroupId,
  onSelectGroup,
  focusLetter,
  onSelectFocusLetter,
  onSelectActivity,
  completedIds = [],
  playMp3,
}) => {
  const [speakingLetter, setSpeakingLetter] = useState<string | null>(null);
  const activeGroup = getLetterGroupById(selectedGroupId);

  const completedInGroup = OKUMA_YAZMA_ACTIVITIES.filter((a) =>
    completedIds.includes(`${selectedGroupId}:${a.id}`)
  ).length;

  const handleGroupClick = (groupId: LetterGroupId) => {
    playMp3?.('/op.mp3');
    onSelectGroup(groupId);
    onSelectFocusLetter(null);
  };

  const handleLetterClick = (upper: string, keyword: string) => {
    playMp3?.('/op.mp3');
    const nextLetter = focusLetter === upper ? null : upper;
    onSelectFocusLetter(nextLetter);
    setSpeakingLetter(upper);
    speakTurkish(`${upper} sesi. ${keyword}`);
    window.setTimeout(() => {
      setSpeakingLetter((prev) => (prev === upper ? null : prev));
    }, 1100);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-100 text-slate-900"
      style={{ top: 'var(--app-header-height, 64px)' }}
    >
      <TurkishActivityBackground showFloatingAlphabet={false} />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 sm:py-4 overflow-y-auto no-scrollbar flex flex-col gap-3">
        {/* ÜST BAŞLIK + HARF GRUPLARI SEÇİCİ */}
        <section className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300 px-3.5 sm:px-5 py-3.5 shadow-lg flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                  1. Sınıf Okuma Yazma Merkezi
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 tabular-nums">
                  {activeGroup.title} ({activeGroup.lettersLabel}) · Tamamlanan{' '}
                  <span className="font-black text-rose-700">
                    {completedInGroup}/{OKUMA_YAZMA_ACTIVITIES.length}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <TeacherVoiceToggle playMp3={playMp3} />
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
                <Home className="w-4 h-4 text-rose-600" />
                <span>Ana Menü</span>
              </button>
            </div>
          </div>

          {/* 5 HARF GRUBU SEKMELERİ (HECE KİTABIM SIRALAMASI) */}
          <div
            className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 pt-2 border-t border-slate-200"
            role="tablist"
            aria-label="1. Sınıf Harf Grupları"
          >
            {LETTER_GROUPS.map((group) => {
              const isActive = group.id === selectedGroupId;
              const style = GROUP_TAB_STYLES[group.accent] || GROUP_TAB_STYLES.sky;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleGroupClick(group.id)}
                  className={`min-h-[52px] px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                    isActive
                      ? style.active
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <span className={`text-[11px] font-extrabold uppercase tracking-wide ${isActive ? 'text-white/90' : 'text-slate-500'}`}>
                    {group.shortTitle}
                  </span>
                  <span className={`text-xs sm:text-sm font-black tracking-wide leading-tight mt-0.5 ${isActive ? 'text-white' : style.letters}`}>
                    {group.lettersLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEÇİLİ GRUBUN HARFLERİ (SESLİ DİNLEME + HARF FİLTRESİ) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onSelectFocusLetter(null);
              }}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 ${
                focusLetter === null
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tüm Grup</span>
            </button>

            {activeGroup.letters.map((letter) => {
              const isSelected = focusLetter === letter.upper;
              const isSpeaking = speakingLetter === letter.upper;
              return (
                <button
                  key={letter.upper}
                  type="button"
                  onClick={() => handleLetterClick(letter.upper, letter.keyword)}
                  title={`${letter.upper}${letter.lower} sesini dinle ve bu harfe odaklan`}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                      : 'bg-white hover:bg-rose-50 text-slate-900 border-slate-300 hover:border-rose-400'
                  }`}
                >
                  <span className="text-base sm:text-lg font-black tracking-tight leading-none">
                    {letter.upper}{letter.lower}
                  </span>
                  <span className="text-base leading-none" aria-hidden="true">
                    {letter.emoji}
                  </span>
                  <Volume2
                    className={`w-3.5 h-3.5 ${
                      isSpeaking
                        ? 'text-amber-300 scale-125'
                        : isSelected
                          ? 'text-white/90'
                          : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}

            <span className="text-xs font-medium text-slate-500 ml-auto hidden lg:inline">
              {focusLetter
                ? `Seçili harf: ${focusLetter} · Tekrar dokunarak tüm gruba dönebilirsin.`
                : 'Bir harfe dokunarak sesini dinleyebilir veya etkinlikleri o harfe odaklayabilirsin.'}
            </span>
          </div>
        </section>

        {/* 9 İNTERAKTİF OKUMA YAZMA ETKİNLİĞİ */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4"
          aria-label="1. Sınıf Okuma Yazma Etkinlikleri"
        >
          {OKUMA_YAZMA_ACTIVITIES.map((activity) => {
            const accent = CARD_ACCENTS[activity.accent] || CARD_ACCENTS.sky;
            const isCompleted = completedIds.includes(`${selectedGroupId}:${activity.id}`);

            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onSelectActivity(activity.id, selectedGroupId, focusLetter);
                }}
                className={`group relative w-full text-left rounded-2xl bg-white/95 hover:bg-white border-2 ${accent.border} p-4 shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex flex-col justify-between gap-3 min-h-[188px]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-13 h-13 rounded-2xl border ${accent.iconBg} flex items-center justify-center text-3xl shadow-xs shrink-0 group-hover:scale-105 transition-transform overflow-hidden`}
                  >
                    {activity.id === 'araba_yarisi' ? (
                      <img
                        src="/assets/okuma_araba/select_0.png"
                        alt="Okuma Araba Yarışı"
                        className="w-11 h-11 object-contain"
                      />
                    ) : (
                      <span aria-hidden="true">{activity.emoji}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCompleted && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                        title="Bu grupta tamamlandı"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tamam</span>
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-400 tabular-nums">
                      0{activity.order}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className={`text-[11px] font-extrabold uppercase tracking-wide ${accent.labelText}`}>
                    {activity.interactionLabel}
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {activity.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {activity.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    {focusLetter ? `${focusLetter} Harfi` : activeGroup.shortTitle}
                  </span>
                  <span
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-colors ${accent.cta}`}
                  >
                    <span>Başla</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default OkumaYazmaHub;
