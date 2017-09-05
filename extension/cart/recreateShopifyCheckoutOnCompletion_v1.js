const fetchCheckout = require('./fetchShopifyCheckout_v1')

const Tools = require('../lib/tools')

/**
 * @param {Object} context
 * @param {Object} input
 * @param {callback} cb
 */
module.exports = function (context, input, cb) {
  const checkout = input.checkout

  if (!Tools.isEmpty(checkout.completed_at)) {
    input.createNew = true
    return fetchCheckout(context, input, cb)
  }
}
