import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { HiOutlineUserCircle } from 'react-icons/hi'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isConfigValid } from '../firebase'

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
  const [error, setError] = useState(
    !isConfigValid ? 'Firebase no está configurado. Añade las variables VITE_FIREBASE_* en .env.local.' : '',
  )
  const [message, setMessage] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const location = useLocation()
  const fromState = location.state?.from
  const requireVerification = location.state?.requireVerification

  useEffect(() => {
    if (!isConfigValid || !auth) {
      setAuthLoaded(true)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user)
      setAuthLoaded(true)
    })

    return unsubscribe
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isConfigValid) {
      setError('Firebase no está configurado. Añade las variables VITE_FIREBASE_* en .env.local.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Correo electrónico y contraseña son obligatorios.')
      return
    }

    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(userCredential.user)
        setMessage(
          'Correo de verificación enviado. Revisa tu bandeja y confirma tu email antes de iniciar sesión.',
        )
        setIsRegister(false)
        setEmail('')
        setPassword('')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        navigate('/home')
      }
    } catch (firebaseError) {
      setError(firebaseError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const currentUser = authUser || auth.currentUser
    if (!currentUser) {
      setError('No se encontró usuario activo. Inicia sesión y vuelve a intentarlo.')
      return
    }

    try {
      await sendEmailVerification(currentUser)
      setMessage('Correo de verificación reenviado. Revisa tu bandeja e ingresa después de confirmar tu email.')
      setError('')
    } catch (firebaseError) {
      setError(firebaseError.message)
    }
  }

  if (!isConfigValid) {
    return (
      <main className="login-screen">
        <section className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <HiOutlineUserCircle size={32} />
            </div>
            <div>
              <h1>Configuración faltante</h1>
              <p>La aplicación no puede inicializar Firebase sin tus claves.</p>
            </div>
          </div>
          <p className="login-error">
            Firebase no está configurado. Crea un archivo <code>.env.local</code> con las variables
            <strong> VITE_FIREBASE_API_KEY</strong>, <strong>VITE_FIREBASE_AUTH_DOMAIN</strong>,
            <strong> VITE_FIREBASE_PROJECT_ID</strong>, <strong>VITE_FIREBASE_STORAGE_BUCKET</strong>,
            <strong> VITE_FIREBASE_MESSAGING_SENDER_ID</strong> y <strong>VITE_FIREBASE_APP_ID</strong>.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="login-screen">
      <motion.section
        className={`login-card ${isRegister ? 'register-card' : ''}`}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h1>{isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h1>
              <p>{isRegister ? 'Regístrate para empezar con tu nueva cuenta' : 'Inicia sesión para continuar'}</p>
            </motion.div>
          </AnimatePresence>
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

          {(message || (requireVerification && authLoaded && authUser && !authUser.emailVerified)) && (
            <motion.div
              className="login-message-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="login-message">
                {message ||
                  'Hemos enviado un correo de verificación. Revisa tu bandeja e ingresa después de confirmar tu email.'}
              </p>
              {(authUser || auth.currentUser) && !((authUser || auth.currentUser)?.emailVerified) && (
                <button
                  type="button"
                  className="verify-button"
                  onClick={handleResendVerification}
                >
                  Reenviar correo de verificación
                </button>
              )}
            </motion.div>
          )}

          <motion.button
            className="login-button"
            type="submit"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (isRegister ? 'Registrando...' : 'Ingresando...') : isRegister ? 'Registrarse' : 'Iniciar sesión'}
            <FiArrowRight />
          </motion.button>

          <motion.div
            className="register-switch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <button
              type="button"
              className="register-button"
              onClick={() => setIsRegister((current) => !current)}
            >
              {isRegister ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </motion.div>
        </form>
      </motion.section>
    </main>
  )
}
