const Tools = require('../lib/tools')
const { getOutOfStockLineItemIds } = require('../helper/cart')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {Object} input.checkout
 */
module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const productData = {
    'checkout': {
      'line_items': input.checkout.line_items
    }
  }
  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

  try {
    await new Promise((resolve, reject) => shopify.put(
      `/admin/checkouts/${cartId}.json`,
      productData,
      err => {
        if (err) return reject(err)

        resolve(input)
      }
    ))
  } catch (err) {
    if (!err.errors || !err.errors.line_items) return { messages: err }

    const itemsToDelete = getOutOfStockLineItemIds(err.errors.line_items).sort((a, b) => b - a)

    for (let itemId of itemsToDelete) {
      input.checkout.line_items.splice(itemId, 1)
    }

    return { checkout: input.checkout }
  }
}
