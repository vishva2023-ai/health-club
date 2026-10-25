import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FacultyModule from "./FacultyModule.jsx";

const roles = ["Student", "Board member", "Admin / Faculty"];
const APP_NAME = "Smart Health Club Management";
const roleProfiles = {
  Student: { fullName: "Vishva S A", initials: "VSA" },
  "Board member": { fullName: "Praveen Kumar V", initials: "PKV" },
  "Admin / Faculty": { fullName: "Harish Y", initials: "HY" },
};

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <><path d="m5 12 4 4L19 6" /><path d="M21 12a9 9 0 1 1-2.64-6.36" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
  heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /><path d="M3.5 12h5l2-3 3 6 2-3h5" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name] || iconPaths.grid}
    </svg>
  );
}

const menuByRole = {
  Student: [
    ["Overview", "grid"],
    ["Explore events", "calendar"],
    ["My attendance", "check"],
    ["Wellness", "heart"],
    ["My profile", "person"],
  ],
  "Board member": [
    ["Overview", "grid"],
    ["Events", "calendar"],
    ["Attendance", "check"],
    ["Approvals", "check"],
    ["Members", "users"],
    ["Reports", "chart"],
    ["My profile", "person"],
  ],
  "Admin / Faculty": [
    ["Overview", "grid"],
    ["Events", "calendar"],
    ["Members", "users"],
    ["Reports", "chart"],
  ],
};

const events = [
  { title: "Sunrise Yoga Flow", category: "WELLNESS", date: "THU, OCT 22", time: "7:00 AM", place: "Central Lawn", color: "mint", initials: "SY" },
  { title: "Campus 5K Run", category: "FITNESS", date: "FRI, OCT 23", time: "6:30 AM", place: "Sports Complex", color: "blue", initials: "5K" },
  { title: "Mindful Minutes", category: "MINDFULNESS", date: "SAT, OCT 24", time: "10:00 AM", place: "Wellness Studio", color: "peach", initials: "MM" },
];

const initialMembers = [
  { initials: "VSA", name: "Vishva S A", id: "23MIS0451", status: "Checked in", tone: "green" },
  { initials: "SP", name: "Sana Patel", id: "23BCE0192", status: "Checked in", tone: "green" },
  { initials: "RV", name: "Rohan Verma", id: "22CSE0843", status: "On spot", tone: "blue" },
];

function App() {
  const [session, setSession] = useState(undefined);
  const [page, setPage] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [registered, setRegistered] = useState(["Sunrise Yoga Flow"]);
  const [members, setMembers] = useState(initialMembers);
  const [managedEvents, setManagedEvents] = useState(events);
  const [modal, setModal] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [autoStartScan, setAutoStartScan] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    watchAuth(setSession).then((fn) => { unsub = fn; }).catch((error) => { setSession(null); setNotice(friendlyAuthError(error)); });
    return () => unsub();
  }, []);

  const showNotice = (text) => {
    setNotice(text);
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(""), 3200);
  };

  const handleSignOut = async () => { await logOut(); setPage("Overview"); };

  const profile = session?.profile;
  const role = ROLE_LABELS[profile?.role] || "Student";
  const roleFullName = profile?.name || session?.user?.displayName || session?.user?.email || "";
  const roleInitials = roleFullName.split(/[\s@.]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 3).toUpperCase();

  const registerForEvent = (eventName) => {
    setRegistered((current) => current.includes(eventName) ? current : [...current, eventName]);
    showNotice(`You're on the list for ${eventName}.`);
    setModal("");
  };

  const checkIn = (name) => {
    setMembers((current) => current.map((member) => member.name === name ? { ...member, status: "Checked in", tone: "green" } : member));
    showNotice(`${name} checked in successfully.`);
  };

  const addMember = (member) => {
    if (members.some((current) => current.id.toLocaleUpperCase() === member.id.toLocaleUpperCase())) {
      showNotice(`Student ID ${member.id} is already in the member directory.`);
      return;
    }
    setMembers((current) => [{ ...member, initials: member.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase(), status: "Registered", tone: "green" }, ...current]);
    showNotice(`${member.name} was added to the member directory.`);
    setModal("");
  };

  if (session === undefined) {
    return <div className="login-screen" style={{ placeItems: "center", display: "grid" }}><p>Loading your club…</p></div>;
  }

  if (!session) {
    return <Login onNotice={showNotice} notice={notice} />;
  }

  if (!profile) {
    return <div className="login-screen" style={{ display: "grid", placeItems: "center", padding: 24 }}><div className="login-form-wrap"><h2>Account profile missing</h2><p>{session.error ? friendlyAuthError(session.error) : "Your sign-in worked, but no club profile exists for this account yet. Ask a faculty coordinator to set up your profile."}</p><button className="outline-button" onClick={handleSignOut}>Sign out</button></div></div>;
  }

  if (role === "Admin / Faculty") {
    return <FacultyModule name={roleFullName} onSignOut={handleSignOut} />;
  }

  const menu = menuByRole[role];
  const isStudent = role === "Student";
  return (
    <div className={`app-shell ${isStudent ? "student-theme" : ""}`}>
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-symbol"><Icon name="heart" size={21} /></div>
          <div><strong>Smart Health Club</strong><small>MANAGEMENT</small></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}>×</button>
        </div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="role-chip"><span className="role-dot" />{role}</div>
        <nav className="side-nav" aria-label="Main navigation">
          {menu.map(([label, icon]) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setMobileNavOpen(false); }}>
              <Icon name={icon} size={18} /><span>{label}</span>
              {label === "Approvals" && <span className="nav-count">3</span>}
              {label === "Events" && isStudent && <span className="nav-count">2</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Icon name="heart" size={18} /></div>
            <strong>Take a breath.</strong>
            <p>A little movement goes a long way.</p>
            <button onClick={() => { setPage(isStudent ? "Wellness" : "Reports"); showNotice("Your wellness resources are ready."); }}>Explore wellness <Icon name="arrow" size={15} /></button>
          </div>
          <button className="profile-mini" onClick={() => setPage(isStudent || role === "Board member" ? "My profile" : "Members")}>
            <span className="avatar avatar-small">{roleInitials}</span>
            <span className="profile-mini-copy"><strong>{roleFullName}</strong><small>{role}</small></span>
            <Icon name="more" size={19} />
          </button>
          <button className="sign-out" onClick={() => { setLoggedIn(false); setPage("Overview"); }}><Icon name="logout" size={17} />Sign out</button>
        </div>
      </aside>
      {mobileNavOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>Health Club</span><b>/</b><strong>{page}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." aria-label="Search" /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showNotice("You're all caught up on notifications.")}><Icon name="bell" size={19} /><i /></button>
            <button className="topbar-avatar" aria-label="Open account menu" onClick={() => setPage(isStudent || role === "Board member" ? "My profile" : "Members")}><span className="avatar avatar-small">{roleInitials}</span><span className="user-name">{roleFullName}</span><span className="chevron">⌄</span></button>
          </div>
        </header>
        <div className="page-content">
          {page === "Overview" ? (
            <Dashboard role={role} name={roleFullName} registered={registered} events={managedEvents} members={members} onOpenEvent={(eventName) => setModal(eventName)} onRegister={registerForEvent} onCheckIn={checkIn} onNavigate={setPage} onStartScan={() => { setAutoStartScan(true); setPage("Attendance"); }} onCreate={() => setModal("new-event")} onInvite={() => setModal("new-member")} onNotice={showNotice} />
          ) : (
            <SectionPage role={role} page={page} query={query} registered={registered} events={managedEvents} members={members} autoStartScan={autoStartScan} onAutoStartHandled={() => setAutoStartScan(false)} onOpenEvent={(eventName) => setModal(eventName)} onManageEvent={(eventName) => setModal(`manage-event:${eventName}`)} onRegister={registerForEvent} onCheckIn={checkIn} onNotice={showNotice} onCreate={() => setModal("new-event")} onInvite={() => setModal("new-member")} onExportReport={(rows) => exportAttendanceReport(rows)} />
          )}
        </div>
        <footer className="app-footer"><span>© 2025 {APP_NAME}</span><span><i /> All systems operational</span><span>Need help? <button onClick={() => showNotice("Our club team will be happy to help.")}>Contact support</button></span></footer>
      </main>
      {modal && <Modal key={modal} eventName={modal} role={role} events={managedEvents} onClose={() => setModal("")} onRegister={registerForEvent} onNotice={showNotice} onAddMember={addMember} onSaveEvent={(eventData) => { setManagedEvents((current) => [{ ...eventData, initials: eventData.title.slice(0, 2).toUpperCase(), color: "blue" }, ...current]); showNotice(`${eventData.title} was added to club events.`); setModal(""); }} onUpdateEvent={(originalTitle, eventData) => { setManagedEvents((current) => current.map((item) => item.title === originalTitle ? { ...eventData, initials: eventData.title.slice(0, 2).toUpperCase(), color: item.color } : item)); showNotice(`${eventData.title} was updated.`); setModal(""); }} />}
      {notice && <div className="toast" role="status"><span className="toast-check">✓</span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    </div>
  );
}

function Login({ role, onRoleChange, onLogin, onNotice, notice }) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      onNotice("Enter your campus email and password to continue.");
      return;
    }
    onLogin();
  };
  return (
    <div className="login-screen">
      <section className="login-story">
        <div className="story-glow glow-one" /><div className="story-glow glow-two" />
        <div className="brand-lockup brand-light">
          <div className="brand-symbol"><Icon name="heart" size={21} /></div>
          <div><strong>Smart Health Club</strong><small>MANAGEMENT</small></div>
        </div>
        <div className="story-content">
          <div className="eyebrow"><span /> YOUR CAMPUS. YOUR WELLNESS.</div>
          <h1>Feel good.<br /><em>Do more.</em></h1>
          <p>Your campus health club, all in one place. Find your people, move your way, and make every day a little healthier.</p>
          <div className="story-stats">
            <div><strong>2,400<span>+</span></strong><small>club members</small></div>
            <div><strong>48</strong><small>events this month</small></div>
            <div><strong>4.9<span>★</span></strong><small>member rating</small></div>
          </div>
        </div>
        <div className="quote-card"><span className="quote-mark">“</span><p>It’s the first time staying active has felt like the best part of my day.</p><div><span className="avatar quote-avatar">AS</span><span><strong>Ananya S.</strong><small>Student & club member</small></span><span className="quote-stars">★★★★★</span></div></div>
        <div className="story-footer"><span>VIT UNIVERSITY</span><span>WELLNESS, TOGETHER.</span></div>
      </section>
      <section className="login-panel">
        <div className="login-mobile-brand brand-lockup">
          <div className="brand-symbol"><Icon name="heart" size={20} /></div><div><strong>Smart Health Club</strong><small>MANAGEMENT</small></div>
        </div>
        <div className="login-form-wrap">
          <div className="login-heading"><span className="welcome-icon"><Icon name="heart" size={19} /></span><div className="eyebrow">WELCOME BACK</div><h2>Sign in to your account</h2><p>Good to see you again. Let’s make today count.</p></div>
          <form onSubmit={handleSubmit}>
            <label className="field-label">I’m signing in as</label>
            <div className="role-selector" role="tablist" aria-label="Choose your account type">
              {roles.map((item) => <button key={item} type="button" role="tab" aria-selected={role === item} className={role === item ? "selected" : ""} onClick={() => onRoleChange(item)}>{item === "Student" ? <Icon name="person" size={16} /> : item === "Board member" ? <Icon name="users" size={16} /> : <Icon name="grid" size={16} />}<span>{item}</span></button>)}
            </div>
            <label className="field-label" htmlFor="email">Campus email</label>
            <div className="input-wrap"><span className="input-icon">@</span><input id="email" type="email" placeholder="you@vit.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></div>
            <div className="password-label"><label className="field-label" htmlFor="password">Password</label><button type="button" className="text-button" onClick={() => onNotice("Password reset instructions will be sent to your campus email.")}>Forgot password?</button></div>
            <div className="input-wrap"><span className="input-icon"><Icon name="check" size={17} /></span><input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><button type="button" className="show-password" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check">✓</span><span>Keep me signed in</span></label>
            <button className="primary-button sign-in-button" type="submit">Sign in to your account <Icon name="arrow" size={18} /></button>
            <div className="demo-divider"><span /> <small>NEW TO THE CLUB?</small> <span /></div>
            <button type="button" className="outline-button" onClick={() => onNotice("Membership registration opens at the start of each semester.")}>Discover the club <Icon name="arrow" size={17} /></button>
          </form>
          <p className="login-help">Having trouble signing in? <button onClick={() => onNotice("Contact the Health Club desk at wellness@vit.ac.in.")}>Get help</button></p>
        </div>
        <div className="login-legal"><span>© 2025 {APP_NAME}</span><span>Privacy <b>·</b> Terms</span></div>
      </section>
      {notice && <div className="toast login-toast" role="status"><span className="toast-check">✓</span>{notice}<button aria-label="Dismiss notification" onClick={() => onNotice("")}>×</button></div>}
    </div>
  );
}

function Dashboard({ role, name, registered, events: availableEvents, onOpenEvent, onRegister, onCheckIn, members, onNavigate, onStartScan, onCreate, onInvite, onNotice }) {
  if (role === "Student") return <StudentDashboard name={name} registered={registered} events={availableEvents} onOpenEvent={onOpenEvent} onRegister={onRegister} onNavigate={onNavigate} onNotice={onNotice} />;
  if (role === "Admin / Faculty") return <AdminDashboard name={name} events={availableEvents} members={members} onNavigate={onNavigate} onCreate={onCreate} onInvite={onInvite} onNotice={onNotice} />;
  return <BoardDashboard name={name} events={availableEvents} onNavigate={onNavigate} onStartScan={onStartScan} onNotice={onNotice} />;
}

function PageHeading({ eyebrow, title, subtitle, action, onAction }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="primary-button heading-action" onClick={onAction}>{action === "Create event" ? <Icon name="plus" size={17} /> : null}{action}</button>}</div>;
}

function StudentDashboard({ name, registered, events: availableEvents, onOpenEvent, onRegister, onNavigate, onNotice }) {
  const featured = availableEvents[0];
  return (
    <div className="dashboard">
      <PageHeading eyebrow="THURSDAY, OCTOBER 22, 2025" title={<>Hey {name}, <span className="wave">✳</span></>} subtitle="A fresh day is a fresh start. Here’s your wellness snapshot." action="Explore events" onAction={() => onNavigate("Explore events")} />
      <div className="student-hero">
        <div className="hero-copy"><span className="hero-kicker"><span /> YOUR WEEKLY CHECK-IN</span><h2>You’re showing up<br />for <em>yourself.</em></h2><p>You’ve made it to 4 of your last 5 sessions. Keep that good energy going.</p><button className="hero-link" onClick={() => onNavigate("My attendance")}>See your progress <Icon name="arrow" size={16} /></button></div>
        <div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="plant plant-one"><span /><i /><b /></div><div className="plant plant-two"><span /><i /><b /></div><div className="mat" /><div className="person-illustration"><span className="head" /><span className="body" /><span className="leg leg-one" /><span className="leg leg-two" /></div><div className="art-sparkle sparkle-one">✳</div><div className="art-sparkle sparkle-two">✦</div></div>
        <div className="hero-progress"><div><strong>80%</strong><small>weekly goal</small></div><div className="progress-ring"><svg viewBox="0 0 62 62"><circle cx="31" cy="31" r="26" /><circle className="progress-stroke" cx="31" cy="31" r="26" /></svg><span>4/5</span></div></div>
      </div>
      <div className="stat-grid student-stats">
        <StatCard icon="calendar" iconTone="blue" label="UPCOMING EVENTS" value="3" note={<><span className="positive-dot" />Next up tomorrow</>} />
        <StatCard icon="check" iconTone="green" label="ATTENDANCE RATE" value="92%" note={<><span className="trend-up">↗ 8%</span> vs last month</>} />
        <StatCard icon="heart" iconTone="peach" label="WELLNESS STREAK" value="4 days" note="Your best is 7 days" />
        <StatCard icon="chart" iconTone="lilac" label="CLUB POINTS" value="280" note={<><span className="trend-up">+40</span> this month</>} />
      </div>
      <div className="content-grid student-content-grid">
        <section className="panel events-panel"><PanelHeading title="Coming up for you" subtitle="Good things are on the calendar." action="All events" onAction={() => onNavigate("Explore events")} /><div className="event-list">{availableEvents.map((event) => <EventRow key={event.title} event={event} registered={registered.includes(event.title)} onOpen={() => onOpenEvent(event.title)} onRegister={() => onRegister(event.title)} />)}</div></section>
        <section className="panel attendance-panel"><PanelHeading title="Your attendance" subtitle="Little steps add up." action="Details" onAction={() => onNavigate("My attendance")} /><AttendanceChart /><div className="attendance-summary"><span><i className="legend-dot blue-dot" />Sessions attended</span><strong>12 <small>/ 14</small></strong></div><div className="attendance-footer"><span className="pill pill-green">↗ 8.2%</span><span>compared to last month</span></div></section>
        <section className="panel announcement-panel"><div className="announcement-art"><span className="announcement-sun" /><span className="announcement-leaf leaf-a" /><span className="announcement-leaf leaf-b" /><span className="announcement-leaf leaf-c" /><span className="announcement-ground" /></div><div className="announcement-copy"><span className="eyebrow">A NOTE FROM THE CLUB</span><h3>Small steps.<br />Big <em>feel-good.</em></h3><p>Join us this Friday for our community morning walk. Bring a friend, and we’ll bring the coffee.</p><button className="text-arrow" onClick={() => onNotice("Morning walk details have been added to your calendar.")}>Count me in <Icon name="arrow" size={16} /></button></div></section>
        <section className="panel checkin-card"><div className="checkin-mark"><Icon name="heart" size={21} /></div><span className="eyebrow">YOUR WELLNESS MOMENT</span><h3>How are you<br />feeling today?</h3><p>Take a second to check in with yourself.</p><div className="mood-options">{["🙂", "😌", "😐", "😔", "😣"].map((mood) => <button key={mood} onClick={() => onNotice("Thanks for checking in. Take care of yourself today.")} aria-label={`Feeling ${mood}`}>{mood}</button>)}</div></section>
      </div>
      <div className="section-note"><span className="sparkle">✳</span> Your wellbeing is a journey, not a destination. Be kind to yourself.</div>
    </div>
  );
}

function AdminDashboard({ name, events: availableEvents, members, onNavigate, onCreate, onInvite, onNotice }) {
  return (
    <div className="dashboard">
      <PageHeading eyebrow="THURSDAY, OCTOBER 22, 2025" title={<>Good morning, {name} <span className="wave">✳</span></>} subtitle="Here’s what’s happening at your club today." action="Create event" onAction={onCreate} />
      <div className="admin-event-banner"><span className="live-indicator" /><span><strong>Next up: {availableEvents[0]?.title || "No events scheduled"}</strong><small>{availableEvents[0] ? `${availableEvents[0].place} · ${availableEvents[0].date} at ${availableEvents[0].time}` : "Create an event to get your club moving."}</small></span><button className="light-button" onClick={() => onNavigate("Events")}>View events <Icon name="arrow" size={15} /></button></div>
      <div className="stat-grid">
        <StatCard icon="users" iconTone="blue" label="TOTAL MEMBERS" value={(2486 + Math.max(0, members.length - initialMembers.length)).toLocaleString()} note={<><span className="trend-up">↗ 12.8%</span> this semester</>} />
        <StatCard icon="calendar" iconTone="peach" label="ACTIVE EVENTS" value={(18 + Math.max(0, availableEvents.length - events.length)).toLocaleString()} note={<><span className="positive-dot" />{availableEvents.length} on the calendar</>} />
        <StatCard icon="check" iconTone="green" label="AVG. ATTENDANCE" value="84.6%" note={<><span className="trend-up">↗ 4.2%</span> vs last month</>} />
        <StatCard icon="heart" iconTone="lilac" label="MEMBER SATISFACTION" value="4.8/5" note="Based on 326 responses" />
      </div>
      <div className="content-grid admin-grid">
        <section className="panel quick-links-panel"><PanelHeading title="Quick links" subtitle="Your club, at a glance." /><div className="quick-links-list">{[["Manage participants", "users", () => onNavigate("Members")], ["Invite a member", "plus", onInvite], ["Reports", "chart", () => onNavigate("Reports")], ["Event history", "clock", () => onNavigate("Events")]].map(([label, icon, action]) => <button key={label} onClick={action}><span><Icon name={icon} size={17} /></span>{label}<Icon name="arrow" size={15} /></button>)}</div><button className="request-change" onClick={() => onNotice("Your change request has been sent to the club board.")}>Request major change <Icon name="arrow" size={15} /></button></section>
        <section className="panel events-panel"><PanelHeading title="Upcoming events" subtitle="Your next club moments." action="Manage events" onAction={() => onNavigate("Events")} /><div className="compact-events">{availableEvents.slice(0, 2).map((event) => <EventRow key={event.title} event={event} registered onOpen={() => onNavigate("Events")} onRegister={() => onNavigate("Events")} />)}</div></section>
      </div>
    </div>
  );
}

function BoardDashboard({ name, events: availableEvents, onNavigate, onStartScan, onNotice }) {
  return (
    <div className="dashboard">
      <PageHeading eyebrow="THURSDAY, OCTOBER 22, 2025" title={<>Welcome back, {name} <span className="wave">✳</span></>} subtitle="Here’s an overview of your health club this week." action="Review approvals" onAction={() => onNavigate("Approvals")} />
      <div className="stat-grid">
        <StatCard icon="users" iconTone="blue" label="ACTIVE MEMBERS" value="2,486" note={<><span className="trend-up">↗ 12.8%</span> this semester</>} />
        <StatCard icon="calendar" iconTone="peach" label="EVENTS THIS MONTH" value="18" note={<><span className="positive-dot" />4 coming up this week</>} />
        <StatCard icon="check" iconTone="green" label="AVG. ATTENDANCE" value="84.6%" note={<><span className="trend-up">↗ 4.2%</span> vs last month</>} />
        <StatCard icon="heart" iconTone="lilac" label="MEMBER SATISFACTION" value="4.8/5" note="326 member responses" />
      </div>
      <div className="board-welcome"><div><span className="eyebrow">YOUR IMPACT, IN MOTION</span><h2>A healthier campus<br />starts <em>with us.</em></h2><p>See what your community has been making happen.</p><div className="board-welcome-actions"><button className="light-button" onClick={() => onNavigate("Reports")}>Explore club report <Icon name="arrow" size={16} /></button><button className="primary-button" onClick={onStartScan}>Scan Student ID <Icon name="arrow" size={16} /></button></div></div><div className="board-art"><div className="board-art-sun" /><div className="board-art-line line-one" /><div className="board-art-line line-two" /><div className="board-art-line line-three" /><div className="board-art-dot dot-one" /><div className="board-art-dot dot-two" /><span>+18.4%</span></div><div className="board-award"><span>✳</span><small>TOP WELLNESS<br />COMMUNITY</small></div></div>
      <div className="content-grid board-grid">
        <section className="panel chart-panel"><PanelHeading title="Club engagement" subtitle="Attendance across the last 7 months." action="Full report" onAction={() => onNavigate("Reports")} /><AttendanceChart /><div className="chart-legend"><span><i className="legend-dot blue-dot" />Attendance</span><span><i className="legend-dot green-dot" />Target</span><strong>+18.4% <small>vs last period</small></strong></div></section>
        <section className="panel approvals-panel"><PanelHeading title="Needs your attention" subtitle="A few decisions are waiting on you." action="View all" onAction={() => onNavigate("Approvals")} /><ApprovalRow initials="SC" color="mint" title="Spring Wellness Fair" subtitle="Event proposal · by Student Council" onClick={() => onNavigate("Approvals")} /><ApprovalRow initials="YM" color="lilac" title="Yoga mats (×20)" subtitle="Purchase request · ₹18,400" onClick={() => onNavigate("Approvals")} /><ApprovalRow initials="NM" color="peach" title="Nutrition Month" subtitle="Campaign proposal · by N. Menon" onClick={() => onNavigate("Approvals")} /><button className="approve-link" onClick={() => onNavigate("Approvals")}>Review all 3 requests <Icon name="arrow" size={15} /></button></section>
        <section className="panel events-panel board-events"><PanelHeading title="Upcoming club events" subtitle="Keep the good energy going." action="All events" onAction={() => onNavigate("Events")} /><div className="event-list">{availableEvents.map((event) => <EventRow key={event.title} event={event} registered onOpen={() => onNotice(`Event: ${event.title}`)} onRegister={() => onNotice(`Opening ${event.title}`)} />)}</div></section>
        <section className="panel community-highlight"><div className="community-icon"><Icon name="heart" size={21} /></div><span className="eyebrow">COMMUNITY HIGHLIGHT</span><h3>Good things<br />are growing.</h3><p>Member happiness is up 8% this month. That’s something worth celebrating.</p><button className="text-arrow" onClick={() => onNavigate("Reports")}>See what’s working <Icon name="arrow" size={15} /></button><div className="community-plant"><span /><i /><b /></div></section>
      </div>
    </div>
  );
}

function StatCard({ icon, iconTone, label, value, note }) {
  return <article className="stat-card"><div className={`stat-icon ${iconTone}`}><Icon name={icon} size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div><span className="stat-more"><Icon name="more" size={18} /></span></article>;
}

function PanelHeading({ title, subtitle, action, onAction }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="panel-action" onClick={onAction}>{action}<Icon name="arrow" size={14} /></button>}</div>;
}

function EventRow({ event, registered, onOpen, onRegister }) {
  return <article className="event-row"><button className={`event-thumb ${event.color}`} onClick={onOpen} aria-label={`Open ${event.title}`}><span>{event.initials}</span><i>✳</i></button><div className="event-info"><span className="event-category">{event.category}</span><button className="event-title" onClick={onOpen}>{event.title}</button><div className="event-meta"><span><Icon name="calendar" size={13} />{event.date}</span><span><Icon name="clock" size={13} />{event.time}</span><span><Icon name="pin" size={13} />{event.place}</span></div></div><button className={`event-action ${registered ? "is-registered" : ""}`} onClick={onRegister}>{registered ? "Going ✓" : "Join"}</button></article>;
}

function AttendanceChart() {
  const values = [38, 55, 47, 72, 58, 80, 69, 92, 65, 77, 84, 60, 96, 72, 88, 70, 84, 61, 93, 73, 79, 58, 87, 68];
  return <div className="attendance-chart" aria-label="Weekly attendance chart"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="chart-plot"><div className="chart-grid-lines"><i /><i /><i /><i /></div><div className="chart-bars">{values.map((value, index) => <span key={`${value}-${index}`} style={{ height: `${value}%` }} className={index > 18 ? "bar-muted" : ""} />)}</div></div></div>;
}

function MemberTable({ members, onCheckIn, canCheckIn = true }) {
  return <div className="member-table"><div className="table-head"><span>MEMBER</span><span>STUDENT ID</span><span>STATUS</span><span /></div>{members.map((member) => <div className="table-row" key={member.id}><span className="member-name"><span className={`avatar table-avatar ${member.tone}`}>{member.initials}</span>{member.name}</span><span className="member-id">{member.id}</span><span><span className={`status-pill ${member.tone}`}>{member.status}</span></span><span>{canCheckIn && member.status !== "Checked in" && <button className="table-check-button" onClick={() => onCheckIn(member.name)}>Check in</button>}</span></div>)}</div>;
}

function ApprovalRow({ initials, color, title, subtitle, onClick }) {
  return <button className="approval-row" onClick={onClick}><span className={`approval-avatar ${color}`}>{initials}</span><span className="approval-copy"><strong>{title}</strong><small>{subtitle}</small></span><span className="approval-chevron">›</span></button>;
}

function SectionPage({ role, page, query, registered, events: availableEvents, members, autoStartScan, onAutoStartHandled, onOpenEvent, onManageEvent, onRegister, onCheckIn, onNotice, onCreate, onInvite, onExportReport }) {
  const isStudent = role === "Student";
  const isAdmin = role === "Admin / Faculty";
  const [memberFilter, setMemberFilter] = useState("All");
  const titleMap = {
    "Explore events": ["FIND YOUR NEXT FEEL-GOOD", "Explore events", "From early morning movement to mindful moments, there’s something for you."],
    Events: ["WHAT’S HAPPENING", "Club events", "Create community, one good event at a time."],
    "My attendance": ["YOUR WELLNESS JOURNEY", "My attendance", "Every time you show up, it counts."],
    Attendance: ["TODAY AT THE CLUB", "Attendance & check-in", "Scan student IDs or find a member to mark attendance."],
    Wellness: ["TAKE A MOMENT FOR YOU", "Wellness resources", "A few thoughtful ways to take care of yourself today."],
    "My profile": ["YOUR ACCOUNT", "My profile", "Your club details, preferences and progress."],
    Members: ["YOUR COMMUNITY", "Club members", "A healthier campus starts with everyone."],
    Reports: ["THE BIG PICTURE", "Club reports", "See how your community is moving, growing and feeling."],
    Approvals: ["BOARD ACTIONS", "Pending approvals", "Thoughtful decisions make a stronger club."],
  };
  const [eyebrow, title, subtitle] = titleMap[page] || titleMap.Events;
  const filteredEvents = useMemo(() => availableEvents.filter((event) => `${event.title} ${event.category} ${event.place}`.toLowerCase().includes(query.toLowerCase())), [availableEvents, query]);
  const filteredMembers = useMemo(() => members.filter((member) => {
    const matchesQuery = `${member.name} ${member.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = memberFilter === "All" || (memberFilter === "Checked in" ? member.status === "Checked in" : member.status !== "Checked in");
    return matchesQuery && matchesFilter;
  }), [memberFilter, members, query]);
  const approvalItems = [
    { initials: "SC", color: "mint", title: "Spring Wellness Fair", subtitle: "Event proposal · by Student Council", detail: "Estimated attendees: 240 · Requested date: November 12" },
    { initials: "YM", color: "lilac", title: "Yoga mats (×20)", subtitle: "Purchase request · ₹18,400", detail: "Submitted by the Wellness team · Budget category: Equipment" },
    { initials: "NM", color: "peach", title: "Nutrition Month", subtitle: "Campaign proposal · by N. Menon", detail: "Four-week campus nutrition awareness program." },
  ];

  if ((page === "Attendance" || page === "Approvals") && role !== "Board member") {
    return <div className="dashboard section-dashboard"><PageHeading eyebrow="ROLE-RESTRICTED AREA" title="Board member access only" subtitle="Attendance scanning and approval tools are available to board members." /><section className="panel restricted-access"><span className="access-icon blue"><Icon name="users" size={20} /></span><p>Sign in with a board member account to access this section.</p></section></div>;
  }

  if (page === "Attendance") {
    return <div className="dashboard section-dashboard"><PageHeading eyebrow="TODAY AT THE CLUB" title="Scan attendance" subtitle="Choose an event, then scan a student ID to record attendance." /><AttendanceScanner members={members} autoStart={autoStartScan} onAutoStartHandled={onAutoStartHandled} onCheckIn={onCheckIn} onNotice={onNotice} /></div>;
  }

  if (page === "My profile" && role === "Board member") {
    return <div className="dashboard section-dashboard"><PageHeading eyebrow="YOUR BOARD ACCOUNT" title="Board member profile" subtitle="Manage your committee information and account preferences." /><BoardProfile onNotice={onNotice} /></div>;
  }

  return <div className="dashboard section-dashboard"><PageHeading eyebrow={eyebrow} title={title} subtitle={subtitle} action={(role === "Admin / Faculty" || role === "Board member") && (page === "Events" || page === "Approvals") ? page === "Events" ? "Create event" : undefined : undefined} onAction={onCreate} />
    {page === "Explore events" || page === "Events" ? <><div className="filter-row"><div className="filter-tabs"><button className="filter-active">All events <span>{filteredEvents.length}</span></button><button onClick={() => onNotice("Showing upcoming events.")}>Upcoming</button><button onClick={() => onNotice("Showing past events.")}>Past events</button></div><button className="soft-button filter-button" onClick={() => onNotice("Showing all event categories.")}>☷ <span>Filter</span></button></div><div className="event-card-grid">{filteredEvents.map((event) => <EventCard key={event.title} event={event} registered={registered.includes(event.title)} actionLabel={isAdmin ? "Manage" : undefined} onOpen={() => onOpenEvent(event.title)} onRegister={() => isAdmin ? onManageEvent(event.title) : isStudent ? onRegister(event.title) : onNotice(`Opening ${event.title}`)} />)}</div><section className="panel event-calendar-panel"><PanelHeading title="Your week at a glance" subtitle="A little movement fits into every schedule." /><div className="week-strip">{["MON 19", "TUE 20", "WED 21", "THU 22", "FRI 23", "SAT 24", "SUN 25"].map((day, index) => <div key={day} className={index === 3 ? "today" : ""}><small>{day.split(" ")[0]}</small><strong>{day.split(" ")[1]}</strong>{index === 3 || index === 4 ? <i /> : null}</div>)}</div><p className="calendar-event-note"><span className="calendar-note-dot" />{featuredEventForPage(filteredEvents)?.title || "No event selected"} · {featuredEventForPage(filteredEvents)?.time || "Make some time for you"}</p></section></> :
    page === "Attendance" ? <div className="attendance-layout"><section className="panel scanner-section"><PanelHeading title="Scan student ID" subtitle="Align the QR code or barcode inside the frame." /><div className="large-scanner"><div className="qr-placeholder"><i /><i /><i /><i /><b>✦</b></div><span>READY TO SCAN</span></div><button className="primary-button full-button" onClick={() => onNotice("Camera ready. Scan a student ID to check them in.")}>Start camera scanner <Icon name="arrow" size={16} /></button><button className="soft-button full-button" onClick={() => onNotice("Manual lookup opened. Search by name or student ID.")}>Manual lookup</button><div className="sync-note"><span className="live-indicator" />Attendance sync: Connected</div></section><section className="panel attendance-live-section"><PanelHeading title="Live counts" subtitle="Wellness Workshop · Today at 4:00 PM" action="View event" onAction={() => onNotice("Opening Wellness Workshop details.")} /><div className="large-counts"><div><strong>70</strong><span>Registered</span></div><div><strong>{members.filter((member) => member.status === "Checked in").length + 56}</strong><span>Checked in</span></div><div><strong>12</strong><span>Remaining</span></div></div><h3 className="subsection-title">Recent scans</h3><MemberTable members={members} onCheckIn={onCheckIn} /></section></div> :
    page === "Approvals" ? <div className="approval-page-list">{approvalItems.map((item) => <ApprovalCard key={item.title} item={item} onNotice={onNotice} />)}</div> :
    page === "Members" ? <section className="panel member-directory"><PanelHeading title="Member directory" subtitle={`${members.length} members in this directory.`} action={isAdmin ? "Invite member" : undefined} onAction={onInvite} /><div className="directory-filters"><span>ALL MEMBERS <b>{members.length}</b></span><span>CHECKED IN <b>{members.filter((member) => member.status === "Checked in").length}</b></span><span>NOT CHECKED IN <b>{members.filter((member) => member.status !== "Checked in").length}</b></span><label className="member-filter-select">Show<select value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)} aria-label="Filter members by attendance status"><option>All</option><option>Checked in</option><option>Not checked in</option></select></label></div><MemberTable members={filteredMembers} onCheckIn={onCheckIn} canCheckIn={role === "Board member"} /></section> :
    page === "My attendance" ? <><div className="stat-grid"><StatCard icon="check" iconTone="green" label="ATTENDANCE RATE" value="92%" note={<><span className="trend-up">↗ 8%</span> vs last month</>} /><StatCard icon="calendar" iconTone="blue" label="SESSIONS ATTENDED" value="12" note="Out of 14 this semester" /><StatCard icon="heart" iconTone="peach" label="CURRENT STREAK" value="4 days" note="Your best is 7 days" /><StatCard icon="chart" iconTone="lilac" label="CLUB POINTS" value="280" note="+40 this month" /></div><section className="panel attendance-page-chart"><PanelHeading title="Your attendance over time" subtitle="Showing your activity this semester." /><AttendanceChart /><div className="session-history">{events.map((event, index) => <div key={event.title}><span className={`history-check ${index < 2 ? "attended" : ""}`}>{index < 2 ? "✓" : "–"}</span><span><strong>{event.title}</strong><small>{event.date} · {event.time}</small></span><span className={`status-pill ${index < 2 ? "green" : "blue"}`}>{index < 2 ? "Attended" : "Registered"}</span></div>)}</div></section></> :
    page === "Wellness" ? <><div className="wellness-banner"><span className="wellness-banner-icon"><Icon name="heart" size={26} /></span><div><span className="eyebrow">A GENTLE REMINDER</span><h2>You don’t have to do it all.<br /><em>Just take one small step.</em></h2><p>Pick what feels right for you. There’s no wrong way to take care.</p></div></div><div className="wellness-grid">{[["Move a little", "A 10-minute walk is a great place to start.", "Start a mini walk", "mint"], ["Pause & breathe", "Make some space between you and the rush.", "Try a breathing break", "blue"], ["Find your people", "Wellness feels better when we do it together.", "Browse club events", "peach"]].map(([title, text, action, color]) => <article className={`wellness-card ${color}`} key={title}><span className="wellness-card-icon"><Icon name={title === "Find your people" ? "users" : title === "Pause & breathe" ? "heart" : "check"} size={21} /></span><h3>{title}</h3><p>{text}</p><button className="text-arrow" onClick={() => title === "Find your people" ? onNotice("Opening your campus events.") : onNotice(`${action} added to your wellness plan.`)}>{action}<Icon name="arrow" size={15} /></button></article>)}</div></> :
    page === "My profile" ? <div className="profile-layout"><section className="panel profile-card"><div className="profile-cover"><span className="profile-large-avatar">VSA</span></div><div className="profile-card-body"><span className="eyebrow">STUDENT MEMBER</span><h2>Vishva S A</h2><p>23MIS0451 · B.Tech Information Systems</p><div className="profile-detail-row"><span>Campus email</span><strong>vishva.sa@vit.ac.in</strong></div><div className="profile-detail-row"><span>Member since</span><strong>August 2023</strong></div><button className="soft-button" onClick={() => onNotice("Profile editing is ready.")}>Edit profile details</button></div></section><section className="panel profile-progress"><PanelHeading title="Your club progress" subtitle="Look at you, showing up." /><div className="profile-progress-score"><strong>280</strong><small>club points</small></div><div className="progress-line"><i style={{ width: "72%" }} /></div><p>You’re 70 points away from your next wellness reward.</p><div className="earned-badge"><span>✳</span><div><strong>Wellness regular</strong><small>Attended 10+ club events</small></div><b>✓</b></div></section></div> :
    <><div className="report-metrics"><StatCard icon="users" iconTone="blue" label="ACTIVE MEMBERS" value={members.length.toLocaleString()} note="Current directory" /><StatCard icon="calendar" iconTone="peach" label="CLUB EVENTS" value={availableEvents.length.toLocaleString()} note="Events on the calendar" /><StatCard icon="check" iconTone="green" label="CHECKED IN" value={members.filter((member) => member.status === "Checked in").length.toLocaleString()} note="Recorded attendance" /><StatCard icon="heart" iconTone="lilac" label="NOT CHECKED IN" value={members.filter((member) => member.status !== "Checked in").length.toLocaleString()} note="Current directory" /></div><section className="panel report-chart"><PanelHeading title={isAdmin ? "Attendance overview" : "Club engagement"} subtitle="Current attendance records and scheduled club events." action="Export report" onAction={() => onExportReport(members)} /><AttendanceChart /></section><section className="panel report-insights"><PanelHeading title="Event overview" subtitle="Scheduled events in the club calendar." /><div className="insight-list">{availableEvents.slice(0, 3).map((event) => <div key={event.title}><span className={`insight-icon ${event.color}`}>✳</span><span><strong>{event.title}</strong><small>{event.date} · {event.time} · {event.place}</small></span></div>)}</div></section></>}
  </div>;
}

function AttendanceScanner({ members, autoStart, onAutoStartHandled, onCheckIn, onNotice }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(0);
  const didAutoStartRef = useRef(false);
  const autoStartHandledRef = useRef(onAutoStartHandled);
  autoStartHandledRef.current = onAutoStartHandled;
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraRequesting, setCameraRequesting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [demoScanPending, setDemoScanPending] = useState(false);
  const scanCompletedRef = useRef(false);
  const [manualLookup, setManualLookup] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("Wellness Workshop");
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([
    { id: "23MIS0451", status: "Registered", time: "4:18 PM" },
    { id: "23MIS0417", status: "On-spot", time: "4:17 PM" },
  ]);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setCameraRequesting(false);
    setDemoScanPending(false);
  }, []);

  useEffect(() => () => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const stream = streamRef.current;
      videoRef.current.play().catch(() => {
        if (streamRef.current === stream && stream.getTracks().some((track) => track.readyState === "live")) {
          setCameraError("The camera preview could not start. Check your browser camera permissions and try again.");
        }
      });
    }
  }, [cameraActive]);

  const handleStudentId = useCallback((rawValue) => {
    scanCompletedRef.current = true;
    const scannedId = rawValue.trim();
    if (!scannedId) {
      setCameraError("The scanner returned an empty ID. Try again or use manual lookup.");
      return;
    }

    const normalizedId = scannedId.toLocaleUpperCase();
    const member = members.find((item) => item.id.toLocaleUpperCase() === normalizedId);
    const scannedAt = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setRecentScans((current) => [{ id: scannedId, status: member?.status === "Checked in" ? "Already recorded" : member ? "Present" : "Not found", time: scannedAt }, ...current].slice(0, 4));

    if (!member) {
      setScanResult({ kind: "not-found", id: scannedId });
    } else if (member.status === "Checked in") {
      setScanResult({ kind: "duplicate", member });
    } else {
      setScanResult({ kind: "success", member, time: scannedAt });
      onCheckIn(member.name);
    }
    stopCamera();
    setCameraError("");
    setManualLookup(false);
    setStudentId("");
  }, [members, onCheckIn, stopCamera]);

  useEffect(() => {
    if (!cameraActive) return undefined;
    scanCompletedRef.current = false;
    if (typeof window.BarcodeDetector !== "function") {
      setDemoScanPending(true);
      const demoTimer = window.setTimeout(() => {
        if (scanCompletedRef.current) return;
        const eligibleMember = members.find((member) => member.status !== "Checked in") || members[0];
        setDemoScanPending(false);
        if (eligibleMember) handleStudentId(eligibleMember.id);
        else setCameraError("No students are available to record attendance for this event.");
      }, 2000);
      return () => window.clearTimeout(demoTimer);
    }

    let cancelled = false;
    let timer;
    let detector;
    try {
      detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "code_39", "ean_13", "upc_a"] });
    } catch {
      setDemoScanPending(true);
      const demoTimer = window.setTimeout(() => {
        if (scanCompletedRef.current) return;
        const eligibleMember = members.find((member) => member.status !== "Checked in") || members[0];
        setDemoScanPending(false);
        if (eligibleMember) handleStudentId(eligibleMember.id);
        else setCameraError("No students are available to record attendance for this event.");
      }, 2000);
      return () => window.clearTimeout(demoTimer);
    }

    const scanFrame = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          const codes = await detector.detect(video);
          if (!cancelled && codes.length > 0 && codes[0].rawValue) {
            handleStudentId(codes[0].rawValue);
            return;
          }
        } catch {
          if (!cancelled) {
            setCameraError("The camera could not read this code. Hold the student ID steady inside the frame.");
          }
        }
      }
      if (!cancelled) timer = window.setTimeout(scanFrame, 350);
    };

    scanFrame();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cameraActive, handleStudentId, members]);

  const startCamera = useCallback(async () => {
    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;
    setCameraError("");
    setScanResult(null);
    setDemoScanPending(false);
    scanCompletedRef.current = false;
    setManualLookup(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(window.isSecureContext
        ? "Camera access is unavailable in this browser. Use manual lookup instead."
        : "Camera access requires HTTPS or localhost. Open this site securely, or use manual lookup.");
      return;
    }

    setCameraRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (cameraRequestRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      if (cameraRequestRef.current !== requestId) return;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Allow camera access in your browser settings, then try again.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setCameraError("No camera was found on this device. Connect a camera or use manual lookup.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setCameraError("The camera is busy in another app. Close it there and try again.");
      } else {
        setCameraError(`Could not start the camera: ${error.message || "check your browser permissions and try again."}`);
      }
    } finally {
      if (cameraRequestRef.current === requestId) setCameraRequesting(false);
    }
  }, []);

  useEffect(() => {
    if (!autoStart || didAutoStartRef.current) return undefined;
    let started = false;
    const timer = window.setTimeout(() => {
      started = true;
      didAutoStartRef.current = true;
      autoStartHandledRef.current();
      startCamera();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      if (!started) didAutoStartRef.current = false;
    };
  }, [autoStart, startCamera]);

  const handleManualLookup = (event) => {
    event.preventDefault();
    handleStudentId(studentId);
  };

  return (
    <div className="attendance-layout">
      <section className="panel scanner-section">
        <PanelHeading title="Scan Attendance" subtitle="Select an event before scanning." />
        <label className="active-event-field">Active event
          <select value={selectedEvent} onChange={(event) => setSelectedEvent(event.target.value)}>
            <option>Wellness Workshop</option>
            <option>Sunrise Yoga Flow</option>
            <option>Campus 5K Run</option>
          </select>
        </label>
        {scanResult ? (
          <div className={`scan-outcome ${scanResult.kind}`} role="status">
            <div className="outcome-symbol">{scanResult.kind === "success" ? "✓" : scanResult.kind === "duplicate" ? "!" : "?"}</div>
            <h2>{scanResult.kind === "success" ? "Attendance recorded" : scanResult.kind === "duplicate" ? "Already recorded" : "Student not found"}</h2>
            <p>{scanResult.kind === "not-found" ? `No member found for ID ${scanResult.id}. Check the ID and try again.` : `${scanResult.member.name} · ${scanResult.member.id} · ${scanResult.member.status === "Checked in" ? "Registered" : "Present"}`}</p>
            {scanResult.kind === "duplicate" && <span className="recorded-time">No duplicate attendance created</span>}
            {scanResult.kind === "success" && <span className="recorded-time">{scanResult.time} · {selectedEvent}</span>}
            <button className="primary-button full-button" onClick={startCamera}>{scanResult.kind === "success" ? "Scan Next Student" : "Return to Scanner"}</button>
            {scanResult.kind === "duplicate" && <button className="soft-button full-button" onClick={() => setScanResult(null)}>Open Attendance List</button>}
          </div>
        ) : (
          <div className={`large-scanner ${cameraActive ? "camera-active" : ""}`}>
            {cameraActive ? <>
              <video ref={videoRef} autoPlay playsInline muted aria-label="Live student ID camera" />
              <div className="camera-scan-frame"><span /><span /><span /><span /><i /></div>
              <span className="camera-label"><i />{demoScanPending ? "DEMO SCAN · ATTENDANCE IN 2 SECONDS" : "CAMERA LIVE · HOLD ID IN FRAME"}</span>
            </> : <>
              <div className="scanner-placeholder-copy"><strong>SCAN</strong><small>Align QR / barcode inside frame</small></div>
              <div className="camera-frame-corners"><i /><i /><i /><i /></div>
            </>}
          </div>
        )}
        {cameraError && <div className="camera-message" role="status"><strong>{cameraActive ? "Scanner notice" : "Camera unavailable"}</strong><span>{cameraError}</span></div>}
        {demoScanPending && <p className="demo-scan-note" role="status">Live barcode reading is unavailable here. Recording the next eligible sample student as a demo in 2 seconds.</p>}
        {!scanResult && <div className="scanner-actions">
          <button className={`primary-button ${cameraActive ? "stop-camera-button" : ""}`} disabled={cameraRequesting} onClick={cameraActive ? stopCamera : startCamera}>{cameraRequesting ? "Opening camera..." : cameraActive ? "Stop camera" : "Scan Student ID"} <Icon name={cameraActive ? "check" : "arrow"} size={16} /></button>
          <button className="soft-button" onClick={() => { stopCamera(); setCameraError(""); setManualLookup((open) => !open); setScanResult(null); }}>{manualLookup ? "Close lookup" : "Manual lookup"}</button>
        </div>}
        {manualLookup && !scanResult && <form className="manual-lookup-form" onSubmit={handleManualLookup}><label htmlFor="manual-student-id">Student ID</label><div><input id="manual-student-id" autoFocus value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="e.g. 23MIS0451" /><button className="primary-button" type="submit">Find student</button></div></form>}
        {!scanResult && <><div className="recent-scans"><h3>Recent scans</h3>{recentScans.slice(0, 2).map((scan, index) => <div key={`${scan.id}-${scan.time}`}><span>{scan.id} · {scan.status}</span><time>{scan.time}</time></div>)}</div><div className="sync-note"><span className="live-indicator" />Attendance sync: Connected</div></>}
      </section>
      <section className="panel attendance-live-section">
        <PanelHeading title="Live counts" subtitle={`${selectedEvent} · Today, 4:00 PM`} action="Open attendance list" onAction={() => onNotice("Showing the current attendance list.")} />
        <div className="large-counts"><div><strong>70</strong><span>Registered</span></div><div><strong>{members.filter((member) => member.status === "Checked in").length + 56}</strong><span>Checked in</span></div><div><strong>12</strong><span>Remaining</span></div></div>
        <h3 className="subsection-title">Recent scans</h3>
        <MemberTable members={members} onCheckIn={onCheckIn} />
      </section>
    </div>
  );
}

function BoardProfile({ onNotice }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Praveen Kumar V");
  const [email, setEmail] = useState("praveen.kumar.v@vit.ac.in");
  const [phone, setPhone] = useState("+91 98765 43210");

  const saveProfile = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      onNotice("Name and campus email are required to save your profile.");
      return;
    }
    setEditing(false);
    onNotice("Your board member profile has been updated.");
  };

  return (
    <div className="board-profile-layout">
      <section className="panel board-profile-card">
        <div className="board-profile-cover"><span className="profile-large-avatar board-avatar">PKV</span><span className="profile-status"><i /> Active board member</span></div>
        <div className="board-profile-body">
          <div className="board-profile-heading"><div><span className="eyebrow">STUDENT LEADERSHIP</span><h2>{name}</h2><p>Health Club Board · VIT University</p></div><button className="soft-button" onClick={() => setEditing((current) => !current)}>{editing ? "Cancel" : "Edit profile"}</button></div>
          {editing ? <form className="board-profile-form" onSubmit={saveProfile}><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Campus email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label><button className="primary-button" type="submit">Save changes <Icon name="arrow" size={15} /></button></form> : <div className="board-profile-details"><ProfileDetail label="Campus email" value={email} /><ProfileDetail label="Phone" value={phone} /><ProfileDetail label="Board role" value="Wellness & Events Lead" /><ProfileDetail label="Committee" value="Events and Member Experience" /><ProfileDetail label="Term" value="August 2025 – May 2026" /><ProfileDetail label="Member ID" value="BM-2025-014" /></div>}
        </div>
      </section>
      <div className="board-profile-side">
        <section className="panel board-access-card"><PanelHeading title="Your board access" subtitle="Tools available to your role." /><div className="board-access-list"><div><span className="access-icon blue"><Icon name="calendar" size={16} /></span><span><strong>Event planning</strong><small>Review and coordinate club events</small></span><b>Enabled</b></div><div><span className="access-icon peach"><Icon name="check" size={16} /></span><span><strong>Proposal approvals</strong><small>Review requests from club members</small></span><b>Enabled</b></div><div><span className="access-icon mint"><Icon name="chart" size={16} /></span><span><strong>Club reports</strong><small>View engagement and attendance trends</small></span><b>Enabled</b></div></div></section>
        <section className="panel board-profile-help"><span className="help-icon"><Icon name="heart" size={18} /></span><div><strong>Need to update your board role?</strong><p>Contact the Health Club administrator for committee or access changes.</p><button className="text-arrow" onClick={() => onNotice("Contact the Health Club administrator at wellness@vit.ac.in.")}>Contact administrator <Icon name="arrow" size={15} /></button></div></section>
      </div>
    </div>
  );
}

function ProfileDetail({ label, value }) {
  return <div className="profile-detail-row"><span>{label}</span><strong>{value}</strong></div>;
}

function EventCard({ event, registered, actionLabel, onOpen, onRegister }) {
  return <article className="event-card panel"><button className={`event-card-art ${event.color}`} onClick={onOpen} aria-label={`View ${event.title}`}><span className="event-card-sun" /><span className="event-card-plant"><i /><b /><em /></span><strong>{event.initials}</strong><span className="event-card-time">{event.time}</span></button><div className="event-card-body"><span className="event-category">{event.category}</span><button className="event-card-title" onClick={onOpen}>{event.title}</button><div className="event-card-meta"><span><Icon name="calendar" size={14} />{event.date}</span><span><Icon name="pin" size={14} />{event.place}</span></div><div className="event-card-footer"><span><span className="attendee-avatars"><i>AS</i><i>MK</i><i>+</i></span>24 going</span><button className={`event-action ${registered ? "is-registered" : ""}`} onClick={onRegister}>{actionLabel || (registered ? "Going ✓" : "Join event")}</button></div></div></article>;
}

function ApprovalCard({ item, onNotice }) {
  const [status, setStatus] = useState("");
  return <article className="panel approval-card"><div className="approval-card-head"><span className={`approval-avatar large ${item.color}`}>{item.initials}</span><div><span className="eyebrow">PENDING REVIEW</span><h2>{item.title}</h2><p>{item.subtitle}</p></div><span className="pending-pill">Needs review</span></div><div className="approval-card-detail"><Icon name="calendar" size={17} />{item.detail}</div><div className="approval-card-footer">{status ? <span className="approval-result">✓ {status}</span> : <><button className="soft-button" onClick={() => { setStatus("Sent back for edits"); onNotice(`${item.title} sent back for edits.`); }}>Request changes</button><button className="primary-button" onClick={() => { setStatus("Approved"); onNotice(`${item.title} approved.`); }}>Approve request <Icon name="arrow" size={15} /></button></>}</div></article>;
}

function featuredEventForPage(list) {
  return list[0];
}

function exportAttendanceReport(members) {
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Member", "Student ID", "Attendance status"],
    ...members.map((member) => [member.name, member.id, member.status]),
  ];
  const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "smart-health-club-attendance.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Modal({ eventName, role, events: availableEvents, onClose, onRegister, onNotice, onSaveEvent, onUpdateEvent, onAddMember }) {
  const isNewEvent = eventName === "new-event";
  const isNewMember = eventName === "new-member";
  const isManageEvent = eventName.startsWith("manage-event:");
  const managedTitle = isManageEvent ? eventName.slice("manage-event:".length) : "";
  const event = availableEvents.find((item) => item.title === managedTitle) || availableEvents.find((item) => item.title === eventName) || availableEvents[0] || events[0];
  const defaultEventTime = isManageEvent ? new Date(`2000-01-01 ${event.time}`).toTimeString().slice(0, 5) : "";
  const [title, setTitle] = useState(isManageEvent ? event.title : "");
  const [memberName, setMemberName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [eventDate, setEventDate] = useState(isManageEvent ? event.dateValue || "" : "");
  const [eventTime, setEventTime] = useState(defaultEventTime);
  const [eventPlace, setEventPlace] = useState(isManageEvent ? event.place : "");
  const [eventCategory, setEventCategory] = useState(isManageEvent ? event.category[0] + event.category.slice(1).toLowerCase() : "Wellness");
  const handleSave = (eventSubmit) => {
    eventSubmit.preventDefault();
    if (!title.trim()) {
      onNotice("Add an event name before saving.");
      return;
    }
    const date = eventDate ? new Date(`${eventDate}T00:00`) : null;
    const formattedDate = date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase() : event.date;
    const eventData = { title: title.trim(), category: eventCategory.toUpperCase(), date: formattedDate, dateValue: eventDate || event.dateValue || "", time: eventTime ? new Date(`2000-01-01T${eventTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : event.time, place: eventPlace.trim() || event.place };
    if (isManageEvent) onUpdateEvent(event.title, eventData);
    else onSaveEvent(eventData);
  };
  const handleAddMember = (eventSubmit) => {
    eventSubmit.preventDefault();
    onAddMember({ name: memberName.trim(), id: studentId.trim() });
  };
  return <div className="modal-backdrop" onMouseDown={(eventDown) => { if (eventDown.target === eventDown.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}>×</button>{isNewEvent || isManageEvent ? <><span className="eyebrow">{isManageEvent ? "KEEP YOUR CLUB DETAILS UP TO DATE" : "MAKE SOMETHING GOOD HAPPEN"}</span><h2 id="modal-title">{isManageEvent ? "Manage club event" : "Create a club event"}</h2><p className="modal-subtitle">{isManageEvent ? "Update the details shown to your club members." : "Add the event details to publish it in the club calendar."}</p><form className="create-event-form" onSubmit={handleSave}><label>Event name<input autoFocus required value={title} onChange={(eventInput) => setTitle(eventInput.target.value)} placeholder="e.g. Community morning walk" /></label><div className="form-split"><label>Event date<input type="date" required={!isManageEvent} value={eventDate} onChange={(eventInput) => setEventDate(eventInput.target.value)} /></label><label>Start time<input type="time" required={!isManageEvent} value={eventTime} onChange={(eventInput) => setEventTime(eventInput.target.value)} /></label></div><label>Location<input required value={eventPlace} onChange={(eventInput) => setEventPlace(eventInput.target.value)} placeholder="Choose a campus location" /></label><label>Event category<select value={eventCategory} onChange={(eventInput) => setEventCategory(eventInput.target.value)}><option>Wellness</option><option>Fitness</option><option>Mindfulness</option><option>Community</option></select></label><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{isManageEvent ? "Save changes" : "Publish event"}<Icon name="arrow" size={15} /></button></div></form></> : isNewMember ? <><span className="eyebrow">GROW YOUR COMMUNITY</span><h2 id="modal-title">Invite a member</h2><p className="modal-subtitle">Add a student to the club directory.</p><form className="create-event-form" onSubmit={handleAddMember}><label>Student name<input autoFocus required value={memberName} onChange={(eventInput) => setMemberName(eventInput.target.value)} placeholder="Full name" /></label><label>Student ID<input required value={studentId} onChange={(eventInput) => setStudentId(eventInput.target.value)} placeholder="e.g. 23MIS0451" /></label><div className="modal-actions"><button className="soft-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Add member<Icon name="arrow" size={15} /></button></div></form></> : <><div className={`modal-event-art ${event.color}`}><span>{event.initials}</span><i>✳</i></div><span className="event-category">{event.category} · {role === "Student" ? "OPEN TO ALL MEMBERS" : "CLUB EVENT"}</span><h2 id="modal-title">{event.title}</h2><p className="modal-subtitle">A welcoming session for all levels. Come as you are and enjoy a little time to move, reset and connect with your campus community.</p><div className="modal-event-details"><span><Icon name="calendar" size={17} /><b>{event.date}</b></span><span><Icon name="clock" size={17} /><b>{event.time}</b></span><span><Icon name="pin" size={17} /><b>{event.place}</b></span></div><div className="modal-capacity"><span><i /> 24 people are going</span><span>18 spots left</span></div><div className="modal-actions"><button className="soft-button" onClick={onClose}>Maybe later</button><button className="primary-button" onClick={() => role === "Student" ? onRegister(event.title) : (onNotice(`Opening event management for ${event.title}.`), onClose())}>{role === "Student" ? "Save my spot" : "Manage event"}<Icon name="arrow" size={15} /></button></div></>}</div></div>;
}

export default App;
