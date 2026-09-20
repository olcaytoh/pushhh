import { StudentHomeworkData } from '../types/homeworkAquarium';
import { Student } from '../types/student';

const STORAGE_KEY = 'odev_akvaryumu_v1';

// Bugünün yerel tarih string'i: YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// LocalStorage'dan tüm ödev verilerini oku
export function loadHomeworkData(): Record<string, StudentHomeworkData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Ödev akvaryumu verileri okunurken hata:', e);
    return {};
  }
}

// LocalStorage'a kaydet
export function saveHomeworkData(data: Record<string, StudentHomeworkData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Ödev akvaryumu verileri kaydedilirken hata:', e);
  }
}

// Sınıf listesindeki öğrencilerle senkronize et
export function syncHomeworkWithStudents(
  grade4Students: Student[],
  existingData: Record<string, StudentHomeworkData>
): Record<string, StudentHomeworkData> {
  const updated: Record<string, StudentHomeworkData> = { ...existingData };

  grade4Students.forEach((st, idx) => {
    if (!updated[st.id]) {
      updated[st.id] = {
        studentId: st.id,
        studentName: st.name,
        homeworkCount: 0,
        fishModelIndex: idx % 8,
        createdAt: new Date().toISOString()
      };
    } else {
      // İsmi güncellenmişse güncelle
      if (updated[st.id].studentName !== st.name) {
        updated[st.id].studentName = st.name;
      }
    }
  });

  return updated;
}

// Öğrencinin bugünkü ödevini tamamla (+1 büyüme ve tarih güncellemesi)
export function completeHomeworkToday(
  studentId: string,
  studentName: string,
  modelIndex: number = 0
): { success: boolean; isAlreadyDone: boolean; newCount: number } {
  const allData = loadHomeworkData();
  const today = getTodayDateString();
  const current = allData[studentId] || {
    studentId,
    studentName,
    homeworkCount: 0,
    fishModelIndex: modelIndex,
    createdAt: new Date().toISOString()
  };

  if (current.lastCompletedDate === today) {
    return {
      success: false,
      isAlreadyDone: true,
      newCount: current.homeworkCount
    };
  }

  const nextCount = (current.homeworkCount || 0) + 1;
  allData[studentId] = {
    ...current,
    studentName,
    homeworkCount: nextCount,
    lastCompletedDate: today
  };

  saveHomeworkData(allData);

  return {
    success: true,
    isAlreadyDone: false,
    newCount: nextCount
  };
}

// Bugünkü ödevi geri al (öğretmen modu/düzeltme için)
export function undoTodayHomework(studentId: string): boolean {
  const allData = loadHomeworkData();
  const today = getTodayDateString();
  const current = allData[studentId];

  if (!current || current.lastCompletedDate !== today) {
    return false;
  }

  current.homeworkCount = Math.max(0, (current.homeworkCount || 1) - 1);
  delete current.lastCompletedDate;
  allData[studentId] = current;
  saveHomeworkData(allData);
  return true;
}

// Balığın büyüme katsayısını hesapla (0 ödev = 1.0; 25 ödev = 2.4 vs.)
export function calculateFishScale(homeworkCount: number): number {
  const count = Math.max(0, homeworkCount || 0);
  // Başlangıç: 0.9, her ödevde +0.07 büyüme, üst sınır 2.25
  return Math.min(2.25, 0.9 + count * 0.07);
}

// Seviye ve unvan
export function getFishLevelTitle(homeworkCount: number): { title: string; badge: string; color: string } {
  const count = homeworkCount || 0;
  if (count === 0) return { title: 'Yavru Balık', badge: '🐣', color: 'text-slate-300' };
  if (count < 3) return { title: 'Meraklı Balık', badge: '🐟', color: 'text-sky-300' };
  if (count < 7) return { title: 'Büyüyen Balık', badge: '🐠', color: 'text-emerald-300' };
  if (count < 12) return { title: 'Usta Balık', badge: '🐡', color: 'text-amber-300' };
  if (count < 20) return { title: 'Yıldız Balık', badge: '🐬', color: 'text-cyan-300' };
  return { title: 'Kral Balık', badge: '🦈👑', color: 'text-yellow-400' };
}
