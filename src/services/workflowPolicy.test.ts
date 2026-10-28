import { describe, expect, it } from 'vitest';
import { reviewProblem, applicationProblem, nextAction } from './workflowPolicy';
const faculty = { role: 'faculty', status: 'active' };
const board = { role: 'board', status: 'active', appointmentStarts: '2026-01-01', appointmentEnds: '2028-01-01' };
const event = { status: 'published', category: 'IV', registrationMode: 'approval', registrationCloses: '2028-01-01', capacity: 2, registrationCount: 1, coordinatorIds: ['b1'] };
describe('required interconnected approval rules', () => {
  it('requires a preliminary Board review before a final Faculty decision', () => {
    expect(reviewProblem(faculty, 'f1', { status: 'submitted' }, 'approved', 'Accepted', event)).toContain('preliminary');
    expect(reviewProblem(faculty, 'f1', { status: 'preliminary-checked' }, 'approved', 'Accepted', event)).toBe('');
  });
  it('does not allow Board final approval', () => {
    expect(reviewProblem(board, 'b1', { status: 'preliminary-checked' }, 'approved', 'Accepted', event)).toContain('Faculty');
  });
  it('does not give Admin academic approval authority', () => {
    expect(reviewProblem({ role: 'admin', status: 'active' }, 'a1', { status: 'preliminary-checked' }, 'approved', 'Accepted', event)).toContain('Faculty');
  });
  it('requires remarks for rejection and requested changes', () => {
    for (const status of ['rejected', 'correction-required']) expect(reviewProblem(faculty, 'f1', { status: 'preliminary-checked' }, status, '', event)).toContain('remarks');
  });
  it('rejects duplicate and conflicting preliminary reviews', () => {
    expect(reviewProblem(board, 'b1', { status: 'approved' }, 'preliminary-checked', 'Checked', event)).toContain('no longer');
  });
  it('restricts preliminary reviews to assigned reviewers', () => {
    expect(reviewProblem(board, 'b2', { status: 'submitted' }, 'preliminary-checked', 'Checked', event)).toContain('assigned');
  });
  it('participation approval cannot bypass capacity of two', () => {
    expect(applicationProblem({ role: 'student', status: 'active', excEnrollment: 'verified' }, { ...event, registrationCount: 2 }, 'iv-participation', Date.parse('2026-10-28'))).toContain('capacity');
  });
  it('club OD approval remains separate from institutional confirmation', () => {
    expect(nextAction({ status: 'approved', type: 'od', institutionalStatus: 'pending' }).role).toBe('Institution');
  });
  it('sponsorship-support approval does not imply fulfillment', () => {
    expect(nextAction({ status: 'approved', type: 'sponsorship-support', fulfillmentStatus: 'pending' }).action).toBe('Fulfillment pending');
  });
  it('corrections explicitly return the action to the applicant', () => {
    expect(nextAction({ status: 'correction-required' })).toEqual({ role: 'Applicant', action: 'Correct and resubmit' });
  });
});