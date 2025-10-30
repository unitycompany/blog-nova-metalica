import React from "react";

interface TextProps {
    children: React.ReactNode; // esse é o conteúdo que será renderizado dentro do componente
    as?: React.ElementType; // define o tipo de elemento HTML a ser renderizado 
    className?: string; // permite a passagem de classes CSS personalizadas
}

export default function Text({
    children, 
    as = "span",
    className
}: TextProps) {
    const Component = as as React.ElementType;
    return <Component className={className}>{children}</Component>
}