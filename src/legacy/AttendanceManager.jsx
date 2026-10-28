import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ATTENDANCE_SECTIONS, matchesAttendanceSection } from '@/services/attendancePolicy';
import { canCoordinate } from '@/services/clubPolicy';
import { saveParticipantAttendance, saveBoardAttendance, readHistory } from '@/services/clubService';
import AttendanceOverview from './AttendanceOverview';

export default function AttendanceManager({ profile, uid, events, registrations, attendance, boardAttendance, act, busy, onApply }) {
  const [mode, setMode] = useState('Enter the attendance');
  const [category, setCategory] = useState('EXC attendance');
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState(null);
  const board = profile.role === 'board';
  const available = events.filter(e => matchesAttendanceSection(e, category));
  const eligible = mode === 'Board member attendance' ? available.filter(e => e.status === 'published') : available.filter(e => canCoordinate(profile, uid, e));
  const participants = registrations.filter(r => eligible.some(e => e.id === r.eventId) && r.status === 'registered');
  const recordFor = r => attendance.find(a => a.eventId === r.eventId && a.studentId === r.studentId);
  const rows = participants.filter(r => mode === 'Update the attendance for the students' ? Boolean(recordFor(r)) : !recordFor(r));
  async function showHistory(collectionName, id) {
    const { getFirebase } = await import('@/lib/firebase');
    const { getDocs, collection } = await import('firebase/firestore');
    const { db } = await getFirebase();
    const snap = await getDocs(collection(db, collectionName, id, collectionName === 'boardAttendance' ? 'history' : 'organizerHistory'));
    setHistory(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b) => (b.recordedAt?.toMillis?.() || 0) - (a.recordedAt?.toMillis?.() || 0)));
  }
  return <section className="attendance-manager">
    <div className="connected-actions" role="group" aria-label="Attendance operations">{['Enter the attendance', 'Update the attendance for the students', ...(board ? ['Board member attendance'] : [])].map(label => <Button key={label} data-active={mode === label} onClick={() => { setMode(label); setEditing(null); setHistory(null); }}>{label}</Button>)}</div>
    <div className="attendance-categories" role="group" aria-label="Attendance categories">{ATTENDANCE_SECTIONS.map(label => <Button key={label} data-active={category === label} onClick={() => { setCategory(label); setEditing(null); }}>{label}</Button>)}</div>
    {editing && <form className="connected-form" onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); act(async () => { if (mode === 'Board member attendance') await saveBoardAttendance(profile, editing.eventId, data.status, data.reason); else await saveParticipantAttendance(profile, editing.eventId, editing.id, data.status, data.reason); setEditing(null); }, 'Attendance saved with history.'); }}><h2>{editing.studentName || profile.name}</h2><label>Attendance<select name="status" defaultValue={editing.currentStatus || 'present'}><option value="present">Present</option><option value="absent">Absent</option></select></label><label>Reason<textarea name="reason" required /></label><div className="connected-actions"><Button disabled={busy} type="submit">Save attendance</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form>}
    {history && <section><h2>Attendance history</h2>{history.length === 0 && <p>No organizer updates recorded yet.</p>}{history.map(r => <article key={r.id} className="connected-record"><h3>{r.previousStatus} → {r.status}</h3><p>{r.reason}</p><small>{r.recordedBy} · {r.recordedAt?.toDate?.().toLocaleString('en-IN')}</small></article>)}<Button variant="outline" onClick={() => setHistory(null)}>Close history</Button></section>}
    <div className="connected-grid">{mode === 'Board member attendance' ? eligible.map(event => { const recorded = boardAttendance.find(r => r.eventId === event.id); return <article key={event.id} className="connected-record"><h2>{event.title}</h2><p>{recorded ? `Self-reported: ${recorded.status}` : 'Not recorded'}</p><div className="connected-actions"><Button disabled={busy || event.attendanceLocked} onClick={() => setEditing({ eventId: event.id, currentStatus: recorded?.status })}>{recorded ? 'Update my attendance' : 'Record my attendance'}</Button>{recorded && <Button variant="outline" onClick={() => act(() => showHistory('boardAttendance', recorded.id), 'History loaded.')}>History</Button>}</div></article>; }) : rows.map(r => { const recorded = recordFor(r); const event = events.find(e => e.id === r.eventId); return <article key={r.id} className="connected-record"><h2>{r.studentName}</h2><p>{r.regNo} · {event?.title}</p><p>{recorded?.status || 'Not recorded'}</p><div className="connected-actions"><Button disabled={busy || event?.attendanceLocked || recorded?.method === 'faculty-amendment'} onClick={() => setEditing({ ...r, currentStatus: recorded?.status })}>{recorded ? 'Update attendance' : 'Enter attendance'}</Button>{recorded && <Button variant="outline" onClick={() => act(() => showHistory('attendance', recorded.id), 'History loaded.')}>History</Button>}</div></article>; })}</div>
    {(mode === 'Board member attendance' ? eligible.length === 0 : rows.length === 0) && <p className="connected-empty">No {category} records available for this view.</p>}
    {category === 'OD' && <Button variant="outline" onClick={onApply}>Open OD applications</Button>}
  </section>;
}