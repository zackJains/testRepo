import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isConfigValid } from '../firebase'

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const location = useLocation()

  useEffect(() => {
    if (!isConfigValid || !auth) {
      setCheckingAuth(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setCheckingAuth(false)
    })

    return unsubscribe
  }, [])

  if (checkingAuth) {
    return <main className="login-screen">Cargando...</main>
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (!user.emailVerified) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, requireVerification: true }}
      />
    )
  }

  return children
}
