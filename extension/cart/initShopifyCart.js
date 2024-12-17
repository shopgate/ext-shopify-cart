const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {Object} context
 * @param {{ storefrontApiCustomerAccessToken: { accessToken: string, expiresAt: string? }?, sgxsMeta: SgxsMeta }} input
 * @returns {Promise<{ shopifyCartId: string }>}
 */
module.exports = async (context, input) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)
  const storage = context.meta.userId ? context.storage.user : context.storage.device
  let shopifyCartId = await storage.get('shopifyCartId')

  // "cartMayBeInvalid" is set when the checkout was initiated and forces getting the cart with the known ID from the
  // Shopify API. This is necessary because it is unknown whether the checkout has been completed (invalidating the
  // existing cart for further use) or aborted, leaving the cart usable.
  if (shopifyCartId && await storage.get('cartMayBeInvalid')) {
    const shopifyCart = await storefrontApi.getCart(shopifyCartId)

    // if the cart is invalid, set ID to null so a new one will be created
    if (shopifyCart === null) {
      await storage.del('shopifyCartId')
      shopifyCartId = null
    }

    // checked it out, setting not needed anymore
    await storage.del('cartMayBeInvalid')
  }

  if (shopifyCartId) return { shopifyCartId }

  // no cart present, create a new one
  if (input.storefrontApiCustomerAccessToken) {
    shopifyCartId = await storefrontApi.createCartForCustomer(input.storefrontApiCustomerAccessToken.accessToken)
  } else {
    shopifyCartId = await storefrontApi.createCart()
  }

  await storage.set('shopifyCartId', shopifyCartId)

  return { shopifyCartId }
}
