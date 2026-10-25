import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
  sendEmailVerification, signOut, onAuthStateChanged, setPersistence,
  browserLocalPersistence, browserSessionPersistence, updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

// Firestore role values -> labels used by the existing UI.
export const ROLE_LABELS = { student: "Student", board: "Board member", faculty: "Admin / Faculty", admin: "Admin / Faculty" };

export const isCampusEmail = (email) => /@(vitstudent\.ac\.in|vit\.ac\.in)$/i.test(email.trim());

export async function signIn(email, password, remember) {
  const { auth } = await getFirebase();
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpStudent({ name, email, password, regNo }) {
  const { auth, db } = await getFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name });
  // New accounts are always students; elevated roles are granted by faculty/admin only.
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid, name, email: email.trim().toLowerCase(), regNo: regNo.trim().toUpperCase(),
    role: "student", status: "active", createdAt: serverTimestamp(),
  });
  await sendEmailVerification(cred.user).catch(() => {});
  return cred;
}

export async function resetPassword(email) {
  const { auth } = await getFirebase();
  return sendPasswordResetEmail(auth, email.trim());
}

export async function logOut() {
  const { auth } = await getFirebase();
  return signOut(auth);
}

export async function watchAuth(callback) {
  const { auth, db } = await getFirebase();
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      callback({ user, profile: snap.exists() ? snap.data() : null });
    } catch (error) {
      callback({ user, profile: null, error });
    }
  });
}

export function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email and password don’t match an account.";
  if (code.includes("email-already-in-use")) return "An account already exists for this email.";
  if (code.includes("weak-password")) return "Use a password of at least 6 characters.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("operation-not-allowed")) return "Email sign-in is not enabled in the Firebase project yet.";
  if (code.includes("api-key")) return "The Firebase API key was rejected. Please check the key.";
  if (code.includes("permission-denied")) return "Your profile couldn’t be read. Firestore security rules need to be deployed.";
  return error?.message || "Something went wrong. Please try again.";
}
