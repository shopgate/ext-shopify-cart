const UnknownError = require('../models/Errors/UnknownError')
const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param {{ sgxsMeta: SgxsMeta }} input
 */
module.exports = async (context, { sgxsMeta }) => {
  let deviceCartId = await context.storage.device.get('shopifyCartId')
  const userCartId = await context.storage.user.get('shopifyCartId')

  const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta)

  let deviceCart
  try {
    deviceCart = await storefrontApi.getCart(deviceCartId)
  } catch (err) {
    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching device or user cart')
    throw new UnknownError()
  }

  if (deviceCart === null) {
    context.log.warn('Shopify API returned null when getting the device cart, creating a new one')
    try {
      deviceCartId = await storefrontApi.createCart()
      await context.storage.device.set('shopifyCartId', deviceCartId)
      return
    } catch (err) {
      await context.storage.device.del('shopifyCartId')
      this.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating new device cart')
      throw new UnknownError()
    }
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
    if (deleteCartLines.length > 0) await storefrontApi.deleteCartLines(deviceCartId, deleteCartLines)
  } catch (err) {
    context.log.error({ errorMessage: err.message, cartErrors: err.errors, statusCode: err.statusCode, code: err.code }, 'Error merging carts upon log-in')
    throw new UnknownError()
  }
}
