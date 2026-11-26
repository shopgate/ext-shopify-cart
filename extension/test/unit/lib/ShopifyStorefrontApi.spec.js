const assert = require('assert')
const sinon = require('sinon')
const ShopifyStorefrontApi = require('../../../lib/ShopifyStorefrontApi')
const CartError = require('../../../models/Errors/CartError')
const queries = require('../../../lib/queries')

describe('ShopifyStorefrontApi', () => {
  let api
  let logger

  beforeEach(() => {
    logger = { error: sinon.stub(), warn: sinon.stub() }
    api = new ShopifyStorefrontApi('https://example.myshopify.com', '127.0.0.1', 'token', logger)
    sinon.stub(api, '_request')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('updateCartAttributes', () => {
    const attributes = [{ key: 'customer_type', value: 'b2c' }]

    it('should send the attributes and return the attributes of the updated cart', async () => {
      api._request.resolves({ data: { cartAttributesUpdate: { cart: { attributes }, userErrors: [], warnings: [] } } })

      const result = await api.updateCartAttributes('gid://shopify/Cart/1', attributes)

      sinon.assert.calledOnceWithExactly(api._request, queries.updateCartAttributes, { cartId: 'gid://shopify/Cart/1', attributes })
      assert.deepStrictEqual(result, attributes)
    })

    it('should return an empty array if the cart has no attributes', async () => {
      api._request.resolves({ data: { cartAttributesUpdate: { cart: { attributes: null }, userErrors: [], warnings: [] } } })

      assert.deepStrictEqual(await api.updateCartAttributes('gid://shopify/Cart/1', []), [])
    })

    it('should throw a cart error on user errors', async () => {
      api._request.resolves({
        data: {
          cartAttributesUpdate: {
            cart: null,
            userErrors: [{ field: ['attributes', '0', 'value'], message: 'Value is too long', code: 'INVALID' }],
            warnings: []
          }
        }
      })

      await assert.rejects(api.updateCartAttributes('gid://shopify/Cart/1', attributes), err => {
        assert.ok(err instanceof CartError)
        assert.deepStrictEqual(err.errors, [{ shopifyCode: 'INVALID', message: 'Value is too long', entityId: undefined }])
        return true
      })
    })

    it('should throw if the response contains no cart', async () => {
      api._request.resolves({ errors: [{ message: 'Throttled' }] })

      await assert.rejects(api.updateCartAttributes('gid://shopify/Cart/1', attributes), /Error updating cart attributes/)
      sinon.assert.calledOnce(logger.error)
    })
  })
})
