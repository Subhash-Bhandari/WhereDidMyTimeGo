-- MVP: auth, sessions, reflection_date, indexes

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar(255);

-- Backfill for dev DBs that had users without passwords (run only if column was just added)
-- UPDATE users SET password_hash = '' WHERE password_hash IS NULL;

ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

CREATE TABLE IF NOT EXISTS sessions (
  id varchar(64) PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

ALTER TABLE daily_reflections ADD COLUMN IF NOT EXISTS reflection_date date;
ALTER TABLE daily_reflections ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE daily_reflections
SET reflection_date = (created_at AT TIME ZONE 'UTC')::date
WHERE reflection_date IS NULL;

ALTER TABLE daily_reflections ALTER COLUMN reflection_date SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_reflections_user_date_idx
  ON daily_reflections(user_id, reflection_date);

CREATE INDEX IF NOT EXISTS daily_reflections_user_date_lookup_idx
  ON daily_reflections(user_id, reflection_date);

CREATE INDEX IF NOT EXISTS time_entries_user_started_idx
  ON time_entries(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS time_entries_user_category_idx
  ON time_entries(user_id, category_id);
