const sinon = require('sinon')
const assert = require('assert')
const rewire = require('rewire')
const ShopifyApiRequest = require('../../../lib/shopify.api.js')

const fetchShopifyCheckout = rewire('../../../cart/fetchShopifyCheckout.js')

describe('fetchShopifyCheckout', () => {
  /** @var {StepContext} */
  const context = {
    storage: {
      device: {},
      user: {
        get: () => { return 'token' },
        set: () => {}
      }
    },
    config: {
      shopifyShopAlias: 'shopgate'
    },
    log: {
      debug: () => {},
      error: () => {},
      info: () => {}
    },
    meta: {
      userId: 1
    }
  }

  it('should load the checkout by token', async () => {
    sinon.stub(ShopifyApiRequest.prototype, 'getCheckout').returns({ checkout: { } })

    const saveCheckoutTokenSpy = sinon.spy(fetchShopifyCheckout.__get__('saveCheckoutToken'))
    fetchShopifyCheckout.__set__('saveCheckoutToken', saveCheckoutTokenSpy)
    const loadCheckoutTokenSpy = sinon.spy(fetchShopifyCheckout.__get__('loadCheckoutToken'))
    fetchShopifyCheckout.__set__('loadCheckoutToken', loadCheckoutTokenSpy)

    await fetchShopifyCheckout(context, { createNew: false })
    assert(loadCheckoutTokenSpy.calledOnce, 'loadCheckoutToken should be called once')
    assert(saveCheckoutTokenSpy.notCalled, 'saveCheckoutTokenSpy should NOT be called')
  })

  it('should create a new checkout', async () => {
    const saveCheckoutTokenSpy = sinon.spy(fetchShopifyCheckout.__get__('saveCheckoutToken'))
    fetchShopifyCheckout.__set__('saveCheckoutToken', saveCheckoutTokenSpy)
    const loadCheckoutTokenSpy = sinon.spy(fetchShopifyCheckout.__get__('loadCheckoutToken'))
    fetchShopifyCheckout.__set__('loadCheckoutToken', loadCheckoutTokenSpy)

    sinon.stub(ShopifyApiRequest.prototype, 'createCheckout').returns({ checkout: { token: 'token' } })

    await fetchShopifyCheckout(context, { createNew: true })
    assert(loadCheckoutTokenSpy.calledOnce, 'loadCheckoutToken should be called once')
    assert(saveCheckoutTokenSpy.calledOnce, 'saveCheckoutTokenSpy should be called once')
  })
})
