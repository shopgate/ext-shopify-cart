const ShopifyApiRequest = require('../lib/shopify.api.js')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  let result
  try {
    result = await fetchCheckout(shopifyApiRequest, Boolean(input.createNew), context)
  } catch (err) {
    context.log.error('Failed to create / load a new checkout (cart) at Shopify. Error: ' + JSON.stringify(err))

    throw new UnknownError()
  }

  if (result.isNew) {
    try {
      await saveCheckoutToken(result.checkout.checkout.token, context)
    } catch (err) {
      context.log.error('Failed to save Shopify checkout token. Error: ' + JSON.stringify(err))

      throw new UnknownError()
    }
  }

  return result.checkout
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
  let checkoutToken = await loadCheckoutToken(context)
  let checkout
  let isNew

  if (!createNew && checkoutToken) {
    try {
      checkout = await shopifyApiRequest.getCheckout(checkoutToken)
      isNew = false
    } catch (err) {
      if (err.errors !== 'Not Found') throw err

      // create new checkout if old checkout is expired
      context.log.warn({ checkoutToken }, 'Checkout is expired or was not found --> generating new one')
      checkout = await shopifyApiRequest.createCheckout()
      isNew = true
    }
  } else {
    checkout = await shopifyApiRequest.createCheckout()
    isNew = true
  }

  return { isNew, checkout }
}

/**
 * Loads the current checkout token from internal storage (user or device)
 *
 * @param {Object} context
 * @returns {string}
 */
async function loadCheckoutToken (context) {
  // select storage to use: device or user, if logged in
  const storage = context.meta.userId ? context.storage.user : context.storage.device

  return storage.get('checkoutToken')
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
  const storage = context.meta.userId ? context.storage.user : context.storage.device

  return storage.set('checkoutToken', checkoutToken)
}
