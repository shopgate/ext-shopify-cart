const _ = require('underscore')
const Cart = require('../models/cart/cart')
const Total = require('../models/cart/totals/total')
const SubTotal = require('../models/cart/totals/subTotals/subTotal')
const CartItem = require('../models/cart/cartItems/cartItem')
const Product = require('../models/cart/cartItems/products/product')
const Coupon = require('../models/cart/cartItems/coupon/coupon')
const Price = require('../models/cart/cartItems/products/price/price')
const Property = require('../models/cart/cartItems/products/properties/property')
const AdditionalInfo = require('../models/cart/cartItems/products/additionalInfo/additionalInfo')
const Message = require('../models/messages/message')
const { getCurrentCartId, setCurrentCartId } = require('../helper/cart')
const UnknownError = require('../models/Errors/UnknownError')

/**
 * @typedef {Object} getCartInput
 * @property {Object} shopifyRequestErr
 * @property {Array} importedProductsInCart
 * @property {Array} importedChildProductsInCart
 */
/**
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 * @return {Promise<ShopgateCart>}
 */
module.exports = async (context, input) => {
  const shopifyCart = input.shopifyCart

  const isOrderable = shopifyCart.lines.edges.length > 0 && shopifyCart.checkoutUrl

  return {
    isOrderable,
    isTaxIncluded: null,
    currency: shopifyCart.cost.totalAmount.currencyCode || null, // not set when no items in the cart
    messages: [],
    text: '',
    cartItems: shopifyCart.lines.edges.map(edge => {
      const line = edge.node

      // prices
      let defaultPrice = line.cost.totalAmount.amount
      let specialPrice = null
      if ((line.cost.compareAtAmountPerQuantity || {}).amount > line.cost.amountPerQuantity.amount) {
        specialPrice = defaultPrice
        defaultPrice = line.cost.compareAtAmountPerQuantity.amount * line.quantity
      }

      // every product has at least one option with one variant but if a product has at least one option with more than
      // one value it's a product with variants
      const isVariantProduct = line.merchandise.product.options.reduce((isVariantProduct, productOption) => {
        return isVariantProduct || productOption.optionValues.length > 1
      }, false)

      return {
        id: line.id,
        type: 'product',
        quantity: line.quantity,
        messages: [],
        product: {
          id: line.merchandise.product.id.substring(22),
          featuredImageUrl: line.merchandise.image.url,
          name: line.merchandise.product.title,
          price: {
            unit: line.cost.amountPerQuantity.amount,
            default: defaultPrice,
            special: specialPrice
          },
          properties: isVariantProduct
            ? line.merchandise.selectedOptions.map(option => ({
              type: 'option',
              label: option.name,
              value: option.value
            }))
            : [],
          additionalInfo: [
            {
              label: 'sku',
              value: line.merchandise.sku
            },
            {
              label: 'vendor',
              value: line.merchandise.product.vendor
            }
          ]
        }
      }
    }),
    totals: [
      {
        label: '',
        amount: shopifyCart.cost.subtotalAmount.amount || 0,
        type: 'subTotal'
      },
      {
        label: '',
        amount: shopifyCart.cost.totalAmount.amount || 0,
        type: 'grandTotal'
      },
      {
        label: 'Tax',
        amount: (shopifyCart.cost.totalTaxAmount || {}).amount || 0,
        type: 'tax'
      },
      ...shopifyCart.deliveryGroups.edges.map(edge => {
        const deliveryOption = edge.node.selectedDeliveryOption

        console.log(deliveryOption)

        return {
          label: deliveryOption.title,
          amount: deliveryOption.estimatedCost.amount || 0,
          type: 'shipping'
        }
      })
    ],
    flags: { orderable: isOrderable },
  }

  // todo old stuff, delete when done
  const shopifyCartData = input.shopifyCartData
  const importedProductsInCart = input.importedProductsInCart
  const importedChildProductsInCart = input.importedChildProductsInCart
  const shopifyProducts = input.shopifyProducts === undefined ? [] : input.shopifyProducts

  try {
    await getCurrentCartId(context)
    const cart = await createCart(shopifyCartData)
    await setCurrentCartId(context, cart.id)

    return cart
  } catch (err) {
    context.log.error({ error: err.stack }, 'Error while getting the cart')
    throw new UnknownError()
  }

  /**
   * @param {Object} data
   */
  async function createCart (data) {
    /**
     * @typedef {Object} data.checkout
     * @property {boolean} taxes_included
     * @property {string} token
     * @property {number} subtotal_price
     * @property {number} total_price
     * @property {number} total_tax
     * @property {Array} tax_lines
     * @property {string} shipping_line
     * @property {Object} applied_discount
     * @property {boolean} applied_discount.applicable
     * @property {string} applied_discount.non_applicable_reason
     * @property {string} web_url
     * @property {string} value_type
     */

    const cart = new Cart()

    /** @var {Object} checkout */
    const checkout = data.checkout

    /* global */
    cart.flags.taxIncluded = cart.isTaxIncluded = checkout.taxes_included // todo no equivalent on Storefront API, might need to fetch store settings via Admin API
    cart.currency = checkout.currency // done
    cart.id = checkout.id // done

    // disable checkout if there are no cart items available (line items in Shopify)
    if (_.isEmpty(checkout.line_items)) {
      cart.isOrderable = false // done
    }

    // disallow checkout if there was no checkout url set by Shopify
    cart.flags.orderable = cart.isOrderable = !!checkout.web_url // done

    /* totals */
    const subtotalPrice = new Total() // done
    subtotalPrice.label = ''
    subtotalPrice.amount = checkout.cost.subTotalAmount.amount
    subtotalPrice.type = subtotalPrice.TYPE_SUBTOTAL
    cart.addTotal(subtotalPrice.toJson())

    const grandTotal = new Total() // done
    grandTotal.label = ''
    grandTotal.amount = checkout.total_price
    grandTotal.type = grandTotal.TYPE_GRANDTOTAL
    cart.addTotal(grandTotal.toJson())

    const tax = new Total() // done
    tax.label = ''
    tax.amount = checkout.total_tax
    tax.type = tax.TYPE_TAX

    if (checkout.tax_lines) { // not in Cart API
      checkout.tax_lines.forEach(function (subTaxItem) {
        let subTotal = new SubTotal()
        subTotal.label = subTaxItem.title
        subTotal.amount = subTaxItem.price
        subTotal.type = subTotal.TYPE_TAX

        tax.addSubtotal(subTotal.toJson())
      })
    }
    cart.addTotal(tax.toJson())

    if (checkout.shipping_line) { // not in Cart API
      const shipping = new Total()
      shipping.label = checkout.shipping_line.title
      shipping.amount = checkout.shipping_line.price
      shipping.type = shipping.TYPE_SHIPPING

      cart.addTotal(shipping.toJson())
    }

    /**
     * @typedef {Object} item
     * @property {number} line_price
     * @property {number} compare_at_price
     * @property {string} variant_title
     * @property {string} sku
     * @property {string} vendor
     * @property {number} product_id
     *
     * cartItems */
    checkout.line_items.forEach(function (item) {
      const cartItem = new CartItem()
      /**
       * @typedef {Object} shopifyProduct
       * @property {Array} variants
       * @property {Array} options
       */
      let shopifyProductVariant = null
      const shopifyProduct = shopifyProducts.find(product => product.id.toString() === item.product_id.toString())
      if (shopifyProduct && shopifyProduct.variants) {
        shopifyProductVariant = shopifyProduct.variants.find(variant => variant.id.toString() === item.variant_id.toString())
      }

      // item number mapping: use variant_id for children and product id for parents and normal products
      let productId = item.variant_id
      let isChild = true

      /**
       * @typedef {Object} importedProductInCart
       * @property {number} id
       * @property {string} customData
       */
      importedProductsInCart.forEach(function (importedProductInCart) {
        let customData = JSON.parse(importedProductInCart.customData)
        if (customData.variant_id === item.variant_id) {
          productId = importedProductInCart.id
          isChild = false
        }
      })

      /* global */
      cartItem.id = item.id // done
      cartItem.type = cartItem.TYPE_PRODUCT // done
      cartItem.quantity = item.quantity // done

      // take featured image (based on product type) try for child only if child products given
      let featuredImageUrl = null
      if (isChild && importedChildProductsInCart !== undefined) {
        importedChildProductsInCart.forEach(function (importedChildProductInCart) {
          if (item.variant_id.toString() === importedChildProductInCart.id.toString()) {
            if (Object.keys(importedChildProductInCart.images).length > 0) {
              featuredImageUrl = importedChildProductInCart.images[0].url
            }
          }
        })
      }

      // load featured image url for normal products / take parent image if no child image available
      if (featuredImageUrl === null) {
        importedProductsInCart.forEach(function (importedProductInCart) {
          if (item.product_id.toString() === importedProductInCart.id.toString()) {
            if (Object.keys(importedProductInCart.images).length > 0) {
              featuredImageUrl = importedProductInCart.images[0].url
            }
          }
        })
      }

      /* product */
      const product = new Product()
      product.id = productId.toString() // done
      product.name = item.title // done
      product.featuredImageUrl = featuredImageUrl // done, is automatically running through thumbor/imagor/whatever we're using rn
      /* price */
      const price = new Price()
      price.unit = item.price // done
      price.default = item.price * item.quantity // done
      price.special = null // done

      /**
       * Compare at price is same as MSRP,
       * so use that as a higher price if present
       */
      if (item.compare_at_price > item.price) {
        price.special = price.default // done
        price.default = item.compare_at_price * item.quantity // done
      }

      /* add price to product */
      product.price = price.toJson() // done

      /* property */
      // normal products do also have a variant and even an option1 and a value, so we check for the variant_title.
      if (shopifyProductVariant && item.variant_title !== '') { // done
        let property = new Property()

        // shopify can have up to three options (option1 through option3 are always returned by the API)
        for (let i = 1; i <= 3; i++) {
          if (shopifyProductVariant['option' + i] !== null) {
            property.type = property.TYPE_OPTION
            property.label = shopifyProduct.options[i - 1].name
            property.value = shopifyProductVariant['option' + i]

            /* add property to product */
            product.addProperty(property)
          }
        }
      }

      /* additionalInfo */
      const additionalInfoSku = new AdditionalInfo() // done
      additionalInfoSku.label = 'sku'
      additionalInfoSku.value = item.sku

      /* add addAdditionalInfo to product */
      product.addAdditionalInfo(additionalInfoSku)

      /* additionalInfo */
      const additionalInfoVendor = new AdditionalInfo() // done
      additionalInfoVendor.label = 'vendor'
      additionalInfoVendor.value = item.vendor

      /* add addAdditionalInfo to product */
      product.addAdditionalInfo(additionalInfoVendor)

      /* add product to cartItem */
      cartItem.product = product.toJson()

      /* add cartItem to cart */
      cart.addCartItem(cartItem)
    })

    // merge line items that are the same product before returning
    cart.cartItems = Object.values(cart.cartItems.reduce((itemsByProductId, current) => { // not a thing in Cart API?
      if (!itemsByProductId[current.product.id]) {
        itemsByProductId[current.product.id] = current
        return itemsByProductId
      }

      itemsByProductId[current.product.id].quantity += current.quantity

      return itemsByProductId
    }, {}))

    // Check if coupons are enabled to be shown in cart
    cart.flags.coupons = context.config.enableCartCoupons // confirmed this didn't work; might add later
    if (cart.enableCoupons) {
      if (checkout.applied_discount) {
        if (checkout.applied_discount.applicable) {
          const discount = new Total()
          discount.label = checkout.applied_discount.title
          discount.amount = checkout.applied_discount.amount
          discount.type = discount.TYPE_DISCOUNT
          cart.addTotal(discount.toJson())

          // add to line items
          const cartItem = new CartItem()
          const coupon = new Coupon()
          coupon.code = checkout.applied_discount.title
          coupon.savedPrice = {
            value: checkout.applied_discount.amount,
            type: coupon.VALUETYPE_FIXED
          }
          cartItem.quantity = 1
          cartItem.type = cartItem.TYPE_COUPON
          cartItem.id = checkout.applied_discount.title
          cartItem.coupon = coupon.toJson()
          cart.addCartItem(cartItem)
        } else {
          const message = new Message()
          message.addInfoMessage('600', checkout.applied_discount.non_applicable_reason)
          cart.addMessage(message.toJson())
        }
      }
    }

    return cart
  }
}
