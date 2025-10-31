import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { List } from '@phosphor-icons/react';
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
        height: auto;
        min-height: auto;
        position: relative;
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

const FloatingButton = styled.button`
    position: fixed;
    bottom: 24px;
    right: 18px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid ${(props) => rgba(props.theme.color.primary.light, 0.4)};
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => rgba(props.theme.color.black[0], 0.86)};
    color: ${(props) => props.theme.color.gray[300]};
    cursor: pointer;
    z-index: 1005;
    transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;

    &:hover,
    &:focus-visible {
        transform: translateY(-2px);
        border-color: ${(props) => props.theme.color.primary.main};
        outline: none;
    }
`;

const SheetOverlay = styled.button`
    position: fixed;
    inset: 0;
    background: rgba(3, 7, 16, 0.65);
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    z-index: 1003;
`;

const SheetContainer = styled.section`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 70dvh;
    background: ${(props) => rgba(props.theme.color.black[0], 0.94)};
    backdrop-filter: blur(18px);
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
    border: 1px solid ${(props) => rgba(props.theme.color.primary.light, 0.18)};
    box-shadow: 0 -24px 48px rgba(3, 7, 16, 0.45);
    display: flex;
    flex-direction: column;
    padding: 28px 24px 32px;
    z-index: 1004;
    overflow-y: auto;
`;

const SheetHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const SheetTitle = styled.h2`
    font-size: ${(props) => props.theme.font.size.md};
    color: ${(props) => props.theme.color.gray[300]};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    letter-spacing: 0.02em;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${(props) => props.theme.color.gray[100]};
    font-size: ${(props) => props.theme.font.size.extra_sm};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 999px;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover,
    &:focus-visible {
        background-color: ${(props) => rgba(props.theme.color.primary.main, 0.18)};
        color: ${(props) => props.theme.color.gray[300]};
        outline: none;
    }
`;

const TopicsList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TopicButton = styled.button<{ depth: number }>`
    width: 100%;
    text-align: left;
    border: 1px solid ${(props) => rgba(props.theme.color.primary.light, 0.14)};
    background: ${(props) => rgba(props.theme.color.black[100], 0.55)};
    color: ${(props) => props.theme.color.gray[300]};
    font-size: ${(props) => props.theme.font.size.extra_sm};
    font-weight: ${(props) => props.theme.font.weight.semi_bold};
    padding: 12px 16px;
    padding-left: ${(props) => 20 + Math.max(0, props.depth - 1) * 16}px;
    border-radius: 18px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    transition: background-color 0.24s ease, transform 0.24s ease, border-color 0.24s ease;

    &:hover,
    &:focus-visible {
        background-color: ${(props) => rgba(props.theme.color.primary.main, 0.16)};
        border-color: ${(props) => rgba(props.theme.color.primary.main, 0.45)};
        transform: translateX(4px);
        outline: none;
    }
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

                {
                    isMobile ? (
                        <AuthorSection
                            author={author}
                            author_profission={author_profission}
                            authorImage={authorImage}
                        />
                    ) : (
                        <>
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
                        </>
                    )
                }
            </Container>
            {isMobile && topic.length > 0 && (
                <MobileArticleIndex topics={topic} />
            )}
        </>
    )
}

interface MobileArticleIndexProps {
    topics: ArticleTopic[]
}

function MobileArticleIndex({ topics }: MobileArticleIndexProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            return undefined
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen])

    const handleNavigate = useCallback((targetId: string) => {
        const element = document.getElementById(targetId)

        if (element) {
            try {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } catch (error) {
                console.warn('Falha ao posicionar para o índice', error)
                element.scrollIntoView()
            }
        }

        setIsOpen(false)
    }, [])

    if (topics.length === 0) {
        return null
    }

    return (
        <>
            <FloatingButton
                type='button'
                aria-label='Abrir índice do artigo'
                onClick={() => setIsOpen(true)}
            >
                <List size={28} weight='bold' />
            </FloatingButton>
            {isOpen && (
                <>
                    <SheetOverlay
                        type='button'
                        aria-label='Fechar índice'
                        onClick={() => setIsOpen(false)}
                    />
                    <SheetContainer>
                        <SheetHeader>
                            <SheetTitle>Índice do artigo</SheetTitle>
                            <CloseButton type='button' onClick={() => setIsOpen(false)}>
                                Fechar
                            </CloseButton>
                        </SheetHeader>
                        <TopicsList>
                            {topics.map((topicItem) => (
                                <TopicButton
                                    key={topicItem.id}
                                    depth={topicItem.level}
                                    type='button'
                                    onClick={() => handleNavigate(topicItem.id)}
                                >
                                    {topicItem.title}
                                </TopicButton>
                            ))}
                        </TopicsList>
                    </SheetContainer>
                </>
            )}
        </>
    )
}