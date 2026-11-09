export interface GradeQuestionStats {
  correct: number;
  wrong: number;
}

export interface ClassCountersData {
  version: number;
  visits: {
    total: number;
    today: number;
    lastVisitDate: string; // 'YYYY-MM-DD'
    lastVisitTime: string; // 'DD.MM.YYYY HH:mm'
    firstVisitDate: string;
  };
  clicks: {
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    otherGames: number;
    englishGames: number;
  };
  questions: {
    grade1: GradeQuestionStats;
    grade2: GradeQuestionStats;
    grade3: GradeQuestionStats;
    grade4: GradeQuestionStats;
    otherGames: GradeQuestionStats;
    englishGames: GradeQuestionStats;
  };
}

const STORAGE_KEY = 'olcico_class_counters_v1';
const SESSION_FLAG_KEY = 'olcico_session_visit_counted';

export const INITIAL_COUNTERS: ClassCountersData = {
  version: 1,
  visits: {
    total: 1955,
    today: 0,
    lastVisitDate: '',
    lastVisitTime: '',
    firstVisitDate: '',
  },
  clicks: {
    grade1: 0,
    grade2: 0,
    grade3: 0,
    grade4: 0,
    otherGames: 0,
    englishGames: 0,
  },
  questions: {
    grade1: { correct: 0, wrong: 0 },
    grade2: { correct: 0, wrong: 0 },
    grade3: { correct: 0, wrong: 0 },
    grade4: { correct: 0, wrong: 0 },
    otherGames: { correct: 0, wrong: 0 },
    englishGames: { correct: 0, wrong: 0 },
  },
};

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getFormattedNow(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

let activeCounterEmail: string | null = null;

export function setActiveCounterEmail(email?: string | null): void {
  activeCounterEmail = email ? email.trim().toLowerCase() : null;
}

export function getActiveCounterEmail(): string | null {
  return activeCounterEmail;
}

export function loadCounters(userEmail?: string | null): ClassCountersData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const today = getTodayString();
    const email = (userEmail || activeCounterEmail || '').trim().toLowerCase();

    const isMushat = email === 'mushat29.mk@gmail.com';
    const isBanu = email === 'banuhyt@gmail.com';

    // Baseline definitions (Yalnızca gerçek hesap istatistikleri)
    let g1Baseline = { correct: 0, wrong: 0 };
    let g2Baseline = { correct: 0, wrong: 0 };
    let g3Baseline = { correct: 0, wrong: 0 };

    if (isMushat) {
      g3Baseline = { correct: 490, wrong: 224 };
      g1Baseline = { correct: 4, wrong: 10 };
    } else if (isBanu) {
      g2Baseline = { correct: 42, wrong: 0 };
    }

    const isOlcayto = email.includes('olcayto');

    // Calculate total questions in parsed
    let parsedTotalQuestions = 0;
    if (parsed?.questions) {
      Object.values(parsed.questions).forEach((q: any) => {
        parsedTotalQuestions += (q?.correct || 0) + (q?.wrong || 0);
      });
    }

    // Olcayto hoca istatistikleri sıfırladığında hayalet 9208 veya eski yapay sayılar otomatik temizlenir
    const shouldResetOlcaytoQuestions = isOlcayto && (parsedTotalQuestions > 1000 || parsedTotalQuestions === 9208);

    if (!parsed) {
      return {
        ...INITIAL_COUNTERS,
        questions: {
          ...INITIAL_COUNTERS.questions,
          grade1: g1Baseline,
          grade2: g2Baseline,
          grade3: g3Baseline,
        }
      };
    }

    // Check date rollover: if last visit was not today, today's visit count should reset to 0
    let todayVisits = typeof parsed.visits?.today === 'number' ? parsed.visits.today : 0;
    if (parsed.visits?.lastVisitDate && parsed.visits.lastVisitDate !== today) {
      todayVisits = 0;
    }

    const qGrade1 = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: Math.max(parsed.questions?.grade1?.correct || 0, g1Baseline.correct),
      wrong: Math.max(parsed.questions?.grade1?.wrong || 0, g1Baseline.wrong)
    };

    const qGrade2 = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: Math.max(parsed.questions?.grade2?.correct || 0, g2Baseline.correct),
      wrong: Math.max(parsed.questions?.grade2?.wrong || 0, g2Baseline.wrong)
    };

    const qGrade3 = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: Math.max(parsed.questions?.grade3?.correct || 0, g3Baseline.correct),
      wrong: Math.max(parsed.questions?.grade3?.wrong || 0, g3Baseline.wrong)
    };

    const qGrade4 = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: parsed.questions?.grade4?.correct || 0,
      wrong: parsed.questions?.grade4?.wrong || 0
    };

    const qOther = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: parsed.questions?.otherGames?.correct || 0,
      wrong: parsed.questions?.otherGames?.wrong || 0
    };

    const qEnglish = shouldResetOlcaytoQuestions ? { correct: 0, wrong: 0 } : {
      correct: parsed.questions?.englishGames?.correct || 0,
      wrong: parsed.questions?.englishGames?.wrong || 0
    };

    const result: ClassCountersData = {
      version: 1,
      visits: {
        total: Math.max(parsed.visits?.total || 0, 0),
        today: Math.max(todayVisits, 0),
        lastVisitDate: parsed.visits?.lastVisitDate || '',
        lastVisitTime: parsed.visits?.lastVisitTime || '',
        firstVisitDate: parsed.visits?.firstVisitDate || '',
      },
      clicks: {
        grade1: parsed.clicks?.grade1 || 0,
        grade2: parsed.clicks?.grade2 || 0,
        grade3: parsed.clicks?.grade3 || 0,
        grade4: parsed.clicks?.grade4 || 0,
        otherGames: parsed.clicks?.otherGames || 0,
        englishGames: parsed.clicks?.englishGames || 0,
      },
      questions: {
        grade1: qGrade1,
        grade2: qGrade2,
        grade3: qGrade3,
        grade4: qGrade4,
        otherGames: qOther,
        englishGames: qEnglish,
      },
    };

    if (shouldResetOlcaytoQuestions) {
      saveCounters(result);
    }

    return result;
  } catch {
    return { ...INITIAL_COUNTERS };
  }
}

export function sanitizeCountersForUser(counters: ClassCountersData, userEmail?: string | null): ClassCountersData {
  if (!counters) return INITIAL_COUNTERS;
  const email = (userEmail || activeCounterEmail || '').trim().toLowerCase();
  const isOlcayto = email.includes('olcayto');
  if (isOlcayto) {
    let totalQuestions = 0;
    Object.values(counters.questions || {}).forEach((q: any) => {
      totalQuestions += (q?.correct || 0) + (q?.wrong || 0);
    });
    if (totalQuestions > 1000 || totalQuestions === 9208) {
      const cleaned: ClassCountersData = {
        ...counters,
        questions: {
          grade1: { correct: 0, wrong: 0 },
          grade2: { correct: 0, wrong: 0 },
          grade3: { correct: 0, wrong: 0 },
          grade4: { correct: 0, wrong: 0 },
          otherGames: { correct: 0, wrong: 0 },
          englishGames: { correct: 0, wrong: 0 },
        }
      };
      saveCounters(cleaned);
      return cleaned;
    }
  }
  return counters;
}

export function saveCounters(data: ClassCountersData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save counters', e);
  }
}

// Track page visit (increments total and today's visits)
export function recordSiteVisit(): ClassCountersData {
  const data = loadCounters();
  const today = getTodayString();
  const nowFormatted = getFormattedNow();

  // Check if this browser session already logged a visit
  const sessionLogged = sessionStorage.getItem(SESSION_FLAG_KEY);
  
  if (!sessionLogged) {
    data.visits.total = (data.visits.total || 0) + 1;
    if (data.visits.lastVisitDate === today) {
      data.visits.today = (data.visits.today || 0) + 1;
    } else {
      data.visits.today = 1;
      data.visits.lastVisitDate = today;
    }
    try {
      sessionStorage.setItem(SESSION_FLAG_KEY, '1');
    } catch {}
  }

  if (!data.visits.firstVisitDate) {
    data.visits.firstVisitDate = nowFormatted;
  }
  data.visits.lastVisitTime = nowFormatted;
  data.visits.lastVisitDate = today;

  saveCounters(data);
  return data;
}

export type GradeCategoryKey = 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'otherGames' | 'englishGames';

// Record click on grade or section
export function recordClassClick(category: GradeCategoryKey): ClassCountersData {
  const data = loadCounters();
  if (data.clicks[category] !== undefined) {
    data.clicks[category] = (data.clicks[category] || 0) + 1;
    saveCounters(data);
  }
  return data;
}

// Record question solved per grade/category
export function recordClassQuestionSolved(category: GradeCategoryKey, isCorrect: boolean): ClassCountersData {
  const data = loadCounters();
  if (data.questions[category]) {
    if (isCorrect) {
      data.questions[category].correct = (data.questions[category].correct || 0) + 1;
    } else {
      data.questions[category].wrong = (data.questions[category].wrong || 0) + 1;
    }
    saveCounters(data);
  }
  return data;
}

// Sync historical questions from mathGameStats_v1 if present and questions are currently unpopulated
export function syncHistoricalQuestions(
  statsData: Record<string, { dogru?: number; yanlis?: number }>,
  topics1Keys: string[],
  topics3Keys: string[],
  topics4Keys: string[]
): ClassCountersData {
  const data = loadCounters();
  
  // If already marked as synced or explicitly reset, do not re-sync
  try {
    if (localStorage.getItem('olcico_historical_synced') === 'true') {
      return data;
    }
  } catch {}

  // Calculate existing question count
  const existingCount = Object.values(data.questions).reduce(
    (acc, q) => acc + (q?.correct || 0) + (q?.wrong || 0),
    0
  );

  // If already populated, mark as synced and return as is
  if (existingCount > 0) {
    try {
      localStorage.setItem('olcico_historical_synced', 'true');
    } catch {}
    return data;
  }

  const entries = Object.entries(statsData || {});
  if (entries.length === 0) {
    try {
      localStorage.setItem('olcico_historical_synced', 'true');
    } catch {}
    return data;
  }

  const t1Set = new Set(topics1Keys);
  const t3Set = new Set(topics3Keys);
  const t4Set = new Set(topics4Keys);

  entries.forEach(([topicId, rec]) => {
    const c = rec?.dogru || 0;
    const w = rec?.yanlis || 0;
    if (c === 0 && w === 0) return;

    let targetKey: GradeCategoryKey = 'grade2';
    if (t1Set.has(topicId) || topicId.startsWith('g1_')) {
      targetKey = 'grade1';
    } else if (t3Set.has(topicId) || topicId.startsWith('g3_')) {
      targetKey = 'grade3';
    } else if (t4Set.has(topicId) || topicId.startsWith('g4_')) {
      targetKey = 'grade4';
    } else if (topicId.startsWith('ing_')) {
      targetKey = 'englishGames';
    } else if (['zit_anlam', 'es_anlam', 'xox_matematik', 'other_diger_oyunlar'].includes(topicId)) {
      targetKey = 'otherGames';
    } else {
      targetKey = 'grade2';
    }

    data.questions[targetKey].correct += c;
    data.questions[targetKey].wrong += w;
  });

  try {
    localStorage.setItem('olcico_historical_synced', 'true');
  } catch {}

  saveCounters(data);
  return data;
}

// Reset all counters
export function resetAllCounters(): ClassCountersData {
  const fresh: ClassCountersData = {
    ...INITIAL_COUNTERS,
    visits: {
      total: 1,
      today: 1,
      lastVisitDate: getTodayString(),
      lastVisitTime: getFormattedNow(),
      firstVisitDate: getFormattedNow(),
    },
  };
  saveCounters(fresh);

  try {
    // Explicitly mark historical sync as finished so old stats are NOT restored on reload
    localStorage.setItem('olcico_historical_synced', 'true');
    localStorage.removeItem('mathGameStats_v1');
    localStorage.removeItem('mathGameGroupStats_v1');
    localStorage.removeItem('mathGameStats');
  } catch {}

  return fresh;
}
