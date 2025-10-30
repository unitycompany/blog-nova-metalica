import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { authorsRepository } from '@/lib/repositories/authors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await getAdminRequestContext(req, res)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        const authors = await authorsRepository.getAll()
        return res.status(200).json(authors)

      case 'POST':
        const newAuthor = await authorsRepository.create(req.body)
        return res.status(201).json(newAuthor)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: unknown) {
    console.error('Authors API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({ error: message })
  }
}
