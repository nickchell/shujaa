export interface Task {
  id: string;
  user_id: string; // Will be a UUID from auth.users
  title: string;
  description: string | null;
  task_type: string;
  link: string | null;
  reward: number;
  is_completed: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  link: string | null;
  reward: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
} 