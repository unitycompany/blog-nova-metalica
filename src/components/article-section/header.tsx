import styled from '@emotion/styled';
import Icon from '../ui/icon';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import Text from '../text';
import { media } from '@/styles/media';

const Container = styled.header`
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0% 2.5% 0 2.5%;
    gap: 12px;

    ${media('mobile')}{
        padding: 0% 2.5% 0 2.5%;
    }

    & .range-infos {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        padding: 12px 2.5%;

        ${media('mobile')}{
            padding: 12px 5%;
        }
        
        & .icon {
            border: 1px solid ${(props) => props.theme.color.gray[500]};
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;

            ${media('mobile')}{
                width: 32px;
                height: 32px;    
            }

            & svg {
                width: 20px;
                height: 20px;

                ${media('mobile')}{
                    width: 16px;
                    height: 16px;    
                }
            }
        }

        & .div-infos {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: auto;
            flex: 1;

            & .category {
                font-size: ${(props) => props.theme.font.size.md};
                color: ${(props) => props.theme.color.gray[500]};
                line-height: 1;
            }
    
            & .date {
                font-size: ${(props) => props.theme.font.size.extra_sm};
                color: ${(props) => props.theme.color.gray[100]};
                line-height: 1;
            }
        }

    }

    & .titles {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 12px;
        padding: 32px 2.5%;
        position: relative;
        box-shadow: ${(props) => props.theme.lines.top} ${(props) => props.theme.color.black[500]},
                    ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.black[500]};

        ${media('mobile')}{
            padding: 32px 5%;
        }

        & .title {
            font-size: ${(props) => props.theme.font.size.lg};
            font-weight: ${(props) => props.theme.font.weight.regular};
            color: ${(props) => props.theme.color.gray[500]};
            line-height: 1.2;
            width: 80%;

            ${media('mobile')}{
                font-size: ${(props) => props.theme.font.size.extra_md};
                width: 100%;    
            }
        }

        & .excerpt {
            font-size: ${(props) => props.theme.font.size.md};
            color: ${(props) => props.theme.color.gray[100]};
            font-weight: ${(props) => props.theme.font.weight.light};
            line-height: 1.3;
            width: 80%;

            ${media('mobile')}{
                font-size: ${(props) => props.theme.font.size.sm};
                width: 100%;        
            }
        }
    }
`

interface ArticleHeaderProps {
    category?: string;
    date?: string;
    title?: string;
    excerpt?: string;
}

export default function ArticleHeader ({
    category = 'Categoria',
    date = '27/04/2024',
    title = 'Título do artigo',
    excerpt = 'Este é um resumo do artigo que fornece uma visão geral do conteúdo abordado no post.',
}: ArticleHeaderProps) {
    return (
        <>
            <Container>
                <div className='range-infos'>
                    <Icon 
                        className='icon'
                        Icon={ArrowLeftIcon}
                        size={16}
                        color="#fff"
                        onClick={() => window.location.href = ('/')}
                    />
                    <div className='div-infos'>
                        <Text
                            as='p' 
                            className='category' 
                        >
                            {category}
                        </Text>
                        <Text
                            className='date'
                        >
                            {date.split('T')[0]}
                        </Text>
                    </div>
                </div>
                <div className='titles'>
                    <Text
                        as='h1'
                        className='title'
                    >
                        {title}
                    </Text>
                    <Text
                        as='p'
                        className='excerpt'
                    >
                        {excerpt}
                    </Text>
                </div>
            </Container>
        </>
    )
}