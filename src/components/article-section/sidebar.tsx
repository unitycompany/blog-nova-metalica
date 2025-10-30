import styled from '@emotion/styled';
import AuthorSection from './author';
import ArticleNavigation, { ArticleTopic } from '../navigation/navigation';
import { rgba } from 'polished';
import Text from '../text';
import { media } from '@/styles/media';
import { useIsMobile } from '@/hooks/useIsMobile';

const Container = styled.aside`
    width: 300px;
    position: sticky;
    top: 0px;
    min-height: 100dvh;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    background-color: ${(props) => rgba(props.theme.color.black[100], 0.4)};
    backdrop-filter: blur(8px);
    box-shadow: inset ${(props) => props.theme.lines.right} ${(props) => props.theme.color.black[500]};

    ${media('mobile')}{
        width: 100%;
    }

    & .policy {
        width: 100%;
        padding: 5% 10%;
        font-size: ${(props) => props.theme.font.size.extra_sm};
        color: ${(props) => props.theme.color.gray[100]};
        font-weight: ${(props) => props.theme.font.weight.light};
        text-align: center;
        box-shadow: ${(props) => props.theme.lines.top} ${(props) => props.theme.color.black[500]};
    }
`;

const Top = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    height: 100%;
`;

interface SidebarArticleSectionProps {
    author?: string;
    author_profission?: string;
    authorImage?: string;
    topic?: ArticleTopic[];
}

export default function SidebarArticleSection({
    author,
    author_profission,
    authorImage,
    topic = [],  
}: SidebarArticleSectionProps){

    const isMobile = useIsMobile();

    return (
        <>
            <Container>
                <Top>
                    <AuthorSection
                        author={author}
                        author_profission={author_profission}
                        authorImage={authorImage}
                    />
                    {!isMobile && (
                        <ArticleNavigation topic={topic} />
                    )}
                </Top>
                <Text
                    className='policy'
                >
                    © 2024 Nova Metálica. Todos os direitos reservados.
                </Text>
            </Container>
        </>
    )
}