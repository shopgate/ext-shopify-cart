const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{ storefrontApiCustomerAccessToken: string?, shopifyCartId: string }} input
 * @returns {Promise<{ shopifyCart: ShopifyCart }>}
 */
module.exports = async (context, { shopifyCartId }) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  return { shopifyCart: await storefrontApi.getCart(shopifyCartId) }
}
