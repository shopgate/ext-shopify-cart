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

module.exports = updateCart
