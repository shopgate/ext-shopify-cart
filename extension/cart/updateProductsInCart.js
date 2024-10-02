const CartItem = require('../models/cart/cartItems/cartItem')
const { extractVariantId, handleCartError, getCurrentCartId } = require('../helper/cart')
const ShopifyApiRequest = require('../lib/shopify.api.js')
const UnknownError = require('../models/Errors/UnknownError')

const ApiFactory = require('../lib/ShopifyApiFactory')

/**
 * @param {SDKContext} context
 * @param input
 * @param {Object[]} input.existingCartItems The list of items currently in the cart
 * @param {Object[]} input.updateCartItems
 * @param {string} input.shopifyCartId
 */
module.exports = async (context, input) => {
  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  const updateCartLines = input.updateCartItems.map(item => ({
    id: item.cartItemId,
    quantity: item.quantity
  }))

  const result = await storefrontApi.updateCartLines(input.shopifyCartId, updateCartLines)

  console.log(JSON.stringify(result, null, 2), '#####################')

  // todo error handling

  return { messages: [] }

  // todo old stuff for reference, delete when done
  let checkoutCartItems = []

  try {
    const cartId = await getCurrentCartId(context)
    const existingCartItemProducts = existingCartItems.filter(item => item.type === cartItem.TYPE_PRODUCT)
    let variantMap = {}

    existingCartItemProducts.forEach(item => {
      let variantId = extractVariantId(importedProductsInCart.find(importedProduct =>
        importedProduct.id === item.product.id && importedProduct.customData
      ))

      variantMap[item.product.id] = variantId || item.product.id
    })

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
      await shopifyApiRequest.put(`/admin/api/2023-10/checkouts/${cartId}.json`, { checkout: { line_items: checkoutCartItems } })
    } catch (err) {
      return { messages: await handleCartError(err, checkoutCartItems, cartId, context) }
    }
  } catch (err) {
    throw new UnknownError()
  }
}
