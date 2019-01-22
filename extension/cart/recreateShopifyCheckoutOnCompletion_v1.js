const fetchCheckout = require('./fetchShopifyCheckout_v1')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  const checkout = input.checkout

  if (checkout.completed_at) {
    input.createNew = true
    return fetchCheckout(context, input).then(result => {
      return (result.checkout)
    })
  } else {
    return checkout
  }
}
