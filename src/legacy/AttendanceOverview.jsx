import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ATTENDANCE_SECTIONS, matchesAttendanceSection, attendanceSummary } from '@/services/attendancePolicy';

export default function AttendanceOverview({ attendance, applications, events, profile, onApply }) {
  const [view, setView] = useState('All attendance');
  const eventFor = (id) => events.find(e => e.id === id);
  const rows = view === 'All attendance' ? attendance : attendance.filter(r => matchesAttendanceSection(eventFor(r.eventId), view));
  const ods = applications.filter(r => r.type === 'od');
  const summary = attendanceSummary(rows);
  return <section className="attendance-overview"><div className="attendance-categories" role="group" aria-label="Attendance views">{['All attendance', ...ATTENDANCE_SECTIONS].map(label => <Button key={label} data-active={view === label} onClick={() => setView(label)}>{label}</Button>)}</div>
    {view === 'OD' ? <><Button onClick={onApply}>Request OD / attendance correction</Button><div className="connected-grid">{ods.length === 0 && <p>No OD requests yet.</p>}{ods.map(r => <article className="connected-record" key={r.id}><h2>{r.title}</h2><p>{eventFor(r.eventId)?.title || r.eventId}</p><p>Club review: <strong>{r.status.replaceAll('-', ' ')}</strong></p><p>Institutional OD: <strong>{r.institutionalStatus === 'confirmed' ? 'Confirmed' : 'Not confirmed'}</strong></p>{r.remarks && <p>{r.remarks}</p>}{r.confirmationReference && <p>Reference: {r.confirmationReference}</p>}</article>)}</div></> : <><div className="attendance-total"><h2>{view}</h2><strong>{summary.percentage === null ? 'No recorded sessions' : `Recorded attendance · ${summary.percentage}%`}</strong></div><div className="attendance-list">{rows.length === 0 && <p className="connected-empty">No attendance records in this view.</p>}{rows.map(r => { const present = r.status === 'present'; return <article className="attendance-session" key={r.id}><div><h2>{eventFor(r.eventId)?.title || r.eventId}</h2><p>{r.recordedAt?.toDate?.().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) || 'Timestamp pending'}</p><strong>Total sessions: 1 · Attended: {present ? 1 : 0}</strong><p>{r.method === 'faculty-amendment' ? 'Amended by Faculty' : 'Recorded by organizer'}</p><Button variant="outline" onClick={onApply}>Request correction</Button></div><div className="attendance-ring" data-present={present} role="img" aria-label={present ? 'Present' : 'Absent'}><strong>{present ? '100%' : '0%'}</strong><small>{r.status}</small></div></article>; })}</div></>}
  </section>;
}
