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
  const Shopify = require('../lib/shopify.api.js')(context.config, context.log)

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    if (!cartId) {
      Shopify.post('/admin/checkouts.json', {}, function (err, data) {
        cb(null, {
          shopifyCartData: data,
          shopifyCartErr: err
        })
      })
    } else {
      Shopify.get('/admin/checkouts/' + cartId + '.json', {}, function (err, data) {
        cb(null, {
          shopifyCartData: data,
          shopifyCartErr: err
        })
      })
    }
  })
}
