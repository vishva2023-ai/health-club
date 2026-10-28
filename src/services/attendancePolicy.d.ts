import type { ClubProfile, ClubEvent } from './clubPolicy';
export const ATTENDANCE_SECTIONS: string[];
export function matchesAttendanceSection(event: (ClubEvent & { category?: string; excEligible?: boolean }) | undefined, section: string): boolean;
export function attendanceSummary(rows: { status?: string }[]): { present: number; absent: number; total: number; percentage: number | null };
export function organizerUpdateProblem(profile: ClubProfile, uid: string, event: ClubEvent, registration: { status?: string }, existing: { method?: string; status?: string } | null | undefined, status: string, reason: string): string;
export function boardSelfAttendanceProblem(profile: ClubProfile, event: ClubEvent): string;