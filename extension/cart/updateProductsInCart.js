const CartError = require('../models/Errors/CartError')
const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{ updateCartItems: { cartItemId: string, quantity: number }[] }} input
 * @param {string} input.shopifyCartId
 */
module.exports = async (context, input) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  const updateCartLines = input.updateCartItems.map(item => ({
    id: item.cartItemId,
    quantity: item.quantity
  }))

  try {
    await storefrontApi.updateCartLines(input.shopifyCartId, updateCartLines)
    return { messages: [] }
  } catch (err) {
    if (err instanceof CartError) throw err

    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating products in cart')
  }
}
