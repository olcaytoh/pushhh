import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  User 
} from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Student } from '../types/student';
import { ClassCountersData } from '../utils/counterStorage';

export interface CloudClassroomData {
  userId: string;
  students: Student[];
  counters: ClassCountersData;
  selectedStudentIds?: (string | null)[] | Record<string, any>;
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

export function getLocalLastSyncedAt(): string | null {
  try {
    return localStorage.getItem(LAST_SYNCED_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLocalLastSyncedAt(timestamp: string): void {
  try {
    localStorage.setItem(LAST_SYNCED_STORAGE_KEY, timestamp);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Record or update user profile document
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Öğretmen',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
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

/**
 * Saves classroom data (students, stats/counters, selected students) to Firestore cloud
 */
export async function saveUserDataToCloud(
  userId: string,
  students: Student[],
  counters: ClassCountersData,
  selectedStudentIds?: (string | null)[] | Record<string, any>
): Promise<string> {
  const timestamp = new Date().toISOString();
  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');

  const payload = {
    userId,
    studentsJson: JSON.stringify(students),
    countersJson: JSON.stringify(counters),
    selectedStudentIdsJson: selectedStudentIds ? JSON.stringify(selectedStudentIds) : '{}',
    lastSyncedAt: timestamp
  };

  await setDoc(classroomRef, payload, { merge: true });
  setLocalLastSyncedAt(timestamp);

  return timestamp;
}

/**
 * Loads classroom data from Firestore cloud
 */
export async function loadUserDataFromCloud(userId: string): Promise<CloudClassroomData | null> {
  const classroomRef = doc(db, 'users', userId, 'data', 'classroom');
  const snap = await getDoc(classroomRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  let students: Student[] = [];
  let counters: ClassCountersData | null = null;
  let selectedStudentIds: Record<string, string[]> | undefined = undefined;

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
      selectedStudentIds = JSON.parse(data.selectedStudentIdsJson);
    }
  } catch (e) {
    console.warn('Could not parse cloud selectedStudentIds JSON', e);
  }

  if (!counters) {
    return null;
  }

  return {
    userId,
    students,
    counters,
    selectedStudentIds,
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
