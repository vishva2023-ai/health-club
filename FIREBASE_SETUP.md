# Activate connected club records

The application uses the existing Firebase project `health-club-ef145`.

1. In Firebase Console, enable Authentication → Email/Password.
2. Create Firestore if necessary. Publish the project's `firestore.rules` in Firestore → Rules.
3. Enable Storage and publish `storage.rules` in Storage → Rules. Confirm your institution's permitted evidence types and sizes before production use; no arbitrary official limits have been invented.
4. Register a real account through the application, then use a trusted Firebase Console administrator to set that account's `users/{uid}` document to `role: faculty`, `status: active`. Do not expose this provisioning as a public sign-up choice.
5. Faculty signs in and uses Students to verify official enrollment and appoint Board Members. Initial self-sign-ups have no verified enrollment.
6. Use three real test accounts to check: Board submits proposal, Faculty approves, Board publishes, verified Student registers, Board records attendance, Student submits EXC report, Faculty requests corrections and reviews resubmission.

## Current delivery boundaries

Shared Firebase screens are implemented for events, registrations, organizer attendance verification, reports/evidence, review decisions, student requests, official enrollment/roles, certificates, and club announcements. Sample dashboards are no longer used as the signed-in experience.

The rules are source files; editing them here does not deploy them to Firebase. Firebase console settings, deployed rules, successful authentication, storage availability, and real-account cross-role flows remain unverified until project access/setup is available. Test rules against the Firebase emulator and run the three-account journey before production.

Waitlists/cancellation, camera QR scanning in the connected attendance screen, report draft saving, history viewing, calendar, scoped faculty delegations, appointment periods, tasks/volunteers, notifications, year-end requirements/completion, exports/certificate PDF formats, MoUs and archives are not complete. Do not interpret request approval as an attendance amendment or institutional OD approval.

Institutional rules are still needed for EXC thresholds, assessment, volunteer hours, OD authority, certificate eligibility and format, evidence file restrictions, and retention. No direct VTOP integration is assumed.