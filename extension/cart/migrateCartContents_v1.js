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

  // update destination cart at Shopify
  const updatedData = {'checkout': {'line_items': checkoutCartItems}}
  Shopify.put('/admin/checkouts/' + targetCartId + '.json', updatedData, function (err) {
    if (err) {
      context.log.error(
        'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
      )
      return cb(new UnknownError())
    }

    cb()
  })
}
