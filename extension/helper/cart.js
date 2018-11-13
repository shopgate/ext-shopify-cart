const Message = require('../models/messages/message')

/**
 * @param {int} sourceCartId
 * @param {object} context
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
 * @param {object} context
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
 *
 * @return {{code: string, message: string}[]}
 * @throws {Error} If err does not have an errors or error.line_items property
 */
function handleCartError (err) {
  if (!err || !err.errors || !err.errors.line_items) throw err

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

module.exports = { clearCart, updateCart, extractVariantId, handleCartError }
