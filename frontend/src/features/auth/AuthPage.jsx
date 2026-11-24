import { useState } from 'react'
import './AuthPage.css'

export default function AuthPage({ isSignUp, onSubmit }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError('')

    const fields = new FormData(event.currentTarget)
    try {
      await onSubmit({ email: fields.get('email'), password: fields.get('password') })
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <h1>{isSignUp ? 'Create an account' : 'Sign in'}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          aria-describedby={isSignUp ? 'password-hint' : undefined}
          minLength={isSignUp ? 8 : undefined}
          maxLength={128}
          required
        />
        {isSignUp && <small id="password-hint">Use 8 to 128 characters.</small>}

        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      <p>
        {isSignUp ? 'Already have an account? ' : 'Need an account? '}
        <a href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Sign up'}</a>
      </p>
    </>
  )
}
