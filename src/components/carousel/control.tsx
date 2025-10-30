import { type Ref } from 'react';
import styled from '@emotion/styled';
import Icon from '../ui/icon';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import { rgba } from 'polished';

const ControlStyle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    position: relative;
    z-index: 2;
    cursor: pointer;
    height: max-content;

    & div {
        border-radius: 48px;
        box-shadow: inset 0 0 12px ${(props) => rgba(props.theme.color.gray[100], 0.15)};
        width: 38px;
        height: 38px;
        height: 100%;

        & .icon-left, .icon-right {
            padding: 8px;
            width: 38px;
            height: 38px; 
            display: flex;
            align-items: center;
            justify-content: center;

            & svg {
                width: 24px;
                height: 24px;
            }
        }
    }
`

interface ControlProps {
    prevClass?: string;
    nextClass?: string;
    prevRef?: Ref<HTMLDivElement>;
    nextRef?: Ref<HTMLDivElement>;
}

export default function Control({
    prevClass,
    nextClass,
    prevRef,
    nextRef,
}: ControlProps) {
    return (
        <>
            <ControlStyle>
                <div
                    className={prevClass} 
                    ref={prevRef ?? undefined}
                    aria-label='previus'
                >
                    <Icon 
                        className="icon-left"
                        Icon={ArrowLeftIcon}
                        size={36}
                        color='#fff'
                    />
                </div>
                <div 
                    className={nextClass} 
                    ref={nextRef ?? undefined}
                    aria-label='next'
                >
                    <Icon 
                        className="icon-right"
                        Icon={ArrowRightIcon}
                        size={36}
                        color='#fff'
                    />
                </div>
            </ControlStyle>
        </>
    )
}