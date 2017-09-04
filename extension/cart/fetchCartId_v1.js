const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  fetchCartId(context, (err, cartId) => {
    if (err) {
      context.log.error('Fetching the cart id was unsuccessful. Error: ' + JSON.stringify(err))
      return cb(new UnknownError())
    }

    return cb(null, {cartId: cartId})
  })
}

/**
 * Fetches the current cart id based on availability of a user storage
 *
 * @param context
 * @param cb
 */
function fetchCartId (context, cb) {
  if (context.meta.userId) {
    // get cart of the logged in user
    context.storage.user.get('cartId', (sErr, cartId) => {
      return cb(sErr, cartId)
    })
  } else {
    // get cart id of the guest user
    context.storage.device.get('cartId', (sErr, cartId) => {
      return cb(sErr, cartId)
    })
  }
}
