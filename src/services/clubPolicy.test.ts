import { describe, it, expect } from 'vitest';
import { registrationProblem, attendanceProblem, permittedReview, hasEnrollment } from './clubPolicy';

const student = { role: 'student', status: 'active', juniorCore: 'verified' };
const event = { status: 'published', registrationCloses: '2027-01-01', capacity: 2, registrationCount: 1, coordinatorIds: ['board1'] };
describe('connected role rules', () => {
  it('requires official enrollment, not self-assigned access', () => {
    expect(hasEnrollment({ role: 'student' })).toBe(false);
    expect(registrationProblem({ role: 'student', status: 'active' }, event, 0)).toContain('verified');
    expect(hasEnrollment({ juniorCore: 'verified', excEnrollment: 'verified' })).toBe(true);
  });
  it('only allows published events within registration deadlines', () => {
    expect(registrationProblem(student, { ...event, status: 'approved' }, 0)).toContain('not open');
    expect(registrationProblem(student, event, new Date('2027-01-01').getTime())).toContain('closed');
    expect(registrationProblem(student, event, new Date('2026-10-25').getTime())).toBe('');
  });
  it('does not bypass capacity', () => {
    expect(registrationProblem(student, { ...event, registrationCount: 2 }, 0)).toContain('capacity');
  });
  it('students cannot mark themselves present', () => {
    expect(attendanceProblem(student, 's1', event, { status: 'registered' }, null)).toContain('organizers');
  });
  it('board attendance is limited to assigned events and cannot change locked records', () => {
    const board = { role: 'board', status: 'active', appointmentStarts: '2026-01-01', appointmentEnds: '2028-01-01' };
    expect(attendanceProblem(board, 'other', event, { status: 'registered' }, null)).toContain('organizers');
    expect(attendanceProblem(board, 'board1', { ...event, attendanceLocked: true }, { status: 'registered' }, null)).toContain('finalized');
    expect(attendanceProblem(board, 'board1', event, { status: 'registered' }, null)).toBe('');
  });
  it('registration does not itself give attendance and duplicates are rejected', () => {
    const board = { role: 'board', status: 'active', appointmentStarts: '2026-01-01', appointmentEnds: '2028-01-01' };
    expect(attendanceProblem(board, 'board1', event, { status: 'waitlisted' }, null)).toContain('confirmed');
    expect(attendanceProblem(board, 'board1', event, { status: 'registered' }, { status: 'present' })).toContain('already');
  });
  it('board preliminary checks and admin access are not academic approval', () => {
    expect(permittedReview({ role: 'board', status: 'active' }, 'final')).toBe(false);
    expect(permittedReview({ role: 'admin', status: 'active' }, 'final')).toBe(false);
    expect(permittedReview({ role: 'faculty', status: 'active' }, 'final')).toBe(true);
  });
  it('an ended Board appointment cannot record attendance', () => {
    expect(attendanceProblem({ role: 'board', status: 'active', appointmentStarts: '2025-01-01', appointmentEnds: '2026-01-01' }, 'board1', event, { status: 'registered' }, null)).toContain('organizers');
  });
});