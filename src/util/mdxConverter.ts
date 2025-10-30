import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { marked } from 'marked'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

turndownService.use(gfm)

turndownService.addRule('preserveImgAlt', {
  filter: 'img',
  replacement: (content, node) => {
    const img = node as HTMLImageElement
    const alt = img.getAttribute('alt') ?? ''
    const src = img.getAttribute('src') ?? ''
    const title = img.getAttribute('title')
    const titleSuffix = title ? ` "${title}"` : ''
    return src ? `![${alt}](${src}${titleSuffix})` : ''
  }
})

export function htmlToMdx(html: string): string {
  return turndownService.turndown(html)
}

export function mdxToHtml(mdx: string): string {
  return marked.parse(mdx ?? '', { breaks: true }) as string
}
