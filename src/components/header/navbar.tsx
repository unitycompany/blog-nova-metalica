import { useRouter } from 'next/router';
import { rgba } from 'polished';
import styled from '@emotion/styled';
import Link from 'next/link';
import Text from '../text';
import { useCallback, type MouseEvent } from 'react';

const Navbar = styled.nav`
    display: flex;
    align-items: center;
    padding: 10px;
    justify-content: center;
    position: relative;

    & .active,
    .inactive {
        
        & .text-link {
            font-size: ${(props) => props.theme.font.size.md};
            font-weight: ${(props) => props.theme.font.weight.regular};
            color: ${(props) => props.theme.color.gray[500]};
            padding: 10px 16px;
            scale: 1;
            transition: all .2s ease;
            position: relative;

            &:hover {
                color: ${(props) => props.theme.color.gray[100]};
                scale: 0.98;
            }
        }
    }

    & .active .text-link {
        color: ${(props) => props.theme.color.gray[500]};
        box-shadow: inset 0 0 8px ${(props) => rgba(props.theme.color.primary.main, 0.25)},
                    inset 0 0 16px ${(props) => rgba(props.theme.color.gray[500], 0.15)};
        border: 1px solid ${(props) => rgba(props.theme.color.gray[100], 0.4)};
        border-radius: 22px;

        &:hover {
            color: ${(props) => props.theme.color.gray[500]};
        }
    }

`

type NavigationLink = {
    text: string;
    href: string;
    external?: boolean;
    anchorId?: string;
};

interface NavProps {
    className?: string;
    onNavigate?: () => void;
}

export default function Nav({
    className,
    onNavigate
}: NavProps) {
    const router = useRouter();
    const navigationLinks: NavigationLink[] = [
        { text: 'Artigos', href: '/' },
        { text: 'Categorias', href: '/#categorias', anchorId: 'categorias' },
        { text: 'Website', href: 'https://novametalica.com.br', external: true }
    ];

    const handleAnchorNavigation = useCallback(
        (event: MouseEvent<HTMLAnchorElement>, anchorId: string) => {
            if (router.pathname === '/') {
                event.preventDefault();
                onNavigate?.();

                const target = typeof document !== 'undefined' ? document.getElementById(anchorId) : null;

                if (target) {
                    try {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch (error) {
                        target.scrollIntoView();
                    }
                }

                void router.replace(`/#${anchorId}`, undefined, { shallow: true, scroll: false });
                return;
            }

            onNavigate?.();
        },
        [onNavigate, router]
    );

    return (
        <Navbar className={className}>
            {navigationLinks.map((nav) => {
                const isActive = nav.external
                    ? false
                    : router.asPath === nav.href;

                if (nav.external) {
                    return (
                        <a
                            key={nav.href}
                            href={nav.href}
                            className={isActive ? 'active' : 'inactive'}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={onNavigate}
                        >
                            <Text className='text-link'>{nav.text}</Text>
                        </a>
                    );
                }

                if (nav.anchorId) {
                    return (
                        <Link
                            key={nav.href}
                            href={nav.href}
                            scroll={false}
                            prefetch={false}
                            className={isActive ? 'active' : 'inactive'}
                            onClick={(event) => handleAnchorNavigation(event, nav.anchorId!)}
                        >
                            <Text className='text-link'>{nav.text}</Text>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={nav.href}
                        href={nav.href}
                        prefetch
                        className={isActive ? 'active' : 'inactive'}
                        onClick={onNavigate}
                    >
                        <Text className='text-link'>{nav.text}</Text>
                    </Link>
                );
            })}
        </Navbar>
    );
}