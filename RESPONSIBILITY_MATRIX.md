# VIT Health Club responsibility matrix

Status terms: **Live-tested** = real Firebase project; **Emulator-tested** = isolated local Firebase; **Setup pending** = built but not proven against the real project; **Not implemented**.

| Role | Responsibility | Page/route | Backend operation | Permission enforcement | Connected outcome | Test result | Remaining dependency |
|---|---|---|---|---|---|---|---|
| All | Three logins and concurrent sessions | / sign-in | Firebase Auth + users profile | Firestore role/status only | Correct workspace opens | Emulator-tested (3 browser sessions) | Enable Email/Password in real project; provision Faculty |
| Student | Participation / IV application | / Applications | applications + versions | Student owns; one application per event | Board inbox + notification | Emulator-tested | Deploy rules |
| Board | Preliminary review | / Applications | decision transaction | Current appointment + event assignment | Faculty sees for final decision | Emulator-tested | Real appointment data |
| Faculty | Final approval, rejection, correction request | / Applications | atomic decision + registration | Faculty only; preliminary step required; remarks required | Approved participation becomes registration within capacity | Emulator-tested | Deploy rules |
| Student | Correction and resubmission | / Applications | new immutable version | Owner only, only after correction request | Returns to Board review | Emulator-tested | Deploy rules |
| Faculty | Attendance correction approval | / Applications | atomic decision + attendance amendment | Faculty only; registered student required | Attendance changes with before/after history | Emulator-tested (rules) | Browser demo not yet run |
| Faculty | OD club approval vs institutional confirmation | / Applications | separate confirmation decision | Faculty only, requires reference | Two separate statuses | Emulator-tested (rules) | Institutional OD authority |
| Board | Sponsor proposal | / Applications | application workflow | Assigned Board only | Faculty decision | Setup pending | Confirmed sponsor policy |
| Student | Sponsorship-support request | / Applications | application + fulfillment confirmation | Faculty decision; separate fulfillment | Approval ≠ fulfillment | Unit-tested | Real fulfillment process |
| Student / Faculty | EXC report review | / Reports | versions + decisions | Board preliminary, Faculty final | Corrections/resubmission | Setup pending | EXC thresholds and progress rules |
| Faculty / Student | Certificate authorization and download | / Certificates | certificate record + PDF download | Faculty only, verified present attendance | Downloadable club participation record | Setup pending | Official signatory/format |
| All | Notifications with links | / Notifications | notification records | Recipient only | Opens the application | Emulator-tested (rules) | — |
| Admin | Account administration | / Students | user updates | Cannot self-edit, promote, or change enrollment | No academic authority | Emulator-tested | Faculty bootstrap process |

## Not implemented yet
Waitlist/cancellation, calendar, QR camera scanning, attendance finalization screens, volunteer tasks/hours, roster import, EXC requirement configuration and cohort progress, year-end decisions, exports/archives, MoUs/regulations, accessibility preferences and voice navigation, event-scoped messaging, completion reports, certificate correction/revocation.

## Demonstration sequence
1. Sign in as Student, Board, Faculty in three browsers.
2. Student applies to an approval-mode IV → Board preliminary check → Faculty requests correction → Student resubmits → Board checks → Faculty approves → Events shows the seat filled.
3. Attendance correction, OD confirmation, sponsorship proposal/support, EXC report review, and certificate download use the same Applications/Reports/Certificates screens after real Firebase setup.