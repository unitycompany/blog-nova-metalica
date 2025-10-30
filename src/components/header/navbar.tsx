import { useRouter } from 'next/router';
import { rgba } from 'polished';
import styled from '@emotion/styled';

import Link from 'next/link';
import Text from '../text';

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

interface NavProps {
    className?: string;
}

export default function Nav({
    className
}: NavProps) {

    const url = useRouter();
    console.log(url.pathname);

    const navigationLinks = [
        { text: 'Artigos', pathname: '' },
        { text: 'Categorias', pathname: 'categorias' },
        { text: 'Website', pathname: 'https://novametalica.com.br' },
    ]

    return <Navbar className={className}>
        {navigationLinks.map((nav, i) => (
            <Link 
                key={i} 
                href={
                    nav.pathname.includes('https') 
                    ? nav.pathname
                    : `/${nav.pathname.toLowerCase()}` 
                }
                prefetch={true}
                className={
                    url.pathname === `/${nav.pathname.toLowerCase()}` ? 'active' : 'inactive'
                }
            >
                <Text
                    className='text-link'
                >
                    {nav.text}
                </Text>
            </Link>
        ))}
    </Navbar>
}