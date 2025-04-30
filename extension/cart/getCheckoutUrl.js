const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{
 *   shopifyCartId: string,
 *   shopifyCart: ShopifyCart,
 *   storefrontApiCustomerAccessToken: StorefrontApiCustomerAccessToken,
 *   sgxsMeta: SgxsMeta,
 *   customAttributes?: ShopgateUserCustomAttributes
 *   }} input
 */
module.exports = async (context, input) => {
  // It seems like on some shops the cart buyer identity gets cleared after a while. If user is logged in but no buyer
  // identity mapped to the cart, update it with their access token so the user will be logged in when entering the
  // checkout.
  if (context.meta.userId && !(input.shopifyCart.buyerIdentity || {}).customer) {
    context.log.debug('User is logged in but cart has no buyer identity, updating cart...')
    const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)

    // extract the first company location ID if applicable to assign it to the cart, too
    const companyContact = (input.customAttributes.shopifyCompanyContacts || [])[0] || {}
    const companyLocationId = ((companyContact.locations || [])[0] || {}).id

    try {
      await storefrontApi.updateCartBuyerIdentity(input.shopifyCartId, input.storefrontApiCustomerAccessToken, companyLocationId)

      // new cart with new checkout URL must be fetched for the changes to reflect in the checkout
      input.shopifyCart = await storefrontApi.getCart(input.shopifyCartId)
    } catch (err) {
      context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating buyer identity in the cart')
    }
  }

  // Once we left for the checkout there's no way of knowing whether the checkout has been completed (invalidating the
  // cart ID) or aborted (keeping the cart ID valid). Setting a flag that will cause the initShopifyCart step to fetch
  // the cart from Shopify Cart API to see if it is still valid.
  const storage = context.meta.userId ? context.storage.user : context.storage.device
  await storage.set('cartMayBeInvalid', true)

  const checkoutUrl = new URL(input.shopifyCart.checkoutUrl)
  checkoutUrl.searchParams.append('logged_in', 'true')

  return { url: checkoutUrl.toString() }
}
