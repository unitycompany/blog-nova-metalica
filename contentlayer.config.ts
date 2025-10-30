import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import readingTime from 'reading-time'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { categorySlugs } from './src/content/categories'

const postsDir = path.join(process.cwd(), 'posts')

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true })
}

export const Post = defineDocumentType(() => ({
  name: 'Post',
  contentType: 'mdx',
  filePathPattern: '**/*.mdx',
  fields: {
    // — existentes —
    title: { type: 'string', required: true },
    subtitle: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    author: { type: 'string', required: true },
    traduzed_by: { type: 'string', required: false },
    site_id: { type: 'string', required: true },
    date: { type: 'date', required: true },
    lang: { type: 'string', required: true },
    cover_asset_id: { type: 'string', required: true },
    seo_title: { type: 'string', required: false },
    seo_description: { type: 'string', required: false },
    og_image_asset_id: { type: 'string', required: false },
    search_vector: { type: 'string', required: false },
    tag_ids: { type: 'list', of: { type: 'string' }, required: false },
    tags: { type: 'list', of: { type: 'string' }, required: false },
    category: { type: 'string', required: true, validations: { enum: categorySlugs } },

    // — novos SEO —
    canonical_url: { type: 'string', required: false },
    robots_index: { type: 'enum', options: ['index', 'noindex'], required: false },
    robots_follow: { type: 'enum', options: ['follow', 'nofollow'], required: false },
    robots_advanced: { type: 'string', required: false },
    sitemap_priority: { type: 'number', required: false },
    sitemap_changefreq: {
      type: 'enum',
      options: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      required: false,
    },
    lastmod: { type: 'date', required: false },
    breadcrumbs: { type: 'list', of: { type: 'json' }, required: false },
    permalink: { type: 'string', required: false },

    // — OG/Twitter —
    og_title: { type: 'string', required: false },
    og_description: { type: 'string', required: false },
    og_type: { type: 'enum', options: ['article', 'website'], required: false },
    twitter_card: { type: 'enum', options: ['summary', 'summary_large_image'], required: false },
    twitter_site: { type: 'string', required: false },
    twitter_creator: { type: 'string', required: false },

    // — EEAT —
    author_slug: { type: 'string', required: false },
    author_url: { type: 'string', required: false },
    author_avatar_asset_id: { type: 'string', required: false },
    reviewed_by: { type: 'string', required: false },
    reviewer_credentials: { type: 'string', required: false },
    fact_checked: { type: 'boolean', required: false },
    funding_disclosure: { type: 'string', required: false },
    conflicts_of_interest: { type: 'string', required: false },

    // — Schema.org —
    main_entity_of_page: { type: 'string', required: false },
    is_accessible_for_free: { type: 'boolean', required: false },
    in_language: { type: 'string', required: false },
    article_section: { type: 'string', required: false },
    article_tags: { type: 'list', of: { type: 'string' }, required: false },
    image_meta: { type: 'json', required: false },

    // — I18n —
    translated_from_id: { type: 'string', required: false },
    alternate_locales: { type: 'list', of: { type: 'json' }, required: false },

    // — Relacionamento —
    related_post_slugs: { type: 'list', of: { type: 'string' }, required: false },
    series_slug: { type: 'string', required: false },
    series_order: { type: 'number', required: false },

    // — Performance —
    priority_image: { type: 'boolean', required: false },
    cover_blurhash: { type: 'string', required: false },
    cover_dominant_color: { type: 'string', required: false },

    // — LLM / Semântica —
    tldr: { type: 'string', required: false },
    key_takeaways: { type: 'list', of: { type: 'string' }, required: false },
    faq: { type: 'list', of: { type: 'json' }, required: false },
    entities: { type: 'list', of: { type: 'string' }, required: false },
    topics: { type: 'list', of: { type: 'string' }, required: false },
    citations: { type: 'list', of: { type: 'json' }, required: false },
    license: { type: 'string', required: false },
    content_version: { type: 'string', required: false },
    content_hash: { type: 'string', required: false },
    embedding_vector_id: { type: 'string', required: false },
    chunk_hints: { type: 'list', of: { type: 'json' }, required: false },

    // — Editorial —
    reading_time_minutes: { type: 'number', required: false },
    word_count: { type: 'number', required: false },
    updated_at: { type: 'date', required: false },
    cover_image: { type: 'string', required: false },
    og_image: { type: 'string', required: false },
    slug: { type: 'string', required: false },
    status: { type: 'enum', options: ['draft', 'published'], required: false },
    published_at: { type: 'date', required: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc: any) => {
        const permalink = (doc as any).permalink
        if (typeof permalink === 'string' && permalink.trim() !== '') {
          return permalink.replace(/^\/+/, '').replace(/\.mdx?$/, '')
        }

        return doc._raw.sourceFileName.replace(/\.mdx?$/, '')
      },
    },
    url: {
      type: 'string',
      resolve: (doc: any) => {
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
        return new URL(`/${doc.slug}`, base).toString()
      },
    },
    readingTime: {
      type: 'json',
      resolve: (doc: any) => readingTime(doc.body.raw || ''),
    },
    wordCount: {
      type: 'number',
      resolve: (doc: any) => (doc.body.raw || '').split(/\s+/).filter(Boolean).length,
    },
    contentHash: {
      type: 'string',
      resolve: (doc: any) => crypto.createHash('sha256').update(doc.body.raw || '').digest('hex'),
    },
  },
}))

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
})
