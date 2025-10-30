export async function adminFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }

    throw new Error('Sessão expirada. Faça login novamente.')
  }

  return response
}
