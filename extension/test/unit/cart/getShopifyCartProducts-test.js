const assert = require('assert')
const expect = require('chai').expect
const getShopifyCartProducts = require('../../../cart/getShopifyCartProducts')

describe('getShopifyCartProducts', () => {
  const context = {}
  const input = {}

  beforeEach(() => {
    input.shopifyCartData = {
      checkout: {
        line_items: [
          {
            product_id: 11,
            variant_id: 22
          },
          {
            product_id: 111,
            variant_id: 222
          }
        ]
      }
    }
    input.shopifyRequestErr = null
  })

  it('should return all products from the checkout', async () => {
    const expectedResult = [
      {
        productId: input.shopifyCartData.checkout.line_items[0].product_id,
        variantId: input.shopifyCartData.checkout.line_items[0].variant_id
      },
      {
        productId: input.shopifyCartData.checkout.line_items[1].product_id,
        variantId: input.shopifyCartData.checkout.line_items[1].variant_id
      }
    ]
    const result = await getShopifyCartProducts(context, input)
    expect(result.products).to.eql(expectedResult)
  })

  it('should return the shopify request error if it is in the input', async () => {
    input.shopifyRequestErr = 'Test'
    const result = await getShopifyCartProducts(context, input)
    assert.strictEqual(result, input.shopifyRequestErr)
  })
})
