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
const Tools = require('../lib/tools')

/**
 * @typedef {object} input
 * @property {object} shopifyRequestErr
 * @property {Array} importedProductsInCart
 * @property {Array} importedChildProductsInCart
 */

/**
 * @typedef {object} context
 * @property {object} config
 *
 * @typedef {object} config
 * @property {boolean} enableCartCoupons
 */

/**
 * @param context
 * @param input
 * @param cb
 */
module.exports = function (context, input, cb) {
  const shopifyCartData = input.shopifyCartData
  const shopifyRequestErr = input.shopifyRequestErr
  const importedProductsInCart = input.importedProductsInCart
  const importedChildProductsInCart = input.importedChildProductsInCart
  const shopifyProducts = input.shopifyProducts === undefined ? [] : input.shopifyProducts

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)

    /**
     * @typedef {object} data.checkout
     * @property {boolean} taxes_included
     * @property {string} token
     * @property {number} subtotal_price
     * @property {number} total_price
     * @property {number} total_tax
     * @property {Array} tax_lines
     * @property {string} shipping_line
     * @property {object} applied_discount
     * @property {boolean} applied_discount.applicable
     * @property {string} applied_discount.non_applicable_reason
     * @property {string} web_url
     * @property {string} value_type
     *
     * @param err
     * @param data
     */
    let createCart = function (err, data) {
      if (err) cb(err, {})

      const cart = new Cart()

      /** @var {object} checkout */
      const checkout = data.checkout

      /* global */
      cart.flags.taxIncluded = cart.isTaxIncluded = checkout.taxes_included
      cart.currency = data.checkout.currency
      cart.id = data.checkout.token

      // Deactivate checkout if there are no cart items available (line items in Shopify)
      if (_.isEmpty(checkout.line_items)) {
        cart.isOrderable = false
      }

      // Disallow checkout if there was no checkout url set by Shopify
      cart.flags.orderable = cart.isOrderable = !!data.checkout.web_url

      /* totals */
      const subtotalPrice = new Total()
      subtotalPrice.label = ''
      subtotalPrice.amount = checkout.subtotal_price
      subtotalPrice.type = subtotalPrice.TYPE_SUBTOTAL
      cart.addTotal(subtotalPrice.toJson())

      const grandTotal = new Total()
      grandTotal.label = ''
      grandTotal.amount = checkout.total_price
      grandTotal.type = grandTotal.TYPE_GRANDTOTAL
      cart.addTotal(grandTotal.toJson())

      const tax = new Total()
      tax.label = ''
      tax.amount = checkout.total_tax
      tax.type = tax.TYPE_TAX

      if (Tools.propertyExists(checkout, 'tax_lines')) {
        checkout.tax_lines.forEach(function (subTaxItem) {
          let subTotal = new SubTotal()
          subTotal.label = subTaxItem.title
          subTotal.amount = subTaxItem.price
          subTotal.type = subTotal.TYPE_TAX

          tax.addSubtotal(subTotal.toJson())
        })
      }
      cart.addTotal(tax.toJson())

      if (Tools.propertyExists(checkout, 'shipping_line')) {
        const shipping = new Total()
        shipping.label = checkout.shipping_line.title
        shipping.amount = checkout.shipping_line.price
        shipping.type = shipping.TYPE_SHIPPING

        cart.addTotal(shipping.toJson())
      }

      /**
       * @typedef {object} item
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
         * @typedef {object} shopifyProduct
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
        cartItem.id = item.id
        cartItem.type = cartItem.TYPE_PRODUCT
        cartItem.quantity = item.quantity

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
        product.id = productId.toString()
        product.name = item.title
        product.featuredImageUrl = featuredImageUrl

        /* price */
        const price = new Price()
        price.unit = item.price
        price.default = item.price * item.quantity
        price.special = null

        /**
         * Compare at price is same as MSRP,
         * so use that as a higher price if present
         */
        if (item.compare_at_price > item.price) {
          price.special = price.default
          price.default = item.compare_at_price * item.quantity
        }

        /* add price to product */
        product.price = price.toJson()

        /* property */
        // normal products do also have a variant and even an option1 and a value, so we check for the variant_title.
        if (shopifyProductVariant !== null && item.variant_title !== '') {
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
        const additionalInfoSku = new AdditionalInfo()
        additionalInfoSku.label = 'sku'
        additionalInfoSku.value = item.sku

        /* add addAdditionalInfo to product */
        product.addAdditionalInfo(additionalInfoSku)

        /* additionalInfo */
        const additionalInfoVendor = new AdditionalInfo()
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
      cart.cartItems = Object.values(cart.cartItems.reduce((itemsByProductId, current) => {
        if (!itemsByProductId[current.product.id]) {
          itemsByProductId[current.product.id] = current
          return itemsByProductId
        }

        itemsByProductId[current.product.id].quantity += current.quantity

        return itemsByProductId
      }, {}))

      // Check if coupons are enabled to be shown in cart
      cart.flags.coupons = context.config.enableCartCoupons
      if (cart.enableCoupons) {
        if (Tools.propertyExists(checkout, 'applied_discount')) {
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

      let createResponse = function () {
        cb(null, cart)
      }

      Tools.setCurrentCartId(context, cart.id, function (err) {
        if (err) return cb(err)
        createResponse()
      })
    }

    createCart(shopifyRequestErr, shopifyCartData)
  })
}
