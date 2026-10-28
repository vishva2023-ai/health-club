// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ exists: false, writes: [], uid: 'student-1' }));
vi.mock('@/lib/firebase', () => ({ getFirebase: async () => ({ auth: { currentUser: { uid: fixture.uid, email: 'student@vitstudent.ac.in' } }, db: {} }) }));
vi.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ collection, id }), onSnapshot: vi.fn(), setDoc: vi.fn(),
  serverTimestamp: () => 'server-time',
  runTransaction: async (_db, work) => work({ get: async () => ({ exists: () => fixture.exists }), set: (ref, data) => fixture.writes.push({ ref, data }) }),
}));
import { recoverStudentProfile } from './authService';
describe('recovery of Auth-only accounts', () => {
  beforeEach(() => { fixture.exists = false; fixture.writes = []; });
  it('uses the authenticated UID and never accepts a requested privileged role', async () => {
    await recoverStudentProfile({ name: ' Student ', regNo: ' 23abc001 ', role: 'faculty', excEnrollment: 'verified' });
    expect(fixture.writes).toHaveLength(1);
    expect(fixture.writes[0].ref).toEqual({ collection: 'users', id: 'student-1' });
    expect(fixture.writes[0].data).toMatchObject({ role: 'student', status: 'active', regNo: '23ABC001' });
    expect(fixture.writes[0].data).not.toHaveProperty('excEnrollment');
  });
  it('never overwrites an existing Board or Faculty profile', async () => {
    fixture.exists = true;
    await expect(recoverStudentProfile({ name: 'Student', regNo: '23ABC001' })).rejects.toThrow('already exists');
    expect(fixture.writes).toHaveLength(0);
  });
  it('does not create an incomplete profile', async () => {
    await expect(recoverStudentProfile({ name: ' ', regNo: '' })).rejects.toThrow('required');
    expect(fixture.writes).toHaveLength(0);
  });
});
