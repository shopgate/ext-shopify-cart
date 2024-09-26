const ConfigHelper = require('../helper/config')
const ShopifyApiTokenManager = require('./ShopifyApiTokenManager')
const ShopifyAdminApi = require('./ShopifyAdminApi')
const ShopifyStorefrontApi = require('./ShopifyStorefrontApi')

let storefrontApi

class ShopifyApiFactory {
  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @returns {ShopifyAdminApi}
   */
  static buildAdminApi (context) {
    return new ShopifyAdminApi(
      ConfigHelper.getBaseUrl(context.config),
      context.config.shopifyAccessToken,
      context.log
    )
  }

  /**
   * @param {SDKContext} context
   * @param {ShopifyApiTokenManager?} tokenManager
   * @param {ShopifyAdminApi?} adminApi
   * @returns {Promise<ShopifyStorefrontApi>}
   */
  static async buildStorefrontApi (context, tokenManager = null, adminApi = null) {
    if (storefrontApi) return storefrontApi

    if (!tokenManager) tokenManager = this.buildShopifyApiTokenManager(context, adminApi)

    return new ShopifyStorefrontApi(ConfigHelper.getBaseUrl(context.config), tokenManager, context.log)
  }

  /**
   * @param {SDKContext} context The Shopgate Connect step context.
   * @param {ShopifyAdminApi?} adminApi
   * @returns {ShopifyApiTokenManager}
   */
  static buildShopifyApiTokenManager (context, adminApi = null) {
    if (!adminApi) adminApi = this.buildAdminApi(context)

    return new ShopifyApiTokenManager(
      context.storage.extension,
      adminApi,
      context.log
    )
  }
}

module.exports = ShopifyApiFactory
