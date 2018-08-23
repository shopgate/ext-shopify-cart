const Tools = require('./tools')
const Logger = require('./logger')
const ShopifyRequest = require('./shopify.request')

/**
 * @typedef {object} config
 * @property {string} shopifyShopAlias
 * @property {string} shopifyApiKey
 * @property {string} shopifyAccessToken
 */

/**
 * @param {object} config
 * @param {Logger} log
 * @return {{}}
 */
module.exports = function (config, log) {
  /**
   * @typedef {object} SGShopifyApi
   * @property {function} get
   * @property {function} put
   * @property {function} delete
   * @property {function} post
   */
  const ShopifyApiRequest = new ShopifyRequest(
    {
      shop: config.shopifyShopAlias + '.myshopify.com',
      shopify_api_key: null, // not required
      access_token: config.shopifyAccessToken, // not required
      verbose: false
    },
    Logger
  )

  const module = {}

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * @return {string}
   */
  module.getGraphQlUrl = function () {
    let shopDomain = 'https://' + config.shopifyShopAlias + '.myshopify.com'
    return shopDomain + '/api/graphql'
  }

  /**
   * @param {function} cb
   */
  module.getStorefrontAccessToken = function (cb) {
    const endpoint = '/admin/storefront_access_tokens.json'
    // try to fetch a storefront access token with the correct scope
    this.get(endpoint, {}, (err, response) => {
      if (err) return cb(err)

      const storefrontAccessTokenTitle = 'Web Checkout Storefront Access Token'

      /**
       * @typedef {object} response
       * @property {storefront_access_token[]} storefront_access_tokens
       * @typedef {object} storefront_access_token
       * @property {string} access_token
       * @property {string} access_scope
       * @property {string} created_at
       * @property {int} id
       * @property {string} title
       */
      if (Tools.propertyExists(response, 'storefront_access_tokens')) {
        for (let i = 0; i < response.storefront_access_tokens.length; i++) {
          if (response.storefront_access_tokens[i].title === storefrontAccessTokenTitle) {
            return cb(null, response.storefront_access_tokens[i].access_token)
          }
        }
      }

      // create a new access token, because no valid token was found at this point
      const requestBody = {
        'storefront_access_token': {
          'title': storefrontAccessTokenTitle
        }
      }
      this.post(endpoint, requestBody, (err, response) => {
        if (err) return cb(err)

        return cb(null, response.storefront_access_token.access_token)
      })
    })
  }

  /**
   * @param {function} cb
   */
  module.createCheckout = function (cb) {
    this.post('/admin/checkouts.json', {}, function (err, response) {
      return cb(err, response)
    })
  }

  /**
   * @param {string} checkoutToken
   * @param {function} cb
   */
  module.getCheckout = function (checkoutToken, cb) {
    this.get('/admin/checkouts/' + checkoutToken + '.json', {}, function (err, response) {
      return cb(err, response)
    })
  }

  /**
   * @param {String} checkoutToken
   * @param {Array} productList
   * @param {function} cb
   */
  module.setCheckoutProducts = function (checkoutToken, productList, cb) {
    const data = {
      'checkout': {
        'line_items': productList
      }
    }

    this.put('/admin/checkouts/' + checkoutToken + '.json', data, (err, response) => {
      return cb(err, response)
    })
  }

  /**
   * @param {String} checkoutToken
   * @param {String|null} discountCode
   * @param {function} cb
   */
  module.setCheckoutDiscount = function (checkoutToken, discountCode, cb) {
    const data = {
      'checkout': {
        'discount_code': discountCode
      }
    }

    this.put('/admin/checkouts/' + checkoutToken + '.json', data, (err, response) => {
      return cb(err, response)
    })
  }

  /**
   * @param {number} customersId
   * @param {function} cb
   */
  module.getCustomerById = function (customersId, cb) {
    this.get(`/admin/customers/${customersId}.json`, {}, (err, userData) => {
      if (err) {
        return cb(err)
      }

      if (Tools.isEmpty(userData.customer)) {
        return cb(new Error('Customer not found'))
      }

      cb(null, userData.customer)
    })
  }

  /**
   * @param {string} email
   * @param {function} cb
   */
  module.findUserByEmail = function (email, cb) {
    this.get(`/admin/customers/search.json?query=${email}`, {}, (err, userData) => {
      if (err) {
        return cb(err)
      }

      if (Tools.isEmpty(userData.customers)) {
        return cb(new Error('No customers not found'))
      }

      cb(null, userData.customers)
    })
  }

  // -------------------------------------------------------------------------------------------------------------------
  /**
   * @param {String} endpoint
   * @param {Object} params
   * @param {function} cb
   */
  module.get = function (endpoint, params, cb) {
    ShopifyApiRequest.get(endpoint, params)
      .then((response) => {
        cb(null, response)
      })
      .catch((err) => {
        return err
      })
  }

  /**
   * @param {String} endpoint
   * @param {Object} params
   * @param {function} cb
   */
  module.put = function (endpoint, params, cb) {
    const logRequest = new Logger(log, params)
    ShopifyApiRequest.put(endpoint, params, function (err, response, headers, options, statusCode) {
      logRequest.log(statusCode, headers, response, options)
      cb(err, response)
    })
  }

  /**
   * @param {String} endpoint
   * @param {Object} params
   * @param {function} cb
   */
  module.delete = function (endpoint, params, cb) {
    const logRequest = new Logger(log, params)
    ShopifyApiRequest.delete(endpoint, params, function (err, response, headers, options, statusCode) {
      logRequest.log(statusCode, headers, response, options)
      cb(err, response)
    })
  }

  /**
   * @param {String} endpoint
   * @param {Object} params
   * @param {function} cb
   */
  module.post = function (endpoint, params, cb) {
    const logRequest = new Logger(log, params)
    ShopifyApiRequest.post(endpoint, params, function (err, response, headers, options, statusCode) {
      logRequest.log(statusCode, headers, response, options)
      cb(err, response)
    })
  }

  // -------------------------------------------------------------------------------------------------------------------

  return module
}
