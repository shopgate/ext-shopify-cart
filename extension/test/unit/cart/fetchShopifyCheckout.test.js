const sinon = require('sinon')
const assert = require('assert')
const rewire = require('rewire')

const step = rewire('../../../cart/fetchShopifyCheckout.js')

describe('fetchShopifyCheckout', () => {
  /** @var {StepContext} */
  const context = {
    storage: {
      device: {},
      user: {
        get: () => {}
      }
    },
    config: {
    },
    log: {
      debug: () => {
      },
      error: () => {
      }
    },
    meta: {
      userId: 1
    }
  }

  const input = {
    createNew: false
  }

  let loadCheckoutTokenSpy

  before(() => {
    loadCheckoutTokenSpy = sinon.spy(step.__get__('loadCheckoutToken'))
    step.__set__('loadCheckoutToken', loadCheckoutTokenSpy)
  })

  it('should load the checkout token or a existing customer', async () => {
    await step(context, input)
    assert(loadCheckoutTokenSpy.calledOnce, 'loadCheckoutToken should be called once')
  })
})
