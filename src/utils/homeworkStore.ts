import { auth } from '../firebase';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { Student } from '../types/student';
import { 
  OLCAYTO_EMAIL, 
  OLCAYTO_2A_NAMES_SET, 
  OLCAYTO_2A_STUDENTS, 
  isOlcaytoUser,
  isMushatUser,
  isBanuUser
} from './studentStore';
import { MUSHAT_HOMEWORK_DATA } from '../data/mushat3cStudents';
import { BANU_HOMEWORK_DATA } from '../data/banu2aStudents';

const LEGACY_STORAGE_KEY = 'odev_akvaryumu_v1';
const GLOBAL_BACKUP_KEY = 'odev_akvaryumu_backup_all';
let currentStoreUserId: string | null = null;
let currentStoreHomeworkUserEmail: string | null = null;

// Öğretmenin manuel puan düzeltmesinin bulut/yerel birleştirmelerinde korunması için.
type HomeworkDataWithUpdatedAt = StudentHomeworkData & { updatedAt?: string };

export function setActiveStoreHomeworkUser(userId: string | null, userEmail?: string | null): void {
  currentStoreUserId = userId;
  currentStoreHomeworkUserEmail = userEmail ? userEmail.trim().toLowerCase() : null;
}

export function setActiveStoreHomeworkUserId(userId: string | null): void {
  currentStoreUserId = userId;
}

export function getActiveStoreHomeworkUserId(): string | null {
  return currentStoreUserId;
}

export function getActiveStoreHomeworkUserEmail(): string | null {
  return currentStoreHomeworkUserEmail;
}

export function sanitizeHomeworkForUser(
  hwData: Record<string, StudentHomeworkData> = {},
  userEmail?: string | null
): Record<string, StudentHomeworkData> {
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : currentStoreHomeworkUserEmail;
  if (isOlcaytoUser(cleanEmail)) {
    // Olcayto Hoca için: 2-C sınıfının tüm ödev kayıtları EKSİKSİZ KORUNUR!
    return { ...hwData };
  }
  if (isMushatUser(cleanEmail)) {
    // Mustafa Hoca için: 3/C sınıfının tüm ödev kayıtları EKSİKSİZ KORUNUR!
    return { ...hwData };
  }
  if (isBanuUser(cleanEmail)) {
    // Banu Hoca için: 2-A sınıfının tüm ödev kayıtları EKSİKSİZ KORUNUR!
    return { ...hwData };
  }

  // Diğer öğretmenler için Olcayto Hoca'nın 2-A sınıfındaki 23 öğrencinin ödev kayıtlarını ayıkla
  const result: Record<string, StudentHomeworkData> = {};
  Object.entries(hwData).forEach(([k, item]) => {
    if (!item) return;
    const norm = normalizeStudentName(item.studentName || '');
    const isOlcayto = (k.startsWith('std_g2_') && !k.includes('sample')) && OLCAYTO_2A_NAMES_SET.has(norm);
    if (!isOlcayto) {
      result[k] = item;
    }
  });
  return result;
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

function resolveMergedHomeworkCount(localItem: StudentHomeworkData, incomingItem: StudentHomeworkData): number {
  const localUpdatedAt = (localItem as HomeworkDataWithUpdatedAt).updatedAt || '';
  const incomingUpdatedAt = (incomingItem as HomeworkDataWithUpdatedAt).updatedAt || '';

  // Yeni damgalı kayıt, eski yedekteki daha yüksek değeri de geçersiz kılar.
  if (localUpdatedAt || incomingUpdatedAt) {
    if (!localUpdatedAt) return incomingItem.homeworkCount || 0;
    if (!incomingUpdatedAt) return localItem.homeworkCount || 0;
    return incomingUpdatedAt >= localUpdatedAt
      ? (incomingItem.homeworkCount || 0)
      : (localItem.homeworkCount || 0);
  }

  // Eski kayıtlarda damga yoksa önceki veri koruma davranışını sürdür.
  return Math.max(localItem.homeworkCount || 0, incomingItem.homeworkCount || 0);
}

function getLatestHomeworkUpdateAt(localItem: StudentHomeworkData, incomingItem: StudentHomeworkData): string | undefined {
  const localUpdatedAt = (localItem as HomeworkDataWithUpdatedAt).updatedAt;
  const incomingUpdatedAt = (incomingItem as HomeworkDataWithUpdatedAt).updatedAt;
  if (!localUpdatedAt) return incomingUpdatedAt;
  if (!incomingUpdatedAt) return localUpdatedAt;
  return incomingUpdatedAt >= localUpdatedAt ? incomingUpdatedAt : localUpdatedAt;
}

function nextHomeworkUpdateAt(item?: StudentHomeworkData): string {
  const previous = item ? Date.parse((item as HomeworkDataWithUpdatedAt).updatedAt || '') || 0 : 0;
  return new Date(Math.max(Date.now(), previous + 1)).toISOString();
}

export const DEFAULT_CLASS_23_HOMEWORK_DATA: Record<string, StudentHomeworkData> = {
  std_g2_1: { studentId: 'std_g2_1', studentName: 'Aybüke Yaylak', homeworkCount: 10, fishModelIndex: 0, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_2: { studentId: 'std_g2_2', studentName: 'Betül Sare Topkara', homeworkCount: 11, fishModelIndex: 1, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_3: { studentId: 'std_g2_3', studentName: 'Buğlem Can', homeworkCount: 9, fishModelIndex: 2, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_4: { studentId: 'std_g2_4', studentName: 'Çınar Eymen Karaca', homeworkCount: 10, fishModelIndex: 3, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_5: { studentId: 'std_g2_5', studentName: 'Derin Defne Gökhan', homeworkCount: 10, fishModelIndex: 4, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_6: { studentId: 'std_g2_6', studentName: 'Efekan Yörükoğlu', homeworkCount: 11, fishModelIndex: 5, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_7: { studentId: 'std_g2_7', studentName: 'Elif Su Tekin', homeworkCount: 10, fishModelIndex: 6, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_8: { studentId: 'std_g2_8', studentName: 'Eslem Deri', homeworkCount: 10, fishModelIndex: 7, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_9: { studentId: 'std_g2_9', studentName: 'Eymen Toprak', homeworkCount: 9, fishModelIndex: 8, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_10: { studentId: 'std_g2_10', studentName: 'Güneş Karadoğan', homeworkCount: 9, fishModelIndex: 9, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_11: { studentId: 'std_g2_11', studentName: 'Hatice Kübra', homeworkCount: 10, fishModelIndex: 10, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_12: { studentId: 'std_g2_12', studentName: 'Harun Ali Gökcan', homeworkCount: 10, fishModelIndex: 11, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_13: { studentId: 'std_g2_13', studentName: 'Harun Yıldırım', homeworkCount: 11, fishModelIndex: 12, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_14: { studentId: 'std_g2_14', studentName: 'Miraç Kütük', homeworkCount: 9, fishModelIndex: 13, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_15: { studentId: 'std_g2_15', studentName: 'Muhammed E. Çetin', homeworkCount: 7, fishModelIndex: 14, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_16: { studentId: 'std_g2_16', studentName: 'Osman Emir Öztürk', homeworkCount: 11, fishModelIndex: 15, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_17: { studentId: 'std_g2_17', studentName: 'Ömer Asaf Tekin', homeworkCount: 10, fishModelIndex: 16, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_18: { studentId: 'std_g2_18', studentName: 'Ömer Faruk Öcel', homeworkCount: 8, fishModelIndex: 17, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_19: { studentId: 'std_g2_19', studentName: 'Ravza Fidan', homeworkCount: 10, fishModelIndex: 18, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_20: { studentId: 'std_g2_20', studentName: 'Sudem Can', homeworkCount: 9, fishModelIndex: 19, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_21: { studentId: 'std_g2_21', studentName: 'Umut Kılıç', homeworkCount: 10, fishModelIndex: 20, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_22: { studentId: 'std_g2_22', studentName: 'Zeynep Koç', homeworkCount: 11, fishModelIndex: 21, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() },
  std_g2_23: { studentId: 'std_g2_23', studentName: 'Zilan Demir', homeworkCount: 6, fishModelIndex: 22, lastCompletedDate: getTodayDateString(), createdAt: new Date().toISOString() }
};

// İki ödev veri setini güvenli şekilde birleştir; en yeni öğretmen düzeltmesi yedek değerinden önceliklidir.
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
      // Aynı ID mevcut: tarih damgalı en yeni öğretmen düzeltmesini koru.
      const existingItem = merged[rKey];
      const latestUpdate = getLatestHomeworkUpdateAt(existingItem, rItem);
      const nextItem: HomeworkDataWithUpdatedAt = {
        ...existingItem,
        ...rItem,
        studentName: rItem.studentName || existingItem.studentName,
        homeworkCount: resolveMergedHomeworkCount(existingItem, rItem),
        lastCompletedDate: rItem.lastCompletedDate || existingItem.lastCompletedDate,
        fishModelIndex: rItem.fishModelIndex ?? existingItem.fishModelIndex ?? 0,
        createdAt: existingItem.createdAt || rItem.createdAt || new Date().toISOString()
      };
      if (latestUpdate) nextItem.updatedAt = latestUpdate;
      merged[rKey] = nextItem;
    } else if (rNorm && nameToKeys.has(rNorm)) {
      // Farklı ID ama aynı öğrenci ismi!
      const existingKeys = nameToKeys.get(rNorm)!;
      existingKeys.forEach(exKey => {
        if (merged[exKey]) {
          merged[exKey].homeworkCount = resolveMergedHomeworkCount(merged[exKey], rItem);
          const latestUpdate = getLatestHomeworkUpdateAt(merged[exKey], rItem);
          if (latestUpdate) (merged[exKey] as HomeworkDataWithUpdatedAt).updatedAt = latestUpdate;
          if (rItem.lastCompletedDate && (!merged[exKey].lastCompletedDate || rItem.lastCompletedDate > merged[exKey].lastCompletedDate!)) {
            merged[exKey].lastCompletedDate = rItem.lastCompletedDate;
          }
        }
      });
      // Ayrıca yeni ID ile de eşitle
      const matched = merged[existingKeys[0]];
      const newItem: HomeworkDataWithUpdatedAt = {
        ...rItem,
        homeworkCount: matched ? resolveMergedHomeworkCount(matched, rItem) : rCount
      };
      const latestUpdate = matched ? getLatestHomeworkUpdateAt(matched, rItem) : (rItem as HomeworkDataWithUpdatedAt).updatedAt;
      if (latestUpdate) newItem.updatedAt = latestUpdate;
      merged[rKey] = newItem;
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

// Tarayıcıdaki ilgili kullanıcıya ait ödev yedeklerini toplayıp kurtarır
export function recoverAllPossibleHomeworkData(
  userId?: string | null,
  userEmail?: string | null
): Record<string, StudentHomeworkData> {
  const uid = resolveUserId(userId);
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : currentStoreHomeworkUserEmail;
  const isOlcayto = isOlcaytoUser(cleanEmail);
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
    // 1. Sadece bu kullanıcıya ait bilinen anahtarları kontrol et
    if (uid) {
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_user_${uid}`));
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_backup_${uid}`));
    }
    if (cleanEmail) {
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_user_${cleanEmail}`));
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_backup_${cleanEmail}`));
      checkAndMergeRaw(localStorage.getItem(`odev_akvaryumu_${cleanEmail}`));
    }

    // 2. Global veya legacy yedekler sadece Olcayto Hoca veya misafir için taranır
    if (isOlcayto || (!uid && !cleanEmail)) {
      checkAndMergeRaw(localStorage.getItem(GLOBAL_BACKUP_KEY));
      checkAndMergeRaw(localStorage.getItem('odev_akvaryumu_backup_guest'));
      checkAndMergeRaw(localStorage.getItem(LEGACY_STORAGE_KEY));
    }
  } catch (e) {
    console.error('Kurtarma sırasında tarayıcı depolama okuma hatası:', e);
  }

  // Temizle ve izole et
  accumulated = sanitizeHomeworkForUser(accumulated, cleanEmail);

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
export function loadHomeworkData(
  userId?: string | null,
  userEmail?: string | null
): Record<string, StudentHomeworkData> {
  try {
    const uid = resolveUserId(userId);
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : currentStoreHomeworkUserEmail;
    const isOlcayto = isOlcaytoUser(cleanEmail);
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

    // Kullanıcıya göre temizle (başkasına Olcayto ödevleri sızmışsa ayıkla)
    parsed = sanitizeHomeworkForUser(parsed, cleanEmail);

    // Öğrenci kayıtları mevcut ama puanları 0 olabilir; bu da geçerli ve kalıcı bir durumdur.
    // Yalnızca hiç kayıt yoksa kurtarma/ilk kurulum varsayılanlarını kullan.
    if (Object.keys(parsed).length === 0) {
      const recovered = recoverAllPossibleHomeworkData(uid, cleanEmail);
      const recoveredCount = calculateTotalHomework(recovered);
      if (recoveredCount > 0) {
        parsed = mergeHomeworkData(parsed, recovered);
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
        return parsed;
      } else if (isOlcayto) {
        // Olcayto Hoca için 23 kişilik ödev havuzu
        parsed = { ...DEFAULT_CLASS_23_HOMEWORK_DATA };
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
        return parsed;
      } else if (isMushatUser(cleanEmail)) {
        // Mustafa Hoca için 3/C sınıfı (23 öğrenci) ödev ve balık havuzu
        parsed = { ...MUSHAT_HOMEWORK_DATA };
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
        return parsed;
      } else if (isBanuUser(cleanEmail)) {
        // Banu Hoca için 2-A sınıfı (23 öğrenci) ödev ve balık havuzu
        parsed = { ...BANU_HOMEWORK_DATA };
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
        return parsed;
      } else {
        // Diğer kullanıcılar için temiz boş havuz (kendi öğrencilerini ekledikçe dolar)
        return {};
      }
    }

    // Sınıf şablonları yalnızca eksik öğrencileri tamamlar; kayıtlı puanların üzerine yazmaz.
    const addMissingStudents = (defaults: Record<string, StudentHomeworkData>) => {
      Object.entries(defaults).forEach(([studentId, item]) => {
        if (!parsed[studentId]) parsed[studentId] = { ...item };
      });
    };
    if (isMushatUser(cleanEmail)) {
      addMissingStudents(MUSHAT_HOMEWORK_DATA);
    } else if (isBanuUser(cleanEmail)) {
      addMissingStudents(BANU_HOMEWORK_DATA);
    } else if (isOlcayto) {
      addMissingStudents(DEFAULT_CLASS_23_HOMEWORK_DATA);
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
export function saveHomeworkData(
  data: Record<string, StudentHomeworkData>,
  userId?: string | null,
  userEmail?: string | null,
  options: { authoritative?: boolean } = {}
): void {
  try {
    const uid = resolveUserId(userId);
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : currentStoreHomeworkUserEmail;
    const sanitizedData = sanitizeHomeworkForUser(data, cleanEmail);
    const key = getHomeworkStorageKey(uid);
    const backupKey = getHomeworkBackupKey(uid);
    const serialized = JSON.stringify(sanitizedData);

    // Ana anahtara kaydet
    localStorage.setItem(key, serialized);

    // YEDEK KORUMA KURALI:
    // Eğer mevcut yedekte daha fazla ödev varsa, boş veriyle yedeğin üzerine yazma!
    const newCount = calculateTotalHomework(sanitizedData);
    let shouldUpdateBackup = true;
    try {
      const existingBackupRaw = localStorage.getItem(backupKey);
      if (existingBackupRaw && existingBackupRaw !== '{}') {
        const existingBackup = JSON.parse(existingBackupRaw);
        const existingCount = calculateTotalHomework(existingBackup);
        if (!options.authoritative && existingCount > newCount && newCount === 0) {
          // Yeni gelen veri boş ama yedekte gerçek veri var! Yedeği koru!
          shouldUpdateBackup = false;
        }
      }
    } catch {}

    if (shouldUpdateBackup) {
      localStorage.setItem(backupKey, serialized);
    }

    // Normal kayıtlar global yedeğe pozitif veri yazar. Öğretmenin açık düzeltmesi
    // tüm sınıfı 0'a indirdiyse yalnızca kendi havuzunu kullanan hesapların boşaltmasına izin ver.
    const authoritativeEmptyPool = options.authoritative === true &&
      (isOlcaytoUser(cleanEmail) || (!uid && !cleanEmail));
    if (newCount > 0 || authoritativeEmptyPool) {
      try {
        localStorage.setItem(GLOBAL_BACKUP_KEY, serialized);
        if (authoritativeEmptyPool || !localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) === '{}') {
          localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
        }
      } catch {}
    }

    // Diğer pencerelere ve modal'a güncelleme sinyali gönder
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('odev_akvaryumu_saved', { 
        detail: { userId: uid, count: Object.keys(sanitizedData).length, totalHomeworkCount: newCount } 
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
  const preferHomeworkRecord = (candidate: StudentHomeworkData, previous: StudentHomeworkData): boolean => {
    const candidateAt = (candidate as HomeworkDataWithUpdatedAt).updatedAt || '';
    const previousAt = (previous as HomeworkDataWithUpdatedAt).updatedAt || '';
    if (candidateAt || previousAt) {
      if (!previousAt) return true;
      if (!candidateAt) return false;
      return candidateAt > previousAt;
    }
    return (candidate.homeworkCount || 0) > (previous.homeworkCount || 0);
  };
  Object.values(existingData).forEach(item => {
    if (item && item.studentName) {
      const norm = normalizeStudentName(item.studentName);
      const prev = normalizedNameMap.get(norm);
      if (!prev || preferHomeworkRecord(item, prev)) {
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
        const preferredRecord = normalizedNameMap.get(normName)!;
        updated[st.id].homeworkCount = resolveMergedHomeworkCount(updated[st.id], preferredRecord);
        const latestUpdate = getLatestHomeworkUpdateAt(updated[st.id], preferredRecord);
        if (latestUpdate) (updated[st.id] as HomeworkDataWithUpdatedAt).updatedAt = latestUpdate;
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
        fishModelIndex: idx,
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
  userId?: string | null,
  userEmail?: string | null
): { success: boolean; isAlreadyDone: boolean; newCount: number } {
  const allData = loadHomeworkData(userId, userEmail);
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
    lastCompletedDate: today,
    updatedAt: nextHomeworkUpdateAt(current)
  } as HomeworkDataWithUpdatedAt;

  saveHomeworkData(allData, userId, userEmail);

  return {
    success: true,
    isAlreadyDone: false,
    newCount: nextCount
  };
}

// Bugünkü ödevi geri al (öğretmen modu/düzeltme için)
export function undoTodayHomework(
  studentId: string, 
  userId?: string | null,
  userEmail?: string | null
): boolean {
  const allData = loadHomeworkData(userId, userEmail);
  const today = getTodayDateString();
  const current = allData[studentId];

  if (!current || current.lastCompletedDate !== today) {
    return false;
  }

  current.homeworkCount = Math.max(0, (current.homeworkCount || 1) - 1);
  delete current.lastCompletedDate;
  (current as HomeworkDataWithUpdatedAt).updatedAt = nextHomeworkUpdateAt(current);
  allData[studentId] = current;
  saveHomeworkData(allData, userId, userEmail, { authoritative: true });
  return true;
}

// Öğretmen düzenleme modunda balık puanını bir adım artırır/azaltır.
// Puan 0'ın altına inmez ve manuel değişiklik eski yedeklerden geri alınmaz.
export function adjustHomeworkPoints(
  studentId: string,
  delta: number,
  userId?: string | null,
  userEmail?: string | null
): { success: boolean; newCount: number } {
  if (!studentId || !Number.isFinite(delta) || delta === 0) {
    return { success: false, newCount: 0 };
  }

  const allData = loadHomeworkData(userId, userEmail);
  const current = allData[studentId];
  if (!current) return { success: false, newCount: 0 };

  const newCount = Math.max(0, (current.homeworkCount || 0) + Math.trunc(delta));
  if (newCount === (current.homeworkCount || 0)) {
    return { success: false, newCount };
  }

  allData[studentId] = {
    ...current,
    homeworkCount: newCount,
    updatedAt: nextHomeworkUpdateAt(current)
  } as HomeworkDataWithUpdatedAt;
  saveHomeworkData(allData, userId, userEmail, { authoritative: true });

  return { success: true, newCount };
}

// Balığın büyüme katsayısını hesapla (puanla doğru orantılı)
export function calculateFishScale(homeworkCount: number): number {
  const count = Math.max(0, homeworkCount || 0);
  return 1.0 + count * 0.08;
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
