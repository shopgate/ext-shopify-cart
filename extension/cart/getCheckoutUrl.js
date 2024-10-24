/**
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 */
module.exports = async (context, input) => {
  // Once we left for the checkout there's no way of knowing whether the checkout has been completed (invalidating the
  // cart ID) or aborted (keeping the cart ID valid). Setting a flag that will cause the initShopifyCart step to fetch
  // the cart from Shopify Cart API to see if it is still valid.
  const storage = context.meta.userId ? context.storage.user : context.storage.device
  await storage.set('cartMayBeInvalid', true)

  return { url: `${input.shopifyCart.checkoutUrl}&logged_in=true` }
}
