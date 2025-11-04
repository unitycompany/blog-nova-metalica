import { getSupabaseAdmin, type Article, type Database } from '../supabase'

type ArticleRow = Database['public']['Tables']['articles']['Row']
type ArticleInsert = Database['public']['Tables']['articles']['Insert']
type ArticleUpdate = Database['public']['Tables']['articles']['Update']

function isMissingContentColumn(error: { message?: string; details?: string }) {
  const message = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase()
  if (!message) {
    return false
  }

  return (
    message.includes("'content' column") ||
    message.includes('"content" column') ||
    message.includes('column content') ||
    message.includes('articles.content')
  ) && message.includes('articles')
}

export const articlesRepository = {
  async getAll(status?: Article['status']): Promise<Article[]> {
    const supabase = getSupabaseAdmin()

    const executeSelect = async (includeContent: boolean) => {
      const columns = [
        'id',
        'slug',
        'title',
        'subtitle',
        'excerpt',
        includeContent ? 'content' : undefined,
  'raw_mdx',
  'processed_mdx',
        'author_id',
        'category_id',
        'status',
        'published_at',
        'updated_at',
        'created_at',
        'seo_title',
        'seo_description',
        'og_image',
        'canonical_url',
        'robots_index',
        'robots_follow',
        'cover_image',
        'cover_blurhash',
        'cover_dominant_color',
        'lang',
        'reading_time',
        'word_count',
        'tags',
        'reviewed_by',
        'reviewer_credentials',
        'fact_checked',
        'related_articles',
        'tldr',
        'key_takeaways',
        'faq',
        'contentlayer_meta',
        'author:authors(*)',
        'category:categories(*)'
      ]
        .filter(Boolean)
        .join(', ')

      const query = supabase.from('articles').select(columns).order('created_at', { ascending: false })

      if (status) {
        return query.eq('status', status)
      }

      return query
    }

    let { data, error } = await executeSelect(true)

    if (error && isMissingContentColumn(error)) {
      const fallback = await executeSelect(false)
      data = fallback.data
      error = fallback.error
    }

    if (error) throw error
    if (!data) {
      return []
    }

    return data as unknown as ArticleRow[]
  },

  async getById(id: string): Promise<Article> {
    const supabase = getSupabaseAdmin()
    const selectWithContent = supabase
      .from('articles')
      .select(
        [
          'id',
          'slug',
          'title',
          'subtitle',
          'excerpt',
          'content',
          'raw_mdx',
          'processed_mdx',
          'author_id',
          'category_id',
          'status',
          'published_at',
          'updated_at',
          'created_at',
          'seo_title',
          'seo_description',
          'og_image',
          'canonical_url',
          'robots_index',
          'robots_follow',
          'cover_image',
          'cover_blurhash',
          'cover_dominant_color',
          'lang',
          'reading_time',
          'word_count',
          'tags',
          'reviewed_by',
          'reviewer_credentials',
          'fact_checked',
          'related_articles',
          'tldr',
          'key_takeaways',
          'faq',
          'contentlayer_meta',
          'author:authors(*)',
          'category:categories(*)'
        ].join(', ')
      )
      .eq('id', id)
      .maybeSingle()

    let { data, error } = await selectWithContent

    if (error && isMissingContentColumn(error)) {
      const fallback = await supabase
        .from('articles')
        .select(
          [
            'id',
            'slug',
            'title',
            'subtitle',
            'excerpt',
            'author_id',
            'category_id',
            'status',
            'published_at',
            'updated_at',
            'created_at',
            'seo_title',
            'seo_description',
            'og_image',
            'canonical_url',
            'robots_index',
            'robots_follow',
            'cover_image',
            'cover_blurhash',
            'cover_dominant_color',
            'lang',
            'reading_time',
            'word_count',
            'tags',
            'reviewed_by',
            'reviewer_credentials',
            'fact_checked',
            'related_articles',
            'tldr',
            'key_takeaways',
            'faq',
            'contentlayer_meta',
            'author:authors(*)',
            'category:categories(*)'
          ].join(', ')
        )
        .eq('id', id)
        .maybeSingle()

      data = fallback.data
      error = fallback.error
    }

    if (error) throw error
    if (!data) {
      throw new Error('Article not found')
    }
    return data as unknown as ArticleRow
  },

  async getBySlug(slug: string): Promise<Article> {
    const supabase = getSupabaseAdmin()
    const selectWithContent = supabase
      .from('articles')
      .select(
        [
          'id',
          'slug',
          'title',
          'subtitle',
          'excerpt',
          'content',
          'raw_mdx',
          'processed_mdx',
          'author_id',
          'category_id',
          'status',
          'published_at',
          'updated_at',
          'created_at',
          'seo_title',
          'seo_description',
          'og_image',
          'canonical_url',
          'robots_index',
          'robots_follow',
          'cover_image',
          'cover_blurhash',
          'cover_dominant_color',
          'lang',
          'reading_time',
          'word_count',
          'tags',
          'reviewed_by',
          'reviewer_credentials',
          'fact_checked',
          'related_articles',
          'tldr',
          'key_takeaways',
          'faq',
          'contentlayer_meta',
          'author:authors(*)',
          'category:categories(*)'
        ].join(', ')
      )
      .eq('slug', slug)
      .maybeSingle()

    let { data, error } = await selectWithContent

    if (error && isMissingContentColumn(error)) {
      const fallback = await supabase
        .from('articles')
        .select(
          [
            'id',
            'slug',
            'title',
            'subtitle',
            'excerpt',
            'author_id',
            'category_id',
            'status',
            'published_at',
            'updated_at',
            'created_at',
            'seo_title',
            'seo_description',
            'og_image',
            'canonical_url',
            'robots_index',
            'robots_follow',
            'cover_image',
            'cover_blurhash',
            'cover_dominant_color',
            'lang',
            'reading_time',
            'word_count',
            'tags',
            'reviewed_by',
            'reviewer_credentials',
            'fact_checked',
            'related_articles',
            'tldr',
            'key_takeaways',
            'faq',
            'contentlayer_meta',
            'author:authors(*)',
            'category:categories(*)'
          ].join(', ')
        )
        .eq('slug', slug)
        .maybeSingle()

      data = fallback.data
      error = fallback.error
    }

    if (error) throw error
    if (!data) {
      throw new Error('Article not found')
    }
    return data as unknown as ArticleRow
  },

  async create(article: ArticleInsert): Promise<Article> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single()

    if (error) {
      if (isMissingContentColumn(error)) {
        const { content, ...fallbackArticle } = article
  const fallbackPayload = fallbackArticle as unknown as ArticleInsert
        const fallback = await supabase
          .from('articles')
          .insert(fallbackPayload)
          .select()
          .single()

        if (fallback.error) {
          throw fallback.error
        }

  return { ...(fallback.data as unknown as ArticleRow), content: content ?? '' }
      }

      throw error
    }

    if (!data) {
      throw new Error('Failed to create article – empty response.')
    }

  return data as unknown as ArticleRow
  },

  async update(id: string, article: ArticleUpdate): Promise<Article> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('articles')
      .update(article)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (isMissingContentColumn(error)) {
        const { content, ...fallbackArticle } = article
        const fallback = await supabase
          .from('articles')
          .update(fallbackArticle as unknown as ArticleUpdate)
          .eq('id', id)
          .select()
          .single()

        if (fallback.error) {
          throw fallback.error
        }

  return { ...(fallback.data as unknown as ArticleRow), content: content ?? '' }
      }

      throw error
    }

    if (!data) {
      throw new Error('Failed to update article – empty response.')
    }

    return data as ArticleRow
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async publish(id: string): Promise<Article> {
    return articlesRepository.update(id, {
      status: 'published',
      published_at: new Date().toISOString(),
    })
  },

  async unpublish(id: string): Promise<Article> {
    return articlesRepository.update(id, {
      status: 'draft',
    })
  },
}
