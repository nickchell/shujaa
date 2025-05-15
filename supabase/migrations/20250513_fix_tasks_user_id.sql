-- Begin transaction
BEGIN;

-- Drop existing foreign key constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Change user_id column type to TEXT
ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraint
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update RLS policies to use TEXT comparison
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON COLUMN tasks.user_id IS 'Clerk user ID in text format';

-- Commit transaction
COMMIT;
