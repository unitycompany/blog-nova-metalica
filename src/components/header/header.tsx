"use client";

// React
import { useState, useEffect } from 'react';

// Libs
import styled from '@emotion/styled';
import { rgba } from 'polished';

// Next.js
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Componentes
import Nav from './navbar';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Sidebar from './sidebar';

// Hooks
import { useIsMobile } from '@/hooks/useIsMobile';
import { media } from '@/styles/media';

// Icons
import { ListIcon, XIcon } from '@phosphor-icons/react/dist/ssr';

const Content = styled.div<{ scrolled?: boolean }>`
    max-width: 1440px;
    width: 100%;
    position: fixed;
    left: ${(props) => (props.scrolled ? '40%;' : '50%;')};
    transform: translateX(-50%);
    top: 18px;
    height: max-content;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    transition: left 0.65s ease;
    will-change: top;

    ${media('mobile')} {
        top: ${(props) => (props.scrolled ? '18px' : '10px')};
        left: 50%;
        transform: translateX(-50%);
    }
`

const Container = styled.header`
    width: max-content;
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    padding: 6px 8px 6px 22px;
    height: 70px;
    gap: 38px;
    border-radius: 42px;
    background-color: ${(props) => rgba(props.theme.color.primary.dark, 0.2)};
    backdrop-filter: blur(8px);
    box-shadow:  ${(props) => props.theme.lines.left} ${(props) => props.theme.color.gray[500]}, 
                 ${(props) => props.theme.lines.right} ${(props) => props.theme.color.gray[500]},
                 ${(props) => props.theme.lines.top} ${(props) => props.theme.color.gray[500]},
                 ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.gray[500]}
                ;

    ${media('mobile')} {
        width: calc(100% - 10%);
        padding: 6px 16px;
        justify-content: space-between;
        height: 60px;
    }

    & img {
        object-fit: contain;
        width: 140px;
        height: auto;
        transition: all .2s ease;

        &:hover {
            transform: scale(0.98);
        }

        ${media('mobile')} {
            width: 120px;
        }
    }
`

const MenuIcon = styled(Icon)`
    transition: transform 0.25s ease, opacity 0.25s ease;
    padding: 0;

    &.closed { 
        transform: rotate(0deg); 
        opacity: 1; 
    }
    &.open { 
        transform: rotate(90deg); 
        opacity: 0.85; 
    }
`

interface HeaderProps {
    company?: string;
    companyLogo?: string;
}

export default function Header({
    company = "Nova Metálica",
}: HeaderProps) {

    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isPostPage = pathname ? pathname.startsWith('/blog/post') : false;
    const isHome = pathname === '/';

    // listen for scroll and set scrolled when window.scrollY > 0
    useEffect(() => {
        if (!isHome) {
            return;
        }

        const onScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        // use passive listener for performance
        window.addEventListener('scroll', onScroll, { passive: true });
        // run once to initialize
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, [isHome]);

    // hide header on any page that is not the home page
    if (!isHome) return null;

    return (
    <>
    <Content scrolled={isPostPage ? scrolled : false}>
            <Container>
                <Link 
                    href="/"
                >
                    <Image 
                        src="/assets/logo/logotipo-nova-metalica-branca.png"
                        alt={`logo-da-${company}`}
                        width={200}
                        height={200}
                    />
                </Link>
                {
                    !isMobile && (
                        <>
                            <Nav />
                            <Button />
                        </>
                    )
                }{
                    isMobile ?
                    <MenuIcon
                        Icon={
                            menuOpen ? XIcon : ListIcon
                        }
                        className={
                            menuOpen ? 'open' : 'closed'
                        }
                        color='#fff'
                        size={32}
                        weight='regular'
                        onClick={() => setMenuOpen(!menuOpen)}
                    > 

                    </MenuIcon> 
                    : null
                }
            </Container> 
        </Content>
        {
            menuOpen 
            ? <Sidebar 
                instant='Menu'
                onClose={() => setMenuOpen(!menuOpen)}
            /> 
            : null
        }
    </>
    );
}