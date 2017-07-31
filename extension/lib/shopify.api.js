const ShopifyAPI = require('shopify-node-api')

/**
 * @param {object} config
 * @return {{}}
 */
module.exports = function (config) {
  const module = {}
  const SGShopifyApi = ShopifyAPI({
    shop: config.shopifyShopDomain.replace(/^https?:\/\//, ''),
    shopify_api_key: config.shopifyApiKey,
    access_token: config.shopifyAccessToken,
    verbose: false
  })

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} callback
   */
  module.get = function (endpoint, params, callback) {
    SGShopifyApi.get(endpoint, params, function (err, data) {
      callback(err, data)
    })
  }

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} callback
   */
  module.put = function (endpoint, params, callback) {
    SGShopifyApi.put(endpoint, params, function (err, data) {
      callback(err, data)
    })
  }

  /**
   *
   * @param {string} endpoint
   * @param {object} params
   * @param {function} callback
   */
  module.delete = function (endpoint, params, callback) {
    SGShopifyApi.delete(endpoint, params, function (err, data) {
      callback(err, data)
    })
  }

  /**
   *
   * @param {string} endpoint
   * @param {object} params
   * @param {function} callback
   */
  module.post = function (endpoint, params, callback) {
    SGShopifyApi.post(endpoint, params, function (err, data) {
      callback(err, data)
    })
  }

  /**
   * @return {string}
   */
  module.getGraphQlUrl = function () {
    let shopDomain = config.shopifyShopDomain.replace(/\/$/, '')
    return shopDomain + '/api/graphql'
  }

  /**
   * @return {string}
   */
  module.getStorefrontAccessToken = function () {
    // TODO: This token needs to be generated using the access token and stored in the extension settings storage
    if (config.shopifyApiKey === '8d57a3c51a776b7674c37bff63edd47f') {
      return 'ae057eea8b7d1fda4bc1e9a92bbb6e6f'
    }
    return '68aca92c4a171dea889d1cc7464762cd'
  }

  return module
}
