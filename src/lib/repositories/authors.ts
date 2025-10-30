import { getSupabaseAdmin, type Author } from '../supabase'

export const authorsRepository = {
  async getAll() {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data as Author[]
  },

  async getById(id: string) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Author
  },

  async getBySlug(slug: string) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Author
  },

  async create(author: Omit<Author, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('authors')
      .insert(author)
      .select()
      .single()

    if (error) throw error
    return data as Author
  },

  async update(id: string, author: Partial<Omit<Author, 'id' | 'created_at' | 'updated_at'>>) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('authors')
      .update(author)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Author
  },

  async delete(id: string) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
