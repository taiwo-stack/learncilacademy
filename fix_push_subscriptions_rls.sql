-- =============================================================
-- FIX: push_subscriptions ended up with Row Level Security enabled
-- and no policy allowing writes, so the app's anon key (what every
-- browser uses) gets rejected with "new row violates row-level
-- security policy". Disabling it to match every other table in this
-- schema - none of them use RLS; access is controlled in app code.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
