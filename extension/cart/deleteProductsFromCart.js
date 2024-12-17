const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {object} input
 * @param {SgxsMeta} input.sgxsMeta
 * @param {string[]} input.deleteCartItemIds
 * @param {string} input.shopifyCartId
 * @returns {Promise<{}|{ messages: { code: string, message: string, type: string }[] }>}
 */
module.exports = async (context, input) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)

  try {
    await storefrontApi.deleteCartLines(input.shopifyCartId, input.deleteCartItemIds)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error removing products from cart')
  }
}
