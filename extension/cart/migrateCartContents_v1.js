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
  migrateCartContents(context, input, cb)
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

function migrateCartContents (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  const sourceCartId = input.sourceCart.checkout.token
  const sourceCartLineItems = input.sourceCart.checkout.line_items
  const targetCartId = input.targetCart.checkout.token
  const targetCartLineItems = input.targetCart.checkout.line_items

  // If the ids are identical, no merge is needed
  if (sourceCartId === targetCartId) {
    return cb()
  }

  // If there are no lineItems within the source cart, make a callback
  if (_.isEmpty(sourceCartLineItems)) {
    return cb()
  }

  const checkoutCartItems = []

  // Update quantity for lineItems wich are in both carts, if not existent in the targetCart add sourceCartLineItem to the checkoutCartItems
  _.each(sourceCartLineItems, function (sourceCartLineItem) {
    const targetCartLineItem = _.findWhere(targetCartLineItems, {variant_id: sourceCartLineItem.variant_id})
    checkoutCartItems.push(mergeCheckoutCartItems(sourceCartLineItem, targetCartLineItem))
  })

  // Reattach the lineItems which were already in the user cart and check for duplicated items
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

  const updatedData = {
    checkout: {
      line_items: checkoutCartItems
    }
  }

  // Send the checkoutCartItems to the Shopify-API
  Shopify.put('/admin/checkouts/' + targetCartId + '.json', updatedData, function (err) {
    if (err) {
      context.log.error('Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err))
      return cb(new UnknownError())
    }

    cb()
  })
}
