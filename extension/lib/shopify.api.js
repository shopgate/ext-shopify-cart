const ShopifyAPI = require('shopify-node-api')

/**
 * @typedef {object} config
 * @property {string} shopifyShopDomain
 * @property {string} shopifyApiKey
 * @property {string} shopifyAccessToken
 */

/**
 * @param {object} config
 * @return {{}}
 */
module.exports = function (config) {
  /**
   * @typedef {object} SGShopifyApi
   * @property {function} get
   * @property {function} put
   * @property {function} delete
   * @property {function} post
   */
  const SGShopifyApi = ShopifyAPI({
    shop: config.shopifyShopDomain.replace(/^https?:\/\//, ''),
    shopify_api_key: config.shopifyApiKey,
    access_token: config.shopifyAccessToken,
    verbose: false
  })

  const module = {}

  // -------------------------------------------------------------------------------------------------------------------

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

  /**
   * @param {function} cb
   */
  module.createCheckout = function (cb) {
    this.post('/admin/checkouts.json', {}, function (err, data) {
      return cb(err, data)
    })
  }

  /**
   * @param {string} checkoutToken
   * @param {function} cb
   */
  module.getCheckout = function (checkoutToken, cb) {
    this.get('/admin/checkouts/' + checkoutToken + '.json', {}, function (err, data) {
      return cb(err, data)
    })
  }

  /**
   * @param {string} checkoutToken
   * @param {Array} productList
   * @param {function} cb
   */
  module.setCheckoutProducts = function (checkoutToken, productList, cb) {
    const data = {
      'checkout': {
        'line_items': productList
      }
    }

    this.put('/admin/checkouts/' + checkoutToken + '.json', data, (err) => {
      return cb(err)
    })
  }

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} cb
   */
  module.get = function (endpoint, params, cb) {
    SGShopifyApi.get(endpoint, params, function (err, data) {
      cb(err, data)
    })
  }

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} cb
   */
  module.put = function (endpoint, params, cb) {
    SGShopifyApi.put(endpoint, params, function (err, data) {
      cb(err, data)
    })
  }

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} cb
   */
  module.delete = function (endpoint, params, cb) {
    SGShopifyApi.delete(endpoint, params, function (err, data) {
      cb(err, data)
    })
  }

  /**
   * @param {string} endpoint
   * @param {object} params
   * @param {function} cb
   */
  module.post = function (endpoint, params, cb) {
    SGShopifyApi.post(endpoint, params, function (err, data) {
      cb(err, data)
    })
  }

  // -------------------------------------------------------------------------------------------------------------------

  return module
}
