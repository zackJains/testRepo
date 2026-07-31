import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiShoppingBag, FiX } from 'react-icons/fi'

const API_URL = 'https://creciendojuntos-sma.com:2012/api/producto/consultarProducto'

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
  const images = Array.isArray(item?.imagenes)
    ? item.imagenes
        .map((imageItem) => imageItem?.urlProducto || imageItem?.url || imageItem?.image || imageItem?.src)
        .filter(Boolean)
    : []
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
    images,
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

export default function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || product.images?.[0] || '')
    }
  }, [product])

  useEffect(() => {
    if (!isPreviewOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousImage()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextImage()
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsPreviewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewOpen, product, selectedImage])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadProduct = async () => {
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
          throw new Error('No fue posible consultar el producto desde la API.')
        }

        const payload = await response.json()
        const products = extractProducts(payload)
        const selectedProduct = products.find((item) => String(item.id) === String(productId))

        if (isMounted) {
          setProduct(selectedProduct || null)
          if (!selectedProduct) {
            setError('No se encontró un producto con ese identificador.')
          }
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return
        }

        if (isMounted) {
          setError(fetchError.message || 'Ocurrió un problema al cargar el detalle.')
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [productId])

  const goToPreviousImage = () => {
    if (!product?.images?.length) {
      return
    }

    const currentIndex = product.images.findIndex((imageUrl) => imageUrl === selectedImage)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : product.images.length - 1
    setSelectedImage(product.images[previousIndex])
  }

  const goToNextImage = () => {
    if (!product?.images?.length) {
      return
    }

    const currentIndex = product.images.findIndex((imageUrl) => imageUrl === selectedImage)
    const nextIndex = currentIndex >= 0 && currentIndex < product.images.length - 1 ? currentIndex + 1 : 0
    setSelectedImage(product.images[nextIndex])
  }

  return (
    <main className="detail-screen">
      <section className="detail-card">
        <Link className="back-link" to="/shop">
          <FiArrowLeft />
          Volver a la tienda
        </Link>

        {isLoading ? (
          <div className="detail-loading">
            <div className="empty-icon">
              <FiShoppingBag size={28} />
            </div>
            <h1>Cargando detalles...</h1>
            <p>Estamos obteniendo la información del producto seleccionado.</p>
          </div>
        ) : error || !product ? (
          <div className="detail-loading">
            <h1>No se encontró el producto</h1>
            <p>{error || 'Prueba volver a la tienda y elegir otro artículo.'}</p>
          </div>
        ) : (
          <div className="detail-layout">
            <div className="detail-media">
              <button
                type="button"
                className="detail-image-wrap"
                onClick={() => selectedImage && setIsPreviewOpen(true)}
                aria-label={`Ver imagen ampliada de ${product.name}`}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt={product.name} className="detail-image" />
                ) : (
                  <div className="product-image-fallback detail-fallback">
                    <FiShoppingBag size={36} />
                  </div>
                )}
              </button>

              {product.images?.length > 1 && (
                <div className="image-gallery">
                  {product.images.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      className={`gallery-thumb ${selectedImage === imageUrl ? 'active' : ''}`}
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <img src={imageUrl} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-info">
              <p className="eyebrow">{product.category || 'Producto'}</p>
              <h1>{product.name}</h1>
              <p className="detail-description">{product.description}</p>

              <div className="detail-price-row">
                <div>
                  <span className="detail-price">{formatPrice(product.price)}</span>
                  {product.stock !== null && <p className="detail-stock">Stock disponible: {product.stock}</p>}
                </div>
                {product.code && <span className="detail-code">Código: {product.code}</span>}
              </div>

              <div className="detail-highlights">
                {product.brand && (
                  <div>
                    <span className="detail-label">Marca</span>
                    <p>{product.brand}</p>
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="detail-label">Categoría</span>
                    <p>{product.category}</p>
                  </div>
                )}
                {product.stock !== null && (
                  <div>
                    <span className="detail-label">Disponibilidad</span>
                    <p>{product.stock > 0 ? 'En stock' : 'Sin stock'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {isPreviewOpen && selectedImage && (
        <div className="image-preview-overlay" role="dialog" aria-modal="true" onClick={() => setIsPreviewOpen(false)}>
          <button type="button" className="image-preview-close" onClick={() => setIsPreviewOpen(false)} aria-label="Cerrar imagen ampliada">
            <FiX size={24} />
          </button>

          {product.images?.length > 1 && (
            <>
              <button type="button" className="image-preview-nav image-preview-nav-left" onClick={(event) => {
                event.stopPropagation()
                goToPreviousImage()
              }} aria-label="Imagen anterior">
                <FiChevronLeft size={28} />
              </button>
              <button type="button" className="image-preview-nav image-preview-nav-right" onClick={(event) => {
                event.stopPropagation()
                goToNextImage()
              }} aria-label="Imagen siguiente">
                <FiChevronRight size={28} />
              </button>
            </>
          )}

          <img src={selectedImage} alt={product.name} className="image-preview-image" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  )
}
