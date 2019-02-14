const fetchCheckout = require('./fetchShopifyCheckout')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  let checkout = input.checkout

  if (checkout.completed_at) {
    input.createNew = true
    const newCheckout = await fetchCheckout(context, input)
    checkout =  newCheckout.checkout
  }

  return { checkout }
}
