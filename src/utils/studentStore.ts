import { Student, AvatarOption } from '../types/student';

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'lion', emoji: '🦁', label: 'Cesur Aslan', bg: 'from-amber-500 to-yellow-600', border: 'border-amber-400' },
  { id: 'fox', emoji: '🦊', label: 'Akıllı Tilki', bg: 'from-orange-500 to-amber-600', border: 'border-orange-400' },
  { id: 'panda', emoji: '🐼', label: 'Sevimli Panda', bg: 'from-slate-600 to-slate-800', border: 'border-slate-300' },
  { id: 'rocket', emoji: '🚀', label: 'Uzay Kaptanı', bg: 'from-blue-600 to-indigo-700', border: 'border-blue-400' },
  { id: 'dino', emoji: '🦖', label: 'Minik Dino', bg: 'from-emerald-600 to-teal-700', border: 'border-emerald-400' },
  { id: 'unicorn', emoji: '🦄', label: 'Sihirli Pony', bg: 'from-pink-500 to-purple-600', border: 'border-pink-300' },
  { id: 'robot', emoji: '🤖', label: 'Süper Robot', bg: 'from-cyan-600 to-blue-700', border: 'border-cyan-400' },
  { id: 'owl', emoji: '🦉', label: 'Bilge Baykuş', bg: 'from-amber-700 to-stone-800', border: 'border-amber-500' },
  { id: 'tiger', emoji: '🐯', label: 'Hızlı Kaplan', bg: 'from-amber-600 to-orange-700', border: 'border-amber-400' },
  { id: 'rabbit', emoji: '🐰', label: 'Çevik Tavşan', bg: 'from-rose-400 to-pink-500', border: 'border-rose-300' },
  { id: 'dolphin', emoji: '🐬', label: 'Neşeli Yunus', bg: 'from-sky-500 to-blue-600', border: 'border-sky-300' },
  { id: 'koala', emoji: '🐨', label: 'Tatlı Koala', bg: 'from-stone-500 to-zinc-600', border: 'border-stone-300' },
  { id: 'soccer', emoji: '⚽', label: 'Yıldız Forvet', bg: 'from-emerald-500 to-green-700', border: 'border-emerald-300' },
  { id: 'artist', emoji: '🎨', label: 'Küçük Ressam', bg: 'from-fuchsia-500 to-purple-700', border: 'border-fuchsia-400' },
  { id: 'crown', emoji: '👑', label: 'Prens / Prenses', bg: 'from-yellow-400 to-amber-600', border: 'border-yellow-300' },
  { id: 'lightning', emoji: '⚡', label: 'Şimşek Çocuk', bg: 'from-yellow-500 to-orange-600', border: 'border-yellow-400' },
  { id: 'star', emoji: '🌟', label: 'Parlak Yıldız', bg: 'from-amber-300 to-yellow-500', border: 'border-yellow-200' },
  { id: 'cat', emoji: '🐱', label: 'Yaramaz Kedi', bg: 'from-orange-400 to-rose-500', border: 'border-orange-300' },
  { id: 'dog', emoji: '🐶', label: 'Sadık Dost', bg: 'from-amber-600 to-yellow-700', border: 'border-amber-400' },
  { id: 'trophy', emoji: '🏆', label: 'Şampiyon', bg: 'from-yellow-500 to-amber-700', border: 'border-yellow-400' },
  { id: 'bee', emoji: '🐝', label: 'Çalışkan Arı', bg: 'from-amber-400 to-yellow-600', border: 'border-amber-300' },
  { id: 'bear', emoji: '🐻', label: 'Güçlü Ayı', bg: 'from-amber-800 to-stone-900', border: 'border-amber-600' },
  { id: 'monkey', emoji: '🐵', label: 'Eğlenceli Maymun', bg: 'from-yellow-700 to-amber-900', border: 'border-yellow-500' },
  { id: 'penguin', emoji: '🐧', label: 'Kutup Pengueni', bg: 'from-slate-700 to-cyan-900', border: 'border-cyan-300' }
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std_1', name: 'Ali Yılmaz', avatar: '🦁', avatarBg: 'from-amber-500 to-yellow-600', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_2', name: 'Ayşe Kaya', avatar: '🦊', avatarBg: 'from-orange-500 to-amber-600', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_3', name: 'Mehmet Demir', avatar: '🚀', avatarBg: 'from-blue-600 to-indigo-700', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_4', name: 'Zeynep Çelik', avatar: '🦄', avatarBg: 'from-pink-500 to-purple-600', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_5', name: 'Can Öztürk', avatar: '🦖', avatarBg: 'from-emerald-600 to-teal-700', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_6', name: 'Elif Şahin', avatar: '🌟', avatarBg: 'from-amber-300 to-yellow-500', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_7', name: 'Burak Yıldız', avatar: '🤖', avatarBg: 'from-cyan-600 to-blue-700', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_8', name: 'Deniz Aydın', avatar: '🐬', avatarBg: 'from-sky-500 to-blue-600', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_9', name: 'Ece Koç', avatar: '🐰', avatarBg: 'from-rose-400 to-pink-500', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_10', name: 'Mert Aksoy', avatar: '⚽', avatarBg: 'from-emerald-500 to-green-700', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_11', name: 'Selin Arslan', avatar: '🎨', avatarBg: 'from-fuchsia-500 to-purple-700', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() },
  { id: 'std_12', name: 'Kaan Polat', avatar: '⚡', avatarBg: 'from-yellow-500 to-orange-600', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: new Date().toISOString() }
];

const STORAGE_KEY = 'classroom_students_v1';
const INITIALIZED_KEY = 'classroom_students_init_v1';
export const SELECTED_STUDENTS_STORAGE_KEY = 'classroom_selected_students_v1';

/**
 * Loads students from localStorage.
 * If the user has explicitly emptied the roster, preserves the empty roster [].
 * Seeds DEFAULT_STUDENTS ONLY on the very first time the application is ever opened.
 */
export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // First time EVER visit: seed default students
    if (!isInitialized) {
      saveStudents(DEFAULT_STUDENTS);
      return DEFAULT_STUDENTS;
    }

    return [];
  } catch (err) {
    console.error('Error loading students from localStorage:', err);
    return DEFAULT_STUDENTS;
  }
}

/**
 * Saves students to localStorage with initialization flag so empty rosters persist
 */
export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students to localStorage:', err);
  }
}

/**
 * Loads selected player student IDs for the 2/3 player dock
 */
export function loadSelectedStudentIds(): (string | null)[] {
  try {
    const raw = localStorage.getItem(SELECTED_STUDENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return [parsed[0] || null, parsed[1] || null, parsed[2] || null];
      }
    }
  } catch {}
  return [null, null, null];
}

/**
 * Saves selected player student IDs to localStorage so they persist on page refresh
 */
export function saveSelectedStudentIds(ids: (string | null)[]): void {
  try {
    localStorage.setItem(SELECTED_STUDENTS_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

/**
 * Helper to capitalize Turkish names properly
 */
function toTurkishTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      const first = word.charAt(0).toLocaleUpperCase('tr');
      const rest = word.slice(1).toLocaleLowerCase('tr');
      return first + rest;
    })
    .join(' ');
}

/**
 * Advanced parser for multiline, Excel copy-paste, e-Okul exports, or comma-separated lists
 */
export function importStudentsFromText(
  rawText: string,
  existingStudents: Student[] = [],
  replaceMode = false,
  targetClass = ''
): Student[] {
  if (!rawText.trim()) return existingStudents;

  // Split lines
  let lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  // If user pasted a single line with commas or semicolons
  if (lines.length === 1 && (lines[0].includes(',') || lines[0].includes(';'))) {
    lines = lines[0].split(/[,;]/).map(l => l.trim()).filter(l => l.length > 0);
  }

  if (lines.length === 0) return existingStudents;

  const startingStudents = replaceMode ? [] : [...existingStudents];
  const existingMap = new Map<string, Student>();
  startingStudents.forEach(s => existingMap.set(s.name.toLocaleLowerCase('tr'), s));

  const result: Student[] = [...startingStudents];

  lines.forEach((line, idx) => {
    let candidate = line;

    // Handle Excel tab-separated columns (e.g., "1 \t Ahmet Yılmaz \t Erkek")
    if (candidate.includes('\t')) {
      const cols = candidate.split('\t').map(c => c.trim()).filter(Boolean);
      // Pick the first column that has alphabetic characters (not just a student number like "105")
      const textCol = cols.find(c => /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(c));
      if (textCol) {
        candidate = textCol;
      }
    }

    // Handle e-Okul "SOYAD, AD" format (e.g. "KAYA, AYŞE" -> "Ayşe Kaya")
    if (candidate.includes(',')) {
      const parts = candidate.split(',').map(p => p.trim());
      if (parts.length === 2 && parts[0].length >= 2 && parts[1].length >= 2) {
        candidate = `${parts[1]} ${parts[0]}`;
      }
    }

    // Strip leading numbers: "1. Ahmet", "02- Mehmet", "3) Ayşe", "4 : Ali", "#5 Fatma"
    candidate = candidate.replace(/^[\d\s.\-):#]+/i, '');
    // Strip trailing student numbers like "Ahmet Yılmaz 412"
    candidate = candidate.replace(/\s+\d+$/i, '');
    candidate = candidate.trim();

    if (!candidate || candidate.length < 2) return;

    // Capitalize cleanly
    const formattedName = toTurkishTitleCase(candidate);
    const lower = formattedName.toLocaleLowerCase('tr');

    if (existingMap.has(lower)) {
      // Already in list, skip duplicate
      return;
    }

    const avatarOpt = AVATAR_OPTIONS[(result.length + idx) % AVATAR_OPTIONS.length];
    const newStudent: Student = {
      id: `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: formattedName,
      avatar: avatarOpt.emoji,
      avatarBg: avatarOpt.bg,
      className: targetClass.trim() || undefined,
      totalCorrect: 0,
      totalWrong: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      topicStats: {},
      createdAt: new Date().toISOString()
    };

    result.push(newStudent);
    existingMap.set(lower, newStudent);
  });

  saveStudents(result);
  return result;
}

/**
 * Resets the entire roster to empty [] without resurrecting default students
 */
export function clearAllStudents(): Student[] {
  saveStudents([]);
  return [];
}

/**
 * Restores the 12 fun sample students
 */
export function restoreDefaultStudents(): Student[] {
  saveStudents(DEFAULT_STUDENTS);
  return DEFAULT_STUDENTS;
}

export function recordStudentAnswer(
  studentId: string,
  topicKey: string,
  isCorrect: boolean
): Student[] {
  const students = loadStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  const student = students[idx];
  const now = new Date().toISOString();
  const currentTopicStat = student.topicStats[topicKey] || { correct: 0, wrong: 0 };

  const updatedStudent: Student = {
    ...student,
    totalCorrect: student.totalCorrect + (isCorrect ? 1 : 0),
    totalWrong: student.totalWrong + (isCorrect ? 0 : 1),
    topicStats: {
      ...student.topicStats,
      [topicKey]: {
        correct: currentTopicStat.correct + (isCorrect ? 1 : 0),
        wrong: currentTopicStat.wrong + (isCorrect ? 0 : 1),
        lastPlayed: now
      }
    }
  };

  students[idx] = updatedStudent;
  saveStudents(students);
  return students;
}

export function recordStudentGameResult(
  studentId: string,
  won: boolean
): Student[] {
  const students = loadStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  const student = students[idx];
  students[idx] = {
    ...student,
    gamesPlayed: student.gamesPlayed + 1,
    gamesWon: student.gamesWon + (won ? 1 : 0)
  };

  saveStudents(students);
  return students;
}

export function resetAllStudentStats(): Student[] {
  const students = loadStudents();
  const reset = students.map(s => ({
    ...s,
    totalCorrect: 0,
    totalWrong: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    topicStats: {}
  }));
  saveStudents(reset);
  return reset;
}

export function resetSingleStudentStat(studentId: string): Student[] {
  const students = loadStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  students[idx] = {
    ...students[idx],
    totalCorrect: 0,
    totalWrong: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    topicStats: {}
  };
  saveStudents(students);
  return students;
}

export function exportStudentsToCSV(students: Student[]): string {
  const headers = ['Öğrenci Adı', 'Avatar', 'Toplam Doğru', 'Toplam Yanlış', 'Başarı Yüzdesi (%)', 'Oynanan Oyun', 'Galibiyet'];
  const rows = students.map(s => {
    const total = s.totalCorrect + s.totalWrong;
    const rate = total > 0 ? Math.round((s.totalCorrect / total) * 100) : 0;
    return [
      `"${s.name}"`,
      `"${s.avatar}"`,
      s.totalCorrect,
      s.totalWrong,
      rate,
      s.gamesPlayed,
      s.gamesWon
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
