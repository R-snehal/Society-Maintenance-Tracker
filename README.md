# Society Maintenance Tracker

Residents raise maintenance complaints with photos, admins manage them through
a status/priority workflow, and everyone stays informed via a notice board
and email updates.

## Tech Stack

- **Framework:** Next.js 14 (App Router) - single codebase for frontend + API
- **Database:** PostgreSQL (tested against Supabase free tier)
- **Auth:** JWT (jsonwebtoken) + bcrypt, role-based (`resident` / `admin`)
- **Photo uploads:** Cloudinary unsigned upload (direct browser → Cloudinary, no backend file handling)
- **Email:** Sendgrid REST API via `fetch` (no SDK dependency)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd society-maintenance-tracker
npm install
```

### 2. Create a Postgres database

Easiest option: [supabase.com](https://supabase.com) → New Project → copy the
connection string (Settings → Database → Connection string → URI).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` - your Postgres connection string
- `JWT_SECRET` - any long random string
- `OVERDUE_THRESHOLD_DAYS` - e.g. `5`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` -
  create a free [Cloudinary](https://cloudinary.com) account, then add an
  **unsigned** upload preset under Settings → Upload
- `SENDGRID_API_KEY` / `EMAIL_FROM` - create a free [Sendgrid](https://www.twilio.com/)
  account and API key. `EMAIL_FROM` can stay as `admin_email` for testing.

### 4. Apply the database schema

```bash
npm run db:init
```

### 5. Create an admin account

Self-registration (`/register`) only creates resident accounts by design.
Create the first admin with:

```bash
npm run db:seed-admin "Admin Name" admin@example.com yourPassword123
```

### 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 7. Deploy

Push to GitHub, then import the repo into [Vercel](https://vercel.com).
Add the same environment variables from `.env` in the Vercel project settings.
Vercel builds and deploys automatically on push to `main`.

## Database Schema

See [`db/schema.sql`](db/schema.sql) for the full DDL. Summary:

| Table | Purpose |
|---|---|
| `users` | Residents and admins, with `role` and hashed password |
| `complaints` | One row per complaint: category, description, photo, priority, current status |
| `complaint_history` | Append-only audit trail - one row per status change, with actor, timestamp, optional note |
| `notices` | Admin-posted notices, with `is_important` for pinning |

`complaints.status` is always kept in sync with the latest `complaint_history`
row for that complaint; the history table is the source of truth for "what
happened when."

## API Reference

All endpoints except register/login require `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | - | Create a resident account |
| POST | `/api/auth/login` | - | Log in, returns JWT |
| GET | `/api/complaints` | resident/admin | List complaints (residents see only their own). Admin supports `?category=&status=&from=&to=` |
| POST | `/api/complaints` | resident | Raise a complaint (`category`, `description`, `photoUrl`) |
| GET | `/api/complaints/:id` | resident/admin | Get one complaint |
| PATCH | `/api/complaints/:id` | admin | Update `priority` |
| PATCH | `/api/complaints/:id/status` | admin | Update `status` (+ optional `note`), appends history row, emails resident |
| GET | `/api/complaints/:id/history` | resident/admin | Full status history for a complaint |
| GET | `/api/notices` | resident/admin | List notices, important ones pinned first |
| POST | `/api/notices` | admin | Post a notice (`title`, `body`, `isImportant`); emails all residents if important |
| GET | `/api/dashboard` | admin | Aggregate counts by status, by category, and overdue count |

## Overdue Detection

Overdue status is **computed on read**, not stored: a complaint is overdue if
`status != 'Resolved'` and it was created more than `OVERDUE_THRESHOLD_DAYS`
ago. This keeps the threshold configurable via env var without needing a
background job. See `lib/overdue.js`.

## Notes

- `node_modules/`, `.env`, and build output are gitignored per submission guidelines.
- Dependencies are kept minimal: `next`, `react`, `react-dom`, `pg`, `bcryptjs`, `jsonwebtoken`.
