import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { articlesRepository } from '@/lib/repositories/articles'
import type { Article } from '@/lib/supabase'
import { regenerateContentlayer, writeArticleMdx } from '@/util/content'
import { mdxToHtml } from '@/util/mdxConverter'

type ArticleInsertPayload = Parameters<typeof articlesRepository.create>[0]

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
        const articles = await articlesRepository.getAll(status)
        return res.status(200).json(articles)

      case 'POST':
        if (typeof req.body?.slug !== 'string' || req.body.slug.trim() === '') {
          return res.status(400).json({ error: 'Slug é obrigatório.' })
        }

        if (typeof req.body?.content !== 'string') {
          return res.status(400).json({ error: 'Conteúdo do artigo é obrigatório.' })
        }

        const { content_html: _unusedContentHtml, ...incoming } = (req.body ?? {}) as Record<string, unknown>
        const contentValue = typeof incoming.content === 'string' ? incoming.content : ''
        const rawMdxValue = typeof incoming.raw_mdx === 'string' && incoming.raw_mdx.trim().length > 0
          ? incoming.raw_mdx
          : contentValue
        const processedHtmlValue = typeof incoming.processed_mdx === 'string' && incoming.processed_mdx.trim().length > 0
          ? incoming.processed_mdx
          : mdxToHtml(rawMdxValue)

        const articlePayload: ArticleInsertPayload = {
          ...(incoming as ArticleInsertPayload),
          content: contentValue,
          raw_mdx: rawMdxValue,
          processed_mdx: processedHtmlValue,
        }

        const newArticle = await articlesRepository.create(articlePayload)

        // Optionally write MDX files and rebuild Contentlayer only when explicitly enabled
        const enableFsSync = process.env.ENABLE_CONTENT_FS_SYNC === '1'
        if (enableFsSync) {
          try {
            await writeArticleMdx({
              ...newArticle,
              ...articlePayload,
              slug: newArticle.slug,
              contentlayer_meta: articlePayload.contentlayer_meta ?? newArticle.contentlayer_meta,
              content: rawMdxValue
            })

            await regenerateContentlayer()
          } catch (writeError) {
            console.error('Falha ao gerar MDX do artigo recém-criado:', writeError)
            try {
              await articlesRepository.delete(newArticle.id)
            } catch (cleanupError) {
              console.error('Falha ao reverter artigo criado após erro de MDX:', cleanupError)
            }
            throw writeError
          }
        }

        // Always revalidate ISR pages for Supabase-driven rendering
        await revalidatePaths(res, [
          '/',
          '/blog',
          extractPermalink(newArticle.contentlayer_meta, newArticle.slug)
        ])

        return res.status(201).json({
          ...newArticle,
          content: rawMdxValue,
          raw_mdx: rawMdxValue,
          processed_mdx: processedHtmlValue,
        })

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

// Removed automatic filesystem -> Supabase sync to avoid unintended article creation
// If needed in the future, expose a protected, explicit endpoint or script to run a one-off import.

// Removed helper functions used exclusively by the old filesystem sync logic.

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
