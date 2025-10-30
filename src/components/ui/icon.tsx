import React from 'react';
import styled from '@emotion/styled';

const IconStyled = styled.div`
    padding: 6px;
    align-items: stretch;
    display: flex;
    justify-content: center;
    width: fit-content;
    height: fit-content;
    position: relative;
    overflow: hidden;
`

interface IconProps {
    Icon: React.ElementType; // ícone a ser renderizado
    size?: number; // tamanho do ícone
    color?: string; // cor do ícone
    className?: string; // classes CSS personalizadas,
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; // peso do ícone (se aplicável)
    onClick?: () => void; // função de clique opcional
}

export default function Icon({
    Icon,
    size,
    color,
    className,
    weight,
    onClick
}: IconProps) {
    return <IconStyled className={className} onClick={onClick}>
        <Icon size={size} color={color} weight={weight}/>
    </IconStyled>
}