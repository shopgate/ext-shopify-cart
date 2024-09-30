/**
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 * @returns {Promise<{ productIdSets: { productId: string, variantId: string }[] }>}
 */
module.exports = async (context, input) => {
  return {
    productIdSets: input.shopifyCart.lines.edges.map(line => ({
      productId: line.node.merchandise.product.id,
      variantId: line.node.merchandise.id,
    }))
  }
}
