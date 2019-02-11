/**
 * @param {Object} context
 * @param {Object} input - Properties depend on the pipeline this is used for
 *
 * @param {Object} [input.products]
 */
module.exports = async function (context, input) {
  const products = input.products

  if (!Array.isArray(products)) throw new Error('products does not contain any product entries')

  let query = {
    images: true
  }

  let productIds = []
  products.forEach(product => {
    productIds.push(product.productId)
  })

  if (productIds.length > 100) throw new Error('the limit of product numbers is 100')

  Object.assign(query, {
    productNumbers: productIds
  })

  return {
    service: 'product',
    version: 'v1',
    method: 'GET',
    path: `${context.meta.appId.split('_')[1]}/products`,
    query
  }
}
