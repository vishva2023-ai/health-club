export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function buildCSV(rows, columns) {
  return [columns.map(([label]) => csvCell(label)).join(','), ...rows.map(row => columns.map(([, key]) => csvCell(row[key])).join(','))].join('\r\n');
}
export function downloadCSV(rows, columns, filename) {
  const blob = new Blob(['\uFEFF', buildCSV(rows, columns)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
