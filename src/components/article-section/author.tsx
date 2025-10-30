import Image from "next/image";
import Text from "../text";
import styled from '@emotion/styled';
import { media } from "@/styles/media";

const AuthorSec = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 18px;
    padding: 10%;
    position: relative;
    box-shadow: ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.black[500]};

    ${media('mobile')}{
        padding: 5%;
    }

    & .author-no-image {
        width: 54px;
        height: 54px;
        border-radius: 22px;
        background-color: ${(props) => props.theme.color.gray[500]};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${(props) => props.theme.font.size.md};
        font-weight: ${(props) => props.theme.font.weight.semi_bold};
        color: ${(props) => props.theme.color.gray[100]};
    }

    & .author-avatar {
        width: 54px;
        height: 54px;
        border-radius: 22px;
        object-fit: cover;
    }

    & .author-infos {
        display: flex;
        flex-direction: column;
        gap: 4px;

        & h3 {
            font-size: ${(props) => props.theme.font.size.md};
            font-weight: ${(props) => props.theme.font.weight.regular};
            color: ${(props) => props.theme.color.gray[500]};
        }

        & span {
            font-size: ${(props) => props.theme.font.size.extra_sm};
            color: ${(props) => props.theme.color.gray[100]};
        }
    }   
`

interface SidebarArticleSectionProps {
    author?: string;
    author_profission?: string;
    authorImage?: string;
}

const buildInitials = (value: string) => {
    const parts = value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment.charAt(0).toUpperCase());

    return parts.length > 0 ? parts.join('') : 'NM';
};

export default function AuthorSection({
    author,
    author_profission,
    authorImage,
}: SidebarArticleSectionProps) {
    const safeAuthor = author?.trim() ? author.trim() : 'Equipe Nova Metálica';
    const safeProfession = author_profission?.trim() ?? '';
    const avatarSrc = authorImage?.trim() ?? '';
    const authorInitials = buildInitials(safeAuthor);

    return (
        <>
            <AuthorSec>
                {avatarSrc ? (
                    <Image
                        className='author-avatar'
                        src={avatarSrc}
                        alt={`Foto de ${safeAuthor}`}
                        width={54}
                        height={54}
                    />
                ) : (
                    <div className='author-no-image'>{authorInitials}</div>
                )}
                <div className='author-infos'>
                    <Text as='h3'>
                        {safeAuthor}
                    </Text>
                    {safeProfession ? (
                        <Text>
                            {safeProfession}
                        </Text>
                    ) : null}
                </div>
            </AuthorSec>
        </>
    )
}