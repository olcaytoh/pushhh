/**
 * Global Worldwide Visitor Tracking Service
 * Synchronizes website visitor statistics across all computers, tablets, and devices worldwide.
 */

import { ClassCountersData, loadCounters, saveCounters } from './counterStorage';

const GLOBAL_OBJECT_ID = 'ff808181a09d98f701a0cecf70e07d24';
const GLOBAL_API_ENDPOINT = `https://api.restful-api.dev/objects/${GLOBAL_OBJECT_ID}`;
const SESSION_FLAG_KEY = 'olcico_global_visit_session_counted';

export interface GlobalVisitPayload {
  totalVisits: number;
  todayVisits: number;
  lastVisitDate: string; // 'YYYY-MM-DD'
  lastVisitTime: string; // 'DD.MM.YYYY HH:mm'
  updatedAt: string;
}

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getFormattedNow(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Fetch latest worldwide visitor count from the cloud
 */
export async function fetchGlobalVisitorStats(): Promise<GlobalVisitPayload | null> {
  try {
    const res = await fetch(GLOBAL_API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-cache'
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json && json.data && typeof json.data.totalVisits === 'number') {
      return json.data as GlobalVisitPayload;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch global visitor count from cloud', err);
    return null;
  }
}

/**
 * Record a visit globally (increments the worldwide counter if new session).
 * Returns the latest updated ClassCountersData.
 */
export async function syncAndRecordGlobalVisit(onUpdate?: (data: ClassCountersData) => void): Promise<ClassCountersData> {
  const localData = loadCounters();
  const today = getTodayString();
  const nowFormatted = getFormattedNow();

  const isNewSession = typeof window !== 'undefined' && !sessionStorage.getItem(SESSION_FLAG_KEY);

  try {
    // 1. Fetch current worldwide cloud stats
    const cloudStats = await fetchGlobalVisitorStats();

    let newTotal = cloudStats?.totalVisits ?? Math.max(localData.visits.total, 1420);
    let newToday = cloudStats?.todayVisits ?? localData.visits.today;
    const lastDate = cloudStats?.lastVisitDate ?? localData.visits.lastVisitDate;

    if (lastDate !== today) {
      newToday = 0;
    }

    // 2. If this is a new browser visit session, increment global counter
    if (isNewSession) {
      newTotal += 1;
      newToday += 1;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_FLAG_KEY, '1');
      }

      // Send incremented count to global cloud
      fetch(GLOBAL_API_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: {
            totalVisits: newTotal,
            todayVisits: newToday,
            lastVisitDate: today,
            lastVisitTime: nowFormatted,
            updatedAt: new Date().toISOString()
          }
        })
      }).catch(err => {
        console.warn('Background sync to global cloud failed', err);
      });
    }

    // 3. Update local copy with the true worldwide count
    localData.visits.total = newTotal;
    localData.visits.today = newToday;
    localData.visits.lastVisitDate = today;
    localData.visits.lastVisitTime = nowFormatted;
    if (!localData.visits.firstVisitDate) {
      localData.visits.firstVisitDate = nowFormatted;
    }

    saveCounters(localData);
    onUpdate?.(localData);
    return localData;
  } catch (e) {
    console.warn('Global visit sync error', e);
    return localData;
  }
}

/**
 * Force refresh worldwide count (e.g. when teacher opens the modal)
 */
export async function refreshWorldwideVisitorCount(): Promise<number | null> {
  const stats = await fetchGlobalVisitorStats();
  if (stats && typeof stats.totalVisits === 'number') {
    const local = loadCounters();
    local.visits.total = stats.totalVisits;
    if (stats.todayVisits) local.visits.today = stats.todayVisits;
    if (stats.lastVisitTime) local.visits.lastVisitTime = stats.lastVisitTime;
    saveCounters(local);
    return stats.totalVisits;
  }
  return null;
}
