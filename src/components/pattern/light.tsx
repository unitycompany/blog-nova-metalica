import styled from '@emotion/styled'
import { rgba } from 'polished'
import type { AppTheme } from '../../styles/theme'

const getPrimaryColor = (theme?: AppTheme) => theme?.color?.primary?.main ?? 'rgb(23, 156, 215)'

const LayerBlur = styled.div<PatternLightProps & { theme?: AppTheme }>`
    width: ${({width}) => width || '100%'};
    height: ${({height}) => height || '800px'};
    position: relative;
    top: ${({ top }) => top || '0'};
    left: ${({ left }) => left || '0'};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(
            circle at center,
            ${props => rgba(getPrimaryColor(props.theme), 0.45)} 0%,
            ${props => rgba(getPrimaryColor(props.theme), 0.45)} 10%,
            transparent 60%
        );
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: blur(10px);
        opacity: 0.8;
        animation: sway 8s ease-in-out infinite;
    }

    @keyframes sway {
        0% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.6;
        }
        100% {
            opacity: 0.3;
        }
    }
`
interface PatternLightProps {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    className?: string;
}

export default function PatternLight({
    top, left, width, height, className
}: PatternLightProps){
    return (
        <LayerBlur
            className={className}
            top={top}
            left={left}
            width={width}
            height={height}
            data-aos='fade-in'
            data-aos-offset='0'
            data-aos-duration='900'
        >

        </LayerBlur>
    )
}