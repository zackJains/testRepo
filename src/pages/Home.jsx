import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const homeMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      navigate('/')
    }
  }

  return (
    <motion.main
      className="home-screen"
      initial="hidden"
      animate="visible"
      variants={homeMotion}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="home-card">
        <div className="home-header">
          <div>
            <h1>Bienvenido</h1>
            <p>Has iniciado sesión correctamente. Esta es la página de inicio.</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </motion.main>
  )
}
