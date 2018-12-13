const UnknownError = require('../models/Errors/UnknownError')

const Tools = require('../lib/tools')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)

  return await fetchCheckout(Shopify, Boolean(input.createNew), context)
}

/**
 * Creates a new checkout on request or creates/loads a checkout, based on a checkout token being available, or not
 *
 * @param {Object} Shopify
 * @param {boolean} createNew
 * @param {SDKContext} context
 */
async function fetchCheckout (Shopify, createNew, context) {
  const checkoutToken = await loadCheckoutToken(context)

  // load checkout, if available, create otherwise
  if (!createNew && !Tools.isEmpty(checkoutToken)) {
    try {
      return await new Promise((resolve, reject) => {
        Shopify.getCheckout(checkoutToken, (shopifyErr, result) => {
          if (!Tools.isEmpty(shopifyErr)) return reject(shopifyErr)

          resolve(result)
        })
      })
    } catch (err) {
      // just log it as a new checkout needs to be created
      context.log.error(`Failed to load shopify checkout ${checkoutToken}. Error: ${JSON.stringify(err)}`)
    }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      Shopify.createCheckout((shopifyErr, result) => {
        if (!Tools.isEmpty(shopifyErr)) return reject(shopifyErr)

        resolve(result)
      })
    })

    await saveCheckoutToken(result.checkout.token, context)

    return result
  } catch (err) {
    context.log.error(`Failed to create a new checkout (cart) at Shopify. Error: ${JSON.stringify(err)}`)
    throw new UnknownError()
  }
}

/**
 * Loads the current checkout token from internal storage (user or device)
 *
 * @param {SDKContext} context
 * @return {string}
 */
async function loadCheckoutToken (context) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  return storage.get('checkoutToken')
}

/**
 * Saves the current checkout token into internal storage (user or device)
 *
 * @param {string} checkoutToken
 * @param {SDKContext} context
 */
async function saveCheckoutToken (checkoutToken, context) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  return storage.set('checkoutToken', checkoutToken)
}
