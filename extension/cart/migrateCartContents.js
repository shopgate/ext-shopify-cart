const UnknownError = require('../models/Errors/UnknownError')
const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 */
module.exports = async (context) => {
  const deviceCartId = await context.storage.device.get('shopifyCartId')
  const userCartId = await context.storage.user.get('shopifyCartId')

  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  let deviceCart
  try {
    deviceCart = await storefrontApi.getCart(deviceCartId)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching device or user cart')
    throw new UnknownError()
  }

  if (deviceCart === null) {
    context.log.error('Shopify API returned null instead of a cart.')
    throw new UnknownError()
  }

  const deleteCartLines = []
  const addProducts = []
  for (const line of deviceCart.lines.edges) {
    deleteCartLines.push(line.node.id)
    addProducts.push({ merchandiseId: line.node.merchandise.id, quantity: line.node.quantity })
  }

  try {
    // sequential so we don't clear the guest cart if merging failed
    if (addProducts.length > 0) await storefrontApi.addCartLines(userCartId, addProducts)
    if (deleteCartLines.length > 0) await storefrontApi.deleteCartLines(userCartId, deleteCartLines)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error merging carts upon log-in')
    throw new UnknownError()
  }
}
