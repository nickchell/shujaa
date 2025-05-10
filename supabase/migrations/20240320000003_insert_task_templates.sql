-- First, ensure the task_templates table exists
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,
    link TEXT,
    reward INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on task_templates
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view task templates
CREATE POLICY "Anyone can view task templates"
ON task_templates FOR SELECT
USING (true);

-- Insert some default task templates
INSERT INTO task_templates (title, description, task_type, link, reward, is_active, expires_at)
VALUES 
    ('Complete Your Profile', 'Fill out your profile information to get started', 'profile', NULL, 100, true, NOW() + INTERVAL '30 days'),
    ('Watch Tutorial Video', 'Learn how to use the platform by watching our tutorial', 'watch_video', 'https://example.com/tutorial', 50, true, NOW() + INTERVAL '30 days'),
    ('Invite Friends', 'Invite 3 friends to join the platform', 'social', NULL, 200, true, NOW() + INTERVAL '30 days'),
    ('First Task', 'Complete your first task on the platform', 'general', NULL, 150, true, NOW() + INTERVAL '30 days'),
    ('Daily Check-in', 'Check in daily to earn rewards', 'daily', NULL, 25, true, NOW() + INTERVAL '30 days')
ON CONFLICT (title) DO NOTHING; 