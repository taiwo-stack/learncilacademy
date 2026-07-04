-- =============================================================
-- ADD MISSING COLUMNS TO TASKS TABLE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS target_student_ids JSONB DEFAULT '[]'::jsonb;
