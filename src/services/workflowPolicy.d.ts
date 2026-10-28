import type { ClubProfile, ClubEvent } from './clubPolicy';
export interface ApplicationRecord { status: string; type?: string; institutionalStatus?: string; fulfillmentStatus?: string; }
export const WORKFLOW_TYPES: string[];
export function toMillis(value: unknown): number;
export function reviewProblem(profile: ClubProfile, uid: string, record: ApplicationRecord, nextStatus: string, remarks: string, event: ClubEvent): string;
export function applicationProblem(profile: ClubProfile, event: ClubEvent & { registrationMode?: string; category?: string }, type: string, now?: number): string;
export function nextAction(record: ApplicationRecord): { role: string; action: string };