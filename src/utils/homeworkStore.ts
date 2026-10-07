import { auth } from '../firebase';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { Student } from '../types/student';

const LEGACY_STORAGE_KEY = 'odev_akvaryumu_v1';
const GLOBAL_BACKUP_KEY = 'odev_akvaryumu_backup_all';
let currentStoreUserId: string | null = null;

export function setActiveStoreHomeworkUserId(userId: string | null): void {
  currentStoreUserId = userId;
}

export function getActiveStoreHomeworkUserId(): string | null {
  return currentStoreUserId;
}

function resolveUserId(userId?: string | null): string | null {
  if (userId !== undefined) return userId;
  if (currentStoreUserId) return currentStoreUserId;
  try {
    if (auth?.currentUser?.uid) return auth.currentUser.uid;
  } catch {}
  return null;
}

function getHomeworkStorageKey(userId?: string | null): string {
  const uid = resolveUserId(userId);
  return uid ? `odev_akvaryumu_user_${uid}` : LEGACY_STORAGE_KEY;
}

function getHomeworkBackupKey(userId?: string | null): string {
  const uid = resolveUserId(userId);
  return uid ? `odev_akvaryumu_backup_${uid}` : 'odev_akvaryumu_backup_guest';
}

// Türkçe karakter ve boşluk duyarlı isim normalizasyonu
export function normalizeStudentName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr');
}

// Bugünün yerel tarih string'i: YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Toplam ödev sayısını hesapla (kalite ve veri güvenliği kontrolü için)
export function calculateTotalHomework(data: Record<string, StudentHomeworkData> | null | undefined): number {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).reduce((sum, item) => sum + (item?.homeworkCount || 0), 0);
}

// İki ödev veri setini güvenli şekilde birleştir (asla ödev sayısını düşürmez veya sıfırlamaz)
export function mergeHomeworkData(
  localData: Record<string, StudentHomeworkData> = {},
  remoteData: Record<string, StudentHomeworkData> = {}
): Record<string, StudentHomeworkData> {
  const merged: Record<string, StudentHomeworkData> = { ...localData };

  // İsim tabanlı harita
  const nameToKeys = new Map<string, string[]>();
  Object.keys(merged).forEach(k => {
    const item = merged[k];
    if (item && item.studentName) {
      const norm = normalizeStudentName(item.studentName);
      if (!nameToKeys.has(norm)) nameToKeys.set(norm, []);
      nameToKeys.get(norm)!.push(k);
    }
  });

  Object.keys(remoteData).forEach(rKey => {
    const rItem = remoteData[rKey];
    if (!rItem) return;
    const rCount = rItem.homeworkCount || 0;
    const rNorm = normalizeStudentName(rItem.studentName || '');

    if (merged[rKey]) {
      // Aynı ID mevcut: yüksek olan sayıyı ve en güncel tarihi koru
      const currentCount = merged[rKey].homeworkCount || 0;
      merged[rKey] = {
        ...merged[rKey],
        ...rItem,
        studentName: rItem.studentName || merged[rKey].studentName,
        homeworkCount: Math.max(currentCount, rCount),
        lastCompletedDate: rItem.lastCompletedDate || merged[rKey].lastCompletedDate,
        fishModelIndex: rItem.fishModelIndex ?? merged[rKey].fishModelIndex ?? 0,
        createdAt: merged[rKey].createdAt || rItem.createdAt || new Date().toISOString()
      };
    } else if (rNorm && nameToKeys.has(rNorm)) {
      // Farklı ID ama aynı öğrenci ismi!
      const existingKeys = nameToKeys.get(rNorm)!;
      existingKeys.forEach(exKey => {
        if (merged[exKey]) {
          const currentCount = merged[exKey].homeworkCount || 0;
          merged[exKey].homeworkCount = Math.max(currentCount, rCount);
          if (rItem.lastCompletedDate && (!merged[exKey].lastCompletedDate || rItem.lastCompletedDate > merged[exKey].lastCompletedDate!)) {
            merged[exKey].lastCompletedDate = rItem.lastCompletedDate;
          }
        }
      });
      // Ayrıca yeni ID ile de eşitle
      merged[rKey] = {
        ...rItem,
        homeworkCount: Math.max(rCount, merged[existingKeys[0]]?.homeworkCount || 0)
      };
    } else {
      // Yeni öğrenci kaydı
      merged[rKey] = { ...rItem };
      if (rNorm) {
        if (!nameToKeys.has(rNorm)) nameToKeys.set(rNorm, []);
        nameToKeys.get(rNorm)!.push(rKey);
      }
    }
  });

  // Demo kayıtlarını temizle
  Object.keys(merged).forEach(k => {
    if (k.includes('_demo_')) {
      delete merged[k];
    }
  });

  return merged;
}

// Tarayıcıdaki tüm ödev yedeklerini (legacy, guest, backup, user slots) toplayıp kurtarır
export function recoverAllPossibleHomeworkData(userId?: string | null): Record<string, StudentHomeworkData> {
  const uid = resolveUserId(userId);
  let accumulated: Record<string, StudentHomeworkData> = {};

  const checkAndMergeRaw = (raw: string | null) => {
    if (!raw || raw === '{}') return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        accumulated = mergeHomeworkData(accumulated, parsed);
      }
    } catch {}
  };

  try {
    // 1. Standart bilinen anahtarları kontrol et
    if (uid) {
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_user_${uid}`));
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_backup_${uid}`));
    }
    checkAndMergeRaw(localStorage.getItem(GLOBAL_BACKUP_KEY));
    checkAndMergeRaw(localStorage.getItem('odev_akvaryumu_backup_guest'));
    checkAndMergeRaw(localStorage.getItem(LEGACY_STORAGE_KEY));

    // 2. Tarayıcıda 'odev_akvaryumu_' ile başlayan her anahtarı tara
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('odev_akvaryumu_')) {
          checkAndMergeRaw(localStorage.getItem(key));
        }
      }
    }
  } catch (e) {
    console.error('Kurtarma sırasında tarayıcı depolama okuma hatası:', e);
  }

  // Eğer kurtarılan veri varsa aktif anahtara da yaz
  if (Object.keys(accumulated).length > 0) {
    try {
      const activeKey = getHomeworkStorageKey(uid);
      const activeRaw = localStorage.getItem(activeKey);
      let currentActive: Record<string, StudentHomeworkData> = {};
      if (activeRaw && activeRaw !== '{}') {
        currentActive = JSON.parse(activeRaw);
      }
      const finalMerged = mergeHomeworkData(currentActive, accumulated);
      localStorage.setItem(activeKey, JSON.stringify(finalMerged));
      return finalMerged;
    } catch {}
  }

  return accumulated;
}

// LocalStorage'dan tüm ödev verilerini oku (kullanıcıya göre ayrılmış ve otomatik migrasyonlu)
export function loadHomeworkData(userId?: string | null): Record<string, StudentHomeworkData> {
  try {
    const uid = resolveUserId(userId);
    const key = getHomeworkStorageKey(uid);
    let raw = localStorage.getItem(key);

    let parsed: Record<string, StudentHomeworkData> = {};
    if (raw && raw !== '{}') {
      try {
        parsed = JSON.parse(raw) as Record<string, StudentHomeworkData>;
      } catch {}
    }

    // Demo kayıtlarını temizle
    let hasDemoKeys = false;
    Object.keys(parsed).forEach(k => {
      if (k.includes('_demo_')) {
        delete parsed[k];
        hasDemoKeys = true;
      }
    });

    const activeTotalCount = calculateTotalHomework(parsed);

    // Eğer veri boşsa veya toplam ödev sayısı 0 ise, diğer yedek yuvalarını tara ve kurtar
    if (activeTotalCount === 0) {
      const recovered = recoverAllPossibleHomeworkData(uid);
      const recoveredCount = calculateTotalHomework(recovered);
      if (recoveredCount > 0) {
        parsed = mergeHomeworkData(parsed, recovered);
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
        return parsed;
      }
    }

    if (hasDemoKeys) {
      try {
        localStorage.setItem(key, JSON.stringify(parsed));
      } catch {}
    }

    return parsed;
  } catch (e) {
    console.error('Ödev akvaryumu verileri okunurken hata:', e);
    return {};
  }
}

// LocalStorage'a kaydet (hem ana anahtara hem de yedeğe kaydeder, sıfırlanmaları engeller)
export function saveHomeworkData(data: Record<string, StudentHomeworkData>, userId?: string | null): void {
  try {
    const uid = resolveUserId(userId);
    const key = getHomeworkStorageKey(uid);
    const backupKey = getHomeworkBackupKey(uid);
    const serialized = JSON.stringify(data);

    // Ana anahtara kaydet
    localStorage.setItem(key, serialized);

    // YEDEK KORUMA KURALI:
    // Eğer mevcut yedekte daha fazla ödev varsa, boş veriyle yedeğin üzerine yazma!
    const newCount = calculateTotalHomework(data);
    let shouldUpdateBackup = true;
    try {
      const existingBackupRaw = localStorage.getItem(backupKey);
      if (existingBackupRaw && existingBackupRaw !== '{}') {
        const existingBackup = JSON.parse(existingBackupRaw);
        const existingCount = calculateTotalHomework(existingBackup);
        if (existingCount > newCount && newCount === 0) {
          // Yeni gelen veri boş ama yedekte gerçek veri var! Yedeği koru!
          shouldUpdateBackup = false;
        }
      }
    } catch {}

    if (shouldUpdateBackup) {
      localStorage.setItem(backupKey, serialized);
    }

    // Eğer ödev sayısı > 0 ise global yedek anahtarına da yaz
    if (newCount > 0) {
      try {
        localStorage.setItem(GLOBAL_BACKUP_KEY, serialized);
        if (!localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) === '{}') {
          localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
        }
      } catch {}
    }

    // Diğer pencerelere ve modal'a güncelleme sinyali gönder
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('odev_akvaryumu_saved', { 
        detail: { userId: uid, count: Object.keys(data).length, totalHomeworkCount: newCount } 
      }));
    }
  } catch (e) {
    console.error('Ödev akvaryumu verileri kaydedilirken hata:', e);
  }
}

// Sınıf listesindeki öğrencilerle senkronize et
// KRİTİK: ID değişse bile (Google Cloud senkronizasyonu veya yeniden içe aktarma) öğrenci isminden eşleştirerek ödev sayısını asla sıfırlamaz!
export function syncHomeworkWithStudents(
  gradeStudents: Student[],
  existingData: Record<string, StudentHomeworkData>
): Record<string, StudentHomeworkData> {
  const updated: Record<string, StudentHomeworkData> = { ...existingData };

  // Eski demo öğrenci kayıtlarını temizle
  Object.keys(updated).forEach(k => {
    if (k.includes('_demo_')) {
      delete updated[k];
    }
  });

  // İsim bazlı arama haritası oluştur (Türkçe normalizasyona göre)
  const normalizedNameMap = new Map<string, StudentHomeworkData>();
  Object.values(existingData).forEach(item => {
    if (item && item.studentName) {
      const norm = normalizeStudentName(item.studentName);
      const prev = normalizedNameMap.get(norm);
      if (!prev || ((item.homeworkCount || 0) > (prev.homeworkCount || 0))) {
        normalizedNameMap.set(norm, item);
      }
    }
  });

  gradeStudents.forEach((st, idx) => {
    const normName = normalizeStudentName(st.name);

    if (updated[st.id]) {
      // Zaten ID ile mevcut: isim güncelle ve isim haritasında daha yüksek count varsa onu koru!
      if (updated[st.id].studentName !== st.name) {
        updated[st.id].studentName = st.name;
      }
      if (normalizedNameMap.has(normName)) {
        const prevMax = normalizedNameMap.get(normName)!.homeworkCount || 0;
        if (prevMax > (updated[st.id].homeworkCount || 0)) {
          updated[st.id].homeworkCount = prevMax;
        }
      }
    } else if (normalizedNameMap.has(normName)) {
      // ID değişmiş (bulut senkronizasyonu vs.), fakat aynı isimli öğrenci daha önce ödev yapmış!
      const previousRecord = normalizedNameMap.get(normName)!;
      updated[st.id] = {
        ...previousRecord,
        studentId: st.id,
        studentName: st.name
      };
    } else {
      // Tamamen yeni öğrenci
      updated[st.id] = {
        studentId: st.id,
        studentName: st.name,
        homeworkCount: 0,
        fishModelIndex: idx % 8,
        createdAt: new Date().toISOString()
      };
    }
  });

  return updated;
}

// Öğrencinin bugünkü ödevini tamamla (+1 büyüme ve tarih güncellemesi)
export function completeHomeworkToday(
  studentId: string,
  studentName: string,
  modelIndex: number = 0,
  userId?: string | null
): { success: boolean; isAlreadyDone: boolean; newCount: number } {
  const allData = loadHomeworkData(userId);
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

  saveHomeworkData(allData, userId);

  return {
    success: true,
    isAlreadyDone: false,
    newCount: nextCount
  };
}

// Bugünkü ödevi geri al (öğretmen modu/düzeltme için)
export function undoTodayHomework(studentId: string, userId?: string | null): boolean {
  const allData = loadHomeworkData(userId);
  const today = getTodayDateString();
  const current = allData[studentId];

  if (!current || current.lastCompletedDate !== today) {
    return false;
  }

  current.homeworkCount = Math.max(0, (current.homeworkCount || 1) - 1);
  delete current.lastCompletedDate;
  allData[studentId] = current;
  saveHomeworkData(allData, userId);
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
