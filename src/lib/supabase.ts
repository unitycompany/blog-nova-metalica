import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.supabase.url
const supabaseAnonKey = env.supabase.anonKey

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

let adminClient: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    return supabase
  }

  if (adminClient) {
    return adminClient
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Configure it in the server environment to enable admin operations.'
    )
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  return adminClient
}

export type Database = {
  public: {
    Tables: {
      authors: {
        Row: Author
        Insert: Omit<Author, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Author, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
    }
    Views: never
    Functions: never
    Enums: never
    CompositeTypes: never
  }
}

export type Author = {
  id: string
  name: string
  slug: string
  bio?: string
  avatar_url?: string
  email?: string
  twitter?: string
  linkedin?: string
  website?: string
  credentials?: string
  contentlayer_meta?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  slug: string
  title: string
  description?: string
  og_image?: string
  parent_id?: string
  order_index: number
  synonyms?: string[]
  ai_hints?: string[]
  is_indexed: boolean
  contentlayer_meta?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type Article = {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  content: string
  author_id?: string
  category_id?: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  updated_at: string
  created_at: string
  seo_title?: string
  seo_description?: string
  og_image?: string
  canonical_url?: string
  robots_index?: string
  robots_follow?: string
  cover_image?: string
  cover_blurhash?: string
  cover_dominant_color?: string
  lang: string
  reading_time?: number
  word_count?: number
  tags?: string[]
  reviewed_by?: string
  reviewer_credentials?: string
  fact_checked: boolean
  related_articles?: string[]
  tldr?: string
  key_takeaways?: string[]
  faq?: ArticleFaqEntry[]
  contentlayer_meta?: Record<string, unknown>
}

export type ArticleFaqEntry = {
	question: string
	answer: string
}
