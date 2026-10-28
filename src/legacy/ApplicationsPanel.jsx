import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscribeRecords, submitApplication, reviewApplication, confirmApplicationOutcome, uploadEvidence, openEvidence, readHistory } from '@/services/clubService';
import { isFaculty, isBoard } from '@/services/clubPolicy';
import { WORKFLOW_TYPES, nextAction } from '@/services/workflowPolicy';

export default function ApplicationsPanel({ profile, uid, events, initialApplicationId, initialEventId }) {
  const [records, setRecords] = useState(null); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [form, setForm] = useState(null); const [selected, setSelected] = useState(null); const [history, setHistory] = useState(null);
  const [files, setFiles] = useState([]); const [attachments, setAttachments] = useState([]); const [progress, setProgress] = useState(null);
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all');
  const faculty = isFaculty(profile); const board = isBoard(profile);
  useEffect(() => {
    if (!initialEventId) return;
    const event = events.find((item) => item.id === initialEventId);
    if (event) { setSelected(null); setAttachments([]); setFiles([]); setForm('application'); }
  }, [initialEventId]);
  useEffect(() => {
    let stop; let cancelled = false;
    subscribeRecords('applications', faculty ? [] : board ? [['coordinatorIds', uid]] : [['studentId', uid]], (rows) => {
      if (!cancelled) setRecords(rows.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0)));
    }, (e) => { if (!cancelled) setError(e.message); }).then((fn) => { if (cancelled) fn(); else stop = fn; }).catch((e) => setError(e.message));
    return () => { cancelled = true; stop?.(); };
  }, [faculty, board, uid]);
  useEffect(() => {
    if (initialApplicationId && records) { const record = records.find((r) => r.id === initialApplicationId); if (record) { setSelected(record); setForm('details'); } }
  }, [initialApplicationId, records]);
  useEffect(() => {
    if (!selected || form !== 'history') return;
    let stop; let cancelled = false; setHistory(null);
    readHistory('applications', selected.id, (rows) => { if (!cancelled) setHistory(rows); }, (e) => setError(e.message)).then((fn) => { if (cancelled) fn(); else stop = fn; }).catch((e) => setError(e.message));
    return () => { cancelled = true; stop?.(); };
  }, [selected, form]);
  const current = records?.find((r) => r.id === selected?.id) || selected;
  async function act(work, success) { setBusy(true); setError(''); setMessage(''); try { await work(); setMessage(success); setForm(null); setFiles([]); setAttachments([]); } catch (e) { setError(e.message); } finally { setBusy(false); setProgress(null); } }
  function edit(record = null) { setSelected(record); setAttachments(record?.attachments || []); setFiles([]); setForm('application'); }
  async function submit(e) {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget));
    if (form === 'review') return act(() => reviewApplication(profile, selected.id, selected.status, selected.nextStatus, data.remarks), 'Decision and related outcome saved.');
    if (form === 'confirmation') return act(() => confirmApplicationOutcome(profile, current, data.remarks), 'Separate confirmation saved.');
    const draftId = current?.id || (['participation', 'iv-participation'].includes(data.type) ? `${data.eventId}_${uid}_participation` : crypto.randomUUID());
    return act(async () => {
      const evidence = [...attachments];
      for (const file of files) { const attachment = await uploadEvidence(file, uid, setProgress, draftId); evidence.push(attachment); setAttachments([...evidence]); }
      setFiles([]);
      await submitApplication(profile, data, evidence, current?.id, draftId);
    }, current ? 'Corrected application resubmitted.' : 'Application submitted for preliminary review.');
  }
  const evidence = (items) => items?.map((a) => <Button key={a.path} variant="outline" disabled={busy} onClick={() => act(() => openEvidence(a), 'Evidence downloaded.')}>{a.name}</Button>);
  const rows = (records || []).filter((r) => (filter === 'all' || r.status === filter) && `${r.title} ${r.studentName} ${r.type}`.toLowerCase().includes(search.toLowerCase()));
  return <section>
    <div className="connected-heading"><h2>{faculty ? 'Unified application inbox' : board ? 'Assigned applications' : 'My applications'}</h2><Button disabled={busy} onClick={() => edit()}>New application</Button></div>
    {error && <p className="connected-error" role="alert">{error}</p>}{message && <p className="connected-banner" role="status">{message}</p>}
    <div className="connected-actions"><input className="connected-search" aria-label="Search applications" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications" /><label>Status <select aria-label="Application status" value={filter} onChange={(e) => setFilter(e.target.value)}>{['all', 'submitted', 'resubmitted', 'preliminary-checked', 'correction-required', 'approved', 'rejected'].map((s) => <option key={s} value={s}>{s.replaceAll('-', ' ')}</option>)}</select></label></div>
    {form === 'application' && <form className="connected-form" onSubmit={submit}><h2>{current ? 'Correct application' : 'New application'}</h2>
      <label>Activity<select name="eventId" required defaultValue={current?.eventId || initialEventId} disabled={Boolean(current?.id)}><option value="">Select activity</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>{current?.id && <input type="hidden" name="eventId" value={current.eventId} />}</label>
      <label>Application type<select name="type" disabled={Boolean(current?.id)} defaultValue={current?.type || (events.find(e => e.id === initialEventId)?.category === 'IV' ? 'iv-participation' : 'participation')}>{WORKFLOW_TYPES.filter((t) => t !== 'sponsorship-proposal' || board || faculty).map((t) => <option key={t} value={t}>{t.replaceAll('-', ' ')}</option>)}</select>{current?.id && <input type="hidden" name="type" value={current.type} />}</label>
      <label>Title<input name="title" required defaultValue={current?.title} /></label><label>Explanation / proposal<textarea name="explanation" required defaultValue={current?.explanation} /></label>
      <label>Requested attendance (correction only)<select name="requestedAttendance" defaultValue={current?.requestedAttendance || 'present'}><option value="present">Present</option><option value="absent">Absent</option></select></label>
      <label>Supporting evidence<input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /></label>{attachments.map((a) => <p key={a.path}>{a.name}</p>)}{progress !== null && <p>Uploading {progress}%</p>}
      <div className="connected-actions"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Submit for review'}</Button><Button type="button" variant="outline" onClick={() => setForm(null)} disabled={busy}>Cancel</Button></div>
    </form>}
    {['review', 'confirmation'].includes(form) && <form className="connected-form" onSubmit={submit}><h2>{form === 'confirmation' ? current?.type === 'od' ? 'Record institutional confirmation' : 'Record actual fulfillment' : selected?.nextStatus.replaceAll('-', ' ')}: {current?.title}</h2><p>{current?.explanation}</p><label>{form === 'confirmation' ? 'Confirmation reference and remarks' : 'Required decision remarks'}<textarea name="remarks" required /></label><div className="connected-actions"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save decision'}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setForm(null)}>Cancel</Button></div></form>}
    {form === 'history' && <section className="connected-form"><h2>Ordered decision history: {current?.title}</h2>{history === null ? <p>Loading…</p> : !history.length ? <p>No decisions yet.</p> : history.map((r) => <article className="connected-record" key={r.id}><h3>{r.historyType === 'versions' ? `Submission version ${r.version}` : r.status.replaceAll('-', ' ')}</h3><p>{r.explanation || r.remarks}</p><p>{r.reviewerId || r.studentId} · {r.decidedAt?.toDate?.().toLocaleString()}</p>{r.amendedAttendance && <p>Attendance: {r.previousAttendance} → {r.amendedAttendance}</p>}</article>)}<Button variant="outline" onClick={() => setForm(null)}>Close history</Button></section>}
    {records === null && !error && <p className="connected-empty">Loading applications…</p>}{records?.length === 0 && <p className="connected-empty">No applications yet.</p>}
    <div className="connected-grid">{rows.map((r) => { const next = nextAction(r); return <article className="connected-record" key={r.id} id={`application-${r.id}`}><small>{r.type.replaceAll('-', ' ')} · {r.status.replaceAll('-', ' ')} · Version {r.version}</small><h2>{r.title}</h2><p>{r.studentName} · {events.find((e) => e.id === r.eventId)?.title || r.eventId}</p><p>{r.explanation}</p><p><strong>Next action:</strong> {next.action}<br /><strong>Responsible:</strong> {next.role}</p>{r.remarks && <p>Reviewer remarks: {r.remarks}</p>}{r.type === 'od' && <p>Club approval: {r.status}<br />Institutional OD: {r.institutionalStatus}</p>}{r.type === 'sponsorship-support' && <p>Support decision: {r.status}<br />Actual fulfillment: {r.fulfillmentStatus}</p>}{r.confirmationReference && <p>Confirmation reference: {r.confirmationReference}</p>}<div className="connected-actions">{evidence(r.attachments)}<Button variant="outline" disabled={busy} onClick={() => { setSelected(r); setForm('history'); }}>Decision history</Button>
      {(faculty || board) && ['submitted', 'resubmitted'].includes(r.status) && <Button disabled={busy} onClick={() => { setSelected({ ...r, nextStatus: 'preliminary-checked' }); setForm('review'); }}>Recommend and forward to Faculty</Button>}
      {faculty && r.status === 'preliminary-checked' && ['approved', 'correction-required', 'rejected'].map((s) => <Button key={s} variant="outline" disabled={busy} onClick={() => { setSelected({ ...r, nextStatus: s }); setForm('review'); }}>{s.replaceAll('-', ' ')}</Button>)}
      {r.studentId === uid && r.status === 'correction-required' && <Button disabled={busy} onClick={() => edit(r)}>Correct and resubmit</Button>}
      {faculty && r.status === 'approved' && ((r.type === 'od' && r.institutionalStatus === 'pending') || (r.type === 'sponsorship-support' && r.fulfillmentStatus === 'pending')) && <Button disabled={busy} variant="outline" onClick={() => { setSelected(r); setForm('confirmation'); }}>{r.type === 'od' ? 'Record institutional confirmation' : 'Record actual fulfillment'}</Button>}
    </div></article>; })}</div>
  </section>;
}
