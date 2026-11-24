import { useState } from 'react'

export default function HomePage({ user, onSignOut }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSignOut() {
    setPending(true)
    setError('')

    try {
      await onSignOut()
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <h1>Savings Wishlist</h1>
      <p>place holder home page</p>
      <p>Signed in as {user.email}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" onClick={handleSignOut} disabled={pending}>
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  )
}
