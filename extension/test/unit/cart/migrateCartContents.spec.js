const sinon = require('sinon')
const ApiFactory = require('../../../lib/ShopifyApiFactory')
const migrateCartContents = require('../../../cart/migrateCartContents')

describe('migrateCartContents', () => {
  let storefrontApi
  let context

  /**
   * @param {Object<string, any>} values
   * @returns {SDKContextEntityStorage}
   */
  const buildStorage = values => ({
    get: sinon.stub().callsFake(async key => values[key]),
    set: sinon.stub().resolves(),
    del: sinon.stub().resolves()
  })

  beforeEach(() => {
    storefrontApi = {
      getCart: sinon.stub(),
      createCart: sinon.stub(),
      addCartLines: sinon.stub().resolves({}),
      deleteCartLines: sinon.stub().resolves({})
    }
    sinon.stub(ApiFactory, 'buildStorefrontApi').returns(storefrontApi)

    context = {
      storage: {
        device: buildStorage({ shopifyCartId: 'device-cart-id' }),
        user: buildStorage({ shopifyCartId: 'user-cart-id' })
      },
      log: { error: sinon.stub(), warn: sinon.stub() }
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should move guest cart lines including attributes and selling plans to the customer cart', async () => {
    const attributes = [{ key: '_warranty_pair_id', value: 'abc-123' }]
    storefrontApi.getCart.resolves({
      lines: {
        edges: [
          {
            node: {
              id: 'line-1',
              quantity: 2,
              attributes,
              sellingPlanAllocation: { sellingPlan: { id: 'gid://shopify/SellingPlan/1', name: 'Monthly' } },
              merchandise: { id: 'gid://shopify/ProductVariant/1' }
            }
          },
          {
            node: {
              id: 'line-2',
              quantity: 1,
              sellingPlanAllocation: null,
              merchandise: { id: 'gid://shopify/ProductVariant/2' }
            }
          }
        ]
      }
    })

    await migrateCartContents(context, { sgxsMeta: { deviceIp: '127.0.0.1' } })

    sinon.assert.calledOnceWithExactly(storefrontApi.getCart, 'device-cart-id')
    sinon.assert.calledOnceWithExactly(storefrontApi.addCartLines, 'user-cart-id', [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2, attributes, sellingPlanId: 'gid://shopify/SellingPlan/1' },
      { merchandiseId: 'gid://shopify/ProductVariant/2', quantity: 1, attributes: [], sellingPlanId: undefined }
    ])
    sinon.assert.calledOnceWithExactly(storefrontApi.deleteCartLines, 'device-cart-id', ['line-1', 'line-2'])
    sinon.assert.callOrder(storefrontApi.addCartLines, storefrontApi.deleteCartLines)
    sinon.assert.notCalled(context.log.error)
  })

  it('should keep the guest cart lines if merging failed', async () => {
    storefrontApi.getCart.resolves({
      lines: { edges: [{ node: { id: 'line-1', quantity: 1, merchandise: { id: 'gid://shopify/ProductVariant/1' } } }] }
    })
    storefrontApi.addCartLines.rejects(new Error('failed'))

    await migrateCartContents(context, { sgxsMeta: {} })

    sinon.assert.notCalled(storefrontApi.deleteCartLines)
    sinon.assert.calledWith(context.storage.device.set, 'cartMayBeInvalid', true)
    sinon.assert.calledWith(context.storage.user.set, 'cartMayBeInvalid', true)
    sinon.assert.calledOnce(context.log.error)
  })

  it('should not call the API to add or delete lines if the guest cart is empty', async () => {
    storefrontApi.getCart.resolves({ lines: { edges: [] } })

    await migrateCartContents(context, { sgxsMeta: {} })

    sinon.assert.notCalled(storefrontApi.addCartLines)
    sinon.assert.notCalled(storefrontApi.deleteCartLines)
  })
})
