import { categories } from '@/content/categories'
import type { ArticlePreview } from '@/types/article-preview'
import { resolveAssetUrl } from '@/util/assets'
import { getSupabaseAdmin, tryGetSupabaseClient, type Database } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { allPosts } from 'contentlayer/generated'

const DEFAULT_COVER = '/assets/logo/logotipo-nova-metalica-branca.png'
const DEFAULT_AUTHOR = 'Equipe Nova Metálica'

export type PublishedArticlesResult = {
  source: 'supabase-admin' | 'supabase-public' | 'contentlayer'
  articles: ArticlePreview[]
}

type ArticleRow = Pick<
  Database['public']['Tables']['articles']['Row'],
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'status'
  | 'published_at'
  | 'updated_at'
  | 'created_at'
  | 'contentlayer_meta'
  | 'cover_image'
  | 'og_image'
> & {
  author: { name?: string | null; slug?: string | null } | null
  category: { slug?: string | null; title?: string | null } | null
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function ensureLeadingSlash(path: string): string {
  if (!path) {
    return '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

function resolveCategoryTitle(slug: string, fallback: string): string {
  if (fallback) {
    return fallback
  }

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

function mapSupabaseRowToPreview(article: ArticleRow): ArticlePreview | null {
  const meta = isRecord(article.contentlayer_meta) ? article.contentlayer_meta : {}

  const slug = normalizeString(article.slug)
  if (!slug) {
    return null
  }

  const permalinkSource = normalizeString(meta.permalink) || `/blog/post/${slug}`
  const permalink = ensureLeadingSlash(permalinkSource)

  const title = normalizeString(article.title) || normalizeString(meta.title)
  if (!title) {
    return null
  }

  const excerpt =
    normalizeString(article.excerpt) ||
    normalizeString(meta.excerpt) ||
    normalizeString(meta.subtitle)

  const categorySlug =
    normalizeString(meta.category) ||
    normalizeString(article.category?.slug) ||
    ''

  const categoryTitle =
    normalizeString(meta.article_section) ||
    normalizeString(article.category?.title) ||
    resolveCategoryTitle(categorySlug, '')

  const authorName =
    normalizeString(meta.author) ||
    normalizeString(article.author?.name) ||
    DEFAULT_AUTHOR

  const coverImageSource =
    normalizeString(article.cover_image) ||
    normalizeString(meta.cover_asset_id) ||
    normalizeString(meta.cover_image) ||
    normalizeString(meta.og_image_asset_id) ||
    normalizeString(article.og_image)

  const coverImage = resolveAssetUrl(coverImageSource, DEFAULT_COVER)

  const publishedAt =
    normalizeString(meta.date) ||
    normalizeString(article.published_at) ||
    normalizeString(article.updated_at) ||
    normalizeString(article.created_at)

  return {
    id: String(article.id),
    slug,
    permalink,
    title,
    excerpt,
    categorySlug,
    categoryTitle,
    authorName,
    coverImage,
    publishedAt
  }
}

async function loadPublishedArticlesFromSupabase(
  client: SupabaseClient<Database>
): Promise<ArticlePreview[]> {
  const { data, error } = await client
    .from('articles')
    .select(
      `id, slug, title, excerpt, status, published_at, updated_at, created_at, contentlayer_meta, cover_image, og_image, author:authors(name, slug), category:categories(slug, title)`
    )
    .eq('status', 'published')

  if (error) {
    throw error
  }

  const rows: ArticleRow[] = Array.isArray(data) ? (data as ArticleRow[]) : []

  const sortedRows = [...rows].sort((first, second) => {
    const firstDate =
      normalizeString(first.published_at) ||
      normalizeString(first.created_at) ||
      normalizeString(first.updated_at)
    const secondDate =
      normalizeString(second.published_at) ||
      normalizeString(second.created_at) ||
      normalizeString(second.updated_at)

    const firstTime = Date.parse(firstDate) || 0
    const secondTime = Date.parse(secondDate) || 0

    return secondTime - firstTime
  })

  return sortedRows
    .map((article) => mapSupabaseRowToPreview(article))
    .filter((article): article is ArticlePreview => Boolean(article))
}

export async function getPublishedArticlePreviews(): Promise<PublishedArticlesResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const articles = await loadPublishedArticlesFromSupabase(adminClient)
    return { source: 'supabase-admin', articles }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load articles using Supabase admin client:', error)
    }
  }

  try {
    const publicClient = tryGetSupabaseClient()
    if (publicClient) {
      const articles = await loadPublishedArticlesFromSupabase(publicClient)
      return { source: 'supabase-public', articles }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load articles using Supabase public client:', error)
    }
  }

  return { source: 'contentlayer', articles: getContentlayerArticlePreviews() }
}

function normalizeContentlayerPosts(): ArticlePreview[] {
  return allPosts.map((post) => {
    const slug = typeof post.slug === 'string' ? post.slug : ''
    const sanitizedSlug = slug.replace(/^\/+/, '')
    const permalink = sanitizedSlug ? ensureLeadingSlash(sanitizedSlug) : '/'
    const categorySlug = typeof post.category === 'string' ? post.category : ''

    const coverImageRaw =
      (typeof post.cover_asset_id === 'string' ? post.cover_asset_id : '') ||
      (typeof post.cover_image === 'string' ? post.cover_image : '') ||
      (typeof post.og_image_asset_id === 'string' ? post.og_image_asset_id : '')

    const coverImage = resolveAssetUrl(coverImageRaw, DEFAULT_COVER)

    const updatedAt = typeof post.updated_at === 'string' ? post.updated_at : ''
    const publishedAt =
      (typeof post.date === 'string' ? post.date : '') ||
      updatedAt

    const postId =
      typeof post._id === 'string' && post._id ? post._id : permalink.replace(/^\//, '')

    const categoryTitle = resolveCategoryTitle(categorySlug, '')
    const excerpt =
      (typeof post.excerpt === 'string' ? post.excerpt : '') ||
      (typeof post.subtitle === 'string' ? post.subtitle : '')

    const authorName =
      (typeof post.author === 'string' ? post.author : '') || DEFAULT_AUTHOR

    return {
      id: postId,
      slug: sanitizedSlug.split('/').pop() ?? sanitizedSlug,
      permalink,
      title: typeof post.title === 'string' ? post.title : 'Artigo',
      excerpt,
      categorySlug,
      categoryTitle,
      authorName,
      coverImage,
      publishedAt
    }
  })
}

export function getContentlayerArticlePreviews(): ArticlePreview[] {
  return normalizeContentlayerPosts()
}
