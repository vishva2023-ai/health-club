export interface ClubProfile { role?: string; status?: string; juniorCore?: string; excEnrollment?: string; appointmentStarts?: string; appointmentEnds?: string; }
export interface ClubEvent { status?: string; registrationOpens?: string; registrationCloses?: string; eligibility?: string; registrationCount?: number; capacity?: number; coordinatorIds?: string[]; attendanceLocked?: boolean; }
export function isFaculty(profile: ClubProfile): boolean;
export function isOperator(profile: ClubProfile): boolean;
export function isBoard(profile: ClubProfile, now?: number): boolean;
export function hasEnrollment(profile: ClubProfile): boolean;
export function canCoordinate(profile: ClubProfile, uid: string, event?: ClubEvent): boolean;
export function registrationProblem(profile: ClubProfile, event: ClubEvent, now?: number): string;
export function attendanceProblem(profile: ClubProfile, uid: string, event: ClubEvent, registration: { status?: string }, existing: unknown): string;
export function permittedReview(profile: ClubProfile, kind: string): boolean;