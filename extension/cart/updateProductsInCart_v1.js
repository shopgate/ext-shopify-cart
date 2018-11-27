const CartItem = require('../models/cart/cartItems/cartItem')
const Tools = require('../lib/tools')
const { extractVariantId, handleCartError } = require('../helper/cart')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {Object[]} input.importedProductsInCart The list of items in the cart in Shopgate format
 * @param {Object[]} input.cartItems The list of items currently in the cart
 * @param {Object[]} input.CartItem The list of items to be changed
 */
module.exports = async function (context, input) {
  const shopify = require('../lib/shopify.api.js')(context.config, context.log)
  const existingCartItems = input.cartItems
  const updateCartItems = input.CartItem
  const importedProductsInCart = input.importedProductsInCart
  const cartItem = new CartItem()

  let checkoutCartItems = []

  const cartId = await new Promise((resolve, reject) => {
    Tools.getCurrentCartId(context, (err, cartId) => {
      if (err) return reject(err)

      resolve(cartId)
    })
  })

  // create a map to map all Shopgate item_numbers in the cart to Shopify variant_ids
  const existingCartItemProducts = existingCartItems.filter(item => item.type === cartItem.TYPE_PRODUCT)

  let variantMap = {}
  existingCartItemProducts.forEach(item => {
    let variantId = extractVariantId(importedProductsInCart.find(importedProduct =>
      importedProduct.id === item.product.id && importedProduct.customData
    ))

    variantMap[item.product.id] = variantId || item.product.id
  })

  // identify all products that have changed in quantity and the one that have not
  existingCartItemProducts.forEach(item => {
    // a note about "cartItemId vs. CartItemId" - this is a fix for documentation vs. reality mismatch
    // cartItemId is according to documentation, Newman tests and PWA 6.x
    // CartItemId is PWA 5.x reality
    const updateItem = updateCartItems.find(updateItem => (updateItem.cartItemId || updateItem.CartItemId) === item.id)

    checkoutCartItems.push({
      variant_id: variantMap[item.product.id],
      quantity: updateItem ? updateItem.quantity : item.quantity
    })
  })

  try {
    return await new Promise((resolve, reject) => shopify.put(
      `/admin/checkouts/${cartId}.json`,
      { checkout: { line_items: checkoutCartItems } },
      err => {
        if (err) return reject(err)

        resolve()
      }
    ))
  } catch (err) {
    return { messages: await handleCartError(err, checkoutCartItems, cartId, context) }
  }
}
