import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Author } from '@/lib/supabase'
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

function normalizeWebsite(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('www.')) {
    return `https://${trimmed}`
  }
  return `https://${trimmed}`
}

function normalizeTwitter(handle: string): string {
  const trimmed = handle.trim()
  if (!trimmed) {
    return ''
  }
  const withoutUrl = trimmed.replace(/^https?:\/\/(www\.)?twitter\.com\//i, '').replace(/^@+/, '')
  return withoutUrl ? `@${withoutUrl}` : ''
}

function normalizeLinkedIn(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('linkedin.com')) {
    return `https://${trimmed}`
  }
  const sanitized = trimmed.replace(/^@+/, '')
  return `https://www.linkedin.com/in/${sanitized}`
}

type AuthorFormState = {
  name: string
  slug: string
  bio: string
  email: string
  avatar_url: string
  twitter: string
  linkedin: string
  website: string
  credentials: string
}

type AuthorFormProps = {
  authorId?: string
  onClose: (shouldReload?: boolean) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function AuthorForm({ authorId, onClose, showToast }: AuthorFormProps) {
  const [formState, setFormState] = useState<AuthorFormState>({
    name: '',
    slug: '',
    bio: '',
    email: '',
    avatar_url: '',
    twitter: '',
    linkedin: '',
    website: '',
    credentials: ''
  })
  const [loading, setLoading] = useState(Boolean(authorId))
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (authorId) {
      void loadAuthor(authorId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId])

  async function loadAuthor(id: string) {
    try {
  const response = await adminFetch(`/api/authors/${id}`)
      if (!response.ok) {
        throw new Error('Não foi possível carregar o autor.')
      }

      const data = (await response.json()) as Author
      setFormState({
        name: data.name ?? '',
        slug: data.slug ?? '',
        bio: data.bio ?? '',
        email: data.email ?? '',
        avatar_url: data.avatar_url ?? '',
        twitter: data.twitter ?? '',
        linkedin: data.linkedin ?? '',
        website: data.website ?? '',
        credentials: data.credentials ?? ''
      })
      setSlugTouched(Boolean(data.slug))
      const advancedFilled = Boolean(
        data.email ||
          data.website ||
          data.twitter ||
          data.linkedin ||
          (data.slug ? data.slug !== slugify(data.name ?? '') : false)
      )
      setShowAdvanced(advancedFilled)
    } catch (error) {
      console.error(error)
      showToast('Erro ao carregar autor.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    if (name === 'name') {
      setFormState((prev) => {
        const nextState = {
          ...prev,
          name: value
        }
        if (!slugTouched || !prev.slug) {
          nextState.slug = slugify(value)
        }
        return nextState
      })
      return
    }

    if (name === 'slug') {
      const sanitized = slugify(value)
      setSlugTouched(Boolean(sanitized))
      setFormState((prev) => ({
        ...prev,
        slug: sanitized
      }))
      return
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function handleAvatarChange(nextValue: string) {
    setFormState((prev) => ({
      ...prev,
      avatar_url: nextValue
    }))
  }

  function generateSlugFromName() {
    setFormState((prev) => ({
      ...prev,
      slug: slugify(prev.name)
    }))
  }

  function toggleAdvanced() {
    setShowAdvanced((prev) => !prev)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      const normalizedName = formState.name.trim()
      const normalizedSlug = slugify(formState.slug.trim() || normalizedName)

      if (!normalizedName) {
        showToast('Informe o nome do autor.', 'error')
        setSaving(false)
        return
      }

      if (!normalizedSlug) {
        showToast('Não foi possível gerar um slug válido para o autor.', 'error')
        setSaving(false)
        return
      }

      const normalizedEmail = formState.email.trim()
      const normalizedAvatar = formState.avatar_url.trim()
      const normalizedTwitter = normalizeTwitter(formState.twitter)
      const normalizedLinkedIn = normalizeLinkedIn(formState.linkedin)
      const normalizedWebsite = normalizeWebsite(formState.website)

      const payload = {
        ...formState,
        name: normalizedName,
        slug: normalizedSlug,
        email: normalizedEmail || null,
        avatar_url: normalizedAvatar || null,
        twitter: normalizedTwitter || null,
        linkedin: normalizedLinkedIn || null,
        website: normalizedWebsite || null,
        credentials: formState.credentials.trim() || null
      }

      const endpoint = authorId ? `/api/authors/${authorId}` : '/api/authors'
      const method = authorId ? 'PUT' : 'POST'

      const response = await adminFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar o autor.')
      }

      showToast('Autor salvo com sucesso!')
      onClose(true)
    } catch (error) {
      console.error(error)
      showToast('Erro ao salvar autor. Verifique os campos.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={authorId ? 'Editar autor' : 'Novo autor'}
      description="Atualize os dados do especialista para reforçar autoridade e credibilidade."
      onClose={() => onClose()}
    >
      {loading ? (
        <LoadingState label="Carregando autor" />
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__section">
            <div className="admin-form__grid admin-form__grid--two">
              <FormField label="Nome" htmlFor="author-name" required>
                <input
                  id="author-name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  onBlur={generateSlugFromName}
                  className="admin-input"
                  placeholder="Nome completo"
                  required
                />
              </FormField>

              <FormField
                label="Foto do autor"
                htmlFor="author-avatar"
                hint="Até 5 MB - formatos JPG, PNG, WEBP, GIF ou AVIF"
              >
                <AssetUploader
                  id="author-avatar"
                  value={formState.avatar_url}
                  onChange={handleAvatarChange}
                  allowManualInput={false}
                />
              </FormField>
            </div>

            <FormField label="Biografia" htmlFor="author-bio">
              <textarea
                id="author-bio"
                name="bio"
                value={formState.bio}
                onChange={handleInputChange}
                className="admin-textarea"
                rows={4}
                placeholder="Apresente a experiência e especialidades do autor"
              />
            </FormField>

            <FormField label="Credenciais" htmlFor="author-credentials">
              <input
                id="author-credentials"
                name="credentials"
                value={formState.credentials}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Ex: Engenheiro civil, 15 anos de experiência"
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
                <FormField label="Slug" htmlFor="author-slug" required>
                  <div className="admin-input-group">
                    <input
                      id="author-slug"
                      name="slug"
                      value={formState.slug}
                      onChange={handleInputChange}
                      className="admin-input"
                      placeholder="joao-silva"
                      required
                    />
                    <button
                      type="button"
                      className="admin-button admin-button--ghost"
                      onClick={generateSlugFromName}
                    >
                      Gerar
                    </button>
                  </div>
                </FormField>

                <FormField label="Email" htmlFor="author-email">
                  <input
                    id="author-email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="autor@email.com"
                  />
                </FormField>
              </div>

              <div className="admin-form__grid admin-form__grid--two">
                <FormField label="Website" htmlFor="author-website">
                  <input
                    id="author-website"
                    name="website"
                    value={formState.website}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="https://..."
                  />
                </FormField>

                <FormField label="LinkedIn" htmlFor="author-linkedin">
                  <input
                    id="author-linkedin"
                    name="linkedin"
                    value={formState.linkedin}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="https://linkedin.com/in/..."
                  />
                </FormField>
              </div>

              <FormField label="Twitter" htmlFor="author-twitter" hint="Use @usuario ou a URL completa">
                <input
                  id="author-twitter"
                  name="twitter"
                  value={formState.twitter}
                  onChange={handleInputChange}
                  className="admin-input"
                  placeholder="@usuario"
                />
              </FormField>
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
              {saving ? 'Salvando...' : 'Salvar autor'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
