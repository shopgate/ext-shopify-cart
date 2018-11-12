const Message = require('../models/messages/message')
const Tools = require('../lib/tools')

/**
 * @param {Object} context
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

  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

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
    ).customData)

    // if variant not found among added products, search in existing products
    if (!variantId) {
      variantId = extractVariantId(importedProductsInCart.find(importedProductInCart =>
        importedProductInCart.id === id && importedProductInCart.customData
      ).customData)
    }

    return {
      variant_id: variantId || id,
      quantity
    }
  })

  try {
    return await new Promise((resolve, reject) => {
      shopify.put(
        `/admin/checkouts/${cartId}.json`,
        { checkout: { line_items: checkoutCartItems } },
        err => {
          if (err) return reject(err)

          resolve()
        }
      )
    })
  } catch (err) {
    if (!err) return

    if (!err.errors || !err.errors.line_items) throw err

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

  /**
   * @param {string} customDataJson
   * @returns {number|null}
   */
  function extractVariantId (customDataJson) {
    const customData = JSON.parse(customDataJson)

    return (customData && customData.variant_id) ? customData.variant_id : null
  }
}
