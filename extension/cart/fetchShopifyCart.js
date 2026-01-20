const ApiFactory = require('../lib/ShopifyApiFactory')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @param {SDKContext} context
 * @param {{
 *   shopifyCartId: string,
 *   storefrontApiCustomerAccessToken: StorefrontApiCustomerAccessToken,
 *   sgxsMeta: SgxsMeta,
 *   customAttributes?: ShopgateUserCustomAttributes
 * }} input
 * @returns {Promise<{ shopifyCart: ShopifyCart }>}
 */
module.exports = async (context, { shopifyCartId, sgxsMeta, storefrontApiCustomerAccessToken, customAttributes }) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta)

  let shopifyCart
  try {
    shopifyCart = await storefrontApi.getCart(shopifyCartId)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching shopify cart')
    throw new UnknownError()
  }

  if (shopifyCart === null) {
    const cartType = context.meta.userId ? 'user' : 'device'
    const storage = context.storage[cartType]
    context.log.warn(`Shopify API returned null when getting the ${cartType} cart, creating a new one`)
    try {
      let newCartId
      if (storefrontApiCustomerAccessToken) {
        // extract the first company location ID if applicable to assign it to the cart, too
        const companyContact = (customAttributes.shopifyCompanyContacts || [])[0] || {}
        const companyLocationId = ((companyContact.locations || [])[0] || {}).id

        newCartId = await storefrontApi.createCartForCustomer(
          storefrontApiCustomerAccessToken.accessToken,
          companyLocationId
        )
      } else {
        newCartId = await storefrontApi.createCart()
      }

      shopifyCart = await storefrontApi.getCart(newCartId)
      await storage.set('shopifyCartId', newCartId)
    } catch (err) {
      await storage.del('shopifyCartId')
      context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating new device cart')
      throw new UnknownError()
    }
  }

  return { shopifyCart }
}
