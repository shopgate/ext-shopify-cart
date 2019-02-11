const ShopifyApiRequest = require('../lib/shopify.api.js')

/**
 * @param {Object} context
 * @param {Object} input - Properties depend on the pipeline this is used for
 * @param {Object} [input.products]
 */
module.exports = async function (context, input) {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const products = input.products
  let productIds = []
  products.forEach(product => {
    productIds.push(product.productId)
  })

  if (productIds.length <= 0) {
    return { shopifyProducts: [] }
  }

  let params = {
    ids: productIds.join(',')
  }

  const data = await shopifyApiRequest.get('/admin/products.json', params)
  return { shopifyProducts: data.products }
}
