module.exports = class ShopifyApiTokenManager {
  /**
   * @param {SDKContextEntityStorage} extensionStorage
   * @param {ShopifyAdminApi} adminApi
   * @param {SDKContextLog} logger
   * @param {string} headlessStorefrontAccessToken
   */
  constructor (extensionStorage, adminApi, logger, headlessStorefrontAccessToken) {
    this.extensionStorage = extensionStorage
    this.adminApi = adminApi
    this.log = logger
    this.headlessStorefrontAccessToken = headlessStorefrontAccessToken
  }

  /**
   * Gets the COMMON Storefront API access token for app access from either extension storage or Admin REST API.
   *
   * @param {boolean?} useCache
   * @param {string?} accessTokenTitle The title of the access token to be fetched from the Admin REST API.
   * @returns {Promise<string>}
   */
  async getStorefrontApiAccessToken (useCache = true, accessTokenTitle = 'Web Checkout Storefront Access Token') {
    // if a headless Storefront API access token is configured, always use that
    if (this.headlessStorefrontAccessToken) return this.headlessStorefrontAccessToken

    let token

    if (useCache) token = await this.extensionStorage.get('storefrontAccessToken')

    if (!token) {
      token = await this.adminApi.getStoreFrontAccessToken(accessTokenTitle)
      await this.extensionStorage.set('storefrontAccessToken', token)
    }

    return token
  }
}
