const Message = require('../models/messages/message')
const CartItem = require('../models/cart/cartItems/cartItem')
const Tools = require('../lib/tools')
const { extractVariantId } = require('../helper/cart')

/**
 * @param context
 * @param {Object} input
 * @param {Object[]} input.importedProductsInCart The list of items in the cart in Shopgate format
 * @param {Object[]} input.cartItems The list of items currently in the cart
 * @param {Object[]} input.CartItem The list of items to be changed
 */
module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const existingCartItems = input.cartItems
  const updateCartItems = input.CartItem
  const importedProductsInCart = input.importedProductsInCart
  const cartItem = new CartItem()

  let checkoutCartItems = []

  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

  // create a map to map all Shopgate item_numbers in the cart to Shopify variant_ids
  const existingCartItemProducts = existingCartItems.filter(item => item.type === cartItem.TYPE_PRODUCT)

  let variantMap = {}
  existingCartItemProducts.forEach(item => {
    let variantId = extractVariantId(importedProductsInCart.find(importedProduct =>
      importedProduct.id === item.product.id && importedProduct.customData
    ))

    variantMap[item.product.id] = variantId || item.product.id
  })

  // identify all products that have changed in quantity and the one that have not
  existingCartItemProducts.forEach(item => {
    const updateItem = updateCartItems.find(updateItem => updateItem.CartItemId === item.id)

    checkoutCartItems.push({
      variant_id: variantMap[item.product.id],
      quantity: updateItem ? updateItem.quantity : item.quantity
    })
  })

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
    if (!err.errors && !err.errors.line_items) throw err

    const errorMessages = []
    Object.values(err.errors.line_items).forEach(errorsPerLineItem => {
      Object.entries(errorsPerLineItem).forEach(([errorType, errors]) => {
        errors.forEach(error => {
          let errorCode
          switch (error.code) {
            case 'not_enough_in_stock':
              errorCode = 'EINSUFFICIENTSTOCK'
              break
            default:
              errorCode = error.code
          }

          const errorMessage = new Message()
          errorMessage.addErrorMessage(errorCode, error.message)
          errorMessages.push(errorMessage.toJson())
        })
      })
    })

    return { messages: errorMessages }
  }
}
