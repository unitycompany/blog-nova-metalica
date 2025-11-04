import type { Buffer } from 'node:buffer'
import { getSupabaseAdmin } from './supabase'

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'assets'
const DEFAULT_PREFIX = process.env.SUPABASE_STORAGE_PREFIX || 'uploads'

export type StorageUploadOptions = {
  buffer: Buffer
  path?: string
  fileName?: string
  directory?: string
  contentType?: string
  cacheControlSeconds?: number
}

export type StorageUploadResult = {
  bucket: string
  path: string
  publicUrl: string
}

function joinPath(...segments: Array<string | undefined>): string {
  return segments
    .filter((segment): segment is string => typeof segment === 'string' && segment.trim().length > 0)
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter((segment) => segment.length > 0)
    .join('/')
}

export async function uploadBufferToStorage(options: StorageUploadOptions): Promise<StorageUploadResult> {
  const supabase = getSupabaseAdmin()
  const bucket = DEFAULT_BUCKET

  if (!bucket) {
    throw new Error('Supabase storage bucket is not configured. Defina a variável SUPABASE_STORAGE_BUCKET.')
  }

  const fileName = options.fileName ?? (options.path ? options.path.split('/').pop() ?? '' : '')

  if (!fileName) {
    throw new Error('É necessário informar um nome de arquivo para o upload.')
  }

  const directory = options.directory ?? (options.path ? options.path.split('/').slice(0, -1).join('/') : DEFAULT_PREFIX)
  const normalizedDirectory = directory ? joinPath(directory) : DEFAULT_PREFIX
  const normalizedPath = joinPath(normalizedDirectory, fileName)

  const cacheControl = Number.isFinite(options.cacheControlSeconds) && options.cacheControlSeconds !== undefined
    ? String(options.cacheControlSeconds)
    : '3600'

  const { error: uploadError } = await supabase.storage.from(bucket).upload(normalizedPath, options.buffer, {
    contentType: options.contentType ?? 'application/octet-stream',
    cacheControl,
    upsert: false
  })

  if (uploadError) {
    throw uploadError
  }

  const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(normalizedPath)

  if (!publicUrlResult || !publicUrlResult.data?.publicUrl) {
    throw new Error('Não foi possível gerar a URL pública do arquivo enviado.')
  }

  return {
    bucket,
    path: normalizedPath,
    publicUrl: publicUrlResult.data.publicUrl
  }
}
