import { useMemo, useState } from "react";


const initialEvents = [
  { title: "Annual Health Awareness Camp", category: "Workshop / Camp", date: "22 Oct 2025", time: "9:00 AM – 4:00 PM", venue: "Anna Auditorium", status: "Approved", organizer: "Faculty / Club" },
  { title: "Campus Wellness Walk", category: "Outreach", date: "24 Oct 2025", time: "7:00 AM – 9:00 AM", venue: "Central Lawn", status: "Pending approval", organizer: "Wellness Committee" },
];

const initialRequests = [
  { title: "Annual Health Awareness Camp", type: "Event approval", requester: "Student Council", detail: "Review the event proposal and confirm the schedule.", status: "Pending" },
  { title: "Student Reports", type: "Report request", requester: "A. Kumar · 23BCE0192", detail: "A student has requested an update to their attendance report.", status: "Pending" },
  { title: "Late Hour Permission", type: "Permission request", requester: "Wellness Committee", detail: "Permission requested for the evening wellness program.", status: "Pending" },
  { title: "Attendance Correction", type: "Attendance correction", requester: "Sana Patel · 23MIS0417", detail: "Review the submitted attendance correction request.", status: "Pending" },
  { title: "Equipment purchase", type: "Finance request", requester: "Fitness Team · ₹18,400", detail: "Approve the purchase request for club equipment.", status: "Pending" },
];

const tools = [
  ["MoUs", "MoU Management", "▤"],
  ["Finance", "Finance Management", "₹"],
  ["Inventory", "Inventory Management", "▦"],
  ["Users & Roles", "User Management", "♙"],
  ["Meetings", "Meetings", "◷"],
  ["Announcements", "Announcements & Notifications", "◉"],
  ["Reports & Analytics", "Reports & Analytics", "▥"],
  ["Calendar", "Calendar Management", "▦"],
  ["Notifications", "Important Notifications", "♧"],
  ["Audit Trail", "Audit Trail History", "≡"],
];

const initialUsers = [
  { name: "Harish Y", email: "harish.y@vit.ac.in", role: "Faculty Admin", status: "Active" },
  { name: "A. Kumar", email: "a.kumar@vit.ac.in", role: "Club Coordinator", status: "Active" },
  { name: "Sana Patel", email: "sana.patel@vit.ac.in", role: "Student Member", status: "Active" },
];

const initialInventory = [
  { name: "Yoga mats", category: "Wellness equipment", quantity: 20, status: "In stock" },
  { name: "First aid kits", category: "Safety", quantity: 8, status: "In stock" },
  { name: "Water bottles", category: "Event supplies", quantity: 4, status: "Low stock" },
];

const initialAudit = [
  { action: "Event update", actor: "Faculty Admin", detail: "Annual Health Awareness Camp · Event details updated", time: "Today · 10:42 AM" },
  { action: "Attendance correction", actor: "A. Kumar", detail: "Student attendance record reviewed", time: "Today · 9:18 AM" },
  { action: "Finance approval", actor: "Faculty Admin", detail: "Equipment purchase request approved", time: "Yesterday · 4:35 PM" },
  { action: "User role change", actor: "Faculty Admin", detail: "Coordinator permissions updated", time: "21 Oct · 2:10 PM" },
];

const navTabs = [
  ["Home", "⌂"],
  ["Events", "▣"],
  ["Approvals", "✓"],
  ["Records", "▤"],
  ["More", "⊞"],
];

function FacultyModule({ name, onSignOut }) {
  const [tab, setTab] = useState("Home");
  const [screen, setScreen] = useState("");
  const [events, setEvents] = useState(initialEvents);
  const [requests, setRequests] = useState(initialRequests);
  const [users, setUsers] = useState(initialUsers);
  const [inventory, setInventory] = useState(initialInventory);
  const [audit, setAudit] = useState(initialAudit);
  const [notifications, setNotifications] = useState([
    { title: "Event approval", detail: "Annual Health Awareness Camp is awaiting review.", level: "Critical", read: false },
    { title: "Attendance warning", detail: "Review this week’s attendance records.", level: "Important", read: false },
    { title: "Deadline change", detail: "The registration deadline for Campus Wellness Walk has changed.", level: "Normal", read: true },
  ]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [flowResult, setFlowResult] = useState("");
  const [toast, setToast] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category: "Workshop / Camp",
    date: "",
    time: "",
    venue: "",
    organizer: "Faculty / Club / Committee",
    speaker: "",
    eligibility: "Students / Faculty / Open",
    capacity: "",
    deadline: "",
    attachment: "",
  });
  const [reviewReason, setReviewReason] = useState("");
  const [search, setSearch] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Student Member" });
  const [meetingForm, setMeetingForm] = useState({ title: "", date: "", time: "", venue: "" });
  const [inventoryForm, setInventoryForm] = useState({ name: "", category: "", quantity: "" });
  const [financeForm, setFinanceForm] = useState({ title: "", amount: "", description: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "" });
  const [announcementAudience, setAnnouncementAudience] = useState("All club members");
  const [mouForm, setMouForm] = useState({ partner: "", purpose: "" });
  const [newAnnouncement, setNewAnnouncement] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("This month");
  const [calendarMonth, setCalendarMonth] = useState(0);
  const [auditFilter, setAuditFilter] = useState("All activities");
  const [meetings, setMeetings] = useState([
    { title: "Wellness committee check-in", date: "23 Oct · 2:00 PM", venue: "Faculty Meeting Room" },
    { title: "Health camp planning", date: "27 Oct · 11:30 AM", venue: "Online meeting" },
  ]);
  const [mous, setMous] = useState([
    { title: "VIT Health Centre", status: "Active", date: "Valid until 30 Jun 2026" },
    { title: "Campus Sports Complex", status: "Signature pending", date: "Submitted 18 Oct 2025" },
  ]);

  const filteredEvents = useMemo(() => events.filter((event) => `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(search.toLowerCase())), [events, search]);
  const filteredRequests = useMemo(() => requests.filter((item) => item.status === "Pending" && `${item.title} ${item.type} ${item.requester}`.toLowerCase().includes(search.toLowerCase())), [requests, search]);
  const currentTitle = screen || (tab === "Home" ? "Faculty / Admin" : tab);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (destination) => {
    setTab(destination);
    setScreen("");
    setSelectedRequest(null);
    setFlowResult("");
    setShowEventForm(false);
    setSearch("");
  };

  const openScreen = (destination) => {
    setScreen(destination);
    setSelectedRequest(null);
    setFlowResult("");
    setShowEventForm(false);
    setSearch("");
  };

  const appendAudit = (action, detail) => {
    setAudit((current) => [{ action, actor: name, detail, time: "Just now" }, ...current]);
  };

  const updateRequest = (status, label) => {
    if (!selectedRequest) return;
    setRequests((current) => current.map((item) => item.title === selectedRequest.title ? { ...item, status } : item));
    if (selectedRequest.type === "Event approval") {
      setEvents((current) => current.map((item) => item.title === selectedRequest.title ? { ...item, status } : item));
    }
    setNotifications((current) => [{ title: `${selectedRequest.title} · ${status}`, detail: `Request decision recorded by ${name}.`, level: "Important", read: false }, ...current]);
    appendAudit(label, `${selectedRequest.title} · ${reviewReason || status.toLowerCase()}`);
    setFlowResult(label);
    setReviewReason("");
  };

  const saveEvent = (event) => {
    event.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.venue.trim()) {
      notify("Complete the event title, date, and venue before saving.");
      return;
    }
    const newEvent = { ...eventForm, date: new Date(`${eventForm.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), status: "Pending approval" };
    setEvents((current) => [newEvent, ...current]);
    setRequests((current) => [{ title: newEvent.title, type: "Event approval", requester: name, detail: `${newEvent.category} · ${newEvent.date} · ${newEvent.time} · ${newEvent.venue}`, status: "Pending" }, ...current]);
    appendAudit("Event created", eventForm.title);
    setEventForm({ title: "", description: "", category: "Workshop / Camp", date: "", time: "", venue: "", organizer: "Faculty / Club / Committee", speaker: "", eligibility: "Students / Faculty / Open", capacity: "", deadline: "", attachment: "" });
    setScreen("Create Event");
    setShowEventForm(false);
    setFlowResult("Event created successfully");
  };

  const saveInventoryItem = (event) => {
    event.preventDefault();
    if (!inventoryForm.name.trim() || !inventoryForm.quantity) {
      notify("Enter an item name and starting quantity.");
      return;
    }
    setInventory((current) => [{ name: inventoryForm.name, category: inventoryForm.category || "Club supplies", quantity: Number(inventoryForm.quantity), status: Number(inventoryForm.quantity) <= 5 ? "Low stock" : "In stock" }, ...current]);
    appendAudit("Inventory item added", inventoryForm.name);
    setInventoryForm({ name: "", category: "", quantity: "" });
    setShowEventForm(false);
    notify("Inventory item added.");
  };

  const saveFinanceRequest = (event) => {
    event.preventDefault();
    if (!financeForm.title.trim() || !financeForm.amount) {
      notify("Enter a request title and amount.");
      return;
    }
    const request = { title: financeForm.title, type: "Finance request", requester: `${name} · ₹${financeForm.amount}`, detail: financeForm.description || "Finance request submitted for review.", status: "Pending" };
    setRequests((current) => [request, ...current]);
    appendAudit("Finance request submitted", request.title);
    setFinanceForm({ title: "", amount: "", description: "" });
    setShowEventForm(false);
    notify("Finance request submitted for approval.");
  };

  const saveUser = (event) => {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      notify("Enter the user name and campus email.");
      return;
    }
    setUsers((current) => [{ ...userForm, status: "Active" }, ...current]);
    appendAudit("User added", `${userForm.name} · ${userForm.role}`);
    setUserForm({ name: "", email: "", role: "Student Member" });
    notify("User added and role assigned.");
  };

  const saveMeeting = (event) => {
    event.preventDefault();
    if (!meetingForm.title.trim() || !meetingForm.date) {
      notify("Add a meeting title and date.");
      return;
    }
    setMeetings((current) => [{ ...meetingForm, date: `${meetingForm.date} · ${meetingForm.time || "Time TBD"}` }, ...current]);
    appendAudit("Meeting scheduled", meetingForm.title);
    setMeetingForm({ title: "", date: "", time: "", venue: "" });
    notify("Meeting added to the club calendar.");
  };

  const saveAnnouncement = (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      notify("Add an announcement title and message.");
      return;
    }
    setNewAnnouncement({ ...announcementForm, audience: announcementAudience });
    appendAudit("Announcement published", announcementForm.title);
    setAnnouncementForm({ title: "", message: "" });
    notify("Announcement published to club members.");
  };

  const renderEventForm = () => (
    <form className="faculty-form" onSubmit={saveEvent}>
      <FormField label="Event Title" value={eventForm.title} placeholder="Annual Health Awareness Camp" onChange={(value) => setEventForm({ ...eventForm, title: value })} required />
      <FormField label="Description" value={eventForm.description} placeholder="Brief event description" onChange={(value) => setEventForm({ ...eventForm, description: value })} textarea />
      <FormField label="Category" value={eventForm.category} onChange={(value) => setEventForm({ ...eventForm, category: value })} options={["Workshop / Camp", "Lecture", "Outreach", "Fitness", "Wellness"]} />
      <FormField label="Date" type="date" value={eventForm.date} onChange={(value) => setEventForm({ ...eventForm, date: value })} required />
      <FormField label="Time" value={eventForm.time} placeholder="Start time — End time" onChange={(value) => setEventForm({ ...eventForm, time: value })} />
      <FormField label="Venue" value={eventForm.venue} placeholder="Select venue" onChange={(value) => setEventForm({ ...eventForm, venue: value })} required />
      <FormField label="Organizer" value={eventForm.organizer} onChange={(value) => setEventForm({ ...eventForm, organizer: value })} />
      <FormField label="Speaker / Guest" value={eventForm.speaker} placeholder="Optional" onChange={(value) => setEventForm({ ...eventForm, speaker: value })} />
      <FormField label="Eligibility" value={eventForm.eligibility} onChange={(value) => setEventForm({ ...eventForm, eligibility: value })} />
      <div className="faculty-form-split">
        <FormField label="Capacity" type="number" value={eventForm.capacity} placeholder="Maximum participants" onChange={(value) => setEventForm({ ...eventForm, capacity: value })} />
        <FormField label="Registration Deadline" type="date" value={eventForm.deadline} onChange={(value) => setEventForm({ ...eventForm, deadline: value })} />
      </div>
      <label className="faculty-field-label">Attachments<input type="file" onChange={(event) => { const attachment = event.target.files?.[0]?.name || ""; setEventForm({ ...eventForm, attachment }); if (attachment) notify(`${attachment} attached to this event.`); }} />{eventForm.attachment && <small className="faculty-attachment-name">{eventForm.attachment}</small>}</label>
      <button className="faculty-primary-button" type="submit">Create event</button>
    </form>
  );

  const renderRequests = () => (
    <>
      <div className="faculty-page-intro"><p>Review requests and record a decision for the requester.</p></div>
      <label className="faculty-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" aria-label="Search requests" /></label>
      <div className="faculty-filter-pills"><span className="selected">Pending <b>{filteredRequests.length}</b></span><button onClick={() => notify("Showing recently completed requests.")}>Completed</button></div>
      <div className="faculty-list">
        {filteredRequests.map((item) => <button className="faculty-list-card" key={item.title} onClick={() => { setSelectedRequest(item); setScreen("Review request"); }}>
          <span className="faculty-card-symbol">{item.type === "Finance request" ? "₹" : item.type === "Event approval" ? "▣" : "◌"}</span>
          <span className="faculty-card-copy"><strong>{item.title}</strong><small>{item.type} · {item.requester}</small></span>
          <span className="faculty-chevron">›</span>
        </button>)}
        {filteredRequests.length === 0 && <EmptyState message="There are no pending requests matching your search." />}
      </div>
    </>
  );

  const renderEventList = () => (
    <>
      <label className="faculty-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" aria-label="Search events" /></label>
      <div className="faculty-section-heading"><div><strong>Club events</strong><small>{events.length} events in your calendar</small></div><button className="faculty-primary-button compact" onClick={() => { setShowEventForm(true); setFlowResult(""); }}>+ Create event</button></div>
      <div className="faculty-list">
        {filteredEvents.map((event) => <article className="faculty-event-card" key={event.title}>
          <div className="faculty-event-date"><strong>{event.date.split(" ")[0]}</strong><small>{event.date.split(" ").slice(1).join(" ")}</small></div>
          <div className="faculty-card-copy"><strong>{event.title}</strong><small>{event.time} · {event.venue}</small><span className={`faculty-status ${event.status === "Approved" ? "green" : "amber"}`}>{event.status}</span></div>
          <button className="faculty-more-action" aria-label={`Manage ${event.title}`} onClick={() => { setSelectedRequest({ title: event.title, type: "Event details", requester: event.organizer, detail: `${event.category} · ${event.date} · ${event.time} · ${event.venue}`, status: event.status }); setScreen("Event details"); }}>•••</button>
        </article>)}
      </div>
      <button className="faculty-secondary-button" onClick={() => openScreen("Calendar")}>Open calendar</button>
    </>
  );

  const renderHome = () => (
    <>
      <section className="faculty-welcome">
        <span className="faculty-eyebrow">SMART HEALTH CLUB · FACULTY / ADMIN</span>
        <h2>Good day, {name.split(" ")[0]}.</h2>
        <p>Here’s what needs your attention today.</p>
        <div className="faculty-welcome-art" aria-hidden="true"><i /><b>✳</b></div>
      </section>
      <div className="faculty-metric-grid">
        <Metric label="PENDING REQUESTS" value={requests.filter((item) => item.status === "Pending").length} tone="lavender" />
        <Metric label="UPCOMING EVENTS" value={events.length} tone="mint" />
      </div>
      <section className="faculty-content-section">
        <div className="faculty-section-heading"><div><strong>Needs your attention</strong><small>Requests waiting for review</small></div><button className="faculty-text-button" onClick={() => navigate("Approvals")}>View all</button></div>
        <div className="faculty-list">
          {requests.filter((item) => item.status === "Pending").slice(0, 3).map((item) => <button className="faculty-list-card" key={item.title} onClick={() => { setSelectedRequest(item); setScreen("Review request"); }}>
            <span className="faculty-card-symbol alert">!</span><span className="faculty-card-copy"><strong>{item.title}</strong><small>{item.type} · {item.requester}</small></span><span className="faculty-chevron">›</span>
          </button>)}
        </div>
        <div className="faculty-section-heading next-section"><div><strong>Upcoming events</strong><small>Club calendar</small></div><button className="faculty-text-button" onClick={() => navigate("Events")}>All events</button></div>
        {events.slice(0, 2).map((event) => <article className="faculty-event-card" key={event.title}><div className="faculty-event-date"><strong>{event.date.split(" ")[0]}</strong><small>{event.date.split(" ").slice(1).join(" ")}</small></div><div className="faculty-card-copy"><strong>{event.title}</strong><small>{event.time} · {event.venue}</small></div></article>)}
      </section>
      <section className="faculty-quick-tools">
        <div className="faculty-section-heading"><div><strong>Quick access</strong><small>Popular admin tools</small></div><button className="faculty-text-button" onClick={() => navigate("More")}>View more</button></div>
        <div className="faculty-quick-grid">{[["Calendar", "▦"], ["Reports & Analytics", "▥"], ["Notifications", "♧"], ["User Management", "♙"]].map(([label, icon]) => <button key={label} onClick={() => openScreen(label)}><span>{icon}</span>{label}</button>)}</div>
      </section>
    </>
  );

  const renderReview = () => {
    if (flowResult) {
      const isApproval = flowResult === "Approved";
      const approvalNotification = flowResult === "Approval notification sent";
      const confirmation = isApproval ? "Approval successful" : approvalNotification ? "Approval notification sent" : flowResult === "Rejected" ? "Rejection notification sent" : "Update request sent";
      const description = isApproval ? `${selectedRequest?.title} has been approved successfully.` : approvalNotification ? "The approval decision has been recorded and the requester has been notified." : flowResult === "Rejected" ? "The rejection decision and reason have been sent to the requester." : "The requested changes have been sent to the responsible person.";
      return <Confirmation title={confirmation} detail={description} action={isApproval ? "Continue to notification" : "Done"} onAction={() => { if (isApproval) { setFlowResult("Approval notification sent"); return; } setFlowResult(""); setSelectedRequest(null); setScreen(""); setTab("Approvals"); }} />;
    }
    if (screen === "Reject request" || screen === "Request changes") {
      const isReject = screen === "Reject request";
      return <section className="faculty-flow-card">
        <h2>{isReject ? "Reject request" : "Request changes"}</h2>
        <p>{selectedRequest?.title}</p>
        <label className="faculty-field-label">{isReject ? "Reason for rejection" : "What needs to be updated?"}<textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder={isReject ? "Enter the reason for rejecting this request..." : "Enter the details that need correction..."} rows="4" /></label>
        {!isReject && <label className="faculty-field-label">Comments / Instructions<textarea placeholder="Explain why the update is required..." rows="3" /></label>}
        <button className={`faculty-primary-button ${isReject ? "danger" : ""}`} onClick={() => reviewReason.trim() ? updateRequest(isReject ? "Rejected" : "Changes requested", isReject ? "Rejected" : "Changes requested") : notify("Enter a reason before sending.")}>{isReject ? "Send rejection" : "Submit update request"}</button>
      </section>;
    }
    const request = selectedRequest || { title: screen === "Event details" ? "Club event" : "Review request", type: "Faculty / Admin", requester: "Club member", detail: "Review the request and record a decision." };
    return <section className="faculty-flow-card">
      <span className="faculty-status amber">{request.type}</span>
      <h2>{request.title}</h2>
      <p>{request.requester}</p>
      <div className="faculty-detail-box">{request.detail}</div>
      <p className="faculty-flow-footnote">Your decision will be recorded in the audit trail and the requester will be notified.</p>
      {screen === "Event details" ? <><button className="faculty-primary-button" onClick={() => notify("Event details opened for editing.")}>Edit event</button><button className="faculty-secondary-button" onClick={() => { setSelectedRequest(null); setScreen(""); }}>Back to events</button></> : <div className="faculty-decision-actions">
        <button className="faculty-primary-button" onClick={() => updateRequest("Approved", "Approved")}>Approve request</button>
        <button className="faculty-secondary-button danger-text" onClick={() => { setFlowResult(""); setScreen("Reject request"); }}>Reject</button>
        <button className="faculty-secondary-button" onClick={() => { setFlowResult(""); setScreen("Request changes"); }}>Request changes</button>
      </div>}
    </section>;
  };

  const renderMore = () => (
    <>
      <div className="faculty-page-intro"><h2>More</h2><p>Faculty & Admin tools</p></div>
      <div className="faculty-tool-list">{tools.map(([label, route, icon]) => <button key={label} onClick={() => openScreen(route)}><span>{label}</span><b>{icon}</b><i>›</i></button>)}</div>
      <button className="faculty-secondary-button signout-button" onClick={onSignOut}>Sign out</button>
    </>
  );

  const renderCalendar = () => {
    const monthLabels = ["October 2025", "November 2025", "December 2025"];
    const monthDates = calendarMonth === 0 ? ["19", "20", "21", "22", "23", "24", "25"] : ["16", "17", "18", "19", "20", "21", "22"];
    return <>
      <div className="faculty-calendar-head"><button aria-label="Previous month" onClick={() => setCalendarMonth((value) => Math.max(0, value - 1))}>‹</button><strong>{monthLabels[calendarMonth]}</strong><button aria-label="Next month" onClick={() => setCalendarMonth((value) => Math.min(2, value + 1))}>›</button></div>
      <div className="faculty-week-grid">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, index) => <div key={day}><small>{day}</small><strong className={index === 3 ? "today" : ""}>{monthDates[index]}</strong>{index === 3 || index === 5 ? <i /> : null}</div>)}</div>
      <div className="faculty-section-heading"><div><strong>Events this month</strong><small>Tap an event to review its details</small></div><button className="faculty-text-button" onClick={() => { setShowEventForm(true); setScreen("Create Event"); }}>+ Add</button></div>
      {events.map((event) => <article className="faculty-event-card" key={event.title}><div className="faculty-event-date"><strong>{event.date.split(" ")[0]}</strong><small>{event.date.split(" ").slice(1).join(" ")}</small></div><div className="faculty-card-copy"><strong>{event.title}</strong><small>{event.time} · {event.venue}</small></div><span className="faculty-chevron">›</span></article>)}
    </>;
  };

  const renderReports = () => (
    <>
      <label className="faculty-select-label">Report period<select value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)}><option>This month</option><option>This semester</option><option>This academic year</option></select></label>
      <div className="faculty-report-metrics"><Metric label="TOTAL MEMBERS" value="2,480" tone="lavender" /><Metric label="EVENTS HELD" value={events.length + 12} tone="mint" /><Metric label="ATTENDANCE RATE" value="84.6%" tone="blue" /><Metric label="PENDING ITEMS" value={requests.filter((item) => item.status === "Pending").length} tone="peach" /></div>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Attendance overview</strong><small>{reportPeriod} · Club participation</small></div><button className="faculty-text-button" onClick={() => notify("Attendance report exported.")}>Export</button></div><div className="faculty-bars">{[44, 62, 51, 76, 58, 88, 69].map((value, index) => <div key={index}><i style={{ height: `${value}%` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div></section>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Event performance</strong><small>Recent club activity</small></div></div>{events.slice(0, 3).map((event, index) => <div className="faculty-data-row" key={event.title}><span>{event.title}</span><b>{[92, 78, 65][index]}%</b></div>)}</section>
    </>
  );

  const renderUsers = () => (
    <>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Users & roles</strong><small>{users.length} active accounts</small></div><button className="faculty-text-button" onClick={() => setShowEventForm((value) => !value)}>{showEventForm ? "Cancel" : "+ Add user"}</button></div>
        {showEventForm && <form className="faculty-form compact-form" onSubmit={(event) => { saveUser(event); setShowEventForm(false); }}><FormField label="Full name" value={userForm.name} onChange={(value) => setUserForm({ ...userForm, name: value })} required /><FormField label="Campus email" type="email" value={userForm.email} onChange={(value) => setUserForm({ ...userForm, email: value })} required /><FormField label="Role" value={userForm.role} onChange={(value) => setUserForm({ ...userForm, role: value })} options={["Faculty Admin", "Club Coordinator", "Student Member", "Volunteer"]} /><button className="faculty-primary-button" type="submit">Add user</button></form>}
        {users.map((user) => <div className="faculty-data-row user-row" key={user.email}><span className="faculty-user-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="faculty-card-copy"><strong>{user.name}</strong><small>{user.email}</small></span><select aria-label={`Role for ${user.name}`} value={user.role} onChange={(event) => { setUsers((current) => current.map((item) => item.email === user.email ? { ...item, role: event.target.value } : item)); appendAudit("User role change", `${user.name} · ${event.target.value}`); }}><option>Faculty Admin</option><option>Club Coordinator</option><option>Student Member</option><option>Volunteer</option></select></div>)}
      </section>
      <p className="faculty-inline-note">Role changes are recorded in the audit trail.</p>
    </>
  );

  const renderInventory = () => (
    <>
      <div className="faculty-section-heading"><div><strong>Inventory items</strong><small>Club equipment and supplies</small></div><button className="faculty-text-button" onClick={() => setShowEventForm((value) => !value)}>{showEventForm ? "Cancel" : "+ Add item"}</button></div>
      {showEventForm && <form className="faculty-form compact-form" onSubmit={saveInventoryItem}><FormField label="Item name" value={inventoryForm.name} onChange={(value) => setInventoryForm({ ...inventoryForm, name: value })} required /><FormField label="Category" value={inventoryForm.category} onChange={(value) => setInventoryForm({ ...inventoryForm, category: value })} /><FormField label="Starting quantity" type="number" value={inventoryForm.quantity} onChange={(value) => setInventoryForm({ ...inventoryForm, quantity: value })} required /><button className="faculty-primary-button" type="submit">Add item</button></form>}
      <div className="faculty-list">{inventory.map((item) => <article className="faculty-inventory-card" key={item.name}><span className="faculty-card-symbol">▦</span><span className="faculty-card-copy"><strong>{item.name}</strong><small>{item.category} · <span className={item.status === "Low stock" ? "warning-text" : ""}>{item.status}</span></small><b>Quantity: {item.quantity}</b></span><div className="faculty-stepper"><button aria-label={`Remove one ${item.name}`} onClick={() => setInventory((current) => current.map((row) => { if (row.name !== item.name) return row; const quantity = Math.max(0, row.quantity - 1); return { ...row, quantity, status: quantity <= 5 ? "Low stock" : "In stock" }; }))}>−</button><button aria-label={`Add one ${item.name}`} onClick={() => setInventory((current) => current.map((row) => row.name === item.name ? { ...row, quantity: row.quantity + 1, status: "In stock" } : row))}>+</button></div></article>)}</div>
      <button className="faculty-secondary-button" onClick={() => { const request = { title: "Inventory restock request", type: "Inventory request", requester: name, detail: "Review the current stock and submit a purchase request.", status: "Pending" }; setRequests((current) => [request, ...current]); appendAudit("Inventory request", "Restock requested"); notify("Inventory request sent for approval."); }}>Request stock</button>
    </>
  );

  const renderFinance = () => (
    <>
      <div className="faculty-report-metrics"><Metric label="AVAILABLE BUDGET" value="₹1.24L" tone="mint" /><Metric label="PENDING REQUESTS" value={requests.filter((item) => item.status === "Pending" && item.type.includes("Finance")).length} tone="peach" /></div>
      <div className="faculty-section-heading"><div><strong>Finance requests</strong><small>Budget activity and approvals</small></div><button className="faculty-text-button" onClick={() => setShowEventForm((value) => !value)}>{showEventForm ? "Cancel" : "+ Request update"}</button></div>
      {showEventForm && <form className="faculty-form compact-form" onSubmit={saveFinanceRequest}><FormField label="Request title" value={financeForm.title} onChange={(value) => setFinanceForm({ ...financeForm, title: value })} required /><FormField label="Amount (₹)" type="number" value={financeForm.amount} onChange={(value) => setFinanceForm({ ...financeForm, amount: value })} required /><FormField label="Purpose" value={financeForm.description} onChange={(value) => setFinanceForm({ ...financeForm, description: value })} textarea /><button className="faculty-primary-button" type="submit">Submit finance request</button></form>}
      <div className="faculty-list">{requests.filter((item) => item.type.includes("Finance")).map((item) => <button className="faculty-list-card" key={item.title} onClick={() => { setSelectedRequest(item); setScreen("Review request"); }}><span className="faculty-card-symbol">₹</span><span className="faculty-card-copy"><strong>{item.title}</strong><small>{item.requester} · {item.status}</small></span><span className="faculty-chevron">›</span></button>)}</div>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Recent transactions</strong><small>This month</small></div><button className="faculty-text-button" onClick={() => openScreen("Audit Trail History")}>History</button></div><div className="faculty-data-row"><span>Wellness supplies</span><b>− ₹8,400</b></div><div className="faculty-data-row"><span>Event registration</span><b>+ ₹12,500</b></div></section>
    </>
  );

  const renderMeetings = () => (
    <>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Club meetings</strong><small>Committee schedule</small></div><button className="faculty-text-button" onClick={() => setShowEventForm((value) => !value)}>{showEventForm ? "Cancel" : "+ Schedule"}</button></div>
        {showEventForm && <form className="faculty-form compact-form" onSubmit={(event) => { saveMeeting(event); setShowEventForm(false); }}><FormField label="Meeting title" value={meetingForm.title} onChange={(value) => setMeetingForm({ ...meetingForm, title: value })} required /><div className="faculty-form-split"><FormField label="Date" type="date" value={meetingForm.date} onChange={(value) => setMeetingForm({ ...meetingForm, date: value })} required /><FormField label="Time" type="time" value={meetingForm.time} onChange={(value) => setMeetingForm({ ...meetingForm, time: value })} /></div><FormField label="Venue / link" value={meetingForm.venue} onChange={(value) => setMeetingForm({ ...meetingForm, venue: value })} /><button className="faculty-primary-button" type="submit">Add meeting</button></form>}
        {meetings.map((meeting) => <div className="faculty-data-row" key={meeting.title}><span><strong>{meeting.title}</strong><small>{meeting.date} · {meeting.venue}</small></span><button className="faculty-text-button" onClick={() => notify("Meeting details opened.")}>Details</button></div>)}
      </section>
      <button className="faculty-secondary-button" onClick={() => notify("Meeting minutes are ready to add.")}>Add meeting minutes</button>
    </>
  );

  const renderAnnouncements = () => (
    <>
      <div className="faculty-page-intro"><p>Share important updates with students, faculty, and club organizers.</p></div>
      <div className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Announcements</strong><small>Visible to the club community</small></div></div>
        {newAnnouncement && <article className="faculty-announcement-card"><span className="faculty-status green">Just published</span><h3>{newAnnouncement.title}</h3><p>{newAnnouncement.message}</p><small>Audience: {newAnnouncement.audience}</small></article>}
        {[["Event announcement", "Reminder: register for this month’s health events.", "Critical"], ["Attendance warning", "Please review attendance submissions before Friday.", "Important"], ["Deadline change", "The equipment request deadline has been extended.", "Normal"]].map(([title, description, level]) => <article className="faculty-announcement-card" key={title}><span className="faculty-status">{level}</span><h3>{title}</h3><p>{description}</p></article>)}
      </div>
      <form className="faculty-form" onSubmit={saveAnnouncement}><h3>Create announcement</h3><FormField label="Title" value={announcementForm.title} onChange={(value) => setAnnouncementForm({ ...announcementForm, title: value })} required /><FormField label="Message" value={announcementForm.message} onChange={(value) => setAnnouncementForm({ ...announcementForm, message: value })} textarea required /><FormField label="Audience" value={announcementAudience} onChange={setAnnouncementAudience} options={["All club members", "Students", "Faculty", "Organizers"]} /><button className="faculty-primary-button" type="submit">Create announcement</button></form>
    </>
  );

  const renderNotifications = () => (
    <>
      <div className="faculty-page-intro"><p>Important activity and decisions across your health club.</p></div>
      <div className="faculty-notification-list">{notifications.map((item, index) => <article className={`faculty-notification-card ${item.level.toLowerCase()}`} key={`${item.title}-${index}`}><div className="faculty-notification-heading"><b>{item.level}</b>{!item.read && <span>Pending</span>}</div><strong>{item.title}</strong><p>{item.detail}</p><button className="faculty-text-button" onClick={() => { setNotifications((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, read: true } : row)); if (item.title === "Event approval") navigate("Approvals"); else notify("Notification marked as read."); }}>{item.title === "Event approval" ? "Review request" : item.read ? "Read" : "Mark as read"}</button></article>)}</div>
      <button className="faculty-secondary-button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}>Mark all as read</button>
    </>
  );

  const renderMoUs = () => (
    <>
      <div className="faculty-section-heading"><div><strong>MoU Management</strong><small>Partner agreements and signatures</small></div><button className="faculty-text-button" onClick={() => setMous((current) => [{ title: "New campus partner", status: "Draft", date: "Created just now" }, ...current])}>+ New MoU</button></div>
      <div className="faculty-list">{mous.map((mou) => <article className="faculty-mou-card" key={mou.title}><div className="faculty-card-symbol">▤</div><div className="faculty-card-copy"><strong>{mou.title}</strong><small>{mou.date}</small><span className={`faculty-status ${mou.status === "Active" ? "green" : "amber"}`}>{mou.status}</span></div><button className="faculty-more-action" onClick={() => openScreen("MoU Signature Tracking")}>Track ›</button></article>)}</div>
      <div className="faculty-tool-actions"><button className="faculty-secondary-button" onClick={() => openScreen("MoU PDF Generator")}>Generate MoU PDF</button><button className="faculty-secondary-button" onClick={() => openScreen("MoU Signature Tracking")}>Signature tracking</button></div>
    </>
  );

  const renderAudit = () => (
    <>
      <div className="faculty-page-intro"><p>Recent actions across your club workspace.</p></div>
      <label className="faculty-select-label">Activity type<select value={auditFilter} onChange={(event) => setAuditFilter(event.target.value)}><option>All activities</option><option>Event updates</option><option>Attendance corrections</option><option>Finance approvals</option><option>User role changes</option></select></label>
      <div className="faculty-audit-list">{audit.filter((item) => auditFilter === "All activities" || (auditFilter === "Event updates" && item.action.includes("Event")) || (auditFilter === "Attendance corrections" && item.action.includes("Attendance")) || (auditFilter === "Finance approvals" && item.action.includes("Finance")) || (auditFilter === "User role changes" && item.action.includes("User role"))).map((item, index) => <article className="faculty-audit-row" key={`${item.action}-${index}`}><i /><span><strong>{item.action}</strong><small>{item.actor} · {item.time}</small><p>{item.detail}</p></span></article>)}</div>
    </>
  );

  const renderRecords = () => (
    <>
      <div className="faculty-page-intro"><p>Find club attendance, student reports, and submitted records.</p></div>
      <div className="faculty-tool-list faculty-record-tools">{[["Attendance Management", "▣"], ["Student Reports", "▤"], ["Attendance Correction", "✓"], ["OD List Management", "◷"], ["Board Attendance Results", "▥"], ["Reports & Analytics", "▧"]].map(([label, icon]) => <button key={label} onClick={() => openScreen(label)}><span>{label}</span><b>{icon}</b><i>›</i></button>)}</div>
      <section className="faculty-data-panel"><div className="faculty-section-heading"><div><strong>Recent attendance records</strong><small>Today · 22 Oct 2025</small></div><button className="faculty-text-button" onClick={() => notify("Attendance report exported.")}>Export</button></div>{["Vishva S A · 23MIS0451", "Sana Patel · 23BCE0192", "Rohan Verma · 22CSE0843"].map((student, index) => <div className="faculty-data-row" key={student}><span>{student}</span><span className={`faculty-status ${index < 2 ? "green" : "amber"}`}>{index < 2 ? "Present" : "Pending"}</span></div>)}</section>
    </>
  );

  const renderTool = () => {
    if (screen === "Create Event") return flowResult ? <Confirmation title="Event created successfully" detail="Your event has been added to the club calendar and submitted for review." action="Done" onAction={() => { setFlowResult(""); setScreen(""); setTab("Events"); }} /> : renderEventForm();
    if (screen === "Review request" || screen === "Reject request" || screen === "Request changes" || screen === "Event details") return renderReview();
    if (screen === "Reports & Analytics" || screen === "Club reports") return renderReports();
    if (screen === "Calendar" || screen === "Calendar Management") return renderCalendar();
    if (screen === "User Management") return renderUsers();
    if (screen === "Inventory Management") return renderInventory();
    if (screen === "Finance Management") return renderFinance();
    if (screen === "Meetings") return renderMeetings();
    if (screen === "Announcements & Notifications" || screen === "Announcements") return renderAnnouncements();
    if (screen === "Important Notifications" || screen === "Notifications") return renderNotifications();
    if (screen === "Audit Trail History" || screen === "Audit Trail") return renderAudit();
    if (screen === "MoU Management" || screen === "MoUs") return renderMoUs();
    if (screen === "MoU PDF Generator") return <form className="faculty-flow-card faculty-form" onSubmit={(event) => { event.preventDefault(); if (!mouForm.partner.trim() || !mouForm.purpose.trim()) { notify("Enter the partner name and agreement purpose."); return; } const newMou = { title: mouForm.partner, status: "Draft", date: "Created just now" }; setMous((current) => [newMou, ...current]); setMouForm({ partner: "", purpose: "" }); appendAudit("MoU generated", newMou.title); notify("MoU PDF generated and added to signature tracking."); }}><h2>MoU PDF Generator</h2><p>Prepare a partner agreement document for signature.</p><FormField label="Partner name" value={mouForm.partner} placeholder="Organization name" onChange={(value) => setMouForm({ ...mouForm, partner: value })} required /><FormField label="Agreement purpose" value={mouForm.purpose} placeholder="Describe the partnership" onChange={(value) => setMouForm({ ...mouForm, purpose: value })} textarea required /><button className="faculty-primary-button" type="submit">Generate PDF</button></form>;
    if (screen === "MoU Signature Tracking") return <div className="faculty-list">{mous.map((mou) => <article className="faculty-mou-card" key={mou.title}><div className="faculty-card-symbol">✎</div><div className="faculty-card-copy"><strong>{mou.title}</strong><small>{mou.date}</small><span className={`faculty-status ${mou.status === "Active" ? "green" : "amber"}`}>{mou.status}</span></div><button className="faculty-text-button" onClick={() => notify(`Signature reminder sent for ${mou.title}.`)}>Send reminder</button></article>)}</div>;
    if (screen === "Attendance Correction" || screen === "Student Report Request Correction" || screen === "OD List Management" || screen === "Late Hour Permission" || screen === "Student Reports" || screen === "Attendance Management" || screen === "Board Attendance Results" || screen === "EXC Year End Report" || screen === "Finance Update" || screen === "Finance Management Rejection Notification Sent") return <>{renderRequests(screen)}</>;
    return <div className="faculty-page-intro"><h2>{screen}</h2><p>Manage {screen.toLowerCase()} for your club.</p></div>;
  };

  return (
    <div className="faculty-app">
      <div className="faculty-phone">
        <aside className="faculty-sidebar">
          <div className="faculty-brand-lockup"><span>♥</span><div><strong>Smart Health Club</strong><small>MANAGEMENT</small></div></div>
          <div className="faculty-workspace-label">YOUR WORKSPACE</div>
          <div className="faculty-role-chip"><i />Faculty / Admin</div>
          <nav className="faculty-side-nav" aria-label="Faculty navigation">
            {navTabs.map(([label, icon]) => <button key={label} className={tab === label && !screen ? "active" : ""} onClick={() => navigate(label)}><span>{icon}</span><b>{label}</b>{label === "Approvals" && <i>{requests.filter((item) => item.status === "Pending").length}</i>}</button>)}
          </nav>
          <div className="faculty-sidebar-bottom">
            <div className="faculty-sidebar-help"><span>♥</span><strong>Wellness, together.</strong><small>Here to help your community thrive.</small></div>
            <div className="faculty-sidebar-profile"><span>{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{name}</strong><small>Faculty / Admin</small></div><button onClick={onSignOut}>Sign out</button></div>
          </div>
        </aside>
        <div className="faculty-workspace">
          <header className="faculty-topbar">
            <button className="faculty-back" aria-label="Back" onClick={() => { if (screen) { setScreen(""); setSelectedRequest(null); setFlowResult(""); setShowEventForm(false); } else navigate("Home"); }}>‹</button>
            <div className="faculty-header-copy"><span>Health Club&nbsp; / &nbsp;{screen ? currentTitle : tab}</span>{screen && <small>{currentTitle === "Create Event" ? "Plan a health club event" : "Faculty & Admin tools"}</small>}</div>
            <label className="faculty-top-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." aria-label="Search anything" /></label>
            <button className="faculty-bell" aria-label="Open notifications" onClick={() => openScreen("Important Notifications")}>♧{notifications.some((item) => !item.read) && <i />}</button>
            <button className="faculty-top-profile" onClick={() => openScreen("User Management")}><span>{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><b>{name}</b><i>⌄</i></button>
          </header>
          <main className={`faculty-main ${screen === "Create Event" ? "create-event-screen" : ""}`}>
            {!screen && tab !== "Home" && tab !== "More" && <div className="faculty-page-intro"><h2>{tab}</h2><p>{tab === "Events" ? "Create and manage club activities." : tab === "Approvals" ? "Review submissions and requests." : "Browse records and reports."}</p></div>}
            {screen === "Review request" || screen === "Reject request" || screen === "Request changes" || screen === "Event details" ? renderTool() :
              screen ? renderTool() :
                tab === "Home" ? renderHome() :
                  tab === "Events" ? (showEventForm ? renderEventForm() : renderEventList()) :
                    tab === "Approvals" ? renderRequests() :
                      tab === "Records" ? renderRecords() : renderMore()}
          </main>
          <nav className="faculty-bottom-nav" aria-label="Faculty navigation">
            {navTabs.map(([label, icon]) => <button key={label} className={tab === label && !screen ? "active" : ""} onClick={() => navigate(label)}><span>{icon}</span><small>{label}</small></button>)}
          </nav>
          {toast && <div className="faculty-toast" role="status"><b>✓</b>{toast}<button aria-label="Dismiss" onClick={() => setToast("")}>×</button></div>}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value = "", onChange, type = "text", placeholder = "", options, textarea = false, required = false }) {
  return <label className="faculty-field-label">{label}{options ? <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : textarea ? <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required={required} rows="3" /> : <input type={type} {...(type === "file" ? {} : { value })} placeholder={placeholder} onChange={(event) => onChange(type === "file" ? event.target.files?.[0]?.name || "" : event.target.value)} required={required} />}</label>;
}

function Metric({ label, value, tone }) {
  return <article className={`faculty-metric ${tone}`}><small>{label}</small><strong>{value}</strong><span>Club overview</span></article>;
}

function EmptyState({ message }) {
  return <div className="faculty-empty-state">{message}</div>;
}

function Confirmation({ title, detail, action, onAction }) {
  return <section className="faculty-confirmation"><span>✓</span><h2>{title}</h2><p>{detail}</p><small>Decision recorded · Notification delivered</small><button className="faculty-primary-button" onClick={onAction}>{action}</button></section>;
}

export default FacultyModule;
