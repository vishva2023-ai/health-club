import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
  sendEmailVerification, signOut, onAuthStateChanged, setPersistence,
  browserLocalPersistence, browserSessionPersistence, updateProfile,
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
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

// A login account can exist without its club profile (for example after a
// console-created Auth account). Recovery never assigns operational roles.
export async function recoverStudentProfile({ name, regNo }) {
  const { auth, db } = await getFirebase();
  const user = auth.currentUser;
  if (!user || !isCampusEmail(user.email || '')) throw new Error('Sign in with your VIT account first.');
  if (!name?.trim() || !regNo?.trim()) throw new Error('Name and register number are required.');
  return runTransaction(db, async (tx) => {
    const target = doc(db, 'users', user.uid);
    if ((await tx.get(target)).exists()) throw new Error('A profile already exists. Refresh to open it.');
    tx.set(target, { uid: user.uid, name: name.trim(), email: user.email.toLowerCase(), regNo: regNo.trim().toUpperCase(), role: 'student', status: 'active', createdAt: serverTimestamp() });
  });
}

export async function watchAuth(callback) {
  const { auth, db } = await getFirebase();
  let stopProfile = () => {};
  let generation = 0;
  const stopAuth = onAuthStateChanged(auth, (user) => {
    const current = ++generation;
    stopProfile();
    if (!user) { callback(null); return; }
    stopProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (current === generation) callback({ user, profile: snap.exists() ? snap.data() : null });
    }, (error) => { if (current === generation) callback({ user, profile: null, error }); });
  });
  return () => { generation++; stopAuth(); stopProfile(); };
}

export function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email and password don’t match an account.";
  if (code.includes("email-already-in-use")) return "An account already exists for this email.";
  if (code.includes("weak-password")) return "Use a password of at least 6 characters.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("operation-not-allowed")) return "Email sign-in is not enabled in the Firebase project yet.";
  if (code.includes("api-key")) return "The Firebase API key was rejected. Please check the key.";
  if (code.includes("permission-denied")) return "Sign-in worked, but Firestore denied this operation. Check the configured project, published rules, profile path, and assigned permissions.";
  return error?.message || "Something went wrong. Please try again.";
}
