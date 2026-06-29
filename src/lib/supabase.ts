import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          business_name: string
          trade: string
          phone: string
          email: string
          city: string
          logo_url: string | null
          stripe_account_id: string | null
          language: 'es' | 'en'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          description: string
          items: QuoteItem[]
          subtotal: number
          commission: number
          total: number
          status: 'pending' | 'accepted' | 'rejected' | 'paid'
          stripe_payment_intent_id: string | null
          public_token: string
          notes: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          client_id: string
          quote_id: string | null
          title: string
          description: string | null
          scheduled_date: string
          scheduled_time: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          address: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
    }
  }
}

export type QuoteItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}
