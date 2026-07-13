# Leaderboard backend setup

The leaderboard is an optional Firebase feature. It is disabled until the user
explicitly enables leaderboard participation in the app's privacy settings.
Anonymous authentication identifies a participant; Firestore stores only the
public leaderboard profile and score aggregates described below.

## 1. Create and configure Firebase

1. Create a Firebase project and register the web application.
2. In **Authentication > Sign-in method**, enable **Anonymous** authentication.
3. Create Firestore in **production mode** in an appropriate region.
4. Copy `.env.example` to `.env` and provide the `VITE_FIREBASE_*` values.
5. For production, configure and enforce Firebase App Check for each shipped
   platform. App Check reduces scripted abuse; it does not prove a score is
   legitimate.

Do not commit `.env`, `google-services.json`, or `GoogleService-Info.plist`.
The web Firebase API key is an application identifier, not authorization.
Authorization and validation are enforced by `firestore.rules`.

## 2. Deploy the checked-in backend contract

Install and authenticate the Firebase CLI, select the intended project, then
deploy the repository-owned configuration:

```bash
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

The deployment inputs are:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`

No composite indexes are currently required. The three queries order a single
collection by `score` or `totalScore`, which Firestore's automatic single-field
indexes support.

Never paste an older rules example from documentation into the console. The
checked-in rules are the source of truth and are intentionally deployed from
the CLI so the backend remains reproducible.

## 3. Data model

| Path | Purpose | Public read | Client write |
| --- | --- | --- | --- |
| `users/{uid}` | All-time public profile | Yes | Owning authenticated UID only |
| `leaderboards/daily/{YYYY-MM-DD}/{uid}` | Local-calendar daily aggregate | Yes | Owning UID, validated transaction only |
| `leaderboards/weekly/{ISO-year-Www}/{uid}` | Local ISO-week aggregate | Yes | Owning UID, validated transaction only |
| `users/{uid}/events/{eventId}` | Immutable idempotency record | Owner `get` only | Owner create once; no update/delete/list |

The public fields include the chosen display name (or a temporary generated name for existing users), score, quiz counts,
level, activity points, accuracy summary, and timestamps. Do not add email,
coordinates, device identifiers, or other private data to these documents.

Every score submission is one Firestore transaction. It:

1. checks `users/{uid}/events/{eventId}`;
2. reads the user, daily, and weekly aggregates;
3. creates the immutable event;
4. updates all three aggregates with the same `lastEventId`.

If the event already exists, the transaction is a successful no-op. Rules use
`exists()` and `existsAfter()` to require a newly-created event in the same
atomic request and validate the exact numeric deltas. Replaying an old event or
updating just one aggregate is rejected.

Periods intentionally use the user's local calendar at the time the event is
created. An event queued offline retains those bucket IDs when it later syncs,
so travel or a midnight transition cannot move the activity into another day.

## 4. Validate before production

Run the repository tests and builds:

```bash
yarn test:all
yarn build:web
```

For a Firebase project used only for testing, exercise these cases after rules
deployment:

1. enable leaderboard consent and create an anonymous profile;
2. submit one quiz and verify all four documents commit;
3. retry the same event ID and verify totals do not change;
4. submit an activity and verify quiz counters do not change;
5. change the username and verify the current daily/weekly rows update;
6. attempt a write while signed out or to another UID and verify permission is
   denied;
7. go offline, submit once, reconnect, and verify the outbox drains once;
8. verify ISO week-year boundaries such as 2023-01-01 (`2022-W52`).

Use a separate Firebase project or the Firestore emulator for destructive and
adversarial testing. Do not test malformed writes against production data.

## Security boundary

The rules enforce authentication, ownership, immutable idempotency events,
atomic aggregate consistency, field allowlists, type/range checks, and bounded
per-event increments. They cannot prove that a client really answered a quiz.
A modified client can still create multiple new, structurally valid events.

For prizes, public competitions, or stronger anti-cheat guarantees, move quiz
generation and score acceptance to a trusted Cloud Function or server. The
server should verify answers, rate-limit accounts/devices, create the event and
aggregates using the Admin SDK, and deny aggregate writes from clients. App
Check should complement that design, not replace it.

## Troubleshooting

- **`permission-denied` on every write:** confirm anonymous authentication is
  enabled and deploy the checked-in rules to the same project used by `.env`.
- **A submission stays queued:** inspect the structured error shown by the app;
  confirm the event fields fit the deployed rules and network access is back.
- **A leaderboard query needs an index:** follow the Firestore error's generated
  link, add the resulting definition to `firestore.indexes.json`, deploy it,
  and keep the file in version control.
- **Empty state after an error:** use the app's retry action. Network/rules
  errors are deliberately distinct from a valid empty leaderboard.
- **Identity changed:** leaderboard opt-out must not delete or sign out the
  Firebase anonymous identity. Clearing application data can still create a
  new anonymous account unless that account was linked to a durable sign-in.
