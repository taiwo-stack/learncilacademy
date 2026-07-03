-- Migration: Add image_url column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;
