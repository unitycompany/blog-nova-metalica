import { useRouter } from "next/router"
import Head from "next/head"
import type { GetStaticPaths, GetStaticProps } from 'next';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import ArticleSection from "@/components/article-section";
import { ArticleTopic } from "@/components/navigation/navigation";
import { categories } from "@/content/categories";
import { authors } from "@/content/authors";
import Link from "next/link";
import React from "react";
import type { ComponentPropsWithoutRef } from 'react';
import type { NextRouter } from 'next/router';
import { media } from "@/styles/media";
import { resolveAssetUrl } from '@/util/assets';
import { articlesRepository } from '@/lib/repositories/articles';
import type { Article } from '@/lib/supabase';
import { htmlToMdx, mdxToHtml } from '@/util/mdxConverter';
import { getSupabaseAdmin } from '@/lib/supabase';
import { readArticleContent } from '@/util/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Post = { [key: string]: any }

const DEFAULT_SITE_URL = 'https://blog.novametalica.com.br';
const DEFAULT_SITE_NAME = 'Blog Nova Metálica';
const DEFAULT_BRAND_NAME = 'Nova Metálica';
const DEFAULT_SITE_DESCRIPTION = 'Conteúdos sobre steel frame, construção a seco e inovação na construção civil brasileira pela Nova Metálica.';
const DEFAULT_SOCIAL_IMAGE = '/assets/logo/logotipo-nova-metalica-branca.png';
const DEFAULT_TWITTER_HANDLE = '@novametalica';
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const ContainerPost = styled.article`
  width: 100%;
`;

/* Container MDX com seletores encadeados (& p, & th, etc.) */
const MDXContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  & > * {
    max-width: 100%;
  }

  & p {
    margin: 0 0 1rem;
    line-height: 1.3;
    color: ${(props) => props.theme.color.black[300]};
    font-weight: ${(props) => props.theme.font.weight.regular};
    font-size: ${(props) => props.theme.font.size.sm};
  }

  & a {
    text-decoration: underline;
    &:hover { opacity: 0.8; }
  }

  & strong { 
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    color: ${(props) => props.theme.color.black[100]}; 
  }
  & em { font-style: italic; }

  & ul, & ol {
    padding-left: 1.25rem;
    margin-bottom: 1rem;
    list-style: disc;
  }

  & li { margin-bottom: .4rem; }

  & li::marker {
    color: ${(props) => props.theme.color.primary.main};
  }

  & hr {
    width: 100%;
    border: none;
    height: 1px;
    margin: 2rem 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
  }

  & h1 { 
    font-size: ${(props) => props.theme.font.size.extra_md};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    color: ${(props) => props.theme.color.black[300]};
    margin: 1rem 0; 

    ${media('mobile')}{
        font-size: ${(props) => props.theme.font.size.md};                
    }
  }
  & h2 { 
    font-size: ${(props) => props.theme.font.size.md};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    color: ${(props) => props.theme.color.black[300]};
    margin: 1rem 0;
    
    ${media('mobile')}{
        font-size: ${(props) => props.theme.font.size.md};               
    }
  }
  & h3 { 
    font-size: ${(props) => props.theme.font.size.md};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    color: ${(props) => props.theme.color.black[300]};
    margin: 1rem 0; 

    ${media('mobile')}{
        font-size: ${(props) => props.theme.font.size.md};                
    } 
  }

  /* Tabela responsiva — torna a tabela rolável quando necessária */
  & table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
  }

  & th, & td {
    padding: 12px;
    text-align: left;
    vertical-align: top;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(6, 13, 32, 0.35);
      color: ${(props) => props.theme.color.gray[100]};
      font-size: ${(props) => props.theme.font.size.extra_sm};
  }

  & table caption {
    caption-side: bottom;
    padding: 0.75rem;
    font-size: ${(props) => props.theme.font.size.extra_sm};
    color: ${(props) => props.theme.color.black[500]};
  }

    & tbody tr:nth-of-type(odd) {
      background: rgba(31, 154, 215, 0.08);
    }

  & img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    margin: 0.5rem 0;
      border-radius: 12px;
  }

  & pre {
    background: #0d0d0d;
    color: #e6e6e6;
    padding: 1rem;
    overflow: auto;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  & code {
    font-family: monospace;
    background: rgba(0,0,0,0.05);
    padding: 0 .25rem;
    border-radius: 4px;
  }

  & blockquote {
    margin: 1.5rem 0;
    padding: 1.25rem 1.5rem;
    border-left: 4px solid ${(props) => props.theme.color.primary.main};
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    color: ${(props) => props.theme.color.gray[100]};
    font-style: italic;
  }

  & figure {
    margin: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  & figcaption {
    font-size: ${(props) => props.theme.font.size.extra_sm};
    color: ${(props) => props.theme.color.gray[100]};
    text-align: center;
  }

  & iframe,
  & video {
    width: 100%;
    min-height: 320px;
    border: none;
    border-radius: 12px;
    background: #000;
  }

  & .rte-align-center,
  & .align-center,
  & .text-center {
    text-align: center;
  }

  & .rte-align-right,
  & .align-right,
  & .text-right {
    text-align: right;
  }

  & .rte-table-wrapper {
    overflow-x: auto;
  }

  & .rte-table-wrapper table {
    margin: 0;
  }

  ${media('mobile')} {
    & table {
      display: block;
      overflow-x: auto;
    }

    & table table {
      width: 100%;
    }
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  width: 100%;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  padding: 48px 16px;
`;

const LoadingSpinner = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: ${(props) => props.theme.color.primary.main};
  animation: ${spin} 0.85s linear infinite;
`;

const LoadingText = styled.p`
  font-size: ${(props) => props.theme.font.size.sm};
  color: ${(props) => props.theme.color.gray[100]};
  text-align: center;
`;

/* Link que usa next/link para rotas internas */
type MDXLinkProps = ComponentPropsWithoutRef<'a'> & { href?: string };

function MDXLink({ href = '', children, ...props }: MDXLinkProps) {
  const safeHref = normalizeAssetUrl(href) || href;

  if (!safeHref) {
    return <a {...props}>{children}</a>;
  }

  const isExternal = /^https?:\/\//i.test(safeHref) || safeHref.startsWith('//');

  if (isExternal) {
    return (
      <a href={safeHref} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={safeHref} legacyBehavior>
      <a {...props}>{children}</a>
    </Link>
  );
}

type MDXImageProps = ComponentPropsWithoutRef<'img'>;

/* eslint-disable @next/next/no-img-element -- rich text markup may contain native <img> tags */
function MDXImage(props: MDXImageProps) {
  const { alt, src, srcSet, ...rest } = props;
  const normalizedSrc = typeof src === 'string' ? normalizeAssetUrl(src) : undefined;
  const normalizedSrcSet = typeof srcSet === 'string' ? normalizeSrcSet(srcSet) : undefined;

  return (
    <img
      {...rest}
      src={normalizedSrc ?? (typeof src === 'string' ? src : undefined)}
      srcSet={normalizedSrcSet ?? srcSet}
      alt={typeof alt === 'string' ? alt : ''}
      loading='lazy'
    />
  );
}
/* eslint-enable @next/next/no-img-element */

type FallbackArticlePayload = (Article & { contentHtml: string })

type PostSlugProps = {
  slug: string
  fallbackArticle?: FallbackArticlePayload | null
}

type ImageMeta = {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  caption?: string;
  type?: string;
};

type AlternateLocale = {
  lang?: string;
  url?: string;
};

const sanitizeHeadingText = (value: string) =>
  value
    .replace(/`{1,3}.*?`{1,3}/g, '')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\{.*?\}/g, '')
    .trim();

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const cleanString = (value?: string | null) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
};

function ensureAbsoluteUrl(value?: string | null, fallbackPath?: string) {
  const base = DEFAULT_SITE_URL;
  const candidate = cleanString(value);

  if (candidate) {
    if (ABSOLUTE_URL_REGEX.test(candidate)) {
      return candidate;
    }

    if (candidate.startsWith('//')) {
      return `https:${candidate}`;
    }

    const normalized = candidate.startsWith('/')
      ? candidate
      : `/${candidate.replace(/^\/+/g, '')}`;

    return `${base}${normalized}`;
  }

  if (fallbackPath) {
    if (ABSOLUTE_URL_REGEX.test(fallbackPath)) {
      return fallbackPath;
    }

    if (fallbackPath.startsWith('//')) {
      return `https:${fallbackPath}`;
    }

    const normalizedFallback = fallbackPath.startsWith('/')
      ? fallbackPath
      : `/${fallbackPath.replace(/^\/+/g, '')}`;

    return `${base}${normalizedFallback}`;
  }

  return base;
}

function toOgLocale(locale: string) {
  return locale.replace('-', '_');
}

function toIsoString(value?: string | Date | null) {
  if (!value) {
    return '';
  }

  const parsed = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

function buildRobotsContent(indexDirective?: string, followDirective?: string, advancedDirectives?: string) {
  const directives = new Set<string>();

  const append = (directive?: string) => {
    const cleaned = cleanString(directive);
    if (!cleaned) {
      return;
    }

    cleaned
      .split(',')
      .map((token) => cleanString(token))
      .filter(Boolean)
      .forEach((token) => directives.add(String(token).toLowerCase()));
  };

  append(indexDirective);
  append(followDirective);
  append(advancedDirectives);

  if (directives.size === 0) {
    directives.add('index');
    directives.add('follow');
  }

  return Array.from(directives).join(', ');
}

function normalizeTwitterHandle(value?: string | null) {
  const handle = cleanString(value);
  if (!handle) {
    return '';
  }

  return handle.startsWith('@') ? handle : `@${handle}`;
}

const humanizeSlug = (value: string) => {
  const normalized = value.replace(/[-_/]+/g, ' ').trim();
  if (!normalized) {
    return '';
  }
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

function extractSlug(router: NextRouter): string {
  const { slug } = router.query;

  if (Array.isArray(slug)) {
    return slug[0] ?? '';
  }

  if (typeof slug === 'string' && slug) {
    return slug;
  }

  const asPath = typeof router.asPath === 'string' ? router.asPath : '';
  if (!asPath) {
    return '';
  }

  const path = asPath.split('?')[0]?.split('#')[0] ?? '';
  const sanitized = path.replace(/\/+$/, '');
  const segments = sanitized.split('/');
  return segments.pop() ?? '';
}

function normalizeAssetUrl(value: string) {
  if (!value) {
    return value;
  }

  return resolveAssetUrl(value, value);
}

function normalizeSrcSet(value: string) {
  if (!value) {
    return value;
  }

  const sources = value
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) {
        return '';
      }

      const [url, ...descriptorParts] = trimmed.split(/\s+/);
      const normalizedUrl = normalizeAssetUrl(url);
      return descriptorParts.length > 0
        ? `${normalizedUrl} ${descriptorParts.join(' ')}`
        : normalizedUrl;
    })
    .filter(Boolean);

  return sources.join(', ');
}

function normalizeArticleHtml(html: string) {
  if (!html) {
    return '';
  }

  let normalized = html.replace(/(src|href)=("|')(asset:\/\/[^"']+)("|')/gi, (match, attr, quote, url) => {
    const resolved = normalizeAssetUrl(url);
    return `${attr}=${quote}${resolved}${quote}`;
  });

  normalized = normalized.replace(/srcset=("|')([^"']+)("|')/gi, (match, quote, value) => {
    const resolved = normalizeSrcSet(value);
    return `srcset=${quote}${resolved}${quote}`;
  });

  normalized = normalized.replace(/poster=("|')(asset:\/\/[^"']+)("|')/gi, (match, quote, url) => {
    const resolved = normalizeAssetUrl(url);
    return `poster=${quote}${resolved}${quote}`;
  });

  return normalized;
}

function normalizeSlugParam(value: string): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function estimateWordCount(value: string) {
  if (!value) {
    return 0
  }

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const result = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item): item is string => item.length > 0)

  return result.length > 0 ? result : undefined
}

function buildFallbackPost(article: FallbackArticlePayload): Post {
  const meta: Record<string, unknown> = isRecord(article.contentlayer_meta) ? article.contentlayer_meta : {}

  const metaString = (key: string) => {
    const value = meta[key]
    return typeof value === 'string' ? value.trim() : ''
  }

  const metaNumber = (key: string) => {
    const value = meta[key]
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  }

  const metaBoolean = (key: string) => {
    const value = meta[key]
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'yes', 'sim'].includes(normalized)) {
        return true
      }
      if (['false', '0', 'no', 'não', 'nao'].includes(normalized)) {
        return false
      }
    }
    return undefined
  }

  const slugFromMeta = normalizeSlugParam(metaString('slug'))
  const normalizedSlug = normalizeSlugParam(slugFromMeta || article.slug || '')
  const effectiveSlug = normalizedSlug || normalizeSlugParam(article.slug) || article.slug
  const rawContent = typeof article.raw_mdx === 'string' && article.raw_mdx.trim().length > 0
    ? article.raw_mdx
    : typeof article.content === 'string'
      ? article.content
      : ''
  const resolvedHtml = article.contentHtml || (typeof article.processed_mdx === 'string' ? article.processed_mdx : '')
  const htmlContent = resolvedHtml
    || (rawContent && /<\s*[a-z][^>]*>/i.test(rawContent) ? rawContent : mdxToHtml(rawContent))
  const wordCount = metaNumber('word_count') ?? article.word_count ?? estimateWordCount(rawContent || htmlContent)
  const readingMinutes = metaNumber('reading_time_minutes') ?? article.reading_time ?? (wordCount ? Math.max(1, Math.round(wordCount / 200)) : 0)
  const readingTime = {
    text: readingMinutes ? `${readingMinutes} min read` : '',
    minutes: readingMinutes ?? 0,
    time: Math.round((readingMinutes ?? 0) * 60 * 1000),
    words: wordCount ?? 0
  }

  const coverCandidate = metaString('cover_asset_id') || metaString('cover_image') || (typeof article.cover_image === 'string' ? article.cover_image : '') || (typeof article.og_image === 'string' ? article.og_image : '') || DEFAULT_SOCIAL_IMAGE
  const ogImageCandidate = metaString('og_image') || metaString('og_image_asset_id') || (typeof article.og_image === 'string' ? article.og_image : '') || coverCandidate
  const canonicalFromMeta = metaString('canonical_url')
  const canonicalFromDb = typeof article.canonical_url === 'string' ? article.canonical_url : ''
  const permalink = metaString('permalink') || `/blog/post/${effectiveSlug}`
  const canonicalUrl = ensureAbsoluteUrl(canonicalFromMeta || canonicalFromDb || permalink, permalink)
  const fallbackMdxCode = 'return { default: function Fallback(){ return null; } };'

  const fallbackPost: Record<string, unknown> = {
    _id: effectiveSlug || article.id || article.slug,
    _raw: {
      sourceFilePath: `${effectiveSlug}.mdx`,
      sourceFileName: `${effectiveSlug}.mdx`,
      sourceFileDir: '.',
      contentType: 'mdx',
      flattenedPath: effectiveSlug
    },
    type: 'Post',
    title: metaString('title') || article.title || humanizeSlug(effectiveSlug),
    subtitle: metaString('subtitle') || article.subtitle || '',
    excerpt: metaString('excerpt') || article.excerpt || '',
    author: metaString('author') || article.reviewed_by || 'Equipe Nova Metálica',
    traduzed_by: metaString('traduzed_by') || undefined,
    site_id: metaString('site_id') || 'blog-nova-metalica',
    date: metaString('date') || article.published_at || article.updated_at || article.created_at || new Date().toISOString(),
    lang: metaString('lang') || article.lang || 'pt-BR',
    cover_asset_id: coverCandidate,
    seo_title: metaString('seo_title') || article.seo_title || undefined,
    seo_description: metaString('seo_description') || article.seo_description || article.excerpt || undefined,
    og_image_asset_id: metaString('og_image_asset_id') || article.og_image || undefined,
    search_vector: undefined,
    tag_ids: toStringArray(meta.tag_ids) ?? (Array.isArray(article.tags) ? article.tags : undefined),
    tags: toStringArray(meta.tags) ?? (Array.isArray(article.tags) ? article.tags : undefined),
    category: metaString('category') || '',
    canonical_url: canonicalFromMeta || canonicalFromDb || undefined,
  robots_index: metaString('robots_index') || article.robots_index || undefined,
  robots_follow: metaString('robots_follow') || article.robots_follow || undefined,
  robots_advanced: metaString('robots_advanced') || undefined,
    sitemap_priority: metaNumber('sitemap_priority'),
  sitemap_changefreq: metaString('sitemap_changefreq') || undefined,
    lastmod: metaString('lastmod') || article.updated_at || undefined,
    breadcrumbs: Array.isArray(meta.breadcrumbs) ? meta.breadcrumbs : undefined,
    permalink,
    og_title: metaString('og_title') || article.seo_title || article.title || undefined,
    og_description: metaString('og_description') || article.seo_description || article.excerpt || undefined,
  og_type: metaString('og_type') || undefined,
  twitter_card: metaString('twitter_card') || undefined,
  twitter_site: metaString('twitter_site') || undefined,
  twitter_creator: metaString('twitter_creator') || undefined,
    author_slug: metaString('author_slug') || undefined,
    author_url: metaString('author_url') || undefined,
    author_avatar_asset_id: metaString('author_avatar_asset_id') || undefined,
    reviewed_by: metaString('reviewed_by') || article.reviewed_by || undefined,
    reviewer_credentials: metaString('reviewer_credentials') || article.reviewer_credentials || undefined,
    fact_checked: metaBoolean('fact_checked') ?? Boolean(article.fact_checked),
    funding_disclosure: metaString('funding_disclosure') || undefined,
    conflicts_of_interest: metaString('conflicts_of_interest') || undefined,
    main_entity_of_page: metaString('main_entity_of_page') || undefined,
    is_accessible_for_free: metaBoolean('is_accessible_for_free') ?? true,
    in_language: metaString('in_language') || undefined,
    article_section: metaString('article_section') || undefined,
    article_tags: toStringArray(meta.article_tags),
    image_meta: isRecord(meta.image_meta) ? meta.image_meta : undefined,
    translated_from_id: metaString('translated_from_id') || undefined,
    alternate_locales: Array.isArray(meta.alternate_locales) ? meta.alternate_locales : undefined,
    related_post_slugs: toStringArray(meta.related_post_slugs),
    series_slug: metaString('series_slug') || undefined,
    series_order: metaNumber('series_order'),
    priority_image: metaBoolean('priority_image'),
    cover_blurhash: metaString('cover_blurhash') || article.cover_blurhash || undefined,
    cover_dominant_color: metaString('cover_dominant_color') || article.cover_dominant_color || undefined,
    tldr: metaString('tldr') || article.tldr || undefined,
    key_takeaways: toStringArray(meta.key_takeaways) ?? (Array.isArray(article.key_takeaways) ? article.key_takeaways : undefined),
  faq: Array.isArray(meta.faq) ? meta.faq : Array.isArray(article.faq) ? article.faq : undefined,
  entities: toStringArray(meta.entities),
  topics: toStringArray(meta.topics),
  citations: Array.isArray(meta.citations) ? meta.citations : undefined,
  license: metaString('license') || undefined,
  content_version: metaString('content_version') || undefined,
  content_hash: metaString('content_hash') || `supabase-${article.id ?? effectiveSlug}`,
  embedding_vector_id: metaString('embedding_vector_id') || undefined,
    chunk_hints: Array.isArray(meta.chunk_hints) ? meta.chunk_hints : undefined,
  reading_time_minutes: readingMinutes,
    word_count: wordCount ?? 0,
    updated_at: metaString('updated_at') || article.updated_at || undefined,
    cover_image: metaString('cover_image') || article.cover_image || undefined,
    og_image: ogImageCandidate,
    slug: effectiveSlug,
  status: metaString('status') || article.status || 'published',
    published_at: metaString('published_at') || article.published_at || undefined,
    body: {
      raw: htmlContent,
      code: fallbackMdxCode,
      compiledSource: '',
      scope: {},
      frontmatter: meta,
    },
    url: canonicalUrl,
  readingTime,
    wordCount: wordCount ?? 0,
    contentHash: `supabase-${article.id ?? effectiveSlug}`,
  }

  return fallbackPost as Post
}

export default function PostSlug({ slug, fallbackArticle }: PostSlugProps) {
    const router = useRouter()

  const categoriesList = categories;

    const routerSlug = extractSlug(router);
    const activeSlug = normalizeSlugParam(slug || routerSlug);
    const fallbackPost = React.useMemo(() => {
      if (!fallbackArticle) {
        return undefined
      }

      try {
        return buildFallbackPost(fallbackArticle)
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Falha ao preparar fallback do artigo:', error)
        }
        return undefined
      }
    }, [fallbackArticle])

  const postFilter = fallbackPost;

  const categoryBreadcrumb = Array.isArray(postFilter?.breadcrumbs)
    ? postFilter?.breadcrumbs?.[1]
    : undefined;
  const categoryFromBreadcrumb = cleanString(
    typeof categoryBreadcrumb?.label === 'string' ? categoryBreadcrumb.label : ''
  );
  const categorySlug = cleanString(postFilter?.category);
  const categoryFromConfig = cleanString(
    categoriesList.find((cat) => cat.slug === categorySlug)?.title
  );
  const computedCategoryTitle = categoryFromBreadcrumb || categoryFromConfig || (categorySlug ? humanizeSlug(categorySlug) : '');
  const categoryTitle = computedCategoryTitle || 'Categoria';

  const authorSlug = cleanString(postFilter?.author_slug);
  const matchedAuthor = authorSlug
    ? authors.find((authorItem) => authorItem.slug === authorSlug)
    : undefined;
  const authorName = cleanString(postFilter?.author)
    || cleanString(matchedAuthor?.name)
  || cleanString(postFilter?.reviewed_by)
    || 'Equipe Nova Metálica';
  const authorCredentials = cleanString(postFilter?.reviewer_credentials)
    || cleanString(matchedAuthor?.credentials);
  const authorAvatarRaw = cleanString(postFilter?.author_avatar_asset_id) || cleanString(matchedAuthor?.avatar_url);
  const authorAvatar = authorAvatarRaw ? normalizeAssetUrl(authorAvatarRaw) : '';

  const imageMeta = (postFilter?.image_meta as ImageMeta | undefined) ?? undefined;
  const routeSlugFromPost = postFilter?.slug ? normalizeSlugParam(String(postFilter.slug)) : '';
  const permalink = cleanString(postFilter?.permalink);
  const normalizedPermalink = permalink ? `/${normalizeSlugParam(permalink)}` : '';
  const canonicalFallbackPath = normalizedPermalink || (routeSlugFromPost ? `/blog/post/${normalizeSlugParam(routeSlugFromPost)}` : '/blog');
  const canonicalUrl = ensureAbsoluteUrl(postFilter?.canonical_url, canonicalFallbackPath);
  const pageUrl = canonicalUrl;
  const lang = cleanString(postFilter?.lang) || 'pt-BR';
  const normalizedLang = lang.replace('_', '-');
  const ogLocale = toOgLocale(normalizedLang);
  const seoTitle = cleanString(postFilter?.seo_title) || cleanString(postFilter?.og_title) || cleanString(postFilter?.title) || DEFAULT_SITE_NAME;
  const metaTitle = seoTitle;
  const seoDescription = cleanString(postFilter?.seo_description)
    || cleanString(postFilter?.og_description)
    || cleanString(postFilter?.excerpt)
    || DEFAULT_SITE_DESCRIPTION;
  const ogTitle = cleanString(postFilter?.og_title) || metaTitle;
  const ogDescription = cleanString(postFilter?.og_description) || seoDescription;
  const ogType = cleanString(postFilter?.og_type) || 'article';
  const twitterCard = cleanString(postFilter?.twitter_card) || 'summary_large_image';
  const twitterSite = normalizeTwitterHandle(postFilter?.twitter_site) || DEFAULT_TWITTER_HANDLE;
  const twitterCreator = normalizeTwitterHandle(postFilter?.twitter_creator) || twitterSite || DEFAULT_TWITTER_HANDLE;
  const ogImageCandidate = cleanString(imageMeta?.url)
    || cleanString(postFilter?.og_image)
    || cleanString(postFilter?.og_image_asset_id)
    || cleanString(postFilter?.cover_image)
    || cleanString(postFilter?.cover_asset_id)
    || DEFAULT_SOCIAL_IMAGE;
  const normalizedOgImage = ogImageCandidate ? normalizeAssetUrl(ogImageCandidate) : DEFAULT_SOCIAL_IMAGE;
  const ogImageUrl = ensureAbsoluteUrl(normalizedOgImage, DEFAULT_SOCIAL_IMAGE);
  const ogImageWidth = typeof imageMeta?.width === 'number' ? String(imageMeta.width) : undefined;
  const ogImageHeight = typeof imageMeta?.height === 'number' ? String(imageMeta.height) : undefined;
  const ogImageAlt = cleanString(imageMeta?.alt)
    || cleanString(imageMeta?.title)
    || cleanString(imageMeta?.caption)
    || cleanString(postFilter?.title)
    || 'Imagem de destaque do Blog Nova Metálica';
  const ogImageType = cleanString(imageMeta?.type);
  const robotsContent = buildRobotsContent(postFilter?.robots_index, postFilter?.robots_follow, postFilter?.robots_advanced);
  const googlebotContent = robotsContent;
  const bingbotContent = robotsContent;
  const publishedTimeIso = toIsoString(postFilter?.published_at || postFilter?.date);
  const modifiedTimeIso = toIsoString(postFilter?.lastmod || postFilter?.updated_at || postFilter?.date);
  const createdTimeIso = toIsoString(postFilter?.date);
  const articleSection = cleanString(postFilter?.article_section) || categoryTitle;

  const tagCollections: string[][] = [
    Array.isArray(postFilter?.article_tags) ? (postFilter?.article_tags as string[]) : [],
    Array.isArray(postFilter?.tags) ? (postFilter?.tags as string[]) : [],
    Array.isArray(postFilter?.topics) ? (postFilter?.topics as string[]) : [],
    Array.isArray(postFilter?.tag_ids) ? (postFilter?.tag_ids as string[]) : [],
  ];

  const keywordSet = new Set<string>();
  tagCollections.forEach((collection) => {
    collection.forEach((item) => {
      const value = cleanString(item);
      if (value) {
        keywordSet.add(value);
      }
    });
  });

  if (categoryTitle) {
    keywordSet.add(categoryTitle);
  }

  const keywords = Array.from(keywordSet);
  const keywordsContent = keywords.join(', ');

  const alternateLocalesRaw = Array.isArray(postFilter?.alternate_locales)
    ? (postFilter?.alternate_locales as AlternateLocale[])
    : [];

  const alternateLocales = alternateLocalesRaw
    .map((entry) => ({
      lang: cleanString(entry?.lang),
      url: cleanString(entry?.url),
    }))
    .filter((entry): entry is { lang: string; url: string } => Boolean(entry.lang && entry.url));

  const alternateLocaleLinks = alternateLocales.map((entry) => ({
    lang: entry.lang,
    url: ensureAbsoluteUrl(entry.url, entry.url),
  }));

  const ogLocaleAlternates = alternateLocaleLinks.map((entry) => toOgLocale(entry.lang.replace('_', '-')));

  const authorUrl = cleanString(postFilter?.author_url) ? ensureAbsoluteUrl(postFilter?.author_url) : '';
  const reviewerName = cleanString(postFilter?.reviewed_by);
  const reviewerCredentials = cleanString(postFilter?.reviewer_credentials);
  const fundingDisclosure = cleanString(postFilter?.funding_disclosure);
  const conflictsOfInterest = cleanString(postFilter?.conflicts_of_interest);
  const mainEntity = cleanString(postFilter?.main_entity_of_page)
    ? ensureAbsoluteUrl(postFilter?.main_entity_of_page)
    : canonicalUrl;
  const isAccessibleForFree = typeof postFilter?.is_accessible_for_free === 'boolean'
    ? postFilter?.is_accessible_for_free
    : true;

  const readingTimeMinutes = typeof postFilter?.reading_time_minutes === 'number'
    ? Math.round(Math.max(postFilter.reading_time_minutes, 1))
    : typeof postFilter?.readingTime?.minutes === 'number'
      ? Math.round(Math.max(postFilter.readingTime.minutes, 1))
      : undefined;
  const timeRequired = readingTimeMinutes ? `PT${readingTimeMinutes}M` : undefined;

  const faqEntries = Array.isArray(postFilter?.faq)
    ? (postFilter?.faq as Array<{ question?: string; answer?: string }>)
        .map((entry) => ({
          question: cleanString(entry?.question),
          answer: cleanString(entry?.answer),
        }))
        .filter((entry) => entry.question && entry.answer)
    : [];

  const citations = Array.isArray(postFilter?.citations)
    ? (postFilter?.citations as Array<{ title?: string; url?: string }>)
        .map((entry) => cleanString(entry?.url) || cleanString(entry?.title))
        .filter(Boolean)
    : [];

  const relatedPostUrls = Array.isArray(postFilter?.related_post_slugs)
    ? (postFilter?.related_post_slugs as string[])
        .map((value) => cleanString(value))
        .filter(Boolean)
        .map((value) => {
          if (!value) {
            return '';
          }

          if (ABSOLUTE_URL_REGEX.test(value) || value.startsWith('//')) {
            return ensureAbsoluteUrl(value);
          }

          const normalizedValue = value.startsWith('/')
            ? value
            : `/blog/post/${normalizeSlugParam(value)}`;
          return ensureAbsoluteUrl(normalizedValue, normalizedValue);
        })
        .filter(Boolean)
    : [];

  const structuredData: Array<Record<string, unknown>> = [];
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metaTitle,
    description: seoDescription,
    mainEntityOfPage: mainEntity,
    inLanguage: cleanString(postFilter?.in_language) || normalizedLang,
    isAccessibleForFree,
    keywords: keywords.length ? keywords.join(', ') : undefined,
    articleSection: articleSection || undefined,
    datePublished: publishedTimeIso || undefined,
    dateModified: modifiedTimeIso || publishedTimeIso || undefined,
    dateCreated: createdTimeIso || undefined,
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
          ...(authorUrl ? { url: authorUrl } : {}),
          ...(authorAvatar ? { image: ensureAbsoluteUrl(authorAvatar, authorAvatar) } : {}),
          ...(authorCredentials ? { jobTitle: authorCredentials } : {}),
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_BRAND_NAME,
      url: DEFAULT_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: ensureAbsoluteUrl(DEFAULT_SOCIAL_IMAGE, DEFAULT_SOCIAL_IMAGE),
      },
    },
    image: ogImageUrl
      ? [{
          '@type': 'ImageObject',
          url: ogImageUrl,
          ...(ogImageWidth ? { width: Number(ogImageWidth) } : {}),
          ...(ogImageHeight ? { height: Number(ogImageHeight) } : {}),
          ...(ogImageAlt ? { caption: ogImageAlt } : {}),
          ...(ogImageType ? { encodingFormat: ogImageType } : {}),
        }]
      : undefined,
    ...(reviewerName
      ? {
          reviewedBy: {
            '@type': 'Person',
            name: reviewerName,
            ...(reviewerCredentials ? { jobTitle: reviewerCredentials } : {}),
          },
        }
      : {}),
    ...(fundingDisclosure ? { funding: fundingDisclosure } : {}),
    ...(conflictsOfInterest ? { conflictsOfInterest } : {}),
    ...(timeRequired ? { timeRequired } : {}),
    ...(postFilter?.word_count ? { wordCount: postFilter.word_count } : {}),
    ...(postFilter?.tldr ? { abstract: postFilter.tldr } : {}),
    ...(citations.length ? { citation: citations } : {}),
  };

  if (alternateLocaleLinks.length > 0) {
    articleSchema.alternateName = alternateLocaleLinks.map((entry) => entry.lang);
  }

  structuredData.push(articleSchema);

  if (faqEntries.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: entry.answer,
        },
      })),
    });
  }

  const { htmlContent: fallbackHtmlContent, mdxContent: fallbackMdxContent } = React.useMemo(() => {
    const bodyRaw = typeof postFilter?.body?.raw === 'string' ? postFilter.body.raw.trim() : ''
    const rawMdx = typeof fallbackArticle?.raw_mdx === 'string' ? fallbackArticle.raw_mdx.trim() : ''
    const legacyMdx = typeof fallbackArticle?.content === 'string' ? fallbackArticle.content.trim() : ''
    const processedHtml = typeof fallbackArticle?.contentHtml === 'string' && fallbackArticle.contentHtml.trim().length > 0
      ? fallbackArticle.contentHtml.trim()
      : typeof fallbackArticle?.processed_mdx === 'string'
        ? fallbackArticle.processed_mdx.trim()
        : ''

    const htmlFromLegacy = legacyMdx && /<\s*[a-z][^>]*>/i.test(legacyMdx) ? legacyMdx : ''
    const htmlCandidates = [bodyRaw, processedHtml, htmlFromLegacy]
    let htmlContent = htmlCandidates.find((candidate) => candidate && candidate.length > 0) ?? ''

    if (!htmlContent && rawMdx) {
      htmlContent = mdxToHtml(rawMdx)
    } else if (!htmlContent && legacyMdx) {
      htmlContent = mdxToHtml(legacyMdx)
    }

    let mdxContent = rawMdx || (legacyMdx && !/<\s*[a-z][^>]*>/i.test(legacyMdx) ? legacyMdx : '')

    if (!mdxContent && htmlContent) {
      mdxContent = htmlToMdx(htmlContent)
    }

    return {
      htmlContent,
      mdxContent,
    }
  }, [postFilter?.body?.raw, fallbackArticle?.raw_mdx, fallbackArticle?.contentHtml, fallbackArticle?.processed_mdx, fallbackArticle?.content])
  const isHtmlBody = Boolean(fallbackHtmlContent) && /<\s*(p|div|span|table|thead|tbody|tr|td|th|ul|ol|li|img|h[1-6]|blockquote|strong|em|figure|figcaption|pre|code|br|hr|section|article)\b/i.test(fallbackHtmlContent.trim());
  const contentRef = React.useRef<HTMLDivElement | null>(null);

    const headings = React.useMemo<ArticleTopic[]>(() => {
      const slugCounts = new Map<string, number>();
      const results: ArticleTopic[] = [];

      if (!fallbackHtmlContent && !fallbackMdxContent) {
        return results;
      }

      if (isHtmlBody) {
        const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
        let match: RegExpExecArray | null;
        const htmlSource = fallbackHtmlContent || '';

        while ((match = headingRegex.exec(htmlSource)) !== null) {
          const level = Number(match[1].substring(1));
          const rawTitle = match[2];
          const title = sanitizeHeadingText(rawTitle);

          if (!title) {
            continue;
          }

          const baseSlug = slugifyHeading(title);

          if (!baseSlug) {
            continue;
          }

          const count = slugCounts.get(baseSlug) ?? 0;
          slugCounts.set(baseSlug, count + 1);

          const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

          results.push({ id, title, level });
        }

        return results;
      }

  const lines = fallbackMdxContent ? fallbackMdxContent.split('\n') : [];
      let inCodeBlock = false;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }

        if (inCodeBlock) {
          continue;
        }

        const match = /^(#{1,6})\s+(.+)$/.exec(trimmed);

        if (!match) {
          continue;
        }

        const level = match[1].length;
        const rawTitle = match[2];
        const title = sanitizeHeadingText(rawTitle);

        if (!title) {
          continue;
        }

        const baseSlug = slugifyHeading(title);

        if (!baseSlug) {
          continue;
        }

        const count = slugCounts.get(baseSlug) ?? 0;
        slugCounts.set(baseSlug, count + 1);

        const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

        results.push({ id, title, level });
      }

      return results;
  }, [fallbackHtmlContent, fallbackMdxContent, isHtmlBody]);

    React.useEffect(() => {
      if (!contentRef.current) {
        return;
      }

      const headingElements = Array.from(
        contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      ) as HTMLElement[];

      let index = 0;

      for (const element of headingElements) {
        if (index >= headings.length) {
          break;
        }

        element.id = headings[index].id;
        index += 1;
      }
    }, [headings]);

  const htmlContent = fallbackHtmlContent;
  const normalizedHtmlContent = React.useMemo(() => {
    if (!htmlContent) {
      return '';
    }
    return normalizeArticleHtml(htmlContent);
  }, [htmlContent]);
  const isLoading = !activeSlug || !postFilter;

  if (isLoading) {
    return (
      <ContainerPost>
        <LoadingWrapper>
          <LoadingSpinner />
          <LoadingText>Carregando artigo...</LoadingText>
        </LoadingWrapper>
      </ContainerPost>
    );
  }

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta key="description" name="description" content={seoDescription} />
        {keywordsContent ? <meta key="keywords" name="keywords" content={keywordsContent} /> : null}
        <meta key="language" name="language" content={normalizedLang} />
        <meta key="author" name="author" content={authorName} />
        <meta key="publisher" name="publisher" content={DEFAULT_BRAND_NAME} />
        <meta key="robots" name="robots" content={robotsContent} />
        <meta key="googlebot" name="googlebot" content={googlebotContent} />
        <meta key="bingbot" name="bingbot" content={bingbotContent} />
        <meta key="article:author" property="article:author" content={authorUrl || authorName} />
        {articleSection ? <meta key="category" name="category" content={articleSection} /> : null}
        {publishedTimeIso ? <meta key="citation_publication_date" name="citation_publication_date" content={publishedTimeIso} /> : null}
        <meta key="og:title" property="og:title" content={ogTitle} />
        <meta key="og:description" property="og:description" content={ogDescription} />
        <meta key="og:type" property="og:type" content={ogType} />
        <meta key="og:url" property="og:url" content={pageUrl} />
        <meta key="og:site_name" property="og:site_name" content={DEFAULT_SITE_NAME} />
        <meta key="og:locale" property="og:locale" content={ogLocale} />
        {ogLocaleAlternates.map((locale) => (
          <meta key={`og:locale:alternate:${locale}`} property="og:locale:alternate" content={locale} />
        ))}
        <meta key="og:image" property="og:image" content={ogImageUrl} />
        <meta key="og:image:secure_url" property="og:image:secure_url" content={ogImageUrl} />
        {ogImageAlt ? <meta key="og:image:alt" property="og:image:alt" content={ogImageAlt} /> : null}
        {ogImageWidth ? <meta key="og:image:width" property="og:image:width" content={ogImageWidth} /> : null}
        {ogImageHeight ? <meta key="og:image:height" property="og:image:height" content={ogImageHeight} /> : null}
        {ogImageType ? <meta key="og:image:type" property="og:image:type" content={ogImageType} /> : null}
        {publishedTimeIso ? <meta key="article:published_time" property="article:published_time" content={publishedTimeIso} /> : null}
        {modifiedTimeIso ? <meta key="article:modified_time" property="article:modified_time" content={modifiedTimeIso} /> : null}
        {modifiedTimeIso ? <meta key="og:updated_time" property="og:updated_time" content={modifiedTimeIso} /> : null}
        {createdTimeIso ? <meta key="article:created_time" property="article:created_time" content={createdTimeIso} /> : null}
        {articleSection ? <meta key="article:section" property="article:section" content={articleSection} /> : null}
        {keywords.map((tag) => (
          <meta key={`article:tag:${tag}`} property="article:tag" content={tag} />
        ))}
        {relatedPostUrls.map((url) => (
          <meta key={`og:see_also:${url}`} property="og:see_also" content={url} />
        ))}
        <meta key="twitter:card" name="twitter:card" content={twitterCard} />
        <meta key="twitter:title" name="twitter:title" content={ogTitle} />
        <meta key="twitter:description" name="twitter:description" content={ogDescription} />
        <meta key="twitter:image" name="twitter:image" content={ogImageUrl} />
        {ogImageAlt ? <meta key="twitter:image:alt" name="twitter:image:alt" content={ogImageAlt} /> : null}
        <meta key="twitter:url" name="twitter:url" content={pageUrl} />
        {twitterSite ? <meta key="twitter:site" name="twitter:site" content={twitterSite} /> : null}
        {twitterCreator ? <meta key="twitter:creator" name="twitter:creator" content={twitterCreator} /> : null}
        {timeRequired ? <meta key="reading-time" name="estimated-reading-time" content={timeRequired} /> : null}
        <link key="canonical" rel="canonical" href={pageUrl} />
        <link key={`alternate-${normalizedLang}`} rel="alternate" hrefLang={normalizedLang} href={pageUrl} />
        <link key="alternate-x-default" rel="alternate" hrefLang="x-default" href={pageUrl} />
        {alternateLocaleLinks.map((entry) => (
          <link key={`alternate-${entry.lang}`} rel="alternate" hrefLang={entry.lang} href={entry.url} />
        ))}
        {authorUrl ? <link key="author-profile" rel="author" href={authorUrl} /> : null}
        {structuredData.map((schema, index) => (
          <script
            key={`ldjson-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>
      <ContainerPost>
        <ArticleSection
          title={postFilter?.title ?? 'Artigo'}
          date={postFilter?.date}
          category={categoryTitle}
          excerpt={postFilter?.excerpt}
          author={authorName}
          author_profission={authorCredentials || undefined}
          authorImage={authorAvatar || undefined}
          topic={headings}
        >
          <MDXContainer ref={contentRef}>
            {normalizedHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: normalizedHtmlContent }} />
            ) : (
              <noscript />
            )}
          </MDXContainer>
        </ArticleSection>
      </ContainerPost>
    </>
  );
}

type PostPageParams = {
  slug: string
}

export const getStaticPaths: GetStaticPaths<PostPageParams> = async () => {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published')

    if (error) {
      throw error
    }

    const slugs = Array.isArray(data) ? data : []
    const paths = slugs
      .map((row) => (typeof row?.slug === 'string' ? normalizeSlugParam(row.slug) : ''))
      .filter((slugValue): slugValue is string => Boolean(slugValue))
      .map((slugValue) => ({ params: { slug: slugValue } }))

    return {
      paths,
      fallback: 'blocking'
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Falha ao gerar paths de artigos a partir do Supabase:', error)
    }

    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<PostSlugProps, PostPageParams> = async ({ params }) => {
  const slugParam = typeof params?.slug === 'string' ? params.slug : ''
  const normalizedSlug = normalizeSlugParam(slugParam)

  try {
    const supabaseArticle = await articlesRepository.getBySlug(normalizedSlug)
    if (!supabaseArticle) {
      throw new Error('Artigo não encontrado no Supabase')
    }

    if (supabaseArticle.status !== 'published') {
      return {
        notFound: true,
        revalidate: 60
      }
    }

    let rawMdx = typeof supabaseArticle.raw_mdx === 'string' ? supabaseArticle.raw_mdx : ''
    const legacyContent = typeof supabaseArticle.content === 'string' ? supabaseArticle.content : ''
    const rawContent = rawMdx || legacyContent
  const processedHtmlRaw = typeof supabaseArticle.processed_mdx === 'string' ? supabaseArticle.processed_mdx : ''
    let trimmedProcessed = processedHtmlRaw.trim()
    const trimmedRawContent = (rawContent ?? '').trim()
    const contentLooksHtml = trimmedRawContent ? /<\s*[a-z][^>]*>/i.test(trimmedRawContent) : false
    let resolvedHtml = trimmedProcessed
      || (contentLooksHtml ? trimmedRawContent : '')
      || mdxToHtml(trimmedRawContent)

    // Migration-safe fallback: if DB has no content yet, source from local MDX file and persist back to Supabase
    if (!resolvedHtml || resolvedHtml.trim().length === 0) {
      try {
        const fileContent = await readArticleContent(normalizedSlug)
        if (typeof fileContent === 'string' && fileContent.trim().length > 0) {
          rawMdx = fileContent.trim()
          resolvedHtml = mdxToHtml(rawMdx)
          trimmedProcessed = resolvedHtml

          // Persist back so next requests render directly from Supabase
          try {
            await articlesRepository.update(supabaseArticle.id, {
              raw_mdx: rawMdx,
              processed_mdx: resolvedHtml,
              content: rawMdx,
            })
          } catch (persistError) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Falha ao persistir conteúdo de fallback no Supabase:', persistError)
            }
          }
        }
      } catch (fsError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Fallback local MDX ausente para o artigo:', fsError)
        }
      }
    }

    const contentHtml = typeof resolvedHtml === 'string' ? resolvedHtml : ''
    const resolvedRawMdx = rawMdx || (contentLooksHtml ? htmlToMdx(trimmedRawContent) : trimmedRawContent)

    const fallbackArticle: FallbackArticlePayload = JSON.parse(
      JSON.stringify({
        ...supabaseArticle,
        raw_mdx: resolvedRawMdx,
        processed_mdx: contentHtml,
        content: resolvedRawMdx,
        contentHtml,
      })
    ) as FallbackArticlePayload

    return {
      props: {
        slug: normalizedSlug || supabaseArticle.slug,
        fallbackArticle
      },
      revalidate: 60
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Falha ao carregar artigo do Supabase para fallback:', error)
    }

    return {
      notFound: true,
      revalidate: 60
    }
  }
}