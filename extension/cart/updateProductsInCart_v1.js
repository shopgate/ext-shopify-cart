const Message = require('../models/messages/message')
const CartItem = require('../models/cart/cartItems/cartItem')
const Tools = require('../lib/tools')
const _ = require('underscore')

/**
 * @typedef {object} input
 * @property {Array} shopifyCartItems
 * @property {Array} cartItems
 * @property {Array} importedProductsInCart
 */

/**
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context)
  const existCartItems = input.cartItems
  const updateCartItems = input.CartItem
  const resultMessages = []
  const importedProductsInCart = input.importedProductsInCart
  const cartItem = new CartItem()

  let checkoutCartItems = []

  /**
   * @param {string} cartId
   */
  let updateProducts = function (cartId) {
    // create a map to map all Shopgate item_numbers in the cart to Shopify variant_ids
    let variantMap = []
    _.each(existCartItems, function (existCartItem) {
      if (existCartItem.type === cartItem.TYPE_PRODUCT) {
        variantMap[existCartItem.product.id] = existCartItem.product.id
        _.each(importedProductsInCart, function (importedProductInCart) {
          if (importedProductInCart.id === existCartItem.product.id && Object.keys(importedProductInCart.customData).length >= 0) {
            // if the product has a variant id then use it, because it is a a normal product in Shopify context then
            const customData = JSON.parse(importedProductInCart.customData)
            if (customData.variant_id !== undefined) {
              variantMap[existCartItem.product.id] = customData.variant_id
            }
          }
        })
      }
    })

    // identify all products that have changed in quantity and the one that have not
    _.each(existCartItems, function (existCartItem) {
      if (existCartItem.type === cartItem.TYPE_PRODUCT) {
        let found = false
        /**
         * @typedef {object} item
         * @property {string} CartItemId
         * @property {int} quantity
         */
        updateCartItems.find(function (item) {
          if (item.CartItemId === existCartItem.id) {
            checkoutCartItems.push(
              {
                'variant_id': variantMap[existCartItem.product.id],
                'quantity': item.quantity
              }
            )
            found = true
          }
        })
        if (!found) {
          checkoutCartItems.push(
            {
              'variant_id': variantMap[existCartItem.product.id],
              'quantity': existCartItem.quantity
            }
          )
        }
      }
    })

    const updatedData = {
      'checkout': {
        'line_items': checkoutCartItems
      }
    }

    Shopify.put('/admin/checkouts/' + cartId + '.json', updatedData, function (err) {
      let success = true
      if (err) {
        success = false
        _.each(err.error.line_items, function (error) {
          for (let messageKey in error) {
            if (error.hasOwnProperty(messageKey)) {
              _.each(error[messageKey], function (errorItem) {
                const errorMessage = new Message()
                errorMessage.addErrorMessage(errorItem.code, errorItem.message)
                resultMessages.push(errorMessage.toJson())
              })
            }
          }
        })
      }
      if (success) return cb(null, null)
      return cb(null, {messages: resultMessages})
    })
  }

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    updateProducts(cartId)
  })
}
