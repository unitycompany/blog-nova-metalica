"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import Header from "@/components/header";
import styled from '@emotion/styled';
import {media} from "@/styles/media";
import PatternLines from "../components/pattern/lines";
import PatternLight from "@/components/pattern/light";
import AOS from 'aos';
import ContactModalContext, { ContactModalData } from '@/contexts/contact-modal-context';
import { ContactModal } from '@/components/contact/contact-modal';

const LayoutStyle = styled.div<{ hasHeaderPadding?: boolean }>`
     max-width: 1440px;
     width: 100%;
     position: relative;
     /* Allow sticky children to attach to the viewport by keeping overflow visible
         (was overflow: hidden; which creates a new clipping/scrolling container
         and prevents position: sticky from working). */
     overflow: visible;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: auto;
    padding-top: ${(props) => (props.hasHeaderPadding ? 'calc(70px + 18px)' : '18px')};
    box-shadow: inset ${(props) => props.theme.lines.left} ${(props) => props.theme.color.black[300]}, 
                inset ${(props) => props.theme.lines.right} ${(props) => props.theme.color.black[300]};
                
    ${media('mobile')} {
        box-shadow: none;
        padding-top: ${(props) => (props.hasHeaderPadding ? 'calc(60px + 18px)' : '18px')};
    }
    

    & .content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

`

const Bg = styled.aside`
    width: 100%;
    top: 0;
    bottom: 0;
    position: absolute;
    z-index: -1;
    height: 100%;
`

const Lines = styled.aside`
    width: 2.5%;
    height: 100%;
    position: absolute;
    background: transparent;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    box-shadow: inset ${(props) => props.theme.lines.left} ${(props) => props.theme.color.black[300]}, 
                inset ${(props) => props.theme.lines.right} ${(props) => props.theme.color.black[300]};

    &.right {
        right: 0;
        left: auto;
    }

    ${media('mobile')} {
        width: calc(100% - 98%);
    }
`

const TransitionOverlay = styled.div<{ $active: boolean }>`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: ${(props) => (props.$active ? 'auto' : 'none')};
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.28s ease, background 0.28s ease, backdrop-filter 0.28s ease;
    z-index: 1200;
    backdrop-filter: ${(props) => (props.$active ? 'blur(10px)' : 'blur(0px)')};
    background: ${(props) => (props.$active ? 'rgba(3, 6, 15, 0.6)' : 'transparent')};
    cursor: ${(props) => (props.$active ? 'wait' : 'default')};

    @supports not ((backdrop-filter: blur(10px))) {
        background: ${(props) => (props.$active ? 'rgba(3, 6, 15, 0.75)' : 'transparent')};
    }
    & .transition-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        justify-content: center;
        background: transparent;
    }

    & .transition-text {
        font-size: ${(props) => props.theme.font.size.sm};
        font-weight: ${(props) => props.theme.font.weight.regular};
        color: ${(props) => props.theme.color.gray[500]};
        letter-spacing: 0.1em;
        text-transform: uppercase;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    }
`

const Spinner = styled.div`
    width: 54px;
    height: 54px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.12);
    border-top-color: ${(props) => props.theme.color.primary.main};
    animation: spin 0.85s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({
    children
}: LayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isHome = pathname === '/';
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const overlayVisibleRef = useRef(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactPrefill, setContactPrefill] = useState<ContactModalData | undefined>(undefined);
    const [contactContext, setContactContext] = useState<Record<string, string>>({});

    useEffect(() => {
        AOS.init({
            offset: 0,
            duration: 650,
            easing: 'ease-out-cubic',
            once: true
        });
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const STORAGE_KEY = 'nm__utm_context';
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const captured: Record<string, string> = {};
        params.forEach((value, key) => {
            if (!value) {
                return;
            }

            const normalizedKey = key.trim();
            if (normalizedKey.startsWith('utm_') || ['gclid', 'fbclid', 'msclkid'].includes(normalizedKey)) {
                captured[normalizedKey] = value;
            }
        });

        try {
            if (Object.keys(captured).length > 0) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
            }
        } catch (storageError) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Não foi possível armazenar UTMs:', storageError);
            }
        }

        let baseContext = captured;

        if (Object.keys(baseContext).length === 0) {
            try {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                if (stored) {
                    baseContext = JSON.parse(stored) as Record<string, string>;
                }
            } catch (parseError) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('Não foi possível recuperar UTMs armazenadas:', parseError);
                }
            }
        }

        const extras: Record<string, string> = {};
        const landing = `${url.pathname}${url.search}`;
        if (landing) {
            extras.landingPage = landing;
        }

        if (document.referrer) {
            extras.referrer = document.referrer;
        }

        extras.locale = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';

        setContactContext({ ...baseContext, ...extras });
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [pathname]);

    useEffect(() => {
        const clearExistingTimeout = () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };

        const isArticlePath = (value?: string | null) => {
            if (!value) {
                return false;
            }

            return value.includes('/blog/post');
        };

        const handleRouteStart = (url: string) => {
            const currentPath = router.asPath ?? router.pathname;
            const targetIsArticle = isArticlePath(url);
            const currentIsArticle = isArticlePath(currentPath);

            if (!targetIsArticle && !currentIsArticle) {
                clearExistingTimeout();
                setIsTransitioning(false);
                setOverlayVisible(false);
                overlayVisibleRef.current = false;
                return;
            }

            clearExistingTimeout();
            setOverlayVisible(true);
            overlayVisibleRef.current = true;
            requestAnimationFrame(() => {
                setIsTransitioning(true);
            });
        };

        const handleRouteDone = () => {
            if (!overlayVisibleRef.current) {
                return;
            }

            setIsTransitioning(false);
            hideTimeoutRef.current = setTimeout(() => {
                setOverlayVisible(false);
                overlayVisibleRef.current = false;
                hideTimeoutRef.current = null;
            }, 240);
        };

    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleRouteDone);
    router.events.on('routeChangeError', handleRouteDone);

        return () => {
            clearExistingTimeout();
            router.events.off('routeChangeStart', handleRouteStart);
            router.events.off('routeChangeComplete', handleRouteDone);
            router.events.off('routeChangeError', handleRouteDone);
        };
    }, [router]);
    const openContactModal = useCallback((data?: ContactModalData) => {
        setContactPrefill(data);
        setContactModalOpen(true);
    }, []);

    const closeContactModal = useCallback(() => {
        setContactModalOpen(false);
        setContactPrefill(undefined);
    }, []);

    const contactContextValue = useMemo(() => ({
        open: openContactModal,
        close: closeContactModal
    }), [openContactModal, closeContactModal]);

    return (
        <ContactModalContext.Provider value={contactContextValue}>
            <LayoutStyle hasHeaderPadding={isHome}>
                <Bg>
                    <PatternLight 
                        top="-35%"
                        left="0"
                        width="100%"
                        height="100%"
                    />
                </Bg>
                <Lines
                    className="left"
                >
                    <PatternLines 
                        spacing={6} 
                        color="#ffffff25" 
                        lineWidth={1} 
                        angle={-35} 
                        bg="transparent"
                        style={{ height: '100%' }}
                    />
                </Lines>
                <Lines
                    className="right"
                >
                    <PatternLines 
                        spacing={6} 
                        color="#ffffff25" 
                        lineWidth={1} 
                        angle={-35} 
                        bg="transparent"
                        style={{ height: '100%' }}
                    />
                </Lines>
                <Header />
                <main
                    className="content"
                >
                    {children}
                </main>
            </LayoutStyle>
            {overlayVisible && (
                <TransitionOverlay $active={isTransitioning}>
                    <div className='transition-panel'>
                        <Spinner />
                        <span className='transition-text'>Carregando conteúdo</span>
                    </div>
                </TransitionOverlay>
            )}
            <ContactModal
                isOpen={contactModalOpen}
                onClose={closeContactModal}
                defaultData={contactPrefill}
                contextData={contactContext}
            />
        </ContactModalContext.Provider>
    )
}