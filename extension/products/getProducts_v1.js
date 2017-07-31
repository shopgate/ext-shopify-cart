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
  const products = input.products

  if (!Array.isArray(products)) return cb(new Error('products does not contain any product entries'))

  let query = {
    images: true
  }

  let productIds = []
  _.each(products, function (product) {
    productIds.push(product.productId)
  })

  if (productIds.length > 100) return cb(new Error('the limit of product numbers is 100'))

  Object.assign(query, {
    productNumbers: productIds
  })

  const apiParams = {
    service: 'product',
    version: 'v1',
    method: 'GET',
    path: `${context.meta.appId.split('_')[1]}/products`,
    query
  }

  cb(null, apiParams)
}
