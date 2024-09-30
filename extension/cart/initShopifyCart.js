const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {Object} context
 * @param {{ storefrontApiCustomerAccessToken: { accessToken: string, expiresAt: string? }? }} input
 * @returns {Promise<{ shopifyCartId: string }>}
 */
module.exports = async (context, input) => {
  const storage = context.meta.userId ? context.storage.user : context.storage.device
  let shopifyCartId = await storage.get('shopifyCartId')

  if (shopifyCartId) return { shopifyCartId }

  // no cart present, create a new one
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  if (input.storefrontApiCustomerAccessToken) {
    shopifyCartId = await storefrontApi.createCartForCustomer(input.storefrontApiCustomerAccessToken.accessToken)
  } else {
    shopifyCartId = await storefrontApi.createCart()
  }

  await storage.set('shopifyCartId', shopifyCartId)

  return { shopifyCartId }
}
