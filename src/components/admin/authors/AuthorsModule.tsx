import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  EnvelopeSimple,
  GlobeHemisphereWest,
  LinkedinLogo,
  MagnifyingGlass,
  NotePencil,
  Plus,
  Trash,
  TwitterLogo,
  UserCircle,
  UsersThree
} from '@phosphor-icons/react'
import type { Author } from '@/lib/supabase'
import { adminFetch } from '@/lib/http/adminFetch'
import { AuthorForm } from './author-form'
import { EmptyState, LoadingState } from '../ui'
import type { TabSummary } from '../dashboard'

type AuthorsModuleProps = {
  onSummary: (summary: TabSummary) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function AuthorsModule({ onSummary, showToast }: AuthorsModuleProps) {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    void loadAuthors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAuthors() {
    try {
      setLoading(true)
  const response = await adminFetch('/api/authors')
      if (!response.ok) {
        throw new Error('Não foi possível carregar os autores.')
      }

      const data = (await response.json()) as Author[]
      setAuthors(data)

      const withBio = data.filter((author) => author.bio).length
      const withCredentials = data.filter((author) => author.credentials).length

      onSummary({
        total: data.length,
        primaryLabel: 'Autores cadastrados',
        meta: [
          { label: 'Com bio', value: String(withBio) },
          { label: 'Com credenciais', value: String(withCredentials) }
        ]
      })
    } catch (error) {
      console.error(error)
      showToast('Erro ao carregar autores.', 'error')
      onSummary({ total: 0, primaryLabel: 'Autores cadastrados' })
    } finally {
      setLoading(false)
    }
  }

  async function deleteAuthor(id: string) {
    if (
      !window.confirm(
        'Excluir este autor removerá sua associação dos artigos. Deseja continuar?'
      )
    ) {
      return
    }

    try {
      const response = await adminFetch(`/api/authors/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir autor.')
      }

      showToast('Autor removido com sucesso.', 'info')
      await loadAuthors()
    } catch (error) {
      console.error(error)
      showToast('Não foi possível excluir o autor.', 'error')
    }
  }

  function handleOpenCreate() {
    setEditingId(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(id: string) {
    setEditingId(id)
    setIsFormOpen(true)
  }

  function handleCloseForm(shouldReload?: boolean) {
    setIsFormOpen(false)
    setEditingId(null)
    if (shouldReload) {
      void loadAuthors()
    }
  }

  const filteredAuthors = useMemo(() => {
    return authors.filter((author) => {
      const matchesSearch = [author.name, author.slug, author.bio, author.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })
  }, [authors, searchTerm])

  return (
    <section className="admin-section" aria-labelledby="authors-heading">
      <div className="admin-section__header">
        <div>
          <h2 id="authors-heading" className="admin-section__title">
            Equipe editorial
          </h2>
          <p className="admin-section__subtitle">
            Atualize as informações de especialistas, canais de contato e credenciais.
          </p>
        </div>
        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <div className="admin-search">
              <span className="admin-search__icon" aria-hidden="true">
                <MagnifyingGlass size={16} weight="bold" />
              </span>
              <input
                type="search"
                className="admin-search__input"
                placeholder="Buscar autor"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Buscar autores"
              />
            </div>
          </div>

          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} weight="bold" aria-hidden="true" />
            Novo autor
          </button>
        </div>
      </div>

      <div className="admin-section__body">
        {loading ? (
          <LoadingState label="Carregando autores" />
        ) : filteredAuthors.length === 0 ? (
          <EmptyState
            icon={<UsersThree size={24} weight="duotone" />}
            title="Nenhum autor cadastrado"
            description="Cadastre sua equipe editorial para associá-los aos artigos."
            actionLabel="Cadastrar autor"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="admin-grid admin-grid--list">
            {filteredAuthors.map((author) => (
              <article key={author.id} className="admin-card admin-card--list">
                <div className="admin-author">
                  <div className="admin-author__avatar">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url}
                        alt={author.name ?? ''}
                        width={40}
                        height={40}
                        className="admin-author__avatar-image"
                      />
                    ) : (
                      <UserCircle size={28} weight="duotone" aria-hidden="true" />
                    )}
                  </div>
                  <div className="admin-author__content">
                    <div className="admin-author__header">
                      <div>
                        <h3 className="admin-card__title">{author.name}</h3>
                        <p className="admin-card__subtitle">/{author.slug}</p>
                      </div>
                      {author.credentials ? (
                        <span className="admin-chip">{author.credentials}</span>
                      ) : null}
                    </div>

                    {author.bio ? (
                      <p className="admin-card__description">{author.bio}</p>
                    ) : null}

                    <div className="admin-author__links">
                      {author.email ? (
                        <a href={`mailto:${author.email}`} className="admin-link">
                          <EnvelopeSimple size={14} weight="bold" aria-hidden="true" />
                          {author.email}
                        </a>
                      ) : null}
                      {author.website ? (
                        <a href={author.website} target="_blank" rel="noreferrer" className="admin-link">
                          <GlobeHemisphereWest size={14} weight="bold" aria-hidden="true" />
                          Website
                        </a>
                      ) : null}
                      {author.twitter ? (
                        <a
                          href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link"
                        >
                          <TwitterLogo size={14} weight="bold" aria-hidden="true" />
                          Twitter
                        </a>
                      ) : null}
                      {author.linkedin ? (
                        <a href={author.linkedin} target="_blank" rel="noreferrer" className="admin-link">
                          <LinkedinLogo size={14} weight="bold" aria-hidden="true" />
                          LinkedIn
                        </a>
                      ) : null}
                    </div>

                    <div className="admin-card__actions">
                      <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={() => handleOpenEdit(author.id)}
                      >
                        <NotePencil size={15} weight="bold" aria-hidden="true" />
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button--danger"
                        onClick={() => deleteAuthor(author.id)}
                      >
                        <Trash size={15} weight="bold" aria-hidden="true" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen ? (
        <AuthorForm authorId={editingId ?? undefined} onClose={handleCloseForm} showToast={showToast} />
      ) : null}
    </section>
  )
}
