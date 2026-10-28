export const isFaculty = (profile) => profile?.role === 'faculty' && profile?.status === 'active';
export const isOperator = (profile) => ['faculty', 'admin'].includes(profile?.role) && profile?.status === 'active';
export const isBoard = (profile, now = Date.now()) => profile?.role === 'board' && profile?.status === 'active'
  && Boolean(profile.appointmentStarts && profile.appointmentEnds)
  && now >= new Date(profile.appointmentStarts).getTime() && now < new Date(profile.appointmentEnds).getTime();
export const hasEnrollment = (profile) => profile?.juniorCore === 'verified' || profile?.excEnrollment === 'verified';
export const canCoordinate = (profile, uid, event) => isFaculty(profile) || (isBoard(profile) && event?.coordinatorIds?.includes(uid));
export function registrationProblem(profile, event, now = Date.now()) {
  if (profile?.status !== 'active' || !hasEnrollment(profile)) return 'Your membership or EXC enrollment must be verified first.';
  if (event?.status !== 'published') return 'Registration is not open for this activity.';
  if (event.registrationOpens && now < new Date(event.registrationOpens).getTime()) return 'Registration has not opened yet.';
  if (!event.registrationCloses || now >= new Date(event.registrationCloses).getTime()) return 'Registration is closed.';
  if (event.eligibility === 'exc' && profile.excEnrollment !== 'verified') return 'This activity requires verified EXC enrollment.';
  if (event.eligibility === 'junior' && profile.juniorCore !== 'verified') return 'This activity requires verified Junior Core membership.';
  if (Number(event.registrationCount || 0) >= Number(event.capacity)) return 'This activity has reached capacity.';
  return '';
}
export function attendanceProblem(profile, uid, event, registration, existing) {
  if (!canCoordinate(profile, uid, event)) return 'Only assigned organizers can record attendance.';
  if (event?.attendanceLocked) return 'Attendance is finalized. Submit a correction request.';
  if (existing) return 'Attendance has already been recorded for this student.';
  if (registration?.status !== 'registered') return 'A confirmed registration is required.';
  return '';
}
export const permittedReview = (profile, kind) => kind === 'preliminary' ? isBoard(profile) || isFaculty(profile) : isFaculty(profile);