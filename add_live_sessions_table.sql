-- =============================================================
-- LIVE WHITEBOARD SESSIONS
-- Lets a tutor pick one or more students and start an interactive
-- whiteboard session right now - a join link then appears on those
-- students' dashboards, and disappears once the tutor ends it.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id TEXT PRIMARY KEY,
  tutor_id UUID NOT NULL,
  tutor_name TEXT,
  student_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.live_sessions IS 'A row exists exactly while a tutor-started live whiteboard session is joinable; ending the session deletes the row.';
