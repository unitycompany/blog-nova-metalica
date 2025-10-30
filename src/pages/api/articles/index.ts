import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { articlesRepository } from '@/lib/repositories/articles'
import type { Article } from '@/lib/supabase'
import { listArticleFiles, regenerateContentlayer, writeArticleMdx } from '@/util/content'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await getAdminRequestContext(req, res)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined
        const allowedStatuses: Array<Article['status']> = ['draft', 'published', 'archived']
        const status = allowedStatuses.includes(statusParam as Article['status']) ? (statusParam as Article['status']) : undefined
        await syncFilesystemArticles()
        const articles = await articlesRepository.getAll(status)
        return res.status(200).json(articles)

      case 'POST':
        if (typeof req.body?.slug !== 'string' || req.body.slug.trim() === '') {
          return res.status(400).json({ error: 'Slug é obrigatório.' })
        }

        if (typeof req.body?.content !== 'string') {
          return res.status(400).json({ error: 'Conteúdo do artigo é obrigatório.' })
        }

        const newArticle = await articlesRepository.create(req.body)

        try {
          await writeArticleMdx({
            ...newArticle,
            ...req.body,
            slug: newArticle.slug,
            contentlayer_meta: req.body.contentlayer_meta ?? newArticle.contentlayer_meta,
            content: req.body.content
          })

          await regenerateContentlayer()

          await revalidatePaths(res, [
            '/',
            '/blog',
            extractPermalink(newArticle.contentlayer_meta, newArticle.slug)
          ])
        } catch (writeError) {
          console.error('Falha ao gerar MDX do artigo recém-criado:', writeError)
          try {
            await articlesRepository.delete(newArticle.id)
          } catch (cleanupError) {
            console.error('Falha ao reverter artigo criado após erro de MDX:', cleanupError)
          }
          throw writeError
        }

        return res.status(201).json({ ...newArticle, content: req.body.content })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: unknown) {
    if (isSlugConflictError(error)) {
      return res.status(409).json({ error: 'Slug já está em uso. Escolha outro identificador.' })
    }

    console.error('Articles API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({ error: message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizePath(path: string) {
  if (!path) {
    return '/'
  }
  return path.startsWith('/') ? path : `/${path}`
}

function extractPermalink(meta: unknown, slug: string) {
  if (isRecord(meta) && typeof meta.permalink === 'string' && meta.permalink.trim() !== '') {
    return normalizePath(meta.permalink)
  }
  return normalizePath(`/blog/post/${slug}`)
}

async function revalidatePaths(res: NextApiResponse, paths: string[]) {
  if (typeof res.revalidate !== 'function') {
    return
  }

  const uniquePaths = Array.from(new Set(paths.map((path) => normalizePath(path))))

  await Promise.all(
    uniquePaths.map(async (path) => {
      try {
        await res.revalidate(path)
      } catch (error) {
        console.warn(`Falha ao revalidar ${path}:`, error)
      }
    })
  )
}

async function syncFilesystemArticles() {
  const files = await listArticleFiles()
  if (files.length === 0) {
    return
  }

  const existingArticles = await articlesRepository.getAll()
  const knownSlugs = new Set(existingArticles.map((article) => article.slug))
  let syncedAny = false

  for (const file of files) {
    if (knownSlugs.has(file.slug)) {
      continue
    }

    const payload = buildArticlePayloadFromFile(file)

    try {
      await articlesRepository.create(payload)
      syncedAny = true
      knownSlugs.add(file.slug)
    } catch (error) {
      console.error(`Falha ao sincronizar artigo do arquivo ${file.filePath}:`, error)
    }
  }

  if (syncedAny) {
    await regenerateContentlayer()
  }
}

function buildArticlePayloadFromFile(file: Awaited<ReturnType<typeof listArticleFiles>>[number]) {
  const frontmatter = normalizeFrontmatter(file.frontmatter, file.slug)

  const status = parseStatus(frontmatter.status)
  const subtitle = toOptionalString(frontmatter.subtitle)
  const excerpt = toOptionalString(frontmatter.excerpt ?? frontmatter.description)
  const seoTitle = toOptionalString(frontmatter.seo_title)
  const seoDescription = toOptionalString(frontmatter.seo_description)
  const canonicalUrl = toOptionalString(frontmatter.canonical_url)
  const robotsIndex = toOptionalString(frontmatter.robots_index) ?? 'index'
  const robotsFollow = toOptionalString(frontmatter.robots_follow) ?? 'follow'
  const coverImage = toOptionalString(frontmatter.cover_image ?? frontmatter.cover_asset_id ?? frontmatter.og_image_asset_id)
  const ogImage = toOptionalString(frontmatter.og_image ?? frontmatter.og_image_asset_id ?? coverImage)
  const lang = toOptionalString(frontmatter.lang ?? frontmatter.in_language) ?? 'pt-BR'
  const coverBlurhash = toOptionalString(frontmatter.cover_blurhash)
  const coverDominantColor = toOptionalString(frontmatter.cover_dominant_color)
  const reviewedBy = toOptionalString(frontmatter.reviewed_by)
  const reviewerCredentials = toOptionalString(frontmatter.reviewer_credentials)
  const factChecked = toBoolean(frontmatter.fact_checked)
  const tldr = toOptionalString(frontmatter.tldr)
  const readingTime = toOptionalNumber(frontmatter.reading_time_minutes ?? frontmatter.reading_time)
  const wordCount = toOptionalNumber(frontmatter.word_count)
  const tags = toStringArray(frontmatter.tags ?? frontmatter.article_tags)
  const keyTakeaways = toStringArray(frontmatter.key_takeaways)

  const metadata = pruneUndefined({
    ...frontmatter,
    slug: file.slug
  })

  const permalinkValue = metadata.permalink
  if (typeof permalinkValue !== 'string' || permalinkValue.trim() === '') {
    metadata.permalink = `/blog/post/${file.slug}`
  }

  return {
    slug: file.slug,
  title: toOptionalString(frontmatter.title) ?? deriveTitleFromSlug(file.slug),
    subtitle,
    excerpt,
    content: file.content,
    status,
  author_id: undefined,
  category_id: undefined,
    cover_image: coverImage,
    seo_title: seoTitle,
    seo_description: seoDescription,
    canonical_url: canonicalUrl,
    og_image: ogImage,
    robots_index: robotsIndex,
    robots_follow: robotsFollow,
    tags,
    lang,
    cover_blurhash: coverBlurhash,
    cover_dominant_color: coverDominantColor,
    reviewed_by: reviewedBy,
    reviewer_credentials: reviewerCredentials,
    fact_checked: factChecked,
    tldr,
    key_takeaways: keyTakeaways,
    reading_time: readingTime,
    word_count: wordCount,
    contentlayer_meta: metadata
  } satisfies Omit<Article, 'id' | 'created_at' | 'updated_at'>
}

function normalizeFrontmatter(frontmatter: Record<string, unknown>, slug: string) {
  const normalized = { ...frontmatter }

  if (!normalized.slug || typeof normalized.slug !== 'string' || normalized.slug.trim() === '') {
    normalized.slug = slug
  }

  return normalized
}

function deriveTitleFromSlug(slug: string) {
  return slug
    .split(/[-_]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function parseStatus(value: unknown): Article['status'] {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'published' || normalized === 'draft' || normalized === 'archived') {
      return normalized
    }
  }

  return 'draft'
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'sim'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no', 'não', 'nao'].includes(normalized)) {
      return false
    }
  }

  return false
}

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item): item is string => item.length > 0)

    return normalized.length > 0 ? normalized : undefined
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return undefined
}

function pruneUndefined(record: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue
    }

    normalized[key] = value
  }

  return normalized
}

function isSlugConflictError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const record = error as { code?: unknown; message?: unknown; details?: unknown; cause?: unknown }
  const causeRecord = typeof record.cause === 'object' && record.cause !== null ? (record.cause as { code?: unknown }) : undefined

  const code = typeof record.code === 'string' ? record.code : typeof causeRecord?.code === 'string' ? causeRecord.code : ''
  if (code === '23505') {
    return true
  }

  const message = (record.message ?? '').toString().toLowerCase()
  if (message.includes('articles_slug_key') || message.includes('duplicate key value') || message.includes('unique constraint')) {
    return true
  }

  const details = (record.details ?? '').toString().toLowerCase()
  return details.includes('articles_slug_key')
}
