const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {object} input
 * @param {{ productId: string, quantity: number }[]} input.productsAddedToCart
 * @param {{ id: string, customData: string }[]} input.importedProductsAddedToCart
 * @param {string} input.shopifyCartId
 */
module.exports = async (context, input) => {
  const shopgateProductsById = input.importedProductsAddedToCart.reduce((shopgateProducts, product) => {
    const customData = product.customData ? JSON.parse(product.customData) : {}
    shopgateProducts[product.id] = { ...product, customData }

    return shopgateProducts
  }, {})

  const cartLines = input.productsAddedToCart.map(product => {
    const importedProduct = shopgateProductsById[product.productId] || {}
    const variantId = importedProduct.baseProductId
      ? product.productId
      : (importedProduct.customData || {}).variant_id

    if (!variantId) return null

    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity: product.quantity
    }
  }).filter(cartLine => !!cartLine) // filter out products with no variant ID

  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  try {
    await storefrontApi.addCartLines(input.shopifyCartId, cartLines)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error adding products to cart')
  }
}
