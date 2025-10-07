export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          reminder_time: string | null
          reminder_frequency: number | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          reminder_time?: string | null
          reminder_frequency?: number | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          reminder_time?: string | null
          reminder_frequency?: number | null
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          content: string | null
          feeling: 'Good' | 'Medium' | 'Bad' | 'Uncertain' | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          feeling?: 'Good' | 'Medium' | 'Bad' | 'Uncertain' | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          feeling?: 'Good' | 'Medium' | 'Bad' | 'Uncertain' | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Feeling = 'Good' | 'Medium' | 'Bad' | 'Uncertain'

export const AVAILABLE_TAGS = [
  'Work',
  'School', 
  'Friends',
  'Exercise',
  'Family time',
  'Outdoor',
  'Busy',
  'Creative',
  'Sex',
  'Vacation',
  'Alcohol',
  'Dine out',
  'Sick'
] as const

export type Tag = typeof AVAILABLE_TAGS[number]
