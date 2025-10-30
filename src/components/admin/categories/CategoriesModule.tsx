import { useEffect, useMemo, useState } from 'react'
import { Folders, MagnifyingGlass, NotePencil, Plus, Trash } from '@phosphor-icons/react'
import type { Category } from '@/lib/supabase'
import { adminFetch } from '@/lib/http/adminFetch'
import { CategoryForm } from './category-form'
import { EmptyState, LoadingState } from '../ui'
import type { TabSummary } from '../dashboard'

type CategoriesModuleProps = {
  onSummary: (summary: TabSummary) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function CategoriesModule({ onSummary, showToast }: CategoriesModuleProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    void loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
  const response = await adminFetch('/api/categories')
      if (!response.ok) {
        throw new Error('Não foi possível carregar as categorias.')
      }
      const data = (await response.json()) as Category[]
      setCategories(data)

      const indexed = data.filter((category) => category.is_indexed).length
      const withParent = data.filter((category) => category.parent_id).length

      onSummary({
        total: data.length,
        primaryLabel: 'Categorias ativas',
        meta: [
          { label: 'Indexadas', value: String(indexed) },
          { label: 'Com hierarquia', value: String(withParent) }
        ]
      })
    } catch (error) {
      console.error(error)
      showToast('Erro ao carregar categorias.', 'error')
      onSummary({ total: 0, primaryLabel: 'Categorias ativas' })
    } finally {
      setLoading(false)
    }
  }

  async function deleteCategory(id: string) {
    if (
      !window.confirm(
        'Excluir esta categoria removerá a referência dos artigos associados. Deseja continuar?'
      )
    ) {
      return
    }

    try {
      const response = await adminFetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir categoria.')
      }

      showToast('Categoria removida com sucesso.', 'info')
      await loadCategories()
    } catch (error) {
      console.error(error)
      showToast('Não foi possível excluir a categoria.', 'error')
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
      void loadCategories()
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = [category.title, category.slug, category.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })
  }, [categories, searchTerm])

  return (
    <section className="admin-section" aria-labelledby="categories-heading">
      <div className="admin-section__header">
        <div>
          <h2 id="categories-heading" className="admin-section__title">
            Categorias
          </h2>
          <p className="admin-section__subtitle">
            Estruture os temas principais, defina relacionamentos e estratégias de SEO.
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
                placeholder="Buscar categoria"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Buscar categorias"
              />
            </div>
          </div>

          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} weight="bold" aria-hidden="true" />
            Nova categoria
          </button>
        </div>
      </div>

      <div className="admin-section__body">
        {loading ? (
          <LoadingState label="Carregando categorias" />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={<Folders size={24} weight="duotone" />}
            title="Nenhuma categoria cadastrada"
            description="Crie categorias para organizar os artigos por assunto."
            actionLabel="Cadastrar categoria"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="admin-grid">
            {filteredCategories.map((category) => (
              <article key={category.id} className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <h3 className="admin-card__title">{category.title}</h3>
                    <p className="admin-card__subtitle">/{category.slug}</p>
                  </div>
                  <span
                    className={
                      category.is_indexed
                        ? 'admin-chip admin-chip--success'
                        : 'admin-chip admin-chip--warning'
                    }
                  >
                    {category.is_indexed ? 'Indexada' : 'Noindex'}
                  </span>
                </div>
                <p className="admin-card__description">
                  {category.description || 'Sem descrição cadastrada.'}
                </p>
                <div className="admin-card__meta">
                  <span className="admin-meta">Ordem #{category.order_index ?? 0}</span>
                  {category.parent_id ? <span className="admin-meta">Categoria pai definida</span> : null}
                </div>
                {category.synonyms?.length ? (
                  <div className="admin-card__tags" aria-label="Sinônimos">
                    {category.synonyms.map((synonym) => (
                      <span key={synonym} className="admin-tag">
                        {synonym}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={() => handleOpenEdit(category.id)}
                  >
                    <NotePencil size={15} weight="bold" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash size={15} weight="bold" aria-hidden="true" />
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen ? (
        <CategoryForm
          categoryId={editingId ?? undefined}
          categories={categories}
          onClose={handleCloseForm}
          showToast={showToast}
        />
      ) : null}
    </section>
  )
}
