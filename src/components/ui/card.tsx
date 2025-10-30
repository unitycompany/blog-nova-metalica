import styled from '@emotion/styled'
import Image from 'next/image'
import Text from '../text';
import { rgba } from 'polished';
import { media } from '@/styles/media';

const CardStyle = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    background-color: ${(props) => props.theme.color.gray[500]};
    cursor: pointer;
    padding: 0px;
    transition: all 0.2s ease-in-out;
    border-radius: 18px;
    padding: 4px;

    &:hover {
        transform: translateY(-4px);
    }

    & .image{
        position: relative;
        width: 100%;
        height: 300px;
        border-radius: 14px ;
        overflow: hidden;

        ${media('mobile')} {
            height: 240px;
        }

        & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        & .badge {
            position: absolute;
            top: 4px;
            right: 4px;
            padding: 8px 12px;
            border: 1px solid ${(props) => props.theme.color.gray[300]};
            background-color: ${(props) => rgba(props.theme.color.black[300], 0.2)};
            backdrop-filter: blur(12px);
            color: ${(props) => props.theme.color.gray[500]};
            border-radius: 14px;

            & span {
                font-weight: ${(props) => props.theme.font.weight.regular};
                font-size: ${(props) => props.theme.font.size.sm};
            }
        }
    }

    & .texts {
        display: flex;
        flex-direction: column;
        padding: 18px;
        gap: 12px;
        align-items: flex-start;
        justify-content: center;

        & h3 {
            font-size: ${(props) => props.theme.font.size.extra_md};
            font-weight: ${(props) => props.theme.font.weight.regular};
            line-height: ${(props) => props.theme.font.height.sm};

            ${media('mobile')} {
                font-size: ${(props) => props.theme.font.size.md};
            }
        }

        & p {
            font-size: ${(props) => props.theme.font.size.sm};
            color: ${(props) => props.theme.color.black[500]};
            font-weight: ${(props) => props.theme.font.weight.light};
        }

        & .references {
            font-style: italic;

            & span {
                font-size: ${(props) => props.theme.font.size.extra_sm};
                color: ${(props) => props.theme.color.primary.main};
                font-weight: ${(props) => props.theme.font.weight.light};
            }
        }
    }
`

interface CardProps {
    cover_asset_url: string;
    title?: string;
    excerpt?: string;
    category: string;
    className?: string;
    author?: string;
    date?: string;
    onClick?: () => void;
}

export default function Card({
    className,
    cover_asset_url,
    title = "Default",
    excerpt = "This is a default excerpt for the card component.",
    category,
    author = "Admin",
    date = "Jan 01, 2024",
    onClick
}: CardProps) {
    return (
        <>
            <CardStyle className={className} onClick={onClick}>
                <picture className='image'>
                    <Image 
                        src={cover_asset_url}
                        alt={`blog-nova-metalica-artigo-${title}`}
                        width={400}
                        height={250}
                    />
                    <div className='badge'>
                        <Text>
                            {category}
                        </Text>
                    </div>
                </picture>
                <aside className='texts'>
                    <Text as="h3">
                        {title}
                    </Text>
                    <Text as='p'>
                        {excerpt}
                    </Text>
                    <div className='references'>
                        <Text as="span">
                            {author} | {date.replace(/T.*$/, '')}
                        </Text>
                    </div>
                </aside>
            </CardStyle>
        </>
    )
}