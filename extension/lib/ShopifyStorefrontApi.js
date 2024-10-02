const request = require('request-promise-native')

const {
  createCartForCustomer,
  createCart,
  getCart,
  addCartLines
} = require('./queries/')

class ShopifyStorefrontApi {
  /**
   * @param {string} shopUrl
   * @param {ShopifyApiTokenManager} tokenManager
   * @param {SDKContextLog} logger A generic logger instance, e.g. current step context's .log property.
   * @param {string?} apiVersion
   */
  constructor(shopUrl, tokenManager, logger, apiVersion = '2024-07') {
    this.apiUrl = `${shopUrl.replace(/\/+$/, '')}/api/${apiVersion}/graphql.json`
    this.tokenManager = tokenManager
    this.logger = logger
    this.storefrontApiAccessToken = null
  }

  /**
   * @param {string} customerStorefrontApiAccessToken
   * @returns {Promise<string>}
   */
  async createCartForCustomer (customerStorefrontApiAccessToken) {
    const createCartResult = await this._request(
      createCartForCustomer,
      { buyerIdentity: { customerAccessToken: customerStorefrontApiAccessToken } }
    )

    const cartId = ((((createCartResult || {}).data || {}).cartCreate || {}).cart || {}).id
    if (cartId) return cartId

    this.logger.error({ response: JSON.stringify(createCartResult) }, 'Error creating cart for a customer.')
    throw new Error('Error loading cart')
  }

  /**
   * @returns {Promise<string>}
   */
  async createCart () {
    let createCartResult
    try {
      createCartResult = await this._request(createCart)
    } catch (err) {
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error creating an anonymous cart.')
      throw new Error('Error loading cart')
    }

    const cartId = ((((createCartResult || {}).data || {}).cartCreate || {}).cart || {}).id
    if (cartId) return cartId

    this.logger.error({ response: JSON.stringify(createCartResult) }, 'Error creating an anonymous cart.')
    throw new Error('Error loading cart')
  }

  /**
   * @param {string} cartId
   * @returns {Promise<ShopifyCart>}
   */
  async getCart (cartId) {
    const shopifyCartResult = await this._request(getCart, { cartId })

    const shopifyCart = ((shopifyCartResult || {}).data || {}).cart
    if (shopifyCart) return shopifyCart

    this.logger.error({ response: JSON.stringify(shopifyCartResult) }, 'Error fetching Shopify cart')
    throw new Error('Error loading cart contents')
  }

  async addCartLines (cartId, lines) {
    return this._request(addCartLines, { cartId, lines })
  }

  /**
   * @param {string} query
   * @param {object} variables
   * @param {number} retryCount
   * @returns {Promise<object>}
   * @private
   */
  async _request (query, variables = {}, retryCount = 0) {
    if (!this.storefrontApiAccessToken) {
      this.storefrontApiAccessToken = await this.tokenManager.getStorefrontApiAccessToken()
    }

    try {
      return await request({
        method: 'post',
        uri: this.apiUrl,
        headers: {'x-shopify-storefront-access-token': this.storefrontApiAccessToken},
        body: {query, variables},
        json: true
      })
    } catch (err) {
      if ((err.statusCode === 401 || err.statusCode === 403) && retryCount === 0) {
        // try a new access token
        this.storefrontApiAccessToken = await this.tokenManager.getStorefrontApiAccessToken(false)
        return this._request(query, variables, retryCount + 1)
      }

      throw err
    }
  }
}

module.exports = ShopifyStorefrontApi
