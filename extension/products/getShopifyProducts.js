// todo delete when done, not needed anymore
const ShopifyApiRequest = require('../lib/shopify.api.js')

/**
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
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

  const data = await shopifyApiRequest.get('/admin/api/2023-10/products.json', params)
  return { shopifyProducts: data.products }
}
