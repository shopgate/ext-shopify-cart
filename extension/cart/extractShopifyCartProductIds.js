/**
 * The product and variant IDs will have the "gid://shopify/Product/" and "gid://shopify/ProductVariant/" prefixes
 * stripped off in the result
 *
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 * @returns {Promise<{ productIdSets: { productId: string, variantId: string }[] }>}
 */
module.exports = async (context, input) => {
  return {
    productIdSets: input.shopifyCart.lines.edges.map(line => ({
      productId: (line.node.merchandise.product.id || '').substring(22),
      variantId: (line.node.merchandise.id || '').substring(29)
    }))
  }
}
