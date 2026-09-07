-- =============================================================
-- CHAT READ RECEIPTS + WEB PUSH SUBSCRIPTIONS
-- Fixes the unread message count (it never went down because there
-- was nowhere to record a message as read), and adds storage for
-- each user's push subscription so a new chat message can trigger a
-- real OS-level notification even when the app/tab is closed.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

COMMENT ON TABLE public.push_subscriptions IS 'One row per browser/device a user has enabled notifications on; deleted automatically when the push service reports the subscription has expired.';
