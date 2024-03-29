const _ = require('underscore')
const UnknownError = require('../models/Errors/UnknownError')
let { updateCart, clearCart } = require('./../helper/cart')

/**
 *
 * @typedef {Object} input
 * @property {Object} sourceCart
 * @property {Object} targetCart
 *
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  await migrateCartContents(
    context,
    input.sourceCart.token,
    input.sourceCart.line_items,
    input.targetCart.token,
    input.targetCart.line_items
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

async function migrateCartContents (context, sourceCartId, sourceCartLineItems, targetCartId, targetCartLineItems) {
  // no merge is needed on identical carts or if no items present in the source cart
  if (_.isEmpty(sourceCartLineItems) || sourceCartId === targetCartId) {
    return true
  }

  const checkoutCartItems = []

  // update quantity for existing items, add to the checkoutCartItems, otherwise
  sourceCartLineItems.forEach(sourceCartLineItem => {
    const targetCartLineItem = _.findWhere(targetCartLineItems, { variant_id: sourceCartLineItem.variant_id })
    checkoutCartItems.push(mergeCheckoutCartItems(sourceCartLineItem, targetCartLineItem))
  })

  // re-attach the lineItems which were already in the user cart and check for duplicated items
  targetCartLineItems.forEach(targetCartLineItem => {
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
  try {
    await clearCart(sourceCartId, context)
    await updateAndAdjustCart(updatedData, targetCartId, context)
  } catch (err) {
    context.log.error(
      'Couldn\'t clear checkout with id ' + sourceCartId + ' failed with error: ' + JSON.stringify(err)
    )
    throw new UnknownError()
  }
}

/**
 * @param {Object} updatedData
 * @param {string|number} targetCartId
 * @param {Object} context
 */
async function updateAndAdjustCart (updatedData, targetCartId, context) {
  try {
    await (updateCart(updatedData, targetCartId, context))
    return true
  } catch (err) {
    if (err && Object.hasOwnProperty.call(err, 'code') && err.code !== 422) {
      context.log.error(
        'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
      )
      throw new UnknownError()
    }

    if (err & Object.hasOwnProperty.call(err, 'errors') && Object.hasOwnProperty.call(err.errors, 'line_items')) {
      const errorLineItem = err.errors.line_items
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
        try {
          updateCart(updatedData, targetCartId, context)

          return true
        } catch (err) {
          context.log.error(
            'Couldn\'t update checkout with id ' + targetCartId + ' failed with error: ' + JSON.stringify(err)
          )
          throw new UnknownError()
        }
      })
    }
  }
}
