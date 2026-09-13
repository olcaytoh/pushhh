import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  FileText,
  Trash2,
  BookOpen,
  Filter,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';
import { Student } from '../types/student';
import { getTopicInfo, getCurriculumTopicsForGrade } from '../utils/topicHelper';
import { exportStudentsToPDF } from '../utils/studentPdfExport';

interface StudentTopicStatsDetailProps {
  student: Student;
  onResetScore?: (studentId: string) => void;
  playMp3?: (src: string) => void;
  compact?: boolean;
}

export const StudentTopicStatsDetail: React.FC<StudentTopicStatsDetailProps> = ({
  student,
  onResetScore,
  playMp3,
  compact = false
}) => {
  const [showAllCurriculum, setShowAllCurriculum] = useState(true);
  const [topicSearch, setTopicSearch] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const topicEntries = Object.entries(student.topicStats || {});
  const curriculumTopics = getCurriculumTopicsForGrade(student.grade);

  const totalQuestions = student.totalCorrect + student.totalWrong;
  const overallSuccessRate = totalQuestions > 0 ? Math.round((student.totalCorrect / totalQuestions) * 100) : 0;
  const winRate = student.gamesPlayed > 0 ? Math.round((student.gamesWon / student.gamesPlayed) * 100) : 0;

  // Prepare list of topics to display based on mode
  interface DisplayTopicItem {
    key: string;
    title: string;
    desc?: string;
    correct: number;
    wrong: number;
    total: number;
    successRate: number;
    lastPlayed?: string;
    isAttempted: boolean;
  }

  let items: DisplayTopicItem[] = [];

  if (showAllCurriculum) {
    // Show all grade curriculum topics, merging student's stats
    const map = new Map<string, DisplayTopicItem>();

    curriculumTopics.forEach(cur => {
      const stat = student.topicStats?.[cur.key];
      const correct = stat ? stat.correct : 0;
      const wrong = stat ? stat.wrong : 0;
      const total = correct + wrong;
      const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

      map.set(cur.key, {
        key: cur.key,
        title: cur.title,
        desc: cur.desc,
        correct,
        wrong,
        total,
        successRate,
        lastPlayed: stat?.lastPlayed,
        isAttempted: total > 0
      });
    });

    // Also include any topic in student.topicStats that wasn't in standard curriculum (e.g. word games, events)
    topicEntries.forEach(([key, stat]) => {
      if (!map.has(key)) {
        const info = getTopicInfo(key, student.grade);
        const total = stat.correct + stat.wrong;
        const successRate = total > 0 ? Math.round((stat.correct / total) * 100) : 0;
        map.set(key, {
          key,
          title: info.title,
          desc: info.desc,
          correct: stat.correct,
          wrong: stat.wrong,
          total,
          successRate,
          lastPlayed: stat.lastPlayed,
          isAttempted: true
        });
      }
    });

    items = Array.from(map.values());
  } else {
    // Show only topics where student answered questions
    items = topicEntries.map(([key, stat]) => {
      const info = getTopicInfo(key, student.grade);
      const total = stat.correct + stat.wrong;
      const successRate = total > 0 ? Math.round((stat.correct / total) * 100) : 0;
      return {
        key,
        title: info.title,
        desc: info.desc,
        correct: stat.correct,
        wrong: stat.wrong,
        total,
        successRate,
        lastPlayed: stat.lastPlayed,
        isAttempted: true
      };
    });
  }

  // Filter by search term
  if (topicSearch.trim()) {
    const q = topicSearch.trim().toLowerCase();
    items = items.filter(it => it.title.toLowerCase().includes(q) || it.key.toLowerCase().includes(q));
  }

  // Handle PDF Export
  const handlePdfExport = async () => {
    try {
      setIsGeneratingPdf(true);
      playMp3?.('/op.mp3');
      await exportStudentsToPDF([student], student.grade);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[#090e1a] border border-indigo-900/60 shadow-inner select-none">
      {/* 1. STUDENT MINI SUMMARY HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-indigo-950/80">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-black">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>{student.totalCorrect} Doğru</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-black">
            <XCircle size={13} className="text-rose-400 shrink-0" />
            <span>{student.totalWrong} Yanlış</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-black">
            <Trophy size={13} className="text-amber-400 shrink-0" />
            <span>%{overallSuccessRate} Başarı</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
            <span>🎮 {student.gamesPlayed} Oyun ({student.gamesWon} Galibiyet - %{winRate})</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handlePdfExport}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow shadow-rose-950/50 cursor-pointer active:scale-95 disabled:opacity-50 transition"
            title={`${student.name} için bireysel PDF karne çıktısı indir`}
          >
            <FileText size={12} className="text-rose-200" />
            <span>{isGeneratingPdf ? 'Hazırlanıyor...' : 'Bireysel PDF'}</span>
          </button>

          {onResetScore && (
            <div>
              {confirmReset ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetScore(student.id);
                      setConfirmReset(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black cursor-pointer hover:bg-rose-500"
                  >
                    Evet, Sıfırla
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] cursor-pointer hover:bg-slate-700"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition cursor-pointer"
                  title="Sadece bu öğrencinin doğru-yanlış skorlarını sıfırla"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. FILTER & TOPIC TABS */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setShowAllCurriculum(false)}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
              !showAllCurriculum
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Çözülen Konular ({topicEntries.length})
          </button>

          <button
            type="button"
            onClick={() => setShowAllCurriculum(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
              showAllCurriculum
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={12} />
            <span>Tüm Müfredat Konuları ({curriculumTopics.length})</span>
          </button>
        </div>

        {/* SEARCH FILTER */}
        <div className="relative">
          <input
            type="text"
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Konularda ara..."
            className="w-36 sm:w-44 py-1 pl-6 pr-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search size={11} className="absolute left-2 top-2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* 3. TOPIC CARDS LIST */}
      {items.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">🎯</span>
          <p className="text-xs font-bold text-slate-300">
            {topicSearch ? 'Aranan kriterde konu bulunamadı.' : 'Bu öğrenci henüz soru çözmedi.'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {showAllCurriculum
              ? 'Müfredat konuları listelendiğinde henüz çözülmemiş konular görünür.'
              : 'Oyunlar veya yarışmalar oynandıkça çözülen konular otomatik olarak burada listelenir.'}
          </p>
          {!showAllCurriculum && (
            <button
              type="button"
              onClick={() => setShowAllCurriculum(true)}
              className="mt-2 px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-900 transition cursor-pointer"
            >
              📚 Tüm Sınıf Müfredat Konularını Gör
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-2 max-h-[380px] overflow-y-auto pr-1`}>
          {items.map((item) => {
            const hasData = item.isAttempted;
            // Success rate badge style
            let badgeBg = 'bg-slate-800 text-slate-400 border-slate-700';
            if (hasData) {
              if (item.successRate >= 80) badgeBg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
              else if (item.successRate >= 60) badgeBg = 'bg-blue-950/80 text-blue-300 border-blue-500/50';
              else badgeBg = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
            }

            return (
              <div
                key={item.key}
                className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                  hasData
                    ? 'bg-[#101728] border-slate-800 hover:border-slate-700 shadow-sm'
                    : 'bg-[#0b101c]/50 border-slate-900/80 opacity-70'
                }`}
              >
                {/* TITLE & BADGE */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-slate-100 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </h5>
                    {item.desc && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    )}
                  </div>

                  {/* SUCCESS BADGE */}
                  {hasData ? (
                    <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-black shrink-0 ${badgeBg}`}>
                      %{item.successRate}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-500 shrink-0">
                      Çözülmedi
                    </span>
                  )}
                </div>

                {/* STATS ROW & PROGRESS BAR */}
                {hasData ? (
                  <div className="space-y-1 mt-0.5">
                    {/* MINI NUMERICAL COUNTERS */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} /> {item.correct} Doğru
                        </span>
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle size={11} /> {item.wrong} Yanlış
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Toplam: <b>{item.total}</b> soru
                      </span>
                    </div>

                    {/* DUAL COLOR PROGRESS BAR (CORRECT / WRONG RATIO) */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${item.total > 0 ? (item.correct / item.total) * 100 : 0}%` }}
                        title={`Doğru: ${item.correct}`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${item.total > 0 ? (item.wrong / item.total) * 100 : 0}%` }}
                        title={`Yanlış: ${item.wrong}`}
                      />
                    </div>

                    {/* LAST PLAYED DATE */}
                    {item.lastPlayed && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-500">
                        <Calendar size={9} />
                        <span>Son çözüm: {new Date(item.lastPlayed).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                    <span>Henüz soru çözülmedi</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
