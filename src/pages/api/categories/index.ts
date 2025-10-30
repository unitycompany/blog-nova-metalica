import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { categoriesRepository } from '@/lib/repositories/categories'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await getAdminRequestContext(req, res)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        const categories = await categoriesRepository.getAll()
        return res.status(200).json(categories)

      case 'POST':
        const newCategory = await categoriesRepository.create(req.body)
        return res.status(201).json(newCategory)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: unknown) {
    console.error('Categories API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({ error: message })
  }
}
