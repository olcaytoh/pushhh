import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, disableNetwork } from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore (support named database if provided)
export const db = firebaseConfigData.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

function isQuotaLockedAtBoot(): boolean {
  try {
    const raw = localStorage.getItem('olcico_firestore_quota_exceeded_until');
    return Boolean(raw && Date.now() < Number(raw));
  } catch {
    return false;
  }
}

// Connection test as mandated by Firebase Integration Skill
export async function testConnection(): Promise<void> {
  if (isQuotaLockedAtBoot()) {
    await disableNetwork(db).catch(() => {});
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    const code = String(error?.code || '').toLowerCase();
    const msg = String(error?.message || '').toLowerCase();
    if (code === 'resource-exhausted' || msg.includes('quota')) {
      try {
        localStorage.setItem(
          'olcico_firestore_quota_exceeded_until',
          String(Date.now() + 3600000 * 6)
        );
      } catch {}
      await disableNetwork(db).catch(() => {});
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline or connecting.');
    }
  }
}

// Automatically test connection on import
testConnection().catch(() => {});

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
};

export type { User };
