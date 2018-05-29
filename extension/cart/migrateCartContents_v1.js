const _ = require('underscore')
const UnknownError = require('../models/Errors/UnknownError')
const { updateCart, clearCart } = require('./../helper/cart')

/**
 *
 * @typedef {object} input
 * @property {object} sourceCart
 * @property {object} targetCart
 *
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  migrateCartContents(
    context,
    input.sourceCart.token,
    input.sourceCart.line_items,
    input.targetCart.token,
    input.targetCart.line_items,
    cb
  )
}

function mergeCheckoutCartItems (sourceCartLineItem, targetCartLineItem) {
  if (targetCartLineItem) {
    return {
      variant_id: sourceCartLineItem.variant_id,
      quantity: targetCartLineItem.quantity + sourceCartLineItem.quantity
    }
  }

  return {
    variant_id: sourceCartLineItem.variant_id,
    quantity: sourceCartLineItem.quantity
  }
}

function migrateCartContents (context, sourceCartId, sourceCartLineItems, targetCartId, targetCartLineItems, cb) {
  // no merge is needed on identical carts or if no items present in the source cart
  if (_.isEmpty(sourceCartLineItems) || sourceCartId === targetCartId) {
    return cb()
  }

  const checkoutCartItems = []

  // update quantity for existing items, add to the checkoutCartItems, otherwise
  _.each(sourceCartLineItems, function (sourceCartLineItem) {
    const targetCartLineItem = _.findWhere(targetCartLineItems, { variant_id: sourceCartLineItem.variant_id })
    checkoutCartItems.push(mergeCheckoutCartItems(sourceCartLineItem, targetCartLineItem))
  })

  // re-attach the lineItems which were already in the user cart and check for duplicated items
  _.each(targetCartLineItems, function (targetCartLineItem) {
    if (!_.findWhere(checkoutCartItems, { variant_id: targetCartLineItem.variant_id })) {
      checkoutCartItems.push(
        {
          variant_id: targetCartLineItem.variant_id,
          quantity: targetCartLineItem.quantity
        }
      )
    }
  })

  const updatedData = { 'checkout': { 'line_items': checkoutCartItems } }
  // Clear the old guest cart
  clearCart(sourceCartId, context)
    .then(
      updateAndAdjustCart(updatedData, targetCartId, context, cb)
    )
    .catch(err => {
      context.log.error(
        'Couldn\'t clear checkout with id ' + sourceCartId + ' failed with error: ' + JSON.stringify(err)
      )
      return cb(new UnknownError())
    })
}

/**
 * @param {object} updatedData
 * @param {string} targetCartId
 * @param {object} context
 * @param {function} cb
 */
function updateAndAdjustCart (updatedData, targetCartId, context, cb) {
  updateCart(updatedData, targetCartId, context)
    .then(cb())
    .catch(err => {
      if (err.code !== 422) {
        context.log.error(
          'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
        )
        return cb(new Error('Unable to merge carts'))
      }
      const errorLineItem = err.error.line_items
      Object.keys(errorLineItem).map((errorKey) => {
        const errorContent = errorLineItem[errorKey]
        const currentLineItem = updatedData.checkout.line_items[errorKey]
        if (currentLineItem) {
          const quantity = errorContent.quantity
          if (quantity.length) {
            quantity.map((item) => {
              if (item.code === 'not_enough_in_stock') {
                currentLineItem.quantity = item.options.remaining
              }
            })
          }
        }
        updateCart(updatedData, targetCartId, context)
          .then(cb())
          .catch(err => {
            context.log.error(
              'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
            )
            return cb(new Error('Unable to merge carts'))
          })
      })
    })
}
