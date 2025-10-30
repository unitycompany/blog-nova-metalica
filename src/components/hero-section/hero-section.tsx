import styled from '@emotion/styled'
import Text from '../text'
import Category from '../category/category'
import { useEffect, useMemo, useState } from 'react'
import Search from '../search/search'
import { media } from '../../styles/media'
import GridSection from '../grid-section'
import type { ArticlePreview } from '@/types/article-preview'
import { resolveAssetUrl } from '@/util/assets'
import { getContentlayerArticlePreviews } from '@/lib/articles/previews'

const Container = styled.section`
    width: 100%;
    padding: 2.5% 0 0 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 32px;

    ${media('mobile')}{
        gap: 18px;
    }

    & .titles-sec {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        padding: 1% 0;

        ${media('mobile')}{
            text-align: center;
            align-items: center;
            padding: 2.5% 5%;
        }
        
        & .title {
            font-size: ${(props) => props.theme.font.size.extra_lg};
            font-weight: ${(props) => props.theme.font.weight.semi_bold};
            line-height: ${(props) => props.theme.font.height.md};
            color: transparent;
            position: relative;
            background: linear-gradient(90deg, #FFF 20%, ${(props) => props.theme.color.gray[300]} 40%, ${(props) => props.theme.color.gray[100]} 60%, #FFF 80%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% auto;
            animation: shine 2s linear infinite;

            @keyframes shine {
                to {
                    background-position: 200% center;
                }
            }

            ${media('mobile')}{
                font-size: ${(props) => props.theme.font.size.lg};
            }
        }

        & .subtitle {
            font-size: ${(props) => props.theme.font.size.md};
            font-weight: ${(props) => props.theme.font.weight.regular};
            line-height: ${(props) => props.theme.font.height.md};
            color: ${(props) => props.theme.color.gray[100]};
            width: 80%;
            text-align: center;

            ${media('mobile')}{
                width: 100%;
                text-align: center;
                font-size: ${(props) => props.theme.font.size.sm};
            }
        }
    }

    & .navigation-sec{
        width: 100%;
        padding: 0 10%;
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        ${media('mobile')}{
            padding: 0;
        }
    }
`

type ApiArticlesResponse = {
    articles?: ArticlePreview[]
}
type HeroSectionProps = {
    initialPosts?: ArticlePreview[]
}

export default function HeroSection({ initialPosts = [] }: HeroSectionProps) {
    const [categoryActive, setCategoryActive] = useState('Todos')
    const [searchQuery, setSearchQuery] = useState('')
    const [posts, setPosts] = useState<ArticlePreview[]>(() => {
        if (initialPosts.length > 0) {
            return initialPosts
        }
        return getContentlayerArticlePreviews()
    })

    useEffect(() => {
        if (initialPosts.length === 0) {
            return
        }

        setPosts((current) => {
            if (current.length > 0) {
                return current
            }
            return initialPosts
        })
    }, [initialPosts])

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        async function fetchArticles() {
            try {
                const response = await fetch('/api/public/articles', {
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const payload = (await response.json()) as ApiArticlesResponse
                const items = Array.isArray(payload.articles) ? payload.articles : []
                const normalizedItems = items.map((item) => ({
                    ...item,
                    coverImage: resolveAssetUrl(
                        item.coverImage,
                        '/assets/logo/logotipo-nova-metalica-branca.png'
                    )
                }))

                        if (!isMounted) {
                    return
                }

                setPosts(normalizedItems)
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') {
                    return
                }
                console.error('Falha ao carregar artigos publicados:', error)
            }
        }

        void fetchArticles()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    const postsByCategory = useMemo(() => {
        if (categoryActive === 'Todos') {
            return posts
        }

        return posts.filter((post) => post.categorySlug === categoryActive)
    }, [categoryActive, posts])

    const filteredPosts = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()

        if (!normalizedQuery) {
            return postsByCategory
        }

        return postsByCategory.filter((post) => {
            const title = (post.title || '').toLowerCase()
            const excerpt = (post.excerpt || '').toLowerCase()
            const author = (post.authorName || '').toLowerCase()

            return title.includes(normalizedQuery) || excerpt.includes(normalizedQuery) || author.includes(normalizedQuery)
        })
    }, [postsByCategory, searchQuery])

    return (
        <Container>
            <div className='titles-sec'>
                <Text as='h1' className='title'>
                    Explore nossos artigos
                </Text>
                <Text as='p' className='subtitle'>
                    Todos os artigos são revisados e garantidos que estão passsando a informação de forma correta
                </Text>
            </div>
            <div className='navigation-sec'>
                <Category categoryActive={categoryActive} setCategoryActive={setCategoryActive} posts={posts} />
                <Search onSearch={setSearchQuery} />
            </div>
            <GridSection posts={filteredPosts} />
        </Container>
    )
}