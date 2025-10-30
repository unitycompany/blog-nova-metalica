import type { NextApiRequest, NextApiResponse } from 'next'
import type { Session, User } from '@supabase/supabase-js'
import type { ServerResponse } from 'node:http'
import { getSupabaseAdmin } from '../supabase'

const COOKIE_NAME = 'nm_admin_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export type StoredAdminSession = {
  access_token: string
  refresh_token?: string
  expires_at: number
  email?: string
  user_id: string
}

export type AdminRequestContext = {
  user: User
  session: StoredAdminSession
}

function encodeSession(value: StoredAdminSession): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function decodeSession(raw?: string): StoredAdminSession | null {
  if (!raw) return null

  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8')
    const parsed = JSON.parse(json) as StoredAdminSession

    if (!parsed.access_token || !parsed.expires_at || !parsed.user_id) {
      return null
    }

    return parsed
  } catch (error) {
    console.error('Failed to decode admin session cookie:', error)
    return null
  }
}

function parseCookies(header?: string): Record<string, string> {
  if (!header) {
    return {}
  }

  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [namePart, ...valueParts] = pair.trim().split('=')

    if (!namePart) {
      return acc
    }

    const value = valueParts.join('=')
    acc[namePart] = decodeURIComponent(value)
    return acc
  }, {})
}

function mapSessionToStored(session: Session, user: User): StoredAdminSession {
  const expiresAt = session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600)

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token ?? undefined,
    expires_at: expiresAt,
    email: user.email ?? undefined,
    user_id: user.id
  }
}

type SetCookieResponse = Pick<ServerResponse, 'getHeader' | 'setHeader'>

function appendSetCookie(res: SetCookieResponse, value: string) {
  const existing = res.getHeader('Set-Cookie')

  if (!existing) {
    res.setHeader('Set-Cookie', value)
    return
  }

  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, value])
    return
  }

  res.setHeader('Set-Cookie', [existing.toString(), value])
}

export function serializeAdminSession(session: StoredAdminSession): string {
  const encoded = encodeSession(session)
  const attributes = [
    `${COOKIE_NAME}=${encoded}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`
  ]

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure')
  }

  return attributes.join('; ')
}

export function serializeClearSession(): string {
  const attributes = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure')
  }

  return attributes.join('; ')
}

export function getStoredSessionFromHeader(header?: string): StoredAdminSession | null {
  const cookies = parseCookies(header)
  const raw = cookies[COOKIE_NAME]
  return decodeSession(raw)
}

export async function getAdminRequestContext(
  req: NextApiRequest,
  res?: NextApiResponse | ServerResponse
): Promise<AdminRequestContext | null> {
  let storedSession = getStoredSessionFromHeader(req.headers.cookie)

  if (!storedSession) {
    return null
  }

  const supabase = getSupabaseAdmin()

  const needsRefresh = storedSession.expires_at <= Math.floor(Date.now() / 1000) + 30

  if (needsRefresh && storedSession.refresh_token) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: storedSession.refresh_token })

    if (error || !data.session || !data.user) {
      console.error('Failed to refresh Supabase session:', error)
      storedSession = null
      if (res) {
        appendSetCookie(res, serializeClearSession())
      }
    } else {
      storedSession = mapSessionToStored(data.session, data.user)

      if (res) {
        appendSetCookie(res, serializeAdminSession(storedSession))
      }
    }
  }

  if (!storedSession) {
    return null
  }

  const { data, error } = await supabase.auth.getUser(storedSession.access_token)

  if (error || !data.user) {
    console.error('Failed to validate Supabase access token:', error)
    if (res) {
      appendSetCookie(res, serializeClearSession())
    }
    return null
  }

  return {
    user: data.user,
    session: storedSession
  }
}

export function attachAdminSessionCookie(res: NextApiResponse | ServerResponse, session: StoredAdminSession) {
  appendSetCookie(res, serializeAdminSession(session))
}

export function clearAdminSessionCookie(res: NextApiResponse | ServerResponse) {
  appendSetCookie(res, serializeClearSession())
}

export function mapSupabaseSession(session: Session, user: User): StoredAdminSession {
  return mapSessionToStored(session, user)
}
