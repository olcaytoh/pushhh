import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Users,
  Search,
  X
} from 'lucide-react';
import { Student } from '../types/student';
import { loadStudents, deduplicateStudents } from '../utils/studentStore';
import {
  buildStudentPerformanceSeries,
  PerformanceGranularity,
  PerformanceMetric,
  StudentSeriesDescriptor
} from '../utils/studentPerformanceSeries';

export interface StudentPerformanceChartProps {
  students?: Student[];
  initialSelectedStudentIds?: string[];
  initialGrade?: number;
  singleStudentMode?: boolean;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const STUDENT_LINE_COLORS = [
  '#38bdf8', // Sky
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#c084fc', // Violet
  '#fb7185', // Rose
  '#2dd4bf'  // Teal
];

const MAX_COMPARE_STUDENTS = 6;

function pickTopStudentIds(students: Student[], grade: number, count = 3): string[] {
  return [...students]
    .filter((s) => s.grade === grade)
    .sort((a, b) => (b.totalCorrect + b.totalWrong) - (a.totalCorrect + a.totalWrong))
    .slice(0, count)
    .map((s) => s.id);
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  students: propStudents,
  initialSelectedStudentIds,
  initialGrade = 2,
  singleStudentMode = false,
  onClose,
  className = '',
  compact = false
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade);
  const [granularity, setGranularity] = useState<PerformanceGranularity>('weekly');
  const [metric, setMetric] = useState<PerformanceMetric>('successRate');
  const [studentSearch, setStudentSearch] = useState('');

  const allStudents = useMemo(() => {
    const raw = propStudents && propStudents.length > 0 ? propStudents : loadStudents();
    return deduplicateStudents(raw);
  }, [propStudents]);

  const gradeStudents = useMemo(() => {
    return allStudents
      .filter((s) => s.grade === selectedGrade)
      .sort((a, b) => (b.totalCorrect + b.totalWrong) - (a.totalCorrect + a.totalWrong));
  }, [allStudents, selectedGrade]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() => {
    if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
      return initialSelectedStudentIds.slice(0, MAX_COMPARE_STUDENTS);
    }
    return pickTopStudentIds(allStudents, initialGrade, 3);
  });

  // Sync grade when parent grade tab changes
  useEffect(() => {
    if (singleStudentMode) return;
    setSelectedGrade(initialGrade);
  }, [initialGrade, singleStudentMode]);

  // Sync explicit initial selection (e.g. when jumping to a student's chart from the roster)
  useEffect(() => {
    if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
      setSelectedStudentIds(initialSelectedStudentIds.slice(0, MAX_COMPARE_STUDENTS));
    }
  }, [initialSelectedStudentIds]);

  // Keep selection valid for the active grade
  useEffect(() => {
    if (singleStudentMode) return;
    const validIdsInGrade = new Set(gradeStudents.map((s) => s.id));
    setSelectedStudentIds((prev) => {
      const stillValid = prev.filter((id) => validIdsInGrade.has(id));
      if (stillValid.length > 0) return stillValid;
      return pickTopStudentIds(allStudents, selectedGrade, 3);
    });
  }, [selectedGrade, gradeStudents, allStudents, singleStudentMode]);

  const selectedStudents = useMemo(() => {
    if (singleStudentMode && allStudents.length > 0) {
      const targetId = initialSelectedStudentIds?.[0];
      const match = targetId ? allStudents.find((s) => s.id === targetId) : allStudents[0];
      return match ? [match] : [];
    }
    const idSet = new Set(selectedStudentIds);
    return allStudents.filter((s) => idSet.has(s.id));
  }, [allStudents, selectedStudentIds, singleStudentMode, initialSelectedStudentIds]);

  const seriesDescriptors: StudentSeriesDescriptor[] = useMemo(() => {
    return selectedStudents.map((student, idx) => ({
      student,
      seriesKey: `s${idx}`,
      color: STUDENT_LINE_COLORS[idx % STUDENT_LINE_COLORS.length]
    }));
  }, [selectedStudents]);

  const descriptorByKey = useMemo(() => {
    const map = new Map<string, StudentSeriesDescriptor>();
    seriesDescriptors.forEach((d) => map.set(d.seriesKey, d));
    return map;
  }, [seriesDescriptors]);

  const { chartData, momentumSummaries, hasAnyHistory } = useMemo(() => {
    return buildStudentPerformanceSeries(seriesDescriptors, granularity);
  }, [seriesDescriptors, granularity]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE_STUDENTS) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const filteredGradeStudents = useMemo(() => {
    const q = studentSearch.trim().toLocaleLowerCase('tr');
    if (!q) return gradeStudents;
    return gradeStudents.filter(
      (st) =>
        st.name.toLocaleLowerCase('tr').includes(q) ||
        (st.className && st.className.toLocaleLowerCase('tr').includes(q))
    );
  }, [gradeStudents, studentSearch]);

  const dataKeySuffix =
    metric === 'successRate' ? 'rate' : metric === 'periodCorrect' ? 'correct' : 'cumCorrect';

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload;
    if (!row) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700 rounded-xl px-3.5 py-2.5 shadow-xl text-xs text-slate-100 min-w-[220px]">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold pb-2 mb-2 border-b border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{row.rangeLabel}</span>
        </div>

        <div className="space-y-2">
          {seriesDescriptors.map((desc) => {
            const cell = row.bySeries?.[desc.seriesKey];
            if (!cell) return null;

            const hasPeriodActivity = cell.total > 0;
            return (
              <div key={desc.seriesKey} className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: desc.color }}
                  />
                  <span className="font-semibold text-slate-100 truncate max-w-[130px]">
                    {desc.student.name}
                  </span>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  {metric === 'successRate' ? (
                    hasPeriodActivity ? (
                      <div>
                        <span className="font-bold text-white">%{cell.rate}</span>
                        <span className="text-slate-400 ml-1.5">
                          {cell.correct}D / {cell.wrong}Y
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Çözüm yok</span>
                    )
                  ) : metric === 'periodCorrect' ? (
                    <div>
                      <span className="font-bold text-white">{cell.correct} Doğru</span>
                      {hasPeriodActivity && (
                        <span className="text-slate-400 ml-1.5">(%{cell.rate})</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-white">{cell.cumCorrect} Toplam</span>
                      {cell.cumRate !== null && (
                        <span className="text-slate-400 ml-1.5">(%{cell.cumRate})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="Öğrenci Başarı İvmesi Grafiği"
      className={`flex flex-col bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden text-slate-100 ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {singleStudentMode && selectedStudents[0]
                ? `${selectedStudents[0].name} — Başarı İvmesi`
                : 'Öğrenci Başarı İvmesi Grafiği'}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {granularity === 'weekly'
                ? 'Haftalık çözüm verilerine göre zaman içindeki performans eğrisi'
                : 'Aylık çözüm verilerine göre zaman içindeki performans eğrisi'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {/* Granularity Segmented Control: Haftalık / Aylık */}
          <div
            role="group"
            aria-label="Zaman aralığı"
            className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800"
          >
            <button
              type="button"
              onClick={() => setGranularity('weekly')}
              aria-pressed={granularity === 'weekly'}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                granularity === 'weekly'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Haftalık
            </button>
            <button
              type="button"
              onClick={() => setGranularity('monthly')}
              aria-pressed={granularity === 'monthly'}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                granularity === 'monthly'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Aylık
            </button>
          </div>

          {/* Metric Segmented Control */}
          <div
            role="group"
            aria-label="Grafik metriği"
            className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800"
          >
            <button
              type="button"
              onClick={() => setMetric('successRate')}
              aria-pressed={metric === 'successRate'}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'successRate'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Başarı (%)
            </button>
            <button
              type="button"
              onClick={() => setMetric('periodCorrect')}
              aria-pressed={metric === 'periodCorrect'}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'periodCorrect'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Dönem Doğru
            </button>
            <button
              type="button"
              onClick={() => setMetric('cumulativeCorrect')}
              aria-pressed={metric === 'cumulativeCorrect'}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'cumulativeCorrect'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Toplam Doğru
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Grafiği kapat"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Student Selector Bar (hidden in single-student detail mode) */}
      {!singleStudentMode && (
        <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Öğrenci ara..."
                  className="w-40 sm:w-52 py-1.5 pl-8 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500 pointer-events-none" />
              </div>

              {gradeStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds(pickTopStudentIds(allStudents, selectedGrade, 3))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  En Aktif 3
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 tabular-nums">
              <span>{selectedGrade}. Sınıf</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>Seçili: {selectedStudents.length}/{MAX_COMPARE_STUDENTS}</span>
            </div>
          </div>

          {filteredGradeStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">
              {studentSearch
                ? 'Arama kriterine uygun öğrenci bulunamadı.'
                : `${selectedGrade}. sınıfta henüz kayıtlı öğrenci bulunmuyor.`}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {filteredGradeStudents.map((st) => {
                const descIdx = seriesDescriptors.findIndex((d) => d.student.id === st.id);
                const isSelected = descIdx !== -1;
                const lineColor = isSelected ? seriesDescriptors[descIdx].color : undefined;
                const solved = (st.totalCorrect || 0) + (st.totalWrong || 0);

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStudent(st.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    style={isSelected && lineColor ? { borderColor: lineColor } : undefined}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected && lineColor ? lineColor : '#475569' }}
                    />
                    <span>{st.name}</span>
                    <span className="text-slate-400 font-normal tabular-nums">({solved})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Per-Student Momentum Summary Row */}
      {momentumSummaries.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          {momentumSummaries.map((item) => {
            const deltaText =
              item.deltaRate === null
                ? item.trendLabel
                : `${item.deltaRate > 0 ? '+' : ''}${item.deltaRate} puan · ${item.trendLabel}`;

            const trendColorClass =
              item.trendStatus === 'rising'
                ? 'text-emerald-400'
                : item.trendStatus === 'needs_support'
                ? 'text-rose-400'
                : item.trendStatus === 'steady'
                ? 'text-sky-300'
                : 'text-slate-400';

            return (
              <div
                key={item.studentId}
                className="flex items-center justify-between gap-3 py-1 border-b border-slate-800/60 last:border-b-0 sm:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-100 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      <span>%{item.overallRate} başarı</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>{item.totalSolved} soru</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-[11px] font-semibold tabular-nums shrink-0 ${trendColorClass}`}>
                  {item.trendStatus === 'rising' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  ) : item.trendStatus === 'needs_support' ? (
                    <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{deltaText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Recharts LineChart Viewport */}
      <div className={`px-3 sm:px-4 py-4 flex-1 flex flex-col justify-center ${compact ? 'min-h-[260px]' : 'min-h-[320px]'}`}>
        {selectedStudents.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-400">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">
              Grafiği görmek için en az bir öğrenci seçin.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Yukarıdaki öğrenci listesinden seçim yaparak haftalık veya aylık başarı ivmesini karşılaştırabilirsiniz.
            </p>
          </div>
        ) : !hasAnyHistory ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-400">
            <TrendingUp className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">
              Seçili öğrenciler için henüz çözüm kaydı bulunmuyor.
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              Öğrenciler etkinlik ve oyunlarda soru çözdükçe {granularity === 'weekly' ? 'haftalık' : 'aylık'} başarı ivmesi çizgi grafiği otomatik olarak oluşacaktır.
            </p>
          </div>
        ) : (
          <div className={`w-full ${compact ? 'h-[250px]' : 'h-[310px]'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 14, right: 20, left: -6, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  dy={6}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={metric === 'successRate' ? [0, 100] : [0, 'auto']}
                  allowDecimals={false}
                  tickFormatter={(v) => (metric === 'successRate' ? `%${v}` : String(v))}
                />
                <Tooltip content={renderTooltip} cursor={{ stroke: '#475569', strokeDasharray: '4 4' }} />
                {!singleStudentMode && (
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    formatter={(value: string) => {
                      const seriesKey = value.split('_')[0];
                      const desc = descriptorByKey.get(seriesKey);
                      return (
                        <span className="text-slate-200 font-medium">
                          {desc ? desc.student.name : value}
                        </span>
                      );
                    }}
                  />
                )}
                {metric === 'successRate' && (
                  <ReferenceLine
                    y={70}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Hedef %70',
                      position: 'insideTopRight',
                      fill: '#94a3b8',
                      fontSize: 10
                    }}
                  />
                )}
                {seriesDescriptors.map((desc) => {
                  const dataKey = `${desc.seriesKey}_${dataKeySuffix}`;
                  return (
                    <Line
                      key={desc.seriesKey}
                      type="monotone"
                      dataKey={dataKey}
                      name={dataKey}
                      stroke={desc.color}
                      strokeWidth={2.5}
                      connectNulls
                      dot={{ r: 4, fill: desc.color, stroke: '#020617', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#f8fafc', stroke: desc.color, strokeWidth: 2.5 }}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quiet explanatory footer */}
      <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span>
          İvme değeri, öğrencinin aktif son iki {granularity === 'weekly' ? 'hafta' : 'ay'} arasındaki başarı oranı değişimini gösterir.
        </span>
        {!singleStudentMode && (
          <span className="tabular-nums text-slate-300">
            {granularity === 'weekly' ? 'Son haftalar' : 'Son aylar'} · {chartData.length} dönem
          </span>
        )}
      </div>
    </section>
  );
};
