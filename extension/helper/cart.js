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

module.exports = { clearCart, updateCart, extractVariantId }
