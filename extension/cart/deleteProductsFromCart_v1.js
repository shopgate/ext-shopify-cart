const Tools = require('../lib/tools')
const Message = require('../models/messages/message')
const CartItem = require('../models/cart/cartItems/cartItem')
const { extractVariantId, handleCartError, filterUnavailableProducts } = require('../helper/cart')

module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const existingCartItems = input.cartItems
  const itemsIdsToDelete = input.CartItemIds
  const importedProductsInCart = input.importedProductsInCart
  const cartItem = new CartItem()
  let resultMessages = []

  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

  const items = {}
  existingCartItems.forEach(existingCartItem => {
    if (existingCartItem.product && existingCartItem.product.id
        && !itemsIdsToDelete.find(productId => existingCartItem.id === productId)
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
    let message = new Message()
    message.type = message.TYPE_ERROR
    message.message = 'No cartItem(s) found'
    message.code = '404'
    resultMessages.push(message.toJson())
    return { messages: resultMessages }
  }

  try {
    checkoutCartItems = await filterUnavailableProducts(checkoutCartItems, cartId, context)
    
    return await new Promise((resolve, reject) => shopify.put(
      `/admin/checkouts/${cartId}.json`,
      { checkout: { line_items: checkoutCartItems } },
      err => {
        if (err) return reject(err)
        console.log('RESOLVE')
        resolve()
      }
    ))
  } catch (err) {
    return { messages: handleCartError(err) }
  }
}
