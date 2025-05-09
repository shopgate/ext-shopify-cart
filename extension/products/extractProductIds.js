/**
 * @param {SDKContext} context
 * @param {{ productIdSets: { productId: string, variantId: string }[] }} input
 */
module.exports = async function (context, { productIdSets }) {
  const productIds = productIdSets.map(productIdSet => productIdSet.productId)
  if (productIds.length > 100) throw new Error('the limit of product numbers is 100')
  return { productIds }
}
