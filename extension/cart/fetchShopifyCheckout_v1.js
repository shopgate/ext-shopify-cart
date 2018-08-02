const UnknownError = require('../models/Errors/UnknownError')

const Tools = require('../lib/tools')

/**
 * @param {Object} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context)
  const createNew = Boolean(input.createNew)

  // creates a checkout if forced or none available, loads an existing one otherwise
  fetchCheckout(Shopify, createNew, context, (err, isNew, result) => {
    if (err) {
      return cb(err)
    }

    if (isNew) {
      return saveCheckoutToken(result.checkout.token, context, (err) => {
        if (!Tools.isEmpty(err)) {
          context.log.error('Failed to save Shopify checkout token. Error: ' + JSON.stringify(err))
          return cb(new UnknownError())
        }

        return cb(null, result)
      })
    }

    return cb(null, result)
  })
}

/**
 * Creates a new checkout on request or creates/loads a checkout, based on a checkout token being available, or not
 *
 * @param {Object} Shopify
 * @param {Boolean} createNew
 * @param {Object} context
 * @param {function ({Object}, {Boolean}, {Object}) | function({UnknownError})} cb
 */
function fetchCheckout (Shopify, createNew, context, cb) {
  loadCheckoutToken(context, (err, checkoutToken) => {
    if (err) {
      context.log.error('Fetching the checkout token was unsuccessful. Error: ' + JSON.stringify(err))
      return cb(new UnknownError())
    }

    // load checkout, if available, create otherwise
    if (!createNew && !Tools.isEmpty(checkoutToken)) {
      Shopify.getCheckout(checkoutToken, (shopifyErr, result) => {
        if (!Tools.isEmpty(shopifyErr)) {
          context.log.error('Failed to load shopify checkout. Error: ' + JSON.stringify(shopifyErr))
          return cb(new UnknownError())
        }

        return cb(null, false, result)
      })
    } else {
      Shopify.createCheckout((shopifyErr, result) => {
        if (!Tools.isEmpty(shopifyErr)) {
          context.log.error('Failed to create a new checkout (cart) at Shopify. Error: ' + JSON.stringify(shopifyErr))
          return cb(new UnknownError())
        }

        return cb(null, true, result)
      })
    }
  })
}

/**
 * Loads the current checkout token from internal storage (user or device)
 *
 * @param {Object} context
 * @param {function({Object}, {string})} cb
 */
function loadCheckoutToken (context, cb) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  storage.get('checkoutToken', (err, checkoutToken) => {
    return cb(err, checkoutToken)
  })
}

/**
 * Saves the current checkout token into internal storage (user or device)
 *
 * @param {string} checkoutToken
 * @param {Object} context
 * @param {function({Object})} cb
 */
function saveCheckoutToken (checkoutToken, context, cb) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  storage.set('checkoutToken', checkoutToken, (err) => {
    return cb(err || null)
  })
}
