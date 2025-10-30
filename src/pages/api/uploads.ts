import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { type File } from 'formidable'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { getAdminRequestContext } from '@/lib/auth/adminSession'

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

async function ensureUploadDir(uploadDir: string) {
  await fs.mkdir(uploadDir, { recursive: true })
}

async function parseRequest(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true
  })

  const [fields, files] = await form.parse(req)

  return { fields, files }
}

function buildFileName(original: string | undefined, mimeType: string | undefined) {
  const baseName = randomUUID()
  const extFromOriginal = original ? path.extname(original) : ''
  const safeExt = extFromOriginal || (mimeType ? `.${mimeType.split('/').pop()}` : '')

  return `${baseName}${safeExt}`.replace(/\.+\.+/, '.')
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

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads')
    await ensureUploadDir(uploadDir)

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

    const fileName = buildFileName(file.originalFilename ?? undefined, mimeType)
    const destination = path.join(uploadDir, fileName)

    await fs.copyFile(file.filepath, destination)

    const fileUrl = `/assets/uploads/${fileName}`

    return res.status(201).json({
      url: fileUrl,
      name: fileName,
      size: file.size,
      type: mimeType ?? null
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return res.status(500).json({ error: 'Não foi possível processar o upload.' })
  }
}
