const Message = require('../models/messages/message')

/**
 * @param {int} sourceCartId
 * @param {SDKContext} context
 */
const clearCart = (sourceCartId, context) => {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const clearData = { 'checkout': { 'line_items': [] } }
  return new Promise((resolve, reject) => {
    Shopify.put('/admin/checkouts/' + sourceCartId + '.json', clearData, function (err) {
      if (err) {
        return reject(err)
      }
      return resolve(true)
    })
  })
}

/**
 * @param {object} updatedData
 * @param {int} targetCartId
 * @param {SDKContext} context
 */
const updateCart = (updatedData, targetCartId, context) => {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
  return new Promise((resolve, reject) => {
    Shopify.put('/admin/checkouts/' + targetCartId + '.json', updatedData, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(true)
    })
  })
}

/**
 * @param {Object} product
 * @param {string} [product.customData]
 * @returns {string|null}
 * @throws {SyntaxError} If product.customData does not contain valid JSON.
 */
function extractVariantId (product) {
  if (!product || !product.customData) return null

  const customData = JSON.parse(product.customData)

  return (customData && customData.variant_id) ? customData.variant_id : null
}

/**
 * @param {Error} err
 * @param {Object} err.errors
 * @param {Object} err.errors.line_items
 * @param {{code: string, message: string}[]} err.errors.line_items.[errorType]
 * @param {Array} checkoutCartItems
 * @param {int} cartId
 * @param {SDKContext} context
 *
 * @return {{code: string, message: string, type: string}[]}
 * @throws {Error} If err does not have an errors or error.line_items property
 */
async function handleCartError (err, checkoutCartItems, cartId, context) {
  if (!err || !err.errors || !err.errors.line_items) throw err

  const itemsToDelete = getOutOfStockLineItemIds(err.errors.line_items).sort((a, b) => b - a)

  if (itemsToDelete.length > 0) {
    await fixCheckoutQuantities(checkoutCartItems, itemsToDelete, err, cartId, context)
  }

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

  return errorMessages
}

/**
 *
 * @param {Object} lineItems
 * @returns {Array}
 */
function getOutOfStockLineItemIds (lineItems) {
  const itemsToDelete = []

  for (let itemId in lineItems) {
    Object.entries(lineItems[itemId]).forEach(([errorType, errors]) => {
      if (errors.find(error => error.code === 'not_enough_in_stock' &&
          error.options &&
          error.options.remaining === 0
      )) {
        itemsToDelete.push(parseInt(itemId))
      }
    })
  }

  return itemsToDelete
}

/**
 * @param {Array} checkoutCartItems
 * @param {Array} itemsToDelete
 * @param {Error} error
 * @param {Object} error.errors
 * @param {Object} error.errors.line_items
 * @param {int} cartId
 * @param {SDKContext} context
 */
function fixCheckoutQuantities (checkoutCartItems, itemsToDelete, error, cartId, context) {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)

  for (let itemId of itemsToDelete) {
    checkoutCartItems.splice(itemId, 1)
    delete error.errors.line_items[itemId]
  }

  const productData = {
    'checkout': {
      'line_items': checkoutCartItems
    }
  }

  return new Promise((resolve) => {
    Shopify.put('/admin/checkouts/' + cartId + '.json', productData, function (err) {
      if (err) {
        context.log.error(`Could not fix quantities for checkout ${cartId}`)
      }

      resolve()
    })
  })
}

module.exports = { clearCart, updateCart, extractVariantId, handleCartError, getOutOfStockLineItemIds }
