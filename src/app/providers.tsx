"use client";
import { ReactNode, useMemo } from "react";
import { CacheProvider, Global, ThemeProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import theme from "@/styles/theme";
import globalStyles from "@/styles/globals";

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({
    children
}: ProvidersProps) {
    const cache = useMemo(() => 
        createCache({ key: "app", prepend: true }), []);
    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <Global styles={globalStyles} />
                {children}
            </ThemeProvider>
        </CacheProvider>
    )
}