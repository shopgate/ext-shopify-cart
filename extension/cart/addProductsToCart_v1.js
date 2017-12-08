const _ = require('underscore')
const Message = require('../models/messages/message')
const Tools = require('../lib/tools')

/**
 * @typedef {object} input
 * @property {Array} products
 * @property {Array} importedProductsAddedToCart
 * @property {Array} importedProductsInCart
 * @property {Array} products
 * @property {Array} cartItems
 *
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  let checkoutCartItems = []
  const importedProductsAddedToCart = input.importedProductsAddedToCart
  const importedProductsInCart = input.importedProductsInCart
  const newCartItems = input.products
  const existingCartItems = input.cartItems
  const resultMessages = []

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    addProducts(cartId)
  })

  /**
   *
   * @param {string} cartId
   */
  function addProducts (cartId) {
    let items = {}
    _.each(existingCartItems, function (existingCartItem) {
      if (Tools.propertyExists(existingCartItem, 'product.id')) {
        items[existingCartItem.product.id] = existingCartItem.quantity
      }
    })
    _.each(newCartItems, function (newCartItem) {
      if (newCartItem.productId in items) {
        items[newCartItem.productId] += newCartItem.quantity
      } else {
        items[newCartItem.productId] = newCartItem.quantity
      }
    })
    _.each(items, function (quantity, id) {
      // find variant id by checking "internal order info" (customData)
      let variantId = id
      let isMapped = false
      // check if the current product was just added to the cart
      _.each(importedProductsAddedToCart, function (importedProductAddedToCart) {
        if (importedProductAddedToCart.id === id && Object.keys(importedProductAddedToCart.customData).length >= 0) {
          // if the product has a variant id then use it, because it is a a normal product in Shopify context then
          const customData = JSON.parse(importedProductAddedToCart.customData)
          if (customData.variant_id !== undefined) {
            variantId = customData.variant_id
            isMapped = true
          }
        }
      })
      // check if the current product was in the cart before (don't map the ones that were mapped already)
      if (!isMapped) {
        _.each(importedProductsInCart, function (importedProductInCart) {
          if (importedProductInCart.id === id && Object.keys(importedProductInCart.customData).length >= 0) {
            // if the product has a variant id then use it, because it is a a normal product in Shopify context then
            const customData = JSON.parse(importedProductInCart.customData)
            if (customData.variant_id !== undefined) {
              variantId = customData.variant_id
              isMapped = true
            }
          }
        })
      }
      checkoutCartItems.push(
        {
          'variant_id': variantId,
          'quantity': quantity
        }
      )
    })

    const data = {
      'checkout': {
        'line_items': checkoutCartItems
      }
    }

    const _data = data
    const _shopifyUrl = '/admin/checkouts/' + cartId + '.json'

    Shopify.put('/admin/checkouts/' + cartId + '.json', data, function (err) {
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
}
