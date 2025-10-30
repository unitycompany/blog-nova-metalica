import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Category } from '@/lib/supabase'
import { adminFetch } from '@/lib/http/adminFetch'
import { AssetUploader, FormField, LoadingState, Modal } from '../ui'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatListInput(entries?: string[] | null): string {
  if (!Array.isArray(entries) || entries.length === 0) {
    return ''
  }
  return entries.join('\n')
}

function parseListInput(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

type CategoryFormState = {
  title: string
  slug: string
  description: string
  order_index: string
  og_image: string
  parent_id: string
  synonyms: string
  ai_hints: string
  is_indexed: boolean
}

type CategoryFormProps = {
  categoryId?: string
  categories: Category[]
  onClose: (shouldReload?: boolean) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function CategoryForm({ categoryId, categories, onClose, showToast }: CategoryFormProps) {
  const [formState, setFormState] = useState<CategoryFormState>({
    title: '',
    slug: '',
    description: '',
    order_index: '0',
    og_image: '',
    parent_id: '',
    synonyms: '',
    ai_hints: '',
    is_indexed: true
  })
  const [loading, setLoading] = useState(Boolean(categoryId))
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (categoryId) {
      void loadCategory(categoryId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  async function loadCategory(id: string) {
    try {
  const response = await adminFetch(`/api/categories/${id}`)
      if (!response.ok) {
        throw new Error('Não foi possível carregar a categoria.')
      }

      const data = (await response.json()) as Category
      const synonymsValue = formatListInput(data.synonyms ?? null)
      const aiHintsValue = formatListInput(data.ai_hints ?? null)
      const orderValue = String(data.order_index ?? 0)
      setFormState({
        title: data.title ?? '',
        slug: data.slug ?? '',
        description: data.description ?? '',
        order_index: orderValue,
        og_image: data.og_image ?? '',
        parent_id: data.parent_id ?? '',
        synonyms: synonymsValue,
        ai_hints: aiHintsValue,
        is_indexed: Boolean(data.is_indexed)
      })
      setSlugTouched(Boolean(data.slug))
      const advancedFilled = Boolean(
        synonymsValue.trim() ||
          aiHintsValue.trim() ||
          Number(orderValue) > 0 ||
          data.is_indexed === false ||
          (data.slug ? data.slug !== slugify(data.title ?? '') : false)
      )
      setShowAdvanced(advancedFilled)
    } catch (error) {
      console.error(error)
      showToast('Erro ao carregar categoria.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = event.target
    const { name, value } = target
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'
    const nextValue = isCheckbox ? target.checked : value

    if (name === 'title') {
      setFormState((prev) => {
        const nextState = {
          ...prev,
          title: String(nextValue)
        }
        if (!slugTouched || !prev.slug) {
          nextState.slug = slugify(String(nextValue))
        }
        return nextState
      })
      return
    }

    if (name === 'slug') {
      const sanitized = slugify(String(nextValue))
      setSlugTouched(Boolean(sanitized))
      setFormState((prev) => ({
        ...prev,
        slug: sanitized
      }))
      return
    }

    setFormState((prev) => ({
      ...prev,
      [name]: nextValue
    }))
  }

  function handleOgImageChange(nextValue: string) {
    setFormState((prev) => ({
      ...prev,
      og_image: nextValue
    }))
  }

  function generateSlugFromTitle() {
    setFormState((prev) => ({
      ...prev,
      slug: slugify(prev.title)
    }))
  }

  function toggleAdvanced() {
    setShowAdvanced((prev) => !prev)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      const normalizedTitle = formState.title.trim()
      const normalizedSlug = slugify(formState.slug.trim() || normalizedTitle)

      if (!normalizedTitle) {
        showToast('Informe um título para a categoria.', 'error')
        setSaving(false)
        return
      }

      if (!normalizedSlug) {
        showToast('Não foi possível gerar um slug válido para a categoria.', 'error')
        setSaving(false)
        return
      }

      const payload = {
        title: normalizedTitle,
        slug: normalizedSlug,
        description: formState.description.trim() || null,
        order_index: Number(formState.order_index) || 0,
        og_image: formState.og_image.trim() || null,
        parent_id: formState.parent_id || null,
        synonyms: parseListInput(formState.synonyms),
        ai_hints: parseListInput(formState.ai_hints),
        is_indexed: formState.is_indexed
      }

      const endpoint = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PUT' : 'POST'

      const response = await adminFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar a categoria.')
      }

      showToast('Categoria salva com sucesso!')
      onClose(true)
    } catch (error) {
      console.error(error)
      showToast('Erro ao salvar categoria. Verifique os campos.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={categoryId ? 'Editar categoria' : 'Nova categoria'}
      description="Defina como os artigos serão agrupados por temas."
      onClose={() => onClose()}
    >
      {loading ? (
        <LoadingState label="Carregando categoria" />
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__section">
            <div className="admin-form__grid admin-form__grid--two">
              <FormField label="Título" htmlFor="category-title" required>
                <input
                  id="category-title"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  onBlur={generateSlugFromTitle}
                  className="admin-input"
                  placeholder="Ex: Drywall"
                  required
                />
              </FormField>

              <FormField label="Categoria pai" htmlFor="parent_id">
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formState.parent_id}
                  onChange={handleInputChange}
                  className="admin-input"
                >
                  <option value="">Nenhuma</option>
                  {categories
                    .filter((category) => category.id !== categoryId)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                </select>
              </FormField>
            </div>

            <FormField label="Descrição" htmlFor="category-description">
              <textarea
                id="category-description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                className="admin-textarea"
                rows={3}
                placeholder="Explique como a categoria será utilizada"
              />
            </FormField>

            <FormField
              label="Imagem destaque"
              htmlFor="category-og-image"
              hint="Opcional: usada em SEO e redes sociais"
            >
              <AssetUploader
                id="category-og-image"
                value={formState.og_image}
                onChange={handleOgImageChange}
                allowManualInput={false}
              />
            </FormField>
          </div>

          <div className="admin-form__toggle">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={toggleAdvanced}
              aria-expanded={showAdvanced}
            >
              {showAdvanced ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>
          </div>

          {showAdvanced ? (
            <div className="admin-form__section">
              <div className="admin-form__grid admin-form__grid--two">
                <FormField label="Slug" htmlFor="category-slug" required>
                  <div className="admin-input-group">
                    <input
                      id="category-slug"
                      name="slug"
                      value={formState.slug}
                      onChange={handleInputChange}
                      className="admin-input"
                      placeholder="drywall"
                      required
                    />
                    <button
                      type="button"
                      className="admin-button admin-button--ghost"
                      onClick={generateSlugFromTitle}
                    >
                      Gerar
                    </button>
                  </div>
                </FormField>

                <FormField label="Ordem" htmlFor="order_index" hint="Define a prioridade na navegação">
                  <input
                    id="order_index"
                    name="order_index"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.order_index}
                    onChange={handleInputChange}
                    className="admin-input"
                  />
                </FormField>
              </div>

              <div className="admin-form__grid admin-form__grid--two">
                <FormField label="Sinônimos" htmlFor="synonyms" hint="Uma entrada por linha">
                  <textarea
                    id="synonyms"
                    name="synonyms"
                    value={formState.synonyms}
                    onChange={handleInputChange}
                    className="admin-textarea"
                    rows={2}
                    placeholder={'gesso acartonado\nparede de gesso'}
                  />
                </FormField>

                <FormField
                  label="AI hints"
                  htmlFor="ai_hints"
                  hint="Oriente algoritmos de geração de conteúdo. Uma dica por linha"
                >
                  <textarea
                    id="ai_hints"
                    name="ai_hints"
                    value={formState.ai_hints}
                    onChange={handleInputChange}
                    className="admin-textarea"
                    rows={2}
                    placeholder={'drywall installation\ndrywall tips'}
                  />
                </FormField>
              </div>

              <label className="admin-checkbox" htmlFor="is_indexed">
                <input
                  id="is_indexed"
                  type="checkbox"
                  name="is_indexed"
                  checked={formState.is_indexed}
                  onChange={handleInputChange}
                  className="admin-checkbox__input"
                />
                <span className="admin-checkbox__label">
                  Indexar a categoria nos mecanismos de busca
                </span>
              </label>
            </div>
          ) : null}

          <div className="admin-modal__actions">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => onClose(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar categoria'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
