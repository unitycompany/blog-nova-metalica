import { useEffect, useMemo, useState } from 'react'
import {
  ArrowCounterClockwise,
  CheckCircle,
  MagnifyingGlass,
  NotePencil,
  Plus,
  Trash
} from '@phosphor-icons/react'
import { Article, Author, Category } from '@/lib/supabase'
import { adminFetch } from '@/lib/http/adminFetch'
import { ArticleForm } from '../article-form'
import { EmptyState, LoadingState, StatusBadge } from '../ui'
import type { TabSummary } from '../dashboard'

type ArticleWithRelations = Article & {
  author?: Author | null
  category?: Category | null
}

type ArticlesModuleProps = {
  onSummary: (summary: TabSummary) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

type StatusFilter = 'all' | Article['status']

export function ArticlesModule({ onSummary, showToast }: ArticlesModuleProps) {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  useEffect(() => {
    void loadArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
  const response = await adminFetch('/api/articles')
      if (!response.ok) {
        throw new Error('Não foi possível carregar os artigos.')
      }

      const data = (await response.json()) as ArticleWithRelations[]
      setArticles(data)

      const totalPublished = data.filter((item) => item.status === 'published').length
      const totalDrafts = data.filter((item) => item.status === 'draft').length
      const totalArchived = data.filter((item) => item.status === 'archived').length

      onSummary({
        total: data.length,
        primaryLabel: 'Artigos cadastrados',
        meta: [
          { label: 'Publicados', value: String(totalPublished) },
          { label: 'Rascunhos', value: String(totalDrafts) },
          { label: 'Arquivados', value: String(totalArchived) }
        ]
      })
    } catch (error) {
      console.error(error)
      showToast('Erro ao carregar artigos. Tente novamente.', 'error')
      onSummary({ total: 0, primaryLabel: 'Artigos cadastrados' })
    } finally {
      setLoading(false)
    }
  }

  async function deleteArticle(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este artigo?')) {
      return
    }

    try {
      setPendingActionId(id)
      const response = await adminFetch(`/api/articles/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir artigo.')
      }

      showToast('Artigo removido com sucesso.', 'info')
      await loadArticles()
    } catch (error) {
      console.error(error)
      showToast('Não foi possível excluir o artigo.', 'error')
    } finally {
      setPendingActionId(null)
    }
  }

  async function updateArticleStatus(article: ArticleWithRelations, status: Article['status']) {
    try {
      setPendingActionId(article.id)
      const response = await adminFetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status do artigo.')
      }

      const label =
        status === 'published'
          ? 'publicado'
          : status === 'draft'
          ? 'definido como rascunho'
          : 'arquivado'
      showToast(`Artigo ${label} com sucesso!`)
      await loadArticles()
    } catch (error) {
      console.error(error)
      showToast('Não foi possível atualizar o status.', 'error')
    } finally {
      setPendingActionId(null)
    }
  }

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = [article.title, article.slug, article.subtitle]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || article.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [articles, statusFilter, searchTerm])

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
      void loadArticles()
    }
  }

  return (
    <section className="admin-section" aria-labelledby="articles-heading">
      <div className="admin-section__header">
        <div>
          <h2 id="articles-heading" className="admin-section__title">
            Publicações
          </h2>
          <p className="admin-section__subtitle">
            Gerencie os conteúdos editoriais, status e associações principais.
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
                placeholder="Buscar por título ou slug"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Buscar artigos"
              />
            </div>

            <select
              className="admin-select"
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          <button type="button" className="admin-button admin-button--primary" onClick={handleOpenCreate}>
            <Plus size={16} weight="bold" aria-hidden="true" />
            Novo artigo
          </button>
        </div>
      </div>

      <div className="admin-section__body">
        {loading ? (
          <LoadingState label="Carregando artigos" />
        ) : filteredArticles.length === 0 ? (
          <EmptyState
            icon={<NotePencil size={24} weight="duotone" />}
            title="Nenhum artigo encontrado"
            description="Cadastre um novo conteúdo ou ajuste os filtros de busca."
            actionLabel="Criar artigo"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="admin-table__wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Autor</th>
                  <th>Status</th>
                  <th>Publicado em</th>
                  <th aria-label="Ações" className="admin-table__actions" />
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <p className="admin-table__title">{article.title}</p>
                      <p className="admin-table__subtitle">/{article.slug}</p>
                    </td>
                    <td>
                      {article.category ? (
                        <span className="admin-chip">{article.category.title}</span>
                      ) : (
                        <span className="admin-chip admin-chip--warning">Sem categoria</span>
                      )}
                    </td>
                    <td>{article.author?.name ?? '—'}</td>
                    <td>
                      <StatusBadge status={article.status} />
                    </td>
                    <td>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="admin-table__actions">
                      <div className="admin-table__buttons">
                        <button
                          type="button"
                          className="admin-button admin-button--ghost"
                          onClick={() => handleOpenEdit(article.id)}
                        >
                          <NotePencil size={15} weight="bold" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button--ghost"
                          onClick={() =>
                            updateArticleStatus(
                              article,
                              article.status === 'published' ? 'draft' : 'published'
                            )
                          }
                          disabled={pendingActionId === article.id}
                        >
                          {article.status === 'published' ? (
                            <>
                              <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" />
                              Despublicar
                            </>
                          ) : (
                            <>
                              <CheckCircle size={15} weight="bold" aria-hidden="true" />
                              Publicar
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button--danger"
                          onClick={() => deleteArticle(article.id)}
                          disabled={pendingActionId === article.id}
                        >
                          <Trash size={15} weight="bold" aria-hidden="true" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen ? (
        <ArticleForm
          articleId={editingId ?? undefined}
          onClose={handleCloseForm}
          showToast={showToast}
        />
      ) : null}
    </section>
  )
}
