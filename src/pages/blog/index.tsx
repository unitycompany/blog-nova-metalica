import styled from '@emotion/styled'
import type { GetStaticProps } from 'next'
import HeroSection from '@/components/hero-section'
import type { ArticlePreview } from '@/types/article-preview'
import { getPublishedArticlePreviews } from '@/lib/articles/previews'

const BlogContainer = styled.main`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
`

type BlogPageProps = {
    initialPosts: ArticlePreview[]
}

export default function Blog({ initialPosts }: BlogPageProps) {
    return (
        <BlogContainer>
            <HeroSection initialPosts={initialPosts} />
        </BlogContainer>
    )
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
    try {
        const { articles } = await getPublishedArticlePreviews()

        return {
            props: {
                initialPosts: articles
            },
            revalidate: 60
        }
    } catch (error) {
        console.error('Failed to load published articles for blog page:', error)

        return {
            props: {
                initialPosts: []
            },
            revalidate: 60
        }
    }
}