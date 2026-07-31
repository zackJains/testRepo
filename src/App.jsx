import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import RequireAuth from './components/RequireAuth'
import './App.css'

function App() {
  return (
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
  )
}

export default App
