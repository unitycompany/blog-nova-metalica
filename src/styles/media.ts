export const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
} as const;

type BreakpointKey = keyof typeof breakpoints;

export const media = (key: BreakpointKey) =>
    `@media (max-width: ${breakpoints[key]}px)`;
