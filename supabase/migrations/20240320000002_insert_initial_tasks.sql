-- Insert tasks for all users from task templates
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
  u.id as user_id,
  tt.title,
  tt.description,
  tt.task_type,
  tt.link,
  tt.reward,
  false as is_completed,
  NOW() as created_at,
  NOW() + INTERVAL '7 days' as expires_at
FROM users u
CROSS JOIN task_templates tt
WHERE tt.is_active = true
AND NOT EXISTS (
  -- Don't create duplicate tasks
  SELECT 1 FROM tasks t 
  WHERE t.user_id = u.id 
  AND t.title = tt.title
);

-- Add RLS policies for tasks table if not already present
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own tasks
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id); 