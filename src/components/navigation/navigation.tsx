import styled from '@emotion/styled';
import Text from '../text';

export type ArticleTopic = {
    id: string;
    title: string;
    level: number;
};

const Container = styled.nav`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10%;
    gap: 16px;
    position: relative;
    box-shadow: ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.black[500]};

    & h4 {
        font-size: ${(props) => props.theme.font.size.md};
        font-weight: ${(props) => props.theme.font.weight.regular};
        color: ${(props) => props.theme.color.gray[500]};
    }

    & ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 0;
        margin: 0;
    }
`

const NavItem = styled.li<{ $level: number }>`
    width: 100%;
    font-size: ${(props) => props.theme.font.size.sm};
    font-weight: ${(props) => props.theme.font.weight.light};
    color: ${(props) => props.theme.color.gray[100]};
`

const NavAnchor = styled.a<{ $level: number }>`
    display: inline-block;
    width: 100%;
    padding-left: ${(props) => Math.max(props.$level - 1, 0) * 12}px;
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        text-decoration: underline;
        color: ${(props) => props.theme.color.gray[500]};
    }
`

interface ArticleNavigationProps {
    topic?: ArticleTopic[];
    onNavigate?: (targetId: string) => void;
    className?: string;
}

export default function ArticleNavigation({
    topic = [],
    onNavigate,
    className
}: ArticleNavigationProps) {
    return (
        <>
            <Container className={className}>
                <Text
                    as='h4'
                >
                    Navegue pelo artigo
                </Text>
                <ul>
                    {
                        topic.map(({ id, title, level }) => (
                            <NavItem key={id} $level={level}>
                                <NavAnchor
                                    href={`#${id}`}
                                    $level={level}
                                    onClick={() => onNavigate?.(id)}
                                >
                                    <Text as='p'>
                                        {title}
                                    </Text>
                                </NavAnchor>
                            </NavItem>
                        ))
                    }
                </ul>
            </Container>
        </>
    )
}