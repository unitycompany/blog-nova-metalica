import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAdminSessionCookie, getStoredSessionFromHeader } from '@/lib/auth/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const storedSession = getStoredSessionFromHeader(req.headers.cookie)

  if (storedSession) {
    const supabase = getSupabaseAdmin()

    try {
      await supabase.auth.admin.signOut(storedSession.user_id)
    } catch (error) {
      console.error('Failed to revoke Supabase session on logout:', error)
    }
  }

  clearAdminSessionCookie(res)
  return res.status(200).json({ ok: true })
}
