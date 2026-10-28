# VIT Health Club roadmap (from brief in chat)

## Updated scope: three uploaded role briefs
- [x] Add eleven individual board photos and categorized Student/Board attendance, audited organizer updates, and Board self-attendance; three local logins verified, 21 emulator permission tests passed. GitHub sync status remains user-controlled.
- [ ] Publish updated attendance rules in Firebase Console — requires project-owner access; GitHub push/sync cannot be verified from chat.
- [ ] Extended responsibilities received 28 October: complete all role responsibilities; retain the full responsibility matrix and demonstration sequence without dropping unfinished scope.
- [x] Critical foundation: participation/IV applications, ordered preliminary→Faculty decisions, correction/resubmission, attendance amendments, separate OD confirmation, sponsorship proposals/support, notifications, and participation-record downloads. See RESPONSIBILITY_MATRIX.md for individual verification levels.
- [x] Appointment-based Board permissions and separation of Admin from academic authority; local permission tests pass.
- [x] Enlarge the existing website's screens, text, and controls; provide distinct Student, Board Member, and Faculty/Admin entry points without self-assigned roles.
- [ ] Implement all three role briefs as connected workspaces sharing Firebase records and controlled review workflows.
- [ ] Verify cross-role journeys: event proposal to registration and attendance; report submission to correction and faculty decision; request escalation and outcome; verified enrollment and authorized certificates.

### Delivered foundation
- [x] Shared live screens and services for event proposal/revision/decision/publication, transactional registration, organizer attendance verification, report drafts/evidence/submission/resubmission/version history, request review, student access verification, certificates and announcements.
- [x] Role/enrollment/capacity/attendance unit tests and desktop/small-screen login checks.
- [x] Firestore and Storage rule sources plus Firebase setup instructions.

### Blockers and remaining scope
- [ ] Firebase Authentication enabled, rules deployed, and authorized faculty/test accounts available — requires Firebase project owner setup; authenticated cross-role persistence and rule enforcement cannot yet be verified.
- [ ] Official EXC requirements, assessment, OD authority, certificate formats, evidence restrictions and retention — requires club/VIT policy.
- [ ] Remaining operational modules: waitlist/cancellation, connected QR camera scan, calendar, assignments/delegations and handover, volunteers/tasks, EXC/cohort progress, year-end decisions/exports, official certificate lifecycle, MoUs/archives, voice/accessibility preferences, roster import, post-event documentation and event-scoped messaging — not implemented. These remain open implementation work, not claimed blocked by Firebase.
- [x] Three concurrent isolated Firebase browser sessions verified application → preliminary review → correction → resubmission → final approval → registered seat visible after refresh. 36 tests pass, including 14 emulator permission/outcome checks.

- [x] Phase 1: Import existing UI (Student, Board, Faculty) unchanged in look
- [x] Phase 2a: Firebase init, real email/password login, sign-up (student only), password reset
- [x] Phase 2b: Role comes from Firestore profile, no role picker; base firestore.rules
- [ ] Deploy firestore.rules + enable Email/Password auth in Firebase console (user action)
- [ ] Phase 2c: Demo auto-scan removed; connected real QR scanner still pending
- [ ] Phase 3: Move events, members, requests, faculty data to Firestore with live updates
- [ ] Phase 4: Event approval, registration, waitlist, check-in, OD
- [ ] Phase 5: EXC reports, uploads, corrections, permissions, certificates, notifications
- [ ] Phase 6: Faculty tools (finance, inventory, meetings, MoUs, announcements, audit) on Firestore
- [ ] Phase 7: Board/faculty directory, live lectures, Q&A, recordings
- [ ] Phase 8: Polish, responsiveness, tests, Cloud Functions + deploy docs
