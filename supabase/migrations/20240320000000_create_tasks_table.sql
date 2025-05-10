-- Create tasks table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  task_type text, -- e.g., 'install_app', 'signup_offer', 'watch_video'
  link text,      -- CTA or affiliate link
  reward integer, -- in cents or shilling (e.g., 10 means KSh 10)
  is_completed boolean default false,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

-- Create task_templates table
create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  link text,
  reward integer,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security for task_templates
alter table public.task_templates enable row level security;

-- Create policy for task_templates (only admins can manage templates)
create policy "Admins can manage task templates"
  on public.task_templates
  using (auth.role() = 'authenticated'); 