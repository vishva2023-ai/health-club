import { collection, doc, query, where, onSnapshot, runTransaction, setDoc, getDoc, serverTimestamp, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebase } from '@/lib/firebase';
import { registrationProblem, attendanceProblem } from './clubPolicy';

export async function subscribeRecords(name, filters, onData, onError) {
  const { db } = await getFirebase();
  const source = filters.length ? query(collection(db, name), ...filters.map(([field, value]) => where(field, field === 'coordinatorIds' ? 'array-contains' : '==', value))) : collection(db, name);
  return onSnapshot(source, (snap) => onData(snap.docs.map((row) => ({ ...row.data(), id: row.id }))), onError);
}
export async function saveRecord(name, id, data) {
  const { db, auth } = await getFirebase();
  if (!auth.currentUser) throw new Error('Your session has ended. Sign in again.');
  if (name === 'events' && !id) {
    if (Number(data.capacity) < 1 || new Date(data.registrationOpens) >= new Date(data.registrationCloses) || new Date(data.registrationCloses) > new Date(data.startsAt)) throw new Error('Check capacity and dates: registration must open before it closes, and close before the activity starts.');
    data = { ...data, registrationOpenAt: Timestamp.fromDate(new Date(data.registrationOpens)), registrationCloseAt: Timestamp.fromDate(new Date(data.registrationCloses)) };
  }
  if (id && data.reviewedBy) {
    const uid = auth.currentUser.uid;
    return runTransaction(db, async (tx) => {
      const parent = doc(db, name, id); const snap = await tx.get(parent);
      if (!snap.exists() || !['submitted', 'resubmitted', 'preliminary-checked'].includes(snap.data().status)) throw new Error('This item has already changed. Refresh and review the current status.');
      tx.set(doc(collection(db, name, id, 'decisions')), { status: data.status, remarks: data.remarks, reviewerId: uid, previousStatus: snap.data().status, decidedAt: serverTimestamp() });
      tx.update(parent, { ...data, updatedAt: serverTimestamp(), updatedBy: uid });
    });
  }
  if (id) return updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid });
  return addDoc(collection(db, name), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: auth.currentUser.uid });
}
export async function registerForActivity(profile, eventId) {
  const { db, auth } = await getFirebase();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  await runTransaction(db, async (tx) => {
    const eventRef = doc(db, 'events', eventId);
    const registrationRef = doc(db, 'registrations', `${eventId}_${uid}`);
    const [eventSnap, registration] = await Promise.all([tx.get(eventRef), tx.get(registrationRef)]);
    if (!eventSnap.exists()) throw new Error('This event is no longer available.');
    if (registration.exists()) throw new Error('You already registered for this event.');
    const event = eventSnap.data();
    const problem = registrationProblem(profile, event);
    if (problem) throw new Error(problem);
    tx.set(registrationRef, { eventId, coordinatorIds: event.coordinatorIds, studentId: uid, studentName: profile.name, regNo: profile.regNo || '', status: 'registered', createdAt: serverTimestamp() });
    tx.update(eventRef, { registrationCount: Number(event.registrationCount || 0) + 1 });
  });
}
export async function recordAttendance(profile, eventId, registrationId) {
  const { db, auth } = await getFirebase();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  await runTransaction(db, async (tx) => {
    const eventRef = doc(db, 'events', eventId);
    const registrationRef = doc(db, 'registrations', registrationId);
    const [eventSnap, regSnap] = await Promise.all([tx.get(eventRef), tx.get(registrationRef)]);
    if (!eventSnap.exists() || !regSnap.exists()) throw new Error('Event or registration not found.');
    const registration = regSnap.data();
    if (registration.eventId !== eventId) throw new Error('This registration belongs to another event.');
    const attendanceRef = doc(db, 'attendance', `${eventId}_${registration.studentId}`);
    const existing = await tx.get(attendanceRef);
    const problem = attendanceProblem(profile, uid, eventSnap.data(), registration, existing.exists() ? existing.data() : null);
    if (problem) throw new Error(problem);
    tx.set(attendanceRef, { eventId, coordinatorIds: eventSnap.data().coordinatorIds, studentId: registration.studentId, studentName: registration.studentName, regNo: registration.regNo, status: 'present', recordedBy: uid, recordedAt: serverTimestamp(), method: 'organizer-verification' });
  });
}
export async function submitReport(report, content, attachments, uid, draft = false) {
  const { db } = await getFirebase();
  const reportRef = report.id ? doc(db, 'reports', report.id) : doc(collection(db, 'reports'));
  await runTransaction(db, async (tx) => {
    const [previous, eventSnap] = await Promise.all([tx.get(reportRef), tx.get(doc(db, 'events', report.eventId))]);
    if (!eventSnap.exists()) throw new Error('Activity not found.');
    const data = previous.exists() ? previous.data() : null;
    if (data && !['draft', 'correction-required'].includes(data.status)) throw new Error('This report cannot be edited now.');
    const version = Number(data?.version || 0) + 1;
    const status = draft ? 'draft' : data?.version ? 'resubmitted' : 'submitted';
    const values = { studentId: uid, coordinatorIds: eventSnap.data().coordinatorIds, eventId: report.eventId, title: report.title, content, attachments, version, status, updatedAt: serverTimestamp(), updatedBy: uid };
    tx.set(doc(db, 'reports', reportRef.id, 'versions', String(version)), { ...values, submittedAt: serverTimestamp() });
    tx.set(reportRef, values, { merge: true });
  });
}
export async function reviseEvent(event, data) {
  const { db, auth } = await getFirebase();
  if (!auth.currentUser) throw new Error('Sign in again.');
  return updateDoc(doc(db, 'events', event.id), { title: data.title, description: data.description, status: 'resubmitted', updatedBy: auth.currentUser.uid, updatedAt: serverTimestamp() });
}
export async function readHistory(collectionName, id, onData, onError) {
  const { db } = await getFirebase();
  return onSnapshot(collection(db, collectionName, id, collectionName === 'reports' ? 'versions' : 'decisions'), (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}
export async function issueCertificate(event, student, uid) {
  const { db } = await getFirebase();
  const attendance = await getDoc(doc(db, 'attendance', `${event.id}_${student.studentId}`));
  if (!attendance.exists()) throw new Error('Verified attendance is required before issuance.');
  await setDoc(doc(db, 'certificates', `${event.id}_${student.studentId}`), { eventId: event.id, studentId: student.studentId, title: event.title, recipient: student.studentName, issuedBy: uid, issuedAt: serverTimestamp(), status: 'issued' });
}
export async function uploadEvidence(file, uid, onProgress) {
  const { storage } = await getFirebase();
  const object = ref(storage, `evidence/${uid}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(object, file);
    task.on('state_changed', (snap) => onProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)), reject, async () => {
      try { resolve({ name: file.name, path: object.fullPath, url: await getDownloadURL(object), uploadedBy: uid }); } catch (e) { reject(e); }
    });
  });
}