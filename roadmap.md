# VIT Health Club roadmap (from brief in chat)

## Updated scope: three uploaded role briefs
- [ ] Enlarge the existing website's screens, text, and controls; provide distinct Student, Board Member, and Faculty/Admin entry points without self-assigned roles.
- [ ] Implement all three role briefs as connected workspaces sharing Firebase records and controlled review workflows.
- [ ] Verify cross-role journeys: event proposal to registration and attendance; report submission to correction and faculty decision; request escalation and outcome; verified enrollment and authorized certificates.

- [x] Phase 1: Import existing UI (Student, Board, Faculty) unchanged in look
- [x] Phase 2a: Firebase init, real email/password login, sign-up (student only), password reset
- [x] Phase 2b: Role comes from Firestore profile, no role picker; base firestore.rules
- [ ] Deploy firestore.rules + enable Email/Password auth in Firebase console (user action)
- [ ] Phase 2c: Remove demo attendance auto-scan; real QR scanner
- [ ] Phase 3: Move events, members, requests, faculty data to Firestore with live updates
- [ ] Phase 4: Event approval, registration, waitlist, check-in, OD
- [ ] Phase 5: EXC reports, uploads, corrections, permissions, certificates, notifications
- [ ] Phase 6: Faculty tools (finance, inventory, meetings, MoUs, announcements, audit) on Firestore
- [ ] Phase 7: Board/faculty directory, live lectures, Q&A, recordings
- [ ] Phase 8: Polish, responsiveness, tests, Cloud Functions + deploy docs
