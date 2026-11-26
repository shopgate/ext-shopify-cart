const assert = require('assert')
const sinon = require('sinon')
const ApiFactory = require('../../../lib/ShopifyApiFactory')
const CartError = require('../../../models/Errors/CartError')
const updateCartAttributes = require('../../../cart/updateCartAttributes')

describe('updateCartAttributes', () => {
  let storefrontApi
  let context

  /**
   * @param {ShopifyAttribute[]} attributes
   * @param {object} cartOverrides
   * @returns {object}
   */
  const buildInput = (attributes, cartOverrides = {}) => ({
    sgxsMeta: { deviceIp: '127.0.0.1' },
    shopifyCartId: 'gid://shopify/Cart/1',
    shopifyCart: {
      id: 'gid://shopify/Cart/1',
      attributes: [{ key: 'customer_type', value: 'b2b' }, { key: 'source', value: 'app' }],
      ...cartOverrides
    },
    attributes
  })

  beforeEach(() => {
    storefrontApi = { updateCartAttributes: sinon.stub().callsFake(async (cartId, attributes) => attributes) }
    sinon.stub(ApiFactory, 'buildStorefrontApi').returns(storefrontApi)
    context = { log: { error: sinon.stub() } }
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should merge the given attributes into the cart attributes and return the result of the API', async () => {
    storefrontApi.updateCartAttributes.resolves([{ key: 'from', value: 'shopify' }])

    const result = await updateCartAttributes(context, buildInput([
      { key: 'customer_type', value: 'b2c' },
      { key: 'new', value: '1' }
    ]))

    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'gid://shopify/Cart/1', [
      { key: 'customer_type', value: 'b2c' },
      { key: 'source', value: 'app' },
      { key: 'new', value: '1' }
    ])
    assert.deepStrictEqual(result, { attributes: [{ key: 'from', value: 'shopify' }] })
  })

  it('should remove keys with a null value', async () => {
    await updateCartAttributes(context, buildInput([{ key: 'customer_type', value: null }]))

    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'gid://shopify/Cart/1', [{ key: 'source', value: 'app' }])
  })

  it('should send an empty list when the last key is removed', async () => {
    await updateCartAttributes(context, buildInput([{ key: 'a', value: null }], { attributes: [{ key: 'a', value: 'x' }] }))

    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'gid://shopify/Cart/1', [])
  })

  it('should not call the API if nothing changes', async () => {
    const unchanged = await updateCartAttributes(context, buildInput([{ key: 'customer_type', value: 'b2b' }]))
    const empty = await updateCartAttributes(context, buildInput([]))
    const removeUnknown = await updateCartAttributes(context, buildInput([{ key: 'unknown', value: null }]))

    sinon.assert.notCalled(storefrontApi.updateCartAttributes)
    const expected = { attributes: [{ key: 'customer_type', value: 'b2b' }, { key: 'source', value: 'app' }] }
    assert.deepStrictEqual(unchanged, expected)
    assert.deepStrictEqual(empty, expected)
    assert.deepStrictEqual(removeUnknown, expected)
  })

  it('should handle carts without attributes', async () => {
    const result = await updateCartAttributes(context, buildInput([{ key: 'customer_type', value: 'b2c' }], { attributes: null }))

    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'gid://shopify/Cart/1', [{ key: 'customer_type', value: 'b2c' }])
    assert.deepStrictEqual(result, { attributes: [{ key: 'customer_type', value: 'b2c' }] })
  })

  it('should update the cart that was loaded if it was re-created', async () => {
    await updateCartAttributes(context, buildInput([{ key: 'a', value: '1' }], { id: 'gid://shopify/Cart/new', attributes: [] }))

    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'gid://shopify/Cart/new', [{ key: 'a', value: '1' }])
  })

  const invalidInputs = {
    'attributes is not an array': { key: 'a', value: 'b' },
    'attributes is missing': undefined,
    'an entry is not an object': ['a'],
    'an entry is null': [null],
    'an entry is an array': [['a', 'b']],
    'the key is missing': [{ value: 'b' }],
    'the key is empty': [{ key: '  ', value: 'b' }],
    'the key is not a string': [{ key: 1, value: 'b' }],
    'the value is missing': [{ key: 'a' }],
    'the value is a number': [{ key: 'a', value: 1 }],
    'the value is a boolean': [{ key: 'a', value: true }]
  }

  Object.entries(invalidInputs).forEach(([description, attributes]) => {
    it(`should reject the call without calling the API if ${description}`, async () => {
      await assert.rejects(updateCartAttributes(context, buildInput(attributes)), { code: 'EINVALIDCALL' })

      sinon.assert.notCalled(storefrontApi.updateCartAttributes)
    })
  })

  it('should rethrow cart errors', async () => {
    const cartError = new CartError()
    cartError.errors.push({ shopifyCode: 'INVALID', message: 'Too long' })
    storefrontApi.updateCartAttributes.rejects(cartError)

    await assert.rejects(updateCartAttributes(context, buildInput([{ key: 'a', value: '1' }])), err => err === cartError)
    sinon.assert.notCalled(context.log.error)
  })

  it('should log other errors and throw an unknown error', async () => {
    storefrontApi.updateCartAttributes.rejects(new Error('socket hang up'))

    await assert.rejects(updateCartAttributes(context, buildInput([{ key: 'a', value: '1' }])), { code: 'EUNKNOWN' })
    sinon.assert.calledOnce(context.log.error)
  })
})
