async function request(action, { body, signal } = {}) {
  const response = await fetch(`/api/auth/${action}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  if (response.status === 204 || (action === 'me' && response.status === 401)) {
    return null
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.user) {
    throw new Error(data?.error || 'Could not reach authentication. Try again.')
  }

  return data.user
}

export const authApi = {
  getCurrentUser(signal) {
    return request('me', { signal })
  },
  signIn(credentials) {
    return request('login', { body: credentials })
  },
  signUp(credentials) {
    return request('register', { body: credentials })
  },
  signOut() {
    return request('logout', { body: {} })
  },
}
