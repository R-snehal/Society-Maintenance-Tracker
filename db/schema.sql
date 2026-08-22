-- Society Maintenance Tracker - Database Schema
-- Run this once against your Postgres database (Supabase / Neon / Railway all work).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('resident', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
  id            SERIAL PRIMARY KEY,
  resident_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  description   TEXT NOT NULL,
  photo_url     TEXT,
  priority      TEXT NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
  status        TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

-- Append-only audit trail. Every status change (including the initial creation)
-- inserts a row here instead of overwriting anything on the complaint itself.
CREATE TABLE IF NOT EXISTS complaint_history (
  id            SERIAL PRIMARY KEY,
  complaint_id  INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  actor_id      INTEGER NOT NULL REFERENCES users(id),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notices (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  is_important  BOOLEAN NOT NULL DEFAULT false,
  author_id     INTEGER NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_resident ON complaints(resident_id);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notices_important ON notices(is_important);
