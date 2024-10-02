/**
 *
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 */
module.exports = async (context, input) => {
  return { url: input.shopifyCart.checkoutUrl }
}
