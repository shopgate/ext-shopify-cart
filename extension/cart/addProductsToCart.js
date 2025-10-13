const ApiFactory = require('../lib/ShopifyApiFactory')
const CartError = require('../models/Errors/CartError');

/**
 * @param {SDKContext} context
 * @param {object} input
 * @param {SgxsMeta} input.sgxsMeta
 * @param {{ productId: string, quantity: number, subscriptionId?: string }[]} input.productsAddedToCart
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
    const importedProduct = shopgateProductsById[product.productId] || {}
    let shopifyVariantGidProperty
    if (Array.isArray(importedProduct.properties)) {
      shopifyVariantGidProperty = importedProduct.properties.find(prop => {
        // Label is consistent with the pipeline definition, code can be present if source of products is the catalog
        // service instead of the Shopgate BigAPI
        return prop.label === 'Shopify variant gid' || prop.code === 'shopifyVariantGid'
      })
    }

    if (shopifyVariantGidProperty) {
      return {
        merchandiseId: shopifyVariantGidProperty.value,
        quantity: product.quantity,
        sellingPlanId: product.subscriptionId
      }
    }

    const variantId = importedProduct.baseProductId
      ? product.productId
      : (importedProduct.customData || {}).variant_id

    if (!variantId) return null

    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity: product.quantity,
      sellingPlanId: product.subscriptionId
    }
  }).filter(cartLine => !!cartLine) // filter out products with no variant ID

  const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)

  try {
    await storefrontApi.addCartLines(input.shopifyCartId, cartLines)
  } catch (err) {
    if (err instanceof CartError) {
      err.errors = err.errors.map(cartSubError => {
        if (cartSubError.shopifyCode === 'MERCHANDISE_OUT_OF_STOCK' || cartSubError.shopifyCode === 'MERCHANDISE_NOT_ENOUGH_STOCK') {
          cartSubError.message = 'The product could not be added to your cart due to availability.'
        }

        return cartSubError
      })

      // remove cart lines that are out of stock, those are not removed by Shopify anymore after they changed from errors to warnings
      try {
        await storefrontApi.deleteCartLines(input.shopifyCartId, err.errors.map(err => err.entityId))
      } catch (deleteError) {
        context.log.error(deleteError)
      }

      throw err
    }

    context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error adding products to cart')
  }
}
