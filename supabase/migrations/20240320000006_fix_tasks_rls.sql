-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;

-- Create new policies that work with Clerk user IDs
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (user_id = auth.uid()::text OR user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (user_id = auth.uid()::text OR user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (user_id = auth.uid()::text OR user_id = auth.jwt()->>'sub');

-- Grant necessary permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role; 