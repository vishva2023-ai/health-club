export function csvCell(value: unknown): string;
export function buildCSV(rows: Record<string, unknown>[], columns: [string, string][]): string;
export function downloadCSV(rows: Record<string, unknown>[], columns: [string, string][], filename: string): void;
