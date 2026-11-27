import { Student } from '../types/student';

export type PerformanceGranularity = 'weekly' | 'monthly';
export type PerformanceMetric = 'successRate' | 'periodCorrect' | 'cumulativeCorrect';

export interface StudentSeriesDescriptor {
  student: Student;
  seriesKey: string; // Safe Recharts key without student ID underscores (e.g. "s0")
  color: string;
}

export interface StudentPeriodBucketStats {
  correct: number;
  wrong: number;
  total: number;
  rate: number | null;
  cumCorrect: number;
  cumWrong: number;
  cumRate: number | null;
}

export interface PerformanceChartPoint {
  bucketKey: string;
  label: string;
  rangeLabel: string;
  startTimestamp: number;
  bySeries: Record<string, StudentPeriodBucketStats>;
  // Dynamic numeric properties for Recharts lines: `${seriesKey}_rate`, `${seriesKey}_correct`, `${seriesKey}_cumCorrect`
  [key: string]: any;
}

export interface StudentMomentumSummary {
  studentId: string;
  seriesKey: string;
  name: string;
  avatar: string;
  color: string;
  totalCorrect: number;
  totalWrong: number;
  totalSolved: number;
  overallRate: number;
  activePeriods: number;
  latestRate: number | null;
  previousRate: number | null;
  deltaRate: number | null; // Latest active period minus previous active period (percentage points)
  trendStatus: 'rising' | 'steady' | 'needs_support' | 'single_period' | 'no_data';
  trendLabel: string;
}

interface RawTimedEvent {
  date: Date;
  correct: number;
  wrong: number;
}

const TURKISH_SHORT_MONTHS = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

const TURKISH_LONG_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function parseDateSafely(input?: string): Date | null {
  if (!input) return null;
  // Support YYYY-MM-DD as local midnight to avoid timezone shifts across days
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (ymdMatch) {
    const y = Number(ymdMatch[1]);
    const m = Number(ymdMatch[2]) - 1;
    const d = Number(ymdMatch[3]);
    const localDate = new Date(y, m, d, 12, 0, 0, 0);
    return isNaN(localDate.getTime()) ? null : localDate;
  }
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Returns Monday 00:00 local time for the ISO week containing `date` */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function getBucketKey(date: Date, granularity: PerformanceGranularity): string {
  if (granularity === 'monthly') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const mon = getStartOfWeek(date);
  const y = mon.getFullYear();
  const m = String(mon.getMonth() + 1).padStart(2, '0');
  const d = String(mon.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatWeekShortLabel(weekStart: Date): string {
  return `${weekStart.getDate()} ${TURKISH_SHORT_MONTHS[weekStart.getMonth()]}`;
}

function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const startMonth = TURKISH_SHORT_MONTHS[weekStart.getMonth()];
  const endMonth = TURKISH_SHORT_MONTHS[weekEnd.getMonth()];
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()}–${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
  }
  return `${weekStart.getDate()} ${startMonth} – ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
}

function formatMonthShortLabel(monthStart: Date, includeYear: boolean): string {
  const shortMonth = TURKISH_SHORT_MONTHS[monthStart.getMonth()];
  if (!includeYear) return shortMonth;
  return `${shortMonth} '${String(monthStart.getFullYear()).slice(-2)}`;
}

function formatMonthRangeLabel(monthStart: Date): string {
  return `${TURKISH_LONG_MONTHS[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
}

/**
 * Extracts real dated solution events from a Student object.
 * Prioritizes `dailyHistory` (YYYY-MM-DD logs), and reconciles older `topicStats`
 * (via `lastPlayed` / `createdAt`) so legacy student records render accurately too.
 */
export function extractStudentTimedEvents(student: Student): RawTimedEvent[] {
  const events: RawTimedEvent[] = [];
  let dailyCorrectSum = 0;
  let dailyWrongSum = 0;
  const dailyTopicTotals: Record<string, { correct: number; wrong: number }> = {};

  if (student.dailyHistory && typeof student.dailyHistory === 'object') {
    Object.entries(student.dailyHistory).forEach(([dayKey, rec]) => {
      const parsed = parseDateSafely(dayKey);
      const correct = Math.max(0, rec?.correct || 0);
      const wrong = Math.max(0, rec?.wrong || 0);
      if (parsed && (correct > 0 || wrong > 0)) {
        events.push({ date: parsed, correct, wrong });
        dailyCorrectSum += correct;
        dailyWrongSum += wrong;
      }
      if (rec?.topics) {
        Object.entries(rec.topics).forEach(([tk, tVal]) => {
          if (!dailyTopicTotals[tk]) {
            dailyTopicTotals[tk] = { correct: 0, wrong: 0 };
          }
          dailyTopicTotals[tk].correct += Math.max(0, tVal?.correct || 0);
          dailyTopicTotals[tk].wrong += Math.max(0, tVal?.wrong || 0);
        });
      }
    });
  }

  const fallbackCreatedDate = parseDateSafely(student.createdAt) || new Date();
  const topicEntries = Object.entries(student.topicStats || {});

  if (topicEntries.length > 0) {
    // Include residual counts from topicStats that predated dailyHistory recording
    topicEntries.forEach(([topicKey, stat]) => {
      const logged = dailyTopicTotals[topicKey];
      const residualCorrect = Math.max(0, (stat?.correct || 0) - (logged?.correct || 0));
      const residualWrong = Math.max(0, (stat?.wrong || 0) - (logged?.wrong || 0));
      if (residualCorrect > 0 || residualWrong > 0) {
        const eventDate = parseDateSafely(stat?.lastPlayed) || fallbackCreatedDate;
        events.push({
          date: eventDate,
          correct: residualCorrect,
          wrong: residualWrong
        });
        dailyCorrectSum += residualCorrect;
        dailyWrongSum += residualWrong;
      }
    });
  }

  // Final safeguard: if totalCorrect/totalWrong exist beyond all topic/daily logs
  const remainingCorrect = Math.max(0, (student.totalCorrect || 0) - dailyCorrectSum);
  const remainingWrong = Math.max(0, (student.totalWrong || 0) - dailyWrongSum);
  if (remainingCorrect > 0 || remainingWrong > 0) {
    events.push({
      date: fallbackCreatedDate,
      correct: remainingCorrect,
      wrong: remainingWrong
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Builds chronological weekly or monthly Recharts series and per-student momentum stats.
 */
export function buildStudentPerformanceSeries(
  descriptors: StudentSeriesDescriptor[],
  granularity: PerformanceGranularity
): {
  chartData: PerformanceChartPoint[];
  momentumSummaries: StudentMomentumSummary[];
  hasAnyHistory: boolean;
} {
  if (descriptors.length === 0) {
    return { chartData: [], momentumSummaries: [], hasAnyHistory: false };
  }

  const now = new Date();
  const eventsBySeries = new Map<string, RawTimedEvent[]>();
  let minEventDate: Date | null = null;
  let maxEventDate: Date | null = null;
  let hasAnyHistory = false;

  descriptors.forEach((desc) => {
    const events = extractStudentTimedEvents(desc.student);
    eventsBySeries.set(desc.seriesKey, events);
    events.forEach((ev) => {
      hasAnyHistory = true;
      if (!minEventDate || ev.date.getTime() < minEventDate.getTime()) {
        minEventDate = ev.date;
      }
      if (!maxEventDate || ev.date.getTime() > maxEventDate.getTime()) {
        maxEventDate = ev.date;
      }
    });
  });

  // Determine continuous timeline buckets
  const bucketStarts: Date[] = [];

  if (granularity === 'weekly') {
    const endAnchor = maxEventDate && maxEventDate.getTime() > now.getTime() ? maxEventDate : now;
    const endWeek = getStartOfWeek(endAnchor);
    const defaultWeeks = 8;
    const maxWeeks = 12;

    let startWeek = new Date(endWeek);
    startWeek.setDate(endWeek.getDate() - (defaultWeeks - 1) * 7);

    if (minEventDate) {
      const earliestWeek = getStartOfWeek(minEventDate);
      if (earliestWeek.getTime() < startWeek.getTime()) {
        const diffWeeks = Math.round(
          (endWeek.getTime() - earliestWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        const clampedWeeks = Math.min(maxWeeks, diffWeeks + 1);
        startWeek = new Date(endWeek);
        startWeek.setDate(endWeek.getDate() - (clampedWeeks - 1) * 7);
      }
    }

    const cursor = new Date(startWeek);
    while (cursor.getTime() <= endWeek.getTime()) {
      bucketStarts.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    const endAnchor = maxEventDate && maxEventDate.getTime() > now.getTime() ? maxEventDate : now;
    const endMonth = getStartOfMonth(endAnchor);
    const defaultMonths = 6;
    const maxMonths = 12;

    let startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - (defaultMonths - 1), 1);

    if (minEventDate) {
      const earliestMonth = getStartOfMonth(minEventDate);
      if (earliestMonth.getTime() < startMonth.getTime()) {
        const monthDiff =
          (endMonth.getFullYear() - earliestMonth.getFullYear()) * 12 +
          (endMonth.getMonth() - earliestMonth.getMonth());
        const clampedMonths = Math.min(maxMonths, monthDiff + 1);
        startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - (clampedMonths - 1), 1);
      }
    }

    const cursor = new Date(startMonth);
    while (cursor.getTime() <= endMonth.getTime()) {
      bucketStarts.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  const spansMultipleYears =
    bucketStarts.length > 1 &&
    bucketStarts[0].getFullYear() !== bucketStarts[bucketStarts.length - 1].getFullYear();

  const earliestBucketTs = bucketStarts[0]?.getTime() ?? 0;

  // Map raw events into buckets per student (and keep pre-window baseline for cumulative mode)
  const preWindowTotals: Record<string, { correct: number; wrong: number }> = {};
  const bucketCountsBySeries: Record<string, Record<string, { correct: number; wrong: number }>> = {};

  descriptors.forEach((desc) => {
    preWindowTotals[desc.seriesKey] = { correct: 0, wrong: 0 };
    bucketCountsBySeries[desc.seriesKey] = {};

    const events = eventsBySeries.get(desc.seriesKey) || [];
    events.forEach((ev) => {
      const bucketStart =
        granularity === 'weekly' ? getStartOfWeek(ev.date) : getStartOfMonth(ev.date);
      if (bucketStart.getTime() < earliestBucketTs) {
        preWindowTotals[desc.seriesKey].correct += ev.correct;
        preWindowTotals[desc.seriesKey].wrong += ev.wrong;
        return;
      }
      const key = getBucketKey(bucketStart, granularity);
      if (!bucketCountsBySeries[desc.seriesKey][key]) {
        bucketCountsBySeries[desc.seriesKey][key] = { correct: 0, wrong: 0 };
      }
      bucketCountsBySeries[desc.seriesKey][key].correct += ev.correct;
      bucketCountsBySeries[desc.seriesKey][key].wrong += ev.wrong;
    });
  });

  // Build Recharts rows chronologically
  const runningTotals: Record<string, { correct: number; wrong: number }> = {};
  descriptors.forEach((desc) => {
    runningTotals[desc.seriesKey] = {
      correct: preWindowTotals[desc.seriesKey].correct,
      wrong: preWindowTotals[desc.seriesKey].wrong
    };
  });

  const activeRatesBySeries: Record<string, number[]> = {};
  descriptors.forEach((desc) => {
    activeRatesBySeries[desc.seriesKey] = [];
  });

  const chartData: PerformanceChartPoint[] = bucketStarts.map((bStart) => {
    const bucketKey = getBucketKey(bStart, granularity);
    const label =
      granularity === 'weekly'
        ? formatWeekShortLabel(bStart)
        : formatMonthShortLabel(bStart, spansMultipleYears);
    const rangeLabel =
      granularity === 'weekly'
        ? formatWeekRangeLabel(bStart)
        : formatMonthRangeLabel(bStart);

    const point: PerformanceChartPoint = {
      bucketKey,
      label,
      rangeLabel,
      startTimestamp: bStart.getTime(),
      bySeries: {}
    };

    descriptors.forEach((desc) => {
      const cell = bucketCountsBySeries[desc.seriesKey][bucketKey] || { correct: 0, wrong: 0 };
      const total = cell.correct + cell.wrong;
      const rate = total > 0 ? Math.round((cell.correct / total) * 100) : null;

      runningTotals[desc.seriesKey].correct += cell.correct;
      runningTotals[desc.seriesKey].wrong += cell.wrong;

      const cumCorrect = runningTotals[desc.seriesKey].correct;
      const cumWrong = runningTotals[desc.seriesKey].wrong;
      const cumTotal = cumCorrect + cumWrong;
      const cumRate = cumTotal > 0 ? Math.round((cumCorrect / cumTotal) * 100) : null;

      if (rate !== null) {
        activeRatesBySeries[desc.seriesKey].push(rate);
      }

      point.bySeries[desc.seriesKey] = {
        correct: cell.correct,
        wrong: cell.wrong,
        total,
        rate,
        cumCorrect,
        cumWrong,
        cumRate
      };

      point[`${desc.seriesKey}_rate`] = rate;
      point[`${desc.seriesKey}_correct`] = total > 0 ? cell.correct : 0;
      point[`${desc.seriesKey}_cumCorrect`] = cumCorrect;
    });

    return point;
  });

  // Compute momentum summary per selected student
  const momentumSummaries: StudentMomentumSummary[] = descriptors.map((desc) => {
    const st = desc.student;
    const totalCorrect = st.totalCorrect || 0;
    const totalWrong = st.totalWrong || 0;
    const totalSolved = totalCorrect + totalWrong;
    const overallRate = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    const rates = activeRatesBySeries[desc.seriesKey] || [];
    const activePeriods = rates.length;

    let latestRate: number | null = null;
    let previousRate: number | null = null;
    let deltaRate: number | null = null;
    let trendStatus: StudentMomentumSummary['trendStatus'] = 'no_data';
    let trendLabel = 'Veri bekleniyor';

    if (activePeriods === 1) {
      latestRate = rates[0];
      trendStatus = 'single_period';
      trendLabel = 'İlk dönem kaydı';
    } else if (activePeriods >= 2) {
      latestRate = rates[rates.length - 1];
      previousRate = rates[rates.length - 2];
      deltaRate = latestRate - previousRate;
      if (deltaRate >= 3) {
        trendStatus = 'rising';
        trendLabel = 'Yükselişte';
      } else if (deltaRate <= -3) {
        trendStatus = 'needs_support';
        trendLabel = 'Destek Gerekli';
      } else {
        trendStatus = 'steady';
        trendLabel = 'İstikrarlı';
      }
    }

    return {
      studentId: st.id,
      seriesKey: desc.seriesKey,
      name: st.name,
      avatar: st.avatar || '🎓',
      color: desc.color,
      totalCorrect,
      totalWrong,
      totalSolved,
      overallRate,
      activePeriods,
      latestRate,
      previousRate,
      deltaRate,
      trendStatus,
      trendLabel
    };
  });

  return { chartData, momentumSummaries, hasAnyHistory };
}
