<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Backend is the user's own Firebase project (health-club-ef145), not Lovable Cloud — the user explicitly required Firebase.
- Firebase web config is served by a server function from secrets GOOGLE_API_KEY / GOOGLE_ANALYTICS_MEASUREMENT_ID; init is a browser-only singleton in src/lib/firebase.js.
- The original app lives in src/legacy and renders client-only at "/" — preserve its design; enhance in place rather than rebuilding.
- User roles come only from Firestore users/{uid}.role; never let the UI pick a role. Security rules in firestore.rules.
- ConnectedWorkspace is the live signed-in workspace; legacy prototype dashboards remain reference-only so sample data never masquerades as saved records.
- Browser-safe clubPolicy holds testable workflow checks; clubService persists shared records, while Firestore rules independently enforce authority and atomic registration counters.
- Applications use a shared versioned collection with atomic decisions and related outcomes; keep Faculty-only final decisions separate from Board preliminary checks, institutional confirmations, and fulfillment.
- Application evidence uses authenticated Storage blob reads scoped through its parent application rather than public download-token links, so assigned review authority remains enforceable.
- Firebase emulator configuration and conditional permission tests live in the project; use the demo project ID for isolated rule checks without touching production data.
- Local browser emulator testing is opt-in through firebaseEmulator=1 on localhost in development only; never connect published sessions to emulators.
- Student attendance summaries use only recorded present/absent sessions; event-category filters live in attendancePolicy. Organizer changes require atomic immutable history, while Board self-reports use a separate boardAttendance collection to avoid granting student or academic attendance.
