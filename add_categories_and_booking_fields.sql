-- =============================================================
-- FOUNDAXIA LEARNCIL ACADEMY - CATEGORIES & EXPANDED SEED DATA
-- Run this query in your Supabase SQL Editor
-- =============================================================

-- 1. Create course_categories table
CREATE TABLE IF NOT EXISTS public.course_categories (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed standard course categories
INSERT INTO public.course_categories (id, name, description) VALUES
  ('cat_math', 'Math', 'Mathematics and quantitative courses'),
  ('cat_english', 'English & Reading', 'Reading, writing, and language arts'),
  ('cat_science', 'Science', 'Natural and physical sciences'),
  ('cat_testprep', 'Test Prep', 'Preparation for examinations like JAMB, WAEC, NECO, SAT, ACT'),
  ('cat_coding', 'Coding & Tech', 'Software programming and future technology skills')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 3. Update courses table structure to ensure category columns exist
-- (In full_migration.sql, courses table already has 'category TEXT' column)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'regular';

-- 4. Seed standard subjects into courses table linked to their categories
INSERT INTO public.courses (id, title, description, category, course_type, image_url) VALUES
  -- Math
  ('c_math_elem', 'Elementary Math', 'Building strong number sense, core arithmetic, fractions, decimals, and basic geometric shapes.', 'Math', 'regular', '/images/book1.jpg'),
  ('c_math_prealg', 'Pre-Algebra', 'Transitioning from arithmetic to algebraic thinking with variables, proportions, and equations.', 'Math', 'regular', '/images/book1.jpg'),
  ('c_math_alg', 'Algebra I & II', 'Solving complex equations, graphing functions, inequalities, logarithms, and quadratic relationships.', 'Math', 'regular', '/images/book1.jpg'),
  ('c_math_geom', 'Geometry', 'Exploring Euclidean geometry, shapes, similarity, proofs, and foundational trigonometry principles.', 'Math', 'regular', '/images/book1.jpg'),
  ('c_math_trig', 'Trigonometry', 'Comprehensive study of trigonometric functions, circular logic, laws of sines/cosines, and graphing waves.', 'Math', 'regular', '/images/book1.jpg'),
  ('c_math_calc', 'Calculus', 'Limits, derivatives, integrals, and their application to physics and mathematics systems.', 'Math', 'regular', '/images/book1.jpg'),
  
  -- English & Reading
  ('c_eng_phonics', 'Phonics', 'Early child decoding skills, sounds, word combinations, and introductory reading exercises.', 'English & Reading', 'regular', '/images/book2.jpg'),
  ('c_eng_compre', 'Reading Comprehension', 'Developing active reading habits, extracting core ideas, context clues, and summarizing text structure.', 'English & Reading', 'regular', '/images/book2.jpg'),
  ('c_eng_creative', 'Creative Writing', 'Drafting stories, building fictional worlds, and refining voice and tone.', 'English & Reading', 'regular', '/images/book2.jpg'),
  ('c_eng_essay', 'Essay Writing', 'Constructing five-paragraph outlines, narrative descriptions, arguments, and academic research papers.', 'English & Reading', 'regular', '/images/book2.jpg'),
  ('c_eng_lit', 'Literature', 'Exploring classical books, plays, thematic motifs, character development, and narrative arcs.', 'English & Reading', 'regular', '/images/book2.jpg'),
  
  -- Science
  ('c_sci_life', 'Life Science', 'Basic structures of cells, plant systems, food cycles, and elementary biological traits.', 'Science', 'regular', '/images/child online.jpg'),
  ('c_sci_bio', 'Biology', 'Microscopic organisms, cell mitosis, genetics, DNA transcription, and human anatomy systems.', 'Science', 'regular', '/images/child online.jpg'),
  ('c_sci_chem', 'Chemistry', 'Periodic table structure, atomic bonding, stoichiometry equations, acid/base balances, and lab procedures.', 'Science', 'regular', '/images/child online.jpg'),
  ('c_sci_phys', 'Physics', 'Mechanics, Newton laws, velocity vectors, work-energy theorems, waves, and electrical currents.', 'Science', 'regular', '/images/child online.jpg'),
  ('c_sci_earth', 'Earth Science', 'Rock formations, plate tectonics, weather cycles, water conservation, and planetary astronomy.', 'Science', 'regular', '/images/child online.jpg'),
  
  -- Test Prep
  ('c_tp_jamb', 'JAMB Prep', 'Nigeria Joint Admissions and Matriculation Board exam preparation (UTME). Key past questions and exam strategies.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_waec', 'WAEC Prep', 'West African Examinations Council senior school certificate prep. Core syllabus walkthroughs.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_neco', 'NECO Prep', 'National Examinations Council exam preparation. Full subject drills and tips.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_postutme', 'Post-UTME Prep', 'University-specific Post-UTME screening prep for candidate selection success.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_sat', 'SAT Prep', 'College Board SAT reasoning test prep covering reading, writing, and math strategy.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_act', 'ACT Prep', 'Comprehensive ACT exam review covering English, math, reading, and science reasoning.', 'Test Prep', 'special', '/images/whyus.jpg'),
  ('c_tp_state', 'State Assessments', 'Preparation for localized state tests and benchmark standard compliance assessments.', 'Test Prep', 'special', '/images/whyus.jpg'),
  
  -- Coding & Tech
  ('c_code_intro', 'Intro to Coding', 'Learn basic block logic, scratch sequences, loop parameters, and coding structures.', 'Coding & Tech', 'special', '/images/boylearning.jpg'),
  ('c_code_cs', 'Computer Science Fundamentals', 'Understanding machine architectures, data variables, array lists, and memory paradigms.', 'Coding & Tech', 'special', '/images/boylearning.jpg')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  course_type = EXCLUDED.course_type,
  image_url = EXCLUDED.image_url;

-- 5. Add missing registry columns to public.students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS parent_name       TEXT,
  ADD COLUMN IF NOT EXISTS parent_email      TEXT,
  ADD COLUMN IF NOT EXISTS relationship      TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS emergency_name    TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone   TEXT,
  ADD COLUMN IF NOT EXISTS previous_school   TEXT;
