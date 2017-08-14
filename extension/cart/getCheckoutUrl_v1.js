const Url = require('../models/url')
const Tools = require('../lib/tools')

/**
 *
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)

    Shopify.get('/admin/checkouts/' + cartId + '.json', {}, function (err, data) {
      if (err) cb(err)

      const url = new Url(data.checkout.web_url)
      cb(null, url.toJson())
    })
  })
}
