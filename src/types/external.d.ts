declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown'

  export function gfm(service: TurndownService): void
}

declare module 'marked' {
  export function marked(src: string, options?: unknown): string | Promise<string>
}
