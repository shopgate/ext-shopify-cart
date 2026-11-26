const ApiFactory = require('../lib/ShopifyApiFactory')
const CartError = require('../models/Errors/CartError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const UnknownError = require('../models/Errors/UnknownError')
const { normalizeAttributes, mergeAttributes, attributesEqual } = require('../helper/attributes')

/**
 * @param {*} attributes
 * @throws {InvalidCallError}
 */
const validateAttributes = attributes => {
  if (!Array.isArray(attributes)) throw new InvalidCallError('"attributes" must be an array.')

  attributes.forEach((attribute, index) => {
    if (!attribute || typeof attribute !== 'object' || Array.isArray(attribute)) {
      throw new InvalidCallError(`"attributes[${index}]" must be an object.`)
    }

    if (typeof attribute.key !== 'string' || attribute.key.trim() === '') {
      throw new InvalidCallError(`"attributes[${index}].key" must be a non-empty string.`)
    }

    if (attribute.value !== null && typeof attribute.value !== 'string') {
      throw new InvalidCallError(`"attributes[${index}].value" must be a string or null.`)
    }
  })
}

/**
 * Merges the given attributes into the attributes of the cart.
 *
 * Shopify replaces all attributes of a cart on update, so the given attributes are merged into the existing ones:
 * keys not given are kept, a `null` value removes a key.
 *
 * @param {SDKContext} context
 * @param {object} input
 * @param {SgxsMeta} input.sgxsMeta
 * @param {string} input.shopifyCartId
 * @param {ShopifyCart} input.shopifyCart
 * @param {{ key: string, value: string|null }[]} input.attributes
 * @returns {Promise<{ attributes: ShopifyAttribute[] }>}
 */
module.exports = async (context, { sgxsMeta, shopifyCartId, shopifyCart, attributes }) => {
  validateAttributes(attributes)

  const currentAttributes = normalizeAttributes(shopifyCart.attributes)
  const mergedAttributes = mergeAttributes(currentAttributes, attributes)

  if (attributesEqual(currentAttributes, mergedAttributes)) return { attributes: currentAttributes }

  const storefrontApi = ApiFactory.buildStorefrontApi(context, sgxsMeta)

  // the cart may have been re-created by fetchShopifyCart, so use the ID of the cart that was actually loaded
  const cartId = shopifyCart.id || shopifyCartId

  try {
    return { attributes: await storefrontApi.updateCartAttributes(cartId, mergedAttributes) }
  } catch (err) {
    if (err instanceof CartError) throw err

    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error updating cart attributes')
    throw new UnknownError()
  }
}
