import { Student } from '../types/student';
import { ClassCountersData, saveCounters, loadCounters } from './counterStorage';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { loadHomeworkData, saveHomeworkData, mergeHomeworkData, calculateTotalHomework } from './homeworkStore';
import { SchoolSettings, loadSchoolSettings, saveSchoolSettings } from './schoolSettings';
import { saveStudents, loadStudents, DEFAULT_STUDENTS } from './studentStore';
import { saveUserDataToCloud, loadUserDataFromCloud, formatFriendlyDate, isFirestoreQuotaExceeded } from '../services/cloudSyncService';
import { User } from '../firebase';

export interface PCBackupSummary {
  totalStudents: number;
  gradeCounts: Record<number, number>;
  totalQuestionsSolved: number;
  homeworkCount: number;
  schoolName: string;
  className: string;
}

export interface PCBackupData {
  app: 'IlkokulEtkinlik';
  backupType: 'full_classroom_backup';
  version: 2;
  createdAt: string;
  createdAtFormatted: string;
  source: 'cloud_and_local';
  user: {
    uid: string | null;
    email: string | null;
    displayName: string | null;
  };
  summary: PCBackupSummary;
  students: Student[];
  counters: ClassCountersData;
  homeworkData: Record<string, StudentHomeworkData>;
  schoolSettings: SchoolSettings;
  selectedStudentIds?: (string | null)[];
}

/**
 * Calculates total questions solved across all grades
 */
export function calculateTotalSolvedQuestions(counters?: ClassCountersData | null): number {
  if (!counters?.questions) return 0;
  const q = counters.questions;
  return (
    (q.grade1?.correct || 0) + (q.grade1?.wrong || 0) +
    (q.grade2?.correct || 0) + (q.grade2?.wrong || 0) +
    (q.grade3?.correct || 0) + (q.grade3?.wrong || 0) +
    (q.grade4?.correct || 0) + (q.grade4?.wrong || 0) +
    (q.otherGames?.correct || 0) + (q.otherGames?.wrong || 0) +
    (q.englishGames?.correct || 0) + (q.englishGames?.wrong || 0)
  );
}

/**
 * Creates summary metrics for students
 */
export function generateBackupSummary(
  students: Student[],
  counters: ClassCountersData,
  homeworkData: Record<string, StudentHomeworkData>,
  schoolSettings: SchoolSettings
): PCBackupSummary {
  const gradeCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  students.forEach(s => {
    const g = Number(s.grade) || 2;
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });

  return {
    totalStudents: students.length,
    gradeCounts,
    totalQuestionsSolved: calculateTotalSolvedQuestions(counters),
    homeworkCount: calculateTotalHomework(homeworkData),
    schoolName: schoolSettings.schoolName || '',
    className: schoolSettings.className || ''
  };
}

/**
 * Downloads full classroom and cloud data as a JSON file to the user's PC.
 * If logged in, tries to merge with any newer data in the cloud before saving.
 */
export async function downloadDataToPC(options: {
  currentUser: User | null;
  students: Student[];
  counters?: ClassCountersData;
  selectedStudentIds?: (string | null)[];
}): Promise<{ filename: string; summary: PCBackupSummary }> {
  const { currentUser, selectedStudentIds } = options;
  const userId = currentUser?.uid || null;

  // 1. Start with current in-memory students & counters
  let studentsToExport = [...options.students];
  let countersToExport = options.counters || loadCounters();
  let homeworkToExport = loadHomeworkData(userId);
  const settingsToExport = loadSchoolSettings();

  // 2. If logged in and quota is not exceeded, try fetching the freshest cloud backup to combine
  if (currentUser?.uid && !isFirestoreQuotaExceeded()) {
    try {
      const cloudData = await loadUserDataFromCloud(currentUser.uid, currentUser.email);
      if (cloudData) {
        if (Array.isArray(cloudData.students) && cloudData.students.length > 0) {
          // Merge local & cloud to make sure no student is missing
          const existingIds = new Set(studentsToExport.map(s => s.id));
          cloudData.students.forEach(cs => {
            if (!existingIds.has(cs.id)) {
              studentsToExport.push(cs);
              existingIds.add(cs.id);
            }
          });
        }
        if (cloudData.homeworkData) {
          homeworkToExport = mergeHomeworkData(homeworkToExport, cloudData.homeworkData);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud data before export, using local memory state:', err);
    }
  }

  // Fallback if local students array was empty
  if (studentsToExport.length === 0) {
    studentsToExport = loadStudents(userId);
  }

  // 3. Ensure Grade 2 contains the full 23 real classroom students (prevent accidental 12-sample export)
  const g2 = studentsToExport.filter(s => Number(s.grade) === 2);
  if (studentsToExport.length === 12 || (g2.length <= 3 && g2.some(s => s.name === 'Ali Yılmaz' || s.name === 'Ayşe Kaya'))) {
    const nonG2 = studentsToExport.filter(s => Number(s.grade) !== 2);
    const realG2 = DEFAULT_STUDENTS.filter(s => s.grade === 2);
    studentsToExport = [...nonG2, ...realG2];
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const filename = `ilkokul_etkinlik_yedek_${dateStr}.json`;

  const summary = generateBackupSummary(
    studentsToExport,
    countersToExport,
    homeworkToExport,
    settingsToExport
  );

  const backupPayload: PCBackupData = {
    app: 'IlkokulEtkinlik',
    backupType: 'full_classroom_backup',
    version: 2,
    createdAt: now.toISOString(),
    createdAtFormatted: formatFriendlyDate(now.toISOString()),
    source: 'cloud_and_local',
    user: {
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || null
    },
    summary,
    students: studentsToExport,
    counters: countersToExport,
    homeworkData: homeworkToExport,
    schoolSettings: settingsToExport,
    selectedStudentIds: selectedStudentIds || []
  };

  // Convert to nicely formatted JSON string
  const jsonContent = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Trigger browser download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, summary };
}

export interface ParsedBackupResult {
  valid: boolean;
  error?: string;
  data?: PCBackupData;
  fileName: string;
  fileSizeFormatted: string;
}

/**
 * Parses and verifies a JSON file uploaded from user's PC.
 */
export async function parseBackupFileFromPC(file: File): Promise<ParsedBackupResult> {
  const fileName = file.name;
  const fileSizeKB = (file.size / 1024).toFixed(1);
  const fileSizeFormatted = `${fileSizeKB} KB`;

  if (!file.name.toLowerCase().endsWith('.json')) {
    return {
      valid: false,
      error: 'Seçilen dosya geçerli bir .json uzantılı yedek dosyası değil.',
      fileName,
      fileSizeFormatted
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || !text.trim()) {
          resolve({
            valid: false,
            error: 'Seçilen dosyanın içeriği boş.',
            fileName,
            fileSizeFormatted
          });
          return;
        }

        const parsed = JSON.parse(text);

        // Handle various backup formats (Standard V2, Legacy V1, or raw student array)
        let students: Student[] = [];
        let counters: ClassCountersData | null = null;
        let homeworkData: Record<string, StudentHomeworkData> = {};
        let schoolSettings: SchoolSettings = loadSchoolSettings();
        let selectedStudentIds: (string | null)[] = [];
        let createdAt = new Date().toISOString();
        let userEmail: string | null = null;

        if (Array.isArray(parsed)) {
          // Raw Student[] array
          students = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Standard backup object
          if (Array.isArray(parsed.students)) {
            students = parsed.students;
          }
          if (parsed.counters && typeof parsed.counters === 'object') {
            counters = parsed.counters;
          }
          if (parsed.homeworkData && typeof parsed.homeworkData === 'object') {
            homeworkData = parsed.homeworkData;
          }
          if (parsed.schoolSettings && typeof parsed.schoolSettings === 'object') {
            schoolSettings = parsed.schoolSettings;
          }
          if (Array.isArray(parsed.selectedStudentIds)) {
            selectedStudentIds = parsed.selectedStudentIds;
          }
          if (parsed.createdAt) {
            createdAt = parsed.createdAt;
          }
          if (parsed.user?.email) {
            userEmail = parsed.user.email;
          } else if (parsed.userEmail) {
            userEmail = parsed.userEmail;
          }
        }

        // Validate and clean students
        const cleanedStudents: Student[] = students
          .filter(s => s && typeof s === 'object' && typeof s.name === 'string' && s.name.trim().length > 0)
          .map((s, idx) => ({
            id: s.id || `std_${Date.now()}_${idx}`,
            name: s.name.trim(),
            avatar: s.avatar || '🦁',
            avatarBg: s.avatarBg || 'from-amber-500 to-yellow-600',
            grade: Number(s.grade) || 2,
            className: s.className || `${Number(s.grade) || 2}-A`,
            totalCorrect: Number(s.totalCorrect) || 0,
            totalWrong: Number(s.totalWrong) || 0,
            gamesPlayed: Number(s.gamesPlayed) || 0,
            gamesWon: Number(s.gamesWon) || 0,
            topicStats: s.topicStats && typeof s.topicStats === 'object' ? s.topicStats : {},
            createdAt: s.createdAt || new Date().toISOString()
          }));

        if (cleanedStudents.length === 0 && !counters) {
          resolve({
            valid: false,
            error: 'Dosya içerisinde geçerli öğrenci veya istatistik verisi bulunamadı.',
            fileName,
            fileSizeFormatted
          });
          return;
        }

        const validCounters: ClassCountersData = counters || loadCounters();
        const summary = generateBackupSummary(cleanedStudents, validCounters, homeworkData, schoolSettings);

        const data: PCBackupData = {
          app: 'IlkokulEtkinlik',
          backupType: 'full_classroom_backup',
          version: 2,
          createdAt,
          createdAtFormatted: formatFriendlyDate(createdAt),
          source: 'cloud_and_local',
          user: {
            uid: null,
            email: userEmail,
            displayName: null
          },
          summary,
          students: cleanedStudents,
          counters: validCounters,
          homeworkData,
          schoolSettings,
          selectedStudentIds
        };

        resolve({
          valid: true,
          data,
          fileName,
          fileSizeFormatted
        });
      } catch (err: any) {
        resolve({
          valid: false,
          error: `JSON dosyası okunamadı veya biçimi hatalı: ${err?.message || 'Bilinmeyen hata'}`,
          fileName,
          fileSizeFormatted
        });
      }
    };

    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Dosya okunurken bir okuma hatası oluştu.',
        fileName,
        fileSizeFormatted
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Restores the backup data into the active application and synchronizes to cloud.
 */
export async function applyBackupToSystem(options: {
  backupData: PCBackupData;
  mode: 'merge' | 'overwrite';
  currentStudents: Student[];
  currentCounters: ClassCountersData;
  currentUser: User | null;
}): Promise<{
  restoredStudents: Student[];
  restoredCounters: ClassCountersData;
  restoredHomework: Record<string, StudentHomeworkData>;
  summaryText: string;
}> {
  const { backupData, mode, currentStudents, currentCounters, currentUser } = options;
  const userId = currentUser?.uid || null;

  let finalStudents: Student[] = [];
  let finalCounters: ClassCountersData;
  let finalHomework: Record<string, StudentHomeworkData>;

  if (mode === 'overwrite') {
    // 1. Tam Üzerine Yaz: Backup dosyasındaki verileri doğrudan ana veri yap
    finalStudents = [...backupData.students];
    finalCounters = { ...backupData.counters };
    finalHomework = { ...backupData.homeworkData };

    if (backupData.schoolSettings) {
      saveSchoolSettings(backupData.schoolSettings);
    }
  } else {
    // 2. Birleştir (Merge): Mevcut öğrencileri koru, yedekteki eksikleri ekle, puanları en yüksek olana güncelle
    const studentMap = new Map<string, Student>();
    
    // Önce mevcut öğrencileri haritaya al
    currentStudents.forEach(s => {
      const key = `${s.grade}_${s.name.trim().toLocaleLowerCase('tr')}`;
      studentMap.set(key, { ...s });
    });

    // Yedekteki öğrencileri birleştir
    backupData.students.forEach(bs => {
      const key = `${bs.grade}_${bs.name.trim().toLocaleLowerCase('tr')}`;
      const existing = studentMap.get(key);

      if (existing) {
        // İstatistikleri birleştir (daha yüksek olanı al)
        existing.totalCorrect = Math.max(existing.totalCorrect || 0, bs.totalCorrect || 0);
        existing.totalWrong = Math.max(existing.totalWrong || 0, bs.totalWrong || 0);
        existing.gamesPlayed = Math.max(existing.gamesPlayed || 0, bs.gamesPlayed || 0);
        existing.gamesWon = Math.max(existing.gamesWon || 0, bs.gamesWon || 0);
        
        // Topic stats birleştir
        if (bs.topicStats) {
          existing.topicStats = { ...(existing.topicStats || {}), ...bs.topicStats };
        }
        studentMap.set(key, existing);
      } else {
        // Yeni öğrenci ekle
        studentMap.set(key, { ...bs });
      }
    });

    finalStudents = Array.from(studentMap.values());

    // Counters birleştir
    finalCounters = {
      version: 1,
      visits: {
        total: Math.max(currentCounters?.visits?.total || 0, backupData.counters?.visits?.total || 0),
        today: Math.max(currentCounters?.visits?.today || 0, backupData.counters?.visits?.today || 0),
        lastVisitDate: backupData.counters?.visits?.lastVisitDate || currentCounters?.visits?.lastVisitDate || '',
        lastVisitTime: backupData.counters?.visits?.lastVisitTime || currentCounters?.visits?.lastVisitTime || '',
        firstVisitDate: currentCounters?.visits?.firstVisitDate || backupData.counters?.visits?.firstVisitDate || ''
      },
      clicks: {
        grade1: Math.max(currentCounters?.clicks?.grade1 || 0, backupData.counters?.clicks?.grade1 || 0),
        grade2: Math.max(currentCounters?.clicks?.grade2 || 0, backupData.counters?.clicks?.grade2 || 0),
        grade3: Math.max(currentCounters?.clicks?.grade3 || 0, backupData.counters?.clicks?.grade3 || 0),
        grade4: Math.max(currentCounters?.clicks?.grade4 || 0, backupData.counters?.clicks?.grade4 || 0),
        otherGames: Math.max(currentCounters?.clicks?.otherGames || 0, backupData.counters?.clicks?.otherGames || 0),
        englishGames: Math.max(currentCounters?.clicks?.englishGames || 0, backupData.counters?.clicks?.englishGames || 0)
      },
      questions: {
        grade1: {
          correct: Math.max(currentCounters?.questions?.grade1?.correct || 0, backupData.counters?.questions?.grade1?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.grade1?.wrong || 0, backupData.counters?.questions?.grade1?.wrong || 0)
        },
        grade2: {
          correct: Math.max(currentCounters?.questions?.grade2?.correct || 0, backupData.counters?.questions?.grade2?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.grade2?.wrong || 0, backupData.counters?.questions?.grade2?.wrong || 0)
        },
        grade3: {
          correct: Math.max(currentCounters?.questions?.grade3?.correct || 0, backupData.counters?.questions?.grade3?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.grade3?.wrong || 0, backupData.counters?.questions?.grade3?.wrong || 0)
        },
        grade4: {
          correct: Math.max(currentCounters?.questions?.grade4?.correct || 0, backupData.counters?.questions?.grade4?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.grade4?.wrong || 0, backupData.counters?.questions?.grade4?.wrong || 0)
        },
        otherGames: {
          correct: Math.max(currentCounters?.questions?.otherGames?.correct || 0, backupData.counters?.questions?.otherGames?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.otherGames?.wrong || 0, backupData.counters?.questions?.otherGames?.wrong || 0)
        },
        englishGames: {
          correct: Math.max(currentCounters?.questions?.englishGames?.correct || 0, backupData.counters?.questions?.englishGames?.correct || 0),
          wrong: Math.max(currentCounters?.questions?.englishGames?.wrong || 0, backupData.counters?.questions?.englishGames?.wrong || 0)
        }
      }
    };

    // Homework birleştir
    const currentHomework = loadHomeworkData(userId);
    finalHomework = mergeHomeworkData(currentHomework, backupData.homeworkData || {});
  }

  // 3. Yerel depolamaya (localStorage) kaydet
  saveStudents(finalStudents, userId);
  saveCounters(finalCounters);
  saveHomeworkData(finalHomework, userId);

  // 4. Eğer kullanıcı Google ile giriş yapmışsa, buluta da anında eşitle
  if (currentUser?.uid) {
    try {
      await saveUserDataToCloud(
        currentUser.uid,
        finalStudents,
        finalCounters,
        backupData.selectedStudentIds,
        currentUser.email,
        finalHomework,
        true // force update
      );
    } catch (cloudErr) {
      console.warn('Buluta anında eşitleme sırasında hata (yerel veriler yine de güncellendi):', cloudErr);
    }
  }

  const summaryText = mode === 'overwrite'
    ? `${finalStudents.length} öğrenci ve tüm istatistikler yedeğe sıfırlanarak yüklendi.`
    : `${finalStudents.length} öğrenci başarıyla mevcut listeniz ile birleştirildi.`;

  return {
    restoredStudents: finalStudents,
    restoredCounters: finalCounters,
    restoredHomework: finalHomework,
    summaryText
  };
}
