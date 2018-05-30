/**
 * @param {int} sourceCartId
 * @param {object} context
 */
const clearCart = (sourceCartId, context) => {
  const Shopify = require('../lib/shopify.api.js')(context.config)
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
  const Shopify = require('../lib/shopify.api.js')(context.config)
  return new Promise((resolve, reject) => {
    Shopify.put('/admin/checkouts/' + targetCartId + '.json', updatedData, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(true)
    })
  })
}

module.exports = { clearCart, updateCart }
