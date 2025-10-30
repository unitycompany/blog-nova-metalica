import { useState } from 'react'
import Head from 'next/head'
import type { GetServerSideProps, NextApiRequest } from 'next'
import { AdminStyles } from '@/components/admin/AdminStyles'
import { getAdminRequestContext } from '@/lib/auth/adminSession'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Preencha email e senha.')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Falha ao entrar.')
      }

      window.location.href = '/admin'
    } catch (loginError: unknown) {
      console.error(loginError)
      const message = loginError instanceof Error ? loginError.message : 'Não foi possível realizar o login.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login do painel | Nova Metálica</title>
      </Head>
      <AdminStyles />
      <main className="admin-login">
        <div className="admin-login__card">
          <h1 className="admin-login__title">Acesso ao painel</h1>
          <p className="admin-login__subtitle">Faça login para gerenciar conteúdo, autores e categorias.</p>

          <form className="admin-login__form" onSubmit={handleSubmit}>
            <label className="admin-field" htmlFor="login-email">
              <span className="admin-field__label-text">Email</span>
              <input
                id="login-email"
                type="email"
                className="admin-input"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="admin-field" htmlFor="login-password">
              <span className="admin-field__label-text">Senha</span>
              <input
                id="login-password"
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <p className="admin-login__error" role="alert">{error}</p> : null}

            <button type="submit" className="admin-button admin-button--primary admin-login__submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const context = await getAdminRequestContext(req as NextApiRequest, res)

  if (context) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
