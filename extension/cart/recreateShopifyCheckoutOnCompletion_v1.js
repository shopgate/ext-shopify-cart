const fetchCheckout = require('./fetchShopifyCheckout_v1')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  const checkout = input.checkout

  if (checkout.completed_at) {
    input.createNew = true
    const newCheckout = await fetchCheckout(context, input)
    return newCheckout.checkout
  } else {
    return checkout
  }
}
