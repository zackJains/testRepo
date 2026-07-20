import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { HiOutlineUserCircle } from 'react-icons/hi'

const cardMotion = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

const fieldMotion = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.08 } }),
}

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
      <motion.section
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={cardMotion}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <motion.header
          className="login-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="login-logo">
            <HiOutlineUserCircle size={32} />
          </div>
          <div>
            <h1>Bienvenido de nuevo</h1>
            <p>Inicia sesión para continuar</p>
          </div>
        </motion.header>

        <form className="login-form" onSubmit={handleSubmit}>
          <motion.label
            className="login-field"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fieldMotion}
          >
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
          </motion.label>

          <motion.label
            className="login-field"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fieldMotion}
          >
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
          </motion.label>

          <motion.div
            className="login-foot"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <label className="remember-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Recordarme
            </label>
          </motion.div>

          {error && (
            <motion.p
              className="login-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            className="login-button"
            type="submit"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Iniciar sesión
            <FiArrowRight />
          </motion.button>
        </form>
      </motion.section>
    </main>
  )
}
