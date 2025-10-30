declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown'

  export function gfm(service: TurndownService): void
}

declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: 'setext' | 'atx'
    emphasis?: 'asterisk' | 'underscore'
    bulletListMarker?: '-' | '+' | '*'
    codeBlockStyle?: 'fenced' | 'indented'
  }

  export type TurndownPlugin = ((this: TurndownService) => void) | ((service: TurndownService) => void)

  export default class TurndownService {
    constructor(options?: TurndownOptions)
    turndown(input: string): string
    use(plugin: TurndownPlugin | TurndownPlugin[]): this
    addRule(name: string, rule: { filter: string | string[] | ((node: Node) => boolean); replacement: (content: string, node: Node) => string }): this
  }
}

declare module 'marked' {
  export type MarkedRenderer = (src: string, options?: unknown) => string | Promise<string>

  export const marked: MarkedRenderer & {
    parse: MarkedRenderer
  }
}

declare module 'formidable' {
  import type { IncomingMessage } from 'http'

  export type FormidableFile = {
    filepath: string
    originalFilename?: string | null
    newFilename?: string
    mimetype?: string | null
    size: number
  }

  export type FormidableFiles = Record<string, FormidableFile | FormidableFile[]>
  export type FormidableFields = Record<string, string | string[]>

  export interface FormidableOptions {
    multiples?: boolean
    uploadDir?: string
    keepExtensions?: boolean
    maxFileSize?: number
  }

  export interface IncomingForm {
      parse(req: IncomingMessage): Promise<[FormidableFields, FormidableFiles]>
      parse(
        req: IncomingMessage,
        callback: (err: Error | null, fields: FormidableFields, files: FormidableFiles) => void
      ): void
    }

  export type File = FormidableFile

  export default function formidable(options?: FormidableOptions): IncomingForm
}
