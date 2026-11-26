import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiLogOut, FiSearch, FiShoppingBag, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { fetchProducts, formatPrice } from '../utils/products'

const SEARCH_STORAGE_KEY = 'shop-search-query'

function getSearchHaystack(product) {
  return [product.name, product.description, product.category, product.brand, product.code]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export default function Shop() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return window.sessionStorage.getItem(SEARCH_STORAGE_KEY) || ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (search.trim()) {
      window.sessionStorage.setItem(SEARCH_STORAGE_KEY, search)
    } else {
      window.sessionStorage.removeItem(SEARCH_STORAGE_KEY)
    }
  }, [search])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsLoading(true)
      setError('')

      try {
        const normalizedProducts = await fetchProducts()

        if (isMounted) {
          setProducts(normalizedProducts)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || 'Ocurrió un problema al consultar la tienda.')
          setProducts([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const productsWithHaystack = useMemo(
    () => products.map((product) => ({ product, haystack: getSearchHaystack(product) })),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return products
    }

    return productsWithHaystack
      .filter(({ haystack }) => haystack.includes(query))
      .map(({ product }) => product)
  }, [products, productsWithHaystack, search])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      navigate('/')
    }
  }

  const clearSearch = () => {
    setSearch('')
  }

  return (
    <main className="shop-screen">
      <section className="shop-shell">
        <header className="shop-header">
          <div>
            <p className="eyebrow">Tienda</p>
            <h1>Explora tus productos</h1>
            <p>Busca rápido por nombre, categoría o descripción y entra a ver cada detalle.</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut size={18} />
            Cerrar sesión
          </button>
        </header>

        <div className="shop-toolbar">
          <label className="search-bar" htmlFor="product-search">
            <FiSearch className="search-icon" />
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar productos..."
              autoComplete="off"
              inputMode="search"
            />
            {search && (
              <button type="button" className="clear-search-button" onClick={clearSearch} aria-label="Limpiar búsqueda">
                <FiX size={16} />
              </button>
            )}
          </label>
          <div className="shop-stats">
            <span>{filteredProducts.length} productos</span>
            <span>{products.length} cargados</span>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiShoppingBag size={28} />
            </div>
            <h2>Cargando la tienda...</h2>
            <p>Estamos consultando la API para mostrar los productos disponibles.</p>
          </div>
        ) : error ? (
          <div className="empty-state error-state">
            <h2>No pudimos cargar la tienda</h2>
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiShoppingBag size={28} />
            </div>
            <h2>No hay productos que coincidan</h2>
            <p>Prueba con otra palabra o vuelve a cargar la tienda.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <Link className="product-image-link" to={`/shop/${encodeURIComponent(product.id)}`}>
                  <div className="product-image-wrap">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="product-image-fallback">
                        <FiShoppingBag size={28} />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="product-card-body">
                  <div className="product-meta">
                    {product.category && <span className="badge">{product.category}</span>}
                    {product.stock !== null && <span className="stock-badge">Stock: {product.stock}</span>}
                  </div>
                  <h2>{product.name}</h2>
                  <div className="product-footer">
                    <span className="price">{formatPrice(product.price)}</span>
                    <Link className="detail-link" to={`/shop/${encodeURIComponent(product.id)}`}>
                      Ver detalles
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
