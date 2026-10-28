export async function downloadCertificate(record) {
  if (record.status !== 'issued') throw new Error('Only issued records can be downloaded.');
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape' });
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(26);
  pdf.text('VIT Health Club', 148, 38, { align: 'center' });
  pdf.setFontSize(18); pdf.text('Participation record', 148, 60, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(16);
  pdf.text(pdf.splitTextToSize(String(record.recipient || ''), 230), 148, 86, { align: 'center' });
  pdf.text(pdf.splitTextToSize(String(record.title || ''), 230), 148, 112, { align: 'center' });
  pdf.setFontSize(11);
  pdf.text(`Record ID: ${record.id}`, 25, 150);
  pdf.text(`Authorized by account: ${record.issuedBy}`, 25, 163);
  pdf.text(`Issued: ${record.issuedAt?.toDate?.().toLocaleDateString() || 'Not available'}`, 25, 176);
  pdf.text('Club participation record. Not an institutional academic completion certificate.', 25, 190);
  pdf.save(`club-participation-${record.id.replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`);
}