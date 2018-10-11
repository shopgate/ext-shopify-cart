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
const Shopify = require('../../../lib/shopify.api')(context.config, context.log)

describe('Shopify API', () => {
  it('should create logs for all GET requests', done => {
    nock(shopifyApiUrl)
      .get(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.get(shopifyEndpoint, {}, (err, response) => {
      assert.ifError(err)
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('msg'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))

      done()
    })
  })

  it('should create logs for all POST requests', done => {
    nock(shopifyApiUrl)
      .post(shopifyEndpoint)
      .reply(httpCodeSuccess, {})

    Shopify.post(shopifyEndpoint, {}, (err, response) => {
      assert.ifError(err)
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('msg'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))

      done()
    })
  })

  it('should create logs for all PUT requests', done => {
    nock(shopifyApiUrl)
      .put(`${shopifyEndpoint}`)
      .reply(httpCodeSuccess, {})

    Shopify.put(shopifyEndpoint, {}, (err, response) => {
      assert.ifError(err)
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('msg'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))

      done()
    })
  })

  it('should create logs for all DELETE requests', done => {
    nock(shopifyApiUrl)
      .delete(`${shopifyEndpoint}`)
      .reply(httpCodeSuccess, {})

    Shopify.delete(shopifyEndpoint, {}, (err, response) => {
      assert.ifError(err)
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('msg'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))

      done()
    })
  })
})
