'use client';

import styled from '@emotion/styled';
import Text from '../text';
import Icon from './icon';
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr';
import { rgba } from 'polished';
import { useContactModal } from '@/contexts/contact-modal-context';

const ButtonStyled = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 6px 6px 6px 16px;
    border: 1px solid ${(props) => rgba(props.theme.color.gray[500], 0.4)};
    box-shadow: inset 0 0 10px 0 ${(props) => rgba(props.theme.color.gray[300], 0.2)};
    position: relative;
    overflow: hidden;
    transition:
        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.45s ease,
        border-color 0.45s ease,
        background-color 0.45s ease;
    border-radius: 32px;
    transform: translateY(0);

    &:hover{
        border-color: ${(props) => rgba(props.theme.color.gray[500], 0.55)};
        box-shadow: inset 0 0 16px 0 ${(props) => rgba(props.theme.color.gray[500], 0.36)},
            0 18px 40px ${(props) => rgba(props.theme.color.black[100], 0.25)};

        & .icon {
            transform: scale(0.96);
        }

        & .icon svg{
            transform: translate(28px, -28px);
        }

        & .icon-hover {
            display: flex;
            
            & svg {
                transform: translate(0, 0);
            }
        }

        & .text-button {
            transform: translateX(2px);
        }
    } 

    & .text-button {
        font-size: ${(props) => props.theme.font.size.md}; // 22px
        font-weight: ${(props) => props.theme.font.weight.regular}; // 400
        color: ${(props) => props.theme.color.gray[500]};
        transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            color 0.35s ease;
    }
    
    & .icon-hover {
        position: absolute;
        right: 6px;

        & svg {
            transform: translate(-32px, 32px);
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
    }

    & .icon {
        background-color: ${(props) => props.theme.color.gray[500]};
        border: 1px solid ${(props) => props.theme.color.gray[100]};
        box-shadow: 0 0 10px ${(props) => rgba(props.theme.color.primary.main, 0.2)};
        transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s ease;
        border-radius: 42px;

        & svg {
            width: 24px;
            height: 24px;
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
    } 
    
`

interface ButtonProps {
    children?: React.ReactNode; // conteúdo do botão
    className?: string; // classes CSS personalizadas
    onClick?: () => void; // função de clique
}

export default function Button({
    children = "Entrar em contato",
    className,
    onClick
}: ButtonProps) {
    const { open } = useContactModal();
    const handleClick = onClick ?? (() => open());

    return <ButtonStyled
        className={className}
        onClick={handleClick}
    >
        <Text
            className="text-button"
        >   
            {children}
        </Text>
        <Icon 
            className='icon'
            Icon={ArrowUpRightIcon}
            size={24}
            color="#000"
            weight='regular'
        />
        <Icon 
            className='icon-hover'
            Icon={ArrowUpRightIcon}
            size={24}
            color="#000"
            weight='regular'
        />
    </ButtonStyled>
}