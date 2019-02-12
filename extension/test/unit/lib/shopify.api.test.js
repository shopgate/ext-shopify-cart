const assert = require('assert')
const nock = require('nock')
const sinon = require('sinon')
const shopifyApiUrl = 'https://shopgate.myshopify.com'
const shopifyEndpoint = '/sample/endpoint'
const httpCodeSuccess = 200
const context = {
  config: {
    shopifyShopAlias: 'shopgate',
    shopifyAccessToken: 'token'
  },
  log: {
    debug: (message) => {}
  }
}
const logSpy = sinon.spy(context.log, 'debug')
const ShopifyApi = require('../../../lib/shopify.api')
const Shopify = new ShopifyApi(context.config, context.log)

describe('Shopify API', () => {
  it('should create logs for all GET requests', async () => {
    nock(shopifyApiUrl)
      .get(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    await Shopify.get(shopifyEndpoint, {})
    sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
    sinon.assert.calledWith(logSpy, sinon.match.has('shopifyRequest'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.response'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.request'))
    sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
  })

  it('should create logs for all POST requests', async () => {
    nock(shopifyApiUrl)
      .post(shopifyEndpoint)
      .reply(httpCodeSuccess, {})

    await Shopify.post(shopifyEndpoint, {})
    sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
    sinon.assert.calledWith(logSpy, sinon.match.has('shopifyRequest'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.response'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.request'))
    sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
  })

  it('should create logs for all PUT requests', async () => {
    nock(shopifyApiUrl)
      .put(`${shopifyEndpoint}`)
      .reply(httpCodeSuccess, {})

    await Shopify.put(shopifyEndpoint, {})
    sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
    sinon.assert.calledWith(logSpy, sinon.match.has('shopifyRequest'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.response'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.request'))
    sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
  })

  it('should create logs for all DELETE requests', async () => {
    nock(shopifyApiUrl)
      .delete(`${shopifyEndpoint}`)
      .reply(httpCodeSuccess, {})

    await Shopify.delete(shopifyEndpoint, {})
    sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
    sinon.assert.calledWith(logSpy, sinon.match.has('shopifyRequest'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.response'))
    sinon.assert.calledWith(logSpy, sinon.match.hasNested('shopifyRequest.request'))
    sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
  })
})
