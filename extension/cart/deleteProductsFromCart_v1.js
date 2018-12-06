const Tools = require('../lib/tools')
const Message = require('../models/messages/message')
const CartItem = require('../models/cart/cartItems/cartItem')
const _ = require('underscore')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const existCartItems = input.cartItems
  const itemsIdsToDelete = input.cartItemIds
  const importedProductsInCart = input.importedProductsInCart
  const cartItem = new CartItem()

  let checkoutCartItems = []
  let deletedCartItems = 0
  let resultMessages = []

  /**
   * @param {string} cartId
   */
  let removeProducts = function (cartId) {
    _.each(existCartItems, function (existCartItem) {
      if (existCartItem.type === cartItem.TYPE_PRODUCT) {
        let remove = false
        itemsIdsToDelete.find(function (value) {
          if (value === existCartItem.id) {
            remove = true
            deletedCartItems++
          }
        })

        if (!remove) {
          // map item_number to variant_id for the items to keep
          let variantId = existCartItem.product.id
          _.each(importedProductsInCart, function (importedProductInCart) {
            if (importedProductInCart.id === existCartItem.product.id && Object.keys(importedProductInCart.customData).length >= 0) {
              // if the product has a variant id then use it, because it is a a normal product in Shopify context then
              const customData = JSON.parse(importedProductInCart.customData)
              if (customData.variant_id !== undefined) {
                variantId = customData.variant_id
              }
            }
          })

          checkoutCartItems.push(
            {
              'variant_id': variantId,
              'quantity': existCartItem.quantity
            }
          )
        }
      }
    })

    if (deletedCartItems === 0) {
      let message = new Message()
      message.type = message.TYPE_ERROR
      message.message = 'No cartItem(s) found'
      message.code = '404'
      resultMessages.push(message.toJson())
      return cb(null, {messages: resultMessages})
    } else {
      const updatedData = {
        'checkout': {
          'line_items': checkoutCartItems
        }
      }
      Shopify.put('/admin/checkouts/' + cartId + '.json', updatedData, function (err) {
        if (err && err.hasOwnProperty('errors') && err.errors.hasOwnProperty('line_items')) {
          _.each(err.errors.line_items, function (error) {
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

          return cb(null, { messages: resultMessages })
        }

        return cb(err)
      })
    }
  }

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    removeProducts(cartId)
  })
}
