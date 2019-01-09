const Tools = require('../lib/tools')
const { extractVariantId, handleCartError } = require('../helper/cart')

module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const existingCartItems = input.cartItems
  const itemsIdsToDelete = input.cartItemIds
  const importedProductsInCart = input.importedProductsInCart

  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

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

    return {
      variant_id: variantId || id,
      quantity
    }
  })

  if (Object.keys(items).length === existingCartItems.length) {
    context.log.error(`No cartItem(s) found for cart ${cartId}`)

    return {}
  }

  try {
    return await new Promise((resolve, reject) => shopify.put(
      `/admin/checkouts/${cartId}.json`,
      { checkout: { line_items: checkoutCartItems } },
      err => {
        if (err) return reject(err)
        resolve()
      }
    ))
  } catch (err) {
    return { messages: await handleCartError(err, checkoutCartItems, cartId, context) }
  }
}
