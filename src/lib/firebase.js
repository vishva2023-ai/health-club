import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseConfig } from "./firebase-config.functions";

let promise = null;

/** Singleton Firebase initialisation (browser only). */
export function getFirebase() {
  if (!promise) {
    promise = (async () => {
      const config = await getFirebaseConfig();
      if (!config.apiKey) throw new Error("Firebase API key is not configured.");
      const app = getApps().length ? getApp() : initializeApp(config);
      const services = { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
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
