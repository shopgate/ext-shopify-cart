const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const createNew = Boolean(input.createNew)

  // creates a checkout if forced or none available, loads an existing one otherwise
  return fetchCheckout(Shopify, createNew, context).then(result => {
    const {isNew, checkout} = result
    if (isNew) {
      return saveCheckoutToken(checkout.checkout.token, context).then(() => {
        return checkout
      }).catch((err) => {
        context.log.error('Failed to save Shopify checkout token. Error: ' + JSON.stringify(err))
        return (err)
      })
    } else {
      return checkout
    }
  }).catch(err => {
    return err
  })
}

/**
 * Creates a new checkout on request or creates/loads a checkout, based on a checkout token being available, or not
 *
 * @param {Object} Shopify
 * @param {Boolean} createNew
 * @param {Object} context
 * @returns {Promise}
 */
async function fetchCheckout (Shopify, createNew, context) {
  return new Promise((resolve, reject) => {
    loadCheckoutToken(context).then((checkoutToken) => {
      if (!createNew && checkoutToken) {
        Shopify.getCheckout(checkoutToken, (shopifyErr, result) => {
          if (shopifyErr) {
            context.log.error('Failed to load shopify checkout. Error: ' + JSON.stringify(shopifyErr))
            reject(new UnknownError())
          }
          resolve({isNew: false, checkout: result})
        })
      } else {
        Shopify.createCheckout((shopifyErr, result) => {
          if (shopifyErr) {
            context.log.error('Failed to create a new checkout (cart) at Shopify. Error: ' + JSON.stringify(shopifyErr))
            reject(new UnknownError())
          }
          resolve({isNew: true, checkout: result})
        })
      }
    }).catch((err) => {
      context.log.error('Fetching the checkout token was unsuccessful. Error: ' + JSON.stringify(err))
      reject(err)
    })
  })
}

/**
 * Loads the current checkout token from internal storage (user or device)
 *
 * @param {Object} context
 * @returns {Promise}
 */
function loadCheckoutToken (context) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  return new Promise((resolve, reject) => {
    storage.get('checkoutToken', (err, checkoutToken) => {
      if (err) {
        reject(err)
      }
      resolve(checkoutToken)
    })
  })
}

/**
 * Saves the current checkout token into internal storage (user or device)
 *
 * @param {string} checkoutToken
 * @param {Object} context
 * @returns {Promise}
 */
function saveCheckoutToken (checkoutToken, context) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  return new Promise((resolve, reject) => {
    storage.set('checkoutToken', checkoutToken, (err) => {
      if (err) {
        reject(err)
      }
      resolve(checkoutToken)
    })
  })
}
