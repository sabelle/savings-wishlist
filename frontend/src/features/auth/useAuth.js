import { useEffect, useState } from 'react'
import { authApi } from './authApi.js'

export function useAuth() {
  const [user, setUser] = useState(undefined)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    authApi.getCurrentUser(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setUser(user)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setSessionError(error.message)
      })

    return () => controller.abort()
  }, [])

  async function signIn(credentials) {
    setUser(await authApi.signIn(credentials))
  }

  async function signUp(credentials) {
    setUser(await authApi.signUp(credentials))
  }

  async function signOut() {
    await authApi.signOut()
    setUser(null)
  }

  return { user, sessionError, signIn, signUp, signOut }
}
