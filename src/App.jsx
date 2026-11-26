import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import RequireAuth from './components/RequireAuth'
import './App.css'

const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))

const routeFallback = (
  <main className="login-screen">
    <section className="login-card">
      <h1>Cargando...</h1>
    </section>
  </main>
)

function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/shop"
          element={
            <RequireAuth>
              <Shop />
            </RequireAuth>
          }
        />
        <Route
          path="/shop/:productId"
          element={
            <RequireAuth>
              <ProductDetail />
            </RequireAuth>
          }
        />
        <Route path="/home" element={<Navigate to="/shop" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
