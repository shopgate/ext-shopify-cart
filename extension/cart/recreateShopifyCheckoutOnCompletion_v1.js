const fetchCheckout = require('./fetchShopifyCheckout_v1')

/**
 * @param {Object} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const checkout = input.checkout

  if (checkout.completed_at) {
    input.createNew = true
    return fetchCheckout(context, input, cb)
  }

  return cb(null, {checkout: checkout})
}
