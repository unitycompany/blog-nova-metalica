import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { FileArrowUp } from '@phosphor-icons/react'
import { Article, Author, Category } from '@/lib/supabase'
import { adminFetch } from '@/lib/http/adminFetch'
import { AssetUploader, FormField, LoadingState, Modal } from '../ui'
import { RichTextEditor } from '../editor/rich-text-editor'
import { htmlToMdx, mdxToHtml } from '@/util/mdxConverter'

const SITE_ID = 'blog-nova-metalica'
const CANONICAL_BASE_URL = 'https://blog.novametalica.com.br/blog/post/'
const DEFAULT_DOMINANT_COLOR = '#1f9ad7'
const DEFAULT_LANGUAGE = 'pt-BR'
const DEFAULT_SITEMAP_PRIORITY = '0.8'
const DEFAULT_SITEMAP_CHANGEFREQ = 'weekly'
const DEFAULT_LICENSE = 'https://creativecommons.org/licenses/by/4.0/'
const DEFAULT_FUNDING_DISCLOSURE =
	'Conteúdo produzido por redatores especializados contratados pela Nova Metálica.'
const DEFAULT_CONFLICTS_OF_INTEREST = 'Nenhum conflito de interesse declarado.'
const AVERAGE_CHARS_PER_MINUTE = 900
const MAX_DOCX_UPLOAD_SIZE = 15 * 1024 * 1024
const DOC_IMPORT_ACCEPTED_MIME_TYPES = new Set([
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/msword'
])

function extractPlainText(content: string): string {
	if (!content) {
		return ''
	}
	let text = content
	text = text.replace(/```[\s\S]*?```/g, ' ')
	text = text.replace(/`[^`]*`/g, ' ')
	text = text.replace(/<[^>]+>/g, ' ')
	text = text.replace(/\{[^}]*\}/g, ' ')
	text = text.replace(/[#*_>\-]+/g, ' ')
	text = text.replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
	text = text.replace(/\s+/g, ' ')
	return text.trim()
}

function computeContentMetrics(content: string): { wordCount: number; readingMinutes: number; characterCount: number } {
	const plainText = extractPlainText(content)
	if (!plainText) {
		return { wordCount: 0, readingMinutes: 1, characterCount: 0 }
	}
	const words = plainText.split(' ').filter(Boolean)
	const wordCount = words.length
	const characterCount = plainText.replace(/\s/g, '').length
	const readingMinutes = Math.max(1, Math.ceil(characterCount / AVERAGE_CHARS_PER_MINUTE))
	return { wordCount, readingMinutes, characterCount }
}

function generateContentVersion(): string {
	const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
	return `v${timestamp}`
}

function buildImageMeta(asset: string): string {
	if (!asset) {
		return ''
	}
	const fileName = asset.split('/').pop() ?? asset
	const baseName = fileName.replace(/\.[^.]+$/, '')
	const meta = {
		title: baseName.replace(/[-_]+/g, ' ').trim() || baseName,
		filename: fileName,
		url: asset
	}
	return JSON.stringify(meta, null, 2)
}

type MetadataFieldType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'date'
	| 'select'
	| 'json'
	| 'boolean'
	| 'list'

type ArticleMetadataKey =
	| 'site_id'
	| 'date'
	| 'lastmod'
	| 'updated_at'
	| 'permalink'
	| 'category'
	| 'tag_ids'
	| 'article_tags'
	| 'related_post_slugs'
	| 'series_slug'
	| 'series_order'
	| 'translated_from_id'
	| 'alternate_locales'
	| 'author'
	| 'author_slug'
	| 'author_url'
	| 'author_avatar_asset_id'
	| 'traduzed_by'
	| 'robots_advanced'
	| 'sitemap_priority'
	| 'sitemap_changefreq'
	| 'search_vector'
	| 'breadcrumbs'
	| 'main_entity_of_page'
	| 'is_accessible_for_free'
	| 'in_language'
	| 'license'
	| 'cover_asset_id'
	| 'og_image_asset_id'
	| 'og_title'
	| 'og_description'
	| 'og_type'
	| 'twitter_card'
	| 'twitter_site'
	| 'twitter_creator'
	| 'image_meta'
	| 'priority_image'
	| 'funding_disclosure'
	| 'conflicts_of_interest'
	| 'article_section'
	| 'faq'
	| 'citations'
	| 'entities'
	| 'topics'
	| 'chunk_hints'
	| 'embedding_vector_id'
	| 'content_version'
	| 'content_hash'
	| 'reading_time_minutes'
	| 'word_count'

type ArticleMetadataState = Record<ArticleMetadataKey, string>

type MetadataFieldConfig = {
	name: ArticleMetadataKey
	label: string
	type: MetadataFieldType
	hint?: string
	options?: Array<{ value: string; label: string }>
	required?: boolean
	readOnly?: boolean
	hidden?: boolean
	multiple?: boolean
	placeholder?: string
}

const LIST_FIELDS: ArticleMetadataKey[] = ['tag_ids', 'article_tags', 'related_post_slugs', 'entities', 'topics']
const JSON_FIELDS: ArticleMetadataKey[] = ['alternate_locales', 'breadcrumbs', 'image_meta', 'faq', 'citations', 'chunk_hints']
const BOOLEAN_FIELDS: ArticleMetadataKey[] = ['is_accessible_for_free', 'priority_image']
const NUMBER_FIELDS: ArticleMetadataKey[] = ['sitemap_priority', 'series_order', 'reading_time_minutes', 'word_count']
const DATE_FIELDS: ArticleMetadataKey[] = ['date', 'lastmod', 'updated_at']
type JsonEditorItem = Record<string, string>

type JsonEditorFieldConfig = {
	addButtonLabel: string
	emptyLabel: string
	itemLabel: string
	fields: Array<{ key: string; label: string; placeholder: string; type?: 'textarea' }>
	exampleItems: JsonEditorItem[]
	deserialize: (value: string) => JsonEditorItem[]
	serialize: (items: JsonEditorItem[]) => string
	formatSummary: (item: JsonEditorItem) => string
}

type JsonEditorState = {
	field: ArticleMetadataKey
	items: JsonEditorItem[]
}

const JSON_FIELD_CONFIG: Partial<Record<ArticleMetadataKey, JsonEditorFieldConfig>> = {
	alternate_locales: {
		addButtonLabel: 'Adicionar tradução',
		emptyLabel: 'Nenhuma tradução adicionada. Locale padrão pt-BR.',
		itemLabel: 'Tradução',
		fields: [{ key: 'slug', label: 'Slug destino', placeholder: '/blog/post/exemplo' }],
		exampleItems: [{ slug: '/blog/post/exemplo' }],
		deserialize: (value) => {
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						slug: typeof item?.slug === 'string' ? item.slug : ''
					}))
				}
			} catch {
				// ignore parsing errors and use example
			}
			return []
		},
		serialize: (items) => {
			const normalized = items
				.map((item) => ({
					slug: item.slug?.trim() ?? ''
				}))
				.filter((item) => item.slug)
			if (normalized.length === 0) {
				return ''
			}
			return JSON.stringify(
				normalized.map((item) => ({
					locale: DEFAULT_LANGUAGE,
					slug: item.slug
				})),
				null,
				2
			)
		},
		formatSummary: (item) => `${DEFAULT_LANGUAGE} → ${item.slug || '/slug'}`
	},
	faq: {
		addButtonLabel: 'Adicionar FAQ',
		emptyLabel: 'Nenhuma pergunta frequente adicionada.',
		itemLabel: 'FAQ',
		fields: [
			{ key: 'question', label: 'Pergunta', placeholder: 'Qual a dúvida mais comum?' },
			{ key: 'answer', label: 'Resposta', placeholder: 'Explique a resposta em até três frases.', type: 'textarea' }
		],
		exampleItems: [
			{
				question: 'Como funcionam os perfis de drywall?',
				answer: 'Explique de forma clara o funcionamento e aplicações em até três frases.'
			}
		],
		deserialize: (value) => {
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						question: typeof item?.question === 'string' ? item.question : '',
						answer: typeof item?.answer === 'string' ? item.answer : ''
					}))
				}
			} catch {
				// ignore parsing errors
			}
			return []
		},
		serialize: (items) => {
			const normalized = items
				.map((item) => ({
					question: item.question?.trim() ?? '',
					answer: item.answer?.trim() ?? ''
				}))
				.filter((item) => item.question && item.answer)
			return normalized.length > 0 ? JSON.stringify(normalized, null, 2) : ''
		},
		formatSummary: (item) => `Q: ${item.question || 'Pergunta'}`
	},
	citations: {
		addButtonLabel: 'Adicionar citação',
		emptyLabel: 'Nenhuma citação cadastrada.',
		itemLabel: 'Citação',
		fields: [
			{ key: 'title', label: 'Título da fonte', placeholder: 'Manual técnico de drywall' },
			{ key: 'url', label: 'URL', placeholder: 'https://exemplo.com/artigo' },
			{ key: 'author', label: 'Autor', placeholder: 'Nome do autor' },
			{ key: 'year', label: 'Ano', placeholder: '2024' }
		],
		exampleItems: [
			{
				title: 'Guia técnico de drywall',
				url: 'https://exemplo.com/drywall',
				author: 'Equipe Nova Metálica',
				year: '2024'
			}
		],
		deserialize: (value) => {
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						title: typeof item?.title === 'string' ? item.title : '',
						url: typeof item?.url === 'string' ? item.url : '',
						author: typeof item?.author === 'string' ? item.author : '',
						year: typeof item?.year === 'string' ? item.year : ''
					}))
				}
			} catch {
				// ignore
			}
			return []
		},
		serialize: (items) => {
			const normalized = items
				.map((item) => ({
					title: item.title?.trim() ?? '',
					url: item.url?.trim() ?? '',
					author: item.author?.trim() ?? '',
					year: item.year?.trim() ?? ''
				}))
				.filter((item) => item.title && item.url)
			return normalized.length > 0 ? JSON.stringify(normalized, null, 2) : ''
		},
		formatSummary: (item) => `${item.title || 'Citação'} (${item.year || 'ano?'})`
	},
	chunk_hints: {
		addButtonLabel: 'Adicionar hint de chunk',
		emptyLabel: 'Nenhuma dica de chunk cadastrada.',
		itemLabel: 'Hint',
		fields: [
			{ key: 'id', label: 'ID do bloco', placeholder: 'introducao' },
			{ key: 'summary', label: 'Resumo', placeholder: 'Resumo breve do bloco.', type: 'textarea' },
			{ key: 'keywords', label: 'Palavras-chave', placeholder: 'separe por vírgula' }
		],
		exampleItems: [
			{
				id: 'introducao',
				summary: 'Contextualiza o tema e prepara o leitor para a solução.',
				keywords: 'drywall, introdução'
			}
		],
		deserialize: (value) => {
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						id: typeof item?.id === 'string' ? item.id : '',
						summary: typeof item?.summary === 'string' ? item.summary : '',
						keywords: Array.isArray(item?.keywords)
							? item.keywords.filter((kw: unknown): kw is string => typeof kw === 'string').join(', ')
							: typeof item?.keywords === 'string'
							  ? item.keywords
							  : ''
					}))
				}
			} catch {
				// ignore
			}
			return []
		},
		serialize: (items) => {
			const normalized = items
				.map((item) => ({
					id: item.id?.trim() ?? '',
					summary: item.summary?.trim() ?? '',
					keywords: (item.keywords ?? '')
						.split(',')
						.map((keyword) => keyword.trim())
						.filter(Boolean)
				}))
				.filter((item) => item.id && item.summary)
			return normalized.length > 0 ? JSON.stringify(normalized, null, 2) : ''
		},
		formatSummary: (item) => `#${item.id || 'chunk'} (${item.summary?.slice(0, 24) || 'Resumo'})`
	}
}

function createEmptyJsonItem(config: JsonEditorFieldConfig): JsonEditorItem {
	const item: JsonEditorItem = {}
	for (const field of config.fields) {
		item[field.key] = ''
	}
	return item
}

const DEFAULT_METADATA_STATE: ArticleMetadataState = {
	site_id: SITE_ID,
	date: '',
	lastmod: '',
	updated_at: '',
	permalink: '',
	category: '',
	tag_ids: '',
	article_tags: '',
	related_post_slugs: '',
	series_slug: '',
	series_order: '',
	translated_from_id: '',
	alternate_locales: '',
	author: '',
	author_slug: '',
	author_url: '',
	author_avatar_asset_id: '',
	traduzed_by: '',
	robots_advanced: 'index,follow',
	sitemap_priority: DEFAULT_SITEMAP_PRIORITY,
	sitemap_changefreq: DEFAULT_SITEMAP_CHANGEFREQ,
	search_vector: '',
	breadcrumbs: '',
	main_entity_of_page: '',
	is_accessible_for_free: 'true',
	in_language: DEFAULT_LANGUAGE,
	license: DEFAULT_LICENSE,
	cover_asset_id: '',
	og_image_asset_id: '',
	og_title: '',
	og_description: '',
	og_type: 'article',
	twitter_card: 'summary_large_image',
	twitter_site: '',
	twitter_creator: '',
	image_meta: '',
	priority_image: 'true',
	funding_disclosure: DEFAULT_FUNDING_DISCLOSURE,
	conflicts_of_interest: DEFAULT_CONFLICTS_OF_INTEREST,
	article_section: '',
	faq: '',
	citations: '',
	entities: '',
	topics: '',
	chunk_hints: '',
	embedding_vector_id: '',
	content_version: '',
	content_hash: '',
	reading_time_minutes: '',
	word_count: ''
}

function createDefaultMetadataState(): ArticleMetadataState {
	const today = new Date().toISOString().split('T')[0]
	return {
		...DEFAULT_METADATA_STATE,
		date: today,
		lastmod: today,
		updated_at: today,
		content_version: generateContentVersion()
	}
}

const METADATA_SECTIONS: Array<{ title: string; description?: string; fields: MetadataFieldConfig[] }> = [
	{
		title: 'Publicação',
		description: 'Campos obrigatórios para o frontmatter do Contentlayer.',
		fields: [
			{ name: 'site_id', label: 'Site ID', type: 'text', hidden: true },
			{ name: 'date', label: 'Data de publicação', type: 'date', hidden: true },
			{ name: 'lastmod', label: 'Última modificação', type: 'date', hidden: true },
			{ name: 'updated_at', label: 'Atualizado em', type: 'date', hidden: true },
			{ name: 'permalink', label: 'Permalink', type: 'text', hidden: true },
			{ name: 'category', label: 'Categoria (slug)', type: 'text', hidden: true }
		]
	},
	{
		title: '',
		fields: [
			{
				name: 'tag_ids',
				label: 'Tag IDs',
				type: 'list',
				hint: 'Use Enter para adicionar cada tag (ex: drywall, acustica).',
				hidden: true
			},
			{
				name: 'article_tags',
				label: 'Tags semânticas',
				type: 'list',
				hint: 'Tags de exibição. Digite uma por linha.',
				hidden: true
			},
			{
				name: 'related_post_slugs',
				label: 'Slugs relacionados',
				type: 'list',
				hint: 'Opcional. Use um slug por linha, sem o prefixo /. Ex: curso-drywall-avancado',
				placeholder: 'Ex: guia-instalacao-drywall'
			},
			{
				name: 'series_slug',
				label: 'Slug da série',
				type: 'text',
				hint: 'Opcional. Informe o slug da série caso o artigo faça parte de uma.',
				placeholder: 'Ex: serie-solucoes-acusticas'
			},
			{
				name: 'series_order',
				label: 'Ordem na série',
				type: 'number',
				hint: 'Opcional. Posição do artigo dentro da série.',
				placeholder: 'Ex: 2'
			},
			{
				name: 'translated_from_id',
				label: 'ID da versão original',
				type: 'text',
				hint: 'Opcional. Informe o ID/slug do artigo original caso seja tradução.',
				placeholder: 'Ex: artigo-original-uuid'
			},
			{
				name: 'alternate_locales',
				label: 'Traduções (JSON)',
				type: 'json',
				hint: 'Locale fixo em pt-BR. Informe apenas o slug de destino com o assistente.'
			}
		]
	},
	{
		title: 'Autor & Atribuição',
		fields: [
			{ name: 'author', label: 'Autor exibido', type: 'text', hidden: true },
			{ name: 'author_slug', label: 'Slug do autor', type: 'text', hidden: true },
			{ name: 'author_url', label: 'URL do autor', type: 'text', hidden: true },
			{ name: 'author_avatar_asset_id', label: 'Asset do avatar', type: 'text', hidden: true },
			{
				name: 'traduzed_by',
				label: 'Traduzido por',
				type: 'select',
				hint: 'Selecione o responsável pela tradução ou mantenha como não traduzido.'
			}
		]
	},
	{
		title: 'SEO avançado',
		fields: [
			{ name: 'search_vector', label: 'Search vector', type: 'textarea', hidden: true },
			{
				name: 'robots_advanced',
				label: 'Robots avançado',
				type: 'text',
				hint: 'Mantido fixo como index,follow',
				hidden: true
			},
			{ name: 'sitemap_priority', label: 'Prioridade sitemap', type: 'number', hidden: true },
			{
				name: 'sitemap_changefreq',
				label: 'Frequência sitemap',
				type: 'select',
				options: [
					{ value: '', label: 'Não definir' },
					{ value: 'always', label: 'Sempre' },
					{ value: 'hourly', label: 'De hora em hora' },
					{ value: 'daily', label: 'Diariamente' },
					{ value: 'weekly', label: 'Semanalmente' },
					{ value: 'monthly', label: 'Mensalmente' },
					{ value: 'yearly', label: 'Anualmente' },
					{ value: 'never', label: 'Nunca' }
				],
				hidden: true
			},
			{
				name: 'breadcrumbs',
				label: 'Breadcrumbs (JSON)',
				type: 'json',
				hint: 'Array com objetos { label, url }. Gerado automaticamente.',
				hidden: true
			},
			{ name: 'main_entity_of_page', label: 'Main entity of page', type: 'text', hidden: true },
			{ name: 'is_accessible_for_free', label: 'Conteúdo acessível gratuitamente', type: 'boolean', hidden: true },
			{ name: 'in_language', label: 'Idioma schema', type: 'text', hidden: true },
			{ name: 'license', label: 'Licença', type: 'text', hidden: true }
		]
	},
	{
		title: 'Mídia & Social',
		fields: [
			{ name: 'cover_asset_id', label: 'Asset da capa', type: 'text', hidden: true },
			{ name: 'og_image_asset_id', label: 'Asset OG', type: 'text', hidden: true },
			{ name: 'og_title', label: 'Título OG', type: 'text', hidden: true },
			{ name: 'og_description', label: 'Descrição OG', type: 'textarea', hidden: true },
			{
				name: 'og_type',
				label: 'Tipo OG',
				type: 'select',
				options: [
					{ value: '', label: 'Não definir' },
					{ value: 'article', label: 'Article' },
					{ value: 'website', label: 'Website' }
				],
				hidden: true
			},
			{
				name: 'twitter_card',
				label: 'Twitter card',
				type: 'select',
				options: [
					{ value: '', label: 'Não definir' },
					{ value: 'summary', label: 'Summary' },
					{ value: 'summary_large_image', label: 'Summary large image' }
				],
				hidden: true
			},
			{ name: 'twitter_site', label: '@site', type: 'text', hidden: true },
			{ name: 'twitter_creator', label: '@creator', type: 'text', hidden: true },
			{ name: 'image_meta', label: 'Metadados da imagem (JSON)', type: 'json', hidden: true },
			{ name: 'priority_image', label: 'Imagem com prioridade', type: 'boolean', hidden: true }
		]
	},
	{
		title: 'Transparência & Conteúdo',
		fields: [
			{ name: 'funding_disclosure', label: 'Disclosure de financiamento', type: 'textarea', hidden: true },
			{ name: 'conflicts_of_interest', label: 'Conflitos de interesse', type: 'textarea', hidden: true },
			{ name: 'article_section', label: 'Seção do artigo', type: 'text', hidden: true },
			{ name: 'faq', label: 'FAQ (JSON)', type: 'json', hint: 'Array de objetos { question, answer }.' },
			{ name: 'citations', label: 'Citações (JSON)', type: 'json' },
			{
				name: 'entities',
				label: 'Entidades',
				type: 'select',
				multiple: true,
				hint: 'Selecione as entidades citadas no conteúdo.',
				options: [
					{ value: 'ABNT', label: 'ABNT' },
					{ value: 'Associação Brasileira de Drywall', label: 'Associação Brasileira de Drywall' },
					{ value: 'Nova Metálica', label: 'Nova Metálica' },
					{ value: 'Sinduscon', label: 'Sinduscon' },
					{ value: 'CREA', label: 'CREA' },
					{ value: 'CAU', label: 'CAU' },
					{ value: 'Norma NBR 15253', label: 'Norma NBR 15253' }
				]
			},
			{ name: 'topics', label: 'Tópicos', type: 'list', hint: 'Um tópico por linha', hidden: true },
			{ name: 'chunk_hints', label: 'Chunk hints (JSON)', type: 'json' },
			{
				name: 'embedding_vector_id',
				label: 'Embedding vector ID',
				type: 'select',
				hint: 'Escolha o conjunto de embeddings utilizado para buscas semânticas.',
				options: [
					{ value: '', label: 'Gerenciar automaticamente' },
					{ value: 'vector-ptbr-v1', label: 'vector-ptbr-v1 (Português)' },
					{ value: 'vector-multilingual-v2', label: 'vector-multilingual-v2' },
					{ value: 'vector-en-v1', label: 'vector-en-v1 (Inglês)' }
				]
			}
		]
	},
	{
		title: 'Versão & Métricas',
		fields: [
			{ name: 'content_version', label: 'Versão do conteúdo', type: 'text', hidden: true },
			{ name: 'content_hash', label: 'Hash SHA-256', type: 'text', hidden: true, readOnly: true },
			{ name: 'reading_time_minutes', label: 'Tempo de leitura (min)', type: 'number', hidden: true, readOnly: true },
			{ name: 'word_count', label: 'Contagem de palavras', type: 'number', hidden: true, readOnly: true }
		]
	}
]

function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}

async function computeContentHash(content: string): Promise<string> {
	if (typeof window !== 'undefined' && window.crypto?.subtle) {
		const buffer = new TextEncoder().encode(content)
		const digest = await window.crypto.subtle.digest('SHA-256', buffer)
		return Array.from(new Uint8Array(digest))
			.map((value) => value.toString(16).padStart(2, '0'))
			.join('')
	}

	return ''
}

type ArticleFormState = {
	title: string
	slug: string
	subtitle: string
	excerpt: string
	content: string
	content_html: string
	status: Article['status']
	category_id: string
	author_id: string
	cover_image: string
	seo_title: string
	seo_description: string
	canonical_url: string
	og_image: string
	robots_index: 'index' | 'noindex'
	robots_follow: 'follow' | 'nofollow'
	tags: string
	lang: string
	cover_blurhash: string
	cover_dominant_color: string
	reviewed_by: string
	reviewer_id: string
	reviewer_credentials: string
	fact_checked: boolean
	tldr: string
	key_takeaways: string[]
	metadata: ArticleMetadataState
	published_at: string | null
}

type ArticleFormProps = {
	articleId?: string
	onClose: (shouldReload?: boolean) => void
	showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

type ArticleWithRelations = Article & {
	author?: Author | null
	category?: Category | null
}

export function ArticleForm({ articleId, onClose, showToast }: ArticleFormProps) {
	const [formState, setFormState] = useState<ArticleFormState>(() => ({
		title: '',
		slug: '',
		subtitle: '',
		excerpt: '',
		content: '',
		content_html: '',
		status: 'draft',
		category_id: '',
		author_id: '',
		cover_image: '',
		seo_title: '',
		seo_description: '',
		canonical_url: '',
		og_image: '',
		robots_index: 'index',
		robots_follow: 'follow',
		tags: '',
		lang: DEFAULT_LANGUAGE,
		cover_blurhash: '',
		cover_dominant_color: DEFAULT_DOMINANT_COLOR,
		reviewed_by: '',
		reviewer_id: '',
		reviewer_credentials: '',
		fact_checked: true,
		tldr: '',
		key_takeaways: [],
		metadata: createDefaultMetadataState(),
		published_at: null
	}))
	const [categories, setCategories] = useState<Category[]>([])
	const [authors, setAuthors] = useState<Author[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [blurhashMode, setBlurhashMode] = useState<'auto' | 'manual'>('auto')
	const [keyTakeawayInput, setKeyTakeawayInput] = useState('')
	const [showSocialFields, setShowSocialFields] = useState(false)
	const [jsonEditorState, setJsonEditorState] = useState<JsonEditorState | null>(null)
	const [docImporting, setDocImporting] = useState(false)
	const [docImportError, setDocImportError] = useState<string | null>(null)
	const docInputRef = useRef<HTMLInputElement | null>(null)
	const previousStatusRef = useRef<Article['status']>('draft')

	const selectedAuthor = useMemo(
		() => authors.find((author) => author.id === formState.author_id) ?? null,
		[authors, formState.author_id]
	)
	const selectedCategory = useMemo(
		() => categories.find((category) => category.id === formState.category_id) ?? null,
		[categories, formState.category_id]
	)

	function buildDefaultTranslationSlug(): string {
		const rawSlug = formState.slug.trim()
		if (!rawSlug) {
			return ''
		}
		if (rawSlug.startsWith('/')) {
			return rawSlug
		}
		if (rawSlug.startsWith('blog/')) {
			return `/${rawSlug}`
		}
		return `/blog/post/${rawSlug}`
	}

	useEffect(() => {
		void loadLookups()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [articleId])

	useEffect(() => {
		setJsonEditorState(null)
		if (!articleId) {
			setShowSocialFields(false)
		}
	}, [articleId])

	useEffect(() => {
		setFormState((prev) => {
			const nextMetadata = { ...prev.metadata }
			let changed = false

			if (selectedAuthor) {
				if (nextMetadata.author !== selectedAuthor.name) {
					nextMetadata.author = selectedAuthor.name
					changed = true
				}
				if (nextMetadata.author_slug !== selectedAuthor.slug) {
					nextMetadata.author_slug = selectedAuthor.slug
					changed = true
				}
				const authorUrl = selectedAuthor.website ?? ''
				if (nextMetadata.author_url !== authorUrl) {
					nextMetadata.author_url = authorUrl
					changed = true
				}
				const authorAvatar = selectedAuthor.avatar_url ?? ''
				if (nextMetadata.author_avatar_asset_id !== authorAvatar) {
					nextMetadata.author_avatar_asset_id = authorAvatar
					changed = true
				}
			}

			if (selectedCategory) {
				if (nextMetadata.category !== selectedCategory.slug) {
					nextMetadata.category = selectedCategory.slug
					changed = true
				}
			} else if (nextMetadata.category) {
				nextMetadata.category = ''
				changed = true
			}

			if (nextMetadata.in_language !== DEFAULT_LANGUAGE) {
				nextMetadata.in_language = DEFAULT_LANGUAGE
				changed = true
			}

			if (nextMetadata.site_id !== SITE_ID) {
				nextMetadata.site_id = SITE_ID
				changed = true
			}

			return changed ? { ...prev, metadata: nextMetadata } : prev
		})
	}, [selectedAuthor, selectedCategory])

	useEffect(() => {
		if (previousStatusRef.current === formState.status) {
			return
		}

		if (formState.status === 'published') {
			const today = new Date().toISOString().split('T')[0]
			setFormState((prev) => {
				const nextMetadata = { ...prev.metadata }
				let changed = false

				if (nextMetadata.date !== today) {
					nextMetadata.date = today
					changed = true
				}
				if (nextMetadata.lastmod !== today) {
					nextMetadata.lastmod = today
					changed = true
				}
				if (nextMetadata.updated_at !== today) {
					nextMetadata.updated_at = today
					changed = true
				}

				const nextState: ArticleFormState = changed ? { ...prev, metadata: nextMetadata } : prev
				if (!nextState.published_at) {
					return {
						...nextState,
						published_at: new Date().toISOString()
					}
				}

				return nextState
			})
		} else if (previousStatusRef.current === 'published') {
			setFormState((prev) => (prev.published_at ? { ...prev, published_at: null } : prev))
		}

		previousStatusRef.current = formState.status
	}, [formState.status])

	useEffect(() => {
		const normalized = formState.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
			.join('\n')

		if (!normalized) {
			return
		}

		setFormState((prev) => {
			const nextMetadata = { ...prev.metadata }
			let changed = false

			if (nextMetadata.tag_ids !== normalized) {
				nextMetadata.tag_ids = normalized
				changed = true
			}

			if (!nextMetadata.article_tags) {
				nextMetadata.article_tags = normalized
				changed = true
			}

			return changed ? { ...prev, metadata: nextMetadata } : prev
		})
	}, [formState.tags])

	useEffect(() => {
		const generatedSlug = slugify(formState.title || '')
		setFormState((prev) => {
			if (prev.slug === generatedSlug) {
				return prev
			}
			return {
				...prev,
				slug: generatedSlug
			}
		})
	}, [formState.title])

	useEffect(() => {
		const slug = formState.slug
		const canonicalUrl = slug ? `${CANONICAL_BASE_URL}${slug}` : ''
		const permalink = slug ? `/blog/post/${slug}` : ''

		setFormState((prev) => {
			const nextMetadata = { ...prev.metadata }
			let changed = false

			if (prev.canonical_url !== canonicalUrl) {
				changed = true
			}

			if (nextMetadata.permalink !== permalink) {
				nextMetadata.permalink = permalink
				changed = true
			}

			if (!changed) {
				return prev
			}

			return {
				...prev,
				canonical_url: canonicalUrl,
				metadata: nextMetadata
			}
		})
	}, [formState.slug])

	useEffect(() => {
		setFormState((prev) => {
			let stateChanged = false
			let metadataChanged = false
			const nextState = { ...prev }
			let nextMetadata = prev.metadata

			const ensureMetadataValue = (key: ArticleMetadataKey, value: string) => {
				if (nextMetadata[key] !== value) {
					if (!metadataChanged) {
						nextMetadata = { ...nextMetadata }
						metadataChanged = true
					}
					nextMetadata[key] = value
				}
			}

			const desiredSeoTitle = prev.title || ''
			const desiredSeoDescription = prev.excerpt || ''
			const desiredTldr = desiredSeoDescription
			const desiredCoverAsset = prev.cover_image || ''
			const generatedImageMeta = desiredCoverAsset ? buildImageMeta(desiredCoverAsset) : ''

			if (prev.seo_title !== desiredSeoTitle) {
				nextState.seo_title = desiredSeoTitle
				stateChanged = true
			}

			if (prev.seo_description !== desiredSeoDescription) {
				nextState.seo_description = desiredSeoDescription
				stateChanged = true
			}

			if (prev.tldr !== desiredTldr) {
				nextState.tldr = desiredTldr
				stateChanged = true
			}

			if (prev.og_image !== desiredCoverAsset) {
				nextState.og_image = desiredCoverAsset
				stateChanged = true
			}

			ensureMetadataValue('og_title', desiredSeoTitle)
			ensureMetadataValue('og_description', desiredSeoDescription)
			ensureMetadataValue('og_type', 'article')
			ensureMetadataValue('twitter_card', 'summary_large_image')
			ensureMetadataValue('is_accessible_for_free', 'true')
			ensureMetadataValue('robots_advanced', 'index,follow')
			ensureMetadataValue('og_image_asset_id', desiredCoverAsset)
			ensureMetadataValue('cover_asset_id', desiredCoverAsset)
			ensureMetadataValue('site_id', SITE_ID)
			ensureMetadataValue('sitemap_priority', DEFAULT_SITEMAP_PRIORITY)
			ensureMetadataValue('sitemap_changefreq', DEFAULT_SITEMAP_CHANGEFREQ)
			ensureMetadataValue('in_language', DEFAULT_LANGUAGE)
			ensureMetadataValue('priority_image', 'true')
			ensureMetadataValue('funding_disclosure', DEFAULT_FUNDING_DISCLOSURE)
			ensureMetadataValue('conflicts_of_interest', DEFAULT_CONFLICTS_OF_INTEREST)
			ensureMetadataValue('license', DEFAULT_LICENSE)

			if (generatedImageMeta) {
				if (nextMetadata.image_meta !== generatedImageMeta) {
					nextMetadata.image_meta = generatedImageMeta
					metadataChanged = true
				}
			} else if (nextMetadata.image_meta) {
				nextMetadata.image_meta = ''
				metadataChanged = true
			}

			if (!metadataChanged && !stateChanged) {
				return prev
			}

			return {
				...nextState,
				metadata: metadataChanged ? nextMetadata : nextState.metadata
			}
		})
	}, [formState.cover_image, formState.excerpt, formState.title])

	useEffect(() => {
		setFormState((prev) => {
			let metadataChanged = false
			let nextMetadata = prev.metadata

			const ensureMetadataValue = (key: ArticleMetadataKey, value: string) => {
				if (nextMetadata[key] !== value) {
					if (!metadataChanged) {
						nextMetadata = { ...nextMetadata }
						metadataChanged = true
					}
					nextMetadata[key] = value
				}
			}

			const searchVectorValue = [prev.title, prev.subtitle, prev.excerpt, prev.tags]
				.filter(Boolean)
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()
			ensureMetadataValue('search_vector', searchVectorValue)

			const mainEntity = prev.canonical_url || ''
			ensureMetadataValue('main_entity_of_page', mainEntity)

			const categoryTitle = selectedCategory?.title ?? ''
			ensureMetadataValue('article_section', categoryTitle)

			const topicsFromTags = prev.tags
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean)
				.join('\n')
			ensureMetadataValue('topics', topicsFromTags)

			const articleSlug = prev.slug
			const categorySlug = selectedCategory?.slug ?? ''
			let breadcrumbsValue = ''
			if (articleSlug) {
				const items: Array<{ label: string; url: string }> = [{ label: 'Blog', url: '/blog' }]
				if (categorySlug) {
					items.push({ label: categoryTitle || categorySlug, url: `/blog/${categorySlug}` })
				}
				items.push({
					label: prev.title || categoryTitle || 'Artigo',
					url: `/blog/post/${articleSlug}`
				})
				breadcrumbsValue = JSON.stringify(items, null, 2)
			}
			ensureMetadataValue('breadcrumbs', breadcrumbsValue)

			if (!metadataChanged) {
				return prev
			}

			return {
				...prev,
				metadata: nextMetadata
			}
		})
	}, [formState.canonical_url, formState.excerpt, formState.slug, formState.subtitle, formState.tags, formState.title, selectedCategory])

	async function loadLookups() {
		try {
			setLoading(true)
			const [categoriesResponse, authorsResponse] = await Promise.all([
				adminFetch('/api/categories'),
				adminFetch('/api/authors')
			])

			if (!categoriesResponse.ok || !authorsResponse.ok) {
				throw new Error('Erro ao carregar dados auxiliares.')
			}

			const categoriesData = (await categoriesResponse.json()) as Category[]
			const authorsData = (await authorsResponse.json()) as Author[]

			setCategories(categoriesData)
			setAuthors(authorsData)

			if (articleId) {
				await loadArticle(articleId, categoriesData, authorsData)
			}
		} catch (error) {
			console.error(error)
			showToast('Erro ao carregar dados do formulário.', 'error')
		} finally {
			setLoading(false)
		}
	}

	async function loadArticle(id: string, loadedCategories: Category[], loadedAuthors: Author[]) {
		const response = await adminFetch(`/api/articles/${id}`)
		if (!response.ok) {
			throw new Error('Erro ao carregar dados do artigo.')
		}

		const data = (await response.json()) as ArticleWithRelations
		const metadata = createDefaultMetadataState()
		const rawMeta = (data.contentlayer_meta ?? {}) as Partial<Record<ArticleMetadataKey, unknown>>

		for (const key of Object.keys(metadata) as ArticleMetadataKey[]) {
			const value = rawMeta[key]

			if (value === undefined || value === null || value === '') {
				continue
			}

			if (LIST_FIELDS.includes(key)) {
				if (Array.isArray(value)) {
					metadata[key] = value.join('\n')
				} else if (typeof value === 'string') {
					metadata[key] = value
				}
				continue
			}

			if (JSON_FIELDS.includes(key)) {
				metadata[key] = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
				continue
			}

			if (BOOLEAN_FIELDS.includes(key)) {
				metadata[key] = String(Boolean(value))
				continue
			}

			if (NUMBER_FIELDS.includes(key)) {
				if (typeof value === 'number' && !Number.isNaN(value)) {
					metadata[key] = value.toString()
				} else if (typeof value === 'string' && value.trim() !== '') {
					metadata[key] = value
				}
				continue
			}

			if (DATE_FIELDS.includes(key)) {
				const stringValue = typeof value === 'string' ? value : String(value)
				metadata[key] = stringValue.split('T')[0]
				continue
			}

			metadata[key] = String(value)
		}

		if (data.author?.name && !metadata.author) {
			metadata.author = data.author.name
		}

		if (data.author?.slug && !metadata.author_slug) {
			metadata.author_slug = data.author.slug
		}

		if (data.author?.website && !metadata.author_url) {
			metadata.author_url = data.author.website
		}

		if (data.author?.avatar_url && !metadata.author_avatar_asset_id) {
			metadata.author_avatar_asset_id = data.author.avatar_url
		}

		const categoryFromRelation =
			data.category?.slug ?? loadedCategories.find((category) => category.id === data.category_id)?.slug
		if (categoryFromRelation && !metadata.category) {
			metadata.category = categoryFromRelation
		}

		if (!metadata.in_language && data.lang) {
			metadata.in_language = data.lang
		}

		const tagsArray = Array.isArray(data.tags) ? data.tags : []
		if (tagsArray.length > 0 && !metadata.tag_ids) {
			metadata.tag_ids = tagsArray.join('\n')
		}
		if (tagsArray.length > 0 && !metadata.article_tags) {
			metadata.article_tags = tagsArray.join('\n')
		}

		if (!metadata.date && data.published_at) {
			metadata.date = data.published_at.split('T')[0]
		}

		if (!metadata.lastmod && data.updated_at) {
			metadata.lastmod = data.updated_at.split('T')[0]
		}

		if (!metadata.updated_at && data.updated_at) {
			metadata.updated_at = data.updated_at.split('T')[0]
		}

		if (!metadata.cover_asset_id && data.cover_image) {
			metadata.cover_asset_id = data.cover_image
		}

		if (!metadata.og_image_asset_id && data.og_image) {
			metadata.og_image_asset_id = data.og_image
		}

		if (metadata.priority_image !== 'true') {
			metadata.priority_image = 'true'
		}

		if (metadata.cover_asset_id) {
			const generatedMeta = buildImageMeta(metadata.cover_asset_id)
			if (generatedMeta && metadata.image_meta !== generatedMeta) {
				metadata.image_meta = generatedMeta
			}
		}

		const rawMdx = typeof data.raw_mdx === 'string' ? data.raw_mdx.trim() : ''
		const processedHtml = typeof data.processed_mdx === 'string' ? data.processed_mdx.trim() : ''
		const legacyContent = typeof data.content === 'string' ? data.content.trim() : ''
		const legacyLooksLikeHtml = legacyContent ? /<\s*[a-z][^>]*>/i.test(legacyContent) : false
		const baseContent = rawMdx
			|| (legacyContent && !legacyLooksLikeHtml ? legacyContent : '')
			|| (processedHtml ? htmlToMdx(processedHtml) : '')
			|| legacyContent
		const baseHtml = processedHtml
			|| (legacyLooksLikeHtml ? legacyContent : '')
			|| mdxToHtml(baseContent)
		const contentMetrics = computeContentMetrics(baseContent)
		metadata.reading_time_minutes = String(contentMetrics.readingMinutes)
		metadata.word_count = String(contentMetrics.wordCount)

		if (!metadata.content_version) {
			metadata.content_version = generateContentVersion()
		}

		if (!metadata.license) {
			metadata.license = DEFAULT_LICENSE
		}

		if (!metadata.funding_disclosure) {
			metadata.funding_disclosure = DEFAULT_FUNDING_DISCLOSURE
		}

		if (!metadata.conflicts_of_interest) {
			metadata.conflicts_of_interest = DEFAULT_CONFLICTS_OF_INTEREST
		}

		const reviewerMatch = loadedAuthors.find((author) => author.name === data.reviewed_by)

		setFormState({
			title: data.title ?? '',
			slug: data.slug ?? '',
			subtitle: data.subtitle ?? '',
			excerpt: data.excerpt ?? '',
			content: baseContent,
			content_html: baseHtml,
			status: data.status ?? 'draft',
			category_id: data.category_id ?? '',
			author_id: data.author_id ?? '',
			cover_image: data.cover_image ?? data.og_image ?? '',
			seo_title: data.seo_title ?? data.title ?? '',
			seo_description: data.seo_description ?? data.excerpt ?? '',
			canonical_url: data.canonical_url ?? '',
			og_image: data.og_image ?? data.cover_image ?? '',
			robots_index: 'index',
			robots_follow: 'follow',
			tags: tagsArray.join(', '),
			lang: DEFAULT_LANGUAGE,
			cover_blurhash: data.cover_blurhash ?? '',
			cover_dominant_color: DEFAULT_DOMINANT_COLOR,
			reviewed_by: data.reviewed_by ?? reviewerMatch?.name ?? '',
			reviewer_id: reviewerMatch?.id ?? '',
			reviewer_credentials: data.reviewer_credentials ?? reviewerMatch?.credentials ?? '',
			fact_checked: true,
			tldr: data.tldr ?? data.excerpt ?? '',
			key_takeaways: Array.isArray(data.key_takeaways)
				? data.key_takeaways
					.filter((item): item is string => typeof item === 'string')
					.map((item) => item.trim())
					.filter(Boolean)
				: [],
			metadata,
			published_at: data.published_at ?? null
		})

		setBlurhashMode(data.cover_blurhash ? 'manual' : 'auto')
		setKeyTakeawayInput('')
		setShowSocialFields(Boolean(metadata.twitter_site || metadata.twitter_creator))
		previousStatusRef.current = data.status ?? 'draft'
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		const target = event.target
		const { name, value } = target
		const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'
		const nextValue = isCheckbox ? target.checked : value

		setFormState((prev) => {
			if (name === 'status') {
				return { ...prev, status: value as Article['status'] }
			}
			if (name === 'robots_index' || name === 'robots_follow') {
				return { ...prev, [name]: value }
			}

			return {
				...prev,
				[name]: nextValue
			}
		})
	}

	function handleMetadataChange(name: ArticleMetadataKey, value: string) {
		setFormState((prev) => ({
			...prev,
			metadata: {
				...prev.metadata,
				[name]: value
			}
		}))
	}

	function openJsonEditor(field: ArticleMetadataKey) {
		const config = JSON_FIELD_CONFIG[field]
		if (!config) {
			return
		}

		const currentValue = formState.metadata[field] ?? ''
		const parsedItems = config.deserialize(currentValue)
		let items = parsedItems.length > 0
			? parsedItems.map((item) => ({ ...item }))
			: (config.exampleItems.length > 0
					? config.exampleItems.map((item) => ({ ...item }))
					: [createEmptyJsonItem(config)])

		if (field === 'alternate_locales') {
			const defaultSlug = buildDefaultTranslationSlug()
			if (defaultSlug) {
				items = items.map((item) => ({
					...item,
					slug: item.slug?.trim() ? item.slug : defaultSlug
				}))
			}
		}

		setJsonEditorState({ field, items })
	}

	function closeJsonEditor() {
		setJsonEditorState(null)
	}

	function handleJsonEditorItemChange(index: number, key: string, nextValue: string) {
		setJsonEditorState((prev) => {
			if (!prev) {
				return prev
			}

			const nextItems = prev.items.map((item, itemIndex) => {
				if (itemIndex !== index) {
					return item
				}
				return {
					...item,
					[key]: nextValue
				}
			})

			return {
				field: prev.field,
				items: nextItems
			}
		})
	}

	function handleJsonEditorAddItem() {
		setJsonEditorState((prev) => {
			if (!prev) {
				return prev
			}
			const config = JSON_FIELD_CONFIG[prev.field]
			if (!config) {
				return prev
			}

			const nextItem = createEmptyJsonItem(config)
			if (prev.field === 'alternate_locales') {
				const defaultSlug = buildDefaultTranslationSlug()
				if (defaultSlug && !nextItem.slug) {
					nextItem.slug = defaultSlug
				}
			}

			return {
				field: prev.field,
				items: [...prev.items, nextItem]
			}
		})
	}

	function handleJsonEditorRemoveItem(index: number) {
		setJsonEditorState((prev) => {
			if (!prev) {
				return prev
			}
			const config = JSON_FIELD_CONFIG[prev.field]
			if (!config) {
				return prev
			}
			const nextItems = prev.items.filter((_, itemIndex) => itemIndex !== index)
			return {
				field: prev.field,
				items: nextItems.length > 0 ? nextItems : [createEmptyJsonItem(config)]
			}
		})
	}

	function handleJsonEditorSave() {
		if (!jsonEditorState) {
			return
		}

		const config = JSON_FIELD_CONFIG[jsonEditorState.field]
		if (!config) {
			setJsonEditorState(null)
			return
		}

		const serialized = config.serialize(jsonEditorState.items)
		handleMetadataChange(jsonEditorState.field, serialized)
		setJsonEditorState(null)
	}

	function handleReviewerChange(event: ChangeEvent<HTMLSelectElement>) {
		const reviewerId = event.target.value
		const reviewer = authors.find((author) => author.id === reviewerId) ?? null
		setFormState((prev) => ({
			...prev,
			reviewer_id: reviewerId,
			reviewed_by: reviewer?.name ?? '',
			reviewer_credentials: reviewer?.credentials ?? ''
		}))
	}

	function handleBlurhashModeChange(event: ChangeEvent<HTMLSelectElement>) {
		const mode = (event.target.value as 'auto' | 'manual') || 'auto'
		setBlurhashMode(mode)
		if (mode === 'auto') {
			setFormState((prev) => ({
				...prev,
				cover_blurhash: ''
			}))
		}
	}

	function commitKeyTakeaway(rawValue: string) {
		const normalized = rawValue.trim()
		if (!normalized) {
			return
		}
		setFormState((prev) => {
			const normalizedLower = normalized.toLowerCase()
			if (prev.key_takeaways.some((item) => item.toLowerCase() === normalizedLower)) {
				return prev
			}
			return {
				...prev,
				key_takeaways: [...prev.key_takeaways, normalized]
			}
		})
		setKeyTakeawayInput('')
	}

	function handleKeyTakeawayKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') {
			event.preventDefault()
			commitKeyTakeaway(keyTakeawayInput)
			return
		}

		if (event.key === 'Backspace' && keyTakeawayInput.length === 0) {
			setFormState((prev) => {
				if (prev.key_takeaways.length === 0) {
					return prev
				}
				const nextItems = prev.key_takeaways.slice(0, -1)
				return {
					...prev,
					key_takeaways: nextItems
				}
			})
		}
	}

	function handleRemoveKeyTakeaway(value: string) {
		setFormState((prev) => ({
			...prev,
			key_takeaways: prev.key_takeaways.filter((item) => item !== value)
		}))
	}

	async function importDocFile(file: File) {
		if (file.size > MAX_DOCX_UPLOAD_SIZE) {
			const message = 'O arquivo do Google Docs deve ter no máximo 15 MB.'
			setDocImportError(message)
			showToast(message, 'error')
			if (docInputRef.current) {
				docInputRef.current.value = ''
			}
			return
		}

		if (file.type && !DOC_IMPORT_ACCEPTED_MIME_TYPES.has(file.type)) {
			const message = 'Envie um arquivo .doc ou .docx exportado do Google Docs.'
			setDocImportError(message)
			showToast(message, 'error')
			if (docInputRef.current) {
				docInputRef.current.value = ''
			}
			return
		}

		setDocImportError(null)
		setDocImporting(true)

		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await adminFetch('/api/import/docx', {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				let errorMessage = 'Não foi possível importar o documento do Google Docs.'
				try {
					const errorPayload = await response.json()
					if (errorPayload?.error) {
						errorMessage = String(errorPayload.error)
					}
				} catch {
					// ignore
				}
				throw new Error(errorMessage)
			}

			const payload = (await response.json()) as {
				html?: string
				mdx?: string
				assets?: Array<unknown>
			}

			const mdxContent = typeof payload?.mdx === 'string' ? payload.mdx.trim() : ''
			if (!mdxContent) {
				throw new Error('O documento não possui conteúdo compatível para importação.')
			}

			const htmlContent = typeof payload?.html === 'string' ? payload.html.trim() : mdxToHtml(mdxContent)
			handleEditorChange(mdxContent, htmlContent)

			const importedAssets = Array.isArray(payload.assets) ? payload.assets.length : 0
			if (importedAssets > 0) {
				showToast(`Conteúdo importado! ${importedAssets} imagem(ns) foram salvas automaticamente.`)
			} else {
				showToast('Conteúdo importado do Google Docs!')
			}
		} catch (error) {
			console.error('Google Docs import error:', error)
			const message = error instanceof Error && error.message ? error.message : 'Falha ao importar o documento do Google Docs.'
			setDocImportError(message)
			showToast(message, 'error')
		} finally {
			setDocImporting(false)
			if (docInputRef.current) {
				docInputRef.current.value = ''
			}
		}
	}

	function handleDocFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		if (!file) {
			return
		}
		void importDocFile(file)
	}

	function handleDocImportClick() {
		if (docImporting || saving) {
			return
		}
		setDocImportError(null)
		docInputRef.current?.click()
	}

	function handleEditorChange(nextContent: string, nextHtml: string) {
		setFormState((prev) => {
			const metrics = computeContentMetrics(nextContent || '')
			const today = new Date().toISOString().split('T')[0]
			return {
				...prev,
				content: nextContent,
				content_html: nextHtml,
				metadata: {
					...prev.metadata,
					reading_time_minutes: String(metrics.readingMinutes),
					word_count: String(metrics.wordCount),
					updated_at: today,
					lastmod: today
				}
			}
		})
	}

	function renderMetadataField(field: MetadataFieldConfig) {
		if (field.hidden) {
			return null
		}

		const value = formState.metadata[field.name] ?? ''
		const fieldId = `metadata-${field.name}`
		const isReadOnly = field.readOnly ?? false

		if (field.name === 'traduzed_by') {
			return (
				<FormField
					key={field.name}
					label={field.label}
					htmlFor={fieldId}
					hint={field.hint}
					required={field.required}
				>
					<select
						id={fieldId}
						name={field.name}
						value={value}
						onChange={(event) => handleMetadataChange(field.name, event.target.value)}
						className="admin-input"
					>
						<option value="">Esse artigo não foi traduzido</option>
						{authors.map((author) => (
							<option key={author.id} value={author.name}>
								{author.name}
							</option>
						))}
					</select>
				</FormField>
			)
		}

		switch (field.type) {
			case 'textarea':
				return (
					<FormField
						key={field.name}
						label={field.label}
						htmlFor={fieldId}
						hint={field.hint}
						required={field.required}
					>
						<textarea
							id={fieldId}
							name={field.name}
							value={value}
							onChange={(event) => handleMetadataChange(field.name, event.target.value)}
							className="admin-textarea"
							rows={3}
							placeholder={field.placeholder}
							readOnly={isReadOnly}
						/>
					</FormField>
				)
			case 'json': {
				const config = JSON_FIELD_CONFIG[field.name]
				if (config) {
					const items = config.deserialize(value)
					return (
						<FormField
							key={field.name}
							label={field.label}
							htmlFor={fieldId}
							hint={field.hint}
							required={field.required}
						>
							<div className="admin-json-control">
								<div className="admin-json-control__summary">
									{items.length > 0 ? (
										<ul>
											{items.map((item, index) => (
												<li key={index}>{config.formatSummary(item)}</li>
											))}
										</ul>
									) : (
										<span className="admin-json-control__empty">{config.emptyLabel}</span>
									)}
								</div>
								<div className="admin-json-control__actions">
									<button
										type="button"
										className="admin-button admin-button--ghost"
										onClick={() => openJsonEditor(field.name)}
									>
										{config.addButtonLabel}
									</button>
								</div>
								<textarea
									id={fieldId}
									name={field.name}
									value={value}
									onChange={(event) => handleMetadataChange(field.name, event.target.value)}
									className="admin-textarea admin-textarea--code admin-json-control__input"
									rows={1}
									readOnly
									hidden
								/>
							</div>
						</FormField>
					)
				}

				return (
					<FormField
						key={field.name}
						label={field.label}
						htmlFor={fieldId}
						hint={field.hint}
						required={field.required}
					>
						<textarea
							id={fieldId}
							name={field.name}
							value={value}
							onChange={(event) => handleMetadataChange(field.name, event.target.value)}
							className="admin-textarea admin-textarea--code"
							rows={4}
							readOnly={isReadOnly}
						/>
					</FormField>
				)
			}
			case 'select':
				{
					const isMulti = field.multiple ?? false
					const multiValue = isMulti ? value.split(/\r?\n/).filter(Boolean) : undefined
					if (isMulti) {
						const selectedValues = new Set(multiValue)
						return (
							<FormField
								key={field.name}
								label={field.label}
								htmlFor={fieldId}
								hint={field.hint}
								required={field.required}
							>
								<div className="admin-multiselect">
									{(field.options ?? []).map((option) => {
										const optionId = `${fieldId}-${slugify(option.value)}`
										const isChecked = selectedValues.has(option.value)
										return (
											<label key={option.value} htmlFor={optionId} className="admin-multiselect__option">
												<input
													id={optionId}
													type="checkbox"
													value={option.value}
													checked={isChecked}
													onChange={(event) => {
														const nextValues = new Set(selectedValues)
														if (event.target.checked) {
															nextValues.add(option.value)
														} else {
															nextValues.delete(option.value)
														}
														handleMetadataChange(field.name, Array.from(nextValues).join('\n'))
													}}
													className="admin-multiselect__checkbox"
													disabled={isReadOnly}
												/>
												<span>{option.label}</span>
											</label>
										)
									})}
								</div>
							</FormField>
						)
                    }
					return (
						<FormField
							key={field.name}
							label={field.label}
							htmlFor={fieldId}
							hint={field.hint}
							required={field.required}
						>
							<select
								id={fieldId}
								name={field.name}
								value={isMulti ? multiValue : value}
								onChange={(event) => {
									if (isMulti) {
										const selectedValues = Array.from(event.target.selectedOptions).map((option) => option.value)
										handleMetadataChange(field.name, selectedValues.join('\n'))
									} else {
										handleMetadataChange(field.name, event.target.value)
									}
								}}
								className="admin-input"
								disabled={isReadOnly}
								multiple={isMulti}
							>
								{field.placeholder && !isMulti ? (
									<option value="">{field.placeholder}</option>
								) : null}
								{(field.options ?? []).map((option) => (
									<option key={option.value ?? 'empty'} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</FormField>
					)
				}
			case 'boolean':
				return (
					<FormField
						key={field.name}
						label={field.label}
						htmlFor={fieldId}
						hint={field.hint}
						required={field.required}
					>
						<select
							id={fieldId}
							name={field.name}
							value={value}
							onChange={(event) => handleMetadataChange(field.name, event.target.value)}
							className="admin-input"
							disabled={isReadOnly}
						>
							<option value="false">Não</option>
							<option value="true">Sim</option>
						</select>
					</FormField>
				)
			case 'list':
				return (
					<FormField
						key={field.name}
						label={field.label}
						htmlFor={fieldId}
						hint={field.hint}
						required={field.required}
					>
						<textarea
							id={fieldId}
							name={field.name}
							value={value}
							onChange={(event) => handleMetadataChange(field.name, event.target.value)}
							className="admin-textarea"
							rows={3}
							placeholder={field.placeholder ?? 'Uma entrada por linha'}
							readOnly={isReadOnly}
						/>
					</FormField>
				)
			default:
				return (
					<FormField
						key={field.name}
						label={field.label}
						htmlFor={fieldId}
						hint={field.hint}
						required={field.required}
					>
						<input
							id={fieldId}
							name={field.name}
							type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
							value={value}
							onChange={(event) => handleMetadataChange(field.name, event.target.value)}
							className="admin-input"
							step={field.type === 'number' ? 'any' : undefined}
							placeholder={field.placeholder}
							readOnly={isReadOnly}
							disabled={field.type === 'date' ? isReadOnly : undefined}
						/>
					</FormField>
				)
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setSaving(true)

		try {
			const formattedTags = formState.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean)

			const formattedKeyTakeaways = formState.key_takeaways
				.map((item) => item.trim())
				.filter((item): item is string => item.length > 0)

			const metadataPayload: Record<string, unknown> = {}

			for (const key of Object.keys(formState.metadata) as ArticleMetadataKey[]) {
				const rawValue = formState.metadata[key] ?? ''

				if (BOOLEAN_FIELDS.includes(key)) {
					metadataPayload[key] = rawValue === 'true'
					continue
				}

				if (LIST_FIELDS.includes(key)) {
					const listValues = rawValue
						.split(/\r?\n/)
						.map((item) => item.trim())
						.filter(Boolean)

					if (listValues.length > 0) {
						metadataPayload[key] = listValues
					}
					continue
				}

				if (JSON_FIELDS.includes(key)) {
					if (!rawValue) {
						continue
					}

					try {
						metadataPayload[key] = JSON.parse(rawValue)
					} catch (parseError) {
						console.error(parseError)
						showToast(`JSON inválido no campo "${key}".`, 'error')
						setSaving(false)
						return
					}
					continue
				}

				if (NUMBER_FIELDS.includes(key)) {
					if (!rawValue) {
						continue
					}

					const numericValue = Number(rawValue)
					if (Number.isNaN(numericValue)) {
						showToast(`O campo "${key}" deve ser numérico.`, 'error')
						setSaving(false)
						return
					}

					metadataPayload[key] = numericValue
					continue
				}

				if (DATE_FIELDS.includes(key)) {
					if (!rawValue) {
						continue
					}

					metadataPayload[key] = rawValue
					continue
				}

				if (rawValue) {
					metadataPayload[key] = rawValue
				}
			}

			const contentMetrics = computeContentMetrics(formState.content || '')
			metadataPayload.reading_time_minutes = contentMetrics.readingMinutes
			metadataPayload.word_count = contentMetrics.wordCount
			metadataPayload.content_version = generateContentVersion()

			metadataPayload.title = formState.title
			if (formState.subtitle) {
				metadataPayload.subtitle = formState.subtitle
			}
			metadataPayload.excerpt = formState.excerpt
			metadataPayload.lang = formState.lang
			if (formState.seo_title) {
				metadataPayload.seo_title = formState.seo_title
			}
			if (formState.seo_description) {
				metadataPayload.seo_description = formState.seo_description
			}
			metadataPayload.canonical_url = formState.canonical_url
			metadataPayload.robots_index = 'index'
			metadataPayload.robots_follow = 'follow'
			if (formState.cover_dominant_color) {
				metadataPayload.cover_dominant_color = formState.cover_dominant_color
			}
			if (formState.reviewed_by) {
				metadataPayload.reviewed_by = formState.reviewed_by
			}
			if (formState.reviewer_credentials) {
				metadataPayload.reviewer_credentials = formState.reviewer_credentials
			}
			metadataPayload.fact_checked = Boolean(formState.fact_checked)
			if (formState.tldr) {
				metadataPayload.tldr = formState.tldr
			}
			metadataPayload.key_takeaways = formattedKeyTakeaways
			metadataPayload.priority_image = true
			const coverAsset = formState.cover_image || ''
			if (coverAsset) {
				metadataPayload.cover_image = coverAsset
				metadataPayload.og_image = coverAsset
				metadataPayload.cover_asset_id = coverAsset
				metadataPayload.og_image_asset_id = coverAsset
				if (!metadataPayload.image_meta) {
					const imageMetaString = buildImageMeta(coverAsset)
					if (imageMetaString) {
						try {
							metadataPayload.image_meta = JSON.parse(imageMetaString)
						} catch (metaError) {
							console.error(metaError)
						}
					}
				}
			}
			metadataPayload.tags = formattedTags

			const today = new Date().toISOString().split('T')[0]
			if (!metadataPayload.date) {
				metadataPayload.date = today
			}
			metadataPayload.lastmod = today
			metadataPayload.updated_at = today

			if (selectedAuthor) {
				if (!metadataPayload.author) {
					metadataPayload.author = selectedAuthor.name
				}
				if (!metadataPayload.author_slug) {
					metadataPayload.author_slug = selectedAuthor.slug
				}
				if (!metadataPayload.author_url && selectedAuthor.website) {
					metadataPayload.author_url = selectedAuthor.website
				}
				if (!metadataPayload.author_avatar_asset_id && selectedAuthor.avatar_url) {
					metadataPayload.author_avatar_asset_id = selectedAuthor.avatar_url
				}
			}

			if (!metadataPayload.category && selectedCategory) {
				metadataPayload.category = selectedCategory.slug
			}

			if (!metadataPayload.in_language) {
				metadataPayload.in_language = formState.lang
			}

			metadataPayload.og_title = formState.seo_title
			metadataPayload.og_description = formState.seo_description
			metadataPayload.og_type = 'article'
			metadataPayload.twitter_card = 'summary_large_image'
			metadataPayload.is_accessible_for_free = true
			metadataPayload.robots_advanced = 'index,follow'
			if (!metadataPayload.license) {
				metadataPayload.license = DEFAULT_LICENSE
			}
			if (!metadataPayload.funding_disclosure) {
				metadataPayload.funding_disclosure = DEFAULT_FUNDING_DISCLOSURE
			}
			if (!metadataPayload.conflicts_of_interest) {
				metadataPayload.conflicts_of_interest = DEFAULT_CONFLICTS_OF_INTEREST
			}
			metadataPayload.permalink = formState.slug
				? `/blog/post/${formState.slug}`
				: (typeof metadataPayload.permalink === 'string' ? metadataPayload.permalink : '')

			const coverBlurhashValue = blurhashMode === 'manual' ? formState.cover_blurhash || null : null

			const hashedContent = await computeContentHash(formState.content || '')
			if (hashedContent) {
				metadataPayload.content_hash = hashedContent
			}

			const siteId = metadataPayload.site_id
			if (!siteId || typeof siteId !== 'string' || siteId.trim() === '') {
				showToast('Informe o Site ID utilizado pelo Contentlayer.', 'error')
				setSaving(false)
				return
			}

			const toIsoTimestamp = (value: string) => {
				const normalized = value.trim()
				if (!normalized) {
					return new Date().toISOString()
				}
				const parsed = new Date(`${normalized}T12:00:00`)
				return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
			}

			const publishedAtIso =
				formState.status === 'published'
					? (() => {
						const metadataDate = typeof metadataPayload.date === 'string' ? metadataPayload.date.trim() : ''
						if (metadataDate) {
							return toIsoTimestamp(metadataDate)
						}
						if (formState.published_at) {
							return formState.published_at
						}
						return new Date().toISOString()
					})()
					: null

			if (publishedAtIso && formState.published_at !== publishedAtIso) {
				setFormState((prev) => ({ ...prev, published_at: publishedAtIso }))
			}

			const payload = {
				title: formState.title,
				slug: formState.slug,
				subtitle: formState.subtitle || null,
				excerpt: formState.excerpt,
				content: formState.content,
				raw_mdx: formState.content,
				processed_mdx: formState.content_html || mdxToHtml(formState.content || ''),
				status: formState.status,
				category_id: formState.category_id || null,
				author_id: formState.author_id || null,
				cover_image: formState.cover_image || null,
				seo_title: formState.seo_title || null,
				seo_description: formState.seo_description || null,
				canonical_url: formState.canonical_url || null,
				og_image: formState.og_image || null,
				robots_index: formState.robots_index,
				robots_follow: formState.robots_follow,
				tags: formattedTags.length > 0 ? formattedTags : null,
				lang: formState.lang,
				cover_blurhash: coverBlurhashValue,
				cover_dominant_color: formState.cover_dominant_color || null,
				reviewed_by: formState.reviewed_by || null,
				reviewer_credentials: formState.reviewer_credentials || null,
				fact_checked: Boolean(formState.fact_checked),
				tldr: formState.tldr || null,
				key_takeaways: formattedKeyTakeaways.length > 0 ? formattedKeyTakeaways : null,
				reading_time: contentMetrics.readingMinutes,
				word_count: contentMetrics.wordCount,
				contentlayer_meta: metadataPayload,
				published_at: publishedAtIso
			}

			const endpoint = articleId ? `/api/articles/${articleId}` : '/api/articles'
			const method = articleId ? 'PUT' : 'POST'

			const response = await adminFetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})

			if (!response.ok) {
				let errorMessage = 'Não foi possível salvar o artigo.'
				try {
					const errorPayload = await response.json()
					if (errorPayload?.error) {
						errorMessage = String(errorPayload.error)
					}
				} catch {
					// ignore parsing errors
				}
				throw new Error(errorMessage)
			}

			showToast('Artigo salvo com sucesso!')
			onClose(true)
		} catch (error) {
			console.error(error)
			const message = error instanceof Error && error.message ? error.message : 'Erro ao salvar artigo. Verifique os campos e tente novamente.'
			showToast(message, 'error')
		} finally {
			setSaving(false)
		}
	}

	const activeJsonEditorConfig = jsonEditorState ? JSON_FIELD_CONFIG[jsonEditorState.field] : undefined

	return (
		<Modal
			title={articleId ? 'Editar artigo' : 'Novo artigo'}
			description="Preencha as informações editoriais, de SEO e de conteúdo estruturado antes de publicar."
			onClose={() => onClose()}
		>
			{loading ? (
				<LoadingState label="Carregando formulário" />
			) : (
				<>
					<form className="admin-form" onSubmit={handleSubmit}>
					<div className="admin-form__section">
						<h4 className="admin-form__section-title">Informações principais</h4>
						<p className="admin-form__section-description">
							Estes campos alimentam o título, resumo e dados básicos do artigo.
						</p>
						<div className="admin-form__grid admin-form__grid--two">
							<FormField label="Título" htmlFor="title" required>
								<input
									id="title"
									name="title"
									value={formState.title}
									onChange={handleInputChange}
									className="admin-input"
									placeholder="Ex: Guia completo de drywall"
									required
								/>
							</FormField>

							<FormField label="Subtítulo" htmlFor="subtitle">
								<input
									id="subtitle"
									name="subtitle"
									value={formState.subtitle}
									onChange={handleInputChange}
									className="admin-input"
									placeholder="Resumo curto do conteúdo"
								/>
							</FormField>

							<FormField label="Idioma" htmlFor="lang">
								<select
									id="lang"
									name="lang"
									value={formState.lang}
									onChange={handleInputChange}
									className="admin-input"
								>
									<option value="pt-BR">Português (Brasil)</option>
									<option value="en-US">Inglês (EUA)</option>
								</select>
							</FormField>
						</div>

						<FormField label="Resumo" htmlFor="excerpt" required>
							<textarea
								id="excerpt"
								name="excerpt"
								value={formState.excerpt}
								onChange={handleInputChange}
								className="admin-textarea"
								rows={3}
								placeholder="Breve descrição para destacar o artigo"
								required
							/>
						</FormField>

						<FormField
							label="Conteúdo"
							htmlFor="content"
							required
							hint="Editor visual converte automaticamente o conteúdo para MDX."
						>
							<div className="admin-editor__toolbar">
								<button
									type="button"
									className="admin-button admin-button--primary"
									onClick={handleDocImportClick}
									disabled={docImporting || saving}
								>
									<FileArrowUp size={16} weight="bold" aria-hidden="true" />
									{docImporting ? 'Importando...' : 'Importar Google Doc'}
								</button>
								<input
									type="file"
									ref={docInputRef}
									onChange={handleDocFileChange}
									hidden
									accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								/>
								{docImporting ? <span className="admin-editor__status">Convertendo conteúdo...</span> : null}
								{docImportError ? (
									<span className="admin-editor__status admin-editor__status--error">{docImportError}</span>
								) : null}
							</div>
							<RichTextEditor
								id="article-content-editor"
								value={formState.content}
								onChange={(mdx, html) => handleEditorChange(mdx, html)}
								placeholder="Escreva o artigo com formatação rica, como em um Google Docs."
								disabled={saving}
							/>
						</FormField>
					</div>

					<div className="admin-form__section">
						<h4 className="admin-form__section-title">Relacionamentos</h4>
						<div className="admin-form__grid admin-form__grid--two">
							<FormField label="Categoria" htmlFor="category_id" required>
								<select
									id="category_id"
									name="category_id"
									value={formState.category_id}
									onChange={handleInputChange}
									className="admin-input"
									required
								>
									<option value="">Selecione uma categoria</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.title}
										</option>
									))}
								</select>
							</FormField>

							<FormField label="Autor" htmlFor="author_id" required>
								<select
									id="author_id"
									name="author_id"
									value={formState.author_id}
									onChange={handleInputChange}
									className="admin-input"
									required
								>
									<option value="">Selecione um autor</option>
									{authors.map((author) => (
										<option key={author.id} value={author.id}>
											{author.name}
										</option>
									))}
								</select>
							</FormField>

							<FormField label="Status" htmlFor="status">
								<select
									id="status"
									name="status"
									value={formState.status}
									onChange={handleInputChange}
									className="admin-input"
								>
									<option value="draft">Rascunho</option>
									<option value="published">Publicado</option>
									<option value="archived">Arquivado</option>
								</select>
							</FormField>

							<FormField label="Tags" htmlFor="tags" hint="Separe por vírgula">
								<input
									id="tags"
									name="tags"
									value={formState.tags}
									onChange={handleInputChange}
									className="admin-input"
									placeholder="drywall, instalação, acústica"
								/>
							</FormField>
						</div>
					</div>

						<div className="admin-form__section">
							<h4 className="admin-form__section-title">Mídia e SEO</h4>
							<div className="admin-form__grid admin-form__grid--two">
								<FormField
									label="Imagem de capa e redes sociais"
									htmlFor="cover_image"
									hint="A mesma imagem será usada na capa, Open Graph e Twitter."
								>
									<AssetUploader
										id="cover_image"
										value={formState.cover_image}
										onChange={(value) =>
											setFormState((prev) => {
												const asset = value ?? ''
												const nextMetadata = {
													...prev.metadata,
													cover_asset_id: asset,
													og_image_asset_id: asset,
													priority_image: 'true',
													image_meta: buildImageMeta(asset)
												}
												return {
													...prev,
													cover_image: asset,
													og_image: asset,
													metadata: nextMetadata
												}
											})
										}
										accept="image/*"
									/>
								</FormField>

								<FormField
									label="Blurhash da capa"
									htmlFor="blurhash_mode"
									hint="Deixe automático para gerar via pipeline."
								>
									<div className="admin-field__stack">
										<select
											id="blurhash_mode"
											name="blurhash_mode"
											value={blurhashMode}
											onChange={handleBlurhashModeChange}
											className="admin-input"
										>
											<option value="auto">Gerar automaticamente</option>
											<option value="manual">Informar manualmente</option>
										</select>
										{blurhashMode === 'manual' ? (
											<input
												id="cover_blurhash"
												name="cover_blurhash"
												value={formState.cover_blurhash}
												onChange={handleInputChange}
												className="admin-input"
												placeholder="Informe o blurhash gerado pela pipeline"
											/>
										) : null}
									</div>
								</FormField>
							</div>

							<div className="admin-meta-preview-grid">
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">Slug</span>
									<span className="admin-meta-preview__value">
										{formState.slug ? `/${formState.slug}` : '—'}
									</span>
								</div>
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">URL canônica</span>
									<span className="admin-meta-preview__value">{formState.canonical_url || 'Gerada automaticamente'}</span>
								</div>
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">Título SEO</span>
									<span className="admin-meta-preview__value">{formState.seo_title || 'Será igual ao título do artigo'}</span>
								</div>
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">Descrição SEO</span>
									<span className="admin-meta-preview__value">{formState.seo_description || 'Usa o resumo do artigo'}</span>
								</div>
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">Diretrizes de robôs</span>
									<span className="admin-meta-preview__value">index / follow</span>
								</div>
								<div className="admin-meta-preview">
									<span className="admin-meta-preview__label">Cor dominante</span>
									<span className="admin-meta-preview__value">{DEFAULT_DOMINANT_COLOR}</span>
								</div>
							</div>

							<div className="admin-form__subsection">
								<button
									type="button"
									className="admin-button admin-button--ghost"
									onClick={() => setShowSocialFields((prev) => !prev)}
								>
									{showSocialFields ? 'Ocultar campos de mídia social' : 'Adicionar campos de mídia social'}
								</button>

								{showSocialFields ? (
									<div className="admin-form__grid admin-form__grid--two">
										<FormField
											label="@site (X/Twitter)"
											htmlFor="metadata-twitter_site"
											hint="Opcional. Informe o @ do perfil da marca."
										>
											<input
												id="metadata-twitter_site"
												name="metadata-twitter_site"
												type="text"
												value={formState.metadata.twitter_site ?? ''}
												onChange={(event) => handleMetadataChange('twitter_site', event.target.value)}
												className="admin-input"
												placeholder="@novametalica"
											/>
										</FormField>
										<FormField
											label="@autor (X/Twitter)"
											htmlFor="metadata-twitter_creator"
											hint="Opcional. Perfil do autor para cartões sociais."
										>
											<input
												id="metadata-twitter_creator"
												name="metadata-twitter_creator"
												type="text"
												value={formState.metadata.twitter_creator ?? ''}
												onChange={(event) => handleMetadataChange('twitter_creator', event.target.value)}
												className="admin-input"
												placeholder="@autor"
											/>
										</FormField>
									</div>
								) : null}
							</div>
						</div>

					<div className="admin-form__section">
						<h4 className="admin-form__section-title">Qualidade editorial</h4>
						<div className="admin-form__grid admin-form__grid--two">
							<FormField
								label="Revisado por"
								htmlFor="reviewer_id"
								hint="Selecione o autor responsável pela validação técnica"
							>
								<select
									id="reviewer_id"
									name="reviewer_id"
									value={formState.reviewer_id}
									onChange={handleReviewerChange}
									className="admin-input"
								>
									<option value="">Selecione um autor</option>
									{authors.map((author) => (
										<option key={author.id} value={author.id}>
											{author.name}
										</option>
									))}
								</select>
							</FormField>

							<FormField
								label="Nome do revisor"
								htmlFor="reviewed_by"
								hint="Preenchido automaticamente após escolher o autor"
							>
								<input
									id="reviewed_by"
									name="reviewed_by"
									value={formState.reviewed_by}
									readOnly
									className="admin-input"
									placeholder="Selecione um autor para preencher"
								/>
							</FormField>

							<FormField
								label="Credenciais do revisor"
								htmlFor="reviewer_credentials"
								hint="Resumo das credenciais exibido no artigo"
							>
								<textarea
									id="reviewer_credentials"
									name="reviewer_credentials"
									value={formState.reviewer_credentials}
									onChange={handleInputChange}
									className="admin-textarea"
									rows={3}
									placeholder="CREA 12345, Especialista em..."
								/>
							</FormField>
						</div>

						<FormField
							label="Resumo (TL;DR)"
							htmlFor="tldr"
							hint="Use até 3 frases para sintetizar o artigo"
						>
							<textarea
								id="tldr"
								name="tldr"
								value={formState.tldr}
								className="admin-textarea"
								rows={3}
								placeholder="Principais conclusões em poucas linhas"
								readOnly
							/>
						</FormField>

						<FormField
							label="Principais aprendizados"
							htmlFor="key_takeaways"
							hint="Digite e pressione Enter para adicionar um aprendizado"
						>
							<div className="admin-chip-input">
								{formState.key_takeaways.length > 0 ? (
									<div className="admin-chip-input__list">
										{formState.key_takeaways.map((item) => (
											<button
												type="button"
												key={item}
												className="admin-chip-input__tag"
												onClick={() => handleRemoveKeyTakeaway(item)}
												aria-label={`Remover aprendizado ${item}`}
											>
												{item}
												<span className="admin-chip-input__tag-remove" aria-hidden>
													×
												</span>
											</button>
										))}
									</div>
								) : null}
								<input
									id="key_takeaways"
									name="key_takeaways"
									value={keyTakeawayInput}
									onChange={(event) => setKeyTakeawayInput(event.target.value)}
									onKeyDown={handleKeyTakeawayKeyDown}
									className="admin-input"
									placeholder="Ex: Como planejar a instalação de drywall"
								/>
							</div>
						</FormField>
					</div>

					<div className="admin-form__section">
						<h4 className="admin-form__section-title">Configuração Contentlayer</h4>
						{METADATA_SECTIONS.map((section) => {
							const hasVisibleFields = section.fields.some((field) => !field.hidden)
							if (!hasVisibleFields) {
								return null
							}

							return (
								<div key={section.title} className="admin-form__subsection">
									<h5 className="admin-form__subsection-title">{section.title}</h5>
									{section.description ? (
										<p className="admin-form__subsection-description">{section.description}</p>
									) : null}
									<div className="admin-form__grid admin-form__grid--two">
										{section.fields.map((field) => renderMetadataField(field))}
									</div>
								</div>
							)
						})}
					</div>

					<div className="admin-modal__actions">
						<button
							type="button"
							className="admin-button admin-button--ghost"
							onClick={() => onClose(false)}
							disabled={saving}
						>
							Cancelar
						</button>
						<button type="submit" className="admin-button admin-button--primary" disabled={saving}>
							{saving ? 'Salvando...' : 'Salvar artigo'}
						</button>
					</div>
				</form>

					{jsonEditorState && activeJsonEditorConfig ? (
						<div className="admin-json-editor-overlay" role="dialog" aria-modal="true">
							<div className="admin-json-editor-overlay__backdrop" onClick={closeJsonEditor} />
							<div className="admin-json-editor-overlay__dialog" role="document">
								<div className="admin-json-editor-overlay__header">
									<h5 className="admin-json-editor-overlay__title">{activeJsonEditorConfig.addButtonLabel}</h5>
									<button
										type="button"
										className="admin-button admin-button--ghost"
										onClick={closeJsonEditor}
									>
										Fechar
									</button>
								</div>
								<div className="admin-json-editor-overlay__body">
									{jsonEditorState.items.map((item, index) => {
										const itemKey = `${jsonEditorState.field}-${index}`
										return (
											<div key={itemKey} className="admin-json-editor-item">
												<div className="admin-json-editor-item__header">
													<span>
														{activeJsonEditorConfig.itemLabel} {index + 1}
													</span>
													<button
														type="button"
														className="admin-button admin-button--ghost"
														onClick={() => handleJsonEditorRemoveItem(index)}
													>
														Remover
													</button>
												</div>
												<div className="admin-json-editor-item__fields">
													{activeJsonEditorConfig.fields.map((configField) => {
														const inputId = `${jsonEditorState.field}-${configField.key}-${index}`
														const fieldValue = item[configField.key] ?? ''

														if (configField.type === 'textarea') {
															return (
																<div key={configField.key} className="admin-json-editor-item__field">
																	<label htmlFor={inputId}>{configField.label}</label>
																	<textarea
																		id={inputId}
																		value={fieldValue}
																		onChange={(event) => handleJsonEditorItemChange(index, configField.key, event.target.value)}
																		className="admin-textarea"
																		rows={3}
																		placeholder={configField.placeholder}
																	/>
																</div>
															)
														}

														return (
															<div key={configField.key} className="admin-json-editor-item__field">
																<label htmlFor={inputId}>{configField.label}</label>
																<input
																	id={inputId}
																	type="text"
																	value={fieldValue}
																	onChange={(event) => handleJsonEditorItemChange(index, configField.key, event.target.value)}
																	className="admin-input"
																	placeholder={configField.placeholder}
																/>
															</div>
														)
													})}
												</div>
											</div>
										)
									})}
									<button
										type="button"
										className="admin-button admin-button--ghost"
										onClick={handleJsonEditorAddItem}
									>
										Adicionar {activeJsonEditorConfig.itemLabel.toLowerCase()}
									</button>
								</div>
								<div className="admin-json-editor-overlay__footer">
									<button
										type="button"
										className="admin-button admin-button--ghost"
										onClick={closeJsonEditor}
									>
										Cancelar
									</button>
									<button
										type="button"
										className="admin-button admin-button--primary"
										onClick={handleJsonEditorSave}
									>
										Aplicar JSON
									</button>
								</div>
							</div>
						</div>
					) : null}
				</>
			)}
		</Modal>
	)
}
