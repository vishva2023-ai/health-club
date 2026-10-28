import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirebaseConfig } from "./firebase-config.functions";

let promise = null;

/** Singleton Firebase initialisation (browser only). */
export function getFirebase() {
  if (!promise) {
    promise = (async () => {
      const config = await getFirebaseConfig();
      if (!config.apiKey) throw new Error("Firebase API key is not configured.");
      const emulated = import.meta.env.DEV && window.location.hostname === 'localhost' && new URLSearchParams(window.location.search).get('firebaseEmulator') === '1';
      const app = getApps().length ? getApp() : initializeApp(emulated ? { ...config, projectId: 'demo-health-club', storageBucket: 'demo-health-club.appspot.com' } : config);
      const services = { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
      if (emulated) {
        connectAuthEmulator(services.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        connectFirestoreEmulator(services.db, '127.0.0.1', 8085);
        connectStorageEmulator(services.storage, '127.0.0.1', 9199);
      }
      if (config.measurementId) {
        import("firebase/analytics")
          .then(async ({ isSupported, getAnalytics }) => { if (await isSupported()) getAnalytics(app); })
          .catch(() => {});
      }
      return services;
    })().catch((error) => { promise = null; throw error; });
  }
  return promise;
}
