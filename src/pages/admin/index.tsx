import { useMemo, useState } from 'react'
import type { GetServerSideProps, NextApiRequest } from 'next'
import { Notepad, Folders, UsersThree } from '@phosphor-icons/react'
import { useToast } from '@/components/admin/Toast'
import { AdminShell, type TabDefinition, type TabSummary } from '@/components/admin/dashboard'
import { ArticlesModule } from '@/components/admin/articles'
import { CategoriesModule } from '@/components/admin/categories'
import { AuthorsModule } from '@/components/admin/authors'
import { AdminStyles } from '@/components/admin/AdminStyles'
import { getAdminRequestContext } from '@/lib/auth/adminSession'

type TabKey = 'articles' | 'categories' | 'authors'

const TABS: Array<TabDefinition<TabKey>> = [
  {
    id: 'articles',
    label: 'Artigos',
    icon: Notepad,
    description: 'Publique, atualize e acompanhe o desempenho das matérias.'
  },
  {
    id: 'categories',
    label: 'Categorias',
    icon: Folders,
    description: 'Organize os temas estratégicos e mantenha a taxonomia saudável.'
  },
  {
    id: 'authors',
    label: 'Autores',
    icon: UsersThree,
    description: 'Administre a equipe editorial, credenciais e canais de contato.'
  }
]

type AdminPageProps = {
  adminEmail: string
}

export default function AdminPage({ adminEmail }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('articles')
  const [summary, setSummary] = useState<TabSummary | null>(null)
  const { showToast, ToastComponent } = useToast()

  const summaryLoading = useMemo(() => summary === null, [summary])

  function handleChangeTab(nextTab: TabKey) {
    setActiveTab(nextTab)
    setSummary(null)
  }

  function handleSummaryUpdate(nextSummary: TabSummary) {
    setSummary(nextSummary)
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })

      if (!response.ok) {
        throw new Error('Falha ao encerrar sessão.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      window.location.href = '/admin/login'
    }
  }

  return (
    <>
      <AdminStyles />
      <AdminShell
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleChangeTab}
        summaryData={summary}
        summaryLoading={summaryLoading}
        userEmail={adminEmail}
        onLogout={handleLogout}
      >
        {activeTab === 'articles' ? (
          <ArticlesModule onSummary={handleSummaryUpdate} showToast={showToast} />
        ) : null}
        {activeTab === 'categories' ? (
          <CategoriesModule onSummary={handleSummaryUpdate} showToast={showToast} />
        ) : null}
        {activeTab === 'authors' ? (
          <AuthorsModule onSummary={handleSummaryUpdate} showToast={showToast} />
        ) : null}
      </AdminShell>

      {ToastComponent}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<AdminPageProps> = async ({ req, res }) => {
  const auth = await getAdminRequestContext(req as NextApiRequest, res)

  if (!auth) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false
      }
    }
  }

  return {
    props: {
      adminEmail: auth.user.email ?? 'Usuário Supabase'
    }
  }
}
