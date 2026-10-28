import { describe, expect, it } from 'vitest';
import { ATTENDANCE_SECTIONS, matchesAttendanceSection, attendanceSummary, organizerUpdateProblem, boardSelfAttendanceProblem } from './attendancePolicy';
const board = { role: 'board', status: 'active', appointmentStarts: '2026-01-01', appointmentEnds: '2028-01-01' };
const event = { status: 'published', coordinatorIds: ['b1'], category: 'IV' };
describe('categorized attendance', () => {
  it('offers each requested attendance category', () => { expect(ATTENDANCE_SECTIONS).toEqual(['EXC attendance', 'Junior attendance', 'OD', 'Riviera 2026', 'Gravitas 2026', 'Yuantra 2025', 'Guest lecturers', 'IV', 'Outreach', 'Medical camp', 'Online event', 'Expo', 'Night Slip']); });
  it('keeps EXC eligibility separate from Junior attendance', () => { expect(matchesAttendanceSection({ eligibility: 'junior' }, 'EXC attendance')).toBe(false); expect(matchesAttendanceSection({ eligibility: 'junior' }, 'Junior attendance')).toBe(true); });
  it('matches event categories without treating registration as attendance', () => { expect(matchesAttendanceSection(event, 'IV')).toBe(true); expect(attendanceSummary([{ status: 'registered' }, { status: 'present' }, { status: 'absent' }])).toEqual({ present: 1, absent: 1, total: 2, percentage: 50 }); expect(attendanceSummary([]).percentage).toBeNull(); });
  it('permits assigned Board updates with a reason', () => { expect(organizerUpdateProblem(board, 'b1', event, { status: 'registered' }, { status: 'absent' }, 'present', 'Checked register')).toBe(''); });
  it('blocks unassigned Board updates', () => { expect(organizerUpdateProblem(board, 'b2', event, { status: 'registered' }, null, 'present', 'Checked')).toContain('assigned'); });
  it('protects locked student attendance', () => { expect(organizerUpdateProblem(board, 'b1', { ...event, attendanceLocked: true }, { status: 'registered' }, null, 'present', 'Checked')).toContain('finalized'); });
  it('protects Faculty amendments', () => { expect(organizerUpdateProblem(board, 'b1', event, { status: 'registered' }, { method: 'faculty-amendment' }, 'present', 'Checked')).toContain('Faculty'); });
  it('requires a reason for updates', () => { expect(organizerUpdateProblem(board, 'b1', event, { status: 'registered' }, null, 'present', '')).toContain('reason'); });
  it('allows current Board self-attendance on published events without assignment', () => { expect(boardSelfAttendanceProblem(board, { status: 'published', coordinatorIds: ['other'] })).toBe(''); });
  it('does not allow students to self-record', () => { expect(boardSelfAttendanceProblem({ role: 'student', status: 'active' }, event)).toContain('Board'); });
});