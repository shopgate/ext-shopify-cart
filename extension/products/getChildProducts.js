/**
 * @param {SDKContext} context
 * @param {{ productIdSets: { productId: string, variantId: string }[] }} input
 */
module.exports = async function (context, { productIdSets }) {
  const shopNumber = context.meta.appId.split('_')[1]
  const query = {
    images: true,
    productNumbers: productIdSets.map(productIdSet => productIdSet.variantId)
  }

  if (query.productNumbers.length > 100) throw new Error('the limit of product numbers is 100')

  return {
    service: 'product',
    version: 'v1',
    method: 'GET',
    path: `${shopNumber}/products`,
    query
  }
}
