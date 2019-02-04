const ShopifyApiRequest = require('../lib/shopify.api.js')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const { checkout, isNew } = await fetchCheckout(shopifyApiRequest, Boolean(input.createNew), context)
  if (isNew) {
    try {
      saveCheckoutToken(checkout.checkout.token, context)
    } catch (err) {
      context.log.error('Failed to save Shopify checkout token. Error: ' + JSON.stringify(err))
      return (err)
    }
  }
  return checkout
}

/**
 * Creates a new checkout on request or creates/loads a checkout, based on a checkout token being available, or not
 *
 * @param {Object} shopifyApiRequest
 * @param {Boolean} createNew
 * @param {Object} context
 * @returns {Object}
 */
async function fetchCheckout (shopifyApiRequest, createNew, context) {
  const checkoutToken = await loadCheckoutToken(context)
  let checkout
  try {
    if (!createNew && checkoutToken) {
      checkout = await shopifyApiRequest.getCheckout(checkoutToken)
    } else {
      checkout = await shopifyApiRequest.createCheckout()
    }
    return ({isNew: createNew, checkout})
  } catch (err) {
    context.log.error('Failed to create / load a new checkout (cart) at Shopify. Error: ' + JSON.stringify(err))
    return (err)
  }
}

/**
 * Loads the current checkout token from internal storage (user or device)
 *
 * @param {Object} context
 * @returns {string}
 */
async function loadCheckoutToken (context) {
  console.log('LOAD')
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }
  const token = await storage.get('checkoutToken')
  return token
}

/**
 * Saves the current checkout token into internal storage (user or device)
 *
 * @param {string} checkoutToken
 * @param {Object} context
 * @returns {string}
 */
async function saveCheckoutToken (checkoutToken, context) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  const token = await storage.set('checkoutToken', checkoutToken)
  return token
}
