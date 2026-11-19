import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  Users,
  Target,
  Search,
  Filter,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import { Student } from '../types/student';
import { loadStudents, deduplicateStudents } from '../utils/studentStore';
import { getTopicInfo } from '../utils/topicHelper';

export interface StudentPerformanceChartProps {
  students?: Student[];
  initialSelectedStudentIds?: string[];
  initialGrade?: number;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

// Grafik Renk Paleti (Her seçilen öğrenci için canlı neon renkler)
const STUDENT_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#14b8a6', // Teal
];

// Tarih etiketini Türkçe formatlama (örn: "26 Eki", "03 Kas")
function formatDateLabel(isoDateStr?: string): string {
  if (!isoDateStr) return '';
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  students: propStudents,
  initialSelectedStudentIds,
  initialGrade = 2,
  onClose,
  className = '',
  compact = false
}) => {
  // Sınıf seviyesi ve öğrenci listesi
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade);
  const [chartMetric, setChartMetric] = useState<'cumulative' | 'successRate' | 'topicBar'>('cumulative');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [studentSearch, setStudentSearch] = useState('');

  // Tüm kayıtlı öğrencileri yükle ve grade bazında filtrele
  const allStudents = useMemo(() => {
    const raw = propStudents && propStudents.length > 0 ? propStudents : loadStudents();
    return deduplicateStudents(raw);
  }, [propStudents]);

  const gradeStudents = useMemo(() => {
    return allStudents.filter(s => s.grade === selectedGrade);
  }, [allStudents, selectedGrade]);

  // Seçili öğrenci ID'leri
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() => {
    if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
      return initialSelectedStudentIds;
    }
    // Varsayılan olarak aktif sınıfın en çok soru çözen 2 öğrencisini seç
    const sorted = [...allStudents]
      .filter(s => s.grade === initialGrade)
      .sort((a, b) => (b.totalCorrect + b.totalWrong) - (a.totalCorrect + a.totalWrong));
    return sorted.slice(0, 2).map(s => s.id);
  });

  // Seçili öğrencilerin tam nesneleri
  const selectedStudents = useMemo(() => {
    return allStudents.filter(s => selectedStudentIds.includes(s.id));
  }, [allStudents, selectedStudentIds]);

  // Öğrenci seç/kaldır toggle fonksiyonu
  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // En az 1 öğrenci seçili kalsın
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 6) {
          // Maksimum 6 öğrenci grafikte temiz okunabilirlik için
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  // ZAMAN İÇİNDE PERFORMANS VERİ SETİ OLUŞTURMA
  // studentStore.ts içindeki topicStats (correct, wrong, lastPlayed) ve createdAt verilerinden zaman serisi üretilir
  const timeSeriesData = useMemo(() => {
    if (selectedStudents.length === 0) return [];

    // Her öğrenci için zaman içindeki aşama noktalarını çıkar
    interface TimelinePoint {
      timestamp: number;
      dateStr: string;
      studentId: string;
      topicKey: string;
      correct: number;
      wrong: number;
    }

    const allPoints: TimelinePoint[] = [];

    selectedStudents.forEach(st => {
      const topicStats = st.topicStats || {};
      const entries = Object.entries(topicStats);

      if (entries.length === 0 && (st.totalCorrect > 0 || st.totalWrong > 0)) {
        // Eğer konu detayları yok ama toplamlar varsa tek bir nokta ekle
        allPoints.push({
          timestamp: st.createdAt ? new Date(st.createdAt).getTime() : Date.now(),
          dateStr: formatDateLabel(st.createdAt) || 'Başlangıç',
          studentId: st.id,
          topicKey: 'genel',
          correct: st.totalCorrect,
          wrong: st.totalWrong
        });
      } else {
        entries.forEach(([key, stat], idx) => {
          let ts: number;
          if (stat.lastPlayed) {
            ts = new Date(stat.lastPlayed).getTime();
          } else if (st.createdAt) {
            // Eğer lastPlayed yoksa kayıt tarihinden sonraya yay
            ts = new Date(st.createdAt).getTime() + (idx + 1) * 3600000 * 24;
          } else {
            ts = Date.now() - (entries.length - idx) * 3600000 * 24;
          }

          allPoints.push({
            timestamp: ts,
            dateStr: formatDateLabel(stat.lastPlayed) || `${idx + 1}. Konu`,
            studentId: st.id,
            topicKey: key,
            correct: stat.correct || 0,
            wrong: stat.wrong || 0
          });
        });
      }
    });

    // Zaman sırasına göre sırala
    allPoints.sort((a, b) => a.timestamp - b.timestamp);

    // Birikimli (Kümülatif) toplamları hesapla
    // Her öğrencinin zaman içindeki son değerini takip et
    const runningTotals: Record<string, { correct: number; wrong: number }> = {};
    selectedStudents.forEach(st => {
      runningTotals[st.id] = { correct: 0, wrong: 0 };
    });

    const chartPoints: any[] = [];

    // Başlangıç noktası (0 seviyesi)
    const startPoint: any = { date: 'Başlangıç', timestamp: 0 };
    selectedStudents.forEach(st => {
      startPoint[`${st.id}_correct`] = 0;
      startPoint[`${st.id}_rate`] = 0;
      startPoint[`${st.id}_total`] = 0;
    });
    chartPoints.push(startPoint);

    allPoints.forEach((pt) => {
      runningTotals[pt.studentId].correct += pt.correct;
      runningTotals[pt.studentId].wrong += pt.wrong;

      const currentCorrect = runningTotals[pt.studentId].correct;
      const currentWrong = runningTotals[pt.studentId].wrong;
      const currentTotal = currentCorrect + currentWrong;
      const currentRate = currentTotal > 0 ? Math.round((currentCorrect / currentTotal) * 100) : 0;

      // Bu zaman noktası için mevcut tüm öğrencilerin değerlerini kopyala
      const pointObj: any = {
        date: pt.dateStr,
        timestamp: pt.timestamp,
        topic: getTopicInfo(pt.topicKey)?.title || pt.topicKey
      };

      selectedStudents.forEach(st => {
        const c = runningTotals[st.id].correct;
        const w = runningTotals[st.id].wrong;
        const tot = c + w;
        const rate = tot > 0 ? Math.round((c / tot) * 100) : 0;

        pointObj[`${st.id}_correct`] = c;
        pointObj[`${st.id}_rate`] = rate;
        pointObj[`${st.id}_total`] = tot;
      });

      chartPoints.push(pointObj);
    });

    return chartPoints;
  }, [selectedStudents]);

  // KONU BAZLI DAĞILIM VERİSİ (BarChart için)
  const topicBarData = useMemo(() => {
    if (selectedStudents.length === 0) return [];

    // Tüm seçili öğrencilerin çözdüğü konuları topla
    const topicMap: Record<string, { key: string; name: string; [studentId: string]: any }> = {};

    selectedStudents.forEach(st => {
      const topicStats = st.topicStats || {};
      Object.entries(topicStats).forEach(([key, stat]) => {
        if (!topicMap[key]) {
          topicMap[key] = {
            key,
            name: getTopicInfo(key)?.title || key,
          };
        }
        topicMap[key][`${st.id}_correct`] = stat.correct || 0;
        topicMap[key][`${st.id}_wrong`] = stat.wrong || 0;
        topicMap[key][`${st.id}_rate`] = (stat.correct + stat.wrong) > 0
          ? Math.round((stat.correct / (stat.correct + stat.wrong)) * 100)
          : 0;
      });
    });

    return Object.values(topicMap).slice(0, 12);
  }, [selectedStudents]);

  // Seçili öğrencilerin toplam özet istatistikleri
  const overallSummary = useMemo(() => {
    let totalCorrect = 0;
    let totalWrong = 0;
    let gamesPlayed = 0;
    let gamesWon = 0;
    let totalTopics = 0;

    selectedStudents.forEach(st => {
      totalCorrect += st.totalCorrect || 0;
      totalWrong += st.totalWrong || 0;
      gamesPlayed += st.gamesPlayed || 0;
      gamesWon += st.gamesWon || 0;
      totalTopics += Object.keys(st.topicStats || {}).length;
    });

    const totalQuestions = totalCorrect + totalWrong;
    const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalCorrect,
      totalWrong,
      totalQuestions,
      successRate,
      gamesPlayed,
      gamesWon,
      totalTopics
    };
  }, [selectedStudents]);

  // Özel Tooltip Bileşeni
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-100 z-50 min-w-[200px]">
          <div className="font-extrabold text-cyan-300 pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span>📅 {label}</span>
            {payload[0]?.payload?.topic && (
              <span className="text-[10px] text-amber-300/90 truncate max-w-[120px]">
                {payload[0].payload.topic}
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const studentId = entry.dataKey.split('_')[0];
              const st = selectedStudents.find(s => s.id === studentId);
              if (!st) return null;

              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-bold text-slate-200">{st.name}:</span>
                  </div>
                  <span className="font-black text-amber-300">
                    {chartMetric === 'successRate' ? `%${entry.value}` : `${entry.value} Doğru`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden select-none ${className}`}>
      
      {/* ÜST BAŞLIK VE KONTROLLER */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/80 border-b border-purple-500/20 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center text-lg shadow-md shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-cyan-200 tracking-wide">
                ÖĞRENCİ PERFORMANS VE GELİŞİM GRAFİĞİ
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hidden xs:inline">
                recharts
              </span>
            </div>
            <p className="text-[11px] text-purple-200/70 font-medium">
              Öğrencilerin zaman içindeki doğru soru çözümü ve başarı yüzdesi seyri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Metrik Seçici: Kümülatif Doğru | Başarı Oranı % | Konu Dağılımı */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setChartMetric('cumulative')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMetric === 'cumulative'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kümülatif Doğru
            </button>
            <button
              onClick={() => setChartMetric('successRate')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMetric === 'successRate'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Başarı Oranı (%)
            </button>
            <button
              onClick={() => setChartMetric('topicBar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMetric === 'topicBar'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Konu Dağılımı
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SINIF SEÇİCİ VE ÖĞRENCİ SEÇİM ŞERİDİ */}
      <div className="p-3 bg-slate-950/40 border-b border-purple-500/20 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Sınıf Düğmeleri (1..4) */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/80">
            {[1, 2, 3, 4].map(gr => (
              <button
                key={gr}
                onClick={() => {
                  setSelectedGrade(gr);
                  // Yeni sınıftan otomatik ilk 2 öğrenciyi seç
                  const gradeSt = allStudents.filter(s => s.grade === gr);
                  if (gradeSt.length > 0) {
                    setSelectedStudentIds(gradeSt.slice(0, 2).map(s => s.id));
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-black cursor-pointer transition ${
                  selectedGrade === gr
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {gr}. Sınıf
              </button>
            ))}
          </div>

          {/* Hızlı Arama */}
          <div className="relative">
            <input
              type="text"
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              placeholder="Öğrenci ara..."
              className="w-36 sm:w-48 py-1 pl-7 pr-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500 pointer-events-none" />
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Seçili: <strong className="text-cyan-300 font-bold">{selectedStudents.length} Öğrenci</strong> (Maks. 6)
          </div>
        </div>

        {/* Öğrenci Çipleri (Çoklu Karşılaştırma) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 custom-scrollbar">
          {gradeStudents
            .filter(st => !studentSearch || st.name.toLocaleLowerCase('tr').includes(studentSearch.toLocaleLowerCase('tr')))
            .map((st, idx) => {
              const isSelected = selectedStudentIds.includes(st.id);
              const colorIdx = selectedStudents.findIndex(s => s.id === st.id);
              const chipColor = isSelected ? STUDENT_COLORS[colorIdx % STUDENT_COLORS.length] : undefined;

              return (
                <button
                  key={st.id}
                  onClick={() => toggleStudent(st.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                  style={{
                    borderColor: isSelected ? chipColor : undefined,
                    boxShadow: isSelected ? `0 0 10px ${chipColor}33` : undefined
                  }}
                >
                  <span>{st.avatar || '🎓'}</span>
                  <span>{st.name.split(' ')[0]}</span>
                  {isSelected && (
                    <span
                      className="w-2 h-2 rounded-full ml-0.5"
                      style={{ backgroundColor: chipColor }}
                    />
                  )}
                  <span className="text-[10px] px-1 rounded bg-slate-900/80 text-amber-300 font-extrabold ml-0.5">
                    {st.totalCorrect}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* ÖZET PERFORMANS KARTLARI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/20 border-b border-purple-500/20 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Toplam Doğru</p>
            <p className="text-base font-black text-emerald-400">{overallSummary.totalCorrect}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Başarı Oranı</p>
            <p className="text-base font-black text-cyan-400">%{overallSummary.successRate}</p>
          </div>
          <Target className="w-5 h-5 text-cyan-400/50" />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Toplam Soru</p>
            <p className="text-base font-black text-amber-400">{overallSummary.totalQuestions}</p>
          </div>
          <BarChart3 className="w-5 h-5 text-amber-400/50" />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Çalışılan Konu</p>
            <p className="text-base font-black text-purple-400">{overallSummary.totalTopics}</p>
          </div>
          <Sparkles className="w-5 h-5 text-purple-400/50" />
        </div>
      </div>

      {/* GRAFİK GÖRÜNTÜLEME ALANI */}
      <div className="p-3 sm:p-4 min-h-[340px] flex-1 flex flex-col justify-center">
        {selectedStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center">
            <Users className="w-10 h-10 text-slate-600 mb-2" />
            <p className="font-bold text-sm">Grafikte görüntülemek için yukarıdan en az 1 öğrenci seçin.</p>
          </div>
        ) : chartMetric === 'topicBar' ? (
          /* KONU BAZLI DAĞILIM (BarChart) */
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicBarData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  formatter={(value) => {
                    const studentId = value.split('_')[0];
                    const st = selectedStudents.find(s => s.id === studentId);
                    return <span className="text-slate-200 font-bold">{st?.name || value}</span>;
                  }}
                />
                {selectedStudents.map((st, i) => (
                  <Bar
                    key={st.id}
                    dataKey={`${st.id}_correct`}
                    name={`${st.id}_correct`}
                    fill={STUDENT_COLORS[i % STUDENT_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* ZAMAN İÇİNDE KÜMÜLATİF VEYA BAŞARI ORANI GRAFİĞİ (AreaChart / LineChart) */
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <defs>
                  {selectedStudents.map((st, i) => {
                    const color = STUDENT_COLORS[i % STUDENT_COLORS.length];
                    return (
                      <linearGradient key={st.id} id={`grad_${st.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  domain={chartMetric === 'successRate' ? [0, 100] : [0, 'auto']}
                  unit={chartMetric === 'successRate' ? '%' : ''}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  formatter={(value) => {
                    const studentId = value.split('_')[0];
                    const st = selectedStudents.find(s => s.id === studentId);
                    return <span className="text-slate-200 font-bold">{st?.name || value}</span>;
                  }}
                />
                {selectedStudents.map((st, i) => {
                  const color = STUDENT_COLORS[i % STUDENT_COLORS.length];
                  const dataKey = chartMetric === 'successRate' ? `${st.id}_rate` : `${st.id}_correct`;

                  return (
                    <Area
                      key={st.id}
                      type="monotone"
                      dataKey={dataKey}
                      name={dataKey}
                      stroke={color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#grad_${st.id})`}
                      dot={{ r: 3, fill: color, stroke: '#0f172a', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#fff', stroke: color, strokeWidth: 2 }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ALT BİLGİ VE REHBER */}
      <div className="p-2.5 bg-slate-950/70 border-t border-purple-500/20 text-[10px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Veriler <strong className="text-slate-300">studentStore.ts</strong> içindeki kayıtlı zaman ve konu istatistiklerinden anlık üretilir.
        </span>
        <span className="text-cyan-300/80 font-semibold">
          Farklı öğrencileri seçerek gelişim hızlarını birbiriyle karşılaştırabilirsiniz.
        </span>
      </div>

    </div>
  );
};
