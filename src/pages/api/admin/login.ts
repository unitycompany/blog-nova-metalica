import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { attachAdminSessionCookie, mapSupabaseSession } from '@/lib/auth/adminSession'
import { env } from '@/lib/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!env.supabase.url || !env.supabase.anonKey) {
    console.error('Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    return res.status(500).json({ error: 'Supabase não está configurado.' })
  }

  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe email e senha.' })
  }

  const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false }
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session || !data.user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' })
  }

  const storedSession = mapSupabaseSession(data.session, data.user)
  attachAdminSessionCookie(res, storedSession)

  return res.status(200).json({ ok: true, user: { email: data.user.email } })
}
