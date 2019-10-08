const assert = require('assert')
const ConfigHelper = require('../../../helper/config')

describe('Config Helper', () => {
  let config
  const host = 'sometestshop.com'

  beforeEach(() => {
    config = {
      shopifyShopDomain: `https://${host}`,
      shopifyShopAlias: 'test'
    }
  })

  it('should return the alias based domain if no other domain is configured', () => {
    config.shopifyShopDomain = ''
    const expectedUrl = 'https://' + config.shopifyShopAlias + '.myshopify.com'
    const url = ConfigHelper.getBaseUrl(config)
    assert.strictEqual(expectedUrl, url)
  })

  it('should return the domain as configured in the configuration', () => {
    config.shopifyShopAlias = ''
    const url = ConfigHelper.getBaseUrl(config)
    assert.strictEqual(config.shopifyShopDomain, url)
  })

  it('should return the domain as configured in the configuration, although alias is also set', () => {
    const url = ConfigHelper.getBaseUrl(config)
    assert.strictEqual(config.shopifyShopDomain, url)
  })

  it('should remove trailing slash if configured in the domain', () => {
    const extectedUrl = config.shopifyShopDomain;
    config.shopifyShopDomain += '/'
    const url = ConfigHelper.getBaseUrl(config)
    assert.strictEqual(extectedUrl, url)
  })

  it('should return the hostname without https for shopAlias', () => {
    config.shopifyShopDomain = ''
    const expectedHostname = config.shopifyShopAlias + '.myshopify.com'
    const url = ConfigHelper.getHostName(config)
    assert.strictEqual(expectedHostname, url)
  })

  it('should return the hostname without https for shopDomain', () => {
    const url = ConfigHelper.getHostName(config)
    assert.strictEqual(host, url)
  })
})
