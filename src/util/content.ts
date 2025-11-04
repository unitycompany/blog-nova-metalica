import fs from 'fs/promises'
import path from 'path'
import { execFile } from 'node:child_process'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export interface ArticleContentPayload {
	slug: string
	content: string
	contentlayer_meta?: Record<string, unknown>
	[key: string]: unknown
}

const POSTS_DIRECTORY = path.join(process.cwd(), 'posts')

const IS_WINDOWS = process.platform === 'win32'
const CONTENTLAYER_LOCAL_BIN = path.join(
	process.cwd(),
	'node_modules',
	'.bin',
	IS_WINDOWS ? 'contentlayer.cmd' : 'contentlayer'
)
const CONTENTLAYER_LOCAL_ARGS = ['build'] as const
const CONTENTLAYER_FALLBACK_BIN = IS_WINDOWS ? 'npx.cmd' : 'npx'
const CONTENTLAYER_FALLBACK_ARGS = ['-y', 'contentlayer', 'build'] as const

let pendingContentlayerBuild: Promise<void> | null = null

export function getArticleFilePath(slug: string) {
	const normalizedSlug = slug.replace(/\.mdx?$/i, '')
	return path.join(POSTS_DIRECTORY, `${normalizedSlug}.mdx`)
}

export async function writeArticleMdx(payload: ArticleContentPayload) {
	if (!payload.slug || typeof payload.slug !== 'string') {
		throw new Error('Não foi possível gerar o arquivo MDX: slug inválido.')
	}

	if (typeof payload.content !== 'string') {
		throw new Error('Não foi possível gerar o arquivo MDX: conteúdo inválido.')
	}

		const frontmatter = buildFrontmatter(payload)
		const yamlContent = stringifyYaml(frontmatter).trimEnd()
			const body = payload.content.trimEnd()

	try {
		await fs.mkdir(POSTS_DIRECTORY, { recursive: true })
	} catch (error) {
		if (!isNodeError(error) || !isUnwritableFsError(error)) {
			throw error
		}
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[content] Ignorando falha ao criar diretório de posts (${error.code}). O arquivo MDX não será persistido.`)
		}
		return
	}

	const filePath = getArticleFilePath(payload.slug)
	const mdxContent = [`---`, yamlContent, `---`, '', body, ''].join('\n')

	try {
		await fs.writeFile(filePath, mdxContent, 'utf8')
	} catch (error) {
		if (!isNodeError(error) || !isUnwritableFsError(error)) {
			throw error
		}
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[content] Ignorando falha ao salvar arquivo MDX (${error.code}): ${filePath}`)
		}
	}
}

export async function deleteArticleMdx(slug: string) {
	const filePath = getArticleFilePath(slug)

	try {
		await fs.unlink(filePath)
	} catch (error: unknown) {
		if (isNodeError(error)) {
			if (typeof error.code === 'string' && (error.code === 'ENOENT' || isUnwritableFsError(error))) {
				if (process.env.NODE_ENV !== 'production') {
					console.warn(`Ignorando falha ao remover arquivo MDX (${error.code}):`, filePath)
				}

				return
			}
		}

		throw error
	}
}

export async function readArticleContent(slug: string) {
	const filePath = getArticleFilePath(slug)

	try {
		const rawContent = await fs.readFile(filePath, 'utf8')
		const { content } = parseMdx(rawContent)
		return content.trim()
	} catch (error: unknown) {
		if (isNodeError(error) && error.code === 'ENOENT') {
			return null
		}

		throw error
	}
}

export type ArticleFileDescriptor = {
	slug: string
	frontmatter: Record<string, unknown>
	content: string
	filePath: string
}

export async function listArticleFiles(): Promise<ArticleFileDescriptor[]> {
	let entries: string[]
	try {
		entries = await fs.readdir(POSTS_DIRECTORY)
	} catch (error: unknown) {
		if (isNodeError(error) && error.code === 'ENOENT') {
			return []
		}

		throw error
	}

		const mdxFiles = entries.filter((entry) => {
			const name = entry.toLowerCase()
			if (!name.endsWith('.mdx')) {
				return false
			}

			if (name === 'model.mdx' || name.startsWith('_')) {
				return false
			}

			return true
		})
	const articles: ArticleFileDescriptor[] = []

	for (const fileName of mdxFiles) {
		const filePath = path.join(POSTS_DIRECTORY, fileName)

		try {
			const rawContent = await fs.readFile(filePath, 'utf8')
			const { frontmatter, content } = parseMdx(rawContent)
			const slug = deriveSlug(frontmatter.slug, fileName)
			articles.push({ slug, frontmatter, content, filePath })
		} catch (error) {
			console.error(`Falha ao ler o arquivo MDX ${fileName}:`, error)
		}
	}

	return articles
}

function buildFrontmatter(payload: ArticleContentPayload) {
	const frontmatter: Record<string, unknown> = {}
	const metadataEntries = sanitizeRecord(payload.contentlayer_meta ?? {})
	for (const [key, value] of Object.entries(metadataEntries)) {
		frontmatter[key] = value
	}

	const rest = { ...payload } as Record<string, unknown>
	delete rest.content
	delete rest.contentlayer_meta

	const fieldMappings: Array<[string, string]> = [
		['title', 'title'],
		['subtitle', 'subtitle'],
		['excerpt', 'excerpt'],
		['lang', 'lang'],
		['seo_title', 'seo_title'],
		['seo_description', 'seo_description'],
		['canonical_url', 'canonical_url'],
		['robots_index', 'robots_index'],
		['robots_follow', 'robots_follow'],
		['cover_image', 'cover_image'],
		['cover_blurhash', 'cover_blurhash'],
		['cover_dominant_color', 'cover_dominant_color'],
		['tags', 'tags'],
		['reading_time', 'reading_time_minutes'],
		['word_count', 'word_count'],
		['reviewed_by', 'reviewed_by'],
		['reviewer_credentials', 'reviewer_credentials'],
		['fact_checked', 'fact_checked'],
		['related_articles', 'related_articles'],
		['tldr', 'tldr'],
		['key_takeaways', 'key_takeaways'],
		['og_image', 'og_image'],
		['og_title', 'og_title'],
		['og_description', 'og_description'],
		['twitter_card', 'twitter_card'],
		['twitter_site', 'twitter_site'],
		['twitter_creator', 'twitter_creator'],
		['slug', 'slug'],
		['status', 'status'],
		['published_at', 'published_at'],
		['updated_at', 'updated_at']
	]

	for (const [sourceKey, targetKey] of fieldMappings) {
		if (frontmatter[targetKey] !== undefined) {
			continue
		}

		const value = rest[sourceKey]
		const sanitized = sanitizeValue(value)
		if (sanitized !== undefined) {
			frontmatter[targetKey] = sanitized
		}
	}

	return frontmatter
}

function sanitizeRecord(record: Record<string, unknown>) {
	const sanitized: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(record)) {
		const sanitizedValue = sanitizeValue(value)
		if (sanitizedValue !== undefined) {
			sanitized[key] = sanitizedValue
		}
	}

	return sanitized
}

function sanitizeValue(value: unknown): unknown {
	if (value === null || value === undefined) {
		return undefined
	}

	if (typeof value === 'string') {
		const trimmed = value.trim()
		return trimmed.length > 0 ? trimmed : undefined
	}

	if (Array.isArray(value)) {
		const sanitizedArray = value
			.map((item) => sanitizeValue(item))
			.filter((item): item is Exclude<typeof item, undefined> => item !== undefined)

		return sanitizedArray.length > 0 ? sanitizedArray : undefined
	}

	if (value instanceof Date) {
		return value.toISOString()
	}

	if (typeof value === 'object') {
		const sanitizedObject = sanitizeRecord(value as Record<string, unknown>)
		return Object.keys(sanitizedObject).length > 0 ? sanitizedObject : undefined
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : undefined
	}

	return value
}

function parseMdx(rawContent: string) {
	const match = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)

	if (!match) {
		return {
			frontmatter: {},
			content: rawContent
		}
	}

	const [, frontmatterSource, body = ''] = match
	let frontmatter: unknown = {}

	try {
		frontmatter = parseYaml(frontmatterSource) ?? {}
	} catch (error) {
		console.error('Falha ao interpretar frontmatter YAML:', error)
		frontmatter = {}
	}

	if (typeof frontmatter !== 'object' || frontmatter === null || Array.isArray(frontmatter)) {
		frontmatter = {}
	}

	return {
		frontmatter: frontmatter as Record<string, unknown>,
		content: body
	}
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
	return typeof error === 'object' && error !== null && 'code' in error
}

function isUnwritableFsError(error: NodeJS.ErrnoException) {
	const readonlyCodes = new Set(['EROFS', 'EACCES', 'EPERM', 'ENOENT'])
	return typeof error.code === 'string' && readonlyCodes.has(error.code)
}

function deriveSlug(frontmatterSlug: unknown, fileName: string) {
	const fallback = fileName.replace(/\.mdx?$/i, '')

	if (typeof frontmatterSlug !== 'string') {
		return fallback
	}

	const trimmed = frontmatterSlug.trim()
	if (!trimmed) {
		return fallback
	}

	const normalized = trimmed
		.replace(/\\/g, '/')
		.replace(/\.mdx?$/i, '')
		.replace(/^\/+/, '')

	const segments = normalized.split('/').filter(Boolean)
	if (segments.length === 0) {
		return fallback
	}

	return segments[segments.length - 1]
}

	export async function regenerateContentlayer() {
		if (process.env.CONTENTLAYER_AUTO_BUILD === '0' || process.env.CONTENTLAYER_AUTO_BUILD === 'false') {
			return
		}

		if (pendingContentlayerBuild) {
			return pendingContentlayerBuild
		}

		const ensureCommand = async () => {
			try {
				await fs.access(CONTENTLAYER_LOCAL_BIN)
				return {
					command: CONTENTLAYER_LOCAL_BIN,
					args: Array.from(CONTENTLAYER_LOCAL_ARGS),
				}
			} catch {
				console.info('[contentlayer] Usando npx como fallback para rebuild automático.')
				return {
					command: CONTENTLAYER_FALLBACK_BIN,
					args: Array.from(CONTENTLAYER_FALLBACK_ARGS),
				}
			}
		}

		const runCommand = async (command: string, args: string[]) => {
			return new Promise<void>((resolve, reject) => {
				const shouldUseShell = IS_WINDOWS && command.toLowerCase().endsWith('.cmd')
				const child = execFile(command, args, {
					cwd: process.cwd(),
					env: process.env,
					shell: shouldUseShell,
				}, (error) => {
					if (error) {
						const nodeError = error as NodeJS.ErrnoException
						if (nodeError.code === 'ENOENT') {
							console.error('[contentlayer] Comando não encontrado, verifique se contentlayer está instalado.')
						}
						console.error('[contentlayer] rebuild falhou:', error)
						reject(error)
						return
					}
					resolve()
				})

				child.stdout?.on('data', (chunk) => {
					const output = chunk.toString().trim()
					if (output) {
						console.info(`[contentlayer] ${output}`)
					}
				})

				child.stderr?.on('data', (chunk) => {
					const output = chunk.toString().trim()
					if (output) {
						console.error(`[contentlayer] ${output}`)
					}
				})
			})
		}

		pendingContentlayerBuild = ensureCommand()
			.then(({ command, args }) => runCommand(command, args))
			.catch((error) => {
				if (process.env.NODE_ENV !== 'production') {
					throw error
				}

				console.warn('[contentlayer] Ignorando falha ao regenerar conteúdo em produção:', error)
			})
			.finally(() => {
				pendingContentlayerBuild = null
			})

		return pendingContentlayerBuild
	}

