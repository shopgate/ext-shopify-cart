const { extractVariantId, handleCartError, getCurrentCartId } = require('../helper/cart')
const ShopifyApiRequest = require('../lib/shopify.api.js')
const UnknownError = require('../models/Errors/UnknownError')

module.exports = async (context, input) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const existingCartItems = input.cartItems
  const itemsIdsToDelete = input.cartItemIds
  const importedProductsInCart = input.importedProductsInCart

  try {
    const cartId = await getCurrentCartId(context)
    const items = {}
    existingCartItems.forEach(existingCartItem => {
      if (existingCartItem.product && existingCartItem.product.id &&
        !itemsIdsToDelete.find(productId => existingCartItem.id === productId)
      ) {
        items[existingCartItem.product.id] = existingCartItem.quantity
      }
    })
    let checkoutCartItems = Object.entries(items).map(([id, quantity]) => {
      const variantId = extractVariantId(importedProductsInCart.find(importedProductInCart =>
        importedProductInCart.id === id && importedProductInCart.customData
      ))

      return { variant_id: variantId || id, quantity }
    })
    if (Object.keys(items).length === existingCartItems.length) {
      context.log.error(`No cartItem(s) found for cart ${cartId}`)

      return {}
    }
    try {
      await shopifyApiRequest.put(`/admin/api/2022-10/checkouts/${cartId}.json`, { checkout: { line_items: checkoutCartItems } })
    } catch (err) {
      return { messages: await handleCartError(err, checkoutCartItems, cartId, context) }
    }
  } catch (err) {
    throw new UnknownError()
  }
}
