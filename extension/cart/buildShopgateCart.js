/**
 * @param {SDKContext} context
 * @param {{ shopifyCart: ShopifyCart }} input
 * @return {Promise<ShopgateCart>}
 */
module.exports = async (context, input) => {
  const shopifyCart = input.shopifyCart

  const isOrderable = shopifyCart.lines.edges.length > 0 && shopifyCart.checkoutUrl

  // filled during line items iteration below
  let productDiscount = 0

  const shopgateCart = {
    flags: { orderable: isOrderable, coupons: false },
    isOrderable,
    isTaxIncluded: null,
    currency: shopifyCart.cost.totalAmount.currencyCode || null, // not set when no items in the cart
    messages: [],
    text: '',
    cartItems: shopifyCart.lines.edges.map(edge => {
      const line = edge.node

      // add up discounts
      productDiscount += line.discountAllocations.reduce((total, discount) => {
        total += discount.discountedAmount.amount

        return total
      }, 0)

      // prices
      let defaultPrice = line.cost.totalAmount.amount
      let specialPrice = null

      let compareAtAmount = (line.cost.compareAtAmountPerQuantity || {}).amount

      // compareAtAmount isn't always set (e.g. after aborting checkout); look up at product lvl instead in that case
      if (compareAtAmount === undefined) compareAtAmount = (line.merchandise.compareAtPrice || {}).amount

      if (compareAtAmount > line.cost.amountPerQuantity.amount) {
        specialPrice = defaultPrice
        defaultPrice = compareAtAmount * line.quantity
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
            special: specialPrice,
            discount: productDiscount
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

        return {
          label: deliveryOption.title,
          amount: deliveryOption.estimatedCost.amount || 0,
          type: 'shipping'
        }
      })
    ]
  }

  // add discount / coupon total
  if (shopifyCart.discountAllocations.length > 0) {
    const label = shopifyCart.discountCodes
      .filter(code => code.applicable)
      .map(code => code.code)
      .join(', ')

    const amount = shopifyCart.discountAllocations.reduce((total, discountAllocation) => {
      total += discountAllocation.discountedAmount.amount

      return total
    }, 0)
    shopgateCart.totals.push({ label, amount, type: 'discount' })
  }

  // todo probably require frontend portal to properly display this
  for (const giftCard of shopifyCart.appliedGiftCards) {
    shopgateCart.totals.push({
      label: `...${giftCard.lastCharacters}`,
      amount: giftCard.presentmentAmountUsed.amount *-1,
      type: 'custom'
    })
  }

  return shopgateCart
}
