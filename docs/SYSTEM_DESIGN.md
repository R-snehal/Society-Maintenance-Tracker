# System Design Write-up

## Complaint History Model

Rather than storing status as a single mutable field with no memory of past
states, the system separates "current state" from "history of state changes."

`complaints.status` holds the current status for fast reads (list views,
filters). Every time status changes - including the very first insert, which
writes `Open` - a new row is inserted into `complaint_history` with
`complaint_id`, `status`, `actor_id`, an optional `note`, and a
server-generated `created_at` timestamp. This table is append-only: rows are
never updated or deleted.

This gives two benefits. First, a full audit trail is always available per
complaint (who changed what, when, and why) without any extra bookkeeping -
the resident-facing "view history" feature is just a `SELECT ... ORDER BY
created_at ASC` on this table. Second, the current-status column and the
history table can never drift out of sync because both are written inside a
single database transaction (`BEGIN`/`COMMIT`) in the status-update endpoint:
if the history insert fails, the status update is rolled back.

When a complaint is marked `Resolved`, `resolved_at` is stamped on the
`complaints` row in the same transaction, which is what "closes" it - no
further status transitions are exposed in the admin UI once resolved.

## Overdue Detection

Overdue is a *derived* property, not a stored column. A complaint is overdue
if `status != 'Resolved' AND created_at < now() - threshold_days`. The
threshold is read from `OVERDUE_THRESHOLD_DAYS` in the environment, so it can
be changed without a migration or a code deploy - just an env var update and
restart.

Computing this on read (rather than running a cron job that periodically
flags rows) keeps the system simpler and avoids a class of bugs where a
stored `is_overdue` flag becomes stale between cron runs. The cost is a small
amount of per-request computation, which is negligible at the scale of a
single apartment society's complaint volume. The admin complaint list applies
this computation to every row after fetching, then sorts overdue complaints
to the top client-side-adjacent (in the API layer, before the response is
sent), so the admin UI never has to reason about the threshold itself.

## Photo Handling

Complaint photos are uploaded directly from the browser to Cloudinary using
an *unsigned* upload preset, bypassing the application backend entirely. The
browser calls Cloudinary's REST API with the file and a preset name;
Cloudinary returns a `secure_url`, which is what gets sent to
`POST /api/complaints` as `photoUrl`.

This design was chosen for two reasons specific to the deployment target.
First, the app is deployed on Vercel, which runs API routes as stateless
serverless functions with no persistent local disk - so photos can't be
saved to a local `uploads/` folder the way a traditional server could.
Second, routing large file uploads through the Next.js API layer would add
complexity (multipart parsing, size limits, temporary storage) for no real
benefit when Cloudinary can accept the upload directly and host the file on
a CDN. The tradeoff is that the Cloudinary cloud name and upload preset are
exposed to the client (they're meant to be, for unsigned uploads) - actual
write access is still gated by the preset's configured constraints on
Cloudinary's side (file size, format, folder).

## Notification Flow

Two events trigger email: a complaint's status changing, and a new notice
being marked important.

Both go through a single `sendEmail(to, subject, html)` helper that calls the
SendGrid REST API directly via `fetch` - no SDK dependency, which keeps the
project's dependency footprint minimal as required by the submission
guidelines. Emails are sent *after* the triggering database transaction
commits, and are deliberately "fire and forget": a failed email send is
logged but never causes the triggering API request (a status update, a
notice post) to fail or roll back. This was a deliberate choice - a resident
should never see "failed to update complaint" just because an email provider
had a transient outage. The tradeoff is that email delivery isn't guaranteed
or retried; for a system at this scale, a simple retry queue would be the
natural next step if delivery reliability became a concern, but it isn't
justified for the current requirements.

For important notices, the email fan-out loops over all residents and sends
one email per resident. At society scale (tens to low hundreds of units)
this is well within Resend's free tier rate limits; a larger deployment
would batch this through a proper email queue instead of sequential
`fetch` calls.
