-- =============================================================
-- FIX: live_sessions ended up with Row Level Security enabled and
-- no policy allowing writes, so starting a session from the Tutor
-- Dashboard fails with "new row violates row-level security policy".
-- Same issue as push_subscriptions - disabling to match every other
-- table in this schema, none of which use RLS.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

ALTER TABLE public.live_sessions DISABLE ROW LEVEL SECURITY;
