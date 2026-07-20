import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { HiOutlineUserCircle } from 'react-icons/hi'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Correo electrónico y contraseña son obligatorios.')
      return
    }

    setError('')
    navigate('/home')
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <header className="login-header">
          <div className="login-logo">
            <HiOutlineUserCircle size={32} />
          </div>
          <div>
            <h1>Bienvenido de nuevo</h1>
            <p>Inicia sesión para continuar</p>
          </div>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">Correo electrónico</span>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input
                className="login-input"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-label">Contraseña</span>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input
                className="login-input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          <div className="login-foot">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Recordarme
            </label>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" type="submit">
            Iniciar sesión
            <FiArrowRight />
          </button>
        </form>
      </section>
    </main>
  )
}
