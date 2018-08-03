const _ = require('underscore')

/**
 * @param {object} context
 * @param {object} input - Properties depend on the pipeline this is used for
 *
 * @param {Object} [input.products]
 *
 * @param {Function} cb
 */
module.exports = function (context, input, cb) {
  const ShopifyApi = require('../lib/shopify.api.js')(context.config, context.log)
  const products = input.products

  let productIds = []
  _.each(products, function (product) {
    productIds.push(product.productId)
  })

  // avoid calling Shopify if there are no products, because it would return all products instead
  if (productIds.length <= 0) {
    return cb(null, {shopifyProducts: []})
  }

  let params = {
    ids: productIds.join(',')
  }

  ShopifyApi.get('/admin/products.json', params, (err, data) => {
    return cb(err, {shopifyProducts: data.products})
  })
}
