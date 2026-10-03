-- =============================================================
-- FIX: both storage buckets (avatars, materials) have Row Level
-- Security enabled on storage.objects with no policy permitting
-- writes, so every upload from the browser's anon key fails with
-- "new row violates row-level security policy" and silently falls
-- back to embedding the file as a giant base64 data: URI directly in
-- the database row instead of a short storage URL.
--
-- This is specifically why HTML slide decks never reach students:
-- the fallback produces 60KB-560KB "URLs", and when the tutor
-- attaches one to the whiteboard, broadcasting it over Supabase
-- Realtime silently fails because the payload is far past Realtime's
-- broadcast size limit - so the page-change event carrying the slide
-- never arrives on the student's side. It also means avatar uploads
-- have been doing the same thing.
--
-- NOTE: storage.objects is owned by Supabase's internal
-- supabase_storage_admin role, so (unlike every other table in this
-- app) you can't just ALTER TABLE ... DISABLE ROW LEVEL SECURITY on
-- it - the SQL Editor's connection isn't the table owner and Postgres
-- requires that specifically for toggling RLS. Adding a policy is the
-- operation Supabase actually grants here, and it gets to the same
-- place: full open access, matching how every other table in this
-- schema already works.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wexqhlrhfostrpehknka/sql/new
-- =============================================================

CREATE POLICY "Public full access to materials bucket"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'materials')
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Public full access to avatars bucket"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
