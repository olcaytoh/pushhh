import { User, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Student } from '../types/student';
import { ClassCountersData } from '../utils/counterStorage';
import { loadHomeworkData } from '../utils/homeworkStore';
import { saveUserDataToCloud, isFirestoreQuotaExceeded } from './cloudSyncService';
import { saveToMultiUserVault } from '../utils/studentStore';

const AUTO_BACKUP_PREFIX = 'olcico_auto_backup_done_';
const LAST_AUTO_BACKUP_KEY = 'olcico_last_auto_backup_time';

export interface DailyBackupStatus {
  isDoneToday: boolean;
  lastBackupTimeFormatted: string | null;
  targetTime: string; // "10:00"
}

function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDailyBackupStatus(userId?: string | null): DailyBackupStatus {
  try {
    const today = getTodayKey();
    const uid = userId || 'guest';
    const flag = localStorage.getItem(`${AUTO_BACKUP_PREFIX}${today}_${uid}`);
    const lastTime = localStorage.getItem(LAST_AUTO_BACKUP_KEY);

    let formatted: string | null = null;
    if (lastTime) {
      const dt = new Date(lastTime);
      formatted = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }

    return {
      isDoneToday: flag === 'true',
      lastBackupTimeFormatted: formatted,
      targetTime: '10:00'
    };
  } catch {
    return {
      isDoneToday: false,
      lastBackupTimeFormatted: null,
      targetTime: '10:00'
    };
  }
}

/**
 * Executes a full automatic snapshot backup at 10:00 AM (or on first opening after 10:00 AM)
 */
export async function executeDailyAutoBackup(
  user: User | null,
  students: Student[],
  counters: ClassCountersData,
  selectedStudentIds: (string | null)[],
  onToast?: (msg: string) => void
): Promise<boolean> {
  try {
    const today = getTodayKey();
    const uid = user ? user.uid : 'guest';
    const email = user?.email || null;
    const nowIso = new Date().toISOString();

    // 1. Save local snapshot
    const backupSnapshot = {
      createdAt: nowIso,
      date: today,
      user: {
        uid: user?.uid || null,
        email: user?.email || null,
        displayName: user?.displayName || null
      },
      students,
      counters,
      selectedStudentIds
    };

    try {
      localStorage.setItem(`olcico_daily_snapshot_${today}_${uid}`, JSON.stringify(backupSnapshot));
      localStorage.setItem(LAST_AUTO_BACKUP_KEY, nowIso);
      localStorage.setItem(`${AUTO_BACKUP_PREFIX}${today}_${uid}`, 'true');
    } catch (e) {
      console.warn('Local snapshot save error:', e);
    }

    // 2. Also save to multi-user vault
    if (uid) saveToMultiUserVault(uid, students);
    if (email) saveToMultiUserVault(email, students);

    // 3. If logged into Google/Firebase, upload to Cloud
    if (user && !isFirestoreQuotaExceeded()) {
      try {
        const hwData = loadHomeworkData(user.uid, user.email);
        await saveUserDataToCloud(user.uid, students, counters, selectedStudentIds, user.email, hwData, true);

        // Dedicated daily backup document in Firestore subcollection
        const dailyRef = doc(db, 'users', user.uid, 'daily_backups', today);
        await setDoc(dailyRef, {
          date: today,
          backedUpAt: nowIso,
          scheduledTarget: '10:00',
          studentsCount: students.length,
          studentsJson: JSON.stringify(students),
          countersJson: JSON.stringify(counters),
          userEmail: email
        }, { merge: true });
      } catch (cloudErr) {
        console.warn('Auto backup cloud push warning:', cloudErr);
      }
    }

    onToast?.(`⏰ Saat 10:00 Otomatik Yedekleme: Sınıfınız ve verileriniz başarıyla yedeklendi (${today}).`);
    return true;
  } catch (err) {
    console.error('executeDailyAutoBackup error:', err);
    return false;
  }
}

/**
 * Initializes the background scheduled timer for daily 10:00 AM backup.
 * Runs check immediately and every 30 seconds.
 */
export function startDailyAutoBackupScheduler(
  getCurrentState: () => {
    user: User | null;
    students: Student[];
    counters: ClassCountersData;
    selectedStudentIds: (string | null)[];
  },
  onToast?: (msg: string) => void
): () => void {
  const checkAndRun = () => {
    try {
      const now = new Date();
      const currentHours = now.getHours();
      const today = getTodayKey();
      const { user, students, counters, selectedStudentIds } = getCurrentState();
      const uid = user ? user.uid : 'guest';

      const alreadyDone = localStorage.getItem(`${AUTO_BACKUP_PREFIX}${today}_${uid}`) === 'true';

      // Trigger if it is 10:00 or later today and not yet backed up today
      if (currentHours >= 10 && !alreadyDone && students && students.length > 0) {
        executeDailyAutoBackup(user, students, counters, selectedStudentIds, onToast);
      }
    } catch (e) {
      console.warn('Daily auto-backup scheduler check error:', e);
    }
  };

  // Immediate check on mount/start
  checkAndRun();

  // Periodic check every 30 seconds
  const intervalId = setInterval(checkAndRun, 30000);

  return () => clearInterval(intervalId);
}
