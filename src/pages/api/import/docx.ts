import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { type File } from 'formidable'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import mammoth from 'mammoth'
import { getAdminRequestContext } from '@/lib/auth/adminSession'
import { htmlToMdx } from '@/util/mdxConverter'
import { uploadBufferToStorage } from '@/lib/storage'

export const config = {
  api: {
    bodyParser: false
  }
}

type ImportedAsset = {
  filename: string
  url: string
  contentType: string | null
  size: number
}

type DocxImportResponse = {
  html: string
  mdx: string
  assets: ImportedAsset[]
  messages?: Array<{ message: string; type: string }>
}

type ErrorResponse = {
  error: string
}

const ACCEPTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
]

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/avif'])

async function parseRequest(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    keepExtensions: true
  })

  const [fields, files] = await form.parse(req)
  return { fields, files }
}

function getSingleFile(file: File | File[] | undefined) {
  if (!file) return null
  return Array.isArray(file) ? file[0] : file
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocxImportResponse | ErrorResponse>
) {
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

    if (file.mimetype && !ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Envie um arquivo .doc ou .docx válido.' })
    }

  const buffer = await fs.readFile(file.filepath)
  await fs.unlink(file.filepath).catch(() => undefined)
  const savedAssets: ImportedAsset[] = []
  const imageCache = new Map<string, { filename: string; url: string; size: number; contentType: string | null }>()

    const result = await mammoth.convertToHtml(
      { buffer },
      {
        includeDefaultStyleMap: true,
        styleMap: [
          "p.StyleTitle => h1",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
          "p[style-name='Heading 3'] => h4:fresh"
        ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convertImage: mammoth.images.imgElement(async (image: any) => {
          const base64 = await image.read('base64')

          if (!base64) {
            const fallbackType = typeof image.contentType === 'string' ? image.contentType : 'image/png'
            return { src: `data:${fallbackType};base64,` }
          }

          const cacheHit = imageCache.get(base64)
          if (cacheHit) {
            return { src: cacheHit.url, alt: image.altText ?? '' }
          }

          const contentType = typeof image.contentType === 'string' ? image.contentType : null
          const normalizedContentType = contentType && SUPPORTED_IMAGE_TYPES.has(contentType) ? contentType : 'image/png'
          const extension = normalizedContentType.split('/').pop() ?? 'png'
          const binary = Buffer.from(base64, 'base64')
          const filename = `gdoc-${randomUUID()}.${extension}`

          const { publicUrl } = await uploadBufferToStorage({
            buffer: binary,
            fileName: filename,
            directory: 'docx',
            contentType: normalizedContentType
          })

          const url = publicUrl
          const assetRecord: ImportedAsset = {
            filename,
            url,
            contentType: normalizedContentType,
            size: binary.length
          }

          savedAssets.push(assetRecord)
          imageCache.set(base64, { filename, url, size: binary.length, contentType: normalizedContentType })

          return {
            src: url,
            alt: typeof image.altText === 'string' && image.altText ? image.altText : 'imagem-importada'
          }
        })
      }
    )

    const html = result.value?.trim() ?? ''

    if (!html) {
      return res.status(400).json({ error: 'Não foi possível extrair conteúdo do documento.' })
    }

    const mdx = htmlToMdx(html)

    return res.status(200).json({ html, mdx, assets: savedAssets, messages: result.messages })
  } catch (error) {
    console.error('DOCX import error:', error)
    return res.status(500).json({ error: 'Falha ao processar o documento. Tente novamente.' })
  }
}
