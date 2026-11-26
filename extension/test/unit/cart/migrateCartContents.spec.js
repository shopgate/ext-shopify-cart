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
      deleteCartLines: sinon.stub().resolves({}),
      updateCartAttributes: sinon.stub().callsFake(async (cartId, attributes) => attributes)
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

  it('should pass null line attribute values on as empty strings', async () => {
    storefrontApi.getCart.resolves({
      lines: {
        edges: [{
          node: {
            id: 'line-1',
            quantity: 1,
            attributes: [{ key: 'empty', value: null }, { key: 'set', value: 'x' }],
            merchandise: { id: 'gid://shopify/ProductVariant/1' }
          }
        }]
      }
    })

    await migrateCartContents(context, { sgxsMeta: {} })

    sinon.assert.calledOnceWithExactly(storefrontApi.addCartLines, 'user-cart-id', [{
      merchandiseId: 'gid://shopify/ProductVariant/1',
      quantity: 1,
      attributes: [{ key: 'empty', value: '' }, { key: 'set', value: 'x' }],
      sellingPlanId: undefined
    }])
  })

  describe('cart attributes', () => {
    const guestLines = { edges: [{ node: { id: 'line-1', quantity: 1, merchandise: { id: 'gid://shopify/ProductVariant/1' } } }] }

    /**
     * @param {ShopifyAttribute[]|null} guestAttributes
     * @param {ShopifyAttribute[]|null} customerAttributes
     * @param {object} guestLinesOverride
     */
    const stubCarts = (guestAttributes, customerAttributes, guestLinesOverride = guestLines) => {
      storefrontApi.getCart.withArgs('device-cart-id').resolves({ lines: guestLinesOverride, attributes: guestAttributes })
      storefrontApi.getCart.withArgs('user-cart-id').resolves({ lines: { edges: [] }, attributes: customerAttributes })
    }

    it('should keep the customer cart values, add missing guest keys and clear the guest cart attributes', async () => {
      stubCarts(
        [{ key: 'customer_type', value: 'b2c' }, { key: 'source', value: 'app' }],
        [{ key: 'customer_type', value: 'b2b' }, { key: 'other', value: '1' }]
      )

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledTwice(storefrontApi.updateCartAttributes)
      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.firstCall, 'user-cart-id', [
        { key: 'customer_type', value: 'b2b' },
        { key: 'other', value: '1' },
        { key: 'source', value: 'app' }
      ])
      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.secondCall, 'device-cart-id', [])
      sinon.assert.calledOnce(storefrontApi.addCartLines)
      sinon.assert.calledOnce(storefrontApi.deleteCartLines)
      sinon.assert.notCalled(context.log.error)
    })

    it('should copy the guest attributes to a customer cart without attributes', async () => {
      stubCarts([{ key: 'customer_type', value: 'b2c' }], null)

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.firstCall, 'user-cart-id', [{ key: 'customer_type', value: 'b2c' }])
      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.secondCall, 'device-cart-id', [])
    })

    it('should not update the customer cart if it already has all keys, but still clear the guest cart', async () => {
      stubCarts([{ key: 'customer_type', value: 'b2c' }], [{ key: 'customer_type', value: 'b2b' }])

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledOnceWithExactly(storefrontApi.updateCartAttributes, 'device-cart-id', [])
    })

    it('should not load the customer cart or update attributes if the guest cart has none', async () => {
      stubCarts([], [{ key: 'customer_type', value: 'b2b' }])

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledOnceWithExactly(storefrontApi.getCart, 'device-cart-id')
      sinon.assert.notCalled(storefrontApi.updateCartAttributes)
    })

    it('should migrate the attributes of a guest cart without lines', async () => {
      stubCarts([{ key: 'customer_type', value: 'b2c' }], [], { edges: [] })

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.notCalled(storefrontApi.addCartLines)
      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.firstCall, 'user-cart-id', [{ key: 'customer_type', value: 'b2c' }])
    })

    it('should keep the guest cart attributes and not fail the log-in if updating the customer cart failed', async () => {
      stubCarts([{ key: 'customer_type', value: 'b2c' }], [])
      storefrontApi.updateCartAttributes.withArgs('user-cart-id').rejects(new Error('failed'))

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledOnce(storefrontApi.updateCartAttributes)
      sinon.assert.calledOnce(storefrontApi.deleteCartLines)
      sinon.assert.calledOnce(context.log.error)
      sinon.assert.neverCalledWith(context.storage.device.set, 'cartMayBeInvalid', true)
      sinon.assert.neverCalledWith(context.storage.user.set, 'cartMayBeInvalid', true)
    })

    it('should migrate the attributes even if moving the lines failed', async () => {
      stubCarts([{ key: 'customer_type', value: 'b2c' }], [])
      storefrontApi.addCartLines.rejects(new Error('failed'))

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.calledWithExactly(storefrontApi.updateCartAttributes.firstCall, 'user-cart-id', [{ key: 'customer_type', value: 'b2c' }])
    })

    it('should skip the attribute migration with a warning if the customer cart is not found', async () => {
      storefrontApi.getCart.withArgs('device-cart-id').resolves({ lines: guestLines, attributes: [{ key: 'customer_type', value: 'b2c' }] })
      storefrontApi.getCart.withArgs('user-cart-id').resolves(null)

      await migrateCartContents(context, { sgxsMeta: {} })

      sinon.assert.notCalled(storefrontApi.updateCartAttributes)
      sinon.assert.calledOnce(context.log.warn)
    })
  })
})
