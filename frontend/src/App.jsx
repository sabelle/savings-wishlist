import { useEffect } from 'react'
import AuthPage from './features/auth/AuthPage.jsx'
import { useAuth } from './features/auth/useAuth.js'
import HomePage from './features/home/HomePage.jsx'
import './App.css'

function App() {
  const { user, sessionError, signIn, signUp, signOut } = useAuth()
  const isSignUp = window.location.pathname === '/sign-up'

  useEffect(() => {
    if (user === undefined) return

    const authPath = isSignUp ? '/sign-up' : '/sign-in'
    const path = user ? '/' : authPath
    if (window.location.pathname !== path) window.history.replaceState(null, '', path)
  }, [user, isSignUp])

  let page
  if (sessionError) {
    page = (
      <>
        <p className="error" role="alert">{sessionError}</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
      </>
    )
  } else if (user === undefined) {
    page = <p role="status">Checking your session…</p>
  } else if (user) {
    page = <HomePage user={user} onSignOut={signOut} />
  } else {
    page = <AuthPage isSignUp={isSignUp} onSubmit={isSignUp ? signUp : signIn} />
  }

  return <main className="page">{page}</main>
}

export default App
