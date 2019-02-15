const assert = require('assert')
const remapCheckoutToShopifyCartData = require('../../../cart/remapCheckoutToShopifyCartData')

describe('remapCheckoutToShopifyCartData', () => {
  const context = {}
  const input = {
    checkout: {
      id: 1
    }
  }

  it('should map the checkout to shopifyCartData', async () => {
    const result = await remapCheckoutToShopifyCartData(context, input)
    assert.strictEqual(result.shopifyCartData.checkout, input.checkout)
  })
})
