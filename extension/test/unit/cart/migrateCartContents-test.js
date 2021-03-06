const sinon = require('sinon')
const assert = require('assert')
const rewire = require('rewire')

const step = rewire('../../../cart/migrateCartContents')
const cart = require('../../../helper/cart')

describe('migrateCartContents', () => {
  /** @var {StepContext} */
  const context = {
    tracedRequest: () => {
      return {}
    },
    config: {
    },
    log: {
      debug: () => {
      },
      error: () => {
      }
    },
    meta: {}
  }

  const input = {
    sourceCart: {
      token: '1',
      line_items: [{ 'variant_id': 123, 'quantity': 6 }, { 'variant_id': 124, 'quantity': 1 }]
    },
    targetCart: {
      token: '2',
      line_items: [{ 'variant_id': 123, 'quantity': 2 }]
    }
  }

  let cartUpdateSpy
  let clearCartStub
  let updateCartStub

  before(() => {
    cartUpdateSpy = sinon.spy(step.__get__('updateAndAdjustCart'))
    step.__set__('updateAndAdjustCart', cartUpdateSpy)

    clearCartStub = sinon.stub(cart, 'clearCart').returns(
      {}
    )
    step.__set__('clearCart', clearCartStub)

    updateCartStub = sinon.stub(cart, 'updateCart').returns(
      {}
    )
    step.__set__('updateCart', updateCartStub)
  })

  it('should merge cart content to target cart and call updateCart with new data', async () => {
    const expectedResult = {
      'checkout': { 'line_items': [
        { quantity: 8, variant_id: 123 }, { quantity: 1, variant_id: 124 }
      ] }
    }

    await step(context, input)
    assert(cartUpdateSpy.calledOnce, 'updateAndAdjustCart should be called once')
    assert(clearCartStub.calledOnce, 'clearCart should be called once')
    assert(updateCartStub.calledOnce, 'updateCart should be called once')
    sinon.assert.calledWith(cartUpdateSpy, expectedResult, input.targetCart.token)
  })
})
