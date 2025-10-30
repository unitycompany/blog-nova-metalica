import { Swiper } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import styled from '@emotion/styled';
import Control from './control';
import { useIsMobile } from '@/hooks/useIsMobile';
import { media } from '@/styles/media';
import Text from '../text';
import { useEffect, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import type { SwiperOptions } from 'swiper/types';

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0px;

    ${media('mobile')}{
        flex-direction: column;
        gap: 12px;
    }

    & .swiper-container {
        width: 100%;
        height: fit-content;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: row;

        & .swiper-slide {
            color: #fff;
            width: fit-content;
            height: 100%;
        }
    }
`

const Helper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    position: relative;
    z-index: 4;
    padding: 0 0 0 2.5%;
    ;

    & .helper-text {
        font-size: ${(props) => props.theme.font.size.extra_sm};
        font-weight: ${(props) => props.theme.font.weight.light};
        color: ${(props) => props.theme.color.gray[100]};
    }
`

interface CarouselProps {
    children: React.ReactNode;
}

export default function Carousel({
    children
}: CarouselProps) {
    
    const isMobile = useIsMobile();
    const prevRef = useRef<HTMLDivElement | null>(null);
    const nextRef = useRef<HTMLDivElement | null>(null);
    const swiperRef = useRef<SwiperType | null>(null);

    const applyNavigation = (swiper: SwiperType) => {
        const prevEl = prevRef.current;
        const nextEl = nextRef.current;

        if (!prevEl || !nextEl) {
            return;
        }

        const navigationParams: NonNullable<SwiperOptions['navigation']> = {
            ...(typeof swiper.params.navigation === 'object' && swiper.params.navigation ? swiper.params.navigation : {}),
            prevEl,
            nextEl,
        };

        swiper.params.navigation = navigationParams;

        if (swiper.navigation && typeof swiper.navigation.init === 'function') {
            swiper.navigation.init();
            swiper.navigation.update();
        }
    };

    useEffect(() => {
        const swiper = swiperRef.current;
        if (!swiper) {
            return;
        }

        applyNavigation(swiper);
    }, []);

    return (
        <>  
            {
                isMobile ? (
                    <>
                        <Wrapper>
                            <Swiper
                                modules={[Navigation, FreeMode]}
                                slidesPerView={'auto'}
                                spaceBetween={8}
                                freeMode={true}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                    applyNavigation(swiper);
                                }}
                                onBeforeInit={(swiper) => applyNavigation(swiper)}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                loop={false}
                                className="swiper-container"
                                
                            >
                                {children}
                            </Swiper>
                            <Helper>
                                <Text
                                    as="p"
                                    className='helper-text'
                                >
                                    Arraste para o lado para ver mais    
                                </Text>    
                                <Control 
                                    prevClass='swiper-button-prev'
                                    nextClass='swiper-button-next'
                                    prevRef={prevRef}
                                    nextRef={nextRef}
                                />
                            </Helper>
                        </Wrapper>
                    </>
                ) : (
                    <>
                        <Wrapper>
                            <Swiper
                                modules={[Navigation, FreeMode]}
                                slidesPerView={'auto'}
                                spaceBetween={12}
                                freeMode={true}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                    applyNavigation(swiper);
                                }}
                                onBeforeInit={(swiper) => applyNavigation(swiper)}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                loop={false}
                                className="swiper-container"
                                
                            >
                                {children}
                            </Swiper>
                            <Control 
                                prevClass='swiper-button-prev'
                                nextClass='swiper-button-next'
                                prevRef={prevRef}
                                nextRef={nextRef}
                            />
                        </Wrapper>
                    </>
                )
            }
        </>
    )
}