const ShopifyRequest = require('./shopify.request')
const ConfigHelper = require('../helper/config')

class ShopifyApi {
  constructor (config, log) {
    this.config = config
    this.log = log
    this.shopifyApiRequest = new ShopifyRequest(
      {
        shop: config.shopifyShopAlias + '.myshopify.com',
        shopify_api_key: null, // not required
        access_token: config.shopifyAccessToken, // not required
        verbose: false
      },
      log
    )
  }

  async getStorefrontAccessToken () {
    const endpoint = '/admin/api/2023-10/storefront_access_tokens.json'
    const response = await this.shopifyApiRequest.get(endpoint, {})
    const storefrontAccessTokenTitle = 'Web Checkout Storefront Access Token'

    if (response.storefront_access_tokens) {
      const token = response.storefront_access_tokens.find((token) => {
        return token.title === storefrontAccessTokenTitle
      })
      if (token && token.access_token) return token.access_token
    }

    const requestBody = {
      'storefront_access_token': {
        'title': storefrontAccessTokenTitle
      }
    }

    return this.post(endpoint, requestBody)
  }

  async createCheckout () {
    return this.post('/admin/api/2023-10/checkouts.json', {})
  }

  async getCheckout (checkoutToken) {
    return this.get(`/admin/api/2023-10/checkouts/${checkoutToken}.json`, {})
  }

  async setCheckoutProducts (checkoutToken, productList) {
    const data = {
      'checkout': {
        'line_items': productList
      }
    }

    return this.put(`/admin/api/2023-10/checkouts/${checkoutToken}.json`, data)
  }

  async setCheckoutDiscount (checkoutToken, discountCode) {
    const data = {
      'checkout': {
        'discount_code': discountCode
      }
    }

    return this.put(`/admin/api/2023-10/checkouts/${checkoutToken}.json`, data)
  }

  /**
   * @param {string} customersId
   */
  async getCustomerById (customersId) {
    const userData = await this.get(`/admin/api/2023-10/customers/${customersId}.json`, {})
    if (!userData.customer) throw new Error('Customer not found')

    return userData.customer
  }

  /**
   * @param {string} email
   */
  async findUserByEmail (email) {
    const userData = await this.get(`/admin/api/2023-10/customers/search.json?query=${email}`, {})
    if (!userData.customers) throw new Error('No customers not found')

    return userData.customers
  }

  /**
   * @param {string} endpoint
   * @param {Object} params
   */
  async put (endpoint, params) {
    return this.shopifyApiRequest.put(endpoint, params)
  }

  /**
   * @param {string} endpoint
   * @param {Object} params
   */
  async get (endpoint, params) {
    return this.shopifyApiRequest.get(endpoint, params)
  }

  /**
   * @param {string} endpoint
   * @param {Object} params
   */
  async post (endpoint, params) {
    return this.shopifyApiRequest.post(endpoint, params)
  }

  /**
   * @param {string} endpoint
   * @param {Object} params
   */
  async delete (endpoint, params) {
    return this.shopifyApiRequest.delete(endpoint, params)
  }
}

module.exports = ShopifyApi
