# One connected VIT Health Club website

## Result
Expand the existing website to match your three uploaded role documents. Student, Board Member, and Faculty/Admin will have distinct workspaces in the same website, with changes flowing between the appropriate people rather than separate sample dashboards.

## 1. Larger screens and clear access
- Keep your existing design, but enlarge text, controls, forms, and usable workspace area.
- Provide clearly labelled Student, Board Member, and Faculty/Admin sign-in entry points. The account's assigned permissions—not the chosen entry point—determine access.
- Support verified Junior Core and EXC information on the same student account, including personal student access for Board Members.
- Show pending verification, ended appointments, unavailable access, and session-expired states.

## 2. Shared membership and permissions
- Faculty manages official roster verification, Junior Core membership, EXC enrollment, Board appointments, assignments, and academic years.
- Restrict Board work to assigned events and delegated duties; keep final academic decisions with authorized faculty.
- Students view their own verified records and submit mismatch requests rather than editing official enrollment.

## 3. Connected event journey
Board creates a draft → submits to Faculty → receives approval or requested changes → authorized publication → eligible Students register → Board manages participants, volunteers, and tasks → Board records attendance → Faculty reviews required finalization → Students see their participation records.

- Include event search, details, calendars, registration deadlines, capacity, permitted waitlists, cancellation, and approved event changes.
- Replace automatic sample attendance with real organizer scanning/verification, duplicate checks, controlled corrections, and clear save/failure feedback.
- Keep registration, attendance, verified hours, and OD separate.

## 4. Connected reports and requests
Student saves a report draft and evidence → submits → Board performs delegated preliminary checks → Faculty reviews → Student receives corrections and resubmits → Faculty records the decision with version history.

- Add EXC requirements, activity records, progress, deadlines, year-end review, and record exports.
- Route attendance corrections, permissions, membership issues, and activity suggestions to the proper reviewer, with remarks and escalation.
- Do not label exports or report approval as official academic completion.

## 5. Records, communication, and oversight
- Connect certificate preparation and authorized issuance, volunteer records, post-event documentation, and downloadable records.
- Add targeted announcements and notifications that open the affected record.
- Include profiles, accessibility preferences, approved guidelines, documents, MoU summaries/management, archives, and audit history according to role permissions.
- Provide useful empty, loading, upload failure, offline, permission, and conflicting-review states; never show a failed save as successful.

## Implementation and verification
- Build incrementally in the order above, starting with readable screens and shared membership/events; track unfinished items explicitly.
- Test each authority boundary and real cross-role handoff, including persistence after refresh and denied unauthorized actions.
- Retain the current Firebase project and enhance the existing app in place. Shared Firestore records, subscriptions, transactions, storage permissions, and security rules enforce the workflows; interface controls alone are not security.
- Separate browser-safe workflow and permission logic from Firebase access so important rules can be tested independently.

## Requirements and external setup
- Firebase Authentication must be enabled and the updated Firestore/Storage rules deployed before real-account workflows can be verified. The previously reported authentication error means successful sign-in is not yet confirmed.
- A first authorized Faculty account must be provisioned through a trusted administrative process; there will be no self-assigned faculty access or insecure dummy passwords.
- Course thresholds, grading, hours calculations, OD authority, file restrictions, and official certificate formats must use confirmed club/VIT policy. Until supplied, affected settings remain unconfigured rather than invented.
- Use approved roster imports/manual entry; do not promise a direct VTOP connection. Institutional OD approval, academic-system handoff, and legally signed MoUs remain subject to the institution's actual process.