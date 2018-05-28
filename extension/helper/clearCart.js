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

module.exports = clearCart
