import { useRouter } from "next/router"
import { allPosts } from "contentlayer/generated";
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { Post } from 'contentlayer/generated';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import ArticleSection from "@/components/article-section";
import { ArticleTopic } from "@/components/navigation/navigation";
import { categories } from "@/content/categories";
import { authors } from "@/content/authors";
import { useMDXComponent } from 'next-contentlayer/hooks';
import Link from "next/link";
import React from "react";
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import type { NextRouter } from 'next/router';
import { media } from "@/styles/media";
import { resolveAssetUrl } from '@/util/assets';
// ...existing code...

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

type PostSlugProps = {
  slug: string
}

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

function getPostSlugCandidates(post: Post): string[] {
  const candidates = new Set<string>()

  const primarySlug = normalizeSlugParam(typeof post.slug === 'string' ? post.slug : '')
  if (primarySlug) {
    candidates.add(primarySlug)
    const leaf = primarySlug.split('/').pop()
    if (leaf) {
      candidates.add(leaf)
    }
  }

  const flattenedPath = normalizeSlugParam(
    typeof post._raw?.flattenedPath === 'string' ? post._raw.flattenedPath : ''
  )
  if (flattenedPath) {
    candidates.add(flattenedPath)
    const leaf = flattenedPath.split('/').pop()
    if (leaf) {
      candidates.add(leaf)
    }
  }

  return Array.from(candidates)
}

function findPostBySlug(slug: string): Post | undefined {
  const normalizedTarget = normalizeSlugParam(slug)
  if (!normalizedTarget) {
    return undefined
  }

  return allPosts.find((post) => {
    const candidates = getPostSlugCandidates(post)
    return candidates.some((candidate) => normalizeSlugParam(candidate) === normalizedTarget)
  })
}

function getRouteSlugFromPost(post: Post): string {
  const candidates = getPostSlugCandidates(post)
  const leafCandidate = candidates.find((candidate) => !candidate.includes('/'))
  if (leafCandidate) {
    return leafCandidate
  }

  const fallback = candidates[0] ?? ''
  if (!fallback) {
    return ''
  }

  const leaf = fallback.split('/').pop()
  return leaf ?? fallback
}

export default function PostSlug({ slug }: PostSlugProps) {
    const router = useRouter()

  const categoriesList = categories;

    const routerSlug = extractSlug(router);
    const activeSlug = normalizeSlugParam(slug || routerSlug);
    const postFilter = findPostBySlug(activeSlug);

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

  const rawBody = postFilter?.body?.raw ?? '';
  const isHtmlBody = Boolean(rawBody) && /<\s*(p|div|span|table|thead|tbody|tr|td|th|ul|ol|li|img|h[1-6]|blockquote|strong|em|figure|figcaption|pre|code|br|hr|section|article)\b/i.test(rawBody.trim());
  const contentRef = React.useRef<HTMLDivElement | null>(null);

    const headings = React.useMemo<ArticleTopic[]>(() => {
      const slugCounts = new Map<string, number>();
      const results: ArticleTopic[] = [];

      if (!rawBody) {
        return results;
      }

      if (isHtmlBody) {
        const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
        let match: RegExpExecArray | null;

        while ((match = headingRegex.exec(rawBody)) !== null) {
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

      const lines = rawBody.split('\n');
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
    }, [rawBody, isHtmlBody]);

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

    /* Mantemos apenas mapeamento mínimo (usa MDXContainer para estilos globais) */
    const mdxComponents: MDXComponents = {
      a: MDXLink,
      img: MDXImage,
    };

  const fallbackMdxCode = 'return { default: function Empty(){ return null; } };';
  const mdxCodeCandidate = typeof postFilter?.body?.code === 'string'
    ? String(postFilter?.body?.code ?? '')
    : '';
  const mdxCode = mdxCodeCandidate.trim()
    ? mdxCodeCandidate
    : fallbackMdxCode;
  const MDXContent = useMDXComponent(mdxCode);
  const htmlContent = isHtmlBody && rawBody ? rawBody : null;
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
                        <MDXContent components={mdxComponents} />
                      )}
                    </MDXContainer>
                </ArticleSection>
            </ContainerPost>
        </> 
    )
}

type PostPageParams = {
  slug: string
}

export const getStaticPaths: GetStaticPaths<PostPageParams> = async () => {
  const uniqueSlugs = Array.from(
    new Set(
      allPosts
        .map((post) => getRouteSlugFromPost(post))
        .map((slugValue) => normalizeSlugParam(slugValue))
        .filter((slugValue) => Boolean(slugValue))
    )
  )

  const paths = uniqueSlugs.map((slugValue) => ({
    params: { slug: slugValue }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps<PostSlugProps, PostPageParams> = async ({ params }) => {
  const slugParam = typeof params?.slug === 'string' ? params.slug : ''
  const normalizedSlug = normalizeSlugParam(slugParam)
  const matchedPost = findPostBySlug(normalizedSlug)

  if (!matchedPost) {
    return {
      notFound: true,
      revalidate: 60
    }
  }

  return {
    props: {
      slug: normalizedSlug || getRouteSlugFromPost(matchedPost)
    },
    revalidate: 60
  }
}