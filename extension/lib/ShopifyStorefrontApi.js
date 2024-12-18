const request = require('request-promise-native')

const queries = require('./queries/index')
const CartError = require("../models/Errors/CartError");

class ShopifyStorefrontApi {
  /**
   * @param {string} shopUrl
   * @param {string} buyerIp
   * @param {ShopifyApiTokenManager} tokenManager
   * @param {SDKContextLog} logger A generic logger instance, e.g. current step context's .log property.
   * @param {string?} apiVersion
   */
  constructor(shopUrl, buyerIp, tokenManager, logger, apiVersion = '2024-07') {
    this.apiUrl = new URL(`/api/${apiVersion}/graphql.json`, shopUrl).toString()
    this.buyerIp = buyerIp
    this.tokenManager = tokenManager
    this.logger = logger
    this.storefrontApiAccessToken = null

    if (!buyerIp) logger.warn('No buyer IP passed')
  }

  /**
   * @param {string} customerStorefrontApiAccessToken
   * @returns {Promise<string>}
   */
  async createCartForCustomer (customerStorefrontApiAccessToken) {
    const createCartResult = await this._request(
      queries.createCartForCustomer,
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
      createCartResult = await this._request(queries.createCart)
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
   * @returns {Promise<ShopifyCart|null>} null if the cart was not found
   */
  async getCart (cartId) {
    const shopifyCartResult = await this._request(queries.getCart, { cartId })

    const shopifyCart = ((shopifyCartResult || {}).data || {}).cart

    // not found, expected after checkout
    if (shopifyCart === null) return null

    if (!shopifyCart) {
      this.logger.error({response: JSON.stringify(shopifyCartResult)}, 'Error fetching Shopify cart')
      throw new Error('Error loading cart contents')
    }

    return this._convertShopifyAmountsToNumbers(shopifyCart)
  }

  async addCartLines (cartId, lines) {
    const response = await this._request(queries.addCartLines, {cartId, lines})

    this._handleCartUserErrors(response, 'cartLinesAdd', lines)

    return response
  }

  async updateCartLines (cartId, lines) {
    const response = await this._request(queries.updateCartLines, { cartId, lines })

    this._handleCartUserErrors(response, 'cartLinesUpdate', lines)

    return response
  }

  async deleteCartLines (cartId, lineIds){
    const response = await this._request(queries.deleteCartLines, { cartId, lineIds })

    this._handleCartUserErrors(response, 'cartLinesRemove', lineIds)

    return response
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

    const headers = { 'x-shopify-storefront-access-token': this.storefrontApiAccessToken }
    if (this.buyerIp) headers['Shopify-Storefront-Buyer-IP'] = this.buyerIp

    try {
      return await request({
        method: 'post',
        uri: this.apiUrl,
        headers,
        body: { query, variables },
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

  /**
   * @param {{ data: { [queryName: string]: { userErrors: { field: string[], message: string }[] } } }} response
   * @param {string} queryName
   * @param {{ merchandiseId: string }[]} referencedContents
   * @throws CartError
   * @private
   */
  _handleCartUserErrors (response, queryName, referencedContents) {
    const userErrors = (((response || {}).data || {})[queryName] || {}).userErrors || []
    if (userErrors.length === 0) return

    const error = new CartError()
    for (const userError of userErrors) {
      const fieldIndex = (userError.field || {})[1]
      const entityId = fieldIndex || fieldIndex === 0
        ? (referencedContents[userError.field[1]] || {}).merchandiseId
        : undefined

      error.errors.push({ message: userError.message, entityId })
    }

    if (error.errors.length > 0) throw error
  }

  /**
   * Recursively applies parseFloat on any property named "amount" in the object passed and returns the converted object.
   *
   * @param {object} obj
   * @returns object
   * @private
   */
  _convertShopifyAmountsToNumbers (obj) {
    return Object.entries(obj).reduce((convertedObject, [key, value]) => {
      if (key === 'amount' && typeof value === 'string') {
        convertedObject[key] = parseFloat(value)
        return convertedObject
      }

      if (Array.isArray(value)) {
        convertedObject[key] = value.map(entry => {
          // note: arrays in arrays not supported, haven't seen this in the API so far
          return (typeof entry === 'object') ? this._convertShopifyAmountsToNumbers(entry) : entry
        })
      } else if (typeof value === 'object' && value !== null) {
        convertedObject[key] = this._convertShopifyAmountsToNumbers(value)
      } else {
        convertedObject[key] = value
      }

      return convertedObject
    }, {})
  }
}

module.exports = ShopifyStorefrontApi
