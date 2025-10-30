import styled from '@emotion/styled';
import Text from '../text';
import Icon from './icon';
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr';
import { rgba } from 'polished';

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
    transition: all 0.4s ease;
    border-radius: 32px;

    &:hover{
        box-shadow: inset 0 0 14px 0 ${(props) => rgba(props.theme.color.gray[500], 0.4)};

        &.icon {
            transform: scale(0.96);
        }

        & .icon svg{
            transform: translate(50px, -50px);
        }

        & .icon-hover {
            display: flex;
            
            & svg {
                transform: translate(0, 0);
            }
        }

        & .text-button {
            transform: scale(0.98);
        }
    } 

    & .text-button {
        font-size: ${(props) => props.theme.font.size.md}; // 22px
        font-weight: ${(props) => props.theme.font.weight.regular}; // 400
        color: ${(props) => props.theme.color.gray[500]};
        transition: all 0.1s ease;
    }
    
    & .icon-hover {
        position: absolute;
        right: 6px;

        & svg {
            transform: translate(-50px, 50px);
            transition: all 0.2s ease;
        }
    }

    & .icon {
        background-color: ${(props) => props.theme.color.gray[500]};
        border: 1px solid ${(props) => props.theme.color.gray[100]};
        box-shadow: 0 0 10px ${(props) => rgba(props.theme.color.primary.main, 0.2)};
        transition: all 0.2s ease;
        border-radius: 42px;

        & svg {
            width: 24px;
            height: 24px;
            transition: all 0.2s ease;
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
    onClick = () => {alert("Botão ainda não configurado")}
}: ButtonProps) {
    return <ButtonStyled
        className={className}
        onClick={onClick}
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