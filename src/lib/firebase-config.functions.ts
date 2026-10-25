import { createServerFn } from "@tanstack/react-start";

// Firebase web config is public by design (security is enforced by Firebase
// Auth + Security Rules), but the key values are stored as project secrets.
export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    apiKey: process.env["GOOGLE_API_KEY"] ?? "",
    authDomain: "health-club-ef145.firebaseapp.com",
    projectId: "health-club-ef145",
    storageBucket: "health-club-ef145.firebasestorage.app",
    messagingSenderId: "1093047138904",
    appId: "1:1093047138904:web:1f166e6ff75b94ebdb682d",
    measurementId: process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "",
  };
});
