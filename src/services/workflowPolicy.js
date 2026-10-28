import { isFaculty, canCoordinate, registrationProblem } from './clubPolicy';

export const WORKFLOW_TYPES = ['participation', 'iv-participation', 'attendance-correction', 'od', 'sponsorship-proposal', 'sponsorship-support'];
export const toMillis = (value) => value?.toMillis?.() ?? (value?.seconds ? value.seconds * 1000 : new Date(value).getTime());
export function reviewProblem(profile, uid, record, nextStatus, remarks, event) {
  if (!remarks?.trim()) return 'Decision remarks are required.';
  if (nextStatus !== 'preliminary-checked' && !isFaculty(profile)) return 'Only Faculty can make the final decision.';
  if (!canCoordinate(profile, uid, event)) return 'Only currently assigned reviewers can act.';
  if (nextStatus === 'preliminary-checked') {
    if (!['submitted', 'resubmitted'].includes(record.status)) return 'This record is no longer awaiting preliminary review.';
    return '';
  }
  if (!isFaculty(profile)) return 'Only Faculty can make the final decision.';
  if (record.status !== 'preliminary-checked') return 'A preliminary Board review is required first.';
  if (!['approved', 'rejected', 'correction-required'].includes(nextStatus)) return 'Invalid decision.';
  return '';
}
export function applicationProblem(profile, event, type, now = Date.now()) {
  if (!WORKFLOW_TYPES.includes(type)) return 'Unsupported application type.';
  if (profile?.status !== 'active') return 'Active access is required.';
  if (type === 'participation' || type === 'iv-participation') {
    const problem = registrationProblem(profile, event, now);
    if (problem) return problem;
    if (event.registrationMode !== 'approval') return 'This event uses direct registration.';
    if (type === 'iv-participation' && event.category !== 'IV') return 'Select an Industrial Visit.';
  }
  return '';
}
export function nextAction(record) {
  if (['submitted', 'resubmitted'].includes(record.status)) return { role: 'Board Member', action: 'Preliminary review' };
  if (record.status === 'preliminary-checked') return { role: 'Faculty', action: 'Final decision' };
  if (record.status === 'correction-required') return { role: 'Applicant', action: 'Correct and resubmit' };
  if (record.status === 'approved' && record.type === 'od' && record.institutionalStatus !== 'confirmed') return { role: 'Institution', action: 'Institutional OD confirmation pending' };
  if (record.status === 'approved' && record.type === 'sponsorship-support' && record.fulfillmentStatus !== 'fulfilled') return { role: 'Faculty', action: 'Fulfillment pending' };
  return { role: 'None', action: record.status === 'approved' ? 'Decision completed' : 'No action pending' };
}