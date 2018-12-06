const Message = require('../models/messages/message')
const CartItem = require('../models/cart/cartItems/cartItem')
const Tools = require('../lib/tools')
const _ = require('underscore')

/**
 * @typedef {Object} input
 * @property {Object[]} existingCartItems
 * @property {Object[]} updateCartItems
 * @property {Object[]} importedProductsInCart
 */

/**
 * @param {{config: Object, log: function}} context Shopgate Connect context
 * @param {input} input Pipeline step input data
 * @param {function} cb Return callback
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const resultMessages = []
  const { importedProductsInCart, updateCartItems, existingCartItems: existCartItems } = input
  const cartItem = new CartItem()

  const checkoutCartItems = []

  /**
   * @param {string} cartId Id of the cart to update products in
   */
  const updateProducts = function (cartId) {
    // create a map to map all Shopgate item_numbers in the cart to Shopify variant_ids
    const variantMap = []
    _.each(existCartItems, (existCartItem) => {
      if (existCartItem.type === cartItem.TYPE_PRODUCT) {
        variantMap[existCartItem.product.id] = existCartItem.product.id
        _.each(importedProductsInCart, (importedProductInCart) => {
          if (importedProductInCart.id === existCartItem.product.id &&
            Object.keys(importedProductInCart.customData).length >= 0) {
            // if the product has a variant id then use it, because it is a a normal product in
            // Shopify context then
            const customData = JSON.parse(importedProductInCart.customData)
            if (customData.variant_id !== undefined) {
              variantMap[existCartItem.product.id] = customData.variant_id
            }
          }
        })
      }
    })

    // identify all products that have changed in quantity and the one that have not
    _.each(existCartItems, (existCartItem) => {
      if (existCartItem.type === cartItem.TYPE_PRODUCT) {
        let found = false
        /**
         * @typedef {object} item
         * @property {string} cartItemId
         * @property {int} quantity
         */
        updateCartItems.find(function (item) {
          if (item.cartItemId === existCartItem.id) {
            checkoutCartItems.push({
              variant_id: variantMap[existCartItem.product.id],
              quantity: item.quantity
            })
            found = true
          }
        })
        if (!found) {
          checkoutCartItems.push({
            variant_id: variantMap[existCartItem.product.id],
            quantity: existCartItem.quantity
          })
        }
      }
    })

    const updatedData = {
      checkout: {
        line_items: checkoutCartItems
      }
    }

    Shopify.put(`/admin/checkouts/${cartId}.json`, updatedData, (err) => {
      if (err && err.hasOwnProperty('errors') && err.errors.hasOwnProperty('line_items')) {
        _.each(err.errors.line_items, (error) => {
          for (const messageKey in error) {
            if (error.hasOwnProperty(messageKey)) {
              _.each(error[messageKey], (errorItem) => {
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

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    updateProducts(cartId)
  })
}
