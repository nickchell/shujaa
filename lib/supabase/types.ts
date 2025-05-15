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
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          referral_code: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          referral_code: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          referral_code?: string
          phone_number?: string | null
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          created_at: string
          referrer_id: string
          referred_user_id: string
          is_complete: boolean
          reward_granted: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          referrer_id: string
          referred_user_id: string
          is_complete?: boolean
          reward_granted?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          referrer_id?: string
          referred_user_id?: string
          is_complete?: boolean
          reward_granted?: boolean
          updated_at?: string
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
  }
} 