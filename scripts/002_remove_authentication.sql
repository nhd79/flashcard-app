-- Remove authentication requirements from flashcard app
-- This script removes all RLS policies and user_id constraints
-- to allow shared access to all data

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can view their own cards" ON public.flashcards;

DROP POLICY IF EXISTS "Users can delete their own lists" ON public.flashcard_lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.flashcard_lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON public.flashcard_lists;
DROP POLICY IF EXISTS "Users can view their own lists" ON public.flashcard_lists;

-- Disable Row Level Security
ALTER TABLE public.flashcard_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;

-- Make user_id columns nullable (to support existing data)
ALTER TABLE public.flashcard_lists ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.flashcards ALTER COLUMN user_id DROP NOT NULL;

-- Create public access policies (allow all operations for everyone)
CREATE POLICY "Allow public access to lists" ON public.flashcard_lists
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to cards" ON public.flashcards
  FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS with public access policies
ALTER TABLE public.flashcard_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anonymous users
GRANT ALL ON public.flashcard_lists TO anon;
GRANT ALL ON public.flashcards TO anon;
GRANT ALL ON public.flashcard_lists TO authenticated;
GRANT ALL ON public.flashcards TO authenticated;