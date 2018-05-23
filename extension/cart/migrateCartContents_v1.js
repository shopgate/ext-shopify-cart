const _ = require('underscore')
const UnknownError = require('../models/Errors/UnknownError')

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
  const Shopify = require('../lib/shopify.api.js')(context.config)

  // no merge is needed on identical carts or if no items present in the source cart
  if (_.isEmpty(sourceCartLineItems) || sourceCartId === targetCartId) {
    return cb()
  }

  const checkoutCartItems = []

  // update quantity for existing items, add to the checkoutCartItems, otherwise
  _.each(sourceCartLineItems, function (sourceCartLineItem) {
    const targetCartLineItem = _.findWhere(targetCartLineItems, {variant_id: sourceCartLineItem.variant_id})
    checkoutCartItems.push(mergeCheckoutCartItems(sourceCartLineItem, targetCartLineItem))
  })

  // re-attach the lineItems which were already in the user cart and check for duplicated items
  _.each(targetCartLineItems, function (targetCartLineItem) {
    if (!_.findWhere(checkoutCartItems, {variant_id: targetCartLineItem.variant_id})) {
      checkoutCartItems.push(
        {
          variant_id: targetCartLineItem.variant_id,
          quantity: targetCartLineItem.quantity
        }
      )
    }
  })

  // Clear the old guest cart
  const clearData = {'checkout': {'line_items': []}}
  Shopify.put('/admin/checkouts/' + sourceCartId + '.json', clearData, function (err) {
    if (err) {
      context.log.error(
        'Couldn\'t clear checkout with id ' + sourceCartId + ' failed with error: ' + JSON.stringify(err)
      )
      return cb(new UnknownError())
    }
  })

  const updatedData = {'checkout': {'line_items': checkoutCartItems}}

  updateCart(updatedData, targetCartId)
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
        let currentLineItem = updatedData.checkout.line_items[errorKey]
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
        updateCart(updatedData, targetCartId)
          .then(cb())
          .catch(err => {
            context.log.error(
              'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
            )
            return cb(new Error('Unable to merge carts'))
          })
      })
    })

  function updateCart (updatedData, targetCartId) {
    return new Promise((resolve, reject) => {
      Shopify.put('/admin/checkouts/' + targetCartId + '.json', updatedData, function (err) {
        if (err) {
          return reject(err)
        }
        resolve(true)
      })
    })
  }
}
