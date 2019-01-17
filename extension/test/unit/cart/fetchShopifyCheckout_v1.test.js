const sinon = require('sinon')
const assert = require('assert')
const rewire = require('rewire')

const step = rewire('../../../cart/fetchShopifyCheckout_v1.js')

describe('fetchShopifyCheckout', () => {
  /** @var {StepContext} */
  const context = {
    storage: {
      device: {}
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

  let loadCheckoutTokenSpy
  let loadCheckoutToken

  before(() => {
    // loadCheckoutTokenSpy = sinon.spy(step.__get__('loadCheckoutToken'))
    // step.__set__('loadCheckoutToken', loadCheckoutTokenSpy)

    loadCheckoutTokenSpy = sinon.stub('loadCheckoutToken').returns(
      new Promise((resolve, reject) => {
        return resolve(true)
      })
    )
    step.__set__('loadCheckoutToken', loadCheckoutTokenSpy)
  })

  it('should load the checkout token or a existing customer', (done) => {
    const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
    step(context, (err) => {
      assert.ifError(err)
      sinon.assert.calledWith(loadCheckoutTokenSpy, Shopify, false, context)

      done()
    })
  })
})
