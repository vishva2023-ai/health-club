import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, Timestamp, writeBatch } from 'firebase/firestore';

const suite = process.env['FIRESTORE_EMULATOR_HOST'] ? describe : describe.skip;
suite('Firebase authority and atomic outcomes', () => {
  let env: RulesTestEnvironment;
  beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-health-club', firestore: { host: '127.0.0.1', port: 8085, rules: readFileSync('firestore.rules', 'utf8') } }); });
  afterAll(async () => { await env?.cleanup(); });
  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      for (const [uid, role] of [['s1', 'student'], ['b1', 'board'], ['b2', 'board'], ['f1', 'faculty'], ['a1', 'admin']]) {
        await setDoc(doc(db, 'users', uid), { uid, name: uid, role, status: 'active', juniorCore: 'verified', excEnrollment: 'verified', appointmentOpenAt: Timestamp.fromMillis(0), appointmentCloseAt: Timestamp.fromMillis(Date.now() + 86400000) });
      }
      await setDoc(doc(db, 'events', 'e1'), { status: 'published', category: 'IV', registrationMode: 'approval', facultyReviewerId: 'f1', coordinatorIds: ['b1'], capacity: 2, registrationCount: 1, eligibility: 'all', registrationOpenAt: Timestamp.fromMillis(0), registrationCloseAt: Timestamp.fromMillis(Date.now() + 86400000) });
      await setDoc(doc(db, 'applications', 'app1'), { type: 'iv-participation', eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'submitted', version: 1, institutionalStatus: 'pending', fulfillmentStatus: 'pending' });
    });
  });
  const dbFor = (uid: string) => env.authenticatedContext(uid).firestore();
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
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore(), 'users', 'b1'), { appointmentCloseAt: Timestamp.fromMillis(1) }));
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
    await env.withSecurityRulesDisabled((context) => updateDoc(doc(context.firestore(), 'applications', 'app1'), { status: 'preliminary-checked' }));
    const db = dbFor('f1'); const batch = writeBatch(db); const { serverTimestamp } = await import('firebase/firestore');
    batch.set(doc(db, 'applications', 'app1', 'decisions', 'd1'), { reviewerId: 'f1', previousStatus: 'preliminary-checked', status: 'approved', remarks: 'Accepted', decidedAt: serverTimestamp() });
    batch.update(doc(db, 'applications', 'app1'), { status: 'approved', remarks: 'Accepted', reviewedBy: 'f1', latestDecisionId: 'd1', updatedBy: 'f1', updatedAt: serverTimestamp() });
    await assertFails(batch.commit());
  });
  it('Faculty attendance amendments require an approved correction application', async () => {
    const { serverTimestamp } = await import('firebase/firestore');
    await assertFails(setDoc(doc(dbFor('f1'), 'attendance', 'e1_s1'), { eventId: 'e1', studentId: 's1', coordinatorIds: ['b1'], status: 'absent', amendmentApplicationId: 'app1', recordedBy: 'f1', recordedAt: serverTimestamp() }));
  });
});