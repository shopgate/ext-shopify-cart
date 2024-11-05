const request = require('request-promise-native')
const UnknownError = require('../models/Errors/UnknownError')

class ShopifyAdminApi {
  /**
   * @param {string} shopUrl
   * @param {string} accessToken
   * @param {SDKContextLog} logger
   * @param {string?} apiVersion
   */
  constructor (shopUrl, accessToken, logger, apiVersion = '2024-07') {
    this.apiUrl = new URL(`/admin/api/${apiVersion}/`, shopUrl).toString()
    this.accessToken = accessToken
    this.logger = logger
  }

  /**
   * @param {string} title The title that identifies the token at Shopify.
   * @returns {Promise<string>} The storefront access token.
   * @throws {Error} If the API returns an invalid response or an error occurs on the request.
   */
  async getStoreFrontAccessToken (title) {
    const endpoint = 'storefront_access_tokens.json'
    const response = await this.request('get', endpoint)

    if (!Object.hasOwnProperty.call(response, 'storefront_access_tokens')) {
      this.logger.error({ response: JSON.stringify(response) }, 'Error fetching common Storefront API access token')
      throw new UnknownError()
    }

    const token = response.storefront_access_tokens.find(token => token.title === title)
    if (typeof token !== 'undefined') {
      return token.access_token
    }

    // create a new access token, because no valid token was found at this point
    const createTokenResult = await this.request('post', endpoint, '', { storefront_access_token: { title } })
    const newToken = ((createTokenResult || {}).storefront_access_token || {}).access_token

    if (!newToken) {
      this.logger.error({ response: JSON.stringify(createTokenResult) }, 'Error creating a new common Storefront API access token')
      throw new UnknownError()
    }

    return newToken
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {string} query
   * @param {Object} data
   * @returns {Promise<object>} The JSON decoded response body.
   * @throws when request fails or response is empty
   */
  async request (method, endpoint, query = '', data = {}) {
    const options = {
      uri: `${this.apiUrl}${endpoint.replace(/^\/+/, '')}${!query ? '' : '?' + query}`,
      method: method.toLowerCase() || 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      simple: false,
      resolveWithFullResponse: true
    }

    if (data && Object.keys(data).length) {
      options.body = JSON.stringify(data)
    }

    if (this.accessToken) {
      options.headers['X-Shopify-Access-Token'] = this.accessToken
    }

    let response
    try {
      response = await request({ ...options, time: true })
    } catch (err) {
      this.logger.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Request failed')
      throw new UnknownError()
    }

    if (response.body.trim() === '') throw new Error('Empty response body.')

    const body = JSON.parse(response.body)

    if (response.statusCode >= 400) {
      this.logger.error({ response: JSON.stringify(response.body), statusCode: response.statusCode }, 'HTTP >= 400 received')
      throw new UnknownError()
    }

    return body
  }
}

module.exports = ShopifyAdminApi
