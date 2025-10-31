import styled from '@emotion/styled'
import { useEffect } from 'react'
import Card from '../ui/card'
import { categories } from '@/content/categories'
import { media } from '@/styles/media'
import { useRouter } from 'next/router'
import type { ArticlePreview } from '@/types/article-preview'
import { resolveAssetUrl } from '@/util/assets'
import AOS from 'aos'

const Container = styled.section`
    width: 100%;
    padding: 1.5% 5%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: auto;
    gap: 12px;
    position: relative;
    z-index: 4;

    ${media('mobile')} {
        grid-template-columns: repeat(1, 1fr);
        padding: 2px;
        width: calc(100% - 10%);
    }

    & .card {
        width: 100%;
    }
`

interface GridSectionProps {
    posts?: ArticlePreview[]
}

export default function GridSection({ posts = [] }: GridSectionProps) {
    const router = useRouter()

    useEffect(() => {
        AOS.refresh()
    }, [posts.length])

    const resolveCategoryTitle = (slug: string, fallback: string) => {
        if (fallback) {
            return fallback
        }

        const match = categories.find((category) => category.slug === slug)
        return match?.title ?? 'Sem categoria'
    }

    const resolveCover = (cover: string) =>
        resolveAssetUrl(cover, '/assets/logo/logotipo-nova-metalica-branca.png')

    return (
        <Container data-aos='fade-up' data-aos-delay='200'>
            {posts.map((post, index) => {
                const targetPath = post.permalink.startsWith('/') ? post.permalink : `/${post.permalink}`
                return (
                    <Card
                        onClick={() => {
                            void router.push(targetPath)
                        }}
                        key={`${post.id}-${post.slug}`}
                        className='card'
                        cover_asset_url={resolveCover(post.coverImage)}
                        title={post.title || 'Artigo sem título'}
                        excerpt={post.excerpt || ''}
                        category={resolveCategoryTitle(post.categorySlug, post.categoryTitle)}
                        author={post.authorName || 'Equipe Nova Metálica'}
                        date={post.publishedAt || ''}
                        dataAos='fade-up'
                        dataAosDelay={Math.min(index, 5) * 100}
                    />
                )
            })}
        </Container>
    )
}