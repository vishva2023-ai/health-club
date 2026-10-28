import { describe, expect, it } from 'vitest';
import { buildCSV, csvCell } from './exports';
describe('authorized record exports', () => {
  it('preserves commas, line breaks, and quotes', () => {
    expect(csvCell('A, "B"\nC')).toBe('"A, ""B""\nC"');
  });
  it('neutralizes spreadsheet formula injection in user-provided fields', () => {
    for (const value of ['=HYPERLINK("https://example.test")', '+1', '-1', '@SUM(A1)']) expect(csvCell(value)).toMatch(/^"'/);
  });
  it('exports only the explicit allowed columns', () => {
    const result = buildCSV([{ name: 'Vishva', privateNotes: 'hidden' }], [['Student', 'name']]);
    expect(result).toBe('"Student"\r\n"Vishva"');
    expect(result).not.toContain('hidden');
  });
});
