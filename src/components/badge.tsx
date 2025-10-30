import Text from "./text";
import styled from '@emotion/styled';
import { media } from '@/styles/media';
import { rgba } from 'polished';

const BadgeStyle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 12px;
    padding: 8px 16px 8px 16px;
    overflow: visible;
    cursor: pointer;
    box-shadow: inset 0 0 12px ${(props) => rgba(props.theme.color.black[500], 0.45)};
    border-radius: 28px;
    transition: all 0.1s ease;
    transition: background-color 400ms ease;
    will-change: background-color;

    &:hover {
        box-shadow: inset 0 0 6px ${(props) => rgba(props.theme.color.black[500], 0.65)};
    }

    &.active {
        background: ${(props) => props.theme.color.gray[500]};
        
        & .text {
            color: ${(props) => props.theme.color.black[300]};
        }

        & .number {
            color: ${(props) => props.theme.color.black[300]};
        }
    }

    & .text {
        font-size: ${(props) => props.theme.font.size.md};
        font-weight: ${(props) => props.theme.font.weight.regular};
        color: ${(props) => props.theme.color.gray[300]};

        ${media('mobile')}{
            font-size: ${(props) => props.theme.font.size.sm};
        }
    }

    & .number {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${(props) => props.theme.font.size.md};
        font-weight: ${(props) => props.theme.font.weight.regular};
        color: ${(props) => props.theme.color.gray[300]};

        ${media('mobile')}{
            font-size: ${(props) => props.theme.font.size.sm};
        }
    }
`


interface BadgeProps {
    className?: string;
    quantity?: number;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function Badge({
    className,
    quantity = 0,
    children,
    onClick
}: BadgeProps) {
    return (
        <>
            {
                quantity === 0 ? null : ( // alterar depois a validação de '=== 2' para '<= 0'
                    <>
                        <BadgeStyle className={className} onClick={onClick}>
                            <Text
                                className="text"
                            >
                                {children}
                            </Text>
                            <Text
                                className="number"
                            >
                                {quantity}
                            </Text>
                        </BadgeStyle>
                    </>
                )
            }
        </>
    )
}