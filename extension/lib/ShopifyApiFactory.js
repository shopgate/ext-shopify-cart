const ConfigHelper = require('../helper/config')
const ShopifyStorefrontApi = require('./ShopifyStorefrontApi')

class ShopifyApiFactory {
  /**
   * @param {SDKContext} context
   * @param {SgxsMeta} sgxsMeta
   * @returns {ShopifyStorefrontApi}
   */
  static buildStorefrontApi (context, sgxsMeta) {
    const { deviceIp } = sgxsMeta || {}

    return new ShopifyStorefrontApi(ConfigHelper.getBaseUrl(context.config), deviceIp, context.config.shopifyHeadlessStorefrontAccessToken, context.log)
  }
}

module.exports = ShopifyApiFactory
