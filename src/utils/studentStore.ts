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

import { OLCAYTO_2C_STUDENTS } from '../data/olcayto2cStudents';
import { MUSHAT_EMAIL, MUSHAT_3C_STUDENTS } from '../data/mushat3cStudents';
import { BANU_EMAIL, BANU_2A_STUDENTS } from '../data/banu2aStudents';

export const OLCAYTO_EMAIL = 'olcaytohokul@gmail.com';
export const MERTHAYAT_EMAIL = 'merthayat8004@gmail.com';
export { MUSHAT_EMAIL, BANU_EMAIL };

// 23 ÖĞRENCİLİK 2-C SINIFI LİSTESİ (olcaytohokul@gmail.com ve merthayat8004@gmail.com HESABINA AİT GERÇEK SINIF VE İSTATİSTİKLER)
export { OLCAYTO_2C_STUDENTS, MUSHAT_3C_STUDENTS, BANU_2A_STUDENTS };
export const OLCAYTO_2A_STUDENTS: Student[] = OLCAYTO_2C_STUDENTS;

export const OLCAYTO_2A_NAMES_SET = new Set(
  OLCAYTO_2A_STUDENTS.map(s => s.name.trim().toLocaleLowerCase('tr'))
);

export function isOlcaytoUser(userEmail?: string | null): boolean {
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  return (
    email === OLCAYTO_EMAIL || 
    email === MERTHAYAT_EMAIL || 
    email.includes('olcayto') || 
    email.includes('merthayat')
  );
}

export function isMushatUser(userEmail?: string | null): boolean {
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  return email === MUSHAT_EMAIL;
}

export function isBanuUser(userEmail?: string | null): boolean {
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  return email === BANU_EMAIL;
}

// GENEL KULLANICILAR VE MİSAFİRLER İÇİN TEMİZ ÖRNEK ŞABLON (Deneme ve misafir girişlerinde boş liste)
export const DEFAULT_STUDENTS: Student[] = [];

/**
 * Sınıfı bir üst veya başka bir seviyeye taşıma (Sene sonu sınıf aktarımı)
 */
export interface PromoteOptions {
  fromGrade: number;
  toGrade: number;
  newClassName: string;
  fromClassName?: string;
  resetStats?: boolean;
}

export function promoteStudentsGrade(
  students: Student[],
  options: PromoteOptions,
  userId?: string | null
): Student[] {
  const { fromGrade, toGrade, newClassName, fromClassName, resetStats = true } = options;
  const uid = userId !== undefined ? userId : currentStoreUserId;

  const updated = students.map(s => {
    const matchGrade = s.grade === fromGrade;
    const matchBranch = !fromClassName || fromClassName === 'ALL' || s.className === fromClassName;

    if (matchGrade && matchBranch) {
      let targetClass = (newClassName || '').trim();
      if (!targetClass) {
        // Otomatik hesaplama: 2-B -> 3-B, 2-C -> 3-C, 1-A -> 2-A
        const branchPart = s.className ? s.className.replace(/^[0-9]+[/-]?/, '') : 'A';
        targetClass = `${toGrade}-${branchPart || 'A'}`;
      }

      return {
        ...s,
        grade: toGrade,
        className: targetClass,
        totalCorrect: resetStats ? 0 : (s.totalCorrect || 0),
        totalWrong: resetStats ? 0 : (s.totalWrong || 0),
        gamesPlayed: resetStats ? 0 : (s.gamesPlayed || 0),
        gamesWon: resetStats ? 0 : (s.gamesWon || 0),
        topicStats: resetStats ? {} : (s.topicStats || {})
      };
    }
    return s;
  });

  saveStudents(updated, uid);
  return updated;
}

/**
 * Kullanıcı e-postasına göre başlangıç öğrenci listesini belirler.
 * olcaytohokul@gmail.com için 23 kişilik gerçek sınıf listesi (2-C),
 * mushat29.mk@gmail.com için 23 kişilik gerçek sınıf listesi (3/C),
 * banuhyt@gmail.com için 23 kişilik gerçek sınıf listesi (2-B),
 * Mail girişi olmayan veya kayıtlı listesi bulunmayan kullanıcılar için BOŞ ([]) sınıf listesi verilir.
 */
export function getDefaultStudentsForUser(userEmail?: string | null): Student[] {
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  if (isOlcaytoUser(email)) {
    return [...OLCAYTO_2C_STUDENTS];
  }
  if (isMushatUser(email)) {
    return [...MUSHAT_3C_STUDENTS];
  }
  if (isBanuUser(email)) {
    const banu2b = BANU_2A_STUDENTS.map(s => ({
      ...s,
      className: '2-B'
    }));
    return [...banu2b];
  }
  return [];
}


/**
 * Kullanıcıya göre öğrenci verilerini korur ve izole eder.
 * Her öğretmenin sınıfı, şubesi ve istatistikleri kendi hesabına aittir.
 */
export function sanitizeStudentsForUser(
  students: Student[] = [],
  userEmail?: string | null
): Student[] {
  const effectiveEmail = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  if (!Array.isArray(students)) {
    return getDefaultStudentsForUser(effectiveEmail);
  }

  // Deduplicate and ensure clean student objects with all required fields
  return deduplicateStudents(students, effectiveEmail);
}

const STORAGE_KEY = 'classroom_students_v1';
const INITIALIZED_KEY = 'classroom_students_init_v1';
export const SELECTED_STUDENTS_STORAGE_KEY = 'classroom_selected_students_v1';
export const SELECTED_STUDENTS_BY_GRADE_KEY = 'classroom_selected_students_by_grade_v1';

let currentStoreUserId: string | null = null;
let currentStoreUserEmail: string | null = null;

/**
 * Sets the active user id and email in studentStore so all load/save operations
 * automatically target this user's private roster.
 */
export function setActiveStoreUser(userId: string | null, userEmail?: string | null): void {
  currentStoreUserId = userId;
  currentStoreUserEmail = userEmail ? userEmail.trim().toLowerCase() : null;
}

export function setActiveStoreUserId(userId: string | null): void {
  currentStoreUserId = userId;
}

export function getActiveStoreUserId(): string | null {
  return currentStoreUserId;
}

export function getActiveStoreUserEmail(): string | null {
  return currentStoreUserEmail;
}

export function getStudentsStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  return uid ? `classroom_students_user_${uid}` : 'classroom_students_guest_v1';
}

export function getStudentsInitKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  return uid ? `classroom_students_init_${uid}` : 'classroom_students_init_guest_v1';
}

/**
 * Calculates total questions solved across all students in a roster
 */
export function calculateStudentListTotalSolved(list: Student[]): number {
  if (!Array.isArray(list) || list.length === 0) return 0;
  return list.reduce((sum, s) => {
    const directTotal = (s.totalCorrect || 0) + (s.totalWrong || 0);
    let topicTotal = 0;
    if (s.topicStats) {
      Object.values(s.topicStats).forEach(ts => {
        topicTotal += (ts.correct || 0) + (ts.wrong || 0);
      });
    }
    return sum + Math.max(directTotal, topicTotal);
  }, 0);
}

export function normalizeStudentName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

const OLCAYTO_FULL_NAME_BY_ID: Record<string, string> = {
  'std_g2_1': 'Aybüke Yaylak',
  'std_g2_2': 'Betül Sare Topkara',
  'std_g2_3': 'Buğlem Can',
  'std_g2_4': 'Çınar Eymen Karaca',
  'std_g2_5': 'Derin Defne Gökhan',
  'std_g2_6': 'Efekan Yörükoğlu',
  'std_g2_7': 'Elif Su Tekin',
  'std_g2_8': 'Eslem Deri',
  'std_g2_9': 'Eymen Toprak',
  'std_g2_10': 'Güneş Karadoğan',
  'std_g2_11': 'Hatice Kübra Demir',
  'std_g2_12': 'Harun Ali Gökcan',
  'std_g2_13': 'Harun Yıldırım',
  'std_g2_14': 'Miraç Kütük',
  'std_g2_15': 'Muhammed E. Çetin',
  'std_g2_16': 'Osman Emir Öztürk',
  'std_g2_17': 'Ömer Asaf Tekin',
  'std_g2_18': 'Ömer Faruk Öcel',
  'std_g2_19': 'Ravza Fidan',
  'std_g2_20': 'Sudem Can',
  'std_g2_21': 'Umut Kılıç',
  'std_g2_22': 'Zeynep Koç',
  'std_g2_23': 'Zilan Demir'
};

const OLCAYTO_FULL_NAME_BY_FIRSTNAME: Record<string, string> = {
  // Spaceless normalized keys (from normalizeStudentName)
  'aybuke': 'Aybüke Yaylak',
  'aybukeyaylak': 'Aybüke Yaylak',
  'betulsare': 'Betül Sare Topkara',
  'betul': 'Betül Sare Topkara',
  'betulsaretopkara': 'Betül Sare Topkara',
  'buglem': 'Buğlem Can',
  'buglemcan': 'Buğlem Can',
  'cinareymen': 'Çınar Eymen Karaca',
  'cinar': 'Çınar Eymen Karaca',
  'cinareymenkaraca': 'Çınar Eymen Karaca',
  'derindefne': 'Derin Defne Gökhan',
  'derin': 'Derin Defne Gökhan',
  'derindefnegokhan': 'Derin Defne Gökhan',
  'efekan': 'Efekan Yörükoğlu',
  'efekanyorukoglu': 'Efekan Yörükoğlu',
  'elifsu': 'Elif Su Tekin',
  'elif': 'Elif Su Tekin',
  'elifsutekin': 'Elif Su Tekin',
  'eslem': 'Eslem Deri',
  'eslemderi': 'Eslem Deri',
  'eymen': 'Eymen Toprak',
  'eymentoprak': 'Eymen Toprak',
  'gunes': 'Güneş Karadoğan',
  'guneskaradogan': 'Güneş Karadoğan',
  'haticekubra': 'Hatice Kübra',
  'hatice': 'Hatice Kübra',
  'harunali': 'Harun Ali Gökcan',
  'harunaligokcan': 'Harun Ali Gökcan',
  'harun': 'Harun Yıldırım',
  'harunyildirim': 'Harun Yıldırım',
  'mirac': 'Miraç Kütük',
  'mirackutuk': 'Miraç Kütük',
  'muhammedeymen': 'Muhammed E. Çetin',
  'muhammedecetin': 'Muhammed E. Çetin',
  'muhammed': 'Muhammed E. Çetin',
  'osmanemir': 'Osman Emir Öztürk',
  'osman': 'Osman Emir Öztürk',
  'osmanemirozturk': 'Osman Emir Öztürk',
  'omerasaf': 'Ömer Asaf Tekin',
  'omerasaftekin': 'Ömer Asaf Tekin',
  'omerfaruk': 'Ömer Faruk Öcel',
  'omerfarukocel': 'Ömer Faruk Öcel',
  'oykuliya': 'Hatice Kübra',
  'ravza': 'Ravza Fidan',
  'ravzafidan': 'Ravza Fidan',
  'sudem': 'Sudem Can',
  'sudemcan': 'Sudem Can',
  'umut': 'Umut Kılıç',
  'umutkilic': 'Umut Kılıç',
  'zeynep': 'Zeynep Koç',
  'zeynepkoc': 'Zeynep Koç',
  'zilan': 'Zilan Demir',
  'zilandemir': 'Zilan Demir',

  // Raw spaced keys as backup
  'aybuke yaylak': 'Aybüke Yaylak',
  'betul sare': 'Betül Sare Topkara',
  'betul sare topkara': 'Betül Sare Topkara',
  'buglem can': 'Buğlem Can',
  'cinar eymen': 'Çınar Eymen Karaca',
  'cinar eymen karaca': 'Çınar Eymen Karaca',
  'derin defne': 'Derin Defne Gökhan',
  'derin defne gokhan': 'Derin Defne Gökhan',
  'efekan yorukoglu': 'Efekan Yörükoğlu',
  'elif su': 'Elif Su Tekin',
  'elif su tekin': 'Elif Su Tekin',
  'eslem deri': 'Eslem Deri',
  'eymen toprak': 'Eymen Toprak',
  'gunes karadogan': 'Güneş Karadoğan',
  'hatice kubra': 'Hatice Kübra',
  'harun ali': 'Harun Ali Gökcan',
  'harun ali gokcan': 'Harun Ali Gökcan',
  'harun yildirim': 'Harun Yıldırım',
  'mirac kutuk': 'Miraç Kütük',
  'muhammed eymen': 'Muhammed E. Çetin',
  'muhammed e. cetin': 'Muhammed E. Çetin',
  'muhammed e cetin': 'Muhammed E. Çetin',
  'osman emir': 'Osman Emir Öztürk',
  'osman emir ozturk': 'Osman Emir Öztürk',
  'omer asaf': 'Ömer Asaf Tekin',
  'omer asaf tekin': 'Ömer Asaf Tekin',
  'omer faruk': 'Ömer Faruk Öcel',
  'omer faruk ocel': 'Ömer Faruk Öcel',
  'oyku liya': 'Hatice Kübra',
  'ravza fidan': 'Ravza Fidan',
  'sudem can': 'Sudem Can',
  'umut kilic': 'Umut Kılıç',
  'zeynep koc': 'Zeynep Koç',
  'zilan demir': 'Zilan Demir'
};

/**
 * 23 kişilik sınıf listesindeki öğrencilere 2. isim ve soyadlarını otomatik ekler.
 * Mevcut çözülen soru ve oyun istatistiklerini kesinlikle sıfırlamadan korur.
 */
export function upgradeOlcaytoStudentNames(students: Student[], userEmail?: string | null): Student[] {
  if (!Array.isArray(students) || students.length === 0) return [];
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  const isOlcayto = isOlcaytoUser(email);
  const isBanu = isBanuUser(email);

  return students.map(s => {
    if (!s || !s.name) return s;

    // Check by ID first (std_g2_1 .. std_g2_23)
    let newFullName: string | null = (s.id && OLCAYTO_FULL_NAME_BY_ID[s.id]) ? OLCAYTO_FULL_NAME_BY_ID[s.id] : null;

    if (!newFullName) {
      // Check by normalized name (without spaces or accents)
      const norm = normalizeStudentName(s.name);
      newFullName = OLCAYTO_FULL_NAME_BY_FIRSTNAME[norm] || null;
    }

    if (!newFullName) {
      // Check raw lowercase trimmed
      const rawLower = s.name.trim().toLowerCase();
      newFullName = OLCAYTO_FULL_NAME_BY_FIRSTNAME[rawLower] || null;
    }

    if (newFullName) {
      let preferredClass = s.className;
      if (isOlcayto) {
        preferredClass = '2-C';
      } else if (isBanu) {
        preferredClass = (preferredClass === '2-A' || !preferredClass) ? '2-B' : preferredClass;
      } else if (!preferredClass) {
        preferredClass = '2-C';
      }
      return {
        ...s,
        name: newFullName,
        className: preferredClass,
        grade: 2
      };
    }
    return s;
  });
}

/**
 * Deduplicates any student array so each student (by grade + normalized name) appears exactly once.
 * Merges duplicate records preserving the highest statistics, won games, and topic details.
 */
export function deduplicateStudents(students: Student[] = [], userEmail?: string | null): Student[] {
  if (!Array.isArray(students) || students.length === 0) return [];
  const effectiveEmail = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();

  // Always upgrade Olcayto's 23 students so 2nd names and surnames are guaranteed
  const preparedStudents = upgradeOlcaytoStudentNames(students, effectiveEmail);

  const map = new Map<string, Student>();
  const order: string[] = [];

  for (const s of preparedStudents) {
    if (!s || !s.name || typeof s.name !== 'string' || !s.name.trim()) continue;
    const grade = (s.grade && [1, 2, 3, 4].includes(Number(s.grade))) ? Number(s.grade) : 2;
    const normKey = `${grade}__${normalizeStudentName(s.name)}`;

    if (map.has(normKey)) {
      const existing = map.get(normKey)!;
      const mergedTopicStats = { ...(existing.topicStats || {}) };

      if (s.topicStats) {
        Object.entries(s.topicStats).forEach(([topKey, inStat]) => {
          const curStat = mergedTopicStats[topKey];
          if (!curStat) {
            mergedTopicStats[topKey] = { ...inStat };
          } else {
            mergedTopicStats[topKey] = {
              correct: Math.max(curStat.correct || 0, inStat.correct || 0),
              wrong: Math.max(curStat.wrong || 0, inStat.wrong || 0),
              lastPlayed: inStat.lastPlayed || curStat.lastPlayed || new Date().toISOString()
            };
          }
        });
      }

      const preferredId = (existing.id && existing.id.startsWith('std_g2_')) 
        ? existing.id 
        : (s.id && s.id.startsWith('std_g2_')) 
        ? s.id 
        : (existing.id || s.id);

      let preferredClassName = existing.className || s.className;
      if (grade === 2 && isOlcaytoUser(effectiveEmail)) {
        preferredClassName = '2-C';
      } else if (grade === 2 && isBanuUser(effectiveEmail)) {
        preferredClassName = (preferredClassName === '2-A' || !preferredClassName) ? '2-B' : preferredClassName;
      } else if (grade === 3 && isMushatUser(effectiveEmail)) {
        preferredClassName = '3/C';
      } else if (!preferredClassName) {
        preferredClassName = `${grade}-A`;
      }

      const cleanName = existing.name || s.name;

      const merged: Student = {
        ...existing,
        id: preferredId,
        name: cleanName,
        avatar: existing.avatar || s.avatar,
        avatarBg: existing.avatarBg || s.avatarBg,
        grade,
        className: preferredClassName,
        totalCorrect: Math.max(existing.totalCorrect || 0, s.totalCorrect || 0),
        totalWrong: Math.max(existing.totalWrong || 0, s.totalWrong || 0),
        gamesPlayed: Math.max(existing.gamesPlayed || 0, s.gamesPlayed || 0),
        gamesWon: Math.max(existing.gamesWon || 0, s.gamesWon || 0),
        topicStats: mergedTopicStats,
        createdAt: existing.createdAt || s.createdAt || new Date().toISOString()
      };

      map.set(normKey, merged);
    } else {
      let finalClass = s.className;
      if (grade === 2 && isOlcaytoUser(effectiveEmail)) {
        finalClass = '2-C';
      } else if (grade === 2 && isBanuUser(effectiveEmail)) {
        finalClass = (finalClass === '2-A' || !finalClass) ? '2-B' : finalClass;
      } else if (grade === 3 && isMushatUser(effectiveEmail)) {
        finalClass = '3/C';
      } else if (!finalClass) {
        finalClass = `${grade}-A`;
      }

      map.set(normKey, {
        ...s,
        grade,
        className: finalClass
      });
      order.push(normKey);
    }
  }

  return order.map(k => map.get(k)!);
}

/**
 * Intelligently merges two student lists, ALWAYS keeping the highest question counts,
 * highest topic stats, won games, and custom student names. Never resets existing stats,
 * and guarantees NO DUPLICATES.
 */
export function mergeStudentLists(
  currentList: Student[] = [],
  incomingList: Student[] = [],
  userEmail?: string | null
): Student[] {
  const combined = [
    ...(Array.isArray(currentList) ? currentList : []),
    ...(Array.isArray(incomingList) ? incomingList : [])
  ];
  return deduplicateStudents(combined, userEmail);
}

/**
 * Checks if a student list is merely an unplayed sample default list.
 * Returns false if ANY question was answered OR if custom names were entered.
 */
export function isDefaultSampleList(list: Student[]): boolean {
  if (!Array.isArray(list) || list.length === 0) return true;
  const hasSolved = list.some(s => (s.totalCorrect || 0) > 0 || (s.totalWrong || 0) > 0 || (s.gamesPlayed || 0) > 0);
  if (hasSolved) return false;

  // Check if names differ from standard default sets
  const defaultNames = new Set(DEFAULT_STUDENTS.map(s => s.name.trim().toLowerCase()));
  defaultNames.add('ali yılmaz');
  defaultNames.add('ayşe kaya');
  defaultNames.add('mehmet demir');

  // If at least one student is NOT in the default demo set, user has customized their roster!
  const hasCustomName = list.some(s => s.name && !defaultNames.has(s.name.trim().toLowerCase()));
  return !hasCustomName;
}

export const MULTI_USER_VAULT_KEY = 'olcico_multi_user_vault_v2';

export interface VaultUserRecord {
  identifier: string; // uid or clean email
  userEmail?: string;
  userId?: string;
  students: Student[];
  totalSolved: number;
  lastUpdated: string;
}

/**
 * Saves a user's roster snapshot into the permanent multi-user vault in localStorage.
 * Automatically merges with existing vault data so records are never lost or downgraded.
 */
export function saveToMultiUserVault(
  identifier: string,
  students: Student[],
  meta?: { userId?: string; userEmail?: string }
): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    if (!identifier || !Array.isArray(students)) return;
    const cleanId = identifier.trim().toLowerCase();
    const raw = localStorage.getItem(MULTI_USER_VAULT_KEY);
    const vault: Record<string, VaultUserRecord> = raw ? JSON.parse(raw) : {};

    const existingRecord = vault[cleanId];
    const totalSolved = calculateStudentListTotalSolved(students);

    vault[cleanId] = {
      identifier: cleanId,
      userId: meta?.userId || existingRecord?.userId,
      userEmail: meta?.userEmail || existingRecord?.userEmail || (cleanId.includes('@') ? cleanId : undefined),
      students,
      totalSolved,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(MULTI_USER_VAULT_KEY, JSON.stringify(vault));
  } catch (err) {
    console.error('Error saving to multi-user vault:', err);
  }
}

/**
 * Loads a user's snapshot from the permanent multi-user vault
 */
export function loadFromMultiUserVault(identifier: string): Student[] | null {
  try {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const raw = localStorage.getItem(MULTI_USER_VAULT_KEY);
    if (!raw) return null;
    const vault: Record<string, VaultUserRecord> = JSON.parse(raw);
    const record = vault[cleanId];
    // An explicitly saved empty roster is meaningful: it records that the
    // teacher removed every student, so do not treat it as a missing backup.
    return record && Array.isArray(record.students) ? record.students : null;
  } catch {
    return null;
  }
}

/**
 * Gets all saved user accounts from the permanent multi-user vault
 */
export function getAllUsersFromVault(): VaultUserRecord[] {
  try {
    const raw = localStorage.getItem(MULTI_USER_VAULT_KEY);
    if (!raw) return [];
    const vault: Record<string, VaultUserRecord> = JSON.parse(raw);
    return Object.values(vault);
  } catch {
    return [];
  }
}

/**
 * Searches localStorage slots strictly belonging to the active user/email
 * for custom student lists with solved questions, intelligently merging data.
 * Cross-user data leakage is strictly forbidden: Olcayto's classroom is never
 * merged into other teachers' accounts.
 */
export function recoverLegacyOrBackupStudents(
  userId?: string | null,
  userEmail?: string | null
): Student[] | null {
  try {
    let bestMerged: Student[] = [];
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : currentStoreUserEmail;
    const isOlcayto = isOlcaytoUser(cleanEmail);

    // 1. Merge from vault for this user only
    if (userId) {
      const fromVaultUid = loadFromMultiUserVault(userId);
      if (fromVaultUid && fromVaultUid.length === 0) return [];
      if (fromVaultUid && fromVaultUid.length > 0) {
        bestMerged = mergeStudentLists(bestMerged, fromVaultUid);
      }
    }
    if (cleanEmail) {
      const fromVaultEmail = loadFromMultiUserVault(cleanEmail);
      if (fromVaultEmail && fromVaultEmail.length === 0) return [];
      if (fromVaultEmail && fromVaultEmail.length > 0) {
        bestMerged = mergeStudentLists(bestMerged, fromVaultEmail);
      }
    }

    // Check vault records specifically matching this user's email or userId
    if (cleanEmail || userId) {
      const allVaultRecords = getAllUsersFromVault();
      for (const rec of allVaultRecords) {
        const matchesEmail = cleanEmail && rec.userEmail && rec.userEmail.trim().toLowerCase() === cleanEmail;
        const matchesUid = userId && rec.userId === userId;
        if (matchesEmail || matchesUid) {
          bestMerged = mergeStudentLists(bestMerged, rec.students);
        }
      }
    }

    // 2. Collect candidate keys to check strictly for this user
    const keysToCheck: string[] = [];

    if (userId) {
      keysToCheck.push(`classroom_students_backup_${userId}`);
      keysToCheck.push(`classroom_students_user_${userId}`);
    }

    if (cleanEmail) {
      keysToCheck.push(`classroom_students_backup_${cleanEmail}`);
      keysToCheck.push(`classroom_students_user_${cleanEmail}`);
      keysToCheck.push(`classroom_students_${cleanEmail}`);
    }

    // Scan localStorage keys strictly belonging to this user
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !keysToCheck.includes(k)) {
        const lowerK = k.toLowerCase();
        if (cleanEmail && lowerK.includes(cleanEmail)) {
          keysToCheck.push(k);
        } else if (userId && lowerK.includes(userId.toLowerCase())) {
          keysToCheck.push(k);
        }
      }
    }

    // 3. Legacy and guest slots are ONLY checked if the user is Olcayto or a guest with no user ID
    if (isOlcayto || (!userId && !cleanEmail)) {
      keysToCheck.push(
        'classroom_students_backup_v1',
        STORAGE_KEY,
        'classroom_students_guest_v1'
      );
    }

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: Student[] = parsed.map((s: any) => ({
            ...s,
            grade: (s.grade && [1, 2, 3, 4].includes(Number(s.grade))) ? Number(s.grade) : 2
          }));

          const solved = calculateStudentListTotalSolved(mapped);
          if (!isDefaultSampleList(mapped) || solved > 0) {
            bestMerged = mergeStudentLists(bestMerged, mapped);
          }
        }
      } catch {}
    }

    // Sanitize to guarantee non-Olcayto users never inherit Olcayto's 23 students
    bestMerged = sanitizeStudentsForUser(bestMerged, cleanEmail);

    const totalSolved = calculateStudentListTotalSolved(bestMerged);
    if (bestMerged.length > 0 && (!isDefaultSampleList(bestMerged) || totalSolved > 0)) {
      const uid = userId !== undefined ? userId : currentStoreUserId;
      if (uid) {
        saveStudents(bestMerged, uid);
        saveToMultiUserVault(uid, bestMerged, { userId: uid, userEmail: cleanEmail || undefined });
      }
      if (cleanEmail) {
        saveToMultiUserVault(cleanEmail, bestMerged, { userId: uid || undefined, userEmail: cleanEmail });
      }
      return bestMerged;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Loads students from localStorage scoped to active user or specified userId and userEmail.
 * Ensures every student is assigned to their proper grade (1, 2, 3, 4).
 * Enforces strict user isolation: Olcayto's 23 students belong only to olcaytohokul@gmail.com.
 */
export function loadStudents(userId?: string | null, userEmail?: string | null): Student[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return getDefaultStudentsForUser(userEmail);
    }
    const uid = userId !== undefined ? userId : currentStoreUserId;
    const email = userEmail !== undefined ? (userEmail ? userEmail.trim().toLowerCase() : null) : currentStoreUserEmail;
    const storageKey = getStudentsStorageKey(uid);
    const initKey = getStudentsInitKey(uid);

    const raw = localStorage.getItem(storageKey);
    const isInitialized = localStorage.getItem(initKey);

    let parsed: any = null;
    if (raw !== null) {
      try {
        parsed = JSON.parse(raw);
      } catch {}
    }

    if (Array.isArray(parsed)) {
      // Empty arrays are valid saved rosters, not an instruction to reseed.
      if (parsed.length === 0) {
        localStorage.setItem(initKey, 'true');
        return [];
      }
      let mapped: Student[] = parsed.map((s: any) => ({
        ...s,
        grade: (s.grade && [1, 2, 3, 4].includes(Number(s.grade))) ? Number(s.grade) : 2
      }));
      const upgraded = upgradeOlcaytoStudentNames(mapped, email);
      const anyChange = upgraded.some((s, idx) => s.name !== parsed[idx]?.name || s.className !== parsed[idx]?.className);
      if (anyChange) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(upgraded));
        } catch {}
      }
      return upgraded;
    }

    // If the user has already initialized and roster is empty, respect user choice
    if (isInitialized) {
      return [];
    }

    // If guest and not yet initialized in guest_v1, check legacy 'classroom_students_v1'
    if (!uid && raw === null) {
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      if (legacyRaw !== null) {
        try {
          parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let mapped: Student[] = parsed.map((s: any) => ({
              ...s,
              grade: (s.grade && [1, 2, 3, 4].includes(Number(s.grade))) ? Number(s.grade) : 2
            }));
            const upgraded = upgradeOlcaytoStudentNames(mapped, email);
            saveStudents(upgraded, uid);
            return upgraded;
          }
        } catch {}
      }
    }

    // First time EVER visit: seed proper initial template
    const defaultList = getDefaultStudentsForUser(email);
    saveStudents(defaultList, uid);
    return defaultList;
  } catch (err) {
    console.error('Error loading students from localStorage:', err);
    return getDefaultStudentsForUser(userEmail);
  }
}

/**
 * Saves students to localStorage scoped to active user or specified userId.
 */
export function saveStudents(students: Student[], userId?: string | null): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    const cleanStudents = deduplicateStudents(students);
    const uid = userId !== undefined ? userId : currentStoreUserId;
    const storageKey = getStudentsStorageKey(uid);
    const initKey = getStudentsInitKey(uid);

    localStorage.setItem(initKey, 'true');
    localStorage.setItem(storageKey, JSON.stringify(cleanStudents));

    // Also mirror to legacy key if guest
    if (!uid) {
      localStorage.setItem(INITIALIZED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanStudents));
    }

    // Keep vault current with active roster without resurrecting deleted items
    if (uid) {
      saveToMultiUserVault(uid, cleanStudents);
    }
    const curEmail = currentStoreUserEmail;
    if (curEmail) {
      saveToMultiUserVault(curEmail, cleanStudents);
    }
  } catch (err) {
    console.error('Error saving students to localStorage:', err);
  }
}

/**
 * Loads selected player student IDs for a specific grade (1, 2, 3, or 4).
 * By default, no player is pre-selected initially.
 */
export function loadSelectedStudentIdsForGrade(_grade: number): (string | null)[] {
  return [null, null, null];
}

/**
 * Saves selected player student IDs for a specific grade so they persist independently
 */
export function saveSelectedStudentIdsForGrade(_grade: number, _ids: (string | null)[]): void {
  // Kept for interface compatibility; no forced persistence so games always start unselected
}

/**
 * Loads legacy selected student IDs
 */
export function loadSelectedStudentIds(): (string | null)[] {
  return loadSelectedStudentIdsForGrade(2);
}

/**
 * Saves legacy selected student IDs
 */
export function saveSelectedStudentIds(ids: (string | null)[]): void {
  saveSelectedStudentIdsForGrade(2, ids);
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
 * targetGrade: 1, 2, 3, or 4
 * If replaceMode is true, it ONLY replaces students of targetGrade, keeping all other grades intact!
 */
export function importStudentsFromText(
  rawText: string,
  existingStudents: Student[] = [],
  replaceMode = false,
  targetGrade = 2,
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

  // Other grades students will be preserved untouched
  const studentsOtherGrades = existingStudents.filter(s => s.grade !== targetGrade);

  // For the target grade: if replaceMode, start empty; otherwise keep existing target grade students
  const studentsTargetGrade = replaceMode
    ? []
    : existingStudents.filter(s => s.grade === targetGrade);

  const existingMap = new Map<string, Student>();
  studentsTargetGrade.forEach(s => existingMap.set(s.name.toLocaleLowerCase('tr'), s));

  const resultTargetGrade: Student[] = [...studentsTargetGrade];

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

    const avatarOpt = AVATAR_OPTIONS[(resultTargetGrade.length + idx) % AVATAR_OPTIONS.length];
    const newStudent: Student = {
      id: `std_g${targetGrade}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: formattedName,
      avatar: avatarOpt.emoji,
      avatarBg: avatarOpt.bg,
      grade: targetGrade,
      className: targetClass.trim() || `${targetGrade}-A`,
      totalCorrect: 0,
      totalWrong: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      topicStats: {},
      createdAt: new Date().toISOString()
    };

    resultTargetGrade.push(newStudent);
    existingMap.set(lower, newStudent);
  });

  const finalStudents = [...studentsOtherGrades, ...resultTargetGrade];
  saveStudents(finalStudents);
  return finalStudents;
}

/**
 * Resets students of a specific grade to empty [] without touching other grades
 */
export function clearStudentsForGrade(grade: number, existingStudents: Student[]): Student[] {
  const updated = existingStudents.filter(s => s.grade !== grade);
  saveStudents(updated);
  return updated;
}

/**
 * Restores default sample students for a specific grade
 */
export function restoreDefaultStudentsForGrade(grade: number, existingStudents: Student[], userEmail?: string | null): Student[] {
  const defaults = getDefaultStudentsForUser(userEmail || currentStoreUserEmail).filter(s => s.grade === grade);
  const otherGrades = existingStudents.filter(s => s.grade !== grade);
  const updated = [...otherGrades, ...defaults];
  saveStudents(updated);
  return updated;
}

/**
 * Resets the entire roster to empty [] across all grades
 */
export function clearAllStudents(): Student[] {
  saveStudents([]);
  return [];
}

/**
 * Restores all sample students across all grades
 */
export function restoreDefaultStudents(userEmail?: string | null): Student[] {
  const defaults = getDefaultStudentsForUser(userEmail || currentStoreUserEmail);
  saveStudents(defaults);
  return defaults;
}


export function recordStudentAnswer(
  studentId: string,
  topicKey: string,
  isCorrect: boolean,
  existingStudents?: Student[],
  userId?: string | null
): Student[] {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  const students = existingStudents && existingStudents.length > 0 
    ? [...existingStudents] 
    : loadStudents(uid);

  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  const student = students[idx];
  const now = new Date().toISOString();
  const currentTopicStat = student.topicStats?.[topicKey] || { correct: 0, wrong: 0 };

  const updatedStudent: Student = {
    ...student,
    totalCorrect: (student.totalCorrect || 0) + (isCorrect ? 1 : 0),
    totalWrong: (student.totalWrong || 0) + (isCorrect ? 0 : 1),
    topicStats: {
      ...(student.topicStats || {}),
      [topicKey]: {
        correct: (currentTopicStat.correct || 0) + (isCorrect ? 1 : 0),
        wrong: (currentTopicStat.wrong || 0) + (isCorrect ? 0 : 1),
        lastPlayed: now
      }
    }
  };

  students[idx] = updatedStudent;
  saveStudents(students, uid);
  return students;
}

export function recordStudentGameResult(
  studentId: string,
  won: boolean,
  existingStudents?: Student[],
  userId?: string | null
): Student[] {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  const students = existingStudents && existingStudents.length > 0 
    ? [...existingStudents] 
    : loadStudents(uid);

  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  const student = students[idx];
  students[idx] = {
    ...student,
    gamesPlayed: (student.gamesPlayed || 0) + 1,
    gamesWon: (student.gamesWon || 0) + (won ? 1 : 0)
  };

  saveStudents(students, uid);
  return students;
}

export function resetAllStudentStats(userId?: string | null, userEmail?: string | null): Student[] {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  const students = loadStudents(uid, email);
  const reset = students.map(s => ({
    ...s,
    totalCorrect: 0,
    totalWrong: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    topicStats: {}
  }));
  saveStudents(reset, uid);

  // Clear backup slots and update multi-user vault so old numbers (like 671/181) can NEVER resurrect
  try {
    if (typeof localStorage !== 'undefined') {
      const keysToClear = [
        uid ? `classroom_students_backup_${uid}` : '',
        email ? `classroom_students_backup_${email}` : '',
        'classroom_students_backup_v1',
        'classroom_students_backup_guest_v1'
      ].filter(Boolean);
      keysToClear.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      if (uid) saveToMultiUserVault(uid, reset, { userId: uid, userEmail: email || undefined });
      if (email) saveToMultiUserVault(email, reset, { userId: uid || undefined, userEmail: email });
    }
  } catch {}
  return reset;
}

export function resetGradeStudentStats(grade: number, userId?: string | null, userEmail?: string | null): Student[] {
  const uid = userId !== undefined ? userId : currentStoreUserId;
  const email = (userEmail || currentStoreUserEmail || '').trim().toLowerCase();
  const students = loadStudents(uid, email);
  const reset = students.map(s => {
    if (s.grade === grade) {
      return {
        ...s,
        totalCorrect: 0,
        totalWrong: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        topicStats: {}
      };
    }
    return s;
  });
  saveStudents(reset, uid);

  try {
    if (typeof localStorage !== 'undefined') {
      if (uid) saveToMultiUserVault(uid, reset, { userId: uid, userEmail: email || undefined });
      if (email) saveToMultiUserVault(email, reset, { userId: uid || undefined, userEmail: email });
    }
  } catch {}
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

/**
 * Resets stats for a single topic for a specific student
 */
export function resetSingleStudentTopicStat(studentId: string, topicKey: string): Student[] {
  const students = loadStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx === -1) return students;

  const student = students[idx];
  const topicStat = student.topicStats?.[topicKey];
  if (!topicStat) return students;

  const topicCorrect = topicStat.correct || 0;
  const topicWrong = topicStat.wrong || 0;

  const newTopicStats = { ...(student.topicStats || {}) };
  delete newTopicStats[topicKey];

  students[idx] = {
    ...student,
    totalCorrect: Math.max(0, (student.totalCorrect || 0) - topicCorrect),
    totalWrong: Math.max(0, (student.totalWrong || 0) - topicWrong),
    topicStats: newTopicStats
  };
  saveStudents(students);
  return students;
}

/**
 * Resets stats for a single topic across all students (or students of a specific grade)
 */
export function resetTopicStatsForAllStudents(topicKey: string, grade?: number): Student[] {
  const students = loadStudents();
  let modified = false;

  const updated = students.map(s => {
    if (grade !== undefined && s.grade !== grade) return s;
    if (!s.topicStats || !s.topicStats[topicKey]) return s;

    const topicStat = s.topicStats[topicKey];
    const topicCorrect = topicStat.correct || 0;
    const topicWrong = topicStat.wrong || 0;

    const newTopicStats = { ...s.topicStats };
    delete newTopicStats[topicKey];
    modified = true;

    return {
      ...s,
      totalCorrect: Math.max(0, (studentCorrectFallback(s.totalCorrect) - topicCorrect)),
      totalWrong: Math.max(0, (studentWrongFallback(s.totalWrong) - topicWrong)),
      topicStats: newTopicStats
    };
  });

  if (modified) {
    saveStudents(updated);
  }
  return updated;
}

function studentCorrectFallback(val: number | undefined): number {
  return typeof val === 'number' ? val : 0;
}

function studentWrongFallback(val: number | undefined): number {
  return typeof val === 'number' ? val : 0;
}

export function exportStudentsToCSV(students: Student[]): string {
  const headers = ['Sınıf Seviyesi', 'Şube', 'Öğrenci Adı', 'Avatar', 'Toplam Doğru', 'Toplam Yanlış', 'Başarı Yüzdesi (%)', 'Oynanan Oyun', 'Galibiyet'];
  const rows = students.map(s => {
    const total = s.totalCorrect + s.totalWrong;
    const rate = total > 0 ? Math.round((s.totalCorrect / total) * 100) : 0;
    return [
      `"${s.grade}. Sınıf"`,
      `"${s.className || ''}"`,
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
