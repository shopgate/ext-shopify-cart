const Message = require('../models/messages/message')
const ShopifyApiRequest = require('../lib/shopify.api.js')

/**
 * @param {int} sourceCartId
 * @param {SDKContext} context
 */
const clearCart = async (sourceCartId, context) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const clearData = { 'checkout': { 'line_items': [] } }
  const clear = await shopifyApiRequest.put(`/admin/checkouts/${sourceCartId}.json`, clearData)
  return clear
}

/**
 * @param {object} updatedData
 * @param {int} targetCartId
 * @param {SDKContext} context
 */
const updateCart = async (updatedData, targetCartId, context) => {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)
  const update = await shopifyApiRequest.put(`/admin/checkouts/${targetCartId}.json`, updatedData)
  return update
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
 * @param {int} cartId
 * @param {SDKContext} context
 *
 * @return {Promise{code: string, message: string, type: string}[]}
 * @throws {Error} If err does not have an errors or error.line_items property
 */
const handleCartError = async (err, checkoutCartItems, cartId, context) => {
  if (!err || !err.errors || !err.errors.line_items) return (err)

  const renderErrorItems = (errorItems) => {
    const errorMessages = []
    Object.values(errorItems.errors.line_items).forEach(errorsPerLineItem => {
      Object.entries(errorsPerLineItem).forEach(([errorType, errors]) => {
        errors.forEach(error => {
          let errorCode
          switch (error.code) {
            case 'not_enough_in_stock':
              errorCode = 'EINSUFFICIENTSTOCK'
              break
            default:
              errorCode = error.code
          }
          const errorMessage = new Message()
          errorMessage.addErrorMessage(errorCode, error.message)
          errorMessages.push(errorMessage.toJson())
        })
      })
    })
    return errorMessages
  }

  const itemsToDelete = getOutOfStockLineItemIds(err.errors.line_items).sort((a, b) => b - a)
  if (itemsToDelete.length > 0) {
    await fixCheckoutQuantities(checkoutCartItems, itemsToDelete, err, cartId, context)
    return renderErrorItems(err)
  }
  return renderErrorItems(err)
}

/**
 *
 * @param {Object} lineItems
 * @returns {Array}
 */
function getOutOfStockLineItemIds (lineItems) {
  const itemsToDelete = []

  for (let itemId in lineItems) {
    Object.entries(lineItems[itemId]).forEach(([errorType, errors]) => {
      if (errors.find(error => error.code === 'not_enough_in_stock' &&
        error.options &&
        error.options.remaining === 0
      )) {
        itemsToDelete.push(parseInt(itemId))
      }
    })
  }

  return itemsToDelete
}

/**
 * @param {Array} checkoutCartItems
 * @param {Array} itemsToDelete
 * @param {Error} error
 * @param {Object} error.errors
 * @param {Object} error.errors.line_items
 * @param {int} cartId
 * @param {SDKContext} context
 */
async function fixCheckoutQuantities (checkoutCartItems, itemsToDelete, error, cartId, context) {
  const shopifyApiRequest = new ShopifyApiRequest(context.config, context.log)

  for (let itemId of itemsToDelete) {
    checkoutCartItems.splice(itemId, 1)
    delete error.errors.line_items[itemId]
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
  const currentCartId = await storage.get('checkoutToken')
  return currentCartId
}

/**
   *
   * @param {SDKContext} context
   * @param {string} cartId
   * @returns {string}
   */
async function setCurrentCartId (context, cartId) {
  const storage = context.meta.userId ? context.storage.user : context.storage.device
  const currentCartId = await storage.set('checkoutToken', cartId)
  return currentCartId
}

module.exports = {
  clearCart,
  updateCart,
  extractVariantId,
  handleCartError,
  getOutOfStockLineItemIds,
  getCurrentCartId,
  setCurrentCartId
}
