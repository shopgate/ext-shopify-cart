const request = require('request-promise-native')

const queries = require('./queries/index')
const CartError = require("../models/Errors/CartError");

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

    // All "amount" fields are of type "Decimal", which are "numeric strings". Converting to "number" to pass frontend validations.
    shopifyCart.cost = Object.entries(shopifyCart.cost).reduce((cost, [priceType, moneyObject]) => {
      if (!moneyObject) return cost

      return {
        ...cost,
        [priceType]: { ...moneyObject, amount: parseFloat(moneyObject.amount) }
      }
    }, {})

    shopifyCart.lines.edges = shopifyCart.lines.edges.map(edge => ({
      node: {
        ...edge.node,
        cost: Object.entries(edge.node.cost).reduce((cost, [priceType, moneyObject]) => {
          if (!moneyObject) return cost

          return { ...cost, [priceType]: { ...moneyObject, amount: parseFloat(moneyObject.amount) } }
        }, {})
      },
    }))

    shopifyCart.deliveryGroups.edges = shopifyCart.deliveryGroups.edges.map(edge => ({
      node: {
        ...edge.node,
        selectedDeliveryOption: {
          ...edge.node.selectedDeliveryOption,
          estimatedCost: {
            ...edge.node.selectedDeliveryOption.estimatedCost,
            amount: parseFloat(edge.node.selectedDeliveryOption.estimatedCost.amount) || 0
          },
        }
      }
    }))

    return shopifyCart
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

    try {
      return await request({
        method: 'post',
        uri: this.apiUrl,
        headers: { 'x-shopify-storefront-access-token': this.storefrontApiAccessToken },
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
   * @param {object} response
   * @param {string} queryName
   * @param {array} referencedContents
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

      error.errors.push({
        message: userError.message,
        entityId
      })
    }

    if (error.errors.length > 0) throw error
  }
}

module.exports = ShopifyStorefrontApi
