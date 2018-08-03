const nock = require('nock')
const sinon = require('sinon')
const Logger = require('../../../lib/logger')
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

  beforeEach(() => {
    logRequest = new Logger(context.log, {})
  });

  it('should create logs for all GET requests', () => {
    nock(shopifyApiUrl)
      .get(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.get(shopifyEndpoint, {}, (err, response) => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all POST requests', () => {
    nock(shopifyApiUrl)
      .post(shopifyEndpoint)
      .reply(httpCodeSuccess, {})

    Shopify.post(shopifyEndpoint, {}, (err, response) => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all PUT requests', () => {
    nock(shopifyApiUrl)
      .put(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.put(shopifyEndpoint, {}, (err, response) => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })

  it('should create logs for all DELETE requests', () => {
    nock(shopifyApiUrl)
      .delete(`${shopifyEndpoint}?`)
      .reply(httpCodeSuccess, {})

    Shopify.delete(shopifyEndpoint, {}, (err, response) => {
      sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
      sinon.assert.calledWith(logSpy, sinon.match.has('message'))
      sinon.assert.calledWith(logSpy, sinon.match.has('request'))
      sinon.assert.calledWith(logSpy, sinon.match.has('response'))
      sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
    })
  })
})
