const Url = require('../models/url')
const Tools = require('../lib/tools')

const UnknownError = require('../models/Errors/UnknownError')

/**
 *
 * @param {object} context
 * @param {object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) {
      context.log.error('Retrieving the current cart id failed with error: ' + err.toString())
      return cb(new UnknownError())
    }

    const shopifyResourceUri = '/admin/checkouts/' + cartId + '.json'
    Shopify.get(shopifyResourceUri, {}, function (err, data) {
      if (err) {
        context.log.error(
          'Call to Shopify resource uri "' + shopifyResourceUri + '" failed with error: ' +
          '[' + err.code.toString() + '] ' + err.error.toString()
        )
        return cb(new UnknownError())
      }

      // limit expiry time to two hours from "now", because we don't have any info about the real expiry time
      let date = new Date()
      date.setTime(date.getTime() + 1000 * 60 * 60 * 2)

      const expires = date.toISOString()
      const url = new Url(data.checkout.web_url, expires)

      cb(null, url)
    })
  })
}
