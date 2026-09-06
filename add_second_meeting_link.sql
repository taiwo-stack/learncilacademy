-- =============================================================
-- ADD SECOND MEETING LINK TO SCHEDULES TABLE
-- Lets a tutor attach two join links to one class session
-- (e.g. a paid Zoom link split into "First Half" / "Second Half").
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS meeting_link_2 TEXT;

COMMENT ON COLUMN public.schedules.meeting_link IS 'Join link for the first half of the class (or the only link, if the class is not split).';
COMMENT ON COLUMN public.schedules.meeting_link_2 IS 'Join link for the second half of the class, when the tutor splits one session across two meeting links.';
