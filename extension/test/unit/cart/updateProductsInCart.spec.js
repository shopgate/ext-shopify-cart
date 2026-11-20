const assert = require('assert')
const sinon = require('sinon')
const ApiFactory = require('../../../lib/ShopifyApiFactory')
const updateProductsInCart = require('../../../cart/updateProductsInCart')

describe('updateProductsInCart', () => {
  let storefrontApi
  let context

  beforeEach(() => {
    storefrontApi = { updateCartLines: sinon.stub().resolves({}) }
    sinon.stub(ApiFactory, 'buildStorefrontApi').returns(storefrontApi)
    context = { log: { error: sinon.stub() } }
  })

  afterEach(() => {
    sinon.restore()
  })

  const run = updateCartItems => updateProductsInCart(context, {
    sgxsMeta: { deviceIp: '127.0.0.1' },
    shopifyCartId: 'gid://shopify/Cart/1',
    updateCartItems
  })

  it('should not pass attributes if none were given, so the line keeps its attributes', async () => {
    const result = await run([{ cartItemId: 'line-1', quantity: 2 }])

    assert.deepStrictEqual(result, { messages: [] })
    sinon.assert.calledOnceWithExactly(storefrontApi.updateCartLines, 'gid://shopify/Cart/1', sinon.match.array)
    const [line] = storefrontApi.updateCartLines.firstCall.args[1]
    assert.deepStrictEqual(line, { id: 'line-1', quantity: 2, sellingPlanId: undefined })
    assert.ok(!Object.prototype.hasOwnProperty.call(line, 'attributes'))
  })

  it('should pass attributes on if given as array', async () => {
    const attributes = [{ key: '_warranty_pair_id', value: 'abc-123' }]

    await run([
      { cartItemId: 'line-1', quantity: 1, subscriptionId: 'gid://shopify/SellingPlan/1', attributes },
      { cartItemId: 'line-2', quantity: 3 }
    ])

    const lines = storefrontApi.updateCartLines.firstCall.args[1]
    assert.deepStrictEqual(lines[0], { id: 'line-1', quantity: 1, sellingPlanId: 'gid://shopify/SellingPlan/1', attributes })
    assert.ok(!Object.prototype.hasOwnProperty.call(lines[1], 'attributes'))
  })

  it('should pass an empty attributes array on to remove all attributes', async () => {
    await run([{ cartItemId: 'line-1', quantity: 1, attributes: [] }])

    const [line] = storefrontApi.updateCartLines.firstCall.args[1]
    assert.deepStrictEqual(line.attributes, [])
  })

  it('should ignore attributes that are not an array', async () => {
    await run([{ cartItemId: 'line-1', quantity: 1, attributes: null }])

    const [line] = storefrontApi.updateCartLines.firstCall.args[1]
    assert.ok(!Object.prototype.hasOwnProperty.call(line, 'attributes'))
  })
})
