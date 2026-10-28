import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc, updateDoc, getDoc, Timestamp, writeBatch, serverTimestamp } from 'firebase/firestore';

const suite = process.env['FIRESTORE_EMULATOR_HOST'] ? describe : describe.skip;
suite('Firebase authority and atomic outcomes', () => {
  let env: RulesTestEnvironment;
  beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-health-club', firestore: { host: '127.0.0.1', port: 8085, rules: readFileSync('firestore.rules', 'utf8') } }); });
  afterAll(async () => { await env?.cleanup(); });
  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore;
      const profiles: Array<[string, string]> = [['s1', 'student'], ['b1', 'board'], ['b2', 'board'], ['f1', 'faculty'], ['a1', 'admin']];
      for (const [uid, role] of profiles) {
        await setDoc(doc(db, 'users', uid), { uid, name: uid, role, status: 'active', juniorCore: 'verified', excEnrollment: 'verified', appointmentOpenAt: Timestamp.fromMillis(0), appointmentCloseAt: Timestamp.fromMillis(Date.now() + 86400000) });
      }
      await setDoc(doc(db, 'events', 'e1'), { status: 'published', category: 'IV', registrationMode: 'approval', facultyReviewerId: 'f1', coordinatorIds: ['b1'], capacity: 2, registrationCount: 1, eligibility: 'all', registrationOpenAt: Timestamp.fromMillis(0), registrationCloseAt: Timestamp.fromMillis(Date.now() + 86400000) });
      await setDoc(doc(db, 'applications', 'app1'), { type: 'iv-participation', eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'submitted', version: 1, institutionalStatus: 'pending', fulfillmentStatus: 'pending' });
    });
  });
  const dbFor = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;
  it('Admin cannot promote themselves to Faculty', async () => {
    await assertFails(updateDoc(doc(dbFor('a1'), 'users', 'a1'), { role: 'faculty' }));
  });
  it('Admin cannot promote another account to Faculty', async () => {
    await assertFails(updateDoc(doc(dbFor('a1'), 'users', 's1'), { role: 'faculty' }));
  });
  it('an unassigned Board member cannot read applications', async () => {
    await assertFails(getDoc(doc(dbFor('b2'), 'applications', 'app1')));
  });
  it('an expired appointment cannot read assigned applications', async () => {
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore() as unknown as Firestore, 'users', 'b1'), { appointmentCloseAt: Timestamp.fromMillis(1) }));
    await assertFails(getDoc(doc(dbFor('b1'), 'applications', 'app1')));
  });
  async function decision(uid: string, status: string) {
    const db = dbFor(uid); const batch = writeBatch(db); const time = Timestamp.now();
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: uid, previousStatus: 'submitted', status, remarks: 'Reviewed', decidedAt: time });
    batch.update(doc(db, 'applications', 'app1'), { status, remarks: 'Reviewed', reviewedBy: uid, latestDecisionId: 'd1', updatedBy: uid, updatedAt: time });
    return batch.commit();
  }
  it('assigned Board can perform preliminary review', async () => {
    const db = dbFor('b1'); const batch = writeBatch(db);
    const { serverTimestamp } = await import('firebase/firestore');
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: 'b1', previousStatus: 'submitted', status: 'preliminary-checked', remarks: 'Complete', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { status: 'preliminary-checked', remarks: 'Complete', reviewedBy: 'b1', latestDecisionId: 'd1', updatedBy: 'b1', updatedAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
  });
  it('Board cannot make final approval', async () => { await assertFails(decision('b1', 'approved')); });
  it('Faculty cannot bypass preliminary review', async () => { await assertFails(decision('f1', 'approved')); });
  it('Faculty cannot increment capacity counters without a related application', async () => {
    await assertFails(updateDoc(doc(dbFor('f1'), 'events', 'e1'), { registrationCount: 2 }));
  });
  it('approval without a confirmed registration outcome is denied', async () => {
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore() as unknown as Firestore, 'applications', 'app1'), { status: 'preliminary-checked' }));
    const db = dbFor('f1'); const batch = writeBatch(db); const { serverTimestamp } = await import('firebase/firestore');
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: 'f1', previousStatus: 'preliminary-checked', status: 'approved', remarks: 'Accepted', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { status: 'approved', remarks: 'Accepted', reviewedBy: 'f1', latestDecisionId: 'd1', updatedBy: 'f1', updatedAt: serverTimestamp() });
    await assertFails(batch.commit());
  });
  it('Faculty attendance amendments require an approved correction application', async () => {
    const { serverTimestamp } = await import('firebase/firestore');
    await assertFails(setDoc(doc(dbFor('f1'), 'attendance', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'absent', amendmentApplicationId: 'app1', recordedBy: 'f1', recordedAt: serverTimestamp() }));
  });
  it('Student application saves its immutable version and Board notification together', async () => {
    const db = dbFor('s1'); const batch = writeBatch(db);
    const data = { type: 'iv-participation', eventId: 'e1', studentId: 's1', title: 'IV application', explanation: 'Request to participate', coordinatorIds: ['b1'], status: 'submitted', version: 1, institutionalStatus: 'pending', fulfillmentStatus: 'pending', updatedBy: 's1', updatedAt: serverTimestamp() };
    batch.set(doc(db, 'applications', 'new1'), data);
    batch.set(doc(db, 'applications', 'new1', 'versions', '1'), { ...data, submittedAt: serverTimestamp() });
    batch.set(doc(db, 'notifications', 'n1'), { recipientId: 'b1', applicationId: 'new1', title: 'Review required', createdAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
    await assertSucceeds(getDoc(doc(dbFor('b1'), 'notifications', 'n1')));
    await assertFails(getDoc(doc(dbFor('b2'), 'notifications', 'n1')));
  });
  it('Faculty final approval atomically confirms registration and fills the second seat', async () => {
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore() as unknown as Firestore, 'applications', 'app1'), { status: 'preliminary-checked' }));
    const db = dbFor('f1'); const batch = writeBatch(db);
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: 'f1', previousStatus: 'preliminary-checked', status: 'approved', remarks: 'Accepted', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { status: 'approved', remarks: 'Accepted', reviewedBy: 'f1', latestDecisionId: 'd1', updatedBy: 'f1', updatedAt: serverTimestamp() });
    batch.set(doc(db, 'registrations', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'registered', applicationId: 'app1', createdAt: serverTimestamp() });
    batch.update(doc(db, 'events', 'e1'), { registrationCount: 2, latestApplicationId: 'app1' });
    await assertSucceeds(batch.commit());
    const registration = await assertSucceeds(getDoc(doc(dbFor('s1'), 'registrations', 'e1_s1')));
    if (registration.data()?.['status'] !== 'registered') throw new Error('Registration outcome was not saved');
    const event = await getDoc(doc(dbFor('s1'), 'events', 'e1'));
    if (event.data()?.['registrationCount'] !== 2) throw new Error('Capacity count was not incremented');
  });
  it('attendance correction final approval actually amends attendance with an audit record', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore;
      await updateDoc(doc(db, 'applications', 'app1'), { type: 'attendance-correction', requestedAttendance: 'absent', status: 'preliminary-checked' });
      await setDoc(doc(db, 'registrations', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'registered' });
      await setDoc(doc(db, 'attendance', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'present' });
    });
    const db = dbFor('f1'); const batch = writeBatch(db);
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: 'f1', previousStatus: 'preliminary-checked', status: 'approved', remarks: 'Evidence checked', previousAttendance: 'present', amendedAttendance: 'absent', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { status: 'approved', remarks: 'Evidence checked', reviewedBy: 'f1', latestDecisionId: 'd1', updatedBy: 'f1', updatedAt: serverTimestamp() });
    batch.set(doc(db, 'attendance', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'absent', amendmentApplicationId: 'app1', recordedBy: 'f1', recordedAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
    const attendance = await getDoc(doc(dbFor('s1'), 'attendance', 'e1_s1'));
    if (attendance.data()?.['status'] !== 'absent') throw new Error('Attendance was not amended');
    await assertSucceeds(getDoc(doc(dbFor('s1'), 'applications', 'app1', 'decisions', 'd1')));
  });
  it('OD confirmation requires its own audited reference after club approval', async () => {
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore() as unknown as Firestore, 'applications', 'app1'), { type: 'od', status: 'approved' }));
    const db = dbFor('f1'); const batch = writeBatch(db);
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'confirm1'), { reviewerId: 'f1', previousStatus: 'approved', status: 'confirmed', remarks: 'Institution reference OD-1', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { institutionalStatus: 'confirmed', confirmationReference: 'Institution reference OD-1', latestDecisionId: 'confirm1', updatedBy: 'f1', updatedAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
    const app = await getDoc(doc(dbFor('s1'), 'applications', 'app1'));
    if (app.data()?.['status'] !== 'approved' || app.data()?.['institutionalStatus'] !== 'confirmed') throw new Error('OD statuses are not separately stored');
  });
});