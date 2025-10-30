import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { articlesRepository } from '@/lib/repositories/articles'
import { deleteArticleMdx, readArticleContent, regenerateContentlayer, writeArticleMdx } from '@/util/content'

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
        const fileContent = await readArticleContent(article.slug)
        return res.status(200).json({ ...article, content: fileContent ?? article.content ?? '' })
      }

      case 'PUT': {
        const hasContentUpdate = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'content')
        const hasMetadataUpdate = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'contentlayer_meta')

        if (hasContentUpdate) {
          if (typeof req.body?.slug !== 'string' || req.body.slug.trim() === '') {
            return res.status(400).json({ error: 'Slug é obrigatório.' })
          }

          if (typeof req.body?.content !== 'string') {
            return res.status(400).json({ error: 'Conteúdo do artigo é obrigatório.' })
          }
        }

        const existingArticle = await articlesRepository.getById(id)
        const updated = await articlesRepository.update(id, req.body)

        const slugProvided = typeof req.body?.slug === 'string' && req.body.slug.trim() !== ''
        const nextSlug = slugProvided ? req.body.slug : updated.slug
        const shouldRewriteMdx = hasContentUpdate || hasMetadataUpdate || (slugProvided && nextSlug !== existingArticle.slug)
        let resolvedContent: string | undefined = hasContentUpdate ? req.body.content : undefined

        try {
          if (shouldRewriteMdx) {
            const contentlayerMeta = req.body.contentlayer_meta ?? updated.contentlayer_meta ?? existingArticle.contentlayer_meta
            let nextContent: string | null

            if (hasContentUpdate) {
              nextContent = typeof req.body.content === 'string' ? req.body.content : ''
            } else {
              const fileContent = await readArticleContent(existingArticle.slug)
              const dbContent = typeof updated.content === 'string' ? updated.content : existingArticle.content
              nextContent = fileContent ?? (typeof dbContent === 'string' ? dbContent : '')
            }

            await writeArticleMdx({
              ...existingArticle,
              ...updated,
              ...req.body,
              slug: nextSlug,
              contentlayer_meta: contentlayerMeta,
              content: nextContent ?? ''
            })

            if (existingArticle.slug !== nextSlug) {
              await deleteArticleMdx(existingArticle.slug)
            }

            resolvedContent = nextContent ?? ''

            await regenerateContentlayer()
            await revalidatePaths(res, [
              '/',
              '/blog',
              extractPermalink(existingArticle.contentlayer_meta, existingArticle.slug),
              extractPermalink(contentlayerMeta, nextSlug)
            ])
          }
        } catch (writeError) {
          console.error('Falha ao atualizar MDX do artigo:', writeError)
          throw writeError
        }

        if (resolvedContent === undefined) {
          const fileContent = await readArticleContent(nextSlug)
          const dbContent = typeof updated.content === 'string' ? updated.content : existingArticle.content
          resolvedContent = fileContent ?? (typeof dbContent === 'string' ? dbContent : '')
        }

        return res.status(200).json({
          ...updated,
          slug: nextSlug,
          content: resolvedContent
        })
      }

      case 'DELETE': {
        const articleToRemove = await articlesRepository.getById(id)
        await articlesRepository.delete(id)
        await deleteArticleMdx(articleToRemove.slug)
        await regenerateContentlayer()
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
