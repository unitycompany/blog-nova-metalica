import { getSupabaseAdmin, type Category } from '../supabase'

export const categoriesRepository = {
  async getAll() {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Category[]
  },

  async getById(id: string) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Category
  },

  async getBySlug(slug: string) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Category
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async update(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async delete(id: string) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
