const Message = require('../models/messages/message')
const ShopifyApiRequest = require('../lib/shopify.api.js')

/**
 * @param {number} sourceCartId
 * @param {SDKContext} context
 */
const clearCart = async (sourceCartId, context) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const clearData = { 'checkout': { 'line_items': [] } }

  return shopifyApiRequest.put(`/admin/checkouts/${sourceCartId}.json`, clearData)
}

/**
 * @param {Object} updatedData
 * @param {number} targetCartId
 * @param {SDKContext} context
 */
const updateCart = async (updatedData, targetCartId, context) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)

  return shopifyApiRequest.put(`/admin/checkouts/${targetCartId}.json`, updatedData)
}

/**
 * @param {Object} product
 * @param {string} [product.customData]
 * @returns {string|null}
 * @throws {SyntaxError} If product.customData does not contain valid JSON.
 */
function extractVariantId (product) {
  if (!product || !product.customData) return null

  const customData = JSON.parse(product.customData)

  return (customData && customData.variant_id) ? customData.variant_id : null
}

/**
 * @param {Error} err
 * @param {Object} err.errors
 * @param {Object} err.errors.line_items
 * @param {{code: string, message: string}[]} err.errors.line_items.[errorType]
 * @param {Array} checkoutCartItems
 * @param {number} cartId
 * @param {SDKContext} context
 *
 * @return {Promise<{code: string, message: string, type: string}[]>}
 * @throws {Error} If err does not have an errors or error.line_items property
 */
const handleCartError = async (err, checkoutCartItems, cartId, context) => {
  if (!err || !err.errors || !err.errors.line_items) return (err)

  const renderErrorItems = (errorItems) => {
    const errorMessages = []
    Object.values(errorItems.errors.line_items).forEach(errorsPerLineItem => {
      Object.entries(errorsPerLineItem).forEach(([errorType, errors]) => {
        errors.forEach(error => {
          const errorCode = error.code === 'not_enough_in_stock' ? 'EINSUFFICIENTSTOCK' : error.code
          const errorMessage = new Message()
          errorMessage.addErrorMessage(errorCode, error.message)
          errorMessages.push(errorMessage.toJson())
        })
      })
    })
    return errorMessages
  }

  const itemsToUpdate = getLineItemIdsWithQuantityErrors(err.errors.line_items).sort((a, b) => b - a)
  if (itemsToUpdate.length > 0) {
    await fixCheckoutQuantities(checkoutCartItems, itemsToUpdate, err, cartId, context)

    return renderErrorItems(err)
  }

  return renderErrorItems(err)
}

/**
 *
 * @param {Object} lineItems
 * @returns {Array}
 */
function getLineItemIdsWithQuantityErrors (lineItems) {
  const itemsToUpdate = []

  for (let itemId in lineItems) {
    Object.entries(lineItems[itemId]).forEach(([errorType, errors]) => {
      const quantityError = errors.find(error => error.code === 'not_enough_in_stock' &&
        error.options &&
        error.options.remaining >= 0
      )
      if (quantityError) {
        itemsToUpdate.push({ id: parseInt(itemId), availableQuantity: quantityError.options.remaining })
      }
    })
  }

  return itemsToUpdate
}

/**
 * @param {Array} checkoutCartItems
 * @param {Array} itemsToUpdate
 * @param {Error} error
 * @param {Object} error.errors
 * @param {Object} error.errors.line_items
 * @param {number} cartId
 * @param {SDKContext} context
 */
async function fixCheckoutQuantities (checkoutCartItems, itemsToUpdate, error, cartId, context) {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)

  // fix quantities first, to not mess with index
  for (let item of itemsToUpdate) {
    if (item.availableQuantity !== 0) {
      checkoutCartItems[item.id].quantity = item.availableQuantity
      delete error.errors.line_items[item.id]
    }
  }
  // remove not available
  for (let item of itemsToUpdate) {
    if (item.availableQuantity === 0) {
      checkoutCartItems.splice(item.id, 1)
      delete error.errors.line_items[item.id]
    }
  }

  const productData = {
    'checkout': {
      'line_items': checkoutCartItems
    }
  }

  try {
    await shopifyApiRequest.put(`/admin/checkouts/${cartId}.json`, productData)
  } catch (err) {
    context.log.error(`Could not fix quantities for checkout ${cartId}`)
  }
}

/**
 * @param {SDKContext} context
 * @returns {string}
 */
async function getCurrentCartId (context) {
  const storage = context.meta.userId ? context.storage.user : context.storage.device

  return storage.get('checkoutToken')
}

/**
 *
 * @param {SDKContext} context
 * @param {string} cartId
 * @returns {string}
 */
async function setCurrentCartId (context, cartId) {
  const storage = context.meta.userId ? context.storage.user : context.storage.device

  return storage.set('checkoutToken', cartId)
}

module.exports = {
  clearCart,
  updateCart,
  extractVariantId,
  handleCartError,
  getLineItemIdsWithQuantityErrors,
  getCurrentCartId,
  setCurrentCartId
}
