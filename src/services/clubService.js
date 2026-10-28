import { collection, doc, query, where, onSnapshot, runTransaction, setDoc, getDoc, serverTimestamp, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getBlob } from 'firebase/storage';
import { getFirebase } from '@/lib/firebase';
import { registrationProblem, attendanceProblem, isFaculty, isBoard, canCoordinate } from './clubPolicy';
import { applicationProblem, reviewProblem } from './workflowPolicy';
import { organizerUpdateProblem, boardSelfAttendanceProblem } from './attendancePolicy';

export async function subscribeRecords(name, filters, onData, onError) {
  const { db } = await getFirebase();
  const source = filters.length ? query(collection(db, name), ...filters.map(([field, value]) => where(field, field === 'coordinatorIds' ? 'array-contains' : '==', value))) : collection(db, name);
  return onSnapshot(source, (snap) => onData(snap.docs.map((row) => ({ ...row.data(), id: row.id }))), onError);
}
export async function saveRecord(name, id, data) {
  const { db, auth } = await getFirebase();
  if (!auth.currentUser) throw new Error('Your session has ended. Sign in again.');
  if (name === 'users' && data.role === 'board') {
    if (!data.appointmentStarts || !data.appointmentEnds || new Date(data.appointmentStarts) >= new Date(data.appointmentEnds)) throw new Error('Board appointments require valid start and end dates.');
    data = { ...data, appointmentOpenAt: Timestamp.fromDate(new Date(data.appointmentStarts)), appointmentCloseAt: Timestamp.fromDate(new Date(data.appointmentEnds)) };
  }
  if (name === 'events' && !id) {
    if (Number(data.capacity) < 1 || new Date(data.registrationOpens) >= new Date(data.registrationCloses) || new Date(data.registrationCloses) > new Date(data.startsAt)) throw new Error('Check capacity and dates: registration must open before it closes, and close before the activity starts.');
    data = { ...data, registrationOpenAt: Timestamp.fromDate(new Date(data.registrationOpens)), registrationCloseAt: Timestamp.fromDate(new Date(data.registrationCloses)) };
  }
  if (id && data.reviewedBy) {
    const uid = auth.currentUser.uid;
    return runTransaction(db, async (tx) => {
      const parent = doc(db, name, id); const snap = await tx.get(parent);
      if (!snap.exists() || !['submitted', 'resubmitted', 'preliminary-checked'].includes(snap.data().status)) throw new Error('This item has already changed. Refresh and review the current status.');
      if (['reports', 'requests'].includes(name) && data.status !== 'preliminary-checked' && snap.data().status !== 'preliminary-checked') throw new Error('Preliminary Board review is required before a final Faculty decision.');
      if (name === 'requests' && snap.data().type === 'attendance-correction' && data.status === 'approved') throw new Error('Use Applications for an audited attendance amendment.');
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
    if (event.registrationMode === 'approval') throw new Error('This activity requires an application and Faculty approval.');
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
export async function saveParticipantAttendance(profile, eventId, registrationId, status, reason) {
  const { db, auth } = await getFirebase(); const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  return runTransaction(db, async tx => {
    const eventRef = doc(db, 'events', eventId); const regRef = doc(db, 'registrations', registrationId);
    const [eventSnap, regSnap] = await Promise.all([tx.get(eventRef), tx.get(regRef)]);
    if (!eventSnap.exists() || !regSnap.exists() || regSnap.data().eventId !== eventId) throw new Error('Event or registration not found.');
    const reg = regSnap.data(); const target = doc(db, 'attendance', `${eventId}_${reg.studentId}`); const previous = await tx.get(target);
    const problem = organizerUpdateProblem(profile, uid, eventSnap.data(), reg, previous.data(), status, reason);
    if (problem) throw new Error(problem);
    const entry = doc(collection(db, 'attendance', target.id, 'organizerHistory'));
    tx.set(entry, { previousStatus: previous.data()?.status || 'unrecorded', status, reason: reason.trim(), recordedBy: uid, recordedAt: serverTimestamp() });
    tx.set(target, { eventId, studentId: reg.studentId, studentName: reg.studentName || '', regNo: reg.regNo || '', coordinatorIds: eventSnap.data().coordinatorIds, status, reason: reason.trim(), method: 'organizer-verification', recordedBy: uid, recordedAt: serverTimestamp(), latestEntryId: entry.id });
  });
}
export async function saveBoardAttendance(profile, eventId, status, reason) {
  const { db, auth } = await getFirebase(); const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  if (!['present', 'absent'].includes(status) || !reason?.trim()) throw new Error('Choose attendance and enter a reason.');
  return runTransaction(db, async tx => {
    const eventSnap = await tx.get(doc(db, 'events', eventId));
    const problem = boardSelfAttendanceProblem(profile, eventSnap.data()); if (problem) throw new Error(problem);
    const target = doc(db, 'boardAttendance', `${eventId}_${uid}`); const previous = await tx.get(target);
    const entry = doc(collection(db, 'boardAttendance', target.id, 'history'));
    tx.set(entry, { previousStatus: previous.data()?.status || 'unrecorded', status, reason: reason.trim(), recordedBy: uid, recordedAt: serverTimestamp() });
    tx.set(target, { eventId, memberId: uid, memberName: profile.name || '', status, reason: reason.trim(), method: 'board-self-reported', recordedBy: uid, recordedAt: serverTimestamp(), latestEntryId: entry.id });
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
  const sources = collectionName === 'reports' || collectionName === 'applications' ? ['versions', 'decisions'] : ['decisions'];
  const results = {};
  const stops = sources.map(source => onSnapshot(collection(db, collectionName, id, source), (snap) => {
    results[source] = snap.docs.map(d => ({ ...d.data(), id: `${source}-${d.id}`, historyType: source }));
    if (sources.every(key => results[key])) onData(Object.values(results).flat().sort((a, b) => (a.submittedAt?.toMillis?.() || a.decidedAt?.toMillis?.() || 0) - (b.submittedAt?.toMillis?.() || b.decidedAt?.toMillis?.() || 0)));
  }, onError));
  return () => stops.forEach(stop => stop());
}
export async function issueCertificate(event, student, uid) {
  const { db } = await getFirebase();
  if (!event) throw new Error('The related activity is unavailable.');
  const attendance = await getDoc(doc(db, 'attendance', `${event.id}_${student.studentId}`));
  if (!attendance.exists() || attendance.data().status !== 'present') throw new Error('Verified present attendance is required before issuance.');
  await setDoc(doc(db, 'certificates', `${event.id}_${student.studentId}`), { eventId: event.id, studentId: student.studentId, title: event.title, recipient: student.studentName, issuedBy: uid, issuedAt: serverTimestamp(), status: 'issued' });
}
export async function uploadEvidence(file, uid, onProgress, applicationId) {
  const { storage } = await getFirebase();
  const folder = applicationId ? `applicationEvidence/${applicationId}/${uid}` : `evidence/${uid}`;
  const object = ref(storage, `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(object, file);
    task.on('state_changed', (snap) => onProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)), reject, async () => {
      resolve({ name: file.name, path: object.fullPath, uploadedBy: uid });
    });
  });
}

export async function openEvidence(attachment) {
  if (!attachment.path) throw new Error('Evidence path is unavailable.');
  const { storage } = await getFirebase();
  const blob = await getBlob(ref(storage, attachment.path));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = attachment.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function notification(tx, db, recipientId, applicationId, title) {
  tx.set(doc(collection(db, 'notifications')), { recipientId, applicationId, title, createdAt: serverTimestamp() });
}
export async function submitApplication(profile, data, attachments, existingId, draftId) {
  const { db, auth } = await getFirebase(); const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  const id = existingId || draftId || doc(collection(db, 'applications')).id;
  return runTransaction(db, async (tx) => {
    const target = doc(db, 'applications', id);
    const [previous, eventSnap] = await Promise.all([tx.get(target), tx.get(doc(db, 'events', data.eventId))]);
    if (!eventSnap.exists()) throw new Error('Activity not found.');
    const event = eventSnap.data(); const problem = applicationProblem(profile, event, data.type);
    if (problem) throw new Error(problem);
    if (!data.title?.trim() || !data.explanation?.trim()) throw new Error('Title and explanation are required.');
    if (data.type === 'attendance-correction' && !['present', 'absent'].includes(data.requestedAttendance)) throw new Error('Choose the corrected attendance status.');
    if (data.type === 'sponsorship-proposal' && !canCoordinate(profile, uid, event)) throw new Error('Only assigned organizers can submit sponsor proposals.');
    if (previous.exists() && (previous.data().studentId !== uid || previous.data().status !== 'correction-required' || !existingId)) throw new Error('An application already exists or is not editable.');
    if (previous.exists() && (previous.data().eventId !== data.eventId || previous.data().type !== data.type)) throw new Error('Activity and application type cannot change during correction.');
    const version = Number(previous.data()?.version || 0) + 1;
    const values = { ...data, attachments: attachments.map(({ name, path, uploadedBy }) => ({ name, path, uploadedBy })), studentId: uid, studentName: profile.name || '', regNo: profile.regNo || '', coordinatorIds: event.coordinatorIds, status: previous.exists() ? 'resubmitted' : 'submitted', version, updatedAt: serverTimestamp(), updatedBy: uid };
    if (!previous.exists()) Object.assign(values, { createdAt: serverTimestamp(), institutionalStatus: 'pending', fulfillmentStatus: 'pending' });
    tx.set(target, values, { merge: true });
    tx.set(doc(db, 'applications', id, 'versions', String(version)), { ...values, submittedAt: serverTimestamp() });
    for (const recipient of event.coordinatorIds) notification(tx, db, recipient, id, `${data.title}: preliminary review required`);
  });
}
export async function reviewApplication(profile, id, expectedStatus, nextStatus, remarks) {
  const { db, auth } = await getFirebase(); const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in again.');
  return runTransaction(db, async (tx) => {
    const target = doc(db, 'applications', id); const snap = await tx.get(target);
    if (!snap.exists() || snap.data().status !== expectedStatus) throw new Error('Another reviewer changed this record. Refresh before reviewing.');
    const record = snap.data(); const eventRef = doc(db, 'events', record.eventId); const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error('Activity not found.');
    const event = eventSnap.data(); const problem = reviewProblem(profile, uid, record, nextStatus, remarks, event);
    if (problem) throw new Error(problem);
    let attendanceRef, oldAttendance, registrationRef;
    if (nextStatus === 'approved' && ['participation', 'iv-participation', 'attendance-correction'].includes(record.type)) {
      registrationRef = doc(db, 'registrations', `${record.eventId}_${record.studentId}`);
      const registration = await tx.get(registrationRef);
      if (record.type === 'attendance-correction') {
        if (!registration.exists() || registration.data().status !== 'registered') throw new Error('Confirmed registration is required.');
        attendanceRef = doc(db, 'attendance', `${record.eventId}_${record.studentId}`); oldAttendance = await tx.get(attendanceRef);
      } else {
        const studentSnap = await tx.get(doc(db, 'users', record.studentId));
        const issue = registrationProblem(studentSnap.data(), event);
        if (issue) throw new Error(issue);
        if (registration.exists()) throw new Error('Participation is already registered.');
      }
    }
    if (nextStatus === 'approved' && registrationRef && record.type !== 'attendance-correction') {
      tx.set(registrationRef, { eventId: record.eventId, coordinatorIds: event.coordinatorIds, studentId: record.studentId, studentName: record.studentName, regNo: record.regNo, status: 'registered', applicationId: id, createdAt: serverTimestamp() });
      tx.update(eventRef, { registrationCount: Number(event.registrationCount || 0) + 1, latestApplicationId: id });
    }
    if (attendanceRef) {
      tx.set(attendanceRef, { eventId: record.eventId, coordinatorIds: event.coordinatorIds, studentId: record.studentId, studentName: record.studentName, regNo: record.regNo, status: record.requestedAttendance, recordedBy: uid, recordedAt: serverTimestamp(), method: 'faculty-amendment', amendmentApplicationId: id });
    }
    const decisionRef = doc(collection(db, 'applications', id, 'decisions'));
    tx.set(decisionRef, { reviewerId: uid, previousStatus: record.status, status: nextStatus, remarks: remarks.trim(), decidedAt: serverTimestamp(), ...(attendanceRef ? { previousAttendance: oldAttendance?.data()?.status || 'unrecorded', amendedAttendance: record.requestedAttendance } : {}) });
    tx.update(target, { status: nextStatus, remarks: remarks.trim(), reviewedBy: uid, latestDecisionId: decisionRef.id, updatedBy: uid, updatedAt: serverTimestamp() });
    notification(tx, db, record.studentId, id, `${record.title}: ${nextStatus.replaceAll('-', ' ')}`);
    if (nextStatus === 'preliminary-checked' && event.facultyReviewerId) notification(tx, db, event.facultyReviewerId, id, `${record.title}: Faculty decision required`);
  });
}
export async function confirmApplicationOutcome(profile, record, remarks) {
  const { db, auth } = await getFirebase(); const uid = auth.currentUser?.uid;
  if (!uid || !isFaculty(profile)) throw new Error('Only Faculty may record this confirmation.');
  if (!remarks.trim()) throw new Error('A confirmation reference and remarks are required.');
  const field = record.type === 'od' ? 'institutionalStatus' : record.type === 'sponsorship-support' ? 'fulfillmentStatus' : null;
  if (!field) throw new Error('No separate confirmation is available.');
  return runTransaction(db, async (tx) => {
    const target = doc(db, 'applications', record.id); const current = await tx.get(target);
    if (!current.exists() || current.data().status !== 'approved' || current.data()[field] !== 'pending') throw new Error('This outcome has already changed or is not approved.');
    const decisionRef = doc(collection(db, 'applications', record.id, 'decisions'));
    const value = field === 'institutionalStatus' ? 'confirmed' : 'fulfilled';
    tx.set(decisionRef, { reviewerId: uid, previousStatus: 'approved', status: value, remarks: remarks.trim(), decidedAt: serverTimestamp() });
    tx.update(target, { [field]: value, confirmationReference: remarks.trim(), latestDecisionId: decisionRef.id, updatedBy: uid, updatedAt: serverTimestamp() });
    notification(tx, db, current.data().studentId, record.id, `${current.data().title}: ${value}`);
  });
}
