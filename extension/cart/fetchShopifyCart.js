const ApiFactory = require('../lib/ShopifyApiFactory')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {SDKContext} context
 * @param {{ shopifyCartId: string, sgxsMeta: SgxsMeta }} input
 * @returns {Promise<{ shopifyCart: ShopifyCart }>}
 */
module.exports = async (context, { shopifyCartId, sgxsMeta }) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta)

  let shopifyCart
  try {
    shopifyCart = await storefrontApi.getCart(shopifyCartId)
  } catch (err) {
    this.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching shopify cart')
    throw new UnknownError()
  }

  if (shopifyCart === null) {
    const cartType = context.meta.userId ? 'user' : 'device'
    const storage = context.storage[cartType]
    context.log.warn(`Shopify API returned null when getting the ${cartType} cart, creating a new one`)
    try {
      const newCartId = await storefrontApi.createCart()
      shopifyCart = await storefrontApi.getCart(newCartId)
      await storage.set('shopifyCartId', newCartId)
    } catch (err) {
      await storage.del('shopifyCartId')
      this.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating new device cart')
      throw new UnknownError()
    }
  }

  return { shopifyCart }
}
