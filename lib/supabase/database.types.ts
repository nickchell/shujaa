export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          task_type: string
          link: string | null
          reward: number
          is_completed: boolean
          created_at: string
          updated_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          task_type: string
          link?: string | null
          reward: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          task_type?: string
          link?: string | null
          reward?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string | null
          expires_at?: string | null
        }
      }
      task_templates: {
        Row: {
          id: string
          title: string
          description: string | null
          task_type: string
          link: string | null
          reward: number
          is_active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          task_type: string
          link?: string | null
          reward: number
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          task_type?: string
          link?: string | null
          reward?: number
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
