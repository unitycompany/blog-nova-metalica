import { useEffect, useId, useRef, useState } from 'react'
import { htmlToMdx, mdxToHtml } from '@/util/mdxConverter'

type RichTextEditorInstance = {
	getHTMLCode?: () => string
	getHTML?: () => string
	setHTMLCode?: (html: string) => void
	setHTML?: (html: string) => void
	attachEvent?: (eventName: string, handler: () => void) => void
	destroy?: () => void
	dispose?: () => void
}

type RichTextEditorConstructor = new (selector: string, options?: { placeholder?: string }) => RichTextEditorInstance

declare global {
	interface Window {
		RichTextEditor?: RichTextEditorConstructor
		RTE_DefaultConfig?: Record<string, unknown>
	}
}

type RichTextEditorProps = {
	id?: string
	value: string
	onChange: (mdxContent: string, htmlContent: string) => void
	disabled?: boolean
	placeholder?: string
}

const RTE_SCRIPT_SRC = '/richtexteditor/rte.js'
const RTE_STYLESHEET_HREF = '/richtexteditor/rte_theme_default.css'

let assetsPromise: Promise<void> | null = null

function ensureRichTextEditorAssets() {
	if (assetsPromise) {
		return assetsPromise
	}

	assetsPromise = new Promise<void>((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RTE_SCRIPT_SRC}"]`)
		const finish = () => resolve()

		if (!document.querySelector<HTMLLinkElement>(`link[href="${RTE_STYLESHEET_HREF}"]`)) {
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = RTE_STYLESHEET_HREF
			document.head.appendChild(link)
		}

		if (existingScript) {
			if ((window as Window).RichTextEditor) {
				finish()
			} else {
				existingScript.addEventListener('load', finish, { once: true })
				existingScript.addEventListener('error', (error) => reject(error), { once: true })
			}
			return
		}

		const script = document.createElement('script')
		script.src = RTE_SCRIPT_SRC
		script.async = true
		script.onload = () => finish()
		script.onerror = (error) => reject(error)
		document.body.appendChild(script)
	})

	return assetsPromise
}

function getHtmlFromEditor(instance: RichTextEditorInstance | null, container: HTMLElement | null) {
	if (instance?.getHTMLCode) {
		return instance.getHTMLCode()
	}

	if (instance?.getHTML) {
		return instance.getHTML()
	}

	const editableNode = container?.querySelector<HTMLElement>('.rte-editable')
	return editableNode?.innerHTML ?? ''
}

function setHtmlOnEditor(instance: RichTextEditorInstance | null, container: HTMLElement | null, html: string) {
	if (instance?.setHTMLCode) {
		instance.setHTMLCode(html)
		return
	}

	if (instance?.setHTML) {
		instance.setHTML(html)
		return
	}

	const editableNode = container?.querySelector<HTMLElement>('.rte-editable')
	if (editableNode) {
		editableNode.innerHTML = html
	}
}

export function RichTextEditor({ id, value, onChange, disabled = false, placeholder }: RichTextEditorProps) {
	const generatedId = useId().replace(/:/g, '')
	const editorId = id ?? `rte-${generatedId}`
	const containerRef = useRef<HTMLDivElement | null>(null)
	const editorInstanceRef = useRef<RichTextEditorInstance | null>(null)
	const observerRef = useRef<MutationObserver | null>(null)
	const suppressSyncRef = useRef(false)
	const lastHtmlRef = useRef('')
	const initialValueRef = useRef(value)
	const onChangeRef = useRef(onChange)
	const [ready, setReady] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	useEffect(() => {
		let cancelled = false

		async function init() {
			try {
				await ensureRichTextEditorAssets()
				if (cancelled) {
					return
				}

				const initialHtml = mdxToHtml(initialValueRef.current ?? '')
				lastHtmlRef.current = initialHtml

				const RichTextEditorCtor = (window as Window).RichTextEditor
				if (!RichTextEditorCtor) {
					throw new Error('RichTextEditor global not available after script load')
				}

				const instance = new RichTextEditorCtor(
					`#${editorId}`,
					{
						placeholder: placeholder ?? 'Comece a escrever o conteúdo do artigo...'
					}
				)

				editorInstanceRef.current = instance
				setHtmlOnEditor(instance, containerRef.current, initialHtml)

				const handleContentChange = () => {
					if (!editorInstanceRef.current) {
						return
					}
					const html = getHtmlFromEditor(editorInstanceRef.current, containerRef.current)
					if (html === lastHtmlRef.current) {
						return
					}
					lastHtmlRef.current = html
					suppressSyncRef.current = true
					const mdx = htmlToMdx(html)
					onChangeRef.current?.(mdx, html)
				}

				if (typeof instance?.attachEvent === 'function') {
					instance.attachEvent('change', handleContentChange)
				}

				const editableNode = containerRef.current?.querySelector<HTMLElement>('.rte-editable')
				if (editableNode) {
					const observer = new MutationObserver(() => handleContentChange())
					observer.observe(editableNode, {
						childList: true,
						subtree: true,
						characterData: true
					})
					observerRef.current = observer
				}

				setReady(true)
			} catch (initError) {
				console.error('RichTextEditor init error:', initError)
				setError('Não foi possível carregar o editor de texto rico.')
			}
		}

		init().catch((initError) => {
			console.error(initError)
			setError('Falha ao carregar o editor de texto rico.')
		})

		return () => {
			cancelled = true
			observerRef.current?.disconnect()
			observerRef.current = null
			if (editorInstanceRef.current?.destroy) {
				editorInstanceRef.current.destroy()
			} else if (editorInstanceRef.current?.dispose) {
				editorInstanceRef.current.dispose()
			}
			editorInstanceRef.current = null
		}
	}, [editorId, placeholder])

	useEffect(() => {
		if (suppressSyncRef.current) {
			suppressSyncRef.current = false
			return
		}

		if (!ready || !editorInstanceRef.current) {
			return
		}

		const nextHtml = mdxToHtml(value ?? '')
		if (nextHtml === lastHtmlRef.current) {
			return
		}

		lastHtmlRef.current = nextHtml
		setHtmlOnEditor(editorInstanceRef.current, containerRef.current, nextHtml)
	}, [ready, value])

	if (error) {
		return <p className="admin-editor__error">{error}</p>
	}

	return (
		<div className="admin-editor" data-ready={ready ? 'true' : 'false'}>
			<div id={editorId} ref={containerRef} className="admin-editor__container" data-disabled={disabled} />
			{!ready ? (
				<textarea
					className="admin-textarea admin-textarea--code"
					defaultValue={value}
					placeholder={placeholder}
					readOnly
				/>
			) : null}
		</div>
	)
}
