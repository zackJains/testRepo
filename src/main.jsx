import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const getInitialEntry = () => {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('p')
  if (redirect) {
    return redirect.startsWith('/') ? redirect : `/${redirect}`
  }
  return window.location.pathname
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL} initialEntries={[getInitialEntry()]}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
