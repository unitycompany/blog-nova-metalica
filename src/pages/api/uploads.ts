import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { type File } from 'formidable'
import type { Buffer } from 'node:buffer'
import { promises as fs } from 'node:fs'
import { randomUUID, createHash } from 'node:crypto'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { uploadBufferToStorage } from '@/lib/storage'

export const config = {
  api: {
    bodyParser: false
  }
}

type UploadResponse = {
  url: string
  name: string
  size: number
  type: string | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

async function parseRequest(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true
  })

  const [fields, files] = await form.parse(req)

  return { fields, files }
}

function buildFileName(original: string | undefined, mimeType: string | undefined, buffer: Buffer) {
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12)
  const randomPart = randomUUID().replace(/-/g, '').slice(0, 12)
  const rawExt = original?.includes('.') ? original.split('.').pop() : undefined
  const cleanedExt = rawExt?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const mimeExt = mimeType?.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const extension = cleanedExt?.length ? `.${cleanedExt}` : mimeExt?.length ? `.${mimeExt}` : ''
  return `${randomPart}-${hash}${extension}`
}

function getSingleFile(file: File | File[] | undefined) {
  if (!file) return null

  return Array.isArray(file) ? file[0] : file
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await getAdminRequestContext(req, res)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { files } = await parseRequest(req)
    const file = getSingleFile(files.file ?? files.asset ?? Object.values(files)[0])

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' })
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'O arquivo excede o limite de 5 MB.' })
    }

    const mimeType = file.mimetype ?? undefined

    if (mimeType && !ACCEPTED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: 'Formato de arquivo não suportado. Envie uma imagem válida.' })
    }

    const buffer = await fs.readFile(file.filepath)
    const fileName = buildFileName(file.originalFilename ?? undefined, mimeType, buffer)

    const { publicUrl } = await uploadBufferToStorage({
      buffer,
      fileName,
      contentType: mimeType ?? undefined
    })

    await fs.unlink(file.filepath).catch(() => undefined)

    return res.status(201).json({
      url: publicUrl,
      name: fileName,
      size: file.size,
      type: mimeType ?? null
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return res.status(500).json({ error: 'Não foi possível processar o upload.' })
  }
}
