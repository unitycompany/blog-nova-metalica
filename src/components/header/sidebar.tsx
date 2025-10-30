import React from 'react';
import styled from '@emotion/styled';
import Text from '../text';
import { rgba } from 'polished';
import Nav from './navbar';
import Button from '../ui/button';
import { X } from '@phosphor-icons/react';

const SidebarContent = styled.aside`
    position: fixed;
    left: 50%;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    transform: translateX(-50%);
    width: calc(100% - 10%);
    min-height: calc(80% - 10px);
    height: auto;
    border-radius: 32px 32px 0 0 ;
    background-color: ${(props) => rgba(props.theme.color.black[100], 0.35)};
    backdrop-filter: blur(18px);
    box-shadow: ${(props) => props.theme.lines.top} ${(props) => props.theme.color.gray[300]},
                ${(props) => props.theme.lines.left} ${(props) => props.theme.color.gray[300]},
                ${(props) => props.theme.lines.right} ${(props) => props.theme.color.gray[300]};
    gap: 28px;
    z-index: 1001;

    & .header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0px;
        box-shadow: ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.gray[300]};
    
        & .header-text {
            font-size: ${(props) => props.theme.font.size.md};
            font-weight: ${(props) => props.theme.font.weight.regular};
            color: ${(props) => props.theme.color.gray[500]};
        }

        & .header-close {
            background: transparent;
            border: none;
            padding: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: ${(props) => props.theme.color.gray[100]};
            cursor: pointer;

            &:focus-visible {
                outline: 2px solid ${(props) => props.theme.color.primary.light};
                outline-offset: 2px;
            }
        }
    }

    & .sec-button {
        width: 100%;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.gray[500]},
                    ${(props) => props.theme.lines.top} ${(props) => props.theme.color.gray[500]}
        ;
    }

    & .sec-policy {
        width: 100%;
        padding: 16px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-shadow: ${(props) => props.theme.lines.top} ${(props) => props.theme.color.gray[500]};

        & .policy-text {
            font-size: ${(props) => props.theme.font.size.extra_sm};
            font-weight: ${(props) => props.theme.font.weight.light};
            color: ${(props) => props.theme.color.gray[100]};
        }
    }
`

const StyleNav = styled(Nav)`
    width: 100%;
    padding: 24px;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;
`

interface SidebarProps {
    onClose: () => void;
    instant: string;
}

export default function Sidebar({
    onClose,
    instant
}: SidebarProps) {

    return <SidebarContent>
        <div
            className='header'
        >
            <Text
                className='header-text'
            >
                {instant}
            </Text>
            <button
                type='button'
                className='header-close'
                onClick={onClose}
                aria-label='Fechar menu lateral'
            >
                <X size={20} weight='bold' aria-hidden='true' />
            </button>
        </div>
        {
            instant === 'Menu' ? (
                <>
                    <StyleNav />
                    <aside 
                        className='sec-button'
                    >
                        <Button />
                    </aside>
                    <footer
                        className='sec-policy'
                    >  
                        <Text
                            as='p'
                            className='policy-text'
                        >
                            © 2024 Nova Metálica. Todos os direitos reservados.
                        </Text>  
                    </footer>
                </>
            ) : (
                <>
                    <p>Indice</p>
                </>
            )
        }
    </SidebarContent>
}