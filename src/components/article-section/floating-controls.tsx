import { useCallback, useEffect, useId, useState } from 'react';
import styled from '@emotion/styled';
import { ListBulletsIcon, XIcon } from '@phosphor-icons/react/dist/ssr';

import { ArticleTopic } from '../navigation/navigation';
import ArticleNavigation from '../navigation/navigation';
import Text from '../text';
import Icon from '../ui/icon';
import { useIsMobile } from '@/hooks/useIsMobile';

const FloatingWrapper = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (pointer: coarse) {
        bottom: 18px;
        right: 18px;
    }
`;

const FloatingButton = styled.button<{ $open: boolean }>`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    box-shadow: 0 12px 32px rgba(12, 12, 12, 0.28);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:focus-visible {
        outline: 3px solid rgba(23, 156, 215, 0.45);
        outline-offset: 3px;
    }

    &:hover {
        transform: scale(1.02);
        box-shadow: 0 16px 36px rgba(12, 12, 12, 0.36);
    }

    ${(props) => props.$open && `
        transform: scale(0.96);
    `}
`;

const Overlay = styled.div<{ $open: boolean }>`
    position: fixed;
    inset: 0;
    background: rgba(12, 12, 12, 0.45);
    opacity: ${(props) => (props.$open ? 1 : 0)};
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};
    transition: opacity 0.24s ease;
    z-index: 30;
`;

const Sheet = styled.aside<{ $open: boolean }>`
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, ${(props) => (props.$open ? '0%' : '120%')});
    transition: transform 0.3s ease;
    width: min(540px, 100% - 32px);
    background: ${(props) => props.theme.color.black[0]};
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -24px 48px rgba(0, 0, 0, 0.45);
    z-index: 40;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};

    @media (max-width: 640px) {
        width: 100%;
        border-radius: 24px 24px 0 0;
    }
`;

const SheetHandle = styled.span`
    width: 48px;
    height: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.32);
    margin: 12px auto 16px auto;
    display: block;
`;

const SheetBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 12px 24px 28px 24px;
    max-height: min(70vh, 420px);
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 999px;
    }
`;

const SheetNavigation = styled(ArticleNavigation)`
    padding: 0;
    gap: 16px;
    box-shadow: none;
    background: transparent;

    & h4 {
        font-size: ${(props) => props.theme.font.size.md};
        color: ${(props) => props.theme.color.gray[300]};
        line-height: ${(props) => props.theme.font.height.md};
    }

    & ul {
        gap: 12px;
    }

    & a {
        color: ${(props) => props.theme.color.gray[100]};
    }

    & p {
        font-size: ${(props) => props.theme.font.size.extra_sm};
        line-height: ${(props) => props.theme.font.height.lg};
    }
`;

const PolicyText = styled(Text)`
    font-size: ${(props) => props.theme.font.size.extra_sm};
    color: ${(props) => props.theme.color.gray[100]};
    text-align: center;
    line-height: ${(props) => props.theme.font.height.md};
`;

interface FloatingArticleControlsProps {
    topic?: ArticleTopic[];
}

export default function FloatingArticleControls({
    topic = []
}: FloatingArticleControlsProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const reactId = useId();
    const sheetId = `article-sheet-${reactId.replace(/[:]/g, '')}`;

    const hasNavigation = topic.length > 0;

    const closeSheet = useCallback(() => {
        setOpen(false);
    }, []);

    const toggleSheet = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        if (!open) {
            document.body.style.removeProperty('overflow');
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    useEffect(() => {
        if (!open || typeof window === 'undefined') {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (!isMobile && open) {
            setOpen(false);
        }
    }, [isMobile, open]);

    if (!isMobile) {
        return null;
    }

    return (
        <>
            <Overlay $open={open} onClick={closeSheet} />
            <Sheet $open={open} aria-hidden={!open} id={sheetId}>
                <SheetHandle />
                <SheetBody>
                    {hasNavigation && (
                        <SheetNavigation
                            topic={topic}
                            onNavigate={() => {
                                closeSheet();
                            }}
                        />
                    )}
                    <PolicyText as='p'>
                        © 2024 Nova Metálica. Todos os direitos reservados.
                    </PolicyText>
                </SheetBody>
            </Sheet>
            <FloatingWrapper>
                <FloatingButton
                    type='button'
                    aria-expanded={open}
                    aria-controls={sheetId}
                    aria-label={open ? 'Fechar navegação do artigo' : 'Abrir navegação do artigo'}
                    onClick={toggleSheet}
                    $open={open}
                >
                    <Icon Icon={open ? XIcon : ListBulletsIcon} size={26} color={'rgb(29, 29, 30)'} weight='regular' />
                </FloatingButton>
            </FloatingWrapper>
        </>
    );
}
