import {useState, useEffect} from 'react';

export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkScreen = () => {
            setIsMobile(window.innerWidth <= breakpoint);
        }

        checkScreen();

        window.addEventListener('resize', checkScreen);

        return () => {
            window.removeEventListener('resize', checkScreen);
        };
    }, [breakpoint]);

    return isMobile;
}