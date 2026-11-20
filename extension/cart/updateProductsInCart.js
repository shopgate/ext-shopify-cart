const CartError = require('../models/Errors/CartError')
const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {object} input
 * @param {SgxsMeta} input.sgxsMeta
 * @param {{ cartItemId: string, quantity: number, subscriptionId?: string, attributes?: { key: string, value: string }[] }[]} input.updateCartItems
 *   If `attributes` is set, all attributes of the cart line are replaced (an empty array removes them); if it's not
 *   set, the cart line keeps its attributes.
 * @param {string} input.shopifyCartId
 */
module.exports = async (context, input) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)

  const updateCartLines = input.updateCartItems.map(item => {
    const line = { id: item.cartItemId, quantity: item.quantity, sellingPlanId: item.subscriptionId }

    // Shopify replaces all attributes of a line if set, so only pass them on if explicitly given
    if (Array.isArray(item.attributes)) line.attributes = item.attributes

    return line
  })

  try {
    await storefrontApi.updateCartLines(input.shopifyCartId, updateCartLines)
    return { messages: [] }
  } catch (err) {
    if (err instanceof CartError) throw err

    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating products in cart')
  }
}
