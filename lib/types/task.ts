export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  task_type: string;
  link: string | null;
  reward: number;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;  // Make updated_at optional since it might not be in the database
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