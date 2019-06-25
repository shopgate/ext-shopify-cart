/**
 * @param {ExtensionConfig} config
 */
function getBaseUrl(config) {
  const url = config.shopifyShopDomain || 'https://' + config.shopifyShopAlias + '.myshopify.com'
  return url.replace(/\/$/, '')
}

/**
 * @param {ExtensionConfig} config
 * @returns {string}
 */
function getHostName(config) {
  return getBaseUrl(config).replace(/(^\w+:|^)\/\//, '')
}

module.exports = {
  getBaseUrl,
  getHostName
}
