const ApiFactory = require('../lib/ShopifyApiFactory')
const { extractVariantId, handleCartError, getCurrentCartId } = require('../helper/cart')
const ShopifyApiRequest = require('../lib/shopify.api.js')
const UnknownError = require('../models/Errors/UnknownError')
const CartError = require('../models/Errors/CartError')

/**
 * @param {SDKContext} context
 * @param {object} input
 * @param {{ productId: string, quantity: number }[]} input.productsAddedToCart
 * @param {{ id: string, customData: string }[]} input.importedProductsAddedToCart
 * @param {string} input.shopifyCartId
 */
module.exports = async (context, input) => {
  const shopgateProductsById = input.importedProductsAddedToCart.reduce((shopgateProducts, product) => {
    const customData = product.customData ? JSON.parse(product.customData) : {}
    shopgateProducts[product.id] = { ...product, customData }

    return shopgateProducts
  }, {})

  const cartLines = input.productsAddedToCart.map(product => {
    const variantId = (shopgateProductsById[product.productId] || {}).customData.variant_id

    if (!variantId) return null

    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity: product.quantity
    }
  }).filter(cartLine => !!cartLine) // filter out products with no variant ID

  const storefrontApi = ApiFactory.buildStorefrontApi(context)

  try {
    const result = await storefrontApi.addCartLines(input.shopifyCartId, cartLines)
    console.log(result, '#########################################')
  } catch (err) {
    context.log.error(err)
  }

  // todo error handling in regular response
  return

  // todo old stuff for reference, delete when done
  const importedProductsAddedToCart = input.importedProductsAddedToCart
  const importedProductsInCart = input.importedProductsInCart
  const newCartItems = input.products
  const existingCartItems = input.cartItems
  const shopifyCartId = input.shopifyCartId

  try {
    const items = {}
    existingCartItems.forEach(existingCartItem => {
      if (existingCartItem.product && existingCartItem.product.id) {
        items[existingCartItem.product.id] = existingCartItem.quantity
      }
    })
    newCartItems.forEach(newCartItem => {
      if (!(newCartItem.productId in items)) {
        items[newCartItem.productId] = 0
      }
      items[newCartItem.productId] += newCartItem.quantity
    })
    let checkoutCartItems = Object.entries(items).map(([id, quantity]) => {
      let variantId = extractVariantId(importedProductsAddedToCart.find(importedProductAddedToCart =>
        importedProductAddedToCart.id === id && importedProductAddedToCart.customData
      ))

      // if variant not found among added products, search in existing products
      if (!variantId) {
        variantId = extractVariantId(importedProductsInCart.find(importedProductInCart =>
          importedProductInCart.id === id && importedProductInCart.customData
        ))
      }

      return { variant_id: variantId || id, quantity }
    })

    try {
      await shopifyApiRequest.put(`/admin/api/2023-10/checkouts/${shopifyCartId}.json`, { checkout: { line_items: checkoutCartItems } })
    } catch (err) {
      if (err.errors && err.errors.line_items) {
        for (const [index, lineItem] of Object.entries(err.errors.line_items)) {
          if (Object.hasOwnProperty.call(lineItem,'variant_id') !== true) {
            continue
          }

          if (lineItem.variant_id[0].code === 'invalid' && importedProductsAddedToCart.find(product => extractVariantId(product) === checkoutCartItems[index].variant_id)) {
            const cartError = new CartError()
            cartError.addProductNotFound(checkoutCartItems[index].variant_id)

            throw cartError
          }
        }
      }

      return { messages: await handleCartError(err, checkoutCartItems, shopifyCartId, context) }
    }
  } catch (err) {
    context.log.error({ newCartItems, existingCartItems, error: err }, 'Error while adding items to cart')
    if (err.code === 'ECART') throw err
    throw new UnknownError()
  }
}
