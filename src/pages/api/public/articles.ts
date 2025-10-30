import type { NextApiRequest, NextApiResponse } from 'next'
import { categories } from '@/content/categories'
import { getSupabaseAdmin, supabase, type Article } from '@/lib/supabase'
import { resolveAssetUrl } from '@/util/assets'
import type { ArticlePreview } from '@/types/article-preview'

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveCategoryTitle(slug: string): string {
  if (!slug) {
    return 'Sem categoria'
  }

  const match = categories.find((category) => category.slug === slug)
  if (match?.title) {
    return match.title
  }

  return slug
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

type ArticleRow = Pick<
  Article,
  |
    'id'
    | 'slug'
    | 'title'
    | 'excerpt'
    | 'cover_image'
    | 'og_image'
    | 'status'
    | 'published_at'
    | 'updated_at'
    | 'created_at'
    | 'contentlayer_meta'
> & {
  author: { name?: string | null; slug?: string | null } | null
  category: { slug?: string | null; title?: string | null } | null
}

type ArticlesResponse = {
  articles: ArticlePreview[]
}

type ErrorResponse = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArticlesResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
  let client: typeof supabase
    try {
      client = getSupabaseAdmin()
    } catch (error) {
      console.warn('Falling back to anon Supabase client for public articles endpoint.', error)
      client = supabase
    }

    const { data, error } = await client
      .from('articles')
      .select(
        `id, slug, title, excerpt, cover_image, og_image, status, published_at, updated_at, created_at, contentlayer_meta, author:authors(name, slug), category:categories(slug, title)`
      )
      .eq('status', 'published')

    if (error) {
      throw error
    }

    const rows: ArticleRow[] = Array.isArray(data) ? (data as ArticleRow[]) : []

    const sortedRows = [...rows].sort((first, second) => {
      const firstDate = normalizeString(first.published_at) || normalizeString(first.created_at) || normalizeString(first.updated_at)
      const secondDate = normalizeString(second.published_at) || normalizeString(second.created_at) || normalizeString(second.updated_at)
      const firstTime = Date.parse(firstDate) || 0
      const secondTime = Date.parse(secondDate) || 0
      return secondTime - firstTime
    })

    const normalized = sortedRows
      .map<ArticlePreview | null>((article) => {
        const meta = isRecord(article.contentlayer_meta) ? article.contentlayer_meta : {}

        const slug = normalizeString(article.slug)
        const permalinkSource = normalizeString(meta.permalink) || `/blog/post/${slug}`
        const permalink = permalinkSource.startsWith('/') ? permalinkSource : `/${permalinkSource}`

        const categorySlug = normalizeString(meta.category) || normalizeString(article.category?.slug) || ''
        const categoryTitle = normalizeString(meta.article_section) || normalizeString(article.category?.title) || resolveCategoryTitle(categorySlug)

        const authorName =
          normalizeString(meta.author) || normalizeString(article.author?.name) || 'Equipe Nova Metálica'

        const coverImage =
          normalizeString(article.cover_image) ||
          normalizeString(meta.cover_asset_id) ||
          normalizeString(meta.cover_image) ||
          normalizeString(meta.og_image_asset_id) ||
          normalizeString(article.og_image)

        const normalizedCoverImage = resolveAssetUrl(
          coverImage,
          '/assets/logo/logotipo-nova-metalica-branca.png'
        )

        const title = normalizeString(article.title) || normalizeString(meta.title)
        const excerpt = normalizeString(article.excerpt) || normalizeString(meta.excerpt) || normalizeString(meta.subtitle)

        const publishedFromMeta = normalizeString(meta.date)
        const publishedAt = normalizeString(article.published_at) || publishedFromMeta || normalizeString(article.updated_at) || normalizeString(article.created_at)

        if (!slug || !title) {
          return null
        }

        return {
          id: String(article.id),
          slug,
          permalink,
          title,
          excerpt,
          categorySlug,
          categoryTitle,
          authorName,
          coverImage: normalizedCoverImage,
          publishedAt
        }
      })
      .filter((article): article is ArticlePreview => Boolean(article))

    return res.status(200).json({ articles: normalized })
  } catch (error) {
    console.error('Public articles API error:', error)
    return res.status(500).json({ error: 'Não foi possível carregar os artigos.' })
  }
}
