import HomeSection from "@/components/templates/home";
import styled from '@emotion/styled';
import type { GetStaticProps } from 'next';
import type { ArticlePreview } from '@/types/article-preview';
import { getContentlayerArticlePreviews, getPublishedArticlePreviews } from '@/lib/articles/previews';

const ContainerHome = styled.article`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
`

type HomePageProps = {
  initialPosts: ArticlePreview[]
}

export default function Home({ initialPosts }: HomePageProps) {
  return (
    <>
      <ContainerHome>
        <HomeSection initialPosts={initialPosts} />
      </ContainerHome>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const { articles } = await getPublishedArticlePreviews()

    return {
      props: {
        initialPosts: articles
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Failed to load published articles for home page:', error)

    return {
      props: {
        initialPosts: getContentlayerArticlePreviews()
      },
      revalidate: 60
    }
  }
}
