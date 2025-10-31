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
    bottom: clamp(18px, 4vw, 28px);
    right: clamp(18px, 4vw, 28px);
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const FloatingButton = styled.button<{ $open: boolean }>`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(245, 245, 245, 0.72));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 18px 42px rgba(12, 12, 12, 0.28);
    cursor: pointer;
    transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;

    &:focus-visible {
        outline: 3px solid rgba(23, 156, 215, 0.45);
        outline-offset: 3px;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 24px 48px rgba(12, 12, 12, 0.32);
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 250, 0.8));
    }

    ${(props) => props.$open && `
        transform: scale(0.96);
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(238, 238, 238, 0.68));
    `}
`;

const Overlay = styled.div<{ $open: boolean }>`
    position: fixed;
    inset: 0;
    background: rgba(12, 12, 12, 0.42);
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
    transition: transform 0.34s cubic-bezier(0.33, 1, 0.68, 1);
    width: min(560px, calc(100% - 24px));
    background: linear-gradient(160deg, rgba(18, 18, 19, 0.92), rgba(10, 10, 11, 0.88));
    backdrop-filter: blur(26px);
    -webkit-backdrop-filter: blur(26px);
    border-radius: 26px 26px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 -28px 72px rgba(0, 0, 0, 0.52);
    z-index: 40;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};

    @media (max-width: 640px) {
        width: calc(100% - 12px);
        border-radius: 28px 28px 0 0;
    }
`;

const SheetHandle = styled.span`
    width: 48px;
    height: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.36);
    margin: 12px auto 20px auto;
    display: block;
`;

const SheetBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 14px 28px 32px 28px;
    max-height: min(70vh, 440px);
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.16);
        border: 2px solid transparent;
        border-radius: 999px;
    }
`;

const SheetNavigation = styled(ArticleNavigation)`
    padding: 0;
    gap: 20px;
    box-shadow: none;
    background: transparent;

    & h4 {
        font-size: ${(props) => props.theme.font.size.md};
        color: ${(props) => props.theme.color.gray[300]};
        line-height: ${(props) => props.theme.font.height.md};
        letter-spacing: 0.01em;
    }

    & ul {
        gap: 14px;
    }

    & a {
        color: rgba(244, 244, 244, 0.92);
        font-weight: ${(props) => props.theme.font.weight.semi_bold};
        letter-spacing: 0.005em;
        transition: color 0.2s ease;

        &:hover,
        &:focus-visible {
            color: ${(props) => props.theme.color.primary.light};
        }
    }

    & p {
        font-size: ${(props) => props.theme.font.size.extra_sm};
        line-height: ${(props) => props.theme.font.height.lg};
        color: rgba(227, 227, 227, 0.72);
    }
`;

const PolicyText = styled(Text)`
    font-size: ${(props) => props.theme.font.size.extra_sm};
    color: rgba(227, 227, 227, 0.64);
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
