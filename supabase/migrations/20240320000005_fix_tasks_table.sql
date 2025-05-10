-- Drop the existing tasks table if it exists
DROP TABLE IF EXISTS tasks;

-- Create the tasks table with the correct structure
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,
    link TEXT,
    reward INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

-- Grant necessary permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at);

-- Insert initial tasks for all users from templates
INSERT INTO tasks (
    user_id,
    title,
    description,
    task_type,
    link,
    reward,
    is_completed,
    created_at,
    expires_at
)
SELECT 
    u.id::text as user_id,
    tt.title,
    tt.description,
    tt.task_type,
    tt.link,
    tt.reward,
    false as is_completed,
    NOW() as created_at,
    NOW() + INTERVAL '7 days' as expires_at
FROM auth.users u
CROSS JOIN task_templates tt
WHERE tt.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.user_id = u.id::text
    AND t.title = tt.title
); 