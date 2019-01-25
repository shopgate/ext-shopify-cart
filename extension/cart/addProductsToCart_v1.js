const Tools = require('../lib/tools')
const { extractVariantId, handleCartError } = require('../helper/cart')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {Object[]} input.products
 * @param {Object[]} input.importedProductsAddedToCart
 * @param {Object[]} input.importedProductsInCart
 * @param {Object[]} input.products
 * @param {Object[]} input.cartItems
 */
module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const importedProductsAddedToCart = input.importedProductsAddedToCart
  const importedProductsInCart = input.importedProductsInCart
  const newCartItems = input.products
  const existingCartItems = input.cartItems

  return Tools.getCurrentCartId(context).then((cartId) => {
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

    const checkoutCartItems = Object.entries(items).map(([id, quantity]) => {
      let variantId = extractVariantId(importedProductsAddedToCart.find(importedProductAddedToCart =>
        importedProductAddedToCart.id === id && importedProductAddedToCart.customData
      ))

      // if variant not found among added products, search in existing products
      if (!variantId) {
        variantId = extractVariantId(importedProductsInCart.find(importedProductInCart =>
          importedProductInCart.id === id && importedProductInCart.customData
        ))
      }

      return {
        variant_id: variantId || id,
        quantity
      }
    })

    return new Promise((resolve) => shopify.put(
      `/admin/checkouts/${cartId}.json`,
      { checkout: { line_items: checkoutCartItems } },
      cartErrorMessages => {
        return resolve(cartErrorMessages)
      }
    )).then(cartErrorMessages => {
      return handleCartError(cartErrorMessages, checkoutCartItems, cartId, context).then(messages => {
        return {messages}
      })
    })
  }).catch((err) => {
    return err
  })
}
