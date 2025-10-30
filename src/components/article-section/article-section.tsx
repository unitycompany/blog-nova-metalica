import ArticleHeader from "./header";
import styled from '@emotion/styled';
import SidebarArticleSection from "./sidebar";
import { media } from "@/styles/media";
import { ArticleTopic } from "../navigation/navigation";

const Container = styled.article`
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 2.5%;
    position: relative;

    ${media('mobile')} {
        flex-direction: column-reverse;
    }
`

const Main = styled.main`
    flex: 1;
    min-width: 0;
    position: relative;
    padding: 2.5%;
    background-color: ${(props) => props.theme.color.gray[500]};

    ${media('mobile')}{
        padding: 2.5% 5%;            
    }
`

interface ArticleSectionProps {
    category?: string;
    date?: string;
    title?: string;
    excerpt?: string;
    children?: React.ReactNode;
    author?: string;
    author_profission?: string;
    authorImage?: string;
    topic?: ArticleTopic[];
}

export default function ArticleSection({
    category = 'Categoria',
    date = '27/04/2024',
    title = 'Título do artigo',
    excerpt = 'Este é um resumo do artigo que fornece uma visão geral do conteúdo abordado no post.',
    children,
    author,
    author_profission,
    authorImage,
    topic= [],
}: ArticleSectionProps) {
    return (
        <>
            <ArticleHeader 
                category={category}
                date={date}
                title={title}
                excerpt={excerpt}
            />
            <Container>
                
                <Main>
                    {children}
                </Main>
                <SidebarArticleSection 
                    author={author}
                    authorImage={authorImage}
                    author_profission={author_profission}
                    topic={topic}
                />  
            </Container>
        </>
    )
}