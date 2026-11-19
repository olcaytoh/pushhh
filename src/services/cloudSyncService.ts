import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  db, 
  User 
} from '../firebase';
import { doc, getDoc, getDocFromServer, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Student } from '../types/student';
import { StatRecord, GroupStatsRecord, SinglePlayerStatsRecord } from '../types';
import { ClassCountersData, loadCounters, sanitizeCountersForUser } from '../utils/counterStorage';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { loadHomeworkData, calculateTotalHomework, sanitizeHomeworkForUser } from '../utils/homeworkStore';
import { 
  mergeStudentLists, 
  calculateStudentListTotalSolved, 
  saveToMultiUserVault, 
  loadFromMultiUserVault,
  sanitizeStudentsForUser,
  deduplicateStudents
} from '../utils/studentStore';

export interface CloudClassroomData {
  userId: string;
  students: Student[];
  counters: ClassCountersData;
  selectedStudentIds?: (string | null)[] | Record<string, any>;
  homeworkData?: Record<string, StudentHomeworkData>;
  singleStatsData?: SinglePlayerStatsRecord;
  statsData?: Record<string, StatRecord>;
  groupStatsData?: GroupStatsRecord;
  lastSyncedAt: string;
}

export function loadLocalGameStats(): {
  singleStats: SinglePlayerStatsRecord;
  statsData: Record<string, StatRecord>;
  groupStats: GroupStatsRecord;
} {
  let singleStats: SinglePlayerStatsRecord = { dogru: 0, yanlis: 0, wins: 0, topicStats: {} };
  let statsData: Record<string, StatRecord> = {};
  let groupStats: GroupStatsRecord = {};

  try {
    const rawSingle = localStorage.getItem('mathGameSingleStats_v1');
    if (rawSingle) singleStats = JSON.parse(rawSingle);
  } catch {}

  try {
    const rawStats = localStorage.getItem('mathGameStats_v1');
    if (rawStats) statsData = JSON.parse(rawStats);
  } catch {}

  try {
    const rawGroup = localStorage.getItem('mathGameGroupStats_v1');
    if (rawGroup) groupStats = JSON.parse(rawGroup);
  } catch {}

  return { singleStats, statsData, groupStats };
}

export function mergeSingleStats(
  a: SinglePlayerStatsRecord | undefined,
  b: SinglePlayerStatsRecord | undefined
): SinglePlayerStatsRecord {
  if (!a) return b || { dogru: 0, yanlis: 0, wins: 0, topicStats: {} };
  if (!b) return a;

  const mergedTopicStats: Record<string, StatRecord> = { ...(a.topicStats || {}) };
  if (b.topicStats) {
    Object.entries(b.topicStats).forEach(([key, statB]) => {
      const statA = mergedTopicStats[key];
      if (!statA) {
        mergedTopicStats[key] = { ...statB };
      } else {
        mergedTopicStats[key] = {
          dogru: Math.max(statA.dogru || 0, statB.dogru || 0),
          yanlis: Math.max(statA.yanlis || 0, statB.yanlis || 0)
        };
      }
    });
  }

  let totalDogru = 0;
  let totalYanlis = 0;
  Object.values(mergedTopicStats).forEach(s => {
    totalDogru += s.dogru || 0;
    totalYanlis += s.yanlis || 0;
  });

  return {
    dogru: Math.max(totalDogru, Math.max(a.dogru || 0, b.dogru || 0)),
    yanlis: Math.max(totalYanlis, Math.max(a.yanlis || 0, b.yanlis || 0)),
    wins: Math.max(a.wins || 0, b.wins || 0),
    topicStats: mergedTopicStats
  };
}

export function mergeStatsRecords(
  a: Record<string, StatRecord> | undefined,
  b: Record<string, StatRecord> | undefined
): Record<string, StatRecord> {
  const result: Record<string, StatRecord> = { ...(a || {}) };
  if (!b) return result;
  Object.entries(b).forEach(([key, statB]) => {
    const statA = result[key];
    if (!statA) {
      result[key] = { ...statB };
    } else {
      result[key] = {
        dogru: Math.max(statA.dogru || 0, statB.dogru || 0),
        yanlis: Math.max(statA.yanlis || 0, statB.yanlis || 0)
      };
    }
  });
  return result;
}

export function mergeGroupStats(
  a: GroupStatsRecord | undefined,
  b: GroupStatsRecord | undefined
): GroupStatsRecord {
  const result: GroupStatsRecord = { ...(a || {}) };
  if (!b) return result;
  Object.entries(b).forEach(([grpKey, grpB]) => {
    const grpA = result[grpKey];
    if (!grpA) {
      result[grpKey] = { ...grpB };
    } else {
      const mergedTopics: Record<string, any> = { ...(grpA.topicStats || {}) };
      if (grpB.topicStats) {
        Object.entries(grpB.topicStats).forEach(([topKey, tB]) => {
          const tA = mergedTopics[topKey];
          if (!tA) {
            mergedTopics[topKey] = { ...tB };
          } else {
            mergedTopics[topKey] = {
              dogru: Math.max(tA.dogru || 0, tB.dogru || 0),
              yanlis: Math.max(tA.yanlis || 0, tB.yanlis || 0)
            };
          }
        });
      }
      result[grpKey] = {
        ...grpA,
        dogru: Math.max(grpA.dogru || 0, grpB.dogru || 0),
        yanlis: Math.max(grpA.yanlis || 0, grpB.yanlis || 0),
        wins: Math.max(grpA.wins || 0, grpB.wins || 0),
        topicStats: mergedTopics
      };
    }
  });
  return result;
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

let isSignInInProgress = false;

async function recordUserProfile(user: User): Promise<void> {
  if (!user || isFirestoreQuotaExceeded()) return;
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

/**
 * Checks for a redirect sign-in result on page load/mount
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await recordUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.warn('Redirect result check:', error);
    return null;
  }
}

/**
 * Sign in with Google Redirect (Bypasses popup blockers completely)
 */
export async function signInWithRedirectGoogle(): Promise<void> {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Google Redirect Girişi Hatası:', error);
    throw new Error(error?.message || 'Google yönlendirmesi başlatılamadı.');
  }
}

/**
 * Sign in with Google Popup (with duplicate guard & helpful guidance)
 */
export async function signInWithGoogle(): Promise<User> {
  if (isSignInInProgress) {
    throw new Error('Giriş penceresi şu an açık. Lütfen açılan Google penceresinden hesabınızı seçin.');
  }

  isSignInInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await recordUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Google Girişi Hatası:', error);
    const code = error?.code || '';
    const msg = error?.message || '';

    if (code === 'auth/popup-blocked') {
      const err: any = new Error('Giriş penceresi (pop-up) tarayıcınız tarafından engellendi. Pop-up izni verin veya "Yönlendirme ile Giriş Yap" seçeneğini kullanın.');
      err.code = 'auth/popup-blocked';
      throw err;
    } else if (code === 'auth/popup-closed-by-user') {
      const err: any = new Error('Giriş penceresi kapatıldı veya tarayıcınız tarafından engellendi. "Yönlendirme ile Giriş Yap" butonuna basarak pop-up olmadan doğrudan giriş yapabilirsiniz.');
      err.code = 'auth/popup-closed-by-user';
      throw err;
    } else if (code === 'auth/cancelled-popup-request') {
      const err: any = new Error('Önceki giriş isteği tamamlanmadan yeni istek yapıldı. Lütfen birkaç saniye bekleyip tekrar deneyin.');
      err.code = 'auth/cancelled-popup-request';
      throw err;
    } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      const err: any = new Error('auth/unauthorized-domain');
      err.code = 'auth/unauthorized-domain';
      throw err;
    }
    throw new Error(error?.message || 'Google ile giriş yapılırken bir sorun oluştu.');
  } finally {
    isSignInInProgress = false;
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
 * Saves classroom data (students, stats/counters, selected students) to Firestore cloud.
 * ALWAYS merges with existing cloud data first to prevent ANY possibility of overwriting
 * populated classrooms with empty/default student lists.
 */
/**
 * Saves classroom data (students, stats/counters, selected students, and all game stats) to Firestore cloud.
 * ALWAYS merges with existing cloud data first to prevent ANY possibility of overwriting
 * populated classrooms with empty/default student lists.
 */
export async function saveUserDataToCloud(
  userId: string,
  students: Student[],
  counters: ClassCountersData,
  selectedStudentIds?: (string | null)[] | Record<string, any>,
  userEmail?: string | null,
  homeworkData?: Record<string, StudentHomeworkData>,
  force: boolean = false,
  extraStats?: {
    singleStats?: SinglePlayerStatsRecord;
    statsData?: Record<string, StatRecord>;
    groupStats?: GroupStatsRecord;
  }
): Promise<string> {
  const timestamp = new Date().toISOString();

  // If quota was already exceeded, avoid spamming Firestore network requests
  if (isFirestoreQuotaExceeded()) {
    setLocalLastSyncedAt(timestamp, userId);
    return timestamp;
  }

  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');

  // Direct persistence of the active roster
  const studentsToPersist = deduplicateStudents(students, userEmail);

  // Multi-user vault'a hemen kaydet (yerel çifte yedek)
  saveToMultiUserVault(userId, studentsToPersist, { userId, userEmail: userEmail || undefined });
  if (userEmail) {
    saveToMultiUserVault(userEmail.toLowerCase(), studentsToPersist, { userId, userEmail });
  }

  // Load and bundle all game statistics so other open devices (MacBook, PC, smartboard) see every solved question
  const localStats = loadLocalGameStats();
  const singleStatsToPersist = extraStats?.singleStats || localStats.singleStats;
  const statsDataToPersist = extraStats?.statsData || localStats.statsData;
  const groupStatsToPersist = extraStats?.groupStats || localStats.groupStats;

  const payload: Record<string, any> = {
    userId,
    userEmail: userEmail || '',
    studentsJson: JSON.stringify(studentsToPersist),
    countersJson: JSON.stringify(counters),
    selectedStudentIdsJson: selectedStudentIds ? JSON.stringify(selectedStudentIds) : '[]',
    singleStatsJson: JSON.stringify(singleStatsToPersist),
    statsJson: JSON.stringify(statsDataToPersist),
    groupStatsJson: JSON.stringify(groupStatsToPersist),
    lastSyncedAt: timestamp
  };

  // Ödev akvaryumu verilerini belirle ve hesaba göre izole et
  const rawHw = homeworkData !== undefined ? homeworkData : loadHomeworkData(userId, userEmail);
  const hwToSave = sanitizeHomeworkForUser(rawHw, userEmail);
  const hwKeysLength = hwToSave ? Object.keys(hwToSave).length : 0;
  const hwCount = calculateTotalHomework(hwToSave);

  if (hwToSave && hwKeysLength > 0 && (hwCount > 0 || homeworkData !== undefined)) {
    payload.homeworkJson = JSON.stringify(hwToSave);
  }

  // Dirty-Checking (Kota Tasarrufu)
  const currentSignature = `${userId}::${payload.studentsJson}::${payload.singleStatsJson}::${payload.statsJson}::${payload.groupStatsJson}::${payload.selectedStudentIdsJson}::${payload.homeworkJson || ''}`;
  if (!force && lastSyncedDataSignature && currentSignature === lastSyncedDataSignature) {
    return getLocalLastSyncedAt(userId) || timestamp;
  }

  try {
    await setDoc(classroomRef, payload, { merge: true });

    // Ayrıca e-posta ile erişim için email belgesine de ayna kopya kaydet
    if (userEmail && userEmail.trim()) {
      try {
        const emailRef = doc(db, 'users', userEmail.trim().toLowerCase(), 'data', 'classroom');
        await setDoc(emailRef, payload, { merge: true });
      } catch {}
    }

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
 * Loads classroom data from Firestore cloud.
 * Thoroughly searches UID doc, Email doc, Root user doc, and Root email doc,
 * intelligently merging all discovered student rosters, game statistics, and homework data.
 */
export async function loadUserDataFromCloud(
  userId: string, 
  userEmail?: string | null
): Promise<CloudClassroomData | null> {
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : null;
  const candidateRefs: any[] = [];

  // 1. Primary UID classroom subcollection
  candidateRefs.push(doc(db, 'users', userId, 'data', 'classroom'));

  // 2. Email classroom subcollection
  if (cleanEmail) {
    candidateRefs.push(doc(db, 'users', cleanEmail, 'data', 'classroom'));
  }

  // 3. Fallback to root user docs (in case data was stored at root)
  candidateRefs.push(doc(db, 'users', userId));
  if (cleanEmail) {
    candidateRefs.push(doc(db, 'users', cleanEmail));
  }

  let mergedStudents: Student[] = [];
  let mergedCounters: ClassCountersData | null = null;
  let mergedSelectedStudentIds: (string | null)[] | undefined = undefined;
  let mergedHomeworkData: Record<string, StudentHomeworkData> = {};
  let mergedSingleStats: SinglePlayerStatsRecord = { dogru: 0, yanlis: 0, wins: 0, topicStats: {} };
  let mergedStatsData: Record<string, StatRecord> = {};
  let mergedGroupStats: GroupStatsRecord = {};
  let latestTimestamp = '';
  let foundAnyDoc = false;

  for (const ref of candidateRefs) {
    let snap: any = null;
    try {
      snap = await getDocFromServer(ref);
    } catch {
      try {
        snap = await getDoc(ref);
      } catch {}
    }

    if (!snap || !snap.exists()) continue;
    foundAnyDoc = true;
    const data = snap.data();

    // Parse students (supports both studentsJson string and students array)
    try {
      let docStudents: Student[] = [];
      if (data.studentsJson) {
        docStudents = JSON.parse(data.studentsJson);
      } else if (Array.isArray(data.students)) {
        docStudents = data.students;
      }
      if (Array.isArray(docStudents) && docStudents.length > 0) {
        if (mergedStudents.length === 0) {
          mergedStudents = deduplicateStudents(docStudents, cleanEmail);
        } else {
          mergedStudents = mergeStudentLists(mergedStudents, docStudents, cleanEmail);
        }
      }
    } catch (e) {
      console.warn('Could not parse cloud students', e);
    }

    // Parse counters
    try {
      if (!mergedCounters) {
        if (data.countersJson) {
          mergedCounters = JSON.parse(data.countersJson);
        } else if (data.counters && typeof data.counters === 'object') {
          mergedCounters = data.counters;
        }
      }

      if (mergedCounters) {
        mergedCounters = sanitizeCountersForUser(mergedCounters, cleanEmail);
      }
    } catch (e) {
      console.warn('Could not parse cloud counters', e);
    }

    // Parse selected students
    try {
      if (!mergedSelectedStudentIds) {
        if (data.selectedStudentIdsJson) {
          const parsedIds = JSON.parse(data.selectedStudentIdsJson);
          if (Array.isArray(parsedIds)) mergedSelectedStudentIds = parsedIds;
        } else if (Array.isArray(data.selectedStudentIds)) {
          mergedSelectedStudentIds = data.selectedStudentIds;
        }
      }
    } catch (e) {
      console.warn('Could not parse cloud selectedStudentIds', e);
    }

    // Parse single player stats
    try {
      if (data.singleStatsJson) {
        const parsed = JSON.parse(data.singleStatsJson);
        if (parsed && typeof parsed === 'object') {
          mergedSingleStats = mergeSingleStats(mergedSingleStats, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse cloud singleStats', e);
    }

    // Parse global statsData
    try {
      if (data.statsJson) {
        const parsed = JSON.parse(data.statsJson);
        if (parsed && typeof parsed === 'object') {
          mergedStatsData = mergeStatsRecords(mergedStatsData, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse cloud statsData', e);
    }

    // Parse group stats
    try {
      if (data.groupStatsJson) {
        const parsed = JSON.parse(data.groupStatsJson);
        if (parsed && typeof parsed === 'object') {
          mergedGroupStats = mergeGroupStats(mergedGroupStats, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse cloud groupStats', e);
    }

    // Parse homework data
    try {
      let docHw: Record<string, StudentHomeworkData> | null = null;
      if (data.homeworkJson) {
        docHw = JSON.parse(data.homeworkJson);
      } else if (data.homeworkData && typeof data.homeworkData === 'object') {
        docHw = data.homeworkData;
      }
      if (docHw && Object.keys(docHw).length > 0) {
        const cleanedHw = sanitizeHomeworkForUser(docHw, cleanEmail);
        mergedHomeworkData = { ...mergedHomeworkData, ...cleanedHw };
      }
    } catch (e) {
      console.warn('Could not parse cloud homework data', e);
    }

    if (data.lastSyncedAt && (!latestTimestamp || data.lastSyncedAt > latestTimestamp)) {
      latestTimestamp = data.lastSyncedAt;
    }
  }

  // Also merge with multi-user vault for this user so nothing is missed
  const fromVaultUid = loadFromMultiUserVault(userId);
  if (fromVaultUid) mergedStudents = mergeStudentLists(mergedStudents, sanitizeStudentsForUser(fromVaultUid, cleanEmail), cleanEmail);
  if (cleanEmail) {
    const fromVaultEmail = loadFromMultiUserVault(cleanEmail);
    if (fromVaultEmail) mergedStudents = mergeStudentLists(mergedStudents, sanitizeStudentsForUser(fromVaultEmail, cleanEmail), cleanEmail);
  }

  // Final sanitization check
  mergedStudents = sanitizeStudentsForUser(mergedStudents, cleanEmail);

  if (mergedStudents.length > 0) {
    saveToMultiUserVault(userId, mergedStudents, { userId, userEmail: userEmail || undefined });
    if (cleanEmail) {
      saveToMultiUserVault(cleanEmail, mergedStudents, { userId, userEmail: cleanEmail });
    }
  }

  if (!foundAnyDoc && mergedStudents.length === 0) {
    return null;
  }

  return {
    userId,
    students: deduplicateStudents(mergedStudents, cleanEmail),
    counters: mergedCounters || loadCounters(cleanEmail),
    selectedStudentIds: mergedSelectedStudentIds,
    homeworkData: Object.keys(mergedHomeworkData).length > 0 ? mergedHomeworkData : undefined,
    singleStatsData: (mergedSingleStats.dogru > 0 || mergedSingleStats.yanlis > 0 || Object.keys(mergedSingleStats.topicStats || {}).length > 0) ? mergedSingleStats : undefined,
    statsData: Object.keys(mergedStatsData).length > 0 ? mergedStatsData : undefined,
    groupStatsData: Object.keys(mergedGroupStats).length > 0 ? mergedGroupStats : undefined,
    lastSyncedAt: latestTimestamp || new Date().toISOString()
  };
}

/**
 * Subscribes in real-time to Firestore classroom document changes.
 * Allows multiple open devices (e.g. school computer, smartboard, and home MacBook)
 * to instantly reflect questions solved on any device without requiring a manual refresh.
 */
export function subscribeToUserDataInCloud(
  userId: string,
  userEmail: string | null | undefined,
  onData: (data: CloudClassroomData) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : null;
  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');

  return onSnapshot(
    classroomRef,
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (!data) return;

      try {
        let docStudents: Student[] = [];
        if (data.studentsJson) {
          docStudents = JSON.parse(data.studentsJson);
        } else if (Array.isArray(data.students)) {
          docStudents = data.students;
        }
        const cleanedStudents = deduplicateStudents(sanitizeStudentsForUser(docStudents, cleanEmail), cleanEmail);

        let counters: ClassCountersData | null = null;
        if (data.countersJson) {
          counters = JSON.parse(data.countersJson);
        } else if (data.counters && typeof data.counters === 'object') {
          counters = data.counters;
        }
        const cleanedCounters = sanitizeCountersForUser(counters || loadCounters(cleanEmail), cleanEmail);

        let selectedStudentIds: (string | null)[] | undefined = undefined;
        if (data.selectedStudentIdsJson) {
          try {
            const parsed = JSON.parse(data.selectedStudentIdsJson);
            if (Array.isArray(parsed)) selectedStudentIds = parsed;
          } catch {}
        }

        let homeworkData: Record<string, StudentHomeworkData> | undefined = undefined;
        if (data.homeworkJson) {
          try {
            const parsedHw = JSON.parse(data.homeworkJson);
            if (parsedHw && typeof parsedHw === 'object') {
              homeworkData = sanitizeHomeworkForUser(parsedHw, cleanEmail);
            }
          } catch {}
        }

        let singleStatsData: SinglePlayerStatsRecord | undefined = undefined;
        if (data.singleStatsJson) {
          try {
            singleStatsData = JSON.parse(data.singleStatsJson);
          } catch {}
        }

        let statsData: Record<string, StatRecord> | undefined = undefined;
        if (data.statsJson) {
          try {
            statsData = JSON.parse(data.statsJson);
          } catch {}
        }

        let groupStatsData: GroupStatsRecord | undefined = undefined;
        if (data.groupStatsJson) {
          try {
            groupStatsData = JSON.parse(data.groupStatsJson);
          } catch {}
        }

        onData({
          userId,
          students: cleanedStudents,
          counters: cleanedCounters,
          selectedStudentIds,
          homeworkData,
          singleStatsData,
          statsData,
          groupStatsData,
          lastSyncedAt: data.lastSyncedAt || new Date().toISOString()
        });
      } catch (err) {
        console.warn('Realtime cloud sync parse error:', err);
      }
    },
    (error) => {
      console.warn('Realtime cloud sync listener warning:', error);
      if (onError) onError(error);
    }
  );
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
