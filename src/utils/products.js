export const PRODUCTS_API_URL = 'https://creciendojuntos-sma.com:2012/api/producto/consultarProducto'

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

export function formatPrice(value) {
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

let productsPromise = null

export function fetchProducts() {
  if (!productsPromise) {
    productsPromise = fetch(PRODUCTS_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos desde la API.')
        }
        return response.json()
      })
      .then(extractProducts)
      .catch((error) => {
        productsPromise = null
        throw error
      })
  }

  return productsPromise
}
