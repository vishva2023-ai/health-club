export const ATTENDANCE_SECTIONS = ['EXC attendance', 'Junior attendance', 'OD', 'Riviera 2026', 'Gravitas 2026', 'Yuantra 2025', 'Guest lecturers', 'IV', 'Outreach', 'Medical camp', 'Online event', 'Expo', 'Night Slip'];
const normalized = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function matchesAttendanceSection(event, section) {
  if (section === 'EXC attendance') return event?.eligibility === 'exc' || event?.excEligible === true;
  if (section === 'Junior attendance') return event?.eligibility === 'junior';
  return normalized(event?.category) === normalized(section);
}
export function attendanceSummary(rows) {
  const present = rows.filter(r => r.status === 'present').length;
  const absent = rows.filter(r => r.status === 'absent').length;
  const total = present + absent;
  return { present, absent, total, percentage: total ? Math.round(present / total * 100) : null };
}
export function organizerUpdateProblem(profile, uid, event, registration, existing, status, reason) {
  const currentBoard = profile?.role === 'board' && profile?.status === 'active' && Date.now() >= new Date(profile.appointmentStarts).getTime() && Date.now() < new Date(profile.appointmentEnds).getTime();
  if (!(profile?.role === 'faculty' && profile?.status === 'active') && !(currentBoard && event?.coordinatorIds?.includes(uid))) return 'Only assigned organizers can update student attendance.';
  if (event?.attendanceLocked) return 'Attendance is finalized. Submit a correction request.';
  if (existing?.method === 'faculty-amendment') return 'Faculty amendments require a new correction request.';
  if (registration?.status !== 'registered') return 'A confirmed registration is required.';
  if (!['present', 'absent'].includes(status)) return 'Choose present or absent.';
  if (!reason?.trim()) return 'A recording or update reason is required.';
  return '';
}
export function boardSelfAttendanceProblem(profile, event) {
  if (profile?.role !== 'board' || profile?.status !== 'active' || !(Date.now() >= new Date(profile.appointmentStarts).getTime() && Date.now() < new Date(profile.appointmentEnds).getTime())) return 'A current Board appointment is required.';
  if (event?.status !== 'published') return 'Choose a published event.';
  if (event.attendanceLocked) return 'Attendance is finalized.';
  return '';
}