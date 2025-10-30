import type { NextApiRequest, NextApiResponse } from 'next'
import type { ArticlePreview } from '@/types/article-preview'
import { getPublishedArticlePreviews } from '@/lib/articles/previews'

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
    const { articles } = await getPublishedArticlePreviews()
    return res.status(200).json({ articles })
  } catch (error) {
    console.error('Public articles API error:', error)
    return res.status(500).json({ error: 'Não foi possível carregar os artigos.' })
  }
}
