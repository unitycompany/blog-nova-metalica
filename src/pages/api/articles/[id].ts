import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { articlesRepository } from '@/lib/repositories/articles'
import { deleteArticleMdx, regenerateContentlayer, writeArticleMdx } from '@/util/content'
import { mdxToHtml } from '@/util/mdxConverter'

type ArticleUpdatePayload = Parameters<typeof articlesRepository.update>[1]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const auth = await getAdminRequestContext(req, res)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET': {
        const article = await articlesRepository.getById(id)
        const rawSource = (typeof article.raw_mdx === 'string' ? article.raw_mdx : undefined)
          ?? (typeof article.content === 'string' ? article.content : '')
        const processedSource = typeof article.processed_mdx === 'string' && article.processed_mdx.trim().length > 0
          ? article.processed_mdx
          : mdxToHtml(rawSource ?? '')

        return res.status(200).json({
          ...article,
          content: rawSource ?? '',
          raw_mdx: rawSource ?? '',
          processed_mdx: processedSource,
        })
      }

      case 'PUT': {
        const hasContentUpdate = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'content')
          || Object.prototype.hasOwnProperty.call(req.body ?? {}, 'raw_mdx')
        const hasMetadataUpdate = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'contentlayer_meta')

        if (hasContentUpdate) {
          if (typeof req.body?.slug !== 'string' || req.body.slug.trim() === '') {
            return res.status(400).json({ error: 'Slug é obrigatório.' })
          }

          const hasContentString = typeof req.body?.content === 'string'
          const hasRawMdxString = typeof req.body?.raw_mdx === 'string'

          if (!hasContentString && !hasRawMdxString) {
            return res.status(400).json({ error: 'Conteúdo do artigo é obrigatório.' })
          }
        }

        const { content_html: _unusedContentHtml, ...incoming } = (req.body ?? {}) as Record<string, unknown>
        const articlePayload: ArticleUpdatePayload = { ...(incoming as ArticleUpdatePayload) }

        const providedContent = typeof articlePayload.content === 'string' ? articlePayload.content : undefined
        const providedRawMdx = typeof articlePayload.raw_mdx === 'string' ? articlePayload.raw_mdx : undefined
  const normalizedRawMdx = providedRawMdx ?? providedContent

        if (normalizedRawMdx !== undefined) {
          const sanitizedRaw = normalizedRawMdx
          articlePayload.raw_mdx = sanitizedRaw
          articlePayload.content = sanitizedRaw
        }

        const providedProcessedHtml = typeof articlePayload.processed_mdx === 'string' ? articlePayload.processed_mdx : undefined
        let normalizedProcessedHtml = providedProcessedHtml

        if (!normalizedProcessedHtml && normalizedRawMdx !== undefined) {
          normalizedProcessedHtml = mdxToHtml(normalizedRawMdx)
        }

        if (normalizedProcessedHtml !== undefined) {
          articlePayload.processed_mdx = normalizedProcessedHtml
        }

  const existingArticle = await articlesRepository.getById(id)
  const updated = await articlesRepository.update(id, articlePayload)

        const slugProvided = typeof articlePayload?.slug === 'string' && articlePayload.slug.trim() !== ''
        const nextSlug = slugProvided ? articlePayload.slug! : updated.slug
        const shouldRewriteMdx = hasContentUpdate || hasMetadataUpdate || (slugProvided && nextSlug !== existingArticle.slug)
        const incomingRawForRewrite = normalizedRawMdx ?? (typeof articlePayload.raw_mdx === 'string' ? articlePayload.raw_mdx : undefined)
        let resolvedContent: string | undefined = hasContentUpdate ? (incomingRawForRewrite ?? providedContent ?? '') : undefined

        const enableFsSync = process.env.ENABLE_CONTENT_FS_SYNC === '1'
        if (enableFsSync) {
          try {
            if (shouldRewriteMdx) {
              const contentlayerMeta = articlePayload.contentlayer_meta ?? updated.contentlayer_meta ?? existingArticle.contentlayer_meta
              let nextContent: string

              if (hasContentUpdate) {
                nextContent = incomingRawForRewrite ?? providedContent ?? ''
              } else {
                const dbContent = typeof updated.raw_mdx === 'string'
                  ? updated.raw_mdx
                  : typeof existingArticle.raw_mdx === 'string'
                    ? existingArticle.raw_mdx
                    : typeof updated.content === 'string'
                      ? updated.content
                      : existingArticle.content
                nextContent = typeof dbContent === 'string' ? dbContent : ''
              }

              await writeArticleMdx({
                ...existingArticle,
                ...updated,
                ...articlePayload,
                slug: nextSlug,
                contentlayer_meta: contentlayerMeta,
                content: nextContent ?? ''
              })

              if (existingArticle.slug !== nextSlug) {
                await deleteArticleMdx(existingArticle.slug)
              }

              resolvedContent = nextContent ?? ''

              await regenerateContentlayer()
            }
          } catch (writeError) {
            console.error('Falha ao atualizar MDX do artigo:', writeError)
            throw writeError
          }
        }

        if (resolvedContent === undefined) {
          const dbContent = typeof updated.raw_mdx === 'string'
            ? updated.raw_mdx
            : typeof existingArticle.raw_mdx === 'string'
              ? existingArticle.raw_mdx
              : typeof updated.content === 'string'
                ? updated.content
                : existingArticle.content
          resolvedContent = typeof dbContent === 'string' ? dbContent : ''
        }

        return res.status(200).json({
          ...updated,
          slug: nextSlug,
          content: resolvedContent,
          raw_mdx: typeof updated.raw_mdx === 'string' ? updated.raw_mdx : resolvedContent,
          processed_mdx: typeof updated.processed_mdx === 'string'
            ? updated.processed_mdx
            : normalizedProcessedHtml ?? mdxToHtml(resolvedContent ?? ''),
        })
      }

      case 'DELETE': {
        const articleToRemove = await articlesRepository.getById(id)
        await articlesRepository.delete(id)
        if (process.env.ENABLE_CONTENT_FS_SYNC === '1') {
          await deleteArticleMdx(articleToRemove.slug)
          await regenerateContentlayer()
        }
        await revalidatePaths(res, ['/', '/blog', extractPermalink(articleToRemove.contentlayer_meta, articleToRemove.slug)])
        return res.status(204).end()
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: unknown) {
    if (isSlugConflictError(error)) {
      return res.status(409).json({ error: 'Slug já está em uso. Ajuste o identificador do artigo.' })
    }

    console.error('Article API error:', error)
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
