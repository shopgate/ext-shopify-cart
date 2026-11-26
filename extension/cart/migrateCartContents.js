const UnknownError = require('../models/Errors/UnknownError')
const ApiFactory = require('../lib/ShopifyApiFactory')
const { normalizeAttributes, addMissingAttributes, attributesEqual } = require('../helper/attributes')

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
      context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating new device cart')
      throw new UnknownError()
    }
  }

  const deleteCartLines = []
  const addProducts = []
  for (const line of deviceCart.lines.edges) {
    deleteCartLines.push(line.node.id)
    addProducts.push({
      merchandiseId: line.node.merchandise.id,
      quantity: line.node.quantity,
      // Shopify doesn't accept null as attribute value when adding lines
      attributes: normalizeAttributes(line.node.attributes),
      sellingPlanId: ((line.node.sellingPlanAllocation || {}).sellingPlan || {}).id
    })
  }

  try {
    // sequential so we don't clear the guest cart if merging failed
    if (addProducts.length > 0) await storefrontApi.addCartLines(userCartId, addProducts)
    if (deleteCartLines.length > 0) await storefrontApi.deleteCartLines(deviceCartId, deleteCartLines)
  } catch (err) {
    // schedule carts for validation on the next action, at least one of them seems to be invalid
    context.storage.device.set('cartMayBeInvalid', true)
    context.storage.user.set('cartMayBeInvalid', true)
    context.log.error({ errorMessage: err.message, cartErrors: err.errors, statusCode: err.statusCode, code: err.code }, 'Error merging carts upon log-in')
  }

  await migrateCartAttributes(context, storefrontApi, deviceCart, deviceCartId, userCartId)
}

/**
 * Adds the attributes of the guest cart to the customer cart and removes them from the guest cart.
 *
 * The customer cart wins: attributes it already has keep their values, only keys it doesn't have are added.
 *
 * Failing to migrate attributes doesn't fail the log-in and doesn't affect the migration of the cart lines.
 *
 * @param {SDKContext} context
 * @param {ShopifyStorefrontApi} storefrontApi
 * @param {ShopifyCart} deviceCart
 * @param {string} deviceCartId
 * @param {string} userCartId
 */
const migrateCartAttributes = async (context, storefrontApi, deviceCart, deviceCartId, userCartId) => {
  const guestAttributes = normalizeAttributes(deviceCart.attributes)
  if (guestAttributes.length === 0) return

  try {
    const userCart = await storefrontApi.getCart(userCartId)
    if (!userCart) {
      context.log.warn('Shopify API returned null when getting the user cart, skipping the migration of cart attributes')
      return
    }

    const userAttributes = normalizeAttributes(userCart.attributes)
    const mergedAttributes = addMissingAttributes(userAttributes, guestAttributes)
    if (!attributesEqual(userAttributes, mergedAttributes)) {
      await storefrontApi.updateCartAttributes(userCartId, mergedAttributes)
    }

    // sequential so we don't clear the guest cart if merging failed
    await storefrontApi.updateCartAttributes(deviceCartId, [])
  } catch (err) {
    context.log.error({ errorMessage: err.message, cartErrors: err.errors, statusCode: err.statusCode, code: err.code }, 'Error merging cart attributes upon log-in')
  }
}
