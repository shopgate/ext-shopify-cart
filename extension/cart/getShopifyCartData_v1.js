const Tools = require('../lib/tools')

/**
 * @typedef {object} data.checkout
 * @property {string | null} completed_at
 */

/**
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    if (!cartId) {
      Shopify.post('/admin/checkouts.json', {}, function (err, data) {
        cb(null, {
          shopifyCartData: data,
          shopifyCartErr: err,
          alreadyOrdered: 'notok'
        })
      })
    } else {
      Shopify.get('/admin/checkouts/' + cartId + '.json', {}, function (err, data) {
        /*
         * If the checkout is already ordered, we need to return a flag in order to call a conditional-step for
         * creating a new checkout for the user
         */
        if (data.checkout.completed_at !== null) {
          return cb(null, {alreadyOrdered: 'ok'})
        }

        cb(null, {
          shopifyCartData: data,
          shopifyCartErr: err,
          alreadyOrdered: 'notok'
        })
      })
    }
  })
}
