const ApiFactory = require('../lib/ShopifyApiFactory')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {SDKContext} context
 * @param {{ shopifyCartId: string }} input
 * @returns {Promise<{ shopifyCart: ShopifyCart }>}
 */
module.exports = async (context, { shopifyCartId }) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  let shopifyCart
  try {
    shopifyCart = await storefrontApi.getCart(shopifyCartId)
  } catch (err) {
    this.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching shopify cart')
    throw new UnknownError()
  }

  if (shopifyCart === null) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device
    const cartType = context.meta.userId ? 'user' : 'device'
    context.log.warn(`Shopify API returned null when getting the ${cartType} cart, creating a new one`)
    try {
      const newDeviceCartId = await storefrontApi.createCart()
      shopifyCart = await storefrontApi.getCart(newDeviceCartId)
      await storage.device.set('shopifyCartId', newDeviceCartId)
    } catch (err) {
      await storage.device.del('shopifyCartId')
      this.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating new device cart')
      throw new UnknownError()
    }
  }

  return { shopifyCart }
}
