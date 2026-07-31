import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiLogOut, FiSearch, FiShoppingBag, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const API_URL = 'https://creciendojuntos-sma.com:2012/api/producto/consultarProducto'
const SEARCH_STORAGE_KEY = 'shop-search-query'

function normalizeProduct(item, index) {
  const productData = item?.producto ?? item

  const id =
    productData?.idProducto ?? item?.idProducto ?? item?.id ?? item?.productoId ?? item?.codigo ?? item?.sku ?? `${index + 1}`
  const name = productData?.nombre ?? item?.nombre ?? item?.name ?? item?.producto ?? item?.titulo ?? `Producto ${index + 1}`
  const description =
    productData?.descripcion ?? item?.descripcion ?? item?.description ?? item?.detalle ?? item?.observaciones ?? 'Sin descripción disponible.'
  const price = productData?.precio ?? item?.precio ?? item?.price ?? item?.valor ?? item?.precioVenta ?? null
  const stock = productData?.stock ?? item?.stock ?? item?.cantidad ?? item?.existencia ?? item?.disponibilidad ?? null
  const category = productData?.categoria?.nombre ?? item?.categoria?.nombre ?? productData?.categoria ?? item?.categoria ?? item?.category ?? item?.tipo ?? ''
  const primaryImage = item?.imagenes?.find((imageItem) => imageItem?.principal)?.urlProducto || item?.imagenes?.[0]?.urlProducto
  const image = primaryImage ?? productData?.imagen ?? item?.imagen ?? item?.image ?? item?.foto ?? item?.urlImagen ?? item?.img ?? ''
  const brand = productData?.marca ?? item?.marca ?? item?.brand ?? ''
  const code = item?.colores?.[0]?.sku ?? productData?.codigo ?? item?.codigo ?? item?.code ?? ''

  return {
    id: String(id),
    name: String(name),
    description: String(description),
    price,
    stock,
    category: String(category),
    image: String(image),
    brand: String(brand),
    code: String(code),
  }
}

function extractProducts(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeProduct)
  }

  if (payload && typeof payload === 'object') {
    const candidates = ['productos', 'products', 'data', 'items', 'result', 'response', 'producto', 'product']

    for (const key of candidates) {
      const value = payload[key]
      if (Array.isArray(value)) {
        return value.map(normalizeProduct)
      }

      if (value && typeof value === 'object') {
        const nested = extractProducts(value)
        if (nested.length) {
          return nested
        }
      }
    }

    const values = Object.values(payload)
    for (const value of values) {
      if (Array.isArray(value)) {
        return value.map(normalizeProduct)
      }
    }
  }

  return []
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'Precio no disponible'
  }

  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return String(value)
  }

  const [integerPart, decimalPart] = String(numericValue.toFixed(0)).split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalPart ? `$ ${formattedInteger}.${decimalPart}` : `$ ${formattedInteger}`
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
    const controller = new AbortController()

    const loadProducts = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos desde la API.')
        }

        const payload = await response.json()
        const normalizedProducts = extractProducts(payload)

        if (isMounted) {
          setProducts(normalizedProducts)
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return
        }

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
      controller.abort()
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return products
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
        product.brand,
        product.code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [products, search])

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
                      <img src={product.image} alt={product.name} className="product-image" />
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
