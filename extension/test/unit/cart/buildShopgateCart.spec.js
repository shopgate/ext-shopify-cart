const assert = require('assert')
const buildShopgateCart = require('../../../cart/buildShopgateCart')

/**
 * @param {object} lineOverrides
 * @returns {{ node: ShopifyCartLine }}
 */
const buildLine = (lineOverrides = {}) => ({
  node: {
    id: 'gid://shopify/CartLine/1',
    quantity: 1,
    cost: {
      amountPerQuantity: { amount: 10 },
      compareAtAmountPerQuantity: null,
      totalAmount: { amount: 10 }
    },
    discountAllocations: [],
    sellingPlanAllocation: null,
    merchandise: {
      id: 'gid://shopify/ProductVariant/222',
      sku: 'SKU-1',
      title: 'Default Title',
      image: { url: 'https://example.com/image.jpg' },
      compareAtPrice: null,
      selectedOptions: [{ name: 'Title', value: 'Default Title' }],
      product: {
        id: 'gid://shopify/Product/111',
        title: 'Test Product',
        vendor: 'Test Vendor',
        options: [{ id: 'gid://shopify/ProductOption/1', name: 'Title', optionValues: [{ id: '1', name: 'Default Title' }] }]
      }
    },
    ...lineOverrides
  }
})

/**
 * @param {{ node: ShopifyCartLine }[]} lines
 * @returns {ShopifyCart}
 */
const buildShopifyCart = lines => ({
  id: 'gid://shopify/Cart/1',
  checkoutUrl: 'https://example.com/checkout',
  cost: {
    subtotalAmount: { amount: 10 },
    totalAmount: { amount: 10, currencyCode: 'EUR' },
    totalTaxAmount: { amount: 0 }
  },
  lines: { edges: lines },
  discountAllocations: [],
  discountCodes: [],
  appliedGiftCards: [],
  deliveryGroups: { edges: [] }
})

describe('buildShopgateCart', () => {
  it('should map the cart attributes', async () => {
    const attributes = [{ key: 'customer_type', value: 'b2c' }, { key: '_private', value: 'x' }]

    const shopgateCart = await buildShopgateCart({}, { shopifyCart: { ...buildShopifyCart([buildLine()]), attributes } })

    assert.deepStrictEqual(shopgateCart.attributes, attributes)
  })

  it('should return an empty array if the cart has no attributes', async () => {
    const withoutAttributes = await buildShopgateCart({}, { shopifyCart: buildShopifyCart([]) })
    const withNullAttributes = await buildShopgateCart({}, { shopifyCart: { ...buildShopifyCart([]), attributes: null } })

    assert.deepStrictEqual(withoutAttributes.attributes, [])
    assert.deepStrictEqual(withNullAttributes.attributes, [])
  })

  it('should map line item attributes onto the cart item, including private ones', async () => {
    const attributes = [
      { key: '_warranty_pair_id', value: 'abc-123' },
      { key: 'Engraving', value: 'Hello' },
      { key: 'empty', value: null }
    ]

    const shopgateCart = await buildShopgateCart({}, { shopifyCart: buildShopifyCart([buildLine({ attributes })]) })

    assert.strictEqual(shopgateCart.cartItems.length, 1)
    assert.deepStrictEqual(shopgateCart.cartItems[0].attributes, attributes)
  })

  it('should return an empty array if the line has no attributes', async () => {
    const shopgateCart = await buildShopgateCart({}, {
      shopifyCart: buildShopifyCart([buildLine(), buildLine({ id: 'gid://shopify/CartLine/2', attributes: null })])
    })

    assert.deepStrictEqual(shopgateCart.cartItems[0].attributes, [])
    assert.deepStrictEqual(shopgateCart.cartItems[1].attributes, [])
  })

  it('should not add attributes to the product properties', async () => {
    const attributes = [{ key: '_warranty_pair_id', value: 'abc-123' }]

    // simple product
    const simpleCart = await buildShopgateCart({}, { shopifyCart: buildShopifyCart([buildLine({ attributes })]) })
    assert.deepStrictEqual(simpleCart.cartItems[0].product.properties, [])

    // variant product
    const variantLine = buildLine({ attributes })
    variantLine.node.merchandise.selectedOptions = [{ name: 'Color', value: 'Red' }]
    variantLine.node.merchandise.product.options = [{
      id: 'gid://shopify/ProductOption/2',
      name: 'Color',
      optionValues: [{ id: '1', name: 'Red' }, { id: '2', name: 'Blue' }]
    }]

    const variantCart = await buildShopgateCart({}, { shopifyCart: buildShopifyCart([variantLine]) })
    assert.deepStrictEqual(variantCart.cartItems[0].product.properties, [{ type: 'option', label: 'Color', value: 'Red' }])
    assert.strictEqual(variantCart.cartItems[0].product.id, '111-222')
  })
})
