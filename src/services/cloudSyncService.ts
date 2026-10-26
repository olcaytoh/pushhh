import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  User 
} from '../firebase';
import { doc, getDoc, getDocFromServer, setDoc } from 'firebase/firestore';
import { Student } from '../types/student';
import { ClassCountersData } from '../utils/counterStorage';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { loadHomeworkData, calculateTotalHomework } from '../utils/homeworkStore';

export interface CloudClassroomData {
  userId: string;
  students: Student[];
  counters: ClassCountersData;
  selectedStudentIds?: (string | null)[] | Record<string, any>;
  homeworkData?: Record<string, StudentHomeworkData>;
  lastSyncedAt: string;
}

export interface SyncStatus {
  isLoggedIn: boolean;
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

const LAST_SYNCED_STORAGE_KEY = 'olcico_last_cloud_synced_at';

export function getLocalLastSyncedAt(userId?: string | null): string | null {
  try {
    const key = userId ? `${LAST_SYNCED_STORAGE_KEY}_${userId}` : LAST_SYNCED_STORAGE_KEY;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalLastSyncedAt(timestamp: string, userId?: string | null): void {
  try {
    const key = userId ? `${LAST_SYNCED_STORAGE_KEY}_${userId}` : LAST_SYNCED_STORAGE_KEY;
    localStorage.setItem(key, timestamp);
  } catch {
    // Ignore storage errors
  }
}

const QUOTA_EXCEEDED_STORAGE_KEY = 'olcico_firestore_quota_exceeded_until';

export function isFirestoreQuotaExceeded(): boolean {
  try {
    const raw = localStorage.getItem(QUOTA_EXCEEDED_STORAGE_KEY);
    if (!raw) return false;
    const expiry = Number(raw);
    if (Date.now() < expiry) {
      return true;
    }
    localStorage.removeItem(QUOTA_EXCEEDED_STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

export function setFirestoreQuotaExceeded(durationMs: number = 3600000 * 6): void {
  try {
    localStorage.setItem(QUOTA_EXCEEDED_STORAGE_KEY, String(Date.now() + durationMs));
  } catch {}
}

export function clearFirestoreQuotaExceeded(): void {
  try {
    localStorage.removeItem(QUOTA_EXCEEDED_STORAGE_KEY);
  } catch {}
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Record or update user profile document (only if quota is not exceeded)
    if (user && !isFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Öğretmen',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (profileErr: any) {
        if (profileErr?.code === 'resource-exhausted' || profileErr?.message?.includes('Quota')) {
          setFirestoreQuotaExceeded();
          console.warn('Firestore write quota limit reached. Using local persistence.');
        }
      }
    }

    return user;
  } catch (error: any) {
    console.error('Google Girişi Hatası:', error);
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Giriş penceresi tarayıcınız tarafından engellendi. Lütfen açılır pencerelere (pop-up) izin verin.');
    } else if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Giriş işlemi iptal edildi.');
    } else if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('Giriş isteği iptal edildi.');
    } else if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const err = new Error('auth/unauthorized-domain');
      (err as any).code = 'auth/unauthorized-domain';
      throw err;
    }
    throw new Error(error?.message || 'Google ile giriş yapılırken bir sorun oluştu.');
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Çıkış Hatası:', error);
    throw error;
  }
}

export type CloudSyncMode = 'smart' | 'manual';

const SYNC_MODE_KEY = 'olcico_cloud_sync_mode';

export function getCloudSyncMode(): CloudSyncMode {
  try {
    const mode = localStorage.getItem(SYNC_MODE_KEY);
    return mode === 'manual' ? 'manual' : 'smart';
  } catch {
    return 'smart';
  }
}

export function setCloudSyncMode(mode: CloudSyncMode): void {
  try {
    localStorage.setItem(SYNC_MODE_KEY, mode);
  } catch {}
}

let lastSyncedDataSignature: string | null = null;

export function setLastSyncedDataSignature(sig: string | null): void {
  lastSyncedDataSignature = sig;
}

/**
 * Saves classroom data (students, stats/counters, selected students) to Firestore cloud
 */
export async function saveUserDataToCloud(
  userId: string,
  students: Student[],
  counters: ClassCountersData,
  selectedStudentIds?: (string | null)[] | Record<string, any>,
  userEmail?: string | null,
  homeworkData?: Record<string, StudentHomeworkData>,
  force: boolean = false
): Promise<string> {
  const timestamp = new Date().toISOString();

  // If quota was already exceeded, avoid spamming Firestore network requests
  if (isFirestoreQuotaExceeded()) {
    setLocalLastSyncedAt(timestamp, userId);
    return timestamp;
  }

  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');

  const payload: Record<string, any> = {
    userId,
    userEmail: userEmail || '',
    studentsJson: JSON.stringify(students),
    countersJson: JSON.stringify(counters),
    selectedStudentIdsJson: selectedStudentIds ? JSON.stringify(selectedStudentIds) : '[]',
    lastSyncedAt: timestamp
  };

  // Ödev akvaryumu verilerini belirle
  const hwToSave = homeworkData !== undefined ? homeworkData : loadHomeworkData(userId);
  const hwKeysLength = hwToSave ? Object.keys(hwToSave).length : 0;
  const hwCount = calculateTotalHomework(hwToSave);

  // KRİTİK VERİ KORUMA:
  // Yalnızca geçerli ödev verisi olduğunda homeworkJson'ı güncelle!
  // Boş veya 0 ödevli geçici nesneyle buluttaki gerçek ödevlerin üzerine ASLA yazma!
  if (hwToSave && hwKeysLength > 0 && (hwCount > 0 || homeworkData !== undefined)) {
    payload.homeworkJson = JSON.stringify(hwToSave);
  }

  // KOTA KORUMA (Dirty-Checking):
  // Veride (öğrenciler, seçili ID'ler, ödevler) gerçek bir değişiklik yoksa Firebase'e boşuna yazma yapma!
  const currentSignature = `${userId}::${payload.studentsJson}::${payload.selectedStudentIdsJson}::${payload.homeworkJson || ''}`;
  if (!force && lastSyncedDataSignature && currentSignature === lastSyncedDataSignature) {
    return getLocalLastSyncedAt(userId) || timestamp;
  }

  try {
    await setDoc(classroomRef, payload, { merge: true });
    lastSyncedDataSignature = currentSignature;
    setLocalLastSyncedAt(timestamp, userId);
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded') || err?.message?.includes('quota')) {
      setFirestoreQuotaExceeded();
      setLocalLastSyncedAt(timestamp, userId);
      console.warn('Firebase günlük yazma kotası aşıldı. Veriler yerel hafızada güvenle tutuluyor.');
      return timestamp;
    }
    throw err;
  }

  return timestamp;
}

/**
 * Loads classroom data from Firestore cloud (checks both userId and optional userEmail)
 */
export async function loadUserDataFromCloud(
  userId: string, 
  userEmail?: string | null
): Promise<CloudClassroomData | null> {
  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');
  let snap: any = null;
  try {
    snap = await getDocFromServer(classroomRef);
  } catch {
    try {
      snap = await getDoc(classroomRef);
    } catch {}
  }

  // If not found in primary uid doc and userEmail is provided, check userEmail doc
  if ((!snap || !snap.exists()) && userEmail && userEmail.trim()) {
    try {
      const emailRef = doc(db, 'users', userEmail.trim().toLowerCase(), 'data', 'classroom');
      try {
        snap = await getDocFromServer(emailRef);
      } catch {
        snap = await getDoc(emailRef);
      }
    } catch {}
  }

  if (!snap || !snap.exists()) {
    return null;
  }

  const data = snap.data();
  let students: Student[] = [];
  let counters: ClassCountersData | null = null;
  let selectedStudentIds: (string | null)[] | undefined = undefined;
  let homeworkData: Record<string, StudentHomeworkData> | undefined = undefined;

  try {
    if (data.studentsJson) {
      students = JSON.parse(data.studentsJson);
    }
  } catch (e) {
    console.warn('Could not parse cloud students JSON', e);
  }

  try {
    if (data.countersJson) {
      counters = JSON.parse(data.countersJson);
    }
  } catch (e) {
    console.warn('Could not parse cloud counters JSON', e);
  }

  try {
    if (data.selectedStudentIdsJson) {
      const parsedIds = JSON.parse(data.selectedStudentIdsJson);
      if (Array.isArray(parsedIds)) {
        selectedStudentIds = parsedIds;
      }
    }
  } catch (e) {
    console.warn('Could not parse cloud selectedStudentIds JSON', e);
  }

  try {
    if (data.homeworkJson) {
      homeworkData = JSON.parse(data.homeworkJson);
    }
  } catch (e) {
    console.warn('Could not parse cloud homeworkJson', e);
  }

  lastSyncedDataSignature = `${userId}::${data.studentsJson || '[]'}::${data.selectedStudentIdsJson || '[]'}::${data.homeworkJson || ''}`;

  return {
    userId,
    students: Array.isArray(students) ? students : [],
    counters: counters || {
      version: 1,
      visits: { total: 0, today: 0, lastVisitDate: '', lastVisitTime: '', firstVisitDate: '' },
      clicks: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, otherGames: 0, englishGames: 0 },
      questions: {
        grade1: { correct: 0, wrong: 0 },
        grade2: { correct: 0, wrong: 0 },
        grade3: { correct: 0, wrong: 0 },
        grade4: { correct: 0, wrong: 0 },
        otherGames: { correct: 0, wrong: 0 },
        englishGames: { correct: 0, wrong: 0 },
      },
    },
    selectedStudentIds,
    homeworkData,
    lastSyncedAt: data.lastSyncedAt || new Date().toISOString()
  };
}

/**
 * Formats ISO timestamp to human friendly Turkish date string
 */
export function formatFriendlyDate(isoString: string | null): string {
  if (!isoString) return 'Henüz senkronize edilmedi';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
