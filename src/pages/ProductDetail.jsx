import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiShoppingBag, FiX } from 'react-icons/fi'
import { fetchProducts, formatPrice } from '../utils/products'

export default function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const previewImageRef = useRef(null)
  const dragStateRef = useRef({ startX: 0, offset: 0 })

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

    const loadProduct = async () => {
      setIsLoading(true)
      setError('')

      try {
        const products = await fetchProducts()
        const selectedProduct = products.find((item) => String(item.id) === String(productId))

        if (isMounted) {
          setProduct(selectedProduct || null)
          if (!selectedProduct) {
            setError('No se encontró un producto con ese identificador.')
          }
        }
      } catch (fetchError) {
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

  const handleTouchStart = (event) => {
    if (!product?.images?.length) {
      return
    }

    setIsDragging(true)
    dragStateRef.current = { startX: event.touches[0].clientX, offset: 0 }
  }

  const handleTouchMove = (event) => {
    if (!isDragging || !previewImageRef.current) {
      return
    }

    const offset = event.touches[0].clientX - dragStateRef.current.startX
    dragStateRef.current.offset = offset
    previewImageRef.current.style.transform = `translateX(${offset}px)`
  }

  const handleTouchEnd = () => {
    if (!isDragging) {
      return
    }

    if (dragStateRef.current.offset < -60) {
      goToNextImage()
    } else if (dragStateRef.current.offset > 60) {
      goToPreviousImage()
    }

    if (previewImageRef.current) {
      previewImageRef.current.style.transform = ''
    }
    setIsDragging(false)
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
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="detail-image"
                    decoding="async"
                  />
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
                      <img src={imageUrl} alt={`${product.name} ${index + 1}`} loading="lazy" decoding="async" />
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

          <img
            ref={previewImageRef}
            src={selectedImage}
            alt={product.name}
            className={`image-preview-image ${isDragging ? 'dragging' : ''}`}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      )}
    </main>
  )
}
