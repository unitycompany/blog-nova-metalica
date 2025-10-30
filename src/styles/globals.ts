import { css } from "@emotion/react";
import theme from "./theme";

export const globalStyles = css`
	*, *::before, *::after {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	html, body {
		height: 100%;
		scroll-behavior: smooth;
	}

	body {
		font-family: ${theme.font.family.primary};
        background-color: ${theme.color.black[0]};
		color: ${theme.color.black[100]};
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
	}

	img, picture, video, canvas, svg {
		display: block;
		max-width: 100%;
	}

	ul, ol {
		list-style: none;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	button, input, textarea, select {
		font: inherit;
		background: none;
		border: none;
		color: inherit;
	}

	button {
		cursor: pointer;
	}

	fieldset {
		border: 0;
	}
`;

export default globalStyles;
