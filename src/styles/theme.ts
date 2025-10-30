export const theme = {
    color: {
        primary: {
            main: 'rgb(23, 156, 215)',
            light: 'rgb(204, 233, 247)',
            dark: 'rgb(8, 14, 36)',
        },
        gray: {
            100: 'rgb(186, 186, 186)',
            300: 'rgb(227, 227, 227)',
            500: 'rgb(244, 244, 244)',
        },
        black: {
            0: 'rgb(12, 12, 12)',
            100: 'rgb(29, 29, 30)',
            300: 'rgb(53, 53, 53)',
            500: 'rgb(114, 114, 114)',
        }
    },
    font: {
        family: {
            primary: "'Urbanist', sans-serif",
        },
        size: {
            extra_lg: '82px',
            lg: '32px',
            extra_md: '26px',
            md: '20px',
            sm: '16px',
            extra_sm: '14px',
        },
        weight: {
            light: 300,
            regular: 400,
            semi_bold: 600,
        },
        height: {
            lg: '130%', 
            md: '120%',
            sm: '110%',
        }
    },
    lines: {
        left: '-0.4px 0px 0px 0px',
        bottom: '0 0.4px 0 0',
        full: '0.4px 0.4px 0 0',
        top: '0 -0.4px 0 0',
        right: '0.4px 0px 0px 0px',
    }
} as const

export type AppTheme = typeof theme;
export default theme;