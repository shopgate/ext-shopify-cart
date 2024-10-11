const ApiFactory = require('../lib/ShopifyApiFactory')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {SDKContext} context
 * @param {{ shopifyCartId: string }} input
 * @returns {Promise<{ shopifyCart: ShopifyCart }>}
 */
module.exports = async (context, { shopifyCartId }) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  const shopifyCart = await storefrontApi.getCart(shopifyCartId)

  if (shopifyCart === null) {
    context.log.error('Shopify API returned null instead of a cart.')
    throw new UnknownError()
  }

  return { shopifyCart }
}
