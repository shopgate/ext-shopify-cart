module.exports = class ShopifyApiTokenManager {
  /**
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {ShopifyAdminApi} adminApi
   * @param {SDKContextLog} logger
   */
  constructor (extensionStorage, adminApi, logger) {
    this.extensionStorage = extensionStorage
    this.adminApi = adminApi
    this.log = logger
  }

  /**
   * Gets the COMMON Storefront API access token for app access from either extension storage or Admin REST API.
   *
   * @param {boolean?} useCache
   * @param {string?} accessTokenTitle The title of the access token to be fetched from the Admin REST API.
   * @returns {Promise<string>}
   */
  async getStorefrontApiAccessToken (useCache = true, accessTokenTitle = 'Web Checkout Storefront Access Token') {
    let token

    if (useCache) token = await this.extensionStorage.get('storefrontAccessToken')

    if (!token) {
      token = await this.adminApi.getStoreFrontAccessToken(accessTokenTitle)
      await this.setStorefrontApiAccessToken(token)
    }

    return token
  }

  /**
   * Saves the COMMON Storefront API access token for app access to the extension storage
   *
   * @param {string} storefrontAccessToken
   * @returns {Promise<void>}
   */
  async setStorefrontApiAccessToken (storefrontAccessToken) {
    await this.extensionStorage.set('storefrontAccessToken', storefrontAccessToken)
  }
}
