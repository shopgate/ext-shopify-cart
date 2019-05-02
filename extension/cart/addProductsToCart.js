const { extractVariantId, handleCartError, getCurrentCartId } = require('../helper/cart')
const ShopifyApiRequest = require('../lib/shopify.api.js')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {Object[]} input.products
 * @param {Object[]} input.importedProductsAddedToCart
 * @param {Object[]} input.importedProductsInCart
 * @param {Object[]} input.products
 * @param {Object[]} input.cartItems
 */
module.exports = async (context, input) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const importedProductsAddedToCart = input.importedProductsAddedToCart
  const importedProductsInCart = input.importedProductsInCart
  const newCartItems = input.products
  const existingCartItems = input.cartItems

  try {
    const cartId = await getCurrentCartId(context)
    const items = {}
    existingCartItems.forEach(existingCartItem => {
      if (existingCartItem.product && existingCartItem.product.id) {
        items[existingCartItem.product.id] = existingCartItem.quantity
      }
    })
    newCartItems.forEach(newCartItem => {
      if (!(newCartItem.productId in items)) {
        items[newCartItem.productId] = 0
      }
      items[newCartItem.productId] += newCartItem.quantity
    })
    let checkoutCartItems = Object.entries(items).map(([id, quantity]) => {
      let variantId = extractVariantId(importedProductsAddedToCart.find(importedProductAddedToCart =>
        importedProductAddedToCart.id === id && importedProductAddedToCart.customData
      ))

      // if variant not found among added products, search in existing products
      if (!variantId) {
        variantId = extractVariantId(importedProductsInCart.find(importedProductInCart =>
          importedProductInCart.id === id && importedProductInCart.customData
        ))
      }

      return { variant_id: variantId || id, quantity }
    })

    try {
      await shopifyApiRequest.put(`/admin/checkouts/${cartId}.json`, { checkout: { line_items: checkoutCartItems } })
    } catch (err) {
      return { messages: await handleCartError(err, checkoutCartItems, cartId, context) }
    }
  } catch (err) {
    context.log.error({ newCartItems, existingCartItems, error: err }, 'Error while adding items to cart')
    throw new UnknownError()
  }
}
