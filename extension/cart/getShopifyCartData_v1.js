const Tools = require('../lib/tools')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)

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
