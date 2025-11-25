/**
 * @param {ExtensionConfig} config
 */
function getBaseUrl (config) {
  const url = config.shopifyShopDomain || 'https://' + config.shopifyShopAlias + '.myshopify.com'
  return url.replace(/\/$/, '')
}

module.exports = {
  getBaseUrl
}
