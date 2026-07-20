import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="home-screen">
      <div className="home-card">
        <div className="home-header">
          <div>
            <h1>Bienvenido</h1>
            <p>Has iniciado sesión correctamente. Esta es la página de inicio.</p>
          </div>
          <button className="logout-button" onClick={() => navigate('/')}>Cerrar sesión</button>
        </div>
      </div>
    </main>
  )
}
