'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';

import Header from '@/components/header';
import PatternLight from '@/components/pattern/light';
import PatternLines from '@/components/pattern/lines';
import { media } from '@/styles/media';

const LayoutStyle = styled.div<{ hasHeaderPadding?: boolean }>`
    max-width: 1440px;
    width: 100%;
    position: relative;
    /* Keep overflow visible so sticky descendants can attach to the viewport. */
    overflow: visible;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: auto;
    padding-top: ${(props) => (props.hasHeaderPadding ? 'calc(70px + 18px)' : '18px')};
    box-shadow: inset ${(props) => props.theme?.lines?.left ?? '0 0 0 0'} ${(props) => props.theme?.color?.gray?.[500] ?? 'transparent'},
                inset ${(props) => props.theme?.lines?.right ?? '0 0 0 0'} ${(props) => props.theme?.color?.gray?.[500] ?? 'transparent'};

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
`;

const Bg = styled.aside`
    width: 100%;
    top: 0;
    position: absolute;
    z-index: -1;
    height: 100%;
`;

const Lines = styled.aside`
    width: 2.5%;
    height: 100%;
    position: absolute;
    background: transparent;
    top: 0;
    left: 0;
    z-index: 2;
    box-shadow: inset ${(props) => props.theme?.lines?.left ?? '0 0 0 0'} ${(props) => props.theme?.color?.black?.[300] ?? 'transparent'},
                inset ${(props) => props.theme?.lines?.right ?? '0 0 0 0'} ${(props) => props.theme?.color?.black?.[300] ?? 'transparent'};

    &.right {
        right: 0;
        left: auto;
    }

    ${media('mobile')} {
        width: calc(100% - 98%);
    }
`;

interface LayoutShellProps {
    children: ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <LayoutStyle hasHeaderPadding={isHome}>
            <Bg>
                <PatternLight top="-50%" left="0" width="100%" height="100%" />
            </Bg>
            <Lines className="left">
                <PatternLines
                    spacing={6}
                    color="#ffffff15"
                    lineWidth={1}
                    angle={-35}
                    bg="transparent"
                    style={{ height: '100vh' }}
                />
            </Lines>
            <Lines className="right">
                <PatternLines
                    spacing={6}
                    color="#ffffff15"
                    lineWidth={1}
                    angle={-35}
                    bg="transparent"
                    style={{ height: '100vh' }}
                />
            </Lines>
            <Header />
            <main className="content">{children}</main>
        </LayoutStyle>
    );
}
